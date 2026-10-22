/**
 * TextureGenerator.ts
 * Phaser Graphics API kullanılarak runtime'da programatik pixel-art dokular üretir.
 * Sıfır dış dosya bağımlılığı, keskin retro arcade estetiği.
 */

import Phaser from 'phaser';

export class TextureGenerator {
  public static generateAll(scene: Phaser.Scene): void {
    TextureGenerator.createSmallRock(scene);
    TextureGenerator.createBigRock(scene);
    TextureGenerator.createSmallGold(scene);
    TextureGenerator.createMediumGold(scene);
    TextureGenerator.createBigGold(scene);
    TextureGenerator.createDiamond(scene);
    TextureGenerator.createMysteryBox(scene);
    TextureGenerator.createTNT(scene);
    TextureGenerator.createMinerP1(scene);
    TextureGenerator.createMinerP2(scene);
    TextureGenerator.createClaw(scene);
    TextureGenerator.createParticles(scene);
  }

  private static createSmallRock(scene: Phaser.Scene): void {
    if (scene.textures.exists('small_rock')) return;
    const g = scene.make.graphics({ x: 0, y: 0 });

    // Dış gölge / koyu hat
    g.fillStyle(0x374151, 1);
    g.fillRoundedRect(1, 1, 22, 22, 4);

    // Ana taş gövdesi
    g.fillStyle(0x6b7280, 1);
    g.fillRoundedRect(3, 3, 18, 18, 3);

    // Açık ton fasetler ve çatlaklar
    g.fillStyle(0x9ca3af, 1);
    g.fillRect(5, 5, 8, 5);
    g.fillRect(7, 10, 4, 3);

    // Koyu çatlak çizgisi
    g.fillStyle(0x1f2937, 1);
    g.fillRect(11, 7, 5, 2);
    g.fillRect(13, 9, 2, 6);

    g.generateTexture('small_rock', 24, 24);
    g.destroy();
  }

  private static createBigRock(scene: Phaser.Scene): void {
    if (scene.textures.exists('big_rock')) return;
    const g = scene.make.graphics({ x: 0, y: 0 });

    // Dış koyu hat
    g.fillStyle(0x1f2937, 1);
    g.fillRoundedRect(1, 1, 38, 38, 6);

    // Gövde
    g.fillStyle(0x4b5563, 1);
    g.fillRoundedRect(3, 3, 34, 34, 5);

    // İkincil yüzey
    g.fillStyle(0x6b7280, 1);
    g.fillRoundedRect(6, 6, 20, 16, 3);
    g.fillRoundedRect(18, 20, 16, 14, 3);

    // Işık parıltısı
    g.fillStyle(0x9ca3af, 1);
    g.fillRect(8, 8, 12, 4);
    g.fillRect(20, 22, 8, 4);

    // Derin yarıklar
    g.fillStyle(0x111827, 1);
    g.fillRect(14, 12, 10, 2);
    g.fillRect(22, 14, 2, 8);
    g.fillRect(8, 24, 6, 2);

    g.generateTexture('big_rock', 40, 40);
    g.destroy();
  }

  private static createSmallGold(scene: Phaser.Scene): void {
    if (scene.textures.exists('small_gold')) return;
    const g = scene.make.graphics({ x: 0, y: 0 });

    // Koyu altın kontur
    g.fillStyle(0x78350f, 1);
    g.fillCircle(14, 14, 13);

    // Zengin sarı altın gövde
    g.fillStyle(0xf59e0b, 1);
    g.fillCircle(14, 14, 11);

    // Parlak üst katman
    g.fillStyle(0xfbbf24, 1);
    g.fillCircle(12, 11, 7);

    // Beyaz parıltı (glint)
    g.fillStyle(0xfef08a, 1);
    g.fillCircle(10, 9, 3);
    g.fillStyle(0xffffff, 1);
    g.fillRect(9, 8, 2, 2);

    g.generateTexture('small_gold', 28, 28);
    g.destroy();
  }

