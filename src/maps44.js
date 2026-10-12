// maps44.js: the "Everybody Wants To Rule The World" maps (2026-10-12 2nd, Tears For Fears; the clip: a dark green 1960s
// British roadster driving through the California desert, a roadside gas station with a red pump where two men in
// tuxedos dance, a diner under an EAT sign, a phone booth, an Airstream trailer, palms and telephone poles, dune buggies,
// and the drive into a pink-orange sunset with the headlights on). Same contract as the other map files, pure in t:
//   mojave      the gas station in the desert on a golden afternoon (MOJAVE): the forecourt slab (y = 0) between the
//               highway (ROAD z0..z1, the centre line at ROAD.mid) and the diner (DINER: its front wall at DINER.z1, the
//               door DOOR [x, z], `dinerDoor` 0..1 or a ramp, the EAT sign on its pole at EAT); the pump island
//               (ISLAND, its two red vintage pumps PUMPS, facing +z; `nozzle` [i]: pump i's nozzle out of its holster);
//               the price board PRICE, the phone booth PHONE, the Airstream trailer AIRSTREAM, palms, Joshua trees,
//               telephone poles, mountains. The roadster (`car` { x, z, yaw, to: [x1, z1], at, dur, lin } or false;
//               parked at CAR_PARK by default nose to -x (yaw 180: its driver's side on +z, to the road and the lenses; the passenger's side and the filler by the pumps); `rumble` (true or s:
//               the engine on, the body shaking), `exhaust` (true or s: puffs from the tailpipe on the half beat),
//               a dust cloud behind its rear wheels while it moves (`carDust` false: none)). Box-pet locals (`pets`
//               'idle' | 'stare' | 'cheer' | 'wave' | 'dance' | false, `spots` [[x, z] | null], `stare` [x, z]); `dust`
//               [[x, z, s, size]]; `hearts` [[x, y, z, s0, loop]] + `heartYaw`; `key`; `clear` [[x, z, r]]; `noguests`.
//   mojaveroad  the desert highway at sunset streaming past the still roadster at the origin (nose to +x, its lane
//               z -1.7..1.7): telephone poles, Joshua trees, saguaros, rocks, a billboard, mountain ranges; the sun low
//               behind the car (-x), its headlights on. `speed` (m/s, default ROADWAY.SPEED), `still`; `rumble`,
//               `hearts`, `heartYaw`, `key`.
// The roadster (`roadster()`, both maps): a dark green open two-seater (CAR: length L, width W, the seats SEAT_Y high at
// DRIVER / PASS in the car's frame: x along the nose, z across, the driver on -z), a long bonnet (its top BONNET_Y over
// BONNET x0..x1: a sitter there takes `lift` BONNET_Y), wire wheels, round chrome headlamps, a low chrome windscreen
// frame (a tall one crosses a seated chibi's face) with a faint pane, the steering wheel under the driving clip's paws
// (WHEEL), the filler cap at FILLER (rear, driver's side). A rider on a moving car is an actor on the same linear
// `mx`/`mz` (`lin`), like the Espresso police car.
import { mapKit } from './mapkit.js';

export const MOJAVE = {
  FORE: [-9.5, 9.5, -3.8, 4.6],               // the forecourt slab: x0, x1, z0, z1
  ROAD: { z0: 5.0, z1: 11.4, mid: 8.2 },
  ISLAND: [0.6, -1.25, 3.8, 0.8, 0.14],      // centre x, z, length (x), depth (z), height
  PUMPS: [[-0.45, -1.25], [1.65, -1.25]],
  DINER: { x0: -10.5, x1: -2.0, z0: -8.6, z1: -3.8, H: 3.5 }, DOOR: [-2.95, -3.8], DOOR_W: 1.25,
  EAT: [-1.35, -4.45], PRICE: [6.2, -2.4], PHONE: [4.3, -3.2], AIRSTREAM: [8.2, -6.4],
  CAR_PARK: [0.35, 0.95],
  TABLE: [-6.6, -2.7],
};
export const CAR = { L: 3.9, W: 2.0, SEAT_Y: 0.45, DRIVER: [-0.18, -0.5], PASS: [-0.18, 0.5], WHEEL: [0.1, 0.85, -0.46], BONNET: [0.4, 1.9], BONNET_Y: 0.74, FILLER: [-1.6, 0.66, 0.98], TAIL: [-1.98, 0.22, 0.55] };
export const ROADWAY = { SPEED: 14, LANE: [-1.7, 1.7], MID: -1.7, ROAD: [-5.1, 2.6] };

