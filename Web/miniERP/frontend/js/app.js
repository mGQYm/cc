class ERPSystem {
    constructor() {
        this.baseURL = 'http://localhost:3003/api';
        this.currentTab = 'dashboard';
        this.currentEditId = null;
        this.currentFormType = null;
        this.products = [];
        this.customers = [];
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        i18n.updateUIText();
        this.loadDashboard();
    }

    setupEventListeners() {
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.switchTab(e.target.dataset.tab));
        });
        
        // Language switcher
        const languageSwitcher = document.getElementById('language-switcher');
        if (languageSwitcher) {
            languageSwitcher.addEventListener('change', (e) => {
                i18n.setLanguage(e.target.value);
            });
            
            // Set initial language
            languageSwitcher.value = i18n.getCurrentLanguage();
        }
        
        // Product search and filter listeners
        const productSearch = document.getElementById('product-search');
        const categoryFilter = document.getElementById('product-category-filter');
        const minPrice = document.getElementById('product-min-price');
        const maxPrice = document.getElementById('product-max-price');
        
        if (productSearch) {
            productSearch.addEventListener('input', () => this.loadProducts());
        }
        
        if (categoryFilter) {
            categoryFilter.addEventListener('change', () => this.loadProducts());
        }
        
        if (minPrice) {
            minPrice.addEventListener('input', () => this.loadProducts());
        }
        
        if (maxPrice) {
            maxPrice.addEventListener('input', () => this.loadProducts());
        }
    }
    
    async loadCategories() {
        try {
            const categories = await this.fetchData('products/categories');
            const categoryFilter = document.getElementById('product-category-filter');
            if (categoryFilter) {
                categoryFilter.innerHTML = '<option value="">All Categories</option>';
                categories.forEach(category => {
                    categoryFilter.innerHTML += `<option value="${category}">${category}</option>`;
                });
            }
        } catch (error) {
            console.error('Error loading categories:', error);
        }
    }

    switchTab(tabName) {
        document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
        
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
        document.getElementById(tabName).classList.add('active');
        
        this.currentTab = tabName;
        this.loadTabData(tabName);
    }

    async loadTabData(tabName) {
        switch(tabName) {
            case 'dashboard':
                await this.loadDashboard();
                break;
            case 'products':
                await this.loadCategories();
                await this.loadProducts();
                break;
            case 'customers':
                await this.loadCustomers();
                break;
            case 'orders':
                await this.loadOrders();
                break;
            case 'inventory':
                await this.loadInventory();
                break;
        }
    }

    async loadDashboard() {
        try {
            const [products, customers, orders, inventory] = await Promise.all([
                this.fetchData('products'),
                this.fetchData('customers'),
                this.fetchData('orders'),
                this.fetchData('inventory')
            ]);

            this.products = products;
            this.customers = customers;

            document.getElementById('total-products').textContent = products.length;
            document.getElementById('total-customers').textContent = customers.length;
            document.getElementById('total-orders').textContent = orders.length;
            
            const lowStock = inventory.filter(item => item.quantity <= item.minStock).length;
            document.getElementById('low-stock').textContent = lowStock;
        } catch (error) {
            console.error('Error loading dashboard:', error);
        }
    }

    async loadProducts() {
        try {
            const searchParams = new URLSearchParams();
            
            const search = document.getElementById('product-search')?.value;
            const category = document.getElementById('product-category-filter')?.value;
            const minPrice = document.getElementById('product-min-price')?.value;
            const maxPrice = document.getElementById('product-max-price')?.value;
            
            if (search) searchParams.append('search', search);
            if (category) searchParams.append('category', category);
            if (minPrice) searchParams.append('minPrice', minPrice);
            if (maxPrice) searchParams.append('maxPrice', maxPrice);
            
            const queryString = searchParams.toString();
            const url = `${this.baseURL}/products${queryString ? '?' + queryString : ''}`;
            
            const response = await fetch(url);
            const products = await response.json();
            
            this.products = products;
            const tbody = document.getElementById('products-tbody');
            tbody.innerHTML = '';
            
            products.forEach(product => {
                const row = tbody.insertRow();
                row.innerHTML = `
                    <td>${product.id}</td>
                    <td>${product.name}</td>
                    <td>$${product.price}</td>
                    <td>${product.category}</td>
                    <td>${product.description || 'N/A'}</td>
                    <td>
                        <button class="action-btn edit-btn" onclick="erp.editProduct('${product.id}')">Edit</button>
                        <button class="action-btn delete-btn" onclick="erp.deleteProduct('${product.id}')">Delete</button>
                    </td>
                `;
            });
        } catch (error) {
            console.error('Error loading products:', error);
        }
    }

    async loadCustomers() {
        try {
            const customers = await this.fetchData('customers');
            this.customers = customers;
            const tbody = document.getElementById('customers-tbody');
            tbody.innerHTML = '';
            
            customers.forEach(customer => {
                const row = tbody.insertRow();
                row.innerHTML = `
                    <td>${customer.id}</td>
                    <td>${customer.name}</td>
                    <td>${customer.email}</td>
                    <td>${customer.phone || 'N/A'}</td>
                    <td>
                        <button class="action-btn edit-btn" onclick="erp.editCustomer('${customer.id}')">Edit</button>
                        <button class="action-btn delete-btn" onclick="erp.deleteCustomer('${customer.id}')">Delete</button>
                    </td>
                `;
            });
        } catch (error) {
            console.error('Error loading customers:', error);
        }
    }

    async loadOrders() {
        try {
            const orders = await this.fetchData('orders');
            const tbody = document.getElementById('orders-tbody');
            tbody.innerHTML = '';
            
            orders.forEach(order => {
                const itemsText = order.items
                    ? order.items.map(item => `${item.productName} x${item.quantity}`).join(', ')
                    : 'No items';
                    
                const row = tbody.insertRow();
                row.innerHTML = `
                    <td>${order.id}</td>
                    <td>${order.customerName || 'Unknown'}</td>
                    <td>${itemsText}</td>
                    <td>$${order.total || 0}</td>
                    <td><span class="status status-${order.status}">${order.status}</span></td>
                    <td>${new Date(order.createdAt).toLocaleDateString()}</td>
                    <td>
                        <button class="action-btn edit-btn" onclick="erp.editOrder('${order.id}')">Edit</button>
                        <button class="action-btn delete-btn" onclick="erp.deleteOrder('${order.id}')">Delete</button>
                    </td>
                `;
            });
        } catch (error) {
            console.error('Error loading orders:', error);
        }
    }

    async loadInventory() {
        try {
            const [inventory, products] = await Promise.all([
                this.fetchData('inventory'),
                this.fetchData('products')
            ]);
            
            const tbody = document.getElementById('inventory-tbody');
            tbody.innerHTML = '';
            
            inventory.forEach(item => {
                const product = products.find(p => p.id === item.productId);
                const row = tbody.insertRow();
                row.innerHTML = `
                    <td>${product ? product.name : 'Unknown'}</td>
                    <td>${item.quantity}</td>
                    <td>${item.minStock}</td>
                    <td>${new Date(item.lastUpdated).toLocaleDateString()}</td>
                    <td>
                        <button class="action-btn edit-btn" onclick="erp.editInventory('${item.id}')">Edit</button>
                        <button class="action-btn delete-btn" onclick="erp.deleteInventory('${item.id}')">Delete</button>
                    </td>
                `;
            });
        } catch (error) {
            console.error('Error loading inventory:', error);
        }
    }

    async fetchData(endpoint) {
        const response = await fetch(`${this.baseURL}/${endpoint}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    }

    async postData(endpoint, data) {
        const response = await fetch(`${this.baseURL}/${endpoint}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    }

    async putData(endpoint, id, data) {
        const response = await fetch(`${this.baseURL}/${endpoint}/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    }

    async deleteData(endpoint, id) {
        const response = await fetch(`${this.baseURL}/${endpoint}/${id}`, {
            method: 'DELETE'
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    }

    async populateSelects() {
        try {
            const [products, customers] = await Promise.all([
                this.fetchData('products'),
                this.fetchData('customers')
            ]);

            const productSelects = [
                document.getElementById('order-product'),
                document.getElementById('inventory-product')
            ];
            
            productSelects.forEach(select => {
                if (select) {
                    select.innerHTML = '<option value="">Select Product</option>';
                    products.forEach(product => {
                        select.innerHTML += `<option value="${product.id}">${product.name}</option>`;
                    });
                }
            });

            const customerSelect = document.getElementById('order-customer');
            if (customerSelect) {
                customerSelect.innerHTML = '<option value="">Select Customer</option>';
                customers.forEach(customer => {
                    customerSelect.innerHTML += `<option value="${customer.id}">${customer.name}</option>`;
                });
            }
        } catch (error) {
            console.error('Error populating selects:', error);
        }
    }

    showModal(formType, title) {
        this.currentFormType = formType;
        document.getElementById('modal-title').textContent = title;
        document.getElementById('modal-backdrop').style.display = 'flex';
        
        document.querySelectorAll('form[id$="-form"]').forEach(form => {
            form.style.display = 'none';
        });
        
        document.getElementById(`${formType}-form`).style.display = 'block';
        
        if (['order', 'inventory'].includes(formType)) {
            this.populateSelects();
        }
    }

    closeModal() {
        document.getElementById('modal-backdrop').style.display = 'none';
        this.currentEditId = null;
        this.clearForm();
    }

    clearForm() {
        document.querySelectorAll('form[id$="-form"] input, form[id$="-form"] select, form[id$="-form"] textarea').forEach(input => {
            input.value = '';
        });
    }

    async saveItem() {
        const formData = this.getFormData();
        if (!formData) return;

        try {
            if (this.currentEditId) {
                await this.putData(this.currentFormType + 's', this.currentEditId, formData);
            } else {
                await this.postData(this.currentFormType + 's', formData);
            }
            
            this.closeModal();
            this.loadTabData(this.currentTab);
        } catch (error) {
            console.error('Error saving item:', error);
            alert('Error saving item: ' + error.message);
        }
    }

    getFormData() {
        const formData = {};
        
        switch(this.currentFormType) {
            case 'product':
                formData.name = document.getElementById('product-name').value;
                formData.price = parseFloat(document.getElementById('product-price').value);
                formData.category = document.getElementById('product-category').value;
                formData.description = document.getElementById('product-description').value;
                break;
            case 'customer':
                formData.name = document.getElementById('customer-name').value;
                formData.email = document.getElementById('customer-email').value;
                formData.phone = document.getElementById('customer-phone').value;
                formData.address = document.getElementById('customer-address').value;
                break;
            case 'order':
                formData.customerId = document.getElementById('order-customer').value;
                formData.productId = document.getElementById('order-product').value;
                formData.quantity = parseInt(document.getElementById('order-quantity').value);
                
                // Calculate total based on product price
                const selectedProduct = this.products.find(p => p.id === formData.productId);
                formData.total = selectedProduct ? selectedProduct.price * formData.quantity : 0;
                formData.status = document.getElementById('order-status').value;
                break;
            case 'inventory':
                formData.productId = document.getElementById('inventory-product').value;
                formData.quantity = parseInt(document.getElementById('inventory-quantity').value);
                formData.minStock = parseInt(document.getElementById('inventory-min-stock').value);
                break;
        }
        
        return formData;
    }

    async editProduct(id) {
        try {
            const product = await this.fetchData(`products/${id}`);
            this.currentEditId = id;
            
            document.getElementById('product-name').value = product.name;
            document.getElementById('product-price').value = product.price;
            document.getElementById('product-category').value = product.category;
            document.getElementById('product-description').value = product.description || '';
            
            this.showModal('product', 'Edit Product');
        } catch (error) {
            console.error('Error loading product:', error);
        }
    }

    async deleteProduct(id) {
        if (confirm('Are you sure you want to delete this product?')) {
            try {
                await this.deleteData('products', id);
                this.loadTabData('products');
            } catch (error) {
                console.error('Error deleting product:', error);
            }
        }
    }

    async editCustomer(id) {
        try {
            const customer = await this.fetchData(`customers/${id}`);
            this.currentEditId = id;
            
            document.getElementById('customer-name').value = customer.name;
            document.getElementById('customer-email').value = customer.email;
            document.getElementById('customer-phone').value = customer.phone || '';
            document.getElementById('customer-address').value = customer.address || '';
            
            this.showModal('customer', 'Edit Customer');
        } catch (error) {
            console.error('Error loading customer:', error);
        }
    }

    async deleteCustomer(id) {
        if (confirm('Are you sure you want to delete this customer?')) {
            try {
                await this.deleteData('customers', id);
                this.loadTabData('customers');
            } catch (error) {
                console.error('Error deleting customer:', error);
            }
        }
    }

    async editOrder(id) {
        try {
            const order = await this.fetchData(`orders/${id}`);
            this.currentEditId = id;
            
            document.getElementById('order-customer').value = order.customerId;
            document.getElementById('order-product').value = order.productId;
            document.getElementById('order-quantity').value = order.quantity;
            document.getElementById('order-status').value = order.status;
            
            this.showModal('order', 'Edit Order');
        } catch (error) {
            console.error('Error loading order:', error);
        }
    }

    async deleteOrder(id) {
        if (confirm('Are you sure you want to delete this order?')) {
            try {
                await this.deleteData('orders', id);
                this.loadTabData('orders');
            } catch (error) {
                console.error('Error deleting order:', error);
            }
        }
    }

    async editInventory(id) {
        try {
            const inventory = await this.fetchData(`inventory/${id}`);
            this.currentEditId = id;
            
            document.getElementById('inventory-product').value = inventory.productId;
            document.getElementById('inventory-quantity').value = inventory.quantity;
            document.getElementById('inventory-min-stock').value = inventory.minStock;
            
            this.showModal('inventory', 'Edit Inventory');
        } catch (error) {
            console.error('Error loading inventory:', error);
        }
    }

    async deleteInventory(id) {
        if (confirm('Are you sure you want to delete this inventory record?')) {
            try {
                await this.deleteData('inventory', id);
                this.loadTabData('inventory');
            } catch (error) {
                console.error('Error deleting inventory:', error);
            }
        }
    }
}

function showAddProductModal() {
    erp.showModal('product', 'Add New Product');
}

function showAddCustomerModal() {
    erp.showModal('customer', 'Add New Customer');
}

function showAddOrderModal() {
    erp.showModal('order', 'Add New Order');
}

function showAddInventoryModal() {
    erp.showModal('inventory', 'Add New Inventory');
}

function closeModal() {
    erp.closeModal();
}

function saveItem() {
    erp.saveItem();
}

function clearProductFilters() {
    document.getElementById('product-search').value = '';
    document.getElementById('product-category-filter').value = '';
    document.getElementById('product-min-price').value = '';
    document.getElementById('product-max-price').value = '';
    erp.loadProducts();
}

const erp = new ERPSystem();