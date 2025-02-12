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

// ✅ Nouvelle route pour la création de session invité
router.post('/create-guest-session', async (req, res) => {
    try {
        const { items, email } = req.body;

        if (!items || !items.length) {
            return res.status(400).json({ message: "Le panier est vide" });
        }

        // Créer la commande pour l'invité
        const order = new Order({
            email,
            items: items.map(item => ({
                productId: item._id,
                quantity: item.quantity,
                price: item.price
            })),
            status: 'pending',
            isGuestOrder: true // ✅ Marquer comme commande invité
        });

        // Créer les line_items pour Stripe
        const line_items = items.map(item => ({
            price_data: {
                currency: 'eur',
                product_data: {
                    name: item.name,
                    images: [item.image]
                },
                unit_amount: Math.round(item.price * 100),
            },
            quantity: item.quantity,
        }));

        // Créer la session Stripe
        const session = await stripe.checkout.sessions.create({
            line_items,
            mode: 'payment',
            success_url: req.body.success_url,
            cancel_url: req.body.cancel_url,
            customer_email: email, // ✅ Pré-remplir l'email
        });

        // Mettre à jour la commande avec l'ID de session Stripe
        order.stripeSessionId = session.id;
        await order.save();

        res.json({ url: session.url });
    } catch (error) {
        console.error("❌ Erreur création session invité:", error);
        res.status(500).json({ 
            message: "Erreur lors de la création de la session",
            error: error.message 
        });
    }
});

module.exports = router;