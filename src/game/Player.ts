import {
  GRAVITY,
  GROUND_Y,
  CANVAS_WIDTH,
  MAX_HEALTH,
  ATTACK_DAMAGE,
  MOVEMENT_SPEED,
  JUMP_VELOCITY,
} from './constants';
import { useGameStore } from '../store/gameStore';

export interface PlayerConfig {
  x: number;
  y: number;
  color: string;
  facingRight: boolean;
  id: 1 | 2;
  name: string;
}

export class Player {
  x: number;
  y: number;
  width: number;
  height: number;
  velocityX: number;
  velocityY: number;
  health: number;
  color: string;
  facingRight: boolean;
  isAttacking: boolean;
  isDefending: boolean;
  attackBox: {
    offsetX: number;
    offsetY: number;
    width: number;
    height: number;
  };
  attackDuration: number;
  attackTimer: number;
  hitTimer: number;
  isDead: boolean;
  id: 1 | 2;
  name: string;
  isJumping: boolean;

  constructor(config: PlayerConfig) {
    this.x = config.x;
    this.y = config.y;
    this.width = 50;
    this.height = 100;
    this.velocityX = 0;
    this.velocityY = 0;
    this.health = MAX_HEALTH;
    this.color = config.color;
    this.facingRight = config.facingRight;
    this.isAttacking = false;
    this.isDefending = false;
    this.attackBox = {
      offsetX: this.facingRight ? 50 : -100,
      offsetY: 20,
      width: 100,
      height: 30,
    };
    this.attackDuration = 15; // frames
    this.attackTimer = 0;
    this.hitTimer = 0;
    this.isDead = false;
    this.id = config.id;
    this.name = config.name;
    this.isJumping = false;
  }

  draw(ctx: CanvasRenderingContext2D) {
    // 绘制受击闪烁
    if (this.hitTimer > 0) {
      this.hitTimer--;
      ctx.fillStyle = this.hitTimer % 4 < 2 ? 'white' : this.color;
    } else {
      ctx.fillStyle = this.color;
    }

    // 绘制角色主体
    ctx.fillRect(this.x, this.y, this.width, this.height);

    // 绘制防御护盾特效
    if (this.isDefending) {
      ctx.strokeStyle = 'rgba(100, 200, 255, 0.8)';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(this.x + this.width / 2, this.y + this.height / 2, this.height / 2 + 10, 0, Math.PI * 2);
      ctx.stroke();
    }

    // 绘制攻击判定框 (Debug/Visuals)
    if (this.isAttacking) {
      ctx.fillStyle = 'rgba(255, 0, 0, 0.5)';
      ctx.fillRect(
        this.x + this.attackBox.offsetX,
        this.y + this.attackBox.offsetY,
        this.attackBox.width,
        this.attackBox.height
      );
    }
  }

  update(ctx: CanvasRenderingContext2D) {
    this.draw(ctx);

    if (this.isDead) return;

    // 更新位置
    this.x += this.velocityX;
    this.y += this.velocityY;

    // 边界限制
    if (this.x < 0) this.x = 0;
    if (this.x + this.width > CANVAS_WIDTH) this.x = CANVAS_WIDTH - this.width;

    // 重力系统
    if (this.y + this.height + this.velocityY >= GROUND_Y) {
      this.velocityY = 0;
      this.y = GROUND_Y - this.height;
      this.isJumping = false;
    } else {
      this.velocityY += GRAVITY;
    }

    // 更新攻击判定框朝向
    this.attackBox.offsetX = this.facingRight ? this.width : -this.attackBox.width;

    // 攻击计时器
    if (this.isAttacking && this.attackTimer > 0) {
      this.attackTimer--;
    } else {
      this.isAttacking = false;
    }
  }

  attack() {
    if (!this.isAttacking && !this.isDefending && !this.isDead) {
      this.isAttacking = true;
      this.attackTimer = this.attackDuration;
    }
  }

  defend(defendState: boolean) {
    if (!this.isDead) {
      this.isDefending = defendState;
    }
  }

  takeDamage(amount: number) {
    if (this.isDefending) {
      // 防御时只受到 20% 伤害，并有闪烁提示
      this.health -= amount * 0.2;
    } else {
      this.health -= amount;
      this.hitTimer = 15;
    }
    
    if (this.health <= 0) {
      this.health = 0;
      this.isDead = true;
    }

    // 同步到 UI Store
    useGameStore.getState().setPlayerHealth(this.id, this.health);
  }
}
