import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  create(): void {
    // Create placeholder textures programmatically
    this.createPlaceholderTextures();

    // Move to next scene
    this.scene.start('PreloadScene');
  }

  private createPlaceholderTextures(): void {
    // Player - green rectangle with details
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00);
    playerGraphics.fillRect(0, 0, 48, 64);
    playerGraphics.fillStyle(0x008800);
    playerGraphics.fillRect(18, 0, 12, 20); // head
    playerGraphics.fillRect(8, 50, 32, 8); // feet
    playerGraphics.generateTexture('player', 48, 64);
    playerGraphics.destroy();

    // Enemy - red circle with darker center
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0xff0000);
    enemyGraphics.fillCircle(24, 24, 24);
    enemyGraphics.fillStyle(0xaa0000);
    enemyGraphics.fillCircle(24, 24, 16);
    enemyGraphics.fillStyle(0xff4444);
    enemyGraphics.fillCircle(18, 18, 6);
    enemyGraphics.generateTexture('enemy', 48, 48);
    enemyGraphics.destroy();

    // Bullet - yellow/orange rectangle
    const bulletGraphics = this.add.graphics();
    bulletGraphics.fillStyle(0xffff00);
    bulletGraphics.fillRect(0, 0, 12, 4);
    bulletGraphics.fillStyle(0xffaa00);
    bulletGraphics.fillRect(0, 1, 4, 2);
    bulletGraphics.generateTexture('bullet', 12, 4);
    bulletGraphics.destroy();

    // Muzzle flash - white/yellow burst
    const flashGraphics = this.add.graphics();
    flashGraphics.fillStyle(0xffffff);
    flashGraphics.fillCircle(16, 16, 12);
    flashGraphics.fillStyle(0xffff00);
    flashGraphics.fillCircle(16, 16, 8);
    flashGraphics.generateTexture('muzzle-flash', 32, 32);
    flashGraphics.destroy();

    // Explosion particle - orange circle
    const explosionGraphics = this.add.graphics();
    explosionGraphics.fillStyle(0xff6600);
    explosionGraphics.fillCircle(8, 8, 8);
    explosionGraphics.generateTexture('explosion-particle', 16, 16);
    explosionGraphics.destroy();
  }
}
