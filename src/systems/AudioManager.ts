/**
 * AudioManager.ts
 * Web Audio API tabanlı, harici ses dosyası gerektirmeyen programatik ses yöneticisi.
 * Bölüm 9 gereksinimleri: whoosh, catch, cha-ching, tnt explosion, victory, fail, click
 */

export class AudioManager {
  private static instance: AudioManager;
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;

  private constructor() {
    // AudioContext ilk kullanıcı etkileşiminde başlatılmalıdır (tarayıcı autoplay politikası)
    this.initContext();
  }

  public static getInstance(): AudioManager {
    if (!AudioManager.instance) {
      AudioManager.instance = new AudioManager();
    }
    return AudioManager.instance;
  }

  private initContext(): void {
    if (!this.ctx) {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtxClass) {
        this.ctx = new AudioCtxClass();
      }
    }
  }

  public resumeContext(): void {
    this.initContext();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    return this.isMuted;
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  /**
   * Kanca fırlatma anında rüzgar/hızlı atılma sesi (Whoosh - frekans düşüşü)
   */
  public playWhoosh(): void {
    if (this.isMuted) return;
    this.resumeContext();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      const now = this.ctx.currentTime;

      osc.frequency.setValueAtTime(450, now);
      osc.frequency.exponentialRampToValueAtTime(80, now + 0.22);

      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.23);
    } catch (e) {
      // Ses hatası oyunu durdurmamalı
    }
  }

  /**
   * Kanca nesneye çarptığında madeni/tok çarpma sesi (Catch)
   */
  public playCatch(): void {
    if (this.isMuted) return;
    this.resumeContext();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      const now = this.ctx.currentTime;

      osc.frequency.setValueAtTime(1100, now);
      osc.frequency.exponentialRampToValueAtTime(350, now + 0.12);

      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.13);
    } catch (e) {
      // ignore
    }
  }

  /**
   * Altın/elmas çekilip cebe girince şık "cha-ching" tınısı
   */
  public playChaChing(): void {
    if (this.isMuted) return;
    this.resumeContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const notes = [987.77, 1318.51, 1567.98]; // B5 -> E6 -> G6

      notes.forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        const startTime = now + idx * 0.07;
        const duration = 0.25;

        osc.frequency.setValueAtTime(freq, startTime);
        gain.gain.setValueAtTime(0.2, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + duration + 0.02);
      });
    } catch (e) {
      // ignore
    }
  }

  /**
   * TNT patlaması: Gürültülü patlama + derin bas darbesi (Noise burst + sub-bass)
   */
  public playExplosion(): void {
    if (this.isMuted) return;
    this.resumeContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const bufferSize = this.ctx.sampleRate * 0.6;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);

      // Beyaz gürültü üretimi
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(800, now);
      filter.frequency.exponentialRampToValueAtTime(60, now + 0.55);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.6, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.55);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      noise.start(now);
      noise.stop(now + 0.58);

      // Sub-bass gövdesi
      const subOsc = this.ctx.createOscillator();
      const subGain = this.ctx.createGain();
      subOsc.type = 'sine';
      subOsc.frequency.setValueAtTime(130, now);
      subOsc.frequency.exponentialRampToValueAtTime(30, now + 0.5);

      subGain.gain.setValueAtTime(0.5, now);
      subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

      subOsc.connect(subGain);
      subGain.connect(this.ctx.destination);

      subOsc.start(now);
      subOsc.stop(now + 0.52);
    } catch (e) {
      // ignore
    }
  }

  /**
   * Yetersiz bakiye veya geçersiz işlem durumunda negatif uyarı sesi
   */
  public playErrorBuzz(): void {
    if (this.isMuted) return;
    this.resumeContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(140, now);
      osc.frequency.setValueAtTime(110, now + 0.1);

      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.26);
    } catch (e) {
      // ignore
    }
  }

  /**
   * Bölüm Tamamlandı Zafer Melodisi (Victory Jingle)
   */
  public playVictory(): void {
    if (this.isMuted) return;
    this.resumeContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const fanfare = [
        { f: 523.25, d: 0.12 }, // C5
        { f: 659.25, d: 0.12 }, // E5
        { f: 783.99, d: 0.12 }, // G5
        { f: 1046.50, d: 0.35 } // C6
      ];

      let t = now;
      fanfare.forEach(note => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'square';
        osc.frequency.setValueAtTime(note.f, t);

        gain.gain.setValueAtTime(0.18, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + note.d);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(t);
        osc.stop(t + note.d + 0.02);

        t += note.d * 1.05;
      });
    } catch (e) {
      // ignore
    }
  }

  /**
   * Bölüm Başarısız Melodisi (Defeat / Time's Up)
   */
  public playFail(): void {
    if (this.isMuted) return;
    this.resumeContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const sadNotes = [
        { f: 440, d: 0.2 }, // A4
        { f: 415.3, d: 0.2 }, // G#4
        { f: 370, d: 0.35 }  // F#4
      ];

      let t = now;
      sadNotes.forEach(note => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(note.f, t);

        gain.gain.setValueAtTime(0.15, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + note.d);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(t);
        osc.stop(t + note.d + 0.02);

        t += note.d * 1.1;
      });
    } catch (e) {
      // ignore
    }
  }

  /**
   * UI Buton Tıklama ve Seçim Sesi
   */
  public playClick(): void {
    if (this.isMuted) return;
    this.resumeContext();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      const now = this.ctx.currentTime;

      osc.frequency.setValueAtTime(600, now);
      osc.frequency.exponentialRampToValueAtTime(400, now + 0.05);

      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.06);
    } catch (e) {
      // ignore
    }
  }

  /**
   * Soru işareti kutusu açıldığında sürpriz jingle
   */
  public playMystery(): void {
    if (this.isMuted) return;
    this.resumeContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const freqs = [700, 880, 1050, 1320];
      freqs.forEach((f, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        const start = now + idx * 0.06;
        osc.frequency.setValueAtTime(f, start);

        gain.gain.setValueAtTime(0.2, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.15);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(start);
        osc.stop(start + 0.16);
      });
    } catch (e) {
      // ignore
    }
  }
}
