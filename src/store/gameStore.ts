import { create } from 'zustand';
import { GAME_CONSTANTS } from '../game/constants';
import type { GameState } from '../types';

interface GameActions {
  startGame: () => void;
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
};

export const useGameStore = create<GameState & GameActions>((set) => ({
  ...initialState,

  startGame: () =>
    set({
      ...initialState,
      isPlaying: true,
    }),

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
    set((state) => ({
      health: Math.max(0, state.health - amount),
    })),

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
      const newSpawnInterval = Math.max(
        GAME_CONSTANTS.MIN_SPAWN_INTERVAL,
        state.spawnInterval - 200
      );
      const newSpeed = state.enemySpeed + 5;
      return {
        difficultyLevel: newLevel,
        spawnInterval: newSpawnInterval,
        enemySpeed: newSpeed,
      };
    }),
}));
