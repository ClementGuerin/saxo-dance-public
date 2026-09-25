// mapkit.js: shared helpers for the map files (maps2.js indoor, maps3.js outdoor). Everything here is deterministic,
// so maps built from it stay pure functions of t.
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

export function mapKit(K) {
  const { THREE, mat, tex, px, noise, box, selfLit, U, TAU, beat } = K;
  const PI = Math.PI;
  const hash = (a, b = 0, c = 0) => { const x = Math.sin(a * 127.1 + b * 311.7 + c * 74.7) * 43758.5453; return x - Math.floor(x); };
  const fr = x => x - Math.floor(x);
  const hit = t => Math.exp(-fr(beat(t)) * 5);                 // 1 on each beat, decaying
  const barHit = t => Math.exp(-fr(beat(t) / 4) * 4);          // 1 on each bar's downbeat, decaying
  const beatN = t => Math.floor(beat(t));
  const grad = stops => tex(4, 64, x => { const g = x.createLinearGradient(0, 0, 0, 64); stops.forEach(([o, c]) => g.addColorStop(o, c)); x.fillStyle = g; x.fillRect(0, 0, 4, 64); });
  const sign = (text, bg, fg, w = 64, h = 16) => tex(w, h, x => { px(x, bg, 0, 0, w, h); x.fillStyle = fg; x.font = `bold ${h - 4}px monospace`; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(text, w / 2, h / 2 + 1); });
  const cyl = (rt, rb, h, seg, m) => new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), m);
  const cone = (r, h, seg, m) => new THREE.Mesh(new THREE.ConeGeometry(r, h, seg), m);
  const sph = (r, w, h, m) => new THREE.Mesh(new THREE.SphereGeometry(r, w, h), m);
  const ico = (r, d, m) => new THREE.Mesh(new THREE.IcosahedronGeometry(r, d), m);
  const at = (o, x, y, z) => { o.position.set(x, y, z); return o; };
  const rot = (o, x = 0, y = 0, z = 0) => { o.rotation.set(x, y, z); return o; };
  const merged = (parts, m) => new THREE.Mesh(mergeGeometries(parts.map(o => { o.updateMatrix(); const g = o.geometry.index ? o.geometry.toNonIndexed() : o.geometry.clone(); return g.applyMatrix4(o.matrix); })), m);
  // a horizontal plane (floor, water, rug) facing up
  const flat = (w, d, m, x = 0, y = 0, z = 0) => { const p = new THREE.Mesh(new THREE.PlaneGeometry(w, d), m); p.rotation.x = -PI / 2; p.position.set(x, y, z); return p; };
  // polar placement around Saxo: angle 0 is straight behind him (-z), so the default camera sees it
  const around = (i, seed, r0, r1, a0 = 0, a1 = TAU) => { const a = a0 + hash(i, seed) * (a1 - a0), d = r0 + hash(i, seed + 1) * (r1 - r0); return [Math.sin(a) * d, -Math.cos(a) * d, a]; };
  const people = (seed, w = 64, h = 16) => tex(w, h, (x, r) => {
    px(x, '#1d1b26', 0, 0, w, h);
    for (let i = 0; i < w; i += 4) { const c = ['#e84a4a', '#f2c94c', '#4a8fe8', '#f2f2f2', '#6bd46b', '#e87bd0', '#ff9a3c'][Math.floor(r() * 7)]; px(x, c, i, 7, 3, 9); px(x, ['#f1c9a0', '#c98b5a', '#7a4a2a'][Math.floor(r() * 3)], i + 0.5, 3, 2, 3); }
  }, seed);
  const facade = (base, seed, lit = 0.45, win = '#1c2233') => tex(32, 32, (x, r) => {
    px(x, base, 0, 0, 32, 32); noise(x, r, 32, 32, ['rgba(0,0,0,.18)', 'rgba(255,255,255,.08)'], 120);
    for (let yy = 3; yy < 30; yy += 9) for (let xx = 3; xx < 30; xx += 8) { x.fillStyle = r() < lit ? 'rgba(255,214,120,0.8)' : win; x.fillRect(xx, yy, 5, 6); }
    selfLit(x, 32, 32);
  }, seed);
  // set the shared light uniforms; point lights off unless pt() sets them afterwards
  const lights = (amb, dirCol, dir, fogCol, fog, range = 8) => {
    U.uAmb.value.set(amb); U.uDirCol.value.set(dirCol); U.uDirDir.value.set(...dir).normalize();
    U.uFogCol.value.set(fogCol); U.uFog.value.set(...fog); U.uPtRange.value = range;
    U.uPtCol.value.forEach(c => c.setRGB(0, 0, 0)); U.uPtPos.value.forEach(p => p.set(0, -99, 0));
  };
  const pt = (i, x, y, z, r, g, b) => { U.uPtPos.value[i].set(x, y, z); U.uPtCol.value[i].setRGB(r, g, b); };
  // four walls and a ceiling facing inwards. wallT tiles every `tile` metres; skip names walls to leave open.
  function room(G, W, D, H, wallT, tile, ceilCol, { skip = [], cz = 0, y0 = 0 } = {}) {
    const wall = (w, h) => new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat({ map: wallT, rep: [w / tile, h / tile] }));
    const h = H - y0, yc = y0 + h / 2;
    if (!skip.includes('back')) G.add(at(wall(W, h), 0, yc, cz - D / 2));
    if (!skip.includes('front')) G.add(rot(at(wall(W, h), 0, yc, cz + D / 2), 0, PI));
    if (!skip.includes('left')) G.add(rot(at(wall(D, h), -W / 2, yc, cz), 0, PI / 2));
    if (!skip.includes('right')) G.add(rot(at(wall(D, h), W / 2, yc, cz), 0, -PI / 2));
    if (ceilCol != null) { const c = new THREE.Mesh(new THREE.PlaneGeometry(W, D), mat({ color: ceilCol })); c.rotation.x = PI / 2; G.add(at(c, 0, H, cz)); }
  }
  // a dome of star specks, merged into one mesh
  function stars(n, R, seed, col = 0xffffff, eMin = 0.02) {
    const parts = [];
    for (let i = 0; i < n; i++) { const a = hash(i, seed) * TAU, e = eMin + hash(i, seed + 1) * 1.3, s = 0.15 + hash(i, seed + 2) * 0.3; parts.push(at(new THREE.Mesh(new THREE.BoxGeometry(s, s, s)), Math.cos(e) * Math.sin(a) * R, Math.sin(e) * R, -Math.cos(e) * Math.cos(a) * R)); }
    return merged(parts, mat({ color: col, unlit: 1 }));
  }
  // falling particles in a box around Saxo (snow, rain, confetti): returns anim(t)
  function fall(G, n, m, geo, { w = 24, top = 12, speed = 1.2, spin = 0, drift = 0.4, seed = 1 } = {}) {
    const ps = []; for (let i = 0; i < n; i++) { const p = new THREE.Mesh(geo, m); G.add(p); ps.push(p); }
    return t => ps.forEach((p, i) => {
      const r1 = hash(i, seed), r2 = hash(i, seed + 1), r3 = hash(i, seed + 2), y = top - ((t * speed * (0.8 + r3 * 0.4) + r1 * top) % top);
      p.position.set((r1 - 0.5) * w + Math.sin(t + i) * drift, y, (r2 - 0.5) * w);
      if (spin) p.rotation.set(t * spin + i, t * spin * 0.7 + i * 2, 0);
    });
  }
  // a triangular prism roof, ridge on top, running along x or z; r is the triangle's circumradius
  const prism = (r, len, m, axis = 'x') => { const p = new THREE.Mesh(new THREE.CylinderGeometry(r, r, len, 3), m); if (axis === 'x') { p.rotation.order = 'ZYX'; p.rotation.set(0, PI / 2, PI / 2); } else p.rotation.set(PI / 2, PI, 0); return p; };
  // a simple person-shaped figure (spectators, shoppers)
  const figure = (col, s = 1) => { const g = new THREE.Group(); g.add(at(box(0.45 * s, 0.8 * s, 0.3 * s, mat({ color: col })), 0, 0.75 * s, 0)); g.add(at(box(0.3 * s, 0.3 * s, 0.3 * s, mat({ color: 0xe0b48a })), 0, 1.35 * s, 0)); for (const sx of [-1, 1]) g.add(at(box(0.16 * s, 0.4 * s, 0.16 * s, mat({ color: 0x2a2a38 })), sx * 0.12 * s, 0.2 * s, 0)); return g; };
  return { THREE, mat, tex, px, noise, box, selfLit, U, TAU, PI, beat, hash, fr, hit, barHit, beatN, grad, sign, cyl, cone, sph, ico, at, rot, merged, flat, around, people, facade, lights, pt, room, stars, fall, figure, prism };
}
