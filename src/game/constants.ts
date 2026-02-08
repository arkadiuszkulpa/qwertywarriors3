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

  // Batch spawning spacing
  CHAR_WIDTH_ESTIMATE: 11,   // Average pixels per character at 18px font
  STROKE_PADDING: 6,         // Extra width from text stroke (3px * 2 sides)
  MIN_WORD_GAP: 50,          // Minimum gap between word edges
  SPAWN_STAGGER_Y: 30,       // Vertical spread for batch spawns
};
