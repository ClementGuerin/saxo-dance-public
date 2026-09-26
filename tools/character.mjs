#!/usr/bin/env node
// character.mjs: the new-character pipeline (how Sadi and Kob were made), one step per subcommand. The steps
// that need an eye (choosing a sheet, a sticker) stay manual: every paid step writes candidates, you pick one.
//
//   node tools/character.mjs sheet <name> --photo=<img> --desc="<what the character looks like and wears>"   ~$0.09
//       base turnaround: Sadi's sheet (Saxo's T-pose and proportions) redrawn as the character in the photo
//       → assets/ref/<name>/cand_N.png; copy the one you want to assets/ref/<name>/sheet.png
//   node tools/character.mjs costume <name> <costume> --desc="<the outfit>"                                    ~$0.04
//       edits the base sheet, keeping pose, layout and face → assets/ref/<name>/<costume>/sheet.png
//   node tools/character.mjs model <name> [<costume>]                                                    $0.50 (50 Tripo credits)
//       crops the sheet's four views, runs Tripo multiview → assets/models/<name>_<costume|base>.glb
//   node tools/character.mjs sticker <name> --desc="<the face>"                                                ~$0.09
//       Android-emoji face in the style of Saxo's → assets/ref/stickers/<name>_N.png; then
//       python3 tools/sticker_cut.py assets/ref/stickers/<name>_N.png assets/ui/<name>_sticker.png
//
// Then register the character in PARTNERS (src/ps1.js) and the sticker list (src/ch/dance.js); see CLAUDE.md.
// Needs: monid CLI (logged in), tripo CLI (logged in), ffmpeg, aws CLI, ~/.saxo-r2.env (public refs for Qwen).
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync, mkdirSync, existsSync, copyFileSync, appendFileSync } from 'node:fs';
import { basename, dirname, join } from 'node:path';

const [cmd, name, costume] = process.argv.slice(2).filter(a => !a.startsWith('--'));
const opt = Object.fromEntries(process.argv.slice(2).filter(a => a.startsWith('--')).map(a => { const [k, ...v] = a.slice(2).split('='); return [k, v.join('=') || true]; }));
const ROOT = new URL('..', import.meta.url).pathname;
const PUB = 'https://pub-bd50aac4efd94178aad61b4c08be841d.r2.dev';
const run = (bin, args, o = {}) => execFileSync(bin, args, { cwd: ROOT, encoding: 'utf8', maxBuffer: 1 << 26, ...o });
const die = m => { console.error(m); process.exit(1); };
const today = new Date().toISOString().slice(0, 10);
// SAXO_EPISODE=<id> ties the spend to the night's video (its caps are per video)
const spend = (item, extra) => appendFileSync(join(ROOT, 'research/spend.jsonl'), JSON.stringify({ date: today, item, ...extra, why: `character ${name}`, ...(process.env.SAXO_EPISODE ? { episode: process.env.SAXO_EPISODE } : {}) }) + '\n');

// Qwen only reads public https URLs: put the reference in the public R2 bucket
function publish(file) {
  const env = Object.fromEntries(readFileSync(`${process.env.HOME}/.saxo-r2.env`, 'utf8').split('\n').filter(l => l.includes('=')).map(l => l.split(/=(.*)/s).slice(0, 2)));
  const key = `ref/chars/${name}/${file.replace(/^assets\/ref\//, '').replace(/\//g, '_')}`;
  run('aws', ['s3', 'cp', file, `s3://saxo-dance/${key}`, '--endpoint-url', `https://${env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`, '--only-show-errors'],
    { env: { ...process.env, AWS_ACCESS_KEY_ID: env.CLOUDFLARE_ACCESS_KEY, AWS_SECRET_ACCESS_KEY: env.CLOUDFLARE_SECRET_ACCESS_KEY, AWS_DEFAULT_REGION: 'auto' } });
  return `${PUB}/${key}`;
}

// Qwen Image 3.0 Pro through Monid; retries the upstream rate limit (6 parallel runs tripped it once)
async function qwen(prompt, images, n, outPrefix) {
  for (let attempt = 1; attempt <= 4; attempt++) {
    const body = JSON.stringify({ prompt, images, size: '1024*1024', n, prompt_extend: false });
    const j = JSON.parse(run('monid', ['run', '-p', 'alibaba', '-e', '/v1/image/qwen-image-3.0-pro', '-i', body, '-w', '400', '-j']));
    const urls = (j.output?.output?.choices || []).flatMap(c => c.message.content.map(x => x.image)).filter(Boolean);
    if (urls.length) {
      mkdirSync(dirname(outPrefix), { recursive: true });
      const files = urls.map((u, i) => { const f = `${outPrefix}${urls.length > 1 ? `_${i + 1}` : ''}.png`; run('curl', ['-s', '-o', f, u]); return f; });
      spend(`qwen-image-3.0-pro ${basename(outPrefix)} x${urls.length}`, { usd: +(urls.length * 0.04 + images.length * 0.003).toFixed(3) });
      return files;
    }
    console.error(`attempt ${attempt}: no image (${JSON.stringify(j.output?.error || j.status).slice(0, 200)}), retrying in 20 s`);
    await new Promise(r => setTimeout(r, 20000));
  }
  die('qwen failed 4 times');
}

