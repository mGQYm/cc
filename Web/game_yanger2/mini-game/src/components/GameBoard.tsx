import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../store/gameStore';
import { GameBlock } from './GameBlock';
import { LEVEL_CONFIGS } from '../types/game';

export const GameBoard: React.FC = () => {
  const {
    blocks,
    score,
    moves,
    level,
    gameStatus,
    initializeGame,
    nextLevel,
    restartLevel,
  } = useGameStore();

  useEffect(() => {
    initializeGame();
  }, [initializeGame]);

  const config = LEVEL_CONFIGS[level - 1];
  const gameWidth = config.gridSize.width * 60;
  const gameHeight = config.gridSize.height * 60;

  const getGameStatusMessage = () => {
    switch (gameStatus) {
      case 'won':
        return '关卡完成！';
      case 'lost':
        return '游戏失败！';
      case 'completed':
        return '恭喜通关所有关卡！';
      default:
        return '';
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-green-50 p-4">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-lg p-4 mb-4 w-full max-w-md">
        <div className="flex justify-between items-center">
          <div className="text-lg font-bold text-green-800">
            第 {level} 关
          </div>
          <div className="text-sm text-gray-600">
            得分: {score}
          </div>
          <div className="text-sm text-gray-600">
            步数: {moves}
          </div>
          <button
            onClick={() => restartLevel()}
            className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
          >
            重开
          </button>
        </div>
      </div>

      {/* Game Area */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-4">
        <div
          className="relative bg-green-100 rounded-lg border-2 border-green-200"
          style={{
            width: gameWidth,
            height: gameHeight,
            perspective: '1000px',
          }}
        >
          <AnimatePresence>
            {blocks.map((block) => (
              <GameBlock key={block.id} block={block} />
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Game Status Overlay */}
      <AnimatePresence>
        {gameStatus !== 'playing' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          >
            <div className="bg-white rounded-lg p-8 text-center shadow-2xl">
              <h2 className="text-2xl font-bold mb-4 text-green-800">
                {getGameStatusMessage()}
              </h2>
              <p className="text-gray-600 mb-4">
                得分: {score} | 步数: {moves}
              </p>
              <div className="flex gap-4 justify-center">
                {gameStatus === 'won' && (
                  <button
                    onClick={nextLevel}
                    className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 font-bold"
                  >
                    下一关
                  </button>
                )}
                <button
                  onClick={() => restartLevel()}
                  className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-bold"
                >
                  {gameStatus === 'completed' ? '重新开始' : '重试'}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};