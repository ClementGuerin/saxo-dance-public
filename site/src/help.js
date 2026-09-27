// help.js: Kob's help desk, the AI side of the chat panel (chat.js draws the scripted chats in the same panel). The
// visitor types; Kob answers from /api/chat (the saxo-api Worker in worker/). When she drafts a bug report, a card shows
// it with a screenshot of the game view (removable) and room for one image of their own; Send files it with the page's
// diagnostics (site version, browser, screen, recent errors). Sent reports are remembered in this browser (id + token),
// so Kob and the panel can say where each one stands.
import { babble, sfx } from './audio.js';
import { track } from './analytics.js';
import { recentErrors } from './errors.js';

// same origin on the site; a local preview may point elsewhere with ?api= (the site's CSP would block it in production)
export const API = (() => {
  const q = new URLSearchParams(location.search).get('api');
  return q && /^(127\.0\.0\.1|localhost)$/.test(location.hostname) ? q.replace(/\/+$/, '') : '/api';
})();
const HOSTS = /^(saxo\.dance|(www\.)?(tiktok|youtube|instagram)\.com|youtu\.be|x\.com|github\.com)$/;
const STATUS = {
  new: 'waiting for the bug desk', checking: 'being checked', confirmed: 'confirmed, a fix is on the way', waiting: 'waiting for the owner\'s OK',
  fixed: 'fixed', not_reproduced: 'couldn\'t make it happen', duplicate: 'already reported', not_a_bug: 'works as intended', declined: 'not planned',
};
const CHIPS = ['I found a bug', 'What\'s the newest video?', 'How is Saxo made?'];
const NOTE = 'Kob is an AI (Claude). Chats are deleted after a day; bug reports and their screenshots after 30 days. Please don\'t share personal info.';
const MAX_OWN = 1600;   // px: the longest side of an image the visitor adds (re-encoded, so no photo metadata leaves the page)
const wait = ms => new Promise(r => setTimeout(r, ms));
const store = {
  get(s, k, d) { try { return JSON.parse(s.getItem(k)) ?? d; } catch { return d; } },
  set(s, k, v) { try { s.setItem(k, JSON.stringify(v)); } catch { /* storage off: the desk still works, it just forgets */ } },
};
const mine = () => store.get(localStorage, 'saxo.reports', []).filter(r => Number.isInteger(r?.id) && /^[0-9a-f]{32}$/.test(r?.token || ''));
const tokens = () => mine().map(({ id, token }) => ({ id, token }));
const node = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; };

async function api(path, body) {
  const res = await fetch(`${API}/${path}`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
  const j = await res.json().catch(() => ({}));
  if (!res.ok && !j.lines) throw new Error(`HTTP ${res.status}`);
  return j;
}

// Kob's text as nodes: links only to the channel's own places become clickable, everything else stays text
function linkify(text) {
  return text.split(/(https:\/\/[^\s<>"]+)/g).flatMap((part, i) => {
    if (i % 2 === 0) return part ? [document.createTextNode(part)] : [];
    const bare = part.replace(/[.,;:!?)\]]+$/, ''), tail = part.slice(bare.length);
    let u;
    try { u = new URL(bare); } catch { return [document.createTextNode(part)]; }
    if (!HOSTS.test(u.hostname)) return [document.createTextNode(part)];
    const a = node('a', null, bare.replace(/^https:\/\/(www\.)?/, ''));
    Object.assign(a, { href: u.href, target: '_blank', rel: 'noopener noreferrer' });
    return tail ? [a, document.createTextNode(tail)] : [a];
  });
}

// the game view as it is now: the canvas renders at the PS1's internal resolution, so a PNG is small and exact
function grab() {
  try {
    const c = document.getElementById('game');
    if (!c?.width) return null;
    const png = c.toDataURL('image/png');
    return png.length < 1.9e6 ? png : c.toDataURL('image/jpeg', 0.85);
  } catch { return null; }
}

// an image the visitor adds, scaled down and re-encoded as JPEG
async function shrink(file) {
  if (!/^image\/(png|jpeg|webp)$/.test(file?.type || '') || file.size > 25e6) return null;
  const bmp = await createImageBitmap(file).catch(() => null);
  if (!bmp) return null;
  const k = Math.min(1, MAX_OWN / Math.max(bmp.width, bmp.height)), c = document.createElement('canvas');
  c.width = Math.round(bmp.width * k); c.height = Math.round(bmp.height * k);
  c.getContext('2d').drawImage(bmp, 0, 0, c.width, c.height);
  return [0.85, 0.7, 0.55].map(q => c.toDataURL('image/jpeg', q)).find(u => u.length < 1.9e6) || null;
}

