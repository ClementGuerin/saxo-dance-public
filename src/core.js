// core.js: shared helpers. Every frame is a pure function of time t: frames render in parallel and out of
// order, so never keep state between frames and never call Math.random() or Date.now(). Use hash(i) for stable
// per-object randomness and jit(a) for hand-drawn wobble (reseeded CONFIG.boil times per second).

const CONFIG = window.CONFIG;
const W = CONFIG.width, H = CONFIG.height, FPS = CONFIG.fps, DUR = CONFIG.duration;
const TAU = Math.PI * 2;
const cv = document.getElementById('out');
cv.width = W; cv.height = H;
let g = cv.getContext('2d');   // the active 2D context; transitions swap it to paint into offscreen buffers
let T = 0;                     // time of the frame being painted

// ---------- math ----------
const clamp = (v, a = 0, b = 1) => v < a ? a : v > b ? b : v;
const lerp = (a, b, k) => a + (b - a) * k;
const frac = x => x - Math.floor(x);
const seg = (t, a, b) => clamp((t - a) / (b - a));           // 0..1 progress through [a, b]
function hash(i) { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); }
function mulberry32(a) {
  return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
}
let _jr = mulberry32(1);
function reseed(t) { _jr = mulberry32(Math.floor(t * (CONFIG.boil || 12)) + 1); }
const jit = a => (_jr() * 2 - 1) * a;

// ---------- easing ----------
const ease = t => { t = clamp(t); return t * t * (3 - 2 * t); };
const easeIn = t => { t = clamp(t); return t * t * t; };
const easeOut = t => { t = clamp(t); return 1 - Math.pow(1 - t, 3); };
const easeInOut = t => { t = clamp(t); return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };
const backOut = (t, s = 1.70158) => { t = clamp(t); const c = s + 1; return 1 + c * Math.pow(t - 1, 3) + s * Math.pow(t - 1, 2); };
const elasticOut = t => { t = clamp(t); return t === 0 || t === 1 ? t : Math.pow(2, -10 * t) * Math.sin((t * 10 - .75) * TAU / 3) + 1; };
const wob = (t, f = 1, ph = 0) => Math.sin((t * f + ph) * TAU);
// Keyframes: kf(t, [[t0, v0], [t1, v1], ...], easeFn). Values may be numbers or arrays of numbers.
function kf(t, keys, fn = ease) {
  if (t <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) {
    if (t <= keys[i][0]) {
      const [t0, v0] = keys[i - 1], [t1, v1] = keys[i], k = fn((t - t0) / (t1 - t0));
      return Array.isArray(v0) ? v0.map((v, j) => lerp(v, v1[j], k)) : lerp(v0, v1, k);
    }
  }
  return keys[keys.length - 1][1];
}

// ---------- beat ----------
const BPM = (window.BEATS && window.BEATS.bpm) || CONFIG.bpm || 120;
const BEAT = 60 / BPM;
const BEAT0 = window.BEATS ? window.BEATS.offset : (CONFIG.beatOffset || 0);
const bpOf = t => (t - BEAT0) / BEAT;                          // beat position (fractional)
const beatN = t => Math.floor(bpOf(t));
const beatAt = n => BEAT0 + n * BEAT;                          // time of beat n; land hits here
const pulse = (t, k = 6) => { const p = bpOf(t); return p < 0 ? 0 : Math.exp(-frac(p) * k); };       // 1 on each beat, decays
const pulse2 = (t, k = 6) => { const p = bpOf(t) * 2; return p < 0 ? 0 : Math.exp(-frac(p) * k); };  // same on eighths

// ---------- colour ----------
function mixCol(a, b, k) {
  const rgb = h => { const n = parseInt(h.slice(1, 7), 16); return [n >> 16 & 255, n >> 8 & 255, n & 255]; };
  const A = rgb(a), B = rgb(b);
  return '#' + A.map((v, i) => Math.round(lerp(v, B[i], clamp(k))).toString(16).padStart(2, '0')).join('');
}
const withAlpha = (hex, a) => hex.slice(0, 7) + Math.round(clamp(a) * 255).toString(16).padStart(2, '0');

