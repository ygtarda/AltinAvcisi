/**
 * ShopScene.ts
 * Kasiyer Masalı Madenci Marketi:
 * - Kutu/kart sistemi kaldırıldı; 6 adet premier madenci ekipmanı doğrudan ahşap tezgâhın üzerinde durur.
 * - Fiyatlar her bölüme özel dalgalanır (indirim ve zam etiketleri).
 * - Eşyaların üzerine gelindiğinde Kasiyer Old Jed'in ağzından çıkan çizgi roman konuşma balonu çalışır.
 * - Tıklanıp satın alındığında tezgâha doğru kayan para destesi (shop_cash), havada uçuşan -$ tutarı,
 *   cha-ching tınısı ve bakiye düşüşü gerçekleşir.
 * - "Bölüme Başla" butonu otantik 3D Arcade butonu olarak tasarlanmıştır.
 */

import Phaser from 'phaser';
import { GameConfig } from '../config/GameConfig';
import { GameStateManager } from '../state/GameState';
import { AudioManager } from '../systems/AudioManager';
import { ArcadeButton } from '../utils/ArcadeButton';

interface CounterItem {
  id: string;
  name: string;
  textureKey: string;
  x: number;
  y: number;
  speech: string;
  isStackable: boolean;
}

export class ShopScene extends Phaser.Scene {
  private stateManager!: GameStateManager;
  private audioManager!: AudioManager;

  private selectedIndex: number = 0;
  private isPaying: boolean = false;

  // HUD & UI Metinleri
  private textTotalGold!: Phaser.GameObjects.Text;
  private textSpendableGold!: Phaser.GameObjects.Text;
  private textNextTarget!: Phaser.GameObjects.Text;
  private textDynamiteStock!: Phaser.GameObjects.Text;

  // Kasiyer Jed Konuşma Balonu
  private speechContainer!: Phaser.GameObjects.Container;
  private textJedSpeech!: Phaser.GameObjects.Text;
  private speechTween?: Phaser.Tweens.Tween;

  // Tezgâhtaki Eşyaların Nesne Dizileri
  private itemSprites: Phaser.GameObjects.Sprite[] = [];
  private itemGlows: Phaser.GameObjects.Arc[] = [];
  private itemPriceTags: Phaser.GameObjects.Container[] = [];

  // Tezgâhta Sergilenen 6 Premier Madenci Ürünü
  private counterItems: CounterItem[] = [
    {
      id: 'dynamite',
      name: 'Dinamit Lokumu 🧨',
      textureKey: 'shop_dynamite',
      x: 140,
      y: 415,
      speech: '"Aha! Dinamit lokumu! Yanlışlıkla devasa kaya takılırsa fitili ateşleyin, saniyeler altın değerindedir!"',
      isStackable: true
    },
    {
      id: 'strong_hook',
      name: 'Kuvvet İksiri 🧪',
      textureKey: 'shop_potion',
      x: 340,
      y: 410,
      speech: '"Özel harman kuvvet iksiri! Bunu içen kancanın motoruna güç gelir, çekme hızınız %20 uçar!"',
      isStackable: false
    },
    {
      id: 'diamond_polish',
      name: 'Elmas Cilası 💎',
      textureKey: 'shop_diamond_polish',
      x: 540,
      y: 410,
      speech: '"Hakiki elmas parlatıcı cila! Bir sonraki bölümde bulacağınız elmasların pırıltısı ikiye katlanır ($120 → $240)!"',
      isStackable: false
    },
    {
      id: 'gold_magnet',
      name: 'Altın Mıknatısı 🧲',
      textureKey: 'shop_magnet',
      x: 740,
      y: 410,
      speech: '"Kuvvetli neodyum mıknatıs! Kancanın kapma menzilini ikiye katlar, altınları kaçırmazsın!"',
      isStackable: false
    },
    {
      id: 'lucky_clover',
      name: 'Şans Yoncası 🍀',
      textureKey: 'shop_clover',
      x: 940,
      y: 415,
      speech: '"Şanslı dört yapraklı yonca! Gizemli sandıklardan tuzak veya ceza değil, bolca hazine çıksın!"',
      isStackable: false
    },
    {
      id: 'extra_time',
      name: 'Ek Süre Saati ⏱',
      textureKey: 'shop_watch',
      x: 1140,
      y: 415,
      speech: '"Hakiki İsviçre madenci saati! Bir sonraki bölüme tam 15 saniye ek süre kazandırır!"',
      isStackable: true
    }
  ];

