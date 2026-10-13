// maps47.js: the "On The Floor" map (2026-10-14, Jennifer Lopez ft. Pitbull; the clip: a black car under paparazzi
// flashes outside an old theatre turned nightclub, red velvet, balconies and crystal chandeliers, a packed dance floor,
// the singer in a silver sequined catsuit before a gold wall crossed by glowing gold bars, the rapper in a black suit
// and shades). Same contract as the other map files, pure in t:
//   floorclub  two storeys of one building at night. Upstairs (y >= 0) the club: a dance floor of 1 m gold and bronze
//         tiles (DANCE x0, x1, z0, z1: the part that caves in) lit on the beat, the diva's stage at the back (STAGE z0,
//         z1, top) before the gold wall and its four glowing bars, red velvet walls with gold pilasters, a theatre box on
//         each side wall, three crystal chandeliers, a VIP banquette with a champagne bucket (left), a gold bar (right),
//         a DJ booth on the stage with a box-pet DJ. Under its floor (the slab, y -SLAB .. 0) the flat of the cat who lives
//         downstairs (floor FLAT_Y): floral wallpaper, her mustard armchair facing +z (KOB, seat top FLAT_Y + SEAT_Y), a
//         fringed standard lamp (LAMP), a side table with her milk (TABLE), a round rug, an olive sofa (SOFA), a TV on the
//         front wall, a cat tree, framed photos, a pendant light (PENDANT) that swings on every beat while the party is on.
//         `zone` 'club' | 'flat' | 'cut' (the cutaway: both front walls gone, the slab's cut face and the foundation in
//         view, a lens out in front sees both rooms stacked in one 9:16 frame); the lights follow it.
//   Effects (shot seconds, s = t - P.t0): `holes` [[x, z, r, s0, s1]] (a hole through the dance floor growing from 0 at
//   s0 to r at s1, a negative s0 = long dug; a 6th value y puts it in that floor instead (the flat's own): a dark pit with splinters raised round its rim on top, and in the flat a
//   dark hole in the ceiling with a jagged plaster rim), `dig` [x, z, s0, s1, dir] (floor splinters sprayed out behind a
//   digger towards `dir` deg on every half beat), `plaster` [[x, z, s0]] (chunks of the flat's ceiling falling there),
//   `party` (default on: dust sifting down from the flat's ceiling on every beat, the pendant swinging; false: still),
//   `ridge` [x0, z0, x1, z1, s0, s1, hold] (a tunnel under the dance floor: the tiles over its head heave up and tip away,
//   splinters popping, the ones it passed left raised and askew; `hold` keeps it stalled at its end),
//   `whacks` [[x, z, s]] (a bonk ring and stars bursting off the floor there, facing `whackYaw`), `cracks` 0-1 (the
//   flat's ceiling cracked), `sag` 0-1 (the dance floor bulging down round `caveAt` before it goes), `cave` s (+ `caveAt` [x, z]: the dance floor's tiles break and fall into the flat, nearest
//   first, the guests on them with them; they lie as rubble round her armchair, never on it, nor in `keep` [[x, z, r]]), `fallen` (the cave-in long
//   done: the rubble down, the hole open, the club's light pouring through), box-pet guests in party clothes: `guests`
//   'dance' | 'stare' (at `stare` [x, z]) | 'cheer' | 'gasp' | 'toast' (a gold cup up) | 'fall' | false, `where` 'club' |
//   'flat' (after the cave: dancing round the rubble), `noguests`, `clear` [[x, z, r]], `hearts` [[x, y, z, s0, loop]] +
//   `heartYaw`, `confetti` s, `key` [x, y, z, r, g, b], `flash` (the stage's bars blaze). Since review 1: `spots` [[x, z, mode?] |
//   null] (the guests' marks for the shot, the ones left out hidden; facing `spotsAt` [x, z]), `dustAt` [x, z, r] (the beat's
//   plaster flakes gathered over one spot), `pour` [[x, z, s0]] (grit pouring out of a ceiling hole in a stream), `sag` seen
//   from the flat is one smooth belly with the holes and cracks on it, `rubbleOff` [[x0, z0, x1, z1, w]] (no landed rubble
//   within w of those lines: a lens's sight lines), `shafts` (default on after the cave-in: gold light beams down through
//   the hole); the cave-in breaks the front row with the slab's cut face, debris tumbling and dust boiling off the break;
//   guests in the flat after it stand on the rubble.
import { mapKit } from './mapkit.js';

export const FLOORCLUB = {
  FLAT_Y: -3.0, SLAB: 0.35, FRONT: 3.0,
  CLUB: [-7.5, 7.5, -8.4, 3.0, 5.6],     // the club's walls x0, x1, z0, z1 and its ceiling
  FLAT: [-4.5, 4.5, -4.6, 3.0],          // the flat's walls x0, x1, z0, z1 (its ceiling is the slab's underside)
  DANCE: [-3.5, 3.5, -4.0, 3.0],         // the dance floor's tiles (to the front edge: in the cutaway the slab's cut face falls with them)
  STAGE: [-8.4, -6.2, 0.45],             // the stage's z0, z1 and top
  KOB: [0.55, -0.85], SEAT_Y: 0.42,      // the armchair (faces +z)
  LAMP: [1.5, -1.3], TABLE: [-0.45, -0.7], TABLE_Y: 0.55, SOFA: [-2.9, -2.9], PENDANT: [0.0, 0.7],
  VIP: [-6.2, -2.6], BAR: [6.5, -2.0], DJ: [-4.2, -7.3],
};

