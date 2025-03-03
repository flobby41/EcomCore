const Wishlist = require('../models/Wishlist');
const Product = require('../models/Product');
const mongoose = require('mongoose');

// Récupérer la wishlist de l'utilisateur
exports.getWishlist = async (req, res) => {
    try {
        let wishlist = await Wishlist.findOne({ userId: req.user.id })
            .populate('items.productId');
        
        if (!wishlist) {
            wishlist = { items: [] };
        }
        
        res.status(200).json(wishlist);
    } catch (error) {
        console.error('Error fetching wishlist:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Ajouter un produit à la wishlist
exports.addToWishlist = async (req, res) => {
    try {
        const { productId } = req.body;
        
        if (!productId) {
            return res.status(400).json({ message: 'Product ID is required' });
        }
        
        // Vérifier si le produit existe
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        
        // Trouver ou créer la wishlist de l'utilisateur
        let wishlist = await Wishlist.findOne({ userId: req.user.id });
        
        if (!wishlist) {
            wishlist = new Wishlist({
                userId: req.user.id,
                items: []
            });
        }
        
        // Vérifier si le produit est déjà dans la wishlist
        const productExists = wishlist.items.some(
            item => item.productId.toString() === productId.toString()
        );
        
        if (productExists) {
            return res.status(200).json({ message: 'Product already in wishlist' });
        }
        
        // Ajouter le produit à la wishlist
        wishlist.items.push({
            productId,
            addedAt: new Date()
        });
        
        await wishlist.save();
        
        res.status(200).json({ message: 'Product added to wishlist' });
    } catch (error) {
        console.error('Error adding to wishlist:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Supprimer un produit de la wishlist
exports.removeFromWishlist = async (req, res) => {
    try {
        const { productId } = req.body;
        
        if (!productId) {
            return res.status(400).json({ message: 'Product ID is required' });
        }
        
        // Trouver la wishlist de l'utilisateur
        const wishlist = await Wishlist.findOne({ userId: req.user.id });
        
        if (!wishlist) {
            return res.status(404).json({ message: 'Wishlist not found' });
        }
        
        // Filtrer pour retirer le produit
        wishlist.items = wishlist.items.filter(
            item => item.productId.toString() !== productId.toString()
        );
        
        await wishlist.save();
        
        res.status(200).json({ message: 'Product removed from wishlist' });
    } catch (error) {
        console.error('Error removing from wishlist:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Vider la wishlist
exports.clearWishlist = async (req, res) => {
    try {
        const wishlist = await Wishlist.findOne({ userId: req.user.id });
        
        if (!wishlist) {
            return res.status(404).json({ message: 'Wishlist not found' });
        }
        
        wishlist.items = [];
        await wishlist.save();
        
        res.status(200).json({ message: 'Wishlist cleared' });
    } catch (error) {
        console.error('Error clearing wishlist:', error);
        res.status(500).json({ message: 'Server error' });
    }
}; 