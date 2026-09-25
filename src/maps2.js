// maps2.js: eight indoor PS1 maps (supermarket, school hallway, theatre stage, subway platform, bowling alley, arcade,
// office, spaceship bridge). Same contract as maps.js: { group, sky, shadowCol, indoor, light(), anim(t) }, pure in t.
// Saxo stands at the origin facing +z. Rules the cameras need: floor flush at y = 0 under him, nothing taller than
// ~0.3 m inside a 7.5 m radius except behind him (z < -3), ceilings at >= 5.6 m so the crane (up to 5 m) stays inside.
import { mapKit } from './mapkit.js';

export function buildIndoorMaps(K) {
  const k = mapKit(K);
  const { THREE, mat, tex, px, noise, box, selfLit, TAU, PI, beat, hash, fr, hit, barHit, beatN, grad, sign, cyl, cone, sph, ico, at, rot, merged, flat, people, facade, lights, pt, room, stars, fall, figure } = k;

  // ---------- supermarket: aisles of pixel products, flickering tubes, a cereal pyramid, a trolley ----------
  function supermarket() {
    const G = new THREE.Group();
    const tile = tex(16, 16, x => { px(x, '#e4e2dc', 0, 0, 16, 16); px(x, '#c8d4ce', 0, 0, 8, 8); px(x, '#c8d4ce', 8, 8, 8, 8); px(x, '#aeb0aa', 0, 0, 16, 1); px(x, '#aeb0aa', 0, 0, 1, 16); }, 201);
    G.add(flat(18, 18, mat({ map: tile, rep: [12, 12] })));
    const wallT = tex(16, 16, (x, r) => { px(x, '#d6e2da', 0, 0, 16, 16); noise(x, r, 16, 16, ['#cad6ce', '#e0eae4'], 40); px(x, '#3f9a52', 0, 11, 16, 2); px(x, '#e8423a', 0, 13, 16, 1); }, 202);
    room(G, 18, 18, 5.8, wallT, 3, 0xd8d8d0);
    const GOODS = ['#e8423a', '#f2c94c', '#3a7ad0', '#4ab85a', '#f28c28', '#ffffff', '#b04ad0', '#2ab8b0', '#8a5a2e'];
    const goods = seed => tex(32, 32, (x, r) => {
      px(x, '#8e949c', 0, 0, 32, 32);
      for (let y = 0; y < 32; y += 8) { px(x, '#50565e', 0, y + 7, 32, 1); for (let i = 0; i < 32;) { const w = 2 + Math.floor(r() * 3); px(x, GOODS[Math.floor(r() * GOODS.length)], i, y + 2 + Math.floor(r() * 2), w - 1, 4); i += w; } }
    }, seed);
    const shelf = (L, along, x, z, seed) => { const m = mat({ map: goods(seed), rep: [L / 2, 1] }); G.add(at(along === 'x' ? box(L, 2.2, 0.9, m) : box(0.9, 2.2, L, m), x, 1.1, z)); G.add(at(along === 'x' ? box(L, 0.08, 1, mat({ color: 0x5a6068 })) : box(1, 0.08, L, mat({ color: 0x5a6068 })), x, 2.24, z)); };
    shelf(12, 'x', 0, -4.6, 204); shelf(12, 'x', 0, -7.6, 205); shelf(10, 'z', -7.8, 1, 206); shelf(10, 'z', 7.8, 1, 207);
    // hanging aisle signs, swinging a little
    const signs = [];
    for (const [sx, txt] of [[-3.5, 'AISLE 7'], [3.5, 'SNACKS']]) { const p = new THREE.Group(); p.add(at(cyl(0.015, 0.015, 2, 3, mat({ color: 0x444444 })), 0, -1, 0)); p.add(at(box(2, 0.55, 0.05, mat({ map: sign(txt, '#e8423a', '#ffffff') })), 0, -2.2, 0)); G.add(at(p, sx, 5.8, -4.6)); signs.push(p); }
    G.add(at(box(6, 1.1, 0.1, mat({ map: sign('SAXO MART', '#3f9a52', '#ffffff'), unlit: 1 })), 0, 4.2, -8.9));
    // cereal pyramid: boxes stacked 4-3-2-1
    const cereal = mat({ map: tex(8, 16, (x, r) => { px(x, '#f2c94c', 0, 0, 8, 16); px(x, '#e8423a', 0, 2, 8, 4); px(x, '#ffffff', 2, 8, 4, 4); px(x, '#8a5a2e', 3, 9, 2, 2); }, 208) });
    const pyr = []; for (let row = 0; row < 4; row++) for (let i = 0; i < 4 - row; i++) pyr.push(at(new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.42, 0.14)), (i - (3 - row) / 2) * 0.34, 0.21 + row * 0.42, 0));
    const pyramid = merged(pyr, cereal); G.add(at(pyramid, 2.8, 0, -3.3));
    // trolley
    const cart = new THREE.Group(), wire = mat({ color: 0xa8b0b8 }), red = mat({ color: 0xd8322a });
    cart.add(at(box(0.55, 0.4, 0.85, wire), 0, 0.78, 0)); cart.add(at(box(0.6, 0.06, 0.06, red), 0, 1.05, 0.47));
    for (const [x, z] of [[-0.22, -0.35], [0.22, -0.35], [-0.22, 0.35], [0.22, 0.35]]) { cart.add(at(box(0.04, 0.55, 0.04, wire), x, 0.3, z)); cart.add(at(box(0.06, 0.1, 0.1, mat({ color: 0x222222 })), x, 0.05, z)); }
    G.add(rot(at(cart, -3, 0, -3.2), 0, 0.5));
    // fluorescent tubes (a couple flicker)
    const tubes = []; for (const x of [-4.5, -1.5, 1.5, 4.5]) for (let z = -7; z <= 7; z += 3.5) { const tb = at(box(0.25, 0.06, 2.4, mat({ color: 0xf4fff8, unlit: 1 })), x, 5.74, z); G.add(tb); tubes.push(tb); }
    return {
      group: G, sky: grad([[0, '#c8d4ce'], [1, '#e4ece8']]), shadowCol: 0x8a8e88, indoor: true,
      light() { lights(0x8e928c, 0x8a867a, [0.1, -1, -0.25], 0xdfe6e0, [12, 30]); },
      anim(t) {
        const n = beatN(t); tubes.forEach((tb, i) => { tb.visible = hash(i, n, 3) > 0.1; });
        signs.forEach((s, i) => { s.rotation.z = 0.04 * Math.sin(t * 1.6 + i * 2); });
        pyramid.scale.y = 1 + 0.04 * hit(t);
      },
    };
  }

  // ---------- school hallway: lockers (one bangs open every bar), checkered floor, a trophy case, a paper plane ----------
  function school() {
    const G = new THREE.Group(), CZ = 2;
    const chk = tex(16, 16, x => { px(x, '#e8e0c8', 0, 0, 16, 16); px(x, '#9ab89a', 0, 0, 8, 8); px(x, '#9ab89a', 8, 8, 8, 8); }, 211);
    G.add(flat(30, 12, mat({ map: chk, rep: [10, 4] }), 0, 0, CZ));
    const wallT = tex(16, 32, (x, r) => { px(x, '#e8dcb8', 0, 0, 16, 32); noise(x, r, 16, 32, ['#e0d4b0', '#efe4c4'], 60); px(x, '#3a7a58', 0, 20, 16, 12); px(x, '#24503a', 0, 19, 16, 1); }, 212);
    room(G, 30, 12, 5.8, wallT, 5.8, 0xe8e4d8, { cz: CZ });
    const lockT = tex(16, 32, x => { px(x, '#3a6ab8', 0, 0, 16, 32); px(x, '#2a4e8a', 0, 0, 1, 32); for (let y = 3; y < 9; y += 2) px(x, '#1e3a6a', 3, y, 10, 1); px(x, '#c8ccd4', 12, 15, 2, 4); for (let y = 24; y < 30; y += 2) px(x, '#1e3a6a', 3, y, 10, 1); }, 213);
    const lockM = mat({ map: lockT }), parts = [];
    for (let i = -22; i <= 22; i++) { const x = i * 0.62; if (x > -5.8 && x < -3.4) continue; if (Math.abs(x - 1.24) < 0.1) continue; parts.push(at(new THREE.Mesh(new THREE.BoxGeometry(0.6, 1.9, 0.45)), x, 0.95, CZ - 6 + 0.25)); }
    G.add(merged(parts, lockM));
    G.add(at(box(0.6, 1.9, 0.43, mat({ color: 0x0e1a30 })), 1.24, 0.95, CZ - 6 + 0.24));   // the open locker's inside
    const door = new THREE.Group(); door.add(at(box(0.6, 1.9, 0.04, lockM), 0.3, 0.95, 0)); G.add(at(door, 1.24 - 0.3, 0, CZ - 6 + 0.48));
    G.add(at(box(2.3, 1.9, 0.45, mat({ map: tex(16, 16, x => { px(x, '#5a3a22', 0, 0, 16, 16); px(x, '#1a2a38', 1, 1, 14, 14); for (const [X, Y] of [[3, 4], [8, 3], [12, 5], [4, 10], [10, 10]]) { px(x, '#f2c94c', X, Y, 2, 3); px(x, '#f2c94c', X - 1, Y, 4, 1); } }) })), -4.6, 0.95, CZ - 6 + 0.25));
    G.add(at(box(4.4, 0.9, 0.05, mat({ map: sign('GO SAXO!', '#d8322a', '#ffe46a') })), 0, 3.1, CZ - 6 + 0.05));
    const doorT = tex(16, 32, x => { px(x, '#7a5634', 0, 0, 16, 32); px(x, '#a8d0e8', 4, 4, 8, 8); px(x, '#3a2414', 12, 16, 2, 2); });
    for (const x of [-9, -3, 3, 9]) G.add(at(box(1.1, 2.3, 0.06, mat({ map: doorT })), x, 1.15, CZ + 6 - 0.04));
    for (const s of [-1, 1]) { G.add(at(box(0.06, 2.4, 1.8, mat({ map: doorT })), s * 14.96, 1.2, CZ)); G.add(at(box(0.05, 0.3, 0.8, mat({ map: sign('EXIT', '#200000', '#ff3030', 32, 12), unlit: 1 })), s * 14.95, 2.9, CZ)); }
    const panels = []; for (let x = -12; x <= 12; x += 3) { const p = at(box(1.2, 0.05, 0.7, mat({ color: 0xfffcf0, unlit: 1 })), x, 5.76, CZ); G.add(p); panels.push(p); }
    const plane = new THREE.Group(), paper = mat({ color: 0xffffff, side: THREE.DoubleSide });
    plane.add(rot(at(cone(0.12, 0.45, 3, paper), 0, 0, 0), 0, 0, -PI / 2)); G.add(plane);
    return {
      group: G, sky: grad([[0, '#e8dcb8'], [1, '#e8dcb8']]), shadowCol: 0x5a6a50, indoor: true,
      light() { lights(0x96928a, 0x9a9282, [0.2, -1, 0.3], 0xd8d0b8, [12, 34]); },
      anim(t) {
        door.rotation.y = -1.7 * barHit(t);
        const x = ((t * 3.5) % 34) - 17; plane.position.set(x, 2.3 + Math.sin(t * 2) * 0.25, CZ - 3.5); plane.rotation.x = Math.sin(t * 2) * 0.3;
        const n = beatN(t); panels.forEach((p, i) => { p.visible = hash(i, n, 7) > 0.06; });
      },
    };
  }

  // ---------- theatre stage: red curtains, a lighting truss whose lamps change colour on the beat, a full house ----------
  function stage() {
    const G = new THREE.Group();
    const wood = tex(16, 16, (x, r) => { px(x, '#8a5a32', 0, 0, 16, 16); for (let y = 0; y < 16; y += 4) px(x, '#6a4224', 0, y, 16, 1); noise(x, r, 16, 16, ['#7a4e2a', '#9a6a3e'], 40); }, 221);
    G.add(flat(15, 9.5, mat({ map: wood, rep: [8, 5] }), 0, 0, -0.75));
    G.add(at(box(15, 1.2, 0.2, mat({ color: 0x140a08 })), 0, -0.6, 4.05));
    G.add(flat(26, 14, mat({ color: 0x3a0e14 }), 0, -1.2, 11));
    for (let r = 0; r < 7; r++) G.add(at(box(16, 0.8, 0.7, mat({ map: people(222 + r), rep: [4, 1] })), 0, -1.2 + r * 0.3 + 0.4, 5.8 + r * 1.2));
    const curT = tex(16, 16, (x, r) => { px(x, '#a8141e', 0, 0, 16, 16); for (let i = 0; i < 16; i += 4) { px(x, '#6a0a12', i, 0, 1, 16); px(x, '#c8283a', i + 2, 0, 1, 16); } }, 223);
    const back = new THREE.Mesh(new THREE.PlaneGeometry(15, 7.2), mat({ map: curT, rep: [8, 1] })); G.add(at(back, 0, 3.6, -5.5));
    const legs = []; for (const s of [-1, 1]) for (const z of [-2.2, 1.6]) { const l = at(box(1.6, 7.2, 0.2, mat({ map: curT, rep: [1, 1] })), s * 6.4, 3.6, z); G.add(l); legs.push(l); }
    G.add(at(box(15, 1.3, 0.3, mat({ map: sign('SAXO LIVE', '#8a0e18', '#ffd46a', 64, 12) })), 0, 6.5, 3.8));
    const gold = mat({ color: 0xc8962a });
    for (const s of [-1, 1]) G.add(at(box(1.2, 7.8, 0.6, gold), s * 8.1, 3.9, 4.2));
    G.add(at(box(17.4, 1, 0.6, gold), 0, 7.6, 4.2));
    for (const s of [-1, 1]) G.add(rot(at(new THREE.Mesh(new THREE.PlaneGeometry(9.5, 7.8), mat({ color: 0x1a0c0e })), s * 7.5, 3.9, -0.75), 0, -s * PI / 2));
    const ceil = new THREE.Mesh(new THREE.PlaneGeometry(15, 9.5), mat({ color: 0x0a0506 })); ceil.rotation.x = PI / 2; G.add(at(ceil, 0, 7.8, -0.75));
    G.add(at(box(14, 0.25, 0.25, mat({ color: 0x3a3a3a })), 0, 6, 1.2));
    const lamps = []; for (let i = 0; i < 6; i++) { const l = at(box(0.35, 0.4, 0.35, mat({ color: 0xffffff, unlit: 1 })), -5 + i * 2, 5.7, 1.2); G.add(l); lamps.push(l); }
    const foot = []; for (let x = -7; x <= 7; x += 0.7) foot.push(at(new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.1, 0.12)), x, 0.05, 3.85));
    G.add(merged(foot, mat({ color: 0xffe08a, unlit: 1 })));
    G.add(flat(3.2, 3.2, mat({ map: tex(16, 16, x => { x.fillStyle = '#b89868'; x.beginPath(); x.arc(8, 8, 7.5, 0, TAU); x.fill(); }) }), 0, 0.004, 0));
    const PAL = [[1, 0.25, 0.5], [0.3, 0.6, 1], [1, 0.85, 0.3], [0.6, 1, 0.4], [0.8, 0.4, 1]];
    return {
      group: G, sky: grad([[0, '#0a0506'], [1, '#1a0a0c']]), shadowCol: 0x3a2412, indoor: true,
      light() { lights(0x4a3a48, 0xffd8b0, [0, -0.7, -1], 0x120810, [12, 34], 10); },
      anim(t) {
        const n = beatN(t), h = hit(t);
        [[-3.5, 4.5, 2.5], [3.5, 4.5, 2.5], [-1.5, 5, -2], [1.5, 5, -2]].forEach(([x, y, z], i) => { const c = PAL[(((n + i * 2) % PAL.length) + PAL.length) % PAL.length], f = 1.1 + 0.9 * h; pt(i, x, y, z, c[0] * f, c[1] * f, c[2] * f); });
        lamps.forEach((l, i) => { const c = PAL[(((n + i) % PAL.length) + PAL.length) % PAL.length]; l.material.uniforms.uCol.value.setRGB(c[0], c[1], c[2]); });
        legs.forEach((l, i) => { l.scale.x = 1 + 0.06 * Math.sin(t * 1.3 + i); });
        back.position.z = -5.5 + 0.05 * Math.sin(t * 0.9);
      },
    };
  }

  // ---------- subway platform: tiled walls, a station sign, a train roaring through every 16 beats ----------
  function subway() {
    const G = new THREE.Group();
    const conc = tex(16, 16, (x, r) => { px(x, '#8a8a88', 0, 0, 16, 16); noise(x, r, 16, 16, ['#7a7a78', '#9a9a98', '#6e6e6c'], 80); }, 231);
    G.add(flat(24, 10, mat({ map: conc, rep: [12, 5] }), 0, 0, 2));
    G.add(flat(24, 0.4, mat({ map: tex(8, 4, x => { px(x, '#f2c21a', 0, 0, 8, 4); px(x, '#c89a10', 1, 1, 1, 1); px(x, '#c89a10', 5, 2, 1, 1); }), rep: [60, 1] }), 0, 0.004, -2.75));
    G.add(at(box(24, 1.2, 0.2, mat({ color: 0x4a4a48 })), 0, -0.6, -3.1));
    G.add(flat(24, 4.6, mat({ map: tex(16, 16, (x, r) => { px(x, '#3a3632', 0, 0, 16, 16); noise(x, r, 16, 16, ['#2a2622', '#4e4a44', '#5a5048'], 120); }, 232), rep: [12, 2] }), 0, -1.2, -5.3));
    for (const z of [-4.6, -5.9]) G.add(at(box(24, 0.1, 0.08, mat({ color: 0x9a9ca0 })), 0, -1.1, z));
    const tileT = tex(16, 16, x => { px(x, '#e8ece8', 0, 0, 16, 16); for (let i = 0; i < 16; i += 4) { px(x, '#b8bcb8', i, 0, 1, 16); px(x, '#b8bcb8', 0, i, 16, 1); } }, 233);
    room(G, 24, 14.5, 5.6, tileT, 1.2, 0x6a6e70, { cz: -0.25, y0: -1.2 });
    G.add(at(box(24, 0.35, 0.03, mat({ color: 0x2a5aa8 })), 0, 1.4, -7.48));
    for (const x of [-7, 0, 7]) G.add(at(box(4.4, 0.8, 0.05, mat({ map: sign('SAXO ST.', '#1a3a7a', '#ffffff') })), x, 2.7, -7.45));
    const ads = ['DOG FOOD', 'BARK FM', 'SAXO TOUR'];
    ads.forEach((a, i) => G.add(at(box(2.2, 1.3, 0.05, mat({ map: tex(16, 12, (x, r) => { px(x, '#222', 0, 0, 16, 12); px(x, ['#e8423a', '#f2c94c', '#4ab85a'][i], 1, 1, 14, 10); x.fillStyle = '#fff'; x.font = 'bold 4px monospace'; x.fillText(a.slice(0, 5), 1, 7); }, 234 + i) })), [-7, -3.5, 3.5][i], 1.4, 6.72)));
    for (const x of [-11.9, 11.9]) G.add(at(box(0.1, 3.4, 4.2, mat({ color: 0x050505 })), x, 0.5, -5.3));
    for (const [x, z] of [[-7.6, 1], [7.6, 1], [-7.6, 5], [7.6, 5]]) G.add(at(cyl(0.35, 0.35, 5.6, 8, mat({ map: tileT, rep: [3, 5] })), x, 2.8, z));
    const bench = new THREE.Group(); bench.add(at(box(1.8, 0.1, 0.45, mat({ color: 0x8a5a32 })), 0, 0.45, 0)); for (const s of [-0.75, 0.75]) bench.add(at(box(0.08, 0.45, 0.4, mat({ color: 0x333333 })), s, 0.22, 0)); G.add(at(bench, -4.2, 0, -1.8));
    G.add(at(cyl(0.25, 0.22, 0.8, 8, mat({ color: 0x3a6a3a })), 4.2, 0.4, -1.9));
    const hand = new THREE.Group(); hand.add(at(box(0.04, 0.3, 0.02, mat({ color: 0x111111 })), 0, 0.15, 0));
    G.add(at(new THREE.Mesh(new THREE.CircleGeometry(0.4, 12), mat({ color: 0xf4f4ee })), 4.2, 3.9, -7.46)); G.add(at(hand, 4.2, 3.9, -7.43));
    const lampsZ = [-2, 3]; for (const z of lampsZ) G.add(at(box(20, 0.06, 0.2, mat({ color: 0xfff8e8, unlit: 1 })), 0, 5.55, z));
    // the train: three cars with a lit window band
    const carT = tex(32, 16, x => { px(x, '#b8bec4', 0, 0, 32, 16); px(x, '#d8322a', 0, 12, 32, 1); for (let i = 2; i < 30; i += 5) px(x, 'rgba(255,230,160,0.8)', i, 4, 4, 5); px(x, '#6a7078', 15, 3, 2, 9); selfLit(x, 32, 16); }, 235);
    const train = new THREE.Group(), carM = mat({ map: carT, rep: [3, 1] });
    for (let i = 0; i < 3; i++) train.add(at(box(13, 2.9, 2.8, carM), i * 13.4, 0.55, 0));
    train.add(at(box(0.1, 0.3, 0.8, mat({ color: 0xfff4c0, unlit: 1 })), -6.55, 0.2, 0));
    G.add(at(train, 0, 0, -5.3));
    return {
      group: G, sky: grad([[0, '#1a1e24'], [1, '#2a3038']]), shadowCol: 0x5a5a5e, indoor: true,
      light() { lights(0x7a8090, 0x9aa0ae, [0.1, -1, 0.2], 0x1e242c, [14, 38], 10); },
      anim(t) {
        const ph = fr(beat(t) / 16), x = 70 - ph * 150; train.position.x = x;       // enters from the right, 40 m long
        if (x > -14 && x < 14) pt(0, x - 6.6, 0.4, -4, 2.2, 2, 1.4);
        pt(1, -6, 5, 0, 0.5, 0.5, 0.45); pt(2, 6, 5, 0, 0.5, 0.5, 0.45);
        hand.rotation.z = -beatN(t) * TAU / 60;
      },
    };
  }

  // ---------- bowling alley: wooden lanes, a ball rolls every two bars and the pins fly, blacklight neon ----------
  function bowling() {
    const G = new THREE.Group();
    const laneT = tex(32, 16, (x, r) => { px(x, '#d8a868', 0, 0, 32, 16); for (let i = 0; i < 32; i += 2) px(x, i % 4 ? '#c89858' : '#e0b478', i, 0, 1, 16); px(x, '#2a1a2a', 0, 0, 2, 16); px(x, '#2a1a2a', 30, 0, 2, 16); }, 241);
    G.add(flat(12, 24, mat({ map: laneT, rep: [8, 12] }), 0, 0, -4));
    for (const s of [-1, 1]) G.add(flat(2, 24, mat({ color: 0x1a0e2a }), s * 7, 0, -4));
    const arrows = []; for (let i = -3; i <= 3; i++) arrows.push(rot(at(new THREE.Mesh(new THREE.CircleGeometry(0.12, 3)), i * 0.75, 0.003, -3.2 - Math.abs(i) * 0.25), -PI / 2, 0, 0));
    G.add(merged(arrows, mat({ color: 0x3a2a1a })));
    const wallT = tex(16, 16, (x, r) => { px(x, '#1a0e2e', 0, 0, 16, 16); for (let i = 0; i < 10; i++) px(x, ['#ff4fd0', '#4fd4ff', '#f2f24c'][Math.floor(r() * 3)], Math.floor(r() * 16), Math.floor(r() * 16)); }, 242);
    room(G, 16, 24, 5.8, wallT, 2, 0x0c0616, { cz: -4 });
    G.add(at(box(12, 1.3, 0.3, mat({ map: sign('SAXO BOWL', '#0c0616', '#ff4fd0', 64, 12), unlit: 1 })), 0, 3.2, -14.2));
    G.add(at(box(12, 1.4, 0.2, mat({ color: 0x2a1a3a })), 0, 1.9, -13.8));
    // pins: two lanes animate, the rest are static
    const pinT = tex(4, 8, x => { px(x, '#f4f4f0', 0, 0, 4, 8); px(x, '#d8322a', 0, 2, 4, 1); });
    const pinM = mat({ map: pinT }), rack = []; for (let r = 0; r < 4; r++) for (let i = 0; i <= r; i++) rack.push([(i - r / 2) * 0.3, -r * 0.26]);
    const statics = [];
    for (const lx of [-5.25, -3.75, -2.25, 2.25, 3.75, 5.25]) for (const [dx, dz] of rack) statics.push(at(new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.08, 0.38, 6)), lx + dx, 0.19, -12.6 + dz));
    G.add(merged(statics, pinM));
    const pins = []; for (const lx of [-0.75, 0.75]) for (const [dx, dz] of rack) { const p = cyl(0.05, 0.08, 0.38, 6, pinM); G.add(p); pins.push([p, lx + dx, -12.6 + dz, pins.length]); }
    const balls = [-0.75, 0.75].map((lx, i) => { const b = sph(0.14, 8, 6, mat({ color: i ? 0x2a6ae8 : 0xe82a8a, unlit: 1 })); G.add(b); return [b, lx, i]; });
    const monT = tex(16, 8, x => { px(x, '#101830', 0, 0, 16, 8); for (let i = 1; i < 15; i += 3) { px(x, '#4fd4ff', i, 2, 2, 1); px(x, '#ffffff', i, 5, 2, 1); } });
    for (const x of [-3, 3]) G.add(at(box(2.4, 1.2, 0.15, mat({ map: monT, unlit: 1 })), x, 3.8, 6.6));
    const tubes = []; for (const x of [-5, 0, 5]) { const tb = at(box(0.15, 0.06, 20, mat({ color: 0xa04aff, unlit: 1 })), x, 5.74, -4); G.add(tb); tubes.push(tb); }
    return {
      group: G, sky: grad([[0, '#0c0616'], [1, '#1a0e2e']]), shadowCol: 0x6a4a2a, indoor: true,
      light() { lights(0x6a5880, 0x9a80c0, [0, -1, 0.3], 0x180c28, [12, 30], 11); pt(0, 0, 4, -12, 1.6, 0.5, 1.4); pt(1, -4, 4, 2, 0.4, 0.9, 1.6); pt(2, 4, 4, 2, 0.4, 0.9, 1.6); },
      anim(t) {
        const cyc = fr(beat(t) / 8) * 2;                                   // 0..1 roll, 1..2 pins fly
        balls.forEach(([b, lx, i]) => { const c = fr(cyc / 2 + i * 0.03) * 2; b.visible = c < 1.05; b.position.set(lx, 0.14, 2 - Math.min(c, 1) * 14.4); b.rotation.x = -c * 40; });
        pins.forEach(([p, x, z, i]) => {
          const f = Math.max(0, cyc - 1), vx = (hash(i, 51) - 0.5) * 3, vz = -1 - hash(i, 52) * 2, vy = 1.5 + hash(i, 53) * 2.5, tt = Math.min(f, 0.6);
          p.position.set(x + vx * tt, Math.max(0.19, 0.19 + vy * tt - 4.9 * tt * tt), z + vz * tt);
          p.rotation.set(f > 0 ? Math.min(f * 8, PI / 2) : 0, 0, f > 0 ? vx * f * 3 : 0);
        });
        tubes.forEach((tb, i) => { tb.material.uniforms.uCol.value.set(0xa04aff).multiplyScalar(0.6 + 0.4 * hit(t + i * 0.1)); });
      },
    };
  }

  // ---------- arcade: glowing cabinets all around, a dance pad under Saxo lighting up on the beat, a claw machine ----------
  function arcade() {
    const G = new THREE.Group();
    const carpet = tex(32, 32, (x, r) => { px(x, '#10082a', 0, 0, 32, 32); for (let i = 0; i < 26; i++) { const c = ['#ff4fd0', '#4fd4ff', '#f2f24c', '#6aff6a'][Math.floor(r() * 4)], X = Math.floor(r() * 30), Y = Math.floor(r() * 30); if (r() < 0.5) { px(x, c, X, Y, 3, 1); px(x, c, X + 1, Y - 1, 1, 3); } else { px(x, c, X, Y, 2, 2); } } }, 251);
    G.add(flat(20, 20, mat({ map: carpet, rep: [7, 7] })));
    const wallT = tex(16, 32, (x, r) => { px(x, '#1a0a30', 0, 0, 16, 32); px(x, '#ff2fa8', 0, 22, 16, 1); px(x, '#2fd4ff', 0, 25, 16, 1); }, 252);
    room(G, 20, 20, 5.8, wallT, 2, 0x06030c);
    // dance pad: 3x3 panels, arrows light on the beat
    const pad = []; for (let i = -1; i <= 1; i++) for (let j = -1; j <= 1; j++) { const m = mat({ color: 0x2a2a3a, unlit: 1 }); const p = flat(0.46, 0.46, m, i * 0.5, 0.002, j * 0.5); G.add(p); pad.push([p, i, j]); }
    G.add(flat(1.6, 1.6, mat({ color: 0x8a8a9a }), 0, 0.001, 0));
    const games = [
      tex(16, 16, x => { px(x, '#000', 0, 0, 16, 16); px(x, '#2a3aff', 1, 1, 14, 1); px(x, '#2a3aff', 1, 14, 14, 1); px(x, '#2a3aff', 1, 1, 1, 14); px(x, '#2a3aff', 14, 1, 1, 14); px(x, '#2a3aff', 5, 5, 6, 1); px(x, '#ffe23a', 3, 8, 3, 3); for (let i = 7; i < 14; i += 2) px(x, '#ffffff', i, 9, 1, 1); }),
      tex(16, 16, x => { px(x, '#000', 0, 0, 16, 16); for (let i = 2; i < 14; i += 3) for (let j = 2; j < 8; j += 3) px(x, '#6aff6a', i, j, 2, 2); px(x, '#ff4fd0', 7, 13, 3, 2); }),
      tex(16, 16, x => { px(x, '#3a8a3a', 0, 0, 16, 16); px(x, '#555', 4, 0, 8, 16); for (let j = 0; j < 16; j += 4) px(x, '#fff', 8, j, 1, 2); px(x, '#e8322a', 6, 11, 2, 3); }),
      tex(16, 16, x => { px(x, '#101020', 0, 0, 16, 16); px(x, '#ff9a3a', 2, 10, 4, 6); px(x, '#3ad4ff', 10, 8, 4, 8); px(x, '#fff', 7, 3, 2, 2); }),
    ];
    const screens = [], marquees = [];
    const COLS = [0xd8322a, 0x2a5ad8, 0x2ab85a, 0xe8a82a, 0x9a3ad8, 0x1a1a1a];
    for (let i = 0; i < 14; i++) {
      const a = -PI * 0.9 + i / 13 * PI * 1.8, R = 8.6, c = new THREE.Group();
      c.add(at(box(1, 1.9, 0.9, mat({ color: COLS[i % COLS.length] })), 0, 0.95, 0));
      const s = rot(at(box(0.8, 0.62, 0.06, mat({ map: games[i % 4], unlit: 1 })), 0, 1.42, 0.43), -0.25, 0, 0); c.add(s); screens.push([s, i]);
      const m = at(box(1, 0.3, 0.2, mat({ color: [0xff4fd0, 0x4fd4ff, 0xf2f24c][i % 3], unlit: 1 })), 0, 2.05, 0.36); c.add(m); marquees.push([m, i]);
      c.add(at(box(0.9, 0.12, 0.35, mat({ color: 0x111111 })), 0, 1.02, 0.55));
      c.position.set(Math.sin(a) * R, 0, -Math.cos(a) * R); c.rotation.y = -a; G.add(c);
    }
    const claw = new THREE.Group(); claw.add(at(box(1.6, 0.9, 1.4, mat({ color: 0xff4fa8 })), 0, 0.45, 0)); claw.add(at(box(1.5, 1.4, 1.3, mat({ color: 0x5a9ae8 })), 0, 1.6, 0)); claw.add(at(box(1.6, 0.35, 1.4, mat({ map: sign('CLAW', '#ff4fa8', '#ffffff', 32, 12), unlit: 1 })), 0, 2.48, 0));
    for (let i = 0; i < 8; i++) claw.add(at(box(0.22, 0.22, 0.22, mat({ color: [0xf2c94c, 0x6aff6a, 0xffffff, 0xe84a4a][i % 4] })), (hash(i, 61) - 0.5) * 1.1, 1.05, (hash(i, 62) - 0.5) * 0.9));
    const hook = at(box(0.1, 0.25, 0.1, mat({ color: 0xdddddd })), 0, 2.0, 0); claw.add(hook);
    G.add(at(claw, 0, 0, -9));
    G.add(at(box(6, 1.1, 0.1, mat({ map: sign('ARCADE', '#1a0a30', '#ff4fd0'), unlit: 1 })), 0, 4.2, -9.9));
    const PAL = [[1, 0.2, 0.7], [0.2, 0.8, 1], [1, 0.95, 0.2], [0.4, 1, 0.4]];
    return {
      group: G, sky: grad([[0, '#06030c'], [1, '#1a0a30']]), shadowCol: 0x0a0818, indoor: true,
      light() { lights(0x4a4070, 0x5a4aa0, [0, -1, 0.2], 0x0a0618, [9, 26], 9); },
      anim(t) {
        const n = beatN(t), h = hit(t);
        pad.forEach(([p, i, j]) => { const arrow = (i === 0) !== (j === 0), on = arrow && hash(i + 2, j + 2, n) < 0.5, c = PAL[(i + j + 4 + n) % 4], k = on ? 0.4 + 0.6 * h : 0.12; p.material.uniforms.uCol.value.setRGB(c[0] * k, c[1] * k, c[2] * k); });
        screens.forEach(([s, i]) => { s.material.uniforms.uCol.value.setScalar(0.75 + 0.25 * (hash(i, n) < 0.5 ? h : 0)); });
        marquees.forEach(([m, i]) => { m.visible = (n + i) % 5 !== 0; });
        for (let i = 0; i < 4; i++) { const a = t * 0.6 + i * TAU / 4, c = PAL[(n + i) % 4]; pt(i, Math.sin(a) * 5, 3, Math.cos(a) * 5, c[0] * (1 + h), c[1] * (1 + h), c[2] * (1 + h)); }
        hook.position.y = 2.0 - 0.4 * Math.abs(Math.sin(t * 0.8));
      },
    };
  }

  // ---------- open-plan office: cubicles with glowing monitors, a printer spitting pages, paper raining down ----------
  function office() {
    const G = new THREE.Group();
    const carpet = tex(16, 16, (x, r) => { px(x, '#4a5a78', 0, 0, 16, 16); noise(x, r, 16, 16, ['#42506c', '#56668a', '#3a4660'], 110); }, 261);
    G.add(flat(18, 18, mat({ map: carpet, rep: [9, 9] })));
    const wallT = tex(16, 16, (x, r) => { px(x, '#d8d4c8', 0, 0, 16, 16); noise(x, r, 16, 16, ['#ccc8bc', '#e0dcd0'], 40); }, 262);
    room(G, 18, 18, 5.8, wallT, 3, null, { skip: ['front'] });
    const ceilT = tex(16, 16, x => { px(x, '#e8e8e4', 0, 0, 16, 16); px(x, '#b8b8b4', 0, 0, 16, 1); px(x, '#b8b8b4', 0, 0, 1, 16); });
    const ceil = new THREE.Mesh(new THREE.PlaneGeometry(18, 18), mat({ map: ceilT, rep: [12, 12] })); ceil.rotation.x = PI / 2; G.add(at(ceil, 0, 5.8, 0));
    for (let x = -6; x <= 6; x += 4) for (let z = -6; z <= 6; z += 4) G.add(at(box(1.4, 0.04, 0.7, mat({ color: 0xfbfbf4, unlit: 1 })), x, 5.77, z));
    const cityT = tex(32, 32, (x, r) => { px(x, '#8ab8e8', 0, 0, 32, 32); for (let i = 0; i < 8; i++) { const h = 8 + Math.floor(r() * 20), X = i * 4; px(x, ['#5a6a88', '#6a7a98', '#4a5a78'][i % 3], X, 32 - h, 4, h); for (let y = 32 - h + 2; y < 30; y += 3) px(x, '#c8dcf0', X + 1, y, 1, 1); } px(x, '#3a3a3a', 0, 0, 32, 1); px(x, '#3a3a3a', 15, 0, 2, 32); }, 263);
    G.add(rot(at(new THREE.Mesh(new THREE.PlaneGeometry(18, 5.8), mat({ map: cityT, rep: [3, 1], unlit: 1 })), 0, 2.9, 9), 0, PI));
    const part = mat({ map: tex(8, 8, (x, r) => { px(x, '#8a8e98', 0, 0, 8, 8); noise(x, r, 8, 8, ['#7e828c', '#969aa4'], 16); px(x, '#5a5e68', 0, 0, 8, 1); }, 264) }), desk = mat({ color: 0xc8b89a }), dark = mat({ color: 0x222228 });
    const monitors = [], parts = [];
    const cubicle = (cx, cz) => {
      parts.push(at(new THREE.Mesh(new THREE.BoxGeometry(2.8, 1.4, 0.08)), cx, 0.7, cz - 1.4), at(new THREE.Mesh(new THREE.BoxGeometry(0.08, 1.4, 2.8)), cx - 1.4, 0.7, cz), at(new THREE.Mesh(new THREE.BoxGeometry(0.08, 1.4, 2.8)), cx + 1.4, 0.7, cz));
      G.add(at(box(2.2, 0.06, 0.8, desk), cx, 0.74, cz - 0.95));
      G.add(at(box(0.5, 0.36, 0.05, dark), cx, 1.02, cz - 1.15));
      const s = at(box(0.44, 0.3, 0.02, mat({ color: 0x6ab8ff, unlit: 1 })), cx, 1.02, cz - 1.12); G.add(s); monitors.push(s);
      G.add(at(box(0.5, 0.5, 0.5, mat({ color: 0x2a2a3a })), cx + 0.3, 0.45, cz - 0.3));
    };
    for (const cx of [-5.8, -2.9, 0, 2.9, 5.8]) cubicle(cx, -6.6);
    for (const s of [-1, 1]) { cubicle(s * 7.4, -2.6); for (let z = 1; z <= 6; z += 1.1) G.add(at(box(0.6, 1.3, 1, mat({ color: 0x8a8e98 })), s * 8.65, 0.65, z)); }
    G.add(merged(parts, part));
    G.add(at(box(2.6, 1.6, 0.05, mat({ map: tex(16, 16, x => { px(x, '#1a1a1a', 0, 0, 16, 16); px(x, '#f2f2f2', 1, 1, 14, 14); px(x, '#c8a02a', 5, 3, 6, 6); px(x, '#6a6660', 6, 4, 4, 4); x.fillStyle = '#111'; x.font = 'bold 3px monospace'; x.fillText('SAXO OF', 1.5, 12); x.fillText('THE MONTH', 0.8, 15); }) })), 3.4, 3.2, -8.95));
    const cooler = new THREE.Group(); cooler.add(at(box(0.4, 1, 0.4, mat({ color: 0xe8e8e8 })), 0, 0.5, 0)); cooler.add(at(cyl(0.18, 0.18, 0.5, 8, mat({ color: 0x6ac0ff })), 0, 1.25, 0)); G.add(at(cooler, -4.2, 0, -4));
    const printer = new THREE.Group(); printer.add(at(box(0.8, 0.9, 0.6, mat({ color: 0xd8d8d0 })), 0, 0.45, 0)); printer.add(at(box(0.7, 0.2, 0.5, mat({ color: 0x4a4a50 })), 0, 1.0, 0)); G.add(at(printer, 4.2, 0, -4));
    const sheet = at(box(0.3, 0.01, 0.42, mat({ color: 0xffffff })), 4.2, 0.72, -3.7); G.add(sheet);
    const paper = mat({ color: 0xf8f8f4, side: THREE.DoubleSide });
    const papers = fall(G, 40, paper, new THREE.PlaneGeometry(0.3, 0.4), { w: 14, top: 5.6, speed: 0.6, spin: 1.5, drift: 0.8, seed: 265 });
    return {
      group: G, sky: grad([[0, '#8ab8e8'], [1, '#c8dcf0']]), shadowCol: 0x2e3a52, indoor: true,
      light() { lights(0x9aa0a8, 0x8a8a84, [0.2, -1, -0.3], 0xc8ccd0, [13, 32]); },
      anim(t) {
        const n = beatN(t); monitors.forEach((m, i) => { const c = hash(i, n, 9); m.material.uniforms.uCol.value.setRGB(0.4 + c * 0.6, 0.7 + c * 0.3, 1); });
        const f = fr(beat(t)); sheet.position.z = -3.7 + Math.min(f * 2, 1) * 0.3; sheet.position.y = 0.72 - Math.max(0, f * 2 - 1) * 0.5;
        papers(t);
      },
    };
  }

  // ---------- spaceship bridge: consoles blinking, a huge window onto a planet, warp streaks on alternate bars ----------
  function spaceship() {
    const G = new THREE.Group();
    const panel = tex(16, 16, (x, r) => { px(x, '#5a6474', 0, 0, 16, 16); px(x, '#3a4250', 0, 0, 16, 1); px(x, '#3a4250', 0, 0, 1, 16); px(x, '#6e7888', 2, 2, 12, 12); px(x, '#4a5260', 7, 7, 2, 2); }, 271);
    G.add(flat(18, 18, mat({ map: panel, rep: [9, 9] })));
    const wallT = tex(16, 16, (x, r) => { px(x, '#3a4458', 0, 0, 16, 16); px(x, '#2a3244', 0, 7, 16, 2); for (let i = 0; i < 4; i++) px(x, ['#ff3a3a', '#3aff6a', '#3ad4ff'][i % 3], 2 + i * 3, 11, 1, 1); }, 272);
    room(G, 18, 18, 5.8, wallT, 2.5, 0x2a3040, { skip: ['back'] });
    // window frame on the back wall (open: the space outside shows through)
    const frameM = mat({ color: 0x2a3040 });
    G.add(at(box(18, 1.2, 0.4, frameM), 0, 0.6, -9)); G.add(at(box(18, 1, 0.4, frameM), 0, 5.3, -9));
    for (const x of [-8.5, -3, 3, 8.5]) G.add(at(box(0.5, 5.8, 0.4, frameM), x, 2.9, -9));
    G.add(at(stars(320, 120, 273), 0, 0, 0));
    const planetT = tex(32, 16, (x, r) => { px(x, '#c86a3a', 0, 0, 32, 16); for (let y = 0; y < 16; y += 3) px(x, ['#e8a86a', '#a84a2a', '#f2c88a'][y % 3], 0, y, 32, 1); noise(x, r, 32, 16, ['#b85a30', '#d8884a'], 60); }, 274);
    const planet = sph(15, 16, 12, mat({ map: planetT, unlit: 1 })); G.add(at(planet, 25, 4, -80));
    const ringP = rot(new THREE.Mesh(new THREE.RingGeometry(19, 25, 24), mat({ color: 0xd8c8a0, unlit: 1, side: THREE.DoubleSide })), -PI / 2 + 0.35, 0.2, 0); G.add(at(ringP, 25, 4, -80));
    const warpM = mat({ color: 0xcfe8ff, unlit: 1 }), warp = [];
    for (let i = 0; i < 70; i++) { const s = box(0.08, 0.08, 6, warpM); G.add(s); warp.push([s, i]); }
    const blink = [], consoleT = tex(16, 8, (x, r) => { px(x, '#2a3040', 0, 0, 16, 8); px(x, '#1a3a5a', 2, 1, 6, 4); for (let i = 10; i < 15; i += 2) for (let j = 1; j < 7; j += 2) px(x, ['#ff4a4a', '#4aff8a', '#ffd84a', '#4ad4ff'][Math.floor(r() * 4)], i, j, 1, 1); }, 275);
    for (let i = 0; i < 5; i++) { const x = -6 + i * 3, c = new THREE.Group(); c.add(at(box(2.2, 0.9, 0.9, mat({ color: 0x3a4458 })), 0, 0.45, 0)); const top = rot(at(box(2.2, 0.08, 1, mat({ map: consoleT, unlit: 1 })), 0, 0.98, 0.05), 0.4, 0, 0); c.add(top); blink.push([top, i]); G.add(at(c, x, 0, -7.4)); }
    for (const s of [-1, 1]) for (const z of [-3, 1.5]) { const c = new THREE.Group(); c.add(at(box(0.9, 1.1, 2.2, mat({ color: 0x3a4458 })), 0, 0.55, 0)); const top = rot(at(box(1, 0.08, 2.2, mat({ map: consoleT, unlit: 1 })), 0, 1.14, 0), 0, 0, s * 0.4); c.add(top); blink.push([top, 5 + blink.length]); G.add(at(c, s * 7.6, 0, z)); }
    const holo = ico(0.6, 1, mat({ color: 0x4ad4ff, unlit: 1 })); G.add(at(cyl(0.45, 0.55, 0.9, 8, mat({ color: 0x3a4458 })), -4.6, 0.45, -4.6)); G.add(at(holo, -4.6, 1.7, -4.6));
    const strips = []; for (const x of [-4, 0, 4]) { const s = at(box(0.2, 0.05, 16, mat({ color: 0xbfe0ff, unlit: 1 })), x, 5.76, 0); G.add(s); strips.push(s); }
    return {
      group: G, sky: grad([[0, '#000004'], [1, '#050814']]), shadowCol: 0x2a3040, indoor: true,
      light() { lights(0x747a88, 0xc8d4f0, [0.1, -1, 0.3], 0x0a1020, [40, 150], 9); },
      anim(t) {
        const bar = Math.floor(beat(t) / 4), on = ((bar % 2) + 2) % 2 === 1, alert = ((bar % 8) + 8) % 8 >= 6, n = beatN(t);
        warp.forEach(([s, i]) => { s.visible = on; const z = -20 - ((t * 60 + hash(i, 76) * 100) % 100), a = hash(i, 77) * TAU, r = 6 + hash(i, 78) * 30; s.position.set(Math.cos(a) * r, 3 + Math.sin(a) * r * 0.6, z); });
        planet.rotation.y = t * 0.05;
        blink.forEach(([b, i]) => { b.material.uniforms.uCol.value.setScalar(hash(i, n) < 0.5 ? 1 : 0.55); });
        holo.rotation.set(t * 0.7, t * 1.1, 0); holo.position.y = 1.7 + 0.1 * Math.sin(t * 2);
        const red = alert ? 0.5 + 0.5 * Math.abs(Math.sin(t * 6)) : 0;
        strips.forEach(s => s.material.uniforms.uCol.value.setRGB(0.75 + red * 0.25, 0.88 - red * 0.7, 1 - red * 0.8));
        if (alert) for (let i = 0; i < 4; i++) pt(i, (i - 1.5) * 5, 5, 0, 2 * red, 0.1, 0.1);
        else { pt(0, -6, 4, -6, 0.3, 0.6, 1.2); pt(1, 6, 4, -6, 0.3, 0.6, 1.2); }
      },
    };
  }

  return { supermarket: supermarket(), school: school(), stage: stage(), subway: subway(), bowling: bowling(), arcade: arcade(), office: office(), spaceship: spaceship() };
}
