// main.js: saxo.dance, a playable version of Saxo's world. You are Saxo: walk around his floating PS1 house, talk to
// Sadi, Kob and Compote, dance, dress up, and turn on the TV to watch every video we posted.
import * as THREE from 'three';
import { U } from './ps1.js';
import { buildWorld } from './world.js';
import { loadLook, loadClips, Character } from './chars.js';
import { makeNav } from './nav.js';
import { makeChat } from './chat.js';
import { makeTV } from './tv.js';
import * as audio from './audio.js';
import { ICON, NET } from './icons.js';

const $ = s => document.querySelector(s);
const PIX = (name, size = 32) => `<img class="ico" src="assets/ui/icons/${name}@${size > 16 ? 4 : 2}x.png" width="${size}" height="${size}" alt="">`;
const TAU = Math.PI * 2;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const damp = (a, b, k, dt) => a + (b - a) * (1 - Math.exp(-k * dt));
const angDamp = (a, b, k, dt) => { let d = b - a; d = Math.atan2(Math.sin(d), Math.cos(d)); return a + d * (1 - Math.exp(-k * dt)); };
const TOUCH = matchMedia('(pointer: coarse)').matches;
const store = { get(k, d) { try { const v = localStorage.getItem('saxo.' + k); return v ? JSON.parse(v) : d; } catch { return d; } }, set(k, v) { try { localStorage.setItem('saxo.' + k, JSON.stringify(v)); } catch {} } };

// ---------- renderer: the PS1 internal resolution, magnified with nearest filtering ----------
const canvas = $('#game');
let renderer;
try { renderer = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: 'high-performance' }); }
catch (e) { fail("Your browser can't run WebGL, so Saxo can't dance here. Catch him on TikTok instead!"); throw e; }
renderer.setPixelRatio(1); renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(32, 16 / 9, 0.3, 220);
let PXK = 2.5;   // CSS pixels per game pixel
function resize() {
  const w = innerWidth, h = innerHeight;
  PXK = Math.min(w, h) < 560 ? 2 : clamp(h / 360, 2, 4);
  renderer.setSize(Math.round(w / PXK), Math.round(h / PXK), false);
  U.uSnap.value.set(Math.round(w / PXK) / 1.5, Math.round(h / PXK) / 1.5);
  camera.aspect = w / h; camera.updateProjectionMatrix();
}
addEventListener('resize', resize); resize();

function fail(msg) { const e = $('#loader .err'); e.hidden = false; e.innerHTML = `${msg} <a href="${NET.tiktok.url}">@saxo.dance</a>`; $('#loader .bar').hidden = true; }

// ---------- social links everywhere ----------
document.querySelectorAll('.social').forEach(a => { const n = a.dataset.net; a.href = NET[n].url; a.innerHTML = ICON[n]; a.title = NET[n].name; });
$('#socials .links').innerHTML = Object.entries(NET).map(([n, v]) => `<a href="${v.url}" target="_blank" rel="noopener">${ICON[n]}${v.name}<small>${v.handle}</small></a>`).join('');

// ---------- world ----------
const world = { ready: false };
let W = null, nav = null, saxo = null, npc = {}, clips = null, danceClips = [];
const state = store.get('state', {});
const game = {
  state: who => (state[who] ||= { visits: 0 }),
  saveState: () => store.set('state', state),
  npcTalk: (who, anim) => npcTalk(who, anim),
  saxoTalk: () => { if (saxo && P.mode === 'talk') { saxo.play('asking_question', { loop: false, fade: 0.2, then: () => P.mode === 'talk' && saxo.play('happy_idle') }); } },
  chatClosed: who => endTalk(who),
  act: (a, who) => ACTIONS[a] && ACTIONS[a](who),
  overlay: on => { P.overlay = on; },
};

// ---------- loading ----------
const bar = $('#loader .bar i'); const prog = {}; const setProg = (k, v) => { prog[k] = v; const a = Object.values(prog); bar.style.width = (a.reduce((s, x) => s + x, 0) / a.length * 100).toFixed(0) + '%'; };
async function boot() {
  await Promise.race([document.fonts.load('700 20px Fredoka'), new Promise(r => setTimeout(r, 2500))]).catch(() => {});
  W = buildWorld(scene);
  const look = n => loadLook(n, e => e.total && setProg(n, e.loaded / e.total)).then(r => (setProg(n, 1), r));
  ['saxo', 'sadi', 'kob', 'compote', 'clips'].forEach(k => setProg(k, 0));
  const saved = store.get('look', 'saxo');
  const [cl, sx, sd, kb, cp] = await Promise.all([loadClips('core').then(c => (setProg('clips', 1), c)), look(saved).catch(() => look('saxo')), look('sadi'), look('kob'), look('compote')]);
  clips = cl; P.look = saved === 'saxo' ? 'saxo' : saved.replace(/^saxo_/, '');
  saxo = new Character('saxo', clips).addTo(scene); saxo.setLook(sx);
  npc.sadi = new Character('sadi', clips, { scale: 0.92 }).addTo(scene); npc.sadi.setLook(sd);
  npc.kob = new Character('kob', clips, { scale: 0.92 }).addTo(scene); npc.kob.setLook(kb);
  npc.compote = new Character('compote', clips, { scale: 0.92 }).addTo(scene); npc.compote.setLook(cp);
  nav = makeNav(W.colliders, W.places.bounds);
  setupNPCs(); setupPlayer();
  world.ready = true;
  // posters and the TV loop come from the posts list; the dance clips after the first frame
  tv.load().then(posts => {
    const ld = new THREE.TextureLoader();
    Promise.all(posts.slice(0, 3).map(p => ld.loadAsync(p.thumb).catch(() => null))).then(ts => W.setPosters(ts.filter(Boolean)));
    posters = posts.slice(0, 3);
    const addPosters = () => {
      if (!INTER.length) return setTimeout(addPosters, 300);
      posters.forEach((p, i) => {
        const s = W.places.posters[i]; if (!s) return;
        const it = { id: 'poster' + i, label: 'Watch “' + p.title + '”', r: 2.2, noMarker: true, anchor: () => [s.x, s.z + 0.3], head: () => new THREE.Vector3(s.x, s.y + 0.95, s.z + 0.1), stand: () => [s.x, s.z + 1.6], run: () => openTV('all', p.id) };
        const m = document.createElement('div'); m.className = 'marker hide'; m.innerHTML = `<span class="tag"></span><span class="dot">${PIX('play', 16)}</span>`; m.querySelector('.tag').textContent = it.label;
        $('#markers').appendChild(m); it.el = m; INTER.push(it);
      });
    };
    addPosters();
  });
  const v = document.createElement('video'); v.src = 'assets/tv.mp4'; v.muted = true; v.loop = true; v.playsInline = true; v.autoplay = true; v.crossOrigin = 'anonymous';
  v.addEventListener('canplay', () => { W.setTvVideo(v); v.play().catch(() => {}); }, { once: true }); tvVideo = v;
  $('#loader .bar').hidden = true; $('#start').hidden = false;   // loaded: the start button takes the bar's place
  requestAnimationFrame(frame);
  loadClips('dance').then(d => { Object.assign(clips, d); danceClips = Object.keys(d); }).catch(() => {});
}
let posters = [], tvVideo = null;

