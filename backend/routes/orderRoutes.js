const express = require("express");
const Order = require("../models/Order");
const authMiddleware = require("../middleware/authMiddleware"); // Ajout du middleware
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Product = require("../models/Product");

// GET /api/orders - Récupérer les commandes de l'utilisateur
router.get('/', authMiddleware, async (req, res) => {
    try {
        console.log("🔍 Recherche des commandes pour userId:", req.user.id);
        
        const orders = await Order.find({ userId: req.user.id })
            .sort({ createdAt: -1 }); // Plus récentes d'abord
        
        console.log(`📦 ${orders.length} commandes trouvées`);
        
        if (orders.length === 0) {
            console.log("❌ Aucune commande trouvée pour cet utilisateur");
        }

        res.json(orders);
    } catch (error) {
        console.error("❌ Erreur lors de la récupération des commandes:", error);
        res.status(500).json({ message: "Erreur lors de la récupération des commandes" });
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

// Route pour les commandes invités
router.post("/guest", async (req, res) => {
    try {
        const { email, products, totalAmount } = req.body;
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3001';

        // Créer la session Stripe
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: products.map(product => ({
                price_data: {
                    currency: 'eur',
                    product_data: {
                        name: product.name,
                    },
                    unit_amount: Math.round(product.price * 100),
                },
                quantity: product.quantity,
            })),
            mode: 'payment',
            success_url: `${frontendUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${frontendUrl}/cart`,
            customer_email: email,
        });

        // Créer la commande
        const order = new Order({
            customerEmail: email,
            items: products.map(p => ({
                productId: p._id,
                quantity: p.quantity,
                price: p.price
            })),
            totalAmount,
            stripeSessionId: session.id,
            status: 'pending'
        });

        await order.save();

        res.json({ url: session.url });

    } catch (error) {
        console.error('Erreur:', error);
        res.status(500).json({ 
            message: "Erreur lors de la création de la commande",
            error: error.message 
        });
    }
});

// ✅ Nouvelle route pour vérifier le paiement des invités (sans authentification)
router.get('/verify-guest-payment', async (req, res) => {
    try {
        const { session_id } = req.query;
        
        console.log("🔍 Vérification paiement invité - Session ID:", session_id);

        if (!session_id) {
            return res.status(400).json({ message: "Session ID manquant" });
        }

        const order = await Order.findOne({ 
            stripeSessionId: session_id,
            isGuestOrder: true // ✅ S'assurer que c'est bien une commande invité
        });

        console.log("📦 Commande trouvée:", order);

        if (!order) {
            return res.status(404).json({ message: "Commande non trouvée" });
        }

        res.json({ 
            status: order.status,
            orderId: order._id 
        });

    } catch (error) {
        console.error("❌ Erreur lors de la vérification du paiement invité:", error);
        res.status(500).json({ 
            message: "Erreur lors de la vérification du paiement",
            error: error.message 
        });
    }
});

// Créer une nouvelle commande
router.post("/", async (req, res) => {
    try {
        const { userId, email, items, totalAmount, shippingAddress, stripeSessionId, isGuestOrder } = req.body;
        
        // Enrichir les items avec les détails complets des produits
        const enrichedItems = await Promise.all(items.map(async (item) => {
            const product = await Product.findById(item.productId);
            if (!product) {
                throw new Error(`Product with ID ${item.productId} not found`);
            }
            
            return {
                productId: item.productId,
                product: {
                    name: product.name,
                    description: product.description,
                    price: product.price,
                    image: product.image,
                    category: product.category
                },
                quantity: item.quantity,
                price: item.price
            };
        }));
        
        const newOrder = new Order({
            userId,
            email,
            items: enrichedItems,
            totalAmount,
            shippingAddress,
            stripeSessionId,
            isGuestOrder
        });
        
        await newOrder.save();
        res.status(201).json(newOrder);
    } catch (error) {
        console.error("Error creating order:", error);
        res.status(500).json({ message: "Error creating order", error: error.message });
    }
});

module.exports = router;