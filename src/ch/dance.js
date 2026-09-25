// dance.js: one chapter. Draws the low-res PS1 frame scaled 4x with nearest-neighbour, then karaoke lyrics on top.
window.THREE_READY = new Promise(ok => { window._threeReady = ok; });
LOADING.push(window.THREE_READY);

// Lyric lines with word start times (s): src/lyrics.js, written by tools/cut_song.mjs for the current cut.
const LYRICS = window.LYRICS, LINE_END = window.LINE_END;

// The dancer's emoji face (assets/ui/<name>_sticker.png, Qwen, Android emoji style) hops onto each word as it is sung.
// ps1.js sets window.STARS each frame to who is on screen; a duo gets both faces side by side.
const STICKERS = Object.fromEntries(['saxo', 'sadi', 'kob', 'compote'].map(n => {
  const im = new Image(); LOADING.push(new Promise(ok => { im.onload = im.onerror = ok; })); im.src = `assets/ui/${n}_sticker.png`; return [n, im];
}));

const PINK = '#ff5fa2', PINK_DARK = '#8a1452', SIZE = 84, HOP = 0.3;   // HOP: seconds a word-to-word jump takes

// word boxes for one line: centre x, baseline y, width (wrapped to the frame width)
function layout(words) {
  g.font = `700 ${SIZE}px ${CONFIG.fonts.cute}`;
  const gap = SIZE * 0.34, widths = words.map(w => g.measureText(w[1]).width), y0 = H * 0.23;
  const rows = []; let row = [], rw = 0;
  words.forEach((w, i) => { if (rw + widths[i] > W * 0.84 && row.length) { rows.push(row); row = []; rw = 0; } row.push(i); rw += widths[i] + gap; });
  rows.push(row);
  const box = [];
  rows.forEach((r, ri) => {
    const tw = r.reduce((a, i) => a + widths[i], 0) + gap * (r.length - 1); let x = (W - tw) / 2;
    r.forEach(i => { box[i] = { x: x + widths[i] / 2, y: y0 + ri * SIZE * 1.12, w: widths[i], row: ri }; x += widths[i] + gap; });
  });
  return box;
}

// Karaoke styles (?kstyle=): a = colour flip + small pop; b = words spring in as sung, hook word big, line
// punches on the beat; c = whole line shown, pink sweeps across each word as it is sung, words drop out at the end;
// d (default, user's pick 2026-09-25) = b's motion in chunky PS1 extruded type drawn at 1/3 res, the word being sung
// yellow and the rest pink. ?klabel=1 prints the style name (A/B tests).
const Q_K = new URLSearchParams(location.search), KSTYLE = Q_K.get('kstyle') || 'd', KLABEL = Q_K.has('klabel');
const KNAMES = { a: 'A · current', b: 'B · pop-in + hook', c: 'C · sweep + drop', d: 'D · PS1 chunky' };
const YELLOW = '#ffd43b';
const spring = u => u <= 0 ? 0 : 1 - Math.exp(-8 * u) * Math.cos(18 * u);          // 0 → ~1.25 overshoot → 1
const wobble = u => u <= 0 ? 0 : Math.exp(-8 * u) * Math.sin(18 * u);              // squash/stretch partner of spring
let lowCv = null;
function lowCtx() {   // 1/3-res buffer for the PS1 type, upscaled nearest-neighbour
  if (!lowCv) { lowCv = document.createElement('canvas'); lowCv.width = W / 3; lowCv.height = H / 3; }
  const c = lowCv.getContext('2d'); c.setTransform(1, 0, 0, 1, 0, 0); c.clearRect(0, 0, lowCv.width, lowCv.height); c.setTransform(1 / 3, 0, 0, 1 / 3, 0, 0);
  return c;
}

