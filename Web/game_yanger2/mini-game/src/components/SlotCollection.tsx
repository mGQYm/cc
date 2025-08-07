import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FARM_PATTERN_EMOJIS, FarmPattern } from '../types/game';
import { useGameStore } from '../store/gameStore';

interface SlotCollectionProps {}

export const SlotCollection: React.FC<SlotCollectionProps> = () => {
  const slots = useGameStore(state => state.slots);

  return (
    <div className="bg-white rounded-lg shadow-lg p-4 w-full max-w-md">
      <div className="text-center mb-4">
        <h3 className="text-lg font-bold text-green-800">收集槽位</h3>
        <p className="text-sm text-gray-600">7个位置，3个相同可消除</p>
      </div>
      
      <div className="flex justify-center gap-2">
        {[0, 1, 2, 3, 4, 5, 6].map((index) => {
          const pattern = slots[index];
          const isFilled = !!pattern;
          const emoji = pattern ? FARM_PATTERN_EMOJIS[pattern] : '';
          
          return (
            <motion.div
              key={index}
              className={`
                w-14 h-14 rounded-lg border-2 flex items-center justify-center text-2xl
                ${isFilled 
                  ? 'bg-green-100 border-green-400' 
                  : 'bg-gray-100 border-gray-300'
                }
              `}
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              transition={{ duration: 0.2 }}
            >
              <AnimatePresence mode="wait">
                {isFilled ? (
                  <motion.span
                    key={pattern}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    {emoji}
                  </motion.span>
                ) : (
                  <span className="text-gray-400 text-sm">{index + 1}</span>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
      
      {slots.length >= 7 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mt-4 text-red-500 font-bold"
        >
          槽位已满！游戏结束
        </motion.div>
      )}
    </div>
  );
};