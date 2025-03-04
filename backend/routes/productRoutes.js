const express = require("express");
const router = express.Router();
const Product = require("../models/Product");


// api/products 
// Route pour récupérer les produits phares (limités à 6 par exemple)
router.get("/featured", async (req, res) => {
  try {
      const products = await Product.find().limit(6); // Récupère les 6 premiers produits
      res.json(products);
  } catch (error) {
      console.error("Erreur lors de la récupération des produits :", error);
      res.status(500).json({ message: "Erreur lors de la récupération du produit", error });
  }
});

// ➤ Récupérer tous les produits (GET /api/products)
router.get("/", async (req, res) => {
  try {
      const { category } = req.query;
      const filter = category && category !== 'all' ? { category } : {};
      const products = await Product.find(filter);
      res.json(products);
  } catch (error) {
      res.status(500).json({ message: "Erreur lors de la récupération des produits", error });
  }
});

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


// Route pour obtenir toutes les catégories uniques avec des informations supplémentaires
router.get('/categories', async (req, res) => {
  try {
    // Récupérer les catégories distinctes
    const categoriesNames = await Product.distinct('category');
    
    // Récupérer des informations supplémentaires pour chaque catégorie
    const categoriesWithDetails = await Promise.all(
      categoriesNames.map(async (categoryName) => {
        // Compter le nombre de produits dans cette catégorie
        const count = await Product.countDocuments({ category: categoryName });
        
        // Récupérer un produit représentatif pour obtenir une image
        const sampleProduct = await Product.findOne({ category: categoryName });
        
        return {
          name: categoryName,
          count: count,
          image: sampleProduct?.image || null
        };
      })
    );
    
    res.json(categoriesWithDetails);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ message: 'Error fetching categories' });
  }
});

// Route pour rechercher des produits (doit être placée AVANT la route /:id)
router.get("/search", async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query) {
      return res.status(400).json({ message: "Search parameter is required" });
    }
    
    // Recherche par nom ou description avec une expression régulière insensible à la casse
    const products = await Product.find({
      $or: [
        { name: { $regex: query, $options: "i" } },
        { description: { $regex: query, $options: "i" } },
        { category: { $regex: query, $options: "i" } }
      ]
    });
    
    res.json(products);
  } catch (error) {
    console.error("Error searching products:", error);
    res.status(500).json({ message: "Error searching products", error });
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

// Récupérer un produit par slug
router.get("/by-slug/:slug", async (req, res) => {
    try {
        const product = await Product.findOne({ slug: req.params.slug });
        if (!product) return res.status(404).json({ message: "Product not found" });
        res.status(200).json(product);
    } catch (error) {
        res.status(500).json({ message: "Error retrieving product", error });
    }
});

module.exports = router;