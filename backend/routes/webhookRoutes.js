const express = require("express");
const Stripe = require("stripe");
const dotenv = require("dotenv");
const Order = require("../models/Order");

dotenv.config();
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

// ✅ Exporter le gestionnaire directement
const handleWebhook = async (req, res) => {
    console.log("🎯 Webhook reçu");
    const sig = req.headers["stripe-signature"];
    console.log("🔑 Signature:", sig);

    let event;

    try {
        event = stripe.webhooks.constructEvent(
            req.body, 
            sig, 
            process.env.STRIPE_WEBHOOK_SECRET
        );
        console.log("✅ Événement construit:", event.type);

        if (event.type === "checkout.session.completed") {
            const session = event.data.object;
            console.log("💳 Session complétée:", session.id);

            const order = await Order.findOne({ stripeSessionId: session.id });
            if (order) {
                console.log("📦 Commande avant mise à jour:", order);
                order.status = "paid";
                await order.save();
                console.log("✅ Commande après mise à jour:", order);
            } else {
                console.log("❌ Commande non trouvée pour la session:", session.id);
            }
        }

        res.json({ received: true });
    } catch (err) {
        console.error("❌ Erreur webhook:", err);
        return res.status(400).json({ error: err.message });
    }
};

module.exports = { handleWebhook };