  constructor() {
    super('ShopScene');
  }

  create(): void {
    this.stateManager = GameStateManager.getInstance();
    this.audioManager = AudioManager.getInstance();
    this.selectedIndex = 0;
    this.isPaying = false;
    this.itemSprites = [];
    this.itemGlows = [];
    this.itemPriceTags = [];

    // 1. Kasiyer Masası Arka Planı
    this.createBackground();

    // 2. Üst Finansal Bilgi Şeridi
    this.createHeader();

    // 3. Kasiyer Old Jed Konuşma Balonu
    this.createShopkeeperSpeech();

    // 4. Ahşap Tezgâhın Üstündeki Etkileşimli Eşyalar
    this.createCounterItems();

    // 5. Sonraki Bölüme Geç Arcade Butonu
    this.createNextLevelButton();

    // 6. Klavye Kontrolleri
    this.setupKeyboardControls();

    // 7. UI ve Durum Güncellemesi
    this.refreshUI();
  }

  private createBackground(): void {
    const bg = this.add.image(640, 360, 'miner_shop_bg');
    bg.setDisplaySize(1280, 720);
    bg.setDepth(0);

    // Üst şerit koyulaştırması
    const topBar = this.add.graphics().setDepth(1);
    topBar.fillStyle(0x09090b, 0.90);
    topBar.fillRect(0, 0, 1280, 64);
    topBar.lineStyle(1, 0x27272a, 1);
    topBar.lineBetween(0, 64, 1280, 64);

    // Havada süzülen altın tozu parçacıkları
    this.add.particles(640, 300, 'particle_gold', {
      x: { min: 80, max: 1200 },
      y: { min: 80, max: 550 },
      speedY: { min: -10, max: -25 },
      scale: { start: 0.4, end: 0 },
      alpha: { start: 0.35, end: 0 },
      lifespan: 2500,
      quantity: 1
    }).setDepth(2);
  }

  private createHeader(): void {
    this.textTotalGold = this.add.text(25, 14, 'ORTAK KASA: $0', {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '18px',
      fontStyle: 'bold',
      color: '#fbbf24'
    }).setDepth(10);

    this.textSpendableGold = this.add.text(255, 15, 'Harcanabilir Fazlalık: $0', {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '15px',
      fontStyle: 'bold',
      color: '#34d399'
    }).setDepth(10);

    const nextLvl = this.stateManager.levelIndex + 1;
    const nextTarget = GameConfig.level.targetGold(nextLvl);
    this.textNextTarget = this.add.text(535, 16, `Gelecek Hedef: $${nextTarget}`, {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '14px',
      color: '#94a3b8'
    }).setDepth(10);

    // Ortak Dinamit Envanteri Rozeti
    const dynBox = this.add.graphics().setDepth(10);
    dynBox.fillStyle(0x7f1d1d, 0.9);
    dynBox.fillRoundedRect(950, 8, 305, 48, 8);
    dynBox.lineStyle(1, 0xef4444, 1);
    dynBox.strokeRoundedRect(950, 8, 305, 48, 8);

    this.textDynamiteStock = this.add.text(965, 14, `🧨 ÇANTADAKİ DİNAMİT: ${this.stateManager.dynamiteCount} Adet`, {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '14px',
      fontStyle: 'bold',
      color: '#fef08a'
    }).setDepth(11);

    this.add.text(965, 34, 'Ortak kullanım • P1: W tuşu | P2: ↑ tuşu', {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '11px',
      color: '#fca5a5'
    }).setDepth(11);
  }