  private static createMediumGold(scene: Phaser.Scene): void {
    if (scene.textures.exists('medium_gold')) return;
    const g = scene.make.graphics({ x: 0, y: 0 });

    // Koyu altın kontur
    g.fillStyle(0x78350f, 1);
    g.fillRoundedRect(2, 2, 38, 38, 8);

    // Gövde
    g.fillStyle(0xd97706, 1);
    g.fillRoundedRect(4, 4, 34, 34, 7);

    // Parlak altın yüzey
    g.fillStyle(0xf59e0b, 1);
    g.fillRoundedRect(7, 6, 26, 22, 5);

    // Faset ışığı
    g.fillStyle(0xfde047, 1);
    g.fillCircle(16, 15, 9);

    // Parıltı noktaları
    g.fillStyle(0xffffff, 1);
    g.fillRect(13, 11, 3, 3);
    g.fillRect(26, 20, 2, 2);

    g.generateTexture('medium_gold', 42, 42);
    g.destroy();
  }

  private static createBigGold(scene: Phaser.Scene): void {
    if (scene.textures.exists('big_gold')) return;
    const g = scene.make.graphics({ x: 0, y: 0 });

    // Dış hat
    g.fillStyle(0x78350f, 1);
    g.fillRoundedRect(2, 2, 56, 56, 12);

    // Gölgeli derin altın
    g.fillStyle(0xb45309, 1);
    g.fillRoundedRect(4, 4, 52, 52, 10);

    // Ana altın kütlesi
    g.fillStyle(0xf59e0b, 1);
    g.fillRoundedRect(7, 6, 44, 42, 8);

    // Üst parıltılı katman
    g.fillStyle(0xfbbf24, 1);
    g.fillRoundedRect(10, 9, 30, 26, 6);

    // Güçlü ışık parıltısı
    g.fillStyle(0xfef08a, 1);
    g.fillCircle(22, 19, 11);

    // Yıldız / pırıltı efekti
    g.fillStyle(0xffffff, 1);
    g.fillRect(19, 14, 5, 5);
    g.fillRect(20, 11, 3, 11);
    g.fillRect(16, 15, 11, 3);

    g.generateTexture('big_gold', 60, 60);
    g.destroy();
  }

  private static createDiamond(scene: Phaser.Scene): void {
    if (scene.textures.exists('diamond')) return;
    const g = scene.make.graphics({ x: 0, y: 0 });

    // Baklava biçimi elmas
    // Kontur
    g.fillStyle(0x0e7490, 1);
    g.beginPath();
    g.moveTo(11, 1);
    g.lineTo(21, 11);
    g.lineTo(11, 21);
    g.lineTo(1, 11);
    g.closePath();
    g.fillPath();

    // Cyan elmas gövde
    g.fillStyle(0x06b6d4, 1);
    g.beginPath();
    g.moveTo(11, 3);
    g.lineTo(19, 11);
    g.lineTo(11, 19);
    g.lineTo(3, 11);
    g.closePath();
    g.fillPath();

    // Parlak üst faset
    g.fillStyle(0x67e8f9, 1);
    g.beginPath();
    g.moveTo(11, 4);
    g.lineTo(17, 10);
    g.lineTo(11, 14);
    g.lineTo(5, 10);
    g.closePath();
    g.fillPath();

    // Beyaz parıltı
    g.fillStyle(0xffffff, 1);
    g.fillRect(10, 6, 3, 3);

    g.generateTexture('diamond', 22, 22);
    g.destroy();
  }

  private static createMysteryBox(scene: Phaser.Scene): void {
    if (scene.textures.exists('mystery_box')) return;
    const g = scene.make.graphics({ x: 0, y: 0 });

    // Ahşap sandık gövdesi
    g.fillStyle(0x451a03, 1);
    g.fillRoundedRect(1, 1, 28, 28, 3);

    g.fillStyle(0x92400e, 1);
    g.fillRect(3, 3, 24, 24);

    // Ahşap tahta çizgileri
    g.fillStyle(0x78350f, 1);
    g.fillRect(3, 10, 24, 2);
    g.fillRect(3, 18, 24, 2);

    // Köşe metal perçinler
    g.fillStyle(0xd97706, 1);
    g.fillRect(4, 4, 3, 3);
    g.fillRect(23, 4, 3, 3);
    g.fillRect(4, 23, 3, 3);
    g.fillRect(23, 23, 3, 3);

    // Soru işareti "?" pikselleri
    g.fillStyle(0xfef08a, 1);
    // Üst yay
    g.fillRect(12, 6, 6, 2);
    g.fillRect(17, 8, 2, 3);
    g.fillRect(14, 11, 4, 2);
    // Orta dikey
    g.fillRect(14, 13, 2, 3);
    // Nokta
    g.fillRect(14, 18, 2, 2);

    g.generateTexture('mystery_box', 30, 30);
    g.destroy();
  }

