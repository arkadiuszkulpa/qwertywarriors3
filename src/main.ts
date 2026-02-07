import Phaser from 'phaser';
import { PHASER_CONFIG } from './game/config';
import { initializeAmplify } from './services/leaderboardApi';
import './styles.css';

// Initialize Amplify for leaderboard (non-blocking)
initializeAmplify().then((success) => {
  if (!success) {
    console.log('Leaderboard will be unavailable. See AMPLIFY_SETUP.md for setup instructions.');
  }
});

new Phaser.Game(PHASER_CONFIG);