function startGame() {
  if (P.started) return; P.started = true;
  audio.start(); $('#loader').classList.add('out'); setTimeout(() => $('#loader').hidden = true, 600);
  if (tvVideo) tvVideo.play().catch(() => {});
  cam.dist = 42; cam.el = 1.25; cam.intro = 1;
  saxo.play('waving', { loop: false, then: () => saxo.play('happy_idle') });
  showHint();
  const back = store.get('visited', false); store.set('visited', true);
  setTimeout(() => toast(back ? 'Welcome back! Kob is still hogging the TV.' : "Welcome to Saxo's place! Talk to the gang, hit the dance floor, and check the TV.", 5200), 2600);
}
$('#start').onclick = startGame;
addEventListener('keydown', e => { if (!P.started && world.ready && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); startGame(); } });

// ---------- camera: a doll's-house view that follows Saxo; frames the two of them in a conversation ----------
const cam = { az: 0.72, el: 0.66, dist: 21, zoom: 1, target: new THREE.Vector3(-0.8, 0.7, 1.6), offX: 0, offY: 0, shake: 0, intro: 0 };
const FOLLOW = { az: 0.72, el: 0.66, dist: 21 };
// the camera angle that sees a pair on axis `axis` (from the NPC to Saxo) from the side, a little behind Saxo, picking
// whichever side is nearer the default view (the rooms are open to the south-east)
function sideView(axis, k = 1.0) {
  const w = a => Math.atan2(Math.sin(a), Math.cos(a)), c = [w(axis + k), w(axis - k)];
  const off = a => Math.abs(w(a - FOLLOW.az));
  return off(c[0]) <= off(c[1]) ? c[0] : c[1];
}
function updateCamera(dt) {
  const T = new THREE.Vector3(); let az = FOLLOW.az, el = FOLLOW.el, dist = FOLLOW.dist * cam.zoom;
  if (P.mode === 'talk' && P.talkTo) {
    const n = npcOf(P.talkTo), a = saxo.pos, b = n.pos;
    T.set(a.x * 0.45 + b.x * 0.55, 0.85, a.z * 0.45 + b.z * 0.55);
    // over Saxo's shoulder, kept on the open south-east side of the rooms
    az = sideView(Math.atan2(a.x - b.x, a.z - b.z), 1.0); el = 0.5; dist = 7.6;
  } else if (P.mode === 'show') { T.copy(P.showAt); az = P.showAz ?? FOLLOW.az; el = 0.6; dist = P.showDist || 9; }
  else {
    T.set(clamp(saxo.pos.x, -10, 10), 0.7, clamp(saxo.pos.z + 0.4, -6.8, 7.2));
  }
  const k = cam.intro > 0 ? 1.1 : 3.2;
  if (cam.intro > 0) { cam.intro = Math.max(0, cam.intro - dt / 2.6); }
  cam.target.x = damp(cam.target.x, T.x, 4, dt); cam.target.y = damp(cam.target.y, T.y, 4, dt); cam.target.z = damp(cam.target.z, T.z, 4, dt);
  cam.az = angDamp(cam.az, az, k * 0.8, dt); cam.el = damp(cam.el, el, k, dt); cam.dist = damp(cam.dist, dist, k, dt);
  const ce = Math.cos(cam.el), sh = cam.shake > 0 ? (cam.shake -= dt, cam.shake * 0.35) : 0;
  camera.position.set(cam.target.x + Math.sin(cam.az) * ce * cam.dist + (Math.random() - 0.5) * sh, cam.target.y + Math.sin(cam.el) * cam.dist + (Math.random() - 0.5) * sh, cam.target.z + Math.cos(cam.az) * ce * cam.dist);
  camera.lookAt(cam.target);
  // shift the picture left while the chat panel covers the right (bottom sheet on phones: shift up)
  const chatOpen = !$('#chat').hidden, wide = innerWidth > 720;
  cam.offX = damp(cam.offX, chatOpen && wide ? $('#chat').offsetWidth / 2 + 8 : 0, 6, dt);
  cam.offY = damp(cam.offY, chatOpen && !wide ? innerHeight * 0.27 : 0, 6, dt);
  if (Math.abs(cam.offX) > 0.5 || Math.abs(cam.offY) > 0.5) camera.setViewOffset(innerWidth, innerHeight, cam.offX, cam.offY, innerWidth, innerHeight);
  else if (camera.view && camera.view.enabled) camera.clearViewOffset();
}

