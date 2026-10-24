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
  private waddleTween?: Phaser.Tweens.Tween;

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

    // Penguen yürüyüş kare animasyonunu başlat
    const animKey = config.type === 'cart_tnt' ? 'penguin_dynamite_walk' : 'penguin_diamond_walk';
    if (scene.anims.exists(animKey)) {
      this.play(animKey);
      this.setDisplaySize(config.width, config.height);
    }

    // Penguen paytak adımlama ve tatlı yürüme sekme animasyonu
    this.waddleTween = scene.tweens.add({
      targets: this,
      y: y + 2,
      angle: { from: -2, to: 2 },
      duration: 130,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  }

  /**
   * Kancaya yakalandığında yürüme sallantısını ve animasyonunu durdur
   */
  public override setGrabPosition(x: number, y: number): void {
    if (this.waddleTween && this.waddleTween.isPlaying()) {
      this.waddleTween.stop();
      this.setAngle(0);
    }
    if (this.anims && this.anims.isPlaying) {
      this.anims.stop();
    }
    super.setGrabPosition(x, y);
  }

  public override destroyEntity(): void {
    if (this.waddleTween) {
      this.waddleTween.stop();
    }
    if (this.anims && this.anims.isPlaying) {
      this.anims.stop();
    }
    super.destroyEntity();
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

    // Gövde gölgesini de karakterle birlikte yürüt
    this.updateShadowPosition();
  }
}
