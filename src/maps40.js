// maps40.js: the "WHERE IS MY HUSBAND!" maps (2026-10-10 2nd, RAYE; the clip: a 1940s picture show, a singer in a red
// sequin halter gown at a ribbon mic before a big band under rows of bulb panels, her backing trio in red sequins, and
// black-and-white hotel corridors and a grand hall with a chandelier and a staircase where she looks for her husband).
// Same contract as the other map files, pure in t:
//   ballroom  a 1940s supper club's big-band stage (y = 0 everywhere): a wood stage floor to the footlights at
//             BALLROOM.EDGE_Z, a red velvet curtain at CURTAIN_Z with a gold valance, the clip's bulb panels (a black
//             box of 3 x 3 bulbs) on tripods and on the curtain, flashing on the bar (`flash`: false holds them lit
//             steady), the ribbon mic on its chrome stand at MIC (its head at MIC_Y, beside the singer's mark SING;
//             `mic` false hides it), the backing singers' marks BACK_L / BACK_R, the band in white dinner jackets on two
//             risers at the sides (BAND: trumpet, sax, trombone, double bass, piano, drums; the middle of the stage
//             left clear behind the singers), and the floor in front: round tables with white cloths and red lamps,
//             box-pet guests in evening wear seated facing the stage (TABLES), three chandeliers, panelled walls with
//             sconces. Flags: `pets` 'watch' | 'point' (one paw at `stare` [x, z]) | 'cheer' | 'gasp' | 'stand'
//             (on their feet, pointing) | false; `stare` [x, z] (heads turn there); `band` 'play' | 'point' (the
//             players point at `stare`) | false; `stop` (everyone frozen: the music's dead stop); `spot` [x, z] (a
//             follow-spot: a warm pool on the floor and a light over it); `hush` (the room's lights down, the stage
//             up); `clear` [[x, z, r]] (no guest or player there), `noguests`, `key`.
//   hotel     the grand hotel's corridor and hall, for the black-and-white search (shoot it with the shot's `mono`):
//             a long corridor along z (HOTEL.CORR, 2.8 m wide, 3.4 m high: wainscot, striped wallpaper, doors in both
//             walls at DOORS, sconces, a carpet runner, ceiling lamps) opening at its far end (z CORR.z0) into the hall
//             (HALL: a black-and-white marble floor in 1.2 m tiles, panelled walls, tall windows with drapes, a giant
//             chandelier, the grand staircase rising to -z from STAIRS.z1 to its landing at STAIRS.top, potted palms,
//             a marble plinth at PED, its top PED_Y, for a statue). Flags: `zone` 'corridor' | 'hall' (the lights),
//             `door` [i, 0-1 or a ramp] (door i of DOORS on the left wall swung in), `key`.
import { mapKit } from './mapkit.js';

export const BALLROOM = {
  H: 6.6, X: 9, BACK_Z: -5.2, FRONT_Z: 14, EDGE_Z: 3.0, CURTAIN_Z: -5.0,
  SING: [0, 0.6], MIC: [0.42, 1.02], MIC_Y: 0.9, BACK_L: [-1.75, -0.15], BACK_R: [1.75, -0.15],
  RISER: [{ x0: 0.95, x1: 4.2, z0: -3.05, z1: -1.95, y: 0.25 }, { x0: 0.95, x1: 4.2, z0: -4.3, z1: -3.05, y: 0.5 }],
  BAND: [['trumpet', -1.45, -2.5], ['sax', -2.75, -2.5], ['trombone', 1.45, -2.5], ['bass', 2.75, -2.5], ['piano', -3.2, -3.65], ['drums', 3.1, -3.75]],
  TABLES: [[-5.2, 4.9], [-2.6, 5.2], [2.6, 5.2], [5.2, 4.9], [-6.2, 7.4], [-3.4, 7.7], [0, 7.9], [3.4, 7.7], [6.2, 7.4], [-4.6, 10.3], [-1.6, 10.5], [1.6, 10.5], [4.6, 10.3]],
};
export const HOTEL = {
  H: 3.4, CORR: { x0: -1.4, x1: 1.4, z0: -18, z1: 5 }, DOORS: [2.6, -1.4, -5.4, -9.4, -13.4], DOOR_W: 0.95, DOOR_H: 2.2,
  HALL: { x0: -7, x1: 7, z0: -32, z1: -18, H: 7.2 }, STAIRS: { x0: -2.4, x1: 2.4, z1: -25.0, step: 0.2, run: 0.42, n: 16 },
  PED: [-4.4, -21.6], PED_Y: 0.62, PALMS: [[-2.1, -18.9], [2.1, -18.9], [-3.3, -25.2], [3.3, -25.2]],
};
HOTEL.STAIRS.top = HOTEL.STAIRS.step * HOTEL.STAIRS.n;
HOTEL.STAIRS.z0 = HOTEL.STAIRS.z1 - HOTEL.STAIRS.run * HOTEL.STAIRS.n;

