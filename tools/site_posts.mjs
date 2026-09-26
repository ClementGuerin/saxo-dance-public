// site_posts.mjs: the list Saxo TV shows on saxo.dance. One entry per video, with its TikTok, Instagram, YouTube and X
// posts, built from research/published.jsonl (what we posted), research/metrics.jsonl (the public URLs and views
// SocialCrawl found) and research/yt_blocked.json (Shorts YouTube blocked, left out), plus the post URLs Zernio and
// Postiz return for our own posts (free API reads), so a video shows every platform as soon as it's posted instead of
// after the next metrics run. Found URLs are cached in research/post_links.json. TikTok links come last from TikTok's
// public creator embed (what's live now, including posts published by hand from the app). A video is listed once its
// first post has gone out (its slot, not the run that scheduled it), so a rebuild after each slot adds it.
//   node tools/site_posts.mjs        → site/assets/posts.json, site/assets/posts/<id>.jpg, site/assets/tv.mp4
// The thumbnail and the TV loop come from the render in out/, when it's there.
import fs from 'node:fs';
import { spawnSync } from 'node:child_process';
import os from 'node:os';

function key(name, file) {
  if (process.env[name]) return process.env[name].trim();
  const f = `${os.homedir()}/${file}`, line = fs.existsSync(f) && fs.readFileSync(f, 'utf8').split('\n').find(l => l.startsWith(name + '='));
  return line ? line.slice(name.length + 1).trim() : null;
}
const getJSON = async (url, auth) => { const r = await fetch(url, { headers: { Authorization: auth }, signal: AbortSignal.timeout(12000) }); if (!r.ok) throw new Error(`${r.status}`); return r.json(); };
const CACHE = 'research/post_links.json', cache = fs.existsSync(CACHE) ? JSON.parse(fs.readFileSync(CACHE, 'utf8')) : {};
const linkOf = (platform, url) => {
  if (!url) return null;
  if (platform === 'tiktok') { const id = url.match(/video\/(\d+)/)?.[1]; return id ? { url, id } : null; }
  if (platform === 'instagram') { const id = url.match(/\/(?:reel|p)\/([\w-]+)/)?.[1]; return id ? { url, id } : null; }
  if (platform === 'youtube') { const id = url.match(/(?:v=|shorts\/|youtu\.be\/)([\w-]{11})/)?.[1]; return id ? { url: `https://www.youtube.com/shorts/${id}`, id } : null; }
  if (platform === 'x') { const m = url.match(/(?:x|twitter)\.com\/(\w+)\/status\/(\d+)/); return m ? { url: `https://x.com/${m[1]}/status/${m[2]}`, id: m[2] } : null; }
  return null;
};

const read = f => fs.existsSync(f) ? fs.readFileSync(f, 'utf8').trim().split('\n').filter(Boolean).map(l => JSON.parse(l)) : [];
const published = read('research/published.jsonl'), metrics = read('research/metrics.jsonl');
const blocked = fs.existsSync('research/yt_blocked.json') ? JSON.parse(fs.readFileSync('research/yt_blocked.json', 'utf8')) : {};
const OUT = 'site/assets', slug = s => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const ytId = u => u?.match(/(?:v=|shorts\/|youtu\.be\/)([\w-]{11})/)?.[1];
const base = f => f.replace(/_(yt|ig)\.mp4$/, '.mp4');

