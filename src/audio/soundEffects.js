/**
 * Sintetizador de Efeitos Sonoros 8-Bit via Web Audio API Nativa
 * Não utiliza arquivos externos de áudio, 100% sintetizado em tempo real!
 */

class SoundEffectsManager {
  constructor() {
    this.ctx = null;
    this.muted = localStorage.getItem('ttt_muted') === 'true';
    const savedVol = localStorage.getItem('ttt_volume');
    this.volume = savedVol !== null ? parseFloat(savedVol) : 0.7;
  }

  initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  isMuted() {
    return this.muted;
  }

  toggleMute() {
    this.muted = !this.muted;
    localStorage.setItem('ttt_muted', String(this.muted));
    return this.muted;
  }

  setVolume(vol) {
    this.volume = Math.max(0, Math.min(1, vol));
    localStorage.setItem('ttt_volume', String(this.volume));
  }

  getVolume() {
    return this.volume;
  }

  /**
   * Toca uma nota ou tom simples com envelope de amplitude
   */
  playTone(freq, type = 'square', duration = 0.1, startDelay = 0, gainLevel = 1) {
    if (this.muted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const startTime = this.ctx.currentTime + startDelay;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, startTime);

      const targetGain = this.volume * 0.18 * gainLevel;
      gain.gain.setValueAtTime(0.001, startTime);
      gain.gain.exponentialRampToValueAtTime(targetGain, startTime + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + duration + 0.05);
    } catch {
      // Ignora erro caso navegador bloqueie áudio antes de interação
    }
  }

  /**
   * Som de clique em botão
   */
  playClick() {
    if (this.muted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const startTime = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'square';
      osc.frequency.setValueAtTime(800, startTime);
      osc.frequency.exponentialRampToValueAtTime(300, startTime + 0.04);

      gain.gain.setValueAtTime(this.volume * 0.15, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.04);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + 0.05);
    } catch {
      // Silencioso em caso de bloqueio
    }
  }

  /**
   * Som de jogada no tabuleiro
   */
  playMove(symbol = 'X') {
    if (this.muted) return;
    this.initContext();

    if (symbol === 'X') {
      // 8-bit energizado subindo
      this.playTone(523.25, 'square', 0.08, 0, 1);    // C5
      this.playTone(659.25, 'square', 0.10, 0.06, 1); // E5
    } else {
      // 8-bit suave arredondado
      this.playTone(587.33, 'triangle', 0.08, 0, 1.2);    // D5
      this.playTone(783.99, 'triangle', 0.12, 0.06, 1.2); // G5
    }
  }

  /**
   * Fanfarra de vitória 8-bit retrô!
   */
  playWin() {
    if (this.muted) return;
    this.initContext();

    // Notas de vitória: C5 -> E5 -> G5 -> C6 sustentado
    const notes = [
      { f: 523.25, d: 0.12, t: 0 },
      { f: 659.25, d: 0.12, t: 0.12 },
      { f: 783.99, d: 0.12, t: 0.24 },
      { f: 1046.50, d: 0.40, t: 0.36 }
    ];

    notes.forEach(({ f, d, t }) => {
      this.playTone(f, 'square', d, t, 1.2);
    });
  }

  /**
   * Som de empate (cômico desanimado)
   */
  playDraw() {
    if (this.muted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const startTime = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(450, startTime);
      osc.frequency.linearRampToValueAtTime(160, startTime + 0.4);

      gain.gain.setValueAtTime(this.volume * 0.15, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.4);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + 0.45);
    } catch {
      // Silencioso
    }
  }

  /**
   * Aviso sonoro quando jogador entra na sala
   */
  playJoinAlert() {
    if (this.muted) return;
    this.playTone(600, 'triangle', 0.08, 0, 1.2);
    this.playTone(900, 'triangle', 0.12, 0.09, 1.2);
  }

  /**
   * Som de reação emoji (bolha saltitante)
   */
  playReaction() {
    if (this.muted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const startTime = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(320, startTime);
      osc.frequency.exponentialRampToValueAtTime(880, startTime + 0.08);
      osc.frequency.exponentialRampToValueAtTime(440, startTime + 0.16);

      gain.gain.setValueAtTime(this.volume * 0.2, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.16);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + 0.18);
    } catch {
      // Silencioso
    }
  }
}

export const sounds = new SoundEffectsManager();
