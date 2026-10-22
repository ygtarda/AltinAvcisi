/**
 * GameScene.ts
 * Ana Oyun Sahnesi:
 * - Düz katmanlı, net kontrastlı yeraltı toprak arka planı (öğeler kristal netliğinde görünür)
 * - y=135 seviyesine indirilmiş ferah madenci vagonları (üst bara sıkışma yok)
 * - Sabit duran kancalar ve WASD / Ok Tuşları ile manuel nişan alma
 * - TNT Zincirleme Patlama Mekaniği (Chain Reaction)
 * - W ve ↑ tuşlarıyla dinamit patlatarak zaman kurtarma
 */

import Phaser from 'phaser';
import { GameConfig } from '../config/GameConfig';
import { GameStateManager } from '../state/GameState';
import { AudioManager } from '../systems/AudioManager';
import { Hook, HookState } from '../entities/Hook';
import { MiningEntity } from '../entities/Entity';
import { MovingCart } from '../entities/MovingCart';
import { LevelGenerator } from '../systems/LevelGenerator';
import { InputHandler } from '../systems/InputHandler';

export class GameScene extends Phaser.Scene {
  private stateManager!: GameStateManager;
  private audioManager!: AudioManager;

  private hookP1!: Hook;
  private hookP2!: Hook;
  private inputHandler!: InputHandler;

  private entities: MiningEntity[] = [];

  // Süre ve Seviye Değişkenleri
  private levelDuration: number = 45;
  private timeRemaining: number = 45;
  private isLevelEnded: boolean = false;

  // HUD Elemanları
  private textCenterBanner!: Phaser.GameObjects.Text;
  private textTotalGold!: Phaser.GameObjects.Text;
  private textTargetGold!: Phaser.GameObjects.Text;
  private textTimeRemaining!: Phaser.GameObjects.Text;
  private textP1Money!: Phaser.GameObjects.Text;
  private textP2Money!: Phaser.GameObjects.Text;
  private progressBarGraphics!: Phaser.GameObjects.Graphics;

  private dynamiteSprites: Phaser.GameObjects.Sprite[] = [];
  private lastRenderedDynamiteCount: number = -1;
  private timerFlashTween?: Phaser.Tweens.Tween;

  constructor() {
    super('GameScene');
  }

  create(): void {
    this.stateManager = GameStateManager.getInstance();
    this.audioManager = AudioManager.getInstance();
    this.isLevelEnded = false;

    this.levelDuration = this.stateManager.getDurationSecondsForCurrentLevel();
    this.timeRemaining = this.levelDuration;

    // 1. Düz Katmanlı Toprak Arka Planı (4-5 Farklı Harita Seçeneği)
    this.createStratifiedDirtBackground();

    // 2. HUD (Sade, Ferah Arayüz)
    this.createHUD();

    // 3. Kancalar (Pivot y=195'te rayların üzerinde)
    this.hookP1 = new Hook(this, 1);
    this.hookP2 = new Hook(this, 2);

    // 4. Tuş Kontrolleri (Manuel nişan alma ve dinamit)
    this.inputHandler = new InputHandler(this, this.hookP1, this.hookP2);

    // 5. Seviye Nesneleri (Farklı boyutlarda taşlar, TNT'ler ve Hareketli Vagonlar)
    this.entities = LevelGenerator.generateLevel(this, this.stateManager.levelIndex);

    // 6. Olay Dinleyicileri
    this.events.on('add_time_bonus', (seconds: number) => {
      this.timeRemaining += seconds;
      this.showTimeBonusFloatingText(seconds);
    });

    this.createTopControls();
  }

