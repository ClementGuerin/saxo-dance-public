// maps20.js: the "Self Aware" maps (2026-09-30, Temper City; the clip: a three-piece band in black and white, playing on
// the shoulder of a mountain road with ranges fading behind them, inside the long aluminium box of a truck's trailer
// under strip lights, in the desert with camels on a ridge, a dump truck thundering past; colour comes in at the end).
// Same contract as the other map files, pure in t:
//   desert  a roadside lay-by high in the hills: the band's set on the gravel (Compote's drum kit at DRUMS facing +z, the
//           mic stand at MIC, Kob's bass amp at KOB, a guitar amp, a photographer's softbox), the two-lane road beyond
//           (ROAD.z0-z1, edge lines, a dashed centre line, white reflector posts), a parked semi-trailer on the far
//           shoulder, a ridge with camels behind the band, three ranges of mountains fading into the haze.
//           THE MIRROR (MIRROR): the diva's dressing-room mirror, bulbs all round its frame, standing on the lay-by facing
//           -z (the mic). It is a portal: the glass is a hole into a closed case MIRROR.depth deep whose inside is
//           painted like the world behind the viewer; the reflection is a crowd of one standing in it at the mirrored
//           spot (z_glass + (z_glass - z_actor)), facing out. `smash` (s into the shot): the glass bursts into shards
//           (flying out towards -z, falling, lying on the gravel), a black backing hides the case's inside from then;
//           `broken` (true): already smashed. `mirror` (false) hides it; `noGlass` hides the sheen (a lens inside the case, the mirror's point of view).
//           Flags: `hearts` ([[x, y, z, s0?], ...]: pink hearts pop over those points and float up, every 1.2 s from
//           s0), `truck` ([s, speed]: a dump truck passes on the near lane, level with x = 0 at s into the shot),
//           `camels` (false hides them), `amp` (false hides the amp Sadi sits on at AMP), `handmirror` (true: the pink
//           hand mirror lies on that amp), `noMic`.
//   trailer the inside of the parked semi-trailer: ribbed aluminium walls, a plywood floor, strip lights along the
//           ceiling, the rear doors open on the road at z = 0 (the desert beyond: a backdrop); the band at the front
//           end (drums at T_DRUMS facing +z, Saxo's mark T_MIC, Kob's T_KOB), a vanity mirror with bulbs on the left
//           wall (T_MIRROR, facing +x: a portal like the big one, T_MIRROR.depth deep through the wall), the amp Sadi
//           sits on (T_AMP, top T_AMP_Y) with the hand mirror on it (`handmirror`). Flags `flicker`, `hearts`,
//           `smash`/`broken` (the vanity), `noMic`, `amp`.
import { mapKit } from './mapkit.js';

export const DESERT = {
  MIC: [-1.2, 0.3], KOB: [1.35, -0.25], DRUMS: [0.1, -1.25], AMP: [-3.1, 1.2], AMP_Y: 0.45,
  MIRROR: { x: -1.2, z: 2.3, w: 1.1, h: 1.75, y0: 0.22, depth: 2.6 },
  ROAD: { z0: 5.4, z1: 12.4 }, RIDGE_Z: -19, TRUCK_Z: 7.2,
};
export const TRAILER = {
  W: 3.4, L: 9.0, H: 2.8, T_MIC: [-0.35, -4.4], T_KOB: [1.0, -5.2], T_DRUMS: [0.05, -6.9], T_AMP: [1.05, -1.9], T_AMP_Y: 0.45,
  T_MIRROR: { x: -1.7, z: -3.4, w: 0.85, h: 1.05, y0: 0.55, depth: 1.6 },
};

