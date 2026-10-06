// maps32.js: the "Choosin' Texas" maps (2026-10-06 2nd, Ella Langley; the clip: a pickup with a horse trailer rolls
// past the WELCOME TO Abilene sign at golden hour, then a Texas dance hall at night: string lights, pool tables, a bar,
// a Texas-shaped neon, the singer with an acoustic guitar in a spotlight on the dance floor while couples two-step round
// her). Same contract as the other map files, pure in t:
//   honkytonk  the Abilene dance hall at night (TONK): a wooden hall (x -9..9, z -8..8, 6.2 m high), the dance floor in
//              the middle with the singer's spotlight (TONK.SPOT), the TEXAS neon (the state's outline, a white star, the
//              word) on the back wall, the bar along the left wall (its counter's front face at BAR.x1, top BAR.Y 0.82 m:
//              a chibi standing at it shows his eyes and ears over it) with Kob's duckboard behind it (TONK.KOB, DECK 0.3)
//              and the steak's board on the counter (TONK.BOARD), a barrel smoker, the longhorns over the shelves; the
//              mechanical bull on its mats (TONK.BULL, saddle top BULL_Y, its head to -x) and its control box with a big
//              red lever (TONK.CTRL; Compote stands behind it at TONK.OPER, facing -x); the double doors in the right wall
//              (TONK.DOORS) onto the night car park, where the pickup is parked; pool tables, a jukebox, wagon-wheel
//              chandeliers, the Lone Star flag, pet patrons in cowboy hats.
//   prairie    the road into Abilene at golden hour (PRAIRIE): the pickup and its horse trailer still at the origin, nose
//              to -x, the world streaming past along +x at PRAIRIE.SPEED (the road's dashes, fence posts, telegraph
//              poles, mesquite, a windmill, a pumpjack, longhorns); the green WELCOME TO ABILENE TEXAS sign on the
//              roadside passes the truck at `sign` s into the shot. The cab's bench seat (CAB.SEAT_Y) takes a driver on
//              its +z side and a passenger on its -z side; the trailer's side window on the -z side (TRAILER.WIN) shows
//              whoever stands at TRAILER.STAND inside.
// The Texas-shaped steak (`texasSteak`) is shared with ps1.js's props (the board in both paws, the steak in the jaws).
// Flags (honkytonk): patrons ('watch' | 'line' | 'twostep' | 'cheer' | 'clap'; not `crowd`: a shot's own crowd of copies), ring ([cx, cz, r, a0, a1] deg, 0 = +z:
// 22 pets on an arc facing its centre), stare ([x, z]: every pet turns there), stop (s: everyone freezes), steak (the
// steak on the counter's board; false: an empty board), bull ({ buck: 0-1, throw: s (the big buck) } or false), lever
// (0-1 or [s0, s1, a, b]: the control's lever pulled), doors (0-1 or [s0, s1, a, b]), hearts ([[x, y, z, s0]]: three
// pink hearts pop and rise), smoke (false: no smoke), spot (false: the spotlight off), clear ([[x, z, r]]: no pet
// there), noguests, key [x, y, z, r, g, b], gcase ([x, z, yaw]: the singer's open guitar case with its TENN plate),
// boardSlide ([s0, s1, dz]: the steak's board slides along the counter), steakTilt (rad about x: + tips its top to -x).
// Flags (prairie): speed (m/s, default PRAIRIE.SPEED), sign (s into the shot when the sign passes the truck; omitted:
// no sign), hearts, heartYaw (deg: the hearts turned to a lens that isn't on +z), still (the world stops: parked), key.
import { mapKit } from './mapkit.js';

export const TONK = {
  SPOT: [0, -1.4],                                       // the singer's spotlight on the dance floor
  BAR: { x0: -7.2, x1: -6.4, z0: -6.2, z1: 2.2, Y: 0.82 },  // the counter: back face x0, front face x1, top Y
  KOB: [-7.75, -1.2], DECK: 0.3,                         // Kob behind the counter on her duckboard (stand her at lift DECK)
  BOARD: [-6.72, -1.2],                                  // the steak's board on the counter (its top at BAR.Y + 0.03)
  SMOKER: [-7.9, 3.6],
  BULL: [5.2, -1.8], BULL_Y: 0.86, BULL_YAW: -90,        // the mechanical bull's saddle top; its head to -x
  RING_R: 2.4,
  CTRL: [7.35, 1.3], LEVER_Y: 0.62, OPER: [7.95, 1.3],   // the control box (its lever's pivot on top), Compote behind it
  DOORS: [9.0, 4.6], DOOR_W: 2.2,
  LINE: { x0: -3.6, cols: 7, dx: 1.2, z0: -4.0, rows: 3, dz: -1.1 },   // the line dancers' block, facing +z
  NEON: [0, 2.55, -7.93],
};
export const PRAIRIE = {
  SPEED: 9,
  ROAD: [-1.8, 5.4], LINE_Z: 1.8,                        // the asphalt's z extent, its centre line; the truck's lane at z 0
  CAB: { SEAT_Y: 1.02, DRIVER: [-0.35, 0.44], PASSENGER: [-0.35, -0.44], WHEEL: [-0.8, 1.42, 0.44] },   // the wheel under his chin (at 1.6 its ring sat on his muzzle)
  TRAILER: { x0: 3.0, x1: 7.0, FLOOR: 0.45, WIN: [3.6, 4.6, 1.0, 1.9], STAND: [4.1, -0.55] },
  SIGN_Z: -3.4,
};

// the state's outline (lon, lat), simplified: the panhandle, the Red River, the Sabine, the Gulf coast, the Rio Grande
const TX_LL = [[-103.04, 36.5], [-100.0, 36.5], [-100.0, 34.56], [-99.2, 34.4], [-98.4, 34.1], [-97.6, 33.85], [-96.8, 33.85], [-96.0, 33.8],
  [-95.2, 33.9], [-94.48, 33.64], [-94.04, 33.55], [-94.04, 31.99], [-93.84, 31.5], [-93.7, 31.0], [-93.55, 30.5], [-93.7, 30.05], [-93.84, 29.72],
  [-94.7, 29.4], [-95.3, 28.9], [-96.0, 28.55], [-96.6, 28.2], [-97.1, 27.8], [-97.35, 27.3], [-97.4, 26.6], [-97.15, 25.95], [-97.7, 26.0],
  [-98.3, 26.2], [-99.0, 26.45], [-99.3, 26.9], [-99.5, 27.5], [-100.0, 28.1], [-100.4, 28.7], [-100.85, 29.4], [-101.4, 29.75], [-102.1, 29.8],
  [-102.4, 29.75], [-102.7, 29.4], [-103.0, 29.0], [-103.4, 29.05], [-103.8, 29.3], [-104.3, 29.6], [-104.6, 30.0], [-104.9, 30.6], [-105.4, 31.0],
  [-106.0, 31.4], [-106.5, 31.75], [-106.62, 32.0], [-103.06, 32.0]];
export const TEXAS = TX_LL.map(([lo, la]) => [(lo + 99.9) * 0.855 / 11.24, (la - 31.2) / 11.24]);   // ~1 wide, ~0.95 tall, centred

// the Texas-shaped steak: the state extruded, seared brown with grill marks on its faces, a creamy rim of fat; `w`
// metres across, lying flat (its faces up and down), the panhandle towards -z
export function texasSteak(K, w = 0.42) {
  const { THREE, mat, tex, px } = K;
  const sh = new THREE.Shape(); TEXAS.forEach(([x, y], i) => (i ? sh.lineTo(x, y) : sh.moveTo(x, y))); sh.closePath();
  const geo = new THREE.ExtrudeGeometry(sh, { depth: 0.07, bevelEnabled: false, curveSegments: 1 });
  const sear = tex(32, 32, (x, r) => {
    px(x, '#8c4a26', 0, 0, 32, 32);
    for (let i = 0; i < 160; i++) { const c = ['#9a5630', '#7a3c1e', '#a8603a'][Math.floor(r() * 3)]; px(x, c, Math.floor(r() * 32), Math.floor(r() * 32), 1, 1); }
    for (let k = -32; k < 64; k += 7) for (let j = 0; j < 32; j++) { const xx = k + j; if (xx >= 0 && xx < 32) px(x, '#3a1808', xx, j, 2, 1); }   // the grill's diagonal marks
  }, 3201);
  const faceM = mat({ map: sear, rep: [3.2, 3.2], unlit: 0.35 }), fatM = mat({ color: 0xf0dcb0, unlit: 0.4 });
  const m = new THREE.Mesh(geo, [faceM, fatM]);
  m.rotation.x = -Math.PI / 2; m.scale.set(w, w, w * 0.9);
  const g = new THREE.Group(); g.add(m); return g;
}

