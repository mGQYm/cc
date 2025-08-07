import React from 'react';
import { motion } from 'framer-motion';
import { Block, FARM_PATTERN_EMOJIS } from '../types/game';
import { useGameStore } from '../store/gameStore';

interface GameBlockProps {
  block: Block;
}

export const GameBlock: React.FC<GameBlockProps> = ({ block }) => {
  const selectBlock = useGameStore(state => state.selectBlock);
  
  const handleClick = () => {
    if (block.isVisible && !block.isSelected) {
      selectBlock(block.id);
    }
  };

  const emoji = FARM_PATTERN_EMOJIS[block.type];
  
  return (
    <motion.div
      className={`
        absolute w-12 h-12 rounded-lg border-2 cursor-pointer
        flex items-center justify-center text-2xl
        transition-all duration-200 select-none
        ${
          block.isVisible
            ? 'bg-white border-green-300 hover:border-green-500 hover:scale-105 shadow-md'
            : 'bg-gray-200 border-gray-300 opacity-50 pointer-events-none'
        }
        ${
          block.isCovered
            ? 'pointer-events-none opacity-40'
            : ''
        }
      `}
      style={{
        left: `${block.x * 60}px`,
        top: `${block.y * 60}px`,
        zIndex: block.z * 10,
        transform: `translateZ(${block.z * 4}px)`,
      }}
      onClick={handleClick}
      whileHover={block.isVisible ? { scale: 1.05 } : {}}
      whileTap={block.isVisible ? { scale: 0.95 } : {}}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ duration: 0.2 }}
    >
      {emoji}
    </motion.div>
  );
};