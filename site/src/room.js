// room.js: the other visitors on the islands. About once a second each visitor posts where their Saxo stands to
// /api/room and gets back the others; each one shows up as another Saxo in their costume, walking between updates.
// No names and no chat: a random id per page load, a position, a costume and a clip. When the room isn't there (the
// endpoint down, a local preview) it backs off quietly and the game stays single player.
import * as THREE from 'three';
import { Character, loadLook, cloneLook } from './chars.js';
import { API } from './help.js';

const EVERY = 1000, MAX = 12, FAR = 6;
const ID = Array.from(crypto.getRandomValues(new Uint8Array(8)), b => b.toString(16).padStart(2, '0')).join('');
const MOVES = ['happy_walk', 'happy_run'];
const num = (v, lim) => Number.isFinite(v) ? Math.max(-lim, Math.min(lim, v)) : null;
const angDamp = (a, b, k, dt) => { let d = b - a; d = Math.atan2(Math.sin(d), Math.cos(d)); return a + d * (1 - Math.exp(-k * dt)); };

// me() → { x, z, yaw, look, anim } or null (not playing yet); hasLook(file) says whether a costume is in the wardrobe
export function makeRoom({ scene, clips, me, hasLook, shadowCol, onCount }) {
  const others = new Map();
  let wait = 0, fails = 0, busy = false, shown = true;

  async function sync() {
    const s = me(); if (!s || document.hidden) return;
    busy = true;
    try {
      const res = await fetch(`${API}/room`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ id: ID, ...s }) });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const j = await res.json();
      fails = 0; apply(Array.isArray(j.players) ? j.players : []);
      onCount(Number.isInteger(j.count) && j.count > 0 ? j.count : others.size + 1);
    } catch { if (++fails === 3) for (const [id, o] of others) remove(id, o); onCount(0); }
    finally { busy = false; wait = fails ? Math.min(60, 2 ** fails) * 1000 : EVERY; }
  }

  function apply(list) {
    const me0 = me(), seen = new Set();
    const valid = list.filter(p => p && typeof p.id === 'string' && /^[0-9a-f]{16}$/.test(p.id) && p.id !== ID && num(p.x, 200) != null && num(p.z, 200) != null)
      .sort((a, b) => Math.hypot(a.x - me0.x, a.z - me0.z) - Math.hypot(b.x - me0.x, b.z - me0.z)).slice(0, MAX);
    for (const p of valid) {
      seen.add(p.id);
      const o = others.get(p.id) || add(p.id);
      o.to.set(num(p.x, 200), 0, num(p.z, 200)); o.yaw = num(p.yaw, 10) ?? o.yaw;
      o.anim = typeof p.anim === 'string' && clips[p.anim] ? p.anim : 'happy_idle';
      const look = typeof p.look === 'string' && hasLook(p.look) ? p.look : 'saxo';
      if (look !== o.look) { o.look = look; dress(o, look); }
    }
    for (const [id, o] of others) if (!seen.has(id)) remove(id, o);
  }

  function add(id) {
    const ch = new Character('visitor', clips, { shadowCol }); ch.holder.visible = ch.shadow.visible = false;
    const o = { id, ch, to: new THREE.Vector3(), yaw: 0, anim: 'happy_idle', look: null, placed: false, dressing: 0 };
    others.set(id, o); return o;
  }
  function dress(o, look) {
    const my = ++o.dressing;
    loadLook(look).catch(() => loadLook('saxo')).then(root => {
      if (my !== o.dressing || others.get(o.id) !== o) return;
      o.ch.setLook(cloneLook(root));
      if (!o.placed) { o.ch.pos.copy(o.to); o.ch.yaw = o.yaw; o.ch.addTo(scene); o.placed = true; }
      o.ch.holder.visible = o.ch.shadow.visible = shown;
    }).catch(() => {});
  }
  function remove(id, o) {
    others.delete(id); o.dressing++;
    if (o.placed) { scene.remove(o.ch.holder); scene.remove(o.ch.shadow); o.ch.mixer.stopAllAction(); }
    o.ch.meshes?.forEach(m => m.material.dispose());
  }

  function update(dt) {
    wait -= dt * 1000;
    if (!busy && wait <= 0) { wait = EVERY; sync(); }
    for (const o of others.values()) {
      if (!o.placed) continue;
      const ch = o.ch, d = Math.hypot(o.to.x - ch.pos.x, o.to.z - ch.pos.z);
      if (d > FAR) ch.pos.copy(o.to);   // too far behind (a lost update, a teleport): no marathon across the island
      else { const k = 1 - Math.exp(-4 * dt); ch.pos.x += (o.to.x - ch.pos.x) * k; ch.pos.z += (o.to.z - ch.pos.z) * k; }
      const moving = d > 0.12 && d <= FAR;
      if (moving) { ch.targetYaw = Math.atan2(o.to.x - ch.pos.x, o.to.z - ch.pos.z); ch.play(d > 1.6 ? 'happy_run' : 'happy_walk', { fade: 0.2 }); }
      else { ch.yaw = angDamp(ch.yaw, o.yaw, 6, dt); ch.targetYaw = null; ch.play(MOVES.includes(o.anim) ? 'happy_idle' : o.anim, { fade: 0.3 }); }
      ch.update(dt);
    }
  }

  function show(on) { shown = on; for (const o of others.values()) if (o.placed) o.ch.holder.visible = o.ch.shadow.visible = on; }
  return { update, show, get size() { return others.size; } };
}
