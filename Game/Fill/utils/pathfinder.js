// 哈密顿路径算法 - 确保网格有解
class HamiltonianPath {
  constructor(width, height) {
    this.width = width
    this.height = height
    this.grid = []
    this.path = []
    this.visited = new Set()
  }

  // 初始化网格
  initGrid() {
    this.grid = []
    for (let y = 0; y < this.height; y++) {
      this.grid[y] = []
      for (let x = 0; x < this.width; x++) {
        this.grid[y][x] = {
          x, y, visited: false, neighbors: this.getNeighbors(x, y)
        }
      }
    }
  }

  // 获取相邻格子
  getNeighbors(x, y) {
    const neighbors = []
    const directions = [[0, 1], [1, 0], [0, -1], [-1, 0]] // 右、下、左、上
    
    for (const [dx, dy] of directions) {
      const nx = x + dx
      const ny = y + dy
      
      if (nx >= 0 && nx < this.width && ny >= 0 && ny < this.height) {
        neighbors.push({ x: nx, y: ny })
      }
    }
    
    return neighbors
  }

  // 检查是否存在从起点到终点的哈密顿路径
  hasHamiltonianPath(start, end) {
    this.path = []
    this.visited.clear()
    
    return this.findPath(start.x, start.y, end, 1)
  }

  // 递归寻找哈密顿路径
  findPath(x, y, end, depth) {
    const key = `${x},${y}`
    
    if (this.visited.has(key)) {
      return false
    }
    
    this.visited.add(key)
    this.path.push({ x, y })
    
    // 如果到达终点且所有格子都被访问
    if (x === end.x && y === end.y) {
      if (this.path.length === this.width * this.height) {
        return true
      }
    }
    
    // 如果深度等于总格子数，但还没到达终点
    if (depth === this.width * this.height) {
      this.visited.delete(key)
      this.path.pop()
      return false
    }
    
    // 获取有效移动
    const neighbors = this.getNeighbors(x, y)
    
    // 按距离终点的曼哈顿距离排序，优先选择更近的
    neighbors.sort((a, b) => {
      const distA = Math.abs(a.x - end.x) + Math.abs(a.y - end.y)
      const distB = Math.abs(b.x - end.x) + Math.abs(b.y - end.y)
      return distA - distB
    })
    
    for (const neighbor of neighbors) {
      if (this.findPath(neighbor.x, neighbor.y, end, depth + 1)) {
        return true
      }
    }
    
    // 回溯
    this.visited.delete(key)
    this.path.pop()
    return false
  }

  // 生成有解的关卡
  generateSolvableLevel(width, height, start, end) {
    this.width = width
    this.height = height
    this.initGrid()
    
    // 如果直接有解，返回空数组（表示可以从起点到终点访问所有格子）
    if (this.hasHamiltonianPath(start, end)) {
      return []
    }
    
    // 如果没有解，调整网格大小
    let newWidth = width
    let newHeight = height
    
    // 逐步减小网格直到找到有解的配置
    while (newWidth > 5 && newHeight > 5) {
      newWidth = Math.max(5, newWidth - 1)
      newHeight = Math.max(5, newHeight - 1)
      
      this.width = newWidth
      this.height = newHeight
      this.initGrid()
      
      const newEnd = { x: newWidth - 1, y: newHeight - 1 }
      
      if (this.hasHamiltonianPath(start, newEnd)) {
        return [{ width: newWidth, height: newHeight, end: newEnd }]
      }
    }
    
    // 如果5x5也没有解，使用蛇形路径
    return this.generateSnakePath(start, end)
  }

  // 生成蛇形路径（保证有解）
  generateSnakePath(start, end) {
    const path = []
    const visited = new Set()
    const totalCells = this.width * this.height
    
    // 创建蛇形路径
    let direction = 1 // 1: 右, 2: 下, 3: 左, 4: 上
    let x = start.x
    let y = start.y
    
    for (let i = 0; i < totalCells; i++) {
      path.push({ x, y })
      visited.add(`${x},${y}`)
      
      if (i === totalCells - 1) {
        // 确保最后一个格子是终点
        if (x !== end.x || y !== end.y) {
          // 调整终点位置
          return [{ end: { x, y } }]
        }
        break
      }
      
      // 计算下一个位置
      let nextX = x
      let nextY = y
      
      switch (direction) {
        case 1: nextX++; break
        case 2: nextY++; break
        case 3: nextX--; break
        case 4: nextY--; break
      }
      
      // 检查是否需要转向
      if (nextX < 0 || nextX >= this.width || nextY < 0 || nextY >= this.height || 
          visited.has(`${nextX},${nextY}`)) {
        direction = (direction % 4) + 1
        
        // 重新计算下一个位置
        switch (direction) {
          case 1: nextX = x + 1; nextY = y; break
          case 2: nextX = x; nextY = y + 1; break
          case 3: nextX = x - 1; nextY = y; break
          case 4: nextX = x; nextY = y - 1; break
        }
      }
      
      x = nextX
      y = nextY
    }
    
    return []
  }
}

// 关卡生成器
class LevelGenerator {
  constructor() {
    this.pathfinder = new HamiltonianPath()
  }

  // 生成关卡
  generateLevel(level) {
    const baseSize = 5
    const maxSize = 30
    const growthRate = 0.5
    
    // 计算关卡大小
    let gridSize = Math.min(
      baseSize + Math.floor(level * growthRate),
      maxSize
    )
    
    // 确保网格是矩形或正方形
    let width = gridSize
    let height = gridSize
    
    // 对于高级关卡，可以尝试矩形网格
    if (level > 20) {
      width = Math.min(gridSize, Math.floor(gridSize * (0.8 + Math.random() * 0.4)))
      height = Math.min(gridSize, Math.floor(gridSize * (0.8 + Math.random() * 0.4)))
    }
    
    const start = { x: 0, y: 0 }
    const end = { x: width - 1, y: height - 1 }
    
    // 确保关卡有解
    const adjustment = this.pathfinder.generateSolvableLevel(width, height, start, end)
    
    if (adjustment.length > 0) {
      const adj = adjustment[0]
      if (adj.width) width = adj.width
      if (adj.height) height = adj.height
      if (adj.end) end.x = adj.end.x; end.y = adj.end.y
    }
    
    return {
      width,
      height,
      start,
      end,
      totalCells: width * height
    }
  }

  // 验证关卡是否有解
  validateLevel(width, height, start, end) {
    this.pathfinder.width = width
    this.pathfinder.height = height
    this.pathfinder.initGrid()
    
    return this.pathfinder.hasHamiltonianPath(start, end)
  }
}

module.exports = {
  HamiltonianPath,
  LevelGenerator
}