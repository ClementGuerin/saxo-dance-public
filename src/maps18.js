// maps18.js: the "Vamos a la playa" map (2026-09-29, Loona, 2010; the clip: a Mediterranean beach party at midday, the
// singer dancing in the surf, a crowd dancing on the sand, jet-skis, a red vintage convertible on the coast road). Same
// contract as the other map files, pure in t:
//   playa  a Spanish beach at midday: golden sand at y = 0 down to the shore at PLAYA.SHORE (z), then the wet sand
//          sloping under the sea to -0.5 m at z -10 (`floorY(z)`: stand a character in the shallows with that `lift`;
//          SURF, the relief spot, is shin-deep), the turquoise sea (its surface at SEA, see-through near the shore,
//          the shore break washing in and out), the sun over the sea, a headland and a lighthouse; behind the beach the
//          promenade on its sea wall (walkway at WALK_Y, the steps down at STEPS), palms, the pharmacy's green cross
//          with its temperature display (PHARMACY), the coast road with a red 1960s convertible, white houses with blue
//          shutters; on the sand striped parasols, towels, Sadi's towel (SADI), Kob's sunbed under her parasol (KOB,
//          seat top KOB_Y), Compote's sandcastle with a carrot planted on top (CASTLE), a volleyball net (VOLLEY), the
//          beach bar (BAR), the lifeguard chair (TOWER), jet-skis crossing the bay; pets in swimsuits on the towels, at
//          the net, at the bar and in the water.
//          Flags read by anim(t, P): `hop` (s into the shot, or { group: s }: those pets stand up and hop from foot to
//          foot on the half beat, paws flapping: the hot-sand dance; groups 0 left towels, 1 volleyball, 2 bar, 3 right
//          towels, 5 the shore), `rows` ([cx, cz, cols, rows, dx, dz, yaw]: every hopping pet in a block of rows, in
//          sync: the dance craze), `rush` ([s0, dur]: from s0 every pet runs into the sea, to its spot in the
//          shallows), `sea` (every pet already in the shallows, dancing: paws up, flapping), `stare` ([x, z]), `cheer`,
//          `sizzle` ([[x, z, from?], ...]: smoke puffs off the scorching sand under those points on every half beat, from `from` s into the shot; hopping
//          pets make their own), `steam` ([[x, z, s, size], ...]: a burst of steam off the water s into the shot),
//          `wisps` ([[x, z, lens?], ...]: steam rising steadily off the water there; every pet in the sea steams too with
//          `steamAll`), `splash` ([[x, z, s, size]]: drops and a ring where someone jumps in), `temp` (the pharmacy's display: a number, or [from, to] over the shot; `noSign` hides the sign), `castle` (1
//          intact, 0 flattened) and `castleAt` (s into the shot: it collapses then), `noguests`, `clear` ([[x, z, r]]:
//          no pet near those points).
import { mapKit } from './mapkit.js';

export const PLAYA = { SEA: -0.06, SHORE: -6.2, DEEP: -10, DEEP_Y: -0.5, SURF: [0.2, -8.3], STEPS: [0, 7.9], WALL: 9.6, WALK_Y: 0.9,
  SADI: [-2.3, 3.2], KOB: [3.9, 2.4], KOB_Y: 0.34, CASTLE: [-2.6, -2.8], VOLLEY: [-8.6, -1.0], BAR: [9.6, 6.0], TOWER: [8.6, -3.8],
  PHARMACY: [-2.3, 10.3], CAR: [6.0, 15.6], COOLER: [0.9, 4.7] };
// the sand's height at z: flat to the shore, then sloping into the sea to DEEP_Y at DEEP
export const floorY = z => z >= PLAYA.SHORE ? 0 : z <= PLAYA.DEEP ? PLAYA.DEEP_Y : PLAYA.DEEP_Y * (PLAYA.SHORE - z) / (PLAYA.SHORE - PLAYA.DEEP);

