// Publish a rendered video publicly to TikTok, Instagram, YouTube and X.
//
//   node publish.mjs out/saxo_dance_62s.mp4                     # post now, everywhere
//   node publish.mjs out/x.mp4 --when=2026-09-25T17:00:00Z      # schedule
//   node publish.mjs out/x.mp4 --dry-run                        # print the captions, send nothing
//   node publish.mjs out/x.mp4 --draft                          # Postiz platforms only: upload + save as a draft
//
// Options: --song= --artist= (default: CONFIG.song in video.config.js), --caption= (hook line), --tags=a,b (extra
// hashtags), --only=tiktok,instagram,youtube,x, --via=postiz (send everything through Postiz instead), --rev=<commit> (only for
// an older render: a commit whose src/lyrics.js is that render's, for the YouTube cut; default: src/lyrics.js on disk),
// --episode=<id> (default: the MP4 name's date prefix), --yt=start|end|<from>-<to> (the YouTube cut, see below),
// --sound="<title>" --uses=<count> (an official-sound cut's TikTok sound as the app lists it, and how many videos use it).
//
// A TikTok sent through Postiz lands in the TikTok app's inbox, where only the user can publish it, so they get two
// Discord messages once it's there (tools/notify.mjs; the user, 2026-09-26): a short one (the song; for an
// official-sound cut, an episode `<id>-tt` made when TikTok muted the post, the sound to add with its number of uses,
// so the right one is quick to spot, and the muted post to delete), then the TikTok description alone, to copy.
//
// YouTube gets its own cut of 60 s or less (tools/yt_cut.mjs, never inside a lyric line): it blocks worldwide any Short
// over 60 s with a Content ID claim, and every label-owned song gets one. TikTok, Instagram and X get the full render.
// Which 60 s: the episode's `yt` field ("start", "end", or [from, to] in seconds), else "end" for an episode (story
// episodes end on their payoff: keep it) and "start" for a plain dance render. A kit's episodes/<id>.lyrics.js gives
// the karaoke timings when it exists.
//
// Routes. Our own TikTok and YouTube apps are unaudited (TikTok could only reach the inbox, YouTube locked uploads to
// private), so those two go through Zernio (zernio.com, free for 2 accounts), whose audited apps post publicly:
// TikTok through its TikTok for Business app (video posts are public-only there), YouTube public. Instagram and X go
// through the self-hosted Postiz (postiz.saxo.dance), which stores media on Cloudflare R2 because Meta refuses to
// fetch from postiz.saxo.dance. X (@saxodance) posts through our own X app, which X bills per post: $0.015, or $0.20
// when the post contains a link. An X post is the video alone, with no text (the user's call, 2026-09-26).
// Each Postiz platform is its own post request, so one that Postiz refuses (or that isn't connected) doesn't stop
// the others; it's reported and the run exits 1.
//
// Keys: POSTIZ_API_KEY and ZERNIO_API_KEY from the environment, else ~/.postiz-saxo.env and ~/.zernio-saxo.env.
// The Postiz public API allows 30 requests an hour; a run uses 4 (the list, one upload, a post per platform).
import { execFileSync, execSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import vm from 'node:vm';
import { buildHashtags } from './tools/hashtags.mjs';
import { notify } from './tools/notify.mjs';

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

// The episode id (episodes/<id>.json) ties the post to its tags for tools/metrics.mjs: --episode=, else the MP4 name's prefix.
const episode = args.episode || path.basename(file).match(/^(\d{4}-\d{2}-\d{2}(?:-\d+)?)/)?.[1] || null;
// video.config.js sets window.CONFIG; run it in a sandbox to read the song, then the episode's kit
// (episodes/<id>.config.js) on top: a kit names its own song, and src/ may have moved on to another one since.
const sandbox = { window: {} };
vm.runInNewContext(fs.readFileSync(new URL('./video.config.js', import.meta.url), 'utf8'), sandbox);
sandbox.CONFIG = sandbox.window.CONFIG;
const kit = episode && new URL(`./episodes/${episode}.config.js`, import.meta.url);
if (kit && fs.existsSync(kit)) vm.runInNewContext(fs.readFileSync(kit, 'utf8'), sandbox);
const CONFIG = sandbox.window.CONFIG;
const song = args.song || CONFIG.song?.title;
const artist = args.artist || CONFIG.song?.artist;
if (!song || !artist) {
  console.error('No song: set CONFIG.song = { title, artist } in video.config.js or pass --song= --artist=');
  process.exit(1);
}

const hook = args.caption || `Saxo dances to ${song} by ${artist} 🐶🕺`;
const extra = typeof args.tags === 'string' ? args.tags.split(',') : [];
const only = typeof args.only === 'string' ? args.only.split(',') : ['tiktok', 'instagram', 'youtube', 'x'];
const route = p => (args.via === 'postiz' || p === 'instagram' || p === 'x' ? 'postiz' : 'zernio');
const type = args.draft ? 'draft' : args.when ? 'schedule' : 'now';
const date = args.when ? new Date(args.when).toISOString() : new Date().toISOString();

const epFile = n => new URL(`./episodes/${episode}${n}`, import.meta.url);
const EP = episode && fs.existsSync(epFile('.json')) ? JSON.parse(fs.readFileSync(epFile('.json'), 'utf8')) : null;

// The YouTube file: the render itself when it is already 59.5 s or less, else its _yt cut (window: --yt, the episode's
// `yt`, else the ending for an episode and the start otherwise).
const yt = typeof args.yt === 'string' ? (/^[\d.]+-[\d.]+$/.test(args.yt) ? args.yt.split('-').map(Number) : args.yt) : EP?.yt ?? (EP ? 'end' : 'start');
const ytArgs = [...(Array.isArray(yt) ? [`--from=${yt[0]}`, `--to=${yt[1]}`] : [`--keep=${yt}`]),
  ...(episode && fs.existsSync(epFile('.lyrics.js')) ? [`--lyrics=${epFile('.lyrics.js').pathname}`] : args.rev ? [`--rev=${args.rev}`] : [])];
const ytOut = only.includes('youtube')
  ? execFileSync('node', [new URL('./tools/yt_cut.mjs', import.meta.url).pathname, file, ...ytArgs], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'inherit'] }).trim().split('\n')
  : null;
