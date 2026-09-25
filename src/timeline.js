// timeline.js: chapters, shots, transitions, captions and overlays.
//
// chapter(name, start, end, [[t0, shotFn], ...]) registers a chapter. A shot fn is called as fn(t, lt, dur):
// t = video time, lt = t - t0, dur = shot length. It paints the WHOLE frame, background included, and must be a
// pure function of t. Give shot functions real names (function bounce(t, lt, dur) {...}); sheets label frames with them.

const CH = [];
function chapter(name, start, end, shots) { CH.push({ name, start, end, shots }); CH.sort((a, b) => a.start - b.start); }

// transition(at, kind, dur, opts): kinds dissolve | push | wipe | iris | flash | blocks | zoom, or opts.fn(p, A, B)
// for a custom one. Both neighbouring shots are painted and composited, so motivate it: a hit, a whoosh, a match cut.
const TRANSITIONS = [];
function transition(at, kind = 'dissolve', dur = .4, o = {}) { TRANSITIONS.push({ at, kind, dur, ...o }); }

// caption(a, b, text, opts): on-screen line (lyrics, voiceover, key message). opts.karaoke = true highlights as sung.
const CAPTIONS = [];
function caption(a, b, txt, o = {}) { CAPTIONS.push({ a, b, txt, o }); }

// overlay(fn): drawn every frame after the scene and transitions, e.g. a logo bug, grain, progress bar.
const OVERLAYS = [];
function overlay(fn) { OVERLAYS.push(fn); }

function shotAt(t) {
  const ch = CH.find(c => t >= c.start && t < c.end) || (t >= DUR - 1e-6 ? CH[CH.length - 1] : null);
  if (!ch) return null;
  let i = 0; while (i + 1 < ch.shots.length && t >= ch.shots[i + 1][0]) i++;
  const t0 = ch.shots[i][0], end = i + 1 < ch.shots.length ? ch.shots[i + 1][0] : ch.end;
  return { chapter: ch.name, i, fn: ch.shots[i][1], t0, end, name: ch.shots[i][1].name || `${ch.name}#${i}` };
}
function shotList() {
  return CH.flatMap(ch => ch.shots.map((s, i) => ({ chapter: ch.name, name: s[1].name || `${ch.name}#${i}`, start: s[0], end: i + 1 < ch.shots.length ? ch.shots[i + 1][0] : ch.end })));
}

function placeholder(t) {
  fill('#20222a');
  text('no shot at ' + t.toFixed(2) + 's', W / 2, H / 2, Math.round(H * .05), '#8a8f9c', { weight: 600, font: CONFIG.fonts.body });
}
// Paint the shot that is active at `lookup` (normally t) at time t.
function paintScene(t, lookup = t) {
  const s = shotAt(lookup);
  g.save();
  fill(CONFIG.background || '#000');
  if (!s) placeholder(t); else s.fn(t, t - s.t0, s.end - s.t0);
  camEnd();
  g.restore();
}

let _bufA = null, _bufB = null;
function buffer() { const c = document.createElement('canvas'); c.width = W; c.height = H; return c; }
function paintInto(canvas, t, lookup) { const prev = g; g = canvas.getContext('2d'); g.setTransform(1, 0, 0, 1, 0, 0); paintScene(t, lookup); g = prev; }

function composite(tr, p, A, B) {
  const e = easeInOut(p);
  if (tr.fn) return tr.fn(p, A, B);
  switch (tr.kind) {
    case 'dissolve': g.drawImage(A, 0, 0); g.globalAlpha = e; g.drawImage(B, 0, 0); g.globalAlpha = 1; break;
    case 'push': {
      const d = tr.dir === 'right' || tr.dir === 'down' ? -1 : 1, vert = tr.dir === 'up' || tr.dir === 'down';
      const L = vert ? H : W, a = -L * e * d, b = L * (1 - e) * d;
      g.drawImage(A, vert ? 0 : a, vert ? a : 0); g.drawImage(B, vert ? 0 : b, vert ? b : 0); break;
    }
    case 'wipe': {
      g.drawImage(A, 0, 0);
      const sl = W * .12, x = lerp(-sl - 20, W + sl + 20, e);
      g.save(); g.beginPath(); g.moveTo(-20, -20); g.lineTo(x + sl, -20); g.lineTo(x - sl, H + 20); g.lineTo(-20, H + 20); g.closePath(); g.clip(); g.drawImage(B, 0, 0); g.restore();
      if (tr.color && e > 0 && e < 1) line([[x + sl, -20], [x - sl, H + 20]], Math.max(W, H) * .02, tr.color);
      break;
    }
    case 'iris': {
      const cx = tr.x ?? W / 2, cy = tr.y ?? H / 2, R = Math.hypot(W, H) * .6;
      if (p < .5) { g.drawImage(A, 0, 0); iris(cx, cy, R * (1 - easeIn(p * 2)), tr.color || '#000000'); }
      else { g.drawImage(B, 0, 0); iris(cx, cy, R * easeOut((p - .5) * 2), tr.color || '#000000'); }
      break;
    }
    case 'flash': g.drawImage(p < .5 ? A : B, 0, 0); flash(1 - Math.abs(p - .5) * 2, tr.color || '#ffffff'); break;
    case 'blocks': {
      g.drawImage(A, 0, 0);
      const n = tr.size || Math.round(Math.max(W, H) / 16);
      g.save(); g.beginPath();
      for (let y = 0; y < H; y += n) for (let x = 0; x < W; x += n) if (hash(x * .37 + y * 1.91 + tr.at) < p) g.rect(x, y, n, n);
      g.clip(); g.drawImage(B, 0, 0); g.restore(); break;
    }
    case 'zoom': {
      g.save(); g.translate(W / 2, H / 2); g.scale(1 + e * .6, 1 + e * .6); g.globalAlpha = 1 - e; g.drawImage(A, -W / 2, -H / 2); g.restore();
      g.save(); g.translate(W / 2, H / 2); g.scale(1.25 - .25 * e, 1.25 - .25 * e); g.globalAlpha = e; g.drawImage(B, -W / 2, -H / 2); g.restore();
      break;
    }
    default: g.drawImage(p < .5 ? A : B, 0, 0);
  }
}

