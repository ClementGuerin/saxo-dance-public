// How did each video do? Snapshots every post's numbers so the next scenario can learn from them.
//
//   node tools/metrics.mjs              # snapshot all our posts → research/metrics.jsonl, then research/PERFORMANCE.md
//   node tools/metrics.mjs --report     # rebuild PERFORMANCE.md from the snapshots already taken, no API call
//
// One listing call per platform (TikTok 1, Instagram 1, YouTube 1 credit ≈ $0.024 a run). Each snapshot line is
// { at, platform, id, url, published_at, age_h, episode, views, likes, comments, shares, saves }.
// A post is tied to its episode through research/published.jsonl (the MP4 name starts with the episode id,
// e.g. 2026-09-25 or 2026-09-25-2), and the episode's `tags` (episodes/<id>.json) are what the report groups by.
//
// PERFORMANCE.md compares each episode to the channel's median at the same age (24 h and 72 h), on views and on
// rates (likes, shares, comments per 1,000 views), because shares and likes move before reach does. With fewer than
// ~5 episodes per tag, treat any difference as noise.
import fs from 'node:fs';
import { sc, spent, logSpend, args } from './socialcrawl.mjs';

const HANDLE = { tiktok: 'saxo.dance', instagram: 'saxo.dance', youtube: 'saxodance' };
const R = p => new URL(`../${p}`, import.meta.url);
const STORE = R('research/metrics.jsonl');
const read = f => fs.existsSync(f) ? fs.readFileSync(f, 'utf8').split('\n').filter(Boolean).map(l => JSON.parse(l)) : [];

async function ourPosts(platform) {
  const data =
    platform === 'tiktok' ? await sc('tiktok/profile/videos', { handle: HANDLE.tiktok }) :
    platform === 'instagram' ? await sc('instagram/profile/reels', { handle: HANDLE.instagram }) :
    await sc('youtube/channel/shorts', { handle: HANDLE.youtube, sort: 'newest' });
  return (data.items || []).map(({ post }) => ({ platform, id: String(post.id), url: post.url,
    published_at: post.published_at, caption: post.content?.text || '', e: post.engagement || {} }));
}

// Episode id of a post: the publish closest before it on that platform, or the song named in its caption.
const log = read(R('research/published.jsonl'));
function episodeOf(p) {
  const t = Date.parse(p.published_at || 0);
  const byCaption = log.filter(e => e.song && p.caption.toLowerCase().includes(e.song.toLowerCase())).at(-1);
  const byTime = log.filter(e => Date.parse(e.date || e.at) <= t + 5 * 60e3).at(-1);
  const e = byCaption || byTime;
  return e?.episode || e?.file?.match(/^(\d{4}-\d{2}-\d{2}(?:-\d+)?)/)?.[1] || (e ? `song:${e.song}` : null);
}

if (!args.report) {
  const now = new Date();
  const lines = [];
  for (const platform of Object.keys(HANDLE)) {
    try {
      for (const p of await ourPosts(platform)) {
        const age_h = p.published_at ? +((now - Date.parse(p.published_at)) / 36e5).toFixed(1) : null;
        lines.push({ at: now.toISOString(), platform, id: p.id, url: p.url, published_at: p.published_at, age_h,
          episode: episodeOf(p), views: p.e.views ?? null, likes: p.e.likes ?? null, comments: p.e.comments ?? null,
          shares: p.e.shares ?? null, saves: p.e.saves ?? null });
      }
    } catch (e) { console.warn(`${platform}: could not list posts (${e.message})`); }
  }
  fs.appendFileSync(STORE, lines.map(l => JSON.stringify(l)).join('\n') + (lines.length ? '\n' : ''));
  logSpend('metrics snapshot', 'performance loop');
  console.log(`${lines.length} posts snapshotted, ${spent.credits} credits → research/metrics.jsonl`);
}