  /**
   * Kasiyer Old Jed'in Başına Doğrudan Bağlı Parşömen Tarzı Çizgi Roman Konuşma Balonu
   */
  private createShopkeeperSpeech(): void {
    this.speechContainer = this.add.container(640, 140).setDepth(8);

    // Otantik Parşömen Balon Gövdesi
    const bubble = this.add.graphics();
    // Parşömen gövde dolgusu (#fffbeb krem)
    bubble.fillStyle(0xfffbeb, 0.96);
    bubble.fillRoundedRect(-330, -42, 660, 84, 16);
    // Koyu ahşap / mürekkep dış kontur
    bubble.lineStyle(3, 0x451a03, 1);
    bubble.strokeRoundedRect(-330, -42, 660, 84, 16);

    // Balonun Kasiyer Old Jed'in Başına (x: 515, y: 220) Bakan Kuyruğu
    bubble.fillStyle(0xfffbeb, 0.96);
    bubble.beginPath();
    bubble.moveTo(-110, 40);
    bubble.lineTo(-145, 68);
    bubble.lineTo(-75, 40);
    bubble.closePath();
    bubble.fillPath();
    bubble.lineStyle(3, 0x451a03, 1);
    bubble.lineBetween(-110, 40, -145, 68);
    bubble.lineBetween(-145, 68, -75, 40);

    const titleText = this.add.text(-310, -34, 'Kasiyer Old Jed 🤠', {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '13px',
      fontStyle: 'bold',
      color: '#b45309'
    });

    this.textJedSpeech = this.add.text(
      -310,
      -12,
      '"Hoş geldiniz madenciler! Tezgâhtaki mallar tazedir. İncelemek için üstlerine gelin, almak için tıklayın!"',
      {
        fontFamily: 'system-ui, sans-serif',
        fontSize: '13.5px',
        fontStyle: 'bold',
        color: '#1c1917',
        lineSpacing: 3,
        wordWrap: { width: 620 }
      }
    );

    this.speechContainer.add([bubble, titleText, this.textJedSpeech]);
  }

  private updateJedSpeech(text: string, color: string = '#1c1917'): void {
    if (this.speechTween) {
      this.speechTween.stop();
    }

    this.speechTween = this.tweens.add({
      targets: this.textJedSpeech,
      alpha: 0,
      duration: 70,
      onComplete: () => {
        this.textJedSpeech.setText(text);
        this.textJedSpeech.setColor(color);
        this.tweens.add({
          targets: this.textJedSpeech,
          alpha: 1,
          duration: 140
        });
      }
    });
  }

