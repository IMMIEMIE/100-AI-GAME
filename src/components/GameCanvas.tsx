import React from 'react';
import { useGameEngine } from '../game/useGameEngine';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../game/constants';

export function GameCanvas() {
  const { canvasRef } = useGameEngine();

  return (
    <div className="flex justify-center items-center h-screen bg-[#0a0a0a] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-gray-800 via-gray-900 to-black">
      <div className="relative shadow-[0_0_80px_rgba(0,0,0,1)] rounded-lg overflow-hidden border-8 border-gray-800 ring-4 ring-black">
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          className="block bg-black"
        />
        {/* CRT Scanline Overlay */}
        <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%] z-10 opacity-50"></div>
        {/* Vignette */}
        <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_150px_rgba(0,0,0,0.9)] z-20"></div>
      </div>
    </div>
  );
}
