// render.mjs: drive studio.html in headless Chrome. Run from the project root.
//
//   node render.mjs --serve[=5173]                         preview in a browser (with sound) at http://127.0.0.1:5173
//   node render.mjs --shots [--chapter=name] [--w=480]     contact sheets: first / middle / last frame of every shot
//   node render.mjs --sheet=1.2,1.3,1.4 [--cols=3] [--w=640] [--out=out/check/sheet.jpg]   chosen times on one image
//   node render.mjs --stills=0.5,3.2 [--out=out/stills]    full-resolution PNG stills
//   node render.mjs --clip=2:5 [--out=out/clip.mp4]        quick MP4 of a range, with audio
//   node render.mjs --frames[=a:b] [--workers=4]           full-quality JPEG frames → out/frames (parallel, resumable)
//   node render.mjs --audio                                build out/audio/mix.wav (score + tracks)
//   node render.mjs --encode [--out=out/video.mp4] [--crf=18]   frames + audio → MP4 (run --frames first)
//   node render.mjs --qa[=a:b] [--qa-fps=10]            QA gate: floor contact + framing of every dog, exit 1 on failure (also runs before --frames and --clip; --no-qa skips)
//   node render.mjs --eval="CLIP_PROBE('gaming', [0, 1])"  print a page expression as JSON (probes, debugging)
//   node render.mjs --gif=0:4 [--w=480] [--gif-fps=15] [--out=out/loop.gif]   looping GIF
// Options: --chrome=<path> (or CHROME_PATH), --fps=<n> overrides the config, --gl=<angle backend> (metal, d3d11, swiftshader).
import puppeteer from 'puppeteer-core';
import http from 'node:http';
import { spawn } from 'node:child_process';
import { mkdirSync, writeFileSync, existsSync, statSync, renameSync, readdirSync, rmSync, createReadStream } from 'node:fs';
import { dirname, resolve, extname, join, sep } from 'node:path';

const args = Object.fromEntries(process.argv.slice(2).map(a => { const [k, ...v] = a.replace(/^--/, '').split('='); return [k, v.length ? v.join('=') : true]; }));
const ROOT = process.cwd(), OUT = 'out', FRAMES = join(OUT, 'frames'), MIX = join(OUT, 'audio', 'mix.wav');
const run = (cmd, a) => new Promise((ok, bad) => { const p = spawn(cmd, a, { stdio: 'inherit' }); p.on('error', bad); p.on('close', c => c ? bad(new Error(`${cmd} exited ${c}`)) : ok()); });
const times = s => String(s).split(',').map(Number);
const pad = (i, n = 5) => String(i).padStart(n, '0');

// ---------- static server (http, not file://, so images, fonts and audio load without canvas tainting) ----------
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.gif': 'image/gif', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.woff': 'font/woff', '.ttf': 'font/ttf', '.otf': 'font/otf', '.mp3': 'audio/mpeg', '.wav': 'audio/wav', '.ogg': 'audio/ogg', '.m4a': 'audio/mp4' };
function serve(port = 0) {
  const server = http.createServer((req, res) => {
    const rel = decodeURIComponent(new URL(req.url, 'http://x').pathname).replace(/^\/+/, '') || 'studio.html';
    if (rel === 'favicon.ico') { res.writeHead(204); return res.end(); }
    const f = resolve(ROOT, rel);
    if ((f !== ROOT && !f.startsWith(ROOT + sep)) || !existsSync(f) || statSync(f).isDirectory()) { res.writeHead(404); return res.end('not found'); }
    const size = statSync(f).size, type = MIME[extname(f).toLowerCase()] || 'application/octet-stream';
    const range = /bytes=(\d*)-(\d*)/.exec(req.headers.range || '');
    if (range) {   // range requests let <audio> seek in the preview
      const a = range[1] ? +range[1] : 0, b = range[2] ? +range[2] : size - 1;
      res.writeHead(206, { 'Content-Type': type, 'Content-Range': `bytes ${a}-${b}/${size}`, 'Accept-Ranges': 'bytes', 'Content-Length': b - a + 1, 'Cache-Control': 'no-store' });
      return createReadStream(f, { start: a, end: b }).pipe(res);
    }
    res.writeHead(200, { 'Content-Type': type, 'Content-Length': size, 'Accept-Ranges': 'bytes', 'Cache-Control': 'no-store' });
    createReadStream(f).pipe(res);
  });
  return new Promise(ok => server.listen(port, '127.0.0.1', () => ok(server)));
}

