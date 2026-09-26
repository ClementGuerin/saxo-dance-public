// tv.js: Saxo TV, the overlay that lists every post we published (assets/posts.json, built by tools/site_posts.mjs),
// one card per video with its TikTok / Instagram / YouTube / X posts, and plays them through the platforms' embeds.
import { ICON, NET } from './icons.js';
import { sfx, musicOff } from './audio.js';
import { track } from './analytics.js';

const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const ORDER = ['tiktok', 'youtube', 'instagram', 'x'];
// YouTube refuses to embed our Shorts (the songs' Content ID claims) and X's embed needs its widget script, so both are
// links; TikTok and Instagram play inline
const EMBED = ['tiktok', 'instagram'];
const fmtDate = d => new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
const fmtViews = n => n >= 1e6 ? (n / 1e6).toFixed(1).replace('.0', '') + 'M' : n >= 1e3 ? (n / 1e3).toFixed(1).replace('.0', '') + 'K' : String(n);

const safeUrl = u => /^https:\/\//.test(u || '') ? u : '#';
function embed(net, p) {
  const id = String(p.id || '').replace(/[^\w-]/g, '');
  if (net === 'youtube') return `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&playsinline=1&rel=0&loop=1&playlist=${id}`;
  if (net === 'tiktok') return `https://www.tiktok.com/player/v1/${id}?loop=1&music_info=1&description=1&rel=0`;
  if (net === 'instagram') return `https://www.instagram.com/reel/${id}/embed/`;
}

export function makeTV(game) {
  const el = document.getElementById('tv'), grid = el.querySelector('.grid'), player = el.querySelector('.player');
  const frame = player.querySelector('.frame'), meta = player.querySelector('.meta'), tabs = el.querySelectorAll('.tabs [data-f]'), backBtn = el.querySelector('.tabs .back');
  let posts = null, filter = 'all';
  // a video takes the grid's place, and "All videos" the filter tabs' place in the header
  const view = playing => { grid.hidden = playing; player.hidden = !playing; tabs.forEach(t => t.hidden = playing); backBtn.hidden = !playing; };
  const load = () => posts ??= fetch('assets/posts.json', { cache: 'no-cache' }).then(r => r.json()).then(j => j.posts || []).catch(() => []);

  function render(list) {
    const shown = list.filter(p => filter === 'all' || p.links[filter]);
    grid.innerHTML = shown.length ? '' : `<p class="empty">No ${filter === 'all' ? '' : NET[filter].name + ' '}videos yet. Tomorrow, probably. Saxo never stops.</p>`;
    shown.forEach((p, i) => {
      const b = document.createElement('button'); b.className = 'card'; b.style.animationDelay = i * 40 + 'ms';
      const nets = ORDER.filter(n => p.links[n]).map(n => `<span title="${NET[n].name}">${ICON[n]}</span>`).join('');
      b.innerHTML = `<div class="th"><img src="${esc(p.thumb)}" alt="" loading="lazy"><div class="nets">${nets}</div>${i === 0 && filter === 'all' ? '<span class="new">NEW</span>' : ''}<span class="play"></span></div>
        <h3>${esc(p.title)}</h3><p>${esc(p.artist)} · ${fmtDate(p.date)}</p>${p.views ? `<p class="views">${fmtViews(p.views)} views</p>` : ''}`;
      b.onclick = () => play(p);
      grid.appendChild(b);
    });
  }
  function play(p, net = EMBED.find(n => p.links[n] && p.links[n].id)) {
    sfx.blip(); view(true);
    track('video_played', { post_id: p.id, title: p.title, platform: net || 'none' });
    frame.innerHTML = net ? `<iframe src="${embed(net, p.links[net])}" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen referrerpolicy="strict-origin-when-cross-origin" title="${esc(p.title)}"></iframe>`
      : `<img src="${esc(p.thumb)}" alt="">`;
    const go = ORDER.filter(n => p.links[n]).map(n => `<a href="${esc(safeUrl(p.links[n].url))}" target="_blank" rel="noopener" data-net="${n}" class="${n === net ? 'cur' : ''}">${ICON[n]}Watch on ${NET[n].name}</a>`).join('');
    meta.innerHTML = `<h2>${esc(p.title)}</h2><p>${esc(p.artist)} · ${fmtDate(p.date)}${p.views ? ` · ${fmtViews(p.views)} views` : ''}</p>${p.blurb ? `<p>${esc(p.blurb)}</p>` : ''}<div class="go">${go}</div>`;
    meta.querySelectorAll('a').forEach(a => a.addEventListener('click', e => { if (a.classList.contains('cur') || !EMBED.includes(a.dataset.net)) track('video_link_clicked', { post_id: p.id, platform: a.dataset.net }); if (a.classList.contains('cur') || !EMBED.includes(a.dataset.net)) return; e.preventDefault(); play(p, a.dataset.net); }));
  }
  function back() { frame.innerHTML = ''; view(false); }
  async function open(f = 'all', postId = null) {
    filter = f; tabs.forEach(t => t.classList.toggle('on', t.dataset.f === f));
    el.hidden = false; back(); sfx.tvOn(); musicOff(true); game.overlay(true);
    grid.innerHTML = '<p class="empty">Tuning in…</p>';
    const list = await load(); render(list);
    if (postId) { const p = list.find(x => x.id === postId); if (p) play(p); }
  }
  function close() { if (el.hidden) return; back(); el.hidden = true; sfx.close(); musicOff(false); game.overlay(false); }
  tabs.forEach(t => t.onclick = async () => { filter = t.dataset.f; tabs.forEach(x => x.classList.toggle('on', x === t)); sfx.blip(); back(); render(await load()); });
  el.querySelector('.x').onclick = close;
  backBtn.onclick = () => { sfx.blip(); back(); };
  el.addEventListener('click', e => { if (e.target === el) close(); });
  window.addEventListener('keydown', e => { if (!el.hidden && e.key === 'Escape') { player.hidden ? close() : back(); e.preventDefault(); } });
  return { open, close, load, get isOpen() { return !el.hidden; } };
}
