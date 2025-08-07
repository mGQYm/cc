# Mini ERP System

A lightweight web-based ERP (Enterprise Resource Planning) system built with Node.js, Express, and vanilla JavaScript. Uses JSON files for data storage with a pluggable database interface for future database integration.

## Features

- **Product Management**: Add, edit, delete, and view products
- **Customer Management**: Manage customer information and contacts
- **Order Management**: Create and track customer orders
- **Inventory Management**: Track stock levels and set minimum quantities
- **Dashboard**: Overview of key business metrics
- **Responsive Design**: Works on desktop and mobile devices
- **JSON Storage**: Simple file-based data storage
- **Database Ready**: Easy migration to MySQL, PostgreSQL, or MongoDB

## Technology Stack

- **Backend**: Node.js, Express.js
- **Frontend**: HTML, CSS, JavaScript (Vanilla)
- **Storage**: JSON files (with database interface)
- **Development**: Nodemon for auto-restart

## Quick Start

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone or download the project
2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to:
   ```
   http://localhost:3000
   ```

### Production Start

```bash
npm start
```

## Database Migration

The system is designed to easily migrate from JSON storage to a proper database. Here's how to prepare for migration:

### JSON Storage (Current)

Data is stored in `/backend/data/` directory:
- `products.json`
- `customers.json`
- `orders.json`
- `inventory.json`

### Future Database Integration

The system includes a database adapter that supports:
- MySQL
- PostgreSQL
- MongoDB

To migrate, update the configuration in `backend/database/DatabaseAdapter.js`:

```javascript
const config = {
    type: 'mysql', // or 'postgresql', 'mongodb'
    host: 'localhost',
    port: 3306,
    database: 'mini_erp',
    username: 'your_username',
    password: 'your_password'
};
```

## API Endpoints

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get product by ID
- `POST /api/products` - Create new product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product

### Customers
- `GET /api/customers` - Get all customers
- `GET /api/customers/:id` - Get customer by ID
- `POST /api/customers` - Create new customer
- `PUT /api/customers/:id` - Update customer
- `DELETE /api/customers/:id` - Delete customer

### Orders
- `GET /api/orders` - Get all orders
- `GET /api/orders/:id` - Get order by ID
- `POST /api/orders` - Create new order
- `PUT /api/orders/:id` - Update order
- `DELETE /api/orders/:id` - Delete order

### Inventory
- `GET /api/inventory` - Get all inventory records
- `GET /api/inventory/:productId` - Get inventory by product ID
- `POST /api/inventory` - Create new inventory record
- `PUT /api/inventory/:productId` - Update inventory
- `DELETE /api/inventory/:productId` - Delete inventory record

## Project Structure

```
miniERP/
├── backend/
│   ├── server.js                 # Express server
│   ├── routes/                   # API routes
│   │   ├── products.js
│   │   ├── customers.js
│   │   ├── orders.js
│   │   └── inventory.js
│   ├── database/                 # Database layer
│   │   ├── DatabaseInterface.js  # Abstract database interface
│   │   ├── JsonDatabase.js       # JSON file implementation
│   │   └── DatabaseAdapter.js    # Database adapter for future migration
│   └── data/                     # JSON data files
│       ├── products.json
│       ├── customers.json
│       ├── orders.json
│       └── inventory.json
├── frontend/
│   ├── html/
│   │   └── index.html            # Main application
│   ├── css/
│   │   └── styles.css            # Styling
│   └── js/
│       └── app.js                # Frontend JavaScript
└── package.json
```

## Development

### Adding New Features

1. **New API Endpoint**: Add route in `backend/routes/`
2. **New Data Model**: Extend `JsonDatabase.js` or create new database implementation
3. **Frontend Changes**: Update `frontend/js/app.js` and `frontend/html/index.html`

### Database Schema Design for Migration

When migrating to a relational database, use this schema:

#### Products Table
```sql
CREATE TABLE products (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    category VARCHAR(100),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

#### Customers Table
```sql
CREATE TABLE customers (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(50),
    address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

#### Orders Table
```sql
CREATE TABLE orders (
    id VARCHAR(255) PRIMARY KEY,
    customer_id VARCHAR(255) NOT NULL,
    product_id VARCHAR(255) NOT NULL,
    quantity INT NOT NULL,
    total DECIMAL(10,2) NOT NULL,
    status ENUM('pending', 'processing', 'completed', 'cancelled') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id),
    FOREIGN KEY (product_id) REFERENCES products(id)
);
```

#### Inventory Table
```sql
CREATE TABLE inventory (
    id VARCHAR(255) PRIMARY KEY,
    product_id VARCHAR(255) NOT NULL,
    quantity INT NOT NULL DEFAULT 0,
    min_stock INT NOT NULL DEFAULT 0,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id)
);
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - feel free to use this project for any purpose.