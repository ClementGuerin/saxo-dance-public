// maps9.js: the "Die Young" maps (2026-09-26, Kesha; the clip's world: a dusty desert village by night, a black vintage
// car rolling in, and a wild party hidden in an old chapel, backlit by white light columns and a glowing triangle).
// Same contract as the other map files, pure in t:
//   chapel   the old adobe chapel turned into a club at night: whitewashed walls, a wooden-beam ceiling, stained glass
//            glowing with moonlight, the altar as the stage (top at CHAPEL.STAGE, front face at STAGE_Z) with a DJ table
//            at the back, four white light columns and a pink neon triangle behind it, candles along the stage lip, dry
//            ice rolling off it, a mirror ball, papel picado across the room, a bar along the left wall (counter top at
//            BAR_TOP, the bartender's spot at KOB on a duckboard DECK m up, so her waistcoat shows over the counter), the open door in the right wall (DOOR, standing spot DOOR_IN) onto
//            the moonlit street, and pet party guests. Shot flags read by anim(t, P): `hush` (cut seconds: the music's
//            break: the washes and the strobe die, the guests stop dead, one white spotlight falls on `spot` [x, z]),
//            `look` ([x, z]: every guest turns to face that point), `part` (cut seconds: the guests step out of the lane
//            from the door to the stage), `half` (the half-time chorus: the guests sway, the strobe on every other
//            beat), `confetti` (cut seconds: the stage cannons fire), `doorBright` (the doorway blazes: someone stands in
//            it against the light), `pit` (a front row of guests facing the stage), `armsUp` ([a, b] cut s: every guest's
//            arms up), `noguests`, `dj` (false hides the DJ).
//   village  the desert village street at night: packed dirt, flat-roofed adobe houses in whitewash and pastels with lit
//            windows and wooden vigas, string lights and papel picado across the street, a fruit stall with a striped
//            awning, cacti and agaves, the long black 1960s car (CAR), and at the far end the chapel's white facade with
//            its bell gable, the open door blazing pink and white (the party), a neon triangle over it, lanterns and the
//            velvet rope (the bouncer's spot at BOUNCER). Desert hills, a big moon and stars beyond. Flags: `thump` (the
//            chapel's door and windows pulse with the party's beat; default on), `hush` (cut seconds: the party inside
//            goes quiet), `carDoor` (the car's rear door open), `fruit` (oranges scattered on the ground by the stall).
import { mapKit } from './mapkit.js';

export const CHAPEL = { STAGE: 0.6, STAGE_Z: -4.6, BAR_X: -4.75, BAR_TOP: 0.45, BAR_Z: [-1.4, 2.8], KOB: [-5.2, 0.9], DECK: 0.15, DOOR: [6.5, 3.0], DOOR_IN: [5.75, 3.0], DJ: [0, -7.9] };
export const VILLAGE = { DOOR: [0, -14], ROPE_Z: -12.8, BOUNCER: [1.55, -12.55], CAR: [2.75, -6.2], STALL: [-3.2, -2.4], HX: 4.7 };

