import Phaser from 'phaser';
import { GAME_CONFIG } from '../config';
import { useGameStore } from '../../store/gameStore';

export class MainMenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MainMenuScene' });
  }

  create(): void {
    const { width, height } = { width: GAME_CONFIG.WIDTH, height: GAME_CONFIG.HEIGHT };

    // Title
    const title = this.add.text(width / 2, 120, 'QWERTY WARRIORS', {
      fontSize: '48px',
      color: '#ffffff',
      fontStyle: 'bold',
    });
    title.setOrigin(0.5);

    // Subtitle
    const subtitle = this.add.text(width / 2, 170, 'Type to Survive', {
      fontSize: '20px',
      color: '#888888',
    });
    subtitle.setOrigin(0.5);

    // Instructions
    const instructions = [
      'Enemies descend with words above them',
      'Type the word to destroy the enemy',
      'Wrong keys jam your gun!',
      'Don\'t let enemies reach the bottom',
    ];

    instructions.forEach((text, index) => {
      const instruction = this.add.text(width / 2, 260 + index * 30, text, {
        fontSize: '16px',
        color: '#aaaaaa',
      });
      instruction.setOrigin(0.5);
    });

    // Start prompt
    const startText = this.add.text(width / 2, height - 150, 'Press ENTER or SPACE to Start', {
      fontSize: '24px',
      color: '#00ff00',
    });
    startText.setOrigin(0.5);

    // Blink animation for start text
    this.tweens.add({
      targets: startText,
      alpha: 0.3,
      duration: 800,
      ease: 'Sine.easeInOut',
      yoyo: true,
      repeat: -1,
    });

    // Controls hint
    const controlsHint = this.add.text(width / 2, height - 80, 'ESC to pause during game', {
      fontSize: '14px',
      color: '#666666',
    });
    controlsHint.setOrigin(0.5);

    // Keyboard input
    this.input.keyboard?.on('keydown-ENTER', this.startGame, this);
    this.input.keyboard?.on('keydown-SPACE', this.startGame, this);
  }

  private startGame(): void {
    useGameStore.getState().startGame();
    this.scene.start('GameScene');
  }
}
