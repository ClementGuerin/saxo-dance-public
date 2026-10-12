// maps45.js: the "Gabriela" map (2026-10-13, KATSEYE; the clip: a telenovela at "Gabriela Enterprises", a corporate
// tower whose CEO, a woman in a red power suit, is retiring and must name the next Gabriela: a wood-panelled boardroom,
// a long blue-grey marble table, black leather chairs, white torchiere lamps, window blinds, her portrait in red on the
// wall, white mugs with the red logo, the candidates in red dresses fighting over the title, and in the last shot her
// white Persian cat in a gold collar). Same contract as the other map files, pure in t:
//   boardroom  the boardroom of Gabriela Enterprises by day (BOARD: x X0..X1, z Z0..Z1, H high): a burgundy carpet,
//         walnut panelling, the CEO's portrait on the back wall (PORTRAIT, a painted dog in a red suit in a gilt frame;
//         `portraitMat` takes a picture), two torchiere lamps either side of it, low credenzas, three tall windows with
//         white blinds in the right wall (x = X1), a pink neon "Gabriela" on the left wall, the door (DOOR), a potted
//         palm in the back-left corner (PALM). The table runs along z (x -TX..TX, z TZ0..TZ1, its top at TY 0.74) with
//         the CEO's high-backed chair at its head (HEAD, facing +z, seat SEAT_Y) and eight black leather chairs along
//         its sides (SEATS) where box-pet board members in suits sit facing it: `board` (a mode for all) or `bmode`
//         [8]: 'sit', 'clap', 'gasp' (paws up by the cheeks, mouth open), 'stare' (at `stare` [x, z]), 'point' (an arm
//         out sideways at `pointAt` [x, z]), 'cheer', 'dance' (seated: swaying, paws up on the beat), 'swoon' (heads
//         tilted, paws on the chest), false (an empty chair); `bstand` stands them along the table's sides with every chair
//         hidden (the dance and the cheer then use the whole body: beside their chairs they stood behind them and hid);
//         `clear` [[x, z, r]] empties the seats there, chairs and all.
//         On the table: six water glasses (GLASSES), a glass vase of red roses (VASE), two white mugs with the red logo
//         (MUGS), a stack of papers (PAPERS), the retirement cake at the head (CAKE: one red velvet tier 0.2 m
//         high, white frosting with drips, a gold G topper; two tiers stood above the half-size kitten's reach; `cakePaws`
//         s: two paw dents and frosting chunks in its top from then), the kitten's red velvet cushion with gold
//         tassels (CUSHION, its top CUSH_Y), a conference phone. Things knocked off: `knock` [[item, s, dx, dz, slide]]
//         (item 'g0'..'g6', 'vase', 'm0', 'm1', 'papers'): it slides `slide` m along (dx, dz) in 0.2 s, falls off
//         the edge tipping, and lands 0.39 s later as its mess (water and shards, the vase on its side and the roses
//         scattered, coffee, papers fanned out) with a splash of drops; `mess` [[kind, x, z, yaw]] lays a mess on the
//         floor from the start ('water', 'roses', 'coffee', 'papers'); `hide` ['g0', 'vase', 'cake', 'topper', 'cushion',
//         'papers', 'mugs', 'glasses', 'phone'] takes things off the table. `hearts` [[x, y, z, s0, loop]] +
//         `heartYaw`; `confetti` (s: gold and red confetti over the table from then, round `confAt` [x, z]); `stop` (s: the board, the lamps and
//         the confetti freeze from then: a photo); `key`.
import { mapKit } from './mapkit.js';

export const BOARD = {
  X0: -6, X1: 6, Z0: -5.6, Z1: 6.4, H: 4.4,
  TX: 0.85, TZ0: -2.9, TZ1: 2.7, TY: 0.74,
  HEAD: [0, -3.55], SEAT_Y: 0.48,
  SEATS: [[-1.38, -1.9], [-1.38, -0.6], [-1.38, 0.7], [-1.38, 2.0], [1.38, -1.9], [1.38, -0.6], [1.38, 0.7], [1.38, 2.0]],
  PORTRAIT: [0, 2.3, -5.56], PW: 1.6, PH: 2.1,
  CUSHION: [-0.42, -2.3], CUSH_Y: 0.84,
  CAKE: [0.2, -2.42], CAKE_Y: 0.74,
  VASE: [-0.5, 0.05],
  GLASSES: [[-0.3, 2.53], [-0.6, 1.5], [0.6, 0.6], [-0.6, -0.75], [0.6, -1.5], [0.6, 2.25], [-0.77, -2.3]],
  MUGS: [[-0.6, 0.4], [0.6, -0.7]],
  PAPERS: [0.48, 1.35],
  PALM: [-4.9, -4.7],
  DOOR: [-6, 3.6],
};

