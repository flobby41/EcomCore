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
        const { items, email, shippingAddress } = req.body;

        if (!items || !items.length) {
            return res.status(400).json({ message: "Your cart is empty" });
        }

        // Calculer le montant total
        const totalAmount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

        // Créer la commande pour l'invité avec tous les champs requis
        const order = new Order({
            email,
            totalAmount,
            items: items.map(item => ({
                productId: item._id,
                quantity: item.quantity,
                price: item.price,
                product: {
                    name: item.name,
                    description: item.description || "No description available",
                    price: item.price,
                    image: item.image || "https://via.placeholder.com/150",
                    category: item.category || "Uncategorized"
                }
            })),
            status: 'pending',
            isGuestOrder: true,
            // Utiliser l'adresse fournie par l'utilisateur
            shippingAddress: shippingAddress || {
                street: "To be provided",
                city: "To be provided",
                state: "To be provided",
                zipCode: "00000",
                country: "To be provided"
            }
        });

        // Créer les line_items pour Stripe
        const line_items = items.map(item => ({
            price_data: {
                currency: 'eur',
                product_data: {
                    name: item.name,
                    images: [item.image].filter(Boolean)
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
            customer_email: email,
            shipping_address_collection: {
                allowed_countries: ['FR', 'US', 'CA', 'GB', 'DE', 'IT', 'ES']
            },
            metadata: {
                orderId: order._id.toString()
            }
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

// ✅ Route pour créer une session de paiement pour utilisateur connecté
router.post('/create-session', authMiddleware, async (req, res) => {
    try {
        console.log("📦 Requête reçue - Body:", req.body);
        console.log("👤 Utilisateur:", req.user);

        const { items } = req.body;
        
        if (!items || items.length === 0) {
            console.log("❌ Panier vide");
            return res.status(400).json({ message: "Le panier est vide" });
        }

        // Récupérer l'utilisateur complet depuis la base de données
        const User = require('../models/User');
        const user = await User.findById(req.user.id);
        
        if (!user) {
            return res.status(404).json({ message: "Utilisateur non trouvé" });
        }

        // Créer la commande avec l'email de l'utilisateur
        const order = new Order({
            userId: req.user.id,
            email: user.email, // ✅ Ajout de l'email
            items: items.map(item => ({
                productId: item._id,
                quantity: item.quantity,
                price: item.price
            })),
            status: 'pending'
        });

        console.log("📝 Commande créée:", order);

        // Créer les line_items pour Stripe
        const line_items = items.map(item => ({
            price_data: {
                currency: 'eur',
                product_data: {
                    name: item.name || 'Produit',
                    images: [item.image].filter(Boolean)
                },
                unit_amount: Math.round(item.price * 100),
            },
            quantity: item.quantity,
        }));

        console.log("💳 Line items pour Stripe:", line_items);

        // Créer la session Stripe
        const session = await stripe.checkout.sessions.create({
            line_items,
            mode: 'payment',
            success_url: req.body.success_url,
            cancel_url: req.body.cancel_url,
            client_reference_id: req.user.id,
            metadata: {
                orderId: order._id.toString()
            }
        });

        // Sauvegarder l'ID de session Stripe
        order.stripeSessionId = session.id;
        await order.save();

        console.log("✅ Session créée:", session.id);
        
        res.json({ url: session.url });
    } catch (error) {
        console.error("❌ Erreur détaillée:", error);
        res.status(500).json({ 
            message: "Erreur lors de la création de la session",
            error: error.message,
            stack: error.stack
        });
    }
});

module.exports = router;