export function buildPlayaMaps(K) {
  const k = mapKit(K);
  const { THREE, mat, tex, px, noise, box, TAU, PI, hash, beat, grad, sign, cyl, cone, at, rot, merged, flat, lights, pt, fr } = k;
  const M = (c, o = {}) => mat({ color: c, ...o }), glow = c => mat({ color: c, unlit: 1 });
  const pmod = (a, n) => ((a % n) + n) % n;   // before the first beat the beat index is negative
  const sm = u => { const v = Math.min(1, Math.max(0, u)); return v * v * (3 - 2 * v); };
  const cleared = (P, x, z) => (P.clear || []).some(([cx, cz, r]) => (x - cx) ** 2 + (z - cz) ** 2 < r * r);
  const { SEA, SHORE, DEEP, DEEP_Y, WALL, WALK_Y, SADI, KOB, KOB_Y, CASTLE, VOLLEY, BAR, TOWER, PHARMACY, CAR } = PLAYA;
  const BEAT = () => 60 / (window.BEATS?.bpm || 131);

  // a beach pet: box body in a swimsuit, legs and arms of its own (the hop lifts one leg at a time and flaps the paws),
  // a faceted head with a snout and dot eyes; kind picks the ears
  // no black fur: a dark pet read as a faceless silhouette (the review, 2026-09-29)
  const FURS = [0xd8c2a0, 0xb08a68, 0xf2eee6, 0x9a7a5a, 0x9a9aa6, 0xe8a060, 0x8a7a6c, 0xc8b0a0], SUITS = [0xff5fa2, 0x3fb4ff, 0xffd43b, 0x5ad46b, 0xff8a3c, 0xa46aff, 0xff4a4a, 0x2ad8c8];
  const eyeM = M(0x101010), noseM = M(0x1a1a1a), glintM = glow(0xffffff);
  function pet(i) {
    const g = new THREE.Group(), fur = M(FURS[i % FURS.length]), suit = M(SUITS[(i * 3) % SUITS.length]), kind = i % 3;
    const body = new THREE.Group(); g.add(body);
    body.add(at(box(0.34, 0.3, 0.24, suit), 0, 0.38, 0));
    body.add(at(box(0.3, 0.12, 0.22, fur), 0, 0.58, 0));
    const legs = [-1, 1].map(s => { const l = new THREE.Group(); l.position.set(s * 0.09, 0.24, 0); l.add(at(box(0.11, 0.24, 0.12, fur), 0, -0.12, 0)); body.add(l); return l; });
    const arms = [-1, 1].map(s => { const a = new THREE.Group(); a.position.set(s * 0.2, 0.58, 0); a.add(at(box(0.08, 0.26, 0.09, fur), 0, -0.12, 0)); body.add(a); return a; });
    const head = at(new THREE.Group(), 0, 0.84, 0); body.add(head);
    const skull = new THREE.Mesh(new THREE.IcosahedronGeometry(0.24, 0), fur); skull.scale.set(1, 0.86, 0.9); head.add(skull);
    head.add(at(box(0.14, 0.1, 0.12, fur), 0, -0.05, 0.19)); head.add(at(box(0.07, 0.05, 0.04, noseM), 0, -0.02, 0.26));
    for (const e of [-1, 1]) {
      head.add(at(box(0.05, 0.06, 0.02, eyeM), e * 0.1, 0.05, 0.2)); head.add(at(box(0.02, 0.02, 0.01, glintM), e * 0.1 + 0.012, 0.07, 0.212));
      head.add(kind === 0 ? rot(at(cone(0.07, 0.18, 4, fur), e * 0.13, 0.22, 0), 0, 0, -e * 0.3) : kind === 1 ? at(box(0.07, 0.26, 0.05, fur), e * 0.09, 0.28, 0) : rot(at(box(0.06, 0.22, 0.14, fur), e * 0.23, 0.0, 0), 0, 0, e * 0.35));
    }
    return { g, body, legs, arms, head, i };
  }

  function playa() {
    const G = new THREE.Group();
    // ---------------- the sand, the wet sand sloping under the sea, the sea floor ----------------
    const sandT = tex(32, 32, (x, r) => { px(x, '#ecd296', 0, 0, 32, 32); noise(x, r, 32, 32, ['#e2c486', '#f4dca8', '#dcbc7c'], 260); }, 1801);
    G.add(flat(110, 40 - SHORE, mat({ map: sandT, rep: [55, 23] }), 0, 0, (40 + SHORE) / 2));
    const wetT = tex(32, 32, (x, r) => { px(x, '#c8a870', 0, 0, 32, 32); noise(x, r, 32, 32, ['#bc9c64', '#d0b07a'], 200); }, 1802);
    const slopeLen = Math.hypot(SHORE - DEEP, DEEP_Y);
    const slope = new THREE.Mesh(new THREE.PlaneGeometry(110, slopeLen), mat({ map: wetT, rep: [55, 2] }));
    slope.rotation.x = -PI / 2 - Math.atan2(-DEEP_Y, SHORE - DEEP); slope.position.set(0, DEEP_Y / 2, (SHORE + DEEP) / 2); G.add(slope);
    G.add(flat(110, 40, mat({ map: wetT, rep: [40, 14] }), 0, DEEP_Y, DEEP - 20));
    // ---------------- the sea: see-through turquoise near the shore, deep blue beyond; the shore break ----------------
    const seaT = tex(32, 32, (x, r) => { px(x, '#2ec8d2', 0, 0, 32, 32); noise(x, r, 32, 32, ['#34d2da', '#26b8c6', '#5ce0e2'], 160); for (let i = 0; i < 7; i++) px(x, '#e8fcff', Math.floor(r() * 28), Math.floor(r() * 32), 4, 1); }, 1803);
    const nearM = mat({ map: seaT, rep: [36, 14], unlit: 0.35, see: 0.3 });
    const WATER_Z0 = SHORE - (SEA / DEEP_Y) * (SHORE - DEEP);   // where the slope dips under the surface
    const near = flat(110, WATER_Z0 + 44, nearM, 0, SEA, (WATER_Z0 - 44) / 2); G.add(near);
    const farT = tex(32, 32, (x, r) => { px(x, '#1f7fc0', 0, 0, 32, 32); noise(x, r, 32, 32, ['#2688c8', '#1a70b0', '#3a9ad4'], 160); for (let i = 0; i < 5; i++) px(x, '#cfeeff', Math.floor(r() * 28), Math.floor(r() * 32), 3, 1); }, 1804);
    const farM = mat({ map: farT, rep: [60, 24], unlit: 0.3 });
    G.add(flat(400, 150, farM, 0, SEA - 0.02, -44 - 75));
    const foamM = mat({ color: 0xf6fdff, unlit: 0.7 }), foam2M = mat({ color: 0xf6fdff, unlit: 0.7, see: 0.35 });
    const foam = flat(110, 0.5, foamM, 0, SEA + 0.03, WATER_Z0); G.add(foam);
    const foam2 = flat(110, 0.35, foam2M, 0, SEA + 0.03, WATER_Z0 - 2.5); G.add(foam2);
    // ---------------- the sky: the sun over the sea, clouds, the headland and its lighthouse ----------------
    const sun = new THREE.Mesh(new THREE.CircleGeometry(9, 16), mat({ color: 0xfffbe6, unlit: 1, nofog: 1 })); sun.position.set(38, 62, -160); sun.lookAt(0, 1, 0); G.add(sun);
    const halo = new THREE.Mesh(new THREE.CircleGeometry(17, 16), mat({ color: 0xfff2b0, unlit: 1, nofog: 1, see: 0.55 })); halo.position.set(38.3, 62.1, -160.5); halo.lookAt(0, 1, 0); G.add(halo);
    const cloudM = mat({ color: 0xffffff, unlit: 0.9, nofog: 1 });
    for (const [x, y, z, w] of [[-60, 44, -150, 26], [-20, 52, -165, 18], [70, 40, -150, 22], [10, 36, -170, 14], [-95, 30, -120, 20]]) { G.add(at(box(w, 3, 5, cloudM), x, y, z)); G.add(at(box(w * 0.55, 3, 5, cloudM), x + w * 0.1, y + 2.5, z)); }
    const rockM = M(0x8a7a64), greenM = M(0x5a8a3a), whiteM = M(0xf6f2ea);
    const hills = [];
    for (const [x, z, r, h] of [[-78, -120, 26, 16], [-58, -128, 18, 10], [-96, -110, 20, 22], [-40, -140, 12, 6]]) hills.push(at(new THREE.Mesh(new THREE.ConeGeometry(r, h, 7)), x, h / 2 - 1, z));
    G.add(merged(hills, rockM));
    G.add(at(cone(14, 5, 7, greenM), -80, 15.5, -120));
    G.add(at(cyl(1.1, 1.5, 9, 8, whiteM), -62, 13, -126)); G.add(at(cyl(1.3, 1.3, 1.6, 8, M(0xe8243a)), -62, 18.2, -126)); G.add(at(cyl(0.9, 0.9, 1.2, 8, glow(0xfff6c0)), -62, 19.6, -126));
    for (const [x, z, s] of [[60, -150, 1], [95, -130, 1.3]]) G.add(at(new THREE.Mesh(new THREE.ConeGeometry(30 * s, 12 * s, 6), M(0x9aa8b8)), x, 5 * s, z));   // hazy mountains across the bay
    // ---------------- the promenade: the sea wall, the steps, the balustrade, palms ----------------
    const stoneT = tex(16, 16, (x, r) => { px(x, '#d8ccb4', 0, 0, 16, 16); px(x, '#b8ac94', 0, 7, 16, 1); px(x, '#b8ac94', 7, 0, 1, 8); px(x, '#b8ac94', 13, 8, 1, 8); noise(x, r, 16, 16, ['#cfc3aa', '#e0d4bc'], 40); }, 1805);
    G.add(at(new THREE.Mesh(new THREE.PlaneGeometry(110, WALK_Y), mat({ map: stoneT, rep: [110 / 1.4, 1] })), 0, WALK_Y / 2, WALL));
    const tileT = tex(16, 16, (x, r) => { px(x, '#efe6d2', 0, 0, 16, 16); px(x, '#d6ccb6', 0, 0, 16, 1); px(x, '#d6ccb6', 0, 0, 1, 16); noise(x, r, 16, 16, ['#e8dfca', '#f6eedc'], 30); }, 1806);
    G.add(flat(110, 5, mat({ map: tileT, rep: [110 / 1.5, 5 / 1.5] }), 0, WALK_Y, WALL + 2.5));
    const stepM = mat({ map: stoneT, rep: [2, 1] });
    for (let s = 0; s < 5; s++) { const h = WALK_Y * (s + 1) / 5; G.add(at(box(2.3, h, 0.36, stepM), PLAYA.STEPS[0], h / 2, WALL - 1.8 + s * 0.36 + 0.18)); }
    const balM = M(0xfaf8f2), posts = [];
    for (let x = -55; x <= 55; x += 0.45) if (Math.abs(x - PLAYA.STEPS[0]) > 1.3) posts.push(at(new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.62, 0.09)), x, WALK_Y + 0.31, WALL + 0.15));
    G.add(merged(posts, balM));
    for (const sgn of [-1, 1]) G.add(at(box(55 - 1.3, 0.1, 0.22, balM), sgn * (1.3 + (55 - 1.3) / 2), WALK_Y + 0.66, WALL + 0.15));
    const bark = tex(8, 16, x => { px(x, '#8a5a2e', 0, 0, 8, 16); for (let y = 0; y < 16; y += 3) px(x, '#5e3b1c', 0, y, 8, 1); }, 1807);
    const barkM = mat({ map: bark }), leafM = M(0x2f8f3a, { side: THREE.DoubleSide }), leafM2 = M(0x3fae47, { side: THREE.DoubleSide }), crowns = [];
    for (const [x, z, lean, h] of [[-7, 11.6, 0.2, 9], [7.2, 11.6, -0.2, 10], [-14.5, 11.6, 0.15, 10], [14.6, 11.8, -0.25, 9], [-22, 11.7, 0.2, 9], [22, 11.6, -0.15, 10], [-30, 11.6, 0.1, 10], [30, 11.7, -0.1, 9]]) {
      const p = new THREE.Group(); let top = new THREE.Group(); p.add(top);
      for (let i = 0; i < h; i++) { const seg = new THREE.Mesh(new THREE.CylinderGeometry(0.17 - i * 0.008, 0.21 - i * 0.008, 0.7, 5), barkM); seg.position.y = 0.35; top.add(seg); const nx = new THREE.Group(); nx.position.y = 0.7; nx.rotation.z = lean / h * 2; top.add(nx); top = nx; }
      const crown = new THREE.Group(); top.add(crown);
      for (let i = 0; i < 8; i++) { const lf = new THREE.Group(); lf.rotation.y = i / 8 * TAU; crown.add(lf); const blade = box(2.0, 0.02, 0.5, i % 2 ? leafM : leafM2); blade.position.x = 0.95; blade.rotation.z = -0.5; lf.add(blade); }
      p.position.set(x, WALK_Y, z); G.add(p); crowns.push(crown);
    }
    // the pharmacy's sign on its pole: the green cross, lit, and the temperature under it (`temp`)
    const [phx, phz] = PHARMACY, signG = new THREE.Group(); G.add(signG);   // `noSign` hides it (from the sea it lands in the lyric rows)
    signG.add(at(box(0.12, 3.4, 0.12, M(0x3a3a44)), phx, WALK_Y + 1.7, phz));
    const crossM = glow(0x2ee86a), cross = merged([new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.3, 0.12)), new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.9, 0.12))], crossM);
    cross.position.set(phx, WALK_Y + 3.75, phz - 0.02); signG.add(cross);
    const TEMPS = {};
    const tempTex = n => TEMPS[n] || (TEMPS[n] = tex(48, 20, x => { px(x, '#0a0a0e', 0, 0, 48, 20); x.fillStyle = n >= 40 ? '#ff3a2a' : '#3aff6a'; x.font = 'bold 15px monospace'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(`${n}°C`, 24, 11); }, 1808 + n));
    const dispM = mat({ map: tempTex(38), unlit: 1 }); signG.add(at(box(1.05, 0.44, 0.1, dispM), phx, WALK_Y + 3.1, phz - 0.03));
    signG.add(at(box(1.15, 1.35, 0.08, M(0x2a2a30)), phx, WALK_Y + 3.45, phz + 0.06));
    // ---------------- the coast road, the red convertible, the white houses ----------------
    G.add(flat(110, 5, M(0x4a4a52), 0, WALK_Y + 0.005, 16.5));
    const [cx, cz] = CAR, carRed = M(0xe8242a), chrome = M(0xe8ecf0), creamM = M(0xf4ead2), tyreM = M(0x1a1a1e);
    const car = new THREE.Group();
    car.add(at(box(1.9, 0.42, 4.4, carRed), 0, 0.52, 0)); car.add(at(box(1.8, 0.2, 1.3, carRed), 0, 0.82, 1.35)); car.add(at(box(1.8, 0.2, 1.1, carRed), 0, 0.82, -1.6));
    car.add(at(box(1.6, 0.16, 1.9, creamM), 0, 0.78, -0.15)); car.add(at(box(1.5, 0.45, 0.2, creamM), 0, 1.0, -0.9)); car.add(at(box(1.5, 0.4, 0.2, creamM), 0, 0.98, 0.45));
    car.add(rot(at(box(1.62, 0.42, 0.04, M(0xbfe6f6, { see: 0.3 })), 0, 1.12, 0.78), -0.45, 0, 0));
    for (const zz of [2.25, -2.25]) car.add(at(box(2.0, 0.14, 0.12, chrome), 0, 0.4, zz));
    for (const [dx, dz] of [[-0.9, 1.4], [0.9, 1.4], [-0.9, -1.4], [0.9, -1.4]]) { car.add(rot(at(cyl(0.33, 0.33, 0.24, 10, tyreM), dx, 0.33, dz), 0, 0, PI / 2)); car.add(rot(at(cyl(0.18, 0.18, 0.25, 10, chrome), dx, 0.33, dz), 0, 0, PI / 2)); }
    for (const s of [-0.6, 0.6]) car.add(at(box(0.3, 0.16, 0.05, glow(0xfff4d0)), s, 0.6, 2.21));
    car.position.set(cx, WALK_Y, cz); car.rotation.y = PI / 2; G.add(car);
    const houseT = (base, seed) => tex(32, 32, (x, r) => {
      px(x, base, 0, 0, 32, 32); noise(x, r, 32, 32, ['rgba(0,0,0,.05)', 'rgba(255,255,255,.1)'], 60);
      for (const yy of [6, 19]) for (const xx of [5, 20]) { px(x, '#3a7ad0', xx - 2, yy, 2, 8); px(x, '#3a7ad0', xx + 5, yy, 2, 8); px(x, '#5a4a3a', xx, yy + 1, 5, 7); px(x, '#f8f4ee', xx - 2, yy + 8, 9, 1); }
    }, seed);
    const HOUSES = [['#fbf8f2', 1811], ['#f8ecd2', 1812], ['#ffffff', 1813], ['#f8e0cc', 1814], ['#f2f6f8', 1815]].map(([c, s]) => mat({ map: houseT(c, s), rep: [2, 1], unlit: 0.5 }));   // their fronts face the beach, away from the sun: self-lit or they read grey
    const roofM = M(0xc8643a);
    for (let i = 0; i < 12; i++) {
      const w = 7 + hash(i, 1816) * 3, h = 4.2 + hash(i, 1817) * 2.6, x = -58 + i * 10 + hash(i, 1818) * 2;
      G.add(at(box(w, h, 8, HOUSES[i % HOUSES.length]), x, WALK_Y + h / 2, 26)); G.add(at(box(w + 0.4, 0.3, 8.4, roofM), x, WALK_Y + h + 0.15, 26));
    }
    // ---------------- the beach: parasols, towels, Kob's sunbed, the castle, the net, the bar, the lifeguard chair ----------------
    const STRIPES = [[0xe8243a, 0xffffff], [0x2a8ae8, 0xffffff], [0xffc21f, 0xffffff], [0x2ad8a0, 0xffffff], [0xff6a9a, 0xffffff]];
    const poleM = M(0xf4f4f0), paraMs = STRIPES.map(([a, b]) => [M(a, { side: THREE.DoubleSide }), M(b, { side: THREE.DoubleSide })]);
    const parasol = (x, z, j, tilt = 0) => {
      const p = new THREE.Group(); p.add(at(box(0.05, 2.2, 0.05, poleM), 0, 1.1, 0));
      const top = new THREE.Group(); top.position.y = 2.15;
      for (let i = 0; i < 8; i++) top.add(new THREE.Mesh(new THREE.ConeGeometry(1.15, 0.42, 8, 1, true, i / 8 * TAU, TAU / 8), paraMs[j % paraMs.length][i % 2]));
      p.add(top); p.position.set(x, 0, z); p.rotation.z = tilt; G.add(p);
    };
    const PARASOLS = [[-6.6, 5.6], [-10.2, 5.4], [-13.8, 5.7], [-17.4, 5.5], [-21, 5.6], [-6.2, 1.8], [-12.8, 2.1], [-16.4, 1.9], [-20, 2.2], [-15.4, -2.2], [-19.4, -2.0],
      [7.2, 2.2], [10.8, 1.9], [14.4, 2.2], [18, 2.0], [21.6, 2.2], [12.6, -1.6], [16.2, -1.4], [20, -1.8], [14.6, 5.6], [18.2, 5.8],
      [-6.0, -3.6], [-9.8, -4.4], [7.0, -3.2], [11.2, -4.6], [-7.8, 7.2], [6.6, 6.6]];
    PARASOLS.forEach(([x, z], j) => parasol(x, z, j, (hash(j, 1820) - 0.5) * 0.12));
    const towelT = (a, b, seed) => tex(16, 16, x => { px(x, a, 0, 0, 16, 16); for (let y = 0; y < 16; y += 4) px(x, b, 0, y, 16, 2); }, seed);
    const TOWELS = [['#ff5fa2', '#ffffff'], ['#3fb4ff', '#ffffff'], ['#ffd43b', '#ff8a3c'], ['#5ad46b', '#ffffff'], ['#a46aff', '#ffd43b'], ['#ff4a4a', '#ffffff']].map(([a, b], i) => mat({ map: towelT(a, b, 1821 + i) }));
    const towel = (x, z, j, yaw = 0) => G.add(rot(at(box(0.85, 0.012, 1.7, TOWELS[j % TOWELS.length]), x, 0.006, z), 0, yaw, 0));
    [[-5.4, 4.0], [-4.8, 1.0], [-7.6, 3.4], [-11.6, 3.6], [-15.2, 3.8], [-18.8, 3.6], [6.4, 0.6], [9.2, -0.4], [11.4, 3.8], [15.8, 3.6], [17.8, 0.2], [-13.8, -0.4], [-17.8, 0.0]].forEach(([x, z], j) => towel(x, z, j, (hash(j, 1822) - 0.5) * 0.4));
    G.add(rot(at(box(0.85, 0.014, 1.75, TOWELS[0]), SADI[0], 0.007, SADI[1]), 0, 0.08, 0));   // Sadi's towel: pink and white
    // Kob's sunbed and her parasol, a little table with her milk: she never touches the sand
    const [kx, kz] = KOB, bedM = M(0xfaf8f2), padM = M(0x7ad8c8);
    G.add(at(box(0.72, 0.06, 1.7, bedM), kx, KOB_Y - 0.08, kz)); G.add(at(box(0.66, 0.06, 1.62, padM), kx, KOB_Y - 0.03, kz));
    G.add(rot(at(box(0.66, 0.06, 0.62, padM), kx, KOB_Y + 0.2, kz - 1.02), 0.95, 0, 0));
    for (const [dx, dz] of [[-0.3, -0.75], [0.3, -0.75], [-0.3, 0.75], [0.3, 0.75]]) G.add(at(box(0.05, KOB_Y - 0.1, 0.05, bedM), kx + dx, (KOB_Y - 0.1) / 2, kz + dz));
    parasol(kx - 0.75, kz - 0.9, 3, 0.1);
    G.add(at(box(0.36, 0.36, 0.36, M(0xf4f4f0)), kx + 0.75, 0.18, kz - 0.5)); G.add(at(cyl(0.07, 0.07, 0.2, 8, M(0xf8f8ff)), kx + 0.75, 0.46, kz - 0.5));
    // a blue cooler on the sand with a white lid (the hook's swoop starts behind it)
    G.add(at(box(0.52, 0.34, 0.36, M(0x2a8ae8)), PLAYA.COOLER[0], 0.17, PLAYA.COOLER[1])); G.add(at(box(0.56, 0.08, 0.4, M(0xf8f8f8)), PLAYA.COOLER[0], 0.38, PLAYA.COOLER[1]));
    // Compote's sandcastle: a mound, four turrets, a keep with a real carrot planted on top; her bucket and spade
    const [sx, sz] = CASTLE, castle = new THREE.Group(), cSand = mat({ map: sandT, rep: [2, 2] });
    castle.add(at(cyl(0.62, 0.7, 0.2, 10, cSand), 0, 0.1, 0));
    for (const [dx, dz] of [[-0.36, -0.36], [0.36, -0.36], [-0.36, 0.36], [0.36, 0.36]]) { const tu = new THREE.Group(); tu.add(at(cyl(0.12, 0.14, 0.3, 6, cSand), 0, 0.15, 0)); tu.add(at(cone(0.14, 0.16, 6, cSand), 0, 0.38, 0)); tu.position.set(dx, 0.2, dz); castle.add(tu); }
    const keep = new THREE.Group(); keep.add(at(cyl(0.2, 0.26, 0.5, 8, cSand), 0, 0.25, 0));
    for (let i = 0; i < 6; i++) { const a = i / 6 * TAU; keep.add(at(box(0.07, 0.08, 0.07, cSand), Math.cos(a) * 0.18, 0.54, Math.sin(a) * 0.18)); }
    const carrotM = M(0xff8a1a), leafC = M(0x3fae47);
    const makeCarrot = () => { const g = new THREE.Group(); g.add(rot(cone(0.06, 0.34, 6, carrotM), PI, 0, 0)); for (let i = 0; i < 3; i++) g.add(rot(at(box(0.03, 0.18, 0.02, leafC), (i - 1) * 0.03, 0.24, 0), 0, 0, (i - 1) * 0.35)); return g; };
    const carrot = makeCarrot(); carrot.position.set(0, 0.74, 0); keep.add(carrot); keep.position.y = 0.2; castle.add(keep);
    const moat = new THREE.Mesh(new THREE.RingGeometry(0.72, 0.9, 12), M(0x3ec8d4, { unlit: 0.4 })); moat.rotation.x = -PI / 2; moat.position.y = 0.006; castle.add(moat);
    castle.position.set(sx, 0, sz); G.add(castle);
    const lumps = [];   // what's left of it (castle 0): flattened heaps and the carrot on its side
    for (let i = 0; i < 7; i++) { const l = new THREE.Mesh(new THREE.IcosahedronGeometry(0.22 + hash(i, 1823) * 0.14, 0), cSand); l.position.set(sx + (hash(i, 1824) - 0.5) * 1.4, 0.02, sz + (hash(i, 1825) - 0.5) * 1.2); l.scale.y = 0.3; l.visible = false; G.add(l); lumps.push(l); }
    const downCarrot = makeCarrot(); downCarrot.rotation.z = PI / 2 - 0.2; downCarrot.position.set(sx + 0.35, 0.07, sz - 0.3);   // near her knees, where a lens on her face still sees it downCarrot.visible = false; G.add(downCarrot);
    G.add(at(cyl(0.13, 0.1, 0.22, 8, M(0xe8243a)), sx + 0.95, 0.11, sz - 0.2)); G.add(rot(at(box(0.08, 0.4, 0.03, M(0xffc21f)), sx + 1.1, 0.05, sz + 0.3), PI / 2 - 0.1, 0.4, 0));
    // the volleyball net and its ball; the beach bar; the lifeguard chair with its flag
    const [vx, vz] = VOLLEY;
    for (const s of [-1, 1]) G.add(at(box(0.07, 2.3, 0.07, M(0xf4f4f0)), vx + s * 2.3, 1.15, vz));
    const netParts = []; for (let i = 0; i <= 20; i++) netParts.push(at(new THREE.Mesh(new THREE.BoxGeometry(0.015, 0.7, 0.015)), vx - 2.3 + i * 0.23, 1.9, vz)); for (let j = 0; j <= 4; j++) netParts.push(at(new THREE.Mesh(new THREE.BoxGeometry(4.6, 0.015, 0.015)), vx, 1.55 + j * 0.175, vz));
    G.add(merged(netParts, M(0x2a2a30))); G.add(at(box(4.6, 0.06, 0.03, M(0xffffff)), vx, 2.25, vz));
    const ball = at(new THREE.Mesh(new THREE.IcosahedronGeometry(0.15, 1), M(0xffd43b)), vx, 2.8, vz); G.add(ball);
    const [bx, bz] = BAR, straw = tex(16, 16, (x, r) => { px(x, '#c8a050', 0, 0, 16, 16); for (let X0 = 0; X0 < 16; X0 += 2) px(x, '#a8803a', X0, 0, 1, 16); noise(x, r, 16, 16, ['#c09448', '#d4ac5c'], 30); }, 1827);
    const wood = M(0xa8784a);
    G.add(at(box(3.4, 1.05, 0.7, wood), bx, 0.52, bz - 0.8)); G.add(at(box(3.6, 0.08, 0.9, M(0x6a4a2a)), bx, 1.08, bz - 0.8));
    for (const [dx, dz] of [[-1.7, -1.1], [1.7, -1.1], [-1.7, 1.1], [1.7, 1.1]]) G.add(at(box(0.12, 2.7, 0.12, wood), bx + dx, 1.35, bz + dz));
    const roof = new THREE.Mesh(new THREE.ConeGeometry(3.0, 1.2, 4), mat({ map: straw, rep: [4, 2] })); roof.rotation.y = PI / 4; roof.scale.set(1, 1, 0.75); G.add(at(roof, bx, 3.25, bz));
    G.add(at(box(2.6, 0.45, 0.06, mat({ map: sign('CHIRINGUITO', '#2a8ae8', '#ffffff', 96, 16), unlit: 0.7 })), bx, 2.5, bz - 1.18));
    for (let i = 0; i < 4; i++) G.add(at(cyl(0.05, 0.06, 0.2, 6, glow([0xff5fa2, 0xffd43b, 0x3fd4ff, 0x6bd46b][i])), bx - 1.2 + i * 0.8, 1.22, bz - 0.95));
    const [tx, tz] = TOWER, towerParts = [];
    for (const [dx, dz] of [[-0.35, -0.3], [0.35, -0.3], [-0.35, 0.3], [0.35, 0.3]]) towerParts.push(at(new THREE.Mesh(new THREE.BoxGeometry(0.09, 1.6, 0.09)), tx + dx, 0.8, tz + dz));
    towerParts.push(at(new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.07, 0.7)), tx, 1.6, tz)); towerParts.push(at(new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.6, 0.07)), tx, 1.95, tz + 0.33));
    for (let i = 0; i < 4; i++) towerParts.push(at(new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.05, 0.06)), tx, 0.3 + i * 0.35, tz - 0.3));
    G.add(merged(towerParts, M(0xf4f4f0)));
    G.add(at(box(0.05, 3.4, 0.05, M(0xf4f4f0)), tx + 0.6, 1.7, tz + 0.4)); const flagP = at(box(0.7, 0.45, 0.02, M(0xffc21f)), tx + 0.97, 3.2, tz + 0.4); G.add(flagP);
    // a line of buoys, a moored boat, two jet-skis crossing the bay leaving spray
    for (let i = 0; i < 14; i++) G.add(at(new THREE.Mesh(new THREE.IcosahedronGeometry(0.22, 0), M(i % 2 ? 0xff4a2a : 0xffd43b)), -26 + i * 4, SEA + 0.1, -17));
    const boat = new THREE.Group(); boat.add(at(box(2.4, 1.0, 7, M(0xf8f8f8)), 0, 0.3, 0)); boat.add(at(box(1.8, 0.9, 2.6, M(0xeef4f8)), 0, 1.2, -0.6)); boat.add(at(box(1.6, 0.4, 2.2, M(0x2a3a5a)), 0, 1.3, -0.6)); boat.add(at(box(2.5, 0.12, 7.1, M(0x2a8ae8)), 0, -0.1, 0));
    boat.position.set(22, SEA, -40); boat.rotation.y = 0.5; G.add(boat);
    const skis = [0, 1].map(i => {
      const s = new THREE.Group(), col = i ? 0xffd43b : 0xff3a5a; s.add(at(box(0.8, 0.35, 2.2, M(0xf8f8f8)), 0, 0.15, 0)); s.add(at(box(0.82, 0.2, 1.4, M(col)), 0, 0.38, -0.2));
      const rider = pet(90 + i); rider.g.position.set(0, 0.25, 0.3); rider.g.scale.setScalar(1.1); s.add(rider.g);
      const spray = []; for (let j = 0; j < 10; j++) { const d = new THREE.Mesh(new THREE.IcosahedronGeometry(0.22, 0), foamM); s.add(d); spray.push(d); }
      G.add(s); return { s, spray, dir: i ? -1 : 1, z: i ? -30 : -21, off: i * 37 };
    });
    // ---------------- the pets: on the towels, at the net, at the bar, on the lifeguard chair, at the water's edge ----------------
    // [x, z, pose, group, yaw]: pose 'lie' on a towel, 'sit', 'stand'; group: who starts hopping when (`hop`)
    const HOMES = [
      [-2.1, 4.6, 'lie', 0, 0], [-2.3, 0.1, 'sit', 0, 0.5], [-3.3, 2.1, 'sit', 0, 0.3], [-2.9, -1.2, 'stand', 0, 0.6], [-11.6, 3.7, 'lie', 0, 0],
      [-10.9, 0.3, 'stand', 1, 1.2], [-10.6, -2.4, 'stand', 1, 1.0], [-6.5, 0.0, 'stand', 1, -1.3], [-6.5, -2.3, 'stand', 1, -1.1],
      [8.2, 4.4, 'stand', 2, 2.6], [9.6, 4.3, 'stand', 2, 3.14], [11.0, 4.5, 'stand', 2, -2.6],
      [6.4, 0.7, 'sit', 3, -0.4], [9.2, -0.3, 'lie', 3, 0], [11.4, 3.6, 'sit', 3, -0.3], [12.6, -0.9, 'stand', 3, -0.5], [15.8, 3.5, 'lie', 3, 0], [6.9, -1.9, 'stand', 3, -0.2],
      [-15.2, 3.9, 'sit', 0, 0.3], [-13.8, -0.3, 'stand', 1, 0.8], [17.8, 0.3, 'sit', 3, -0.3], [-18.8, 3.7, 'lie', 0, 0],
      [-4.9, -4.5, 'stand', 0, 0.3], [5.9, -4.4, 'stand', 3, -0.3], [-5.0, 6.3, 'sit', 0, 0.2], [5.6, 5.4, 'lie', 3, 0], [-7.2, -3.0, 'sit', 1, 0.5], [8.0, -2.5, 'sit', 3, -0.5],
      [-6.8, -7.4, 'stand', 5, 0.2], [5.6, -7.6, 'stand', 5, -0.3], [-3.6, -8.9, 'stand', 5, 0.1], [9.0, -8.2, 'stand', 5, -0.4], [12.4, -7.2, 'stand', 5, -0.2], [-10.4, -8.0, 'stand', 5, 0.3],
    ];
    const guests = HOMES.map(([x, z, pose, gp, yaw], i) => {
      const p = pet(i); G.add(p.g);
      // a spot in the shallows for `rush` / `sea`: packed round the middle of the bay (x within 5.5), 7.3-10.5 m out
      return { p, x, z, pose, gp, yaw, sx: Math.max(-5.5, Math.min(5.5, x * 0.22 + (hash(i, 1830) - 0.5) * 3.0)), sz: -7.3 - hash(i, 1831) * 3.2 };
    });
    const lifeguard = pet(77); lifeguard.g.position.set(tx, 1.64, tz - 0.05); G.add(lifeguard.g);
    // ---------------- smoke off the hot sand, steam off the water ----------------
    // the smoke stays at the paws (small solid puffs: above the knees they read as snowballs); the steam is thin rising
    // columns of small see-through puffs on the far side of a body from the lens (big puffs read as rocks or snowy peaks)
    const puffM = mat({ color: 0xf6f4f0, unlit: 0.9 }), steamM = mat({ color: 0xffffff, unlit: 0.9, see: 0.3 }), dropM = mat({ color: 0xeafcff, unlit: 0.9 });
    const puffGeo = new THREE.IcosahedronGeometry(1, 1);
    const pool = (n, m, geo = puffGeo) => Array.from({ length: n }, () => { const q = new THREE.Mesh(geo, m); q.visible = false; G.add(q); return q; });
    const smoke = pool(260, puffM), steamP = pool(420, steamM), dropP = pool(120, dropM, new THREE.IcosahedronGeometry(1, 0));
    const ringP = pool(4, mat({ color: 0xf2fdff, unlit: 0.8, see: 0.25 }), new THREE.TorusGeometry(1, 0.06, 4, 18));
    const sky = grad([[0, '#2a7ee0'], [0.5, '#5aaaf0'], [1, '#bfe4f8']]);

    return {
      group: G, sky, shadowCol: 0xb89a62,
      light() {
        lights(0x9aa2b4, 0xfff0d2, [-0.4, -1, -0.62], 0xcfe6f6, [45, 195], 9);
        pt(0, KOB[0], 2.0, KOB[1] + 1.6, 0.25, 0.22, 0.2);
      },
      anim(t, P = {}) {
        const b = beat(t), c = P.t0 != null ? t - P.t0 : 0, len = P.t1 != null && P.t0 != null ? P.t1 - P.t0 : 2, u = Math.min(1, Math.max(0, c / Math.max(0.01, len)));
        const per = BEAT() / 2;   // a hop every half beat
        // the sea: the texture drifts, the shore break washes in and out, a second wave rolls in and breaks
        nearM.uniforms.uOff.value.set(t * 0.02, t * 0.05); farM.uniforms.uOff.value.set(t * 0.01, t * 0.02);
        const wv = fr(t / 7.3);
        foam.position.z = WATER_Z0 + 0.45 * Math.sin(TAU * wv); foam.scale.y = 0.8 + 0.5 * Math.max(0, Math.sin(TAU * wv));
        foam2.position.z = WATER_Z0 - 3.2 + 3.0 * wv; foam2.visible = wv < 0.85; foam2.scale.y = 1.4 - wv;
        crowns.forEach((cr, i) => { cr.rotation.z = 0.05 * Math.sin(t * 1.1 + i); cr.rotation.x = 0.04 * Math.sin(t * 0.7 + i * 2); });
        flagP.rotation.y = 0.3 * Math.sin(t * 3.3);
        // the pharmacy's temperature
        signG.visible = !P.noSign;
        const tp = P.temp == null ? 38 : Array.isArray(P.temp) ? Math.round(P.temp[0] + (P.temp[1] - P.temp[0]) * sm(u * 1.4)) : P.temp;
        dispM.uniforms.map.value = tempTex(tp); crossM.uniforms.uCol.value.set(0x2ee86a).multiplyScalar(0.75 + 0.35 * Math.exp(-fr(b) * 4));
        // the castle: whole, flattened, or collapsing castleAt s into the shot
        const cu = P.castle === 0 ? 1 : P.castleAt != null ? sm((c - P.castleAt) / 0.35) : 0;
        castle.visible = cu < 1; castle.scale.set(1 + cu * 0.4, Math.max(0.05, 1 - cu), 1 + cu * 0.4); carrot.visible = cu < 0.3;
        lumps.forEach(l => { l.visible = cu > 0.6; }); downCarrot.visible = cu >= 0.3;
        // the volleyball in the air between the two sides, on the beat
        { const bb = b / 2, s = fr(bb), side = pmod(Math.floor(bb), 2) ? 1 : -1, gp1 = P.hop == null ? null : typeof P.hop === 'number' ? P.hop : P.hop[1] ?? P.hop.all ?? null;
          if (gp1 != null && c >= gp1) ball.position.set(vx + 0.9, 0.15, vz + 1.1); else ball.position.set(vx + side * (2 * s - 1) * 1.6, 2.3 + 1.6 * Math.sin(s * PI), vz); }   // the game stops: the ball lies on the sand
        // the jet-skis cross the bay and loop round, spray behind them
        skis.forEach(q => { const x = -40 + pmod(t * 7 + q.off, 80); q.s.position.set(q.dir * x, SEA + 0.02 + 0.05 * Math.sin(t * 6 + q.off), q.z); q.s.rotation.y = q.dir > 0 ? PI / 2 : -PI / 2; q.spray.forEach((d, j) => { const a = fr(t * 2 + j / 10); d.position.set(Math.sin(j * 2.3) * 0.4 * a, 0.2 + 0.7 * Math.sin(a * PI), -1.3 - a * 2.8); d.scale.setScalar(0.35 * (1 - a) + 0.05); }); });
        // ---- the pets ----
        const hopAt = gp => P.hop == null ? null : typeof P.hop === 'number' ? P.hop : P.hop[gp] ?? P.hop.all ?? null;
        const rows = P.rows, rush = P.rush, inSea = !!P.sea, emit = [], wet = [];
        const hoppers = guests.filter(q => { const h = hopAt(q.gp); return h != null && c >= h; });
        guests.forEach((q, i) => {
          const { p } = q; let x = q.x, z = q.z, yaw = q.yaw, mode = q.pose, inWater = false;
          const h0 = hopAt(q.gp);
          if (h0 != null && c >= h0) mode = 'hop';
          if (rows && mode === 'hop') {   // the dance craze: a block of rows, everyone in sync
            const [rx, rz, cols, nr, dx, dz, ry] = rows, j = hoppers.indexOf(q), col = j % cols, row = Math.floor(j / cols);
            if (row < nr) { x = rx + (col - (cols - 1) / 2) * dx + (row % 2) * dx * 0.5; z = rz - row * dz; yaw = (ry || 0) * PI / 180; }
          } else if (P.ring && mode === 'hop') {   // a circle round a point, facing it: the crowd copying the one in the middle
            const [cx0, cz0, r0, a0 = 0] = P.ring; let j = hoppers.indexOf(q), rr = r0;
            for (let k = 0; k < 6; k++) { const per0 = Math.max(6, Math.floor(TAU * rr / 0.95)); if (j < per0) { const a = a0 * PI / 180 + (j + (k % 2) * 0.5) / per0 * TAU; x = cx0 + Math.sin(a) * rr; z = cz0 + Math.cos(a) * rr; yaw = Math.atan2(cx0 - x, cz0 - z); break; } j -= per0; rr += 1.05; }
          }
          if (inSea) { x = q.sx; z = q.sz; yaw = (hash(i, 1832) - 0.5) * 0.8; mode = 'surf'; inWater = true; }
          else if (rush && c >= rush[0]) {   // the stampede into the sea, each on its own delay
            const d = rush[0] + hash(i, 1833) * 0.6, kk = sm((c - d) / rush[1]);
            if (kk > 0) { const fx = x, fz = z; x = fx + (q.sx - fx) * kk; z = fz + (q.sz - fz) * kk; yaw = Math.atan2(q.sx - fx, q.sz - fz); mode = kk < 1 ? 'run' : 'surf'; inWater = kk >= 1; }
          }
          const show = !P.noguests && !cleared(P, x, z);
          p.g.visible = show; if (!show) return;
          const fy = floorY(z);
          p.g.position.set(x, fy, z); p.g.rotation.set(0, P.stare && mode !== 'run' ? Math.atan2(P.stare[0] - x, P.stare[1] - z) : yaw, 0);
          p.body.position.set(0, 0, 0); p.body.rotation.set(0, 0, 0); p.head.rotation.set(0, 0, 0);
          p.legs.forEach(l => l.rotation.set(0, 0, 0)); p.arms.forEach(a => a.rotation.set(0, 0, 0));
          const bb = b + (i % 5) * 0.11;
          if (mode === 'lie') { p.body.rotation.x = -PI / 2; p.body.position.set(0, 0.14, 0.45); p.head.rotation.x = 0.5; }
          else if (mode === 'sit') { p.body.position.y = -0.2; p.legs.forEach(l => { l.rotation.x = -PI / 2; }); p.head.rotation.y = 0.25 * Math.sin(bb * 0.5 * PI); }
          else if (mode === 'stand') { p.body.position.y = 0.03 * Math.abs(Math.sin(bb * PI)); p.head.rotation.y = 0.2 * Math.sin(bb * 0.5 * PI); }
          else if (mode === 'hop') {   // hot hot hot: a hop every half beat, one leg up, paws flapping by the ears
            const hb = (b - (rows ? 0 : (i % 3) * 0.08)) / 0.5, hu = fr(hb), n = Math.floor(hb), side = pmod(n, 2) ? 1 : -1;
            p.body.position.y = 0.14 * 4 * hu * (1 - hu); p.body.rotation.z = side * 0.14;
            p.legs[side > 0 ? 0 : 1].rotation.x = -1.1 * Math.sin(hu * PI);
            p.arms.forEach((a, s) => { a.rotation.z = (s ? 1 : -1) * (2.5 + 0.38 * Math.sin(hu * PI)); });
            p.head.rotation.z = -side * 0.12;
            if (fy === 0) emit.push([x, z, n, hb]);
          } else if (mode === 'run') {
            const rb = fr(b * 2); p.body.position.y = 0.08 * Math.abs(Math.sin(rb * PI)); p.body.rotation.x = 0.25;
            p.legs.forEach((l, s) => { l.rotation.x = (s ? 1 : -1) * 0.9 * Math.sin(rb * TAU); }); p.arms.forEach((a, s) => { a.rotation.x = (s ? -1 : 1) * 0.9 * Math.sin(rb * TAU); });
          } else if (mode === 'surf') {   // dancing in the shallows, paws up, flapping on the beat
            const sb = fr(bb); p.body.position.y = 0.06 * Math.abs(Math.sin(sb * PI)); p.body.rotation.z = 0.16 * Math.sin(bb * PI);
            p.arms.forEach((a, s) => { a.rotation.z = (s ? 1 : -1) * (2.7 + 0.22 * Math.sin(sb * TAU)); }); p.head.rotation.z = 0.12 * Math.sin(bb * PI);   // paws well up: lower, they read as a T-pose
          }
          if (P.cheer && mode !== 'hop' && mode !== 'surf') p.arms.forEach((a, s) => { a.rotation.z = (s ? 1 : -1) * 2.7; });
          if (inWater) wet.push([x, z, i]);
        });
        lifeguard.g.visible = !P.noguests; lifeguard.body.position.y = -0.2; lifeguard.legs.forEach(l => { l.rotation.x = -PI / 2; }); lifeguard.head.rotation.y = 0.5 * Math.sin(fr(b / 2) * TAU);
        // ---- smoke off the sand: little puffs at the paws on every landing (the listed points and every hopping pet) ----
        let si = 0;
        smoke.forEach(q => { q.visible = false; });
        const LIFE = 0.4;
        const put = (x, z, age, n, big) => {   // a landing: three little puffs off the sand at the paw, never above the knees
          if (age < 0 || age > LIFE) return;
          const sd = pmod(n, 2) ? 1 : -1, grow = age < 0.05 ? age / 0.05 : 1, fade = Math.min(1, (LIFE - age) / 0.12);
          for (let m = 0; m < 2 && si < smoke.length; m++) {
            const q = smoke[si++], a = (hash(n, 1834 + m) - 0.5) * 2.2 + m * 2.1, spread = 0.06 * big * (1 + age * 3);
            q.visible = true; q.position.set(x + sd * 0.1 * big + Math.cos(a) * spread, 0.02 + age * 0.55 * big, z + Math.sin(a) * spread);
            q.scale.setScalar(Math.max(0.001, (0.022 + age * 0.08) * big * grow * fade * (1 - m * 0.2)));
          }
        };
        const nNow = Math.floor(c / per);
        for (const [x, z, from = -1e9] of P.sizzle || []) for (let kk = 0; kk < 3; kk++) { const n = nNow - kk; if (n * per >= from) put(x, z, c - n * per, n, 1.35); }   // from: s into the shot the point starts smoking (a footstep)
        for (const [x, z, n, hb] of emit) for (let kk = 0; kk < 2; kk++) put(x, z, (hb - (n - kk)) * per, n - kk, 0.8);
        // ---- steam: thin columns of little puffs rising off the water, swaying ----
        steamP.forEach(q => { q.visible = false; });
        let st = 0;
        const column = (x, z, h, grow, seed, w) => {   // six puffs rising up a column of height h (m), looping
          for (let j = 0; j < 6 && st < steamP.length; j++) {
            const ph = fr(t / 1.5 + j / 6 + hash(seed, 1850)), y = ph * h * grow; if (y < 0.03) continue;
            const q = steamP[st++]; q.visible = true;
            q.position.set(x + 0.09 * w * Math.sin(ph * 6 + seed), SEA + 0.04 + y, z + 0.05 * w * Math.cos(ph * 5 + seed));
            q.scale.setScalar(Math.max(0.001, (0.045 + ph * 0.065) * w * Math.min(1, (1 - ph) / 0.3)));
          }
        };
        const steamAt = (x, z, s0, size, lens, n) => {   // n columns round a body, on its far side from the lens (deg), growing from s0
          const grow = s0 == null ? 1 : sm((c - s0) / 0.6); if (grow <= 0) return;
          const back = lens == null ? null : (lens + 180) * PI / 180;
          for (let k = 0; k < n; k++) {
            const a = back == null ? hash(k, 1851 + Math.round(x * 10)) * TAU : back + (n > 1 ? k / (n - 1) - 0.5 : 0) * 2.6, r = (0.42 + 0.2 * hash(k, 1852)) * size;
            column(x + Math.sin(a) * r, z + Math.cos(a) * r, (0.9 + 0.5 * hash(k, 1853)) * size, grow, k + Math.round(x * 7 + z * 3), size);
          }
        };
        (P.steam || []).forEach(([x, z, s0, size = 1, lens = null]) => steamAt(x, z, s0, size, lens, 7));
        (P.wisps || []).forEach(([x, z, lens = null]) => steamAt(x, z, null, 0.8, lens, 3));
        if (P.steamAll) for (const [x, z] of wet) steamAt(x, z, null, 0.55, null, 1);
        // ---- a splash where someone jumps into the sea: drops flying out and a ring on the water ----
        dropP.forEach(q => { q.visible = false; }); ringP.forEach(q => { q.visible = false; });
        let di = 0;
        (P.splash || []).forEach(([x, z, s0, size = 1], k) => {
          const age = c - s0; if (age < 0 || age > 0.9) return;
          for (let j = 0; j < 30 && di < dropP.length; j++) {
            const a = hash(j, 1854) * TAU, v = (1.8 + 1.4 * hash(j, 1855)) * size, sp = (0.6 + 0.9 * hash(j, 1856)) * size, y = SEA + v * age - 4.9 * age * age;
            if (y < SEA - 0.05) continue;
            const q = dropP[di++]; q.visible = true; q.position.set(x + Math.cos(a) * sp * age, y, z + Math.sin(a) * sp * age);
            q.scale.setScalar(Math.max(0.001, (0.04 + 0.03 * hash(j, 1857)) * size));
          }
          const rg = ringP[k % ringP.length]; rg.visible = true; rg.position.set(x, SEA + 0.02, z); rg.rotation.x = PI / 2; rg.scale.setScalar((0.3 + age * 1.6) * size);
        });
      },
    };
  }
  return { playa: playa() };
}
