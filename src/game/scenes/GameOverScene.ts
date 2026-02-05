import Phaser from 'phaser';
import { GAME_CONFIG } from '../config';
import { useGameStore } from '../../store/gameStore';

export class GameOverScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameOverScene' });
  }

  create(): void {
    const { width, height } = { width: GAME_CONFIG.WIDTH, height: GAME_CONFIG.HEIGHT };
    const state = useGameStore.getState();

    // Game Over title
    const title = this.add.text(width / 2, 80, 'GAME OVER', {
      fontSize: '48px',
      color: '#ff4444',
      fontStyle: 'bold',
    });
    title.setOrigin(0.5);

    // Stats container
    const statsY = 180;
    const lineHeight = 40;

    // Final Score
    this.add.text(width / 2, statsY, `FINAL SCORE: ${state.score.toLocaleString()}`, {
      fontSize: '32px',
      color: '#ffffff',
    }).setOrigin(0.5);

    // Words completed
    this.add.text(width / 2, statsY + lineHeight, `Words Destroyed: ${state.wordsCompleted}`, {
      fontSize: '20px',
      color: '#00ff88',
    }).setOrigin(0.5);

    // Accuracy
    const totalAttempts = state.totalHits + state.totalMisses;
    const accuracy = totalAttempts > 0
      ? Math.round((state.totalHits / totalAttempts) * 100)
      : 0;
    this.add.text(width / 2, statsY + lineHeight * 2, `Accuracy: ${accuracy}%`, {
      fontSize: '20px',
      color: accuracy >= 80 ? '#00ff00' : accuracy >= 60 ? '#ffff00' : '#ff6600',
    }).setOrigin(0.5);

    // Hits / Misses
    this.add.text(width / 2, statsY + lineHeight * 3, `Hits: ${state.totalHits}  |  Misses: ${state.totalMisses}`, {
      fontSize: '18px',
      color: '#888888',
    }).setOrigin(0.5);

    // Max combo
    this.add.text(width / 2, statsY + lineHeight * 4, `Best Combo: ${state.maxCombo}`, {
      fontSize: '18px',
      color: '#ffaa00',
    }).setOrigin(0.5);

    // Difficulty reached
    this.add.text(width / 2, statsY + lineHeight * 5, `Level Reached: ${state.difficultyLevel}`, {
      fontSize: '18px',
      color: '#aa88ff',
    }).setOrigin(0.5);

    // Restart prompt
    const restartText = this.add.text(width / 2, height - 120, 'Press ENTER to Play Again', {
      fontSize: '24px',
      color: '#00ff00',
    });
    restartText.setOrigin(0.5);

    // Blink animation
    this.tweens.add({
      targets: restartText,
      alpha: 0.3,
      duration: 800,
      ease: 'Sine.easeInOut',
      yoyo: true,
      repeat: -1,
    });

    // Menu prompt
    const menuText = this.add.text(width / 2, height - 70, 'Press ESC for Main Menu', {
      fontSize: '16px',
      color: '#888888',
    });
    menuText.setOrigin(0.5);

    // Keyboard input
    this.input.keyboard?.on('keydown-ENTER', this.restartGame, this);
    this.input.keyboard?.on('keydown-SPACE', this.restartGame, this);
    this.input.keyboard?.on('keydown-ESC', this.goToMenu, this);
  }

  private restartGame(): void {
    useGameStore.getState().startGame();
    this.scene.start('GameScene');
  }

  private goToMenu(): void {
    useGameStore.getState().resetGame();
    this.scene.start('MainMenuScene');
  }
}
