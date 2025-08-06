Page({
  data: {
    orders: [],
    filteredOrders: [],
    searchKeyword: '',
    statusFilter: 'all',
    dateFilter: 'all',
    loading: true,
    hasMore: true,
    page: 1,
    pageSize: 20,
    statusOptions: [
      { value: 'all', label: '全部' },
      { value: 'pending', label: '待处理' },
      { value: 'processing', label: '处理中' },
      { value: 'shipped', label: '已发货' },
      { value: 'completed', label: '已完成' },
      { value: 'cancelled', label: '已取消' }
    ],
    dateOptions: [
      { value: 'all', label: '全部' },
      { value: 'today', label: '今天' },
      { value: 'week', label: '本周' },
      { value: 'month', label: '本月' }
    ]
  },

  onLoad() {
    this.loadOrders()
  },

  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({
        selected: 3
      })
    }
  },

  onPullDownRefresh() {
    this.setData({ 
      page: 1, 
      orders: [], 
      hasMore: true,
      filteredOrders: []
    })
    this.loadOrders().finally(() => {
      wx.stopPullDownRefresh()
    })
  },

  onReachBottom() {
    if (this.data.hasMore && !this.data.loading) {
      this.loadOrders()
    }
  },

  async loadOrders() {
    if (!this.data.hasMore) return

    this.setData({ loading: true })

    try {
      const app = getApp()
      const response = await app.request({
        url: '/orders',
        data: {
          page: this.data.page,
          limit: this.data.pageSize,
          search: this.data.searchKeyword,
          status: this.data.statusFilter === 'all' ? '' : this.data.statusFilter,
          date: this.data.dateFilter,
          sortBy: 'createdAt',
          sortOrder: 'desc'
        }
      })

      const newOrders = response.orders || []
      const total = response.total || 0

      this.setData({
        orders: [...this.data.orders, ...newOrders],
        filteredOrders: [...this.data.orders, ...newOrders],
        page: this.data.page + 1,
        hasMore: this.data.orders.length + newOrders.length < total,
        loading: false
      })
    } catch (error) {
      console.error('加载订单列表失败:', error)
      this.setData({ loading: false })
      wx.showToast({
        title: '加载失败',
        icon: 'none'
      })
    }
  },

  onSearchInput(e) {
    const keyword = e.detail.value.trim()
    this.setData({ searchKeyword: keyword })
    this.filterOrders()
  },

  clearSearch() {
    this.setData({
      searchKeyword: '',
      filteredOrders: this.data.orders
    })
  },

  onStatusFilterChange(e) {
    const status = e.currentTarget.dataset.status
    this.setData({
      statusFilter: status,
      page: 1,
      orders: [],
      filteredOrders: [],
      hasMore: true
    })
    this.loadOrders()
  },

  onDateFilterChange(e) {
    const date = e.currentTarget.dataset.date
    this.setData({
      dateFilter: date,
      page: 1,
      orders: [],
      filteredOrders: [],
      hasMore: true
    })
    this.loadOrders()
  },

  filterOrders() {
    const { orders, searchKeyword, statusFilter, dateFilter } = this.data
    
    let filtered = [...orders]
    
    if (searchKeyword) {
      filtered = filtered.filter(order => 
        order.orderNumber.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        order.customer.name.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        order.customer.phone.includes(searchKeyword)
      )
    }
    
    this.setData({ filteredOrders: filtered })
  },

  navigateToOrderDetail(e) {
    const { id } = e.currentTarget.dataset
    wx.navigateTo({
      url: `/pages/orders/order-detail?id=${id}`
    })
  },

  navigateToCreateOrder() {
    wx.navigateTo({
      url: '/pages/orders/order-create'
    })
  },

  refreshData() {
    this.setData({
      orders: [],
      filteredOrders: [],
      page: 1,
      hasMore: true
    })
    this.loadOrders()
  },

  callCustomer(e) {
    const { phone } = e.currentTarget.dataset
    if (phone) {
      wx.makePhoneCall({
        phoneNumber: phone
      })
    }
  }
})