// ---------- drawing ----------
function fill(c) { g.fillStyle = c; g.fillRect(0, 0, W, H); }
function rect(x, y, w, h, c) { g.fillStyle = c; g.fillRect(x, y, w, h); }
function rr(x, y, w, h, r, c, stroke) {
  g.beginPath(); g.roundRect(x, y, w, h, r);
  if (c) { g.fillStyle = c; g.fill(); }
  if (stroke) { g.strokeStyle = stroke.c; g.lineWidth = stroke.w; g.stroke(); }
}
function circle(x, y, r, c, stroke) {
  g.beginPath(); g.arc(x, y, Math.max(0, r), 0, TAU);
  if (c) { g.fillStyle = c; g.fill(); }
  if (stroke) { g.strokeStyle = stroke.c; g.lineWidth = stroke.w; g.stroke(); }
}
function ell(x, y, rx, ry, rot, c, stroke) {
  g.beginPath(); g.ellipse(x, y, Math.max(0, rx), Math.max(0, ry), rot || 0, 0, TAU);
  if (c) { g.fillStyle = c; g.fill(); }
  if (stroke) { g.strokeStyle = stroke.c; g.lineWidth = stroke.w; g.stroke(); }
}
function poly(pts, c, stroke) {
  g.beginPath(); pts.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); g.closePath();
  if (c) { g.fillStyle = c; g.fill(); }
  if (stroke) { g.strokeStyle = stroke.c; g.lineWidth = stroke.w; g.lineJoin = 'round'; g.stroke(); }
}
function line(pts, w, c) {
  g.beginPath(); pts.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y));
  g.strokeStyle = c; g.lineWidth = w; g.lineCap = 'round'; g.lineJoin = 'round'; g.stroke();
}
// Point lists for poly(): pass jitter > 0 (with jit) for a hand-drawn edge that boils.
const ellPts = (cx, cy, rx, ry, n = 32, j = 0, rot = 0) => Array.from({ length: n }, (_, i) => {
  const a = i / n * TAU, x = Math.cos(a) * rx, y = Math.sin(a) * ry;
  return [cx + x * Math.cos(rot) - y * Math.sin(rot) + jit(j), cy + x * Math.sin(rot) + y * Math.cos(rot) + jit(j)];
});
const starPts = (cx, cy, r, inner = .45, n = 5, rot = -Math.PI / 2) => Array.from({ length: n * 2 }, (_, i) => {
  const a = rot + i / (n * 2) * TAU, rr_ = i % 2 ? r * inner : r; return [cx + Math.cos(a) * rr_, cy + Math.sin(a) * rr_];
});
function linearGrad(x0, y0, x1, y1, stops) { const gr = g.createLinearGradient(x0, y0, x1, y1); stops.forEach(([o, c]) => gr.addColorStop(o, c)); return gr; }
function radialGrad(x, y, r0, r1, stops) { const gr = g.createRadialGradient(x, y, r0, x, y, r1); stops.forEach(([o, c]) => gr.addColorStop(o, c)); return gr; }

