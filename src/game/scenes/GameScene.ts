import Phaser from 'phaser';
import { GAME_CONFIG } from '../config';
import { Player } from '../entities/Player';
import { Enemy } from '../entities/Enemy';
import { Bullet } from '../entities/Bullet';
import { SpawnSystem } from '../systems/SpawnSystem';
import { TargetingSystem } from '../systems/TargetingSystem';
import { TypingSystem } from '../systems/TypingSystem';
import { HUD } from '../ui/HUD';
import { useGameStore } from '../../store/gameStore';
import { audioManager } from '../../audio/AudioManager';

export class GameScene extends Phaser.Scene {
  private player!: Player;
  private enemies!: Phaser.GameObjects.Group;
  private bullets!: Phaser.GameObjects.Group;
  private hud!: HUD;

  private spawnSystem!: SpawnSystem;
  private targetingSystem!: TargetingSystem;
  private typingSystem!: TypingSystem;

  private damageLine!: Phaser.GameObjects.Rectangle;
  private isPaused: boolean = false;
  private pauseOverlay!: Phaser.GameObjects.Container;

  constructor() {
    super({ key: 'GameScene' });
  }

  create(): void {
    // Create groups
    this.enemies = this.add.group();
    this.bullets = this.add.group();

    // Create game elements
    this.createBackground();
    this.createDamageLine();
    this.createPlayer();
    this.createHUD();

    // Initialize systems
    this.initializeSystems();

    // Setup pause functionality
    this.setupPause();

    // Create pause overlay (hidden)
    this.createPauseOverlay();
  }

  update(time: number, delta: number): void {
    if (this.isPaused) return;

    const state = useGameStore.getState();

    // Check game over
    if (state.health <= 0) {
      this.gameOver();
      return;
    }

    // Update systems
    this.spawnSystem.update(time);

    // Update enemies
    this.updateEnemies(delta);

    // Update bullets
    this.updateBullets(delta);

    // Check collisions
    this.checkCollisions();

    // Update HUD
    this.hud.update();
  }

  private createBackground(): void {
    // Grid pattern background
    const graphics = this.add.graphics();
    graphics.lineStyle(1, 0x222244, 0.3);

    // Vertical lines
    for (let x = 0; x <= GAME_CONFIG.WIDTH; x += 40) {
      graphics.moveTo(x, 0);
      graphics.lineTo(x, GAME_CONFIG.HEIGHT - GAME_CONFIG.HUD_HEIGHT);
    }

    // Horizontal lines
    for (let y = 0; y <= GAME_CONFIG.HEIGHT - GAME_CONFIG.HUD_HEIGHT; y += 40) {
      graphics.moveTo(0, y);
      graphics.lineTo(GAME_CONFIG.WIDTH, y);
    }

    graphics.strokePath();
  }

  private createDamageLine(): void {
    // Visual indicator of where enemies cause damage
    this.damageLine = this.add.rectangle(
      GAME_CONFIG.WIDTH / 2,
      GAME_CONFIG.DAMAGE_LINE_Y,
      GAME_CONFIG.WIDTH,
      4,
      0xff0000,
      0.3
    );

    // Subtle pulse animation
    this.tweens.add({
      targets: this.damageLine,
      alpha: 0.1,
      duration: 1000,
      yoyo: true,
      repeat: -1,
    });
  }

  private createPlayer(): void {
    this.player = new Player(
      this,
      GAME_CONFIG.WIDTH / 2,
      GAME_CONFIG.PLAYER_Y
    );
  }

  private createHUD(): void {
    this.hud = new HUD(this);
  }

  private initializeSystems(): void {
    this.targetingSystem = new TargetingSystem(this, this.enemies);
    this.spawnSystem = new SpawnSystem(this, this.enemies);
    this.typingSystem = new TypingSystem(
      this,
      this.targetingSystem,
      this.player,
      this.bullets,
      this.onEnemyDestroyedByTyping.bind(this)
    );
  }

  private setupPause(): void {
    this.input.keyboard?.on('keydown-ESC', this.togglePause, this);
  }

