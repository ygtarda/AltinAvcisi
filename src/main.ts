/**
 * main.ts
 * Phaser 3 Oyun Motoru Başlatma ve Konfigürasyon
 */

import Phaser from 'phaser';
import { GameConfig } from './config/GameConfig';
import { BootScene } from './scenes/BootScene';
import { MenuScene } from './scenes/MenuScene';
import { GameScene } from './scenes/GameScene';
import { LevelCompleteScene } from './scenes/LevelCompleteScene';
import { LevelFailedScene } from './scenes/LevelFailedScene';
import { ShopScene } from './scenes/ShopScene';

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: GameConfig.display.width,
  height: GameConfig.display.height,
  parent: 'game-container',
  backgroundColor: '#09090b',
  pixelArt: false,
  antialias: true,
  antialiasGL: true,
  roundPixels: false,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: GameConfig.display.width,
    height: GameConfig.display.height
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 0 },
      debug: false
    }
  },
  scene: [
    BootScene,
    MenuScene,
    GameScene,
    LevelCompleteScene,
    LevelFailedScene,
    ShopScene
  ]
};

window.addEventListener('DOMContentLoaded', () => {
  new Phaser.Game(config);
});
