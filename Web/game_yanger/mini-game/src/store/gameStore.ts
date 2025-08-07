import { create } from 'zustand'
import type { GameState, Block, LevelConfig, GamePattern } from '../types/game'

interface GameStore extends GameState {
  initializeLevel: (level: number, seed: number) => void
  selectBlock: (blockId: string) => void
  checkWinCondition: () => boolean
  checkLoseCondition: () => boolean
  resetGame: () => void
  updateClickableBlocks: () => void
}

const PATTERNS: GamePattern[] = [
  'sheep', 'grass', 'barn', 'cow', 'pig', 'chicken', 
  'duck', 'horse', 'dog', 'cat', 'tree', 'flower',
  'sun', 'moon', 'star', 'cloud'
]

// 简单的伪随机数生成器，基于种子
class SeededRandom {
  private seed: number
  
  constructor(seed: number) {
    this.seed = seed
  }
  
  next(): number {
    this.seed = (this.seed * 9301 + 49297) % 233280
    return this.seed / 233280
  }
  
  nextInt(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min
  }
}

// 根据关卡生成不同难度的布局
function generateLevelLayout(seed: number, level: number = 1): LevelConfig {
  const random = new SeededRandom(seed + level * 1000) // 每关使用不同的种子
  const layout = []
  
  // 根据关卡调整层数和方块数量
  const layers = Math.min(3 + Math.floor(level / 2), 5) // 最多5层
  const gridSize = Math.min(3 + Math.floor(level / 3), 6) // 最多6x6网格
  const totalBlocks = layers * gridSize * gridSize
  
  // 根据关卡减少可用图案类型（增加难度）
  const availablePatterns = PATTERNS.slice(0, Math.max(8, PATTERNS.length - level))
  
  for (let layer = 0; layer < layers; layer++) {
    const layerOffset = (layers - 1 - layer) * 20 // 高层在上
    
    for (let row = 0; row < gridSize; row++) {
      for (let col = 0; col < gridSize; col++) {
        // 根据关卡调整出现概率
        if (random.next() > (0.1 + level * 0.05)) { // 关卡越高，方块越少
          const pattern = availablePatterns[random.nextInt(0, availablePatterns.length - 1)]
          
          // 计算位置，根据关卡调整密集度
          const baseX = 20 + col * (280 / (gridSize - 1))
          const baseY = 50 + row * (280 / (gridSize - 1))
          const offsetX = random.nextInt(-15, 15)
          const offsetY = random.nextInt(-15, 15)
          
          layout.push({
            pattern,
            x: Math.max(10, Math.min(290, baseX + offsetX)),
            y: Math.max(10, Math.min(290, baseY + offsetY)),
            z: layer + layerOffset
          })
        }
      }
    }
  }
  
  return { seed, layout }
}

// 检查方块是否被其他方块覆盖
function isBlockCovered(block: Block, allBlocks: Block[]): boolean {
  return allBlocks.some(other => 
    other.id !== block.id &&
    other.layer > block.layer &&
    // 检查other是否覆盖block
    Math.abs(other.position.x - block.position.x) < block.size.width * 0.8 &&
    Math.abs(other.position.y - block.position.y) < block.size.height * 0.8
  )
}

export const useGameStore = create<GameStore>((set, get) => ({
  blocks: [],
  slot: [],
  score: 0,
  status: 'playing',
  moves: 0,
  level: 1,
  dailySeed: parseInt(new Date().toISOString().split('T')[0].replace(/-/g, '')),
  maxLevel: 5,

  initializeLevel: (level: number, seed: number) => {
    const config = generateLevelLayout(seed, level)
    const blocks: Block[] = config.layout.map((block, index) => ({
      id: `block-${index}`,
      pattern: block.pattern,
      position: { x: block.x, y: block.y, z: block.z },
      size: { width: 40, height: 40 },
      isClickable: true,
      layer: block.z
    }))

    // 初始计算可点击状态
    const clickableBlocks = blocks.map(block => ({
      ...block,
      isClickable: !isBlockCovered(block, blocks)
    }))

    set({
      blocks: clickableBlocks,
      slot: [],
      score: 0,
      status: 'playing',
      moves: 0,
      level,
      dailySeed: seed
    })
  },

  selectBlock: (blockId: string) => {
    const state = get()
    if (state.status !== 'playing') return

    const block = state.blocks.find(b => b.id === blockId)
    if (!block || !block.isClickable) return

    const newSlot = [...state.slot, block]
    const newBlocks = state.blocks.filter(b => b.id !== blockId)
    
    // 更新可点击状态
    const updatedBlocks = newBlocks.map(b => ({
      ...b,
      isClickable: !isBlockCovered(b, newBlocks)
    }))

    // 检查3个相同图案的方块
    let finalSlot = [...newSlot]
    const patternCounts: Record<string, Block[]> = {}
    
    newSlot.forEach(item => {
      if (!patternCounts[item.pattern]) {
        patternCounts[item.pattern] = []
      }
      patternCounts[item.pattern].push(item)
    })

    let eliminated = false
    Object.entries(patternCounts).forEach(([pattern, blocks]) => {
      if (blocks.length >= 3) {
        finalSlot = finalSlot.filter(b => b.pattern !== pattern)
        eliminated = true
      }
    })

    const newMoves = state.moves + 1
    
    set({
      blocks: updatedBlocks,
      slot: finalSlot,
      moves: newMoves,
      score: state.score + (eliminated ? 100 : 0)
    })

    // 检查游戏状态
    setTimeout(() => {
      const currentState = get()
      if (currentState.checkWinCondition()) {
        set({ status: 'won' })
      } else if (currentState.checkLoseCondition()) {
        set({ status: 'lost' })
      }
    }, 100)
  },

  checkWinCondition: () => {
    const state = get()
    return state.blocks.length === 0
  },

  checkLoseCondition: () => {
    const state = get()
    return state.slot.length >= 7
  },

  resetGame: () => {
    const state = get()
    state.initializeLevel(state.level, state.dailySeed)
  },

  updateClickableBlocks: () => {
    const state = get()
    const updatedBlocks = state.blocks.map(block => ({
      ...block,
      isClickable: !isBlockCovered(block, state.blocks)
    }))
    set({ blocks: updatedBlocks })
  }
}))