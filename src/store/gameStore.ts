import { create } from 'zustand';

interface GameState {
  player1Health: number;
  player2Health: number;
  timer: number;
  gameOver: boolean;
  winner: string | null;
  setPlayerHealth: (player: 1 | 2, health: number) => void;
  decrementTimer: () => void;
  setGameOver: (winner: string | null) => void;
  resetGame: () => void;
}

export const useGameStore = create<GameState>((set) => ({
  player1Health: 100,
  player2Health: 100,
  timer: 60,
  gameOver: false,
  winner: null,
  
  setPlayerHealth: (player, health) => set((state) => {
    if (player === 1) {
      return { player1Health: Math.max(0, health) };
    } else {
      return { player2Health: Math.max(0, health) };
    }
  }),
  
  decrementTimer: () => set((state) => ({ 
    timer: state.timer > 0 ? state.timer - 1 : 0 
  })),
  
  setGameOver: (winner) => set({ gameOver: true, winner }),
  
  resetGame: () => set({
    player1Health: 100,
    player2Health: 100,
    timer: 60,
    gameOver: false,
    winner: null,
  }),
}));
