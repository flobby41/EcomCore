const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Order = require("../models/Order");
const adminAuthMiddleware = require("../middleware/adminAuthMiddleware"); // ✅ Import du middleware
const User = require('../models/User');
const Product = require('../models/Product');




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
    const { range } = req.query;
    const now = new Date();
    let startDate;

    switch (range) {
      case 'day':
        startDate = new Date(now.setDate(now.getDate() - 1));
        break;
      case 'week':
        startDate = new Date(now.setDate(now.getDate() - 7));
        break;
      case 'month':
        startDate = new Date(now.setMonth(now.getMonth() - 1));
        break;
      default:
        startDate = new Date(now.setDate(now.getDate() - 7));
    }

    // Récupérer les statistiques
    const [
      totalRevenue,
      totalOrders,
      newCustomers,
      recentOrders,
      lowStockProducts
    ] = await Promise.all([
      Order.aggregate([
        { $match: { createdAt: { $gte: startDate } } },
        { $group: { _id: null, total: { $sum: "$totalAmount" } } }
      ]),
      Order.countDocuments({ createdAt: { $gte: startDate } }),
      User.countDocuments({ createdAt: { $gte: startDate } }),
      Order.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('userId', 'email'),
      Product.find({ stock: { $lt: 10 } })
    ]);

    // Préparer les données pour les graphiques
    const salesData = await Order.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          amount: { $sum: "$totalAmount" }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      revenue: {
        total: totalRevenue[0]?.total || 0,
        trend: 12 // Calculer la tendance
      },
      orders: {
        total: totalOrders,
        trend: 5 // Calculer la tendance
      },
      customers: {
        total: newCustomers,
        trend: 8 // Calculer la tendance
      },
      salesChart: salesData.map(item => ({
        date: item._id,
        amount: item.amount
      })),
      recentOrders: recentOrders.map(order => ({
        id: order._id,
        customer: order.userId.email,
        amount: order.totalAmount,
        status: order.status
      })),
      alerts: [
        ...lowStockProducts.map(product => ({
          type: 'warning',
          message: `Stock faible pour ${product.name} (${product.stock} restants)`
        }))
      ]
    });

  } catch (error) {
    console.error('Erreur dashboard:', error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

module.exports = router; 