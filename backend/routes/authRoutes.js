const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const router = express.Router();

// Inscription (Register)
router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;

  // ✅ Vérification stricte de l'email avec une regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Ex: test@example.com
  if (!emailRegex.test(email) || email.length < 6) {
      return res.status(400).json({ message: "Email invalide. Veuillez entrer un email valide." });
  }

  try {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
          return res.status(400).json({ message: "Cet email est déjà utilisé." });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = new User({ name, email: email.toLowerCase(), password: hashedPassword });
      await newUser.save();

      const token = jwt.sign({ userId: newUser._id, email: newUser.email }, process.env.JWT_SECRET, {
          expiresIn: "7d",
      });
console.log('le token a bien été crée lors de l enregistrement : ', token)
      res.status(201).json({ message: "Utilisateur créé avec succès", token });
  } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Erreur serveur" });
  }
});

// Connexion (Login)
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  
  try {
      console.log("⏳ Tentative de connexion avec :", email);
      
      const user = await User.findOne({ email });
      if (!user) {
          console.log("❌ Aucun utilisateur trouvé avec cet email.");
          return res.status(400).json({ message: "Invalid credentials" });
      }

      console.log("✅ Utilisateur trouvé :", user.email);
      console.log("Mot de passe entré :", password);
      console.log("Mot de passe stocké en base :", user.password);
      
      const isMatch = await bcrypt.compare(password, user.password);
      console.log("Résultat de bcrypt.compare():", isMatch);

      if (!isMatch) {
          console.log("❌ Mot de passe incorrect.");
          return res.status(400).json({ message: "Invalid credentials" });
      }

      console.log("✅ Connexion réussie !");
      res.status(200).json({ message: "Login successful", user });

  } catch (err) {
      console.error("❌ Erreur serveur :", err);
      res.status(500).json({ message: "Server error" });
  }
});

// Middleware pour protéger les routes
const authMiddleware = (req, res, next) => {
    const token = req.header("Authorization");
    if (!token) return res.status(401).json({ message: "Accès refusé, aucun token fourni." });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({ message: "Token invalide." });
    }
};

module.exports = { router, authMiddleware };