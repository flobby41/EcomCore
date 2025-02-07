const express = require("express");
const Stripe = require("stripe");
const dotenv = require("dotenv");
const Order = require("../models/Order");
const authMiddleware = require("../middleware/authMiddleware"); // Ajout du middleware

dotenv.config();
const router = express.Router();
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

router.post("/", authMiddleware, async (req, res) => {
  try {
      const { cart } = req.body;

      console.log("📩 Données reçues dans /checkout :", cart);

      // Vérification si le panier est vide
      if (!cart || cart.length === 0) {
          return res.status(400).json({ message: "Le panier est vide." });
      }

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
          success_url: "http://localhost:3001/success?session_id={CHECKOUT_SESSION_ID}",
          cancel_url: "http://localhost:3001/cart",
          customer_email: req.user.email, // Utilisation de l'email de l'utilisateur connecté
      });

      console.log("✅ Session Stripe créée :", session.id);

      // Calculer le montant total de la commande
      const totalAmount = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

      // Enregistrer la commande en "pending"
      const newOrder = new Order({
          userId: req.user.userId, // Lier la commande à l'utilisateur connecté
          stripeSessionId: session.id,
          customerEmail: req.user.email,
          totalAmount,
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