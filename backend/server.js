// backend/server.js
const express = require("express");
const cors = require("cors");
const shopifyRoutes = require("./routes/shopifyRoutes");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const productRoutes = require("./routes/productRoutes");
const checkoutRoutes = require("./routes/checkoutRoutes");
const { handleWebhook } = require("./routes/webhookRoutes");
const orderRoutes = require("./routes/orderRoutes");
const adminRoutes = require("./routes/adminRoutes");
const authRoutes = require("./routes/authRoutes").router;
const userRoutes = require('./routes/userRoutes');


dotenv.config();

const app = express();

// ⚠️ Important : Configuration CORS avant les routes mais après l'initialisation de l'app
app.use(cors({
    origin: 'http://localhost:3001',
    credentials: true,
}));

// ⚠️ Route webhook AVANT express.json() pour recevoir les données brutes
app.post("/api/webhook", express.raw({ type: 'application/json' }), handleWebhook);

// Middleware express.json() APRÈS la route webhook
app.use(express.json());

// Routes API
app.use("/api/auth", authRoutes);
app.use("/api/shopify", shopifyRoutes);
app.use("/api/products", productRoutes);
app.use("/api/checkout", checkoutRoutes);
app.use("/api/orders", orderRoutes);
app.use('/api/cart', require('./routes/cartRoutes'));
app.use('/api/admin', adminRoutes);
app.use('/api/admin', userRoutes);
// Connexion à MongoDB Atlas avec Mongoose
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log("✅ MongoDB Atlas connecté"))
.catch(err => console.error("❌ Erreur de connexion MongoDB :", err));

app.get("/", (req, res) => {
  res.send("API e-commerce en cours...");
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`🚀 Serveur lancé sur le port ${PORT}`));