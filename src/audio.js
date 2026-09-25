// audio.js: plays the soundtrack in the preview and renders it offline for the encode.
//
// Two sources mix together:
//   1. Audio files in CONFIG.audio.tracks (a supplied song, a generated track, voiceover, sound effects).
//   2. An optional synthesised score: src/score.js defines score(S) and schedules sounds with S.kick(t), S.tone(t, ...),
//      S.whoosh(t), ... at video times. The same code runs live in the preview and inside an OfflineAudioContext
//      for the render, so what you hear while scrubbing is what ends up in the file.

function noiseBuffer(ac, seconds = 2, seed = 4242) {
  const r = mulberry32(seed), len = Math.floor(ac.sampleRate * seconds), buf = ac.createBuffer(1, len, ac.sampleRate), d = buf.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = r() * 2 - 1;
  return buf;
}

// Master bus shared by every synth voice: kick-triggered duck (the "pump"), a reverb return, glue compression and a
// soft clipper. This is what turns a list of beeps into something that sounds produced. Final loudness (LUFS) and the
// true-peak ceiling are set later by render.mjs when it masters the mix.
function masterBus(ac, out, o = {}) {
  const input = ac.createGain(), duck = ac.createGain(), comp = ac.createDynamicsCompressor(), clip = ac.createWaveShaper(), post = ac.createGain();
  comp.threshold.value = o.threshold ?? -16; comp.ratio.value = o.ratio ?? 3; comp.attack.value = .004; comp.release.value = .16; comp.knee.value = 8;
  const k = o.drive ?? 1.6, curve = new Float32Array(2048);
  for (let i = 0; i < curve.length; i++) { const x = i / (curve.length - 1) * 2 - 1; curve[i] = Math.tanh(k * x) / Math.tanh(k); }
  clip.curve = curve; clip.oversample = '4x';
  input.connect(duck).connect(comp).connect(clip).connect(post).connect(out);
  // Reverb: a seeded, exponentially decaying noise impulse, stereo decorrelated. Send to it with { rev: 0..1 }.
  const conv = ac.createConvolver(), len = Math.floor(ac.sampleRate * (o.reverbTime ?? 1.8)), ir = ac.createBuffer(2, len, ac.sampleRate);
  for (let c = 0; c < 2; c++) { const r = mulberry32(900 + c), d = ir.getChannelData(c); for (let i = 0; i < len; i++) d[i] = (r() * 2 - 1) * Math.pow(1 - i / len, 3.2); }
  conv.buffer = ir;
  const revIn = ac.createGain(), revOut = ac.createGain(); revOut.gain.value = o.reverb ?? .35;
  revIn.connect(conv).connect(revOut).connect(duck);
  return { input, duck, revIn };
}

