// backend/server.js
const express = require("express");
const cors = require("cors");
const shopifyRoutes = require("./routes/shopifyRoutes");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const productRoutes = require("./routes/productRoutes");
const checkoutRoutes = require("./routes/checkoutRoutes");
const webhookRoutes = require("./routes/webhookRoutes");
const orderRoutes = require("./routes/orderRoutes");
const authRoutes = require("./routes/authRoutes").router;



dotenv.config();

const app = express();
app.use("/api/webhook", webhookRoutes);

// Configuration CORS
app.use(cors({
    origin: 'http://localhost:3001', // URL de votre frontend
    credentials: true, // Pour permettre l'envoi de cookies
}));

app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/shopify", shopifyRoutes);
app.use("/api/products", productRoutes);
app.use("/api/checkout", checkoutRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/auth", authRoutes);

// Connexion à MongoDB Atlas avec Mongoose
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log("✅ MongoDB Atlas connecté"))
.catch(err => console.error("❌ Erreur de connexion MongoDB :", err));

app.get("/", (req, res) => {
  res.send("API e-commerce en cours...");
});




const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`🚀 Serveur lancé sur le port ${PORT}`));