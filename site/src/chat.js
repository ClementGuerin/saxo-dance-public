// chat.js: the conversation panel (Ueno-style): NPC bubbles on the left with their sticker, Saxo's replies on the
// right, reply choices at the bottom. The game hooks in for animation and actions.
import { PEOPLE, SCRIPTS } from './scripts.js';
import { babble, sfx } from './audio.js';

const wait = ms => new Promise(r => setTimeout(r, ms));
const esc = s => s.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

export function makeChat(game) {
  const el = document.getElementById('chat'), log = el.querySelector('.log'), box = el.querySelector('.choices');
  const av = el.querySelector('.av'), nm = el.querySelector('.nm'), role = el.querySelector('.role');
  let who = null, script = null, state = null, run = 0, current = [];

  function bubble(kind, html, sticker) {
    const m = document.createElement('div'); m.className = 'msg ' + kind;
    m.innerHTML = `<img src="assets/ui/${sticker}.png" alt=""><p>${html}</p>`;
    log.appendChild(m); log.scrollTop = log.scrollHeight; return m;
  }
  async function say(lines, anim, id) {
    for (const line of lines) {
      if (id !== run) return false;
      const typing = bubble('them typing', '<i></i><i></i><i></i>', PEOPLE[who].sticker);
      game.npcTalk(who, anim);
      await wait(Math.min(1100, 380 + line.length * 22));
      if (id !== run) return false;
      typing.classList.remove('typing'); typing.querySelector('p').textContent = line;
      log.scrollTop = log.scrollHeight;
      babble(who, line);
      await wait(Math.min(900, 250 + line.length * 18));
    }
    return id === run;   // closed or reopened during the last line: don't draw this chat's choices into the next one
  }
  async function go(nodeId) {
    const id = run, n = script.nodes[nodeId];
    if (n.flag) { state[n.flag] = true; game.saveState(); }
    box.innerHTML = '';
    if (!(await say(n.say, n.anim, id))) return;
    if (n.end) { await wait(1500); if (id === run) close(); return; }
    choices(n.choices);
  }
  function choices(list) {
    current = list; box.innerHTML = '';
    list.forEach((c, i) => {
      const b = document.createElement('button'); b.className = 'choice'; b.style.animationDelay = i * 50 + 'ms';
      b.innerHTML = `<kbd>${i + 1}</kbd>${esc(c.text)}`; b.onclick = () => choose(c); box.appendChild(b);
    });
  }
  async function choose(c) {
    const id = run; sfx.blip(); box.innerHTML = ''; current = [];
    bubble('me', esc(c.text), 'saxo'); babble('saxo', c.text); game.saxoTalk();
    await wait(450);
    if (id !== run) return;
    if (c.act) { await wait(250); close(); game.act(c.act, who); }
    else if (c.to) go(c.to);
    else close();
  }
  function open(name) {
    run++; who = name; state = game.state(name);
    script = SCRIPTS[name](state);
    av.src = `assets/ui/${PEOPLE[name].sticker}.png`; nm.textContent = PEOPLE[name].name; role.textContent = PEOPLE[name].role;
    log.innerHTML = ''; box.innerHTML = ''; el.hidden = false; document.body.classList.add('chatting'); sfx.open();
    go(script.start);
    state.met = true; state.visits = (state.visits || 0) + 1; game.saveState();
  }
  function close() {
    if (el.hidden) return;
    run++; el.hidden = true; document.body.classList.remove('chatting'); current = []; sfx.close();
    const w = who; who = null; game.chatClosed(w);
  }
  el.querySelector('.x').onclick = close;
  window.addEventListener('keydown', e => {
    if (el.hidden) return;
    if (e.key === 'Escape') { close(); e.preventDefault(); }
    const k = +e.key; if (k >= 1 && k <= current.length) { choose(current[k - 1]); e.preventDefault(); }
  });
  return { open, close, get open_() { return !el.hidden; }, get who() { return who; } };
}
