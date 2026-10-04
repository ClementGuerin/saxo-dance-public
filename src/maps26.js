// maps26.js: the "we fell in love in october" map (2026-10-03, girl in red; the clip: two girls in love in autumn
// Oslo, on a rooftop over the city's orange trees and in a pine and birch wood, one of them in a red sweater). Same
// contract as the other map files, pure in t:
//   park   a city park in October, golden afternoon (or dusk with `zone: 'dusk'`): a lawn of leaf litter round the
//          origin, a gravel path behind it (PATH, along x), maples and birches all round (the big maple MAPLE whose
//          crown can drop every leaf at once), a bench (BENCH, facing +z), a lamp post (LAMP, lit at dusk), the park
//          keeper's wheelbarrow full of leaves (BARROW), pumpkins, pets strolling on the far path, the city's roofs, a
//          church spire and towers beyond the trees, and leaves falling all the time.
// Flags: zone ('day' | 'dusk'), piles ([{ x, z, r, h, burst, grow, to, hide }]: leaf piles, each a dome of leaves:
// burst s (the pile flies apart into leaves that flutter down and lie round where it stood; a negative s = long ago,
// all landed), grow [s0, s1] (raked up from flat to full), to [x1, z1, s0, s1] (it creeps there, linearly like an
// actor's mx/mz from moveAt to the shot's end, wobbling: someone is inside; puff, with burst: the leaves fly but the pile only sinks to 70% round whoever landed in it)), carrots ([x, z, s, n]: a winter stash of n carrots bursting out of a pile, falling and lying round it), stash ([x, z, n]: n carrots in a little heap), carrots [x, z, s, n, 'rain', spread, headY] (they rain down round (x, z) instead, starting over `spread` s (default 0.12); with headY, carrot 0 lands on a head that high at (x, z) and bounces off it, the rest falling in a ring round it),
// dump ([s, x, z, r, h]: the big maple drops every leaf at once onto (x, z), a pile growing there up to the chin of
// whoever stands on it; its crown is bare from then), bag ({ x, z, yaw, to: [x1, z1], at, dur, hop: [m, beats],
// hopPh }: a big kraft-paper garden sack, open at the top, that two can stand in, hopping along like a sack race),
// fall (0-2: how many leaves fall; default 1), leafAt ([x, z]: where they fall, default [0, -1]), leafR (the patch they fall over, scaled: 0.3 is a dense shower for a close shot), gust (s: they blow
// across for a second), hearts ([[x, y, z, s0]]: three pink hearts pop and rise from each point), noguests, clear [[x,
// z, r]], key [x, y, z, r, g, b].
import { mapKit } from './mapkit.js';

export const PARK = {
  PATH: { z: -2.9, w: 1.4 }, BENCH: [2.8, -3.9], BENCH_Y: 0.42, LAMP: [4.0, -1.5], MAPLE: [-2.6, -6.4],
  BARROW: [-4.8, 2.2], BAG: [3.4, -0.5], FAR: -9.2,
};

