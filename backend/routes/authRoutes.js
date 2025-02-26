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

      res.status(201).json({ message: "Utilisateur créé avec succès", token });
  } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Erreur serveur" });
  }
});

// Connexion (Login)
router.post('/login', async (req, res) => {
  
  try {
    const { email, password } = req.body;

       // Vérifier si l'utilisateur existe
      const user = await User.findOne({ email });
      if (!user) {
          return res.status(400).json({ message: "Invalid user" });
      }

        // Vérifier le mot de passe
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
          return res.status(400).json({ message: "Invalid credentials" });
      }
 // Générer un token JWT
 const token = jwt.sign({ userId: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });
 
 res.json({ token, user: { id: user._id, name: user.name, email: user.email } });

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