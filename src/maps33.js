// maps33.js: the "APT." maps (2026-10-07, ROSÉ & Bruno Mars; the clip: an all-pink studio, a punk duo in black leather,
// a drum kit with a lightning bolt on its bass drum, amp stacks, red party cups on the floor, fisheye circles; the title
// is the Korean apartment game, "apateu", apartment). Our world: a pink apartment block whose party lift fills floor by
// floor on every chant. Same contract as the other map files, pure in t:
//   elevator   the party lift (ELEV.CAR: x -1.7..1.7, z -3.0..0, 3.0 m high, hot pink, a chrome handrail, a light panel,
//              a red alarm dome) behind its sliding doors (ELEV.DOOR: a 2.4 m opening in the z = 0 wall), and the
//              landing in front of it (z 0..6.5, x -5.5..5.5): pastel walls whose colour and floor number follow
//              `floor`, the floor display over the doors, the call button, a flat door opposite the lift (Kob's, 701,
//              on floor 7). Party pets (box pets in bright tees with red cups) fill the car: `pax` is how many.
//   stairwell  the block's stairwell (STAIRS): a landing (x -3..3, z -1.8..1.8) with the flight up at its left end, the
//              flight from below at its right, the floor number painted big on the back wall (`floor`).
//   penthouse  the party at the top (PENT): the clip's pink cyclorama set, the drum kit with a lightning bolt (PENT.DRUMS),
//              amp stacks, mic stands, red cups, party pets dancing; the lift's doors in the back wall (PENT.DOOR, the
//              car behind them lit pink) and the stairwell door beside them (PENT.STAIRS).
// Flags (elevator): floor (1..15 or 'PH': the displays and the landing's sign; the landing's colour follows it), doors
// (0-1 or [s0, s1, a, b]: the leaves slide open), full (s: from then the displays flash FULL and the alarm dome and a red
// wash pulse on every beat), pax (how many party pets in the car, filling ELEV.SLOTS in order), paxIn ([k0, s0, s1]:
// pets k0..pax-1 walk in from the landing over [s0, s1]), paxOut ([s0, s1]: every pet walks out onto the landing and off
// to the sides), paxMode ('dance' | 'stare' | 'point' | 'cheer' | 'squash'), stare ([x, z]: every pet turns there),
// waiting ([[x, z, yaw, mode]]: neighbours waiting on the landing), thump (true or 0-1: the closed doors rattle on every beat), noCeil (the car's and the landing's ceilings off: a
// lens above), noPax, clear ([[x, z, r]]: no pet there), kobDoor (her door's 701 plate on the back wall), key.
// Flags (stairwell): floor, key. Flags (penthouse): doors (the lift's, as above), stairsDoor (0-1 or ramp), party
// ('dance' | 'stare' | 'cheer'), stare, ring ([cx, cz, r, a0, a1, mirror]: 14 pets on an arc round a point; mirror: 7 a side, a corridor), audience ([x0, z0, cols, rows, dx, dz]: the crowd in rows facing the doors), confetti (s), noguests, clear, key.
// Never name a flag like a shot field: `crowd`, `cam`, `still`, `focus` are taken.
import { mapKit } from './mapkit.js';

export const ELEV = {
  CAR: { x0: -1.7, x1: 1.7, z0: -3.0, z1: 0, H: 3.0 },
  DOOR: { W: 2.4, H: 2.5 },                              // the opening: x -1.2..1.2, 2.5 m high
  LAND: { x0: -5.5, x1: 5.5, z1: 6.5, H: 3.3 },
  KOBDOOR: [0, 6.5],                                     // the flat door opposite the lift (Kob's on floor 7)
  // the party pets' spots in the car, in the order they fill it: the corners and sides first, the front row last;
  // the cast's marks are kept free: the duo at the back (+-0.55, -2.2), Compote front right (0.95, -0.75), Kob front
  // centre (0, -0.45)
  // (the spots in front of the duo come last: from the landing they hid both faces)
  SLOTS: [[-1.38, -2.7], [1.38, -2.7], [-1.42, -1.95], [1.42, -1.95], [-1.4, -1.3], [1.4, -1.3], [-1.42, -0.7], [1.42, -0.2],
    [-1.0, -2.35], [1.05, -2.3], [-1.25, -0.2], [-0.85, -0.7], [-0.6, -0.22], [0.45, -0.25], [1.45, -0.8], [0, -2.78],
    [0.75, -1.35], [-0.75, -1.35], [0, -1.45], [0.4, -0.9]],
};
export const STAIRS = { W: 6, D: 3.6, UP_X: -1.3, DOWN_X: 1.3 };
export const PENT = { DOOR: [0, -6.0], STAIRS: [3.4, -6.0], DRUMS: [-4.2, -4.4], AMPS: [4.6, -4.6], MIC: [-1.9, -3.2] };

const FLOOR_COLS = ['#f6c6d8', '#bfe8d2', '#d7c8f2', '#ffd8b8', '#c4def6', '#f8eeb0', '#ffc2b8', '#d2ecb4', '#f2c8ea', '#bfe6e6'];

