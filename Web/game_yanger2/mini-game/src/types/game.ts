export interface Block {
  id: string;
  type: FarmPattern;
  x: number;
  y: number;
  z: number;
  isVisible: boolean;
  isSelected: boolean;
  isCovered: boolean;
}

export interface GameState {
  blocks: Block[];
  slots: FarmPattern[];
  score: number;
  moves: number;
  level: number;
  gameStatus: 'playing' | 'won' | 'lost' | 'completed';
  selectedBlockId: string | null;
}

export type FarmPattern = 
  | 'sheep'
  | 'grass'
  | 'barn'
  | 'cow'
  | 'pig'
  | 'chicken'
  | 'duck'
  | 'horse'
  | 'dog'
  | 'cat'
  | 'tree'
  | 'flower'
  | 'sun'
  | 'moon'
  | 'star'
  | 'cloud';

export interface LevelConfig {
  level: number;
  layers: number;
  gridSize: { width: number; height: number };
  patternCount: number;
  difficulty: number;
}

export const FARM_PATTERNS: FarmPattern[] = [
  'sheep',
  'grass',
  'barn',
  'cow',
  'pig',
  'chicken',
  'duck',
  'horse',
  'dog',
  'cat',
  'tree',
  'flower',
  'sun',
  'moon',
  'star',
  'cloud'
];

export const FARM_PATTERN_EMOJIS: Record<FarmPattern, string> = {
  sheep: '🐑',
  grass: '🌱',
  barn: '🏠',
  cow: '🐄',
  pig: '🐷',
  chicken: '🐔',
  duck: '🦆',
  horse: '🐎',
  dog: '🐕',
  cat: '🐈',
  tree: '🌳',
  flower: '🌸',
  sun: '☀️',
  moon: '🌙',
  star: '⭐',
  cloud: '☁️'
};

export const LEVEL_CONFIGS: LevelConfig[] = [
  {
    level: 1,
    layers: 3,
    gridSize: { width: 4, height: 4 },
    patternCount: 16,
    difficulty: 1
  },
  {
    level: 2,
    layers: 3,
    gridSize: { width: 4, height: 4 },
    patternCount: 15,
    difficulty: 2
  },
  {
    level: 3,
    layers: 4,
    gridSize: { width: 5, height: 5 },
    patternCount: 14,
    difficulty: 3
  },
  {
    level: 4,
    layers: 4,
    gridSize: { width: 5, height: 5 },
    patternCount: 13,
    difficulty: 4
  },
  {
    level: 5,
    layers: 5,
    gridSize: { width: 6, height: 6 },
    patternCount: 12,
    difficulty: 5
  }
];