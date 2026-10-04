// maps28.js: the "Beautiful Things" map (2026-10-04 2nd, Benson Boone; the clip: the band drives a white van into a
// red-rock desert, hauls its drum kit and amps up the rocks and plays on the rim of a canyon at golden hour, the
// singer alone in a field of dry grass at sunset). Same contract as the other map files, pure in t:
//   canyon  the band's stage on a slickrock shelf at the rim of a red canyon: the edge along x at CANYON.EDGE_Z, a
//           sheer wall of red and cream strata dropping 70 m to a river, the far wall and its mesas and buttes
//           beyond (all behind the band, so the usual lenses look at it); on the shelf the mic stand before Saxo's
//           mark (MIC), Sadi's mark stage left (SADI) and Compote's stage right (COMPOTE) with their amps, Kob's drum
//           kit (DRUMS, her stool at KOB, 0.9 m from the edge), cables; a big sage bush stage left (BUSH: someone can
//           nose into it), smaller scrub, dry grass, sandstone boulders, the white van parked back from the edge
//           (VAN), a hawk circling, a tumbleweed now and then.
// Flags: zone ('golden' | 'dusk': a purple and orange sky dome, the sun on the far rim, warmer and darker light),
// rustle ([s0, s1]: the big bush shakes, leaves flying, as if someone were rummaging in it), dust ([[x, z, s, size]]:
// a puff of red dust), hearts ([[x, y, z, s0]]: three pink hearts pop and rise), tumble (false: no tumbleweed),
// noVan, noMic, noBush, hawk (true: a hawk circling; off by default, it sat in the lyric rows), clear ([[x, z, r]]: no bush, boulder or tuft there: the lenses), key [x, y, z, r, g, b].
import { mapKit } from './mapkit.js';

export const CANYON = {
  EDGE_Z: -4.2,                       // the rim's edge: the drop beyond
  MIC: [0, -0.9],                     // Saxo's mark (the stand in front of him, at z + 0.42)
  SADI: [-1.4, -1.2], COMPOTE: [1.45, -1.3],
  DRUMS: [0.95, -2.75], KOB: [0.95, -3.3],   // the kit's centre, Kob's stool behind it facing +z
  BUSH: [-3.1, 1.1],                  // the big sage bush
  VAN: [-8.5, 5.5], DROP: 70, FAR_Z: -46, FAR_Y: -10,   // the far wall's top: 10 m under the shelf, 42 m across the drop
};

