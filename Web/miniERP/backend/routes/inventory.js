const express = require('express');
const JsonDatabase = require('../database/JsonDatabase');
const router = express.Router();

const db = new JsonDatabase();

router.get('/', async (req, res) => {
    try {
        await db.connect();
        const inventory = await db.read('inventory');
        res.json(inventory);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/:productId', async (req, res) => {
    try {
        await db.connect();
        const inventory = await db.find('inventory', { productId: req.params.productId });
        if (inventory.length === 0) {
            return res.status(404).json({ error: 'Inventory record not found' });
        }
        res.json(inventory[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/', async (req, res) => {
    try {
        await db.connect();
        const inventory = await db.create('inventory', {
            ...req.body,
            lastUpdated: new Date().toISOString()
        });
        res.status(201).json(inventory);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.put('/:productId', async (req, res) => {
    try {
        await db.connect();
        const existing = await db.find('inventory', { productId: req.params.productId });
        if (existing.length === 0) {
            return res.status(404).json({ error: 'Inventory record not found' });
        }
        const inventory = await db.update('inventory', existing[0].id, {
            ...req.body,
            lastUpdated: new Date().toISOString()
        });
        res.json(inventory);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.delete('/:productId', async (req, res) => {
    try {
        await db.connect();
        const existing = await db.find('inventory', { productId: req.params.productId });
        if (existing.length === 0) {
            return res.status(404).json({ error: 'Inventory record not found' });
        }
        await db.delete('inventory', existing[0].id);
        res.json({ message: 'Inventory record deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;