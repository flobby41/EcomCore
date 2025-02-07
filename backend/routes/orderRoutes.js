const express = require("express");
const Order = require("../models/Order");
const authMiddleware = require("../middleware/authMiddleware"); // Ajout du middleware
const router = express.Router();

// Route protégée pour récupérer les commandes du user connecté
router.get("/", authMiddleware, async (req, res) => {
    try {
        const orders = await Order.find({ userId: req.user.userId, status: "paid" });

        res.json(orders);
    } catch (error) {
        console.error("Erreur lors de la récupération des commandes :", error);
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