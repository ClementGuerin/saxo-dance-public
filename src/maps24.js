// maps24.js: the "Bring Me To Life" map (2026-10-02, Evanescence; the clip: a gothic city at night in the rain, the
// singer asleep in a white nightgown sleepwalks out of her tower window onto the ledge, past lit windows (a party in
// clown masks, the band in a padded room), hangs over the drop, is caught by the wrists, falls, and wakes in bed). Ours,
// the sleepwalker: Saxo sleep-dances out of his window during a sleepover, along the ledge, across a crane's girder to
// the steel skeleton next door and onto the crane's hook, while his friends try to wake him. Same contract as the other
// map files, pure in t:
//   tower  one set at the ledge's height (y = 0), at night in the rain, or at dawn (`zone: 'dawn'`):
//          the facade of a gothic tower facing +z (its face at TOWER.FACE_Z), a 0.95 m stone ledge along it from X0 to
//          the corner at X1, Saxo's bedroom window in the middle (WIN, an opening WIN_W wide from SILL to WIN_TOP, red
//          curtains inside: `curtains` 0 open .. 1 drawn, or [s0, s1, a, b]; `blow` (default at night with the window
//          open) billows them out through it; `glass`: the window shut, panes in), the neighbours' party window to the
//          left (PARTY: three pets in clown masks dancing on the beat; `noguests` hides them), lit and dark windows on
//          every floor down to the street 45 m below (fogged), gothic towers, spires and domes all round, a moon.
//          Behind the window, the bedroom of the sleepover (ROOM; the bed against the left wall, BED, mattress top BED_Y,
//          its long side along z, the pillow at PILLOW_Z near the headboard at the back; the nightstand STAND with an alarm clock (`ring`: s or true, it
//          shakes and hops); Kob's armchair CHAIR (seat CHAIR_Y) and her lamp; two sleeping bags on the floor).
//          Past the corner (X1), a 3 m gap, then the steel skeleton of a tower going up next door (SKEL: columns on a
//          3 m grid (none on the middle line at its near end: the girder and the plank come in along it), I-beams along x
//          and z at y = 0 and LEVEL2, the middle line at BEAM_Z, steel decking round it at DECK [x0, x1, z0, z1]), and a tower crane (MAST)
//          whose jib runs along -x at JIB_Y over the gap and in front of the ledge (JIB_Z, over the void): its trolley at `trolley` (x, or [x0, x1] moved
//          over the shot, from `trolleyAt` s for `trolleyDur` s), the hook block on two cables down to `hookY` (default
//          1.76: the hook's tip; a number or [y0, y1] over the same time; the block's flat top, wide enough to stand
//          on, is BLOCK_TOP above the tip), `plank` (a scaffold board across the gap, PLANK x0-x1 at BEAM_Z), and with `girder` an I-beam (GIRDER_L long)
//          slung under it across the jib (along z, from JIB_Z - GIRDER_L / 2: its near end crosses the ledge's line), its
//          top at hookY - GIRDER_DROP (0.36 at the default: a step up from the ledge, clear of the beams and the plank).
//          Flags: `zone` ('night' | 'dawn'), `rain` (default at night; `rainAt` [x, y, z]: the streaks fall round that
//          point, the lens), `flash` ([s]: lightning), `douse` ([x0, y0, z0, x1, y1, z1, s, dur]: a bucketful of water
//          flung from p0 to p1, splashing there), `drips` ([[x, z, y]]: water dripping off a soaked character), `ring`,
//          `curtains`, `blow`, `glass`, `trolley`, `hookY`, `girder`, `hide` (['crane', 'girder', 'party', 'bags',
//          'chair']), `hearts` ([[x, y, z, s0]]: three pink hearts pop and rise from each), `noguests`, `clear` ([[x, z, r]]: no party pet there), `key` [x, y, z, r, g, b], `tucked` (the quilt over the sleeper in bed), `dripAt` (s: the drips start).
import { mapKit } from './mapkit.js';

export const TOWER = {
  FACE_Z: -0.5, LEDGE_Z: 0.45, X0: -7.2, X1: 6.5, WALL_T: 0.25, ROOF_Y: 9.6, STREET: -45,
  WIN: [0, -0.5], WIN_W: 1.6, SILL: 0.62, WIN_TOP: 2.45,
  PARTY: [-4.4, -0.5], PARTY_W: 1.5,
  ROOM: { x0: -3.0, x1: 3.0, z0: -6.4, H: 3.0 },
  BED: [-2.0, -3.2], BED_Y: 0.5, BED_L: 2.1, BED_W: 1.25, PILLOW_Z: -3.9,
  STAND: [-1.0, -4.6], CHAIR: [1.9, -4.6], CHAIR_Y: 0.42, BAGS: [[0.4, -5.6], [0.95, -2.4]],
  SKEL: [9.5, 12.5, 15.5], SKEL_Z: [-3.0, -0.05, 2.9], BEAM_Z: -0.05, LEVEL2: 3.2, BEAM_W: 0.3, DECK: [10.6, 13.4, -1.0, 0.95],
  MAST: [19.0, 1.0], JIB_Y: 6.0, JIB_X0: -3.0, JIB_Z: 1.0, HOOK_Y: 1.76, GIRDER_L: 3.2, GIRDER_DROP: 2.0, BLOCK_TOP: 1.6, PLANK: [6.2, 9.7],
};

