/**
 * GameState.ts
 * Oyun boyunca sahneler arası taşınan kalıcı veri deposu (Data Store)
 * Oyuncu bakiyeleri, seviye bilgileri, satın alınan geliştirmeler
 */

import { GameConfig } from '../config/GameConfig';

export interface UpgradesState {
  strong_hook: boolean;      // extend & retract empty speed +20%
  gold_magnet: boolean;      // hitbox radius 8px -> 16px
  extra_time_count: number;  // stackable +15s per purchase
  lucky_clover: boolean;     // penalty weight halved
  diamond_polish: boolean;   // elmas değerleri 2 katına çıkar ($120 -> $240)
}

export interface DynamicShopPrice {
  price: number;
  basePrice: number;
  discountPercent: number;
}

export interface LevelStats {
  goldEarnedP1: number;
  goldEarnedP2: number;
  itemsCollected: Record<string, number>;
}

export class GameStateManager {
  private static instance: GameStateManager;

  public levelIndex: number = 1;
  public playerGold: Record<number, number> = {
    1: 0,
    2: 0
  };

  // İki oyuncu arasındaki rekabet ve çekişme için kümülatif kariyer kazancı
  public playerCareerGold: Record<number, number> = {
    1: 0,
    2: 0
  };

  public isControlsSwapped: boolean = false;
  public isManualAimMode: boolean = true;
  public dynamiteCount: number = 1; // Başlangıçta 1 adet hediye dinamit

  // Her bölüm markete girildiğinde dalgalanan dinamik fiyatlar
  public shopPrices: Record<string, DynamicShopPrice> = {};

  public toggleControlsSwap(): boolean {
    this.isControlsSwapped = !this.isControlsSwapped;
    return this.isControlsSwapped;
  }

  public toggleAimMode(): boolean {
    this.isManualAimMode = !this.isManualAimMode;
    return this.isManualAimMode;
  }

  public addDynamite(count: number = 1): void {
    this.dynamiteCount += count;
  }

  public useDynamite(): boolean {
    if (this.dynamiteCount > 0) {
      this.dynamiteCount -= 1;
      return true;
    }
    return false;
  }

  // Bölüm başında kayıtlı olan altın (Bölüm başarısız olursa geri dönülecek bakiye)
  public goldAtLevelStart: Record<number, number> = {
    1: 0,
    2: 0
  };

  public upgrades: UpgradesState = {
    strong_hook: false,
    gold_magnet: false,
    extra_time_count: 0,
    lucky_clover: false,
    diamond_polish: false,
  };

  public currentLevelStats: LevelStats = {
    goldEarnedP1: 0,
    goldEarnedP2: 0,
    itemsCollected: {}
  };

  private constructor() {
    this.resetGame();
  }

  public static getInstance(): GameStateManager {
    if (!GameStateManager.instance) {
      GameStateManager.instance = new GameStateManager();
    }
    return GameStateManager.instance;
  }

  public resetGame(): void {
    this.levelIndex = 1;
    this.playerGold = { 1: 0, 2: 0 };
    this.playerCareerGold = { 1: 0, 2: 0 };
    this.goldAtLevelStart = { 1: 0, 2: 0 };
    this.dynamiteCount = 1;
    this.upgrades = {
      strong_hook: false,
      gold_magnet: false,
      extra_time_count: 0,
      lucky_clover: false,
      diamond_polish: false,
    };
    this.generateShopPrices();
    this.resetLevelStats();
  }

  /**
   * Market için rastgele dalgalanan dinamik fiyatlar üretir
   */
  public generateShopPrices(): void {
    GameConfig.shopItems.forEach(item => {
      const min = item.minPrice || Math.round(item.price * 0.75);
      const max = item.maxPrice || Math.round(item.price * 1.35);
      // Fiyatı 5'in katlarına yuvarla (doğal para hissi)
      const rawPrice = Phaser.Math.Between(min, max);
      const randomizedPrice = Math.round(rawPrice / 5) * 5;
      const discountPercent = Math.round(((randomizedPrice - item.price) / item.price) * 100);

      this.shopPrices[item.id] = {
        price: randomizedPrice,
        basePrice: item.price,
        discountPercent: discountPercent
      };
    });
  }

  public getItemPrice(itemId: string): number {
    return this.shopPrices[itemId]?.price || GameConfig.shopItems.find(i => i.id === itemId)?.price || 50;
  }

