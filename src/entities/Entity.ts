/**
 * Entity.ts
 * Sahnedeki madenler, taşlar, elmaslar, kutular ve patlayıcılar.
 * Yüksek çözünürlüklü grafikler ve akıcı parıltı efektleri içerir.
 */

import Phaser from 'phaser';
import { EntityTypeConfig } from '../config/GameConfig';

export class MiningEntity extends Phaser.GameObjects.Sprite {
  public entityType: string;
  public entityName: string;
  public value: number;
  public weight: number;
  public isGrabbed: boolean = false;
  public grabbedByHookId: number | null = null;
  public isDestroyed: boolean = false;

  private sparkleTween?: Phaser.Tweens.Tween;
  protected shadow?: Phaser.GameObjects.Ellipse;

  constructor(scene: Phaser.Scene, x: number, y: number, config: EntityTypeConfig) {
    super(scene, x, y, config.textureKey);

    this.entityType = config.type;
    this.entityName = config.name;
    this.value = config.value;
    this.weight = config.weight;

    this.setDisplaySize(config.width, config.height);
    this.setOrigin(0.5, 0.5);
    this.setDepth(10);

    // Toprak katmanlarında itemlerin net seçilmesi ve derinlik için doğal zemin gölgesi
    this.shadow = scene.add.ellipse(x, y + config.height * 0.32, config.width * 0.82, config.height * 0.3, 0x000000, 0.32);
    this.shadow.setDepth(9);

    scene.add.existing(this);

    // Elmas ve büyük altınlar için nabız ve ışıltı animasyonu
    if (this.entityType === 'diamond' || this.entityType === 'big_gold' || this.entityType === 'cart_diamond') {
      this.initSparkle();
    }
  }

  public updateShadowPosition(): void {
    if (this.shadow && !this.isGrabbed && !this.isDestroyed) {
      this.shadow.setPosition(this.x, this.y + this.displayHeight * 0.32);
    }
  }

  private initSparkle(): void {
    this.sparkleTween = this.scene.tweens.add({
      targets: this,
      scaleX: this.scaleX * 1.1,
      scaleY: this.scaleY * 1.1,
      duration: 800 + Math.random() * 400,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  }

  /**
   * Dairesel kanca ucu ile AABB çarpışma kontrolü
   * tipX, tipY: kanca ucu merkezi
   * radius: kanca ucu yarıçapı
   */
  public checkCircleCollision(tipX: number, tipY: number, radius: number): boolean {
    if (this.isGrabbed || this.isDestroyed || !this.active) return false;

    const halfW = (this.displayWidth / 2);
    const halfH = (this.displayHeight / 2);

    // En yakın noktayı bul
    const closestX = Phaser.Math.Clamp(tipX, this.x - halfW, this.x + halfW);
    const closestY = Phaser.Math.Clamp(tipY, this.y - halfH, this.y + halfH);

    const distX = tipX - closestX;
    const distY = tipY - closestY;
    const distanceSquared = (distX * distX) + (distY * distY);

    return distanceSquared <= (radius * radius);
  }

  /**
   * Kancaya kilitlenip çekilirken pozisyon güncellemesi
   */
  public setGrabPosition(x: number, y: number): void {
    this.setPosition(x, y);
    if (this.shadow) {
      this.shadow.setVisible(false);
    }
  }

  /**
   * Toplandığında havada uçuşan kazanç metni (+40, +120 vb.)
   */
  public showCollectedFeedback(text: string, color: string = '#fbbf24'): void {
    const feedback = this.scene.add.text(this.x, this.y - 10, text, {
      fontFamily: 'system-ui, -apple-system, sans-serif',
      fontSize: '22px',
      fontStyle: 'bold',
      color: color,
      stroke: '#000000',
      strokeThickness: 5
    }).setOrigin(0.5).setDepth(30);

    this.scene.tweens.add({
      targets: feedback,
      y: feedback.y - 45,
      alpha: 0,
      duration: 1000,
      ease: 'Cubic.easeOut',
      onComplete: () => {
        feedback.destroy();
      }
    });
  }

  public destroyEntity(): void {
    this.isDestroyed = true;
    if (this.sparkleTween) {
      this.sparkleTween.stop();
    }
    if (this.shadow) {
      this.shadow.destroy();
    }
    this.destroy();
  }
}