// ---- group every publish by video (the episode, else the song, as metrics.mjs does) ----
// A publish counts from when it goes out (`date`: a scheduled post's slot), not from when publish.mjs ran (`at`): the
// night's videos are scheduled hours ahead, and one dated by its scheduling run showed on the TV before its release,
// holding the TikTok that went out in between (Voyage Voyage, 2026-09-26).
const outAt = p => p.date || p.at;
const videos = new Map();
for (const p of published) {
  if (Date.parse(outAt(p)) > Date.now()) continue;   // not out yet
  const key = p.episode || (/^\d{4}-\d{2}-\d{2}/.test(p.file) ? p.file.slice(0, 10) : null) || 'song:' + p.song;
  const v = videos.get(key) || { key, title: p.song, artist: p.artist, date: outAt(p), file: base(p.file), links: {}, zernio: [], postiz: [] };
  for (const r of p.runs?.zernio?.result || []) if (r.postId) v.zernio.push(r.postId);
  for (const r of [...(p.runs?.postiz?.result || []), ...(p.result || [])]) if (r.postId) v.postiz.push(r.postId);
  if (Date.parse(outAt(p)) < Date.parse(v.date)) v.date = outAt(p);
  for (const r of p.runs?.zernio?.result || []) {
    const id = ytId(r.url);
    if (r.platform === 'youtube' && id && !blocked[id]) v.links.youtube = { url: `https://www.youtube.com/shorts/${id}`, id };
  }
  videos.set(key, v);
}
// our own services know their posts' public URLs (Zernio: TikTok and YouTube; Postiz: Instagram, X, TikTok inbox posts;
// X links come only from here, metrics doesn't read X)
const zk = key('ZERNIO_API_KEY', '.zernio-saxo.env'), pk = key('POSTIZ_API_KEY', '.postiz-saxo.env');
let postizList = null;
for (const v of videos.values()) {
  for (const id of v.zernio) {
    if (!cache['zernio:' + id] && zk) try {
      const d = await getJSON(`https://zernio.com/api/v1/posts/${id}`, `Bearer ${zk}`), post = d.post || d;
      const found = (post.platforms || []).filter(pl => pl.platformPostUrl && pl.status === 'published').map(pl => [pl.platform, pl.platformPostUrl]);
      if (found.length) cache['zernio:' + id] = found;
    } catch (e) { console.log(`zernio ${id}: ${e.message} (skipped)`); }
    for (const [pl, url] of cache['zernio:' + id] || []) { const l = linkOf(pl, url); if (l && !(pl === 'youtube' && blocked[l.id])) v.links[pl] ||= l; }
  }
  for (const id of v.postiz) {
    if (!cache['postiz:' + id] && pk && postizList !== false) {
      try { postizList ??= (await getJSON(`https://postiz.saxo.dance/api/public/v1/posts?startDate=${new Date(Date.now() - 30 * 864e5).toISOString()}&endDate=${new Date().toISOString()}`, pk)).posts || []; }
      catch (e) { console.log(`postiz: ${e.message} (unreachable, skipped: Instagram links wait for metrics or the next run, X links for the next run)`); postizList = false; }
      const hit = postizList && postizList.find(x => x.id === id && x.releaseURL);
      if (hit) cache['postiz:' + id] = [[hit.integration?.providerIdentifier?.replace(/-standalone$/, '') || '', hit.releaseURL]];
    }
    for (const [pl, url] of cache['postiz:' + id] || []) { const platform = /instagram/.test(url) ? 'instagram' : /tiktok/.test(url) ? 'tiktok' : pl; const l = linkOf(platform, url); if (l) v.links[platform] ||= l; }
  }
}
fs.writeFileSync(CACHE, JSON.stringify(cache, null, 1) + '\n');

// metrics rows carry the TikTok and Instagram URLs; keep the latest snapshot per post for its views
const latest = new Map();
for (const m of metrics) { const k = m.platform + ':' + m.id; if (!latest.has(k) || Date.parse(m.at) >= Date.parse(latest.get(k).at)) latest.set(k, m); }
for (const m of latest.values()) {
  const v = videos.get(m.episode) || [...videos.values()].find(x => 'song:' + x.title === m.episode);
  if (!v) continue;
  if (m.platform === 'tiktok') v.links.tiktok = { url: m.url, id: m.id };   // metrics (public data) wins over the services
  if (m.platform === 'instagram') v.links.instagram = { url: m.url, id: m.url.match(/\/(?:reel|p)\/([\w-]+)/)?.[1] };
  if (m.platform === 'youtube' && !blocked[m.id]) v.links.youtube ||= { url: `https://www.youtube.com/shorts/${m.id}`, id: m.id };
  if (m.views) v.views = (v.views || 0) + m.views;
}

