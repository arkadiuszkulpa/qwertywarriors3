import type { RankedModeConfig } from './types';

// Ranked mode configuration - standardized for all players
// Adjust these multipliers to tune difficulty curve
export const RANKED_CONFIG: RankedModeConfig = {
  mode: 'ranked',

  // Starting values
  initialSpawnInterval: 3000,
  minSpawnInterval: 800,
  initialEnemySpeed: 30,
  startingHealth: 100,
  damagePerLetter: 5,

  // Progression multipliers (applied per level-up)
  spawnIntervalDecrement: 150,
  speedIncrement: 4,
  wordsPerLevel: 10,

  // Word tier thresholds by difficulty level
  wordTierThresholds: {
    easy: 1,    // levels 1-2: easy only
    medium: 3,  // levels 3-5: easy + medium
    hard: 6,    // levels 6-8: medium + hard
    expert: 9,  // levels 9+: hard + expert
  },

  // Batch spawning configuration
  batchSpawning: {
    enabled: true,
    levelBatchSizes: [
      { maxLevel: 2, min: 4, max: 5 },   // Early game: lots of short words
      { maxLevel: 5, min: 3, max: 4 },   // Mid-early: moderate batches
      { maxLevel: 8, min: 2, max: 3 },   // Mid-late: smaller batches
      { maxLevel: Infinity, min: 1, max: 2 }, // Late game: 1-2 long words
    ],
    minWordGap: 50,      // Minimum pixels between word edges
    yStaggerRange: 30,   // Vertical spread within a batch
  },
  maxEnemySpeed: 70,     // Soft cap for enemy speed
};

// Calculate difficulty parameters for a given level
export function getRankedDifficultyForLevel(level: number): {
  spawnInterval: number;
  enemySpeed: number;
  wordTiers: string[];
} {
  const config = RANKED_CONFIG;

  // Calculate spawn interval with floor
  const spawnInterval = Math.max(
    config.minSpawnInterval,
    config.initialSpawnInterval - (level - 1) * config.spawnIntervalDecrement
  );

  // Calculate speed (no ceiling - progressively harder)
  const enemySpeed = config.initialEnemySpeed + (level - 1) * config.speedIncrement;

  // Determine which word tiers to use
  const wordTiers: string[] = [];
  const thresholds = config.wordTierThresholds;

  if (level >= thresholds.expert) {
    wordTiers.push('hard', 'expert');
  } else if (level >= thresholds.hard) {
    wordTiers.push('medium', 'hard');
  } else if (level >= thresholds.medium) {
    wordTiers.push('easy', 'medium');
  } else {
    wordTiers.push('easy');
  }

  return { spawnInterval, enemySpeed, wordTiers };
}

// Get batch size configuration for a given level
export function getBatchConfig(level: number): { min: number; max: number } {
  const { levelBatchSizes } = RANKED_CONFIG.batchSpawning;

  for (const config of levelBatchSizes) {
    if (level <= config.maxLevel) {
      return { min: config.min, max: config.max };
    }
  }

  // Fallback to last config
  const lastConfig = levelBatchSizes[levelBatchSizes.length - 1];
  return { min: lastConfig.min, max: lastConfig.max };
}

// Calculate spawn interval for batch spawning
// Uses log2 scaling so batches don't wait too long
export function getBatchInterval(level: number, batchSize: number): number {
  const config = RANKED_CONFIG;

  // Base single-spawn interval
  const baseInterval = Math.max(
    config.minSpawnInterval,
    config.initialSpawnInterval - (level - 1) * config.spawnIntervalDecrement
  );

  // Scale by batch size using log2 (diminishing returns)
  // batch=1 -> mult=1.0, batch=3 -> mult=2.58, batch=5 -> mult=3.32
  const batchMultiplier = 1 + Math.log2(Math.max(1, batchSize));

  return Math.round(baseInterval * batchMultiplier);
}

// Calculate enemy speed with soft cap (asymptotic curve)
export function getSpeedWithCap(level: number): number {
  const config = RANKED_CONFIG;
  const baseSpeed = config.initialEnemySpeed;
  const maxSpeed = config.maxEnemySpeed;
  const growthRate = 0.15;

  // Asymptotic curve: starts fast, slows approaching maxSpeed
  // speed = base + (max - base) * (1 - e^(-growthRate * level))
  const speedRange = maxSpeed - baseSpeed;
  const speedBonus = speedRange * (1 - Math.exp(-growthRate * level));

  return baseSpeed + speedBonus;
}
