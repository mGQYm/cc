// 主游戏文件 - 整合所有模块
const GameLogic = require('./js/gameLogic.js')
const UIManager = require('./js/uiManager.js')
const LevelSystem = require('./js/levelSystem.js')
const { getTouchHandler } = require('./js/touchHandler.js')

class PathMazeGame {
  constructor() {
    this.canvas = null
    this.context = null
    this.gameLogic = null
    this.uiManager = null
    this.levelSystem = null
    this.touchHandler = null
    
    this.state = {
      isInitialized: false,
      isGameActive: false,
      startTime: 0,
      currentLevel: 1,
      interactionMode: 'click'
    }
    
    this.audio = {
      enabled: true,
      sounds: {}
    }
  }

  // 初始化游戏
  async init() {
    if (this.state.isInitialized) return
    
    try {
      // 初始化画布
      await this.initCanvas()
      
      // 初始化各模块
      this.initModules()
      
      // 设置事件监听
      this.setupEventListeners()
      
      // 加载游戏状态
      this.loadGameState()
      
      // 启动游戏
      this.startGame()
      
      this.state.isInitialized = true
      console.log('游戏初始化完成')
      
    } catch (error) {
      console.error('游戏初始化失败:', error)
      this.showError('游戏加载失败，请重试')
    }
  }

  // 初始化画布
  async initCanvas() {
    return new Promise((resolve, reject) => {
      try {
        this.canvas = wx.createCanvas()
        this.context = this.canvas.getContext('2d')
        
        const info = wx.getSystemInfoSync()
        this.canvas.width = info.windowWidth
        this.canvas.height = info.windowHeight
        
        resolve()
      } catch (error) {
        reject(error)
      }
    })
  }

  // 初始化各模块
  initModules() {
    // 游戏逻辑
    this.gameLogic = new GameLogic(this.canvas, this.context)
    
    // UI管理器
    this.uiManager = new UIManager()
    this.uiManager.setGameInstance(this)
    
    // 关卡系统
    this.levelSystem = new LevelSystem()
    this.levelSystem.loadProgress()
    
    // 触摸处理器
    this.touchHandler = getTouchHandler(this.gameLogic, this.canvas)
    
    // 设置模块间关联
    this.gameLogic.uiManager = this.uiManager
    this.gameLogic.levelSystem = this.levelSystem
  }

  // 设置事件监听
  setupEventListeners() {
    // 游戏逻辑事件
    this.gameLogic.on('levelLoaded', (data) => {
      this.onLevelLoaded(data)
    })
    
    this.gameLogic.on('gameStateUpdate', (data) => {
      this.onGameStateUpdate(data)
    })
    
    this.gameLogic.on('gameEnd', (data) => {
      this.onGameEnd(data)
    })
    
    // 触摸事件
    this.touchHandler.on('cellHighlight', (data) => {
      this.highlightCell(data.cell, data.type)
    })
    
    this.touchHandler.on('animation', (data) => {
      this.playAnimation(data)
    })
    
    // 生命周期事件
    wx.onShow(() => {
      this.onAppShow()
    })
    
    wx.onHide(() => {
      this.onAppHide()
    })
    
    // 分享事件
    wx.onShareAppMessage(() => {
      return {
        title: `我在路径迷宫第${this.state.currentLevel}关，快来挑战！`,
        path: '/pages/index/index',
        imageUrl: '/images/share.jpg'
      }
    })
  }

  // 启动游戏
  startGame() {
    this.state.currentLevel = this.levelSystem.currentLevel
    this.loadLevel(this.state.currentLevel)
    this.state.isGameActive = true
    this.state.startTime = Date.now()
    
    // 启动游戏循环
    this.gameLoop()
  }

  // 游戏主循环
  gameLoop() {
    if (!this.state.isGameActive) return
    
    this.render()
    requestAnimationFrame(() => this.gameLoop())
  }

  // 渲染游戏
  render() {
    this.clearCanvas()
    this.drawGrid()
    this.drawPath()
    this.drawUI()
  }

