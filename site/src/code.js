// code.js: "Saxo's code", the screen of the giant computer on the GitHub island: the whole project is public on
// GitHub. The numbers, languages and latest changes come from assets/repo.json (tools/site_repo.mjs, refreshed at each
// deploy); without it the panel still links to the repository and its folders.
import { ICON, NET, markPixels } from './icons.js';
import { sfx } from './audio.js';
import { track } from './analytics.js';

const REPO = NET.github.url;
const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const safeUrl = u => /^https:\/\/github\.com\//.test(u || '') ? u : REPO;
const hex = c => /^#[0-9a-f]{6}$/i.test(c || '') ? c : '#b18cff';
const num = n => n >= 1e4 ? (n / 1e3).toFixed(n >= 1e5 ? 0 : 1).replace('.0', '') + 'K' : n.toLocaleString('en-US');
const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
function ago(d) {
  const s = (new Date(d) - Date.now()) / 1000;
  for (const [u, k] of [['year', 31536e3], ['month', 2592e3], ['week', 604800], ['day', 86400], ['hour', 3600], ['minute', 60]]) if (Math.abs(s) >= k) return rtf.format(Math.round(s / k), u);
  return 'just now';
}
const KIND = { feat: 'new', fix: 'fix', perf: 'faster', refactor: 'tidy', docs: 'docs', style: 'look', test: 'test' };
const FOLDERS = [
  ['src', 'The PS1 renderer: the shader, every map, the cameras, the shot planner'],
  ['episodes', 'The shot list of every video, beat by beat'],
  ['site', 'This website: the islands, the chats, Saxo TV'],
  ['tools', 'Song cutting, beat tracking, the character pipeline, publishing'],
];

export function makeCode(game) {
  const el = document.getElementById('code'), body = el.querySelector('.body');
  el.querySelector('.mark').style.backgroundImage = `url(${markPixels(32, '#ffffff', null, 3).toDataURL()})`;
  let data = null;
  const load = () => data ??= fetch('assets/repo.json', { cache: 'no-cache' }).then(r => r.ok ? r.json() : null).catch(() => null);

  function render(d) {
    const c = d?.counts, L = d?.languages || [], log = d?.latest || [];
    body.innerHTML = `
      <p class="lead">Every frame of every Saxo video is drawn by code, and all of that code is public: the PS1 renderer, the maps, the shot lists, even these islands.</p>
      ${c ? `<div class="nums">${[['maps', c.maps], ['looks', c.looks], ['dance clips', c.clips], ['videos', c.videos]].map(([k, v]) => `<span><b>${num(+v || 0)}</b>${k}</span>`).join('')}</div>` : ''}
      ${L.length ? `<div class="langs"><div class="bar">${L.map(l => `<i style="width:${+l.pct}%;background:${hex(l.color)}"></i>`).join('')}</div>
        <ul>${L.map(l => `<li><i style="background:${hex(l.color)}"></i>${esc(l.name)} <small>${+l.pct}%</small></li>`).join('')}</ul></div>` : ''}
      <h3>What's inside</h3>
      <div class="dirs">${FOLDERS.map(([f, t]) => `<a href="${REPO}/tree/main/${f}" target="_blank" rel="noopener" data-t="folder_${f}"><b>${f}/</b><small>${t}</small></a>`).join('')}</div>
      ${log.length ? `<h3>Latest changes</h3><ol class="log">${log.map(x => `<li><a href="${esc(safeUrl(x.url))}" target="_blank" rel="noopener" data-t="commit"><code>${esc(KIND[x.type] || x.type || 'new')}</code><span>${esc(x.text)}</span><time datetime="${esc(x.date)}">${ago(x.date)}</time></a></li>`).join('')}</ol>` : ''}
      ${d?.loc ? `<p class="meta">${num(d.loc)} lines of code in ${num(d.files)} files, updated ${ago(d.pushedAt)}.</p>` : ''}
      <div class="go"><a class="chunky" href="${REPO}" target="_blank" rel="noopener" data-t="repo">${ICON.github}Open on GitHub</a><a class="chunky yellow" href="${REPO}#readme" target="_blank" rel="noopener" data-t="readme">Read the README</a></div>`;
  }
  async function open(from = 'island') {
    if (!el.hidden) return;
    el.hidden = false; sfx.open(); game.overlay(true);
    track('github_opened', { from });
    render(null); render(await load());
  }
  function close() { if (el.hidden) return; el.hidden = true; sfx.close(); game.overlay(false); }
  body.addEventListener('click', e => { const a = e.target.closest('a[data-t]'); if (a) track('github_link_clicked', { target: a.dataset.t }); });
  el.querySelector('.x').onclick = close;
  el.addEventListener('click', e => { if (e.target === el) close(); });
  window.addEventListener('keydown', e => { if (!el.hidden && e.key === 'Escape') { close(); e.preventDefault(); } });
  return { open, close, get isOpen() { return !el.hidden; } };
}
