const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User',
        required: false // ✅ Optionnel pour les commandes invités
    },
    email: { 
        type: String, 
        required: true // ✅ Email requis pour tous
    },
    items: [{
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true
        },
        quantity: {
            type: Number,
            required: true
        },
        price: {
            type: Number,
            required: true
        }
    }],
    status: {
        type: String,
        enum: ['pending', 'paid', 'cancelled', 'shipped', 'delivered'], // ✅ Nouveaux statuts ajoutés
        default: 'pending'
    },
    totalAmount: {
      type: Number,
      required: true
  },
    stripeSessionId: {
        type: String,
        required: true
    },
    isGuestOrder: { // ✅ Nouveau champ pour identifier les commandes invités
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

module.exports = mongoose.model("Order", orderSchema);
