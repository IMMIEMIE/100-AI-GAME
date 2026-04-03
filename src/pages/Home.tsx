import React from 'react';
import { GameCanvas } from '../components/GameCanvas';
import { GameUI } from '../components/GameUI';

export default function Home() {
  return (
    <div className="relative w-full h-screen bg-gray-900 overflow-hidden">
      <GameCanvas />
      <GameUI />
      
      <div className="absolute bottom-4 left-4 text-white/50 text-sm pointer-events-none space-y-1 bg-black/30 p-4 rounded-md backdrop-blur-sm border border-white/10">
        <h3 className="font-bold text-white/70 mb-2">操作说明</h3>
        <p><span className="text-red-400 font-bold">P1 剑客:</span> WASD 移动，J 攻击，K 防御</p>
        <p><span className="text-blue-400 font-bold">P2 拳师:</span> 方向键 移动，1 攻击，2 防御</p>
      </div>
    </div>
  );
}
