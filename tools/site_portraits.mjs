// site_portraits.mjs: the wardrobe's icons. Renders Saxo in every look (tools/site/portraits.js, headless Chrome),
// then tools/sticker_pixel.py turns each render into a 32 px 8-bit sprite like the site's stickers → site/assets/ui/looks/
// (--bits=16 for the 64 px 16-bit ones). The looks are the wardrobe's list, site/assets/looks.json.
//   node tools/site_portraits.mjs                  only the looks with no icon yet (a new costume)
//   node tools/site_portraits.mjs --only=pirate    those again
//   node tools/site_portraits.mjs --all            every look again (--bits= switches all of them)
// Serves the repo itself (tools/readme/serve.mjs), so no preview server is needed. Free.
import puppeteer from 'puppeteer-core';
import fs from 'node:fs';
import { spawnSync } from 'node:child_process';
import { serve, ROOT } from './readme/serve.mjs';

process.chdir(ROOT);
const RAW = 'assets/ui/pixel/looks/raw', OUT = 'site/assets/ui/looks';
const arg = n => process.argv.find(a => a.startsWith(`--${n}=`))?.slice(n.length + 3);
const all = process.argv.includes('--all') || !!arg('bits'), only = arg('only')?.split(',');
const LOOKS = Object.fromEntries(JSON.parse(fs.readFileSync('site/assets/looks.json', 'utf8')).map(([k]) => [k, k === 'saxo' ? 'saxo' : `saxo_${k}`]));
if (only) for (const k of only) if (!LOOKS[k]) throw new Error(`${k} isn't in site/assets/looks.json`);
const todo = Object.keys(LOOKS).filter(k => all || (only ? only.includes(k) : !fs.existsSync(`${OUT}/${k}.png`)));
if (!todo.length) { console.log('every look has its wardrobe icon (--all redraws them)'); process.exit(0); }
fs.mkdirSync(RAW, { recursive: true }); fs.mkdirSync(OUT, { recursive: true });
const server = await serve();
const browser = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true, args: ['--use-angle=metal', '--ignore-gpu-blocklist'] });
try {
  const page = await browser.newPage();
  page.on('pageerror', e => console.log('[page error]', e.message));
  await page.goto(`http://127.0.0.1:${server.address().port}/tools/site/portraits.html`);
  await page.waitForFunction('window.ready === true', { timeout: 60000 });
  for (const k of todo) {
    const url = await page.evaluate(f => window.PORTRAIT(f), LOOKS[k]);
    fs.writeFileSync(`${RAW}/${k}.png`, Buffer.from(url.split(',')[1], 'base64'));
  }
} finally { await browser.close(); server.close(); }
const bits = arg('bits') || '8';
const r = spawnSync('python3', ['tools/sticker_pixel.py', '--portraits', `--src=${RAW}`, `--out=${OUT}`, `--bits=${bits}`, ...todo], { stdio: 'inherit' });
if (!r.status) console.log(`wardrobe icons: ${todo.map(k => `${OUT}/${k}.png`).join(' ')}`);
process.exit(r.status);
