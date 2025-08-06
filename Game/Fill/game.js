const gameConfig = {
  gridWidth: 10,
  gridHeight: 10,
  cellSize: 40,
  padding: 20
};

const gameState = {
  grid: [],
  startPos: null,
  endPos: null,
  currentPath: [],
  visitedCells: new Set(),
  isDragging: false,
  dragStartPos: null,
  interactionMode: 'click', // 'click' or 'drag'
  currentLevel: 1,
  maxLevel: 100
};

const canvas = wx.createCanvas();
const context = canvas.getContext('2d');

// 调整画布大小
function resizeCanvas() {
  const info = wx.getSystemInfoSync();
  canvas.width = info.windowWidth;
  canvas.height = info.windowHeight;
  gameConfig.canvasWidth = info.windowWidth;
  gameConfig.canvasHeight = info.windowHeight;
}

// 初始化游戏
function initGame() {
  resizeCanvas();
  generateLevel(gameState.currentLevel);
  setupEventListeners();
  gameLoop();
}

// 生成关卡
function generateLevel(level) {
  const size = Math.min(5 + Math.floor(level / 5), 30);
  gameConfig.gridWidth = size;
  gameConfig.gridHeight = size;
  
  gameState.grid = [];
  for (let y = 0; y < gameConfig.gridHeight; y++) {
    gameState.grid[y] = [];
    for (let x = 0; x < gameConfig.gridWidth; x++) {
      gameState.grid[y][x] = {
        x: x,
        y: y,
        visited: false,
        isStart: false,
        isEnd: false
      };
    }
  }
  
  // 设置起点和终点
  gameState.startPos = { x: 0, y: 0 };
  gameState.endPos = { x: gameConfig.gridWidth - 1, y: gameConfig.gridHeight - 1 };
  
  gameState.grid[0][0].isStart = true;
  gameState.grid[gameConfig.gridHeight - 1][gameConfig.gridWidth - 1].isEnd = true;
  
  // 确保关卡有解
  ensureSolvable();
  
  gameState.currentPath = [];
  gameState.visitedCells = new Set();
  gameState.currentPath.push({ x: 0, y: 0 });
  gameState.visitedCells.add('0,0');
}

// 确保关卡有解的算法
function ensureSolvable() {
  // 使用哈密顿路径算法确保从起点到终点的路径存在
  // 简化版本：创建一条蛇形路径
  const path = [];
  const visited = new Set();
  const totalCells = gameConfig.gridWidth * gameConfig.gridHeight;
  
  function isValidMove(x, y) {
    return x >= 0 && x < gameConfig.gridWidth && 
           y >= 0 && y < gameConfig.gridHeight && 
           !visited.has(`${x},${y}`);
  }
  
  function findPath(x, y, depth) {
    if (depth === totalCells - 1) {
      return x === gameState.endPos.x && y === gameState.endPos.y;
    }
    
    const directions = [[0, 1], [1, 0], [0, -1], [-1, 0]];
    for (const [dx, dy] of directions) {
      const nx = x + dx;
      const ny = y + dy;
      
      if (isValidMove(nx, ny)) {
        visited.add(`${nx},${ny}`);
        if (findPath(nx, ny, depth + 1)) {
          return true;
        }
        visited.delete(`${nx},${ny}`);
      }
    }
    return false;
  }
  
  // 如果找不到解，调整关卡
  if (!findPath(0, 0, 0)) {
    // 简化网格大小
    gameConfig.gridWidth = Math.max(5, gameConfig.gridWidth - 1);
    gameConfig.gridHeight = Math.max(5, gameConfig.gridHeight - 1);
    gameState.endPos = { 
      x: gameConfig.gridWidth - 1, 
      y: gameConfig.gridHeight - 1 
    };
    ensureSolvable();
  }
}

// 绘制游戏
function draw() {
  context.clearRect(0, 0, canvas.width, canvas.height);
  
  const offsetX = (canvas.width - gameConfig.gridWidth * gameConfig.cellSize) / 2;
  const offsetY = (canvas.height - gameConfig.gridHeight * gameConfig.cellSize) / 2;
  
  // 绘制网格
  for (let y = 0; y < gameConfig.gridHeight; y++) {
    for (let x = 0; x < gameConfig.gridWidth; x++) {
      const cell = gameState.grid[y][x];
      const cellX = offsetX + x * gameConfig.cellSize;
      const cellY = offsetY + y * gameConfig.cellSize;
      
      // 绘制单元格背景
      if (cell.isStart) {
        context.fillStyle = '#4CAF50';
      } else if (cell.isEnd) {
        context.fillStyle = '#FF5722';
      } else if (cell.visited) {
        context.fillStyle = '#E3F2FD';
      } else {
        context.fillStyle = '#FFFFFF';
      }
      
      context.fillRect(cellX, cellY, gameConfig.cellSize - 1, gameConfig.cellSize - 1);
      
      // 绘制边框
      context.strokeStyle = '#1976D2';
      context.strokeRect(cellX, cellY, gameConfig.cellSize - 1, gameConfig.cellSize - 1);
      
      // 绘制路径
      if (gameState.visitedCells.has(`${x},${y}`)) {
        context.fillStyle = '#2196F3';
        context.fillRect(cellX + 5, cellY + 5, gameConfig.cellSize - 10, gameConfig.cellSize - 10);
      }
    }
  }
  
  // 绘制当前路径连线
  if (gameState.currentPath.length > 1) {
    context.strokeStyle = '#FF9800';
    context.lineWidth = 3;
    context.beginPath();
    
    for (let i = 0; i < gameState.currentPath.length; i++) {
      const pos = gameState.currentPath[i];
      const x = offsetX + pos.x * gameConfig.cellSize + gameConfig.cellSize / 2;
      const y = offsetY + pos.y * gameConfig.cellSize + gameConfig.cellSize / 2;
      
      if (i === 0) {
        context.moveTo(x, y);
      } else {
        context.lineTo(x, y);
      }
    }
    context.stroke();
  }
  
  // 绘制关卡信息
  context.fillStyle = '#000000';
  context.font = '20px Arial';
  context.fillText(`第 ${gameState.currentLevel} 关`, 10, 30);
  context.fillText(`剩余格子: ${gameConfig.gridWidth * gameConfig.gridHeight - gameState.currentPath.length}`, 10, 60);
}

