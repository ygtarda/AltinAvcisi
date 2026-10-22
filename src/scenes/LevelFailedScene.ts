/**
 * LevelFailedScene.ts
 * Bölüm Başarısız Ekranı: Hedefe ulaşılamadığında eksik miktar ve Tekrar Dene seçeneği
 */

import Phaser from 'phaser';
import { GameStateManager } from '../state/GameState';
import { AudioManager } from '../systems/AudioManager';
import { ArcadeButton } from '../utils/ArcadeButton';

export class LevelFailedScene extends Phaser.Scene {
  private stateManager!: GameStateManager;
  private audioManager!: AudioManager;

  constructor() {
    super('LevelFailedScene');
  }

  create(): void {
    this.stateManager = GameStateManager.getInstance();
    this.audioManager = AudioManager.getInstance();

    this.createBackground();
    this.createHeader();
    this.createFailureCard();
    this.createRetryButton();
  }

  private createBackground(): void {
    const bg = this.add.image(640, 360, 'mine_cave_bg');
    bg.setDisplaySize(1280, 720);
    bg.setAlpha(0.35);

    const overlay = this.add.graphics();
    overlay.fillGradientStyle(0x450a0a, 0x450a0a, 0x18181b, 0x18181b, 0.9);
    overlay.fillRect(0, 0, 1280, 720);
  }

  private createHeader(): void {
    this.add.text(640, 95, 'SÜRE DOLDU — HEDEFE ULAŞILAMADI!', {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '44px',
      fontStyle: '900',
      color: '#ef4444',
      stroke: '#450a0a',
      strokeThickness: 8
    }).setOrigin(0.5);

    this.add.text(640, 150, `Bölüm ${this.stateManager.levelIndex} için belirlenen hedef tutarı karşılanamadı.`, {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '17px',
      color: '#fca5a5'
    }).setOrigin(0.5);
  }

  private createFailureCard(): void {
    const card = this.add.graphics();
    card.fillStyle(0x7f1d1d, 0.88);
    card.fillRoundedRect(320, 195, 640, 290, 16);
    card.lineStyle(2, 0xef4444, 1);
    card.strokeRoundedRect(320, 195, 640, 290, 16);

    const total = this.stateManager.getTotalGold();
    const target = this.stateManager.getTargetGoldForCurrentLevel();
    const shortfall = Math.max(0, target - total);

    this.add.text(640, 235, 'BÖLÜM RAPORU', {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '22px',
      fontStyle: 'bold',
      color: '#fef08a'
    }).setOrigin(0.5);

    this.add.text(360, 280, `• Mevcut Toplam Kasa: $${total}`, {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '17px',
      color: '#ffffff'
    });

    this.add.text(360, 315, `• Bölüm Barajı: $${target}`, {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '17px',
      color: '#ffffff'
    });

    this.add.text(360, 355, `• Eksik Kalan Miktar: -$${shortfall}`, {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '20px',
      fontStyle: 'bold',
      color: '#f87171'
    });

    this.add.text(360, 410, '⚠️ Bu bölümde kazanılan geçici altınlar sıfırlanarak bölüme yeniden başlanacak.', {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '13px',
      fontStyle: 'italic',
      color: '#fed7aa'
    });
  }

  private createRetryButton(): void {
    const retry = () => {
      this.audioManager.playClick();
      this.stateManager.retryCurrentLevel();
      this.scene.start('GameScene');
    };

    new ArcadeButton(
      this,
      640,
      570,
      'BÖLÜMÜ TEKRAR DENE ↻',
      retry,
      {
        theme: 'red',
        width: 380,
        height: 56,
        fontSize: '20px',
        subText: 'ENTER / SPACE İLE YENİDEN BAŞLA'
      }
    );

    if (this.input.keyboard) {
      const enterKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
      enterKey.once('down', retry);

      const spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
      spaceKey.once('down', retry);
    }
  }
}
