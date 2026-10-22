/**
 * LevelCompleteScene.ts
 * Bölüm Başarıyla Tamamlandı Ekranı:
 * Yüksek kaliteli arka plan, kazanılan özet rapor ve "Dükkana Git" butonu
 */

import Phaser from 'phaser';
import { GameStateManager } from '../state/GameState';
import { AudioManager } from '../systems/AudioManager';
import { ArcadeButton } from '../utils/ArcadeButton';

export class LevelCompleteScene extends Phaser.Scene {
  private stateManager!: GameStateManager;
  private audioManager!: AudioManager;

  constructor() {
    super('LevelCompleteScene');
  }

  create(): void {
    this.stateManager = GameStateManager.getInstance();
    this.audioManager = AudioManager.getInstance();

    this.createBackground();
    this.createVictoryHeader();
    this.createStatsCard();
    this.createShopButton();
  }

  private createBackground(): void {
    // Mağara arka planı
    const bg = this.add.image(640, 360, 'mine_cave_bg');
    bg.setDisplaySize(1280, 720);
    bg.setAlpha(0.45);

    // Zümrüt / zafer yeşili degrade katman
    const overlay = this.add.graphics();
    overlay.fillGradientStyle(0x064e3b, 0x064e3b, 0x022c22, 0x022c22, 0.88);
    overlay.fillRect(0, 0, 1280, 720);

    // Parıltı partikülleri
    this.add.particles(640, 200, 'particle_gold', {
      speed: { min: 40, max: 130 },
      angle: { min: 0, max: 360 },
      scale: { start: 1, end: 0 },
      alpha: { start: 0.8, end: 0 },
      lifespan: 1400,
      quantity: 4,
      frequency: 120
    });
  }

  private createVictoryHeader(): void {
    const title = this.add.text(640, 75, '★ BÖLÜM TAMAMLANDI! ★', {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '48px',
      fontStyle: '900',
      color: '#34d399',
      stroke: '#064e3b',
      strokeThickness: 8
    }).setOrigin(0.5);

    this.tweens.add({
      targets: title,
      scaleX: 1.05,
      scaleY: 1.05,
      duration: 900,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    this.add.text(640, 122, `Bölüm ${this.stateManager.levelIndex} hedefi süre bitene kadar başarıyla tamamlandı!`, {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '17px',
      color: '#a7f3d0'
    }).setOrigin(0.5);
  }

  private createStatsCard(): void {
    const card = this.add.graphics();
    card.fillStyle(0x065f46, 0.88);
    card.fillRoundedRect(280, 155, 720, 390, 16);
    card.lineStyle(2, 0x34d399, 1);
    card.strokeRoundedRect(280, 155, 720, 390, 16);

    // Yanlarda zafer madencileri
    this.add.image(210, 350, 'miner_p1_idle').setDisplaySize(92, 185);
    this.add.image(1070, 350, 'miner_p2_idle').setDisplaySize(92, 185);

    const stats = this.stateManager.currentLevelStats;
    const totalGold = this.stateManager.getTotalGold();
    const targetGold = this.stateManager.getTargetGoldForCurrentLevel();
    const spendable = this.stateManager.getSpendableGold();

    const p1This = stats.goldEarnedP1;
    const p2This = stats.goldEarnedP2;
    const p1Career = this.stateManager.playerCareerGold[1] || 0;
    const p2Career = this.stateManager.playerCareerGold[2] || 0;

    // 1. Çekişme / Şampiyonluk Rozeti
    let champText = '🤝 Bu Bölüm Berabere!';
    let champColor = '#fef08a';
    if (p1This > p2This) {
      champText = `👑 Bölümün Kazananı: OYUNCU 1 (+$${p1This - p2This} Farkla!)`;
      champColor = '#93c5fd';
    } else if (p2This > p1This) {
      champText = `👑 Bölümün Kazananı: OYUNCU 2 (+$${p2This - p1This} Farkla!)`;
      champColor = '#fca5a5';
    }

    const champBanner = this.add.graphics();
    champBanner.fillStyle(0x064e3b, 1);
    champBanner.fillRoundedRect(320, 175, 640, 36, 8);
    champBanner.lineStyle(1.5, 0xfacc15, 1);
    champBanner.strokeRoundedRect(320, 175, 640, 36, 8);

    this.add.text(640, 193, champText, {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '16px',
      fontStyle: 'bold',
      color: champColor
    }).setOrigin(0.5);

    // 2. Oyuncu Skor Karşılaştırması
    this.add.text(320, 225, 'Bölüm Kazançları & Kariyer Rekabeti:', {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '18px',
      fontStyle: 'bold',
      color: '#fbbf24'
    });

    const p1IsLeader = p1Career > p2Career;
    const p2IsLeader = p2Career > p1Career;

    this.add.text(320, 256, `• Oyuncu 1 (Sol - Mavi): +$${p1This}  [Toplam Kariyer: $${p1Career}${p1IsLeader ? ' 👑 LİDER' : ''}]`, {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '15px',
      fontStyle: 'bold',
      color: '#93c5fd'
    });

    this.add.text(320, 284, `• Oyuncu 2 (Sağ - Kırmızı): +$${p2This}  [Toplam Kariyer: $${p2Career}${p2IsLeader ? ' 👑 LİDER' : ''}]`, {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '15px',
      fontStyle: 'bold',
      color: '#fca5a5'
    });

    // 3. Kasa ve Hedef Durumu
    this.add.text(320, 325, 'Ortak Kasa & Dükkan Bütçesi:', {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '18px',
      fontStyle: 'bold',
      color: '#fbbf24'
    });

    this.add.text(320, 356, `• Toplam Kasa: $${totalGold}  (Bölüm Hedefi: $${targetGold})`, {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '15px',
      color: '#ffffff'
    });

    this.add.text(320, 384, `• Dükkanda Harcanabilir Bakiye: $${spendable}`, {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '16px',
      fontStyle: 'bold',
      color: '#6ee7b7'
    });

    // Toplanan nesneler dökümü
    const itemsEntries = Object.entries(stats.itemsCollected);
    let itemsText = '• Toplanan Madenler: ';
    if (itemsEntries.length === 0) {
      itemsText += 'Yok';
    } else {
      itemsText += itemsEntries.map(([t, count]) => `${count}x ${t}`).join(', ');
    }

    this.add.text(320, 420, itemsText, {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '13.5px',
      color: '#d1fae5'
    });

    this.add.text(320, 490, '💡 Bilgi: Dükkanda harcanan bakiye sonraki bölüme geçiş barajını doğrudan etkiler!', {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '12.5px',
      fontStyle: 'italic',
      color: '#fef08a'
    });
  }

  private createShopButton(): void {
    const goToShop = () => {
      this.audioManager.playClick();
      this.scene.start('ShopScene');
    };

    new ArcadeButton(
      this,
      640,
      620,
      'MADENCİ MARKETİNE GİT →',
      goToShop,
      {
        theme: 'gold',
        width: 400,
        height: 56,
        fontSize: '20px',
        subText: 'ENTER / SPACE İLE DE GİDEBİLİRSİNİZ'
      }
    );

    if (this.input.keyboard) {
      const enterKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
      enterKey.once('down', goToShop);

      const spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
      spaceKey.once('down', goToShop);
    }
  }
}
