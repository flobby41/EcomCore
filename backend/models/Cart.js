const mongoose = require('mongoose');

const CartSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  userEmail: { 
    type: String, 
    required: true 
  },
  items: [{
    productId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Product', 
      required: true 
    },
    productName: { 
      type: String, 
      required: true,
      default: 'Produit inconnu' // ✅ Ajout d'une valeur par défaut
    },
    quantity: { 
      type: Number, 
      required: true, 
      default: 1 
    },
    price: { 
      type: Number, 
      required: true 
    }
  }]
}, { 
  timestamps: true,
  toJSON: { virtuals: true }, // ✅ Permet d'inclure les virtuals dans les conversions JSON
  toObject: { virtuals: true } // ✅ Permet d'inclure les virtuals dans les conversions Object
});

// ✅ Ajout d'un middleware pre-save pour s'assurer que productName est toujours défini
CartSchema.pre('save', async function(next) {
  for (const item of this.items) {
    if (!item.productName) {
      try {
        const product = await mongoose.model('Product').findById(item.productId);
        item.productName = product ? product.name : 'Produit inconnu';
      } catch (error) {
        item.productName = 'Produit inconnu';
      }
    }
  }
  next();
});

module.exports = mongoose.model('Cart', CartSchema);