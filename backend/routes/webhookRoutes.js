const express = require("express");
const Stripe = require("stripe");
const dotenv = require("dotenv");
const Order = require("../models/Order");

dotenv.config();
const router = express.Router();
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

// ➤ Webhook Stripe (écoute les paiements)
router.post("/", express.raw({ type: "application/json" }), async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
      event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
      console.error("❌ Erreur Webhook :", err);
      return res.status(400).json({ message: "Webhook signature error", error: err.message });
  }

  console.log("✅ Webhook Stripe reçu :", event.type);
  console.log("📩 Données envoyées par Stripe :", JSON.stringify(event, null, 2));
  

  if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      console.log("🔍 Session ID reçu dans webhook:", session.id);

      const order = await Order.findOne({ stripeSessionId: session.id });
      console.log("🔍 Recherche commande avec stripeSessionId:", session.id);
      console.log("📦 Commande trouvée:", order);

      if (order) {
          order.status = "paid";
          await order.save();
          console.log("✅ Commande mise à jour comme payée:", order._id);
      } else {
          console.error("❌ Commande non trouvée pour session:", session.id);
      }
  }

  res.json({ received: true });
});

module.exports = router;