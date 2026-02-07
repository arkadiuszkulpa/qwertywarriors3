import Phaser from 'phaser';
import { GAME_CONFIG } from '../config';
import { useGameStore } from '../../store/gameStore';
import { useLeaderboardStore } from '../../store/leaderboardStore';
import { isApiConfigured } from '../../services/leaderboardApi';

export class GameOverScene extends Phaser.Scene {
  private usernameInput: Phaser.GameObjects.DOMElement | null = null;
  private submitButton: Phaser.GameObjects.Text | null = null;
  private statusText: Phaser.GameObjects.Text | null = null;
  private hasSubmitted: boolean = false;

  constructor() {
    super({ key: 'GameOverScene' });
  }

  create(): void {
    const { width, height } = { width: GAME_CONFIG.WIDTH, height: GAME_CONFIG.HEIGHT };
    const gameState = useGameStore.getState();
    const leaderboardStore = useLeaderboardStore.getState();

    this.hasSubmitted = false;

    // Game Over title
    const title = this.add.text(width / 2, 50, 'GAME OVER', {
      fontSize: '48px',
      color: '#ff4444',
      fontStyle: 'bold',
    });
    title.setOrigin(0.5);

    // Stats container - moved up to make room for leaderboard UI
    const statsY = 110;
    const lineHeight = 32;

    // Final Score
    this.add
      .text(width / 2, statsY, `FINAL SCORE: ${gameState.score.toLocaleString()}`, {
        fontSize: '28px',
        color: '#ffffff',
      })
      .setOrigin(0.5);

    // Stats row 1
    this.add
      .text(
        width / 2,
        statsY + lineHeight,
        `Words: ${gameState.wordsCompleted}  |  Level: ${gameState.difficultyLevel}`,
        {
          fontSize: '16px',
          color: '#00ff88',
        }
      )
      .setOrigin(0.5);

    // Stats row 2
    const totalAttempts = gameState.totalHits + gameState.totalMisses;
    const accuracy =
      totalAttempts > 0 ? Math.round((gameState.totalHits / totalAttempts) * 100) : 0;
    this.add
      .text(
        width / 2,
        statsY + lineHeight * 2,
        `Accuracy: ${accuracy}%  |  Best Combo: ${gameState.maxCombo}`,
        {
          fontSize: '16px',
          color: accuracy >= 80 ? '#00ff00' : accuracy >= 60 ? '#ffff00' : '#ff6600',
        }
      )
      .setOrigin(0.5);

    // Leaderboard section
    const leaderboardY = statsY + lineHeight * 3.5;

    // Divider
    this.add
      .rectangle(width / 2, leaderboardY, width - 100, 2, 0x444466)
      .setOrigin(0.5);

    // Only show leaderboard UI if API is configured
    if (isApiConfigured()) {
      this.createLeaderboardUI(leaderboardY + 20, gameState, leaderboardStore);
    } else {
      this.add
        .text(width / 2, leaderboardY + 40, 'Leaderboard not configured', {
          fontSize: '16px',
          color: '#666666',
        })
        .setOrigin(0.5);
    }

    // Navigation prompts at bottom
    const restartText = this.add.text(width / 2, height - 80, 'Press ENTER to Play Again', {
      fontSize: '20px',
      color: '#00ff00',
    });
    restartText.setOrigin(0.5);

    this.tweens.add({
      targets: restartText,
      alpha: 0.3,
      duration: 800,
      ease: 'Sine.easeInOut',
      yoyo: true,
      repeat: -1,
    });

    const menuText = this.add.text(
      width / 2,
      height - 50,
      'ESC: Menu  |  L: Leaderboard',
      {
        fontSize: '14px',
        color: '#888888',
      }
    );
    menuText.setOrigin(0.5);

    // Keyboard input
    this.input.keyboard?.on('keydown-ENTER', this.handleEnter, this);
    this.input.keyboard?.on('keydown-SPACE', this.restartGame, this);
    this.input.keyboard?.on('keydown-ESC', this.goToMenu, this);
    this.input.keyboard?.on('keydown-L', this.goToLeaderboard, this);
  }

