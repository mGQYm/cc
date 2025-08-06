// 游戏逻辑核心类
class GameLogic {
  constructor(canvas, context) {
    this.canvas = canvas
    this.context = context
    this.levelGenerator = new (require('../utils/pathfinder.js').LevelGenerator)()
    
    this.config = {
      maxGridSize: 30,
      minGridSize: 5,
      cellSize: 30,
      padding: 20
    }
    
    this.state = {
      grid: [],
      width: 0,
      height: 0,
      startPos: null,
      endPos: null,
      currentPath: [],
      visitedCells: new Set(),
      interactionMode: 'click', // 'click' 或 'drag'
      currentLevel: 1,
      maxLevel: 100,
      isGameActive: true,
      dragStartPos: null,
      lastDragCell: null
    }
  }

  // 初始化游戏
  initGame() {
    this.resizeCanvas()
    this.loadLevel(this.state.currentLevel)
    this.setupEventListeners()
  }

  // 调整画布大小
  resizeCanvas() {
    const info = wx.getSystemInfoSync()
    this.canvas.width = info.windowWidth
    this.canvas.height = info.windowHeight
    this.config.canvasWidth = info.windowWidth
    this.config.canvasHeight = info.windowHeight
  }

  // 加载关卡
  loadLevel(level) {
    const levelData = this.levelGenerator.generateLevel(level)
    
    this.state.width = levelData.width
    this.state.height = levelData.height
    this.state.startPos = levelData.start
    this.state.endPos = levelData.end
    
    this.initGrid()
    this.resetGameState()
    
    // 发布关卡加载事件
    this.emit('levelLoaded', {
      level: level,
      width: this.state.width,
      height: this.state.height,
      totalCells: levelData.totalCells
    })
  }

  // 初始化网格
  initGrid() {
    this.state.grid = []
    for (let y = 0; y < this.state.height; y++) {
      this.state.grid[y] = []
      for (let x = 0; x < this.state.width; x++) {
        this.state.grid[y][x] = {
          x: x,
          y: y,
          visited: false,
          isStart: x === this.state.startPos.x && y === this.state.startPos.y,
          isEnd: x === this.state.endPos.x && y === this.state.endPos.y,
          isInPath: false
        }
      }
    }
  }

  // 重置游戏状态
  resetGameState() {
    this.state.currentPath = [this.state.startPos]
    this.state.visitedCells.clear()
    this.state.visitedCells.add(`${this.state.startPos.x},${this.state.startPos.y}`)
    
    // 重置所有格子状态
    for (let y = 0; y < this.state.height; y++) {
      for (let x = 0; x < this.state.width; x++) {
        this.state.grid[y][x].visited = false
        this.state.grid[y][x].isInPath = false
      }
    }
    
    this.state.grid[this.state.startPos.y][this.state.startPos.x].visited = true
    this.state.isGameActive = true
  }

  // 获取格子坐标
  getCellFromPosition(x, y) {
    const offsetX = (this.config.canvasWidth - this.state.width * this.config.cellSize) / 2
    const offsetY = (this.config.canvasHeight - this.state.height * this.config.cellSize) / 2
    
    const cellX = Math.floor((x - offsetX) / this.config.cellSize)
    const cellY = Math.floor((y - offsetY) / this.config.cellSize)
    
    if (cellX >= 0 && cellX < this.state.width && 
        cellY >= 0 && cellY < this.state.height) {
      return { x: cellX, y: cellY }
    }
    return null
  }

  // 检查移动是否有效
  isValidMove(from, to) {
    if (!from || !to) return false
    if (!this.state.isGameActive) return false
    
    const dx = Math.abs(to.x - from.x)
    const dy = Math.abs(to.y - from.y)
    
    // 只能上下左右移动一格
    const isAdjacent = (dx === 1 && dy === 0) || (dx === 0 && dy === 1)
    if (!isAdjacent) return false
    
    // 检查是否已经访问过
    const cellKey = `${to.x},${to.y}`
    return !this.state.visitedCells.has(cellKey)
  }

  // 移动到新格子
  moveToCell(cell) {
    if (!this.isValidMove(this.getLastPosition(), cell)) {
      return false
    }
    
    // 添加到路径
    this.state.currentPath.push(cell)
    this.state.visitedCells.add(`${cell.x},${cell.y}`)
    this.state.grid[cell.y][cell.x].visited = true
    this.state.grid[cell.y][cell.x].isInPath = true
    
    // 更新游戏状态
    this.updateGameState()
    
    // 检查游戏结束条件
    if (this.isGameEnd(cell)) {
      this.endGame()
    }
    
    return true
  }

  // 获取当前路径的最后一个位置
  getLastPosition() {
    return this.state.currentPath[this.state.currentPath.length - 1]
  }

  // 检查游戏是否结束
  isGameEnd(cell) {
    return cell.x === this.state.endPos.x && cell.y === this.state.endPos.y
  }

  // 更新游戏状态
  updateGameState() {
    const totalCells = this.state.width * this.state.height
    const visitedCells = this.state.currentPath.length
    const remainingCells = totalCells - visitedCells
    
    this.emit('gameStateUpdate', {
      level: this.state.currentLevel,
      totalCells,
      visitedCells,
      remainingCells,
      progress: (visitedCells / totalCells) * 100
    })
  }

