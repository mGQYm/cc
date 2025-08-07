import React from 'react';
import { GameBoard } from './components/GameBoard';
import { SlotCollection } from './components/SlotCollection';

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-100 to-blue-100">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-center text-green-800 mb-2">
          农场消消乐
        </h1>
        <p className="text-center text-gray-600 mb-8">
          3D层叠消除游戏 - 点击可见方块收集，3个相同自动消除
        </p>
        
        <div className="flex flex-col items-center space-y-4">
          <GameBoard />
          <SlotCollection />
        </div>
      </div>
    </div>
  );
}

export default App;