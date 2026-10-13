// maps46.js: the "SaWaDiKa" map (2026-10-13 2nd, LISA; the clip: Bangkok at dusk, a crew in black dancing on the
// concrete steps and walkways of old housing blocks, a Muay Thai ring in a car park among them with boxers training,
// neon-lit tuk-tuks in a parking garage, the city's towers). Same contract as the other map files, pure in t:
//   muaythai  a car park at dusk between three old concrete housing blocks (balconies, laundry, air conditioners, lit
//         windows), the city's towers beyond them under a pink and violet sky; a Muay Thai ring in the middle (RING: the
//         canvas at Y 0.6 m, the posts at x, z +-H 2.2, the apron out to +-(H + AP), three ropes at ROPES above the canvas
//         in the Thai flag's colours, top red, white, then blue; the red corner's pad at (H, -H), back right, the blue
//         corner's at (-H, H), front left, white on the other two; steps up to the apron on the left side at STEPS, going
//         down to -x, pale timber with a light nosing per tread); four floodlight poles at the ring's corners (`poleHide`
//         [i]: those poles and their lamps off for the shot: the generator hides any that lands on a head), the timekeeper's
//         brass bell hung from a post and an arm on a little table at BELL (`bell` s: the timekeeper, a box pet on a step
//         behind it, brings his mallet down on its shoulder, it shakes and rings out: rings of sound facing `bellYaw`; he
//         shows only in a shot that rings it, or with `keeper`; `noBell` hides the lot for a lens beside it), `bonk`
//         [x, y, z, s] (an impact burst where two heads meet: a ring and six stars flying out for 0.6 s, facing `bonkYaw`),
//         three neon tuk-tuks parked round it (TUKS; `hookTuk`: a fourth one at HOOK_TUK,
//         nose to -z, for a lens behind it), string lights high over the car park. Box pets: the crowd standing round the ring (left, right and back) with `ringside` (a mode for all; not `crowd`, a shot field of the engine) or
//         `cmode` [n]: 'watch', 'cheer' (paws up in a V, hopping), 'gasp' (paws at the cheeks, mouth open), 'stare' (at
//         `stare` [x, z]), 'wai' (paws pressed together at the chest, a bow; `waiBow` [body, head] and `waiArms` [x, z]
//         set its rotations for a shot), 'dance', 'fall' (flat on the back),
//         false; `front`: a third row in front of the ring (FRONT), off unless asked (the lenses work from there); `fall`
//         [x, z, r, s]: the pets within r of (x, z) are knocked flat from s (a body landing among them);
//         the crew in black (LISA's dancers: eight box pets in black with black caps) in rows of four round `crewAt`
//         [cx, cz, yaw] (default in front of the ring, facing +z; `crewGap` their spacing, 0.95; `crewRows` 1: one line of
//         eight) with `crew` 'dance' | 'wai' | 'watch' | false (default false). `ropeHide` ['n', 's', 'e', 'w']: a side's ropes gone (a lens outside the ring on that side; n is -z),
//         `ropes` false: all of them; `hearts` [[x, y, z, s0, loop]] + `heartYaw`, `confetti` (s, + `confAt` [x, z]),
//         `stop` (s: everything frozen from then), `key` [x, y, z, r, g, b], `clear` [[x, z, r]], `noguests`.
import { mapKit } from './mapkit.js';

export const RING = {
  Y: 0.6, H: 2.2, AP: 0.4, ROPES: [0.36, 0.7, 1.04], POST: 1.15,
  STEPS: [-2.6, 1.3],           // the steps' top at the apron's edge (x) and their centre (z), going down to -x
  FRONT: [[-1.7, 3.45], [-0.9, 3.5], [-0.1, 3.45], [0.7, 3.5], [-1.3, 4.25], [-0.5, 4.3], [0.3, 4.25]],
  HOOK_TUK: [1.25, 11.6],
  BELL: [3.2, 3.3],             // the bell's table (the timekeeper's), front right
  TUKS: [[-5.7, 3.9, 35, 0], [5.9, -3.7, -125, 1], [-6.2, -3.4, 75, 2]],   // x, z, yaw (deg), colour
};

