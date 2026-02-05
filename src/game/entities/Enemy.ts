import Phaser from 'phaser';
import type { EnemyConfig } from '../../types';

export class Enemy extends Phaser.GameObjects.Container {
  public readonly id: string;
  public readonly word: string;
  public readonly config: EnemyConfig;

  private sprite: Phaser.GameObjects.Sprite;
  private wordText: Phaser.GameObjects.Text;
  private typedText: Phaser.GameObjects.Text;
  private remainingWord: string;
  private typedCount: number = 0;
  private _isTargeted: boolean = false;
  private targetIndicator: Phaser.GameObjects.Graphics;

  constructor(scene: Phaser.Scene, x: number, y: number, config: EnemyConfig) {
    super(scene, x, y);

    this.id = Phaser.Utils.String.UUID();
    this.word = config.word;
    this.remainingWord = config.word;
    this.config = config;

    // Create sprite
    this.sprite = scene.add.sprite(0, 0, 'enemy');
    this.add(this.sprite);

    // Target indicator (shown when targeted)
    this.targetIndicator = scene.add.graphics();
    this.targetIndicator.lineStyle(2, 0x00ff00);
    this.targetIndicator.strokeCircle(0, 0, 30);
    this.targetIndicator.setVisible(false);
    this.add(this.targetIndicator);

    // Word text (remaining portion)
    this.wordText = scene.add.text(0, -45, this.word.toUpperCase(), {
      fontSize: '18px',
      color: '#ffffff',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 3,
    });
    this.wordText.setOrigin(0.5);
    this.add(this.wordText);

    // Typed text (completed portion - shown in green)
    this.typedText = scene.add.text(0, -45, '', {
      fontSize: '18px',
      color: '#00ff00',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 3,
    });
    this.typedText.setOrigin(0, 0.5);
    this.add(this.typedText);

    scene.add.existing(this);
  }

  get isTargeted(): boolean {
    return this._isTargeted;
  }

  getFirstLetter(): string {
    return this.remainingWord.charAt(0).toLowerCase();
  }

  getRemainingWord(): string {
    return this.remainingWord;
  }

  getTypedPortion(): string {
    return this.word.substring(0, this.typedCount);
  }

  hitLetter(): { letter: string; position: Phaser.Math.Vector2; destroyed: boolean } {
    const letter = this.remainingWord.charAt(0);
    this.typedCount++;
    this.remainingWord = this.remainingWord.substring(1);

    this.updateWordDisplay();

    // Flash effect on hit
    this.scene.tweens.add({
      targets: this.sprite,
      scaleX: 1.2,
      scaleY: 1.2,
      duration: 50,
      yoyo: true,
    });

    return {
      letter,
      position: new Phaser.Math.Vector2(this.x, this.y),
      destroyed: this.remainingWord.length === 0,
    };
  }

  setTargeted(targeted: boolean): void {
    this._isTargeted = targeted;
    this.targetIndicator.setVisible(targeted);

    if (targeted) {
      // Pulse animation for target indicator
      this.scene.tweens.add({
        targets: this.targetIndicator,
        scaleX: 1.1,
        scaleY: 1.1,
        duration: 300,
        yoyo: true,
        repeat: -1,
      });
    } else {
      this.scene.tweens.killTweensOf(this.targetIndicator);
      this.targetIndicator.setScale(1);
    }
  }

  update(delta: number): void {
    // Move downward
    this.y += this.config.speed * (delta / 1000);
  }

  private updateWordDisplay(): void {
    const typed = this.word.substring(0, this.typedCount).toUpperCase();
    const remaining = this.remainingWord.toUpperCase();

    // Calculate positions
    const fullWidth = this.wordText.width;

    // Update typed text (green portion)
    this.typedText.setText(typed);

    // Measure typed width to position remaining text
    const typedWidth = this.typedText.width;

    // Position texts so they appear as one continuous word
    this.typedText.setX(-fullWidth / 2);
    this.wordText.setText(remaining);
    this.wordText.setX(-fullWidth / 2 + typedWidth + this.wordText.width / 2);
  }

  destroy(fromScene?: boolean): void {
    this.scene.tweens.killTweensOf(this.targetIndicator);
    this.scene.tweens.killTweensOf(this.sprite);
    super.destroy(fromScene);
  }
}
