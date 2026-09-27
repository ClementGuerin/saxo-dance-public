// maps12.js: the "Patient Zero" maps (2026-09-27, Taylor Swift: the friend who goes to the party sick). Same contract as
// the other map files, pure in t:
//   block  one night street, three places: Saxo's bedroom (his sick bed against the back wall, the nightstand with the
//          tissue box, pills and a lamp, crumpled tissues; the window behind the bed looks onto the street), the street
//          (road, sidewalks, a street lamp, parked cars, puddles, rain with `rain`) and across it the party house: its
//          windows glow and flash on the beat with dancing silhouettes, and inside is the party itself (a living room:
//          a light-up dance floor under a mirror ball, the snack table with the punch bowl, a low couch, balloons,
//          streamers, a garland, pet guests in party hats dancing on the beat).
//          Spots (BLOCK): MAT (the mattress top), BED (the bed's x, its head z), SIT ([x, z]: where he sits up against
//          the pillow), NIGHT ([x, z], top NIGHT_Y), WIN (the window's x span, y span, z: above the bed, the party
//          across the street framed behind his head), LAMP ([x, z]), DOOR (the party
//          house's door centre [x, z]), FLOOR (the dance floor's centre), PUNCH ([x, y, z]: the bowl), COUCH ([x, z]: the
//          seat's centre, top COUCH_Y), HOUSE_DOOR (his own front door [x, z]).
//          Flags read by anim(t, P): `zone` ('room' | 'street' | 'party': which lights; default 'room'), `rain`,
//          `noguests`, `clear` ([[x, z, r]]: no guest near those points: a lens, the marks), `ripple` (cut s: the punch
//          ripples and turns green: the sneeze), `lamp` (false: the bedside lamp off), `sickGuests` (red noses on every
//          guest: it spread), `flatPillow` (the pillow lies flat: a sleeper), `cover` (the quilt pulled up over him),
//          `lampCone` (false hides the street lamp's dithered light cone: a lens inside it sees a dot grid), zone `morning` (daylight through the window, a day sky, the party house dark).
//   ward   a hospital ward in the morning: five beds against the back wall (mattress top WARD.MAT), a heart monitor by
//          each (its trace blips on every beat), IV poles, curtain rails, tall windows onto a blue morning, the door in
//          the right wall; pet patients in party hats in the beds the story leaves free, confetti on the blankets.
//          Spots (WARD): BEDS (each bed's x), HEAD_Z (the headboards), SIT_Z (where a patient sits up), MAT, DOOR.
//          Flags: `flat` ([bed, s]: that monitor flatlines s into the shot), `pax` (the beds holding a pet: default
//          [0, 4]), `noPax`, `stare` ([x, z]: the pets' heads turn there), `clear`, `front` (the front wall, for a reverse
//          angle from the beds: the room is open at the front for the cameras).
import { mapKit } from './mapkit.js';

export const BLOCK = { MAT: 0.5, BED: [-1.3, -2.15], SIT: [-1.3, -1.5], NIGHT: [-0.35, -1.95], NIGHT_Y: 0.55, WIN: [-2.1, -0.5, 1.2, 2.3, -2.2],
  LAMP: [3.4, -12.6], DOOR: [1.0, -14.2], FLOOR: [1.0, -17.4], PUNCH: [-4.3, 0.9, -18.2], COUCH: [4.4, -21.2], COUCH_Y: 0.1, HOUSE_DOOR: [3.7, -2.3] };
export const WARD = { BEDS: [-4.0, -2.0, 0, 2.0, 4.0], HEAD_Z: -3.15, SIT_Z: -2.55, MAT: 0.62, DOOR: [6, 1.6] };

