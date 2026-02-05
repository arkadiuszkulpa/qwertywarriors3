import Phaser from 'phaser';
import { Enemy } from '../entities/Enemy';
import { GAME_CONFIG } from '../config';
import { useGameStore } from '../../store/gameStore';
import { getWordListForDifficulty, getRandomWord } from '../../data/words';
import type { EnemyConfig } from '../../types';

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

    const { spawnInterval, difficultyLevel } = useGameStore.getState();

    if (time - this.lastSpawnTime >= spawnInterval) {
      const maxEnemies = Math.min(
        GAME_CONFIG.MAX_ACTIVE_ENEMIES,
        3 + Math.floor(difficultyLevel / 2)
      );

      if (this.enemies.getLength() < maxEnemies) {
        this.spawnEnemy();
        this.lastSpawnTime = time;
      }
    }
  }

  private spawnEnemy(): void {
    const { difficultyLevel, enemySpeed } = useGameStore.getState();

    const word = this.selectWord(difficultyLevel);
    const x = this.getSpawnX();
    const y = GAME_CONFIG.SPAWN_Y;

    const config: EnemyConfig = {
      word,
      speed: enemySpeed + Math.random() * 10,
      health: 1,
      points: word.length * GAME_CONFIG.POINTS_PER_LETTER,
    };

    const enemy = new Enemy(this.scene, x, y, config);
    this.enemies.add(enemy);
    this.activeFirstLetters.add(word.charAt(0).toLowerCase());
  }

  private selectWord(difficultyLevel: number): string {
    const wordList = getWordListForDifficulty(difficultyLevel);

    // Try to avoid words with same first letter as active enemies
    // This prevents targeting ambiguity
    let attempts = 0;
    let word: string;

    do {
      word = getRandomWord(wordList);
      attempts++;
    } while (
      this.activeFirstLetters.has(word.charAt(0).toLowerCase()) &&
      attempts < 50
    );

    return word;
  }

  private getSpawnX(): number {
    // Spread enemies across screen width with padding
    const padding = 60;
    return Phaser.Math.Between(padding, GAME_CONFIG.WIDTH - padding);
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
