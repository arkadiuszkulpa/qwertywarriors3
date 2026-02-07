import Phaser from 'phaser';

export class HealthBar extends Phaser.GameObjects.Container {
  private background: Phaser.GameObjects.Rectangle;
  private fill: Phaser.GameObjects.Rectangle;
  private border: Phaser.GameObjects.Rectangle;
  private infiniteText: Phaser.GameObjects.Text | null = null;
  private barWidth: number;
  private barHeight: number;
  private isInfinite: boolean = false;

  constructor(scene: Phaser.Scene, x: number, y: number, width: number, height: number) {
    super(scene, x, y);

    this.barWidth = width;
    this.barHeight = height;

    // Background (dark)
    this.background = scene.add.rectangle(0, 0, width, height, 0x330000);
    this.background.setOrigin(0, 0);
    this.add(this.background);

    // Fill (green -> yellow -> red based on health)
    this.fill = scene.add.rectangle(0, 0, width, height, 0x00ff00);
    this.fill.setOrigin(0, 0);
    this.add(this.fill);

    // Border
    this.border = scene.add.rectangle(0, 0, width, height);
    this.border.setOrigin(0, 0);
    this.border.setStrokeStyle(2, 0x666666);
    this.border.setFillStyle();
    this.add(this.border);
  }

  setHealth(current: number, max: number): void {
    if (this.isInfinite) {
      this.showNormalMode();
    }

    const ratio = Math.max(0, Math.min(1, current / max));
    this.fill.width = this.barWidth * ratio;

    // Color based on health percentage
    let color: number;
    if (ratio > 0.6) {
      color = 0x00ff00; // Green
    } else if (ratio > 0.3) {
      color = 0xffff00; // Yellow
    } else {
      color = 0xff0000; // Red
    }

    this.fill.setFillStyle(color);

    // Pulse effect when low health
    if (ratio <= 0.3 && !this.scene.tweens.isTweening(this.fill)) {
      this.scene.tweens.add({
        targets: this.fill,
        alpha: 0.5,
        duration: 300,
        yoyo: true,
        repeat: -1,
      });
    } else if (ratio > 0.3) {
      this.scene.tweens.killTweensOf(this.fill);
      this.fill.setAlpha(1);
    }
  }

  setInfinite(): void {
    if (this.isInfinite) return;

    this.isInfinite = true;
    this.fill.setVisible(false);
    this.background.setFillStyle(0x003300);

    if (!this.infiniteText) {
      this.infiniteText = this.scene.add.text(
        this.barWidth / 2,
        this.barHeight / 2,
        '∞ INFINITE',
        {
          fontSize: '12px',
          color: '#00ff88',
          fontStyle: 'bold',
        }
      );
      this.infiniteText.setOrigin(0.5);
      this.add(this.infiniteText);
    } else {
      this.infiniteText.setVisible(true);
    }
  }

  private showNormalMode(): void {
    this.isInfinite = false;
    this.fill.setVisible(true);
    this.background.setFillStyle(0x330000);
    if (this.infiniteText) {
      this.infiniteText.setVisible(false);
    }
  }
}
