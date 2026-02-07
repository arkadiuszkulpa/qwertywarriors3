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

// Leaderboard types
export interface LeaderboardScore {
  rank: number;
  id: string;
  username: string;
  score: number;
  wordsCompleted: number;
  accuracy: number;
  maxCombo: number;
  difficultyLevel: number;
  createdAt: string;
}

export interface ScoreSubmission {
  username: string;
  score: number;
  wordsCompleted: number;
  accuracy: number;
  maxCombo: number;
  difficultyLevel: number;
}

export interface LeaderboardResponse {
  scores: LeaderboardScore[];
  count: number;
}

export interface SubmitScoreResponse {
  success: boolean;
  score?: LeaderboardScore;
  id?: string;
  message?: string;
}

export interface LeaderboardState {
  scores: LeaderboardScore[];
  isLoading: boolean;
  error: string | null;
  lastSubmittedRank: number | null;
  username: string;
}