export function buildTowerMaps(K) {
  const k = mapKit(K);
  const { THREE, mat, tex, px, noise, box, selfLit, TAU, PI, hash, beat, grad, cyl, cone, at, rot, flat, lights, pt, U } = k;
  const M = (c, o = {}) => mat({ color: c, ...o }), glow = c => mat({ color: c, unlit: 1 });
  const cl = x => Math.max(0, Math.min(1, x)), sm = x => { x = cl(x); return x * x * (3 - 2 * x); };
  const shotT = (t, P) => P.t0 != null ? t - P.t0 : 0;
  const shotLen = P => P.t1 != null && P.t0 != null ? P.t1 - P.t0 : 2;
  const cleared = (P, x, z) => (P.clear || []).some(([cx, cz, r]) => (x - cx) ** 2 + (z - cz) ** 2 < r * r);
  const hidden = (P, name) => (P.hide || []).includes(name);
  const ico = (r, d, m) => new THREE.Mesh(new THREE.IcosahedronGeometry(r, d), m);
  // a flag that is a value or [s0, s1, a, b] (from a to b between s0 and s1 s into the shot)
  const ramp = (v, s, dflt) => v == null ? dflt : Array.isArray(v) ? v[2] + (v[3] - v[2]) * sm((s - v[0]) / Math.max(0.01, v[1] - v[0])) : +v;
  // a moving flag [x0, x1] over the shot from `a0` s for `dur` s (linear, like an actor's mx/mz), or a plain number
  const glide = (v, s, len, a0, dur) => !Array.isArray(v) ? v : v[0] + (v[1] - v[0]) * cl((s - (a0 || 0)) / Math.max(0.01, dur ?? (len - (a0 || 0))));

  const T = TOWER, G = new THREE.Group();
  const { FACE_Z, LEDGE_Z, X0, X1, WALL_T, ROOF_Y, STREET } = T;

  // ---------- textures ----------
  const stoneT = tex(32, 32, (x, r) => { px(x, '#4a4350', 0, 0, 32, 32); noise(x, r, 32, 32, ['#433c49', '#544c5a', '#3d3644'], 160); for (let y = 0; y < 32; y += 8) px(x, '#38323f', 0, y, 32, 1); for (let y = 0; y < 32; y += 8) for (let q = (y / 8) % 2 ? 4 : 0; q < 32; q += 8) px(x, '#38323f', q, y, 1, 8); }, 2401);
  const ledgeT = tex(16, 16, (x, r) => { px(x, '#6a6270', 0, 0, 16, 16); noise(x, r, 16, 16, ['#5e5664', '#766e7c'], 50); px(x, '#4e4656', 0, 15, 16, 1); }, 2402);
  const wallpaperT = tex(16, 16, (x, r) => { px(x, '#7a2a38', 0, 0, 16, 16); for (let i = 0; i < 16; i += 8) for (let j = 0; j < 16; j += 8) { px(x, '#94384a', i + 3, j + 2, 2, 4); px(x, '#94384a', i + 2, j + 3, 4, 2); } noise(x, r, 16, 16, ['rgba(0,0,0,.12)'], 30); }, 2403);
  const woodT = tex(16, 16, (x, r) => { px(x, '#6a4428', 0, 0, 16, 16); for (let y = 0; y < 16; y += 4) px(x, '#583620', 0, y, 16, 1); noise(x, r, 16, 16, ['rgba(0,0,0,.1)', 'rgba(255,255,255,.05)'], 40); }, 2404);
  const steelT = tex(16, 16, (x, r) => { px(x, '#c4502c', 0, 0, 16, 16); noise(x, r, 16, 16, ['#b04628', '#d05c34', '#a8401f'], 60); }, 2405);
  const latticeT = tex(16, 16, x => { px(x, '#f2c21a', 0, 0, 16, 16); px(x, '#2a2420', 2, 2, 12, 12); px(x, '#f2c21a', 2, 2, 12, 2); px(x, '#f2c21a', 2, 12, 12, 2); for (let i = 0; i < 12; i++) px(x, '#f2c21a', 2 + i, 2 + i, 2, 1); }, 2406);
  const stoneM = mat({ map: stoneT, rep: [1, 1] }), ledgeM = mat({ map: ledgeT, rep: [8, 1] }), steelM = mat({ map: steelT, rep: [1, 6] });
  const darkWin = M(0x1a1e2c), litWin = mat({ color: 0xe0b070, unlit: 0.8 }), cyanWin = mat({ color: 0x4aa8b8, unlit: 0.8 }), frameM = M(0x4a3228), trimM = M(0x6a6272);

  // ---------- the facade, with holes for the bedroom's and the party's windows ----------
  const facadeG = new THREE.Group(); G.add(facadeG);
  const zc = FACE_Z - WALL_T / 2;
  const wallBox = (xa, xb, ya, yb) => { if (xb - xa < 0.01 || yb - ya < 0.01) return; const m = mat({ map: stoneT, rep: [(xb - xa) / 1.6, (yb - ya) / 1.6] }); facadeG.add(at(box(xb - xa, yb - ya, WALL_T, m), (xa + xb) / 2, (ya + yb) / 2, zc)); };
  const holes = [[T.PARTY[0] - T.PARTY_W / 2, T.PARTY[0] + T.PARTY_W / 2], [T.WIN[0] - T.WIN_W / 2, T.WIN[0] + T.WIN_W / 2]];
  let xa = X0;
  for (const [h0, h1] of holes) { wallBox(xa, h0, STREET, ROOF_Y); wallBox(h0, h1, STREET, T.SILL); wallBox(h0, h1, T.WIN_TOP, ROOF_Y); xa = h1; }
  wallBox(xa, X1, STREET, ROOF_Y);
  // the tower's other sides and roof (the bedroom sits inside it), a steep slate roof, spires on the corners
  const sideM = mat({ map: stoneT, rep: [11.5 / 1.6, (ROOF_Y - STREET) / 1.6] });
  facadeG.add(at(box(WALL_T, ROOF_Y - STREET, 11.5, sideM), X1 - WALL_T / 2, (ROOF_Y + STREET) / 2, FACE_Z - 5.75));
  facadeG.add(at(box(WALL_T, ROOF_Y - STREET, 11.5, sideM), X0 + WALL_T / 2, (ROOF_Y + STREET) / 2, FACE_Z - 5.75));
  facadeG.add(at(box(X1 - X0, ROOF_Y - STREET, WALL_T, mat({ map: stoneT, rep: [(X1 - X0) / 1.6, (ROOF_Y - STREET) / 1.6] })), (X0 + X1) / 2, (ROOF_Y + STREET) / 2, FACE_Z - 11.5));
  const slate = M(0x2a2e3e);
  const roofM = cone((X1 - X0) * 0.74, 9, 4, slate); roofM.rotation.y = PI / 4; roofM.scale.set(1, 1, 11.5 / (X1 - X0)); facadeG.add(at(roofM, (X0 + X1) / 2, ROOF_Y + 4.5, FACE_Z - 5.75));
  for (const [sx, sz] of [[X0, FACE_Z], [X1, FACE_Z], [X0, FACE_Z - 11.5], [X1, FACE_Z - 11.5]]) { facadeG.add(at(box(1.1, 3.2, 1.1, stoneM), sx, ROOF_Y + 1.6, sz)); facadeG.add(at(cone(0.8, 4.2, 4, slate), sx, ROOF_Y + 5.3, sz)); }
  facadeG.add(at(box(X1 - X0 + 0.4, 0.45, 0.5, trimM), (X0 + X1) / 2, ROOF_Y, FACE_Z + 0.1));   // the cornice
  // the ledge: a stone slab along the facade, corbels under it every 1.2 m; a thinner string course on every floor below
  facadeG.add(at(box(X1 - X0, 0.28, LEDGE_Z - FACE_Z, ledgeM), (X0 + X1) / 2, -0.14, (FACE_Z + LEDGE_Z) / 2));
  for (let x = X0 + 0.5; x < X1; x += 1.2) facadeG.add(at(box(0.22, 0.45, 0.7, trimM), x, -0.5, FACE_Z + 0.35));
  for (let f = -1; f >= -12; f--) facadeG.add(at(box(X1 - X0, 0.16, 0.22, trimM), (X0 + X1) / 2, f * 3.4, FACE_Z + 0.11));
  // windows painted on the other floors (warm, now and then cyan like the clip's, or dark), a stone lintel over each (pointed
  // heads made of cones read as black arrows, 2026-10-02); the two real ones on ours
  const lintel = w => box(w + 0.24, 0.16, 0.12, trimM);
  for (let f = -12; f <= 2; f++) for (const wx of [-5.6, -3.6, -1.6, 0, 1.6, 3.6, 5.4]) {
    if (f === 0 && [[T.WIN[0], T.WIN_W], [T.PARTY[0], T.PARTY_W]].some(([hx, hw]) => Math.abs(wx - hx) < hw / 2 + 0.55)) continue;
    if (f === 2 && Math.abs(wx) > 5) continue;
    const y0 = f * 3.4 + T.SILL, r = hash(f + 20, wx * 3), m = r < 0.5 ? litWin : r < 0.62 ? cyanWin : darkWin;
    facadeG.add(at(box(0.8, 1.4, 0.06, m), wx, y0 + 0.75, FACE_Z + 0.02)); facadeG.add(at(box(0.98, 0.12, 0.12, trimM), wx, y0 - 0.04, FACE_Z + 0.05));
    facadeG.add(at(lintel(0.8), wx, y0 + 1.55, FACE_Z + 0.05));
  }
  // our floor's two real openings: frames and pointed heads
  const winFrame = (cx, w) => {
    const g = new THREE.Group();
    for (const sx of [-1, 1]) g.add(at(box(0.1, T.WIN_TOP - T.SILL + 0.1, 0.32, frameM), cx + sx * (w / 2 + 0.03), (T.SILL + T.WIN_TOP) / 2, FACE_Z - 0.1));
    g.add(at(box(w + 0.26, 0.12, 0.4, trimM), cx, T.SILL - 0.05, FACE_Z - 0.06)); g.add(at(box(w + 0.2, 0.1, 0.32, frameM), cx, T.WIN_TOP + 0.04, FACE_Z - 0.1));
    g.add(at(lintel(w + 0.2), cx, T.WIN_TOP + 0.16, FACE_Z + 0.02)); return g;
  };
  facadeG.add(winFrame(T.WIN[0], T.WIN_W)); facadeG.add(winFrame(T.PARTY[0], T.PARTY_W));

  // ---------- the bedroom (behind our window) ----------
  const R = T.ROOM, room = new THREE.Group(); G.add(room);
  const zIn = FACE_Z - WALL_T, D = zIn - R.z0;
  room.add(flat(R.x1 - R.x0, D, mat({ map: woodT, rep: [(R.x1 - R.x0) / 1.4, D / 1.4] }), (R.x0 + R.x1) / 2, 0, (zIn + R.z0) / 2));
  const wp = (w, h) => mat({ map: wallpaperT, rep: [w / 1.2, h / 1.2] });
  room.add(at(new THREE.Mesh(new THREE.PlaneGeometry(R.x1 - R.x0, R.H), wp(R.x1 - R.x0, R.H)), (R.x0 + R.x1) / 2, R.H / 2, R.z0));
  room.add(rot(at(new THREE.Mesh(new THREE.PlaneGeometry(D, R.H), wp(D, R.H)), R.x0, R.H / 2, (zIn + R.z0) / 2), 0, PI / 2, 0));
  room.add(rot(at(new THREE.Mesh(new THREE.PlaneGeometry(D, R.H), wp(D, R.H)), R.x1, R.H / 2, (zIn + R.z0) / 2), 0, -PI / 2, 0));
  const ceil = new THREE.Mesh(new THREE.PlaneGeometry(R.x1 - R.x0, D), M(0x5a4a50)); ceil.rotation.x = PI / 2; room.add(at(ceil, (R.x0 + R.x1) / 2, R.H, (zIn + R.z0) / 2));
  room.add(at(box(R.x1 - R.x0, 0.12, 0.04, M(0x2a1a1e)), (R.x0 + R.x1) / 2, 0.06, R.z0 + 0.02));   // a skirting board
  // the bed under the window: a dark carved frame, white sheets (the clip's), a white pillow at -x, a duvet
  const { BED, BED_Y, BED_L, BED_W } = T, bed = new THREE.Group(); room.add(bed); bed.position.set(BED[0], 0, BED[1]); bed.rotation.y = -PI / 2;   // local -x (the headboard) to world -z
  const bedWood = M(0x3a2420), sheet = M(0xf2eee8), duvet = M(0xe8e2ea);
  bed.add(at(box(BED_L, 0.3, BED_W, bedWood), 0, 0.15, 0)); bed.add(at(box(BED_L - 0.08, 0.2, BED_W - 0.08, sheet), 0, BED_Y - 0.1, 0));
  bed.add(at(box(0.12, 1.15, BED_W + 0.04, bedWood), -BED_L / 2 - 0.02, 0.58, 0));
  for (const s of [-1, 1]) bed.add(at(cone(0.2, 0.32, 4, bedWood), -BED_L / 2 - 0.02, 1.3, s * (BED_W / 2 - 0.05)));
  bed.add(at(box(0.12, 0.75, BED_W + 0.04, bedWood), BED_L / 2 + 0.02, 0.38, 0));
  bed.add(at(box(0.5, 0.14, 0.75, M(0xffffff)), T.PILLOW_Z - BED[1], BED_Y + 0.06, 0));
  const duv = at(box(1.15, 0.1, BED_W - 0.04, duvet), 0.4, BED_Y + 0.02, 0); bed.add(duv);
  const quilt = at(box(1.55, 0.5, BED_W - 0.02, M(0xc8b8e8)), 0.22, BED_Y + 0.24, 0); bed.add(quilt);   // `tucked`: the quilt pulled up over the sleeper to the chin
  // the nightstand with the alarm clock, Kob's armchair and lamp, the sleeping bags, a rug, two gothic posters
  const stand = new THREE.Group(); room.add(stand); stand.position.set(T.STAND[0], 0, T.STAND[1]);
  stand.add(at(box(0.5, 0.55, 0.45, bedWood), 0, 0.275, 0));
  const clock = new THREE.Group(); stand.add(clock); clock.position.set(0.02, 0.55, 0.05);
  const clockBody = new THREE.Group(); clock.add(clockBody);
  {
    const red = M(0xe0282e), face = M(0xfaf6ee), ink = M(0x141414), dark = M(0x2a2a30);
    const c = cyl(0.12, 0.12, 0.08, 10, red); c.rotation.x = PI / 2; clockBody.add(at(c, 0, 0.17, 0));
    const f = cyl(0.1, 0.1, 0.01, 10, face); f.rotation.x = PI / 2; clockBody.add(at(f, 0, 0.17, 0.042));
    clockBody.add(at(box(0.012, 0.075, 0.01, ink), 0, 0.2, 0.05)); clockBody.add(rot(at(box(0.01, 0.06, 0.01, ink), 0.02, 0.165, 0.05), 0, 0, -1.2));
    for (const s of [-1, 1]) { clockBody.add(at(ico(0.065, 1, M(0xd8d8e0)), s * 0.085, 0.3, 0)); clockBody.add(rot(at(box(0.025, 0.09, 0.025, dark), s * 0.07, 0.04, 0), 0, 0, s * 0.4)); }
    clockBody.add(at(box(0.02, 0.06, 0.02, dark), 0, 0.31, 0));
    for (const s of [-1, 1]) for (let q = 0; q < 3; q++) { const l = rot(at(box(0.014, 0.065, 0.05, mat({ color: 0xffffff, unlit: 1 })), s * (0.19 + q * 0.022), 0.33 - q * 0.06, 0), 0, 0, s * (0.5 + q * 0.45)); l.userData.ring = true; clockBody.add(l); }   // the ringing strokes (a still reads them)
  }
  clock.scale.setScalar(1.6);
  const chair = new THREE.Group(); room.add(chair); chair.position.set(T.CHAIR[0], 0, T.CHAIR[1]); chair.rotation.y = -0.45;
  {
    const vel = M(0x2e5a4a), leg = M(0x2a1a14);
    chair.add(at(box(0.9, 0.22, 0.8, vel), 0, T.CHAIR_Y - 0.11, 0)); chair.add(at(box(0.9, 0.85, 0.2, vel), 0, 0.72, -0.42));
    for (const s of [-1, 1]) chair.add(at(box(0.18, 0.42, 0.8, vel), s * 0.48, 0.5, 0));
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) chair.add(at(box(0.07, 0.12, 0.07, leg), sx * 0.38, 0.06, sz * 0.32));
  }
  const lamp = new THREE.Group(); room.add(lamp); lamp.position.set(T.CHAIR[0] + 0.62, 0, T.CHAIR[1] - 0.55);
  lamp.add(at(cyl(0.025, 0.025, 1.5, 5, M(0x2a2a30)), 0, 0.75, 0)); lamp.add(at(cyl(0.16, 0.24, 0.3, 8, glow(0xffd890)), 0, 1.55, 0)); lamp.add(at(cyl(0.2, 0.2, 0.03, 8, M(0x2a2a30)), 0, 0.015, 0));
  const bags = new THREE.Group(); room.add(bags);
  T.BAGS.forEach(([bx, bz], i) => { bags.add(at(box(0.75, 0.12, 1.7, M([0x5a7ae0, 0xe06a8a][i])), bx, 0.06, bz)); bags.add(at(box(0.55, 0.12, 0.35, M(0xffffff)), bx, 0.16, bz - 0.62)); });
  room.add(flat(2.6, 1.8, M(0x4a2a5a), 0.4, 0.004, -3.9));
  const posterT = tex(16, 24, x => { px(x, '#141018', 0, 0, 16, 24); px(x, '#c8c0d8', 6, 4, 4, 4); px(x, '#c8c0d8', 5, 9, 6, 9); px(x, '#8a1a2a', 2, 20, 12, 2); }, 2407);
  room.add(at(new THREE.Mesh(new THREE.PlaneGeometry(0.7, 1.0), mat({ map: posterT })), -1.0, 1.7, R.z0 + 0.01));
  room.add(at(new THREE.Mesh(new THREE.PlaneGeometry(0.6, 0.85), mat({ map: posterT, color: 0xd8c8ff })), 1.0, 1.75, R.z0 + 0.01));
  // the red curtains: two panels hanging inside the window, each pivoting at its top: drawn, open or billowing out
  const curtM = mat({ color: 0xb01828, side: THREE.DoubleSide }), CH = T.WIN_TOP - T.SILL + 0.45;
  const curts = [-1, 1].map(s => {
    const piv = new THREE.Group(); piv.position.set(T.WIN[0], T.WIN_TOP + 0.12, zIn - 0.06); room.add(piv);
    const panel = at(box(0.95, CH, 0.04, curtM), 0, -CH / 2, 0); piv.add(panel);
    for (let q = 0; q < 3; q++) panel.add(at(box(0.05, CH, 0.06, M(0x8a1020)), -0.3 + q * 0.3, 0, 0.01));
    return { piv, panel, s };
  });
  room.add(at(box(T.WIN_W + 1.4, 0.05, 0.05, M(0x2a2228)), T.WIN[0], T.WIN_TOP + 0.14, zIn - 0.06));   // the rail
  const glass = new THREE.Group(); room.add(glass);
  {
    const gm = mat({ color: 0xa8c0d8, see: 0.82, unlit: 0.2 }), hy = (T.SILL + T.WIN_TOP) / 2;
    glass.add(at(box(T.WIN_W - 0.04, T.WIN_TOP - T.SILL, 0.02, gm), T.WIN[0], hy, FACE_Z - 0.08));
    glass.add(at(box(0.05, T.WIN_TOP - T.SILL, 0.05, frameM), T.WIN[0], hy, FACE_Z - 0.07)); glass.add(at(box(T.WIN_W, 0.05, 0.05, frameM), T.WIN[0], hy + 0.2, FACE_Z - 0.07));
  }
  const sash = new THREE.Group(); room.add(sash);   // the open window: its two casements swung in against the reveals
  for (const s of [-1, 1]) sash.add(rot(at(box(T.WIN_W / 2 - 0.04, T.WIN_TOP - T.SILL - 0.05, 0.04, frameM), T.WIN[0] + s * (T.WIN_W / 2 - 0.04), (T.SILL + T.WIN_TOP) / 2, zIn - 0.3), 0, s * 1.35, 0));

  // ---------- the party next door: a warm room behind the left window, three pets in clown masks ----------
  const party = new THREE.Group(); G.add(party);
  {
    const px0 = T.PARTY[0] - 1.25, px1 = Math.min(T.PARTY[0] + 1.0, R.x0 - 0.15), pz0 = zIn - 2.6, warm = M(0x8a4a3a), dd = zIn - pz0;
    party.add(flat(px1 - px0, dd, M(0x5a3020), (px0 + px1) / 2, 0, (zIn + pz0) / 2));
    party.add(at(new THREE.Mesh(new THREE.PlaneGeometry(px1 - px0, 3), warm), (px0 + px1) / 2, 1.5, pz0));
    party.add(rot(at(new THREE.Mesh(new THREE.PlaneGeometry(dd, 3), warm), px0, 1.5, (zIn + pz0) / 2), 0, PI / 2, 0));
    party.add(rot(at(new THREE.Mesh(new THREE.PlaneGeometry(dd, 3), warm), px1, 1.5, (zIn + pz0) / 2), 0, -PI / 2, 0));
    const pc = new THREE.Mesh(new THREE.PlaneGeometry(px1 - px0, dd), M(0x2a1814)); pc.rotation.x = PI / 2; party.add(at(pc, (px0 + px1) / 2, 3, (zIn + pz0) / 2));
    for (let q = 0; q < 6; q++) party.add(at(ico(0.12, 0, glow([0xff5a7a, 0xffd21f, 0x5ad6e4][q % 3])), px0 + 0.3 + q * 0.38, 2.6 - (q % 2) * 0.15, pz0 + 0.3));   // balloons
  }
  const clowns = [0, 1, 2].map(i => {
    const g = new THREE.Group(), body = new THREE.Group(); g.add(body);
    const suit = M([0x7a3ad8, 0x2fae6a, 0xe8a020][i]);
    body.add(at(box(0.42, 0.5, 0.3, suit), 0, 0.42, 0));
    const head = at(new THREE.Group(), 0, 0.92, 0); body.add(head);
    head.add(ico(0.24, 1, M(0xf6f4f0)));                                           // a white clown mask
    head.add(at(ico(0.06, 0, glow(0xff2a2a)), 0, -0.03, 0.23));                   // the red nose
    for (const e of [-1, 1]) { head.add(at(box(0.06, 0.09, 0.02, M(0x1a1a2a)), e * 0.09, 0.06, 0.21)); head.add(at(ico(0.16, 0, M([0xff4a2a, 0x3a8aff, 0xff3a9a][i])), e * 0.2, 0.12, -0.02)); }   // the eyes, the wig's tufts
    head.add(at(box(0.16, 0.03, 0.02, M(0xd01828)), 0, -0.12, 0.21));            // the painted smile
    const arms = [-1, 1].map(s => { const a = at(new THREE.Group(), s * 0.26, 0.62, 0); a.add(at(box(0.1, 0.32, 0.1, suit), 0, -0.14, 0)); body.add(a); return a; });
    g.position.set(T.PARTY[0] - 0.55 + i * 0.55, 0, zIn - 0.9 - (i % 2) * 0.35); party.add(g);
    return { g, body, head, arms, i };
  });

  // ---------- the steel skeleton next door, the gap, the tower crane ----------
  const skel = new THREE.Group(); G.add(skel);
  const ibeam = (len, axis) => {
    const g = new THREE.Group(), W = T.BEAM_W;
    const fl = axis === 'x' ? [len, 0.05, W] : [W, 0.05, len], web = axis === 'x' ? [len, 0.22, 0.05] : [0.05, 0.22, len];
    g.add(at(box(...fl, steelM), 0, -0.025, 0)); g.add(at(box(...fl, steelM), 0, -0.275, 0)); g.add(at(box(...web, steelM), 0, -0.15, 0)); return g;
  };
  const [sx0, , sx1] = T.SKEL, [sz0, , sz1] = T.SKEL_Z, colTop = T.LEVEL2 + 3.4;
  for (const x of T.SKEL) for (const z of T.SKEL_Z) if (!(z === T.BEAM_Z && x === T.SKEL[0]) && z !== T.SKEL_Z[2]) skel.add(at(box(0.3, colTop - STREET, 0.3, mat({ map: steelT, rep: [1, (colTop - STREET) / 1.5] })), x, (colTop + STREET) / 2, z));
  for (const y of [0, T.LEVEL2, -3.4, -6.8]) {
    for (const z of T.SKEL_Z) skel.add(at(ibeam(sx1 - sx0 + 0.3, 'x'), (sx0 + sx1) / 2, y, z));
    for (const x of T.SKEL) skel.add(at(ibeam(sz1 - sz0 + 0.3, 'z'), x, y, (sz0 + sz1) / 2));
  }
  skel.add(at(box(1.6, 0.06, 0.32, mat({ map: woodT, rep: [2, 1] })), 14.0, 0.03, sz0));   // a loose plank
  const deckT = tex(16, 16, (x, r) => { px(x, '#8a8e98', 0, 0, 16, 16); for (let i = 0; i < 16; i += 4) px(x, '#6e727c', i, 0, 1, 16); noise(x, r, 16, 16, ['rgba(0,0,0,.1)'], 30); }, 2408);
  skel.add(at(box(T.DECK[1] - T.DECK[0], 0.04, T.DECK[3] - T.DECK[2], mat({ map: deckT, rep: [3, 2] })), (T.DECK[0] + T.DECK[1]) / 2, 0.02, (T.DECK[2] + T.DECK[3]) / 2));   // steel decking laid round the middle beam: where the friends stand
  const plank = at(box(T.PLANK[1] - T.PLANK[0], 0.05, 0.36, mat({ map: woodT, rep: [4, 1] })), (T.PLANK[0] + T.PLANK[1]) / 2, 0.025, T.BEAM_Z); G.add(plank);   // the scaffold board across the gap
  const workLight = new THREE.Group(); skel.add(workLight); workLight.position.set(sx1, T.LEVEL2 + 1.2, sz0); workLight.rotation.y = -0.7;
  workLight.add(at(box(0.5, 0.35, 0.2, M(0x2a2a30)), 0, 0, 0)); workLight.add(at(box(0.42, 0.27, 0.04, glow(0xfff4d8)), 0, 0, 0.11));
  // the crane: a lattice mast, the cab, the jib along -x over the gap and the ledge, the counter-jib with its weights
  const crane = new THREE.Group(); G.add(crane);
  const latM = (rx, ry) => mat({ map: latticeT, rep: [rx, ry] });
  const [mx, mz] = T.MAST, JY = T.JIB_Y, jibL = mx - T.JIB_X0;
  crane.add(at(box(1.2, JY - STREET, 1.2, latM(1, (JY - STREET) / 1.2)), mx, (JY + STREET) / 2, mz));
  crane.add(at(box(1.6, 1.4, 1.6, M(0xf2c21a)), mx, JY + 0.7, mz));
  crane.add(rot(at(box(0.9, 0.7, 0.05, glow(0x9ad0f0)), mx - 0.81, JY + 0.8, mz), 0, PI / 2, 0));   // the cab's window
  crane.add(at(cone(0.7, 3.2, 4, latM(1, 2)), mx, JY + 3.0, mz));
  crane.add(at(box(jibL, 0.9, 0.8, latM(jibL, 1)), (mx + T.JIB_X0) / 2, JY + 0.45, T.JIB_Z));
  crane.add(at(box(7, 0.7, 0.8, latM(7, 1)), mx + 3.5, JY + 0.35, T.JIB_Z));
  for (let q = 0; q < 3; q++) crane.add(at(box(0.9, 1.3, 1.0, M(0x8a8a90)), mx + 4.8 + q * 0.95, JY - 0.4, T.JIB_Z));
  for (const s of [-1, 1]) {   // the ties from the apex to the jib and the counter-jib
    const a = new THREE.Vector3(mx, JY + 4.5, T.JIB_Z), b = new THREE.Vector3(s < 0 ? T.JIB_X0 + 6 : mx + 6.5, JY + 0.9, T.JIB_Z), d = b.clone().sub(a);
    const tie = box(0.04, 0.04, d.length(), M(0x3a3a40)); tie.position.copy(a).add(b).multiplyScalar(0.5); tie.lookAt(b); crane.add(tie);
  }
  const trolley = at(box(0.7, 0.3, 0.9, M(0x2a2a30)), 0, JY - 0.15, T.JIB_Z); crane.add(trolley);
  const cables = [-1, 1].map(s => { const c = at(box(0.03, 1, 0.03, M(0x1a1a1e)), 0, 0, T.JIB_Z - 0.22); c.userData.dx = s * 0.22; crane.add(c); return c; });   // at the block's back corners: the one dancing on it stands in front of them
  const hook = new THREE.Group(); crane.add(hook);
  const hazT = tex(16, 16, x => { px(x, '#f2c21a', 0, 0, 16, 16); for (let i = -16; i < 16; i += 6) for (let y = 0; y < 16; y++) px(x, '#1a1a1e', i + y, y, 3, 1); }, 2409);   // black and yellow hazard stripes (two dark sheave ends on its face read as eyes)
  hook.add(at(box(0.66, 0.6, 0.52, mat({ map: hazT, rep: [1, 1] })), 0, T.BLOCK_TOP - 0.3, 0)); hook.add(at(box(0.7, 0.05, 0.56, M(0xf2c21a)), 0, T.BLOCK_TOP - 0.02, 0));   // a big block: he can dance on its top
  {
    const hk = new THREE.Mesh(new THREE.TorusGeometry(0.14, 0.035, 5, 10, PI * 1.35), M(0x3a3a42)); hk.rotation.z = PI * 0.82;
    hook.add(at(hk, 0, 0.18, 0)); hook.add(at(box(0.07, T.BLOCK_TOP - 0.86, 0.07, M(0xb8bcc8)), 0, 0.33 + (T.BLOCK_TOP - 0.86) / 2 - 0.1, 0));   // the shank: a pet hanging by the collar keeps her ears clear of the block
  }
  const girder = new THREE.Group(); crane.add(girder);
  girder.add(ibeam(T.GIRDER_L, 'z'));
  const slings = [-1, 1].map(s => { const sl = box(0.025, 1, 0.025, M(0x1a1a1e)); girder.add(sl); return { sl, s }; });

  // ---------- the city: gothic towers all round, the street far below, the moon ----------
  const city = new THREE.Group(); G.add(city);
  const cityT = [0, 1, 2].map(i => tex(32, 32, (x, r) => {
    px(x, ['#2e2834', '#3a3036', '#28303a'][i], 0, 0, 32, 32); noise(x, r, 32, 32, ['rgba(0,0,0,.2)'], 80);
    for (let yy = 2; yy < 30; yy += 6) for (let xx = 2; xx < 30; xx += 5) { const q = r(); x.fillStyle = q < 0.3 ? 'rgba(255,207,122,0.85)' : q < 0.42 ? 'rgba(90,214,228,0.85)' : '#14161e'; x.fillRect(xx, yy, 3, 4); }
    selfLit(x, 32, 32);
  }, 2410 + i));
  const C0 = [5, -2];
  for (let i = 0; i < 46; i++) {
    const a = hash(i, 41) * TAU, d = 26 + hash(i, 42) * 80, x = C0[0] + Math.sin(a) * d, z = C0[1] - Math.cos(a) * d;
    if (z > 18 && Math.abs(x - C0[0]) < 30) continue;   // keep the view down to the street open in front of the ledge
    const w = 6 + hash(i, 43) * 9, dd = 6 + hash(i, 44) * 9, top = -8 + hash(i, 45) * 50, h = top - STREET;
    city.add(at(box(w, h, dd, mat({ map: cityT[i % 3], rep: [w / 6, h / 6] })), x, (top + STREET) / 2, z));
    const kind = i % 4, rm = M(0x22263a);
    if (kind === 0) city.add(at(rot(cone(Math.max(w, dd) * 0.72, 6 + hash(i, 46) * 8, 4, rm), 0, PI / 4, 0), x, top + 4, z));
    else if (kind === 1) { city.add(at(new THREE.Mesh(new THREE.SphereGeometry(Math.min(w, dd) * 0.45, 10, 6, 0, TAU, 0, PI / 2), M(0x3a5a5a)), x, top, z)); city.add(at(cone(0.3, 3, 4, rm), x, top + Math.min(w, dd) * 0.45 + 1.4, z)); }
    else if (kind === 2) for (const sxx of [-1, 1]) city.add(at(cone(1.0, 7, 4, rm), x + sxx * w * 0.35, top + 3.5, z));
  }
  city.add(flat(400, 400, M(0x1a1c24), 0, STREET, 0));
  const lampM = mat({ color: 0xffd890, unlit: 1, nofog: 1 });   // nofog: the street lamps far below read through the night (the drop, from the ledge)
  for (let i = 0; i < 60; i++) city.add(at(box(1.0, 0.4, 1.0, lampM), -70 + i * 3.4, STREET + 4, 6 + (i % 3) * 7));
  for (let i = 0; i < 24; i++) city.add(at(box(1.0, 0.4, 1.0, lampM), 12 + (i % 2) * 6, STREET + 4, -40 + i * 3.6));
  const cars = []; for (let i = 0; i < 14; i++) { const c = at(box(2.4, 0.6, 1.3, mat({ color: i % 2 ? 0xff3a3a : 0xfff0c8, unlit: 1, nofog: 1 })), 0, STREET + 0.4, 9 + (i % 3) * 3.5); city.add(c); cars.push(c); }
  // the sky: a stormy night dome, a moon behind drifting clouds; dawn swaps the dome and shows the sun
  const nightT = grad([[0, '#05060e'], [0.45, '#121a30'], [0.8, '#2a3048'], [1, '#3a3a52']]);
  const dawnT = grad([[0, '#3a4a8a'], [0.45, '#c88aa0'], [0.75, '#ffb48a'], [1, '#ffd8a0']]);
  const nightDome = new THREE.Mesh(new THREE.SphereGeometry(190, 16, 10), mat({ map: nightT, unlit: 1, nofog: 1, side: THREE.BackSide })); G.add(nightDome);
  const dawnDome = new THREE.Mesh(new THREE.SphereGeometry(189, 16, 10), mat({ map: dawnT, unlit: 1, nofog: 1, side: THREE.BackSide })); G.add(dawnDome);
  const moon = at(new THREE.Mesh(new THREE.CircleGeometry(13, 16), mat({ color: 0xe8ecf4, unlit: 1, nofog: 1 })), -55, 70, -150); moon.lookAt(0, 0, 0); G.add(moon);
  const sun = at(new THREE.Mesh(new THREE.CircleGeometry(11, 16), mat({ color: 0xfff0c0, unlit: 1, nofog: 1 })), 30, 18, 160); sun.lookAt(0, 0, 0); G.add(sun);
  const clouds = [];
  for (let i = 0; i < 10; i++) { const c = new THREE.Group(); for (let q = 0; q < 3; q++) c.add(at(box(14 + hash(i, q) * 12, 3 + hash(i, q + 3) * 2, 6, M(0x2a2e40, { unlit: 0.5, nofog: 1 })), (q - 1) * 9, q === 1 ? 1.5 : 0, 0)); c.position.set(-120 + i * 26, 45 + hash(i, 7) * 25, -110 - hash(i, 8) * 40); G.add(c); clouds.push(c); }

  // ---------- rain, water, drips ----------
  const rainM = M(0xb8c8e8, { unlit: 0.6 }), rainG = new THREE.BoxGeometry(0.012, 0.22, 0.012);
  const rain = []; for (let i = 0; i < 420; i++) { const p = new THREE.Mesh(rainG, rainM); G.add(p); rain.push(p); }
  const waterM = M(0xbfe8ff, { unlit: 0.8 }), drops = [], drip = [];
  for (let i = 0; i < 70; i++) { const d = ico(0.022 + hash(i, 51) * 0.03, 0, waterM); d.visible = false; G.add(d); drops.push(d); }
  for (let i = 0; i < 24; i++) { const d = ico(0.03, 0, waterM); d.visible = false; G.add(d); drip.push(d); }
  const heartM = M(0xff4f9a, { unlit: 0.8 }), hearts = [];   // two balls and a cone tip (the noir map's): a texture's clear pixels would draw black here
  for (let i = 0; i < 6; i++) { const h = new THREE.Group(); h.add(at(ico(0.1, 0, heartM), -0.075, 0, 0)); h.add(at(ico(0.1, 0, heartM), 0.075, 0, 0)); const tip = at(cone(0.125, 0.18, 4, heartM), 0, -0.11, 0); tip.rotation.x = PI; h.add(tip); h.visible = false; G.add(h); hearts.push(h); }
  const puddleM = mat({ color: 0x9fd4f4, unlit: 0.5 }), puddles = []; for (let i = 0; i < 3; i++) { const p = flat(1, 1, puddleM, 0, 0.012, 0); p.visible = false; G.add(p); puddles.push(p); }
  const flashOf = (P, s) => (P.flash || []).reduce((m, f) => { const e = s - f; return e >= 0 && e < 0.35 ? Math.max(m, e < 0.06 ? 1 : e < 0.12 ? 0.3 : e < 0.18 ? 0.8 : Math.exp(-(e - 0.18) * 14)) : m; }, 0);
  const WHITE = new THREE.Color(0xdfe8ff), _a = new THREE.Vector3(), _b = new THREE.Vector3(), _up = new THREE.Vector3(0, 1, 0);

  return {
    tower: {
      group: G, sky: nightT, shadowCol: 0x2a2436,
      light() { lights(0x5a6488, 0xb0bce0, [0.3, -0.7, -0.6], 0x1a2032, [20, 110], 9); pt(0, T.WIN[0], 1.5, FACE_Z + 0.05, 0.85, 0.62, 0.38); pt(1, 0.9, 2.1, -3.6, 0.9, 0.72, 0.5); pt(2, sx1 + 0.3, T.LEVEL2 + 1.2, sz0 + 0.6, 0.7, 0.68, 0.6); },
      anim(t, P = {}) {
        const s = shotT(t, P), len = shotLen(P), dawn = P.zone === 'dawn';
        if (dawn) { lights(0xc0a8a8, 0xffd2a8, [-0.25, -0.4, -0.88], 0xd8a8a0, [35, 170], 9); pt(0, T.WIN[0], 1.4, FACE_Z - 0.8, 0.5, 0.42, 0.3); }
        const fl = dawn ? 0 : flashOf(P, s);
        if (fl > 0) { U.uAmb.value.lerp(WHITE, fl * 0.7); U.uDirCol.value.lerp(WHITE, fl * 0.6); }
        if (P.key) pt(3, P.key[0], P.key[1], P.key[2], P.key[3], P.key[4], P.key[5]);
        nightDome.visible = !dawn; dawnDome.visible = dawn; moon.visible = !dawn; sun.visible = dawn;
        clouds.forEach((c, i) => { c.visible = !dawn; c.position.x = -120 + i * 26 + ((t * 1.5) % 26); });
        nightDome.material.uniforms.uCol.value.setScalar(1 + fl * 2.2);
        // the window: open (night) or shut (glass); the curtains drawn, open or billowing out through it
        const shut = !!P.glass; glass.visible = shut; sash.visible = !shut;
        const draw = ramp(P.curtains, s, 0), blow = !shut && (P.blow ?? !dawn) && draw < 0.5;
        curts.forEach(({ piv, panel, s: sd }) => {
          piv.position.x = T.WIN[0] + sd * (0.98 - 0.52 * draw);
          const flap = blow ? 0.55 + 0.25 * Math.sin(t * 3.1 + sd) + 0.12 * Math.sin(t * 7.3 + sd * 2) : 0;
          piv.rotation.set(-flap, 0, blow ? sd * 0.08 * Math.sin(t * 2.3) : 0); panel.scale.x = 1 - 0.35 * (1 - draw);
        });
        // the alarm clock on the nightstand rings: it shakes and hops
        const rg = P.ring === true ? 0 : P.ring, ringing = rg != null && rg !== false && s >= rg;
        clock.visible = dawn || rg != null; clockBody.children.forEach((l, i) => { if (l.userData.ring) l.visible = ringing && Math.sin(t * 40 + i) > -0.6; }); clockBody.rotation.z = ringing ? 0.2 * Math.sin(t * 55) : 0; clockBody.position.y = ringing ? 0.02 * Math.abs(Math.sin(t * 27)) : 0;
        quilt.visible = !!P.tucked; duv.visible = !P.tucked; bags.visible = !hidden(P, 'bags'); chair.visible = !hidden(P, 'chair'); plank.visible = !!P.plank;
        // the party next door: three clowns dancing on the beat behind the glass
        party.visible = !hidden(P, 'party');
        clowns.forEach(c => {
          const show = party.visible && !P.noguests && !cleared(P, c.g.position.x, c.g.position.z); c.g.visible = show; if (!show) return;
          const bb = beat(t) + c.i * 0.33, b = Math.abs(Math.sin(bb * PI));
          c.body.position.y = 0.06 * b; c.body.rotation.z = 0.2 * Math.sin(bb * PI); c.head.rotation.y = 0.3 * Math.sin(bb * PI * 0.5);
          c.arms.forEach((a, k2) => a.rotation.set(0.3, 0, (k2 ? 1 : -1) * (2.3 + 0.3 * b)));
        });
        // the crane: the trolley along the jib, the hook on its cables, the girder slung under it
        crane.visible = !hidden(P, 'crane');
        const tx = glide(P.trolley ?? 14, s, len, P.trolleyAt, P.trolleyDur), hy = glide(P.hookY ?? T.HOOK_Y, s, len, P.trolleyAt, P.trolleyDur);
        trolley.position.x = tx; hook.position.set(tx, hy, T.JIB_Z);
        const top = JY - 0.3, bot = hy + T.BLOCK_TOP;
        cables.forEach(c => { c.position.set(tx + c.userData.dx, (top + bot) / 2, c.position.z); c.scale.y = Math.max(0.05, top - bot); });
        girder.visible = !!P.girder && !hidden(P, 'girder');
        if (girder.visible) {
          const gy = hy - T.GIRDER_DROP; girder.position.set(tx, gy, T.JIB_Z);
          slings.forEach(({ sl, s: sg }) => { _a.set(0, hy + 0.05 - gy, 0); _b.set(0, 0, sg * (T.GIRDER_L / 2 - 0.3)); const d = _b.clone().sub(_a); sl.position.copy(_a).add(_b).multiplyScalar(0.5); sl.scale.set(1, d.length(), 1); sl.quaternion.setFromUnitVectors(_up, d.normalize()); });
        }
        // street traffic far below
        cars.forEach((c, i) => { c.position.x = ((i * 23 + t * (i % 2 ? -9 : 11)) % 120 + 120) % 120 - 60; });
        // the rain: streaks round `rainAt` (the lens), never inside the bedroom or the party room
        const on = !dawn && P.rain !== false, ra = P.rainAt || [3, 1, 2];
        rain.forEach((p, i) => {
          if (!on) { p.visible = false; return; }
          const r1 = hash(i, 61), r2 = hash(i, 62), r3 = hash(i, 63), H = 14;
          const x = ra[0] + (r1 - 0.5) * 16, z = ra[2] + (r2 - 0.5) * 14, y = ra[1] + 7 - ((t * 11 * (0.85 + r3 * 0.3) + r1 * H) % H);
          const inside = z < FACE_Z && x > X0 && x < X1 && y > STREET && y < ROOF_Y, near = (x - ra[0]) ** 2 + (y - ra[1]) ** 2 + (z - ra[2]) ** 2 < 1.96;
          p.visible = !inside && !near; p.position.set(x, y, z); p.rotation.z = 0.08;
        });
        // a bucketful of water flung from p0 to p1: a clump flying an arc, then bursting where it lands
        drops.forEach((d, i) => {
          d.visible = false; const W0 = P.douse; if (!W0) return;
          const [x0, y0, z0, x1, y1, z1, s0, dur] = W0, e = s - s0; if (e < 0) return;
          const u = e / dur, j = [hash(i, 71) - 0.5, hash(i, 72) - 0.5, hash(i, 73) - 0.5];
          if (u <= 1) { const lead = cl(u * (1 + j[0] * 0.3)); d.visible = true; d.position.set(x0 + (x1 - x0) * lead + j[1] * 0.25 * u, y0 + (y1 - y0) * lead + 0.7 * Math.sin(lead * PI) + j[2] * 0.2 * u, z0 + (z1 - z0) * lead + j[0] * 0.25 * u); return; }
          const f = e - dur; if (f > 0.7) return;
          d.visible = true; d.position.set(x1 + j[0] * 1.6 * f, y1 + (1.2 + j[1] * 1.2) * f - 4.9 * f * f, z1 + j[2] * 1.6 * f);
        });
        hearts.forEach((h, i) => {   // `hearts` [[x, y, z, s0]]: three pink hearts pop and rise from each point (a kiss, a swoon)
          const q = (P.hearts || [])[Math.floor(i / 3)]; h.visible = false; if (!q) return;
          const e = s - q[3] - (i % 3) * 0.18; if (e < 0 || e > 1.4) return;
          h.visible = true; h.position.set(q[0] + ((i % 3) - 1) * 0.22 + 0.06 * Math.sin(e * 6 + i), q[1] + 0.55 * e, q[2]); h.scale.setScalar(Math.min(1, e * 5) * (1.15 - 0.25 * (e / 1.4)));
        });
        puddles.forEach((p, i) => { const q = (P.puddles || [])[i]; p.visible = !!q; if (q) { p.position.set(q[0], 0.012, q[1]); p.scale.set(q[2] * 1.5, q[2], 1); } });   // `puddles` [[x, z, r]]
        const pts = P.drips || [];
        drip.forEach((d, i) => {
          d.visible = pts.length > 0 && i < pts.length * 6 && s >= (P.dripAt || 0); if (!d.visible) return;
          const q = pts[i % pts.length], ph = (t * 1.6 + hash(i, 81)) % 1;
          d.position.set(q[0] + (hash(i, 82) - 0.5) * 0.5, q[2] - ph * 0.9, q[1] + (hash(i, 83) - 0.5) * 0.4);
        });
      },
    },
  };
}
