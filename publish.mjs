// Publish a rendered video publicly to TikTok, Instagram and YouTube.
//
//   node publish.mjs out/saxo_dance_62s.mp4                     # post now, everywhere
//   node publish.mjs out/x.mp4 --when=2026-09-25T17:00:00Z      # schedule
//   node publish.mjs out/x.mp4 --dry-run                        # print the captions, send nothing
//   node publish.mjs out/x.mp4 --draft                          # Postiz platforms only: upload + save as a draft
//
// Options: --song= --artist= (default: CONFIG.song in video.config.js), --caption= (hook line), --tags=a,b (extra
// hashtags), --only=tiktok,instagram,youtube, --via=postiz (send everything through Postiz instead), --rev=<commit> (only for
// an older render: a commit whose src/lyrics.js is that render's, for the YouTube cut; default: src/lyrics.js on disk).
//
// YouTube gets its own cut of 60 s or less (tools/yt_cut.mjs, ending on a lyric line): it blocks worldwide any Short
// over 60 s with a Content ID claim, and every label-owned song gets one. TikTok and Instagram get the full render.
//
// Routes. Our own TikTok and YouTube apps are unaudited (TikTok could only reach the inbox, YouTube locked uploads to
// private), so those two go through Zernio (zernio.com, free for 2 accounts), whose audited apps post publicly:
// TikTok through its TikTok for Business app (video posts are public-only there), YouTube public. Instagram goes
// through the self-hosted Postiz (postiz.saxo.dance), which stores media on Cloudflare R2 because Meta refuses to
// fetch from postiz.saxo.dance.
//
// Keys: POSTIZ_API_KEY and ZERNIO_API_KEY from the environment, else ~/.postiz-saxo.env and ~/.zernio-saxo.env.
// The Postiz public API allows 30 requests an hour; a run uses 3.
import { execFileSync, execSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import vm from 'node:vm';
import { buildHashtags } from './tools/hashtags.mjs';

const POSTIZ = 'https://postiz.saxo.dance/api/public/v1';
const ZERNIO = 'https://zernio.com/api/v1';
// Committed, so the feedback loop (tools/feedback.mjs) can tie each post back to its song and commit.
const LOG = new URL('./research/published.jsonl', import.meta.url);

const args = Object.fromEntries(process.argv.slice(2).filter(a => a.startsWith('--')).map(a => {
  const [k, ...v] = a.slice(2).split('=');
  return [k, v.length ? v.join('=') : true];
}));
const file = process.argv.slice(2).find(a => !a.startsWith('--'));
if (!file || !fs.existsSync(file)) {
  console.error('usage: node publish.mjs <video.mp4> [--when=ISO] [--dry-run] [--draft] …');
  process.exit(1);
}

// video.config.js sets window.CONFIG; run it in a sandbox to read the song.
const sandbox = { window: {} };
vm.runInNewContext(fs.readFileSync(new URL('./video.config.js', import.meta.url), 'utf8'), sandbox);
const CONFIG = sandbox.window.CONFIG;
const song = args.song || CONFIG.song?.title;
const artist = args.artist || CONFIG.song?.artist;
if (!song || !artist) {
  console.error('No song: set CONFIG.song = { title, artist } in video.config.js or pass --song= --artist=');
  process.exit(1);
}

const hook = args.caption || `Saxo dances to ${song} by ${artist} 🐶🕺`;
const extra = typeof args.tags === 'string' ? args.tags.split(',') : [];
const only = typeof args.only === 'string' ? args.only.split(',') : ['tiktok', 'instagram', 'youtube'];
const route = p => (args.via === 'postiz' || p === 'instagram' ? 'postiz' : 'zernio');
const type = args.draft ? 'draft' : args.when ? 'schedule' : 'now';
const date = args.when ? new Date(args.when).toISOString() : new Date().toISOString();

// The YouTube file: the render itself when it is already 59.5 s or less, else its _yt cut.
const ytFile = only.includes('youtube')
  ? execFileSync('node', [new URL('./tools/yt_cut.mjs', import.meta.url).pathname, file, ...(args.rev ? [`--rev=${args.rev}`] : [])], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'inherit'] }).trim().split('\n').at(-1)
  : null;
const fileFor = p => (p === 'youtube' ? ytFile : file);

