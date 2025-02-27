const mongoose = require('mongoose');

const CartSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  userEmail: { type: String, required: true },
  items: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
      productName: { type: String, required: true }, // ✅ Ajout du nom du produit
      quantity: { type: Number, required: true, default: 1 },
      price: { type: Number, required: true },
    }
  ],
}, { timestamps: true });

module.exports = mongoose.model('Cart', CartSchema);