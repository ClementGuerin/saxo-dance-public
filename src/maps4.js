// maps4.js: cartoon seabed maps. Bikini Bottom: the pineapple house, the stone head and the rock on one street,
// a burger shack, flower clouds in the sky, jellyfish fields, a boat-car driving past. Same contract as maps3.js,
// pure in t; landmarks at -z, nothing taller than ~0.3 m within 7.5 m of Saxo except behind him (z < -3, r >= 4).
import { mapKit } from './mapkit.js';
import { jetModel } from './maps8.js';

export function buildSeaMaps(K) {
  const k = mapKit(K);
  const { THREE, mat, tex, px, noise, box, selfLit, TAU, PI, hash, fr, hit, barHit, beatN, beat, grad, cyl, cone, sph, ico, at, rot, merged, flat, around, lights, pt } = k;

  function bikini() {
    const G = new THREE.Group();
    // sand, with a paler road running across behind the houses
    const sand = tex(32, 32, (x, r) => { px(x, '#e8d49a', 0, 0, 32, 32); noise(x, r, 32, 32, ['#dcc688', '#f2e0aa', '#d4bc7a'], 180); }, 401);
    G.add(flat(220, 220, mat({ map: sand, rep: [70, 70] })));
    const road = tex(16, 16, (x, r) => { px(x, '#b8a8a0', 0, 0, 16, 16); noise(x, r, 16, 16, ['#a8989a', '#c4b4aa'], 40); px(x, '#f2f2e8', 7, 0, 2, 8); }, 402);
    G.add(flat(200, 6, mat({ map: road, rep: [34, 1] }), 0, 0.01, -26));

    // the pineapple: diamond-scaled body, leaf crown, a round steel door and two porthole windows
    const pineT = tex(16, 16, (x, r) => {
      px(x, '#f2a21a', 0, 0, 16, 16);
      for (let i = -16; i < 32; i += 4) for (let s = 0; s < 16; s++) { px(x, '#b8700e', (i + s) & 15, s); px(x, '#b8700e', (i - s + 32) & 15, s); }
      noise(x, r, 16, 16, ['#ffb834', '#e0901a'], 20);
    }, 403);
    const pine = new THREE.Group(), pineBody = new THREE.Mesh(new THREE.SphereGeometry(2.6, 12, 10), mat({ map: pineT, rep: [6, 4] }));
    pineBody.scale.set(1, 1.35, 1); pine.add(at(pineBody, 0, 3.4, 0));
    const leafM = mat({ color: 0x3a9a2a }), leafD = mat({ color: 0x2a7a1e }), leaves = new THREE.Group();
    for (let i = 0; i < 9; i++) { const a = i / 9 * TAU, tilt = 0.35 + (i % 3) * 0.2, l = rot(at(cone(0.5, 3.4 - (i % 3) * 0.5, 4, i % 2 ? leafM : leafD), Math.sin(a) * 0.5, 1.5, Math.cos(a) * 0.5), Math.cos(a) * tilt, 0, -Math.sin(a) * tilt); leaves.add(l); }
    pine.add(at(leaves, 0, 6.6, 0));
    const steel = mat({ color: 0x8aa0b8 }), glass = mat({ color: 0x9ae0ff, unlit: 1 });
    pine.add(rot(at(cyl(0.85, 0.85, 0.2, 10, steel), 0, 1.05, 2.5), PI / 2, 0, 0));
    pine.add(rot(at(cyl(0.62, 0.62, 0.22, 10, mat({ color: 0x5a7088 })), 0, 1.05, 2.52), PI / 2, 0, 0));
    for (const [wx, wy] of [[-1.3, 3.6], [1.1, 5.1]]) { pine.add(rot(at(cyl(0.5, 0.5, 0.16, 8, steel), wx, wy, 2.45 - Math.abs(wx) * 0.25), PI / 2, 0, -wx * 0.2)); pine.add(rot(at(cyl(0.36, 0.36, 0.2, 8, glass), wx, wy, 2.5 - Math.abs(wx) * 0.25), PI / 2, 0, -wx * 0.2)); }
    pine.add(at(cyl(2.4, 2.6, 0.3, 12, mat({ color: 0xa8b8c0 })), 0, 0.15, 0));
    G.add(rot(at(pine, 7.5, 0, -15), 0, -0.25, 0));

    // the stone head: a long face, a heavy brow and nose, a door in the chin
    const stoneT = tex(16, 16, (x, r) => { px(x, '#6a80a0', 0, 0, 16, 16); noise(x, r, 16, 16, ['#5a7090', '#7a90b0', '#54688a'], 60); }, 404), stoneM = mat({ map: stoneT, rep: [2, 3] });
    const head = new THREE.Group();
    head.add(at(box(3, 6, 2.6, stoneM), 0, 3, 0));
    head.add(at(box(3.2, 0.7, 0.9, stoneM), 0, 4.6, 1.2));
    head.add(rot(at(box(0.9, 2.6, 0.9, stoneM), 0, 3.3, 1.55), -0.15, 0, 0));
    for (const sx of [-1, 1]) { head.add(at(box(0.8, 0.5, 0.1, mat({ color: 0x1a2438 })), sx * 0.75, 4.05, 1.32)); head.add(at(box(0.5, 2.4, 0.8, stoneM), sx * 1.7, 3.6, 0)); }
    head.add(at(box(1, 1.8, 0.1, mat({ color: 0x3a2a1e })), 0, 0.9, 1.32));
    G.add(rot(at(head, -0.5, 0, -18), 0, 0.05, 0));

    // the rock: a brown dome with a weather vane
    const rockM = mat({ map: tex(16, 16, (x, r) => { px(x, '#8a5a3a', 0, 0, 16, 16); noise(x, r, 16, 16, ['#7a4a2e', '#9a6a48', '#6a3e26'], 70); }, 405), rep: [3, 2] });
    const rock = new THREE.Group();
    const dome = new THREE.Mesh(new THREE.SphereGeometry(2.4, 10, 6, 0, TAU, 0, PI / 2), rockM); dome.scale.set(1, 0.75, 1); rock.add(dome);
    rock.add(at(cyl(0.05, 0.05, 1.6, 4, mat({ color: 0x3a3a3a })), 0, 2.5, 0));
    const vane = new THREE.Group(); vane.add(at(box(0.9, 0.08, 0.08, mat({ color: 0x3a3a3a })), 0, 0, 0)); vane.add(at(cone(0.15, 0.3, 4, mat({ color: 0xd8322a })), 0.5, 0, 0).rotateZ(-PI / 2));
    rock.add(at(vane, 0, 3.2, 0));
    G.add(at(rock, -8.5, 0, -14));

    // the burger shack down the road: a slatted wooden hut with portholes, a burger on a pole
    const woodT = tex(16, 16, (x, r) => { px(x, '#9a6a3a', 0, 0, 16, 16); for (let X = 0; X < 16; X += 4) px(x, '#5a3a1e', X, 0, 1, 16); noise(x, r, 16, 16, ['#8a5a2e', '#aa7a48'], 30); }, 406);
    const shack = new THREE.Group(), woodM = mat({ map: woodT, rep: [4, 2] });
    shack.add(at(box(9, 4.2, 6, woodM), 0, 2.1, 0));
    shack.add(at(box(9.6, 0.4, 6.6, mat({ color: 0x5a3a1e })), 0, 4.4, 0));
    shack.add(at(box(2.4, 1.6, 2.4, woodM), 0, 5.4, 0)); shack.add(at(cone(1.9, 1.2, 4, mat({ color: 0x5a3a1e })), 0, 6.8, 0).rotateY(PI / 4));
    const portT = tex(8, 8, x => { px(x, '#6a90b0', 0, 0, 8, 8); px(x, 'rgba(255,214,120,0.8)', 2, 2, 4, 4); selfLit(x, 8, 8); });
    for (const wx of [-3, 3]) shack.add(rot(at(cyl(0.7, 0.7, 0.14, 8, mat({ map: portT })), wx, 2.4, 3.03), PI / 2, 0, 0));
    shack.add(at(box(1.6, 2.6, 0.1, mat({ color: 0x3a8ab8 })), 0, 1.3, 3.03));
    for (const sx of [-1, 1]) shack.add(at(cyl(0.12, 0.12, 5, 5, woodM), sx * 5, 2.5, 3.4));
    const burger = new THREE.Group();
    burger.add(at(cyl(1, 1.05, 0.4, 10, mat({ color: 0xd89a3a })), 0, 0, 0)); burger.add(at(cyl(1.1, 1.1, 0.25, 10, mat({ color: 0x5a2e14 })), 0, 0.32, 0));
    burger.add(at(cyl(1.15, 1.15, 0.08, 10, mat({ color: 0x5ac83a })), 0, 0.5, 0)); burger.add(at(new THREE.Mesh(new THREE.SphereGeometry(1.05, 10, 5, 0, TAU, 0, PI / 2), mat({ color: 0xe8a84a })), 0, 0.55, 0));
    shack.add(at(cyl(0.1, 0.1, 3, 5, mat({ color: 0x6a6a6a })), 5.8, 1.5, 1)); shack.add(at(burger, 5.8, 3.6, 1));
    G.add(rot(at(shack, -20, 0, -32), 0, 0.35, 0));

    // more houses along the road: dome houses, far back
    for (let i = 0; i < 5; i++) { const x = -40 + i * 20 + (hash(i, 407) - 0.5) * 6; if (Math.abs(x) < 14) continue; const s = 2 + hash(i, 408) * 1.5, m = mat({ color: [0x8a9aaa, 0xc86a4a, 0x6aa8b8][i % 3] }); G.add(at(new THREE.Mesh(new THREE.SphereGeometry(s, 10, 6, 0, TAU, 0, PI / 2), m), x, 0, -40 - hash(i, 409) * 6)); }

    // coral trees (bare trunk, flat pink/purple puffs) and tube coral around the edges
    const coralCols = [0xff6aa0, 0xb86aff, 0xff9a4a, 0x4ad8c8, 0xffd84a];
    for (let i = 0; i < 18; i++) {
      const [x, z] = around(i, 410, 9, 30); if (z < -10 && Math.abs(x) < 12) continue;
      const g = new THREE.Group(), cm = mat({ color: coralCols[i % coralCols.length] }), h = 2 + hash(i, 411) * 2;
      g.add(at(cyl(0.12, 0.2, h, 5, mat({ color: 0x8a5a7a })), 0, h / 2, 0));
      for (let j = 0; j < 3; j++) { const p = at(cyl(0.9 - j * 0.15, 0.9 - j * 0.15, 0.18, 7, cm), (hash(i, j) - 0.5) * 1.2, h - j * 0.6, (hash(i, j, 1) - 0.5) * 1.2); g.add(p); }
      G.add(at(g, x, 0, z));
    }
    const tubes = []; for (let i = 0; i < 30; i++) { const [x, z] = around(i, 412, 7.8, 16); tubes.push(at(new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 0.28, 5)), x, 0.14, z)); }
    G.add(merged(tubes, mat({ color: 0xff7ab8 })));

    // flower clouds: cut-out flowers on a dome, each facing Saxo
    const flowerT = (petal, core, seed) => tex(32, 32, x => {
      x.clearRect(0, 0, 32, 32);
      const petals = (col, r) => { x.fillStyle = col; for (let i = 0; i < 5; i++) { const a = i / 5 * TAU - PI / 2; x.beginPath(); x.arc(16 + Math.cos(a) * 8, 16 + Math.sin(a) * 8, r, 0, TAU); x.fill(); } };
      petals('#2a6a9a', 7.4); petals(petal, 6.2);
      x.fillStyle = '#2a6a9a'; x.beginPath(); x.arc(16, 16, 5.4, 0, TAU); x.fill();
      x.fillStyle = core; x.beginPath(); x.arc(16, 16, 4.4, 0, TAU); x.fill();
    }, seed);
    const flowerMs = [['#7ae0f0', '#c8f4ff'], ['#b8f07a', '#e8ffc8'], ['#f0a8e0', '#ffe0f4'], ['#ffffff', '#9ad8f0']].map(([p, c], i) => mat({ map: flowerT(p, c, 413 + i), unlit: 1, side: THREE.DoubleSide }));
    const flowers = [];
    for (let i = 0; i < 28; i++) {
      const a = hash(i, 417) * TAU, e = 0.16 + hash(i, 418) * 0.5, R = 42, s = 4 + hash(i, 419) * 4;
      const g = new THREE.Group(), f = new THREE.Mesh(new THREE.PlaneGeometry(s, s), flowerMs[i % 4]); g.add(f); g.position.set(Math.cos(e) * Math.sin(a) * R, Math.sin(e) * R, -Math.cos(e) * Math.cos(a) * R); g.lookAt(0, 0, 0); G.add(g); flowers.push([f, i]);
    }

    // jellyfish: pink bells with trailing strings, pulsing on the beat
    const jellyM = mat({ color: 0xff8ad8, unlit: 1 }), jellyD = mat({ color: 0xd85ab0, unlit: 1 }), jelly = [];
    for (let i = 0; i < 12; i++) {
      const j = new THREE.Group(), bell = new THREE.Mesh(new THREE.SphereGeometry(0.35, 8, 4, 0, TAU, 0, PI / 2), jellyM); j.add(bell);
      for (let s = 0; s < 4; s++) j.add(at(box(0.03, 0.6, 0.03, jellyD), Math.cos(s * 1.6) * 0.18, -0.3, Math.sin(s * 1.6) * 0.18));
      G.add(j); jelly.push([j, i]);
    }
    // bubbles rising from the sand
    const bubbleM = mat({ color: 0xe0f8ff, unlit: 1 }), bubbles = [];
    for (let i = 0; i < 40; i++) { const b = ico(0.06 + hash(i, 420) * 0.08, 0, bubbleM); G.add(b); bubbles.push([b, i]); }
    // a boat-car cruising along the road
    const boat = new THREE.Group(), hullM = mat({ color: 0xe8e8f0 });
    boat.add(at(box(3.4, 0.9, 1.6, hullM), 0, 0.75, 0)); boat.add(rot(at(cone(0.8, 1.2, 4, hullM), 2.2, 0.75, 0), 0, PI / 4, -PI / 2));
    boat.add(at(box(1.6, 0.6, 1.5, mat({ color: 0x9ae0ff, unlit: 1 })), 0.2, 1.45, 0)); boat.add(at(box(0.3, 0.3, 1.9, mat({ color: 0xd8322a })), -1.5, 0.9, 0));
    for (const [wx, wz] of [[-1, 0.8], [1, 0.8], [-1, -0.8], [1, -0.8]]) { const w = rot(at(cyl(0.32, 0.32, 0.2, 8, mat({ color: 0x1a1a1a })), wx, 0.32, wz), PI / 2, 0, 0); boat.add(w); }
    G.add(boat);

    return {
      group: G, sky: grad([[0, '#3aa8e0'], [0.6, '#7ad0f0'], [1, '#b8ecf8']]), shadowCol: 0xa8945a,
      light() { lights(0x7aa8b8, 0xfff4d0, [0.3, -1, -0.2], 0x5ab8d8, [26, 110]); },
      anim(t) {
        const h = hit(t), b = barHit(t);
        leaves.rotation.z = 0.08 * Math.sin(t * 2); leaves.scale.setScalar(1 + 0.08 * b);
        pineBody.scale.set(1 + 0.03 * h, 1.35 - 0.04 * h, 1 + 0.03 * h);
        vane.rotation.y = t * 0.6 + Math.sin(t * 1.3) * 0.5;
        burger.rotation.y = t * 1.2; burger.position.y = 3.6 + 0.25 * h;
        pt(0, 7.5, 3.6, -12.2, 0.9 * b, 0.8 * b, 0.5 * b);
        flowers.forEach(([f, i]) => { f.rotation.z = t * 0.05 * (i % 2 ? 1 : -1) + i; });
        jelly.forEach(([j, i]) => {
          const a = t * 0.12 + i * 0.52, R = 9 + (i % 4) * 2.5, [x, z] = [Math.sin(a) * R, -Math.cos(a) * R - 4];
          j.position.set(x, 3.4 + (i % 3) * 1.2 + Math.sin(t * 0.9 + i) * 0.5 + 0.3 * hit(t + i * 0.07), z);
          j.scale.set(1 + 0.2 * hit(t + i * 0.07), 1 - 0.25 * hit(t + i * 0.07), 1 + 0.2 * hit(t + i * 0.07));
        });
        bubbles.forEach(([bb, i]) => { const [x, z] = around(i, 421, 3, 14), u = fr(t * 0.2 + hash(i, 422)); bb.position.set(x + Math.sin(t * 3 + i) * 0.1, u * 14, z); bb.visible = u < 0.97; });
        const u = fr(t / 16), bx = -60 + u * 120; boat.position.set(bx, 0, -24.5 + Math.sin(t * 0.5) * 0.3);
        boat.position.y = 0.12 * Math.abs(Math.sin(t * 6));
      },
    };
  }

  // ---------- Paris at blue hour, from the Trocadéro: the golden Eiffel Tower sparkling on the bar, its beacon
  // sweeping, fountain jets firing on the beat, the Seine with a tour boat, Haussmann blocks, a café terrace ----------
  function paris() {
    const G = new THREE.Group(), SQ = Math.SQRT2;
    // esplanade: big pale stone slabs (2 m cells, low contrast)
    const slab = tex(16, 16, (x, r) => { px(x, '#a8acb8', 0, 0, 16, 16); noise(x, r, 16, 16, ['#a0a4b0', '#b2b6c2', '#9a9eaa'], 40); px(x, '#8a8e9a', 0, 0, 16, 1); px(x, '#8a8e9a', 0, 0, 1, 16); }, 431);
    G.add(flat(260, 260, mat({ map: slab, rep: [130, 130] })));

    // the Eiffel Tower: four leaning lattice legs with arches, two platforms, a curved spire, lit gold
    const lat = tex(16, 16, x => { x.clearRect(0, 0, 16, 16); x.strokeStyle = '#f0b050'; x.lineWidth = 1.4; x.beginPath(); x.moveTo(0, 0); x.lineTo(16, 16); x.moveTo(16, 0); x.lineTo(0, 16); x.stroke(); px(x, '#f0b050', 0, 0, 16, 2); px(x, '#f0b050', 0, 0, 2, 16); px(x, '#f0b050', 14, 0, 2, 16); });
    const latM = (rx, ry) => mat({ map: lat, rep: [rx, ry], unlit: 1, side: THREE.DoubleSide }), goldM = mat({ color: 0xd8963a, unlit: 1 });
    const tower = new THREE.Group(), up = new THREE.Vector3(0, 1, 0);
    // a square frustum between two heights (half-widths w0 -> w1), open-ended, faces axis-aligned
    const frustum = (y0, y1, w0, w1, rx, ry) => rot(at(new THREE.Mesh(new THREE.CylinderGeometry(w1 * SQ, w0 * SQ, y1 - y0, 4, 1, true), latM(rx, ry)), 0, (y0 + y1) / 2, 0), 0, PI / 4, 0);
    // a leg: a thick lattice beam from a to b
    const beam = (a, b, r0, r1, m) => { const d = new THREE.Vector3().subVectors(b, a), o = new THREE.Mesh(new THREE.CylinderGeometry(r1, r0, d.length(), 4, 1, true), m); o.position.copy(a).addScaledVector(d, 0.5); o.quaternion.setFromUnitVectors(up, d.normalize()); return o; };
    const V = (x, y, z) => new THREE.Vector3(x, y, z), legM = latM(2, 3);
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
      tower.add(beam(V(sx * 9, 0, sz * 9), V(sx * 7, 4.5, sz * 7), 2.3, 1.9, legM));
      tower.add(beam(V(sx * 7, 4.5, sz * 7), V(sx * 5.2, 8, sz * 5.2), 1.9, 1.5, legM));
      tower.add(at(box(2.6, 0.5, 2.6, goldM), sx * 9, 0.25, sz * 9));
    }
    for (let i = 0; i < 4; i++) { const arch = new THREE.Mesh(new THREE.TorusGeometry(5.4, 0.35, 4, 14, PI), goldM); const g = new THREE.Group(); g.add(at(arch, 0, 1.6, 7.2)); g.rotation.y = i * PI / 2; tower.add(g); }
    tower.add(at(box(14, 1.2, 14, goldM), 0, 8.4, 0));
    tower.add(frustum(9, 16, 5, 2.4, 4, 3));
    tower.add(at(box(6.4, 0.8, 6.4, goldM), 0, 16.2, 0));
    tower.add(frustum(16.6, 24, 2.4, 1.35, 2, 3)); tower.add(frustum(24, 32, 1.35, 0.8, 1, 3)); tower.add(frustum(32, 40, 0.8, 0.45, 1, 3));
    tower.add(at(box(1.6, 1.4, 1.6, goldM), 0, 40.6, 0)); tower.add(at(cyl(0.12, 0.3, 5, 4, goldM), 0, 43.8, 0));
    const hw = y => y < 8 ? 9 - y * 0.47 : y < 16 ? 5 - (y - 8) * 0.32 : y < 24 ? 2.4 - (y - 16) * 0.13 : y < 32 ? 1.35 - (y - 24) * 0.07 : 0.8 - (y - 32) * 0.045;
    const sparkM = mat({ color: 0xffffff, unlit: 1 }), spk = [];
    for (let i = 0; i < 90; i++) { const y = 1 + hash(i, 432) * 40, w = hw(y), f = Math.floor(hash(i, 433) * 4), u = (hash(i, 434) - 0.5) * 2 * w, [x, z] = [[u, w], [w, u], [u, -w], [-w, u]][f]; const s = box(0.45, 0.45, 0.45, sparkM); tower.add(at(s, x, y, z)); spk.push([s, i]); }
    // the beacon on top: two beams sweeping round
    const beacon = new THREE.Group(), beamM = mat({ color: 0xfff0b0, unlit: 1 });
    for (const s of [-1, 1]) beacon.add(at(box(0.3, 0.3, 80, beamM), 0, 0, s * 41));
    tower.add(at(beacon, 0, 41.2, 0));
    G.add(at(tower, 0, 0, -100));

    // Trocadéro fountains: a long basin, jets firing on the beat, water cannons on the bar
    const waterT = tex(16, 16, (x, r) => { px(x, '#3a5a8a', 0, 0, 16, 16); noise(x, r, 16, 16, ['#5a7aaa', '#2a4a7a', '#8aa8d0'], 50); }, 435), waterM = mat({ map: waterT, rep: [3, 6] });
    G.add(flat(12, 18, waterM, 0, 0.01, -21));
    const rimM = mat({ color: 0xc8bcb0 });
    for (const sx of [-1, 1]) G.add(at(box(0.5, 0.45, 18, rimM), sx * 6.25, 0.22, -21));
    G.add(at(box(13, 0.45, 0.5, rimM), 0, 0.22, -11.75)); G.add(at(box(13, 0.45, 0.5, rimM), 0, 0.22, -30.25));
    const jetM = mat({ color: 0xd8f0ff, unlit: 1 }), jets = [];
    for (const sx of [-1, 1]) for (let i = 0; i < 6; i++) { const j = box(0.18, 1, 0.18, jetM); G.add(at(j, sx * 3.2, 0, -13.5 - i * 3)); jets.push([j, i, 0]); }
    for (const sx of [-1, 1]) { const j = box(0.45, 1, 0.45, jetM); G.add(at(j, sx * 1.2, 0, -28)); jets.push([j, 0, 1]); }

    // balustrade at the end of the esplanade, and Paris lamp posts
    const balT = tex(16, 8, x => { px(x, '#c8bcb0', 0, 0, 16, 8); for (let i = 1; i < 16; i += 4) px(x, '#8a8078', i, 2, 2, 5); px(x, '#a89c90', 0, 0, 16, 2); });
    for (const sx of [-1, 1]) G.add(at(box(8, 0.9, 0.4, mat({ map: balT, rep: [4, 1] })), sx * 11, 0.45, -9));
    const iron = mat({ color: 0x1e2a24 }), lampPos = [[-7, -9], [7, -9], [-9.5, 2], [9.5, 2]];
    for (const [x, z] of lampPos) {
      G.add(at(cyl(0.09, 0.16, 4.2, 6, iron), x, 2.1, z)); G.add(at(box(1.2, 0.08, 0.08, iron), x, 4, z));
      for (const d of [-0.55, 0, 0.55]) G.add(at(box(0.3, 0.42, 0.3, mat({ color: 0xffe0a0, unlit: 1 })), x + d, d ? 3.8 : 4.45, z));
    }

    // the Seine with a bridge and a tour boat
    const seineT = tex(16, 16, (x, r) => { px(x, '#2a3a60', 0, 0, 16, 16); noise(x, r, 16, 16, ['#3a4a78', '#1e2c4e', '#e8a870'], 30); }, 436), seineM = mat({ map: seineT, rep: [60, 3] });
    G.add(flat(300, 9, seineM, 0, 0.01, -38));
    const deck = mat({ map: slab, rep: [6, 5] });
    G.add(at(box(13, 0.7, 10, deck), 0, 0.35, -38));
    for (const sx of [-1, 1]) G.add(at(box(0.3, 0.8, 10, rimM), sx * 6.5, 1.1, -38));
    const boat = new THREE.Group();
    boat.add(at(box(14, 1, 3, mat({ color: 0xe8e8f0 })), 0, 0.5, 0)); boat.add(at(box(11, 1.2, 2.6, mat({ map: tex(16, 4, x => { px(x, '#2a3040', 0, 0, 16, 4); for (let i = 1; i < 16; i += 3) px(x, 'rgba(255,220,150,0.8)', i, 1, 2, 2); selfLit(x, 16, 4); }), rep: [4, 1] })), 0, 1.6, 0));
    G.add(boat);

    // Champ de Mars beyond the river: lawns, gravel, rows of clipped trees
    const lawnM = mat({ map: tex(16, 16, (x, r) => { px(x, '#3a6a32', 0, 0, 16, 16); noise(x, r, 16, 16, ['#34602c', '#447a3a'], 40); }, 437), rep: [6, 20] });
    for (const sx of [-1, 1]) G.add(flat(9, 46, lawnM, sx * 8, 0.01, -67));
    const trees = [];
    for (const sx of [-1, 1]) for (let i = 0; i < 9; i++) { const z = -46 - i * 5.5; trees.push(at(new THREE.Mesh(new THREE.BoxGeometry(3, 4, 3)), sx * 15, 4, z)); trees.push(at(new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.25, 2.2, 4)), sx * 15, 1.1, z)); }
    G.add(merged(trees, mat({ color: 0x2e5a2e })));

    // Haussmann blocks on both sides: cream stone, iron balconies, lit windows, slate mansard roofs with dormers
    const haus = seed => tex(16, 16, (x, r) => {
      px(x, '#d8c8a8', 0, 0, 16, 16); noise(x, r, 16, 16, ['#ccbc9c', '#e2d4b6'], 40);
      for (const X of [2, 10]) { x.fillStyle = r() < 0.45 ? 'rgba(255,208,130,0.8)' : '#2a2e3e'; x.fillRect(X, 3, 4, 8); px(x, '#1e2224', X - 1, 11, 6, 1); px(x, '#1e2224', X - 1, 12, 1, 2); px(x, '#1e2224', X + 4, 12, 1, 2); }
      px(x, '#b8a888', 0, 15, 16, 1); selfLit(x, 16, 16);
    }, seed);
    const shopT = tex(16, 16, (x, r) => { px(x, '#2a4a3a', 0, 0, 16, 16); for (const X of [1, 9]) { px(x, 'rgba(255,214,140,0.8)', X, 3, 6, 10); } px(x, '#c8b898', 0, 0, 16, 2); selfLit(x, 16, 16); }, 438);
    const slateM = mat({ color: 0x4a5870 }), dormM = mat({ map: tex(8, 8, x => { px(x, '#4a5870', 0, 0, 8, 8); px(x, 'rgba(255,208,130,0.8)', 2, 2, 4, 5); selfLit(x, 8, 8); }) });
    for (const s of [-1, 1]) for (let i = 0; i < 5; i++) {
      const z = -16 - i * 11, fl = 5 + (i + (s > 0 ? 1 : 0)) % 2, h = 4 + fl * 3, b = new THREE.Group();
      b.add(at(box(12, 4, 10.6, mat({ map: shopT, rep: [3, 1] })), 0, 2, 0));
      b.add(at(box(12, fl * 3, 10.6, mat({ map: haus(439 + i + (s > 0 ? 10 : 0)), rep: [3, fl] })), 0, 4 + fl * 1.5, 0));
      b.add(at(box(12.4, 0.3, 11, mat({ color: 0xc8b898 })), 0, h, 0));
      const mans = new THREE.Group(); mans.add(rot(at(new THREE.Mesh(new THREE.CylinderGeometry(4.4 * SQ, 6.2 * SQ, 3.4, 4), slateM), 0, 0, 0), 0, PI / 4, 0)); mans.scale.set(1, 1, 0.88); b.add(at(mans, 0, h + 1.85, 0));
      for (let d = -1; d <= 1; d++) b.add(at(box(0.3, 1.2, 1.4, dormM), s < 0 ? 5.5 : -5.5, h + 1.6, d * 3.4));
      for (const c of [-3.6, 3.6]) b.add(at(box(0.8, 1.6, 0.8, mat({ color: 0xa8683a })), 0, h + 4.1, c));
      G.add(at(b, s * 24, 0, z));
      // a red awning over the café on the ground floor of the nearest left block
      if (s < 0 && i === 0) G.add(rot(at(box(1.8, 0.1, 9, mat({ map: tex(16, 4, x => { for (let k = 0; k < 16; k += 4) { px(x, '#b8222a', k, 0, 2, 4); px(x, '#f4eee0', k + 2, 0, 2, 4); } }), rep: [1, 3] })), -17.2, 3.7, -16), 0, 0, -0.35));
    }
    // café terrace on the esplanade: round tables, bistro chairs, a Morris column, a crêpe cart
    for (const [x, z] of [[-11, -1], [-12.5, -4], [-10.5, -6]]) {
      G.add(at(cyl(0.4, 0.4, 0.05, 8, mat({ color: 0xe8e8e0 })), x, 0.75, z)); G.add(at(cyl(0.05, 0.05, 0.75, 4, iron), x, 0.37, z));
      for (const d of [-0.65, 0.65]) { G.add(at(box(0.42, 0.06, 0.42, mat({ color: 0xb8742a })), x + d, 0.45, z)); G.add(at(box(0.42, 0.45, 0.06, mat({ color: 0xb8742a })), x + d, 0.7, z - 0.2)); }
    }
    const morris = new THREE.Group(), posters = tex(16, 16, (x, r) => { px(x, '#1e3a2a', 0, 0, 16, 16); for (let i = 0; i < 6; i++) px(x, ['#e8c84a', '#d8322a', '#f4eee0', '#4a8ae8'][i % 4], (i % 3) * 5 + 1, Math.floor(i / 3) * 7 + 2, 4, 6); }, 441);
    morris.add(at(cyl(0.7, 0.7, 3, 10, mat({ map: posters, rep: [3, 1] })), 0, 1.5, 0)); morris.add(at(new THREE.Mesh(new THREE.SphereGeometry(0.85, 10, 4, 0, TAU, 0, PI / 2), mat({ color: 0x1e3a2a })), 0, 3.05, 0));
    G.add(at(morris, -9, 0, -10.5));
    const cart = new THREE.Group(), stripes = tex(16, 4, x => { for (let k = 0; k < 16; k += 4) { px(x, '#2a5ab8', k, 0, 2, 4); px(x, '#f4eee0', k + 2, 0, 2, 4); } });
    cart.add(at(box(2.4, 1.1, 1.2, mat({ color: 0xf0e8d8 })), 0, 0.75, 0)); cart.add(at(box(2.8, 0.1, 1.6, mat({ map: stripes, rep: [2, 1] })), 0, 2.4, 0));
    for (const sx of [-1, 1]) { cart.add(at(cyl(0.04, 0.04, 1.2, 4, iron), sx * 1.2, 1.8, 0.6)); cart.add(rot(at(cyl(0.3, 0.3, 0.08, 8, mat({ color: 0x2a2a2a })), sx * 0.8, 0.3, 0.64), PI / 2, 0, 0)); }
    G.add(rot(at(cart, 11, 0, -5), 0, -0.5, 0));

    // a carousel by the fountains
    const car = new THREE.Group(); car.add(at(cyl(3, 3, 0.4, 12, mat({ color: 0xe8e0c8 })), 0, 0.2, 0)); car.add(at(cone(3.4, 1.6, 12, mat({ map: tex(16, 4, x => { for (let i = 0; i < 16; i += 4) { px(x, '#e84a6a', i, 0, 2, 4); px(x, '#f4f0e0', i + 2, 0, 2, 4); } }), rep: [3, 1] })), 0, 4.3, 0)); car.add(at(cyl(0.3, 0.3, 3.4, 8, mat({ color: 0xc8962a })), 0, 2, 0));
    const horses = []; for (let i = 0; i < 6; i++) { const a = i / 6 * TAU, hG = new THREE.Group(); hG.add(at(cyl(0.03, 0.03, 3.4, 3, mat({ color: 0xc8962a })), 0, 2, 0)); const hb = at(box(0.3, 0.45, 0.9, mat({ color: [0xffffff, 0x3a2a1a, 0xc88a5a][i % 3] })), 0, 1.2, 0); hG.add(hb); hG.position.set(Math.cos(a) * 2.3, 0, Math.sin(a) * 2.3); hG.rotation.y = -a; car.add(hG); horses.push([hb, i]); }
    G.add(at(car, 13, 0, -22));

    // pigeons pecking on the beat behind Saxo, and a red balloon drifting up
    const pigeons = []; for (let i = 0; i < 7; i++) { const p = new THREE.Group(), pm = mat({ color: 0xc8ccd8 }); p.add(at(box(0.18, 0.16, 0.3, pm), 0, 0.12, 0)); p.add(at(box(0.11, 0.11, 0.11, mat({ color: 0x6a8a9a })), 0, 0.25, 0.15)); p.add(at(box(0.04, 0.04, 0.06, mat({ color: 0xe8a040 })), 0, 0.24, 0.23)); G.add(rot(at(p, (i - 3) * 1.1, 0, -5 - (i % 3) * 0.8), 0, hash(i, 442) * TAU, 0)); pigeons.push([p, i]); }
    const balloon = new THREE.Group(); balloon.add(at(sph(0.38, 8, 6, mat({ color: 0xe8222a })), 0, 0, 0)); balloon.add(at(box(0.02, 1.2, 0.02, mat({ color: 0xeeeeee })), 0, -0.95, 0)); G.add(balloon);
    // flag `jet` ([x0, y0, z0, x1, y1, z1] over the shot, "Voyage Voyage"): our airliner flying over Paris, nose first
    const jet = jetModel(k); jet.scale.setScalar(1.0); G.add(jet); const jv = new THREE.Vector3();

    return {
      group: G, sky: grad([[0, '#141c48'], [0.45, '#3a3a7a'], [0.8, '#a86a8a'], [1, '#f0a070']]), shadowCol: 0x5a5c6a,
      light() { lights(0x7a7498, 0xffb888, [-0.5, -0.5, 0.6], 0x5a5a88, [60, 260], 9); lampPos.forEach(([x, z], i) => pt(i, x, 4, z, 1.4, 1.1, 0.6)); },
      anim(t, P = {}) {
        const n = Math.floor(t * 10), b = barHit(t), h = hit(t);
        jet.visible = !!P.jet;
        if (P.jet) { const [x0, y0, z0, x1, y1, z1] = P.jet, u = Math.max(0, Math.min(1, (t - P.t0) / Math.max(0.1, P.t1 - P.t0))); jet.position.set(x0 + (x1 - x0) * u, y0 + (y1 - y0) * u, z0 + (z1 - z0) * u); jv.set(x1 - x0, y1 - y0, z1 - z0); jet.rotation.set(0, Math.atan2(-jv.x, -jv.z), 0); jet.rotateX(Math.atan2(jv.y, Math.hypot(jv.x, jv.z))); jet.rotateZ(-0.12); (jet.userData.fans || []).forEach(f => { f.rotation.z = t * 31; }); }
        spk.forEach(([s, i]) => { s.visible = hash(i, n) < 0.12 + 0.55 * b; });
        beacon.rotation.y = t * 0.7;
        jets.forEach(([j, i, big]) => { const hh = big ? 1 + 9 * b : 0.6 + 4.5 * hit(t - i * 0.04); j.scale.y = hh; j.position.y = hh / 2; });
        waterM.uniforms.uOff.value.set(0, t * 0.1); seineM.uniforms.uOff.value.set(t * 0.02, 0);
        const u = fr(t / 22); boat.position.set(-90 + u * 180, 0, -36); boat.visible = Math.abs(boat.position.x) > 14;
        car.rotation.y = t * 0.5; horses.forEach(([hb, i]) => { hb.position.y = 1.2 + 0.3 * Math.sin(t * 2 + i * 1.3); });
        pigeons.forEach(([p, i]) => { const pk = Math.max(0, Math.sin((beat(t) + i * 0.37) * PI)); p.rotation.x = 0.5 * pk * pk; });
        const v = fr(t / 14); balloon.position.set(2.5 + Math.sin(t * 0.7) * 1.2, 1.5 + v * 30, -6 - v * 12); balloon.rotation.z = 0.15 * Math.sin(t * 1.3);
      },
    };
  }

  return { bikini: bikini(), paris: paris() };
}
