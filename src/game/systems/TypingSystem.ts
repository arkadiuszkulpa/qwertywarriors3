import Phaser from 'phaser';
import { TargetingSystem } from './TargetingSystem';
import { Player } from '../entities/Player';
import { Bullet } from '../entities/Bullet';
import { useGameStore } from '../../store/gameStore';
import { audioManager } from '../../audio/AudioManager';
import { GAME_CONFIG } from '../config';

export class TypingSystem {
  private scene: Phaser.Scene;
  private targetingSystem: TargetingSystem;
  private player: Player;
  private bullets: Phaser.GameObjects.Group;
  private onEnemyDestroyed: (enemy: Phaser.GameObjects.GameObject) => void;

  constructor(
    scene: Phaser.Scene,
    targetingSystem: TargetingSystem,
    player: Player,
    bullets: Phaser.GameObjects.Group,
    onEnemyDestroyed: (enemy: Phaser.GameObjects.GameObject) => void
  ) {
    this.scene = scene;
    this.targetingSystem = targetingSystem;
    this.player = player;
    this.bullets = bullets;
    this.onEnemyDestroyed = onEnemyDestroyed;
    this.setupKeyboardInput();
  }

  private setupKeyboardInput(): void {
    this.scene.input.keyboard?.on('keydown', this.handleKeyDown, this);
  }

  private handleKeyDown(event: KeyboardEvent): void {
    // Ignore non-letter keys
    if (!this.isValidKey(event.key)) {
      return;
    }

    // Prevent default browser behavior
    event.preventDefault();

    const key = event.key;
    const target = this.targetingSystem.findTarget(key);

    if (target) {
      this.processHit(target, key);
    } else {
      this.processMiss();
    }
  }

  private isValidKey(key: string): boolean {
    return /^[a-zA-Z]$/.test(key);
  }

  private processHit(enemy: Phaser.GameObjects.GameObject & { hitLetter: () => { letter: string; position: Phaser.Math.Vector2; destroyed: boolean }; x: number; y: number; word: string }, key: string): void {
    const store = useGameStore.getState();

    // Set this enemy as current target
    this.targetingSystem.setTarget(enemy as any);

    // Hit the letter
    const result = enemy.hitLetter();

    // Create bullet toward enemy
    this.createBullet(result.position);

    // Play shoot sound
    audioManager.play('shoot');

    // Player animation
    this.player.shoot(enemy.x, enemy.y);

    // Update store
    store.recordHit();
    store.incrementCombo();
    store.addScore(GAME_CONFIG.POINTS_PER_LETTER);
    store.updateTypedPortion(store.typedPortion + key.toLowerCase());

    // Check if word completed
    if (result.destroyed) {
      this.handleEnemyDestroyed(enemy);
    }
  }

  private processMiss(): void {
    const store = useGameStore.getState();

    // Play jam sound
    audioManager.play('jam');

    // Visual feedback
    this.player.playJamAnimation();
    this.scene.cameras.main.shake(50, 0.003);

    // Update store
    store.recordMiss();
    store.resetCombo();
  }

  private handleEnemyDestroyed(enemy: Phaser.GameObjects.GameObject & { word: string; x: number; y: number }): void {
    const store = useGameStore.getState();

    // Bonus points for completing word
    store.addScore(enemy.word.length * GAME_CONFIG.POINTS_PER_WORD_BONUS);
    store.completeWord();

    // Check for difficulty increase
    if (store.wordsCompleted > 0 && store.wordsCompleted % 10 === 0) {
      store.increaseDifficulty();
      audioManager.play('levelup');
    }

    // Play explosion sound
    audioManager.play('explosion');

    // Create explosion effect
    this.createExplosion(enemy.x, enemy.y);

    // Clear target
    this.targetingSystem.clearTarget();

    // Notify callback
    this.onEnemyDestroyed(enemy);

    // Destroy enemy
    enemy.destroy();
  }

  private createBullet(targetPos: Phaser.Math.Vector2): void {
    const muzzlePos = this.player.getMuzzlePosition();
    const bullet = new Bullet(this.scene, muzzlePos.x, muzzlePos.y, targetPos);
    this.bullets.add(bullet);
  }

  private createExplosion(x: number, y: number): void {
    // Create particle explosion effect
    const particles = this.scene.add.particles(x, y, 'explosion-particle', {
      speed: { min: 100, max: 200 },
      scale: { start: 1, end: 0 },
      lifespan: 500,
      quantity: 15,
      emitting: false,
    });

    particles.explode();

    // Clean up after animation
    this.scene.time.delayedCall(600, () => {
      particles.destroy();
    });
  }

  destroy(): void {
    this.scene.input.keyboard?.off('keydown', this.handleKeyDown, this);
  }
}
