// maps8.js: the "Voyage Voyage" plane (2026-09-26, the user's queue: "make an airplane map, and use the paris and
// beach maps"). Same contract as the other map files, pure in t:
//   plane  a wide-body airliner in flight. Inside: rows of three + three seats facing the nose (-z), seat pans at
//          PLANE.SEAT (the seated clips sit on them with that lift), an aisle down x = 0, overhead bins, reading lights,
//          seat-belt signs, a galley in front of row 0 (room for a camera facing the row) and window holes through both
//          walls and the shell, so the sky, the wing and the ground show through them. Pet passengers fill the other
//          rows. Outside: the white fuselage with a pink cheat line, the wings and their engines, a pink tail with a
//          paw; the plane never moves, the world scrolls past it: a sky dome, clouds above and below, and far below
//          smoking volcanoes whose peaks poke through the clouds (ground 'volcano') or the open sea ('sea').
//          Spots (PLANE): SEAT (the pan's height), X (window, middle, aisle seat centres on the left side; the right
//          side is the mirror), row z (Z0 + k * PITCH), GALLEY (the free floor in front of row 0), WING.
//          Shot flags read by anim(t, P): `ground` ('volcano' | 'sea'), `trolley` ([z0, z1]: the drinks trolley down
//          the aisle over the shot), `bumpy` (turbulence: the bins' doors rattle, the belt signs blink, the passengers
//          bounce, the clouds race), `climb` (deg: the plane pitches up and climbs, exterior shots only: the characters
//          inside don't follow), `dusk` (the flight home: an orange evening sky, the sun low), `erupt` (cut seconds: the
//          volcano passing under the plane blows lava up), `noPax` (no pet passengers), `speed` (the scroll, m/s).
//   jetModel(k) the same airliner's exterior on its own (no cabin), for a fly-over in another map (Paris, the beach).
import { mapKit } from './mapkit.js';

export const PLANE = { SEAT: 0.28, X: [-2.25, -1.55, -0.85], Z0: -2.0, PITCH: 1.05, ROWS: 12, GALLEY: [0, -4.6], WING: [-8, -0.6, 3.5], BULK: -6.2, WIN_Y: 0.97 };

