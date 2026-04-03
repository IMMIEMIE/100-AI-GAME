import React from 'react';
import { useGameEngine } from '../game/useGameEngine';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../game/constants';

export function GameCanvas() {
  const { canvasRef } = useGameEngine();

  return (
    <div className="flex justify-center items-center h-screen bg-gray-900">
      <div className="relative shadow-[0_0_50px_rgba(0,0,0,0.5)] rounded-md overflow-hidden">
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          className="block"
        />
      </div>
    </div>
  );
}