export function buildSelfAwareMaps(K) {
  const k = mapKit(K);
  const { THREE, mat, tex, px, noise, box, TAU, PI, hash, beat, grad, cyl, cone, ico, at, rot, merged, flat, lights, pt, fr, room } = k;
  const M = (c, o = {}) => mat({ color: c, ...o }), glow = c => mat({ color: c, unlit: 1 });
  const shotT = (t, P) => P.t0 != null ? t - P.t0 : 0;
  const METAL = M(0xb8bcc4), CHROME = M(0xdfe2e8, { unlit: 0.2 }), BLACK = M(0x18181c);
  const PINK = () => mat({ color: 0xffb4dc, unlit: 0.6 });

  // ---------------- shared set pieces ----------------
  // the drum kit, built facing local +x (like the studio's) and turned to face +z: a seated chibi's paws at ~0.33 m
  function drumKit(G, x, z) {
    const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = -PI / 2; G.add(g);
    const shell = M(0xe8e4dc), skin = M(0xf4f2ea), cymM = mat({ color: 0xd8b060, unlit: 0.15 });
    g.add(at(rot(cyl(0.2, 0.2, 0.3, 10, shell), 0, 0, PI / 2), 0.62, 0.2, 0));
    g.add(at(rot(cyl(0.19, 0.19, 0.012, 10, M(0x1a1a1e)), 0, 0, PI / 2), 0.78, 0.2, 0));
    const drum = (r, h, dx, y, dz, tilt = 0) => { const d = at(new THREE.Group(), dx, y, dz); d.rotation.z = tilt; d.add(cyl(r, r, h, 10, shell)); d.add(at(cyl(r * 0.96, r * 0.96, 0.008, 10, skin), 0, h / 2 + 0.004, 0)); d.add(at(cyl(r + 0.008, r + 0.008, 0.012, 10, CHROME), 0, h / 2, 0)); g.add(d); return d; };
    drum(0.12, 0.08, 0.28, 0.3, -0.18, 0.12); drum(0.09, 0.08, 0.5, 0.5, -0.34, 0.35); drum(0.09, 0.08, 0.5, 0.5, 0.34, 0.35); drum(0.13, 0.2, 0.3, 0.2, 0.3, 0.05);
    const cymbals = [];
    const cymbal = (r, dx, y, dz, rx, rz) => { g.add(at(cyl(0.008, 0.008, y, 4, METAL), dx, y / 2, dz)); const c = at(cyl(r, r * 0.2, 0.012, 12, cymM), dx, y, dz); c.rotation.set(rx, 0, rz); g.add(c); cymbals.push({ c, rx, rz }); };
    cymbal(0.12, 0.3, 0.44, -0.38, 0, 0); cymbal(0.17, 0.5, 0.78, -0.36, -0.25, 0.25); cymbal(0.19, 0.46, 0.72, 0.42, 0.28, 0.22);
    g.add(at(cyl(0.14, 0.12, 0.05, 8, BLACK), -0.05, 0.1, 0)); g.add(at(cyl(0.02, 0.02, 0.1, 4, METAL), -0.05, 0.05, 0));
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
  function handMirror(G, x, y, z, yaw) {   // the pink hand mirror, lying face up on an amp
    const g = new THREE.Group(); g.position.set(x, y, z); g.rotation.y = yaw; G.add(g);
    g.add(at(cyl(0.085, 0.085, 0.02, 10, PINK()), 0, 0.01, 0)); g.add(at(cyl(0.07, 0.07, 0.004, 10, mat({ color: 0xe8f4ff, unlit: 0.9 })), 0, 0.022, 0));
    g.add(at(box(0.04, 0.02, 0.16, PINK()), 0, 0.01, 0.15));
    return g;
  }
  // pink hearts popping over points and floating up (a pool): the list is [[x, y, z, s0], ...], s into the shot
  function heartPool(G, n) {
    const hm = mat({ color: 0xff5f9a, unlit: 0.85 }), pool = [];
    for (let i = 0; i < n; i++) {
      const h = new THREE.Group(); h.visible = false; G.add(h);
      h.add(at(ico(0.07, 0, hm), -0.055, 0, 0)); h.add(at(ico(0.07, 0, hm), 0.055, 0, 0));
      const tip = at(cone(0.09, 0.13, 4, hm), 0, -0.08, 0); tip.rotation.x = PI; h.add(tip);
      pool.push(h);
    }
    return (list, c, t) => {
      pool.forEach(h => { h.visible = false; });
      if (!list) return;
      let j = 0;
      list.forEach(([x, y, z, s0 = 0], q) => {
        for (let r = 0; r < 3 && j < pool.length; r++) {
          const age = c - s0 - r * 0.4; if (age < 0) continue;
          const u = fr(age / 1.2), h = pool[j++], s = 1.15 * Math.min(1, u * 6) * (1 - 0.35 * u);
          h.visible = true; h.scale.setScalar(s);
          h.position.set(x + (r - 1) * 0.22 + 0.06 * Math.sin(t * 3 + r + q), y + 0.1 + u * 0.55, z);
          h.rotation.set(0, 0, 0.3 * Math.sin(t * 2.4 + r * 2));
        }
      });
    };
  }
  // the reversed view painted inside a mirror: the road, the lay-by and hills under a pale sky
  const insideTex = (seed, skyTop = '#9ec4e8', skyLow = '#e8eef2') => tex(64, 48, (x, r) => {
    const g = x.createLinearGradient(0, 0, 0, 48); g.addColorStop(0, skyTop); g.addColorStop(1, skyLow); x.fillStyle = g; x.fillRect(0, 0, 64, 48);
    x.fillStyle = '#8aa0b4'; x.beginPath(); x.moveTo(0, 30); for (let i = 0; i <= 8; i++) x.lineTo(i * 8, 22 + Math.sin(i * 1.7) * 4); x.lineTo(64, 34); x.lineTo(0, 34); x.fill();
    x.fillStyle = '#a89a78'; x.fillRect(0, 32, 64, 16);
  }, seed);
  // the dressing-room mirror as a portal: a case with a framed hole, bulbs round it, the case's inside painted like the
  // world behind the viewer; the glass (a faint dithered sheen), the black backing and the shards for the smash.
  // Local frame: the glass plane at z = 0, the case going +z behind it; `face.yaw` turns it (0: the glass faces -z).
  function mirrorPortal(G, spec, face, insideT, floorT, seed) {
    const { w, h, y0, depth } = spec, fw = 0.12, W = w + 2 * fw, Hh = h + y0 + fw;
    const root = new THREE.Group(); G.add(root);
    root.position.set(face.x, 0, face.z); root.rotation.y = face.yaw;
    const caseM = M(0x1c1c22), frameM = mat({ color: 0xf2e8d4, unlit: 0.35 });
    root.add(at(box(W, 0.04, depth, caseM), 0, Hh + 0.02, depth / 2)); root.add(at(box(W, Hh, 0.04, caseM), 0, Hh / 2, depth + 0.02));
    for (const s of [-1, 1]) root.add(at(box(0.04, Hh, depth, caseM), s * (W / 2 + 0.02), Hh / 2, depth / 2));
    for (const [yy, hh] of [[y0 / 2, y0], [y0 + h + fw / 2, fw]]) root.add(at(box(W, hh, 0.06, frameM), 0, yy, -0.03));
    for (const s of [-1, 1]) root.add(at(box(fw, h, 0.06, frameM), s * (w / 2 + fw / 2), y0 + h / 2, -0.03));
    if (y0 < 0.3) for (const s of [-1, 1]) for (const zz of [0.2, depth - 0.2]) root.add(at(box(0.08, 0.08, 0.08, CHROME), s * (W / 2 + 0.02), 0.04, zz));   // castors
    const bulbM = glow(0xfff2c8), bulbs = [];
    for (let i = 0; i < 5; i++) bulbs.push(at(ico(0.04, 0, bulbM), -w / 2 + (i + 0.5) * w / 5, y0 + h + fw / 2, -0.07));
    for (const s of [-1, 1]) for (let i = 0; i < 6; i++) bulbs.push(at(ico(0.04, 0, bulbM), s * (w / 2 + fw / 2), y0 + 0.12 + i * (h - 0.1) / 5, -0.07));
    bulbs.forEach(b => root.add(b));
    const inside = new THREE.Group(); root.add(inside);
    const back = new THREE.Mesh(new THREE.PlaneGeometry(W, Hh + 0.6), mat({ map: insideT, unlit: 0.35 })); back.rotation.y = PI; back.position.set(0, (Hh + 0.6) / 2 - 0.3, depth - 0.02); inside.add(back);
    const skyIn = M(0xd4dde4, { unlit: 0.3 });
    for (const s of [-1, 1]) { const sw = new THREE.Mesh(new THREE.PlaneGeometry(depth, Hh + 0.6), skyIn); sw.rotation.y = s * PI / 2; sw.position.set(-s * (W / 2 - 0.01), (Hh + 0.6) / 2 - 0.3, depth / 2); inside.add(sw); }
    const top = new THREE.Mesh(new THREE.PlaneGeometry(W, depth), skyIn); top.rotation.x = PI / 2; top.position.set(0, Hh - 0.01, depth / 2); inside.add(top);
    const flo = new THREE.Mesh(new THREE.PlaneGeometry(W, depth), mat({ map: floorT, rep: [W / 1.2, depth / 1.2] })); flo.rotation.x = -PI / 2; flo.position.set(0, 0.004, depth / 2); inside.add(flo);
    const glass = new THREE.Group(); root.add(glass);
    glass.add(at(new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat({ color: 0xe8f2ff, unlit: 0.6, see: 0.86, side: THREE.DoubleSide })), 0, y0 + h / 2, -0.005));
    for (const [gx, gl] of [[-0.18, 0.5], [0.05, 0.28]]) { const s = at(box(0.035, gl, 0.004, mat({ color: 0xffffff, unlit: 1, see: 0.35 })), gx, y0 + h * 0.66, -0.01); s.rotation.z = -0.6; glass.add(s); }
    const backing = at(box(w + 0.02, h + 0.02, 0.02, M(0x0c0c10)), 0, y0 + h / 2, 0.04); root.add(backing);
    const jagM = mat({ color: 0xe8f2ff, unlit: 0.7 }), jags = new THREE.Group(); root.add(jags);
    for (let i = 0; i < 8; i++) {
      const c = i % 4, sx = c % 2 ? 1 : -1, up = c > 1;
      const tr = at(cone(0.09 + hash(i, seed) * 0.08, 0.2 + hash(i, seed + 1) * 0.2, 3, jagM), sx * (w / 2 - 0.08) + (i > 3 ? -sx * 0.18 : 0), y0 + (up ? h - 0.1 : 0.1), -0.01);
      tr.rotation.set(0, 0, (up ? PI : 0) + (hash(i, seed + 2) - 0.5)); tr.scale.z = 0.12; jags.add(tr);
    }
    const shardM = mat({ color: 0xeef6ff, unlit: 0.75, side: THREE.DoubleSide }), shards = [];
    for (let i = 0; i < 34; i++) {
      const geo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0, 0), new THREE.Vector3(0.09 + hash(i, seed + 3) * 0.12, 0.02, 0), new THREE.Vector3(0.03, 0.11 + hash(i, seed + 4) * 0.12, 0)]);
      geo.computeVertexNormals(); const s = new THREE.Mesh(geo, shardM); s.visible = false; root.add(s); shards.push(s);
    }
    function set(P, c) {
      root.visible = P.mirror !== false;
      const sm = P.smash != null ? c - P.smash : -1, broken = !!P.broken || sm >= 0;
      glass.visible = !broken && !P.noGlass; backing.visible = broken; jags.visible = broken; inside.visible = !broken;
      bulbs.forEach((b, i) => { b.scale.setScalar(sm >= 0 && sm < 0.6 && hash(i, Math.floor(sm * 20)) < 0.5 ? 0.4 : 1); });
      shards.forEach((s, i) => {
        const on = broken && root.visible; s.visible = on; if (!on) return;
        const a = P.broken ? 3 : sm, x0 = (hash(i, seed + 5) - 0.5) * w, y1 = y0 + hash(i, seed + 6) * h;
        const vx = x0 * 1.6 + (hash(i, seed + 7) - 0.5) * 1.2, vz = -(1.2 + hash(i, seed + 8) * 2.2), vy = 1.0 + hash(i, seed + 9) * 1.6;
        const tl = (vy + Math.sqrt(vy * vy + 2 * 9.8 * y1)) / 9.8, tt = Math.min(a, tl);
        s.position.set(x0 + vx * tt, Math.max(0.01, y1 + vy * tt - 4.9 * tt * tt), -0.05 + vz * tt);
        if (a < tl) s.rotation.set(a * (5 + i % 4), a * 3, a * 4); else s.rotation.set(-PI / 2, 0, hash(i, seed + 10) * TAU);
      });
    }
    return { root, set };
  }

  // ===================================================================================================================
  function desert() {
    const G = new THREE.Group(), { MIC, KOB, DRUMS, AMP, AMP_Y, MIRROR, ROAD, RIDGE_Z, TRUCK_Z } = DESERT;
    // ---------------- the ground: the lay-by's packed gravel, the road ----------------
    const gravelT = tex(32, 32, (x, r) => { px(x, '#a49a86', 0, 0, 32, 32); noise(x, r, 32, 32, ['#968c78', '#b0a692', '#8a806c', '#b8ae9a'], 300); }, 2001);
    G.add(flat(120, 90, mat({ map: gravelT, rep: [80, 60] }), 0, 0, 0));
    const roadT = tex(32, 32, (x, r) => { px(x, '#4a4c52', 0, 0, 32, 32); noise(x, r, 32, 32, ['#44464c', '#54565c', '#3e4046'], 220); }, 2002);
    const road = flat(160, ROAD.z1 - ROAD.z0, mat({ map: roadT, rep: [106, (ROAD.z1 - ROAD.z0) / 1.5] }), 0, 0.008, (ROAD.z0 + ROAD.z1) / 2);
    road.material.polygonOffset = true; road.material.polygonOffsetFactor = -1; G.add(road);
    const lines = [];
    for (const zz of [ROAD.z0 + 0.25, ROAD.z1 - 0.25]) lines.push(at(new THREE.Mesh(new THREE.BoxGeometry(160, 0.01, 0.12)), 0, 0.012, zz));
    for (let x = -78; x < 78; x += 5) lines.push(at(new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.01, 0.12)), x, 0.012, (ROAD.z0 + ROAD.z1) / 2));
    G.add(merged(lines, M(0xf2f0e8, { unlit: 0.4 })));
    // white reflector posts along both edges (a black band near the top), the clip's tall pole by the lay-by
    const posts = [], bands = [];
    for (let x = -60; x <= 60; x += 7) for (const zz of [ROAD.z0 - 0.5, ROAD.z1 + 0.5]) {
      if (zz < ROAD.z0 && x > -5 && x < 3) continue;
      posts.push(at(new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.9, 0.1)), x, 0.45, zz)); bands.push(at(new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.14, 0.11)), x, 0.72, zz));
    }
    G.add(merged(posts, M(0xf4f4f0, { unlit: 0.3 }))); G.add(merged(bands, M(0x1a1a1a)));
    G.add(at(cyl(0.08, 0.1, 7.5, 6, M(0x3a3a40)), 5.6, 3.75, ROAD.z0 - 0.8)); G.add(at(box(0.5, 0.35, 0.05, M(0xe8e8e0)), 5.6, 6.9, ROAD.z0 - 0.8));
    // ---------------- the band's set on the lay-by ----------------
    const kit = drumKit(G, ...DRUMS);
    amp(G, MIC[0] - 0.55, MIC[1] - 1.05, 0.66, 0.5, 0.38, 0.25); amp(G, KOB[0] + 0.5, KOB[1] - 0.95, 0.56, 0.72, 0.4, -0.3);
    const sadiAmp = amp(G, AMP[0], AMP[1], 0.7, AMP_Y, 0.42, 0.6);
    const mic = micStand(G, MIC[0], MIC[1] + 0.42);
    const cables = [];
    for (const [x0, z0, x1, z1] of [[MIC[0], MIC[1] + 0.3, MIC[0] - 0.5, MIC[1] - 0.9], [KOB[0], KOB[1], KOB[0] + 0.5, KOB[1] - 0.8], [-0.4, -0.6, -2.4, -2.2]]) {
      const L = Math.hypot(x1 - x0, z1 - z0), c = at(new THREE.Mesh(new THREE.BoxGeometry(0.025, 0.012, L)), (x0 + x1) / 2, 0.01, (z0 + z1) / 2); c.rotation.y = Math.atan2(x1 - x0, z1 - z0); cables.push(c);
    }
    G.add(merged(cables, BLACK));
    // the photographer's softbox from the clip, stage right, on a tripod
    { const sx = 3.4, sz = -0.6;
      for (let i = 0; i < 3; i++) { const a = i / 3 * TAU, l = at(box(0.025, 1.7, 0.025, METAL), sx + Math.sin(a) * 0.25, 0.8, sz + Math.cos(a) * 0.25); l.rotation.set(Math.cos(a) * 0.3, 0, -Math.sin(a) * 0.3); G.add(l); }
      G.add(at(cyl(0.02, 0.02, 0.6, 4, METAL), sx, 1.9, sz));
      const sb = new THREE.Group(); sb.position.set(sx - 0.1, 2.25, sz + 0.1); sb.rotation.y = -0.5; G.add(sb);
      sb.add(rot(at(cone(0.6, 0.55, 8, M(0x1c1c20)), 0, 0, 0), -PI / 2, 0, 0)); sb.add(at(new THREE.Mesh(new THREE.CircleGeometry(0.58, 8), glow(0xf8f6f0)), 0, 0, 0.28)); }
    const hmirror = handMirror(G, AMP[0] + 0.12, AMP_Y + 0.012, AMP[1] + 0.05, 0.8);
    // ---------------- the mirror ----------------
    const mir = mirrorPortal(G, MIRROR, { x: MIRROR.x, z: MIRROR.z, yaw: 0 }, insideTex(2003), gravelT, 2004);
    // ---------------- the parked semi on the far shoulder, the dump truck that passes ----------------
    const semi = new THREE.Group(); semi.position.set(8.5, 0, ROAD.z1 + 2.4); G.add(semi);
    const alu = tex(32, 16, (x, r) => { px(x, '#d8dce0', 0, 0, 32, 16); for (let i = 0; i < 32; i += 3) px(x, '#b8bcc2', i, 0, 1, 16); noise(x, r, 32, 16, ['rgba(0,0,0,.05)'], 40); }, 2005);
    semi.add(at(box(12, 2.8, 2.6, mat({ map: alu, rep: [8, 1] })), 0, 2.6, 0)); semi.add(at(box(12, 0.25, 2.5, M(0x2a2a2e)), 0, 1.1, 0));
    const tyreM = M(0x18181a);
    for (const x of [-4.6, -3.4, 4.6]) for (const s of [-1, 1]) semi.add(at(rot(cyl(0.5, 0.5, 0.36, 10, tyreM), PI / 2, 0, 0), x, 0.5, s * 1.05));
    const cab = new THREE.Group(); cab.position.set(7.4, 0, 0); semi.add(cab);
    cab.add(at(box(2.4, 2.4, 2.5, M(0xc8c4bc)), 0, 1.9, 0)); cab.add(at(box(0.05, 1.0, 2.2, M(0x2a3440, { unlit: 0.2 })), 1.21, 2.5, 0)); cab.add(at(box(1.0, 1.2, 2.5, M(0xc8c4bc)), 1.6, 1.3, 0));
    for (const s of [-1, 1]) cab.add(at(rot(cyl(0.5, 0.5, 0.36, 10, tyreM), PI / 2, 0, 0), 0.6, 0.5, s * 1.05));
    const dump = new THREE.Group(); dump.visible = false; G.add(dump);
    dump.add(at(box(2.2, 2.3, 2.5, M(0xe8e4dc)), 3.0, 1.9, 0)); dump.add(at(box(0.05, 0.9, 2.2, M(0x2a3440, { unlit: 0.2 })), 4.11, 2.4, 0));
    dump.add(at(box(5.2, 1.6, 2.6, M(0x8a8680)), -1.0, 2.1, 0)); dump.add(at(box(5.0, 0.3, 2.4, M(0x6a6a70)), -1.0, 1.15, 0));
    dump.add(at(box(5.0, 0.5, 2.2, M(0xa89878)), -1.0, 3.0, 0));
    for (const x of [3.2, -0.8, -2.2]) for (const s of [-1, 1]) dump.add(at(rot(cyl(0.55, 0.55, 0.4, 10, tyreM), PI / 2, 0, 0), x, 0.55, s * 1.1));
    // ---------------- the ridge with camels, the ranges beyond ----------------
    const ridgeY = x => 2.6 + 1.1 * Math.sin(x * 0.07) + 0.6 * Math.sin(x * 0.19 + 1);
    const ridgeGeo = new THREE.PlaneGeometry(140, 14, 28, 4);
    { const p = ridgeGeo.attributes.position; for (let i = 0; i < p.count; i++) p.setZ(i, (p.getY(i) + 7) / 14 * ridgeY(p.getX(i))); }
    const ridge = new THREE.Mesh(ridgeGeo, mat({ map: gravelT, rep: [60, 6] })); ridge.rotation.x = -PI / 2; ridge.position.set(0, 0, RIDGE_Z); G.add(ridge);
    const camelM = M(0x9a7a52), camels = [];
    for (let i = 0; i < 6; i++) {
      const c = new THREE.Group(); G.add(c);
      c.add(at(box(1.3, 0.55, 0.45, camelM), 0, 1.5, 0)); c.add(at(box(0.4, 0.35, 0.4, camelM), 0.1, 1.9, 0)); c.add(rot(at(box(0.18, 0.7, 0.2, camelM), 0.75, 1.9, 0), 0, 0, -0.5)); c.add(at(box(0.4, 0.2, 0.2, camelM), 1.0, 2.25, 0));
      const legs = []; for (const lx of [-0.45, 0.45]) for (const lz of [-0.15, 0.15]) { const l = at(box(0.1, 1.2, 0.1, camelM), lx, 0.6, lz); c.add(l); legs.push(l); }
      c.scale.setScalar(0.7); camels.push({ c, legs, i });
    }
    [[-45, 16, '#8a9aa8', 2006, 0.5], [-90, 30, '#a4b2c0', 2007, 0.62], [-150, 46, '#c0cad4', 2008, 0.75]].forEach(([z, hgt, col, seed, u]) => {
      const T = tex(128, 32, (x, r) => { x.fillStyle = col; x.beginPath(); x.moveTo(0, 32); for (let i = 0; i <= 32; i++) x.lineTo(i * 4, 30 - (14 + 10 * Math.sin(i * 0.37 + seed) + 6 * Math.sin(i * 1.1 + seed * 0.3) + r() * 2)); x.lineTo(128, 32); x.fill(); }, seed);
      const m = mat({ map: T, unlit: u, nofog: 1 });
      G.add(at(new THREE.Mesh(new THREE.PlaneGeometry(Math.abs(z) * 3.2, hgt), m), 0, hgt / 2 - 3, z));
      const rev = at(new THREE.Mesh(new THREE.PlaneGeometry(Math.abs(z) * 3.2, hgt * 0.7), m), 0, hgt * 0.35 - 3, -z * 0.8 + 10); rev.rotation.y = PI; G.add(rev);
    });
    const clouds = [];
    for (let i = 0; i < 9; i++) { const c = at(box(10 + hash(i, 2009) * 14, 0.8, 5 + hash(i, 2010) * 5, mat({ color: 0xf4f6f8, unlit: 0.8, nofog: 1 })), 0, 38 + hash(i, 2012) * 14, -60 - hash(i, 2013) * 70); G.add(c); clouds.push([c, i]); }
    const hearts = heartPool(G, 12);
    return {
      group: G, sky: grad([[0, '#4a86cc'], [0.55, '#a8c8e4'], [1, '#e8eef2']]), shadowCol: 0x6e624c,
      light() { lights(0x9aa0a8, 0xfff4e0, [-0.4, -1, -0.3], 0xd8e2ea, [40, 170], 8); },
      anim(t, P = {}) {
        const b = beat(t), c = shotT(t, P);
        swingCymbals(kit, b);
        mic.visible = !P.noMic; sadiAmp.visible = P.amp !== false; hmirror.visible = !!P.handmirror && P.amp !== false;
        mir.set(P, c);
        dump.visible = !!P.truck;   // level with x = 0 at P.truck[0] s into the shot, P.truck[1] m/s, heading +x
        if (P.truck) { const [s0, v = 16] = P.truck; dump.position.set((c - s0) * v, 0.04 * Math.sin(t * 30), TRUCK_Z); }
        camels.forEach(({ c: cm, legs, i }) => {
          cm.visible = P.camels !== false; const x = -22 + i * 2.6 + t * 0.45 + (i > 3 ? 4 : 0); cm.position.set(x, ridgeY(x) - 0.2, RIDGE_Z - 3.2 - (i % 2) * 0.5);
          legs.forEach((l, j) => { l.rotation.z = 0.25 * Math.sin(t * 3 + i + (j % 2 ? PI : 0)); });
        });
        clouds.forEach(([cd, i]) => { cd.position.x = (hash(i, 2011) - 0.5) * 160 + t * 0.6; });
        hearts(P.hearts, c, t);
      },
    };
  }

  // ===================================================================================================================
  function trailer() {
    const G = new THREE.Group(), { W, L, H, T_MIC, T_KOB, T_DRUMS, T_AMP, T_AMP_Y, T_MIRROR } = TRAILER;
    const ribT = tex(32, 32, (x, r) => { px(x, '#c8ccd2', 0, 0, 32, 32); for (let i = 0; i < 32; i += 4) { px(x, '#e4e8ec', i, 0, 1, 32); px(x, '#a4a8b0', i + 2, 0, 1, 32); } px(x, '#8a8e96', 0, 15, 32, 1); noise(x, r, 32, 32, ['rgba(0,0,0,.05)', 'rgba(255,255,255,.06)'], 60); }, 2020);
    room(G, W, L, H, ribT, 1.2, 0xb8bcc2, { cz: -L / 2, skip: ['front'] });
    const plyT = tex(32, 32, (x, r) => { px(x, '#8a6a4a', 0, 0, 32, 32); for (let i = 0; i < 32; i += 8) px(x, '#6a4e34', 0, i, 32, 1); noise(x, r, 32, 32, ['#826244', '#947252'], 120); }, 2021);
    G.add(flat(W, L, mat({ map: plyT, rep: [W / 1.6, L / 1.6] }), 0, 0, -L / 2));
    // the strip lights along the ceiling, and a rib every 1.2 m
    const tubes = [];
    for (const x of [-0.9, 0, 0.9]) for (let z = -L + 0.8; z < -0.4; z += 2.2) { const tb = at(box(0.1, 0.06, 1.6, glow(0xf4f8ff)), x, H - 0.05, z - 0.8); G.add(tb); tubes.push(tb); }
    const ribs = []; for (let z = -L; z <= 0; z += 1.2) ribs.push(at(new THREE.Mesh(new THREE.BoxGeometry(W, 0.06, 0.06)), 0, H - 0.03, z));
    G.add(merged(ribs, M(0x9a9ea6)));
    // the rear frame and the doors swung open outwards; the desert beyond (a backdrop far enough to read as the view)
    G.add(at(box(W + 0.3, 0.2, 0.2, M(0x5a5e66)), 0, H + 0.1, 0.1));
    for (const s of [-1, 1]) G.add(at(box(0.15, H, 0.2, M(0x5a5e66)), s * (W / 2 + 0.07), H / 2, 0.1));
    for (const s of [-1, 1]) { const d = at(box(W / 2, H, 0.06, mat({ map: ribT, rep: [1.4, 2.3] })), s * (W / 2 + 0.12), H / 2, 0.1 + W / 4); d.rotation.y = s * PI / 2; G.add(d); }
    const viewT = tex(96, 48, (x, r) => {
      const g = x.createLinearGradient(0, 0, 0, 48); g.addColorStop(0, '#6a9ad0'); g.addColorStop(0.6, '#d8e4ec'); g.addColorStop(1, '#e8eef0'); x.fillStyle = g; x.fillRect(0, 0, 96, 48);
      x.fillStyle = '#9aaabb'; x.beginPath(); x.moveTo(0, 30); for (let i = 0; i <= 12; i++) x.lineTo(i * 8, 22 + Math.sin(i * 1.3) * 5); x.lineTo(96, 32); x.lineTo(0, 32); x.fill();
      x.fillStyle = '#4a4c52'; x.fillRect(0, 32, 96, 8); px(x, '#f0f0e8', 0, 35, 96, 1); x.fillStyle = '#a8997a'; x.fillRect(0, 40, 96, 8);
    }, 2022);
    const backdrop = at(new THREE.Mesh(new THREE.PlaneGeometry(40, 20), mat({ map: viewT, unlit: 0.85, nofog: 1 })), 0, 5.6, 14); backdrop.rotation.y = PI; G.add(backdrop);
    G.add(flat(40, 14, mat({ map: tex(16, 16, (x, r) => { px(x, '#a8997a', 0, 0, 16, 16); noise(x, r, 16, 16, ['#9a8b6c', '#b4a686'], 60); }, 2023), rep: [20, 7] }), 0, -1.2, 7));
    // the band's end: the kit, the amps, a mic stand; Sadi's amp near the doors with the hand mirror on it
    const kit = drumKit(G, ...T_DRUMS);
    amp(G, T_MIC[0] - 0.9, T_MIC[1] - 1.0, 0.66, 0.5, 0.38, 0.3); amp(G, T_KOB[0] + 0.45, T_KOB[1] - 0.9, 0.56, 0.72, 0.4, -0.3);
    const sadiAmp = amp(G, T_AMP[0], T_AMP[1], 0.7, T_AMP_Y, 0.42, -0.4);
    const mic = micStand(G, T_MIC[0], T_MIC[1] + 0.42);
    const hmirror = handMirror(G, T_AMP[0] - 0.1, T_AMP_Y + 0.012, T_AMP[1] + 0.02, -0.5);
    // the vanity mirror on the left wall, facing +x (a portal through the wall: its case sits outside the trailer)
    const van = mirrorPortal(G, T_MIRROR, { x: T_MIRROR.x, z: T_MIRROR.z, yaw: -PI / 2 }, insideTex(2024, '#c8ccd2', '#dcdfe4'), plyT, 2025);
    const hearts = heartPool(G, 12);
    return {
      group: G, sky: null, shadowCol: 0x4e3e2e, indoor: true,
      light() {
        lights(0x9aa0aa, 0xe8eef8, [0.2, -1, 0.3], 0x8a9098, [14, 40], 6);
        pt(0, 0, H - 0.3, -6.5, 0.7, 0.72, 0.78); pt(1, 0, H - 0.3, -3.2, 0.6, 0.62, 0.68); pt(2, 0, 1.6, 1.6, 0.55, 0.55, 0.5);
      },
      anim(t, P = {}) {
        const b = beat(t), c = shotT(t, P);
        swingCymbals(kit, b);
        mic.visible = !P.noMic; sadiAmp.visible = P.amp !== false; hmirror.visible = !!P.handmirror && P.amp !== false;
        van.set(P, c);
        tubes.forEach((tb, i) => { tb.visible = !(P.flicker && i === 4 && hash(Math.floor(t * 9), 2026) < 0.3); });
        hearts(P.hearts, c, t);
      },
    };
  }
  return { desert: desert(), trailer: trailer() };
}
