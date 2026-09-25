// site_repo.mjs: the data behind "Saxo's code", the GitHub island's computer on saxo.dance (site/assets/repo.json):
// the public mirror's latest changes, commit count, files and languages from GitHub's API (public, no token), its lines
// of code, and the project's numbers from readme_stats.mjs. site_deploy.mjs --build runs it; if GitHub can't be
// reached the previous repo.json stays.
//   node tools/site_repo.mjs
import { execFileSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';
import { counts } from './readme_stats.mjs';

const MIRROR = 'ClementGuerin/saxo-dance-public', API = `https://api.github.com/repos/${MIRROR}`, OUT = 'site/assets/repo.json';
const H = { Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28', 'User-Agent': 'saxo.dance' };
if (process.env.GITHUB_TOKEN) H.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
const get = async (url, raw) => { const r = await fetch(url.startsWith('https:') ? url : API + url, { headers: H }); if (!r.ok) throw new Error(`${r.status} on ${url}`); return raw ? r : r.json(); };
const COLORS = { JavaScript: '#f1e05a', Python: '#3572a5', CSS: '#663399', HTML: '#e34c26', Shell: '#89e051', GLSL: '#5686a5' };
const CODE = /\.(m?js|py|css|html|sh)$/, GENERATED = /(^|\/)(lyrics|beats)\.js$|\.(lyrics|beats)\.js$|^site\/posthog\.js$/;

try {
  const repo = await get('');
  const branch = repo.default_branch, recent = await get(`/commits?sha=${branch}&per_page=30`);
  const last = (await get(`/commits?sha=${branch}&per_page=1`, true)).headers.get('link')?.match(/[?&]page=(\d+)>; rel="last"/);
  const langs = await get('/languages'), bytes = Object.values(langs).reduce((a, b) => a + b, 0);
  const tree = await get(`/git/trees/${recent[0].sha}?recursive=1`), blobs = tree.tree.filter(e => e.type === 'blob');
  // lines of code (non-blank) of the mirror's own files: from the local repo when the blob is identical, else raw
  let loc = 0;
  for (const e of blobs.filter(e => CODE.test(e.path) && !GENERATED.test(e.path))) {
    let s; try { s = execFileSync('git', ['cat-file', 'blob', e.sha], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], maxBuffer: 1 << 26 }); }
    catch { s = await (await get(`https://raw.githubusercontent.com/${MIRROR}/${recent[0].sha}/${e.path.split('/').map(encodeURIComponent).join('/')}`, true)).text(); }
    loc += s.split('\n').filter(l => l.trim()).length;
  }
  // the latest product changes: the sync commits carry the private commit's subject ("Sync with abc1234: feat(site): …")
  const latest = recent.map(c => {
    const subject = c.commit.message.split('\n')[0].replace(/^Sync with [0-9a-f]{7,}: /, ''), m = subject.match(/^(\w+)(?:\(([^)]*)\))?!?: (.+)$/);
    return { sha: c.sha.slice(0, 7), type: m ? m[1] : '', scope: m ? m[2] || '' : '', text: m ? m[3] : subject, date: c.commit.committer.date, url: c.html_url };
  });
  const product = latest.filter(c => ['feat', 'fix', 'perf'].includes(c.type));
  let c = null; try { c = counts(); } catch (e) { console.warn(`site_repo: no project counts (${e.message})`); }
  const out = {
    updated: new Date().toISOString(), name: MIRROR, url: repo.html_url, description: repo.description,
    stars: repo.stargazers_count, forks: repo.forks_count, pushedAt: repo.pushed_at,
    commits: last ? +last[1] : recent.length, files: blobs.length, loc,
    languages: Object.entries(langs).map(([name, b]) => ({ name, pct: +(b / bytes * 100).toFixed(1), color: COLORS[name] || '#b18cff' })).filter(l => l.pct >= 0.5),
    latest: (product.length >= 3 ? product : latest).slice(0, 5), counts: c,
  };
  writeFileSync(OUT, JSON.stringify(out, null, 1) + '\n');
  console.log(`${OUT}: ${out.commits} commits, ${out.files} files, ${loc} lines, ${out.languages.map(l => `${l.name} ${l.pct}%`).join(', ')}; latest "${out.latest[0]?.text}"`);
} catch (e) {
  console.warn(`site_repo: GitHub unreachable (${e.message}); keeping the previous ${OUT}`);
}