// ---- report ----
const snaps = read(STORE);
const episodes = Object.fromEntries(fs.readdirSync(R('episodes')).filter(f => /^\d.*\.json$/.test(f))
  .map(f => [f.slice(0, -5), JSON.parse(fs.readFileSync(R(`episodes/${f}`), 'utf8'))]));

// Value of each post at a target age: the snapshot closest to it (within ±50%), summed over platforms per episode.
function atAge(h) {
  const best = {};
  for (const s of snaps) {
    if (!s.episode || s.age_h == null || Math.abs(s.age_h - h) > h / 2) continue;
    const k = `${s.platform}:${s.id}`;
    if (!best[k] || Math.abs(s.age_h - h) < Math.abs(best[k].age_h - h)) best[k] = s;
  }
  const by = {};
  for (const s of Object.values(best)) {
    const e = by[s.episode] ||= { views: 0, likes: 0, comments: 0, shares: 0, tiktok_views: 0 };
    for (const f of ['views', 'likes', 'comments', 'shares']) e[f] += s[f] || 0;
    if (s.platform === 'tiktok') e.tiktok_views += s.views || 0;
  }
  return by;
}
const median = xs => { const a = xs.filter(x => x != null).sort((x, y) => x - y); return a.length ? a[a.length >> 1] : null; };
const per1k = (n, v) => v ? +(1000 * n / v).toFixed(1) : null;

const md = ['# Performance', '', `Generated ${new Date().toISOString().slice(0, 16)}Z by \`tools/metrics.mjs\`. ` +
  'All platforms summed per episode. ×med = views divided by the channel median at that age. ' +
  'Rates are per 1,000 views. Fewer than ~5 episodes behind a tag = noise.', ''];
for (const h of [24, 72]) {
  const by = atAge(h);
  const ids = Object.keys(by).sort();
  if (!ids.length) { md.push(`## At ${h} h`, '', 'No episode has reached this age yet.', ''); continue; }
  const med = median(ids.map(i => by[i].views));
  md.push(`## At ${h} h (median ${med} views)`, '', '| Episode | Views | ×med | Likes/1k | Shares/1k | Comments/1k | Tags |', '|---|---|---|---|---|---|---|');
  for (const i of ids) {
    const e = by[i], t = episodes[i]?.tags;
    const tags = t ? Object.entries(t).map(([k, v]) => `${k}:${[].concat(v).join('+')}`).join(' ') : '(untagged)';
    md.push(`| ${i} | ${e.views} | ${med ? (e.views / med).toFixed(2) : '–'} | ${per1k(e.likes, e.views) ?? '–'} | ${per1k(e.shares, e.views) ?? '–'} | ${per1k(e.comments, e.views) ?? '–'} | ${tags} |`);
  }
  md.push('');
  // Per tag value: mean ×med and share rate, with the number of episodes behind it.
  const tagRows = {};
  for (const i of ids) for (const [k, v] of Object.entries(episodes[i]?.tags || {})) for (const x of [].concat(v)) {
    const r = tagRows[`${k}:${x}`] ||= { n: 0, x: 0, sh: 0 };
    r.n++; r.x += med ? by[i].views / med : 0; r.sh += per1k(by[i].shares, by[i].views) || 0;
  }
  const rows = Object.entries(tagRows).filter(([, r]) => r.n >= 2).sort((a, b) => b[1].x / b[1].n - a[1].x / a[1].n);
  if (rows.length) {
    md.push(`### Tags at ${h} h (2+ episodes)`, '', '| Tag | Episodes | Mean ×med | Mean shares/1k |', '|---|---|---|---|');
    for (const [k, r] of rows) md.push(`| ${k} | ${r.n} | ${(r.x / r.n).toFixed(2)} | ${(r.sh / r.n).toFixed(1)} |`);
    md.push('');
  }
}
fs.writeFileSync(R('research/PERFORMANCE.md'), md.join('\n'));
console.log('→ research/PERFORMANCE.md');
