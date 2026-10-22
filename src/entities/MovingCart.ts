/**
 * MovingCart.ts
 * İleri bölümlerde yeraltı katmanlarında yatay eksende sağa sola devriye gezen
 * hareketli maden vagonları (Elmas Taşıyan veya Patlayıcı TNT Taşıyan Vagonlar).
 */

import Phaser from 'phaser';
import { MiningEntity } from './Entity';
import { EntityTypeConfig } from '../config/GameConfig';

export class MovingCart extends MiningEntity {
  public velocityX: number;
  private minX: number = 85;
  private maxX: number = 1195;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    config: EntityTypeConfig,
    speed: number = 115
  ) {
    super(scene, x, y, config);

    // Başlangıç yönü rastgele
    const goRight = Math.random() < 0.5;
    this.velocityX = goRight ? speed : -speed;
    this.setFlipX(!goRight);

    // Vagon ray tekerlek hafif tıkırtı sarsıntı animasyonu
    scene.tweens.add({
      targets: this,
      y: y + 2,
      duration: 120,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  }

  /**
   * Her karede yatay eksende hareket ve sınırlardan sekme
   */
  public updateMovement(delta: number): void {
    if (this.isGrabbed || this.isDestroyed || !this.active) {
      return;
    }

    const dt = delta / 1000;
    this.x += this.velocityX * dt;

    if (this.x <= this.minX && this.velocityX < 0) {
      this.x = this.minX;
      this.velocityX = Math.abs(this.velocityX);
      this.setFlipX(false);
    } else if (this.x >= this.maxX && this.velocityX > 0) {
      this.x = this.maxX;
      this.velocityX = -Math.abs(this.velocityX);
      this.setFlipX(true);
    }

    // Gövde gölgesini de vagonla birlikte yürüt
    this.updateShadowPosition();
  }
}