export function buildHusbandMaps(K) {
  const k = mapKit(K);
  const { THREE, mat, tex, px, noise, box, TAU, PI, beat, fr, cyl, cone, ico, at, rot, flat, lights, pt } = k;
  const M = (c, o = {}) => mat({ color: c, ...o }), glow = (c, u = 1) => mat({ color: c, unlit: u });
  const cl = x => Math.max(0, Math.min(1, x));
  const cleared = (P, x, z) => (P.clear || []).some(([cx, cz, r]) => (x - cx) ** 2 + (z - cz) ** 2 < r * r);
  const ramp = (v, s) => Array.isArray(v) ? v[2] + (v[3] - v[2]) * cl((s - v[0]) / Math.max(0.01, v[1] - v[0])) : (v === true ? 1 : (v || 0));
  const shotT = (t, P) => P.t0 != null ? t - P.t0 : 0;
  const GOLD = M(0xd8a83a, { unlit: 0.25 }), CHROME = M(0xd8dde6, { unlit: 0.3 }), BLACK = M(0x16161a);

  // ---------- a box pet in evening wear (the guests, the band): a jacket, a head with a snout, dot eyes, ears ----------
  const FURS = [0xf2eee6, 0xd8a868, 0x9a9aa4, 0xe8c090, 0x8a7a6c, 0xc8b8a8, 0x6a5a4c];
  const SUITS = [0x22222a, 0x6a1a2a, 0x1a2a5a, 0x2a4a3a, 0xe8e4dc, 0x5a3a6a];
  const WHITE_JACKET = 0xf4f2ec;
  function pet(i, jacket) {
    const g = new THREE.Group(), F = M(FURS[i % FURS.length]), J = M(jacket ?? SUITS[i % SUITS.length]), kind = i % 3;
    const body = new THREE.Group(); g.add(body);
    const legs = [-1, 1].map(sx => { const l = at(new THREE.Group(), sx * 0.1, 0.3, 0); l.add(at(box(0.13, 0.3, 0.13, M(0x1c1c22)), 0, -0.15, 0)); body.add(l); return l; });
    body.add(at(box(0.4, 0.38, 0.28, J), 0, 0.5, 0));
    body.add(at(box(0.1, 0.05, 0.03, jacket === WHITE_JACKET ? BLACK : M(0xf4f2ec)), 0, 0.66, 0.145));   // a bow tie (the band) or a white collar
    const arms = [-1, 1].map(sx => { const a = at(new THREE.Group(), sx * 0.23, 0.64, 0); a.add(at(box(0.09, 0.28, 0.09, J), 0, -0.12, 0)); a.add(at(box(0.08, 0.08, 0.08, F), 0, -0.28, 0)); body.add(a); return a; });
    const head = at(new THREE.Group(), 0, 0.92, 0); body.add(head);
    const skull = ico(0.24, 1, F); skull.scale.set(1, 0.9, 0.92); head.add(skull);
    const snout = at(ico(0.1, 1, M(0xf0e6d8)), 0, -0.07, 0.19); snout.scale.set(1.1, 0.8, 0.9); head.add(snout);
    head.add(at(ico(0.035, 0, M(0x151515)), 0, -0.03, 0.28));
    const mouth = at(box(0.09, 0.07, 0.02, M(0x5a1a1a)), 0, -0.13, 0.25); mouth.visible = false; head.add(mouth);
    for (const e of [-1, 1]) {
      head.add(at(ico(0.038, 0, M(0x0e0e0e)), e * 0.1, 0.05, 0.19));
      head.add(at(ico(0.012, 0, glow(0xffffff)), e * 0.1 + 0.012, 0.065, 0.225));
      head.add(kind === 0 ? rot(at(cone(0.08, 0.2, 4, F), e * 0.15, 0.27, 0), 0, 0, -e * 0.25) : kind === 1 ? at(box(0.08, 0.3, 0.06, F), e * 0.1, 0.33, 0) : rot(at(box(0.07, 0.24, 0.16, F), e * 0.24, 0.02, 0), 0, 0, e * 0.3));
    }
    return { g, body, head, arms, legs, mouth, i };
  }
  // the clip's bulb panel: a black box with 3 x 3 warm bulbs facing +z
  const bulbM = glow(0xfff0c4), bulbDim = glow(0x8a6a3a, 0.9);
  function bulbPanel(s = 1) {
    const p = new THREE.Group(); p.add(box(0.66 * s, 0.66 * s, 0.14, BLACK));
    const bulbs = [];
    for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) bulbs.push(at(ico(0.075 * s, 1, bulbM), (i - 1) * 0.2 * s, (j - 1) * 0.2 * s, 0.09));
    bulbs.forEach(q => p.add(q)); p.userData.bulbs = bulbs; return p;
  }
  function tripod(h) {   // a black lighting stand: three splayed legs and a pole
    const g = new THREE.Group(); g.add(at(cyl(0.02, 0.02, h, 5, BLACK), 0, h / 2, 0));
    for (let i = 0; i < 3; i++) { const a = i * TAU / 3, l = at(cyl(0.015, 0.015, 0.6, 4, BLACK), Math.sin(a) * 0.22, 0.25, Math.cos(a) * 0.22); l.rotation.set(Math.cos(a) * 0.6, 0, -Math.sin(a) * 0.6); g.add(l); }
    return g;
  }
  // instruments in the band's paws
  function instrument(kind) {
    const g = new THREE.Group(), brass = M(0xf0c040, { unlit: 0.35 });
    if (kind === 'trumpet') { g.add(rot(at(cyl(0.02, 0.02, 0.36, 5, brass), 0, 0, 0.18), PI / 2, 0, 0)); g.add(rot(at(cyl(0.09, 0.02, 0.12, 8, brass), 0, 0, 0.4), PI / 2, 0, 0)); }
    else if (kind === 'trombone') { g.add(rot(at(cyl(0.018, 0.018, 0.6, 5, brass), 0, 0, 0.3), PI / 2, 0, 0)); g.add(rot(at(cyl(0.018, 0.018, 0.6, 5, brass), 0, -0.08, 0.3), PI / 2, 0, 0)); g.add(rot(at(cyl(0.11, 0.025, 0.14, 8, brass), 0, 0, 0.66), PI / 2, 0, 0)); }
    else if (kind === 'sax') { g.add(rot(at(cyl(0.035, 0.05, 0.42, 6, brass), 0, -0.1, 0.1), 0.35, 0, 0)); g.add(rot(at(cyl(0.08, 0.05, 0.12, 8, brass), 0, -0.3, 0.2), -1.0, 0, 0)); }
    else if (kind === 'bass') { const wood = M(0x7a3a1a); g.add(at(box(0.5, 0.75, 0.2, wood), 0, -0.25, 0.16)); g.add(at(box(0.07, 0.75, 0.06, M(0x2a1a10)), 0, 0.5, 0.16)); g.add(at(box(0.02, 1.1, 0.02, M(0xd8d0c0)), 0, 0.15, 0.27)); }
    return g;
  }

  function ballroom() {
    const G = new THREE.Group(), B = BALLROOM;
    const W = 2 * B.X, D = B.FRONT_Z - B.BACK_Z;
    const woodT = tex(32, 32, (x, r) => { px(x, '#7a4a26', 0, 0, 32, 32); noise(x, r, 32, 32, ['#744624', '#82502a', '#6e4222'], 160); for (let i = 0; i < 32; i += 8) px(x, '#5a3418', 0, i, 32, 1); }, 4001);
    const carpetT = tex(32, 32, (x, r) => { px(x, '#5a1622', 0, 0, 32, 32); noise(x, r, 32, 32, ['#561420', '#621a26', '#521222'], 300); for (let i = 4; i < 32; i += 16) for (let j = 4; j < 32; j += 16) px(x, '#8a5a2a', i, j, 3, 3); }, 4002);
    const panelT = tex(32, 32, (x, r) => { px(x, '#3a2014', 0, 0, 32, 32); noise(x, r, 32, 32, ['#36200f', '#40241a'], 80); px(x, '#24140c', 0, 0, 32, 2); px(x, '#24140c', 0, 0, 2, 32); px(x, '#5a3420', 3, 3, 26, 1); px(x, '#5a3420', 3, 28, 26, 1); }, 4003);
    const velvetT = tex(32, 32, (x, r) => { for (let i = 0; i < 32; i++) { const v = Math.sin(i / 32 * TAU * 2); px(x, v > 0.35 ? '#a8182a' : v > -0.35 ? '#861222' : '#5e0c18', i, 0, 1, 32); } noise(x, r, 32, 32, ['rgba(0,0,0,.08)'], 60); }, 4004);
    G.add(flat(W, B.EDGE_Z - B.BACK_Z, mat({ map: woodT, rep: [W / 1.6, (B.EDGE_Z - B.BACK_Z) / 1.6] }), 0, 0, (B.BACK_Z + B.EDGE_Z) / 2));
    G.add(flat(W, B.FRONT_Z - B.EDGE_Z, mat({ map: carpetT, rep: [W / 2, (B.FRONT_Z - B.EDGE_Z) / 2] }), 0, 0, (B.EDGE_Z + B.FRONT_Z) / 2));
    // the stage's lip: a gold strip and the footlights
    G.add(at(box(W, 0.03, 0.08, GOLD), 0, 0.015, B.EDGE_Z));
    const foot = [];
    for (let x = -6; x <= 6.01; x += 0.75) { const f = at(new THREE.Mesh(new THREE.SphereGeometry(0.06, 6, 3, 0, TAU, 0, PI / 2), glow(0xffe0a0)), x, 0.03, B.EDGE_Z + 0.08); G.add(f); foot.push(f); }
    // walls, ceiling
    const wall = (w, h, T, tile) => new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat({ map: T, rep: [w / tile, h / tile] }));
    G.add(rot(at(wall(D, B.H, panelT, 1.6), -B.X, B.H / 2, (B.BACK_Z + B.FRONT_Z) / 2), 0, PI / 2, 0));
    G.add(rot(at(wall(D, B.H, panelT, 1.6), B.X, B.H / 2, (B.BACK_Z + B.FRONT_Z) / 2), 0, -PI / 2, 0));
    G.add(rot(at(wall(W, B.H, panelT, 1.6), 0, B.H / 2, B.FRONT_Z), 0, PI, 0));
    const ceil = new THREE.Mesh(new THREE.PlaneGeometry(W, D), M(0x1a1210)); ceil.rotation.x = PI / 2; G.add(at(ceil, 0, B.H, (B.BACK_Z + B.FRONT_Z) / 2));
    // the curtain and its valance with a gold fringe
    G.add(at(new THREE.Mesh(new THREE.PlaneGeometry(W, B.H), mat({ map: velvetT, rep: [W / 0.8, 1] })), 0, B.H / 2, B.CURTAIN_Z));
    G.add(at(box(W, 0.5, 0.12, GOLD), 0, B.H - 0.45, B.CURTAIN_Z + 0.1));
    for (let x = -B.X + 0.2; x < B.X; x += 0.32) G.add(rot(at(cone(0.05, 0.18, 4, GOLD), x, B.H - 0.78, B.CURTAIN_Z + 0.14), PI, 0, 0));
    // sconces on the side walls
    for (const sx of [-1, 1]) for (const z of [0, 4.5, 9, 12.5]) { G.add(at(box(0.06, 0.3, 0.16, GOLD), sx * (B.X - 0.04), 2.4, z)); G.add(at(ico(0.08, 1, glow(0xffe6b0)), sx * (B.X - 0.16), 2.62, z)); }
    // the bulb panels: on the curtain in staggered rows, and on tripods at the stage's sides
    const panels = [];
    for (const [x, y] of [[-3.2, 4.4], [-1.6, 3.4], [0, 4.6], [1.6, 3.4], [3.2, 4.4], [-4.8, 3.2], [4.8, 3.2], [-6.4, 4.5], [6.4, 4.5]]) { const p = at(bulbPanel(1), x, y, B.CURTAIN_Z + 0.1); G.add(p); panels.push(p); }
    for (const [x, z, h] of [[-6.6, 1.4, 2.2], [6.6, 1.4, 2.2], [-7.6, -1.6, 2.9], [7.6, -1.6, 2.9]]) { G.add(at(tripod(h), x, 0, z)); const p = at(bulbPanel(0.9), x, h + 0.3, z); p.rotation.y = x < 0 ? 0.5 : -0.5; G.add(p); panels.push(p); }
    // the risers, both sides
    for (const r of B.RISER) for (const sx of [-1, 1]) { const w = r.x1 - r.x0; G.add(at(box(w, r.y, r.z1 - r.z0, mat({ map: woodT, rep: [w / 1.6, 1] })), sx * (r.x0 + w / 2), r.y / 2, (r.z0 + r.z1) / 2)); G.add(at(box(w, 0.03, 0.04, GOLD), sx * (r.x0 + w / 2), r.y, r.z1)); }
    const rY = (x, z) => { for (const r of [...B.RISER].reverse()) if (Math.abs(x) > r.x0 - 0.01 && Math.abs(x) < r.x1 && z > r.z0 && z < r.z1) return r.y; return 0; };
    // the ribbon mic: a heavy round base, a chrome pole, a yoke and the pill-shaped capsule (silver grille, chrome rim)
    const micG = new THREE.Group(); G.add(micG); micG.position.set(B.MIC[0], 0, B.MIC[1]);
    micG.add(at(cyl(0.15, 0.17, 0.04, 10, CHROME), 0, 0.02, 0)); micG.add(at(cyl(0.012, 0.012, B.MIC_Y - 0.08, 5, CHROME), 0, (B.MIC_Y - 0.08) / 2, 0));
    const grilleT = tex(8, 16, x => { px(x, '#b8bcc4', 0, 0, 8, 16); for (let j = 1; j < 16; j += 2) px(x, '#6a6e78', 0, j, 8, 1); });
    micG.add(at(cyl(0.06, 0.06, 0.14, 10, mat({ map: grilleT })), 0, B.MIC_Y + 0.02, 0));
    micG.add(at(ico(0.06, 1, mat({ map: grilleT })), 0, B.MIC_Y + 0.09, 0)); micG.add(at(ico(0.06, 1, mat({ map: grilleT })), 0, B.MIC_Y - 0.05, 0));
    micG.add(at(box(0.15, 0.015, 0.015, CHROME), 0, B.MIC_Y - 0.06, 0));
    // the band: box pets in white dinner jackets on the risers, with their instruments
    const band = B.BAND.map(([kind, x, z], i) => {
      const p = pet(i + 3, WHITE_JACKET); G.add(p.g); const y = rY(x, z); p.g.position.set(x, y, z); const yaw0 = x < 0 ? 0.35 : -0.35;
      let ins = null, seated = false;
      if (kind === 'piano') {   // an upright piano, the pianist on a stool with his back to the lens side, facing it
        const piano = new THREE.Group(); piano.add(at(box(1.3, 1.0, 0.5, M(0x141418)), 0, 0.5, 0)); piano.add(at(box(1.2, 0.06, 0.22, M(0xf4f2ec)), 0, 0.72, 0.34)); piano.add(at(box(1.2, 0.03, 0.08, BLACK), 0, 0.76, 0.32));
        piano.position.set(x, y, z - 0.75); G.add(piano); seated = true;
      } else if (kind === 'drums') {   // a small kit: a white bass drum with a red head, two toms, a cymbal on a stand
        const kit = new THREE.Group(); kit.add(rot(at(cyl(0.34, 0.34, 0.3, 12, M(0xf2f0ea)), 0, 0.36, 0.55), PI / 2, 0, 0)); kit.add(at(new THREE.Mesh(new THREE.CircleGeometry(0.3, 12), M(0xa8182a)), 0, 0.36, 0.71));
        for (const dx of [-0.45, 0.45]) kit.add(at(cyl(0.16, 0.16, 0.12, 10, M(0xf2f0ea)), dx, 0.62, 0.45));
        kit.add(at(cyl(0.012, 0.012, 1.0, 4, CHROME), 0.75, 0.5, 0.35)); kit.add(at(cyl(0.22, 0.22, 0.012, 10, M(0xe0b040, { unlit: 0.3 })), 0.75, 1.0, 0.35));
        kit.position.set(x, y, z); G.add(kit); p.g.position.z = z - 0.25; seated = true;
      } else { ins = instrument(kind); p.body.add(ins); ins.position.set(kind === 'bass' ? 0.12 : 0, kind === 'bass' ? 0.55 : 0.82, 0.18); if (kind === 'bass') ins.rotation.z = 0.2; }
      return { p, kind, ins, x, z, yaw0: kind === 'piano' ? PI * 0.92 : yaw0, seated };
    });
    // the floor: round tables with white cloths and red lamps, two guests at each facing the stage
    const clothM = M(0xf4f2ec), lampM = glow(0xff6a4a, 0.85);
    const guests = [], tables = [];
    B.TABLES.forEach(([x, z], ti) => {
      const tb = new THREE.Group(); tb.add(at(cyl(0.55, 0.6, 0.55, 12, clothM), 0, 0.275, 0)); tb.add(at(cyl(0.012, 0.012, 0.2, 4, GOLD), 0, 0.65, 0)); tb.add(at(cone(0.09, 0.12, 6, lampM), 0, 0.78, 0));
      tb.position.set(x, 0, z); G.add(tb); tables.push({ tb, x, z });
      for (const dx of [-0.42, 0.42]) { const p = pet(ti * 2 + (dx > 0 ? 1 : 0)); G.add(p.g); guests.push({ p, x: x + dx, z: z + 0.62 }); }
    });
    // three chandeliers: a gold ring, candle bulbs, crystal drops
    const crystal = mat({ color: 0xf2f8ff, unlit: 0.7, see: 0.3 });
    for (const [x, z] of [[-4.2, 7.2], [4.2, 7.2], [0, 10.6]]) {
      const c = new THREE.Group(); const ring = new THREE.Mesh(new THREE.TorusGeometry(0.6, 0.04, 4, 16), GOLD); ring.rotation.x = PI / 2; c.add(ring);
      for (let i = 0; i < 10; i++) { const a = i * TAU / 10; c.add(at(ico(0.06, 1, glow(0xfff0c8)), Math.cos(a) * 0.6, 0.1, Math.sin(a) * 0.6)); c.add(rot(at(cone(0.05, 0.16, 4, crystal), Math.cos(a) * 0.5, -0.16, Math.sin(a) * 0.5), PI, 0, 0)); }
      c.add(at(cyl(0.01, 0.01, 1.0, 4, GOLD), 0, 0.55, 0)); c.add(at(ico(0.16, 1, crystal), 0, -0.25, 0));
      c.position.set(x, B.H - 1.3, z); G.add(c);
    }
    // the follow-spot's pool
    const pool = flat(1, 1, mat({ color: 0xfff2c8, unlit: 0.8, see: 0.55 }), 0, 0.016, 0); pool.geometry = new THREE.CircleGeometry(0.9, 18); pool.rotation.x = -PI / 2; pool.visible = false; G.add(pool);

    return {
      group: G, sky: null, shadowCol: 0x3a2412, indoor: true,
      light() { lights(0x6a5444, 0xffe8c8, [0.1, -0.9, -0.6], 0x120c0a, [16, 40], 9); },
      anim(t, P = {}) {
        const b = beat(t), stop = !!P.stop, bh = stop ? 0.4 : Math.exp(-fr(b / 4) * 3), hush = !!P.hush;
        // the stage's warm light, the band's, the room's over the tables (off in a hush: the reverse shots need the guests lit); a follow-spot or a key takes the fourth
        pt(0, 0, 3.6, 1.6, 1.25, 1.05, 0.82); pt(2, 0, 3.4, -2.6, 0.75, 0.6, 0.45);
        if (!hush) { pt(1, 0, 4.0, 7.0, 0.85, 0.7, 0.55); pt(3, 0, 3.8, 11.5, 0.5, 0.42, 0.33); }
        pool.visible = !!P.spot;
        if (P.spot) { pt(3, P.spot[0], 3.2, P.spot[1] + 0.6, 1.3, 1.15, 0.9); pool.position.set(P.spot[0], 0.016, P.spot[1]); }
        if (P.key) pt(3, P.key[0], P.key[1], P.key[2], P.key[3], P.key[4], P.key[5]);
        // the bulb panels flash on the bar, alternate bulbs a little dimmer (or hold steady)
        panels.forEach((p, i) => p.userData.bulbs.forEach((q, j) => { const on = P.flash === false || stop ? 1 : (0.55 + 0.45 * bh) * (((j + i + Math.floor(b)) % 2) ? 1 : 0.85); q.scale.setScalar(0.8 + 0.25 * on); q.material = on > 0.6 ? bulbM : bulbDim; }));
        foot.forEach((f, i) => { f.scale.setScalar(stop ? 1 : 0.9 + 0.15 * Math.abs(Math.sin((b + i * 0.25) * PI))); });
        micG.visible = P.mic !== false;
        // the band plays on the beat, points, or freezes
        const bmode = stop ? 'stop' : (P.band || 'play');
        band.forEach(q => {
          const { p } = q; p.g.visible = P.band !== false && !cleared(P, q.x, q.z);
          p.head.rotation.set(0, 0, 0); p.arms.forEach(a => a.rotation.set(0, 0, 0)); p.g.rotation.y = q.yaw0;
          const bob = bmode === 'play' ? 0.04 * Math.abs(Math.sin(b * PI)) : 0;
          p.legs.forEach(l => { l.rotation.x = q.seated ? -1.4 : 0; }); p.body.position.y = (q.seated ? -0.24 : 0) + bob;
          if (q.kind === 'trumpet' || q.kind === 'trombone' || q.kind === 'sax') { p.arms.forEach(a => { a.rotation.x = -1.35; a.rotation.z = (a.position.x < 0 ? 1 : -1) * 0.35; }); if (q.ins) q.ins.rotation.x = bmode === 'play' ? -0.15 - 0.12 * Math.abs(Math.sin(b * PI)) : -0.1; }
          else if (q.kind === 'bass') { p.arms[0].rotation.x = -0.9; p.arms[1].rotation.x = -0.5 - (bmode === 'play' ? 0.25 * Math.abs(Math.sin(b * PI * 2)) : 0); }
          else if (q.kind === 'piano') p.arms.forEach((a, j) => { a.rotation.x = -1.2 - (bmode === 'play' ? 0.15 * Math.abs(Math.sin((b + j * 0.5) * PI * 2)) : 0); });
          else if (q.kind === 'drums') p.arms.forEach((a, j) => { a.rotation.x = -1.0 - (bmode === 'play' ? 0.5 * Math.abs(Math.sin((b + j * 0.5) * PI)) : 0); });
          if (bmode === 'point' && P.stare) {   // the player turns to the one they all see and points
            p.g.rotation.y = Math.atan2(P.stare[0] - q.x, P.stare[1] - q.z); p.arms[1].rotation.set(-1.75, 0, 0);
          }
        });
        // the guests: watch, point, cheer, gasp, or stand and point
        const mode = P.noguests ? false : (P.pets ?? 'watch');
        tables.forEach(q => { q.tb.visible = !cleared(P, q.x, q.z); });
        guests.forEach((q, i) => {
          const { p } = q, show = mode !== false && !cleared(P, q.x, q.z);
          p.g.visible = show; if (!show) return;
          const standing = mode === 'stand';
          p.g.position.set(q.x, standing ? 0 : -0.2, q.z);
          p.legs.forEach(l => { l.rotation.x = standing ? 0 : -1.4; });
          const tx = P.stare ? P.stare[0] : 0, tz = P.stare ? P.stare[1] : 0.6;
          p.g.rotation.y = Math.atan2(tx - q.x, tz - q.z);
          p.head.rotation.set(stop ? 0 : 0.04 * Math.sin(b * PI + i), 0, 0); p.mouth.visible = false;
          p.arms.forEach(a => a.rotation.set(0, 0, 0));
          if (mode === 'point' || standing) { p.arms[i % 2].rotation.set(-1.75 - (stop ? 0 : 0.08 * Math.sin(b * PI * 2 + i)), 0, 0); p.mouth.visible = true; }
          else if (mode === 'cheer') { const up = stop ? 1 : Math.abs(Math.sin(b * PI)); p.arms.forEach((a, j) => { a.rotation.z = (j ? 1 : -1) * (2.3 + 0.3 * up); }); p.mouth.visible = true; }
          else if (mode === 'gasp') { p.arms.forEach((a, j) => { a.rotation.x = -2.3; a.rotation.z = (j ? 1 : -1) * 0.35; }); p.mouth.visible = true; }
        });
      },
    };
  }

  function hotel() {
    const G = new THREE.Group(), { CORR: C, HALL: Hl, STAIRS: S, H } = HOTEL;
    const runT = tex(32, 32, (x, r) => { px(x, '#3a1a22', 0, 0, 32, 32); noise(x, r, 32, 32, ['#361820', '#40202a'], 120); px(x, '#5a3a2a', 3, 0, 1, 32); px(x, '#5a3a2a', 28, 0, 1, 32); for (let j = 4; j < 32; j += 16) { px(x, '#4e2630', 15, j, 2, 2); px(x, '#4e2630', 14, j + 1, 4, 1); } }, 4011);   // low contrast: a bright border and bars read as a road's markings in black and white
    const parqT = tex(32, 32, (x, r) => { px(x, '#6a4428', 0, 0, 32, 32); noise(x, r, 32, 32, ['#644026', '#70482c'], 140); for (let i = 0; i < 32; i += 8) px(x, '#4e301a', i, 0, 1, 32); }, 4012);
    const paperT = tex(32, 32, (x, r) => { for (let i = 0; i < 32; i++) px(x, (i % 8) < 4 ? '#d8cdb4' : '#c4b89c', i, 0, 1, 32); noise(x, r, 32, 32, ['rgba(0,0,0,.05)'], 60); }, 4013);
    const wainT = tex(32, 32, (x, r) => { px(x, '#4a2c1c', 0, 0, 32, 32); noise(x, r, 32, 32, ['#462a1a', '#4e301e'], 60); px(x, '#2e1a10', 0, 0, 32, 2); px(x, '#6a4430', 4, 4, 24, 1); px(x, '#6a4430', 4, 27, 24, 1); px(x, '#6a4430', 4, 4, 1, 24); px(x, '#6a4430', 27, 4, 1, 24); }, 4014);
    const marbleT = tex(32, 32, (x, r) => { px(x, '#ece8e0', 0, 0, 16, 16); px(x, '#ece8e0', 16, 16, 16, 16); px(x, '#3a3632', 16, 0, 16, 16); px(x, '#3a3632', 0, 16, 16, 16); noise(x, r, 32, 32, ['rgba(128,128,128,.12)'], 80); }, 4015);
    const doorT = tex(16, 32, (x, r) => { px(x, '#3a2214', 0, 0, 16, 32); noise(x, r, 16, 32, ['#36200f', '#40261a'], 40); px(x, '#5a3a24', 2, 2, 12, 12); px(x, '#5a3a24', 2, 17, 12, 13); px(x, '#3a2214', 3, 3, 10, 10); px(x, '#3a2214', 3, 18, 10, 11); px(x, '#e0b84a', 12, 16, 2, 2); }, 4016);
    const cw = C.x1 - C.x0, cd = C.z1 - C.z0, TRIM = M(0x2e1a10);
    G.add(flat(cw, cd, mat({ map: parqT, rep: [cw / 1.4, cd / 1.4] }), 0, 0, (C.z0 + C.z1) / 2));
    G.add(flat(1.5, cd, mat({ map: runT, rep: [1, cd / 1.5] }), 0, 0.006, (C.z0 + C.z1) / 2));
    const cc = new THREE.Mesh(new THREE.PlaneGeometry(cw, cd), M(0xd8d0c0)); cc.rotation.x = PI / 2; G.add(at(cc, 0, H, (C.z0 + C.z1) / 2));
    // the corridor's walls round their doors: wainscot to 1 m, wallpaper above; a door leaf hinged in each opening
    const dw = HOTEL.DOOR_W, dh = HOTEL.DOOR_H, leaves = [];
    for (const sx of [-1, 1]) {
      const xw = sx < 0 ? C.x0 : C.x1, yaw = sx < 0 ? PI / 2 : -PI / 2;
      const cuts = HOTEL.DOORS.map(z => [z - dw / 2, z + dw / 2]).sort((a, b) => a[0] - b[0]);
      let z = C.z0; const segs = []; for (const [a, b] of cuts) { segs.push([z, a]); z = b; } segs.push([z, C.z1]);
      for (const [a, b] of segs) {
        if (b - a < 0.01) continue; const m = (a + b) / 2, len = b - a;
        G.add(rot(at(new THREE.Mesh(new THREE.PlaneGeometry(len, 1.0), mat({ map: wainT, rep: [len / 0.9, 1] })), xw, 0.5, m), 0, yaw, 0));
        G.add(rot(at(new THREE.Mesh(new THREE.PlaneGeometry(len, H - 1.0), mat({ map: paperT, rep: [len / 0.8, (H - 1) / 0.8] })), xw, 1.0 + (H - 1.0) / 2, m), 0, yaw, 0));
        G.add(at(box(0.04, 0.05, len, TRIM), xw - sx * 0.02, 1.0, m));
      }
      for (const [a, b] of cuts) {
        const m = (a + b) / 2;
        G.add(rot(at(new THREE.Mesh(new THREE.PlaneGeometry(dw, H - dh), mat({ map: paperT, rep: [1, 1] })), xw, dh + (H - dh) / 2, m), 0, yaw, 0));
        for (const e of [a, b]) G.add(at(box(0.08, dh, 0.08, TRIM), xw - sx * 0.02, dh / 2, e));
        G.add(at(box(0.08, 0.1, dw + 0.16, TRIM), xw - sx * 0.02, dh + 0.05, m));
        const pivot = new THREE.Group(); pivot.position.set(xw + sx * 0.02, 0, a); G.add(pivot);
        const leaf = at(new THREE.Mesh(new THREE.PlaneGeometry(dw, dh), mat({ map: doorT, side: THREE.DoubleSide })), 0, dh / 2, dw / 2); leaf.rotation.y = yaw; pivot.add(leaf);
        G.add(at(box(0.02, 0.12, 0.2, GOLD), xw - sx * 0.03, 1.75, m));   // the room number's brass plate
        G.add(at(box(0.05, dh, dw), xw + sx * 1.2, dh / 2, m));   // the room beyond: a dark back wall so an open door shows depth
        leaves.push({ pivot, sx });
      }
      for (const z of [4.0, 0.6, -3.4, -7.4, -11.4, -15.4]) { G.add(at(box(0.05, 0.22, 0.12, GOLD), xw - sx * 0.03, 2.05, z)); G.add(at(cone(0.09, 0.14, 6, glow(0xfff2d0, 0.9)), xw - sx * 0.1, 2.25, z)); }
    }
    G.add(rot(at(new THREE.Mesh(new THREE.PlaneGeometry(cw, H), mat({ map: paperT, rep: [cw / 0.8, H / 0.8] })), 0, H / 2, C.z1), 0, PI, 0));
    for (let z = C.z1 - 2; z > C.z0; z -= 4) G.add(rot(at(new THREE.Mesh(new THREE.CircleGeometry(0.22, 10), glow(0xfff6e0, 0.9)), 0, H - 0.01, z), PI / 2, 0, 0));
    // the clip's light at the end of the corridor: the hall's doorway blazing white (shown in the corridor zone only)
    const endGlow = at(new THREE.Mesh(new THREE.PlaneGeometry(cw, H), mat({ color: 0xffffff, unlit: 1 })), 0, H / 2, C.z0 - 0.05); G.add(endGlow);
    // the hall: marble floor, panelled walls round the corridor's mouth, tall windows with drapes
    const hw = Hl.x1 - Hl.x0, hd = Hl.z1 - Hl.z0;
    G.add(flat(hw, hd, mat({ map: marbleT, rep: [hw / 2.4, hd / 2.4] }), 0, 0, (Hl.z0 + Hl.z1) / 2));
    const hc = new THREE.Mesh(new THREE.PlaneGeometry(hw, hd), M(0xe8e0d0)); hc.rotation.x = PI / 2; G.add(at(hc, 0, Hl.H, (Hl.z0 + Hl.z1) / 2));
    const hwall = (w, h, x, y, z, yaw) => G.add(rot(at(new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat({ map: wainT, rep: [w / 1.2, h / 1.2] })), x, y, z), 0, yaw, 0));
    for (const [a, b] of [[Hl.x0, C.x0], [C.x1, Hl.x1]]) hwall(b - a, Hl.H, (a + b) / 2, Hl.H / 2, Hl.z1, PI);
    hwall(cw, Hl.H - H, 0, H + (Hl.H - H) / 2, Hl.z1, PI);
    hwall(hd, Hl.H, Hl.x0, Hl.H / 2, (Hl.z0 + Hl.z1) / 2, PI / 2); hwall(hd, Hl.H, Hl.x1, Hl.H / 2, (Hl.z0 + Hl.z1) / 2, -PI / 2); hwall(hw, Hl.H, 0, Hl.H / 2, Hl.z0, 0);
    const winM = glow(0xf6fbff, 0.95), drapeM = M(0x8a1a2a);
    for (const sx of [-1, 1]) for (const z of [-20.5, -23.5]) {
      G.add(rot(at(new THREE.Mesh(new THREE.PlaneGeometry(1.2, 3.4), winM), sx * (Hl.x1 - 0.02), 2.6, z), 0, -sx * PI / 2, 0));
      for (const dz of [-0.75, 0.75]) G.add(at(box(0.12, 4.2, 0.4, drapeM), sx * (Hl.x1 - 0.1), 2.3, z + dz));
    }
    // the grand staircase: steps rising to -z, balusters, handrails, newel posts, the landing, a portrait over it
    const stepM = M(0xe8e2d6), runM = M(0x7a1a28), woodM = M(0x3a2214);
    for (let i = 0; i < S.n; i++) {
      const z = S.z1 - (i + 0.5) * S.run, y = (i + 1) * S.step;
      G.add(at(box(S.x1 - S.x0, S.step, S.run, stepM), 0, y - S.step / 2, z)); G.add(at(box(1.6, 0.012, S.run, runM), 0, y + 0.006, z));
      for (const sx of [-1, 1]) G.add(at(cyl(0.03, 0.03, 0.8, 5, M(0xf4f0e6)), sx * (S.x1 - 0.06), y + 0.4, z));
    }
    for (const sx of [-1, 1]) {
      const len = Math.hypot(S.run * S.n, S.top), r = at(box(0.1, 0.08, len, woodM), sx * (S.x1 - 0.06), S.top / 2 + 0.82, (S.z1 + S.z0) / 2);
      r.rotation.x = Math.atan2(S.top, S.run * S.n); G.add(r);
      G.add(at(cyl(0.09, 0.11, 1.0, 6, woodM), sx * (S.x1 - 0.06), 0.5, S.z1 + 0.1)); G.add(at(ico(0.1, 1, GOLD), sx * (S.x1 - 0.06), 1.06, S.z1 + 0.1));
    }
    G.add(at(box(S.x1 - S.x0 + 2, S.top, S.z0 - Hl.z0, stepM), 0, S.top / 2, (S.z0 + Hl.z0) / 2));
    G.add(at(box(2.2, 1.6, 0.06, GOLD), 0, S.top + 2.0, Hl.z0 + 0.06)); G.add(at(box(1.9, 1.3, 0.02, M(0x2a3a4a)), 0, S.top + 2.0, Hl.z0 + 0.1));
    // the chandelier
    const crystal = mat({ color: 0xf6faff, unlit: 0.75, see: 0.3 }), chand = new THREE.Group();
    for (const [r0, y] of [[1.1, 0], [0.7, -0.45]]) {
      const ring = new THREE.Mesh(new THREE.TorusGeometry(r0, 0.05, 4, 18), GOLD); ring.rotation.x = PI / 2; ring.position.y = y; chand.add(ring);
      for (let i = 0; i < 14; i++) { const a = i * TAU / 14; chand.add(at(ico(0.07, 1, glow(0xfff2cc)), Math.cos(a) * r0, y + 0.1, Math.sin(a) * r0)); chand.add(rot(at(cone(0.06, 0.22, 4, crystal), Math.cos(a) * r0 * 0.85, y - 0.2, Math.sin(a) * r0 * 0.85), PI, 0, 0)); }
    }
    chand.add(at(ico(0.28, 1, crystal), 0, -0.9, 0)); chand.add(at(cyl(0.015, 0.015, 1.4, 4, GOLD), 0, 0.7, 0));
    chand.position.set(0, Hl.H - 1.6, -22.5); G.add(chand);
    // the plinth (for a statue), the palms in their urns
    G.add(at(box(0.8, HOTEL.PED_Y, 0.8, M(0xf0ece4)), HOTEL.PED[0], HOTEL.PED_Y / 2, HOTEL.PED[1])); G.add(at(box(0.9, 0.06, 0.9, M(0xe4e0d6)), HOTEL.PED[0], HOTEL.PED_Y - 0.03, HOTEL.PED[1]));
    for (const [x, z] of HOTEL.PALMS) {
      const p = new THREE.Group(); p.add(at(cyl(0.22, 0.17, 0.42, 8, M(0xd8d0bc)), 0, 0.21, 0)); p.add(at(cyl(0.035, 0.05, 0.9, 5, M(0x6a5030)), 0, 0.85, 0));
      for (let i = 0; i < 7; i++) { const a = i * TAU / 7, f = at(box(0.14, 0.02, 0.85, M(0x3a7a3a)), Math.sin(a) * 0.36, 1.25, Math.cos(a) * 0.36); f.rotation.set(0.5, a, 0, 'YXZ'); p.add(f); }
      p.position.set(x, 0, z); G.add(p);
    }
    return {
      group: G, sky: null, shadowCol: 0x2a2220, indoor: true,
      light() { lights(0x6a625a, 0xfff4e0, [0.4, -0.85, 0.2], 0x16120e, [14, 40], 8); },
      anim(t, P = {}) {
        const s = shotT(t, P), zone = P.zone || 'corridor';
        if (zone === 'hall') { pt(0, -5.5, 3.2, -22, 1.2, 1.2, 1.25); pt(1, 5.5, 3.2, -22, 1.2, 1.2, 1.25); pt(2, 0, 5.0, -22.5, 1.0, 0.95, 0.85); }
        else { pt(0, 0, 2.6, 2.0, 0.85, 0.75, 0.6); pt(1, 0, 2.6, -6.0, 0.85, 0.75, 0.6); pt(2, 0, 3.0, -16.0, 1.2, 1.15, 1.1); }
        if (P.key) pt(3, P.key[0], P.key[1], P.key[2], P.key[3], P.key[4], P.key[5]);
        leaves.forEach((l, i) => { const d = P.door && P.door[0] === i ? ramp(P.door[1], s) : 0; l.pivot.rotation.y = l.sx * 1.4 * cl(d); });
        endGlow.visible = zone !== 'hall';
      },
    };
  }

  return { ballroom: ballroom(), hotel: hotel() };
}
