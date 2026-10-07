// maps35.js: the "So Easy (To Fall In Love)" map (2026-10-08, Olivia Dean; the clip is a London city musical: an
// open-plan office, a staircase, a black cab, a flower stall, a perfume counter, a bookshop, white stucco townhouses
// at night under old lamp posts, and a crowd dancing in the street to end it). Same contract as the other map files,
// pure in t:
//   london  one London street: the pavement (y = 0) runs along x from the shop fronts (LONDON.FACADE_Z) to the kerb
//           (KERB_Z), the road 0.12 m lower beyond it (double yellow lines, the black cab parked at CAB, nose to -x),
//           a garden square behind black railings across it (FAR_Z) and more townhouses beyond. The fronts, west to
//           east: a red phone box (PHONE), a cream townhouse with the flower stall in front of it (STALL; its florist's
//           mark SADI), the BOOKSHOP (BOOKS: a dark green front, a big window, WIN, with Kob's reading spot inside it,
//           KOB_WIN, and a door, DOOR, hinged on its west side and opening inwards; a warm room of shelves behind,
//           SHOP_D deep), a cafe under a striped awning (CAFE), a red pillar box (POST); Victorian lamp posts at LAMPS.
//           London pets (box pets in coats, bowler hats, flat caps and berets) stand along the fronts and the kerb,
//           off the action's stretch (x -3..3).
// Flags read by anim(t, P) (s = seconds into the shot):
//   zone     'day' | 'dusk' | 'night': the sky, the light, the lamps, the lit windows, the string lights over the street
//   cab      false: no cab (it's gone at night)
//   pets     'idle' | 'swoon' (heads tilted, paws at the chest, hearts popping over them in turn) | 'stare' (+ stare
//            [x, z]) | 'cheer' | 'gasp' | 'dance' (the flash mob: everyone in sync, paws up on every beat, a side step
//            every two) | false
//   mob      [cx, cz, cols, rows, dx, dz, yaw]: every pet in a block (row 0 nearest cz, rows going +z), facing yaw
//   gather   [cx, cz, r, a0, a1, yaw?]: every pet on an arc of radius r round (cx, cz) from a0 to a1 deg (0 = +z),
//            facing its centre (or yaw)
//   hearts   [[x, y, z, s0, loop]]: three pink hearts pop and rise from each point (loop: again every 1.2 s)
//   heartYaw deg: turn every heart (they face +z: a lens looking along x sees them edge-on)
//   blind    0-1 or [s0, s1, a, b]: the bookshop's roller blind comes down over the window
//   door     0-1 or [s0, s1, a, b]: the bookshop door swings in
//   lit      the bookshop's lamps on (always at dusk and night)
//   gift     { x, z, yaw, to: [x1, z1], at, dur, lid: 0-1 | [s0, s1, a, b], bow }: the big cardboard box with a red bow on
//            its lid; it slides from (x, z) to `to` over [at, at + dur]; `lid` lifts the lid off and lays it on the
//            cobbles beside the box (the bow goes with it); `lin`: the slide is linear (an actor's mx walk pushing it). false: no box
//   palace   { x, z, yaw, y, to: [x1, z1, y1], at, dur, arc }: the cat palace (a round pink velvet bed under a little
//            pink canopy with a gold crown), 1 m across; y lifts it (0.03: on the box's floor, its canopy above the rim)
//   petals   true or s: pink petals drifting down round petalsAt ([x, z], default the origin)
//   spots    [[x, z], ...]: the first pets stand there instead (the rest hidden), facing `stare` or the shot's middle
//   shadow   Kob's reading silhouette on the lit blind (true; with the blind down and the lamps lit, dusk or night)
//   glints   false: no glints on the window (a lens inside the shop, close behind the window, sees them across the frame)
//   readingLamp false: no reading lamp at the back of the shop (behind the doorway it sat on a head)
//   noguests, clear [[x, z, r]] (no pet there), key [x, y, z, r, g, b]
// Never name a flag like a shot field: `crowd`, `cam`, `still`, `focus` are taken.
import { mapKit } from './mapkit.js';

export const LONDON = {
  X: [-16, 16], FACADE_Z: -3.0, KERB_Z: 2.0, ROAD_Y: -0.12, FAR_Z: 11.5,
  BOOKS: { x0: -2.4, x1: 2.4 },
  WIN: { x0: -2.1, x1: 0.3, y0: 0.45, y1: 2.15 },
  DOOR: { x0: 0.75, x1: 1.75, y1: 2.2 },
  SHOP_D: 3.4,
  KOB_WIN: [-0.9, -3.45],
  STALL: [-5.6, -2.05], SADI: [-5.15, -0.95],
  CAB: [-0.4, 3.0],
  LAMPS: [[-3.8, 1.55], [4.0, 1.55], [-10.6, 1.55], [11.2, 1.55]],
  POST: [6.3, 1.4], PHONE: [-10.4, -2.35], CAFE: [5.8, -3.0],
  GIFT: { W: 1.1, H: 0.42, T: 0.03 },
  PALACE: { R: 0.5, H: 0.3 },
};

