/**
 * InputHandler.ts
 * İki oyunculu yerel giriş yönetimi:
 *
 * Klasik Sarkaç Mekaniği:
 * Kancalar otomatik olarak pürüzsüz bir sarkaç gibi salınır.
 *
 * Oyuncu 1 (Sol Madenci - Mavi):
 *   - S veya Boşluk: Kanca Fırlat (Zamanlama bazlı)
 *   - W: Dinamit Kullan (Ağır kaya çekilirken patlatır)
 *
 * Oyuncu 2 (Sağ Madenci - Kırmızı):
 *   - Aşağı Ok (↓): Kanca Fırlat (Zamanlama bazlı)
 *   - Yukarı Ok (↑): Dinamit Kullan (Ağır kaya çekilirken patlatır)
 */

import Phaser from 'phaser';
import { Hook } from '../entities/Hook';
import { GameStateManager } from '../state/GameState';

export class InputHandler {
  private keyP1S!: Phaser.Input.Keyboard.Key;
  private keyP1W!: Phaser.Input.Keyboard.Key;
  private keyP1Space!: Phaser.Input.Keyboard.Key;

  private keyP2Down!: Phaser.Input.Keyboard.Key;
  private keyP2Up!: Phaser.Input.Keyboard.Key;

  private hookP1: Hook;
  private hookP2: Hook;
  private stateManager: GameStateManager;

  constructor(scene: Phaser.Scene, hookP1: Hook, hookP2: Hook) {
    this.hookP1 = hookP1;
    this.hookP2 = hookP2;
    this.stateManager = GameStateManager.getInstance();

    if (scene.input.keyboard) {
      // Oyuncu 1 (WASD)
      this.keyP1S = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
      this.keyP1W = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
      this.keyP1Space = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

      // Oyuncu 2 (Ok Tuşları)
      this.keyP2Down = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN);
      this.keyP2Up = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP);
    }
  }

  public update(): void {
    if (!this.keyP1S || !this.keyP2Down) return;

    const swapped = this.stateManager.isControlsSwapped;

    // Fırlatma ve Dinamit Tuşları
    const p1Launch = Phaser.Input.Keyboard.JustDown(this.keyP1S) || Phaser.Input.Keyboard.JustDown(this.keyP1Space);
    const p1Dynamite = Phaser.Input.Keyboard.JustDown(this.keyP1W);

    const p2Launch = Phaser.Input.Keyboard.JustDown(this.keyP2Down);
    const p2Dynamite = Phaser.Input.Keyboard.JustDown(this.keyP2Up);

    if (swapped) {
      // P1 ok tuşlarıyla, P2 WASD ile
      if (p2Launch) this.hookP1.launch();
      if (p2Dynamite) this.hookP1.throwDynamite();

      if (p1Launch) this.hookP2.launch();
      if (p1Dynamite) this.hookP2.throwDynamite();
    } else {
      // Standart Mod: P1 (S / W), P2 (↓ / ↑)
      if (p1Launch) this.hookP1.launch();
      if (p1Dynamite) this.hookP1.throwDynamite();

      if (p2Launch) this.hookP2.launch();
      if (p2Dynamite) this.hookP2.throwDynamite();
    }
  }
}