export function jetModel(k, { cabin = false } = {}) {
  const { THREE, mat, tex, px, noise, box, PI, TAU, at, rot, cyl, cone } = k;
  const M = (c, o = {}) => mat({ color: c, ...o }), glow = c => mat({ color: c, unlit: 1 });
  const G = new THREE.Group(), R = 2.95, CY = 1.0, Z1 = -8, Z2 = 13;
  const white = M(0xf4f6fa), belly = M(0xc8ccd6), pink = M(0xff5fa2), grey = M(0x8a90a0), dark = M(0x23263a), wingM = mat({ color: 0xeef0f4, side: THREE.DoubleSide });
  const L = Z2 - Z1, N = 20, sw = 2 * R * Math.sin(PI / N) + 0.02;
  // the shell: N flat strips round the axis; the two strips at the window band (phi 0 and 180 deg) are cut round the windows
  for (let i = 0; i < N; i++) {
    const phi = i / N * TAU; if (cabin && (i === 0 || i === N / 2)) continue;
    const x = Math.cos(phi) * R, y = CY + Math.sin(phi) * R, s = Math.sin(phi);
    const m = s < -0.35 ? belly : (i === N - 1 || i === N / 2 + 1) ? pink : white;   // the pink cheat line just under the windows
    const strip = box(0.08, sw, L, m); strip.position.set(x, y, (Z1 + Z2) / 2); strip.rotation.z = phi; G.add(strip);
  }
  if (!cabin) {   // seen from far: the window band as a strip of dark windows
    const winT = tex(32, 8, x => { px(x, '#f4f6fa', 0, 0, 32, 8); for (let i = 1; i < 32; i += 3) px(x, '#23304a', i, 2, 2, 4); });
    for (const s of [-1, 1]) G.add(at(box(0.08, sw, L, M(0xffffff, { map: winT, rep: [L / 3, 1] })), s * R, CY, (Z1 + Z2) / 2));
  }
  // nose: tapering rings to a rounded tip, the cockpit windows
  const ringN = 16;
  for (let j = 0; j < 4; j++) {
    const za = Z1 - j * 1.1, zb = za - 1.1, ra = R * Math.cos(j * 0.36), rb = R * Math.cos((j + 1) * 0.36), ya = CY - j * 0.18, yb = CY - (j + 1) * 0.18;
    const c = new THREE.Mesh(new THREE.CylinderGeometry(rb, ra, 1.1, ringN, 1, true), white); c.rotation.x = -PI / 2; c.position.set(0, (ya + yb) / 2, (za + zb) / 2); c.material.side = THREE.DoubleSide; G.add(c);
  }
  const tip = new THREE.Mesh(new THREE.SphereGeometry(R * Math.cos(4 * 0.36), ringN, 6, 0, TAU, 0, PI / 2), white); tip.rotation.x = -PI / 2; tip.position.set(0, CY - 0.72, Z1 - 4.4); G.add(tip);
  for (const s of [-1, 1]) G.add(rot(at(box(0.9, 0.34, 0.08, dark), s * 0.7, CY + 1.25, Z1 - 2.9), -0.55, s * 0.5, 0));
  // tail cone rising to the tail
  for (let j = 0; j < 4; j++) {
    const za = Z2 + j * 1.5, zb = za + 1.5, ra = R - j * 0.55, rb = R - (j + 1) * 0.55, ya = CY + j * 0.34, yb = CY + (j + 1) * 0.34;
    const c = new THREE.Mesh(new THREE.CylinderGeometry(ra, rb, 1.5, ringN, 1, true), white); c.rotation.x = -PI / 2; c.position.set(0, (ya + yb) / 2, (za + zb) / 2); c.material.side = THREE.DoubleSide; G.add(c);
  }
  G.add(at(new THREE.Mesh(new THREE.SphereGeometry(0.75, 8, 6), white), 0, CY + 1.36, Z2 + 6.1));
  // a flat planform extruded to a slab: pts are [x, z] pairs, y is the slab's top
  const slab = (pts, th, m) => { const sh = new THREE.Shape(pts.map(([x, z]) => new THREE.Vector2(x, z))); const g = new THREE.ExtrudeGeometry(sh, { depth: th, bevelEnabled: false }); const o = new THREE.Mesh(g, m); o.rotation.x = PI / 2; return o; };
  // wings (low, swept) with winglets, and the engines under them
  for (const s of [-1, 1]) {
    const w = slab([[s * 2.6, -0.2], [s * 15, 7.2], [s * 15, 8.5], [s * 2.6, 4.6]], 0.24, wingM); w.position.y = -0.55; G.add(w);
    G.add(at(box(0.1, 1.3, 1.1, pink), s * 15, 0.05, 8.0));
    const eng = new THREE.Group(); eng.position.set(s * 6.3, -1.55, 1.2); G.add(eng);
    const nac = cyl(0.85, 0.72, 3.4, 12, M(0xe6e8ee)); nac.rotation.x = PI / 2; eng.add(nac);
    const lip = cyl(0.9, 0.9, 0.3, 12, grey); lip.rotation.x = PI / 2; lip.position.z = -1.7; eng.add(lip);
    const intake = new THREE.Mesh(new THREE.CircleGeometry(0.74, 12), dark); intake.position.z = -1.86; intake.rotation.y = PI; eng.add(intake);
    const fan = new THREE.Group(); fan.position.z = -1.9; for (let b = 0; b < 3; b++) fan.add(rot(box(1.3, 0.12, 0.03, grey), 0, 0, b * PI / 3)); fan.add(at(cone(0.2, 0.35, 8, M(0xf4f6fa)), 0, 0, -0.1)); fan.children.at(-1).rotation.x = -PI / 2; eng.add(fan);
    eng.userData.fan = fan; G.userData.fans = (G.userData.fans || []).concat([fan]);
    eng.add(at(box(0.3, 0.9, 2.2, white), 0, 0.95, 0.3));   // pylon
  }
  // tail: the fin in pink with a white paw, the stabilisers
  const finShape = new THREE.Shape([new THREE.Vector2(0, 0), new THREE.Vector2(4.6, 0), new THREE.Vector2(6.4, 6.2), new THREE.Vector2(4.4, 6.2)]);
  const finM = new THREE.Mesh(new THREE.ExtrudeGeometry(finShape, { depth: 0.22, bevelEnabled: false }), mat({ color: 0xff5fa2, side: THREE.DoubleSide })); finM.rotation.y = -PI / 2; finM.position.set(0.11, CY + 1.9, Z2 + 1.4); G.add(finM);
  const pawM = M(0xffffff);
  for (const sx of [-1, 1]) {   // the paw on both faces of the fin
    const pg = new THREE.Group(); pg.position.set(sx * 0.13, CY + 5.0, Z2 + 4.9);
    pg.add(at(box(0.04, 1.0, 1.1, pawM), 0, 0, 0)); for (const [dy, dz] of [[0.85, -0.55], [1.15, -0.15], [1.15, 0.3], [0.85, 0.7]]) pg.add(at(box(0.04, 0.38, 0.34, pawM), 0, dy - 0.2, dz));
    G.add(pg);
  }
  for (const s of [-1, 1]) { const h = slab([[s * 0.6, 0], [s * 5.8, 2.6], [s * 5.8, 3.6], [s * 0.6, 3.4]], 0.16, wingM); h.position.set(0, CY + 1.5, Z2 + 2.6); G.add(h); }

  // the belly fairing where the wings meet the body
  G.add(at(box(4.2, 0.9, 6.5, belly), 0, -1.35, 2.2));
  return G;
}

