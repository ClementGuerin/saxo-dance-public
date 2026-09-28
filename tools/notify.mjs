// tools/notify.mjs: a Discord direct message to the user from the channel's Discord bot (the user, 2026-09-26: tell me
// on Discord when a published video has a problem, muted or blocked, and when its new version is in the TikTok inbox).
//
//   node tools/notify.mjs --status='{"title":"…","todo":[{"level":"now","text":"…"}]}' ["<text to paste>"…]
//   node tools/notify.mjs "<text>"                       # a plain message, as it is
//   import { notify } from './notify.mjs'; await notify(status[, textToPaste…])   // true once all sent, false otherwise (never throws)
//
// The CLI exits 1 when it couldn't send; SAXO_NOTIFY=0 prints the messages instead (tests: never a real send).
// Callers: tools/post_check.mjs (a post found muted or blocked), publish.mjs (a TikTok inbox upload: the status, then
// the TikTok description on its own, to copy) and tools/bug_desk.mjs (what it shipped, what waits for the user). Only
// what matters goes here (the user, 2026-09-26: "do not spam me with Discord, it's only for important messages").
//
// A status object goes out as a status message, in the style the SportFi agents use on the same bot (the user,
// 2026-09-28: "format your discord message better, like sportfitracker.com do"):
//
//   🐶 **Saxo · TikTok muted Hootie Frutti**
//
//   **What you need to do** (most urgent first)
//   1. 🔴 **Now**: Set the TikTok of Hootie Frutti to Only me in the app: I couldn't (…). <https://www.tiktok.com/…>
//
//   In progress: Hootie Frutti with TikTok's official sound (if the song has one).
//
// { title, todo: [{ level: 'now' | 'soon' | 'later', when?, text }], shipped: [], done: [], progress: [], notes: [] }:
// the to-dos most urgent first, each with its dot and its deadline in bold (`when`, else Now, Soon or When you can); a
// line per thing shipped or done; one "In progress:" line; the notes (a link, a session) last. Empty parts are left
// out. Links go in <…>, so Discord shows no preview card. A string goes out as it is: text to paste gets a message of
// its own, so one long press copies it.
//
// The bot is the Discord channel plugin's: its token is DISCORD_BOT_TOKEN in the environment, else in
// ~/.claude/channels/discord/.env; the user is DISCORD_USER_ID, else the first paired account in that folder's
// access.json. It goes through Discord's REST API (open the DM channel, post), not the gateway, so it works whether or
// not anything is running the bot.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const API = 'https://discord.com/api/v10';
const DIR = path.join(os.homedir(), '.claude/channels/discord');
const MAX_LENGTH = 2000;   // Discord's cap on a message
const LEVELS = { now: ['🔴', 'Now'], soon: ['🟠', 'Soon'], later: ['⚪', 'When you can'] };   // most urgent first
const RANK = Object.keys(LEVELS);

export function status({ title = 'Status', todo = [], shipped = [], done = [], progress = [], notes = [] } = {}) {
  const level = t => (LEVELS[t.level] ? t.level : 'soon');   // an unknown level still goes out, as Soon
  const todos = [...todo].sort((a, b) => RANK.indexOf(level(a)) - RANK.indexOf(level(b)))
    .map((t, i) => `${i + 1}. ${LEVELS[level(t)][0]} **${t.when || LEVELS[level(t)][1]}**: ${t.text}`);
  return [
    `🐶 **Saxo · ${title}**`,
    todos.length ? ['**What you need to do** (most urgent first)', ...todos].join('\n') : '',
    [...shipped.map(s => `✅ **Shipped**: ${s}`), ...done.map(s => `✅ **Done**: ${s}`)].join('\n'),
    progress.length ? `In progress: ${progress.join('; ')}.` : '',
    notes.join('\n'),
  ].filter(Boolean).join('\n\n');
}
export const format = message => (typeof message === 'string' ? message : status(message));   // the text notify sends

function invalid(s) {   // the CLI's check of a --status: what's wrong with it, or null
  if (!s || typeof s !== 'object' || Array.isArray(s)) return 'not an object';
  const list = ['todo', 'shipped', 'done', 'progress', 'notes'].find(k => s[k] !== undefined && !Array.isArray(s[k]));
  if (list) return `${list} must be a list`;
  const bad = s.todo?.find(t => !t?.text || !LEVELS[t.level]);
  return bad ? `a to-do needs a text and a level (${RANK.join(', ')}): ${JSON.stringify(bad)}` : null;
}

function setting(name, read) {
  if (process.env[name]) return process.env[name].trim();
  try { return read(); } catch { return null; }
}
const botToken = () => setting('DISCORD_BOT_TOKEN', () => {
  const line = fs.readFileSync(path.join(DIR, '.env'), 'utf8').split('\n').find(l => l.startsWith('DISCORD_BOT_TOKEN='));
  return line ? line.slice('DISCORD_BOT_TOKEN='.length).trim() : null;
});
const userId = () => setting('DISCORD_USER_ID', () => JSON.parse(fs.readFileSync(path.join(DIR, 'access.json'), 'utf8')).allowFrom?.[0] ?? null);

async function post(token, route, body) {
  const r = await fetch(API + route, {
    method: 'POST',
    headers: { Authorization: `Bot ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(15000),
  });
  if (!r.ok) throw new Error(`${route} → ${r.status}: ${(await r.text()).slice(0, 200)}`);
  return r.json();
}

export async function notify(...messages) {
  const texts = messages.map(format);
  if (process.env.SAXO_NOTIFY === '0') { console.warn(`discord: off (SAXO_NOTIFY=0), not sent:\n${texts.join('\n---\n')}`); return false; }
  const token = botToken(), user = userId();
  if (!token || !user) { console.warn(`discord: not sent: ${token ? 'no paired Discord account' : 'no bot token'}`); return false; }
  try {
    const dm = await post(token, '/users/@me/channels', { recipient_id: user });
    for (const text of texts) {   // one message each, in order
      const content = text.length <= MAX_LENGTH ? text : text.slice(0, MAX_LENGTH - 1) + '…';
      await post(token, `/channels/${dm.id}/messages`, { content, allowed_mentions: { parse: [] } });
    }
    return true;
  } catch (e) {
    console.warn(`discord: not sent: ${e.message}`);
    return false;
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const [first = '', ...rest] = process.argv.slice(2);
  let messages = [process.argv.slice(2).join(' ').trim()].filter(Boolean);
  if (first.startsWith('--status=')) {
    let s;
    try { s = JSON.parse(first.slice('--status='.length)); } catch (e) { console.error(`--status: not JSON (${e.message})`); process.exit(1); }
    const why = invalid(s);
    if (why) { console.error(`--status: ${why}`); process.exit(1); }
    messages = [s, ...rest];
  }
  if (!messages.length) { console.error('usage: node tools/notify.mjs --status=\'{"title":…,"todo":[…]}\' ["<text to paste>"…] | "<text>"'); process.exit(1); }
  const sent = await notify(...messages);
  if (sent) console.log('discord: sent');
  process.exit(sent ? 0 : 1);
}