export function buildLondonMaps(K) {
  const k = mapKit(K);
  const { THREE, mat, tex, px, noise, box, TAU, PI, beat, hash, cyl, cone, ico, at, rot, flat, lights, pt, stars, selfLit, fall } = k;
  const M = (c, o = {}) => mat({ color: c, ...o }), glow = (c, u = 1) => mat({ color: c, unlit: u });
  const shotT = (t, P) => P.t0 != null ? t - P.t0 : 0;
  const cl = x => Math.max(0, Math.min(1, x)), sm = x => { x = cl(x); return x * x * (3 - 2 * x); };
  const cleared = (P, x, z) => (P.clear || []).some(([cx, cz, r]) => (x - cx) ** 2 + (z - cz) ** 2 < r * r);
  const ramp = (v, s) => Array.isArray(v) ? v[2] + (v[3] - v[2]) * sm((s - v[0]) / Math.max(0.01, v[1] - v[0])) : (v || 0);
  const { X, FACADE_Z, KERB_Z, ROAD_Y, FAR_Z, BOOKS, WIN, DOOR, SHOP_D, STALL, CAB, LAMPS, POST, PHONE, CAFE, GIFT, PALACE } = LONDON, KOB_WIN_X = LONDON.KOB_WIN[0];
  const W = X[1] - X[0];

  // ---------- London pets: faceted heads, a coat, box arms, a hat (a bowler, a flat cap, a beret, or bare ears up) ----------
  const FURS = [0xd8a868, 0xe8d8c0, 0xb08a60, 0xf2eee6, 0x9a9aa4, 0x7a6a5e, 0xe8c090, 0xc8b8a8];
  const COATS = [0x8a6a4a, 0x3a4a6a, 0x7a2a3a, 0x5a6a52, 0xb8a078, 0x2a5a6a, 0x6a3a7a, 0xc87a4a];
  function pet(i) {
    const g = new THREE.Group(), F = M(FURS[i % FURS.length]), kind = i % 3, coat = M(COATS[(i * 3) % COATS.length]);
    const body = new THREE.Group(); g.add(body);
    body.add(at(box(0.4, 0.5, 0.28, coat), 0, 0.35, 0)); body.add(at(box(0.44, 0.08, 0.3, coat), 0, 0.12, 0));
    body.add(at(box(0.08, 0.3, 0.02, M(0x1a1a20)), 0, 0.38, 0.145));
    for (const sx of [-1, 1]) body.add(at(box(0.12, 0.12, 0.13, M(0x2a2a30)), sx * 0.1, 0.06, 0.02));
    const arms = [-1, 1].map(sx => { const a = at(new THREE.Group(), sx * 0.23, 0.55, 0); a.add(at(box(0.09, 0.3, 0.09, coat), 0, -0.13, 0)); a.add(at(box(0.08, 0.08, 0.08, F), 0, -0.3, 0)); body.add(a); return a; });
    const head = at(new THREE.Group(), 0, 0.82, 0); body.add(head);
    const skull = new THREE.Mesh(new THREE.IcosahedronGeometry(0.24, 1), F); skull.scale.set(1, 0.9, 0.92); head.add(skull);
    const snout = at(new THREE.Mesh(new THREE.IcosahedronGeometry(0.1, 1), M(0xf0e6d8)), 0, -0.07, 0.19); snout.scale.set(1.1, 0.8, 0.9); head.add(snout);
    head.add(at(new THREE.Mesh(new THREE.IcosahedronGeometry(0.035, 0), M(0x151515)), 0, -0.03, 0.28));
    for (const e of [-1, 1]) {
      head.add(at(new THREE.Mesh(new THREE.IcosahedronGeometry(0.038, 0), M(0x0e0e0e)), e * 0.1, 0.05, 0.19));
      head.add(at(new THREE.Mesh(new THREE.IcosahedronGeometry(0.012, 0), glow(0xffffff)), e * 0.1 + 0.012, 0.065, 0.225));
      head.add(kind === 0 ? rot(at(cone(0.08, 0.2, 4, F), e * 0.15, 0.27, 0), 0, 0, -e * 0.25) : kind === 1 ? at(box(0.08, 0.3, 0.06, F), e * 0.1, 0.33, 0) : rot(at(box(0.07, 0.24, 0.16, F), e * 0.24, 0.02, 0), 0, 0, e * 0.3));
    }
    const hatKind = i % 4, hc = M([0x1e1c22, 0x5a4a3a, 0x7a2030, 0x3a4a3a][i % 4]);
    if (hatKind === 0) { head.add(at(cyl(0.19, 0.19, 0.02, 10, hc), 0, 0.2, -0.02)); head.add(at(new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 5, 0, TAU, 0, PI / 2), hc), 0, 0.21, -0.02)); }
    else if (hatKind === 1) { head.add(at(cyl(0.15, 0.16, 0.07, 10, hc), 0, 0.22, -0.02)); head.add(at(box(0.16, 0.02, 0.12, hc), 0, 0.2, 0.12)); }
    else if (hatKind === 2) { const bt = at(cyl(0.16, 0.16, 0.05, 10, hc), 0.03, 0.22, -0.02); bt.rotation.z = -0.25; head.add(bt); }
    const heart = new THREE.Group(); heart.visible = false; g.add(heart);
    const hm = mat({ color: 0xff5fa2, unlit: 0.85 });
    heart.add(at(ico(0.07, 0, hm), -0.055, 0, 0)); heart.add(at(ico(0.07, 0, hm), 0.055, 0, 0));
    const tip = at(cone(0.09, 0.13, 4, hm), 0, -0.08, 0); tip.rotation.x = PI; heart.add(tip);
    return { g, body, head, arms, heart, i };
  }

  // ---------- the big cardboard box: four walls and a floor (open top), tape, its lid with a red ribbon and bow ----------
  function giftBox() {
    const g = new THREE.Group(), { W: B, H, T } = GIFT;
    const kraftT = tex(16, 16, (x, r) => { px(x, '#c8955a', 0, 0, 16, 16); noise(x, r, 16, 16, ['#bc8a50', '#d4a066', '#c08c54'], 50); }, 3501);
    const kraft = mat({ map: kraftT, rep: [2, 1] }), inside = M(0x9a6a3a), tape = M(0xd8b07a);
    for (const sd of [-1, 1]) {
      g.add(at(box(B, H, T, kraft), 0, H / 2, sd * (B / 2 - T / 2))); g.add(at(box(T, H, B - 2 * T, kraft), sd * (B / 2 - T / 2), H / 2, 0));
      g.add(at(box(0.16, H + 0.002, 0.004, tape), 0, H / 2, sd * (B / 2 + 0.001)));
    }
    g.add(at(box(B - 2 * T, 0.02, B - 2 * T, inside), 0, 0.01, 0));
    for (const sd of [-1, 1]) { g.add(at(box(B - 2 * T, H - 0.02, 0.004, inside), 0, H / 2, sd * (B / 2 - T - 0.003))); g.add(at(box(0.004, H - 0.02, B - 2 * T, inside), sd * (B / 2 - T - 0.003), H / 2, 0)); }
    // a printed arrow and a fragile glass on the front (a delivery box), a little self-lit so they read
    const markT = tex(16, 16, x => { x.clearRect(0, 0, 16, 16); px(x, '#3a2a1a', 3, 2, 2, 8); px(x, '#3a2a1a', 1, 4, 6, 1); px(x, '#3a2a1a', 2, 3, 4, 1); px(x, '#3a2a1a', 10, 3, 4, 4); px(x, '#3a2a1a', 11, 7, 2, 4); px(x, '#3a2a1a', 10, 11, 4, 1); }, 3502);
    const mark = new THREE.Mesh(new THREE.PlaneGeometry(0.34, 0.34), mat({ map: markT, unlit: 0.2 })); mark.material.transparent = true; mark.material.alphaTest = 0.4; g.add(at(mark, 0.3, H * 0.55, B / 2 + 0.004));
    const lid = new THREE.Group(); g.add(lid);
    lid.add(at(box(B + 0.04, 0.05, B + 0.04, kraft), 0, 0.025, 0));
    for (const sd of [-1, 1]) { lid.add(at(box(B + 0.04, 0.1, 0.02, kraft), 0, -0.03, sd * (B / 2 + 0.03))); lid.add(at(box(0.02, 0.1, B + 0.04, kraft), sd * (B / 2 + 0.03), -0.03, 0)); }
    const red = M(0xd8202e), redL = mat({ color: 0xe8303e, unlit: 0.2 });
    lid.add(at(box(0.14, 0.012, B + 0.08, redL), 0, 0.056, 0)); lid.add(at(box(B + 0.08, 0.012, 0.14, redL), 0, 0.057, 0));
    for (const sd of [-1, 1]) { lid.add(at(box(0.14, 0.12, 0.012, redL), 0, 0.0, sd * (B / 2 + 0.045))); lid.add(at(box(0.012, 0.12, 0.14, redL), sd * (B / 2 + 0.045), 0.0, 0)); }
    // the bow: two big loops and two tails, standing up off the knot
    lid.add(at(ico(0.08, 1, red), 0, 0.11, 0));
    for (const sd of [-1, 1]) {
      const loop = at(new THREE.Mesh(new THREE.TorusGeometry(0.15, 0.05, 5, 10), redL), sd * 0.16, 0.2, 0); loop.rotation.set(0, 0, sd * 0.55); loop.scale.set(1.25, 1, 0.55); lid.add(loop);
      const tail = at(box(0.1, 0.02, 0.32, redL), sd * 0.1, 0.075, 0.17); tail.rotation.set(0.15, sd * 0.45, 0); lid.add(tail);
    }
    g.userData.lid = lid; return g;
  }
  // ---------- the cat palace: a round pink velvet bed with a fat rim, a pink canopy on a gold pole and a gold crown ----------
  function palace() {
    const g = new THREE.Group(), { R } = PALACE;
    const pink = M(0xf28ac0), deep = M(0xd8569a), gold = mat({ color: 0xf2c440, unlit: 0.35 }), pad = M(0xf8c4dc);
    g.add(at(cyl(R, R * 1.02, 0.12, 14, deep), 0, 0.06, 0));
    const rim = at(new THREE.Mesh(new THREE.TorusGeometry(R - 0.1, 0.12, 6, 14), pink), 0, 0.16, 0); rim.rotation.x = PI / 2; g.add(rim);
    g.add(at(cyl(R - 0.12, R - 0.12, 0.05, 14, pad), 0, 0.13, 0));
    // the frilly skirt: little scallops round the base
    for (let i = 0; i < 14; i++) { const a = i / 14 * TAU; g.add(at(ico(0.06, 0, pink), Math.sin(a) * (R + 0.02), 0.05, Math.cos(a) * (R + 0.02))); }
    // the canopy at the back: a gold pole and a pink tent, the crown on top
    const back = -R + 0.08;
    g.add(at(cyl(0.025, 0.025, 1.05, 6, gold), 0, 0.6, back));
    const tent = at(cone(0.42, 0.55, 8, mat({ color: 0xf6a2cc, side: THREE.DoubleSide })), 0, 0.92, back + 0.18); tent.rotation.x = 0.35; g.add(tent);
    const crown = new THREE.Group(); crown.add(at(cyl(0.13, 0.11, 0.09, 8, gold), 0, 0, 0));
    for (let i = 0; i < 5; i++) { const a = i / 5 * TAU; crown.add(at(cone(0.04, 0.1, 4, gold), Math.sin(a) * 0.11, 0.09, Math.cos(a) * 0.11)); crown.add(at(ico(0.022, 0, glow(0xff5a8a, 0.8)), Math.sin(a) * 0.12, 0.02, Math.cos(a) * 0.12)); }
    g.add(at(crown, 0, 1.22, back + 0.05));
    // a heart cushion in the middle
    const hc = new THREE.Group(); hc.add(at(ico(0.09, 1, deep), -0.07, 0, 0)); hc.add(at(ico(0.09, 1, deep), 0.07, 0, 0)); const tp = at(cone(0.115, 0.15, 6, deep), 0, -0.09, 0); tp.rotation.x = PI; hc.add(tp);
    hc.rotation.x = -0.9; g.add(at(hc, 0, 0.24, 0.12));
    return g;
  }

  function london() {
    const G = new THREE.Group();
    // ---------------- the ground: big grey flagstones (1.2 x 0.9 m: fine checkers alias), the kerb, the road ----------------
    const slabT = tex(16, 16, (x, r) => { px(x, '#a8a6a0', 0, 0, 16, 16); noise(x, r, 16, 16, ['#a2a09a', '#aeaca6', '#9e9c96'], 40); px(x, '#8c8a86', 0, 0, 16, 1); px(x, '#8c8a86', 0, 0, 1, 16); }, 3510);
    const walkD = KERB_Z - FACADE_Z + 0.4;
    G.add(flat(W, walkD, mat({ map: slabT, rep: [W / 1.2, walkD / 0.9] }), 0, 0, (KERB_Z + FACADE_Z - 0.4) / 2));
    G.add(at(box(W, 0.12, 0.22, M(0xb8b6b0)), 0, -0.06, KERB_Z - 0.11));
    const roadT = tex(16, 16, (x, r) => { px(x, '#3a3a40', 0, 0, 16, 16); noise(x, r, 16, 16, ['#34343a', '#404046', '#38383e'], 70); }, 3511);
    const roadW = FAR_Z - KERB_Z - 1.6;
    G.add(flat(W + 40, roadW, mat({ map: roadT, rep: [(W + 40) / 2, roadW / 2] }), 0, ROAD_Y, KERB_Z + roadW / 2));
    const yel = mat({ color: 0xf0c830, unlit: 0.35 });
    for (const dz of [0.18, 0.32]) G.add(flat(W + 40, 0.07, yel, 0, ROAD_Y + 0.004, KERB_Z + dz));
    for (let i = 0; i < 18; i++) G.add(flat(1.4, 0.1, mat({ color: 0xe8e4d8, unlit: 0.4 }), -24 + i * 3, ROAD_Y + 0.004, KERB_Z + roadW / 2));
    // the wet road at night: glossy puddles catching the lamps (shown by `zone`)
    const puddles = new THREE.Group(); G.add(puddles);
    for (const [x, z, w, d, c] of [[-6.2, 3.6, 2.2, 0.8, 0xf0b860], [2.6, 4.4, 2.6, 0.9, 0xe8a858], [8.4, 3.2, 1.8, 0.7, 0xf2c070], [-1.6, 6.0, 2.0, 0.8, 0xd89a58], [-12, 5.2, 2.4, 0.8, 0xf0b860]]) puddles.add(flat(w, d, mat({ color: 0x4a4a5e, unlit: 0.35 }), x, ROAD_Y + 0.008, z));
    // across the road: the far pavement, the garden square's railings, its lawn and plane trees
    G.add(flat(W + 40, 1.6, mat({ map: slabT, rep: [(W + 40) / 1.2, 2] }), 0, 0, FAR_Z - 0.8));
    G.add(at(box(W + 40, 0.12, 0.2, M(0xb8b6b0)), 0, -0.06, FAR_Z - 1.6));
    const IRON = M(0x16161a);
    G.add(at(box(W + 40, 0.05, 0.05, IRON), 0, 1.15, FAR_Z)); G.add(at(box(W + 40, 0.05, 0.05, IRON), 0, 0.2, FAR_Z));
    for (let i = 0; i < 90; i++) { const x = -36 + i * 0.8; G.add(at(box(0.035, 1.3, 0.035, IRON), x, 0.65, FAR_Z)); G.add(at(cone(0.04, 0.12, 4, IRON), x, 1.36, FAR_Z)); }
    G.add(flat(W + 40, 14, M(0x5a7a3e), 0, 0.01, FAR_Z + 7));
    const TREE = M(0x4a6a32), TREE2 = M(0x5a7a3a), BARK = M(0x6a5a48);
    for (let i = 0; i < 9; i++) {
      const x = -20 + i * 5 + (hash(i, 3512) - 0.5) * 1.6, z = FAR_Z + 3.5 + hash(i, 3513) * 3;
      G.add(at(cyl(0.18, 0.25, 4.2, 6, BARK), x, 2.1, z));
      for (let j = 0; j < 4; j++) G.add(at(ico(1.4 + hash(i, j, 3514) * 0.6, 1, j % 2 ? TREE : TREE2), x + (hash(i, j, 3515) - 0.5) * 1.6, 4.6 + hash(i, j, 3516) * 1.4, z + (hash(i, j, 3517) - 0.5) * 1.4));
    }
    // ---------------- the skies: day (soft London blue with clouds), dusk (pink and gold), night (navy, a moon) ----------------
    const dome = (stops, seed) => { const T = tex(4, 64, x => { const gr = x.createLinearGradient(0, 0, 0, 64); stops.forEach(([o, c]) => gr.addColorStop(o, c)); x.fillStyle = gr; x.fillRect(0, 0, 4, 64); }, seed); const m = new THREE.Mesh(new THREE.SphereGeometry(185, 16, 12), mat({ map: T, unlit: 1, side: THREE.BackSide, nofog: 1 })); G.add(m); return m; };
    const daySky = dome([[0, '#6a9ad0'], [0.35, '#9cc0e4'], [0.5, '#e4ecf0'], [1, '#e4ecf0']], 3520);
    const duskSky = dome([[0, '#3a3a7a'], [0.3, '#8a5a9a'], [0.45, '#f08a8a'], [0.5, '#ffc070'], [1, '#ffc070']], 3521);
    const nightSky = dome([[0, '#060a1e'], [0.38, '#141c40'], [0.5, '#2a3058'], [1, '#2a3058']], 3522);
    const clouds = new THREE.Group(); G.add(clouds);
    for (let i = 0; i < 9; i++) { const a = -1.2 + i * 0.3, d = 160; const c = at(new THREE.Mesh(new THREE.SphereGeometry(10 + hash(i, 3523) * 8, 8, 5), mat({ color: 0xf6f8fa, unlit: 0.8, nofog: 1 })), Math.sin(a) * d, 40 + hash(i, 3524) * 25, -Math.cos(a) * d); c.scale.set(2.2, 0.5, 1); clouds.add(c); }
    const nightBits = new THREE.Group(); G.add(nightBits);
    nightBits.add(stars(120, 175, 3525, 0xe8ecff, 0.45));
    nightBits.add(at(new THREE.Mesh(new THREE.CircleGeometry(7, 14), mat({ color: 0xfff4d8, unlit: 1, nofog: 1 })), 40, 70, -150));
    // a far skyline over the shop roofs: a dome, spires and towers (a painted cylinder behind everything)
    const skyline = (night, seed) => tex(256, 64, (x, r) => {
      x.clearRect(0, 0, 256, 64); const c = night ? '#141a30' : '#8a96a8';
      for (let i = 0; i < 46; i++) { const w = 4 + Math.floor(r() * 9), h = 10 + Math.floor(r() * 30), x0 = Math.floor(r() * 250); px(x, c, x0, 64 - h, w, h); if (night) for (let yy = 64 - h + 2; yy < 62; yy += 3) for (let xx = x0 + 1; xx < x0 + w - 1; xx += 2) if (r() < 0.3) px(x, '#ffd890', xx, yy, 1, 1); }
      x.fillStyle = c; x.beginPath(); x.arc(150, 36, 12, PI, 0); x.fill(); px(x, c, 136, 36, 28, 28); px(x, c, 149, 18, 2, 8);
      for (const sx of [60, 210]) { px(x, c, sx, 16, 4, 48); px(x, c, sx + 1, 10, 2, 6); }
    }, seed);
    const skylines = [false, true].map(night => { const m = new THREE.Mesh(new THREE.CylinderGeometry(120, 120, 46, 32, 1, true), mat({ map: skyline(night, 3526 + (night ? 1 : 0)), rep: [3, 1], unlit: 1, side: THREE.BackSide, nofog: 1 })); m.material.transparent = true; m.material.alphaTest = 0.5; m.position.set(0, 14, 0); G.add(m); return m; });

    // ---------------- the townhouses: white stucco, sash windows, black balconies on the first floor ----------------
    const upperT = (base, night, seed) => tex(32, 32, (x, r) => {
      px(x, base, 0, 0, 32, 32); noise(x, r, 32, 32, ['rgba(0,0,0,.06)', 'rgba(255,255,255,.08)'], 80);
      for (let yy = 3; yy < 30; yy += 10) for (let xx = 4; xx < 30; xx += 9) {
        px(x, '#f4f2ec', xx - 1, yy - 1, 7, 9); const lit = night && r() < 0.55;
        px(x, lit ? (r() < 0.8 ? '#ffd27a' : '#ffb0c8') : '#2a3448', xx, yy, 5, 7); px(x, '#f4f2ec', xx, yy + 3, 5, 1); px(x, '#f4f2ec', xx + 2, yy, 1, 7);
      }
      if (night) selfLit(x, 32, 32);
    }, seed);
    const houses = [];
    const townhouse = (x0, x1, h, base, seed) => {
      const w = x1 - x0, cx = (x0 + x1) / 2;
      const mats = [false, true].map(n => mat({ map: upperT(base, n, seed + (n ? 1 : 0)), rep: [w / 3.4, (h - 3.0) / 3.4] }));
      const up = new THREE.Mesh(new THREE.PlaneGeometry(w, h - 3.0), mats[0]); G.add(at(up, cx, 3.0 + (h - 3.0) / 2, FACADE_Z)); houses.push({ up, mats });
      G.add(at(box(w, 0.22, 0.3, M(0xeeeae2)), cx, h + 0.11, FACADE_Z + 0.1));
      G.add(at(box(w, 0.6, 0.12, M(0xf2f0ea)), cx, h + 0.52, FACADE_Z + 0.02));
      G.add(at(box(w, 0.16, 0.24, M(0xe8e4dc)), cx, 3.05, FACADE_Z + 0.1));
      // the first-floor balcony: a slab and black railings
      G.add(at(box(w - 0.4, 0.08, 0.55, M(0xe8e4dc)), cx, 3.4, FACADE_Z + 0.27));
      G.add(at(box(w - 0.4, 0.04, 0.04, IRON), cx, 4.2, FACADE_Z + 0.53));
      for (let i = 0; i <= Math.round((w - 0.4) / 0.22); i++) G.add(at(box(0.025, 0.78, 0.025, IRON), x0 + 0.2 + i * 0.22, 3.8, FACADE_Z + 0.53));
      for (let i = 0; i < 3; i++) G.add(at(box(0.5, 0.9, 0.5, M(0xb89a8a)), x0 + 0.6 + i * (w - 1.2) / 2, h + 1.2, FACADE_Z - 1.2));
      G.add(at(box(w, h, 6, M(0x2a2830)), cx, h / 2, FACADE_Z - 3.03 - (x0 < BOOKS.x1 && x1 > BOOKS.x0 ? SHOP_D : 0)));
    };
    townhouse(-16, -8.0, 11.5, '#ece6da', 3530);
    townhouse(-8.0, BOOKS.x0, 12.5, '#f2ece2', 3532);
    townhouse(BOOKS.x0, BOOKS.x1, 12.0, '#e8e2d6', 3534);
    townhouse(BOOKS.x1, 9.0, 12.8, '#f0eadf', 3536);
    townhouse(9.0, 16, 11.8, '#ece4d8', 3538);
    // ground floors: painted stucco with a black door and a dark window each, except where the shops are
    const groundT = tex(32, 16, (x, r) => { px(x, '#ece8e0', 0, 0, 32, 16); for (let y = 3; y < 16; y += 4) px(x, '#d8d4cc', 0, y, 32, 1); noise(x, r, 32, 16, ['rgba(0,0,0,.05)'], 30); }, 3540);
    const ground = (x0, x1) => G.add(at(new THREE.Mesh(new THREE.PlaneGeometry(x1 - x0, 3.0), mat({ map: groundT, rep: [(x1 - x0) / 3, 1] })), (x0 + x1) / 2, 1.5, FACADE_Z));
    ground(-16, -8.0); ground(-8.0, BOOKS.x0); ground(BOOKS.x1, 3.9); ground(7.7, 9.0); ground(9.0, 16);
    const blackDoor = (cx) => { G.add(at(box(1.0, 2.3, 0.08, M(0x141418)), cx, 1.15, FACADE_Z + 0.04)); G.add(at(new THREE.Mesh(new THREE.CircleGeometry(0.42, 8, 0, PI), M(0xd8e0e8, { unlit: 0.3 })), cx, 2.32, FACADE_Z + 0.05)); G.add(at(ico(0.035, 0, M(0xd8b040)), cx, 1.15, FACADE_Z + 0.1)); for (const sd of [-1, 1]) G.add(at(box(0.14, 2.6, 0.16, M(0xf4f2ec)), cx + sd * 0.6, 1.3, FACADE_Z + 0.08)); };
    blackDoor(-13.0); blackDoor(-7.0); blackDoor(12.4);
    const darkWin = (cx) => { G.add(at(box(1.3, 1.6, 0.04, M(0x2a3448)), cx, 1.4, FACADE_Z + 0.03)); G.add(at(box(1.46, 0.08, 0.1, M(0xf4f2ec)), cx, 0.56, FACADE_Z + 0.05)); };
    darkWin(-11.0); darkWin(14.4);

    // ---------------- the BOOKSHOP: a dark green front with a gold sign, a big window, a door; a warm room of shelves ----------------
    const GREEN = M(0x1e4a36), GREEN2 = M(0x2a5a44), GOLD = mat({ color: 0xe8c050, unlit: 0.4 });
    const bx0 = BOOKS.x0, bx1 = BOOKS.x1;
    G.add(at(box(bx1 - bx0, 0.7, 0.14, GREEN), (bx0 + bx1) / 2, 2.62, FACADE_Z + 0.07));
    const signT = tex(64, 12, x => { px(x, '#1e4a36', 0, 0, 64, 12); x.font = 'bold 10px monospace'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillStyle = '#3a2a10'; x.fillText('BOOKS', 33, 7); x.fillStyle = '#f2cc5a'; x.fillText('BOOKS', 32, 6); }, 3541);
    G.add(at(new THREE.Mesh(new THREE.PlaneGeometry(2.6, 0.5), mat({ map: signT, unlit: 0.5 })), (bx0 + bx1) / 2, 2.62, FACADE_Z + 0.145));
    G.add(at(box(bx1 - bx0 + 0.1, 0.1, 0.22, GREEN2), (bx0 + bx1) / 2, 3.0, FACADE_Z + 0.1));
    // pilasters, the riser under the window, the transom bar over the openings
    G.add(at(box(WIN.x0 - bx0, 2.27, 0.16, GREEN), (bx0 + WIN.x0) / 2, 1.135, FACADE_Z + 0.06));
    G.add(at(box(DOOR.x0 - WIN.x1, 2.27, 0.16, GREEN), (WIN.x1 + DOOR.x0) / 2, 1.135, FACADE_Z + 0.06));
    G.add(at(box(bx1 - DOOR.x1, 2.27, 0.16, GREEN), (DOOR.x1 + bx1) / 2, 1.135, FACADE_Z + 0.06));
    G.add(at(box(WIN.x1 - WIN.x0, WIN.y0, 0.16, GREEN2), (WIN.x0 + WIN.x1) / 2, WIN.y0 / 2, FACADE_Z + 0.06));
    G.add(at(box(WIN.x1 - WIN.x0 + 0.05, 0.06, 0.24, GREEN), (WIN.x0 + WIN.x1) / 2, WIN.y0 + 0.02, FACADE_Z + 0.1));
    G.add(at(box(DOOR.x1 - WIN.x0, 0.12, 0.16, GREEN), (WIN.x0 + DOOR.x1) / 2, 2.21, FACADE_Z + 0.06));
    // the window: no glass over a face, just a frame and three glints in the corners (a dithered pane veils faces)
    const glint = mat({ color: 0xf4fbff, unlit: 0.6, see: 0.55 }), glints = [];
    for (const [gx, gy, gw, gh] of [[WIN.x0 + 0.22, WIN.y1 - 0.38, 0.05, 0.55], [WIN.x0 + 0.34, WIN.y1 - 0.32, 0.03, 0.4], [WIN.x1 - 0.2, WIN.y0 + 0.36, 0.05, 0.45]]) { const gl = at(box(gw, gh, 0.005, glint), gx, gy, FACADE_Z + 0.01); gl.rotation.z = -0.6; G.add(gl); glints.push(gl); }
    // a gold-lettered strip on the riser
    const hours = mat({ map: tex(32, 6, x => { px(x, '#2a5a44', 0, 0, 32, 6); x.font = 'bold 6px monospace'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillStyle = '#f2cc5a'; x.fillText('EST 1887', 16, 3); }, 3542), unlit: 0.4 });
    G.add(at(new THREE.Mesh(new THREE.PlaneGeometry(1.2, 0.22), hours), (WIN.x0 + WIN.x1) / 2, 0.24, FACADE_Z + 0.145));
    // the door: a green leaf with a glass top, hinged on its west side, swinging in (`door`)
    const doorPivot = at(new THREE.Group(), DOOR.x0, 0, FACADE_Z + 0.02); G.add(doorPivot);
    const dw = DOOR.x1 - DOOR.x0;
    doorPivot.add(at(box(dw, 1.15, 0.06, GREEN2), dw / 2, 0.575, 0)); doorPivot.add(at(box(dw, 0.12, 0.06, GREEN2), dw / 2, DOOR.y1 - 0.06, 0));
    for (const sd of [0, 1]) doorPivot.add(at(box(0.1, DOOR.y1 - 1.15, 0.06, GREEN2), 0.05 + sd * (dw - 0.1), 1.15 + (DOOR.y1 - 1.15) / 2, 0));
    doorPivot.add(at(box(dw - 0.2, DOOR.y1 - 1.27, 0.01, mat({ color: 0xffe4b0, unlit: 0.5, see: 0.55 })), dw / 2, 1.15 + (DOOR.y1 - 1.27) / 2, 0));
    doorPivot.add(at(ico(0.04, 0, GOLD), dw - 0.14, 1.05, 0.05));
    G.add(at(box(dw + 0.3, 0.04, 0.5, M(0x8a8680)), (DOOR.x0 + DOOR.x1) / 2, 0.02, FACADE_Z + 0.25));
    // inside: a wooden floor, shelves of books on three walls, a reading lamp, piles of books, the window's display ledge
    const iz0 = FACADE_Z - SHOP_D, icz = FACADE_Z - SHOP_D / 2, iw = bx1 - bx0 - 0.1;
    const floorT = tex(16, 16, (x, r) => { px(x, '#8a5a34', 0, 0, 16, 16); for (let y = 0; y < 16; y += 4) px(x, '#6a4224', 0, y, 16, 1); noise(x, r, 16, 16, ['#946238', '#7e5230'], 30); }, 3543);
    G.add(flat(iw, SHOP_D, mat({ map: floorT, rep: [iw / 1.2, SHOP_D / 1.2] }), (bx0 + bx1) / 2, 0.002, icz));
    const shelfT = tex(32, 32, (x, r) => {
      px(x, '#5a3a22', 0, 0, 32, 32);
      for (let row = 0; row < 4; row++) { const y0 = 2 + row * 8; px(x, '#3a2414', 0, y0 + 6, 32, 2); for (let xx = 1; xx < 31;) { const w = 1 + Math.floor(r() * 2), h = 4 + Math.floor(r() * 2); px(x, ['#c83a3a', '#3a6ac8', '#e8c040', '#3a8a4a', '#8a3a8a', '#e88a3a', '#f0e8d8', '#2a2a3a'][Math.floor(r() * 8)], xx, y0 + 6 - h, w, h); xx += w; } }
      selfLit(x, 32, 32);
    }, 3544);
    const shelfM = mat({ map: shelfT, rep: [2, 1.5], unlit: 0.25 });
    const wallP = (w, h, m) => new THREE.Mesh(new THREE.PlaneGeometry(w, h), m);
    G.add(at(wallP(iw, 3.0, shelfM), (bx0 + bx1) / 2, 1.5, iz0));
    G.add(rot(at(wallP(SHOP_D, 3.0, shelfM), bx0 + 0.05, 1.5, icz), 0, PI / 2, 0));
    G.add(rot(at(wallP(SHOP_D, 3.0, shelfM), bx1 - 0.05, 1.5, icz), 0, -PI / 2, 0));
    const ceil = wallP(iw, SHOP_D, M(0xe8dcc8)); ceil.rotation.x = PI / 2; G.add(at(ceil, (bx0 + bx1) / 2, 3.0, icz));
    G.add(at(box(WIN.x1 - WIN.x0, 0.06, 0.4, M(0x5a3a22)), (WIN.x0 + WIN.x1) / 2, WIN.y0 - 0.03, FACADE_Z - 0.2));
    for (let i = 0; i < 4; i++) G.add(at(box(0.3, 0.06 + (i % 3) * 0.04, 0.22, M([0xc83a3a, 0x3a6ac8, 0xe8c040, 0x3a8a4a][i])), WIN.x0 + 0.2 + i * 0.13, WIN.y0 + 0.03 + i * 0.04, FACADE_Z - 0.2));
    const lampM = mat({ color: 0xffe0a0, unlit: 1 });
    const readLamp = at(new THREE.Group(), bx1 - 0.6, 0, iz0 + 0.6); G.add(readLamp);
    readLamp.add(at(cyl(0.02, 0.02, 1.4, 5, M(0x2a2a2a)), 0, 0.7, 0)); readLamp.add(at(cone(0.22, 0.25, 8, lampM), 0, 1.45, 0));
    G.add(at(cyl(0.3, 0.3, 0.05, 10, lampM), (bx0 + bx1) / 2, 2.95, icz));
    for (let i = 0; i < 4; i++) G.add(at(box(0.35, 0.3 + i * 0.12, 0.28, M([0x8a3a3a, 0x3a5a8a, 0xc8a040, 0x4a7a4a][i])), bx1 - 1.3 + (i % 2) * 0.4, (0.3 + i * 0.12) / 2, iz0 + 0.5 + Math.floor(i / 2) * 0.5));
    // the roller blind: cream stripes, rolled up under the transom (`blind` brings it down over the window)
    const blindT = tex(8, 16, x => { px(x, '#f2e6c8', 0, 0, 8, 16); for (let y = 2; y < 16; y += 4) px(x, '#e0cfa8', 0, y, 8, 1); }, 3545);
    const blindM = mat({ map: blindT, rep: [1, 2] }), blind = new THREE.Mesh(new THREE.PlaneGeometry(WIN.x1 - WIN.x0 - 0.04, 1), blindM); G.add(blind);
    // Kob's silhouette on the lit blind: a cat reading, seen through the fabric (ears, a round head, shoulders, the open book)
    const silT = tex(32, 32, x => {
      x.clearRect(0, 0, 32, 32); x.fillStyle = '#3a2a22';
      x.beginPath(); x.arc(16, 11, 6.5, 0, Math.PI * 2); x.fill();
      x.beginPath(); x.moveTo(10, 8); x.lineTo(11, 1); x.lineTo(15, 6); x.fill(); x.beginPath(); x.moveTo(22, 8); x.lineTo(21, 1); x.lineTo(17, 6); x.fill();
      x.beginPath(); x.ellipse(16, 27, 10, 9, 0, 0, Math.PI * 2); x.fill();
      x.fillRect(7, 17, 18, 4); x.beginPath(); x.moveTo(6, 22); x.lineTo(16, 18); x.lineTo(26, 22); x.lineTo(16, 24); x.fill();
    }, 3551);
    const sil = new THREE.Mesh(new THREE.PlaneGeometry(1.0, 1.0), mat({ map: silT, unlit: 1, see: 0.2 })); sil.material.transparent = true; sil.material.alphaTest = 0.4;
    sil.position.set(KOB_WIN_X, 1.12, FACADE_Z - 0.055); sil.visible = false; G.add(sil);
    G.add(at(rot(cyl(0.05, 0.05, WIN.x1 - WIN.x0, 8, M(0xe8dcc0)), 0, 0, PI / 2), (WIN.x0 + WIN.x1) / 2, WIN.y1 - 0.04, FACADE_Z - 0.06));

    // ---------------- the flower stall: a wooden barrow, tiers of buckets of flowers, a striped awning ----------------
    const [sx, sz] = STALL, stall = at(new THREE.Group(), sx, 0, sz); G.add(stall);
    const WOOD = M(0x8a5a34), WOOD2 = M(0x6a4224);
    stall.add(at(box(2.4, 0.5, 1.0, WOOD), 0, 0.35, 0)); for (const dx of [-1.05, 1.05]) stall.add(at(rot(cyl(0.22, 0.22, 0.08, 10, WOOD2), PI / 2, 0, 0), dx, 0.22, 0.52));
    const FLOWERS = [0xe8303e, 0xf28ac0, 0xf2d040, 0xf8f4ec, 0x9a5ad8, 0xf28a3a, 0xd83a8a];
    for (let tier = 0; tier < 3; tier++) for (let i = 0; i < 6; i++) {
      const bxp = -0.95 + i * 0.38, bzp = 0.3 - tier * 0.32, by = 0.6 + tier * 0.22;
      stall.add(at(cyl(0.13, 0.11, 0.24, 8, M(0x6a7a8a)), bxp, by + 0.12, bzp));
      const c = FLOWERS[(i * 3 + tier * 2) % FLOWERS.length];
      for (let j = 0; j < 5; j++) stall.add(at(ico(0.07, 0, M(c, { unlit: 0.15 })), bxp + (hash(i, tier, j) - 0.5) * 0.16, by + 0.3 + hash(j, i, tier) * 0.12, bzp + (hash(tier, j, i) - 0.5) * 0.16));
      stall.add(at(cyl(0.02, 0.02, 0.2, 4, M(0x3a7a3a)), bxp, by + 0.25, bzp));
    }
    for (const [dx, dz] of [[-1.15, 0.5], [1.15, 0.5], [-1.15, -0.5], [1.15, -0.5]]) stall.add(at(cyl(0.03, 0.03, 2.3, 5, WOOD2), dx, 1.15, dz));
    const awnT = tex(16, 4, x => { for (let i = 0; i < 16; i += 2) px(x, i % 4 ? '#f4f2ec' : '#2a7a4a', i, 0, 2, 4); }, 3546);
    const awn = new THREE.Mesh(new THREE.PlaneGeometry(2.7, 1.4), mat({ map: awnT, rep: [3, 1], side: THREE.DoubleSide })); awn.rotation.x = -PI / 2 + 0.32; stall.add(at(awn, 0, 2.3, 0.05));
    for (let i = 0; i < 9; i++) stall.add(at(cone(0.15, 0.16, 3, M(i % 2 ? 0xf4f2ec : 0x2a7a4a)), -1.2 + i * 0.3, 2.02, 0.72));

    // ---------------- the cafe: a lit window, a striped awning, two little tables (east, off the action) ----------------
    const [cfx] = CAFE;
    G.add(at(box(3.4, 1.7, 0.04, mat({ color: 0xffd8a0, unlit: 0.45 })), cfx, 1.25, FACADE_Z + 0.03));
    G.add(at(box(3.8, 0.4, 0.04, M(0x7a2030)), cfx, 2.3, FACADE_Z + 0.03)); G.add(at(box(3.8, 0.4, 0.04, M(0x7a2030)), cfx, 0.2, FACADE_Z + 0.03));
    for (const sd of [-1, 1]) G.add(at(box(0.18, 2.6, 0.16, M(0x7a2030)), cfx + sd * 1.8, 1.3, FACADE_Z + 0.08));
    const cafeAwn = new THREE.Mesh(new THREE.PlaneGeometry(4.0, 1.3), mat({ map: tex(16, 4, x => { for (let i = 0; i < 16; i += 2) px(x, i % 4 ? '#f4f2ec' : '#c8283a', i, 0, 2, 4); }, 3547), rep: [4, 1], side: THREE.DoubleSide }));
    cafeAwn.rotation.x = -PI / 2 + 0.4; G.add(at(cafeAwn, cfx, 2.7, FACADE_Z + 0.6));
    for (const dx of [-0.9, 0.9]) { const tx = cfx + dx; G.add(at(cyl(0.3, 0.3, 0.03, 10, M(0xe8e4dc)), tx, 0.72, -1.95)); G.add(at(cyl(0.025, 0.025, 0.72, 5, IRON), tx, 0.36, -1.95)); for (const sd of [-1, 1]) G.add(at(box(0.3, 0.04, 0.3, M(0x2a2a30)), tx + sd * 0.45, 0.42, -1.95)); }

    // ---------------- street furniture: Victorian lamps, a red pillar box, a red phone box ----------------
    const lampGlass = mat({ color: 0xfff0c8, unlit: 0.5 });
    for (const [lx, lz] of LAMPS) {
      const l = at(new THREE.Group(), lx, 0, lz); G.add(l);
      l.add(at(cyl(0.18, 0.22, 0.45, 8, IRON), 0, 0.22, 0)); l.add(at(cyl(0.06, 0.07, 3.4, 6, IRON), 0, 2.1, 0));
      l.add(at(box(0.5, 0.04, 0.04, IRON), 0, 3.5, 0));
      l.add(at(box(0.32, 0.42, 0.32, lampGlass), 0, 3.95, 0));
      const cap = at(cone(0.3, 0.26, 4, IRON), 0, 4.3, 0); cap.rotation.y = PI / 4; l.add(cap);
    }
    const [pxx, pzz] = POST, RED = M(0xc8202a);
    G.add(at(cyl(0.26, 0.26, 1.1, 10, RED), pxx, 0.55, pzz)); G.add(at(new THREE.Mesh(new THREE.SphereGeometry(0.27, 10, 5, 0, TAU, 0, PI / 2), RED), pxx, 1.1, pzz));
    G.add(at(cyl(0.28, 0.3, 0.12, 10, IRON), pxx, 0.06, pzz)); G.add(at(box(0.24, 0.04, 0.03, IRON), pxx, 0.85, pzz + 0.26));
    const [phx, phz] = PHONE, ph = at(new THREE.Group(), phx, 0, phz); G.add(ph);
    const paneT = tex(8, 16, x => { px(x, '#c8202a', 0, 0, 8, 16); for (let y = 1; y < 15; y += 2.5) for (let xx = 1; xx < 7; xx += 2) px(x, '#3a4458', xx, Math.floor(y), 1, 2); }, 3548);
    ph.add(at(box(0.95, 2.4, 0.95, mat({ map: paneT })), 0, 1.2, 0)); ph.add(at(box(1.05, 0.14, 1.05, RED), 0, 2.47, 0));
    const phTop = at(new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.52, 0.2, 4, 1), RED), 0, 2.64, 0); phTop.rotation.y = PI / 4; ph.add(phTop);
    ph.add(at(box(0.8, 0.12, 0.02, glow(0xf4f2ec, 0.8)), 0, 2.28, 0.48));
    // string lights across the street at night: bulbs on swags from the fronts to the far railings
    const bulbs = new THREE.Group(); G.add(bulbs);
    const bulbCols = [0xfff0c0, 0xffd090, 0xffb0c8];
    for (let st = 0; st < 6; st++) {
      const x0 = -9 + st * 3.2, z0 = FACADE_Z + 0.2, z1 = FAR_Z - 1.0, n = 16;
      for (let j = 0; j <= n; j++) { const u = j / n; bulbs.add(at(ico(0.06, 0, glow(bulbCols[(st + j) % 3])), x0 + 1.6 * u, 4.6 - 1.1 * Math.sin(u * PI), z0 + (z1 - z0) * u)); }
    }

    // ---------------- the black cab, nose to -x (a London taxi: a tall rounded cabin, a TAXI light) ----------------
    const cab = at(new THREE.Group(), CAB[0], ROAD_Y, CAB[1]); G.add(cab);
    // a pure black body rendered as a hole in the frame: a dark charcoal paint with chrome trims reads as a black cab
    const BLK = M(0x50545e), ROOF = M(0x5c606a), CHR = mat({ color: 0xd8dce4, unlit: 0.25 }), GLS = mat({ color: 0x6a7a96, unlit: 0.3 }), TYRE = M(0x1e1e22);
    cab.add(at(box(3.5, 0.62, 1.48, BLK), 0, 0.55, 0));
    cab.add(at(box(2.1, 0.62, 1.38, BLK), 0.25, 1.17, 0)); cab.add(at(box(2.14, 0.05, 1.42, ROOF), 0.25, 1.5, 0));
    for (const sd of [-1, 1]) { cab.add(at(box(3.4, 0.04, 0.01, CHR), 0, 0.85, sd * 0.745)); cab.add(at(box(1.95, 0.03, 0.012, CHR), 0.25, 1.42, sd * 0.7)); cab.add(at(box(1.95, 0.03, 0.012, CHR), 0.25, 0.98, sd * 0.7)); cab.add(at(box(0.03, 0.42, 0.012, CHR), 0.25, 1.2, sd * 0.7)); }
    const bonnet = at(box(0.6, 0.34, 1.44, BLK), -1.35, 0.98, 0); bonnet.rotation.z = -0.15; cab.add(bonnet);
    for (const sd of [-1, 1]) cab.add(at(box(1.9, 0.4, 0.01, GLS), 0.25, 1.2, sd * 0.695));
    const ws = at(box(0.01, 0.42, 1.24, GLS), -0.81, 1.2, 0); ws.rotation.z = 0.25; cab.add(ws);
    cab.add(at(box(0.01, 0.4, 1.2, GLS), 1.31, 1.2, 0));
    for (const [wx, wz] of [[-1.15, 0.72], [1.15, 0.72], [-1.15, -0.72], [1.15, -0.72]]) { cab.add(at(rot(cyl(0.3, 0.3, 0.2, 10, TYRE), PI / 2, 0, 0), wx, 0.3, wz)); cab.add(at(rot(cyl(0.16, 0.16, 0.21, 8, CHR), PI / 2, 0, 0), wx, 0.3, wz)); }
    cab.add(at(box(0.1, 0.24, 1.0, CHR), -1.78, 0.5, 0)); cab.add(at(box(0.04, 0.3, 0.5, CHR), -1.74, 0.78, 0));
    cab.add(at(box(0.1, 0.24, 1.0, CHR), 1.78, 0.5, 0));
    for (const sd of [-1, 1]) cab.add(at(rot(cyl(0.11, 0.11, 0.06, 10, glow(0xfff4d8, 0.9)), 0, 0, PI / 2), -1.77, 0.72, sd * 0.5));
    const taxiT = tex(24, 8, x => { px(x, '#f2c830', 0, 0, 24, 8); x.font = 'bold 7px monospace'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillStyle = '#1a1a1a'; x.fillText('TAXI', 12, 4.5); }, 3549);
    cab.add(at(box(0.5, 0.14, 0.24, mat({ map: taxiT, unlit: 0.85 })), -0.25, 1.55, 0));

    // ---------------- the pets ----------------
    const guests = [];
    const SPOTS = [[-8.6, -2.3], [-8.0, 1.1], [-3.6, 1.0], [3.4, -2.4], [4.8, 1.1], [7.6, -2.5], [8.6, 1.0], [-12.0, -1.0], [12.2, -0.8],
      [-6.9, 1.2], [6.9, 0.9], [9.8, -2.6], [-12.8, 1.0], [13.2, 1.2], [-4.2, -2.4], [3.2, 1.3], [-9.6, -0.6], [10.2, -1.2],
      [-14.0, -2.2], [14.4, -2.2], [-5.2, 1.4], [5.6, -1.0], [-11.2, 1.3], [11.4, 1.3]];
    SPOTS.forEach(([x, z], i) => { const p = pet(i); G.add(p.g); guests.push({ p, x, z, face: Math.atan2(0 - x, 0.2 - z) }); });

    // ---------------- the gift box, the palace, hearts, petals ----------------
    const gift = giftBox(); G.add(gift); gift.visible = false;
    const pal = palace(); G.add(pal); pal.visible = false;
    const heartM = M(0xff4f9a, { unlit: 0.8 }), hearts = [];
    for (let i = 0; i < 27; i++) { const h = new THREE.Group(); h.add(at(ico(0.1, 0, heartM), -0.075, 0, 0)); h.add(at(ico(0.1, 0, heartM), 0.075, 0, 0)); h.add(rot(at(cone(0.125, 0.18, 4, heartM), 0, -0.11, 0), PI, 0, 0)); h.visible = false; G.add(h); hearts.push(h); }
    const petalM = mat({ color: 0xf6a0c4, unlit: 0.4, side: THREE.DoubleSide });
    const petalG = new THREE.Group(); G.add(petalG);
    const petalAnim = fall(petalG, 60, petalM, new THREE.PlaneGeometry(0.08, 0.06), { w: 9, top: 5, speed: 0.55, spin: 2.2, drift: 0.5, seed: 3550 });

    return {
      group: G, sky: null, shadowCol: 0x6a6870, indoor: false,
      light() { lights(0xb8b4ae, 0xfff0dc, [0.35, -0.8, -0.5], 0xd8dce2, [26, 95], 9); },
      anim(t, P = {}) {
        const s = shotT(t, P), b = beat(t), zone = P.zone || 'day';
        const night = zone === 'night', dusk = zone === 'dusk', lit = night || dusk || !!P.lit;
        if (dusk) lights(0x8a7a8a, 0xffb080, [0.65, -0.45, -0.55], 0xc8a0a0, [22, 80], 9);
        else if (night) lights(0x4a5278, 0x8a96d0, [0.3, -0.85, -0.4], 0x182038, [20, 70], 10);
        daySky.visible = zone === 'day'; duskSky.visible = dusk; nightSky.visible = night; clouds.visible = !night; nightBits.visible = night;
        skylines[0].visible = !night; skylines[1].visible = night; puddles.visible = night; bulbs.visible = night;
        houses.forEach(h => { h.up.material = night ? h.mats[1] : h.mats[0]; });
        lampGlass.uniforms.uUnlit.value = lit ? 1 : 0.5;
        if (lit) { pt(0, LAMPS[0][0], 3.9, LAMPS[0][1], 1.2, 0.95, 0.6); pt(1, LAMPS[1][0], 3.9, LAMPS[1][1], 1.2, 0.95, 0.6); }
        pt(2, (BOOKS.x0 + BOOKS.x1) / 2, 2.2, FACADE_Z - 1.2, lit ? 1.1 : 0.7, lit ? 0.85 : 0.6, lit ? 0.5 : 0.4);
        if (P.key) pt(3, P.key[0], P.key[1], P.key[2], P.key[3], P.key[4], P.key[5]);
        cab.visible = P.cab !== false && !night;
        for (const gl of glints) gl.visible = P.glints !== false;
        readLamp.visible = P.readingLamp !== false;
        // the blind and the door
        const bl = cl(ramp(P.blind, s)), bh = Math.max(0.02, bl * (WIN.y1 - WIN.y0 - 0.05));
        blind.visible = bl > 0.01; blind.scale.y = bh; blind.position.set((WIN.x0 + WIN.x1) / 2, WIN.y1 - 0.06 - bh / 2, FACADE_Z - 0.07);
        blindM.uniforms.uUnlit.value = lit ? 0.85 : 0; blindM.uniforms.uCol.value.setRGB(lit ? 1.05 : 1, lit ? 0.92 : 1, lit ? 0.7 : 1);
        sil.visible = !!P.shadow && lit && bl > 0.95;
        doorPivot.rotation.y = -1.45 * cl(ramp(P.door, s));
        // the pets
        const mode = P.pets ?? 'idle', n = guests.length;
        guests.forEach((q, i) => {
          let { x, z } = q, yaw = q.face; const { p } = q;
          if (P.spots) {
            if (i >= P.spots.length) { p.g.visible = false; return; }
            [x, z] = P.spots[i]; yaw = Math.atan2((P.spotsAt || [0, 0])[0] - x, (P.spotsAt || [0, 0])[1] - z);
          } else if (P.mob) {
            const [cx, cz, cols, rows, dx, dz, my] = P.mob, c = i % cols, r = Math.floor(i / cols);
            if (r >= rows) { p.g.visible = false; return; }
            x = cx + (c - (cols - 1) / 2) * dx + (r % 2 ? dx * 0.25 : 0); z = cz + r * dz; yaw = (my ?? 180) * PI / 180;
          } else if (P.gather) {
            const [gx, gz, gr, a0, a1, gy] = P.gather, a = (a0 + (a1 - a0) * i / Math.max(1, n - 1)) * PI / 180;
            x = gx + Math.sin(a) * gr; z = gz + Math.cos(a) * gr; yaw = gy != null ? gy * PI / 180 : Math.atan2(gx - x, gz - z);
          }
          const show = mode !== false && !P.noguests && !cleared(P, x, z); p.g.visible = show; if (!show) return;
          if (P.stare) yaw = Math.atan2(P.stare[0] - x, P.stare[1] - z);
          const bb = b + (mode === 'dance' ? 0 : i * 0.13), kick = Math.exp(-(bb - Math.floor(bb)) * 5);
          let side = 0, sway = 0, bob = 0.03 * Math.abs(Math.sin(bb * PI)), headZ = 0, headX = 0.08 * Math.abs(Math.sin(bb * PI));
          let aL = [0.25 * Math.sin(bb * PI), 0.12], aR = [0.25 * Math.sin(bb * PI + PI), 0.12];
          if (mode === 'dance') {
            side = 0.12 * (Math.floor(bb / 2) % 2 ? 1 : -1); sway = 0.18 * Math.sin(bb * PI / 2); bob = 0.06 * kick;
            aL = [0.3, 2.45 + 0.35 * kick]; aR = [0.3, 2.45 + 0.35 * kick];
          } else if (mode === 'swoon') {
            headZ = Math.sin(i * 1.7 + 0.5) > 0 ? 0.32 : -0.32; headX = -0.18; sway = 0.12 * Math.sin(b * PI * 0.5 + i);
            aL = [-1.25, 0.55]; aR = [-1.25, 0.55]; bob = 0.01;
          } else if (mode === 'cheer') { aL = [0.35, 2.45 + 0.25 * Math.sin(bb * TAU)]; aR = [0.35, 2.45 + 0.25 * Math.sin(bb * TAU + 1)]; bob = 0.05 * kick; }
          else if (mode === 'gasp') { aL = [-2.45, 0.12]; aR = [-2.45, 0.12]; headX = -0.22; bob = 0; }   // paws on the cheeks, in front of the skull's sides
          else if (mode === 'stare') { aL = [0, 0.1]; aR = [0, 0.1]; bob = 0; headX = 0; }
          p.g.position.set(x + Math.cos(yaw) * side, 0, z - Math.sin(yaw) * side); p.g.rotation.y = yaw;
          p.body.position.y = bob; p.body.rotation.z = sway; p.head.rotation.set(headX, 0, headZ);
          p.arms.forEach((a, k2) => { const [rx, rz] = k2 ? aR : aL; a.rotation.set(rx, 0, (k2 ? 1 : -1) * rz); });
          const h = p.heart, ha = mode === 'swoon' ? ((s + i * 0.37) % 1.6) : (P.petHearts != null ? s - P.petHearts - (i % 4) * 0.12 : -1);
          h.visible = ha >= 0 && ha < 1.4;
          if (h.visible) { const pop = Math.min(1, ha / 0.18); h.position.set(0.12 * Math.sin(ha * 5 + i), 1.3 + ha * 0.5, 0); h.scale.setScalar(1.7 * (0.6 + 0.6 * pop) * (1.15 - 0.3 * ha / 1.4)); h.rotation.y = -yaw + (P.heartYaw ?? 0) * PI / 180; }
        });
        // the gift box: slides along, its lid lifts off and lands beside it
        const gf = P.gift; gift.visible = !!gf;
        if (gf) {
          const u0 = (s - (gf.at ?? 0)) / Math.max(0.01, gf.dur ?? 1), u = gf.to ? (gf.lin ? cl(u0) : sm(u0)) : 0;
          const gx = gf.to ? gf.x + (gf.to[0] - gf.x) * u : gf.x, gz = gf.to ? gf.z + (gf.to[1] - gf.z) * u : gf.z;
          gift.position.set(gx, 0, gz); gift.rotation.y = (gf.yaw || 0) * PI / 180;
          const lv = cl(ramp(gf.lid, s)), lid = gift.userData.lid, H = GIFT.H;
          const arc = Math.sin(lv * PI) * 0.7;
          lid.position.set(lv * (GIFT.W + 0.15), H + 0.05 + arc - lv * (H + 0.05 - 0.06), lv * 0.25); lid.rotation.set(0, lv * 0.5, -lv * 0.12);
          lid.visible = gf.bow !== false || lv < 0.99;
        }
        const pl = P.palace; pal.visible = !!pl;
        if (pl) {
          const u = pl.to ? sm((s - (pl.at ?? 0)) / Math.max(0.01, pl.dur ?? 1)) : 0;
          const x0 = pl.x, z0 = pl.z, y0 = pl.y || 0, [x1, z1, y1] = pl.to || [x0, z0, y0];
          pal.position.set(x0 + (x1 - x0) * u, y0 + ((y1 ?? y0) - y0) * u + Math.sin(u * PI) * (pl.arc ?? 0), z0 + (z1 - z0) * u); pal.rotation.y = (pl.yaw || 0) * PI / 180;
        }
        hearts.forEach((h, i) => {
          const q = (P.hearts || [])[Math.floor(i / 3)]; h.visible = false; if (!q) return;
          let e = s - q[3] - (i % 3) * 0.3; if (q[4] && e > 0) e %= 1.2;
          if (e < 0 || e > 1.4) return;
          h.visible = true; h.position.set(q[0] + ((i % 3) - 1) * 0.22 + 0.06 * Math.sin(e * 6 + i), q[1] + 0.55 * e, q[2]); h.scale.setScalar(Math.min(1, e * 5) * (1.15 - 0.25 * (e / 1.4)));
          h.rotation.y = (P.heartYaw ?? 0) * PI / 180;
        });
        petalG.visible = P.petals != null && P.petals !== false && (P.petals === true || s >= P.petals);
        if (petalG.visible) { petalAnim(t); const pa = P.petalsAt || [0, 1]; petalG.position.set(pa[0], 0, pa[1]); }
      },
    };
  }
  return { london: london() };
}
