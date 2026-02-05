export interface EnemyConfig {
  word: string;
  speed: number;
  health: number;
  points: number;
}

export interface GameState {
  isPlaying: boolean;
  isPaused: boolean;
  score: number;
  multiplier: number;
  comboCount: number;
  maxCombo: number;
  health: number;
  maxHealth: number;
  totalHits: number;
  totalMisses: number;
  wordsCompleted: number;
  difficultyLevel: number;
  spawnInterval: number;
  enemySpeed: number;
  currentTargetId: string | null;
  currentWord: string;
  typedPortion: string;
}

export interface SettingsState {
  masterVolume: number;
  sfxVolume: number;
  musicVolume: number;
}