// ---------- the player ----------
const P = { mode: 'free', path: null, goal: null, keys: new Set(), speed: 0, still: 0, dance: null, stepPhase: 0, started: false, overlay: false, joy: null, look: 'saxo', danceIdx: 0 };
const WALK = 1.4, RUN = 3.4;   // m/s
// the clips' own ground speed at timeScale 1, measured on the skinned feet (Saxo's legs are short: 0.37 and 1.22 m/s)
const WALK_CLIP = 0.37, RUN_CLIP = 1.22, MAX_WALK_TS = 3.2, MAX_RUN_TS = 2.4;
function setupPlayer() {
  const [x, z] = W.places.spawn; saxo.pos.set(x, 0, z); saxo.yaw = 0.7;
  saxo.play('happy_idle', { fade: 0 });
}

function moveInput() {
  let x = 0, z = 0; const k = P.keys;
  if (k.has('KeyW') || k.has('ArrowUp')) z -= 1;
  if (k.has('KeyS') || k.has('ArrowDown')) z += 1;
  if (k.has('KeyA') || k.has('ArrowLeft')) x -= 1;
  if (k.has('KeyD') || k.has('ArrowRight')) x += 1;
  if (P.joy) { x += P.joy.x; z += P.joy.y; }
  const m = Math.hypot(x, z); if (m < 0.15) return null;
  // camera-relative: "up" walks away from the camera
  const ca = Math.cos(cam.az), sa = Math.sin(cam.az), s = Math.min(1, m) / m;
  return { x: (x * ca + z * sa) * s, z: (-x * sa + z * ca) * s, run: k.has('ShiftLeft') || k.has('ShiftRight') || (P.joy && Math.hypot(P.joy.x, P.joy.y) > 0.85) };
}
function updatePlayer(dt) {
  if (P.mode === 'talk' || P.mode === 'busy' || P.overlay || P.lock) { P.speed = 0; return; }
  const inp = moveInput();
  let dir = null, run = false;
  if (inp) { dir = inp; run = inp.run; P.path = null; P.goal = null; if (P.mode !== 'free') leaveMode(); }
  else if (P.path && P.path.length) {
    const p = P.path[0], dx = p.x - saxo.pos.x, dz = p.z - saxo.pos.z, d = Math.hypot(dx, dz);
    if (d < 0.18) { P.path.shift(); if (!P.path.length) { P.path = null; arrive(); } }
    else { dir = { x: dx / d, z: dz / d }; run = P.runPath || d > 5; }
  }
  const target = dir ? (run ? RUN : WALK) : 0;
  P.speed = damp(P.speed, target, dir ? 10 : 14, dt);
  if (dir && P.speed > 0.05) {
    saxo.pos.x += dir.x * P.speed * dt; saxo.pos.z += dir.z * P.speed * dt; nav.resolve(saxo.pos); P.nextFidget = 0;
    saxo.targetYaw = Math.atan2(dir.x, dir.z); saxo.turnRate = 12;
    P.still = 0; P.dance = null;
    if (P.speed > (WALK + RUN) / 2) saxo.play('happy_run', { fade: 0.2, speed: Math.min(MAX_RUN_TS, P.speed / RUN_CLIP) });
    else saxo.play('happy_walk', { fade: 0.2, speed: Math.min(MAX_WALK_TS, Math.max(0.8, P.speed / WALK_CLIP)) });
    const ph = (saxo.action.time / saxo.action.getClip().duration) * 2 % 1; if (ph < P.stepPhase) audio.sfx.step(run ? 1.2 : 0.8); P.stepPhase = ph;
    hideHintSoon();
  } else if (P.mode === 'free') {
    P.still += dt;
    const onFloor = inRect(saxo.pos, W.places.floor.rect);
    if (P.dance) { if (saxo.current !== P.dance) saxo.play(P.dance, { fade: 0.3 }); }
    else if (onFloor && P.still > 0.5 && danceClips.length) startDance();
    else if (saxo.current === 'happy_walk' || saxo.current === 'happy_run' || !saxo.current) saxo.play('happy_idle', { fade: 0.3 });
    else if (saxo.current === 'happy_idle' && P.still > (P.nextFidget ||= 16)) {
      P.nextFidget = P.still + 14 + Math.random() * 10;
      saxo.play(['big_yawn_while_standing', 'shoulder_shrug', 'waving'][Math.floor(Math.random() * 3)], { loop: false, fade: 0.3, then: () => P.mode === 'free' && !P.dance && saxo.play('happy_idle', { fade: 0.3 }) });
    }
  }
}
const inRect = (p, [x0, z0, x1, z1]) => p.x > x0 && p.x < x1 && p.z > z0 && p.z < z1;
function startDance(name) {
  if (!danceClips.length) { toast("Warming up… (dances still loading)"); return; }
  P.dance = name || danceClips[P.danceIdx++ % danceClips.length];
  saxo.play(P.dance, { fade: 0.3 });
  audio.sfx.sparkle();
}
let gagId = 0;
function endGag() {
  gagId++;
  if (P.duo) { P.duo = false; const s = npc.sadi; s.busy = false; s.nextDance = 0; nav.dyn[0] = [s.pos.x, s.pos.z, 0.35]; }
  const k = npc.kob;
  if (k.standing || k.busy) {
    if (k.standing) poof(k.pos.clone().setY(0.6));
    setTimeout(() => { k.standing = false; k.busy = false; k.play('gaming', { fade: 0 }); }, k.standing ? 250 : 0);
  }
}
function leaveMode() {
  if (P.mode === 'chill') { saxo.extraLift = 0; }
  if (P.mode === 'show' || P.mode === 'busy') endGag();
  P.mode = 'free';
}
function goTo(x, z, goal = null, run = false) {
  if (P.mode === 'talk' || P.mode === 'busy' || P.lock) return;
  if (P.mode === 'chill' || P.mode === 'show') leaveMode();
  const path = nav.path(saxo.pos, { x, z });
  P.dance = null;
  if (!path) { if (goal) arriveAt(goal); return; }
  P.path = path; P.goal = goal; P.runPath = run; hideHintSoon();
  if (!path.length) arrive();
}
function arrive() { const g = P.goal; P.goal = null; if (g) arriveAt(g); }
function arriveAt(g) { const [fx, fz] = g.anchor(); saxo.faceTo(fx, fz); setTimeout(() => g.run(), 180); }

