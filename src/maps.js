// maps.js: the extra PS1 maps (club, stadium, moon, highway, rooftop, western town). Each is built from primitives and
// tiny canvas textures, and animates as a pure function of t, mostly on the beat. Saxo stands at the origin facing +z.
// A map is { group, sky, shadowCol, indoor?, light(), anim(t) }: light() sets the shared uniforms, anim(t) runs after
// it (so it may override the point lights). `indoor` maps keep the camera within ~8 m.
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

export function buildMoreMaps(K) {
  const { THREE, mat, tex, px, noise, box, selfLit, U, TAU, beat } = K;
  const hash = (a, b = 0, c = 0) => { const x = Math.sin(a * 127.1 + b * 311.7 + c * 74.7) * 43758.5453; return x - Math.floor(x); };
  const hit = t => Math.exp(-(beat(t) - Math.floor(beat(t))) * 5);          // 1 on each beat, decaying
  const beatN = t => Math.floor(beat(t));
  const grad = (stops) => tex(4, 64, x => { const g = x.createLinearGradient(0, 0, 0, 64); stops.forEach(([o, c]) => g.addColorStop(o, c)); x.fillStyle = g; x.fillRect(0, 0, 4, 64); });
  const sign = (text, bg, fg, w = 64, h = 16) => tex(w, h, x => { px(x, bg, 0, 0, w, h); x.fillStyle = fg; x.font = `bold ${h - 4}px monospace`; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(text, w / 2, h / 2 + 1); });
  const cyl = (rt, rb, h, seg, m) => new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), m);
  const at = (o, x, y, z) => { o.position.set(x, y, z); return o; };
  const merged = (parts, m) => new THREE.Mesh(mergeGeometries(parts.map(o => { o.updateMatrix(); return o.geometry.clone().applyMatrix4(o.matrix); })), m);
  const people = (seed, w = 64, h = 16) => tex(w, h, (x, r) => {       // a strip of pixel spectators
    px(x, '#1d1b26', 0, 0, w, h);
    for (let i = 0; i < w; i += 4) { const c = ['#e84a4a', '#f2c94c', '#4a8fe8', '#f2f2f2', '#6bd46b', '#e87bd0', '#ff9a3c'][Math.floor(r() * 7)]; px(x, c, i, 7, 3, 9); px(x, ['#f1c9a0', '#c98b5a', '#7a4a2a'][Math.floor(r() * 3)], i + 0.5, 3, 2, 3); }
  }, seed);
  const figure = (col, s = 1) => { const g = new THREE.Group(); g.add(at(box(0.45 * s, 0.8 * s, 0.3 * s, mat({ color: col })), 0, 0.75 * s, 0)); g.add(at(box(0.3 * s, 0.3 * s, 0.3 * s, mat({ color: 0xe0b48a })), 0, 1.35 * s, 0)); for (const sx of [-1, 1]) g.add(at(box(0.16 * s, 0.4 * s, 0.16 * s, mat({ color: 0x2a2a38 })), sx * 0.12 * s, 0.2 * s, 0)); return g; };
  const facade = (base, seed, lit = 0.45) => tex(32, 32, (x, r) => {
    px(x, base, 0, 0, 32, 32); noise(x, r, 32, 32, ['rgba(0,0,0,.18)', 'rgba(255,255,255,.08)'], 120);
    for (let yy = 3; yy < 30; yy += 9) for (let xx = 3; xx < 30; xx += 8) { const on = r() < lit; x.fillStyle = on ? 'rgba(255,214,120,0.8)' : '#1c2233'; x.fillRect(xx, yy, 5, 6); }
    selfLit(x, 32, 32);
  }, seed);
  const car = (col) => {
    const c = new THREE.Group(), body = mat({ color: col }), glass = mat({ color: 0x1b2433 }), tyre = mat({ color: 0x111111 });
    c.add(at(box(1.7, 0.5, 3.6, body), 0, 0.45, 0)); c.add(at(box(1.5, 0.45, 1.9, glass), 0, 0.92, -0.2));
    for (const [x, z] of [[-0.8, 1.1], [0.8, 1.1], [-0.8, -1.2], [0.8, -1.2]]) { const w = cyl(0.3, 0.3, 0.2, 8, tyre); w.rotation.z = Math.PI / 2; c.add(at(w, x, 0.3, z)); }
    for (const sx of [-0.6, 0.6]) { c.add(at(box(0.3, 0.14, 0.05, mat({ color: 0xfff4c0, unlit: 1 })), sx, 0.55, 1.81)); c.add(at(box(0.3, 0.12, 0.05, mat({ color: 0xff2020, unlit: 1 })), sx, 0.55, -1.81)); }
    return c;
  };
  const noLights = () => U.uPtCol.value.forEach(c => c.setRGB(0, 0, 0));

  // ---------- disco club: tiles light up on the beat, a mirror ball, coloured lights circling, a bouncing crowd ----------
  function club() {
    const G = new THREE.Group(), N = 10, S = 1.6, tiles = [];
    for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) { const m = mat({ color: 0x222222, unlit: 1 }); const t = at(box(S - 0.06, 0.05, S - 0.06, m), (i - N / 2 + 0.5) * S, -0.026, (j - N / 2 + 0.5) * S); G.add(t); tiles.push([t, i, j]); }   // tile tops flush with y = 0 so his shadow shows
    const wallT = tex(16, 16, (x, r) => { px(x, '#1a0f2e', 0, 0, 16, 16); noise(x, r, 16, 16, ['#24163f', '#130a22'], 60); px(x, '#ff3fa4', 0, 6, 16, 1); px(x, '#3fd4ff', 0, 9, 16, 1); }, 71);
    for (const [x, z, ry] of [[0, -8, 0], [0, 8, Math.PI], [-8, 0, Math.PI / 2], [8, 0, -Math.PI / 2]]) { const w = new THREE.Mesh(new THREE.PlaneGeometry(16, 7), mat({ map: wallT, rep: [8, 3] })); w.rotation.y = ry; G.add(at(w, x, 3.5, z)); }
    const ceil = new THREE.Mesh(new THREE.PlaneGeometry(16, 16), mat({ color: 0x0c0714 })); ceil.rotation.x = Math.PI / 2; G.add(at(ceil, 0, 7, 0));
    const ballT = tex(16, 16, (x, r) => { for (let i = 0; i < 16; i += 2) for (let j = 0; j < 16; j += 2) px(x, ['#e8e8f0', '#9a9aa8', '#ffffff', '#6a6a78'][Math.floor(r() * 4)], i, j, 2, 2); }, 72);
    const ball = at(new THREE.Mesh(new THREE.IcosahedronGeometry(0.7, 1), mat({ map: ballT, unlit: 1, rep: [3, 3] })), 0, 5.2, -1); G.add(ball);
    G.add(at(cyl(0.02, 0.02, 1.8, 3, mat({ color: 0x555555 })), 0, 6.1, -1));
    const spk = tex(8, 16, x => { px(x, '#111', 0, 0, 8, 16); x.fillStyle = '#444'; x.beginPath(); x.arc(4, 5, 3, 0, TAU); x.arc(4, 12, 2, 0, TAU); x.fill(); });
    const speakers = [];
    for (const sx of [-1, 1]) for (let k = 0; k < 2; k++) { const s = at(box(1.2, 1.6, 1, mat({ map: spk })), sx * 5.5, 0.8 + k * 1.6, -6.5); G.add(s); speakers.push(s); }
    G.add(at(box(3, 1.1, 1, mat({ map: sign('DJ SAXO', '#2a0a3a', '#ff4fb0') })), 0, 0.55, -6.6));
    const crowd = [];
    for (let k = 0; k < 16; k++) { const a = k / 16 * TAU + 0.2, r = 5 + hash(k) * 1.5; if (Math.cos(a) > 0.55) continue; const f = figure([0xe84a4a, 0x4a8fe8, 0xf2c94c, 0x9b59d0, 0x2ecc71][k % 5]); f.position.set(Math.sin(a) * r, 0, -Math.cos(a) * r * 0.9); f.rotation.y = -a + Math.PI; G.add(f); crowd.push([f, k]); }
    const PAL = [[1, 0.2, 0.6], [0.2, 0.8, 1], [1, 0.9, 0.2], [0.5, 1, 0.3], [0.8, 0.3, 1]];
    return {
      group: G, sky: grad([[0, '#05020a'], [1, '#12081e']]), shadowCol: 0x0a0610, indoor: true,
      light() { U.uAmb.value.set(0x302848); U.uDirCol.value.set(0x201830); U.uDirDir.value.set(0, -1, 0.2).normalize(); U.uFogCol.value.set(0x0c0616); U.uFog.value.set(8, 22); U.uPtRange.value = 8; },
      anim(t) {
        const n = beatN(t), h = hit(t);
        tiles.forEach(([m, i, j]) => { const on = hash(i, j, n) < 0.45, c = PAL[Math.floor(hash(j, i, n) * PAL.length)], k = on ? 0.35 + 0.65 * h : 0.08; m.material.uniforms.uCol.value.setRGB(c[0] * k, c[1] * k, c[2] * k); });
        ball.rotation.y = t * 0.9;
        for (let i = 0; i < 4; i++) { const a = t * 0.8 + i * TAU / 4, c = PAL[(((n + i) % PAL.length) + PAL.length) % PAL.length]; U.uPtPos.value[i].set(Math.sin(a) * 4, 3.2, Math.cos(a) * 4); U.uPtCol.value[i].setRGB(c[0] * (1 + h), c[1] * (1 + h), c[2] * (1 + h)); }
        speakers.forEach(s => s.scale.setScalar(1 + 0.05 * h));
        crowd.forEach(([f, k]) => { f.position.y = Math.abs(Math.sin((beat(t) + k * 0.13) * Math.PI)) * 0.25; f.rotation.z = 0.1 * Math.sin((beat(t) + k) * Math.PI); });
      },
    };
  }

  // ---------- stadium: striped pitch, stands whose crowd bounces in a wave, floodlights, falling confetti ----------
  function stadium() {
    const G = new THREE.Group();
    const pitchT = tex(32, 32, (x, r) => { for (let i = 0; i < 32; i += 8) { px(x, '#2f9a3c', i, 0, 4, 32); px(x, '#3aae48', i + 4, 0, 4, 32); } noise(x, r, 32, 32, ['#2a8a35', '#45ba52'], 80); }, 81);
    const pitch = new THREE.Mesh(new THREE.PlaneGeometry(70, 46), mat({ map: pitchT, rep: [9, 6] })); pitch.rotation.x = -Math.PI / 2; G.add(pitch);
    const line = mat({ color: 0xf2f2f2 });
    G.add(at(box(0.12, 0.01, 44, line), 0, 0.01, 0)); const circ = new THREE.Mesh(new THREE.RingGeometry(4.3, 4.45, 24), line); circ.rotation.x = -Math.PI / 2; G.add(at(circ, 0, 0.012, 0));
    for (const sz of [-1, 1]) G.add(at(box(66, 0.01, 0.12, line), 0, 0.01, sz * 22));
    const tiers = [];
    for (const [cx, cz, ry, len] of [[0, -27, 0, 74], [0, 27, Math.PI, 74], [-38, 0, Math.PI / 2, 50], [38, 0, -Math.PI / 2, 50]]) {
      const side = new THREE.Group(); side.position.set(cx, 0, cz); side.rotation.y = ry; G.add(side);
      for (let k = 0; k < 7; k++) {
        side.add(at(box(len, 1.2, 1.6, mat({ color: 0x3a3f4a })), 0, 0.6 + k * 1.2, -k * 1.6));
        const c = at(box(len, 0.9, 0.2, mat({ map: people(90 + k + cx, 64, 16), rep: [len / 4, 1] })), 0, 1.6 + k * 1.2, -k * 1.6 + 0.7); side.add(c); tiers.push([c, k, cx + cz]);
      }
    }
    const lamp = mat({ color: 0xfffbe0, unlit: 1 }), steel = mat({ color: 0x8a8f99 });
    for (const [x, z] of [[-34, -24], [34, -24], [-34, 24], [34, 24]]) { G.add(at(cyl(0.3, 0.4, 22, 5, steel), x, 11, z)); G.add(at(box(4, 2, 0.4, lamp), x * 0.97, 22, z * 0.97)); }
    G.add(at(box(8, 3.5, 0.4, mat({ map: sign('SAXO 1-0', '#101018', '#ffcc33', 64, 24), unlit: 1 })), 0, 13, -30));
    const conf = [], cols = [0xff4f6a, 0xffd23f, 0x3fb8ff, 0x7dff6a, 0xff8cf0, 0xffffff];
    for (let i = 0; i < 140; i++) { const m = new THREE.Mesh(new THREE.PlaneGeometry(0.14, 0.09), mat({ color: cols[i % cols.length], unlit: 1, side: THREE.DoubleSide })); G.add(m); conf.push(m); }
    return {
      group: G, sky: grad([[0, '#1a2a6c'], [0.6, '#4a5fa8'], [1, '#e8a86b']]), shadowCol: 0x1f5e26,
      light() { U.uAmb.value.set(0x8088a8); U.uDirCol.value.set(0xfff0d8); U.uDirDir.value.set(0.3, -1, -0.5).normalize(); U.uFogCol.value.set(0x6a78b0); U.uFog.value.set(30, 90); noLights(); },
      anim(t) {
        tiers.forEach(([c, k, s]) => { c.position.y = 1.6 + k * 1.2 + Math.max(0, Math.sin((beat(t) * 0.5 - k * 0.15 + s * 0.01) * TAU)) * 0.35; });
        conf.forEach((m, i) => { const r1 = hash(i, 1), r2 = hash(i, 2), fall = (t * (0.9 + r1 * 0.6) + r2 * 14) % 14; m.position.set((r1 - 0.5) * 22 + Math.sin(t * 2 + i) * 0.4, 14 - fall, (r2 - 0.5) * 22); m.rotation.set(t * 3 + i, t * 2.3 + i * 2, 0); });
      },
    };
  }

  // ---------- the moon: craters, a lander, a flag, stars, and the Earth rising over the horizon ----------
  function moon() {
    const G = new THREE.Group();
    const rock = tex(32, 32, (x, r) => { px(x, '#9a9a9e', 0, 0, 32, 32); noise(x, r, 32, 32, ['#86868a', '#b0b0b4', '#76767a', '#a4a4a8'], 420); }, 91);
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(240, 240, 24, 24), mat({ map: rock, rep: [60, 60] })); ground.rotation.x = -Math.PI / 2; G.add(ground);
    const rim = mat({ map: rock, color: 0xc8c8cc }), pit = mat({ color: 0x5a5a60 });
    for (let i = 0; i < 18; i++) {
      const a = hash(i, 3) * TAU, d = 5 + hash(i, 4) * 40, s = 0.6 + hash(i, 5) * 2.5; if (d < 6 && Math.cos(a) > 0) continue;
      const tor = new THREE.Mesh(new THREE.TorusGeometry(s, s * 0.18, 4, 10), rim); tor.rotation.x = -Math.PI / 2; G.add(at(tor, Math.sin(a) * d, 0.02, -Math.cos(a) * d));
      const fl = new THREE.Mesh(new THREE.CircleGeometry(s * 0.9, 10), pit); fl.rotation.x = -Math.PI / 2; G.add(at(fl, Math.sin(a) * d, 0.015, -Math.cos(a) * d));
    }
    const gold = tex(8, 8, (x, r) => { px(x, '#d4a52a', 0, 0, 8, 8); noise(x, r, 8, 8, ['#f0c848', '#a87c18'], 20); }, 92), goldM = mat({ map: gold }), leg = mat({ color: 0xb8b8b8 });
    const lander = new THREE.Group(); lander.add(at(box(2, 1.2, 2, goldM), 0, 1.6, 0)); lander.add(at(box(1.4, 1, 1.4, mat({ color: 0xdcdcdc })), 0, 2.7, 0));
    for (const [x, z] of [[-1.2, -1.2], [1.2, -1.2], [-1.2, 1.2], [1.2, 1.2]]) { const l = at(cyl(0.05, 0.05, 1.6, 4, leg), x * 0.85, 0.8, z * 0.85); l.rotation.set(z * 0.25, 0, -x * 0.25); lander.add(l); lander.add(at(cyl(0.25, 0.25, 0.06, 6, leg), x, 0.03, z)); }
    G.add(at(lander, -4.5, 0, -5));
    G.add(at(cyl(0.03, 0.03, 2.2, 4, leg), 2.6, 1.1, -2.5)); G.add(at(box(1.1, 0.7, 0.03, mat({ map: sign('SAXO', '#ff4f8a', '#ffffff', 32, 16) })), 3.17, 1.85, -2.5));
    const starParts = []; for (let i = 0; i < 260; i++) { const a = hash(i, 7) * TAU, e = 0.05 + hash(i, 8) * 1.3, s = 0.15 + hash(i, 9) * 0.25; starParts.push(at(new THREE.Mesh(new THREE.BoxGeometry(s, s, s)), Math.cos(e) * Math.sin(a) * 110, Math.sin(e) * 110, -Math.cos(e) * Math.cos(a) * 110)); }
    G.add(merged(starParts, mat({ color: 0xffffff, unlit: 1 })));
    const earthT = tex(32, 16, (x, r) => { px(x, '#2d6fd6', 0, 0, 32, 16); for (let i = 0; i < 10; i++) px(x, '#3f9a48', Math.floor(r() * 28), Math.floor(r() * 13), 2 + Math.floor(r() * 5), 2 + Math.floor(r() * 3)); for (let i = 0; i < 12; i++) px(x, '#f2f6ff', Math.floor(r() * 30), Math.floor(r() * 15), 3, 1); }, 93);
    const earth = new THREE.Mesh(new THREE.SphereGeometry(7, 12, 8), mat({ map: earthT, unlit: 1 })); G.add(earth);
    return {
      group: G, sky: grad([[0, '#000000'], [1, '#05050a']]), shadowCol: 0x3a3a40,
      light() { U.uAmb.value.set(0x3a3c48); U.uDirCol.value.set(0xffffff); U.uDirDir.value.set(-0.7, -0.6, -0.3).normalize(); U.uFogCol.value.set(0x000000); U.uFog.value.set(70, 200); noLights(); },
      anim(t) { earth.position.set(-25, -4 + Math.min(t, 60) * 0.25, -80); earth.rotation.y = t * 0.1; },
    };
  }

  // ---------- night highway: Saxo on the median while traffic streams past both ways, sodium lights, a skyline ----------
  function highway() {
    const G = new THREE.Group();
    const asphalt = tex(32, 32, (x, r) => { px(x, '#2e3034', 0, 0, 32, 32); noise(x, r, 32, 32, ['#26282c', '#3a3c40'], 300); }, 101);
    const road = new THREE.Mesh(new THREE.PlaneGeometry(16, 300), mat({ map: asphalt, rep: [8, 150] })); road.rotation.x = -Math.PI / 2; G.add(road);
    G.add(at(box(1.2, 0.01, 300, mat({ color: 0x6a6b6f })), 0, 0.004, 0));   // flat painted median: a raised one hid his feet and shadow
    const dash = mat({ color: 0xe8e0a0 }), dashes = [];
    for (let z = -150; z < 150; z += 6) for (const x of [-3.8, 3.8]) dashes.push(at(new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.01, 2.5)), x, 0.005, z));
    G.add(merged(dashes, dash));
    for (const sx of [-1, 1]) G.add(at(box(0.3, 0.8, 300, mat({ color: 0x9a9ca2 })), sx * 8.2, 0.4, 0));
    const pole = mat({ color: 0x4a4d54 }), sodium = mat({ color: 0xffb040, unlit: 1 }), lamps = [];
    for (let z = -140; z < 140; z += 22) for (const sx of [-1, 1]) { G.add(at(cyl(0.08, 0.1, 7, 5, pole), sx * 8.6, 3.5, z + (sx > 0 ? 11 : 0))); G.add(at(box(1.4, 0.15, 0.4, sodium), sx * 7.9, 7, z + (sx > 0 ? 11 : 0))); lamps.push(new THREE.Vector3(sx * 7.9, 6.8, z + (sx > 0 ? 11 : 0))); }
    for (let i = 0; i < 26; i++) { const h = 8 + hash(i, 11) * 30, x = (i - 13) * 9 + hash(i, 12) * 4; G.add(at(box(7, h, 7, mat({ map: facade(['#1e2436', '#2a2438', '#1c2a30'][i % 3], 110 + i, 0.35), rep: [2, Math.round(h / 4)] })), x, h / 2 - 2, -120 - hash(i, 13) * 30)); }
    G.add(at(new THREE.Mesh(new THREE.CircleGeometry(5, 10), mat({ color: 0xf4f0d8, unlit: 1 })), 30, 45, -150));
    const cars = [], cols = [0xa3202a, 0x2a5aa3, 0xd8d8d8, 0x1a1a1a, 0xe0b020, 0x2a8a4a];
    for (let i = 0; i < 12; i++) { const c = car(cols[i % cols.length]); const lane = [-5.6, -2.2, 2.2, 5.6][i % 4]; if (lane < 0) c.rotation.y = Math.PI; G.add(c); cars.push([c, lane, 14 + hash(i, 14) * 10, hash(i, 15) * 240]); }
    return {
      group: G, sky: grad([[0, '#04060f'], [0.7, '#0e1430'], [1, '#2a2440']]), shadowCol: 0x1a1b22,
      light() {
        U.uAmb.value.set(0x7a7a9c); U.uDirCol.value.set(0x7078a8); U.uDirDir.value.set(0.2, -1, 0.3).normalize(); U.uFogCol.value.set(0x1c2244); U.uFog.value.set(25, 120); U.uPtRange.value = 16;
        [...lamps].sort((a, b) => Math.abs(a.z) - Math.abs(b.z)).slice(0, 4).forEach((p, i) => { U.uPtPos.value[i].copy(p); U.uPtCol.value[i].setRGB(2.2, 1.4, 0.6); });
      },
      anim(t) { cars.forEach(([c, lane, v, off]) => { const dir = lane < 0 ? 1 : -1, z = ((t * v + off) % 240) - 120; c.position.set(lane, 0, z * dir); }); },
    };
  }

  // ---------- rooftop at sunset: parapet, AC units, a water tower, a blinking antenna, city below, birds, clouds ----------
  function rooftop() {
    const G = new THREE.Group();
    const tar = tex(32, 32, (x, r) => { px(x, '#4a4648', 0, 0, 32, 32); noise(x, r, 32, 32, ['#3e3a3c', '#565254', '#5e4e4a'], 280); }, 121);
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(16, 16), mat({ map: tar, rep: [8, 8] })); floor.rotation.x = -Math.PI / 2; G.add(floor);
    const brick = tex(16, 16, (x, r) => { px(x, '#8a4a38', 0, 0, 16, 16); for (let y = 0; y < 16; y += 4) px(x, '#6a3a2c', 0, y, 16, 1); noise(x, r, 16, 16, ['#9a5644', '#7a4030'], 40); }, 122);
    for (const [x, z, w, d] of [[0, -8, 16, 0.4], [0, 8, 16, 0.4], [-8, 0, 0.4, 16], [8, 0, 0.4, 16]]) G.add(at(box(w, 0.9, d, mat({ map: brick, rep: [Math.max(w, d) / 2, 1] })), x, 0.45, z));
    G.add(at(box(16.4, 30, 16.4, mat({ map: brick, rep: [8, 15] })), 0, -15.02, 0));
    const metal = mat({ color: 0xa8acb4 });
    for (const [x, z] of [[-5, -5], [-3.2, -5.2], [5.5, 3]]) { G.add(at(box(1.4, 1, 1.2, metal), x, 0.5, z)); G.add(at(cyl(0.4, 0.4, 0.1, 8, mat({ color: 0x505458 })), x, 1.05, z)); }
    const wood = tex(8, 16, (x, r) => { px(x, '#7a5634', 0, 0, 8, 16); for (let i = 0; i < 8; i += 2) px(x, '#5c3e24', i, 0, 1, 16); }, 123);
    const tower = new THREE.Group(); tower.add(at(cyl(1.3, 1.3, 2.2, 10, mat({ map: wood, rep: [4, 1] })), 0, 3.6, 0)); tower.add(at(new THREE.Mesh(new THREE.ConeGeometry(1.45, 0.9, 10), mat({ color: 0x5a4030 })), 0, 5.15, 0));
    for (const [x, z] of [[-0.9, -0.9], [0.9, -0.9], [-0.9, 0.9], [0.9, 0.9]]) tower.add(at(cyl(0.07, 0.07, 2.5, 4, mat({ color: 0x3a3a3a })), x, 1.25, z));
    G.add(at(tower, 4.5, 0, -4.5));
    G.add(at(cyl(0.05, 0.08, 6, 4, metal), -6, 3, 5.5)); const blink = at(box(0.25, 0.25, 0.25, mat({ color: 0xff2020, unlit: 1 })), -6, 6.1, 5.5); G.add(blink);
    for (let i = 0; i < 40; i++) { const a = hash(i, 21) * TAU, d = 14 + hash(i, 22) * 55, h = 10 + hash(i, 23) * 35, top = -2 - hash(i, 24) * 14; G.add(at(box(6 + hash(i, 25) * 5, h, 6 + hash(i, 26) * 5, mat({ map: facade(['#3a3050', '#503a44', '#2e3a50', '#5a4a3a'][i % 4], 130 + i, 0.3), rep: [2, Math.round(h / 4)] })), Math.sin(a) * d, top - h / 2, -Math.cos(a) * d)); }
    G.add(at(new THREE.Mesh(new THREE.CircleGeometry(9, 12), mat({ color: 0xffb04a, unlit: 1 })), 10, 6, -110));
    const cloudM = mat({ color: 0xf2a07a, unlit: 1 }), clouds = [];
    for (let i = 0; i < 7; i++) { const c = new THREE.Group(); for (let k = 0; k < 3; k++) c.add(at(box(6, 1.4, 2, cloudM), (k - 1) * 4, k === 1 ? 0.7 : 0, 0)); G.add(c); clouds.push([c, i]); }
    const birdM = mat({ color: 0x1a1420, side: THREE.DoubleSide }), birds = [];
    for (let i = 0; i < 9; i++) { const b = new THREE.Group(), l = at(box(0.5, 0.03, 0.12, birdM), -0.24, 0, 0), r = at(box(0.5, 0.03, 0.12, birdM), 0.24, 0, 0); b.add(l, r); G.add(b); birds.push([b, l, r, i]); }
    return {
      group: G, sky: grad([[0, '#2a1a4a'], [0.45, '#8a3a6a'], [0.8, '#f07a4a'], [1, '#ffc86a']]), shadowCol: 0x2e2a2c,
      light() { U.uAmb.value.set(0x806070); U.uDirCol.value.set(0xffb080); U.uDirDir.value.set(-0.2, -0.5, 1).normalize(); U.uFogCol.value.set(0xd07a6a); U.uFog.value.set(30, 120); noLights(); },
      anim(t) {
        blink.visible = beatN(t) % 2 === 0;
        clouds.forEach(([c, i]) => c.position.set(((hash(i, 31) * 160 + t * 0.6) % 160) - 80, 16 + hash(i, 32) * 14, -60 - hash(i, 33) * 40));
        birds.forEach(([b, l, r, i]) => { const x = ((t * 3 + i * 2.5 + hash(i, 34) * 20) % 60) - 30; b.position.set(x, 9 + Math.sin(i) * 1.5 + Math.sin(t + i) * 0.3, -14 - (i % 3) * 2); const f = Math.sin(t * 10 + i) * 0.6; l.rotation.z = f; r.rotation.z = -f; });
      },
    };
  }

  // ---------- western town: storefronts, a water tower, cacti, mesas, a turning windmill, rolling tumbleweeds ----------
  function western() {
    const G = new THREE.Group();
    const dirt = tex(32, 32, (x, r) => { px(x, '#c89a62', 0, 0, 32, 32); noise(x, r, 32, 32, ['#b88a52', '#d8aa72', '#a87a46'], 320); }, 141);
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(200, 200), mat({ map: dirt, rep: [60, 60] })); ground.rotation.x = -Math.PI / 2; G.add(ground);
    const plank = (base, seed) => tex(16, 16, (x, r) => { px(x, base, 0, 0, 16, 16); for (let i = 0; i < 16; i += 3) px(x, 'rgba(0,0,0,.25)', 0, i, 16, 1); noise(x, r, 16, 16, ['rgba(0,0,0,.12)', 'rgba(255,255,255,.08)'], 40); }, seed);
    const names = ['SALOON', 'SHERIFF', 'BANK', 'HOTEL', 'SAXO & CO', 'GENERAL', 'BARBER', 'JAIL'];
    for (const s of [-1, 1]) for (let i = 0; i < 4; i++) {
      const z = 6 - i * 8, h = 5 + (i % 2) * 1.5, k = i * 2 + (s > 0 ? 1 : 0);
      G.add(at(box(5, h, 7, mat({ map: plank(['#8a5a34', '#6e4a2e', '#9a6a3e', '#7a4e30'][k % 4], 150 + k), rep: [3, 3] })), s * 8, h / 2, z));
      G.add(at(box(0.15, 1, 5, mat({ map: sign(names[k], '#3a2414', '#f2d49a') })), s * 5.45, h - 0.9, z));
      G.add(at(box(1.8, 0.15, 7, mat({ color: 0x5a3a22 })), s * 4.6, 2.8, z));
      for (const dz of [-3.2, 3.2]) G.add(at(cyl(0.08, 0.08, 2.8, 4, mat({ color: 0x4a3020 })), s * 3.8, 1.4, z + dz));
    }
    const green = mat({ color: 0x3e7a3a });
    for (let i = 0; i < 12; i++) { const a = hash(i, 41) * TAU, d = 14 + hash(i, 42) * 30, c = new THREE.Group(), h = 1.6 + hash(i, 43) * 1.4; c.add(at(cyl(0.22, 0.26, h, 6, green), 0, h / 2, 0)); for (const sx of [-1, 1]) { c.add(at(cyl(0.12, 0.12, 0.5, 5, green), sx * 0.38, h * 0.55, 0)); const u = at(cyl(0.12, 0.12, 0.6, 5, green), sx * 0.55, h * 0.55 + 0.3, 0); c.add(u); c.children.at(-2).rotation.z = Math.PI / 2; } G.add(at(c, Math.sin(a) * d, 0, -Math.cos(a) * d)); }
    const mesaM = mat({ color: 0xa8563a });
    for (let i = 0; i < 8; i++) { const a = -1.2 + i * 0.34, d = 90, w = 14 + hash(i, 44) * 14, h = 10 + hash(i, 45) * 14; G.add(at(box(w, h, 10, mesaM), Math.sin(a) * d, h / 2, -Math.cos(a) * d)); }
    const tw = new THREE.Group(); tw.add(at(cyl(1.2, 1.2, 2, 10, mat({ map: plank('#7a5634', 160), rep: [4, 1] })), 0, 5, 0)); tw.add(at(new THREE.Mesh(new THREE.ConeGeometry(1.35, 0.8, 10), mat({ color: 0x4a3020 })), 0, 6.4, 0));
    for (const [x, z] of [[-0.8, -0.8], [0.8, -0.8], [-0.8, 0.8], [0.8, 0.8]]) tw.add(at(cyl(0.08, 0.08, 4, 4, mat({ color: 0x4a3020 })), x, 2, z));
    G.add(at(tw, -6, 0, -26));
    G.add(at(cyl(0.1, 0.18, 8, 4, mat({ color: 0x6a6a6a })), 7, 4, -30)); const blades = new THREE.Group(); for (let k = 0; k < 6; k++) { const b = at(box(0.3, 2.2, 0.05, mat({ color: 0xd8d0c0 })), 0, 1.1, 0); const arm = new THREE.Group(); arm.rotation.z = k / 6 * TAU; arm.add(b); blades.add(arm); } G.add(at(blades, 7, 8, -29.8));
    const weedT = tex(8, 8, (x, r) => { px(x, '#8a6a3a', 0, 0, 8, 8); noise(x, r, 8, 8, ['#5a4020', '#b08a50', 'rgba(0,0,0,0)'], 30); }, 161), weeds = [];
    for (let i = 0; i < 4; i++) { const w = new THREE.Mesh(new THREE.IcosahedronGeometry(0.4, 0), mat({ map: weedT, rep: [2, 2] })); G.add(w); weeds.push([w, i]); }
    return {
      group: G, sky: grad([[0, '#3a7ad0'], [0.7, '#9ac8e8'], [1, '#f2d8a8']]), shadowCol: 0x8a6436,
      light() { U.uAmb.value.set(0x907868); U.uDirCol.value.set(0xffd8a0); U.uDirDir.value.set(0.6, -0.7, -0.4).normalize(); U.uFogCol.value.set(0xe8c8a0); U.uFog.value.set(35, 130); noLights(); },
      anim(t) {
        blades.rotation.z = t * 1.4;
        weeds.forEach(([w, i]) => { const x = ((t * (3 + i) + i * 11) % 40) - 20, z = -2 - i * 3.5; w.position.set(x, 0.4 + Math.abs(Math.sin(x * 1.1)) * 0.5, z); w.rotation.z = -x / 0.4; w.rotation.x = x * 0.3; });
      },
    };
  }

  return { club: club(), stadium: stadium(), moon: moon(), highway: highway(), rooftop: rooftop(), western: western() };
}