export function buildPatientMaps(K) {
  const k = mapKit(K);
  const { THREE, mat, tex, px, noise, box, selfLit, TAU, PI, hash, beat, hit, grad, sign, cyl, cone, ico, at, rot, merged, flat, lights, pt, room, fall, prism } = k;
  const M = (c, o = {}) => mat({ color: c, ...o }), glow = c => mat({ color: c, unlit: 1 });
  const PARTY = [0xff5fa2, 0x3fd4ff, 0xffd43b, 0x9a6aff, 0x6bd46b];
  const pmod = (a, n) => ((a % n) + n) % n;   // before the first beat the beat index is negative
  const cleared = (P, x, z) => (P.clear || []).some(([cx, cz, r]) => (x - cx) ** 2 + (z - cz) ** 2 < r * r);

  // a background pet (a party guest, a patient): box body, big head facing +z, ears by kind, a party hat
  const FURS = [0xd8c2a0, 0x3a2e28, 0xf2eee6, 0x9a7a5a, 0x6a6a72, 0xe8a060, 0x2a2a30, 0xc8b8e0], TOPS = [0xe84a6a, 0x4a8fe8, 0xf2c94c, 0x6bd46b, 0xffffff, 0xff9a3c, 0x8a5ad8, 0x2a2a3a];
  function pet(i, { hat = true, sick = false } = {}) {
    const g = new THREE.Group(), fur = M(FURS[i % FURS.length]), kind = i % 3, top = M(TOPS[(i * 5) % TOPS.length]);
    const body = new THREE.Group(); g.add(body);
    body.add(at(box(0.36, 0.44, 0.26, top), 0, 0.3, 0));
    for (const s of [-1, 1]) body.add(at(box(0.11, 0.12, 0.12, fur), s * 0.09, 0.06, 0.02));
    const head = at(new THREE.Group(), 0, 0.72, 0); body.add(head);
    head.add(box(0.42, 0.38, 0.38, fur));
    head.add(at(box(0.15, 0.1, 0.1, M(0x1a1a1a)), 0, -0.06, 0.2));
    for (const e of [-1, 1]) {
      head.add(at(box(0.06, 0.06, 0.02, M(0x101010)), e * 0.1, 0.04, 0.195));
      head.add(kind === 0 ? rot(at(cone(0.08, 0.2, 4, fur), e * 0.14, 0.26, 0), 0, 0, -e * 0.25) : kind === 1 ? at(box(0.08, 0.3, 0.06, fur), e * 0.1, 0.32, 0) : rot(at(box(0.07, 0.24, 0.16, fur), e * 0.23, 0.02, 0), 0, 0, e * 0.3));
    }
    if (hat) { head.add(rot(at(cone(0.09, 0.26, 6, M(PARTY[i % 5])), 0.05, 0.32, 0), 0, 0, -0.25)); head.add(at(ico(0.035, 0, glow(0xffffff)), 0.1, 0.46, 0)); }
    if (sick) head.add(rot(at(box(0.02, 0.02, 0.2, M(0xf6fbff)), 0.08, -0.12, 0.26), 0.3, 0.5, 0));
    const nose = at(ico(0.05, 0, M(0xff4a4a)), 0, -0.04, 0.25); nose.visible = sick; head.add(nose);
    return { g, body, head, nose, i };
  }

  // =====================================================================================================================
  function block() {
    const G = new THREE.Group(), { MAT, BED, NIGHT, NIGHT_Y, WIN, LAMP, DOOR, FLOOR, PUNCH, COUCH, HOUSE_DOOR } = BLOCK;
    const [WX0, WX1, WY0, WY1, WZ] = WIN, BX = BED[0];
    // ---------------- the bedroom: x -2.5..2.5, z -2.2..2.6, 2.7 m high, open at the front for the cameras ----------------
    const boards = tex(32, 32, (x, r) => { px(x, '#8a6040', 0, 0, 32, 32); for (let y = 0; y < 32; y += 8) { px(x, '#76502f', 0, y, 32, 1); for (let X = (y / 8) % 2 ? 6 : 14; X < 32; X += 16) px(x, '#76502f', X, y, 1, 8); } noise(x, r, 32, 32, ['#80583a', '#946a48'], 50); }, 1201);
    G.add(flat(5, 4.8, mat({ map: boards, rep: [3, 3] }), 0, 0, 0.2));
    const paper = tex(16, 16, (x, r) => { px(x, '#3a4a78', 0, 0, 16, 16); for (let X = 0; X < 16; X += 4) for (let Y = (X / 4) % 2 ? 2 : 0; Y < 16; Y += 4) px(x, '#4a5a8a', X + 1, Y + 1, 1, 1); noise(x, r, 16, 16, ['#364474', '#40508a'], 18); }, 1202);
    room(G, 5, 4.8, 2.7, paper, 1.2, 0x242a44, { skip: ['front', 'back'], cz: 0.2 });
    const wall = (w, h, x, y) => G.add(at(new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat({ map: paper, rep: [w / 1.2, h / 1.2] })), x, y, WZ));
    wall(WX0 + 2.5, 2.7, (-2.5 + WX0) / 2, 1.35); wall(2.5 - WX1, 2.7, (WX1 + 2.5) / 2, 1.35);
    wall(WX1 - WX0, WY0, (WX0 + WX1) / 2, WY0 / 2); wall(WX1 - WX0, 2.7 - WY1, (WX0 + WX1) / 2, (WY1 + 2.7) / 2);
    const trim = M(0xe8e2d4);
    for (const [w, h, x, y] of [[WX1 - WX0 + 0.16, 0.08, (WX0 + WX1) / 2, WY0], [WX1 - WX0 + 0.16, 0.08, (WX0 + WX1) / 2, WY1], [0.08, WY1 - WY0, WX0, (WY0 + WY1) / 2], [0.08, WY1 - WY0, WX1, (WY0 + WY1) / 2], [0.05, WY1 - WY0, (WX0 + WX1) / 2, (WY0 + WY1) / 2]]) G.add(at(box(w, h, 0.14, trim), x, y, WZ));
    for (const s of [-1, 1]) G.add(at(box(0.36, 1.35, 0.06, M(0x6a3a5a)), s < 0 ? WX0 - 0.18 : WX1 + 0.18, 1.7, WZ + 0.08));   // curtains, open, clear of the lamp
    G.add(at(box(5, 0.1, 0.04, M(0x2a2e4a)), 0, 0.05, WZ + 0.02));   // skirting
    // the bed: headboard against the back wall, a quilt, the pillow propped up; he sits up against it at SIT
    const woodM = M(0x7a5236), bed = new THREE.Group();
    bed.add(at(box(1.2, 1.0, 0.08, woodM), 0, 0.6, 0.04)); bed.add(at(box(1.2, 0.5, 0.06, woodM), 0, 0.3, 2.02));
    for (const [x, z] of [[-0.55, 0.1], [0.55, 0.1], [-0.55, 1.95], [0.55, 1.95]]) bed.add(at(box(0.07, 0.3, 0.07, woodM), x, 0.15, z));
    bed.add(at(box(1.1, 0.2, 1.95, M(0xf0ece2)), 0, MAT - 0.1, 1.02));
    const quiltT = tex(16, 16, (x, r) => { for (let X = 0; X < 16; X += 4) for (let Y = 0; Y < 16; Y += 4) px(x, ['#3fa8a0', '#f2c94c', '#e86a8a', '#6a8ad8'][(X / 4 + Y / 4 * 3) % 4], X, Y, 4, 4); noise(x, r, 16, 16, ['rgba(0,0,0,0.08)'], 30); }, 1203);
    bed.add(at(box(1.16, 0.08, 1.35, mat({ map: quiltT, rep: [2, 2] })), 0, MAT + 0.02, 1.36));
    const pillow = rot(at(box(0.85, 0.16, 0.42, M(0xfaf8f2)), 0, MAT + 0.22, 0.3), -0.95, 0, 0); bed.add(pillow);
    bed.position.set(BX, 0, BED[1]); G.add(bed);
    const cover = at(box(1.18, 0.12, 1.25, mat({ map: quiltT, rep: [2, 2] })), BX, MAT + 0.3, -0.95); cover.visible = false; G.add(cover);   // over a sleeper, to the chin
    // the nightstand: the bedside lamp, a tissue box with a tissue sticking out, a pill bottle, a glass of water
    const ns = new THREE.Group(); ns.add(at(box(0.5, NIGHT_Y, 0.42, woodM), 0, NIGHT_Y / 2, 0));
    ns.add(at(cyl(0.07, 0.09, 0.05, 8, M(0x2a2a30)), 0.13, NIGHT_Y + 0.025, -0.08)); ns.add(at(cyl(0.015, 0.015, 0.3, 4, M(0x2a2a30)), 0.13, NIGHT_Y + 0.18, -0.08));
    const shade = at(cyl(0.1, 0.15, 0.16, 8, mat({ color: 0xffd9a0, unlit: 1 })), 0.13, NIGHT_Y + 0.38, -0.08); ns.add(shade);
    ns.add(at(box(0.24, 0.12, 0.13, M(0xf4f4f8)), -0.08, NIGHT_Y + 0.06, 0.08)); ns.add(at(box(0.245, 0.04, 0.135, M(0x3a8ad8)), -0.08, NIGHT_Y + 0.07, 0.08));
    ns.add(rot(at(box(0.08, 0.1, 0.01, glow(0xffffff)), -0.08, NIGHT_Y + 0.16, 0.08), 0, 0, 0.3));
    ns.add(at(cyl(0.03, 0.03, 0.09, 6, M(0xff8a1a)), 0.1, NIGHT_Y + 0.045, 0.12)); ns.add(at(cyl(0.032, 0.032, 0.02, 6, M(0xfafafa)), 0.1, NIGHT_Y + 0.1, 0.12));
    ns.add(at(cyl(0.04, 0.035, 0.12, 6, mat({ color: 0xbfe4ff, unlit: 0.4 })), 0.19, NIGHT_Y + 0.06, 0.1));
    ns.position.set(NIGHT[0], 0, NIGHT[1]); G.add(ns);
    // crumpled tissues all round the bed, a few on the quilt
    const tis = [];
    for (let i = 0; i < 16; i++) {
      const on = i < 4, x = on ? BX - 0.4 + hash(i, 1204) * 0.8 : BX - 1.1 + hash(i, 1204) * 2.2, z = on ? -1.3 + hash(i, 1205) * 1.1 : -1.9 + hash(i, 1205) * 2.4;
      if (!on && x > BX - 0.62 && x < BX + 0.62 && z < -0.1) continue;
      tis.push(at(new THREE.Mesh(new THREE.IcosahedronGeometry(0.055 + hash(i, 1206) * 0.03, 0)), x, on ? MAT + 0.1 : 0.04, z));
    }
    G.add(merged(tis, M(0xfafafa, { unlit: 0.3 })));
    // a rug, a band poster, a desk with its monitor, the door to the hall (right wall)
    const rugT = tex(16, 16, (x, r) => { px(x, '#c8506a', 0, 0, 16, 16); px(x, '#f2c94c', 2, 2, 12, 12); px(x, '#c8506a', 4, 4, 8, 8); noise(x, r, 16, 16, ['#b84a62', '#d8607a'], 30); }, 1207);
    G.add(flat(2.0, 1.4, mat({ map: rugT }), 0.6, 0.004, 0.2));
    const posterT = tex(16, 24, x => { px(x, '#1a1a2e', 0, 0, 16, 24); px(x, '#ff5fa2', 2, 3, 12, 8); px(x, '#ffd43b', 5, 13, 6, 6); px(x, '#3fd4ff', 2, 20, 12, 2); });
    G.add(rot(at(box(0.6, 0.9, 0.02, mat({ map: posterT })), -2.48, 1.6, 0.4), 0, PI / 2, 0));
    const desk = new THREE.Group(); desk.add(at(box(1.1, 0.05, 0.55, woodM), 0, 0.74, 0)); for (const [x, z] of [[-0.5, -0.22], [0.5, -0.22], [-0.5, 0.22], [0.5, 0.22]]) desk.add(at(box(0.05, 0.72, 0.05, woodM), x, 0.36, z));
    desk.add(at(box(0.45, 0.3, 0.03, M(0x16161c)), 0.1, 0.95, -0.15)); desk.add(at(box(0.41, 0.26, 0.01, glow(0x3a6ad8)), 0.1, 0.95, -0.13));
    desk.position.set(1.9, 0, 1.4); desk.rotation.y = -PI / 2; G.add(desk);
    const door = new THREE.Group(); door.add(at(box(0.08, 2.1, 0.95, M(0xd8cbb0)), 0, 1.05, 0)); door.add(at(box(0.1, 0.06, 0.06, M(0xc8a040)), -0.06, 1.0, -0.36));
    door.position.set(2.46, 0, -0.6); G.add(door);
    // ---------------- outside: his house's back facade, the street, the party house ----------------
    const siding = tex(16, 16, (x, r) => { px(x, '#c8b89a', 0, 0, 16, 16); for (let y = 0; y < 16; y += 4) px(x, '#b0a080', 0, y, 16, 1); noise(x, r, 16, 16, ['#c0b092', '#d0c0a2'], 20); }, 1208);
    const face = (w, h, x, y, z, m) => { const p = new THREE.Mesh(new THREE.PlaneGeometry(w, h), m); p.rotation.y = PI; return at(p, x, y, z); };
    const sidM = mat({ map: siding, rep: [4, 2] }), FZ = WZ - 0.05;
    G.add(face(WX0 + 6, 3.4, (-6 + WX0) / 2, 1.7, FZ, sidM)); G.add(face(6 - WX1, 3.4, (WX1 + 6) / 2, 1.7, FZ, sidM));
    G.add(face(WX1 - WX0, WY0, (WX0 + WX1) / 2, WY0 / 2, FZ, sidM)); G.add(face(WX1 - WX0, 3.4 - WY1, (WX0 + WX1) / 2, (WY1 + 3.4) / 2, FZ, sidM));
    G.add(at(prism(1.2, 12.4, M(0x5a3a3a)), 0, 3.95, WZ + 0.4));
    G.add(at(box(0.95, 2.1, 0.06, M(0x6a3a2a)), HOUSE_DOOR[0], 1.05, FZ - 0.03)); G.add(at(box(0.12, 0.12, 0.08, glow(0xffd9a0)), HOUSE_DOOR[0] + 0.7, 2.2, FZ - 0.06));
    const asph = tex(16, 16, (x, r) => { px(x, '#24242c', 0, 0, 16, 16); noise(x, r, 16, 16, ['#1e1e26', '#2c2c36', '#282830'], 60); }, 1209);
    G.add(flat(60, 5.5, mat({ map: asph, rep: [12, 1.2] }), 0, 0, -8.25));
    const walkT = tex(16, 16, (x, r) => { px(x, '#6a6a72', 0, 0, 16, 16); px(x, '#5a5a62', 0, 0, 16, 1); px(x, '#5a5a62', 0, 0, 1, 16); noise(x, r, 16, 16, ['#646470', '#727280'], 30); }, 1210);
    G.add(flat(60, 3.2, mat({ map: walkT, rep: [30, 1.6] }), 0, 0, (-5.5 + FZ) / 2)); G.add(flat(60, 3.15, mat({ map: walkT, rep: [30, 1.6] }), 0, 0, -12.575));
    const dash = []; for (let x = -28; x < 30; x += 3) dash.push(at(new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.01, 0.12)), x, 0.004, -8.25)); G.add(merged(dash, glow(0xd8c070)));
    for (const z of [-5.52, -10.98]) G.add(at(box(60, 0.012, 0.1, M(0x9a9aa2)), 0, 0.005, z));
    const puddles = []; for (const [x, z, w, d] of [[2.4, -9.2, 1.6, 0.9], [-1.2, -6.8, 1.1, 0.6], [5.2, -11.8, 1.3, 0.7], [0.3, -12.4, 0.9, 0.5]]) puddles.push(at(new THREE.Mesh(new THREE.BoxGeometry(w, 0.008, d)), x, 0.006, z));
    G.add(merged(puddles, mat({ color: 0x3a4a6a, unlit: 0.5 })));
    // the street lamp on the party side and its light cone; two parked cars; a mailbox and a bin
    const lamp = new THREE.Group(); lamp.add(at(cyl(0.06, 0.08, 4.4, 6, M(0x30303a)), 0, 2.2, 0)); lamp.add(at(box(0.9, 0.08, 0.1, M(0x30303a)), -0.4, 4.3, 0));
    lamp.add(at(box(0.36, 0.14, 0.26, glow(0xffc070)), -0.75, 4.2, 0)); lamp.position.set(LAMP[0], 0, LAMP[1]); G.add(lamp);
    const glowCone = new THREE.Mesh(new THREE.ConeGeometry(1.5, 4.1, 10, 1, true), mat({ color: 0xffc070, unlit: 1, see: 0.9 })); glowCone.position.set(LAMP[0] - 0.75, 2.1, LAMP[1]); G.add(glowCone);
    const car = (c, x, z, ry) => {
      const g = new THREE.Group(); g.add(at(box(1.7, 0.6, 3.8, M(c)), 0, 0.55, 0)); g.add(at(box(1.5, 0.5, 2.0, M(0x1a1e2a)), 0, 1.1, 0.2));
      for (const [wx, wz] of [[-0.8, 1.2], [0.8, 1.2], [-0.8, -1.2], [0.8, -1.2]]) g.add(rot(at(cyl(0.3, 0.3, 0.22, 8, M(0x14141a)), wx, 0.3, wz), 0, 0, PI / 2));
      g.position.set(x, 0, z); g.rotation.y = ry; G.add(g);
    };
    car(0x3a6ad8, -6.5, -10.0, PI / 2); car(0xd8322a, 10.5, -6.6, -PI / 2);
    G.add(at(box(0.35, 0.5, 0.3, M(0x2a5ad8)), -3.2, 1.0, -4.0)); G.add(at(box(0.06, 0.75, 0.06, M(0x30303a)), -3.2, 0.37, -4.0));
    G.add(at(cyl(0.3, 0.26, 0.9, 8, M(0x3a6a3a)), 6.3, 0.45, -3.4));
    // the party house across the street: pastel siding, its windows and door open onto the party inside (holes), each
    // with a glow panel facing the street (one-sided: from inside you see out through it) and dancing silhouettes
    const pSid = mat({ map: tex(16, 16, (x, r) => { px(x, '#8ac8d8', 0, 0, 16, 16); for (let y = 0; y < 16; y += 4) px(x, '#72b0c0', 0, y, 16, 1); noise(x, r, 16, 16, ['#84c2d2', '#92d0e0'], 20); }, 1211), rep: [4, 2] });
    const PZ = DOOR[1], W1 = [-4.2, -1.4], W2 = [3.4, 6.2], DW = [DOOR[0] - 0.6, DOOR[0] + 0.6], PY = [0.9, 2.3];
    const slab = (x0, x1, y0, y1) => G.add(at(box(x1 - x0, y1 - y0, 0.2, pSid), (x0 + x1) / 2, (y0 + y1) / 2, PZ));
    slab(-5, W1[0], 0, 3.0); slab(W1[1], DW[0], 0, 3.0); slab(DW[1], W2[0], 0, 3.0); slab(W2[1], 7, 0, 3.0);
    for (const [a, b] of [W1, W2]) { slab(a, b, 0, PY[0]); slab(a, b, PY[1], 3.0); }
    slab(DW[0], DW[1], 2.2, 3.0);
    G.add(at(prism(1.25, 12.6, M(0x4a3a5a)), 1, 3.6, PZ - 0.3));
    for (const [a, b] of [W1, W2]) for (const [w, h, x, y] of [[b - a + 0.14, 0.08, (a + b) / 2, PY[0]], [b - a + 0.14, 0.08, (a + b) / 2, PY[1]], [0.08, PY[1] - PY[0], a, (PY[0] + PY[1]) / 2], [0.08, PY[1] - PY[0], b, (PY[0] + PY[1]) / 2]]) G.add(at(box(w, h, 0.26, M(0xf4f0e8)), x, y, PZ));
    G.add(at(box(0.12, 0.12, 0.1, glow(0xffe0a0)), DW[1] + 0.3, 2.35, PZ + 0.12));
    const panels = [];
    for (const [a, b, y0, y1] of [[W1[0], W1[1], PY[0], PY[1]], [W2[0], W2[1], PY[0], PY[1]], [DW[0], DW[1], 0, 2.2]]) {
      const m = mat({ color: 0xff5fa2, unlit: 1, see: 0.1 }), p = new THREE.Mesh(new THREE.PlaneGeometry(b - a, y1 - y0), m); p.position.set((a + b) / 2, (y0 + y1) / 2, PZ - 0.25); G.add(p); panels.push([m, p]);
    }
    const sils = [];
    for (let i = 0; i < 6; i++) {
      const [a, b] = i < 3 ? W1 : W2, s = new THREE.Group(), dk = M(0x14101e);
      s.add(at(box(0.34, 0.5, 0.05, dk), 0, 0.25, 0)); s.add(at(box(0.36, 0.34, 0.05, dk), 0, 0.68, 0)); s.add(rot(at(cone(0.07, 0.18, 4, dk), -0.1, 0.9, 0), 0, 0, 0.3)); s.add(rot(at(cone(0.07, 0.18, 4, dk), 0.1, 0.9, 0), 0, 0, -0.3));
      s.position.set(a + 0.45 + (i % 3) * (b - a - 0.9) / 2, PY[0] - 0.35, PZ - 0.28); G.add(s); sils.push(s);
    }
    for (let i = 0; i < 4; i++) { const b = new THREE.Mesh(new THREE.IcosahedronGeometry(0.2, 1), mat({ color: PARTY[i], unlit: 0.4 })); b.scale.set(1, 1.2, 1); b.position.set(DW[1] + 0.15 + (i % 2) * 0.25, 2.5 + (i >> 1) * 0.3, PZ + 0.2); G.add(b); }   // balloons at the door
    // ---------------- inside the party: x -5..7, z -21.8..-14.2, 3 m high ----------------
    const PG = new THREE.Group(); PG.position.x = 1; G.add(PG);
    const pPaper = tex(16, 16, (x, r) => { px(x, '#4a2a5a', 0, 0, 16, 16); for (let Y = 0; Y < 16; Y += 4) px(x, '#5a3a6a', 0, Y, 16, 2); noise(x, r, 16, 16, ['#44265a', '#523266'], 20); }, 1212);
    room(PG, 12, 7.6, 3.0, pPaper, 1.2, 0x1c1224, { skip: ['front'], cz: -18.0 });
    const parq = tex(32, 32, (x, r) => { px(x, '#6a4a3a', 0, 0, 32, 32); for (let y = 0; y < 32; y += 8) px(x, '#5a3c2e', 0, y, 32, 1); noise(x, r, 32, 32, ['#644434', '#72503e'], 40); }, 1213);
    G.add(flat(12, 7.6, mat({ map: parq, rep: [5, 3] }), 1, 0, -18.0));
    const tiles = [];
    for (let i = 0; i < 9; i++) { const m = mat({ color: PARTY[i % 5], unlit: 1 }); G.add(flat(0.96, 0.96, m, FLOOR[0] - 1 + (i % 3), 0.005, FLOOR[1] - 1 + Math.floor(i / 3))); tiles.push(m); }
    const ball = new THREE.Group(); ball.add(new THREE.Mesh(new THREE.IcosahedronGeometry(0.26, 1), mat({ color: 0xe8ecf4, unlit: 0.6 }))); ball.add(at(box(0.01, 0.35, 0.01, M(0x888890)), 0, 0.3, 0));
    ball.position.set(FLOOR[0], 2.55, FLOOR[1]); G.add(ball);
    // the snack table on the left wall: the punch bowl and its ladle, red cups, chips
    const tbl = new THREE.Group(), cloth = M(0xf2f2f6);
    tbl.add(at(box(0.9, 0.05, 1.8, cloth), 0, 0.8, 0)); tbl.add(at(box(0.92, 0.3, 1.82, cloth), 0, 0.64, 0));
    for (const [x, z] of [[-0.4, -0.85], [0.4, -0.85], [-0.4, 0.85], [0.4, 0.85]]) tbl.add(at(box(0.05, 0.5, 0.05, woodM), x, 0.25, z));
    tbl.position.set(PUNCH[0], 0, -18.5); G.add(tbl);
    const bowl = new THREE.Group(); bowl.add(at(cyl(0.24, 0.14, 0.14, 10, mat({ color: 0xd8f0ff, unlit: 0.3 })), 0, 0.07, 0));
    const punchM = mat({ color: 0xff4a8a, unlit: 0.5 }), punch = at(cyl(0.23, 0.23, 0.02, 10, punchM), 0, 0.16, 0); bowl.add(punch);
    bowl.add(rot(at(box(0.02, 0.36, 0.02, M(0xd8d8e0)), 0.12, 0.25, 0), 0, 0, -0.4)); bowl.add(at(cyl(0.05, 0.03, 0.04, 6, M(0xd8d8e0)), 0.05, 0.11, 0));
    bowl.position.set(PUNCH[0], 0.825, PUNCH[2]); G.add(bowl);
    for (let i = 0; i < 6; i++) G.add(at(cyl(0.04, 0.03, 0.1, 6, M(0xd8322a)), PUNCH[0] + 0.25 - (i % 2) * 0.12, 0.875, -19.1 + Math.floor(i / 2) * 0.1));
    G.add(at(cyl(0.18, 0.1, 0.08, 8, M(0xe8e0d0)), PUNCH[0], 0.865, -18.95)); G.add(at(ico(0.13, 0, M(0xf2c94c)), PUNCH[0], 0.9, -18.95));
    // the low couch on the back wall (seat top COUCH_Y: seated clips sit with their hips 0.16-0.2 m up), a coffee table
    const vel = M(0x2e7a7a), couch = new THREE.Group();
    couch.add(at(box(2.6, 0.1, 0.5, vel), 0, 0.05, 0)); couch.add(at(box(2.6, 0.58, 0.26, vel), 0, 0.29, -0.38));
    for (const s of [-1, 1]) couch.add(at(box(0.24, 0.3, 0.76, vel), s * 1.42, 0.15, -0.12));
    couch.add(rot(at(box(0.46, 0.34, 0.14, M(0xe8b84a)), -0.9, 0.3, -0.24), -0.25, 0.2, 0));
    couch.position.set(COUCH[0], 0, COUCH[1]); G.add(couch);
    G.add(at(box(1.2, 0.05, 0.55, woodM), COUCH[0], 0.3, COUCH[1] + 1.0));
    // balloons at the ceiling, streamers, a garland of flags across the room, a PARTY banner on the back wall
    for (let i = 0; i < 14; i++) { const b = new THREE.Mesh(new THREE.IcosahedronGeometry(0.2, 1), mat({ color: PARTY[i % 5], unlit: 0.4 })); b.scale.set(1, 1.2, 1); b.position.set(-4.2 + hash(i, 1214) * 10.4, 2.72, -21.3 + hash(i, 1215) * 6.6); G.add(b); }
    const streamers = []; for (let i = 0; i < 12; i++) { const s = at(box(0.06, 0.9 + hash(i, 1216) * 0.5, 0.005, mat({ color: PARTY[(i + 2) % 5], unlit: 0.5 })), -4.5 + i * 0.95, 2.45, -21.7); G.add(s); streamers.push(s); }
    const flags = []; for (let i = 0; i < 18; i++) flags.push(rot(at(new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.22, 3)), -4.6 + i * 0.66, 2.62 - 0.12 * Math.sin(i / 17 * PI), -17.4), PI, 0, 0));
    G.add(merged(flags, mat({ color: 0xffd43b, unlit: 0.5 })));
    G.add(at(box(2.4, 0.5, 0.03, mat({ map: sign('PARTY', '#ff5fa2', '#fff6fb', 64, 16), unlit: 0.8 })), COUCH[0], 2.2, -21.77));
    // the guests: pets in party hats round the dance floor, bobbing on the beat
    const guests = [];
    for (let i = 0; i < 10; i++) {
      const a = i / 10 * TAU + 0.3, r = i < 7 ? 2.0 + hash(i, 1217) * 0.6 : 3.1, x = FLOOR[0] + Math.sin(a) * r * 1.3, z = FLOOR[1] - 0.3 + Math.cos(a) * r * 0.8;
      if (x < -4.4 || x > 6.4 || z < -21.2 || z > -14.8) continue;
      const p = pet(i + 3); p.g.position.set(x, 0, z); p.g.rotation.y = Math.atan2(FLOOR[0] - x, FLOOR[1] - z) + (hash(i, 1218) - 0.5) * 0.8; G.add(p.g); guests.push([p, x, z]);
    }
    // the morning: a day sky inside the far plane (a dome: scene.background is set before anim, a frame late in out-of-order tabs)
    const dayDome = new THREE.Mesh(new THREE.SphereGeometry(150, 16, 12), mat({ map: grad([[0, '#6aa8e8'], [0.5, '#d8ecfa'], [1, '#d8ecfa']]), unlit: 1, nofog: 1, side: THREE.BackSide }));
    dayDome.visible = false; G.add(dayDome);
    // the rain, over the street only
    const RG = new THREE.Group(); RG.position.set(1.5, 0, -8.3); G.add(RG);
    const rain = fall(RG, 260, mat({ color: 0x9ab8e8, unlit: 1 }), new THREE.BoxGeometry(0.012, 0.42, 0.012), { w: 11, top: 9, speed: 12, drift: 0, seed: 1219 });

    return {
      group: G, sky: grad([[0, '#05060f'], [0.55, '#141a36'], [1, '#2a2240']]), shadowCol: 0x1c1a26,
      light() {
        lights(0x2c3048, 0x6a7aa8, [0.3, -1, 0.4], 0x0c0e1a, [12, 60], 5.5);
      },
      anim(t, P = {}) {
        const b = beat(t), bi = Math.floor(b), h = hit(t), zone = P.zone || 'room', c = new THREE.Color(PARTY[pmod(bi, 5)]);
        const day = zone === 'morning'; dayDome.visible = day;
        panels.forEach(([m, p], i) => { p.visible = !day; m.uniforms.uCol.value.set(PARTY[pmod(bi + i * 2, 5)]).multiplyScalar(0.8 + 0.4 * h); });
        sils.forEach((s, i) => { s.visible = !day; s.position.y = PY[0] - 0.35 + 0.08 * Math.abs(Math.sin((b + i * 0.37) * PI)); s.rotation.z = 0.12 * Math.sin((b + i) * PI); });
        tiles.forEach((m, i) => m.uniforms.uCol.value.set(PARTY[pmod(bi + i * 3, 5)]).multiplyScalar(pmod(bi + i, 2) ? 1 : 0.35));
        ball.rotation.y = t * 0.8;
        streamers.forEach((s, i) => { s.rotation.z = 0.08 * Math.sin(t * 1.3 + i); });
        guests.forEach(([p, x, z]) => {
          p.g.visible = !P.noguests && !cleared(P, x, z); p.nose.visible = !!P.sickGuests;
          const bb = b + p.i * 0.23; p.body.position.y = 0.06 * Math.abs(Math.sin(bb * PI)); p.body.rotation.z = 0.14 * Math.sin(bb * PI);
          p.head.rotation.y = 0.25 * Math.sin(bb * 0.5 * PI);
        });
        const rk = P.ripple != null && P.t0 != null ? t - P.t0 - P.ripple : -1;   // the sneeze lands in the punch: it ripples, then it's green
        punch.scale.set(1, 1 + (rk >= 0 && rk < 0.6 ? 2.5 * Math.sin(rk * 30) * (1 - rk / 0.6) : 0), 1);
        punchM.uniforms.uCol.value.set(rk >= 0 ? 0x9ad84a : 0xff4a8a);
        RG.visible = !!P.rain; if (P.rain) rain(t);
        shade.visible = P.lamp !== false;
        pillow.rotation.x = P.flatPillow ? 0 : -0.95; pillow.position.set(0, P.flatPillow ? MAT + 0.09 : MAT + 0.22, P.flatPillow ? 0.28 : 0.3); cover.visible = !!P.cover;
        glowCone.visible = P.lampCone !== false;
        if (zone === 'room') {
          lights(0x2a2840, 0x5a6a98, [0.4, -1, -0.5], 0x0a0a14, [10, 50], 5);
          if (P.lamp !== false) pt(0, NIGHT[0] + 0.13, 1.1, NIGHT[1] + 0.1, 1.0, 0.72, 0.42);
          const kk = 0.4 + 0.8 * h; pt(1, (WX0 + WX1) / 2, 1.5, WZ - 0.6, c.r * kk, c.g * kk, c.b * kk);   // the party's colours through the window
          pt(2, 0.4, 2.2, 1.6, 0.18, 0.2, 0.32);
          pt(3, DOOR[0] - 1.5, 2.6, PZ + 2.0, 0.55 + 0.35 * c.r, 0.45 + 0.3 * c.g, 0.5 + 0.35 * c.b);   // the party house seen from his window
        } else if (zone === 'morning') {
          lights(0xb8b4ac, 0xfff0d0, [0.3, -1, 0.7], 0xd8e4f0, [20, 90], 6);
          pt(0, (WX0 + WX1) / 2, 1.9, WZ + 0.5, 1.0, 0.86, 0.6); pt(1, 0.2, 2.0, 1.4, 0.35, 0.34, 0.3);   // the sun through the window, a fill
        } else if (zone === 'street') {
          lights(0x262c46, 0x5a6a98, [0.3, -1, 0.5], 0x0c1020, [14, 60], 7);
          const kk = 0.5 + 0.7 * h;
          pt(0, LAMP[0] - 0.75, 4.0, LAMP[1], 1.2, 0.82, 0.5); pt(1, DOOR[0], 1.8, PZ + 0.6, c.r * kk, c.g * kk, c.b * kk);
          pt(2, (WX0 + WX1) / 2, 1.5, WZ - 0.6, 0.6, 0.45, 0.28); pt(3, -4.5, 3.8, -6.0, 0.35, 0.3, 0.5);
        } else {
          lights(0x3a2a52, 0x7a5aa8, [0.2, -1, 0.3], 0x140c1c, [10, 40], 6);
          for (let q = 0; q < 4; q++) { const cq = new THREE.Color(PARTY[pmod(bi + q, 5)]), kk = 0.5 + 0.9 * h; pt(q, FLOOR[0] + Math.sin(q * PI / 2 + t * 0.6) * 3, 2.5, FLOOR[1] + Math.cos(q * PI / 2 + t * 0.6) * 2.2, cq.r * kk, cq.g * kk, cq.b * kk); }
        }
      },
    };
  }

  // =====================================================================================================================
  function ward() {
    const G = new THREE.Group(), { BEDS, HEAD_Z, MAT, DOOR } = WARD;
    const vinyl = tex(16, 16, (x, r) => { px(x, '#9aa8ae', 0, 0, 16, 16); px(x, '#8a989e', 0, 0, 16, 1); px(x, '#8a989e', 0, 0, 1, 16); noise(x, r, 16, 16, ['#94a2a8', '#a2b0b6'], 30); }, 1231);
    G.add(flat(12, 7, mat({ map: vinyl, rep: [10, 6] }), 0, 0, 0.2));
    const wallT = tex(16, 16, (x, r) => { px(x, '#e8e4d4', 0, 0, 16, 16); px(x, '#a8d4c4', 0, 10, 16, 6); px(x, '#88b4a4', 0, 10, 16, 1); noise(x, r, 16, 16, ['#e0dccc', '#eeeadc'], 20); }, 1232);
    room(G, 12, 7, 3.0, wallT, 1.6, 0xf2f0e8, { skip: ['front'], cz: 0.2 });
    const frontWall = rot(at(new THREE.Mesh(new THREE.PlaneGeometry(12, 3.0), mat({ map: wallT, rep: [12 / 1.6, 3.0 / 1.6] })), 0, 1.5, 3.7), 0, PI, 0); frontWall.visible = false; G.add(frontWall);   // `front`: a reverse angle from the beds
    // tall windows in the back wall between the beds: a blue morning over the rooftops
    const skyT = tex(24, 32, (x, r) => {
      const g = x.createLinearGradient(0, 0, 0, 32); g.addColorStop(0, '#6ab0f0'); g.addColorStop(1, '#cfe8ff'); x.fillStyle = g; x.fillRect(0, 0, 24, 32);
      for (let i = 0; i < 3; i++) { const cx = Math.floor(r() * 20), cy = 4 + Math.floor(r() * 10); px(x, '#ffffff', cx, cy, 6, 2); px(x, '#ffffff', cx + 1, cy - 1, 4, 1); }
      for (let X = 0; X < 24; X += 6) { const hh = 6 + Math.floor(r() * 8); px(x, '#8a9ab0', X, 32 - hh, 5, hh); }
      selfLit(x, 24, 32);
    });
    for (const x of [-3.45, -1.15, 1.15, 3.45]) {
      G.add(at(box(1.2, 1.3, 0.02, mat({ map: skyT, unlit: 1 })), x, 2.0, -3.28));
      for (const [w, h, dx, dy] of [[1.3, 0.07, 0, 0.66], [1.3, 0.07, 0, -0.66], [0.07, 1.36, -0.63, 0], [0.07, 1.36, 0.63, 0], [0.05, 1.3, 0, 0]]) G.add(at(box(w, h, 0.06, M(0xf6f6f2)), x + dx, 2.0 + dy, -3.26));
    }
    // beds: white frames, a mattress, a pale blue blanket with confetti, a pillow propped up, side rails; a heart monitor
    // left of each head, an IV pole on its right
    const white = M(0xf2f4f6), blanketM = M(0x9ac8e8), bedParts = [], blanketParts = [], railParts = [], conf = [];
    const traces = [], flats = [], screens = [];
    const ecgT = tex(32, 16, x => { px(x, '#0a1a12', 0, 0, 32, 16); x.fillStyle = '#3aff7a'; x.fillRect(0, 9, 32, 1); x.fillRect(12, 3, 1, 7); x.fillRect(13, 3, 1, 10); x.fillRect(14, 9, 1, 4); x.fillRect(10, 8, 2, 1); x.fillRect(18, 8, 3, 1); selfLit(x, 32, 16); });
    for (const [bi, bx] of BEDS.entries()) {
      bedParts.push(at(new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.18, 2.0)), bx, MAT - 0.09, HEAD_Z + 1.05));
      for (const [x, z] of [[-0.42, 0.1], [0.42, 0.1], [-0.42, 1.95], [0.42, 1.95]]) railParts.push(at(new THREE.Mesh(new THREE.BoxGeometry(0.05, MAT - 0.18, 0.05)), bx + x, (MAT - 0.18) / 2, HEAD_Z + z));
      railParts.push(at(new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.7, 0.05)), bx, MAT + 0.1, HEAD_Z + 0.02));
      railParts.push(at(new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.35, 0.05)), bx, MAT - 0.05, HEAD_Z + 2.05));
      for (const s of [-1, 1]) railParts.push(at(new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.05, 0.9)), bx + s * 0.5, MAT + 0.18, HEAD_Z + 1.1));
      blanketParts.push(at(new THREE.Mesh(new THREE.BoxGeometry(0.99, 0.09, 1.4)), bx, MAT + 0.03, HEAD_Z + 1.35));
      bedParts.push(rot(at(new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.14, 0.4)), bx, MAT + 0.22, HEAD_Z + 0.28), -0.9, 0, 0));
      for (let i = 0; i < 9; i++) conf.push([bx - 0.4 + hash(i, bi + 1233) * 0.8, HEAD_Z + 0.9 + hash(i, bi + 1234) * 1.0, i]);
      const mon = new THREE.Group(); mon.add(at(cyl(0.02, 0.02, 1.35, 4, M(0x9aa0aa)), 0, 0.675, 0)); mon.add(at(cyl(0.2, 0.22, 0.04, 6, M(0x9aa0aa)), 0, 0.02, 0));
      mon.add(at(box(0.46, 0.36, 0.16, M(0xd8dce2)), 0, 1.5, 0));
      const scrM = mat({ map: ecgT, rep: [2, 1], unlit: 1 }), scr = at(box(0.38, 0.26, 0.01, scrM), 0, 1.51, 0.085); mon.add(scr); traces.push(scrM);
      const fl = at(box(0.38, 0.012, 0.012, glow(0x3aff7a)), 0, 1.5, 0.092); fl.visible = false; mon.add(fl); flats.push(fl);
      const scrRed = at(box(0.38, 0.26, 0.009, glow(0x3a0a0a)), 0, 1.51, 0.084); scrRed.visible = false; mon.add(scrRed); screens.push([scr, scrRed]);
      mon.position.set(bx - 0.78, 0, HEAD_Z + 0.25); mon.rotation.y = 0.35; G.add(mon);
      const iv = new THREE.Group(); iv.add(at(cyl(0.015, 0.015, 1.9, 4, M(0xb8bcc4)), 0, 0.95, 0)); iv.add(at(cyl(0.2, 0.22, 0.04, 5, M(0xb8bcc4)), 0, 0.02, 0));
      iv.add(at(box(0.16, 0.24, 0.05, mat({ color: 0xe8f4ff, unlit: 0.4 })), 0.05, 1.72, 0)); iv.add(at(box(0.008, 0.6, 0.008, M(0xe8f4ff)), 0.05, 1.3, 0));
      iv.position.set(bx + 0.7, 0, HEAD_Z + 0.35); G.add(iv);
    }
    G.add(merged(bedParts, white)); G.add(merged(railParts, M(0xc8ccd4))); G.add(merged(blanketParts, blanketM));
    G.add(merged(conf.map(([x, z, i]) => rot(at(new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.005, 0.05)), x, MAT + 0.08, z), 0, i, 0)), mat({ color: 0xff5fa2, unlit: 0.5 })));
    // curtain rails on the ceiling between the beds, the curtains bunched at the wall; a clock, the door, the WARD sign
    const cur = M(0x8ac8b8);
    for (let i = 0; i < 4; i++) { const x = (BEDS[i] + BEDS[i + 1]) / 2; G.add(at(box(0.04, 0.04, 3.2, M(0xb8bcc4)), x, 2.9, HEAD_Z + 1.6)); G.add(at(box(0.25, 2.1, 0.5, cur), x, 1.8, HEAD_Z + 0.35)); }
    const clockT = tex(16, 16, x => { px(x, '#fafafa', 0, 0, 16, 16); px(x, '#1a1a1a', 7, 3, 2, 6); px(x, '#1a1a1a', 8, 8, 5, 1); x.strokeStyle = '#1a1a1a'; x.strokeRect(0.5, 0.5, 15, 15); });
    G.add(rot(at(cyl(0.22, 0.22, 0.04, 12, mat({ map: clockT })), 5.97, 2.55, -1.2), 0, 0, PI / 2));
    G.add(at(box(0.08, 2.2, 1.2, M(0x7aa8c8)), DOOR[0] - 0.03, 1.1, DOOR[1])); G.add(at(box(0.1, 0.06, 0.2, M(0xc8ccd4)), DOOR[0] - 0.09, 1.05, DOOR[1] - 0.45));
    G.add(rot(at(box(1.0, 0.26, 0.03, mat({ map: sign('WARD', '#2a6ab8', '#ffffff', 64, 16), unlit: 0.8 })), DOOR[0] - 0.04, 2.45, DOOR[1]), 0, -PI / 2, 0));
    // pet patients in the beds the story leaves free
    const pax = BEDS.map((bx, i) => { const p = pet(i * 3 + 1, { hat: true, sick: true }); p.g.position.set(bx, MAT - 0.24, WARD.SIT_Z + 0.05); G.add(p.g); return [p, bx]; });
    // a sad balloon on bed 4's rail
    const sad = new THREE.Mesh(new THREE.IcosahedronGeometry(0.16, 1), mat({ color: 0xd8322a, unlit: 0.3 })); sad.scale.set(1, 0.8, 1); sad.position.set(BEDS[4] + 0.45, 1.1, HEAD_Z + 2.1); G.add(sad);
    G.add(at(box(0.006, 0.4, 0.006, M(0xf0f0f0)), BEDS[4] + 0.45, 0.85, HEAD_Z + 2.1));

    return {
      group: G, indoor: true, sky: grad([[0, '#9ac8f0'], [1, '#e0f0ff']]), shadowCol: 0x8a9498,
      light() {
        lights(0x94a0a8, 0xe8dcc4, [0.2, -1, 0.5], 0xc8d4dc, [14, 40], 6);
        pt(0, -2.3, 2.6, -2.2, 0.22, 0.23, 0.22); pt(1, 2.3, 2.6, -2.2, 0.22, 0.23, 0.22); pt(2, 0, 2.7, 1.8, 0.18, 0.18, 0.18);
      },
      anim(t, P = {}) {
        const b = beat(t), c = P.t0 != null ? t - P.t0 : 0, on = P.pax || [0, 4];
        traces.forEach((m, i) => { m.uniforms.uOff.value.set(-(b % 1) * 0.5 - i * 0.13, 0); });
        BEDS.forEach((_, i) => { const dead = !!P.flat && P.flat[0] === i && c >= P.flat[1]; flats[i].visible = dead; screens[i][0].visible = !dead; screens[i][1].visible = dead; });
        pax.forEach(([p, bx], i) => {
          p.g.visible = !P.noPax && on.includes(i) && !cleared(P, bx, WARD.SIT_Z);
          const bb = b * 0.5 + p.i * 0.31; p.body.rotation.z = 0.05 * Math.sin(bb * PI);
          let yaw = 0.15 * Math.sin(bb * 0.5 * PI);
          if (P.stare) yaw = Math.max(-1.3, Math.min(1.3, Math.atan2(P.stare[0] - bx, P.stare[1] - WARD.SIT_Z)));
          p.head.rotation.set(0, yaw, 0);
        });
        sad.position.y = 1.1 + 0.03 * Math.sin(t * 1.2);
        frontWall.visible = !!P.front;
      },
    };
  }
  return { block: block(), ward: ward() };
}
