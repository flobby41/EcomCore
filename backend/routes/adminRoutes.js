const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Order = require("../models/Order");
const adminAuthMiddleware = require("../middleware/adminAuthMiddleware"); // ✅ Import du middleware
const User = require('../models/User');
const Product = require('../models/Product');

// Middleware pour logger les requêtes
router.use((req, res, next) => {
  console.log('📝 Admin Request:', {
    method: req.method,
    path: req.path,
    query: req.query,
    headers: req.headers
  });
  next();
});

// /api/admin Login admin 

// 🚀 Nouvelle route pour récupérer TOUTES les commandes (ADMIN UNIQUEMENT)
router.get("/orders", adminAuthMiddleware, async (req, res) => {
  try {
      console.log("🔐 Accès admin - Récupération de toutes les commandes");
      const orders = await Order.find(); // Récupère toutes les commandes
      res.json(orders);
  } catch (error) {
      console.error("❌ Erreur serveur:", error);
      res.status(500).json({ message: "Erreur serveur" });
  }
});



router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    
    if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
        // ✅ Structure du token cohérente avec le middleware
        const token = jwt.sign(
            {
                isAdmin: true,
                email: email,
                // Pas besoin de userId car c'est un admin
            },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );
console.log('process.env.JWT_SECRET CHECK : ' , process.env.JWT_SECRET)
        console.log("✅ Token admin généré");
        res.json({ 
            token,
            message: "Connexion admin réussie" 
        });
    } else {
        console.log("❌ Tentative de connexion admin échouée");
        res.status(401).json({ message: 'Identifiants admin invalides' });
    }
});

router.get('/dashboard', async (req, res) => {
  try {
    console.log("🔍 Récupération des données du dashboard");
    const { range } = req.query;
    const now = new Date();
    let startDate = new Date();

    // Ajuster la date de début selon la période
    switch (range) {
      case 'day':
        startDate.setDate(now.getDate() - 1);
        break;
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        break;
      default:
        startDate.setDate(now.getDate() - 7);
    }

    // Récupération du chiffre d'affaires avec formatage des nombres
    const revenueData = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      {
        $addFields: {
          calculatedTotal: {
            $reduce: {
              input: "$items",
              initialValue: 0,
              in: { 
                $add: [
                  "$$value",
                  { $multiply: ["$$this.price", "$$this.quantity"] }
                ]
              }
            }
          }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$calculatedTotal" },
          count: { $sum: 1 }
        }
      }
    ]);

    // Données pour le graphique avec dates filtrées
    const salesChart = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      {
        $addFields: {
          calculatedTotal: {
            $reduce: {
              input: "$items",
              initialValue: 0,
              in: { 
                $add: ["$$value", { $multiply: ["$$this.price", "$$this.quantity"] }]
              }
            }
          }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: "%d/%m", date: "$createdAt" } },
          amount: { $sum: "$calculatedTotal" },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Commandes récentes avec ID courts et montants formatés
    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('userId', 'email')
      .lean();

    res.json({
      revenue: {
        // Arrondir à 2 décimales
        total: Math.round((revenueData[0]?.total || 0) * 100) / 100,
        trend: 0
      },
      orders: {
        total: revenueData[0]?.count || 0,
        trend: 0
      },
      customers: {
        total: await User.countDocuments({ createdAt: { $gte: startDate } }),
        trend: 0
      },
      salesChart: salesChart.map(item => ({
        date: item._id,
        // Arrondir les montants du graphique
        amount: Math.round(item.amount * 100) / 100,
        orders: item.count
      })),
      recentOrders: recentOrders.map(order => {
        // Mapping des status avec leurs couleurs
        const statusMap = {
          'paid': { text: 'paid', color: 'bg-green-100 text-green-800' },
          'pending': { text: 'pending', color: 'bg-yellow-100 text-yellow-800' },
          'cancelled': { text: 'cancelled', color: 'bg-red-100 text-red-800' },
          'delivered': { text: 'delivered', color: 'bg-green-100 text-green-800' },
          'shipped': { text: 'shipped', color: 'bg-blue-100 text-blue-800' }
        };

        return {
          id: order._id.toString().slice(-6),
          customer: order.userId?.email || 'Client inconnu',
          amount: Math.round(order.items.reduce((sum, item) => 
            sum + (item.price * item.quantity), 0) * 100) / 100,
          status: {
            text: statusMap[order.status]?.text || order.status,
            color: statusMap[order.status]?.color || 'bg-gray-100 text-gray-800'
          },
          date: new Date(order.createdAt).toLocaleDateString('fr-FR')
        };
      }),
      alerts: [
        // Stock faible
        ...(await Product.find({ stock: { $lt: 10 } })).map(product => ({
          type: 'warning',
          message: `Stock faible : ${product.name} (${product.stock} restants)`
        })),
        // Commandes en attente
        ...(await Order.countDocuments({ status: 'pending' }) > 0 ? [{
          type: 'info',
          message: `${await Order.countDocuments({ status: 'pending' })} commandes en attente de traitement`
        }] : []),
        // Commandes annulées récentes
        ...(await Order.countDocuments({ 
          status: 'cancelled',
          createdAt: { $gte: new Date(Date.now() - 24*60*60*1000) }
        }) > 0 ? [{
          type: 'error',
          message: `${await Order.countDocuments({ 
            status: 'cancelled',
            createdAt: { $gte: new Date(Date.now() - 24*60*60*1000) }
          })} commandes annulées aujourd'hui`
        }] : [])
      ]
    });

  } catch (error) {
    console.error('❌ Erreur dashboard:', error);
    res.status(500).json({ 
      message: "Erreur serveur",
      details: error.message 
    });
  }
});

module.exports = router; 