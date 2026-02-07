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