export function buildAptMaps(K) {
  const k = mapKit(K);
  const { THREE, mat, tex, px, noise, box, PI, beat, cyl, cone, ico, at, rot, flat, lights, pt, hash, fr } = k;
  const M = (c, o = {}) => mat({ color: c, ...o }), glow = (c, u = 1) => mat({ color: c, unlit: u });
  const shotT = (t, P) => P.t0 != null ? t - P.t0 : 0;
  const cl = x => Math.max(0, Math.min(1, x)), sm = x => { x = cl(x); return x * x * (3 - 2 * x); };
  const cleared = (P, x, z) => (P.clear || []).some(([cx, cz, r]) => (x - cx) ** 2 + (z - cz) ** 2 < r * r);
  const pmod = (a, n) => ((a % n) + n) % n;
  const ramp = (v, s) => Array.isArray(v) ? v[2] + (v[3] - v[2]) * sm((s - v[0]) / Math.max(0.01, v[1] - v[0])) : (v || 0);
  const hexC = h => new THREE.Color(h);

  // ---------- the LED floor display's faces: one texture per floor, PH, FULL (amber digits on near black) ----------
  const ledT = (label, col = '#ffb43a', arrow = true) => tex(64, 24, x => {
    px(x, '#120a10', 0, 0, 64, 24);
    x.font = 'bold 18px monospace'; x.textAlign = 'center'; x.textBaseline = 'middle';
    x.fillStyle = '#3a1a08'; x.fillText(label, 37, 13); x.fillStyle = col; x.fillText(label, 36, 12);
    if (arrow) { x.fillStyle = col; x.beginPath(); x.moveTo(8, 16); x.lineTo(14, 7); x.lineTo(20, 16); x.closePath(); x.fill(); }
  });
  const LED = {}; for (let n = 1; n <= 15; n++) LED[n] = ledT(String(n)); LED.PH = ledT('PH');
  const fullT = ledT('FULL', '#ff3a3a', false), blankT = ledT('', '#120a10', false);
  const ledFor = (P, s, bb) => (P.full != null && s >= P.full) ? (pmod(Math.floor(bb * 2), 2) ? blankT : fullT) : (LED[P.floor ?? 1] || LED[1]);
  // the painted floor number on a landing's or the stairwell's wall
  const numT = {};
  const numFor = n => numT[n] || (numT[n] = tex(32, 32, x => {
    x.clearRect(0, 0, 32, 32); x.font = 'bold 26px monospace'; x.textAlign = 'center'; x.textBaseline = 'middle';
    x.fillStyle = 'rgba(40,20,40,0.35)'; x.fillText(String(n), 17, 18); x.fillStyle = '#ffffff'; x.fillText(String(n), 16, 17);
  }));

  // ---------- box party pets: light furs, bright tees, a red party cup in the right paw, some in party hats ----------
  const FURS = [0xe8d0b0, 0xf2eee6, 0xd8a868, 0xc8c0d0, 0xe0c8a0, 0xb08a60, 0xf0dcc0, 0xd0b090, 0xe6e0f0];
  const TEES = [0x2ad0c8, 0xffd23a, 0x6a5aff, 0x3ad06a, 0xff8a2a, 0xffffff, 0x2a9aff, 0xc05aff, 0xff5a8a, 0x111118];
  const HATC = [0xffd23a, 0x2ad0c8, 0x6a5aff, 0xff8a2a, 0x3ad06a];
  const cupM = M(0xe02a2a, { unlit: 0.35 }), rimM = M(0xf6f6f6, { unlit: 0.3 });
  function pet(i) {
    const g = new THREE.Group(), F = M(FURS[i % FURS.length]), top = M(TEES[(i * 3) % TEES.length], { unlit: 0.18 }), body = new THREE.Group(); g.add(body);
    body.add(at(box(0.42, 0.44, 0.3, top), 0, 0.33, 0));
    const legs = [-1, 1].map(s => { const l = at(new THREE.Group(), s * 0.1, 0.1, 0.02); l.add(at(box(0.12, 0.2, 0.13, M(0x2a2a3a)), 0, -0.05, 0)); l.add(at(box(0.13, 0.08, 0.18, M(0xf2f2f2)), 0, -0.14, 0.02)); body.add(l); return l; });
    const arms = [-1, 1].map(s => { const a = at(new THREE.Group(), s * 0.24, 0.52, 0); a.add(at(box(0.1, 0.3, 0.1, top), 0, -0.13, 0)); a.add(at(box(0.09, 0.09, 0.09, F), 0, -0.3, 0)); body.add(a); return a; });
    const cup = at(new THREE.Group(), 0, -0.36, 0.05); cup.add(cyl(0.055, 0.04, 0.13, 6, cupM)); cup.add(at(cyl(0.057, 0.057, 0.02, 6, rimM), 0, 0.066, 0)); arms[1].add(cup);   // kept upright in animPet (the arm's swing turned it into a red mitten)
    const head = at(new THREE.Group(), 0, 0.8, 0); body.add(head);
    const skull = ico(0.24, 1, F); skull.scale.set(1, 0.9, 0.92); head.add(skull);
    const snout = at(ico(0.1, 1, M(0xf6ece0)), 0, -0.07, 0.19); snout.scale.set(1.1, 0.8, 0.9); head.add(snout);
    head.add(at(ico(0.035, 0, M(0x151515)), 0, -0.03, 0.28));
    for (const e of [-1, 1]) {
      head.add(at(ico(0.038, 0, M(0x0e0e0e)), e * 0.1, 0.05, 0.19)); head.add(at(ico(0.012, 0, glow(0xffffff)), e * 0.1 + 0.012, 0.065, 0.225));
      head.add(rot(at(box(0.07, 0.24, 0.16, F), e * 0.24, 0.02, 0), 0, 0, e * 0.3));
    }
    if (i % 3 === 0) { const h = at(cone(0.11, 0.26, 6, M(HATC[i % HATC.length], { unlit: 0.3 })), 0.03, 0.31, 0); h.rotation.z = -0.15; head.add(h); }
    return { g, body, head, arms, legs, cup, i };
  }
  // modes: dance (bob, the cup pumped up on the beat), stare (still, the whole pet turned to the stare point), point (the
  // cup paw pointing at it), cheer (paws up in a V), squash (pressed, swaying); walk > 0 swings the legs instead
  function animPet(p, mode, bb, yaw, walk = 0) {
    animPetArms(p, mode, bb, yaw, walk);
    const a = p.arms[1].rotation; p.cup.rotation.set(-a.x - p.body.rotation.x, 0, -a.z - p.body.rotation.z);   // the cup stays upright whatever the arm does
  }
  function animPetArms(p, mode, bb, yaw, walk) {
    const ph = (bb + p.i * 0.17) * PI, b = Math.abs(Math.sin(ph));
    p.g.rotation.y = yaw;
    p.body.position.set(0, 0, 0); p.body.rotation.set(0, 0, 0); p.head.rotation.set(0, 0, 0); p.body.scale.set(1, 1, 1);
    p.legs.forEach(l => l.rotation.set(0, 0, 0));
    if (walk) {
      p.legs.forEach((l, k2) => { l.rotation.x = 0.6 * Math.sin(walk * 9 + k2 * PI); });
      p.body.position.y = 0.025 * Math.abs(Math.sin(walk * 9));
      p.arms.forEach((a, k2) => a.rotation.set(0.4 * Math.sin(walk * 9 + k2 * PI + PI), 0, (k2 ? 1 : -1) * 0.1));
      return;
    }
    if (mode === 'dance') {
      const pump = Math.exp(-fr(bb) * 5);
      p.body.position.y = 0.09 * b; p.body.rotation.z = 0.12 * Math.sin(ph * 0.5); p.body.rotation.y = 0.25 * Math.sin(ph * 0.5);
      p.arms[1].rotation.set(0.2, 0, 2.05 + 0.6 * pump);                   // the cup paw up by the head, punching on the beat
      p.arms[0].rotation.set(0.1, 0, -0.5 - 0.6 * b);
      return;
    }
    if (mode === 'cheer') { p.body.position.y = 0.06 * b; p.arms.forEach((a, k2) => a.rotation.set(0.35, 0, (k2 ? 1 : -1) * (2.45 + 0.25 * b))); return; }
    if (mode === 'point') { p.arms[1].rotation.set(-1.45, 0, 0.12); p.arms[0].rotation.set(0.05, 0, -0.15); p.head.rotation.x = -0.05; return; }
    if (mode === 'squash') { p.body.scale.set(1.08, 0.94, 1.0); p.body.rotation.z = 0.05 * Math.sin(ph); p.arms.forEach((a, k2) => a.rotation.set(0, 0, (k2 ? 1 : -1) * 0.05)); return; }
    p.arms.forEach((a, k2) => a.rotation.set(0.05, 0, (k2 ? 1 : -1) * 0.12));   // stare: still
    p.body.rotation.z = 0.02 * Math.sin(ph * 0.25);
  }
  // the lift's sliding doors: two brushed-pink steel leaves on a pink metal frame (shared by the elevator and the penthouse)
  const steel = tex(16, 32, (x, r) => { px(x, '#e8a8c4', 0, 0, 16, 32); for (let i = 0; i < 16; i++) px(x, i % 3 ? '#efb6cf' : '#d896b4', i, 0, 1, 32); noise(x, r, 16, 32, ['rgba(255,255,255,.08)'], 30); }, 3301);
  function liftDoors(G, cz) {
    const leafM = mat({ map: steel, rep: [1, 1], unlit: 0.12 }), frameM = M(0xd04a8a, { unlit: 0.2 }), H = ELEV.DOOR.H;
    const leaves = [-1, 1].map(s => { const l = at(box(1.22, H, 0.06, leafM), s * 0.61, H / 2, cz + 0.03); G.add(l); return [l, s]; });
    G.add(at(box(0.14, H + 0.12, 0.08, frameM), -1.27, (H + 0.12) / 2, cz + 0.06));
    G.add(at(box(0.14, H + 0.12, 0.08, frameM), 1.27, (H + 0.12) / 2, cz + 0.06));
    G.add(at(box(2.68, 0.14, 0.08, frameM), 0, H + 0.07, cz + 0.06));
    G.add(at(box(2.4, 0.03, 0.12, M(0xc8c8d0)), 0, 0.015, cz + 0.02));     // the sill
    const disp = at(new THREE.Mesh(new THREE.PlaneGeometry(0.9, 0.34), mat({ map: LED[1], unlit: 1 })), 0, H + 0.36, cz + 0.07); G.add(disp);
    G.add(at(box(1.0, 0.44, 0.04, M(0x2a1420)), 0, H + 0.36, cz + 0.045));
    // set(v, thump): v 0-1 open; thump 0-1, the closed leaves rattle out towards the landing (someone dancing inside)
    return { leaves, disp, set(v, thump = 0) { leaves.forEach(([l, s]) => { l.position.x = s * (0.61 + 1.22 * cl(v)) + thump * 0.035 * s; l.position.z = cz + 0.03 + thump * 0.04; l.rotation.y = s * thump * 0.03; }); disp.position.y = H + 0.36 + thump * 0.02; } };
  }
  const setMap = (m, T) => { if (m.material.uniforms.map.value !== T) m.material.uniforms.map.value = T; };

  // =====================================================================================================================
  function elevator() {
    const G = new THREE.Group();
    const { x0, x1, z0, H } = ELEV.CAR, LW = ELEV.LAND;
    // ---- the car: hot-pink panelled walls facing in, a dark rose rubber floor, a light panel, the handrail ----
    const panel = tex(32, 32, (x, r) => { px(x, '#ff5aa8', 0, 0, 32, 32); px(x, '#ff7ab8', 1, 1, 14, 30); px(x, '#ff7ab8', 17, 1, 14, 30); noise(x, r, 32, 32, ['rgba(255,255,255,.06)', 'rgba(120,0,60,.06)'], 60); }, 3302);
    const panelM = mat({ map: panel, rep: [2, 1.4], unlit: 0.42 });
    const wall = (w, h, m) => new THREE.Mesh(new THREE.PlaneGeometry(w, h), m);
    G.add(at(wall(x1 - x0, H, panelM), 0, H / 2, z0));                                  // back wall
    G.add(rot(at(wall(-z0, H, panelM), x0, H / 2, z0 / 2), 0, PI / 2, 0));               // left
    G.add(rot(at(wall(-z0, H, panelM), x1, H / 2, z0 / 2), 0, -PI / 2, 0));              // right
    const rubber = tex(16, 16, x => { px(x, '#5a1838', 0, 0, 16, 16); for (let i = 0; i < 16; i += 4) for (let j = 0; j < 16; j += 4) px(x, '#6a2244', i + 1, j + 1, 2, 2); }, 3303);
    G.add(flat(x1 - x0, -z0, mat({ map: rubber, rep: [3, 3] }), 0, 0, z0 / 2));
    const carCeil = rot(at(wall(x1 - x0, -z0, M(0xffd0e4, { unlit: 0.5 })), 0, H, z0 / 2), PI / 2, 0, 0); G.add(carCeil);
    const lightPanel = rot(at(wall(1.6, 1.2, glow(0xfff4fa)), 0, H - 0.01, z0 / 2), PI / 2, 0, 0); G.add(lightPanel);
    const chrome = M(0xe8e8f0, { unlit: 0.35 });
    G.add(at(box(x1 - x0 - 0.2, 0.05, 0.05, chrome), 0, 0.95, z0 + 0.08));
    for (const s of [-1, 1]) G.add(at(box(0.05, 0.05, -z0 - 0.5, chrome), s * (x1 - 0.08), 0.95, z0 / 2 - 0.1));
    // the button panel inside, by the door; the alarm dome on the ceiling
    G.add(at(box(0.22, 0.7, 0.04, M(0xd8d8e0, { unlit: 0.2 })), 1.48, 1.25, -0.16));
    for (let r = 0; r < 6; r++) for (let c = 0; c < 2; c++) { const b = at(cyl(0.025, 0.025, 0.02, 6, glow(0xfff0c0, 0.6)), 1.43 + c * 0.1, 1.0 + r * 0.1, -0.13); b.rotation.x = PI / 2; G.add(b); }
    const domeM = M(0x7a1010, { unlit: 0.4 }), dome = at(ico(0.12, 1, domeM), 1.1, H - 0.06, -0.5); G.add(dome);
    G.add(at(box(1.0, 0.42, 0.04, M(0x2a1420)), 0, 1.86, z0 + 0.03));
    const backDisp = at(new THREE.Mesh(new THREE.PlaneGeometry(0.9, 0.34), mat({ map: LED[1], unlit: 1 })), 0, 1.86, z0 + 0.06); G.add(backDisp);
    // ---- the wall between the car and the landing: its landing face takes the floor's colour, its car face is pink ----
    const landT = tex(32, 32, (x, r) => { px(x, '#ffffff', 0, 0, 32, 32); px(x, '#e4e4e4', 0, 19, 32, 2); noise(x, r, 32, 32, ['rgba(0,0,0,.05)'], 50); }, 3304);
    const landM = mat({ map: landT, rep: [3, 1], unlit: 0.18 });
    const pinkSide = M(0xff5aa8, { unlit: 0.42 }), edge = M(0xcfcfd8);
    const piece = (w, h, x, y) => at(new THREE.Mesh(new THREE.BoxGeometry(w, h, 0.1), [edge, edge, edge, edge, landM, pinkSide]), x, y, -0.05);
    G.add(piece(LW.x1 - 1.2, LW.H, -(1.2 + (LW.x1 - 1.2) / 2), LW.H / 2));
    G.add(piece(LW.x1 - 1.2, LW.H, 1.2 + (LW.x1 - 1.2) / 2, LW.H / 2));
    G.add(piece(2.4, LW.H - ELEV.DOOR.H, 0, ELEV.DOOR.H + (LW.H - ELEV.DOOR.H) / 2));
    const doors = liftDoors(G, 0);
    const leakM = glow(0xffffff), leak = at(new THREE.Mesh(new THREE.PlaneGeometry(0.14, ELEV.DOOR.H), leakM), 0, ELEV.DOOR.H / 2, -0.02); G.add(leak);
    const sillLeak = at(new THREE.Mesh(new THREE.PlaneGeometry(2.3, 0.05), leakM), 0, 0.025, 0.09); G.add(sillLeak);   // light spilling under the doors onto the landing
    const inDisp = rot(at(new THREE.Mesh(new THREE.PlaneGeometry(0.7, 0.26), mat({ map: LED[1], unlit: 1 })), 0, 2.72, -0.115), 0, PI, 0); G.add(inDisp);
    // the call button and the painted floor number on the landing's wall
    G.add(at(box(0.14, 0.26, 0.03, M(0xd8d8e0, { unlit: 0.2 })), -1.62, 1.12, 0.02));
    const callB = at(cyl(0.03, 0.03, 0.02, 6, glow(0xffc040, 0.9)), -1.62, 1.16, 0.04); callB.rotation.x = PI / 2; G.add(callB);
    const sign = at(new THREE.Mesh(new THREE.PlaneGeometry(0.7, 0.7), mat({ map: numFor(1), unlit: 0.6 })), 2.15, 1.75, 0.02); G.add(sign);
    sign.material.transparent = true;
    // ---- the landing: carpet, pastel walls (the floor's colour), a ceiling with a light panel, flat doors ----
    const carpet = tex(16, 16, (x, r) => { px(x, '#7a3a5a', 0, 0, 16, 16); noise(x, r, 16, 16, ['#6a3050', '#844464'], 60); }, 3305);
    G.add(flat(LW.x1 - LW.x0, LW.z1, mat({ map: carpet, rep: [6, 4] }), 0, 0, LW.z1 / 2));
    const sideL = rot(at(wall(LW.z1, LW.H, landM), LW.x0, LW.H / 2, LW.z1 / 2), 0, PI / 2, 0);
    const sideR = rot(at(wall(LW.z1, LW.H, landM), LW.x1, LW.H / 2, LW.z1 / 2), 0, -PI / 2, 0);
    const backW = rot(at(wall(LW.x1 - LW.x0, LW.H, landM), 0, LW.H / 2, LW.z1), 0, PI, 0);
    G.add(sideL, sideR, backW);
    const landCeil = rot(at(wall(LW.x1 - LW.x0, LW.z1, M(0xf4ecf0, { unlit: 0.3 })), 0, LW.H, LW.z1 / 2), PI / 2, 0, 0); G.add(landCeil);
    const landLight = rot(at(wall(1.4, 0.5, glow(0xfff8e8)), 0, LW.H - 0.01, 3.2), PI / 2, 0, 0); G.add(landLight);
    const doorM = M(0x8a5a3a, { unlit: 0.1 }), knobM = M(0xe0c060, { unlit: 0.4 });
    const flatDoor = (x, z, ry) => { const d = new THREE.Group(); d.add(at(box(1.0, 2.15, 0.06, doorM), 0, 1.075, 0)); d.add(at(ico(0.04, 0, knobM), 0.38, 1.0, 0.05)); d.position.set(x, 0, z); d.rotation.y = ry; G.add(d); return d; };
    flatDoor(LW.x0 + 0.04, 3.4, PI / 2); flatDoor(LW.x1 - 0.04, 3.4, -PI / 2);
    const kobDoor = flatDoor(ELEV.KOBDOOR[0], ELEV.KOBDOOR[1] - 0.04, PI);
    const plate = at(new THREE.Mesh(new THREE.PlaneGeometry(0.34, 0.14), mat({ map: k.sign('701', '#e8d090', '#3a2410', 48, 16), unlit: 0.5 })), 0, 1.7, 0.035); kobDoor.add(plate);
    const mat701 = flat(1.0, 0.6, M(0xb07848), 0, 0.004, LW.z1 - 0.45); G.add(mat701);
    const plant = new THREE.Group(); plant.add(at(cyl(0.16, 0.12, 0.34, 8, M(0xe8e0d8)), 0, 0.17, 0));
    for (let i = 0; i < 6; i++) plant.add(rot(at(box(0.08, 0.5, 0.02, M(0x3aa05a)), 0, 0.55, 0), 0.4 * Math.sin(i), i, 0.4 * Math.cos(i)));
    plant.position.set(-4.6, 0, 0.6); G.add(plant);
    // ---- the party pets in the car, and neighbours waiting on the landing ----
    const pets = []; for (let i = 0; i < ELEV.SLOTS.length; i++) { const p = pet(i); G.add(p.g); pets.push(p); }
    const waiters = []; for (let i = 0; i < 3; i++) { const p = pet(40 + i); G.add(p.g); waiters.push(p); }
    const LANDED = [[-3.4, 2.0], [3.4, 2.2], [-2.6, 4.2], [2.8, 4.6], [-4.4, 3.4], [4.3, 1.4], [-1.9, 5.4], [1.9, 5.6], [-3.6, 5.6], [3.8, 5.8]];
    return {
      group: G, sky: k.grad([[0, '#2a0a1a'], [1, '#3a1028']]), shadowCol: 0x3a0a22, shadowY: 0.02, indoor: true,
      light() {
        lights(0x9a6a80, 0xfff0f6, [0.15, -1, -0.25], 0x2a0a1a, [14, 40], 6);
        pt(0, 0, 2.6, -1.5, 1.25, 0.95, 1.1);                    // the car's light panel
        pt(1, 0, 2.9, 3.2, 0.9, 0.82, 0.7);                      // the landing's
      },
      anim(t, P = {}) {
        const s = shotT(t, P), bb = beat(t), hb = bb >= 0 ? Math.exp(-fr(bb) * 4) : 0;
        if (P.key) pt(3, P.key[0], P.key[1], P.key[2], P.key[3], P.key[4], P.key[5]);
        const fl = P.floor ?? 1, col = hexC(FLOOR_COLS[(typeof fl === 'number' ? fl : 11) % FLOOR_COLS.length]);
        landM.uniforms.uCol.value.copy(col);
        setMap(sign, numFor(fl));
        const T = ledFor(P, s, bb); setMap(doors.disp, T); setMap(inDisp, T); setMap(backDisp, P.full != null && s >= P.full ? fullT : T);
        const th = P.thump ? (P.thump === true ? 1 : P.thump) * (bb >= 0 ? Math.exp(-fr(bb) * 6) : 0) : 0;
        doors.set(ramp(P.doors, s), th);
        leak.visible = sillLeak.visible = !!P.thump; leakM.uniforms.uCol.value.setRGB(1, 0.55 + 0.45 * th, 0.8 + 0.2 * th).multiplyScalar(0.55 + 0.45 * th);
        const alarm = P.full != null && s >= P.full;
        const flash = alarm && pmod(Math.floor(bb * 2), 2) === 0;   // the alarm: the car stays red, the dome and the walls flashing brighter on every half beat
        domeM.uniforms.uCol.value.set(alarm ? (flash ? 0xff2020 : 0xc01818) : 0x7a1010);
        lightPanel.material.uniforms.uCol.value.set(alarm ? 0xff4040 : 0xfff4fa);
        panelM.uniforms.uCol.value.setRGB(1, alarm ? (flash ? 0.32 : 0.5) : 1, alarm ? (flash ? 0.32 : 0.5) : 1);
        if (alarm) pt(2, 0, 2.4, -1.2, 1.6 * (0.4 + 0.6 * hb), 0.06, 0.08);
        const noCeil = !!P.noCeil; carCeil.visible = !noCeil; lightPanel.visible = !noCeil; landCeil.visible = !noCeil; landLight.visible = !noCeil;
        plate.visible = !!P.kobDoor; mat701.visible = !!P.kobDoor;
        // the party pets: the first `pax` slots; walking in, walking out, or dancing / staring in place
        const n = P.noPax ? 0 : Math.min(P.pax || 0, pets.length), mode = P.paxMode || 'dance', ST = P.stare;
        pets.forEach((p, i) => {
          if (i >= n) { p.g.visible = false; return; }
          const [hx, hz] = ELEV.SLOTS[i];
          let x = hx, z = hz, walk = 0, yaw = 0;
          if (P.paxIn && i >= P.paxIn[0]) {                     // walking in from the landing, one after another
            const [k0, s0, s1] = P.paxIn, m = n - k0, j = i - k0, a = s0 + (s1 - s0) * 0.45 * j / Math.max(1, m), b = a + (s1 - s0) * 0.55;
            const u = cl((s - a) / Math.max(0.01, b - a)), fx = hx * 0.4, fz = 1.25 + 0.35 * (j % 3);   // from just outside the doors (from 2.6 m out they filled the landing lens's foreground)
            x = fx + (hx - fx) * sm(u); z = fz + (hz - fz) * sm(u);
            if (u > 0 && u < 1) { walk = s; yaw = Math.atan2(hx - fx, hz - fz); }
          }
          if (P.paxOut) {                                        // walking out onto the landing and off to the sides
            const [s0, s1] = P.paxOut, a = s0 + (s1 - s0) * 0.5 * (1 - (i % 10) / 10), u = cl((s - a) / Math.max(0.01, (s1 - s0) * 0.5));
            const [ex, ez] = LANDED[i % LANDED.length];
            x = hx + (ex - hx) * sm(u); z = hz + (ez - hz) * sm(u);
            if (u > 0 && u < 1) { walk = s; yaw = Math.atan2(ex - hx, ez - hz); } else if (u >= 1) yaw = Math.atan2(-ex, -ez);
          }
          if (!walk && ST) yaw = Math.atan2(ST[0] - x, ST[1] - z);
          p.g.position.set(x, 0, z);
          p.g.visible = !cleared(P, x, z);
          if (p.g.visible) animPet(p, ST && mode === 'dance' ? 'stare' : mode, bb, yaw, walk);
        });
        waiters.forEach((p, i) => {
          const w = (P.waiting || [])[i]; p.g.visible = !!w; if (!w) return;
          p.g.position.set(w[0], 0, w[1]); animPet(p, w[3] || 'stare', bb, (w[2] ?? 180) * PI / 180);
        });
      },
    };
  }

  // =====================================================================================================================
  function stairwell() {
    const G = new THREE.Group(), { W, D, UP_X, DOWN_X } = STAIRS, H = 3.4;
    const tile = tex(16, 16, (x, r) => { px(x, '#f4d4e0', 0, 0, 16, 16); px(x, '#e8c4d2', 0, 0, 16, 1); px(x, '#e8c4d2', 0, 0, 1, 16); noise(x, r, 16, 16, ['rgba(0,0,0,.04)'], 30); }, 3306);
    const wallM = mat({ map: tile, rep: [6, 3.4], unlit: 0.2 }), concrete = M(0xb8a8b0), railM = M(0xff4f9a, { unlit: 0.35 }), stepM = M(0xc8b8c0), noseM = M(0x8a7a84);
    const wall = (w, h, m) => new THREE.Mesh(new THREE.PlaneGeometry(w, h), m);
    G.add(at(wall(W + 4, H + 3, wallM), 0, H / 2 - 0.5, -D / 2));                          // the back wall (tall: the flights reach past the landing)
    G.add(rot(at(wall(D + 2, H + 3, wallM), -W / 2 - 2, H / 2 - 0.5, 0), 0, PI / 2, 0));
    G.add(rot(at(wall(D + 2, H + 3, wallM), W / 2 + 2, H / 2 - 0.5, 0), 0, -PI / 2, 0));
    G.add(flat(DOWN_X - UP_X, D, M(0xd8c4cc), (UP_X + DOWN_X) / 2, 0, 0));               // the landing's floor
    // the flight up from its left end (towards -x, against the back wall), the flight down from its right end (front half)
    for (let i = 0; i < 9; i++) {
      G.add(at(box(0.3, 0.18 * (i + 1), D * 0.5, stepM), UP_X - 0.15 - 0.3 * i, 0.09 * (i + 1), -D / 4));
      G.add(at(box(0.3, 0.03, D * 0.5, noseM), UP_X - 0.15 - 0.3 * i, 0.18 * (i + 1) + 0.015, -D / 4));
      G.add(at(box(0.3, 1.62 - 0.18 * (i + 1), D * 0.5, stepM), DOWN_X + 0.15 + 0.3 * i, -0.18 * (i + 1) - (1.62 - 0.18 * (i + 1)) / 2, D / 4));
    }
    G.add(at(box(DOWN_X - UP_X, 1.62, D, concrete), (UP_X + DOWN_X) / 2, -0.81, 0));       // under the landing
    G.add(at(box(2.8, 1.62, D * 0.5, concrete), UP_X - 1.4, -0.81, D / 4));               // under the up flight's near side
    // rails: along the up flight, along the landing's edge over the flight down
    G.add(rot(at(box(2.9, 0.05, 0.05, railM), UP_X - 1.35, 1.75, 0.02), 0, 0, -0.54));
    G.add(at(box(0.05, 0.05, D * 0.5, railM), DOWN_X + 0.03, 0.95, D / 4));
    for (let i = 0; i < 3; i++) G.add(at(box(0.04, 0.95, 0.04, railM), DOWN_X + 0.03, 0.475, D / 4 - 0.7 + 0.7 * i));
    // the floor number painted big on the back wall, a fluorescent tube, a small window on the night city
    const num = at(new THREE.Mesh(new THREE.PlaneGeometry(1.5, 1.5), mat({ map: numFor(1), unlit: 0.7 })), 0.2, 1.75, -D / 2 + 0.02); num.material.transparent = true; G.add(num);
    G.add(at(box(1.2, 0.06, 0.12, glow(0xf8f8ff)), 0.0, H - 0.1, -D / 2 + 0.2));
    const nightT = tex(16, 16, (x, r) => { px(x, '#141838', 0, 0, 16, 16); for (let i = 0; i < 18; i++) px(x, r() < 0.5 ? '#ffd27a' : '#8ab0ff', Math.floor(r() * 16), 8 + Math.floor(r() * 8), 1, 1); }, 3307);
    G.add(at(new THREE.Mesh(new THREE.PlaneGeometry(0.9, 0.7), mat({ map: nightT, unlit: 1 })), 2.2, 2.2, -D / 2 + 0.02));
    G.add(at(box(1.0, 0.8, 0.04, M(0xe8e0e4)), 2.2, 2.2, -D / 2 + 0.01));
    return {
      group: G, sky: k.grad([[0, '#1a0a14'], [1, '#2a1020']]), shadowCol: 0x6a4a5a, shadowY: 0.02, indoor: true,
      light() {
        lights(0xa08a96, 0xfff6fa, [0.2, -1, -0.3], 0x1a0a14, [10, 30], 6);
        pt(0, 0, 3.0, -0.6, 1.1, 1.05, 1.1);
      },
      anim(t, P = {}) {
        if (P.key) pt(3, P.key[0], P.key[1], P.key[2], P.key[3], P.key[4], P.key[5]);
        setMap(num, numFor(P.floor ?? 1));
      },
    };
  }

  // =====================================================================================================================
  function penthouse() {
    const G = new THREE.Group(), X = 9, Z0 = PENT.DOOR[1], Z1 = 6, H = 5.2;
    // the clip's pink set: a glossy pink floor, pink walls, a dark ceiling
    const pinkT = tex(16, 16, (x, r) => { px(x, '#ff6ab0', 0, 0, 16, 16); noise(x, r, 16, 16, ['rgba(255,255,255,.05)', 'rgba(140,0,70,.05)'], 40); }, 3308);
    const pinkM = mat({ map: pinkT, rep: [4, 4], unlit: 0.45 }), pinkW = mat({ map: pinkT, rep: [4, 2], unlit: 0.5 });
    G.add(flat(2 * X, Z1 - Z0, pinkM, 0, 0, (Z0 + Z1) / 2));
    const wall = (w, h, m) => new THREE.Mesh(new THREE.PlaneGeometry(w, h), m);
    G.add(rot(at(wall(Z1 - Z0, H, pinkW), -X, H / 2, (Z0 + Z1) / 2), 0, PI / 2, 0));
    G.add(rot(at(wall(Z1 - Z0, H, pinkW), X, H / 2, (Z0 + Z1) / 2), 0, -PI / 2, 0));
    G.add(rot(at(wall(2 * X, H, pinkW), 0, H / 2, Z1), 0, PI, 0));
    G.add(rot(at(wall(2 * X, Z1 - Z0, M(0x5a1a3a)), 0, H, (Z0 + Z1) / 2), PI / 2, 0, 0));
    // the back wall with the lift's opening and the stairwell door; the lift car behind, lit pink
    const edge = M(0xd04a8a), SX = PENT.STAIRS[0];
    const bpiece = (w, h, x, y) => at(new THREE.Mesh(new THREE.BoxGeometry(w, h, 0.12), [edge, edge, edge, edge, pinkW, edge]), x, y, Z0 - 0.06);
    G.add(bpiece(X - 1.2, H, -(1.2 + (X - 1.2) / 2), H / 2));
    G.add(bpiece(SX - 0.55 - 1.2, H, (1.2 + SX - 0.55) / 2, H / 2));
    G.add(bpiece(X - SX - 0.55, H, (SX + 0.55 + X) / 2, H / 2));
    G.add(bpiece(2.4, H - ELEV.DOOR.H, 0, ELEV.DOOR.H + (H - ELEV.DOOR.H) / 2));
    G.add(bpiece(1.1, H - 2.2, SX, 2.2 + (H - 2.2) / 2));
    const doors = liftDoors(G, Z0);
    const carM = M(0xff6ab0, { unlit: 0.6 }), car = new THREE.Group(); car.position.set(0, 0, Z0 - 0.12); G.add(car);
    car.add(at(wall(3.4, 3.0, carM), 0, 1.5, -3.0));
    car.add(rot(at(wall(3.0, 3.0, carM), -1.7, 1.5, -1.5), 0, PI / 2, 0));
    car.add(rot(at(wall(3.0, 3.0, carM), 1.7, 1.5, -1.5), 0, -PI / 2, 0));
    car.add(flat(3.4, 3.0, M(0xc0507e, { unlit: 0.45 }), 0, 0, -1.5));   // lit (a dark wine floor read as a black void under the sleeping cat)
    car.add(at(box(1.0, 0.42, 0.04, M(0x2a1420)), 0, 1.86, -2.97));
    car.add(at(new THREE.Mesh(new THREE.PlaneGeometry(0.9, 0.34), mat({ map: fullT, unlit: 1 })), 0, 1.86, -2.94));   // FULL, still, on the car's back wall
    car.add(rot(at(wall(3.4, 3.0, glow(0xffe8f2)), 0, 3.0, -1.5), PI / 2, 0, 0));
    // the stairwell door (it swings out into the room) with a STAIRS sign over it; the dark stairwell behind
    const sdPiv = new THREE.Group(); sdPiv.position.set(SX + 0.5, 0, Z0 + 0.02); G.add(sdPiv);
    sdPiv.add(at(box(1.0, 2.15, 0.06, M(0x9a9aa6, { unlit: 0.1 })), -0.5, 1.075, 0.03));
    sdPiv.add(at(box(0.3, 0.04, 0.06, M(0x2a2a2a)), -0.85, 1.05, 0.08));
    G.add(at(new THREE.Mesh(new THREE.PlaneGeometry(0.8, 0.22), mat({ map: k.sign('STAIRS', '#1a8a4a', '#ffffff', 64, 16), unlit: 0.9 })), SX, 2.45, Z0 + 0.02));
    G.add(at(box(1.1, 2.2, 0.02, M(0x3a2a34)), SX, 1.1, Z0 - 0.4));
    // the clip's set: the drum kit with a lightning bolt on its bass drum, amp stacks, a mic stand, cables
    const boltT = tex(32, 32, x => { px(x, '#f8f4f6', 0, 0, 32, 32); x.fillStyle = '#ff3a8a'; x.beginPath(); [[18, 3], [9, 17], [15, 17], [11, 29], [23, 13], [17, 13], [21, 3]].forEach(([a, b], i) => (i ? x.lineTo(a, b) : x.moveTo(a, b))); x.closePath(); x.fill(); });
    const kit = new THREE.Group(); kit.position.set(PENT.DRUMS[0], 0, PENT.DRUMS[1]); kit.rotation.y = 0.35; G.add(kit);
    const shell = M(0xf2f0f4, { unlit: 0.25 }), metal = M(0xc8ccd4, { unlit: 0.3 }), cymM = M(0xe0b84a, { unlit: 0.35 });
    kit.add(rot(at(cyl(0.42, 0.42, 0.42, 12, shell), 0, 0.44, 0), PI / 2, 0, 0));
    kit.add(at(new THREE.Mesh(new THREE.CircleGeometry(0.4, 12), mat({ map: boltT, unlit: 0.6 })), 0, 0.44, 0.215));
    for (const [x, y, z, r] of [[-0.45, 0.62, 0.15, 0.18], [0.45, 0.62, 0.15, 0.18], [0.0, 0.92, -0.05, 0.15], [0.62, 0.5, -0.35, 0.22]]) kit.add(at(cyl(r, r, 0.18, 10, shell), x, y, z));
    for (const [x, y, z] of [[-0.8, 1.35, -0.1], [0.75, 1.45, -0.25], [-0.6, 1.0, 0.3]]) { kit.add(at(cyl(0.012, 0.012, y, 4, metal), x, y / 2, z)); kit.add(rot(at(cyl(0.3, 0.3, 0.02, 10, cymM), x, y, z), 0.15, 0, 0.1)); }
    const amp = (x, z, h) => { const a = new THREE.Group(); a.add(at(box(0.9, h, 0.5, M(0x1a1a1e)), 0, h / 2, 0)); a.add(at(box(0.8, h * 0.7, 0.02, M(0x2a2a30)), 0, h * 0.45, 0.26)); a.add(at(box(0.8, 0.12, 0.02, M(0xd8c8a0)), 0, h - 0.1, 0.26)); a.position.set(x, 0, z); a.rotation.y = -0.3; G.add(a); };
    amp(PENT.AMPS[0], PENT.AMPS[1], 1.4); amp(PENT.AMPS[0] + 1.0, PENT.AMPS[1] - 0.2, 1.8); amp(-PENT.AMPS[0] - 1.6, PENT.AMPS[1] - 0.8, 1.2);
    const mic = new THREE.Group(); mic.position.set(PENT.MIC[0], 0, PENT.MIC[1]); G.add(mic);
    mic.add(at(cyl(0.012, 0.012, 1.3, 4, metal), 0, 0.65, 0)); mic.add(at(cyl(0.18, 0.18, 0.02, 8, metal), 0, 0.01, 0)); mic.add(at(ico(0.045, 0, M(0x2a2a2a)), 0, 1.33, 0.02));
    for (let i = 0; i < 5; i++) G.add(rot(at(box(0.03, 0.01, 2.2, M(0x1a1a1a)), -3 + i * 1.3, 0.006, -3.6 + (i % 2) * 0.9), 0, 0.6 + i * 0.4, 0));
    // red cups on the floor (the clip's game), lightning bolts on the walls, a mirror ball, confetti
    for (let i = 0; i < 14; i++) G.add(at(cyl(0.055, 0.04, 0.13, 6, cupM), -6.5 + hash(i, 3) * 13, 0.065, -4.6 + hash(i, 5) * 9));
    for (const [x, z, ry] of [[-X + 0.02, -2, PI / 2], [X - 0.02, -1, -PI / 2], [-X + 0.02, 2.5, PI / 2], [X - 0.02, 3.5, -PI / 2]]) G.add(rot(at(new THREE.Mesh(new THREE.PlaneGeometry(1.6, 1.6), mat({ map: boltT, unlit: 0.7 })), x, 2.8, z), 0, ry, 0));
    const ball = at(ico(0.4, 1, M(0xe8e8f4, { unlit: 0.5 })), 0, H - 0.8, -1.0); G.add(ball);
    const confM = [0xff3a8a, 0xffffff, 0xffd23a, 0x2ad0c8].map(c => glow(c, 0.9)), confetti = [];
    for (let i = 0; i < 80; i++) { const c = new THREE.Mesh(new THREE.PlaneGeometry(0.09, 0.05), confM[i % 4]); c.visible = false; G.add(c); confetti.push(c); }
    // the party: pets dancing with their cups round the room, off the lift's doorway and the stairwell door
    const pets = [];
    const HOME = [[-6.2, -3.0], [-5.0, -1.4], [-6.6, 0.6], [-4.6, 1.8], [-3.2, -0.2], [-6.0, 2.8], [6.0, -2.6], [4.8, -0.8], [6.6, 1.0], [4.4, 2.2],
      [3.2, 0.4], [6.2, 3.0], [-2.6, 3.4], [2.6, 3.6], [-1.2, 4.6], [1.2, 4.8], [-7.2, -1.8], [7.2, -1.2], [-3.8, -2.6], [5.6, -4.2]];
    for (let i = 0; i < HOME.length; i++) { const p = pet(60 + i); G.add(p.g); pets.push(p); }
    return {
      group: G, sky: k.grad([[0, '#2a0a1a'], [1, '#3a1028']]), shadowCol: 0xb03a74, shadowY: 0.02, indoor: true,
      light() {
        lights(0xc07a9a, 0xfff0f6, [0.1, -1, -0.4], 0x3a1028, [18, 50], 9);
        pt(0, 0, 3.6, -2.4, 1.2, 0.8, 1.0);
        pt(1, PENT.DRUMS[0], 2.8, PENT.DRUMS[1] + 1.2, 0.9, 0.55, 0.8);
        pt(2, 0, 2.4, Z0 - 1.5, 1.0, 0.75, 0.9);                 // inside the lift car
      },
      anim(t, P = {}) {
        const s = shotT(t, P), bb = beat(t);
        if (P.key) pt(3, P.key[0], P.key[1], P.key[2], P.key[3], P.key[4], P.key[5]);
        doors.set(ramp(P.doors, s)); setMap(doors.disp, LED.PH);
        sdPiv.rotation.y = 1.6 * ramp(P.stairsDoor, s);
        ball.rotation.y = t * 0.8;
        confetti.forEach((c, i) => {
          if (P.confetti == null || s < P.confetti) { c.visible = false; return; }
          const e = s - P.confetti, x = -3 + hash(i, 11) * 6, z = -4.4 + hash(i, 13) * 6, y = 4.6 - ((e * (0.8 + hash(i, 17) * 0.6) + hash(i, 19) * 4.6) % 4.6);
          c.visible = true; c.position.set(x + 0.15 * Math.sin(e * 3 + i), y, z); c.rotation.set(e * 4 + i, e * 3 + i * 2, 0);
        });
        const mode = P.party || 'dance', ST = P.stare, R = P.ring;   // ring: [cx, cz, r, a0, a1] (deg, 0 = +z): 14 pets on an arc facing its centre
        pets.forEach((p, i) => {
          let [x, z] = HOME[i], yaw = Math.atan2(0 - x, -2.0 - z);
          if (R && i < 14) { const half = R[5] ? 7 : 14, j = i % half, sg = R[5] && i >= 7 ? -1 : 1, a = sg * (R[3] + (R[4] - R[3]) * (j + 0.5) / half) * PI / 180;   // R[5]: mirrored, 7 on [a0, a1] and 7 on [-a1, -a0] (a corridor)
            x = R[0] + Math.sin(a) * R[2] * (1 + 0.12 * (i % 2)); z = R[1] + Math.cos(a) * R[2] * (1 + 0.12 * (i % 2)); yaw = Math.atan2(R[0] - x, R[1] - z); }
          const AU = P.audience;   // [x0, z0, cols, rows, dx, dz]: a crowd in rows facing the lift's doors (their backs to a lens behind them)
          if (AU && i < AU[2] * AU[3]) { const c = i % AU[2], r = Math.floor(i / AU[2]); x = AU[0] + c * AU[4] + (r % 2 ? AU[4] / 2 : 0) + 0.12 * (hash(i, 7) - 0.5); z = AU[1] + r * AU[5] + 0.12 * (hash(i, 9) - 0.5); yaw = PI; }
          if (ST) yaw = Math.atan2(ST[0] - x, ST[1] - z);
          p.g.position.set(x, 0, z);
          p.g.visible = !P.noguests && !cleared(P, x, z);
          if (p.g.visible) animPet(p, mode, bb, yaw);
        });
      },
    };
  }

  return { elevator: elevator(), stairwell: stairwell(), penthouse: penthouse() };
}
