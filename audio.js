// Synthesized Retro Stardew Valley & WarioWare Sound Engine (Web Audio API)
class SoundEngine {
  constructor() {
    this.ctx = null;
    this.muted = false;
    this.bgmTimer = null;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggleMute() {
    this.muted = !this.muted;
    if (this.muted) {
      this.stopBgm();
    }
    return this.muted;
  }

  playTone(freq, duration = 0.08, type = 'triangle', volume = 0.14, delay = 0) {
    if (this.muted) return;
    this.init();
    const now = this.ctx.currentTime + delay;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);
    gain.gain.setValueAtTime(volume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + duration);
  }

  // Stardew Valley Typewriter Dialogue Blip
  playVoiceBlip(speaker = 'bubu') {
    if (this.muted) return;
    const base = speaker === 'bubu' ? 540 : 340;
    const jitter = (Math.random() - 0.5) * 70;
    this.playTone(base + jitter, 0.045, 'sine', 0.09);
  }

  playClick() {
    this.playTone(620, 0.05, 'triangle', 0.16);
    this.playTone(880, 0.06, 'triangle', 0.14, 0.04);
  }

  playPop() {
    this.playTone(480, 0.05, 'sine', 0.18);
    this.playTone(760, 0.08, 'triangle', 0.16, 0.03);
  }

  playSlice() {
    this.playTone(900, 0.04, 'sawtooth', 0.12);
    this.playTone(420, 0.06, 'triangle', 0.12, 0.03);
  }

  // WarioWare "Ready / Go!" Jingle
  playCommandJingle() {
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((n, i) => {
      this.playTone(n, 0.09, 'square', 0.11, i * 0.065);
    });
  }

  // Microgame WIN Fanfare
  playWin() {
    const notes = [523.25, 659.25, 783.99, 1046.5, 1318.5];
    notes.forEach((n, i) => {
      this.playTone(n, 0.13, 'triangle', 0.18, i * 0.07);
    });
  }

  // Microgame LOSE Buzzer
  playLose() {
    const notes = [311.13, 277.18, 246.94, 207.65];
    notes.forEach((n, i) => {
      this.playTone(n, 0.16, 'sawtooth', 0.13, i * 0.09);
    });
  }

  // Happy Birthday Chiptune Melody for Finale
  playBirthdaySong() {
    this.stopBgm();
    if (this.muted) return;
    const melody = [
      [392, 0.25], [392, 0.25], [440, 0.45], [392, 0.45], [523.25, 0.45], [493.88, 0.8],
      [392, 0.25], [392, 0.25], [440, 0.45], [392, 0.45], [587.33, 0.45], [523.25, 0.8],
      [392, 0.25], [392, 0.25], [783.99, 0.45], [659.25, 0.45], [523.25, 0.45], [493.88, 0.45], [440, 0.7]
    ];
    let t = 0;
    melody.forEach(([freq, dur]) => {
      this.playTone(freq, dur * 0.9, 'triangle', 0.16, t);
      t += dur;
    });
  }

  startStardewBgm() {
    this.stopBgm();
    if (this.muted) return;
    const chords = [261.63, 329.63, 392.00, 493.88, 523.25, 392.00, 329.63, 293.66];
    let idx = 0;
    this.bgmTimer = setInterval(() => {
      if (this.muted) return;
      this.playTone(chords[idx % chords.length], 0.35, 'sine', 0.05);
      idx++;
    }, 420);
  }

  stopBgm() {
    if (this.bgmTimer) {
      clearInterval(this.bgmTimer);
      this.bgmTimer = null;
    }
  }
}

window.sound = new SoundEngine();
