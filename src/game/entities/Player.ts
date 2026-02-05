import Phaser from 'phaser';

export class Player extends Phaser.GameObjects.Container {
  private sprite: Phaser.GameObjects.Sprite;
  private muzzleFlash: Phaser.GameObjects.Sprite;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y);

    // Create player sprite
    this.sprite = scene.add.sprite(0, 0, 'player');
    this.add(this.sprite);

    // Muzzle flash (hidden by default)
    this.muzzleFlash = scene.add.sprite(0, -40, 'muzzle-flash');
    this.muzzleFlash.setVisible(false);
    this.muzzleFlash.setScale(0.8);
    this.add(this.muzzleFlash);

    scene.add.existing(this);
  }

  shoot(targetX: number, targetY: number): void {
    // Rotate slightly toward target
    const angle = Phaser.Math.Angle.Between(this.x, this.y, targetX, targetY);
    const rotationAmount = Phaser.Math.Clamp((angle + Math.PI / 2) * 0.1, -0.2, 0.2);

    // Recoil animation
    this.scene.tweens.add({
      targets: this.sprite,
      y: 5,
      rotation: rotationAmount,
      duration: 30,
      yoyo: true,
      ease: 'Quad.easeOut',
    });

    // Show muzzle flash
    this.muzzleFlash.setVisible(true);
    this.muzzleFlash.setAlpha(1);
    this.muzzleFlash.setScale(0.8 + Math.random() * 0.3);
    this.muzzleFlash.setRotation(Math.random() * Math.PI * 2);

    // Hide muzzle flash after brief moment
    this.scene.time.delayedCall(50, () => {
      this.muzzleFlash.setVisible(false);
    });
  }

  playJamAnimation(): void {
    // Shake animation for jam
    this.scene.tweens.add({
      targets: this.sprite,
      x: 3,
      duration: 30,
      yoyo: true,
      repeat: 3,
      ease: 'Sine.easeInOut',
      onComplete: () => {
        this.sprite.x = 0;
      },
    });

    // Brief red tint
    this.sprite.setTint(0xff6666);
    this.scene.time.delayedCall(150, () => {
      this.sprite.clearTint();
    });
  }

  getMuzzlePosition(): Phaser.Math.Vector2 {
    return new Phaser.Math.Vector2(this.x, this.y - 35);
  }
}
