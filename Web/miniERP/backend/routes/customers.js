const express = require('express');
const JsonDatabase = require('../database/JsonDatabase');
const router = express.Router();

const db = new JsonDatabase();

router.get('/', async (req, res) => {
    try {
        await db.connect();
        const customers = await db.read('customers');
        res.json(customers);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/:id', async (req, res) => {
    try {
        await db.connect();
        const customer = await db.read('customers', req.params.id);
        if (!customer) {
            return res.status(404).json({ error: 'Customer not found' });
        }
        res.json(customer);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/', async (req, res) => {
    try {
        await db.connect();
        const customer = await db.create('customers', req.body);
        res.status(201).json(customer);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.put('/:id', async (req, res) => {
    try {
        await db.connect();
        const customer = await db.update('customers', req.params.id, req.body);
        if (!customer) {
            return res.status(404).json({ error: 'Customer not found' });
        }
        res.json(customer);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        await db.connect();
        const deleted = await db.delete('customers', req.params.id);
        if (!deleted) {
            return res.status(404).json({ error: 'Customer not found' });
        }
        res.json({ message: 'Customer deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;