const KEEP = 'Keep EXACTLY the same 2x2 layout (front top-left, back top-right, left profile bottom-left with the nose pointing left, right profile bottom-right), the same T-pose, the same body proportions, head size, arm and leg length, the same low-poly cell-shaded matte vinyl-toy style and the same solid green background with soft contact shadows.';
const dir = costume ? `assets/ref/${name}/${costume}` : `assets/ref/${name}`;

if (!cmd || !name) die(readFileSync(new URL(import.meta.url), 'utf8').split('\n').slice(1, 17).map(l => l.replace(/^\/\/ ?/, '')).join('\n'));

if (cmd === 'sheet') {
  if (!opt.photo || !opt.desc) die('sheet needs --photo=<img> and --desc="..."');
  mkdirSync(dir, { recursive: true });
  const photo = `${dir}/photo.jpg`; run('ffmpeg', ['-loglevel', 'error', '-y', '-i', opt.photo, '-vf', "scale='min(1600,iw)':-2", photo]);
  const files = await qwen(`Redraw the character reference sheet in image 1. ${KEEP} Replace the character with ${name}, based on the animal in image 2: ${opt.desc} Any tail stays short and hangs straight down close behind the legs. Same chunky low-poly geometry and flat textures as image 1.`,
    [publish('assets/ref/sadi/sheet.png'), publish(photo)], 2, `${dir}/cand`);
  console.log(files.join('\n') + `\nlook at them, then: cp <the one> ${dir}/sheet.png`);
} else if (cmd === 'costume') {
  if (!costume || !opt.desc) die('costume needs <name> <costume> --desc="..."');
  if (!existsSync(`assets/ref/${name}/sheet.png`)) die(`no base sheet: assets/ref/${name}/sheet.png`);
  const [f] = await qwen(`Edit this character reference sheet. ${KEEP} Keep the same character with the same face, ears, eyes, body proportions and tail. Only change the outfit: ${opt.desc} Keep the costume tight to the body; any hat stays small.`,
    [publish(`assets/ref/${name}/sheet.png`)], 1, `${dir}/sheet`);
  console.log(f);
} else if (cmd === 'model') {
  const sheet = `${dir}/sheet.png`; if (!existsSync(sheet)) die(`no sheet: ${sheet}`);
  const views = { front: '0:0', back: '512:0', left: '0:512', right: '512:512' };   // TL front, TR back, BL left, BR right
  for (const [v, xy] of Object.entries(views)) run('ffmpeg', ['-loglevel', 'error', '-y', '-i', sheet, '-vf', `crop=512:512:${xy}`, `${dir}/mv_${v}.png`]);
  const tag = `${name}_${costume || 'base'}`, m = `assets/models/${tag}`; mkdirSync(m, { recursive: true });
  let out = '', log = '';
  try {
    out = run('tripo', ['make', ...['front', 'left', 'back', 'right'].map(v => `${dir}/mv_${v}.png`), '--model', 'tripo-v3.1', '-p', 'smart_low_poly=true', '-p', 'face_limit=4000',
      '-p', 'texture_quality=detailed', '--name', tag.replace('_', '-'), '-o', `${m}/tripo-out`, '--yes', '--json'], { stdio: ['ignore', 'pipe', 'pipe'] });
  } catch (e) { log = String(e.stderr || e); }
  writeFileSync(`${m}/make.json`, out); if (log) writeFileSync(`${m}/make.log`, log);
  const glb = (out.match(/"model_file":\s*"([^"]+)"/) || [])[1];
  if (!glb || !existsSync(glb)) die(`tripo failed, see ${m}/make.log`);
  copyFileSync(glb, `assets/models/${tag}.glb`); spend(`tripo multiview ${tag}`, { tripo_credits: 50, usd: 0.5 });   // 1 Tripo credit = $0.01
  console.log(`assets/models/${tag}.glb  (preview: node render.mjs --sheet=5 --gl=metal --query="model=assets/models/${tag}.glb")`);
} else if (cmd === 'sticker') {
  if (!opt.desc) die('sticker needs --desc="<the face>"');
  if (!existsSync(`assets/ref/${name}/sheet.png`)) die(`no base sheet: assets/ref/${name}/sheet.png`);
  const files = await qwen(`Draw a single emoji sticker of the character from image 2, in exactly the same style as the dog emoji in image 1: Android emoji style, flat cartoon head only, front view, bold dark outline, simple flat shading, big readable features, no body, no text. ${opt.desc} Keep whiskers and every detail inside the outline. Centred, filling most of the frame, on a plain pure white background.`,
    [publish('assets/ui/saxo_sticker.png'), publish(`assets/ref/${name}/sheet.png`)], 2, `assets/ref/stickers/${name}`);
  console.log(files.join('\n') + `\nlook at them, then: python3 tools/sticker_cut.py <the one> assets/ui/${name}_sticker.png`);
} else die(`unknown command ${cmd}`);
