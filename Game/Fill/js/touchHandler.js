// 触摸事件处理器 - 支持点击和拖拽两种模式
class TouchHandler {
  constructor(gameLogic, canvas) {
    this.gameLogic = gameLogic
    this.canvas = canvas
    this.state = {
      isTouching: false,
      startTime: 0,
      startPos: null,
      lastPos: null,
      currentMode: 'click',
      dragThreshold: 10, // 像素
      tapTimeout: 200, // 毫秒
      lastTapTime: 0,
      doubleTapInterval: 300,
      hapticFeedbackEnabled: true
    }
  }

  // 设置交互模式
  setInteractionMode(mode) {
    if (mode === 'click' || mode === 'drag') {
      this.state.currentMode = mode
      this.resetTouchState()
    }
  }

  // 重置触摸状态
  resetTouchState() {
    this.state.isTouching = false
    this.state.startPos = null
    this.state.lastPos = null
  }

  // 处理触摸开始事件
  handleTouchStart(e) {
    const touch = e.touches[0]
    const cell = this.gameLogic.getCellFromPosition(touch.clientX, touch.clientY)
    
    if (!cell) return

    this.state.isTouching = true
    this.state.startTime = Date.now()
    this.state.startPos = { x: touch.clientX, y: touch.clientY, cell }
    this.state.lastPos = { x: touch.clientX, y: touch.clientY }

    // 双击检测
    const now = Date.now()
    if (now - this.state.lastTapTime < this.state.doubleTapInterval) {
      this.handleDoubleTap(cell)
      this.state.lastTapTime = 0
      return
    }

    // 根据模式处理
    if (this.state.currentMode === 'click') {
      this.handleClickStart(cell)
    } else if (this.state.currentMode === 'drag') {
      this.handleDragStart(cell)
    }

    // 触发触摸反馈
    if (this.state.hapticFeedbackEnabled) {
      this.triggerHapticFeedback('light')
    }
  }

  // 处理触摸移动事件
  handleTouchMove(e) {
    if (!this.state.isTouching) return

    const touch = e.touches[0]
    const currentCell = this.gameLogic.getCellFromPosition(touch.clientX, touch.clientY)
    
    if (!currentCell) return

    const distance = this.calculateDistance(
      touch.clientX, touch.clientY,
      this.state.startPos.x, this.state.startPos.y
    )

    // 拖拽模式处理
    if (this.state.currentMode === 'drag') {
      if (distance > this.state.dragThreshold) {
        this.handleDragMove(currentCell)
      }
    }

    this.state.lastPos = { x: touch.clientX, y: touch.clientY, cell: currentCell }
  }

  // 处理触摸结束事件
  handleTouchEnd(e) {
    if (!this.state.isTouching) return

    const touch = e.changedTouches[0]
    const endCell = this.gameLogic.getCellFromPosition(touch.clientX, touch.clientY)
    
    const duration = Date.now() - this.state.startTime
    const distance = this.calculateDistance(
      touch.clientX, touch.clientY,
      this.state.startPos.x, this.state.startPos.y
    )

    if (this.state.currentMode === 'click') {
      if (duration < this.state.tapTimeout && distance < this.state.dragThreshold) {
        this.handleClick(endCell)
      }
    } else if (this.state.currentMode === 'drag') {
      this.handleDragEnd(endCell)
    }

    this.state.isTouching = false
    this.state.lastTapTime = Date.now()
  }

  // 处理触摸取消事件
  handleTouchCancel(e) {
    this.resetTouchState()
  }

  // 点击模式开始
  handleClickStart(cell) {
    // 高亮显示当前格子
    this.highlightCell(cell, 'preview')
  }

  // 点击模式处理
  handleClick(cell) {
    const moved = this.gameLogic.moveToCell(cell)
    if (moved) {
      this.triggerHapticFeedback('medium')
      this.showClickAnimation(cell)
    } else {
      this.showInvalidMoveFeedback(cell)
    }
  }

