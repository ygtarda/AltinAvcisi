/**
 * Hook.ts
 * Oyuncunun vinç/kanca ve makara mekanizması.
 * - Vagonlar yerine madenciler mekanik makara sisteminin (mining_winch) başında durur.
 * - İki oyuncu ortada yan yana istasyonlarda yer alır.
 * - Kanca atıldığında ve çekildiğinde makara kolunu çevirme animasyonu çalışır.
 * - Ağır nesneler (büyük kaya, dev kaya, büyük altın, vagon) çekilirken yüzü kızaran,
 *   dişlerini sıkan ve ter fışkırtan gerçekçi ZORLANMA animasyonu devreye girer!
 */

import Phaser from 'phaser';
import { GameConfig } from '../config/GameConfig';
import { MiningEntity } from './Entity';
import { GameStateManager } from '../state/GameState';
import { AudioManager } from '../systems/AudioManager';

export enum HookState {
  IDLE = 'IDLE',
  EXTENDING = 'EXTENDING',
  RETRACTING_EMPTY = 'RETRACTING_EMPTY',
  RETRACTING_LOADED = 'RETRACTING_LOADED'
}

export class Hook {
  public scene: Phaser.Scene;
  public playerId: number;
  public pivotX: number;
  public pivotY: number;
  public phaseOffset: number;

  public state: HookState = HookState.IDLE;
  public angle: number = 0;
  public currentLength: number = 32;
  public minLength: number = 32;

  public tipX: number;
  public tipY: number;

  public grabbedEntity: MiningEntity | null = null;

  // Sarkaç modu için sürekli faz akümülatörü
  private swingTime: number = 0;
  private lastSwingDirection: number = 1;

  // Çekme sonrası sabit bekleme süresi (reset cooldown)
  private resetCooldownTimer: number = 0;

  // Görsel elemanlar
  private ropeGraphics: Phaser.GameObjects.Graphics;
  private clawSprite: Phaser.GameObjects.Sprite;
  private winchSprite: Phaser.GameObjects.Sprite; // Mekanik Makara Sistemi
  private minerSprite: Phaser.GameObjects.Sprite; // Karakter ve Yüz Hareketi
  private lightGraphics: Phaser.GameObjects.Graphics;

  private minerBaseX: number;
  private minerBaseY: number;
  private currentMinerMode: 'idle' | 'crank' | 'strain' | 'celebrate' = 'idle';

  private stateManager: GameStateManager;
  private audioManager: AudioManager;

  constructor(scene: Phaser.Scene, playerId: number) {
    this.scene = scene;
    this.playerId = playerId;
    this.stateManager = GameStateManager.getInstance();
    this.audioManager = AudioManager.getInstance();

    const pConfig = playerId === 1 ? GameConfig.players.p1 : GameConfig.players.p2;
    this.pivotX = pConfig.pivot.x;
    this.pivotY = pConfig.pivot.y;
    this.phaseOffset = pConfig.swingPhaseOffset;
    this.swingTime = this.phaseOffset;
    this.lastSwingDirection = Math.cos(this.swingTime) >= 0 ? 1 : -1;

    // Başlangıç açısı harmonik sarkaç pozisyonundan hesaplanır
    this.angle = GameConfig.hook.maxSwingAngle * Math.sin(this.swingTime);

    this.tipX = this.pivotX + Math.sin(this.angle) * this.currentLength;
    this.tipY = this.pivotY + Math.cos(this.angle) * this.currentLength;

    // Madenci Pozisyonu (Makaranın yanında, kolu kavrayacak açıda)
    // P1: Makaranın solunda durur ve sağa doğru bakar
    // P2: Makaranın sağında durur ve sola doğru bakar
    this.minerBaseX = playerId === 1 ? this.pivotX - 62 : this.pivotX + 62;
    this.minerBaseY = this.pivotY + 2;

    // 1. Fener Işık Efekti (Baret lambasından kancaya huzme)
    this.lightGraphics = scene.add.graphics();
    this.lightGraphics.setDepth(13);

    // 2. Kanca Halatı ve Pençesi
    this.ropeGraphics = scene.add.graphics();
    this.ropeGraphics.setDepth(18);

    this.clawSprite = scene.add.sprite(this.tipX, this.tipY, 'claw_open');
    this.clawSprite.setDisplaySize(38, 44);
    this.clawSprite.setOrigin(0.5, 0.08);
    this.clawSprite.setDepth(22);
    this.clawSprite.setRotation(-this.angle);

    // 3. Makaranın Başında Duran Madenci Karakteri (Yüz & Beden Hareketleri)
    const initialTexture = playerId === 1 ? 'miner_p1_idle' : 'miner_p2_idle';
    this.minerSprite = scene.add.sprite(this.minerBaseX, this.minerBaseY, initialTexture);
    this.minerSprite.setDisplaySize(68, 140);
    this.minerSprite.setOrigin(0.5, 0.94);
    this.minerSprite.setFlipX(playerId === 2);
    this.minerSprite.setDepth(15);

    // 4. Mekanik Çelik ve Ahşap Makara İstasyonu (Önlerinde duran winch ünitesi)
    this.winchSprite = scene.add.sprite(this.pivotX, this.pivotY - 4, 'mining_winch');
    this.winchSprite.setDisplaySize(88, 74);
    this.winchSprite.setOrigin(0.5, 0.82);
    this.winchSprite.setDepth(16);

    // Başlangıç idle soluk animasyonu
    this.setMinerState('idle');
  }

