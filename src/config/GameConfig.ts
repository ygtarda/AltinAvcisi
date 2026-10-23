/**
 * GameConfig.ts
 * Altın Avcısı - Tüm oyun sabitleri, formülleri ve konfigürasyon değerleri
 */

export interface EntityTypeConfig {
  type: string;
  textureKey: string;
  name: string;
  width: number;
  height: number;
  value: number;
  weight: number;
  baseProbability: number;
  description?: string;
}

export interface ShopItemConfig {
  id: string;
  name: string;
  price: number;
  minPrice: number;
  maxPrice: number;
  description: string;
  stackable: boolean;
  effect: string;
}

export const GameConfig = {
  display: {
    width: 1280,
    height: 720,
    skyHeightRatio: 0.18,
    groundTopY: 135,      // Oyuncular aşağı indirildi (üst bara sıkışma engellendi)
    minSpawnDistance: 14,
  },

  // Oyuncu ve Kanca Ayarları (Ortada yan yana madenci makara istasyonları)
  players: {
    p1: {
      id: 1,
      name: 'Oyuncu 1 (Sol)',
      keyName: 'WASD (S: Fırlat, W: Dinamit)',
      color: 0x3b82f6,
      colorHex: '#3b82f6',
      pivot: { x: 530, y: 195 },
      swingPhaseOffset: 0,
    },
    p2: {
      id: 2,
      name: 'Oyuncu 2 (Sağ)',
      keyName: 'Ok Tuşları (↓: Fırlat, ↑: Dinamit)',
      color: 0xef4444,
      colorHex: '#ef4444',
      pivot: { x: 750, y: 195 },
      swingPhaseOffset: Math.PI / 2,
    }
  },

  // Kanca Fiziği
  hook: {
    maxSwingAngle: Math.PI / 3, // 60 derece
    swingSpeed: 1.2,            // radyan / saniye
    manualAimSpeed: 1.8,        // radyan / saniye (manuel nişan alma hızı)
    extendSpeed: 650,           // px / sn
    retractSpeedEmpty: 900,     // px / sn
    retractSpeedLoadedDivider: 500,
    minRetractSpeed: 40,
    maxLength: 580,
    hitboxRadius: 10,
    tntBlastRadius: 130,        // TNT zincirleme patlama etki yarıçapı (px)
  },

  // Nesne Tipleri (Farklı Boyutlarda Taşlar, TNT Fıçısı ve Hareketli Vagonlar)
  entities: {
    small_rock: {
      type: 'small_rock',
      textureKey: 'rock',
      name: 'Küçük Taş',
      width: 26,
      height: 26,
      value: 1,
      weight: 1.0,
      baseProbability: 0.16,
      description: 'Hafif küçük taş'
    },
    medium_rock: {
      type: 'medium_rock',
      textureKey: 'rock',
      name: 'Orta Taş',
      width: 38,
      height: 38,
      value: 2,
      weight: 2.0,
      baseProbability: 0.12,
      description: 'Orta büyüklükte kaya'
    },
    big_rock: {
      type: 'big_rock',
      textureKey: 'rock',
      name: 'Büyük Taş',
      width: 52,
      height: 52,
      value: 3,
      weight: 3.2,
      baseProbability: 0.08,
      description: 'Ağır kaya kütlesi'
    },
    huge_rock: {
      type: 'huge_rock',
      textureKey: 'rock',
      name: 'Dev Kaya',
      width: 68,
      height: 68,
      value: 5,
      weight: 4.8,
      baseProbability: 0.04,
      description: 'Çok ağır devasa kaya'
    },
    small_gold: {
      type: 'small_gold',
      textureKey: 'gold_nugget',
      name: 'Küçük Altın',
      width: 32,
      height: 32,
      value: 15,
      weight: 1.5,
      baseProbability: 0.20,
      description: 'Standart hedef'
    },
    medium_gold: {
      type: 'medium_gold',
      textureKey: 'gold_nugget',
      name: 'Orta Altın',
      width: 48,
      height: 48,
      value: 40,
      weight: 3.0,
      baseProbability: 0.14,
      description: 'Dengeli ödül ve ağırlık'
    },
    big_gold: {
      type: 'big_gold',
      textureKey: 'gold_nugget',
      name: 'Büyük Altın',
      width: 68,
      height: 68,
      value: 90,
      weight: 5.5,
      baseProbability: 0.07,
      description: 'En yavaş çekilenlerden, yüksek ödül'
    },
    diamond: {
      type: 'diamond',
      textureKey: 'diamond',
      name: 'Elmas',
      width: 28,
      height: 28,
      value: 120,
      weight: 1.2,
      baseProbability: 0.08,
      description: 'Küçük ama çok değerli, hafif ve hızlı'
    },
    mystery_box: {
      type: 'mystery_box',
      textureKey: 'mystery_box',
      name: 'Soru İşareti Kutusu',
      width: 36,
      height: 36,
      value: 0,
      weight: 1.8,
      baseProbability: 0.06,
      description: 'Gizemli kutu, yakalanınca rastgele olay'
    },
    tnt: {
      type: 'tnt',
      textureKey: 'tnt_barrel',
      name: 'TNT Fıçısı',
      width: 52,
      height: 72,
      value: -30,
      weight: 1.0,
      baseProbability: 0.05,
      description: 'Patlayıcı fıçı! Çarparsa zincirleme patlama yaratır'
    },
    cart_diamond: {
      type: 'cart_diamond',
      textureKey: 'cart_diamond',
      name: 'Elmaslı Penguen',
      width: 70,
      height: 86,
      value: 300,
      weight: 3.0,
      baseProbability: 0,
      description: 'Kucağında parıldayan büyük elmas taşıyan hareketli sevimli penguen'
    },
    cart_tnt: {
      type: 'cart_tnt',
      textureKey: 'cart_tnt',
      name: 'Dinamitli Penguen',
      width: 70,
      height: 86,
      value: -40,
      weight: 1.0,
      baseProbability: 0,
      description: 'Kucağında fitili ateşlenmiş dinamit taşıyan hareketli penguen'
    }
  } as Record<string, EntityTypeConfig>,

  mysteryBox: {
    outcomes: [
      { id: 'jackpot', name: 'Büyük İkramiye!', gold: 80, timeBonus: 0, weight: 1.0 },
      { id: 'small_bonus', name: 'Küçük Bonus', gold: 25, timeBonus: 0, weight: 1.0 },
      { id: 'empty', name: 'Kutu Boş Çıktı!', gold: 0, timeBonus: 0, weight: 1.0 },
      { id: 'penalty', name: 'Tuzak! Ceza', gold: -20, timeBonus: 0, weight: 1.0 },
      { id: 'time_bonus', name: 'Zaman Bonusu! (+10s)', gold: 0, timeBonus: 10, weight: 1.0 }
    ]
  },

  level: {
    // Kademeli dengeli ekonomi: 1. seviyede 120, 2. seviyede 220, ardından +120
    targetGold: (levelIndex: number) => {
      if (levelIndex === 1) return 120;
      if (levelIndex === 2) return 220;
      return 220 + (levelIndex - 2) * 120;
    },
    // Tempolu ve heyecanlı 45s başlangıç
    durationSeconds: (levelIndex: number) => Math.max(35, 48 - (levelIndex - 1) * 2),
    entityCount: (levelIndex: number) => Math.min(26, 14 + levelIndex * 2),
    tntProbability: (levelIndex: number) => levelIndex === 1 ? 0 : Math.min(0.12, 0.03 + levelIndex * 0.01),
    movingCartsCount: (levelIndex: number) => levelIndex === 1 ? 0 : Math.min(3, 1 + Math.floor((levelIndex - 2) / 2))
  },

  // Çeşitlendirilmiş ve Değişken Fiyat Aralıklı Market Eşyaları
  shopItems: [
    {
      id: 'dynamite',
      name: 'Dinamit Lokumu 🧨',
      price: 45,
      minPrice: 30,
      maxPrice: 60,
      description: 'Ağır kayaları anında patlatıp zaman kazandırır! P1: W tuşu, P2: ↑ tuşu ile fırlatır.',
      stackable: true,
      effect: 'dynamite_inventory'
    },
    {
      id: 'strong_hook',
      name: 'Kuvvet İksiri 🧪',
      price: 80,
      minPrice: 65,
      maxPrice: 105,
      description: 'Kanca fırlatma ve boş çekilme hızı %20 artar.',
      stackable: false,
      effect: 'extend_retract_speed_boost'
    },
    {
      id: 'diamond_polish',
      name: 'Elmas Cilası 💎',
      price: 85,
      minPrice: 70,
      maxPrice: 110,
      description: 'Gelecek bölümdeki elmasların değerini tam 2 katına çıkarır ($120 → $240)!',
      stackable: false,
      effect: 'diamond_value_doubler'
    },
    {
      id: 'gold_magnet',
      name: 'Altın Mıknatısı 🧲',
      price: 100,
      minPrice: 80,
      maxPrice: 130,
      description: 'Kanca ucunun yakalama alanı 2 katına çıkar (10px → 20px).',
      stackable: false,
      effect: 'hitbox_boost'
    },
    {
      id: 'extra_time',
      name: 'Ek Süre Saati ⏱',
      price: 40,
      minPrice: 25,
      maxPrice: 55,
      description: 'Bir sonraki bölüme +15 saniye ek süre kazandırır.',
      stackable: true,
      effect: 'time_boost'
    },
    {
      id: 'lucky_clover',
      name: 'Şans Yoncası 🍀',
      price: 70,
      minPrice: 50,
      maxPrice: 90,
      description: 'Gizemli kutularda ceza çıkma ihtimali kalıcı olarak yarıya iner.',
      stackable: false,
      effect: 'mystery_lucky_boost'
    }
  ] as ShopItemConfig[]
};
