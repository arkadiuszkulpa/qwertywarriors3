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
    const title = this.add.text(width / 2, 80, 'QWERTY WARRIORS', {
      fontSize: '48px',
      color: '#ffffff',
      fontStyle: 'bold',
    });
    title.setOrigin(0.5);

    // Subtitle
    const subtitle = this.add.text(width / 2, 130, 'Type to Survive', {
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
      const instruction = this.add.text(width / 2, 190 + index * 24, text, {
        fontSize: '14px',
        color: '#aaaaaa',
      });
      instruction.setOrigin(0.5);
    });

    // Menu options
    const menuY = 320;

    // Ranked Mode button
    const rankedText = this.add
      .text(width / 2, menuY, '[ RANKED MODE ]', {
        fontSize: '24px',
        color: '#00ff00',
        fontStyle: 'bold',
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .on('pointerover', () => rankedText.setColor('#ffffff'))
      .on('pointerout', () => rankedText.setColor('#00ff00'))
      .on('pointerdown', () => this.startRankedGame());

    // Ranked description
    this.add
      .text(width / 2, menuY + 28, 'Compete on the leaderboard', {
        fontSize: '12px',
        color: '#448844',
      })
      .setOrigin(0.5);

    // Blink animation for ranked
    this.tweens.add({
      targets: rankedText,
      alpha: 0.6,
      duration: 800,
      ease: 'Sine.easeInOut',
      yoyo: true,
      repeat: -1,
    });

    // Practice Mode button
    const practiceText = this.add
      .text(width / 2, menuY + 70, '[ PRACTICE MODE ]', {
        fontSize: '22px',
        color: '#ffaa00',
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .on('pointerover', () => practiceText.setColor('#ffffff'))
      .on('pointerout', () => practiceText.setColor('#ffaa00'))
      .on('pointerdown', () => this.goToPracticeSettings());

    // Practice description
    this.add
      .text(width / 2, menuY + 98, 'Train at your own pace', {
        fontSize: '12px',
        color: '#886622',
      })
      .setOrigin(0.5);

    // Leaderboard button
    const leaderboardText = this.add
      .text(width / 2, menuY + 145, '[ LEADERBOARD ]', {
        fontSize: '18px',
        color: '#ff8800',
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .on('pointerover', () => leaderboardText.setColor('#ffffff'))
      .on('pointerout', () => leaderboardText.setColor('#ff8800'))
      .on('pointerdown', () => this.goToLeaderboard());

    // Controls hint
    const controlsHint = this.add.text(
      width / 2,
      height - 50,
      'R: Ranked  |  P: Practice  |  L: Leaderboard  |  ESC: Pause (in-game)',
      {
        fontSize: '11px',
        color: '#555555',
      }
    );
    controlsHint.setOrigin(0.5);

    // Keyboard input
    this.input.keyboard?.on('keydown-ENTER', this.startRankedGame, this);
    this.input.keyboard?.on('keydown-SPACE', this.startRankedGame, this);
    this.input.keyboard?.on('keydown-R', this.startRankedGame, this);
    this.input.keyboard?.on('keydown-P', this.goToPracticeSettings, this);
    this.input.keyboard?.on('keydown-L', this.goToLeaderboard, this);
  }

  private startRankedGame(): void {
    this.cleanup();
    useGameStore.getState().startRankedGame();
    this.scene.start('GameScene');
  }

  private goToPracticeSettings(): void {
    this.cleanup();
    this.scene.start('PracticeSettingsScene');
  }

  private goToLeaderboard(): void {
    this.cleanup();
    this.scene.start('LeaderboardScene');
  }

  private cleanup(): void {
    this.input.keyboard?.off('keydown-ENTER', this.startRankedGame, this);
    this.input.keyboard?.off('keydown-SPACE', this.startRankedGame, this);
    this.input.keyboard?.off('keydown-R', this.startRankedGame, this);
    this.input.keyboard?.off('keydown-P', this.goToPracticeSettings, this);
    this.input.keyboard?.off('keydown-L', this.goToLeaderboard, this);
  }
}
