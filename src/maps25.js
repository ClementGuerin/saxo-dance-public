// maps25.js: the "Animal" map (2026-10-03, KATSEYE; the clip: a sleek talent agency at night, its interview panel, keys,
// a contract and a fast-food lunch at the boardroom table, an icy boss in a white chair, and a glossy red box where the
// group dances under white light panels). Same contract as the other map files, pure in t:
//   agency   one floor of a talent agency at night, two places through one door. The office (z > 0): dark carpet, rows of
//            desks with glowing monitors and box-pet staff in black suits, glass walls on the city at night, ceiling light
//            panels; on its back wall (z = 0) the CEO's black door (DOOR, a gold CEO plate) with the NO ANIMALS sign beside
//            it (SIGN), the assistant's desk by the door (ASSIST) and her waste-paper bin (BIN), the security console with a
//            bank of four CCTV screens facing its operator (SECURITY, SCREENS; she sits at +z of it), Saxo's desk (SAXO_DESK). Behind the door (z < 0)
//            the CEO's office is the clip's red box (RED): glossy red walls, floor and ceiling, a 3 x 3 grid of white light
//            panels, a mirror wall on the right, her white egg chair (CHAIR) behind a black desk (DESK, top DESK_Y) with a
//            white mug, a pen pot and a laptop, and a security camera in the corner over the door (CAM: the CCTV's lens).
// Flags: zone ('office' | 'red': whose lights), door (0 shut .. 1 open into the red room, or [s0, s1, a, b]: from a to b
// between s0 and s1 s into the shot), shake ([s]: the door rattles in its frame, a thump from inside), redUnder (true or
// 0-1: red light pulses out from under the door on every beat), glow (true, 0-1 or [s0, s1, a, b]: the office floor's
// 3 x 3 tiles in front of the door light up like a dance floor on the beat), mug (s: the mug slides off the desk and
// falls; mugAt [x, z], mugDir [dx, dz], mugSlide m to the edge, mugScale), pulse (the red room's panels flash on the beat), monitors (0-1: the CCTV screens' glow on the faces in front of
// them), sign (s: the NO ANIMALS sign drops off the wall), staff (the box-pet staff: 'desks' seated typing, 'stand' by
// their desks, 'door' crowded round the door, 'red' in rows in the red room, 'pour' walking from the door arc through the
// doorway to the rows over [pourAt, pourAt + pourDur] s, each pourGap s after the last, pourK of the way to the rows, 'peek' clustered outside the doorway looking in), stare [x, z], gasp, dance, claw, cheer, cctv (the shot looks through a
// security camera: the corner camera's body hides), noguests,
// clear [[x, z, r]], key [x, y, z, r, g, b].
import { mapKit } from './mapkit.js';

export const AGENCY = {
  DOOR: [0, 0], DOOR_W: 1.2, DOOR_H: 2.3, WALL_T: 0.2, CEIL: 3.4,
  OFFICE: { x: [-7, 7], z: [0, 12] },
  RED: { x: [-4.2, 4.2], z: [-8.4, -0.2], CEIL: 3.2 },
  SIGN: [-1.2, 1.62], SIGN_W: 1.0, SIGN_H: 0.64,
  ASSIST: [1.95, 1.3], BIN: [3.05, 1.75], SECURITY: [-4.4, 1.75], SCREENS: { x: [-4.93, -3.87], y: [0.66, 1.34], z: 1.62 },
  SAXO_DESK: [-2.4, 4.6], DESKS: { x: [-4.6, -2.4, 2.4, 4.6], z: [4.6, 7.0, 9.4] }, DESK_TOP: 0.55, SEAT: 0.34,
  DESK: [1.4, -3.6], DESK_W: 1.7, DESK_D: 0.75, DESK_Y: 0.555, CHAIR: [1.4, -4.45],
  CAM: [3.05, 2.92, -0.5], TILES: { x0: -1.125, z0: 0.35, n: 3, w: 0.75 },
};

// the NO ANIMALS sign's face: a white plaque, a red border, a paw print under a red prohibition circle, the words below
export function drawNoAnimals(x) {
  const w = 96, h = 62;
  x.fillStyle = '#c81e28'; x.fillRect(0, 0, w, h); x.fillStyle = '#ffffff'; x.fillRect(3, 3, w - 6, h - 6);
  const cx = w / 2, cy = 22;
  x.fillStyle = '#1a1a20';
  x.beginPath(); x.ellipse(cx, cy + 4, 7, 6, 0, 0, Math.PI * 2); x.fill();
  for (const [dx, dy] of [[-8, -4], [-3, -9], [3, -9], [8, -4]]) { x.beginPath(); x.ellipse(cx + dx, cy + dy, 2.6, 3.2, 0, 0, Math.PI * 2); x.fill(); }
  x.strokeStyle = '#d8202c'; x.lineWidth = 3.5; x.beginPath(); x.arc(cx, cy, 15, 0, Math.PI * 2); x.stroke();
  x.beginPath(); x.moveTo(cx - 10.5, cy - 10.5); x.lineTo(cx + 10.5, cy + 10.5); x.stroke();
  x.fillStyle = '#111116'; x.font = 'bold 14px monospace'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('NO ANIMALS', cx, 50);
}