  /**
   * Madencinin animasyon ve mimik durumunu değiştirir:
   * 'idle': Bekleme, sakin odaklanma
   * 'crank': Kanca fırlatırken veya boş çekerken hızlı makara kolu çevirme
   * 'strain': Ağır maden çekerken yüz kızarması, diş sıkma, ter dökme ve vücut zorlanması!
   * 'celebrate': Başarılı maden tesliminde sevinç zıplaması
   */
  public setMinerState(mode: 'idle' | 'crank' | 'strain' | 'celebrate'): void {
    if (this.currentMinerMode === mode && mode !== 'celebrate') return;
    this.currentMinerMode = mode;

    this.scene.tweens.killTweensOf(this.minerSprite);
    this.scene.tweens.killTweensOf(this.winchSprite);

    this.minerSprite.setAngle(0);
    this.minerSprite.clearTint();
    this.minerSprite.setPosition(this.minerBaseX, this.minerBaseY);
    this.winchSprite.setPosition(this.pivotX, this.pivotY - 4);

    const isP1 = this.playerId === 1;

    switch (mode) {
      case 'idle':
        this.minerSprite.setTexture(isP1 ? 'miner_p1_idle' : 'miner_p2_idle');
        this.minerSprite.setDisplaySize(68, 140);

        this.scene.tweens.add({
          targets: this.minerSprite,
          y: this.minerBaseY - 2.5,
          duration: 1200,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut'
        });
        break;

      case 'crank':
        this.minerSprite.setTexture(isP1 ? 'miner_p1_crank' : 'miner_p2_crank');
        this.minerSprite.setDisplaySize(isP1 ? 78 : 74, 134);

        // Hızlı makara kolu çevirme ritmi (vücut inip kalkar)
        this.scene.tweens.add({
          targets: this.minerSprite,
          y: this.minerBaseY - 4,
          duration: 110,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut'
        });

        // Makara makinesinin hafif dişli titreşimi
        this.scene.tweens.add({
          targets: this.winchSprite,
          y: this.pivotY - 4 + 1.2,
          duration: 90,
          yoyo: true,
          repeat: -1
        });
        break;

      case 'strain':
        // KULLANICI İSTEĞİ: "çekerken zorlanıyormu gibi şeklinde çekerken de makarayı koluyla çeviriyormuş gibi animasyona girimesi gerekiyor"
        this.minerSprite.setTexture(isP1 ? 'miner_p1_strain' : 'miner_p2_strain');
        this.minerSprite.setDisplaySize(isP1 ? 98 : 88, 136);

        // Bütün vücut ağırlığıyla geriye yüklenip kolu asılma sarsıntısı
        this.scene.tweens.add({
          targets: this.minerSprite,
          x: this.minerBaseX + (isP1 ? -5 : 5),
          angle: isP1 ? -5 : 5,
          duration: 180,
          yoyo: true,
          repeat: -1,
          ease: 'Cubic.easeInOut'
        });

        // Makara gerilim sarsıntısı
        this.scene.tweens.add({
          targets: this.winchSprite,
          y: this.pivotY - 4 - 1.5,
          angle: isP1 ? 1 : -1,
          duration: 180,
          yoyo: true,
          repeat: -1
        });

        // Alından sıçrayan ter partikülleri
        this.emitSweatParticles();
        break;

      case 'celebrate':
        this.minerSprite.setTexture(isP1 ? 'miner_p1_idle' : 'miner_p2_idle');
        this.minerSprite.setDisplaySize(68, 140);

        this.scene.tweens.add({
          targets: this.minerSprite,
          y: this.minerBaseY - 14,
          duration: 180,
          yoyo: true,
          repeat: 1,
          ease: 'Back.easeOut',
          onComplete: () => {
            this.setMinerState('idle');
          }
        });
        break;
    }
  }