export function buildCanyonMaps(K) {
  const k = mapKit(K);
  const { THREE, mat, tex, px, noise, box, TAU, PI, beat, grad, cyl, cone, ico, at, rot, flat, lights, pt, hash, merged, fr } = k;
  const M = (c, o = {}) => mat({ color: c, ...o }), glow = (c, u = 1) => mat({ color: c, unlit: u });
  const shotT = (t, P) => P.t0 != null ? t - P.t0 : 0;
  const cleared = (P, x, z) => (P.clear || []).some(([cx, cz, r]) => (x - cx) ** 2 + (z - cz) ** 2 < r * r);
  const { EDGE_Z, MIC, SADI, COMPOTE, DRUMS, BUSH, VAN, DROP, FAR_Z, FAR_Y } = CANYON;
  const METAL = M(0xb8bcc4), CHROME = M(0xdfe2e8, { unlit: 0.2 }), BLACK = M(0x18181c);

  // ---------------- the band's gear (the desert stage's, maps20.js) ----------------
  function drumKit(G, x, z) {
    const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = -PI / 2; g.scale.setScalar(0.8); G.add(g);   // at 0.8 the seated chibi's face clears the toms and cymbals
    const shell = M(0xc8283a), skin = M(0xf4f2ea), cymM = mat({ color: 0xd8b060, unlit: 0.15 });   // a red kit: the clip's
    g.add(at(rot(cyl(0.2, 0.2, 0.3, 10, shell), 0, 0, PI / 2), 0.62, 0.2, 0));
    g.add(at(rot(cyl(0.19, 0.19, 0.012, 10, skin), 0, 0, PI / 2), 0.78, 0.2, 0));
    const drum = (r, h, dx, y, dz, tilt = 0) => { const d = at(new THREE.Group(), dx, y, dz); d.rotation.z = tilt; d.add(cyl(r, r, h, 10, shell)); d.add(at(cyl(r * 0.96, r * 0.96, 0.008, 10, skin), 0, h / 2 + 0.004, 0)); d.add(at(cyl(r + 0.008, r + 0.008, 0.012, 10, CHROME), 0, h / 2, 0)); g.add(d); };
    drum(0.12, 0.08, 0.28, 0.3, -0.18, 0.12); drum(0.09, 0.08, 0.5, 0.5, -0.34, 0.35); drum(0.09, 0.08, 0.5, 0.5, 0.34, 0.35); drum(0.13, 0.2, 0.3, 0.2, 0.3, 0.05);
    const cymbals = [];
    const cymbal = (r, dx, y, dz, rx, rz) => { g.add(at(cyl(0.008, 0.008, y, 4, METAL), dx, y / 2, dz)); const c = at(cyl(r, r * 0.2, 0.012, 12, cymM), dx, y, dz); c.rotation.set(rx, 0, rz); g.add(c); cymbals.push({ c, rx, rz }); };
    cymbal(0.12, 0.3, 0.44, -0.38, 0, 0); cymbal(0.17, 0.5, 0.78, -0.36, -0.25, 0.25); cymbal(0.19, 0.46, 0.72, 0.42, 0.28, 0.22);
    return { g, cymbals };
  }
  const swingCymbals = (kit, b) => kit.cymbals.forEach(({ c, rx, rz }, i) => { const h = Math.exp(-fr(b + i * 0.5) * 6); c.rotation.set(rx + 0.12 * h, 0, rz + 0.08 * h); });
  function amp(G, x, z, w = 0.62, h = 0.45, d = 0.36, yaw = 0) {
    const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = yaw; G.add(g);
    g.add(at(box(w, h, d, M(0x2a2a2e)), 0, h / 2, 0)); g.add(at(box(w - 0.08, h - 0.14, 0.01, M(0x5a5048)), 0, h / 2 - 0.03, d / 2 + 0.005));
    g.add(at(box(w - 0.06, 0.06, 0.01, M(0xc8c0a8)), 0, h - 0.05, d / 2 + 0.006));
    for (let i = 0; i < 4; i++) g.add(at(box(0.03, 0.03, 0.02, CHROME), -w / 2 + 0.12 + i * 0.1, h - 0.05, d / 2 + 0.012));
    return g;
  }
  function micStand(G, x, z) {
    const g = new THREE.Group(); g.position.set(x, 0, z); G.add(g);
    g.add(at(cyl(0.12, 0.14, 0.02, 8, BLACK), 0, 0.01, 0)); g.add(at(cyl(0.012, 0.012, 0.78, 5, METAL), 0, 0.39, 0));
    g.add(at(rot(cyl(0.01, 0.01, 0.34, 4, METAL), 0.62, 0, 0), 0, 0.8, -0.14));
    g.add(at(rot(cyl(0.028, 0.02, 0.11, 6, BLACK), 0.62, 0, 0), 0, 0.88, -0.3));
    return g;
  }

  function canyon() {
    const G = new THREE.Group();
    // ---------------- the slickrock shelf ----------------
    const rockT = tex(32, 32, (x, r) => { px(x, '#c4835a', 0, 0, 32, 32); noise(x, r, 32, 32, ['#bc7a52', '#cb8c62', '#b67450', '#d09468'], 220); }, 2801);
    G.add(flat(130, 60, mat({ map: rockT, rep: [86, 40] }), 0, 0, EDGE_Z + 30));
    // broken slabs along the edge, low and flat (a row of icosahedrons read as orange pyramids from a low lens)
    const lip = [];
    for (let i = 0; i < 30; i++) { const x = -40 + i * 2.7 + hash(i, 2803) * 1.4, w = 0.6 + hash(i, 2802) * 0.9; if (Math.abs(x) < 4) continue; lip.push(rot(at(new THREE.Mesh(new THREE.BoxGeometry(w, 0.14, 0.5 + hash(i, 2804) * 0.4)), x, 0.05, EDGE_Z + 0.35), 0, hash(i, 2805) - 0.5, 0)); }
    G.add(merged(lip, mat({ map: rockT, rep: [1, 1] })));
    // ---------------- the canyon: the near wall's strata dropping to the river, the far wall, mesas and buttes ----------------
    const strata = (seed, cols) => tex(16, 64, (x, r) => { let y = 0; while (y < 64) { const h = 2 + Math.floor(r() * 6); px(x, cols[Math.floor(r() * cols.length)], 0, y, 16, h); y += h; } noise(x, r, 16, 64, ['rgba(0,0,0,.12)', 'rgba(255,255,255,.06)'], 90); }, seed);
    const wallT = strata(2806, ['#b0562e', '#c46a3a', '#d88a52', '#9c4426', '#e8b07a', '#c05a30']);
    const near = new THREE.Mesh(new THREE.PlaneGeometry(160, DROP), mat({ map: wallT, rep: [10, 1] })); near.position.set(0, -DROP / 2, EDGE_Z - 0.3); near.rotation.y = PI; G.add(near);
    G.add(flat(160, 60, M(0x8a6a4a), 0, -DROP, EDGE_Z - 30));
    G.add(flat(160, 4, mat({ color: 0x4a8a8a, unlit: 0.35 }), 0, -DROP + 0.3, -30));   // the river
    const farT = strata(2807, ['#9a4a34', '#ac5a3e', '#c0784e', '#8a3e2e', '#c88a62']);
    const far = new THREE.Mesh(new THREE.PlaneGeometry(240, DROP - FAR_Y), mat({ map: farT, rep: [15, 1] })); far.position.set(0, (FAR_Y - DROP) / 2, FAR_Z); G.add(far);
    G.add(flat(240, 70, mat({ map: rockT, rep: [60, 18] }), 0, FAR_Y, FAR_Z - 35));
    // mesas and buttes: flat-topped silhouettes, in two ranks of haze
    [[-112, 26, 0.6, 2808, '#d8946e'], [-168, 40, 0.8, 2809, '#e8bca4']].forEach(([z, hgt, u, seed, col]) => {
      const T = tex(128, 32, (x, r) => {
        x.fillStyle = col; x.beginPath(); x.moveTo(0, 32);
        x.lineTo(0, 29); let cx = 2;
        while (cx < 126) { const w = 5 + r() * 16, top = 8 + r() * 20, gap = 6 + r() * 18; x.lineTo(cx, 29); x.lineTo(cx + 1.5, 32 - top); x.lineTo(cx + w - 1.5, 32 - top); x.lineTo(Math.min(126, cx + w), 29); cx += w + gap; }
        x.lineTo(128, 29); x.lineTo(128, 32); x.fill();
      }, seed);
      G.add(at(new THREE.Mesh(new THREE.PlaneGeometry(Math.abs(z) * 2.6, hgt), mat({ map: T, unlit: u, nofog: 1 })), 0, FAR_Y + hgt / 2 - 1, z));
    });
    // a low range for the lenses that look back over the shelf (+z)
    { const T = tex(128, 32, (x, r) => { x.fillStyle = '#c88a64'; x.beginPath(); x.moveTo(0, 32); for (let i = 0; i <= 32; i++) x.lineTo(i * 4, 30 - (6 + 6 * Math.sin(i * 0.5 + 1) + r() * 3)); x.lineTo(128, 32); x.fill(); }, 2810);
      G.add(rot(at(new THREE.Mesh(new THREE.PlaneGeometry(300, 18), mat({ map: T, unlit: 0.55, nofog: 1 })), 0, 6, 120), 0, PI, 0)); }
    // ---------------- the band's set ----------------
    const kit = drumKit(G, DRUMS[0], DRUMS[1]);
    G.add(at(cyl(0.16, 0.14, 0.12, 8, BLACK), CANYON.KOB[0], 0.06, CANYON.KOB[1]));   // her stool, low: a seated chibi's hips sit at ~0.16-0.2 m
    amp(G, SADI[0] - 0.55, SADI[1] - 0.95, 0.62, 0.48, 0.36, 0.3); amp(G, COMPOTE[0] + 0.55, COMPOTE[1] - 0.95, 0.56, 0.7, 0.4, -0.3);
    const mic = micStand(G, MIC[0], MIC[1] + 0.42);
    const cables = [];
    for (const [x0, z0, x1, z1] of [[MIC[0], MIC[1] + 0.3, SADI[0] - 0.3, SADI[1] - 0.9], [COMPOTE[0], COMPOTE[1], COMPOTE[0] + 0.5, COMPOTE[1] - 0.8], [SADI[0], SADI[1], SADI[0] - 0.5, SADI[1] - 0.8]]) {
      const L = Math.hypot(x1 - x0, z1 - z0), c = at(new THREE.Mesh(new THREE.BoxGeometry(0.025, 0.012, L)), (x0 + x1) / 2, 0.01, (z0 + z1) / 2); c.rotation.y = Math.atan2(x1 - x0, z1 - z0); cables.push(c);
    }
    G.add(merged(cables, BLACK));
    // ---------------- scrub, grass, boulders ----------------
    const sageM = M(0x8a9a72, { unlit: 0.22 }), sage2 = M(0x6e8058, { unlit: 0.22 }), twigM = M(0x6a5038), deco = [];
    const sagebush = (x, z, s, seed) => {
      const g = new THREE.Group(); g.position.set(x, 0, z);
      for (let i = 0; i < 9; i++) { const a = hash(i, seed) * TAU, r = hash(i, seed + 1) * 0.45 * s; g.add(at(ico((0.22 + hash(i, seed + 2) * 0.16) * s, 0, i % 3 ? sageM : sage2), Math.cos(a) * r, (0.25 + hash(i, seed + 3) * 0.35) * s, Math.sin(a) * r)); }
      g.add(at(cyl(0.03 * s, 0.05 * s, 0.25 * s, 4, twigM), 0, 0.12 * s, 0)); G.add(g); return g;
    };
    const bigM = [M(0xa4b08c, { unlit: 0.28 }), M(0x8e9c78, { unlit: 0.28 })], big = new THREE.Group(); big.position.set(BUSH[0], 0, BUSH[1]); G.add(big);
    for (let i = 0; i < 16; i++) { const a = hash(i, 2870) * TAU, r = Math.sqrt(hash(i, 2871)) * 0.5, y = 0.32 + hash(i, 2872) * 0.42; big.add(at(ico(0.3 + hash(i, 2873) * 0.12, 1, bigM[i % 2]), Math.cos(a) * r, y * (1 - r * 0.6), Math.sin(a) * r)); }   // a round mound, 1 m high
    const bushLeaves = []; for (let i = 0; i < 14; i++) { const q = at(box(0.06, 0.03, 0.06, sageM), 0, -9, 0); q.visible = false; G.add(q); bushLeaves.push(q); }
    for (let i = 0; i < 26; i++) {
      const x = (hash(i, 2812) - 0.5) * 30, z = EDGE_Z + 1.5 + hash(i, 2813) * 22;
      if (Math.abs(x) < 3.2 && z < 2.5) continue;   // the stage
      deco.push([sagebush(x, z, 0.6 + hash(i, 2814) * 0.8, 2815 + i * 7), x, z]);
    }
    const grassM = M(0xd8b870);
    for (let i = 0; i < 60; i++) {
      const x = (hash(i, 2820) - 0.5) * 34, z = EDGE_Z + 0.8 + hash(i, 2821) * 26;
      if (Math.abs(x) < 2.6 && z < 1.2) continue;
      const g = new THREE.Group(); g.position.set(x, 0, z); for (let b = 0; b < 4; b++) g.add(rot(at(box(0.025, 0.32, 0.025, grassM), (b - 1.5) * 0.04, 0.15, 0), 0, 0, (b - 1.5) * 0.3)); G.add(g); deco.push([g, x, z]);
    }
    const boulderM = mat({ map: rockT, rep: [1, 1], unlit: 0.18 });
    [[-4.6, -2.6, 0.8], [4.4, -2.9, 1.1], [5.6, 1.2, 0.7], [-6.2, 2.8, 1.0], [3.4, 4.8, 0.6], [-1.8, 7.5, 0.9]].forEach(([x, z, s], i) => {
      const b = rot(at(ico(s, 0, boulderM), x, s * 0.4, z), hash(i, 2830), hash(i, 2831) * 3, 0); b.scale.set(1.3, 0.6, 1.1);   // faceted and flat: round ones read as giant balls G.add(b); deco.push([b, x, z]);
    });
    // ---------------- the white van, parked back from the edge ----------------
    const van = new THREE.Group(); van.position.set(VAN[0], 0, VAN[1]); van.rotation.y = 0.5; G.add(van);
    { const white = M(0xeeeeea), glass = M(0x3a4654, { unlit: 0.2 }), tyre = M(0x18181a);
      van.add(at(box(4.6, 1.8, 1.9, white), 0, 1.25, 0)); van.add(at(box(1.3, 1.1, 1.85, white), 2.4, 0.9, 0));
      van.add(at(box(0.05, 0.6, 1.6, glass), 3.06, 1.35, 0)); for (const sd of [-1, 1]) for (const x of [-1.4, 0, 1.4]) van.add(at(box(0.9, 0.5, 0.04, glass), x, 1.6, sd * 0.96));
      for (const x of [-1.6, 2.0]) for (const sd of [-1, 1]) van.add(at(rot(cyl(0.38, 0.38, 0.3, 10, tyre), PI / 2, 0, 0), x, 0.38, sd * 0.85)); }
    // ---------------- a hawk circling, a tumbleweed ----------------
    const hawkM = M(0x4a3a2a), hawk = new THREE.Group(); G.add(hawk);
    hawk.add(box(0.5, 0.12, 0.18, hawkM)); const wings = [-1, 1].map(sd => { const w = at(new THREE.Group(), 0, 0, sd * 0.08); w.add(at(box(0.32, 0.03, 0.9, hawkM), 0, 0, sd * 0.45)); hawk.add(w); return [w, sd]; });
    const tumble = new THREE.Group(); G.add(tumble);
    { const tw = M(0xb89a6a); for (let i = 0; i < 10; i++) { const a = hash(i, 2840) * TAU, e = hash(i, 2841) * PI; tumble.add(rot(box(0.6, 0.02, 0.02, tw), a, e, a * 0.7)); } }
    // ---------------- the sun, the dusk dome ----------------
    const sun = at(new THREE.Mesh(new THREE.CircleGeometry(8, 14), mat({ color: 0xfff0b8, unlit: 1, nofog: 1 })), 46, 34, -182); sun.lookAt(0, 0, 0); G.add(sun);   // low over the far rim, beside the band in the frontal lenses
    const duskT = tex(4, 64, x => { const gr = x.createLinearGradient(0, 0, 0, 64); gr.addColorStop(0, '#2a2a5e'); gr.addColorStop(0.28, '#6a4a8a'); gr.addColorStop(0.44, '#e2687a'); gr.addColorStop(0.5, '#ff9a52'); gr.addColorStop(1, '#ff9a52'); x.fillStyle = gr; x.fillRect(0, 0, 4, 64); });
    const duskSky = new THREE.Mesh(new THREE.SphereGeometry(188, 16, 12), mat({ map: duskT, unlit: 1, nofog: 1, side: THREE.BackSide })); duskSky.visible = false; G.add(duskSky);
    const duskSun = at(new THREE.Mesh(new THREE.CircleGeometry(10, 16), mat({ color: 0xffb45a, unlit: 1, nofog: 1 })), -30, 33, -180);   // over the far mesas (their tops reach 29 m: at 9 m it set behind them) duskSun.lookAt(0, 0, 0); duskSun.visible = false; G.add(duskSun);
    // ---------------- hearts, dust ----------------
    const heartM = M(0xff4f9a, { unlit: 0.8 }), hearts = [];
    for (let i = 0; i < 12; i++) { const h = new THREE.Group(); h.add(at(ico(0.1, 0, heartM), -0.075, 0, 0)); h.add(at(ico(0.1, 0, heartM), 0.075, 0, 0)); h.add(rot(at(cone(0.125, 0.18, 4, heartM), 0, -0.11, 0), PI, 0, 0)); h.visible = false; G.add(h); hearts.push(h); }
    const dustM = mat({ color: 0xe8b890, unlit: 0.45, see: 0.35 }), dust = [];
    for (let i = 0; i < 24; i++) { const p = new THREE.Mesh(new THREE.IcosahedronGeometry(1, 0), dustM); p.visible = false; G.add(p); dust.push(p); }

    return {
      group: G, sky: grad([[0, '#5e86c2'], [0.42, '#c0b8c8'], [0.62, '#f4c890'], [1, '#ffa860']]), shadowCol: 0x7a4a30,
      light() { lights(0xb0907c, 0xffdcaa, [-0.55, -0.6, -0.6], 0xf2cca4, [26, 175], 8); },
      anim(t, P = {}) {
        const s = shotT(t, P), bb = beat(t), dusk = P.zone === 'dusk';
        if (dusk) lights(0x7a6070, 0xffae70, [-0.6, -0.42, -0.65], 0xd8907e, [24, 170], 8);
        sun.visible = !dusk; duskSky.visible = dusk; duskSun.visible = dusk;
        if (P.key) pt(3, P.key[0], P.key[1], P.key[2], P.key[3], P.key[4], P.key[5]);
        swingCymbals(kit, bb);
        mic.visible = !P.noMic; van.visible = !P.noVan;
        deco.forEach(([o, x, z]) => { o.visible = !cleared(P, x, z); });
        big.visible = !P.noBush;
        // the big bush rustles: shaking fast, leaves flying off it
        const R = P.rustle, on = !!R && s >= R[0] && s <= R[1];
        big.rotation.set(on ? 0.12 * Math.sin(s * 31) : 0, 0, on ? 0.1 * Math.sin(s * 37 + 1) : 0);
        bushLeaves.forEach((q, i) => {
          q.visible = false; if (!R || s < R[0]) return;
          const e = s - R[0] - hash(i, 2850) * Math.max(0.1, R[1] - R[0]); if (e < 0 || e > 0.9) return;
          const a = hash(i, 2851) * TAU, v = 1.2 + hash(i, 2852);
          q.visible = true; q.position.set(BUSH[0] + Math.cos(a) * v * e, 0.9 + 2.2 * e - 3.4 * e * e, BUSH[1] + Math.sin(a) * v * e); q.rotation.set(e * 9 + i, e * 7, 0);
        });
        // the hawk circles high over the canyon
        hawk.visible = !!P.hawk; const ha = t * 0.25; hawk.position.set(Math.cos(ha) * 14, 16 + Math.sin(t * 0.4) * 1.5, -22 + Math.sin(ha) * 8); hawk.rotation.set(0, -ha, 0.35);
        wings.forEach(([w, sd]) => { w.rotation.x = sd * 0.25 * Math.sin(t * 2.2); });
        // a tumbleweed rolls across the shelf every 9 s
        const tu = (t / 9) % 1; tumble.visible = P.tumble !== false && tu < 0.55;
        tumble.position.set(-14 + tu * 50, 0.3 + Math.abs(Math.sin(t * 6)) * 0.25, 5.5); tumble.rotation.set(0, 0, -t * 5);
        hearts.forEach((h, i) => {
          const q = (P.hearts || [])[Math.floor(i / 3)]; h.visible = false; if (!q) return;
          const e = s - q[3] - (i % 3) * 0.18; if (e < 0 || e > 1.4) return;
          h.visible = true; h.position.set(q[0] + ((i % 3) - 1) * 0.22 + 0.06 * Math.sin(e * 6 + i), q[1] + 0.55 * e, q[2]); h.scale.setScalar(Math.min(1, e * 5) * (1.15 - 0.25 * (e / 1.4)));
        });
        const D = P.dust || [];
        dust.forEach((p, i) => {
          p.visible = false; if (!D.length) return;
          const q = D[i % D.length], e = s - q[2]; if (e < 0 || e > 0.9) return;
          const a = hash(i, 2860) * TAU, rr = (0.25 + e * 1.3) * (q[3] || 1) * (0.6 + hash(i, 2861) * 0.5);
          p.visible = true; p.position.set(q[0] + Math.cos(a) * rr, 0.08 + e * 0.3 + hash(i, 2862) * 0.12, q[1] + Math.sin(a) * rr * 0.7); p.scale.setScalar((0.12 + e * 0.24) * (1 - e / 0.9) * (q[3] || 1));
        });
      },
    };
  }
  return { canyon: canyon() };
}
