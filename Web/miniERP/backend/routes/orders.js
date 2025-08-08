const express = require('express');
const JsonDatabase = require('../database/JsonDatabase');
const router = express.Router();

const db = new JsonDatabase();

router.get('/', async (req, res) => {
    try {
        await db.connect();
        const orders = await db.read('orders');
        
        // Add customer and product details to orders
        const customers = await db.read('customers');
        const products = await db.read('products');
        
        const enrichedOrders = orders.map(order => {
            const customer = customers.find(c => c.id === order.customerId);
            
            // Handle both old format (single product) and new format (items array)
            let orderItems = [];
            if (order.items && Array.isArray(order.items)) {
                orderItems = order.items.map(item => {
                    const product = products.find(p => p.id === item.productId);
                    return {
                        ...item,
                        productName: product ? product.name : 'Unknown Product',
                        productPrice: product ? product.price : 0
                    };
                });
            } else if (order.productId) {
                // Handle old format
                const product = products.find(p => p.id === order.productId);
                orderItems = [{
                    productId: order.productId,
                    quantity: order.quantity || 1,
                    productName: product ? product.name : 'Unknown Product',
                    productPrice: product ? product.price : 0,
                    subtotal: order.total || 0
                }];
            }
            
            return {
                ...order,
                customerName: customer ? customer.name : 'Unknown Customer',
                items: orderItems
            };
        });
        
        res.json(enrichedOrders);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/:id', async (req, res) => {
    try {
        await db.connect();
        const order = await db.read('orders', req.params.id);
        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }
        
        // Add customer and product details
        const customers = await db.read('customers');
        const products = await db.read('products');
        
        const customer = customers.find(c => c.id === order.customerId);
        
        let orderItems = [];
        if (order.items && Array.isArray(order.items)) {
            orderItems = order.items.map(item => {
                const product = products.find(p => p.id === item.productId);
                return {
                    ...item,
                    productName: product ? product.name : 'Unknown Product',
                    productPrice: product ? product.price : 0
                };
            });
        } else if (order.productId) {
            const product = products.find(p => p.id === order.productId);
            orderItems = [{
                productId: order.productId,
                quantity: order.quantity || 1,
                productName: product ? product.name : 'Unknown Product',
                productPrice: product ? product.price : 0,
                subtotal: order.total || 0
            }];
        }
        
        const enrichedOrder = {
            ...order,
            customerName: customer ? customer.name : 'Unknown Customer',
            items: orderItems
        };
        
        res.json(enrichedOrder);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/', async (req, res) => {
    try {
        await db.connect();
        const { customerId, items, status = 'pending' } = req.body;
        
        if (!customerId || !items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ error: 'Customer ID and items array are required' });
        }
        
        // Calculate total
        const products = await db.read('products');
        let total = 0;
        
        const orderItems = items.map(item => {
            const product = products.find(p => p.id === item.productId);
            if (!product) {
                throw new Error(`Product with ID ${item.productId} not found`);
            }
            const subtotal = product.price * item.quantity;
            total += subtotal;
            
            return {
                productId: item.productId,
                quantity: item.quantity,
                price: product.price,
                subtotal
            };
        });
        
        const order = {
            customerId,
            items: orderItems,
            total,
            status,
            createdAt: new Date().toISOString()
        };
        
        const createdOrder = await db.create('orders', order);
        res.status(201).json(createdOrder);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.put('/:id', async (req, res) => {
    try {
        await db.connect();
        const { customerId, items, status } = req.body;
        
        const existingOrder = await db.read('orders', req.params.id);
        if (!existingOrder) {
            return res.status(404).json({ error: 'Order not found' });
        }
        
        // Calculate new total if items are provided
        let updatedOrder = { ...existingOrder, status };
        
        if (customerId) updatedOrder.customerId = customerId;
        
        if (items && Array.isArray(items)) {
            const products = await db.read('products');
            let total = 0;
            
            updatedOrder.items = items.map(item => {
                const product = products.find(p => p.id === item.productId);
                if (!product) {
                    throw new Error(`Product with ID ${item.productId} not found`);
                }
                const subtotal = product.price * item.quantity;
                total += subtotal;
                
                return {
                    productId: item.productId,
                    quantity: item.quantity,
                    price: product.price,
                    subtotal
                };
            });
            updatedOrder.total = total;
        }
        
        const order = await db.update('orders', req.params.id, updatedOrder);
        res.json(order);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        await db.connect();
        const deleted = await db.delete('orders', req.params.id);
        if (!deleted) {
            return res.status(404).json({ error: 'Order not found' });
        }
        res.json({ message: 'Order deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;