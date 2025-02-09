const express = require("express");
const Order = require("../models/Order");
const authMiddleware = require("../middleware/authMiddleware"); // Ajout du middleware
const router = express.Router();

// Route protégée pour récupérer les commandes du user connecté
router.get("/", authMiddleware, async (req, res) => {
    try {
        console.log("👤 Recherche des commandes pour email:", req.user.email);
        
        // Recherche par email au lieu de userId
        const orders = await Order.find({ 
            customerEmail: req.user.email,
            status: "paid" 
        });
        
        console.log("🔍 Critères de recherche:", {
            customerEmail: req.user.email,
            status: "paid"
        });
        console.log("📦 Commandes filtrées trouvées:", orders);

        res.json(orders);

    } catch (error) {
        console.error("❌ Erreur:", error);
        res.status(500).json({ message: "Erreur serveur" });
    }
});

// Ajouter cette route dans orderRoutes.js
router.get("/verify-payment", authMiddleware, async (req, res) => {
    try {
        const { session_id } = req.query;
        console.log("🔍 Vérification paiement pour session:", session_id);

        const order = await Order.findOne({ stripeSessionId: session_id });
        console.log("📦 Commande trouvée:", order);

        if (!order) {
            console.log("❌ Aucune commande trouvée");
            return res.status(404).json({ status: 'not_found' });
        }

        console.log("✅ Statut de la commande:", order.status);
        res.json({ status: order.status });
    } catch (error) {
        console.error("❌ Erreur:", error);
        res.status(500).json({ status: 'error' });
    }
});

module.exports = router;