// UI管理器 - 处理所有界面交互和对话框
class UIManager {
  constructor() {
    this.dialogQueue = []
    this.isDialogShowing = false
    this.gameInstance = null
  }

  // 设置游戏实例
  setGameInstance(game) {
    this.gameInstance = game
  }

  // 显示游戏结果对话框
  showGameResult(isWin, levelData) {
    const { level, totalCells, visitedCells } = levelData
    
    if (isWin) {
      this.showSuccessDialog(level, totalCells)
    } else {
      this.showFailDialog(level, totalCells - visitedCells)
    }
  }

  // 显示成功对话框
  showSuccessDialog(level, totalCells) {
    const nextLevel = level + 1
    const isMaxLevel = nextLevel > 100
    
    const content = isMaxLevel 
      ? `恭喜！你已经完成了所有100关！\n\n总格子数：${totalCells}`
      : `恭喜通关第${level}关！\n\n总格子数：${totalCells}\n用时：${this.getPlayTime()}`

    wx.showModal({
      title: '🎉 通关成功！',
      content,
      showCancel: !isMaxLevel,
      cancelText: '重玩本关',
      confirmText: isMaxLevel ? '重新开始' : '下一关',
      confirmColor: '#007aff',
      success: (res) => {
        if (res.confirm) {
          if (isMaxLevel) {
            this.gameInstance?.restartGame()
          } else {
            this.gameInstance?.nextLevel()
          }
        } else {
          this.gameInstance?.resetLevel()
        }
      }
    })
  }

  // 显示失败对话框
  showFailDialog(level, remainingCells) {
    wx.showModal({
      title: '😅 游戏失败',
      content: `第${level}关未完成！\n\n还有 ${remainingCells} 个格子未走过\n请尝试找到完整路径`,
      showCancel: true,
      cancelText: '返回主界面',
      confirmText: '重试',
      confirmColor: '#ff3b30',
      success: (res) => {
        if (res.confirm) {
          this.gameInstance?.resetLevel()
        } else {
          // 返回主界面逻辑（如果有）
          this.gameInstance?.returnToMain()
        }
      }
    })
  }

  // 显示提示对话框
  showHintDialog() {
    const hints = [
      '从起点开始，每个格子只能走一次',
      '只能上下左右移动，不能斜向移动',
      '必须走过所有格子才能到达终点',
      '点击模式：逐格点击移动',
      '拖拽模式：按住并拖拽连续移动'
    ]
    
    const randomHint = hints[Math.floor(Math.random() * hints.length)]
    
    wx.showToast({
      title: randomHint,
      icon: 'none',
      duration: 2000
    })
  }

  // 显示设置对话框
  showSettingsDialog() {
    const items = ['点击模式', '拖拽模式', '音效开关', '游戏规则', '关于我们']
    
    wx.showActionSheet({
      itemList: items,
      success: (res) => {
        switch (res.tapIndex) {
          case 0:
            this.gameInstance?.setInteractionMode('click')
            break
          case 1:
            this.gameInstance?.setInteractionMode('drag')
            break
          case 2:
            this.gameInstance?.toggleSound()
            break
          case 3:
            this.showRulesDialog()
            break
          case 4:
            this.showAboutDialog()
            break
        }
      }
    })
  }

  // 显示游戏规则
  showRulesDialog() {
    const rules = `
游戏规则：

1. 从绿色起点开始，到红色终点结束
2. 每个格子只能走一次，不能重复
3. 只能上下左右移动一格，不能斜向移动
4. 必须走过所有格子才能获胜
5. 点击模式：逐格点击移动
6. 拖拽模式：按住并拖拽连续移动

提示：关卡会越来越大，难度逐渐增加！
    `
    
    wx.showModal({
      title: '游戏规则',
      content: rules.trim(),
      showCancel: false,
      confirmText: '知道了'
    })
  }

  // 显示关于对话框
  showAboutDialog() {
    const about = `
路径迷宫 v1.0.0

一个考验逻辑思维的益智游戏
通过规划完美路径来挑战自己

开发者：路径迷宫团队
联系邮箱：contact@pathmaze.com
    `
    
    wx.showModal({
      title: '关于游戏',
      content: about.trim(),
      showCancel: false,
      confirmText: '关闭'
    })
  }

  // 显示关卡选择器
  showLevelSelector() {
    const levels = []
    for (let i = 1; i <= 20; i++) {
      levels.push(`第${i}关`)
    }
    
    wx.showActionSheet({
      itemList: levels,
      success: (res) => {
        const level = res.tapIndex + 1
        this.gameInstance?.loadLevel(level)
      }
    })
  }

  // 显示进度条
  showProgressBar() {
    if (this.progressBar) return
    
    this.progressBar = wx.createSelectorQuery()
    this.progressBar.select('#progress-bar').boundingClientRect()
    this.progressBar.exec()
  }

  // 更新进度条
  updateProgress(progress) {
    this.emit('progressUpdate', { progress })
  }

  // 显示成就解锁
  showAchievement(achievement) {
    wx.showToast({
      title: `🏆 ${achievement}`,
      icon: 'success',
      duration: 3000
    })
  }

  // 获取游戏时长
  getPlayTime() {
    if (!this.gameInstance) return '0秒'
    
    const startTime = this.gameInstance.startTime || Date.now()
    const duration = Math.floor((Date.now() - startTime) / 1000)
    
    if (duration < 60) {
      return `${duration}秒`
    } else {
      const minutes = Math.floor(duration / 60)
      const seconds = duration % 60
      return `${minutes}分${seconds}秒`
    }
  }

  // 显示分享提示
  showShareTip() {
    wx.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage', 'shareTimeline']
    })
    
    wx.showToast({
      title: '分享给好友一起挑战！',
      icon: 'none',
      duration: 2000
    })
  }

  // 事件系统
  on(eventName, callback) {
    if (!this.events) this.events = {}
    if (!this.events[eventName]) this.events[eventName] = []
    this.events[eventName].push(callback)
  }

  emit(eventName, data) {
    if (this.events && this.events[eventName]) {
      this.events[eventName].forEach(callback => callback(data))
    }
  }

  // 显示加载动画
  showLoading(title = '加载中...') {
    wx.showLoading({
      title,
      mask: true
    })
  }

  // 隐藏加载动画
  hideLoading() {
    wx.hideLoading()
  }

  // 显示操作反馈
  showFeedback(message, type = 'success') {
    wx.showToast({
      title: message,
      icon: type,
      duration: 2000
    })
  }
}

module.exports = UIManager