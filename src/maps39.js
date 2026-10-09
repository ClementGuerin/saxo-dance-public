// maps39.js: the "BIRDS OF A FEATHER" map (2026-10-10, Billie Eilish, 2024; the clip: an empty 1970s office, a room of
// dark wood panelling over a green carpet under a ceiling of fluorescent panels with one lone chair in its middle, a
// brown leather sofa, white rooms, the singer pulled across the floor, up the walls and tipped back on her chair by an
// invisible force). Same contract as the other map files, pure in t:
//   salon  a pet grooming salon in the clip's office style, two rooms through one door (SALON.DOOR, in the wall z = 0,
//          hinged on its left edge, swinging into the grooming room).
//          The waiting room (z 0..9): wood panelling, a green carpet, a ceiling of fluorescent panels, the clip's lone
//          chair in the middle (CHAIR, seat CHAIR_Y, facing +z: it tips back on its back legs with `tip`), its brown
//          leather sofa against the left wall (SOFA, facing +x), three waiting chairs with box-pet customers (WAITERS,
//          facing +x), the reception desk on the right (DESK) with a bell and a birdcage of two lovebirds (CAGE), the
//          wall of fame on the right wall (FAME: framed groomed pets; `fame` puts a picture in Saxo's gold frame), the
//          glass front door in the front wall (FRONT, `front` swings it out), a GROOMING sign over the door.
//          The grooming room (z -8..0): white tiles, a raised steel tub on legs (TUB: its floor TUB.y, the water at
//          TUB.water, its rim TUB.rim; a dog standing in it takes `lift` TUB.y), a rain head over it on a chrome pole
//          (SHOWER), a dryer on its pedestal beside it (DRYER, its head turned to the target), shelves of shampoo, a
//          towel rack, and a dressing mirror with bulbs set into the back wall (MIRROR: a portal, a case behind the
//          glass painted like the room; the reflection is a crowd of one at the mirrored spot, z' = 2 MIRROR.z - z).
// Flags read by anim(t, P) (s = seconds into the shot):
//   zone     'wait' | 'groom': which room's lights
//   door     0-1 or [s0, s1, a, b]: the GROOMING door open (1: swung 100 deg into the grooming room)
//   front    0-1 or ramp: the front door swung out
//   tip      0-1 or ramp: the lone chair tipped back on its back legs (1: 38 deg, the clip's impossible lean)
//   chair    false hides the lone chair; chairAt [x0, z0, x1, z1, s0, s1]: it stands at (x0, z0) and is dragged linearly to (x1, z1)
//            over [s0, s1] (a sitter rides it on the same linear mx/mz); chairYaw (deg)
//   foam     true: foam on the tub's water; duck: true, a rubber duck bobbing on it
//   shower   true or s: rain falling from the head over the tub
//   splash   [[x, z, s, size]]: a burst out of the tub's water (he lands in it)
//   shake    [x, y, z, s0, s1]: a wet dog shaking: a ring of drops flung out from the point on every half beat
//   drips    [[x, z, h]]: drops falling off a soaked one from round the head (h), a wet patch at the feet
//   dryer    [x, y, z, s0]: the dryer's blast from its nozzle to the point from s0 (streaks, drops flying past);
//            dryerAim [x, z]: where the dryer's head points (default the target, else the tub)
//   fluff    [x, z, s0, s1, r, y]: a white cloud of fur puffs swelling round the point from s0, blowing away from s1
//   hearts   [[x, y, z, s0, loop]], heartYaw
//   pets     'wait' (sitting, swinging their feet) | 'stare' (+ `stare` [x, z]) | 'cheer' | 'gasp' | false
//   fame     true: Saxo's gold frame on the wall of fame holds a picture
//   mirror   false hides the mirror; noGlass (a lens inside its case); bulbs false
//   noguests, clear [[x, z, r]] (no customer there), key [x, y, z, r, g, b]
// Never name a flag like a shot field: `crowd`, `cam`, `still`, `focus`, `photo`, `flashAt` are taken.
import { mapKit } from './mapkit.js';

export const SALON = {
  H: 3.3, WAIT: { x0: -6, x1: 6, z0: 0, z1: 9 }, GROOM: { x0: -6, x1: 6, z0: -8, z1: 0 },
  DOOR: { x0: 0.95, x1: 2.25, h: 2.3 },
  FRONT: { x0: 2.6, x1: 3.9, z: 9, h: 2.3 },
  CHAIR: [-1.6, 4.4], CHAIR_Y: 0.42,
  SOFA: { x: -5.5, z0: 5.0, z1: 7.4, seatY: 0.4 },
  DESK: { x0: 3.0, x1: 5.6, z0: 2.0, z1: 2.8, y: 0.98 }, CAGE: [4.7, 2.4],
  FAME: { x: 5.97, z0: 4.2, z1: 7.8 }, FAME_SAXO: [5.95, 1.55, 6.0],
  WAITERS: [[-5.25, 1.3], [-5.25, 2.3], [-5.25, 3.3]], WAITER_Y: 0.42,
  TUB: { x: -2.2, z: -4.4, w: 1.5, d: 0.9, y: 0.55, water: 0.8, rim: 1.02 },
  SHOWER: [-2.2, 2.3, -4.45],
  DRYER: [0.7, -4.45],
  MIRROR: { x: 2.4, z: -7.9, w: 1.3, h: 1.65, y0: 0.18, depth: 2.4 },
};