// ---------- captions ----------
function wrapWords(words, maxW) {
  const lines = [[]]; let w = 0; const sp = g.measureText(' ').width;
  for (const word of words) {
    const ww = g.measureText(word).width;
    if (lines[lines.length - 1].length && w + sp + ww > maxW) { lines.push([]); w = 0; }
    w += (lines[lines.length - 1].length ? sp : 0) + ww; lines[lines.length - 1].push(word);
  }
  return lines;
}
function drawCaptions(t) {
  const c = CAPTIONS.find(c => t >= c.a && t < c.b); if (!c) return;
  const st = Object.assign({ y: H * (1 - (CONFIG.safe?.bottom || 0)) - H * .1, size: Math.round(Math.min(W, H) * .06), font: CONFIG.fonts.body, weight: 800, color: '#ffffff', box: 'rgba(10,10,14,.72)', hi: '#ffd54a', maxW: W * .84, karaoke: false }, CONFIG.captions || {}, c.o);
  const k = backOut(seg(t, c.a, c.a + .2)) * (1 - ease(seg(t, c.b - .12, c.b)));
  if (k < .02) return;
  g.save();
  g.font = `${st.weight} ${st.size}px ${st.font}`; g.textBaseline = 'middle'; g.textAlign = 'left';
  const lines = wrapWords(c.txt.split(/\s+/), st.maxW), lh = st.size * 1.2, sp = g.measureText(' ').width;
  const widths = lines.map(l => l.reduce((s, w) => s + g.measureText(w).width, 0) + sp * (l.length - 1));
  const bw = Math.max(...widths) + st.size * 1.1, bh = lh * lines.length + st.size * .6, y0 = st.y - bh / 2;
  g.translate(W / 2, st.y); g.scale(k, k); g.translate(-W / 2, -st.y);
  if (st.box) rr(W / 2 - bw / 2, y0, bw, bh, st.size * .45, st.box);
  const total = c.txt.replace(/\s/g, '').length, singDur = Math.min(c.b - c.a - .1, .4 + total * .06);
  let sung = st.karaoke ? clamp((t - c.a) / singDur) * total : Infinity, done = 0;
  lines.forEach((l, li) => {
    let x = W / 2 - widths[li] / 2; const y = y0 + st.size * .3 + lh * (li + .5);
    l.forEach(word => {
      const ww = g.measureText(word).width, f = clamp((sung - done) / word.length); done += word.length;
      g.fillStyle = st.color; g.fillText(word, x, y);
      if (st.karaoke && f > 0) { g.save(); g.beginPath(); g.rect(x - 2, y - lh, ww * f + 2, lh * 2); g.clip(); g.fillStyle = st.hi; g.fillText(word, x, y); g.restore(); }
      x += ww + sp;
    });
  });
  g.restore();
}

// ---------- the frame ----------
function drawFrame(t) {
  T = t; reseed(t);
  g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
  const tr = TRANSITIONS.find(x => Math.abs(t - x.at) < x.dur / 2);
  if (!tr) paintScene(t);
  else {
    _bufA ??= buffer(); _bufB ??= buffer();
    paintInto(_bufA, t, tr.at - 1e-4); paintInto(_bufB, t, tr.at + 1e-4);
    g.save(); fill(CONFIG.background || '#000'); composite(tr, clamp((t - (tr.at - tr.dur / 2)) / tr.dur), _bufA, _bufB); g.restore();
  }
  OVERLAYS.forEach(fn => { g.save(); fn(t); g.restore(); });
  drawCaptions(t);
}
