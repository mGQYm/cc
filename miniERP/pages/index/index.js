Page({
  onLoad() {
    const app = getApp()
    if (app.globalData.isLoggedIn) {
      wx.reLaunch({
        url: '/pages/dashboard/dashboard'
      })
    } else {
      wx.reLaunch({
        url: '/pages/login/login'
      })
    }
  }
})