  private emitSweatParticles(): void {
    const isP1 = this.playerId === 1;
    const sweatX = this.minerBaseX + (isP1 ? -12 : 12);
    const sweatY = this.minerBaseY - 105;

    const sweat = this.scene.add.text(sweatX, sweatY, '💦', {
      fontSize: '18px'
    }).setOrigin(0.5).setDepth(28);

    this.scene.tweens.add({
      targets: sweat,
      y: sweatY - 24,
      x: sweatX + (isP1 ? -16 : 16),
      alpha: 0,
      scale: 1.3,
      duration: 550,
      ease: 'Cubic.easeOut',
      onComplete: () => sweat.destroy()
    });
  }

  /**
   * Kancayı fırlat (S veya Aşağı Ok tuşuyla)
   */
  public launch(): boolean {
    if (this.state !== HookState.IDLE || this.resetCooldownTimer > 0) {
      return false;
    }

    this.lastSwingDirection = Math.cos(this.swingTime) >= 0 ? 1 : -1;
    this.state = HookState.EXTENDING;
    this.clawSprite.setTexture('claw_open');
    this.setMinerState('crank');
    this.audioManager.playWhoosh();
    return true;
  }

  public throwDynamite(): boolean {
    if (this.state !== HookState.RETRACTING_LOADED || !this.grabbedEntity) {
      return false;
    }

    if (!this.stateManager.useDynamite()) {
      this.showEmptyDynamiteFeedback();
      return false;
    }

    const dynStick = this.scene.add.image(this.pivotX, this.pivotY, 'tnt');
    dynStick.setDisplaySize(24, 28);
    dynStick.setDepth(26);

    this.scene.tweens.add({
      targets: dynStick,
      x: this.tipX,
      y: this.tipY,
      duration: 160,
      ease: 'Cubic.easeIn',
      onComplete: () => {
        dynStick.destroy();

        this.triggerExplosionEffect(this.tipX, this.tipY);
        this.audioManager.playExplosion();

        if (this.grabbedEntity) {
          this.grabbedEntity.showCollectedFeedback('PATLATILDI! 💥', '#f97316');
          this.grabbedEntity.destroyEntity();
          this.grabbedEntity = null;
        }

        // Boş geri çekilmeye geç
        this.state = HookState.RETRACTING_EMPTY;
        this.clawSprite.setTexture('claw_open');
        this.setMinerState('crank');
      }
    });

    return true;
  }

  private showEmptyDynamiteFeedback(): void {
    const txt = this.scene.add.text(this.pivotX, this.pivotY + 25, 'DİNAMİT YOK! 🧨', {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '15px',
      fontStyle: 'bold',
      color: '#ef4444',
      stroke: '#000000',
      strokeThickness: 4
    }).setOrigin(0.5).setDepth(35);

    this.scene.tweens.add({
      targets: txt,
      y: txt.y - 30,
      alpha: 0,
      duration: 900,
      onComplete: () => txt.destroy()
    });
  }

