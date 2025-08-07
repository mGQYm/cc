import { create } from 'zustand';
import { GameState, Block, FarmPattern, LEVEL_CONFIGS, FARM_PATTERNS, FARM_PATTERN_EMOJIS } from '../types/game';

interface GameStore extends GameState {
  initializeGame: () => void;
  initializeLevel: (level: number) => void;
  selectBlock: (blockId: string) => void;
  addToSlot: (pattern: FarmPattern) => void;
  checkElimination: () => void;
  resetGame: () => void;
  nextLevel: () => void;
  restartLevel: () => void;
  getVisibleBlocks: () => Block[];
  getTopBlocks: () => Block[];
}

const generateBlocks = (level: number): Block[] => {
  const config = LEVEL_CONFIGS[level - 1];
  const blocks: Block[] = [];
  const patterns = FARM_PATTERNS.slice(0, config.patternCount);
  
  let idCounter = 0;
  
  for (let layer = 0; layer < config.layers; layer++) {
    for (let y = 0; y < config.gridSize.height; y++) {
      for (let x = 0; x < config.gridSize.width; x++) {
        if (Math.random() > 0.3) { // 70% chance to place a block
          const pattern = patterns[Math.floor(Math.random() * patterns.length)];
          blocks.push({
            id: `block-${idCounter++}`,
            type: pattern,
            x,
            y,
            z: layer,
            isVisible: layer === config.layers - 1, // Top layer visible by default
            isSelected: false,
            isCovered: false
          });
        }
      }
    }
  }
  
  // Ensure we have enough blocks for the game
  const minBlocks = 20 + (level * 5);
  while (blocks.length < minBlocks) {
    const pattern = patterns[Math.floor(Math.random() * patterns.length)];
    const x = Math.floor(Math.random() * config.gridSize.width);
    const y = Math.floor(Math.random() * config.gridSize.height);
    const z = Math.floor(Math.random() * config.layers);
    
    blocks.push({
      id: `block-${idCounter++}`,
      type: pattern,
      x,
      y,
      z,
      isVisible: z === config.layers - 1,
      isSelected: false,
      isCovered: false
    });
  }
  
  return blocks;
};

const updateBlockVisibility = (blocks: Block[]): Block[] => {
  const maxZByPosition: Record<string, number> = {};
  
  // Find the maximum z-index for each position
  blocks.forEach(block => {
    const key = `${block.x}-${block.y}`;
    if (!maxZByPosition[key] || block.z > maxZByPosition[key]) {
      maxZByPosition[key] = block.z;
    }
  });
  
  // Update visibility based on z-index
  return blocks.map(block => ({
    ...block,
    isVisible: block.z === maxZByPosition[`${block.x}-${block.y}`],
    isCovered: block.z < maxZByPosition[`${block.x}-${block.y}`]
  }));
};

export const useGameStore = create<GameStore>((set, get) => ({
  blocks: [],
  slots: [],
  score: 0,
  moves: 0,
  level: 1,
  gameStatus: 'playing',
  selectedBlockId: null,

  initializeGame: () => {
    set({ level: 1 });
    get().initializeLevel(1);
  },

  initializeLevel: (level: number) => {
    const blocks = generateBlocks(level);
    const updatedBlocks = updateBlockVisibility(blocks);
    
    set({
      blocks: updatedBlocks,
      slots: [],
      score: 0,
      moves: 0,
      level,
      gameStatus: 'playing',
      selectedBlockId: null
    });
  },

  selectBlock: (blockId: string) => {
    const state = get();
    const block = state.blocks.find(b => b.id === blockId);
    
    if (!block || !block.isVisible || state.slots.length >= 7) return;
    
    // Remove the block from the game
    const newBlocks = state.blocks.filter(b => b.id !== blockId);
    const updatedBlocks = updateBlockVisibility(newBlocks);
    
    // Add to slots
    const newSlots = [...state.slots, block.type];
    
    set({
      blocks: updatedBlocks,
      slots: newSlots,
      moves: state.moves + 1,
      selectedBlockId: null
    });
    
    // Check for elimination
    setTimeout(() => {
      get().checkElimination();
    }, 100);
  },

  checkElimination: () => {
    const state = get();
    const slots = state.slots;
    const counts: Record<string, number> = {};
    
    // Count occurrences of each pattern
    slots.forEach(pattern => {
      counts[pattern] = (counts[pattern] || 0) + 1;
    });
    
    // Find patterns with 3 or more occurrences
    let newSlots = [...slots];
    let eliminated = 0;
    
    Object.entries(counts).forEach(([pattern, count]) => {
      if (count >= 3) {
        // Remove 3 occurrences of this pattern
        let removed = 0;
        newSlots = newSlots.filter(slot => {
          if (slot === pattern && removed < 3) {
            removed++;
            return false;
          }
          return true;
        });
        eliminated += 3;
      }
    });
    
    if (eliminated > 0) {
      set({
        slots: newSlots,
        score: state.score + eliminated * 10
      });
    }
    
    // Check win/lose conditions
    setTimeout(() => {
      const currentState = get();
      
      if (currentState.blocks.length === 0) {
        // All blocks cleared - level complete
        if (currentState.level === 5) {
          set({ gameStatus: 'completed' });
        } else {
          set({ gameStatus: 'won' });
        }
      } else if (currentState.slots.length >= 7) {
        // Slots full - game over
        set({ gameStatus: 'lost' });
      }
    }, 200);
  },

  resetGame: () => {
    set({ level: 1 });
    get().initializeLevel(1);
  },

  nextLevel: () => {
    const state = get();
    if (state.level < 5) {
      const newLevel = state.level + 1;
      get().initializeLevel(newLevel);
    }
  },

  restartLevel: () => {
    const state = get();
    get().initializeLevel(state.level);
  },

  getVisibleBlocks: () => {
    const state = get();
    return state.blocks.filter(block => block.isVisible);
  },

  getTopBlocks: () => {
    const state = get();
    const visibleBlocks = state.blocks.filter(block => block.isVisible);
    
    // Group by position and get top blocks
    const topBlocks: Block[] = [];
    const positionMap: Record<string, Block> = {};
    
    visibleBlocks.forEach(block => {
      const key = `${block.x}-${block.y}`;
      if (!positionMap[key] || block.z > positionMap[key].z) {
        positionMap[key] = block;
      }
    });
    
    return Object.values(positionMap);
  }
}));