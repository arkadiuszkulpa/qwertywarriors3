import { Howl, Howler } from 'howler';

interface SoundConfig {
  src: string[];
  volume?: number;
  loop?: boolean;
}

const SOUNDS: Record<string, SoundConfig> = {
  shoot: { src: ['/assets/audio/shoot.wav'], volume: 0.5 },
  jam: { src: ['/assets/audio/jam.wav'], volume: 0.7 },
  explosion: { src: ['/assets/audio/explosion.wav'], volume: 0.6 },
  hit: { src: ['/assets/audio/hit.wav'], volume: 0.8 },
  levelup: { src: ['/assets/audio/levelup.wav'], volume: 0.6 },
};

class AudioManager {
  private static instance: AudioManager;
  private sounds: Map<string, Howl> = new Map();
  private initialized = false;
  private enabled = true;

  private constructor() {}

  static getInstance(): AudioManager {
    if (!AudioManager.instance) {
      AudioManager.instance = new AudioManager();
    }
    return AudioManager.instance;
  }

  init(): void {
    if (this.initialized) return;

    for (const [key, config] of Object.entries(SOUNDS)) {
      const howl = new Howl({
        src: config.src,
        volume: config.volume ?? 1,
        loop: config.loop ?? false,
        preload: true,
        onloaderror: () => {
          console.warn(`Failed to load sound: ${key}`);
        },
      });
      this.sounds.set(key, howl);
    }

    this.initialized = true;
  }

  play(soundKey: string): void {
    if (!this.enabled) return;

    const sound = this.sounds.get(soundKey);
    if (sound) {
      sound.play();
    }
  }

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    if (!enabled) {
      Howler.mute(true);
    } else {
      Howler.mute(false);
    }
  }

  setVolume(volume: number): void {
    Howler.volume(volume);
  }
}

export const audioManager = AudioManager.getInstance();