  public getItemDiscountPercent(itemId: string): number {
    return this.shopPrices[itemId]?.discountPercent || 0;
  }

  public resetLevelStats(): void {
    this.currentLevelStats = {
      goldEarnedP1: 0,
      goldEarnedP2: 0,
      itemsCollected: {}
    };
  }

  public startLevel(level: number): void {
    this.levelIndex = level;
    // Bölüm başlangıç bakiyelerini kaydet
    this.goldAtLevelStart[1] = this.playerGold[1];
    this.goldAtLevelStart[2] = this.playerGold[2];
    this.generateShopPrices();
    this.resetLevelStats();
  }

  public retryCurrentLevel(): void {
    // Bölüm başarısız olduğunda o bölümde toplanan altınlar silinir
    this.playerGold[1] = this.goldAtLevelStart[1];
    this.playerGold[2] = this.goldAtLevelStart[2];
    this.resetLevelStats();
  }

  public getTotalGold(): number {
    return this.playerGold[1] + this.playerGold[2];
  }

  public getTargetGoldForCurrentLevel(): number {
    return GameConfig.level.targetGold(this.levelIndex);
  }

  public getDurationSecondsForCurrentLevel(): number {
    const baseDuration = GameConfig.level.durationSeconds(this.levelIndex);
    const bonusTime = this.upgrades.extra_time_count * 15;
    return baseDuration + bonusTime;
  }

  public addGold(playerId: number, amount: number, itemType?: string): void {
    const current = this.playerGold[playerId] || 0;
    const newAmount = Math.max(0, current + amount);
    const delta = newAmount - current;
    this.playerGold[playerId] = newAmount;

    // Kariyer / çekişme rekabet puanı
    if (amount > 0) {
      this.playerCareerGold[playerId] = (this.playerCareerGold[playerId] || 0) + amount;
    }

    if (playerId === 1) {
      this.currentLevelStats.goldEarnedP1 += delta;
    } else {
      this.currentLevelStats.goldEarnedP2 += delta;
    }

    if (itemType) {
      this.currentLevelStats.itemsCollected[itemType] = (this.currentLevelStats.itemsCollected[itemType] || 0) + 1;
    }
  }

  /**
   * Bölüm 7 & Kullanıcı İsteği:
   * Dükkanda harcanabilir para = (Toplam Para - Mevcut Bölüm Hedefi)
   */
  public getSpendableGold(): number {
    const total = this.getTotalGold();
    const currentTarget = this.getTargetGoldForCurrentLevel();
    return Math.max(0, total - currentTarget);
  }

  /**
   * Dükkanda satın alım yapıldığında harcanan tutar iki oyuncunun cebinden
   * bakiyeleri oranında (veya eşitçe) düşülerek ortak bakiye dengelenir.
   */
  public deductGoldProportionally(cost: number): boolean {
    const total = this.getTotalGold();
    if (total < cost) return false;

    // Bakiyelere göre oranla
    if (total === 0) return false;

    const ratioP1 = this.playerGold[1] / total;
    let deductP1 = Math.round(cost * ratioP1);
    let deductP2 = cost - deductP1;

    // Sınır kontrolleri
    if (deductP1 > this.playerGold[1]) {
      deductP1 = this.playerGold[1];
      deductP2 = cost - deductP1;
    } else if (deductP2 > this.playerGold[2]) {
      deductP2 = this.playerGold[2];
      deductP1 = cost - deductP2;
    }

    this.playerGold[1] = Math.max(0, this.playerGold[1] - deductP1);
    this.playerGold[2] = Math.max(0, this.playerGold[2] - deductP2);

    return true;
  }

  public applyUpgrade(itemId: string): boolean {
    switch (itemId) {
      case 'dynamite':
        this.addDynamite(1);
        return true;
      case 'strong_hook':
        this.upgrades.strong_hook = true;
        return true;
      case 'diamond_polish':
        this.upgrades.diamond_polish = true;
        return true;
      case 'gold_magnet':
        this.upgrades.gold_magnet = true;
        return true;
      case 'extra_time':
        this.upgrades.extra_time_count += 1;
        return true;
      case 'lucky_clover':
        this.upgrades.lucky_clover = true;
        return true;
      default:
        return false;
    }
  }

  public isUpgradePurchased(itemId: string): boolean {
    if (itemId === 'extra_time' || itemId === 'dynamite') return false; // stackable
    return !!(this.upgrades as any)[itemId];
  }
}
