const express = require("express");
const router = express.Router();
const User = require("../models/User");
const authMiddleware = require("../middleware/authMiddleware");
const userController = require('../controllers/userController');

// /api/admin   Récupérer tous les utilisateurs (protégé, admin seulement)
router.get("/users", authMiddleware, async (req, res) => {
    try {
        // Vérifier si l'utilisateur est admin
        if (!req.user.isAdmin) {
            return res.status(403).json({ message: "Accès non autorisé" });
        }

        const users = await User.find()
            .select('-password') // Exclure le mot de passe
            .sort({ createdAt: -1 }); // Les plus récents d'abord

        res.json(users);
    } catch (error) {
        console.error("Erreur:", error);
        res.status(500).json({ message: "Erreur serveur" });
    }
});

// Récupérer un utilisateur spécifique
router.get("/users/:id", authMiddleware, async (req, res) => {
    try {
        if (!req.user.isAdmin) {
            return res.status(403).json({ message: "Accès non autorisé" });
        }

        const user = await User.findById(req.params.id).select('-password');
        if (!user) {
            return res.status(404).json({ message: "Utilisateur non trouvé" });
        }

        res.json(user);
    } catch (error) {
        res.status(500).json({ message: "Erreur serveur" });
    }
});

// Mettre à jour un utilisateur
router.put("/users/:id", authMiddleware, async (req, res) => {
    try {
        if (!req.user.isAdmin) {
            return res.status(403).json({ message: "Accès non autorisé" });
        }

        const { name, email } = req.body;
        const user = await User.findByIdAndUpdate(
            req.params.id,
            { name, email },
            { new: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({ message: "Utilisateur non trouvé" });
        }

        res.json(user);
    } catch (error) {
        res.status(500).json({ message: "Erreur serveur" });
    }
});

// Supprimer un utilisateur
router.delete("/users/:id", authMiddleware, async (req, res) => {
    try {
        if (!req.user.isAdmin) {
            return res.status(403).json({ message: "Accès non autorisé" });
        }

        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) {
            return res.status(404).json({ message: "Utilisateur non trouvé" });
        }

        res.json({ message: "Utilisateur supprimé avec succès" });
    } catch (error) {
        res.status(500).json({ message: "Erreur serveur" });
    }
});

// Route pour récupérer les informations de l'utilisateur connecté
router.get('/me', authMiddleware, userController.getCurrentUser);

// Route pour mettre à jour les informations de l'utilisateur
router.put('/update', authMiddleware, userController.updateUser);

// Route pour changer le mot de passe
router.put('/change-password', authMiddleware, userController.changePassword);

module.exports = router; 