const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const authMiddleware = require("../middleware/authMiddleware"); // Ajout du middleware

// Obtenir les avis d'un produit
router.get('/product/:productId', async (req, res) => {
  try {
    const reviews = await Review.find({ productId: req.params.productId })
      .populate('userId', 'name')
      .sort({ createdAt: -1 });
    
    // Calculer la moyenne des étoiles
    const ratings = reviews.map(review => review.rating);
    const averageRating = ratings.length > 0 
      ? ratings.reduce((a, b) => a + b) / ratings.length 
      : 0;

    res.json({
      reviews,
      averageRating,
      totalReviews: reviews.length
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Ajouter un avis
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { productId, rating, comment } = req.body;
    const review = new Review({
      userId: req.user.id,
      productId,
      rating,
      comment
    });
    await review.save();
    res.status(201).json(review);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router; 