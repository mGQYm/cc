import React from 'react'
import { motion } from 'framer-motion'
import type { Block } from '../types/game'

interface SlotCollectionProps {
  slot: Block[]
}

export const SlotCollection: React.FC<SlotCollectionProps> = ({ slot }) => {
  const isFull = slot.length >= 7
  const isWarning = slot.length >= 5

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
    <div className="w-full max-w-md">
      <div className={`grid grid-cols-7 gap-2 p-4 rounded-lg border-2 transition-all duration-300 ${
        isFull ? 'border-red-500 bg-red-100' : 
        isWarning ? 'border-orange-500 bg-orange-100' : 
        'border-gray-300 bg-white'
      }`}>
        {Array.from({ length: 7 }).map((_, index) => {
          const block = slot[index]
          return (
            <motion.div
              key={index}
              className={`w-full aspect-square rounded-lg border-2 flex items-center justify-center ${
                block 
                  ? 'border-gray-400 shadow-md' 
                  : 'border-dashed border-gray-300 bg-gray-50'
              }`}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ 
                scale: 1, 
                opacity: 1,
                backgroundColor: block ? patternColors[block.pattern] : '#F9FAFB'
              }}
              transition={{ duration: 0.3 }}
            >
              {block && (
                <span className="text-xs font-bold text-gray-700">
                  {block.pattern.substring(0, 2).toUpperCase()}
                </span>
              )}
            </motion.div>
          )
        })}
      </div>
      
      {isWarning && (
        <motion.div
          className="text-center mt-2 text-red-600 text-sm font-bold"
          animate={{ opacity: [1, 0.5, 1] }}
          transition={{ duration: 0.5, repeat: Infinity }}
        >
          {isFull ? '槽位已满！' : `警告：剩余 ${7 - slot.length} 个槽位`}
        </motion.div>
      )}
    </div>
  )
}