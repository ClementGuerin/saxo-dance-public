// maps3.js: eleven outdoor PS1 maps (jungle temple, snowy village, pyramids, seabed, volcano, Tokyo alley,
// farm, graveyard, pirate ship, candy land, Mars; Paris moved to maps4.js). Same contract as maps.js, pure in t. Saxo stands at the origin
// facing +z; the default camera looks towards -z, so each map puts its landmark there. Nothing taller than ~0.3 m
// sits within 7.5 m of him except behind (z < -3), so orbit, track and dolly cameras never clip a prop.
import { mapKit } from './mapkit.js';

export function buildOutdoorMaps(K) {
  const k = mapKit(K);
  const { THREE, mat, tex, px, noise, box, selfLit, TAU, PI, beat, hash, fr, hit, barHit, beatN, grad, sign, cyl, cone, sph, ico, at, rot, merged, flat, around, facade, lights, pt, stars, fall, figure, prism } = k;
  const groundTex = (base, cols, seed, n = 320) => tex(32, 32, (x, r) => { px(x, base, 0, 0, 32, 32); noise(x, r, 32, 32, cols, n); }, seed);
  // keep props off the camera ring: r >= rMin everywhere, or r >= rBack when behind him
  const clear = (x, z, rMin = 7.5, rBack = 4) => { const r = Math.hypot(x, z); return z < -3 ? r >= rBack : r >= rMin; };

  // ---------- jungle temple: a stepped pyramid, a waterfall, giant trees, fireflies, parrots ----------
  function jungle() {
    const G = new THREE.Group();
    G.add(flat(220, 220, mat({ map: groundTex('#4a6a2a', ['#3e5e22', '#5a7a32', '#6a5a2a', '#355220'], 301), rep: [70, 70] })));
    const stone = tex(16, 16, (x, r) => { px(x, '#8a8a78', 0, 0, 16, 16); for (let y = 0; y < 16; y += 4) px(x, '#5a5a4a', 0, y, 16, 1); noise(x, r, 16, 16, ['#4a6a2a', '#6a7a4a', '#7a7a68'], 50); }, 302);
    const temple = new THREE.Group();
    for (let i = 0; i < 6; i++) { const w = 20 - i * 3; temple.add(at(box(w, 2.2, w, mat({ map: stone, rep: [w / 2, 1] })), 0, 1.1 + i * 2.2, 0)); }
    temple.add(at(box(3, 13.2, 11, mat({ map: stone, rep: [1, 6] })), 0, 6.6, 6));
    temple.add(at(box(4, 3.4, 4, mat({ map: stone })), 0, 14.9, 0)); temple.add(at(box(1.6, 2.2, 0.2, mat({ color: 0x0a0a06 })), 0, 14.3, 2.02));
    G.add(at(temple, 0, 0, -38));
    const fallT = tex(8, 16, (x, r) => { px(x, '#9ad8f0', 0, 0, 8, 16); noise(x, r, 8, 16, ['#ffffff', '#6ab8e0'], 30); }, 303), fallM = mat({ map: fallT, rep: [1, 3], unlit: 1 });
    G.add(at(new THREE.Mesh(new THREE.PlaneGeometry(4, 14), fallM), 16, 7, -24)); G.add(at(box(8, 14, 3, mat({ map: stone, rep: [3, 6] })), 16, 7, -25.6));
    G.add(flat(6, 5, mat({ color: 0x3a8ab8 }), 16, 0.01, -21.5));
    const bark = mat({ map: tex(8, 16, (x, r) => { px(x, '#5a3e22', 0, 0, 8, 16); noise(x, r, 8, 16, ['#4a3018', '#6a4a2a', '#3a5a22'], 40); }, 304), rep: [2, 4] });
    const leafM = [0x2e6a22, 0x3a7a2a, 0x245a1a].map(c => mat({ color: c }));
    for (let i = 0; i < 22; i++) {
      const [x, z] = around(i, 305, 10, 34); if (Math.abs(x) < 8 && z < -20) continue;
      const h = 9 + hash(i, 306) * 8, tr = new THREE.Group(); tr.add(at(cyl(0.35, 0.6, h, 6, bark), 0, h / 2, 0));
      for (let j = 0; j < 3; j++) tr.add(at(ico(2.4 + hash(i, j) * 1.4, 0, leafM[(i + j) % 3]), (hash(i, j, 1) - 0.5) * 3, h + (j - 1) * 0.8, (hash(i, j, 2) - 0.5) * 3));
      for (let j = 0; j < 2; j++) tr.add(at(box(0.06, 5, 0.06, leafM[0]), (j - 0.5) * 2.4, h - 2.8, 0.8));
      G.add(at(tr, x, 0, z));
    }
    const ferns = []; for (let i = 0; i < 26; i++) { const [x, z] = around(i, 307, 7.8, 14); ferns.push(rot(at(new THREE.Mesh(new THREE.ConeGeometry(0.7, 0.9, 5)), x, 0.45, z), 0, hash(i, 308), 0)); }
    G.add(merged(ferns, mat({ color: 0x3a8a2a })));
    const flies = []; for (let i = 0; i < 40; i++) { const f = box(0.06, 0.06, 0.06, mat({ color: 0xf2ff6a, unlit: 1 })); G.add(f); flies.push([f, i]); }
    const parrots = []; for (let i = 0; i < 3; i++) { const p = new THREE.Group(), wm = mat({ color: [0xe8322a, 0x2a8ae8, 0xf2c21a][i], side: THREE.DoubleSide }); p.add(box(0.2, 0.2, 0.6, wm)); const l = at(box(0.7, 0.03, 0.25, wm), -0.4, 0, 0), r = at(box(0.7, 0.03, 0.25, wm), 0.4, 0, 0); p.add(l, r); G.add(p); parrots.push([p, l, r, i]); }
    return {
      group: G, sky: grad([[0, '#6aa8c8'], [0.7, '#a8d0c0'], [1, '#d8e8c0']]), shadowCol: 0x2a3a18,
      light() { lights(0x6a8062, 0xfff0c0, [0.4, -1, -0.3], 0x7aa080, [18, 80]); },
      anim(t) {
        fallM.uniforms.uOff.value.set(0, t * 1.5);
        const n = beatN(t); flies.forEach(([f, i]) => { f.position.set(Math.sin(t * 0.3 + i) * (3 + i % 8), 0.6 + (i % 5) * 0.5 + Math.sin(t * 1.1 + i * 2) * 0.3, -3 - (i % 9) * 1.2 + Math.cos(t * 0.4 + i) * 1.5); f.visible = hash(i, n) < 0.7; });
        parrots.forEach(([p, l, r, i]) => { const a = t * 0.35 + i * 2.1, R = 14 + i * 3; p.position.set(Math.sin(a) * R, 9 + i * 1.5 + Math.sin(t + i), -Math.cos(a) * R - 8); p.rotation.y = a + PI / 2; const f = Math.sin(t * 12 + i) * 0.7; l.rotation.z = f; r.rotation.z = -f; });
      },
    };
  }

  // ---------- snowy village at dusk: pines, log cabins with warm windows, a snowman, falling snow, an aurora ----------
  function snow() {
    const G = new THREE.Group();
    G.add(flat(220, 220, mat({ map: groundTex('#e8eef8', ['#d8e2f0', '#f4f8ff', '#c8d4e8'], 311), rep: [70, 70] })));
    const pineM = mat({ map: tex(8, 8, (x, r) => { px(x, '#1e4a32', 0, 0, 8, 8); noise(x, r, 8, 8, ['#f4f8ff', '#2a5a3e'], 14); }, 312) });
    const pines = [];
    for (let i = 0; i < 40; i++) { const [x, z] = around(i, 313, 9, 45); if (!clear(x, z, 9, 9)) continue; const h = 3 + hash(i, 314) * 4; for (let j = 0; j < 3; j++) pines.push(at(new THREE.Mesh(new THREE.ConeGeometry(h * (0.42 - j * 0.1), h * 0.5, 7)), x, h * (0.3 + j * 0.25), z)); pines.push(at(new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.2, h * 0.3, 5)), x, h * 0.15, z)); }
    G.add(merged(pines, pineM));
    const logT = tex(16, 16, (x, r) => { px(x, '#7a4e2a', 0, 0, 16, 16); for (let y = 0; y < 16; y += 3) px(x, '#4a2e16', 0, y, 16, 1); px(x, 'rgba(255,200,110,0.8)', 3, 5, 4, 5); px(x, 'rgba(255,200,110,0.8)', 10, 5, 4, 5); selfLit(x, 16, 16); }, 315);
    const roofM = mat({ color: 0xf0f4fa }), cabins = [[-9, -14, 0.3], [0, -18, 0], [10, -15, -0.4], [-16, -6, 0.9]];
    const smoke = [];
    cabins.forEach(([x, z, ry], i) => {
      const c = new THREE.Group(); c.add(at(box(5, 3, 4, mat({ map: logT, rep: [2, 1] })), 0, 1.5, 0));
      c.add(at(prism(2.5, 5.4, roofM, 'x'), 0, 4.25, 0));
      c.add(at(box(0.6, 1.6, 0.6, mat({ color: 0x6a5a5a })), 1.5, 4.8, 0));
      for (let j = 0; j < 5; j++) { const s = box(0.5, 0.5, 0.5, mat({ color: 0xb8bcc8 })); G.add(s); smoke.push([s, x + Math.cos(ry) * 1.5, z - Math.sin(ry) * 1.5, j + i * 5]); }
      G.add(rot(at(c, x, 0, z), 0, ry, 0));
    });
    const snowM = mat({ color: 0xf8faff }), man = new THREE.Group();
    man.add(at(sph(0.5, 8, 6, snowM), 0, 0.5, 0)); man.add(at(sph(0.36, 8, 6, snowM), 0, 1.2, 0)); man.add(at(sph(0.25, 8, 6, snowM), 0, 1.7, 0));
    man.add(rot(at(cone(0.05, 0.3, 5, mat({ color: 0xf28c28 })), 0, 1.7, 0.3), PI / 2, 0, 0)); man.add(at(cyl(0.2, 0.2, 0.3, 8, mat({ color: 0x1a1a1a })), 0, 2.05, 0)); man.add(at(cyl(0.3, 0.3, 0.03, 8, mat({ color: 0x1a1a1a })), 0, 1.9, 0));
    man.add(at(box(0.5, 0.08, 0.5, mat({ color: 0xd8322a })), 0, 1.45, 0));
    G.add(rot(at(man, -3.6, 0, -4.4), 0, 0.4, 0));
    const lampPos = [[-6, -6], [6, -6], [-8, 3], [8, 3]], pole = mat({ color: 0x2a2a30 });
    for (const [x, z] of lampPos) { G.add(at(cyl(0.07, 0.09, 3.2, 5, pole), x, 1.6, z)); G.add(at(box(0.35, 0.4, 0.35, mat({ color: 0xffd890, unlit: 1 })), x, 3.3, z)); }
    const aur = []; for (let i = 0; i < 4; i++) { const a = new THREE.Mesh(new THREE.PlaneGeometry(60, 10), mat({ color: [0x3aff9a, 0x6affd0, 0x9a6aff, 0x3ad48a][i], unlit: 1, side: THREE.DoubleSide })); G.add(a); aur.push([a, i]); }
    const flakes = fall(G, 220, mat({ color: 0xffffff, unlit: 1 }), new THREE.BoxGeometry(0.05, 0.05, 0.05), { w: 26, top: 12, speed: 0.9, drift: 0.5, seed: 316 });
    return {
      group: G, sky: grad([[0, '#0a1030'], [0.6, '#2a3a70'], [1, '#6a7ab0']]), shadowCol: 0x8a98b8,
      light() { lights(0x8a92aa, 0xd0dcf4, [0.3, -1, -0.4], 0x6a78a4, [24, 95], 8); lampPos.forEach(([x, z], i) => pt(i, x, 3.1, z, 1.6, 1.2, 0.7)); },
      anim(t) {
        flakes(t);
        smoke.forEach(([s, x, z, i]) => { const u = fr(t * 0.25 + i * 0.2); s.position.set(x + u * 1.5, 5.6 + u * 5, z); s.scale.setScalar(0.6 + u * 1.6); s.visible = u < 0.9; });
        aur.forEach(([a, i]) => { a.position.set(-10 + i * 8 + Math.sin(t * 0.2 + i) * 4, 38 + i * 2, -110 - i * 4); a.rotation.set(0.35, 0.2 * Math.sin(t * 0.15 + i), 0.08 * Math.sin(t * 0.3 + i)); });
      },
    };
  }

  // ---------- pyramids: three pyramids, a sphinx, ruined columns, an obelisk, a sandstorm drifting past ----------
  function pyramids() {
    const G = new THREE.Group();
    const sandT = groundTex('#e0c080', ['#d4b06a', '#ecd094', '#c8a45e'], 321);
    G.add(flat(300, 300, mat({ map: sandT, rep: [90, 90] })));
    const blockT = tex(16, 16, (x, r) => { px(x, '#d8b878', 0, 0, 16, 16); for (let y = 0; y < 16; y += 3) px(x, '#a8884e', 0, y, 16, 1); noise(x, r, 16, 16, ['#c8a868', '#e8c88a'], 40); }, 322);
    for (const [x, z, s] of [[-30, -110, 1], [18, -140, 0.8], [52, -120, 0.55]]) G.add(rot(at(cone(40 * s, 42 * s, 4, mat({ map: blockT, rep: [10, 10] })), x, 21 * s, z), 0, PI / 4, 0));
    const sphinx = new THREE.Group(), sm = mat({ map: blockT, rep: [2, 1] });
    sphinx.add(at(box(4, 3, 12, sm), 0, 1.5, 0)); sphinx.add(at(box(3, 3.4, 3, sm), 0, 4.6, 5)); sphinx.add(at(box(4.4, 3, 1, mat({ color: 0x3a5ab8 })), 0, 4.8, 4.2));
    for (const s of [-1, 1]) sphinx.add(at(box(1.1, 1, 5, sm), s * 1.3, 0.5, 7.5));
    G.add(rot(at(sphinx, 26, 0, -34), 0, -0.6, 0));
    const glyph = tex(8, 32, (x, r) => { px(x, '#d8c090', 0, 0, 8, 32); for (let y = 2; y < 30; y += 4) { px(x, ['#3a5ab8', '#a8322a', '#2a2a2a'][Math.floor(r() * 3)], 2 + Math.floor(r() * 3), y, 2, 2); } }, 323);
    for (let i = 0; i < 8; i++) { const x = -9 + i * 2.6, h = i === 5 ? 2.2 : 6; G.add(at(cyl(0.55, 0.6, h, 8, mat({ map: glyph, rep: [3, 1] })), x, h / 2, -11)); }
    G.add(at(box(22, 0.8, 1.6, mat({ map: blockT, rep: [8, 1] })), -1.5, 6.4, -11));
    G.add(rot(at(cyl(0.6, 0.55, 1.4, 8, mat({ map: glyph })), 4.5, 0.55, -9.5), 0, 0.4, PI / 2 - 0.1));
    const ob = new THREE.Group(); ob.add(at(cyl(0.5, 0.9, 10, 4, mat({ map: glyph, rep: [2, 3] })), 0, 5, 0)); ob.add(at(cone(0.5, 1, 4, mat({ color: 0xf2d060 })), 0, 10.5, 0)); G.add(at(rot(ob, 0, PI / 4, 0), -12, 0, -18));
    const palmM = mat({ color: 0x3a8a3a, side: THREE.DoubleSide }), trunkM = mat({ color: 0x8a5a2e });
    for (const [x, z] of [[-20, -10], [-23, -14], [-18, -16]]) { const p = new THREE.Group(); p.add(at(cyl(0.18, 0.25, 6, 5, trunkM), 0, 3, 0)); for (let j = 0; j < 6; j++) { const l = new THREE.Group(); l.rotation.y = j / 6 * TAU; l.add(rot(at(box(2.6, 0.03, 0.5, palmM), 1.2, 6, 0), 0, 0, -0.4)); p.add(l); } G.add(at(p, x, 0, z)); }
    G.add(flat(9, 6, mat({ color: 0x2a8ab8 }), -21, 0.01, -13));
    const camels = []; for (let i = 0; i < 3; i++) { const c = new THREE.Group(), cm = mat({ color: 0xb8864a }); c.add(at(box(1.8, 0.8, 0.7, cm), 0, 1.6, 0)); c.add(at(box(0.6, 0.5, 0.5, cm), 0, 2.2, 0)); c.add(at(box(0.3, 1, 0.3, cm), 1, 2.1, 0)); c.add(at(box(0.5, 0.3, 0.3, cm), 1.2, 2.6, 0)); for (const [dx, dz] of [[-0.7, -0.2], [0.7, -0.2], [-0.7, 0.2], [0.7, 0.2]]) c.add(at(box(0.18, 1.2, 0.18, cm), dx, 0.6, dz)); G.add(c); camels.push([c, i]); }
    const dust = []; for (let i = 0; i < 90; i++) { const d = box(0.08, 0.04, 0.04, mat({ color: 0xe8d0a0, unlit: 1 })); G.add(d); dust.push([d, i]); }
    G.add(at(new THREE.Mesh(new THREE.CircleGeometry(8, 14), mat({ color: 0xfff0c0, unlit: 1 })), -40, 55, -170));
    return {
      group: G, sky: grad([[0, '#4a90d8'], [0.7, '#a8d0f0'], [1, '#f0dcb0']]), shadowCol: 0xa0804a,
      light() { lights(0x9a8a78, 0xfff0d0, [0.5, -0.9, 0.3], 0xe8d4a8, [40, 180]); },
      anim(t) {
        camels.forEach(([c, i]) => { const x = ((t * 1.2 + i * 3.2) % 80) - 40; c.position.set(x, Math.abs(Math.sin(t * 3 + i)) * 0.06, -50 - i * 0.5); });
        dust.forEach(([d, i]) => { const x = ((t * (6 + hash(i, 324) * 5) + hash(i, 325) * 50) % 50) - 25; d.position.set(x, 0.1 + hash(i, 326) * 1.6 + Math.sin(t * 2 + i) * 0.1, -2 - hash(i, 327) * 16); });
      },
    };
  }

  // ---------- seabed: coral, swaying kelp, a school of fish circling, bubbles, a treasure chest that pops open ----------
  function underwater() {
    const G = new THREE.Group();
    G.add(flat(200, 200, mat({ map: tex(32, 32, (x, r) => { px(x, '#c8b47a', 0, 0, 32, 32); for (let y = 0; y < 32; y += 5) px(x, '#b09a62', 0, y, 32, 1); noise(x, r, 32, 32, ['#d8c48a', '#a8945a'], 160); }, 331), rep: [60, 60] })));
    const coralCols = [0xff5a7a, 0xff9a3a, 0xb84aff, 0xffd84a, 0x4ae8c8, 0xff6ad0];
    for (let i = 0; i < 40; i++) {
      const [x, z] = around(i, 332, 7.5, 22); const c = mat({ color: coralCols[i % coralCols.length] }), g = new THREE.Group(), kind = i % 3;
      if (kind === 0) for (let j = 0; j < 4; j++) g.add(rot(at(cyl(0.08, 0.12, 1 + hash(i, j) * 0.8, 5, c), (hash(i, j, 3) - 0.5) * 0.6, 0.5, (hash(i, j, 4) - 0.5) * 0.6), (hash(i, j, 5) - 0.5) * 0.6, 0, (hash(i, j, 6) - 0.5) * 0.6));
      else if (kind === 1) g.add(at(ico(0.5 + hash(i, 333) * 0.4, 0, c), 0, 0.3, 0));
      else g.add(at(cone(0.5, 1.2, 6, c), 0, 0.6, 0));
      G.add(at(g, x, 0, z));
    }
    const kelpM = mat({ color: 0x3a8a3a, side: THREE.DoubleSide }), kelp = [];
    for (let i = 0; i < 26; i++) { const [x, z] = around(i, 334, 9, 26); const g = new THREE.Group(); let top = g; const segs = 8 + Math.floor(hash(i, 335) * 5); for (let j = 0; j < segs; j++) { const s = at(box(0.25, 0.6, 0.04, kelpM), 0, 0.3, 0); top.add(s); const nx = new THREE.Group(); nx.position.y = 0.6; top.add(nx); top = nx; kelp.push([nx, i, j]); } G.add(at(g, x, 0, z)); }
    const hull = new THREE.Group(), wood = mat({ map: tex(16, 16, (x, r) => { px(x, '#4a3a2a', 0, 0, 16, 16); for (let y = 0; y < 16; y += 3) px(x, '#2a2016', 0, y, 16, 1); noise(x, r, 16, 16, ['#3a6a4a', '#5a4a3a'], 40); }, 336), rep: [4, 2] });
    hull.add(at(box(4, 3, 14, wood), 0, 1.5, 0)); hull.add(rot(at(cyl(0.2, 0.25, 8, 5, wood), 0, 5, 1), 0.5, 0, 0.3));
    G.add(rot(at(hull, -12, -0.5, -22), 0.1, 0.6, 0.35));
    const chest = new THREE.Group(), cw = mat({ color: 0x7a4a22 }), goldM = mat({ color: 0xffd84a, unlit: 1 });
    chest.add(at(box(0.9, 0.5, 0.6, cw), 0, 0.25, 0)); chest.add(at(box(0.8, 0.1, 0.5, goldM), 0, 0.5, 0));
    const lid = new THREE.Group(); lid.add(at(box(0.9, 0.2, 0.6, cw), 0, 0.1, 0.3)); G.add(at(lid, 3.3, 0.5, -3.8 - 0.3)); G.add(at(chest, 3.3, 0, -3.8));
    const fishCols = [0xffa02a, 0x2ad8ff, 0xffe04a, 0xff5aa0, 0xffffff], fish = [];
    for (let i = 0; i < 34; i++) { const f = new THREE.Group(), fm = mat({ color: fishCols[i % fishCols.length] }); f.add(box(0.1, 0.18, 0.34, fm)); f.add(rot(at(cone(0.1, 0.16, 3, fm), 0, 0, -0.22), -PI / 2, 0, 0)); G.add(f); fish.push([f, i]); }
    const bubbleM = mat({ color: 0xd8f4ff, unlit: 1 }), bubbles = [];
    for (let i = 0; i < 40; i++) { const b = ico(0.06 + hash(i, 337) * 0.06, 0, bubbleM); G.add(b); bubbles.push([b, i]); }
    const jelly = []; for (let i = 0; i < 4; i++) { const j = new THREE.Group(), jm = mat({ color: 0xffa8e0, unlit: 1 }); j.add(new THREE.Mesh(new THREE.SphereGeometry(0.4, 8, 4, 0, TAU, 0, PI / 2), jm)); for (let s = 0; s < 4; s++) j.add(at(box(0.03, 0.7, 0.03, jm), Math.cos(s * 1.6) * 0.2, -0.35, Math.sin(s * 1.6) * 0.2)); G.add(j); jelly.push([j, i]); }
    const surfT = tex(16, 16, (x, r) => { px(x, '#4ab8e8', 0, 0, 16, 16); noise(x, r, 16, 16, ['#8ae0ff', '#2a8ac8'], 60); }, 338), surfM = mat({ map: surfT, rep: [30, 30], unlit: 1, side: THREE.DoubleSide });
    G.add(flat(200, 200, surfM, 0, 16, 0));
    return {
      group: G, sky: grad([[0, '#2a8ac8'], [1, '#0a3a6a']]), shadowCol: 0x8a7a4a,
      light() { lights(0x3a7aa0, 0x9ae0ff, [0.2, -1, 0.1], 0x0e4a7a, [7, 42]); },
      anim(t) {
        const h = barHit(t); lid.rotation.x = -1.2 * h; pt(0, 3.3, 1, -3.8, 1.6 * h, 1.3 * h, 0.3 * h);
        kelp.forEach(([g, i, j]) => { g.rotation.z = 0.12 * Math.sin(t * 1.2 + i + j * 0.5); g.rotation.x = 0.08 * Math.sin(t * 0.9 + i * 2 + j * 0.4); });
        fish.forEach(([f, i]) => { const R = 7.5 + (i % 5) * 0.8, a = t * (0.35 + (i % 3) * 0.05) + i * 0.19, y = 2 + (i % 4) * 0.6 + Math.sin(t + i) * 0.2; f.position.set(Math.sin(a) * R, y, -Math.cos(a) * R); f.rotation.y = a + PI / 2 + PI; });
        bubbles.forEach(([b, i]) => { const [x, z] = around(i, 339, 2.5, 10), u = fr(t * 0.18 + hash(i, 340)); b.position.set(x + Math.sin(t * 3 + i) * 0.1, u * 16, z); });
        jelly.forEach(([j, i]) => { j.position.set(-6 + i * 4, 4 + i * 0.7 + Math.sin(t * 0.8 + i) * 0.5, -9 - i); j.scale.y = 1 + 0.15 * Math.sin(t * 3 + i); });
        surfM.uniforms.uOff.value.set(t * 0.05, t * 0.03);
      },
    };
  }

  // ---------- volcano: basalt with glowing cracks, lava rivers, the volcano erupting on every bar, embers rising ----------
  function volcano() {
    const G = new THREE.Group();
    const basalt = tex(32, 32, (x, r) => { px(x, '#2a2226', 0, 0, 32, 32); noise(x, r, 32, 32, ['#1e181a', '#3a3034', '#241c1e'], 300); for (let i = 0; i < 5; i++) { let X = Math.floor(r() * 32), Y = Math.floor(r() * 32); for (let s = 0; s < 8; s++) { px(x, '#ff9a2a', X, Y); X = (X + (r() < 0.5 ? 1 : 0) + 32) % 32; Y = (Y + 1) % 32; } } selfLit(x, 32, 32); }, 341);
    G.add(flat(240, 240, mat({ map: basalt, rep: [60, 60] })));
    const lavaT = tex(16, 16, (x, r) => { px(x, '#ff6a1a', 0, 0, 16, 16); noise(x, r, 16, 16, ['#ffd24a', '#e83a0a', '#ffa02a'], 90); }, 342);
    const rivers = [-9.5, 9.5].map(x => { const m = mat({ map: lavaT, rep: [2, 30], unlit: 1 }); G.add(flat(3, 120, m, x, 0.01, -40)); return m; });
    const rockM = mat({ map: basalt, rep: [2, 2] });
    for (let i = 0; i < 26; i++) { const [x, z] = around(i, 343, 8, 30); if (Math.abs(Math.abs(x) - 9.5) < 2.5) continue; G.add(rot(at(ico(0.4 + hash(i, 344) * 1.4, 0, rockM), x, 0.2, z), hash(i, 1), hash(i, 2), 0)); }
    const volT = tex(16, 16, (x, r) => { px(x, '#3a2a28', 0, 0, 16, 16); noise(x, r, 16, 16, ['#2a1e1c', '#4a3834'], 60); for (let i = 0; i < 4; i++) px(x, '#ff7a1a', Math.floor(r() * 16), 0, 1, 16); selfLit(x, 16, 16); }, 345);
    G.add(at(cyl(6, 42, 38, 12, mat({ map: volT, rep: [6, 3] })), 0, 19, -110));
    G.add(at(cyl(6, 6, 0.5, 12, mat({ color: 0xffa02a, unlit: 1 })), 0, 38.1, -110));
    const blobs = []; for (let i = 0; i < 14; i++) { const b = ico(1 + hash(i, 346) * 1.2, 0, mat({ color: 0xff8a1a, unlit: 1 })); G.add(b); blobs.push([b, i]); }
    const smoke = []; for (let i = 0; i < 10; i++) { const s = box(6, 6, 6, mat({ color: 0x2a2020 })); G.add(s); smoke.push([s, i]); }
    const embers = []; for (let i = 0; i < 70; i++) { const e = box(0.05, 0.05, 0.05, mat({ color: 0xffb03a, unlit: 1 })); G.add(e); embers.push([e, i]); }
    return {
      group: G, sky: grad([[0, '#1a0608'], [0.6, '#5a1a10'], [1, '#c84a1a']]), shadowCol: 0x120a0a,
      light() { lights(0x7a4c44, 0xff9a60, [0.2, -0.8, 0.6], 0x4a1a12, [24, 115], 12); },
      anim(t) {
        rivers.forEach(m => m.uniforms.uOff.value.set(0, t * 0.4));
        const f = 1 + 0.3 * Math.sin(t * 7) * Math.sin(t * 3.1);
        pt(0, -9.5, 0.8, -2, 2.4 * f, 1.0 * f, 0.2); pt(1, 9.5, 0.8, -2, 2.4 * f, 1.0 * f, 0.2); pt(2, -9.5, 0.8, -12, 2 * f, 0.8 * f, 0.2); pt(3, 9.5, 0.8, -12, 2 * f, 0.8 * f, 0.2);
        const u = fr(beat(t) / 4) * 2.2;
        blobs.forEach(([b, i]) => { const a = hash(i, 347) * TAU, v = 10 + hash(i, 348) * 10, vy = 22 + hash(i, 349) * 14, y = 38 + vy * u - 12 * u * u; b.visible = y > 30; b.position.set(Math.cos(a) * v * u, y, -110 + Math.sin(a) * v * u); });
        smoke.forEach(([s, i]) => { const w = fr(t * 0.05 + i / 10); s.position.set(Math.sin(i) * 4 + w * 12, 40 + w * 40, -110); s.scale.setScalar(0.6 + w * 2.2); });
        embers.forEach(([e, i]) => { const [x, z] = around(i, 350, 1.5, 12), w = fr(t * 0.3 + hash(i, 351)); e.position.set(x + Math.sin(t * 2 + i) * 0.3, w * 6, z); });
      },
    };
  }

  // ---------- Tokyo alley at night: neon signs flicker on the beat, paper lanterns, vending machines, rain ----------
  function tokyo() {
    const G = new THREE.Group();
    const wet = tex(32, 32, (x, r) => { px(x, '#24222e', 0, 0, 32, 32); noise(x, r, 32, 32, ['#1a1822', '#34303e', '#ff4fa0', '#3ad4ff'], 180); }, 361);
    G.add(flat(13, 100, mat({ map: wet, rep: [5, 40] }), 0, 0, -35));
    const bases = ['#3a3040', '#2e3444', '#40343a', '#2a3a3a'];
    for (const s of [-1, 1]) for (let i = 0; i < 12; i++) { const h = 8 + hash(i, s + 5) * 14, z = 8 - i * 7.5; G.add(at(box(5, h, 7.2, mat({ map: facade(bases[(i + (s > 0 ? 1 : 0)) % 4], 362 + i + (s > 0 ? 40 : 0), 0.5), rep: [2, Math.round(h / 3)] })), s * 9, h / 2, z)); }
    G.add(at(box(14, 20, 1, mat({ map: facade('#2a2838', 363, 0.5), rep: [4, 6] })), 0, 10, -82));
    const NE = ['#ff3fa4', '#3fd4ff', '#ffe23f', '#6aff6a', '#ff7a3a', '#c86aff'], words = ['寿司', 'ラーメン', 'カラオケ', 'サクソ', 'バー', 'ホテル', '酒', 'ゲーム'];
    const neon = [];
    for (let i = 0; i < 14; i++) {
      const s = i % 2 ? 1 : -1, z = 5 - Math.floor(i / 2) * 5.5, col = NE[i % NE.length], w = words[i % words.length];
      const t2 = tex(16, 64, x => { px(x, '#120e18', 0, 0, 16, 64); px(x, col, 0, 0, 16, 1); px(x, col, 0, 63, 16, 1); x.fillStyle = col; x.font = 'bold 12px sans-serif'; x.textAlign = 'center'; [...w].forEach((c, j) => x.fillText(c, 8, 14 + j * 13)); });
      const m = mat({ map: t2, unlit: 1 }), b = at(box(0.3, 3, 0.9, m), s * 6.3, 4.2 + (i % 3) * 0.6, z); G.add(b); neon.push([m, i, new THREE.Color(col), s * 6, z]);
    }
    const lanternM = mat({ color: 0xff5a2a, unlit: 1 }), lanterns = [];
    for (let z = 4; z > -40; z -= 4.5) { G.add(at(box(12.6, 0.02, 0.02, mat({ color: 0x111111 })), 0, 5.2, z)); for (const x of [-3.5, 0, 3.5]) { const l = new THREE.Group(); l.add(at(cyl(0.22, 0.22, 0.5, 8, lanternM), 0, -0.35, 0)); l.add(at(box(0.3, 0.05, 0.3, mat({ color: 0x111111 })), 0, -0.08, 0)); G.add(at(l, x, 5.2, z)); lanterns.push([l, x + z]); } }
    const vendT = tex(16, 32, x => { px(x, '#e8e8f0', 0, 0, 16, 32); px(x, 'rgba(255,240,180,0.8)', 1, 2, 14, 16); for (let i = 2; i < 14; i += 3) for (let j = 4; j < 18; j += 5) px(x, ['#e8322a', '#2a8ae8', '#f2c21a', '#2ab85a'][(i + j) % 4], i, j, 2, 3); px(x, '#222', 3, 24, 10, 3); selfLit(x, 16, 32); });
    for (const z of [-2.4, -3.5]) G.add(at(box(0.8, 1.9, 1, mat({ map: vendT })), -6.1, 0.95, z));
    for (const z of [-6, -9]) G.add(at(box(1.2, 0.02, 1.6, mat({ color: 0x2a3a5a, unlit: 1 })), 2.5 - z * 0.1, 0.003, z));
    const rain = fall(G, 200, mat({ color: 0x9ab8e8, unlit: 1 }), new THREE.BoxGeometry(0.015, 0.5, 0.015), { w: 22, top: 14, speed: 14, drift: 0, seed: 364 });
    return {
      group: G, sky: grad([[0, '#0a0614'], [0.7, '#1e1030'], [1, '#3a1a40']]), shadowCol: 0x141220,
      light() { lights(0x585078, 0x6060a0, [0.2, -1, -0.3], 0x1a1030, [15, 70], 8); },
      anim(t) {
        const n = beatN(t), h = hit(t); let li = 0;
        neon.forEach(([m, i, c, x, z]) => { const on = hash(i, n) > 0.12, kk = on ? 0.8 + 0.2 * h : 0.15; m.uniforms.uCol.value.setRGB(kk, kk, kk); if (li < 4 && Math.abs(z) < 8 && on) { pt(li++, x, 4.5, z, c.r * 1.6, c.g * 1.6, c.b * 1.6); } });
        lanterns.forEach(([l, s]) => { l.rotation.z = 0.08 * Math.sin(t * 1.5 + s); });
        rain(t);
      },
    };
  }

  // ---------- farm: red barn and silo, hay bales, pecking chickens on the beat, a cow, sunflowers, a tractor ----------
  function farm() {
    const G = new THREE.Group();
    G.add(flat(240, 240, mat({ map: groundTex('#5a9a3a', ['#4e8a32', '#6aaa46', '#7ab85a', '#8a7a3a'], 381), rep: [80, 80] })));
    const barnT = tex(16, 16, (x, r) => { px(x, '#b82a22', 0, 0, 16, 16); for (let i = 0; i < 16; i += 2) px(x, '#8a1e18', i, 0, 1, 16); }, 382);
    const barn = new THREE.Group(); barn.add(at(box(10, 6, 8, mat({ map: barnT, rep: [5, 3] })), 0, 3, 0));
    barn.add(at(prism(5.9, 8.4, mat({ color: 0x5a5a5e }), 'z'), 0, 8.95, 0));
    const doorT = tex(16, 16, x => { px(x, '#8a1e18', 0, 0, 16, 16); x.strokeStyle = '#f4f0e8'; x.lineWidth = 1.5; x.strokeRect(1, 1, 14, 14); x.beginPath(); x.moveTo(1, 1); x.lineTo(15, 15); x.moveTo(15, 1); x.lineTo(1, 15); x.stroke(); });
    barn.add(at(box(3.4, 3.8, 0.1, mat({ map: doorT })), 0, 1.9, 4.02)); barn.add(at(box(1.6, 1.4, 0.1, mat({ map: doorT })), 0, 5, 4.02));
    G.add(rot(at(barn, 0, 0, -18), 0, 0.12, 0));
    G.add(at(cyl(2, 2, 11, 10, mat({ map: tex(16, 16, (x, r) => { px(x, '#b8bcc4', 0, 0, 16, 16); for (let y = 0; y < 16; y += 4) px(x, '#8a8e96', 0, y, 16, 1); }), rep: [4, 4] })), 8, 5.5, -19)); G.add(at(new THREE.Mesh(new THREE.SphereGeometry(2, 10, 5, 0, TAU, 0, PI / 2), mat({ color: 0x8a8e96 })), 8, 11, -19));
    const fenceM = mat({ color: 0xe8e0d0 }), fparts = [];
    for (let i = 0; i < 44; i++) { const a = PI * 0.35 + i / 43 * PI * 1.3, R = 11.5; const x = Math.sin(a) * R, z = -Math.cos(a) * R; fparts.push(at(new THREE.Mesh(new THREE.BoxGeometry(0.1, 1.1, 0.1)), x, 0.55, z)); const b1 = at(new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.08, 0.05)), x, 0.8, z); b1.rotation.y = -a + PI / 2; fparts.push(b1); const b2 = at(new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.08, 0.05)), x, 0.45, z); b2.rotation.y = -a + PI / 2; fparts.push(b2); }
    G.add(merged(fparts, fenceM));
    const hayM = mat({ map: tex(16, 16, (x, r) => { px(x, '#e8c86a', 0, 0, 16, 16); noise(x, r, 16, 16, ['#d8b04a', '#f4dc8a', '#c89a3a'], 90); }, 383) });
    for (const [x, z, ry] of [[-5, -5.5, 0.3], [-6.4, -4.6, 1.2], [5.5, -6.5, -0.2], [-5.6, -5.2, 0.8]]) G.add(rot(at(cyl(0.7, 0.7, 1.2, 10, hayM), x, 0.7, z), 0, ry, PI / 2));
    const chickens = []; for (let i = 0; i < 7; i++) { const [x, z] = around(i, 384, 5, 7.5, -PI * 0.55, PI * 0.55); const c = new THREE.Group(), wm = mat({ color: 0xf8f8f0 }); c.add(at(box(0.3, 0.26, 0.4, wm), 0, 0.3, 0)); const head = new THREE.Group(); head.add(at(box(0.16, 0.2, 0.16, wm), 0, 0.1, 0)); head.add(at(box(0.05, 0.08, 0.1, mat({ color: 0xe8322a })), 0, 0.22, 0)); head.add(at(box(0.06, 0.04, 0.08, mat({ color: 0xf2a21a })), 0, 0.08, 0.1)); c.add(at(head, 0, 0.42, 0.2)); for (const s of [-0.07, 0.07]) c.add(at(box(0.03, 0.18, 0.03, mat({ color: 0xf2a21a })), s, 0.09, 0)); G.add(rot(at(c, x, 0, z), 0, hash(i, 385) * TAU, 0)); chickens.push([head, i]); }
    const cow = new THREE.Group(), spot = mat({ map: tex(16, 16, (x, r) => { px(x, '#f4f4ee', 0, 0, 16, 16); for (let i = 0; i < 5; i++) { const X = Math.floor(r() * 12), Y = Math.floor(r() * 12); px(x, '#1a1a1a', X, Y, 3 + Math.floor(r() * 3), 3 + Math.floor(r() * 2)); } }, 386) });
    cow.add(at(box(0.9, 0.9, 1.8, spot), 0, 1.1, 0)); for (const [dx, dz] of [[-0.3, -0.7], [0.3, -0.7], [-0.3, 0.7], [0.3, 0.7]]) cow.add(at(box(0.2, 0.7, 0.2, spot), dx, 0.35, dz));
    const cowHead = new THREE.Group(); cowHead.add(at(box(0.5, 0.5, 0.6, spot), 0, 0, 0.2)); cowHead.add(at(box(0.4, 0.25, 0.1, mat({ color: 0xf2a8a8 })), 0, -0.1, 0.52)); for (const s of [-1, 1]) cowHead.add(at(box(0.2, 0.08, 0.08, mat({ color: 0xe8e0c8 })), s * 0.32, 0.25, 0.05)); cow.add(at(cowHead, 0, 1.4, 0.9));
    G.add(rot(at(cow, -13, 0, -9), 0, 0.9, 0));
    const flowers = []; for (let i = 0; i < 14; i++) { const x = -9 - (i % 2) * 0.8, z = 2 - i * 1.1; const f = new THREE.Group(); f.add(at(cyl(0.03, 0.04, 2, 4, mat({ color: 0x3a7a2a })), 0, 1, 0)); f.add(rot(at(cyl(0.3, 0.3, 0.05, 10, mat({ map: tex(8, 8, x => { px(x, '#ffd21a', 0, 0, 8, 8); px(x, '#5a3a1a', 2, 2, 4, 4); }) })), 0, 2, 0), PI / 2 - 0.2, 0, 0)); G.add(rot(at(f, x, 0, z), 0, 0.9, 0)); flowers.push([f, i]); }
    const tr = new THREE.Group(), trR = mat({ color: 0xd8322a }), tyre = mat({ color: 0x1a1a1a }); tr.add(at(box(1.4, 1, 2.6, trR), 0, 1.1, 0)); tr.add(at(box(1.2, 1.1, 1.1, mat({ color: 0x9ad0f0 })), 0, 2.1, -0.5)); tr.add(at(cyl(0.08, 0.08, 1, 5, mat({ color: 0x333333 })), 0.4, 2.1, 0.9));
    for (const [x, z, r] of [[-0.85, -0.8, 0.8], [0.85, -0.8, 0.8], [-0.8, 1, 0.45], [0.8, 1, 0.45]]) tr.add(rot(at(cyl(r, r, 0.4, 10, tyre), x, r, z), 0, 0, PI / 2));
    G.add(rot(at(tr, 12, 0, -5), 0, -0.6, 0));
    const scare = new THREE.Group(); scare.add(at(cyl(0.05, 0.05, 2.4, 4, mat({ color: 0x6a4a2a })), 0, 1.2, 0)); scare.add(at(box(1.6, 0.06, 0.06, mat({ color: 0x6a4a2a })), 0, 1.8, 0)); scare.add(at(box(0.5, 0.7, 0.3, mat({ color: 0x3a6ab8 })), 0, 1.6, 0)); scare.add(at(sph(0.2, 6, 4, hayM), 0, 2.15, 0)); scare.add(at(cone(0.3, 0.3, 6, mat({ color: 0x8a6a2a })), 0, 2.38, 0)); G.add(at(scare, 3.5, 0, -7));
    const clouds = []; for (let i = 0; i < 6; i++) { const c = new THREE.Group(); for (let j = 0; j < 3; j++) c.add(at(box(6, 1.6, 2.4, mat({ color: 0xffffff, unlit: 1 })), (j - 1) * 4, j === 1 ? 0.8 : 0, 0)); G.add(c); clouds.push([c, i]); }
    return {
      group: G, sky: grad([[0, '#3a8ae0'], [0.7, '#9ad0f4'], [1, '#e8f4ff']]), shadowCol: 0x3a6a26,
      light() { lights(0x8a9488, 0xfff4d8, [0.5, -1, -0.4], 0xc8e4f4, [35, 140]); },
      anim(t) {
        chickens.forEach(([head, i]) => { const p = Math.max(0, Math.sin((beat(t) + i * 0.29) * TAU)); head.rotation.x = 1.1 * p * p; });
        cowHead.rotation.x = 0.15 * Math.sin(t * 2); cowHead.rotation.z = 0.1 * Math.sin(t * 3.3);
        flowers.forEach(([f, i]) => { f.rotation.z = 0.06 * Math.sin(t * 1.4 + i * 0.6); });
        clouds.forEach(([c, i]) => c.position.set(((hash(i, 387) * 180 + t * 0.8) % 180) - 90, 24 + hash(i, 388) * 10, -70 - hash(i, 389) * 40));
      },
    };
  }

  // ---------- graveyard: tombstones, a crypt, dead trees, a huge moon, bats, glowing pumpkins, drifting ghosts ----------
  function graveyard() {
    const G = new THREE.Group();
    G.add(flat(220, 220, mat({ map: groundTex('#2a3a2a', ['#223022', '#344434', '#3a3226', '#1a261a'], 391), rep: [70, 70] })));
    const tombT = tex(8, 16, (x, r) => { px(x, '#8a8e90', 0, 0, 8, 16); noise(x, r, 8, 16, ['#7a7e80', '#9a9ea0', '#5a6a5a'], 30); x.fillStyle = '#3a3e40'; x.font = 'bold 4px monospace'; x.fillText('RIP', 1, 7); }, 392);
    const tm = mat({ map: tombT }), tombs = [];
    for (let i = 0; i < 34; i++) { const [x, z] = around(i, 393, 4.5, 20); if (!clear(x, z, 7, 4.5)) continue; const g = new THREE.Group(), w = 0.5 + hash(i, 394) * 0.3, h = 0.6 + hash(i, 395) * 0.5; if (i % 4 === 0) { g.add(at(box(0.14, h + 0.4, 0.14, tm), 0, (h + 0.4) / 2, 0)); g.add(at(box(0.6, 0.14, 0.14, tm), 0, h * 0.8, 0)); } else { g.add(at(box(w, h, 0.18, tm), 0, h / 2, 0)); g.add(rot(at(cyl(w / 2, w / 2, 0.18, 8, tm), 0, h, 0), PI / 2, 0, 0)); } g.rotation.set((hash(i, 396) - 0.5) * 0.2, (hash(i, 397) - 0.5) * 0.6, (hash(i, 398) - 0.5) * 0.2); G.add(at(g, x, 0, z)); }
    const crypt = new THREE.Group(), cs = mat({ map: tombT, rep: [3, 2] });
    crypt.add(at(box(5, 3.6, 4, cs), 0, 1.8, 0)); crypt.add(at(prism(2.4, 5.4, cs, 'x'), 0, 4.8, 0));
    for (const s of [-1.8, -0.9, 0.9, 1.8]) crypt.add(at(cyl(0.2, 0.2, 3.6, 6, cs), s, 1.8, 2.1));
    // doorway: stone jambs + lintel, a dark recess and a dim green glow inset in it (a bare full-bright slab read as a floating placeholder)
    for (const s of [-0.68, 0.68]) crypt.add(at(box(0.16, 2.4, 0.16, cs), s, 1.2, 2.06));
    crypt.add(at(box(1.6, 0.22, 0.2, cs), 0, 2.5, 2.08)); crypt.add(at(box(1.8, 0.12, 0.5, cs), 0, 0.06, 2.25));
    crypt.add(at(box(1.2, 2.3, 0.04, mat({ color: 0x08120c })), 0, 1.15, 2.02));
    const glow = at(box(0.8, 1.8, 0.04, mat({ color: 0x3aff8a, unlit: 1 })), 0, 1.02, 2.05); crypt.add(glow);
    G.add(at(crypt, 0, 0, -15));
    const deadM = mat({ color: 0x1a1414 });
    for (let i = 0; i < 9; i++) { const [x, z] = around(i, 399, 11, 22); const tr = new THREE.Group(); tr.add(at(cyl(0.15, 0.3, 5, 5, deadM), 0, 2.5, 0)); for (let j = 0; j < 4; j++) { const b = at(box(0.1, 2 + hash(i, j) * 1.5, 0.1, deadM), 0, 3 + j * 0.5, 0); b.rotation.z = (j % 2 ? 1 : -1) * (0.6 + hash(i, j, 1) * 0.5); b.position.x = (j % 2 ? -1 : 1) * 0.6; tr.add(b); } G.add(rot(at(tr, x, 0, z), 0, hash(i, 400) * TAU, 0)); }
    const fparts = []; for (let i = 0; i < 120; i++) { const a = i / 120 * TAU; fparts.push(at(new THREE.Mesh(new THREE.BoxGeometry(0.06, 1.8, 0.06)), Math.sin(a) * 24, 0.9, -Math.cos(a) * 24)); fparts.push(at(new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.2, 4)), Math.sin(a) * 24, 1.9, -Math.cos(a) * 24)); }
    G.add(merged(fparts, mat({ color: 0x0e0e12 })));
    G.add(at(new THREE.Mesh(new THREE.CircleGeometry(14, 16), mat({ color: 0xf4f0d0, unlit: 1 })), 20, 48, -150));
    const pumpT = tex(16, 8, x => { px(x, '#ff7a1a', 0, 0, 16, 8); px(x, '#c8500a', 3, 0, 1, 8); px(x, '#c8500a', 12, 0, 1, 8); px(x, '#ffe86a', 5, 2, 2, 2); px(x, '#ffe86a', 9, 2, 2, 2); px(x, '#ffe86a', 5, 5, 6, 1); px(x, '#ffe86a', 6, 6, 4, 1); });
    const pumps = [[-3.6, -4.4], [3.2, -4.8], [-6.8, 3], [7, 2.2]], pumpMs = [];
    pumps.forEach(([x, z], i) => { const m = mat({ map: pumpT, unlit: 1 }); const p = sph(0.35, 10, 6, m); p.scale.y = 0.8; p.rotation.y = Math.atan2(-x, -z) + PI; G.add(at(p, x, 0.28, z)); G.add(at(cyl(0.04, 0.05, 0.15, 4, mat({ color: 0x3a5a1a })), x, 0.6, z)); pumpMs.push(m); });
    const bats = []; for (let i = 0; i < 10; i++) { const b = new THREE.Group(), bm = mat({ color: 0x0a0a0e, side: THREE.DoubleSide }); b.add(box(0.15, 0.12, 0.25, bm)); const l = at(box(0.5, 0.02, 0.2, bm), -0.3, 0, 0), r = at(box(0.5, 0.02, 0.2, bm), 0.3, 0, 0); b.add(l, r); G.add(b); bats.push([b, l, r, i]); }
    const ghostM = mat({ color: 0xe8f0ff, unlit: 1 }), ghosts = [];
    for (let i = 0; i < 2; i++) { const g = new THREE.Group(); g.add(at(sph(0.45, 8, 6, ghostM), 0, 0.45, 0)); g.add(at(cyl(0.45, 0.55, 0.9, 8, ghostM), 0, 0, 0)); for (const s of [-0.15, 0.15]) g.add(at(box(0.1, 0.16, 0.05, mat({ color: 0x0a0a0a })), s, 0.5, 0.42)); G.add(g); ghosts.push([g, i]); }
    return {
      group: G, sky: grad([[0, '#040a10'], [0.7, '#10262a'], [1, '#2a4a3e']]), shadowCol: 0x0e160e,
      light() { lights(0x56687a, 0x90a0d0, [-0.3, -0.8, 0.5], 0x1e3028, [13, 60], 6); },
      anim(t) {
        const n = beatN(t);
        pumps.forEach(([x, z], i) => { const f = 0.8 + 0.3 * Math.sin(t * 9 + i * 3) * Math.sin(t * 4.3 + i); pt(i, x, 0.7, z, 1.8 * f, 0.8 * f, 0.15); pumpMs[i].uniforms.uCol.value.setScalar(0.7 + 0.3 * f); });
        glow.material.uniforms.uCol.value.set(0x3aff8a).multiplyScalar(0.3 + 0.3 * hit(t));
        bats.forEach(([b, l, r, i]) => { const a = t * (0.8 + (i % 3) * 0.2) + i, R = 6 + (i % 4) * 2; b.position.set(Math.sin(a) * R, 5 + (i % 3) + Math.sin(t * 3 + i) * 0.4, -Math.cos(a) * R * 0.6 - 8); b.rotation.y = a + PI / 2; const f = Math.sin(t * 18 + i) * 0.8; l.rotation.z = f; r.rotation.z = -f; });
        ghosts.forEach(([g, i]) => { g.position.set(i ? 7 + Math.sin(t * 0.4) * 2 : -6 + Math.sin(t * 0.5 + 1) * 2, 1.4 + i * 0.5 + Math.sin(t * 1.3 + i) * 0.3, i ? -10 : -8); g.rotation.y = Math.sin(t * 0.6 + i) * 0.5 - (i ? 0.6 : -0.6); g.visible = hash(i, Math.floor(n / 4)) < 0.85; });
      },
    };
  }

  // ---------- pirate ship: plank deck, masts with billowing sails, a waving Jolly Roger, the sea rocking, gulls ----------
  function pirate() {
    const G = new THREE.Group();
    const plank = tex(16, 16, (x, r) => { px(x, '#9a6a3a', 0, 0, 16, 16); for (let i = 0; i < 16; i += 4) px(x, '#6a4424', i, 0, 1, 16); noise(x, r, 16, 16, ['#8a5a2e', '#aa7a48'], 50); }, 401);
    G.add(flat(11, 28, mat({ map: plank, rep: [3, 7] }), 0, 0, -3));
    const hullM = mat({ map: plank, rep: [8, 1], color: 0x8a6a5a });
    for (const s of [-1, 1]) { G.add(at(box(0.3, 3.2, 28, hullM), s * 5.6, -1.4, -3)); G.add(at(box(0.25, 0.12, 28, mat({ color: 0x5a3a1e })), s * 5.55, 1.05, -3)); const posts = []; for (let z = -16; z <= 10; z += 1.3) posts.push(at(new THREE.Mesh(new THREE.BoxGeometry(0.1, 1, 0.1)), s * 5.55, 0.5, z)); G.add(merged(posts, mat({ color: 0x5a3a1e }))); }
    G.add(at(box(11.2, 3.2, 0.3, hullM), 0, -1.4, 11)); G.add(rot(at(cyl(0.15, 0.3, 9, 5, mat({ color: 0x5a3a1e })), 0, 2, -20), -1.2, 0, 0));
    G.add(rot(at(cone(5.6, 6, 4, hullM), 0, -1.4, -19), -PI / 2, PI / 4, 0));
    const mastM = mat({ color: 0x5a3a1e }), sailM = mat({ map: tex(16, 16, (x, r) => { px(x, '#f0e6cc', 0, 0, 16, 16); noise(x, r, 16, 16, ['#e0d4b4', '#f8f0dc'], 30); px(x, '#c8b890', 0, 5, 16, 1); px(x, '#c8b890', 0, 10, 16, 1); }, 402), side: THREE.DoubleSide });
    const sails = [];
    for (const [z, h] of [[-5.5, 16], [-13, 13]]) { G.add(at(cyl(0.22, 0.32, h, 6, mastM), 0, h / 2, z)); for (const [y, w] of [[h * 0.45, 7], [h * 0.78, 5]]) { G.add(at(box(w + 1, 0.15, 0.15, mastM), 0, y + 2.2, z)); const s = at(box(w, 4, 0.08, sailM), 0, y, z + 0.3); G.add(s); sails.push([s, y, z]); } G.add(at(cyl(0.7, 0.6, 0.6, 8, mastM), 0, h * 0.9, z)); }
    const flagT = tex(16, 12, x => { px(x, '#111111', 0, 0, 16, 12); px(x, '#f4f4f0', 6, 2, 4, 4); px(x, '#111', 7, 3, 1, 1); px(x, '#111', 9, 3, 1, 1); px(x, '#f4f4f0', 4, 7, 8, 1); px(x, '#f4f4f0', 5, 8, 1, 2); px(x, '#f4f4f0', 10, 8, 1, 2); });
    const flag = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 1.6, 6, 1), mat({ map: flagT, side: THREE.DoubleSide })); G.add(at(flag, 1.2, 15.5, -5.5)); const flagP = flag.geometry.attributes.position, flagX = Array.from({ length: flagP.count }, (_, i) => flagP.getX(i));
    const ropeM = mat({ color: 0x3a2a1a }), ropes = [];
    for (const s of [-1, 1]) for (const z of [-5.5, -13]) { const top = new THREE.Vector3(0, z === -5.5 ? 14 : 11.5, z), bot = new THREE.Vector3(s * 5.5, 1, z + 2.5), d = top.clone().sub(bot), r = box(0.04, d.length(), 0.04, ropeM); r.position.copy(bot.clone().add(top).multiplyScalar(0.5)); r.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize()); ropes.push(r); G.add(r); }
    const barrel = mat({ map: tex(8, 8, x => { px(x, '#7a4e2a', 0, 0, 8, 8); px(x, '#3a3a3a', 0, 1, 8, 1); px(x, '#3a3a3a', 0, 6, 8, 1); }), rep: [3, 1] });
    for (const [x, z] of [[-3.4, -3.2], [-4.1, -4], [-3.6, -4.8]]) G.add(at(cyl(0.35, 0.3, 0.9, 8, barrel), x, 0.45, z));
    G.add(at(box(0.9, 0.55, 0.6, mat({ color: 0x6a3a1a })), 3.2, 0.28, -3.6)); G.add(at(box(0.8, 0.1, 0.5, mat({ color: 0xffd84a, unlit: 1 })), 3.2, 0.58, -3.6));
    for (const s of [-1, 1]) for (const z of [-4, -8, -11]) G.add(rot(at(cyl(0.16, 0.2, 1.4, 8, mat({ color: 0x1a1a1e })), s * 4.9, 0.5, z), 0, 0, s * PI / 2));
    const seaT = tex(32, 32, (x, r) => { px(x, '#1e6aa8', 0, 0, 32, 32); noise(x, r, 32, 32, ['#2a7ab8', '#165a94', '#4a9ad0'], 200); for (let i = 0; i < 6; i++) px(x, '#e8f4ff', Math.floor(r() * 28), Math.floor(r() * 32), 3, 1); }, 403), seaM = mat({ map: seaT, rep: [60, 60] });
    const sea = flat(400, 400, seaM, 0, -2.4, 0); G.add(sea);
    const isles = new THREE.Group(); for (const [x, z, s] of [[-60, -120, 1], [70, -140, 0.7]]) { isles.add(at(new THREE.Mesh(new THREE.SphereGeometry(12 * s, 10, 5, 0, TAU, 0, PI / 2), mat({ color: 0xe0c888 })), x, 0, z)); isles.add(at(cone(10 * s, 14 * s, 6, mat({ color: 0x3a8a3a })), x, 8 * s, z)); } G.add(isles);
    const gulls = []; for (let i = 0; i < 5; i++) { const b = new THREE.Group(), gm = mat({ color: 0xf4f4f0, side: THREE.DoubleSide }); const l = at(box(0.6, 0.03, 0.15, gm), -0.3, 0, 0), r = at(box(0.6, 0.03, 0.15, gm), 0.3, 0, 0); b.add(box(0.12, 0.1, 0.3, gm), l, r); G.add(b); gulls.push([b, l, r, i]); }
    return {
      group: G, sky: grad([[0, '#2a7ad8'], [0.7, '#8ac4f0'], [1, '#d8f0ff']]), shadowCol: 0x5a3a1c,
      light() { lights(0x8a8e9a, 0xfff0d0, [0.4, -1, -0.5], 0xb8dcf0, [35, 170]); },
      anim(t) {
        const roll = Math.sin(t * 0.7) * 0.03, bob = Math.sin(t * 0.9) * 0.4;   // the world rocks around the deck, which stays level
        sea.position.y = -2.4 + bob; sea.rotation.y = roll; isles.position.y = bob * 2; isles.rotation.z = roll; seaM.uniforms.uOff.value.set(t * 0.02, t * 0.08);
        sails.forEach(([s, y, z], i) => { s.scale.z = 3 + 2 * Math.sin(t * 1.3 + i); s.position.z = z + 0.35 + 0.1 * Math.sin(t * 1.3 + i); });
        for (let i = 0; i < flagP.count; i++) { const x = flagX[i] + 1.2; flagP.setZ(i, Math.sin(t * 6 - x * 2.5) * 0.18 * x); } flagP.needsUpdate = true;
        gulls.forEach(([b, l, r, i]) => { const a = t * 0.3 + i * 1.3, R = 16 + i * 3; b.position.set(Math.sin(a) * R, 14 + i + Math.sin(t + i) * 0.5, -Math.cos(a) * R - 6); b.rotation.y = a + PI / 2; const f = Math.sin(t * 5 + i) * 0.5; l.rotation.z = f; r.rotation.z = -f; });
      },
    };
  }

  // ---------- candy land: lollipops spinning, candy canes, gumdrops, a giant donut arch, a chocolate river ----------
  function candy() {
    const G = new THREE.Group();
    G.add(flat(220, 220, mat({ map: tex(32, 32, (x, r) => { px(x, '#ffb8d8', 0, 0, 32, 32); for (let i = 0; i < 60; i++) px(x, ['#ffffff', '#6ad4ff', '#fff06a', '#8aff8a', '#ff6a8a'][Math.floor(r() * 5)], Math.floor(r() * 31), Math.floor(r() * 31), 2, 1); }, 411), rep: [60, 60] })));
    const swirl = tex(16, 16, x => { px(x, '#ffffff', 0, 0, 16, 16); for (let a = 0; a < 40; a++) { const rr = a / 40 * 8, th = a * 0.6; px(x, '#ff3a7a', 8 + Math.cos(th) * rr, 8 + Math.sin(th) * rr, 2, 2); } });
    const pops = [];
    for (let i = 0; i < 14; i++) { const [x, z] = around(i, 412, 8, 26); if (!clear(x, z)) continue; const h = 2.5 + hash(i, 413) * 3, p = new THREE.Group(); p.add(at(cyl(0.08, 0.08, h, 5, mat({ color: 0xffffff })), 0, h / 2, 0)); const d = rot(at(cyl(1.1, 1.1, 0.18, 14, mat({ map: swirl })), 0, h + 0.9, 0), PI / 2, 0, 0); p.add(d); G.add(rot(at(p, x, 0, z), 0, Math.atan2(x, z), 0)); pops.push([d, i]); }
    const stripe = tex(8, 8, x => { for (let i = 0; i < 8; i += 4) { px(x, '#e8222a', 0, i, 8, 2); px(x, '#ffffff', 0, i + 2, 8, 2); } });
    for (let i = 0; i < 8; i++) { const [x, z] = around(i, 414, 9, 22); if (!clear(x, z)) continue; const c = new THREE.Group(), m = mat({ map: stripe, rep: [1, 6] }); c.add(at(cyl(0.22, 0.22, 4, 8, m), 0, 2, 0)); const hk = rot(at(new THREE.Mesh(new THREE.TorusGeometry(0.6, 0.22, 6, 10, PI), m), 0.6, 4, 0), 0, 0, 0); c.add(hk); G.add(rot(at(c, x, 0, z), 0, hash(i, 415) * TAU, 0)); }
    const gum = [0xff4a6a, 0x4ad4ff, 0xffe04a, 0x8aff6a, 0xc86aff], gd = [];
    for (let i = 0; i < 30; i++) { const [x, z] = around(i, 416, 7.6, 18); gd.push([at(new THREE.Mesh(new THREE.SphereGeometry(0.5 + hash(i, 417) * 0.4, 8, 5, 0, TAU, 0, PI / 2)), x, 0, z), i % gum.length]); }
    gum.forEach((c, ci) => { const ps = gd.filter(g => g[1] === ci).map(g => g[0]); if (ps.length) G.add(merged(ps, mat({ color: c }))); });
    const donut = rot(new THREE.Mesh(new THREE.TorusGeometry(6, 2.2, 8, 16), mat({ map: tex(16, 16, (x, r) => { px(x, '#e8a85a', 0, 0, 16, 16); px(x, '#ff6aa8', 0, 0, 16, 9); for (let i = 0; i < 16; i++) px(x, ['#ffffff', '#6ad4ff', '#fff06a'][i % 3], Math.floor(r() * 15), Math.floor(r() * 8), 2, 1); }, 418), rep: [6, 1] })), 0, 0, 0);
    G.add(at(donut, 0, 6, -24));
    for (let i = 0; i < 5; i++) { const x = -40 + i * 20, z = -80 - hash(i, 419) * 20, s = 10 + hash(i, 420) * 6; G.add(at(cone(s * 0.6, s * 1.6, 8, mat({ map: tex(8, 8, x2 => { px(x2, '#d8a050', 0, 0, 8, 8); px(x2, '#b8803a', 0, 0, 1, 8); px(x2, '#b8803a', 0, 0, 8, 1); }), rep: [6, 6] })), x, s * 0.8, z)); G.children.at(-1).rotation.x = PI; G.add(at(sph(s * 0.75, 10, 8, mat({ color: [0xfff0f4, 0xffa8c8, 0xa8e8c8, 0xc8a8f0, 0xfff0a8][i] })), x, s * 1.6 + s * 0.3, z)); }
    const chocT = tex(16, 16, (x, r) => { px(x, '#6a3a1a', 0, 0, 16, 16); noise(x, r, 16, 16, ['#5a2e12', '#8a5230', '#4a2410'], 60); }, 421), chocM = mat({ map: chocT, rep: [2, 30] });
    G.add(flat(4, 140, chocM, -12, 0.01, -40));
    const puffs = []; for (let i = 0; i < 6; i++) { const c = new THREE.Group(), cm = mat({ color: [0xffc8e8, 0xc8e8ff][i % 2], unlit: 1 }); for (let j = 0; j < 4; j++) c.add(at(ico(2 + hash(i, j) * 1.5, 0, cm), (j - 1.5) * 2.5, hash(i, j, 1) * 1.5, 0)); G.add(c); puffs.push([c, i]); }
    const bears = []; for (let i = 0; i < 5; i++) { const b = new THREE.Group(), bm = mat({ color: [0xff3a3a, 0x3aff6a, 0xffd23a, 0xff8a1a, 0x3ac8ff][i], unlit: 1 }); b.add(at(box(0.4, 0.5, 0.3, bm), 0, 0.35, 0)); b.add(at(box(0.34, 0.3, 0.3, bm), 0, 0.78, 0)); for (const s of [-0.12, 0.12]) b.add(at(box(0.1, 0.1, 0.1, bm), s, 0.97, 0)); G.add(at(b, -4 + i * 2, 0, -5.5 - (i % 2) * 0.8)); bears.push([b, i]); }
    return {
      group: G, sky: grad([[0, '#8ac8ff'], [0.6, '#ffc8e8'], [1, '#fff0f8']]), shadowCol: 0xc85a8a,
      light() { lights(0xb0a0b0, 0xfff0f8, [0.3, -1, -0.4], 0xffd8ec, [28, 130]); },
      anim(t) {
        pops.forEach(([d, i]) => { d.rotation.y = t * (1 + (i % 3) * 0.4) * (i % 2 ? 1 : -1); });
        chocM.uniforms.uOff.value.set(0, t * 0.3); donut.rotation.z = Math.sin(t * 0.5) * 0.05;
        puffs.forEach(([c, i]) => c.position.set(((hash(i, 422) * 160 + t) % 160) - 80, 18 + hash(i, 423) * 10, -50 - hash(i, 424) * 30));
        bears.forEach(([b, i]) => { b.position.y = Math.abs(Math.sin((beat(t) + i * 0.25) * PI)) * 0.4; b.rotation.y = 0.3 * Math.sin((beat(t) + i) * PI); });
      },
    };
  }

  // ---------- Mars: red dust, a rover trundling past, a habitat dome, two moons crossing, dust devils ----------
  function mars() {
    const G = new THREE.Group();
    const dustT = groundTex('#b8603a', ['#a8522e', '#c8704a', '#9a4a28', '#d8845a'], 431);
    G.add(flat(260, 260, mat({ map: dustT, rep: [80, 80] })));
    const rockM = mat({ map: groundTex('#7a3a22', ['#6a3018', '#8a4a2e'], 432, 100), rep: [2, 2] });
    for (let i = 0; i < 30; i++) { const [x, z] = around(i, 433, 8, 40); G.add(rot(at(ico(0.3 + hash(i, 434) * 1.2, 0, rockM), x, 0.1, z), hash(i, 1), hash(i, 2), 0)); }
    for (let i = 0; i < 6; i++) { const a = -1 + i * 0.4, s = 20 + hash(i, 435) * 20; G.add(at(cone(s * 1.8, s, 7, mat({ color: 0x9a4a2e })), Math.sin(a) * 140, s / 2 - 1, -Math.cos(a) * 140)); }
    const dome = new THREE.Group(), white = mat({ color: 0xe8e8ec });
    dome.add(new THREE.Mesh(new THREE.SphereGeometry(4, 12, 6, 0, TAU, 0, PI / 2), mat({ map: tex(16, 16, x => { px(x, '#e8e8ec', 0, 0, 16, 16); for (let i = 0; i < 16; i += 4) { px(x, '#9aa0a8', i, 0, 1, 16); px(x, '#9aa0a8', 0, i, 16, 1); } px(x, 'rgba(255,220,150,0.8)', 5, 10, 6, 3); selfLit(x, 16, 16); }), rep: [4, 2] })));
    dome.add(rot(at(cyl(1, 1, 8, 8, white), 6, 1, 0), 0, 0, PI / 2)); dome.add(at(new THREE.Mesh(new THREE.SphereGeometry(2.4, 10, 5, 0, TAU, 0, PI / 2), white), 11, 0, 0));
    G.add(at(dome, -14, 0, -20));
    const panelM = mat({ map: tex(8, 8, x => { px(x, '#1a2a5a', 0, 0, 8, 8); px(x, '#3a5a9a', 0, 0, 8, 1); px(x, '#3a5a9a', 0, 0, 1, 8); }), rep: [3, 2] });
    for (let i = 0; i < 4; i++) { G.add(rot(at(box(3, 0.08, 1.8, panelM), 4 + i * 3.4, 1.2, -18), -0.5, 0, 0)); G.add(at(cyl(0.06, 0.06, 1.2, 4, white), 4 + i * 3.4, 0.6, -18)); }
    const rover = new THREE.Group(), wheels = [];
    rover.add(at(box(1.6, 0.4, 2.4, mat({ color: 0xd8d8dc })), 0, 0.9, 0)); rover.add(at(box(1.8, 0.05, 1.6, panelM), 0, 1.15, 0.2)); rover.add(at(cyl(0.05, 0.05, 1.2, 4, white), 0.5, 1.7, 0.9)); rover.add(at(box(0.35, 0.25, 0.25, mat({ color: 0x3a3a3a })), 0.5, 2.3, 0.9));
    for (const x of [-0.95, 0.95]) for (const z of [-0.9, 0, 0.9]) { const w = rot(at(cyl(0.3, 0.3, 0.25, 8, mat({ color: 0x3a3a3e })), x, 0.3, z), 0, 0, PI / 2); rover.add(w); wheels.push(w); }
    G.add(rover);
    G.add(at(cyl(0.03, 0.03, 2.2, 4, white), 3, 1.1, -5)); G.add(at(box(1.1, 0.7, 0.03, mat({ map: sign('SAXO', '#ff4f8a', '#ffffff', 32, 16) })), 3.57, 1.85, -5));
    const phobos = ico(3, 0, mat({ color: 0x8a7a6a, unlit: 1 })), deimos = ico(1.6, 0, mat({ color: 0xa89a8a, unlit: 1 })); G.add(phobos, deimos);
    G.add(at(new THREE.Mesh(new THREE.CircleGeometry(4, 12), mat({ color: 0xf8f0e0, unlit: 1 })), 40, 30, -160));
    const devils = []; for (let i = 0; i < 2; i++) { const d = new THREE.Group(); for (let j = 0; j < 8; j++) d.add(at(box(1 + j * 0.5, 0.8, 1 + j * 0.5, mat({ color: 0xd8946a })), 0, j * 1.1, 0)); G.add(d); devils.push([d, i]); }
    return {
      group: G, sky: grad([[0, '#6a3a3a'], [0.6, '#c8805a'], [1, '#e8b890']]), shadowCol: 0x6a2e1a,
      light() { lights(0x8a6a60, 0xffe0c0, [0.5, -0.8, -0.3], 0xc8845a, [35, 160]); },
      anim(t) {
        const x = ((t * 0.9) % 50) - 25; rover.position.set(x, 0, -9); rover.rotation.y = PI / 2; wheels.forEach(w => { w.rotation.x = t * 3; });
        phobos.position.set(-60 + ((t * 2) % 120), 50 + Math.sin(t * 0.05) * 5, -150); deimos.position.set(30 - ((t * 0.8) % 90), 65, -160);
        devils.forEach(([d, i]) => { d.position.set((i ? 25 : -30) + Math.sin(t * 0.2 + i) * 8, 0, -45 - i * 15); d.rotation.y = t * 3; d.children.forEach((c, j) => { c.position.x = Math.sin(t * 2 + j * 0.5) * j * 0.15; }); });
      },
    };
  }

  return { jungle: jungle(), snow: snow(), pyramids: pyramids(), underwater: underwater(), volcano: volcano(), tokyo: tokyo(), farm: farm(), graveyard: graveyard(), pirate: pirate(), candy: candy(), mars: mars() };
}
