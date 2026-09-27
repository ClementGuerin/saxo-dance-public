// maps13.js: the "Beauty And A Beat" map (2026-09-27, Justin Bieber ft. Nicki Minaj: the clip is "stolen" selfie-stick
// footage of a night party at a water park). Same contract as the other map files, pure in t:
//   pool  a water park at night: a glowing turquoise wave pool (the water's surface at POOL.WATER, its floor at
//         POOL.FLOOR: a character standing in it is chest-deep with `lift` POOL.FLOOR), the lifeguard tower at its near
//         edge (platform top POOL.PLAT, facing the pool, -z; a ladder behind it, a LIFEGUARD plate, a lifebuoy, a red
//         flag), two tube slides spiralling down a yellow tower in the far left corner into the pool at SLIDE_EXIT,
//         palms, string lights over the water, a tiki bar and three round podiums under UV light on the far side, Kob's
//         lounger under a striped parasol on the deck (LOUNGER, seat top LOUNGE_Y), foam cannons (CANNONS), pets
//         swimming, floating on rings, dancing on the podiums and at the bar.
//         Flags read by anim(t, P): `waves` (m: the wave machine's height, ramping in over the shot's first second;
//         `waveAt` s delays it), `foam` (s into the shot, or true: the cannons fire and foam piles up on the deck to
//         `foamY`, default 0.85), `splash` ([x, z, s] or a list: a big splash on the water s into the shot), `riders`
//         (a pet shoots out of the slide every 2 bars and lands in the pool), `rider` ([s, x, z]: one pet shot out of
//         the slide s into the shot, landing at (x, z) with a splash), `phones` (every pet holds up a phone,
//         filming, turned towards `stare`), `stare` ([x, z]: the pets' heads turn there), `gather` ([cx, cz, r, a0, a1]:
//         the pets in the water line up on that arc, deg from +z, facing its centre: a wall of phones), `thrash` ([[x, z], ...]:
//         a swimmer in trouble, small splashes flying round that point on every half beat), `foamPool` (0-1: foam islands
//         drifting on the water behind the tower, riding the waves), `noguests`, `noPool`
//         (no pets in the water), `clear` ([[x, z, r]]: no pet near those points: a lens, the marks).
import { mapKit } from './mapkit.js';

export const POOL = { WATER: -0.28, FLOOR: -0.8, X: [-7, 7], Z: [-15, -2], TOWER: [2.4, -1.35], PLAT: 1.5,
  LOUNGER: [5.6, 1.7], LOUNGE_Y: 0.3, SLIDE_EXIT: [-5.8, -12.6], PODIUMS: [[-3.4, -18.4], [0, -19.0], [3.4, -18.4]], PODIUM_Y: 0.6,
  CANNONS: [[-8.6, 3.6], [9.2, 4.4]], BAR: [0, -22.6] };