  public getHitboxRadius(): number {
    const baseRadius = GameConfig.hook.hitboxRadius;
    return this.stateManager.upgrades.gold_magnet ? baseRadius * 2 : baseRadius;
  }

  public getMaxLength(): number {
    return GameConfig.hook.maxLength;
  }

  public getExtendSpeed(): number {
    const baseSpeed = GameConfig.hook.extendSpeed;
    return this.stateManager.upgrades.strong_hook ? baseSpeed * 1.2 : baseSpeed;
  }

  public getRetractSpeedEmpty(): number {
    const baseSpeed = GameConfig.hook.retractSpeedEmpty;
    return this.stateManager.upgrades.strong_hook ? baseSpeed * 1.2 : baseSpeed;
  }

  public getRetractSpeedLoaded(weight: number): number {
    const divider = this.stateManager.upgrades.strong_hook ? 650 : GameConfig.hook.retractSpeedLoadedDivider;
    const speed = divider / Math.max(0.1, weight);
    return Math.max(GameConfig.hook.minRetractSpeed, speed);
  }

  public update(time: number, delta: number): void {
    const dt = delta / 1000;

    switch (this.state) {
      case HookState.IDLE:
        this.updateIdle(dt);
        break;

      case HookState.EXTENDING:
        this.updateExtending(dt);
        break;

      case HookState.RETRACTING_EMPTY:
        this.updateRetractingEmpty(dt);
        break;

      case HookState.RETRACTING_LOADED:
        this.updateRetractingLoaded(dt);
        break;
    }

    this.tipX = this.pivotX + Math.sin(this.angle) * this.currentLength;
    this.tipY = this.pivotY + Math.cos(this.angle) * this.currentLength;

    if (this.grabbedEntity && !this.grabbedEntity.isDestroyed) {
      this.grabbedEntity.setGrabPosition(
        this.tipX + Math.sin(this.angle) * 18,
        this.tipY + Math.cos(this.angle) * 18
      );
    }

    this.render();
  }

  private updateIdle(dt: number): void {
    this.currentLength = this.minLength;
    this.clawSprite.setTexture('claw_open');

    // Kullanıcı İsteği: Çektikten sonra sabit bekleme süresi, ardından baştan tekrar başlasın
    if (this.resetCooldownTimer > 0) {
      this.resetCooldownTimer -= dt;
      if (this.resetCooldownTimer <= 0) {
        this.resetCooldownTimer = 0;
        this.swingTime = 0; // Baştan pürüzsüz tekrar salınmaya başlar
      }
      return;
    }

    // Sarkaç salınımı
    this.swingTime += dt * GameConfig.hook.swingSpeed;
    this.angle = GameConfig.hook.maxSwingAngle * Math.sin(this.swingTime);
  }

  private returnToIdle(cooldownSeconds: number = 0.8): void {
    this.state = HookState.IDLE;
    this.currentLength = this.minLength;
    this.resetCooldownTimer = cooldownSeconds;
    this.clawSprite.setTexture('claw_open');
    if (this.currentMinerMode !== 'celebrate') {
      this.setMinerState('idle');
    }

    // Sarkaç salınım evresini kesintisiz eşitle
    const ratio = Phaser.Math.Clamp(this.angle / GameConfig.hook.maxSwingAngle, -0.999, 0.999);
    if (this.lastSwingDirection >= 0) {
      this.swingTime = Math.asin(ratio);
    } else {
      this.swingTime = Math.PI - Math.asin(ratio);
    }
  }

  private updateExtending(dt: number): void {
    const speed = this.getExtendSpeed();
    this.currentLength += speed * dt;

    const maxLen = this.getMaxLength();
    if (this.currentLength >= maxLen) {
      this.currentLength = maxLen;
      this.state = HookState.RETRACTING_EMPTY;
      this.setMinerState('crank');
    }
  }

  private updateRetractingEmpty(dt: number): void {
    const speed = this.getRetractSpeedEmpty();
    this.currentLength -= speed * dt;

    if (this.currentLength <= this.minLength) {
      this.returnToIdle(0.7);
    }
  }

