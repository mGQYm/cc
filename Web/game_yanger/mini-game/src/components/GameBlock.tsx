import React from 'react'
import { motion } from 'framer-motion'
import type { Block } from '../types/game'
import { useGameStore } from '../store/gameStore'

interface GameBlockProps {
  block: Block
}

export const GameBlock: React.FC<GameBlockProps> = ({ block }) => {
  const selectBlock = useGameStore(state => state.selectBlock)

  const handleClick = () => {
    if (block.isClickable) {
      selectBlock(block.id)
    }
  }

  // 方块颜色映射
  const patternColors: Record<string, string> = {
    sheep: '#E8D5C4',
    grass: '#90EE90',
    barn: '#CD853F',
    cow: '#F5F5DC',
    pig: '#FFB6C1',
    chicken: '#FFD700',
    duck: '#87CEEB',
    horse: '#8B4513',
    dog: '#D2B48C',
    cat: '#DDA0DD',
    tree: '#228B22',
    flower: '#FF69B4',
    sun: '#FFD700',
    moon: '#E6E6FA',
    star: '#FFFF00',
    cloud: '#F0F8FF'
  }

  return (
    <motion.div
      className={`absolute rounded-lg border-2 transition-all duration-200 ${
        block.isClickable
          ? 'border-gray-400 hover:border-blue-500 hover:scale-105 shadow-lg cursor-pointer'
          : 'border-gray-300 opacity-50 pointer-events-none'
      }`}
      style={{
        left: `${block.position.x * 0.6}px`,
        top: `${block.position.y * 0.6}px`,
        width: `${block.size.width * 0.8}px`,
        height: `${block.size.height * 0.8}px`,
        backgroundColor: patternColors[block.pattern] || '#CCCCCC',
        zIndex: block.position.z + 10,
      }}
      onClick={handleClick}
      whileHover={block.isClickable ? { scale: 1.1 } : {}}
      whileTap={block.isClickable ? { scale: 0.95 } : {}}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ duration: 0.3 }}
    >
      <div className="w-full h-full flex items-center justify-center text-xs font-bold text-gray-700">
        {block.pattern.substring(0, 2).toUpperCase()}
      </div>
    </motion.div>
  )
}