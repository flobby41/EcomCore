const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
    stripeSessionId: { type: String, required: true, unique: true },
    customerEmail: { type: String, required: true },
    totalAmount: { type: Number, required: true },
    status: { type: String, default: "pending" }, // "pending", "paid", "shipped"
    products: [
        {
            name: String,
            price: Number,
            quantity: Number,
            image: String
        }
    ],
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Order", orderSchema);