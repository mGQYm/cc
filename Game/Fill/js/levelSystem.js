// 关卡系统 - 管理关卡进度和难度递增
class LevelSystem {
  constructor() {
    this.maxLevel = 100
    this.currentLevel = 1
    this.completedLevels = new Set()
    this.levelCache = new Map()
    this.progress = {
      totalStars: 0,
      bestTimes: {},
      achievements: new Set()
    }
  }

  // 关卡配置
  getLevelConfig(level) {
    if (this.levelCache.has(level)) {
      return this.levelCache.get(level)
    }

    const config = this.generateLevelConfig(level)
    this.levelCache.set(level, config)
    return config
  }

  // 生成关卡配置
  generateLevelConfig(level) {
    // 基础配置
    const baseSize = 5
    const maxSize = 30
    
    // 关卡大小递增规则
    let gridSize = Math.min(
      baseSize + Math.floor(Math.sqrt(level - 1) * 1.5),
      maxSize
    )

    // 特殊关卡配置
    let width = gridSize
    let height = gridSize
    let special = null

    // 每10关有特殊形状
    if (level % 10 === 0) {
      special = this.getSpecialLevel(level)
      if (special) {
        width = special.width
        height = special.height
      }
    }

    // 难度递增规则
    const difficulty = Math.min(Math.floor(level / 5) + 1, 5)
    
    return {
      level,
      width,
      height,
      difficulty,
      special,
      targetTime: this.calculateTargetTime(width, height, difficulty),
      maxStars: this.calculateMaxStars(width, height),
      description: this.getLevelDescription(level, special)
    }
  }

  // 特殊关卡配置
  getSpecialLevel(level) {
    const specials = {
      10: { width: 8, height: 8, type: 'square', name: '完美正方形' },
      20: { width: 12, height: 8, type: 'rectangle', name: '黄金矩形' },
      30: { width: 15, height: 10, type: 'wide', name: '宽阔视野' },
      40: { width: 10, height: 15, type: 'tall', name: '高耸入云' },
      50: { width: 20, height: 20, type: 'mega', name: '巨型挑战' },
      60: { width: 16, height: 12, type: 'golden', name: '黄金比例' },
      70: { width: 18, height: 18, type: 'double', name: '双倍难度' },
      80: { width: 24, height: 16, type: 'ultra', name: '极限挑战' },
      90: { width: 25, height: 25, type: 'master', name: '大师级' },
      100: { width: 30, height: 30, type: 'legendary', name: '传奇终章' }
    }

    return specials[level] || null
  }

  // 计算目标时间
  calculateTargetTime(width, height, difficulty) {
    const baseTime = width * height * 0.5 // 每格0.5秒
    const difficultyMultiplier = [1, 1.2, 1.5, 2, 3][difficulty - 1] || 1
    return Math.floor(baseTime * difficultyMultiplier)
  }

  // 计算最大星级
  calculateMaxStars(width, height) {
    const totalCells = width * height
    if (totalCells <= 25) return 3
    if (totalCells <= 49) return 4
    if (totalCells <= 100) return 5
    return Math.min(Math.floor(totalCells / 20) + 3, 10)
  }

  // 获取关卡描述
  getLevelDescription(level, special) {
    if (special) {
      return `${special.name} - ${special.width}×${special.height}`
    }
    
    const size = 5 + Math.floor(Math.sqrt(level - 1) * 1.5)
    return `第${level}关 - ${size}×${size}`
  }

  // 完成关卡
  completeLevel(level, time, path) {
    this.completedLevels.add(level)
    
    const config = this.getLevelConfig(level)
    const stars = this.calculateStars(level, time, path)
    
    // 更新最佳时间
    if (!this.progress.bestTimes[level] || time < this.progress.bestTimes[level]) {
      this.progress.bestTimes[level] = time
    }
    
    // 更新总星级
    this.progress.totalStars += stars
    
    // 检查成就
    this.checkAchievements(level, stars, time)
    
    // 保存进度
    this.saveProgress()
    
    return {
      stars,
      isNewRecord: time === this.progress.bestTimes[level],
      achievements: this.getNewAchievements()
    }
  }

  // 计算星级评分
  calculateStars(level, time, path) {
    const config = this.getLevelConfig(level)
    const targetTime = config.targetTime
    const maxStars = config.maxStars
    
    if (time <= targetTime * 0.5) return maxStars
    if (time <= targetTime * 0.7) return maxStars - 1
    if (time <= targetTime) return maxStars - 2
    if (time <= targetTime * 1.5) return Math.max(1, maxStars - 3)
    
    return 1 // 至少1星
  }

