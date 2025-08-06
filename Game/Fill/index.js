const app = getApp()

Page({
  data: {
    level: 1,
    remainingCells: 0,
    interactionMode: 'click',
    canvasWidth: 0,
    canvasHeight: 0
  },

  onLoad() {
    this.initGame()
  },

  onReady() {
    this.createCanvasContext()
  },

  initGame() {
    const systemInfo = wx.getSystemInfoSync()
    const canvasWidth = systemInfo.windowWidth - 40
    const canvasHeight = systemInfo.windowHeight * 0.6

    this.setData({
      canvasWidth,
      canvasHeight
    })

    this.gameConfig = {
      gridWidth: 8,
      gridHeight: 8,
      cellSize: Math.min(canvasWidth, canvasHeight) / 8,
      canvasWidth,
      canvasHeight
    }

    this.gameState = {
      grid: [],
      startPos: { x: 0, y: 0 },
      endPos: { x: 7, y: 7 },
      currentPath: [],
      visitedCells: new Set(),
      isDragging: false,
      lastCell: null
    }

    this.generateLevel(this.data.level)
    this.draw()
  },

  createCanvasContext() {
    this.context = wx.createCanvasContext('gameCanvas', this)
  },

  generateLevel(level) {
    const gridSize = Math.min(5 + Math.floor(level / 3), 30)
    this.gameConfig.gridWidth = gridSize
    this.gameConfig.gridHeight = gridSize
    
    this.gameConfig.cellSize = Math.min(
      this.data.canvasWidth / gridSize,
      this.data.canvasHeight / gridSize
    )

    // 初始化网格
    this.gameState.grid = []
    for (let y = 0; y < gridSize; y++) {
      this.gameState.grid[y] = []
      for (let x = 0; x < gridSize; x++) {
        this.gameState.grid[y][x] = {
          x, y, visited: false, isStart: false, isEnd: false
        }
      }
    }

    // 设置起点和终点
    this.gameState.startPos = { x: 0, y: 0 }
    this.gameState.endPos = { x: gridSize - 1, y: gridSize - 1 }
    this.gameState.grid[0][0].isStart = true
    this.gameState.grid[gridSize - 1][gridSize - 1].isEnd = true

    this.gameState.currentPath = [{ x: 0, y: 0 }]
    this.gameState.visitedCells = new Set(['0,0'])
    this.gameState.grid[0][0].visited = true

    this.setData({
      level,
      remainingCells: gridSize * gridSize - 1
    })
  },

  draw() {
    const ctx = this.context
    const { gridWidth, gridHeight, cellSize } = this.gameConfig
    const offsetX = (this.data.canvasWidth - gridWidth * cellSize) / 2
    const offsetY = (this.data.canvasHeight - gridHeight * cellSize) / 2

    ctx.clearRect(0, 0, this.data.canvasWidth, this.data.canvasHeight)

    // 绘制网格
    for (let y = 0; y < gridHeight; y++) {
      for (let x = 0; x < gridWidth; x++) {
        const cell = this.gameState.grid[y][x]
        const cellX = offsetX + x * cellSize
        const cellY = offsetY + y * cellSize

        // 设置单元格颜色
        if (cell.isStart) {
          ctx.setFillStyle('#4CAF50')
        } else if (cell.isEnd) {
          ctx.setFillStyle('#FF5722')
        } else if (cell.visited) {
          ctx.setFillStyle('#E3F2FD')
        } else {
          ctx.setFillStyle('#FFFFFF')
        }

        ctx.fillRect(cellX, cellY, cellSize - 1, cellSize - 1)

        // 绘制边框
        ctx.setStrokeStyle('#1976D2')
        ctx.strokeRect(cellX, cellY, cellSize - 1, cellSize - 1)

        // 绘制已访问的标记
        if (this.gameState.visitedCells.has(`${x},${y}`)) {
          ctx.setFillStyle('#2196F3')
          ctx.fillRect(cellX + 5, cellY + 5, cellSize - 10, cellSize - 10)
        }
      }
    }

    // 绘制路径连线
    if (this.gameState.currentPath.length > 1) {
      ctx.setStrokeStyle('#FF9800')
      ctx.setLineWidth(3)
      ctx.beginPath()

      for (let i = 0; i < this.gameState.currentPath.length; i++) {
        const pos = this.gameState.currentPath[i]
        const x = offsetX + pos.x * cellSize + cellSize / 2
        const y = offsetY + pos.y * cellSize + cellSize / 2

        if (i === 0) {
          ctx.moveTo(x, y)
        } else {
          ctx.lineTo(x, y)
        }
      }
      ctx.stroke()
    }

    ctx.draw()
  },

  getCellFromPosition(x, y) {
    const { gridWidth, gridHeight, cellSize } = this.gameConfig
    const offsetX = (this.data.canvasWidth - gridWidth * cellSize) / 2
    const offsetY = (this.data.canvasHeight - gridHeight * cellSize) / 2

    const cellX = Math.floor((x - offsetX) / cellSize)
    const cellY = Math.floor((y - offsetY) / cellSize)

    if (cellX >= 0 && cellX < gridWidth && cellY >= 0 && cellY < gridHeight) {
      return { x: cellX, y: cellY }
    }
    return null
  },

  isValidMove(from, to) {
    if (!from || !to) return false

    const dx = Math.abs(to.x - from.x)
    const dy = Math.abs(to.y - from.y)

    if ((dx === 1 && dy === 0) || (dx === 0 && dy === 1)) {
      return !this.gameState.visitedCells.has(`${to.x},${to.y}`)
    }

    return false
  },

  moveToCell(cell) {
    const lastPos = this.gameState.currentPath[this.gameState.currentPath.length - 1]
    if (!this.isValidMove(lastPos, cell)) return

    this.gameState.currentPath.push(cell)
    this.gameState.visitedCells.add(`${cell.x},${cell.y}`)
    this.gameState.grid[cell.y][cell.x].visited = true

    const remainingCells = this.gameConfig.gridWidth * this.gameConfig.gridHeight - this.gameState.currentPath.length
    this.setData({ remainingCells })

    this.draw()

    // 检查是否到达终点
    if (cell.x === this.gameState.endPos.x && cell.y === this.gameState.endPos.y) {
      this.checkGameResult()
    }
  },

  checkGameResult() {
    const totalCells = this.gameConfig.gridWidth * this.gameConfig.gridHeight
    const visitedCells = this.gameState.visitedCells.size

    if (visitedCells === totalCells) {
      this.showSuccessDialog()
    } else {
      this.showFailDialog()
    }
  },

  showSuccessDialog() {
    wx.showModal({
      title: '恭喜通关！',
      content: `你成功完成了第${this.data.level}关！`,
      showCancel: true,
      cancelText: '重玩',
      confirmText: '下一关',
      success: (res) => {
        if (res.confirm) {
          if (this.data.level < 100) {
            this.setData({ level: this.data.level + 1 })
            this.generateLevel(this.data.level)
          } else {
            wx.showToast({
              title: '恭喜通关所有关卡！',
              icon: 'success'
            })
          }
        } else {
          this.generateLevel(this.data.level)
        }
        this.draw()
      }
    })
  },

  showFailDialog() {
    wx.showModal({
      title: '游戏失败',
      content: '还有未走过的格子，请重试！',
      showCancel: false,
      confirmText: '重玩一次',
      success: () => {
        this.generateLevel(this.data.level)
        this.draw()
      }
    })
  },

  // 事件处理
  onCanvasTouchStart(e) {
    const touch = e.touches[0]
    const cell = this.getCellFromPosition(touch.x, touch.y)
    
    if (cell && this.data.interactionMode === 'click') {
      this.moveToCell(cell)
    }
  },

  onCanvasTouchMove(e) {
    if (this.data.interactionMode !== 'drag') return
    
    const touch = e.touches[0]
    const cell = this.getCellFromPosition(touch.x, touch.y)
    
    if (cell && cell !== this.gameState.lastCell) {
      this.moveToCell(cell)
      this.gameState.lastCell = cell
    }
  },

  switchToClick() {
    this.setData({ interactionMode: 'click' })
  },

  switchToDrag() {
    this.setData({ interactionMode: 'drag' })
  },

  resetLevel() {
    this.generateLevel(this.data.level)
    this.draw()
  },

  nextLevel() {
    if (this.data.level < 100) {
      this.setData({ level: this.data.level + 1 })
      this.generateLevel(this.data.level)
      this.draw()
    }
  },

  onShareAppMessage() {
    return {
      title: '一起来玩路径迷宫吧！',
      path: '/pages/index/index',
      imageUrl: '/images/share.jpg'
    }
  }
})