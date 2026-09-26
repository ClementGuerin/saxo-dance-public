// maps11.js: the "Dans ma bulle" maps (2026-09-27, Romsii, the user's queue; the Veridis remix's clip is a montage of
// lonely film moments: a wet beach at twilight, a pier, a Ferris wheel, a full moon over the sea, a night bus). Same
// contract as the other map files, pure in t:
//   shore  the dream: a wide beach whose wet sand mirrors a pink-and-violet twilight (or the night, `night`), the sea
//          washing in and out, a long pier on pilings to the right (deck top at SHORE.DECK) whose end platform carries
//          a lit Ferris wheel, a ticket kiosk, a bench and string lights; a city's lights along the coast to the left;
//          the sun on the horizon at dusk, a giant full moon over the sea at night. The sky is a dome in the map (the
//          camera's far plane is 200 m), switched per shot.
//          Spots (SHORE): WALK_Z (the waterline walk, along x), WATER_Z (where the sea starts), PIER_X / PIER_Z (the
//          pier's deck, x span and z span), DECK (its top), END (the end platform's centre), WHEEL (the wheel's hub,
//          [x, y, z]), KIOSK (behind the ticket counter, facing +z), BENCH (the date bench's centre, seat top 0.3 m
//          above the deck, facing +z with the wheel behind it), MOON ([x, y, z]).
//          Flags read by anim(t, P): `night`, `lightsOff` (cut s: the pier's lights die), `lightsOn` (cut s: back on,
//          brighter), `blackout` ([a, b] cut s: nothing lit but the moon), `bubbles` (soap bubbles drifting round
//          `bubblesAt` [x, z, y], default the walk; true = 26 or a count), `wheel` (the wheel's speed ×), `noguests`,
//          `key` ([x, y, z, r, g, b]).
//   bus    the reality: a city bus at night. Rows of double seats facing the front (-z) on both sides, yellow poles with
//          red stop buttons, fluorescent strips, window holes with the city scrolling past (lit facades, orange street
//          lamps whose glow sweeps through the bus, shop neons, cars), the driver's cab at the front left (seat, big
//          wheel, dashboard, the windshield onto the road), the middle door's standing space in front of Saxo's row (right side)
//          with a perfume ad on the wall panel there, at his eye level (its picture: `posterMat`, given a texture by
//          ps1.js once loaded; a partition first hid him from every camera at the front), and above his seat a round
//          dome light: the moon he saw. His bag takes the aisle seat beside him.
//          Spots (BUS): SEAT (the pans' height), ROWS (row z, the pan's centre), X (aisle and window seat centres on the
//          right; the left side is the mirror), SAXO (his window seat), BAG, AISLE (where Compote stands), POLES,
//          DRIVER (the driver's seat), WHEEL_Z, DOME ([x, y, z]), POSTER ([x, y, z], on the right wall, facing -x),
//          PANEL (the z span of the wide wall panel it hangs on).
//          Flags read by anim(t, P): `stare` ([x, z]: the passengers turn their heads to look there), `speed` (m/s),
//          `noPax`, `clear` ([[x, z, r], ...]: no passenger within r of those points: a lens in a row), `flicker` ([a, b]
//          cut s: the strips stutter), `dome` (the dome light's brightness, 1), `bag` (false hides it).
import { mapKit } from './mapkit.js';

export const SHORE = { WALK_Z: -1.3, WATER_Z: -2.7, DECK: 2.6, PIER_X: [10.2, 14.2], PIER_Z: [24, -52], END: [12, -60], WHEEL: [12, 13.0, -67.5], WHEEL_R: 8.6, KIOSK: [16.4, -56.6], BENCH: [12, -59.5], MOON: [6, 34, -172] };
export const BUS = { SEAT: 0.3, W: 1.26, H: 2.42, FRONT: -6.2, BACK: 6.2, ROWS: [-2.9, -1.95, -1.0, 0.9, 1.85, 2.8, 3.75, 4.7], X: [0.47, 0.97], SAXO: [0.97, 0.9], BAG: [0.47, 0.9], AISLE: [0.02, 0.92], POLES: [[0.2, -3.4], [0.2, -0.45], [0.22, 1.42], [0.2, 2.35], [0.2, 4.25]], DRIVER: [-0.72, -4.75], WHEEL_Z: -5.3, DOME: [0.72, 2.42, 0.95], POSTER: [1.2, 1.28, 0.2], PANEL: [-0.45, 0.72] };

