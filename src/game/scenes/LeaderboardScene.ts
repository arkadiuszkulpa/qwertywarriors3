import Phaser from 'phaser';
import { GAME_CONFIG } from '../config';
import { useLeaderboardStore } from '../../store/leaderboardStore';
import { isApiConfigured } from '../../services/leaderboardApi';

export class LeaderboardScene extends Phaser.Scene {
  private scoreTexts: Phaser.GameObjects.Text[] = [];
  private loadingText: Phaser.GameObjects.Text | null = null;
  private errorText: Phaser.GameObjects.Text | null = null;

  constructor() {
    super({ key: 'LeaderboardScene' });
  }

  create(): void {
    const { width, height } = { width: GAME_CONFIG.WIDTH, height: GAME_CONFIG.HEIGHT };

    // Title
    this.add
      .text(width / 2, 40, 'LEADERBOARD', {
        fontSize: '36px',
        color: '#ffdd00',
        fontStyle: 'bold',
      })
      .setOrigin(0.5);

    // Subtitle
    this.add
      .text(width / 2, 75, 'Top 10 Warriors', {
        fontSize: '16px',
        color: '#888888',
      })
      .setOrigin(0.5);

    // Loading text
    this.loadingText = this.add
      .text(width / 2, height / 2, 'Loading...', {
        fontSize: '20px',
        color: '#888888',
      })
      .setOrigin(0.5);

    // Error text (hidden initially)
    this.errorText = this.add
      .text(width / 2, height / 2, '', {
        fontSize: '18px',
        color: '#ff4444',
      })
      .setOrigin(0.5)
      .setVisible(false);

    // Column headers
    this.createHeaders();

    // Navigation
    const backText = this.add
      .text(width / 2, height - 50, 'Press ESC or ENTER to go back', {
        fontSize: '16px',
        color: '#888888',
      })
      .setOrigin(0.5);

    this.tweens.add({
      targets: backText,
      alpha: 0.5,
      duration: 1000,
      yoyo: true,
      repeat: -1,
    });

    // Keyboard input
    this.input.keyboard?.on('keydown-ESC', this.goBack, this);
    this.input.keyboard?.on('keydown-ENTER', this.goBack, this);
    this.input.keyboard?.on('keydown-SPACE', this.goBack, this);

    // Fetch leaderboard
    this.fetchLeaderboard();
  }

  private createHeaders(): void {
    const y = 110;
    const style = { fontSize: '14px', color: '#666666' };

    this.add.text(60, y, 'RANK', style);
    this.add.text(120, y, 'PLAYER', style);
    this.add.text(320, y, 'SCORE', style);
    this.add.text(440, y, 'WORDS', style);
    this.add.text(520, y, 'ACC', style);
    this.add.text(590, y, 'COMBO', style);
    this.add.text(670, y, 'LVL', style);

    // Divider line
    this.add.rectangle(GAME_CONFIG.WIDTH / 2, y + 20, GAME_CONFIG.WIDTH - 80, 1, 0x444466);
  }

  private async fetchLeaderboard(): Promise<void> {
    if (!isApiConfigured()) {
      this.loadingText?.setVisible(false);
      this.errorText?.setText('Leaderboard API not configured').setVisible(true);
      return;
    }

    try {
      await useLeaderboardStore.getState().fetchLeaderboard(10);
      this.displayScores();
    } catch {
      this.loadingText?.setVisible(false);
      this.errorText?.setText('Failed to load leaderboard').setVisible(true);
    }
  }

  private displayScores(): void {
    this.loadingText?.setVisible(false);

    const { scores, error } = useLeaderboardStore.getState();

    if (error) {
      this.errorText?.setText(error).setVisible(true);
      return;
    }

    if (scores.length === 0) {
      this.errorText?.setText('No scores yet. Be the first!').setColor('#888888').setVisible(true);
      return;
    }

    // Clear existing score texts
    this.scoreTexts.forEach((text) => text.destroy());
    this.scoreTexts = [];

    const startY = 140;
    const lineHeight = 36;
    const currentUsername = useLeaderboardStore.getState().username;

    scores.forEach((score, index) => {
      const y = startY + index * lineHeight;
      const isCurrentUser = score.username === currentUsername;

      // Row background for current user
      if (isCurrentUser) {
        this.add
          .rectangle(GAME_CONFIG.WIDTH / 2, y + 8, GAME_CONFIG.WIDTH - 60, lineHeight - 4, 0x004400, 0.3)
          .setOrigin(0.5);
      }

      // Rank
      const rankColor = index === 0 ? '#ffd700' : index === 1 ? '#c0c0c0' : index === 2 ? '#cd7f32' : '#ffffff';
      const rankText = this.add.text(60, y, `#${score.rank}`, {
        fontSize: '18px',
        color: rankColor,
        fontStyle: index < 3 ? 'bold' : 'normal',
      });
      this.scoreTexts.push(rankText);

      // Username
      const usernameText = this.add.text(120, y, this.truncateUsername(score.username), {
        fontSize: '16px',
        color: isCurrentUser ? '#00ff88' : '#ffffff',
        fontStyle: isCurrentUser ? 'bold' : 'normal',
      });
      this.scoreTexts.push(usernameText);

      // Score
      const scoreText = this.add.text(320, y, score.score.toLocaleString(), {
        fontSize: '16px',
        color: '#ffdd00',
      });
      this.scoreTexts.push(scoreText);

      // Words
      const wordsText = this.add.text(440, y, String(score.wordsCompleted), {
        fontSize: '16px',
        color: '#00ff88',
      });
      this.scoreTexts.push(wordsText);

      // Accuracy
      const accColor = score.accuracy >= 90 ? '#00ff00' : score.accuracy >= 70 ? '#ffff00' : '#ff6600';
      const accText = this.add.text(520, y, `${score.accuracy}%`, {
        fontSize: '16px',
        color: accColor,
      });
      this.scoreTexts.push(accText);

      // Combo
      const comboText = this.add.text(590, y, String(score.maxCombo), {
        fontSize: '16px',
        color: '#ffaa00',
      });
      this.scoreTexts.push(comboText);

      // Level
      const levelText = this.add.text(670, y, String(score.difficultyLevel), {
        fontSize: '16px',
        color: '#aa88ff',
      });
      this.scoreTexts.push(levelText);
    });
  }

  private truncateUsername(username: string): string {
    return username.length > 15 ? username.substring(0, 12) + '...' : username;
  }

  private goBack(): void {
    this.cleanup();
    this.scene.start('MainMenuScene');
  }

  private cleanup(): void {
    this.input.keyboard?.off('keydown-ESC', this.goBack, this);
    this.input.keyboard?.off('keydown-ENTER', this.goBack, this);
    this.input.keyboard?.off('keydown-SPACE', this.goBack, this);
  }
}
