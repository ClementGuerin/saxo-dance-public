// audio.js: everything you hear, synthesised with WebAudio (no files): a PS1-era house loop whose drums swell near
// the club, character babble (Animal Crossing style), footsteps and UI blips. The music's clock is the world's beat.
export const BPM = 112;
let ctx = null, master = null, musicBus = null, drumBus = null, musicLP = null, sfxBus = null, noiseBuf = null;
let muted = false, t0 = 0, nextStep = 0, step = 0, timer = null;
const SPB = 60 / BPM, S16 = SPB / 4;
try { muted = localStorage.getItem('saxo.muted') === '1'; } catch {}

export function isMuted() { return muted; }
export function setMuted(m) {
  muted = m; try { localStorage.setItem('saxo.muted', m ? '1' : '0'); } catch {}
  if (master) master.gain.setTargetAtTime(m ? 0 : 0.9, ctx.currentTime, 0.05);
}
// the music's beat position (keeps counting from page time until the audio starts)
export function beatNow() { return ctx && t0 ? (ctx.currentTime - t0) / SPB : performance.now() / 1000 / SPB; }

export function start() {
  if (ctx) { ctx.resume(); return; }
  const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return;
  ctx = new AC();
  master = ctx.createGain(); master.gain.value = muted ? 0 : 0.9;
  const comp = ctx.createDynamicsCompressor(); comp.threshold.value = -14; comp.ratio.value = 4;
  master.connect(comp).connect(ctx.destination);
  musicLP = ctx.createBiquadFilter(); musicLP.type = 'lowpass'; musicLP.frequency.value = 18000;
  musicBus = ctx.createGain(); musicBus.gain.value = 0.55; musicBus.connect(musicLP).connect(master);
  drumBus = ctx.createGain(); drumBus.gain.value = 0.3; drumBus.connect(musicBus);
  sfxBus = ctx.createGain(); sfxBus.gain.value = 0.8; sfxBus.connect(master);
  noiseBuf = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
  const d = noiseBuf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  t0 = ctx.currentTime + 0.1; nextStep = t0; step = 0;
  timer = setInterval(schedule, 25);
  document.addEventListener('visibilitychange', () => { if (!ctx) return; document.hidden ? ctx.suspend() : ctx.resume(); });
}

// club proximity 0..1 brings the drums in; muffle() dips the music under an overlay
export function setClub(k) { if (drumBus) drumBus.gain.setTargetAtTime(0.22 + 0.78 * k, ctx.currentTime, 0.3); }
export function muffle(on) { if (musicLP) musicLP.frequency.setTargetAtTime(on ? 700 : 18000, ctx.currentTime, 0.15); if (musicBus) musicBus.gain.setTargetAtTime(on ? 0.35 : 0.55, ctx.currentTime, 0.2); }

// ---------- the loop: Am F C G, 16th-note grid ----------
const N = n => 440 * Math.pow(2, (n - 69) / 12);
const CHORDS = [[57, 60, 64], [53, 57, 60], [48, 52, 55], [55, 59, 62]];   // Am F C G (MIDI)
const BASS = [0, null, 0, null, 12, null, 0, 7, 0, null, 0, 12, null, 7, 12, null];
const ARP = [0, 1, 2, 1, 2, 0, 1, 2, 0, 2, 1, 2, 0, 1, 2, 1];
function schedule() {
  if (!ctx) return;
  while (nextStep < ctx.currentTime + 0.12) { playStep(step, nextStep); nextStep += S16; step++; }
}
function playStep(s, t) {
  const bar = Math.floor(s / 16) % 8, i = s % 16, ch = CHORDS[bar % 4], phrase = Math.floor(s / 128) % 2;
  // drums
  if (i % 4 === 0) kick(t);
  if (i === 4 || i === 12) clap(t);
  if (i % 2 === 0) hat(t, i % 4 === 2 ? 0.05 : 0.025, 0.03);
  if (i % 4 === 2 && bar % 2 === 1) hat(t, 0.035, 0.12);
  // bass
  const b = BASS[i]; if (b != null) tone(t, N(ch[0] - 24 + b), 'square', 0.09, S16 * 1.6, 0.004, 900, musicBus);
  // pad on each bar
  if (i === 0) for (const n of ch) { tone(t, N(n), 'sawtooth', 0.035, SPB * 3.8, 0.12, 1400, musicBus, 4); tone(t, N(n), 'sawtooth', 0.035, SPB * 3.8, 0.12, 1400, musicBus, -4); }
  // arpeggio, only in the second half of the loop and on the off-phrase
  if ((bar >= 4 || phrase) && i % 2 === 0) tone(t, N(ch[ARP[i]] + 12), 'triangle', 0.05, S16 * 1.5, 0.003, 4000, musicBus);
  // a little lead hook every 8 bars
  if (phrase && bar === 7 && [0, 3, 6, 10].includes(i)) tone(t, N([76, 74, 72, 71][[0, 3, 6, 10].indexOf(i)]), 'square', 0.05, S16 * 2.5, 0.005, 3000, musicBus);
}
function env(g, t, peak, att, dur) { g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(peak, t + att); g.gain.exponentialRampToValueAtTime(0.0001, t + dur); }
function tone(t, f, type, vol, dur, att = 0.005, lp = 8000, bus = sfxBus, detune = 0) {
  const o = ctx.createOscillator(), g = ctx.createGain(), fl = ctx.createBiquadFilter();
  o.type = type; o.frequency.setValueAtTime(f, t); o.detune.value = detune; fl.type = 'lowpass'; fl.frequency.value = lp;
  env(g, t, vol, att, dur); o.connect(fl).connect(g).connect(bus); o.start(t); o.stop(t + dur + 0.05);
  return o;
}
function noise(t, dur, vol, type, freq, q = 1, bus = drumBus) {
  const s = ctx.createBufferSource(), g = ctx.createGain(), f = ctx.createBiquadFilter();
  s.buffer = noiseBuf; f.type = type; f.frequency.value = freq; f.Q.value = q;
  env(g, t, vol, 0.002, dur); s.connect(f).connect(g).connect(bus); s.start(t, Math.random() * 0.5); s.stop(t + dur + 0.05);
}
function kick(t) { const o = ctx.createOscillator(), g = ctx.createGain(); o.frequency.setValueAtTime(150, t); o.frequency.exponentialRampToValueAtTime(42, t + 0.12); env(g, t, 0.7, 0.002, 0.28); o.connect(g).connect(drumBus); o.start(t); o.stop(t + 0.35); }
function clap(t) { noise(t, 0.16, 0.35, 'bandpass', 1500, 0.8); noise(t + 0.012, 0.12, 0.25, 'bandpass', 1800, 0.8); }
function hat(t, vol, dur) { noise(t, dur, vol, 'highpass', 7500, 0.7); }

