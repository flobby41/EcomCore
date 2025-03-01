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

      // ✅ Inclure le nom dans le token JWT
      const token = jwt.sign(
          { 
              id: newUser._id, 
              email: newUser.email,
              name: newUser.name 
          }, 
          process.env.JWT_SECRET, 
          { expiresIn: "7d" }
      );

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
      
      // ✅ Générer un token JWT avec le nom de l'utilisateur
      const token = jwt.sign(
          { 
              id: user._id, 
              email: user.email,
              name: user.name 
          }, 
          process.env.JWT_SECRET, 
          { expiresIn: process.env.JWT_EXPIRES_IN }
      );
 
      res.json({ token, user: { id: user._id, name: user.name, email: user.email } });

  } catch (err) {
      console.error("❌ Erreur serveur :", err);
      res.status(500).json({ message: "Server error" });
  }
});

module.exports = { router };