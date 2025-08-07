export interface Block {
  id: string
  pattern: string // 16种图案之一
  position: { x: number; y: number; z: number }
  size: { width: number; height: number }
  isClickable: boolean
  layer: number // 0-2层
}

export interface GameState {
  blocks: Block[]
  slot: Block[] // 7格槽位
  score: number
  status: 'playing' | 'won' | 'lost' | 'paused'
  moves: number
  level: number
  dailySeed: number
  maxLevel: number
}

export interface LevelConfig {
  seed: number
  layout: Array<{
    pattern: string
    x: number
    y: number
    z: number
  }>
}

export type GamePattern = 
  | 'sheep' | 'grass' | 'barn' | 'cow' | 'pig' | 'chicken' 
  | 'duck' | 'horse' | 'dog' | 'cat' | 'tree' | 'flower'
  | 'sun' | 'moon' | 'star' | 'cloud'