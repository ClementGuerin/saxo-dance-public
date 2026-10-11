// maps42.js: the "Don't Stop The Music" map (2026-10-11 2nd, Rihanna; the clip: a yellow taxi on a rainy night street, a
// corner candy shop whose back door leads into a hidden club: teal walls with black damask, magenta light, a purple stage
// with big round gold lights, a crowd dancing). Same contract as the other map files, pure in t:
//   candyclub  the hidden club (CLUB: x X0..X1, z Z0..Z1, H high): a dark plum floor, teal damask walls, the DJ's stage at
//         the back (STAGE_Y high, its front at STAGE_Z) before the purple wall of big round gold lights and a pink neon
//         lollipop; the decks (DESK, top DESK_Y) with the big red STOP button (BTN) and the DJ's stool behind them (STOOL,
//         seat STOOL_Y), speaker stacks, a mirror ball over the floor; on the dance floor a ring of gold party chairs
//         facing outwards (RING centre, CHAIR_R, seat SEAT_Y; chair i at CHAIR_A[i] deg, 0 = +z, `chairs` [the ones
//         standing]); the blue lounge sofas on the right wall; the secret door in the left wall (DOOR: a damask panel
//         hinged at its -z edge, `door` 0-1 or a ramp, swinging into the club), the candy shop behind it (SHOP: shelves of
//         glass jars of sweets, the counter with a till, a gumball machine, giant lollipops, a warm light).
//         The players: six box pets in party clothes playing musical chairs, `players` (mode for all) or `pmode` (one per
//         player): 'circle' (walking round the ring at WALK_R, angle `ang`[k] deg at s = 0 plus `walk` deg/s), 'seated'
//         (on chair `seats`[k]), 'scramble' (from the circle into their chairs over 0.35 s from `scrambleAt` s), 'hover'
//         (crouched over their chairs, the fake-out), 'stare' (at `stare` [x, z]), 'dance' / 'cheer' (at `spots`[k] or on
//         the circle), 'shop' (in the candy shop eating a lollipop), false (gone).
//         `chairOut` [[i, s0, dir deg, dist m, dur s]] (Compote's kicks: the chair slides and hops away and topples onto its
//         back, lying there after; a negative s0 = kicked long ago); `stop` (true or s: the music stopped: the mirror ball, the decks, the speakers and the lights freeze, the
//         dancers too); `press` (s: the STOP button goes down, a red flash); `candyBurst` [x, y, z, s] (sweets flying out
//         of a crash, lying round it after); `hearts` [[x, y, z, s0, loop]] + `heartYaw`; `breath` [x, y, z, s0, yaw] (a
//         green puff of dog breath at a face on every beat); `zone` 'club' | 'shop' (the lights); `key`; `clear`
//         [[x, z, r]] (no player there).
import { mapKit } from './mapkit.js';

export const CLUB = {
  X0: -6, X1: 6, Z0: -6, Z1: 8.0, H: 6.0,
  STAGE: [-2.9, 2.9, -6, -3.6], STAGE_Y: 0.4, STAGE_Z: -3.6,
  DESK: [0, -4.05], DESK_W: 2.0, DESK_D: 0.5, DESK_Y: 0.95,
  STOOL: [0, -4.72], STOOL_Y: 0.82,
  BTN: [0.38, -4.2],
  RING: [0, 0.6], CHAIR_R: 1.15, SEAT_Y: 0.42, N: 7, WALK_R: 2.05,
  DOOR: [-6, 1.4], DOOR_W: 1.4, DOOR_H: 2.3,
  SHOP: [-10.6, -6, -1.6, 4.4], SHOP_H: 3.2,
  SOFAS: [[5.35, -2.2], [5.35, 1.6]],
};
CLUB.CHAIR_A = Array.from({ length: CLUB.N }, (_, i) => i * 360 / CLUB.N);
CLUB.SHOP_SPOTS = [[-8.0, 2.6], [-9.0, 1.0], [-7.2, 0.2], [-9.4, 3.4], [-8.4, -0.6], [-7.0, 3.4]];