  // 结束游戏
  endGame() {
    this.state.isGameActive = false
    
    const totalCells = this.state.width * this.state.height
    const visitedCells = this.state.currentPath.length
    
    const isWin = visitedCells === totalCells
    
    this.emit('gameEnd', {
      isWin,
      level: this.state.currentLevel,
      totalCells,
      visitedCells
    })
  }

  // 撤销最后一步
  undoLastMove() {
    if (this.state.currentPath.length <= 1) return false
    
    const lastCell = this.state.currentPath.pop()
    this.state.visitedCells.delete(`${lastCell.x},${lastCell.y}`)
    this.state.grid[lastCell.y][lastCell.x].visited = false
    this.state.grid[lastCell.y][lastCell.x].isInPath = false
    
    this.state.isGameActive = true
    this.updateGameState()
    
    return true
  }

  // 重置当前关卡
  resetLevel() {
    this.resetGameState()
    this.emit('levelReset', { level: this.state.currentLevel })
  }

  // 下一关
  nextLevel() {
    if (this.state.currentLevel < this.state.maxLevel) {
      this.state.currentLevel++
      this.loadLevel(this.state.currentLevel)
    }
  }

  // 上一关
  prevLevel() {
    if (this.state.currentLevel > 1) {
      this.state.currentLevel--
      this.loadLevel(this.state.currentLevel)
    }
  }

  // 设置交互模式
  setInteractionMode(mode) {
    if (mode === 'click' || mode === 'drag') {
      this.state.interactionMode = mode
      this.emit('interactionModeChanged', { mode })
    }
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

  // 设置事件监听器
  setupEventListeners() {
    // 触摸事件处理
    let touchStartTime = 0
    let touchStartPos = null
    let isDragging = false
    let dragPath = []
    
    wx.onTouchStart((e) => {
      if (!this.state.isGameActive) return
      
      touchStartTime = Date.now()
      const touch = e.touches[0]
      touchStartPos = this.getCellFromPosition(touch.clientX, touch.clientY)
      
      this.state.dragStartPos = touchStartPos
      isDragging = false
      dragPath = []
      
      // 如果触摸的是当前路径的最后一个格子，开始拖拽
      if (touchStartPos && this.isSamePosition(touchStartPos, this.getLastPosition())) {
        isDragging = true
        dragPath = [...this.state.currentPath]
      }
    })
    
    wx.onTouchMove((e) => {
      if (!this.state.isGameActive || !isDragging) return
      
      const touch = e.touches[0]
      const currentCell = this.getCellFromPosition(touch.clientX, touch.clientY)
      
      if (currentCell && this.isValidDragMove(currentCell)) {
        // 添加拖拽路径预览
        this.addDragPreview(currentCell)
        
        // 延迟一小段时间再实际移动，提高用户体验
        setTimeout(() => {
          if (this.isValidMove(this.getLastPosition(), currentCell)) {
            this.moveToCell(currentCell)
          }
        }, 50)
      }
    })
    
    wx.onTouchEnd((e) => {
      if (!this.state.isGameActive) return
      
      const touchDuration = Date.now() - touchStartTime
      const touch = e.changedTouches[0]
      const endCell = this.getCellFromPosition(touch.clientX, touch.clientY)
      
      // 清除拖拽预览
      this.clearDragPreview()
      
      // 点击模式处理
      if (!isDragging && this.state.interactionMode === 'click' && touchDuration < 200 && endCell) {
        this.moveToCell(endCell)
      }
      
      // 拖拽模式结束
      if (isDragging) {
        this.finalizeDragMove()
      }
      
      this.state.dragStartPos = null
      this.state.lastDragCell = null
      isDragging = false
      dragPath = []
    })
    
    // 长按开始拖拽模式
    wx.onLongPress((e) => {
      if (!this.state.isGameActive) return
      
      const touch = e.touches[0]
      const cell = this.getCellFromPosition(touch.clientX, touch.clientY)
      
      if (cell && this.isSamePosition(cell, this.getLastPosition())) {
        isDragging = true
        dragPath = [...this.state.currentPath]
        this.showDragHint()
      }
    })
  }

  // 检查两个位置是否相同
  isSamePosition(pos1, pos2) {
    return pos1 && pos2 && pos1.x === pos2.x && pos1.y === pos2.y
  }

  // 检查拖拽移动是否有效
  isValidDragMove(cell) {
    if (!cell) return false
    
    const lastPos = this.getLastPosition()
    if (!lastPos) return false
    
    // 检查是否是相邻格子
    const dx = Math.abs(cell.x - lastPos.x)
    const dy = Math.abs(cell.y - lastPos.y)
    const isAdjacent = (dx === 1 && dy === 0) || (dx === 0 && dy === 1)
    
    if (!isAdjacent) return false
    
    // 检查是否已经被访问过
    const cellKey = `${cell.x},${cell.y}`
    return !this.state.visitedCells.has(cellKey)
  }

  // 添加拖拽预览
  addDragPreview(cell) {
    // 在实际应用中，这里可以添加视觉反馈
    this.emit('dragPreview', { cell })
  }

  // 清除拖拽预览
  clearDragPreview() {
    this.emit('clearDragPreview')
  }

  // 完成拖拽移动
  finalizeDragMove() {
    this.emit('dragComplete')
  }

  // 显示拖拽提示
  showDragHint() {
    this.emit('showHint', { message: '拖拽移动 - 滑动手指连续移动' })
  }

  // 获取游戏状态
  getGameState() {
    return {
      ...this.state,
      totalCells: this.state.width * this.state.height,
      cellSize: this.config.cellSize
    }
  }
}

module.exports = GameLogic