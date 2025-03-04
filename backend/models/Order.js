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
        product: {
            name: { type: String, required: true },
            description: { type: String, required: true },
            price: { type: Number, required: true },
            image: { type: String, required: true },
            category: { type: String, required: true }
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
    totalAmount: {
        type: Number,
        required: true
    },
    shippingAddress: {
        street: { type: String, required: true },
        city: { type: String, required: true },
        state: { type: String, required: true },
        zipCode: { type: String, required: true },
        country: { type: String, required: true }
    },
    status: {
        type: String,
        enum: ['pending', 'paid', 'processing', 'cancelled', 'shipped', 'delivered'], 
        default: 'pending'
    },
    stripeSessionId: {
        type: String,
        required: true
    },
    isGuestOrder: { 
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

module.exports = mongoose.model("Order", orderSchema);
