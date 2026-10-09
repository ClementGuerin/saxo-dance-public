// maps38.js: the "Espresso" map (2026-10-09 2nd, Sabrina Carpenter, 2024; the clip: a 1960s Italian lake in warm film
// colours: a varnished wooden speedboat, a beach club of green-and-white striped umbrellas and orange loungers, cat-eye
// sunglasses and a pink silk headscarf, a dance on the shore at sunset, a white police car with a red light on its roof
// and an arrest). Same contract as the other map files, pure in t:
//   piazza  a little lakeside piazza at 3 a.m. (y = 0), the lake at -z behind a stone balustrade (PIAZZA.LAKE_Z, the
//           water WATER_Y below it, a moon and its path on the water, the far shore's hills and a village's lights, a
//           wooden jetty with a varnished speedboat), the house fronts at +z (FACADE_Z, facing -z: pastel stucco, green
//           shutters, every window dark until it wakes). In the middle an open-air espresso bar facing the houses
//           (KIOSK): a teal counter with an Espresso neon on its front and a marble top (COUNTER_Y), the barista's
//           duckboard behind it (DECK: stand him on it, BARISTA), a chrome lever machine on the counter (MACHINE), cups,
//           three stools in front, a striped awning on four poles. Kob's house in the middle of the fronts: her bedroom
//           window on the first floor (KOB_WIN, a real opening) right across from the bar, her room behind it (ROOM, its
//           floor ROOM_Y: the bed along the room's axis, head end at the back wall, BED_Y the mattress top, KOB_BED her
//           sitting-up mark; a nightstand with a lamp and a red phone), her green front door (KOB_DOOR); Sadi's blue door
//           in the next house (SADI_DOOR). Lamp posts on the balustrade, festoons over the lake, cafe tables, a Vespa.
//           The white 1960s police car drives in along CAR_Z from -x, nose to +x (its driver's door on the -z side).
//           The neighbours: box pets in striped pyjamas and nightcaps, on the piazza (SPOTS) and leaning out of the
//           windows as they light up.
// Flags read by anim(t, P) (s = seconds into the shot):
//   wake     how many house windows are lit (in WINS order: nearest the bar first), or [s0, gap, n0, n1]: from n0 lit,
//            one more every gap s from s0, up to n1. A lit first-floor window has a neighbour leaning out of it.
//   winPets  'yell' (a fist shaking at the bar) | 'stare' | 'dance' | false: the neighbours in the lit windows
//   kobLamp  true or s: Kob's bedside lamp on (her room lit, the window warm from outside)
//   kobDoor, sadiDoor  0-1 or [s0, s1, a, b]: the front doors swing in
//   pets     'yell' | 'stare' | 'dance' (paws up on the beat, a cup in one) | 'moves' (the song's up, down, left, right
//            on movesAt [s, s, s, s], then dancing) | 'cheer' | 'sip' | false (the piazza empty: 3 a.m.)
//   wired    true or n: the pets' eyes go wide and jitter (the espresso): all of them, or the first n
//   cups     true: the pets hold espresso cups
//   spots    [[x, z], ...]: the first pets stand there (the rest hidden), facing `stare` or spotsAt; mob [cx, cz, cols,
//            rows, dx, dz, yaw]; gather [cx, cz, r, a0, a1, yaw?] (London's)
//   police   { x, z, to: [x1, z1], at, dur, lin }: the car (nose to +x) rolling from (x, z) to `to` over [at, at + dur],
//            easing to a stop (lin: at a steady speed, for a driver riding on an actor's mx: the car is open-topped, her mark at CAR.DRIVER, `lift` CAR.SEAT_Y); siren (true or s): the roof light flashing red on the half beat, a red glow sweeping;
//            carDoor 0-1 or [s0, s1, a, b]: its driver's door (the -z side) swings open
//   lever    0-1 or [s0, s1, a, b]: the machine's two levers pulled down (pump: worked up and down like a game pad); steam true (a puff on every beat) or [s, ...]
//            (a big burst each); counterCups n (cups lined up on the counter, default 5)
//   stools   false hides the three stools (a lens in front of the counter)
//   hearts   [[x, y, z, s0, loop]] (London's), heartYaw; noguests; clear [[x, z, r]] (no pet there); key [x, y, z, r, g, b]
// Never name a flag like a shot field: `crowd`, `cam`, `still`, `focus` are taken.
import { mapKit } from './mapkit.js';

export const PIAZZA = {
  X: [-16, 16], LAKE_Z: -4.6, WATER_Y: -0.9, FACADE_Z: 5.0,
  KIOSK: { x0: -1.5, x1: 1.5, z0: -2.0, z1: -0.3 },
  COUNTER_Y: 0.84, COUNTER: { z0: -0.8, z1: -0.3 },
  DECK: 0.32, BARISTA: [0, -1.3],
  MACHINE: [-0.74, -0.56],
  STOOLS: [[-0.95, 0.12], [0.0, 0.12], [0.95, 0.12]], STOOL_Y: 0.56,
  KOB_WIN: { x0: -0.8, x1: 0.8, y0: 3.0, y1: 4.3 },
  ROOM_Y: 2.6, ROOM: { x0: -2.6, x1: 2.6, z1: 9.4 },
  BED: { x0: -0.55, x1: 0.55, z0: 7.35, z1: 9.3 }, BED_Y: 3.08, KOB_BED: [0, 8.75],
  KOB_HOUSE: [-3.0, 3.0], KOB_DOOR: [-2.0, 5.0], SADI_DOOR: [6.0, 5.0], DOOR_W: 1.1,
  CAR_Z: 2.45, CAR_STOP: [-4.4, 2.45], CAR: { L: 3.7, W: 1.62, ROOF: 1.36, CAB0: -1.15, CAB1: 0.75, SEAT_X: -0.05, SEAT_Y: 0.45, DRIVER: [-0.05, -0.38], WHEEL: [0.2, 0.82, -0.33], BEACON: [-0.62, 0.45], BEACON_Y: 1.32, BONNET: [1.3, 0.75] },
  LAMPS: [[-4.6, -4.25], [4.6, -4.25]],
  TABLES: [[-8.2, -1.2], [8.4, -1.4], [-7.0, -3.2], [7.2, -3.2]],   // off the action (a chair stood on the cop's mark)
  VESPA: [4.4, 3.6],
  JETTY_X: 6.0, RIVA: [7.7, -9.0],
  MOON: [-14, 24, -150],
};