// frames per second over half a second: slow devices show it in their reports
const sampleFps = () => new Promise(done => {
  let n = 0; const t0 = performance.now();
  const tick = t => { n++; if (t - t0 < 500) requestAnimationFrame(tick); else done(Math.round(n * 1000 / (t - t0))); };
  requestAnimationFrame(tick);
});

export function makeHelp(game, chat) {
  const el = document.getElementById('chat'), log = el.querySelector('.log'), chips = el.querySelector('.choices');
  const form = el.querySelector('.ask'), input = form.querySelector('input'), sendBtn = form.querySelector('.send');
  let run = 0, busy = false, view = null, where = '', fps = null;
  const isOpen = () => !el.hidden && el.classList.contains('help');

  function bubble(kind, text) {
    const m = node('div', `msg ${kind}`), img = node('img'), p = node('p');
    Object.assign(img, { src: `assets/ui/${kind === 'me' ? 'saxo' : 'kob'}.png`, alt: '' });
    if (text == null) p.append(node('i'), node('i'), node('i')); else p.append(...linkify(text));
    m.append(img, p); log.append(m); log.scrollTop = log.scrollHeight;
    return m;
  }
  async function kob(lines, id) {
    for (const l of lines) {
      if (id !== run) return false;
      bubble('them', l); babble('kob', l);
      await wait(320);
    }
    return id === run;
  }
  function showChips() {
    chips.replaceChildren(...CHIPS.map(t => { const b = node('button', 'chip', t); b.type = 'button'; b.onclick = () => send(t); return b; }));
  }
  function lock() {
    input.disabled = true; sendBtn.disabled = true; input.placeholder = 'The help desk is closed for now';
  }

  async function showStatuses(id) {
    if (!mine().length) return;
    const r = await api('status', { reports: tokens() }).catch(() => null);
    if (id !== run || !r?.reports?.length) return;
    const box = node('div', 'mine');
    box.append(node('b', null, 'Your reports'), ...r.reports.map(x => node('span', null, `#${x.id} ${x.title}: ${STATUS[x.status] || x.status}${x.version ? ` (v${x.version})` : ''}`)));
    log.insertBefore(box, log.children[1] || null);
  }

  function open(from = 'hud') {
    where = game.where(); view = grab();   // what was on screen before anything closes
    chat.close(); game.closeOverlays();
    const id = ++run;
    el.querySelector('.av').src = 'assets/ui/kob.png';
    el.querySelector('.nm').textContent = 'Kob';
    el.querySelector('.role').textContent = 'Help desk · AI';
    log.replaceChildren(node('p', 'note', NOTE)); chips.replaceChildren();
    el.classList.add('help'); el.hidden = false; document.body.classList.add('chatting');
    Object.assign(input, { disabled: false, value: '', placeholder: 'Ask Kob, or tell her what broke' }); sendBtn.disabled = false;
    sfx.open();
    const back = store.get(localStorage, 'saxo.help.met', false);
    store.set(localStorage, 'saxo.help.met', true);
    kob(back ? ['You again. What broke this time?'] : ['Help desk. I\'m Kob. Well, an AI doing Kob.', 'Ask me about the videos, the numbers or the gang. Or tell me what broke.'], id)
      .then(ok => ok && showChips());
    showStatuses(id);
    sampleFps().then(f => { fps = f; });
    if (!matchMedia('(pointer: coarse)').matches) input.focus();
    track('help_opened', { from });
  }

  async function send(raw) {
    const text = String(raw).trim().slice(0, 600);
    if (!text || busy || !isOpen()) return;
    const id = run;
    busy = true; chips.replaceChildren(); input.value = '';
    bubble('me', text); sfx.blip(); game.saxoTalk();
    const typing = bubble('them typing', null);
    const r = await api('chat', { message: text, session: store.get(sessionStorage, 'saxo.help', null), reports: tokens() })
      .catch(() => ({ lines: ['The line\'s dead. Try again in a minute.'] }));
    if (r.session) store.set(sessionStorage, 'saxo.help', r.session);   // kept even if the panel closed meanwhile
    if (id !== run) return;
    typing.remove();
    await kob(r.lines?.length ? r.lines : ['…'], id);
    if (id !== run) return;
    if (r.draft) card(r.draft, id);
    if (r.closed) lock();
    busy = false;
    track('help_message', { draft: Boolean(r.draft) });
  }

  function diag() {
    const gl = window.SAXO?.renderer?.getContext?.(), dbg = gl?.getExtension?.('WEBGL_debug_renderer_info');
    return {
      version: document.getElementById('ver')?.textContent.trim() || 'local preview', url: location.pathname + location.search,
      ua: navigator.userAgent, viewport: `${innerWidth}x${innerHeight}`, dpr: devicePixelRatio, touch: matchMedia('(pointer: coarse)').matches,
      lang: navigator.language, gl: dbg ? String(gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL)) : '', fps, where, errors: recentErrors(),
    };
  }

  // the report card: what Kob drafted, the screenshots, Send / Cancel
  function card(d, id) {
    // a newer draft replaces the older one server-side: its card can't be sent any more
    log.querySelectorAll('.rep:not(.done)').forEach(old => { old.classList.add('done'); old.append(node('p', 'fine', 'Replaced by the report below.')); });
    const m = node('div', 'msg card'), rep = node('div', 'rep'), dl = node('dl');
    for (const [k, v] of [['Where', d.place], ['What happened', d.happened], ['Expected', d.expected], ['Steps', d.steps]]) if (v) dl.append(node('dt', null, k), node('dd', null, v));
    let keepView = Boolean(view), own = null;
    const shot = (src, onRemove) => {
      const f = node('figure', 'shot'), img = node('img'), x = node('button', null, 'Remove');
      Object.assign(img, { src, alt: 'Screenshot attached to the report' }); x.type = 'button';
      x.onclick = () => { f.remove(); onRemove(); };
      f.append(img, x); return f;
    };
    const shots = node('div', 'shots');
    if (keepView) shots.append(shot(view, () => { keepView = false; }));
    const add = node('label', 'add', 'Add your own screenshot'), file = node('input');
    Object.assign(file, { type: 'file', accept: 'image/png,image/jpeg,image/webp', hidden: true });
    add.append(file);
    file.onchange = async () => {
      const u = await shrink(file.files[0]); file.value = '';
      if (!u) { bubble('them', 'That image won\'t go. A PNG or JPEG, please.'); return; }
      own = u; shots.querySelector('.own')?.remove();
      const f = shot(u, () => { own = null; }); f.classList.add('own'); shots.append(f);
    };
    const go = node('button', 'chunky yellow', 'Send to the bug desk'), no = node('button', 'chunky', 'Cancel');
    go.type = no.type = 'button';
    const finish = async sending => {
      go.disabled = no.disabled = true;
      const r = await api('report', { session: store.get(sessionStorage, 'saxo.help', null), ref: d.ref, send: sending, ...(sending ? { shots: [keepView && view, own].filter(Boolean), diag: diag() } : {}) })
        .catch(() => ({ lines: ['That didn\'t go through. Try again in a minute.'] }));
      rep.classList.add('done');
      if (r.id) store.set(localStorage, 'saxo.reports', [...mine(), { id: r.id, token: r.token, title: d.title }].slice(-10));
      track('help_report', { action: sending ? 'sent' : 'dropped', filed: Boolean(r.id), shots: sending ? [keepView, own].filter(Boolean).length : 0 });
      await kob(r.lines || [], id);
    };
    go.onclick = () => finish(true); no.onclick = () => finish(false);
    const acts = node('div', 'acts'); acts.append(go, no);
    rep.append(node('span', 'kind', d.kind === 'idea' ? 'Idea' : 'Bug report'), node('h4', null, d.title), dl, shots, add,
      node('p', 'fine', 'Sends this, the screenshots and technical details (site version, browser, screen size, recent errors) to the bug desk. Kept 30 days.'), acts);
    m.append(rep); log.append(m); log.scrollTop = log.scrollHeight;
  }

  form.addEventListener('submit', e => { e.preventDefault(); send(input.value); });
  // typing stays in the box: Escape closes, nothing reaches the game's keys
  input.addEventListener('keydown', e => { e.stopPropagation(); if (e.key === 'Escape') chat.close(); });
  chat.onClose(() => { run++; busy = false; el.classList.remove('help'); });

  return { open, toggle: from => (isOpen() ? chat.close() : open(from)), get isOpen() { return isOpen(); } };
}