export function buildPoolMaps(K) {
  const k = mapKit(K);
  const { THREE, mat, tex, px, noise, box, selfLit, TAU, PI, hash, beat, hit, grad, sign, cyl, cone, at, rot, merged, flat, lights, pt, stars } = k;
  const M = (c, o = {}) => mat({ color: c, ...o }), glow = c => mat({ color: c, unlit: 1 });
  const PARTY = [0xff5fa2, 0x3fd4ff, 0xffd43b, 0x9a6aff, 0x6bd46b];
  const pmod = (a, n) => ((a % n) + n) % n;   // before the first beat the beat index is negative
  const cleared = (P, x, z) => (P.clear || []).some(([cx, cz, r]) => (x - cx) ** 2 + (z - cz) ** 2 < r * r);
  const sm = u => { const v = Math.min(1, Math.max(0, u)); return v * v * (3 - 2 * v); };
  const { WATER, FLOOR, X, Z, TOWER, PLAT, LOUNGER, LOUNGE_Y, SLIDE_EXIT, PODIUMS, PODIUM_Y, CANNONS, BAR } = POOL;

  // a background pet: box body, big head facing +z, ears by kind; a swimsuit top; a phone it can hold up (`phones`)
  const FURS = [0xd8c2a0, 0x3a2e28, 0xf2eee6, 0x9a7a5a, 0x6a6a72, 0xe8a060, 0x2a2a30, 0xc8b8e0], TOPS = [0xe84a6a, 0x4a8fe8, 0xf2c94c, 0x6bd46b, 0xffffff, 0xff9a3c, 0x8a5ad8, 0x2a2a3a];
  const phoneM = mat({ color: 0xffb4dc, unlit: 0.6 }), screenM = glow(0x9ae8ff);   // candy pink: 0xff4f9a rendered dark plum
  function pet(i) {
    const g = new THREE.Group(), fur = M(FURS[i % FURS.length]), kind = i % 3, top = M(TOPS[(i * 5) % TOPS.length]);
    const body = new THREE.Group(); g.add(body);
    body.add(at(box(0.36, 0.44, 0.26, top), 0, 0.3, 0));
    for (const s of [-1, 1]) body.add(at(box(0.11, 0.12, 0.12, fur), s * 0.09, 0.06, 0.02));
    const head = at(new THREE.Group(), 0, 0.72, 0); body.add(head);
    head.add(box(0.42, 0.38, 0.38, fur));
    head.add(at(box(0.15, 0.1, 0.1, M(0x1a1a1a)), 0, -0.06, 0.2));
    for (const e of [-1, 1]) {
      head.add(at(box(0.06, 0.06, 0.02, M(0x101010)), e * 0.1, 0.04, 0.195));
      head.add(kind === 0 ? rot(at(cone(0.08, 0.2, 4, fur), e * 0.14, 0.26, 0), 0, 0, -e * 0.25) : kind === 1 ? at(box(0.08, 0.3, 0.06, fur), e * 0.1, 0.32, 0) : rot(at(box(0.07, 0.24, 0.16, fur), e * 0.23, 0.02, 0), 0, 0, e * 0.3));
    }
    const phone = new THREE.Group(); phone.add(box(0.12, 0.2, 0.03, phoneM)); phone.add(at(box(0.1, 0.17, 0.01, screenM), 0, 0, -0.02));
    phone.add(at(box(0.05, 0.42, 0.05, fur), 0.02, -0.26, 0.02));   // the paw holding it up
    phone.add(at(box(0.05, 0.05, 0.012, glow(0xffffff)), -0.03, 0.065, 0.02)); phone.add(at(box(0.03, 0.03, 0.012, glow(0xff2020)), 0.035, 0.07, 0.02));   // its flash and a red REC light, on the back
    phone.position.set(0.1, 1.08, 0.2); phone.scale.setScalar(1.6); phone.visible = false; body.add(phone);   // held up over the head, big: at face height it hid the face
    return { g, body, head, phone, i };
  }
  const ring = (col) => { const r = new THREE.Mesh(new THREE.TorusGeometry(0.42, 0.17, 5, 10), M(col)); r.rotation.x = PI / 2; return r; };

  function pool() {
    const G = new THREE.Group();
    // ---------------- the deck round the pool: pale stone, a white coping at the edge ----------------
    const stone = tex(16, 16, (x, r) => { px(x, '#c8c0b0', 0, 0, 16, 16); px(x, '#b4ac9c', 0, 0, 16, 1); px(x, '#b4ac9c', 0, 0, 1, 16); noise(x, r, 16, 16, ['#c0b8a8', '#d0c8b8'], 30); }, 1301);
    const deck = (x0, x1, z0, z1) => { const w = x1 - x0, d = z1 - z0; G.add(flat(w, d, mat({ map: stone, rep: [w / 1.2, d / 1.2] }), (x0 + x1) / 2, 0, (z0 + z1) / 2)); };
    deck(-26, X[0], -40, 16); deck(X[1], 26, -40, 16); deck(X[0], X[1], Z[1], 16); deck(X[0], X[1], -40, Z[0]);
    const cop = M(0xf4f2ea);
    G.add(at(box(X[1] - X[0] + 0.8, 0.05, 0.4, cop), 0, 0.02, Z[1] + 0.2)); G.add(at(box(X[1] - X[0] + 0.8, 0.05, 0.4, cop), 0, 0.02, Z[0] - 0.2));
    G.add(at(box(0.4, 0.05, Z[1] - Z[0], cop), X[0] - 0.2, 0.02, (Z[0] + Z[1]) / 2)); G.add(at(box(0.4, 0.05, Z[1] - Z[0], cop), X[1] + 0.2, 0.02, (Z[0] + Z[1]) / 2));
    // ---------------- the pool: tiled basin, underwater lamps, the glowing water (waves, `see` through it) ----------------
    const tileT = tex(16, 16, (x, r) => { px(x, '#2a8ac8', 0, 0, 16, 16); px(x, '#1f6ea8', 0, 0, 16, 1); px(x, '#1f6ea8', 0, 0, 1, 16); noise(x, r, 16, 16, ['#2884c0', '#3094d0'], 20); }, 1302);
    const W = X[1] - X[0], D = Z[1] - Z[0], cz = (Z[0] + Z[1]) / 2, dep = -FLOOR;
    G.add(flat(W, D, mat({ map: tileT, rep: [W / 1.5, D / 1.5], unlit: 0.45 }), 0, FLOOR, cz));
    const wallM = w => mat({ map: tileT, rep: [w / 1.5, dep / 1.5], unlit: 0.45 });
    G.add(at(new THREE.Mesh(new THREE.PlaneGeometry(W, dep), wallM(W)), 0, FLOOR / 2, Z[0]));
    G.add(rot(at(new THREE.Mesh(new THREE.PlaneGeometry(W, dep), wallM(W)), 0, FLOOR / 2, Z[1]), 0, PI, 0));
    G.add(rot(at(new THREE.Mesh(new THREE.PlaneGeometry(D, dep), wallM(D)), X[0], FLOOR / 2, cz), 0, PI / 2, 0));
    G.add(rot(at(new THREE.Mesh(new THREE.PlaneGeometry(D, dep), wallM(D)), X[1], FLOOR / 2, cz), 0, -PI / 2, 0));
    for (const [x, z, ry] of [[-3.5, Z[1] - 0.02, PI], [3.5, Z[1] - 0.02, PI], [-3.5, Z[0] + 0.02, 0], [3.5, Z[0] + 0.02, 0], [X[0] + 0.02, -8.5, PI / 2], [X[1] - 0.02, -8.5, -PI / 2]]) {
      G.add(rot(at(box(0.5, 0.2, 0.04, glow(0xcaffff)), x, -0.55, z), 0, ry, 0));
    }
    const waterT = tex(32, 32, (x, r) => {
      px(x, '#1ec8d8', 0, 0, 32, 32); noise(x, r, 32, 32, ['#22d0de', '#18bccc'], 60);
      for (let i = 0; i < 9; i++) { const y0 = Math.floor(r() * 32), x0 = Math.floor(r() * 26); px(x, '#8af4f4', x0, y0, 6, 1); px(x, '#8af4f4', x0 + 5, y0 + 1, 3, 1); }
      selfLit(x, 32, 32);
    }, 1303);
    const waterM = mat({ map: waterT, rep: [W / 2.2, D / 2.2], unlit: 0.8, see: 0.22 });
    const waterGeo = new THREE.PlaneGeometry(W, D, 28, 26), water = new THREE.Mesh(waterGeo, waterM);
    water.rotation.x = -PI / 2; water.position.set(0, WATER, cz); G.add(water);
    const wpos = waterGeo.attributes.position, wz = Float32Array.from({ length: wpos.count }, (_, i) => cz - wpos.getY(i));
    const WAVE_L = 4.2, WAVE_T = 1.6;
    const waveY = (z, t, A) => A * Math.sin(TAU * (z / WAVE_L - t / WAVE_T));   // the waves run towards +z (the tower)
    // the wave machine's grey wall at the far end, vents, a WAVES sign
    G.add(at(box(W + 0.8, 0.7, 0.6, M(0xb4c0d0)), 0, 0.35, Z[0] - 0.7));   // low: a tall dark wall hid the podiums and the bar behind it
    for (let i = 0; i < 6; i++) G.add(at(box(1.4, 0.3, 0.05, M(0x3a4a60)), -5.5 + i * 2.2, 0.35, Z[0] - 0.38));
    G.add(at(box(2.4, 0.5, 0.05, mat({ map: sign('WAVES', '#1a6ae8', '#ffffff', 64, 16), unlit: 0.8 })), 0, 0.95, Z[0] - 0.62));
    // ---------------- the lifeguard tower ----------------
    const [tx, tz] = TOWER, white = M(0xf4f4f0), red = M(0xe8243a);
    const legs = [];
    for (const [dx, dz] of [[-0.42, -0.42], [0.42, -0.42], [-0.42, 0.42], [0.42, 0.42]]) legs.push(at(new THREE.Mesh(new THREE.BoxGeometry(0.08, PLAT, 0.08)), tx + dx, PLAT / 2, tz + dz));
    for (const s of [-1, 1]) {
      legs.push(rot(at(new THREE.Mesh(new THREE.BoxGeometry(0.05, 1.2, 0.05)), tx + s * 0.42, PLAT * 0.45, tz), 0.9, 0, 0));
      legs.push(rot(at(new THREE.Mesh(new THREE.BoxGeometry(0.05, 1.2, 0.05)), tx, PLAT * 0.45, tz - s * 0.42), 0, 0, 0.9));
    }
    G.add(merged(legs, white));
    G.add(at(box(1.05, 0.08, 1.05, M(0xd8d4c8)), tx, PLAT - 0.04, tz));
    G.add(at(box(1.05, 0.06, 0.06, red), tx, PLAT + 0.03, tz - 0.5)); G.add(at(box(1.05, 0.06, 0.06, red), tx, PLAT + 0.03, tz + 0.5));   // an open platform, a red edge: side rails stood where the swimmers show in his selfies
    G.add(at(box(1.05, 0.32, 0.04, mat({ map: sign('LIFEGUARD', '#e8243a', '#ffffff', 96, 16), unlit: 0.6 })), tx, PLAT - 0.26, tz - 0.53));
    const rungs = [];
    for (let i = 0; i < 5; i++) rungs.push(at(new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.04, 0.05)), tx, 0.28 + i * 0.28, tz + 0.95 - i * 0.09));
    for (const s of [-1, 1]) rungs.push(rot(at(new THREE.Mesh(new THREE.BoxGeometry(0.05, 1.65, 0.05)), tx + s * 0.26, PLAT / 2, tz + 0.78), -0.3, 0, 0));
    G.add(merged(rungs, white));
    const buoy = new THREE.Group();
    for (let i = 0; i < 4; i++) { const q = new THREE.Mesh(new THREE.TorusGeometry(0.26, 0.08, 5, 4, TAU / 4), i % 2 ? white : red); q.rotation.z = i * TAU / 4; buoy.add(q); }
    buoy.rotation.y = PI / 2; buoy.position.set(tx + 0.56, 0.95, tz); G.add(buoy);
    G.add(at(box(0.05, 3.2, 0.05, white), X[1] + 0.9, 1.6, Z[1] + 0.9));   // the red flag on the pool's corner (on the tower it stood by his head in the selfie)
    const flag = at(box(0.6, 0.38, 0.02, red), X[1] + 1.21, 3.0, Z[1] + 0.9); G.add(flag);
    // ---------------- the slides: two tubes spiralling down a yellow tower, green light rings, into the far left corner ----------------
    const slideTower = new THREE.Group(), yel = M(0xffc21f);
    const ST = [-11.2, -20.5], SH = 6.4;
    for (const [dx, dz] of [[-0.9, -0.9], [0.9, -0.9], [-0.9, 0.9], [0.9, 0.9]]) slideTower.add(at(box(0.18, SH, 0.18, yel), ST[0] + dx, SH / 2, ST[1] + dz));
    slideTower.add(at(box(2.2, 0.15, 2.2, yel), ST[0], SH, ST[1])); slideTower.add(at(box(2.2, 1.0, 0.06, M(0x2a6ae8)), ST[0], SH + 0.5, ST[1] + 1.1));
    slideTower.add(at(box(2.6, 0.6, 0.06, mat({ map: sign('SPLASH', '#ff5fa2', '#ffffff', 64, 16), unlit: 0.8 })), ST[0], SH + 1.5, ST[1] + 1.14));
    G.add(slideTower);
    const greens = [], _y = new THREE.Vector3(0, 1, 0), _ring = new THREE.Quaternion().setFromEuler(new THREE.Euler(PI / 2, 0, 0));
    function helix(cx, cz0, r, y0, y1, a0, turns, exit, col) {
      const pts = [], n = Math.round(turns * 18);
      for (let i = 0; i <= n; i++) { const a = a0 + i / n * turns * TAU; pts.push(new THREE.Vector3(cx + Math.cos(a) * r, y0 + (y1 - y0) * i / n, cz0 + Math.sin(a) * r)); }
      const last = pts[pts.length - 1], m = 6;
      for (let i = 1; i <= m; i++) pts.push(new THREE.Vector3(last.x + (exit[0] - last.x) * i / m, last.y + (exit[1] - last.y) * i / m, last.z + (exit[2] - last.z) * i / m));
      const parts = [];
      for (let i = 0; i + 1 < pts.length; i++) {
        const a = pts[i], b = pts[i + 1], d = b.clone().sub(a), seg = new THREE.Mesh(new THREE.CylinderGeometry(0.46, 0.46, d.length() + 0.06, 8));
        seg.position.copy(a).add(b).multiplyScalar(0.5); seg.quaternion.setFromUnitVectors(_y, d.normalize()); parts.push(seg);
        if (i % 4 === 2) { const rg = new THREE.Mesh(new THREE.TorusGeometry(0.5, 0.05, 4, 10)); rg.position.copy(seg.position); rg.quaternion.copy(seg.quaternion).multiply(_ring); greens.push(rg); }
      }
      G.add(merged(parts, M(col)));
    }
    helix(ST[0], ST[1], 2.1, SH - 0.3, 1.2, 0.2, 1.6, [SLIDE_EXIT[0], 0.25, SLIDE_EXIT[1]], 0x2a8ae8);
    helix(ST[0] - 0.2, ST[1] - 0.2, 3.2, SH - 0.6, 1.6, 2.6, 1.2, [-9.5, 0.4, -14.0], 0xffc21f);
    const greenM = glow(0x5aff7a); G.add(merged(greens, greenM));
    // ---------------- palms, string lights over the water ----------------
    const bark = tex(8, 16, x => { px(x, '#8a5a2e', 0, 0, 8, 16); for (let y = 0; y < 16; y += 3) px(x, '#5e3b1c', 0, y, 8, 1); }, 1304);
    const barkM = mat({ map: bark }), leafM = M(0x2f8f3a, { side: THREE.DoubleSide }), leafM2 = M(0x3fae47, { side: THREE.DoubleSide }), crowns = [];
    const PALMS = [[-9.2, 1.5, 0.25, 8], [9.6, 1.2, -0.3, 9], [-12.5, -8.5, 0.15, 8], [11.5, -9.5, -0.2, 9], [-8.8, -24, 0.2, 9], [8.6, -23.5, -0.25, 8], [4.8, -26.5, 0.1, 10], [14.5, 3.5, -0.2, 7]];
    const tops = [];
    for (const [x, z, lean, h] of PALMS) {
      const p = new THREE.Group(); let top = new THREE.Group(); p.add(top);
      for (let i = 0; i < h; i++) {
        const seg = new THREE.Mesh(new THREE.CylinderGeometry(0.16 - i * 0.008, 0.2 - i * 0.008, 0.6, 5), barkM); seg.position.y = 0.3; top.add(seg);
        const next = new THREE.Group(); next.position.y = 0.6; next.rotation.z = lean / h * 2; top.add(next); top = next;
      }
      const crown = new THREE.Group(); top.add(crown);
      for (let i = 0; i < 7; i++) { const lf = new THREE.Group(); lf.rotation.y = i / 7 * TAU; crown.add(lf); const blade = box(1.8, 0.02, 0.45, i % 2 ? leafM : leafM2); blade.position.x = 0.85; blade.rotation.z = -0.45; lf.add(blade); }
      p.position.set(x, 0, z); G.add(p); crowns.push(crown); tops.push([x, h * 0.6 - 0.2, z]);
    }
    const bulbsA = [], bulbsB = [], wires = [];
    for (const [a, b] of [[0, 4], [1, 5], [0, 1], [2, 3]]) {
      const [x0, y0, z0] = tops[a], [x1, y1, z1] = tops[b];
      const N = 44, pos = u => [x0 + (x1 - x0) * u, y0 + (y1 - y0) * u - Math.sin(u * PI) * 1.4, z0 + (z1 - z0) * u];
      for (let i = 1; i < N; i++) {
        const [x, y, z] = pos(i / N), [xn, yn, zn] = pos((i + 1) / N), d = Math.hypot(xn - x, yn - y, zn - z);
        (i % 2 ? bulbsA : bulbsB).push(at(new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.09, 0.09)), x, y - 0.06, z));
        const w = new THREE.Mesh(new THREE.BoxGeometry(0.018, d, 0.018)); w.position.set((x + xn) / 2, (y + yn) / 2, (z + zn) / 2);
        w.quaternion.setFromUnitVectors(_y, new THREE.Vector3(xn - x, yn - y, zn - z).normalize()); wires.push(w);
      }
    }
    const bulbMA = glow(0xffd43b), bulbMB = glow(0xff5fa2); G.add(merged(bulbsA, bulbMA)); G.add(merged(bulbsB, bulbMB)); G.add(merged(wires, M(0x1a1a22)));
    // ---------------- the far side: the tiki bar, three podiums under UV light ----------------
    const straw = tex(16, 16, (x, r) => { px(x, '#c8a050', 0, 0, 16, 16); for (let X0 = 0; X0 < 16; X0 += 2) px(x, '#a8803a', X0, 0, 1, 16); noise(x, r, 16, 16, ['#c09448', '#d4ac5c'], 30); }, 1305);
    const bamboo = M(0xb8904a);
    G.add(at(box(4.2, 1.0, 0.8, bamboo), BAR[0], 0.5, BAR[1])); G.add(at(box(4.4, 0.08, 1.0, M(0x6a4a2a)), BAR[0], 1.04, BAR[1]));
    for (const [dx, dz] of [[-2.1, -0.6], [2.1, -0.6], [-2.1, 1.0], [2.1, 1.0]]) G.add(at(box(0.12, 2.6, 0.12, bamboo), BAR[0] + dx, 1.3, BAR[1] + dz));
    const roof = new THREE.Mesh(new THREE.ConeGeometry(3.4, 1.3, 4), mat({ map: straw, rep: [4, 2] })); roof.rotation.y = PI / 4; roof.scale.set(1, 1, 0.62); G.add(at(roof, BAR[0], 3.2, BAR[1] + 0.2));
    for (let i = 0; i < 5; i++) G.add(at(cyl(0.05, 0.06, 0.18, 6, glow(PARTY[i])), BAR[0] - 1.6 + i * 0.8, 1.17, BAR[1] - 0.1));
    const podM = [], uv = [];
    for (const [x, z] of PODIUMS) {
      G.add(at(cyl(0.72, 0.8, PODIUM_Y, 12, M(0x1a2a6a)), x, PODIUM_Y / 2, z));
      const rim = glow(0x9a6aff); podM.push(rim); G.add(at(cyl(0.74, 0.74, 0.06, 12, rim), x, PODIUM_Y, z));
    }
    for (let i = 0; i < 4; i++) { const m = glow(0x8a4aff); uv.push(m); G.add(at(box(0.08, 2.6, 0.08, m), -5.2 + i * 3.47, 1.3, -20.4)); }
    // ---------------- Kob's lounger and parasol; the foam cannons ----------------
    const [lx, lz] = LOUNGER;
    G.add(at(box(0.7, 0.06, 1.3, M(0xf4f4f0)), lx, LOUNGE_Y - 0.12, lz + 0.25)); G.add(at(box(0.66, 0.08, 1.25, M(0xff8ac0)), lx, LOUNGE_Y - 0.05, lz + 0.25));
    G.add(rot(at(box(0.66, 0.08, 0.7, M(0xff8ac0)), lx, LOUNGE_Y + 0.22, lz + 1.1), -1.0, 0, 0));
    for (const [dx, dz] of [[-0.3, -0.35], [0.3, -0.35], [-0.3, 0.85], [0.3, 0.85]]) G.add(at(box(0.05, LOUNGE_Y - 0.12, 0.05, M(0xf4f4f0)), lx + dx, (LOUNGE_Y - 0.12) / 2, lz + dz));
    G.add(at(box(0.05, 2.5, 0.05, white), lx + 0.7, 1.25, lz + 0.9));
    const para = new THREE.Group();
    for (let i = 0; i < 8; i++) para.add(new THREE.Mesh(new THREE.ConeGeometry(1.4, 0.5, 8, 1, true, i / 8 * TAU, TAU / 8), M(i % 2 ? 0xffffff : 0x2ab8e8, { side: THREE.DoubleSide })));
    para.position.set(lx + 0.7, 2.55, lz + 0.9); G.add(para);
    G.add(at(box(0.45, 0.45, 0.45, M(0x3a3a44)), lx - 1.0, 0.22, lz + 0.2)); G.add(at(cyl(0.16, 0.16, 0.06, 8, M(0xff9a3c)), lx - 1.0, 0.48, lz + 0.2));   // a side table, a drink
    for (const [x, z] of CANNONS) {
      const c = new THREE.Group(); c.add(at(box(0.08, 1.0, 0.08, M(0x3a3a44)), 0, 0.5, 0)); c.add(rot(at(cyl(0.28, 0.34, 1.1, 8, M(0xd8dce4)), 0, 1.15, 0.2), 1.1, 0, 0));
      c.position.set(x, 0, z); c.rotation.y = Math.atan2(TOWER[0] + 1.2 - x, TOWER[1] + 2.6 - z); G.add(c);
    }
    const foamM = mat({ color: 0xf8fbff, unlit: 0.55 }), foamBits = [];
    for (let i = 0; i < 110; i++) { const b = new THREE.Mesh(new THREE.IcosahedronGeometry(0.08 + hash(i, 1306) * 0.1, 1), foamM); b.visible = false; G.add(b); foamBits.push(b); }
    const foamBed = new THREE.Group();
    for (let i = 0; i < 36; i++) {
      const b = new THREE.Mesh(new THREE.IcosahedronGeometry(1, 1), foamM), a = hash(i, 1307) * TAU, d = Math.sqrt(hash(i, 1308)) * 5.5;
      b.position.set(4.4 + Math.cos(a) * d * 1.2, 0, 3.7 + Math.sin(a) * d * 0.42); b.scale.set(1.2 + hash(i, 1309), 1, 1.0 + hash(i, 1310)); foamBed.add(b);
    }
    foamBed.visible = false; G.add(foamBed);
    // ---------------- the pets: in the water, on rings, on the podiums, at the bar ----------------
    const swim = [[-4.5, -6.5], [-1.8, -9.5], [0.8, -5.5], [4.6, -8.2], [-5.2, -11.2], [2.2, -12.0], [5.6, -4.2], [-2.6, -3.6], [3.8, -13.4]].map(([x, z], i) => {
      const p = pet(i + 20); p.g.position.set(x, FLOOR + 0.2, z); p.g.rotation.y = hash(i, 1311) * 1.2 - 0.6; G.add(p.g); return { p, x, z, inWater: true, yaw: p.g.rotation.y };
    });
    const rings = [[-3.4, -7.8, 0xff8ac0], [1.9, -8.6, 0x3fd4ff], [-0.4, -12.6, 0xffd43b], [5.2, -10.8, 0x6bd46b]].map(([x, z, col], i) => {
      const r = ring(col); r.position.set(x, WATER + 0.05, z); G.add(r);
      const p = pet(i + 40); p.g.position.set(x, WATER - 0.26, z); p.g.rotation.y = hash(i, 1312) - 0.5; G.add(p.g);
      return { p, x, z, r, inWater: true, yaw: p.g.rotation.y };
    });
    const podPets = PODIUMS.map(([x, z], i) => { const p = pet(i + 60); p.g.position.set(x, PODIUM_Y, z); G.add(p.g); return { p, x, z, yaw: 0 }; });
    const deckPets = [[-1.4, -21.4], [1.4, -21.5], [-6.0, -17.5], [6.2, -17.2], [-9.0, -3.0], [8.4, -4.0], [-4.2, 2.8], [8.2, 0.6]].map(([x, z], i) => {
      const p = pet(i + 80); p.g.position.set(x, 0, z); p.g.rotation.y = Math.atan2(0 - x, -8 - z); G.add(p.g); return { p, x, z, yaw: p.g.rotation.y };
    });
    const guests = [...swim, ...rings, ...podPets, ...deckPets];
    // the slide rider: a pet shooting out of the tube every 2 bars (`riders`), a splash where it lands
    const rider = pet(99); rider.g.visible = false; G.add(rider.g);
    const splashM = mat({ color: 0xf2fcff, unlit: 0.9 });
    const dropM = mat({ color: 0xcaf4ff, unlit: 0.9 });
    const splashes = [0, 1, 2].map(() => {
      const q = new THREE.Group();
      for (let i = 0; i < 12; i++) q.add(new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), splashM));
      q.add(new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.42, 1, 7), mat({ color: 0xeafaff, unlit: 0.9, see: 0.4 })));
      for (let i = 0; i < 46; i++) q.add(new THREE.Mesh(new THREE.IcosahedronGeometry(0.5, 0), i % 3 ? dropM : splashM));
      q.visible = false; G.add(q); return q;
    });
    function splashFx(q, x, y, z, k, big) {   // k: seconds since the impact; big: its size
      q.visible = k >= 0 && k < 0.9; if (!q.visible) return;
      q.position.set(x, y, z);
      const rb = Math.sqrt(big);
      q.children.forEach((b, i) => {
        if (i < 12) { const a = i / 12 * TAU, rr = (0.25 + k * 1.6) * rb; b.position.set(Math.cos(a) * rr, 0.03, Math.sin(a) * rr); b.scale.set(0.3 * rb, 0.06, 0.3 * rb).multiplyScalar(Math.max(0.05, 1 - k / 0.9)); return; }
        if (i === 12) { const hgt = 1.4 * rb * Math.sin(Math.min(1, k / 0.6) * PI); b.visible = hgt > 0.02; b.position.set(0, hgt / 2, 0); b.scale.set(rb * (0.8 + 0.8 * k), Math.max(0.01, hgt), rb * (0.8 + 0.8 * k)); return; }
        const a = (i - 13) / 46 * TAU * 5, v = (2.0 + 1.6 * hash(i, 1313)) * rb, sp = (0.35 + 1.1 * hash(i, 1314)) * rb;
        b.position.set(Math.cos(a) * sp * (0.25 + k), v * k - 4.9 * k * k, Math.sin(a) * sp * (0.25 + k));
        b.scale.setScalar(Math.max(0.01, (0.06 + 0.06 * hash(i, 1315)) * rb * (1 - k / 0.9)));
      });
    }
    const thrashes = [0, 1].map(() => { const q = new THREE.Group(); for (let i = 0; i < 12; i++) q.add(new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), splashM)); q.add(new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.42, 1, 7), mat({ color: 0xeafaff, unlit: 0.9, see: 0.4 }))); for (let i = 0; i < 46; i++) q.add(new THREE.Mesh(new THREE.IcosahedronGeometry(0.5, 0), i % 3 ? dropM : splashM)); q.visible = false; G.add(q); return q; });
    const islands = []; for (let i = 0; i < 48; i++) { const m = new THREE.Mesh(new THREE.IcosahedronGeometry(1, 1), foamM); const x = -4.8 + hash(i, 1322) * 11.4, z = -2.6 - hash(i, 1323) * 7.4, big = i >= 26 ? 1.5 : 1; m.scale.set((0.35 + hash(i, 1324) * 0.5) * big, 0.16, (0.3 + hash(i, 1325) * 0.45) * big); m.visible = false; G.add(m); islands.push([m, x, z, hash(i, 1326)]); }
    const sky = grad([[0, '#05081a'], [0.55, '#141a48'], [1, '#3a2458']]);
    const starDome = stars(160, 150, 1316); starDome.material.uniforms.uNoFog.value = 1; G.add(starDome);

    return {
      group: G, sky, shadowCol: 0x8a8478,
      light() {
        lights(0x3a4064, 0x9aa8d8, [0.35, -1, 0.45], 0x0c1030, [22, 80], 9);
        pt(0, TOWER[0], 0.4, TOWER[1] - 2.6, 0.2, 0.5, 0.55); pt(1, 0, 2.6, -18.6, 0.42, 0.18, 0.66); pt(2, LOUNGER[0], 2.6, LOUNGER[1] + 1.5, 0.3, 0.28, 0.34); pt(3, -3.5, 1.2, -8, 0.12, 0.4, 0.45);
      },
      anim(t, P = {}) {
        const b = beat(t), bi = Math.floor(b), h = hit(t), c = P.t0 != null ? t - P.t0 : 0;
        // the water: its caustics drift; waves from the machine when asked
        waterM.uniforms.uOff.value.set(t * 0.05, t * 0.08);
        const A = P.waves ? P.waves * sm((c - (P.waveAt || 0)) / 1.0) : 0.03;
        for (let i = 0; i < wpos.count; i++) wpos.setZ(i, waveY(wz[i], t, A) + 0.012 * Math.sin(t * 2.1 + i * 0.7));
        wpos.needsUpdate = true;
        // lights on the beat: string lights swap, the podium rims and the UV bars pulse, the slides' rings glow
        bulbMA.uniforms.uCol.value.set(0xffd43b).multiplyScalar(bi % 2 ? 1 : 0.45); bulbMB.uniforms.uCol.value.set(0xff5fa2).multiplyScalar(bi % 2 ? 0.45 : 1);
        podM.forEach((m, i) => m.uniforms.uCol.value.set(PARTY[pmod(bi + i, 5)]).multiplyScalar(0.7 + 0.5 * h));
        uv.forEach(m => m.uniforms.uCol.value.set(0x8a4aff).multiplyScalar(0.6 + 0.6 * h));
        greenM.uniforms.uCol.value.set(0x5aff7a).multiplyScalar(0.75 + 0.35 * h);
        crowns.forEach((cr, i) => { cr.rotation.z = 0.05 * Math.sin(t * 1.2 + i); cr.rotation.x = 0.04 * Math.sin(t * 0.8 + i * 2); });
        flag.rotation.y = 0.25 * Math.sin(t * 3.1); flag.scale.x = 0.9 + 0.1 * Math.sin(t * 5.3);
        // the pets: they bob on the beat (in the water with the waves too), film with `phones`, stare at `stare`
        const film = !!P.phones, wet = guests.filter(q => q.inWater);
        guests.forEach((q, i) => {
          let { p, x, z } = q;
          if (P.gather && q.inWater) {   // the swimmers crowd round on an arc, facing its centre
            const [gx, gz, gr, a0, a1] = P.gather, j = wet.indexOf(q), a = (a0 + (a1 - a0) * j / Math.max(1, wet.length - 1) + (hash(j, 1321) - 0.5) * 6) * PI / 180, rr = gr + (j % 2) * 0.7;
            x = gx + Math.sin(a) * rr; z = gz + Math.cos(a) * rr; p.g.position.x = x; p.g.position.z = z; if (q.r) { q.r.position.x = x; q.r.position.z = z; }
          } else if (q.inWater) { p.g.position.x = x; p.g.position.z = z; if (q.r) { q.r.position.x = x; q.r.position.z = z; } }
          const show = !P.noguests && !(q.inWater && P.noPool) && !cleared(P, x, z);
          p.g.visible = show; if (q.r) q.r.visible = show;
          if (!show) return;
          const bb = b + i * 0.23, wv = q.inWater ? waveY(z, t, A) : 0;
          if (q.r) { q.r.position.y = WATER + 0.05 + wv; p.g.position.y = WATER - 0.26 + wv; } else if (q.inWater) p.g.position.y = FLOOR + 0.2 + wv * 0.9;
          p.body.position.y = film ? 0 : 0.06 * Math.abs(Math.sin(bb * PI)); p.body.rotation.z = film ? 0 : 0.14 * Math.sin(bb * PI);
          const look = P.stare || (P.gather && q.inWater ? P.gather : null);
          p.g.rotation.y = look ? Math.atan2(look[0] - x, look[1] - z) : q.yaw;
          p.head.rotation.set(film ? 0.15 : 0, P.stare || film ? 0 : 0.25 * Math.sin(bb * 0.5 * PI), 0); p.phone.visible = film;
        });
        // the slide rider every 2 bars
        rider.g.visible = false;
        if ((P.riders || P.rider) && !P.noguests) {
          const n = Math.floor(b / 8), ex = SLIDE_EXIT, fly = P.rider ? 0.8 : 0.55;
          const u = P.rider ? c - P.rider[0] : (b - n * 8) * (60 / 128), to = P.rider ? [P.rider[1], P.rider[2]] : [ex[0] + 2.4, ex[1] + 1.6];
          if (u < fly) {
            const s = u / fly; rider.g.visible = true;
            rider.g.position.set(ex[0] + (to[0] - ex[0]) * s, 0.3 + (P.rider ? 1.4 : 1.1) * Math.sin(s * PI) + (WATER - 0.3) * s, ex[1] + (to[1] - ex[1]) * s);
            rider.g.rotation.set(-0.6 + s * 1.2, Math.atan2(to[0] - ex[0], to[1] - ex[1]), 0);
          }
          if (u >= 0) splashFx(splashes[2], to[0], WATER, to[1], u - fly, P.rider ? 0.9 : 0.6); else splashes[2].visible = false;
        } else splashes[2].visible = false;
        // big splashes (a body falling in)
        const sp = P.splash ? (Array.isArray(P.splash[0]) ? P.splash : [P.splash]) : [];
        splashes.slice(0, 2).forEach((q, i) => { if (sp[i]) splashFx(q, sp[i][0], WATER, sp[i][1], c - sp[i][2], sp[i][3] || 1.3); else q.visible = false; });
        // a swimmer in trouble: small splashes round her on every half beat, alternating sides
        const th = P.thrash || [];
        thrashes.forEach((q, i) => {
          const pt0 = th[i]; if (!pt0) { q.visible = false; return; }
          const per = 60 / 128 / 2, k = ((c + i * per * 0.5) % per + per) % per, n = Math.floor((c + i * per * 0.5) / per), sd = n % 2 ? 1 : -1;
          splashFx(q, pt0[0] + sd * 0.24, WATER, pt0[1] + 0.12 * (n % 3 - 1), k * 1.4, 0.55);   // on her, not beside her (the reviewer)
        });
        // foam islands drifting on the water behind the tower, more of them as the night goes on, riding the waves
        const fp = P.foamPool || 0;
        islands.forEach(([m, x, z, r], i) => { m.visible = i < Math.round(fp * islands.length) && !cleared(P, x, z); if (!m.visible) return; m.position.set(x + 0.3 * Math.sin(t * 0.3 + r * 6), WATER + 0.04 + waveY(z, t, A), z); m.rotation.y = r * 6 + t * 0.1; });
        // the foam party: the cannons blast foam over the deck, which piles up round the tower and the lounger
        const fOn = P.foam != null && P.foam !== false, fc = c - (P.foam === true ? -99 : +P.foam || 0);
        foamBits.forEach((m, i) => {
          if (!fOn || fc < 0) { m.visible = false; return; }
          const cn = CANNONS[i % 2], life = 1.2, age = ((fc + hash(i, 1317) * life) % life) / life;
          const aim = [TOWER[0] + 1.2 + (hash(i, 1318) - 0.5) * 5, TOWER[1] + 2.6 + (hash(i, 1319) - 0.5) * 3];
          m.visible = fc > age * life * 0.2;
          m.position.set(cn[0] + (aim[0] - cn[0]) * age, 1.4 + 2.6 * Math.sin(age * PI) - 1.2 * age, cn[1] + (aim[1] - cn[1]) * age); m.rotation.set(t * 2 + i, i, 0);
        });
        foamBed.visible = fOn && fc > 0;
        if (foamBed.visible) { const fy = (P.foamY ?? 0.85) * sm(fc / 3.2); foamBed.children.forEach((m, i) => { m.scale.y = Math.max(0.02, fy * (0.75 + 0.4 * hash(i, 1320)) + 0.04 * Math.sin(t * 2 + i)); }); }
      },
    };
  }
  return { pool: pool() };
}