export function buildParkMaps(K) {
  const k = mapKit(K);
  const { THREE, mat, tex, px, noise, box, TAU, PI, beat, grad, cyl, cone, ico, at, rot, flat, lights, pt, hash, merged } = k;
  const M = (c, o = {}) => mat({ color: c, ...o }), glow = (c, u = 1) => mat({ color: c, unlit: u });
  const cl = x => Math.max(0, Math.min(1, x)), sm = x => { x = cl(x); return x * x * (3 - 2 * x); };
  const fr = x => x - Math.floor(x);
  const shotT = (t, P) => P.t0 != null ? t - P.t0 : 0;
  const cleared = (P, x, z) => (P.clear || []).some(([cx, cz, r]) => (x - cx) ** 2 + (z - cz) ** 2 < r * r);
  const { PATH, BENCH, BENCH_Y, LAMP, MAPLE, BARROW, FAR } = PARK;
  const plane = (w, h, m) => new THREE.Mesh(new THREE.PlaneGeometry(w, h), m);
  const DS = THREE.DoubleSide;

  // the leaf palette (hex colours render darker through the linear conversion: these are pushed bright)
  const LEAF = [0xff9a32, 0xf05a32, 0xffcc44, 0xd8823a, 0xff7a28, 0xe8a030];
  const leafM = LEAF.map(c => mat({ color: c, unlit: 0.35, side: DS }));
  const leafGeo = new THREE.PlaneGeometry(0.12, 0.085);
  const leafMesh = i => new THREE.Mesh(leafGeo, leafM[i % leafM.length]);
  const leafT = tex(16, 16, (x, r) => { px(x, '#d0641e', 0, 0, 16, 16); noise(x, r, 16, 16, ['#e07e28', '#b84a1c', '#ecac3a', '#a8461a', '#e8c24a', '#c85a22'], 150); }, 2601);

  // ---------- trees ----------
  const barkT = tex(8, 16, (x, r) => { px(x, '#5a3a24', 0, 0, 8, 16); noise(x, r, 8, 16, ['#4a2e1c', '#6a4630'], 30); }, 2602);
  const birchT = tex(8, 16, (x, r) => { px(x, '#ece8e0', 0, 0, 8, 16); for (let i = 0; i < 9; i++) px(x, '#2a2a2a', Math.floor(r() * 6), Math.floor(r() * 16), 2 + Math.floor(r() * 2), 1); }, 2603);
  const CROWNS = [['#d8641e', '#e88a2a', '#c04a1a', '#f0b040'], ['#c83a22', '#e05a2a', '#a82a1c', '#f08a3a'], ['#e8a830', '#f0c444', '#d08a22', '#f8dc6a']];
  const crownM = CROWNS.map((c, i) => mat({ map: tex(16, 16, (x, r) => { px(x, c[0], 0, 0, 16, 16); noise(x, r, 16, 16, c.slice(1), 110); }, 2604 + i), unlit: 0.18 }));
  function maple(G, x, z, s = 1, p = 0) {
    const g = at(new THREE.Group(), x, 0, z); G.add(g);
    g.add(at(cyl(0.13 * s, 0.2 * s, 2.4 * s, 6, mat({ map: barkT, rep: [1, 2] })), 0, 1.2 * s, 0));
    const crown = new THREE.Group(); g.add(crown);
    [[0, 3.1, 0, 1.25], [0.75, 2.75, 0.3, 0.95], [-0.7, 2.8, -0.2, 1.0], [0.1, 3.75, -0.25, 0.9], [-0.2, 2.6, 0.75, 0.8]].forEach(([dx, dy, dz, r], i) => {
      const b = ico(r * s, 1, crownM[(p + (i % 2)) % crownM.length]); b.position.set(dx * s, dy * s, dz * s); b.rotation.set(i, i * 2, 0); crown.add(b);
    });
    const bare = new THREE.Group(); bare.visible = false; g.add(bare);   // the branches a dumped crown leaves behind
    for (let i = 0; i < 6; i++) { const a = i / 6 * TAU, br = cyl(0.035 * s, 0.06 * s, 1.5 * s, 4, mat({ map: barkT })); br.position.set(Math.cos(a) * 0.45 * s, 2.85 * s, Math.sin(a) * 0.45 * s); br.rotation.set(Math.sin(a) * 0.8, 0, -Math.cos(a) * 0.8); bare.add(br); }
    return { g, crown, bare };
  }
  function birch(G, x, z, s = 1) {
    const g = at(new THREE.Group(), x, 0, z); G.add(g);
    g.add(at(cyl(0.08 * s, 0.1 * s, 3.4 * s, 6, mat({ map: birchT, rep: [1, 3], unlit: 0.15 })), 0, 1.7 * s, 0));
    [[0, 3.5, 0, 0.85], [0.45, 3.0, 0.2, 0.65], [-0.4, 3.1, -0.15, 0.7]].forEach(([dx, dy, dz, r], i) => { const b = ico(r * s, 1, crownM[2]); b.position.set(dx * s, dy * s, dz * s); b.rotation.set(i * 2, i, 0); g.add(b); });
    return g;
  }

  // ---------- the leaf piles: a dome of leaves with a ragged skin of loose ones, and the ones that fly when it bursts ----------
  const NPILE = 7, NTOP = 40, NFLY = 56;
  const domeGeo = (() => {   // lumpy: each vertex pushed in or out by a hash of its direction (a smooth dome read as an orange igloo)
    const g = new THREE.IcosahedronGeometry(1, 2), p = g.attributes.position, v = new THREE.Vector3();
    for (let i = 0; i < p.count; i++) { v.fromBufferAttribute(p, i); const n = v.clone().normalize(), k = 1 + 0.16 * (hash(Math.round(n.x * 9), Math.round(n.y * 9), Math.round(n.z * 9)) - 0.5) + 0.06 * Math.sin(n.x * 11 + n.z * 7); p.setXYZ(i, n.x * k, n.y * k, n.z * k); }
    g.computeVertexNormals(); return g;
  })(), domeM = mat({ map: leafT, rep: [2, 2], unlit: 0.22 }), litterRingM = mat({ map: leafT, rep: [2, 2], unlit: 0.2, see: 0.3 });
  const piles = [];
  function makePile(G, seed) {
    const g = new THREE.Group(); G.add(g);
    const dome = new THREE.Group(); g.add(dome);
    dome.add(new THREE.Mesh(domeGeo, domeM));
    const litter = new THREE.Mesh(new THREE.CircleGeometry(1, 12), litterRingM); litter.rotation.x = -PI / 2; litter.position.y = 0.008; litter.visible = false; g.add(litter);
    // the skin: loose leaves on the upper half, merged per colour into one mesh each (they follow the dome's scale)
    const byCol = LEAF.map(() => []);
    for (let i = 0; i < NTOP; i++) {
      const th = Math.acos(1 - hash(i, seed) * 0.95), ph = hash(i, seed + 1) * TAU, n = new THREE.Vector3(Math.sin(th) * Math.cos(ph), Math.cos(th), Math.sin(th) * Math.sin(ph));
      const q = new THREE.Mesh(leafGeo); q.position.copy(n).multiplyScalar(1.03); q.lookAt(n.clone().multiplyScalar(2)); q.rotateZ(hash(i, seed + 2) * TAU); q.scale.set(1.6, 1.6, 1);
      byCol[i % LEAF.length].push(q);
    }
    byCol.forEach((parts, c) => { if (parts.length) dome.add(merged(parts, leafM[c])); });
    const fly = []; for (let i = 0; i < NFLY; i++) { const q = leafMesh(i + seed); q.visible = false; q.scale.setScalar(1.5); G.add(q); fly.push(q); }
    return { g, dome, litter, fly, seed };
  }
  // a leaf thrown up out of a pile: drag K_DRAG, terminal fall speed VT, fluttering; it lands and lies flat. Pure in tau.
  const K_DRAG = 2.4, VT = 0.75;
  const leafY = (y0, v0, tau) => y0 + (v0 + VT) / K_DRAG * (1 - Math.exp(-K_DRAG * tau)) - VT * tau;
  function landTau(y0, v0) { let a = 0.05, b = 12; if (leafY(y0, v0, b) > 0.01) return b; for (let i = 0; i < 22; i++) { const m = (a + b) / 2; if (leafY(y0, v0, m) > 0.01 || m < 0.1) a = m; else b = m; } return b; }
  const flyCache = new Map();
  function flyParams(seed, i, r, h) {   // pure in its inputs, cached
    const key = `${seed}:${i}:${r}:${h}`; let f = flyCache.get(key); if (f) return f;
    const a = hash(i, seed + 7) * TAU, rr = Math.sqrt(hash(i, seed + 8)) * r * 0.8, y0 = 0.1 + hash(i, seed + 9) * h * 0.9;
    const v0 = 2.2 + 2.4 * hash(i, seed + 10), vh = 0.5 + 1.7 * hash(i, seed + 11), b = a + (hash(i, seed + 12) - 0.5) * 0.8;
    f = { ox: Math.cos(a) * rr, oz: Math.sin(a) * rr, y0, v0, vx: Math.cos(b) * vh, vz: Math.sin(b) * vh, land: landTau(y0, v0), sp: 3 + 5 * hash(i, seed + 13), lay: hash(i, seed + 14) * TAU };
    flyCache.set(key, f); return f;
  }
  function posePile(p, spec, s, t) {
    if (!spec || spec.hide) { p.g.visible = false; p.fly.forEach(q => { q.visible = false; }); return; }
    p.g.visible = true;
    const r = spec.r ?? 0.8, h = spec.h ?? 0.7;
    let x = spec.x ?? 0, z = spec.z ?? 0, wob = 0;
    if (spec.to) { const [x1, z1, s0, s1] = spec.to, u = cl((s - s0) / Math.max(0.01, s1 - s0));   // linear, like an actor's mx/mz from moveAt to the shot's end
      x += (x1 - x) * u; z += (z1 - z) * u; if (s > s0 && s < s1) wob = 1; }
    let hk = 1, rk = 1;
    if (spec.grow) { const [s0, s1] = spec.grow; hk = 0.08 + 0.92 * sm((s - s0) / Math.max(0.01, s1 - s0)); rk = 1.25 - 0.25 * hk; }
    const bt = spec.burst != null ? s - spec.burst : -1;   // seconds since it burst
    if (spec.burst != null && bt >= 0) { const u = cl(bt / 0.14); hk = 1 - (spec.puff ? 0.3 : 0.92) * u; rk = 1 + (spec.puff ? 0.15 : 0.45) * u; }   // puff: someone landed in it, the leaves fly but most of the pile stays round them
    const wx = 1 + wob * 0.05 * Math.sin(t * 13), wz = 1 + wob * 0.05 * Math.cos(t * 11);
    p.g.position.set(x, 0, z);
    const gone = spec.burst != null && bt >= 0.14 && !spec.puff;   // flown apart: no dome left (squashed flat it read as a crater), a ring of litter instead
    p.dome.visible = !gone; p.litter.visible = gone; p.litter.scale.setScalar(r * 1.35);
    p.dome.scale.set(r * rk * wx, Math.max(0.02, h * hk * (1 + wob * 0.04 * Math.sin(t * 17))), r * rk * wz);
    p.fly.forEach((q, i) => {
      if (spec.burst == null || bt < 0) { q.visible = false; return; }
      const f = flyParams(p.seed, i, r, h), tau = Math.min(bt, f.land), landed = bt >= f.land, e = (1 - Math.exp(-K_DRAG * tau)) / K_DRAG;
      const sway = 0.14 * Math.sin(f.sp * tau + i) * (1 - Math.exp(-2 * tau));
      q.visible = true;
      q.position.set(x + f.ox + f.vx * e + sway, landed ? 0.012 + (i % 7) * 0.0012 : Math.max(0.012, leafY(f.y0, f.v0, tau)), z + f.oz + f.vz * e + sway * 0.6);
      if (landed) q.rotation.set(-PI / 2, 0, f.lay); else q.rotation.set(f.sp * tau + i, f.sp * 0.7 * tau, f.sp * 0.4 * tau + i * 2);
    });
  }

  // ---------- carrots (a stash bursting out of a pile) ----------
  const NCAR = 24, carrots = [];
  const carM = M(0xff8a1e, { unlit: 0.3 }), topM = M(0x3aa848, { unlit: 0.2 });
  function makeCarrot(G) {
    const g = new THREE.Group(); g.add(rot(at(cone(0.06, 0.26, 6, carM), 0, -0.13, 0), PI, 0, 0));
    for (let j = 0; j < 3; j++) g.add(rot(at(box(0.025, 0.12, 0.01, topM), 0, 0.05, 0), 0, j * 1.05, (j - 1) * 0.35));
    g.visible = false; G.add(g); return g;
  }
  const NSTASH = 9, stash = [];
  function poseStash(spec) {   // `stash` [x, z, n]: n carrots lying in a little heap (her winter stash, before it goes in)
    stash.forEach((g, i) => {
      if (!spec || i >= (spec[2] ?? NSTASH)) { g.visible = false; return; }
      const a = hash(i, 2615) * TAU, rr = Math.sqrt(hash(i, 2616)) * 0.3, layer = i % 3;
      g.visible = true; g.position.set(spec[0] + Math.cos(a) * rr, 0.045 + layer * 0.07, spec[1] + Math.sin(a) * rr); g.rotation.set(PI / 2, 0, a + layer);
    });
  }
  function bonk(g, x, z, hy, d, y0, v0, a) {   // a carrot falling onto a head at (x, hy, z) and bouncing off it to the side
    const th = (v0 + Math.sqrt(v0 * v0 + 19.6 * (y0 - hy))) / 9.8; g.visible = d > 0; if (d <= 0) return;
    if (d < th) { g.position.set(x, y0 + v0 * d - 4.9 * d * d, z); g.rotation.set(d * 6, d * 3, d * 5); return; }
    const e = d - th, up = 1.7, out = 0.9, te = (up + Math.sqrt(up * up + 19.6 * (hy - 0.045))) / 9.8, ee = Math.min(e, te);
    g.position.set(x + Math.cos(a) * out * ee, e >= te ? 0.045 : hy + up * ee - 4.9 * ee * ee, z + Math.sin(a) * out * ee);
    if (e >= te) g.rotation.set(PI / 2, 0, a); else g.rotation.set(ee * 14, ee * 4, ee * 11);
  }
  function poseCarrots(spec, s) {
    carrots.forEach((g, i) => {
      if (!spec || i >= (spec[3] ?? NCAR)) { g.visible = false; return; }
      const [x, z, s0] = spec, tau = s - s0, rain = spec[4] === 'rain'; if (tau < 0) { g.visible = false; return; }
      const a = hash(i, 2611) * TAU, vh = rain ? 0.35 * hash(i, 2612) : 0.9 + 1.8 * hash(i, 2612), v0 = rain ? -0.5 : 4.2 + 2.4 * hash(i, 2613), y0 = rain ? 3.0 + 1.4 * hash(i, 2613) : 0.5;   // rain: from 3-4.4 m over a disc 0.9 m round (x, z)
      if (rain && i === 0 && spec[6] != null) { bonk(g, x, z, spec[6], tau, y0, v0, a); return; }   // spec[6]: carrot 0 lands on a head that high at (x, z) and bounces off it
      if (rain) { const rr = spec[6] != null ? 0.45 + 0.6 * Math.sqrt(hash(i, 2614)) : 0.9 * Math.sqrt(hash(i, 2614)), b = hash(i, 2617) * TAU, d = Math.max(0, tau - (spec[5] ?? 0.12) * hash(i, 2618)); const tl = (v0 + Math.sqrt(v0 * v0 + 19.6 * (y0 - 0.045))) / 9.8, tt = Math.min(d, tl), landed = d >= tl;   // spec[5]: how long the rain lasts (s); round a head, they miss it (a ring from 0.45 m)
        g.visible = d > 0; g.position.set(x + Math.cos(b) * rr + Math.cos(a) * vh * tt, landed ? 0.045 : Math.max(0.045, y0 + v0 * tt - 4.9 * tt * tt), z + Math.sin(b) * rr + Math.sin(a) * vh * tt);
        if (landed) g.rotation.set(PI / 2, 0, a); else g.rotation.set(tt * 6 + i, tt * 3, tt * 5); return; }
      const tl = (v0 + Math.sqrt(v0 * v0 + 19.6 * (y0 - 0.045))) / 9.8, tt = Math.min(tau, tl), landed = tau >= tl;
      g.visible = true;
      g.position.set(x + Math.cos(a) * vh * tt, landed ? 0.045 : Math.max(0.045, y0 + v0 * tt - 4.9 * tt * tt), z + Math.sin(a) * vh * tt);
      if (landed) g.rotation.set(PI / 2, 0, a); else g.rotation.set(tt * 9 + i, tt * 5, tt * 7);
    });
  }

  // ---------- the garden sack (two can stand in it, side by side along its long axis, x) ----------
  const bagT = tex(64, 32, (x, r) => {
    px(x, '#dcb47e', 0, 0, 64, 32); noise(x, r, 64, 32, ['#cca26c', '#e6c08c', '#d2a874'], 120);
    for (const cx of [3, 11, 52, 60]) px(x, '#c09464', cx, 0, 1, 32);   // creases down its sides
    px(x, '#d0a46e', 0, 0, 64, 2);   // the folded top
    for (const [lx, ly] of [[25, 3], [23, 5], [27, 5], [24, 4]]) px(x, '#2e9a40', lx, ly, 6, 6); px(x, '#1e6e2c', 27, 5, 1, 9); px(x, '#1e6e2c', 26, 13, 2, 2);   // a big green leaf
    x.fillStyle = '#1e6e2c'; x.font = 'bold 9px monospace'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('LEAVES', 32, 22);   // printed on its front (rep 2: on both sides)
  }, 2620);
  function makeBag(G) {
    const g = new THREE.Group(); G.add(g);
    // one paper wall, its texture turned so LEAVES sits on the front and the back (a cylinder's u starts at its +z side);
    // banded in two parts with a dark collar it read as a wooden tub
    const wallGeo = new THREE.CylinderGeometry(1.03, 0.95, 0.72, 16, 1, true); wallGeo.rotateY(-PI / 2);
    const wall = new THREE.Mesh(wallGeo, mat({ map: bagT, rep: [2, 1], side: DS, unlit: 0.18 })); wall.scale.set(0.95, 1, 0.52); wall.position.y = 0.36; g.add(wall);
    const rim = new THREE.Mesh(new THREE.TorusGeometry(1, 0.035, 4, 16), M(0xe6c28e, { unlit: 0.18 })); rim.rotation.x = PI / 2; rim.scale.set(0.98, 0.54, 1); rim.position.y = 0.72; g.add(rim);
    g.add(flat(1.8, 0.9, M(0x5a4028), 0, 0.02, 0));
    const fill = new THREE.Mesh(domeGeo, domeM); fill.scale.set(0.86, 0.12, 0.42); fill.position.y = 0.6; g.add(fill);   // leaves up to the rim round whoever stands in it, under their chins
    g.visible = false;
    return g;
  }
  const sackShadowM = mat({ color: 0x2a2416, see: 0.45 });

  // ======================================================================================================================
  function park() {
    const G = new THREE.Group();
    // ---------------- the ground: a lawn of leaf litter (cells >= 1 m, low contrast), a gravel path behind ----------------
    const grassT = tex(32, 32, (x, r) => { px(x, '#7a8a3e', 0, 0, 32, 32); noise(x, r, 32, 32, ['#6e7e36', '#869848', '#74843a'], 260); noise(x, r, 32, 32, ['#c8783a', '#b8603a', '#d8a442', '#b0703a'], 70); }, 2630);
    G.add(flat(90, 90, mat({ map: grassT, rep: [45, 45] }), 0, 0, 0));
    const gravelT = tex(16, 16, (x, r) => { px(x, '#c8b896', 0, 0, 16, 16); noise(x, r, 16, 16, ['#bcac8a', '#d4c4a2', '#b0a080'], 60); noise(x, r, 16, 16, ['#d8742a', '#e2a83a'], 8); }, 2631);
    G.add(flat(60, PATH.w, mat({ map: gravelT, rep: [40, 1] }), 0, 0.004, PATH.z));
    G.add(flat(60, 1.2, mat({ map: gravelT, rep: [40, 1] }), 0, 0.004, FAR));
    const litterM = mat({ map: leafT, rep: [2, 2], unlit: 0.15, see: 0.25 });   // leaf litter heaped under the trees
    // ---------------- trees all round, denser behind (-z); the big maple over the giant pile ----------------
    const big = maple(G, MAPLE[0], MAPLE[1], 1.25, 0);
    const TREES = [[-7.5, -7.8, 'm', 1.1, 1], [5.6, -7.2, 'm', 1.15, 0], [8.8, -4.6, 'b', 1.1], [-9.6, -3.6, 'b', 1.05], [1.4, -10.6, 'm', 1.2, 2],
      [-4.8, -11.6, 'b', 1.2], [9.4, -11.2, 'm', 1.1, 1], [-11.8, -9.6, 'm', 1.2, 0], [12.4, -6.8, 'b', 1.0], [-13.4, -2.2, 'm', 1.1, 2],
      [13.6, -1.0, 'm', 1.15, 0], [-12.8, 4.6, 'b', 1.1], [12.6, 5.2, 'm', 1.1, 1], [-8.6, 10.6, 'm', 1.2, 0], [8.0, 11.4, 'b', 1.05],
      [0.6, 13.6, 'm', 1.15, 2], [-4.2, 14.4, 'b', 1.1], [4.6, 15.0, 'm', 1.1, 0], [-16.0, -14.0, 'm', 1.3, 1], [16.4, -14.6, 'm', 1.3, 2],
      [-2.0, -15.4, 'b', 1.25], [6.8, -15.8, 'm', 1.25, 1], [-9.0, -16.8, 'b', 1.2], [11.0, -18.0, 'b', 1.15]];
    TREES.forEach(([x, z, kind, s, p]) => { if (kind === 'm') maple(G, x, z, s, p); else birch(G, x, z, s); G.add(flat(3.2 * s, 3.2 * s, litterM, x, 0.006, z)); });
    G.add(flat(3.8, 3.8, litterM, MAPLE[0], 0.006, MAPLE[1]));
    // ---------------- the city beyond the trees: roofs, towers, a green copper spire, hills of autumn trees ----------------
    const cityT = (dusk, seed) => tex(96, 32, (x, r) => {
      const gr = x.createLinearGradient(0, 0, 0, 32); gr.addColorStop(0, dusk ? '#7a4a8a' : '#c9dcea'); gr.addColorStop(1, dusk ? '#ff9a6a' : '#e8dccb'); x.fillStyle = gr; x.fillRect(0, 0, 96, 32);
      if (dusk) x.globalAlpha = 0.62;
      for (let i = 0; i < 96; i += 2) px(x, ['#b88a4a', '#c8743a', '#a8a050'][Math.floor(r() * 3)], i, 20 + Math.floor(r() * 3), 2, 12);   // hills of trees
      for (let i = 0; i < 96;) { const bw = 3 + Math.floor(r() * 5), bh = 5 + Math.floor(r() * 9); px(x, ['#c8bfb0', '#a8a49c', '#d8cfc0', '#9a968e'][Math.floor(r() * 4)], i, 32 - bh, bw, bh); for (let yy = 33 - bh; yy < 31; yy += 2) for (let xx = i + 1; xx < i + bw - 1; xx += 2) if (r() < 0.5) px(x, '#7a8494', xx, yy, 1, 1); i += bw + Math.floor(r() * 3); }
      for (const [tx0, tw, th] of [[14, 5, 22], [21, 4, 18], [70, 6, 24], [77, 4, 19]]) { px(x, '#8a9098', tx0, 32 - th, tw, th); for (let yy = 34 - th; yy < 31; yy += 2) for (let xx = tx0 + 1; xx < tx0 + tw - 1; xx += 2) px(x, '#5e6874', xx, yy, 1, 1); }
      px(x, '#c8b8a0', 45, 14, 5, 18); px(x, '#5aa088', 46, 6, 3, 8); px(x, '#5aa088', 47, 2, 1, 4);   // the church and its green copper spire
      if (dusk) { x.globalAlpha = 1; for (let i = 0; i < 70; i++) px(x, '#ffd890', Math.floor(r() * 96), 12 + Math.floor(r() * 20), 1, 1); }   // lit windows
    }, seed);
    const cities = [false, true].map(dusk => {
      const T = cityT(dusk, 2632 + (dusk ? 5 : 0)), grp = new THREE.Group(); G.add(grp);
      const c = plane(110, 26, mat({ map: T, unlit: 0.85, nofog: 1 })); c.position.set(0, 9, -40); grp.add(c);
      for (const sd of [-1, 1]) { const c2 = plane(90, 22, mat({ map: T, unlit: 0.85, nofog: 1 })); c2.position.set(sd * 42, 8, -6); c2.rotation.y = -sd * PI / 2; grp.add(c2); }
      return grp;
    });
    const backT = tex(64, 16, (x, r) => { px(x, '#d8c8a8', 0, 0, 64, 16); for (let i = 0; i < 64; i += 2) px(x, ['#c06a2a', '#d89a3a', '#a85a2a'][Math.floor(r() * 3)], i, 4 + Math.floor(r() * 4), 2, 12); }, 2633);
    const back = plane(110, 16, mat({ map: backT, unlit: 0.8, nofog: 1 })); back.position.set(0, 6, 36); back.rotation.y = PI; G.add(back);
    // ---------------- the bench, the lamp post, the wheelbarrow, pumpkins ----------------
    const woodM = M(0x9a5a2a), ironM = M(0x1e2a24);
    const bench = at(new THREE.Group(), BENCH[0], 0, BENCH[1]); G.add(bench);
    for (let i = 0; i < 3; i++) bench.add(at(box(1.7, 0.04, 0.12, woodM), 0, BENCH_Y - 0.02, -0.17 + i * 0.15));
    for (let i = 0; i < 2; i++) bench.add(rot(at(box(1.7, 0.1, 0.035, woodM), 0, BENCH_Y + 0.24 + i * 0.16, -0.3), -0.18, 0, 0));
    for (const sx of [-0.75, 0.75]) { bench.add(at(box(0.06, BENCH_Y, 0.42, ironM), sx, BENCH_Y / 2, -0.05)); bench.add(at(box(0.06, 0.5, 0.05, ironM), sx, BENCH_Y + 0.25, -0.32)); }
    const lamp = at(new THREE.Group(), LAMP[0], 0, LAMP[1]); G.add(lamp);
    lamp.add(at(cyl(0.05, 0.08, 3.0, 6, ironM), 0, 1.5, 0)); lamp.add(at(cyl(0.16, 0.2, 0.14, 6, ironM), 0, 0.07, 0));
    const lampGlassM = glow(0xffe6a0, 0.5); lamp.add(at(box(0.3, 0.38, 0.3, lampGlassM), 0, 3.14, 0)); lamp.add(rot(at(cone(0.26, 0.2, 4, ironM), 0, 3.43, 0), 0, PI / 4, 0));
    const barrow = rot(at(new THREE.Group(), BARROW[0], 0, BARROW[1]), 0, 0.5, 0); G.add(barrow);
    barrow.add(rot(at(box(0.7, 0.32, 0.95, M(0x2e8a4a)), 0, 0.42, 0), 0.08, 0, 0)); barrow.add(rot(at(new THREE.Mesh(new THREE.TorusGeometry(0.17, 0.05, 4, 8), M(0x1a1a1a)), 0, 0.18, 0.55), 0, PI / 2, 0));
    for (const sx of [-0.25, 0.25]) barrow.add(rot(at(box(0.04, 0.04, 0.8, M(0x7a5a3a)), sx, 0.42, -0.65), -0.2, 0, 0));
    const heap = new THREE.Mesh(domeGeo, domeM); heap.scale.set(0.38, 0.28, 0.5); heap.position.set(0, 0.58, 0); barrow.add(heap);
    const pumpM = M(0xff7a1a, { unlit: 0.2 }), stemM = M(0x4a6a2a);
    for (const [x, z, s] of [[3.9, -3.5, 1], [4.3, -3.9, 0.75], [1.9, -3.75, 0.8], [-5.2, -2.3, 1.1], [-4.7, -2.0, 0.7], [6.0, -2.5, 0.9]]) { const pu = ico(0.22 * s, 1, pumpM); pu.scale.set(1.15, 0.8, 1.15); pu.position.set(x, 0.17 * s, z); G.add(pu); G.add(at(cyl(0.025 * s, 0.03 * s, 0.1 * s, 5, stemM), x, 0.36 * s, z)); }
    // ---------------- the piles, the carrots, the sack, the dump ----------------
    for (let i = 0; i < NPILE; i++) piles.push(makePile(G, 2640 + i * 31));
    for (let i = 0; i < NCAR; i++) carrots.push(makeCarrot(G));
    for (let i = 0; i < NSTASH; i++) stash.push(makeCarrot(G));
    const bag = makeBag(G), bagShadow = new THREE.Mesh(new THREE.CircleGeometry(1, 14), sackShadowM); bagShadow.rotation.x = -PI / 2; bagShadow.visible = false; G.add(bagShadow);
    const dumpPile = makePile(G, 2690);
    const NDUMP = 110, dumpLeaves = []; for (let i = 0; i < NDUMP; i++) { const q = leafMesh(i); q.visible = false; q.scale.setScalar(1.6); G.add(q); dumpLeaves.push(q); }
    // ---------------- leaves falling all the time ----------------
    const NFALL = 90, falling = []; for (let i = 0; i < NFALL; i++) { const q = leafMesh(i + 3); q.scale.setScalar(1.35); G.add(q); falling.push(q); }
    // ---------------- pets strolling on the far path in coats and scarves ----------------
    const FURS = [0xd8b080, 0xece0cc, 0xb89068, 0xf4f0e8, 0xcfc6d6, 0xe4cca4];
    const COATS = [0x3a5a8a, 0x8a3a3a, 0x4a6a3a, 0xc8a040, 0x6a4a8a, 0x2a2a3a];
    const walkers = [0, 1, 2, 3, 4, 5].map(i => {
      const g = new THREE.Group(), F = M(FURS[i]), C = M(COATS[i]); G.add(g);
      g.add(at(box(0.38, 0.44, 0.28, C), 0, 0.34, 0)); g.add(at(box(0.4, 0.08, 0.3, M(i % 2 ? 0xe84a3a : 0xf0c040)), 0, 0.58, 0));
      const legs = [-1, 1].map(sd => { const l = at(new THREE.Group(), sd * 0.1, 0.14, 0); l.add(at(box(0.11, 0.16, 0.12, M(0x2a2a30)), 0, -0.06, 0)); g.add(l); return l; });
      const head = at(ico(0.24, 1, F), 0, 0.82, 0); head.scale.set(1, 0.9, 0.92); g.add(head);
      g.add(at(ico(0.1, 1, M(0xf6ece0)), 0, 0.76, 0.2)); for (const e of [-1, 1]) { g.add(at(ico(0.036, 0, M(0x101010)), e * 0.1, 0.86, 0.2)); g.add(rot(at(cone(0.08, 0.2, 4, F), e * 0.15, 1.08, 0), 0, 0, -e * 0.25)); }
      return { g, legs, i };
    });
    const sun = at(new THREE.Mesh(new THREE.CircleGeometry(4.5, 12), glow(0xfff0c0, 1)), -38, 22, -150); G.add(sun);
    const heartM = M(0xff4f9a, { unlit: 0.8 }), hearts = [];   // three pink hearts popping and rising from a point (the tower map's)
    for (let i = 0; i < 9; i++) { const h = new THREE.Group(); h.add(at(ico(0.1, 0, heartM), -0.075, 0, 0)); h.add(at(ico(0.1, 0, heartM), 0.075, 0, 0)); h.add(rot(at(cone(0.125, 0.18, 4, heartM), 0, -0.11, 0), PI, 0, 0)); h.visible = false; G.add(h); hearts.push(h); }
    const duskT = tex(4, 64, x => { const gr = x.createLinearGradient(0, 0, 0, 64); gr.addColorStop(0, '#2c2a64'); gr.addColorStop(0.3, '#6a4a8a'); gr.addColorStop(0.47, '#e0708a'); gr.addColorStop(0.5, '#ffa868'); gr.addColorStop(1, '#ffa868'); x.fillStyle = gr; x.fillRect(0, 0, 4, 64); }, 2634);
    const duskSky = new THREE.Mesh(new THREE.SphereGeometry(185, 16, 12), mat({ map: duskT, unlit: 1, nofog: 1, side: THREE.BackSide })); duskSky.visible = false; G.add(duskSky);

    return {
      group: G, sky: grad([[0, '#7eb0e2'], [0.6, '#cfe0ec'], [1, '#f8d8ac']]), shadowCol: 0x4a4a22,
      shadowY: 0.03,   // the blob shadows 3 cm up: at 1.2 cm the gravel path (4 mm, polygon offset) drew over them (no shadow under the dancers on it, 2026-10-04 review)
      light() { lights(0xa69e8c, 0xffe4b8, [0.45, -0.75, -0.5], 0xe8dcc6, [22, 70], 9); },
      anim(t, P = {}) {
        const s = shotT(t, P), bb = beat(t), dusk = P.zone === 'dusk';
        if (dusk) lights(0x6c5c78, 0xffa070, [0.6, -0.4, -0.6], 0xb88080, [18, 60], 9);
        sun.visible = !dusk; duskSky.visible = dusk; cities[0].visible = !dusk; cities[1].visible = dusk; lampGlassM.uniforms.uUnlit.value = dusk ? 1 : 0.5;
        if (dusk) pt(0, LAMP[0], 3.0, LAMP[1], 1.6, 1.15, 0.6);
        if (P.key) pt(3, P.key[0], P.key[1], P.key[2], P.key[3], P.key[4], P.key[5]);
        // the piles and the carrots
        const specs = P.piles || [];
        piles.forEach((p, i) => posePile(p, specs[i], s, t));
        poseCarrots(P.carrots, s); poseStash(P.stash);
        // the sack
        const B = P.bag;
        bag.visible = !!B; bagShadow.visible = !!B;
        if (B) {
          const u = B.to ? cl((s - (B.at || 0)) / Math.max(0.01, B.dur || 1)) : 0;   // linear, like its riders' mx/mz
          let hop = 0; if (B.hop) { const hu = fr((bb - (B.hopPh || 0)) / B.hop[1]); hop = B.hop[0] * 4 * hu * (1 - hu); }
          bag.position.set(B.x + (B.to ? (B.to[0] - B.x) * u : 0), hop, B.z + (B.to ? (B.to[1] - B.z) * u : 0)); bag.rotation.set(0, (B.yaw || 0) * PI / 180, 0);
          bagShadow.position.set(bag.position.x, 0.011, bag.position.z); bagShadow.rotation.z = -(B.yaw || 0) * PI / 180; bagShadow.scale.set(1.0 - 0.4 * hop, 0.55 - 0.2 * hop, 1);
        }
        // the dump: the big maple drops every leaf at once onto (x, z); a pile grows there
        const D = P.dump, dt = D ? s - D[0] : -1;
        big.crown.visible = !(D && dt >= 0.15); big.bare.visible = !big.crown.visible;
        dumpLeaves.forEach((q, i) => {
          const delay = hash(i, 2694) * 0.35, dur = 0.55 + hash(i, 2695) * 0.45;
          if (!D || dt < delay || dt > 2.4) { q.visible = false; return; }
          const a0 = hash(i, 2691) * TAU, r0 = Math.sqrt(hash(i, 2692)) * 1.5, y0 = 2.6 + hash(i, 2693) * 2.0, a1 = hash(i, 2696) * TAU, r1 = Math.sqrt(hash(i, 2697)) * 0.85, u = cl((dt - delay) / dur);
          const x0 = MAPLE[0] + Math.cos(a0) * r0, z0 = MAPLE[1] + Math.sin(a0) * r0, x1 = D[1] + Math.cos(a1) * r1, z1 = D[2] + Math.sin(a1) * r1;
          q.visible = true;
          q.position.set(x0 + (x1 - x0) * u + 0.1 * Math.sin(dt * 9 + i), Math.max(0.02, y0 * (1 - u * u)), z0 + (z1 - z0) * u);
          q.rotation.set(dt * 7 + i, dt * 5, dt * 4 + i);
        });
        posePile(dumpPile, D && dt >= 0.2 ? { x: D[1], z: D[2], r: D[3] ?? 0.92, h: D[4] ?? 0.8, grow: [D[0] + 0.2, D[0] + 0.95] } : null, s, t);
        // leaves falling all the time; a gust blows them across for a second
        const nf = Math.round(NFALL * cl((P.fall ?? 1) / 2)), g0 = P.gust != null ? s - P.gust : -1, gust = g0 >= 0 && g0 < 1.6 ? sm(g0 / 0.3) * (1 - sm((g0 - 1.1) / 0.5)) : 0;
        const [cx, cz] = P.leafAt || [0, -1], lr = P.leafR ?? 1;   // leafR: the patch they fall over, scaled (0.3: a dense shower round leafAt, seen in a close shot)
        falling.forEach((q, i) => {
          if (i >= nf * 2) { q.visible = false; return; }
          const r1 = hash(i, 2650), r2 = hash(i, 2651), r3 = hash(i, 2652), top = 6.5, sp = 0.45 + r3 * 0.35, y = top - ((t * sp + r1 * top) % top);
          q.position.set(cx + (r1 - 0.5) * 16 * lr + Math.sin(t * 1.3 + i) * 0.5 + gust * 6 * (1 - y / top), y, cz + (r2 - 0.5) * 14 * lr + Math.cos(t * 1.1 + i * 2) * 0.3);
          q.rotation.set(t * 2.2 + i, t * 1.6 + i * 2, t * 1.1 + i);
          q.visible = !cleared(P, q.position.x, q.position.z);
        });
        hearts.forEach((h, i) => {   // `hearts` [[x, y, z, s0]]: three pink hearts pop and rise from each point
          const q = (P.hearts || [])[Math.floor(i / 3)]; h.visible = false; if (!q) return;
          const e = s - q[3] - (i % 3) * 0.18; if (e < 0 || e > 1.4) return;
          h.visible = true; h.position.set(q[0] + ((i % 3) - 1) * 0.22 + 0.06 * Math.sin(e * 6 + i), q[1] + 0.55 * e, q[2]); h.scale.setScalar(Math.min(1, e * 5) * (1.15 - 0.25 * (e / 1.4)));
        });
        // the pets on the far path
        walkers.forEach(w => {
          const dir = w.i % 2 ? 1 : -1, x = ((hash(w.i, 2660) * 30 + t * 0.55 * dir) % 30 + 30) % 30 - 15, z = FAR + (w.i % 2 ? 0.3 : -0.3);
          const show = !P.noguests && !cleared(P, x, z); w.g.visible = show; if (!show) return;
          w.g.position.set(x, 0.03 * Math.abs(Math.sin(t * 6 + w.i)), z); w.g.rotation.set(0, dir > 0 ? PI / 2 : -PI / 2, 0);
          w.legs.forEach((l, q) => { l.rotation.x = (q ? 1 : -1) * 0.5 * Math.sin(t * 6 + w.i); });
        });
      },
    };
  }
  return { park: park() };
}