function karaoke(t) {
  const li = LYRICS.findIndex((l, i) => t >= l[0][0] - 0.35 && t < LINE_END[i]);
  if (li < 0) return;
  const words = LYRICS[li], box = layout(words), end = LINE_END[li];
  const appear = clamp((t - (words[0][0] - 0.35)) / 0.18), out = clamp((end - t) / 0.15);   // line pops in and out
  const durs = words.map(([ws], i) => (i + 1 < words.length ? words[i + 1][0] : end) - ws);
  let hook = 0; durs.forEach((d, i) => { if (d >= durs[hook]) hook = i; });            // longest-held word
  const beatK = 1 + 0.045 * pulse(t, 7);
  let cur = -1; words.forEach(([ws], i) => { if (t >= ws) cur = i; });                // the word being sung                                               // line punch on each beat
  const main = g;
  if (KSTYLE === 'd') g = lowCtx();
  g.save(); g.textAlign = 'center'; g.textBaseline = 'middle'; g.lineJoin = 'round';
  g.font = `700 ${SIZE}px ${CONFIG.fonts.cute}`;
  words.forEach(([ws, str], i) => {
    const b = box[i], on = t >= ws, u = t - ws;
    if (KSTYLE === 'a') {
      g.globalAlpha = Math.min(appear, out);
      const pop = on ? Math.exp(-u * 9) : 0, sc = (0.85 + 0.15 * appear) * (1 + 0.07 * pop);
      g.save(); g.translate(b.x, b.y - pop * 10); g.scale(sc, sc);
      g.lineWidth = 16; g.strokeStyle = on ? PINK_DARK : 'rgba(90,20,60,.85)'; g.strokeText(str, 0, 0);
      g.fillStyle = on ? PINK : '#fff'; g.fillText(str, 0, 0);
      g.restore(); return;
    }
    if (KSTYLE === 'c') {
      const drop = clamp((t - (end - 0.32 + i * 0.03)) / 0.22);                          // staggered fall-out
      g.globalAlpha = Math.min(appear, 1 - drop);
      const pop = on ? wobble(u) : 0, sc = (0.85 + 0.15 * appear) * beatK * (1 + 0.12 * Math.max(0, pop));
      g.save(); g.translate(b.x, b.y + drop * drop * 220); g.rotate(drop * (i % 2 ? 0.5 : -0.5)); g.scale(sc, sc);
      g.lineWidth = 16; g.strokeStyle = 'rgba(90,20,60,.85)'; g.strokeText(str, 0, 0);
      g.fillStyle = '#fff'; g.fillText(str, 0, 0);
      const f = on ? clamp(u / Math.min(1, Math.max(0.15, durs[i]))) : 0;              // sweep over the sung duration
      if (f > 0) {
        g.save(); g.beginPath(); g.rect(-b.w / 2 - 12, -SIZE, (b.w + 24) * f, SIZE * 2); g.clip();
        g.strokeStyle = PINK_DARK; g.strokeText(str, 0, 0); g.fillStyle = PINK; g.fillText(str, 0, 0); g.restore();
      }
      g.restore(); return;
    }
    // b and d: a word exists only once it is sung; it springs in with squash and stretch
    if (!on) return;
    g.globalAlpha = out;
    const isHook = i === hook, big = isHook ? 1.28 : 1, s = spring(u) * big * beatK, w = wobble(u) * 0.22;
    const shake = isHook ? Math.sin(t * 55) * 3 * Math.exp(-u * 2.5) : 0;
    const yel = KSTYLE === 'd' ? i === cur : isHook, col = yel ? YELLOW : PINK, dark = yel ? '#6b3a00' : PINK_DARK;
    const tilt = KSTYLE === 'd' ? (i % 2 ? 0.06 : -0.05) : 0;
    g.save(); g.translate(b.x + shake, b.y - (isHook ? 8 : 0)); g.rotate(tilt); g.scale(s * (1 + w), s * (1 - w));
    if (KSTYLE === 'd') {
      g.lineWidth = 18; g.strokeStyle = '#1a0a14';                                      // extruded block, outlined
      for (let k = 18; k >= 0; k -= 3) g.strokeText(str, k * 0.5, k);
      g.fillStyle = yel ? '#c77800' : '#c2185b'; for (let k = 18; k > 0; k -= 3) g.fillText(str, k * 0.5, k);
      g.fillStyle = col; g.fillText(str, 0, 0);
      g.fillStyle = 'rgba(255,255,255,.55)'; g.save(); g.beginPath(); g.rect(-b.w, -SIZE, b.w * 2, SIZE * 0.72); g.clip(); g.fillText(str, 0, 0); g.restore();   // top shine band
    } else {
      g.lineWidth = 16; g.strokeStyle = dark; g.strokeText(str, 0, 0);
      g.fillStyle = col; g.fillText(str, 0, 0);
    }
    g.restore();
  });
  g.restore();
  if (KSTYLE === 'd') { g = main; g.save(); g.imageSmoothingEnabled = false; g.drawImage(lowCv, 0, 0, W, H); g.restore(); }
  g.save();
  g.globalAlpha = Math.min(appear, out);
  // sticker: hops from word to word as each is sung, on every row (on a second row it overlaps the row above, which
  // is fine), and dances to the beat (bob, sway, squash on each beat). Drops in with the line.
  let k = -1; words.forEach(([ws], i) => { if (t >= ws) k = i; });
  const top = i => box[i].y - SIZE * 0.58;
  let x = box[Math.max(0, k)].x, y = top(Math.max(0, k)), hop = 0;
  if (k > 0) {
    const u = clamp((t - words[k][0]) / Math.min(HOP, words[k][0] - words[k - 1][0]));
    if (u < 1) { x = box[k - 1].x + (x - box[k - 1].x) * u; y = top(k - 1) + (y - top(k - 1)) * u; hop = Math.sin(Math.PI * u) * 80; }
  }
  const drop = clamp((t - (words[0][0] - 0.35)) / 0.35); y -= (1 - drop) * (1 - drop) * 260;
  const p = pulse(t, 7), side = beatN(t) % 2 ? 1 : -1;                        // 1 on each beat, decaying
  const bob = Math.abs(Math.sin(Math.PI * bpOf(t))) * 16;                     // little bounce every beat
  const sway = side * 0.16 * (1 - p) + side * 0.06, sq = 0.14 * p;           // lean left/right on alternate beats
  const faces = (window.STARS || ['saxo']).map(n => STICKERS[n]).filter(im => im && im.width);
  if (!faces.length && STICKERS.saxo.width) faces.push(STICKERS.saxo);
  const half = (faces.length > 1 ? 112 * 1.42 : 132) / 2 + 24; x = clamp(x, half, W - half);   // keep the faces in frame
  faces.forEach((im, j) => {
    const sw = faces.length > 1 ? 112 : 132, sh = sw * im.height / im.width, dx = (j - (faces.length - 1) / 2) * sw * 0.92;
    const s2 = j % 2 ? -1 : 1;   // a duo leans in opposite directions
    g.save(); g.translate(x + dx, y - hop - bob); g.rotate(sway * s2); g.scale(1 + sq, 1 - sq);
    g.shadowColor = 'rgba(0,0,0,.35)'; g.shadowBlur = 10; g.shadowOffsetY = 6;
    g.drawImage(im, -sw / 2, -sh, sw, sh); g.restore();
  });
  g.restore();
}