// ---------- sound effects ----------
const ok = () => ctx && !muted;
export const sfx = {
  blip(p = 1) { if (!ok()) return; const t = ctx.currentTime; tone(t, 880 * p, 'square', 0.06, 0.06); tone(t + 0.05, 1320 * p, 'square', 0.05, 0.07); },
  open() { if (!ok()) return; const t = ctx.currentTime; tone(t, 520, 'triangle', 0.1, 0.1); tone(t + 0.07, 780, 'triangle', 0.1, 0.14); },
  close() { if (!ok()) return; const t = ctx.currentTime; tone(t, 780, 'triangle', 0.08, 0.08); tone(t + 0.06, 460, 'triangle', 0.08, 0.12); },
  step(k = 1) { if (!ok()) return; noise(ctx.currentTime, 0.035, 0.05 * k, 'lowpass', 900, 0.7, sfxBus); },
  pow() { if (!ok()) return; const t = ctx.currentTime; noise(t, 0.3, 0.6, 'lowpass', 2200, 0.5, sfxBus); const o = tone(t, 420, 'square', 0.25, 0.35, 0.002, 2000); o.frequency.exponentialRampToValueAtTime(55, t + 0.3); },
  thud() { if (!ok()) return; const t = ctx.currentTime; const o = tone(t, 120, 'sine', 0.4, 0.25, 0.002, 800); o.frequency.exponentialRampToValueAtTime(40, t + 0.2); noise(t, 0.12, 0.2, 'lowpass', 500, 0.7, sfxBus); },
  poof() { if (!ok()) return; const t = ctx.currentTime; const s = ctx.createBufferSource(), g = ctx.createGain(), f = ctx.createBiquadFilter(); s.buffer = noiseBuf; f.type = 'bandpass'; f.Q.value = 2; f.frequency.setValueAtTime(400, t); f.frequency.exponentialRampToValueAtTime(5000, t + 0.4); env(g, t, 0.4, 0.01, 0.45); s.connect(f).connect(g).connect(sfxBus); s.start(t); s.stop(t + 0.5); tone(t + 0.3, 1568, 'triangle', 0.06, 0.2); tone(t + 0.38, 2093, 'triangle', 0.06, 0.3); },
  tvOn() { if (!ok()) return; const t = ctx.currentTime; tone(t, 60, 'sine', 0.25, 0.15, 0.002, 400); noise(t + 0.04, 0.35, 0.18, 'highpass', 3000, 0.5, sfxBus); },
  sparkle() { if (!ok()) return; const t = ctx.currentTime; [1047, 1319, 1568, 2093].forEach((f, i) => tone(t + i * 0.06, f, 'triangle', 0.05, 0.15)); },
};
// babble: one short blip per syllable, pitch from the voice, a little random per syllable
const VOICES = { saxo: [230, 'square', 0.055, 1], sadi: [400, 'triangle', 0.08, 1.1], kob: [165, 'sawtooth', 0.04, 0.8], compote: [310, 'square', 0.05, 1.35] };
export function babble(who, text) {
  if (!ok()) return 0;
  const [f, type, vol, rate] = VOICES[who] || VOICES.saxo, syl = Math.min(18, Math.max(2, Math.round(text.length / 3.2)));
  const gap = 0.075 / rate, t = ctx.currentTime;
  for (let i = 0; i < syl; i++) { const p = f * Math.pow(2, (Math.floor(Math.random() * 7) - 3) / 12) * (who === 'compote' ? 1 + Math.random() * 0.08 : 1); tone(t + i * gap, p, type, vol, gap * 0.8, 0.004, 3000); }
  return syl * gap;
}
