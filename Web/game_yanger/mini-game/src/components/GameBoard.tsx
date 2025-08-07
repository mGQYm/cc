import React, { useEffect } from 'react'
import { motion } from 'framer-motion'
import { useGameStore } from '../store/gameStore'
import { GameBlock } from './GameBlock'
import { SlotCollection } from './SlotCollection'

export const GameBoard: React.FC = () => {
  const {
    blocks,
    slot,
    score,
    status,
    moves,
    level,
    maxLevel,
    initializeLevel
  } = useGameStore()

  useEffect(() => {
    // 使用当前日期作为种子
    const today = new Date()
    const seed = parseInt(today.toISOString().split('T')[0].replace(/-/g, ''))
    initializeLevel(1, seed)
  }, [])

  const handleReset = () => {
    const today = new Date()
    const seed = parseInt(today.toISOString().split('T')[0].replace(/-/g, ''))
    initializeLevel(1, seed)
  }

  const handleNextLevel = () => {
    const today = new Date()
    const seed = parseInt(today.toISOString().split('T')[0].replace(/-/g, ''))
    initializeLevel(level + 1, seed)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-100 to-green-100 flex flex-col items-center p-4">
      {/* 游戏状态栏 */}
      <div className="w-full max-w-md mb-4">
        <div className="flex justify-between items-center">
          <div className="bg-white rounded-lg px-3 py-2 shadow-md">
            <div className="text-xs text-gray-600">得分</div>
            <div className="text-lg font-bold text-blue-600">{score}</div>
          </div>
          
          <div className="bg-white rounded-lg px-3 py-2 shadow-md">
            <div className="text-xs text-gray-600">步数</div>
            <div className="text-lg font-bold text-purple-600">{moves}</div>
          </div>

          <div className="bg-white rounded-lg px-3 py-2 shadow-md">
            <div className="text-xs text-gray-600">关卡</div>
            <div className="text-lg font-bold text-orange-600">{level}/{maxLevel}</div>
          </div>

          <button
            onClick={handleReset}
            className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-lg shadow-md transition-colors text-sm"
          >
            重开
          </button>
        </div>
      </div>

      {/* 游戏区域 - 缩小高度给下方槽位留出空间 */}
      <div className="relative w-full max-w-md mx-auto" style={{ height: '50vh', maxHeight: '400px' }}>
        {blocks.map((block) => (
          <GameBlock key={block.id} block={block} />
        ))}
        
        {/* 游戏状态遮罩 - 防止在游戏结束或胜利时继续点击 */}
        {(status === 'won' || status === 'lost') && (
          <div className="absolute inset-0 bg-white bg-opacity-30 pointer-events-none" style={{ zIndex: 50 }} />
        )}
      </div>

      {/* 7格槽位 - 放在最下方 */}
      <div className="w-full max-w-md mt-4">
        <SlotCollection slot={slot} />
      </div>

      {/* 游戏状态覆盖层 */}
      {(status === 'won' || status === 'lost') && (
        <motion.div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{ zIndex: 100 }}
        >
          <motion.div
            className="bg-white rounded-lg p-8 sm:p-12 text-center shadow-2xl max-w-sm w-full mx-4"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {status === 'won' ? (
              <>
                <h2 className="text-4xl font-bold text-green-600 mb-6">🎉 恭喜通关！</h2>
                <p className="text-lg text-gray-600 mb-2">第 {level} 关完成！</p>
                <p className="text-gray-600 mb-4 text-lg">你用了 {moves} 步完成了挑战</p>
                <p className="text-2xl font-bold text-blue-600 mb-8">得分: {score}</p>
                {level < maxLevel ? (
                  <div className="flex gap-4">
                    <button
                      onClick={handleNextLevel}
                      className="bg-green-500 hover:bg-green-600 text-white px-6 py-4 rounded-lg font-bold text-lg flex-1"
                    >
                      下一关
                    </button>
                    <button
                      onClick={handleReset}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-4 rounded-lg font-bold text-lg flex-1"
                    >
                      重玩
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-4">
                    <p className="text-xl font-bold text-purple-600">🎊 恭喜通关所有关卡！</p>
                    <button
                      onClick={handleReset}
                      className="bg-green-500 hover:bg-green-600 text-white px-8 py-4 rounded-lg font-bold text-lg w-full"
                    >
                      重新开始
                    </button>
                  </div>
                )}
              </>
            ) : (
              <>
                <h2 className="text-4xl font-bold text-red-600 mb-6">😢 游戏结束</h2>
                <p className="text-gray-600 mb-4 text-lg">第 {level} 关失败：槽位已满</p>
                <p className="text-2xl font-bold text-blue-600 mb-8">得分: {score}</p>
                <button
                  onClick={handleReset}
                  className="bg-red-500 hover:bg-red-600 text-white px-8 py-4 rounded-lg font-bold text-lg w-full"
                >
                  重新开始
                </button>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </div>
  )
}