export function buildSalonMaps(K) {
  const k = mapKit(K);
  const { THREE, mat, tex, px, noise, box, TAU, PI, beat, hash, fr, cyl, cone, ico, at, rot, flat, lights, pt } = k;
  const M = (c, o = {}) => mat({ color: c, ...o }), glow = (c, u = 1) => mat({ color: c, unlit: u });
  const shotT = (t, P) => P.t0 != null ? t - P.t0 : 0;
  const cl = x => Math.max(0, Math.min(1, x)), sm = x => { x = cl(x); return x * x * (3 - 2 * x); };
  const cleared = (P, x, z) => (P.clear || []).some(([cx, cz, r]) => (x - cx) ** 2 + (z - cz) ** 2 < r * r);
  const ramp = (v, s) => Array.isArray(v) ? v[2] + (v[3] - v[2]) * sm((s - v[0]) / Math.max(0.01, v[1] - v[0])) : (v === true ? 1 : (v || 0));
  const from = (v, s) => v === true || (typeof v === 'number' && s >= v);
  const css = c => '#' + c.toString(16).padStart(6, '0');
  const { H, WAIT, GROOM, DOOR, FRONT, CHAIR, CHAIR_Y, SOFA, DESK, CAGE, FAME, FAME_SAXO, WAITERS, WAITER_Y, TUB, SHOWER, DRYER, MIRROR } = SALON;
  const CHROME = M(0xd8dde6, { unlit: 0.25 });

  // ---------- the customers: box pets in bright tees, sitting on the waiting chairs ----------
  const FURS = [0xf2eee6, 0xd8a868, 0x9a9aa4, 0xe8c090, 0x8a7a6c, 0xc8b8a8];
  const TEES = [0x6ab0f0, 0xf08ab0, 0x8ad8a0, 0xf2c860, 0xb08ae8, 0xf09a6a];
  function pet(i) {
    const g = new THREE.Group(), F = M(FURS[i % FURS.length]), T = M(TEES[i % TEES.length]), kind = i % 3;
    const body = new THREE.Group(); g.add(body);
    const legs = new THREE.Group(); body.add(legs);
    for (const sx of [-1, 1]) { const l = at(new THREE.Group(), sx * 0.1, 0.12, 0); l.add(at(box(0.13, 0.12, 0.3, M(0x4a5a7a)), 0, 0, 0.13)); l.add(at(box(0.13, 0.22, 0.13, F), 0, -0.14, 0.27)); legs.add(l); }
    body.add(at(box(0.4, 0.36, 0.28, T), 0, 0.3, 0));
    const arms = [-1, 1].map(sx => { const a = at(new THREE.Group(), sx * 0.23, 0.44, 0); a.add(at(box(0.09, 0.28, 0.09, T), 0, -0.12, 0)); a.add(at(box(0.08, 0.08, 0.08, F), 0, -0.28, 0)); body.add(a); return a; });
    const head = at(new THREE.Group(), 0, 0.72, 0); body.add(head);
    const skull = new THREE.Mesh(new THREE.IcosahedronGeometry(0.24, 1), F); skull.scale.set(1, 0.9, 0.92); head.add(skull);
    const snout = at(new THREE.Mesh(new THREE.IcosahedronGeometry(0.1, 1), M(0xf0e6d8)), 0, -0.07, 0.19); snout.scale.set(1.1, 0.8, 0.9); head.add(snout);
    head.add(at(new THREE.Mesh(new THREE.IcosahedronGeometry(0.035, 0), M(0x151515)), 0, -0.03, 0.28));
    const mouth = at(box(0.09, 0.07, 0.02, M(0x5a1a1a)), 0, -0.13, 0.25); mouth.visible = false; head.add(mouth);
    for (const e of [-1, 1]) {
      head.add(at(new THREE.Mesh(new THREE.IcosahedronGeometry(0.038, 0), M(0x0e0e0e)), e * 0.1, 0.05, 0.19));
      head.add(at(new THREE.Mesh(new THREE.IcosahedronGeometry(0.012, 0), glow(0xffffff)), e * 0.1 + 0.012, 0.065, 0.225));
      head.add(kind === 0 ? rot(at(cone(0.08, 0.2, 4, F), e * 0.15, 0.27, 0), 0, 0, -e * 0.25) : kind === 1 ? at(box(0.08, 0.3, 0.06, F), e * 0.1, 0.33, 0) : rot(at(box(0.07, 0.24, 0.16, F), e * 0.24, 0.02, 0), 0, 0, e * 0.3));
    }
    return { g, body, head, arms, legs, mouth, i };
  }

  // ---------- a 70s office chair: upholstery on a chrome tube frame (its front to +z) ----------
  function officeChair(seatM) {
    const c = new THREE.Group();
    c.add(at(box(0.5, 0.08, 0.48, seatM), 0, CHAIR_Y - 0.04, 0));
    c.add(rot(at(box(0.5, 0.5, 0.07, seatM), 0, CHAIR_Y + 0.27, -0.24), -0.12, 0, 0));
    for (const [sx, sz] of [[-0.22, -0.2], [0.22, -0.2], [-0.22, 0.2], [0.22, 0.2]]) c.add(at(cyl(0.017, 0.017, CHAIR_Y - 0.08, 5, CHROME), sx, (CHAIR_Y - 0.08) / 2, sz));
    for (const sx of [-0.22, 0.22]) c.add(rot(at(cyl(0.017, 0.017, 0.4, 5, CHROME), sx, 0.03, 0), PI / 2, 0, 0));
    return c;
  }

  function salon() {
    const G = new THREE.Group();
    // ---------------- textures ----------------
    const woodT = tex(32, 32, (x, r) => { px(x, '#5a2a1c', 0, 0, 32, 32); noise(x, r, 32, 32, ['#522618', '#62301f', '#4c2416'], 160); for (let i = 0; i < 32; i += 8) px(x, '#3a1a10', i, 0, 1, 32); }, 3901);
    const carpetT = tex(32, 32, (x, r) => { px(x, '#2f5a46', 0, 0, 32, 32); noise(x, r, 32, 32, ['#2a5240', '#33604b', '#2c5644', '#36654f'], 420); }, 3902);
    const tileT = tex(32, 32, (x, r) => { px(x, '#e8eef0', 0, 0, 32, 32); noise(x, r, 32, 32, ['#e2e9ec', '#eef3f4'], 90); px(x, '#c8d2d6', 0, 0, 32, 1); px(x, '#c8d2d6', 0, 0, 1, 32); }, 3903);
    const floorT = tex(32, 32, (x, r) => { px(x, '#9aaab4', 0, 0, 32, 32); noise(x, r, 32, 32, ['#94a4ae', '#a2b2bc'], 160); px(x, '#86969e', 0, 0, 32, 1); px(x, '#86969e', 0, 0, 1, 32); }, 3904);
    const ceilT = tex(32, 32, (x, r) => { px(x, '#3a3a36', 0, 0, 32, 32); noise(x, r, 32, 32, ['#34342f', '#40403a'], 60); }, 3905);
    // ---------------- floors and ceilings ----------------
    const wW = WAIT.x1 - WAIT.x0, wD = WAIT.z1 - WAIT.z0, gD = GROOM.z1 - GROOM.z0;
    G.add(flat(wW, wD, mat({ map: carpetT, rep: [wW / 1.5, wD / 1.5] }), 0, 0, (WAIT.z0 + WAIT.z1) / 2));
    G.add(flat(wW, gD, mat({ map: floorT, rep: [wW / 1.2, gD / 1.2] }), 0, 0, (GROOM.z0 + GROOM.z1) / 2));
    const ceil = (z0, z1) => { const c = new THREE.Mesh(new THREE.PlaneGeometry(wW, z1 - z0), mat({ map: ceilT, rep: [wW / 2, (z1 - z0) / 2] })); c.rotation.x = PI / 2; return at(c, 0, H, (z0 + z1) / 2); };
    G.add(ceil(WAIT.z0, WAIT.z1)); G.add(ceil(GROOM.z0, GROOM.z1));
    // the fluorescent panels: a grid of glowing pale-green rectangles (the clip's ceiling)
    const panelM = glow(0xe6f2e0, 1);
    for (let ix = -2; ix <= 2; ix++) for (let iz = 0; iz < 8; iz++) {
      const z = GROOM.z0 + 1.0 + iz * 2.25; if (Math.abs(z) < 0.7 || z > WAIT.z1 - 0.6) continue;
      const p = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 0.6), panelM); p.rotation.x = PI / 2; G.add(at(p, ix * 2.4, H - 0.01, z));
    }
    // ---------------- walls: wood panelling in the waiting room, white tiles in the grooming room ----------------
    const wall = (w, h, T, tile = 1.2) => new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat({ map: T, rep: [w / tile, h / tile] }));
    const side = (x, z0, z1, T, dir) => G.add(rot(at(wall(z1 - z0, H, T), x, H / 2, (z0 + z1) / 2), 0, dir * PI / 2, 0));
    side(WAIT.x0, WAIT.z0, WAIT.z1, woodT, 1); side(WAIT.x1, WAIT.z0, WAIT.z1, woodT, -1);
    side(GROOM.x0, GROOM.z0, GROOM.z1, tileT, 1); side(GROOM.x1, GROOM.z0, GROOM.z1, tileT, -1);
    // the front wall (z = 9, facing -z) round the front door
    for (const [a, b] of [[WAIT.x0, FRONT.x0], [FRONT.x1, WAIT.x1]]) G.add(rot(at(wall(b - a, H, woodT), (a + b) / 2, H / 2, WAIT.z1), 0, PI, 0));
    G.add(rot(at(wall(FRONT.x1 - FRONT.x0, H - FRONT.h, woodT), (FRONT.x0 + FRONT.x1) / 2, (H + FRONT.h) / 2, WAIT.z1), 0, PI, 0));
    // the dividing wall (z = 0) round the GROOMING door: wood on the waiting side (+z), tiles on the grooming side (-z)
    for (const [T, yaw, dz] of [[woodT, 0, 0.005], [tileT, PI, -0.005]]) {
      for (const [a, b] of [[WAIT.x0, DOOR.x0], [DOOR.x1, WAIT.x1]]) G.add(rot(at(wall(b - a, H, T), (a + b) / 2, H / 2, dz), 0, yaw, 0));
      G.add(rot(at(wall(DOOR.x1 - DOOR.x0, H - DOOR.h, T), (DOOR.x0 + DOOR.x1) / 2, (H + DOOR.h) / 2, dz), 0, yaw, 0));
    }
    const trimM = M(0x2a140c);
    for (const x of [DOOR.x0 - 0.04, DOOR.x1 + 0.04]) G.add(at(box(0.08, DOOR.h, 0.14, trimM), x, DOOR.h / 2, 0));
    G.add(at(box(DOOR.x1 - DOOR.x0 + 0.16, 0.08, 0.14, trimM), (DOOR.x0 + DOOR.x1) / 2, DOOR.h + 0.04, 0));
    // the back wall of the grooming room (z = -8, facing +z) round the mirror's case
    const mW = MIRROR.w + 0.24, mH = MIRROR.h + MIRROR.y0 + 0.12;
    for (const [a, b] of [[GROOM.x0, MIRROR.x - mW / 2 - 0.02], [MIRROR.x + mW / 2 + 0.02, GROOM.x1]]) G.add(at(wall(b - a, H, tileT), (a + b) / 2, H / 2, GROOM.z0));
    G.add(at(wall(mW + 0.04, H - mH, tileT), MIRROR.x, (H + mH) / 2, GROOM.z0));
    // skirting boards
    const skirtW = M(0x2a140c), skirtT = M(0xb8c4c8);
    G.add(at(box(0.04, 0.12, wD, skirtW), WAIT.x0 + 0.02, 0.06, (WAIT.z0 + WAIT.z1) / 2)); G.add(at(box(0.04, 0.12, wD, skirtW), WAIT.x1 - 0.02, 0.06, (WAIT.z0 + WAIT.z1) / 2));
    G.add(at(box(0.04, 0.1, gD, skirtT), GROOM.x0 + 0.02, 0.05, (GROOM.z0 + GROOM.z1) / 2)); G.add(at(box(0.04, 0.1, gD, skirtT), GROOM.x1 - 0.02, 0.05, (GROOM.z0 + GROOM.z1) / 2));

    // ---------------- the GROOMING door: a pale wood leaf with a porthole, hinged at DOOR.x0, swinging to -z ----------------
    const doorPivot = at(new THREE.Group(), DOOR.x0, 0, 0); G.add(doorPivot);
    const leafM = M(0xd8b07a), dw = DOOR.x1 - DOOR.x0;
    doorPivot.add(at(box(dw - 0.02, DOOR.h - 0.02, 0.05, leafM), dw / 2, DOOR.h / 2, 0));
    doorPivot.add(at(new THREE.Mesh(new THREE.CircleGeometry(0.2, 10), mat({ color: 0xbfe0f0, unlit: 0.5, side: THREE.DoubleSide })), dw / 2, 1.55, 0.03));
    doorPivot.add(at(box(0.05, 0.05, 0.14, CHROME), dw - 0.12, 1.05, 0));
    // the sign over the door: GROOMING and a paw print
    const signT = tex(96, 24, x => {
      px(x, '#f6e8d2', 0, 0, 96, 24); x.fillStyle = '#c23a6a'; x.font = 'bold 13px monospace'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('GROOMING', 58, 13);
      x.fillStyle = '#3a2a2a'; x.beginPath(); x.arc(12, 14, 5, 0, TAU); x.fill(); for (const [dx, dy] of [[-5, -6], [-1, -9], [4, -9], [8, -6]]) { x.beginPath(); x.arc(12 + dx, 14 + dy, 2, 0, TAU); x.fill(); }
    }, 3906);
    G.add(at(new THREE.Mesh(new THREE.PlaneGeometry(1.5, 0.38), mat({ map: signT, unlit: 0.6 })), (DOOR.x0 + DOOR.x1) / 2, DOOR.h + 0.36, 0.02));

    // ---------------- the waiting room's furniture ----------------
    // the clip's lone chair (it tips back on its back legs: the pivot sits under them)
    const chairPivot = at(new THREE.Group(), CHAIR[0], 0, CHAIR[1] - 0.2); G.add(chairPivot);
    const lone = officeChair(M(0x2f7a78)); lone.position.z = 0.2; chairPivot.add(lone);
    // the brown leather sofa against the left wall (facing +x)
    const leather = M(0x7a4426), sofa = at(new THREE.Group(), SOFA.x, 0, (SOFA.z0 + SOFA.z1) / 2); G.add(sofa);
    const sL = SOFA.z1 - SOFA.z0;
    sofa.add(at(box(0.85, 0.3, sL, M(0x5a2e18)), 0, 0.15, 0));
    for (let i = 0; i < 3; i++) sofa.add(at(box(0.8, 0.12, sL / 3 - 0.04, leather), 0.02, SOFA.seatY - 0.06, -sL / 2 + (i + 0.5) * sL / 3));
    sofa.add(at(box(0.25, 0.6, sL, leather), -0.32, 0.6, 0));
    for (const s of [-1, 1]) sofa.add(at(box(0.85, 0.5, 0.22, leather), 0, 0.42, s * (sL / 2 + 0.06)));
    // the waiting chairs along the left wall (facing +x) with their customers
    const waitChairs = WAITERS.map(([x, z]) => { const c = officeChair(M(0x9a6a3a)); c.rotation.y = PI / 2; c.position.set(x, 0, z); G.add(c); return c; });
    // the reception desk, its bell, a till, the birdcage
    const deskM = M(0x6a3a22), deskTop = M(0xd8c8a8);
    G.add(at(box(DESK.x1 - DESK.x0, DESK.y, DESK.z1 - DESK.z0, deskM), (DESK.x0 + DESK.x1) / 2, DESK.y / 2, (DESK.z0 + DESK.z1) / 2));
    G.add(at(box(DESK.x1 - DESK.x0 + 0.06, 0.04, DESK.z1 - DESK.z0 + 0.06, deskTop), (DESK.x0 + DESK.x1) / 2, DESK.y + 0.02, (DESK.z0 + DESK.z1) / 2));
    G.add(at(cyl(0.05, 0.08, 0.06, 8, M(0xe8c040, { unlit: 0.3 })), 3.4, DESK.y + 0.07, 2.4)); G.add(at(ico(0.018, 0, CHROME), 3.4, DESK.y + 0.11, 2.4));
    G.add(at(box(0.36, 0.26, 0.3, M(0x3a3a40)), 5.25, DESK.y + 0.17, 2.35));
    const cageM = M(0xe0c050, { unlit: 0.3 }), cage = at(new THREE.Group(), CAGE[0], DESK.y + 0.04, CAGE[1]); G.add(cage);
    cage.add(at(cyl(0.2, 0.22, 0.04, 10, cageM), 0, 0.02, 0));
    for (let i = 0; i < 10; i++) { const a = i / 10 * TAU; cage.add(at(cyl(0.006, 0.006, 0.44, 3, cageM), Math.sin(a) * 0.19, 0.24, Math.cos(a) * 0.19)); }
    cage.add(at(cyl(0.02, 0.2, 0.12, 10, cageM), 0, 0.5, 0));
    cage.add(rot(at(cyl(0.006, 0.006, 0.32, 3, cageM), 0, 0.3, 0), 0, 0, PI / 2));
    const birds = [[-0.07, 0x7ad86a, 0xf06a8a], [0.07, 0x6ac8e8, 0xf0a04a]].map(([x, c, f]) => {
      const bd = at(new THREE.Group(), x, 0.31, 0); bd.add(ico(0.05, 0, M(c, { unlit: 0.2 }))); bd.add(at(ico(0.035, 0, M(f, { unlit: 0.2 })), 0, 0.05, 0.015));
      bd.add(rot(at(cone(0.012, 0.03, 4, M(0xf0c040)), 0, 0.05, 0.05), PI / 2, 0, 0)); cage.add(bd); return bd;
    });
    // the wall of fame: framed groomed pets on the right wall (facing -x); a gold frame waits for Saxo's photo
    const frameM = M(0xd8b860, { unlit: 0.25 });
    const famePic = (i, c) => tex(16, 20, x => { px(x, '#f4e8f0', 0, 0, 16, 20); x.fillStyle = css(c); x.beginPath(); x.arc(8, 9, 5, 0, TAU); x.fill(); x.beginPath(); x.arc(4, 4, 2.5, 0, TAU); x.arc(12, 4, 2.5, 0, TAU); x.fill(); px(x, '#f06aa0', 5, 15, 6, 2); }, 3910 + i);
    const FRAMES = [[4.6, 1.6, 0xf2eee6], [5.3, 1.25, 0xd8a868], [6.8, 1.65, 0x9a9aa4], [7.4, 1.3, 0xe8c090], [7.6, 1.95, 0x8a7a6c]];
    FRAMES.forEach(([z, y, c], i) => {
      const f = at(new THREE.Group(), FAME.x, y, z); f.rotation.y = -PI / 2; G.add(f);
      f.add(at(box(0.5, 0.6, 0.04, frameM), 0, 0, 0)); f.add(at(new THREE.Mesh(new THREE.PlaneGeometry(0.4, 0.5), mat({ map: famePic(i, c), unlit: 0.35 })), 0, 0, 0.025));
    });
    const saxoFrame = at(new THREE.Group(), FAME_SAXO[0], FAME_SAXO[1], FAME_SAXO[2]); saxoFrame.rotation.y = -PI / 2; G.add(saxoFrame);
    saxoFrame.add(at(box(0.62, 0.74, 0.05, M(0xf0c040, { unlit: 0.45 })), 0, 0, 0));
    const poodleT = tex(20, 24, x => {
      px(x, '#f6e8f2', 0, 0, 20, 24); x.fillStyle = '#fbfaf6';
      for (const [cx, cy, r] of [[10, 5, 3.4], [5, 9, 3], [15, 9, 3], [4, 14, 3], [16, 14, 3], [6, 19, 3.2], [14, 19, 3.2], [10, 21, 3.4]]) { x.beginPath(); x.arc(cx, cy, r, 0, TAU); x.fill(); }
      x.fillStyle = '#9a9aa4'; x.beginPath(); x.arc(10, 13, 4.6, 0, TAU); x.fill(); px(x, '#6a6a74', 4, 9, 2, 5); px(x, '#6a6a74', 14, 9, 2, 5);
      px(x, '#111111', 8, 12, 1, 1); px(x, '#111111', 11, 12, 1, 1); px(x, '#111111', 9, 14, 2, 1);
      x.fillStyle = '#f07aa8'; x.beginPath(); x.moveTo(10, 4); x.lineTo(5, 1); x.lineTo(5, 7); x.fill(); x.beginPath(); x.moveTo(10, 4); x.lineTo(15, 1); x.lineTo(15, 7); x.fill();
      px(x, '#f07aa8', 7, 18, 6, 1); px(x, '#e8c040', 9, 19, 2, 2);
    }, 3919);
    const saxoPic = at(new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.6), mat({ map: poodleT, unlit: 0.55 })), 0, 0, 0.03); saxoFrame.add(saxoPic);   // his portrait: the poodle cut
    // the glass front door (z = 9): a chrome frame, a pane, the street's glow behind it
    const frontPivot = at(new THREE.Group(), FRONT.x0, 0, WAIT.z1); G.add(frontPivot);
    const fw = FRONT.x1 - FRONT.x0;
    frontPivot.add(at(box(fw, 0.08, 0.06, CHROME), fw / 2, FRONT.h - 0.04, 0)); frontPivot.add(at(box(fw, 0.08, 0.06, CHROME), fw / 2, 0.04, 0));
    for (const x of [0.04, fw - 0.04]) frontPivot.add(at(box(0.08, FRONT.h, 0.06, CHROME), x, FRONT.h / 2, 0));
    frontPivot.add(at(new THREE.Mesh(new THREE.PlaneGeometry(fw - 0.12, FRONT.h - 0.12), mat({ color: 0xc8e8f8, unlit: 0.5, see: 0.55, side: THREE.DoubleSide })), fw / 2, FRONT.h / 2, 0));
    G.add(rot(at(new THREE.Mesh(new THREE.PlaneGeometry(fw + 1.2, FRONT.h + 0.6), glow(0xf4e2b8, 0.9)), (FRONT.x0 + FRONT.x1) / 2, FRONT.h / 2, WAIT.z1 + 1.2), 0, PI, 0));
    // a potted plant, a magazine table
    G.add(at(cyl(0.2, 0.16, 0.36, 8, M(0xc86a3a)), 5.4, 0.18, 8.4));
    for (let i = 0; i < 6; i++) G.add(rot(at(cone(0.12, 0.7, 4, M(0x3a8a4a)), 5.4 + Math.sin(i) * 0.12, 0.62, 8.4 + Math.cos(i) * 0.12), Math.sin(i * 2) * 0.4, 0, Math.cos(i * 2) * 0.4));
    G.add(at(box(0.7, 0.3, 0.5, M(0x8a5a32)), -4.6, 0.15, 4.1));

    // ---------------- the grooming room ----------------
    // the raised steel tub on four legs, its water, foam, the duck
    const steel = M(0xb8c2cc, { unlit: 0.2 }), tub = at(new THREE.Group(), TUB.x, 0, TUB.z); G.add(tub);
    const tw = TUB.w, td = TUB.d, wallH = TUB.rim - TUB.y + 0.06;
    tub.add(at(box(tw, 0.06, td, steel), 0, TUB.y - 0.03, 0));
    tub.add(at(box(tw + 0.08, wallH, 0.05, steel), 0, TUB.y + wallH / 2 - 0.06, td / 2 + 0.025)); tub.add(at(box(tw + 0.08, wallH, 0.05, steel), 0, TUB.y + wallH / 2 - 0.06, -td / 2 - 0.025));
    for (const s of [-1, 1]) tub.add(at(box(0.05, wallH, td, steel), s * (tw / 2 + 0.025), TUB.y + wallH / 2 - 0.06, 0));
    for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) tub.add(at(cyl(0.035, 0.035, TUB.y, 5, steel), sx * (tw / 2 - 0.08), TUB.y / 2, sz * (td / 2 - 0.08)));
    tub.add(at(box(0.5, 0.06, 0.44, steel), -tw / 2 - 0.45, 0.25, 0));
    const water = flat(tw, td, mat({ color: 0x8ad0f0, unlit: 0.45, see: 0.45 }), 0, TUB.water, 0); tub.add(water);
    const foamM = mat({ color: 0xffffff, unlit: 0.55 }), foam = Array.from({ length: 26 }, (_, i) => { const f = ico(0.07 + 0.06 * hash(i, 3920), 0, foamM); f.scale.y = 0.55; tub.add(f); return f; });
    const duck = at(new THREE.Group(), 0.42, TUB.water + 0.04, 0.18); tub.add(duck);
    duck.add(at(ico(0.09, 1, M(0xffd23a, { unlit: 0.35 })), 0, 0.05, 0)); duck.add(at(ico(0.06, 1, M(0xffd23a, { unlit: 0.35 })), 0, 0.15, 0.05));
    duck.add(rot(at(cone(0.025, 0.06, 4, M(0xf07a2a, { unlit: 0.4 })), 0, 0.14, 0.12), PI / 2, 0, 0));
    for (const e of [-1, 1]) duck.add(at(ico(0.012, 0, M(0x111111)), e * 0.035, 0.17, 0.1));
    // the rain head over the tub on a chrome pole and arm (the pole at the tub's back left corner)
    const poleX = TUB.x - tw / 2 - 0.12, poleZ = TUB.z - td / 2 - 0.1;
    G.add(at(cyl(0.025, 0.025, SHOWER[1], 6, CHROME), poleX, SHOWER[1] / 2, poleZ));
    G.add(at(box(SHOWER[0] - poleX + 0.04, 0.04, 0.04, CHROME), (poleX + SHOWER[0]) / 2, SHOWER[1], poleZ));
    G.add(at(box(0.04, 0.04, Math.abs(SHOWER[2] - poleZ) + 0.04, CHROME), SHOWER[0], SHOWER[1], (SHOWER[2] + poleZ) / 2));
    G.add(at(cyl(0.16, 0.1, 0.05, 10, CHROME), SHOWER[0], SHOWER[1] - 0.04, SHOWER[2]));
    const rainM = mat({ color: 0xd8f2ff, unlit: 0.7, see: 0.25 }), rain = Array.from({ length: 40 }, () => { const r = box(0.014, 0.16, 0.014, rainM); r.visible = false; G.add(r); return r; });
    // the dryer: a pedestal blaster on a five-legged base, its head (a hose and a nozzle) turned to the target
    const dryer = at(new THREE.Group(), DRYER[0], 0, DRYER[1]); G.add(dryer);
    dryer.add(at(cyl(0.03, 0.03, 1.0, 6, CHROME), 0, 0.55, 0));
    for (let i = 0; i < 5; i++) { const a = i / 5 * TAU; dryer.add(rot(at(box(0.3, 0.03, 0.04, CHROME), Math.sin(a) * 0.15, 0.06, Math.cos(a) * 0.15), 0, a, 0)); }
    dryer.add(at(box(0.42, 0.36, 0.34, M(0xe8547a, { unlit: 0.15 })), 0, 1.15, 0));
    dryer.add(at(box(0.3, 0.06, 0.02, glow(0xfff4a0, 0.9)), 0, 1.24, 0.18));
    const dryHead = at(new THREE.Group(), 0, 1.15, 0); dryer.add(dryHead);
    dryHead.add(rot(at(cyl(0.06, 0.06, 0.7, 8, M(0x5a5a64)), 0, 0, 0.5), PI / 2, 0, 0)); dryHead.add(rot(at(cyl(0.1, 0.07, 0.18, 8, M(0xe8547a)), 0, 0, 0.92), PI / 2, 0, 0));
    // shelves of shampoo bottles on the left wall, a towel rack
    const shelfM = M(0xf2f2ee);
    for (const y of [1.2, 1.7]) {
      G.add(at(box(0.3, 0.04, 2.0, shelfM), GROOM.x0 + 0.16, y, -2.2));
      for (let i = 0; i < 7; i++) G.add(at(box(0.1, 0.2 + hash(i, y) * 0.1, 0.1, M([0x6ad0e8, 0xf08ab0, 0xa8e870, 0xf2d060][i % 4], { unlit: 0.2 })), GROOM.x0 + 0.16, y + 0.13, -3.0 + i * 0.27));
    }
    G.add(at(box(0.06, 0.06, 1.4, CHROME), GROOM.x0 + 0.1, 1.0, -6.2));
    for (let i = 0; i < 3; i++) G.add(at(box(0.04, 0.5, 0.36, M([0xf2b8d0, 0xb8e0f2, 0xfaf0c8][i])), GROOM.x0 + 0.12, 0.76, -6.7 + i * 0.45));
    // the dressing mirror set into the back wall: a portal (the glass at z = MIRROR.z, the case going -z behind it)
    const mir = mirrorPortal(G, MIRROR);

    // ---------------- drops, rain, the dryer's blast, fluff, hearts ----------------
    const dropM = mat({ color: 0xf2fbff, unlit: 0.9 }), drops = Array.from({ length: 200 }, () => { const q = ico(1, 0, dropM); q.visible = false; G.add(q); return q; });
    const streakM = mat({ color: 0xffffff, unlit: 0.9, see: 0.3 }), streaks = Array.from({ length: 30 }, () => { const q = box(0.02, 0.02, 0.5, streakM); q.visible = false; G.add(q); return q; });
    const fluffM = mat({ color: 0xfbfaf6, unlit: 0.55 }), fluff = Array.from({ length: 200 }, () => { const q = ico(1, 1, fluffM); q.visible = false; G.add(q); return q; });
    const ringM = mat({ color: 0xf2fdff, unlit: 0.8, see: 0.3 }), rings = Array.from({ length: 2 }, () => { const q = new THREE.Mesh(new THREE.TorusGeometry(1, 0.05, 4, 16), ringM); q.rotation.x = PI / 2; q.visible = false; G.add(q); return q; });
    const puddles = Array.from({ length: 3 }, () => { const q = flat(1, 1, mat({ color: 0x8ac8e8, unlit: 0.4, see: 0.35 }), 0, 0.012, 0); q.geometry = new THREE.CircleGeometry(0.45, 12); q.visible = false; G.add(q); return q; });
    const heartM = M(0xff4f9a, { unlit: 0.8 }), hearts = [];
    for (let i = 0; i < 12; i++) { const h = new THREE.Group(); h.add(at(ico(0.1, 0, heartM), -0.075, 0, 0)); h.add(at(ico(0.1, 0, heartM), 0.075, 0, 0)); h.add(rot(at(cone(0.125, 0.18, 4, heartM), 0, -0.11, 0), PI, 0, 0)); h.visible = false; G.add(h); hearts.push(h); }
    // the customers
    const guests = WAITERS.map(([x, z], i) => { const p = pet(i); G.add(p.g); return { p, x, z }; });

    return {
      group: G, sky: null, shadowCol: 0x23402f, indoor: true,
      light() { lights(0x6a6a5a, 0xf2f0e2, [0.2, -1, -0.3], 0x141a14, [12, 34], 7); },
      anim(t, P = {}) {
        const s = shotT(t, P), b = beat(t), zone = P.zone || 'wait';
        // the rooms' lights: the waiting room dim and green under its panels, the grooming room bright and cool
        if (zone === 'groom') { pt(0, -2.2, 3.0, -3.6, 1.25, 1.3, 1.35); pt(1, 2.2, 3.0, -5.8, 1.1, 1.15, 1.2); pt(2, 0.6, 2.8, -1.4, 0.8, 0.85, 0.9); }
        else { pt(0, -1.6, 3.0, 4.2, 1.0, 1.1, 0.92); pt(1, 2.6, 3.0, 6.4, 0.85, 0.92, 0.78); pt(2, 1.6, 2.6, 1.2, 0.7, 0.72, 0.62); }
        if (P.key) pt(3, P.key[0], P.key[1], P.key[2], P.key[3], P.key[4], P.key[5]);
        // doors, the chair
        doorPivot.rotation.y = 1.75 * cl(ramp(P.door, s));
        frontPivot.rotation.y = -1.4 * cl(ramp(P.front, s));
        chairPivot.rotation.x = -0.66 * cl(ramp(P.tip, s)); chairPivot.visible = P.chair !== false;
        if (P.chairAt) { const [x0, z0, x1 = x0, z1 = z0, s0 = 0, s1 = 1] = P.chairAt, u = cl((s - s0) / Math.max(0.01, s1 - s0)); chairPivot.position.set(x0 + (x1 - x0) * u, 0, z0 + (z1 - z0) * u - 0.2); chairPivot.rotation.y = P.chairYaw ? P.chairYaw * PI / 180 : 0; } else { chairPivot.position.set(CHAIR[0], 0, CHAIR[1] - 0.2); chairPivot.rotation.y = 0; }   // chairAt [x0, z0, x1, z1, s0, s1]: the chair dragged linearly (a sitter on the same linear mx/mz rides it)
        // the lovebirds bob on the beat; the customers wait, stare, cheer or gasp
        birds.forEach((q, i) => { q.position.y = 0.31 + 0.02 * Math.abs(Math.sin((b + i * 0.5) * PI)); q.rotation.y = 0.4 * Math.sin(b * PI + i); });
        const mode = P.pets ?? 'wait';
        guests.forEach((q, i) => {
          const { p } = q, gone = cleared(P, q.x, q.z), show = mode !== false && !P.noguests && !gone;
          p.g.visible = show; waitChairs[i].visible = !gone; if (!show) return;
          p.g.position.set(q.x, WAITER_Y - 0.14, q.z);
          const yaw = P.stare && mode !== 'wait' ? Math.atan2(P.stare[0] - q.x, P.stare[1] - q.z) : PI / 2;
          p.g.rotation.y = yaw; p.head.rotation.set(0, 0, 0); p.mouth.visible = false;
          p.legs.children.forEach((l, j) => { l.rotation.x = mode === 'wait' ? 0.25 * Math.sin(b * PI + j * PI) : 0; });
          p.arms.forEach(a => { a.rotation.set(0, 0, 0); });
          if (mode === 'cheer') { const up = Math.abs(Math.sin(b * PI)); p.arms.forEach((a, j) => { a.rotation.z = (j ? 1 : -1) * (2.3 + 0.3 * up); }); p.mouth.visible = true; }
          else if (mode === 'gasp') { p.arms.forEach((a, j) => { a.rotation.x = -2.3; a.rotation.z = (j ? 1 : -1) * 0.35; }); p.mouth.visible = true; p.head.rotation.x = -0.15; }
        });
        saxoPic.visible = !!P.fame;
        // the tub: foam, the duck, the rain, a splash
        foam.forEach((f, i) => { f.visible = !!P.foam; if (!f.visible) return; const a = hash(i, 3921) * TAU, r = 0.15 + 0.5 * hash(i, 3922); f.position.set(Math.cos(a) * r * tw / 1.4, TUB.water + 0.02 + 0.02 * Math.sin(t * 3 + i), Math.sin(a) * r * td / 1.6); });
        duck.visible = !!P.duck; duck.position.y = TUB.water + 0.03 + 0.03 * Math.sin(b * PI); duck.rotation.z = 0.2 * Math.sin(b * PI + 1); duck.rotation.y = 0.6 + 0.3 * Math.sin(t * 0.7);
        const raining = from(P.shower, s);
        rain.forEach((r, i) => { r.visible = raining; if (!raining) return; const e = fr(t * 2.2 + hash(i, 3923)), a = hash(i, 3924) * TAU, rr = 0.14 * Math.sqrt(hash(i, 3925)); r.position.set(SHOWER[0] + Math.cos(a) * rr * (1 + e), SHOWER[1] - 0.08 - e * (SHOWER[1] - TUB.water - 0.1), SHOWER[2] + Math.sin(a) * rr * (1 + e)); });
        drops.forEach(q => { q.visible = false; }); rings.forEach(q => { q.visible = false; });
        let di = 0;
        (P.splash || []).forEach(([x, z, s0, size = 1], k2) => {
          const age = s - s0; if (age < 0 || age > 0.9) return;
          for (let j = 0; j < 30 && di < drops.length; j++) {
            const a = hash(j, 3926) * TAU, v = (1.9 + 1.4 * hash(j, 3927)) * size, sp = (0.5 + 0.8 * hash(j, 3928)) * size, y = TUB.water + v * age - 4.9 * age * age;
            if (y < TUB.water - 0.05) continue;
            const q = drops[di++]; q.visible = true; q.position.set(x + Math.cos(a) * sp * age, y, z + Math.sin(a) * sp * age); q.scale.setScalar((0.035 + 0.025 * hash(j, 3929)) * size);
          }
          const rg = rings[k2 % rings.length]; rg.visible = true; rg.position.set(x, TUB.water + 0.02, z); rg.scale.setScalar(Math.min(0.6, 0.2 + age * 0.9) * size);
        });
        // the wet dog's shake: a ring of drops flung out on every half beat, falling as they fly
        if (P.shake) {
          const [x, y, z, s0 = 0, s1 = 99] = P.shake, hb = 30 / 105;
          for (let w = 0; w < 3; w++) {
            const bb = Math.floor(b * 2) - w, age = (b * 2 - bb) * hb, sb = s - age; if (sb < s0 || sb > s1) continue;
            for (let j = 0; j < 22 && di < drops.length; j++) {
              const a = (j / 22) * TAU + hash(bb, j, 3930) * 0.3, el = (hash(bb, j, 3931) - 0.3) * 0.9, v = 2.2 + 1.2 * hash(bb, j, 3932);
              const q = drops[di++], y1 = y + Math.sin(el) * v * age - 4.9 * age * age; q.visible = y1 > 0.02; if (!q.visible) continue;
              q.position.set(x + Math.cos(a) * Math.cos(el) * v * age, y1, z + Math.sin(a) * Math.cos(el) * v * age); q.scale.setScalar(0.03 + 0.02 * hash(bb, j, 3933));
            }
          }
        }
        // drips off the soaked: drops from round the head down to the floor, a wet patch at the feet
        (P.drips || []).forEach(([x, z, h = 1.25], k2) => {
          for (let j = 0; j < 14 && di < drops.length; j++) {
            const ph = fr(t * 1.6 + hash(j, k2, 3934)), a = hash(j, k2, 3935) * TAU, r = 0.22 + 0.2 * hash(j, k2, 3936), y = h * (1 - ph * ph);
            const q = drops[di++]; q.visible = true; q.position.set(x + Math.cos(a) * r, Math.max(0.02, y), z + Math.sin(a) * r); q.scale.setScalar(0.035 + 0.02 * hash(j, k2, 3937));
          }
        });
        puddles.forEach((q, k2) => { const pd = (P.drips || [])[k2]; q.visible = !!pd; if (pd) q.position.set(pd[0], 0.012, pd[1]); });
        // the dryer: its head turned to the target; the blast's streaks and the drops blown off past it
        const aim = P.dryerAim || (P.dryer ? [P.dryer[0], P.dryer[2]] : [TUB.x, TUB.z]);
        dryHead.rotation.y = Math.atan2(aim[0] - DRYER[0], aim[1] - DRYER[1]);
        streaks.forEach(q => { q.visible = false; });
        if (P.dryer && s >= (P.dryer[3] ?? 0)) {
          const [tx, ty, tz] = P.dryer, a = dryHead.rotation.y, nx = DRYER[0] + Math.sin(a) * 0.95, nz = DRYER[1] + Math.cos(a) * 0.95, ny = 1.15;
          const dx = tx - nx, dy = ty - ny, dz = tz - nz, L = Math.hypot(dx, dy, dz) || 1;
          streaks.forEach((q, i) => {
            const e = fr(t * 2.6 + hash(i, 3938)), off = 0.06 + 0.3 * e, oa = hash(i, 3939) * TAU;
            q.visible = true; q.position.set(nx + dx * e + Math.cos(oa) * off * 0.6, ny + dy * e + Math.sin(oa) * off * 0.6, nz + dz * e); q.lookAt(tx + Math.cos(oa) * off, ty + Math.sin(oa) * off, tz); q.scale.z = 0.6 + 0.8 * e;
          });
          for (let j = 0; j < 30 && di < drops.length; j++) {
            const e = fr(t * 1.8 + hash(j, 3940)), oa = hash(j, 3941) * TAU, r = 0.25 + 0.5 * e;
            const q = drops[di++]; q.visible = true; q.position.set(tx + dx / L * e * 1.4 + Math.cos(oa) * r, ty + Math.sin(oa) * r * 0.8 + 0.1, tz + dz / L * e * 1.4 + Math.sin(oa) * r * 0.3); q.scale.setScalar(0.035 + 0.03 * hash(j, 3942));
          }
        }
        // the fluff cloud: white puffs swelling round a point, then blowing away
        fluff.forEach(q => { q.visible = false; });
        if (P.fluff) {
          const [x, z, s0, s1, r0 = 0.8, y0 = 0.8] = P.fluff;
          if (s >= s0) fluff.forEach((q, i) => {
            const g = sm((s - s0) / 0.5), out = s > s1 ? (s - s1) : 0, a = hash(i, 3943) * TAU, el = (hash(i, 3944) - 0.4) * 1.6, rr = r0 * (0.35 + 0.65 * hash(i, 3945)) * g + out * (1.2 + hash(i, 3946));
            q.visible = out < 1.2; if (!q.visible) return;
            q.position.set(x + Math.cos(a) * Math.cos(el) * rr, y0 + Math.sin(el) * rr * 0.9 + out * 0.6, z + Math.sin(a) * Math.cos(el) * rr);
            q.scale.setScalar((0.04 + 0.045 * hash(i, 3947)) * g * (1 - out / 1.2) + 0.001); q.rotation.set(t + i, t * 0.7 + i, 0);   // small tufts: 0.16-0.28 m puffs read as a pile of snowballs
          });
        }
        // hearts: three pink hearts pop and rise from each point (again every 1.2 s when it loops)
        hearts.forEach((h, i) => {
          const q = (P.hearts || [])[Math.floor(i / 3)]; h.visible = false; if (!q) return;
          let e = s - q[3] - (i % 3) * 0.3; if (q[4] && e > 0) e %= 1.2;
          if (e < 0 || e > 1.4) return;
          h.visible = true; h.position.set(q[0] + ((i % 3) - 1) * 0.22 + 0.06 * Math.sin(e * 6 + i), q[1] + 0.55 * e, q[2]); h.scale.setScalar(Math.min(1, e * 5) * (1.15 - 0.25 * (e / 1.4)));
          h.rotation.y = (P.heartYaw ?? 0) * PI / 180;
        });
        mir.set(P);
      },
    };
  }

  // the dressing mirror as a portal (src/maps20.js's, without the smash): the glass at z = MIRROR.z facing +z, a case
  // going -z behind it painted like the grooming room seen in a mirror (white tiles, the door), bulbs round it
  function mirrorPortal(G, spec) {
    const { x, z, w, h, y0, depth } = spec, fw = 0.12, W = w + 2 * fw, Hh = h + y0 + fw;
    const root = new THREE.Group(); G.add(root); root.position.set(x, 0, z); root.rotation.y = PI;
    const caseM = M(0x1c1c22), frameM = mat({ color: 0xf6e6ee, unlit: 0.35 });
    root.add(at(box(W, 0.04, depth, caseM), 0, Hh + 0.02, depth / 2)); root.add(at(box(W, Hh, 0.04, caseM), 0, Hh / 2, depth + 0.02));
    for (const sx of [-1, 1]) root.add(at(box(0.04, Hh, depth, caseM), sx * (W / 2 + 0.02), Hh / 2, depth / 2));
    for (const [yy, hh] of [[y0 / 2, y0], [y0 + h + fw / 2, fw]]) root.add(at(box(W, hh, 0.06, frameM), 0, yy, -0.03));
    for (const sx of [-1, 1]) root.add(at(box(fw, h, 0.06, frameM), sx * (w / 2 + fw / 2), y0 + h / 2, -0.03));
    const bulbM = glow(0xfff2c8), bulbs = [];
    for (let i = 0; i < 5; i++) bulbs.push(at(ico(0.04, 0, bulbM), -w / 2 + (i + 0.5) * w / 5, y0 + h + fw / 2, -0.07));
    for (const sx of [-1, 1]) for (let i = 0; i < 6; i++) bulbs.push(at(ico(0.04, 0, bulbM), sx * (w / 2 + fw / 2), y0 + 0.12 + i * (h - 0.1) / 5, -0.07));
    bulbs.forEach(q => root.add(q));
    const inT = tex(32, 32, (c, r) => { px(c, '#e8eef0', 0, 0, 32, 32); noise(c, r, 32, 32, ['#e2e9ec', '#eef3f4'], 90); px(c, '#c8d2d6', 0, 0, 32, 1); px(c, '#c8d2d6', 0, 0, 1, 32); }, 3950);
    const backT = tex(64, 48, c => { px(c, '#e8eef0', 0, 0, 64, 48); for (let i = 0; i < 64; i += 8) px(c, '#c8d2d6', i, 0, 1, 48); for (let j = 0; j < 48; j += 8) px(c, '#c8d2d6', 0, j, 64, 1); px(c, '#d8b07a', 20, 14, 12, 34); px(c, '#bfe0f0', 24, 18, 4, 4); }, 3951);
    const inside = new THREE.Group(); root.add(inside);
    const back = new THREE.Mesh(new THREE.PlaneGeometry(W, Hh + 0.6), mat({ map: backT, unlit: 0.4 })); back.rotation.y = PI; back.position.set(0, (Hh + 0.6) / 2 - 0.3, depth - 0.02); inside.add(back);
    const sideM = mat({ map: inT, rep: [depth / 1.2, (Hh + 0.6) / 1.2], unlit: 0.3 });
    for (const sx of [-1, 1]) { const sw = new THREE.Mesh(new THREE.PlaneGeometry(depth, Hh + 0.6), sideM); sw.rotation.y = sx * PI / 2; sw.position.set(-sx * (W / 2 - 0.01), (Hh + 0.6) / 2 - 0.3, depth / 2); inside.add(sw); }
    const top = new THREE.Mesh(new THREE.PlaneGeometry(W, depth), M(0x3a3a36, { unlit: 0.3 })); top.rotation.x = PI / 2; top.position.set(0, Hh - 0.01, depth / 2); inside.add(top);
    const floT = tex(32, 32, (c, r) => { px(c, '#9aaab4', 0, 0, 32, 32); noise(c, r, 32, 32, ['#94a4ae', '#a2b2bc'], 160); px(c, '#86969e', 0, 0, 32, 1); px(c, '#86969e', 0, 0, 1, 32); }, 3952);
    const flo = new THREE.Mesh(new THREE.PlaneGeometry(W, depth), mat({ map: floT, rep: [W / 1.2, depth / 1.2] })); flo.rotation.x = -PI / 2; flo.position.set(0, 0.004, depth / 2); inside.add(flo);
    const glass = new THREE.Group(); root.add(glass);
    glass.add(at(new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat({ color: 0xe8f2ff, unlit: 0.6, see: 0.86, side: THREE.DoubleSide })), 0, y0 + h / 2, -0.005));
    for (const [gx, gl] of [[-0.18, 0.5], [0.05, 0.28]]) { const q = at(box(0.035, gl, 0.004, mat({ color: 0xffffff, unlit: 1, see: 0.35 })), gx, y0 + h * 0.66, -0.01); q.rotation.z = -0.6; glass.add(q); }
    function set(P) {
      root.visible = P.mirror !== false; glass.visible = !P.noGlass;
      bulbs.forEach(q => { q.visible = P.bulbs !== false; });
    }
    return { root, set };
  }

  return { salon: salon() };
}