export function buildBoardroomMaps(K) {
  const k = mapKit(K);
  const { THREE, mat, tex, px, noise, box, TAU, PI, beat, fr, hash, cyl, cone, ico, at, rot, flat, lights, pt, fall } = k;
  const M = (c, o = {}) => mat({ color: c, ...o }), glow = (c, u = 1) => mat({ color: c, unlit: u });
  const cl = x => Math.max(0, Math.min(1, x));
  const shotT = (t, P) => P.t0 != null ? t - P.t0 : 0;
  const B = BOARD;

  // ---------- textures ----------
  const carpetT = tex(32, 32, (x, r) => { px(x, '#5a1820', 0, 0, 32, 32); noise(x, r, 32, 32, ['#561620', '#621c24', '#4e141c'], 140); for (let i = 0; i < 32; i += 8) for (let j = 0; j < 32; j += 8) px(x, '#6a2028', i + 3, j + 3, 2, 2); }, 4501);
  const walnutT = tex(32, 32, (x, r) => { px(x, '#5a3a24', 0, 0, 32, 32); for (let i = 0; i < 32; i++) px(x, ['#56381f', '#5e3e26', '#523420', '#62422a'][Math.floor(r() * 4)], i, 0, 1, 32); for (let i = 0; i < 32; i += 8) px(x, '#3a2414', i, 0, 1, 32); noise(x, r, 32, 32, ['rgba(0,0,0,.1)'], 40); }, 4502);
  const marbleT = tex(32, 32, (x, r) => { px(x, '#7a8a98', 0, 0, 32, 32); noise(x, r, 32, 32, ['#74848f', '#808f9c', '#8898a4'], 160); x.strokeStyle = 'rgba(230,236,240,.35)'; x.lineWidth = 1; for (let i = 0; i < 3; i++) { x.beginPath(); x.moveTo(r() * 32, 0); x.bezierCurveTo(r() * 32, 10, r() * 32, 22, r() * 32, 32); x.stroke(); } }, 4503);
  const blindT = tex(16, 32, x => { for (let j = 0; j < 32; j++) px(x, j % 4 === 3 ? '#8a98a8' : (j % 4 === 0 ? '#e8f0f8' : '#f6fafc'), 0, j, 16, 1); }, 4504);
  const ceilT = tex(16, 16, (x, r) => { px(x, '#3a2e26', 0, 0, 16, 16); noise(x, r, 16, 16, ['#362a22', '#3e322a'], 30); px(x, '#2a201a', 0, 0, 16, 1); px(x, '#2a201a', 0, 0, 1, 16); }, 4505);
  const neonT = tex(128, 32, x => { x.clearRect(0, 0, 128, 32); x.fillStyle = '#ff6ab8'; x.font = 'italic bold 26px sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('Gabriela', 64, 17); }, 4506);
  const logoT = tex(16, 16, x => { px(x, '#f8f8f6', 0, 0, 16, 16); x.fillStyle = '#d8202c'; x.font = 'italic bold 9px sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('Gab', 8, 9); }, 4507);
  // the CEO's portrait: a black-and-tan dog with a pink bow in a red suit on a dark green ground
  const portraitT = tex(48, 64, (x, r) => {
    px(x, '#1e3a2e', 0, 0, 48, 64); noise(x, r, 48, 64, ['#22402f', '#1a3428', '#26443a'], 300);
    x.fillStyle = '#c8202a'; x.beginPath(); x.moveTo(6, 64); x.lineTo(10, 40); x.quadraticCurveTo(24, 33, 38, 40); x.lineTo(42, 64); x.fill();   // the red suit
    x.fillStyle = '#e8c048'; for (const [a, b] of [[20, 46], [20, 52], [27, 46], [27, 52]]) x.fillRect(a, b, 2, 2);   // gold buttons
    x.fillStyle = '#9a1820'; x.beginPath(); x.moveTo(17, 39); x.lineTo(24, 52); x.lineTo(31, 39); x.fill();             // the lapels' V
    x.fillStyle = '#181210'; x.beginPath(); x.ellipse(24, 26, 13, 12, 0, 0, TAU); x.fill();                               // the head, black
    x.beginPath(); x.ellipse(11, 28, 5, 9, 0.2, 0, TAU); x.fill(); x.beginPath(); x.ellipse(37, 28, 5, 9, -0.2, 0, TAU); x.fill();   // the ears
    x.fillStyle = '#b07838'; x.beginPath(); x.ellipse(24, 31, 8, 7, 0, 0, TAU); x.fill();                                 // the tan muzzle
    x.fillStyle = '#ffffff'; x.fillRect(18, 23, 4, 4); x.fillRect(26, 23, 4, 4); x.fillStyle = '#101010'; x.fillRect(19, 24, 2, 2); x.fillRect(27, 24, 2, 2);
    x.fillRect(22, 29, 4, 3);                                                                                             // the nose
    x.fillStyle = '#ff8ac0'; x.fillRect(30, 13, 6, 4); x.fillRect(32, 12, 2, 6);                                          // the pink bow
  }, 4508);

  function boardroom() {
    const G = new THREE.Group();
    const W = B.X1 - B.X0, D = B.Z1 - B.Z0, H = B.H, ZC = (B.Z0 + B.Z1) / 2;
    G.add(flat(W, D, mat({ map: carpetT, rep: [W / 1.5, D / 1.5] }), (B.X0 + B.X1) / 2, 0, ZC));
    // the walls: walnut panelling with a darker dado rail; the ceiling with recessed lights
    const wall = (w, h, x, y, z, ry) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat({ map: walnutT, rep: [w / 1.6, h / 1.6], unlit: 0.12 })); m.position.set(x, y, z); m.rotation.y = ry; G.add(m); return m; };
    wall(W, H, 0, H / 2, B.Z0, 0); wall(W, H, 0, H / 2, B.Z1, PI); wall(D, H, B.X0, H / 2, ZC, PI / 2); wall(D, H, B.X1, H / 2, ZC, -PI / 2);
    const rail = M(0x3a2414, { unlit: 0.1 });
    G.add(at(box(W, 0.06, 0.04, rail), 0, 0.95, B.Z0 + 0.02)); G.add(at(box(0.04, 0.06, D, rail), B.X0 + 0.02, 0.95, ZC)); G.add(at(box(0.04, 0.06, D, rail), B.X1 - 0.02, 0.95, ZC));
    const ceil = new THREE.Mesh(new THREE.PlaneGeometry(W, D), mat({ map: ceilT, rep: [W / 1.2, D / 1.2], unlit: 0.2 })); ceil.rotation.x = PI / 2; ceil.position.set(0, H, ZC); G.add(ceil);
    for (let x = -4; x <= 4; x += 2.6) for (let z = -4; z <= 5; z += 3) G.add(at(box(0.6, 0.02, 0.6, glow(0xfff2d8, 0.9)), x, H - 0.01, z));
    // the portrait in a gilt frame, two torchiere lamps either side of it
    const [px0, py0, pz0] = B.PORTRAIT, gold = M(0xd8a83a, { unlit: 0.35 });
    const portraitMat = mat({ map: portraitT, unlit: 0.55 });
    const pic = new THREE.Mesh(new THREE.PlaneGeometry(B.PW, B.PH), portraitMat); pic.position.set(px0, py0, pz0 + 0.05); G.add(pic);
    G.add(at(box(B.PW + 0.24, 0.12, 0.08, gold), px0, py0 + B.PH / 2 + 0.06, pz0 + 0.04)); G.add(at(box(B.PW + 0.24, 0.12, 0.08, gold), px0, py0 - B.PH / 2 - 0.06, pz0 + 0.04));
    for (const s of [-1, 1]) G.add(at(box(0.12, B.PH + 0.24, 0.08, gold), px0 + s * (B.PW / 2 + 0.06), py0, pz0 + 0.04));
    const lampM = glow(0xfff4e0, 0.95), brass = M(0xb08a40, { unlit: 0.2 }), bowls = [];
    for (const [x, z] of [[-1.55, -5.15], [1.55, -5.15], [5.2, -4.9], [-5.2, 5.6]]) {
      G.add(at(cyl(0.02, 0.025, 1.75, 5, brass), x, 0.88, z)); G.add(at(cyl(0.16, 0.18, 0.03, 8, brass), x, 0.015, z));
      const bowl = at(cone(0.24, 0.16, 10, lampM), x, 1.82, z); bowl.rotation.x = PI; G.add(bowl); bowls.push(bowl);
    }
    // credenzas along the back wall, a small gold trophy on one
    const cred = M(0x3e2614, { unlit: 0.1 });
    for (const s of [-1, 1]) { G.add(at(box(2.6, 0.78, 0.5, cred), s * 3.3, 0.39, B.Z0 + 0.3)); G.add(at(box(2.62, 0.03, 0.52, M(0x2a1a0e)), s * 3.3, 0.79, B.Z0 + 0.3)); }
    G.add(at(cyl(0.06, 0.08, 0.25, 6, gold), 3.0, 0.92, B.Z0 + 0.32)); G.add(at(ico(0.1, 0, gold), 3.0, 1.1, B.Z0 + 0.32));
    // the windows with white blinds in the right wall, glowing with the day
    for (const z of [-3.2, 0, 3.2]) {
      const bl = new THREE.Mesh(new THREE.PlaneGeometry(1.7, 2.7), mat({ map: blindT, rep: [1, 2.7 / 0.6], unlit: 0.85 })); bl.position.set(B.X1 - 0.03, 2.25, z); bl.rotation.y = -PI / 2; G.add(bl);
      for (const dz of [-0.9, 0.9]) G.add(at(box(0.06, 2.8, 0.08, M(0xe8e4dc, { unlit: 0.3 })), B.X1 - 0.04, 2.25, z + dz));
      G.add(at(box(0.06, 0.08, 1.88, M(0xe8e4dc, { unlit: 0.3 })), B.X1 - 0.04, 3.63, z)); G.add(at(box(0.08, 0.06, 1.88, M(0xe8e4dc, { unlit: 0.3 })), B.X1 - 0.05, 0.88, z));
    }
    // the pink neon logo on the left wall, the door, the potted palm
    const neon = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 0.65), mat({ map: neonT, unlit: 1, transparent: true, alphaTest: 0.3 })); neon.position.set(B.X0 + 0.03, 2.75, -0.6); neon.rotation.y = PI / 2; G.add(neon);
    const door = new THREE.Mesh(new THREE.PlaneGeometry(1.15, 2.3), M(0x2e1c10, { unlit: 0.1 })); door.position.set(B.X0 + 0.03, 1.15, B.DOOR[1]); door.rotation.y = PI / 2; G.add(door);
    G.add(at(box(0.06, 0.06, 0.18, gold), B.X0 + 0.07, 1.05, B.DOOR[1] - 0.42));
    const pot = M(0x8a5a3a), leaf = M(0x3a7a3a, { unlit: 0.1 });
    G.add(at(cyl(0.32, 0.26, 0.6, 8, pot), B.PALM[0], 0.3, B.PALM[1]));
    for (let i = 0; i < 9; i++) { const a = i / 9 * TAU, l = at(box(0.16, 0.04, 1.0, leaf), B.PALM[0] + Math.sin(a) * 0.45, 1.55 + 0.25 * hash(i, 7), B.PALM[1] + Math.cos(a) * 0.45); l.rotation.set(0.5, a, 0); G.add(l); }
    G.add(at(cyl(0.05, 0.06, 1.3, 5, M(0x6a4a2a)), B.PALM[0], 1.0, B.PALM[1]));

    // ---------- the table: a blue-grey marble top on two pedestals ----------
    const TL = B.TZ1 - B.TZ0, TC = (B.TZ0 + B.TZ1) / 2;
    G.add(at(box(B.TX * 2, 0.06, TL, mat({ map: marbleT, rep: [1.5, TL / 1.2], unlit: 0.12 })), 0, B.TY - 0.03, TC));
    G.add(at(box(B.TX * 2 + 0.02, 0.03, TL + 0.02, M(0x5a6a76)), 0, B.TY - 0.075, TC));
    for (const z of [B.TZ0 + 1.0, B.TZ1 - 1.0]) G.add(at(box(0.5, B.TY - 0.09, 0.9, M(0x3a4048)), 0, (B.TY - 0.09) / 2, z));
    // the chairs: black leather, high backs; the CEO's bigger one at the head
    const leather = M(0x3a3236, { unlit: 0.06 }), seam = M(0x5a4a4e, { unlit: 0.1 });
    function chair(x, z, yaw, big) {
      const c = at(new THREE.Group(), x, 0, z); c.rotation.y = yaw; G.add(c);
      const w = big ? 0.66 : 0.52, bh = big ? 1.05 : 0.72;
      c.add(at(box(w, 0.1, w, leather), 0, B.SEAT_Y - 0.05, 0)); c.add(at(box(w, bh, 0.1, leather), 0, B.SEAT_Y + bh / 2, -w / 2 + 0.03));
      for (let k = 1; k < 4; k++) c.add(at(box(w * 0.85, 0.015, 0.012, seam), 0, B.SEAT_Y + bh * k / 4, -w / 2 + 0.085));   // tufted seams: a back that reads as a chair, not a slab
      c.add(at(cyl(0.035, 0.035, B.SEAT_Y - 0.12, 5, M(0x8a8a90)), 0, (B.SEAT_Y - 0.12) / 2 + 0.06, 0));
      for (let i = 0; i < 5; i++) { const a = i / 5 * TAU, l = at(box(0.05, 0.04, 0.3, M(0x2a2a2e)), Math.sin(a) * 0.14, 0.05, Math.cos(a) * 0.14); l.rotation.y = a; c.add(l); }
      if (big) for (const s of [-1, 1]) c.add(at(box(0.08, 0.06, 0.45, leather), s * (w / 2 + 0.02), B.SEAT_Y + 0.22, 0));
      return c;
    }
    const chairs = B.SEATS.map(([x, z]) => chair(x, z, x < 0 ? PI / 2 : -PI / 2, false));
    const headChair = chair(B.HEAD[0], B.HEAD[1], 0, true);

    // ---------- the things on the table ----------
    const glassM = mat({ color: 0xcfe8f4, unlit: 0.4, see: 0.35 }), waterM = mat({ color: 0x6ab8e8, unlit: 0.5, see: 0.2 });
    const mkGlass = () => { const g = new THREE.Group(); g.add(at(cyl(0.055, 0.045, 0.2, 8, glassM), 0, 0.1, 0)); g.add(at(cyl(0.048, 0.042, 0.13, 8, waterM), 0, 0.07, 0)); return g; };
    const mkVase = () => {
      const g = new THREE.Group(); g.add(at(cyl(0.11, 0.08, 0.32, 8, glassM), 0, 0.16, 0));
      const red = M(0xe0283a, { unlit: 0.4 }), stem = M(0x3a8a3a, { unlit: 0.2 });
      for (let i = 0; i < 7; i++) { const a = i / 7 * TAU, r = i ? 0.09 : 0; g.add(at(cyl(0.008, 0.008, 0.3, 3, stem), Math.sin(a) * r * 0.6, 0.42, Math.cos(a) * r * 0.6)); g.add(at(ico(0.06, 0, red), Math.sin(a) * r, 0.58 + 0.04 * hash(i, 3), Math.cos(a) * r)); }
      return g;
    };
    const mkMug = () => { const g = new THREE.Group(); g.add(at(cyl(0.06, 0.055, 0.13, 8, mat({ map: logoT, unlit: 0.4 })), 0, 0.065, 0)); g.add(at(box(0.025, 0.07, 0.055, M(0xf8f8f6, { unlit: 0.4 })), 0.075, 0.07, 0)); g.add(at(cyl(0.05, 0.05, 0.01, 8, glow(0x3a1a0c, 0.7)), 0, 0.12, 0)); return g; };
    const paperM = M(0xf6f4ee, { unlit: 0.45 });
    const mkPapers = () => { const g = new THREE.Group(); for (let i = 0; i < 6; i++) g.add(at(rot(box(0.3, 0.012, 0.4, paperM), 0, 0.08 * (i % 3 - 1), 0), 0, 0.008 + i * 0.012, 0)); return g; };
    const items = {};
    B.GLASSES.forEach((p, i) => { items['g' + i] = { g: mkGlass(), base: p, kind: 'water' }; });
    items.vase = { g: mkVase(), base: B.VASE, kind: 'roses' };
    B.MUGS.forEach((p, i) => { items['m' + i] = { g: mkMug(), base: p, kind: 'coffee' }; });
    items.papers = { g: mkPapers(), base: B.PAPERS, kind: 'papers' };
    Object.values(items).forEach(it => G.add(it.g));
    const phone = at(new THREE.Group(), -0.15, B.TY, 1.0); G.add(phone);
    { const tri = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.2, 0.05, 3), M(0x1a1a1e)); tri.position.y = 0.025; phone.add(tri); phone.add(at(cyl(0.05, 0.05, 0.012, 6, glow(0x3a8ad8, 0.6)), 0, 0.055, 0)); }
    // the cake: two red velvet tiers with white frosting drips and a gold G; the paw dents
    const cake = at(new THREE.Group(), B.CAKE[0], B.CAKE_Y, B.CAKE[1]); G.add(cake);
    const redV = M(0xb8202c, { unlit: 0.3 }), frost = M(0xfaf6f0, { unlit: 0.45 });
    cake.add(at(cyl(0.26, 0.26, 0.2, 12, redV), 0, 0.1, 0)); cake.add(at(cyl(0.265, 0.265, 0.03, 12, frost), 0, 0.205, 0));   // one tier, its top at 0.22: two tiers stood higher than the half-size kitten's paws
    for (let i = 0; i < 12; i++) { const a = i / 12 * TAU, drip = at(box(0.04, 0.05 + 0.04 * hash(i, 5), 0.02, frost), Math.sin(a) * 0.263, 0.17, Math.cos(a) * 0.263); drip.rotation.y = a; cake.add(drip); }
    cake.add(at(cyl(0.25, 0.25, 0.012, 12, M(0xe8d8b8, { unlit: 0.4 })), 0, 0.006, 0));   // the board under it
    const gMat = mat({ map: tex(16, 16, x => { x.clearRect(0, 0, 16, 16); x.fillStyle = '#f2c43a'; x.font = 'bold 15px serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('G', 8, 9); }, 4509), unlit: 0.8, transparent: true, alphaTest: 0.4 });
    const gTops = [];
    for (const ry of [0, PI]) { const gTop = new THREE.Mesh(new THREE.PlaneGeometry(0.18, 0.18), gMat); gTop.position.set(0, 0.33, ry ? -0.003 : 0.003); gTop.rotation.y = ry; cake.add(gTop); gTops.push(gTop); }   // back to back: one plane double-sided read mirrored from the head of the table
    const dents = new THREE.Group(); cake.add(dents);
    for (const s of [-1, 1]) { const d = at(ico(0.075, 0, M(0x5a0810, { unlit: 0.2 })), s * 0.07, 0.218, 0.15); d.scale.set(1, 0.3, 1.15); dents.add(d); }   // two paw-deep holes dug into the frosting at the edge on her side
    for (let i = 0; i < 7; i++) { const a = -1.2 + i * 0.4; dents.add(at(ico(0.03 + 0.01 * (i % 2), 0, i % 3 ? frost : redV), Math.sin(a) * 0.2, 0.235, 0.12 + Math.cos(a) * 0.08)); }   // frosting thrown up round the holes
    for (let i = 0; i < 9; i++) { const a = i / 9 * TAU; dents.add(at(ico(0.025 + 0.012 * (i % 3), 0, i % 3 ? frost : redV), Math.sin(a) * (0.2 + 0.08 * hash(i, 9)), 0.02, 0.24 + Math.cos(a) * 0.12)); }   // frosting and crumbs flung on the table in front of it
    // the kitten's red velvet cushion with gold tassels
    const cush = at(new THREE.Group(), B.CUSHION[0], B.TY, B.CUSHION[1]); G.add(cush);
    { cush.add(at(box(0.52, 0.1, 0.52, M(0xc81830, { unlit: 0.25 })), 0, 0.05, 0)); for (const [x, z] of [[-1, -1], [-1, 1], [1, -1], [1, 1]]) cush.add(at(ico(0.03, 0, gold), x * 0.27, 0.06, z * 0.27)); }

    // ---------- messes on the floor (a pool: the static ones and the knocked things once they land) ----------
    const puddleM = mat({ color: 0x7ac0e8, unlit: 0.45, see: 0.3 }), coffeeM = mat({ color: 0x4a2a14, unlit: 0.3 }), shardM = glow(0xeaf6fc, 0.8);
    function mkMess(kind) {
      const g = new THREE.Group(); g.visible = false; G.add(g);
      const pud = flat(1, 1, kind === 'coffee' ? coffeeM : puddleM, 0, 0.012, 0); pud.renderOrder = 1; g.add(pud); g.userData.pud = pud;
      if (kind === 'water') { const gl = mkGlass(); gl.rotation.z = PI / 2; gl.position.set(0.12, 0.055, 0.05); g.add(gl); for (let i = 0; i < 5; i++) g.add(rot(at(box(0.05, 0.01, 0.03, shardM), Math.sin(i * 2.1) * 0.18, 0.02, Math.cos(i * 2.1) * 0.15), 0, i, 0)); }
      if (kind === 'roses') { const v = mkVase(); v.rotation.z = PI / 2; v.position.set(0.0, 0.1, 0); g.add(v); const red = M(0xe0283a, { unlit: 0.4 }); for (let i = 0; i < 6; i++) g.add(at(ico(0.06, 0, red), 0.35 + 0.25 * Math.cos(i * 1.7), 0.05, 0.3 * Math.sin(i * 1.7))); }
      if (kind === 'coffee') { const m = mkMug(); m.rotation.z = PI / 2; m.position.set(0.1, 0.06, 0); g.add(m); }
      if (kind === 'papers') for (let i = 0; i < 7; i++) g.add(rot(at(box(0.3, 0.008, 0.4, paperM), Math.cos(i * 1.3) * 0.35, 0.01 + i * 0.003, Math.sin(i * 1.3) * 0.3), 0, i * 0.9, 0));
      return g;
    }
    const pool = { water: [], roses: [], coffee: [], papers: [] };
    for (const kd of Object.keys(pool)) for (let i = 0; i < 6; i++) pool[kd].push(mkMess(kd));
    const dropM = mat({ color: 0x8ad0f4, unlit: 0.6 }), drops = Array.from({ length: 24 }, () => { const d = box(0.03, 0.03, 0.03, dropM); d.visible = false; G.add(d); return d; });

    // ---------- the board: box pets in suits ----------
    const FURS = [0xd8b080, 0x8a8a92, 0xf2eee6, 0x5a4030, 0xe8a058, 0x3a3a40, 0xc8c0b0, 0xa87a54];
    const SUITS = [0x2a3040, 0x3a3a42, 0x1e2838, 0x3a2e2a, 0x2a3040, 0x40404a, 0x1e2838, 0x3a3a42];
    function member(i) {
      const fur = M(FURS[i]), suit = M(SUITS[i], { unlit: 0.12 }), kind = i % 3;
      const g = new THREE.Group(), body = new THREE.Group(); g.add(body);
      const legs = [-1, 1].map(sx => { const l = at(new THREE.Group(), sx * 0.1, 0.3, 0); l.add(at(box(0.13, 0.3, 0.13, M(0x22242a)), 0, -0.15, 0)); body.add(l); return l; });
      body.add(at(box(0.4, 0.38, 0.28, suit), 0, 0.5, 0));
      body.add(at(box(0.14, 0.34, 0.01, M(0xf4f4f0)), 0, 0.5, 0.142)); body.add(at(box(0.05, 0.24, 0.012, M(i % 2 ? 0xc81830 : 0x2a5ad8)), 0, 0.48, 0.15));
      const arms = [-1, 1].map(sx => { const a = at(new THREE.Group(), sx * 0.23, 0.64, 0); a.add(at(box(0.09, 0.28, 0.09, suit), 0, -0.12, 0)); a.add(at(box(0.08, 0.08, 0.08, fur), 0, -0.28, 0)); body.add(a); return a; });
      const head = at(new THREE.Group(), 0, 0.92, 0); body.add(head);
      const skull = ico(0.24, 1, fur); skull.scale.set(1, 0.9, 0.92); head.add(skull);
      const snout = at(ico(0.09, 1, M(0xf0e6d8)), 0, -0.07, 0.19); snout.scale.set(1.1, 0.75, 0.8); head.add(snout);
      head.add(at(ico(0.03, 0, M(0x2a1a1a)), 0, -0.03, 0.27));
      for (const e of [-1, 1]) {
        head.add(at(ico(0.04, 0, M(0x0e0e0e)), e * 0.1, 0.05, 0.19)); head.add(at(ico(0.012, 0, glow(0xffffff)), e * 0.1 + 0.012, 0.065, 0.225));
        if (kind === 0) head.add(rot(at(cone(0.1, 0.2, 4, fur), e * 0.14, 0.26, 0), 0, 0, -e * 0.3));                       // a cat
        else if (kind === 1) head.add(rot(at(box(0.1, 0.26, 0.05, fur), e * 0.2, 0.0, 0), 0, 0, e * 0.25));                // a dog's floppy ears
        else head.add(rot(at(box(0.08, 0.34, 0.05, fur), e * 0.09, 0.36, 0), 0, 0, -e * 0.12));                            // a bunny
      }
      const mouth = at(box(0.1, 0.07, 0.02, M(0x5a1a1a)), 0, -0.14, 0.25); mouth.visible = false; head.add(mouth);
      return { g, body, head, arms, legs, mouth, i };
    }
    const members = B.SEATS.map((_, i) => { const q = member(i); G.add(q.g); return q; });
    const heartM = M(0xff4f9a, { unlit: 0.8 }), hearts = [];
    for (let i = 0; i < 15; i++) { const h = new THREE.Group(); h.add(at(ico(0.1, 0, heartM), -0.075, 0, 0)); h.add(at(ico(0.1, 0, heartM), 0.075, 0, 0)); h.add(rot(at(cone(0.125, 0.18, 4, heartM), 0, -0.11, 0), PI, 0, 0)); h.visible = false; G.add(h); hearts.push(h); }
    const confG = new THREE.Group(); G.add(confG);
    const confAnim = fall(confG, 70, mat({ color: 0xf2c43a, unlit: 0.7, side: THREE.DoubleSide }), new THREE.PlaneGeometry(0.07, 0.05), { w: 5, top: 4.2, speed: 1.1, spin: 4, drift: 0.3, seed: 45 });
    const confG2 = new THREE.Group(); G.add(confG2);
    const confAnim2 = fall(confG2, 50, mat({ color: 0xe0283a, unlit: 0.7, side: THREE.DoubleSide }), new THREE.PlaneGeometry(0.07, 0.05), { w: 5, top: 4.2, speed: 1.0, spin: 5, drift: 0.3, seed: 46 });

    const cleared = (P, x, z) => (P.clear || []).some(([cx, cz, r]) => (x - cx) ** 2 + (z - cz) ** 2 < r * r);
    const TLAND = Math.sqrt(2 * B.TY / 9.8), _ax = new THREE.Vector3();
    return {
      group: G, sky: null, shadowCol: 0x2a0c10, indoor: true, portraitMat,
      light() { lights(0xa88a74, 0xfff0dc, [0.6, -0.8, -0.2], 0x2a1a14, [12, 40], 8); },
      anim(t, P = {}) {
        const s = shotT(t, P), hide = new Set(P.hide || []), tf = P.stop != null && s >= P.stop ? t - (s - P.stop) : t, bt = beat(tf);   // tf: frozen from `stop` (the photo)
        lights(0xa88a74, 0xfff0dc, [0.6, -0.8, -0.2], 0x2a1a14, [12, 40], 8);
        pt(0, -1.55, 1.9, -4.7, 1.0, 0.82, 0.6); pt(1, 1.55, 1.9, -4.7, 1.0, 0.82, 0.6); pt(2, 0, 3.4, 0.2, 1.05, 0.95, 0.85); pt(3, 4.8, 2.4, 0.4, 0.75, 0.85, 1.0);
        if (P.key) pt(2, P.key[0], P.key[1], P.key[2], P.key[3], P.key[4], P.key[5]);
        // the table's things and the knocked ones: slide, fall off the edge tipping, land as a mess with a splash
        Object.values(pool).forEach(a => a.forEach(m => { m.visible = false; }));
        const used = { water: 0, roses: 0, coffee: 0, papers: 0 };
        const putMess = (kind, x, z, yaw, grow) => { const m = pool[kind][used[kind]++]; if (!m) return; m.visible = true; m.position.set(x, 0, z); m.rotation.y = yaw; const r = (kind === 'roses' ? 0.55 : 0.42) * grow; m.userData.pud.scale.set(Math.max(0.01, r * 1.6), Math.max(0.01, r), 1); m.userData.pud.visible = kind !== 'papers'; };
        (P.mess || []).forEach(([kind, x, z, yaw = 0]) => { if (pool[kind]) putMess(kind, x, z, yaw * PI / 180, 1); });
        drops.forEach(d => { d.visible = false; }); let di = 0;
        for (const [key, it] of Object.entries(items)) {
          const g = it.g, gone = hide.has(key) || (key[0] === 'g' && hide.has('glasses')) || (key[0] === 'm' && hide.has('mugs'));
          const kq = (P.knock || []).find(q => q[0] === key);
          g.visible = !gone; if (gone) continue;
          const [bx, bz] = it.base;
          if (!kq || s < kq[1]) { g.position.set(bx, B.TY, bz); g.rotation.set(0, 0, 0); continue; }
          const [, s0, dx, dz, slide = 0.3] = kq, n = Math.hypot(dx, dz) || 1, ux = dx / n, uz = dz / n, e = s - s0;
          const sl = cl(e / 0.2), f = Math.max(0, e - 0.2), d = slide * sl + 0.9 * Math.min(f, 0.35);
          if (f < TLAND) {
            g.position.set(bx + ux * d, B.TY - 4.9 * f * f, bz + uz * d);
            g.rotation.set(0, 0, 0); g.rotateOnWorldAxis(_ax.set(uz, 0, -ux), Math.min(PI / 2, f * 6));
          } else {
            g.visible = false;
            const dl = slide + 0.9 * Math.min(TLAND, 0.35), lx = bx + ux * dl, lz = bz + uz * dl, le = f - TLAND;
            putMess(it.kind, lx + ux * 0.15, lz + uz * 0.15, Math.atan2(ux, uz), cl(le / 0.3));
            if (le < 0.5 && it.kind !== 'papers') for (let j = 0; j < 8 && di < drops.length; j++, di++) {   // the splash: drops thrown up and out
              const a = j / 8 * TAU + key.length, sp = 0.9 + 0.5 * hash(j, key.length), dd = drops[di];
              dd.visible = true; dd.position.set(lx + Math.sin(a) * sp * le, 0.02 + 2.2 * le - 4.9 * le * le, lz + Math.cos(a) * sp * le); dd.scale.setScalar(1.6 - le);
              if (dd.position.y < 0.01) dd.visible = false;
            }
          }
        }
        phone.visible = !hide.has('phone'); cake.visible = !hide.has('cake'); cush.visible = !hide.has('cushion');
        gTops.forEach(q => { q.visible = !hide.has('topper'); });   // the gold G (knocked off in the payoff: it stood between the camera and her paws)
        dents.visible = P.cakePaws != null && s >= P.cakePaws;
        bowls.forEach((b, i) => b.scale.setScalar(1 + 0.04 * Math.sin(tf * 13 + i * 2)));
        // the board members
        chairs.forEach((c, i) => { c.visible = !P.bstand && !cleared(P, B.SEATS[i][0], B.SEATS[i][1]); });   // standing, they pushed their chairs away (the chair backs hid them)   // a cleared seat loses its chair too: a lens looking through the chairs
        const modes = P.bmode || Array(8).fill(P.board ?? 'sit');
        members.forEach((q, i) => {
          const mode = modes[i]; const [sx, sz] = B.SEATS[i];
          q.g.visible = !!mode && !cleared(P, sx, sz); if (!q.g.visible) return;
          q.body.position.set(0, 0, 0); q.body.rotation.set(0, 0, 0); q.head.rotation.set(0, 0, 0); q.mouth.visible = false;
          q.arms.forEach(a => a.rotation.set(0, 0, 0)); q.legs.forEach(l => l.rotation.set(0, 0, 0));
          const out = sx < 0 ? -1 : 1, yaw = out < 0 ? PI / 2 : -PI / 2, ph = bt + i * 0.13, stand = !!P.bstand;
          q.g.position.set(stand ? out * 1.12 : sx, 0, sz); q.g.rotation.y = yaw;
          if (!stand) { q.body.position.y = B.SEAT_Y - 0.3; q.legs.forEach(l => { l.rotation.x = -PI / 2; }); }
          if (P.stare && mode !== 'point') { const a = Math.atan2(P.stare[0] - sx, P.stare[1] - sz) - yaw; q.head.rotation.y = Math.max(-1.2, Math.min(1.2, Math.atan2(Math.sin(a), Math.cos(a)))); }
          if (mode === 'sit') { q.arms.forEach((a, j) => { a.rotation.x = -1.2; a.rotation.z = (j ? 1 : -1) * 0.1; }); q.body.rotation.z = 0.03 * Math.sin(tf * 1.3 + i); }
          else if (mode === 'clap') { const c = Math.abs(Math.sin(ph * PI)); q.arms.forEach((a, j) => { a.rotation.x = -1.35; a.rotation.z = (j ? -1 : 1) * (0.25 + 0.35 * c); }); }
          else if (mode === 'gasp') { q.arms.forEach((a, j) => { a.rotation.x = -2.45; a.rotation.z = (j ? 1 : -1) * 0.12; }); q.mouth.visible = true; q.body.rotation.x = -0.12; }
          else if (mode === 'stare') { q.mouth.visible = true; q.arms.forEach((a, j) => { a.rotation.x = -1.2; a.rotation.z = (j ? 1 : -1) * 0.1; }); }
          else if (mode === 'point') { const pa = P.pointAt || [0, 0]; let la = Math.atan2(pa[0] - sx, pa[1] - sz) - yaw; la = Math.atan2(Math.sin(la), Math.cos(la)); const j = la > 0 ? 1 : 0; q.arms[j].rotation.set(-0.35 * Math.cos(la), 0, (j ? 1 : -1) * 1.45); q.arms[1 - j].rotation.x = -1.2; q.head.rotation.y = Math.max(-1.1, Math.min(1.1, la * 0.8)); q.mouth.visible = true; }
          else if (mode === 'cheer') { q.arms.forEach((a, j) => { a.rotation.z = (j ? 1 : -1) * 2.45; }); q.mouth.visible = true; q.body.position.y += 0.04 * Math.abs(Math.sin(bt * PI)); }
          else if (mode === 'dance') { const up = Math.abs(Math.sin(ph * PI)); q.body.rotation.z = 0.12 * Math.sin(ph * PI); q.arms.forEach((a, j) => { a.rotation.x = -0.6 - 1.4 * up; a.rotation.z = (j ? 1 : -1) * (0.35 + 0.2 * up); }); if (stand) { q.body.position.y = 0.05 * up; q.legs.forEach((l, j) => { l.rotation.x = 0.3 * Math.sin(ph * PI + j * PI); }); } }
          else if (mode === 'swoon') { q.head.rotation.z = 0.35 * Math.sin(tf * 2 + i); q.arms.forEach((a, j) => { a.rotation.x = -1.0; a.rotation.z = (j ? -1 : 1) * 0.55; }); }
        });
        // hearts over points: three pink hearts popping and rising (looping when q[4])
        hearts.forEach((h, i) => {
          const q = (P.hearts || [])[Math.floor(i / 3)]; h.visible = false; if (!q) return;
          let e = s - q[3] - (i % 3) * 0.3; if (q[4] && e > 0) e %= 1.2;
          if (e < 0 || e > 1.4) return;
          h.visible = true; h.position.set(q[0] + ((i % 3) - 1) * 0.22 + 0.06 * Math.sin(e * 6 + i), q[1] + 0.55 * e, q[2]); h.scale.setScalar(Math.min(1, e * 5) * (1.15 - 0.25 * (e / 1.4)));
          h.rotation.y = (P.heartYaw ?? 0) * PI / 180;
        });
        const cf = P.confetti != null && s >= P.confetti; confG.visible = confG2.visible = cf;
        if (cf) { confAnim(tf); confAnim2(tf); const [ccx, ccz] = P.confAt || [0, -0.6]; confG.position.set(ccx, 0, ccz); confG2.position.set(ccx, 0, ccz); }
      },
    };
  }

  return { boardroom: boardroom() };
}