if (ytOut?.length > 1) console.log(`YouTube cut (${Array.isArray(yt) ? yt.join('–') + ' s' : yt}): ${ytOut.slice(0, -1).join(' ')}`);   // check it in the dry run
const ytFile = ytOut?.at(-1) ?? null;
const fileFor = p => (p === 'youtube' ? ytFile : file);

const tags = p => buildHashtags({ song, artist, extra, platform: p });
const clip = (s, n) => (s.length <= n ? s : s.slice(0, n - 1).trimEnd() + '…');
const caption = {
  tiktok: `${hook}\n\n${tags('tiktok').join(' ')}`,
  instagram: `${hook}\n\n${tags('instagram').join(' ')}`,
  youtube: `${hook}\n\n${tags('youtube').join(' ')}`,
  x: '',   // the video alone (Postiz takes empty text when there's media)
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

// ---- Postiz (Instagram and X, or everything with --via=postiz) ----
const PROVIDER = { tiktok: 'tiktok', instagram: 'instagram-standalone', youtube: 'youtube', x: 'x' };
function postizSettings(p) {
  if (p === 'tiktok') return {
    __type: 'tiktok', title: clip(hook, 90), content_posting_method: 'UPLOAD', // unaudited app: inbox only
    privacy_level: 'PUBLIC_TO_EVERYONE', duet: true, stitch: true, comment: true, autoAddMusic: 'no',
    brand_content_toggle: false, brand_organic_toggle: false, video_made_with_ai: false,
  };
  if (p === 'instagram') return { __type: 'instagram-standalone', post_type: 'post', is_trial_reel: false, collaborators: [] };
  if (p === 'x') return { __type: 'x', who_can_reply_post: 'everyone', made_with_ai: false, paid_partnership: false };
  return {
    __type: 'youtube', title: youtubeTitle, type: 'public', selfDeclaredMadeForKids: 'no',
    tags: tags('youtube').map(t => t.slice(1)).map(t => ({ value: t, label: t })),
  };
}
async function viaPostiz(platforms) {
  const channels = await postiz('GET', '/integrations');
  const channel = p => channels.find(c => c.identifier === PROVIDER[p] && !c.disabled);
  const failed = platforms.filter(p => !channel(p));
  if (failed.length) console.error(`postiz: not connected: ${failed.join(', ')}`);
  const ready = platforms.filter(p => channel(p));
  if (!ready.length) throw new Error(`Not connected in Postiz: ${platforms.join(', ')}`);
  const uploads = {};
  for (const f of new Set(ready.map(fileFor))) {
    const form = new FormData();
    form.append('file', await fs.openAsBlob(f, { type: 'video/mp4' }), path.basename(f));
    uploads[f] = await postiz('POST', '/upload', form);
    console.log(`postiz: uploaded ${uploads[f].path}`);
  }
  const result = [];
  for (const p of ready) {
    const post = {
      integration: { id: channel(p).id },
      value: [{ content: caption[p], image: [{ id: uploads[fileFor(p)].id, path: uploads[fileFor(p)].path }] }],
      settings: postizSettings(p),
    };
    try {
      const r = await postiz('POST', '/posts', { type, date, shortLink: false, tags: [], posts: [post] });
      console.log(`postiz: ${p} created (${type})`, JSON.stringify(r));
      result.push(...r);
    } catch (e) { failed.push(p); console.error(`postiz: ${p}: ${e.message}`); }
  }
  if (!result.length) throw new Error(`nothing created (${failed.join(', ')})`);
  return { media: Object.values(uploads).map(u => u.path).join(' '), result, ...(failed.length ? { failed } : {}) };
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

// ---- the TikTok inbox: a Discord message to the user once the video is there ----
const inbox = only.includes('tiktok') && route('tiktok') === 'postiz' && type !== 'draft';
function mutedPostUrl(ep) {   // the muted TikTok an official-sound cut replaces, from the post check's state
  try {
    const state = JSON.parse(fs.readFileSync(new URL('./out/post_check/state.json', import.meta.url), 'utf8'));
    return Object.values(state).filter(x => x.episode === ep && x.platform === 'tiktok' && x.status === 'muted' && x.url)
      .sort((a, b) => Date.parse(b.live) - Date.parse(a.live))[0]?.url ?? null;
  } catch { return null; }
}
const compact = n => new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 }).format(n);
function inboxMessages() {   // [the short message, the description to copy]
  const head = `TikTok ready in your inbox: ${song}`;
  if (!episode?.endsWith('-tt')) return [head, caption.tiktok];
  const sound = typeof args.sound === 'string' ? args.sound : song;
  const uses = [args.uses, EP?.tiktok_sound?.videos, EP?.song?.tiktok_sound?.videos].find(u => u !== undefined && u !== true);
  const muted = mutedPostUrl(episode.replace(/-tt$/, ''));
  return [[head, `Sound: ${sound}${uses ? ` · ${/^\d+$/.test(uses) ? compact(+uses) : uses} uses` : ''}`,
    ...(muted ? [`Then delete the muted post: ${muted}`] : [])].join('\n'), caption.tiktok];
}

