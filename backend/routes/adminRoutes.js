const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Order = require("../models/Order");
const adminAuthMiddleware = require("../middleware/adminAuthMiddleware"); // ✅ Import du middleware




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



module.exports = router; 