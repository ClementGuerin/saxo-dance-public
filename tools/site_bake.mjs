// site_bake.mjs: bakes the website's characters and clips (tools/site/bake.js in headless Chrome) into site/assets/.
//   node tools/site_bake.mjs              only what's missing (a new costume in site/assets/looks.json, a new pack)
//   node tools/site_bake.mjs --only=pirate,tourist   those costumes again
//   node tools/site_bake.mjs --all        everything again (after a change to a clip pack or to the baking itself)
// Saxo's costumes are the wardrobe's list, site/assets/looks.json (tools/site_looks.mjs adds to it). Rebaking a file
// that's already live changes it under the same name, which Cloudflare keeps for a day: the next release purges it.
// Outputs: site/assets/chars/<look>.glb, site/assets/anims/<pack>.{bin,json}. Free: no API calls.
import puppeteer from 'puppeteer-core';
import http from 'node:http';
import { existsSync, statSync, createReadStream, mkdirSync, writeFileSync, readFileSync } from 'node:fs';
import { resolve, extname, dirname, sep } from 'node:path';

const ROOT = process.cwd(), OUT = 'site/assets';
const SPEC = {
  costumes: Object.fromEntries(JSON.parse(readFileSync(`${OUT}/looks.json`, 'utf8')).filter(([k]) => k !== 'saxo').map(([k]) => [k, `saxo_${k}`])),
  partners: { sadi: 'sadi_base', kob: 'kob_base', compote: 'compote_base' },
  packs: {
    // everything the world needs before the first frame: locomotion, talking, sitting, reactions, the Compote gag
    core: ['happy_idle', 'bored_idle', 'happy_walk', 'happy_run', 'silly_run', 'talking', 'asking_question', 'sitting_talking', 'gaming', 'laying_idle',
      'waving', 'laughing_standing', 'shaking_head_no_dismissively', 'angry_forward_gesture', 'quickly_pointing_angrily_forward', 'shoulder_shrug', 'agreeing_yes',
      'blowing_a_kiss', 'big_yawn_while_standing', ['uppercut_atk', 'uppercut_atk', { pin: false }], ['uppercut_vic', 'uppercut_vic', { pin: false }], 'standing_up_from_a_soccer_fall'],
    // the emote dances, loaded after the world is up
    dance: [['gangnam', '@gangnam'], 'macarena', 'ymca', 'chicken', 'twist', 'running_man', 'shuffle', 'robot', 'arm_wave', 'charleston', 'samba', 'shimmy', 'silly_twist', 'booty_step'],
  },
};
const arg = n => process.argv.find(a => a.startsWith(`--${n}=`))?.slice(n.length + 3);
const all = process.argv.includes('--all'), only = arg('only')?.split(',');
if (only) for (const k of only) if (!SPEC.costumes[k]) throw new Error(`${k} isn't in site/assets/looks.json (add it with node tools/site_looks.mjs)`);
const want = (file, key) => all || (only ? only.includes(key) : !existsSync(`${OUT}/${file}`));
const pick = (o, file) => Object.fromEntries(Object.entries(o).filter(([k]) => want(file(k), k)));
const spec = {
  costumes: Object.fromEntries(Object.entries(pick(SPEC.costumes, k => `chars/saxo_${k}.glb`)).map(([k, f]) => [k, `/assets/models/${f}.glb`])),
  partners: only ? {} : Object.fromEntries(Object.entries(pick(SPEC.partners, k => `chars/${k}.glb`)).map(([k, f]) => [k, `/assets/models/${f}.glb`])),
  packs: only ? {} : Object.fromEntries(Object.entries(pick(SPEC.packs, k => `anims/${k}.bin`)).map(([k, l]) => [k, l.map(c => typeof c === 'string' ? [c, c] : c)])),
};
const todo = [...Object.keys(spec.costumes).map(k => `saxo_${k}`), ...Object.keys(spec.partners), ...Object.keys(spec.packs).map(k => `${k} clips`)];
if (!todo.length && !want('chars/saxo.glb')) { console.log('nothing to bake: every look and clip pack is in site/assets (--all rebakes them)'); process.exit(0); }
console.log(`baking ${todo.join(', ') || 'saxo'}`);

const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.jpg': 'image/jpeg', '.png': 'image/png', '.glb': 'model/gltf-binary', '.fbx': 'application/octet-stream' };
const server = http.createServer((req, res) => {
  const f = resolve(ROOT, decodeURIComponent(new URL(req.url, 'http://x').pathname).replace(/^\/+/, ''));
  if (!f.startsWith(ROOT + sep) || !existsSync(f) || statSync(f).isDirectory()) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'Content-Type': MIME[extname(f)] || 'application/octet-stream' }); createReadStream(f).pipe(res);
});
await new Promise(ok => server.listen(0, '127.0.0.1', ok));
const browser = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true, protocolTimeout: 0 });
try {
  const page = await browser.newPage();
  page.on('console', m => console.log('[page]', m.text()));
  page.on('pageerror', e => console.log('[page error]', e.message));
  await page.goto(`http://127.0.0.1:${server.address().port}/tools/site/bake.html`);
  await page.waitForFunction('window.ready === true', { timeout: 120000 });
  const { files, log } = await page.evaluate(s => window.BAKE(s), spec);
  log.forEach(l => console.log(l));
  for (const [name, data] of Object.entries(files)) {
    if (name === 'chars/saxo.glb' && !want(name)) continue;   // always baked (the rig the costumes fit on), kept unless missing or --all
    const p = `${OUT}/${name}`; mkdirSync(dirname(p), { recursive: true });
    const buf = Buffer.from(data, 'base64'); writeFileSync(p, buf); console.log(`${p}  ${(buf.length / 1024).toFixed(0)} KB`);
  }
} finally { await browser.close(); server.close(); }
