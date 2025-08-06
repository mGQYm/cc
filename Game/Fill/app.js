App({
  onLaunch() {
    console.log('游戏启动')
  },
  
  onShow() {
    console.log('游戏显示')
  },
  
  onHide() {
    console.log('游戏隐藏')
  },
  
  onError(msg) {
    console.log('游戏错误:', msg)
  }
})