// 获取点击的格子坐标
function getCellFromPosition(x, y) {
  const offsetX = (canvas.width - gameConfig.gridWidth * gameConfig.cellSize) / 2;
  const offsetY = (canvas.height - gameConfig.gridHeight * gameConfig.cellSize) / 2;
  
  const cellX = Math.floor((x - offsetX) / gameConfig.cellSize);
  const cellY = Math.floor((y - offsetY) / gameConfig.cellSize);
  
  if (cellX >= 0 && cellX < gameConfig.gridWidth && cellY >= 0 && cellY < gameConfig.gridHeight) {
    return { x: cellX, y: cellY };
  }
  return null;
}

// 检查移动是否有效
function isValidMove(from, to) {
  if (!from || !to) return false;
  
  const dx = Math.abs(to.x - from.x);
  const dy = Math.abs(to.y - from.y);
  
  // 只能上下左右移动一格
  if ((dx === 1 && dy === 0) || (dx === 0 && dy === 1)) {
    // 检查是否已经访问过
    return !gameState.visitedCells.has(`${to.x},${to.y}`);
  }
  
  return false;
}

// 移动到新格子
function moveToCell(cell) {
  if (!cell || !isValidMove(gameState.currentPath[gameState.currentPath.length - 1], cell)) {
    return;
  }
  
  gameState.currentPath.push(cell);
  gameState.visitedCells.add(`${cell.x},${cell.y}`);
  gameState.grid[cell.y][cell.x].visited = true;
  
  // 检查是否到达终点
  if (cell.x === gameState.endPos.x && cell.y === gameState.endPos.y) {
    checkGameResult();
  }
}

// 检查游戏结果
function checkGameResult() {
  const totalCells = gameConfig.gridWidth * gameConfig.gridHeight;
  const visitedCells = gameState.visitedCells.size;
  
  if (visitedCells === totalCells) {
    // 游戏成功
    showSuccessDialog();
  } else {
    // 游戏失败
    showFailDialog();
  }
}

// 显示成功对话框
function showSuccessDialog() {
  wx.showModal({
    title: '恭喜通关！',
    content: `你成功完成了第${gameState.currentLevel}关！`,
    showCancel: true,
    cancelText: '重玩',
    confirmText: '下一关',
    success: (res) => {
      if (res.confirm) {
        if (gameState.currentLevel < gameState.maxLevel) {
          gameState.currentLevel++;
          generateLevel(gameState.currentLevel);
        } else {
          wx.showToast({
            title: '恭喜通关所有关卡！',
            icon: 'success'
          });
        }
      } else {
        generateLevel(gameState.currentLevel);
      }
    }
  });
}

// 显示失败对话框
function showFailDialog() {
  wx.showModal({
    title: '游戏失败',
    content: '还有未走过的格子，请重试！',
    showCancel: false,
    confirmText: '重玩一次',
    success: () => {
      generateLevel(gameState.currentLevel);
    }
  });
}

// 设置事件监听器
function setupEventListeners() {
  // 触摸开始
  wx.onTouchStart((e) => {
    const touch = e.touches[0];
    const cell = getCellFromPosition(touch.clientX, touch.clientY);
    
    if (cell) {
      gameState.isDragging = true;
      gameState.dragStartPos = cell;
    }
  });
  
  // 触摸移动
  wx.onTouchMove((e) => {
    if (!gameState.isDragging || gameState.interactionMode !== 'drag') return;
    
    const touch = e.touches[0];
    const cell = getCellFromPosition(touch.clientX, touch.clientY);
    
    if (cell && isValidMove(gameState.currentPath[gameState.currentPath.length - 1], cell)) {
      moveToCell(cell);
    }
  });
  
  // 触摸结束
  wx.onTouchEnd((e) => {
    if (gameState.interactionMode === 'click' && gameState.isDragging) {
      const touch = e.changedTouches[0];
      const cell = getCellFromPosition(touch.clientX, touch.clientY);
      
      if (cell && isValidMove(gameState.currentPath[gameState.currentPath.length - 1], cell)) {
        moveToCell(cell);
      }
    }
    
    gameState.isDragging = false;
    gameState.dragStartPos = null;
  });
}

// 游戏循环
function gameLoop() {
  draw();
  requestAnimationFrame(gameLoop);
}

// 启动游戏
initGame();