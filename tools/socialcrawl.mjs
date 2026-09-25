// Shared SocialCrawl client for tools/metrics.mjs and tools/trends.mjs (tools/feedback.mjs keeps its own copy).
// Key: SOCIALCRAWL_API_KEY in the environment, else ~/.socialcrawl-saxo.env. 1 credit ≈ $0.008.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const API = 'https://www.socialcrawl.dev/v1';
export const USD_PER_CREDIT = 0.008;

function key() {
  if (process.env.SOCIALCRAWL_API_KEY) return process.env.SOCIALCRAWL_API_KEY.trim();
  const f = path.join(os.homedir(), '.socialcrawl-saxo.env');
  const line = fs.existsSync(f) && fs.readFileSync(f, 'utf8').split('\n').find(l => l.startsWith('SOCIALCRAWL_API_KEY='));
  if (!line) throw new Error(`SOCIALCRAWL_API_KEY missing: set it in the environment or in ${f}`);
  return line.slice('SOCIALCRAWL_API_KEY='.length).trim();
}

export const spent = { credits: 0 };

export async function sc(route, params = {}) {
  const res = await fetch(`${API}/${route}?${new URLSearchParams(params)}`, { headers: { 'x-api-key': key() } });
  const body = await res.json().catch(() => ({}));
  // A new account with no posts yet can't be resolved by the listing endpoints: that's an empty list, not an error.
  if (res.status === 404 && /profile|channel/.test(route)) return { items: [] };
  if (!res.ok || !body.success) throw new Error(`${route} → ${res.status}: ${JSON.stringify(body.error || body).slice(0, 300)}`);
  spent.credits += body.credits_used || 0;
  return body.data;
}

// Appends one line to research/spend.jsonl (the per-video $1 cap counts it).
export function logSpend(item, why) {
  if (!spent.credits) return;
  const line = { date: new Date().toISOString().slice(0, 10), item, socialcrawl_credits: spent.credits,
    usd: +(spent.credits * USD_PER_CREDIT).toFixed(3), why };
  // The night's caps are per video: SAXO_EPISODE=<id> ties the spend to its episode.
  if (process.env.SAXO_EPISODE) line.episode = process.env.SAXO_EPISODE;
  fs.appendFileSync(new URL('../research/spend.jsonl', import.meta.url), JSON.stringify(line) + '\n');
}

export const args = Object.fromEntries(process.argv.slice(2).filter(a => a.startsWith('--')).map(a => {
  const [k, ...v] = a.slice(2).split('=');
  return [k, v.length ? v.join('=') : true];
}));
