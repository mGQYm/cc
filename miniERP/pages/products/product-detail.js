Page({
  data: {
    product: {
      id: '',
      name: '',
      code: '',
      price: 0,
      stock: 0,
      description: '',
      image: '/images/default-product.png'
    }
  },

  onLoad: function (options) {
    const productId = options.id;
    if (productId) {
      this.loadProductDetail(productId);
    }
  },

  loadProductDetail: function(productId) {
    // 模拟加载产品详情数据
    // 实际应用中应该从后端API获取
    const mockProduct = {
      id: productId,
      name: '示例产品',
      code: 'PROD-' + productId,
      price: 99.99,
      stock: 100,
      description: '这是一个高质量的产品，具有良好的性能和用户体验。',
      image: '/images/product-sample.png'
    };
    
    this.setData({
      product: mockProduct
    });
  },

  editProduct: function() {
    wx.navigateTo({
      url: `/pages/products/product-edit?id=${this.data.product.id}`
    });
  },

  deleteProduct: function() {
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这个产品吗？此操作不可恢复。',
      success: (res) => {
        if (res.confirm) {
          // 实际应用中应该调用删除API
          wx.showToast({
            title: '删除成功',
            icon: 'success',
            duration: 2000,
            complete: () => {
              wx.navigateBack();
            }
          });
        }
      }
    });
  }
});