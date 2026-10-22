# ⛏️ Altın Avcısı — 2 Oyunculu Yerel Kooperatif Web Oyunu

Nostaljik flash klasiği **Altın Avcısı (Gold Miner)** deneyimini modern web standartlarına, yüksek çözünürlüklü AAA grafiklere, harmonik sarkaç fizik motoruna ve iki oyunculu zengin kooperatif mekaniklerine taşıyan yeni nesil arcade web oyunu.

[![Phaser 3](https://img.shields.io/badge/Engine-Phaser%203.90-brightgreen.svg)](https://phaser.io/)
[![TypeScript](https://img.shields.io/badge/Language-TypeScript%205.4-blue.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Bundler-Vite%205-purple.svg)](https://vitejs.dev/)
[![Web Audio API](https://img.shields.io/badge/Audio-Synthesized%20Web%20Audio-orange.svg)](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
[![Platform](https://img.shields.io/badge/Platform-Web%20%7C%20Desktop%20%7C%20Touch-yellow.svg)]()

---

## 🌟 Öne Çıkan Özellikler

### 👥 1. İki Oyunculu Yerel Kooperatif & Tatlı Rekabet
- İki madenci tek bir klavyede yan yana maden çıkarma istasyonlarında çalışır.
- Ortak bir kasa hedefi vardır (bölümü geçmek için gereken toplam tutar).
- Her madencinin kazandığı para doğrudan kendi istasyonunun altında anlık olarak yansıtılır; ortak hedefe koşarken aynı zamanda oyuncular arasında eğlenceli bir rekabet doğar.

### ⚙️ 2. Mekanik Makara Sistemi & Zengin Karakter İfadeleri
- Madenciler vagon yerine raylar üzerindeki endüstriyel ahşap-çelik makara (**winch**) makinelerinin başında durur.
- **Dinamik Karakter Durumları:**
  - **Sakin Bekleme (Idle):** Nefes alma ve odaklanma salınımı.
  - **Hızlı Sarma (Crank):** Kanca fırlatıldığında veya hafif yük/boş çekilirken makara kolunu seri çevirme.
  - **Ağır Yükte Zorlanma (Strain):** Dev kayalar ve ağır madenler çekilirken madencinin yüzü kızarır, dişlerini sıkar, vücudu geriye yatar ve alnından gerçekçi ter partikülleri fışkırır!
  - **Sevinç Zıplaması (Celebrate):** Başarılı maden tesliminde kutlama zıplaması.

### 🎯 3. Harmonik Sarkaç Fiziği & Sabit Yenilenme (Reset Cooldown)
- Kancalar eksen etrafında fiziksel sarkaç formülleriyle pürüzsüzce salınır.
- Bir maden teslim edildiğinde veya kanca boş döndüğünde, ekranda gereksiz yazı belirmeden ~0.8 saniyelik **sabit yenilenme süresi** devreye girer. Kanca tepede sabit durur, ardından baştan pürüzsüzce salınmaya devam eder.

### 🌍 4. 5 Farklı Tematik Yeraltı Haritası
Her bölüme geçildiğinde atmosfer otomatik olarak değişir. Tüm haritalarda zemin hattı ray seviyesiyle (`y = 198`) kusursuz hizalanmıştır:
1. **Klasik Altın Dağları:** Sarı-kahverengi zengin altın damarları ve kanyon manzarası.
2. **Yeşil Alp Vadisi:** Çam ormanları, açık çayırlar ve verimli koyu toprak katmanları.
3. **Kızıl Kanyon:** Sıcak terrakotta kumu, kızıl kayalıklar ve çöl madenleri.
4. **Buzul Doruklar:** Kar fırtınası, kutup ışıkları ve donmuş mavi permafrost katmanları.
5. **Volkanik Obsidyen:** Aktif lav nehirleri, siyah obsidyen doruklar ve magma damarları.

### 🛒 5. Etkileşimli Tezgah & Madenci Marketi
- Sıradan kartlar yerine **canlı tezgah üstü eşyalar**: Fare ile üzerine gelindiğinde dükkan sahibi madenci konuşma balonuyla ürünün faydasını anlatır.
- **Dinamik Piyasa:** Ürün fiyatları her bölümde sabit kalmaz; belirli aralıklarda piyasa dalgalanması yaşar.
- **Nakit Ödeme Animasyonu:** Satın alma tıklandığında para kesesi tezgahın üzerine uzatılır ve ortak kasadan düşülür.
- **Yükseltmeler:**
  - 🧨 **Dinamit Lokumu:** Ağır kayaları patlatıp zaman kurtarır.
  - 🧪 **Kuvvet İksiri:** Kancanın çekiş gücünü ve hızını %20 artırır.
  - 🍀 **Şanslı Yonca:** Soru işareti kutularından olumsuz tuzak çıkma ihtimalini düşürür.
  - 🧲 **Maden Mıknatısı:** Kancanın yakalama etki yarıçapını 2 katına çıkarır.
  - 💎 **Elmas Cilası:** Toplanan tüm elmasların değerini kalıcı olarak 2 katına katlar ($120 $\rightarrow$ $240).
  - ⏱️ **Köstebek Saati:** Bir sonraki bölüme fazladan +12 saniye süre ekler.

### 🧨 6. Görsel Dinamit İstifi & Zincirleme TNT Patlamaları
- Dinamit miktarı üst barda sayı yazmak yerine, **madenci platformunun kenarında fiziksel olarak istiflenir**. Kullanıldıkça birer birer eksilir.
- Kanca bir TNT fıçısına çarparsa, şok dalgası çevredeki nesneleri yok eder ve yakınındaki diğer TNT'leri tetikleyerek **zincirleme patlama (chain reaction)** oluşturur.
- Madenciyi siyaha boyayan rahatsız edici efektler kaldırılmıştır; karakterler temiz kalır.

### 🚃 7. Hareketli Devriye Vagonları
- İleri seviyelerde katmanlar arasında yatayda devriye gezen kompakt maden vagonları:
  - 💎 **Elmas Vagonu:** Yakalandığında yüksek kazanç ($300).
  - 💥 **TNT Vagonu:** Yakalanırsa patlar ve etrafındaki madenleri de havaya uçurur.

### 📊 8. Kademeli Bölüm Ekonomisi
- **1. Seviye:** Sıfır elmas, sıfır TNT, sıfır dev külçe. Yalnızca küçük/orta külçeler ve taşlar (Hedef: $120). Oyuncuların mekaniklere alışması sağlanır.
- **2. Seviye:** Büyük külçeler, gizemli soru işareti kutuları ve tek bir devriye vagonu (Hedef: $220).
- **3+ Seviye:** Derinlerde parıldayan elmaslar, TNT zincirleri ve zorlu hedefler açılır.

### 🖥️ 9. Ultra Temiz HUD & Görsel Netlik
- **Üst Bar:** Solda *Ortak Kasa & Hedef*, ortada sade *Bölüm No*, sağda *Kalan Süre*.
- **Madenci Altı:** Yalnızca o madencinin topladığı net dolar miktarı (kutu, etiket veya lider yazısı olmadan sade ve şık).
- **Görüntü Netliği:** Yüksek çözünürlüklü Retina ekranlarda dahi pikselleşme olmadan pürüzsüz bilinear anti-aliasing filtreleme.

---

## 🎮 Kontroller

| Eylem | Oyuncu 1 (Mavi Madenci) | Oyuncu 2 (Kırmızı Madenci) | Mobil / Dokunmatik |
| :--- | :---: | :---: | :---: |
| **Kanca Fırlat** | `S` veya `Boşluk (Space)` | `Aşağı Ok (↓)` | `SOL P1` / `SAĞ P2` Butonları |
| **Dinamit At** | `W` (Kaya çekerken) | `Yukarı Ok (↑)` (Kaya çekerken) | — |
| **Sesi Aç / Kapat** | Ekranın sağ üst köşesindeki `🔊` / `🔇` simgesine tıklayın |

---

## 🛠️ Teknoloji Yığını ve Mimari

```
AltinAvcisi/
├── public/
│   └── assets/              # Yüksek çözünürlüklü 1280x720 haritalar ve sprite'lar
├── src/
│   ├── config/
│   │   └── GameConfig.ts    # Denge parametreleri, nesne tipleri, market eşyaları
│   ├── entities/
│   │   ├── Entity.ts        # Maden, taş, kutu ve patlayıcı sınıfları
│   │   ├── Hook.ts          # Kanca fiziği, sarkaç matematiği, vinç & madenci animasyonu
│   │   └── MovingCart.ts    # Yatay devriye gezen elmas/TNT vagonları
│   ├── scenes/
│   │   ├── BootScene.ts     # Asset yükleyici ve hazırlık
│   │   ├── MenuScene.ts     # Başlangıç menüsü ve kılavuz
│   │   ├── GameScene.ts     # Ana oyun döngüsü, çarpışmalar, zincirleme patlama & HUD
│   │   ├── LevelCompleteScene.ts # Bölüm başarı ve skor paneli
│   │   ├── LevelFailedScene.ts   # Başarısızlık ve yeniden deneme
│   │   └── ShopScene.ts     # İnteraktif tezgah ve madenci marketi
│   ├── state/
│   │   └── GameState.ts     # Singleton bakiye, envanter, kariyer ve seviye durumu
│   ├── systems/
│   │   ├── AudioManager.ts  # Web Audio API temelli sentetik ses efektleri
│   │   ├── InputHandler.ts  # Çift oyunculu klavye dinleyicisi
│   │   ├── LevelGenerator.ts# Prosedürel maden, taş ve vagon dağıtıcısı
│   │   └── TextureGenerator.ts # Parçacık ve yardımcı doku üreticisi
│   ├── main.ts              # Phaser 3 başlatma ve ölçekleme ayarları
│   └── style.css            # Responsive düzen ve modern tipografi
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

---

## 🚀 Kurulum ve Çalıştırma

Projeyi yerel makinenizde çalıştırmak için Node.js (v18+) gereklidir.

```bash
# 1. Proje dizinine gidin
cd AltinAvcisi

# 2. Bağımlılıkları yükleyin
npm install

# 3. Geliştirme sunucusunu başlatın
npm run dev
```

Sunucu başladıktan sonra tarayıcınızda şu adresi açın:
```
http://localhost:3000/
```

### 📦 Prodüksiyon Derlemesi
```bash
# TypeScript doğrulaması ve optimize bundle üretimi
npm run build

# Derlenen paketi yerelde önizleyin
npm run preview
```

---

## 🔊 Ses Motoru Notları
Oyun harici büyük ses dosyaları indirmez. **Web Audio API** (`OscillatorNode`, `GainNode`, `BiquadFilterNode` ve gürültü arabellekleri) kullanarak tüm sesleri dinamik olarak sentezler:
- Halat fırlatma rüzgarı (whoosh)
- Metal kancanın madene kilitlenme tıkırtısı (clink)
- Altın kasaya ulaştığında çalan yazar kasa tınlaması (cha-ching)
- TNT ve dinamit için derin sub-bass deprem patlaması
- Seviye tamamlama fanfarı ve başarısızlık melodisi

---

## 📄 Lisans
Bu proje, Webnex Staj Ar-Ge ve Test çalışmaları kapsamında eğitim ve araştırma amacıyla geliştirilmiştir. Tüm hakları saklıdır.
