// tools/beats.mjs: analyse a music track so shots can land on its beats.
//   node tools/beats.mjs assets/audio/song.mp3 [--min=70] [--max=180] [--bpm=<exact, skips the estimate>] [--offset=<s, beat 0>] [--grid=<json>] [--out=src/beats.js]
// Writes window.BEATS = { bpm, offset, onsets, bars } where offset is the time of beat 0, onsets are strong
// transients (hits worth animating) and bars holds loudness per bar (find the drop and the quiet intro).
// The estimate is good for steady pop, electronic and rock tracks; check it by ear in the preview and nudge
// offset or bpm by hand if the bounce drifts.
import { spawnSync } from 'node:child_process';
import { writeFileSync, mkdirSync, readFileSync } from 'node:fs';
import { dirname } from 'node:path';

const file = process.argv[2];
const opt = Object.fromEntries(process.argv.slice(3).map(a => { const [k, v] = a.replace(/^--/, '').split('='); return [k, v]; }));
if (!file) { console.error('usage: node tools/beats.mjs <audio file> [--min=70 --max=180 --out=src/beats.js]'); process.exit(1); }
const SR = 22050, FRAME = 1024, HOP = 512, hopT = HOP / SR;
const r = spawnSync('ffmpeg', ['-v', 'error', '-i', file, '-ac', '1', '-ar', String(SR), '-f', 'f32le', '-'], { maxBuffer: 1 << 30 });
if (r.status) { console.error(String(r.stderr)); process.exit(1); }
const raw = Buffer.from(r.stdout), x = new Float32Array(raw.buffer.slice(raw.byteOffset, raw.byteOffset + raw.length - raw.length % 4));
const dur = x.length / SR, nF = Math.floor((x.length - FRAME) / HOP);

// Onset strength: rise in log energy of the full signal and of its first difference (which favours transients).
const e1 = new Float64Array(nF), e2 = new Float64Array(nF);
for (let f = 0; f < nF; f++) {
  let a = 0, b = 0; const o = f * HOP;
  for (let i = 1; i < FRAME; i++) { const s = x[o + i], d = s - x[o + i - 1]; a += s * s; b += d * d; }
  e1[f] = Math.log(a + 1e-9); e2[f] = Math.log(b + 1e-9);
}
let on = new Float64Array(nF);
for (let f = 1; f < nF; f++) on[f] = Math.max(0, e1[f] - e1[f - 1]) + Math.max(0, e2[f] - e2[f - 1]);
const loc = new Float64Array(nF);   // subtract a local mean so sustained loud parts do not dominate
for (let f = 0; f < nF; f++) { let s = 0, c = 0; for (let k = Math.max(0, f - 8); k <= Math.min(nF - 1, f + 8); k++) { s += on[k]; c++; } loc[f] = Math.max(0, on[f] - s / c); }
on = loc;

// Tempo: autocorrelation over the allowed BPM range, weighted towards 120 to avoid octave errors.
const minB = +(opt.min || 70), maxB = +(opt.max || 180);
let best = { s: -1, lag: 0 };
const ac = lag => { let s = 0; for (let f = 0; f + lag < nF; f++) s += on[f] * on[f + lag]; return s / (nF - lag); };
for (let lag = Math.floor(60 / (maxB * hopT)); lag <= Math.ceil(60 / (minB * hopT)); lag++) {
  const bpm = 60 / (lag * hopT), w = Math.exp(-.5 * Math.pow(Math.log2(bpm / 120), 2)), s = ac(lag) * w;
  if (s > best.s) best = { s, lag };
}
const [y0, y1, y2] = [ac(best.lag - 1), ac(best.lag), ac(best.lag + 1)], den = y0 - 2 * y1 + y2;
// --bpm=<exact> skips the estimate: autocorrelation can be ~0.4 BPM off ("Dans le club": 115.4 for a true 115.0),
// which drifts a full beat over a minute. Measure it from two repeats of the chorus (their offset is whole bars).
const lag = opt.bpm ? 60 / (+opt.bpm * hopT) : best.lag + (den ? .5 * (y0 - y2) / den : 0), bpm = 60 / (lag * hopT);

