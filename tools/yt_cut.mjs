// tools/yt_cut.mjs: make the YouTube Shorts cut of a render, 60 s or less.
//   node tools/yt_cut.mjs <video.mp4> [--keep=start|end] [--from=<s> --to=<s>] [--max=59.5]
//                         [--lyrics=<file> | --rev=<commit>] [--out=out/<name>_yt.mp4]
// YouTube blocks worldwide any Short over 60 s that carries a Content ID claim (every label-owned song), while a claimed
// Short of 60 s or less stays up with the song. TikTok and Instagram keep the full >= 62 s render; YouTube gets this.
// The cut never splits a lyric line: it reads the karaoke timings (src/lyrics.js on disk, which is the render's own
// right after rendering; a kit's episodes/<name>.lyrics.js with --lyrics=; for an older render, --rev=<a commit
// holding its lyrics>).
//   --keep=start (default): from 0 to the latest line end under --max, audio faded out.
//   --keep=end: for story episodes, whose payoff is the ending: up to the video's end, from the earliest line that
//     fits, starting when the karaoke shows that line (not the one before it). Up to 0.5 s of the tail may be trimmed
//     to fit. "Dans le club": 16.07–75.57 s, from "Et tu lèves un bras" (the user found a 32 s cut too short).
//   --from= --to=: a hand-picked window.
// A video already under --max is returned as is. Prints the output path on the last line.
import { execFileSync, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const argv = process.argv.slice(2);
const file = argv.find(a => !a.startsWith('--'));
const opt = Object.fromEntries(argv.filter(a => a.startsWith('--')).map(a => { const [k, ...v] = a.slice(2).split('='); return [k, v.join('=')]; }));
if (!file || !fs.existsSync(file)) { console.error('usage: node tools/yt_cut.mjs <video.mp4> [--keep=start|end] [--from= --to=] [--max=59.5] [--lyrics=<file> | --rev=<commit>] [--out=...]'); process.exit(1); }
const MAX = +(opt.max || 59.5), REV = opt.rev, KEEP = opt.keep || 'start', TAIL = 0.5;
const out = opt.out || file.replace(/\.mp4$/, '_yt.mp4');
const root = path.dirname(new URL(import.meta.url).pathname) + '/..';
const probe = k => String(spawnSync('ffprobe', ['-v', 'error', ...k, '-of', 'csv=p=0', file]).stdout).trim();
const dur = +probe(['-show_entries', 'format=duration']);
const [fn, fd] = probe(['-select_streams', 'v:0', '-show_entries', 'stream=r_frame_rate']).split('/').map(Number);   // "30/1"
const fps = fn / (fd || 1) || 30;

if (dur <= MAX) { console.log(`${path.basename(file)} is ${dur.toFixed(2)} s, already a Short`); console.log(file); process.exit(0); }

// Karaoke timings of the render: window.LYRICS = [[[t, word], …] per line], window.LINE_END = [t per line].
let lines = null;
try {
  const window = {};
  const src = opt.lyrics ? fs.readFileSync(opt.lyrics, 'utf8') : REV ? execFileSync('git', ['show', `${REV}:src/lyrics.js`], { cwd: root, encoding: 'utf8' }) : fs.readFileSync(`${root}/src/lyrics.js`, 'utf8');
  const from = opt.lyrics || (REV ? `src/lyrics.js at ${REV}` : 'src/lyrics.js');
  vm.runInNewContext(src, { window });
  // The lyrics must belong to this render: the last line ends with the video (within a hand cut's fade tail).
  if (Math.abs(window.LINE_END.at(-1) - dur) < 2.5) lines = window.LYRICS.map((l, i) => ({ first: l[0][0], last: l.at(-1)[0], end: window.LINE_END[i], text: l.map(w => w[1]).join(' ') }));
  else console.warn(`${from} ends at ${window.LINE_END.at(-1)} s, the video at ${dur.toFixed(2)} s: not this render (pass --lyrics=<kit lyrics> or --rev=<render commit>)`);
} catch (e) { console.warn(`no lyrics${REV ? ' at ' + REV : ''}: ${e.message.split('\n')[0]}`); }

let a = 0, end = MAX, why = 'no lyrics, hard cut', fadeOut = Math.min(0.7, MAX / 10);
if (opt.from || opt.to) {
  a = +(opt.from || 0); end = Math.min(dur, +(opt.to || dur)); why = 'hand-picked window';
  if (end - a > MAX + 1e-6) { console.error(`window ${a}–${end} s is ${(end - a).toFixed(2)} s, over ${MAX} s`); process.exit(1); }
  fadeOut = end < dur - 0.05 ? 0.3 : 0;
} else if (KEEP === 'end') {
  if (!lines) { console.error('--keep=end needs this render\'s lyrics (--lyrics=<kit lyrics> or --rev=<commit>)'); process.exit(1); }
  // dance.js shows line i from 0.35 s before its first word, once the line before it has ended: start on that frame
  const shown = lines.map((l, i) => Math.ceil(Math.max(l.first - 0.35, i ? lines[i - 1].end : 0) * fps - 1e-6) / fps);
  const i = shown.findIndex(s => s > 0 && dur - s <= MAX + TAIL);
  if (i < 0) { console.error(`no lyric line starts late enough to end the cut at ${dur.toFixed(2)} s`); process.exit(1); }
  a = shown[i]; end = Math.min(dur, a + MAX); why = `from "${lines[i].text}" to the end`;
  fadeOut = end < dur - 0.05 ? 0.3 : 0;
} else if (lines) {
  // the line's end is its karaoke hold, trimmed so the next line's first word isn't heard
  const ends = lines.map((l, i) => ({ i, t: Math.min(l.end, i + 1 < lines.length ? lines[i + 1].first - 0.05 : dur) })).filter(e => e.t <= MAX);
  if (!ends.length) { console.error(`no lyric line ends before ${MAX} s`); process.exit(1); }
  const e = ends.at(-1);
  end = e.t; why = `after "${lines[e.i].text}"`; fadeOut = Math.min(0.7, end / 10);
}
const len = end - a;
if (len < 45) console.warn(`the cut is short (${len.toFixed(2)} s)`);
const af = [a > 0 ? 'afade=t=in:st=0:d=0.03' : null, fadeOut ? `afade=t=out:st=${(len - fadeOut).toFixed(3)}:d=${fadeOut.toFixed(3)}` : null].filter(Boolean);
const r = spawnSync('ffmpeg', ['-v', 'error', '-y', ...(a > 0 ? ['-ss', a.toFixed(3)] : []), '-i', file, '-t', len.toFixed(3), ...(af.length ? ['-af', af.join(',')] : []),
  '-c:v', 'libx264', '-crf', '18', '-preset', 'medium', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '192k', '-movflags', '+faststart', out], { stdio: 'inherit' });
if (r.status) process.exit(r.status);
console.log(`cut ${dur.toFixed(2)} s → ${a.toFixed(2)}–${end.toFixed(2)} s (${len.toFixed(2)} s), ${why}`);
console.log(out);
