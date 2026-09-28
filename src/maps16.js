// maps16.js: the "Billie Jean" map (2026-09-28, Michael Jackson: the 1983 clip is a stylised city street at night, a
// purple dusk sky over a skyline, a sidewalk whose squares light up under every step, a shop with a green neon sign, a
// lamp post, a camera shop window, a private eye in a trench coat tailing the singer, the HOTEL with its red neon and the
// police at the end). Same contract as the other map files, pure in t:
//   noir  a night street: the sidewalk runs along x, a grid of 1 m squares (centres on whole metres, rows z -3..1) from
//         the shop fronts (NOIR.FACADE_Z) to the curb (CURB_Z), the street 0.14 m lower beyond it, a stone parapet and
//         a skyline at dusk across it. The shops, west to east: the camera shop (CAMERAS), the diner under its green
//         neon (DINER), a dark shuttered front with film posters behind the dance mark (STAGE), the HOTEL (its door at
//         HOTEL, the red vertical neon, a canopy; the doorman's mark DOORMAN), a newsstand. Lamp posts at LAMPS (the
//         thin pole a big cat can't hide behind), a phone booth (BOOTH), a trash can (TRASH), a hydrant, leaves and old
//         newspapers on the squares, pets in coats and hats along the walls and the curb.
//         Flags read by anim(t, P) (s = seconds into the shot, P.t0 its start):
//           lit    [[x, z]]: the squares under those points glow for the whole shot (where he stands, where he stood)
//           trail  [[x0, z0, x1, z1, s0, s1]]: a walker from (x0, z0) at s0 to (x1, z1) at s1 lights the square under
//                  him, which fades over TRAIL_FADE s after he leaves it (the clip's steps)
//           ring   [x, z, s, r0, grow]: on s, the squares round (x, z) light in a ring of radius r0 that grows at `grow`
//                  m/s and fades (the "round" of the song's dance floor)
//           floor  [x, z, r]: the squares within r of (x, z) flicker on the beat, a light-up dance floor round him
//           glowAt [x, z]: a warm light low on the ground there (the lit squares light the dancer from below)
//           gather [cx, cz, r, a0, a1]: the pets stand on an arc of radius r round (cx, cz), from a0 to a1 deg (0 = +z,
//                  towards the street), facing its centre (the crowd that forms round him)
//           stare  [x, z]: every pet's head turns there;  hearts: s (pink hearts pop over the pets, float up and fade)
//           cheer  (paws up);  noguests;  clear [[x, z, r]] (no pet near those points: lenses, marks);  key [x, y, z, r, g, b]
//           stop   s: everything freezes from then (the squares hold, the pets stop): the photo's frozen instant
import { mapKit } from './mapkit.js';

export const NOIR = {
  X: [-16, 16], FACADE_Z: -3.5, CURB_Z: 1.5, STREET_Y: -0.14, FAR_Z: 12,
  ROWS: [-3, -2, -1, 0, 1], STAGE: [0, -0.6],
  HOTEL: [5.6, -3.5], DOOR_W: 1.5, DOOR_H: 2.5, DOORMAN: [6.75, -2.95], HOTEL_IN: [5.6, -3.1],
  LAMPS: [[-3.4, 1.05], [8.6, 1.05]], BOOTH: [-11.2, -2.7], TRASH: [-7.6, -3.0], HYDRANT: [-6.6, 1.15], NEWS: [11.6, -2.7],
  TRAIL_FADE: 2.6,
};

