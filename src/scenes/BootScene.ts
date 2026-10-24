/**
 * BootScene.ts
 * Üst düzey grafik assetlerinin yüklenmesi ve başlatılması
 */

import Phaser from 'phaser';
import { AudioManager } from '../systems/AudioManager';
import { TextureGenerator } from '../systems/TextureGenerator';

export class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  preload(): void {
    // Yükleme ekranı görseli
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    const progressBar = this.add.graphics();
    const progressBox = this.add.graphics();
    progressBox.fillStyle(0x222222, 0.8);
    progressBox.fillRoundedRect(width / 2 - 160, height / 2 - 25, 320, 50, 10);

    const loadingText = this.make.text({
      x: width / 2,
      y: height / 2 - 50,
      text: 'Altın Avcısı Yükleniyor...',
      style: {
        font: '20px system-ui, sans-serif',
        color: '#fbbf24'
      }
    }).setOrigin(0.5, 0.5);

    this.load.on('progress', (value: number) => {
      progressBar.clear();
      progressBar.fillStyle(0xf59e0b, 1);
      progressBar.fillRoundedRect(width / 2 - 150, height / 2 - 15, 300 * value, 30, 6);
    });

    this.load.on('complete', () => {
      progressBar.destroy();
      progressBox.destroy();
      loadingText.destroy();
    });

    // Yapay zeka ile üretilmiş yüksek çözünürlüklü AAA assetler
    this.load.image('mine_cave_bg', 'assets/mine_cave_bg.jpg');
    this.load.image('miner_shop_bg', 'assets/miner_shop_bg.jpg');
    this.load.image('miner_p1', 'assets/miner_p1.png');
    this.load.image('miner_p2', 'assets/miner_p2.png');
    this.load.image('minecart', 'assets/minecart.png');
    this.load.image('gold_nugget', 'assets/gold_nugget.png');
    this.load.image('diamond', 'assets/diamond.png');
    this.load.image('tnt', 'assets/tnt.png');
    this.load.image('mystery_box', 'assets/mystery_box.png');
    this.load.image('rock', 'assets/rock.png');
    this.load.image('claw_open', 'assets/claw_open.png');
    this.load.image('claw_closed', 'assets/claw_closed.png');
    this.load.image('stratified_dirt_bg', 'assets/stratified_dirt_bg.jpg');
    this.load.image('bg_valley', 'assets/bg_valley.jpg');
    this.load.image('bg_canyon', 'assets/bg_canyon.jpg');
    this.load.image('bg_snow', 'assets/bg_snow.jpg');
    this.load.image('bg_volcano', 'assets/bg_volcano.jpg');
    this.load.image('shop_dynamite', 'assets/shop_dynamite.png');
    this.load.image('shop_potion', 'assets/shop_potion.png');
    this.load.image('shop_clover', 'assets/shop_clover.png');
    this.load.image('shop_magnet', 'assets/shop_magnet.png');
    this.load.image('shop_watch', 'assets/shop_watch.png');
    this.load.image('shop_cash', 'assets/shop_cash.png');
    this.load.image('miner_cart_p1', 'assets/miner_cart_p1.png');
    this.load.image('miner_cart_p2', 'assets/miner_cart_p2.png');
    this.load.image('tnt_barrel', 'assets/tnt_barrel.png');
    this.load.image('cart_diamond', 'assets/cart_diamond.png');
    this.load.image('cart_tnt', 'assets/cart_tnt.png');

    // Penguen yürüyüş animasyon kareleri (4'er kare)
    for (let i = 0; i < 4; i++) {
      this.load.image(`penguin_diamond_${i}`, `assets/penguin_diamond_${i}.png`);
      this.load.image(`penguin_dynamite_${i}`, `assets/penguin_dynamite_${i}.png`);
    }

    this.load.image('shop_diamond_polish', 'assets/shop_diamond_polish.png');
    this.load.image('explosion_blast', 'assets/explosion_blast.png');
    this.load.image('mining_winch', 'assets/mining_winch.png');
    this.load.image('miner_p1_idle', 'assets/miner_p1_idle.png');
    this.load.image('miner_p1_crank', 'assets/miner_p1_crank.png');
    this.load.image('miner_p1_strain', 'assets/miner_p1_strain.png');
    this.load.image('miner_p2_idle', 'assets/miner_p2_idle.png');
    this.load.image('miner_p2_crank', 'assets/miner_p2_crank.png');
    this.load.image('miner_p2_strain', 'assets/miner_p2_strain.png');
  }

  create(): void {
    // Parçacık dokuları üretimi
    TextureGenerator.generateAll(this);

    // Penguen Yürüyüş Animasyonları
    if (!this.anims.exists('penguin_diamond_walk')) {
      this.anims.create({
        key: 'penguin_diamond_walk',
        frames: [
          { key: 'penguin_diamond_0' },
          { key: 'penguin_diamond_1' },
          { key: 'penguin_diamond_2' },
          { key: 'penguin_diamond_3' }
        ],
        frameRate: 6,
        repeat: -1
      });
    }

    if (!this.anims.exists('penguin_dynamite_walk')) {
      this.anims.create({
        key: 'penguin_dynamite_walk',
        frames: [
          { key: 'penguin_dynamite_0' },
          { key: 'penguin_dynamite_1' },
          { key: 'penguin_dynamite_2' },
          { key: 'penguin_dynamite_3' }
        ],
        frameRate: 6,
        repeat: -1
      });
    }

    // Audio Context başlatma
    AudioManager.getInstance();

    // Ana Menüye Geç
    this.scene.start('MenuScene');
  }
}