// ---------- NPCs ----------
const npcOf = n => npc[n];
const DANCE_EVERY = 9;
function setupNPCs() {
  const { sadi, kob, compote } = npc, pl = W.places;
  sadi.pos.set(...[pl.sadi[0], 0, pl.sadi[1]]); sadi.yaw = 0.5; sadi.play('happy_idle', { fade: 0 }); sadi.nextDance = 0;
  compote.pos.set(pl.compote[0], 0, pl.compote[1]); compote.yaw = 0.9; compote.play('bored_idle', { fade: 0 }); compote.nextFidget = 6;
  kob.play('gaming', { fade: 0 }); kob.chairYaw = 0; kob.chairTarget = 0;
  for (const n of Object.values(npc)) n.home = n.pos.clone();
  nav.dyn.push([sadi.pos.x, sadi.pos.z, 0.35], [compote.pos.x, compote.pos.z, 0.35]);
}
const KOB_SEAT = 0.27;   // the gaming clips sit low (hips 0.2 m): lift her onto the cushion, feet dangling
function updateNPCs(dt, t) {
  const { sadi, kob, compote } = npc;
  // Kob on her swivel chair: faces the TV (yaw π) unless she's talking to you
  kob.chairYaw = angDamp(kob.chairYaw, kob.chairTarget, 7, dt);
  W.places.chair.pivot.rotation.y = kob.chairYaw;
  if (!kob.standing) { kob.pos.set(W.places.chair.x, KOB_SEAT, W.places.chair.z); kob.yaw = Math.PI + kob.chairYaw; kob.targetYaw = null; }
  // Sadi dances on the floor, a new dance every few bars
  if (P.talkTo !== 'sadi' && !sadi.busy && danceClips.length && t > sadi.nextDance) {
    const d = danceClips[(Math.floor(t / DANCE_EVERY) * 7 + 3) % danceClips.length]; sadi.play(d, { fade: 0.5 }); sadi.nextDance = t + DANCE_EVERY;
    sadi.targetYaw = FOLLOW.az;
  }
  // Compote watches you when you come close, and fidgets angrily now and then
  if (P.talkTo !== 'compote' && !compote.busy) {
    const d = Math.hypot(saxo.pos.x - compote.pos.x, saxo.pos.z - compote.pos.z);
    if (d < 5) compote.faceTo(saxo.pos.x, saxo.pos.z); else compote.targetYaw = 0.9;
    compote.turnRate = 4;
    if (t > compote.nextFidget) {
      compote.nextFidget = t + 7 + Math.random() * 6;
      const a = d < 5 ? 'quickly_pointing_angrily_forward' : ['shaking_head_no_dismissively', 'angry_forward_gesture'][Math.floor(Math.random() * 2)];
      compote.play(a, { loop: false, fade: 0.25, then: () => !compote.busy && P.talkTo !== 'compote' && compote.play('bored_idle', { fade: 0.4 }) });
    }
  }
  for (const n of Object.values(npc)) { n.update(dt); n.shadow.material.uniforms.uShadowCol.value.set(W.shadowCol(n.pos.x, n.pos.z)); }
}
function npcTalk(who, anim) {
  const n = npc[who];
  if (who === 'kob') { n.play(anim && anim.startsWith('sitting') ? anim : 'sitting_talking', { fade: 0.3 }); return; }
  const a = anim || 'talking';
  if (a === 'talking' || a === 'bored_idle') n.play(a, { fade: 0.3 });
  else n.play(a, { loop: false, fade: 0.25, then: () => P.talkTo === who && n.play('talking', { fade: 0.3 }) });
}
function talk(who) {
  if (!world.ready) return;
  const n = npc[who];
  P.mode = 'talk'; P.talkTo = who; P.path = null; P.dance = null;
  saxo.faceTo(n.pos.x, n.pos.z); saxo.play('happy_idle', { fade: 0.3 });
  if (who === 'kob') { const a = Math.atan2(saxo.pos.x - n.pos.x, saxo.pos.z - n.pos.z); n.chairTarget = a - Math.PI; n.chairTarget = Math.atan2(Math.sin(n.chairTarget), Math.cos(n.chairTarget)); }
  else { n.faceTo(saxo.pos.x, saxo.pos.z); n.turnRate = 6; }
  hideMarkers(true); closeSheets();
  chat.open(who);
}
function endTalk(who) {
  const n = npc[who];
  if (P.mode === 'talk') P.mode = 'free';
  P.talkTo = null; hideMarkers(false);
  if (!n) return;
  if (who === 'kob') { n.chairTarget = 0; if (!n.standing) n.play('gaming', { fade: 0.4 }); }
  if (who === 'sadi' && !n.busy) { n.nextDance = 0; }
  if (who === 'compote' && !n.busy) n.play('bored_idle', { fade: 0.4 });
  if (saxo.current === 'asking_question') saxo.play('happy_idle');
}

