/**
 * LevelGenerator.ts
 * Prosedürel bölüm üretimi: Farklı boyutlarda taşlar, altınlar, elmaslar ve
 * zincirleme patlamaya hazır TNT kümeleri üretir.
 */

import Phaser from 'phaser';
import { GameConfig } from '../config/GameConfig';
import { MiningEntity } from '../entities/Entity';
import { MovingCart } from '../entities/MovingCart';

export class LevelGenerator {
  public static generateLevel(scene: Phaser.Scene, levelIndex: number): MiningEntity[] {
    const entityCount = GameConfig.level.entityCount(levelIndex);
    const tntProb = GameConfig.level.tntProbability(levelIndex);

    const probabilities = LevelGenerator.calculateProbabilities(levelIndex, tntProb);

    const entities: MiningEntity[] = [];
    const placedBoxes: Phaser.Geom.Rectangle[] = [];

    const minX = 70;
    const maxX = 1210;
    // Pivotlar y=195'te rayların üzerinde olduğu için nesneler y=265 altında toprak katmanlarında spawn edilir
    const minY = 265;
    const maxY = 670;
    const minSpacing = GameConfig.display.minSpawnDistance;

    for (let i = 0; i < entityCount; i++) {
      const typeKey = LevelGenerator.pickRandomEntityType(probabilities);
      const entityConfig = GameConfig.entities[typeKey];

      let placed = false;
      let x = 0;
      let y = 0;

      for (let attempt = 0; attempt < 65; attempt++) {
        x = Phaser.Math.Between(minX + entityConfig.width / 2, maxX - entityConfig.width / 2);

        if (typeKey === 'diamond' || typeKey === 'big_gold') {
          // Değerli madenler daha derinlerde
          y = Phaser.Math.Between(minY + 160, maxY - entityConfig.height / 2);
        } else {
          y = Phaser.Math.Between(minY + entityConfig.height / 2, maxY - entityConfig.height / 2);
        }

        const candidateBox = new Phaser.Geom.Rectangle(
          x - entityConfig.width / 2 - minSpacing,
          y - entityConfig.height / 2 - minSpacing,
          entityConfig.width + minSpacing * 2,
          entityConfig.height + minSpacing * 2
        );

        let overlap = false;
        for (const existing of placedBoxes) {
          if (Phaser.Geom.Intersects.RectangleToRectangle(candidateBox, existing)) {
            overlap = true;
            break;
          }
        }

        if (!overlap) {
          placedBoxes.push(new Phaser.Geom.Rectangle(
            x - entityConfig.width / 2,
            y - entityConfig.height / 2,
            entityConfig.width,
            entityConfig.height
          ));
          placed = true;
          break;
        }
      }

      if (placed) {
        const entity = new MiningEntity(scene, x, y, entityConfig);
        entities.push(entity);

        // İleri bölümlerde (Seviye 2+) TNT çıktığında bazen yanına ikinci bir TNT koyarak
        // oyuncuların zincirleme patlama yapabileceği kümeler oluştur
        if (typeKey === 'tnt' && levelIndex >= 2 && Math.random() < 0.45 && entities.length < entityCount) {
          const clusterAngle = Math.random() * Math.PI * 2;
          const clusterDist = Phaser.Math.Between(60, 95);
          const cx = Phaser.Math.Clamp(x + Math.cos(clusterAngle) * clusterDist, minX + 25, maxX - 25);
          const cy = Phaser.Math.Clamp(y + Math.sin(clusterAngle) * clusterDist, minY + 25, maxY - 25);

          const clusterCandidate = new Phaser.Geom.Rectangle(cx - 20, cy - 20, 40, 40);
          let clusterOverlap = false;
          for (const existing of placedBoxes) {
            if (Phaser.Geom.Intersects.RectangleToRectangle(clusterCandidate, existing)) {
              clusterOverlap = true;
              break;
            }
          }

          if (!clusterOverlap) {
            placedBoxes.push(clusterCandidate);
            const chainedTnt = new MiningEntity(scene, cx, cy, GameConfig.entities['tnt']);
            entities.push(chainedTnt);
          }
        }
      }
    }

    // Kullanıcı İsteği: "Bazı bölümlerde yatay eksende sağa sola rastgele gidip gelen ufak vagonlar olsun,
    // bazısının içinde tnt bazen içinde elmas olsun"
    const movingCartsCount = GameConfig.level.movingCartsCount(levelIndex);
    for (let c = 0; c < movingCartsCount; c++) {
      // 0: Elmaslı vagon, 1: TNT vagonu
      const cartType = (c % 2 === 0) ? 'cart_diamond' : 'cart_tnt';
      const cartCfg = GameConfig.entities[cartType];
      const startX = Phaser.Math.Between(150, 1100);
      const trackY = 360 + c * 125;
      const speed = Phaser.Math.Between(105, 140);

      const movingCart = new MovingCart(scene, startX, trackY, cartCfg, speed);
      entities.push(movingCart);
    }

    return entities;
  }

  private static calculateProbabilities(levelIndex: number, tntProb: number): Record<string, number> {
    if (levelIndex === 1) {
      // 1. Bölüm: Sıfır elmas, sıfır dev altın! Yalnızca küçük ve orta altınlar ile taşlar.
      return {
        small_rock: 0.32,
        medium_rock: 0.18,
        big_rock: 0.04,
        huge_rock: 0.0,
        small_gold: 0.34,
        medium_gold: 0.12,
        big_gold: 0.0,
        diamond: 0.0,
        mystery_box: 0.0,
        tnt: 0.0
      };
    }

    if (levelIndex === 2) {
      // 2. Bölüm: Sıfır elmas, ilk büyük altınlar ve gizemli kutular sahneye çıkar.
      return {
        small_rock: 0.26,
        medium_rock: 0.18,
        big_rock: 0.08,
        huge_rock: 0.02,
        small_gold: 0.26,
        medium_gold: 0.15,
        big_gold: 0.05,
        diamond: 0.0,
        mystery_box: 0.04,
        tnt: tntProb
      };
    }

    // 3. Bölüm ve Sonrası: Elmaslar ve dev altın madenleri derinlerde belirir
    const diamondRate = Math.min(0.12, 0.05 + (levelIndex - 3) * 0.015);
    const bigGoldRate = Math.min(0.14, 0.08 + (levelIndex - 3) * 0.015);

    return {
      small_rock: 0.18,
      medium_rock: 0.14,
      big_rock: 0.08,
      huge_rock: 0.04,
      small_gold: 0.18,
      medium_gold: 0.14,
      big_gold: bigGoldRate,
      diamond: diamondRate,
      mystery_box: 0.05,
      tnt: tntProb
    };
  }

  private static pickRandomEntityType(probabilities: Record<string, number>): string {
    const entries = Object.entries(probabilities);
    const totalWeight = entries.reduce((acc, [, w]) => acc + w, 0);

    let rand = Math.random() * totalWeight;
    for (const [key, weight] of entries) {
      if (rand < weight) {
        return key;
      }
      rand -= weight;
    }

    return 'small_gold';
  }
}
