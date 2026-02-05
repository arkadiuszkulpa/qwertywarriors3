import Phaser from 'phaser';
import { GAME_CONSTANTS } from './constants';
import { BootScene } from './scenes/BootScene';
import { PreloadScene } from './scenes/PreloadScene';
import { MainMenuScene } from './scenes/MainMenuScene';
import { GameScene } from './scenes/GameScene';
import { GameOverScene } from './scenes/GameOverScene';

// Re-export constants for backward compatibility
export const GAME_CONFIG = GAME_CONSTANTS;

export const PHASER_CONFIG: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: GAME_CONSTANTS.WIDTH,
  height: GAME_CONSTANTS.HEIGHT,
  backgroundColor: GAME_CONSTANTS.BACKGROUND_COLOR,
  parent: 'game-container',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 0 },
      debug: false,
    },
  },
  scene: [BootScene, PreloadScene, MainMenuScene, GameScene, GameOverScene],
};