// ---------- actions from conversations ----------
const ACTIONS = {
  tv: () => setTimeout(() => openTV(), 250),
  socials: () => openSheet('socials'),
  duo() {
    const s = npc.sadi;
    const name = danceClips.length ? danceClips[(P.danceIdx++ * 5) % danceClips.length] : 'happy_idle';
    const fx = W.places.floor.x, fz = W.places.floor.z, face = cam.az;
    const sx = fx + Math.cos(face) * 0.65, sz = fz - Math.sin(face) * 0.65, ax = fx - Math.cos(face) * 0.65, az = fz + Math.sin(face) * 0.65;
    walkThen(sx, sz, () => {
      const my = ++gagId;   // later timers of this gag no-op once the player has moved on (endGag bumps it)
      s.busy = true; s.pos.set(ax, 0, az); saxo.targetYaw = face; s.targetYaw = face;
      saxo.play(name, { fade: 0.3 }); s.play(name, { fade: 0.3 }); saxo.action.time = s.action.time = 0;
      P.mode = 'show'; P.showAt = new THREE.Vector3(fx, 0.9, fz); P.showAz = face; P.showDist = 9.5; P.duo = true;
      audio.sfx.sparkle();
      setTimeout(() => { if (my === gagId) toast('Sadi: "Not bad, Saxo. Not bad at all."'); }, 7000);
      setTimeout(() => { if (my !== gagId) return; endGag(); P.mode = 'free'; saxo.play('happy_idle', { fade: 0.4 }); }, 10500);
    });
  },
  kobdance() {
    const k = npc.kob, my = ++gagId; P.mode = 'busy'; k.busy = true;
    poof(k.pos.clone().setY(0.6));
    setTimeout(() => {
      if (my !== gagId) return;
      k.standing = true; const cx = W.places.chair.x, cz = W.places.chair.z + 1.2;
      k.pos.set(cx - 0.9, 0, cz + 0.2); k.yaw = 0.5; k.targetYaw = null;
      const d = danceClips.includes('robot') ? 'robot' : danceClips[0] || 'happy_idle';
      k.play(d, { fade: 0 });
      P.mode = 'show'; P.showAt = new THREE.Vector3(cx - 0.6, 0.8, cz); P.showAz = 0.45; P.showDist = 8;
      saxo.faceTo(k.pos.x, k.pos.z);
      setTimeout(() => { if (my !== gagId) return; saxo.play('laughing_standing', { loop: false, fade: 0.3, then: () => P.mode !== 'talk' && saxo.play('happy_idle') }); toast('Kob is secretly the best dancer. You saw nothing.'); }, 2600);
      setTimeout(() => { if (my !== gagId) return; endGag(); P.mode = 'free'; }, 8000);
    }, 280);
  },
  punch() {
    const c = npc.compote; c.busy = true; P.mode = 'busy'; P.path = null; P.dance = null; P.lock = true;
    if (!clips.uppercut_atk || !clips.uppercut_vic) { P.mode = 'free'; c.busy = false; return; }
    // the paired clips share an origin (videos' fight scene): both holders at one yaw, the victim a step ahead
    const th = Math.atan2(saxo.pos.x - c.pos.x, saxo.pos.z - c.pos.z), fwd = new THREE.Vector3(Math.sin(th), 0, Math.cos(th));
    c.yaw = th; c.targetYaw = null; saxo.yaw = th; saxo.targetYaw = null;
    saxo.pos.copy(c.pos).addScaledVector(fwd, PUNCH_GAP).setY(0);
    c.play('uppercut_atk', { loop: false, fade: 0.1 });
    saxo.groundEveryFrame = true;
    saxo.play('uppercut_vic', { loop: false, fade: 0.1, then: () => setTimeout(getUp, 700) });
    c.then = () => c.replant('bored_idle');
    P.mode = 'show'; P.showAt = new THREE.Vector3(c.pos.x + fwd.x * 0.5, 0.8, c.pos.z + fwd.z * 0.5); P.showAz = sideView(th, Math.PI / 2); P.showDist = 7;
    setTimeout(() => { audio.sfx.pow(); cam.shake = 0.35; saxo.flash = 1; pow(saxo.headPos(new THREE.Vector3()), 'POW!'); state.compote.punched = true; game.saveState(); }, 1200);
    setTimeout(() => audio.sfx.thud(), 2250);
    function getUp() {
      toast('Compote: "Touch my carrots again. I dare you."');
      c.play('bored_idle', { fade: 0.4 });
      saxo.replant('standing_up_from_a_soccer_fall', { loop: false, then: () => {
        saxo.groundEveryFrame = false; saxo.play('happy_idle', { fade: 0.3 }); P.mode = 'free'; P.lock = false; c.busy = false; c.home.copy(c.pos); nav.dyn[1] = [c.pos.x, c.pos.z, 0.35];
        const away = Math.atan2(saxo.pos.x - c.pos.x, saxo.pos.z - c.pos.z); goTo(c.pos.x + Math.sin(away) * 1.5, c.pos.z + Math.cos(away) * 1.5, { anchor: () => [c.pos.x, c.pos.z], run: () => {} });
      } });
    }
  },
};
const PUNCH_GAP = 0.47;   // the videos use 0.5 m at scale 1; Compote is 0.92
function walkThen(x, z, fn) {
  const path = nav.path(saxo.pos, { x, z });
  if (!path || !path.length) { fn(); return; }
  P.mode = 'free'; P.path = path; P.runPath = false; P.goal = { anchor: () => [x, z - 1], run: fn };
}

// ---------- effects ----------
const fxEl = $('#fx');
function screenOf(v) { const p = v.clone().project(camera); return [(p.x + 1) / 2 * innerWidth, (1 - p.y) / 2 * innerHeight]; }
function pow(worldPos, word) { const [x, y] = screenOf(worldPos); const e = document.createElement('div'); e.className = 'pow'; e.textContent = word; e.style.left = x + 'px'; e.style.top = y + 'px'; fxEl.appendChild(e); setTimeout(() => e.remove(), 1000); }
function poof(worldPos) {
  audio.sfx.poof();
  for (let i = 0; i < 7; i++) { const [x, y] = screenOf(worldPos); const e = document.createElement('div'); e.className = 'float-note'; e.innerHTML = PIX(['sparkle', 'puff', 'star'][i % 3]); e.style.left = x + (Math.random() - 0.5) * 60 + 'px'; e.style.top = y + (Math.random() - 0.5) * 50 + 'px'; e.style.setProperty('--dx', (Math.random() - 0.5) * 80 + 'px'); fxEl.appendChild(e); setTimeout(() => e.remove(), 1400); }
}
let lastNote = 0;
function notes(beat) {
  const dancing = P.dance || P.duo; if (!dancing || Math.floor(beat) === lastNote) return; lastNote = Math.floor(beat);
  if (lastNote % 2) return;
  const [x, y] = screenOf(saxo.headPos(new THREE.Vector3()).add(new THREE.Vector3(0, 0.2, 0)));
  const e = document.createElement('div'); e.className = 'float-note'; e.innerHTML = PIX(['note_pink', 'note_yellow', 'note_blue'][lastNote % 3]);
  e.style.left = x + 'px'; e.style.top = y + 'px'; e.style.setProperty('--dx', (Math.random() - 0.5) * 60 + 'px'); fxEl.appendChild(e); setTimeout(() => e.remove(), 1400);
}
let toastT = 0;
function toast(msg, ms = 3200, icon = null) { const t = $('#toast'); t.textContent = msg; if (icon) t.insertAdjacentHTML('afterbegin', PIX(icon, 24)); t.hidden = false; clearTimeout(toastT); toastT = setTimeout(() => t.hidden = true, ms); }

