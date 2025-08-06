Page({
  data: {
    customer: {
      id: '',
      name: '',
      phone: '',
      email: '',
      address: '',
      notes: ''
    }
  },

  onLoad: function (options) {
    const customerId = options.id;
    if (customerId) {
      this.loadCustomerDetail(customerId);
    }
  },

  loadCustomerDetail: function(customerId) {
    // 模拟加载客户详情数据
    // 实际应用中应该从后端API获取
    const mockCustomer = {
      id: customerId,
      name: '示例客户',
      phone: '13800138000',
      email: 'example@company.com',
      address: '北京市朝阳区某某大厦',
      notes: '这是一个重要的客户，需要特别关注'
    };
    
    this.setData({
      customer: mockCustomer
    });
  },

  editCustomer: function() {
    wx.navigateTo({
      url: `/pages/customers/customer-edit?id=${this.data.customer.id}`
    });
  },

  deleteCustomer: function() {
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这个客户吗？此操作不可恢复。',
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