export function buildCandyClubMaps(K) {
  const k = mapKit(K);
  const { THREE, mat, tex, px, noise, box, TAU, PI, beat, fr, cyl, cone, ico, at, rot, flat, lights, pt, hash } = k;
  const M = (c, o = {}) => mat({ color: c, ...o }), glow = (c, u = 1) => mat({ color: c, unlit: u });
  const cl = x => Math.max(0, Math.min(1, x)), sm = x => { x = cl(x); return x * x * (3 - 2 * x); };
  const cleared = (P, x, z) => (P.clear || []).some(([cx, cz, r]) => (x - cx) ** 2 + (z - cz) ** 2 < r * r);
  const ramp = (v, s, d = 0) => v == null ? d : Array.isArray(v) ? v[2] + (v[3] - v[2]) * cl((s - v[0]) / Math.max(0.01, v[1] - v[0])) : (v === true ? 1 : v === false ? 0 : v);
  const shotT = (t, P) => P.t0 != null ? t - P.t0 : 0;
  const C = CLUB, rad = d => d * PI / 180;
  const chairPos = i => { const a = rad(C.CHAIR_A[i]); return [C.RING[0] + Math.sin(a) * C.CHAIR_R, C.RING[1] + Math.cos(a) * C.CHAIR_R, a]; };

  // ---------- textures ----------
  const damaskT = tex(32, 32, (x, r) => { px(x, '#178a86', 0, 0, 32, 32); noise(x, r, 32, 32, ['#14807c', '#1a948f'], 80); for (const [i, j] of [[8, 8], [24, 24]]) { px(x, '#0c2a2a', i - 1, j - 6, 2, 12); px(x, '#0c2a2a', i - 5, j - 1, 10, 2); px(x, '#0c2a2a', i - 3, j - 3, 6, 6); px(x, '#0c2a2a', i - 4, j - 5, 2, 2); px(x, '#0c2a2a', i + 2, j - 5, 2, 2); px(x, '#0c2a2a', i - 4, j + 3, 2, 2); px(x, '#0c2a2a', i + 2, j + 3, 2, 2); } for (const [i, j] of [[24, 8], [8, 24]]) { px(x, '#0c2a2a', i - 1, j - 2, 2, 4); px(x, '#0c2a2a', i - 2, j - 1, 4, 2); } }, 4201);
  const floorT = tex(32, 32, (x, r) => { px(x, '#2a1430', 0, 0, 32, 32); noise(x, r, 32, 32, ['#26122c', '#2e1636', '#2a1432'], 120); px(x, '#1a0c1e', 0, 0, 32, 1); px(x, '#1a0c1e', 0, 0, 1, 32); }, 4202);
  const purpleT = tex(32, 32, (x, r) => { px(x, '#3a1a5a', 0, 0, 32, 32); noise(x, r, 32, 32, ['#361856', '#3e1e60'], 60); for (let i = 0; i < 32; i += 4) px(x, '#2e1248', i, 0, 1, 32); }, 4203);
  const velvetT = tex(16, 32, x => { for (let i = 0; i < 16; i++) { const v = Math.sin(i / 16 * TAU * 2); px(x, v > 0.3 ? '#4a6a9a' : v > -0.3 ? '#3a5888' : '#2c4470', i, 0, 1, 32); } }, 4204);
  const redVelT = tex(8, 8, (x, r) => { px(x, '#b81a3a', 0, 0, 8, 8); noise(x, r, 8, 8, ['#a8143a', '#c82246'], 16); }, 4205);
  const shopFloorT = tex(16, 16, x => { px(x, '#f2d8e4', 0, 0, 16, 16); px(x, '#e86aa0', 0, 0, 8, 8); px(x, '#e86aa0', 8, 8, 8, 8); }, 4206);
  const stripeT = tex(16, 16, x => { for (let i = 0; i < 16; i++) px(x, (i >> 2) % 2 ? '#fff4f8' : '#f48ab8', i, 0, 1, 16); }, 4207);
  const woodT = tex(32, 8, (x, r) => { px(x, '#a8744a', 0, 0, 32, 8); noise(x, r, 32, 8, ['#a06c44', '#b07c52', '#986640'], 70); px(x, '#6a4428', 0, 7, 32, 1); }, 4208);
  const swirlT = tex(32, 32, x => { x.fillStyle = '#fff6fa'; x.fillRect(0, 0, 32, 32); x.strokeStyle = '#ff3a8a'; x.lineWidth = 4; x.beginPath(); for (let a = 0; a < TAU * 3; a += 0.1) { const r = a * 1.6; x.lineTo(16 + Math.cos(a) * r, 16 + Math.sin(a) * r); } x.stroke(); }, 4209);

  // ---------- a gold party chair (seat SEAT_Y, the sitter facing +z, the back at -z) ----------
  const gold = M(0xd8a83a, { unlit: 0.28 }), goldD = M(0xa87a24, { unlit: 0.2 }), cushion = mat({ map: redVelT });
  function chair() {
    const g = new THREE.Group(), S = C.SEAT_Y;
    g.add(at(box(0.48, 0.05, 0.46, goldD), 0, S - 0.045, 0));
    g.add(at(box(0.46, 0.05, 0.44, cushion), 0, S - 0.01, 0.01));
    for (const [dx, dz] of [[-0.21, -0.2], [0.21, -0.2], [-0.21, 0.2], [0.21, 0.2]]) g.add(at(box(0.04, S - 0.05, 0.04, gold), dx, (S - 0.05) / 2, dz));
    for (const dx of [-0.21, 0.21]) g.add(at(box(0.04, 0.52, 0.04, gold), dx, S + 0.26, -0.21));
    g.add(at(box(0.46, 0.05, 0.04, gold), 0, S + 0.52, -0.21)); g.add(at(box(0.46, 0.04, 0.04, gold), 0, S + 0.3, -0.21));
    for (const dx of [-0.1, 0, 0.1]) g.add(at(box(0.025, 0.22, 0.025, gold), dx, S + 0.41, -0.21));
    return g;
  }

  // ---------- a box pet in party clothes (the players): sparkly tops, a party hat or a bow ----------
  const FURS = [0xf2eee6, 0xd8a868, 0x9a9aa4, 0xe8c090, 0x8a7a6c, 0xc8b8a8];
  const TOPS = [0x18b8b0, 0xe8b830, 0xe84a98, 0x8ad838, 0xf07a2a, 0x9a5ae0];
  function playerPet(i) {
    const g = new THREE.Group(), Fm = M(FURS[i % FURS.length]), J = M(TOPS[i % TOPS.length], { unlit: 0.25 });
    const body = new THREE.Group(); g.add(body);
    const legs = [-1, 1].map(sx => { const l = at(new THREE.Group(), sx * 0.1, 0.3, 0); l.add(at(box(0.13, 0.3, 0.13, M(0x24222a)), 0, -0.15, 0)); body.add(l); return l; });
    body.add(at(box(0.4, 0.38, 0.28, J), 0, 0.5, 0));
    for (let s = 0; s < 6; s++) body.add(at(box(0.04, 0.04, 0.01, glow(0xffffff, 0.6)), -0.13 + (s % 3) * 0.13, 0.42 + Math.floor(s / 3) * 0.16, 0.145));   // sequins
    const arms = [-1, 1].map(sx => { const a = at(new THREE.Group(), sx * 0.23, 0.64, 0); a.add(at(box(0.09, 0.28, 0.09, J), 0, -0.12, 0)); a.add(at(box(0.08, 0.08, 0.08, Fm), 0, -0.28, 0)); body.add(a); return a; });
    const head = at(new THREE.Group(), 0, 0.92, 0); body.add(head);
    const skull = ico(0.24, 1, Fm); skull.scale.set(1, 0.9, 0.92); head.add(skull);
    const snout = at(ico(0.1, 1, M(0xf0e6d8)), 0, -0.07, 0.19); snout.scale.set(1.1, 0.8, 0.9); head.add(snout);
    head.add(at(ico(0.035, 0, M(0x151515)), 0, -0.03, 0.28));
    for (const e of [-1, 1]) { head.add(at(ico(0.038, 0, M(0x0e0e0e)), e * 0.1, 0.05, 0.19)); head.add(at(ico(0.012, 0, glow(0xffffff)), e * 0.1 + 0.012, 0.065, 0.225)); head.add(rot(at(cone(0.08, 0.2, 4, Fm), e * 0.15, 0.27, 0), 0, 0, -e * 0.25)); }
    const mouth = at(box(0.09, 0.07, 0.02, M(0x5a1a1a)), 0, -0.13, 0.25); mouth.visible = false; head.add(mouth);
    if (i % 2 === 0) head.add(rot(at(cone(0.11, 0.3, 6, M(TOPS[(i + 2) % TOPS.length], { unlit: 0.3 })), 0.06, 0.36, 0), 0, 0, -0.2));   // a party hat
    else { const bow = at(new THREE.Group(), 0.1, 0.24, 0.02); bow.add(rot(at(cone(0.06, 0.12, 4, M(0xff5aa8, { unlit: 0.3 })), -0.06, 0, 0), 0, 0, PI / 2)); bow.add(rot(at(cone(0.06, 0.12, 4, M(0xff5aa8, { unlit: 0.3 })), 0.06, 0, 0), 0, 0, -PI / 2)); head.add(bow); }
    const pop = at(new THREE.Group(), 0, -0.3, 0.08); arms[1].add(pop);   // a lollipop in the right paw (the shop)
    pop.add(at(cyl(0.012, 0.012, 0.3, 4, M(0xf4f0e8)), 0, 0.12, 0)); const disc = at(cyl(0.11, 0.11, 0.03, 10, mat({ map: swirlT, unlit: 0.4 })), 0, 0.3, 0); disc.rotation.x = PI / 2; pop.add(disc);
    return { g, body, head, arms, legs, mouth, pop, i };
  }

  function candyclub() {
    const G = new THREE.Group();
    const W = C.X1 - C.X0, D = C.Z1 - C.Z0, cz = (C.Z0 + C.Z1) / 2, H = C.H;
    // ---------- the club: floor, walls (the left one with the secret door's hole), ceiling ----------
    G.add(flat(W, D, mat({ map: floorT, rep: [W / 1.2, D / 1.2] }), 0, 0, cz));
    const ringRug = flat(1, 1, M(0x8a1a5a, { unlit: 0.15 }), C.RING[0], 0.012, C.RING[1]); ringRug.geometry = new THREE.CircleGeometry(2.7, 24); G.add(ringRug);
    const ringLine = flat(1, 1, M(0xffd84a, { unlit: 0.6 }), C.RING[0], 0.018, C.RING[1]); ringLine.geometry = new THREE.RingGeometry(2.66, 2.74, 32); G.add(ringLine);
    const wallM = (w, h) => new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat({ map: damaskT, rep: [w / 1.3, h / 1.3] }));
    G.add(rot(at(wallM(D, H), C.X1, H / 2, cz), 0, -PI / 2));
    G.add(rot(at(wallM(W, H), 0, H / 2, C.Z1), 0, PI));
    const dz0 = C.DOOR[1] - C.DOOR_W / 2, dz1 = C.DOOR[1] + C.DOOR_W / 2;
    G.add(rot(at(wallM(dz0 - C.Z0, H), C.X0, H / 2, (C.Z0 + dz0) / 2), 0, PI / 2));
    G.add(rot(at(wallM(C.Z1 - dz1, H), C.X0, H / 2, (dz1 + C.Z1) / 2), 0, PI / 2));
    G.add(rot(at(wallM(C.DOOR_W, H - C.DOOR_H), C.X0, (H + C.DOOR_H) / 2, C.DOOR[1]), 0, PI / 2));
    const back = new THREE.Mesh(new THREE.PlaneGeometry(W, H), mat({ map: purpleT, rep: [W / 1.6, H / 1.6] })); G.add(at(back, 0, H / 2, C.Z0));
    const ceil = new THREE.Mesh(new THREE.PlaneGeometry(W, D), M(0x140a18)); ceil.rotation.x = PI / 2; G.add(at(ceil, 0, H, cz));
    for (const x of [C.X0 + 0.04, C.X1 - 0.04]) G.add(at(box(0.06, 0.12, D, gold), x, 1.0, cz));
    // the big round gold lights on the purple wall (the clip's stage), pulsing on the beat
    const discs = [];
    for (let r = 0; r < 2; r++) for (let c = 0; c < 5; c++) {
      const d = at(new THREE.Mesh(new THREE.CircleGeometry(0.42, 14), glow(0xffcf5a, 0.9)), -3.2 + c * 1.6, 1.55 + r * 1.25, C.Z0 + 0.02); G.add(d); discs.push(d);
      G.add(at(new THREE.Mesh(new THREE.RingGeometry(0.42, 0.5, 14), M(0x9a6a1a, { unlit: 0.4 })), d.position.x, d.position.y, C.Z0 + 0.015));
    }
    // a pink neon lollipop over the decks
    const neonM = glow(0xff4fa8), neon = at(new THREE.Group(), 0, 3.55, C.Z0 + 0.05); G.add(neon);
    neon.add(new THREE.Mesh(new THREE.TorusGeometry(0.42, 0.035, 4, 20), neonM)); neon.add(new THREE.Mesh(new THREE.TorusGeometry(0.24, 0.035, 4, 16), neonM)); neon.add(at(box(0.06, 0.62, 0.04, neonM), 0, -0.73, 0));
    // ---------- the stage, the decks, the STOP button, the DJ's stool, the speakers ----------
    const [sx0, sx1, sz0, sz1] = C.STAGE;
    G.add(at(box(sx1 - sx0, C.STAGE_Y, sz1 - sz0, M(0x1a1220)), (sx0 + sx1) / 2, C.STAGE_Y / 2, (sz0 + sz1) / 2));
    G.add(at(box(sx1 - sx0, 0.05, 0.05, M(0xffd84a, { unlit: 0.7 })), (sx0 + sx1) / 2, C.STAGE_Y - 0.03, sz1 + 0.02));
    const desk = at(new THREE.Group(), C.DESK[0], C.STAGE_Y, C.DESK[1]); G.add(desk);
    const dh = C.DESK_Y - C.STAGE_Y;
    desk.add(at(box(C.DESK_W, dh - 0.04, C.DESK_D, M(0x141018)), 0, (dh - 0.04) / 2, 0));
    desk.add(at(box(C.DESK_W + 0.04, 0.04, C.DESK_D + 0.04, M(0x2a2232)), 0, dh - 0.02, 0));
    desk.add(at(box(C.DESK_W - 0.1, 0.12, 0.02, glow(0xff4fa8, 0.7)), 0, dh * 0.55, C.DESK_D / 2 + 0.011));
    const vinyls = [];
    for (const s of [-1, 1]) {
      desk.add(at(box(0.5, 0.05, 0.42, M(0x2a2a30)), s * 0.62, dh + 0.025, 0));
      const v = at(cyl(0.18, 0.18, 0.015, 14, M(0x101014)), s * 0.62, dh + 0.06, 0); desk.add(v);
      v.add(at(box(0.08, 0.017, 0.08, M(0xff4fa8, { unlit: 0.5 })), 0, 0.001, 0)); v.add(at(box(0.03, 0.018, 0.12, M(0x3a3a44)), 0.09, 0.001, 0)); vinyls.push(v);
    }
    desk.add(at(box(0.36, 0.06, 0.36, M(0x22222a)), 0, dh + 0.03, 0));
    for (let i = 0; i < 4; i++) desk.add(at(box(0.03, 0.02, 0.18, glow([0x5affd8, 0xffd84a, 0xff4fa8, 0x8a8aff][i], 0.8)), -0.12 + i * 0.08, dh + 0.07, 0));
    const btn = at(new THREE.Group(), C.BTN[0] - C.DESK[0], dh, C.BTN[1] - C.DESK[1]); desk.add(btn);
    btn.add(at(box(0.24, 0.1, 0.24, M(0xf2c81a, { unlit: 0.3 })), 0, 0.05, 0));
    const cap = at(cyl(0.11, 0.11, 0.07, 12, M(0xe8141e, { unlit: 0.45 })), 0, 0.13, 0); btn.add(cap);
    const flash = at(new THREE.Mesh(new THREE.RingGeometry(0.14, 0.24, 16), mat({ color: 0xff3a3a, unlit: 1, see: 0.4 })), 0, 0.2, 0); flash.rotation.x = -PI / 2; btn.add(flash);
    const stool = at(new THREE.Group(), C.STOOL[0], C.STAGE_Y, C.STOOL[1]); G.add(stool);
    const sh = C.STOOL_Y - C.STAGE_Y;
    stool.add(at(cyl(0.24, 0.24, 0.08, 12, mat({ map: redVelT })), 0, sh - 0.04, 0)); stool.add(at(cyl(0.04, 0.04, sh - 0.08, 6, gold), 0, (sh - 0.08) / 2, 0)); stool.add(at(cyl(0.22, 0.22, 0.03, 10, gold), 0, 0.015, 0));
    const cones = [];
    for (const s of [-1, 1]) {
      const sp = at(new THREE.Group(), s * 2.25, C.STAGE_Y, -4.6); G.add(sp); sp.rotation.y = -s * 0.25;
      sp.add(at(box(0.8, 1.9, 0.6, M(0x16141a)), 0, 0.95, 0));
      for (const [y, r] of [[0.5, 0.26], [1.15, 0.26], [1.65, 0.1]]) { const c2 = at(cyl(r, r * 0.6, 0.06, 10, M(0x3a3a44)), 0, y, 0.31); c2.rotation.x = PI / 2; sp.add(c2); cones.push(c2); }
    }
    // the mirror ball over the ring and its light spots wandering over the floor
    const ball = at(ico(0.36, 1, M(0xe8eef4, { unlit: 0.55 })), C.RING[0], 4.3, C.RING[1]); G.add(ball);
    G.add(at(cyl(0.01, 0.01, 1.7, 4, M(0x8a8a90)), C.RING[0], 5.15, C.RING[1]));
    const spots = [];
    for (let i = 0; i < 22; i++) { const s2 = flat(0.14, 0.14, glow(0xffffff, 0.85), 0, 0.022, 0); G.add(s2); spots.push(s2); }
    // ---------- the ring of chairs ----------
    const chairs = C.CHAIR_A.map((a, i) => { const [x, z, ar] = chairPos(i), c = at(chair(), x, 0, z); c.rotation.y = ar; G.add(c); return c; });
    // ---------- the lounge: blue velvet sofas on the right wall ----------
    for (const [x, z] of C.SOFAS) {
      const so = at(new THREE.Group(), x, 0, z); so.rotation.y = -PI / 2; G.add(so); const vel = mat({ map: velvetT, rep: [3, 1] });
      so.add(at(box(2.0, 0.3, 0.75, vel), 0, 0.27, 0)); so.add(at(box(2.0, 0.8, 0.2, vel), 0, 0.6, -0.33)); for (const s of [-1, 1]) so.add(at(box(0.18, 0.55, 0.75, vel), s * 1.0, 0.33, 0));
    }
    // ---------- the secret door: a damask panel in a gold frame (club side), a shelf of candy jars (shop side) ----------
    const doorP = at(new THREE.Group(), C.X0, 0, dz0); G.add(doorP);
    const panel = new THREE.Mesh(new THREE.PlaneGeometry(C.DOOR_W, C.DOOR_H), mat({ map: damaskT, rep: [C.DOOR_W / 1.3, C.DOOR_H / 1.3] })); panel.rotation.y = PI / 2; doorP.add(at(panel, 0.035, C.DOOR_H / 2, C.DOOR_W / 2));
    for (const z of [0.03, C.DOOR_W - 0.03]) doorP.add(at(box(0.05, C.DOOR_H, 0.05, gold), 0.04, C.DOOR_H / 2, z));
    for (const y of [0.03, C.DOOR_H - 0.03]) doorP.add(at(box(0.05, 0.05, C.DOOR_W, gold), 0.04, y, C.DOOR_W / 2));
    doorP.add(at(box(0.06, C.DOOR_H, C.DOOR_W, M(0x6a4428)), -0.01, C.DOOR_H / 2, C.DOOR_W / 2));
    const JAR = [0xff4f8a, 0x5ad8ff, 0xffd84a, 0x8ae83a, 0xff8a2a, 0xc87aff];
    const jarM = mat({ color: 0xdaf0f4, unlit: 0.3, see: 0.5 });
    const jar = (col, r = 0.09, h = 0.24) => { const j = new THREE.Group(); j.add(at(cyl(r, r, h, 8, jarM), 0, h / 2, 0)); j.add(at(cyl(r * 0.92, r * 0.92, h * 0.7, 8, M(col, { unlit: 0.35 })), 0, h * 0.36, 0)); j.add(at(cyl(r * 0.8, r * 0.8, 0.04, 8, M(0xd8a83a)), 0, h + 0.02, 0)); return j; };
    for (let r = 0; r < 4; r++) {
      doorP.add(at(box(0.3, 0.03, C.DOOR_W - 0.1, M(0x8a5a34)), -0.16, 0.35 + r * 0.5, C.DOOR_W / 2));
      for (let c = 0; c < 5; c++) doorP.add(at(jar(JAR[(r + c) % 6]), -0.16, 0.37 + r * 0.5, 0.18 + c * 0.26));
    }
    // ---------- the candy shop behind it ----------
    const [hx0, hx1, hz0, hz1] = C.SHOP, hw = hx1 - hx0, hd = hz1 - hz0, hcz = (hz0 + hz1) / 2, HS = C.SHOP_H;
    G.add(flat(hw, hd, mat({ map: shopFloorT, rep: [hw / 0.8, hd / 0.8] }), (hx0 + hx1) / 2, 0, hcz));
    const shopWall = (w, h) => new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat({ map: stripeT, rep: [w / 0.8, 1] }));
    G.add(rot(at(shopWall(hd, HS), hx0, HS / 2, hcz), 0, PI / 2));
    G.add(at(shopWall(hw, HS), (hx0 + hx1) / 2, HS / 2, hz0)); G.add(rot(at(shopWall(hw, HS), (hx0 + hx1) / 2, HS / 2, hz1), 0, PI));
    const sc = new THREE.Mesh(new THREE.PlaneGeometry(hw, hd), M(0xfff0f6)); sc.rotation.x = PI / 2; G.add(at(sc, (hx0 + hx1) / 2, HS, hcz));
    for (const [x0, z0, along] of [[hx0 + 0.18, hcz, 'z'], [(hx0 + hx1) / 2, hz0 + 0.18, 'x']]) {
      const len = along === 'z' ? hd - 0.6 : hw - 0.6;
      for (let r = 0; r < 4; r++) {
        G.add(at(along === 'z' ? box(0.34, 0.03, len, mat({ map: woodT })) : box(len, 0.03, 0.34, mat({ map: woodT })), x0, 0.5 + r * 0.55, z0));
        const n = Math.floor(len / 0.3);
        for (let c = 0; c < n; c++) { const off = -len / 2 + 0.15 + c * 0.3, j = jar(JAR[(r * 3 + c) % 6], 0.1, 0.28); G.add(along === 'z' ? at(j, x0, 0.52 + r * 0.55, z0 + off) : at(j, x0 + off, 0.52 + r * 0.55, z0)); }
      }
    }
    const counter = at(new THREE.Group(), -8.6, 0, -0.4); G.add(counter);
    counter.add(at(box(1.9, 0.9, 0.6, mat({ map: stripeT, rep: [2, 1] })), 0, 0.45, 0)); counter.add(at(box(2.0, 0.05, 0.66, M(0xf4f0e8)), 0, 0.92, 0));
    counter.add(at(box(0.36, 0.26, 0.3, M(0xd8a83a, { unlit: 0.3 })), 0.6, 1.07, 0)); counter.add(at(box(0.3, 0.1, 0.02, glow(0x5aff8a, 0.8)), 0.6, 1.16, 0.16));
    for (let i = 0; i < 4; i++) counter.add(at(jar(JAR[i], 0.08, 0.2), -0.7 + i * 0.3, 0.95, 0.05));
    const gum = at(new THREE.Group(), -6.9, 0, 3.7); G.add(gum);
    gum.add(at(cyl(0.12, 0.2, 0.9, 8, M(0xd81a2a, { unlit: 0.3 })), 0, 0.45, 0)); gum.add(at(ico(0.3, 1, mat({ color: 0xe8f4f8, unlit: 0.3, see: 0.5 })), 0, 1.2, 0));
    for (let i = 0; i < 14; i++) gum.add(at(ico(0.06, 0, M(JAR[i % 6], { unlit: 0.4 })), (hash(i, 7) - 0.5) * 0.36, 1.05 + hash(i, 8) * 0.3, (hash(i, 9) - 0.5) * 0.36));
    for (const [x, z, s] of [[-6.6, -1.1, 1.3], [-10.0, 4.0, 1.1]]) {
      const lp = at(new THREE.Group(), x, 0, z); lp.scale.setScalar(s); G.add(lp); lp.add(at(cyl(0.025, 0.025, 1.3, 5, M(0xf4f0e8)), 0, 0.65, 0));
      const d2 = at(cyl(0.32, 0.32, 0.06, 14, mat({ map: swirlT, unlit: 0.4 })), 0, 1.5, 0); d2.rotation.x = PI / 2; lp.add(d2);
    }
    // ---------- the players, the hearts, the candy burst, the breath ----------
    const players = Array.from({ length: 6 }, (_, i) => { const q = playerPet(i); G.add(q.g); return q; });
    const heartM = M(0xff4f9a, { unlit: 0.8 }), hearts = [];
    for (let i = 0; i < 12; i++) { const h = new THREE.Group(); h.add(at(ico(0.1, 0, heartM), -0.075, 0, 0)); h.add(at(ico(0.1, 0, heartM), 0.075, 0, 0)); h.add(rot(at(cone(0.125, 0.18, 4, heartM), 0, -0.11, 0), PI, 0, 0)); h.visible = false; G.add(h); hearts.push(h); }
    const sweets = [];
    for (let i = 0; i < 40; i++) { const sw = i % 3 ? ico(0.05, 0, M(JAR[i % 6], { unlit: 0.4 })) : box(0.09, 0.05, 0.05, M(JAR[(i + 2) % 6], { unlit: 0.4 })); sw.visible = false; G.add(sw); sweets.push(sw); }
    const puffM = mat({ color: 0x8adf4a, unlit: 0.6, see: 0.45 }), puffs = [];
    for (let i = 0; i < 6; i++) { const p = ico(0.16, 1, puffM); p.visible = false; G.add(p); puffs.push(p); }

    return {
      group: G, sky: null, shadowCol: 0x160a1a, indoor: true,
      light() { lights(0x6a3a7a, 0xff8ad0, [0.2, -0.9, -0.4], 0x1a0c20, [16, 46], 7); },
      anim(t, P = {}) {
        const s = shotT(t, P), stopS = P.stop === true ? -1e9 : (typeof P.stop === 'number' ? P.stop : 1e9), stopped = s >= stopS;
        const bt = stopped && stopS > -1e8 ? beat(t - (s - stopS)) : stopped ? 0 : beat(t), shop = P.zone === 'shop';
        // the light: the club (magenta over the ring, teal by the walls, gold from the stage) or the shop (warm white)
        if (shop) { lights(0xd8b8c0, 0xfff0e0, [0.3, -0.9, -0.2], 0x3a2a30, [14, 40], 6); pt(0, -8.3, 2.6, 1.4, 1.2, 1.05, 0.9); pt(1, -6.6, 2.2, 1.4, 0.6, 0.35, 0.5); }
        else {
          lights(0x6a3a7a, 0xff8ad0, [0.2, -0.9, -0.4], 0x1a0c20, [16, 46], 7);
          const pulse = stopped ? 0.6 : 0.75 + 0.25 * Math.exp(-fr(bt) * 3);
          pt(0, C.RING[0], 3.0, C.RING[1] + 1.2, 1.15 * pulse, 0.45 * pulse, 0.85 * pulse);
          pt(1, 0, 2.4, -3.6, 0.9, 0.62, 0.28);
          pt(2, -4.6, 2.2, 1.0, 0.15, 0.55, 0.6); pt(3, 4.6, 2.2, -0.5, 0.25, 0.4, 0.7);
          if (ramp(P.door, s, 0) > 0.1) pt(3, -6.6, 1.6, C.DOOR[1], 0.9, 0.8, 0.7);
        }
        if (P.key) pt(3, P.key[0], P.key[1], P.key[2], P.key[3], P.key[4], P.key[5]);
        discs.forEach((d, i) => { d.scale.setScalar(stopped ? 0.9 : 0.92 + 0.12 * Math.exp(-fr(bt + (i % 5) * 0.2) * 4)); });
        ball.rotation.y = bt * 0.5;
        spots.forEach((q, i) => { const a = bt * 0.5 + i * 2.39, r = 1.0 + 3.2 * hash(i, 41); q.position.set(C.RING[0] + Math.sin(a) * r, 0.022, C.RING[1] + Math.cos(a) * r); q.visible = !shop; });
        vinyls.forEach(v => { v.rotation.y = bt * 2.2; });
        cones.forEach(c2 => { c2.scale.set(1, 1 + (stopped ? 0 : 0.5 * Math.exp(-fr(bt) * 6)), 1); });
        // the STOP button: pressed at `press` s (it sinks, a red ring flashes out)
        const pe = P.press != null ? s - P.press : -1;
        cap.position.y = pe >= 0 ? 0.095 : 0.13; flash.visible = pe >= 0 && pe < 0.35; if (flash.visible) flash.scale.setScalar(1 + pe * 5);
        // the chairs standing; the secret door
        const shown = P.chairs || C.CHAIR_A.map((_, i) => i);
        chairs.forEach((c2, i) => {
          c2.visible = shown.includes(i); const [x0, z0, a0] = chairPos(i); c2.position.set(x0, 0, z0); c2.rotation.set(0, a0, 0);
          const ko = (P.chairOut || []).find(q => q[0] === i); if (!ko) return;   // kicked out of the ring: [i, s0, dir deg, dist m]: it slides and hops away and topples onto its back, and lies there
          const u = sm((s - ko[1]) / (ko[4] || 0.45)), dr = rad(ko[2]); if (u <= 0) return;   // ko[4]: the flight's seconds
          c2.position.set(x0 + Math.sin(dr) * ko[3] * u, 0.55 * Math.sin(PI * u) * (ko[3] > 1.5 ? 1 : 0.3), z0 + Math.cos(dr) * ko[3] * u); c2.rotation.set(0, dr + PI, 0); c2.rotateX(-1.45 * u);
        });
        doorP.rotation.y = 1.75 * ramp(P.door, s, 0);
        // the players
        const ang = P.ang || players.map((_, i) => i * 60), walk = P.walk ?? 40, seats = P.seats || [];
        const circleAt = (i, ss) => { const a = rad(ang[i] + walk * ss); return [C.RING[0] + Math.sin(a) * C.WALK_R, C.RING[1] + Math.cos(a) * C.WALK_R, a]; };
        const seatAt = i => { const c = seats[i]; if (c == null || c < 0) return null; const [x, z, a] = chairPos(c); return [x + Math.sin(a) * 0.12, z + Math.cos(a) * 0.12, a]; };
        players.forEach((q, i) => {
          const mode = P.pmode ? P.pmode[i] : (P.players ?? false);
          q.g.visible = !!mode; q.pop.visible = mode === 'shop'; if (!mode) return;
          q.body.position.set(0, 0, 0); q.body.rotation.set(0, 0, 0); q.head.rotation.set(0, 0, 0); q.mouth.visible = false;
          q.arms.forEach(a => a.rotation.set(0, 0, 0)); q.legs.forEach(l => l.rotation.set(0, 0, 0));
          const ph = bt + (i % 3) * 0.33;
          const frozen = stopped && (mode === 'circle' || mode === 'dance' || mode === 'cheer');
          if (mode === 'circle' || mode === 'dance' || mode === 'cheer' || mode === 'stare') {
            let x, z, yaw;
            if (mode === 'circle') {
              const ss = stopped ? Math.max(0, stopS) : s, [cx, cz2, a] = circleAt(i, ss); x = cx; z = cz2; yaw = a + (walk >= 0 ? PI / 2 : -PI / 2);
              if (!frozen) { q.legs.forEach((l, j) => { l.rotation.x = 0.55 * Math.sin(ss * 9 + j * PI); }); q.body.position.y = 0.04 * Math.abs(Math.sin(ss * 9)); }
              q.arms.forEach((a2, j) => { a2.rotation.z = (j ? 1 : -1) * 2.45; });
            } else { const sp = (P.spots || [])[i]; if (sp) { x = sp[0]; z = sp[1]; } else { const c3 = circleAt(i, 0); x = c3[0]; z = c3[1]; } const tg = P.stare || [C.RING[0], C.RING[1] + 6]; yaw = Math.atan2(tg[0] - x, tg[1] - z); }
            if (cleared(P, x, z)) { q.g.visible = false; return; }
            q.g.position.set(x, 0, z); q.g.rotation.y = yaw;
            if (mode === 'dance' && !frozen) { const up = Math.abs(Math.sin(ph * PI)); q.body.position.y = 0.06 * up; q.body.rotation.z = 0.1 * Math.sin(ph * PI); q.arms.forEach((a2, j) => { a2.rotation.z = (j ? 1 : -1) * (2.4 + 0.3 * up); }); }
            if (mode === 'cheer') { q.arms.forEach((a2, j) => { a2.rotation.z = (j ? 1 : -1) * 2.55; }); q.mouth.visible = true; q.body.position.y = frozen ? 0 : 0.05 * Math.abs(Math.sin(bt * PI)); }
            if (mode === 'stare') q.mouth.visible = true;
            return;
          }
          if (mode === 'seated' || mode === 'scramble' || mode === 'hover') {
            const st = seatAt(i); if (!st) { q.g.visible = false; return; }
            let [x, z, a] = st, u = 1;
            if (mode === 'scramble') { const s0 = P.scrambleAt ?? 0, [cx, cz2] = circleAt(i, s0); u = sm((s - s0) / 0.35); x = cx + (x - cx) * u; z = cz2 + (z - cz2) * u; }
            q.g.position.set(x, 0, z); q.g.rotation.y = a;
            if (u > 0.6) { q.legs.forEach(l => l.rotation.set(-1.5, 0, 0)); q.body.position.y = C.SEAT_Y - 0.3; }
            else { q.legs.forEach((l, j) => { l.rotation.x = 0.8 * Math.sin(s * 14 + j * PI); }); q.arms.forEach((a2, j) => { a2.rotation.z = (j ? 1 : -1) * 2.6; }); }
            if (mode === 'hover') { q.body.position.y = C.SEAT_Y - 0.3 + 0.16; q.legs.forEach(l => l.rotation.set(-1.0, 0, 0)); q.arms.forEach((a2, j) => { a2.rotation.z = (j ? 1 : -1) * 1.2; }); q.mouth.visible = true; }
            if (P.stare) q.head.rotation.y = Math.max(-1.2, Math.min(1.2, Math.atan2(P.stare[0] - x, P.stare[1] - z) - a));
            return;
          }
          if (mode === 'shop') {
            const sp = C.SHOP_SPOTS[i % C.SHOP_SPOTS.length]; q.g.position.set(sp[0], 0, sp[1]); q.g.rotation.y = Math.atan2(C.DOOR[0] - sp[0], C.DOOR[1] - sp[1]) + (hash(i, 5) - 0.5);
            q.arms[1].rotation.set(-1.3 - 0.25 * Math.abs(Math.sin(s * 5 + i)), 0, 0.2); q.head.rotation.x = 0.1 * Math.sin(s * 5 + i);
          }
        });
        // hearts over points: three pink hearts popping and rising (looping when q[4])
        hearts.forEach((h, i) => {
          const q = (P.hearts || [])[Math.floor(i / 3)]; h.visible = false; if (!q) return;
          let e = s - q[3] - (i % 3) * 0.3; if (q[4] && e > 0) e %= 1.2;
          if (e < 0 || e > 1.4) return;
          h.visible = true; h.position.set(q[0] + ((i % 3) - 1) * 0.22 + 0.06 * Math.sin(e * 6 + i), q[1] + 0.55 * e, q[2]); h.scale.setScalar(Math.min(1, e * 5) * (1.15 - 0.25 * (e / 1.4)));
          h.rotation.y = (P.heartYaw ?? 0) * PI / 180;
        });
        // the candy burst: sweets flying out of a point in arcs, lying round it once landed
        const cb = P.candyBurst;
        sweets.forEach((sw, i) => {
          sw.visible = false; if (!cb) return; const e = s - cb[3]; if (e < 0) return;
          const a = hash(i, 51) * TAU, v = 1.2 + hash(i, 52) * 2.2, up = 1.5 + hash(i, 53) * 2.5, tl = (up + Math.sqrt(up * up + 19.6 * cb[1])) / 9.8, T2 = Math.min(e, tl);
          const y = Math.max(0.03, cb[1] + up * T2 - 4.9 * T2 * T2);
          sw.position.set(cb[0] + Math.cos(a) * v * T2, y, cb[2] + Math.sin(a) * v * T2); sw.rotation.set(T2 * 7 + i, T2 * 5, 0); sw.visible = true;
        });
        // dog breath: a green puff blown at a face on every beat
        const br = P.breath;
        puffs.forEach((p, i) => {
          p.visible = false; if (!br) return; const e = s - br[3]; if (e < 0) return;
          const per = 60 / 122.7011, k2 = fr(e / per + i / puffs.length), yw = rad(br[4] ?? 0);
          p.position.set(br[0] + Math.sin(yw) * k2 * 0.35 + (hash(i, 61) - 0.5) * 0.08, br[1] + k2 * 0.06, br[2] + Math.cos(yw) * k2 * 0.35); p.scale.setScalar(0.3 + k2 * 0.55); p.visible = k2 < 0.8;
        });
      },
    };
  }

  return { candyclub: candyclub() };
}
