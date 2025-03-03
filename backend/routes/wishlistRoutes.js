const express = require('express');
const router = express.Router();
const wishlistController = require('../controllers/wishlistController');
const authMiddleware = require('../middleware/authMiddleware');

// Toutes les routes nécessitent une authentification
router.use(authMiddleware);

// Récupérer la wishlist
router.get('/', wishlistController.getWishlist);

// Ajouter un produit à la wishlist
router.post('/add', wishlistController.addToWishlist);

// Supprimer un produit de la wishlist
router.post('/remove', wishlistController.removeFromWishlist);

// Vider la wishlist
router.delete('/clear', wishlistController.clearWishlist);

module.exports = router; 