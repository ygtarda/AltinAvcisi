/**
 * MenuScene.ts
 * Ana Giriş Menüsü: AAA görseller, net 2 oyunculu kontroller ve başlama butonu
 */

import Phaser from 'phaser';
import { GameStateManager } from '../state/GameState';
import { AudioManager } from '../systems/AudioManager';
import { ArcadeButton } from '../utils/ArcadeButton';

export class MenuScene extends Phaser.Scene {
  private audioManager!: AudioManager;
  private stateManager!: GameStateManager;

  private textP1Key!: Phaser.GameObjects.Text;
  private textP2Key!: Phaser.GameObjects.Text;

  constructor() {
    super('MenuScene');
  }

  create(): void {
    this.audioManager = AudioManager.getInstance();
    this.stateManager = GameStateManager.getInstance();

    // 1. Arka Plan
    this.createBackground();

    // 2. Başlık ve Logo
    this.createTitle();

    // 3. Oyuncu Kontrol Kartları (Sol: P1 Mavi, Sağ: P2 Kırmızı)
    this.createPlayerCards();

    // 4. Kural Özeti
    this.createRulesBox();

    // 5. Başla Butonu (Enter & Mouse)
    this.createStartButton();

    // 6. Ses & Tuş Değiştirme Kontrolleri
    this.createTopControls();
  }

  private createBackground(): void {
    // Görkemli yeraltı maden mağarası
    const bg = this.add.image(640, 360, 'mine_cave_bg');
    bg.setDisplaySize(1280, 720);
    bg.setAlpha(0.65);

    // Koyu degrade kaplama
    const overlay = this.add.graphics();
    overlay.fillGradientStyle(0x09090b, 0x09090b, 0x181008, 0x09090b, 0.82);
    overlay.fillRect(0, 0, 1280, 720);

    // Parıltı parçacıkları
    this.add.particles(640, 360, 'particle_gold', {
      x: { min: 80, max: 1200 },
      y: { min: 60, max: 680 },
      speedY: { min: -15, max: -35 },
      scale: { start: 0.8, end: 0.1 },
      alpha: { start: 0.6, end: 0 },
      lifespan: 2200,
      frequency: 180
    });
  }