  // 拖拽模式开始
  handleDragStart(cell) {
    // 检查是否可以开始拖拽
    const lastPos = this.gameLogic.getLastPosition()
    if (lastPos.x === cell.x && lastPos.y === cell.y) {
      this.highlightCell(cell, 'drag-start')
    }
  }

  // 拖拽模式移动
  handleDragMove(cell) {
    const moved = this.gameLogic.moveToCell(cell)
    if (moved) {
      this.highlightCell(cell, 'drag-path')
      this.triggerHapticFeedback('light')
    }
  }

  // 拖拽模式结束
  handleDragEnd(cell) {
    this.clearHighlights()
    this.triggerHapticFeedback('medium')
  }

  // 双击处理
  handleDoubleTap(cell) {
    // 双击撤销最后一步
    const undone = this.gameLogic.undoLastMove()
    if (undone) {
      this.showUndoAnimation()
      this.triggerHapticFeedback('heavy')
    }
  }

  // 长按处理
  handleLongPress(cell) {
    // 显示操作菜单
    const menuItems = ['撤销上一步', '重置关卡', '查看提示']
    
    wx.showActionSheet({
      itemList: menuItems,
      success: (res) => {
        switch (res.tapIndex) {
          case 0:
            this.gameLogic.undoLastMove()
            break
          case 1:
            this.gameLogic.resetLevel()
            break
          case 2:
            this.gameLogic.showHint()
            break
        }
      }
    })
  }

  // 计算两点距离
  calculateDistance(x1, y1, x2, y2) {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2))
  }

  // 高亮显示格子
  highlightCell(cell, type) {
    // 通过事件系统通知渲染器高亮显示
    this.emit('cellHighlight', { cell, type })
  }

  // 清除高亮
  clearHighlights() {
    this.emit('clearHighlights')
  }

  // 显示点击动画
  showClickAnimation(cell) {
    this.emit('animation', {
      type: 'click',
      cell,
      duration: 300
    })
  }

  // 显示撤销动画
  showUndoAnimation() {
    this.emit('animation', {
      type: 'undo',
      duration: 200
    })
  }

  // 显示无效移动反馈
  showInvalidMoveFeedback(cell) {
    this.emit('animation', {
      type: 'invalid',
      cell,
      duration: 200
    })
    
    wx.showToast({
      title: '无效移动',
      icon: 'error',
      duration: 1000
    })
  }

  // 触发触觉反馈
  triggerHapticFeedback(type) {
    if (!this.state.hapticFeedbackEnabled) return
    
    try {
      switch (type) {
        case 'light':
          wx.vibrateShort({ type: 'light' })
          break
        case 'medium':
          wx.vibrateShort({ type: 'medium' })
          break
        case 'heavy':
          wx.vibrateShort({ type: 'heavy' })
          break
      }
    } catch (e) {
      // 忽略不支持触觉反馈的设备
    }
  }

  // 设置触觉反馈开关
  setHapticFeedback(enabled) {
    this.state.hapticFeedbackEnabled = enabled
  }

  // 启用/禁用触摸事件
  enableTouchEvents() {
    wx.onTouchStart(this.handleTouchStart.bind(this))
    wx.onTouchMove(this.handleTouchMove.bind(this))
    wx.onTouchEnd(this.handleTouchEnd.bind(this))
    wx.onTouchCancel(this.handleTouchCancel.bind(this))
  }

  disableTouchEvents() {
    wx.offTouchStart()
    wx.offTouchMove()
    wx.offTouchEnd()
    wx.offTouchCancel()
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

  // 获取当前模式
  getInteractionMode() {
    return this.state.currentMode
  }

  // 获取触摸状态
  getTouchState() {
    return {
      ...this.state,
      isActive: this.state.isTouching
    }
  }
}

// 导出单例
let touchHandler = null

function getTouchHandler(gameLogic, canvas) {
  if (!touchHandler) {
    touchHandler = new TouchHandler(gameLogic, canvas)
  }
  return touchHandler
}

module.exports = {
  TouchHandler,
  getTouchHandler
}