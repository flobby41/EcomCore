const express = require("express");
const Stripe = require("stripe");
const dotenv = require("dotenv");
const Order = require("../models/Order");

dotenv.config();
const router = express.Router();
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

router.post("/", async (req, res) => {
  try {
      const { cart, customerEmail } = req.body;

      console.log("📩 Données reçues dans /checkout :", req.body); // Debug

      const lineItems = cart.map((item) => ({
          price_data: {
              currency: "eur",
              product_data: {
                  name: item.name,
                  images: [item.image],
              },
              unit_amount: Math.round(item.price * 100),
          },
          quantity: item.quantity,
      }));

      const session = await stripe.checkout.sessions.create({
          payment_method_types: ["card"],
          line_items: lineItems,
          mode: "payment",
          success_url: "http://localhost:3000/success",
          cancel_url: "http://localhost:3000/cart",
          customer_email: customerEmail,
      });

      console.log("✅ Session Stripe créée :", session.id);

      // Enregistrer la commande en "pending"
      const newOrder = new Order({
          stripeSessionId: session.id, // Vérifier cet ID
          customerEmail: customerEmail,
          totalAmount: session.amount_total / 100,
          status: "pending",
          products: cart.map((item) => ({
              name: item.name,
              price: item.price,
              quantity: item.quantity,
              image: item.image
          }))
      });

      await newOrder.save();
      console.log("✅ Commande enregistrée avec stripeSessionId :", newOrder.stripeSessionId);

      res.json({ id: session.id, url: session.url });

  } catch (error) {
      console.error("Erreur Stripe :", error);
      res.status(500).json({ message: "Erreur Stripe", error: error.message });
  }
});

module.exports = router;