console.log(`${path.basename(file)}: ${song} by ${artist}, ${type}${args.when ? ' at ' + date : ''}`);
for (const p of only) console.log(`\n[${p} via ${route(p)}, ${path.basename(fileFor(p))}]${p === 'youtube' ? ' ' + youtubeTitle : ''}${caption[p] ? '' : ' (no text)'}\n${caption[p]}`);
if (args['dry-run']) {
  if (inbox) console.log(`\n[discord, once it's in the inbox: 2 messages]\n${inboxMessages().join('\n---\n')}`);
  console.log('\n--dry-run: nothing sent.');
  process.exit(0);
}
console.log('');

const runs = {};
const failed = [];
for (const [name, fn] of [['postiz', viaPostiz], ['zernio', viaZernio]]) {
  const platforms = only.filter(p => route(p) === name);
  if (!platforms.length) continue;
  try { runs[name] = await fn(platforms); failed.push(...(runs[name]?.failed || [])); }
  catch (e) { failed.push(name); console.error(`${name}: ${e.message}`); }
}

if (type !== 'draft' && Object.values(runs).some(Boolean)) {
  let commit = null;
  try { commit = execSync('git rev-parse --short HEAD', { cwd: path.dirname(new URL(import.meta.url).pathname) }).toString().trim(); } catch {}
  fs.appendFileSync(LOG, JSON.stringify({ at: new Date().toISOString(), file: path.basename(file), ...(ytFile && ytFile !== file ? { ytFile: path.basename(ytFile) } : {}), episode, song, artist, type, date, only, commit, runs }) + '\n');
}
if (inbox && runs.postiz && !failed.includes('tiktok') && !failed.includes('postiz')) {
  console.log('\nTikTok via Postiz: the video is in the TikTok app inbox. Open it within 24 h and post it public.');
  console.log((await notify(...inboxMessages())) ? 'discord: the user was messaged' : 'discord: not sent (see above): tell the user another way');
}
if (failed.length) process.exit(1);