export function buildBubbleMaps(K) {
  const k = mapKit(K);
  const { THREE, mat, tex, px, noise, box, selfLit, U, TAU, PI, hash, fr, beat, grad, cyl, cone, sph, ico, at, rot, merged, flat, lights, pt, stars } = k;
  const M = (c, o = {}) => mat({ color: c, ...o }), glow = c => mat({ color: c, unlit: 1 });
  const dome = (stops, r) => new THREE.Mesh(new THREE.SphereGeometry(r, 16, 12), mat({ map: grad(stops), unlit: 1, nofog: 1, side: THREE.BackSide }));

  // a background pet (a stroller, a passenger): box body, big head facing +z, ears by kind
  const FURS = [0xd8c2a0, 0x3a2e28, 0xf2eee6, 0x9a7a5a, 0x6a6a72, 0xe8a060, 0x2a2a30, 0xc8b8e0], TOPS = [0xe84a6a, 0x4a8fe8, 0xf2c94c, 0x6bd46b, 0xffffff, 0xff9a3c, 0x8a5ad8, 0x2a2a3a];
  function pet(i) {
    const g = new THREE.Group(), fur = M(FURS[i % FURS.length]), kind = i % 3, top = M(TOPS[(i * 5) % TOPS.length]);
    g.add(at(box(0.36, 0.44, 0.26, top), 0, 0.3, 0));
    for (const s of [-1, 1]) g.add(at(box(0.11, 0.12, 0.12, fur), s * 0.09, 0.06, 0.02));
    const head = at(box(0.42, 0.38, 0.38, fur), 0, 0.72, 0); g.add(head);
    head.add(at(box(0.15, 0.1, 0.1, M(0x1a1a1a)), 0, -0.06, 0.2));
    for (const e of [-1, 1]) {
      head.add(at(box(0.06, 0.06, 0.02, M(0x101010)), e * 0.1, 0.04, 0.195));
      head.add(kind === 0 ? rot(at(cone(0.08, 0.2, 4, fur), e * 0.14, 0.26, 0), 0, 0, -e * 0.25) : kind === 1 ? at(box(0.08, 0.3, 0.06, fur), e * 0.1, 0.32, 0) : rot(at(box(0.07, 0.24, 0.16, fur), e * 0.24, -0.02, 0), 0, 0, e * 0.35));
    }
    return { g, head, i };
  }

  // =====================================================================================================================
  function shore() {
    const G = new THREE.Group(), { WALK_Z, WATER_Z, DECK, PIER_X, PIER_Z, END, WHEEL, WHEEL_R, KIOSK, BENCH, MOON } = SHORE;
    const [PX0, PX1] = PIER_X, PXC = (PX0 + PX1) / 2;
    // ---- the sky domes (the upper half of the gradient runs zenith to horizon; below it, the horizon's colour) ----
    const skyDusk = dome([[0, '#231a54'], [0.2, '#4a3278'], [0.36, '#b85e98'], [0.45, '#f08c86'], [0.5, '#ffbf8a'], [1, '#ffbf8a']], 190);
    const skyNight = dome([[0, '#04051a'], [0.25, '#0e1440'], [0.42, '#2a2456'], [0.5, '#46346a'], [1, '#46346a']], 190);
    G.add(skyDusk); G.add(skyNight);
    // ---- the sand: a wet band mirroring the sky at the waterline, drier and paler up the beach ----
    const wetT = tex(4, 64, x => { const g = x.createLinearGradient(0, 0, 0, 64); g.addColorStop(0, '#caa6b8'); g.addColorStop(0.35, '#9a7a9a'); g.addColorStop(0.7, '#7a6a8a'); g.addColorStop(1, '#8a7a8e'); x.fillStyle = g; x.fillRect(0, 0, 4, 64); });
    const wetM = mat({ map: wetT, unlit: 0.25 }); G.add(flat(240, 7.5, wetM, 0, 0, WATER_Z + 3.75));
    const sandT = tex(32, 32, (x, r) => { px(x, '#b8a08a', 0, 0, 32, 32); noise(x, r, 32, 32, ['#ae9680', '#c2aa94', '#a88e7a'], 220); }, 1201);
    G.add(flat(240, 60, mat({ map: sandT, rep: [80, 20] }), 0, -0.004, WATER_Z + 37.5));
    const glintM = glow(0xffd8e8), glints = [];
    for (let i = 0; i < 70; i++) { const g = box(0.12 + hash(i, 1202) * 0.3, 0.004, 0.03, glintM); g.position.set((hash(i, 1203) - 0.5) * 40, 0.006, WATER_Z + 0.3 + hash(i, 1204) * 3.6); G.add(g); glints.push([g, i]); }
    // ---- the sea: violet water with the sky's sheen, the wash sliding up the sand, a foam line ----
    const seaT = tex(32, 32, (x, r) => { px(x, '#3a2e62', 0, 0, 32, 32); noise(x, r, 32, 32, ['#46387a', '#322856', '#5a3e7e', '#3e3470'], 260); for (let i = 0; i < 9; i++) px(x, '#c88ab0', Math.floor(r() * 28), Math.floor(r() * 32), 4, 1); }, 1205);
    const seaM = mat({ map: seaT, rep: [70, 60] }); G.add(flat(400, 300, seaM, 0, -0.03, WATER_Z - 150));
    const washM = mat({ color: 0xb8a8d8, unlit: 0.35 }), wash = flat(240, 1, washM, 0, 0.004, WATER_Z); G.add(wash);
    const foam = at(box(240, 0.02, 0.14, glow(0xf4eeff)), 0, 0.012, WATER_Z), foam2 = at(box(240, 0.02, 0.07, M(0xe8e0f8, { unlit: 0.6 })), 0, 0.01, WATER_Z - 2);
    G.add(foam); G.add(foam2);
    // ---- the setting sun (dusk) or a giant full moon (night), stars, the glade on the water ----
    const starsG = stars(220, 180, 1206, 0xfff4ff, 0.08); G.add(starsG);
    const SUN = [-24, 3.5, -170];
    const sun = at(new THREE.Mesh(new THREE.CircleGeometry(12, 16), mat({ color: 0xffb070, unlit: 1, nofog: 1 })), ...SUN); sun.lookAt(0, 3, 0); G.add(sun);
    const sunCore = at(new THREE.Mesh(new THREE.CircleGeometry(8, 16), mat({ color: 0xffe2a8, unlit: 1, nofog: 1 })), SUN[0], SUN[1], SUN[2] + 0.5); sunCore.lookAt(0, 3, 0); G.add(sunCore);
    const moon = new THREE.Group(); moon.position.set(...MOON); G.add(moon);
    moon.add(new THREE.Mesh(new THREE.CircleGeometry(15, 22), mat({ color: 0xfff6e2, unlit: 1, nofog: 1 })));
    for (const [x, y, r] of [[-4, 3, 3.2], [5, -2, 2.4], [1, -7, 1.8], [-6, -5, 1.4], [7, 6, 1.5]]) moon.add(at(new THREE.Mesh(new THREE.CircleGeometry(r, 10), mat({ color: 0xe6dac6, unlit: 1, nofog: 1 })), x, y, 0.05));
    moon.add(at(new THREE.Mesh(new THREE.CircleGeometry(19, 22), mat({ color: 0x5a4a86, unlit: 1, nofog: 1 })), 0, 0, -0.3));   // a halo
    moon.lookAt(0, 3, 0);
    const gladeM = glow(0xffe8f0), glade = [];
    for (let i = 0; i < 90; i++) { const g = box(1.0 + hash(i, 1208) * 2.6, 0.01, 0.3 + hash(i, 1207) * 1.1, gladeM); G.add(g); glade.push([g, i, hash(i, 1207)]); }
    // ---- the city's lights along the coast to the left, low hills behind ----
    const cityT = tex(16, 16, (x, r) => { px(x, '#241c3c', 0, 0, 16, 16); for (let y = 1; y < 16; y += 3) for (let X = 1; X < 16; X += 3) if (r() < 0.5) px(x, 'rgba(255,208,140,0.8)', X, y, 1, 1); selfLit(x, 16, 16); }, 1209);
    const cityM = mat({ map: cityT, rep: [2, 2] }), hillM = M(0x2a2040);
    for (let i = 0; i < 24; i++) {
      const u = i / 23, x = -32 - u * 88 + hash(i, 1210) * 6, z = -22 - u * 100, w = 5 + hash(i, 1211) * 7, h = 4 + hash(i, 1212) * (i % 5 === 2 ? 24 : 9);
      G.add(at(box(w, h, 5 + hash(i, 1213) * 4, cityM), x, h / 2, z));
    }
    for (let i = 0; i < 6; i++) G.add(at(cone(24 + hash(i, 1214) * 12, 14 + hash(i, 1215) * 10, 6, hillM), -70 - i * 20, 5, -60 - i * 18));
    // ---- the pier: pilings over the sand and the sea, the deck, rails, lamp posts, string lights ----
    const woodT = tex(16, 16, (x, r) => { px(x, '#6a4a3a', 0, 0, 16, 16); noise(x, r, 16, 16, ['#5e4234', '#76523e', '#624636'], 50); for (let y = 0; y < 16; y += 4) px(x, '#3e2a22', 0, y, 16, 1); }, 1216);
    const pileM = M(0x3a2c2a), railM = M(0x5a4232), L = PIER_Z[0] - PIER_Z[1];
    G.add(at(box(PX1 - PX0, 0.26, L, mat({ map: woodT, rep: [1.5, 20] })), PXC, DECK - 0.13, (PIER_Z[0] + PIER_Z[1]) / 2));
    const piles = [];
    for (let z = PIER_Z[0] - 1; z > PIER_Z[1]; z -= 3.2) for (const x of [PX0 + 0.35, PX1 - 0.35]) piles.push(at(new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.24, DECK + 2.6, 6)), x, (DECK - 2.6) / 2, z));
    for (let z = PIER_Z[0] - 1; z > PIER_Z[1]; z -= 6.4) piles.push(at(new THREE.Mesh(new THREE.BoxGeometry(PX1 - PX0 - 0.5, 0.18, 0.18)), PXC, DECK - 0.55, z));
    const rails = [];
    for (const x of [PX0 + 0.08, PX1 - 0.08]) {
      rails.push(at(new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.08, L)), x, DECK + 0.95, (PIER_Z[0] + PIER_Z[1]) / 2));
      rails.push(at(new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.05, L)), x, DECK + 0.5, (PIER_Z[0] + PIER_Z[1]) / 2));
      for (let z = PIER_Z[0]; z > PIER_Z[1]; z -= 2) rails.push(at(new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.95, 0.08)), x, DECK + 0.47, z));
    }
    // the end platform, wider, railed round (the pier arrives in the middle of its near side)
    const [EX, EZ] = END, PW = 16, PD = 22, PZ0 = EZ + 8, PZ1 = EZ - 14;
    G.add(at(box(PW, 0.26, PD, mat({ map: woodT, rep: [6, 8] })), EX, DECK - 0.13, (PZ0 + PZ1) / 2));
    const railRun = (x0, z0, x1, z1) => {
      const len = Math.hypot(x1 - x0, z1 - z0), n = Math.max(1, Math.round(len / 2)), top = at(new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.08, len)), (x0 + x1) / 2, DECK + 0.95, (z0 + z1) / 2);
      top.rotation.y = Math.atan2(x1 - x0, z1 - z0); rails.push(top);
      for (let q = 0; q <= n; q++) rails.push(at(new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.95, 0.08)), x0 + (x1 - x0) * q / n, DECK + 0.47, z0 + (z1 - z0) * q / n));
    };
    railRun(EX - PW / 2 + 0.05, PZ0, EX - PW / 2 + 0.05, PZ1); railRun(EX + PW / 2 - 0.05, PZ0, EX + PW / 2 - 0.05, PZ1); railRun(EX - PW / 2, PZ1 + 0.05, EX + PW / 2, PZ1 + 0.05);
    railRun(EX - PW / 2, PZ0 - 0.05, PX0, PZ0 - 0.05); railRun(PX1, PZ0 - 0.05, EX + PW / 2, PZ0 - 0.05);
    G.add(merged(rails, railM));
    for (let x = EX - PW / 2 + 1; x < EX + PW / 2; x += 3.2) for (let z = PZ0 - 0.6; z > PZ1; z -= 3.2) piles.push(at(new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.26, DECK + 2.6, 6)), x, (DECK - 2.6) / 2, z));
    G.add(merged(piles, pileM));
    // lamp posts with warm globes along the pier's left rail and round the platform
    const lampM = M(0x2a2a30), globeM = glow(0xffd8a0), globes = [], LAMPS = [];
    for (let z = PIER_Z[0] - 4; z > PIER_Z[1]; z -= 9) LAMPS.push([PX0 + 0.12, z]);
    const nPier = LAMPS.length;
    for (const [x, z] of [[EX - PW / 2 + 0.3, PZ0 - 0.4], [EX + PW / 2 - 0.3, PZ0 - 0.4], [EX - PW / 2 + 0.3, EZ - 4], [EX + PW / 2 - 0.3, EZ - 4], [EX - PW / 2 + 0.3, PZ1 + 0.4], [EX + PW / 2 - 0.3, PZ1 + 0.4]]) LAMPS.push([x, z]);
    LAMPS.forEach(([x, z]) => { G.add(at(cyl(0.05, 0.07, 3.1, 5, lampM), x, DECK + 1.55, z)); const gl = at(sph(0.2, 8, 6, globeM), x, DECK + 3.2, z); G.add(gl); globes.push(gl); });
    // string lights: catenaries of coloured bulbs between the pier's lamps, and from the wheel's hub to the platform's lamps
    const bulbM = [0xffd23f, 0xff6a9a, 0x6ad8ff, 0xffffff, 0xb46aff].map(c => glow(c)), bulbs = [];
    const catenary = (a, b, n, sag) => { for (let q = 1; q < n; q++) { const u = q / n, bb = at(box(0.12, 0.12, 0.12, bulbM[(q + bulbs.length) % bulbM.length]), a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u - sag * Math.sin(u * PI), a[2] + (b[2] - a[2]) * u); G.add(bb); bulbs.push([bb, bulbs.length]); } };
    for (let i = 0; i + 1 < nPier; i++) catenary([LAMPS[i][0], DECK + 3.0, LAMPS[i][1]], [LAMPS[i + 1][0], DECK + 3.0, LAMPS[i + 1][1]], 10, 0.6);
    const [WX, WY, WZ] = WHEEL;
    for (let i = nPier; i < LAMPS.length; i++) catenary([WX, WY, WZ], [LAMPS[i][0], DECK + 3.0, LAMPS[i][1]], 16, 1.4);
    // ---- the Ferris wheel: an A-frame on the platform, a turning rim of bulbs, spokes, twelve gondolas ----
    const frameM = M(0xe8e4f0), wheel = new THREE.Group(); wheel.position.set(WX, WY, WZ); G.add(wheel);
    for (const s of [-1, 1]) for (const dz of [-0.9, 0.9]) { const dx = s * 5.2, lg = WY - DECK, leg = at(box(0.3, Math.hypot(dx, lg), 0.3, frameM), WX + dx / 2, DECK + lg / 2, WZ + dz); leg.rotation.z = Math.atan2(dx, lg); G.add(leg); }
    const rim = new THREE.Group(); wheel.add(rim);
    const rimM = M(0xf4f0ff), spokeM = M(0xd8d0e8), N = 24, segL = 2 * WHEEL_R * Math.sin(PI / N) + 0.05;
    for (let q = 0; q < N; q++) for (const dz of [-0.7, 0.7]) { const a = (q + 0.5) / N * TAU, seg = box(segL, 0.2, 0.2, rimM); seg.position.set(Math.cos(a) * WHEEL_R, Math.sin(a) * WHEEL_R, dz); seg.rotation.z = a + PI / 2; rim.add(seg); }
    for (let q = 0; q < 12; q++) { const a = q / 12 * TAU, sp = box(WHEEL_R, 0.1, 0.1, spokeM); sp.position.set(Math.cos(a) * WHEEL_R / 2, Math.sin(a) * WHEEL_R / 2, 0); sp.rotation.z = a; rim.add(sp); }
    rim.add(rot(cyl(0.7, 0.7, 1.8, 10, M(0xff5fa2)), PI / 2, 0, 0));
    const rimBulbs = [];
    for (let q = 0; q < 48; q++) { const a = q / 48 * TAU, bb = box(0.24, 0.24, 0.24, bulbM[q % bulbM.length]); bb.position.set(Math.cos(a) * (WHEEL_R + 0.18), Math.sin(a) * (WHEEL_R + 0.18), 0.74); rim.add(bb); rimBulbs.push([bb, q]); }
    const gondC = [0xff8fb8, 0x8fd8ff, 0xffe08a, 0xb8a0f8, 0xa8f0c0, 0xff9a6a], gonds = [];
    for (let q = 0; q < 12; q++) {
      const g = new THREE.Group();
      g.add(at(box(1.3, 0.9, 1.1, M(gondC[q % gondC.length])), 0, -1.0, 0)); g.add(at(box(1.4, 0.12, 1.2, M(0xf4f0ff)), 0, -0.5, 0)); g.add(at(box(1.1, 0.3, 1.12, glow(0xfff0c8)), 0, -0.78, 0));
      g.add(at(box(0.06, 0.5, 0.06, spokeM), 0, -0.25, 0));
      wheel.add(g); gonds.push([g, q]);
    }
    // ---- the ticket kiosk (the operator stands behind its counter, facing +z), the date bench, strollers ----
    const [KX, KZ] = KIOSK, kiosk = new THREE.Group(), stripeT = tex(16, 4, x => { for (let q = 0; q < 16; q += 4) { px(x, '#ff5fa2', q, 0, 2, 4); px(x, '#fff4f8', q + 2, 0, 2, 4); } });
    kiosk.add(at(box(1.9, 0.6, 0.4, M(0x7a3a5a)), 0, 0.3, 0.55)); kiosk.add(at(box(1.95, 0.06, 0.5, M(0xf0e0e8)), 0, 0.63, 0.55));   // a low counter: the operator shows from the chest up
    kiosk.add(at(box(0.16, 0.16, 0.16, glow(0xffe0a0)), 0, 2.15, 0.1));
    for (const [x, z] of [[-0.92, 0.72], [0.92, 0.72], [-0.92, -0.8], [0.92, -0.8]]) kiosk.add(at(box(0.08, 2.3, 0.08, M(0xf0e0e8)), x, 1.15, z));
    kiosk.add(at(box(2.3, 0.14, 2.0, mat({ map: stripeT, rep: [3, 1] })), 0, 2.36, 0));
    kiosk.add(at(new THREE.Mesh(new THREE.PlaneGeometry(1.6, 0.4), mat({ map: tex(48, 12, x => { px(x, '#2a1a3a', 0, 0, 48, 12); x.fillStyle = '#ffd23f'; x.font = 'bold 10px monospace'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('TICKETS', 24, 6.5); }), unlit: 0.9 })), 0, 2.05, 0.74));
    kiosk.add(at(box(1.8, 1.9, 0.06, M(0xc86a9a)), 0, 0.95, -0.85));
    G.add(at(kiosk, KX, DECK, KZ));
    const [BX, BZ] = BENCH, bench = new THREE.Group(), benchM = M(0x8a5a3a);
    bench.add(at(box(1.7, 0.06, 0.45, benchM), 0, 0.27, 0)); bench.add(at(box(1.7, 0.42, 0.06, benchM), 0, 0.55, -0.24));
    for (const dx of [-0.75, 0.75]) bench.add(at(box(0.06, 0.26, 0.4, lampM), dx, 0.12, 0));
    G.add(at(bench, BX, DECK, BZ));
    const strollers = [[EX + 5.6, EZ + 3.2, -2.2], [EX + 6.3, EZ + 2.6, -2.4], [EX - 5.8, EZ - 8, 0.4], [EX - 5.1, EZ - 8.7, 0.6], [EX + 4.5, EZ - 10, 3.1], [EX - 4.8, EZ + 5.5, 1.6]].map(([x, z, y], i) => { const p = pet(i + 3); p.g.position.set(x, DECK, z); p.g.rotation.y = y; G.add(p.g); return p; });
    const walkers = [[-16, 9, 0.8], [-23, 15, -0.6], [27, 11, 2.2]].map(([x, z, y], i) => { const p = pet(i + 20); p.g.position.set(x, 0, z); p.g.rotation.y = y; p.g.scale.setScalar(0.9); G.add(p.g); return p; });
    // ---- soap bubbles drifting (flag `bubbles`): see-through, pastel, a white glint each ----
    const bubM = [0xff9ad8, 0x9af0ff, 0xfff09a, 0xc8a8ff].map(c => mat({ color: c, unlit: 0.7, see: 0.6 })), glintW = glow(0xffffff), bubs = [];
    for (let i = 0; i < 26; i++) { const b = new THREE.Group(), r = 0.07 + hash(i, 1220) * 0.12; b.add(ico(r, 1, bubM[i % 4])); b.add(at(box(r * 0.35, r * 0.35, r * 0.2, glintW), -r * 0.4, r * 0.45, r * 0.8)); G.add(b); bubs.push([b, i]); }

    return {
      group: G, sky: grad([[0, '#231a54'], [1, '#ffbf8a']]), shadowCol: 0x4a3a5a,
      light() {
        lights(0x9a86b0, 0xffb090, [0.45, -0.35, 0.8], 0xb0668e, [40, 190], 9.5);
        pt(0, EX - 3, DECK + 3.4, EZ + 4, 1.3, 0.95, 0.6); pt(1, KIOSK[0], DECK + 2.0, KIOSK[1] + 1.3, 1.1, 0.85, 0.7);   // the kiosk's bulb on its operator pt(2, PXC, DECK + 3.0, -10, 0.8, 0.6, 0.45);
      },
      anim(t, P = {}) {
        const b = beat(t), c = P.t0 != null ? t - P.t0 : 0, bo = !!P.blackout && c >= P.blackout[0] && c < P.blackout[1], night = !!P.night || bo;
        let lamps = 1; if (P.lightsOff != null && c >= P.lightsOff) lamps = 0; if (P.lightsOn != null && c >= P.lightsOn) lamps = 1.35; if (bo) lamps = 0;
        skyDusk.visible = !night; skyNight.visible = night;
        if (night) { U.uAmb.value.set(0x6a6a9c); U.uDirCol.value.set(0xb8c4ff); U.uDirDir.value.set(-0.05, -0.32, 0.95).normalize(); U.uFogCol.value.set(0x241c46); U.uFog.value.set(50, 190); }
        if (bo) { U.uAmb.value.set(0x2e2c4a); U.uDirCol.value.set(0x5a6090); }
        for (let i = 0; i < 3; i++) U.uPtCol.value[i].multiplyScalar(lamps);
        if (P.key) pt(3, P.key[0], P.key[1], P.key[2], P.key[3], P.key[4], P.key[5]);
        sun.visible = sunCore.visible = !night; moon.visible = night; starsG.visible = night;
        wetM.uniforms.uCol.value.set(night ? 0x8a8ab8 : 0xffffff);
        seaM.uniforms.uOff.value.set(0.004 * t, 0.02 * Math.sin(t * 0.21));
        // the wash: the sea slides up the sand and back every ~4.4 s, the foam riding its edge
        const w = 0.5 + 0.5 * Math.sin(t * TAU / 4.4), edge = WATER_Z + 0.25 + 1.3 * w;
        wash.scale.set(1, Math.max(0.02, edge - WATER_Z), 1); wash.position.z = (WATER_Z + edge) / 2; foam.position.z = edge; foam.scale.z = 0.6 + 0.8 * (1 - w);
        foam2.position.z = WATER_Z - 1.6 - 1.2 * fr(t / 4.4);
        glints.forEach(([g, i]) => { g.visible = !bo && Math.sin(t * 2.3 + i * 1.7) > 0.35; });
        // the glade: bright bars on the water along the line from the beach to the sun or the moon, twinkling
        const src = night ? MOON : SUN;
        glade.forEach(([g, i, u]) => { const z = WATER_Z - 3 - u * u * 150, xl = src[0] * (z / src[2]); g.position.set(xl + (hash(i, 1221) - 0.5) * (0.8 - z * 0.05), -0.015, z); g.visible = Math.sin(t * 3.1 + i * 2.3) > -0.2; g.material.uniforms.uCol.value.set(night ? 0xe8ecff : 0xffd0a0); });
        // the pier's lights, the string lights twinkling on the beat, the wheel turning with its bulbs chasing
        globes.forEach(gl => { gl.visible = lamps > 0; });
        bulbs.forEach(([bb, i]) => { bb.visible = lamps > 0 && (i + Math.floor(b)) % 5 !== 0; });
        const spin = t * 0.055 * (P.wheel ?? 1); rim.rotation.z = spin;
        rimBulbs.forEach(([bb, q]) => { bb.visible = lamps > 0 && (q + Math.floor(b * 2)) % 4 !== 0; });
        gonds.forEach(([g, q]) => { const a = q / 12 * TAU + spin; g.position.set(Math.cos(a) * WHEEL_R, Math.sin(a) * WHEEL_R, 0); g.rotation.z = 0.04 * Math.sin(t * 0.9 + q); });
        strollers.forEach(p => { p.g.visible = !P.noguests; p.head.rotation.z = 0.06 * Math.sin(b * PI * 0.5 + p.i); });
        walkers.forEach(p => { p.g.visible = !P.noguests; });
        // soap bubbles: each rises and drifts on its own loop round the spot (pure in t)
        const [bx, bz, by = 0] = P.bubblesAt || [0, WALK_Z + 1], nb = P.bubbles ? (P.bubbles === true ? 26 : P.bubbles) : 0;
        bubs.forEach(([bb, i]) => { bb.visible = i < nb; if (!bb.visible) return; const u = fr(t * (0.07 + hash(i, 1222) * 0.06) + hash(i, 1223)); bb.position.set(bx + (hash(i, 1224) - 0.5) * 5 + 0.5 * Math.sin(t * 0.7 + i), by + 0.3 + u * 3.2, bz + (hash(i, 1225) - 0.5) * 4 + 0.4 * Math.cos(t * 0.5 + i * 2)); bb.rotation.set(t * 0.3 + i, t * 0.4, 0); });
      },
    };
  }

  // =====================================================================================================================
  function bus() {
    const G = new THREE.Group(), world = new THREE.Group(); G.add(world);
    const { SEAT, W, H, FRONT, BACK, ROWS, X, DRIVER, WHEEL_Z, DOME, POSTER, PANEL, POLES } = BUS, LEN = BACK - FRONT, ZC = (FRONT + BACK) / 2;
    // ---- floor, walls with window holes (0.8 to 1.95 m), ceiling, back wall ----
    const floorT = tex(16, 16, (x, r) => { px(x, '#3a3a44', 0, 0, 16, 16); noise(x, r, 16, 16, ['#34343e', '#42424c', '#30303a'], 70); for (let i = 0; i < 16; i += 4) px(x, '#4a4a56', i, 0, 1, 16); }, 1301);
    G.add(flat(W * 2, LEN, mat({ map: floorT, rep: [2, LEN / 1.2] }), 0, 0, ZC));
    const WY0 = 0.8, WY1 = 1.95, wallM = M(0xc8ccd4), lowM = M(0x6a7a9a), trimM = M(0x2a2e3a);
    for (const s of [-1, 1]) {
      G.add(at(box(0.08, WY0, LEN, lowM), s * W, WY0 / 2, ZC));
      G.add(at(box(0.08, H - WY1, LEN, wallM), s * W, (WY1 + H) / 2, ZC));
      for (const z of [FRONT + 1.6, -3.4, -1.45, 2.35, 4.25, BACK - 0.1]) G.add(at(box(0.1, WY1 - WY0, 0.22, wallM), s * W, (WY0 + WY1) / 2, z));
      G.add(at(box(0.1, WY1 - WY0, PANEL[1] - PANEL[0], wallM), s * W, (WY0 + WY1) / 2, (PANEL[0] + PANEL[1]) / 2));   // the wide panel by the middle door (the ad's, on the right)
      G.add(at(box(0.1, 0.06, LEN, trimM), s * (W - 0.02), WY0, ZC)); G.add(at(box(0.1, 0.05, LEN, trimM), s * (W - 0.02), WY1, ZC));
    }
    const ceilT = tex(16, 16, (x, r) => { px(x, '#dde0e8', 0, 0, 16, 16); px(x, '#c4c8d2', 0, 0, 16, 1); noise(x, r, 16, 16, ['#d4d8e0', '#e4e6ec'], 30); }, 1302);
    G.add(at(box(W * 2, 0.06, LEN, mat({ map: ceilT, rep: [2, LEN / 1.4] })), 0, H + 0.03, ZC));
    G.add(at(box(W * 2, H, 0.08, M(0x8a92a8)), 0, H / 2, BACK));
    // the ad strip above the windows, and the fluorescent strips along the ceiling
    const adT = tex(64, 8, (x, r) => { for (let i = 0; i < 64; i += 8) { px(x, ['#ff5fa2', '#3a8ae8', '#ffd23f', '#6bd46b', '#b46aff', '#ff8a3a'][Math.floor(r() * 6)], i, 0, 7, 8); px(x, '#ffffff', i + 1, 2, 5, 1); px(x, '#1a1a2a', i + 1, 5, 3, 1); } }, 1303);
    for (const s of [-1, 1]) G.add(rot(at(box(0.03, 0.26, LEN - 2, mat({ map: adT, rep: [LEN / 8, 1] })), s * (W - 0.12), 2.12, ZC + 0.5), 0, 0, s * 0.35));
    const strips = [-1, 1].map(s => { const st = at(box(0.12, 0.04, LEN - 1.5, glow(0xf0fbff)), s * 0.72, H - 0.02, ZC + 0.4); G.add(st); return st; });
    // the dome light over Saxo's seat: a round white disc, the moon he thought he saw
    const domeM = mat({ color: 0xfff6e2, unlit: 1 });   // the moon's cream, for the match cut
    G.add(at(cyl(0.24, 0.26, 0.04, 16, domeM), DOME[0], DOME[1] - 0.04, DOME[2])); G.add(at(cyl(0.3, 0.3, 0.02, 16, M(0xa8acb8)), DOME[0], DOME[1] - 0.012, DOME[2]));
    // ---- seats: blue patterned pans and backs facing the front ----
    const fab = tex(8, 8, (x, r) => { px(x, '#2a4a9a', 0, 0, 8, 8); noise(x, r, 8, 8, ['#24408a', '#3258ac'], 12); px(x, '#ff5fa2', 1, 1, 1, 1); px(x, '#ffd23f', 5, 5, 1, 1); px(x, '#6ad8ff', 5, 1, 1, 1); }, 1304);
    const seatParts = [], shellParts = [];
    const seat = (x, z) => {
      seatParts.push(at(new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.1, 0.46)), x, SEAT - 0.05, z));
      const back = at(new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.62, 0.1)), x, SEAT + 0.33, z + 0.27); back.rotation.x = 0.1; seatParts.push(back);
      const sh = at(new THREE.Mesh(new THREE.BoxGeometry(0.47, 0.64, 0.03)), x, SEAT + 0.33, z + 0.33); sh.rotation.x = 0.1; shellParts.push(sh);
      shellParts.push(at(new THREE.Mesh(new THREE.BoxGeometry(0.36, SEAT - 0.1, 0.08)), x, (SEAT - 0.1) / 2, z + 0.1));
    };
    for (const z of ROWS) for (const s of [-1, 1]) for (const x of X) seat(s * x, z);
    G.add(merged(seatParts, mat({ map: fab, rep: [2, 2] }))); G.add(merged(shellParts, M(0x9aa2b4)));
    // the perfume ad on the wall panel in front of Saxo's window seat, at his eye level, in a gold frame (facing -x)
    const posterMat = mat({ color: 0xff8fc0, unlit: 0.6 }), poster = new THREE.Mesh(new THREE.PlaneGeometry(0.72, 1.0), posterMat);
    poster.position.set(POSTER[0] - 0.02, POSTER[1], POSTER[2]); poster.rotation.y = -PI / 2; G.add(poster);
    G.add(at(box(0.02, 1.06, 0.78, M(0xd8b04a)), POSTER[0], POSTER[1], POSTER[2]));
    // poles: yellow uprights at the aisle, a rail along the ceiling, red stop buttons
    const poleParts = [];
    for (const [px0, z] of POLES) for (const s of [-1, 1]) poleParts.push(at(new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, H)), s * px0, H / 2, z));
    for (const s of [-1, 1]) poleParts.push(at(new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.05, LEN - 3)), s * 0.28, H - 0.28, ZC + 1.2));
    G.add(merged(poleParts, M(0xffc81a)));
    for (const [px0, z] of POLES) for (const s of [-1, 1]) G.add(at(box(0.07, 0.06, 0.07, glow(0xff2a3a)), s * px0, 1.15, z + 0.05));
    // ---- the driver's cab: the seat, the big flat wheel, the dashboard, a ticket machine, the windshield ----
    const [DX, DZ] = DRIVER;
    G.add(at(box(0.52, 0.1, 0.5, M(0x2a2a30)), DX, SEAT - 0.05, DZ)); G.add(rot(at(box(0.52, 0.75, 0.1, M(0x2a2a30)), DX, SEAT + 0.4, DZ + 0.3), 0.12, 0, 0));
    const wheelG = new THREE.Group(); wheelG.position.set(DX, 0.78, WHEEL_Z); wheelG.rotation.x = -1.05; G.add(wheelG);
    wheelG.add(new THREE.Mesh(new THREE.TorusGeometry(0.26, 0.03, 4, 14), M(0x1a1a20))); for (let q = 0; q < 3; q++) wheelG.add(rot(box(0.5, 0.03, 0.02, M(0x1a1a20)), 0, 0, q * PI / 3));
    G.add(at(rot(cyl(0.04, 0.04, 0.5, 6, M(0x1a1a20)), -0.55, 0, 0), DX, 0.55, WHEEL_Z - 0.12));
    G.add(at(box(W * 2, 0.7, 0.5, M(0x3a3a44)), 0, 0.55, FRONT + 0.45));
    const dashT = tex(32, 8, (x, r) => { px(x, '#1a1a22', 0, 0, 32, 8); for (let i = 0; i < 10; i++) px(x, ['#3adf6a', '#ff9a2a', '#6ad8ff', '#ff3a4a'][Math.floor(r() * 4)], 2 + Math.floor(r() * 28), 2 + Math.floor(r() * 4), 1, 1); selfLit(x, 32, 8); }, 1305);
    G.add(at(rot(new THREE.Mesh(new THREE.PlaneGeometry(1.0, 0.25), mat({ map: dashT, unlit: 0.8 })), -0.6, 0, 0), DX, 0.93, FRONT + 0.3));
    G.add(at(box(0.3, 0.5, 0.25, M(0x5a6070)), DX + 0.62, 1.05, DZ + 0.2)); G.add(at(box(0.18, 0.1, 0.02, glow(0x3adf6a)), DX + 0.62, 1.2, DZ + 0.34));
    G.add(at(box(W * 2, 0.5, 0.08, M(0x2a2e3a)), 0, H - 0.25, FRONT));
    G.add(at(box(0.6, 0.3, 0.05, glow(0xff9a2a)), 0, H - 0.25, FRONT + 0.05));
    // ---- the street outside: it scrolls past the still bus (+z), lamps sweeping their glow through the cabin ----
    const roadM = mat({ map: tex(16, 16, (x, r) => { px(x, '#1e1e26', 0, 0, 16, 16); noise(x, r, 16, 16, ['#1a1a22', '#26262e'], 40); px(x, '#e8e0c0', 7, 0, 2, 8); }, 1306), rep: [3, 40] });
    world.add(flat(40, 380, roadM, 0, -0.7, -100));
    for (const s of [-1, 1]) world.add(flat(5, 380, M(0x4a4a56), s * 6.5, -0.55, -100));
    const facM = [0, 1, 2, 3].map(q => mat({ map: tex(16, 32, (x, r) => { px(x, ['#3a2e3e', '#2e3446', '#44343a', '#2a3a3a'][q], 0, 0, 16, 32); for (let y = 2; y < 32; y += 5) for (let X = 1; X < 16; X += 4) { x.fillStyle = r() < 0.55 ? 'rgba(255,214,140,0.8)' : '#1a1a24'; x.fillRect(X, y, 2, 3); } px(x, 'rgba(120,220,255,0.8)', 0, 28, 16, 3); selfLit(x, 16, 32); }, 1310 + q), rep: [2, 2] }));
    const WRAP = 240, blocks = [], lamps = [], neons = [], cars = [];
    for (let i = 0; i < 16; i++) for (const s of [-1, 1]) { const w = 6 + hash(i, s + 1311) * 5, h = 7 + hash(i, s + 1312) * 12, bl = box(4, h, w, facM[(i + (s > 0 ? 2 : 0)) % 4]); bl.position.set(s * 11, h / 2 - 0.55, 0); world.add(bl); blocks.push([bl, i * 15 + (s > 0 ? 7 : 0)]); }
    for (let i = 0; i < 12; i++) for (const s of [-1, 1]) { const g = new THREE.Group(); g.add(at(cyl(0.06, 0.08, 4.6, 5, M(0x30303a)), 0, 1.75, 0)); g.add(at(box(0.5, 0.18, 0.28, glow(0xffb45a)), -s * 0.3, 4.05, 0)); g.position.x = s * 4.6; world.add(g); lamps.push([g, i * 20 + (s > 0 ? 10 : 0)]); }
    const neonC = [0xff3aa0, 0x3ad8ff, 0xffe03a, 0x9a5aff];
    for (let i = 0; i < 10; i++) { const n = box(0.2, 0.8, 2.4, glow(neonC[i % 4])); n.position.set((i % 2 ? 1 : -1) * 8.9, 2.4, 0); world.add(n); neons.push([n, i * 24 + 5]); }
    for (let i = 0; i < 4; i++) { const cg = new THREE.Group(); cg.add(box(1.7, 0.6, 3.8, M([0xd8322a, 0xf2f2f2, 0x2a5ad8, 0x2a2a30][i]))); cg.add(at(box(1.5, 0.5, 2.0, M(0x1a1e2a)), 0, 0.5, 0.2)); for (const sx of [-0.6, 0.6]) cg.add(at(box(0.25, 0.12, 0.05, glow(0xff2a2a)), sx, 0.05, 1.92)); cg.position.set(i % 2 ? 2.8 : -2.8, -0.35, 0); world.add(cg); cars.push([cg, i]); }
    // ---- passengers: pets in the other rows facing the front; they can all turn to stare (flag `stare`) ----
    const pax = [];
    ROWS.forEach((z, r) => [-1, 1].forEach(s => X.forEach((x, j) => {
      const i = r * 5 + j * 2 + (s > 0 ? 1 : 0);
      if (s > 0 && Math.abs(z - BUS.SAXO[1]) < 0.3) return;                                     // his row: him and his bag
      if (hash(i, 1320) < 0.35 && !(s > 0 && Math.abs(z - 1.85) < 0.1)) return;                 // the row behind him is full
      const p = pet(i); p.g.position.set(s * x, SEAT - 0.1, z + 0.05); p.g.rotation.y = PI; G.add(p.g); pax.push([p, s * x, z]);
    })));
    const bag = new THREE.Group(); bag.add(at(box(0.44, 0.34, 0.36, M(0xff4f9a)), 0, 0.17, 0)); bag.add(at(box(0.45, 0.06, 0.37, M(0xffffff)), 0, 0.2, 0)); bag.add(at(box(0.04, 0.04, 0.5, M(0x1a1a24)), 0, 0.42, 0));
    bag.position.set(BUS.BAG[0], SEAT, BUS.BAG[1]); G.add(bag);

    return {
      group: G, indoor: true, sky: grad([[0, '#05050e'], [1, '#141428']]), shadowCol: 0x2a2a34, posterMat,
      light() {
        lights(0xa8b4bc, 0xe8f4ff, [0.2, -1, 0.1], 0x10101c, [30, 90], 4.5);   // cold fluorescent, the street's night beyond
        pt(0, 0, 2.2, 0.8, 0.5, 0.55, 0.58); pt(1, 0, 2.2, -3.2, 0.4, 0.44, 0.46);
      },
      anim(t, P = {}) {
        const V = P.speed ?? 8, c = P.t0 != null ? t - P.t0 : 0;
        const fl = !!P.flicker && c >= P.flicker[0] && c < P.flicker[1] && Math.sin(t * 47) + Math.sin(t * 23) > 0.2;
        strips.forEach(st => { st.visible = !fl; }); if (fl) U.uAmb.value.multiplyScalar(0.55);
        domeM.uniforms.uCol.value.setScalar(P.dome ?? 1);
        bag.visible = P.bag !== false;
        const place = (off, sp = 1) => ((off + t * V * sp) % WRAP + WRAP) % WRAP - WRAP * 0.6;
        blocks.forEach(([bl, o]) => { bl.position.z = place(o); });
        lamps.forEach(([g, o]) => { g.position.z = place(o); });
        neons.forEach(([n, o]) => { n.position.z = place(o); });
        cars.forEach(([cg, i]) => { cg.position.z = place(i * 61 + 13, i % 2 ? 0.45 : 1.5); });
        roadM.uniforms.uOff.value.set(0, -t * V / 9.5);
        // the nearest street lamp's orange glow sweeps along the cabin
        let best = null; lamps.forEach(([g]) => { const z = g.position.z; if (z > FRONT - 5 && z < BACK + 5 && (!best || Math.abs(z) < Math.abs(best.position.z))) best = g; });
        if (best) pt(2, Math.sign(best.position.x) * 1.9, 2.6, best.position.z, 0.9, 0.55, 0.22);
        pax.forEach(([p, x, z]) => {
          p.g.visible = !P.noPax && !(P.clear || []).some(([cx, cz, r]) => (x - cx) ** 2 + (z - cz) ** 2 < r * r);
          const bb = beat(t) + p.i * 0.29;
          p.g.position.y = SEAT - 0.1 + 0.012 * Math.abs(Math.sin(bb * PI));
          let yaw = 0.08 * Math.sin(bb * 0.5);
          if (P.stare) { const a = Math.atan2(P.stare[0] - x, P.stare[1] - z) - PI; yaw = Math.max(-1.45, Math.min(1.45, Math.atan2(Math.sin(a), Math.cos(a)))); }
          p.head.rotation.set(0, yaw, 0);
        });
      },
    };
  }
  return { shore: shore(), bus: bus() };
}
