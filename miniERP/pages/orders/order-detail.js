Page({
  data: {
    order: {
      id: '',
      orderNumber: '',
      customerName: '',
      orderDate: '',
      status: '',
      totalAmount: 0,
      products: []
    }
  },

  onLoad: function (options) {
    const orderId = options.id;
    if (orderId) {
      this.loadOrderDetail(orderId);
    }
  },

  loadOrderDetail: function(orderId) {
    // 模拟加载订单详情数据
    const mockOrder = {
      id: orderId,
      orderNumber: 'ORD-' + Date.now(),
      customerName: '示例客户',
      orderDate: new Date().toLocaleDateString(),
      status: 'pending',
      totalAmount: 299.99,
      products: [
        {
          id: 1,
          name: '产品A',
          price: 99.99,
          quantity: 2,
          image: '/images/product-sample.png'
        },
        {
          id: 2,
          name: '产品B',
          price: 100.00,
          quantity: 1,
          image: '/images/product-sample.png'
        }
      ]
    };
    
    this.setData({
      order: mockOrder
    });
  },

  getStatusText: function(status) {
    const statusMap = {
      'pending': '待处理',
      'processing': '处理中',
      'shipped': '已发货',
      'delivered': '已送达',
      'cancelled': '已取消'
    };
    return statusMap[status] || status;
  },

  editOrder: function() {
    wx.navigateTo({
      url: `/pages/orders/order-edit?id=${this.data.order.id}`
    });
  },

  deleteOrder: function() {
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这个订单吗？此操作不可恢复。',
      success: (res) => {
        if (res.confirm) {
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