Page({
  data: {
    customers: [],
    filteredCustomers: [],
    searchKeyword: '',
    loading: true,
    hasMore: true,
    page: 1,
    pageSize: 20
  },

  onLoad() {
    this.loadCustomers()
  },

  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({
        selected: 1
      })
    }
  },

  onPullDownRefresh() {
    this.setData({ page: 1, customers: [], hasMore: true })
    this.loadCustomers().finally(() => {
      wx.stopPullDownRefresh()
    })
  },

  onReachBottom() {
    if (this.data.hasMore && !this.data.loading) {
      this.loadCustomers()
    }
  },

  async loadCustomers() {
    if (!this.data.hasMore) return

    this.setData({ loading: true })

    try {
      const app = getApp()
      const response = await app.request({
        url: '/customers',
        data: {
          page: this.data.page,
          limit: this.data.pageSize,
          search: this.data.searchKeyword
        }
      })

      const newCustomers = response.customers || []
      const total = response.total || 0

      this.setData({
        customers: [...this.data.customers, ...newCustomers],
        filteredCustomers: [...this.data.customers, ...newCustomers],
        page: this.data.page + 1,
        hasMore: this.data.customers.length + newCustomers.length < total,
        loading: false
      })
    } catch (error) {
      console.error('加载客户列表失败:', error)
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
    
    if (keyword) {
      const filtered = this.data.customers.filter(customer => 
        customer.name.toLowerCase().includes(keyword.toLowerCase()) ||
        customer.phone.includes(keyword) ||
        customer.email.toLowerCase().includes(keyword.toLowerCase())
      )
      this.setData({ filteredCustomers: filtered })
    } else {
      this.setData({ filteredCustomers: this.data.customers })
    }
  },

  clearSearch() {
    this.setData({
      searchKeyword: '',
      filteredCustomers: this.data.customers
    })
  },

  navigateToCustomerDetail(e) {
    const { id } = e.currentTarget.dataset
    wx.navigateTo({
      url: `/pages/customers/customer-detail?id=${id}`
    })
  },

  navigateToCreateCustomer() {
    wx.navigateTo({
      url: '/pages/customers/customer-detail'
    })
  },

  callCustomer(e) {
    const { phone } = e.currentTarget.dataset
    if (phone) {
      wx.makePhoneCall({
        phoneNumber: phone
      })
    }
  },

  refreshData() {
    this.setData({
      customers: [],
      filteredCustomers: [],
      page: 1,
      hasMore: true
    })
    this.loadCustomers()
  }
})