// S: the instrument kit handed to score(S). Times are video seconds; events before `from` are skipped (preview seek).
// Every voice takes { v (level), pan (-1..1), rev (reverb send 0..1) } besides its own options.
function makeS(ac, dest, from = 0, lead = 0) {
  const base = ac.currentTime + lead, at = t => base + (t - from), live = t => t >= from - 1e-6;
  const nb = noiseBuffer(ac), bus = masterBus(ac, dest, CONFIG.audio?.bus || {});
  const env = (gn, w, v, a, d) => { gn.gain.setValueAtTime(1e-4, w); gn.gain.exponentialRampToValueAtTime(Math.max(v, 1e-4), w + a); gn.gain.exponentialRampToValueAtTime(1e-4, w + a + d); };
  // Route a voice's gain node: optional pan, optional reverb send, to the bus (or o.dest).
  const route = (gn, o) => {
    let node = gn;
    if (o.pan) { const p = ac.createStereoPanner(); p.pan.value = clamp(o.pan, -1, 1); gn.connect(p); node = p; }
    node.connect(o.dest || bus.input);
    if (o.rev) { const s = ac.createGain(); s.gain.value = o.rev; node.connect(s).connect(bus.revIn); }
  };
  const S = {
    BPM, BEAT, beatAt,
    // 'A4' → 440. Accepts C..B with # or b and an octave number.
    note(n) {
      if (typeof n === 'number') return n;
      const m = /^([A-G])(#|b)?(-?\d)$/.exec(n);
      return 440 * Math.pow(2, ({ C: -9, D: -7, E: -5, F: -4, G: -2, A: 0, B: 2 }[m[1]] + (m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0) + (m[3] - 4) * 12) / 12);
    },
    // One oscillator voice. o: type, v, attack, slideTo, detune, cutoff, q, filterTo (filter envelope end), drive, pan, rev.
    tone(t, f, d = .3, o = {}) {
      if (!live(t)) return;
      const w = at(t), a = o.attack ?? .005, osc = ac.createOscillator();
      osc.type = o.type || 'triangle'; osc.frequency.setValueAtTime(S.note(f), w);
      if (o.slideTo) osc.frequency.exponentialRampToValueAtTime(S.note(o.slideTo), w + a + d);
      if (o.detune) osc.detune.value = o.detune;
      let node = osc;
      if (o.drive) { const ws = ac.createWaveShaper(), c = new Float32Array(512); for (let i = 0; i < 512; i++) { const x = i / 511 * 2 - 1; c[i] = Math.tanh(o.drive * x); } ws.curve = c; node.connect(ws); node = ws; }
      if (o.cutoff) {
        const lp = ac.createBiquadFilter(); lp.type = 'lowpass'; lp.Q.value = o.q ?? .7;
        lp.frequency.setValueAtTime(o.cutoff, w); if (o.filterTo) lp.frequency.exponentialRampToValueAtTime(o.filterTo, w + a + d);
        node.connect(lp); node = lp;
      }
      const gn = ac.createGain(); env(gn, w, o.v ?? .2, a, d);
      node.connect(gn); route(gn, o); osc.start(w); osc.stop(w + a + d + .05);
    },
    chord(t, notes, d = .6, o = {}) { notes.forEach((n, i) => S.tone(t + (o.strum || 0) * i, n, d, o)); },
    noise(t, d = .2, o = {}) {
      if (!live(t)) return;
      const w = at(t), a = o.attack ?? .002, src = ac.createBufferSource(), f = ac.createBiquadFilter();
      src.buffer = nb; f.type = o.filter || 'bandpass'; f.frequency.setValueAtTime(o.freq || 1000, w);
      if (o.sweepTo) f.frequency.exponentialRampToValueAtTime(o.sweepTo, w + a + d);
      f.Q.value = o.q ?? .8;
      const gn = ac.createGain(); env(gn, w, o.v ?? .2, a, d);
      src.connect(f).connect(gn); route(gn, o); src.start(w, hash(t * 1000) * 1.5); src.stop(w + a + d + .1);
    },
    // Pump the whole mix down and back, like sidechain compression. kick() calls it unless { duck: false }.
    duck(t, depth = .35, release = .16) {
      if (!live(t)) return;
      const w = at(t), gp = bus.duck.gain;
      gp.setValueAtTime(1, Math.max(0, w - .002)); gp.linearRampToValueAtTime(1 - depth, w + .006); gp.setTargetAtTime(1, w + .01, release / 3);
    },
    // Drums: saturated kick with a click, layered snare and clap, stereo hats.
    kick(t, v = .9, o = {}) {
      S.tone(t, 160, .26, { type: 'sine', slideTo: 45, v, attack: .002, drive: 2.2 });
      S.noise(t, .012, { filter: 'highpass', freq: 3000, v: v * .25 });
      if (o.duck !== false) S.duck(t, o.depth ?? .35);
    },
    snare(t, v = .45) { S.noise(t, .18, { filter: 'highpass', freq: 1500, v, rev: .25 }); S.tone(t, 185, .09, { v: v * .6, slideTo: 150 }); },
    clap(t, v = .4) { [0, .011, .023].forEach((d, i) => S.noise(t + d, .1, { freq: 1300, q: 1.1, v, pan: [-.2, .2, 0][i], rev: .3 })); },
    hat(t, v = .14, open = false, pan = .3) { S.noise(t, open ? .22 : .04, { filter: 'highpass', freq: 8000, v, pan }); },
    // Bass: saturated saw through a plucky low-pass.
    bass(t, n, d = .4, v = .24) { S.tone(t, n, d, { type: 'sawtooth', cutoff: 900, filterTo: 180, drive: 1.8, v }); S.tone(t, S.note(n) / 2, d, { type: 'sine', v: v * .7 }); },
    // Supersaw chord stab: three detuned saws per note spread in stereo, with a closing filter. The workhorse of hype music.
    stab(t, notes, d = .35, v = .07, o = {}) {
      notes.forEach((n, i) => [[-14, -.6], [0, 0], [14, .6]].forEach(([dt, pan]) =>
        S.tone(t, n, d, { type: 'sawtooth', detune: dt + (i - 1) * 2, pan: pan * (o.width ?? .8), cutoff: o.bright ?? 5200, filterTo: 700, v, attack: .004, rev: o.rev ?? .25 })));
    },
    pad(t, notes, d = 2, v = .04) { notes.forEach((n, i) => [-9, 9].forEach((dt, k) => S.tone(t, n, d, { type: 'sawtooth', detune: dt, cutoff: 1200, v, attack: Math.min(.6, d * .3), pan: k ? .5 : -.5, rev: .5 }))); },
    lead(t, n, d = .25, v = .1) { S.tone(t, n, d, { type: 'square', cutoff: 3500, filterTo: 1500, v, pan: .1, rev: .35 }); S.tone(t, n, d, { type: 'sawtooth', detune: 7, cutoff: 3000, v: v * .5, pan: -.1, rev: .35 }); },
    chime(t, v = .18) { S.tone(t, 'E6', .18, { v, rev: .5, pan: -.2 }); S.tone(t + .08, 'B6', .35, { v, rev: .5, pan: .2 }); },
    whoosh(t, d = .5, v = .22) { S.noise(t - d * .6, d * .4, { freq: 400, sweepTo: 5000, q: 1.5, v, attack: d * .6, rev: .3 }); },
    riser(t, d = 2, v = .18) { S.noise(t - d, d * .05, { freq: 300, sweepTo: 8000, q: 2, v, attack: d * .95, rev: .4 }); S.tone(t - d, 110, d * .05, { type: 'sawtooth', slideTo: 880, cutoff: 2200, v: v * .35, attack: d * .95 }); },
    impact(t, v = .8) { S.kick(t, v, { depth: .6 }); S.noise(t, 1.1, { filter: 'lowpass', freq: 900, v: v * .45, rev: .6 }); S.tone(t, 55, 1.2, { type: 'sine', v: v * .5, drive: 1.5 }); },
    // Call fn(time, n) on every beat (div = 2 for eighths, 4 for sixteenths) in [a, b).
    every(a, b, fn, div = 1) { const s = BEAT / div; for (let n = Math.ceil((a - BEAT0) / s - 1e-6); BEAT0 + n * s < b - 1e-6; n++) fn(BEAT0 + n * s, n); },
  };
  return S;
}

// ---------- preview playback ----------
let _ac = null, _els = [], _timers = [];
function audioStart(from) {
  audioStop();
  _ac = new AudioContext();
  const master = _ac.createGain(); master.gain.value = CONFIG.audio?.synthGain ?? 1; master.connect(_ac.destination);
  if (typeof score === 'function') score(makeS(_ac, master, from, .05));
  for (const tr of CONFIG.audio?.tracks || []) {
    const el = new Audio(tr.file); el.volume = Math.min(1, tr.gain ?? 1); _els.push(el);
    const into = from - (tr.start || 0);
    if (into >= 0) { el.currentTime = into + (tr.offset || 0); el.play().catch(() => {}); }
    else { el.currentTime = tr.offset || 0; _timers.push(setTimeout(() => el.play().catch(() => {}), -into * 1000)); }
  }
}
function audioStop() {
  if (_ac) { _ac.close(); _ac = null; }
  _els.forEach(e => e.pause()); _els = [];
  _timers.forEach(clearTimeout); _timers = [];
}

// ---------- offline render (called by render.mjs) ----------
window.renderAudio = async (sr = 48000) => {
  const ac = new OfflineAudioContext(2, Math.ceil(sr * DUR), sr);
  const master = ac.createGain(); master.gain.value = CONFIG.audio?.synthGain ?? 1; master.connect(ac.destination);
  score(makeS(ac, master, 0, 0));
  return wavBase64(await ac.startRendering());
};
function wavBase64(buf) {
  const ch = buf.numberOfChannels, len = buf.length, sr = buf.sampleRate, dv = new DataView(new ArrayBuffer(44 + len * ch * 2));
  const str = (o, s) => [...s].forEach((c, i) => dv.setUint8(o + i, c.charCodeAt(0)));
  str(0, 'RIFF'); dv.setUint32(4, 36 + len * ch * 2, true); str(8, 'WAVE'); str(12, 'fmt ');
  dv.setUint32(16, 16, true); dv.setUint16(20, 1, true); dv.setUint16(22, ch, true); dv.setUint32(24, sr, true);
  dv.setUint32(28, sr * ch * 2, true); dv.setUint16(32, ch * 2, true); dv.setUint16(34, 16, true); str(36, 'data'); dv.setUint32(40, len * ch * 2, true);
  const chans = Array.from({ length: ch }, (_, i) => buf.getChannelData(i));
  let o = 44;
  for (let i = 0; i < len; i++) for (let c = 0; c < ch; c++) { const s = Math.max(-1, Math.min(1, chans[c][i])); dv.setInt16(o, s < 0 ? s * 0x8000 : s * 0x7fff, true); o += 2; }
  const bytes = new Uint8Array(dv.buffer); let bin = '';
  for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
  return btoa(bin);
}
