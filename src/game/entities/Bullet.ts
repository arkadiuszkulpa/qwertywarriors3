import Phaser from 'phaser';
import { GAME_CONFIG } from '../config';

export class Bullet extends Phaser.GameObjects.Sprite {
  private target: Phaser.Math.Vector2;
  private velocity: Phaser.Math.Vector2;
  private hasReachedTarget: boolean = false;

  constructor(
    scene: Phaser.Scene,
    startX: number,
    startY: number,
    target: Phaser.Math.Vector2
  ) {
    super(scene, startX, startY, 'bullet');

    this.target = target;

    // Calculate direction and velocity
    const angle = Phaser.Math.Angle.Between(startX, startY, target.x, target.y);
    this.setRotation(angle);

    this.velocity = new Phaser.Math.Vector2(
      Math.cos(angle) * GAME_CONFIG.BULLET_SPEED,
      Math.sin(angle) * GAME_CONFIG.BULLET_SPEED
    );

    // Add trail effect
    this.setScale(1.5, 1);

    scene.add.existing(this);
  }

  update(delta: number): void {
    if (this.hasReachedTarget) return;

    const deltaSeconds = delta / 1000;

    // Move bullet
    this.x += this.velocity.x * deltaSeconds;
    this.y += this.velocity.y * deltaSeconds;

    // Check if reached target
    const distance = Phaser.Math.Distance.Between(this.x, this.y, this.target.x, this.target.y);
    if (distance < 20) {
      this.hasReachedTarget = true;
      this.destroy();
    }

    // Destroy if off screen
    if (this.y < -50 || this.y > GAME_CONFIG.HEIGHT + 50 ||
        this.x < -50 || this.x > GAME_CONFIG.WIDTH + 50) {
      this.destroy();
    }
  }
}
