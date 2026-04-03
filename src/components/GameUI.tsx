import React from 'react';
import { useGameStore } from '../store/gameStore';

export function GameUI() {
  const { player1Health, player2Health, timer, gameOver, winner, resetGame } = useGameStore();

  return (
    <div className="absolute top-0 left-0 w-full p-4 pointer-events-none flex flex-col items-center select-none">
      {/* 顶部状态栏 */}
      <div className="flex justify-between items-center w-full max-w-4xl">
        {/* P1 血量条 */}
        <div className="relative w-1/3 h-8 bg-gray-800 border-4 border-gray-900 shadow-md">
          <div
            className="absolute top-0 right-0 h-full bg-red-500 transition-all duration-200"
            style={{ width: `${player1Health}%` }}
          />
        </div>

        {/* 计时器 */}
        <div className="w-20 h-20 bg-gray-900 border-4 border-yellow-600 rounded-sm flex items-center justify-center text-yellow-500 text-4xl font-bold font-mono shadow-lg mx-4">
          {timer}
        </div>

        {/* P2 血量条 */}
        <div className="relative w-1/3 h-8 bg-gray-800 border-4 border-gray-900 shadow-md">
          <div
            className="absolute top-0 left-0 h-full bg-blue-500 transition-all duration-200"
            style={{ width: `${player2Health}%` }}
          />
        </div>
      </div>

      {/* 游戏结束界面 */}
      {gameOver && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 pointer-events-auto z-10 w-screen h-screen">
          <div className="bg-gray-900 border-4 border-yellow-600 p-8 text-center shadow-2xl flex flex-col items-center">
            <h2 className="text-6xl font-bold text-yellow-500 mb-6 font-mono tracking-widest drop-shadow-md">
              {winner === 'Tie' ? '平局' : winner === 'Player 1 Wins' ? '剑客 胜' : '拳师 胜'}
            </h2>
            <button
              onClick={resetGame}
              className="px-8 py-3 bg-red-600 hover:bg-red-500 text-white font-bold text-xl border-b-4 border-red-800 active:border-b-0 active:translate-y-1 transition-all"
            >
              再来一局
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