  private createCounterItems(): void {
    this.counterItems.forEach((item, index) => {
      // 1. Tezgâh Üzerinde Doğal Temas Gölgesi
      this.add.ellipse(item.x, item.y + 44, 76, 20, 0x000000, 0.45).setDepth(14);

      // 2. Hover / Seçim Parlama Aurası
      const glow = this.add.circle(item.x, item.y, 52, 0xfacc15, 0).setDepth(15);
      this.itemGlows.push(glow);

      // 3. Tezgâhın Üzerindeki Fiziksel Eşya Sprite'ı (Sabit 88x88 boyut)
      const sprite = this.add.sprite(item.x, item.y, item.textureKey);
      sprite.setDisplaySize(88, 88);
      sprite.setDepth(20);
      sprite.setInteractive({ useHandCursor: true });
      this.itemSprites.push(sprite);

      // Eşyaya hafif doğal soluk alma animasyonu
      this.tweens.add({
        targets: sprite,
        y: item.y - 4,
        duration: 1500 + index * 180,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });

      // 4. Eşyanın Altındaki Ahşap Fiyat ve İndirim/Zam Plakası ($)
      const tagContainer = this.add.container(item.x, 492).setDepth(22);
      const tagBg = this.add.graphics();
      tagBg.fillStyle(0x27190d, 0.95);
      tagBg.fillRoundedRect(-66, -20, 132, 42, 8);
      tagBg.lineStyle(1.5, 0xd97706, 1);
      tagBg.strokeRoundedRect(-66, -20, 132, 42, 8);

      const nameText = this.add.text(0, -9, item.name, {
        fontFamily: 'system-ui, sans-serif',
        fontSize: '11.5px',
        fontStyle: 'bold',
        color: '#fbbf24'
      }).setOrigin(0.5);

      const priceText = this.add.text(0, 9, `$${this.stateManager.getItemPrice(item.id)}`, {
        fontFamily: 'system-ui, sans-serif',
        fontSize: '13px',
        fontStyle: 'bold',
        color: '#22c55e'
      }).setOrigin(0.5);
      priceText.setName('priceText');

      // İndirim veya Zam Rozeti
      const discountPercent = this.stateManager.getItemDiscountPercent(item.id);
      const badgeContainer = this.add.container(0, -28);
      badgeContainer.setName('badgeContainer');

      if (discountPercent !== 0) {
        const isDiscount = discountPercent < 0;
        const badgeBg = this.add.graphics();
        const badgeW = isDiscount ? 78 : 64;
        badgeBg.fillStyle(isDiscount ? 0x15803d : 0xc2410c, 1);
        badgeBg.fillRoundedRect(-badgeW / 2, -8, badgeW, 16, 4);

        const badgeText = this.add.text(
          0,
          0,
          isDiscount ? `İNDİRİM %${Math.abs(discountPercent)}` : `ZAM +%${discountPercent}`,
          {
            fontFamily: 'system-ui, sans-serif',
            fontSize: '9.5px',
            fontStyle: 'bold',
            color: '#ffffff'
          }
        ).setOrigin(0.5);

        badgeContainer.add([badgeBg, badgeText]);
      }

      tagContainer.add([tagBg, nameText, priceText, badgeContainer]);
      tagContainer.setSize(132, 42);
      tagContainer.setInteractive({ useHandCursor: true });
      this.itemPriceTags.push(tagContainer);

      // Ortak Etkileşim Eylemleri
      const onHover = () => {
        this.selectedIndex = index;
        this.highlightItem(index);
        this.updateJedSpeech(item.speech);
        this.audioManager.playClick();
      };

      const onOut = () => {
        this.unhighlightItem(index);
        this.time.delayedCall(400, () => {
          if (this.selectedIndex === index && !this.isPaying) {
            this.updateJedSpeech('"Hoş geldiniz madenciler! Tezgâhtaki mallar tazedir. İncelemek için üstlerine gelin, almak için tıklayın!"');
          }
        });
      };

      const onClick = () => {
        this.triggerPurchase(item, index);
      };

      sprite.on('pointerover', onHover);
      sprite.on('pointerout', onOut);
      sprite.on('pointerdown', onClick);

      tagContainer.on('pointerover', onHover);
      tagContainer.on('pointerout', onOut);
      tagContainer.on('pointerdown', onClick);
    });
  }

  /**
   * Hover balonlama hatası düzeltildi: Sabit piksel ebatları üzerinden temiz geçiş yapılır
   */
  private highlightItem(index: number): void {
    const sprite = this.itemSprites[index];
    const glow = this.itemGlows[index];
    const tag = this.itemPriceTags[index];

    if (sprite) {
      this.tweens.killTweensOf(sprite);
      this.tweens.add({
        targets: sprite,
        displayWidth: 98,
        displayHeight: 98,
        duration: 160,
        ease: 'Back.easeOut'
      });
    }

    if (glow) {
      this.tweens.add({
        targets: glow,
        fillAlpha: 0.35,
        duration: 160
      });
    }

    if (tag) {
      this.tweens.add({
        targets: tag,
        scaleX: 1.05,
        scaleY: 1.05,
        duration: 160
      });
    }
  }

  private unhighlightItem(index: number): void {
    const sprite = this.itemSprites[index];
    const glow = this.itemGlows[index];
    const tag = this.itemPriceTags[index];

    if (sprite) {
      this.tweens.killTweensOf(sprite);
      this.tweens.add({
        targets: sprite,
        displayWidth: 88,
        displayHeight: 88,
        duration: 160,
        ease: 'Cubic.easeOut'
      });
    }

    if (glow) {
      this.tweens.add({
        targets: glow,
        fillAlpha: 0,
        duration: 160
      });
    }

    if (tag) {
      this.tweens.add({
        targets: tag,
        scaleX: 1.0,
        scaleY: 1.0,
        duration: 160
      });
    }
  }

