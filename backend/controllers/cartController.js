const Cart = require('../models/Cart');
const User = require('../models/User');
const mongoose = require('mongoose'); 

exports.mergeCart = async (req, res) => {
  try {
      const userId = req.user.id;
      const userEmail = req.user.email;
      const { items } = req.body;

      if (!items || !Array.isArray(items)) {
          return res.status(400).json({ message: "Panier invalide" });
      }

      let cart = await Cart.findOne({ userId });

      if (!cart) {
          cart = new Cart({ userId, userEmail, items });
      } else {
          cart.userEmail = userEmail;
          items.forEach(item => {
              const existingItem = cart.items.find(p => p.productId.toString() === item.productId);
              if (existingItem) {
                  existingItem.quantity += item.quantity;
              } else {
                  cart.items.push(item);
              }
          });
      }

      await cart.save();
      res.status(200).json({ message: "Panier fusionné avec succès", items: cart.items });
  } catch (error) {
      console.error("❌ Erreur lors de la fusion du panier :", error);
      res.status(500).json({ message: "Erreur serveur", error });
  }
};

exports.addToCart = async (req, res) => {
  try {
    console.log("📥 Requête reçue pour ajouter au panier:", req.body);
    console.log("🔑 Utilisateur authentifié:", req.user);

    const { productId, quantity, price } = req.body;
    const userId = req.user.id;
    const userEmail = req.user.email;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      console.log("❌ ID du produit invalide:", productId);
      return res.status(400).json({ message: "ID du produit invalide" });
    }

    const objectIdProductId = new mongoose.Types.ObjectId(productId);

    let cart = await Cart.findOne({ userId });

    if (!cart) {
      console.log("🛒 Aucun panier trouvé, création d'un nouveau...");
      cart = new Cart({ userId, userEmail, items: [] });
    } else {
      cart.userEmail = userEmail;
    }

    const existingItem = cart.items.find(item => item.productId.toString() === productId);

    if (existingItem) {
      console.log("➕ Produit déjà dans le panier, augmentation de la quantité...");
      existingItem.quantity += quantity;
    } else {
      console.log("🆕 Ajout du produit au panier...");
      cart.items.push({ productId: objectIdProductId, quantity, price });
    }

    await cart.save();
    console.log("✅ Panier mis à jour avec succès !", cart);
    res.status(200).json(cart);
  } catch (error) {
    console.error("❌ Erreur lors de l'ajout au panier :", error);
    res.status(500).json({ message: "Erreur lors de l'ajout au panier", error: error.message });
  }
};

exports.getCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const cart = await Cart.findOne({ userId }).populate('items.productId');

    if (!cart) {
      return res.status(404).json({ message: "Panier vide" });
    }

    res.status(200).json(cart);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération du panier', error });
  }
};

exports.removeFromCart = async (req, res) => {
  try {
    const { productId } = req.body;
    const userId = req.user.id;

    let cart = await Cart.findOne({ userId });

    if (!cart) {
      return res.status(404).json({ message: "Panier non trouvé" });
    }

    cart.items = cart.items.filter(item => item.productId.toString() !== productId);
    await cart.save();

    res.status(200).json(cart);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la suppression du produit', error });
  }
};

exports.clearCart = async (req, res) => {
  try {
    const userId = req.user.id;
    await Cart.findOneAndDelete({ userId });
    res.status(200).json({ message: "Panier vidé avec succès" });
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la suppression du panier", error });
  }
};

exports.updateQuantity = async (req, res) => {
    try {
        const { productId, quantity } = req.body;
        const userId = req.user.id;

        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({ message: "ID du produit invalide" });
        }

        const cart = await Cart.findOne({ userId });
        
        if (!cart) {
            return res.status(404).json({ message: "Panier non trouvé" });
        }

        // Trouver l'item dans le panier
        const cartItem = cart.items.find(item => 
            item.productId.toString() === productId
        );

        if (!cartItem) {
            return res.status(404).json({ message: "Produit non trouvé dans le panier" });
        }

        // Mettre à jour la quantité
        cartItem.quantity = quantity;

        await cart.save();
        
        console.log("✅ Quantité mise à jour avec succès:", { productId, quantity });
        res.status(200).json(cart);
    } catch (error) {
        console.error("❌ Erreur lors de la mise à jour de la quantité:", error);
        res.status(500).json({ 
            message: "Erreur lors de la mise à jour de la quantité",
            error: error.message 
        });
    }
};