export function buildDieYoungMaps(K) {
  const k = mapKit(K);
  const { THREE, mat, tex, px, noise, box, U, TAU, PI, hash, fr, hit, beatN, beat, grad, sign, cyl, cone, sph, ico, at, rot, flat, lights, pt, room, stars } = k;
  const M = (c, o = {}) => mat({ color: c, ...o }), glow = c => mat({ color: c, unlit: 1 });
  const sm = x => { const u = Math.min(1, Math.max(0, x)); return u * u * (3 - 2 * u); };
  const pmod = (a, n) => ((a % n) + n) % n;

  // ---------- shared pieces ----------
  // papel picado: a string of cut-paper flags between two points, fluttering
  function picado(G, a, b, n, seed, flags) {
    const cols = [0xff4f8b, 0x39c8e8, 0xffd23f, 0x7ad84a, 0xff8a2a, 0xb45aff];
    const strM = M(0xf0f0f0); const dx = b[0] - a[0], dz = b[2] - a[2], L = Math.hypot(dx, dz);
    const s = at(box(L, 0.012, 0.012, strM), (a[0] + b[0]) / 2, a[1], (a[2] + b[2]) / 2); s.rotation.y = -Math.atan2(dz, dx); G.add(s);
    const cutT = tex(8, 8, x => { px(x, '#ffffff', 0, 0, 8, 8); for (const [X, Y] of [[1, 2], [4, 2], [2, 5], [5, 5]]) x.clearRect(X, Y, 2, 1); x.clearRect(0, 7, 1, 1); x.clearRect(2, 7, 1, 1); x.clearRect(4, 7, 1, 1); x.clearRect(6, 7, 1, 1); });
    for (let i = 0; i < n; i++) {
      const u = (i + 0.5) / n, m = mat({ color: cols[(i + seed) % cols.length], map: cutT, unlit: 0.35, side: THREE.DoubleSide });
      const f = new THREE.Mesh(new THREE.PlaneGeometry(0.3, 0.38), m); f.geometry.translate(0, -0.19, 0);
      const g = new THREE.Group(); g.position.set(a[0] + dx * u, a[1] - 0.25 * Math.sin(u * PI), a[2] + dz * u); g.rotation.y = -Math.atan2(dz, dx); g.add(f); G.add(g);
      flags.push({ g, ph: hash(i, seed) * TAU });
    }
  }
  const flutter = (flags, t) => flags.forEach(({ g, ph }) => { g.children[0].rotation.x = 0.25 * Math.sin(t * 2.6 + ph) + 0.1 * Math.sin(t * 5.1 + ph * 2); });
  // a triangle outline of glowing bars (the clip's neon triangle), upright, centred at (0, 0)
  function neonTri(side, th, m) {
    const g = new THREE.Group(), R = side / Math.sqrt(3);
    for (let i = 0; i < 3; i++) {
      const a0 = PI / 2 + i * TAU / 3, a1 = a0 + TAU / 3, x0 = Math.cos(a0) * R, y0 = Math.sin(a0) * R, x1 = Math.cos(a1) * R, y1 = Math.sin(a1) * R;
      const b = at(box(side + th, th, th, m), (x0 + x1) / 2, (y0 + y1) / 2, 0); b.rotation.z = Math.atan2(y1 - y0, x1 - x0); g.add(b);
    }
    return g;
  }
  // a pet party guest: a dark outfit with neon accents, a glow stick in each paw; jumps on the beat
  const FURS = [0xd8c2a0, 0x3a2e28, 0xf2eee6, 0x9a7a5a, 0x6a6a72, 0xe8a060, 0x2a2a30, 0xc8b8e0];
  const OUT = [0x1a1a22, 0x2a2438, 0x14141a, 0x3a1a3a, 0x1a2a3a, 0x3a1420];
  const NEON = [0x39ff6a, 0xff3fd8, 0x3fd4ff, 0xffe23f];
  function guest(i) {
    const g = new THREE.Group(), fur = M(FURS[i % FURS.length]), out = M(OUT[(i * 5) % OUT.length]), neon = glow(NEON[i % NEON.length]), kind = i % 3;
    g.add(at(box(0.36, 0.34, 0.26, out), 0, 0.3, 0));
    g.add(at(box(0.37, 0.05, 0.27, neon), 0, 0.2, 0));
    for (const s of [-1, 1]) g.add(at(box(0.11, 0.14, 0.12, fur), s * 0.1, 0.07, 0.02));
    const head = at(box(0.46, 0.4, 0.4, fur), 0, 0.68, 0); g.add(head);
    head.add(at(box(0.16, 0.1, 0.1, M(0x1a1a1a)), 0, -0.06, 0.2));
    for (const s of [-1, 1]) {
      head.add(at(box(0.07, 0.07, 0.02, M(0x101010)), s * 0.11, 0.04, 0.205));
      head.add(kind === 0 ? rot(at(cone(0.08, 0.2, 4, fur), s * 0.15, 0.27, 0), 0, 0, -s * 0.25)
        : kind === 1 ? at(box(0.08, 0.3, 0.06, fur), s * 0.1, 0.33, 0) : rot(at(box(0.07, 0.24, 0.16, fur), s * 0.25, -0.02, 0), 0, 0, s * 0.35));
    }
    if (i % 4 === 1) head.add(at(box(0.36, 0.07, 0.03, glow(0xff3fd8)), 0, 0.06, 0.215));
    if (i % 5 === 3) head.add(at(box(0.5, 0.06, 0.06, M(0xffd23f)), 0, 0.22, 0));   // a gold headband
    const arms = [-1, 1].map(s => { const a = new THREE.Group(); a.position.set(s * 0.21, 0.44, 0); a.add(at(box(0.09, 0.28, 0.09, out), 0, -0.13, 0)); a.add(at(box(0.04, 0.2, 0.04, neon), 0, -0.32, 0.02)); g.add(a); return a; });
    return { g, head, arms, i };
  }

  // =====================================================================================================================
  function chapel() {
    const G = new THREE.Group(), S = CHAPEL.STAGE, SZ = CHAPEL.STAGE_Z, W = 13, D = 18, H = 7, CZ = -0.5;
    // ---- the shell: terracotta floor tiles, whitewashed adobe, a wooden ceiling on dark beams ----
    const floorT = tex(32, 32, (x, r) => { px(x, '#8a4a36', 0, 0, 32, 32); noise(x, r, 32, 32, ['#7e4332', '#94523c', '#864834'], 240); px(x, '#6a3a2c', 0, 15, 32, 1); px(x, '#6a3a2c', 15, 0, 1, 32); px(x, '#6a3a2c', 0, 31, 32, 1); px(x, '#6a3a2c', 31, 0, 1, 32); }, 901);
    G.add(flat(W, D, mat({ map: floorT, rep: [W / 2.2, D / 2.2] }), 0, 0, CZ));
    const wallT = tex(32, 32, (x, r) => { px(x, '#d8cfc0', 0, 0, 32, 32); noise(x, r, 32, 32, ['#cfc5b4', '#e0d8ca', '#c8bca8', '#d2c8b6'], 260); x.strokeStyle = '#b8ac98'; x.lineWidth = 1; x.beginPath(); x.moveTo(3, 30); x.lineTo(7, 24); x.lineTo(6, 19); x.moveTo(22, 2); x.lineTo(25, 8); x.stroke(); }, 902);
    room(G, W, D, H, wallT, 2.4, null, { cz: CZ });
    const woodT = tex(16, 16, (x, r) => { px(x, '#4a2e1e', 0, 0, 16, 16); noise(x, r, 16, 16, ['#3e2618', '#553522', '#46291a'], 70); for (let y = 0; y < 16; y += 4) px(x, '#2e1c12', 0, y, 16, 1); }, 903);
    const ceil = new THREE.Mesh(new THREE.PlaneGeometry(W, D), mat({ map: woodT, rep: [W / 1.5, D / 1.5] })); ceil.rotation.x = PI / 2; G.add(at(ceil, 0, H, CZ));
    const beamM = M(0x2e1c12); for (let z = -8.5; z <= 7.5; z += 2.0) G.add(at(box(W, 0.3, 0.3, beamM), 0, H - 0.16, z));
    G.add(at(box(0.36, 0.36, D, beamM), 0, H - 0.2, CZ));
    // a dark skirting band so the floor reads against the walls
    for (const s of [-1, 1]) G.add(at(box(0.04, 0.35, D, M(0x6a4a3a)), s * (W / 2 - 0.02), 0.175, CZ));
    G.add(at(box(W, 0.35, 0.04, M(0x6a4a3a)), 0, 0.175, CZ - D / 2 + 0.02));
    // ---- stained glass: tall arched windows glowing with moonlight (and a round one over the triangle) ----
    const glassT = tex(16, 32, (x, r) => {
      px(x, '#1a1420', 0, 0, 16, 32);
      const C = ['#3a6ad8', '#d8343a', '#e8c23a', '#3aa85a', '#8a4ad8', '#3ac8d8'];
      for (let y = 1; y < 31; y += 4) for (let X = 1; X < 15; X += 5) px(x, C[Math.floor(r() * C.length)], X, y, 4, 3);
      for (let y = 0; y < 8; y++) for (let X = 0; X < 16; X++) if ((X - 7.5) ** 2 + (8 - y) ** 2 > 64) x.clearRect(X, y, 1, 1);   // the arched top
    }, 904);
    const glassM = mat({ map: glassT, unlit: 0.75 });
    for (const [s, z] of [[-1, -6.5], [-1, -2.6], [1, -6.5], [1, -2.6], [1, 6.4], [-1, 6.4]]) {
      const w = rot(at(new THREE.Mesh(new THREE.PlaneGeometry(1.1, 2.3), glassM), s * (W / 2 - 0.03), 3.6, z), 0, -s * PI / 2, 0); G.add(w);
      G.add(rot(at(box(0.06, 0.1, 1.3, M(0x6a5a4a)), s * (W / 2 - 0.05), 2.42, z), 0, 0, 0));
    }
    // ---- the altar stage: a wooden platform, two steps down at its centre, candles along the lip ----
    const stageT = tex(16, 16, (x, r) => { px(x, '#3a2418', 0, 0, 16, 16); noise(x, r, 16, 16, ['#321f14', '#43291b'], 60); for (let X = 0; X < 16; X += 4) px(x, '#24160e', X, 0, 1, 16); }, 905);
    G.add(at(box(7.4, S, 4.2, mat({ map: stageT, rep: [3, 2] })), 0, S / 2, SZ - 2.1));
    G.add(at(box(1.9, 0.4, 0.34, mat({ map: stageT })), 0, 0.2, SZ + 0.17)); G.add(at(box(1.9, 0.2, 0.34, mat({ map: stageT })), 0, 0.1, SZ + 0.51));
    const lip = at(box(7.4, 0.05, 0.06, glow(0xff3fa8)), 0, S - 0.02, SZ + 0.01); G.add(lip);
    const flames = [];
    for (let i = 0; i < 14; i++) {
      const x = -3.5 + i * (7.0 / 13); if (Math.abs(x) < 1.2) continue;
      const h = 0.1 + hash(i, 5) * 0.14, c = at(cyl(0.035, 0.035, h, 5, M(0xf2ead8)), x, S + h / 2, SZ + 0.12); G.add(c);
      const f = at(box(0.03, 0.06, 0.03, glow(0xffb43a)), x, S + h + 0.04, SZ + 0.12); G.add(f); flames.push(f);
    }
    // the DJ table at the back of the stage, a pet DJ behind it with headphones
    const djT = tex(32, 8, x => { px(x, '#101014', 0, 0, 32, 8); for (let X = 1; X < 31; X += 3) px(x, ['#ff3fd8', '#3fd4ff', '#39ff6a'][X % 3], X, 5, 2, 1); });
    const [DJX, DJZ] = CHAPEL.DJ;
    G.add(at(box(2.4, 0.5, 0.6, mat({ map: djT })), DJX, S + 0.25, DJZ + 0.55));
    const decks = []; for (const s of [-1, 1]) { const d = new THREE.Group(); d.add(cyl(0.18, 0.18, 0.03, 10, M(0x1a1a1a))); d.add(at(box(0.05, 0.035, 0.16, glow(0xffffff)), 0, 0.005, 0.05)); d.position.set(DJX + s * 0.6, S + 0.52, DJZ + 0.55); G.add(d); decks.push(d); }
    const dj = guest(6); dj.g.position.set(DJX, S, DJZ); dj.head.add(at(box(0.52, 0.08, 0.1, M(0x222222)), 0, 0.2, 0)); for (const s of [-1, 1]) dj.head.add(at(box(0.06, 0.14, 0.14, M(0xff3fd8)), s * 0.25, 0.06, 0)); G.add(dj.g);
    // speaker stacks either side, pumping on the kick
    const spkT = tex(8, 16, x => { px(x, '#101012', 0, 0, 8, 16); x.fillStyle = '#34343c'; x.beginPath(); x.arc(4, 4.5, 3, 0, TAU); x.arc(4, 11.5, 3, 0, TAU); x.fill(); x.fillStyle = '#1a1a1e'; x.beginPath(); x.arc(4, 4.5, 1.2, 0, TAU); x.arc(4, 11.5, 1.2, 0, TAU); x.fill(); });
    const speakers = []; for (const s of [-1, 1]) for (let q = 0; q < 2; q++) { const sp = at(box(0.9, 1.0, 0.8, mat({ map: spkT })), s * 3.1, S + 0.5 + q * 1.02, SZ - 3.2); G.add(sp); speakers.push(sp); }
    // four white light columns standing on the stage (the clip's backlight), and the neon triangle on the back wall
    const colM = mat({ color: 0xffffff, unlit: 1 }), columns = [];
    for (const x of [-2.25, -1.25, 1.25, 2.25]) { const c = at(box(0.14, 3.6, 0.14, colM), x, S + 1.8, SZ - 3.75); G.add(c); columns.push(c); G.add(at(box(0.3, 0.1, 0.3, M(0x2a2a30)), x, S + 0.05, SZ - 3.75)); }
    const triM = glow(0xff2f8f), tri2M = glow(0x3fd4ff);
    const tri = neonTri(3.2, 0.12, triM); tri.position.set(0, S + 3.5, -D / 2 + CZ + 0.08); G.add(tri);
    const tri2 = neonTri(2.1, 0.08, tri2M); tri2.position.set(0, S + 3.35, -D / 2 + CZ + 0.1); G.add(tri2);
    // dry ice rolling off the stage lip: low puffs drifting
    const fogM = [mat({ color: 0xe8e4f4, unlit: 0.55 }), mat({ color: 0xf6f2ff, unlit: 0.7 })], puffGeo = new THREE.IcosahedronGeometry(0.22, 0), puffs = [];
    for (let i = 0; i < 10; i++) { const p = new THREE.Mesh(puffGeo, fogM[i % 2]); p.userData = { x: -3.3 + hash(i, 61) * 6.6, z: SZ - 2.4 - hash(i, 62) * 1.2, s: 0.5 + hash(i, 63) * 0.4, ph: hash(i, 64) * TAU }; G.add(p); puffs.push(p); }
    // ---- the mirror ball over the floor ----
    const ballT = tex(16, 16, (x, r) => { for (let y = 0; y < 16; y += 2) for (let X = 0; X < 16; X += 2) px(x, r() < 0.2 ? '#ffffff' : ['#9aa0b0', '#c8ccd8', '#7a8090'][Math.floor(r() * 3)], X, y, 2, 2); });
    const ball = at(new THREE.Mesh(new THREE.IcosahedronGeometry(0.4, 1), mat({ map: ballT, unlit: 0.6 })), 0, 5.3, -1.2); G.add(ball);
    G.add(at(box(0.02, H - 5.7, 0.02, M(0x222222)), 0, (H + 5.7) / 2, -1.2));
    // papel picado across the room
    const flags = []; for (const [z, s] of [[-3.2, 1], [0.4, 2], [4.0, 3]]) picado(G, [-W / 2 + 0.1, 5.4, z - 0.6], [W / 2 - 0.1, 5.4, z + 0.6], 22, s, flags);
    // ---- the bar along the left wall: counter, bottles on the back bar, a neon strip ----
    const [BX, BT] = [CHAPEL.BAR_X, CHAPEL.BAR_TOP], [BZ0, BZ1] = CHAPEL.BAR_Z, BL = BZ1 - BZ0, BZC = (BZ0 + BZ1) / 2;
    const barT = tex(16, 8, (x, r) => { px(x, '#5a3420', 0, 0, 16, 8); noise(x, r, 16, 8, ['#4e2c1a', '#633b25'], 30); for (let X = 0; X < 16; X += 4) px(x, '#3a2014', X, 0, 1, 8); px(x, '#3a2014', 0, 7, 16, 1); });
    G.add(at(box(0.6, BT, BL, mat({ map: barT, rep: [1, BL / 1.2] })), BX, BT / 2, BZC));
    G.add(at(box(0.72, 0.05, BL + 0.1, M(0x2e1a10)), BX, BT + 0.025, BZC));
    const barNeon = at(box(0.03, 0.04, BL, glow(0x3fd4ff)), BX + 0.31, BT - 0.06, BZC); G.add(barNeon);
    G.add(at(box(0.4, 1.9, BL + 0.4, M(0x7a4a2e)), -W / 2 + 0.22, 0.95, BZC));   // the back bar
    for (const y of [0.95, 1.45]) G.add(at(box(0.42, 0.04, BL + 0.4, M(0x2a180e)), -W / 2 + 0.3, y, BZC));
    const BOT = [0x3aa85a, 0xd8343a, 0xe8c23a, 0x3a6ad8, 0xf0f0e8, 0x8a4ad8];
    for (let i = 0; i < 24; i++) { const y = i % 2 ? 1.47 : 0.97, z = BZ0 - 0.1 + (Math.floor(i / 2) + 0.5) * ((BL + 0.2) / 12), h = 0.24 + hash(i, 71) * 0.1; G.add(at(cyl(0.045, 0.05, h, 6, mat({ color: BOT[i % BOT.length], unlit: 0.6 })), -W / 2 + 0.3, y + h / 2 + 0.02, z)); }
    const barGlow = at(box(0.05, 0.06, BL + 0.3, glow(0xff9ad0)), -W / 2 + 0.44, 1.9, BZC); G.add(barGlow);   // a pink strip over the bottles
    const barSign = rot(at(new THREE.Mesh(new THREE.PlaneGeometry(1.4, 0.5), mat({ map: sign('BAR', '#07060a', '#ff4fb0', 48, 16), unlit: 1 })), -W / 2 + 0.03, 2.5, BZC), 0, PI / 2, 0); G.add(barSign);
    // ---- the door in the right wall, open onto the moonlit street; its leaves swung in against the wall ----
    const [, DZ] = CHAPEL.DOOR;
    const streetT = tex(16, 24, (x, r) => { px(x, '#16204a', 0, 0, 16, 24); px(x, '#2a3466', 0, 10, 16, 4); px(x, '#c8a878', 0, 14, 16, 10); noise(x, r, 16, 24, ['rgba(255,255,255,.05)', 'rgba(0,0,0,.1)'], 60); px(x, '#f2e0a0', 2, 8, 3, 3); px(x, '#f2e0a0', 11, 7, 2, 3); px(x, '#f4ecc8', 9, 2, 3, 3); });
    const doorway = rot(at(new THREE.Mesh(new THREE.PlaneGeometry(1.8, 2.8), mat({ map: streetT, unlit: 1 })), W / 2 - 0.02, 1.4, DZ), 0, -PI / 2, 0); G.add(doorway);
    const doorFrame = M(0x3a2216);
    G.add(at(box(0.14, 3.1, 0.2, doorFrame), W / 2 - 0.05, 1.55, DZ - 1.0)); G.add(at(box(0.14, 3.1, 0.2, doorFrame), W / 2 - 0.05, 1.55, DZ + 1.0)); G.add(at(box(0.14, 0.24, 2.2, doorFrame), W / 2 - 0.05, 3.0, DZ));
    const leafT = tex(8, 16, (x, r) => { px(x, '#6a3a1e', 0, 0, 8, 16); noise(x, r, 8, 16, ['#5e3218', '#744424'], 20); px(x, '#3a2010', 0, 5, 8, 1); px(x, '#3a2010', 0, 11, 8, 1); px(x, '#c8a040', 6, 8, 1, 1); });
    for (const s of [-1, 1]) G.add(rot(at(box(0.9, 2.75, 0.07, mat({ map: leafT })), W / 2 - 0.5, 1.38, DZ + s * 1.36), 0, s * 0.35, 0));
    const doorBlaze = rot(at(new THREE.Mesh(new THREE.PlaneGeometry(1.75, 2.75), mat({ color: 0xfff6ea, unlit: 1 })), W / 2 - 0.035, 1.38, DZ), 0, -PI / 2, 0); G.add(doorBlaze);
    // ---- stacked pews by the walls near the front (the chapel's old benches) ----
    const pewM = M(0x4a2e1e);
    for (const [x, z, ry] of [[-5.9, 5.2, 0], [-5.9, 6.3, 0], [5.9, 6.6, 0], [5.95, 7.6, 0.1]]) { const p = new THREE.Group(); p.add(at(box(0.5, 0.08, 2.2, pewM), 0, 0.42, 0)); p.add(at(box(0.08, 0.5, 2.2, pewM), -0.22, 0.7, 0)); for (const zz of [-1, 1]) p.add(at(box(0.44, 0.42, 0.08, pewM), 0, 0.21, zz)); p.position.set(x, 0, z); p.rotation.y = ry; G.add(p); }
    // candles in wall niches
    for (const [s, z] of [[-1, -4.6], [1, -4.6], [-1, 4.4], [1, 0.4]]) {
      G.add(rot(at(new THREE.Mesh(new THREE.PlaneGeometry(0.7, 0.9), M(0x3a2a22)), s * (W / 2 - 0.03), 1.5, z), 0, -s * PI / 2, 0));
      for (let q = 0; q < 3; q++) { const h = 0.1 + q * 0.05, x = s * (W / 2 - 0.1), zz = z - 0.18 + q * 0.18; G.add(at(cyl(0.03, 0.03, h, 5, M(0xf2ead8)), x, 1.1 + h / 2, zz)); const f = at(box(0.03, 0.05, 0.03, glow(0xffb43a)), x, 1.1 + h + 0.035, zz); G.add(f); flames.push(f); }
    }
    // ---- the guests: around the floor, clear of the squad's marks, the bar front and the door-to-stage lane ----
    // zones picked round the story's lanes: the floor mark, the chase corridor to the camera (x -1..0.9), the run past the
    // bar (x < -3.1), the run along the stage (z -2.8..-1.6), Saxo's corner at the stage's left and Compote's sprint from
    // it to the door, the carrot's hand-back and the uppercut (x -0.8..0.5, z -2.6..-0.6)
    const SPOTS = [[-2.9, 2.2, 0.8], [-1.6, 2.7, 0.4], [-2.4, 3.9, 0.7], [-1.4, 4.6, 0.3], [-2.9, 5.3, 0.6],
      [1.3, 3.5, -0.3], [2.3, 4.4, -0.6], [1.5, 5.6, -0.2],
      [1.5, -4.35, -0.2], [2.6, -4.3, -0.3], [3.1, -3.1, -0.5],
      [3.3, -3.4, -0.4], [4.4, -3.6, -0.7], [3.8, -4.3, -0.5],
      [4.3, -0.5, -1.0], [5.2, -0.8, -1.1], [5.0, 0.1, -0.8],
      [-3.2, 6.6, 0.4], [-2.0, 7.4, 0.3], [2.2, 7.1, -0.2], [3.3, 6.4, -0.4]];
    const guests = SPOTS.map(([x, z, ry], i) => { const r = guest(i); r.g.position.set(x, 0, z); r.g.rotation.y = ry; r.g.userData.home = [x, z, ry]; G.add(r.g); return r; });
    // the pit: a front row of guests facing the stage, only in the shots that ask for it (`pit`): the lanes run through here
    const PIT = [[-2.3, -3.5], [-1.5, -3.2], [1.5, -3.3], [2.3, -3.6]];   // a gap in front of the performers
    const pit = PIT.map(([x, z], i) => { const r = guest(i + 30); r.g.position.set(x, 0, z); r.g.rotation.y = PI + (hash(i, 51) - 0.5) * 0.4; r.g.userData.home = [x, z, r.g.rotation.y]; G.add(r.g); return r; });
    // the break's spotlight: a pool of white light on the floor round whoever it is
    const poolT = tex(32, 32, (x, r) => { for (let yy = 0; yy < 32; yy++) for (let xx = 0; xx < 32; xx++) { const d = Math.hypot(xx - 15.5, yy - 15.5) / 16; if (d < 0.72 || (d < 1 && r() > (d - 0.72) / 0.28)) px(x, d < 0.5 ? '#fff6e6' : '#f2e2cc', xx, yy); } }, 931);
    const pool = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 2.2), mat({ map: poolT, unlit: 1 })); pool.rotation.x = -PI / 2; pool.visible = false; G.add(pool);
    // confetti from the stage corners
    const confM = [0xff3fd8, 0x3fd4ff, 0xffe23f, 0x39ff6a, 0xffffff].map(c => glow(c)), confetti = [];
    confM.forEach(m => { m.side = THREE.DoubleSide; }); const confGeo = new THREE.PlaneGeometry(0.2, 0.13);
    for (let q = 0; q < 160; q++) { const c = new THREE.Mesh(confGeo, confM[q % confM.length]); G.add(c); confetti.push(c); }
    const lane = (x, z) => {   // distance from the door-to-stage lane, and the unit side to step to
      const [ax, az] = CHAPEL.DOOR_IN, bx = 0.4, bz = SZ + 0.9, dx = bx - ax, dz = bz - az, L2 = dx * dx + dz * dz;
      const u = Math.max(0, Math.min(1, ((x - ax) * dx + (z - az) * dz) / L2)), px_ = ax + dx * u, pz = az + dz * u, d = Math.hypot(x - px_, z - pz) || 1e-3;
      return [d, (x - px_) / d, (z - pz) / d];
    };
    return {
      group: G, sky: grad([[0, '#050408'], [1, '#0c0a12']]), shadowCol: 0x4a2a22, indoor: true,
      light() {
        lights(0x5a4668, 0x7a88c0, [0.3, -1, 0.2], 0x120a18, [11, 32], 8);
        pt(0, 0, S + 2.6, SZ - 2.8, 1.5, 1.2, 1.35);   // the white-pink backlight from the columns
      },
      anim(t, P = {}) {
        const hushed = P.hush != null && t >= P.hush, h = hushed ? 0 : hit(t), n = beatN(t), half = !!P.half;
        const kick = half ? (pmod(n, 2) ? h * 0.35 : h) : h;
        const PAL = [[1, 0.2, 0.8], [0.2, 0.8, 1], [1, 0.55, 0.15], [0.7, 0.3, 1]];
        if (!hushed) {
          for (let q = 1; q <= 2; q++) { const a = t * 0.8 + q * PI, c = PAL[pmod(Math.floor(beat(t) / 4) + q, 4)]; pt(q, Math.sin(a) * 3.4, 3.4, -0.8 + Math.cos(a) * 2.6, c[0] * (0.75 + kick), c[1] * (0.75 + kick), c[2] * (0.75 + kick)); }
          U.uPtCol.value[0].setRGB(1.2 + 0.6 * kick, 0.95 + 0.4 * kick, 1.1 + 0.5 * kick);
          const st = (!half || pmod(n, 2) === 0) && pmod(n, 2) === 0 ? Math.exp(-fr(beat(t)) * 16) : 0; pt(3, 0, 5.4, 1.2, 1.3 * st, 1.2 * st, 1.4 * st);
        } else {   // the break: the room goes dark and still, one white spot on whoever it is
          lights(0x120e1c, 0x1c2240, [0.3, -1, 0.2], 0x040306, [7, 22], 8);
          U.uPtCol.value[0].setRGB(0.35, 0.3, 0.4);
          const sp = P.spot || [0, -1.2]; pt(3, sp[0], 3.4, sp[1] + 0.4, 3.8, 3.6, 3.4);
        }
        if (P.doorBright) pt(2, CHAPEL.DOOR_IN[0] + 0.5, 1.8, CHAPEL.DOOR[1], 2.4, 2.2, 1.9);
        if (P.key) pt(2, ...P.key);   // key: [x, y, z, r, g, b], a light for a corner away from the floor washes (the bar)
        doorBlaze.visible = !!P.doorBright; doorway.visible = !P.doorBright;
        pool.visible = hushed && !!P.spot; if (pool.visible) pool.position.set(P.spot[0], 0.012, P.spot[1]);
        pit.forEach(({ g }) => { g.visible = !!P.pit && !P.noguests; });
        columns.forEach((c, i) => { c.material.uniforms.uCol.value.setScalar(hushed ? 0.25 : 0.75 + 0.25 * (pmod(n + i, 4) === 0 ? 1 : kick)); });
        triM.uniforms.uCol.value.set(0xff2f8f).multiplyScalar(hushed ? 0.25 : 0.8 + 0.2 * (hash(Math.floor(t * 9), 4) > 0.07 ? 1 : 0.2));
        tri2M.uniforms.uCol.value.set(0x3fd4ff).multiplyScalar(hushed ? 0.15 : 0.6 + 0.4 * kick);
        lip.visible = !hushed; barNeon.visible = true;
        flames.forEach((f, i) => { f.scale.y = 0.8 + 0.4 * Math.abs(Math.sin(t * 11 + i * 1.7)); });
        speakers.forEach(sp => sp.scale.set(1 + 0.05 * kick, 1 + 0.03 * kick, 1 + 0.05 * kick));
        decks.forEach((d, i) => { d.rotation.y = hushed ? 0 : t * 3.5 * (i ? 1 : -1); });
        ball.rotation.y = t * 0.9; ball.material.uniforms.uUnlit.value = hushed ? 0.2 : 0.55 + 0.35 * kick;
        flutter(flags, t);
        puffs.forEach((p, i) => { const d = p.userData, u = fr(t * 0.08 + d.ph / TAU); p.position.set(d.x + 0.4 * Math.sin(t * 0.3 + d.ph), S + 0.02, d.z + u * 0.6); p.scale.set(d.s * 1.6, d.s * 0.25, d.s * 1.2); p.visible = !P.nosmoke; });
        dj.g.visible = P.dj !== false;
        { const b = beat(t), up = hushed ? 0 : Math.abs(Math.sin(b * PI)); dj.g.position.y = S + up * 0.05; dj.head.rotation.x = hushed ? 0 : 0.2 * Math.sin(b * PI); }
        // confetti bursts up and out of the stage corners, then drifts down over the floor
        const cf = P.confetti != null ? t - P.confetti : -1;
        confetti.forEach((c, i) => {
          c.visible = cf > 0 && cf < 6; if (!c.visible) return;
          const s = i % 2 ? 1 : -1, a = hash(i, 11), up = Math.min(cf, 0.55) / 0.55, e = 1 - (1 - up) ** 2;
          const y = Math.max(0.05, S + 0.4 + (1.6 + hash(i, 12) * 1.6) * e - Math.max(0, cf - 0.55) * (0.7 + hash(i, 13) * 0.5));
          c.position.set(s * (3.4 - (1.0 + a * 3.6) * e) + Math.sin(cf * 2.3 + i) * 0.25, y, SZ - 0.5 + (0.8 + hash(i, 14) * 5.0) * e);
          c.rotation.set(cf * 6 + i, cf * 4 + i * 2, 0);
        });
        // the guests: jumping on the beat; stopped dead in the break; turned to `look`; stepping out of the lane on `part`
        const stop = P.hush ?? P.freeze, frozen = stop != null && t >= stop, pu = P.part != null ? sm((t - P.part) / 0.7) : 0;
        [...guests, ...pit].forEach(({ g, head, arms, i }) => {
          if (i < 30) g.visible = !P.noguests;
          const [x0, z0, ry] = g.userData.home; let x = x0, z = z0;
          if (pu > 0) { const [d, sx, sz] = lane(x0, z0); if (d < 1.6) { x += sx * (1.7 - d) * pu; z += sz * (1.7 - d) * pu; } }
          g.position.x = x; g.position.z = z;
          g.rotation.y = P.look ? Math.atan2(P.look[0] - x, P.look[1] - z) : pu > 0 ? Math.atan2(CHAPEL.DOOR_IN[0] - x, CHAPEL.DOOR_IN[1] - z) : ry;
          const tt = frozen ? stop : t, b = beat(tt) + hash(i, 7) * 0.2, hf = half ? 0.5 : 1;
          const up = frozen ? 0 : Math.abs(Math.sin(b * PI * hf)), jump = half ? 0.05 : 0.15;
          g.position.y = up * jump; head.rotation.z = frozen ? 0 : 0.14 * Math.sin(b * PI * hf);
          const wave = !frozen && (P.armsUp ? t >= P.armsUp[0] && t < P.armsUp[1] : pmod(Math.floor(b / 4) + i, 2) === 0);   // armsUp: [a, b] cut s, the whole room's arms up (a lyric's 'arms')
          arms.forEach((a, s) => { a.rotation.z = (s ? 1 : -1) * (wave ? 2.7 + 0.25 * Math.sin(b * TAU) : 0.35 + 0.3 * up); });
        });
      },
    };
  }

  // =====================================================================================================================
  function village() {
    const G = new THREE.Group(), HX = VILLAGE.HX, [, DZ] = VILLAGE.DOOR;
    // ---- the ground: packed dirt, a few stones and ruts ----
    const dirtT = tex(32, 32, (x, r) => { px(x, '#8a6a4a', 0, 0, 32, 32); noise(x, r, 32, 32, ['#806244', '#957452', '#7a5c40', '#8e7050'], 320); for (let i = 0; i < 6; i++) px(x, '#6a5038', Math.floor(r() * 30), Math.floor(r() * 30), 2, 1); }, 911);
    G.add(flat(60, 90, mat({ map: dirtT, rep: [22, 33] }), 0, 0, -10));
    // ---- the houses on both sides: flat-roofed adobe blocks, lit windows, coloured doors, vigas under the roof line ----
    const COLS = ['#e8e0d0', '#e8a8b0', '#88c8c0', '#e4b868', '#90a8d8', '#e8dcc0', '#d89a7a'];
    const DOORS = ['#2a7a8a', '#c83a4a', '#3a5ac8', '#e8a83a', '#5a8a3a', '#8a3a8a'];
    const houseT = (base, seed) => tex(32, 32, (x, r) => { px(x, base, 0, 0, 32, 32); noise(x, r, 32, 32, ['rgba(0,0,0,.08)', 'rgba(255,255,255,.08)', 'rgba(120,80,40,.1)'], 200); px(x, 'rgba(0,0,0,.12)', 0, 0, 32, 2); }, seed);
    const winT = tex(8, 8, x => { px(x, '#ffd890', 0, 0, 8, 8); px(x, '#3a2a1a', 0, 0, 8, 1); px(x, '#3a2a1a', 0, 7, 8, 1); px(x, '#3a2a1a', 0, 0, 1, 8); px(x, '#3a2a1a', 7, 0, 1, 8); for (const X of [2, 4, 6]) px(x, '#3a2a1a', X, 0, 1, 8); });
    const winM = mat({ map: winT, unlit: 0.85 }), vigaM = M(0x5a3a22), windows = [];
    let zc = -12.4, hi = 0;
    for (const side of [-1, 1]) {
      zc = -12.2; hi = side > 0 ? 3 : 0;
      while (zc < 16) {
        const len = 3.2 + hash(hi, 81) * 2.2, h = 3.0 + hash(hi, 82) * 1.4, dep = 4.2, col = COLS[pmod(hi, COLS.length)], x = side * (HX + dep / 2);
        const hm = mat({ map: houseT(col, 920 + hi), rep: [len / 3.2, h / 3.2] });
        G.add(at(box(dep, h, len, hm), x, h / 2, zc + len / 2));
        G.add(at(box(dep + 0.2, 0.18, len + 0.1, hm), x, h + 0.09, zc + len / 2));   // the parapet
        const fx = side * (HX - 0.02), dz0 = zc + len * (0.25 + 0.5 * hash(hi, 83));
        const door = rot(at(new THREE.Mesh(new THREE.PlaneGeometry(0.95, 1.9), M(new THREE.Color(DOORS[pmod(hi, DOORS.length)]).getHex())), fx, 0.95, dz0), 0, -side * PI / 2, 0); G.add(door);
        G.add(rot(at(new THREE.Mesh(new THREE.PlaneGeometry(1.1, 0.1), M(0x3a2a1a)), fx - side * 0.01, 1.95, dz0), 0, -side * PI / 2, 0));
        for (const wz of [zc + 0.7, zc + len - 0.7]) { if (Math.abs(wz - dz0) < 0.9) continue; const w = rot(at(new THREE.Mesh(new THREE.PlaneGeometry(0.75, 0.8), winM), fx, 1.65, wz), 0, -side * PI / 2, 0); G.add(w); windows.push(w); }
        for (let v = 0.4; v < len - 0.2; v += 0.8) G.add(rot(at(cyl(0.07, 0.07, 0.5, 5, vigaM), side * (HX - 0.22), h - 0.35, zc + v), 0, 0, PI / 2));
        if (hash(hi, 84) < 0.5) { const pot = at(cyl(0.16, 0.12, 0.3, 6, M(0xb8643a)), side * (HX - 0.3), 0.15, zc + len - 0.45); G.add(pot); G.add(at(ico(0.2, 0, M(0x3a8a3a)), side * (HX - 0.3), 0.42, zc + len - 0.45)); }
        zc += len + 0.05; hi++;
      }
    }
    // ---- the chapel at the far end: white facade, bell gable, the door blazing with the party ----
    const chapT = houseT('#f0ebe0', 950);
    G.add(at(box(9.4, 7.2, 1.0, mat({ map: chapT, rep: [3, 2.3] })), 0, 3.6, DZ - 0.5));
    G.add(at(box(4.4, 2.6, 0.8, mat({ map: chapT, rep: [1.4, 0.8] })), 0, 8.5, DZ - 0.5));   // the bell gable
    G.add(at(box(2.0, 0.9, 0.7, mat({ map: chapT })), 0, 10.2, DZ - 0.5));
    for (const x of [-1.05, 1.05]) { G.add(at(box(0.9, 1.3, 0.1, M(0x1a1420)), x, 8.6, DZ + 0.0)); G.add(at(cone(0.3, 0.5, 6, M(0xc8a040)), x, 8.55, DZ + 0.05)); }
    G.add(at(box(0.7, 0.1, 0.1, M(0x5a4a3a)), 0, 10.75, DZ - 0.3)); G.add(at(box(0.1, 0.7, 0.1, M(0x5a4a3a)), 0, 10.9, DZ - 0.3));   // a plain wooden cross on top
    const partyT = tex(16, 24, (x, r) => {   // the doorway: pink haze, white light columns, dancing silhouettes
      px(x, '#ff5fb0', 0, 0, 16, 24); px(x, '#ffc0e0', 0, 0, 16, 10);
      for (const X of [2, 7, 12]) px(x, '#ffffff', X, 0, 2, 17);
      for (let i = 0; i < 6; i++) { const X = 1 + i * 2.6, y0 = 13 + (i % 2); px(x, '#2a1030', X, y0, 2, 11); px(x, '#2a1030', X + 0.2, y0 - 2, 2, 2); }
    });
    const partyM = mat({ map: partyT, unlit: 1 });
    const chapelDoor = at(new THREE.Mesh(new THREE.PlaneGeometry(1.8, 3.0), partyM), 0, 1.5, DZ + 0.02); G.add(chapelDoor);
    const frame = M(0x3a2216); G.add(at(box(0.2, 3.3, 0.2, frame), -1.0, 1.65, DZ + 0.05)); G.add(at(box(0.2, 3.3, 0.2, frame), 1.0, 1.65, DZ + 0.05)); G.add(at(box(2.2, 0.25, 0.2, frame), 0, 3.3, DZ + 0.05));
    for (const s of [-1, 1]) G.add(rot(at(box(0.85, 2.9, 0.07, mat({ map: tex(8, 16, (x, r) => { px(x, '#6a3a1e', 0, 0, 8, 16); noise(x, r, 8, 16, ['#5e3218', '#744424'], 20); px(x, '#3a2010', 0, 5, 8, 1); px(x, '#3a2010', 0, 11, 8, 1); }) })), s * 1.35, 1.45, DZ + 0.42), 0, s * 1.25, 0));
    const vTri = neonTri(1.5, 0.08, glow(0xff2f8f)); vTri.position.set(0, 4.35, DZ + 0.03); G.add(vTri);
    const lanterns = []; for (const x of [-1.6, 1.6]) { G.add(at(box(0.08, 0.3, 0.3, M(0x2a2a2a)), x, 2.55, DZ + 0.12)); const l = at(box(0.2, 0.3, 0.2, glow(0xffc86a)), x, 2.4, DZ + 0.22); G.add(l); lanterns.push(l); }
    for (const [w, h, z] of [[3.6, 0.12, DZ + 0.3], [4.2, 0.06, DZ + 0.75]]) G.add(at(box(w, h, 0.45, M(0xb8ac98)), 0, h / 2, z));   // two low steps
    // stained-glass slits either side of the door
    for (const x of [-3.0, 3.0]) G.add(at(new THREE.Mesh(new THREE.PlaneGeometry(0.5, 1.6), mat({ color: 0xff7ac8, unlit: 0.9 })), x, 3.6, DZ + 0.01));
    // the velvet rope in front of the door, the bouncer standing at its right end
    const chrome = M(0xc8ccd4), velvet = M(0xc8102e), RZ = VILLAGE.ROPE_Z;
    for (const x of [-1.25, 0.95]) { G.add(at(cyl(0.035, 0.035, 0.9, 6, chrome), x, 0.45, RZ)); G.add(at(cyl(0.13, 0.13, 0.04, 8, chrome), x, 0.02, RZ)); G.add(at(ico(0.06, 0, chrome), x, 0.93, RZ)); }
    const rope = at(box(2.2, 0.05, 0.05, velvet), -0.15, 0.78, RZ); G.add(rope);
    // ---- the black car: a long 1960s saloon with chrome, whitewalls and a tall rear cabin (half hearse) ----
    const car = new THREE.Group(), black = M(0x16161c), chromeC = M(0xd8dce4), glassC = M(0x2a3040), tyre = M(0x141414), white = M(0xe8e8e8);
    car.add(at(box(1.9, 0.62, 5.3, black), 0, 0.62, 0));
    car.add(at(box(1.72, 0.62, 3.1, black), 0, 1.24, 0.55));
    for (const s of [-1, 1]) { car.add(at(box(0.02, 0.4, 2.8, glassC), s * 0.87, 1.27, 0.55)); car.add(at(box(0.03, 0.34, 1.2, M(0x4a1a2a)), s * 0.875, 1.27, 1.35)); }   // side windows, curtains in the back ones
    car.add(at(box(1.6, 0.36, 0.02, glassC), 0, 1.3, -1.01)); car.add(at(box(1.6, 0.32, 0.02, glassC), 0, 1.3, 2.11));
    car.add(at(box(2.0, 0.14, 0.12, chromeC), 0, 0.42, -2.7)); car.add(at(box(2.0, 0.14, 0.12, chromeC), 0, 0.42, 2.7));
    car.add(at(box(1.94, 0.04, 5.2, chromeC), 0, 0.78, 0));
    for (const s of [-1, 1]) { car.add(at(cyl(0.12, 0.12, 0.05, 8, glow(0xfff2c0)), s * 0.62, 0.7, -2.66)); car.children.at(-1).rotation.x = PI / 2; car.add(at(box(0.12, 0.2, 0.05, glow(0xff2a2a)), s * 0.8, 0.72, 2.66)); car.add(at(box(0.06, 0.26, 0.9, black), s * 0.9, 1.0, 2.2)); }   // headlights, tail lights, fins
    for (const [x, z] of [[-0.88, -1.7], [0.88, -1.7], [-0.88, 1.8], [0.88, 1.8]]) { const w = at(cyl(0.36, 0.36, 0.24, 10, tyre), x, 0.36, z); w.rotation.z = PI / 2; car.add(w); const ww = at(cyl(0.22, 0.22, 0.26, 10, white), x, 0.36, z); ww.rotation.z = PI / 2; car.add(ww); const hub = at(cyl(0.1, 0.1, 0.28, 8, chromeC), x, 0.36, z); hub.rotation.z = PI / 2; car.add(hub); }
    const carDoor = new THREE.Group(); carDoor.add(at(box(0.06, 1.1, 1.05, black), 0, 0.95, -0.52)); carDoor.add(at(box(0.07, 0.38, 0.9, glassC), 0, 1.27, -0.5)); carDoor.position.set(-0.96, 0, 0.1); car.add(carDoor);   // left rear door, hinged at its front edge
    const [CX, CZc] = VILLAGE.CAR; car.position.set(CX, 0, CZc); G.add(car);
    // ---- the fruit stall: a cart under a striped awning, crates of oranges, limes and chillies, a lantern ----
    const [SX, SZ] = VILLAGE.STALL, stall = new THREE.Group(), woodS = M(0x7a5232);
    stall.add(at(box(2.2, 0.12, 1.0, woodS), 0, 0.82, 0)); for (const [x, z] of [[-1.0, -0.42], [1.0, -0.42], [-1.0, 0.42], [1.0, 0.42]]) stall.add(at(box(0.08, 2.2, 0.08, woodS), x, 1.1, z));
    const awnT = tex(16, 4, x => { for (let X = 0; X < 16; X += 4) { px(x, '#ff5f8f', X, 0, 2, 4); px(x, '#f8f2e8', X + 2, 0, 2, 4); } });
    stall.add(rot(at(box(2.5, 0.05, 1.4, mat({ map: awnT, rep: [2, 1] })), 0, 2.25, 0.1), 0.18, 0, 0));
    const FR = [0xff8a1a, 0x7ad83a, 0xe8243a, 0xffd23f];
    for (let c = 0; c < 4; c++) { const cx = -0.78 + c * 0.52; stall.add(at(box(0.46, 0.14, 0.7, M(0x9a6a3a)), cx, 0.95, 0)); for (let q = 0; q < 6; q++) stall.add(at(ico(0.07, 0, M(FR[c])), cx - 0.12 + (q % 3) * 0.12, 1.06, -0.18 + Math.floor(q / 3) * 0.3)); }
    const stallSign = at(new THREE.Mesh(new THREE.PlaneGeometry(1.3, 0.34), mat({ map: sign('FRUTAS', '#f8f2e8', '#c83a4a', 64, 16), unlit: 0.4 })), 0, 1.75, 0.53); stall.add(stallSign);
    const lamp = at(box(0.16, 0.24, 0.16, glow(0xffc86a)), 0.8, 1.9, 0.45); stall.add(lamp);
    for (const [x, z, ry] of [[1.5, 0.6, 0.3], [1.3, -0.6, -0.2]]) stall.add(rot(at(box(0.5, 0.36, 0.4, M(0x9a6a3a)), x, 0.18, z), 0, ry, 0));
    stall.position.set(SX, 0, SZ); stall.rotation.y = PI / 2; G.add(stall);
    const fruit = []; for (let q = 0; q < 9; q++) { const o = at(ico(0.075, 0, M(q % 3 ? 0xff8a1a : 0x7ad83a)), SX + 0.8 + hash(q, 91) * 1.6, 0.075, SZ - 1.2 + hash(q, 92) * 2.4); G.add(o); fruit.push(o); }
    // ---- cacti and agaves along the house fronts and at the street's ends ----
    const cactM = M(0x3a7a3a), cactD = M(0x2e6430);
    const saguaro = (x, z, h) => { const g = new THREE.Group(); g.add(at(cyl(0.2, 0.24, h, 6, cactM), 0, h / 2, 0)); for (const [s, y, l] of [[-1, h * 0.45, 0.6], [1, h * 0.6, 0.5]]) { g.add(at(box(0.45, 0.2, 0.2, cactD), s * 0.3, y, 0)); g.add(at(cyl(0.14, 0.16, l, 5, cactM), s * 0.5, y + l / 2, 0)); } g.position.set(x, 0, z); G.add(g); };
    for (const [x, z, h] of [[-4.2, 7.5, 2.6], [4.25, 3.4, 2.2], [-4.25, -9.8, 2.4], [6.5, -13.0, 3.0], [-6.8, -12.6, 2.7]]) saguaro(x, z, h);
    const pear = (x, z) => { for (let q = 0; q < 4; q++) G.add(rot(at(new THREE.Mesh(new THREE.SphereGeometry(0.26, 6, 4), cactM), x + (q % 2) * 0.28 - 0.14, 0.3 + Math.floor(q / 2) * 0.36, z), 0, 0, (q - 1.5) * 0.4)).children.at(-1).scale.set(1, 1.2, 0.35); };
    pear(4.0, -10.2); pear(-4.0, 1.5); pear(3.95, 8.8);
    for (const [x, z] of [[-3.9, -6.4], [4.0, -2.3], [-4.0, 11.0]]) for (let q = 0; q < 7; q++) G.add(rot(at(cone(0.06, 0.7, 4, M(0x6a9a6a)), x, 0.3, z), Math.cos(q * 0.9) * 0.6, 0, Math.sin(q * 0.9) * 0.6));
    // ---- string lights and papel picado across the street ----
    const bulbs = []; const bulbM = [glow(0xffd070), glow(0xff8a6a), glow(0xfff0c0)];
    for (const z of [-9.5, -4.5, 0.5, 5.5]) {
      for (let q = 0; q <= 14; q++) { const u = q / 14, x = -HX + u * 2 * HX, y = 4.3 - 0.55 * Math.sin(u * PI), zz = z + (u - 0.5) * 1.4; const b = at(box(0.09, 0.12, 0.09, bulbM[q % 3]), x, y - 0.08, zz); G.add(b); bulbs.push(b); }
      const w = at(box(2 * HX, 0.012, 0.012, M(0x222222)), 0, 4.0, z); w.rotation.y = -Math.atan2(1.4, 2 * HX); G.add(w);
    }
    const flags = []; for (const [z, s] of [[-7.0, 1], [-2.0, 2], [3.0, 3], [8.0, 4]]) picado(G, [-HX, 3.7, z - 0.5], [HX, 3.7, z + 0.5], 18, s, flags);
    // ---- the desert beyond: dark hills all round, a big moon, stars ----
    const hillM = M(0x241c30);
    for (let i = 0; i < 16; i++) { const a = (i / 16) * TAU + hash(i, 95) * 0.3, R = 46 + hash(i, 96) * 16, hgt = 6 + hash(i, 97) * 9; const hl = at(cone(10 + hash(i, 98) * 8, hgt, 5, hillM), Math.sin(a) * R, hgt / 2 - 0.5, -10 - Math.cos(a) * R); G.add(hl); }
    const moonT = tex(16, 16, (x, r) => { px(x, '#f6eecf', 0, 0, 16, 16); px(x, '#dcd2ac', 4, 4, 4, 3); px(x, '#e0d6b0', 9, 9, 3, 3); noise(x, r, 16, 16, ['#ece2bc', '#fbf4d8'], 30); });
    const moonD = at(new THREE.Mesh(new THREE.CircleGeometry(6, 14), mat({ map: moonT, unlit: 1, nofog: 1 })), -22, 24, -80); moonD.lookAt(0, 2, 0); G.add(moonD);
    const sky = stars(160, 90, 912, 0xf0f0ff, 0.12); sky.material.uniforms.uNoFog.value = 1; G.add(sky);
    return {
      group: G, sky: grad([[0, '#070b24'], [0.55, '#1c1a44'], [1, '#4a2e58']]), shadowCol: 0x5a4430,
      light() {
        lights(0x6a6aa0, 0xaabef0, [-0.35, -0.8, 0.45], 0x1c1834, [26, 100], 9);
        pt(0, 0, 2.2, DZ + 1.6, 1.6, 0.8, 1.2);          // the party's pink glow out of the chapel door
        pt(1, SX + 0.4, 2.1, SZ, 1.2, 0.85, 0.45);       // the stall's lantern
        pt(2, 0, 4.0, -2.0, 0.55, 0.42, 0.28);           // the string lights' warmth over the street
      },
      anim(t, P = {}) {
        const hushed = P.hush != null && t >= P.hush, th = P.thump === false || hushed ? 0 : hit(t);
        partyM.uniforms.uCol.value.setScalar(hushed ? 0.35 : 0.75 + 0.25 * th);
        U.uPtCol.value[0].setRGB((hushed ? 0.5 : 1.3 + 0.9 * th), (hushed ? 0.3 : 0.6 + 0.4 * th), (hushed ? 0.45 : 1.0 + 0.6 * th));
        lanterns.forEach((l, i) => { l.scale.y = 0.9 + 0.1 * Math.sin(t * 9 + i); });
        bulbs.forEach((b, i) => { b.visible = hash(i, Math.floor(t * 2.5)) > 0.06; });
        windows.forEach((w, i) => { w.material.uniforms.uUnlit.value = 0.85; });
        flutter(flags, t);
        carDoor.rotation.y = P.carDoor ? -1.15 : 0;
        if (P.key) pt(3, ...P.key);   // key: [x, y, z, r, g, b], a light on a character away from the street's lights
        fruit.forEach(o => { o.visible = !!P.fruit; });
      },
    };
  }

  return { chapel: chapel(), village: village() };
}