  // 检查成就
  checkAchievements(level, stars, time) {
    const newAchievements = []
    
    // 首次通关
    if (level === 1 && !this.progress.achievements.has('first_win')) {
      this.progress.achievements.add('first_win')
      newAchievements.push('首次通关')
    }
    
    // 连续通关
    const consecutive = this.getConsecutiveLevels()
    if (consecutive >= 5 && !this.progress.achievements.has('streak_5')) {
      this.progress.achievements.add('streak_5')
      newAchievements.push('连过5关')
    }
    
    if (consecutive >= 10 && !this.progress.achievements.has('streak_10')) {
      this.progress.achievements.add('streak_10')
      newAchievements.push('连过10关')
    }
    
    // 完美通关
    if (stars === this.getLevelConfig(level).maxStars) {
      const perfectLevels = this.getPerfectLevels()
      if (perfectLevels.length === 10 && !this.progress.achievements.has('perfect_10')) {
        this.progress.achievements.add('perfect_10')
        newAchievements.push('完美10关')
      }
    }
    
    // 速度成就
    if (time < 30 && level >= 10 && !this.progress.achievements.has('speed_demon')) {
      this.progress.achievements.add('speed_demon')
      newAchievements.push('极速通关')
    }
    
    // 难度成就
    if (level >= 50 && !this.progress.achievements.has('half_way')) {
      this.progress.achievements.add('half_way')
      newAchievements.push('半程达成')
    }
    
    if (level >= 100 && !this.progress.achievements.has('master')) {
      this.progress.achievements.add('master')
      newAchievements.push('通关大师')
    }
    
    this.newAchievements = newAchievements
  }

  // 获取新成就
  getNewAchievements() {
    return this.newAchievements || []
  }

  // 获取连续通关数
  getConsecutiveLevels() {
    let count = 0
    for (let i = 1; i <= this.maxLevel; i++) {
      if (this.completedLevels.has(i)) {
        count++
      } else {
        break
      }
    }
    return count
  }

  // 获取完美通关关卡
  getPerfectLevels() {
    return Object.keys(this.progress.bestTimes).filter(level => {
      const config = this.getLevelConfig(parseInt(level))
      const time = this.progress.bestTimes[level]
      const stars = this.calculateStars(parseInt(level), time, [])
      return stars === config.maxStars
    })
  }

  // 保存进度到本地存储
  saveProgress() {
    const data = {
      currentLevel: this.currentLevel,
      completedLevels: Array.from(this.completedLevels),
      progress: {
        totalStars: this.progress.totalStars,
        bestTimes: this.progress.bestTimes,
        achievements: Array.from(this.progress.achievements)
      }
    }
    
    try {
      wx.setStorageSync('pathMaze_progress', data)
    } catch (e) {
      console.error('保存进度失败:', e)
    }
  }

  // 从本地存储加载进度
  loadProgress() {
    try {
      const data = wx.getStorageSync('pathMaze_progress')
      if (data) {
        this.currentLevel = data.currentLevel || 1
        this.completedLevels = new Set(data.completedLevels || [])
        this.progress = {
          totalStars: data.progress?.totalStars || 0,
          bestTimes: data.progress?.bestTimes || {},
          achievements: new Set(data.progress?.achievements || [])
        }
      }
    } catch (e) {
      console.error('加载进度失败:', e)
    }
  }

  // 重置进度
  resetProgress() {
    this.currentLevel = 1
    this.completedLevels.clear()
    this.progress = {
      totalStars: 0,
      bestTimes: {},
      achievements: new Set()
    }
    this.levelCache.clear()
    this.saveProgress()
  }

  // 获取进度摘要
  getProgressSummary() {
    return {
      currentLevel: this.currentLevel,
      completedLevels: this.completedLevels.size,
      totalStars: this.progress.totalStars,
      maxStars: this.getTotalMaxStars(),
      achievements: this.progress.achievements.size,
      completionRate: Math.round((this.completedLevels.size / this.maxLevel) * 100)
    }
  }

  // 获取总最大星级
  getTotalMaxStars() {
    let total = 0
    for (let i = 1; i <= this.maxLevel; i++) {
      total += this.getLevelConfig(i).maxStars
    }
    return total
  }

  // 获取排行榜数据
  getLeaderboardData() {
    const levels = []
    for (let i = 1; i <= Math.min(this.currentLevel, 50); i++) {
      const config = this.getLevelConfig(i)
      const bestTime = this.progress.bestTimes[i]
      
      levels.push({
        level: i,
        description: config.description,
        bestTime: bestTime || null,
        stars: bestTime ? this.calculateStars(i, bestTime, []) : 0,
        maxStars: config.maxStars
      })
    }
    
    return levels
  }

  // 跳过到指定关卡
  skipToLevel(level) {
    if (level >= 1 && level <= this.maxLevel) {
      this.currentLevel = level
      this.saveProgress()
    }
  }
}

module.exports = LevelSystem