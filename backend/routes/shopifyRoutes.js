const express = require("express");
const fetch = require("node-fetch");
const router = express.Router();

router.get("/products", async (req, res) => {
    try {
        const response = await fetch(`https://${process.env.SHOPIFY_STORE}.myshopify.com/admin/api/2023-07/products.json`, {
            method: "GET",
            headers: {
                "X-Shopify-Access-Token": process.env.SHOPIFY_ACCESS_TOKEN,
                "Content-Type": "application/json",
            },
        });

        const data = await response.json();
        res.json(data.products);
    } catch (error) {
        res.status(500).json({ message: "Erreur Shopify API" });
    }
});

module.exports = router;