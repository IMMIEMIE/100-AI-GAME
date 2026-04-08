import {
  GRAVITY,
  GROUND_Y,
  CANVAS_WIDTH,
  MAX_HEALTH,
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
    const isP1 = this.id === 1;
    const dir = this.facingRight ? 1 : -1;
    const cx = this.x + this.width / 2;
    const cy = this.y + this.height / 2;

    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(dir, 1);

    const isMoving = this.velocityX !== 0;
    const bounce = (isMoving && !this.isJumping) ? Math.sin(Date.now() / 60) * 3 : 0;

    const primaryColor = isP1 ? '#b91c1c' : '#1d4ed8'; // Red or Blue
    const secondaryColor = isP1 ? '#7f1d1d' : '#1e3a8a';
    const skinColor = '#fcd34d';
    const darkColor = '#0f172a';

    if (this.hitTimer > 0) {
      ctx.filter = 'brightness(250%) contrast(150%)';
    }

    // Back Arm
    ctx.fillStyle = secondaryColor;
    ctx.fillRect(-10, -10 + bounce, 12, 25);

    // Back Leg
    const legAngle = isMoving ? Math.sin(Date.now() / 80) * 15 : (this.isJumping ? -10 : 0);
    ctx.fillStyle = secondaryColor;
    ctx.fillRect(-15 + legAngle, 20, 14, 30);

    // Body (Robe)
    ctx.fillStyle = primaryColor;
    ctx.fillRect(-20, -15 + bounce, 40, 45);
    // Belt
    ctx.fillStyle = '#fef08a';
    ctx.fillRect(-22, 15 + bounce, 44, 6);

    // Head
    ctx.fillStyle = skinColor;
    ctx.fillRect(-12, -40 + bounce, 25, 25);
    // Eyes
    ctx.fillStyle = darkColor;
    ctx.fillRect(2, -32 + bounce, 4, 4);

    // Hair / Hat
    ctx.fillStyle = darkColor;
    if (isP1) {
      // Bamboo hat (Douli)
      ctx.beginPath();
      ctx.moveTo(-30, -35 + bounce);
      ctx.lineTo(20, -35 + bounce);
      ctx.lineTo(-5, -55 + bounce);
      ctx.fill();
    } else {
      // Headband & spiky hair
      ctx.fillRect(-15, -45 + bounce, 30, 15);
      ctx.fillStyle = primaryColor; // headband
      ctx.fillRect(-15, -38 + bounce, 30, 4);
      ctx.fillRect(-25, -38 + bounce, 10, 4); // tail
    }

    // Front Leg
    ctx.fillStyle = primaryColor;
    ctx.fillRect(5 - legAngle, 20, 14, 30);

    // Front Arm
    ctx.fillStyle = primaryColor;
    if (this.isDefending) {
      // Guard pose
      ctx.fillRect(5, -15 + bounce, 15, 20);
      ctx.fillRect(20, -15 + bounce, 20, 12);
    } else if (this.isAttacking) {
      // Attack pose
      ctx.fillRect(5, -10 + bounce, 35, 12);
    } else {
      // Idle/Run pose
      const armAngle = isMoving ? Math.sin(Date.now() / 80 + Math.PI) * 15 : (this.isJumping ? 20 : 0);
      ctx.fillRect(0 + armAngle, -10 + bounce, 14, 25);
    }

    // Weapon / Effects
    if (isP1) {
      // Sword
      ctx.fillStyle = '#cbd5e1';
      if (this.isAttacking) {
         ctx.fillRect(35, -12 + bounce, 70, 8); // Stab
         ctx.fillStyle = '#475569';
         ctx.fillRect(35, -16 + bounce, 8, 16); // Hilt
         // Slash arc
         ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
         ctx.beginPath();
         ctx.arc(45, -8 + bounce, 60, -Math.PI/3, Math.PI/3);
         ctx.arc(45, -8 + bounce, 45, Math.PI/3, -Math.PI/3, true);
         ctx.fill();
      } else if (this.isDefending) {
         ctx.fillRect(25, -45 + bounce, 10, 60); // Block
      } else {
         ctx.fillRect(-30, -5 + bounce, 8, 55); // Sheathed
      }
    } else {
      // Glowing Fists
      ctx.fillStyle = '#e0f2fe';
      if (this.isAttacking) {
         ctx.fillRect(40, -14 + bounce, 18, 18);
         // Impact wave
         ctx.fillStyle = 'rgba(56, 189, 248, 0.7)';
         ctx.beginPath();
         ctx.arc(65, -5 + bounce, 40, -Math.PI/2.5, Math.PI/2.5);
         ctx.arc(65, -5 + bounce, 20, Math.PI/2.5, -Math.PI/2.5, true);
         ctx.fill();
      } else {
         const armAngle = isMoving ? Math.sin(Date.now() / 80 + Math.PI) * 15 : (this.isJumping ? 20 : 0);
         ctx.fillRect(2 + armAngle, 10 + bounce, 14, 14);
      }
    }

    ctx.restore();

    // Defense Shield
    if (this.isDefending) {
      ctx.strokeStyle = isP1 ? 'rgba(239, 68, 68, 0.8)' : 'rgba(59, 130, 246, 0.8)';
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.arc(cx, cy, this.height / 2 + 20, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = isP1 ? 'rgba(239, 68, 68, 0.15)' : 'rgba(59, 130, 246, 0.15)';
      ctx.fill();
    }
  }

  update(ctx: CanvasRenderingContext2D) {
    if (this.hitTimer > 0) this.hitTimer--;

    this.draw(ctx);

    if (this.isDead) return;

    this.x += this.velocityX;
    this.y += this.velocityY;

    if (this.x < 0) this.x = 0;
    if (this.x + this.width > CANVAS_WIDTH) this.x = CANVAS_WIDTH - this.width;

    if (this.y + this.height + this.velocityY >= GROUND_Y) {
      this.velocityY = 0;
      this.y = GROUND_Y - this.height;
      this.isJumping = false;
    } else {
      this.velocityY += GRAVITY;
    }

    this.attackBox.offsetX = this.facingRight ? this.width : -this.attackBox.width;

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
      this.health -= amount * 0.2;
    } else {
      this.health -= amount;
      this.hitTimer = 15;
    }

    if (this.health <= 0) {
      this.health = 0;
      this.isDead = true;
    }

    useGameStore.getState().setPlayerHealth(this.id, this.health);
  }
}
