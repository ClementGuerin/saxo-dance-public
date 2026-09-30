// maps21.js: the "SWIM" map (2026-10-01, BTS; the clip: a woman in a museum of model ships finds herself on a white
// three-masted schooner at sea, the band in black naval jackets with gold buttons at the wheel and the rail, sailors in
// white hauling a rope in a line, cream canvas against a blue sky). Same contract as the other map files, pure in t:
//   ship  the schooner on the open sea by day, and it sinks: the deck at y = 0 (SHIP.RAIL either side, the bow at -z),
//         a white hull with a gold line, teak planks, three masts under cream gaff sails sheeted out to port, jibs to
//         the bowsprit, a deckhouse aft of the mainmast (its roof at DH_Y, Kob's door lying on it at DOOR), the wheel at
//         the stern (WHEEL), the ship's bell by the foremast, lifebuoys on the rails; the band's mark STAGE between the
//         foremast and the mainmast, the crew's rows behind it (CREW), the heroine's spot at the bow (BOW).
//         THE SEA RISES: `water` (the sea level: a number, or [w0, w1, s0, s1]: from w0 at s0 to w1 at s1 seconds into
//         the shot) sets the sea plane and the shared underwater tint (ps1.js U.uWaterY: everything below it turns blue,
//         deeper = bluer; a lens under it sees everything through the water). Over the deck the sea turns see-through
//         (`see`) so legs show under it. The ship never moves: the sea comes up.
//         Flags: `berg` ([x0, z0, x1, z1]: the iceberg grinds past over `bergDur` s; [x, z]: it stands there; false
//         hides it; default far off the port quarter), `ice` (s: ice chunks fall on the deck round STAGE, or float once
//         the deck is awash), `spray` ([x, z, s, side]: the breach bursts over the rail inwards), `wave` (s: a wall of
//         white water sweeps the deck from port to starboard), `splash` ([[x, z, s, size]]: something falls in),
//         `paddle` ([[x, z], ...]: swimmers' paws splash on every half beat), `bail` ([x, y, z, dx, dz]: a bucket's worth
//         of water flung from there on every beat), `crew` ('dance' | 'pull' | 'dive' | 'swim' | 'none': the sailor
//         pets; `crewDive`: [s0, gap], `crewSwim`: [[x, z, yaw], ...]), `door` ([x, z, yaw]: Kob's door; it floats up
//         once the sea passes the deckhouse roof; `doorBob` false keeps it level for a rider), `fish` ([x, y, z, r]: fish circling under the surface), `bubbles`
//         ([[x, z], ...]), `sink` (m: the whole ship lower, for a wide from outside), `clear` ([[x, z, r]]: no crew there).
import { mapKit } from './mapkit.js';

export const SHIP = {
  RAIL: 3.55, DECK: [-12.2, 11.6], BOW_TIP: -19.4, FORE: [0, -9.6], MAIN: [0, 2.6], MIZZEN: [0, 8.9],
  STAGE: [0, -3.4], BOW: [0, -14.6], WHEEL: [0, 10.6], DH: { x: 1.55, z0: 4.4, z1: 7.4 }, DH_Y: 0.95,
  DOOR: [0, 5.9], BELL: [-1.3, -8.4], SEA: -1.6, BERG: [30, -42],
  CREW: [[-1.5, -5.1], [0, -5.3], [1.5, -5.1], [-2.3, -6.6], [-0.75, -6.8], [0.75, -6.8], [2.3, -6.6]],
};

