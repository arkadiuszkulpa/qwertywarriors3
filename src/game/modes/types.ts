// Game mode types

export type GameMode = 'ranked' | 'practice';

export type WordTier = 'easy' | 'medium' | 'hard' | 'expert' | 'mixed';

// Batch spawning configuration
export interface BatchLevelConfig {
  maxLevel: number;
  min: number;
  max: number;
}

export interface BatchSpawnConfig {
  enabled: boolean;
  levelBatchSizes: BatchLevelConfig[];
  minWordGap: number;
  yStaggerRange: number;
}

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
  // Batch spawning
  batchSpawning: BatchSpawnConfig;
  maxEnemySpeed: number;
}

// Practice mode uses static user-selected settings
export interface PracticeModeConfig extends BaseModeConfig {
  mode: 'practice';
  wordTier: WordTier;
  infiniteHealth: boolean;
}

export type ModeConfig = RankedModeConfig | PracticeModeConfig;
