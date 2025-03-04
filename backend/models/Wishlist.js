const mongoose = require('mongoose');

const WishlistSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    userEmail: { type: String, required: true },

    items: [
        {
            productId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Product',
                required: true
            },
            productName: { type: String, required: true },
            quantity: { type: Number, required: true, default: 1 },
            price: { type: Number, required: true },
            addedAt: {
                type: Date,
                default: Date.now
            }
        }
    ]
}, { timestamps: true });

// Méthode pour vérifier si un produit est dans la wishlist
WishlistSchema.methods.hasProduct = function(productId) {
    return this.items.some(item => item.productId.toString() === productId.toString());
};

module.exports = mongoose.model('Wishlist', WishlistSchema); 