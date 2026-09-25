// Hashtags for one video, per platform. #saxo #dance always lead; then the song and artist, niche-relevant trending
// tags, and the niche pool (research/hashtags.json, biggest first). Platform caps: Instagram allows 5 per post,
// TikTok reads the first few best (8), YouTube ignores every hashtag when a description has more than 15.
import fs from 'node:fs';

const POOL = JSON.parse(fs.readFileSync(new URL('../research/hashtags.json', import.meta.url), 'utf8'));
const CAP = { tiktok: 8, instagram: 5, youtube: 12 };

// "The One That Got Away" -> "theonethatgotaway", "Beyoncé" -> "beyonce"
export const slug = (s = '') => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]/g, '');

export function buildHashtags({ song, artist, extra = [], platform }) {
  const byViews = (a, b) => (b.views || 0) - (a.views || 0);
  const tags = [
    ...POOL.always,
    slug(song),
    slug(artist),
    ...extra.map(slug),
    ...POOL.trending.map(slug),
    ...[...POOL.niche].sort(byViews).map(t => t.tag),
  ].filter(Boolean);
  const unique = [...new Set(tags)];
  // YouTube: #shorts goes in the description too; it counts towards the 15.
  const list = platform === 'youtube' ? ['shorts', ...unique] : unique;
  return list.slice(0, CAP[platform] ?? 8).map(t => '#' + t);
}
