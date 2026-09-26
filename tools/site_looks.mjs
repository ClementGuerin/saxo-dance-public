// site_looks.mjs: the website's wardrobe, site/assets/looks.json ([look, name] in wardrobe order), against Saxo's
// costumes in the model library (assets/models/saxo_<look>.glb, committed). A costume a video adds isn't on the site
// until it's added here with a name (the user, 2026-09-26: keep saxo.dance updated).
//   node tools/site_looks.mjs                          the costumes missing from the site (exit 2 when there are)
//   node tools/site_looks.mjs --add=pirate:Pirate [--add='kesha:Pop star' …]
//        adds them (before the poop suit, which stays last), bakes them (site_bake.mjs --only=) and draws their
//        wardrobe icons (site_portraits.mjs --only=); then look at the icons and at Saxo wearing each one, and commit:
//        the next refresh (tools/site_refresh.mjs) releases them
// The name says what the outfit is ("Tuxedo", "Pop star"), never a real person's name. saxo_slp is the Tripo source
// model, not a costume. Free.
import fs from 'node:fs';
import { spawnSync, execFileSync } from 'node:child_process';
import { ROOT } from './readme/serve.mjs';

process.chdir(ROOT);
const FILE = 'site/assets/looks.json', NOT = ['slp'];
const looks = JSON.parse(fs.readFileSync(FILE, 'utf8'));
const library = execFileSync('git', ['ls-files', 'assets/models'], { encoding: 'utf8' }).split('\n')
  .map(f => f.match(/^assets\/models\/saxo_([a-z0-9]+)\.glb$/)?.[1]).filter(k => k && !NOT.includes(k));
const missing = library.filter(k => !looks.some(([l]) => l === k));

const adds = process.argv.filter(a => a.startsWith('--add=')).map(a => a.slice(6)).map(a => [a.slice(0, a.indexOf(':')), a.slice(a.indexOf(':') + 1).trim()]);
if (!adds.length) {
  console.log(missing.length ? `not on the site: ${missing.map(k => `saxo_${k}`).join(', ')} (node tools/site_looks.mjs --add=<look>:<name>)` : `the site's wardrobe has all ${looks.length} looks`);
  process.exit(missing.length ? 2 : 0);
}
for (const [k, name] of adds) {
  if (!k || !name) throw new Error(`--add=<look>:<name>, e.g. --add=pirate:Pirate (got ${k}:${name})`);
  if (!library.includes(k)) throw new Error(`no committed assets/models/saxo_${k}.glb`);
  if (looks.some(([l]) => l === k)) throw new Error(`${k} is already on the site`);
  if (name.length > 12) throw new Error(`"${name}" is too long for a wardrobe button (12 characters at most)`);
}
const poop = looks.findIndex(([l]) => l === 'poop');
looks.splice(poop < 0 ? looks.length : poop, 0, ...adds);
fs.writeFileSync(FILE, `[\n${looks.map(l => ' ' + JSON.stringify(l).replace(/","/g, '", "')).join(',\n')}\n]\n`);
const keys = adds.map(([k]) => k).join(',');
for (const tool of ['tools/site_bake.mjs', 'tools/site_portraits.mjs']) {
  const r = spawnSync('node', [tool, `--only=${keys}`], { stdio: 'inherit' });
  if (r.status) { console.log(`${tool} failed: ${FILE} lists them already; fix and re-run it with --only=${keys}`); process.exit(1); }
}
console.log(`added ${adds.map(([k, n]) => `${k} ("${n}")`).join(', ')}. Look at ${adds.map(([k]) => `site/assets/ui/looks/${k}.png`).join(' ')} and at Saxo wearing each (tools/site/shot.mjs), then commit ${FILE}, ${adds.map(([k]) => `site/assets/chars/saxo_${k}.glb site/assets/ui/looks/${k}.png`).join(' ')}`);
