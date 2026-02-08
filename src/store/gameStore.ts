import { create } from 'zustand';
import { GAME_CONSTANTS } from '../game/constants';
import type { GameState } from '../types';
import type { PracticeModeConfig } from '../game/modes/types';
import { RANKED_CONFIG, getSpeedWithCap } from '../game/modes/rankedConfig';

interface GameActions {
  startGame: () => void;
  startRankedGame: () => void;
  startPracticeGame: (config: PracticeModeConfig) => void;
  pauseGame: () => void;
  resumeGame: () => void;
  resetGame: () => void;
  addScore: (points: number) => void;
  incrementCombo: () => void;
  resetCombo: () => void;
  takeDamage: (amount: number) => void;
  recordHit: () => void;
  recordMiss: () => void;
  setTarget: (enemyId: string | null, word: string) => void;
  updateTypedPortion: (typed: string) => void;
  completeWord: () => void;
  increaseDifficulty: () => void;
}

const initialState: GameState = {
  isPlaying: false,
  isPaused: false,
  score: 0,
  multiplier: 1,
  comboCount: 0,
  maxCombo: 0,
  health: GAME_CONSTANTS.STARTING_HEALTH,
  maxHealth: GAME_CONSTANTS.STARTING_HEALTH,
  totalHits: 0,
  totalMisses: 0,
  wordsCompleted: 0,
  difficultyLevel: 1,
  spawnInterval: GAME_CONSTANTS.INITIAL_SPAWN_INTERVAL,
  enemySpeed: GAME_CONSTANTS.DEFAULT_ENEMY_SPEED,
  currentTargetId: null,
  currentWord: '',
  typedPortion: '',
  currentMode: 'ranked',
  modeConfig: null,
};

export const useGameStore = create<GameState & GameActions>((set, get) => ({
  ...initialState,

  startRankedGame: () => {
    const config = RANKED_CONFIG;
    set({
      ...initialState,
      isPlaying: true,
      currentMode: 'ranked',
      modeConfig: config,
      spawnInterval: config.initialSpawnInterval,
      enemySpeed: config.initialEnemySpeed,
      health: config.startingHealth,
      maxHealth: config.startingHealth,
    });
  },

  startPracticeGame: (config: PracticeModeConfig) => {
    set({
      ...initialState,
      isPlaying: true,
      currentMode: 'practice',
      modeConfig: config,
      spawnInterval: config.initialSpawnInterval,
      enemySpeed: config.initialEnemySpeed,
      health: config.startingHealth,
      maxHealth: config.startingHealth,
    });
  },

  // Keep backward compatibility - defaults to ranked
  startGame: () => get().startRankedGame(),

  pauseGame: () => set({ isPaused: true }),

  resumeGame: () => set({ isPaused: false }),

  resetGame: () => set(initialState),

  addScore: (points: number) =>
    set((state) => ({
      score: state.score + Math.floor(points * state.multiplier),
    })),

  incrementCombo: () =>
    set((state) => {
      const newCombo = state.comboCount + 1;
      const newMultiplier = Math.min(
        1 + Math.floor(newCombo / GAME_CONSTANTS.COMBO_THRESHOLD) * 0.5,
        GAME_CONSTANTS.MAX_MULTIPLIER
      );
      return {
        comboCount: newCombo,
        maxCombo: Math.max(state.maxCombo, newCombo),
        multiplier: newMultiplier,
      };
    }),

  resetCombo: () => set({ comboCount: 0, multiplier: 1 }),

  takeDamage: (amount: number) =>
    set((state) => {
      // Infinite health check for practice mode
      if (
        state.currentMode === 'practice' &&
        (state.modeConfig as PracticeModeConfig)?.infiniteHealth
      ) {
        return state;
      }
      return {
        health: Math.max(0, state.health - amount),
      };
    }),

  recordHit: () => set((state) => ({ totalHits: state.totalHits + 1 })),

  recordMiss: () => set((state) => ({ totalMisses: state.totalMisses + 1 })),

  setTarget: (enemyId: string | null, word: string) =>
    set({
      currentTargetId: enemyId,
      currentWord: word,
      typedPortion: '',
    }),

  updateTypedPortion: (typed: string) => set({ typedPortion: typed }),

  completeWord: () =>
    set((state) => ({
      wordsCompleted: state.wordsCompleted + 1,
      currentTargetId: null,
      currentWord: '',
      typedPortion: '',
    })),

  increaseDifficulty: () =>
    set((state) => {
      const newLevel = state.difficultyLevel + 1;

      // Practice mode: just increase level counter (batch spawning still applies)
      if (state.currentMode === 'practice') {
        return { difficultyLevel: newLevel };
      }

      // Ranked mode: use soft-capped speed progression
      // Spawn interval is now calculated per-batch in SpawnSystem
      const enemySpeed = getSpeedWithCap(newLevel);

      return {
        difficultyLevel: newLevel,
        enemySpeed,
      };
    }),
}));
