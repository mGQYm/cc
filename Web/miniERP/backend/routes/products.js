const express = require('express');
const JsonDatabase = require('../database/JsonDatabase');
const router = express.Router();

const db = new JsonDatabase();

router.get('/', async (req, res) => {
    try {
        await db.connect();
        let products = await db.read('products');
        
        // Search functionality
        const { search, category, minPrice, maxPrice, sortBy, sortOrder } = req.query;
        
        if (search) {
            products = products.filter(product => 
                product.name.toLowerCase().includes(search.toLowerCase()) ||
                product.description?.toLowerCase().includes(search.toLowerCase())
            );
        }
        
        if (category) {
            products = products.filter(product => 
                product.category.toLowerCase() === category.toLowerCase()
            );
        }
        
        if (minPrice) {
            products = products.filter(product => product.price >= parseFloat(minPrice));
        }
        
        if (maxPrice) {
            products = products.filter(product => product.price <= parseFloat(maxPrice));
        }
        
        // Sorting
        if (sortBy) {
            products.sort((a, b) => {
                let aValue = a[sortBy];
                let bValue = b[sortBy];
                
                if (typeof aValue === 'string') {
                    aValue = aValue.toLowerCase();
                    bValue = bValue.toLowerCase();
                }
                
                if (sortOrder === 'desc') {
                    return bValue > aValue ? 1 : -1;
                }
                return aValue > bValue ? 1 : -1;
            });
        }
        
        res.json(products);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/categories', async (req, res) => {
    try {
        await db.connect();
        const products = await db.read('products');
        const categories = [...new Set(products.map(product => product.category))];
        res.json(categories);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/:id', async (req, res) => {
    try {
        await db.connect();
        const product = await db.read('products', req.params.id);
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }
        res.json(product);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/', async (req, res) => {
    try {
        await db.connect();
        const product = await db.create('products', req.body);
        res.status(201).json(product);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.put('/:id', async (req, res) => {
    try {
        await db.connect();
        const product = await db.update('products', req.params.id, req.body);
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }
        res.json(product);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        await db.connect();
        const deleted = await db.delete('products', req.params.id);
        if (!deleted) {
            return res.status(404).json({ error: 'Product not found' });
        }
        res.json({ message: 'Product deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;