export function buildRingMaps(K) {
  const k = mapKit(K);
  const { THREE, mat, tex, px, noise, box, TAU, PI, beat, hash, cyl, cone, ico, sph, at, rot, flat, lights, pt, fall, facade } = k;
  const M = (c, o = {}) => mat({ color: c, ...o }), glow = (c, u = 1) => mat({ color: c, unlit: u });
  const cleared = (P, x, z) => (P.clear || []).some(([cx, cz, r]) => (x - cx) ** 2 + (z - cz) ** 2 < r * r);
  const shotT = (t, P) => P.t0 != null ? t - P.t0 : 0;
  const sm = u => { u = Math.max(0, Math.min(1, u)); return u * u * (3 - 2 * u); };
  const R = RING, Y = R.Y, H = R.H, E = R.H + R.AP;

  // ---------- textures ----------
  const asphaltT = tex(32, 32, (x, r) => { px(x, '#3c3e44', 0, 0, 32, 32); noise(x, r, 32, 32, ['#383a40', '#42444a', '#34363c', '#46484e'], 160); }, 4601);
  const bayT = tex(32, 32, (x, r) => { px(x, '#3c3e44', 0, 0, 32, 32); noise(x, r, 32, 32, ['#383a40', '#42444a', '#34363c'], 120); px(x, '#a89a52', 0, 0, 2, 32); }, 4602);
  const canvasT = tex(64, 64, (x, r) => {
    px(x, '#c4ccd8', 0, 0, 64, 64); noise(x, r, 64, 64, ['#c0c8d4', '#c8d0dc', '#bcc4d0'], 300);
    x.strokeStyle = '#2a3a8a'; x.lineWidth = 2; x.strokeRect(3, 3, 58, 58);
    x.fillStyle = '#e04a7a'; x.beginPath(); x.arc(32, 32, 7, 0, TAU); x.fill();
    x.fillStyle = '#f8f4f0'; x.beginPath(); x.arc(32, 33.5, 3, 0, TAU); x.fill();
    for (const [a, b] of [[28, 29], [30.5, 27], [33.5, 27], [36, 29]]) { x.beginPath(); x.arc(a, b, 1.3, 0, TAU); x.fill(); }
  }, 4603);
  const skirtT = tex(32, 16, (x, r) => { px(x, '#1e2a6a', 0, 0, 32, 16); noise(x, r, 32, 16, ['#1c2864', '#222e70'], 40); px(x, '#c82a3a', 0, 5, 32, 2); px(x, '#f0f0f0', 0, 8, 32, 1); px(x, '#c82a3a', 0, 10, 32, 2); }, 4604);
  const blockT = facade('#b0aca2', 4605, 0.45, '#2a3040');
  const blockT2 = facade('#bab2a4', 4606, 0.4, '#2c2e3a');
  const towerT = tex(16, 32, (x, r) => { px(x, '#1e2440', 0, 0, 16, 32); for (let j = 1; j < 32; j += 2) for (let i = 1; i < 16; i += 2) if (r() < 0.5) px(x, r() < 0.7 ? '#f0c878' : '#9ad0f0', i, j, 1, 1); }, 4607);
  const shutterT = tex(16, 16, x => { px(x, '#5a5e64', 0, 0, 16, 16); for (let j = 0; j < 16; j += 2) px(x, '#44484e', 0, j, 16, 1); }, 4608);
  const duskT = tex(4, 64, x => { const g = x.createLinearGradient(0, 0, 0, 64); g.addColorStop(0, '#1c1e4c'); g.addColorStop(0.28, '#47387a'); g.addColorStop(0.43, '#b25c8a'); g.addColorStop(0.49, '#f08a62'); g.addColorStop(0.5, '#f8a066'); g.addColorStop(1, '#f8a066'); x.fillStyle = g; x.fillRect(0, 0, 4, 64); });

  function muaythai() {
    const G = new THREE.Group();
    G.add(new THREE.Mesh(new THREE.SphereGeometry(185, 16, 12), mat({ map: duskT, unlit: 1, nofog: 1, side: THREE.BackSide })));
    // the car park: asphalt, bays marked along the blocks
    G.add(flat(60, 60, mat({ map: asphaltT, rep: [30, 30] }), 0, 0, -5));
    G.add(flat(44, 5, mat({ map: bayT, rep: [17.6, 1] }), 0, 0.004, -26.6));
    for (const sx of [-1, 1]) { const f = flat(5, 22, mat({ map: bayT, rep: [1, 8.8] }), sx * 14.6, 0.004, -4); f.rotation.z = PI / 2; G.add(f); }

    // ---------- the housing blocks (the clip's old concrete flats) ----------
    const balM = M(0x9a968e, { unlit: 0.12 }), railM = M(0x6a6a66, { unlit: 0.1 }), acM = M(0xd8d8d2, { unlit: 0.15 });
    const cloth = [0xe05a7a, 0xf0d040, 0x5aa0e0, 0xf0f0ea, 0x70c070, 0xe08a3a].map(c => M(c, { unlit: 0.3, side: THREE.DoubleSide }));
    function block(w, h, cx, cz, ry, tx, seed) {
      const g = new THREE.Group(); g.position.set(cx, 0, cz); g.rotation.y = ry; G.add(g);
      const face = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat({ map: tx, rep: [w / 3, h / 3.1], unlit: 0.5 })); face.position.set(0, h / 2, 0); g.add(face);
      g.add(at(box(w, 3.0, 0.1, mat({ map: shutterT, rep: [w / 1.5, 1.5], unlit: 0.2 })), 0, 1.5, 0.06));
      for (let f = 1; f < Math.floor(h / 3.1); f++) {
        const y = f * 3.1;
        g.add(at(box(w, 0.12, 0.85, balM), 0, y, 0.42)); g.add(at(box(w, 0.75, 0.06, railM), 0, y + 0.42, 0.85));
        for (let i = 0; i < w / 3.4; i++) {
          const x = -w / 2 + 1.7 + i * 3.4, hh = hash(seed, f, i);
          if (hh < 0.3) g.add(at(box(0.6, 0.45, 0.35, acM), x + 0.6, y + 1.2, 0.95));
          if (hh > 0.62) { const c = new THREE.Mesh(new THREE.PlaneGeometry(0.5 + 0.4 * hash(seed, i, f), 0.7), cloth[Math.floor(hash(f, i, seed) * 6)]); c.position.set(x - 0.4, y + 0.85, 0.9); g.add(c); }
        }
      }
      return g;
    }
    block(56, 12.4, 0, -31, 0, blockT, 1);
    block(36, 12.4, -20, -5, PI / 2, blockT2, 2);
    block(36, 12.4, 20, -5, -PI / 2, blockT2, 3);
    // the city's towers beyond the blocks, lit for the evening
    const towM = mat({ map: towerT, rep: [2, 4], unlit: 0.9, nofog: 1 });
    for (let i = 0; i < 16; i++) {
      const x = -70 + i * 9.3 + 3 * Math.sin(i * 2.3), z = -48 - 26 * hash(i, 7), w = 6 + 5 * hash(i, 3), h = 30 + 44 * hash(i, 5);
      G.add(at(box(w, h, w * 0.8, towM), x, h / 2, z));
      if (i % 5 === 2) G.add(at(cone(w * 0.3, 8, 4, towM), x, h + 4, z));
    }
    // a food stall's lit awning by the back block, a vending machine glowing by the right one
    G.add(at(box(2.6, 0.08, 1.4, glow(0xf06a3a, 0.8)), -9.5, 2.4, -27.4)); G.add(at(box(2.4, 0.9, 0.9, M(0xb0b4b8)), -9.5, 0.45, -27.6));
    G.add(at(box(0.9, 1.8, 0.7, glow(0x6ad0f0, 0.75)), 14.4, 0.9, -17.6));

    // ---------- the ring ----------
    const skirtM = mat({ map: skirtT, rep: [5, 1], unlit: 0.15 });
    G.add(at(box(2 * E, Y - 0.02, 2 * E, skirtM), 0, (Y - 0.02) / 2, 0));
    G.add(flat(2 * E, 2 * E, mat({ map: canvasT, unlit: 0.12 }), 0, Y, 0));
    const postM = M(0xc8ccd4, { unlit: 0.2 }), padM = { r: M(0xd42a36, { unlit: 0.3 }), b: M(0x2a4ad4, { unlit: 0.3 }), w: M(0xf2f2f0, { unlit: 0.3 }) };
    for (const [x, z, c] of [[-H, -H, 'w'], [H, -H, 'r'], [-H, H, 'b'], [H, H, 'w']]) {
      G.add(at(cyl(0.05, 0.06, R.POST, 6, postM), x * 1.03, Y + R.POST / 2, z * 1.03));
      const pad = at(box(0.17, R.POST * 0.86, 0.17, padM[c]), x * 0.985, Y + R.POST * 0.5, z * 0.985); pad.rotation.y = PI / 4; G.add(pad);
    }
    const ropeM = [M(0x2a44c8, { unlit: 0.35 }), M(0xf4f4f2, { unlit: 0.35 }), M(0xd8283a, { unlit: 0.35 })];   // bottom blue, white, top red
    const ropes = { n: [], s: [], e: [], w: [] };
    R.ROPES.forEach((ry, i) => {
      const y = Y + ry;
      for (const [side, x, z, rotY] of [['n', 0, -H, 0], ['s', 0, H, 0], ['w', -H, 0, PI / 2], ['e', H, 0, PI / 2]]) {
        const r = at(box(2 * H, 0.04, 0.04, ropeM[i]), x, y, z); r.rotation.y = rotY; G.add(r); ropes[side].push(r);
      }
    });
    // the steps up to the apron, on the left side
    const stepM = M(0x9a7a56, { unlit: 0.15 }), noseM = M(0xe8d0a0, { unlit: 0.3 });   // pale timber, a light nosing per tread (dark navy steps read as one slab)
    for (let i = 0; i < 3; i++) {
      const h = Y * (3 - i) / 4, cx = R.STEPS[0] - 0.135 - i * 0.27;
      G.add(at(box(0.27, h, 0.85, stepM), cx, h / 2, R.STEPS[1])); G.add(at(box(0.06, 0.025, 0.87, noseM), cx - 0.11, h + 0.005, R.STEPS[1]));
    }
    // floodlight poles at the ring's corners, their lamps aimed at the canvas
    // (`poleHide` [i]: pole i and its lamp off for a shot: a pole straight behind a head grew out of it, five times in a review)
    const poleM = M(0x4a4e56), lampM = glow(0xfff4dc, 1), poles = [];
    for (const [x, z] of [[-4.4, -4.4], [4.4, -4.4], [-4.4, 4.4], [4.4, 4.4]]) {
      const pg = new THREE.Group(); G.add(pg); poles.push(pg);
      pg.add(at(cyl(0.06, 0.08, 5.4, 6, poleM), x, 2.7, z));
      const head = at(box(0.6, 0.35, 0.25, lampM), x * 0.94, 5.35, z * 0.94); head.rotation.y = Math.atan2(-x, -z); pg.add(head);
    }
    // string lights high over the car park
    const bulbs = [0xff5a8a, 0xffd25a, 0x6ad8ff, 0x9a7aff, 0x7ae08a].map(c => glow(c, 1));
    const strings = [[[-12, 6.4, -29], [-4.4, 5.6, -4.4]], [[12, 6.4, -29], [4.4, 5.6, -4.4]], [[-19, 6.2, 4], [-4.4, 5.6, 4.4]], [[19, 6.2, 4], [4.4, 5.6, 4.4]], [[-4.4, 5.6, -4.4], [4.4, 5.6, -4.4]]];
    strings.forEach(([a, b], si) => {
      for (let i = 1; i < 16; i++) { const u = i / 16, sag = 0.7 * Math.sin(u * PI); G.add(at(sph(0.07, 4, 3, bulbs[(i + si) % 5]), a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u - sag, a[2] + (b[2] - a[2]) * u)); }
    });

    // ---------- the bell: a brass bell hung in a little wooden frame on the timekeeper's table ----------
    // (a truncated cone on a post read as a lamp shade: the bell's own silhouette, a lathe of its profile, reads)
    const [bx, bz] = R.BELL, brass = mat({ color: 0xd8a83a, unlit: 0.35, side: THREE.DoubleSide }), wood = M(0x5a3e28), bellSet = new THREE.Group(); G.add(bellSet);
    bellSet.add(at(box(0.7, 0.05, 0.5, M(0x6a4a30)), bx, 0.72, bz));
    for (const [dx, dz] of [[-0.3, -0.2], [0.3, -0.2], [-0.3, 0.2], [0.3, 0.2]]) bellSet.add(at(box(0.05, 0.7, 0.05, M(0x5a3e28)), bx + dx, 0.35, bz + dz));
    // one post on the bell's +z side and an arm over it (with an upright either side, from the east the near one crossed the bell)
    bellSet.add(at(box(0.045, 0.64, 0.045, wood), bx, 1.065, bz + 0.3)); bellSet.add(at(box(0.045, 0.045, 0.36, wood), bx, 1.367, bz + 0.14));
    const BELL_PROFILE = [[0.001, 0.30], [0.06, 0.298], [0.092, 0.282], [0.108, 0.25], [0.112, 0.2], [0.122, 0.14], [0.142, 0.085], [0.172, 0.04], [0.2, 0.012], [0.214, 0.0], [0.2, -0.006]];
    const bellG = at(new THREE.Group(), bx, 1.345, bz); bellSet.add(bellG);
    const bell = new THREE.Mesh(new THREE.LatheGeometry(BELL_PROFILE.map(([r, y]) => new THREE.Vector2(r, y - 0.34)), 12), brass); bellG.add(bell);
    bellG.add(at(new THREE.Mesh(new THREE.TorusGeometry(0.022, 0.009, 4, 8), brass), 0, -0.02, 0));
    bellG.add(at(sph(0.035, 6, 4, M(0x3a3026)), 0, -0.315, 0));
    // the timekeeper (built with the crowd below): a box pet on a step behind the table, the mallet in his left paw; only in a shot that rings the bell (or `keeper`)
    const KEEPER = [bx - 0.23, 0.208, bz - 0.62];
    bellSet.add(at(box(0.46, KEEPER[1], 0.42, wood), KEEPER[0], KEEPER[1] / 2, KEEPER[2]));
    // the mallet's swing (rotation.x of the arm): up at -3.0, down onto the bell's shoulder at -2.262 on `bell`, held, then back down
    const malletX = bs => {
      if (bs < -0.6 || bs > 1.4) return 0;
      if (bs < -0.16) return -3.0 * sm((bs + 0.6) / 0.44);
      if (bs < 0) return -3.0 + 0.738 * sm((bs + 0.16) / 0.16);
      if (bs < 0.3) return -2.262;
      if (bs < 0.45) return -2.262 - 0.2 * sm((bs - 0.3) / 0.15);
      return -2.462 * (1 - sm((bs - 0.45) / 0.95));
    };
    const ringM = mat({ color: 0xffe08a, unlit: 1, side: THREE.DoubleSide });
    // `bonk` [x, y, z, s]: an impact burst where two heads meet, facing `bonkYaw`: a ring and six stars flying out for 0.6 s
    const starGeo = (() => { const sh = new THREE.Shape(); for (let i = 0; i < 10; i++) { const a = PI / 2 + i * PI / 5, r = i % 2 ? 0.42 : 1; if (i) sh.lineTo(Math.cos(a) * r, Math.sin(a) * r); else sh.moveTo(Math.cos(a) * r, Math.sin(a) * r); } sh.closePath(); return new THREE.ShapeGeometry(sh); })();
    const bonkG = new THREE.Group(); G.add(bonkG);
    const bonkRing = new THREE.Mesh(new THREE.RingGeometry(0.8, 1, 20), mat({ color: 0xfff2b0, unlit: 1, side: THREE.DoubleSide })); bonkG.add(bonkRing);
    const bonkStars = Array.from({ length: 6 }, () => { const m = new THREE.Mesh(starGeo, mat({ color: 0xffd23a, unlit: 1, side: THREE.DoubleSide })); bonkG.add(m); return m; });
    const rings = Array.from({ length: 4 }, () => { const r = new THREE.Mesh(new THREE.RingGeometry(0.85, 1, 20), ringM); r.visible = false; G.add(r); return r; });

    // ---------- the neon tuk-tuks ----------
    const BODY = [0xe0306a, 0x2ab0d8, 0xf0b020], NEON = [0xff4fd8, 0x4ff0ff, 0xffe04f];
    function tuktuk(c) {
      const g = new THREE.Group(), body = M(BODY[c], { unlit: 0.2 }), neon = glow(NEON[c], 1), dark = M(0x1a1a20), tyre = M(0x141418);
      g.add(at(box(1.0, 0.18, 2.3, M(0x2a2a30)), 0, 0.32, 0.1));
      g.add(at(box(0.9, 0.62, 0.75, body), 0, 0.72, 0.95));
      g.add(at(box(0.8, 0.3, 0.06, M(0xa8d8f0, { unlit: 0.4 })), 0, 1.14, 1.3));
      g.add(at(box(1.16, 0.35, 0.95, body), 0, 0.62, -0.55)); g.add(at(box(1.0, 0.12, 0.7, M(0xc83a3a)), 0, 0.86, -0.55));
      for (const [x, z] of [[-0.52, 0.4], [0.52, 0.4], [-0.52, -1.02], [0.52, -1.02]]) g.add(at(box(0.04, 1.2, 0.04, dark), x, 1.35, z));
      g.add(at(box(1.18, 0.07, 1.6, body), 0, 1.95, -0.3));
      g.add(at(box(1.2, 0.12, 1.62, M(0xf4f4f0, { unlit: 0.3 })), 0, 1.86, -0.3));
      g.add(rot(at(cyl(0.22, 0.22, 0.12, 8, tyre), 0, 0.22, 1.25), 0, 0, PI / 2));
      for (const x of [-0.55, 0.55]) g.add(rot(at(cyl(0.22, 0.22, 0.14, 8, tyre), x, 0.22, -0.7), 0, 0, PI / 2));
      g.add(at(box(0.16, 0.12, 0.05, glow(0xfff8d8)), 0, 0.88, 1.34));
      g.add(flat(1.5, 2.9, mat({ color: NEON[c], unlit: 1, see: 0.45 }), 0, 0.012, 0.1));
      for (const x of [-0.6, 0.6]) g.add(at(box(0.03, 0.03, 2.2, neon), x, 0.42, 0.1));
      g.add(at(box(1.2, 0.03, 0.03, neon), 0, 1.99, 0.5));
      return g;
    }
    for (const [x, z, yaw, c] of R.TUKS) { const t = tuktuk(c); t.position.set(x, 0, z); t.rotation.y = yaw * PI / 180; G.add(t); }
    const hookTuk = tuktuk(0); hookTuk.position.set(R.HOOK_TUK[0], 0, R.HOOK_TUK[1]); hookTuk.rotation.y = PI; G.add(hookTuk);

    // ---------- box pets: the crowd round the ring and the crew in black ----------
    const FURS = [0xd8b080, 0x8a8a92, 0xf2eee6, 0x5a4030, 0xe8a058, 0x3a3a40, 0xc8c0b0, 0xa87a54, 0xe0c8a0, 0x707078];
    const TOPS = [0xe05a5a, 0x4a8ae0, 0xf0d04a, 0x5ac08a, 0xf08a3a, 0xb06ad8, 0xf0f0ea, 0x3ab0b0, 0xe07ab0, 0x8ab04a];
    function pet(i, black) {
      const fur = M(FURS[i % 10]), top = M(black ? 0x34343e : TOPS[(i * 3) % 10], { unlit: black ? 0.12 : 0.15 }), kind = i % 3;
      const g = new THREE.Group(), body = new THREE.Group(); g.add(body);
      const legs = [-1, 1].map(sx => { const l = at(new THREE.Group(), sx * 0.1, 0.3, 0); l.add(at(box(0.13, 0.3, 0.13, M(black ? 0x22222a : 0x2a2c34)), 0, -0.15, 0)); body.add(l); return l; });
      body.add(at(box(0.4, 0.38, 0.28, top), 0, 0.5, 0));
      const arms = [-1, 1].map(sx => { const a = at(new THREE.Group(), sx * 0.23, 0.64, 0); a.add(at(box(0.09, 0.28, 0.09, top), 0, -0.12, 0)); a.add(at(box(0.08, 0.08, 0.08, fur), 0, -0.28, 0)); body.add(a); return a; });
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
      if (black && kind !== 2) { head.add(at(box(0.42, 0.1, 0.42, M(0x1a1a20)), 0, 0.2, 0)); head.add(at(box(0.3, 0.03, 0.2, M(0x1a1a20)), 0, 0.16, 0.28)); }
      const mouth = at(box(0.1, 0.07, 0.02, M(0x5a1a1a)), 0, -0.14, 0.25); mouth.visible = false; head.add(mouth);
      return { g, body, head, arms, legs, mouth, i };
    }
    // the crowd's spots: two rows on the left, the right and the back, a few at the front corners, facing the ring
    const CROWD = [];
    for (const [side, n] of [['w', 7], ['e', 7], ['n', 6]]) for (let r = 0; r < 2; r++) for (let j = 0; j < n - r; j++) {
      const u = ((j + 0.5 + r * 0.5) / n - 0.5) * 4.6, d = E + 0.75 + r * 0.8;
      if (side === 'w') { if (u > 0.6 && u < 2.1) continue; CROWD.push([-d, u]); }   // the steps stand there
      else if (side === 'e') CROWD.push([d, u]);
      else CROWD.push([u, -d]);
    }
    for (const [x, z] of [[-3.7, 3.6], [3.9, 3.1], [-4.5, 2.95]]) CROWD.push([x, z]);
    const crowd = CROWD.map((p, i) => { const q = pet(i, false); q.home = p; G.add(q.g); return q; });
    const front = R.FRONT.map((p, i) => { const q = pet(i + 40, false); q.home = p; G.add(q.g); return q; });
    const crew = Array.from({ length: 8 }, (_, i) => { const q = pet(i + 3, true); G.add(q.g); return q; });
    // the timekeeper on his step behind the bell, facing +z, the mallet in his left paw (the arm on +x, in the bell's plane)
    const keeper = pet(57, false); keeper.g.position.set(KEEPER[0], KEEPER[1], KEEPER[2]); bellSet.add(keeper.g);
    const mallet = new THREE.Group(); keeper.arms[1].add(mallet);
    mallet.add(at(box(0.026, 0.32, 0.026, M(0x8a5a30)), 0, -0.44, 0));
    const malletHead = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.13, 8), M(0x2e2a2a)); malletHead.rotation.x = PI / 2; malletHead.position.set(0, -0.6, 0); mallet.add(malletHead);

    const heartM = M(0xff4f9a, { unlit: 0.8 }), hearts = [];
    for (let i = 0; i < 12; i++) { const h = new THREE.Group(); h.add(at(ico(0.1, 0, heartM), -0.075, 0, 0)); h.add(at(ico(0.1, 0, heartM), 0.075, 0, 0)); h.add(rot(at(cone(0.125, 0.18, 4, heartM), 0, -0.11, 0), PI, 0, 0)); h.visible = false; G.add(h); hearts.push(h); }
    const confG = new THREE.Group(); G.add(confG);
    const confAnim = fall(confG, 80, mat({ color: 0xf2c43a, unlit: 0.7, side: THREE.DoubleSide }), new THREE.PlaneGeometry(0.07, 0.05), { w: 5, top: 4.5, speed: 1.1, spin: 4, drift: 0.3, seed: 46 });
    const confG2 = new THREE.Group(); G.add(confG2);
    const confAnim2 = fall(confG2, 60, mat({ color: 0xe0306a, unlit: 0.7, side: THREE.DoubleSide }), new THREE.PlaneGeometry(0.07, 0.05), { w: 5, top: 4.5, speed: 1.0, spin: 5, drift: 0.3, seed: 47 });

    function pose(q, mode, tf, ph, P, x, z, yaw) {
      q.body.position.set(0, 0, 0); q.body.rotation.set(0, 0, 0); q.head.rotation.set(0, 0, 0); q.mouth.visible = false;
      q.arms.forEach(a => a.rotation.set(0, 0, 0)); q.legs.forEach(l => l.rotation.set(0, 0, 0));
      if (P.stare && mode !== 'fall') { const a = Math.atan2(P.stare[0] - x, P.stare[1] - z) - yaw; q.head.rotation.y = Math.max(-1.1, Math.min(1.1, Math.atan2(Math.sin(a), Math.cos(a)))); }
      if (mode === 'watch') { q.arms.forEach((a, j) => { a.rotation.z = (j ? 1 : -1) * 0.12; }); q.body.rotation.z = 0.04 * Math.sin(tf * 1.4 + q.i); }
      else if (mode === 'cheer') { q.arms.forEach((a, j) => { a.rotation.z = (j ? 1 : -1) * 2.45; }); q.mouth.visible = true; q.body.position.y = 0.05 * Math.abs(Math.sin(ph * PI)); }
      else if (mode === 'gasp') { q.arms.forEach((a, j) => { a.rotation.x = -2.45; a.rotation.z = (j ? 1 : -1) * 0.12; }); q.mouth.visible = true; q.body.rotation.x = -0.12; }
      else if (mode === 'stare') { q.mouth.visible = true; q.arms.forEach((a, j) => { a.rotation.z = (j ? 1 : -1) * 0.1; }); }
      else if (mode === 'wai') { const wa = P.waiArms || [-1.75, 0.5]; q.arms.forEach((a, j) => { a.rotation.x = wa[0]; a.rotation.z = (j ? -1 : 1) * wa[1]; });   // waiArms [x, z]: [-2.35, 0.6] raises the joined paws to the chin, praying hands from the front (pointed at the lens they foreshortened to two dots)
      q.body.rotation.x = P.waiBow ? P.waiBow[0] : 0.5; q.head.rotation.x = P.waiBow ? P.waiBow[1] : 0.3; }   // waiBow [body, head]: a small bow keeps the faces and the joined paws to a lens in front (a deep one showed only the crowns)
      else if (mode === 'dance') { const up = Math.abs(Math.sin(ph * PI)), side = Math.sin(ph * PI); q.body.rotation.z = 0.2 * side; q.body.position.y = 0.09 * up; q.arms.forEach((a, j) => { a.rotation.x = -1.9 - 0.9 * up; a.rotation.z = (j ? 1 : -1) * (0.35 + 0.25 * up) + 0.25 * side; }); q.legs.forEach((l, j) => { l.rotation.x = 0.35 * Math.sin(ph * PI + j * PI); }); }   // paws never below the shoulders (caught down, the crew read as standing), a hop on every beat
      else if (mode === 'fall') { q.body.rotation.x = -PI / 2 + 0.06; q.body.position.set(0, 0.16, -0.3); q.arms.forEach((a, j) => { a.rotation.z = (j ? 1 : -1) * (2.0 + 0.3 * Math.sin(tf * 9 + q.i)); }); q.legs.forEach((l, j) => { l.rotation.x = -0.6 + 0.3 * Math.sin(tf * 8 + j * 2); }); q.mouth.visible = true; }
    }

    return {
      group: G, sky: null, shadowCol: 0x24242e,
      light() { lights(0xa898b8, 0xffd0a0, [0.4, -0.6, -0.7], 0x6a5a7a, [30, 140], 9); },
      anim(t, P = {}) {
        const s = shotT(t, P), tf = P.stop != null && s >= P.stop ? t - (s - P.stop) : t, bt = beat(tf);
        lights(0xa898b8, 0xffd0a0, [0.4, -0.6, -0.7], 0x6a5a7a, [30, 140], 9);
        pt(0, -3.2, 4.6, -3.2, 1.25, 1.15, 1.0); pt(1, 3.2, 4.6, -3.2, 1.25, 1.15, 1.0); pt(2, 0, 4.4, 3.6, 1.3, 1.2, 1.05); pt(3, 0, 3.2, 8.5, 1.0, 0.8, 0.95);
        if (P.key) pt(3, P.key[0], P.key[1], P.key[2], P.key[3], P.key[4], P.key[5]);
        hookTuk.visible = !!P.hookTuk; bellSet.visible = !P.noBell;
        poles.forEach((p, i) => { p.visible = !(P.poleHide || []).includes(i); });
        const hide = new Set(P.ropeHide || []);
        for (const [side, list] of Object.entries(ropes)) list.forEach(r => { r.visible = !hide.has(side) && P.ropes !== false; });
        // the bell: the timekeeper's mallet comes down on it at `bell`, it shakes and rings out
        const bs = P.bell != null ? s - P.bell : -9;
        bellG.rotation.x = bs >= 0 && bs < 1.2 ? 0.12 * Math.sin(bs * 40) * Math.exp(-bs * 3) : 0;   // struck from -z, it shakes in the y-z plane
        keeper.g.visible = P.bell != null || !!P.keeper;
        if (keeper.g.visible) { pose(keeper, 'watch', tf, bt, P, KEEPER[0], KEEPER[2], 0); keeper.arms[1].rotation.set(malletX(bs), 0, 0); }
        rings.forEach((r, i) => {
          const e = bs - i * 0.18; r.visible = bs >= 0 && e >= 0 && e < 0.9; if (!r.visible) return;
          r.position.set(bx, 1.155, bz); r.rotation.set(0, (P.bellYaw ?? 0) * PI / 180, 0); r.scale.setScalar(0.12 + e * 0.75);
        });
        // the bonk's burst
        const kb = P.bonk ? s - P.bonk[3] : -9; bonkG.visible = kb >= 0 && kb < 0.6;
        if (bonkG.visible) {
          bonkG.position.set(P.bonk[0], P.bonk[1], P.bonk[2]); bonkG.rotation.set(0, (P.bonkYaw ?? 0) * PI / 180, 0);
          const e = kb / 0.6; bonkRing.scale.setScalar(0.12 + 0.55 * Math.sqrt(e)); bonkRing.visible = e < 0.75;
          bonkStars.forEach((m, i) => { const a = i * TAU / 6 + 0.3, r = 0.16 + 0.5 * Math.sqrt(e); m.position.set(Math.cos(a) * r, Math.sin(a) * r, 0.02); m.scale.setScalar(0.11 * (1 - 0.5 * e)); m.rotation.z = e * 2 + i; });
        }
        // the crowd
        const cm = P.cmode || [], fq = P.fall;
        [...crowd, ...front].forEach((q, i) => {
          const [x, z] = q.home; let mode = cm[i] ?? P.ringside ?? 'watch';
          if (i >= crowd.length && !P.front) { q.g.visible = false; return; }
          if (fq && s >= fq[3] && (x - fq[0]) ** 2 + (z - fq[1]) ** 2 < fq[2] ** 2) mode = 'fall';
          q.g.visible = !!mode && !P.noguests && !cleared(P, x, z); if (!q.g.visible) return;
          const yaw = Math.atan2(-x, -z);
          q.g.position.set(x, 0, z); q.g.rotation.y = yaw;
          pose(q, mode, tf, bt + i * 0.17, P, x, z, yaw);
        });
        // the crew in black, in two rows of four, moving as one
        const [ccx, ccz, cyaw = 0] = P.crewAt || [0, 5.4, 0], cmd = P.crew || false, cy = cyaw * PI / 180;
        crew.forEach((q, i) => {
          const gx = P.crewGap ?? 0.95, one = P.crewRows === 1, r = one ? 0 : Math.floor(i / 4), j = one ? i : i % 4, lx = one ? (j - 3.5) * gx : (j - 1.5) * gx + (r ? gx / 2 : 0), lz = -r * 0.9;   // crewRows 1: one line of eight
          const x = ccx + lx * Math.cos(cy) + lz * Math.sin(cy), z = ccz - lx * Math.sin(cy) + lz * Math.cos(cy);
          q.g.visible = !!cmd && !cleared(P, x, z); if (!q.g.visible) return;
          q.g.position.set(x, 0, z); q.g.rotation.y = cy;
          pose(q, cmd, tf, bt, P, x, z, cy);
        });
        hearts.forEach((h, i) => {
          const q = (P.hearts || [])[Math.floor(i / 3)]; h.visible = false; if (!q) return;
          let e = s - q[3] - (i % 3) * 0.3; if (q[4] && e > 0) e %= 1.2;
          if (e < 0 || e > 1.4) return;
          h.visible = true; h.position.set(q[0] + ((i % 3) - 1) * 0.22 + 0.06 * Math.sin(e * 6 + i), q[1] + 0.55 * e, q[2]); h.scale.setScalar(Math.min(1, e * 5) * (1.15 - 0.25 * (e / 1.4)));
          h.rotation.y = (P.heartYaw ?? 0) * PI / 180;
        });
        const cf = P.confetti != null && s >= P.confetti; confG.visible = confG2.visible = cf;
        if (cf) { confAnim(tf); confAnim2(tf); const [qx, qz] = P.confAt || [0, 0]; confG.position.set(qx, Y, qz); confG2.position.set(qx, Y, qz); }
      },
    };
  }

  return { muaythai: muaythai() };
}