  private createTitle(): void {
    const title = this.add.text(640, 78, 'ALTIN AVCISI', {
      fontFamily: 'system-ui, -apple-system, sans-serif',
      fontSize: '56px',
      fontStyle: '900',
      color: '#f59e0b',
      stroke: '#451a03',
      strokeThickness: 8
    }).setOrigin(0.5);

    this.tweens.add({
      targets: title,
      scaleX: 1.04,
      scaleY: 1.04,
      duration: 1200,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    this.add.text(640, 124, '2 OYUNCULU YEREL KOOPERATİF MADEN MACERASI', {
      fontFamily: 'system-ui, -apple-system, sans-serif',
      fontSize: '15px',
      fontStyle: 'bold',
      color: '#fef08a'
    }).setOrigin(0.5);
  }

  private createPlayerCards(): void {
    const swapped = this.stateManager.isControlsSwapped;

    // Oyuncu 1 Kartı (Sol Madenci - Mavi)
    const cardP1 = this.add.graphics();
    cardP1.fillStyle(0x1e3a8a, 0.9);
    cardP1.fillRoundedRect(170, 168, 435, 185, 14);
    cardP1.lineStyle(2, 0x3b82f6, 1);
    cardP1.strokeRoundedRect(170, 168, 435, 185, 14);

    this.add.image(235, 260, 'miner_p1_idle').setDisplaySize(72, 142);

    this.add.text(300, 185, 'OYUNCU 1 (Sol Makara)', {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '19px',
      fontStyle: 'bold',
      color: '#60a5fa'
    });

    this.textP1Key = this.add.text(300, 215, 'Kanca: [ S ] • Dinamit: [ W ]', {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '13px',
      fontStyle: 'bold',
      color: '#ffffff',
      backgroundColor: '#1d4ed8',
      padding: { x: 8, y: 4 }
    });

    this.add.text(300, 255, 'Makara kolunu çevirerek kancayı fırlatın!\nAğır madenlerde madenciniz ter döküp zorlanır,\nya da W ile patlatıp zaman kazanın.', {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '12.5px',
      color: '#bfdbfe',
      lineSpacing: 2
    });

    // Oyuncu 2 Kartı (Sağ Madenci - Kırmızı)
    const cardP2 = this.add.graphics();
    cardP2.fillStyle(0x7f1d1d, 0.9);
    cardP2.fillRoundedRect(675, 168, 435, 185, 14);
    cardP2.lineStyle(2, 0xef4444, 1);
    cardP2.strokeRoundedRect(675, 168, 435, 185, 14);

    this.add.image(740, 260, 'miner_p2_idle').setDisplaySize(72, 142);

    this.add.text(805, 185, 'OYUNCU 2 (Sağ Makara)', {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '19px',
      fontStyle: 'bold',
      color: '#f87171'
    });

    this.textP2Key = this.add.text(805, 215, 'Kanca: [ ↓ ] • Dinamit: [ ↑ ]', {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '13px',
      fontStyle: 'bold',
      color: '#ffffff',
      backgroundColor: '#b91c1c',
      padding: { x: 8, y: 4 }
    });

    this.add.text(805, 255, 'Makara kolunu çevirerek kancayı fırlatın!\nAğır madenlerde madenciniz ter döküp zorlanır,\nya da ↑ ile patlatıp zaman kazanın.', {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '12.5px',
      color: '#fecaca',
      lineSpacing: 2
    });
  }

  private createRulesBox(): void {
    const box = this.add.graphics();
    box.fillStyle(0x18181b, 0.92);
    box.fillRoundedRect(200, 380, 880, 175, 12);
    box.lineStyle(1, 0x3f3f46, 1);
    box.strokeRoundedRect(200, 380, 880, 175, 12);

    this.add.text(640, 400, '✦ OYUN KURALLARI & STRATEJİ ✦', {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '16px',
      fontStyle: 'bold',
      color: '#fbbf24'
    }).setOrigin(0.5);

    const rules = [
      '• Ortak Kasa ($): İki oyuncunun kazancı ortak kasada birikir. Süre bitmeden hedef dolar barajını aşmalısınız.',
      '• Öncelik Kuralı: Aynı madene iki kanca giderse İLK TEMAS EDEN kapar (hızlı olan kazanır).',
      '• Dinamit Stratejisi: Yanlışlıkla ağır kaya tuttuğunuzda P1 için W, P2 için ↑ tuşuna basarak taşı havaya uçurun!',
      '• Stratejik Dükkan: Dükkanda harcanan her Dolar ($) kasadan düşer ve sonraki bölümün geçiş barajını zorlaştırır!'
    ];

    rules.forEach((text, i) => {
      this.add.text(230, 430 + i * 27, text, {
        fontFamily: 'system-ui, sans-serif',
        fontSize: '14px',
        color: '#e4e4e7'
      });
    });
  }

  private createStartButton(): void {
    const startGame = () => {
      this.audioManager.playClick();
      this.stateManager.resetGame();
      this.stateManager.startLevel(1);
      this.scene.start('GameScene');
    };

    new ArcadeButton(
      this,
      640,
      620,
      'OYUNA BAŞLA →',
      startGame,
      {
        theme: 'gold',
        width: 380,
        height: 60,
        fontSize: '22px',
        subText: 'ENTER VEYA SPACE İLE BAŞLA'
      }
    );

    if (this.input.keyboard) {
      const enterKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
      enterKey.once('down', startGame);

      const spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
      spaceKey.once('down', startGame);
    }
  }

  private createTopControls(): void {
    // 1. Tuş Değiştirme Butonu
    const swapBtn = this.add.text(1110, 25, '⇄ Tuşları Değiştir', {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '13px',
      color: '#cbd5e1',
      backgroundColor: '#27272a',
      padding: { x: 8, y: 5 }
    }).setOrigin(1, 0).setInteractive({ useHandCursor: true });

    swapBtn.on('pointerdown', () => {
      this.stateManager.toggleControlsSwap();
      const swapped = this.stateManager.isControlsSwapped;
      this.textP1Key.setText(`Kanca Fırlat: [ ${swapped ? 'AŞAĞI OK ↓' : 'S TUŞU'} ]`);
      this.textP2Key.setText(`Kanca Fırlat: [ ${swapped ? 'S TUŞU' : 'AŞAĞI OK ↓'} ]`);
      this.audioManager.playClick();
    });

    // 2. Ses Butonu
    const audioBtn = this.add.text(1230, 25, this.audioManager.getIsMuted() ? '🔇 Ses: Kapalı' : '🔊 Ses: Açık', {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '13px',
      color: '#d4d4d8',
      backgroundColor: '#27272a',
      padding: { x: 8, y: 5 }
    }).setOrigin(1, 0).setInteractive({ useHandCursor: true });

    audioBtn.on('pointerdown', () => {
      const isMuted = this.audioManager.toggleMute();
      audioBtn.setText(isMuted ? '🔇 Ses: Kapalı' : '🔊 Ses: Açık');
    });
  }
}