const tags = p => buildHashtags({ song, artist, extra, platform: p });
const clip = (s, n) => (s.length <= n ? s : s.slice(0, n - 1).trimEnd() + '…');
const caption = {
  tiktok: `${hook}\n\n${tags('tiktok').join(' ')}`,
  instagram: `${hook}\n\n${tags('instagram').join(' ')}`,
  youtube: `${hook}\n\n${tags('youtube').join(' ')}`,
};
const youtubeTitle = clip(`${hook.replace(/[<>]/g, '')} #shorts`, 100);

function key(name, file) {
  if (process.env[name]) return process.env[name].trim();
  const f = path.join(os.homedir(), file);
  const line = fs.existsSync(f) && fs.readFileSync(f, 'utf8').split('\n').find(l => l.startsWith(name + '='));
  if (!line) throw new Error(`${name} missing: set it in the environment or in ${f}`);
  return line.slice(name.length + 1).trim();
}

async function call(base, auth, method, route, body) {
  const res = await fetch(base + route, {
    method,
    headers: { Authorization: auth, ...(body && !(body instanceof FormData) ? { 'Content-Type': 'application/json' } : {}) },
    body: body instanceof FormData ? body : body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`${method} ${route} → ${res.status}: ${text.slice(0, 500)}`);
  return text ? JSON.parse(text) : null;
}
const postiz = (...a) => call(POSTIZ, key('POSTIZ_API_KEY', '.postiz-saxo.env'), ...a);
const zernio = (...a) => call(ZERNIO, `Bearer ${key('ZERNIO_API_KEY', '.zernio-saxo.env')}`, ...a);

// ---- Postiz (Instagram, or everything with --via=postiz) ----
const PROVIDER = { tiktok: 'tiktok', instagram: 'instagram-standalone', youtube: 'youtube' };
function postizSettings(p) {
  if (p === 'tiktok') return {
    __type: 'tiktok', title: clip(hook, 90), content_posting_method: 'UPLOAD', // unaudited app: inbox only
    privacy_level: 'PUBLIC_TO_EVERYONE', duet: true, stitch: true, comment: true, autoAddMusic: 'no',
    brand_content_toggle: false, brand_organic_toggle: false, video_made_with_ai: false,
  };
  if (p === 'instagram') return { __type: 'instagram-standalone', post_type: 'post', is_trial_reel: false, collaborators: [] };
  return {
    __type: 'youtube', title: youtubeTitle, type: 'public', selfDeclaredMadeForKids: 'no',
    tags: tags('youtube').map(t => t.slice(1)).map(t => ({ value: t, label: t })),
  };
}
async function viaPostiz(platforms) {
  const channels = await postiz('GET', '/integrations');
  const channel = p => channels.find(c => c.identifier === PROVIDER[p] && !c.disabled);
  const missing = platforms.filter(p => !channel(p));
  if (missing.length) throw new Error(`Not connected in Postiz: ${missing.join(', ')}`);
  const uploads = {};
  for (const f of new Set(platforms.map(fileFor))) {
    const form = new FormData();
    form.append('file', await fs.openAsBlob(f, { type: 'video/mp4' }), path.basename(f));
    uploads[f] = await postiz('POST', '/upload', form);
    console.log(`postiz: uploaded ${uploads[f].path}`);
  }
  const posts = platforms.map(p => ({
    integration: { id: channel(p).id },
    value: [{ content: caption[p], image: [{ id: uploads[fileFor(p)].id, path: uploads[fileFor(p)].path }] }],
    settings: postizSettings(p),
  }));
  const result = await postiz('POST', '/posts', { type, date, shortLink: false, tags: [], posts });
  console.log(`postiz: created (${type})`, JSON.stringify(result));
  return { media: Object.values(uploads).map(u => u.path).join(' '), result };
}

// ---- Zernio (TikTok and YouTube) ----
function zernioPost(p, accountId, url) {
  const when = type === 'schedule' ? { scheduledFor: date.replace(/Z$/, ''), timezone: 'UTC' } : { publishNow: true };
  if (p === 'tiktok') return {
    content: caption.tiktok, mediaItems: [{ type: 'video', url }],
    platforms: [{ platform: 'tiktok', accountId }],
    // Our TikTok is on Zernio's Business-app lane, where video posts can only be public.
    tiktokSettings: {
      privacy_level: 'PUBLIC_TO_EVERYONE', allow_comment: true, allow_duet: true, allow_stitch: true,
      content_preview_confirmed: true, express_consent_given: true,
    },
    ...when,
  };
  return {
    content: caption.youtube, tags: tags('youtube').map(t => t.slice(1)), mediaItems: [{ type: 'video', url }],
    // Vertical and 60 s or less (fileFor), so YouTube files it as a Short and a Content ID claim does not block it.
    platforms: [{ platform: 'youtube', accountId, platformSpecificData: { title: youtubeTitle, visibility: 'public', madeForKids: false } }],
    ...when,
  };
}
async function viaZernio(platforms) {
  if (type === 'draft') { console.log(`zernio: --draft skips ${platforms.join(', ')}`); return null; }
  const { accounts } = await zernio('GET', '/accounts');
  const account = p => accounts.find(a => a.platform === p && a.isActive);
  const missing = platforms.filter(p => !account(p));
  if (missing.length) throw new Error(`Not connected in Zernio: ${missing.join(', ')}`);
  const urls = {};
  for (const f of new Set(platforms.map(fileFor))) {
    const size = fs.statSync(f).size;
    const { uploadUrl, publicUrl } = await zernio('POST', '/media/presign', { filename: path.basename(f), contentType: 'video/mp4', size });
    const put = await fetch(uploadUrl, { method: 'PUT', headers: { 'Content-Type': 'video/mp4' }, body: await fs.openAsBlob(f), duplex: 'half' });
    if (!put.ok) throw new Error(`zernio upload → ${put.status}`);
    console.log(`zernio: uploaded ${publicUrl}`);
    urls[f] = publicUrl;
  }
  const result = [];
  for (const p of platforms) {
    const r = await zernio('POST', '/posts', zernioPost(p, account(p)._id, urls[fileFor(p)]));
    const st = r.post?.platforms?.[0];
    console.log(`zernio: ${p} ${r.post?.status}${st?.errorMessage ? ' — ' + st.errorMessage : ''} (post ${r.post?._id})`);
    result.push({ platform: p, postId: r.post?._id, status: r.post?.status, ...(st?.platformPostUrl ? { url: st.platformPostUrl } : {}) });
  }
  return { media: Object.values(urls).join(' '), result };
}

console.log(`${path.basename(file)}: ${song} by ${artist}, ${type}${args.when ? ' at ' + date : ''}`);
for (const p of only) console.log(`\n[${p} via ${route(p)}, ${path.basename(fileFor(p))}]${p === 'youtube' ? ' ' + youtubeTitle : ''}\n${caption[p]}`);
if (args['dry-run']) {
  console.log('\n--dry-run: nothing sent.');
  process.exit(0);
}
console.log('');

const runs = {};
const failed = [];
for (const [name, fn] of [['postiz', viaPostiz], ['zernio', viaZernio]]) {
  const platforms = only.filter(p => route(p) === name);
  if (!platforms.length) continue;
  try { runs[name] = await fn(platforms); }
  catch (e) { failed.push(name); console.error(`${name}: ${e.message}`); }
}

if (type !== 'draft' && Object.values(runs).some(Boolean)) {
  let commit = null;
  try { commit = execSync('git rev-parse --short HEAD', { cwd: path.dirname(new URL(import.meta.url).pathname) }).toString().trim(); } catch {}
  // The episode id (episodes/<id>.json) ties the post to its tags for tools/metrics.mjs: --episode=, else the MP4 name's prefix.
  const episode = args.episode || path.basename(file).match(/^(\d{4}-\d{2}-\d{2}(?:-\d+)?)/)?.[1] || null;
  fs.appendFileSync(LOG, JSON.stringify({ at: new Date().toISOString(), file: path.basename(file), ...(ytFile && ytFile !== file ? { ytFile: path.basename(ytFile) } : {}), episode, song, artist, type, date, only, commit, runs }) + '\n');
}
if (only.includes('tiktok') && route('tiktok') === 'postiz' && type !== 'draft')
  console.log('\nTikTok via Postiz: the video is in the TikTok app inbox. Open it within 24 h and post it public.');
if (failed.length) process.exit(1);
