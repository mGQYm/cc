Page({
  data: {
    customers: [],
    selectedCustomerIndex: -1,
    selectedCustomerName: '',
    selectedCustomerId: '',
    products: [],
    selectedProducts: [],
    notes: '',
    canSubmit: false
  },

  onLoad: function () {
    this.loadCustomers();
    this.loadProducts();
  },

  loadCustomers: function() {
    // 模拟加载客户列表
    const mockCustomers = [
      { id: 1, name: '客户A', phone: '13800138001' },
      { id: 2, name: '客户B', phone: '13800138002' },
      { id: 3, name: '客户C', phone: '13800138003' }
    ];
    
    this.setData({
      customers: mockCustomers
    });
  },

  loadProducts: function() {
    // 模拟加载产品列表
    const mockProducts = [
      { id: 1, name: '产品A', price: 99.99, stock: 100 },
      { id: 2, name: '产品B', price: 149.99, stock: 50 },
      { id: 3, name: '产品C', price: 199.99, stock: 75 }
    ];
    
    this.setData({
      products: mockProducts
    });
  },

  // 计算属性
  get totalQuantity() {
    return this.data.selectedProducts.reduce((total, product) => total + product.quantity, 0);
  },

  get totalAmount() {
    return this.data.selectedProducts.reduce((total, product) => total + (product.price * product.quantity), 0).toFixed(2);
  },

  selectCustomer: function(e) {
    const index = e.detail.value;
    const customer = this.data.customers[index];
    
    this.setData({
      selectedCustomerIndex: index,
      selectedCustomerName: customer.name,
      selectedCustomerId: customer.id
    });
    
    this.checkCanSubmit();
  },

  addProduct: function() {
    const availableProducts = this.data.products.filter(product => 
      !this.data.selectedProducts.some(selected => selected.id === product.id)
    );
    
    if (availableProducts.length === 0) {
      wx.showToast({
        title: '没有可选的商品',
        icon: 'none'
      });
      return;
    }
    
    wx.showActionSheet({
      itemList: availableProducts.map(p => p.name + ' - ¥' + p.price),
      success: (res) => {
        const selectedProduct = availableProducts[res.tapIndex];
        const newProduct = {
          ...selectedProduct,
          quantity: 1
        };
        
        this.setData({
          selectedProducts: [...this.data.selectedProducts, newProduct]
        });
        
        this.checkCanSubmit();
      }
    });
  },

  increaseQuantity: function(e) {
    const index = e.currentTarget.dataset.index;
    const products = [...this.data.selectedProducts];
    
    if (products[index].quantity < products[index].stock) {
      products[index].quantity++;
      this.setData({
        selectedProducts: products
      });
    }
  },

  decreaseQuantity: function(e) {
    const index = e.currentTarget.dataset.index;
    const products = [...this.data.selectedProducts];
    
    if (products[index].quantity > 1) {
      products[index].quantity--;
      this.setData({
        selectedProducts: products
      });
    } else {
      wx.showModal({
        title: '确认删除',
        content: '是否移除该商品？',
        success: (res) => {
          if (res.confirm) {
            products.splice(index, 1);
            this.setData({
              selectedProducts: products
            });
            this.checkCanSubmit();
          }
        }
      });
    }
  },

  onNotesInput: function(e) {
    this.setData({
      notes: e.detail.value
    });
  },

  checkCanSubmit: function() {
    const canSubmit = this.data.selectedCustomerId && 
                     this.data.selectedProducts.length > 0;
    
    this.setData({
      canSubmit: canSubmit
    });
  },

  submitOrder: function(e) {
    if (!this.data.canSubmit) {
      return;
    }
    
    const orderData = {
      customerId: this.data.selectedCustomerId,
      products: this.data.selectedProducts,
      notes: this.data.notes,
      totalAmount: this.data.totalAmount,
      totalQuantity: this.data.totalQuantity
    };
    
    console.log('创建订单:', orderData);
    
    // 模拟创建订单成功
    wx.showToast({
      title: '订单创建成功',
      icon: 'success',
      duration: 2000,
      complete: () => {
        wx.navigateBack();
      }
    });
  },

  onUnload: function() {
    // 页面卸载时的清理工作
  }
});