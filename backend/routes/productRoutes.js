const express = require("express");
const router = express.Router();
const Product = require("../models/Product");

// ➤ Ajouter un produit (POST /api/products)
router.post("/", async (req, res) => {
    try {
        const { name, description, price, image, category, stock } = req.body;
        const newProduct = new Product({ name, description, price, image, category, stock });
        await newProduct.save();
        res.status(201).json(newProduct);
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de l'ajout du produit", error });
    }
});

// ➤ Récupérer tous les produits (GET /api/products)
router.get("/", async (req, res) => {
    try {
        const products = await Product.find();
        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la récupération des produits", error });
    }
});

// ➤ Récupérer un produit par ID (GET /api/products/:id)
router.get("/:id", async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ message: "Produit non trouvé" });
        res.status(200).json(product);
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la récupération du produit", error });
    }
});

// ➤ Mettre à jour un produit (PUT /api/products/:id)
router.put("/:id", async (req, res) => {
    try {
        const updatedProduct = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedProduct) return res.status(404).json({ message: "Produit non trouvé" });
        res.status(200).json(updatedProduct);
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la mise à jour du produit", error });
    }
});

// ➤ Supprimer un produit (DELETE /api/products/:id)
router.delete("/:id", async (req, res) => {
    try {
        const deletedProduct = await Product.findByIdAndDelete(req.params.id);
        if (!deletedProduct) return res.status(404).json({ message: "Produit non trouvé" });
        res.status(200).json({ message: "Produit supprimé avec succès" });
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la suppression du produit", error });
    }
});

module.exports = router;