  private updateRetractingLoaded(dt: number): void {
    if (!this.grabbedEntity) {
      this.state = HookState.RETRACTING_EMPTY;
      this.setMinerState('crank');
      return;
    }

    const speed = this.getRetractSpeedLoaded(this.grabbedEntity.weight);
    this.currentLength -= speed * dt;

    if (this.currentLength <= this.minLength) {
      this.onEntityDelivered();
    }
  }

  public catchEntity(entity: MiningEntity): void {
    if (this.state !== HookState.EXTENDING) return;

    this.grabbedEntity = entity;
    entity.isGrabbed = true;
    entity.grabbedByHookId = this.playerId;

    this.state = HookState.RETRACTING_LOADED;
    this.clawSprite.setTexture('claw_closed');

    // Ağırlığa göre zorlanma veya normal çekme animasyonu
    if (entity.weight >= 2.0) {
      this.setMinerState('strain');
    } else {
      this.setMinerState('crank');
    }

    this.audioManager.playCatch();
  }

  /**
   * Kanca TNT'ye çarptığında tetiklenir:
   * Kullanıcı İsteği: "oyuncu tnt patlatırsa siyah kalıyo tnt patlatınca bişey olmasın"
   */
  public onHitTNT(): void {
    this.audioManager.playExplosion();
    this.minerSprite.clearTint();
    this.stateManager.addGold(this.playerId, -30, 'tnt');

    this.grabbedEntity = null;
    this.state = HookState.RETRACTING_EMPTY;
    this.clawSprite.setTexture('claw_open');
    this.setMinerState('crank');
  }

  private triggerMinerShockEffect(): void {
    this.minerSprite.clearTint();
    this.scene.tweens.add({
      targets: this.minerSprite,
      x: this.minerBaseX + (this.playerId === 1 ? -6 : 6),
      duration: 50,
      yoyo: true,
      repeat: 3,
      onComplete: () => {
        this.minerSprite.clearTint();
        this.minerSprite.setX(this.minerBaseX);
      }
    });
  }

  private onEntityDelivered(): void {
    if (!this.grabbedEntity) {
      this.returnToIdle(0.8);
      return;
    }

    const entity = this.grabbedEntity;
    this.grabbedEntity = null;

    if (entity.entityType === 'tnt' || entity.entityType === 'cart_tnt') {
      this.onHitTNT();
      entity.destroyEntity();
      this.returnToIdle(0.8);
    } else if (entity.entityType === 'mystery_box') {
      this.resolveMysteryBox(entity);
      this.returnToIdle(0.85);
    } else {
      let finalVal = entity.value;
      const isDiamond = entity.entityType === 'diamond' || entity.entityType === 'cart_diamond';
      if (isDiamond && this.stateManager.upgrades.diamond_polish) {
        finalVal *= 2;
      }

      this.audioManager.playChaChing();
      this.stateManager.addGold(this.playerId, finalVal, entity.entityType);

      const polishTag = (isDiamond && this.stateManager.upgrades.diamond_polish) ? ' (x2 CİLA!)' : '';
      entity.showCollectedFeedback(`+$${finalVal}${polishTag}`, isDiamond ? '#38bdf8' : '#fbbf24');
      entity.destroyEntity();

      // Başarılı teslim sevinç zıplaması ve sabit yenilenme süresi
      this.setMinerState('celebrate');
      this.returnToIdle(0.85);
    }
  }