  private static createTNT(scene: Phaser.Scene): void {
    if (scene.textures.exists('tnt')) return;
    const g = scene.make.graphics({ x: 0, y: 0 });

    // Dinamit fıçısı / çubukları
    // Siyah kontur
    g.fillStyle(0x18181b, 1);
    g.fillRoundedRect(2, 6, 28, 24, 3);

    // Kırmızı dinamit gövdesi
    g.fillStyle(0xdc2626, 1);
    g.fillRect(4, 8, 24, 20);

    // Siyah sarma bantları
    g.fillStyle(0x18181b, 1);
    g.fillRect(4, 11, 24, 2);
    g.fillRect(4, 22, 24, 2);

    // Beyaz "TNT" yazısı pikselleri
    g.fillStyle(0xffffff, 1);
    // T
    g.fillRect(6, 15, 5, 1);
    g.fillRect(8, 16, 1, 4);
    // N
    g.fillRect(13, 15, 1, 5);
    g.fillRect(14, 16, 1, 1);
    g.fillRect(15, 17, 1, 1);
    g.fillRect(16, 18, 1, 1);
    g.fillRect(17, 15, 1, 5);
    // T
    g.fillRect(20, 15, 5, 1);
    g.fillRect(22, 16, 1, 4);

    // Fitil ve kıvılcım
    g.fillStyle(0x71717a, 1);
    g.fillRect(15, 3, 2, 4);
    g.fillStyle(0xfacc15, 1);
    g.fillRect(14, 1, 4, 3);
    g.fillStyle(0xf97316, 1);
    g.fillRect(15, 0, 2, 2);

    g.generateTexture('tnt', 32, 32);
    g.destroy();
  }

  private static createMinerP1(scene: Phaser.Scene): void {
    if (scene.textures.exists('miner_p1')) return;
    const g = scene.make.graphics({ x: 0, y: 0 });

    // Madenci Arabası (Vagon)
    g.fillStyle(0x3f3f46, 1);
    g.fillRect(8, 28, 32, 14);
    g.fillStyle(0x71717a, 1);
    g.fillRect(10, 30, 28, 10);
    // Tekerlekler
    g.fillStyle(0x18181b, 1);
    g.fillCircle(14, 43, 4);
    g.fillCircle(34, 43, 4);

    // Oyuncu 1 - Mavi Tulum & Başlık
    // Vücut
    g.fillStyle(0x2563eb, 1);
    g.fillRect(18, 16, 12, 13);

    // Baş / Yüz
    g.fillStyle(0xfcd34d, 1);
    g.fillCircle(24, 12, 6);

    // Mavi Baret + Sarı Madenci Lambası
    g.fillStyle(0x1d4ed8, 1);
    g.fillRoundedRect(17, 5, 14, 6, 2);
    g.fillStyle(0xfef08a, 1);
    g.fillRect(22, 6, 4, 3);

    // Makara / Vinç Çarkı
    g.fillStyle(0xa1a1aa, 1);
    g.fillCircle(24, 30, 5);
    g.fillStyle(0x27272a, 1);
    g.fillCircle(24, 30, 2);

    g.generateTexture('miner_p1', 48, 48);
    g.destroy();
  }

