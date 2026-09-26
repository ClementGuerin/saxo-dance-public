// tools/notify.mjs: a Discord direct message to the user from the channel's Discord bot (the user, 2026-09-26: tell me
// on Discord when a published video has a problem, muted or blocked, and when its new version is in the TikTok inbox).
//
//   node tools/notify.mjs "<text>"                       # send it; exit 1 when it couldn't
//   import { notify } from './notify.mjs'; await notify(text[, text2…])   // true once all sent, false otherwise (never throws)
//
// Callers: tools/post_check.mjs (a post found muted or blocked) and publish.mjs (a TikTok inbox upload: a short
// message, then the TikTok description on its own, to copy). Only what matters goes here (the user, 2026-09-26: "do
// not spam me with Discord, it's only for important messages").
// The bot is the Discord channel plugin's: its token is DISCORD_BOT_TOKEN in the environment, else in
// ~/.claude/channels/discord/.env; the user is DISCORD_USER_ID, else the first paired account in that folder's
// access.json. It goes through Discord's REST API (open the DM channel, post), not the gateway, so it works whether or
// not anything is running the bot. SAXO_NOTIFY=0 turns it off (tests).
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const API = 'https://discord.com/api/v10';
const DIR = path.join(os.homedir(), '.claude/channels/discord');
const MAX_LENGTH = 2000;   // Discord's cap on a message

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

export async function notify(...texts) {
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
  const text = process.argv.slice(2).join(' ').trim();
  if (!text) { console.error('usage: node tools/notify.mjs "<text>"'); process.exit(1); }
  const sent = await notify(text);
  if (sent) console.log('discord: sent');
  process.exit(sent ? 0 : 1);
}
