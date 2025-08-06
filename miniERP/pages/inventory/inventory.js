Page({
  data: {
    inventory: [],
    filteredInventory: [],
    searchKeyword: '',
    filterType: 'all',
    totalProducts: 0,
    lowStockProducts: 0,
    outOfStockProducts: 0
  },

  onLoad: function () {
    this.loadInventory();
  },

  onShow: function () {
    this.loadInventory();
  },

  loadInventory: function() {
    // 模拟加载库存数据
    const mockInventory = [
      {
        id: 1,
        name: '产品A',
        code: 'PROD-001',
        price: 99.99,
        stock: 150,
        image: '/images/product-sample.png'
      },
      {
        id: 2,
        name: '产品B',
        code: 'PROD-002',
        price: 149.99,
        stock: 8,
        image: '/images/product-sample.png'
      },
      {
        id: 3,
        name: '产品C',
        code: 'PROD-003',
        price: 199.99,
        stock: 0,
        image: '/images/product-sample.png'
      },
      {
        id: 4,
        name: '产品D',
        code: 'PROD-004',
        price: 79.99,
        stock: 25,
        image: '/images/product-sample.png'
      }
    ];

    const totalProducts = mockInventory.length;
    const lowStockProducts = mockInventory.filter(item => item.stock > 0 && item.stock <= 10).length;
    const outOfStockProducts = mockInventory.filter(item => item.stock === 0).length;

    this.setData({
      inventory: mockInventory,
      filteredInventory: mockInventory,
      totalProducts,
      lowStockProducts,
      outOfStockProducts
    });
  },

  onSearchInput: function(e) {
    this.setData({
      searchKeyword: e.detail.value
    });
  },

  searchInventory: function() {
    const keyword = this.data.searchKeyword.toLowerCase();
    const filtered = this.data.inventory.filter(item => 
      item.name.toLowerCase().includes(keyword) || 
      item.code.toLowerCase().includes(keyword)
    );
    
    this.setData({
      filteredInventory: filtered
    });
  },

  setFilter: function(e) {
    const type = e.currentTarget.dataset.type;
    let filtered = this.data.inventory;

    switch (type) {
      case 'low':
        filtered = this.data.inventory.filter(item => item.stock > 0 && item.stock <= 10);
        break;
      case 'out':
        filtered = this.data.inventory.filter(item => item.stock === 0);
        break;
      default:
        filtered = this.data.inventory;
    }

    this.setData({
      filterType: type,
      filteredInventory: filtered
    });
  },

  getStockClass: function(stock) {
    if (stock === 0) return 'out-of-stock';
    if (stock <= 10) return 'low-stock';
    return 'normal-stock';
  },

  adjustStock: function(e) {
    const productId = e.currentTarget.dataset.id;
    const product = this.data.inventory.find(item => item.id === productId);

    wx.showModal({
      title: '调整库存',
      content: `当前${product.name}库存：${product.stock}件`,
      editable: true,
      placeholderText: '请输入新的库存数量',
      success: (res) => {
        if (res.confirm && res.content) {
          const newStock = parseInt(res.content);
          if (!isNaN(newStock) && newStock >= 0) {
            // 模拟更新库存
            const updatedInventory = this.data.inventory.map(item => {
              if (item.id === productId) {
                return { ...item, stock: newStock };
              }
              return item;
            });

            this.setData({
              inventory: updatedInventory,
              filteredInventory: updatedInventory
            });

            wx.showToast({
              title: '库存已更新',
              icon: 'success'
            });

            this.updateStats();
          } else {
            wx.showToast({
              title: '请输入有效的库存数量',
              icon: 'none'
            });
          }
        }
      }
    });
  },

  updateStats: function() {
    const totalProducts = this.data.inventory.length;
    const lowStockProducts = this.data.inventory.filter(item => item.stock > 0 && item.stock <= 10).length;
    const outOfStockProducts = this.data.inventory.filter(item => item.stock === 0).length;

    this.setData({
      totalProducts,
      lowStockProducts,
      outOfStockProducts
    });
  }
});