// site_stats.mjs: the numbers behind the stats island on saxo.dance (site/assets/stats.json): views, likes and
// followers per platform and per video, the channel's total views over time, and, with a PostHog key, what visitors
// did on the site. Every read is free:
//   - site/assets/posts.json (tools/site_posts.mjs, run first): the videos and which post is which on each platform;
//   - research/metrics.jsonl: the daily SocialCrawl snapshots (views, likes, comments, shares per post; the history);
//   - TikTok's public creator embed: live views per video, followers, total likes;
//   - the YouTube channel's public Shorts page: subscribers and live views per Short (rounded above 1,000, so the
//     snapshot wins when it's higher);
//   - PostHog (optional): the site's own events, with a personal API key (read scope) in POSTHOG_PERSONAL_API_KEY or
//     ~/.posthog-saxo.env; without one the site block is left out.
// X isn't counted (reading X's numbers costs money per post) and Instagram followers aren't public without a login.
// site_deploy.mjs --build runs it; a live source that can't be reached falls back to the snapshots.
//   node tools/site_stats.mjs
import fs from 'node:fs';
import os from 'node:os';

const OUT = 'site/assets/stats.json', NETS = ['tiktok', 'instagram', 'youtube'];
const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0 Safari/537.36';
const POSTHOG = { host: 'https://eu.posthog.com', project: 284502, since: '2026-09-25T00:00:00Z' };
function key(name, file) {
  if (process.env[name]) return process.env[name].trim();
  const f = `${os.homedir()}/${file}`, line = fs.existsSync(f) && fs.readFileSync(f, 'utf8').split('\n').find(l => l.startsWith(name + '='));
  return line ? line.slice(name.length + 1).trim() : null;
}
const read = f => fs.existsSync(f) ? fs.readFileSync(f, 'utf8').trim().split('\n').filter(Boolean).map(l => JSON.parse(l)) : [];
const page = async url => { const r = await fetch(url, { headers: { 'User-Agent': UA, 'Accept-Language': 'en-US,en;q=0.9' }, signal: AbortSignal.timeout(20000) }); if (!r.ok) throw new Error(`${r.status}`); return r.text(); };
// "659", "1.1 thousand", "1.2K", "3 million" → a number
const count = s => { const m = String(s).replace(/,/g, '').match(/([\d.]+)\s*(thousand|million|billion|[KMB])?/i); if (!m) return null; const k = { t: 1e3, k: 1e3, m: 1e6, b: 1e9 }[(m[2] || '')[0]?.toLowerCase()] || 1; return Math.round(+m[1] * k); };
const igCode = u => u?.match(/\/(?:reel|p)\/([\w-]+)/)?.[1];

if (!fs.existsSync('site/assets/posts.json')) { console.warn('site_stats: no site/assets/posts.json (run tools/site_posts.mjs first); keeping the previous stats'); process.exit(0); }
const posts = JSON.parse(fs.readFileSync('site/assets/posts.json', 'utf8')).posts || [];
const snaps = read('research/metrics.jsonl');
const snapKey = m => `${m.platform}:${m.platform === 'instagram' ? igCode(m.url) : m.id}`;