  private createPauseOverlay(): void {
    this.pauseOverlay = this.add.container(0, 0);
    this.pauseOverlay.setDepth(200);
    this.pauseOverlay.setVisible(false);

    // Dark overlay
    const overlay = this.add.rectangle(
      GAME_CONFIG.WIDTH / 2,
      GAME_CONFIG.HEIGHT / 2,
      GAME_CONFIG.WIDTH,
      GAME_CONFIG.HEIGHT,
      0x000000,
      0.7
    );
    this.pauseOverlay.add(overlay);

    // Pause text
    const pauseText = this.add.text(
      GAME_CONFIG.WIDTH / 2,
      GAME_CONFIG.HEIGHT / 2 - 40,
      'PAUSED',
      {
        fontSize: '48px',
        color: '#ffffff',
        fontStyle: 'bold',
      }
    );
    pauseText.setOrigin(0.5);
    this.pauseOverlay.add(pauseText);

    // Resume instruction
    const resumeText = this.add.text(
      GAME_CONFIG.WIDTH / 2,
      GAME_CONFIG.HEIGHT / 2 + 20,
      'Press ESC to Resume',
      {
        fontSize: '20px',
        color: '#888888',
      }
    );
    resumeText.setOrigin(0.5);
    this.pauseOverlay.add(resumeText);

    // Quit instruction
    const quitText = this.add.text(
      GAME_CONFIG.WIDTH / 2,
      GAME_CONFIG.HEIGHT / 2 + 60,
      'Press Q to Quit',
      {
        fontSize: '16px',
        color: '#666666',
      }
    );
    quitText.setOrigin(0.5);
    this.pauseOverlay.add(quitText);
  }

  private togglePause(): void {
    this.isPaused = !this.isPaused;
    this.pauseOverlay.setVisible(this.isPaused);

    if (this.isPaused) {
      useGameStore.getState().pauseGame();
      this.input.keyboard?.on('keydown-Q', this.quitToMenu, this);
    } else {
      useGameStore.getState().resumeGame();
      this.input.keyboard?.off('keydown-Q', this.quitToMenu, this);
    }
  }

  private quitToMenu(): void {
    this.cleanup();
    useGameStore.getState().resetGame();
    this.scene.start('MainMenuScene');
  }

  private updateEnemies(delta: number): void {
    this.enemies.getChildren().forEach((obj) => {
      const enemy = obj as Enemy;
      enemy.update(delta);
    });
  }

  private updateBullets(delta: number): void {
    this.bullets.getChildren().forEach((obj) => {
      const bullet = obj as Bullet;
      bullet.update(delta);
    });
  }

  private checkCollisions(): void {
    const enemiesToRemove: Enemy[] = [];

    this.enemies.getChildren().forEach((obj) => {
      const enemy = obj as Enemy;

      if (enemy.y >= GAME_CONFIG.DAMAGE_LINE_Y) {
        enemiesToRemove.push(enemy);
      }
    });

    enemiesToRemove.forEach((enemy) => {
      this.handleEnemyReachedBottom(enemy);
    });
  }

  private handleEnemyReachedBottom(enemy: Enemy): void {
    const store = useGameStore.getState();

    // Calculate damage based on remaining letters
    const damage = enemy.getRemainingWord().length * GAME_CONFIG.DAMAGE_PER_LETTER;
    store.takeDamage(damage);

    // Play hit sound
    audioManager.play('hit');

    // Screen effects
    this.cameras.main.shake(100, 0.015);
    this.cameras.main.flash(200, 255, 0, 0, false, undefined, 0.3);

    // Clear target if this was targeted
    if (this.targetingSystem.getCurrentTarget() === enemy) {
      this.targetingSystem.clearTarget();
    }

    // Notify spawn system
    this.spawnSystem.onEnemyReachedBottom(enemy);

    // Destroy enemy
    enemy.destroy();
  }

  private onEnemyDestroyedByTyping(enemy: Phaser.GameObjects.GameObject): void {
    this.spawnSystem.onEnemyDestroyed(enemy as Enemy);
  }

  private gameOver(): void {
    this.cleanup();
    this.scene.start('GameOverScene');
  }

  private cleanup(): void {
    this.typingSystem.destroy();
    this.input.keyboard?.off('keydown-ESC', this.togglePause, this);
    this.input.keyboard?.off('keydown-Q', this.quitToMenu, this);
  }
}
