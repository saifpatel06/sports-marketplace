const express = require('express');
const router = express.Router();
const { loadDatabase } = require('../utils/db');

// Get All Products
router.get("/", (req, res) => {
    const db = loadDatabase();
    const { category } = req.query;

    if (category) {
        const filteredProducts = db.products.filter(product => 
            product.category && product.category.toLowerCase() === category.toLowerCase()
        );
        return res.status(200).json(filteredProducts);
    }

    res.status(200).json(db.products);
});

// Get a Single Product by ID
router.get("/:id", (req, res) => {
    const db = loadDatabase();
    const product = db.products.find(product => product.id === req.params.id);
    
    if (!product) {
        return res.status(404).json({ message: 'Product not found' });
    }

    res.status(200).json(product);
});

module.exports = router; 