  private triggerPurchase(item: CounterItem, index: number): void {
    if (this.isPaying) return;

    const currentPrice = this.stateManager.getItemPrice(item.id);

    const isPurchased = !item.isStackable && this.stateManager.isUpgradePurchased(item.id);
    if (isPurchased) {
      this.updateJedSpeech('"Bu ekipmanı zaten aldın evlat, sapasağlam çalışıyor!"', '#1d4ed8');
      this.audioManager.playClick();
      return;
    }

    const spendable = this.stateManager.getSpendableGold();
    if (spendable < currentPrice) {
      this.audioManager.playErrorBuzz();
      this.cameras.main.shake(160, 0.007);
      const sprite = this.itemSprites[index];
      this.tweens.add({
        targets: sprite,
        x: item.x + 8,
        yoyo: true,
        repeat: 3,
        duration: 40,
        onComplete: () => {
          sprite.x = item.x;
        }
      });
      this.updateJedSpeech(
        '"Hey evlat! Kasada yeterli harcanabilir bakiye yok, madende biraz daha ter dökün!"',
        '#b91c1c'
      );
      return;
    }

    // Yeterli bakiye var! Para Verme Animasyonunu Başlat
    this.isPaying = true;
    this.audioManager.playClick();

    // 1. Oyuncunun elinden tezgâha uzatılan nakit para destesi (shop_cash)
    const startX = item.x;
    const startY = 720;
    const cashImg = this.add.image(startX, startY, 'shop_cash').setDepth(45);
    cashImg.setDisplaySize(125, 105);
    cashImg.setAlpha(0.95);

    // 2. Havada uçuşan -$ tutar metni
    const floatPrice = this.add.text(startX, startY - 25, `-$${currentPrice}`, {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '26px',
      fontStyle: 'bold',
      color: '#f87171',
      stroke: '#000000',
      strokeThickness: 5
    }).setOrigin(0.5).setDepth(46);

    this.tweens.add({
      targets: floatPrice,
      y: floatPrice.y - 75,
      alpha: 0,
      duration: 750,
      ease: 'Cubic.easeOut',
      onComplete: () => floatPrice.destroy()
    });

    // 3. Paranın tezgâhın üstünde kasiyer Jed'e doğru kayma animasyonu
    this.tweens.add({
      targets: cashImg,
      x: 580,
      y: 380,
      scaleX: 0.55,
      scaleY: 0.55,
      rotation: -0.15,
      duration: 430,
      ease: 'Cubic.easeOut',
      onComplete: () => {
        // Para kasiyere ulaştı! "Cha-Ching!" sesi
        this.audioManager.playChaChing();

        // Tezgâhta paranın teslim edildiği noktada altın kıvılcımları patlaması
        const burst = this.add.particles(580, 380, 'particle_gold', {
          speed: { min: 80, max: 200 },
          scale: { start: 0.9, end: 0 },
          lifespan: 500,
          quantity: 14
        });
        this.time.delayedCall(500, () => burst.destroy());

        // Parayı söndürerek yok et
        this.tweens.add({
          targets: cashImg,
          alpha: 0,
          scaleX: 0.35,
          scaleY: 0.35,
          duration: 180,
          onComplete: () => cashImg.destroy()
        });

        // Bakiyeden düş ve envanter / geliştirmeyi uygula
        this.stateManager.deductGoldProportionally(currentPrice);
        this.stateManager.applyUpgrade(item.id);

        // Satın alınan tezgâhtaki eşyanın neşeli zıplama animasyonu
        const itemSprite = this.itemSprites[index];
        this.tweens.add({
          targets: itemSprite,
          scaleX: 1.25,
          scaleY: 1.25,
          yoyo: true,
          duration: 260,
          ease: 'Back.easeOut'
        });

        // Kasiyer Jed'in teşekkür konuşması
        this.updateJedSpeech(
          `"Eyvallah evlat! $${currentPrice} kasaya geçti. Güle güle kullanın, madende bol kazanç getirsin!"`,
          '#15803d'
        );

        // UI ve Plakaları güncelle
        this.refreshUI();
        this.isPaying = false;
      }
    });
  }

