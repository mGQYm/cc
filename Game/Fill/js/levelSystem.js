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
    // 根据关卡阶段设计不同的配置
    const stageConfig = this.getStageConfig(level)
    
    return {
      level,
      width: stageConfig.width,
      height: stageConfig.height,
      difficulty: stageConfig.difficulty,
      special: stageConfig.special,
      targetTime: this.calculateTargetTime(stageConfig.width, stageConfig.height, stageConfig.difficulty),
      maxStars: this.calculateMaxStars(stageConfig.width, stageConfig.height),
      description: stageConfig.description,
      gameMode: stageConfig.gameMode || 'classic',
      features: stageConfig.features || []
    }
  }

  // 获取关卡阶段配置
  getStageConfig(level) {
    // 阶段1: 教学关卡 (1-5关)
    if (level <= 5) {
      return this.getTutorialConfig(level)
    }
    
    // 阶段2: 基础练习 (6-15关)
    if (level <= 15) {
      return this.getBasicConfig(level)
    }
    
    // 阶段3: 进阶挑战 (16-30关)
    if (level <= 30) {
      return this.getAdvancedConfig(level)
    }
    
    // 阶段4: 高级技巧 (31-50关)
    if (level <= 50) {
      return this.getExpertConfig(level)
    }
    
    // 阶段5: 大师挑战 (51-100关)
    return this.getMasterConfig(level)
  }

  // 教学关卡配置
  getTutorialConfig(level) {
    const configs = [
      { width: 3, height: 3, description: '新手入门 - 3×3迷宫', gameMode: 'tutorial', features: ['tutorial_arrows'] },
      { width: 4, height: 3, description: '基础练习 - 4×3矩形', gameMode: 'tutorial', features: ['highlight_path'] },
      { width: 4, height: 4, description: '小试牛刀 - 4×4挑战', gameMode: 'classic', features: ['show_progress'] },
      { width: 5, height: 4, description: '进阶尝试 - 5×4扩展', gameMode: 'classic', features: ['undo_hint'] },
      { width: 5, height: 5, description: '首次完整 - 5×5标准', gameMode: 'classic', features: ['time_bonus'] }
    ]
    
    const config = configs[level - 1] || { width: 5, height: 5, description: '标准关卡' }
    return {
      ...config,
      difficulty: 1,
      special: null
    }
  }

  // 基础练习配置
  getBasicConfig(level) {
    const offset = level - 6
    const sizes = [
      { width: 5, height: 5 },
      { width: 5, height: 6 },
      { width: 6, height: 5 },
      { width: 6, height: 6 },
      { width: 6, height: 7 },
      { width: 7, height: 6 },
      { width: 7, height: 7 },
      { width: 7, height: 8 },
      { width: 8, height: 7 },
      { width: 8, height: 8 }
    ]
    
    const sizeIndex = Math.min(offset, sizes.length - 1)
    const size = sizes[sizeIndex]
    
    return {
      width: size.width,
      height: size.height,
      difficulty: Math.min(Math.floor(level / 5), 3),
      special: level % 5 === 0 ? this.getSpecialLevel(level) : null,
      description: `基础第${offset + 1}关 - ${size.width}×${size.height}`,
      gameMode: 'classic',
      features: ['undo_hint', 'time_bonus']
    }
  }

  // 进阶挑战配置
  getAdvancedConfig(level) {
    const offset = level - 16
    const width = Math.min(8 + Math.floor(offset / 3), 12)
    const height = Math.min(8 + Math.floor(offset / 4), 12)
    
    // 引入矩形网格
    const isWide = offset % 4 === 0
    const isTall = offset % 4 === 2
    
    let finalWidth = width
    let finalHeight = height
    
    if (isWide) finalWidth = Math.min(width + 2, 15)
    if (isTall) finalHeight = Math.min(height + 2, 15)
    
    return {
      width: finalWidth,
      height: finalHeight,
      difficulty: Math.min(Math.floor(level / 5), 4),
      special: level % 5 === 0 ? this.getSpecialLevel(level) : null,
      description: `进阶挑战 - ${finalWidth}×${finalHeight}${isWide ? ' 宽阔' : isTall ? ' 高耸' : ''}`,
      gameMode: 'classic',
      features: ['undo_hint', 'time_bonus', 'perfect_bonus']
    }
  }

  // 高级技巧配置
  getExpertConfig(level) {
    const offset = level - 31
    const baseSize = 12
    const growth = Math.floor(offset / 2)
    
    const width = Math.min(baseSize + growth, 18)
    const height = Math.min(baseSize + growth, 18)
    
    // 引入特殊形状
    const specialShapes = ['L-shape', 'T-shape', 'cross', 'frame']
    const shapeIndex = offset % specialShapes.length
    
    return {
      width,
      height,
      difficulty: 4,
      special: this.getSpecialLevel(level) || { type: specialShapes[shapeIndex], name: '特殊形状' },
      description: `专家级 - ${width}×${height} ${specialShapes[shapeIndex]}`,
      gameMode: 'challenge',
      features: ['undo_hint', 'time_bonus', 'perfect_bonus', 'move_limit']
    }
  }

  // 大师挑战配置
  getMasterConfig(level) {
    const offset = level - 51
    const baseSize = 15
    const growth = Math.floor(offset / 1.5)
    
    const width = Math.min(baseSize + growth, 25)
    const height = Math.min(baseSize + growth, 25)
    
    return {
      width,
      height,
      difficulty: 5,
      special: level % 3 === 0 ? this.getSpecialLevel(level) : null,
      description: `大师级 - ${width}×${height} 极限挑战`,
      gameMode: 'master',
      features: ['undo_hint', 'time_bonus', 'perfect_bonus', 'move_limit', 'no_mistake']
    }
  }

  // 特殊关卡配置
  getSpecialLevel(level) {
    const specials = {
      10: { width: 8, height: 8, type: 'perfect_square', name: '完美正方形', description: '经典8×8挑战' },
      15: { width: 9, height: 6, type: 'golden_ratio', name: '黄金比例', description: '符合黄金分割的矩形' },
      20: { width: 12, height: 8, type: 'wide_rectangle', name: '宽阔矩形', description: '横向扩展的矩形网格' },
      25: { width: 10, height: 10, type: 'symmetry', name: '对称之美', description: '完美对称的正方形' },
      30: { width: 15, height: 10, type: 'landscape', name: '风景模式', description: '宽阔视野的挑战' },
      35: { width: 12, height: 12, type: 'perfect_square', name: '进阶正方形', description: '12×12进阶挑战' },
      40: { width: 10, height: 15, type: 'portrait', name: '肖像模式', description: '纵向高耸的网格' },
      45: { width: 14, height: 14, type: 'perfect_square', name: '大正方形', description: '14×14大型网格' },
      50: { width: 20, height: 20, type: 'mega_grid', name: '巨型挑战', description: '20×20终极考验' },
      55: { width: 16, height: 12, type: 'golden_ratio', name: '黄金矩形', description: '16×12黄金比例' },
      60: { width: 18, height: 18, type: 'perfect_square', name: '双倍正方形', description: '18×18双倍难度' },
      65: { width: 15, height: 15, type: 'perfect_square', name: '十五方格', description: '15×15标准挑战' },
      70: { width: 18, height: 18, type: 'ultra_square', name: '极限正方形', description: '18×18极限挑战' },
      75: { width: 20, height: 15, type: 'wide_ultra', name: '超宽视野', description: '20×15超宽网格' },
      80: { width: 24, height: 16, type: 'ultra_wide', name: '超宽挑战', description: '24×16超宽终极' },
      85: { width: 20, height: 20, type: 'perfect_square', name: '二十方格', description: '20×20大师级' },
      90: { width: 25, height: 25, type: 'master_grid', name: '大师级挑战', description: '25×25大师考验' },
      95: { width: 22, height: 22, type: 'perfect_square', name: '二十二格', description: '22×22接近极限' },
      100: { width: 30, height: 30, type: 'legendary', name: '传奇终章', description: '30×30传奇挑战' }
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