// TikTok's public creator embed lists the account's recent posts (free, no key), so it has the last word on TikTok
// links: label songs mean the TikTok that stays up is published by hand from the app (CLAUDE.md, Publishing), which no
// service knows about, and the muted Zernio post gets deleted. A live post goes to the video its caption names (or, for
// a caption without the song, the video whose publish window it falls in); a linked post missing from the list, though
// newer than the oldest one listed, was deleted and is dropped.
async function tiktokLive(user) {
  try {
    const h = await (await fetch(`https://www.tiktok.com/embed/@${user}`, { headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0 Safari/537.36' }, signal: AbortSignal.timeout(15000) })).text();
    const i = h.indexOf('"videoList":[') + 12; if (i < 12) return null;
    let d = 0, j = i, q = false;
    for (; j < h.length; j++) {   // the array's end, skipping brackets inside strings (captions)
      const c = h[j];
      if (q) { if (c === '\\') j++; else if (c === '"') q = false; }
      else if (c === '"') q = true; else if (c === '[') d++; else if (c === ']' && --d === 0) break;
    }
    const list = JSON.parse(h.slice(i, j + 1)).filter(x => x.authorUniqueId === user && !x.privateItem);
    return list.length ? list : null;
  } catch (e) { console.log(`tiktok embed: ${e.message} (skipped, TikTok links from the services and metrics)`); return null; }
}
const ttTime = id => Number(BigInt(id) >> 32n) * 1000;   // a TikTok id starts with its post time
const live = await tiktokLive('saxo.dance');
if (live) {
  const byDate = [...videos.values()].sort((a, b) => Date.parse(a.date) - Date.parse(b.date)), oldest = Math.min(...live.map(x => ttTime(x.id)));
  // the title without its "(Techno)"-style suffix, anywhere in the caption ("dances to … by", "danse sur … de"); the
  // longest title named wins
  const core = t => t.toLowerCase().replace(/\s*\([^)]*\)/g, '').trim();
  const owner = x => byDate.filter(v => core(v.title).length > 2 && x.desc.toLowerCase().includes(core(v.title))).sort((a, b) => core(b.title).length - core(a.title).length)[0]
    || byDate.filter(v => Date.parse(v.date) - 36e5 <= ttTime(x.id)).pop();
  const claimed = new Map();
  for (const x of live) { const v = owner(x); if (v && (!claimed.has(v) || ttTime(x.id) > ttTime(claimed.get(v).id))) claimed.set(v, x); }
  for (const v of byDate) {
    const x = claimed.get(v), cur = v.links.tiktok;
    if (x) v.links.tiktok = { url: `https://www.tiktok.com/@saxo.dance/video/${x.id}`, id: x.id };
    else if (cur && ttTime(cur.id) >= oldest && !live.some(y => y.id === cur.id)) delete v.links.tiktok;
  }
}

// ---- thumbnails and the TV loop from the renders ----
fs.mkdirSync(`${OUT}/posts`, { recursive: true });
const ff = a => spawnSync('ffmpeg', ['-v', 'error', '-y', ...a], { stdio: 'inherit' }).status === 0;
const dur = f => +spawnSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f]).stdout.toString().trim() || 0;
const list = [...videos.values()].filter(v => Object.keys(v.links).length).sort((a, b) => Date.parse(b.date) - Date.parse(a.date));
for (const v of list) {
  v.id = slug(v.key.replace(/^song:/, '')); const src = `out/${v.file}`, thumb = `${OUT}/posts/${v.id}.jpg`;
  if (fs.existsSync(src) && !fs.existsSync(thumb)) ff(['-ss', String(Math.min(9, dur(src) * 0.3)), '-i', src, '-frames:v', '1', '-vf', 'scale=360:640:flags=lanczos', '-q:v', '4', thumb]);
  v.thumb = fs.existsSync(thumb) ? `assets/posts/${v.id}.jpg` : 'assets/ui/saxo.png';
}
const newest = list.find(v => fs.existsSync(`out/${v.file}`));
if (newest) {   // 8 s of the newest video, cropped 4:3 around the dancers (the karaoke sits above), PS1-small
  const src = `out/${newest.file}`, at = Math.max(0, dur(src) * 0.35);
  ff(['-ss', String(at), '-t', '8', '-i', src, '-an', '-vf', 'crop=iw:iw*3/4:0:ih*0.40,scale=192:144:flags=neighbor,fps=15', '-c:v', 'libx264', '-profile:v', 'baseline', '-pix_fmt', 'yuv420p', '-crf', '28', '-movflags', '+faststart', `${OUT}/tv.mp4`]);
}
const posts = list.map(({ id, title, artist, date, thumb, links, views }) => ({ id, title, artist, date, thumb, links, ...(views ? { views } : {}) }));
// "updated" moves only when the list does: the routine refreshes every 30 min and commits posts.json when it changes
let prev = {}; try { prev = JSON.parse(fs.readFileSync(`${OUT}/posts.json`, 'utf8')); } catch {}
const updated = prev.updated && JSON.stringify(prev.posts) === JSON.stringify(posts) ? prev.updated : new Date().toISOString();
fs.writeFileSync(`${OUT}/posts.json`, JSON.stringify({ updated, posts }, null, 1) + '\n');
console.log(`${posts.length} videos → ${OUT}/posts.json`); posts.forEach(p => console.log(`  ${p.date.slice(0, 10)} ${p.title}: ${Object.keys(p.links).join(', ')}${p.views ? `, ${p.views} views` : ''}`));
