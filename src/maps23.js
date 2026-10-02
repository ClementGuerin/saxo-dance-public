// maps23.js: the "Jamaican (Bam Bam)" maps (2026-10-02, HUGEL & SOLTO; no clip: an official visualizer of the record
// sleeve, so the world comes from the title and the words: Kingston, the sound, "nice up Jamaica"). Ours: the Jamaican
// bobsled team, four beach pets who turn up at the Winter Olympics with a bathtub on skis. Same contract as the other
// map files, pure in t:
//   kingston  the team's training ground in the sun: a sand beach, the turquoise sea and its foam line at -z, palms (one
//             with coconuts over the training spot, PALM), a painted beach shack with the KINGSTON sign on its roof
//             (SHACK), an ice-cream chest freezer beside it (FREEZER: lid `lid` 0 shut .. 1 open), a sound system of
//             speaker boxes whose cones pump on the beat (SOUND), the bathtub sled on the sand (`tub`), beach locals in
//             bright shirts (`gather` [cx, cz, r, a0, a1]: they crowd round on an arc facing its centre; `cheer`,
//             `stare`, `noguests`, `clear`). Flags: `coconuts` ([[s, x, z, y], ...]: a coconut drops from above onto
//             (x, y, z), bonks and bounces off into the sand), `splash` ([s, x, z, size]: the tub hits the sea), `key`.
//   icetrack  the Olympic bobsled track at night under floodlights, snow falling. `zone`: 'start' (the start ramp: a
//             flat ice channel along z, ICE.W wide, walls ICE.WALL high, the start house behind at +z, the timing gate,
//             the lip at ICE.LIP where it drops away down the mountain, stands of pet fans behind barriers, two rival
//             teams' sleek sleds parked beside the channel with their crews in white, `rivals` (stare at [x, z])),
//             'run' (the channel scrolling past a still tub at the origin at `speed` m/s: the ice streaks, the lamps, the
//             fans behind the walls, banners, pines; `bank` (deg) rolls the world round the tub's axis: pair it with the
//             same camera roll so the tub reads tilted on the bend), 'finish' (the run-out: the FINISH gantry over the
//             channel at ICE.ARCH_Z, the timing board, the grandstands; the crash and the carry happen here).
//             The tub: `tub` { x, z, yaw, to: [x, z] (moved linearly over the shot from `at` s, like an actor's mx/mz),
//             at, y (lifted: on three heads), roll (deg: on its side), pitch (deg: its nose over the lip), pitchAt }.
//             `hits` ([[s, side], ...]: the tub smacks the wall: ice chunks burst off that side (+1 right, -1 left), the
//             tub hops; pair them with the shot's `jolt` [s, ...] and the riders' `bumps`), `fans` ('watch' | 'cheer' |
//             'dance' (the stiff crowd catches the groove) | 'chant' (jumping in rows on the beat) | 'gasp'), `stare`
//             [x, z], `stop` (s: frozen from then), `confetti`, `flares`, `noRivals`, `noguests`, `clear`, `key`.
import { mapKit } from './mapkit.js';

export const KINGSTON = { CRATE: [5.75, -1.0], CRATE_Y: 0.34, PALM: [2.2, -5.0], CROWN: 3.55, PALM_DIR: [-0.87, 0.5], PALM_LEAN: 0.65, SHACK: [5.4, -4.4], FREEZER: [3.7, -1.4], FRZ_W: 2.9, FRZ_H: 0.72,
  SOUND: [-3.5, -3.8], SIGN: [0, -6.2], SIGN_Y: 1.95, SHORE: -9.0, TUB: [0, 0.6] };
export const ICE = { W: 2.6, WALL: 0.95, LIP: -7.5, START_Z: 6.5, ARCH_Z: -9.5, BOARD: [-2.75, -10.4], L: 96 };
// the bathtub's seats (local to the tub, nose to -z): marks and lifts, stepped so each head shows over the one in front
export const TUB = { SEATS: [[0, -1.25, 0.14], [0, -0.4, 0.22], [0, 0.45, 0.3], [0, 1.3, 0.38]], LEN: 3.5, W: 1.18, RIM: 0.62 };

