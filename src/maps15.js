// maps15.js: the "Hootie Frutti" map (2026-09-28, KATSEYE: the clip is a dance rehearsal in a sweltering old warehouse,
// sun through tall factory windows, white plastic chairs, water jugs, a girl lounging on a stack of red plastic chairs,
// fruit-coloured outfits). Same contract as the other map files, pure in t:
//   hall  the warehouse turned into a fruits-only dance-off on a hot afternoon: a concrete floor, steel columns and ceiling
//         pipes, tall factory windows glowing warm on the back and left walls, bunting in fruit colours, white plastic
//         chairs and blue water jugs along the walls, two standing fans; the big roller door in the front wall (+z,
//         open, DOOR) onto a sunny yard (the "FRUIT ONLY" sign beside it: a banana, cherries, a strawberry, a pineapple
//         and a carrot crossed out; a lime HOOTIE FRUTTI banner above), a low window in the left wall (WINDOW: a face
//         outside it shows from the sill up), Kob's throne of stacked red chairs (THRONE, the top seat at THRONE_Y),
//         the pallet podium (PODIUM, top PODIUM_Y) with a speaker stack, the fruit bar (BAR: a table, top BAR_Y, piled
//         with fruit), crates of fruit, and pets in fruit-coloured tops with a little fruit on their heads round the floor.
//         Flags read by anim(t, P): `flap` (the crowd's "hootie" move: paws up by the ears, flapping on the beat),
//         `cheer` (paws up), `stare` ([x, z]: the heads turn there), `pile` (0-60: fruit heaped round `pileAt`, default
//         the podium's mark; or [n0, per beat]: it grows), `bar` (0-1: how full the fruit bar still is), `stop` (cut s:
//         the music stops dead, every pet freezes, the fans too), `barGap` (the counter in front of BEHIND_BAR cleared of fruit),
//         `noguests`, `clear` ([[x, z, r]]: no pet near those
//         points: the lenses, the marks), `key` ([x, y, z, r, g, b]: a light on the action).
import { mapKit } from './mapkit.js';
import { fruitMesh, SMALL_FRUIT, drawFruitOnly } from './fruit.js';

export const HALL = {
  X: [-8, 8], Z: [-10, 6], H: 6.2,
  DOOR: [3.3, 6.0], DOOR_W: 3.4, DOOR_H: 3.4, SAXO_DOOR: [2.0, 5.55], OUTSIDE: [2.6, 7.35], BOARD: [5.7, 6.7],
  WINDOW: [-8.0, 1.0], SILL: 0.55, WIN_TOP: 2.3, WIN_W: 1.8, PEEK: [-8.55, 1.0],
  THRONE: [-5.5, -4.4], THRONE_Y: 0.72, THRONE_YAW: 0.95,
  FLOOR: [0, -1.4], RING_C: [0, -1.25], PODIUM: [0, -5.3], PODIUM_W: 2.8, PODIUM_D: 1.8, PODIUM_Y: 0.3, STAGE: [0, -5.1],
  BAR: [4.7, -2.6], BAR_LEN: 2.6, BAR_Y: 0.55, BEHIND_BAR: [5.45, -2.6],
};