  private static createMinerP2(scene: Phaser.Scene): void {
    if (scene.textures.exists('miner_p2')) return;
    const g = scene.make.graphics({ x: 0, y: 0 });

    // Madenci Arabası (Vagon)
    g.fillStyle(0x3f3f46, 1);
    g.fillRect(8, 28, 32, 14);
    g.fillStyle(0x71717a, 1);
    g.fillRect(10, 30, 28, 10);
    // Tekerlekler
    g.fillStyle(0x18181b, 1);
    g.fillCircle(14, 43, 4);
    g.fillCircle(34, 43, 4);

    // Oyuncu 2 - Kırmızı Tulum & Başlık
    // Vücut
    g.fillStyle(0xdc2626, 1);
    g.fillRect(18, 16, 12, 13);

    // Baş / Yüz
    g.fillStyle(0xfcd34d, 1);
    g.fillCircle(24, 12, 6);

    // Kırmızı Baret + Sarı Madenci Lambası
    g.fillStyle(0xb91c1c, 1);
    g.fillRoundedRect(17, 5, 14, 6, 2);
    g.fillStyle(0xfef08a, 1);
    g.fillRect(22, 6, 4, 3);

    // Makara / Vinç Çarkı
    g.fillStyle(0xa1a1aa, 1);
    g.fillCircle(24, 30, 5);
    g.fillStyle(0x27272a, 1);
    g.fillCircle(24, 30, 2);

    g.generateTexture('miner_p2', 48, 48);
    g.destroy();
  }

  private static createClaw(scene: Phaser.Scene): void {
    if (scene.textures.exists('claw_open')) return;

    // Açık Kanca
    const gOpen = scene.make.graphics({ x: 0, y: 0 });
    gOpen.fillStyle(0x52525b, 1);
    // Üst halka
    gOpen.fillCircle(12, 4, 3);
    // Sol çatal
    gOpen.beginPath();
    gOpen.moveTo(10, 6);
    gOpen.lineTo(3, 14);
    gOpen.lineTo(2, 19);
    gOpen.lineTo(5, 19);
    gOpen.lineTo(7, 15);
    gOpen.lineTo(12, 8);
    gOpen.closePath();
    gOpen.fillPath();

    // Sağ çatal
    gOpen.beginPath();
    gOpen.moveTo(14, 6);
    gOpen.lineTo(21, 14);
    gOpen.lineTo(22, 19);
    gOpen.lineTo(19, 19);
    gOpen.lineTo(17, 15);
    gOpen.lineTo(12, 8);
    gOpen.closePath();
    gOpen.fillPath();

    // Parlak metalik yüzey
    gOpen.fillStyle(0xe4e4e7, 1);
    gOpen.fillRect(11, 2, 2, 3);
    gOpen.fillRect(4, 16, 2, 2);
    gOpen.fillRect(18, 16, 2, 2);

    gOpen.generateTexture('claw_open', 24, 22);
    gOpen.destroy();

    // Kapalı Kanca
    const gClosed = scene.make.graphics({ x: 0, y: 0 });
    gClosed.fillStyle(0x3f3f46, 1);
    gClosed.fillCircle(12, 4, 3);

    // Kavisli birbirine kenetli pençeler
    gClosed.beginPath();
    gClosed.moveTo(10, 6);
    gClosed.lineTo(6, 13);
    gClosed.lineTo(9, 19);
    gClosed.lineTo(12, 19);
    gClosed.lineTo(10, 14);
    gClosed.closePath();
    gClosed.fillPath();

    gClosed.beginPath();
    gClosed.moveTo(14, 6);
    gClosed.lineTo(18, 13);
    gClosed.lineTo(15, 19);
    gClosed.lineTo(12, 19);
    gClosed.lineTo(14, 14);
    gClosed.closePath();
    gClosed.fillPath();

    gClosed.fillStyle(0xd4d4d8, 1);
    gClosed.fillRect(11, 2, 2, 3);

    gClosed.generateTexture('claw_closed', 24, 22);
    gClosed.destroy();
  }

  private static createParticles(scene: Phaser.Scene): void {
    if (!scene.textures.exists('particle_gold')) {
      const g = scene.make.graphics({ x: 0, y: 0 });
      g.fillStyle(0xfde047, 1);
      g.fillCircle(4, 4, 3);
      g.fillStyle(0xffffff, 1);
      g.fillRect(3, 3, 2, 2);
      g.generateTexture('particle_gold', 8, 8);
      g.destroy();
    }

    if (!scene.textures.exists('particle_smoke')) {
      const g = scene.make.graphics({ x: 0, y: 0 });
      g.fillStyle(0x6b7280, 0.8);
      g.fillCircle(8, 8, 7);
      g.fillStyle(0x9ca3af, 0.9);
      g.fillCircle(7, 6, 4);
      g.generateTexture('particle_smoke', 16, 16);
      g.destroy();
    }
  }
}
