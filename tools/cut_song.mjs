// tools/cut_song.mjs: pick the song window from its word-level transcript, cut the audio and write the karaoke timings.
//   node tools/cut_song.mjs <song.mp3> <transcript.json> [--min=62] [--start=<s>] [--out=assets/audio/chorus.mp3]
// The length is at least --min seconds, but the song decides the exact end: the window starts on the first word of a
// lyric line and ends after the last word of one, so a line or chorus is never cut off. Among the windows that
// qualify, it prefers ones that end on the last line of the chorus, then the shortest.
// --start forces the window to begin at the line starting nearest that time.
// The transcript is the ElevenLabs speech-to-text JSON ({ words: [{ text, start, end, type }] }).
// Writes the cut mp3, src/lyrics.js (window.LYRICS, window.LINE_END) and prints the duration to put in video.config.js.
import { readFileSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

const [song, tr] = process.argv.slice(2).filter(a => !a.startsWith('--'));
const opt = Object.fromEntries(process.argv.slice(2).filter(a => a.startsWith('--')).map(a => { const [k, v] = a.slice(2).split('='); return [k, v]; }));
if (!song || !tr) { console.error('usage: node tools/cut_song.mjs <song.mp3> <transcript.json> [--min=62] [--start=<s>] [--out=...]'); process.exit(1); }
const MIN = +(opt.min || 62), OUT = opt.out || 'assets/audio/chorus.mp3';
const songDur = +spawnSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', song]).stdout;

// words → lines, split after , . ! ? and on pauses longer than 0.9 s
const words = JSON.parse(readFileSync(tr, 'utf8')).words.filter(w => w.type === 'word');
const lines = []; let cur = [];
words.forEach((w, i) => {
  cur.push(w);
  const next = words[i + 1];
  if (/[,.!?]$/.test(w.text) || !next || next.start - w.end > 0.9) { lines.push(cur); cur = []; }
});
// Section boundaries: the song's own structure, so a cut never lands inside a verse or chorus.
// A boundary sits between two lines when there is a pause (>= 1.2 s), or where a repeated block (a run of >= 3 lines
// the song sings again later, like the chorus) begins or ends. Leading "but/and/so/'cause" is ignored when matching.
const key = l => l.map(w => w.text.toLowerCase().replace(/[^a-z']/g, '')).join(' ').replace(/^(but|and|so|'cause|cause|oh) /, '');
const K = lines.map(key), N = lines.length;
const inRep = new Array(N).fill(false), repStart = new Set(), repEnd = new Set(), runs = [];
for (let x = 0; x < N; x++) for (let y = x + 1; y < N; y++) {
  if (K[x] !== K[y] || (x && y && K[x - 1] === K[y - 1])) continue;   // only maximal runs
  let n = 0; while (y + n < N && x + n < y && K[x + n] === K[y + n]) n++;
  if (n < 3) continue;
  for (const o of [x, y]) { runs.push([o, o + n - 1]); repStart.add(o); repEnd.add(o + n - 1); for (let k = 0; k < n; k++) inRep[o + k] = true; }
}
const gapBefore = i => i ? lines[i][0].start - lines[i - 1].at(-1).end : Infinity;
const canStart = i => i === 0 || gapBefore(i) >= 1.2 || repStart.has(i);
const canEnd = j => j === N - 1 || gapBefore(j + 1) >= 1.2 || repEnd.has(j);
// the chorus is the repeated block sung most often (ties: the longest); ending on its last line is the strongest finish
const sigs = {}; runs.forEach(([p, q]) => { const g = K.slice(p, q + 1).join('|'); (sigs[g] ||= new Set()).add(p); });
const [chorusSig] = Object.entries(sigs).sort((a, b) => b[1].size - a[1].size || b[0].split('|').length - a[0].split('|').length)[0] || [''];
const chorusKeys = new Set(chorusSig.split('|'));
const chor0 = K.map((k, i) => inRep[i] && chorusKeys.has(k));
const isChorus = k => chor0[k] || (k > 0 && k + 1 < N && chor0[k - 1] && chor0[k + 1]);   // bridge single-line gaps
const chorusEnd = j => isChorus(j) && (j + 1 >= N || !isChorus(j + 1) || gapBefore(j + 1) >= 1.2 || K[j + 1] === chorusSig.split('|')[0]);

// start: a little before the first word, after the previous line has finished (the very first line keeps the intro)
const startAt = i => i === 0 ? 0 : Math.max(lines[i - 1].at(-1).end + 0.05, lines[i][0].start - 0.35);
// end: a tail after the last word, but before the next line begins
const endAt = j => Math.min(j + 1 < N ? lines[j + 1][0].start - 0.05 : songDur, lines[j].at(-1).end + 1.5);

let best = null;
const starts = opt.start != null
  ? [lines.reduce((b, l, i) => Math.abs(l[0].start - +opt.start) < Math.abs(lines[b][0].start - +opt.start) ? i : b, 0)]
  : lines.map((_, i) => i).filter(canStart);
for (const i of starts) for (let j = i; j < N; j++) {
  if (!canEnd(j)) continue;
  const a = startAt(i), b = endAt(j), len = b - a;
  if (len < MIN) continue;
  const score = (chorusEnd(j) ? 3 : 0) + (repStart.has(i) || i === 0 ? 1 : 0) - (len - MIN) / 8;
  if (!best || score > best.score) best = { i, j, a, b, len, score };
  break;   // later ends from the same start are only longer
}
if (!best) { console.error(`no window of ${MIN}s fits in this song`); process.exit(1); }

const { i, j, a, b, len } = best, fade = Math.min(0.8, b - lines[j].at(-1).end + 0.4);
const r = spawnSync('ffmpeg', ['-v', 'error', '-y', '-ss', a.toFixed(3), '-t', len.toFixed(3), '-i', song,
  '-af', `afade=t=in:d=0.05,afade=t=out:st=${(len - fade).toFixed(3)}:d=${fade.toFixed(3)}`, OUT], { stdio: 'inherit' });
if (r.status) process.exit(r.status);

const sel = lines.slice(i, j + 1), r2 = x => Math.round((x - a) * 100) / 100;
const LYRICS = sel.map(l => l.map(w => [r2(w.start), w.text]));
const LINE_END = sel.map((l, k) => r2(Math.min(k + 1 < sel.length ? sel[k + 1][0].start - 0.1 : b, l.at(-1).end + 1.2)));
writeFileSync('src/lyrics.js', `// generated by tools/cut_song.mjs from ${tr.split('/').pop()}, window ${a.toFixed(2)}–${b.toFixed(2)} s of ${song.split('/').pop()}\n` +
  `window.LYRICS = ${JSON.stringify(LYRICS)};\nwindow.LINE_END = ${JSON.stringify(LINE_END)};\n` +
  `// per line: true when it belongs to the chorus (the shot planner cuts faster there)\nwindow.LINE_CHORUS = ${JSON.stringify(sel.map((_, k) => isChorus(i + k)))};\n`);
console.log(`cut ${a.toFixed(2)}–${b.toFixed(2)} s (${len.toFixed(2)} s): "${key(sel[0])}" … "${key(sel.at(-1))}"`);
console.log(`set duration: ${Math.ceil(len * 100) / 100} in video.config.js, then run node tools/beats.mjs ${OUT}`);
