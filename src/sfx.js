/**
 * Short interaction sounds, synthesized in the Web Audio API.
 * Independent of the slide-transition chorus mute in main.js.
 * Nothing here loads a sample. Dragging does not call these per pixel.
 */

const STORAGE_KEY = 'codex-talk-sfx';

let audioContext = null;
let enabled = false;

try {
  enabled = sessionStorage.getItem(STORAGE_KEY) === 'on';
} catch {
  enabled = false;
}

export function sfxEnabled() {
  return enabled;
}

export function setSfxEnabled(on) {
  enabled = Boolean(on);
  try {
    sessionStorage.setItem(STORAGE_KEY, enabled ? 'on' : 'off');
  } catch {
    /* private mode */
  }
}

function context() {
  const Ctx = window.AudioContext || window.webkitAudioContext;
  if (!Ctx) return null;
  audioContext ||= new Ctx();
  if (audioContext.state === 'suspended') audioContext.resume();
  return audioContext;
}

function noiseBuffer(ctx, seconds) {
  const length = Math.max(1, Math.floor(ctx.sampleRate * seconds));
  const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < length; i += 1) data[i] = Math.random() * 2 - 1;
  return buffer;
}

function gainTo(ctx, t, peak, duration, attack = 0.004) {
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.exponentialRampToValueAtTime(Math.max(0.0002, peak), t + attack);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + duration);
  return gain;
}

function tone(ctx, t, { type = 'sine', freq, endFreq, peak = 0.08, duration = 0.08, attack = 0.004 }) {
  const osc = ctx.createOscillator();
  const gain = gainTo(ctx, t, peak, duration, attack);
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t);
  if (endFreq) osc.frequency.exponentialRampToValueAtTime(Math.max(1, endFreq), t + duration);
  osc.connect(gain).connect(ctx.destination);
  osc.start(t);
  osc.stop(t + duration + 0.02);
}

function noiseBurst(ctx, t, { duration = 0.06, peak = 0.06, type = 'bandpass', freq = 900, q = 0.8, endFreq }) {
  const source = ctx.createBufferSource();
  source.buffer = noiseBuffer(ctx, duration + 0.02);
  const filter = ctx.createBiquadFilter();
  filter.type = type;
  filter.Q.value = q;
  filter.frequency.setValueAtTime(freq, t);
  if (endFreq) filter.frequency.exponentialRampToValueAtTime(Math.max(40, endFreq), t + duration);
  const gain = gainTo(ctx, t, peak, duration, 0.002);
  source.connect(filter).connect(gain).connect(ctx.destination);
  source.start(t);
  source.stop(t + duration + 0.02);
}

const library = {
  thud(ctx, t) {
    tone(ctx, t, { freq: 150, endFreq: 46, peak: 0.14, duration: 0.13, type: 'sine' });
    noiseBurst(ctx, t, { duration: 0.07, peak: 0.07, type: 'lowpass', freq: 220, q: 0.6 });
  },
  tap(ctx, t) {
    tone(ctx, t, { freq: 420, endFreq: 180, peak: 0.05, duration: 0.045, type: 'triangle' });
    noiseBurst(ctx, t, { duration: 0.03, peak: 0.035, type: 'highpass', freq: 1400, q: 0.5 });
  },
  scratch(ctx, t) {
    noiseBurst(ctx, t, { duration: 0.11, peak: 0.045, type: 'bandpass', freq: 700, endFreq: 2400, q: 4 });
  },
  pop(ctx, t) {
    tone(ctx, t, { freq: 620, endFreq: 180, peak: 0.07, duration: 0.06, type: 'sine' });
  },
  whoosh(ctx, t) {
    noiseBurst(ctx, t, { duration: 0.2, peak: 0.05, type: 'bandpass', freq: 280, endFreq: 2100, q: 1.4 });
    tone(ctx, t, { freq: 220, endFreq: 740, peak: 0.03, duration: 0.18, type: 'triangle' });
  },
  creak(ctx, t) {
    tone(ctx, t, { freq: 210, endFreq: 96, peak: 0.05, duration: 0.28, type: 'sawtooth', attack: 0.02 });
    tone(ctx, t, { freq: 214, endFreq: 92, peak: 0.02, duration: 0.26, type: 'triangle', attack: 0.03 });
  },
  latch(ctx, t) {
    noiseBurst(ctx, t, { duration: 0.025, peak: 0.07, type: 'highpass', freq: 1800, q: 0.7 });
    tone(ctx, t + 0.03, { freq: 240, endFreq: 90, peak: 0.06, duration: 0.05, type: 'square' });
  },
  valve(ctx, t) {
    noiseBurst(ctx, t, { duration: 0.02, peak: 0.06, type: 'highpass', freq: 2200, q: 0.6 });
    tone(ctx, t, { freq: 180, endFreq: 70, peak: 0.05, duration: 0.04, type: 'square' });
  },
  hit(ctx, t) {
    tone(ctx, t, { freq: 78, endFreq: 34, peak: 0.16, duration: 0.22, type: 'sine' });
    noiseBurst(ctx, t, { duration: 0.05, peak: 0.04, type: 'lowpass', freq: 160, q: 0.5 });
  },
  suck(ctx, t) {
    noiseBurst(ctx, t, { duration: 0.42, peak: 0.05, type: 'bandpass', freq: 1400, endFreq: 80, q: 2.2 });
    tone(ctx, t, { freq: 520, endFreq: 70, peak: 0.04, duration: 0.4, type: 'sine' });
  },
  clack(ctx, t) {
    noiseBurst(ctx, t, { duration: 0.03, peak: 0.08, type: 'highpass', freq: 900, q: 0.5 });
    tone(ctx, t, { freq: 160, endFreq: 60, peak: 0.08, duration: 0.06, type: 'triangle' });
  },
  tick(ctx, t) {
    tone(ctx, t, { freq: 1480, endFreq: 900, peak: 0.045, duration: 0.028, type: 'square' });
  },
  click(ctx, t) {
    noiseBurst(ctx, t, { duration: 0.02, peak: 0.06, type: 'highpass', freq: 1600, q: 0.4 });
    tone(ctx, t, { freq: 980, peak: 0.03, duration: 0.02, type: 'square' });
  },
  ding(ctx, t) {
    tone(ctx, t, { freq: 880, peak: 0.06, duration: 0.09, type: 'sine' });
    tone(ctx, t + 0.07, { freq: 1318, peak: 0.05, duration: 0.12, type: 'sine' });
  },
  cash(ctx, t) {
    tone(ctx, t, { freq: 523, peak: 0.045, duration: 0.12, type: 'triangle' });
    tone(ctx, t + 0.04, { freq: 784, peak: 0.04, duration: 0.14, type: 'triangle' });
    noiseBurst(ctx, t, { duration: 0.03, peak: 0.025, type: 'highpass', freq: 2000, q: 0.4 });
  },
  blip(ctx, t) {
    tone(ctx, t, { freq: 990, peak: 0.035, duration: 0.028, type: 'sine' });
  },
};

export function playSfx(name) {
  if (!enabled) return;
  const recipe = library[name];
  if (!recipe) return;
  const ctx = context();
  if (!ctx) return;
  recipe(ctx, ctx.currentTime);
}