  /**
   * Kullanıcı İsteği:
   * "Birkaç farklı harita tasarlayalım rastgele değişsin arka plan olarak
   * bu katmanlı toprak dağlar ovalardan 4 5 farklı seçenek oluşturalım."
   */
  private createStratifiedDirtBackground(): void {
    const mapThemes = [
      'stratified_dirt_bg', // Seviye 1: Klasik Sıcak Dağ Katmanları
      'bg_valley',           // Seviye 2: Yeşil Çam Vadisi & Orman Katmanları
      'bg_canyon',           // Seviye 3: Kızıl Kanyon & Terrakotta Toprak
      'bg_snow',             // Seviye 4: Karlı Zirveler & Permafrost Mavi Katmanlar
      'bg_volcano'           // Seviye 5: Volkanik Dağ & Lav Katmanları
    ];

    const mapIndex = (this.stateManager.levelIndex - 1) % mapThemes.length;
    const bgKey = mapThemes[mapIndex];

    const bg = this.add.image(640, 360, bgKey);
    bg.setDisplaySize(1280, 720);
    bg.setDepth(0);
  }

  private createHUD(): void {
    // Üst Bilgi Şeridi (İnce ve Şık 44px Bar)
    const hudBar = this.add.graphics();
    hudBar.setDepth(40);
    hudBar.fillStyle(0x09090b, 0.94);
    hudBar.fillRect(0, 0, 1280, 44);
    hudBar.lineStyle(1, 0x27272a, 1);
    hudBar.lineBetween(0, 44, 1280, 44);

    // 1. SOL: Toplam Ortak Kasa ve Hedef Tutarı
    this.textTotalGold = this.add.text(25, 10, 'ORTAK KASA: $0', {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '16px',
      fontStyle: 'bold',
      color: '#facc15'
    }).setDepth(41);

    const targetVal = this.stateManager.getTargetGoldForCurrentLevel();
    this.textTargetGold = this.add.text(190, 11, `/ Hedef: $${targetVal}`, {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '14px',
      color: '#94a3b8'
    }).setDepth(41);

    this.progressBarGraphics = this.add.graphics().setDepth(41);
    this.updateProgressBar();

    // 2. ORTA: Bölüm Numarası (Sade ve Net)
    this.textCenterBanner = this.add.text(640, 22, `BÖLÜM ${this.stateManager.levelIndex}`, {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '18px',
      fontStyle: 'bold',
      color: '#fbbf24',
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0.5).setDepth(42);

    // 3. SAĞ: Kalan Süre (Sade ve Net)
    this.textTimeRemaining = this.add.text(1180, 22, `⏱ ${Math.ceil(this.timeRemaining)}s`, {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '17px',
      fontStyle: 'bold',
      color: '#f8fafc',
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0.5).setDepth(42);

    // 4. KULLANICI İSTEĞİ: "oyuncuların altında yer alan kısmı düzenle sadece o oyuncunun topladığı para yazsın
    // lider kariyer p1 falan hiç birşey yazmasın kutu da olmasına grerek yok"
    // P1 Makarasının Altındaki Sadece Para Tutarı (x: 470, y: 204)
    this.textP1Money = this.add.text(470, 204, '$0', {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '20px',
      fontStyle: 'bold',
      color: '#60a5fa',
      stroke: '#09090b',
      strokeThickness: 4
    }).setOrigin(0.5).setDepth(26);

    // P2 Makarasının Altındaki Sadece Para Tutarı (x: 810, y: 204)
    this.textP2Money = this.add.text(810, 204, '$0', {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '20px',
      fontStyle: 'bold',
      color: '#f87171',
      stroke: '#09090b',
      strokeThickness: 4
    }).setOrigin(0.5).setDepth(26);

    // 5. KULLANICI İSTEĞİ: "dinamit orda kaldırılsın oyuncu hizzasında kenarda duruyormuş gibi ikonlar halinde istiflensin
    // kaç adetse görsel olarak istiflensin sayı yazmasına grek yok kullanılınca bir bir azalsın görünümünden"
    this.updateDynamiteStack();
  }

  private updateDynamiteStack(): void {
    const currentCount = this.stateManager.dynamiteCount;
    if (this.lastRenderedDynamiteCount === currentCount) return;

    for (const sp of this.dynamiteSprites) {
      sp.destroy();
    }
    this.dynamiteSprites = [];
    this.lastRenderedDynamiteCount = currentCount;

    // Platform hizasında kenarda istiflenen dinamit lokumları
    // Sayı yazmaz, kaç adetse görsel olarak yan yana durur, harcandıkça bir bir azalır
    const startX = 42;
    const baseY = 188;
    for (let i = 0; i < currentCount; i++) {
      const stick = this.add.sprite(startX + i * 16, baseY, 'tnt');
      stick.setDisplaySize(20, 26);
      stick.setOrigin(0.5, 0.9);
      stick.setDepth(25);
      this.dynamiteSprites.push(stick);
    }
  }

  private updateProgressBar(): void {
    this.progressBarGraphics.clear();
    const barX = 25;
    const barY = 32;
    const barW = 240;
    const barH = 4;

    this.progressBarGraphics.fillStyle(0x18181b, 1);
    this.progressBarGraphics.fillRoundedRect(barX, barY, barW, barH, 2);

    const total = this.stateManager.getTotalGold();
    const target = this.stateManager.getTargetGoldForCurrentLevel();
    const ratio = Phaser.Math.Clamp(total / Math.max(1, target), 0, 1);

    const fillColor = ratio >= 1 ? 0x22c55e : 0xf59e0b;
    this.progressBarGraphics.fillStyle(fillColor, 1);
    this.progressBarGraphics.fillRoundedRect(barX, barY, barW * ratio, barH, 2);
  }

  private createTopControls(): void {
    // Ses Butonu (Sağ Üst Köşede)
    const audioBtn = this.add.text(1240, 12, this.audioManager.getIsMuted() ? '🔇' : '🔊', {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '18px',
      color: '#e2e8f0'
    }).setDepth(42).setInteractive({ useHandCursor: true });

    audioBtn.on('pointerdown', () => {
      const isMuted = this.audioManager.toggleMute();
      audioBtn.setText(isMuted ? '🔇' : '🔊');
    });
  }

  private showTimeBonusFloatingText(seconds: number): void {
    const txt = this.add.text(640, 80, `+${seconds}s EK SÜRE!`, {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '26px',
      fontStyle: 'bold',
      color: '#38bdf8',
      stroke: '#0f172a',
      strokeThickness: 5
    }).setOrigin(0.5).setDepth(45);

    this.tweens.add({
      targets: txt,
      y: 35,
      alpha: 0,
      duration: 1200,
      ease: 'Cubic.easeOut',
      onComplete: () => txt.destroy()
    });
  }

  override update(time: number, delta: number): void {
    if (this.isLevelEnded) return;

    // 1. Süre Yönetimi
    const dt = delta / 1000;
    this.timeRemaining -= dt;

    if (this.timeRemaining <= 10 && !this.timerFlashTween) {
      this.timerFlashTween = this.tweens.add({
        targets: this.textTimeRemaining,
        scaleX: 1.2,
        scaleY: 1.2,
        duration: 350,
        yoyo: true,
        repeat: -1
      });
    }

    // Kullanıcı İsteği: "bölüm geçmek için gereken dolara ulaşınca otomatik bitmesin,
    // kullanıcı süre bitene kadar oradaki şeyleri toplayabilsin"
    // Bu yüzden bölüm SADECE süre sıfırlandığında biter!
    if (this.timeRemaining <= 0) {
      this.timeRemaining = 0;
      this.onTimeExpired();
      return;
    }

    // 2. Tuş Kontrollerini Güncelle
    this.inputHandler.update();

    // 3. Kanca Fiziği Güncellemeleri
    this.hookP1.update(time, delta);
    this.hookP2.update(time, delta);

    // 4. Hareketli Vagonların Güncellenmesi
    for (const entity of this.entities) {
      if (entity instanceof MovingCart) {
        entity.updateMovement(delta);
      }
    }

    // 5. Çarpışma / Yakalama Kontrolü
    this.handleCollisions();

    // 6. HUD Değerlerini Güncelle
    this.refreshHUD();
  }

  /**
   * Çarpışma Kontrolü & TNT / TNT Vagonu Zincirleme Patlama Tespiti
   */
  private handleCollisions(): void {
    const ungrabbedEntities = this.entities.filter(e => !e.isGrabbed && !e.isDestroyed && e.active);

    // Sol Oyuncu (P1) Kancası
    if (this.hookP1.state === HookState.EXTENDING) {
      const radiusP1 = this.hookP1.getHitboxRadius();
      for (const entity of ungrabbedEntities) {
        if (entity.checkCircleCollision(this.hookP1.tipX, this.hookP1.tipY, radiusP1)) {
          if (entity.entityType === 'tnt' || entity.entityType === 'cart_tnt') {
            this.triggerTNTChainReaction(entity, this.hookP1);
          } else {
            this.hookP1.catchEntity(entity);
          }
          break;
        }
      }
    }

    // Sağ Oyuncu (P2) Kancası
    if (this.hookP2.state === HookState.EXTENDING) {
      const radiusP2 = this.hookP2.getHitboxRadius();
      const remainingEntities = this.entities.filter(e => !e.isGrabbed && !e.isDestroyed && e.active);

      for (const entity of remainingEntities) {
        if (entity.checkCircleCollision(this.hookP2.tipX, this.hookP2.tipY, radiusP2)) {
          if (entity.entityType === 'tnt' || entity.entityType === 'cart_tnt') {
            this.triggerTNTChainReaction(entity, this.hookP2);
          } else {
            this.hookP2.catchEntity(entity);
          }
          break;
        }
      }
    }
  }

  /**
   * Kullanıcı İsteği:
   * "kanca tnt ye çarparsa etrafındakileri patlatsın itemleri,
   * eğer etrafında başka tnt varsa o da patlasın o da etrafındaki itemleri patlatsın
   * yani zincirleme gidebilsin."
   */
  public triggerTNTChainReaction(initialTNT: MiningEntity, triggerHook?: Hook): void {
    const blastRadius = GameConfig.hook.tntBlastRadius;

    if (triggerHook) {
      triggerHook.onHitTNT();
    }

    const explodeTNT = (tnt: MiningEntity) => {
      if (tnt.isDestroyed) return;

      const tntX = tnt.x;
      const tntY = tnt.y;

      // Patlama efekti ve sarsıntı
      this.cameras.main.shake(340, 0.025);
      this.audioManager.playExplosion();

      // 1. AAA Karikatürize Patlama Şok Dalgası Sprite'ı (explosion_blast)
      const blast = this.add.sprite(tntX, tntY, 'explosion_blast');
      blast.setDisplaySize(50, 50);
      blast.setDepth(38);
      blast.setAlpha(1);

      this.tweens.add({
        targets: blast,
        displayWidth: 180,
        displayHeight: 180,
        alpha: 0,
        duration: 380,
        ease: 'Back.easeOut',
        onComplete: () => blast.destroy()
      });

      // 2. Parçacık Dumanı
      const particles = this.add.particles(tntX, tntY, 'particle_smoke', {
        speed: { min: 80, max: 250 },
        angle: { min: 0, max: 360 },
        scale: { start: 1.5, end: 0 },
        alpha: { start: 1, end: 0 },
        lifespan: 650,
        quantity: 22
      });

      this.time.delayedCall(700, () => particles.destroy());

      tnt.showCollectedFeedback('PATLAMA! 💥', '#ef4444');
      tnt.destroyEntity();

      // Etki alanındaki diğer tüm nesneleri tara
      const nearbyEntities = this.entities.filter(e => !e.isDestroyed && e.active);

      nearbyEntities.forEach(nearby => {
        const dist = Phaser.Math.Distance.Between(tntX, tntY, nearby.x, nearby.y);
        if (dist <= blastRadius) {
          if (nearby.entityType === 'tnt' || nearby.entityType === 'cart_tnt') {
            // Başka bir TNT varsa kısa bir gecikmeyle o da patlar (zincirleme etki)
            this.time.delayedCall(130, () => {
              explodeTNT(nearby);
            });
          } else {
            // Diğer tüm madenler ve taşlar havaya uçar
            nearby.showCollectedFeedback('YOK OLDU! 💨', '#9ca3af');
            nearby.destroyEntity();
          }
        }
      });
    };

    explodeTNT(initialTNT);
  }

  private refreshHUD(): void {
    const totalGold = this.stateManager.getTotalGold();
    const targetGold = this.stateManager.getTargetGoldForCurrentLevel();
    const isTargetMet = totalGold >= targetGold;

    // 1. SOL: Toplam Ortak Kasa ve Hedef Durumu
    this.textTotalGold.setText(`ORTAK KASA: $${totalGold}`);
    this.textTargetGold.setText(isTargetMet ? `/ Hedef: $${targetGold} ✓ AŞILDI!` : `/ Hedef: $${targetGold}`);
    if (isTargetMet) {
      this.textTargetGold.setColor('#22c55e');
    } else {
      this.textTargetGold.setColor('#94a3b8');
    }

    // 2. ORTA: Bölüm No (Hedef aşılınca temiz onay ibaresi)
    const bannerMsg = isTargetMet ? `BÖLÜM ${this.stateManager.levelIndex} • HEDEF TAMAM! ✓` : `BÖLÜM ${this.stateManager.levelIndex}`;
    this.textCenterBanner.setText(bannerMsg);

    // 3. SAĞ: Kalan Süre (10 saniye altında kırmızı renge döner)
    const ceilSec = Math.max(0, Math.ceil(this.timeRemaining));
    this.textTimeRemaining.setText(`⏱ ${ceilSec}s`);
    if (this.timeRemaining <= 10) {
      this.textTimeRemaining.setColor('#ef4444');
    } else {
      this.textTimeRemaining.setColor('#f8fafc');
    }

    // 4. KULLANICI İSTEĞİ: "oyuncuların altında yer alan kısmı düzenle sadece o oyuncunun topladığı para yazsın
    // lider kariyer p1 falan hiç birşey yazmasın kutu da olmasına grerek yok"
    this.textP1Money.setText(`$${this.stateManager.playerGold[1]}`);
    this.textP2Money.setText(`$${this.stateManager.playerGold[2]}`);

    // 5. İlerleme Barı ve Platform Üstü Görsel Dinamit İstifi
    this.updateProgressBar();
    this.updateDynamiteStack();
  }

  private onTimeExpired(): void {
    if (this.isLevelEnded) return;

    const totalGold = this.stateManager.getTotalGold();
    const targetGold = this.stateManager.getTargetGoldForCurrentLevel();

    if (totalGold >= targetGold) {
      this.completeLevel();
    } else {
      this.failLevel();
    }
  }

  private completeLevel(): void {
    this.isLevelEnded = true;
    if (this.timerFlashTween) {
      this.timerFlashTween.stop();
    }
    this.audioManager.playVictory();

    this.time.delayedCall(800, () => {
      this.cleanup();
      this.scene.start('LevelCompleteScene');
    });
  }

  private failLevel(): void {
    this.isLevelEnded = true;
    if (this.timerFlashTween) {
      this.timerFlashTween.stop();
    }
    this.audioManager.playFail();

    this.time.delayedCall(800, () => {
      this.cleanup();
      this.scene.start('LevelFailedScene');
    });
  }

  private cleanup(): void {
    this.hookP1.destroy();
    this.hookP2.destroy();
    this.entities.forEach(e => {
      if (!e.isDestroyed) e.destroyEntity();
    });
    this.entities = [];
    for (const sp of this.dynamiteSprites) {
      sp.destroy();
    }
    this.dynamiteSprites = [];
  }
}
