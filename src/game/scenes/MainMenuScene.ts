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
    const title = this.add.text(width / 2, 100, 'QWERTY WARRIORS', {
      fontSize: '48px',
      color: '#ffffff',
      fontStyle: 'bold',
    });
    title.setOrigin(0.5);

    // Subtitle
    const subtitle = this.add.text(width / 2, 150, 'Type to Survive', {
      fontSize: '20px',
      color: '#888888',
    });
    subtitle.setOrigin(0.5);

    // Instructions
    const instructions = [
      'Enemies descend with words above them',
      'Type the word to destroy the enemy',
      'Wrong keys jam your gun!',
      "Don't let enemies reach the bottom",
    ];

    instructions.forEach((text, index) => {
      const instruction = this.add.text(width / 2, 230 + index * 28, text, {
        fontSize: '15px',
        color: '#aaaaaa',
      });
      instruction.setOrigin(0.5);
    });

    // Menu options
    const menuY = 380;

    // Start Game button
    const startText = this.add
      .text(width / 2, menuY, '[ START GAME ]', {
        fontSize: '24px',
        color: '#00ff00',
        fontStyle: 'bold',
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .on('pointerover', () => startText.setColor('#ffffff'))
      .on('pointerout', () => startText.setColor('#00ff00'))
      .on('pointerdown', () => this.startGame());

    // Blink animation
    this.tweens.add({
      targets: startText,
      alpha: 0.6,
      duration: 800,
      ease: 'Sine.easeInOut',
      yoyo: true,
      repeat: -1,
    });

    // Leaderboard button
    const leaderboardText = this.add
      .text(width / 2, menuY + 50, '[ LEADERBOARD ]', {
        fontSize: '20px',
        color: '#ffdd00',
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .on('pointerover', () => leaderboardText.setColor('#ffffff'))
      .on('pointerout', () => leaderboardText.setColor('#ffdd00'))
      .on('pointerdown', () => this.goToLeaderboard());

    // Controls hint
    const controlsHint = this.add.text(
      width / 2,
      height - 60,
      'ENTER/SPACE: Start  |  L: Leaderboard  |  ESC: Pause (in-game)',
      {
        fontSize: '12px',
        color: '#555555',
      }
    );
    controlsHint.setOrigin(0.5);

    // Keyboard input
    this.input.keyboard?.on('keydown-ENTER', this.startGame, this);
    this.input.keyboard?.on('keydown-SPACE', this.startGame, this);
    this.input.keyboard?.on('keydown-L', this.goToLeaderboard, this);
  }

  private startGame(): void {
    this.cleanup();
    useGameStore.getState().startGame();
    this.scene.start('GameScene');
  }

  private goToLeaderboard(): void {
    this.cleanup();
    this.scene.start('LeaderboardScene');
  }

  private cleanup(): void {
    this.input.keyboard?.off('keydown-ENTER', this.startGame, this);
    this.input.keyboard?.off('keydown-SPACE', this.startGame, this);
    this.input.keyboard?.off('keydown-L', this.goToLeaderboard, this);
  }
}
