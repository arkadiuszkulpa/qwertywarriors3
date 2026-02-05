// Game constants - separated to avoid circular dependencies

export const GAME_CONSTANTS = {
  // Display
  WIDTH: 800,
  HEIGHT: 600,
  HUD_HEIGHT: 80,

  // Gameplay area
  SPAWN_Y: -50,
  DAMAGE_LINE_Y: 480,
  PLAYER_Y: 500,

  // Spawning
  INITIAL_SPAWN_INTERVAL: 3000,
  MIN_SPAWN_INTERVAL: 1000,
  MAX_ACTIVE_ENEMIES: 10,

  // Scoring
  POINTS_PER_LETTER: 10,
  POINTS_PER_WORD_BONUS: 50,
  COMBO_THRESHOLD: 5,
  MAX_MULTIPLIER: 5,

  // Health
  STARTING_HEALTH: 100,
  DAMAGE_PER_LETTER: 5,

  // Visual
  BACKGROUND_COLOR: 0x1a1a2e,

  // Physics
  BULLET_SPEED: 1500,
  DEFAULT_ENEMY_SPEED: 30,
};
