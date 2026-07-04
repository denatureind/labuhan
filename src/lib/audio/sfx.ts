/**
 * Efek suara sintesis WebAudio — tanpa file aset.
 * Semua suara pendek, lembut, bernuansa "pelabuhan malam".
 */
let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let muted = localStorage.getItem('ph-muted') === '1';

function ensure(): AudioContext | null {
  if (typeof AudioContext === 'undefined') return null;
  if (!ctx) {
    ctx = new AudioContext();
    master = ctx.createGain();
    master.gain.value = muted ? 0 : 0.5;
    master.connect(ctx.destination);
  }
  if (ctx.state === 'suspended') void ctx.resume();
  return ctx;
}

export function isMuted(): boolean {
  return muted;
}

export function toggleMute(): boolean {
  muted = !muted;
  localStorage.setItem('ph-muted', muted ? '1' : '0');
  if (master && ctx) master.gain.setTargetAtTime(muted ? 0 : 0.5, ctx.currentTime, 0.02);
  return muted;
}

function tone(
  freq: number,
  dur: number,
  opts: { type?: OscillatorType; vol?: number; delay?: number; slide?: number } = {},
): void {
  const c = ensure();
  if (!c || !master) return;
  const { type = 'sine', vol = 0.18, delay = 0, slide = 0 } = opts;
  const t0 = c.currentTime + delay;
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  if (slide) osc.frequency.exponentialRampToValueAtTime(Math.max(30, freq + slide), t0 + dur);
  g.gain.setValueAtTime(0, t0);
  g.gain.linearRampToValueAtTime(vol, t0 + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(g).connect(master);
  osc.start(t0);
  osc.stop(t0 + dur + 0.05);
}

function noise(dur: number, opts: { vol?: number; delay?: number; freq?: number } = {}): void {
  const c = ensure();
  if (!c || !master) return;
  const { vol = 0.12, delay = 0, freq = 900 } = opts;
  const t0 = c.currentTime + delay;
  const len = Math.ceil(c.sampleRate * dur);
  const buf = c.createBuffer(1, len, c.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
  const src = c.createBufferSource();
  src.buffer = buf;
  const filter = c.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = freq;
  const g = c.createGain();
  g.gain.setValueAtTime(vol, t0);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  src.connect(filter).connect(g).connect(master);
  src.start(t0);
}

let ambientOn = false;

/** Desir ombak latar — sangat pelan, mengikuti master (ikut tersenyapkan). */
export function startAmbient(): void {
  const c = ensure();
  if (!c || !master || ambientOn) return;
  ambientOn = true;
  const len = c.sampleRate * 8;
  const buf = c.createBuffer(1, len, c.sampleRate);
  const data = buf.getChannelData(0);
  let last = 0;
  for (let i = 0; i < len; i++) {
    last = (last + 0.02 * (Math.random() * 2 - 1)) / 1.02;
    data[i] = last * 3.5;
  }
  const src = c.createBufferSource();
  src.buffer = buf;
  src.loop = true;
  const lp = c.createBiquadFilter();
  lp.type = 'lowpass';
  lp.frequency.value = 380;
  const g = c.createGain();
  g.gain.value = 0.045;
  const lfo = c.createOscillator();
  lfo.frequency.value = 0.09;
  const lfoG = c.createGain();
  lfoG.gain.value = 0.028;
  lfo.connect(lfoG).connect(g.gain);
  src.connect(lp).connect(g).connect(master);
  src.start();
  lfo.start();
}

export const sfx = {
  click(): void {
    tone(660, 0.06, { type: 'triangle', vol: 0.1 });
  },
  open(): void {
    tone(392, 0.1, { type: 'triangle', vol: 0.12 });
    tone(523, 0.12, { type: 'triangle', vol: 0.1, delay: 0.05 });
  },
  close(): void {
    tone(523, 0.08, { type: 'triangle', vol: 0.1 });
    tone(392, 0.1, { type: 'triangle', vol: 0.08, delay: 0.04 });
  },
  card(): void {
    noise(0.16, { vol: 0.08, freq: 1600 });
    tone(330, 0.14, { type: 'sine', vol: 0.08, delay: 0.03 });
  },
  good(): void {
    tone(523, 0.1, { type: 'sine', vol: 0.14 });
    tone(659, 0.12, { type: 'sine', vol: 0.13, delay: 0.07 });
    tone(784, 0.2, { type: 'sine', vol: 0.12, delay: 0.14 });
  },
  bad(): void {
    tone(311, 0.16, { type: 'sawtooth', vol: 0.07 });
    tone(233, 0.28, { type: 'sawtooth', vol: 0.07, delay: 0.09 });
  },
  mixed(): void {
    tone(440, 0.1, { type: 'triangle', vol: 0.1 });
    tone(415, 0.16, { type: 'triangle', vol: 0.09, delay: 0.08 });
  },
  bell(): void {
    // Lonceng kapal penanda pagi
    tone(880, 0.5, { type: 'sine', vol: 0.12 });
    tone(1320, 0.4, { type: 'sine', vol: 0.05 });
    tone(880, 0.6, { type: 'sine', vol: 0.1, delay: 0.35 });
    tone(1320, 0.5, { type: 'sine', vol: 0.04, delay: 0.35 });
  },
  wave(): void {
    noise(1.4, { vol: 0.05, freq: 420 });
  },
  storm(): void {
    noise(1.8, { vol: 0.1, freq: 260 });
    tone(60, 1.2, { type: 'sine', vol: 0.1, slide: -20 });
  },
  fanfare(): void {
    [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.32, { type: 'triangle', vol: 0.12, delay: i * 0.13 }));
  },
  fail(): void {
    [392, 311, 262, 196].forEach((f, i) => tone(f, 0.4, { type: 'sawtooth', vol: 0.07, delay: i * 0.18 }));
    noise(1.2, { vol: 0.06, freq: 200, delay: 0.3 });
  },
};
