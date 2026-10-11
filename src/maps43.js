// maps43.js: the "Beat It" map (2026-10-12, Michael Jackson; the clip: rival gangs at night, a backlit alley behind a
// chain-link fence in smoke, a long corridor to a bright door, a dark warehouse in teal light and fog where the singer in
// a red leather jacket dances both gangs into one formation). Same contract as the other map files, pure in t:
//   rumble  a warehouse at night (RUMBLE: x X0..X1, z Z0..Z1, H high): a stained concrete floor with yellow bay lines,
//         corrugated teal walls over a brick dado, steel columns, hanging lamps, teal tubes, crates, oil drums, a
//         forklift, a gantry along the back-left; the loading door in the back wall (DOOR: centre x, the wall's z;
//         DOOR_W x DOOR_H; `door` 0 shut .. 1 rolled up, or a ramp [s0, s1, a, b]) onto the alley outside (wet asphalt,
//         brick walls, a chain-link fence at FENCE_Z backlit by a street lamp in the smoke). The gangs: four box-pet alley
//         cats in black leather (pets 0-3) and four box-pet bunnies in purple denim (pets 4-7), by default squared off
//         across the floor behind their leaders' marks (CAT_SPOTS, BUN_SPOTS); `cats` / `buns` (a mode for the gang) or
//         `gmode` [8 modes]: 'square' (the stance, fists up, bobbing), 'claw' (paws up, swiping on the beat, mouth open:
//         the hiss), 'stomp' (a hind-foot thump on the beat: the bunnies' warning), 'point' (an arm at `pointAt`, default
//         the door), 'throw' (an overarm throw on every beat), 'stare' (at `stare` [x, z], mouth open), 'pant' (bent forward, heaving), 'tired' (flat on
//         the back, chest heaving), 'dance' (the formation's step), 'cheer', false (gone); `gspots` [8 [x, z] | null],
//         `gface` [x, z] (everyone faces it), `gyaw` [8 deg | null] (a lying pet's head direction). Things thrown for the
//         dog (src/fetch.js): `throws` [[s, kind, x0, y0, z0, x1, y1, z1, dur, arc]] (it flies on a parabola over dur,
//         spinning, and lies where it lands, or vanishes there when `caught`; a negative s = long ago), `pile` [[x, z, kind, yaw]] (lying on the floor);
//         `flap` (s: the dog flap in the shut door is pushed in from outside, then falls shut); `hearts` [[x, y, z, s0, loop]] + `heartYaw`; `zone` 'in' | 'alley' (the lights); `key`; `clear` [[x, z, r]].
import { mapKit } from './mapkit.js';
import { fetchMesh, FETCH } from './fetch.js';

export const RUMBLE = {
  X0: -9, X1: 9, Z0: -7, Z1: 9, H: 6.5,
  DOOR: [0, -7], DOOR_W: 3.4, DOOR_H: 3.4,
  ALLEY: [-6, 6, -19, -7], FENCE_Z: -13.5, LAMP: [2.2, 3.6, -16],
  KOB: [-1.55, 0.4], COMPOTE: [1.55, 0.4], MID: [0, 0.6],
  CAT_SPOTS: [[-2.45, -0.55], [-2.6, 1.45], [-3.35, -1.45], [-3.5, 0.55]],
  BUN_SPOTS: [[2.45, -0.55], [2.6, 1.45], [3.35, -1.45], [3.5, 0.55]],
};