export function buildShipMaps(K) {
  const k = mapKit(K);
  const { THREE, mat, tex, px, noise, box, U, TAU, PI, hash, beat, grad, cyl, cone, at, rot, flat, lights, pt, fr } = k;
  const M = (c, o = {}) => mat({ color: c, ...o }), glow = c => mat({ color: c, unlit: 1 });
  const cl = x => Math.max(0, Math.min(1, x)), sm = x => { x = cl(x); return x * x * (3 - 2 * x); };
  const shotT = (t, P) => P.t0 != null ? t - P.t0 : 0;
  const { RAIL, DECK, BOW_TIP, FORE, MAIN, MIZZEN, STAGE, DH, DH_Y, BELL } = SHIP;

  // the sea level for a shot at s seconds into it
  function seaLevel(P, s) {
    const w = P.water;
    if (w == null) return SHIP.SEA;
    if (typeof w === 'number') return w;
    const [w0, w1, s0 = 0, s1 = 2.55] = w;
    return w0 + (w1 - w0) * sm((s - s0) / Math.max(0.01, s1 - s0));
  }

  // ---- a sailor pet: box body in whites, a navy collar, a white cap, arms that paddle or haul ----
  const FURS = [0xd8c2a0, 0xf2eee6, 0xe8a060, 0xc8b8e0, 0xe0d0b8, 0xb89878, 0xf0e2c8, 0xd8b890];   // light furs only: dark ones read as black boxes (the reviewer, 2026-10-01)
  const whiteM = M(0xf4f4f0), navyM = M(0x1e2a5a);
  function sailor(i) {
    const g = new THREE.Group(), fur = M(FURS[i % FURS.length]), kind = i % 3;
    const body = new THREE.Group(); g.add(body);
    body.add(at(box(0.36, 0.44, 0.26, whiteM), 0, 0.3, 0));
    body.add(at(box(0.38, 0.1, 0.28, navyM), 0, 0.5, -0.01));   // the sailor collar over the shoulders
    body.add(at(box(0.08, 0.12, 0.02, navyM), 0, 0.44, 0.135));   // the neckerchief's knot
    for (const s of [-1, 1]) body.add(at(box(0.11, 0.12, 0.12, whiteM), s * 0.09, 0.06, 0.02));
    const head = at(new THREE.Group(), 0, 0.72, 0); body.add(head);
    head.add(box(0.42, 0.38, 0.38, fur));
    head.add(at(box(0.15, 0.1, 0.1, M(0x1a1a1a)), 0, -0.06, 0.2));
    for (const e of [-1, 1]) {
      head.add(at(box(0.06, 0.06, 0.02, M(0x101010)), e * 0.1, 0.04, 0.195));
      head.add(kind === 0 ? rot(at(cone(0.08, 0.2, 4, fur), e * 0.14, 0.26, 0), 0, 0, -e * 0.25) : kind === 1 ? at(box(0.08, 0.3, 0.06, fur), e * 0.1, 0.32, 0) : rot(at(box(0.07, 0.24, 0.16, fur), e * 0.23, 0.02, 0), 0, 0, e * 0.3));
    }
    head.add(at(cyl(0.13, 0.11, 0.07, 8, whiteM), 0.03, 0.22, -0.02));   // the white sailor cap, a little to one side
    const arms = [-1, 1].map(s => { const a = at(new THREE.Group(), s * 0.2, 0.46, 0); a.add(at(box(0.09, 0.3, 0.09, whiteM), 0, -0.13, 0)); a.add(at(box(0.08, 0.08, 0.08, fur), 0, -0.3, 0)); body.add(a); return a; });
    return { g, body, head, arms, i };
  }

  // ---- white water: a splash (a ring on the water, a column, droplets) ----
  const splashM = mat({ color: 0xf2fcff, unlit: 0.9 }), dropM = mat({ color: 0xcaf4ff, unlit: 0.9 });
  function splashGroup(G) {
    const q = new THREE.Group();
    for (let i = 0; i < 12; i++) q.add(new THREE.Mesh(new THREE.IcosahedronGeometry(0.5, 0), splashM));
    q.add(new THREE.Mesh(new THREE.IcosahedronGeometry(0.5, 0), splashM));   // (was a see-through column: it veiled faces and read as frosted cups, 2026-10-01)
    for (let i = 0; i < 40; i++) q.add(new THREE.Mesh(new THREE.IcosahedronGeometry(0.5, 0), i % 3 ? dropM : splashM));
    q.visible = false; G.add(q); return q;
  }
  function splashFx(q, x, y, z, k, big) {   // k: seconds since the impact; big: its size
    q.visible = k >= 0 && k < 0.9; if (!q.visible) return;
    q.position.set(x, y, z);
    const rb = Math.sqrt(big);
    q.children.forEach((b, i) => {
      if (i < 12) { const a = i / 12 * TAU, rr = (0.25 + k * 1.6) * rb; b.position.set(Math.cos(a) * rr, 0.03, Math.sin(a) * rr); b.scale.set(0.16 * rb, 0.08 * rb, 0.16 * rb).multiplyScalar(Math.max(0.05, 1 - k / 0.9)); return; }
      if (i === 12) { b.visible = false; return; }
      const a = (i - 13) / 40 * TAU * 5, v = (2.0 + 1.6 * hash(i, 2113)) * rb, sp = (0.35 + 1.1 * hash(i, 2114)) * rb;
      b.position.set(Math.cos(a) * sp * (0.25 + k), v * k - 4.9 * k * k, Math.sin(a) * sp * (0.25 + k));
      b.scale.setScalar(Math.max(0.01, (0.06 + 0.06 * hash(i, 2115)) * rb * (1 - k / 0.9)));
    });
  }

  // =====================================================================================================================
  function ship() {
    const G = new THREE.Group();
    // ---- the deck: pale teak planks running fore and aft, dark seams ----
    const plankT = tex(16, 16, (x, r) => { px(x, '#c89a62', 0, 0, 16, 16); for (let i = 0; i < 16; i += 8) px(x, '#b0844e', i, 0, 1, 16); noise(x, r, 16, 16, ['#c39560', '#cfa36c', '#c89a62'], 50); }, 2101);   // wide boards, soft seams: thin dark seams every 4 px folded into chevrons under the affine warp
    const deckL = DECK[1] - DECK[0];
    G.add(flat(RAIL * 2, deckL, mat({ map: plankT, rep: [RAIL * 2 / 1.6, deckL / 2.4] }), 0, 0, (DECK[0] + DECK[1]) / 2));
    // the bow's deck: a triangle to the tip, flush with the deck
    const bowShape = new THREE.Shape(); bowShape.moveTo(-RAIL, 0); bowShape.lineTo(RAIL, 0); bowShape.lineTo(0, DECK[0] - BOW_TIP); bowShape.closePath();
    const bowDeck = new THREE.Mesh(new THREE.ShapeGeometry(bowShape), mat({ map: plankT, rep: [5, 5] })); bowDeck.rotation.x = -PI / 2; bowDeck.position.set(0, 0.001, DECK[0]); G.add(bowDeck);
    // ---- the hull: white sides from 2.6 m under the deck to the bulwark's cap rail at 0.95, a gold line, a red bottom ----
    const hullT = tex(16, 32, (x, r) => { px(x, '#f2f2ee', 0, 0, 16, 32); noise(x, r, 16, 32, ['#e8e8e2', '#fafaf6'], 30); px(x, '#c8a038', 0, 8, 16, 1); px(x, '#b8302a', 0, 27, 16, 5); }, 2102);
    const hullM = mat({ map: hullT, rep: [10, 1] });
    for (const s of [-1, 1]) G.add(at(box(0.18, 3.55, deckL, hullM), s * (RAIL + 0.09), -0.8, (DECK[0] + DECK[1]) / 2));
    G.add(at(box(RAIL * 2 + 0.36, 3.55, 0.18, hullM), 0, -0.8, DECK[1] + 0.09));   // the transom
    const bowL = Math.hypot(RAIL, DECK[0] - BOW_TIP), bowYaw = Math.atan2(RAIL, DECK[0] - BOW_TIP);
    for (const s of [-1, 1]) {   // the bow's sides, converging to the stem
      const side = at(box(0.18, 3.55, bowL, mat({ map: hullT, rep: [3, 1] })), s * RAIL / 2, -0.8, (DECK[0] + BOW_TIP) / 2);
      side.rotation.y = -s * bowYaw; G.add(side);
    }
    const teak = M(0x9a6a3a);
    for (const s of [-1, 1]) G.add(at(box(0.22, 0.07, deckL, teak), s * (RAIL + 0.05), 0.97, (DECK[0] + DECK[1]) / 2));   // the cap rails
    G.add(at(box(RAIL * 2 + 0.3, 0.07, 0.22, teak), 0, 0.97, DECK[1] + 0.05));
    for (const s of [-1, 1]) { const c = at(box(0.22, 0.07, bowL, teak), s * RAIL / 2, 0.97, (DECK[0] + BOW_TIP) / 2); c.rotation.y = -s * bowYaw; G.add(c); }
    const sprit = rot(at(cyl(0.1, 0.16, 8.5, 6, M(0x8a5a30)), 0, 1.5, BOW_TIP - 3.2), -1.33, 0, 0); G.add(sprit);   // the bowsprit (flag sprit: false hides it: behind the heroine it grew out of her head)
    // ---- masts, gaffs and booms, cream gaff sails sheeted out to port, jibs from the foremast to the bowsprit ----
    const mastM = M(0xb07a44), sparM = M(0x9a6a3a);
    const sailT = tex(16, 16, (x, r) => { px(x, '#efe6cf', 0, 0, 16, 16); noise(x, r, 16, 16, ['#e8dfc6', '#f6eedb'], 40); for (let i = 3; i < 16; i += 5) px(x, '#d8ceb2', 0, i, 16, 1); }, 2103);
    const sailM = mat({ map: sailT, side: THREE.DoubleSide, rep: [2, 2] });
    const sails = [];
    for (const [[mx, mz], h, len] of [[FORE, 21, 6.2], [MAIN, 24, 7.4], [MIZZEN, 18, 5.2]]) {
      G.add(at(cyl(0.13, 0.2, h, 6, mastM), mx, h / 2, mz));
      G.add(at(cyl(0.2, 0.2, 0.5, 6, M(0x5a3a22)), mx, h * 0.82, mz));   // the hounds
      const pivot = at(new THREE.Group(), mx, 0, mz); pivot.rotation.y = -0.72; G.add(pivot);   // sheeted well out to port: the booms swing out over the port rail, so the band's deck has open sky over it (at 0.42 rad a sail filled the hook's lens)
      const boomY = 2.35, gaffY = h * 0.66;
      pivot.add(rot(at(cyl(0.07, 0.07, len, 5, sparM), 0, boomY, len / 2), PI / 2, 0, 0));
      pivot.add(rot(at(cyl(0.06, 0.06, len * 0.8, 5, sparM), 0, gaffY + len * 0.2, len * 0.38), PI / 2 - 0.45, 0, 0));
      const sg = new THREE.BufferGeometry();
      sg.setAttribute('position', new THREE.BufferAttribute(new Float32Array([0, boomY + 0.05, 0.1, 0, boomY + 0.05, len, 0, gaffY + len * 0.38, len * 0.75, 0, gaffY - 0.2, 0.1]), 3));
      sg.setAttribute('uv', new THREE.BufferAttribute(new Float32Array([0, 0, 1, 0, 1, 1, 0, 1]), 2)); sg.setIndex([0, 1, 2, 0, 2, 3]); sg.computeVertexNormals();
      const sail = new THREE.Mesh(sg, sailM); pivot.add(sail); sails.push(sail);
    }
    for (const [top, foot] of [[[0, 19.5, FORE[1]], [0, 2.6, BOW_TIP - 6.4]], [[0, 16, FORE[1]], [0, 2.2, BOW_TIP - 1.5]]]) {   // the jibs
      const jg = new THREE.BufferGeometry(); jg.setAttribute('position', new THREE.BufferAttribute(new Float32Array([...top, ...foot, 0, 2.3, FORE[1] - 1.2]), 3));
      jg.setAttribute('uv', new THREE.BufferAttribute(new Float32Array([0, 1, 1, 0, 0, 0]), 2)); jg.computeVertexNormals();
      const jib = new THREE.Mesh(jg, sailM); jib.rotation.y = 0.12; G.add(jib); sails.push(jib);
    }
    // a few shrouds, beside the masts only (thin lines across the band's faces read as glitches, 2026-09-26)
    const ropeM = M(0x5a4a38), stays = [];
    for (const s of [-1, 1]) for (const [[mx, mz], top] of [[FORE, 16], [MAIN, 18], [MIZZEN, 13]]) for (const dz of [-0.5, 0.5]) {
      const a = new THREE.Vector3(mx, top, mz), b = new THREE.Vector3(s * RAIL, 0.97, mz + dz), d = a.clone().sub(b), r = box(0.03, d.length(), 0.03, ropeM);
      r.position.copy(a).add(b).multiplyScalar(0.5); r.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize()); G.add(r); stays.push(r);
    }
    // a pennant at the mainmast's top
    const penT = tex(8, 4, x => { px(x, '#1e2a5a', 0, 0, 8, 4); px(x, '#f4f4f0', 0, 1, 8, 2); });
    const pennant = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 0.5, 6, 1), mat({ map: penT, side: THREE.DoubleSide })); pennant.position.set(1.1, 24.2, MAIN[1]); G.add(pennant);
    const penP = pennant.geometry.attributes.position, penX = Array.from({ length: penP.count }, (_, i) => penP.getX(i));
    // ---- the deckhouse: white sides with portholes, a teak roof with a skylight ----
    const dhT = tex(32, 8, x => { px(x, '#f2f2ee', 0, 0, 32, 8); for (let i = 3; i < 32; i += 8) { px(x, '#8a6a3a', i, 2, 4, 4); px(x, '#6ab8e0', i + 1, 3, 2, 2); } px(x, '#c8a038', 0, 7, 32, 1); }, 2104);
    const dhW = DH.x * 2, dhL = DH.z1 - DH.z0;
    G.add(at(box(dhW, DH_Y, dhL, mat({ map: dhT, rep: [2, 1] })), 0, DH_Y / 2, (DH.z0 + DH.z1) / 2));
    G.add(at(box(dhW + 0.16, 0.06, dhL + 0.16, teak), 0, DH_Y + 0.03, (DH.z0 + DH.z1) / 2));
    G.add(at(box(0.9, 0.22, 0.9, M(0xf2f2ee)), 0.1, DH_Y + 0.15, DH.z1 - 0.8)); G.add(at(box(0.8, 0.02, 0.8, glow(0x9ad8f0)), 0.1, DH_Y + 0.27, DH.z1 - 0.8));   // the skylight
    // ---- Kob's door (flag `door`): a panelled wooden door with a brass knob; on the deckhouse roof, afloat once the sea is higher ----
    const doorT = tex(16, 32, (x, r) => { px(x, '#5a2a18', 0, 0, 16, 32); noise(x, r, 16, 32, ['#522614', '#62301c'], 40); for (const [y, h] of [[2, 12], [18, 12]]) { px(x, '#3a180a', 2, y, 12, h); px(x, '#6e3822', 3, y + 1, 10, h - 2); } px(x, '#f4f0e6', 0, 0, 16, 1); px(x, '#f4f0e6', 0, 31, 16, 1); }, 2105);   // dark red wood, deep panels, a white-painted edge
    const door = new THREE.Group(); door.add(box(0.95, 0.07, 2.05, mat({ map: doorT })));
    door.add(at(new THREE.Mesh(new THREE.SphereGeometry(0.042, 6, 4), mat({ color: 0xe8b838, unlit: 0.4 })), 0.36, 0.075, 0.1)); door.add(at(box(0.07, 0.012, 0.16, mat({ color: 0x3a2a14 })), 0.36, 0.038, 0.16)); G.add(door);
    // ---- Compote's tub (flag `tub`): a giant red bucket afloat, her boat; the captain's cap afloat (flag `cap`) ----
    const tub = new THREE.Group(); { const red = M(0xd8382e), rim = M(0xb8bcc4);
      tub.add(at(cyl(0.5, 0.4, 0.62, 10, red), 0, 0, 0)); tub.add(at(cyl(0.53, 0.53, 0.06, 10, rim), 0, 0.31, 0)); tub.add(at(cyl(0.44, 0.44, 0.02, 10, mat({ color: 0x3aa8d8, unlit: 0.4 })), 0, 0.12, 0));
      for (const s of [-1, 1]) { const h = at(box(0.06, 0.06, 0.2, rim), s * 0.53, 0.2, 0); tub.add(h); } }
    G.add(tub);
    const cap = new THREE.Group(); { cap.add(at(cyl(0.17, 0.15, 0.1, 10, M(0xf4f4f0)), 0, 0.05, 0)); cap.add(at(cyl(0.18, 0.18, 0.02, 10, M(0xf4f4f0)), 0, 0.1, 0));
      cap.add(at(cyl(0.155, 0.155, 0.035, 10, M(0x151515)), 0, 0.02, 0)); const v = at(box(0.24, 0.015, 0.1, M(0x151515)), 0, 0.01, 0.17); cap.add(v); cap.add(at(box(0.07, 0.05, 0.01, mat({ color: 0xf0c040, unlit: 0.5 })), 0, 0.06, 0.162)); }
    G.add(cap);
    // ---- deck dressing: the wheel, the bell, lifebuoys, coils of rope, a hatch ----
    const [WX, WZ] = SHIP.WHEEL; G.add(at(box(0.3, 0.95, 0.3, M(0x8a5a30)), WX, 0.47, WZ + 0.25));
    const wheel = new THREE.Group(); wheel.add(new THREE.Mesh(new THREE.TorusGeometry(0.48, 0.045, 4, 12), M(0x9a6440))); for (let i = 0; i < 8; i++) { const sp = box(0.04, 1.26, 0.04, M(0x9a6440)); sp.rotation.z = i / 8 * PI; wheel.add(sp); }
    const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.1, 8), M(0xc8a038)); hub.rotation.x = PI / 2; wheel.add(hub);
    wheel.position.set(WX, 1.2, WZ); G.add(wheel);
    G.add(at(box(0.08, 1.5, 0.08, M(0x8a5a30)), BELL[0], 0.75, BELL[1])); G.add(at(box(0.5, 0.06, 0.06, M(0x8a5a30)), BELL[0], 1.5, BELL[1]));
    const bell = at(new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.16, 0.24, 8), M(0xd8a838)), BELL[0], 1.33, BELL[1]); G.add(bell);
    const buoyM = M(0xf4f4f0), buoyR = M(0xe0382e);
    for (const s of [-1, 1]) for (const z of [-6.2, 0.6, 7.6]) {
      const b = new THREE.Group(); for (let q = 0; q < 8; q++) { const seg = at(box(0.2, 0.14, 0.14, q % 2 ? buoyM : buoyR), Math.cos(q / 8 * TAU) * 0.28, Math.sin(q / 8 * TAU) * 0.28, 0); seg.rotation.z = q / 8 * TAU; b.add(seg); }
      b.position.set(s * (RAIL - 0.02), 0.62, z); b.rotation.y = PI / 2; G.add(b);
    }
    for (const [x, z] of [[2.6, -9.4], [-2.6, 1.8], [2.7, 9.6]]) for (let q = 0; q < 3; q++) { const c = at(new THREE.Mesh(new THREE.TorusGeometry(0.28 - q * 0.07, 0.04, 3, 10), M(0xc8b080)), x, 0.04 + q * 0.07, z); c.rotation.x = PI / 2; G.add(c); }
    G.add(at(box(1.2, 0.14, 1.2, M(0x9a6a3a)), 1.9, 0.07, -0.6));   // a hatch
    // ---- the sea: a big plane at the sea level, see-through once it is over the deck; the deep under it ----
    const seaT = tex(32, 32, (x, r) => { px(x, '#1c6c94', 0, 0, 32, 32); noise(x, r, 32, 32, ['#1a6490', '#23789e', '#16587e'], 220); for (let i = 0; i < 7; i++) px(x, '#cfeaf8', Math.floor(r() * 31), Math.floor(r() * 32), 1, 1); }, 2106);   // small flecks: 3 px dashes read as rain from above
    const seaM = mat({ map: seaT, rep: [120, 120], side: THREE.DoubleSide });
    const sea = flat(700, 700, seaM, 0, SHIP.SEA, 0); G.add(sea);
    G.add(flat(700, 700, M(0x0a2a3a), 0, -26, 0));   // the deep
    // ---- the iceberg: a faceted white mound with pale blue faces (most of it under the sea: the tint shows it) ----
    const iceT = tex(16, 16, (x, r) => { px(x, '#eef8ff', 0, 0, 16, 16); noise(x, r, 16, 16, ['#d8eefc', '#ffffff', '#bfe2f6', '#a8d4ee'], 90); }, 2107);
    const iceM = mat({ map: iceT, unlit: 0.35 });
    const berg = new THREE.Group();
    {
      const gq = new THREE.IcosahedronGeometry(1, 1), p = gq.attributes.position;
      for (let i = 0; i < p.count; i++) { const f = 0.8 + 0.4 * hash(Math.round(p.getX(i) * 9), Math.round(p.getY(i) * 9), Math.round(p.getZ(i) * 9)); p.setXYZ(i, p.getX(i) * f, p.getY(i) * f, p.getZ(i) * f); }
      gq.computeVertexNormals();
      const main = new THREE.Mesh(gq, iceM); main.scale.set(9, 13, 8); main.position.y = 1.5; berg.add(main);
      const a = new THREE.Mesh(gq, iceM); a.position.set(5, 3, 3); a.rotation.set(0.4, 1, 0); a.scale.set(5, 7, 4); berg.add(a);
      const c = new THREE.Mesh(gq, iceM); c.position.set(-4, 1, 4); c.rotation.set(1, 0.3, 0.5); c.scale.set(4, 5, 4); berg.add(c);
    }
    G.add(berg);
    // ice chunks falling on the deck (flag `ice`)
    const chunks = []; for (let q = 0; q < 12; q++) { const c = new THREE.Mesh(new THREE.IcosahedronGeometry(0.1 + 0.07 * hash(q, 2120), 0), iceM); G.add(c); chunks.push(c); }
    // ---- the spray over the rail (flag `spray`), the wave across the deck (flag `wave`), splashes, the bailed water ----
    const spray = []; for (let q = 0; q < 70; q++) { const b = new THREE.Mesh(new THREE.IcosahedronGeometry(0.5, 0), q % 3 ? dropM : splashM); G.add(b); spray.push(b); }
    const waveBodyM = mat({ color: 0x2f9ec4, unlit: 0.55 }), waveWall = [], waveFoam = [];   // opaque: see-through read as a mesh fence
    for (let q = 0; q < 26; q++) { const b = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), waveBodyM); G.add(b); waveWall.push(b); }
    for (let q = 0; q < 40; q++) { const b = new THREE.Mesh(new THREE.IcosahedronGeometry(1, 0), q % 3 ? splashM : dropM); G.add(b); waveFoam.push(b); }
    const splashes = [0, 1, 2].map(() => splashGroup(G));
    const pads = [0, 1, 2, 3, 4, 5].map(() => splashGroup(G));
    const bailed = []; for (let q = 0; q < 40; q++) { const b = new THREE.Mesh(new THREE.IcosahedronGeometry(0.5, 0), q % 3 ? dropM : splashM); G.add(b); bailed.push(b); }
    // ---- the crew: seven sailor pets ----
    const crew = SHIP.CREW.map((_, i) => { const c = sailor(i); G.add(c.g); return c; });
    const rope = at(box(0.05, 0.05, 1, M(0xc8b080)), 0, 0.6, 0); G.add(rope);
    // ---- under the sea: fish and bubbles ----
    const FISH = [0xff9a2e, 0xffd43b, 0x4ae0d0, 0xff5fa2, 0x8ad84a, 0xffffff];
    const fishShape = c => {   // a rounded body, a triangle tail, a white eye with a black pupil on both sides (boxes read as arrows)
      const f = new THREE.Group(), body = new THREE.Mesh(new THREE.IcosahedronGeometry(1, 1), M(c)); body.scale.set(0.16, 0.1, 0.05); f.add(body);
      const tg = new THREE.BufferGeometry(); tg.setAttribute('position', new THREE.BufferAttribute(new Float32Array([-0.13, 0, 0, -0.28, 0.1, 0, -0.28, -0.1, 0]), 3)); tg.computeVertexNormals();
      f.add(new THREE.Mesh(tg, mat({ color: c, side: THREE.DoubleSide })));
      for (const s of [-1, 1]) { f.add(at(box(0.045, 0.045, 0.012, M(0xffffff)), 0.08, 0.025, s * 0.045)); f.add(at(box(0.022, 0.022, 0.014, M(0x101010)), 0.09, 0.025, s * 0.05)); }
      return f;
    };
    const fish = FISH.concat(FISH).map(c => { const f = fishShape(c); G.add(f); return f; });
    const frontFish = fishShape(0xff9a2e); frontFish.scale.setScalar(1.6); G.add(frontFish);
    const bubM = mat({ color: 0xdff6ff, unlit: 0.8 }), bubbles = []; for (let q = 0; q < 36; q++) { const b = new THREE.Mesh(new THREE.IcosahedronGeometry(0.035 + 0.03 * hash(q, 2130), 0), bubM); G.add(b); bubbles.push(b); }
    // ---- the sky: clouds and the sun (a daytime gradient is the scene background) ----
    const cloudM = mat({ color: 0xffffff, unlit: 0.9, nofog: 1 });
    for (let q = 0; q < 9; q++) {
      const a = hash(q, 2140) * TAU, R = 150 + 30 * hash(q, 2141), c = new THREE.Group();
      for (let j = 0; j < 4; j++) { const puff = at(new THREE.Mesh(new THREE.IcosahedronGeometry(1, 0), cloudM), j * 5 - 7, hash(q, j) * 2, 0); puff.scale.set(6 + 3 * hash(q, j + 5), 3 + hash(q, j + 9) * 2, 5); c.add(puff); }
      c.position.set(Math.cos(a) * R, 26 + 20 * hash(q, 2142), Math.sin(a) * R); c.lookAt(0, c.position.y, 0); G.add(c);
    }
    const sun = at(new THREE.Mesh(new THREE.CircleGeometry(9, 12), mat({ color: 0xfff6d8, unlit: 1, nofog: 1 })), -60, 95, 150); sun.lookAt(0, 0, 0); G.add(sun);

    return {
      group: G, sky: grad([[0, '#4a9ee0'], [0.5, '#8cc8f0'], [1, '#d8eef8']]), shadowCol: 0x8a6a44,
      light() { lights(0xb8c6d4, 0xfff2d8, [0.3, -0.8, -0.5], 0xcce6f4, [40, 190], 8); },   // the sun behind the usual lenses (from the stern): lit from the bow side, the crew read as black boxes
      anim(t, P = {}) {
        const s = shotT(t, P), b = beat(t), W = seaLevel(P, s);
        const over = W > -0.08;   // the sea is on the deck
        U.uWaterY.value = W; U.uWaterCol.value.set(0x1f6f8f);
        const lensUnder = !!P.lens && P.lens[1] < W;   // a lens under the sea sees the surface from below: opaque and bright (dithered, it read as a net)
        sea.position.y = W + Math.sin(t * 0.9) * 0.02; seaM.uniforms.uOff.value.set(t * 0.01, t * 0.035); seaM.uniforms.uSee.value = over && !lensUnder && W >= 0.12 && W <= 3 ? 0.45 : 0;   // see-through only knee to chin deep: a dithered film read as a dot pattern, deep water as seams and dashes
        G.position.y = -(P.sink || 0);
        // the sails breathe, the pennant flies
        sails.forEach((sl, i) => { sl.scale.x = 1 + 0.04 * Math.sin(t * 1.1 + i); });
        for (let i = 0; i < penP.count; i++) { const x = penX[i] + 1.1; penP.setZ(i, Math.sin(t * 7 - x * 3) * 0.12 * x); } penP.needsUpdate = true;
        // the iceberg
        const B = P.berg; berg.visible = B !== false;
        if (Array.isArray(B) && B.length === 4) { const u = cl(s / Math.max(0.1, P.bergDur || 2.55)); berg.position.set(B[0] + (B[2] - B[0]) * u, -1.6, B[1] + (B[3] - B[1]) * u); }
        else if (Array.isArray(B) && B.length === 2) berg.position.set(B[0], -1.6, B[1]);
        else berg.position.set(SHIP.BERG[0], -1.6, SHIP.BERG[1]);
        // ice chunks: they fall round the stage from s = P.ice, bounce and lie on the deck (or float on the flood)
        chunks.forEach((c, q) => {
          if (P.ice == null) { c.visible = false; return; }
          const k = s - P.ice - hash(q, 2121) * 0.5, x = STAGE[0] + (hash(q, 2122) - 0.5) * 5.4, z = STAGE[1] - 0.8 - hash(q, 2123) * 2.6, rest = Math.max(0.1, W);   // behind the band
          c.visible = k >= 0; if (!c.visible) return;
          const land = Math.sqrt(2 * (7 - rest) / 9.8), y = Math.max(rest, 7 - 4.9 * k * k), bounce = k > land ? 0.25 * Math.abs(Math.sin((k - land) * 9)) * Math.exp(-(k - land) * 4) : 0;
          c.position.set(x, y + bounce, z); c.rotation.set(k * 3 + q, k * 2, q);
        });
        // the spray: the breach bursts over the rail, inwards (side -1: from port, 1: from starboard)
        const Sp = P.spray; spray.forEach((d, q) => {
          const k = Sp ? s - Sp[2] - hash(q, 2125) * 0.25 : -1; d.visible = !!Sp && k >= 0 && k < 1.3; if (!d.visible) return;
          const side = Sp[3] || -1, x0 = side * (RAIL + 0.1), vIn = 2.6 + 1.6 * hash(q, 2126), vUp = 2.4 + 1.4 * hash(q, 2127);
          d.position.set(x0 - side * vIn * k, 0.9 + vUp * k - 4.9 * k * k, Sp[1] + (hash(q, 2128) - 0.5) * 1.6); d.scale.setScalar(0.1 + 0.09 * hash(q, 2129));
          if (d.position.y < Math.max(0, W)) d.visible = false;
        });
        // the wave: a wall of white water across the deck, crashing over the bow and rolling aft over the stage in 0.9 s
        // (sweeping from port to starboard it ran edge-on to a lens looking forward and didn't show, 2026-10-01);
        // waveTo: the z where it dies (default 2 m aft of the stage)
        const Wv = P.wave, z0 = STAGE[1] - 4.5, z1 = P.waveTo ?? STAGE[1] + 2; waveWall.forEach((d, q) => {
          const k = Wv != null ? (s - Wv) / 0.9 : -1; d.visible = k >= 0 && k < 1; if (!d.visible) return;
          const u = q / 25 - 0.5, x = u * (RAIL * 2 - 0.4), z = z0 + (z1 - z0) * k + 0.25 * Math.sin(q * 2.3), hgt = (0.9 + 0.6 * Math.sin(k * PI)) * (1 - 0.3 * Math.abs(u) * 2) * (1 - 0.5 * Math.max(0, k - 0.7) / 0.3);
          d.position.set(x, Math.max(0, W) + hgt * 0.5, z); d.scale.set(RAIL * 2 / 25 + 0.06, hgt, 0.55); d.rotation.set(-0.35, 0, 0);   // the body leans forward: a curling front
          waveFoam[q].visible = true; waveFoam[q].position.set(x + 0.1 * Math.sin(q * 5.1), Math.max(0, W) + hgt + 0.05, z + 0.3); waveFoam[q].scale.setScalar(0.1 + 0.07 * hash(q, 2138)); waveFoam[q].rotation.set(t * 5 + q, q, 0);
        });
        waveFoam.forEach((d, q) => { if (q >= 26 || !waveWall[q].visible) { if (q >= 26 && Wv != null) { const k = (s - Wv) / 0.9; d.visible = k >= 0 && k < 1; if (d.visible) { const i = q - 26, x = (i / 13 - 0.5) * (RAIL * 2 - 0.6), z = z0 + (z1 - z0) * k + 0.45; d.position.set(x, Math.max(0, W) + 0.2 + 0.5 * Math.abs(Math.sin(t * 9 + i)), z); d.scale.setScalar(0.08 + 0.06 * hash(i, 2139)); } } else d.visible = false; } });
        // splashes (a body falling in) and the swimmers' paws on every half beat
        const spl = P.splash ? (Array.isArray(P.splash[0]) ? P.splash : [P.splash]) : [];
        splashes.forEach((q, i) => { if (spl[i]) splashFx(q, spl[i][0], W, spl[i][1], s - spl[i][2], spl[i][3] || 1.2); else q.visible = false; });
        const pd = P.paddle || [];
        pads.forEach((q, i) => { if (!pd[i]) { q.visible = false; return; } const u = b * 2 + i * 0.37, k = fr(u) * 0.5, sd = Math.floor(u) % 2 ? 1 : -1; splashFx(q, pd[i][0] + sd * 0.55, W, pd[i][1] - 0.1, k * 1.3, 0.22); });   // beside the body: in front they covered faces });
        // the bailed water: a bucketful flung from [x, y, z] along [dx, dz] on every beat, arcing into the sea
        const Bl = P.bail; bailed.forEach((d, q) => {
          if (!Bl) { d.visible = false; return; }
          const k = fr(b) * 0.9 - hash(q, 2132) * 0.1; d.visible = k > 0 && k < 0.85; if (!d.visible) return;
          const sp = 2.2 + 1.2 * hash(q, 2133), up = 2 + 1.5 * hash(q, 2134), jx = (hash(q, 2135) - 0.5) * 0.6;
          d.position.set(Bl[0] + (Bl[3] * sp + jx) * k, Bl[1] + up * k - 4.9 * k * k, Bl[2] + (Bl[4] * sp + jx) * k); d.scale.setScalar(0.05 + 0.06 * hash(q, 2136));
          if (d.position.y < W - 0.05) d.visible = false;
        });
        // Kob's door: on the deckhouse roof, afloat once the sea passes it (bobbing)
        const D = P.door; door.visible = !!D;
        if (D) {
          const bob = P.doorBob === false ? 0 : 1, y = Math.max(DH_Y + 0.095, W + 0.02 + 0.03 * Math.sin(t * 1.7) * bob), afloat = y > DH_Y + 0.1;   // doorBob false: someone sits or stands on it (their lift can't bob with it)
          door.position.set(D[0], y, D[1]); door.rotation.set(afloat ? 0.03 * Math.sin(t * 1.3) * bob : 0, (D[2] || 0) * PI / 180, afloat ? 0.04 * Math.sin(t * 1.1) * bob : 0);
        }
        // Compote's tub and the floating cap, bobbing at the sea level
        const Tb = P.tub; tub.visible = !!Tb; if (Tb) { tub.position.set(Tb[0], W - 0.06 + 0.03 * Math.sin(t * 2.1), Tb[1]); tub.rotation.set(0.05 * Math.sin(t * 1.7), (Tb[2] || 0) * PI / 180, 0.06 * Math.sin(t * 1.3)); }
        const Cp = P.cap; cap.visible = !!Cp; if (Cp) { cap.position.set(Cp[0], W - 0.03 + 0.02 * Math.sin(t * 2.4), Cp[1]); cap.rotation.set((Cp[3] || 0) + 0.08 * Math.sin(t * 1.9), (Cp[2] || 0) * PI / 180 + 0.1 * Math.sin(t * 0.7), 0.06 * Math.sin(t * 1.5)); }   // Cp[3]: a tilt that shows the visor and the anchor to the lens
        // the crew
        const mode = P.crew || 'none', cleared = (x, z) => (P.clear || []).some(([cx, cz, r]) => (x - cx) ** 2 + (z - cz) ** 2 < r * r);
        rope.visible = mode === 'pull';
        crew.forEach((c, i) => {
          const home = SHIP.CREW[i]; c.g.visible = mode !== 'none'; if (!c.g.visible) return;
          const bob = Math.abs(Math.sin(PI * (b + i * 0.13))) * 0.06;
          c.g.rotation.set(0, 0, 0); c.body.rotation.set(0, 0, 0); c.g.scale.setScalar(1.05);
          if (mode === 'dance') {   // in rows behind the lead, the paddle on the beat, facing +z
            c.g.position.set(home[0], bob, home[1]); c.g.visible = !cleared(home[0], home[1]);
            c.arms.forEach((a, j) => { const ph = TAU * (b - (j ? 0.5 : 0)); a.rotation.set(-1.2 + 0.9 * Math.cos(ph), 0, 0); });
          } else if (mode === 'pull') {   // a line along the port side hauling a rope in time, facing forward (-z)
            const x = -2.3, z = -1.2 - i * 0.95, lean = 0.28 * (0.5 + 0.5 * Math.cos(TAU * b));
            c.g.position.set(x, 0, z); c.g.rotation.y = PI; c.body.rotation.x = -lean;
            c.arms.forEach(a => a.rotation.set(-1.35 + lean, 0, 0));
            rope.position.set(x, 0.62, -1.2 - 3 * 0.95); rope.scale.set(1, 1, 7.5);
          } else if (mode === 'dive') {   // one after another they run to the starboard rail and dive over it into the sea
            const [s0, gap] = P.crewDive || [0, 0.3], k = s - s0 - i * gap;
            if (k < 0) { c.g.position.set(home[0], bob, home[1]); c.arms.forEach(a => a.rotation.set(-0.3, 0, 0)); c.g.rotation.y = PI / 2; return; }
            const run = cl(k / 0.45), fly = cl((k - 0.45) / 0.7), x0 = home[0], x1 = RAIL - 0.3, x2 = RAIL + 2.6;
            const x = run < 1 ? x0 + (x1 - x0) * sm(run) : x1 + (x2 - x1) * fly, y = run < 1 ? bob : 0.95 + 1.3 * Math.sin(fly * PI * 0.8) - (fly > 0.8 ? (fly - 0.8) * 8 : 0);
            c.g.position.set(x, y, home[1]); c.g.rotation.set(0, PI / 2, 0); c.body.rotation.x = run < 1 ? 0 : 0.4 + 1.9 * fly;   // head first, down to vertical
            c.arms.forEach(a => a.rotation.set(run < 1 ? -0.5 : -3.0, 0, 0));
            if (y < W - 0.4 || k > 1.3) c.g.visible = false;
          } else if (mode === 'swim') {   // heads in the water round given spots, bobbing, paddling
            const sp = (P.crewSwim || [])[i]; if (!sp) { c.g.visible = false; return; }
            c.g.position.set(sp[0], W - 0.62 + 0.05 * Math.sin(t * 2.2 + i), sp[1]); c.g.rotation.y = sp[2] != null ? sp[2] * PI / 180 : 0;
            c.arms.forEach((a, j) => { const ph = TAU * (b - (j ? 0.5 : 0)); a.rotation.set(-1.4 + 0.6 * Math.cos(ph), 0, 0); });
          }
        });
        // fish circling under the surface, bubbles rising from given points to the surface
        const F = P.fish; fish.forEach((f, i) => {
          if (!F) { f.visible = false; return; }
          const dir = i % 2 ? 1 : -1, a = t * (0.5 + 0.3 * hash(i, 2150)) * dir + hash(i, 2151) * TAU, r = F[3] * (0.5 + 0.6 * hash(i, 2152));
          f.position.set(F[0] + Math.cos(a) * r, F[1] + (hash(i, 2153) - 0.5) * 0.8, F[2] + Math.sin(a) * r * 0.7);
          f.rotation.y = -a - dir * PI / 2; f.visible = f.position.y < W - 0.1 && (!P.lens || Math.hypot(f.position.x - P.lens[0], f.position.y - P.lens[1], f.position.z - P.lens[2]) > 2.5);
        });
        const FF = P.fishFront; frontFish.visible = !!FF;
        if (FF) { const u = s * 0.55; frontFish.position.set(FF[0] - 1.2 + u, FF[1] + 0.05 * Math.sin(t * 3), FF[2]); frontFish.rotation.set(0, 0, 0.1 * Math.sin(t * 5)); }
        const Bu = P.bubbles || []; bubbles.forEach((d, q) => {
          if (!Bu.length) { d.visible = false; return; }
          const src = Bu[q % Bu.length], top = Math.max(0.2, W), y = fr(t * 0.45 + hash(q, 2160)) * top;
          d.position.set(src[0] + (hash(q, 2161) - 0.5) * 0.7 + 0.05 * Math.sin(t * 4 + q), y, src[1] + (hash(q, 2162) - 0.5) * 0.6); d.visible = y < W;
        });
        stays.forEach(r => { r.visible = P.stays !== false; }); sprit.visible = P.sprit !== false;
        // the bell swings a little, the wheel turns with the swell
        bell.rotation.z = 0.15 * Math.sin(t * 2.1); wheel.rotation.z = 0.2 * Math.sin(t * 0.7);
        pt(0, 0, 3.5, STAGE[1] + 2, 0.18, 0.17, 0.14);
      },
    };
  }

  return { ship: ship() };
}