export function buildTonkMaps(K) {
  const k = mapKit(K);
  const { THREE, mat, tex, px, noise, box, TAU, PI, beat, cyl, cone, ico, at, rot, flat, lights, pt, hash, merged, fr } = k;
  const M = (c, o = {}) => mat({ color: c, ...o }), glow = (c, u = 1) => mat({ color: c, unlit: u });
  const shotT = (t, P) => P.t0 != null ? t - P.t0 : 0;
  const cl = x => Math.max(0, Math.min(1, x)), sm = x => { x = cl(x); return x * x * (3 - 2 * x); };
  const cleared = (P, x, z) => (P.clear || []).some(([cx, cz, r]) => (x - cx) ** 2 + (z - cz) ** 2 < r * r);
  const pmod = (a, n) => ((a % n) + n) % n;
  const ramp = (v, s) => Array.isArray(v) ? v[2] + (v[3] - v[2]) * sm((s - v[0]) / Math.max(0.01, v[1] - v[0])) : (v || 0);

  // ---------- hearts: two balls and a cone tip, popping three at a time from a point and rising ----------
  function heartSet(G) {
    const heartM = M(0xff4f9a, { unlit: 0.8 }), hearts = [];
    for (let i = 0; i < 15; i++) { const h = new THREE.Group(); h.add(at(ico(0.1, 0, heartM), -0.075, 0, 0)); h.add(at(ico(0.1, 0, heartM), 0.075, 0, 0)); h.add(rot(at(cone(0.125, 0.18, 4, heartM), 0, -0.11, 0), PI, 0, 0)); h.visible = false; G.add(h); hearts.push(h); }
    return (P, s) => hearts.forEach((h, i) => {
      const q = (P.hearts || [])[Math.floor(i / 3)]; h.visible = false; if (!q) return;
      const e = s - q[3] - (i % 3) * 0.18; if (e < 0 || e > 1.6) return;
      h.visible = true; h.position.set(q[0] + ((i % 3) - 1) * 0.22 + 0.06 * Math.sin(e * 6 + i), q[1] + 0.5 * e, q[2]); h.scale.setScalar(Math.min(1, e * 5) * (1.15 - 0.25 * (e / 1.6)));
      h.rotation.y = (P.heartYaw || 0) * PI / 180;   // the hearts face +z: a lens looking along x needs them turned (heartYaw -90 for a lens at -x)
    });
  }

  // ---------- the pickup and its horse trailer (nose to -x), shared by the prairie and the dance hall's car park ----------
  const white = M(0xf2efe6, { unlit: 0.12 }), chrome = M(0xcfd4da, { unlit: 0.3 }), tyre = M(0x1c1c20), dark = M(0x2a2c32), seatM = M(0x8a5a3a, { unlit: 0.1 });
  const plateT = tex(32, 16, x => { px(x, '#f4f2ea', 0, 0, 32, 16); px(x, '#2a6a3a', 0, 0, 32, 3); x.fillStyle = '#1a1a1a'; x.font = 'bold 9px monospace'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('TENN', 16, 10); }, 3202);
  function wheel(g, x, z, r = 0.4) {
    const w = rot(at(cyl(r, r, 0.26, 10, tyre), x, r, z), PI / 2, 0, 0); g.add(w);
    const hub = rot(at(cyl(r * 0.5, r * 0.5, 0.27, 8, chrome), x, r, z), PI / 2, 0, 0); g.add(hub); return [w, hub];
  }
  function truckModel({ trailer = true } = {}) {
    const g = new THREE.Group(), spin = [];
    // the pickup: a white 80s truck, the cab between the hood and the bed; windows are open frames (no glass: the faces show)
    g.add(at(box(5.0, 0.5, 1.9, white), -0.1, 0.7, 0));                                   // the lower body
    g.add(at(box(1.6, 0.36, 1.86, white), -1.8, 1.13, 0));                               // the hood
    g.add(at(box(0.08, 0.3, 1.5, chrome), -2.62, 0.82, 0));                               // the grille
    for (const s of [-1, 1]) g.add(at(box(0.06, 0.16, 0.32, glow(0xfff6d0, 0.8)), -2.63, 0.88, s * 0.68));   // headlights
    g.add(at(box(0.16, 0.12, 2.0, chrome), -2.65, 0.52, 0));                              // the bumper
    // the cab: the roof on four thin pillars, the door panels below the window line, the dash, the bench, the wheel
    const cab = new THREE.Group(); g.add(cab);
    cab.add(at(box(1.6, 0.06, 1.86, white), -0.2, 2.3, 0));                               // the roof
    for (const [x, z] of [[-0.98, -0.9], [-0.98, 0.9], [0.56, -0.9], [0.56, 0.9]]) cab.add(at(box(0.08, 0.86, 0.08, white), x, 1.88, z));
    for (const s of [-1, 1]) cab.add(at(box(1.56, 0.5, 0.06, white), -0.2, 1.2, s * 0.92));   // door panels to the window line (1.45)
    cab.add(at(box(0.06, 0.5, 1.8, white), 0.58, 1.2, 0));                               // the back wall below the rear window
    cab.add(at(box(0.3, 0.22, 1.7, dark), -0.85, 1.32, 0));                              // the dashboard
    cab.add(at(box(0.5, 0.12, 1.66, seatM), -0.15, PRAIRIE.CAB.SEAT_Y - 0.06, 0));      // the bench seat
    cab.add(rot(at(box(0.12, 0.62, 1.66, seatM), 0.18, PRAIRIE.CAB.SEAT_Y + 0.26, 0), 0, 0, 0.12));   // its back
    cab.add(rot(at(new THREE.Mesh(new THREE.TorusGeometry(0.16, 0.025, 4, 12), dark), ...PRAIRIE.CAB.WHEEL), 0, PI / 2, 0.5));
    // the bed behind the cab
    for (const s of [-1, 1]) g.add(at(box(1.8, 0.4, 0.06, white), 1.5, 1.15, s * 0.92));
    g.add(at(box(0.06, 0.4, 1.86, white), 2.4, 1.15, 0));
    spin.push(...wheel(g, -1.7, 0.86), ...wheel(g, -1.7, -0.86), ...wheel(g, 1.55, 0.86), ...wheel(g, 1.55, -0.86));
    if (trailer) {
      const tr = new THREE.Group(); g.add(tr);
      const { x0, x1, FLOOR, WIN } = PRAIRIE.TRAILER, len = x1 - x0, cx = (x0 + x1) / 2;
      tr.add(at(box(0.7, 0.08, 0.08, dark), x0 - 0.3, 0.55, 0));                       // the hitch
      tr.add(at(box(len, 0.12, 1.9, white), cx, FLOOR - 0.06, 0));                       // the floor
      tr.add(at(box(len, 0.06, 1.9, white), cx, 2.3, 0));                                // the roof
      const stripe = M(0x8a2a32, { unlit: 0.15 });
      for (const s of [-1, 1]) {                                                         // the side walls, a window on each near the front
        const z = s * 0.95;
        tr.add(at(box(len, WIN[2] - FLOOR, 0.06, white), cx, (FLOOR + WIN[2]) / 2, z));  // below the window
        tr.add(at(box(len, 2.3 - WIN[3], 0.06, white), cx, (WIN[3] + 2.3) / 2, z));       // above it
        tr.add(at(box(WIN[0] - x0, WIN[3] - WIN[2], 0.06, white), (x0 + WIN[0]) / 2, (WIN[2] + WIN[3]) / 2, z));   // before it
        tr.add(at(box(x1 - WIN[1], WIN[3] - WIN[2], 0.06, white), (WIN[1] + x1) / 2, (WIN[2] + WIN[3]) / 2, z));   // after it
        tr.add(at(box(len, 0.12, 0.07, stripe), cx, 0.9, z));
        for (const bx of [WIN[0] + 0.1, WIN[1] - 0.1]) tr.add(at(box(0.04, WIN[3] - WIN[2], 0.04, dark), bx, (WIN[2] + WIN[3]) / 2, z));   // two bars
      }
      tr.add(at(box(0.06, 2.3 - FLOOR, 1.9, white), x1, (FLOOR + 2.3) / 2, 0));        // the back doors
      tr.add(at(box(0.07, 0.12, 1.92, stripe), x1, 0.9, 0));
      const plate = at(new THREE.Mesh(new THREE.PlaneGeometry(0.4, 0.2), mat({ map: plateT, unlit: 0.5 })), x1 + 0.04, 0.62, 0); plate.rotation.y = PI / 2; tr.add(plate);
      tr.add(at(box(0.06, 2.3 - FLOOR, 1.9, white), x0, (FLOOR + 2.3) / 2, 0));        // the front wall
      tr.add(rot(at(cyl(0.55, 0.55, 1.85, 10, white), x0 - 0.05, 1.5, 0), PI / 2, 0, 0));   // a rounded nose (at r 0.95 it reached into the side window)
      spin.push(...wheel(tr, cx + 0.2, 0.86, 0.36), ...wheel(tr, cx + 0.2, -0.86, 0.36), ...wheel(tr, cx + 0.9, 0.86, 0.36), ...wheel(tr, cx + 0.9, -0.86, 0.36));
    }
    return { g, spin };
  }

  // ---------- box pets in cowboy hats (light furs, check shirts, jeans) ----------
  const FURS = [0xd8a868, 0xe8d8c0, 0xb08a60, 0xf2eee6, 0xc8c0d0, 0xe0c8a0, 0xf0dcc0, 0xd0b090];
  const SHIRTS = [0xd84a3a, 0x3a7ad8, 0xe8b83a, 0x5aa84a, 0xb85ab8, 0xe87a3a, 0x3ab8b0, 0xf0f0f0];
  const HATS = [0x8a5a32, 0xe8dcc0, 0x2a2420, 0xb88a50, 0xf4f0e8];
  function pet(i) {
    const g = new THREE.Group(), F = M(FURS[i % FURS.length]), top = M(SHIRTS[(i * 3) % SHIRTS.length], { unlit: 0.15 }), body = new THREE.Group(); g.add(body);
    body.add(at(box(0.42, 0.44, 0.3, top), 0, 0.33, 0));
    body.add(at(box(0.44, 0.06, 0.32, M(0x3a2a1c)), 0, 0.13, 0)); body.add(at(box(0.09, 0.07, 0.02, M(0xd8c060, { unlit: 0.4 })), 0, 0.13, 0.165));   // a belt and its buckle
    const legs = [-1, 1].map(s => { const l = at(new THREE.Group(), s * 0.1, 0.1, 0.02); l.add(at(box(0.12, 0.2, 0.13, M(0x3a5a8a)), 0, -0.05, 0)); l.add(at(box(0.13, 0.08, 0.18, M(0x6a3a1c)), 0, -0.14, 0.02)); body.add(l); return l; });
    const arms = [-1, 1].map(s => { const a = at(new THREE.Group(), s * 0.24, 0.52, 0); a.add(at(box(0.1, 0.3, 0.1, top), 0, -0.13, 0)); a.add(at(box(0.09, 0.09, 0.09, F), 0, -0.3, 0)); body.add(a); return a; });
    const head = at(new THREE.Group(), 0, 0.8, 0); body.add(head);
    const skull = ico(0.24, 1, F); skull.scale.set(1, 0.9, 0.92); head.add(skull);
    const snout = at(ico(0.1, 1, M(0xf6ece0)), 0, -0.07, 0.19); snout.scale.set(1.1, 0.8, 0.9); head.add(snout);
    head.add(at(ico(0.035, 0, M(0x151515)), 0, -0.03, 0.28));
    for (const e of [-1, 1]) { head.add(at(ico(0.038, 0, M(0x0e0e0e)), e * 0.1, 0.05, 0.19)); head.add(at(ico(0.012, 0, glow(0xffffff)), e * 0.1 + 0.012, 0.065, 0.225)); head.add(rot(at(box(0.07, 0.24, 0.16, F), e * 0.24, 0.02, 0), 0, 0, e * 0.3)); }
    const hatM = M(HATS[i % HATS.length], { unlit: 0.12 });                               // the cowboy hat: a brim curled up at the sides, a creased crown
    const hat = at(new THREE.Group(), 0, 0.2, 0); head.add(hat);
    hat.add(at(cyl(0.34, 0.34, 0.03, 10, hatM), 0, 0, 0));
    for (const s of [-1, 1]) hat.add(rot(at(box(0.12, 0.03, 0.4, hatM), s * 0.3, 0.05, 0), 0, 0, -s * 0.6));
    hat.add(at(cyl(0.17, 0.2, 0.2, 8, hatM), 0, 0.11, 0)); hat.add(at(cyl(0.205, 0.205, 0.04, 8, M(0x2a1c14)), 0, 0.03, 0));
    return { g, body, head, arms, legs, i };
  }
  // modes: watch (sway), line (the line dance: three steps right, a kick, three left, a kick; thumbs in the belt),
  // twostep (in pairs, arms forward), cheer (arms up in a V), clap (paws meeting on the beat)
  function animPet(p, mode, bb, faceYaw) {
    const ph = (bb + p.i * 0.13) * PI, b = Math.abs(Math.sin(ph));
    p.g.rotation.y = faceYaw;
    p.body.position.set(0, 0, 0); p.body.rotation.set(0, 0, 0); p.head.rotation.set(0, 0, 0);
    p.legs.forEach(l => { l.rotation.set(0, 0, 0); });
    if (mode === 'line') {
      const u = pmod(bb, 8), kick = (u >= 3 && u < 4) || u >= 7, kp = Math.sin(fr(u) * PI);
      p.body.position.y = 0.035 * Math.abs(Math.sin(bb * PI));
      p.body.rotation.z = 0.06 * Math.sin(bb * PI);
      p.arms.forEach((a, k2) => a.rotation.set(0.15, 0, (k2 ? 1 : -1) * 0.5));      // thumbs in the belt loops
      if (kick) p.legs[u >= 7 ? 0 : 1].rotation.x = -0.9 * kp;
      return;
    }
    if (mode === 'twostep') {
      p.body.position.y = 0.03 * b; p.body.rotation.z = 0.08 * Math.sin(ph);
      p.arms.forEach((a, k2) => a.rotation.set(-1.1, 0, (k2 ? 1 : -1) * 0.2));
      p.legs.forEach((l, k2) => { l.rotation.x = 0.35 * Math.sin((bb + k2) * PI); });
      return;
    }
    if (mode === 'cheer') { p.body.position.y = 0.06 * b; p.arms.forEach((a, k2) => a.rotation.set(0.35, 0, (k2 ? 1 : -1) * (2.45 + 0.25 * b))); return; }
    if (mode === 'clap') { p.body.position.y = 0.02 * b; const c = Math.exp(-fr(bb) * 6); p.arms.forEach((a, k2) => a.rotation.set(-1.2, 0, (k2 ? -1 : 1) * (0.35 - 0.35 * c))); return; }
    p.body.rotation.z = 0.07 * Math.sin(ph * 0.5);                                         // watch: a gentle sway
    p.arms.forEach((a, k2) => a.rotation.set(0.05, 0, (k2 ? 1 : -1) * 0.12));
  }

  // the TEXAS neon: the state's outline in orange-red tubes, a white lone star, the word in blue
  function texasNeon(G, cx, cy, z, w) {
    const tubes = [], P2 = TEXAS.map(([x, y]) => [cx + x * w, cy + y * w]);
    for (let i = 0; i < P2.length; i++) {
      const a = P2[i], b = P2[(i + 1) % P2.length], len = Math.hypot(b[0] - a[0], b[1] - a[1]);
      const m = new THREE.Mesh(new THREE.BoxGeometry(len + 0.04, 0.045, 0.045)); m.position.set((a[0] + b[0]) / 2, (a[1] + b[1]) / 2, z); m.rotation.z = Math.atan2(b[1] - a[1], b[0] - a[0]); tubes.push(m);
    }
    const outline = merged(tubes, glow(0xff5a2a)); G.add(outline);
    const st = new THREE.Shape(); for (let i = 0; i < 10; i++) { const a = PI / 2 + i * PI / 5, r = i % 2 ? 0.42 : 1; if (i) st.lineTo(Math.cos(a) * r, Math.sin(a) * r); else st.moveTo(Math.cos(a) * r, Math.sin(a) * r); } st.closePath();
    const star = new THREE.Mesh(new THREE.ShapeGeometry(st), glow(0xfff4e0)); star.scale.setScalar(w * 0.11); star.position.set(cx + w * 0.05, cy + w * 0.18, z + 0.02); G.add(star);
    const wordT = tex(64, 16, x => { px(x, '#10141c', 0, 0, 64, 16); x.fillStyle = '#5ad0ff'; x.font = 'bold 13px monospace'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('TEXAS', 32, 9); }, 3203);
    const word = new THREE.Mesh(new THREE.PlaneGeometry(w * 0.78, w * 0.2), mat({ map: wordT, unlit: 1 })); word.position.set(cx - w * 0.02, cy - w * 0.12, z + 0.03); G.add(word);
    return { outline, star, word };
  }

  // =====================================================================================================================
  function honkytonk() {
    const G = new THREE.Group(), hearts = heartSet(G);
    const { SPOT, BAR, DECK, BOARD, SMOKER, BULL, BULL_Y, BULL_YAW, RING_R, CTRL, LEVER_Y, DOORS, DOOR_W, LINE, NEON } = TONK;
    // the floor: worn planks all over, the dance floor's polished square in the middle
    const plankT = tex(16, 16, (x, r) => { px(x, '#5e4030', 0, 0, 16, 16); noise(x, r, 16, 16, ['#5a3e2e', '#644434', '#563a2a'], 50); for (let j = 0; j < 16; j += 8) px(x, '#523828', 0, j, 16, 1); }, 3210);   // low-contrast seams 0.9 m apart: fine lines zigzag under the affine warp
    G.add(flat(18, 16, mat({ map: plankT, rep: [10, 9] }), 0, 0, 0));
    const danceT = tex(16, 16, (x, r) => { px(x, '#8c6a4a', 0, 0, 16, 16); noise(x, r, 16, 16, ['#866446', '#927050', '#80603f'], 50); for (let j = 0; j < 16; j += 8) px(x, '#7c5c40', 0, j, 16, 1); }, 3211);   // honey wood, not orange
    G.add(flat(11, 10.5, mat({ map: danceT, rep: [7, 7] }), 0, 0.006, -1.25));
    // the singer's spotlight: a pale disc on the floor
    const spotDisc = new THREE.Mesh(new THREE.CircleGeometry(1.15, 18), mat({ color: 0xfff0c8, unlit: 1, see: 0.35 })); spotDisc.rotation.x = -PI / 2; spotDisc.position.set(SPOT[0], 0.02, SPOT[1]);   // clear of the dance floor's flat (at 8 mm it lost wedges to it) G.add(spotDisc);
    // the walls: dark planks over a wainscot, a timber ceiling with beams
    const wallT = tex(16, 16, (x, r) => { px(x, '#4a3020', 0, 0, 16, 16); noise(x, r, 16, 16, ['#46301e', '#523624', '#3e2a1a'], 70); for (let i = 0; i < 16; i += 4) px(x, '#36241a', i, 0, 1, 16); }, 3212);
    k.room(G, 18, 16, 6.2, wallT, 1.4, 0x2a1c14, { skip: ['right'] });
    { const wm = (w, h) => new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat({ map: wallT, rep: [w / 1.4, h / 1.4] }));   // the right wall in three pieces round the doors
      const za = DOORS[1] - DOOR_W / 2, zb = DOORS[1] + DOOR_W / 2;
      G.add(rot(at(wm(za + 8, 6.2), 9, 3.1, (za - 8) / 2), 0, -PI / 2, 0)); G.add(rot(at(wm(8 - zb, 6.2), 9, 3.1, (zb + 8) / 2), 0, -PI / 2, 0));
      G.add(rot(at(wm(DOOR_W, 3.8), 9, 4.3, DOORS[1]), 0, -PI / 2, 0)); }
    const wain = M(0x34221a);
    G.add(at(box(18, 1.1, 0.06, wain), 0, 0.55, -7.96)); G.add(at(box(0.06, 1.1, 16, wain), -8.96, 0.55, 0));
    G.add(at(box(0.06, 1.1, 10.4, wain), 8.96, 0.55, -2.8)); G.add(at(box(0.06, 1.1, 2.2, wain), 8.96, 0.55, 6.9));   // the right wall's wainscot, round the doors
    for (let x = -7.5; x <= 7.6; x += 2.5) G.add(at(box(0.25, 0.3, 16, M(0x3a2618)), x, 5.95, 0));
    // the TEXAS neon on the back wall, a neon boot and a neon cactus either side of it
    const neon = texasNeon(G, NEON[0], NEON[1], NEON[2], 1.25);
    const bootT = tex(16, 16, x => { px(x, '#10141c', 0, 0, 16, 16); px(x, '#ff7ab8', 6, 2, 4, 9); px(x, '#ff7ab8', 6, 10, 8, 3); px(x, '#ff7ab8', 3, 13, 11, 1); }, 3213);
    const cactT = tex(16, 16, x => { px(x, '#10141c', 0, 0, 16, 16); px(x, '#6aff7a', 7, 2, 2, 12); px(x, '#6aff7a', 3, 5, 1, 4); px(x, '#6aff7a', 3, 8, 4, 1); px(x, '#6aff7a', 12, 4, 1, 4); px(x, '#6aff7a', 9, 7, 4, 1); px(x, '#6aff7a', 4, 14, 8, 1); }, 3214);
    G.add(at(new THREE.Mesh(new THREE.PlaneGeometry(0.9, 0.9), mat({ map: bootT, unlit: 1 })), -4.8, 2.6, -7.94));
    G.add(at(new THREE.Mesh(new THREE.PlaneGeometry(0.9, 0.9), mat({ map: cactT, unlit: 1 })), 4.8, 2.6, -7.94));
    // a small band riser at the back with an amp and a drum kit nobody plays (the singer plays on the floor, the clip's way)
    G.add(at(box(4.0, 0.3, 1.4, M(0x3a2a1e)), 0, 0.15, -7.2));
    G.add(at(box(0.6, 0.7, 0.4, M(0x1c1c22)), -1.4, 0.65, -7.25)); G.add(at(box(0.5, 0.06, 0.02, glow(0xffa04a, 0.6)), -1.4, 0.92, -7.04));
    { const dk = new THREE.Group(); dk.position.set(1.2, 0.3, -7.3); G.add(dk); dk.add(rot(at(cyl(0.28, 0.28, 0.25, 10, M(0xe8e4dc)), 0, 0.3, 0), PI / 2, 0, 0)); dk.add(at(cyl(0.16, 0.16, 0.18, 8, M(0xc02a2a)), 0.45, 0.55, 0.1)); dk.add(at(cyl(0.22, 0.22, 0.02, 10, M(0xd8c060, { unlit: 0.3 })), -0.4, 1.0, 0)); dk.add(at(cyl(0.01, 0.01, 0.9, 4, M(0x9a9aa4)), -0.4, 0.55, 0)); }
    // the bar: the counter along the left wall, stools, the shelves of jars and sauces, the longhorns, a BBQ neon
    const barM = M(0x5a3620, { unlit: 0.08 }), topM = M(0x7a4a2a, { unlit: 0.1 });
    const blen = BAR.z1 - BAR.z0, bcz = (BAR.z0 + BAR.z1) / 2;
    G.add(at(box(BAR.x1 - BAR.x0, BAR.Y - 0.05, blen, barM), (BAR.x0 + BAR.x1) / 2, (BAR.Y - 0.05) / 2, bcz));
    G.add(at(box(BAR.x1 - BAR.x0 + 0.12, 0.05, blen + 0.12, topM), (BAR.x0 + BAR.x1) / 2 + 0.06, BAR.Y - 0.025, bcz));
    G.add(at(box(0.06, 0.08, blen, M(0xc8a060, { unlit: 0.3 })), BAR.x1 + 0.03, 0.18, bcz));   // the brass foot rail
    G.add(at(box(8.9 + BAR.x0, DECK, blen, M(0x4a3020)), (BAR.x0 - 8.9) / 2, DECK / 2, bcz));   // Kob's duckboard behind it (x -8.9 .. BAR.x0)
    for (const z of [-5.0, -3.7, 1.2]) { const st = new THREE.Group(); st.position.set(BAR.x1 + 0.45, 0, z); G.add(st); st.add(at(cyl(0.2, 0.2, 0.08, 8, M(0xc02a2a, { unlit: 0.15 })), 0, 0.62, 0)); st.add(at(cyl(0.03, 0.03, 0.6, 4, chrome), 0, 0.3, 0)); st.add(at(cyl(0.16, 0.16, 0.02, 8, chrome), 0, 0.02, 0)); }
    const shelfM = M(0x6a4428);
    for (const y of [1.35, 1.85, 2.35]) G.add(at(box(0.35, 0.04, 7.6, shelfM), -8.78, y, bcz));
    const jars = [], jarCols = [0x8ac850, 0xc8302a, 0xe8a030, 0x7a3a1c, 0xf0e0a0];
    for (let i = 0; i < 42; i++) { const y = [1.35, 1.85, 2.35][i % 3], z = BAR.z0 + 0.3 + Math.floor(i / 3) * 0.55 + hash(i, 3220) * 0.1; const j = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.22 + hash(i, 3221) * 0.1, 6)); j.position.set(-8.75, y + 0.13, z); j.userData.c = jarCols[i % jarCols.length]; jars.push(j); }
    jarCols.forEach(c => { const sub = jars.filter(j => j.userData.c === c); if (sub.length) G.add(merged(sub, M(c, { unlit: 0.3 }))); });
    { const lh = new THREE.Group(); lh.position.set(-8.85, 3.2, bcz); G.add(lh); lh.add(at(box(0.12, 0.3, 0.5, M(0x6a4428)), 0, 0, 0)); for (const s of [-1, 1]) lh.add(rot(at(cone(0.07, 1.3, 6, M(0xf0e6cc, { unlit: 0.2 })), 0.05, 0.12, s * 0.85), -s * 1.25, 0, 0)); }
    const bbqT = tex(32, 16, x => { px(x, '#10141c', 0, 0, 32, 16); x.fillStyle = '#ff9a3a'; x.font = 'bold 12px monospace'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('BBQ', 16, 9); }, 3215);
    { const s = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 0.6), mat({ map: bbqT, unlit: 1 })); s.position.set(-8.9, 4.0, bcz); s.rotation.y = PI / 2; G.add(s); }
    // the steak's board on the counter, the steak on it (the `steak` flag), a pot of sauce beside it
    const board = new THREE.Group(); board.position.set(BOARD[0], BAR.Y, BOARD[1]); G.add(board);
    board.add(at(box(0.62, 0.03, 0.52, M(0xc89a60, { unlit: 0.15 })), 0, 0.015, 0));
    const steakOn = texasSteak(K, 0.46); steakOn.position.set(0, 0.03, 0); steakOn.rotation.y = PI / 2; board.add(steakOn);   // the panhandle towards the hall
    board.add(at(cyl(0.06, 0.06, 0.1, 8, M(0x8a2018, { unlit: 0.3 })), -0.2, 0.08, 0.34));
    // the singer's guitar case lying open on the dance floor, a Tennessee plate on its lid (the `gcase` flag: [x, z, yaw deg])
    const gcase = new THREE.Group(); G.add(gcase);
    { const cm = M(0x3a2418, { unlit: 0.1 }); gcase.add(at(box(0.42, 0.1, 1.05, cm), 0, 0.05, 0)); gcase.add(at(box(0.36, 0.02, 0.98, M(0xb02a3a, { unlit: 0.2 })), 0, 0.1, 0));   // the shell, its red plush
      const lid = at(new THREE.Group(), 0, 0.1, -0.52); gcase.add(lid); lid.rotation.x = -1.2; lid.add(at(box(0.42, 0.04, 1.05, cm), 0, 0.0, 0.52));
      const pl = at(new THREE.Mesh(new THREE.PlaneGeometry(0.34, 0.17), mat({ map: plateT, unlit: 0.6 })), 0, 0.025, 0.42); pl.rotation.x = -PI / 2; lid.add(pl); }
    // the smoker past the counter's end: a black barrel on legs, a chimney, smoke
    { const sm2 = new THREE.Group(); sm2.position.set(SMOKER[0], 0, SMOKER[1]); G.add(sm2); sm2.add(rot(at(cyl(0.45, 0.45, 1.3, 10, M(0x1c1c20)), 0, 0.95, 0), 0, 0, PI / 2)); for (const x of [-0.5, 0.5]) for (const z of [-0.3, 0.3]) sm2.add(at(box(0.05, 0.5, 0.05, dark), x, 0.25, z)); sm2.add(at(cyl(0.08, 0.08, 1.2, 6, M(0x1c1c20)), 0.55, 1.8, 0)); sm2.add(at(box(0.5, 0.06, 0.06, glow(0xff6a2a, 0.7)), 0, 0.62, 0.43)); }
    const puffs = []; for (let i = 0; i < 10; i++) { const p = ico(0.18, 0, M(0xb8b4ac, { unlit: 0.4, see: 0.35 })); G.add(p); puffs.push(p); }
    // the mechanical bull on its mats: the bull on a turning pedestal, horns, a rope handle; the control box with its lever
    const matT = tex(16, 16, x => { for (let i = 0; i < 16; i++) for (let j = 0; j < 16; j++) px(x, ((i >> 2) + (j >> 2)) % 2 ? '#c02a2a' : '#e8e0d0', i, j, 1, 1); }, 3216);
    { const mt = new THREE.Mesh(new THREE.CircleGeometry(RING_R, 20), mat({ map: matT, rep: [2.5, 2.5] })); mt.rotation.x = -PI / 2; mt.position.set(BULL[0], 0.02, BULL[1]); G.add(mt); }   // 2 cm up: at 6 mm the floor broke it into shards
    const bull = new THREE.Group(); bull.position.set(BULL[0], 0, BULL[1]); G.add(bull);
    bull.add(at(cyl(0.35, 0.45, 0.3, 10, M(0x2a2c32)), 0, 0.15, 0));
    bull.add(at(cyl(0.12, 0.12, 0.4, 6, chrome), 0, 0.45, 0));
    const bb2 = new THREE.Group(); bb2.position.y = BULL_Y - 0.22; bull.add(bb2);                // the body pivots here
    const hideM = M(0x3a2a20, { unlit: 0.1 }), hideL = M(0x5a4030, { unlit: 0.1 });
    const torso = ico(0.5, 1, hideM); torso.scale.set(1.5, 0.55, 0.62); bb2.add(torso);          // along x: its head at -x
    bb2.add(at(box(0.5, 0.06, 0.66, M(0x8a5a32, { unlit: 0.2 })), 0.05, 0.22, 0));               // the saddle pad
    const bhead = at(new THREE.Group(), -0.82, 0.12, 0); bb2.add(bhead);
    { const hd = ico(0.26, 1, hideM); hd.scale.set(1.1, 0.9, 0.85); bhead.add(hd); bhead.add(at(ico(0.15, 1, hideL), -0.2, -0.08, 0)); for (const s of [-1, 1]) { bhead.add(rot(at(cone(0.06, 0.42, 5, M(0xf0e6cc, { unlit: 0.25 })), 0.02, 0.2, s * 0.33), -s * 1.3, 0, -0.3)); bhead.add(at(ico(0.04, 0, M(0x101010)), -0.18, 0.08, s * 0.14)); } }
    bb2.add(rot(at(box(0.04, 0.04, 0.5, M(0xe8d8a0)), -0.4, 0.22, 0), 0, 0, 0.3));              // the rope handle
    bb2.add(rot(at(cyl(0.03, 0.02, 0.5, 4, hideM), 0.8, 0.0, 0), 0, 0, -1.2));                   // the tail
    bull.rotation.y = (BULL_YAW + 90) * PI / 180;                                                 // the body's -x to the yaw (-90: the head to -x)
    const ctrl = new THREE.Group(); ctrl.position.set(CTRL[0], 0, CTRL[1]); G.add(ctrl);
    ctrl.add(at(box(0.5, LEVER_Y - 0.05, 0.6, M(0x5a6a7a, { unlit: 0.1 })), 0, (LEVER_Y - 0.05) / 2, 0));
    ctrl.add(at(box(0.04, 0.04, 0.3, M(0xffd23a, { unlit: 0.4 })), -0.26, LEVER_Y - 0.25, 0));
    const lamp = at(ico(0.06, 0, glow(0xff3a2a)), 0.0, LEVER_Y + 0.02, -0.22); ctrl.add(lamp);
    const lever = at(new THREE.Group(), 0, LEVER_Y, -0.24); ctrl.add(lever);   // at the box's -z side: the operator's right paw, beside her face from the front (in the middle it sat on her nose)
    lever.add(at(box(0.05, 0.3, 0.05, chrome), 0, 0.15, 0)); lever.add(at(ico(0.08, 1, M(0xe8202a, { unlit: 0.4 })), 0, 0.32, 0));   // the knob at ~0.94 m: a chibi paw reaches it
    // the doors onto the night car park (the pickup parked outside), an OPEN neon over them
    const doorM = M(0x6a4428, { unlit: 0.08 }), doors = [];
    for (const s of [-1, 1]) { const piv = at(new THREE.Group(), DOORS[0] - 0.03, 0, DOORS[1] + s * DOOR_W / 2); piv.add(at(box(0.08, 2.4, DOOR_W / 2, doorM), 0, 1.2, -s * DOOR_W / 4)); piv.add(at(box(0.1, 0.5, 0.4, M(0x1a2030, { unlit: 0.3 })), 0, 1.6, -s * DOOR_W / 4)); G.add(piv); doors.push([piv, s]); }
    const openT = tex(32, 16, x => { px(x, '#10141c', 0, 0, 32, 16); x.fillStyle = '#ff4a7a'; x.font = 'bold 11px monospace'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('OPEN', 16, 9); }, 3217);
    { const s = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 0.45), mat({ map: openT, unlit: 1 })); s.position.set(8.92, 2.9, DOORS[1]); s.rotation.y = -PI / 2; G.add(s); }
    { G.add(flat(14, 14, M(0x1a1c24), 16, -0.01, DOORS[1]));
      const sky = at(new THREE.Mesh(new THREE.PlaneGeometry(20, 12), mat({ color: 0x141a34, unlit: 1, nofog: 1 })), 23, 4, DOORS[1]); sky.rotation.y = -PI / 2; G.add(sky);
      const pk = truckModel({ trailer: false }); pk.g.position.set(13.2, 0, DOORS[1] + 1.2); pk.g.rotation.y = -0.35; G.add(pk.g);
      G.add(at(cyl(0.06, 0.06, 4, 5, M(0x5a5a62)), 11.2, 2, DOORS[1] - 2.4)); G.add(at(box(0.5, 0.1, 0.3, glow(0xffc070)), 11.2, 4.0, DOORS[1] - 2.4)); }
    // the right wall: the Lone Star flag behind the bull; pool tables at the back right; a jukebox in the back left corner
    const flagT = tex(32, 20, x => { px(x, '#1a3a8a', 0, 0, 11, 20); px(x, '#f4f2ea', 11, 0, 21, 10); px(x, '#c0202a', 11, 10, 21, 10); x.fillStyle = '#f4f2ea'; x.beginPath(); for (let i = 0; i < 10; i++) { const a = -PI / 2 + i * PI / 5, r = i % 2 ? 1.6 : 4; x.lineTo(5.5 + Math.cos(a) * r, 10 + Math.sin(a) * r); } x.fill(); }, 3218);
    { const f = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 1.5), mat({ map: flagT, unlit: 0.45 })); f.position.set(8.92, 2.9, BULL[1]); f.rotation.y = -PI / 2; G.add(f); }
    const felt = M(0x2a7a4a, { unlit: 0.1 });
    for (const [x, z] of [[4.2, -6.4], [7.0, -6.4]]) { const pt2 = new THREE.Group(); pt2.position.set(x, 0, z); G.add(pt2); pt2.add(at(box(1.0, 0.12, 1.8, M(0x5a3620)), 0, 0.72, 0)); pt2.add(at(box(0.86, 0.02, 1.66, felt), 0, 0.79, 0)); for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) pt2.add(at(box(0.1, 0.66, 0.1, M(0x4a2c1a)), sx * 0.42, 0.33, sz * 0.82)); pt2.add(at(box(0.7, 0.08, 0.3, glow(0xfff0c0, 0.8)), 0, 2.6, 0)); pt2.add(at(cyl(0.01, 0.01, 1.4, 4, dark), 0, 3.3, 0)); }
    { const jb = new THREE.Group(); jb.position.set(-7.7, 0, -7.35); jb.rotation.y = 0.5; G.add(jb); jb.add(at(box(0.9, 1.3, 0.5, M(0x8a2a3a, { unlit: 0.2 })), 0, 0.65, 0)); jb.add(rot(at(cyl(0.45, 0.45, 0.5, 10, M(0xffb84a, { unlit: 0.8 })), 0, 1.3, 0), PI / 2, 0, 0)); jb.add(at(box(0.5, 0.4, 0.04, glow(0x5ad0ff, 0.7)), 0, 0.85, 0.26)); }
    // tables at the front for the watchers
    for (const [x, z] of [[-4.2, 5.6], [0.0, 6.4], [4.2, 5.6]]) { G.add(at(cyl(0.5, 0.5, 0.05, 8, M(0x6a4428)), x, 0.74, z)); G.add(at(cyl(0.06, 0.06, 0.72, 4, dark), x, 0.36, z)); }
    // string lights across the ceiling, two wagon-wheel chandeliers
    const bulbs = [], bulbCols = [0xffd27a, 0xff9a5a, 0xfff0b0, 0xffc060];
    const V = (x, y, z) => new THREE.Vector3(x, y, z);
    const string = (a, b, n, sag, seed) => { for (let i = 0; i <= n; i++) { const u = i / n, p = new THREE.Vector3().lerpVectors(a, b, u); p.y -= sag * 4 * u * (1 - u); const m = at(ico(0.06, 0, glow(bulbCols[(i + seed) % bulbCols.length], 0.95)), p.x, p.y, p.z); G.add(m); bulbs.push([m, i + seed]); } };
    for (let q = 0; q < 6; q++) string(V(-8.8, 4.9, -7.2 + q * 2.8), V(8.8, 4.9, -5.8 + q * 2.8), 22, 0.5, q * 3);
    for (const x of [-3.0, 3.0]) { const ww = new THREE.Group(); ww.position.set(x, 4.3, -1.0); G.add(ww); ww.add(rot(new THREE.Mesh(new THREE.TorusGeometry(0.7, 0.05, 4, 14), M(0x6a4428)), PI / 2, 0, 0)); for (let i = 0; i < 8; i++) { const a = i / 8 * TAU; ww.add(rot(at(box(0.04, 0.04, 0.7, M(0x6a4428)), Math.sin(a) * 0.35, 0, Math.cos(a) * 0.35), 0, a, 0)); ww.add(at(ico(0.07, 0, glow(0xffe0a0)), Math.sin(a) * 0.7, -0.1, Math.cos(a) * 0.7)); } ww.add(at(cyl(0.01, 0.01, 1.8, 4, dark), 0, 0.9, 0)); }
    // the patrons: 30 pets in cowboy hats; their homes round the edges, the line block, the two-step ring
    const pets = [];
    const HOME = [[-5.6, 5.0], [-4.6, 6.6], [-3.3, 5.2], [-0.9, 6.9], [0.9, 5.6], [3.2, 6.8], [4.8, 6.2], [5.6, 4.8], [7.6, 5.8], [-8.0, 6.6],
      [-5.6, -6.8], [-3.4, -6.4], [3.0, -5.0], [2.5, -7.2], [5.6, -7.2], [8.0, -6.0], [-5.8, 3.6], [-5.6, -4.6], [-5.8, -3.0], [-5.7, 0.4],
      [7.9, -3.6], [8.1, -0.2], [2.2, 4.6], [-2.0, 4.4], [6.3, 2.6], [-6.0, -6.2], [0.0, -7.6], [-1.6, -7.4], [1.6, -7.5], [3.8, 3.9]];
    for (let i = 0; i < 30; i++) { const p = pet(i); G.add(p.g); pets.push(p); }

    return {
      group: G, sky: k.grad([[0, '#0c0a14'], [1, '#141a34']]), shadowCol: 0x3a2618, shadowY: 0.035, indoor: true,   // the blob shadows over the dance floor's own flat (at 1.2 cm the reviewer saw none)
      light() {
        lights(0x6a5040, 0xffd8a8, [0.25, -0.9, -0.3], 0x1a120c, [16, 60], 7);
        pt(0, SPOT[0], 3.6, SPOT[1], 1.3, 1.05, 0.8);          // the spotlight
        pt(1, -5.6, 2.6, -1.2, 0.95, 0.66, 0.42);              // over the bar
        pt(2, BULL[0], 2.8, BULL[1] + 0.8, 0.95, 0.42, 0.36);  // the bull's red glow
      },
      anim(t, P = {}) {
        const s = shotT(t, P), stopS = P.stop != null ? P.stop : null, stopped = stopS != null && s >= stopS;
        const tt = stopped ? t - (s - stopS) : t, bb = beat(tt), hb = bb >= 0 ? Math.exp(-fr(bb) * 4) : 0;
        if (P.key) pt(3, P.key[0], P.key[1], P.key[2], P.key[3], P.key[4], P.key[5]);
        if (P.spot === false) pt(0, 0, -99, 0, 0, 0, 0);
        spotDisc.visible = P.spot !== false;
        // the bulbs twinkle on the beat; the neon breathes on the bar
        bulbs.forEach(([m, i]) => { const on = pmod(Math.floor(bb) + i, 3) !== 0; m.scale.setScalar(on ? 1 + 0.2 * hb : 0.8); });
        const bh = bb >= 0 ? Math.exp(-fr(bb / 4) * 3) : 0;
        neon.outline.material.uniforms.uCol.value.setRGB(1.0 + 0.3 * bh, 0.35 + 0.1 * bh, 0.16);
        // the smoker's smoke rises and drifts
        puffs.forEach((p, i) => { const e = fr(tt * 0.35 + i / puffs.length); p.visible = P.smoke !== false; p.position.set(SMOKER[0] + 0.55 + 0.4 * e + 0.1 * Math.sin(tt + i), 2.4 + 2.2 * e, SMOKER[1] + 0.15 * Math.sin(tt * 0.7 + i)); p.scale.setScalar(0.6 + 1.6 * e); });
        // the steak on the board (or the empty board)
        steakOn.visible = P.steak !== false;
        const bs = P.boardSlide; board.position.z = BOARD[1] + (bs ? bs[2] * sm((s - bs[0]) / Math.max(0.01, bs[1] - bs[0])) : 0);   // [s0, s1, dz]: slid along the counter, out of reach
        board.rotation.z = P.steakTilt || 0;
        gcase.visible = !!P.gcase; if (P.gcase) { gcase.position.set(P.gcase[0], 0, P.gcase[1]); gcase.rotation.y = (P.gcase[2] || 0) * PI / 180; }
        // the bull: idle it rocks gently; bucking, it pitches and rears on every beat and swings its rump; `throw` is the big one
        const B = P.bull === false ? null : (P.bull || {});
        bull.visible = !!B;
        if (B) {
          const amp = B.buck ?? 0.15, u = fr(bb);
          let pitch = amp * 0.32 * Math.sin(u * TAU), roll = amp * 0.1 * Math.sin(bb * PI);
          const yaw = amp * 0.35 * Math.sin(bb * PI / 2), bob = amp * 0.06 * 4 * u * (1 - u);
          if (B.throw != null) { const e = s - B.throw; if (e >= 0 && e < 0.6) { const q = Math.sin(cl(e / 0.6) * PI); pitch += 0.55 * q; roll += 0.35 * q; } }
          bb2.rotation.set(roll, yaw, pitch); bb2.position.y = BULL_Y - 0.22 + bob;
        }
        lamp.visible = !!B && (B.buck || 0) > 0.3 ? fr(tt * 4) < 0.5 : true;
        const lv = ramp(P.lever, s); lever.rotation.x = 0.5 - 1.1 * lv;
        // the doors swing out onto the car park
        const dv = ramp(P.doors, s); doors.forEach(([piv, sd]) => { piv.rotation.y = -sd * 1.6 * dv; });
        // the patrons
        const mode = P.patrons || 'watch', R = P.ring;
        pets.forEach((p, i) => {
          let x = HOME[i][0], z = HOME[i][1], yaw = Math.atan2(SPOT[0] - x, SPOT[1] - z), m = mode === 'line' || mode === 'twostep' ? 'watch' : mode;
          if (mode === 'line' && i < LINE.cols * LINE.rows) {
            const c = i % LINE.cols, r = Math.floor(i / LINE.cols), u = pmod(bb, 8), side = u < 4 ? Math.min(u, 3) / 3 : 1 - Math.min(u - 4, 3) / 3;
            x = LINE.x0 + c * LINE.dx + (r % 2 ? 0.6 : 0) + 0.55 * side - 0.27; z = LINE.z0 + r * LINE.dz; yaw = 0; m = 'line';
          } else if (mode === 'twostep' && i < 16) {
            const pair = Math.floor(i / 2), lead = i % 2 === 0, a = pair / 8 * TAU + bb * 0.06, cx = -0.6, cz = -0.9, rx = 3.7, rz = 3.5;
            const nx = Math.cos(a), nz = Math.sin(a), px0 = cx + nx * rx, pz0 = cz + nz * rz;
            x = px0 + (lead ? 0.24 : -0.24) * nx; z = pz0 + (lead ? 0.24 : -0.24) * nz; yaw = Math.atan2(lead ? -nx : nx, lead ? -nz : nz); m = 'twostep';
          } else if (R && i < 22) {
            const a0 = (R[3] ?? 0) * PI / 180, a1 = (R[4] ?? 360) * PI / 180, a = a0 + (a1 - a0) * (i + 0.5) / 22;
            x = R[0] + Math.sin(a) * R[2]; z = R[1] + Math.cos(a) * R[2]; yaw = Math.atan2(R[0] - x, R[1] - z);
          }
          if (P.stare) yaw = Math.atan2(P.stare[0] - x, P.stare[1] - z);
          p.g.position.set(x, 0, z);
          p.g.visible = !P.noguests && !cleared(P, x, z);
          if (p.g.visible) animPet(p, m, bb, yaw);
        });
        hearts(P, s);
      },
    };
  }

  // =====================================================================================================================
  function prairie() {
    const G = new THREE.Group(), hearts = heartSet(G);
    const { SPEED, ROAD, LINE_Z, SIGN_Z } = PRAIRIE;
    // the golden-hour sky: deep blue overhead to orange and a pale gold horizon, the low sun ahead of the truck (-x)
    const skyT = tex(4, 64, x => { const gr = x.createLinearGradient(0, 0, 0, 64); gr.addColorStop(0, '#2a3a7a'); gr.addColorStop(0.3, '#6a6aa0'); gr.addColorStop(0.42, '#e8905a'); gr.addColorStop(0.5, '#ffd890'); gr.addColorStop(1, '#ffd890'); x.fillStyle = gr; x.fillRect(0, 0, 4, 64); });
    G.add(new THREE.Mesh(new THREE.SphereGeometry(188, 16, 12), mat({ map: skyT, unlit: 1, nofog: 1, side: THREE.BackSide })));
    { const sun = new THREE.Mesh(new THREE.CircleGeometry(9, 20), mat({ color: 0xfff0b0, unlit: 1, nofog: 1 })); sun.position.set(-160, 14, 30); sun.lookAt(0, 6, 0); G.add(sun); }
    // the ground: golden grass (its texture scrolls), the road (its dashes scroll)
    const grassT = tex(32, 32, (x, r) => { px(x, '#b89a4a', 0, 0, 32, 32); noise(x, r, 32, 32, ['#a88a40', '#c8a858', '#9a7e3a', '#c09848'], 260); }, 3230);
    const grassM = mat({ map: grassT, rep: [60, 60] }); G.add(flat(400, 400, grassM, 0, -0.02, 0));
    const roadT = tex(16, 16, (x, r) => { px(x, '#3a3a40', 0, 0, 16, 16); noise(x, r, 16, 16, ['#36363c', '#424248'], 40); }, 3231);
    const roadM = mat({ map: roadT, rep: [60, 2] }); G.add(flat(400, ROAD[1] - ROAD[0], roadM, 0, 0, (ROAD[0] + ROAD[1]) / 2));
    const dashT = tex(16, 4, x => { px(x, '#3a3a40', 0, 0, 16, 4); px(x, '#f2c43a', 0, 1, 8, 2); }, 3232);
    const dashM = mat({ map: dashT, rep: [40, 1] }); G.add(flat(400, 0.16, dashM, 0, 0.004, LINE_Z));
    for (const z of [ROAD[0] + 0.15, ROAD[1] - 0.15]) G.add(flat(400, 0.1, M(0xe8e4d8), 0, 0.004, z));
    // things that stream past: fence posts both sides, telegraph poles, mesquite, a windmill, a pumpjack, longhorns
    const near = [], far = [];
    const post = (x, z) => { const p = new THREE.Group(); p.add(at(box(0.1, 1.1, 0.1, M(0x6a5a44)), 0, 0.55, 0)); p.add(at(box(4.0, 0.02, 0.02, M(0x8a8a8a)), 2.0, 0.8, 0)); p.add(at(box(4.0, 0.02, 0.02, M(0x8a8a8a)), 2.0, 0.5, 0)); p.position.set(x, 0, z); G.add(p); near.push([p, x, 120]); };
    for (let i = 0; i < 30; i++) { post(-60 + i * 4, -4.6); post(-60 + i * 4, 7.2); }
    for (let i = 0; i < 6; i++) { const p = new THREE.Group(); p.add(at(cyl(0.12, 0.14, 8, 5, M(0x5a4a3a)), 0, 4, 0)); p.add(at(box(0.1, 0.1, 1.8, M(0x5a4a3a)), 0, 7.6, 0)); p.position.set(-120 + i * 40, 0, 9.5); G.add(p); near.push([p, -120 + i * 40, 240]); }
    const treeM = M(0x5a6a2a), trunkM = M(0x4a3a2a);
    const mesq = (x, z, k2) => { const tr = new THREE.Group(); tr.add(at(cyl(0.1, 0.15, 1.6, 5, trunkM), 0, 0.8, 0)); for (const [dx, dy, r] of [[0, 1.8, 1.0], [0.7, 1.6, 0.7], [-0.6, 1.7, 0.8]]) tr.add(at(ico(r, 0, treeM), dx, dy, 0)); tr.position.set(x, 0, z); tr.scale.setScalar(k2); G.add(tr); return tr; };
    for (let i = 0; i < 10; i++) { const z = (i % 2 ? -1 : 1) * (14 + hash(i, 3240) * 12); far.push([mesq(-150 + i * 30, z, 1 + hash(i, 3241)), -150 + i * 30, 300]); }
    { const wm = new THREE.Group(); wm.add(at(cyl(0.15, 0.6, 9, 4, M(0x8a8a90)), 0, 4.5, 0)); const fan = at(new THREE.Group(), 0, 9.2, 0.6); for (let i = 0; i < 12; i++) fan.add(rot(at(box(0.12, 1.6, 0.04, M(0xc8c8d0)), 0, 0, 0), 0, 0, i / 12 * TAU)); wm.add(fan); wm.userData.fan = fan; wm.position.set(-40, 0, -26); G.add(wm); far.push([wm, -40, 300]); }
    { const pj = new THREE.Group(); pj.add(at(box(0.6, 2.2, 0.6, M(0x4a4a50)), 0, 1.1, 0)); const beam = at(new THREE.Group(), 0, 2.3, 0); beam.add(at(box(4.0, 0.3, 0.3, M(0x3a3a40)), 0.4, 0, 0)); beam.add(at(box(0.7, 1.0, 0.36, M(0xd8a030, { unlit: 0.2 })), -1.8, -0.3, 0)); pj.add(beam); pj.userData.beam = beam; pj.position.set(30, 0, 22); G.add(pj); far.push([pj, 30, 300]); }
    const cowM = M(0x8a5a3a), cowW = M(0xf0e6d0);
    for (let i = 0; i < 6; i++) { const c = new THREE.Group(); c.add(at(box(1.4, 0.6, 0.5, i % 2 ? cowM : cowW), 0, 0.85, 0)); c.add(at(box(0.4, 0.4, 0.4, cowM), -0.85, 1.0, 0)); c.add(rot(at(cone(0.04, 1.1, 4, M(0xf0e6cc)), -0.9, 1.25, 0), PI / 2, 0, 0)); for (const [lx, lz] of [[-0.5, -0.18], [-0.5, 0.18], [0.5, -0.18], [0.5, 0.18]]) c.add(at(box(0.12, 0.6, 0.12, cowM), lx, 0.3, lz)); c.position.set(-80 + i * 22, 0, -16 - hash(i, 3242) * 6); c.rotation.y = hash(i, 3243) * TAU; G.add(c); far.push([c, -80 + i * 22, 300]); }
    // the WELCOME TO ABILENE TEXAS sign on its two posts, its face to +x (towards the oncoming truck)
    const signT = tex(64, 36, x => { px(x, '#1e6a3a', 0, 0, 64, 36); px(x, '#f4f2ea', 1, 1, 62, 1); px(x, '#f4f2ea', 1, 34, 62, 1); px(x, '#f4f2ea', 1, 1, 1, 34); px(x, '#f4f2ea', 62, 1, 1, 34); x.fillStyle = '#f4f2ea'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.font = 'bold 7px monospace'; x.fillText('WELCOME TO', 32, 8); x.font = 'bold 12px monospace'; x.fillText('ABILENE', 32, 19); x.font = 'bold 7px monospace'; x.fillText('TEXAS', 32, 29); }, 3233);
    const sign = new THREE.Group(); G.add(sign);
    { const face = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 1.46), mat({ map: signT, unlit: 0.6 })); face.position.set(0.04, 2.2, 0); face.rotation.y = PI / 2; sign.add(face); sign.add(at(box(0.05, 1.5, 2.64, M(0x1a4a2a)), 0, 2.2, 0)); for (const z of [-0.9, 0.9]) sign.add(at(box(0.08, 1.5, 0.08, M(0x8a8a90)), 0, 0.75, z));
      const back = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 1.46), mat({ map: signT, unlit: 0.6 })); back.position.set(-0.04, 2.2, 0); back.rotation.y = -PI / 2; sign.add(back); }   // the same face on its back: a lens ahead of the truck saw only the green backing
    // the truck at the origin, its wheels turning, the body humming over the road
    const T = truckModel(); G.add(T.g);
    return {
      group: G, sky: skyT, shadowCol: 0x6a5a30,
      light() {
        lights(0xb89a7a, 0xffc890, [0.85, -0.35, -0.2], 0xe8b07a, [60, 190], 8);
        pt(0, -1.2, 2.0, 2.4, 0.5, 0.4, 0.3);                 // a fill into the cab
      },
      anim(t, P = {}) {
        const s = shotT(t, P), speed = P.still ? 0 : (P.speed ?? SPEED), d = speed * t;
        if (P.key) pt(3, P.key[0], P.key[1], P.key[2], P.key[3], P.key[4], P.key[5]);
        grassM.uniforms.uOff.value.set(-((d / 400) * 60 % 1), 0); roadM.uniforms.uOff.value.set(-((d / 400) * 60 % 1), 0); dashM.uniforms.uOff.value.set(-((d / 400) * 40 % 1), 0);
        near.forEach(([p, x0, L]) => { p.position.x = pmod(x0 + d + L / 2, L) - L / 2; });
        far.forEach(([p, x0, L]) => { p.position.x = pmod(x0 + d * 0.35 + L / 2, L) - L / 2; if (p.userData.fan) p.userData.fan.rotation.z = t * 3; if (p.userData.beam) p.userData.beam.rotation.z = 0.25 * Math.sin(t * 1.6); });
        sign.visible = P.sign != null; if (P.sign != null) sign.position.set(speed * (s - P.sign), 0, SIGN_Z);
        T.spin.forEach(w => { w.rotation.y = -d / 0.4; });
        T.g.position.y = speed ? 0.012 * Math.sin(t * 23) : 0;
        hearts(P, s);
      },
    };
  }

  return { honkytonk: honkytonk(), prairie: prairie() };
}