// ---------- things to do: talk, TV, wardrobe, sign, mail, towel ----------
const MAIL = ['"Dear Saxo, please stop dancing on my car." (the neighbour)', '"Your macarena changed my life." (Grandma, 89)', '"Can Kob be in EVERY video?" (a Kob fan)', '"Compote, give the farmer his carrots back." (the farmer)', '"Your moonwalk is illegal in 3 countries." (Dance Police)', '"Nice suit. Where do I get one?" (a big fan)'];
let mailN = 0;
const INTER = [];
function interactables() {
  const pl = W.places, near = (n, d) => { const v = npc[n].pos, s = saxo.pos, a = Math.atan2(s.x - v.x, s.z - v.z); return [v.x + Math.sin(a) * d, v.z + Math.cos(a) * d]; };
  INTER.push(
    { id: 'kob', label: 'Talk to Kob', r: 2.1, anchor: () => [npc.kob.pos.x, npc.kob.pos.z], head: () => npc.kob.headPos(new THREE.Vector3()).add(new THREE.Vector3(0, 0.3, 0)), stand: () => [pl.chair.x + 0.15, pl.chair.z + 1.25], run: () => talk('kob') },
    { id: 'sadi', label: 'Talk to Sadi', r: 2.0, anchor: () => [npc.sadi.pos.x, npc.sadi.pos.z], head: () => npc.sadi.headPos(new THREE.Vector3()).add(new THREE.Vector3(0, 0.3, 0)), stand: () => near('sadi', 1.25), run: () => talk('sadi') },
    { id: 'compote', label: 'Talk to Compote', r: 2.0, anchor: () => [npc.compote.pos.x, npc.compote.pos.z], head: () => npc.compote.headPos(new THREE.Vector3()).add(new THREE.Vector3(0, 0.3, 0)), stand: () => near('compote', 1.2), run: () => talk('compote') },
    { id: 'tv', label: 'Watch Saxo TV', r: 2.6, anchor: () => [pl.tv.x, pl.tv.z], head: () => new THREE.Vector3(pl.tv.x, 2.75, pl.tv.z - 0.6), stand: () => pl.tv.stand, run: () => { saxo.faceTo(pl.tv.x, pl.tv.z); if (P.mode !== 'free' && P.mode !== 'show') return; openTV(); } },
    { id: 'wardrobe', label: 'Dress up', r: 1.9, anchor: () => [pl.wardrobe.x, pl.wardrobe.z], head: () => new THREE.Vector3(pl.wardrobe.x, 2.9, pl.wardrobe.z - 0.4), stand: () => pl.wardrobe.stand, run: () => openSheet('closet') },
    { id: 'sign', label: 'Follow Saxo', r: 2.0, anchor: () => [pl.sign.x, pl.sign.z], head: () => new THREE.Vector3(pl.sign.x, 2.75, pl.sign.z), stand: () => pl.sign.stand, run: () => openSheet('socials') },
    { id: 'mail', label: 'Check the mail', r: 1.7, anchor: () => [pl.mail.x, pl.mail.z], head: () => new THREE.Vector3(pl.mail.x, 1.55, pl.mail.z), stand: () => pl.mail.stand, run: () => { audio.sfx.blip(0.8); toast(MAIL[mailN++ % MAIL.length], 4200, 'mail'); } },
    { id: 'towel', label: 'Chill in the sun', r: 1.6, anchor: () => [pl.towel.x, pl.towel.z], head: () => new THREE.Vector3(pl.towel.x, 0.9, pl.towel.z), stand: () => pl.towel.stand, run: chill },
  );
  for (const it of INTER) {
    const m = document.createElement('div'); m.className = 'marker'; m.innerHTML = `<span class="say"></span><span class="tag">${it.label}</span><span class="dot">${PIX(it.id === 'tv' ? 'tv' : ['kob', 'sadi', 'compote'].includes(it.id) ? 'talk' : 'alert', 16)}</span>`;
    $('#markers').appendChild(m); it.el = m;
  }
}
function chill() {
  const pl = W.places.towel; P.mode = 'chill';
  saxo.pos.set(pl.x, 0, pl.z + 0.55); saxo.yaw = Math.PI; saxo.targetYaw = null;
  saxo.play('laying_idle', { fade: 0.4 }); saxo.extraLift = -0.02;
  toast('Ahh. Move to get up.', 3200, 'sun');
}
const BARKS = {
  compote: { r: 3.4, lines: ["Don't.", 'Carrots are MINE.', 'I see you.', 'Keep. Walking.', 'Not one step closer.'] },
  kob: { r: 2.8, lines: ['Shh.', "You're in my light.", 'Boss fight. Go away.', 'Mute your tail.'] },
  sadi: { r: 3.2, lines: ['There you are!', 'Dance with me?', 'Hey, partner!', 'The floor is ours.'], dance: ['Yes! Go Saxo!', 'Okay, you can dance.', 'Again! Again!', 'Show-off.'] },
};
const barkAt = {};
function bark(who, line) {
  const it = INTER.find(i => i.id === who); if (!it) return;
  const say = it.el.querySelector('.say'); say.textContent = line; it.el.classList.add('barking');
  audio.babble(who, line);
  clearTimeout(it.barkT); it.barkT = setTimeout(() => it.el.classList.remove('barking'), 2600);
}
function updateBarks(t) {
  if (!P.started || P.mode !== 'free' || P.overlay) return;
  for (const [who, b] of Object.entries(BARKS)) {
    const n = npc[who], d = Math.hypot(saxo.pos.x - n.pos.x, saxo.pos.z - n.pos.z);
    const st = (barkAt[who] ||= { t: -99, out: true, i: Math.floor(Math.random() * 5) });
    if (n.busy || d > b.r) { if (d > b.r + 1.5) st.out = true; continue; }
    const dancing = who === 'sadi' && P.dance && P.still > 3;
    if ((st.out || dancing) && t - st.t > (dancing ? 7 : 12)) { st.t = t; st.out = false; bark(who, (dancing ? b.dance : b.lines)[st.i++ % (dancing ? b.dance : b.lines).length]); }
  }
}
let nearest = null, markersHidden = false;
function hideMarkers(h) { markersHidden = h; }
function updateInteract() {
  nearest = null; let best = Infinity;
  const free = P.mode === 'free' && !P.overlay;
  for (const it of INTER) {
    const [x, z] = it.anchor(), d = Math.hypot(saxo.pos.x - x, saxo.pos.z - z);
    if (free && d < it.r && d < best) { best = d; nearest = it; }
  }
  for (const it of INTER) {
    const [sx, sy] = screenOf(it.head()), on = !markersHidden && P.started && !P.overlay && P.mode !== 'show';
    it.el.style.transform = `translate(${sx.toFixed(1)}px, ${sy.toFixed(1)}px) translate(-50%, -100%)`;
    it.el.classList.toggle('near', it === nearest || it === P.hover); it.el.classList.toggle('hide', !on || !!it.noMarker && it !== P.hover);
  }
  const pr = $('#prompt'), ub = $('#use-btn');
  if (nearest && P.started) { pr.hidden = TOUCH; pr.innerHTML = `<kbd>E</kbd> ${nearest.label}`; ub.hidden = !TOUCH; ub.textContent = nearest.label; }
  else { pr.hidden = true; ub.hidden = true; }
}
function useNearest() { if (nearest) { audio.sfx.blip(); const [x, z] = nearest.anchor(); saxo.faceTo(x, z); nearest.run(); } }

