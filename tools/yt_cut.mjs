// tools/yt_cut.mjs: make the YouTube Shorts cut of a render, 60 s or less.
//   node tools/yt_cut.mjs <video.mp4> [--max=59.5] [--rev=<commit>] [--out=out/<name>_yt.mp4]
// YouTube blocks worldwide any Short over 60 s that carries a Content ID claim (every label-owned song), while a claimed
// Short of 60 s or less stays up with the song. TikTok and Instagram keep the full >= 62 s render; YouTube gets this.
// The cut ends where a lyric line ends, never inside one: it reads the karaoke timings (src/lyrics.js on disk, which is
// the render's own right after rendering; for an older render, --rev=<a commit holding its lyrics>) and keeps the latest
// line end under --max, then fades the audio out.
// A video already under --max is returned as is. Prints the output path on the last line.
import { execFileSync, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const argv = process.argv.slice(2);
const file = argv.find(a => !a.startsWith('--'));
const opt = Object.fromEntries(argv.filter(a => a.startsWith('--')).map(a => { const [k, ...v] = a.slice(2).split('='); return [k, v.join('=')]; }));
if (!file || !fs.existsSync(file)) { console.error('usage: node tools/yt_cut.mjs <video.mp4> [--max=59.5] [--rev=<commit>] [--out=...]'); process.exit(1); }
const MAX = +(opt.max || 59.5), REV = opt.rev;
const out = opt.out || file.replace(/\.mp4$/, '_yt.mp4');
const root = path.dirname(new URL(import.meta.url).pathname) + '/..';
const dur = +spawnSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', file]).stdout;

if (dur <= MAX) { console.log(`${path.basename(file)} is ${dur.toFixed(2)} s, already a Short`); console.log(file); process.exit(0); }

// Karaoke timings of the render: window.LYRICS = [[[t, word], …] per line], window.LINE_END = [t per line].
let lines = null;
try {
  const window = {};
  const src = REV ? execFileSync('git', ['show', `${REV}:src/lyrics.js`], { cwd: root, encoding: 'utf8' }) : fs.readFileSync(`${root}/src/lyrics.js`, 'utf8');
  vm.runInNewContext(src, { window });
  // The lyrics must belong to this render: the last line ends with the video (within a hand cut's fade tail).
  if (Math.abs(window.LINE_END.at(-1) - dur) < 2.5) lines = window.LYRICS.map((l, i) => ({ first: l[0][0], last: l.at(-1)[0], end: window.LINE_END[i], text: l.map(w => w[1]).join(' ') }));
  else console.warn(`src/lyrics.js${REV ? ' at ' + REV : ''} ends at ${window.LINE_END.at(-1)} s, the video at ${dur.toFixed(2)} s: not this render (pass --rev=<render commit>)`);
} catch (e) { console.warn(`no lyrics${REV ? ' at ' + REV : ''}: ${e.message.split('\n')[0]}`); }

let end = MAX, why = 'no lyrics, hard cut';
if (lines) {
  // the line's end is its karaoke hold, trimmed so the next line's first word isn't heard
  const ends = lines.map((l, i) => ({ i, t: Math.min(l.end, i + 1 < lines.length ? lines[i + 1].first - 0.05 : dur) })).filter(e => e.t <= MAX);
  if (!ends.length) { console.error(`no lyric line ends before ${MAX} s`); process.exit(1); }
  const e = ends.at(-1);
  end = e.t; why = `after "${lines[e.i].text}"`;
  if (end < 45) console.warn(`the cut is short (${end.toFixed(2)} s): the song has a long line across ${MAX} s`);
}
const fade = Math.min(0.7, end / 10);
const r = spawnSync('ffmpeg', ['-v', 'error', '-y', '-i', file, '-t', end.toFixed(3),
  '-af', `afade=t=out:st=${(end - fade).toFixed(3)}:d=${fade.toFixed(3)}`,
  '-c:v', 'libx264', '-crf', '18', '-preset', 'medium', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '192k', '-movflags', '+faststart', out], { stdio: 'inherit' });
if (r.status) process.exit(r.status);
console.log(`cut ${dur.toFixed(2)} → ${end.toFixed(2)} s, ${why}`);
console.log(out);
