const mongoose = require('mongoose');
const Product = require('../models/Product');
require('dotenv').config();

async function generateSlugs() {
    try {
        // Connexion à la base de données
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Récupérer tous les produits
        const products = await Product.find({});
        console.log(`Found ${products.length} products`);

        // Mettre à jour chaque produit pour générer un slug
        for (const product of products) {
            // Le middleware pre-save générera automatiquement le slug
            await product.save();
            console.log(`Generated slug for ${product.name}: ${product.slug}`);
        }

        console.log('All slugs generated successfully');
    } catch (error) {
        console.error('Error generating slugs:', error);
    } finally {
        // Fermer la connexion à la base de données
        await mongoose.connection.close();
        console.log('Disconnected from MongoDB');
    }
}

generateSlugs(); 