export function buildPiazzaMaps(K) {
  const k = mapKit(K);
  const { THREE, mat, tex, px, noise, box, TAU, PI, beat, hash, cyl, cone, ico, at, rot, flat, lights, pt, stars, selfLit } = k;
  const M = (c, o = {}) => mat({ color: c, ...o }), glow = (c, u = 1) => mat({ color: c, unlit: u });
  const shotT = (t, P) => P.t0 != null ? t - P.t0 : 0;
  const cl = x => Math.max(0, Math.min(1, x)), sm = x => { x = cl(x); return x * x * (3 - 2 * x); };
  const cleared = (P, x, z) => (P.clear || []).some(([cx, cz, r]) => (x - cx) ** 2 + (z - cz) ** 2 < r * r);
  const ramp = (v, s) => Array.isArray(v) ? v[2] + (v[3] - v[2]) * sm((s - v[0]) / Math.max(0.01, v[1] - v[0])) : (v === true ? 1 : (v || 0));
  const from = (v, s) => v === true || (typeof v === 'number' && s >= v);
  const { X, LAKE_Z, WATER_Y, FACADE_Z, KIOSK, COUNTER_Y, COUNTER, DECK, MACHINE, STOOLS, STOOL_Y, KOB_WIN, ROOM_Y, ROOM, BED, KOB_HOUSE, KOB_DOOR, SADI_DOOR, DOOR_W, CAR_Z, CAR, LAMPS, TABLES, VESPA, JETTY_X, RIVA, MOON } = PIAZZA;
  const W = X[1] - X[0];

  // ---------- the neighbours: box pets in striped pyjamas and nightcaps, a little espresso cup in the right paw ----------
  const FURS = [0xd8a868, 0xe8d8c0, 0xb08a60, 0xf2eee6, 0x9a9aa4, 0xe8c090, 0xc8b8a8, 0x8a7a6c];
  const PJ = [[0x8ab4e8, 0xf4f4f8], [0xf2a0c0, 0xfaf0f4], [0x8ad8b8, 0xf2faf6], [0xf2d070, 0xfaf6e8], [0xb8a0e8, 0xf4f0fa], [0xf0a070, 0xfaf2ea]];
  const css = c => '#' + c.toString(16).padStart(6, '0');   // canvas colours are CSS strings (a number left the stripes black)
  const pjTex = PJ.map(([a, b], i) => tex(8, 8, x => { px(x, css(b), 0, 0, 8, 8); for (let y = 0; y < 8; y += 4) px(x, css(a), 0, y, 8, 2); }, 3800 + i));
  const cupM = mat({ color: 0xfafaf6, unlit: 0.25, side: THREE.DoubleSide }), coffeeM = M(0x3a2414);
  function cupMesh(s = 1) {   // an open-topped cup: a closed top z-fought the coffee (a white wedge cut out of it)
    const g = new THREE.Group();
    g.add(at(new THREE.Mesh(new THREE.CylinderGeometry(0.05 * s, 0.038 * s, 0.06 * s, 8, 1, true), cupM), 0, 0.03 * s, 0));
    g.add(at(cyl(0.046 * s, 0.046 * s, 0.004 * s, 8, coffeeM), 0, 0.05 * s, 0));
    g.add(at(cyl(0.075 * s, 0.075 * s, 0.01 * s, 10, cupM), 0, 0.0, 0));
    const h = at(new THREE.Mesh(new THREE.TorusGeometry(0.02 * s, 0.007 * s, 4, 6, PI), cupM), 0.055 * s, 0.035 * s, 0); h.rotation.z = -PI / 2; g.add(h);
    return g;
  }
  function pet(i, bright = 0) {   // bright: a little self-lit (a neighbour in a window, backlit by its lit pane, read as a silhouette)
    const g = new THREE.Group(), F = M(FURS[i % FURS.length], { unlit: bright }), kind = i % 3, pj = mat({ map: pjTex[i % PJ.length], unlit: bright });
    const body = new THREE.Group(); g.add(body);
    const legs = new THREE.Group(); body.add(legs);
    legs.add(at(box(0.4, 0.22, 0.28, pj), 0, 0.16, 0));
    for (const sx of [-1, 1]) legs.add(at(box(0.13, 0.08, 0.15, M(0x8a6a5a)), sx * 0.1, 0.04, 0.02));
    body.add(at(box(0.4, 0.34, 0.28, pj), 0, 0.42, 0));
    body.add(at(box(0.05, 0.05, 0.02, M(0xffffff)), 0, 0.5, 0.145)); body.add(at(box(0.05, 0.05, 0.02, M(0xffffff)), 0, 0.4, 0.145));
    const arms = [-1, 1].map(sx => { const a = at(new THREE.Group(), sx * 0.23, 0.55, 0); a.add(at(box(0.09, 0.3, 0.09, pj), 0, -0.13, 0)); a.add(at(box(0.08, 0.08, 0.08, F), 0, -0.3, 0)); body.add(a); return a; });
    const cup = cupMesh(1.3); cup.position.set(0, -0.36, 0.02); arms[1].add(cup);
    const head = at(new THREE.Group(), 0, 0.82, 0); body.add(head);
    const skull = new THREE.Mesh(new THREE.IcosahedronGeometry(0.24, 1), F); skull.scale.set(1, 0.9, 0.92); head.add(skull);
    const snout = at(new THREE.Mesh(new THREE.IcosahedronGeometry(0.1, 1), M(0xf0e6d8)), 0, -0.07, 0.19); snout.scale.set(1.1, 0.8, 0.9); head.add(snout);
    head.add(at(new THREE.Mesh(new THREE.IcosahedronGeometry(0.035, 0), M(0x151515)), 0, -0.03, 0.28));
    const eyes = new THREE.Group(), wide = new THREE.Group(); head.add(eyes); head.add(wide);
    const pupils = [];
    for (const e of [-1, 1]) {
      eyes.add(at(new THREE.Mesh(new THREE.IcosahedronGeometry(0.038, 0), M(0x0e0e0e)), e * 0.1, 0.05, 0.19));
      eyes.add(at(new THREE.Mesh(new THREE.IcosahedronGeometry(0.012, 0), glow(0xffffff)), e * 0.1 + 0.012, 0.065, 0.225));
      const w = at(new THREE.Mesh(new THREE.SphereGeometry(0.085, 10, 8), glow(0xffffff, 0.85)), e * 0.1, 0.07, 0.17); w.scale.set(1, 1.1, 0.55); wide.add(w);
      const pu = at(new THREE.Mesh(new THREE.SphereGeometry(0.03, 8, 6), M(0x0a0a0a)), e * 0.1, 0.07, 0.218); pu.scale.set(1, 1, 0.5); wide.add(pu); pupils.push(pu);
      head.add(kind === 0 ? rot(at(cone(0.08, 0.2, 4, F), e * 0.15, 0.27, 0), 0, 0, -e * 0.25) : kind === 1 ? at(box(0.08, 0.3, 0.06, F), e * 0.1, 0.33, 0) : rot(at(box(0.07, 0.24, 0.16, F), e * 0.24, 0.02, 0), 0, 0, e * 0.3));
    }
    wide.visible = false;
    // the nightcap: a floppy cone in the pyjamas' colour with a white pompom, flopped to one side
    const cap = new THREE.Group(), capM = M(PJ[i % PJ.length][0]);
    const cc = at(cone(0.17, 0.46, 6, capM), 0, 0.2, 0); cap.add(cc); cap.add(at(cyl(0.18, 0.18, 0.07, 8, M(0xf8f8f4)), 0, -0.02, 0));
    cap.add(at(ico(0.06, 0, M(0xffffff)), 0, 0.44, 0));
    cap.position.set((i % 2 ? -1 : 1) * 0.05, 0.19, -0.04); cap.rotation.z = (i % 2 ? 1 : -1) * 1.05; cc.scale.set(1, 0.85, 1); head.add(cap);   // flopped right over: an upright cone read as a party hat
    return { g, body, head, arms, cup, legs, eyes, wide, pupils, i };
  }

  function piazza() {
    const G = new THREE.Group();
    // ---------------- the ground: a cobbled piazza (big 1.2 m stone squares: finer cells alias) ----------------
    const cobT = tex(16, 16, (x, r) => { px(x, '#8a7e72', 0, 0, 16, 16); noise(x, r, 16, 16, ['#847868', '#928676', '#7e7264'], 60); px(x, '#6e6458', 0, 0, 16, 1); px(x, '#6e6458', 0, 0, 1, 16); px(x, '#6e6458', 8, 0, 1, 8); px(x, '#6e6458', 0, 8, 16, 1); }, 3810);
    const pD = FACADE_Z - LAKE_Z + 0.4;
    G.add(flat(W + 8, pD, mat({ map: cobT, rep: [(W + 8) / 2.4, pD / 2.4] }), 0, 0, (FACADE_Z + LAKE_Z) / 2));
    // ---------------- the night sky, the moon and its path on the lake, stars ----------------
    const skyT = tex(4, 64, x => { const gr = x.createLinearGradient(0, 0, 0, 64); [[0, '#05081a'], [0.32, '#101a3c'], [0.47, '#2a2e5a'], [0.5, '#3a3260'], [1, '#3a3260']].forEach(([o, c]) => gr.addColorStop(o, c)); x.fillStyle = gr; x.fillRect(0, 0, 4, 64); }, 3811);
    G.add(new THREE.Mesh(new THREE.SphereGeometry(185, 16, 12), mat({ map: skyT, unlit: 1, side: THREE.BackSide, nofog: 1 })));
    G.add(stars(140, 175, 3812, 0xe8ecff, 0.18));
    const moon = at(new THREE.Mesh(new THREE.CircleGeometry(7.5, 16), mat({ color: 0xfff2cc, unlit: 1, nofog: 1 })), ...MOON); moon.lookAt(0, 1, 0); G.add(moon);
    const halo = at(new THREE.Mesh(new THREE.CircleGeometry(14, 16), mat({ color: 0x6a6aa0, unlit: 1, nofog: 1, see: 0.6 })), MOON[0] * 1.01, MOON[1] * 1.01, MOON[2] * 1.01); halo.lookAt(0, 1, 0); G.add(halo);
    // ---------------- the lake: dark water, the moon's path, the far shore's hills and a village ----------------
    const waterT = tex(16, 16, (x, r) => { px(x, '#141c3c', 0, 0, 16, 16); noise(x, r, 16, 16, ['#18224a', '#101836', '#1c2650'], 70); }, 3813);
    G.add(flat(260, 240, mat({ map: waterT, rep: [65, 60], unlit: 0.3 }), 0, WATER_Y, LAKE_Z - 120));
    const pathM = mat({ color: 0xffe2a0, unlit: 1, see: 0.45 });
    for (let i = 0; i < 26; i++) { const u = i / 25, z = LAKE_Z - 6 - u * 120, x = MOON[0] * (LAKE_Z - z) / (LAKE_Z - MOON[2]) + (hash(i, 3814) - 0.5) * 0.6; G.add(flat(0.7 + u * 6 + hash(i, 3815) * 0.6, 0.35 + u * 2, pathM, x, WATER_Y + 0.01, z)); }
    const hillT = tex(256, 32, (x, r) => {
      x.clearRect(0, 0, 256, 32);
      x.fillStyle = '#0c1424'; x.beginPath(); x.moveTo(0, 32); for (let i = 0; i <= 256; i += 8) x.lineTo(i, 10 + 7 * Math.sin(i * 0.05) + 4 * Math.sin(i * 0.13 + 1)); x.lineTo(256, 32); x.fill();
      x.fillStyle = '#121c30'; x.beginPath(); x.moveTo(0, 32); for (let i = 0; i <= 256; i += 8) x.lineTo(i, 18 + 5 * Math.sin(i * 0.09 + 2)); x.lineTo(256, 32); x.fill();
      for (let i = 0; i < 70; i++) { const xx = Math.floor(r() * 256), yy = 20 + Math.floor(r() * 10); px(x, r() < 0.8 ? '#ffd27a' : '#fff2d0', xx, yy, 1, 1); }
      px(x, '#121c30', 180, 8, 3, 14); px(x, '#121c30', 181, 5, 1, 3);
    }, 3816);
    const hills = new THREE.Mesh(new THREE.CylinderGeometry(120, 120, 22, 40, 1, true, PI * 0.6, PI * 0.8), mat({ map: hillT, rep: [3, 1], unlit: 1, side: THREE.BackSide, nofog: 1 }));
    hills.material.transparent = true; hills.material.alphaTest = 0.5; hills.position.set(0, WATER_Y + 9, 0); G.add(hills);
    // ---------------- the balustrade over the lake, the lamp posts, festoons of bulbs between them ----------------
    const STONE = M(0xd8ccb8), STONE2 = M(0xc8bca6), IRON = M(0x1a1a20);
    for (const [x0, x1] of [[X[0] - 4, JETTY_X - 0.7], [JETTY_X + 0.7, X[1] + 4]]) {
      const w = x1 - x0, cx = (x0 + x1) / 2;
      G.add(at(box(w, 0.12, 0.32, STONE), cx, 0.9, LAKE_Z)); G.add(at(box(w, 0.14, 0.34, STONE2), cx, 0.07, LAKE_Z));
      for (let x = x0 + 0.2; x < x1 - 0.1; x += 0.36) G.add(at(cyl(0.06, 0.08, 0.72, 6, STONE), x, 0.48, LAKE_Z));
    }
    G.add(at(box(W + 8, 1.0, 0.4, STONE2), 0, WATER_Y / 2 - 0.05, LAKE_Z - 0.05));
    const lampGlass = glow(0xffe8b0, 0.95);
    for (const [lx, lz] of LAMPS) {
      const l = at(new THREE.Group(), lx, 0, lz); G.add(l);
      l.add(at(cyl(0.16, 0.2, 0.4, 8, IRON), 0, 0.2, 0)); l.add(at(cyl(0.05, 0.06, 3.3, 6, IRON), 0, 1.95, 0));
      l.add(at(box(0.3, 0.4, 0.3, lampGlass), 0, 3.8, 0)); const cp = at(cone(0.28, 0.24, 4, IRON), 0, 4.12, 0); cp.rotation.y = PI / 4; l.add(cp);
    }
    const bulbs = new THREE.Group(); G.add(bulbs);
    const bulbCols = [0xfff0c0, 0xffd090, 0xffb0c8, 0xb0e8d0];
    for (const [a0, a1] of [[-12, -4.6], [-4.6, 4.6], [4.6, 12]]) for (let j = 0; j <= 14; j++) { const u = j / 14; bulbs.add(at(ico(0.055, 0, glow(bulbCols[(j + Math.round(a0)) & 3])), a0 + (a1 - a0) * u, 3.6 - 0.7 * Math.sin(u * PI), LAKE_Z + 0.05)); }
    // ---------------- the jetty and the varnished speedboat on the water ----------------
    const WOOD = M(0x7a5232), WOOD2 = M(0x5e3e24);
    G.add(at(box(1.3, 0.08, 14, WOOD), JETTY_X, WATER_Y + 0.55, LAKE_Z - 7.2));
    for (let i = 0; i < 8; i++) for (const sd of [-1, 1]) G.add(at(cyl(0.07, 0.07, 1.4, 5, WOOD2), JETTY_X + sd * 0.6, WATER_Y + 0.1, LAKE_Z - 0.6 - i * 1.9));
    const riva = at(new THREE.Group(), RIVA[0], WATER_Y + 0.05, RIVA[1]); G.add(riva);
    const MAHO = M(0x8a3e1e, { unlit: 0.15 }), CREAM = M(0xf2ead8), CHROME = M(0xd8dce4, { unlit: 0.25 });
    riva.add(at(box(1.5, 0.42, 3.6, MAHO), 0, 0.21, 0.2)); const bow = at(cone(0.78, 1.3, 4, MAHO), 0, 0.21, -2.25); bow.rotation.set(-PI / 2, PI / 4, 0); bow.scale.set(1, 1, 0.3); riva.add(bow);
    riva.add(at(box(1.3, 0.04, 2.8, M(0xb8683a)), 0, 0.44, 0.2)); for (let i = 0; i < 7; i++) riva.add(at(box(1.31, 0.045, 0.03, CREAM), 0, 0.445, -1.0 + i * 0.4));
    riva.add(at(box(1.2, 0.3, 0.5, CREAM), 0, 0.6, 0.8)); riva.add(at(box(1.2, 0.3, 0.5, CREAM), 0, 0.6, 1.5));
    const ws = at(box(1.3, 0.3, 0.03, mat({ color: 0xc8d8f0, unlit: 0.4, see: 0.4 })), 0, 0.62, 0.3); ws.rotation.x = -0.4; riva.add(ws);
    riva.add(at(box(0.04, 0.3, 0.04, CHROME), 0, 0.6, 2.05)); riva.add(at(box(0.3, 0.18, 0.01, M(0x2a5ad8)), 0.15, 0.68, 2.05));
    // ---------------- the house fronts: pastel stucco, green shutters, sills, terracotta eaves ----------------
    const stuccoT = (base, seed) => tex(16, 16, (x, r) => { px(x, base, 0, 0, 16, 16); noise(x, r, 16, 16, ['rgba(0,0,0,.07)', 'rgba(255,255,255,.07)'], 50); }, seed);
    const roofM = M(0xa8482e), EAVE = M(0xe8dcc4);
    const houseBox = (x0, x1, h, base, seed) => {
      const w = x1 - x0, cx = (x0 + x1) / 2, m = mat({ map: stuccoT(base, seed), rep: [w / 2, h / 2] });
      const front = at(new THREE.Mesh(new THREE.PlaneGeometry(w, h), m), cx, h / 2, FACADE_Z); front.rotation.y = PI; G.add(front);
      G.add(at(box(w, 0.18, 0.3, EAVE), cx, h + 0.09, FACADE_Z - 0.12)); G.add(at(box(w + 0.1, 0.25, 0.7, roofM), cx, h + 0.3, FACADE_Z - 0.2));
      G.add(at(box(w, 0.12, 0.16, EAVE), cx, 2.6, FACADE_Z - 0.06));
      G.add(at(box(w, h, 0.4, M(0x1a1820)), cx, h / 2, FACADE_Z + 4.2));
    };
    houseBox(X[0] - 4, -9.0, 8.2, '#e8a090', 3820);
    houseBox(-9.0, KOB_HOUSE[0], 7.8, '#e8c878', 3821);
    houseBox(KOB_HOUSE[1], 9.0, 8.0, '#a8d0c0', 3822);
    houseBox(9.0, X[1] + 4, 8.4, '#f0d8b8', 3823);
    // Kob's house: ochre, built round her window's opening (boxes, so the opening is real and her room shows through it)
    const kobM = mat({ map: stuccoT('#e8b868', 3824), rep: [1, 1] }), KH = 7.9, kx0 = KOB_HOUSE[0], kx1 = KOB_HOUSE[1], kd = 0.24;
    const wallB = (x0, x1, y0, y1) => G.add(at(box(x1 - x0, y1 - y0, kd, kobM), (x0 + x1) / 2, (y0 + y1) / 2, FACADE_Z + kd / 2));
    wallB(kx0, kx1, 0, ROOM_Y); wallB(kx0, KOB_WIN.x0, ROOM_Y, KH); wallB(KOB_WIN.x1, kx1, ROOM_Y, KH); wallB(KOB_WIN.x0, KOB_WIN.x1, ROOM_Y, KOB_WIN.y0); wallB(KOB_WIN.x0, KOB_WIN.x1, KOB_WIN.y1, KH);
    G.add(at(box(kx1 - kx0, 0.18, 0.3, EAVE), 0, KH + 0.09, FACADE_Z - 0.12)); G.add(at(box(kx1 - kx0 + 0.1, 0.25, 0.7, roofM), 0, KH + 0.3, FACADE_Z - 0.2));
    G.add(at(box(kx1 - kx0, 0.12, 0.16, EAVE), 0, 2.6, FACADE_Z - 0.06));
    // windows: a frame, a pane (dark or lit), two open green shutters, a stone sill; WINS in wake order (nearest the bar first)
    const WINS = [[-1.6, 5.6], [1.6, 5.6], [-4.6, 3.0], [4.6, 3.0], [-7.0, 3.0], [7.4, 3.0], [-4.6, 5.6], [4.6, 5.6], [-10.6, 3.0], [10.8, 3.0], [-7.0, 5.6], [7.4, 5.6], [-13.2, 3.0], [13.2, 3.0], [-10.6, 5.6], [10.8, 5.6], [-13.2, 5.6], [13.2, 5.6]];
    const dark = M(0x1a2240), litM = glow(0xffcc78, 1), shut = M(0x3a7a4a), frameM = M(0xf2ead8);
    const wins = WINS.map(([wx, wy]) => {
      const z = FACADE_Z - 0.02;
      G.add(at(box(1.18, 1.46, 0.06, frameM), wx, wy + 0.65, z));
      const pane = at(new THREE.Mesh(new THREE.PlaneGeometry(1.0, 1.3), dark), wx, wy + 0.65, z - 0.04); pane.rotation.y = PI; G.add(pane);
      G.add(at(box(0.04, 1.3, 0.02, frameM), wx, wy + 0.65, z - 0.05)); G.add(at(box(1.0, 0.04, 0.02, frameM), wx, wy + 0.9, z - 0.05));
      for (const sd of [-1, 1]) { const sh = at(box(0.5, 1.3, 0.04, shut), wx + sd * 0.82, wy + 0.65, z - 0.2); sh.rotation.y = sd * 0.5; G.add(sh); }
      G.add(at(box(1.3, 0.1, 0.32, STONE), wx, wy - 0.02, z - 0.14));
      if (hash(wx, wy, 3825) < 0.45) for (let j = 0; j < 3; j++) { G.add(at(box(0.22, 0.16, 0.18, M(0xb8582e)), wx - 0.35 + j * 0.35, wy + 0.1, z - 0.16)); G.add(at(ico(0.1, 0, M(j % 2 ? 0xe8303e : 0xf28ac0)), wx - 0.35 + j * 0.35, wy + 0.26, z - 0.16)); }
      return { pane, x: wx, y: wy };
    });
    // Kob's window: a frame round the opening, open shutters, a sill; her room behind it
    const kw = KOB_WIN, kz = FACADE_Z - 0.02, kcx = (kw.x0 + kw.x1) / 2, kwW = kw.x1 - kw.x0;
    for (const [x, y, w, h] of [[kw.x0 - 0.05, (kw.y0 + kw.y1) / 2, 0.1, kw.y1 - kw.y0 + 0.1], [kw.x1 + 0.05, (kw.y0 + kw.y1) / 2, 0.1, kw.y1 - kw.y0 + 0.1], [kcx, kw.y1 + 0.05, kwW + 0.2, 0.1]]) G.add(at(box(w, h, 0.1, frameM), x, y, kz));
    G.add(at(box(kwW + 0.3, 0.1, 0.36, STONE), kcx, kw.y0 - 0.02, kz - 0.14));
    for (const sd of [-1, 1]) { const sh = at(box(0.78, kw.y1 - kw.y0, 0.04, shut), kcx + sd * (kwW / 2 + 0.42), (kw.y0 + kw.y1) / 2, kz - 0.22); sh.rotation.y = sd * 0.55; G.add(sh); }
    // her room: a wooden floor, flowered wallpaper, a ceiling, the bed along the room's axis, a nightstand with a lamp and a red phone
    const rz0 = FACADE_Z + kd, rD = ROOM.z1 - rz0, rW = ROOM.x1 - ROOM.x0, rcz = (rz0 + ROOM.z1) / 2, rH = 2.55;
    const fl = tex(16, 16, (x, r) => { px(x, '#8a5a34', 0, 0, 16, 16); for (let y = 0; y < 16; y += 4) px(x, '#6a4224', 0, y, 16, 1); noise(x, r, 16, 16, ['#946238', '#7e5230'], 30); }, 3826);
    G.add(flat(rW, rD, mat({ map: fl, rep: [rW / 1.2, rD / 1.2] }), 0, ROOM_Y + 0.002, rcz));
    const paper = mat({ map: tex(16, 16, (x, r) => { px(x, '#c8dcc0', 0, 0, 16, 16); for (let i = 0; i < 9; i++) { const a = Math.floor(r() * 14), b = Math.floor(r() * 14); px(x, '#e8a0b0', a, b, 2, 2); px(x, '#6a9a6a', a + 1, b + 2, 1, 1); } }, 3827), rep: [rW / 1.5, rH / 1.5] });
    const wp = (w, h) => new THREE.Mesh(new THREE.PlaneGeometry(w, h), paper);
    G.add(at(rot(wp(rW, rH), 0, PI, 0), 0, ROOM_Y + rH / 2, ROOM.z1));
    G.add(at(rot(wp(rD, rH), 0, PI / 2, 0), ROOM.x0, ROOM_Y + rH / 2, rcz)); G.add(at(rot(wp(rD, rH), 0, -PI / 2, 0), ROOM.x1, ROOM_Y + rH / 2, rcz));
    const ceil = new THREE.Mesh(new THREE.PlaneGeometry(rW, rD), M(0xf0e8d8)); ceil.rotation.x = PI / 2; G.add(at(ceil, 0, ROOM_Y + rH, rcz));
    const bcx = (BED.x0 + BED.x1) / 2, bcz = (BED.z0 + BED.z1) / 2, bw = BED.x1 - BED.x0, bl = BED.z1 - BED.z0, bt = PIAZZA.BED_Y;
    G.add(at(box(bw + 0.1, bt - ROOM_Y - 0.12, bl + 0.06, M(0x6a4224)), bcx, ROOM_Y + (bt - ROOM_Y - 0.12) / 2, bcz));
    G.add(at(box(bw, 0.14, bl, M(0xf6f2ea)), bcx, bt - 0.07, bcz));
    const quilt = mat({ map: tex(8, 8, x => { px(x, '#f2a8b8', 0, 0, 8, 8); px(x, '#f8c8d0', 0, 0, 4, 4); px(x, '#f8c8d0', 4, 4, 4, 4); }, 3828), rep: [3, 4] });
    G.add(at(box(bw + 0.08, 0.06, bl * 0.62, quilt), bcx, bt + 0.01, BED.z0 + bl * 0.31));
    G.add(at(box(0.7, 0.12, 0.34, M(0xffffff)), bcx, bt + 0.05, BED.z1 - 0.24));
    G.add(at(box(bw + 0.2, 1.05, 0.08, M(0x5a3a22)), bcx, ROOM_Y + 0.52, BED.z1 + 0.06));
    const brass = at(cyl(0.05, 0.05, bw + 0.2, 6, M(0xc8a040)), bcx, ROOM_Y + 1.08, BED.z1 + 0.06); brass.rotation.z = PI / 2; G.add(brass);
    G.add(at(box(bw + 0.2, 0.55, 0.08, M(0x5a3a22)), bcx, ROOM_Y + 0.28, BED.z0 - 0.06));
    const ns = [BED.x1 + 0.45, BED.z1 - 0.3];
    G.add(at(box(0.44, 0.52, 0.4, M(0x7a5232)), ns[0], ROOM_Y + 0.26, ns[1]));
    const lampShade = mat({ color: 0xffe0a8, unlit: 0.4 });
    G.add(at(cyl(0.05, 0.08, 0.32, 6, M(0xc8a040)), ns[0], ROOM_Y + 0.68, ns[1] + 0.05)); G.add(at(cone(0.17, 0.22, 8, lampShade), ns[0], ROOM_Y + 0.9, ns[1] + 0.05));
    G.add(at(box(0.18, 0.08, 0.16, M(0xd8202a)), ns[0] - 0.05, ROOM_Y + 0.56, ns[1] - 0.12)); G.add(at(box(0.22, 0.05, 0.05, M(0xb81820)), ns[0] - 0.05, ROOM_Y + 0.63, ns[1] - 0.12));
    G.add(at(box(1.0, 1.9, 0.55, M(0x6a4224)), ROOM.x0 + 0.55, ROOM_Y + 0.95, ROOM.z1 - 1.4));
    const frame = at(box(0.6, 0.45, 0.03, M(0xc8a040)), ROOM.x1 - 0.02, ROOM_Y + 1.65, rcz); frame.rotation.y = PI / 2; G.add(frame);
    // ---------------- the front doors: Kob's green door, Sadi's blue one, two more; lit hallways behind ----------------
    const doors = {};
    const door = (key, cx, col, panel) => {
      const piv = at(new THREE.Group(), cx - DOOR_W / 2, 0, FACADE_Z - 0.04); G.add(piv);
      piv.add(at(box(DOOR_W, 2.25, 0.06, M(col)), DOOR_W / 2, 1.125, 0)); piv.add(at(ico(0.04, 0, M(0xd8b040)), DOOR_W - 0.14, 1.05, -0.05));
      for (let j = 0; j < 3; j++) piv.add(at(box(DOOR_W - 0.3, 0.5, 0.02, M(panel)), DOOR_W / 2, 0.45 + j * 0.65, -0.04));
      const hall = at(new THREE.Mesh(new THREE.PlaneGeometry(DOOR_W, 2.25), glow(0xffd090, 0.9)), cx, 1.125, FACADE_Z + 0.25); hall.rotation.y = PI; G.add(hall);
      G.add(at(box(DOOR_W + 0.3, 0.14, 0.18, EAVE), cx, 2.34, FACADE_Z - 0.08));
      G.add(at(box(DOOR_W + 0.4, 0.06, 0.5, STONE2), cx, 0.03, FACADE_Z - 0.25));
      doors[key] = piv;
    };
    door('kob', KOB_DOOR[0], 0x2a7a4a, 0x226a3e); door('sadi', SADI_DOOR[0], 0x2a5ac8, 0x2a4a9a); door('a', -12.2, 0x8a3a2a, 0x7a2a1e); door('b', 12.6, 0x5a3a7a, 0x4a2a6a);
    // ---------------- the espresso bar: counter, duckboard, back shelf, machine, cups, stools, awning ----------------
    const K0 = KIOSK, TEAL = M(0x2aa898), TEAL2 = M(0x1e8a7e), MARBLE = M(0xf2eee6, { unlit: 0.1 });
    const cw = K0.x1 - K0.x0, cz = (COUNTER.z0 + COUNTER.z1) / 2, cd = COUNTER.z1 - COUNTER.z0;
    G.add(at(box(cw, COUNTER_Y - 0.06, cd, TEAL), 0, (COUNTER_Y - 0.06) / 2, cz));
    G.add(at(box(cw + 0.12, 0.06, cd + 0.12, MARBLE), 0, COUNTER_Y - 0.03, cz));
    G.add(at(box(cw + 0.02, 0.04, 0.02, CHROME), 0, 0.12, COUNTER.z1 + 0.01)); G.add(at(box(cw + 0.02, 0.04, 0.02, CHROME), 0, COUNTER_Y - 0.1, COUNTER.z1 + 0.01));
    const neonT = tex(64, 16, x => { px(x, '#0e3a38', 0, 0, 64, 16); x.font = 'italic bold 12px serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillStyle = '#ff3a8a'; x.fillText('Espresso', 32, 8.5); x.fillStyle = '#ffd0e4'; x.fillText('Espresso', 32, 8); }, 3830);
    G.add(at(new THREE.Mesh(new THREE.PlaneGeometry(1.9, 0.48), mat({ map: neonT, unlit: 1 })), 0, 0.46, COUNTER.z1 + 0.012));
    G.add(at(box(cw - 0.1, DECK, COUNTER.z0 - K0.z0 - 0.3, M(0x8a6a44)), 0, DECK / 2, (K0.z0 + 0.3 + COUNTER.z0) / 2));
    for (let i = 0; i < 5; i++) G.add(at(box(cw - 0.12, 0.012, 0.04, M(0x6a4a2a)), 0, DECK + 0.005, K0.z0 + 0.4 + i * 0.18));
    G.add(at(box(cw, 0.95, 0.3, TEAL2), 0, 0.475, K0.z0 + 0.15)); G.add(at(box(cw + 0.06, 0.05, 0.34, MARBLE), 0, 0.97, K0.z0 + 0.15));
    for (let i = 0; i < 9; i++) G.add(at(cyl(0.04, 0.04, 0.2 + (i % 3) * 0.05, 6, M([0x2a6a3a, 0xc83a2a, 0xe8c040, 0x3a3a8a][i % 4])), K0.x0 + 0.25 + i * 0.32, 1.1 + (i % 3) * 0.025, K0.z0 + 0.15));
    const machine = at(new THREE.Group(), MACHINE[0], COUNTER_Y, MACHINE[1]); G.add(machine);
    machine.add(at(box(0.62, 0.36, 0.38, CHROME), 0, 0.18, 0)); machine.add(at(box(0.64, 0.05, 0.4, M(0x1e1e24)), 0, 0.02, 0));
    machine.add(at(new THREE.Mesh(new THREE.SphereGeometry(0.17, 10, 6, 0, TAU, 0, PI / 2), M(0xd8b048, { unlit: 0.25 })), 0, 0.36, 0));
    machine.add(at(ico(0.06, 0, M(0xe8c858, { unlit: 0.3 })), 0, 0.56, 0));
    const gauge = at(cyl(0.06, 0.06, 0.02, 10, glow(0xf8f4ec, 0.6)), 0.0, 0.24, 0.19); gauge.rotation.x = PI / 2; machine.add(gauge);
    const levers = [];
    for (const sd of [-1, 1]) {
      const head = at(cyl(0.035, 0.035, 0.08, 6, M(0x1e1e24)), sd * 0.16, 0.1, 0.24); head.rotation.x = PI / 2; machine.add(head);
      const lv = at(new THREE.Group(), sd * 0.16, 0.3, 0.2); machine.add(lv);
      lv.add(at(box(0.03, 0.34, 0.03, CHROME), 0, 0.17, 0)); lv.add(at(cyl(0.035, 0.03, 0.14, 6, M(0x1a1a1a)), 0, 0.38, 0));
      levers.push(lv);
    }
    const cupsOn = [];
    for (let i = 0; i < 6; i++) { const c = cupMesh(1.5); c.position.set(0.3 + i * 0.18, COUNTER_Y, -0.48 - (i % 2) * 0.12); G.add(c); cupsOn.push(c); }
    for (const [x, z] of [[K0.x0 - 0.05, K0.z0], [K0.x1 + 0.05, K0.z0]]) G.add(at(cyl(0.025, 0.025, 2.3, 5, CHROME), x, 1.15, z));   // the awning on its two back poles only: front poles split every side shot over the counter
    const awnT = tex(16, 4, x => { for (let i = 0; i < 16; i += 2) px(x, i % 4 ? '#f6f4ee' : '#2aa898', i, 0, 2, 4); }, 3831);
    // the awning: stripes on top only (seen from below at 270 x 480 they aliased into a zigzag band), a plain teal underside
    const awn = new THREE.Mesh(new THREE.PlaneGeometry(cw + 0.4, K0.z1 - K0.z0 + 0.6), mat({ map: awnT, rep: [3, 1] })); awn.rotation.x = -PI / 2 + 0.1; G.add(at(awn, 0, 2.32, (K0.z0 + K0.z1) / 2 + 0.15));
    const awnU = new THREE.Mesh(new THREE.PlaneGeometry(cw + 0.4, K0.z1 - K0.z0 + 0.6), M(0x7ac8bc)); awnU.rotation.x = PI / 2 + 0.1; G.add(at(awnU, 0, 2.31, (K0.z0 + K0.z1) / 2 + 0.15));
    for (let i = 0; i < 11; i++) G.add(at(cone(0.15, 0.16, 3, M(i % 2 ? 0xf6f4ee : 0x2aa898)), K0.x0 - 0.15 + i * 0.33, 2.16, K0.z1 + 0.42));
    const stools = new THREE.Group(); G.add(stools);
    for (const [sx, sz] of STOOLS) { stools.add(at(cyl(0.035, 0.035, STOOL_Y, 6, CHROME), sx, STOOL_Y / 2, sz)); stools.add(at(cyl(0.18, 0.18, 0.07, 10, M(0xd8303a)), sx, STOOL_Y, sz)); stools.add(at(cyl(0.16, 0.18, 0.03, 8, CHROME), sx, 0.015, sz)); }
    // ---------------- cafe tables, a Vespa ----------------
    for (const [tx, tz] of TABLES) {
      G.add(at(cyl(0.34, 0.34, 0.03, 10, M(0xf2eee6)), tx, 0.62, tz)); G.add(at(cyl(0.03, 0.03, 0.62, 5, IRON), tx, 0.31, tz));
      for (const sd of [-1, 1]) { G.add(at(box(0.32, 0.04, 0.32, IRON), tx + sd * 0.5, 0.4, tz)); G.add(at(box(0.04, 0.4, 0.32, IRON), tx + sd * 0.66, 0.6, tz)); }
    }
    const vespa = at(new THREE.Group(), VESPA[0], 0, VESPA[1]); G.add(vespa);
    const MINT = M(0x9ad8c8, { unlit: 0.1 });
    vespa.add(at(box(0.5, 0.42, 0.36, MINT), 0.3, 0.42, 0)); vespa.add(at(box(0.9, 0.08, 0.3, MINT), -0.1, 0.3, 0)); vespa.add(at(box(0.5, 0.1, 0.24, M(0xf2ead8)), 0.25, 0.68, 0));
    vespa.add(at(box(0.12, 0.62, 0.3, MINT), -0.5, 0.5, 0)); vespa.add(at(box(0.06, 0.06, 0.5, CHROME), -0.5, 0.86, 0)); vespa.add(at(ico(0.06, 0, glow(0xfff4d8, 0.8)), -0.58, 0.72, 0));
    for (const wx of [-0.5, 0.42]) { vespa.add(at(rot(cyl(0.17, 0.17, 0.1, 10, M(0x1e1e22)), PI / 2, 0, 0), wx, 0.17, 0)); vespa.add(at(rot(cyl(0.08, 0.08, 0.11, 8, CHROME), PI / 2, 0, 0), wx, 0.17, 0)); }
    // ---------------- the police car: white, a dark blue band, a gold star, the red light on its roof (nose to +x) ----------------
    const car = new THREE.Group(); G.add(car);
    const WHT = M(0xf2f2ee), BLU = M(0x1e3a7a), TYRE = M(0x1a1a1e);
    const { L: cL, W: cW } = CAR;
    // open-topped (review loop 1): under a 1.25 m roof a seated chibi's head went through it and her face sat below the
    // door line, so the cop could never be seen driving. The bonnet and the boot are solid, the cabin a tub of thin sides
    const { CAB0, CAB1 } = CAR, SEAT = M(0xc89a62), DASH = M(0x2a2228);
    car.add(at(box(cL / 2 - CAB1, 0.5, cW, WHT), (cL / 2 + CAB1) / 2, 0.5, 0)); car.add(at(box(CAB0 + cL / 2, 0.5, cW, WHT), (CAB0 - cL / 2) / 2, 0.5, 0));
    car.add(at(box(CAB1 - CAB0, 0.5, 0.05, WHT), (CAB0 + CAB1) / 2, 0.5, cW / 2 - 0.025));
    car.add(at(box(-0.4 - CAB0, 0.5, 0.05, WHT), (CAB0 - 0.4) / 2, 0.5, -cW / 2 + 0.025)); car.add(at(box(CAB1 - 0.55, 0.5, 0.05, WHT), (CAB1 + 0.55) / 2, 0.5, -cW / 2 + 0.025));
    car.add(at(box(CAB1 - CAB0, 0.05, cW - 0.1, M(0x3a2a26)), (CAB0 + CAB1) / 2, 0.3, 0));
    car.add(at(box(cL + 0.02, 0.1, 0.01, BLU), 0, 0.62, cW / 2 + 0.005));
    car.add(at(box(cL / 2 - 0.4, 0.1, 0.01, BLU), -(cL / 2 + 0.4) / 2, 0.62, -cW / 2 - 0.005)); car.add(at(box(cL / 2 - 0.55, 0.1, 0.01, BLU), (cL / 2 + 0.55) / 2, 0.62, -cW / 2 - 0.005));
    for (const ex of [-1, 1]) car.add(at(box(0.01, 0.1, cW + 0.02, BLU), ex * (cL / 2 + 0.005), 0.62, 0));
    for (const [sx, bx] of [[CAR.SEAT_X, CAR.SEAT_X - 0.36], [CAB0 + 0.45, CAB0 + 0.1]]) { car.add(at(box(0.5, 0.12, cW - 0.14, SEAT), sx, CAR.SEAT_Y - 0.06, 0)); car.add(at(box(0.1, 0.42, cW - 0.14, SEAT), bx, CAR.SEAT_Y + 0.17, 0)); }
    car.add(at(box(0.1, 0.12, cW - 0.1, DASH), CAB1 - 0.06, 0.8, 0));
    for (const sd of [-1, 1]) car.add(at(box(0.03, 0.14, 0.03, CHROME), CAB1 - 0.02, 0.82, sd * (cW / 2 - 0.08)));
    car.add(at(box(0.03, 0.03, cW - 0.14, CHROME), CAB1 - 0.02, 0.89, 0));   // the screen's low frame only: a tall one crosses the driver's face
    const wheel = at(new THREE.Mesh(new THREE.TorusGeometry(0.17, 0.022, 4, 10), M(0x1a1a1e)), CAR.WHEEL[0], CAR.WHEEL[1], CAR.WHEEL[2]); wheel.rotation.order = 'ZYX'; wheel.rotation.set(0, -PI / 2, -0.5); car.add(wheel);   // under the driving clip's paws (CLIP_PROBE on Compote), tilted to her
    car.add(at(rot(cyl(0.02, 0.02, 0.4, 5, M(0x1a1a1e)), 0, 0, 1.1), CAR.WHEEL[0] + 0.18, CAR.WHEEL[1] - 0.06, CAR.WHEEL[2]));
    for (const [wx, wz] of [[-1.15, 0.78], [1.15, 0.78], [-1.15, -0.78], [1.15, -0.78]]) { car.add(at(rot(cyl(0.3, 0.3, 0.2, 10, TYRE), PI / 2, 0, 0), wx, 0.3, wz)); car.add(at(rot(cyl(0.15, 0.15, 0.21, 8, CHROME), PI / 2, 0, 0), wx, 0.3, wz)); }
    for (const ex of [-1, 1]) car.add(at(box(0.1, 0.16, cW + 0.04, CHROME), ex * (cL / 2 + 0.03), 0.34, 0));
    for (const sd of [-1, 1]) car.add(at(rot(cyl(0.1, 0.1, 0.05, 10, glow(0xfff4d8, 0.9)), 0, 0, PI / 2), cL / 2 + 0.01, 0.62, sd * 0.55));
    const starT = tex(16, 16, x => { x.clearRect(0, 0, 16, 16); x.fillStyle = '#e8c040'; x.beginPath(); for (let i = 0; i < 10; i++) { const a = i / 10 * TAU - PI / 2, r = i % 2 ? 3.2 : 7.5; x.lineTo(8 + Math.cos(a) * r, 8 + Math.sin(a) * r); } x.fill(); }, 3832);
    for (const sd of [-1, 1]) { const st = at(new THREE.Mesh(new THREE.PlaneGeometry(0.42, 0.42), mat({ map: starT, unlit: 0.5 })), 0.2, 0.48, sd * (cW / 2 + 0.006)); st.material.transparent = true; st.material.alphaTest = 0.4; if (sd < 0) st.rotation.y = PI; car.add(st); }
    const [bX, bZ] = CAR.BEACON, bY = CAR.BEACON_Y;   // the red light on a chrome post behind the passenger seat (no roof to sit on)
    car.add(at(cyl(0.03, 0.03, bY - 0.3, 6, CHROME), bX, (bY + 0.3) / 2, bZ));
    const beaconM = mat({ color: 0xff2a2a, unlit: 1 }), beacon = at(new THREE.Mesh(new THREE.SphereGeometry(0.15, 10, 6, 0, TAU, 0, PI / 2), beaconM), bX, bY + 0.01, bZ); car.add(beacon);
    car.add(at(cyl(0.16, 0.16, 0.05, 10, CHROME), bX, bY, bZ));
    const siren = at(cyl(0.08, 0.1, 0.16, 8, CHROME), bX, bY - 0.14, bZ); siren.rotation.z = PI / 2; car.add(siren);
    const carDoor = at(new THREE.Group(), 0.55, 0, -cW / 2 - 0.01); car.add(carDoor);
    carDoor.add(at(box(0.95, 0.5, 0.05, WHT), -0.475, 0.5, 0)); carDoor.add(at(box(0.95, 0.1, 0.06, BLU), -0.475, 0.62, 0));
    car.visible = false;
    // ---------------- the steam over the machine, hearts ----------------
    const steamM = mat({ color: 0xf4f6fa, unlit: 0.7, see: 0.4 }), steam = [];
    for (let i = 0; i < 10; i++) { const p = ico(0.12, 1, steamM); p.visible = false; G.add(p); steam.push(p); }
    const heartM = M(0xff4f9a, { unlit: 0.8 }), hearts = [];
    for (let i = 0; i < 18; i++) { const h = new THREE.Group(); h.add(at(ico(0.1, 0, heartM), -0.075, 0, 0)); h.add(at(ico(0.1, 0, heartM), 0.075, 0, 0)); h.add(rot(at(cone(0.125, 0.18, 4, heartM), 0, -0.11, 0), PI, 0, 0)); h.visible = false; G.add(h); hearts.push(h); }
    // ---------------- the neighbours: on the piazza, and in the first-floor windows ----------------
    const SPOTS = [[-3.0, 1.6], [3.0, 1.8], [-5.2, -0.4], [5.0, -0.6], [-2.2, -3.2], [2.4, -3.3], [-6.8, 1.4], [6.8, 1.2], [-4.4, -2.6], [4.6, -2.4],
      [-8.4, -0.8], [8.6, -0.6], [-1.8, 3.4], [2.2, 3.5], [-9.8, 2.2], [9.6, 2.4], [-6.0, 3.6], [-10.6, -2.8], [10.4, -2.6], [-12.0, 0.6], [12.2, 0.8], [0.8, 2.6], [-0.8, 2.4], [6.2, 3.4]];
    const guests = SPOTS.map(([x, z], i) => { const p = pet(i); G.add(p.g); return { p, x, z, face: Math.atan2(0 - x, -0.6 - z) }; });
    const winPets = WINS.map(([wx, wy], i) => { if (wy > 4) return null; const p = pet(i + 5, 0.45); p.legs.visible = false; p.g.position.set(wx, wy - 0.36, FACADE_Z - 0.2); p.g.rotation.y = PI; p.g.visible = false; G.add(p.g); return p; });

    const poseArms = (p, aL, aR) => p.arms.forEach((a, k2) => { const [rx, rz] = k2 ? aR : aL; a.rotation.set(rx, 0, (k2 ? 1 : -1) * rz); });
    function animPet(p, mode, b, s, i, P, wiredOn) {
      const bb = b + (mode === 'dance' || mode === 'moves' ? 0 : i * 0.13), kick = Math.exp(-(bb - Math.floor(bb)) * 5);
      let side = 0, sway = 0, bob = 0.03 * Math.abs(Math.sin(bb * PI)), headX = 0.06 * Math.abs(Math.sin(bb * PI));
      let aL = [0.25 * Math.sin(bb * PI), 0.12], aR = [0.25 * Math.sin(bb * PI + PI), 0.12];
      if (mode === 'dance') { side = 0.1 * (Math.floor(bb / 2) % 2 ? 1 : -1); sway = 0.16 * Math.sin(bb * PI / 2); bob = 0.06 * kick; aL = [0.3, 2.45 + 0.3 * kick]; aR = [0.3, 2.45 + 0.3 * kick]; }
      else if (mode === 'moves') {
        const m = P.movesAt || [0, 0.5, 1, 1.5], n = m.reduce((c, ti) => s >= ti ? c + 1 : c, 0);
        if (s > m[3] + 0.6) { sway = 0.16 * Math.sin(bb * PI / 2); bob = 0.06 * kick; aL = [0.3, 2.45 + 0.3 * kick]; aR = [0.3, 2.45 + 0.3 * kick]; }
        else if (n === 1) { aL = [0.2, 2.75]; aR = [0.2, 2.75]; bob = 0.05 * kick; }
        else if (n === 2) { aL = [0.1, 0.2]; aR = [0.1, 0.2]; bob = -0.1; }
        else if (n === 3) { aL = [0.2, 2.75]; aR = [0.2, 2.15]; sway = 0.24; }
        else if (n === 4) { aL = [0.2, 2.15]; aR = [0.2, 2.75]; sway = -0.24; }
      } else if (mode === 'yell') { aL = [0.1, 0.35]; aR = [-0.25, 2.9 + 0.2 * Math.sin(bb * TAU * 2)]; headX = -0.12; bob = 0.02 * kick; }   // a fist shaken straight up
      else if (mode === 'cheer') { aL = [0.35, 2.45 + 0.25 * Math.sin(bb * TAU)]; aR = [0.35, 2.45 + 0.25 * Math.sin(bb * TAU + 1)]; bob = 0.05 * kick; }
      else if (mode === 'sip') { const sp = (bb % 4) < 1 ? 1 : 0; aR = [-1.15 * sp - 0.2, 0.3 + 0.35 * sp]; headX = -0.1 * sp; }
      else if (mode === 'stare') { aL = [0, 0.1]; aR = [0, 0.1]; bob = 0; headX = 0; }
      p.body.position.y = bob; p.body.rotation.set(0, 0, sway); p.head.rotation.set(headX, 0, 0);
      poseArms(p, aL, aR);
      p.cup.quaternion.copy(p.arms[1].quaternion).invert();   // the cup stays upright whatever the arm does (a raised one tipped it)
      p.wide.visible = wiredOn; p.eyes.visible = !wiredOn;
      if (wiredOn) p.pupils.forEach((pu, e) => { pu.position.x = (e ? 1 : -1) * 0.1 + 0.028 * Math.sin(s * 41 + i * 3.1 + e); pu.position.y = 0.07 + 0.025 * Math.cos(s * 37 + i * 1.7 + e * 2); });
      return side;
    }

    return {
      group: G, sky: null, shadowCol: 0x4a4440, indoor: false,
      light() { lights(0x48507e, 0x8a9ad8, [0.3, -0.85, -0.4], 0x161c3a, [26, 95], 10); },   // the moonlight from behind the usual lenses: faces turned to +z read
      anim(t, P = {}) {
        const s = shotT(t, P), b = beat(t);
        // the bar's warm light under the awning, Kob's lamp, a lamp post, the siren or a key light
        pt(0, 0, 1.9, -0.9, 1.25, 0.95, 0.65);
        const lampOn = from(P.kobLamp, s);
        lampShade.uniforms.uUnlit.value = lampOn ? 1 : 0.2;
        pt(1, BED.x1 + 0.45, ROOM_Y + 1.05, BED.z1 - 0.25, lampOn ? 1.3 : 0.18, lampOn ? 0.95 : 0.2, lampOn ? 0.55 : 0.35);
        pt(2, 0, 3.4, 2.6, 0.75, 0.62, 0.42);   // the house fronts' warm fill: lit only by the ambient, faces turned to the houses read black
        // the windows waking up
        let n = 0;
        if (Array.isArray(P.wake)) { const [s0, gap, n0, n1] = P.wake; n = Math.min(n1 ?? WINS.length, (n0 || 0) + (s >= s0 ? 1 + Math.floor((s - s0) / gap) : 0)); }
        else n = P.wake || 0;
        wins.forEach((w, i) => { w.pane.material = i < n ? litM : dark; });
        winPets.forEach((p, i) => {
          if (!p) return;
          const on = i < n && P.winPets !== false && !cleared(P, WINS[i][0], FACADE_Z); p.g.visible = on; if (!on) return;
          animPet(p, P.winPets || 'yell', b, s, i + 30, P, false);
          p.body.rotation.x = 0.38;   // leaning out over the sill
        });
        // doors
        doors.kob.rotation.y = -1.4 * cl(ramp(P.kobDoor, s)); doors.sadi.rotation.y = -1.4 * cl(ramp(P.sadiDoor, s));   // inwards (+z)
        // the machine: levers, steam; the cups on the counter; the stools
        const lv = cl(ramp(P.lever, s)); levers.forEach((l, i) => { l.rotation.x = -(P.pump ? 1.1 * (0.5 + 0.5 * Math.sin((b * 2 + i) * PI)) : 1.1 * lv); });   // pulled towards the barista   // pump: the two levers worked like a game pad, alternating on the half beats
        const nc = P.counterCups ?? 5; cupsOn.forEach((c, i) => { c.visible = i < nc; });
        stools.visible = P.stools !== false;
        steam.forEach((p, i) => {
          let e = -1;
          if (P.steam === true) e = ((b + i / steam.length * 2) % 2) / 2;
          else if (Array.isArray(P.steam)) { const q = P.steam.map(v => s - v - (i % 5) * 0.06).filter(v => v >= 0 && v < 1.3); if (q.length) e = Math.min(...q) / 1.3; }
          p.visible = e >= 0 && e <= 1; if (!p.visible) return;
          const big = P.steamBig ? 1.9 : 1;   // steamBig: the machine roars (a burst round the barista)
          p.position.set(MACHINE[0] + 0.12 * big * Math.sin(i * 2.3 + e * 4), COUNTER_Y + 0.62 + e * 0.9 * big, MACHINE[1] + 0.08 * big * Math.cos(i * 1.7)); p.scale.setScalar((0.45 + e * 1.3) * big);   // smaller: big puffs read as grey balloons
        });
        // the police car
        const pc = P.police; car.visible = !!pc;
        if (pc) {
          const u0 = cl((s - (pc.at ?? 0)) / Math.max(0.01, pc.dur ?? 1)), u = pc.to ? (pc.lin ? u0 : 1 - Math.pow(1 - u0, 2)) : 0;   // lin: matches an actor's linear mx (the driver)
          const x0 = pc.x ?? -16, z0 = pc.z ?? CAR_Z, [x1, z1] = pc.to || [x0, z0];
          car.position.set(x0 + (x1 - x0) * u, 0, z0 + (z1 - z0) * u); car.rotation.y = (pc.yaw || 0) * PI / 180;
          const sir = from(P.siren, s), on = sir && Math.floor(b * 2) % 2 === 0;
          beaconM.uniforms.uCol.value.setRGB(on ? 1.4 : 0.55, on ? 0.15 : 0.08, on ? 0.15 : 0.08);
          if (sir) pt(3, car.position.x + 0.1 + Math.cos(b * PI) * 1.2, 1.7, car.position.z + Math.sin(b * PI) * 1.2, on ? 0.75 : 0.2, 0.06, 0.08);   // at 1.6 it flooded the frame red
          carDoor.rotation.y = -1.15 * cl(ramp(P.carDoor, s));   // out to -z
        }
        if (P.key) pt(3, P.key[0], P.key[1], P.key[2], P.key[3], P.key[4], P.key[5]);
        // the neighbours on the piazza
        const mode = P.pets ?? false, nG = guests.length, wiredN = P.wired === true ? nG : (P.wired || 0);
        guests.forEach((q, i) => {
          let { x, z } = q, yaw = q.face; const { p } = q;
          if (P.spots) { if (i >= P.spots.length) { p.g.visible = false; return; } [x, z] = P.spots[i]; const sa = P.spotsAt || [0, -0.6]; yaw = Math.atan2(sa[0] - x, sa[1] - z); }
          else if (P.mob) { const [cx, czz, cols, rows, dx, dz, my] = P.mob, c = i % cols, r = Math.floor(i / cols); if (r >= rows) { p.g.visible = false; return; } x = cx + (c - (cols - 1) / 2) * dx + (r % 2 ? dx * 0.25 : 0); z = czz + r * dz; yaw = (my ?? 180) * PI / 180; }
          else if (P.gather) { const [gx, gz, gr, a0, a1, gy] = P.gather, a = (a0 + (a1 - a0) * i / Math.max(1, nG - 1)) * PI / 180; x = gx + Math.sin(a) * gr; z = gz + Math.cos(a) * gr; yaw = gy != null ? gy * PI / 180 : Math.atan2(gx - x, gz - z); }
          const show = mode !== false && !P.noguests && !cleared(P, x, z); p.g.visible = show; if (!show) return;
          if (P.stare) yaw = Math.atan2(P.stare[0] - x, P.stare[1] - z);
          p.cup.visible = !!P.cups;
          const side = animPet(p, mode, b, s, i, P, i < wiredN);
          p.g.position.set(x + Math.cos(yaw) * side, 0, z - Math.sin(yaw) * side); p.g.rotation.y = yaw;
        });
        hearts.forEach((h, i) => {
          const q = (P.hearts || [])[Math.floor(i / 3)]; h.visible = false; if (!q) return;
          let e = s - q[3] - (i % 3) * 0.3; if (q[4] && e > 0) e %= 1.2;
          if (e < 0 || e > 1.4) return;
          h.visible = true; h.position.set(q[0] + ((i % 3) - 1) * 0.22 + 0.06 * Math.sin(e * 6 + i), q[1] + 0.55 * e, q[2]); h.scale.setScalar(Math.min(1, e * 5) * (1.15 - 0.25 * (e / 1.4)));
          h.rotation.y = (P.heartYaw ?? 0) * PI / 180;
        });
      },
    };
  }
  return { piazza: piazza() };
}
