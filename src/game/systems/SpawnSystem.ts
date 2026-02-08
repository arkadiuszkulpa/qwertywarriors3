import Phaser from 'phaser';
import { Enemy } from '../entities/Enemy';
import { GAME_CONFIG } from '../config';
import { GAME_CONSTANTS } from '../constants';
import { useGameStore } from '../../store/gameStore';
import { getWordListForTier, getWordListForTiers, getRandomWord } from '../../data/words';
import { getRankedDifficultyForLevel, getBatchConfig, getBatchInterval } from '../modes/rankedConfig';
import type { EnemyConfig } from '../../types';
import type { PracticeModeConfig } from '../modes/types';

interface SpawnSlot {
  x: number;
  y: number;
}

export class SpawnSystem {
  private scene: Phaser.Scene;
  private enemies: Phaser.GameObjects.Group;
  private lastSpawnTime: number = 0;
  private activeFirstLetters: Set<string> = new Set();
  private paused: boolean = false;

  constructor(scene: Phaser.Scene, enemies: Phaser.GameObjects.Group) {
    this.scene = scene;
    this.enemies = enemies;
  }

  update(time: number): void {
    if (this.paused) return;

    const { difficultyLevel } = useGameStore.getState();

    // Get batch configuration for current level
    const batchConfig = getBatchConfig(difficultyLevel);
    const targetBatchSize = Phaser.Math.Between(batchConfig.min, batchConfig.max);
    const batchInterval = getBatchInterval(difficultyLevel, targetBatchSize);

    if (time - this.lastSpawnTime >= batchInterval) {
      const maxEnemies = Math.min(
        GAME_CONFIG.MAX_ACTIVE_ENEMIES,
        3 + Math.floor(difficultyLevel / 2)
      );

      // Calculate how many we can actually spawn
      const currentCount = this.enemies.getLength();
      const availableSlots = maxEnemies - currentCount;

      if (availableSlots > 0) {
        const actualBatchSize = Math.min(targetBatchSize, availableSlots);
        this.spawnBatch(actualBatchSize);
        this.lastSpawnTime = time;
      }
    }
  }

  private spawnBatch(requestedSize: number): void {
    if (requestedSize <= 0) return;

    const { difficultyLevel, enemySpeed } = useGameStore.getState();

    // Select words for the batch (with unique first letters)
    const words = this.selectWordsForBatch(requestedSize, difficultyLevel);

    if (words.length === 0) return;

    // Calculate spawn positions to prevent overlap
    const slots = this.calculateSpawnSlots(words);

    if (!slots) {
      // Words don't fit - try with fewer words
      if (words.length > 1) {
        this.spawnBatch(words.length - 1);
      }
      return;
    }

    // Spawn each word
    words.forEach((word, index) => {
      const slot = slots[index];

      const config: EnemyConfig = {
        word,
        speed: enemySpeed + Math.random() * 5,
        health: 1,
        points: word.length * GAME_CONFIG.POINTS_PER_LETTER,
      };

      const enemy = new Enemy(this.scene, slot.x, slot.y, config);
      this.enemies.add(enemy);
      this.activeFirstLetters.add(word.charAt(0).toLowerCase());
    });
  }

  private selectWordsForBatch(size: number, difficultyLevel: number): string[] {
    const { currentMode, modeConfig } = useGameStore.getState();

    let wordList: string[];

    if (currentMode === 'practice' && modeConfig) {
      const practiceConfig = modeConfig as PracticeModeConfig;
      wordList = getWordListForTier(practiceConfig.wordTier);
    } else {
      const { wordTiers } = getRankedDifficultyForLevel(difficultyLevel);
      wordList = getWordListForTiers(wordTiers);
    }

    const words: string[] = [];
    const usedFirstLetters = new Set(this.activeFirstLetters);

    for (let i = 0; i < size; i++) {
      let attempts = 0;
      let word: string;

      // Try to find a word with a unique first letter
      do {
        word = getRandomWord(wordList);
        attempts++;
      } while (
        usedFirstLetters.has(word.charAt(0).toLowerCase()) &&
        attempts < 100
      );

      // Only add if we found a unique word (or exhausted attempts)
      if (attempts < 100 || !usedFirstLetters.has(word.charAt(0).toLowerCase())) {
        words.push(word);
        usedFirstLetters.add(word.charAt(0).toLowerCase());
      }
    }

    return words;
  }

  private calculateSpawnSlots(words: string[]): SpawnSlot[] | null {
    const padding = 60;
    const usableWidth = GAME_CONFIG.WIDTH - padding * 2;
    const leftBound = padding;

    // Estimate width for each word
    const wordWidths = words.map((w) => this.estimateWordWidth(w));

    // Calculate total space needed
    const totalWordWidth = wordWidths.reduce((sum, w) => sum + w, 0);
    const totalGapWidth = (words.length - 1) * GAME_CONSTANTS.MIN_WORD_GAP;
    const totalRequired = totalWordWidth + totalGapWidth;

    // Check if words can fit
    if (totalRequired > usableWidth) {
      return null;
    }

    // Calculate extra space for distribution
    const extraSpace = usableWidth - totalRequired;
    const extraGapPerSlot = words.length > 1 ? extraSpace / (words.length - 1) : 0;
    const actualGap = GAME_CONSTANTS.MIN_WORD_GAP + extraGapPerSlot;

    // Build slot positions from left to right
    const slots: SpawnSlot[] = [];
    let currentX = leftBound;

    for (let i = 0; i < words.length; i++) {
      const halfWidth = wordWidths[i] / 2;
      const centerX = currentX + halfWidth;

      // Stagger Y positions so words don't form a wall
      const y = this.getStaggeredSpawnY(i, words.length);

      slots.push({ x: centerX, y });

      currentX += wordWidths[i] + actualGap;
    }

    return slots;
  }

  private estimateWordWidth(word: string): number {
    return (
      word.length * GAME_CONSTANTS.CHAR_WIDTH_ESTIMATE +
      GAME_CONSTANTS.STROKE_PADDING
    );
  }

  private getStaggeredSpawnY(index: number, batchSize: number): number {
    const baseY = GAME_CONFIG.SPAWN_Y;

    if (batchSize <= 1) return baseY;

    // Spread words over the stagger range
    const offset = (index / (batchSize - 1)) * GAME_CONSTANTS.SPAWN_STAGGER_Y;
    return baseY - offset;
  }

  onEnemyDestroyed(enemy: Enemy): void {
    this.activeFirstLetters.delete(enemy.word.charAt(0).toLowerCase());
  }

  onEnemyReachedBottom(enemy: Enemy): void {
    this.activeFirstLetters.delete(enemy.word.charAt(0).toLowerCase());
  }

  pause(): void {
    this.paused = true;
  }

  resume(): void {
    this.paused = false;
  }

  reset(): void {
    this.lastSpawnTime = 0;
    this.activeFirstLetters.clear();
    this.paused = false;
  }
}
