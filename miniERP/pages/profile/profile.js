Page({
  data: {
    userInfo: {},
    appInfo: {
      version: '1.0.0',
      name: '迷你ERP'
    },
    menuItems: [
      {
        icon: 'user-info',
        title: '个人信息',
        url: '/pages/profile/user-info'
      },
      {
        icon: 'company',
        title: '公司信息',
        url: '/pages/profile/company-info'
      },
      {
        icon: 'settings',
        title: '系统设置',
        url: '/pages/profile/settings'
      },
      {
        icon: 'help',
        title: '帮助中心',
        url: '/pages/profile/help'
      },
      {
        icon: 'about',
        title: '关于我们',
        url: '/pages/profile/about'
      }
    ]
  },

  onLoad() {
    this.loadUserInfo()
  },

  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({
        selected: 4
      })
    }
  },

  onPullDownRefresh() {
    this.loadUserInfo().finally(() => {
      wx.stopPullDownRefresh()
    })
  },

  async loadUserInfo() {
    try {
      const app = getApp()
      const userInfo = await app.request({
        url: '/user/profile'
      })
      
      this.setData({
        userInfo: userInfo
      })
    } catch (error) {
      console.error('加载用户信息失败:', error)
      wx.showToast({
        title: '加载失败',
        icon: 'none'
      })
    }
  },

  navigateToMenuItem(e) {
    const { url } = e.currentTarget.dataset
    if (url) {
      wx.navigateTo({ url })
    }
  },

  async logout() {
    try {
      const result = await wx.showModal({
        title: '退出登录',
        content: '确定要退出登录吗？',
        confirmText: '确定',
        cancelText: '取消'
      })

      if (result.confirm) {
        const app = getApp()
        await app.request({
          url: '/auth/logout',
          method: 'POST'
        })
        
        app.logout()
      }
    } catch (error) {
      console.error('退出登录失败:', error)
      wx.showToast({
        title: '操作失败',
        icon: 'none'
      })
    }
  }
})