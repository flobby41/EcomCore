const Cart = require('../models/Cart');

// Ajouté pour la logique métier

exports.addToCart = async (userId, productId, quantity, price) => {
  let cart = await Cart.findOne({ userId });

  if (!cart) {
    cart = new Cart({ userId, items: [] });
  }

  const existingItem = cart.items.find(item => item.productId.toString() === productId);

  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    cart.items.push({ productId, quantity, price });
  }

  return await cart.save();
};