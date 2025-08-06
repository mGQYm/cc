App({
  globalData: {
    userInfo: null,
    isLoggedIn: false,
    baseUrl: 'https://your-api-domain.com/api',
    version: '1.0.0'
  },

  onLaunch() {
    console.log('小程序启动')
    this.checkLoginStatus()
  },

  checkLoginStatus() {
    const token = wx.getStorageSync('token')
    if (token) {
      this.validateToken(token)
    }
  },

  validateToken(token) {
    wx.request({
      url: `${this.globalData.baseUrl}/auth/validate`,
      method: 'POST',
      header: {
        'Authorization': `Bearer ${token}`
      },
      success: (res) => {
        if (res.statusCode === 200) {
          this.globalData.isLoggedIn = true
          this.globalData.userInfo = res.data.user
        } else {
          wx.removeStorageSync('token')
        }
      }
    })
  },

  login(username, password) {
    return new Promise((resolve, reject) => {
      wx.request({
        url: `${this.globalData.baseUrl}/auth/login`,
        method: 'POST',
        data: { username, password },
        success: (res) => {
          if (res.statusCode === 200) {
            const { token, user } = res.data
            wx.setStorageSync('token', token)
            this.globalData.isLoggedIn = true
            this.globalData.userInfo = user
            resolve(res.data)
          } else {
            reject(res.data.message || '登录失败')
          }
        },
        fail: reject
      })
    })
  },

  logout() {
    wx.removeStorageSync('token')
    this.globalData.isLoggedIn = false
    this.globalData.userInfo = null
    wx.reLaunch({
      url: '/pages/login/login'
    })
  },

  request(options) {
    const token = wx.getStorageSync('token')
    return new Promise((resolve, reject) => {
      wx.request({
        url: `${this.globalData.baseUrl}${options.url}`,
        method: options.method || 'GET',
        data: options.data || {},
        header: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
          ...options.header
        },
        success: (res) => {
          if (res.statusCode === 200) {
            resolve(res.data)
          } else if (res.statusCode === 401) {
            this.logout()
            reject(new Error('登录已过期'))
          } else {
            reject(new Error(res.data.message || '请求失败'))
          }
        },
        fail: reject
      })
    })
  }
})