// action scenes (src/scenes.js): a white flash on a hit, a comic burst with a word at the hit point, a K.O. card
function burst(cx, cy, R, n, rot) {
  g.beginPath();
  for (let k = 0; k < n * 2; k++) { const a = rot + Math.PI * k / n, r = k % 2 ? R * 0.58 : R * (0.9 + 0.1 * Math.sin(k * 2.3)); g.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r); }
  g.closePath();
}
function sceneFx(fx, t) {
  if (fx.flash > 0.02) { g.save(); g.globalAlpha = 0.85 * fx.flash; g.fillStyle = '#fff'; g.fillRect(0, 0, W, H); g.restore(); }
  const comic = (x, y, word, k, big) => {
    const pop = 1 - Math.pow(1 - clamp(k * 1.6), 3), R = big * (0.55 + 0.45 * pop);
    g.save(); g.translate(x, y); g.rotate(-0.12);
    g.globalAlpha = clamp(k * 3); g.lineJoin = 'round';
    burst(0, 0, R * 1.08, 12, 0.2); g.fillStyle = '#e8173a'; g.fill();
    burst(0, 0, R, 12, 0.2); g.fillStyle = '#ffd43b'; g.fill(); g.lineWidth = 10; g.strokeStyle = '#1a0a14'; g.stroke();
    g.font = `700 ${Math.round(R * 0.62)}px ${CONFIG.fonts.cute}`; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.lineWidth = 16; g.strokeStyle = '#1a0a14'; g.strokeText(word, 0, 4); g.fillStyle = '#ff5fa2'; g.fillText(word, 0, 4);
    g.restore();
  };
  if (fx.pow > 0.02) {
    const x = clamp(fx.x ?? 0.5, 0.25, 0.75) * W, y = clamp(fx.y ?? 0.4, window.EPISODE ? 0.47 : 0.16, 0.7) * H;   // clear of the karaoke: two lyric rows reach ~33% and the burst's radius is ~14%
    comic(x, y, fx.word || 'POW!', fx.pow, 250);
  }
  if (fx.ko) comic(W / 2, H * (window.EPISODE ? 0.74 : 0.2), 'K.O.', fx.ko, 230);   // on the floor in an episode: the lyrics own the top, faces the middle
}

// bottom of the frame, below the characters' feet (at 76% it sat on them in close shots)
const WM_Y = H * 0.91;
function watermark() {
  g.save(); g.globalAlpha = 0.22; g.font = `600 64px ${CONFIG.fonts.cute}`; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.lineJoin = 'round'; g.lineWidth = 8; g.strokeStyle = 'rgba(0,0,0,.6)'; g.strokeText('@saxo.dance', W / 2, WM_Y);
  g.fillStyle = '#fff'; g.fillText('@saxo.dance', W / 2, WM_Y); g.restore();
}

chapter('dance', 0, DUR, [[0, function danceFloor(t) {
  g.imageSmoothingEnabled = false;
  if (window.render3d) {
    const f = window.render3d(t); g.drawImage(f, 0, 0, W, H);
    const wp = window.WHIP || 0;   // whip-pan: horizontal smear of the frame while the camera snaps into place
    if (wp > 0.04) { g.save(); for (let k = 1; k <= 4; k++) { g.globalAlpha = 0.28; g.drawImage(f, -wp * k * 55, 0, W, H); } g.restore(); }
  }
  g.imageSmoothingEnabled = true;
  watermark();
  // a standalone scene replaces the karaoke; in an episode the lyrics keep going and the FX sit on top
  if (window.EPISODE || !window.SCENE_FX) karaoke(t);
  if (window.SCENE_FX) sceneFx(window.SCENE_FX, t);
  if (KLABEL) { g.save(); g.font = `700 54px ${CONFIG.fonts.cute}`; g.textAlign = 'center'; g.lineJoin = 'round'; g.lineWidth = 10; g.strokeStyle = '#000'; g.strokeText(KNAMES[KSTYLE] || KSTYLE, W / 2, H * 0.075); g.fillStyle = YELLOW; g.fillText(KNAMES[KSTYLE] || KSTYLE, W / 2, H * 0.075); g.restore(); }
}]]);
