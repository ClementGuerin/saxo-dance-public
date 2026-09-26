// site_build.mjs: saxo.dance → site/dist/, ready to upload. One minified bundle (three.js included), hashed names for
// the code and the stylesheet so a deploy never serves a stale mix, and the assets copied as they are.
//   node tools/site_build.mjs            (run node tools/site_posts.mjs first to refresh the TV's list)
import { build } from 'esbuild';
import fs from 'node:fs';
import crypto from 'node:crypto';
import path from 'node:path';

const SRC = 'site', OUT = 'site/dist';
fs.rmSync(OUT, { recursive: true, force: true }); fs.mkdirSync(OUT, { recursive: true });
const hash = b => crypto.createHash('sha1').update(b).digest('hex').slice(0, 10);

const r = await build({ entryPoints: [`${SRC}/src/main.js`], bundle: true, format: 'esm', minify: true, target: 'es2020', write: false, legalComments: 'none' });
const js = r.outputFiles[0].contents, jsName = `app.${hash(js)}.js`;
fs.writeFileSync(`${OUT}/${jsName}`, js);
const css = fs.readFileSync(`${SRC}/style.css`), cssName = `style.${hash(css)}.css`;
fs.writeFileSync(`${OUT}/${cssName}`, css);
const ph = fs.readFileSync(`${SRC}/posthog.js`), phName = `posthog.${hash(ph)}.js`;
fs.writeFileSync(`${OUT}/${phName}`, ph);
let html = fs.readFileSync(`${SRC}/index.html`, 'utf8')
  .replace(/<!-- dev only:[^>]*-->\s*<script type="importmap">[\s\S]*?<\/script>\s*/, '')
  .replace('href="style.css"', `href="${cssName}"`)
  .replace('<script src="posthog.js"></script>', `<script src="${phName}"></script>`)
  .replace('<script type="module" src="src/main.js"></script>', `<script type="module" src="${jsName}"></script>`);
if (html.includes('importmap') || html.includes('src/main.js') || html.includes('"posthog.js"')) throw new Error('index.html rewrite failed');
fs.writeFileSync(`${OUT}/index.html`, html);
const copy = (from, to) => { fs.mkdirSync(path.dirname(to), { recursive: true }); fs.cpSync(from, to, { recursive: true }); };
for (const d of ['chars', 'anims', 'ui', 'fonts', 'posts']) copy(`${SRC}/assets/${d}`, `${OUT}/assets/${d}`);
for (const f of ['posts.json', 'repo.json', 'stats.json', 'tv.mp4', 'og.jpg']) if (fs.existsSync(`${SRC}/assets/${f}`)) copy(`${SRC}/assets/${f}`, `${OUT}/assets/${f}`);
fs.writeFileSync(`${OUT}/robots.txt`, 'User-agent: *\nAllow: /\n');
const size = d => fs.readdirSync(d, { withFileTypes: true }).reduce((s, e) => s + (e.isDirectory() ? size(path.join(d, e.name)) : fs.statSync(path.join(d, e.name)).size), 0);
console.log(`${OUT}: ${jsName} ${(js.length / 1024).toFixed(0)} KB, total ${(size(OUT) / 1048576).toFixed(1)} MB`);
