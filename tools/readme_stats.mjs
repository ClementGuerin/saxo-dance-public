// readme_stats.mjs: the numbers in README.md (characters, looks, maps, clips, videos posted), counted from a commit so
// they can't drift from the code. The public-mirror workflow runs it with --commit on every push to main, so both
// READMEs (this repo and the public mirror) follow the code; tools/site_repo.mjs shows the same counts on saxo.dance.
//   node tools/readme_stats.mjs              print the counts, rewrite README.md in the working tree
//   node tools/readme_stats.mjs --check      exit 1 if README.md at --rev is stale
//   node tools/readme_stats.mjs --commit     rewrite README.md and commit it alone if a number changed (the workflow)
//   --rev=<commit>                           count from that commit (default HEAD); works in a partial clone
// Each number must sit right before its unit ("<h3>32</h3>maps", "32 maps, and counting", "467 clips on disk");
// numbers written in words ("four characters") are left alone.
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

const ROOT = execFileSync('git', ['rev-parse', '--show-toplevel'], { encoding: 'utf8' }).trim();
const git = (a, opt = {}) => execFileSync('git', a, { cwd: ROOT, encoding: 'utf8', maxBuffer: 1 << 28, ...opt });

export function counts(rev = 'HEAD') {
  const files = git(['ls-tree', '-r', '-z', '--name-only', rev]).split('\0').filter(Boolean);
  const show = p => git(['show', `${rev}:${p}`]);
  // characters: Saxo (the Mixamo rig) and everyone with a base model; looks: Saxo's rig plus every model of theirs
  // (saxo_slp.glb is the unrigged source of the rig, not a look)
  const glb = files.map(p => p.match(/^assets\/models\/([a-z]+)_([a-z0-9]+)\.glb$/)).filter(Boolean);
  const chars = ['saxo', ...new Set(glb.filter(m => m[2] === 'base').map(m => m[1]))];
  const looks = 1 + glb.filter(m => chars.includes(m[1]) && !(m[1] === 'saxo' && m[2] === 'slp')).length;
  // maps: the MAPS registry in src/ps1.js, whose spread builders return their maps at the end of src/maps*.js
  const reg = show('src/ps1.js').match(/const MAPS = \{([^\n]*)\};/);
  if (!reg) throw new Error('no MAPS registry in src/ps1.js');
  const builders = files.filter(p => /^src\/maps\d*\.js$/.test(p)).map(show).join('\n');
  let maps = [...reg[1].matchAll(/\w+: build\w+\(/g)].length;
  for (const [, b] of reg[1].matchAll(/\.\.\.(build\w+)\(/g)) {
    const m = builders.match(new RegExp(`export function ${b}\\b[\\s\\S]*?\\n  return \\{([^}]*)\\};`));
    if (!m) throw new Error(`can't find the maps ${b}() returns`);
    maps += [...m[1].matchAll(/\w+:/g)].length;
  }
  const clips = files.filter(p => /^assets\/mixamo\/anims\/[^/]+\.fbx$/.test(p)).length;
  const videos = files.includes('site/assets/posts.json') ? JSON.parse(show('site/assets/posts.json')).posts.length : 0;
  return { characters: chars.length, looks, maps, clips, videos };
}

const UNITS = { characters: 'characters', looks: 'looks', maps: 'maps', clips: '(?:dance and action )?clips', videos: 'videos posted' };
export function refresh(text, c) {
  const changes = new Set(), missing = [];
  for (const [k, unit] of Object.entries(UNITS)) {
    let hits = 0;
    text = text.replace(new RegExp(`\\b\\d+(?=(?:</h3>)?\\s*${unit}\\b)`, 'g'), n => { hits++; if (+n !== c[k]) changes.add(`${c[k]} ${k}`); return String(c[k]); });
    if (!hits) missing.push(k);
  }
  return { text, changes: [...changes], missing };
}

if (import.meta.url === pathToFileURL(process.argv[1] || '').href) {
  const args = Object.fromEntries(process.argv.slice(2).map(a => { const [k, ...v] = a.replace(/^--/, '').split('='); return [k, v.length ? v.join('=') : true]; }));
  const rev = args.rev || 'HEAD', c = counts(rev), file = join(ROOT, 'README.md');
  const before = args.check ? git(['show', `${rev}:README.md`]) : readFileSync(file, 'utf8');
  const { text, changes, missing } = refresh(before, c);
  console.log(`counts at ${rev}: ${Object.entries(c).map(([k, v]) => `${v} ${k}`).join(', ')}`);
  if (missing.length) console.warn(`README.md never gives the ${missing.join(', ')} count`);
  if (!changes.length) { console.log('README numbers up to date'); process.exit(0); }
  console.log(`README numbers stale: now ${changes.join(', ')}`);
  if (args.check) process.exit(1);
  writeFileSync(file, text);
  if (args.commit) {
    const id = k => { try { return git(['config', k]).trim(); } catch { return ''; } };   // CI checkouts have no identity
    const who = [['user.name', 'Clement Guerin'], ['user.email', '1357503+ClementGuerin@users.noreply.github.com']].flatMap(([k, d]) => id(k) ? [] : ['-c', `${k}=${d}`]);
    git([...who, 'commit', '-q', '-m', `docs(readme): refresh the numbers (${changes.join(', ')})`, '--', 'README.md'], { stdio: 'inherit' });
    console.log('committed README.md');
  }
}