  private createLeaderboardUI(
    y: number,
    gameState: ReturnType<typeof useGameStore.getState>,
    leaderboardStore: ReturnType<typeof useLeaderboardStore.getState>
  ): void {
    const width = GAME_CONFIG.WIDTH;

    // Title
    this.add
      .text(width / 2, y, 'SUBMIT TO LEADERBOARD', {
        fontSize: '18px',
        color: '#ffdd00',
        fontStyle: 'bold',
      })
      .setOrigin(0.5);

    // Username input
    const inputY = y + 40;
    const savedUsername = leaderboardStore.username || '';

    // Create HTML input element
    const inputHtml = `
      <input
        type="text"
        id="username-input"
        value="${savedUsername}"
        placeholder="Enter username"
        maxlength="20"
        style="
          width: 200px;
          padding: 8px 12px;
          font-size: 16px;
          border: 2px solid #4a4a6e;
          border-radius: 4px;
          background: #1a1a2e;
          color: #ffffff;
          text-align: center;
          outline: none;
        "
      />
    `;

    this.usernameInput = this.add.dom(width / 2, inputY).createFromHTML(inputHtml);

    // Focus handling
    const inputElement = this.usernameInput.getChildByID('username-input') as HTMLInputElement;
    if (inputElement) {
      inputElement.addEventListener('focus', () => {
        inputElement.style.borderColor = '#00ff88';
      });
      inputElement.addEventListener('blur', () => {
        inputElement.style.borderColor = '#4a4a6e';
      });
      // Update store on change
      inputElement.addEventListener('input', () => {
        useLeaderboardStore.getState().setUsername(inputElement.value);
      });
    }

    // Submit button
    this.submitButton = this.add
      .text(width / 2, inputY + 50, '[ SUBMIT SCORE ]', {
        fontSize: '18px',
        color: '#00ff88',
        fontStyle: 'bold',
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .on('pointerover', () => {
        this.submitButton?.setColor('#ffffff');
      })
      .on('pointerout', () => {
        this.submitButton?.setColor('#00ff88');
      })
      .on('pointerdown', () => {
        this.submitScore(gameState);
      });

    // Status text
    this.statusText = this.add
      .text(width / 2, inputY + 90, '', {
        fontSize: '14px',
        color: '#888888',
      })
      .setOrigin(0.5);
  }

  private async submitScore(
    gameState: ReturnType<typeof useGameStore.getState>
  ): Promise<void> {
    if (this.hasSubmitted) {
      this.statusText?.setText('Score already submitted!');
      return;
    }

    const inputElement = this.usernameInput?.getChildByID(
      'username-input'
    ) as HTMLInputElement;
    const username = inputElement?.value?.trim() || '';

    if (!username) {
      this.statusText?.setText('Please enter a username').setColor('#ff4444');
      return;
    }

    // Update store with username
    useLeaderboardStore.getState().setUsername(username);

    // Show loading state
    this.statusText?.setText('Submitting...').setColor('#ffff00');
    this.submitButton?.setColor('#666666');

    // Calculate accuracy
    const totalAttempts = gameState.totalHits + gameState.totalMisses;
    const accuracy =
      totalAttempts > 0
        ? Math.round((gameState.totalHits / totalAttempts) * 1000) / 10
        : 0;

    // Submit score
    const success = await useLeaderboardStore.getState().submitPlayerScore({
      score: gameState.score,
      wordsCompleted: gameState.wordsCompleted,
      accuracy,
      maxCombo: gameState.maxCombo,
      difficultyLevel: gameState.difficultyLevel,
    });

    if (success) {
      this.hasSubmitted = true;
      const rank = useLeaderboardStore.getState().lastSubmittedRank;
      if (rank && rank <= 10) {
        this.statusText?.setText(`Submitted! Rank #${rank} - TOP 10!`).setColor('#00ff88');
      } else if (rank) {
        this.statusText?.setText(`Submitted! Rank #${rank}`).setColor('#00ff88');
      } else {
        this.statusText?.setText('Score submitted!').setColor('#00ff88');
      }
      this.submitButton?.setText('[ SUBMITTED ✓ ]').setColor('#666666');
    } else {
      const error = useLeaderboardStore.getState().error;
      this.statusText?.setText(error || 'Failed to submit').setColor('#ff4444');
      this.submitButton?.setColor('#00ff88');
    }
  }

  private handleEnter(): void {
    // If input is focused, don't restart - let user type
    const inputElement = this.usernameInput?.getChildByID(
      'username-input'
    ) as HTMLInputElement;
    if (document.activeElement === inputElement) {
      // Submit on enter if input focused
      this.submitScore(useGameStore.getState());
      return;
    }
    this.restartGame();
  }

  private restartGame(): void {
    this.cleanup();
    useLeaderboardStore.getState().clearLastRank();
    useGameStore.getState().startGame();
    this.scene.start('GameScene');
  }

  private goToMenu(): void {
    this.cleanup();
    useLeaderboardStore.getState().clearLastRank();
    useGameStore.getState().resetGame();
    this.scene.start('MainMenuScene');
  }

  private goToLeaderboard(): void {
    this.cleanup();
    this.scene.start('LeaderboardScene');
  }

  private cleanup(): void {
    this.input.keyboard?.off('keydown-ENTER', this.handleEnter, this);
    this.input.keyboard?.off('keydown-SPACE', this.restartGame, this);
    this.input.keyboard?.off('keydown-ESC', this.goToMenu, this);
    this.input.keyboard?.off('keydown-L', this.goToLeaderboard, this);
  }
}
