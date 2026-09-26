// stats.js: "Saxo's stats", the stats island's scoreboard up close: the channel's views, likes and followers on each
// platform, every video's views, the total over time, and what visitors did on this site. The numbers come from
// assets/stats.json (tools/site_stats.mjs, refreshed at each deploy); world.js draws the same file on the island.
import { ICON, NET, chartPixels } from './icons.js';
import { sfx } from './audio.js';
import { track } from './analytics.js';

const NETS = ['tiktok', 'youtube', 'instagram'], PLAT = { tiktok: '#5fe0ff', youtube: '#ff5a5a', instagram: '#b18cff' };
const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const num = n => n >= 1e6 ? (n / 1e6).toFixed(1).replace('.0', '') + 'M' : n >= 1e4 ? (n / 1e3).toFixed(n >= 1e5 ? 0 : 1).replace('.0', '') + 'K' : Math.round(n).toLocaleString('en-US');
const full = n => Math.round(+n || 0).toLocaleString('en-US');
const day = d => new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
function ago(d) {
  const s = (new Date(d) - Date.now()) / 1000;
  for (const [u, k] of [['year', 31536e3], ['month', 2592e3], ['week', 604800], ['day', 86400], ['hour', 3600], ['minute', 60]]) if (Math.abs(s) >= k) return rtf.format(Math.round(s / k), u);
  return 'just now';
}
// total views over time: an area under a line, a dot per count
function spark(H) {
  const W = 600, B = 124, t0 = Date.parse(H[0].at), span = Math.max(1, Date.parse(H.at(-1).at) - t0), max = Math.max(1, ...H.map(p => p.views));
  const pts = H.map(p => [10 + (Date.parse(p.at) - t0) / span * (W - 20), B - p.views / max * (B - 18)].map(v => +v.toFixed(1)));
  const line = pts.map(p => p.join(',')).join(' ');
  return `<figure class="spark"><svg viewBox="0 0 ${W} ${B + 8}" role="img" aria-label="Total views over time: ${full(H[0].views)} on ${day(H[0].at)}, ${full(H.at(-1).views)} now">
    <polygon points="${pts[0][0]},${B} ${line} ${pts.at(-1)[0]},${B}"/><polyline points="${line}"/>${pts.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="5"/>`).join('')}</svg>
    <figcaption><span>${day(H[0].at)}: ${full(H[0].views)}</span><span>now: <b>${full(H.at(-1).views)}</b></span></figcaption></figure>`;
}

export function makeStats(game) {
  const el = document.getElementById('stats'), body = el.querySelector('.body');
  el.querySelector('.chart').style.backgroundImage = `url(${chartPixels(32).toDataURL()})`;
  let data = null;
  const load = () => data ??= fetch('assets/stats.json', { cache: 'no-cache' }).then(r => r.ok ? r.json() : null).catch(() => null);

  function render(d) {
    if (!d) { body.innerHTML = '<p class="lead">The numbers are on their way. Saxo is still counting on his paws.</p>'; return; }
    const t = d.totals || {}, P = d.platforms || {}, V = d.videos || [], H = d.history || [], S = d.site;
    const all = NETS.reduce((s, n) => s + (P[n]?.views || 0), 0) || 1, max = Math.max(1, ...V.map(v => v.views || 0));
    const top = [...V].sort((a, b) => (b.views || 0) - (a.views || 0))[0];
    const tiles = list => `<div class="nums">${list.map(([k, v]) => `<span><b data-n="${+v || 0}">0</b>${k}</span>`).join('')}</div>`;
    body.innerHTML = `
      <p class="lead">Every view, like and follower Saxo has earned so far, counted on TikTok, YouTube and Instagram.${top?.views ? ` The most watched: <b>“${esc(top.title)}”</b>.` : ''}</p>
      ${tiles([['views', t.views], ['likes', t.likes], ['followers', t.followers], ['videos', t.videos]])}
      <h3>Where the views come from</h3>
      <div class="split">${NETS.map(n => `<i style="width:${((P[n]?.views || 0) / all * 100).toFixed(1)}%;background:${PLAT[n]}"></i>`).join('')}</div>
      <table class="plats"><thead><tr><th></th><th>views</th><th>likes</th><th>followers</th></tr></thead><tbody>
        ${NETS.map(n => `<tr><th><a href="${NET[n].url}" target="_blank" rel="noopener" data-t="net_${n}"><i style="background:${PLAT[n]}"></i>${ICON[n]}${NET[n].name}</a></th>
          <td>${full(P[n]?.views)} <small>${Math.round((P[n]?.views || 0) / all * 100)}%</small></td><td>${full(P[n]?.likes)}</td><td>${P[n]?.followers == null ? '<small>private</small>' : full(P[n].followers)}</td></tr>`).join('')}
        <tr class="nx"><th><a href="${NET.x.url}" target="_blank" rel="noopener" data-t="net_x"><i></i>${ICON.x}X</a></th><td colspan="3"><small>every video is on X too, but X charges to read its numbers</small></td></tr>
      </tbody></table>
      <h3>Views per video</h3>
      <ol class="vids">${V.slice(0, 40).map(v => `<li><button data-id="${esc(v.id)}" title="Watch “${esc(v.title)}”">
        <img src="${esc(v.thumb)}" alt="" loading="lazy"><span class="t"><b>${esc(v.title)}</b><small>${esc(v.artist)} · ${day(v.date)}</small>
        <span class="bar" style="width:${((v.views || 0) / max * 100).toFixed(1)}%">${NETS.filter(n => v.by?.[n]?.views).map(n => `<i style="flex:${+v.by[n].views || 0};background:${PLAT[n]}"></i>`).join('')}</span></span>
        <em>${num(v.views || 0)}</em></button></li>`).join('')}</ol>
      ${H.length >= 3 ? `<h3>Views over time</h3>${spark(H)}` : ''}
      ${S ? `<h3>Here on saxo.dance <small>since ${day(S.since)}</small></h3>${tiles([['visitors', S.visitors], ['dances', S.dances], ['outfit changes', S.costumes], ['uppercuts from Compote', S.punches]])}` : ''}
      <p class="meta">TikTok and YouTube are counted live, Instagram once a day. Updated ${ago(d.updated)}.</p>
      <div class="go"><button class="chunky" data-t="tv">Watch on Saxo TV</button><button class="chunky yellow" data-t="follow">Follow Saxo</button></div>`;
    countUp();
  }
  // the big numbers roll up from zero, like a scoreboard
  function countUp() {
    const els = [...body.querySelectorAll('.nums b[data-n]')], t0 = performance.now(), still = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const step = now => {
      const k = still ? 1 : Math.min(1, (now - t0) / 900), e = 1 - (1 - k) ** 3;
      for (const b of els) b.textContent = num(+b.dataset.n * e);
      if (k < 1 && !el.hidden) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }
  async function open(from = 'island') {
    if (!el.hidden) return;
    el.hidden = false; sfx.open(); game.overlay(true);
    track('stats_opened', { from });
    body.innerHTML = '<p class="lead">Counting…</p>';
    const d = await load(); if (!el.hidden) render(d);
  }
  function close() { if (el.hidden) return; el.hidden = true; sfx.close(); game.overlay(false); }
  body.addEventListener('click', e => {
    const v = e.target.closest('button[data-id]');
    if (v) { track('stats_link_clicked', { target: 'video', post_id: v.dataset.id }); game.openTV(v.dataset.id); return; }
    const b = e.target.closest('[data-t]'); if (!b) return;
    track('stats_link_clicked', { target: b.dataset.t });
    if (b.dataset.t === 'tv') game.openTV(); else if (b.dataset.t === 'follow') game.follow();
  });
  el.querySelector('.x').onclick = close;
  el.addEventListener('click', e => { if (e.target === el) close(); });
  window.addEventListener('keydown', e => { if (!el.hidden && e.key === 'Escape') { close(); e.preventDefault(); } });
  return { open, close, load, get isOpen() { return !el.hidden; } };
}