export function buildAgencyMaps(K) {
  const k = mapKit(K);
  const { THREE, mat, tex, px, noise, box, TAU, PI, beat, grad, cyl, cone, at, rot, flat, lights, pt } = k;
  const M = (c, o = {}) => mat({ color: c, ...o }), glow = (c, u = 1) => mat({ color: c, unlit: u });
  const cl = x => Math.max(0, Math.min(1, x)), sm = x => { x = cl(x); return x * x * (3 - 2 * x); };
  const fr = x => x - Math.floor(x);
  const shotT = (t, P) => P.t0 != null ? t - P.t0 : 0;
  const cleared = (P, x, z) => (P.clear || []).some(([cx, cz, r]) => (x - cx) ** 2 + (z - cz) ** 2 < r * r);
  const ico = (r, d, m) => new THREE.Mesh(new THREE.IcosahedronGeometry(r, d), m);
  const span = (v, s) => typeof v === 'number' ? v : v === true ? 1 : Array.isArray(v) ? v[2] + (v[3] - v[2]) * sm((s - v[0]) / Math.max(0.01, v[1] - v[0])) : 0;
  const { DOOR_W, DOOR_H, WALL_T, CEIL, OFFICE, RED, SIGN, SIGN_W, SIGN_H, ASSIST, BIN, SECURITY, SCREENS, SAXO_DESK, DESKS, DESK_TOP, SEAT, DESK, DESK_W, DESK_D, DESK_Y, CHAIR, CAM, TILES } = AGENCY;
  const plane = (w, h, m) => new THREE.Mesh(new THREE.PlaneGeometry(w, h), m);

  // ---------- the staff: box pets in black suits, white shirts and ties (light furs: dark ones read as black boxes) ----------
  const FURS = [0xd8b080, 0xece0cc, 0xb89068, 0xf4f0e8, 0xcfc6d6, 0xe4cca4, 0xf2dcc0, 0xd4b496, 0xe8e0d4, 0xc0a888, 0xf0e8dc];
  const suitM = M(0x3a3a48), shirtM = M(0xf6f6f2, { unlit: 0.15 }), shoeM = M(0x18181e);
  function staffPet(i) {
    const g = new THREE.Group(), F = M(FURS[i % FURS.length]), kind = i % 3;
    const body = new THREE.Group(); g.add(body);
    body.add(at(box(0.4, 0.46, 0.28, suitM), 0, 0.33, 0));
    body.add(at(box(0.13, 0.32, 0.02, shirtM), 0, 0.4, 0.145));
    body.add(at(box(0.045, 0.24, 0.03, M(i % 4 === 1 ? 0xc81e3a : 0x16161c)), 0, 0.39, 0.155));
    if (i % 3 === 2) body.add(at(box(0.08, 0.1, 0.02, M(0xffffff, { unlit: 0.4 })), 0.12, 0.42, 0.15));
    const legs = [-1, 1].map(s => { const l = at(new THREE.Group(), s * 0.1, 0.1, 0.02); l.add(at(box(0.12, 0.2, 0.13, suitM), 0, -0.05, 0)); l.add(at(box(0.12, 0.08, 0.16, shoeM), 0, -0.14, 0.02)); body.add(l); return l; });
    const arms = [-1, 1].map(s => { const a = at(new THREE.Group(), s * 0.23, 0.52, 0); a.add(at(box(0.09, 0.3, 0.09, suitM), 0, -0.13, 0)); a.add(at(box(0.08, 0.08, 0.08, F), 0, -0.3, 0)); body.add(a); return a; });
    const head = at(new THREE.Group(), 0, 0.8, 0); body.add(head);
    const skull = ico(0.24, 1, F); skull.scale.set(1, 0.9, 0.92); head.add(skull);
    const snout = at(ico(0.1, 1, M(0xf6ece0)), 0, -0.07, 0.19); snout.scale.set(1.1, 0.8, 0.9); head.add(snout);
    head.add(at(ico(0.035, 0, M(0x151515)), 0, -0.03, 0.28));
    for (const e of [-1, 1]) {
      head.add(at(ico(0.038, 0, M(0x0e0e0e)), e * 0.1, 0.05, 0.19));
      head.add(at(ico(0.012, 0, glow(0xffffff)), e * 0.1 + 0.012, 0.065, 0.225));
      head.add(kind === 0 ? rot(at(cone(0.08, 0.2, 4, F), e * 0.15, 0.27, 0), 0, 0, -e * 0.25) : kind === 1 ? at(box(0.08, 0.3, 0.06, F), e * 0.1, 0.33, 0) : rot(at(box(0.07, 0.24, 0.16, F), e * 0.24, 0.02, 0), 0, 0, e * 0.3));
    }
    if (i % 4 === 3) for (const e of [-1, 1]) head.add(at(box(0.09, 0.07, 0.02, M(0x101014)), e * 0.1, 0.05, 0.215));
    return { g, body, head, arms, legs, i };
  }

  // ---------- an office desk: a white top on dark legs, a monitor facing its sitter (its screen glowing), a keyboard ----------
  const deskTopM = M(0xe8e8ec), legM = M(0x2a2a32), monM = M(0x1c1c22);
  const screenT = seed => tex(16, 10, (x, r) => { px(x, '#2a4a78', 0, 0, 16, 10); for (let j = 1; j < 9; j += 2) px(x, r() < 0.5 ? '#9ac8ff' : '#e8f2ff', 2, j, 3 + Math.floor(r() * 10), 1); px(x, '#5a8ad8', 0, 0, 16, 1); }, seed);
  function desk(G, x, z, i, { w = 1.2, d = 0.6, faceZ = 1, monX = 0 } = {}) {   // faceZ: +1, the sitter at +z of the desk (facing -z); -1 the other way; monX: the monitor off the desk's middle
    G.add(at(box(w, 0.04, d, deskTopM), x, DESK_TOP - 0.02, z));
    for (const s of [-1, 1]) G.add(at(box(0.05, DESK_TOP - 0.04, d - 0.06, legM), x + s * (w / 2 - 0.05), (DESK_TOP - 0.04) / 2, z));
    G.add(at(box(0.06, 0.12, 0.06, legM), x + monX, DESK_TOP + 0.06, z - faceZ * 0.16));
    G.add(at(box(0.52, 0.34, 0.04, monM), x + monX, DESK_TOP + 0.29, z - faceZ * 0.18));
    const sc = plane(0.46, 0.28, mat({ map: screenT(2500 + i), unlit: 0.9 })); sc.position.set(x + monX, DESK_TOP + 0.29, z - faceZ * 0.18 + faceZ * 0.022); sc.rotation.y = faceZ > 0 ? 0 : PI; G.add(sc);
    G.add(at(box(0.36, 0.02, 0.12, M(0x2a2a30)), x, DESK_TOP + 0.01, z + faceZ * 0.06));
  }
  function chair(G, x, z, yaw = 0) {   // a black office chair whose sitter faces `yaw` (0 = +z)
    const c = at(new THREE.Group(), x, 0, z); c.rotation.y = yaw; G.add(c);
    c.add(at(box(0.42, 0.06, 0.42, M(0x1e1e24)), 0, SEAT - 0.03, 0)); c.add(at(box(0.42, 0.46, 0.06, M(0x1e1e24)), 0, SEAT + 0.24, -0.21));
    c.add(at(cyl(0.025, 0.025, SEAT - 0.06, 5, legM), 0, (SEAT - 0.06) / 2, 0)); c.add(at(box(0.44, 0.03, 0.06, legM), 0, 0.03, 0)); c.add(at(box(0.06, 0.03, 0.44, legM), 0, 0.03, 0));
    return c;
  }

  // ======================================================================================================================
  function agency() {
    const G = new THREE.Group();
    const [OX0, OX1] = OFFICE.x, [OZ0, OZ1] = OFFICE.z, OW = OX1 - OX0, OD = OZ1 - OZ0, ocz = (OZ0 + OZ1) / 2;
    // ---------------- the office: carpet tiles (>= 1 m, low contrast), the ceiling and its light panels ----------------
    const carpetT = tex(16, 16, (x, r) => { px(x, '#2c3240', 0, 0, 16, 16); noise(x, r, 16, 16, ['#283040', '#30384a', '#2a3042'], 60); px(x, '#252b38', 0, 0, 16, 1); px(x, '#252b38', 0, 0, 1, 16); }, 2501);
    G.add(flat(OW, OD, mat({ map: carpetT, rep: [OW / 1.5, OD / 1.5] }), 0, 0, ocz));
    const ceil = plane(OW, OD, M(0x1c2028)); ceil.rotation.x = PI / 2; ceil.position.set(0, CEIL, ocz); G.add(ceil);
    for (let x = -5; x <= 5; x += 2.5) for (let z = 2; z <= 11; z += 3) { const p = plane(1.4, 0.6, glow(0xeef4ff, 0.95)); p.rotation.x = PI / 2; p.position.set(x, CEIL - 0.01, z); G.add(p); }
    // ---------------- the back wall (z = 0) round the CEO's doorway: charcoal on the office side ----------------
    const wallT = tex(8, 8, (x, r) => { px(x, '#2e3440', 0, 0, 8, 8); noise(x, r, 8, 8, ['#2b313c', '#323844'], 8); }, 2502);
    const wallM = (w, h) => mat({ map: wallT, rep: [w / 2, h / 2] });
    const hw = DOOR_W / 2, sideW = OX1 - hw;
    for (const s of [-1, 1]) G.add(at(plane(sideW, CEIL, wallM(sideW, CEIL)), s * (hw + sideW / 2), CEIL / 2, 0));
    G.add(at(plane(DOOR_W, CEIL - DOOR_H, wallM(DOOR_W, CEIL - DOOR_H)), 0, DOOR_H + (CEIL - DOOR_H) / 2, 0));
    G.add(at(box(OW, 0.12, 0.03, M(0x1a1e26)), 0, 0.06, 0.015));
    // the door frame on the office side: black with a thin gold line
    for (const s of [-1, 1]) { G.add(at(box(0.1, DOOR_H + 0.1, 0.05, M(0x121216)), s * (hw + 0.05), (DOOR_H + 0.1) / 2, 0.025)); G.add(at(box(0.015, DOOR_H, 0.052, M(0xd8b44a, { unlit: 0.3 })), s * (hw + 0.01), DOOR_H / 2, 0.026)); }
    G.add(at(box(DOOR_W + 0.2, 0.1, 0.05, M(0x121216)), 0, DOOR_H + 0.05, 0.025));
    // the jambs and the lintel through the wall's thickness
    for (const s of [-1, 1]) G.add(at(box(0.02, DOOR_H, WALL_T, M(0x121216)), s * (hw + 0.01), DOOR_H / 2, -WALL_T / 2));
    G.add(at(box(DOOR_W, 0.02, WALL_T, M(0x121216)), 0, DOOR_H + 0.01, -WALL_T / 2));
    // ---------------- the door: glossy black, hinged on the left, swinging into the red box; a gold CEO plate and handles ----------------
    const hinge = at(new THREE.Group(), -hw, 0, -WALL_T / 2); G.add(hinge);
    const leaf = new THREE.Group(); leaf.position.set(hw, 0, 0); hinge.add(leaf);
    leaf.add(at(box(DOOR_W - 0.02, DOOR_H - 0.04, 0.06, M(0x15151b, { lift: 0.05 })), 0, DOOR_H / 2 + 0.02, 0));
    for (const y of [0.55, 1.75]) leaf.add(at(box(DOOR_W - 0.3, 0.5, 0.065, M(0x1c1c24)), 0, y, 0));
    const plateT = tex(32, 12, x => { px(x, '#d8b44a', 0, 0, 32, 12); px(x, '#8a6a20', 0, 0, 32, 1); px(x, '#8a6a20', 0, 11, 32, 1); x.fillStyle = '#2a1e08'; x.font = 'bold 9px monospace'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('CEO', 16, 6.5); }, 2503);
    leaf.add(at(plane(0.42, 0.16, mat({ map: plateT, unlit: 0.45 })), 0, 1.62, 0.034));
    for (const sz of [-1, 1]) leaf.add(at(box(0.16, 0.035, 0.05, M(0xd8b44a, { unlit: 0.3 })), DOOR_W / 2 - 0.16, 1.05, sz * 0.05));
    // ---------------- the red light under the door and its pool on the carpet ----------------
    const underM = glow(0xff2a3a), poolM = mat({ color: 0xff2030, unlit: 1, see: 0.55 });
    const under = flat(DOOR_W, 0.12, underM, 0, 0.006, 0.07); G.add(under);
    const pool = flat(1.9, 1.3, poolM, 0, 0.008, 0.72); G.add(pool);
    // ---------------- the dance-floor tiles in front of the door (3 x 3, lit on the beat) ----------------
    const tiles = [];
    for (let a = 0; a < TILES.n; a++) for (let b = 0; b < TILES.n; b++) {
      const m = mat({ color: 0xff3a6a, unlit: 1 }), t2 = flat(TILES.w - 0.06, TILES.w - 0.06, m, TILES.x0 + (a + 0.5) * TILES.w, 0.01, TILES.z0 + (b + 0.5) * TILES.w);
      G.add(t2); tiles.push({ t: t2, m, a, b });
    }
    // ---------------- the NO ANIMALS sign beside the door ----------------
    const signG = new THREE.Group(); G.add(signG);
    signG.add(at(plane(SIGN_W, SIGN_H, mat({ map: tex(96, 62, x => drawNoAnimals(x), 2504), unlit: 0.55 })), 0, 0, 0.012));
    signG.add(at(box(SIGN_W + 0.04, SIGN_H + 0.04, 0.02, M(0x101014)), 0, 0, 0));
    // ---------------- the side walls: floor-to-ceiling glass on the city at night ----------------
    const cityT = tex(64, 32, (x, r) => {
      const gr = x.createLinearGradient(0, 0, 0, 32); gr.addColorStop(0, '#0a1024'); gr.addColorStop(0.7, '#1c2450'); gr.addColorStop(1, '#3a3060'); x.fillStyle = gr; x.fillRect(0, 0, 64, 32);
      for (let i = 0; i < 64;) {
        const bw = 3 + Math.floor(r() * 6), bh = 8 + Math.floor(r() * 20);
        px(x, ['#141a2e', '#1a2038', '#10152a'][Math.floor(r() * 3)], i, 32 - bh, bw, bh);
        for (let yy = 34 - bh; yy < 31; yy += 3) for (let xx = i + 1; xx < i + bw - 1; xx += 2) if (r() < 0.45) px(x, r() < 0.8 ? '#ffd88a' : '#9ad8ff', xx, yy, 1, 1);
        i += bw + Math.floor(r() * 2);
      }
    }, 2505);
    for (const s of [-1, 1]) {
      const city = plane(OD + 6, 9, mat({ map: cityT, rep: [2, 1], unlit: 1, nofog: 1 })); city.position.set(s * (OX1 + 2.5), 2.6, ocz); city.rotation.y = -s * PI / 2; G.add(city);
      for (let z = OZ0 + 0.75; z <= OZ1; z += 1.5) G.add(at(box(0.08, CEIL, 0.08, M(0x24282e)), s * OX1, CEIL / 2, z));
      G.add(at(box(0.1, 0.1, OD, M(0x24282e)), s * OX1, 0.05, ocz)); G.add(at(box(0.1, 0.12, OD, M(0x24282e)), s * OX1, CEIL - 0.06, ocz));
    }
    // the front wall (z = 12): dark, the lift doors, TALENT in gold letters
    G.add(rot(at(plane(OW, CEIL, wallM(OW, CEIL)), 0, CEIL / 2, OZ1), 0, PI));
    for (const s of [-1, 1]) G.add(rot(at(plane(0.58, 2.2, M(0x9aa2ae, { lift: 0.1 })), s * 0.3, 1.1, OZ1 - 0.01), 0, PI));
    const talentT = tex(64, 12, x => { px(x, '#2e3440', 0, 0, 64, 12); x.fillStyle = '#e0bc58'; x.font = 'bold 10px monospace'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('TALENT', 32, 6.5); }, 2506);
    G.add(rot(at(plane(2.4, 0.45, mat({ map: talentT, unlit: 0.6 })), 0, 2.7, OZ1 - 0.01), 0, PI));
    // ---------------- the desks and their chairs (the staff face the CEO's door, -z) ----------------
    const deskSpots = [];
    DESKS.x.forEach(x => DESKS.z.forEach(z => { deskSpots.push([x, z]); desk(G, x, z, deskSpots.length); chair(G, x, z + 0.55, PI); }));
    // the assistant's desk by the door: she stands behind it facing the office; a phone, a tray of papers, a little plant
    desk(G, ASSIST[0], ASSIST[1], 90, { w: 1.3, faceZ: -1, monX: 0.42 });
    G.add(at(box(0.18, 0.06, 0.12, M(0x1a1a20)), ASSIST[0] + 0.42, DESK_TOP + 0.03, ASSIST[1] + 0.05));
    G.add(at(box(0.3, 0.04, 0.22, M(0xf4f4f0)), ASSIST[0] - 0.42, DESK_TOP + 0.02, ASSIST[1]));
    G.add(at(cyl(0.06, 0.05, 0.12, 6, M(0xf0f0f0)), ASSIST[0] + 0.55, DESK_TOP + 0.06, ASSIST[1] - 0.18)); G.add(at(ico(0.1, 0, M(0x4aa858)), ASSIST[0] + 0.55, DESK_TOP + 0.2, ASSIST[1] - 0.18));
    // her waste-paper bin
    G.add(at(cyl(0.15, 0.12, 0.34, 8, M(0x9aa0aa)), BIN[0], 0.17, BIN[1]));
    // ---------------- the security console: a desk with a bank of four CCTV screens facing the operator (+z) ----------------
    const [sx0, sx1] = SCREENS.x, [sy0, sy1] = SCREENS.y, scz = SCREENS.z;
    G.add(at(box(1.6, 0.04, 0.62, deskTopM), SECURITY[0], DESK_TOP - 0.02, SECURITY[1]));
    for (const s of [-1, 1]) G.add(at(box(0.05, DESK_TOP - 0.04, 0.56, legM), SECURITY[0] + s * 0.75, (DESK_TOP - 0.04) / 2, SECURITY[1]));
    G.add(at(box(0.4, 0.02, 0.14, M(0x2a2a30)), SECURITY[0], DESK_TOP + 0.01, SECURITY[1] + 0.16));
    G.add(at(box(0.08, sy0 - DESK_TOP, 0.08, legM), SECURITY[0], (DESK_TOP + sy0) / 2, scz - 0.04));
    chair(G, SECURITY[0], SECURITY[1] + 0.65, PI);
    const camFeedT = (seed, red) => tex(20, 14, (x, r) => {
      px(x, '#3a3e44', 0, 0, 20, 14); noise(x, r, 20, 14, ['#34383e', '#44484e', '#2e3238'], 60);
      if (red) { px(x, '#8a2a32', 3, 3, 14, 9); px(x, '#c84a52', 4, 9, 12, 2); px(x, '#e8e8ea', 6, 5, 2, 4); }
      else { px(x, '#22262c', 2, 8, 16, 4); for (let i = 3; i < 18; i += 4) px(x, '#5a5e64', i, 6, 2, 2); }
      px(x, '#ffffff', 1, 1, 4, 1); px(x, '#ff3030', 17, 1, 2, 2);
    }, seed);
    const screens = [];
    const sw = (sx1 - sx0) / 2 - 0.04, sh = (sy1 - sy0) / 2 - 0.04;
    for (let a = 0; a < 2; a++) for (let b = 0; b < 2; b++) {
      const m = mat({ map: camFeedT(2510 + a * 2 + b, a === 1 && b === 1), unlit: 0.85 });
      const sc = plane(sw, sh, m); sc.position.set(sx0 + (a + 0.5) * (sx1 - sx0) / 2, sy0 + (b + 0.5) * (sy1 - sy0) / 2, scz + 0.026);
      G.add(sc); screens.push(m);
    }
    G.add(at(box(sx1 - sx0 + 0.08, sy1 - sy0 + 0.08, 0.05, M(0x101014)), (sx0 + sx1) / 2, (sy0 + sy1) / 2, scz));
    // ---------------- plants and a water cooler ----------------
    for (const [x, z] of [[-6.3, 0.6], [6.3, 0.6], [-6.3, 11.3], [6.3, 11.3], [3.6, 0.5]]) { G.add(at(cyl(0.2, 0.16, 0.4, 7, M(0xe8e8ec)), x, 0.2, z)); G.add(at(ico(0.36, 0, M(0x3e9a4e)), x, 0.75, z)); G.add(at(ico(0.26, 0, M(0x4cb05c)), x + 0.1, 1.05, z - 0.05)); }
    G.add(at(box(0.32, 0.9, 0.32, M(0xdadde4)), 6.3, 0.45, 3.0)); G.add(at(cyl(0.14, 0.14, 0.4, 8, mat({ color: 0x8ad0ff, unlit: 0.5, see: 0.3 })), 6.3, 1.1, 3.0));

    // ======================== the red box: the CEO's office behind the door (z < 0) ========================
    const [RX0, RX1] = RED.x, [RZ0] = RED.z, RW = RX1 - RX0, RD = -WALL_T - RZ0, rcz = (RZ0 - WALL_T) / 2, RC = RED.CEIL;
    const redFloorT = tex(16, 16, (x, r) => { px(x, '#c4141e', 0, 0, 16, 16); noise(x, r, 16, 16, ['#bc121c', '#cc1a24'], 20); px(x, '#a80e18', 0, 0, 16, 1); px(x, '#a80e18', 0, 0, 1, 16); }, 2520);
    G.add(flat(RW, RD, mat({ map: redFloorT, rep: [RW, RD], unlit: 0.5 }), 0, 0, rcz));
    const redWallT = tex(8, 16, (x, r) => { px(x, '#c8121e', 0, 0, 8, 16); px(x, '#a40c16', 0, 0, 1, 16); noise(x, r, 8, 16, ['#c41520', '#ce1824'], 8); }, 2521);
    const rwall = (w, h) => mat({ map: redWallT, rep: [w / 1.2, h / 2.4], unlit: 0.55 });
    G.add(at(plane(RW, RC, rwall(RW, RC)), 0, RC / 2, RZ0));
    G.add(rot(at(plane(RD, RC, rwall(RD, RC)), RX0, RC / 2, rcz), 0, PI / 2));
    // the mirror wall on the right: dark glass with a red sheen and pale streaks
    const mirrorT = tex(32, 16, x => { px(x, '#3a0a10', 0, 0, 32, 16); x.strokeStyle = 'rgba(255,190,200,0.55)'; x.lineWidth = 1; for (const o of [4, 7, 18, 21, 26]) { x.beginPath(); x.moveTo(o, 16); x.lineTo(o + 8, 0); x.stroke(); } }, 2522);
    G.add(rot(at(plane(RD, RC, mat({ map: mirrorT, rep: [2, 1], unlit: 0.6 })), RX1, RC / 2, rcz), 0, -PI / 2));
    // the door's side of the red box (z = -WALL_T), round the doorway
    const rSide = RX1 - hw;
    for (const s of [-1, 1]) G.add(rot(at(plane(rSide, RC, rwall(rSide, RC)), s * (hw + rSide / 2), RC / 2, -WALL_T), 0, PI));
    G.add(rot(at(plane(DOOR_W, RC - DOOR_H, rwall(DOOR_W, RC - DOOR_H)), 0, DOOR_H + (RC - DOOR_H) / 2, -WALL_T), 0, PI));
    // the ceiling and its 3 x 3 white light panels
    const rceil = plane(RW, RD, glow(0xa80e18, 0.6)); rceil.rotation.x = PI / 2; rceil.position.set(0, RC, rcz); G.add(rceil);
    const panels = [];
    for (const x of [-2.8, 0, 2.8]) for (const z of [-1.6, -4.2, -6.8]) { const m = glow(0xffffff, 1), p = plane(1.7, 1.7, m); p.rotation.x = PI / 2; p.position.set(x, RC - 0.01, z); G.add(p); panels.push({ m, x, z }); }
    // the CEO's black desk, its CEO plate facing the room, a pen pot, a closed laptop; the white mug (posed per frame)
    const deskG = at(new THREE.Group(), DESK[0], 0, DESK[1]); G.add(deskG);
    deskG.add(at(box(DESK_W, 0.05, DESK_D, M(0x141418, { lift: 0.08 })), 0, DESK_Y - 0.025, 0));
    deskG.add(at(box(DESK_W - 0.1, DESK_Y - 0.08, 0.05, M(0x1a1a20)), 0, (DESK_Y - 0.05) / 2, DESK_D / 2 - 0.04));
    for (const s of [-1, 1]) deskG.add(at(box(0.06, DESK_Y - 0.05, DESK_D - 0.08, M(0x1a1a20)), s * (DESK_W / 2 - 0.05), (DESK_Y - 0.05) / 2, 0));
    deskG.add(at(plane(0.42, 0.16, mat({ map: plateT, unlit: 0.45 })), 0, DESK_Y - 0.2, DESK_D / 2 - 0.01));
    deskG.add(at(box(0.5, 0.025, 0.34, M(0xb8bcc4)), -0.05, DESK_Y + 0.012, -0.1));
    deskG.add(at(cyl(0.06, 0.06, 0.14, 7, M(0xd8b44a)), -0.62, DESK_Y + 0.07, -0.12));
    for (const [dx, dz, c] of [[-0.03, 0, 0xff5fa2], [0.02, 0.02, 0x3fd4ff], [0, -0.03, 0xffd43b]]) deskG.add(rot(at(box(0.015, 0.16, 0.015, M(c)), -0.62 + dx, DESK_Y + 0.17, -0.12 + dz), 0.1, 0, dx * 4));
    const mug = new THREE.Group(); G.add(mug);
    mug.add(at(cyl(0.065, 0.06, 0.13, 8, M(0xf8f8f8, { unlit: 0.3 })), 0, 0.065, 0)); mug.add(at(box(0.03, 0.07, 0.06, M(0xf8f8f8, { unlit: 0.3 })), 0.08, 0.07, 0));
    mug.add(at(cyl(0.055, 0.055, 0.01, 8, glow(0x241208, 0.7)), 0, 0.125, 0));   // the coffee: flat and dark (lit, its facets read as a pinwheel)
    const MUG = [DESK[0] + 0.55, DESK_Y, DESK[1] + 0.12];
    // the white egg chair behind the desk, facing the room (+z)
    const chairG = at(new THREE.Group(), CHAIR[0], 0, CHAIR[1]); G.add(chairG);
    const shell = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.36, 0.86, 10, 1, true, PI / 2, PI), M(0xf8f8f8, { unlit: 0.25, side: THREE.DoubleSide }));
    shell.position.set(0, 0.78, 0); chairG.add(shell);
    chairG.add(at(box(0.62, 0.12, 0.56, M(0xf2f2f2, { unlit: 0.2 })), 0, 0.4, 0.02)); chairG.add(at(cyl(0.05, 0.05, 0.34, 6, M(0xd0d0d4)), 0, 0.17, 0)); chairG.add(at(cyl(0.28, 0.3, 0.04, 10, M(0xd0d0d4)), 0, 0.02, 0));
    // the security camera in the corner over the door (white body, black lens, a blinking red light)
    const camG = at(new THREE.Group(), CAM[0], CAM[1], CAM[2]); G.add(camG);
    const camBody = new THREE.Group(); camG.add(camBody);
    camG.add(at(box(0.04, 0.2, 0.04, M(0xe8e8ec)), 0, 0.12, 0));
    camBody.add(at(box(0.18, 0.12, 0.3, M(0xf4f4f6)), 0, 0, 0.08));
    const lens = at(cyl(0.05, 0.05, 0.03, 8, M(0x101014)), 0, 0, 0.245); lens.rotation.x = PI / 2; camBody.add(lens);
    const camLed = at(ico(0.018, 0, glow(0xff2020)), 0.06, 0.04, 0.235); camBody.add(camLed);
    camBody.lookAt(new THREE.Vector3(DESK[0] - CAM[0], DESK_Y - CAM[1], DESK[1] - CAM[2]).add(camG.position));

    // ======================== the staff ========================
    const staffSeats = deskSpots.filter(([x, z]) => !(x === SAXO_DESK[0] && z === SAXO_DESK[1]));
    const staff = staffSeats.map((_, i) => { const p = staffPet(i); G.add(p.g); return p; });
    const RED_ROWS = [];
    for (const z of [-6.6, -7.4]) for (const x of [-2.0, -1.0, 0.0, 1.0]) RED_ROWS.push([x, z]);
    for (const x of [-1.5, -0.5, 0.5]) RED_ROWS.push([x, -8.05]);
    const PEEK = [[-0.32, 0.3], [0.32, 0.3], [0, 0.62], [-0.55, 0.95], [0.55, 0.95], [-0.2, 1.3], [0.25, 1.35], [-0.75, 1.6], [0.8, 1.6], [0, 1.95], [-0.5, 2.25]];
    const DOOR_ARC = staffSeats.map((_, i) => { const a = (i / (staffSeats.length - 1) - 0.5) * 2.3, r = 1.6 + (i % 3) * 0.55; return [Math.sin(a) * r * 1.25, 0.55 + Math.cos(a) * r]; });

    return {
      group: G, sky: grad([[0, '#0a0e18'], [1, '#141a28']]), shadowCol: 0x161a22, indoor: true,
      light() { lights(0x5a6474, 0xa8b4cc, [0.3, -1, -0.45], 0x0c1220, [9, 34], 8); },
      anim(t, P = {}) {
        const s = shotT(t, P), bb = beat(t), hit = Math.exp(-fr(bb) * 5), barHit = Math.exp(-fr(bb / 4) * 4), red = P.zone === 'red', nb = Math.floor(bb);
        if (red) lights(0xb85866, 0xffe8ec, [0.15, -1, 0.35], 0x3a0610, [10, 30], 7);
        // the door
        const shakes = (P.shake || []).map(f => s - f).filter(e => e >= 0 && e < 0.5);
        const rattle = shakes.length ? 0.035 * Math.sin(shakes[0] * 60) * Math.exp(-shakes[0] * 7) : 0;
        const open = span(P.door ?? 0, s);
        hinge.rotation.y = 1.75 * open + rattle;
        // the red light under the door (only while it's shut)
        const ru = P.redUnder === true ? 1 : P.redUnder || 0, rk = ru * (0.35 + 0.65 * hit) + (shakes.length ? 0.6 : 0);
        under.visible = rk > 0.02 && open < 0.05; pool.visible = under.visible && !P.noPool;   // noPool: a lens at the gap would see only the pool's dither
        if (under.visible) { underM.uniforms.uCol.value.setRGB(1, 0.16, 0.22).multiplyScalar(0.4 + 0.6 * Math.min(1, rk)); poolM.uniforms.uSee.value = 1 - 0.45 * Math.min(1, rk); }
        // the dance-floor tiles: a checker that swaps on every beat, brighter on the beat
        const gl = span(P.glow ?? 0, s);
        tiles.forEach(({ t: t2, m, a, b }) => {
          t2.visible = gl > 0.02; if (!t2.visible) return;
          const on = (a + b + nb) % 2 === 0, pal = [[1, 0.2, 0.42], [1, 0.85, 0.95], [0.95, 0.15, 0.2]][(a * 3 + b + ((nb % 3) + 3) % 3) % 3];
          m.uniforms.uCol.value.setRGB(pal[0], pal[1], pal[2]).multiplyScalar(gl * (on ? 0.55 + 0.45 * hit : 0.18));
        });
        // the sign drops off the wall and lands face up on the carpet
        const sg = P.sign != null && s >= P.sign ? cl((s - P.sign) / 0.5) : 0;
        signG.position.set(SIGN[0], SIGN[1] - (SIGN[1] - 0.03) * sg * sg, 0.01 + 0.36 * sm(sg)); signG.rotation.set(-PI / 2 * sm(sg * 1.3), 0, 0.25 * sm(sg));
        // the mug: knocked to the desk's edge, then over it and down to the floor, tipping
        const mu = P.mug != null && s >= P.mug ? s - P.mug : -1;
        const [mx0, mz0] = P.mugAt || [MUG[0], MUG[2]], [mdx, mdz] = P.mugDir || [1, 0], mSl = P.mugSlide ?? 0.32;   // mugAt [x, z] on the desk, pushed along mugDir by mugSlide m to the edge
        mug.scale.setScalar(P.mugScale || 1);
        if (mu < 0) { mug.position.set(mx0, MUG[1], mz0); mug.rotation.set(0, Math.atan2(-mdz, mdx), 0); }
        else {
          const slide = cl(mu / 0.18), fall = Math.max(0, mu - 0.18), y = Math.max(0, DESK_Y - 4.9 * fall * fall);
          const d = mSl * slide + 0.9 * Math.min(fall, 0.35);
          mug.position.set(mx0 + mdx * d, y, mz0 + mdz * d); mug.rotation.set(0, Math.atan2(-mdz, mdx), -Math.min(PI / 2, fall * 6));
        }
        // the red box's panels flash on the beat
        panels.forEach(({ m }, i) => { const f = P.pulse ? 0.55 + 0.45 * (((i + nb) % 2) ? hit : barHit) : 1; m.uniforms.uCol.value.setRGB(1, P.pulse ? 0.88 : 1, P.pulse ? 0.92 : 1).multiplyScalar(f); });
        camLed.visible = fr(t * 0.8) < 0.5; camG.visible = !P.cctv;   // a CCTV shot looks through this camera: its own body would fill the lens
        // the CCTV screens: brighter when someone watches them, a pale light on the faces in front
        const mon = P.monitors || 0;
        screens.forEach(m => { m.uniforms.uUnlit.value = 0.75 + 0.25 * mon; });
        if (!red) {
          pt(0, (SCREENS.x[0] + SCREENS.x[1]) / 2, 1.0, SCREENS.z + 0.7, 0.25 + 0.65 * mon, 0.32 + 0.75 * mon, 0.45 + 0.9 * mon);
          if (rk > 0.02 || open > 0.05) { const o = Math.max(Math.min(1, rk), open); pt(1, 0, 0.5, 0.9, 1.6 * o, 0.18 * o, 0.25 * o); }
          if (gl > 0.02) pt(2, 0, 0.6, 1.5, 1.2 * gl * (0.5 + 0.5 * hit), 0.4 * gl, 0.7 * gl);
        } else {
          pt(0, 0, 2.8, -2.4, 0.95, 0.92, 0.95); pt(1, 0, 2.8, -5.0, 0.8, 0.75, 0.8);
          if (open > 0.05) pt(2, 0, 1.6, 1.5, 0.25, 0.3, 0.45);
        }
        if (P.key) pt(3, P.key[0], P.key[1], P.key[2], P.key[3], P.key[4], P.key[5]);
        // the staff
        const layout = P.staff || 'desks';
        staff.forEach((p, i) => {
          const [dx, dz] = staffSeats[i];
          let x, z, seated = false, yaw = PI, walking = 0;
          if (layout === 'desks') { x = dx; z = dz + 0.55; seated = true; }
          else if (layout === 'stand') { x = dx; z = dz + 0.95; }
          else if (layout === 'door') { [x, z] = DOOR_ARC[i]; yaw = Math.atan2(0 - x, 0 - z); }
          else if (layout === 'red') { [x, z] = RED_ROWS[i % RED_ROWS.length]; yaw = 0; }
          else if (layout === 'peek') { [x, z] = PEEK[i % PEEK.length]; yaw = PI; }
          else {   // 'pour': from the door arc through the doorway to the rows, one after the other
            const t0 = (P.pourAt || 0) + i * (P.pourGap ?? 0.22), dur = P.pourDur || 1.6, e = cl((s - t0) / dur), [ax, az] = DOOR_ARC[i], [rx, rz] = RED_ROWS[i % RED_ROWS.length];
            const k = P.pourK ?? 1, bx = rx * k, bz = -0.1 + (rz + 0.1) * k;   // pourK: how far towards the rows they get (the rows are 7 m in: at full pace they ran)
            const u = e < 0.5 ? e * 2 : (e - 0.5) * 2;
            if (e < 0.5) { x = ax + (0 - ax) * u; z = az + (-0.1 - az) * u; yaw = Math.atan2(0 - ax, -0.1 - az); }
            else { x = bx * u; z = -0.1 + (bz + 0.1) * u; yaw = e < 1 ? Math.atan2(bx, bz + 0.1) : 0; }
            walking = e > 0 && e < 1 ? 1 : 0;
          }
          const show = !P.noguests && !cleared(P, x, z); p.g.visible = show; if (!show) return;
          if (P.stare && !walking) yaw = Math.atan2(P.stare[0] - x, P.stare[1] - z);
          const b = bb + i * 0.11, bounce = Math.abs(Math.sin(b * PI)), moving = (P.dance || P.claw) && !seated;
          p.g.position.set(x, seated ? SEAT - 0.08 : 0, z); p.g.rotation.set(0, yaw, 0);
          p.legs.forEach((l, q) => { l.rotation.x = seated ? -1.35 : walking ? (q ? 1 : -1) * 0.6 * Math.sin(s * 11 + i) : 0; });
          p.body.position.y = moving ? 0.05 * bounce : walking ? 0.03 * Math.abs(Math.sin(s * 11 + i)) : 0;
          p.head.rotation.set(0.06 * bounce * (moving ? 1 : 0.3), 0, 0);
          p.arms.forEach((a, q) => {
            const sd = q ? 1 : -1, ph = (q ? 0.5 : 0) + i * 0.13, k2 = Math.pow(0.5 + 0.5 * Math.cos(TAU * (bb - ph)), 1.4);
            if (P.gasp) a.rotation.set(-2.3, 0, -sd * 0.55);
            else if (P.cheer) a.rotation.set(0.35, 0, sd * (2.45 + 0.25 * bounce));
            else if (P.claw && !seated) a.rotation.set(-2.6 + 0.5 * k2, 0, sd * (0.5 - 0.15 * k2));   // paws up and forward, never level: arms held out read as a T-pose (review)
            else if (P.dance && !seated) a.rotation.set(-1.0 - 1.4 * k2, 0, sd * 0.35);
            else if (seated) a.rotation.set(-1.05 - 0.12 * Math.abs(Math.sin((bb * 2 + q * 0.5 + i * 0.3) * PI)), 0, sd * 0.1);
            else if (walking) a.rotation.set(sd * 0.5 * Math.sin(s * 11 + i), 0, sd * 0.12);
            else a.rotation.set(0.05, 0, sd * 0.12);
          });
        });
      },
    };
  }
  return { agency: agency() };
}