export function buildMojaveMaps(K) {
  const k = mapKit(K);
  const { THREE, mat, tex, px, noise, box, TAU, PI, beat, cyl, cone, ico, sph, at, rot, flat, lights, pt, hash, sign } = k;
  const M = (c, o = {}) => mat({ color: c, ...o }), glow = (c, u = 1) => mat({ color: c, unlit: u });
  const cl = x => Math.max(0, Math.min(1, x));
  const sm = x => { const u = cl(x); return u * u * (3 - 2 * u); };
  const pmod = (a, n) => ((a % n) + n) % n;
  const cleared = (P, x, z) => (P.clear || []).some(([cx, cz, r]) => (x - cx) ** 2 + (z - cz) ** 2 < r * r);
  const ramp = (v, s, d = 0) => v == null ? d : Array.isArray(v) ? v[2] + (v[3] - v[2]) * sm((s - v[0]) / Math.max(0.01, v[1] - v[0])) : (v === true ? 1 : v === false ? 0 : v);
  const from = (v, s) => v === true || (typeof v === 'number' && s >= v);
  const shotT = (t, P) => P.t0 != null ? t - P.t0 : 0;
  const CHROME = M(0xd8dce4, { unlit: 0.25 });

  // ---------- textures ----------
  const sandT = tex(32, 32, (x, r) => { px(x, '#d8b47a', 0, 0, 32, 32); noise(x, r, 32, 32, ['#d0aa70', '#e0bc84', '#c8a068', '#dcb880'], 220); }, 4401);
  const slabT = tex(32, 32, (x, r) => { px(x, '#c8c0b0', 0, 0, 32, 32); noise(x, r, 32, 32, ['#c0b8a8', '#d0c8b8', '#bcb4a2'], 120); px(x, '#a8a090', 0, 0, 32, 1); px(x, '#a8a090', 0, 0, 1, 32); }, 4402);
  const roadT = tex(16, 16, (x, r) => { px(x, '#4a4a50', 0, 0, 16, 16); noise(x, r, 16, 16, ['#444448', '#525258', '#4e4c50'], 40); }, 4403);
  const dashT = tex(16, 4, x => { px(x, '#4a4a50', 0, 0, 16, 4); px(x, '#f0c43a', 0, 1, 8, 2); }, 4404);
  const stuccoT = tex(32, 32, (x, r) => { px(x, '#f0e2c8', 0, 0, 32, 32); noise(x, r, 32, 32, ['#ecdcc0', '#f4e6ce', '#e6d6ba'], 90); }, 4405);
  const eatT = tex(32, 64, x => { px(x, '#f8f4ea', 0, 0, 32, 64); px(x, '#d82a2a', 0, 0, 32, 2); px(x, '#d82a2a', 0, 62, 32, 2); px(x, '#d82a2a', 0, 0, 2, 64); px(x, '#d82a2a', 30, 0, 2, 64); x.fillStyle = '#d82a2a'; x.font = 'bold 16px monospace'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('E', 16, 14); x.fillText('A', 16, 32); x.fillText('T', 16, 50); }, 4406);
  const dinerT = sign('DINER', '#2a8a7a', '#fff4d8', 64, 16);
  const priceT = tex(32, 48, x => { px(x, '#f4f0e6', 0, 0, 32, 48); px(x, '#c8322a', 0, 0, 32, 10); x.fillStyle = '#ffffff'; x.font = 'bold 8px monospace'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('GAS', 16, 5); x.fillStyle = '#1a1a1a'; x.font = 'bold 9px monospace'; x.fillText('1.09', 16, 19); x.fillText('1.19', 16, 30); x.fillText('1.05', 16, 41); }, 4407);
  const dialT = tex(16, 16, x => { px(x, '#f8f8f2', 0, 0, 16, 16); px(x, '#1a1a1a', 2, 3, 12, 1); px(x, '#1a1a1a', 2, 8, 12, 1); px(x, '#1a1a1a', 2, 12, 12, 1); px(x, '#c8322a', 7, 2, 2, 12); }, 4408);
  const winT = tex(16, 16, (x, r) => { px(x, '#ffd890', 0, 0, 16, 16); noise(x, r, 16, 16, ['#ffe0a0', '#f8c878'], 30); px(x, '#c89850', 0, 7, 16, 1); }, 4409);
  const spokeT = tex(16, 16, x => { px(x, '#1a1a1e', 0, 0, 16, 16); x.strokeStyle = '#d8dce4'; x.lineWidth = 1; for (let i = 0; i < 8; i++) { const a = i / 8 * TAU; x.beginPath(); x.moveTo(8, 8); x.lineTo(8 + Math.cos(a) * 6, 8 + Math.sin(a) * 6); x.stroke(); } x.fillStyle = '#d8dce4'; x.beginPath(); x.arc(8, 8, 2, 0, TAU); x.fill(); x.strokeStyle = '#a0a4ac'; x.beginPath(); x.arc(8, 8, 6.4, 0, TAU); x.stroke(); }, 4410);
  const greenT = tex(16, 16, (x, r) => { px(x, '#1f4a34', 0, 0, 16, 16); noise(x, r, 16, 16, ['#1c4430', '#245238'], 20); px(x, '#2e6a48', 0, 0, 16, 1); }, 4411);
  const rockT = tex(16, 16, (x, r) => { px(x, '#a0705a', 0, 0, 16, 16); noise(x, r, 16, 16, ['#946450', '#ac7c62', '#8a5c48'], 60); }, 4412);
  const boothT = tex(16, 16, x => { px(x, '#9ad8e8', 0, 0, 16, 16); px(x, '#c8eef6', 2, 2, 4, 12); }, 4414);
  const silverT = tex(32, 16, x => { px(x, '#c8ccd2', 0, 0, 32, 16); for (let i = 0; i < 32; i += 4) px(x, '#b0b4bc', i, 0, 1, 16); px(x, '#e8eaee', 0, 3, 32, 1); }, 4415);

  // ---------- the roadster: nose to +x, the driver's side on -z (left-hand drive) ----------
  function roadster() {
    const g = new THREE.Group(), body = new THREE.Group(); g.add(body);
    const GRN = mat({ map: greenT }), SEAT = M(0xc89a62), DASH = M(0x6a4428), TYRE = M(0x1a1a1e), RED = glow(0xd8202a, 0.6);
    const { L, W, BONNET } = CAR, x0 = -L / 2, x1 = L / 2, C0 = -0.82, C1 = 0.36;   // the cabin from C0 to C1
    // the bonnet: a long body, its top rounded by a flattened half cylinder along x; the front wings over the wheels
    body.add(at(box(BONNET[1] - C1 + 0.05, 0.44, W - 0.3, GRN), (BONNET[1] + C1) / 2, 0.42, 0));
    { const top = at(rot(cyl(0.2, 0.2, BONNET[1] - C1, 10, GRN), 0, 0, PI / 2), (BONNET[1] + C1) / 2, 0.6, 0); top.scale.set(1, 1, 3.6); body.add(top); }
    for (const sd of [-1, 1]) body.add(at(box(L * 0.42, 0.42, 0.28, GRN), 1.05, 0.42, sd * (W / 2 - 0.14)));
    body.add(at(box(x1 - BONNET[1] + 0.02, 0.36, W - 0.5, GRN), (x1 + BONNET[1]) / 2, 0.38, 0));
    // the grille: a chrome oval mouth, round headlamps in chrome rings, a chrome bumper
    { const gr = at(rot(cyl(0.2, 0.2, 0.04, 12, M(0x26262a)), 0, 0, PI / 2), x1 + 0.005, 0.44, 0); gr.scale.set(1, 1, 1.6); body.add(gr);
      const gc = at(rot(new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.025, 4, 14), CHROME), 0, PI / 2, 0), x1 + 0.02, 0.44, 0); gc.scale.set(1, 1, 1.6); body.add(gc);
      for (const sd of [-1, 1]) { body.add(at(rot(cyl(0.15, 0.15, 0.06, 12, glow(0xfff2c8, 0.95)), 0, 0, PI / 2), x1 - 0.02, 0.58, sd * 0.62)); body.add(at(rot(new THREE.Mesh(new THREE.TorusGeometry(0.15, 0.025, 4, 12), CHROME), 0, PI / 2, 0), x1, 0.58, sd * 0.62)); }
      body.add(at(box(0.08, 0.1, W - 0.1, CHROME), x1 + 0.06, 0.24, 0)); }
    // the cabin: a tub of low sides (the door tops at 0.78), two tan seats, a wooden dash, the steering wheel
    body.add(at(box(C1 - C0, 0.62, 0.06, GRN), (C0 + C1) / 2, 0.47, W / 2 - 0.03)); body.add(at(box(C1 - C0, 0.62, 0.06, GRN), (C0 + C1) / 2, 0.47, -W / 2 + 0.03));
    body.add(at(box(C1 - C0, 0.06, W - 0.1, M(0x3a2a22)), (C0 + C1) / 2, 0.26, 0));
    for (const sd of [-1, 1]) body.add(at(box(C1 - C0, 0.035, 0.07, CHROME), (C0 + C1) / 2, 0.79, sd * (W / 2 - 0.03)));
    for (const sz of [CAR.DRIVER[1], CAR.PASS[1]]) { body.add(at(box(0.6, 0.12, 0.72, SEAT), CAR.DRIVER[0] + 0.02, CAR.SEAT_Y - 0.06, sz)); body.add(at(box(0.12, 0.5, 0.72, SEAT), C0 + 0.1, CAR.SEAT_Y + 0.2, sz)); }
    body.add(at(box(0.12, 0.12, W - 0.16, DASH), C1 - 0.04, 0.8, 0));
    const wheel = at(new THREE.Mesh(new THREE.TorusGeometry(0.17, 0.022, 4, 12), M(0x2a1a14)), CAR.WHEEL[0], CAR.WHEEL[1], CAR.WHEEL[2]); wheel.rotation.order = 'ZYX'; wheel.rotation.set(0, -PI / 2, -0.55); body.add(wheel);
    body.add(at(rot(cyl(0.02, 0.02, 0.36, 5, M(0x2a1a14)), 0, 0, 1.0), CAR.WHEEL[0] + 0.16, CAR.WHEEL[1] - 0.06, CAR.WHEEL[2]));
    // the windscreen: a low chrome frame and a faint pane (a tall one crosses a seated chibi's face from any front lens)
    for (const sd of [-1, 1]) body.add(at(box(0.035, 0.11, 0.035, CHROME), C1 + 0.02, 0.845, sd * (W / 2 - 0.12)));
    body.add(at(box(0.035, 0.025, W - 0.22, CHROME), C1 + 0.02, 0.9, 0));   // no glass and a lower frame: from the front the pane and a 0.97 m bar hid the paws on the wheel
    // the boot, the tail lamps, the bumper, the filler cap, the exhaust pipe
    body.add(at(box(C0 - x0, 0.46, W - 0.06, GRN), (C0 + x0) / 2, 0.44, 0));
    { const top = at(rot(cyl(0.16, 0.16, C0 - x0, 10, GRN), 0, 0, PI / 2), (C0 + x0) / 2, 0.64, 0); top.scale.set(1, 1, 5.8); body.add(top); }
    for (const sd of [-1, 1]) body.add(at(box(0.04, 0.12, 0.18, RED), x0 - 0.01, 0.55, sd * 0.68));
    body.add(at(box(0.08, 0.1, W - 0.1, CHROME), x0 - 0.05, 0.24, 0));
    body.add(at(rot(cyl(0.07, 0.07, 0.04, 8, CHROME), PI / 2, 0, 0), CAR.FILLER[0], CAR.FILLER[1], CAR.FILLER[2] + 0.01));
    body.add(at(rot(cyl(0.045, 0.045, 0.3, 6, CHROME), 0, 0, PI / 2), CAR.TAIL[0] + 0.12, CAR.TAIL[1], CAR.TAIL[2]));
    // the wheels: black tyres round chrome wire wheels (a spoke disc both sides)
    const spin = [];
    for (const [wx, wz] of [[-1.25, 0.86], [1.28, 0.86], [-1.25, -0.86], [1.28, -0.86]]) {
      const w = at(new THREE.Group(), wx, 0.32, wz); g.add(w); spin.push(w);
      w.add(rot(cyl(0.32, 0.32, 0.22, 12, TYRE), PI / 2, 0, 0));
      for (const sd of [-1, 1]) { const d = at(new THREE.Mesh(new THREE.CircleGeometry(0.22, 12), mat({ map: spokeT, unlit: 0.2 })), 0, 0, sd * 0.115); if (sd < 0) d.rotation.y = PI; w.add(d); }
    }
    // its shadow on the ground: a dark see-through slab under the body
    g.add(flat(L + 0.2, W + 0.1, mat({ color: 0x4a3420, see: 0.45 }), 0, 0.02, 0));
    // the exhaust puffs
    const puffM = mat({ color: 0x8a8a90, unlit: 0.4 }), puffs = [];   // dark grey and opaque: pale or see-through puffs vanished against the sand
    for (let i = 0; i < 8; i++) { const p = ico(0.12, 1, puffM); p.visible = false; g.add(p); puffs.push(p); }
    return { g, body, spin, puffs, wheel };
  }
  function carAnim(C, P, t, s, b, moving) {
    const on = from(P.rumble, s) || moving;
    C.body.position.y = on ? 0.012 * Math.sin(t * 47) + 0.006 * Math.sin(t * 29) : 0;
    C.body.rotation.x = on ? 0.006 * Math.sin(t * 31) : 0;
    const ex = from(P.exhaust, s);
    C.puffs.forEach((p, i) => {
      p.visible = false; if (!ex) return;
      const e = pmod(b * 2 + i / C.puffs.length * 2, 2) / 2; p.visible = true;
      p.position.set(CAR.TAIL[0] - 0.15 - e * 1.7, CAR.TAIL[1] + 0.05 + e * 0.55, CAR.TAIL[2] + 0.45 * e + 0.12 * Math.sin(i * 2.1 + e * 3));   // low behind the tail, drifting away from the driver (risen behind a head it read as an afro)
      p.scale.setScalar(0.8 + e * 2.4);
    });
  }

  // ---------- the box-pet locals of the desert (a trucker in a cap, tourists in loud shirts) ----------
  const FURS = [0xc89a6a, 0x6a6a72, 0xe8dcc8, 0x8a5a3a, 0x3a3434, 0xd8a868];
  const SHIRTS = [0x3a7ad8, 0xf2f2ee, 0xe85a8a, 0x5aa86a, 0xe8a03a, 0x8a5ad8];
  function pet(i) {
    const g = new THREE.Group(), F = M(FURS[i % FURS.length]), SH = M(SHIRTS[i % SHIRTS.length]), kind = i % 3;
    const body = new THREE.Group(); g.add(body);
    body.add(at(box(0.4, 0.24, 0.28, M(0x4a5a8a)), 0, 0.16, 0));
    for (const sx of [-1, 1]) body.add(at(box(0.13, 0.08, 0.15, M(0x5a4a3a)), sx * 0.1, 0.04, 0.02));
    body.add(at(box(0.4, 0.34, 0.28, SH), 0, 0.44, 0));
    if (i % 4 === 1) for (let k2 = 0; k2 < 3; k2++) body.add(at(box(0.07, 0.07, 0.02, M(0xffffff)), -0.12 + k2 * 0.12, 0.48 - (k2 % 2) * 0.08, 0.145));   // a loud shirt's print
    const arms = [-1, 1].map(sx => { const a = at(new THREE.Group(), sx * 0.23, 0.58, 0); a.add(at(box(0.09, 0.3, 0.09, SH), 0, -0.13, 0)); a.add(at(box(0.08, 0.08, 0.08, F), 0, -0.3, 0)); body.add(a); return a; });
    const head = at(new THREE.Group(), 0, 0.84, 0); body.add(head);
    const skull = new THREE.Mesh(new THREE.IcosahedronGeometry(0.24, 1), F); skull.scale.set(1, 0.9, 0.92); head.add(skull);
    const snout = at(new THREE.Mesh(new THREE.IcosahedronGeometry(0.1, 1), M(0xf0e6d8)), 0, -0.07, 0.19); snout.scale.set(1.1, 0.8, 0.9); head.add(snout);
    head.add(at(new THREE.Mesh(new THREE.IcosahedronGeometry(0.035, 0), M(0x151515)), 0, -0.03, 0.28));
    for (const e of [-1, 1]) {
      head.add(at(new THREE.Mesh(new THREE.IcosahedronGeometry(0.038, 0), M(0x0e0e0e)), e * 0.1, 0.05, 0.19));
      head.add(at(new THREE.Mesh(new THREE.IcosahedronGeometry(0.012, 0), glow(0xffffff)), e * 0.1 + 0.012, 0.065, 0.225));
      head.add(kind === 0 ? rot(at(cone(0.08, 0.2, 4, F), e * 0.15, 0.27, 0), 0, 0, -e * 0.25) : kind === 1 ? at(box(0.08, 0.3, 0.06, F), e * 0.1, 0.33, 0) : rot(at(box(0.07, 0.24, 0.16, F), e * 0.24, 0.02, 0), 0, 0, e * 0.3));
    }
    if (i % 3 === 0) { head.add(at(box(0.44, 0.1, 0.42, M(0xd83a2a)), 0, 0.22, -0.02)); head.add(at(box(0.36, 0.03, 0.22, M(0xd83a2a)), 0, 0.17, 0.26)); }   // a trucker's cap
    return { g, body, head, arms, i };
  }
  const poseArms = (p, aL, aR) => p.arms.forEach((a, k2) => { const [rx, rz] = k2 ? aR : aL; a.rotation.set(rx, 0, (k2 ? 1 : -1) * rz); });
  function animPet(p, mode, b, i) {
    const bb = b + i * 0.13, kick = Math.exp(-(bb - Math.floor(bb)) * 5);
    let bob = 0.02 * Math.abs(Math.sin(bb * PI)), headX = 0.04 * Math.abs(Math.sin(bb * PI)), sway = 0;
    let aL = [0.15 * Math.sin(bb * PI), 0.12], aR = [0.15 * Math.sin(bb * PI + PI), 0.12];
    if (mode === 'cheer') { aL = [0.35, 2.45 + 0.25 * Math.sin(bb * TAU)]; aR = [0.35, 2.45 + 0.25 * Math.sin(bb * TAU + 1)]; bob = 0.05 * kick; }
    else if (mode === 'wave') aR = [0.1, 2.5 + 0.35 * Math.sin(bb * TAU)];
    else if (mode === 'dance') { sway = 0.14 * Math.sin(bb * PI / 2); bob = 0.06 * kick; aL = [0.3, 0.5 + 0.3 * kick]; aR = [0.3, 0.5 + 0.3 * kick]; }
    else if (mode === 'stare') { aL = [0, 0.1]; aR = [0, 0.1]; bob = 0; headX = 0; }
    p.body.position.y = bob; p.body.rotation.set(0, 0, sway); p.head.rotation.set(headX, 0, 0);
    poseArms(p, aL, aR);
  }
  function heartSet(G) {
    const heartM = M(0xff4f9a, { unlit: 0.8 }), hearts = [];
    for (let i = 0; i < 15; i++) { const h = new THREE.Group(); h.add(at(ico(0.1, 0, heartM), -0.075, 0, 0)); h.add(at(ico(0.1, 0, heartM), 0.075, 0, 0)); h.add(rot(at(cone(0.125, 0.18, 4, heartM), 0, -0.11, 0), PI, 0, 0)); h.visible = false; G.add(h); hearts.push(h); }
    return (P, s) => hearts.forEach((h, i) => {
      const q = (P.hearts || [])[Math.floor(i / 3)]; h.visible = false; if (!q) return;
      let e = s - q[3] - (i % 3) * 0.3; if (q[4] && e > 0) e %= 1.2;
      if (e < 0 || e > 1.4) return;
      h.visible = true; h.position.set(q[0] + ((i % 3) - 1) * 0.22 + 0.06 * Math.sin(e * 6 + i), q[1] + 0.55 * e, q[2]); h.scale.setScalar(Math.min(1, e * 5) * (1.15 - 0.25 * (e / 1.4)));
      h.rotation.y = (P.heartYaw ?? 0) * PI / 180;
    });
  }
  // desert dressing shared by both maps
  const JT = M(0x5a6a3a), JTT = M(0x6a5a44), SAG = M(0x4a7a44);
  function joshua(s = 1) { const g = new THREE.Group(); g.add(at(cyl(0.12, 0.16, 1.8, 5, JTT), 0, 0.9, 0)); for (const [a, h] of [[0.6, 1.5], [-0.8, 1.7], [2.2, 1.3]]) { const arm = at(new THREE.Group(), 0, h, 0); arm.rotation.set(0, a, 0.7); arm.add(at(cyl(0.08, 0.1, 0.9, 5, JTT), 0, 0.45, 0)); arm.add(at(ico(0.26, 0, JT), 0, 0.95, 0)); g.add(arm); } g.add(at(ico(0.3, 0, JT), 0, 1.9, 0)); g.scale.setScalar(s); return g; }
  function saguaro(s = 1) { const g = new THREE.Group(); g.add(at(cyl(0.2, 0.22, 3.2, 7, SAG), 0, 1.6, 0)); g.add(at(sph(0.2, 7, 4, SAG), 0, 3.2, 0)); for (const sd of [-1, 1]) { const stub = at(cyl(0.13, 0.13, 0.6, 6, SAG), sd * 0.4, 1.3, 0); stub.rotation.z = sd * PI / 2; g.add(stub); g.add(at(cyl(0.13, 0.13, 1.0, 6, SAG), sd * 0.68, 1.8, 0)); } g.scale.setScalar(s); return g; }
  function palm(h = 6) { const g = new THREE.Group(); g.add(at(cyl(0.16, 0.24, h, 6, M(0x7a6248)), 0, h / 2, 0)); for (let i = 0; i < 7; i++) { const f = at(new THREE.Group(), 0, h, 0); f.rotation.set(0, i / 7 * TAU, 0); const lf = at(box(0.3, 0.05, 1.9, M(0x4a7a3a)), 0, -0.3, 0.9); lf.rotation.x = 0.5; f.add(lf); g.add(f); } return g; }
  function pole() { const g = new THREE.Group(); g.add(at(cyl(0.11, 0.13, 8, 5, M(0x6a5038)), 0, 4, 0)); g.add(at(box(0.1, 0.1, 1.9, M(0x6a5038)), 0, 7.5, 0)); for (const z of [-0.8, 0, 0.8]) g.add(at(box(0.06, 0.12, 0.06, M(0x9ad8e0)), 0, 7.62, z)); return g; }
  function rock(s, seed) { const r = new THREE.Mesh(new THREE.IcosahedronGeometry(1, 0), mat({ map: rockT })); r.scale.set(s * (0.8 + hash(seed, 1) * 0.6), s * (0.5 + hash(seed, 2) * 0.4), s * (0.8 + hash(seed, 3) * 0.6)); r.rotation.y = hash(seed, 4) * TAU; return r; }
  function ranges(G, R, seed, cols) {   // mountain ranges on a ring of radius R (nofog: they sit in the haze by colour)
    for (let i = 0; i < 26; i++) { const a = i / 26 * TAU + hash(i, seed) * 0.2, h = 14 + hash(i, seed + 1) * 22, w = 26 + hash(i, seed + 2) * 20;
      const m = at(cone(w, h, 4, mat({ color: cols[i % cols.length], unlit: 0.55, nofog: 1 })), Math.sin(a) * R, h / 2 - 2, -Math.cos(a) * R); m.rotation.y = hash(i, seed + 3) * TAU; G.add(m); }
  }

  // =====================================================================================================================
  function station() {
    const G = new THREE.Group(), hearts = heartSet(G), R = MOJAVE;
    const skyT = tex(4, 64, x => { const gr = x.createLinearGradient(0, 0, 0, 64); gr.addColorStop(0, '#2e5aa8'); gr.addColorStop(0.32, '#7aa8d8'); gr.addColorStop(0.47, '#f2d8a8'); gr.addColorStop(0.5, '#f6e2b8'); gr.addColorStop(1, '#f6e2b8'); x.fillStyle = gr; x.fillRect(0, 0, 4, 64); });
    G.add(new THREE.Mesh(new THREE.SphereGeometry(188, 16, 12), mat({ map: skyT, unlit: 1, nofog: 1, side: THREE.BackSide })));
    { const sun = new THREE.Mesh(new THREE.CircleGeometry(7, 20), mat({ color: 0xfff6d0, unlit: 1, nofog: 1 })); sun.position.set(90, 60, 120); sun.lookAt(0, 0, 0); G.add(sun); }
    ranges(G, 150, 4420, [0xb08a9a, 0xa07e8e, 0xbc96a4]);
    // the ground: sand, the highway along x in front, the forecourt slab, the pump island
    G.add(flat(400, 400, mat({ map: sandT, rep: [70, 70] }), 0, -0.02, 0));
    G.add(flat(400, R.ROAD.z1 - R.ROAD.z0, mat({ map: roadT, rep: [70, 2] }), 0, 0, (R.ROAD.z0 + R.ROAD.z1) / 2));
    G.add(flat(400, 0.16, mat({ map: dashT, rep: [50, 1] }), 0, 0.004, R.ROAD.mid));
    for (const z of [R.ROAD.z0 + 0.18, R.ROAD.z1 - 0.18]) G.add(flat(400, 0.1, M(0xe8e4d8), 0, 0.004, z));
    const [fx0, fx1, fz0, fz1] = R.FORE; G.add(flat(fx1 - fx0, fz1 - fz0, mat({ map: slabT, rep: [(fx1 - fx0) / 2, (fz1 - fz0) / 2] }), (fx0 + fx1) / 2, 0.006, (fz0 + fz1) / 2));
    G.add(flat(fx1 - fx0, R.ROAD.z0 - fz1 + 0.02, mat({ map: slabT, rep: [(fx1 - fx0) / 2, 1] }), (fx0 + fx1) / 2, 0.006, (fz1 + R.ROAD.z0) / 2));
    const [ix, iz, il, id, ih] = R.ISLAND;
    G.add(at(box(il, ih, id, M(0xd8d0c0)), ix, ih / 2, iz)); G.add(at(box(il + 0.06, 0.04, id + 0.06, M(0xe8c040, { unlit: 0.2 })), ix, ih, iz));
    // the two red vintage pumps (rounded tops, a glass globe, a dial), their hoses on their holsters
    const PRED = M(0xd02a2a, { unlit: 0.12 }), nozzles = [];
    R.PUMPS.forEach(([px0, pz0]) => {
      const p = at(new THREE.Group(), px0, ih, pz0); G.add(p);
      p.add(at(box(0.62, 1.35, 0.44, PRED), 0, 0.68, 0));
      p.add(at(rot(cyl(0.31, 0.31, 0.44, 10, PRED), PI / 2, 0, 0), 0, 1.35, 0));
      p.add(at(sph(0.2, 10, 8, glow(0xfff6e0, 0.9)), 0, 1.86, 0)); p.add(at(cyl(0.12, 0.14, 0.12, 8, CHROME), 0, 1.66, 0));
      p.add(at(new THREE.Mesh(new THREE.PlaneGeometry(0.4, 0.36), mat({ map: dialT, unlit: 0.4 })), 0, 1.06, 0.225));
      p.add(at(box(0.66, 0.06, 0.48, CHROME), 0, 0.02, 0));
      const hose = at(new THREE.Group(), 0.33, 0.9, 0.05); p.add(hose);
      hose.add(at(rot(cyl(0.025, 0.025, 0.7, 5, M(0x1a1a1a)), 0, 0, 0.25), 0.1, -0.3, 0.12));
      const nz = new THREE.Group(); nz.add(at(box(0.08, 0.2, 0.06, M(0x1a1a1a)), 0, 0, 0)); nz.add(at(rot(cyl(0.02, 0.02, 0.18, 5, CHROME), 0, 0, 1.2), 0.1, 0.08, 0)); nz.position.set(0.06, 0, 0); hose.add(nz); nozzles.push(nz);
    });
    // the diner: cream stucco, a teal band and a chrome stripe, a row of lit windows, the door, an awning, the EAT sign
    const D = R.DINER, dw = D.x1 - D.x0, dd = D.z1 - D.z0;
    G.add(at(box(dw, D.H, dd, mat({ map: stuccoT, rep: [dw / 2, D.H / 2], unlit: 0.18 })), (D.x0 + D.x1) / 2, D.H / 2, (D.z0 + D.z1) / 2));
    G.add(at(box(dw + 0.04, 0.32, dd + 0.04, M(0x2a8a7a, { unlit: 0.2 })), (D.x0 + D.x1) / 2, D.H - 0.3, (D.z0 + D.z1) / 2));
    G.add(at(box(dw + 0.05, 0.05, dd + 0.05, CHROME), (D.x0 + D.x1) / 2, 1.05, (D.z0 + D.z1) / 2));
    const winM = mat({ map: winT, unlit: 0.85 });
    for (let x = D.x0 + 0.9; x < D.x1 - 1.6; x += 1.5) G.add(at(new THREE.Mesh(new THREE.PlaneGeometry(1.2, 1.1), winM), x, 1.75, D.z1 + 0.012));
    const [dX] = R.DOOR, DW = R.DOOR_W;
    G.add(at(new THREE.Mesh(new THREE.PlaneGeometry(DW + 0.1, 2.3), mat({ map: winT, unlit: 0.8 })), dX, 1.15, D.z1 + 0.01));   // the warm lit inside (black, the doorway read as a hole)
    G.add(at(box(DW + 0.1, 0.5, 0.02, M(0xd83a3a, { unlit: 0.6 })), dX, 0.55, D.z1 + 0.012));
    const door = at(new THREE.Group(), dX - DW / 2, 0, D.z1 + 0.03); G.add(door);
    door.add(at(box(DW, 2.2, 0.05, M(0x2a8a7a, { unlit: 0.2 })), DW / 2, 1.1, 0)); door.add(at(new THREE.Mesh(new THREE.PlaneGeometry(DW - 0.4, 1.0), winM), DW / 2, 1.45, 0.03)); door.add(at(box(0.05, 0.05, 0.12, CHROME), DW - 0.15, 1.05, 0.06));
    { const awning = at(box(dw - 0.4, 0.06, 1.0, M(0xe85a5a, { unlit: 0.15 })), (D.x0 + D.x1) / 2 - 0.6, 2.6, D.z1 + 0.5); awning.rotation.x = 0.22; G.add(awning); }
    { G.add(at(new THREE.Mesh(new THREE.PlaneGeometry(2.6, 0.65), mat({ map: dinerT, unlit: 0.7 })), (D.x0 + D.x1) / 2, D.H + 0.38, D.z1 + 0.02)); G.add(at(box(2.7, 0.75, 0.06, M(0x2a8a7a)), (D.x0 + D.x1) / 2, D.H + 0.38, D.z1 - 0.02)); }
    { const [ex, ez] = R.EAT; G.add(at(cyl(0.12, 0.14, 6.6, 6, M(0x9a9aa2)), ex, 3.3, ez));
      const board = at(new THREE.Group(), ex, 5.2, ez + 0.05); G.add(board);
      for (const sd of [1, -1]) { const f = at(new THREE.Mesh(new THREE.PlaneGeometry(0.95, 1.9), mat({ map: eatT, unlit: 0.85 })), 0, 0, sd * 0.09); if (sd < 0) f.rotation.y = PI; board.add(f); }
      board.add(box(1.0, 1.96, 0.16, M(0xc8322a)));
      board.rotation.y = -0.5; }
    // the outdoor table under its parasol, the price board, the phone booth, the Airstream trailer
    const table = new THREE.Group(); G.add(table);   // noTable hides it (its parasol grew out of a head)
    { const [tx, tz] = R.TABLE; table.add(at(cyl(0.55, 0.55, 0.05, 10, M(0xe8e4dc)), tx, 0.74, tz)); table.add(at(cyl(0.05, 0.05, 0.72, 5, CHROME), tx, 0.36, tz));
      table.add(at(cyl(0.04, 0.04, 2.4, 5, M(0xf2f2ee)), tx, 1.2, tz)); table.add(at(cone(1.2, 0.5, 8, M(0xe85a5a, { unlit: 0.2 })), tx, 2.4, tz)); }
    { const [qx, qz] = R.PRICE; for (const sd of [-1, 1]) G.add(at(box(0.1, 3.4, 0.1, M(0x8a8a92)), qx + sd * 0.55, 1.7, qz)); G.add(at(new THREE.Mesh(new THREE.PlaneGeometry(1.2, 1.8), mat({ map: priceT, unlit: 0.6 })), qx, 2.9, qz + 0.06)); G.add(at(box(1.26, 1.86, 0.08, M(0xc8322a)), qx, 2.9, qz)); }
    { const [bx, bz] = R.PHONE, bm = mat({ map: boothT, unlit: 0.3, see: 0.5 }); for (const [dx, dz, ry] of [[0, -0.42, 0], [-0.42, 0, PI / 2], [0.42, 0, PI / 2]]) { const pn = at(new THREE.Mesh(new THREE.PlaneGeometry(0.84, 2.0), bm), bx + dx, 1.05, bz + dz); pn.rotation.y = ry; G.add(pn); }
      G.add(at(box(0.9, 0.12, 0.9, M(0xc8c8d0)), bx, 2.12, bz)); G.add(at(box(0.9, 0.25, 0.04, glow(0x3a6ad8, 0.6)), bx, 1.95, bz + 0.44)); G.add(at(box(0.2, 0.3, 0.1, M(0x2a2a2e)), bx, 1.3, bz - 0.36)); }
    { const [ax, az] = R.AIRSTREAM, sM = mat({ map: silverT, unlit: 0.25 }); G.add(at(rot(cyl(1.1, 1.1, 4.4, 14, sM), 0, 0, PI / 2), ax, 1.45, az));
      for (const sd of [-1, 1]) G.add(at(sph(1.1, 14, 10, sM), ax + sd * 2.2, 1.45, az));
      for (let i = 0; i < 4; i++) G.add(at(new THREE.Mesh(new THREE.PlaneGeometry(0.6, 0.4), glow(0x6a8aa8, 0.4)), ax - 1.6 + i * 1.05, 1.8, az + 1.06));
      G.add(at(new THREE.Mesh(new THREE.PlaneGeometry(0.6, 1.4), M(0x9aa0aa)), ax + 0.9, 1.05, az + 1.07)); G.add(at(rot(cyl(0.3, 0.3, 0.2, 10, M(0x1a1a1e)), PI / 2, 0, 0), ax, 0.32, az + 0.95)); }
    // a semi parked behind the station, palms, Joshua trees, saguaros, rocks, telephone poles along the road and behind
    { const semi = at(new THREE.Group(), -16, 0, -9.5); G.add(semi); semi.add(at(box(7.5, 2.8, 2.3, M(0xf2f2ee)), 0, 1.9, 0)); semi.add(at(box(2.2, 2.2, 2.3, M(0xc83a2a)), 4.9, 1.5, 0)); semi.add(at(box(0.05, 0.8, 1.9, glow(0x9ac8e8, 0.4)), 6.02, 2.1, 0)); for (const wx of [-2.8, -1.8, 3.2, 5.3]) for (const sd of [-1, 1]) semi.add(at(rot(cyl(0.45, 0.45, 0.3, 10, M(0x1a1a1e)), PI / 2, 0, 0), wx, 0.45, sd * 1.05)); }
    for (const [x, z, h] of [[-11.5, -2.5, 6.5], [10.6, -1.2, 5.8], [3.2, -8.5, 7], [-4.6, -10.4, 6.2]]) G.add(at(palm(h), x, 0, z));
    for (let i = 0; i < 18; i++) { const a = hash(i, 4430) * TAU, d = 16 + hash(i, 4431) * 40, x = Math.sin(a) * d, z = -Math.cos(a) * d; if (z > 3 && z < 13) continue; G.add(at(i % 3 ? joshua(0.9 + hash(i, 4432) * 0.6) : saguaro(0.8 + hash(i, 4433) * 0.5), x, 0, z)); }
    for (let i = 0; i < 14; i++) { const a = hash(i, 4434) * TAU, d = 12 + hash(i, 4435) * 35, x = Math.sin(a) * d, z = -Math.cos(a) * d; if (z > 3 && z < 13) continue; G.add(at(rock(0.5 + hash(i, 4436) * 1.2, i), x, 0.1, z)); }
    for (let i = 0; i < 9; i++) { G.add(at(pole(), -48 + i * 12, 0, 13.4)); G.add(at(pole(), -46 + i * 12, 0, -13.2)); }
    // the roadster, the locals, the dust
    const C = roadster(); G.add(C.g);
    const SPOTS = [[-6.6, -2.0], [-7.4, -2.9], [4.3, -2.6], [8.6, -4.9], [-9.0, -1.0], [6.8, -1.5]];
    const pets = SPOTS.map((sp, i) => { const p = pet(i); G.add(p.g); return p; });
    const honkM = mat({ color: 0xff9a2a, unlit: 1 }), honks = [];
    for (let i = 0; i < 3; i++) { const r = new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.035, 4, 16), honkM); r.visible = false; G.add(r); honks.push(r); }
    const dustM = mat({ color: 0xe0c8a0, unlit: 0.45, see: 0.62 }), dust = [];
    for (let i = 0; i < 96; i++) { const p = ico(0.2, 1, dustM); p.visible = false; G.add(p); dust.push(p); }
    const _back = new THREE.Vector3(), _side = new THREE.Vector3(), _yAx = new THREE.Vector3(0, 1, 0);
    return {
      group: G, sky: skyT, shadowCol: 0x8a6a48, shadowY: 0.02,
      light() {
        lights(0xb4a094, 0xfff0d8, [-0.45, -0.78, -0.5], 0xf2dcb4, [70, 190], 9);   // the afternoon sun from behind the usual lenses (+z, a little +x): faces turned to +z read
        pt(0, 0.4, 2.6, 3.4, 0.35, 0.3, 0.24);
      },
      anim(t, P = {}) {
        const s = shotT(t, P), b = beat(t);
        if (P.key) pt(3, P.key[0], P.key[1], P.key[2], P.key[3], P.key[4], P.key[5]);
        door.rotation.y = -1.45 * cl(ramp(P.dinerDoor, s));
        table.visible = !P.noTable;
        nozzles.forEach((n, i) => { n.visible = !(P.nozzle || []).includes(i); });
        // the roadster: parked, or rolling from (x, z) to `to` over [at, at + dur]
        const cp = P.car; C.g.visible = cp !== false;
        let moving = false;
        if (cp !== false) {
          const c = cp || {}, x0 = c.x ?? R.CAR_PARK[0], z0 = c.z ?? R.CAR_PARK[1], [x1, z1] = c.to || [x0, z0];
          const u0 = cl((s - (c.at ?? 0)) / Math.max(0.01, c.dur ?? 1)), u = c.to ? (c.lin ? u0 : u0 * u0 * (3 - 2 * u0)) : 0;
          C.g.position.set(x0 + (x1 - x0) * u, 0, z0 + (z1 - z0) * u); C.g.rotation.y = (c.yaw ?? 180) * PI / 180;
          moving = !!c.to && u0 > 0 && u0 < 1;
          const dist = Math.hypot(x1 - x0, z1 - z0) * u; C.spin.forEach(w => { w.rotation.z = -dist / 0.32; });
          carAnim(C, P, t, s, b, moving);
        }
        // the honk (true or s): three yellow rings bursting from the horn, one a half beat, facing honkYaw (deg, 0 = +z)
        const hk = from(P.honk, s) && cp !== false;
        honks.forEach((r, i) => {
          r.visible = false; if (!hk) return;
          const e = pmod(b * 2 + i * 2 / 3, 2) / 2; r.visible = true;
          const hp = new THREE.Vector3(CAR.L / 2 - 0.35 + e * 0.9, 0.95 + e * 0.15, 0).applyAxisAngle(_yAx, C.g.rotation.y).add(C.g.position);   // from the middle of the bonnet's nose, out ahead (round the grille they tangled with a headlamp)
          r.position.copy(hp); r.rotation.set(0, (P.honkYaw ?? 0) * PI / 180, 0); r.scale.setScalar(0.45 + e * 0.75);
        });
        // dust: bursts at points, and a trail behind the rear wheels of a moving car
        let di = 0;
        dust.forEach(d => { d.visible = false; });
        for (const [x, z, s0, size = 1] of (P.dust || [])) for (let j = 0; j < 8 && di < dust.length; j++, di++) {
          const e = (s - s0) / 1.6; if (e < 0 || e > 1) continue; const d = dust[di]; d.visible = true;
          const a = j / 8 * TAU + hash(j, 4440); d.position.set(x + Math.cos(a) * (0.3 + e * 1.2) * size, 0.15 + e * 0.6 * size, z + Math.sin(a) * (0.3 + e * 1.0) * size); d.scale.setScalar((0.5 + e * 1.2) * size);
        }
        if (moving && P.carDust !== false) {
          _back.set(-1, 0, 0).applyAxisAngle(_yAx, C.g.rotation.y);
          _side.set(0, 0, 1).applyAxisAngle(_yAx, C.g.rotation.y);
          for (let j = 0; j < 20 && di < dust.length; j++, di++) {   // kicked up at the wheels (front pair and rear pair) and trailing back: behind the car only, it left the frame
            const e = pmod(s * 1.8 + j / 20, 1), d = dust[di], front = j % 4 < 1, sd = j % 2 ? 0.95 : -0.95; d.visible = true;
            d.position.copy(C.g.position).addScaledVector(_back, (front ? -1.28 : 1.25) + e * (front ? 1.2 : 2.4)).addScaledVector(_side, sd * (1 + 0.25 * e));
            d.position.y = 0.12 + e * 0.55; d.scale.setScalar((front ? 0.5 : 0.7) + e * 1.6);
          }
        }
        // the locals
        const mode = P.pets ?? 'idle';
        pets.forEach((p, i) => {
          let [x, z] = SPOTS[i];
          if (P.spots) { if (i >= P.spots.length || !P.spots[i]) { p.g.visible = false; return; } [x, z] = P.spots[i]; }
          const show = mode !== false && !P.noguests && !cleared(P, x, z); p.g.visible = show; if (!show) return;
          const st = P.stare || [R.CAR_PARK[0], R.CAR_PARK[1]];
          const yaw = mode === 'idle' ? Math.atan2(0 - x, 6 - z) : Math.atan2(st[0] - x, st[1] - z);
          animPet(p, mode, b, i);
          p.g.position.set(x, 0, z); p.g.rotation.y = yaw;
        });
        hearts(P, s);
      },
    };
  }

  // =====================================================================================================================
  function road() {
    const G = new THREE.Group(), hearts = heartSet(G), W = ROADWAY;
    const skyT = tex(4, 64, x => { const gr = x.createLinearGradient(0, 0, 0, 64); gr.addColorStop(0, '#2a2a6a'); gr.addColorStop(0.25, '#6a4a8a'); gr.addColorStop(0.38, '#d8607a'); gr.addColorStop(0.46, '#ff9a5a'); gr.addColorStop(0.5, '#ffd27a'); gr.addColorStop(1, '#ffd27a'); x.fillStyle = gr; x.fillRect(0, 0, 4, 64); });
    G.add(new THREE.Mesh(new THREE.SphereGeometry(188, 16, 12), mat({ map: skyT, unlit: 1, nofog: 1, side: THREE.BackSide })));
    { const sun = new THREE.Mesh(new THREE.CircleGeometry(12, 24), mat({ color: 0xffb04a, unlit: 1, nofog: 1 })); sun.position.set(-170, 9, 8); sun.lookAt(0, 4, 0); G.add(sun); }
    ranges(G, 140, 4450, [0x6a3a5a, 0x5a3050, 0x7a4462]);
    const sandM = mat({ map: sandT, rep: [70, 70] }); G.add(flat(400, 400, sandM, 0, -0.02, 0));
    const roadM = mat({ map: roadT, rep: [70, 2] }); G.add(flat(400, W.ROAD[1] - W.ROAD[0], roadM, 0, 0, (W.ROAD[0] + W.ROAD[1]) / 2));
    const dashM = mat({ map: dashT, rep: [50, 1] }); G.add(flat(400, 0.16, dashM, 0, 0.004, W.MID));
    for (const z of [W.ROAD[0] + 0.18, W.ROAD[1] - 0.18]) G.add(flat(400, 0.1, M(0xe8e4d8), 0, 0.004, z));
    const near = [], far = [];
    for (let i = 0; i < 12; i++) { const p = at(pole(), -66 + i * 12, 0, 4.4); G.add(p); near.push([p, -66 + i * 12, 144]); }
    for (let i = 0; i < 10; i++) { const z = 6 + hash(i, 4460) * 8, x = -70 + i * 14; const o = at(i % 2 ? joshua(1 + hash(i, 4461) * 0.5) : saguaro(0.9 + hash(i, 4462) * 0.4), x, 0, z); G.add(o); near.push([o, x, 140]); }
    for (let i = 0; i < 10; i++) { const z = -9 - hash(i, 4463) * 10, x = -70 + i * 14; const o = at(i % 3 ? joshua(1.1) : rock(1.2 + hash(i, 4464), i + 40), x, 0, z); G.add(o); near.push([o, x, 140]); }
    for (let i = 0; i < 8; i++) { const z = (i % 2 ? 1 : -1) * (24 + hash(i, 4465) * 20), x = -120 + i * 30; const o = at(rock(2.5 + hash(i, 4466) * 3, i + 60), x, 0, z); G.add(o); far.push([o, x, 240]); }
    { const bb = new THREE.Group(); bb.add(at(new THREE.Mesh(new THREE.PlaneGeometry(6, 2.6), mat({ map: eatT, unlit: 0.6 })), 0, 4.2, -0.08)); bb.add(at(box(6.2, 2.8, 0.12, M(0xd8d0c0)), 0, 4.2, 0)); for (const x of [-2.2, 2.2]) bb.add(at(box(0.15, 3.0, 0.15, M(0x6a5038)), x, 1.5, 0.05)); bb.position.set(30, 0, 14); bb.rotation.y = PI; G.add(bb); far.push([bb, 30, 240]); }
    const C = roadster(); G.add(C.g);
    for (const sd of [-1, 1]) { const beam = at(new THREE.Mesh(new THREE.PlaneGeometry(3.5, 0.7), mat({ color: 0xfff0c0, unlit: 1, see: 0.75 })), 3.6, 0.03, sd * 0.62); beam.rotation.x = -PI / 2; C.g.add(beam); }
    return {
      group: G, sky: skyT, shadowCol: 0x2a2228, shadowY: 0.02,
      light() {
        lights(0x8a7088, 0xffb880, [0.85, -0.42, 0.1], 0xd88a7a, [60, 190], 8);   // the low sun from behind the car (-x)
        pt(0, 3.4, 2.2, 0.6, 0.9, 0.72, 0.6);    // the warm fill on the faces from the front (the lenses are ahead of the car)
        pt(1, 1.2, 1.8, 2.6, 0.45, 0.38, 0.4);
      },
      anim(t, P = {}) {
        const s = shotT(t, P), b = beat(t), speed = P.still ? 0 : (P.speed ?? W.SPEED), d = speed * t;
        if (P.key) pt(3, P.key[0], P.key[1], P.key[2], P.key[3], P.key[4], P.key[5]);
        sandM.uniforms.uOff.value.set((d / 400) * 70 % 1, 0); roadM.uniforms.uOff.value.set((d / 400) * 70 % 1, 0); dashM.uniforms.uOff.value.set((d / 400) * 50 % 1, 0);
        near.forEach(([p, x0, L]) => { p.position.x = pmod(x0 - d + L / 2, L) - L / 2; });
        far.forEach(([p, x0, L]) => { p.position.x = pmod(x0 - d * 0.3 + L / 2, L) - L / 2; });
        C.spin.forEach(w => { w.rotation.z = -d / 0.32; });
        carAnim(C, { ...P, rumble: speed ? true : P.rumble }, t, s, b, !!speed);
        hearts(P, s);
      },
    };
  }

  return { mojave: station(), mojaveroad: road() };
}