// Phase: the offset whose beat grid collects the most onset strength.
let bestP = { s: -1, p: 0 };
for (let p = 0; p < lag; p++) { let s = 0; for (let k = p; k < nF; k += lag) s += on[Math.round(k)] || 0; if (s > bestP.s) bestP = { s, p }; }
// --offset=<s> pins beat 0 by hand: in techno the off-beat open hats outweigh the kick in the full band, so the
// estimate can land half a beat late ("99 Luftballons": 0.163 s for a kick at 0.000 s; measure the kick's transients).
const offset = opt.offset != null ? +opt.offset : +(bestP.p * hopT + FRAME / 2 / SR).toFixed(3);

// Strong onsets: local peaks above mean + 1.5 sd, at least 100 ms apart.
const mean = on.reduce((a, b) => a + b, 0) / nF, sd = Math.sqrt(on.reduce((a, b) => a + (b - mean) ** 2, 0) / nF);
const onsets = []; let last = -1;
for (let f = 1; f < nF - 1; f++) {
  const t = f * hopT;
  if (on[f] > mean + 1.5 * sd && on[f] >= on[f - 1] && on[f] >= on[f + 1] && t - last > .1) { onsets.push(+t.toFixed(3)); last = t; }
}

// --grid=<json with { grid: [s, ...] }>: a tempo map, the time of every beat from beat 0 (2026-10-01, "Stop The
// Wedding!": its band plays the choruses at ~132.1 BPM and the verse at ~134.9, so one BPM drifted ±70 ms off the kick).
// It replaces the estimate: beat 0 is its first time, the BPM its mean, the bars every 4 of its beats, and the engine
// (src/core.js beatGrid) interpolates beat positions between its times.
const grid = opt.grid ? JSON.parse(readFileSync(opt.grid, 'utf8')).grid : null;
const gBpm = grid ? 60 * (grid.length - 1) / (grid.at(-1) - grid[0]) : 0;

// Loudness per bar (4 beats), normalised 0..1.
const barLen = 4 * 60 / bpm, bars = [];
const barTimes = grid ? grid.filter((_, i) => i % 4 === 0) : [];
if (!grid) for (let t = offset; t < dur; t += barLen) barTimes.push(t);
barTimes.forEach((t, k) => {
  const t1 = barTimes[k + 1] ?? t + (grid ? barTimes[k] - (barTimes[k - 1] ?? t - barLen) : barLen);
  const a = Math.floor(t * SR), b = Math.min(x.length, Math.floor(t1 * SR)); let s = 0;
  for (let i = a; i < b; i++) s += x[i] * x[i];
  if (t < dur) bars.push({ t: +t.toFixed(3), rms: Math.sqrt(s / Math.max(1, b - a)) });
});
const peak = Math.max(...bars.map(b => b.rms)) || 1;
bars.forEach(b => b.rms = +(b.rms / peak).toFixed(3));

const out = opt.out || 'src/beats.js';
mkdirSync(dirname(out), { recursive: true });
const head = grid ? { bpm: +gBpm.toFixed(3), offset: grid[0], grid } : { bpm: +bpm.toFixed(2), offset };
writeFileSync(out, `// generated by tools/beats.mjs from ${file}\nwindow.BEATS = ${JSON.stringify({ file, duration: +dur.toFixed(3), ...head, onsets: onsets.slice(0, 4000), bars })};\n`);
console.log(`${file}: ${dur.toFixed(1)} s, ${head.bpm.toFixed(1)} BPM${grid ? ` (a tempo map of ${grid.length} beats)` : ''}, beat 0 at ${head.offset}s, ${onsets.length} onsets, ${bars.length} bars → ${out}`);
const loud = bars.map((b, i) => [i, b.rms]).sort((a, b) => b[1] - a[1]).slice(0, 4).map(([i]) => bars[i].t).sort((a, b) => a - b);
console.log('loudest bars start at: ' + loud.join('s, ') + 's');
