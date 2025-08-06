Page({
  data: {
    username: '',
    password: '',
    loading: false
  },

  onLoad() {
    // 检查是否已登录
    if (getApp().globalData.isLoggedIn) {
      wx.reLaunch({
        url: '/pages/dashboard/dashboard'
      })
    }
  },

  onUsernameInput(e) {
    this.setData({
      username: e.detail.value
    })
  },

  onPasswordInput(e) {
    this.setData({
      password: e.detail.value
    })
  },

  async onLogin() {
    const { username, password } = this.data
    
    if (!username.trim()) {
      wx.showToast({
        title: '请输入用户名',
        icon: 'none'
      })
      return
    }

    if (!password.trim()) {
      wx.showToast({
        title: '请输入密码',
        icon: 'none'
      })
      return
    }

    this.setData({ loading: true })

    try {
      const app = getApp()
      await app.login(username, password)
      
      wx.showToast({
        title: '登录成功',
        icon: 'success'
      })

      setTimeout(() => {
        wx.reLaunch({
          url: '/pages/dashboard/dashboard'
        })
      }, 1500)

    } catch (error) {
      wx.showToast({
        title: error.message || '登录失败',
        icon: 'none'
      })
    } finally {
      this.setData({ loading: false })
    }
  },

  onRegister() {
    wx.showToast({
      title: '注册功能开发中',
      icon: 'none'
    })
  }
})