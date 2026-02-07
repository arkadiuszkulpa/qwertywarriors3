import Phaser from 'phaser';
import { GAME_CONFIG } from '../config';
import { useGameStore } from '../../store/gameStore';
import type { WordTier } from '../modes/types';
import { PRACTICE_PRESETS, PRACTICE_RANGES, createPracticeConfig } from '../modes/practiceConfig';

export class PracticeSettingsScene extends Phaser.Scene {
  private selectedWordTier: WordTier = 'medium';
  private spawnInterval: number = PRACTICE_RANGES.spawnInterval.default;
  private enemySpeed: number = PRACTICE_RANGES.enemySpeed.default;
  private infiniteHealth: boolean = false;

  private tierButtons: Map<WordTier, Phaser.GameObjects.Text> = new Map();
  private presetButtons: Map<string, Phaser.GameObjects.Text> = new Map();
  private spawnValueText!: Phaser.GameObjects.Text;
  private speedValueText!: Phaser.GameObjects.Text;
  private healthCheckbox!: Phaser.GameObjects.Text;

  constructor() {
    super({ key: 'PracticeSettingsScene' });
  }

  create(): void {
    const { width, height } = { width: GAME_CONFIG.WIDTH, height: GAME_CONFIG.HEIGHT };

    // Title
    this.add
      .text(width / 2, 50, 'PRACTICE SETTINGS', {
        fontSize: '36px',
        color: '#ffaa00',
        fontStyle: 'bold',
      })
      .setOrigin(0.5);

    // Word Difficulty Section
    this.add
      .text(width / 2, 110, 'WORD DIFFICULTY', {
        fontSize: '16px',
        color: '#888888',
      })
      .setOrigin(0.5);

    this.createWordTierButtons(140);

    // Spawn Rate Section
    this.add
      .text(width / 2, 200, 'SPAWN RATE', {
        fontSize: '16px',
        color: '#888888',
      })
      .setOrigin(0.5);

    this.createSpawnSlider(230);

    // Enemy Speed Section
    this.add
      .text(width / 2, 290, 'ENEMY SPEED', {
        fontSize: '16px',
        color: '#888888',
      })
      .setOrigin(0.5);

    this.createSpeedSlider(320);

    // Infinite Health Toggle
    this.createHealthToggle(380);

    // Presets Section
    this.add
      .text(width / 2, 430, '--- PRESETS ---', {
        fontSize: '14px',
        color: '#555555',
      })
      .setOrigin(0.5);

    this.createPresetButtons(460);

    // Start Button
    const startButton = this.add
      .text(width / 2, 520, '[ START PRACTICE ]', {
        fontSize: '24px',
        color: '#00ff00',
        fontStyle: 'bold',
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .on('pointerover', () => startButton.setColor('#ffffff'))
      .on('pointerout', () => startButton.setColor('#00ff00'))
      .on('pointerdown', () => this.startPractice());

    // Blink animation
    this.tweens.add({
      targets: startButton,
      alpha: 0.6,
      duration: 800,
      ease: 'Sine.easeInOut',
      yoyo: true,
      repeat: -1,
    });

    // Controls hint
    this.add
      .text(width / 2, height - 40, 'ESC: Back to Menu  |  ENTER: Start Practice', {
        fontSize: '12px',
        color: '#555555',
      })
      .setOrigin(0.5);

    // Keyboard input
    this.input.keyboard?.on('keydown-ESC', this.goBack, this);
    this.input.keyboard?.on('keydown-ENTER', this.startPractice, this);

    // Update UI to reflect initial state
    this.updateUI();
  }

  private createWordTierButtons(y: number): void {
    const tiers: WordTier[] = ['easy', 'medium', 'hard', 'expert', 'mixed'];
    const tierLabels = ['EASY', 'MEDIUM', 'HARD', 'EXPERT', 'MIXED'];
    const startX = 160;
    const spacing = 120;

    tiers.forEach((tier, index) => {
      const button = this.add
        .text(startX + index * spacing, y, tierLabels[index], {
          fontSize: '16px',
          color: '#666666',
          backgroundColor: '#222222',
          padding: { x: 10, y: 5 },
        })
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true })
        .on('pointerdown', () => this.selectWordTier(tier));

      this.tierButtons.set(tier, button);
    });
  }

