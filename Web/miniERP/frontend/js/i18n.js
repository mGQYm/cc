class I18n {
    constructor() {
        this.currentLang = localStorage.getItem('language') || 'zh';
        this.translations = {
            zh: {
                title: '小型ERP系统',
                dashboard: '仪表板',
                products: '产品管理',
                customers: '客户管理',
                orders: '订单管理',
                inventory: '库存管理',
                totalProducts: '总产品数',
                totalCustomers: '总客户数',
                totalOrders: '总订单数',
                lowStockItems: '低库存商品',
                addProduct: '添加产品',
                addCustomer: '添加客户',
                addOrder: '添加订单',
                addInventory: '添加库存',
                edit: '编辑',
                delete: '删除',
                save: '保存',
                cancel: '取消',
                name: '名称',
                price: '价格',
                category: '分类',
                description: '描述',
                email: '邮箱',
                phone: '电话',
                address: '地址',
                customer: '客户',
                quantity: '数量',
                status: '状态',
                date: '日期',
                minStock: '最低库存',
                lastUpdated: '最后更新',
                product: '产品',
                total: '总计',
                pending: '待处理',
                processing: '处理中',
                completed: '已完成',
                cancelled: '已取消',
                selectCustomer: '选择客户',
                selectProduct: '选择产品',
                confirmDelete: '确定要删除这个记录吗？',
                errorLoading: '加载数据时出错',
                errorSaving: '保存数据时出错',
                successCreated: '创建成功',
                successUpdated: '更新成功',
                successDeleted: '删除成功'
            },
            en: {
                title: 'Mini ERP System',
                dashboard: 'Dashboard',
                products: 'Products',
                customers: 'Customers',
                orders: 'Orders',
                inventory: 'Inventory',
                totalProducts: 'Total Products',
                totalCustomers: 'Total Customers',
                totalOrders: 'Total Orders',
                lowStockItems: 'Low Stock Items',
                addProduct: 'Add Product',
                addCustomer: 'Add Customer',
                addOrder: 'Add Order',
                addInventory: 'Add Inventory',
                edit: 'Edit',
                delete: 'Delete',
                save: 'Save',
                cancel: 'Cancel',
                name: 'Name',
                price: 'Price',
                category: 'Category',
                description: 'Description',
                email: 'Email',
                phone: 'Phone',
                address: 'Address',
                customer: 'Customer',
                quantity: 'Quantity',
                status: 'Status',
                date: 'Date',
                minStock: 'Min Stock',
                lastUpdated: 'Last Updated',
                product: 'Product',
                total: 'Total',
                pending: 'Pending',
                processing: 'Processing',
                completed: 'Completed',
                cancelled: 'Cancelled',
                selectCustomer: 'Select Customer',
                selectProduct: 'Select Product',
                confirmDelete: 'Are you sure you want to delete this record?',
                errorLoading: 'Error loading data',
                errorSaving: 'Error saving data',
                successCreated: 'Created successfully',
                successUpdated: 'Updated successfully',
                successDeleted: 'Deleted successfully'
            }
        };
    }

    t(key) {
        const keys = key.split('.');
        let result = this.translations[this.currentLang];
        
        for (const k of keys) {
            if (result && typeof result === 'object' && k in result) {
                result = result[k];
            } else {
                return key;
            }
        }
        
        return result || key;
    }

    setLanguage(lang) {
        if (this.translations[lang]) {
            this.currentLang = lang;
            localStorage.setItem('language', lang);
            this.updateUIText();
            return true;
        }
        return false;
    }

    getCurrentLanguage() {
        return this.currentLang;
    }

    getAvailableLanguages() {
        return Object.keys(this.translations);
    }

    updateUIText() {
        // Update all elements with data-i18n attributes
        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.getAttribute('data-i18n');
            const text = this.t(key);
            
            if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                element.placeholder = text;
            } else {
                element.textContent = text;
            }
        });

        // Update all elements with data-i18n-value attributes
        document.querySelectorAll('[data-i18n-value]').forEach(element => {
            const key = element.getAttribute('data-i18n-value');
            element.value = this.t(key);
        });

        // Update document title
        document.title = this.t('title');
    }
}

// Create global instance
const i18n = new I18n();