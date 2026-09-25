// site_portraits.mjs: the wardrobe's icons. Renders Saxo in every look (tools/site/portraits.js, headless Chrome),
// then tools/sticker_pixel.py turns each render into a 32 px 8-bit sprite like the site's stickers → site/assets/ui/looks/
// (--bits=16 for the 64 px 16-bit ones).
// Run after a new costume: node tools/site_portraits.mjs (needs the preview server: node render.mjs --serve=5180). Free.
import puppeteer from 'puppeteer-core';
import fs from 'node:fs';
import { spawnSync } from 'node:child_process';
const LOOKS = { saxo: 'saxo', cowboy: 'saxo_cowboy', astronaut: 'saxo_astronaut', dj: 'saxo_dj', beach: 'saxo_beach', moto: 'saxo_moto', sponge: 'saxo_sponge', poop: 'saxo_poop' };
const RAW = 'assets/ui/pixel/looks/raw', OUT = 'site/assets/ui/looks';
fs.mkdirSync(RAW, { recursive: true }); fs.mkdirSync(OUT, { recursive: true });
const browser = await puppeteer.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true, args: ['--use-angle=metal', '--ignore-gpu-blocklist'] });
try {
  const page = await browser.newPage();
  page.on('pageerror', e => console.log('[page error]', e.message));
  await page.goto('http://127.0.0.1:5180/tools/site/portraits.html');
  await page.waitForFunction('window.ready === true', { timeout: 60000 });
  for (const [k, file] of Object.entries(LOOKS)) {
    const url = await page.evaluate(f => window.PORTRAIT(f), file);
    fs.writeFileSync(`${RAW}/${k}.png`, Buffer.from(url.split(',')[1], 'base64'));
  }
} finally { await browser.close(); }
const bits = (process.argv.find(a => a.startsWith('--bits=')) || '--bits=8').slice(7);
const r = spawnSync('python3', ['tools/sticker_pixel.py', '--portraits', `--src=${RAW}`, `--out=${OUT}`, `--bits=${bits}`, ...Object.keys(LOOKS)], { stdio: 'inherit' });
process.exit(r.status);