export function buildNoirMaps(K) {
  const k = mapKit(K);
  const { THREE, mat, tex, px, noise, box, TAU, PI, hash, beat, cyl, cone, at, rot, flat, lights, pt, stars, selfLit } = k;
  const M = (c, o = {}) => mat({ color: c, ...o }), glow = c => mat({ color: c, unlit: 1 });
  const cleared = (P, x, z) => (P.clear || []).some(([cx, cz, r]) => (x - cx) ** 2 + (z - cz) ** 2 < r * r);
  const { X, FACADE_Z, CURB_Z, STREET_Y, FAR_Z, ROWS, HOTEL, DOOR_W, DOOR_H, LAMPS, BOOTH, TRASH, HYDRANT, NEWS, TRAIL_FADE } = NOIR;

  // ---------- pets in coats: faceted heads, a coat, box arms, a small hat (a fedora, a beret, a cap) ----------
  const FURS = [0xd8a868, 0xe8d8c0, 0xb08a60, 0xf2eee6, 0x9a9aa4, 0x6a5a50, 0xe8c090];
  const COATS = [0x8a6a4a, 0x3a4a6a, 0x7a2a3a, 0x5a5a62, 0xb8a078, 0x2a5a4a, 0x6a3a7a];
  function pet(i) {
    const g = new THREE.Group(), F = M(FURS[i % FURS.length]), kind = i % 3, coat = M(COATS[(i * 3) % COATS.length]);
    const body = new THREE.Group(); g.add(body);
    body.add(at(box(0.4, 0.5, 0.28, coat), 0, 0.35, 0)); body.add(at(box(0.44, 0.08, 0.3, coat), 0, 0.12, 0));   // the coat and its hem
    body.add(at(box(0.08, 0.3, 0.02, M(0x1a1a20)), 0, 0.38, 0.145));   // the coat's buttoned front
    for (const s of [-1, 1]) body.add(at(box(0.12, 0.12, 0.13, M(0x2a2a30)), s * 0.1, 0.06, 0.02));
    const arms = [-1, 1].map(s => { const a = at(new THREE.Group(), s * 0.23, 0.55, 0); a.add(at(box(0.09, 0.3, 0.09, coat), 0, -0.13, 0)); a.add(at(box(0.08, 0.08, 0.08, F), 0, -0.3, 0)); body.add(a); return a; });
    const head = at(new THREE.Group(), 0, 0.82, 0); body.add(head);
    const skull = new THREE.Mesh(new THREE.IcosahedronGeometry(0.24, 1), F); skull.scale.set(1, 0.9, 0.92); head.add(skull);
    const snout = at(new THREE.Mesh(new THREE.IcosahedronGeometry(0.1, 1), M(0xf0e6d8)), 0, -0.07, 0.19); snout.scale.set(1.1, 0.8, 0.9); head.add(snout);
    head.add(at(new THREE.Mesh(new THREE.IcosahedronGeometry(0.035, 0), M(0x151515)), 0, -0.03, 0.28));
    for (const e of [-1, 1]) {
      head.add(at(new THREE.Mesh(new THREE.IcosahedronGeometry(0.038, 0), M(0x0e0e0e)), e * 0.1, 0.05, 0.19));
      head.add(at(new THREE.Mesh(new THREE.IcosahedronGeometry(0.012, 0), glow(0xffffff)), e * 0.1 + 0.012, 0.065, 0.225));
      head.add(kind === 0 ? rot(at(cone(0.08, 0.2, 4, F), e * 0.15, 0.27, 0), 0, 0, -e * 0.25) : kind === 1 ? at(box(0.08, 0.3, 0.06, F), e * 0.1, 0.33, 0) : rot(at(box(0.07, 0.24, 0.16, F), e * 0.24, 0.02, 0), 0, 0, e * 0.3));
    }
    const hatKind = i % 4, hc = M([0x2a2420, 0x6a2030, 0x3a3a44, 0x8a6a40][i % 4]);
    if (hatKind === 0) { head.add(at(cyl(0.2, 0.2, 0.025, 10, hc), 0, 0.2, -0.02)); head.add(at(cyl(0.11, 0.13, 0.12, 8, hc), 0, 0.27, -0.02)); }   // a fedora
    else if (hatKind === 1) { const bt = at(cyl(0.16, 0.16, 0.05, 10, hc), 0.03, 0.22, -0.02); bt.rotation.z = -0.25; head.add(bt); }   // a beret
    else if (hatKind === 2) { head.add(at(cyl(0.12, 0.13, 0.1, 8, hc), 0, 0.24, -0.02)); head.add(at(box(0.14, 0.02, 0.12, hc), 0, 0.2, 0.1)); }   // a cap
    // hatKind 3: bare-headed, ears up
    const heart = new THREE.Group(); heart.visible = false; g.add(heart);
    const hm = mat({ color: 0xff5fa2, unlit: 0.85 });
    heart.add(at(new THREE.Mesh(new THREE.IcosahedronGeometry(0.07, 0), hm), -0.055, 0, 0)); heart.add(at(new THREE.Mesh(new THREE.IcosahedronGeometry(0.07, 0), hm), 0.055, 0, 0));
    const tip = at(cone(0.09, 0.13, 4, hm), 0, -0.08, 0); tip.rotation.x = PI; heart.add(tip);
    return { g, body, head, arms, heart, i };
  }

  function noir() {
    const G = new THREE.Group();
    const W = X[1] - X[0];
    // ---------------- the sidewalk: separate 1 m slabs over dark joints (one painted plane zigzagged its joints under the PS1's
    // affine warp and never lined up with the lit squares); each slab has its own material, brightened when it lights up ----------------
    const walkD = CURB_Z - FACADE_Z, walkZ = (CURB_Z + FACADE_Z) / 2;
    G.add(flat(W, walkD, M(0x3e3a46), 0, 0, walkZ));   // the joints
    const slabT = tex(8, 8, (x, r) => { px(x, '#9a969e', 0, 0, 8, 8); noise(x, r, 8, 8, ['#a29ea6', '#928e96', '#a6a2aa', '#8e8a92'], 26); }, 1601);
    // the curb and the street below it, wet asphalt with neon puddles
    G.add(at(box(W, 0.14, 0.16, M(0x9a96a0)), 0, STREET_Y / 2, CURB_Z + 0.08));
    const roadT = tex(16, 16, (x, r) => { px(x, '#2e2c36', 0, 0, 16, 16); noise(x, r, 16, 16, ['#34323c', '#28262e', '#3a3844'], 70); }, 1602);
    G.add(flat(W + 30, 30, mat({ map: roadT, rep: [(W + 30) / 2, 15] }), 0, STREET_Y, CURB_Z + 15));
    for (let i = 0; i < 16; i++) G.add(flat(0.9, 0.12, mat({ color: 0xe8e0c0, unlit: 0.6 }), -15 + i * 2, STREET_Y + 0.004, 6.2));   // the centre line's dashes
    const puddle = (x, z, w, d, c) => G.add(flat(w, d, mat({ color: c, unlit: 0.55 }), x, STREET_Y + 0.006, z));
    puddle(-6.5, 3.2, 1.6, 0.7, 0x6a3a8a); puddle(3.8, 4.1, 2.0, 0.8, 0x3a6a5a); puddle(9.5, 2.7, 1.2, 0.6, 0x8a2a4a); puddle(-12, 4.6, 1.8, 0.7, 0x4a4a8a);
    // across the street: a stone parapet, then the city at dusk
    G.add(at(box(W + 30, 0.8, 0.4, M(0x6a6470)), 0, STREET_Y + 0.4, FAR_Z)); G.add(at(box(W + 30, 0.1, 0.5, M(0x7a7480)), 0, STREET_Y + 0.85, FAR_Z));
    for (let i = 0; i < 12; i++) { const px0 = -18 + i * 3.4; G.add(at(cyl(0.05, 0.05, 1.2, 6, M(0x2a2a30)), px0, STREET_Y + 1.4, FAR_Z)); G.add(at(new THREE.Mesh(new THREE.IcosahedronGeometry(0.12, 0), glow(0xfff0c8)), px0, STREET_Y + 2.05, FAR_Z)); }
    const skyT = tex(4, 64, x => { const g = x.createLinearGradient(0, 0, 0, 64); g.addColorStop(0, '#140c2a'); g.addColorStop(0.3, '#3a1e5a'); g.addColorStop(0.42, '#8a4a8a'); g.addColorStop(0.5, '#e89ab4'); g.addColorStop(0.56, '#6a3a6a'); g.addColorStop(1, '#1a1224'); x.fillStyle = g; x.fillRect(0, 0, 4, 64); }, 1603);
    const sky = new THREE.Mesh(new THREE.SphereGeometry(185, 16, 12), mat({ map: skyT, unlit: 1, side: THREE.BackSide, nofog: 1 })); G.add(sky);
    G.add(stars(160, 175, 1604, 0xf0e8ff, 0.35));
    // the skyline: tower silhouettes with lit windows on a cylinder far across the river, open towards the shops
    const cityT = tex(256, 64, (x, r) => {
      x.clearRect(0, 0, 256, 64);
      for (let i = 0; i < 64; i++) {
        const w = 3 + Math.floor(r() * 6), h = 14 + Math.floor(r() * 44), x0 = Math.floor(r() * 252);
        px(x, ['#1a1428', '#221a34', '#161020'][Math.floor(r() * 3)], x0, 64 - h, w, h);
        for (let yy = 64 - h + 2; yy < 62; yy += 3) for (let xx = x0 + 1; xx < x0 + w - 1; xx += 2) if (r() < 0.32) px(x, r() < 0.8 ? '#ffd890' : '#ff9ac8', xx, yy, 1, 1);
        if (r() < 0.15) px(x, '#ff3a5a', x0 + Math.floor(w / 2), 64 - h - 2, 1, 2);   // a red aircraft light on a spire
      }
    }, 1605);
    const city = new THREE.Mesh(new THREE.CylinderGeometry(95, 95, 34, 32, 1, true, -PI * 0.55, PI * 1.1), mat({ map: cityT, rep: [2, 1], unlit: 1, side: THREE.BackSide, nofog: 1 }));
    city.material.transparent = true; city.material.alphaTest = 0.5; city.position.set(0, 13, 0); G.add(city);

    // ---------------- the buildings: one row of shop fronts and brick above, west to east ----------------
    const brickT = (base, dark, seed) => tex(16, 16, (x, r) => { px(x, base, 0, 0, 16, 16); for (let y = 0; y < 16; y += 4) px(x, dark, 0, y, 16, 1); for (let y = 0; y < 16; y += 4) for (let xx = (y % 8 ? 4 : 0); xx < 16; xx += 8) px(x, dark, xx, y, 1, 4); noise(x, r, 16, 16, [base, dark], 30); }, seed);
    const upper = (base, seed, litP) => tex(32, 32, (x, r) => {
      px(x, base, 0, 0, 32, 32); noise(x, r, 32, 32, ['rgba(0,0,0,.2)', 'rgba(255,255,255,.06)'], 120);
      for (let yy = 4; yy < 30; yy += 9) for (let xx = 3; xx < 30; xx += 8) { x.fillStyle = r() < litP ? (r() < 0.8 ? '#ffd27a' : '#ff9ac0') : '#1a1826'; x.fillRect(xx, yy, 5, 6); px(x, 'rgba(0,0,0,.45)', xx, yy + 6, 5, 1); }
      selfLit(x, 32, 32);
    }, seed);
    const building = (x0, x1, h, base, dark, seed, litP = 0.35) => {
      const w = x1 - x0, cx = (x0 + x1) / 2;
      const low = new THREE.Mesh(new THREE.PlaneGeometry(w, 3.2), mat({ map: brickT(base, dark, seed), rep: [w / 1.2, 3.2 / 1.2] })); G.add(at(low, cx, 1.6, FACADE_Z));
      const up = new THREE.Mesh(new THREE.PlaneGeometry(w, h - 3.2), mat({ map: upper(base, seed + 50, litP), rep: [w / 3.2, (h - 3.2) / 3.2] })); G.add(at(up, cx, 3.2 + (h - 3.2) / 2, FACADE_Z));
      G.add(at(box(w, 0.25, 0.3, M(0x3a3440)), cx, h + 0.12, FACADE_Z + 0.1));   // the cornice
      G.add(at(box(w, 0.18, 0.24, M(0x4a4450)), cx, 3.25, FACADE_Z + 0.1));      // the band over the shops
      G.add(at(box(w, h, 6, M(0x1a1620)), cx, h / 2, FACADE_Z - 3.02));           // the block behind (seen past the corners)
    };
    building(-16, -9.4, 11.5, '#6a3a34', '#4a2622', 1610, 0.3);
    building(-9.4, -2.4, 9.2, '#7a4a3a', '#5a3228', 1611, 0.4);
    building(-2.4, 3.0, 12.5, '#4a4458', '#322e40', 1612, 0.25);
    building(3.0, 8.4, 14, '#6a5a4a', '#4a3e32', 1613, 0.45);
    building(8.4, 16, 10.2, '#5a3a44', '#3e2630', 1614, 0.35);
    // fire escapes: black iron landings and zigzag stairs on two of the fronts, from the first floor up
    const IRON = M(0x1e1c22);
    const escape = (cx, w, floors) => {
      for (let f = 0; f < floors; f++) {
        const y = 4.2 + f * 2.8; G.add(at(box(w, 0.05, 0.9, IRON), cx, y, FACADE_Z + 0.46));
        G.add(at(box(w, 0.04, 0.04, IRON), cx, y + 0.9, FACADE_Z + 0.9)); for (let j = 0; j <= 6; j++) G.add(at(box(0.03, 0.9, 0.03, IRON), cx - w / 2 + j * w / 6, y + 0.45, FACADE_Z + 0.9));
        if (f < floors - 1) { const st = at(box(0.5, 0.05, 3.6, IRON), cx + (f % 2 ? -0.6 : 0.6), y + 1.4, FACADE_Z + 0.7); st.rotation.set(0, PI / 2, f % 2 ? 0.66 : -0.66); G.add(st); }
      }
    };
    escape(-12.6, 2.6, 3); escape(12.0, 2.4, 3);
    // water towers on the roofs
    for (const [x, y] of [[-13.5, 11.5], [11, 10.2]]) { G.add(at(cyl(0.9, 0.9, 1.8, 8, M(0x5a4030)), x, y + 1.6, FACADE_Z - 1.6)); G.add(at(cone(1.0, 0.7, 8, M(0x3a2a20)), x, y + 2.85, FACADE_Z - 1.6)); for (const s of [-1, 1]) G.add(at(box(0.08, 0.7, 0.08, IRON), x + s * 0.6, y + 0.35, FACADE_Z - 1.6)); }

    // ---------------- the shop fronts ----------------
    const windowPane = (cx, w, h, y0, m) => G.add(at(new THREE.Mesh(new THREE.PlaneGeometry(w, h), m), cx, y0 + h / 2, FACADE_Z + 0.02));
    const frame = (cx, w, h, y0, c = 0x2a2430) => { const m = M(c); G.add(at(box(w + 0.16, 0.1, 0.12, m), cx, y0 + h + 0.05, FACADE_Z + 0.05)); G.add(at(box(w + 0.16, 0.16, 0.14, m), cx, y0 - 0.08, FACADE_Z + 0.06)); for (const s of [-1, 1]) G.add(at(box(0.08, h, 0.12, m), cx + s * (w / 2 + 0.04), y0 + h / 2, FACADE_Z + 0.05)); };
    const neon = (text, w, h, col, glowCol, seed) => tex(w * 8, h * 8, x => {
      x.clearRect(0, 0, w * 8, h * 8); x.font = `bold ${h * 8 - 6}px monospace`; x.textAlign = 'center'; x.textBaseline = 'middle';
      x.fillStyle = glowCol; for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) x.fillText(text, w * 4 + dx, h * 4 + dy + 1);
      x.fillStyle = col; x.fillText(text, w * 4, h * 4 + 1);
    }, seed);
    const sign = (t, w, h, x, y, z, ry = 0) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat({ map: t, unlit: 1 })); m.material.transparent = true; m.material.alphaTest = 0.3; m.rotation.y = ry; G.add(at(m, x, y, z)); return m; };
    // the camera shop: a lit window of cameras on shelves (the clip's camera shop)
    const camWinT = tex(32, 16, (x, r) => {
      px(x, '#f2e0b0', 0, 0, 32, 16); px(x, '#b89060', 0, 7, 32, 1); px(x, '#b89060', 0, 14, 32, 1);
      for (let row = 0; row < 2; row++) for (let i = 0; i < 6; i++) { const xx = 2 + i * 5, yy = 3 + row * 7; px(x, '#1a1a1e', xx, yy, 4, 3); px(x, '#4a4a54', xx + 1, yy + 1, 2, 2); px(x, '#c8c8d0', xx + 3, yy - 1, 1, 1); }
    }, 1620);
    windowPane(-13.2, 3.4, 1.9, 0.5, mat({ map: camWinT, unlit: 0.9 })); frame(-13.2, 3.4, 1.9, 0.5);
    sign(neon('CAMERAS', 6, 1, '#f0f4ff', '#5a8aff', 1621), 3.0, 0.5, -13.2, 2.8, FACADE_Z + 0.12);
    G.add(at(box(1.0, 2.2, 0.1, M(0x3a2a24)), -10.3, 1.1, FACADE_Z + 0.04));   // its door
    // the diner: a warm steamy window under a green neon sign
    const dinerT = tex(32, 16, (x, r) => { px(x, '#ffd890', 0, 0, 32, 16); noise(x, r, 32, 16, ['#ffe4a8', '#f8c878'], 60); px(x, '#c86a3a', 0, 12, 32, 4); for (let i = 2; i < 32; i += 6) { px(x, '#5a3a2a', i, 8, 3, 4); px(x, '#e8c0a0', i, 6, 3, 2); } }, 1622);
    windowPane(-6.2, 4.2, 1.8, 0.6, mat({ map: dinerT, unlit: 0.9 })); frame(-6.2, 4.2, 1.8, 0.6, 0x2a4a3a);
    sign(neon('DINER', 5, 1, '#c8ffd0', '#2ad05a', 1623), 3.2, 0.64, -6.2, 2.85, FACADE_Z + 0.12);
    G.add(at(box(1.0, 2.2, 0.1, M(0x2a4a3a)), -3.3, 1.1, FACADE_Z + 0.04));
    // behind the dance mark: a shuttered front with torn film posters, dark enough for the dancers to read against
    const shutT = tex(16, 16, (x, r) => { px(x, '#4a4852', 0, 0, 16, 16); for (let y = 0; y < 16; y += 2) px(x, '#3a3842', 0, y, 16, 1); noise(x, r, 16, 16, ['#52505a'], 20); }, 1624);
    windowPane(0.3, 4.4, 2.6, 0.0, mat({ map: shutT, rep: [3, 2] }));
    const posterT = seed => tex(12, 16, (x, r) => { const c = ['#e8b84a', '#d85a6a', '#5ab4d8', '#8ad86a'][seed % 4]; px(x, c, 0, 0, 12, 16); px(x, '#1a1a1e', 1, 1, 10, 9); px(x, '#f0f0f0', 2, 11, 8, 1); px(x, '#f0f0f0', 3, 13, 6, 1); px(x, '#f8e8a0', 4, 3, 4, 5); noise(x, r, 12, 16, ['rgba(255,255,255,.15)'], 10); }, 1625 + seed);
    [[-1.3, 2.25, 0.05], [-0.1, 2.35, -0.06], [1.1, 2.2, 0.08], [2.1, 2.3, -0.04]].forEach(([x, y, rz], i) => { const p = new THREE.Mesh(new THREE.PlaneGeometry(0.6, 0.8), mat({ map: posterT(i), unlit: 0.25 })); p.rotation.z = rz; G.add(at(p, x, y, FACADE_Z + 0.04)); });
    // the HOTEL: a lit doorway under a canopy, the red vertical neon on the corner, brass lamps
    const [hx] = HOTEL;
    const lobbyT = tex(16, 24, (x, r) => {   // two glass door leaves onto a warm lobby: a chandelier's glow, a red runner going in, brass handles
      px(x, '#e8b868', 0, 0, 16, 24); noise(x, r, 16, 16, ['#f4cc80', '#dca858'], 30); px(x, '#fff0c0', 5, 2, 6, 3); px(x, '#b8303a', 5, 14, 6, 10);
      px(x, '#6a4a2a', 0, 0, 16, 1); px(x, '#6a4a2a', 7, 0, 2, 24); px(x, '#6a4a2a', 0, 0, 1, 24); px(x, '#6a4a2a', 15, 0, 1, 24); px(x, '#f0d060', 6, 11, 1, 3); px(x, '#f0d060', 9, 11, 1, 3);
    }, 1630);
    windowPane(hx, DOOR_W, DOOR_H, 0, mat({ map: lobbyT, unlit: 0.95 }));
    frame(hx, DOOR_W, DOOR_H, 0, 0x6a4a2a);
    G.add(at(box(DOOR_W + 1.4, 0.12, 1.4, M(0x8a1a2a)), hx, DOOR_H + 0.45, FACADE_Z + 0.7));   // the canopy
    for (const s of [-1, 1]) G.add(at(cyl(0.03, 0.03, DOOR_H + 0.4, 6, M(0xc8a040)), hx + s * (DOOR_W / 2 + 0.6), (DOOR_H + 0.4) / 2, FACADE_Z + 1.36));
    for (const s of [-1, 1]) G.add(at(new THREE.Mesh(new THREE.IcosahedronGeometry(0.1, 0), glow(0xffe0a0)), hx + s * (DOOR_W / 2 + 0.25), 2.0, FACADE_Z + 0.15));
    G.add(flat(DOOR_W + 0.8, 1.0, M(0x8a1a2a), hx, 0.006, FACADE_Z + 0.5));   // a red mat at the door
    const hotelT = tex(8, 48, x => {
      x.clearRect(0, 0, 8, 48); x.font = 'bold 9px monospace'; x.textAlign = 'center'; x.textBaseline = 'middle';
      'HOTEL'.split('').forEach((ch, i) => { x.fillStyle = '#ff3a4a'; x.fillText(ch, 4, 5 + i * 9.4); });
    }, 1631);
    const hotelSign = new THREE.Group(); G.add(at(hotelSign, 3.35, 5.6, FACADE_Z + 0.55));
    hotelSign.add(at(box(0.62, 3.6, 0.16, M(0x1a1418)), 0, 0, 0));
    for (const s of [-1, 1]) { const f = new THREE.Mesh(new THREE.PlaneGeometry(0.56, 3.4), mat({ map: hotelT, unlit: 1 })); f.material.transparent = true; f.material.alphaTest = 0.3; f.rotation.y = s > 0 ? PI / 2 : -PI / 2; hotelSign.add(at(f, s * 0.32, 0, 0)); }
    const hotelFront = new THREE.Mesh(new THREE.PlaneGeometry(0.56, 3.4), mat({ map: hotelT, unlit: 1 })); hotelFront.material.transparent = true; hotelFront.material.alphaTest = 0.3; hotelSign.add(at(hotelFront, 0, 0, 0.085));
    sign(neon('HOTEL', 5, 1, '#fff0d0', '#ff4a3a', 1632), 2.6, 0.55, hx, DOOR_H + 0.46, FACADE_Z + 1.42);
    // the newsstand
    const [nx, nz] = NEWS, ns = at(new THREE.Group(), nx, 0, nz); G.add(ns);
    ns.add(at(box(1.8, 1.2, 0.9, M(0x2a4a3a)), 0, 0.6, 0)); ns.add(at(box(2.0, 0.08, 1.2, M(0x1a3a2a)), 0, 2.1, 0.1)); for (const s of [-1, 1]) ns.add(at(box(0.06, 0.9, 0.06, M(0x1a3a2a)), s * 0.9, 1.65, 0.6));
    const paperT = tex(8, 8, (x, r) => { px(x, '#e8e4d8', 0, 0, 8, 8); px(x, '#2a2a2a', 1, 1, 6, 1); for (let y = 3; y < 8; y += 2) px(x, '#9a9690', 1, y, 6, 1); }, 1633);
    for (let i = 0; i < 5; i++) { const p = new THREE.Mesh(new THREE.PlaneGeometry(0.3, 0.38), mat({ map: paperT, unlit: 0.3 })); p.rotation.x = -0.5; ns.add(at(p, -0.7 + i * 0.35, 1.25, 0.46)); }
    // ---------------- street furniture ----------------
    for (const [lx, lz] of LAMPS) {
      const l = at(new THREE.Group(), lx, 0, lz); G.add(l);
      l.add(at(cyl(0.16, 0.2, 0.3, 8, IRON), 0, 0.15, 0)); l.add(at(cyl(0.06, 0.06, 3.9, 6, IRON), 0, 2.1, 0));   // a thin pole: a big cat can't hide behind it
      l.add(at(box(0.3, 0.06, 0.3, IRON), 0, 4.05, 0)); l.add(at(new THREE.Mesh(new THREE.IcosahedronGeometry(0.22, 1), glow(0xfff2c8)), 0, 4.3, 0));
      l.add(at(cone(0.26, 0.2, 6, IRON), 0, 4.58, 0));
    }
    const [bx0, bz0] = BOOTH, booth = at(new THREE.Group(), bx0, 0, bz0); G.add(booth);   // a phone booth, open towards the street
    const boothM = M(0x8a1a22), glassM = mat({ color: 0xd8f0ff, unlit: 0.35, see: 0.45 });
    booth.add(at(box(1.0, 0.1, 1.0, boothM), 0, 2.35, 0)); booth.add(at(box(1.0, 0.08, 1.0, boothM), 0, 0.04, 0));
    for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) booth.add(at(box(0.08, 2.3, 0.08, boothM), sx * 0.46, 1.2, sz * 0.46));
    booth.add(at(box(0.9, 1.8, 0.03, glassM), 0, 1.2, -0.46)); for (const s of [-1, 1]) booth.add(at(box(0.03, 1.8, 0.9, glassM), s * 0.46, 1.2, 0));
    booth.add(at(box(0.24, 0.34, 0.12, M(0x2a2a30)), 0, 1.3, -0.38)); booth.add(at(box(0.9, 0.18, 0.03, glow(0xfff0d8)), 0, 2.2, 0.47));
    const [tx0, tz0] = TRASH;
    G.add(at(cyl(0.3, 0.26, 0.8, 10, M(0x5a6068)), tx0, 0.4, tz0)); G.add(at(cyl(0.33, 0.33, 0.06, 10, M(0x6a7078)), tx0, 0.82, tz0)); G.add(at(box(0.12, 0.04, 0.04, M(0x6a7078)), tx0, 0.87, tz0));
    for (let i = 0; i < 3; i++) { const p = new THREE.Mesh(new THREE.PlaneGeometry(0.3, 0.38), mat({ map: paperT })); p.rotation.set(-0.9, i, 0.4); G.add(at(p, tx0 + (i - 1) * 0.12, 0.9, tz0 + 0.05)); }
    const [hyx, hyz] = HYDRANT;
    G.add(at(cyl(0.12, 0.14, 0.5, 8, M(0xc82a2a)), hyx, 0.25, hyz)); G.add(at(cyl(0.14, 0.14, 0.08, 8, M(0xc82a2a)), hyx, 0.52, hyz)); G.add(at(new THREE.Mesh(new THREE.IcosahedronGeometry(0.1, 0), M(0xc82a2a)), hyx, 0.6, hyz));
    for (const s of [-1, 1]) G.add(at(rot(cyl(0.05, 0.05, 0.1, 6, M(0xc82a2a)), 0, 0, PI / 2), hyx + s * 0.16, 0.34, hyz));
    // fallen leaves and old newspapers on the squares (flat, a few mm up; none on the dance mark)
    const leafCols = [0xb8903a, 0x9a7a3a, 0xd8b04a, 0x7a6a3a];   // ochres and browns: red leaves on a lit square read as blood
    for (let i = 0; i < 70; i++) {
      const x = X[0] + hash(i, 1640) * W, z = FACADE_Z + 0.3 + hash(i, 1641) * (CURB_Z - FACADE_Z - 0.4);
      if (x > -3.2 && x < 8.2) continue;
      const lf = flat(0.12, 0.08, M(leafCols[i % 4]), x, 0.004, z); lf.rotation.z = hash(i, 1642) * TAU; G.add(lf);
    }
    for (let i = 0; i < 10; i++) {
      const x = X[0] + 1 + hash(i, 1643) * (W - 2), z = FACADE_Z + 0.4 + hash(i, 1644) * 4.4;
      if (x > -3.2 && x < 8.2) continue;
      const pg = flat(0.4, 0.3, mat({ map: paperT }), x, 0.005, z); pg.rotation.z = hash(i, 1645) * TAU; G.add(pg);
    }

    // ---------------- the slabs: centres on whole metres, 0.94 m across (the joints show between them) ----------------
    const squares = [];
    for (let xi = Math.ceil(X[0] + 0.5); xi <= Math.floor(X[1] - 0.5); xi++) for (const zi of ROWS) {
      const tint = 0.92 + 0.1 * hash(xi, zi * 3 + 1650), m = mat({ map: slabT, color: new THREE.Color(tint, tint * 0.99, tint * 1.02) });
      const q = flat(0.94, 0.94, m, xi, 0.004, zi); q.rotation.z = Math.floor(hash(xi, zi, 1651) * 4) * PI / 2; G.add(q); squares.push({ q, x: xi, z: zi, tint });
    }
    // ---------------- the pets: along the shop fronts and the curb, facing the middle of the sidewalk ----------------
    const guests = [];
    // none within the action's stretch of sidewalk (x -1.5..5): pets there sat on the cast's silhouettes in the low lenses; `gather` brings them round him
    const SPOTS = [[-9.2, -2.7], [-8.6, 1.0], [-5.6, -2.8], [-5.2, 1.0], [-2.1, -2.9], [7.4, -2.6], [9.6, -2.8], [10.2, 1.0], [-11.8, 0.6], [12.8, -0.4], [-7.0, -3.0], [8.4, -2.9]];
    SPOTS.forEach(([x, z], i) => { const p = pet(i); G.add(p.g); guests.push({ p, x, z, face: Math.atan2(0 - x, -0.8 - z) }); });

    return {
      group: G, sky: null, shadowCol: 0x4a4652, indoor: false,
      light() {
        lights(0x5a4a78, 0xb8a8e8, [0.3, -0.8, 0.45], 0x2a1e3a, [22, 80], 10);
        pt(0, LAMPS[0][0], 4.0, LAMPS[0][1], 0.95, 0.82, 0.55);
        pt(1, LAMPS[1][0], 4.0, LAMPS[1][1], 0.95, 0.82, 0.55);
        pt(2, HOTEL[0], 2.8, FACADE_Z + 1.4, 0.8, 0.3, 0.32);
        pt(3, -6.2, 2.6, FACADE_Z + 1.2, 0.35, 0.8, 0.45);
      },
      anim(t, P = {}) {
        if (P.key) pt(3, P.key[0], P.key[1], P.key[2], P.key[3], P.key[4], P.key[5]);
        const c = P.t0 != null ? t - P.t0 : 0, stopped = P.stop != null && c >= P.stop, s = stopped ? P.stop : c, b = beat((P.t0 ?? 0) + s);
        const kick = Math.exp(-(b - Math.floor(b)) * 4);
        // the squares: the brightest claim on each one wins
        const lvl = new Map(), claim = (x, z, v) => { const key = `${Math.round(x)},${Math.round(z)}`; if (v > (lvl.get(key) || 0)) lvl.set(key, v); };
        for (const [x, z] of P.lit || []) claim(x, z, 0.85 + 0.15 * kick);
        for (const [x0, z0, x1, z1, s0, s1] of P.trail || []) {
          if (s < s0) continue;
          // sample the path finely: each sample's square is lit from when he reaches it, and fades once he has left it
          const n = Math.max(2, Math.ceil(Math.hypot(x1 - x0, z1 - z0) * 8)), last = new Map();
          for (let j = 0; j <= n; j++) {
            const u = j / n, sj = s0 + (s1 - s0) * u; if (sj > s) break;
            last.set(`${Math.round(x0 + (x1 - x0) * u)},${Math.round(z0 + (z1 - z0) * u)}`, sj);
          }
          const u = Math.min(1, (s - s0) / Math.max(0.01, s1 - s0)), here = `${Math.round(x0 + (x1 - x0) * u)},${Math.round(z0 + (z1 - z0) * u)}`;
          for (const [key, sj] of last) { const [sx, sz] = key.split(',').map(Number); claim(sx, sz, key === here ? 1 : Math.max(0, 1 - (s - sj) / TRAIL_FADE)); }
        }
        if (P.ring) {
          const [rx, rz, rs, r0, grow = 0] = P.ring, age = s - rs;
          if (age >= 0) { const R = r0 + grow * age, fade = Math.max(0, 1 - age / 2.4); for (const q of squares) { const d = Math.hypot(q.x - rx, q.z - rz); if (Math.abs(d - R) < 0.62) claim(q.x, q.z, 0.5 + 0.5 * fade); } }
        }
        if (P.floor) {
          const [fx, fz, fr] = P.floor, nb = Math.floor(b);
          for (const q of squares) if (Math.hypot(q.x - fx, q.z - fz) <= fr && hash(q.x * 7 + q.z, nb) < 0.45) claim(q.x, q.z, 0.4 + 0.5 * kick);
        }
        for (const q of squares) {   // a lit slab turns into a warm white light panel
          const v = lvl.get(`${q.x},${q.z}`) || 0, u = q.q.material.uniforms;
          u.uUnlit.value = v; u.uCol.value.setRGB(q.tint * (1 + 0.75 * v), q.tint * (0.99 + 0.66 * v), q.tint * (1.02 + 0.38 * v));
        }
        if (P.glowAt) pt(3, P.glowAt[0], 0.35, P.glowAt[1], 0.9, 0.8, 0.55);
        guests.forEach((q, i) => {
          let { x, z } = q; const { p } = q;
          if (P.gather) { const [gx, gz, gr, a0, a1] = P.gather, a = (a0 + (a1 - a0) * i / Math.max(1, guests.length - 1)) * PI / 180; x = gx + Math.sin(a) * gr; z = gz + Math.cos(a) * gr; }
          const show = !P.noguests && !cleared(P, x, z); p.g.visible = show; if (!show) return;
          p.g.position.set(x, 0, z);
          const bb = b + i * 0.13, bounce = stopped ? 0 : Math.abs(Math.sin(bb * PI));
          p.g.rotation.y = P.stare ? Math.atan2(P.stare[0] - x, P.stare[1] - z) : P.gather ? Math.atan2(P.gather[0] - x, P.gather[1] - z) : q.face;
          p.body.position.y = 0.03 * bounce; p.head.rotation.x = stopped ? 0 : 0.08 * bounce;
          p.arms.forEach((a, k2) => { const sd = k2 ? 1 : -1; a.rotation.set(P.cheer ? 0.35 : (stopped ? 0 : 0.25 * Math.sin(bb * PI + k2 * PI)), 0, sd * (P.cheer ? 2.45 + (stopped ? 0 : 0.25 * Math.sin(bb * TAU)) : 0.12)); });
          // the hearts are drawn 1.7x: big enough to read from across the sidewalk
          const h = p.heart, ha = P.hearts != null ? s - P.hearts - (i % 4) * 0.12 : -1;
          h.visible = ha >= 0 && ha < 2.2;
          if (h.visible) { const pop = Math.min(1, ha / 0.18); h.position.set(0, 1.35 + ha * 0.45, 0); h.scale.setScalar(1.7 * (0.6 + 0.6 * pop) * (1 + 0.1 * Math.sin(ha * 12))); }
        });
      },
    };
  }
  return { noir: noir() };
}
