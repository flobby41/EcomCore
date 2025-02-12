const express = require('express');
const router = express.Router();
const CartController = require('../controllers/CartController');
const authMiddleware = require('../middleware/authMiddleware');

// api/cart
router.post('/add', authMiddleware, CartController.addToCart);
router.get('/', authMiddleware, CartController.getCart);
router.post('/remove', authMiddleware, CartController.removeFromCart);
router.delete('/clear', authMiddleware, CartController.clearCart);
router.post('/merge', authMiddleware, CartController.mergeCart);
router.post('/update-quantity', authMiddleware, CartController.updateQuantity);

module.exports = router;