export function buildWarehouseMaps(K) {
  const k = mapKit(K);
  const { THREE, mat, tex, px, noise, box, TAU, PI, hash, beat, cyl, cone, at, rot, flat, lights, pt, room } = k;
  const M = (c, o = {}) => mat({ color: c, ...o }), glow = c => mat({ color: c, unlit: 1 });
  const cleared = (P, x, z) => (P.clear || []).some(([cx, cz, r]) => (x - cx) ** 2 + (z - cz) ** 2 < r * r);
  const { X, Z, H, DOOR, DOOR_W, DOOR_H, WINDOW, SILL, WIN_TOP, WIN_W, THRONE, THRONE_YAW, PODIUM, PODIUM_W, PODIUM_D, PODIUM_Y, STAGE, BAR, BAR_LEN, BAR_Y } = HALL;
  const STEEL = M(0x6a7078), RED = M(0xe8384a), WHITE = M(0xeeeee6), WOOD = M(0xb8905a), WOOD2 = M(0x9a7444);

  // ---------- fruit-party pets: faceted heads, a fruit-coloured top, box arms that can flap, a little fruit on the head ----------
  const FURS = [0xd8a868, 0xe8d8c0, 0xb08a60, 0xf2eee6, 0x9a9aa4, 0x5a4a40, 0xe8c090];
  const TOPS = [0xffe45a, 0xff5a6a, 0xffa33a, 0x6ad86a, 0xb07af0, 0xff8ac8, 0x5ac8ff];
  const HATS = ['strawberry', 'orange', 'banana', 'apple', 'grapes', 'lemon', 'pineapple'];
  function pet(i) {
    const g = new THREE.Group(), F = M(FURS[i % FURS.length]), kind = i % 3, top = M(TOPS[(i * 3) % TOPS.length]);
    const body = new THREE.Group(); g.add(body);
    body.add(at(box(0.38, 0.46, 0.27, top), 0, 0.33, 0));
    for (const s of [-1, 1]) body.add(at(box(0.12, 0.12, 0.13, M(0x2a2a30)), s * 0.1, 0.06, 0.02));
    const arms = [-1, 1].map(s => { const a = at(new THREE.Group(), s * 0.22, 0.52, 0); a.add(at(box(0.09, 0.3, 0.09, top), 0, -0.13, 0)); a.add(at(box(0.08, 0.08, 0.08, F), 0, -0.3, 0)); body.add(a); return a; });
    const head = at(new THREE.Group(), 0, 0.78, 0); body.add(head);
    const skull = new THREE.Mesh(new THREE.IcosahedronGeometry(0.24, 1), F); skull.scale.set(1, 0.9, 0.92); head.add(skull);
    const snout = at(new THREE.Mesh(new THREE.IcosahedronGeometry(0.1, 1), M(0xf0e6d8)), 0, -0.07, 0.19); snout.scale.set(1.1, 0.8, 0.9); head.add(snout);
    head.add(at(new THREE.Mesh(new THREE.IcosahedronGeometry(0.035, 0), M(0x151515)), 0, -0.03, 0.28));
    for (const e of [-1, 1]) {
      head.add(at(new THREE.Mesh(new THREE.IcosahedronGeometry(0.038, 0), M(0x0e0e0e)), e * 0.1, 0.05, 0.19));
      head.add(at(new THREE.Mesh(new THREE.IcosahedronGeometry(0.012, 0), glow(0xffffff)), e * 0.1 + 0.012, 0.065, 0.225));
      head.add(kind === 0 ? rot(at(cone(0.08, 0.2, 4, F), e * 0.15, 0.27, 0), 0, 0, -e * 0.25) : kind === 1 ? at(box(0.08, 0.3, 0.06, F), e * 0.1, 0.33, 0) : rot(at(box(0.07, 0.24, 0.16, F), e * 0.24, 0.02, 0), 0, 0, e * 0.3));
    }
    const hat = fruitMesh(K, HATS[i % HATS.length]); hat.scale.setScalar(1.3); hat.position.set(0, 0.28, -0.02); head.add(hat);
    return { g, body, head, arms, i };
  }

  function hall() {
    const G = new THREE.Group();
    const W = X[1] - X[0], D = Z[1] - Z[0], cz = (Z[0] + Z[1]) / 2;
    // ---------------- the shell: a scuffed concrete floor, pale brick walls, a dark ceiling with steel trusses ----------------
    const floorT = tex(16, 16, (x, r) => { px(x, '#8a8478', 0, 0, 16, 16); noise(x, r, 16, 16, ['#948e82', '#7e786e', '#8e887a'], 70); px(x, '#6e6a60', 0, 0, 16, 1); }, 1510);
    G.add(flat(W, D, mat({ map: floorT, rep: [W / 2, D / 2] }), 0, 0, cz));
    const wallT = tex(16, 16, (x, r) => { px(x, '#dccbac', 0, 0, 16, 16); for (let y = 0; y < 16; y += 4) px(x, '#c8b898', 0, y, 16, 1); for (let y = 0; y < 16; y += 8) for (let xx = 0; xx < 16; xx += 8) px(x, '#b4a488', xx + (y % 16 ? 4 : 0), y, 1, 4); noise(x, r, 16, 16, ['#e2d2b4', '#d0c0a2'], 50); }, 1511);
    room(G, W, D, H, wallT, 1.6, 0x3a3630, { cz, skip: ['front', 'left'] });
    // the front wall (+z), built round the door opening; seen from both sides (the yard shots look at it from outside)
    const dL = DOOR[0] - DOOR_W / 2, dR = DOOR[0] + DOOR_W / 2;
    const wallPiece = (x0, x1, y0, y1, zz, ry) => { const w = x1 - x0, h = y1 - y0, m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat({ map: wallT, rep: [w / 1.6, h / 1.6] })); m.position.set((x0 + x1) / 2, (y0 + y1) / 2, zz); m.rotation.y = ry; G.add(m); };
    for (const [x0, x1, y0, y1] of [[X[0], dL, 0, H], [dR, X[1], 0, H], [dL, dR, DOOR_H, H]]) { wallPiece(x0, x1, y0, y1, Z[1], PI); wallPiece(x0, x1, y0, y1, Z[1] + 0.02, 0); }
    for (const s of [dL, dR]) G.add(at(box(0.14, DOOR_H, 0.2, STEEL), s, DOOR_H / 2, Z[1]));
    G.add(at(box(DOOR_W + 0.2, 0.4, 0.3, M(0x7a8088)), DOOR[0], DOOR_H + 0.2, Z[1] - 0.1));   // the rolled-up door
    // the left wall (-x), built round the low window (z from WINDOW[1] - WIN_W / 2 to WINDOW[1] + WIN_W / 2)
    const wz0 = WINDOW[1] - WIN_W / 2, wz1 = WINDOW[1] + WIN_W / 2;
    const leftPiece = (z0, z1, y0, y1) => { const w = z1 - z0, h = y1 - y0, m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat({ map: wallT, rep: [w / 1.6, h / 1.6] })); m.position.set(X[0], (y0 + y1) / 2, (z0 + z1) / 2); m.rotation.y = PI / 2; G.add(m); const o = m.clone(); o.rotation.y = -PI / 2; o.position.x = X[0] - 0.02; G.add(o); };
    for (const [z0, z1, y0, y1] of [[Z[0], wz0, 0, H], [wz1, Z[1], 0, H], [wz0, wz1, 0, SILL], [wz0, wz1, WIN_TOP, H]]) leftPiece(z0, z1, y0, y1);
    // trusses and pipes under the ceiling
    for (let i = 0; i < 5; i++) { const zz = Z[0] + 1.6 + i * 3.2; G.add(at(box(W, 0.18, 0.12, STEEL), 0, H - 0.5, zz)); for (let j = 0; j < 8; j++) { const d = at(box(0.06, 0.62, 0.06, STEEL), X[0] + 1 + j * 2, H - 0.25, zz); d.rotation.z = j % 2 ? 0.6 : -0.6; G.add(d); } }
    for (const [x, c] of [[-6.2, 0xb84a3a], [-5.8, 0x6a7078], [6.4, 0x3a6ab8]]) G.add(at(rot(cyl(0.08, 0.08, D, 6, M(c)), PI / 2, 0, 0), x, H - 0.9, cz));
    // steel columns
    for (const [x, z] of [[-4.6, -7.6], [4.6, -7.6], [-4.6, 1.2], [4.6, 2.6]]) { G.add(at(box(0.3, H, 0.3, STEEL), x, H / 2, z)); G.add(at(box(0.44, 0.1, 0.44, M(0x5a5e66)), x, 0.05, z)); }

    // ---------------- the factory windows: tall steel grids of warm glass on the back and left walls ----------------
    const glassT = tex(8, 8, (x, r) => { px(x, '#fff0c0', 0, 0, 8, 8); noise(x, r, 8, 8, ['#ffe8a8', '#fff6d8'], 16); px(x, '#5a5a58', 0, 0, 8, 1); px(x, '#5a5a58', 0, 0, 1, 8); }, 1512);
    const winM = (w, h) => mat({ map: glassT, rep: [w / 0.5, h / 0.5], unlit: 0.95 });
    for (const x of [-5.4, -1.8, 1.8, 5.4]) { const w = 2.6, h = 3.4; G.add(at(new THREE.Mesh(new THREE.PlaneGeometry(w, h), winM(w, h)), x, 2.3 + h / 2, Z[0] + 0.03)); G.add(at(box(w + 0.16, 0.12, 0.14, STEEL), x, 2.24, Z[0] + 0.08)); }
    for (const z of [-7.2, -3.6]) { const w = 2.4, h = 3.2; G.add(rot(at(new THREE.Mesh(new THREE.PlaneGeometry(w, h), winM(w, h)), X[0] + 0.03, 2.4 + h / 2, z), 0, PI / 2, 0)); }
    // the low window by the yard: a steel frame round the hole, a sill, and the sunny yard beyond
    const [wx, wz] = WINDOW;
    G.add(at(box(0.3, 0.08, WIN_W + 0.3, M(0x9a9a92)), wx + 0.1, SILL - 0.04, wz));
    for (const s of [-1, 1]) G.add(at(box(0.08, WIN_TOP - SILL, 0.08, STEEL), wx, (SILL + WIN_TOP) / 2, wz + s * WIN_W / 2));
    G.add(at(box(0.08, 0.08, WIN_W + 0.1, STEEL), wx, WIN_TOP, wz)); G.add(at(box(0.08, 0.06, WIN_W, STEEL), wx, (SILL + WIN_TOP) / 2 + 0.3, wz));
    const outT = tex(16, 8, (x, r) => { px(x, '#9ad0f0', 0, 0, 16, 4); px(x, '#e8d8b0', 0, 4, 16, 4); px(x, '#c8b890', 0, 5, 16, 1); noise(x, r, 16, 4, ['#a8d8f4'], 6); }, 1513);
    G.add(rot(at(new THREE.Mesh(new THREE.PlaneGeometry(8, 5), mat({ map: outT, unlit: 1 })), X[0] - 3.5, 2.2, wz), 0, PI / 2, 0));
    G.add(flat(3.4, WIN_W + 2, M(0xb0a896), X[0] - 1.7, -0.004, wz));   // the ground outside the window

    // ---------------- outside: the sunny yard in front of the door, the sign and the banner ----------------
    const yardT = tex(16, 16, (x, r) => { px(x, '#b0a896', 0, 0, 16, 16); noise(x, r, 16, 16, ['#bab29e', '#a69e8c'], 60); }, 1514);
    G.add(flat(28, 14, mat({ map: yardT, rep: [14, 7] }), 0, -0.004, Z[1] + 7));
    const skyT = tex(4, 64, x => { const g = x.createLinearGradient(0, 0, 0, 64); g.addColorStop(0, '#6ab4f0'); g.addColorStop(0.6, '#bfe4fa'); g.addColorStop(1, '#fff2d0'); x.fillStyle = g; x.fillRect(0, 0, 4, 64); }, 1515);
    const sky = new THREE.Mesh(new THREE.SphereGeometry(120, 12, 8), mat({ map: skyT, unlit: 1, side: THREE.BackSide, nofog: 1 })); sky.position.set(0, -20, 0); G.add(sky);
    const facT = tex(32, 16, (x, r) => { px(x, '#d8c8a8', 0, 0, 32, 16); for (let i = 2; i < 32; i += 8) px(x, '#8ab0c8', i, 4, 5, 6); noise(x, r, 32, 16, ['#e0d0b0', '#ccbc9c'], 40); }, 1516);
    G.add(rot(at(new THREE.Mesh(new THREE.PlaneGeometry(30, 8), mat({ map: facT, rep: [3, 1], unlit: 0.4 })), 0, 4, Z[1] + 13), 0, PI, 0));   // a warehouse across the yard
    const signT = tex(64, 80, x => drawFruitOnly(x, TAU), 1517);
    // the same sign on a sandwich board in the yard, both faces (seen from the door and from the yard)
    const [sbx, sbz] = HALL.BOARD, sb = at(new THREE.Group(), sbx, 0, sbz); G.add(sb);
    for (const f of [-1, 1]) { const pnl = at(new THREE.Group(), 0, 0.5, f * 0.12); pnl.rotation.x = f * 0.22; sb.add(pnl); pnl.add(at(box(0.66, 1.0, 0.03, WOOD2), 0, 0, 0)); const face = at(new THREE.Mesh(new THREE.PlaneGeometry(0.58, 0.72), mat({ map: signT, unlit: 0.6 })), 0, 0.08, f * 0.02); face.rotation.y = f > 0 ? 0 : PI; pnl.add(face); }
    const bannerT = tex(96, 16, x => { const g = x.createLinearGradient(0, 0, 96, 0); g.addColorStop(0, '#b8ff3a'); g.addColorStop(1, '#ffe83a'); x.fillStyle = g; x.fillRect(0, 0, 96, 16); x.fillStyle = '#1a1a1a'; x.font = 'bold 12px sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('HOOTIE FRUTTI', 48, 9); }, 1518);
    const banner = new THREE.Mesh(new THREE.PlaneGeometry(3.6, 0.6), mat({ map: bannerT, unlit: 0.7 }));
    G.add(at(banner, DOOR[0], DOOR_H + 0.75, Z[1] + 0.06));
    const bannerIn = banner.clone(); bannerIn.position.set(0, 4.7, Z[0] + 0.1); bannerIn.scale.setScalar(1.6); G.add(bannerIn);   // the same banner over the podium, inside
    // fruit crates by the door, outside and in
    const crate = (x, z, ry, fruit, n = 5) => {
      const c = at(new THREE.Group(), x, 0, z); c.rotation.y = ry; G.add(c);
      c.add(at(box(0.6, 0.34, 0.42, WOOD), 0, 0.17, 0)); for (const y of [0.08, 0.26]) c.add(at(box(0.62, 0.04, 0.44, WOOD2), 0, y, 0));
      for (let i = 0; i < n; i++) { const f = fruitMesh(K, fruit); f.scale.setScalar(1.3); f.position.set(-0.2 + (i % 3) * 0.2, 0.36 + Math.floor(i / 3) * 0.06, -0.1 + Math.floor(i / 3) * 0.16); f.rotation.y = hash(i, x) * TAU; c.add(f); }
      return c;
    };
    crate(dR + 0.6, Z[1] + 0.6, 0.2, 'orange'); crate(dR + 0.7, Z[1] + 1.1, -0.3, 'apple'); crate(-6.8, 4.6, 0.1, 'lemon'); crate(-6.2, 4.9, 0.5, 'orange');
    crate(6.9, -4.6, 0.3, 'apple'); crate(6.9, -5.2, -0.1, 'orange'); crate(7.0, -0.9, 0.1, 'lemon');

    // ---------------- inside: chairs, jugs, fans, bunting ----------------
    const chair = (x, z, ry, col = WHITE, y = 0) => {   // a monobloc chair: seat at 0.4 m, facing +z at ry 0
      const c = at(new THREE.Group(), x, y, z); c.rotation.y = ry;
      c.add(at(box(0.44, 0.05, 0.42, col), 0, 0.4, 0)); c.add(at(box(0.44, 0.42, 0.05, col), 0, 0.62, -0.2));
      for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) { const l = at(box(0.05, 0.4, 0.05, col), sx * 0.19, 0.2, sz * 0.18); l.rotation.set(sz * 0.08, 0, -sx * 0.08); c.add(l); }
      return c;
    };
    for (let i = 0; i < 7; i++) if (Math.abs(-8.4 + i * 1.1 - WINDOW[1]) > 1.2) G.add(chair(X[0] + 0.5, -8.4 + i * 1.1, PI / 2));
    for (let i = 0; i < 5; i++) G.add(chair(-3.2 + i * 1.3, Z[0] + 0.5, 0));
    for (let i = 0; i < 4; i++) G.add(chair(X[1] - 0.5, 0.4 + i * 1.2, -PI / 2));
    const jugM = mat({ color: 0x7ac0f0, unlit: 0.25 });
    const jug = (x, z) => { const j = at(new THREE.Group(), x, 0, z); j.add(at(cyl(0.14, 0.14, 0.4, 8, jugM), 0, 0.2, 0)); j.add(at(cyl(0.05, 0.08, 0.08, 6, jugM), 0, 0.44, 0)); j.add(at(cyl(0.055, 0.055, 0.03, 6, M(0x3a6ab8)), 0, 0.49, 0)); G.add(j); };
    [[-7.4, 4.8], [-7.0, 5.2], [7.4, -8.8], [7.0, -9.2], [-7.4, -9.2], [6.8, 5.2]].forEach(([x, z]) => jug(x, z));
    const fans = [];
    for (const [x, z, ry] of [[-6.6, -1.2, 0.9], [6.6, -6.2, -0.8]]) {
      const f = at(new THREE.Group(), x, 0, z); f.rotation.y = ry; G.add(f);
      f.add(at(cyl(0.22, 0.26, 0.05, 8, M(0x2a2a30)), 0, 0.025, 0)); f.add(at(cyl(0.03, 0.03, 1.3, 5, M(0x2a2a30)), 0, 0.65, 0));
      const cage = at(new THREE.Group(), 0, 1.45, 0.05); f.add(cage);
      cage.add(new THREE.Mesh(new THREE.TorusGeometry(0.34, 0.02, 4, 12), M(0xc8ccd4)));
      const blades = new THREE.Group(); cage.add(blades);
      for (let b = 0; b < 3; b++) { const pv = new THREE.Group(); pv.rotation.z = b * TAU / 3; pv.add(at(box(0.12, 0.3, 0.02, M(0x5ac8ff)), 0, 0.16, 0)); blades.add(pv); }
      const hub = at(cyl(0.06, 0.06, 0.08, 6, M(0x2a2a30)), 0, 0, -0.05); hub.rotation.x = PI / 2; cage.add(hub);
      fans.push(blades);
    }
    // bunting in fruit colours under the trusses
    const flagCols = [0xffe45a, 0xff5a6a, 0xffa33a, 0x6ad86a, 0xb07af0];
    for (let r = 0; r < 3; r++) {
      const z0 = -8 + r * 4, nf = 18;
      for (let i = 0; i < nf; i++) { const x = X[0] + 0.6 + i * (W - 1.2) / (nf - 1), y = 4.4 - 0.5 * Math.sin(PI * i / (nf - 1)); const f = at(cone(0.16, 0.34, 3, M(flagCols[(i + r) % 5], { unlit: 0.3 })), x, y - 0.16, z0); f.rotation.set(PI, 0, 0); G.add(f); }
      G.add(at(box(W - 1.2, 0.015, 0.015, M(0x3a3a3a)), 0, 4.2, z0));
    }

    // ---------------- Kob's throne: red plastic chairs stacked five high (the top seat at THRONE_Y = 0.4 + 4 * 0.08) ----------------
    const [tx, tz] = THRONE;
    const throne = at(new THREE.Group(), tx, 0, tz); throne.rotation.y = THRONE_YAW; G.add(throne);
    for (let i = 0; i < 5; i++) throne.add(chair(0, 0, 0, RED, i * 0.08));
    const side = at(new THREE.Group(), tx + Math.sin(THRONE_YAW + 1.4) * 0.66, 0, tz + Math.cos(THRONE_YAW + 1.4) * 0.66); G.add(side);   // her side table: an upturned crate with a fruit bowl
    side.add(at(box(0.44, 0.4, 0.36, WOOD), 0, 0.2, 0)); side.add(at(cyl(0.18, 0.1, 0.08, 8, M(0xf0f0f0)), 0, 0.44, 0));
    ['banana', 'grapes', 'apple', 'orange'].forEach((f, i) => { const m = fruitMesh(K, f); m.scale.setScalar(1.1); m.position.set(-0.07 + (i % 2) * 0.14, 0.52, -0.05 + Math.floor(i / 2) * 0.1); side.add(m); });

    // ---------------- the podium: pallets stacked two high, a speaker stack each side ----------------
    const [px0, pz0] = PODIUM;
    const pal = (x, z, y) => { const p = at(new THREE.Group(), x, y, z); for (let i = 0; i < 5; i++) p.add(at(box(0.12, 0.03, 1.2, WOOD), -0.56 + i * 0.28, 0.135, 0)); for (const s of [-1, 0, 1]) p.add(at(box(1.3, 0.12, 0.12, WOOD2), 0, 0.06, s * 0.54)); G.add(p); };
    for (const [dx, dz] of [[-0.7, -0.45], [0.7, -0.45], [-0.7, 0.45], [0.7, 0.45]]) { pal(px0 + dx, pz0 + dz, 0); pal(px0 + dx, pz0 + dz, 0.15); }
    G.add(flat(PODIUM_W, PODIUM_D, M(0xc8a068), px0, PODIUM_Y - 0.004, pz0));
    for (const s of [-1, 1]) { const sp = at(new THREE.Group(), px0 + s * 2.55, 0, pz0 - 0.7); G.add(sp); sp.add(at(box(0.62, 1.0, 0.5, M(0x3a3a44)), 0, 0.5, 0)); sp.add(at(box(0.56, 0.8, 0.46, M(0x3a3a44)), 0, 1.4, 0)); for (const [y, r] of [[0.35, 0.18], [0.72, 0.11], [1.26, 0.18], [1.62, 0.09]]) sp.add(at(rot(cyl(r, r, 0.02, 10, M(0x8a8a96)), PI / 2, 0, 0), 0, y, 0.26)); }   // grey with light cones, off to the sides: black ones read as blank slabs beside the dancers

    // ---------------- the fruit bar: a table with a lime cloth down its front, piled with fruit ----------------
    const [bx, bz] = BAR;
    G.add(at(box(0.8, 0.05, BAR_LEN, WOOD), bx, BAR_Y - 0.025, bz));
    G.add(at(box(0.02, BAR_Y - 0.06, BAR_LEN, mat({ color: 0xb4d878, unlit: 0.05 })), bx - 0.41, (BAR_Y - 0.06) / 2 + 0.03, bz));   // a softer lime: the bright one read as a slab across the frame
    for (const s of [-1, 1]) G.add(at(box(0.8, BAR_Y - 0.05, 0.05, WOOD2), bx, (BAR_Y - 0.05) / 2, bz + s * (BAR_LEN / 2 - 0.1)));
    const barFruit = [];
    const heap = (cx, cz, kind, nh, rr) => { for (let i = 0; i < nh; i++) { const lvl = i < nh * 0.6 ? 0 : i < nh * 0.9 ? 1 : 2, a = hash(i, cz * 7) * TAU, d = rr * (1 - lvl * 0.35) * Math.sqrt(hash(i, cx * 3)); const f = fruitMesh(K, kind); f.scale.setScalar(0.95); f.position.set(cx + Math.cos(a) * d, BAR_Y + 0.07 + lvl * 0.08, cz + Math.sin(a) * d); f.rotation.set(0, a, hash(i, 9) * 0.6); G.add(f); barFruit.push(f); } };
    heap(bx, bz - 0.95, 'orange', 9, 0.24); heap(bx, bz - 0.3, 'banana', 5, 0.18); heap(bx, bz + 0.3, 'banana', 5, 0.18); heap(bx, bz + 0.95, 'apple', 8, 0.22);   // low bananas in front of her spot: a pyramid of apples there hid her face
    for (const [dz, f] of [[-1.2, 'melon'], [1.2, 'melon'], [-0.65, 'pineapple'], [0.65, 'pineapple'], [0, 'grapes']]) { const m = fruitMesh(K, f); m.scale.setScalar(f === 'melon' ? 0.85 : 1.0); m.position.set(bx + 0.2, BAR_Y + (f === 'melon' ? 0.18 : 0.12), bz + dz); G.add(m); barFruit.push(m); }
    barFruit.sort((a, b) => hash(a.position.x * 13, a.position.z * 7) - hash(b.position.x * 13, b.position.z * 7));

    // ---------------- the fruit pile (P.pile): a heap round a mark, filled from the middle out ----------------
    const pile = [];
    for (let i = 0; i < 60; i++) {
      const f = fruitMesh(K, SMALL_FRUIT[(i * 3) % SMALL_FRUIT.length]); f.scale.setScalar(1.35);
      const ring = Math.floor(Math.sqrt(i / 60) * 4), a = hash(i, 1519) * TAU, d = 0.25 + ring * 0.2 + hash(i, 1520) * 0.18;
      f.userData.off = [Math.cos(a) * d, 0.06 + Math.max(0, 0.35 - d * 0.35) * hash(i, 1521), Math.sin(a) * d, a];
      f.visible = false; G.add(f); pile.push(f);
    }

    // ---------------- the crowd: 32 pets, two layouts. The ring (the verse): two rows round RING_C, facing the dancers in
    // the middle, squashed front to back so the far side stops before the podium. The audience (P.audience, the podium
    // shots): four rows in front of the podium, facing it.
    const guests = [], [rcx, rcz] = HALL.RING_C;
    for (let i = 0; i < 32; i++) {
      const p = pet(i); G.add(p.g);
      const row = i % 2, a = (Math.floor(i / 2) / 16) * TAU + row * 0.2, r = 2.5 + row * 0.95 + hash(i, 1530) * 0.25;
      const ring = [rcx + Math.sin(a) * r * 1.1, rcz + Math.cos(a) * r * 0.78];
      const rowA = Math.floor(i / 8), col = i % 8;
      const aud = [-3.3 + col * 0.94 + (rowA % 2) * 0.47 + (hash(i, 1531) - 0.5) * 0.2, -3.25 + rowA * 0.95 + (hash(i, 1532) - 0.5) * 0.15];
      guests.push({ p, ring, aud, faceRing: Math.atan2(rcx - ring[0], rcz - ring[1]), faceAud: Math.atan2(STAGE[0] - aud[0], STAGE[1] - aud[1]) });
    }

    return {
      group: G, sky: null, shadowCol: 0x5a544a, indoor: true,
      light() {
        lights(0xc0b098, 0xfff0c8, [0.45, -0.75, 0.5], 0xf0e2c4, [20, 50], 9);
        pt(0, 0, 2.6, -2.0, 0.8, 0.66, 0.48);
        pt(1, -5.2, 2.2, -3.6, 0.55, 0.45, 0.32);
        pt(2, 4.4, 2.2, -2.6, 0.5, 0.45, 0.35);
        pt(3, DOOR[0], 2.6, Z[1] + 1.2, 0.9, 0.84, 0.66);
      },
      anim(t, P = {}) {
        if (P.key) pt(1, P.key[0], P.key[1], P.key[2], P.key[3], P.key[4], P.key[5]);
        const c = P.t0 != null ? t - P.t0 : 0, stopped = P.stop != null && c >= P.stop, tt = stopped ? P.t0 + P.stop : t, b = beat(tt);
        fans.forEach((f, i) => { f.rotation.z = tt * (7 + i); });
        const [pxm, pzm] = P.pileAt || STAGE, py = P.pileY ?? (P.pileAt ? 0 : PODIUM_Y);
        const nPile = Array.isArray(P.pile) ? P.pile[0] + Math.floor(Math.max(0, b - beat(P.t0 ?? t)) * P.pile[1]) : (P.pile || 0);
        pile.forEach((f, i) => { const show = i < nPile; f.visible = show; if (!show) return; const [ox, oy, oz, a] = f.userData.off; f.position.set(pxm + ox, py + oy, pzm + oz); f.rotation.set(a * 0.7, a, a * 0.3); });
        const full = P.bar ?? 1, [bgx, bgz] = HALL.BEHIND_BAR;
        barFruit.forEach((f, i) => { f.visible = i < full * barFruit.length && !(P.barGap && Math.abs(f.position.z - bgz) < 0.62 && f.position.x < bgx - 0.45); });   // barGap: the counter in front of her spot is clear (a heap there hid her paws)
        const flapK = P.flap && !stopped ? Math.pow(0.5 + 0.5 * Math.cos(TAU * b), 1.4) : 0;
        guests.forEach((q, i) => {
          const [x, z] = P.audience ? q.aud : q.ring, { p } = q, show = !P.noguests && !cleared(P, x, z); p.g.visible = show; if (!show) return;
          p.g.position.set(x, 0, z);
          const bb = b + i * 0.11, bounce = stopped ? 0 : Math.abs(Math.sin(bb * PI));
          p.g.rotation.y = P.stare ? Math.atan2(P.stare[0] - x, P.stare[1] - z) : P.audience ? q.faceAud : q.faceRing;
          p.body.position.y = 0.05 * bounce; p.body.rotation.z = stopped ? 0 : 0.08 * Math.sin(bb * PI);
          p.head.rotation.x = stopped ? 0 : 0.1 * bounce;
          p.arms.forEach((a, s) => {
            const sd = s ? 1 : -1;
            if (P.flap) a.rotation.set(0.45 * flapK, 0, sd * (2.9 - 0.5 * flapK));   // up by the ears, flapping out and forward on the beat: a swing down to 1.7 rad read as a T-pose
            else if (P.cheer) a.rotation.set(0, 0, sd * (2.7 + (stopped ? 0 : 0.2 * Math.sin(bb * TAU))));
            else a.rotation.set(stopped ? 0 : 0.3 * Math.sin(bb * PI + s * PI), 0, sd * 0.15);
          });
        });
      },
    };
  }
  return { hall: hall() };
}
