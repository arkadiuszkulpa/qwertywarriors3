// Game mode types

export type GameMode = 'ranked' | 'practice';

export type WordTier = 'easy' | 'medium' | 'hard' | 'expert' | 'mixed';

// Base configuration shared by all modes
export interface BaseModeConfig {
  mode: GameMode;
  initialSpawnInterval: number;
  minSpawnInterval: number;
  initialEnemySpeed: number;
  startingHealth: number;
  damagePerLetter: number;
}

// Ranked mode uses standardized progression
export interface RankedModeConfig extends BaseModeConfig {
  mode: 'ranked';
  spawnIntervalDecrement: number;
  speedIncrement: number;
  wordsPerLevel: number;
  wordTierThresholds: {
    easy: number;
    medium: number;
    hard: number;
    expert: number;
  };
}

// Practice mode uses static user-selected settings
export interface PracticeModeConfig extends BaseModeConfig {
  mode: 'practice';
  wordTier: WordTier;
  infiniteHealth: boolean;
}

export type ModeConfig = RankedModeConfig | PracticeModeConfig;