// ---- live sources ----
async function tiktok(user) {   // the same public embed tools/site_posts.mjs reads for the TV's links
  try {
    const h = await page(`https://www.tiktok.com/embed/@${user}`);
    const num = k => +(h.match(new RegExp(`"${k}":(\\d+)`))?.[1] ?? NaN);
    const views = new Map([...h.matchAll(/"id":"(\d{15,})"[^{}]*?"playCount":(\d+)/g)].map(m => [m[1], +m[2]]));
    if (!views.size && Number.isNaN(num('followerCount'))) throw new Error('no data in the page');
    return { followers: num('followerCount'), likes: num('heartCount'), views };
  } catch (e) { console.log(`tiktok embed: ${e.message} (snapshot numbers only)`); return null; }
}
async function youtube(handle) {
  try {
    const h = await page(`https://www.youtube.com/@${handle}/shorts`), views = new Map();
    for (const m of h.matchAll(/"shortsLockupViewModel":\{/g)) {
      const seg = h.slice(m.index, m.index + 6000), id = seg.match(/"videoId":"([\w-]{11})"/)?.[1];
      const n = seg.match(/"accessibilityText":"[^"]*?, ([^"]*?) views? - play Short"/)?.[1];
      if (id && n && !views.has(id)) views.set(id, count(n));
    }
    const subs = h.match(/"content":"([\d.,]+(?:\s*[KMB])?) subscribers?"/)?.[1];
    if (!views.size && !subs) throw new Error('no data in the page');
    return { followers: subs ? count(subs) : null, views };
  } catch (e) { console.log(`youtube page: ${e.message} (snapshot numbers only)`); return null; }
}
async function site() {   // what visitors did on saxo.dance, test accounts left out (the project's own filter)
  const k = key('POSTHOG_PERSONAL_API_KEY', '.posthog-saxo.env');
  if (!k) { console.log('posthog: no POSTHOG_PERSONAL_API_KEY (~/.posthog-saxo.env), the site block is left out'); return null; }
  const q = `SELECT uniqIf(person_id, event = '$pageview'), countIf(event = 'game_started'), countIf(event = 'dance_started'),
    countIf(event = 'costume_changed'), countIf(event = 'chat_action' AND properties.action = 'punch'), countIf(event = 'video_played'),
    countIf(event = 'npc_talk'), min(timestamp) FROM events WHERE {filters}`;
  try {
    const r = await fetch(`${POSTHOG.host}/api/projects/${POSTHOG.project}/query/`, {
      method: 'POST', signal: AbortSignal.timeout(30000),
      headers: { Authorization: `Bearer ${k}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'saxo.dance stats island', query: { kind: 'HogQLQuery', query: q, filters: { filterTestAccounts: true, dateRange: { date_from: POSTHOG.since } } } }),
    });
    const d = await r.json(); if (!r.ok || !d.results?.[0]) throw new Error(d.detail || `${r.status}`);
    const [visitors, games, dances, costumes, punches, plays, talks, since] = d.results[0];
    return { visitors, games, dances, costumes, punches, plays, talks, since };
  } catch (e) { console.log(`posthog: ${e.message} (the site block keeps its previous numbers)`); return null; }
}
const [tt, yt, siteNow] = await Promise.all([tiktok('saxo.dance'), youtube('saxodance'), site()]);

// ---- per video: the latest snapshot of each post, raised to the live count where there is one ----
const latest = new Map();
for (const m of snaps) { const k = snapKey(m); if (!latest.has(k) || Date.parse(m.at) >= Date.parse(latest.get(k).at)) latest.set(k, m); }
const postKey = (net, l) => `${net}:${l.id}`;
const videos = posts.map(p => {
  const n = {};
  for (const net of NETS) {
    const l = p.links?.[net]; if (!l?.id) continue;
    const m = latest.get(postKey(net, l)) || {}, live = (net === 'tiktok' ? tt : net === 'youtube' ? yt : null)?.views.get(l.id);
    const views = m.views == null && live == null ? null : Math.max(m.views ?? 0, live ?? 0);   // null: not counted yet
    n[net] = { views, likes: m.likes ?? null, comments: m.comments ?? null, shares: m.shares ?? null };
  }
  const total = NETS.reduce((s, net) => s + (n[net]?.views || 0), 0);
  return { id: p.id, title: p.title, artist: p.artist, date: p.date, thumb: p.thumb, nets: Object.keys(p.links || {}), views: total, by: n };
});

// ---- per platform and in total ----
const sum = (net, f) => videos.reduce((s, v) => s + (v.by[net]?.[f] || 0), 0);
const platforms = {};
for (const net of NETS) platforms[net] = { views: sum(net, 'views'), likes: sum(net, 'likes'), comments: sum(net, 'comments'), shares: sum(net, 'shares'), posts: videos.filter(v => v.by[net]).length, followers: null };
if (tt) { platforms.tiktok.followers = Number.isNaN(tt.followers) ? null : tt.followers; if (tt.likes > platforms.tiktok.likes) platforms.tiktok.likes = tt.likes; }
if (yt) platforms.youtube.followers = yt.followers;
platforms.x = { posts: videos.filter(v => v.nets.includes('x')).length };
const tot = f => NETS.reduce((s, net) => s + (platforms[net][f] || 0), 0);
const totals = { views: tot('views'), likes: tot('likes'), comments: tot('comments'), shares: tot('shares'), followers: tot('followers'), videos: videos.length };

// ---- total views over time: each snapshot run, over the posts still up, then now ----
const up = new Set(posts.flatMap(p => NETS.filter(net => p.links?.[net]?.id).map(net => postKey(net, p.links[net]))));
const runs = new Map();
for (const m of snaps) if (up.has(snapKey(m))) runs.set(m.at, (runs.get(m.at) || 0) + (m.views || 0));
const history = [...runs].sort((a, b) => Date.parse(a[0]) - Date.parse(b[0])).map(([at, views]) => ({ at, views }));
const now = new Date().toISOString();
history.push({ at: now, views: totals.views });

const prev = fs.existsSync(OUT) ? JSON.parse(fs.readFileSync(OUT, 'utf8')) : {};
const out = {
  updated: now, snapshot: snaps.at(-1)?.at || null, live: { tiktok: !!tt, youtube: !!yt },
  totals, platforms, videos, history, ...(siteNow || prev.site ? { site: siteNow || prev.site } : {}),
};
fs.writeFileSync(OUT, JSON.stringify(out, null, 1) + '\n');
console.log(`${OUT}: ${totals.views} views, ${totals.likes} likes, ${totals.followers} followers, ${totals.videos} videos (TikTok ${tt ? 'live' : 'snapshot'}, YouTube ${yt ? 'live' : 'snapshot'}${out.site ? `, site: ${out.site.visitors} visitors` : ''})`);
for (const v of videos) console.log(`  ${v.date.slice(0, 10)} ${v.title}: ${v.views} (${NETS.filter(n => v.by[n]).map(n => `${n} ${v.by[n].views}`).join(', ')})`);