  private resolveMysteryBox(entity: MiningEntity): void {
    this.audioManager.playMystery();

    const outcomes = [...GameConfig.mysteryBox.outcomes];
    if (this.stateManager.upgrades.lucky_clover) {
      const penaltyOutcome = outcomes.find(o => o.id === 'penalty');
      if (penaltyOutcome) {
        penaltyOutcome.weight = 0.5;
      }
    }

    const totalWeight = outcomes.reduce((acc, o) => acc + o.weight, 0);
    let rand = Math.random() * totalWeight;
    let chosen = outcomes[0];

    for (const outcome of outcomes) {
      if (rand < outcome.weight) {
        chosen = outcome;
        break;
      }
      rand -= outcome.weight;
    }

    if (chosen.id === 'jackpot' || chosen.id === 'small_bonus') {
      this.stateManager.addGold(this.playerId, chosen.gold, 'mystery_box');
      entity.showCollectedFeedback(`${chosen.name} (+$${chosen.gold})`, '#34d399');
      this.audioManager.playChaChing();
      this.setMinerState('celebrate');
    } else if (chosen.id === 'penalty') {
      this.stateManager.addGold(this.playerId, chosen.gold, 'mystery_box');
      entity.showCollectedFeedback(`${chosen.name} (-$${Math.abs(chosen.gold)})`, '#ef4444');
      this.triggerMinerShockEffect();
    } else if (chosen.id === 'time_bonus') {
      this.scene.events.emit('add_time_bonus', 10);
      entity.showCollectedFeedback('+10 Saniye Süre!', '#60a5fa');
      this.setMinerState('celebrate');
    } else {
      entity.showCollectedFeedback('Kutu Boş Çıktı!', '#9ca3af');
    }

    entity.destroyEntity();
  }

  public triggerExplosionEffect(x: number, y: number): void {
    this.scene.cameras.main.shake(380, 0.028);

    // AAA Karikatürize Patlama Şok Dalgası Sprite'ı
    const blast = this.scene.add.sprite(x, y, 'explosion_blast');
    blast.setDisplaySize(50, 50);
    blast.setDepth(38);
    blast.setAlpha(1);

    this.scene.tweens.add({
      targets: blast,
      displayWidth: 175,
      displayHeight: 175,
      alpha: 0,
      duration: 380,
      ease: 'Back.easeOut',
      onComplete: () => blast.destroy()
    });

    // Duman ve Parçacık Patlaması
    const particles = this.scene.add.particles(x, y, 'particle_smoke', {
      speed: { min: 90, max: 260 },
      angle: { min: 0, max: 360 },
      scale: { start: 1.4, end: 0 },
      alpha: { start: 1, end: 0 },
      lifespan: 700,
      quantity: 20
    });

    this.scene.time.delayedCall(800, () => {
      particles.destroy();
    });
  }

  private render(): void {
    // 1. Fener Işığı (Madencinin kask lambasından kancaya)
    const lampX = this.minerBaseX + (this.playerId === 1 ? 12 : -12);
    const lampY = this.minerBaseY - 110;

    this.lightGraphics.clear();
    this.lightGraphics.fillStyle(0xfef08a, 0.05);
    this.lightGraphics.beginPath();
    this.lightGraphics.moveTo(lampX, lampY);
    this.lightGraphics.lineTo(this.tipX - 25, this.tipY);
    this.lightGraphics.lineTo(this.tipX + 25, this.tipY);
    this.lightGraphics.closePath();
    this.lightGraphics.fillPath();

    // 2. Çelik Kanca Halatı (Makaradan kancaya iner)
    this.ropeGraphics.clear();

    let ropeThickness = 2.8;
    if (this.state === HookState.RETRACTING_LOADED && this.grabbedEntity) {
      ropeThickness = 3.0 + Math.min(2.5, this.grabbedEntity.weight * 0.4);
    }

    this.ropeGraphics.lineStyle(ropeThickness + 1.2, 0x18181b, 0.9);
    this.ropeGraphics.lineBetween(this.pivotX, this.pivotY, this.tipX, this.tipY);

    this.ropeGraphics.lineStyle(ropeThickness, 0x71717a, 1);
    this.ropeGraphics.lineBetween(this.pivotX, this.pivotY, this.tipX, this.tipY);

    // 3. Kanca Pençesi
    this.clawSprite.setPosition(this.tipX, this.tipY);
    this.clawSprite.setRotation(-this.angle);
  }

  public destroy(): void {
    this.ropeGraphics.destroy();
    this.clawSprite.destroy();
    this.winchSprite.destroy();
    this.minerSprite.destroy();
    this.lightGraphics.destroy();
  }
}
