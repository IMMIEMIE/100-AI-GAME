import { useEffect, useRef } from 'react';
import { Player } from './Player';
import { CANVAS_WIDTH, CANVAS_HEIGHT, GROUND_Y, ATTACK_DAMAGE, MOVEMENT_SPEED, JUMP_VELOCITY } from './constants';
import { useGameStore } from '../store/gameStore';

export function useGameEngine() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationIdRef = useRef<number>(0);
  const keysRef = useRef<{ [key: string]: boolean }>({});
  
  const playersRef = useRef<{ p1: Player; p2: Player } | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 初始化玩家
    const p1 = new Player({
      x: 100,
      y: GROUND_Y - 100,
      color: '#ef4444', // red
      facingRight: true,
      id: 1,
      name: '剑客',
    });

    const p2 = new Player({
      x: CANVAS_WIDTH - 150,
      y: GROUND_Y - 100,
      color: '#3b82f6', // blue
      facingRight: false,
      id: 2,
      name: '拳师',
    });

    playersRef.current = { p1, p2 };
    
    // 监听重新开始游戏
    let prevGameOver = useGameStore.getState().gameOver;
    const unsubscribe = useGameStore.subscribe((state) => {
      const gameOver = state.gameOver;
      if (!gameOver && prevGameOver) {
        // Game has been reset
        playersRef.current!.p1.health = 100;
        playersRef.current!.p1.x = 100;
        playersRef.current!.p1.y = GROUND_Y - 100;
        playersRef.current!.p1.isDead = false;
        playersRef.current!.p1.velocityX = 0;
        playersRef.current!.p1.velocityY = 0;
        playersRef.current!.p1.facingRight = true;

        playersRef.current!.p2.health = 100;
        playersRef.current!.p2.x = CANVAS_WIDTH - 150;
        playersRef.current!.p2.y = GROUND_Y - 100;
        playersRef.current!.p2.isDead = false;
        playersRef.current!.p2.velocityX = 0;
        playersRef.current!.p2.velocityY = 0;
        playersRef.current!.p2.facingRight = false;
        
        timerInterval = 0;
      }
      prevGameOver = gameOver;
    });

    // 监听键盘事件
    const handleKeyDown = (e: KeyboardEvent) => {
      keysRef.current[e.key] = true;
      const { p1, p2 } = playersRef.current!;

      if (!p1.isDead && !useGameStore.getState().gameOver) {
        if (e.key === 'j') p1.attack();
        if (e.key === 'k') p1.defend(true);
        if (e.key === 'w' && p1.velocityY === 0) p1.velocityY = JUMP_VELOCITY;
      }

      if (!p2.isDead && !useGameStore.getState().gameOver) {
        if (e.key === '1') p2.attack();
        if (e.key === '2') p2.defend(true);
        if (e.key === 'ArrowUp' && p2.velocityY === 0) p2.velocityY = JUMP_VELOCITY;
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

    const gameLoop = (time: number) => {
      if (lastTime === null) lastTime = time;
      const dt = time - lastTime;
      lastTime = time;

      // 每秒减少计时器
      timerInterval += dt;
      if (timerInterval > 1000) {
        timerInterval = 0;
        const store = useGameStore.getState();
        if (!store.gameOver) {
          store.decrementTimer();
          if (store.timer <= 0) {
            // 时间到，判定胜负
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

      // 绘制背景
      ctx.fillStyle = '#fef3c7'; // 浅蓝背景色作为天空
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // 绘制地面
      ctx.fillStyle = '#064e3b'; // 深绿地面（竹林色）
      ctx.fillRect(0, GROUND_Y, CANVAS_WIDTH, CANVAS_HEIGHT - GROUND_Y);

      const store = useGameStore.getState();
      const { p1, p2 } = playersRef.current!;

      if (!store.gameOver) {
        // P1 运动逻辑
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

        // P2 运动逻辑
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

        // 碰撞判定
        // P1 攻击 P2
        if (p1.isAttacking && p1.attackTimer === Math.floor(p1.attackDuration / 2)) {
          if (detectCollision(p1, p2)) {
            p2.takeDamage(ATTACK_DAMAGE);
          }
        }

        // P2 攻击 P1
        if (p2.isAttacking && p2.attackTimer === Math.floor(p2.attackDuration / 2)) {
          if (detectCollision(p2, p1)) {
            p1.takeDamage(ATTACK_DAMAGE);
          }
        }

        // 死亡判定
        if (p1.isDead || p2.isDead) {
          store.setGameOver(p1.isDead && p2.isDead ? 'Tie' : p1.isDead ? 'Player 2 Wins' : 'Player 1 Wins');
        }
      } else {
        // 游戏结束后玩家停止运动
        p1.velocityX = 0;
        p2.velocityX = 0;
      }

      // 更新画面
      p1.update(ctx);
      p2.update(ctx);

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
