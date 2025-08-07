App({
  globalData: {
    userInfo: { name: '管理员', role: 'admin' },
    isLoggedIn: true,
    baseUrl: 'https://your-api-domain.com/api',
    version: '1.0.0'
  },

  onLaunch() {
    console.log('小程序启动')
    this.checkLoginStatus()
  },

  checkLoginStatus() {
    // 跳过登录验证，直接设置为已登录
    this.globalData.isLoggedIn = true
    this.globalData.userInfo = { name: '管理员', role: 'admin' }
  },

  validateToken(token) {
    // 跳过token验证
    this.globalData.isLoggedIn = true
    this.globalData.userInfo = { name: '管理员', role: 'admin' }
  },

  login(username, password) {
    return new Promise((resolve) => {
      // 跳过登录验证，直接成功
      this.globalData.isLoggedIn = true
      this.globalData.userInfo = { name: username || '管理员', role: 'admin' }
      resolve({ user: this.globalData.userInfo })
    })
  },

  logout() {
    // 跳过登出，直接返回首页
    this.globalData.isLoggedIn = true
    this.globalData.userInfo = { name: '管理员', role: 'admin' }
    wx.reLaunch({
      url: '/pages/dashboard/dashboard'
    })
  },

  request(options) {
    return new Promise((resolve, reject) => {
      wx.request({
        url: `${this.globalData.baseUrl}${options.url}`,
        method: options.method || 'GET',
        data: options.data || {},
        header: {
          'Content-Type': 'application/json',
          ...options.header
        },
        success: (res) => {
          if (res.statusCode === 200) {
            resolve(res.data)
          } else {
            reject(new Error(res.data.message || '请求失败'))
          }
        },
        fail: reject
      })
    })
  }
})