export function buildRumbleMaps(K) {
  const k = mapKit(K);
  const { THREE, mat, tex, px, noise, box, TAU, PI, beat, fr, cyl, cone, ico, at, rot, flat, lights, pt, hash } = k;
  const M = (c, o = {}) => mat({ color: c, ...o }), glow = (c, u = 1) => mat({ color: c, unlit: u });
  const cl = x => Math.max(0, Math.min(1, x));
  const cleared = (P, x, z) => (P.clear || []).some(([cx, cz, r]) => (x - cx) ** 2 + (z - cz) ** 2 < r * r);
  const ramp = (v, s, d = 0) => v == null ? d : Array.isArray(v) ? v[2] + (v[3] - v[2]) * cl((s - v[0]) / Math.max(0.01, v[1] - v[0])) : (v === true ? 1 : v === false ? 0 : v);
  const shotT = (t, P) => P.t0 != null ? t - P.t0 : 0;
  const R = RUMBLE;

  // ---------- textures ----------
  const concreteT = tex(32, 32, (x, r) => { px(x, '#5c6862', 0, 0, 32, 32); noise(x, r, 32, 32, ['#56625c', '#62706a', '#505c56', '#687670'], 160); px(x, '#46524c', 0, 0, 32, 1); px(x, '#46524c', 0, 0, 1, 32); }, 4301);
  const stainT = tex(16, 16, (x, r) => { for (let i = 0; i < 16; i++) for (let j = 0; j < 16; j++) { const d = Math.hypot(i - 8, j - 8) + r() * 3; if (d < 7) px(x, d < 4 ? '#22282a' : '#2c3234', i, j, 1, 1); } }, 4302);
  const corrT = tex(16, 32, (x, r) => { for (let i = 0; i < 16; i++) px(x, i % 4 < 2 ? '#3e7c78' : '#346a66', i, 0, 1, 32); noise(x, r, 16, 32, ['#3a7470', '#3c7874'], 30); }, 4303);
  const brickT = tex(32, 16, (x, r) => { px(x, '#5a2e24', 0, 0, 32, 16); noise(x, r, 32, 16, ['#562a22', '#622f26', '#4e2820'], 60); for (let j = 0; j < 16; j += 4) { px(x, '#3a2420', 0, j, 32, 1); for (let i = (j / 4) % 2 ? 4 : 0; i < 32; i += 8) px(x, '#3a2420', i, j, 1, 4); } }, 4304);
  const asphaltT = tex(32, 32, (x, r) => { px(x, '#3a4648', 0, 0, 32, 32); noise(x, r, 32, 32, ['#34403f', '#404c4e', '#4a5658'], 140); }, 4305);
  const slatT = tex(16, 16, (x, r) => { px(x, '#7a8284', 0, 0, 16, 16); noise(x, r, 16, 16, ['#727a7c', '#80888a'], 30); for (let j = 0; j < 16; j += 4) px(x, '#4a5254', 0, j, 16, 1); }, 4306);
  const hazardT = tex(16, 16, x => { for (let i = 0; i < 16; i++) for (let j = 0; j < 16; j++) px(x, ((i + j) >> 2) % 2 ? '#1a1a1a' : '#e8c020', i, j, 1, 1); }, 4307);
  const fenceT = tex(16, 16, x => { x.clearRect(0, 0, 16, 16); x.strokeStyle = '#9aa4a8'; x.lineWidth = 1; x.beginPath(); x.moveTo(0, 0); x.lineTo(16, 16); x.moveTo(16, 0); x.lineTo(0, 16); x.moveTo(8, 0); x.lineTo(16, 8); x.lineTo(8, 16); x.lineTo(0, 8); x.closePath(); x.stroke(); }, 4308);
  const crateT = tex(16, 16, (x, r) => { px(x, '#9a7448', 0, 0, 16, 16); noise(x, r, 16, 16, ['#94703f', '#a07a4c'], 30); px(x, '#6a4c2c', 0, 0, 16, 2); px(x, '#6a4c2c', 0, 14, 16, 2); px(x, '#6a4c2c', 0, 0, 2, 16); px(x, '#6a4c2c', 14, 0, 2, 16); for (let i = 0; i < 16; i++) px(x, '#6a4c2c', i, i, 1, 1); }, 4309);
  const bayT = k.sign('BAY 3', '#e8c020', '#1a1a1a', 64, 16);

  function rumble() {
    const G = new THREE.Group();
    // the floor: concrete, oil stains, yellow bay lines leading to the door
    G.add(flat(R.X1 - R.X0, R.Z1 - R.Z0, mat({ map: concreteT, rep: [(R.X1 - R.X0) / 2, (R.Z1 - R.Z0) / 2] }), 0, 0, (R.Z0 + R.Z1) / 2));
    const stainM = mat({ map: stainT, see: 0.35 });
    for (const [x, z, s] of [[-4.6, -3.1, 1.6], [5.0, 2.4, 1.3], [-6.0, 4.6, 1.1], [3.9, -4.6, 1.4]]) { const f = flat(s, s, stainM, x, 0.006, z); f.renderOrder = 1; G.add(f); }
    const yel = glow(0xd8b020, 0.45);
    for (const x of [-R.DOOR_W / 2 - 0.2, R.DOOR_W / 2 + 0.2]) G.add(flat(0.12, 4.2, yel, x, 0.008, R.Z0 + 2.1));
    G.add(flat(R.DOOR_W + 0.52, 0.12, yel, 0, 0.008, R.Z0 + 4.2));
    // the walls: corrugated teal over a brick dado; the back wall round the door
    const H = R.H, DW = R.DOOR_W, DH = R.DOOR_H;
    const wallPiece = (w, h, x, y, z, ry, T, rep) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat({ map: T, rep, unlit: T === corrT ? 0.42 : 0.3 })); m.position.set(x, y, z); m.rotation.y = ry; G.add(m); return m; };
    const D0 = 1.2;   // the dado's height
    for (const [side, xw] of [[1, R.X0], [-1, R.X1]]) {
      wallPiece(R.Z1 - R.Z0, D0, xw, D0 / 2, (R.Z0 + R.Z1) / 2, side * PI / 2, brickT, [(R.Z1 - R.Z0) / 1.6, D0 / 0.8]);
      wallPiece(R.Z1 - R.Z0, H - D0, xw, D0 + (H - D0) / 2, (R.Z0 + R.Z1) / 2, side * PI / 2, corrT, [(R.Z1 - R.Z0) / 1.2, (H - D0) / 2.4]);
    }
    wallPiece(R.X1 - R.X0, D0, 0, D0 / 2, R.Z1, PI, brickT, [(R.X1 - R.X0) / 1.6, D0 / 0.8]);
    wallPiece(R.X1 - R.X0, H - D0, 0, D0 + (H - D0) / 2, R.Z1, PI, corrT, [(R.X1 - R.X0) / 1.2, (H - D0) / 2.4]);
    const sideW = (R.X1 - R.X0 - DW) / 2;
    for (const s of [-1, 1]) {
      wallPiece(sideW, D0, s * (DW / 2 + sideW / 2), D0 / 2, R.Z0, 0, brickT, [sideW / 1.6, D0 / 0.8]);
      wallPiece(sideW, H - D0, s * (DW / 2 + sideW / 2), D0 + (H - D0) / 2, R.Z0, 0, corrT, [sideW / 1.2, (H - D0) / 2.4]);
    }
    wallPiece(DW, H - DH, 0, DH + (H - DH) / 2, R.Z0, 0, corrT, [DW / 1.2, (H - DH) / 2.4]);
    // the back wall's outside face (seen from the alley)
    const outW = new THREE.Mesh(new THREE.PlaneGeometry(R.X1 - R.X0, H), mat({ map: brickT, rep: [(R.X1 - R.X0) / 1.6, H / 0.8] })); outW.position.set(0, H / 2, R.Z0 - 0.02); outW.rotation.y = PI;
    const holeL = new THREE.Group(); G.add(holeL);
    for (const s of [-1, 1]) { const p = new THREE.Mesh(new THREE.PlaneGeometry(sideW, H), mat({ map: brickT, rep: [sideW / 1.6, H / 0.8] })); p.position.set(s * (DW / 2 + sideW / 2), H / 2, R.Z0 - 0.02); p.rotation.y = PI; holeL.add(p); }
    { const p = new THREE.Mesh(new THREE.PlaneGeometry(DW, H - DH), mat({ map: brickT, rep: [DW / 1.6, (H - DH) / 0.8] })); p.position.set(0, DH + (H - DH) / 2, R.Z0 - 0.02); p.rotation.y = PI; holeL.add(p); }
    // the ceiling and its trusses
    const ceil = new THREE.Mesh(new THREE.PlaneGeometry(R.X1 - R.X0, R.Z1 - R.Z0), M(0x26302e, { unlit: 0.3 })); ceil.rotation.x = PI / 2; ceil.position.set(0, H, (R.Z0 + R.Z1) / 2); G.add(ceil);
    const steel = M(0x3a4446, { unlit: 0.1 });
    for (let z = R.Z0 + 2; z < R.Z1; z += 4) G.add(at(box(R.X1 - R.X0, 0.3, 0.2, steel), 0, H - 0.3, z));
    // steel columns (clear of the floor's middle)
    for (const [x, z] of [[-6.6, -4.2], [6.6, -4.2], [-6.6, 2.8], [6.6, 2.8], [-6.6, 7.6], [6.6, 7.6]]) { G.add(at(box(0.32, H, 0.32, steel), x, H / 2, z)); G.add(at(box(0.36, 0.5, 0.36, mat({ map: hazardT })), x, 0.25, z)); }
    // the door: a hazard-striped frame, the roll-up door's slats, the drum box over it, the BAY 3 sign
    for (const s of [-1, 1]) G.add(at(box(0.22, DH, 0.24, mat({ map: hazardT, rep: [1, DH / 0.6] })), s * (DW / 2 + 0.11), DH / 2, R.Z0 + 0.1));
    G.add(at(box(DW + 0.44, 0.26, 0.24, mat({ map: hazardT, rep: [DW / 0.6, 1] })), 0, DH + 0.13, R.Z0 + 0.1));
    G.add(at(box(DW + 0.3, 0.55, 0.55, M(0x4a5254)), 0, DH + 0.55, R.Z0 + 0.3));
    const slats = at(box(DW, DH, 0.06, mat({ map: slatT, rep: [DW / 1.2, DH / 0.6] })), 0, DH / 2, R.Z0 + 0.04); G.add(slats);
    const flapP = at(new THREE.Group(), 0, 0.72 - DH / 2, 0.05); slats.add(flapP);   // the dog flap: hinged at its top edge, 0.72 m up the door
    flapP.add(at(box(0.78, 0.7, 0.04, M(0x3a4244)), 0, -0.35, 0)); flapP.add(at(box(0.84, 0.06, 0.06, M(0x2a2a2a)), 0, 0, 0));
    slats.add(at(box(0.9, 0.78, 0.065, M(0x1a1e20)), 0, 0.36 - DH / 2, 0.0));   // its dark frame
    const bay = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 0.4), mat({ map: bayT, unlit: 0.5 })); bay.position.set(0, DH + 1.15, R.Z0 + 0.02); G.add(bay);
    // the alley outside: wet asphalt, brick side walls, bins, the chain-link fence in smoke, a street lamp behind it
    const [ax0, ax1, az0, az1] = R.ALLEY;
    G.add(flat(ax1 - ax0, az1 - az0, mat({ map: asphaltT, rep: [(ax1 - ax0) / 2, (az1 - az0) / 2], unlit: 0.3 }), (ax0 + ax1) / 2, -0.01, (az0 + az1) / 2));
    for (const [x, z, s] of [[-1.4, -9.5, 1.3], [1.8, -11.4, 1.0], [-0.3, -14.5, 1.6]]) G.add(flat(s, s * 0.6, glow(0x3a6a70, 0.35), x, -0.004, z));   // puddles catching the lamp
    for (const s of [-1, 1]) { const w = new THREE.Mesh(new THREE.PlaneGeometry(az1 - az0, 7), mat({ map: brickT, rep: [(az1 - az0) / 1.6, 7 / 0.8], unlit: 0.3 })); w.position.set(s * ax1, 3.5, (az0 + az1) / 2); w.rotation.y = -s * PI / 2; G.add(w); }
    const back = new THREE.Mesh(new THREE.PlaneGeometry(ax1 - ax0, 9), mat({ color: 0x3a5a5c, unlit: 0.6 }));   // the smoky night beyond the fence back.position.set(0, 4.5, az0); G.add(back);
    const fence = new THREE.Mesh(new THREE.PlaneGeometry(ax1 - ax0, 3.4), mat({ map: fenceT, rep: [(ax1 - ax0) / 0.35, 3.4 / 0.35], transparent: true, alphaTest: 0.4, side: THREE.DoubleSide })); fence.position.set(0, 1.7, R.FENCE_Z); G.add(fence);
    for (let x = ax0 + 0.5; x <= ax1; x += 2.5) G.add(at(cyl(0.04, 0.04, 3.5, 5, M(0x8a9498)), x, 1.75, R.FENCE_Z));
    G.add(at(box(ax1 - ax0, 0.05, 0.05, M(0x8a9498)), 0, 3.4, R.FENCE_Z));
    const lampG = at(new THREE.Group(), R.LAMP[0], 0, R.LAMP[2]); G.add(lampG);
    lampG.add(at(cyl(0.06, 0.08, R.LAMP[1], 5, M(0x2a3032)), 0, R.LAMP[1] / 2, 0)); lampG.add(at(ico(0.28, 1, glow(0xfff2c8)), 0, R.LAMP[1] + 0.1, 0));
    const smokeM = mat({ color: 0xa8c4c0, unlit: 0.7, see: 0.72 }), smoke = [];
    for (let i = 0; i < 9; i++) { const p = ico(0.9 + hash(i, 2) * 0.6, 1, smokeM); p.scale.set(1.6, 0.6, 1); smoke.push(p); G.add(p); }
    for (const [x, z] of [[-4.6, -9.0], [-4.9, -10.3], [4.7, -8.6]]) { G.add(at(cyl(0.32, 0.28, 0.9, 8, M(0x5a6a5a)), x, 0.45, z)); G.add(at(cyl(0.34, 0.34, 0.06, 8, M(0x4a5a4a)), x, 0.92, z)); }
    G.add(at(box(1.8, 1.3, 1.1, M(0x2e5a3a)), 4.6, 0.65, -11.6));   // a dumpster
    // inside: crates, oil drums, a forklift, the gantry, hanging lamps, teal tubes
    const crateM = mat({ map: crateT });
    for (const [x, z, n] of [[-7.9, -5.6, 3], [-7.9, -4.1, 2], [7.9, -5.5, 2], [-7.8, 5.4, 2], [7.9, 6.2, 3], [-6.1, -5.9, 1]]) for (let i = 0; i < n; i++) G.add(at(box(1.1, 1.0, 1.1, crateM), x + (i % 2) * 0.08, 0.5 + i * 1.0, z));
    const drumC = [0xb83a2a, 0x2a5aa8, 0x3a8a4a, 0xb83a2a];
    for (const [x, z, i] of [[7.6, -2.8, 0], [8.2, -1.9, 1], [7.5, -1.4, 2], [-8.1, 1.4, 3], [-7.6, 2.1, 1], [-8.2, 3.0, 0]]) { G.add(at(cyl(0.36, 0.36, 1.0, 10, M(drumC[i], { unlit: 0.12 })), x, 0.5, z)); G.add(at(cyl(0.37, 0.37, 0.05, 10, M(0x2a2a2a)), x, 0.75, z)); }
    const fork = at(new THREE.Group(), 7.4, 0, 3.6); fork.rotation.y = -PI / 2; G.add(fork);
    fork.add(at(box(1.1, 0.8, 1.8, M(0xe8a820, { unlit: 0.2 })), 0, 0.6, 0)); fork.add(at(box(1.0, 0.06, 1.0, M(0x2a2a2a)), 0, 1.9, -0.3));
    for (const s of [-1, 1]) { fork.add(at(box(0.08, 1.8, 0.08, M(0x2a2a2a)), s * 0.45, 1.0, -0.7)); fork.add(at(box(0.1, 2.4, 0.1, M(0x3a3a3a)), s * 0.35, 1.2, 0.95)); fork.add(at(box(0.12, 0.06, 0.9, M(0x8a8a8a)), s * 0.25, 0.1, 1.4)); }
    for (const [x, z] of [[-0.5, 0.6], [0.5, -0.5], [0.5, 1.4], [-0.5, -0.4]]) { const wh = at(cyl(0.22, 0.22, 0.16, 8, M(0x1a1a1a)), x, 0.22, z); wh.rotation.z = PI / 2; fork.add(wh); }
    const gant = at(new THREE.Group(), -7.6, 3.2, -2); G.add(gant);
    gant.add(at(box(2.6, 0.12, 8.0, steel), 0, 0, 0)); gant.add(at(box(0.06, 1.0, 8.0, M(0xd8b020, { unlit: 0.2 })), 1.28, 0.55, 0)); gant.add(at(box(0.06, 0.06, 8.0, M(0xd8b020, { unlit: 0.2 })), 1.28, 1.05, 0));
    for (const z of [-3.8, 0, 3.8]) gant.add(at(box(0.15, 3.2, 0.15, steel), 1.2, -1.6, z));
    const bulbs = [];
    for (const [x, z] of [[-3.2, -2.4], [3.2, -2.4], [0, 0.6], [-3.2, 3.6], [3.2, 3.6]]) {
      G.add(at(cyl(0.012, 0.012, H - 4.6, 3, M(0x1a1a1a)), x, 4.6 + (H - 4.6) / 2, z));
      const shade = at(cone(0.45, 0.32, 8, M(0x2a3e3c, { unlit: 0.15 })), x, 4.6, z); shade.rotation.x = PI; G.add(shade);   // rotate the shade, not the map (G.add returns G)
      const b = at(ico(0.12, 1, glow(0xfff0c0)), x, 4.42, z); G.add(b); bulbs.push(b);
    }
    for (const [x, z, ry] of [[R.X0 + 0.04, -2.0, PI / 2], [R.X0 + 0.04, 4.0, PI / 2], [R.X1 - 0.04, -2.0, -PI / 2], [R.X1 - 0.04, 4.0, -PI / 2]]) { const tb = at(box(2.4, 0.12, 0.08, glow(0x5af0d8, 0.95)), x, 3.6, z); tb.rotation.y = ry; G.add(tb); }

    // ---------- the gangs: box-pet alley cats (0-3) and bunnies (4-7) ----------
    const CAT_FUR = [0x9a9aa4, 0xe8a058, 0x3a3a40, 0xf2eee6], BUN_FUR = [0xf2eee6, 0xa87a54, 0x8a8a92, 0xd8c8b8];
    function gangPet(i) {
      const cat = i < 4, fur = cat ? CAT_FUR[i] : BUN_FUR[i - 4], Fm = M(fur);
      const J = cat ? M(0x1e1e22, { unlit: 0.12 }) : M(0x6a4aa8, { unlit: 0.2 });
      const g = new THREE.Group(), body = new THREE.Group(); g.add(body);
      const legs = [-1, 1].map(sx => { const l = at(new THREE.Group(), sx * 0.1, 0.3, 0); l.add(at(box(0.13, 0.3, 0.13, M(cat ? 0x2a3a5a : 0x2a2a30)), 0, -0.15, 0)); body.add(l); return l; });
      body.add(at(box(0.4, 0.38, 0.28, J), 0, 0.5, 0));
      body.add(at(box(0.16, 0.36, 0.01, M(cat ? 0xf4f4f0 : 0xe8d8f0)), 0, 0.5, 0.142));   // the t-shirt in the open jacket
      if (cat) for (const sx of [-1, 1]) body.add(at(box(0.02, 0.3, 0.01, glow(0xc8c8d0, 0.5)), sx * 0.1, 0.5, 0.145));   // the zips
      if (cat && i % 2 === 0) { const bd = at(cone(0.1, 0.12, 4, M(0xd82a2a, { unlit: 0.3 })), 0, 0.66, 0.13); bd.rotation.x = PI; body.add(bd); }   // a red bandana
      const arms = [-1, 1].map(sx => { const a = at(new THREE.Group(), sx * 0.23, 0.64, 0); a.add(at(box(0.09, 0.28, 0.09, J), 0, -0.12, 0)); a.add(at(box(0.08, 0.08, 0.08, Fm), 0, -0.28, 0)); body.add(a); return a; });
      const head = at(new THREE.Group(), 0, 0.92, 0); body.add(head);
      const skull = ico(0.24, 1, Fm); skull.scale.set(1, 0.9, 0.92); head.add(skull);
      const snout = at(ico(0.09, 1, M(0xf0e6d8)), 0, -0.07, 0.19); snout.scale.set(1.1, 0.75, 0.8); head.add(snout);
      head.add(at(ico(0.03, 0, M(cat ? 0xe87a8a : 0x5a3a3a)), 0, -0.03, 0.27));
      for (const e of [-1, 1]) {
        head.add(at(ico(0.04, 0, M(cat ? 0x8ac83a : 0x0e0e0e, { unlit: cat ? 0.5 : 0 })), e * 0.1, 0.05, 0.19)); head.add(at(ico(0.012, 0, glow(0xffffff)), e * 0.1 + 0.012, 0.065, 0.225));
        if (cat) { head.add(rot(at(cone(0.1, 0.2, 4, Fm), e * 0.14, 0.26, 0), 0, 0, -e * 0.3)); head.add(rot(at(cone(0.05, 0.1, 4, M(0xe8a0a8)), e * 0.14, 0.25, 0.03), 0, 0, -e * 0.3)); }
        else { const ear = rot(at(box(0.08, 0.36, 0.05, Fm), e * 0.09, 0.38, 0), 0, 0, -e * 0.12); head.add(ear); ear.add(at(box(0.04, 0.26, 0.01, M(0xe8a0b0)), 0, 0.01, 0.028)); }
        if (cat) { const br = at(box(0.08, 0.025, 0.02, M(0x1a1a1a)), e * 0.1, 0.13, 0.2); br.rotation.z = e * 0.4; head.add(br); }   // the scowl
      }
      if (!cat) head.add(at(box(0.07, 0.06, 0.02, glow(0xffffff, 0.6)), 0, -0.13, 0.24));   // the buck teeth
      const mouth = at(box(0.1, 0.07, 0.02, M(0x5a1a1a)), 0, -0.14, 0.25); mouth.visible = false; head.add(mouth);
      return { g, body, head, arms, legs, mouth, i, cat };
    }
    const pets = Array.from({ length: 8 }, (_, i) => { const q = gangPet(i); G.add(q.g); return q; });
    // ---------- the things thrown, the pile, the hearts ----------
    const flying = Array.from({ length: 12 }, () => { const h = new THREE.Group(); h.visible = false; G.add(h); return h; });
    const flyMesh = {}, getMesh = (slot, kind) => { const key = slot + ':' + kind; if (!flyMesh[key]) { flyMesh[key] = fetchMesh(K, kind); flying[slot].add(flyMesh[key]); } return flyMesh[key]; };
    const piles = Array.from({ length: 16 }, () => { const h = new THREE.Group(); h.visible = false; G.add(h); return h; });
    const pileMesh = {}, getPile = (slot, kind) => { const key = slot + ':' + kind; if (!pileMesh[key]) { pileMesh[key] = fetchMesh(K, kind); piles[slot].add(pileMesh[key]); } return pileMesh[key]; };
    const heartM = M(0xff4f9a, { unlit: 0.8 }), hearts = [];
    for (let i = 0; i < 12; i++) { const h = new THREE.Group(); h.add(at(ico(0.1, 0, heartM), -0.075, 0, 0)); h.add(at(ico(0.1, 0, heartM), 0.075, 0, 0)); h.add(rot(at(cone(0.125, 0.18, 4, heartM), 0, -0.11, 0), PI, 0, 0)); h.visible = false; G.add(h); hearts.push(h); }

    return {
      group: G, sky: null, shadowCol: 0x1c2422, indoor: true,
      light() { lights(0x7aaaa4, 0xc8f4ea, [0.3, -0.9, 0.25], 0x24403e, [13, 44], 8); },
      anim(t, P = {}) {
        const s = shotT(t, P), bt = beat(t), alley = P.zone === 'alley';
        // the light: teal key and fog, the lamps' warm pools, the alley's backlight through the door
        lights(alley ? 0x5a7a88 : 0x7aaaa4, alley ? 0x9acae0 : 0xc8f4ea, [0.3, -0.9, 0.25], 0x24403e, alley ? [9, 34] : [13, 44], 8);
        pt(0, 0, 4.0, 1.2, 1.6, 1.35, 0.95); pt(1, -3.2, 4.0, 3.4, 0.7, 1.2, 1.1); pt(2, 3.2, 4.0, -2.2, 0.7, 1.2, 1.1);
        pt(3, R.LAMP[0], R.LAMP[1], R.LAMP[2] + 3.5, 1.8, 1.55, 1.15);
        if (P.key) pt(1, P.key[0], P.key[1], P.key[2], P.key[3], P.key[4], P.key[5]);
        bulbs.forEach((b, i) => b.scale.setScalar(1 + 0.08 * Math.sin(t * 17 + i * 3)));
        smoke.forEach((p, i) => { const u = fr(t * 0.03 + hash(i, 3)); p.position.set(-5 + 10 * hash(i, 4) + Math.sin(t * 0.2 + i) * 0.6, 0.3 + 1.4 * hash(i, 5), R.FENCE_Z - 3.0 + 3.6 * u); });   // behind the fence and just in front of it: nearer, it veiled the alley's lenses
        // the door: 1 rolled up, 0 shut
        const open = ramp(P.door, s, 1); slats.position.y = R.DOOR_H / 2 + R.DOOR_H * open; slats.visible = open < 0.98;
        const fe = P.flap != null ? s - P.flap : -1; flapP.rotation.x = fe < 0 ? 0 : -1.25 * Math.max(0, Math.sin(Math.min(fe / 0.5, 1) * PI * 0.5)) * (fe < 1.2 ? 1 : Math.max(0, 1 - (fe - 1.2) / 0.4));   // pushed in from outside, falling shut
        // the gangs
        const modes = P.gmode || [...Array(4).fill(P.cats ?? 'square'), ...Array(4).fill(P.buns ?? 'square')];
        pets.forEach((q, i) => {
          const mode = modes[i]; q.g.visible = !!mode; if (!mode) return;
          const sp = (P.gspots || [])[i] || (q.cat ? R.CAT_SPOTS[i] : R.BUN_SPOTS[i - 4]);
          let x = sp[0], z = sp[1];
          if (cleared(P, x, z)) { q.g.visible = false; return; }
          q.body.position.set(0, 0, 0); q.body.rotation.set(0, 0, 0); q.body.scale.set(1, 1, 1); q.head.rotation.set(0, 0, 0); q.mouth.visible = false;
          q.arms.forEach(a => a.rotation.set(0, 0, 0)); q.legs.forEach(l => l.rotation.set(0, 0, 0));
          const tg = P.gface || (q.cat ? [x + 4, z] : [x - 4, z]);
          let yaw = Math.atan2(tg[0] - x, tg[1] - z);
          const ph = bt + (i % 4) * 0.11, hit = Math.exp(-fr(ph) * 5);
          q.g.position.set(x, 0, z);
          if (mode === 'tired') {   // flat on the back, the head towards gyaw, the chest heaving, the arms flopped out
            const gy = (P.gyaw || [])[i]; yaw = gy != null ? gy * PI / 180 : yaw;
            q.g.rotation.y = yaw; q.body.rotation.x = -PI / 2; q.body.position.set(0, 0.16, -0.5);
            q.body.scale.set(1, 1, 1 + 0.08 * Math.abs(Math.sin(t * 7 + i)));
            q.arms.forEach((a, j) => { a.rotation.z = (j ? 1 : -1) * 1.3; }); q.legs.forEach((l, j) => { l.rotation.z = (j ? -1 : 1) * 0.35; });
            q.mouth.visible = true; return;
          }
          q.g.rotation.y = yaw;
          if (P.stare && mode !== 'point') { const a = Math.atan2(P.stare[0] - x, P.stare[1] - z) - yaw; q.head.rotation.y = Math.max(-1.1, Math.min(1.1, Math.atan2(Math.sin(a), Math.cos(a)))); }
          if (mode === 'square') { q.body.position.y = 0.025 * Math.abs(Math.sin(ph * PI)); q.arms.forEach((a, j) => { a.rotation.x = -1.25 - 0.1 * hit; a.rotation.z = (j ? 1 : -1) * 0.2; }); }
          else if (mode === 'claw') { q.arms.forEach((a, j) => { a.rotation.x = -2.5 + 0.9 * hit; a.rotation.z = (j ? 1 : -1) * 0.35; }); q.mouth.visible = true; q.body.rotation.x = 0.12 * hit; }
          else if (mode === 'stomp') { const up = Math.sin(Math.PI * Math.min(1, fr(ph) / 0.8)); q.legs[1].rotation.x = 1.3 * up; q.legs[0].rotation.x = -0.15 * up; q.body.position.y = 0.12 * up; q.body.rotation.x = 0.22 * up; q.arms.forEach((a, j) => { a.rotation.x = 0.15; a.rotation.z = (j ? 1 : -1) * 0.12; }); q.mouth.visible = true; }   // a thump: up off the floor, one hind foot raised, slammed down on the beat
          else if (mode === 'point') { const pa = P.pointAt || R.DOOR; let la = Math.atan2(pa[0] - x, pa[1] - z) - yaw; la = Math.atan2(Math.sin(la), Math.cos(la)); const j = la > 0 ? 1 : 0; q.arms[j].rotation.set(-0.35 * Math.cos(la), 0, (j ? 1 : -1) * 1.45); q.arms[1 - j].rotation.z = (j ? -1 : 1) * 0.15; q.head.rotation.y = Math.max(-1.0, Math.min(1.0, la * 0.7)); q.mouth.visible = true; }   // the arm on the door's side held out sideways at it (pointed at the lens, an arm foreshortened to nothing)
          else if (mode === 'throw') { const u = fr(bt), w = u < 0.45 ? 0 : u < 0.7 ? (u - 0.45) / 0.25 : u < 0.9 ? 1 : 1 - (u - 0.9) / 0.1; q.arms[1].rotation.x = -2.9 + 1.7 * w; q.arms[0].rotation.x = -0.5 - 0.3 * w; q.body.rotation.x = -0.12 + 0.24 * w; q.legs[0].rotation.x = -0.3; }   // in sync: up and back off the beat, whipped forward-up on it
          else if (mode === 'stare') { q.mouth.visible = true; q.arms.forEach((a, j) => { a.rotation.z = (j ? 1 : -1) * 0.15; }); }
          else if (mode === 'pant') { q.body.rotation.x = 0.78 + 0.07 * Math.sin(t * 9 + i); q.body.position.y = -0.04; q.arms.forEach((a, j) => { a.rotation.x = 0.55; a.rotation.z = (j ? 1 : -1) * 0.12; }); q.head.rotation.x = -0.55; q.mouth.visible = true; }   // bent double, paws on the knees
          else if (mode === 'dance') { const up = Math.abs(Math.sin(ph * PI)); q.body.position.y = 0.06 * up; q.body.rotation.z = 0.12 * Math.sin(ph * PI); q.arms.forEach((a, j) => { a.rotation.x = -0.4 - 0.4 * up; a.rotation.z = (j ? 1 : -1) * (0.5 + 0.3 * up); }); q.legs.forEach((l, j) => { l.rotation.x = 0.35 * Math.sin(ph * PI + j * PI); }); }
          else if (mode === 'cheer') { q.arms.forEach((a, j) => { a.rotation.z = (j ? 1 : -1) * 2.45; }); q.mouth.visible = true; q.body.position.y = 0.05 * Math.abs(Math.sin(bt * PI)); }
        });
        // the things thrown: a parabola from p0 to p1 over dur, spinning, then lying where they landed
        flying.forEach(h => { h.visible = false; });
        (P.throws || []).slice(0, 12).forEach((q, j) => {
          const [s0, kind, x0, y0, z0, x1, y1, z1, dur = 0.7, arc = 1.2, caught = false] = q, e = s - s0; if (e < 0 || !FETCH.includes(kind) || (caught && e >= dur)) return;   // caught: gone on arrival (it's in the jaws now)
          const h = flying[j]; Object.values(h.children).forEach(c => { c.visible = false; }); const m = getMesh(j, kind); m.visible = true; h.visible = true;
          const u = Math.min(1, e / dur);
          h.position.set(x0 + (x1 - x0) * u, y0 + (y1 - y0) * u + arc * 4 * u * (1 - u), z0 + (z1 - z0) * u);
          const flat = kind === 'fish' || kind === 'frisbee', dir = Math.atan2(x1 - x0, z1 - z0);
          if (u < 1) { if (flat) h.rotation.set(0.15 * Math.sin(e * 12), dir, 0.2 * Math.sin(e * 9)); else h.rotation.set(e * 9 + j, e * 5, e * 3); } else h.rotation.set(0, flat ? dir : j * 1.3, 0);   // a tumbling fish read as a club
          h.scale.setScalar(1.25);
        });
        // the pile of fetched things on the floor
        piles.forEach(h => { h.visible = false; });
        (P.pile || []).slice(0, 16).forEach(([x, z, kind, yw = 0], j) => {
          if (!FETCH.includes(kind)) return; const h = piles[j]; Object.values(h.children).forEach(c => { c.visible = false; });
          getPile(j, kind).visible = true; h.visible = true; h.position.set(x, kind === 'ball' || kind === 'yarn' ? 0.13 : 0.06, z); h.rotation.set(0, yw * PI / 180, 0); h.scale.setScalar(1.25);
        });
        // hearts over points: three pink hearts popping and rising (looping when q[4])
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

  return { rumble: rumble() };
}