export function buildBobsledMaps(K) {
  const k = mapKit(K);
  const { THREE, mat, tex, px, noise, box, selfLit, TAU, PI, hash, beat, grad, cyl, cone, at, rot, flat, lights, pt, fall } = k;
  const M = (c, o = {}) => mat({ color: c, ...o }), glow = c => mat({ color: c, unlit: 1 });
  const cl = x => Math.max(0, Math.min(1, x)), sm = x => { x = cl(x); return x * x * (3 - 2 * x); };
  const fr = x => x - Math.floor(x);
  const shotT = (t, P) => P.t0 != null ? t - P.t0 : 0;
  const cleared = (P, x, z) => (P.clear || []).some(([cx, cz, r]) => (x - cx) ** 2 + (z - cz) ** 2 < r * r);
  const ico = (r, d, m) => new THREE.Mesh(new THREE.IcosahedronGeometry(r, d), m);
  // the tub's hop on a hit: up and down over 0.25 s (the riders' `bumps` use the same curve)
  const hop = (s, hits) => { let y = 0; for (const h of hits || []) { const d = s - (Array.isArray(h) ? h[0] : h); if (d >= 0 && d < 0.25) y = Math.max(y, 0.09 * Math.sin(d / 0.25 * PI)); } return y; };

  // ---------- the bathtub sled: a white clawfoot tub painted in the team's yellow, green and black, on two wooden skis ----------
  const tubSide = tex(64, 16, x => {
    px(x, '#f6f4ee', 0, 0, 64, 16); px(x, '#ffd21f', 0, 9, 64, 2); px(x, '#1f9a3c', 0, 11, 64, 2); px(x, '#141414', 0, 13, 64, 1);   // white enamel, one thin band (review: "painted like a sled")
    x.fillStyle = '#1f9a3c'; x.font = 'bold 7px monospace'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('JAM', 32, 4.5);
  });
  function bathtub() {
    const g = new THREE.Group(), body = new THREE.Group(); g.add(body);
    const { LEN, W, RIM } = TUB, white = M(0xf6f4ee), inner = M(0xe8f0f4), paint = mat({ map: tubSide }), gold = M(0xe8b830), wood = M(0x9a6a3a), chrome = M(0xd8dce4);
    const y0 = 0.16, h = RIM - y0, half = LEN / 2 - 0.25;
    body.add(at(box(W - 0.1, 0.06, LEN - 0.5, inner), 0, y0 + 0.03, 0));                        // the floor inside
    for (const s of [-1, 1]) {
      body.add(at(box(0.07, h, LEN - 0.5, paint), s * (W / 2 - 0.035), y0 + h / 2, 0));        // the long sides, painted
      const lip = cyl(0.06, 0.06, LEN - 0.5, 8, white); lip.rotation.x = PI / 2; body.add(at(lip, s * (W / 2 - 0.03), RIM, 0));   // the rolled rim
    }
    // the rounded nose (-z) and the sloping back (+z, where the taps are)
    const nose = new THREE.Mesh(new THREE.CylinderGeometry(W / 2, W / 2, h, 14, 1, true, PI / 2, PI), paint); nose.position.set(0, y0 + h / 2, -half); body.add(nose);
    const noseRim = new THREE.Mesh(new THREE.TorusGeometry(W / 2 - 0.03, 0.06, 6, 14, PI), white); noseRim.rotation.set(PI / 2, 0, PI); noseRim.position.set(0, RIM, -half); body.add(noseRim);
    const noseFloor = new THREE.Mesh(new THREE.CircleGeometry(W / 2 - 0.05, 14, 0, PI), inner); noseFloor.rotation.set(-PI / 2, 0, PI); noseFloor.position.set(0, y0 + 0.065, -half); body.add(noseFloor);
    const back = at(box(W - 0.06, h + 0.06, 0.08, paint), 0, y0 + h / 2 + 0.03, half + 0.2); back.rotation.x = -0.35; body.add(back);
    for (const s of [-1, 1]) body.add(at(box(0.07, h, 0.25, paint), s * (W / 2 - 0.035), y0 + h / 2, half + 0.12));
    const backRim = cyl(0.06, 0.06, W - 0.04, 8, white); backRim.rotation.z = PI / 2; body.add(at(backRim, 0, RIM + 0.06, half + 0.32));
    const taps = []; for (const s of [-1, 1]) { taps.push(at(cyl(0.035, 0.035, 0.12, 6, chrome), s * 0.2, RIM + 0.06, half + 0.3), at(box(0.07, 0.04, 0.14, chrome), s * 0.2, RIM + 0.11, half + 0.24), at(cyl(0.05, 0.05, 0.03, 8, chrome), s * 0.2, RIM + 0.14, half + 0.31)); } taps.forEach(m => body.add(m));   // two low chrome taps (taller ones crossed the pushers' faces); `tub.taps: false` hides them
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) {   // big gold claw feet: a ball and three toes, the tub's tell-tale
      const fx = sx * (W / 2 - 0.16), fz = sz * (half - 0.1);
      body.add(at(ico(0.1, 0, gold), fx, 0.13, fz)); for (let q = 0; q < 3; q++) { const a = (q - 1) * 0.7 + (sx < 0 ? PI : 0); body.add(rot(at(box(0.05, 0.05, 0.13, gold), fx + Math.sin(a) * 0.08, 0.06, fz + Math.cos(a) * 0.08), 0, a, 0)); }
    }
    for (const s of [-1, 1]) {
      body.add(at(box(0.09, 0.05, LEN + 0.2, wood), s * (W / 2 - 0.16), 0.03, 0.05));
      body.add(rot(at(box(0.09, 0.05, 0.4, wood), s * (W / 2 - 0.16), 0.1, -LEN / 2 - 0.2), 0.55, 0, 0));   // the ski tips curl up
      body.add(at(box(0.04, 0.12, 0.05, wood), s * (W / 2 - 0.16), 0.08, -LEN / 2 + 0.3));
    }
    const shadow = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), mat({ shadow: 0.5 })); shadow.rotation.x = -PI / 2; shadow.scale.set(W + 0.35, LEN + 0.5, 1); g.add(shadow);
    g.userData.body = body; g.userData.shadow = shadow; g.userData.taps = taps;
    return g;
  }
  function placeTub(g, P, s) {
    const T = P.tub; g.visible = !!T; if (!T) return;
    g.userData.taps.forEach(m => { m.visible = T.taps !== false; });
    const len = P.t1 != null && P.t0 != null ? P.t1 - P.t0 : 2, at0 = T.at || 0, u = cl((s - at0) / Math.max(0.01, len - at0));
    const x0 = T.x || 0, z0 = T.z || 0, x = x0 + ((T.to ? T.to[0] : x0) - x0) * u, z = z0 + ((T.to ? T.to[1] : z0) - z0) * u;
    let shove = 0, climb = 0; for (const h of P.hits || []) if (Array.isArray(h) && h[2]) { const d = s - h[0], e = d < -0.15 ? 0 : d < 0 ? sm((d + 0.15) / 0.15) : d < 0.12 ? 1 : Math.exp(-(d - 0.12) * 5); shove += h[1] * h[2] * e; climb += h[1] * e; }   // [s, side, shove m]: slid into that wall, in contact on the hit
    g.position.set(x + shove, (T.y || 0) + hop(s, [...(P.hits || []), ...(P.hops || [])]), z);   // hops: [s], a bounce with no burst
    const pitch = (T.pitch || 0) * PI / 180 * (T.pitchAt != null ? sm((s - T.pitchAt) / 0.5) : 1);
    g.rotation.set(0, (T.yaw || 0) * PI / 180, 0);
    let roll = (T.roll || 0) * PI / 180 + climb * 0.17, pitch2 = pitch;   // riding 10 degrees up the wall it hits
    if (P.flip) {   // flip [s, dur, dir]: thrown up and rolled over (dir 1: the right side up and over to the left), landing upside down on its rim and its taps, the claw feet in the air
      const u = cl((s - P.flip[0]) / (P.flip[1] || 0.6)), k = sm(u), dir = P.flip[2] || 1;
      roll += k * PI * dir; pitch2 += k * -0.092; g.position.y += Math.sin(u * PI) * 1.3 + k * 0.87; g.position.x -= dir * 0.9 * k;
    }
    g.userData.body.rotation.set(pitch2, 0, roll);
    const sh = g.userData.shadow; sh.position.y = 0.05 - g.position.y;   // 5 cm up: at 1 cm the ice hid it (the vertex snap) sh.material.uniforms.uShadow.value = 0.5 * Math.max(0.3, 1 - g.position.y * 0.5); if (P.shadowCol != null) sh.material.uniforms.uShadowCol.value.set(P.shadowCol);
  }

  // ---------- pets: box pets with faceted heads (beach locals in bright shirts, fans in parkas and bobble hats) ----------
  const FURS = [0xd8a868, 0xe8d8c0, 0xb08a60, 0xf2eee6, 0xc8c0d0, 0xe0c8a0, 0xf0dcc0, 0xd0b090];   // light furs (dark ones read as black boxes)
  function pet(i, kind, suit) {
    const g = new THREE.Group(), F = M(FURS[i % FURS.length]), ek = i % 3, beach = kind === 'beach';
    const SH = suit ?? (beach ? [0xff6a8a, 0x3ad0c0, 0xffd21f, 0xff9a3c, 0x7ad04a, 0xb08aff][i % 6] : [0xe84a4a, 0x3a7ae8, 0xf2c94c, 0x2fae6a, 0xff8a3c, 0xb06ae8, 0xf2f2f2][i % 7]);
    const top = M(SH), body = new THREE.Group(); g.add(body);
    body.add(at(box(beach ? 0.4 : 0.48, 0.46, beach ? 0.28 : 0.36, top), 0, 0.33, 0));
    if (beach) for (let q = 0; q < 4; q++) body.add(at(box(0.07, 0.07, 0.02, M(0xffffff)), -0.12 + (q % 2) * 0.22, 0.25 + Math.floor(q / 2) * 0.18, 0.145));   // a flowery shirt's print
    else if (suit == null) body.add(at(box(0.5, 0.1, 0.38, M([0xffffff, 0xf2c94c, 0xe84a4a, 0x3a7ae8][i % 4])), 0, 0.54, 0));   // the scarf
    const legs = [-1, 1].map(s => { const l = at(new THREE.Group(), s * 0.1, 0.1, 0.02); l.add(at(box(0.12, 0.2, 0.13, M(beach ? 0x3a5ab0 : suit ?? 0x3a3a48)), 0, -0.05, 0)); l.add(at(box(0.13, 0.08, 0.17, M(beach ? 0xf0d0a0 : 0x2a2230)), 0, -0.14, 0.02)); body.add(l); return l; });
    const arms = [-1, 1].map(s => { const a = at(new THREE.Group(), s * (beach ? 0.23 : 0.27), 0.52, 0); a.add(at(box(0.1, 0.3, 0.1, top), 0, -0.13, 0)); a.add(at(box(0.09, 0.09, 0.09, beach ? F : M(0xf2f2f2)), 0, -0.3, 0)); body.add(a); return a; });
    const head = at(new THREE.Group(), 0, 0.8, 0); body.add(head);
    const skull = ico(0.24, 1, F); skull.scale.set(1, 0.9, 0.92); head.add(skull);
    const snout = at(ico(0.1, 1, M(0xf6ece0)), 0, -0.07, 0.19); snout.scale.set(1.1, 0.8, 0.9); head.add(snout);
    head.add(at(ico(0.035, 0, M(0x151515)), 0, -0.03, 0.28));
    for (const e of [-1, 1]) {
      head.add(at(ico(0.038, 0, M(0x0e0e0e)), e * 0.1, 0.05, 0.19)); head.add(at(ico(0.012, 0, glow(0xffffff)), e * 0.1 + 0.012, 0.065, 0.225));
      head.add(ek === 0 ? rot(at(cone(0.08, 0.2, 4, F), e * 0.15, 0.27, 0), 0, 0, -e * 0.25) : ek === 1 ? at(box(0.08, 0.3, 0.06, F), e * 0.1, 0.33, 0) : rot(at(box(0.07, 0.24, 0.16, F), e * 0.24, 0.02, 0), 0, 0, e * 0.3));
    }
    if (!beach) { const hc = M(suit != null ? 0xf4f6fa : [0xe84a4a, 0x3a7ae8, 0xf2f2f2, 0x2fae6a, 0xf2c94c][i % 5]); head.add(at(cyl(0.17, 0.2, 0.16, 8, hc), 0, 0.2, -0.02)); head.add(at(ico(0.07, 0, M(0xffffff)), 0, 0.32, -0.02)); }
    else if (i % 4 === 1) { head.add(at(cyl(0.3, 0.3, 0.02, 10, M(0xf0d890)), 0, 0.2, -0.02)); head.add(at(cyl(0.15, 0.17, 0.12, 8, M(0xf0d890)), 0, 0.27, -0.02)); }   // a straw hat
    return { g, body, head, arms, legs, i };
  }
  function animPet(p, P, s, x, z, mode, faceTo) {
    const bb = beat(P.t0 != null ? P.t0 + s : s) + p.i * 0.13, stopped = P.stop != null && s >= P.stop, b = stopped ? 0 : Math.abs(Math.sin(bb * PI));
    p.g.rotation.y = faceTo ? Math.atan2(faceTo[0] - x, faceTo[1] - z) : 0;
    p.body.position.y = mode === 'chant' ? 0.16 * b : mode === 'cheer' || mode === 'dance' ? 0.04 * b : 0.01 * b;
    p.body.rotation.z = mode === 'dance' && !stopped ? 0.18 * Math.sin(bb * PI) : 0;
    p.head.rotation.set(0, mode === 'dance' ? 0.2 * Math.sin(bb * PI) : 0, 0);
    p.arms.forEach((a, k2) => {
      const sd = k2 ? 1 : -1;
      if (mode === 'gasp') a.rotation.set(-2.3, 0, -sd * 0.55);
      else if (mode === 'cheer' || mode === 'chant') a.rotation.set(0.35, 0, sd * (2.45 + 0.25 * b));   // paws up in a V
      else if (mode === 'dance') a.rotation.set(-0.4, 0, sd * (0.9 + 0.7 * (k2 ? b : 1 - b)));
      else a.rotation.set(0.05, 0, sd * 0.12);
    });
  }

  // =================================== KINGSTON ===================================
  function kingston() {
    const G = new THREE.Group(), { CRATE, CRATE_Y, PALM, CROWN, PALM_DIR, PALM_LEAN, SHACK, FREEZER, FRZ_W, FRZ_H, SOUND, SIGN, SIGN_Y, SHORE } = KINGSTON;
    const sandT = tex(32, 32, (x, r) => { px(x, '#f2dca8', 0, 0, 32, 32); noise(x, r, 32, 32, ['#ead098', '#f8e6b8', '#e2c88e'], 160); }, 2301);
    G.add(flat(80, 60, mat({ map: sandT, rep: [40, 30] }), 0, 0, SHORE + 30));
    // the sea: a turquoise plane beyond the shore, a foam line washing in and out, distant green hills
    const seaT = tex(32, 32, (x, r) => { px(x, '#2ec8d8', 0, 0, 32, 32); noise(x, r, 32, 32, ['#26b8cc', '#4ad8e4', '#1aa8c0'], 200); for (let i = 0; i < 8; i++) px(x, '#e8fcff', Math.floor(r() * 29), Math.floor(r() * 32), 3, 1); }, 2302);
    const seaM = mat({ map: seaT, rep: [60, 40], unlit: 0.25 }); G.add(flat(400, 200, seaM, 0, 0.02, SHORE - 100));
    const foam = flat(80, 0.6, M(0xffffff, { unlit: 0.4 }), 0, 0.03, SHORE); G.add(foam);
    const wet = flat(80, 1.2, M(0xd8bc80), 0, 0.006, SHORE + 0.8); G.add(wet);
    const skyT = grad([[0, '#2f8ee8'], [0.5, '#7ec4f4'], [0.85, '#d8f0ff'], [1, '#f0faff']]);
    G.add(new THREE.Mesh(new THREE.SphereGeometry(190, 16, 10), mat({ map: skyT, unlit: 1, nofog: 1, side: THREE.BackSide })));
    const sun = at(new THREE.Mesh(new THREE.CircleGeometry(9, 12), mat({ color: 0xfff8d0, unlit: 1, nofog: 1 })), 60, 95, -150); sun.lookAt(0, 0, 0); G.add(sun);
    const cloudM = M(0xffffff, { unlit: 0.6, nofog: 1 });
    for (let i = 0; i < 9; i++) { const c = new THREE.Group(); for (let q = 0; q < 3; q++) c.add(at(box(6 + hash(i, q) * 6, 2 + hash(i, q + 3) * 1.5, 3, cloudM), (q - 1) * 5, q === 1 ? 1 : 0, 0)); c.position.set((hash(i, 1) - 0.5) * 240, 30 + hash(i, 2) * 25, -120 - hash(i, 4) * 40); G.add(c); }
    const hill = M(0x3a9a4a, { nofog: 1 }), hill2 = M(0x2a7a3a, { nofog: 1 });
    for (let i = 0; i < 6; i++) G.add(at(new THREE.Mesh(new THREE.SphereGeometry(14 + hash(i, 7) * 10, 10, 6, 0, TAU, 0, PI / 2), i % 2 ? hill : hill2), -150 + i * 18, -2, -150 - hash(i, 8) * 10));
    // palms: a bent trunk of stacked segments, a crown of fronds, coconuts under the crown
    const trunkM = M(0x9a7a50), leafM = M(0x3aa84a, { side: THREE.DoubleSide }), leaf2 = M(0x2a8a3a, { side: THREE.DoubleSide }), nutM = M(0x5a3a1a);
    const crowns = [];
    const palmAt = (x, z, h, lean, seed, nuts, dir) => {
      const p = new THREE.Group(); p.position.set(x, 0, z); if (dir) p.rotation.y = Math.atan2(-dir[1], dir[0]); G.add(p);
      const n = 8, top = new THREE.Vector3(Math.sin(lean) * h, h, 0);
      for (let q = 0; q < n; q++) { const f = q / n, seg = cyl(0.17 - f * 0.06, 0.2 - f * 0.06, h / n + 0.04, 7, trunkM); seg.position.set(Math.sin(lean) * h * f * f, h * (f + 0.5 / n), 0); seg.rotation.z = -lean * f * 1.4; p.add(seg); }
      const crown = new THREE.Group(); crown.position.copy(top); p.add(crown);
      for (let q = 0; q < 8; q++) { const a = q / 8 * TAU + seed, fd = box(0.5, 0.04, 2.4, q % 2 ? leafM : leaf2); fd.position.set(Math.sin(a) * 1.0, -0.25, Math.cos(a) * 1.0); fd.rotation.set(0.45, a, 0, 'YXZ'); crown.add(fd); }
      if (nuts) for (let q = 0; q < 5; q++) crown.add(at(ico(0.12, 0, nutM), Math.cos(q * 1.3) * 0.25, -0.25, Math.sin(q * 1.3) * 0.25));
      crowns.push(crown);
    };
    palmAt(PALM[0], PALM[1], CROWN, PALM_LEAN, 0.3, true, PALM_DIR);   // the coconut palm, its crown over the team photo's row
    [[-6.5, -5.5, 4.4, 0.25], [-8.5, -2.0, 3.8, -0.2], [7.6, -5.0, 4.6, -0.3], [9.5, -1.5, 4.0, 0.2], [-3.4, -10.5, 4.2, 0.15], [5.5, -10.0, 3.9, -0.25]].forEach(([x, z, h, l], i) => palmAt(x, z, h, l, i, true));
    // the beach shack: pink, turquoise, yellow and orange planks, a striped tin roof, the KINGSTON sign on its roof board
    const shack = new THREE.Group(); shack.position.set(SHACK[0], 0, SHACK[1]); shack.rotation.y = -0.5; G.add(shack);
    const plankT = tex(16, 16, x => { for (let y = 0; y < 16; y += 4) px(x, ['#ff7aa8', '#3ad0c0', '#ffd21f', '#ff9a3c'][y / 4], 0, y, 16, 4); for (let y = 3; y < 16; y += 4) px(x, 'rgba(0,0,0,.25)', 0, y, 16, 1); }, 2303);
    const plank = mat({ map: plankT, rep: [2, 1] });
    shack.add(at(box(3.2, 2.2, 0.12, plank), 0, 1.1, -1.2)); for (const s of [-1, 1]) shack.add(at(box(0.12, 2.2, 2.4, plank), s * 1.6, 1.1, 0));
    shack.add(at(box(3.2, 1.0, 0.5, plank), 0, 0.5, 0.95)); shack.add(at(box(3.4, 0.08, 0.7, M(0xf6f0e0)), 0, 1.04, 0.95));
    const roofT = tex(16, 8, x => { for (let i = 0; i < 16; i += 6) { px(x, '#1f9a3c', i, 0, 2, 8); px(x, '#ffd21f', i + 2, 0, 2, 8); px(x, '#e84a3a', i + 4, 0, 2, 8); } });
    const roof = at(box(3.8, 0.08, 3.0, mat({ map: roofT, rep: [2, 1] })), 0, 2.45, 0.1); roof.rotation.x = 0.18; shack.add(roof);
    for (const s of [-1, 1]) shack.add(at(box(0.1, 2.5, 0.1, M(0x7a5a3a)), s * 1.55, 1.25, 1.35));
    const signT = tex(64, 16, x => { px(x, '#1f9a3c', 0, 0, 64, 16); px(x, '#ffd21f', 1, 1, 62, 14); px(x, '#1f9a3c', 2, 2, 60, 12); x.fillStyle = '#ffd21f'; x.font = 'bold 11px monospace'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('KINGSTON', 32, 8.5); selfLit(x, 64, 16); });
    shack.add(at(box(3.0, 0.75, 0.08, mat({ map: signT, unlit: 0.35 })), 0, 2.95, 1.25));
    // the freestanding sign on two posts by the path (the word on screen): the same KINGSTON board, bigger
    const sign = new THREE.Group(); sign.position.set(SIGN[0], 0, SIGN[1]); G.add(sign);
    sign.add(at(box(4.2, 1.05, 0.1, mat({ map: signT, unlit: 0.35 })), 0, SIGN_Y, 0)); for (const s of [-1, 1]) sign.add(at(box(0.14, SIGN_Y + 0.5, 0.14, M(0x7a5a3a)), s * 1.6, (SIGN_Y + 0.5) / 2, -0.08));
    // the chest freezer: white, a blue ICE plate, the lid on a hinge at its back edge
    const frz = new THREE.Group(); frz.position.set(FREEZER[0], 0, FREEZER[1]); G.add(frz);
    const iceT = tex(32, 8, x => { px(x, '#f4f8fc', 0, 0, 32, 8); x.fillStyle = '#2a7ae8'; x.font = 'bold 7px monospace'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('ICE', 16, 4.5); });
    const fw = FRZ_W, frzM = M(0xf4f8fc);   // an open-topped box (walls only), so whoever sits inside shows from the neck up
    frz.add(at(box(fw, FRZ_H, 0.08, frzM), 0, FRZ_H / 2, 0.55)); frz.add(at(box(fw, FRZ_H, 0.08, frzM), 0, FRZ_H / 2, -0.55)); for (const sd of [-1, 1]) frz.add(at(box(0.08, FRZ_H, 1.1, frzM), sd * fw / 2, FRZ_H / 2, 0));
    frz.add(at(box(1.0, 0.24, 0.02, mat({ map: iceT })), 0, FRZ_H * 0.62, 0.6));
    for (const sd of [-1, 1]) frz.add(at(box(fw, 0.05, 0.12, M(0xbfe8ff, { unlit: 0.5 })), 0, FRZ_H, sd * 0.55));   // frost on the rims
    const lidPivot = at(new THREE.Group(), 0, FRZ_H + 0.02, -0.55); frz.add(lidPivot); lidPivot.add(at(box(fw + 0.04, 0.07, 1.14, M(0xffffff)), 0, 0.02, 0.57));
    const mist = []; for (let i = 0; i < 18; i++) { const m = box(0.08, 0.08, 0.08, M(0xeaf6ff, { unlit: 0.7 })); m.visible = false; frz.add(m); mist.push(m); }
    // a wooden crate by the freezer (Kob's seat in the sun)
    const crateT = tex(8, 8, x => { px(x, '#b07a44', 0, 0, 8, 8); px(x, '#8a5a30', 0, 0, 8, 1); px(x, '#8a5a30', 0, 4, 8, 1); px(x, '#8a5a30', 0, 0, 1, 8); px(x, '#8a5a30', 7, 0, 1, 8); });
    const crate = at(box(0.62, CRATE_Y, 0.55, mat({ map: crateT })), CRATE[0], CRATE_Y / 2, CRATE[1]); G.add(crate);
    // the sound system: six speaker boxes, two wide, three high, cones pumping on the beat, a painted plate on top
    const snd = new THREE.Group(); snd.position.set(SOUND[0], 0, SOUND[1]); snd.rotation.y = 0.35; G.add(snd);
    const cab = M(0x1a1a20), cones = [], coneM = M(0x5a5a64), capM = M(0x2a2a30);
    for (let r = 0; r < 3; r++) for (let c = 0; c < 2; c++) {
      const sc = r === 2 ? 0.8 : 1.0, y = [0.5, 1.5, 2.35][r];
      snd.add(at(box(0.95 * sc, 0.95 * sc, 0.7, cab), (c - 0.5) * 1.0, y, 0));
      const cn = new THREE.Mesh(new THREE.CircleGeometry(0.36 * sc, 12), coneM); cn.position.set((c - 0.5) * 1.0, y, 0.36); snd.add(cn); cones.push(cn);
      snd.add(at(new THREE.Mesh(new THREE.CircleGeometry(0.1 * sc, 8), capM), (c - 0.5) * 1.0, y, 0.37));
    }
    const plateT = tex(32, 8, x => { px(x, '#ffd21f', 0, 0, 32, 8); px(x, '#1f9a3c', 0, 3, 32, 2); px(x, '#141414', 0, 7, 32, 1); });
    snd.add(at(box(2.0, 0.3, 0.72, mat({ map: plateT, unlit: 0.3 })), 0, 2.9, 0));
    const tub = bathtub(); G.add(tub);
    // locals: 12 beach pets round the beach (homes), who gather when asked
    const locals = []; for (let i = 0; i < 12; i++) { const p = pet(i, 'beach'); G.add(p.g); locals.push({ p, hx: (i < 6 ? -1 : 1) * (6.4 + (i % 3) * 1.1), hz: -3.8 + (i % 6) * 1.15 }); }
    const fallNuts = [], bonks = [], drops = [];
    const stars4 = [];
    for (let i = 0; i < 6; i++) { const n = ico(0.15, 0, nutM); n.visible = false; G.add(n); fallNuts.push(n); const r = new THREE.Mesh(new THREE.RingGeometry(0.14, 0.22, 10), mat({ color: 0xfff2a0, unlit: 1, side: THREE.DoubleSide })); r.visible = false; G.add(r); bonks.push(r); stars4.push([0, 1, 2, 3].map(() => { const st = box(0.09, 0.09, 0.02, glow(0xffe23a)); st.visible = false; G.add(st); return st; })); }
    for (let i = 0; i < 40; i++) { const d = box(0.09, 0.09, 0.09, M(0xe8fcff, { unlit: 0.5 })); d.visible = false; G.add(d); drops.push(d); }
    const puffs = []; for (let i = 0; i < 36; i++) { const q = box(0.14, 0.14, 0.14, M(0xf0d8a0, { unlit: 0.35 })); q.visible = false; G.add(q); puffs.push(q); }   // `puffs` [[x, z]]: sand kicked up on every half beat
    return {
      group: G, sky: skyT, shadowCol: 0xc8a870,
      light() { lights(0xd0ccc4, 0xfff0d0, [-0.45, -1, -0.35], 0xd8f0ff, [40, 180], 7); },
      anim(t, P = {}) {
        const s = shotT(t, P), hb = Math.exp(-fr(beat(t)) * 5);
        if (P.key) pt(0, P.key[0], P.key[1], P.key[2], P.key[3], P.key[4], P.key[5]);
        seaM.uniforms.uOff.value.set(t * 0.01, t * 0.02); foam.position.z = SHORE + 0.35 * Math.sin(t * 0.9); wet.position.z = SHORE + 0.8 + 0.2 * Math.sin(t * 0.9 - 0.4);
        crowns.forEach((c, i) => { c.rotation.z = 0.05 * Math.sin(t * 1.1 + i); c.rotation.x = 0.03 * Math.sin(t * 0.8 + i * 2); });
        cones.forEach((c, i) => c.scale.setScalar(1 + 0.16 * hb * (i % 2 ? 1 : 0.85)));
        lidPivot.rotation.x = -1.6 * (P.lid ?? 0); frz.visible = !(P.hide || []).includes('freezer'); crate.visible = !(P.hide || []).includes('crate');
        mist.forEach((m, i) => { m.visible = !!P.mist; if (!m.visible) return; const u = fr(t * 0.35 + hash(i, 21)); m.position.set((hash(i, 22) - 0.5) * (FRZ_W - 0.3), FRZ_H + u * 1.2, (hash(i, 23) - 0.5) * 0.8); m.scale.setScalar(1 - u * 0.7); });
        placeTub(tub, P, s);
        locals.forEach(({ p, hx, hz }, i) => {
          let x = hx, z = hz;
          if (P.gather) { const [cx, cz, r, a0, a1] = P.gather, a = (a0 + (a1 - a0) * (i + 0.5) / locals.length) * PI / 180; x = cx + Math.sin(a) * r * (1 + (i % 2) * 0.18); z = cz + Math.cos(a) * r * (1 + (i % 2) * 0.18); }
          const show = !P.noguests && !cleared(P, x, z); p.g.visible = show; if (!show) return;
          p.g.position.set(x, 0, z);
          animPet(p, P, s, x, z, P.cheer ? 'cheer' : P.dance ? 'dance' : 'watch', P.stare || (P.gather ? [P.gather[0], P.gather[1]] : null));
        });
        // coconuts: from straight above the target down onto it, a bonk ring, a bounce off into the sand
        fallNuts.forEach((n, i) => {
          const c = (P.coconuts || [])[i]; n.visible = false; bonks[i].visible = false; if (!c) return;
          const [t0, x, z, y, top = 3.4] = c, g = 9.8, ft = Math.sqrt(2 * Math.max(0.05, top - y) / g), d = s - (t0 - ft);
          if (d < 0) return;
          n.visible = true;
          if (d < ft) n.position.set(x, top - 0.5 * g * d * d, z);
          else { const e = d - ft, vx = (i % 2 ? 1 : -1) * 1.2; n.position.set(x + vx * e, Math.max(0.15, y + 2.6 * e - 0.5 * g * e * e), z + 0.4 * e); }
          n.rotation.set(d * 6, d * 4, 0);
          const e2 = d - ft; if (e2 >= 0 && e2 < 0.35) { const r = bonks[i]; r.visible = true; r.position.set(x, y + 0.06, z + 0.05); r.rotation.set(0, 0, e2 * 3); r.scale.setScalar(1.2 + e2 * 7); stars4[i].forEach((st, q) => { const a = q / 4 * TAU + 0.4; st.visible = true; st.position.set(x + Math.cos(a) * (0.22 + e2 * 1.4), y + 0.08 + Math.sin(a) * (0.16 + e2 * 1.0), z + 0.06); st.rotation.z = e2 * 9; }); }
          else stars4[i].forEach(st => { st.visible = false; });
        });
        puffs.forEach((q, i) => {
          const pts = P.puffs || []; q.visible = false; if (!pts.length) return;
          const [px0, pz0] = pts[i % pts.length], k = Math.floor(i / pts.length), b2 = beat(t) * 2 + k * 0.33 + i * 0.07, u = fr(b2);
          q.visible = u < 0.7; q.position.set(px0 + (hash(i, 31) - 0.5) * 0.5 + (hash(i, 33) - 0.5) * u * 0.6, 0.06 + u * 0.35, pz0 + (hash(i, 32) - 0.5) * 0.4); q.scale.setScalar(1 - u);
        });
        drops.forEach((d, i) => {
          d.visible = false; const sp = P.splash; if (!sp) return; const e = s - sp[0]; if (e < 0 || e > 1.3) return;
          const a = hash(i, 9) * TAU, v = (1.5 + hash(i, 10) * 2.5) * (sp[3] || 1), y = (3 + hash(i, 11) * 3) * e - 4.9 * e * e;
          if (y < -0.05) return; d.visible = true; d.position.set(sp[1] + Math.cos(a) * v * e, y, sp[2] + Math.sin(a) * v * e);
        });
      },
    };
  }

  // =================================== THE ICE TRACK ===================================
  function icetrack() {
    const G = new THREE.Group(), world = new THREE.Group(); G.add(world);
    const { W, WALL, LIP, START_Z, ARCH_Z, BOARD, L } = ICE;
    const snowT = tex(32, 32, (x, r) => { px(x, '#e8eef8', 0, 0, 32, 32); noise(x, r, 32, 32, ['#dce4f2', '#f4f8ff', '#d0daea'], 140); }, 2311);
    const iceT = tex(16, 32, (x, r) => { px(x, '#cfe6f6', 0, 0, 16, 32); noise(x, r, 16, 32, ['#c2dcf0', '#ddeefa', '#b8d4ec'], 90); for (let i = 0; i < 5; i++) px(x, '#f2faff', Math.floor(r() * 15), Math.floor(r() * 24), 1, 8); }, 2312);
    const wallT = tex(16, 16, (x, r) => { px(x, '#eef4fa', 0, 0, 16, 16); noise(x, r, 16, 16, ['#e2eaf4', '#f8fbff'], 40); px(x, '#2a5ae8', 0, 11, 16, 2); px(x, '#e8303a', 0, 14, 16, 1); }, 2313);
    const iceM = mat({ map: iceT, rep: [2, 40] }), wallM = mat({ map: wallT, rep: [30, 1] }), wallTop = M(0xf8fbff);
    const snowAll = flat(160, 160, mat({ map: snowT, rep: [60, 60] }), 0, -0.01, 0); world.add(snowAll);   // the start zone swaps it for snow that ends at the lip (snowStart) and a slope down the drop
    // the channel: an ice floor and two walls with a rounded lip, 120 m long (the run scrolls their textures)
    const chan = new THREE.Group(); world.add(chan);
    chan.add(flat(W, 120, iceM, 0, 0.005, -40));
    const walls = { '-1': [], '1': [] };   // `hideWall` -1 | 1: the wall, its lip and its snow bank on that side vanish (a lens just outside it)
    for (const s of [-1, 1]) {
      const w = at(box(0.18, WALL, 120, wallM), s * (W / 2 + 0.09), WALL / 2, -40); w.rotation.z = -s * 0.06; chan.add(w);
      const lip = cyl(0.12, 0.12, 120, 8, wallTop); lip.rotation.x = PI / 2; chan.add(at(lip, s * (W / 2 + 0.14), WALL, -40));
      const bank = at(box(0.8, WALL * 0.9, 120, mat({ map: snowT, rep: [1, 40] })), s * (W / 2 + 0.6), WALL * 0.45, -40); chan.add(bank);   // the snow bank behind the wall
      const terrace = at(box(1.0, WALL * 0.9 + 0.3, 120, mat({ map: snowT, rep: [1, 40] })), s * (W / 2 + 1.5), (WALL * 0.9 + 0.3) / 2, -40); chan.add(terrace);   // the fans' second row stands on it
      walls[s].push(w, lip, bank, terrace);
    }
    // the night: a dark blue dome with stars, snowy mountains, pines
    const skyT = grad([[0, '#060a1c'], [0.5, '#141e46'], [0.85, '#2a3a6a'], [1, '#3a4a7a']]);
    G.add(new THREE.Mesh(new THREE.SphereGeometry(190, 16, 10), mat({ map: skyT, unlit: 1, nofog: 1, side: THREE.BackSide })));
    G.add(k.stars(160, 180, 2314, 0xffffff, 0.15));
    const mtM = M(0x2a3450, { nofog: 1 }), mtS = M(0xdfe8f4, { nofog: 1 });
    for (let i = 0; i < 7; i++) { const h = 40 + hash(i, 3) * 35, r = 40 + hash(i, 4) * 25, a = -1.3 + i * 0.42; const mt = at(cone(r, h, 6, mtM), Math.sin(a) * 150, h / 2 - 5, -Math.cos(a) * 150); G.add(mt); G.add(at(cone(r * 0.32, h * 0.32, 6, mtS), mt.position.x, h - 5 - h * 0.16, mt.position.z)); }
    const pineM = M(0x1e4a3a), pineS = M(0xe8f0fa), trunk = M(0x4a3020);
    const pine = (x, z, h) => { const p = new THREE.Group(); p.add(at(cyl(0.12, 0.15, 0.6, 5, trunk), 0, 0.3, 0)); for (let q = 0; q < 3; q++) { p.add(at(cone(h * (0.32 - q * 0.08), h * 0.45, 6, pineM), 0, 0.6 + q * h * 0.25 + h * 0.2, 0)); p.add(at(cone(h * (0.2 - q * 0.05), h * 0.15, 6, pineS), 0, 0.6 + q * h * 0.25 + h * 0.4, 0)); } p.position.set(x, 0, z); return p; };
    // ---------- scrollers: lamps, banners on the walls, pines (they repeat every L m; static outside the run) ----------
    const scroll = []; const addS = (o, z0) => { world.add(o); scroll.push([o, z0]); };
    const lampM = glow(0xfff4d8), poleM = M(0x5a6070);
    const lamps = []; for (let i = 0; i < L / 8; i++) for (const s of [-1, 1]) { const lp = new THREE.Group(); lamps.push(lp); lp.add(at(cyl(0.06, 0.08, 4.2, 6, poleM), 0, 2.1, 0)); lp.add(at(box(0.5, 0.18, 0.3, lampM), -s * 0.2, 4.2, 0)); lp.position.x = s * (W / 2 + 1.25); addS(lp, -i * 8 + (s > 0 ? 4 : 0)); }
    const banM = [0xe8303a, 0x2a5ae8, 0xffd21f, 0x2fae6a].map(c => M(c, { unlit: 0.2 }));
    for (let i = 0; i < L / 6; i++) for (const s of [-1, 1]) { const bn = at(box(0.04, 0.4, 2.6, banM[(i + (s > 0 ? 2 : 0)) % 4]), s * (W / 2 + 0.2), WALL * 0.55, 0); addS(bn, -i * 6 - 1.5); walls[s].push(bn); }   // the wall's banners go with it
    for (let i = 0; i < 26; i++) for (const s of [-1, 1]) { const pn = pine(s * (W / 2 + 4.5 + hash(i, s) * 6), 0, 3 + hash(i, s + 9) * 2.5); pn.userData.pine = true; addS(pn, -i * (L / 26)); }
    // fans behind the walls, two rows deep, all along the run
    const fans = [];
    for (let i = 0; i < L / 1.1; i++) for (const s of [-1, 1]) for (let row = 0; row < 2; row++) {
      if (hash(i, s + row * 3) < 0.18) continue;
      const p = pet(i * 4 + (s > 0 ? 1 : 0) + row * 2, 'fan'); p.g.position.set(s * (W / 2 + 0.85 + row * 0.8 + hash(i, row) * 0.15), WALL * 0.9 + row * 0.3, 0); world.add(p.g);   // on the bank (0.86 m) and the terrace behind it
      fans.push({ p, z0: -i * 1.1 - row * 0.4 });
    }
    const fenceM = M(0xe8303a);
    for (const s of [-1, 1]) { const f = at(box(0.06, 0.7, 120, fenceM), s * (W / 2 + 0.62), 0.35, -40); chan.add(f); walls[s].push(f); }   // hidden with its wall
    // ---------- the start: the start house behind, the gate, the lip, the stands, the rival sleds and their crews ----------
    const start = new THREE.Group(); world.add(start);
    const woodT = tex(16, 16, (x, r) => { px(x, '#8a5a32', 0, 0, 16, 16); for (let y = 0; y < 16; y += 4) px(x, '#6a4224', 0, y, 16, 1); noise(x, r, 16, 16, ['rgba(0,0,0,.12)'], 30); }, 2315);
    start.add(at(box(5.2, 3.2, 3.2, mat({ map: woodT, rep: [3, 2] })), 0, 1.6, START_Z + 1.8));
    start.add(at(box(5.8, 0.15, 3.8, M(0xf2f6fa)), 0, 3.3, START_Z + 1.8));
    const startT = tex(64, 16, x => { px(x, '#e8303a', 0, 0, 64, 16); x.fillStyle = '#ffffff'; x.font = 'bold 11px monospace'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('START', 32, 8.5); selfLit(x, 64, 16); });
    start.add(at(box(3.6, 0.9, 0.1, mat({ map: startT, unlit: 0.5 })), 0, 2.6, START_Z + 0.15));
    const goM = glow(0xff3030);   // the start lights: red, then green from `go` s into the shot
    for (const s of [-1, 1]) { start.add(at(box(0.16, 1.4, 0.16, M(0x2a2a30)), s * (W / 2 + 0.25), 0.7, 2.0)); start.add(at(box(0.5, 1.15, 0.24, M(0x1a1a20)), s * (W / 2 + 0.25), 1.95, 2.0)); for (let q = 0; q < 3; q++) start.add(at(box(0.34, 0.3, 0.1, goM), s * (W / 2 + 0.25), 1.55 + q * 0.36, 1.86)); }
    const drop = new THREE.Group(); drop.position.set(0, 0, LIP); drop.rotation.x = -0.42; start.add(drop);   // past the lip the channel tips down the mountain
    const snowStart = flat(160, 90, mat({ map: snowT, rep: [60, 34] }), 0, -0.01, LIP + 45); start.add(snowStart);   // the snow stops at the lip: past it the slope falls away (the flat snow and the channel ran on past it and hid the drop: "the tub sits on flat ice", the reviewer)
    drop.add(flat(160, 80, mat({ map: snowT, rep: [60, 30], color: 0xa8b8d8 }), 0, -0.012, -40));   // the slope in shade: the edge reads against the lit flat
    drop.add(flat(W, 40, iceM, 0, 0.005, -20)); for (const s of [-1, 1]) drop.add(at(box(0.18, WALL, 40, wallM), s * (W / 2 + 0.09), WALL / 2, -20));
    const standT = tex(16, 16, x => { px(x, '#5a6a8a', 0, 0, 16, 16); for (let y = 0; y < 16; y += 4) px(x, '#3a4a6a', 0, y, 16, 1); }, 2316);
    const stands = [];
    for (const s of [-1, 1]) for (let r = 0; r < 3; r++) start.add(at(box(0.9, 0.35 + r * 0.45, 9, mat({ map: standT, rep: [1, 4] })), s * (W / 2 + 2.6 + r * 0.9), (0.35 + r * 0.45) / 2, -1.5));
    for (const s of [-1, 1]) for (let r = 0; r < 3; r++) for (let i = 0; i < 9; i++) { if (hash(i, r + s * 5) < 0.15) continue; const x = s * (W / 2 + 2.6 + r * 0.9), z = -5.6 + i * 1.0, p = pet(100 + i + r * 9 + (s > 0 ? 40 : 0), 'fan'); p.g.position.set(x, 0.35 + r * 0.45, z); start.add(p.g); stands.push({ p, x, z }); }
    // a crowd behind the start line, either side of the channel, facing down the run (the hook's background)
    for (let r = 0; r < 2; r++) for (let i = 0; i < 6; i++) { const sd = i < 3 ? -1 : 1, x = sd * (1.7 + (i % 3) * 0.75 + r * 0.35), z = 3.6 + r * 0.8, p = pet(150 + i + r * 6, 'fan'); p.g.position.set(x, 0, z); start.add(p.g); stands.push({ p, x, z }); }
    // two rival sleds: sleek capsules in red and in blue, with their crews in white suits standing by
    const rivals = [], sleds = [];
    const sled = col => { const g = new THREE.Group(), wht = M(0xf4f6fa); const b = new THREE.Mesh(new THREE.CapsuleGeometry(0.42, 2.2, 4, 10), M(col)); b.rotation.x = PI / 2; b.scale.set(1, 1, 0.55); g.add(at(b, 0, 0.36, 0)); g.add(at(box(0.78, 0.06, 2.3, wht), 0, 0.5, 0.2)); g.add(at(box(0.5, 0.2, 1.2, M(0x1a1a20)), 0, 0.55, 0.4)); for (const s of [-1, 1]) g.add(at(box(0.05, 0.05, 2.9, M(0xc8ccd4)), s * 0.32, 0.03, 0)); return g; };
    [[-1, 0xe8303a], [1, 0x2a5ae8]].forEach(([s, col], j) => {
      const g = sled(col); g.userData.x = s * (W / 2 + 2.5); g.userData.z = 1.0; g.position.set(g.userData.x, 0, 1.0); start.add(g); sleds.push(g);   // beyond the terrace
      for (let q = 0; q < 2; q++) { const x = s * (W / 2 + 1.9 + q * 0.62), z = 2.6 + q * 0.4, p = pet(200 + j * 2 + q, 'fan', 0xf4f6fa); p.g.position.set(x, 0, z); start.add(p.g); rivals.push({ p, x, z }); }
    });
    // ---------- the finish: the gantry over the channel, the timing board, grandstands ----------
    const finish = new THREE.Group(); world.add(finish);
    const finT = tex(64, 16, x => { for (let i = 0; i < 64; i += 4) for (let j = 0; j < 16; j += 4) px(x, (i + j) % 8 ? '#141414' : '#f4f4f4', i, j, 4, 4); px(x, '#e8303a', 8, 3, 48, 10); x.fillStyle = '#ffffff'; x.font = 'bold 9px monospace'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('FINISH', 32, 8.5); selfLit(x, 64, 16); });
    for (const s of [-1, 1]) finish.add(at(box(0.3, 3.4, 0.3, M(0x2a2a30)), s * (W / 2 + 0.9), 1.7, ARCH_Z));
    finish.add(at(box(W + 2.2, 0.9, 0.2, mat({ map: finT, unlit: 0.5 })), 0, 3.0, ARCH_Z));
    const boardT = tex(64, 32, x => { px(x, '#0a0a12', 0, 0, 64, 32); px(x, '#2a2a3a', 0, 0, 64, 2); x.font = 'bold 10px monospace'; x.textBaseline = 'middle'; x.fillStyle = '#ffd21f'; x.textAlign = 'left'; x.fillText('JAM', 4, 9); x.fillStyle = '#3adf6a'; x.fillText('1:13.24', 4, 22); selfLit(x, 64, 32); });
    const board = new THREE.Group(); board.position.set(BOARD[0], 0, BOARD[1]); board.rotation.y = 0.2; finish.add(board);
    board.add(at(box(2.6, 1.4, 0.12, mat({ map: boardT, unlit: 0.85 })), 0, 2.5, 0)); board.add(at(box(0.18, 1.9, 0.18, M(0x2a2a30)), 0, 0.95, -0.1));
    const gs = [];
    for (const s of [-1, 1]) for (let r = 0; r < 4; r++) finish.add(at(box(0.95, 0.35 + r * 0.5, 14, mat({ map: standT, rep: [1, 6] })), s * (W / 2 + 2.4 + r * 0.95), (0.35 + r * 0.5) / 2, ARCH_Z + 3));
    for (const s of [-1, 1]) for (let r = 0; r < 4; r++) for (let i = 0; i < 13; i++) { if (hash(i, r + s * 7 + 50) < 0.12) continue; const x = s * (W / 2 + 2.4 + r * 0.95), z = ARCH_Z - 3 + i * 1.0, p = pet(300 + i + r * 13 + (s > 0 ? 60 : 0), 'fan'); p.g.position.set(x, 0.35 + r * 0.5, z); finish.add(p.g); gs.push({ p, x, z }); }
    // ---------- the tub, the hit bursts, snow, confetti, flares ----------
    const tub = bathtub(); G.add(tub);
    const chunks = []; for (let i = 0; i < 64; i++) { const c = box(0.2, 0.15, 0.2, M(i % 3 ? 0xf2faff : 0xcfe6f6, { unlit: 0.5 })); c.scale.setScalar(0.6 + hash(i, 6) * 1.0); c.visible = false; G.add(c); chunks.push(c); }   // big enough to read in a still (36 small ones didn't, the reviewer)
    const snowFall = fall(G, 140, M(0xffffff, { unlit: 0.7 }), new THREE.BoxGeometry(0.05, 0.05, 0.05), { w: 22, top: 9, speed: 0.9, drift: 0.6, seed: 2317 });
    const confM = [0xffb020, 0x1f9a3c, 0xe8303a, 0xffffff].map(c => M(c, { unlit: 0.6, side: THREE.DoubleSide })), n0 = G.children.length;   // amber, not the karaoke's sung yellow (falling through the lyric rows it read as the word turning, tools/ksync.mjs)
    const confFall = fall(G, 160, confM[0], new THREE.PlaneGeometry(0.09, 0.06), { w: 9, top: 6, speed: 1.1, spin: 3, drift: 0.5, seed: 2318 });
    const conf = G.children.slice(n0); conf.forEach((c, i) => { c.material = confM[i % 4]; });
    const flareM = glow(0xff4a3a), flares = []; for (let i = 0; i < 6; i++) { const f = new THREE.Group(); f.add(cyl(0.03, 0.03, 0.35, 5, M(0x2a2a30))); f.add(at(ico(0.09, 0, flareM), 0, 0.22, 0)); G.add(f); flares.push(f); }
    const wrap = (z0, t, V) => ((z0 + t * V) % L + L) % L - L + 12;
    return {
      group: G, sky: skyT, shadowCol: 0x5a6a92, shadowY: 0.06,   // the blob shadows 6 cm up: at 1.2 cm the snapped ice drew over them (no shadow on the ice in two reviews)
      light() { lights(0x8a96b8, 0xf4f0ff, [0.25, -1, 0.35], 0x2a3460, [18, 120], 9); pt(0, -3, 6, 0, 0.55, 0.55, 0.6); pt(1, 3, 6, -6, 0.5, 0.5, 0.55); },
      anim(t, P = {}) {
        const s = shotT(t, P), zone = P.zone || 'start', run = zone === 'run', V = run ? (P.speed ?? 14) : 0;
        if (P.key) pt(2, P.key[0], P.key[1], P.key[2], P.key[3], P.key[4], P.key[5]);
        start.visible = zone === 'start'; finish.visible = zone === 'finish';
        goM.uniforms.uCol.value.set(P.go != null && s >= P.go ? 0x3adf6a : 0xff3030);
        iceM.uniforms.uOff.value.set(0, run ? -t * V / 3 : 0); wallM.uniforms.uOff.value.set(run ? t * V / 4 : 0, 0);
        world.rotation.z = run ? (P.bank || 0) * PI / 180 : 0;
        const atStart = zone === 'start', past = z => atStart && z < LIP + 0.3;   // at the start the channel ends at the lip (scaled from 120 m to the 27.5 m between the lip and z 20) and nothing stands past it
        chan.scale.z = atStart ? 27.5 / 120 : 1; chan.position.z = atStart ? 20 - 20 * 27.5 / 120 : 0; snowAll.visible = !atStart;
        for (const sd of ['-1', '1']) walls[sd].forEach(o => { o.visible = String(P.hideWall) !== sd; });
        scroll.forEach(([o, z0]) => { o.position.z = run ? wrap(z0, t, V) : z0; if (o.userData.pine) o.visible = !past(o.position.z); else if (past(o.position.z)) o.visible = false; });
        lamps.forEach(lp => { lp.visible = !P.noLamps && !cleared(P, lp.position.x, lp.position.z) && !past(lp.position.z) && Math.sign(lp.position.x) !== P.hideWall; });   // a lamp post never sweeps across a lens (`clear`; `noLamps`: none)
        const mode = P.fans || 'watch', look = P.stare || null;
        fans.forEach(f => {
          const z = run ? wrap(f.z0, t, V) : f.z0, x = f.p.g.position.x;
          const show = !P.noguests && (run || zone === 'finish' ? true : z < 1 && !past(z)) && !cleared(P, x, z) && Math.sign(x) !== P.hideWall; f.p.g.visible = show; if (!show) return;   // a hidden wall takes its bank and so its fans
          f.p.g.position.z = z; animPet(f.p, P, s, x, z, mode, look || [0, z + (run ? 3 : 0)]);
        });
        stands.forEach(q => { const show = zone === 'start' && !P.noguests && !cleared(P, q.x, q.z); q.p.g.visible = show; if (show) animPet(q.p, P, s, q.x, q.z, mode, look || [0, q.z]); });
        gs.forEach(q => { const show = zone === 'finish' && !P.noguests && !cleared(P, q.x, q.z); q.p.g.visible = show; if (show) animPet(q.p, P, s, q.x, q.z, mode, look || [0, q.z]); });
        sleds.forEach((g, i) => { const a = P.sledPos && P.sledPos[i]; g.position.set(a ? a[0] : g.userData.x, a && a[3] || 0, a ? a[1] : g.userData.z); g.rotation.y = a && a[2] ? a[2] * PI / 180 : 0; });
        rivals.forEach((q, i) => { const at2 = P.rivalPos && P.rivalPos[i], x = at2 ? at2[0] : q.x, z = at2 ? at2[1] : q.z; q.p.g.position.set(x, at2 && at2[2] || 0, z); const show = zone === 'start' && !P.noRivals && (!!at2 || !cleared(P, x, z)); q.p.g.visible = show; if (show) animPet(q.p, P, s, x, z, 'watch', P.rivals || [0, 0]); });   // placed rivals stay: `clear` makes room for them among the fans
        placeTub(tub, P, s);
        // a hit on the wall: ice chunks burst off that side of the tub, flying back and out
        chunks.forEach((c, i) => {
          c.visible = false; const hs = P.hits || []; if (!hs.length) return;
          const h = hs.reduce((m, q) => { const q0 = Array.isArray(q) ? q[0] : q; return q0 <= s && (!m || q0 > (Array.isArray(m) ? m[0] : m)) ? q : m; }, null); if (!h) return;   // the latest hit takes every chunk
          const h0 = Array.isArray(h) ? h[0] : h, side = Array.isArray(h) ? h[1] : (i % 2 ? 1 : -1), e = s - h0; if (e < 0 || e > 0.9) return;
          const vx = side * (0.1 + hash(i, 1) * 1.3), vy = 2.4 + hash(i, 2) * 2.8, vz = 0.6 + hash(i, 3) * 2.4, x0 = side * (W / 2 - 0.1), z0 = tub.position.z - 1.4 + hash(i, 4) * 2.4;   // off the wall's top where the tub meets it, flying up and out over the wall (spawned at the wall's face they hid in the tub's side; sprayed back over the tub they buried the riders' faces)
          const y = 0.85 + vy * e - 4.9 * e * e; if (y < 0) return;
          c.visible = true; c.position.set(x0 + vx * e, y, z0 + vz * e); c.rotation.set(e * 9 + i, e * 7, 0);
        });
        snowFall(t);
        conf.forEach(c => { c.visible = !!P.confetti; }); if (P.confetti) { confFall(t); conf.forEach(c => { c.position.z += ARCH_Z + 2; }); }
        flares.forEach((f, i) => { f.visible = !!P.flares && zone === 'finish'; if (f.visible) { const sd = i % 2 ? 1 : -1; f.position.set(sd * (W / 2 + 0.75 + (i % 3) * 0.45), WALL * 0.9 + 0.9 + (i % 3) * 0.3 + 0.12 * Math.sin(t * 9 + i), ARCH_Z + 0.6 + Math.floor(i / 2) * 0.9); f.rotation.z = 0.3 * Math.sin(t * 7 + i); } });   // held up by the fans on the banks either side of the gantry
      },
    };
  }
  return { kingston: kingston(), icetrack: icetrack() };
}
