// shot.mjs: screenshots of the site in headless Chrome for QA (dev only).
//   node tools/site/shot.mjs [--w=1440] [--h=900] [--out=out/site] [--steps=steps.json] [--url=http://127.0.0.1:5180/site/index.html]
//     [--chrome=<path> or CHROME_PATH] [--block-net: resolve 127.0.0.1 only] [--strict: exit 2 on an uncaught page error]
// On macOS it drives the installed Chrome with Metal; elsewhere (the bug desk routine's Linux VM) CHROME_PATH or
// chrome-headless-shell with SwiftShader, sandbox off (the VM runs as root).
// Steps: [{ "js": "<expr run in the page>", "wait": ms, "shot": "name", "keys": ["KeyW"], "hold": ms, "click": [x, y] }]
import puppeteer from 'puppeteer-core';
import fs from 'node:fs';
const args = Object.fromEntries(process.argv.slice(2).map(a => { const [k, ...v] = a.replace(/^--/, '').split('='); return [k, v.join('=') || true]; }));
const W = +(args.w || 1440), H = +(args.h || 900), OUT = args.out || 'out/site', URL = args.url || 'http://127.0.0.1:5180/site/index.html';
const LINUX = process.platform !== 'darwin';
const CHROME = args.chrome || process.env.CHROME_PATH || (LINUX ? '/usr/local/bin/chrome-headless-shell' : '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome');
const GL = LINUX ? ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--no-sandbox'] : ['--use-angle=metal'];
const BLOCK_NET = '--host-resolver-rules=MAP * ~NOTFOUND , EXCLUDE 127.0.0.1';   // tools/bug_desk.mjs boots untrusted code with it
const steps = args.steps ? JSON.parse(fs.existsSync(args.steps) ? fs.readFileSync(args.steps, 'utf8') : args.steps) : [{ wait: 4000, shot: 'start' }];
fs.mkdirSync(OUT, { recursive: true });
const browser = await puppeteer.launch({ executablePath: CHROME, headless: true, args: [...GL, '--ignore-gpu-blocklist', '--autoplay-policy=no-user-gesture-required', ...(args['block-net'] ? [BLOCK_NET] : [])] });
const page = await browser.newPage();
await page.setViewport({ width: W, height: H, deviceScaleFactor: +(args.dpr || 1), isMobile: !!args.mobile, hasTouch: !!args.mobile });
const errs = [];
page.on('console', m => { if (['error', 'warn', 'warning'].includes(m.type())) errs.push(m.type() + ': ' + m.text()); });
page.on('pageerror', e => errs.push('PAGEERROR ' + e.message));
await page.goto(URL, { waitUntil: 'load' });
await page.waitForFunction(() => !document.getElementById('start').hidden, { timeout: 60000 }).catch(e => { console.log('boot failed:', errs.join('\n')); process.exit(1); });
if (!args.nostart) { await page.click('#start'); }
for (const s of steps) {
  if (s.js) { const r = await page.evaluate(s.js); if (r !== undefined) console.log('js →', typeof r === 'string' ? r : JSON.stringify(r)); }
  if (s.click) await page.mouse.click(...s.click);
  if (s.keys) { for (const k of s.keys) await page.keyboard.down(k); await new Promise(r => setTimeout(r, s.hold || 500)); for (const k of s.keys) await page.keyboard.up(k); }
  if (s.wait) await new Promise(r => setTimeout(r, s.wait));
  if (s.shot) { await page.screenshot({ path: `${OUT}/${s.shot}.png` }); console.log(`${OUT}/${s.shot}.png`); }
}
if (errs.length) console.log('console:', [...new Set(errs)].slice(0, 12).join('\n  '));
await browser.close();
if (args.strict && errs.some(e => e.startsWith('PAGEERROR'))) process.exit(2);
