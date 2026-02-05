import Phaser from 'phaser';
import { Enemy } from '../entities/Enemy';
import { useGameStore } from '../../store/gameStore';

export class TargetingSystem {
  private enemies: Phaser.GameObjects.Group;
  private currentTarget: Enemy | null = null;

  constructor(_scene: Phaser.Scene, enemies: Phaser.GameObjects.Group) {
    this.enemies = enemies;
  }

  /**
   * Find target for a given keystroke
   * Priority:
   * 1. Continue current target if keystroke matches next letter
   * 2. Find new enemy whose word starts with the keystroke
   * 3. Prefer enemies closest to bottom (most dangerous)
   */
  findTarget(key: string): Enemy | null {
    const lowerKey = key.toLowerCase();

    // If we have a current target and key matches, continue
    if (this.currentTarget && !this.currentTarget.scene) {
      // Target was destroyed
      this.currentTarget = null;
    }

    if (this.currentTarget) {
      if (this.currentTarget.getFirstLetter() === lowerKey) {
        return this.currentTarget;
      }
      // Key doesn't match current target - this is a miss
      return null;
    }

    // Search for new target
    const candidates: Enemy[] = [];

    this.enemies.getChildren().forEach((obj) => {
      const enemy = obj as Enemy;
      if (enemy.getFirstLetter() === lowerKey) {
        candidates.push(enemy);
      }
    });

    if (candidates.length === 0) {
      return null;
    }

    // Select closest to bottom (most urgent threat)
    candidates.sort((a, b) => b.y - a.y);
    return candidates[0];
  }

  setTarget(enemy: Enemy | null): void {
    // Clear previous target highlighting
    if (this.currentTarget && this.currentTarget.scene) {
      this.currentTarget.setTargeted(false);
    }

    this.currentTarget = enemy;

    // Highlight new target and update store
    if (enemy) {
      enemy.setTargeted(true);
      useGameStore.getState().setTarget(enemy.id, enemy.word);
    } else {
      useGameStore.getState().setTarget(null, '');
    }
  }

  getCurrentTarget(): Enemy | null {
    return this.currentTarget;
  }

  clearTarget(): void {
    this.setTarget(null);
  }

  hasActiveTarget(): boolean {
    return this.currentTarget !== null && this.currentTarget.scene !== undefined;
  }
}