export function buildPlaneMaps(K) {
  const k = mapKit(K);
  const { THREE, mat, tex, px, noise, box, selfLit, U, TAU, PI, hash, fr, hit, barHit, beat, grad, cyl, cone, sph, at, rot, merged, flat, lights, pt } = k;
  const M = (c, o = {}) => mat({ color: c, ...o }), glow = c => mat({ color: c, unlit: 1 });
  const cl = x => Math.max(0, Math.min(1, x)), sm = x => { x = cl(x); return x * x * (3 - 2 * x); };
  const { SEAT, X, Z0, PITCH, ROWS, BULK, WIN_Y } = PLANE;
  const rowZ = r => Z0 + r * PITCH, ZEND = rowZ(ROWS - 1) + 1.2;

  function plane() {
    const G = new THREE.Group(), jet = new THREE.Group(), world = new THREE.Group(); G.add(jet); G.add(world);
    // ================= the cabin =================
    const carpet = tex(16, 16, (x, r) => { px(x, '#39406a', 0, 0, 16, 16); noise(x, r, 16, 16, ['#343a62', '#414876', '#2f3558'], 60); for (let i = 0; i < 16; i += 8) { px(x, '#5a4a8a', i + 2, 3, 2, 2); px(x, '#5a4a8a', i + 6, 11, 2, 2); } }, 801);
    jet.add(flat(5.3, ZEND - BULK, mat({ map: carpet, rep: [3, (ZEND - BULK) / 1.6] }), 0, 0, (BULK + ZEND) / 2));
    jet.add(flat(0.9, ZEND - rowZ(0) + 0.8, M(0x2a2f50), 0, 0.004, (rowZ(0) - 0.8 + ZEND) / 2));   // the aisle runner
    // seats: a blue patterned pan, a tall back, a white headrest cover, armrests; the row's tray tables folded
    const fab = tex(8, 8, (x, r) => { px(x, '#1f4a9a', 0, 0, 8, 8); noise(x, r, 8, 8, ['#1b428a', '#2656ac'], 12); px(x, '#3a6ac8', 1, 1, 1, 1); px(x, '#3a6ac8', 5, 5, 1, 1); }, 802);
    const fabM = mat({ map: fab, rep: [2, 2] }), coverM = M(0xf2f2ee), armM = M(0x5a6070), backShell = M(0x9aa2b4);
    const seatParts = [], coverParts = [], armParts = [], shellParts = [];
    const seat = (x, z) => {
      seatParts.push(at(new THREE.Mesh(new THREE.BoxGeometry(0.64, 0.12, 0.56)), x, SEAT - 0.06, z));
      const back = at(new THREE.Mesh(new THREE.BoxGeometry(0.64, 0.78, 0.14)), x, SEAT + 0.39, z + 0.33); back.rotation.x = 0.12; seatParts.push(back);
      const shell = at(new THREE.Mesh(new THREE.BoxGeometry(0.66, 0.8, 0.04)), x, SEAT + 0.39, z + 0.42); shell.rotation.x = 0.12; shellParts.push(shell);   // the plastic back with the folded tray
      const head = at(new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.24, 0.16)), x, SEAT + 0.86, z + 0.42); head.rotation.x = 0.12; seatParts.push(head);
      const cover = at(new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.18, 0.02)), x, SEAT + 0.87, z + 0.33); cover.rotation.x = 0.12; coverParts.push(cover);
      seatParts.push(at(new THREE.Mesh(new THREE.BoxGeometry(0.5, SEAT - 0.12, 0.1)), x, (SEAT - 0.12) / 2, z + 0.1));   // the leg frame
    };
    for (let r = 0; r < ROWS; r++) for (const s of [-1, 1]) {
      for (const x of X) seat(s * -x, rowZ(r));
      for (const ax of [2.6, 1.9, 1.2, 0.5]) armParts.push(at(new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.1, 0.52)), s * ax, SEAT + 0.24, rowZ(r) + 0.02));
    }
    jet.add(merged(seatParts, fabM)); jet.add(merged(coverParts, coverM)); jet.add(merged(armParts, armM)); jet.add(merged(shellParts, backShell));
    // walls: lower wall, the window band cut round the windows, the upper wall leaning in, bins, ceiling
    const wallM = M(0xe8e6e0), panelM = M(0xd6d3cc), winFrame = M(0xc8c4bc), winZ = r => rowZ(r) - 0.12, WW = 0.32, WH = 0.42, WY0 = WIN_Y - WH / 2, WY1 = WIN_Y + WH / 2;
    const XW = 2.62, XS = 2.95;
    for (const s of [-1, 1]) {
      jet.add(at(box(0.08, 0.62, ZEND - BULK, wallM), s * XW, 0.31, (BULK + ZEND) / 2));
      jet.add(rot(at(box(0.08, 0.8, ZEND - BULK, wallM), s * (XW - 0.16), 1.7, (BULK + ZEND) / 2), 0, 0, s * 0.4));
      // the window band between y 0.62 and 1.32 at x = XW, the shell's window strip at x = XS: holes at every row
      const band = [], shellBand = [], reveal = [];
      let z = BULK;
      for (let r = 0; r <= ROWS; r++) {
        const zw = r < ROWS ? winZ(r) : ZEND + WW / 2, za = zw - WW / 2, zb = zw + WW / 2;
        if (za > z) { band.push(at(new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.7, za - z)), s * XW, 0.97, (z + za) / 2)); shellBand.push(at(new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.93, za - z)), s * XS, 1.0, (z + za) / 2)); }
        if (r < ROWS) {
          band.push(at(new THREE.Mesh(new THREE.BoxGeometry(0.08, WY0 - 0.62, WW)), s * XW, (0.62 + WY0) / 2, zw)); band.push(at(new THREE.Mesh(new THREE.BoxGeometry(0.08, 1.32 - WY1, WW)), s * XW, (WY1 + 1.32) / 2, zw));
          shellBand.push(at(new THREE.Mesh(new THREE.BoxGeometry(0.08, WY0 - 0.535, WW)), s * XS, (0.535 + WY0) / 2, zw)); shellBand.push(at(new THREE.Mesh(new THREE.BoxGeometry(0.08, 1.465 - WY1, WW)), s * XS, (WY1 + 1.465) / 2, zw));
          // the reveal: a short tunnel from the inner hole to the outer one, rounded by a frame
          for (const y of [WY0, WY1]) reveal.push(at(new THREE.Mesh(new THREE.BoxGeometry(XS - XW, 0.04, WW)), s * (XW + XS) / 2, y, zw));
          for (const dz of [-WW / 2, WW / 2]) reveal.push(at(new THREE.Mesh(new THREE.BoxGeometry(XS - XW, WH, 0.04)), s * (XW + XS) / 2, WIN_Y, zw + dz));
          for (const y of [WY0 - 0.03, WY1 + 0.03]) reveal.push(at(new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.05, WW + 0.1)), s * (XW - 0.05), y, zw));
          for (const dz of [-WW / 2 - 0.03, WW / 2 + 0.03]) reveal.push(at(new THREE.Mesh(new THREE.BoxGeometry(0.03, WH + 0.1, 0.05)), s * (XW - 0.05), WIN_Y, zw + dz));
        }
        z = zb;
      }
      shellBand.push(at(new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.93, BULK + 8)), s * XS, 1.0, (BULK - 8) / 2));
      shellBand.push(at(new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.93, 13 - ZEND)), s * XS, 1.0, (ZEND + 13) / 2));
      jet.add(merged(band, panelM)); jet.add(merged(reveal, winFrame));
      jet.add(merged(shellBand, M(0xf4f6fa)));
      // overhead bins with their doors, the passenger service units under them (reading lights, belt sign)
      jet.add(at(box(0.8, 0.6, ZEND - rowZ(0) + 0.9, M(0xf0eee8)), s * 1.92, 2.3, (rowZ(0) - 0.9 + ZEND) / 2));
      jet.add(rot(at(box(0.05, 0.62, ZEND - rowZ(0) + 0.9, M(0xdcd9d2)), s * 1.5, 2.3, (rowZ(0) - 0.9 + ZEND) / 2), 0, 0, -s * 0.12));
      jet.add(at(box(0.7, 0.05, ZEND - rowZ(0) + 0.9, M(0xbcb8b0)), s * 1.9, 1.98, (rowZ(0) - 0.9 + ZEND) / 2));
    }
    // the bin doors' seams and latches, per row (they rattle open a crack in the turbulence)
    const doors = [];
    for (let r = 0; r < ROWS; r++) for (const s of [-1, 1]) {
      const d = new THREE.Group(); d.position.set(s * 1.47, 2.6, rowZ(r)); d.add(at(box(0.05, 0.6, PITCH - 0.06, M(0xe6e3dc)), 0, -0.3, 0)); d.add(at(box(0.07, 0.05, 0.22, M(0x8a8e9a)), 0, -0.52, 0));
      jet.add(d); doors.push([d, r, s]);
    }
    const ceilT = tex(16, 16, (x, r) => { px(x, '#f6f4ee', 0, 0, 16, 16); px(x, '#e0ddd6', 0, 0, 16, 1); px(x, '#fff6d8', 3, 6, 10, 2); selfLit(x, 16, 16); }, 803);
    jet.add(at(box(3.0, 0.06, ZEND - BULK, M(0xffffff, { map: ceilT, rep: [1, (ZEND - BULK) / 1.1] })), 0, 2.72, (BULK + ZEND) / 2));
    const lampsL = [], signs = [];
    for (let r = 0; r < ROWS; r++) for (const s of [-1, 1]) {
      for (const dx of [0, 0.25, 0.5]) lampsL.push(at(new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.02, 0.08)), s * (1.65 + dx), 1.955, rowZ(r) + 0.05));
      const sg = at(box(0.2, 0.02, 0.1, glow(0xff9a2a)), s * 2.1, 1.952, rowZ(r) - 0.25); jet.add(sg); signs.push(sg);
    }
    jet.add(merged(lampsL, glow(0xfff4d0)));
    // galley: the front bulkhead, cabinets and ovens on the right, a curtain rail, a carpet edge, an exit sign
    jet.add(at(box(5.4, 2.75, 0.1, M(0xe8e6e0)), 0, 1.37, BULK));
    jet.add(at(box(5.4, 2.75, 0.1, M(0xe8e6e0)), 0, 1.37, ZEND)); jet.add(at(box(0.8, 1.8, 0.04, M(0xc8ccd4)), 0.9, 0.9, ZEND - 0.07)); jet.add(at(box(0.16, 0.1, 0.03, glow(0x3adf6a)), 0.9, 1.9, ZEND - 0.09));
    const galT = tex(16, 16, (x, r) => { px(x, '#c8ccd4', 0, 0, 16, 16); for (let y = 0; y < 16; y += 5) px(x, '#8a909c', 0, y, 16, 1); px(x, '#2a3040', 2, 2, 5, 3); px(x, '#ff9a2a', 3, 3, 1, 1); px(x, '#2a3040', 9, 7, 5, 3); }, 804);
    jet.add(at(box(0.7, 2.0, 2.4, M(0xffffff, { map: galT, rep: [1, 1] })), 2.2, 1.0, BULK + 1.4));
    jet.add(at(box(0.6, 0.9, 0.7, M(0xa8aeb8)), -2.25, 0.45, BULK + 0.4));
    jet.add(at(box(3.0, 0.05, 0.05, M(0x9aa0aa)), 0, 2.45, rowZ(0) - 1.25));
    jet.add(at(box(0.7, 1.9, 0.04, M(0x2a58b8)), 1.5, 1.48, rowZ(0) - 1.25));   // the curtain, drawn open to the right
    jet.add(at(box(0.5, 0.18, 0.04, glow(0x3adf6a)), 0, 2.45, BULK + 0.07));
    // the drinks trolley (flag `trolley`)
    const trolley = new THREE.Group(), steel = M(0xb8bcc6);
    trolley.add(at(box(0.42, 0.55, 0.72, steel), 0, 0.32, 0)); trolley.add(at(box(0.44, 0.08, 0.74, M(0xff5fa2)), 0, 0.44, 0));   // low, so the flight attendant's face shows over it
    for (const dz of [-0.26, 0.26]) for (const dx of [-0.16, 0.16]) trolley.add(at(box(0.05, 0.06, 0.05, M(0x2a2a30)), dx, 0.03, dz));
    [[0xff9a2e, -0.1, -0.2], [0x6ab8e8, 0.1, -0.2], [0x3fae47, -0.1, 0.12], [0xe8243a, 0.1, 0.12]].forEach(([c, dx, dz]) => { trolley.add(at(cyl(0.045, 0.05, 0.24, 6, M(c)), dx, 0.72, dz)); });
    for (let i = 0; i < 4; i++) trolley.add(at(cyl(0.035, 0.03, 0.08, 6, M(0xffffff)), -0.12 + i * 0.08, 0.64, 0.3));
    jet.add(trolley);
    // pet passengers in the other rows: low-poly heads over the seat backs, bobbing on the beat
    const FURS = [0xd8c2a0, 0x3a2e28, 0xf2eee6, 0x9a7a5a, 0x6a6a72, 0xe8a060, 0x2a2a30, 0xc8b8e0], TOPS = [0xe84a6a, 0x4a8fe8, 0xf2c94c, 0x6bd46b, 0xffffff, 0xff9a3c];
    const pax = [];
    for (let r = 1; r < ROWS; r++) for (const s of [-1, 1]) X.forEach((x, j) => {
      const i = r * 7 + j * 3 + (s > 0 ? 1 : 0); if (hash(i, 811) < 0.28) return;
      const g = new THREE.Group(), fur = M(FURS[i % FURS.length]), kind = i % 3;
      g.add(at(box(0.36, 0.44, 0.26, M(TOPS[i % TOPS.length])), 0, 0.26, 0));   // sitting tall: their heads show over the row in front
      const head = at(box(0.42, 0.38, 0.38, fur), 0, 0.72, 0); g.add(head);
      head.add(at(box(0.15, 0.1, 0.1, M(0x1a1a1a)), 0, -0.06, -0.2));
      for (const e of [-1, 1]) {
        head.add(at(box(0.06, 0.06, 0.02, M(0x101010)), e * 0.1, 0.04, -0.195));
        head.add(kind === 0 ? rot(at(cone(0.08, 0.2, 4, fur), e * 0.14, 0.26, 0), 0, 0, -e * 0.25) : kind === 1 ? at(box(0.08, 0.3, 0.06, fur), e * 0.1, 0.32, 0) : rot(at(box(0.07, 0.24, 0.16, fur), e * 0.24, -0.02, 0), 0, 0, e * 0.35));
      }
      g.position.set(s * -x, SEAT, rowZ(r) + 0.05); jet.add(g); pax.push([g, i]);
    });
    // ================= the airliner's outside =================
    const shell = jetModel(k, { cabin: true }); jet.add(shell);
    // ================= the world outside (scrolls; the plane stays put) =================
    const skyDay = grad([[0, '#1f64c8'], [0.5, '#5aa8ec'], [0.78, '#bfe4fa'], [1, '#eef8ff']]), skyDusk = grad([[0, '#1a1f5a'], [0.45, '#6a3a7a'], [0.72, '#f0845a'], [1, '#ffd48a']]);
    const domeM = mat({ map: skyDay, unlit: 1, nofog: 1, side: THREE.BackSide }), domeD = mat({ map: skyDusk, unlit: 1, nofog: 1, side: THREE.BackSide });
    const dome = new THREE.Mesh(new THREE.SphereGeometry(460, 16, 10), domeM), domeDusk = new THREE.Mesh(new THREE.SphereGeometry(459, 16, 10), domeD);
    world.add(dome); world.add(domeDusk);
    const sun = at(new THREE.Mesh(new THREE.CircleGeometry(16, 10), mat({ color: 0xfff6c8, unlit: 1, nofog: 1 })), -140, 120, -330); sun.lookAt(0, 0, 0); world.add(sun);
    const sunD = at(new THREE.Mesh(new THREE.CircleGeometry(22, 10), mat({ color: 0xffa050, unlit: 1, nofog: 1 })), -230, 18, -330); sunD.lookAt(0, 0, 0); world.add(sunD);
    // clouds: clusters of white boxes, most of them below the plane, a few at its height far out to the sides
    const cloudM = M(0xffffff, { unlit: 0.55 }), cloudS = M(0xdfe6f2, { unlit: 0.4 }), clouds = [];
    const puff = (i, s) => { const g = new THREE.Group(); const n = 3 + (i % 3); for (let q = 0; q < n; q++) g.add(at(box((3 + hash(i, q) * 4) * s, (1.4 + hash(i, q + 9) * 1.2) * s, (3 + hash(i, q + 5) * 3) * s, q % 2 ? cloudS : cloudM), (q - n / 2) * 2.4 * s, (q === 1 ? 0.6 : 0) * s, (hash(i, q + 3) - 0.5) * 3 * s)); return g; };
    for (let i = 0; i < 70; i++) {
      const low = i < 58, x = (hash(i, 821) - 0.5) * (low ? 320 : 260), y = low ? -16 + hash(i, 822) * 7 : -2 + hash(i, 822) * 10;
      if (!low && Math.abs(x) < 16) continue;
      const g = puff(i, low ? 2.2 : 1.4); g.position.set(x, y, 0); world.add(g); clouds.push([g, i, hash(i, 823) * 500]);
    }
    // the ground far below: volcanic rock with lava cracks, or the sea
    const rockT = tex(32, 32, (x, r) => { px(x, '#4a3a36', 0, 0, 32, 32); noise(x, r, 32, 32, ['#3a2e2c', '#5a4640', '#2e2624'], 260); for (let i = 0; i < 3; i++) { let cx = Math.floor(r() * 32), cy = Math.floor(r() * 32); for (let s = 0; s < 7; s++) { px(x, '#ff7a1a', cx, cy, 1, 1); cx = (cx + (r() < 0.5 ? 1 : 0) + 32) % 32; cy = (cy + 1) % 32; } } const d = x.getImageData(0, 0, 32, 32); for (let i = 0; i < d.data.length; i += 4) if (d.data[i] > 200) d.data[i + 3] = 204; x.putImageData(d, 0, 0); }, 824);
    const rockM = mat({ map: rockT, rep: [60, 60] }), rock = flat(1400, 1400, rockM, 0, -48, -200); world.add(rock);
    const seaT = tex(32, 32, (x, r) => { px(x, '#1f6aa8', 0, 0, 32, 32); noise(x, r, 32, 32, ['#2a7ab8', '#195c94', '#3a8ac8'], 220); for (let i = 0; i < 10; i++) px(x, '#e8f4ff', Math.floor(r() * 29), Math.floor(r() * 32), 3, 1); }, 825);
    const seaM = mat({ map: seaT, rep: [90, 90] }), sea = flat(1400, 1400, seaM, 0, -48, -200); world.add(sea);
    // volcanoes: tall cones whose peaks poke through the clouds, a glowing crater, smoke rising, lava thrown on the bar
    const volcM = M(0x3e302c), volcHi = M(0x5a4640), lavaM = glow(0xff6a1a), lavaHi = glow(0xffc040), smokeM = M(0xc8c4cc, { unlit: 0.45 }), volcs = [];
    const volcano = (i, h, r) => {
      const g = new THREE.Group();
      g.add(at(cone(r, h, 9, volcM), 0, h / 2, 0)); g.add(at(cone(r * 0.55, h * 0.3, 9, volcHi), 0, h * 0.86, 0));
      const top = at(cyl(r * 0.2, r * 0.2, 0.3, 9, lavaM), 0, h * 0.99, 0); g.add(top);
      const smoke = []; for (let q = 0; q < 9; q++) { const s = box(2.2, 2.2, 2.2, smokeM); g.add(s); smoke.push(s); }
      const bits = []; for (let q = 0; q < 12; q++) { const b = box(0.9, 0.9, 0.9, q % 3 ? lavaM : lavaHi); g.add(b); bits.push(b); }
      return { g, h, r, smoke, bits, i };
    };
    const VOLC = [[-60, 36, 16], [70, 32, 15], [-25, 30, 13], [110, 38, 18], [-120, 34, 17], [30, 28, 12], [-80, 30, 14], [150, 33, 16]];
    VOLC.forEach(([x, h, r], i) => { const v = volcano(i, h, r); v.x = x; v.z0 = i * 64; v.g.position.set(x, -48, 0); world.add(v.g); volcs.push(v); });
    const hero = volcano(99, 38, 17); hero.g.position.set(-18, -48, 0); hero.smoke.forEach(q => { q.visible = false; }); world.add(hero.g);   // the one that blows at `erupt`: on the hook camera's side, low, lava and no smoke (a smoke column hid the plane)
    const WRAP = 520;
    return {
      group: G, sky: skyDay, shadowCol: 0x262a44,
      light() { lights(0xa8a6b8, 0xfff2dc, [-0.35, -1, -0.45], 0xc8e4f8, [70, 440], 5.5); pt(0, 0, 2.5, rowZ(0) - 0.5, 0.55, 0.5, 0.42); pt(1, 0, 2.5, rowZ(3), 0.45, 0.42, 0.36); pt(2, 0, 2.5, BULK + 1, 0.4, 0.4, 0.4); },
      anim(t, P = {}) {
        const dusk = !!P.dusk, bumpy = !!P.bumpy, V = P.speed ?? (bumpy ? 22 : 14), b = beat(t), h = hit(t);
        dome.visible = !dusk; domeDusk.visible = dusk; sun.visible = !dusk; sunD.visible = dusk;
        if (dusk) { U.uAmb.value.set(0x9a8aa0); U.uDirCol.value.set(0xffb070); U.uDirDir.value.set(0.8, -0.5, -0.3).normalize(); U.uFogCol.value.set(0xf0a070); }
        const volcGround = (P.ground || 'volcano') === 'volcano';
        rock.visible = volcGround; sea.visible = !volcGround; volcs.forEach(v => { v.g.visible = volcGround; }); hero.g.visible = volcGround && P.erupt != null;
        rockM.uniforms.uOff.value.set(0, -t * V / 23.3); seaM.uniforms.uOff.value.set(0.01 * Math.sin(t * 0.3), -t * V / 15.5);
        // the plane: climb pitch (exterior only), a slow roll, the turbulence judder (the characters don't follow: interior shots keep it off)
        const climb = (P.climb || 0) * PI / 180 * sm((t - (P.t0 ?? t)) / 1.2);
        jet.rotation.set(climb, 0, P.climb ? 0.02 * Math.sin(t * 0.7) : 0); jet.position.y = P.climb ? 1.5 * sm((t - (P.t0 ?? t)) / 1.6) : 0;
        (shell.userData.fans || []).forEach(f => { f.rotation.z = t * 31; });
        clouds.forEach(([g, i, off]) => { const z = ((off + t * V) % WRAP + WRAP) % WRAP - 380; g.position.z = z; });
        const place = v => { const z = ((v.z0 + t * V) % WRAP + WRAP) % WRAP - 360; v.g.position.z = z; return z; };
        const erupting = (v, t0) => {
          v.smoke.forEach((s, q) => { const u = fr(t * 0.22 + q / 9), sc = 2 + u * 7; s.position.set(Math.sin(q * 2.1 + t * 0.3) * u * 4, v.h + 1 + u * 26, Math.cos(q * 1.3) * u * 3); s.scale.setScalar(sc / 3); });
          const since = t - t0, n = Math.floor(b / 4), sinceBar = (b / 4 - n) * 4 * 60 / 150;   // a burst on every bar; the big one at t0
          v.bits.forEach((q, j) => {
            const big = t0 != null && since >= 0 && since < 3, s = big ? since : sinceBar, spd = big ? 16 + hash(j, 831) * 14 : 7 + hash(j + n, 832) * 6;
            const a = hash(j, 833) * TAU, out = big ? 5 : 2.2, y = v.h + spd * s - 9.8 * s * s * 0.5;
            q.position.set(Math.cos(a) * out * s * 2, y, Math.sin(a) * out * s * 2); q.visible = y > v.h - 2 && s < 2.4; q.scale.setScalar(big ? 1.3 : 0.8);
          });
        };
        volcs.forEach(v => { if (!volcGround) return; place(v); erupting(v, null); });
        if (hero.g.visible) { hero.g.position.z = (t - P.erupt) * V - 14.4; erupting(hero, P.erupt); hero.smoke.forEach(q => { q.visible = false; }); }   // on the hook camera's line half a second after it blows
        // turbulence: bins' doors pop a crack on the beat, belt signs blink, passengers bounce
        doors.forEach(([d, r, s]) => { d.rotation.x = bumpy ? -0.12 * h * (hash(r, s + 5) > 0.4 ? 1 : 0.3) : 0; });
        signs.forEach(sg => { sg.visible = !bumpy || Math.floor(t * 3) % 2 === 0; sg.material.uniforms.uCol.value.set(bumpy ? 0xff9a2a : 0x6a5a4a); });
        pax.forEach(([g, i]) => { g.visible = !P.noPax; const bb = b + hash(i, 834) * 0.3; g.position.y = SEAT + (bumpy ? 0.12 * h * (0.5 + hash(i, 835)) : 0.02 * Math.abs(Math.sin(bb * PI))); g.children[1].rotation.z = 0.08 * Math.sin(bb * PI); });
        const tr = P.trolley; trolley.visible = !!tr; if (tr) { const u = cl((t - P.t0) / Math.max(0.1, (P.t1 ?? t + 1) - P.t0)); trolley.position.set(0, bumpy ? 0.03 * h : 0, tr[0] + (tr[1] - tr[0]) * u); trolley.rotation.z = bumpy ? 0.05 * h * (Math.floor(b) % 2 ? 1 : -1) : 0; }
      },
    };
  }
  return { plane: plane() };
}
