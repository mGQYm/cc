Page({
  data: {
    statistics: {
      totalCustomers: 0,
      totalProducts: 0,
      totalOrders: 0,
      totalRevenue: 0,
      pendingOrders: 0,
      lowStockProducts: 0
    },
    recentOrders: [],
    recentCustomers: [],
    loading: true
  },

  onLoad() {
    this.loadDashboardData()
  },

  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({
        selected: 0
      })
    }
  },

  onPullDownRefresh() {
    this.loadDashboardData().finally(() => {
      wx.stopPullDownRefresh()
    })
  },

  async loadDashboardData() {
    try {
      const app = getApp()
      const [stats, orders, customers] = await Promise.all([
        app.request({ url: '/dashboard/statistics' }),
        app.request({ url: '/orders/recent' }),
        app.request({ url: '/customers/recent' })
      ])

      this.setData({
        statistics: stats,
        recentOrders: orders,
        recentCustomers: customers,
        loading: false
      })
    } catch (error) {
      console.error('加载仪表板数据失败:', error)
      this.setData({ loading: false })
      wx.showToast({
        title: '加载失败',
        icon: 'none'
      })
    }
  },

  navigateToCustomers() {
    wx.switchTab({
      url: '/pages/customers/customers'
    })
  },

  navigateToProducts() {
    wx.switchTab({
      url: '/pages/products/products'
    })
  },

  navigateToOrders() {
    wx.switchTab({
      url: '/pages/orders/orders'
    })
  },

  navigateToOrderDetail(e) {
    const { id } = e.currentTarget.dataset
    wx.navigateTo({
      url: `/pages/orders/order-detail?id=${id}`
    })
  },

  navigateToCustomerDetail(e) {
    const { id } = e.currentTarget.dataset
    wx.navigateTo({
      url: `/pages/customers/customer-detail?id=${id}`
    })
  },

  createOrder() {
    wx.navigateTo({
      url: '/pages/orders/order-create'
    })
  }
})