// ---------- sheets: wardrobe and socials ----------
const LOOKS = [['saxo', 'Saxo'], ['cowboy', 'Cowboy'], ['astronaut', 'Astronaut'], ['dj', 'DJ'], ['beach', 'Beach'], ['moto', 'Moto'], ['sponge', 'Sponge'], ['poop', 'Poop']];
function openSheet(id) {
  closeSheets(); chat.close(); const el = $('#' + id); el.hidden = false; audio.sfx.open(); P.overlay = true;
  if (id === 'closet') {
    const box = el.querySelector('.looks'); box.innerHTML = '';
    for (const [k, name] of LOOKS) {
      const b = document.createElement('button'); b.className = 'look' + (P.look === k ? ' on' : ''); b.innerHTML = `<img src="assets/ui/looks/${k}.png" width="64" height="64" alt=""><span>${name}</span>`;
      b.onclick = async () => {
        box.querySelectorAll('button').forEach(x => x.disabled = true);
        const file = k === 'saxo' ? 'saxo' : 'saxo_' + k;
        try { const root = await loadLook(file); closeSheets(); poof(saxo.pos.clone().setY(0.7)); saxo.flash = 0.8; setTimeout(() => { saxo.setLook(root); P.look = k; store.set('look', file); }, 150); toast(k === 'poop' ? 'Why.' : `Looking sharp, ${name === 'Saxo' ? 'Saxo' : name + ' Saxo'}!`); }
        catch { toast("That costume is at the dry cleaner's."); box.querySelectorAll('button').forEach(x => x.disabled = false); }
      };
      box.appendChild(b);
    }
  }
}
function closeSheets() { let was = false; document.querySelectorAll('.sheet').forEach(s => { if (!s.hidden) was = true; s.hidden = true; }); if (was) { audio.sfx.close(); P.overlay = !$('#tv').hidden; } }
document.querySelectorAll('.sheet .x').forEach(x => x.onclick = closeSheets);

