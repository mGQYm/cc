const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const productRoutes = require('./routes/products');
const customerRoutes = require('./routes/customers');
const orderRoutes = require('./routes/orders');
const inventoryRoutes = require('./routes/inventory');

const app = express();
const PORT = process.env.PORT || 3003;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, '../frontend')));

app.use('/api/products', productRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/inventory', inventoryRoutes);

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/html/index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on http://0.0.0.0:${PORT}`);
    console.log(`Local access: http://localhost:${PORT}`);
});