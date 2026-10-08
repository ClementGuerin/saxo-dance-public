// maps36.js: the "Poker Face" map (2026-10-08 2nd, Lady Gaga, 2008; the clip: a white modernist villa by a pool at
// night, two harlequin Great Danes lying either side of the pool, the singer rising from the water in a mirrored visor,
// a poker table with red chips under a red-orange canopy, a party on white sofas). Same contract as the other map
// files, pure in t:
//   mansion  the pool deck of a white villa at night (y = 0): the pool (POOL x0..x1, z0..z1: the water at WATER_Y, its
//            floor at FLOOR_Y, three steps down from the middle of its near side, STEPS, their tops at STEP_Y) glowing teal, the
//            villa behind it (its glass walls lit warm), palms, white loungers, a white statue; two harlequin Great
//            Danes lying on the deck at the pool's near edge, facing +z (DANES); the poker table under a red-orange
//            arch (TABLE its centre, TABLE_R, the felt at TABLE_Y) with four chairs (SEATS: saxo, sadi, kob, compote;
//            their seat tops at CHAIR_Y, each facing the table's centre) and the famous painting's green-shaded lamp
//            hanging over it.
// Flags read by anim(t, P) (s = seconds into the shot):
//   cards    { <seat>: { c: ['As', 'Ah'], up: true | s (face up from s), peek: s (the near edges lift for 1.4 s),
//            fold: s (they fly to the middle, face down; foldUp: they land face up; slide: true, they slide along the felt
//            instead, under a claw), show: s (flipped face up where they lie), r: their distance from the centre (0.43;
//            0.66 puts them under the player's paws) } }: each seat's two cards on the felt in front of it (face down unless told); a seat left out
//            has no cards
//   deal     [s0, gap]: the eight cards fly from the dealer's paws (Kob's seat) to the seats in turn, landing face down
//   stacks   { <seat>: n }: biscuit chips stacked in front of each seat (columns of six; towers of ten past 24);
//            stackAt { <seat>: [r, tn] }: that seat's stack starts there (0.7, -0.12: under the player's paws, for a shove)
//   pot      n: a heap of biscuits in the middle of the felt
//   push     [[seat, s0, dur]]: that seat's stack slides into the middle (all in)
//   rake     [seat, s0, dur, tn]: the heap slides to that seat (tn: that far along the rail to the side, off the
//            winner's own cards)
//   potIn    [seat, s0, dur]: the heap slides in from that seat (a bet pushed into the middle)
//   kick     [s, x, z]: the heap flies off the table in arcs into the pool round (x, z), splashing in, then bobs there
//   floaters [x, z, n]: n biscuits bobbing on the water round (x, z)
//   splash   [[x, z, s, size]]: a burst of droplets and a ring on the water
//   swing    deg: the lamp swings on the beat
//   bump     s: everything on the felt jumps (a paw slammed on the table); a card's `turn`: shown to the table (it reads from across it)
//   hearts   [[x, y, z, s0, loop]]: three pink hearts pop and rise from each point (loop: again every 1.2 s); heartYaw deg
//   danes    'watch' (heads up, still) | 'tilt' (heads tilting on the beat) | [x, z] (both heads turn to look there) | false
//   noLamp, noArch, chairs { <seat>: false } (that chair hidden), clear [[x, z, r]] (no lounger, palm or statue there),
//   key [x, y, z, r, g, b], glow (the pool's light, default 1)
// Never name a flag like a shot field: `crowd`, `cam`, `still`, `focus` are taken.
import { mapKit } from './mapkit.js';

export const MANSION = {
  POOL: { x0: -4.5, x1: 4.5, z0: -6.8, z1: -2.6 }, WATER_Y: -0.1, FLOOR_Y: -1.3,
  STEPS: { x0: -0.6, x1: 0.6, z1: -2.6, d: 0.42 }, STEP_Y: [-0.35, -0.62, -0.88],
  DANES: [[-1.0, -1.5], [1.0, -1.5]],                 // flanking the steps like sphinxes (a portrait frame holds both from ~3 m)
  TABLE: [0, 3.0], TABLE_R: 0.8, TABLE_Y: 0.56, CHAIR_Y: 0.42, SEAT_R: 1.18,   // 5.6 m from the pool: room for lenses between
  SEATS: { saxo: [0, 1.82, 0], kob: [0, 4.18, 180], sadi: [-1.18, 3.0, 90], compote: [1.18, 3.0, -90] },   // x, z, yaw (facing the table)
  LAMP_Y: 2.0, VILLA_Z: -10.5,                        // the shade's rim over the seated heads (at 1.78 it cut the top of a face across the table)
};

