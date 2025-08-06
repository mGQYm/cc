Page({
  data: {
    products: [],
    filteredProducts: [],
    categories: [],
    selectedCategory: 'all',
    searchKeyword: '',
    loading: true,
    hasMore: true,
    page: 1,
    pageSize: 20,
    sortBy: 'name',
    sortOrder: 'asc'
  },

  onLoad() {
    this.loadCategories()
    this.loadProducts()
  },

  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({
        selected: 2
      })
    }
  },

  onPullDownRefresh() {
    this.setData({ 
      page: 1, 
      products: [], 
      hasMore: true,
      filteredProducts: []
    })
    Promise.all([this.loadCategories(), this.loadProducts()])
      .finally(() => {
        wx.stopPullDownRefresh()
      })
  },

  onReachBottom() {
    if (this.data.hasMore && !this.data.loading) {
      this.loadProducts()
    }
  },

  async loadCategories() {
    try {
      const app = getApp()
      const response = await app.request({
        url: '/products/categories'
      })
      
      this.setData({
        categories: [{ id: 'all', name: '全部' }, ...response]
      })
    } catch (error) {
      console.error('加载分类失败:', error)
    }
  },

  async loadProducts() {
    if (!this.data.hasMore) return

    this.setData({ loading: true })

    try {
      const app = getApp()
      const response = await app.request({
        url: '/products',
        data: {
          page: this.data.page,
          limit: this.data.pageSize,
          category: this.data.selectedCategory === 'all' ? '' : this.data.selectedCategory,
          search: this.data.searchKeyword,
          sortBy: this.data.sortBy,
          sortOrder: this.data.sortOrder
        }
      })

      const newProducts = response.products || []
      const total = response.total || 0

      this.setData({
        products: [...this.data.products, ...newProducts],
        filteredProducts: [...this.data.products, ...newProducts],
        page: this.data.page + 1,
        hasMore: this.data.products.length + newProducts.length < total,
        loading: false
      })
    } catch (error) {
      console.error('加载产品列表失败:', error)
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
    this.filterProducts()
  },

  clearSearch() {
    this.setData({
      searchKeyword: '',
      filteredProducts: this.data.products
    })
  },

  onCategoryChange(e) {
    const category = e.currentTarget.dataset.category
    this.setData({
      selectedCategory: category,
      page: 1,
      products: [],
      filteredProducts: [],
      hasMore: true
    })
    this.loadProducts()
  },

  filterProducts() {
    const { products, searchKeyword, selectedCategory } = this.data
    
    let filtered = [...products]
    
    if (searchKeyword) {
      filtered = filtered.filter(product => 
        product.name.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        product.code.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        product.description.toLowerCase().includes(searchKeyword.toLowerCase())
      )
    }
    
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(product => product.categoryId === selectedCategory)
    }
    
    this.setData({ filteredProducts: filtered })
  },

  navigateToProductDetail(e) {
    const { id } = e.currentTarget.dataset
    wx.navigateTo({
      url: `/pages/products/product-detail?id=${id}`
    })
  },

  navigateToCreateProduct() {
    wx.navigateTo({
      url: '/pages/products/product-detail'
    })
  },

  refreshData() {
    this.setData({
      products: [],
      filteredProducts: [],
      page: 1,
      hasMore: true
    })
    this.loadProducts()
  },

  onSortChange(e) {
    const { sortBy } = e.currentTarget.dataset
    const newSortOrder = this.data.sortBy === sortBy && this.data.sortOrder === 'asc' ? 'desc' : 'asc'
    
    this.setData({
      sortBy,
      sortOrder: newSortOrder,
      page: 1,
      products: [],
      filteredProducts: [],
      hasMore: true
    })
    this.loadProducts()
  }
})