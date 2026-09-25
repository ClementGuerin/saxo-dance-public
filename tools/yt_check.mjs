// tools/yt_check.mjs: find our YouTube Shorts that YouTube has blocked (a Content ID claim over the length limit).
//   node tools/yt_check.mjs [--days=14] [--id=<videoId>,…]
// Reads the YouTube posts in research/published.jsonl (Zernio post → video id; Postiz posts → releaseURL, when the
// server answers), opens each watch page and reads its playabilityStatus: OK, or UNPLAYABLE for a blocked or removed
// video. No API key: the public page says the same thing a viewer sees.
// For each blocked Short it says what to do:
//   - it was over 60 s (posted before tools/yt_cut.mjs existed): repost the ≤60 s cut, which keeps the song
//     (`node publish.mjs out/<file> --only=youtube --rev=<commit with its lyrics>`), then delete the blocked one in Studio;
//   - it was already 60 s or less: the label blocks the song on Shorts at any length, so skip it (no song, no video).
// Blocked ids are recorded in research/yt_blocked.json, so a later run reports only new ones. Exit 2 when a new one is found.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const args = Object.fromEntries(process.argv.slice(2).filter(a => a.startsWith('--')).map(a => { const [k, ...v] = a.slice(2).split('='); return [k, v.join('=')]; }));
const root = new URL('..', import.meta.url).pathname;
const LOG = path.join(root, 'research/published.jsonl'), SEEN = path.join(root, 'research/yt_blocked.json');
const since = Date.now() - (+(args.days || 14)) * 864e5;

function key(name, file) {
  if (process.env[name]) return process.env[name].trim();
  const f = path.join(os.homedir(), file);
  const line = fs.existsSync(f) && fs.readFileSync(f, 'utf8').split('\n').find(l => l.startsWith(name + '='));
  return line ? line.slice(name.length + 1).trim() : null;
}
const get = async (url, auth) => {
  const r = await fetch(url, { headers: auth ? { Authorization: auth } : {}, signal: AbortSignal.timeout(20000) });
  if (!r.ok) throw new Error(`${url} → ${r.status}`);
  return r.json();
};
const idOf = url => url?.match(/(?:v=|shorts\/|youtu\.be\/)([\w-]{11})/)?.[1];

// ---- the posts to check ----
const posts = fs.readFileSync(LOG, 'utf8').trim().split('\n').map(l => JSON.parse(l))
  .filter(p => p.only?.includes('youtube') && Date.parse(p.at) >= since);
const videos = [];   // { id, post }
for (const id of (args.id || '').split(',').filter(Boolean)) videos.push({ id, post: null });
const zk = key('ZERNIO_API_KEY', '.zernio-saxo.env'), pk = key('POSTIZ_API_KEY', '.postiz-saxo.env');
let postizPosts = null;
for (const post of posts) {
  const z = post.runs?.zernio?.result?.find(r => r.platform === 'youtube');
  let id = idOf(z?.url);
  if (z && !id && zk) {
    try { id = (await get(`https://zernio.com/api/v1/posts/${z.postId}`, `Bearer ${zk}`)).post?.platforms?.[0]?.platformPostId; }
    catch (e) { console.warn(`zernio ${z.postId}: ${e.message}`); }
  }
  if (!z && pk) {   // posted through Postiz (older posts, or --via=postiz)
    const ids = (post.result || post.runs?.postiz?.result || []).map(r => r.postId);
    try {
      postizPosts ??= (await get(`https://postiz.saxo.dance/api/public/v1/posts?startDate=${new Date(since).toISOString()}&endDate=${new Date().toISOString()}`, pk)).posts || [];
      id = postizPosts.filter(p => ids.includes(p.id)).map(p => idOf(p.releaseURL)).find(Boolean);
    } catch (e) { console.warn(`postiz: ${e.message} (can't resolve ${post.file})`); pk && (postizPosts = []); }
  }
  if (id) videos.push({ id, post });
  else console.warn(`no YouTube id for ${post.file} (${post.at.slice(0, 10)})`);
}

// ---- playability ----
async function status(id) {
  const r = await fetch(`https://www.youtube.com/watch?v=${id}&hl=en`, {
    headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128 Safari/537.36', 'Accept-Language': 'en-US', Cookie: 'CONSENT=YES+1; SOCS=CAI' },
    signal: AbortSignal.timeout(20000),
  });
  const m = (await r.text()).match(/"playabilityStatus":\{"status":"(\w+)"(?:,"reason":"([^"]*)")?/);
  return m ? { status: m[1], reason: m[2] || '' } : { status: 'UNKNOWN', reason: `no playabilityStatus (HTTP ${r.status})` };
}
const duration = f => +spawnSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f]).stdout || null;

const seen = fs.existsSync(SEEN) ? JSON.parse(fs.readFileSync(SEEN, 'utf8')) : {};
let fresh = 0;
for (const { id, post } of videos) {
  const s = await status(id);
  const label = post ? `${post.song} (${post.at.slice(0, 10)}, ${post.ytFile || post.file})` : id;
  if (s.status === 'OK') { console.log(`OK        ${id}  ${label}`); continue; }
  if (s.status !== 'UNPLAYABLE') { console.log(`${s.status.padEnd(9)} ${id}  ${label}: ${s.reason}`); continue; }
  const f = post && path.join(root, 'out', post.ytFile || post.file), len = f && fs.existsSync(f) ? duration(f) : null;
  const action = !post ? 'check it in YouTube Studio'
    : len && len > 60 ? `repost the ≤60 s cut: node publish.mjs out/${post.file} --only=youtube --rev=<commit with its lyrics>; then delete ${id} in Studio`
    : len ? 'was already ≤60 s: the label blocks this song on Shorts, skip it'
    : `out/${post.ytFile || post.file} is gone: re-render or skip`;
  const isNew = !seen[id];
  console.log(`BLOCKED   ${id}  ${label}${isNew ? '  [new]' : ''}\n          → ${action}`);
  if (isNew) { fresh++; seen[id] = { at: new Date().toISOString(), song: post?.song, file: post?.file, seconds: len, action }; }
}
fs.writeFileSync(SEEN, JSON.stringify(seen, null, 1) + '\n');
if (fresh) process.exit(2);