export function buildMansionMaps(K) {
  const k = mapKit(K);
  const { THREE, mat, tex, px, noise, box, TAU, PI, beat, hash, cyl, cone, ico, at, rot, flat, lights, pt, stars, selfLit, U } = k;
  const M = (c, o = {}) => mat({ color: c, ...o }), glow = (c, u = 1) => mat({ color: c, unlit: u });
  const shotT = (t, P) => P.t0 != null ? t - P.t0 : 0;
  const cl = x => Math.max(0, Math.min(1, x)), sm = x => { x = cl(x); return x * x * (3 - 2 * x); };
  const cleared = (P, x, z) => (P.clear || []).some(([cx, cz, r]) => (x - cx) ** 2 + (z - cz) ** 2 < r * r);
  const { POOL, WATER_Y, FLOOR_Y, STEPS, STEP_Y, DANES, TABLE, TABLE_R, TABLE_Y, CHAIR_Y, SEATS, LAMP_Y, VILLA_Z } = MANSION;
  const SEAT_NAMES = ['saxo', 'sadi', 'kob', 'compote'];
  const [TX, TZ] = TABLE;
  // each seat's direction from the table's centre (a unit vector on the floor)
  const seatDir = n => { const [x, z] = SEATS[n], dx = x - TX, dz = z - TZ, L = Math.hypot(dx, dz); return [dx / L, dz / L]; };

  // ---------- cards: a white face with the rank and a big suit, a red back with a white border ----------
  const SUIT = { s: '#16161c', c: '#16161c', h: '#d81e2c', d: '#d81e2c' };
  function suitPath(x, s, cx, cy, r) {
    x.fillStyle = SUIT[s]; x.beginPath();
    if (s === 'h' || s === 's') {
      const sg = s === 'h' ? 1 : -1, yy = cy - sg * r * 0.25;
      x.moveTo(cx, cy + sg * r); x.bezierCurveTo(cx - r * 1.3, yy, cx - r * 0.6, yy - sg * r * 1.0, cx, yy - sg * r * 0.35);
      x.bezierCurveTo(cx + r * 0.6, yy - sg * r * 1.0, cx + r * 1.3, yy, cx, cy + sg * r); x.fill();
      if (s === 's') { x.beginPath(); x.moveTo(cx, cy + r * 0.2); x.lineTo(cx - r * 0.35, cy + r * 1.05); x.lineTo(cx + r * 0.35, cy + r * 1.05); x.fill(); }
    } else if (s === 'd') { x.moveTo(cx, cy - r * 1.1); x.lineTo(cx + r * 0.8, cy); x.lineTo(cx, cy + r * 1.1); x.lineTo(cx - r * 0.8, cy); x.fill(); }
    else {
      for (const [ox, oy] of [[0, -0.5], [-0.55, 0.15], [0.55, 0.15]]) { x.beginPath(); x.arc(cx + ox * r, cy + oy * r, r * 0.45, 0, TAU); x.fill(); }
      x.beginPath(); x.moveTo(cx, cy); x.lineTo(cx - r * 0.35, cy + r * 1.05); x.lineTo(cx + r * 0.35, cy + r * 1.05); x.fill();
    }
  }
  const faceTex = {}, backT = tex(24, 34, x => {
    px(x, '#f6f2ea', 0, 0, 24, 34); px(x, '#c8202e', 2, 2, 20, 30);
    for (let yy = 4; yy < 31; yy += 4) for (let xx = 4 + (yy % 8 ? 2 : 0); xx < 21; xx += 4) px(x, '#e8505a', xx, yy, 2, 2);
  }, 3601);
  function cardFace(code) {
    if (faceTex[code]) return faceTex[code];
    const r = code[0] === 'T' ? '10' : code[0], s = code[1];
    faceTex[code] = tex(24, 34, x => {
      px(x, '#f8f6f0', 0, 0, 24, 34); px(x, '#c8c4bc', 0, 0, 24, 1); px(x, '#c8c4bc', 0, 33, 24, 1); px(x, '#c8c4bc', 0, 0, 1, 34); px(x, '#c8c4bc', 23, 0, 1, 34);
      x.font = 'bold 11px monospace'; x.textAlign = 'left'; x.textBaseline = 'top'; x.fillStyle = SUIT[s]; x.fillText(r, 2, 1);
      suitPath(x, s, 12, 21, 6.5);
    }, 3602 + code.charCodeAt(0) * 7 + code.charCodeAt(1));
    return faceTex[code];
  }
  const CW = 0.2, CL = 0.28, CT = 0.008;
  function cardMesh() {
    // pivots: g (on the felt, turned to face its seat) > flip (about the card's long axis) > hinge (its far edge) > mesh
    const g = new THREE.Group(), flip = new THREE.Group(), hinge = new THREE.Group(); g.add(flip); flip.add(hinge);
    const side = M(0xe8e4dc), faceM = mat({ map: cardFace('As'), unlit: 0.35 }), backM = mat({ map: backT, unlit: 0.35 });
    const m = new THREE.Mesh(new THREE.BoxGeometry(CW, CT, CL), [side, side, faceM, backM, side, side]);
    hinge.position.z = -CL / 2; m.position.z = CL / 2; hinge.add(m);
    g.userData = { flip, hinge, faceM, code: null };
    return g;
  }
  const setFace = (c, code) => { if (c.userData.code !== code) { c.userData.code = code; c.userData.faceM.uniforms.map.value = cardFace(code); } };

  // ---------- a dog biscuit lying flat: a bar with two lobes at each end, golden, a little self-lit ----------
  const bisM = mat({ color: 0xd8963c, unlit: 0.35 }), bisD = mat({ color: 0xb87428, unlit: 0.3 });
  const BIS_GEO = (() => {
    const parts = [new THREE.BoxGeometry(0.17, 0.03, 0.05)];
    for (const x of [-0.085, 0.085]) for (const z of [-0.026, 0.026]) { const c = new THREE.CylinderGeometry(0.03, 0.03, 0.03, 7); c.translate(x, 0, z); parts.push(c); }
    return parts;
  })();
  const DOT_GEO = new THREE.BoxGeometry(0.08, 0.032, 0.012);
  function biscuit() { const q = new THREE.Group(); BIS_GEO.forEach(gm => q.add(new THREE.Mesh(gm, bisM))); q.add(new THREE.Mesh(DOT_GEO, bisD)); return q; }

  // ---------- a harlequin Great Dane lying like a sphinx, facing +z, its head up (~1.3 m at the crown) ----------
  const daneT = tex(16, 16, (x, r) => { px(x, '#f2f0ec', 0, 0, 16, 16); for (let i = 0; i < 3; i++) { const cx = Math.floor(r() * 11), cy = Math.floor(r() * 11), w = 4 + Math.floor(r() * 3), h = 3 + Math.floor(r() * 3); px(x, '#1a1a1e', cx, cy, w, h); px(x, '#1a1a1e', cx + 1, cy - 1, w - 2, 1); px(x, '#1a1a1e', cx + 1, cy + h, w - 2, 1); } }, 3611);   // three big patches a tile: seven small ones read as a crowd of spotted blocks behind a face
  function dane() {
    const g = new THREE.Group(), F = mat({ map: daneT, rep: [1, 1] }), DK = M(0x1a1a1e), PINK = M(0x2a2226);
    g.add(at(box(0.62, 0.5, 1.15, F), 0, 0.3, -0.25));                       // the body, lying
    g.add(at(box(0.66, 0.42, 0.5, F), 0, 0.26, -0.82));                      // the haunches
    for (const sx of [-1, 1]) {
      g.add(at(box(0.16, 0.14, 0.7, F), sx * 0.2, 0.07, 0.42));             // the front legs stretched forward
      g.add(at(box(0.18, 0.08, 0.16, F), sx * 0.2, 0.04, 0.8));             // the paws
      g.add(at(box(0.2, 0.16, 0.5, F), sx * 0.3, 0.08, -0.6));              // the hind legs tucked
    }
    g.add(at(rot(box(0.34, 0.62, 0.32, F), -0.35, 0, 0), 0, 0.72, 0.18));     // the long neck
    const head = at(new THREE.Group(), 0, 1.02, 0.3); g.add(head);
    head.add(at(box(0.4, 0.36, 0.42, F), 0, 0.08, 0));                       // the skull
    head.add(at(box(0.3, 0.26, 0.42, F), 0, -0.02, 0.34));                   // the long muzzle
    head.add(at(box(0.14, 0.09, 0.08, DK), 0, 0.06, 0.56));                  // the nose
    head.add(at(box(0.24, 0.04, 0.3, PINK), 0, -0.14, 0.38));                // the jaw line
    for (const sx of [-1, 1]) {
      head.add(at(ico(0.045, 0, DK), sx * 0.12, 0.16, 0.2)); head.add(at(ico(0.016, 0, glow(0xffffff)), sx * 0.12 + 0.015, 0.18, 0.24));
      head.add(at(rot(box(0.08, 0.3, 0.2, DK), 0, 0, sx * 0.25), sx * 0.24, 0.02, -0.02));   // the floppy ears
    }
    g.userData.head = head; return g;
  }

  function mansion() {
    const G = new THREE.Group();
    // ---------------- the deck: big pale stone tiles (1.2 m), the lawn round it ----------------
    const deckT = tex(16, 16, (x, r) => { px(x, '#bdb7ab', 0, 0, 16, 16); noise(x, r, 16, 16, ['#b6b0a4', '#c4beb2', '#b2ab9e'], 40); px(x, '#9e978a', 0, 0, 16, 1); px(x, '#9e978a', 0, 0, 1, 16); }, 3620);
    const lawnT = tex(16, 16, (x, r) => { px(x, '#2a5a3a', 0, 0, 16, 16); noise(x, r, 16, 16, ['#24503a', '#30623e', '#2a5634'], 60); }, 3621);
    // the deck in four pieces round the pool's hole
    const DX0 = -10, DX1 = 10, DZ0 = -8.6, DZ1 = 8.5, dm = (w, d) => mat({ map: deckT, rep: [w / 1.2, d / 1.2] });
    G.add(flat(DX1 - DX0, DZ1 - POOL.z1, dm(DX1 - DX0, DZ1 - POOL.z1), 0, 0, (DZ1 + POOL.z1) / 2));
    G.add(flat(DX1 - DX0, POOL.z0 - DZ0, dm(DX1 - DX0, POOL.z0 - DZ0), 0, 0, (POOL.z0 + DZ0) / 2));
    G.add(flat(POOL.x0 - DX0, POOL.z1 - POOL.z0, dm(POOL.x0 - DX0, POOL.z1 - POOL.z0), (DX0 + POOL.x0) / 2, 0, (POOL.z0 + POOL.z1) / 2));
    G.add(flat(DX1 - POOL.x1, POOL.z1 - POOL.z0, dm(DX1 - POOL.x1, POOL.z1 - POOL.z0), (DX1 + POOL.x1) / 2, 0, (POOL.z0 + POOL.z1) / 2));
    // the lawn round the deck (four pieces: one plane under everything showed through the pool's hole)
    const lawnM = (w, d) => mat({ map: lawnT, rep: [w / 2, d / 2] });
    G.add(flat(80, 40 - DZ1, lawnM(80, 40 - DZ1), 0, -0.02, (40 + DZ1) / 2)); G.add(flat(80, DZ0 + 40, lawnM(80, DZ0 + 40), 0, -0.02, (DZ0 - 40) / 2));
    G.add(flat(DX0 + 40, DZ1 - DZ0, lawnM(DX0 + 40, DZ1 - DZ0), (DX0 - 40) / 2, -0.02, (DZ0 + DZ1) / 2)); G.add(flat(40 - DX1, DZ1 - DZ0, lawnM(40 - DX1, DZ1 - DZ0), (40 + DX1) / 2, -0.02, (DZ0 + DZ1) / 2));
    // the coping: a white stone lip round the pool, 2 cm proud of the deck
    const copeM = M(0xf6f4ee), pw = POOL.x1 - POOL.x0, pd = POOL.z1 - POOL.z0;
    for (const z of [POOL.z0 - 0.15, POOL.z1 + 0.15]) G.add(at(box(pw + 0.6, 0.06, 0.3, copeM), (POOL.x0 + POOL.x1) / 2, -0.01, z));
    for (const x of [POOL.x0 - 0.15, POOL.x1 + 0.15]) G.add(at(box(0.3, 0.06, pd, copeM), x, -0.01, (POOL.z0 + POOL.z1) / 2));
    // ---------------- the pool: tiled walls and floor glowing teal, the steps, the see-through water ----------------
    const tileT = tex(16, 16, (x, r) => { px(x, '#3ac8d8', 0, 0, 16, 16); for (let i = 0; i < 16; i += 4) { px(x, '#7ae4ee', i, 0, 1, 16); px(x, '#7ae4ee', 0, i, 16, 1); } noise(x, r, 16, 16, ['rgba(255,255,255,.08)'], 20); }, 3622);
    const tileM = (w, h) => mat({ map: tileT, rep: [w / 0.8, h / 0.8], unlit: 0.45 });
    const depth = -FLOOR_Y, wallP = (w, h, m) => new THREE.Mesh(new THREE.PlaneGeometry(w, h), m);
    G.add(at(wallP(pw, depth, tileM(pw, depth)), (POOL.x0 + POOL.x1) / 2, FLOOR_Y / 2, POOL.z0));
    G.add(rot(at(wallP(pw, depth, tileM(pw, depth)), (POOL.x0 + POOL.x1) / 2, FLOOR_Y / 2, POOL.z1), 0, PI, 0));
    G.add(rot(at(wallP(pd, depth, tileM(pd, depth)), POOL.x0, FLOOR_Y / 2, (POOL.z0 + POOL.z1) / 2), 0, PI / 2, 0));
    G.add(rot(at(wallP(pd, depth, tileM(pd, depth)), POOL.x1, FLOOR_Y / 2, (POOL.z0 + POOL.z1) / 2), 0, -PI / 2, 0));
    G.add(flat(pw, pd, tileM(pw, pd), (POOL.x0 + POOL.x1) / 2, FLOOR_Y, (POOL.z0 + POOL.z1) / 2));
    // three steps down from the middle of the near side (each STEPS.d deep; the top one just under the water)
    STEP_Y.forEach((y, i) => { const z1 = STEPS.z1 - i * STEPS.d; G.add(at(box(STEPS.x1 - STEPS.x0, y - FLOOR_Y, STEPS.d, M(0xe8f8fa, { unlit: 0.3 })), (STEPS.x0 + STEPS.x1) / 2, (y + FLOOR_Y) / 2, z1 - STEPS.d / 2)); });
    // underwater lights in the far wall
    for (let i = 0; i < 5; i++) G.add(at(box(0.3, 0.2, 0.02, glow(0xd8ffff)), POOL.x0 + 1.0 + i * 1.75, -0.65, POOL.z0 + 0.012));
    const waterT = tex(32, 32, (x, r) => { px(x, '#38d8ea', 0, 0, 32, 32); for (let i = 0; i < 26; i++) { const xx = Math.floor(r() * 30), yy = Math.floor(r() * 30); px(x, '#a8f4fa', xx, yy, 2 + Math.floor(r() * 4), 1); } }, 3623);
    const waterM = mat({ map: waterT, rep: [pw / 2.2, pd / 2.2], unlit: 0.7, see: 0.45 });
    const water = flat(pw, pd, waterM, (POOL.x0 + POOL.x1) / 2, WATER_Y, (POOL.z0 + POOL.z1) / 2); G.add(water);
    // ---------------- the villa: two stacked white boxes with long glass walls lit warm, flat roofs ----------------
    const glassT = (seed) => tex(32, 16, (x, r) => { px(x, '#ffcf88', 0, 0, 32, 16); for (let i = 0; i < 32; i += 4) px(x, '#3a3226', i, 0, 1, 16); px(x, '#3a3226', 0, 0, 32, 1); px(x, '#3a3226', 0, 15, 32, 1); for (let i = 0; i < 5; i++) px(x, ['#ffe2b0', '#f2b070', '#ffd6a0'][i % 3], Math.floor(r() * 30), 2 + Math.floor(r() * 10), 2, 4); selfLit(x, 32, 16); }, seed);
    const WHITE = M(0xf4f2ec, { unlit: 0.12 }), vz = VILLA_Z;
    G.add(at(box(19, 3.3, 5, WHITE), 0, 1.65, vz - 2.5));
    G.add(at(new THREE.Mesh(new THREE.PlaneGeometry(15, 2.6), mat({ map: glassT(3624), rep: [3, 1], unlit: 0.85 })), -0.5, 1.4, vz + 0.02));
    G.add(at(box(14, 3.0, 5.6, WHITE), 2.5, 4.8, vz - 2.2));
    G.add(at(new THREE.Mesh(new THREE.PlaneGeometry(11, 2.1), mat({ map: glassT(3625), rep: [2.5, 1], unlit: 0.85 })), 3.0, 4.75, vz + 0.62));
    G.add(at(box(14.6, 0.18, 6.4, WHITE), 2.5, 6.38, vz - 2.0)); G.add(at(box(19.6, 0.18, 5.8, WHITE), 0, 3.36, vz - 2.3));
    // ---------------- the sky: a deep teal night (the clip's colour), stars, a moon ----------------
    const skyT = tex(4, 64, x => { const gr = x.createLinearGradient(0, 0, 0, 64); [[0, '#03141c'], [0.32, '#0a3440'], [0.47, '#1a5a64'], [0.5, '#2a6a6c'], [1, '#2a6a6c']].forEach(([o, c]) => gr.addColorStop(o, c)); x.fillStyle = gr; x.fillRect(0, 0, 4, 64); }, 3626);
    G.add(new THREE.Mesh(new THREE.SphereGeometry(185, 16, 12), mat({ map: skyT, unlit: 1, side: THREE.BackSide, nofog: 1 })));
    G.add(stars(140, 175, 3627, 0xe8fff8, 0.45));
    G.add(at(new THREE.Mesh(new THREE.CircleGeometry(6, 14), mat({ color: 0xf6fff0, unlit: 1, nofog: 1 })), -60, 62, -150));
    // a dark tree line all round, past the lawn
    const treeM = M(0x0e2a24, { unlit: 0.1 });
    for (let i = 0; i < 48; i++) { const a = i / 48 * TAU, d = 34 + hash(i, 3628) * 6; G.add(at(ico(4 + hash(i, 3629) * 3, 1, treeM), Math.sin(a) * d, 3 + hash(i, 3630) * 2, Math.cos(a) * d)); }
    // ---------------- palms, white loungers along the pool, a white statue ----------------
    const extras = [];
    const PALMS = [[-7.6, -4.0], [7.4, -4.6], [-8.2, 3.6], [8.0, 4.4], [-6.0, -8.2], [6.6, -8.0]];
    const trunk = M(0x8a6a4a), frond = M(0x2a7a46), frond2 = M(0x3a8a52);
    PALMS.forEach(([x, z], i) => {
      const p = at(new THREE.Group(), x, 0, z), sg = i % 2 ? -1 : 1; G.add(p); extras.push([p, x, z]);
      for (let j = 0; j < 6; j++) p.add(rot(at(cyl(0.16 - j * 0.01, 0.18 - j * 0.01, 1.0, 6, trunk), 0.04 * j * j * sg, 0.5 + j * 0.95, 0), 0, 0, -0.04 * j * sg));
      const top = at(new THREE.Group(), sg, 5.9, 0); p.add(top);
      for (let j = 0; j < 7; j++) { const h = new THREE.Group(); h.rotation.set(0, j / 7 * TAU, 0.0); const f = at(box(0.5, 0.04, 2.4, j % 2 ? frond : frond2), 0, -0.45, 1.1); f.rotation.x = 0.4; h.add(f); top.add(h); }
    });
    const lounger = (x, z, yaw) => {
      const l = at(new THREE.Group(), x, 0, z); l.rotation.y = yaw; G.add(l); extras.push([l, x, z]);
      l.add(at(box(0.7, 0.1, 1.9, M(0xf6f6f2)), 0, 0.3, 0)); const back = at(box(0.7, 0.08, 0.7, M(0xf6f6f2)), 0, 0.52, -0.75); back.rotation.x = -0.7; l.add(back);
      for (const [sx, sz] of [[-0.3, -0.85], [0.3, -0.85], [-0.3, 0.85], [0.3, 0.85]]) l.add(at(box(0.05, 0.26, 0.05, M(0xb8b8b4)), sx, 0.13, sz));
    };
    lounger(-6.0, -5.6, 0); lounger(-6.0, -3.3, 0); lounger(6.0, -5.6, 0); lounger(6.0, -3.3, 0);
    {
      const st = at(new THREE.Group(), -5.6, 0, 0.6); G.add(st); extras.push([st, -5.6, 0.6]);
      st.add(at(box(0.6, 0.9, 0.6, M(0xf2f0ea)), 0, 0.45, 0)); st.add(at(box(0.3, 0.8, 0.22, M(0xf6f4ee)), 0, 1.3, 0)); st.add(at(ico(0.16, 1, M(0xf6f4ee)), 0, 1.86, 0));
      for (const sx of [-1, 1]) st.add(rot(at(box(0.08, 0.5, 0.08, M(0xf6f4ee)), sx * 0.22, 1.4, 0), 0, 0, sx * 0.3));
    }
    // garden lights along the deck's far edge
    for (let i = 0; i < 10; i++) G.add(at(box(0.12, 0.3, 0.12, glow(0xfff0c8, 0.9)), -9 + i * 2, 0.15, 8.2));

    // ---------------- the arch over the table: four slim white posts, a red-orange curved canopy ----------------
    const arch = new THREE.Group(); G.add(arch);
    const ORANGE = M(0xe8582a, { unlit: 0.2, side: THREE.DoubleSide });
    for (const [sx, sz] of [[-2.15, -0.95], [2.15, -0.95], [-2.15, 0.95], [2.15, 0.95]]) arch.add(at(cyl(0.05, 0.05, 2.97, 6, M(0xf6f4ee)), TX + sx, 1.485, TZ + sz));
    const shell = new THREE.Mesh(new THREE.CylinderGeometry(2.3, 2.3, 2.3, 16, 1, true, -PI / 2.6, PI / 1.3), ORANGE);
    shell.rotation.set(-PI / 2, 0, 0); shell.position.set(TX, 2.15, TZ); arch.add(shell);   // -90 deg about x: the arc's middle points up (at +90 it lay on the floor as a bowl)
    // the painting's lamp: a green glass shade on a cord, glowing warm underneath
    const lamp = at(new THREE.Group(), TX, 4.4, TZ); G.add(lamp);
    const drop = 4.4 - LAMP_Y;
    lamp.add(at(cyl(0.008, 0.008, drop, 4, M(0x1a1a1a)), 0, -drop / 2, 0));
    lamp.add(at(cone(0.42, 0.26, 10, M(0x1e7a46, { unlit: 0.35 })), 0, -drop + 0.02, 0));
    lamp.add(rot(at(new THREE.Mesh(new THREE.CircleGeometry(0.4, 10), glow(0xfff2c0)), 0, -drop - 0.11, 0), PI / 2, 0, 0));
    lamp.add(at(ico(0.07, 1, glow(0xfffbe8)), 0, -drop - 0.06, 0));

    // ---------------- the poker table: green felt, a black padded rail, a pedestal ----------------
    const feltT = tex(16, 16, (x, r) => { px(x, '#1e7a46', 0, 0, 16, 16); noise(x, r, 16, 16, ['#1c7242', '#22824c', '#1a6c3e'], 40); }, 3631);
    const table = at(new THREE.Group(), TX, 0, TZ); G.add(table);
    table.add(at(cyl(TABLE_R - 0.08, TABLE_R - 0.08, 0.03, 20, mat({ map: feltT, rep: [2, 2], unlit: 0.12 })), 0, TABLE_Y - 0.015, 0));
    const rail = at(new THREE.Mesh(new THREE.TorusGeometry(TABLE_R - 0.04, 0.06, 5, 20), M(0x241a16)), 0, TABLE_Y - 0.01, 0); rail.rotation.x = PI / 2; table.add(rail);
    table.add(at(cyl(TABLE_R - 0.05, TABLE_R - 0.12, 0.12, 20, M(0x5a3a24)), 0, TABLE_Y - 0.08, 0));
    table.add(at(cyl(0.12, 0.16, TABLE_Y - 0.14, 8, M(0x5a3a24)), 0, (TABLE_Y - 0.14) / 2, 0));
    table.add(at(cyl(0.5, 0.55, 0.06, 10, M(0x4a2e1c)), 0, 0.03, 0));
    // the chairs: dark wood, a red velvet seat, a back behind the sitter
    const chairs = {};
    for (const n of SEAT_NAMES) {
      const [x, z, yw] = SEATS[n], c = at(new THREE.Group(), x, 0, z); c.rotation.y = yw * PI / 180; G.add(c); chairs[n] = c;
      const W = M(0x4a2e1c), V = M(0xa8202e);
      c.add(at(box(0.5, 0.06, 0.48, V), 0, CHAIR_Y - 0.03, -0.02));
      for (const [sx, sz] of [[-0.21, -0.2], [0.21, -0.2], [-0.21, 0.18], [0.21, 0.18]]) c.add(at(box(0.05, CHAIR_Y - 0.06, 0.05, W), sx, (CHAIR_Y - 0.06) / 2, sz));
      const back = at(new THREE.Group(), 0, CHAIR_Y, -0.24); back.rotation.x = -0.1; c.add(back);
      for (const sx of [-0.21, 0.21]) back.add(at(box(0.05, 0.62, 0.05, W), sx, 0.31, 0));
      back.add(at(box(0.48, 0.12, 0.04, W), 0, 0.58, 0)); back.add(at(box(0.4, 0.3, 0.03, V), 0, 0.3, 0.01));
    }

    // ---------------- the cards, the biscuit chips, the floaters, the splashes ----------------
    const cards = {}; for (const n of SEAT_NAMES) cards[n] = [cardMesh(), cardMesh()].map(c => { G.add(c); c.visible = false; return c; });
    const stackB = {}; for (const n of SEAT_NAMES) stackB[n] = Array.from({ length: 48 }, () => { const b = biscuit(); b.visible = false; G.add(b); return b; });
    const potB = Array.from({ length: 64 }, () => { const b = biscuit(); b.visible = false; G.add(b); return b; });
    const floatB = Array.from({ length: 40 }, () => { const b = biscuit(); b.visible = false; G.add(b); return b; });
    const dropM = mat({ color: 0xe8ffff, unlit: 0.9 }), ringM = mat({ color: 0xe8ffff, unlit: 0.8, see: 0.35 });
    const splashes = Array.from({ length: 4 }, () => {
      const q = new THREE.Group(); for (let i = 0; i < 18; i++) q.add(new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), dropM));
      const ring = new THREE.Mesh(new THREE.TorusGeometry(1, 0.06, 3, 18), ringM); ring.rotation.x = PI / 2; q.add(ring); q.visible = false; G.add(q); return q;
    });
    const danes = DANES.map(([x, z]) => { const d = dane(); d.position.set(x, 0, z); G.add(d); return d; });
    const heartM = M(0xff4f9a, { unlit: 0.8 }), hearts = [];
    for (let i = 0; i < 12; i++) { const h = new THREE.Group(); h.add(at(ico(0.1, 0, heartM), -0.075, 0, 0)); h.add(at(ico(0.1, 0, heartM), 0.075, 0, 0)); h.add(rot(at(cone(0.125, 0.18, 4, heartM), 0, -0.11, 0), PI, 0, 0)); h.visible = false; G.add(h); hearts.push(h); }

    // where a seat's things sit on the felt (r from the centre towards the seat, tn along the tangent)
    const onFelt = (n, r, tn) => { const [dx, dz] = seatDir(n); return [TX + dx * r + dz * tn, TZ + dz * r - dx * tn]; };
    const seatYaw = n => Math.atan2(...seatDir(n));     // a card's long axis points at its seat
    const potSpot = (i, n) => { const R = 0.07 + 0.2 * Math.sqrt(i / Math.max(1, n)), a = i * 2.39996, layer = Math.floor(i / 7); return [TX + Math.cos(a) * R * (1 - layer * 0.12), TABLE_Y + 0.02 + layer * 0.03 + 0.012 * (i % 3), TZ + Math.sin(a) * R * (1 - layer * 0.12), a * 1.7]; };
    const DEAL = [['sadi', 0], ['saxo', 0], ['compote', 0], ['kob', 0], ['sadi', 1], ['saxo', 1], ['compote', 1], ['kob', 1]];
    const DEALER = [SEATS.kob[0], 0.92, SEATS.kob[1] - 0.45];

    return {
      group: G, sky: null, shadowCol: 0x9a948a, indoor: false,
      light() { lights(0x46626c, 0x7ea4b0, [0.3, -0.85, -0.45], 0x0a2a32, [24, 90], 8); },
      anim(t, P = {}) {
        const s = shotT(t, P), b = beat(t), glw = P.glow ?? 1;
        // the pool's glow from under the water, the lamp over the table, the villa's warm windows
        pt(0, (POOL.x0 + POOL.x1) / 2, -0.4, (POOL.z0 + POOL.z1) / 2, 0.12 * glw, 0.5 * glw, 0.58 * glw);
        if (!P.noLamp) pt(1, TX, LAMP_Y - 0.15, TZ, 1.25, 1.05, 0.72);
        pt(2, 0, 2.2, VILLA_Z + 1.2, 0.9, 0.7, 0.45);
        if (P.key) pt(3, P.key[0], P.key[1], P.key[2], P.key[3], P.key[4], P.key[5]);
        U.uWaterY.value = WATER_Y; U.uWaterCol.value.set(0x1aa0b8);
        water.position.y = WATER_Y + 0.008 * Math.sin(t * 2.1);
        arch.visible = !P.noArch; lamp.visible = !P.noLamp;
        const sw = (P.swing || 0) * PI / 180 * Math.sin(b * PI / 2);
        lamp.rotation.set(sw, 0, sw * 0.6);
        for (const n of SEAT_NAMES) chairs[n].visible = !(P.chairs && P.chairs[n] === false);
        for (const [o, x, z] of extras) o.visible = !cleared(P, x, z);
        // the Danes: heads up, tilting on the beat, or turned to a point
        danes.forEach((d, i) => {
          d.visible = P.danes !== false; const h = d.userData.head; h.rotation.set(0, 0, 0);
          if (P.danes === 'tilt') h.rotation.z = (i ? -1 : 1) * 0.28 * Math.sin(b * PI / 2);
          else if (Array.isArray(P.danes)) { const [x, z] = DANES[i]; h.rotation.y = Math.max(-1.1, Math.min(1.1, Math.atan2(P.danes[0] - x, P.danes[1] - z))); }
        });
        // the cards: dealt, face down, peeked, folded, shown
        const C = P.cards || {}, deal = P.deal;
        for (const n of SEAT_NAMES) cards[n].forEach((c, j) => {
          const st = C[n]; c.visible = false;
          const dk = deal ? DEAL.findIndex(([m, jj]) => m === n && jj === j) : -1;
          if (!st && dk < 0) return;
          setFace(c, st && st.c ? st.c[j] : 'As');
          let [x, z] = onFelt(n, st && st.r != null ? st.r : 0.43, (j ? 1 : -1) * 0.115), y = TABLE_Y + 0.012, yaw = seatYaw(n) + (j ? 0.08 : -0.08), up = 0, lift = 0, tumble = 0;
          if (deal && dk >= 0) {       // flying in from the dealer's paws
            const u = (s - deal[0] - dk * deal[1]) / 0.32;
            if (u < 0) return;
            if (u < 1) { const e = sm(u); x = DEALER[0] + (x - DEALER[0]) * e; z = DEALER[2] + (z - DEALER[2]) * e; y = DEALER[1] + (y - DEALER[1]) * e + Math.sin(e * PI) * 0.18; yaw += (1 - e) * 5; }
          }
          c.userData.hinge.rotation.x = 0;
          if (st) {
            if (st.up === true || (typeof st.up === 'number' && s >= st.up)) up = 1;
            if (st.show != null && s >= st.show) { up = sm((s - st.show) / 0.3); lift = Math.sin(cl((s - st.show) / 0.3) * PI) * 0.12; }
            if (st.peek != null && s >= st.peek && s < st.peek + 1.4) c.userData.hinge.rotation.x = -0.75 * Math.sin(cl((s - st.peek) / 1.4) * PI);
            if (st.fold != null && s >= st.fold) {   // tossed to the middle, a little spun
              const u = sm((s - st.fold) / 0.4), [mx, mz] = onFelt(n, 0.24, j ? 0.08 : -0.08);   // tossed in: up 0.35 m and spinning, landing near the middle on the folder's side (a 9 cm slide read as nothing)
              x += (mx - x) * u; z += (mz - z) * u;
              if (st.slide) { y += 0.004 * j; yaw += u * 0.5 * (j ? 1 : -1); }   // pushed in flat under a claw
              else { y += Math.sin(u * PI) * 0.35 + 0.01 * j; yaw += u * (2 * PI + 1.4 + j); tumble = u; }
              if (st.show == null || s < st.show) up = st.foldUp ? 1 : 0;
            }
          }
          if (st && st.turn) yaw += PI;   // shown to the table: reads from across it
          const bmp = P.bump != null && s >= P.bump && s < P.bump + 0.35 ? 0.06 * Math.sin((s - P.bump) / 0.35 * PI) : 0;   // a paw slammed on the table
          // a tossed card tumbles end over end and tilts up (flat in flight it was a thin line across a face)
          c.visible = true; c.position.set(x, y + lift + bmp, z); c.rotation.set(Math.sin(tumble * PI) * 1.1, yaw, 0); c.userData.flip.rotation.z = (1 - up) * PI + tumble * 2 * PI * (j ? 1 : -1);
        });
        // the biscuit stacks (columns of six beside each seat's cards), pushed in
        const S = P.stacks || {}, pushes = P.push || [];
        for (const n of SEAT_NAMES) {
          const nb = Math.min(48, S[n] || 0), pu = pushes.find(q => q[0] === n);
          const u = pu ? sm((s - pu[1]) / Math.max(0.05, pu[2])) : 0;
          stackB[n].forEach((bq, i) => {
            bq.visible = i < nb; if (!bq.visible) return;
            const per = nb > 24 ? 10 : 6, col = Math.floor(i / per), row = i % per, sa = (P.stackAt || {})[n] || [0.55, 0.3], [x0, z0] = onFelt(n, sa[0] - Math.floor(col / 4) * 0.12, sa[1] + (col % 4) * 0.11);   // a big stack grows into towers of ten
            const x = x0 + (TX + (col % 3 - 1) * 0.08 - x0) * u, z = z0 + (TZ + (Math.floor(col / 3) - 1) * 0.08 - z0) * u;
            const bmp = P.bump != null && s >= P.bump && s < P.bump + 0.35 ? (0.04 + 0.01 * row) * Math.sin((s - P.bump) / 0.35 * PI) : 0;
            bq.position.set(x, TABLE_Y + 0.017 + row * 0.032 + bmp, z); bq.rotation.set(0, seatYaw(n) + PI / 2 + (row % 2) * 0.12, 0);
          });
        }
        // the pot: a heap in the middle; raked to a seat, or kicked into the pool
        const np = Math.min(64, P.pot || 0), rk = P.rake, kk = P.kick;
        const pin = P.potIn, iu = pin ? 1 - sm((s - pin[1]) / Math.max(0.05, pin[2])) : 0, [ix, iz] = pin ? onFelt(pin[0], 0.5, 0) : [TX, TZ];
        const ru = rk ? sm((s - rk[1]) / Math.max(0.05, rk[2])) : 0, [rx, rz] = rk ? onFelt(rk[0], 0.62, rk[3] || 0) : [TX, TZ];   // raked right up to the rail, past the winner's own cards
        potB.forEach((bq, i) => {
          bq.visible = i < np; if (!bq.visible) return;
          let [x, y, z, a] = potSpot(i, np); x += (rx - TX) * ru + (ix - TX) * iu; z += (rz - TZ) * ru + (iz - TZ) * iu;
          if (kk && s >= kk[0]) {          // flying off the table in an arc, into the water, then bobbing
            const d0 = kk[0] + (i % 12) * 0.025, f = 0.62 + 0.18 * hash(i, 3640);
            const tx = kk[1] + (hash(i, 3641) - 0.5) * 1.6, tz = kk[2] + (hash(i, 3642) - 0.5) * 1.2, u = cl((s - d0) / f);
            if (s < d0) { bq.position.set(x, y, z); bq.rotation.set(0, a, 0); return; }
            if (u < 1) { bq.position.set(x + (tx - x) * u, y + (WATER_Y - y) * u + Math.sin(u * PI) * (1.1 + hash(i, 3643) * 0.6), z + (tz - z) * u); bq.rotation.set(u * 9 * (hash(i, 3644) - 0.5), a + u * 6, u * 7); return; }
            bq.position.set(tx, WATER_Y + 0.02 + 0.015 * Math.sin(t * 3 + i), tz); bq.rotation.set(0.15 * Math.sin(t * 2 + i), a, 0.1 * Math.cos(t * 2.3 + i)); return;
          }
          const bmp = P.bump != null && s >= P.bump && s < P.bump + 0.35 ? 0.05 * Math.sin((s - P.bump) / 0.35 * PI) : 0;
          bq.position.set(x, y + bmp, z); bq.rotation.set(0.12 * (i % 2), a, 0);
        });
        const fl = P.floaters, nf = fl ? Math.min(40, fl[2]) : 0;
        floatB.forEach((bq, i) => {
          bq.visible = i < nf; if (!bq.visible) return;
          const a = i * 2.39996, R = 0.15 + 0.85 * Math.sqrt((i + 0.5) / nf);
          bq.position.set(fl[0] + Math.cos(a) * R, WATER_Y + 0.02 + 0.015 * Math.sin(t * 3 + i), fl[1] + Math.sin(a) * R * 0.8); bq.rotation.set(0.15 * Math.sin(t * 2 + i), a * 1.3, 0.1 * Math.cos(t * 2.3 + i));
        });
        // hearts: three pink hearts pop and rise from each point, again every 1.2 s when it loops
        hearts.forEach((h, i) => {
          const q = (P.hearts || [])[Math.floor(i / 3)]; h.visible = false; if (!q) return;
          let e = s - q[3] - (i % 3) * 0.3; if (q[4] && e > 0) e %= 1.2;
          if (e < 0 || e > 1.4) return;
          h.visible = true; h.position.set(q[0] + ((i % 3) - 1) * 0.22 + 0.06 * Math.sin(e * 6 + i), q[1] + 0.55 * e, q[2]); h.scale.setScalar(Math.min(1, e * 5) * (1.15 - 0.25 * (e / 1.4)));
          h.rotation.y = (P.heartYaw ?? 0) * PI / 180;
        });
        // splashes: droplets thrown up and falling, a ring spreading on the water
        const SPL = [...(P.splash || [])]; if (kk) SPL.push([kk[1], kk[2], kk[0] + 0.62, 1.4]);
        splashes.forEach((q, k2) => {
          const sp = SPL[k2]; q.visible = false; if (!sp) return;
          const e = s - sp[2], sz = sp[3] || 1; if (e < 0 || e > 0.8) return;
          q.visible = true; q.position.set(sp[0], WATER_Y + 0.01, sp[1]);
          q.children.forEach((m, i) => {
            if (i === 18) { m.scale.setScalar(0.2 + e * 1.6 * sz); m.position.y = 0.01; return; }
            const a = i * 2.39996, v = (1.2 + hash(i, k2, 3645)) * sz, R = 0.15 * sz + e * 0.9 * sz * (0.6 + hash(i, 3646) * 0.6);
            m.position.set(Math.cos(a) * R, Math.max(0, v * e * 2.4 - 4.9 * e * e), Math.sin(a) * R); m.scale.setScalar(Math.max(0.01, 0.07 * sz * (1 - e / 0.8)));
          });
        });
      },
    };
  }
  return { mansion: mansion() };
}