  private createSpawnSlider(y: number): void {
    const width = GAME_CONFIG.WIDTH;
    const range = PRACTICE_RANGES.spawnInterval;

    // Decrease button
    this.add
      .text(width / 2 - 150, y, '[ - ]', {
        fontSize: '20px',
        color: '#ffaa00',
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', () => {
        this.spawnInterval = Math.max(range.min, this.spawnInterval - range.step);
        this.updateUI();
      });

    // Value display
    this.spawnValueText = this.add
      .text(width / 2, y, '', {
        fontSize: '20px',
        color: '#ffffff',
      })
      .setOrigin(0.5);

    // Increase button
    this.add
      .text(width / 2 + 150, y, '[ + ]', {
        fontSize: '20px',
        color: '#ffaa00',
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', () => {
        this.spawnInterval = Math.min(range.max, this.spawnInterval + range.step);
        this.updateUI();
      });

    // Hint
    this.add
      .text(width / 2, y + 25, '(lower = faster spawning)', {
        fontSize: '11px',
        color: '#555555',
      })
      .setOrigin(0.5);
  }

  private createSpeedSlider(y: number): void {
    const width = GAME_CONFIG.WIDTH;
    const range = PRACTICE_RANGES.enemySpeed;

    // Decrease button
    this.add
      .text(width / 2 - 150, y, '[ - ]', {
        fontSize: '20px',
        color: '#ffaa00',
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', () => {
        this.enemySpeed = Math.max(range.min, this.enemySpeed - range.step);
        this.updateUI();
      });

    // Value display
    this.speedValueText = this.add
      .text(width / 2, y, '', {
        fontSize: '20px',
        color: '#ffffff',
      })
      .setOrigin(0.5);

    // Increase button
    this.add
      .text(width / 2 + 150, y, '[ + ]', {
        fontSize: '20px',
        color: '#ffaa00',
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', () => {
        this.enemySpeed = Math.min(range.max, this.enemySpeed + range.step);
        this.updateUI();
      });

    // Hint
    this.add
      .text(width / 2, y + 25, '(higher = faster enemies)', {
        fontSize: '11px',
        color: '#555555',
      })
      .setOrigin(0.5);
  }

  private createHealthToggle(y: number): void {
    const width = GAME_CONFIG.WIDTH;

    this.healthCheckbox = this.add
      .text(width / 2, y, '', {
        fontSize: '18px',
        color: '#ffffff',
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', () => {
        this.infiniteHealth = !this.infiniteHealth;
        this.updateUI();
      });
  }

  private createPresetButtons(y: number): void {
    const presets = ['beginner', 'normal', 'challenging', 'extreme'] as const;
    const labels = ['Beginner', 'Normal', 'Challenging', 'Extreme'];
    const startX = 170;
    const spacing = 120;

    presets.forEach((preset, index) => {
      const button = this.add
        .text(startX + index * spacing, y, labels[index], {
          fontSize: '14px',
          color: '#888888',
          backgroundColor: '#333333',
          padding: { x: 8, y: 4 },
        })
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true })
        .on('pointerover', () => button.setColor('#ffffff'))
        .on('pointerout', () => button.setColor('#888888'))
        .on('pointerdown', () => this.selectPreset(preset));

      this.presetButtons.set(preset, button);
    });
  }

  private selectWordTier(tier: WordTier): void {
    this.selectedWordTier = tier;
    this.updateUI();
  }

  private selectPreset(presetName: keyof typeof PRACTICE_PRESETS): void {
    const preset = PRACTICE_PRESETS[presetName];
    this.selectedWordTier = preset.wordTier;
    this.spawnInterval = preset.spawnInterval;
    this.enemySpeed = preset.enemySpeed;
    this.infiniteHealth = preset.infiniteHealth;
    this.updateUI();
  }

  private updateUI(): void {
    // Update word tier buttons
    this.tierButtons.forEach((button, tier) => {
      if (tier === this.selectedWordTier) {
        button.setColor('#00ff00');
        button.setBackgroundColor('#004400');
      } else {
        button.setColor('#666666');
        button.setBackgroundColor('#222222');
      }
    });

    // Update spawn interval display
    this.spawnValueText.setText(`${(this.spawnInterval / 1000).toFixed(1)}s`);

    // Update speed display
    this.speedValueText.setText(`${this.enemySpeed}`);

    // Update health checkbox
    const checkmark = this.infiniteHealth ? '[X]' : '[ ]';
    this.healthCheckbox.setText(`${checkmark} INFINITE HEALTH`);
    this.healthCheckbox.setColor(this.infiniteHealth ? '#00ff00' : '#888888');
  }

  private startPractice(): void {
    this.cleanup();
    const config = createPracticeConfig(
      this.selectedWordTier,
      this.spawnInterval,
      this.enemySpeed,
      this.infiniteHealth
    );
    useGameStore.getState().startPracticeGame(config);
    this.scene.start('GameScene');
  }

  private goBack(): void {
    this.cleanup();
    this.scene.start('MainMenuScene');
  }

  private cleanup(): void {
    this.input.keyboard?.off('keydown-ESC', this.goBack, this);
    this.input.keyboard?.off('keydown-ENTER', this.startPractice, this);
  }
}
