import Phaser from 'phaser';
import { GAME_CONFIG } from '../config';
import { useGameStore } from '../../store/gameStore';
import { HealthBar } from './HealthBar';
import { WordDisplay } from './WordDisplay';
import type { PracticeModeConfig } from '../modes/types';

export class HUD extends Phaser.GameObjects.Container {
  private scoreText!: Phaser.GameObjects.Text;
  private multiplierText!: Phaser.GameObjects.Text;
  private comboText!: Phaser.GameObjects.Text;
  private healthBar!: HealthBar;
  private hitsText!: Phaser.GameObjects.Text;
  private missesText!: Phaser.GameObjects.Text;
  private wordDisplay!: WordDisplay;
  private levelText!: Phaser.GameObjects.Text;
  private modeIndicator!: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene) {
    super(scene, 0, GAME_CONFIG.HEIGHT - GAME_CONFIG.HUD_HEIGHT);

    this.createBackground();
    this.createModeIndicator();
    this.createLeftSection();
    this.createCenterSection();
    this.createRightSection();

    scene.add.existing(this);
    this.setScrollFactor(0);
    this.setDepth(100);
  }

  private createBackground(): void {
    // Main background
    const bg = this.scene.add.rectangle(
      GAME_CONFIG.WIDTH / 2,
      GAME_CONFIG.HUD_HEIGHT / 2,
      GAME_CONFIG.WIDTH,
      GAME_CONFIG.HUD_HEIGHT,
      0x1a1a2e,
      0.95
    );
    this.add(bg);

    // Top border line
    const topLine = this.scene.add.rectangle(
      GAME_CONFIG.WIDTH / 2,
      1,
      GAME_CONFIG.WIDTH,
      2,
      0x4a4a6e
    );
    this.add(topLine);

    // Divider lines
    const divider1 = this.scene.add.rectangle(
      GAME_CONFIG.WIDTH / 3,
      GAME_CONFIG.HUD_HEIGHT / 2,
      2,
      GAME_CONFIG.HUD_HEIGHT - 20,
      0x333355
    );
    this.add(divider1);

    const divider2 = this.scene.add.rectangle(
      (GAME_CONFIG.WIDTH / 3) * 2,
      GAME_CONFIG.HUD_HEIGHT / 2,
      2,
      GAME_CONFIG.HUD_HEIGHT - 20,
      0x333355
    );
    this.add(divider2);
  }

  private createModeIndicator(): void {
    const { currentMode } = useGameStore.getState();

    const modeText = currentMode === 'ranked' ? 'RANKED' : 'PRACTICE';
    const modeColor = currentMode === 'ranked' ? '#00ff88' : '#ffaa00';

    this.modeIndicator = this.scene.add.text(GAME_CONFIG.WIDTH / 2, 4, modeText, {
      fontSize: '10px',
      color: modeColor,
      fontStyle: 'bold',
    });
    this.modeIndicator.setOrigin(0.5, 0);
    this.add(this.modeIndicator);
  }

  private createLeftSection(): void {
    const x = 20;
    const baseY = 18;

    // Score label
    const scoreLabel = this.scene.add.text(x, baseY, 'SCORE', {
      fontSize: '12px',
      color: '#888888',
    });
    this.add(scoreLabel);

    // Score value
    this.scoreText = this.scene.add.text(x, baseY + 14, '0', {
      fontSize: '24px',
      color: '#ffffff',
      fontStyle: 'bold',
    });
    this.add(this.scoreText);

    // Multiplier
    this.multiplierText = this.scene.add.text(x + 130, baseY + 14, 'x1.0', {
      fontSize: '20px',
      color: '#ffdd00',
      fontStyle: 'bold',
    });
    this.add(this.multiplierText);

    // Combo
    this.comboText = this.scene.add.text(x, baseY + 45, 'COMBO: 0', {
      fontSize: '14px',
      color: '#aaaaaa',
    });
    this.add(this.comboText);

    // Level
    this.levelText = this.scene.add.text(x + 110, baseY + 45, 'LVL 1', {
      fontSize: '14px',
      color: '#aa88ff',
    });
    this.add(this.levelText);
  }

  private createCenterSection(): void {
    const centerX = GAME_CONFIG.WIDTH / 2;

    // Target label
    const targetLabel = this.scene.add.text(centerX, 16, 'TARGET', {
      fontSize: '12px',
      color: '#888888',
    });
    targetLabel.setOrigin(0.5, 0);
    this.add(targetLabel);

    // Word display
    this.wordDisplay = new WordDisplay(this.scene, centerX, 50);
    this.add(this.wordDisplay);
  }

  private createRightSection(): void {
    const rightX = GAME_CONFIG.WIDTH - 20;
    const baseY = 18;

    // Health label
    const healthLabel = this.scene.add.text(rightX - 180, baseY, 'HEALTH', {
      fontSize: '12px',
      color: '#888888',
    });
    this.add(healthLabel);

    // Health bar
    this.healthBar = new HealthBar(this.scene, rightX - 180, baseY + 16, 180, 18);
    this.add(this.healthBar);

    // Hits/Misses
    this.hitsText = this.scene.add.text(rightX - 180, baseY + 42, 'HITS: 0', {
      fontSize: '14px',
      color: '#00ff88',
    });
    this.add(this.hitsText);

    this.missesText = this.scene.add.text(rightX - 80, baseY + 42, 'MISS: 0', {
      fontSize: '14px',
      color: '#ff4444',
    });
    this.add(this.missesText);
  }

  update(): void {
    const state = useGameStore.getState();

    // Update score
    this.scoreText.setText(state.score.toLocaleString());

    // Update multiplier with color coding
    this.multiplierText.setText(`x${state.multiplier.toFixed(1)}`);
    this.updateMultiplierColor(state.multiplier);

    // Update combo
    this.comboText.setText(`COMBO: ${state.comboCount}`);

    // Update level
    this.levelText.setText(`LVL ${state.difficultyLevel}`);

    // Update word display
    this.wordDisplay.setWord(state.currentWord, state.typedPortion);

    // Update health bar - check for infinite health in practice mode
    if (
      state.currentMode === 'practice' &&
      (state.modeConfig as PracticeModeConfig)?.infiniteHealth
    ) {
      this.healthBar.setInfinite();
    } else {
      this.healthBar.setHealth(state.health, state.maxHealth);
    }

    // Update hits/misses
    this.hitsText.setText(`HITS: ${state.totalHits}`);
    this.missesText.setText(`MISS: ${state.totalMisses}`);
  }

  private updateMultiplierColor(multiplier: number): void {
    if (multiplier >= 4) {
      this.multiplierText.setColor('#ff00ff');
    } else if (multiplier >= 3) {
      this.multiplierText.setColor('#ff8800');
    } else if (multiplier >= 2) {
      this.multiplierText.setColor('#ffdd00');
    } else {
      this.multiplierText.setColor('#ffffff');
    }
  }
}
