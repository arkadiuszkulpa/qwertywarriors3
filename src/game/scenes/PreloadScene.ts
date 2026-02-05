import Phaser from 'phaser';
import { audioManager } from '../../audio/AudioManager';

export class PreloadScene extends Phaser.Scene {
  constructor() {
    super({ key: 'PreloadScene' });
  }

  preload(): void {
    this.createLoadingBar();

    // Audio files are optional - game works without them
    this.load.on('loaderror', () => {
      // Silently ignore missing audio files
    });
  }

  create(): void {
    // Initialize audio manager
    audioManager.init();

    this.scene.start('MainMenuScene');
  }

  private createLoadingBar(): void {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // Loading text
    const loadingText = this.add.text(width / 2, height / 2 - 50, 'Loading...', {
      fontSize: '24px',
      color: '#ffffff',
    });
    loadingText.setOrigin(0.5);

    // Progress bar background
    const progressBarBg = this.add.rectangle(width / 2, height / 2, 400, 30, 0x333333);
    progressBarBg.setOrigin(0.5);

    // Progress bar fill
    const progressBar = this.add.rectangle(width / 2 - 195, height / 2, 0, 20, 0x00ff00);
    progressBar.setOrigin(0, 0.5);

    // Update progress bar
    this.load.on('progress', (value: number) => {
      progressBar.width = 390 * value;
    });
  }
}
