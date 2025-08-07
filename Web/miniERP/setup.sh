#!/bin/bash

echo "🚀 Setting up Mini ERP System..."

# Fix npm permissions if needed
if [ -d "/Users/$USER/.npm" ]; then
    echo "Fixing npm permissions..."
    sudo chown -R $USER:$(id -gn) /Users/$USER/.npm
fi

# Install dependencies
echo "Installing dependencies..."
npm install express cors body-parser uuid --save
npm install nodemon --save-dev

# Create necessary directories
mkdir -p backend/data
mkdir -p frontend/html frontend/css frontend/js

# Set permissions
echo "Setting file permissions..."
chmod +x setup.sh

# Create a simple test to verify setup
echo "Running basic setup test..."
node -e "
const fs = require('fs');
const path = require('path');

// Check if all required files exist
const requiredFiles = [
    'package.json',
    'backend/server.js',
    'frontend/html/index.html',
    'frontend/css/styles.css',
    'frontend/js/app.js'
];

let allFilesExist = true;
requiredFiles.forEach(file => {
    if (!fs.existsSync(file)) {
        console.error('❌ Missing file:', file);
        allFilesExist = false;
    }
});

if (allFilesExist) {
    console.log('✅ All files present');
} else {
    console.log('❌ Some files are missing');
    process.exit(1);
}

// Test JSON database
const JsonDatabase = require('./backend/database/JsonDatabase');
const db = new JsonDatabase('./backend/data');
db.connect().then(() => {
    console.log('✅ Database connection test passed');
    db.disconnect();
}).catch(err => {
    console.error('❌ Database test failed:', err.message);
});
"

echo "✅ Setup complete!"
echo ""
echo "To start the system:"
echo "npm run dev    # Development mode with auto-restart"
echo "npm start      # Production mode"
echo ""
echo "Then open: http://localhost:3000"