if (args.serve) {
  const port = args.serve === true ? 5173 : +args.serve;
  await serve(port);
  console.log(`preview: http://127.0.0.1:${port}/studio.html   (space = play, arrows = frame step, ?t=12.5 opens at a time)`);
  await new Promise(() => {});
}

function findChrome() {
  if (args.chrome) return args.chrome;
  if (process.env.CHROME_PATH) return process.env.CHROME_PATH;
  const c = {
    darwin: ['/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', '/Applications/Chromium.app/Contents/MacOS/Chromium'],
    win32: ['C:/Program Files/Google/Chrome/Application/chrome.exe', 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe'],
    linux: ['/usr/bin/google-chrome', '/usr/bin/google-chrome-stable', '/usr/bin/chromium', '/usr/bin/chromium-browser'],
  }[process.platform] || [];
  const hit = c.find(existsSync);
  if (!hit) throw new Error('Chrome not found: pass --chrome=<path> or set CHROME_PATH');
  return hit;
}

const server = await serve();
const PAGE = `http://127.0.0.1:${server.address().port}/studio.html?render${args.query ? '&' + args.query : ''}`;   // --query=model=...&tex=256 passes page params
let browser = null;
async function openPage(tag = '') {
  browser ??= await puppeteer.launch({
    executablePath: findChrome(), headless: true, protocolTimeout: 0,
    args: ['--ignore-gpu-blocklist', '--enable-gpu-rasterization', '--disable-renderer-backgrounding', '--disable-background-timer-throttling', '--autoplay-policy=no-user-gesture-required', ...(args.gl ? [`--use-angle=${args.gl}`] : [])],
  });
  const page = await browser.newPage();
  page.on('console', m => { if (['error', 'warn'].includes(m.type())) console.log(`[page${tag}]`, m.text()); });
  page.on('pageerror', e => console.log(`[page error${tag}]`, e.message));
  await page.goto(PAGE, { waitUntil: 'load' });
  await page.waitForFunction('window.ready === true', { timeout: 600000 });   // 25 FBX clips per tab load slowly when 4 tabs start at once
  return page;
}
const frameOf = async (page, t, type, q) => {
  await page.evaluate(t => window.prepare ? window.prepare([t]) : null, t);   // async preload / shader compile
  const url = await page.evaluate((t, type, q) => window.renderAt(t, type, q), t, type, q);
  return Buffer.from(url.slice(url.indexOf(',') + 1), 'base64');
};

const first = await openPage();
const M = await first.evaluate(() => window.meta());
const fps = +(args.fps || M.fps), N = Math.round(M.DUR * fps);

// ---------- QA gate: checks the 3D frames automatically, so an unattended daily render can't ship a broken one ----------
// Rules (per visible dog, sampled at --qa-fps): never sink into the floor (lowest mesh point < -4 cm); never float
// (> 5 cm) unless the shot marks it airborne, or for longer than a jump (0.6 s); never leave the frame for over 0.5 s.
const QA = { sink: -0.04, float: 0.05, jump: 0.6, gone: 0.5 };
async function qa(a, b) {
  if (!(await first.evaluate(() => typeof window.QA_PROBE === 'function'))) { console.log('qa: no QA_PROBE on this page, skipped'); return true; }
  const qfps = +(args['qa-fps'] || 10), rows = [];
  for (let t = a; t < b - 1e-6; t += 1 / qfps) rows.push({ t: +t.toFixed(3), dogs: await first.evaluate(t => window.QA_PROBE(t), t) });
  const fails = [], runs = {};
  const flag = (rule, who, t0, t1, worst) => fails.push({ rule, who, from: +t0.toFixed(2), to: +t1.toFixed(2), worst });
  for (const { t, dogs } of rows) for (const d of dogs) {
    if (d.low < QA.sink) flag('sinks into the floor', d.who, t, t, d.low);
    const off = d.box[2] < 0 || d.box[0] > 1 || d.box[3] < 0 || d.box[1] > 1;
    for (const [rule, bad, lim] of [['floats above the floor', d.low > QA.float && !d.air, QA.jump], ['out of frame', off, QA.gone]]) {
      const k = d.who + rule, r = runs[k];
      if (bad) { if (r) { r.t1 = t; r.worst = Math.max(r.worst, d.low); } else runs[k] = { t0: t, t1: t, worst: d.low }; }
      else if (r) { if (r.t1 - r.t0 + 1 / qfps > lim) flag(rule, d.who, r.t0, r.t1, +r.worst.toFixed(3)); delete runs[k]; }
    }
  }
  for (const [k, r] of Object.entries(runs)) { const rule = k.includes('floats') ? 'floats above the floor' : 'out of frame', lim = rule === 'out of frame' ? QA.gone : QA.jump;
    if (r.t1 - r.t0 + 1 / qfps > lim) flag(rule, k.replace(rule, ''), r.t0, r.t1, +r.worst.toFixed(3)); }
  // merge single-frame sink flags into ranges
  const merged = []; for (const f of fails) { const m = merged.at(-1); if (m && m.rule === f.rule && m.who === f.who && f.from - m.to <= 1.5 / qfps) { m.to = f.to; m.worst = Math.min(m.worst, f.worst); } else merged.push({ ...f }); }
  const report = { range: [a, b], fps: qfps, samples: rows.length, pass: !merged.length, fails: merged, lowest: rows.flatMap(r => r.dogs.map(d => d.low)).reduce((m, v) => Math.min(m, v), Infinity) };
  mkdirSync(join(OUT, 'check'), { recursive: true }); writeFileSync(join(OUT, 'check', 'qa.json'), JSON.stringify({ ...report, rows }, null, 1));
  console.log(report.pass ? `qa PASS: ${rows.length} samples, every dog on the floor and in frame` : `qa FAIL (${merged.length}):\n` + merged.map(f => `  ${f.who} ${f.rule} ${f.from}–${f.to}s (worst ${f.worst} m)`).join('\n') + '\n  details: out/check/qa.json');
  return report.pass;
}
const gate = async (a, b) => { if (args['no-qa']) return; if (!(await qa(a, b)) && !args.force) { console.log('render stopped by the QA gate: fix it, or pass --force to render anyway'); process.exitCode = 1; throw new Error('qa failed'); } };

async function buildAudio() {
  const inputs = [];
  if (M.hasScore) {
    const f = join(OUT, 'audio', 'synth.wav'); mkdirSync(dirname(f), { recursive: true });
    writeFileSync(f, Buffer.from(await first.evaluate(() => window.renderAudio()), 'base64'));
    inputs.push({ file: f, gain: 1, start: 0, offset: 0 });
  }
  for (const tr of M.audio.tracks || []) {
    if (!existsSync(tr.file)) throw new Error('audio track not found: ' + tr.file);
    inputs.push({ file: tr.file, gain: tr.gain ?? 1, start: tr.start || 0, offset: tr.offset || 0 });
  }
  if (!inputs.length) return null;
  mkdirSync(dirname(MIX), { recursive: true });
  const ins = inputs.flatMap(i => [...(i.offset ? ['-ss', String(i.offset)] : []), '-i', i.file]);
  const chains = inputs.map((i, k) => `[${k}:a]aresample=48000,aformat=channel_layouts=stereo,adelay=${Math.round(i.start * 1000)}:all=1,volume=${i.gain}[a${k}]`);
  const raw = join(OUT, 'audio', 'mix-raw.wav');
  const mix = `${chains.join(';')};${inputs.map((_, k) => `[a${k}]`).join('')}amix=inputs=${inputs.length}:normalize=0:duration=longest,apad,atrim=0:${M.DUR}[out]`;
  await run('ffmpeg', ['-y', '-loglevel', 'error', ...ins, '-filter_complex', mix, '-map', '[out]', '-c:a', 'pcm_f32le', raw]);
  // Master: two-pass EBU R128 loudness normalisation to a target (default -14 LUFS, what YouTube, Spotify and most
  // social apps play at) with a true-peak ceiling, so the track is as loud as it should be and never clips after AAC.
  const I = M.audio.lufs ?? -14, TP = M.audio.truePeak ?? -1.5;
  const m = await measure(raw, `loudnorm=I=${I}:TP=${TP}:LRA=11:print_format=json`);
  const lin = m ? `:measured_I=${m.input_i}:measured_TP=${m.input_tp}:measured_LRA=${m.input_lra}:measured_thresh=${m.input_thresh}:offset=${m.target_offset}:linear=true` : '';
  await run('ffmpeg', ['-y', '-loglevel', 'error', '-i', raw, '-af', `loudnorm=I=${I}:TP=${TP}:LRA=11${lin},aresample=48000,alimiter=limit=${Math.pow(10, (TP - .3) / 20).toFixed(3)}:level=false`, '-c:a', 'pcm_s16le', MIX]);
  const after = await measure(MIX, `loudnorm=I=${I}:TP=${TP}:print_format=json`);
  console.log(`audio → ${MIX}  (${inputs.map(i => i.file).join(' + ')})  ${after ? `${after.input_i} LUFS, true peak ${after.input_tp} dBTP` : ''}`);
  return MIX;
}
// Even dimensions and limited-range BT.709 yuv420p: JPEG frames are full range, and players and social apps expect TV range.
// Run an analysis filter and return the JSON block ffmpeg prints (loudnorm measurements).
function measure(file, filter) {
  return new Promise(ok => {
    const p = spawn('ffmpeg', ['-hide_banner', '-nostats', '-i', file, '-af', filter, '-f', 'null', '-']); let err = '';
    p.stderr.on('data', d => err += d); p.on('close', () => { const j = err.slice(err.lastIndexOf('{'), err.lastIndexOf('}') + 1); try { ok(JSON.parse(j)); } catch { ok(null); } });
  });
}
const EVEN = 'scale=trunc(iw/2)*2:trunc(ih/2)*2:in_range=pc:out_range=tv:out_color_matrix=bt709,format=yuv420p';
const TAGS = ['-color_range', 'tv', '-colorspace', 'bt709', '-color_primaries', 'bt709', '-color_trc', 'bt709'];

try {
  if (args.sheet || args.shots) {
    let sets;
    if (args.sheet) sets = [{ out: args.out || join(OUT, 'check', 'sheet.jpg'), ts: times(args.sheet), cols: +(args.cols || 3) }];
    else {
      const shots = (await first.evaluate(() => window.shotList())).filter(s => !args.chapter || s.chapter === args.chapter);
      const per = 6; sets = [];
      for (let i = 0; i < shots.length; i += per) {
        const ts = shots.slice(i, i + per).flatMap(s => { const e = Math.min(s.end, M.DUR) - .04; return [s.start + .04, (s.start + e) / 2, e]; });
        sets.push({ out: join(OUT, 'check', `shots${args.chapter ? '-' + args.chapter : ''}-${Math.floor(i / per) + 1}.jpg`), ts, cols: 3 });
      }
    }
    for (const s of sets) {
      mkdirSync(dirname(s.out), { recursive: true });
      await first.evaluate(ts => window.prepare ? window.prepare(ts) : null, s.ts);
      const { url, ms } = await first.evaluate((ts, c, w) => window.renderSheet(ts, c, w), s.ts, s.cols, +(args.w || (args.shots ? 480 : 640)));
      writeFileSync(s.out, Buffer.from(url.slice(url.indexOf(',') + 1), 'base64'));
      console.log(`${s.out}  ms/frame: ${ms.join(' ')}`);
    }
  } else if (args.stills) {
    const out = args.out || join(OUT, 'stills'); mkdirSync(out, { recursive: true });
    for (const s of times(args.stills)) {
      const t0 = Date.now(), f = `${out}/t${s.toFixed(2).replace('.', '_')}.png`;
      writeFileSync(f, await frameOf(first, s, 'image/png'));
      console.log(`${f}  ${Date.now() - t0} ms`);
    }
  } else if (args.audio) {
    if (!(await buildAudio())) console.log('no audio: no score(S) and no CONFIG.audio.tracks');
  } else if (args.qa) {
    const end = (await first.evaluate(() => window.SCENE_END)) || M.DUR;   // a scene is shorter than the song
    const [a, b] = args.qa === true ? [0, end] : String(args.qa).split(':').map(Number);
    if (!(await qa(a, b))) process.exitCode = 1;
  } else if (args.frames) {
    const [a, b] = args.frames === true ? [0, M.DUR] : String(args.frames).split(':').map(Number), workers = +(args.workers || 4);
    await gate(a, b);
    mkdirSync(FRAMES, { recursive: true });
    const i0 = Math.round(a * fps), i1 = Math.min(N - 1, Math.round(b * fps) - 1), todo = [];
    for (let i = i0; i <= i1; i++) { const f = `${FRAMES}/f${pad(i)}.jpg`; if (!existsSync(f) || statSync(f).size < 1000) todo.push(i); }
    console.log(`${todo.length} frames to render (${i1 - i0 + 1 - todo.length} already done), ${workers} workers, ${M.W}x${M.H} @ ${fps}fps`);
    let next = 0, done = 0; const start = Date.now();
    await Promise.all(Array.from({ length: workers }, async (_, w) => {
      const page = w === 0 ? first : await openPage('#' + w);
      while (next < todo.length) {
        const i = todo[next++], f = `${FRAMES}/f${pad(i)}.jpg`;
        writeFileSync(f + '.tmp', await frameOf(page, i / fps, 'image/jpeg', .94)); renameSync(f + '.tmp', f);
        if (++done % 30 === 0 || done === todo.length) {
          const el = (Date.now() - start) / 1000;
          console.log(`frame ${done}/${todo.length}  ${(el / done * 1000).toFixed(0)} ms/frame effective  eta ${((todo.length - done) * el / done / 60).toFixed(1)} min`);
        }
      }
    }));
  } else if (args.encode) {
    const out = args.out || join(OUT, 'video.mp4'), have = existsSync(FRAMES) ? readdirSync(FRAMES).filter(f => /^f\d+\.jpg$/.test(f)).length : 0;
    if (have < N) console.log(`warning: ${have}/${N} frames in ${FRAMES}; run --frames first (the video will be short)`);
    const mix = await buildAudio();
    mkdirSync(dirname(out), { recursive: true });
    await run('ffmpeg', ['-y', '-loglevel', 'error', '-stats', '-framerate', String(fps), '-i', `${FRAMES}/f%05d.jpg`, ...(mix ? ['-i', mix] : []),
      '-map', '0:v', ...(mix ? ['-map', '1:a', '-c:a', 'aac', '-b:a', '192k', '-shortest'] : []),
      '-vf', EVEN, '-c:v', 'libx264', '-preset', args.preset || 'slow', '-crf', String(args.crf || 18), ...TAGS, '-movflags', '+faststart', out]);
    console.log('wrote ' + out);
  } else if (args.clip) {
    const [a, b] = String(args.clip).split(':').map(Number), out = args.out || join(OUT, 'clip.mp4');
    await gate(a, b);
    const mix = await buildAudio(); mkdirSync(dirname(out), { recursive: true });
    const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(fps), '-c:v', 'mjpeg', '-i', '-',
      ...(mix ? ['-ss', String(a), '-t', String(b - a), '-i', mix, '-map', '0:v', '-map', '1:a', '-c:a', 'aac', '-b:a', '192k', '-shortest'] : []),
      '-vf', EVEN, '-c:v', 'libx264', '-preset', 'medium', '-crf', '20', ...TAGS, '-movflags', '+faststart', out], { stdio: ['pipe', 'inherit', 'inherit'] });
    const n = Math.round((b - a) * fps), start = Date.now();
    for (let i = 0; i < n; i++) {
      const buf = await frameOf(first, a + i / fps, 'image/jpeg', .92);
      if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
      if (i % 30 === 0 || i === n - 1) console.log(`frame ${i + 1}/${n}  ${((Date.now() - start) / (i + 1)).toFixed(0)} ms/frame`);
    }
    ff.stdin.end(); await new Promise(r => ff.on('close', r));
    console.log('wrote ' + out);
  } else if (args.eval) {   // print a page expression (debug probes like CLIP_PROBE), JSON-encoded
    console.log(JSON.stringify(await first.evaluate(e => (0, eval)(e), String(args.eval)), null, 1));
  } else if (args.gif) {
    const [a, b] = String(args.gif).split(':').map(Number), gf = +(args['gif-fps'] || 15), w = +(args.w || 480);
    const out = args.out || join(OUT, 'loop.gif'), tmp = join(OUT, 'gif-frames');
    rmSync(tmp, { recursive: true, force: true }); mkdirSync(tmp, { recursive: true }); mkdirSync(dirname(out), { recursive: true });
    const n = Math.round((b - a) * gf);   // frame n would equal frame 0 for a seamless loop, so it is not rendered
    for (let i = 0; i < n; i++) writeFileSync(`${tmp}/g${pad(i, 4)}.png`, await frameOf(first, a + i / gf, 'image/png'));
    await run('ffmpeg', ['-y', '-loglevel', 'error', '-framerate', String(gf), '-i', `${tmp}/g%04d.png`,
      '-vf', `scale=${w}:-1:flags=lanczos,split[s0][s1];[s0]palettegen=stats_mode=diff[p];[s1][p]paletteuse=dither=bayer:bayer_scale=4`, '-loop', '0', out]);
    console.log(`wrote ${out} (${n} frames)`);
  } else {
    console.log('nothing to do: see the usage at the top of render.mjs');
  }
} finally {
  await browser?.close();
  server.close();
}