// ---------- text ----------
// text(str, x, y, size, colour, { pop 0..1 (overshoot in), rot, alpha, weight, font, align, baseline, shadow, stroke:{c,w}, spacing })
function text(str, x, y, size, color, o = {}) {
  const k = o.pop == null ? 1 : backOut(o.pop);
  if (k <= .001 || (o.alpha != null && o.alpha <= 0)) return;
  g.save(); g.translate(x, y); if (o.rot) g.rotate(o.rot); g.scale(k, k);
  if (o.alpha != null) g.globalAlpha *= clamp(o.alpha);
  g.font = `${o.weight || 700} ${size}px ${o.font || CONFIG.fonts.display}`;
  g.textAlign = o.align || 'center'; g.textBaseline = o.baseline || 'middle';
  if (o.spacing) g.letterSpacing = o.spacing + 'px';
  if (o.shadow) { g.fillStyle = o.shadow; g.fillText(str, size * .03, size * .06); }
  if (o.stroke) { g.lineJoin = 'round'; g.strokeStyle = o.stroke.c; g.lineWidth = o.stroke.w; g.strokeText(str, 0, 0); }
  g.fillStyle = color; g.fillText(str, 0, 0);
  g.restore();
}
// A comic sound effect that pops in, wobbles and fades: sfx('BOOM', x, y, 160, '#fff', t - hitTime)
function sfx(str, x, y, size, color, age, o = {}) {
  const life = o.life || .9;
  if (age < 0 || age > life) return;
  text(str, x, y, size, color, { pop: age / .25, rot: (o.rot || -.08) + wob(age, 6) * .04, alpha: 1 - ease(seg(age, life * .7, life)), stroke: o.stroke || { c: '#111', w: size * .09 }, ...o });
}

// ---------- camera ----------
// camBegin puts world point (cx, cy) at the screen centre with zoom and rotation. Always pair with camEnd().
let CAM = null;
function camBegin(cx, cy, zoom = 1, rot = 0) { g.save(); g.translate(W / 2, H / 2); g.rotate(rot); g.scale(zoom, zoom); g.translate(-cx, -cy); CAM = { cx, cy, zoom, rot }; }
function camEnd() { if (CAM) { g.restore(); CAM = null; } }
const shakeXY = (t, amt) => { const f = Math.floor(t * 30); return [(hash(f) * 2 - 1) * amt, (hash(f + 99) * 2 - 1) * amt]; };

// ---------- full-frame effects (call outside the camera) ----------
function flash(k, c = '#ffffff') { if (k <= 0) return; g.save(); g.globalAlpha = clamp(k); fill(c); g.restore(); }
function iris(cx, cy, r, c = '#000000') { g.save(); g.beginPath(); g.rect(0, 0, W, H); g.arc(cx, cy, Math.max(0, r), 0, TAU, true); g.fillStyle = c; g.fill('evenodd'); g.restore(); }
function vignette(k = .45) { g.save(); g.fillStyle = radialGrad(W / 2, H / 2, Math.min(W, H) * .35, Math.hypot(W, H) * .62, [[0, 'rgba(0,0,0,0)'], [1, `rgba(0,0,0,${k})`]]); g.fillRect(0, 0, W, H); g.restore(); }
let _grainTile = null;
function grain(amt = .05) {
  if (!_grainTile) {
    _grainTile = document.createElement('canvas'); _grainTile.width = _grainTile.height = 256;
    const gx = _grainTile.getContext('2d'), id = gx.createImageData(256, 256), r = mulberry32(99);
    for (let i = 0; i < id.data.length; i += 4) { const v = r() * 255; id.data[i] = id.data[i + 1] = id.data[i + 2] = v; id.data[i + 3] = 255; }
    gx.putImageData(id, 0, 0);
  }
  const f = Math.floor(T * FPS);
  g.save(); g.globalAlpha = amt; g.globalCompositeOperation = 'overlay';
  g.translate(-Math.floor(hash(f) * 256), -Math.floor(hash(f + 7) * 256));
  g.fillStyle = g.createPattern(_grainTile, 'repeat'); g.fillRect(0, 0, W + 256, H + 256);
  g.restore();
}

// ---------- images ----------
// const IMG = loadImages({ logo: 'assets/logo.png' }); then g.drawImage(IMG.logo, x, y, w, h). The renderer waits for them.
const LOADING = [];
function loadImages(map) {
  const out = {};
  for (const [k, src] of Object.entries(map)) {
    const im = new Image(); out[k] = im;
    LOADING.push(new Promise(ok => { im.onload = ok; im.onerror = () => { console.error('image failed: ' + src); ok(); }; }));
    im.src = src;
  }
  return out;
}