// ---------- input ----------
const ray = new THREE.Raycaster(), ndc = new THREE.Vector2(), ground = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
function pick(cx, cy) {
  ndc.set(cx / innerWidth * 2 - 1, -(cy / innerHeight) * 2 + 1); ray.setFromCamera(ndc, camera);
  // interactables first (a screen-space radius around their markers and bodies), then the floor
  let hit = null, hd = Infinity;
  for (const it of INTER) {
    for (const p of [it.head(), new THREE.Vector3(it.anchor()[0], 0.6, it.anchor()[1])]) {
      const [sx, sy] = screenOf(p), d = Math.hypot(sx - cx, sy - cy);
      if (d < 42 && d < hd) { hd = d; hit = it; }
    }
  }
  if (hit) return { it: hit };
  const g = new THREE.Vector3(); if (ray.ray.intersectPlane(ground, g)) return { x: g.x, z: g.z };
  return null;
}
function clickAt(cx, cy) {
  if (!world.ready || !P.started || P.overlay || P.lock || P.mode === 'talk' || P.mode === 'busy') return;
  const p = pick(cx, cy); if (!p) return;
  if (p.it) {
    const [ax, az] = p.it.anchor(), d = Math.hypot(saxo.pos.x - ax, saxo.pos.z - az);
    if (d < p.it.r) { saxo.faceTo(ax, az); P.path = null; audio.sfx.blip(); p.it.run(); }
    else { const [sx, sz] = p.it.stand(); goTo(sx, sz, p.it); }
  } else goTo(p.x, p.z);
}
canvas.addEventListener('pointermove', e => { if (e.pointerType !== 'mouse' || !world.ready) return; const it = pick(e.clientX, e.clientY)?.it || null; P.hover = it; canvas.classList.toggle('pointer', !!it); });
// touch: drag anywhere to walk (a floating joystick), tap to go / talk. Mouse: click.
let touch = null;
canvas.addEventListener('pointerdown', e => {
  if (e.pointerType === 'mouse') { if (e.button === 0) clickAt(e.clientX, e.clientY); return; }
  touch = { id: e.pointerId, x: e.clientX, y: e.clientY, t: performance.now(), moved: false }; canvas.setPointerCapture(e.pointerId);
});
canvas.addEventListener('pointermove', e => {
  if (!touch || e.pointerId !== touch.id) return;
  const dx = e.clientX - touch.x, dy = e.clientY - touch.y, d = Math.hypot(dx, dy);
  if (d > 14) { touch.moved = true; P.joy = { x: dx / Math.max(d, 60), y: dy / Math.max(d, 60) }; }
});
const endTouch = e => {
  if (!touch || e.pointerId !== touch.id) return;
  if (!touch.moved && performance.now() - touch.t < 400) clickAt(touch.x, touch.y);
  touch = null; P.joy = null;
};
canvas.addEventListener('pointerup', endTouch); canvas.addEventListener('pointercancel', endTouch);
canvas.addEventListener('wheel', e => { e.preventDefault(); cam.zoom = clamp(cam.zoom * Math.exp(e.deltaY * 0.0012), 0.55, 1.7); }, { passive: false });
addEventListener('keydown', e => {
  if (e.target.closest && e.target.closest('input, textarea')) return;
  const k = e.key.toLowerCase();
  if (k === 'escape') { closeSheets(); return; }
  if (!P.started || !$('#chat').hidden || !$('#tv').hidden) return;
  if (['KeyW', 'KeyA', 'KeyS', 'KeyD', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ShiftLeft', 'ShiftRight'].includes(e.code)) { P.keys.add(e.code); e.preventDefault(); }
  if ((k === 'e' || k === 'enter') && !e.repeat) { e.preventDefault(); if (document.querySelector('.sheet:not([hidden])')) return; useNearest(); }
  if (e.code === 'Space' && !e.repeat) { e.preventDefault(); if (P.mode === 'free') { P.path = null; startDance(); } }
  if (k === 'm') toggleSound();
  if (k === 't') openTV();
});
addEventListener('keyup', e => P.keys.delete(e.code));
addEventListener('blur', () => P.keys.clear());
$('#dance-btn').onclick = () => { if (P.mode === 'free' && P.started) { P.path = null; startDance(); } };
$('#use-btn').onclick = useNearest;
document.querySelectorAll('.who').forEach(b => b.onclick = () => {
  audio.sfx.blip(); const g = b.dataset.go;
  if (g === 'tv') { openTV(); return; }
  const it = INTER.find(i => i.id === g); if (!it || P.mode === 'talk' || P.mode === 'busy') return;
  closeSheets();
  const [ax, az] = it.anchor();
  if (Math.hypot(saxo.pos.x - ax, saxo.pos.z - az) < it.r) { saxo.faceTo(ax, az); it.run(); }
  else { const [sx, sz] = it.stand(); goTo(sx, sz, it, true); }
});
function toggleSound() { audio.setMuted(!audio.isMuted()); $('#sound').classList.toggle('muted', audio.isMuted()); if (!audio.isMuted()) audio.start(); }
$('#sound').onclick = toggleSound; $('#sound').classList.toggle('muted', audio.isMuted());

// ---------- hint ----------
let hintT = 0;
function showHint() {
  const h = $('#hint'); h.innerHTML = TOUCH ? 'Drag to walk · tap people to talk · Dance button to dance' : '<kbd>WASD</kbd> / arrows walk · <kbd>Shift</kbd> run · click to go · <kbd>E</kbd> talk · <kbd>Space</kbd> dance · <kbd>T</kbd> TV';
  h.classList.remove('gone'); clearTimeout(hintT); hintT = setTimeout(() => h.classList.add('gone'), 14000);
}
let hintMoves = 0;
function hideHintSoon() { if (++hintMoves === 90) $('#hint').classList.add('gone'); }

function openTV(f, id) { chat.close(); closeSheets(); tv.open(f, id); }
// ---------- UI modules ----------
const chat = makeChat(game);
const tv = makeTV(game);

// ---------- the loop ----------
let last = performance.now(), T = 0, frames = 0;
function frame(now) {
  requestAnimationFrame(frame);
  const dt = Math.min(0.05, (now - last) / 1000); last = now;
  if (P.overlay && !$('#tv').hidden && (frames++ % 4)) return;   // the TV covers the screen: render at a quarter rate
  T += dt;
  const beat = audio.beatNow();
  if (!INTER.length && W) interactables();
  updatePlayer(dt); updateNPCs(dt, T); saxo.update(dt); saxo.shadow.material.uniforms.uShadowCol.value.set(W.shadowCol(saxo.pos.x, saxo.pos.z));
  const onFloor = inRect(saxo.pos, W.places.floor.rect), clubD = Math.hypot(saxo.pos.x - W.places.floor.x, saxo.pos.z - W.places.floor.z);
  audio.setClub(clamp(1 - (clubD - 3) / 9, 0, 1));
  W.update(T, beat, onFloor && !!P.dance || P.duo);
  updateCamera(dt); updateInteract(); updateBarks(T); notes(beat);
  renderer.render(scene, camera);
}

boot().catch(e => { console.error(e); fail("Saxo tripped over a cable while loading. Try reloading the page."); });
window.SAXO = { get saxo() { return saxo; }, npc, get W() { return W; }, cam, P, get clips() { return clips; }, camera, renderer, get speeds() { return { WALK_CLIP, RUN_CLIP }; }, state, toast };
