import { useEffect, useRef } from 'react';
import { Player } from './Player';
import { CANVAS_WIDTH, CANVAS_HEIGHT, GROUND_Y, ATTACK_DAMAGE, MOVEMENT_SPEED, JUMP_VELOCITY } from './constants';
import { useGameStore } from '../store/gameStore';

export class Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;

  constructor(x: number, y: number, color: string) {
    this.x = x;
    this.y = y;
    this.vx = (Math.random() - 0.5) * 15;
    this.vy = (Math.random() - 0.5) * 15 - 5; // Tend to go up
    this.life = 15 + Math.random() * 20;
    this.maxLife = this.life;
    this.color = color;
    this.size = 3 + Math.random() * 5;
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.vy += 0.5; // Gravity for particles
    this.life--;
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.globalAlpha = Math.max(0, this.life / this.maxLife);
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, this.size, this.size);
    ctx.globalAlpha = 1.0;
  }
}

export function useGameEngine() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationIdRef = useRef<number>(0);
  const keysRef = useRef<{ [key: string]: boolean }>({});

  const playersRef = useRef<{ p1: Player; p2: Player } | null>(null);
  const particlesRef = useRef<Particle[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const p1 = new Player({
      x: 150,
      y: GROUND_Y - 100,
      color: '#ef4444',
      facingRight: true,
      id: 1,
      name: '剑客',
    });

    const p2 = new Player({
      x: CANVAS_WIDTH - 200,
      y: GROUND_Y - 100,
      color: '#3b82f6',
      facingRight: false,
      id: 2,
      name: '拳师',
    });

    playersRef.current = { p1, p2 };

    let prevGameOver = useGameStore.getState().gameOver;
    const unsubscribe = useGameStore.subscribe((state) => {
      const gameOver = state.gameOver;
      if (!gameOver && prevGameOver) {
        playersRef.current!.p1.health = 100;
        playersRef.current!.p1.x = 150;
        playersRef.current!.p1.y = GROUND_Y - 100;
        playersRef.current!.p1.isDead = false;
        playersRef.current!.p1.velocityX = 0;
        playersRef.current!.p1.velocityY = 0;
        playersRef.current!.p1.facingRight = true;

        playersRef.current!.p2.health = 100;
        playersRef.current!.p2.x = CANVAS_WIDTH - 200;
        playersRef.current!.p2.y = GROUND_Y - 100;
        playersRef.current!.p2.isDead = false;
        playersRef.current!.p2.velocityX = 0;
        playersRef.current!.p2.velocityY = 0;
        playersRef.current!.p2.facingRight = false;

        particlesRef.current = [];
        timerInterval = 0;
      }
      prevGameOver = gameOver;
    });

    const handleKeyDown = (e: KeyboardEvent) => {
      keysRef.current[e.key] = true;
      const { p1, p2 } = playersRef.current!;

      if (!p1.isDead && !useGameStore.getState().gameOver) {
        if (e.key === 'j') p1.attack();
        if (e.key === 'k') p1.defend(true);
        if (e.key === 'w' && p1.velocityY === 0) {
          p1.velocityY = JUMP_VELOCITY;
          p1.isJumping = true;
          for(let i=0; i<8; i++) particlesRef.current.push(new Particle(p1.x + p1.width/2, GROUND_Y, '#94a3b8'));
        }
      }

      if (!p2.isDead && !useGameStore.getState().gameOver) {
        if (e.key === '1') p2.attack();
        if (e.key === '2') p2.defend(true);
        if (e.key === 'ArrowUp' && p2.velocityY === 0) {
          p2.velocityY = JUMP_VELOCITY;
          p2.isJumping = true;
          for(let i=0; i<8; i++) particlesRef.current.push(new Particle(p2.x + p2.width/2, GROUND_Y, '#94a3b8'));
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysRef.current[e.key] = false;
      const { p1, p2 } = playersRef.current!;

      if (e.key === 'k') p1.defend(false);
      if (e.key === '2') p2.defend(false);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    let lastTime: number | null = null;
    let timerInterval = 0;

    const detectCollision = (attacker: Player, defender: Player) => {
      const aBox = {
        x: attacker.x + attacker.attackBox.offsetX,
        y: attacker.y + attacker.attackBox.offsetY,
        w: attacker.attackBox.width,
        h: attacker.attackBox.height,
      };

      const dBox = {
        x: defender.x,
        y: defender.y,
        w: defender.width,
        h: defender.height,
      };

      return (
        aBox.x < dBox.x + dBox.w &&
        aBox.x + aBox.w > dBox.x &&
        aBox.y < dBox.y + dBox.h &&
        aBox.y + aBox.h > dBox.y
      );
    };

    // Pre-calculate background details for performance
    const grassPatches = Array.from({length: 50}, (_, i) => ({
      x: (i * 73) % CANVAS_WIDTH,
      y: GROUND_Y + ((i * 31) % (CANVAS_HEIGHT - GROUND_Y - 5)),
      w: 15 + (i % 15)
    }));

    const gameLoop = (time: number) => {
      if (lastTime === null) lastTime = time;
      const dt = time - lastTime;
      lastTime = time;

      timerInterval += dt;
      if (timerInterval > 1000) {
        timerInterval = 0;
        const store = useGameStore.getState();
        if (!store.gameOver) {
          store.decrementTimer();
          if (store.timer <= 0) {
            const winner =
              store.player1Health > store.player2Health
                ? 'Player 1 Wins'
                : store.player2Health > store.player1Health
                ? 'Player 2 Wins'
                : 'Tie';
            store.setGameOver(winner);
          }
        }
      }

      // --- 绘制高级背景 ---
      // 1. 渐变天空
      const skyGrad = ctx.createLinearGradient(0, 0, 0, GROUND_Y);
      skyGrad.addColorStop(0, '#0f172a');
      skyGrad.addColorStop(1, '#334155');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // 2. 满月
      ctx.fillStyle = '#fef08a';
      ctx.shadowColor = '#fef08a';
      ctx.shadowBlur = 30;
      ctx.beginPath();
      ctx.arc(CANVAS_WIDTH - 200, 150, 60, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0; // 重置阴影

      // 3. 远山
      ctx.fillStyle = '#1e293b';
      ctx.beginPath(); ctx.moveTo(0, GROUND_Y); ctx.lineTo(250, 180); ctx.lineTo(500, GROUND_Y); ctx.fill();
      ctx.beginPath(); ctx.moveTo(350, GROUND_Y); ctx.lineTo(650, 220); ctx.lineTo(950, GROUND_Y); ctx.fill();
      ctx.fillStyle = '#0f172a';
      ctx.beginPath(); ctx.moveTo(700, GROUND_Y); ctx.lineTo(900, 280); ctx.lineTo(CANVAS_WIDTH, GROUND_Y); ctx.fill();

      // 4. 竹林
      ctx.fillStyle = '#064e3b';
      for (let i = 0; i < 18; i++) {
        const bx = i * 70 + 20;
        ctx.fillRect(bx, 0, 14, GROUND_Y);
        ctx.fillStyle = '#022c22';
        for (let j = 0; j < 12; j++) ctx.fillRect(bx - 2, j * 45 + 20, 18, 4);
        ctx.fillStyle = '#064e3b';
      }

      // 5. 地面与细节
      const groundGrad = ctx.createLinearGradient(0, GROUND_Y, 0, CANVAS_HEIGHT);
      groundGrad.addColorStop(0, '#022c22');
      groundGrad.addColorStop(1, '#020617');
      ctx.fillStyle = groundGrad;
      ctx.fillRect(0, GROUND_Y, CANVAS_WIDTH, CANVAS_HEIGHT - GROUND_Y);

      ctx.fillStyle = '#065f46';
      grassPatches.forEach(p => {
        ctx.fillRect(p.x, p.y, p.w, 4);
      });
      // --- 背景绘制结束 ---

      const store = useGameStore.getState();
      const { p1, p2 } = playersRef.current!;

      if (!store.gameOver) {
        if (!p1.isDead) {
          if (keysRef.current['a']) {
            p1.velocityX = -MOVEMENT_SPEED;
            p1.facingRight = false;
          } else if (keysRef.current['d']) {
            p1.velocityX = MOVEMENT_SPEED;
            p1.facingRight = true;
          } else {
            p1.velocityX = 0;
          }
        }

        if (!p2.isDead) {
          if (keysRef.current['ArrowLeft']) {
            p2.velocityX = -MOVEMENT_SPEED;
            p2.facingRight = false;
          } else if (keysRef.current['ArrowRight']) {
            p2.velocityX = MOVEMENT_SPEED;
            p2.facingRight = true;
          } else {
            p2.velocityX = 0;
          }
        }

        // P1 攻击 P2
        if (p1.isAttacking && p1.attackTimer === Math.floor(p1.attackDuration / 2)) {
          if (detectCollision(p1, p2)) {
            p2.takeDamage(ATTACK_DAMAGE);
            for(let i=0; i<15; i++) particlesRef.current.push(new Particle(p2.x + p2.width/2, p2.y + p2.height/2, '#ef4444'));
          }
        }

        // P2 攻击 P1
        if (p2.isAttacking && p2.attackTimer === Math.floor(p2.attackDuration / 2)) {
          if (detectCollision(p2, p1)) {
            p1.takeDamage(ATTACK_DAMAGE);
            for(let i=0; i<15; i++) particlesRef.current.push(new Particle(p1.x + p1.width/2, p1.y + p1.height/2, '#3b82f6'));
          }
        }

        if (p1.isDead || p2.isDead) {
          store.setGameOver(p1.isDead && p2.isDead ? 'Tie' : p1.isDead ? 'Player 2 Wins' : 'Player 1 Wins');
        }
      } else {
        p1.velocityX = 0;
        p2.velocityX = 0;
      }

      p1.update(ctx);
      p2.update(ctx);

      // 更新并绘制粒子
      particlesRef.current = particlesRef.current.filter(p => p.life > 0);
      particlesRef.current.forEach(p => {
        p.update();
        p.draw(ctx);
      });

      animationIdRef.current = requestAnimationFrame(gameLoop);
    };

    animationIdRef.current = requestAnimationFrame(gameLoop);

    return () => {
      cancelAnimationFrame(animationIdRef.current);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      unsubscribe();
    };
  }, []);

  return { canvasRef };
}
