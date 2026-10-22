/**
 * ArcadeButton.ts
 * Klasik arcade ve western altın arayıcısı estetiğinde dokunsal (tactile) buton sistemi.
 * Düz, yapay zeka ürünü neon kutular yerine; 3D pahlı (beveled) kenarlıklar,
 * altın kabartmalı yazı, perçinler, basılma derinliği ve ses efektleri içerir.
 */

import Phaser from 'phaser';
import { AudioManager } from '../systems/AudioManager';

export type ButtonTheme = 'gold' | 'green' | 'red' | 'wood';

export interface ArcadeButtonOptions {
  width?: number;
  height?: number;
  fontSize?: string;
  theme?: ButtonTheme;
  subText?: string;
}

export class ArcadeButton extends Phaser.GameObjects.Container {
  private btnBg: Phaser.GameObjects.Graphics;
  private btnText: Phaser.GameObjects.Text;
  private subTextObj?: Phaser.GameObjects.Text;
  private isPressed: boolean = false;
  private callback: () => void;
  private audioManager: AudioManager;

  private btnWidth: number;
  private btnHeight: number;
  private theme: ButtonTheme;
  private labelText: string;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    text: string,
    callback: () => void,
    options: ArcadeButtonOptions = {}
  ) {
    super(scene, x, y);

    this.callback = callback;
    this.audioManager = AudioManager.getInstance();
    this.labelText = text;

    this.btnWidth = options.width || 340;
    this.btnHeight = options.height || 56;
    this.theme = options.theme || 'gold';
    const fontSize = options.fontSize || '20px';

    this.setSize(this.btnWidth, this.btnHeight);

    // 1. Çok Katmanlı 3D Beveled Grafik Gövdesi
    this.btnBg = scene.add.graphics();
    this.drawButton(false);
    this.add(this.btnBg);

    // 2. Altın Kabartmalı & Gölgeli Yazı
    this.btnText = scene.add.text(0, options.subText ? -6 : 0, text, {
      fontFamily: 'system-ui, -apple-system, sans-serif',
      fontSize: fontSize,
      fontStyle: '900',
      color: this.getTextColor(),
      stroke: '#18181b',
      strokeThickness: 5,
      shadow: {
        offsetX: 0,
        offsetY: 2,
        color: '#000000',
        blur: 4,
        stroke: true,
        fill: true
      }
    }).setOrigin(0.5);
    this.add(this.btnText);

    // İkincil Alt Bilgi (Varsa ör: ENTER / SPACE)
    if (options.subText) {
      this.subTextObj = scene.add.text(0, 15, options.subText, {
        fontFamily: 'system-ui, sans-serif',
        fontSize: '11.5px',
        fontStyle: 'bold',
        color: '#fef08a',
        stroke: '#000000',
        strokeThickness: 3
      }).setOrigin(0.5);
      this.add(this.subTextObj);
    }

    // 3. Etkileşim ve Dokunsal Mekanik Davranışlar
    this.setInteractive({ useHandCursor: true });

    this.on('pointerover', this.onPointerOver, this);
    this.on('pointerout', this.onPointerOut, this);
    this.on('pointerdown', this.onPointerDown, this);
    this.on('pointerup', this.onPointerUp, this);

    scene.add.existing(this);
  }

  private getThemeColors() {
    switch (this.theme) {
      case 'green':
        return {
          rimOuter: 0x064e3b,
          rimInner: 0x34d399,
          fillGradTop: 0x16a34a,
          fillGradBottom: 0x15803d,
          highlight: 0x86efac,
          hoverGlow: 0x4ade80,
          shadow: 0x022c22,
          textColor: '#f0fdf4'
        };
      case 'red':
        return {
          rimOuter: 0x450a0a,
          rimInner: 0xf87171,
          fillGradTop: 0xdc2626,
          fillGradBottom: 0xb91c1c,
          highlight: 0xfca5a5,
          hoverGlow: 0xef4444,
          shadow: 0x270707,
          textColor: '#fef2f2'
        };
      case 'wood':
        return {
          rimOuter: 0x27190d,
          rimInner: 0xd97706,
          fillGradTop: 0x78350f,
          fillGradBottom: 0x451a03,
          highlight: 0xfde68a,
          hoverGlow: 0xfbbf24,
          shadow: 0x150b04,
          textColor: '#fef3c7'
        };
      case 'gold':
      default:
        return {
          rimOuter: 0x451a03,
          rimInner: 0xfde047,
          fillGradTop: 0xd97706,
          fillGradBottom: 0xb45309,
          highlight: 0xfef08a,
          hoverGlow: 0xf59e0b,
          shadow: 0x2a1002,
          textColor: '#ffffff'
        };
    }
  }

  private getTextColor(): string {
    return this.getThemeColors().textColor;
  }

  private drawButton(isHover: boolean): void {
    this.btnBg.clear();
    const colors = this.getThemeColors();
    const w = this.btnWidth;
    const h = this.btnHeight;
    const halfW = w / 2;
    const halfH = h / 2;
    const pressOffset = this.isPressed ? 3 : 0;
    const shadowH = this.isPressed ? 2 : 5;

    // 1. Zemin Alt Düşme Gölgesi (Derinlik)
    this.btnBg.fillStyle(0x000000, 0.45);
    this.btnBg.fillRoundedRect(-halfW, -halfH + 4, w, h + shadowH, 14);

    // 2. 3D Alt Kasa / Pah Tabanı (Physical Bevel Rim)
    this.btnBg.fillStyle(colors.shadow, 1);
    this.btnBg.fillRoundedRect(-halfW, -halfH + pressOffset, w, h + 3, 14);

    // 3. Dış Döküm Çerçeve
    this.btnBg.lineStyle(2, colors.rimOuter, 1);
    this.btnBg.strokeRoundedRect(-halfW, -halfH + pressOffset, w, h, 14);

    // 4. Ana Gövde Gradyanı (Zengin renk)
    this.btnBg.fillStyle(isHover ? colors.fillGradTop : colors.fillGradBottom, 1);
    this.btnBg.fillRoundedRect(-halfW + 2, -halfH + 2 + pressOffset, w - 4, h - 4, 12);

    // 5. Üst Parlama / Işık Yansıması (Cam/Maden Cilası Specular Highlight)
    this.btnBg.fillStyle(0xffffff, isHover ? 0.28 : 0.16);
    this.btnBg.fillRoundedRect(-halfW + 4, -halfH + 3 + pressOffset, w - 8, (h - 6) * 0.45, 10);

    // 6. İç Altın Metalik Kenarlık
    this.btnBg.lineStyle(1.8, isHover ? colors.rimInner : colors.highlight, 0.9);
    this.btnBg.strokeRoundedRect(-halfW + 2, -halfH + 2 + pressOffset, w - 4, h - 4, 12);

    // 7. Dört Köşe Metal Perçinler (Arcade Hardware Rivets)
    const rivetRadius = 2.5;
    const rivetOffset = 9;
    this.btnBg.fillStyle(0xd4af37, 0.85);

    // Sol Üst
    this.btnBg.fillCircle(-halfW + rivetOffset, -halfH + rivetOffset + pressOffset, rivetRadius);
    // Sağ Üst
    this.btnBg.fillCircle(halfW - rivetOffset, -halfH + rivetOffset + pressOffset, rivetRadius);
    // Sol Alt
    this.btnBg.fillCircle(-halfW + rivetOffset, halfH - rivetOffset + pressOffset, rivetRadius);
    // Sağ Alt
    this.btnBg.fillCircle(halfW - rivetOffset, halfH - rivetOffset + pressOffset, rivetRadius);
  }

  private onPointerOver(): void {
    this.drawButton(true);
    this.audioManager.playClick();
    this.scene.tweens.add({
      targets: this,
      scaleX: 1.03,
      scaleY: 1.03,
      duration: 140,
      ease: 'Back.easeOut'
    });
  }

  private onPointerOut(): void {
    this.isPressed = false;
    this.drawButton(false);
    this.btnText.y = this.subTextObj ? -6 : 0;
    if (this.subTextObj) this.subTextObj.y = 15;
    this.scene.tweens.add({
      targets: this,
      scaleX: 1.0,
      scaleY: 1.0,
      duration: 140,
      ease: 'Cubic.easeOut'
    });
  }

  private onPointerDown(): void {
    this.isPressed = true;
    this.drawButton(true);
    // Buton fiziksel olarak 3px aşağı basılır
    this.btnText.y = (this.subTextObj ? -6 : 0) + 3;
    if (this.subTextObj) this.subTextObj.y = 15 + 3;
    this.audioManager.playClick();
  }

  private onPointerUp(): void {
    if (this.isPressed) {
      this.isPressed = false;
      this.drawButton(true);
      this.btnText.y = this.subTextObj ? -6 : 0;
      if (this.subTextObj) this.subTextObj.y = 15;
      this.callback();
    }
  }

  public updateText(newText: string): void {
    this.labelText = newText;
    this.btnText.setText(newText);
  }
}
