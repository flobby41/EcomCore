const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    image: { type: String, required: true }, // URL de l'image du produit
    category: {
        type: String,
        required: true,
        enum: [
            'Electronics',
            'Clothing',
            'Home & Garden',
            'Sports',
            'Books',
            'Toys',
            'Beauty',
            'Jewelry',
            'Automotive',
            'Office'
        ]
    },
    stock: { type: Number, required: true, default: 0 },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

module.exports = mongoose.model("Product", productSchema);