  /**
   * Yapay zeka buton görünümü yerine otantik 3D Western Arcade Butonu
   */
  private createNextLevelButton(): void {
    const nextLvl = this.stateManager.levelIndex + 1;

    const proceedNextLevel = () => {
      this.audioManager.playClick();
      this.stateManager.startLevel(nextLvl);
      this.scene.start('GameScene');
    };

    new ArcadeButton(
      this,
      640,
      650,
      `BÖLÜM ${nextLvl}'E BAŞLA →`,
      proceedNextLevel,
      {
        theme: 'gold',
        width: 440,
        height: 56,
        fontSize: '20px',
        subText: 'ENTER / SPACE İLE DE DEVAM EDEBİLİRSİNİZ'
      }
    );

    if (this.input.keyboard) {
      const enterKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
      enterKey.once('down', proceedNextLevel);

      const spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
      spaceKey.once('down', proceedNextLevel);
    }
  }

  private setupKeyboardControls(): void {
    if (!this.input.keyboard) return;

    const keyLeft = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT);
    const keyRight = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT);
    const keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    const keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);

    const onNav = (delta: number) => {
      this.unhighlightItem(this.selectedIndex);
      this.selectedIndex = (this.selectedIndex + delta + this.counterItems.length) % this.counterItems.length;
      this.highlightItem(this.selectedIndex);
      const item = this.counterItems[this.selectedIndex];
      this.updateJedSpeech(item.speech);
      this.audioManager.playClick();
    };

    keyLeft.on('down', () => onNav(-1));
    keyRight.on('down', () => onNav(1));
    keyA.on('down', () => onNav(-1));
    keyD.on('down', () => onNav(1));
  }

  private refreshUI(): void {
    const totalGold = this.stateManager.getTotalGold();
    const spendable = this.stateManager.getSpendableGold();
    const nextLvl = this.stateManager.levelIndex + 1;
    const nextTarget = GameConfig.level.targetGold(nextLvl);

    this.textTotalGold.setText(`ORTAK KASA: $${totalGold}`);
    this.textSpendableGold.setText(`Harcanabilir Fazlalık: $${spendable}`);
    this.textNextTarget.setText(`Gelecek Hedef: $${nextTarget}`);
    this.textDynamiteStock.setText(`🧨 ÇANTADAKİ DİNAMİT: ${this.stateManager.dynamiteCount} Adet`);

    this.counterItems.forEach((item, index) => {
      const tagContainer = this.itemPriceTags[index];
      if (!tagContainer) return;

      const priceText = tagContainer.getByName('priceText') as Phaser.GameObjects.Text;
      if (!priceText) return;

      const currentPrice = this.stateManager.getItemPrice(item.id);
      const isPurchased = !item.isStackable && this.stateManager.isUpgradePurchased(item.id);
      const canAfford = spendable >= currentPrice && !isPurchased;

      if (isPurchased) {
        priceText.setText('✓ ALINDI');
        priceText.setColor('#34d399');
      } else if (item.id === 'dynamite') {
        priceText.setText(`$${currentPrice} (${this.stateManager.dynamiteCount} Adet)`);
        priceText.setColor(canAfford ? '#fbbf24' : '#9ca3af');
      } else if (item.id === 'extra_time' && this.stateManager.upgrades.extra_time_count > 0) {
        priceText.setText(`$${currentPrice} (+${this.stateManager.upgrades.extra_time_count * 15}s)`);
        priceText.setColor(canAfford ? '#fbbf24' : '#9ca3af');
      } else {
        priceText.setText(`$${currentPrice}`);
        priceText.setColor(canAfford ? '#22c55e' : '#9ca3af');
      }
    });
  }
}