export function buildFloorClubMaps(K) {
  const k = mapKit(K);
  const { THREE, mat, tex, px, noise, box, TAU, PI, beat, fr, hash, cyl, cone, ico, at, rot, flat, lights, pt, fall } = k;
  const M = (c, o = {}) => mat({ color: c, ...o }), glow = (c, u = 1) => mat({ color: c, unlit: u });
  const cl = x => Math.max(0, Math.min(1, x)), sm = u => { u = cl(u); return u * u * (3 - 2 * u); };
  const shotT = (t, P) => P.t0 != null ? t - P.t0 : 0;
  const cleared = (P, x, z) => (P.clear || []).some(([cx, cz, r]) => (x - cx) ** 2 + (z - cz) ** 2 < r * r);
  const offset = m => { m.polygonOffset = true; m.polygonOffsetFactor = -2; m.polygonOffsetUnits = -4; return m; };
  const F = FLOORCLUB, FY = F.FLAT_Y, SL = F.SLAB, [DX0, DX1, DZ0, DZ1] = F.DANCE, [CX0, CX1, CZ0, CZ1, CH] = F.CLUB, [FX0, FX1, FZ0, FZ1] = F.FLAT;

  // ---------- textures ----------
  const velvetT = tex(16, 32, (x, r) => { px(x, '#7a1020', 0, 0, 16, 32); for (let i = 0; i < 16; i += 4) { px(x, '#5e0a18', i, 0, 1, 32); px(x, '#94182a', i + 2, 0, 1, 32); } noise(x, r, 16, 32, ['rgba(0,0,0,.12)'], 30); }, 4701);
  const darkFloorT = tex(32, 32, (x, r) => { px(x, '#1e1a1c', 0, 0, 32, 32); noise(x, r, 32, 32, ['#221e20', '#1a1618', '#262224'], 140); x.strokeStyle = 'rgba(200,160,80,.25)'; x.beginPath(); x.moveTo(0, 31.5); x.lineTo(32, 31.5); x.moveTo(31.5, 0); x.lineTo(31.5, 32); x.stroke(); }, 4702);
  const tileGold = tex(16, 16, (x, r) => { px(x, '#a07c2c', 0, 0, 16, 16); noise(x, r, 16, 16, ['#9a762a', '#a88432', '#94702a'], 50); px(x, '#6a5220', 0, 15, 16, 1); px(x, '#6a5220', 15, 0, 1, 16); }, 4703);
  const tileDark = tex(16, 16, (x, r) => { px(x, '#4e3c22', 0, 0, 16, 16); noise(x, r, 16, 16, ['#4a3820', '#544226', '#463620'], 50); px(x, '#2e2414', 0, 15, 16, 1); px(x, '#2e2414', 15, 0, 1, 16); }, 4704);
  const goldWallT = tex(32, 32, (x, r) => { px(x, '#3a2a12', 0, 0, 32, 32); noise(x, r, 32, 32, ['#3e2e14', '#342610', '#44321a'], 120); }, 4705);
  const plasterT = tex(16, 16, (x, r) => { px(x, '#e6dcc8', 0, 0, 16, 16); noise(x, r, 16, 16, ['#e0d6c2', '#ece2ce', '#dcd2be'], 40); }, 4706);
  const concreteT = tex(16, 16, (x, r) => { px(x, '#8a8a86', 0, 0, 16, 16); noise(x, r, 16, 16, ['#828280', '#92928e', '#7a7a78'], 60); for (let i = -16; i < 16; i += 4) { x.strokeStyle = 'rgba(40,40,40,.35)'; x.beginPath(); x.moveTo(i, 16); x.lineTo(i + 16, 0); x.stroke(); } }, 4707);
  const paperT = tex(16, 16, x => { px(x, '#f0e2b0', 0, 0, 16, 16); for (let j = 2; j < 16; j += 6) for (let i = (j % 12 ? 1 : 4); i < 16; i += 6) { px(x, '#e07a8a', i, j, 2, 2); px(x, '#7aa86a', i + 2, j + 1, 1, 1); } }, 4708);
  const parquetT = tex(32, 32, (x, r) => { for (let j = 0; j < 32; j += 4) { const off = (j / 4) % 2 ? 8 : 0; for (let i = -8; i < 32; i += 16) px(x, ['#8a5a32', '#7e5230', '#946236', '#84562e'][Math.floor(r() * 4)], i + off, j, 16, 4); px(x, '#5a3a20', 0, j + 3, 32, 1); } }, 4709);
  const rugT = tex(32, 32, x => { const g = x.createRadialGradient(16, 16, 2, 16, 16, 16); g.addColorStop(0, '#d8c09a'); g.addColorStop(0.35, '#a83a3a'); g.addColorStop(0.55, '#d8c09a'); g.addColorStop(0.8, '#8a2a2a'); g.addColorStop(1, '#8a2a2a'); x.fillStyle = g; x.fillRect(0, 0, 32, 32); }, 4710);
  const earthT = tex(16, 16, (x, r) => { px(x, '#3a2a1e', 0, 0, 16, 16); noise(x, r, 16, 16, ['#34261a', '#42301f', '#2e2216'], 60); }, 4711);
  const crackT = tex(64, 64, (x, r) => {
    x.clearRect(0, 0, 64, 64); x.strokeStyle = '#3a3026'; x.lineWidth = 1;
    for (let q = 0; q < 9; q++) { let a = r() * TAU, cx = 32, cy = 32; x.beginPath(); x.moveTo(cx, cy); for (let s = 0; s < 7; s++) { a += (r() - 0.5) * 1.1; cx += Math.cos(a) * 5; cy += Math.sin(a) * 5; x.lineTo(cx, cy); } x.stroke(); }
  }, 4712);
  const tvT = tex(16, 12, x => { px(x, '#3a7ab8', 0, 0, 16, 12); px(x, '#6aaa5a', 0, 8, 16, 4); px(x, '#f0e070', 11, 2, 3, 3); }, 4713);
  const photoT = tex(12, 12, x => { px(x, '#d8c8a8', 0, 0, 12, 12); px(x, '#8a8a8a', 3, 3, 6, 6); px(x, '#4a4a4a', 4, 5, 1, 1); px(x, '#4a4a4a', 7, 5, 1, 1); }, 4714);

  function floorclub() {
    const G = new THREE.Group();
    const wall = (w, h, x, y, z, ry, m) => { const q = new THREE.Mesh(new THREE.PlaneGeometry(w, h), m); q.position.set(x, y, z); q.rotation.y = ry; G.add(q); return q; };
    // ================= the club (y >= 0) =================
    const W = CX1 - CX0, D = CZ1 - CZ0, ZC = (CZ0 + CZ1) / 2;
    // the dark floor round the dance floor (four strips); the dance floor's tiles are built below
    for (const [x0, x1, z0, z1] of [[CX0, DX0, CZ0, CZ1], [DX1, CX1, CZ0, CZ1], [DX0, DX1, CZ0, DZ0], [DX0, DX1, DZ1, CZ1]]) {
      if (x1 - x0 < 0.01 || z1 - z0 < 0.01) continue;
      G.add(flat(x1 - x0, z1 - z0, mat({ map: darkFloorT, rep: [(x1 - x0) / 1.5, (z1 - z0) / 1.5], unlit: 0.06 }), (x0 + x1) / 2, 0, (z0 + z1) / 2));
    }
    // walls: red velvet, gold pilasters, the front wall with the gold doors (hidden in the cutaway)
    const velM = (w, h) => mat({ map: velvetT, rep: [w / 1.2, h / 2.4], unlit: 0.1 });
    wall(D, CH, CX0, CH / 2, ZC, PI / 2, velM(D, CH)); wall(D, CH, CX1, CH / 2, ZC, -PI / 2, velM(D, CH));
    const clubFront = new THREE.Group(); G.add(clubFront);
    { const q = new THREE.Mesh(new THREE.PlaneGeometry(W, CH), velM(W, CH)); q.position.set(0, CH / 2, CZ1); q.rotation.y = PI; clubFront.add(q);
      for (const x of [-0.6, 0.6]) clubFront.add(at(box(1.1, 2.6, 0.06, M(0xc89a3a, { unlit: 0.3 })), x, 1.3, CZ1 - 0.05)); }
    const goldM = M(0xd0a040, { unlit: 0.35 });
    for (const sx of [CX0 + 0.08, CX1 - 0.08]) for (let z = CZ0 + 1.6; z < CZ1 - 0.5; z += 2.5) G.add(at(box(0.16, CH, 0.3, goldM), sx, CH / 2, z));
    // the ceiling: dark, gold coffers
    const ceil = new THREE.Mesh(new THREE.PlaneGeometry(W, D), M(0x1c1418, { unlit: 0.05 })); ceil.rotation.x = PI / 2; ceil.position.set(0, CH, ZC); G.add(ceil);
    for (let x = -6; x <= 6; x += 3) for (let z = -7; z <= 2; z += 3) G.add(at(box(2.4, 0.06, 2.4, M(0x2a1e14, { unlit: 0.1 })), x, CH - 0.05, z));
    // the stage and the gold wall with its glowing bars (the clip's set)
    const [SZ0, SZ1, SY] = F.STAGE;
    G.add(at(box(12, SY, SZ1 - SZ0, M(0x141012, { unlit: 0.08 })), 0, SY / 2, (SZ0 + SZ1) / 2));
    G.add(at(box(12, 0.03, 0.05, goldM), 0, SY, SZ1));
    wall(14.8, CH, 0, CH / 2, CZ0 + 0.01, 0, mat({ map: goldWallT, rep: [6, 3], unlit: 0.25 }));
    const bars = [];
    for (const y of [1.15, 1.95, 2.75, 3.55]) { const b = at(box(12.6, 0.11, 0.06, glow(0xffd070, 1)), 0, y, CZ0 + 0.06); G.add(b); bars.push(b); }
    const barHalo = glow(0xb07a20, 0.8);
    for (const y of [1.15, 1.95, 2.75, 3.55]) G.add(at(box(12.6, 0.36, 0.02, barHalo), 0, y, CZ0 + 0.03));
    // the DJ booth on the stage, a box-pet DJ behind it (built with the guests below)
    const [djx, djz] = F.DJ;
    G.add(at(box(1.5, 0.95, 0.6, M(0x1a1a22, { unlit: 0.1 })), djx, SY + 0.475, djz + 0.45));
    G.add(at(box(1.4, 0.04, 0.5, glow(0x9a5aff, 0.8)), djx, SY + 0.96, djz + 0.45));
    // the theatre boxes on the side walls
    for (const sx of [-1, 1]) {
      const x = sx * (CX1 - 0.45);
      G.add(at(box(0.9, 0.12, 2.6, M(0x5a0c18, { unlit: 0.1 })), x, 2.7, -3.2));
      G.add(at(box(0.08, 0.7, 2.6, goldM), x - sx * 0.43, 3.05, -3.2));
      G.add(at(box(0.9, 0.06, 2.6, goldM), x, 3.42, -3.2));
    }
    // three crystal chandeliers
    const crystal = glow(0xfff0f4, 0.95), pinkC = glow(0xff9ac8, 0.95), chandeliers = [];
    for (const [x, y, z, sc] of [[-3.0, 4.55, -1.6, 1], [3.0, 4.55, -1.6, 1], [0, 4.7, -5.2, 1.25]]) {
      const c = new THREE.Group(); c.position.set(x, y, z); c.scale.setScalar(sc); G.add(c); chandeliers.push(c);
      c.add(at(cyl(0.012, 0.012, CH - y, 4, M(0x8a7040)), 0, (CH - y) / 2, 0));
      c.add(at(cone(0.55, 0.5, 8, mat({ color: 0xd8b060, unlit: 0.4 })), 0, -0.05, 0));
      for (let i = 0; i < 16; i++) { const a = i * TAU / 16, r = 0.35 + 0.22 * (i % 2); c.add(at(ico(0.06, 0, i % 3 ? crystal : pinkC), Math.cos(a) * r, -0.35 - 0.18 * (i % 2), Math.sin(a) * r)); }
      c.add(at(ico(0.1, 0, crystal), 0, -0.6, 0));
    }
    // the VIP banquette with its champagne bucket (left), the gold bar (right)
    const [vx, vz] = F.VIP, red = M(0x9a1424, { unlit: 0.12 });
    G.add(at(box(0.9, 0.45, 3.2, red), vx - 0.3, 0.225, vz)); G.add(at(box(0.25, 0.9, 3.2, red), vx - 0.7, 0.45, vz));
    G.add(at(box(0.7, 0.42, 1.2, M(0x141012)), vx + 0.7, 0.21, vz));
    G.add(at(cyl(0.13, 0.1, 0.25, 8, M(0xc8ccd4, { unlit: 0.3 })), vx + 0.7, 0.545, vz - 0.2)); G.add(at(cyl(0.035, 0.04, 0.32, 6, goldM), vx + 0.7, 0.72, vz - 0.2));
    const [bx, bz] = F.BAR;
    G.add(at(box(0.7, 1.05, 5.0, goldM), bx, 0.525, bz)); G.add(at(box(0.85, 0.06, 5.2, M(0x141012, { unlit: 0.1 })), bx, 1.08, bz));
    for (let i = 0; i < 9; i++) G.add(at(cyl(0.05, 0.05, 0.32, 6, glow([0x5ad8a0, 0xd8a03a, 0xa03ad8, 0xe0e0e0][i % 4], 0.6)), CX1 - 0.25, 1.6 + 0.5 * (i % 2), bz - 2 + i * 0.5));

    // the dance floor's tiles: the floor's top, the slab and the flat's ceiling under it, one group each (they fall)
    const goldTileM = mat({ map: tileGold, unlit: 0.18 }), darkTileM = mat({ map: tileDark, unlit: 0.1 }), litTileM = offset(glow(0xffd884, 0.85));
    const slabM = mat({ map: concreteT, unlit: 0.3 }), plasterM = mat({ map: plasterT, unlit: 0.15 });   // unlit as the cut face's: the front row's faces are the cutaway's cut face
    const tiles = [];
    for (let i = 0; i < DX1 - DX0; i++) for (let j = 0; j < DZ1 - DZ0; j++) {
      const x = DX0 + i + 0.5, z = DZ0 + j + 0.5, g = new THREE.Group(); g.position.set(x, -SL / 2, z); G.add(g);
      g.add(flat(1, 1, (i + j) % 2 ? goldTileM : darkTileM, 0, SL / 2, 0));
      const lit = flat(0.94, 0.94, litTileM, 0, SL / 2 + 0.004, 0); lit.visible = false; g.add(lit);
      g.add(at(box(1, SL - 0.02, 1, slabM), 0, 0, 0));
      const bot = flat(1, 1, plasterM, 0, -SL / 2, 0); bot.rotation.x = PI / 2; g.add(bot);
      // where it lands: round the armchair, never on it; tilted
      const kd = Math.hypot(x - F.KOB[0], z - F.KOB[1]), push = kd < 1.3 ? (1.3 - kd) : 0, ang = Math.atan2(x - F.KOB[0], z - F.KOB[1]);
      const rest = [x + Math.sin(ang) * push + (hash(i, j, 1) - 0.5) * 0.5, FY + 0.12 + 0.16 * hash(i, j, 2), z + Math.cos(ang) * push + (hash(i, j, 3) - 0.5) * 0.5];
      tiles.push({ g, lit, x, z, i, j, rest, rx: (hash(i, j, 4) - 0.5) * 0.7, rz: (hash(i, j, 5) - 0.5) * 0.7, ry: hash(i, j, 6) * TAU });
    }

    // ================= the flat (FLAT_Y .. -SLAB) =================
    const FW = FX1 - FX0, FD = FZ1 - FZ0, FZC = (FZ0 + FZ1) / 2, FH = -SL - FY, FYC = FY + FH / 2;
    G.add(flat(FW, FD, mat({ map: parquetT, rep: [FW / 2, FD / 2], unlit: 0.08 }), 0, FY, FZC));
    const paperM = (w, h) => mat({ map: paperT, rep: [w / 0.8, h / 0.8], unlit: 0.12 });
    // the walls run 0.14 m up into the slab: flush with the ceiling, vertex snapping opened a dotted black seam along the join
    wall(FW, FH + 0.14, 0, FYC + 0.07, FZ0, 0, paperM(FW, FH)); wall(FD, FH + 0.14, FX0, FYC + 0.07, FZC, PI / 2, paperM(FD, FH)); wall(FD, FH + 0.14, FX1, FYC + 0.07, FZC, -PI / 2, paperM(FD, FH));
    const flatFront = new THREE.Group(); G.add(flatFront);
    { const q = new THREE.Mesh(new THREE.PlaneGeometry(FW, FH), paperM(FW, FH)); q.position.set(0, FYC, FZ1); q.rotation.y = PI; flatFront.add(q);
      flatFront.add(at(box(1.3, 0.75, 0.08, M(0x1a1a1e)), 0.6, FY + 1.05, FZ1 - 0.08)); const scr = new THREE.Mesh(new THREE.PlaneGeometry(1.15, 0.62), mat({ map: tvT, unlit: 0.9 })); scr.position.set(0.6, FY + 1.05, FZ1 - 0.125); scr.rotation.y = PI; flatFront.add(scr);
      flatFront.add(at(box(1.6, 0.5, 0.45, M(0x6a4a2a)), 0.6, FY + 0.25, FZ1 - 0.3)); }
    // skirting and a dado rail on the three walls that stay
    for (const [w, x, z, ry] of [[FW, 0, FZ0 + 0.02, 0], [FD, FX0 + 0.02, FZC, PI / 2], [FD, FX1 - 0.02, FZC, -PI / 2]]) {
      const q = at(box(w, 0.12, 0.03, M(0xf2ead8)), x, FY + 0.06, z); q.rotation.y = ry; G.add(q);
      const d = at(box(w, 0.05, 0.03, M(0xc8a06a)), x, FY + 1.0, z); d.rotation.y = ry; G.add(d);
    }
    // the flat's ceiling round the dance floor's tiles (their undersides close it), the cracks overlay
    for (const [x0, x1, z0, z1] of [[FX0 - 0.2, DX0, FZ0 - 0.2, FZ1], [DX1, FX1 + 0.2, FZ0 - 0.2, FZ1], [DX0, DX1, FZ0 - 0.2, DZ0], [DX0, DX1, DZ1, FZ1]]) {
      if (x1 <= x0 || z1 <= z0) continue;
      const q = flat(x1 - x0, z1 - z0, mat({ map: plasterT, rep: [x1 - x0, z1 - z0], unlit: 0.15 }), (x0 + x1) / 2, -SL, (z0 + z1) / 2); q.rotation.x = PI / 2; G.add(q);
    }
    const crackM = offset(mat({ map: crackT, unlit: 0.2 })); crackM.transparent = true; crackM.alphaTest = 0.4;
    const cracks = flat(7.5, 6.5, crackM, F.KOB[0], -SL - 0.01, -1.0); cracks.rotation.x = PI / 2; G.add(cracks);
    // the sag seen from below: one smooth belly of plaster under the dance floor, bulging down round the impact point, with
    // cracks running out of the holes on it (each tile sagging on its own read as straight panel seams and hid the holes
    // and the cracks, review 1). Unit depth in the geometry, scaled by the sag
    const BELLY = [0.3, -1.5, 3.3], BCX = (DX0 + DX1) / 2, BCZ = (DZ0 + DZ1) / 2;
    const bellyProf = (x, z) => { const d = Math.hypot(x - BELLY[0], z - BELLY[1]) / BELLY[2]; return d < 1 ? (1 - d * d) ** 2 : 0; };
    const bellyGeo = new THREE.PlaneGeometry(DX1 - DX0, DZ1 - DZ0, 28, 28); bellyGeo.rotateX(PI / 2);
    { const p = bellyGeo.attributes.position; for (let i = 0; i < p.count; i++) p.setY(i, -bellyProf(p.getX(i) + BCX, p.getZ(i) + BCZ)); p.needsUpdate = true; bellyGeo.computeVertexNormals(); }
    const bellyM = mat({ map: plasterT, rep: [DX1 - DX0, DZ1 - DZ0], unlit: 0.15 }); bellyM.polygonOffset = true; bellyM.polygonOffsetFactor = -1; bellyM.polygonOffsetUnits = -2;
    const belly = new THREE.Mesh(bellyGeo, bellyM); belly.position.set(BCX, -SL - 0.004, BCZ); belly.visible = false; G.add(belly);
    const bellyCrackT = tex(256, 256, (x, r) => {
      x.clearRect(0, 0, 256, 256); x.strokeStyle = '#3a3026'; x.lineWidth = 1.4;   // thin: at 128 px the cracks read as a black net (own review)
      for (const [wx, wz] of [[0.3, -1.5], [0.55, -0.15], [-1.6, -1.7], [-0.35, -3.0], [1.15, -2.3], [1.8, -0.75], [0.0, -2.0]]) {   // the impact point and the episode's holes
        const cx0 = (wx - DX0) / (DX1 - DX0) * 256, cy0 = (DZ1 - wz) / (DZ1 - DZ0) * 256;
        for (let q = 0; q < 5; q++) { let a = q * TAU / 5 + r(), cx = cx0, cy = cy0; x.beginPath(); x.moveTo(cx, cy); for (let k = 0; k < 7; k++) { a += (r() - 0.5) * 1.3; cx += Math.cos(a) * 6; cy += Math.sin(a) * 6; x.lineTo(cx, cy); } x.stroke(); }
      }
    }, 4715);
    const bellyCrackM = offset(mat({ map: bellyCrackT, unlit: 0.2 })); bellyCrackM.transparent = true; bellyCrackM.alphaTest = 0.4;
    const bellyCracks = new THREE.Mesh(bellyGeo, bellyCrackM); bellyCracks.position.set(BCX, -SL - 0.008, BCZ); bellyCracks.visible = false; G.add(bellyCracks);
    // her armchair, the lamp, the side table with her milk, the rug, the sofa, a cat tree, photos
    const [kx, kz] = F.KOB, must = M(0xc8962a, { unlit: 0.12 }), mustD = M(0xa87a20, { unlit: 0.1 });
    const chair = new THREE.Group(); chair.position.set(kx, FY, kz); G.add(chair);
    chair.add(at(box(0.92, F.SEAT_Y, 0.8, must), 0, F.SEAT_Y / 2, 0)); chair.add(at(box(0.92, 0.78, 0.2, mustD), 0, F.SEAT_Y + 0.33, -0.38));
    for (const sx of [-1, 1]) chair.add(at(box(0.16, 0.26, 0.8, mustD), sx * 0.46, F.SEAT_Y + 0.13, 0));
    const rug = new THREE.Mesh(new THREE.CircleGeometry(1.5, 16), offset(mat({ map: rugT, unlit: 0.12 }))); rug.rotation.x = -PI / 2; rug.position.set(kx, FY + 0.006, kz + 0.35); G.add(rug);
    const [lx, lz] = F.LAMP, lampG = new THREE.Group(), tableG = new THREE.Group(); G.add(lampG); G.add(tableG);   // `noLamp`, `noTable` hide them for a shot (the pole ran down a face, round 2)
    lampG.add(at(cyl(0.02, 0.02, 1.5, 5, M(0x7a6a4a)), lx, FY + 0.75, lz)); lampG.add(at(cyl(0.18, 0.04, 0.05, 6, M(0x5a4a3a)), lx, FY + 0.025, lz));
    lampG.add(at(cyl(0.16, 0.27, 0.3, 8, glow(0xffd890, 0.9)), lx, FY + 1.6, lz));
    for (let i = 0; i < 10; i++) { const a = i * TAU / 10; lampG.add(at(box(0.02, 0.07, 0.02, M(0xe8a04a)), lx + Math.cos(a) * 0.27, FY + 1.42, lz + Math.sin(a) * 0.27)); }
    const [tx, tz] = F.TABLE;
    tableG.add(at(cyl(0.24, 0.24, 0.04, 8, M(0x7a4a26)), tx, FY + F.TABLE_Y, tz)); tableG.add(at(cyl(0.03, 0.04, F.TABLE_Y, 5, M(0x5a3a1e)), tx, FY + F.TABLE_Y / 2, tz));
    tableG.add(at(cyl(0.045, 0.04, 0.13, 7, M(0xf8f8f4, { unlit: 0.4 })), tx + 0.05, FY + F.TABLE_Y + 0.085, tz));
    const [sfx, sfz] = F.SOFA;
    G.add(at(box(2.1, 0.42, 0.9, M(0x5a6a2a, { unlit: 0.1 })), sfx, FY + 0.21, sfz)); G.add(at(box(2.1, 0.55, 0.22, M(0x4a5a22, { unlit: 0.1 })), sfx, FY + 0.66, sfz - 0.36));
    G.add(at(box(0.5, 1.6, 0.5, M(0xc8b090)), FX1 - 0.5, FY + 0.8, FZ0 + 0.5)); G.add(at(box(0.7, 0.08, 0.7, M(0xa88a64)), FX1 - 0.5, FY + 1.62, FZ0 + 0.5));
    for (const [x, y] of [[-1.6, 1.55], [-0.6, 1.75], [2.6, 1.6]]) { G.add(at(box(0.5, 0.5, 0.03, M(0x8a6a3a)), x, FY + y, FZ0 + 0.03)); const p = new THREE.Mesh(new THREE.PlaneGeometry(0.4, 0.4), mat({ map: photoT, unlit: 0.4 })); p.position.set(x, FY + y, FZ0 + 0.05); G.add(p); }
    // the pendant light: a cord from the ceiling, a shade, a bulb; it swings on every beat while the party's on
    const pend = new THREE.Group(); pend.position.set(F.PENDANT[0], -SL, F.PENDANT[1]); G.add(pend);
    pend.add(at(cyl(0.008, 0.008, 0.6, 4, M(0x2a2a2a)), 0, -0.3, 0)); pend.add(at(cone(0.22, 0.2, 8, M(0xd86a4a, { unlit: 0.3 })), 0, -0.68, 0)); pend.add(at(ico(0.06, 0, glow(0xfff2c8)), 0, -0.76, 0));
    // the cutaway: the slab's cut face and the foundation under the flat (the front walls go)
    const cutG = new THREE.Group(); G.add(cutG);
    for (const [x0, x1] of [[-8, DX0], [DX1, 8]]) cutG.add(at(box(x1 - x0, SL, 0.04, mat({ map: concreteT, rep: [x1 - x0, 1], unlit: 0.35 })), (x0 + x1) / 2, -SL / 2, FZ1 + 0.02));   // between them the front row of tiles is the cut face: it caves in with them
    cutG.add(at(box(16, 0.9, 0.04, mat({ map: earthT, rep: [8, 1], unlit: 0.2 })), 0, FY - 0.45, FZ1 + 0.02));
    for (const x of [FX0 - 0.15, FX1 + 0.15]) cutG.add(at(box(0.3, FH + 0.9, 0.04, mat({ map: concreteT, unlit: 0.3 })), x, FYC - 0.45, FZ1 + 0.02));

    // ================= effects =================
    // holes: a dark pit on top with splinters round its rim; a dark hole with a plaster rim under the ceiling
    const pitM = offset(M(0x0c0806)), splM = M(0xb88a34, { unlit: 0.25 }), splD = M(0x5a4224, { unlit: 0.2 });
    const holeBotM = offset(M(0x0e0a08)), rimM = offset(M(0xd8ccb4, { unlit: 0.25 }));
    const holes = Array.from({ length: 12 }, (_, q) => {
      const top = new THREE.Mesh(new THREE.CircleGeometry(1, 10), pitM); top.rotation.x = -PI / 2; G.add(top);
      const shards = Array.from({ length: 9 }, (_, i) => { const m = box(0.22, 0.03, 0.09, i % 2 ? splM : splD); G.add(m); return m; });
      const bot = new THREE.Mesh(new THREE.CircleGeometry(1, 10), holeBotM); bot.rotation.x = PI / 2; G.add(bot);
      const rim = new THREE.Mesh(new THREE.RingGeometry(0.88, 1.12, 10), rimM); rim.rotation.x = PI / 2; G.add(rim);
      return { top, shards, bot, rim, q };
    });
    // the digger's spray, plaster chunks, the beat's dust, the tunnel ridge, the whacks' bursts, the cave-in's dust clouds
    const spray = Array.from({ length: 20 }, (_, i) => { const m = box(0.12, 0.025, 0.05, i % 3 ? splM : splD); G.add(m); return m; });
    const chunks = Array.from({ length: 14 }, () => { const m = box(0.14, 0.05, 0.11, M(0xe2d8c4, { unlit: 0.25 })); G.add(m); return m; });
    // the beat's dust: plaster flakes sifting down from the flat's ceiling, a burst on every beat, pale and grey (2.5 cm
    // pale ones vanished on the cream wallpaper, review 1); `dustAt` [x, z, r] gathers them over one spot
    const dustM = mat({ color: 0xf6f0e2, unlit: 0.55 }), dustG = mat({ color: 0x8e877a, unlit: 0.25 });
    const dust = Array.from({ length: 64 }, (_, i) => { const m = box(0.07, 0.018, 0.06, i % 3 ? dustM : dustG); G.add(m); return m; });   // flat flakes (cubes read as sugar lumps)
    // `pour` [[x, z, s0]]: grit pouring out of a hole in her ceiling in a stream
    const grit = Array.from({ length: 60 }, (_, i) => { const m = box(0.045, 0.045, 0.045, i % 3 ? dustM : dustG); G.add(m); return m; });
    const puffM = mat({ color: 0xe8dcc8, unlit: 0.4, see: 0.55 }), puffs = Array.from({ length: 16 }, () => { const m = ico(0.4, 1, puffM); G.add(m); return m; });
    const breakPuffs = Array.from({ length: 8 }, () => { const m = ico(0.3, 1, mat({ color: 0xd8ccb8, unlit: 0.45 })); G.add(m); return m; });
    // the cave-in's debris: concrete and gold-tile chunks breaking off with the floor and tumbling down
    const debris = Array.from({ length: 28 }, (_, i) => { const m = box(0.14 + 0.14 * hash(i, 11), 0.1 + 0.08 * hash(i, 12), 0.12 + 0.12 * hash(i, 13), i % 3 ? slabM : i % 2 ? goldTileM : darkTileM); G.add(m); return m; });
    // the tunnel: splinters popping off the tiles over its head (the bulge is the tiles themselves heaving: a gold mound
    // with a crack line behind it read as a lollipop on a stick, review 1)
    const ridge = new THREE.Group(); G.add(ridge);
    const ridgeShards = Array.from({ length: 8 }, (_, i) => { const sh = box(0.2, 0.03, 0.1, i % 2 ? splM : splD); ridge.add(sh); return sh; });
    // the club's light pouring down through the hole into her flat after the cave-in
    const shaftM = mat({ color: 0xffd27a, unlit: 1, see: 0.6 });
    const shafts = [[-2.6, -4.05, 0.2], [-1.0, -4.15, -0.14], [1.4, -4.1, 0.18], [3.2, -3.95, -0.2]].map(([x, z, tl]) => { const m = cyl(0.22, 0.55, FH, 4, shaftM); m.position.set(x, FY + FH / 2, z); m.rotation.z = tl; m.visible = false; G.add(m); return m; });
    const segDist = (qx, qz, x0, z0, x1, z1) => { const vx = x1 - x0, vz = z1 - z0, L2 = vx * vx + vz * vz || 1e-9, u = cl(((qx - x0) * vx + (qz - z0) * vz) / L2); return Math.hypot(qx - x0 - vx * u, qz - z0 - vz * u); };
    const offLine = (P, x, z) => (P.rubbleOff || []).some(([x0, z0, x1, z1, w]) => segDist(x, z, x0, z0, x1, z1) < w);   // `rubbleOff` [[x0, z0, x1, z1, w]]: no landed rubble there (a lens's sight lines)
    const starGeo = (() => { const sh = new THREE.Shape(); for (let i = 0; i < 10; i++) { const a = PI / 2 + i * PI / 5, r = i % 2 ? 0.42 : 1; if (i) sh.lineTo(Math.cos(a) * r, Math.sin(a) * r); else sh.moveTo(Math.cos(a) * r, Math.sin(a) * r); } sh.closePath(); return new THREE.ShapeGeometry(sh); })();
    const whacks = Array.from({ length: 3 }, () => {
      const g = new THREE.Group(); G.add(g);
      const ring = new THREE.Mesh(new THREE.RingGeometry(0.8, 1, 18), mat({ color: 0xfff2b0, unlit: 1, side: THREE.DoubleSide })); g.add(ring);
      const st = Array.from({ length: 5 }, () => { const m = new THREE.Mesh(starGeo, mat({ color: 0xffd23a, unlit: 1, side: THREE.DoubleSide })); g.add(m); return m; });
      return { g, ring, st };
    });

    // ================= box pets: the party guests, the DJ, the boxes' audience =================
    const FURS = [0xd8b080, 0x8a8a92, 0xf2eee6, 0x5a4030, 0xe8a058, 0x3a3a40, 0xc8c0b0, 0xa87a54, 0xe0c8a0, 0x707078];
    const TOPS = [0xf0c040, 0xd8d8e0, 0xe0306a, 0x2ab0b0, 0x9a5ad8, 0xf08a3a, 0xf0f0ea, 0x3a8ae0, 0xe07ab0, 0x5ac08a];
    const cupM = M(0xffcf3a, { unlit: 0.6 });
    function pet(i) {
      const fur = M(FURS[i % 10]), top = M(TOPS[(i * 3) % 10], { unlit: 0.2 }), kind = i % 3;
      const g = new THREE.Group(), body = new THREE.Group(); g.add(body);
      const legs = [-1, 1].map(sx => { const l = at(new THREE.Group(), sx * 0.1, 0.3, 0); l.add(at(box(0.13, 0.3, 0.13, M(0x2a2c34)), 0, -0.15, 0)); body.add(l); return l; });
      body.add(at(box(0.4, 0.38, 0.28, top), 0, 0.5, 0));
      const arms = [-1, 1].map(sx => { const a = at(new THREE.Group(), sx * 0.23, 0.64, 0); a.add(at(box(0.09, 0.28, 0.09, top), 0, -0.12, 0)); a.add(at(box(0.08, 0.08, 0.08, fur), 0, -0.28, 0)); body.add(a); return a; });
      const cup = new THREE.Group(); cup.position.set(0, -0.34, 0.02); cup.visible = false; arms[1].add(cup);   // a goblet: bowl, rim, stem, foot; kept upright whatever the arm does
      cup.add(at(cyl(0.11, 0.07, 0.16, 8, cupM), 0, 0.2, 0)); cup.add(at(cyl(0.115, 0.115, 0.02, 8, glow(0xfff0a0, 0.8)), 0, 0.285, 0)); cup.add(at(cyl(0.02, 0.02, 0.1, 5, cupM), 0, 0.07, 0)); cup.add(at(cyl(0.07, 0.07, 0.02, 8, cupM), 0, 0.02, 0));
      const head = at(new THREE.Group(), 0, 0.92, 0); body.add(head);
      const skull = ico(0.24, 1, fur); skull.scale.set(1, 0.9, 0.92); head.add(skull);
      const snout = at(ico(0.09, 1, M(0xf0e6d8)), 0, -0.07, 0.19); snout.scale.set(1.1, 0.75, 0.8); head.add(snout);
      head.add(at(ico(0.03, 0, M(0x2a1a1a)), 0, -0.03, 0.27));
      for (const e of [-1, 1]) {
        head.add(at(ico(0.04, 0, M(0x0e0e0e)), e * 0.1, 0.05, 0.19)); head.add(at(ico(0.012, 0, glow(0xffffff)), e * 0.1 + 0.012, 0.065, 0.225));
        if (kind === 0) head.add(rot(at(cone(0.1, 0.2, 4, fur), e * 0.14, 0.26, 0), 0, 0, -e * 0.3));
        else if (kind === 1) head.add(rot(at(box(0.1, 0.26, 0.05, fur), e * 0.2, 0.0, 0), 0, 0, e * 0.25));
        else head.add(rot(at(box(0.08, 0.34, 0.05, fur), e * 0.09, 0.36, 0), 0, 0, -e * 0.12));
      }
      const mouth = at(box(0.1, 0.07, 0.02, M(0x5a1a1a)), 0, -0.14, 0.25); mouth.visible = false; head.add(mouth);
      return { g, body, head, arms, legs, mouth, cup, i };
    }
    function pose(q, mode, tf, ph, P, x, z, yaw) {
      q.body.position.set(0, 0, 0); q.body.rotation.set(0, 0, 0); q.head.rotation.set(0, 0, 0); q.mouth.visible = false; q.cup.visible = false;
      q.arms.forEach(a => a.rotation.set(0, 0, 0)); q.legs.forEach(l => l.rotation.set(0, 0, 0));
      if (P.stare && mode !== 'fall') { const a = Math.atan2(P.stare[0] - x, P.stare[1] - z) - yaw; q.head.rotation.y = Math.max(-1.1, Math.min(1.1, Math.atan2(Math.sin(a), Math.cos(a)))); }
      if (mode === 'stare') { q.mouth.visible = true; q.arms.forEach((a, j) => { a.rotation.z = (j ? 1 : -1) * 0.1; }); }
      else if (mode === 'cheer') { q.arms.forEach((a, j) => { a.rotation.z = (j ? 1 : -1) * 2.45; }); q.mouth.visible = true; q.body.position.y = 0.05 * Math.abs(Math.sin(ph * PI)); }
      else if (mode === 'gasp') { q.arms.forEach((a, j) => { a.rotation.x = -2.45; a.rotation.z = (j ? 1 : -1) * 0.12; }); q.mouth.visible = true; q.body.rotation.x = -0.12; }
      else if (mode === 'leap') { q.arms.forEach((a, j) => { a.rotation.z = (j ? 1 : -1) * 2.5; }); q.legs.forEach((l, j) => { l.rotation.x = j ? 0.5 : -0.35; }); q.mouth.visible = true; q.body.position.y = 0.3 + 0.05 * Math.sin(tf * 9 + q.i); q.body.rotation.z = (q.i % 2 ? 1 : -1) * 0.32; }   // jumping clear: feet off the floor, leaning away
      else if (mode === 'toast') { q.cup.visible = true; q.arms[1].rotation.z = 2.5; q.cup.rotation.z = -2.5; q.arms[0].rotation.z = -0.15; q.mouth.visible = true; q.body.position.y = 0.04 * Math.abs(Math.sin(ph * PI)); }
      else if (mode === 'dance') { const up = Math.abs(Math.sin(ph * PI)), side = Math.sin(ph * PI); q.body.rotation.z = 0.2 * side; q.body.position.y = 0.09 * up; q.arms.forEach((a, j) => { a.rotation.x = -1.9 - 0.9 * up; a.rotation.z = (j ? 1 : -1) * (0.35 + 0.25 * up) + 0.25 * side; }); q.legs.forEach((l, j) => { l.rotation.x = 0.35 * Math.sin(ph * PI + j * PI); }); }
      else if (mode === 'fall') { q.body.rotation.x = -PI / 2 + 0.06; q.body.position.set(0, 0.16, -0.3); q.arms.forEach((a, j) => { a.rotation.z = (j ? 1 : -1) * (2.0 + 0.3 * Math.sin(tf * 9 + q.i)); }); q.legs.forEach((l, j) => { l.rotation.x = -0.6 + 0.3 * Math.sin(tf * 8 + j * 2); }); q.mouth.visible = true; }
      else { q.arms.forEach((a, j) => { a.rotation.z = (j ? 1 : -1) * 0.12; }); q.body.rotation.z = 0.04 * Math.sin(tf * 1.4 + q.i); }
    }
    // the guests' spots: round the dance floor's edge (on its tiles: they go down with them), by the bar and the VIP;
    // after the cave-in, round the rubble in the flat
    const CLUB_SPOTS = [[-3.0, -3.4], [-1.6, -3.6], [0.2, -3.5], [1.8, -3.6], [3.0, -3.2], [-3.1, -1.6], [3.1, -1.4], [-3.0, 0.4], [3.0, 0.6], [-1.9, 1.5], [1.9, 1.6],
      [-4.6, -4.8], [4.6, -4.6], [-4.8, 0.8], [4.4, 1.2], [5.6, -3.6]];
    const FLAT_SPOTS = [[-2.4, -1.4], [-1.6, 0.6], [-0.9, -2.6], [2.4, -2.4], [2.6, -0.2], [1.6, 1.3], [-2.9, 1.4], [3.4, 1.4], [-3.6, -0.4], [0.2, -3.6], [1.1, -3.4], [-1.9, -3.7],
      [3.6, -3.4], [-0.8, 1.9], [0.6, 2.0], [-3.8, 2.2]];
    const guests = CLUB_SPOTS.map((p, i) => { const q = pet(i); q.home = p; q.flatHome = FLAT_SPOTS[i]; G.add(q.g); return q; });
    const dj = pet(31); dj.g.position.set(djx, SY, djz); G.add(dj.g);
    const boxPets = [[-1, -3.8], [-1, -2.6], [1, -3.6], [1, -2.8]].map(([sx, z], i) => { const q = pet(40 + i); q.g.position.set(sx * (CX1 - 0.45), 2.76, z); q.g.rotation.y = sx > 0 ? -PI / 2 : PI / 2; G.add(q.g); return q; });

    const heartM = M(0xff4f9a, { unlit: 0.8 }), hearts = [];
    for (let i = 0; i < 9; i++) { const h = new THREE.Group(); h.add(at(ico(0.1, 0, heartM), -0.075, 0, 0)); h.add(at(ico(0.1, 0, heartM), 0.075, 0, 0)); h.add(rot(at(cone(0.125, 0.18, 4, heartM), 0, -0.11, 0), PI, 0, 0)); h.visible = false; G.add(h); hearts.push(h); }
    const confG = new THREE.Group(); G.add(confG);
    const confAnim = fall(confG, 80, mat({ color: 0xf2c43a, unlit: 0.7, side: THREE.DoubleSide }), new THREE.PlaneGeometry(0.07, 0.05), { w: 6, top: 5, speed: 1.1, spin: 4, drift: 0.3, seed: 47 });

    // a tile's fall: from its place at the cave's start (nearer the impact first) down to its rest on the flat's floor
    const GRAV = 9.0;
    function tileState(tl, s, P) {
      if (P.cave == null && !P.fallen) return null;
      const [ax, az] = P.caveAt || [F.KOB[0], -1.0], delay = tl.z > (P.frontFirst ?? 99) ? 0 : 0.06 * Math.hypot(tl.x - ax, tl.z - az);   // `frontFirst` z: the rows in front of it go at once (in the cutaway they hid everyone falling behind them)
      const e = P.fallen ? 9 : s - P.cave - delay; if (e < 0) return null;
      let [rx0, ry0, rz0] = tl.rest;   // `keep`: zones the rubble stays out of (pushed out to their edge)
      for (const [kx2, kz2, kr] of (P.keep || [])) { const dx = rx0 - kx2, dz = rz0 - kz2, dd = Math.hypot(dx, dz); if (dd < kr) { const f = (kr + 0.05) / Math.max(dd, 0.05); rx0 = kx2 + dx * f; rz0 = kz2 + dz * f; } }
      const rest = [rx0, ry0, rz0], drop = -SL / 2 - rest[1], tLand = Math.sqrt(2 * drop / GRAV);
      if (e >= tLand) return { x: rest[0], y: rest[1], z: rest[2], rx: tl.rx, ry: tl.ry, rz: tl.rz, landed: e - tLand };
      const u = e / tLand;
      return { x: tl.x + (rest[0] - tl.x) * u, y: -SL / 2 - 0.5 * GRAV * e * e, z: tl.z + (rest[2] - tl.z) * u, rx: tl.rx * u, ry: tl.ry * u, rz: tl.rz * u, landed: -1 };
    }

    return {
      group: G, sky: null, shadowCol: 0x1a1214,
      light() { lights(0x8a7068, 0xffd8a0, [0.3, -0.7, -0.5], 0x2a1a20, [14, 60], 9); },
      anim(t, P = {}) {
        const s = shotT(t, P), tf = t, bt = beat(tf), hb = fr(bt), zone = P.zone || 'club';
        const caved = !!P.fallen || (P.cave != null && s >= P.cave);
        // ---------- lights by zone ----------
        if (zone === 'flat') {
          lights(0x6a5a50, 0xffe0b0, [0.2, -0.8, -0.4], 0x1a1414, [10, 40], 7);
          pt(0, F.LAMP[0], FY + 1.55, F.LAMP[1], 1.35, 1.1, 0.75); pt(1, F.PENDANT[0], -1.1, F.PENDANT[1], 1.0, 0.9, 0.7);
          if (caved) { pt(2, 0, 1.6, -1.0, 1.4, 1.15, 0.7); pt(3, -1.5, -1.2, 1.2, 0.9, 0.6, 0.8); }
        } else if (zone === 'cut') {
          lights(0x7a6a62, 0xffe0b0, [0.2, -0.7, -0.6], 0x140c10, [16, 50], 8);
          pt(0, -1.0, 3.4, -2.0, 1.4, 1.1, 0.7); pt(1, 2.0, 2.6, 0.5, 1.2, 0.85, 0.9);
          pt(2, F.LAMP[0], FY + 1.55, F.LAMP[1] + 0.8, 1.3, 1.05, 0.7); pt(3, F.PENDANT[0], -1.1, F.PENDANT[1] + 0.6, 0.9, 0.85, 0.65);
          if (P.fallen) { pt(1, 0.5, 0.8, -1.0, 1.5, 1.2, 0.75); pt(3, 1.0, FY + 1.6, 1.5, 1.0, 0.9, 0.75); }   // the cave-in done: the club's light pours into her flat
        } else {
          lights(0x8a7068, 0xffd8a0, [0.3, -0.7, -0.5], 0x2a1a20, [14, 60], 9);
          pt(0, 0, 3.6, -6.4, 1.6, 1.25, 0.6); pt(1, 0, 4.2, -1.0, 1.25, 1.1, 0.95); pt(2, -4.5, 3.0, 0.5, 1.0, 0.45, 0.75); pt(3, 4.5, 3.0, -1.5, 0.9, 0.6, 1.0);
        }
        if (P.key) pt(3, P.key[0], P.key[1], P.key[2], P.key[3], P.key[4], P.key[5]);
        clubFront.visible = zone === 'club'; flatFront.visible = zone === 'flat'; cutG.visible = zone === 'cut'; lampG.visible = !P.noLamp; tableG.visible = !P.noTable;
        // ---------- the club: the bars pulse, the chandeliers turn a little, tiles light on the beat ----------
        const pulse = Math.exp(-hb * 4);
        bars.forEach((b, i) => { b.material.uniforms.uCol.value.setRGB(1, 0.82, 0.44).multiplyScalar(P.flash ? 1.3 : 0.8 + 0.35 * (i % 2 === Math.floor(bt) % 2 ? pulse : 0.3)); });
        chandeliers.forEach((c, i) => { c.rotation.y = 0.15 * Math.sin(tf * 0.6 + i); });
        // the tunnel's head (`ridge` [x0, z0, x1, z1, s0, s1, hold]: hold keeps it stalled at its end)
        const rg = P.ridge, rOn = !!rg && s >= rg[4] && (s <= rg[5] + 0.3 || !!rg[6]) && !caved;
        const rp = rOn ? (u => [rg[0] + (rg[2] - rg[0]) * u, rg[1] + (rg[3] - rg[1]) * u])(sm((s - rg[4]) / (rg[5] - rg[4]))) : null;
        // the sag: upstairs the tiles dip round the impact point; from below (zone 'flat') the smooth belly shows instead
        const bellyOn = zone === 'flat' && (P.sag || 0) > 0 && !caved, bellyDrop = 0.5 * (P.sag || 0);
        const ceilY = (x, z) => bellyOn ? -SL - 0.004 - bellyDrop * bellyProf(x, z) : -SL;
        belly.visible = bellyOn; bellyCracks.visible = bellyOn && (P.cracks || 0) > 0;
        if (bellyOn) { belly.scale.y = bellyDrop; bellyCracks.scale.y = bellyDrop; }
        tiles.forEach(tl => {
          const st = tileState(tl, s, P); tl.st = null; tl.g.visible = true;
          if (!st) {
            const [ax, az] = P.caveAt || [F.KOB[0], -1.0], dd = Math.hypot(tl.x - ax, tl.z - az), g = (zone === 'flat' ? 0 : P.sag || 0) * Math.max(0, 1 - dd / 3.6);
            let y = -SL / 2 - 0.3 * g, rx = 0.12 * g * Math.sign(az - tl.z), rz = -0.12 * g * Math.sign(ax - tl.x);
            if (rp) {   // the tunnel lifts the tiles over its head and tips them away from it; the ones it passed stay raised, askew
              const vx = rg[2] - rg[0], vz = rg[3] - rg[1], vl = Math.hypot(vx, vz) || 1;
              let dx = tl.x - rp[0], dz = tl.z - rp[1], d = Math.hypot(dx, dz);
              if (d < 0.25) { dx = vx / vl * 0.25; dz = vz / vl * 0.25; d = 0.25; }   // the tile over its head tips up ahead of it, like a wave
              const h = 0.42 * Math.max(0, 1 - d / 1.25) * (0.88 + 0.12 * Math.sin(s * 26 + tl.i)), ang = Math.atan2(h, 0.9);   // the near edge's rise, the tilt
              const tr = d > 0.6 && segDist(tl.x, tl.z, rg[0], rg[1], rp[0], rp[1]) < 0.6;
              y += h * 0.5 + (tr ? 0.07 : 0);
              rx += ang * dz / d; rz -= ang * dx / d;
              if (tr) { rx += 0.34 * (hash(tl.i, tl.j, 8) - 0.5); rz += 0.34 * (hash(tl.i, tl.j, 9) - 0.5); }
            }
            tl.g.position.set(tl.x, y, tl.z); tl.g.rotation.set(rx, 0, rz); tl.lit.visible = !caved && hash(tl.i, tl.j, Math.floor(bt)) < 0.18 && hb < 0.6; return;
          }
          tl.lit.visible = false; tl.g.position.set(st.x, st.y, st.z); tl.g.rotation.set(st.rx, st.ry, st.rz);
          if (st.landed >= 0 && offLine(P, st.x, st.z)) { tl.g.visible = false; return; }
          tl.st = st;
        });
        // ---------- holes ----------
        const HL = (P.holes || []).filter(d => !caved || d[5] != null);   // a hole in the club's floor goes with the cave-in; one in the flat's floor (y given) stays
        holes.forEach((h, q) => {
          const d = HL[q], hide = () => { h.top.visible = h.bot.visible = h.rim.visible = false; h.shards.forEach(m => { m.visible = false; }); };
          if (!d) { hide(); return; }
          const [x, z, r, s0, s1, hy] = d, y0 = hy ?? 0, rr = r * (s1 > s0 ? sm((s - s0) / (s1 - s0)) : s >= s0 ? 1 : 0);
          if (rr < 0.02) { hide(); return; }
          h.top.visible = true; h.bot.visible = h.rim.visible = hy == null; h.shards.forEach(m => { m.visible = true; });
          h.top.position.set(x, y0 + 0.006, z); h.top.scale.setScalar(rr);
          const by = bellyOn ? ceilY(x, z) - 0.012 : -SL - 0.006;   // on the belly when it sags
          h.bot.position.set(x, by, z); h.bot.scale.setScalar(rr * 0.92); h.rim.position.set(x, by + 0.002, z); h.rim.scale.setScalar(rr);
          h.shards.forEach((m, i) => { const a = i * TAU / 9 + q, rd = rr * (1.0 + 0.12 * hash(q, i)); m.position.set(x + Math.cos(a) * rd, y0 + 0.04, z + Math.sin(a) * rd); m.rotation.set(0.5 * Math.sin(a), -a, 0.5 * Math.cos(a)); m.scale.setScalar(0.6 + 0.6 * Math.min(1, rr / 0.4)); });
        });
        // ---------- the digger's spray: out behind him on every half beat ----------
        const dg = P.dig, digOn = !!dg && s >= dg[2] && s < dg[3];
        spray.forEach((m, i) => {
          m.visible = digOn && (dg[5] == null || i < 14); if (!m.visible) return;
          const hbt = bt * 2 + hash(i, 7) * 0.9, e = fr(hbt), a = (dg[4] ?? 180) * PI / 180 + (hash(i, Math.floor(hbt)) - 0.5) * 1.6, d = 0.3 + 0.9 * hash(i, 3), up = (0.4 + 0.5 * hash(i, 5)) * (dg[5] != null ? 1.9 : 1);
          m.position.set(dg[0] + Math.sin(a) * d * e, (dg[5] ?? 0) + 0.05 + up * 4 * e * (1 - e), dg[1] + Math.cos(a) * d * e); m.rotation.set(e * 9 + i, e * 6, i); m.scale.setScalar(dg[5] != null ? 1.35 : 1);   // her parquet: planks (bigger and more piled into a heap against her armchair, review 2)
        });
        // ---------- plaster falling in the flat, dust sifting on the beat, the pendant swinging ----------
        const pl = P.plaster || [];
        chunks.forEach((m, i) => {
          m.visible = false; if (!pl.length) return;
          const d = pl[i % pl.length], e = s - d[2] - Math.floor(i / pl.length) * 0.13 - hash(i, 2) * 0.1; if (e < 0) return;
          const drop = -SL - FY, tl = Math.sqrt(2 * drop / GRAV), y = e < tl ? -SL - 0.5 * GRAV * e * e : FY + 0.03;
          m.visible = true; m.position.set(d[0] + (hash(i, 3) - 0.5) * 0.5, y, d[1] + (hash(i, 4) - 0.5) * 0.5); m.rotation.set(e < tl ? e * 7 : 0.2, i, e < tl ? e * 5 : 0.1);
        });
        const partyOn = P.party !== false && !caved, dA = P.dustAt;
        dust.forEach((m, i) => {   // a burst let go on every beat, each falling the room's height over four beats
          m.visible = partyOn && zone !== 'club'; if (!m.visible) return;
          const g = i % 2, k = Math.floor((bt - g) / 2) * 2 + g, e = (bt - k) / 2;
          const x = dA ? dA[0] + (hash(i, k, 2) - 0.5) * 2 * dA[2] : DX0 + 0.3 + hash(i, k, 2) * (DX1 - DX0 - 0.6), z = dA ? dA[1] + (hash(i, k, 3) - 0.5) * 2 * dA[2] : DZ0 + 0.3 + hash(i, k, 3) * (DZ1 - DZ0 - 0.6);
          const top = ceilY(x, z) - 0.03;
          m.position.set(x + 0.04 * Math.sin(e * 9 + i), top - (top - FY) * e, z + 0.04 * Math.cos(e * 7 + i)); m.rotation.set(e * 6 + i, e * 4, i);
        });
        const pr = P.pour || [];
        grit.forEach((m, i) => {   // a stream out of each pour point, widening as it falls
          m.visible = false; if (!pr.length || zone === 'club' || caved) return;
          const d = pr[i % pr.length]; if (s < (d[2] ?? -9)) return;
          const c = s / 0.8 + hash(i, 21), e = fr(c), n = Math.floor(c), top = ceilY(d[0], d[1]) - 0.02;
          m.visible = true; m.position.set(d[0] + (hash(i, n, 22) - 0.5) * (0.08 + 0.5 * e), top - (top - FY) * e * e, d[1] + (hash(i, n, 23) - 0.5) * (0.08 + 0.5 * e)); m.rotation.set(e * 8 + i, e * 5, i);
        });
        pend.rotation.set(partyOn ? (P.swing ?? 0.14) * Math.sin(bt * PI) : 0, 0, partyOn ? 0.06 * Math.cos(bt * PI) : 0); pend.visible = !caved;   // it came down with her ceiling
        cracks.visible = (P.cracks || 0) > 0 && !caved && !bellyOn; if (cracks.visible) cracks.scale.setScalar(0.4 + 0.6 * P.cracks);
        // ---------- the tunnel: splinters popping off the heaving tiles over its head ----------
        ridge.visible = rOn;
        if (rOn) {
          ridge.position.set(rp[0], 0.2, rp[1]);
          ridgeShards.forEach((sh, i) => { const c = s * 3.2 + i / 8, e = fr(c), a = i * TAU / 8 + Math.floor(c) * 1.7; sh.position.set(Math.cos(a) * (0.25 + 0.5 * e), 0.05 + 1.6 * e * (1 - e), Math.sin(a) * (0.25 + 0.5 * e)); sh.rotation.set(e * 9 + i, e * 5, i); });
        }
        // ---------- the cave-in: debris tumbling with the floor, dust bursting off the break, the club's light after ----------
        debris.forEach((m, i) => {
          m.visible = false; if (P.cave == null && !P.fallen) return;
          const [ax, az] = P.caveAt || [F.KOB[0], -1.0], a = hash(i, 14) * TAU, rr = 0.6 + 2.6 * hash(i, 15), x0 = ax + Math.cos(a) * rr, z0 = az + Math.sin(a) * rr;
          if (x0 < DX0 || x0 > DX1 || z0 < DZ0 || z0 > DZ1) return;
          const e = P.fallen ? 9 : s - P.cave - 0.04 * rr - 0.05 * hash(i, 16); if (e < 0) return;
          let lx = x0 + (hash(i, 17) - 0.5) * 0.8, lz = z0 + (hash(i, 18) - 0.5) * 0.8;
          const kd = Math.hypot(lx - F.KOB[0], lz - F.KOB[1]); if (kd < 0.85) { lx = F.KOB[0] + (lx - F.KOB[0]) * 0.85 / Math.max(kd, 0.05); lz = F.KOB[1] + (lz - F.KOB[1]) * 0.85 / Math.max(kd, 0.05); }
          for (const [kx2, kz2, kr] of (P.keep || [])) { const dx = lx - kx2, dz = lz - kz2, dd = Math.hypot(dx, dz); if (dd < kr) { lx = kx2 + dx * (kr + 0.05) / Math.max(dd, 0.05); lz = kz2 + dz * (kr + 0.05) / Math.max(dd, 0.05); } }
          const restY = FY + 0.06, tl = Math.sqrt(2 * (-0.2 - restY) / GRAV);
          if (e >= tl) { if (offLine(P, lx, lz)) return; m.visible = true; m.position.set(lx, restY, lz); m.rotation.set(0.3 * hash(i, 19), hash(i, 20) * TAU, 0.25); return; }
          const u = e / tl; m.visible = true; m.position.set(x0 + (lx - x0) * u, -0.2 - 0.5 * GRAV * e * e, z0 + (lz - z0) * u); m.rotation.set(e * 7 + i, e * 5, e * 3);
        });
        breakPuffs.forEach((m, i) => {   // dust boiling off the break, behind the falling floor
          m.visible = false; if (P.cave == null) return;
          const e = s - P.cave - 0.06 * (i % 4); if (e < 0 || e > 1.4) return;
          m.visible = true; m.position.set(-1.6 + 4.2 * hash(i, 31), -0.3 - 1.4 * e, -3.6 + 1.0 * hash(i, 32)); m.scale.set((0.25 + 0.35 * e) * (0.8 + 0.4 * hash(i, 33)), (0.18 + 0.25 * e), (0.25 + 0.35 * e)); m.rotation.y = i;   // small flattened clouds (big round ones read as balloons)
        });
        shafts.forEach(m => { m.visible = zone !== 'club' && caved && P.shafts !== false; });
        // ---------- whacks: a ring and stars off the floor ----------
        const live = (P.whacks || []).filter(q => s >= q[2] && s < q[2] + 0.55);
        whacks.forEach((w, i) => {
          const d = live[live.length - 1 - i]; w.g.visible = !!d; if (!d) return;
          const e = (s - d[2]) / 0.55; w.g.position.set(d[0], 0.25, d[1]); w.g.rotation.set(0, (P.whackYaw ?? 0) * PI / 180, 0);
          w.ring.scale.setScalar(0.12 + 0.5 * Math.sqrt(e)); w.ring.visible = e < 0.75;
          w.st.forEach((m, j) => { const a = j * TAU / 5 + 0.4, r = 0.14 + 0.45 * Math.sqrt(e); m.position.set(Math.cos(a) * r, Math.sin(a) * r + 0.1, 0.02); m.scale.setScalar(0.1 * (1 - 0.5 * e)); m.rotation.z = e * 2 + j; });
        });
        // ---------- the cave-in's dust clouds on the flat's floor ----------
        puffs.forEach((m, i) => {
          m.visible = false; if (P.cave == null) return;
          const e = s - P.cave - 0.5 - hash(i, 9) * 0.25; if (e < 0 || e > 2.2) return;
          const a = i * TAU / 16, r = 1.0 + 2.2 * Math.sqrt(e / 2.2) * (0.6 + 0.4 * hash(i, 2));
          m.visible = true; m.position.set(F.KOB[0] + Math.cos(a) * r, FY + 0.3 + 0.5 * e, -1.0 + Math.sin(a) * r); m.scale.setScalar(0.8 + 0.9 * e);
        });
        // ---------- the guests ----------
        const where = P.where || 'club', gm = P.guests ?? 'dance', sp = P.spots;   // `spots` [[x, z, mode?] | null]: this shot's marks (the guests it leaves out are hidden), facing `spotsAt` [x, z]
        guests.forEach((q, i) => {
          let x, z, mode = gm;
          if (sp) { const p = sp[i]; if (!p) { q.g.visible = false; return; } [x, z] = p; if (p[2]) mode = p[2]; }
          else [x, z] = where === 'flat' ? q.flatHome : q.home;
          let y = sp && sp[i][3] != null ? sp[i][3] : where === 'flat' ? FY : 0;   // a 4th value stands it on something (the stage)
          q.g.visible = !!mode && !P.noguests && !cleared(P, x, z); if (!q.g.visible) return;
          if (where === 'club' && P.cave != null) {   // on a tile that falls: down with it
            const tl = tiles.find(c => Math.abs(c.x - x) <= 0.5 && Math.abs(c.z - z) <= 0.5), st = tl ? tileState(tl, s, P) : null;
            if (st) { x = st.x; z = st.z; y = st.y + SL / 2; mode = st.landed >= 0 ? 'fall' : 'gasp'; }
          }
          if (where === 'flat' && caved) for (const tl of tiles) { const st = tl.st; if (st && st.landed >= 0 && Math.hypot(st.x - x, st.z - z) < 0.55) y = Math.max(y, st.y + SL / 2 - 0.03); }   // dancing on the rubble
          const yaw = P.spotsAt ? Math.atan2(P.spotsAt[0] - x, P.spotsAt[1] - z) : where === 'flat' ? Math.atan2(F.KOB[0] - x, F.KOB[1] + 1.5 - z) : Math.atan2(-x, -1.0 - z);
          q.g.position.set(x, y, z); q.g.rotation.y = yaw;
          pose(q, mode, tf, bt + i * 0.17, P, x, z, yaw);
        });
        dj.g.visible = !P.noguests; if (dj.g.visible) { pose(dj, 'dance', tf, bt, {}, djx, djz, 0); dj.arms.forEach((a, j) => { a.rotation.x = -1.3 - 0.3 * Math.abs(Math.sin(bt * PI + j)); }); }
        boxPets.forEach((q, i) => { q.g.visible = !P.noguests; if (q.g.visible) pose(q, gm === 'dance' ? 'cheer' : gm === 'fall' ? 'gasp' : gm || 'watch', tf, bt + i * 0.3, P, q.g.position.x, q.g.position.z, q.g.rotation.y); });
        hearts.forEach((h, i) => {
          const q = (P.hearts || [])[Math.floor(i / 3)]; h.visible = false; if (!q) return;
          let e = s - q[3] - (i % 3) * 0.3; if (q[4] && e > 0) e %= 1.2;
          if (e < 0 || e > 1.4) return;
          h.visible = true; h.position.set(q[0] + ((i % 3) - 1) * 0.22 + 0.06 * Math.sin(e * 6 + i), q[1] + 0.55 * e, q[2]); h.scale.setScalar(Math.min(1, e * 5) * (1.15 - 0.25 * (e / 1.4)));
          h.rotation.y = (P.heartYaw ?? 0) * PI / 180;
        });
        const cf = P.confetti != null && s >= P.confetti; confG.visible = cf;
        if (cf) { confAnim(tf); const [qx, qz] = P.confAt || [0, -1]; confG.position.set(qx, where === 'flat' ? FY : 0, qz); }
      },
    };
  }

  return { floorclub: floorclub() };
}
