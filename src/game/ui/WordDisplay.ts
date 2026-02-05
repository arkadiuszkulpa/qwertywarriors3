import Phaser from 'phaser';

export class WordDisplay extends Phaser.GameObjects.Container {
  private letterTexts: Phaser.GameObjects.Text[] = [];
  private emptyText: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y);

    // Empty state text
    this.emptyText = scene.add.text(0, 0, '---', {
      fontSize: '28px',
      color: '#444444',
    });
    this.emptyText.setOrigin(0.5);
    this.add(this.emptyText);
  }

  setWord(word: string, typedPortion: string): void {
    // Clear existing letters
    this.letterTexts.forEach((t) => t.destroy());
    this.letterTexts = [];

    if (!word) {
      this.emptyText.setVisible(true);
      return;
    }

    this.emptyText.setVisible(false);

    const letterSpacing = 28;
    const startX = -((word.length - 1) * letterSpacing) / 2;

    for (let i = 0; i < word.length; i++) {
      const isTyped = i < typedPortion.length;
      const letter = this.scene.add.text(
        startX + i * letterSpacing,
        0,
        word[i].toUpperCase(),
        {
          fontSize: '28px',
          color: isTyped ? '#00ff88' : '#ffffff',
          fontStyle: 'bold',
          stroke: '#000000',
          strokeThickness: 2,
        }
      );
      letter.setOrigin(0.5);

      if (isTyped) {
        letter.setAlpha(0.5);
      }

      // Highlight next letter to type
      if (i === typedPortion.length) {
        letter.setColor('#ffff00');
        letter.setScale(1.2);
      }

      this.letterTexts.push(letter);
      this.add(letter);
    }
  }
}
