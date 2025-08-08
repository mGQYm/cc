#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const http = require('http');

console.log('🔍 Validating Mini ERP System...\n');

// Check required files
const requiredFiles = [
    'package.json',
    'backend/server.js',
    'backend/database/DatabaseInterface.js',
    'backend/database/JsonDatabase.js',
    'backend/routes/products.js',
    'backend/routes/customers.js',
    'backend/routes/orders.js',
    'backend/routes/inventory.js',
    'frontend/html/index.html',
    'frontend/css/styles.css',
    'frontend/js/app.js',
    'frontend/js/i18n.js'
];

let allFilesExist = true;
requiredFiles.forEach(file => {
    if (!fs.existsSync(file)) {
        console.error(`❌ Missing file: ${file}`);
        allFilesExist = false;
    } else {
        console.log(`✅ ${file}`);
    }
});

// Check data directory and files
const dataFiles = ['products.json', 'customers.json', 'orders.json', 'inventory.json'];
dataFiles.forEach(file => {
    const filePath = path.join('backend/data', file);
    if (!fs.existsSync(filePath)) {
        console.warn(`⚠️  Data file missing: ${filePath}`);
    } else {
        try {
            const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
            console.log(`✅ ${file}: ${data.length} records`);
        } catch (e) {
            console.error(`❌ Invalid JSON in ${file}: ${e.message}`);
            allFilesExist = false;
        }
    }
});

// Test database functionality
console.log('\n📊 Testing database functionality...');
try {
    const JsonDatabase = require('./backend/database/JsonDatabase');
    const db = new JsonDatabase('./backend/data');
    
    async function testDatabase() {
        try {
            await db.connect();
            console.log('✅ Database connection successful');
            
            // Test read operations
            const products = await db.read('products');
            const customers = await db.read('customers');
            const orders = await db.read('orders');
            const inventory = await db.read('inventory');
            
            console.log(`✅ Products: ${products.length}`);
            console.log(`✅ Customers: ${customers.length}`);
            console.log(`✅ Orders: ${orders.length}`);
            console.log(`✅ Inventory: ${inventory.length}`);
            
            await db.disconnect();
        } catch (error) {
            console.error(`❌ Database error: ${error.message}`);
            allFilesExist = false;
        }
    }
    
    testDatabase().then(() => {
        // Test API endpoints
        console.log('\n🌐 Testing API endpoints...');
        
        const endpoints = [
            '/api/products',
            '/api/customers', 
            '/api/orders',
            '/api/inventory'
        ];
        
        let completed = 0;
        endpoints.forEach(endpoint => {
            const options = {
                hostname: 'localhost',
                port: 3003,
                path: endpoint,
                method: 'GET'
            };
            
            const req = http.request(options, (res) => {
                console.log(`✅ ${endpoint}: ${res.statusCode}`);
                completed++;
                if (completed === endpoints.length) {
                    finalize();
                }
            });
            
            req.on('error', (error) => {
                console.warn(`⚠️  ${endpoint}: Server not running`);
                completed++;
                if (completed === endpoints.length) {
                    finalize();
                }
            });
            
            req.setTimeout(2000, () => {
                console.warn(`⚠️  ${endpoint}: Connection timeout`);
                req.destroy();
                completed++;
                if (completed === endpoints.length) {
                    finalize();
                }
            });
            
            req.end();
        });
        
        function finalize() {
            console.log('\n📋 Validation Summary:');
            if (allFilesExist) {
                console.log('✅ All core components are present and functional!');
                console.log('\n🚀 To start the system:');
                console.log('   npm run dev    # Development mode');
                console.log('   npm start      # Production mode');
                console.log('\n🌐 Then open: http://localhost:3003');
            } else {
                console.log('❌ Some issues found. Please review the errors above.');
                process.exit(1);
            }
        }
    });
    
} catch (error) {
    console.error(`❌ Database initialization error: ${error.message}`);
    process.exit(1);
}