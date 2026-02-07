import type { PracticeModeConfig, WordTier } from './types';

// Practice mode presets for quick selection
export const PRACTICE_PRESETS = {
  beginner: {
    wordTier: 'easy' as WordTier,
    spawnInterval: 4000,
    enemySpeed: 20,
    infiniteHealth: true,
  },
  normal: {
    wordTier: 'medium' as WordTier,
    spawnInterval: 3000,
    enemySpeed: 30,
    infiniteHealth: false,
  },
  challenging: {
    wordTier: 'hard' as WordTier,
    spawnInterval: 2000,
    enemySpeed: 45,
    infiniteHealth: false,
  },
  extreme: {
    wordTier: 'expert' as WordTier,
    spawnInterval: 1200,
    enemySpeed: 60,
    infiniteHealth: false,
  },
};

// Valid ranges for practice mode sliders
export const PRACTICE_RANGES = {
  spawnInterval: { min: 800, max: 5000, step: 200, default: 3000 },
  enemySpeed: { min: 15, max: 80, step: 5, default: 30 },
};

// Create practice config from user selections
export function createPracticeConfig(
  wordTier: WordTier,
  spawnInterval: number,
  enemySpeed: number,
  infiniteHealth: boolean
): PracticeModeConfig {
  return {
    mode: 'practice',
    initialSpawnInterval: spawnInterval,
    minSpawnInterval: spawnInterval, // No progression in practice
    initialEnemySpeed: enemySpeed,
    startingHealth: 100,
    damagePerLetter: infiniteHealth ? 0 : 5,
    wordTier,
    infiniteHealth,
  };
}