  // 清空画布
  clearCanvas() {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height)
  }

  // 绘制网格
  drawGrid() {
    const { width, height } = this.gameLogic.getGameState()
    const cellSize = this.calculateCellSize(width, height)
    const offsetX = (this.canvas.width - width * cellSize) / 2
    const offsetY = (this.canvas.height - height * cellSize) / 2
    
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        this.drawCell(x, y, cellSize, offsetX, offsetY)
      }
    }
  }

  // 绘制单个格子
  drawCell(x, y, cellSize, offsetX, offsetY) {
    const cell = this.gameLogic.state.grid[y][x]
    const cellX = offsetX + x * cellSize
    const cellY = offsetY + y * cellSize
    
    // 设置颜色
    let color = '#FFFFFF'
    if (cell.isStart) {
      color = '#4CAF50'
    } else if (cell.isEnd) {
      color = '#FF5722'
    } else if (cell.visited) {
      color = '#E3F2FD'
    }
    
    // 绘制背景
    this.context.fillStyle = color
    this.context.fillRect(cellX, cellY, cellSize - 1, cellSize - 1)
    
    // 绘制边框
    this.context.strokeStyle = '#1976D2'
    this.context.lineWidth = 1
    this.context.strokeRect(cellX, cellY, cellSize - 1, cellSize - 1)
    
    // 绘制访问标记
    if (cell.visited) {
      this.context.fillStyle = '#2196F3'
      this.context.fillRect(cellX + 5, cellY + 5, cellSize - 10, cellSize - 10)
    }
  }

  // 绘制路径
  drawPath() {
    const path = this.gameLogic.state.currentPath
    if (path.length <= 1) return
    
    const { width, height } = this.gameLogic.getGameState()
    const cellSize = this.calculateCellSize(width, height)
    const offsetX = (this.canvas.width - width * cellSize) / 2
    const offsetY = (this.canvas.height - height * cellSize) / 2
    
    this.context.strokeStyle = '#FF9800'
    this.context.lineWidth = 3
    this.context.lineCap = 'round'
    this.context.lineJoin = 'round'
    
    this.context.beginPath()
    
    for (let i = 0; i < path.length; i++) {
      const pos = path[i]
      const x = offsetX + pos.x * cellSize + cellSize / 2
      const y = offsetY + pos.y * cellSize + cellSize / 2
      
      if (i === 0) {
        this.context.moveTo(x, y)
      } else {
        this.context.lineTo(x, y)
      }
    }
    
    this.context.stroke()
  }

  // 绘制UI
  drawUI() {
    const { level, remainingCells } = this.getGameInfo()
    
    // 绘制关卡信息
    this.context.fillStyle = '#000000'
    this.context.font = '20px Arial'
    this.context.fillText(`第 ${level} 关`, 10, 30)
    this.context.font = '16px Arial'
    this.context.fillText(`剩余: ${remainingCells}`, 10, 55)
  }

  // 计算格子大小
  calculateCellSize(width, height) {
    const maxWidth = this.canvas.width - 40
    const maxHeight = this.canvas.height - 100
    return Math.min(maxWidth / width, maxHeight / height, 40)
  }

  // 关卡加载回调
  onLevelLoaded(data) {
    console.log(`关卡 ${data.level} 已加载`)
    this.state.startTime = Date.now()
  }

  // 游戏状态更新回调
  onGameStateUpdate(data) {
    // 更新UI显示
    this.uiManager.updateProgress(data.progress)
  }

  // 游戏结束回调
  onGameEnd(data) {
    const duration = Math.floor((Date.now() - this.state.startTime) / 1000)
    
    if (data.isWin) {
      const result = this.levelSystem.completeLevel(
        this.state.currentLevel,
        duration,
        this.gameLogic.state.currentPath
      )
      
      this.uiManager.showGameResult(true, {
        level: this.state.currentLevel,
        totalCells: data.totalCells,
        visitedCells: data.visitedCells,
        time: duration,
        stars: result.stars,
        achievements: result.achievements
      })
      
    } else {
      this.uiManager.showGameResult(false, {
        level: this.state.currentLevel,
        totalCells: data.totalCells,
        visitedCells: data.visitedCells
      })
    }
  }

  // 应用显示回调
  onAppShow() {
    console.log('应用显示')
    if (!this.state.isGameActive) {
      this.state.isGameActive = true
      this.gameLoop()
    }
  }

  // 应用隐藏回调
  onAppHide() {
    console.log('应用隐藏')
    this.state.isGameActive = false
    this.saveGameState()
  }

  // 加载关卡
  loadLevel(level) {
    this.state.currentLevel = level
    this.gameLogic.loadLevel(level)
    this.levelSystem.skipToLevel(level)
  }

  // 下一关
  nextLevel() {
    if (this.state.currentLevel < this.levelSystem.maxLevel) {
      this.state.currentLevel++
      this.loadLevel(this.state.currentLevel)
    }
  }

  // 重置当前关卡
  resetLevel() {
    this.gameLogic.resetLevel()
  }

  // 设置交互模式
  setInteractionMode(mode) {
    this.state.interactionMode = mode
    this.touchHandler.setInteractionMode(mode)
  }

  // 保存游戏状态
  saveGameState() {
    const state = {
      currentLevel: this.state.currentLevel,
      interactionMode: this.state.interactionMode,
      audioEnabled: this.audio.enabled
    }
    
    try {
      wx.setStorageSync('pathMaze_gameState', state)
    } catch (e) {
      console.error('保存游戏状态失败:', e)
    }
  }

  // 加载游戏状态
  loadGameState() {
    try {
      const state = wx.getStorageSync('pathMaze_gameState')
      if (state) {
        this.state.interactionMode = state.interactionMode || 'click'
        this.audio.enabled = state.audioEnabled !== false
        this.touchHandler.setInteractionMode(this.state.interactionMode)
      }
    } catch (e) {
      console.error('加载游戏状态失败:', e)
    }
  }

  // 重新开始游戏
  restartGame() {
    this.levelSystem.resetProgress()
    this.state.currentLevel = 1
    this.loadLevel(1)
  }

  // 返回主界面
  returnToMain() {
    // 这里可以添加返回主界面的逻辑
    this.resetLevel()
  }

  // 高亮显示格子
  highlightCell(cell, type) {
    // 实现高亮效果
    this.render()
  }

  // 播放动画
  playAnimation(animation) {
    // 实现动画效果
    console.log('播放动画:', animation.type)
  }

  // 获取游戏信息
  getGameInfo() {
    const gameState = this.gameLogic.getGameState()
    return {
      level: this.state.currentLevel,
      remainingCells: gameState.totalCells - gameState.currentPath.length,
      totalCells: gameState.totalCells,
      interactionMode: this.state.interactionMode
    }
  }

  // 显示错误
  showError(message) {
    wx.showModal({
      title: '错误',
      content: message,
      showCancel: false
    })
  }

  // 分享游戏
  shareGame() {
    wx.shareAppMessage({
      title: `我在路径迷宫第${this.state.currentLevel}关，你能通关吗？`,
      imageUrl: '/images/share.jpg'
    })
  }
}

// 全局游戏实例
let gameInstance = null

// 获取游戏实例
function getGameInstance() {
  if (!gameInstance) {
    gameInstance = new PathMazeGame()
  }
  return gameInstance
}

// 导出供小程序使用
module.exports = {
  PathMazeGame,
  getGameInstance
}

// 小程序入口
if (typeof wx !== 'undefined') {
  wx.onLaunch = function() {
    const game = getGameInstance()
    game.init()
  }
}

// 页面入口
if (typeof Page !== 'undefined') {
  Page({
    data: {
      level: 1,
      remainingCells: 0,
      interactionMode: 'click',
      isLoading: true
    },

    onLoad() {
      const game = getGameInstance()
      game.init().then(() => {
        this.setData({ isLoading: false })
      })
    },

    onShow() {
      const game = getGameInstance()
      if (game.state.isInitialized) {
        game.onAppShow()
      }
    },

    onHide() {
      const game = getGameInstance()
      if (game.state.isInitialized) {
        game.onAppHide()
      }
    },

    onShareAppMessage() {
      const game = getGameInstance()
      return game.shareGame()
    }
  })
}