const Cart = require('../models/Cart');
const mongoose = require('mongoose'); 

exports.mergeCart = async (req, res) => {
  try {
      const userId = req.user.id; // Récupérer l'utilisateur connecté
      const { items } = req.body; // Panier local à fusionner

      if (!items || !Array.isArray(items)) {
          return res.status(400).json({ message: "Panier invalide" });
      }

      let cart = await Cart.findOne({ userId });

      if (!cart) {
          // Si l'utilisateur n'a pas encore de panier, on le crée avec les articles locaux
          cart = new Cart({ userId, items });
      } else {
          // 🔥 Fusionner les articles : mettre à jour les quantités si déjà existants
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
    const userId = req.user.id; // Vérifier que userId est bien récupéré

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      console.log("❌ ID du produit invalide:", productId);
      return res.status(400).json({ message: "ID du produit invalide" });
    }

    const objectIdProductId = new mongoose.Types.ObjectId(productId);

    let cart = await Cart.findOne({ userId });

    if (!cart) {
      console.log("🛒 Aucun panier trouvé, création d'un nouveau...");
      cart = new Cart({ userId, items: [] });
    } else {
      console.log("🛒 Panier trouvé:", cart);
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
    console.error("❌ Erreur lors de l’ajout au panier :", error);
    res.status(500).json({ message: "Erreur lors de l’ajout au panier", error: error.message });
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