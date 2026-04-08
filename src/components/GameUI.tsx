import React from 'react';
import { useGameStore } from '../store/gameStore';

export function GameUI() {
  const { player1Health, player2Health, timer, gameOver, winner, resetGame } = useGameStore();

  return (
    <div className="absolute top-0 left-0 w-full p-6 pointer-events-none flex flex-col items-center select-none">
      {/* 顶部状态栏 */}
      <div className="flex justify-between items-start w-full max-w-5xl relative z-30">
        {/* P1 血量区域 */}
        <div className="w-[40%] flex flex-col">
          <div className="flex justify-between text-white font-bold mb-1 px-2 font-mono text-xl tracking-widest drop-shadow-[0_2px_2px_rgba(0,0,0,1)]">
            <span className="text-red-400">PLAYER 1</span>
            <span>剑客</span>
          </div>
          <div className="relative h-8 bg-gray-900 border-4 border-gray-700 shadow-[0_0_15px_rgba(0,0,0,0.8)] skew-x-[-15deg] overflow-hidden rounded-sm">
            <div
              className="absolute top-0 right-0 h-full bg-gradient-to-l from-red-500 to-red-700 transition-all duration-200 shadow-[0_0_15px_rgba(239,68,68,0.8)]"
              style={{ width: `${player1Health}%` }}
            />
          </div>
        </div>

        {/* 计时器 */}
        <div className="w-24 h-24 bg-gray-900 border-4 border-yellow-600 rounded-full flex items-center justify-center text-yellow-500 text-5xl font-black font-mono shadow-[0_0_20px_rgba(202,138,4,0.5)] mx-6 -mt-2 z-10 relative">
          <div className="absolute inset-0 rounded-full border-4 border-yellow-900/50 scale-110"></div>
          {timer}
        </div>

        {/* P2 血量区域 */}
        <div className="w-[40%] flex flex-col">
          <div className="flex justify-between text-white font-bold mb-1 px-2 font-mono text-xl tracking-widest drop-shadow-[0_2px_2px_rgba(0,0,0,1)]">
            <span>拳师</span>
            <span className="text-blue-400">PLAYER 2</span>
          </div>
          <div className="relative h-8 bg-gray-900 border-4 border-gray-700 shadow-[0_0_15px_rgba(0,0,0,0.8)] skew-x-[15deg] overflow-hidden rounded-sm">
            <div
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-blue-700 transition-all duration-200 shadow-[0_0_15px_rgba(59,130,246,0.8)]"
              style={{ width: `${player2Health}%` }}
            />
          </div>
        </div>
      </div>

      {/* 游戏结束界面 */}
      {gameOver && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/60 pointer-events-auto z-40 w-screen h-screen backdrop-blur-sm">
          <div className="bg-gray-900 border-4 border-yellow-600 p-12 text-center shadow-[0_0_50px_rgba(202,138,4,0.3)] flex flex-col items-center transform scale-110">
            <div className="text-yellow-600 font-bold text-2xl mb-2 tracking-widest uppercase">MATCH OVER</div>
            <h2 className="text-7xl font-black text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 to-yellow-600 mb-8 font-mono tracking-widest filter drop-shadow-[0_5px_5px_rgba(0,0,0,1)]">
              {winner === 'Tie' ? 'DRAW GAME' : winner === 'Player 1 Wins' ? '剑客 胜' : '拳师 胜'}
            </h2>
            <button
              onClick={resetGame}
              className="px-10 py-4 bg-gradient-to-b from-red-500 to-red-700 hover:from-red-400 hover:to-red-600 text-white font-bold text-2xl border-b-4 border-red-900 active:border-b-0 active:translate-y-1 transition-all rounded shadow-lg"
            >
              INSERT COIN (REPLAY)
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
