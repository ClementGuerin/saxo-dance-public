// maps7.js: the "He's A Pirate" maps (2026-09-26, a Pirates of the Caribbean theme: the user's queue asked for it, not
// the song's clip). Same contract as the other map files, pure in t:
//   cave   the cursed treasure grotto at night: a rock dome with a hole in its roof, a moonbeam on the stone chest,
//          mounds of gold, a skull on a rock, two torches, the rowboat moored at the water's edge and, through the cave
//          mouth at the back, the moonlit sea with the black ship at anchor. Spots (CAVE): the chest, Sadi's post, the
//          ledge Saxo drops from. Shot flags read by anim(t, P): `chestOpen` (cut seconds: the lid swings up, gold light
//          pours out), `carrotTaken` (cut seconds: the golden carrot leaves the chest), `tied` (the rope round Sadi and her
//          post), `dim` (0-1: the torches and the chest glow turned down).
//   pearl  the black ship at night on the open sea: dark planks, three masts under tattered black sails, a Jolly Roger,
//          lanterns, the wheel, cannons, barrels, Kob's hammock, the sea 2.3 m below the deck, a low moon behind the
//          bow. Spots (PEARL): the mainmast (Saxo gets chained to it), the bow, the hammock, the wheel, SEA (the water
//          level), GIANT (where the sea monster rises, beyond the bow). Flags: `chain` (cut seconds: the chain snaps round
//          Saxo and the mast; true = already on), `boat` ([x0, z0, x1, z1]: the lifeboat rowing across the shot),
//          `splash` ([x, z, cut s]: a burst of sea as the monster rises), `foam` ([x, z, r]: foam round her waterline),
//          `fins` ([x0, z0, x1, z1]: the wake behind her ears gliding across the shot), `waves` (spray bursting over the bow
//          on every beat), `dark` (cut seconds: the moon covered, the ship in the dark), `light` (cut seconds: a lightning
//          flash lights everything, then the dark again), `calm` (no wind in the sails), `noMoon`.
import { mapKit } from './mapkit.js';

export const CAVE = { CHEST: [-2.0, -2.7], POST: [0.1, -1.6], ROPE: [1.9, -0.3], WATER: -5.2 };   // ROPE: where Saxo slides down from the dark (flag `rope`)
export const PEARL = { MAST: [0, -3], BOW: [0, -13.2], HAMMOCK: [2.85, -0.4, 0.44], WHEEL: [0, 8.2], SEA: -2.3, GIANT: [-24, -5], MOON: [-78, 21, -16], RAIL: 4.15 };   // HAMMOCK: [x, z, seat y]; GIANT: off the port side

export function buildPirateMaps(K) {
  const k = mapKit(K);
  const { THREE, mat, tex, px, noise, box, U, TAU, PI, hash, fr, hit, beat, grad, cyl, cone, sph, ico, at, rot, merged, flat, lights, pt } = k;
  const stars = (n, R, seed, col, eMin) => { const m = k.stars(n, R, seed, col, eMin); m.material.uniforms.uNoFog.value = 1; return m; };
  const M = (c, o = {}) => mat({ color: c, ...o }), glow = c => mat({ color: c, unlit: 1 });
  const cl = x => Math.max(0, Math.min(1, x)), sm = x => { x = cl(x); return x * x * (3 - 2 * x); };

  // ---- shared pieces ----
  // a chunky ring of chain links (or rope) round a point: a flattened loop of small boxes, alternating link angles
  function ring(r1, r2, n, m, link = [0.09, 0.05, 0.035]) {
    const parts = [];
    for (let i = 0; i < n; i++) {
      const a = i / n * TAU, l = at(new THREE.Mesh(new THREE.BoxGeometry(...link)), Math.cos(a) * r1, 0, Math.sin(a) * r2);
      l.rotation.set(i % 2 ? PI / 2 : 0, -a + PI / 2, 0); parts.push(l);
    }
    return merged(parts, m);
  }
  // a small wooden rowboat, bow at -z, floor at y = 0.12 above its waterline
  function rowboat() {
    const g = new THREE.Group(), wood = M(0x9a6a3e), dark = M(0x5a3a22);
    g.add(at(box(1.05, 0.08, 2.3, dark), 0, 0.08, 0));
    for (const s of [-1, 1]) g.add(rot(at(box(0.08, 0.42, 2.3, wood), s * 0.56, 0.3, 0), 0, 0, s * 0.18));
    g.add(at(box(1.2, 0.42, 0.08, wood), 0, 0.3, 1.15)); g.add(rot(at(cone(0.62, 0.9, 4, wood), 0, 0.3, -1.55), -PI / 2, PI / 4, 0));
    g.add(at(box(1.0, 0.06, 0.28, wood), 0, 0.34, 0.35));
    for (const s of [-1, 1]) g.add(rot(at(box(0.05, 0.05, 1.8, M(0xb08a5a)), s * 0.75, 0.42, 0.1), 0.1, 0, s * 0.5));   // the oars
    g.add(at(box(0.05, 0.5, 0.05, dark), 0, 0.55, 1.05)); g.add(at(box(0.16, 0.2, 0.16, glow(0xffc050)), 0, 0.85, 1.05));   // a lantern on a pole at the stern
    return g;
  }
  // a black ship far away (the cave mouth's view), bow to the right
  function farShip() {
    const g = new THREE.Group(), hull = M(0x0c0c10), sail = M(0x1a1a20);
    g.add(at(box(14, 3, 3.4, hull), 0, 1.5, 0)); g.add(rot(at(cone(1.9, 4, 4, hull), 8.6, 1.5, 0), 0, 0, -PI / 2));
    for (const [x, h] of [[-4.5, 12], [0, 15], [4.5, 11]]) { g.add(at(cyl(0.15, 0.2, h, 5, hull), x, h / 2 + 2, 0)); for (const y of [h * 0.45, h * 0.75]) g.add(at(box(3.4, 3.2, 0.1, sail), x, y + 1, 0)); }
    return g;
  }
  // the sea: a big plane, dark blue with moon glitter
  const seaTex = (base, hi, seed) => tex(32, 32, (x, r) => { px(x, base, 0, 0, 32, 32); noise(x, r, 32, 32, hi, 180); for (let i = 0; i < 9; i++) px(x, '#b8c8e8', Math.floor(r() * 29), Math.floor(r() * 32), 3, 1); }, seed);
  // the moon: a pale disc with two grey seas and a dithered halo
  function moon(R) {
    const g = new THREE.Group();
    const faceT = tex(16, 16, (x, r) => { px(x, '#f4ecc8', 0, 0, 16, 16); px(x, '#d8cfa8', 4, 4, 4, 3); px(x, '#dcd3ac', 9, 9, 3, 3); noise(x, r, 16, 16, ['#ece2bc', '#fbf4d8'], 30); });
    const disc = new THREE.Mesh(new THREE.CircleGeometry(R, 12), mat({ map: faceT, unlit: 1, nofog: 1 })); g.add(disc);
    const haloT = tex(16, 16, (x, r) => { for (let i = 0; i < 16; i++) for (let j = 0; j < 16; j++) if ((i + j) % 2 === 0 && r() < 0.8) px(x, 'rgba(200,210,240,0.8)', i, j, 1, 1); });
    const halo = new THREE.Mesh(new THREE.RingGeometry(R * 1.05, R * 1.7, 16), mat({ map: haloT, unlit: 1, rep: [6, 1], nofog: 0.6 })); halo.position.z = -0.2; halo.visible = false; g.add(halo);   // the dithered halo read as a record's grooves
    g.userData = { disc, halo }; return g;
  }

  // =====================================================================================================================
  function cave() {
    const G = new THREE.Group();
    const [CX, CZ] = CAVE.CHEST, [PX, PZ] = CAVE.POST, WZ = CAVE.WATER;
    // ---- floor: dark sand and rock, gold coins scattered towards the treasure ----
    const floorT = tex(32, 32, (x, r) => { px(x, '#4a4238', 0, 0, 32, 32); noise(x, r, 32, 32, ['#3e372f', '#554c40', '#463e34'], 300); }, 701);
    G.add(flat(24, 16.4, mat({ map: floorT, rep: [8, 5] }), 0, 0, WZ + 8.2));
    // the rock lip along the water's edge
    const rockM = mat({ map: tex(16, 16, (x, r) => { px(x, '#3a4048', 0, 0, 16, 16); noise(x, r, 16, 16, ['#2e343c', '#46505a', '#34404a', '#3a4a3a'], 120); }, 702) });
    for (let i = 0; i < 14; i++) { const x = -11 + i * 1.7 + hash(i, 1) * 0.6, s = 0.35 + hash(i, 2) * 0.35; if (Math.abs(x - 2.2) < 1.3) continue; G.add(rot(at(ico(s, 0, rockM), x, s * 0.25, WZ + 0.1), hash(i, 3) * 3, hash(i, 4) * 3, 0)); }
    // ---- the dome: an inside-out rock hemisphere round the chest, a hole in its roof, the mouth open at the back ----
    const domeG = new THREE.SphereGeometry(11.5, 14, 7, 1.5 * PI + 0.62, TAU - 1.24, 0.22, PI / 2 - 0.22);
    const pos = domeG.attributes.position; for (let i = 0; i < pos.count; i++) { const f = 1 + (hash(i, 5) - 0.5) * 0.16; pos.setXYZ(i, pos.getX(i) * f, pos.getY(i) * (1 + (hash(i, 6) - 0.5) * 0.1), pos.getZ(i) * f); }
    domeG.computeVertexNormals();
    const domeT = tex(16, 16, (x, r) => { px(x, '#2c323a', 0, 0, 16, 16); noise(x, r, 16, 16, ['#232830', '#363e48', '#2a3a30', '#30363e'], 150); }, 703);
    const dome = new THREE.Mesh(domeG, mat({ map: domeT, rep: [10, 4], side: THREE.BackSide })); dome.position.set(CX, 0, CZ); G.add(dome);
    // rock pillars framing the mouth, and boulders round the walls (they hide where the dome meets the floor)
    for (const s of [-1, 1]) { G.add(rot(at(cone(1.6, 9, 5, rockM), CX + s * 5.6, 4.2, CZ - 9.6), 0, 0, s * 0.12)); G.add(at(ico(1.4, 0, rockM), CX + s * 4.8, 0.5, CZ - 8.8)); }
    for (let i = 0; i < 22; i++) { const a = 1.5 * PI + 0.75 + (i / 21) * (TAU - 1.5), R = 10.2 + hash(i, 7) * 0.8, s = 0.9 + hash(i, 8) * 1.1; G.add(rot(at(ico(s, 0, rockM), CX - Math.cos(a) * R, s * 0.4, CZ + Math.sin(a) * R), hash(i, 9) * 3, hash(i, 10) * 3, 0)); }
    // stalactites hanging from the dome (clear of the cameras: high up)
    for (let i = 0; i < 16; i++) { const a = hash(i, 11) * TAU, R = 3.5 + hash(i, 12) * 5.5, h = 0.8 + hash(i, 13) * 1.6, y = Math.sqrt(Math.max(0, 11.5 ** 2 - R * R)) - 0.3; if (y < 6) continue; G.add(rot(at(cone(0.25 + hash(i, 14) * 0.2, h, 5, rockM), CX + Math.cos(a) * R, y - h / 2, CZ + Math.sin(a) * R), PI, 0, 0)); }
    // ---- the water: a pool at the back running out through the mouth to the open sea ----
    const seaM = mat({ map: seaTex('#0e2238', ['#122a44', '#0a1a2c', '#1a3656'], 704), rep: [70, 70] });
    const sea = flat(500, 500, seaM, 0, -0.3, WZ - 250 + 0.4); G.add(sea);
    const boat = rowboat(); boat.position.set(2.2, -0.3, WZ - 1.3); boat.rotation.y = -0.3; G.add(boat);
    G.add(at(cyl(0.08, 0.1, 1.1, 5, M(0x5a3a20)), 1.3, 0.35, WZ + 0.35));   // the mooring post
    // outside: the moon low over the sea, the black ship at anchor, a far island
    const mn = moon(6); mn.position.set(CX - 14, 15, CZ - 95); G.add(mn);
    G.add(at(farShip(), CX + 14, -0.3, CZ - 75)); G.children.at(-1).rotation.y = -0.35;
    G.add(at(new THREE.Mesh(new THREE.SphereGeometry(16, 8, 4, 0, TAU, 0, PI / 2), M(0x10161c)), CX - 45, -0.3, CZ - 150));
    const starsM = stars(90, 160, 77, 0xdde4ff, 0.05); starsM.position.set(CX, 0, CZ - 60); G.add(starsM);
    // ---- the treasure: mounds of gold round the chest, goblets, a crown, gems, a skull on a rock ----
    const goldT = tex(16, 16, (x, r) => { px(x, '#c8901a', 0, 0, 16, 16); noise(x, r, 16, 16, ['#e8b32a', '#a87412', '#f4cc4a'], 110); for (let i = 0; i < 10; i++) px(x, 'rgba(255,244,190,0.8)', Math.floor(r() * 16), Math.floor(r() * 16), 1, 1); }, 705);
    const goldM = mat({ map: goldT, rep: [3, 2] });
    const MOUNDS = [[CX - 1.8, CZ - 0.6, 1.0, 0.55], [CX - 1.0, CZ - 1.7, 1.2, 0.75], [CX + 0.3, CZ - 1.9, 1.0, 0.6], [CX - 2.8, CZ + 0.8, 0.9, 0.5], [CX + 5.4, CZ - 0.7, 1.1, 0.6], [CX + 6.4, CZ + 0.5, 0.8, 0.45], [CX + 3.6, CZ + 0.1, 0.9, 0.55], [CX + 4.6, CZ - 0.9, 1.0, 0.65]];   // the last two: gold behind Sadi's post, for the hook   // the run from the chest to the rowboat stays clear
    for (const [x, z, r, h] of MOUNDS) { const m = new THREE.Mesh(new THREE.SphereGeometry(r, 8, 3, 0, TAU, 0, PI / 2), goldM); m.scale.y = h / r; m.position.set(x, 0, z); G.add(m); }
    const coinM = M(0xe8b830, { unlit: 0.3 }), coins = [];
    for (let i = 0; i < 60; i++) { const a = hash(i, 15) * TAU, R = 1.0 + hash(i, 16) * 3.2, x = CX + Math.cos(a) * R, z = CZ + 0.4 + Math.sin(a) * R * 0.8; if (z > 0.2 || z < CAVE.WATER + 0.3 || (x - PX) ** 2 + (z - PZ) ** 2 < 0.5) continue; coins.push(rot(at(new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.015, 6)), x, 0.01, z), 0, hash(i, 17) * 3, 0)); }
    G.add(merged(coins, coinM));
    for (const [x, z, s] of [[CX + 2.2, CZ - 0.2, 1], [CX - 2.4, CZ - 0.6, 0.9]]) { const gob = new THREE.Group(); gob.add(at(cyl(0.09, 0.05, 0.14, 6, goldM), 0, 0.2, 0)); gob.add(at(cyl(0.02, 0.02, 0.12, 4, goldM), 0, 0.08, 0)); gob.add(at(cyl(0.07, 0.07, 0.02, 6, goldM), 0, 0.01, 0)); gob.scale.setScalar(s * 1.4); gob.position.set(x, 0, z); G.add(gob); }
    const crown = new THREE.Group(); crown.add(at(cyl(0.16, 0.16, 0.1, 8, goldM), 0, 0.05, 0)); for (let i = 0; i < 6; i++) crown.add(at(cone(0.04, 0.12, 4, goldM), Math.cos(i / 6 * TAU) * 0.15, 0.15, Math.sin(i / 6 * TAU) * 0.15));
    crown.position.set(CX + 1.5, 0.52, CZ - 0.95); crown.rotation.set(0.3, 0.5, 0.2); G.add(crown);
    [[0xe8243a, CX - 1.4, CZ - 0.7], [0x2ad86a, CX + 2.4, CZ - 1.0], [0x3a7aff, CX - 0.2, CZ - 1.2], [0xd83aff, CX + 3.0, CZ - 1.9]].forEach(([c, x, z], i) => G.add(rot(at(box(0.12, 0.12, 0.12, mat({ color: c, unlit: 0.6 })), x, 0.32 + i * 0.03, z), 0.6, i, 0.5)));
    const bone = M(0xe8e2cc), skull = new THREE.Group(); skull.add(at(box(0.3, 0.26, 0.3, bone), 0, 0.13, 0)); skull.add(at(box(0.22, 0.1, 0.24, bone), 0, -0.02, 0.02));
    for (const s of [-1, 1]) skull.add(at(box(0.08, 0.08, 0.02, M(0x141414)), s * 0.07, 0.15, 0.151)); skull.add(at(box(0.04, 0.05, 0.02, M(0x141414)), 0, 0.06, 0.151));
    G.add(at(ico(0.55, 0, rockM), CX - 3.6, 0.2, CZ + 0.4)); skull.position.set(CX - 3.6, 0.62, CZ + 0.4); skull.rotation.y = 0.5; G.add(skull);
    for (const s of [-1, 1]) G.add(rot(at(box(0.5, 0.05, 0.05, bone), CX - 3.35, 0.62, CZ + 0.62), 0, s * 0.6, 0));
    // ---- the stone chest: the lid hinged at its back edge, a gold glow and the golden carrot inside ----
    const stoneT = tex(16, 16, (x, r) => { px(x, '#6a7068', 0, 0, 16, 16); noise(x, r, 16, 16, ['#5a6058', '#7a8078', '#62685e'], 80); px(x, '#4a5048', 0, 3, 16, 1); px(x, '#4a5048', 0, 12, 16, 1); for (const X of [3, 8, 13]) px(x, '#8a7a3a', X, 6, 2, 3); }, 706);
    const stoneM = mat({ map: stoneT }), chest = new THREE.Group();
    chest.add(at(box(1.0, 0.5, 0.62, stoneM), 0, 0.25, 0)); chest.add(at(box(1.06, 0.06, 0.68, stoneM), 0, 0.03, 0));
    const inner = at(box(0.86, 0.04, 0.5, mat({ color: 0xffd23a, unlit: 1 })), 0, 0.47, 0); chest.add(inner);   // the gold heap inside (seen once it's open)
    const lidPivot = new THREE.Group(); lidPivot.position.set(0, 0.5, -0.31); chest.add(lidPivot);
    lidPivot.add(at(box(1.04, 0.16, 0.64, stoneM), 0, 0.08, 0.31)); lidPivot.add(at(box(0.3, 0.08, 0.3, M(0x8a7a3a)), 0, 0.2, 0.31));   // the lid and its carved seal
    const gc = new THREE.Group(); gc.add(rot(at(new THREE.Mesh(new THREE.ConeGeometry(0.065, 0.36, 5), mat({ color: 0xffc81e, unlit: 0.75 })), 0, 0, 0), 0, 0, PI / 2));
    for (let q = 0; q < 3; q++) gc.add(rot(at(box(0.13, 0.028, 0.028, mat({ color: 0x5ad84a, unlit: 0.4 })), -0.22, 0, (q - 1) * 0.03), 0, 0, (q - 1) * 0.4));
    gc.position.set(0.05, 0.55, 0.02); chest.add(gc);
    const rays = new THREE.Group(); chest.add(rays);   // (stick rays read as a tent of yellow poles: the glow is the gold heap, the sparkles and the light)
    chest.position.set(CX, 0, CZ); G.add(chest);
    // sparkles rising from the open chest
    const sparkM = glow(0xfff0a0), sparks = []; for (let q = 0; q < 18; q++) { const s = box(0.05, 0.05, 0.05, sparkM); G.add(s); sparks.push(s); }
    // ---- the moonbeam through the roof hole onto the chest: a see-through cone of blue specks ----
    const beamT = tex(16, 16, (x, r) => { for (let i = 0; i < 16; i++) for (let j = 0; j < 16; j++) if ((i + j) % 2 === 0 && r() < 0.16) px(x, 'rgba(120,150,210,0.8)', i, j, 1, 1); }, 707);
    // (a see-through beam of specks read as a glitch at 270x480: the moon's pool is a point light instead)
    // ---- Sadi's post and the rope round her (flag `tied`) ----
    const wood = M(0x5a3a22); G.add(at(cyl(0.09, 0.11, 1.95, 6, wood), PX, 0.97, PZ)); G.add(at(box(0.3, 0.06, 0.06, wood), PX, 1.7, PZ));
    const ropeM = M(0xc8a060), ropes = [0.3, 0.5].map(y => { const r = ring(0.33, 0.3, 22, ropeM, [0.09, 0.055, 0.055]); r.position.set(PX, y, PZ + 0.17); G.add(r); return r; });
    // ---- the rope Saxo slides down from the dark (flag `rope`) ----
    const rope = at(box(0.05, 11, 0.05, M(0xb89058)), CAVE.ROPE[0], 5.5, CAVE.ROPE[1]); G.add(rope);
    // ---- torches on the walls ----
    const torches = [[CX - 5.6, 1.9, CZ + 0.8], [CX + 5.4, 1.9, CZ + 1.6]].map(([x, y, z]) => {
      G.add(at(cyl(0.05, 0.04, 0.6, 5, M(0x3a2414)), x, y - 0.3, z)); const f = at(cone(0.13, 0.36, 5, glow(0xff9a2a)), x, y + 0.14, z); G.add(f);
      const f2 = at(cone(0.07, 0.22, 4, glow(0xffe07a)), x, y + 0.1, z); G.add(f2); return [f, f2, x, y, z];
    });
    return {
      group: G, sky: grad([[0, '#02040a'], [0.6, '#0a1224'], [1, '#16223a']]), shadowCol: 0x2a2620,
      light() {
        lights(0x323c58, 0x7a90c8, [0.15, -1, 0.25], 0x04060c, [9, 42], 7.5);
      },
      anim(t, P = {}) {
        const dim = 1 - (P.dim || 0), open = P.chestOpen != null ? sm((t - P.chestOpen) / 0.45) : 0, taken = P.carrotTaken != null && t >= P.carrotTaken;
        lidPivot.rotation.x = -1.95 * open; inner.visible = open > 0.05; rays.visible = open > 0.3; gc.visible = !taken;
        sparks.forEach((s, q) => { const u = fr(t * 0.45 + hash(q, 20)); s.visible = open > 0.3; s.position.set(CX + (hash(q, 21) - 0.5) * 0.8, 0.55 + u * 1.6, CZ + (hash(q, 22) - 0.5) * 0.4); s.scale.setScalar(1.4 * (1 - u)); });
        ropes.forEach(r => { r.visible = !!P.tied; }); rope.visible = !!P.rope;
        seaM.uniforms.uOff.value.set(t * 0.01, t * 0.03); sea.position.y = -0.3 + 0.03 * Math.sin(t * 0.8);
        boat.position.y = -0.3 + 0.03 * Math.sin(t * 0.8 + 0.5); boat.rotation.z = 0.03 * Math.sin(t * 0.9);
        mn.userData.disc.material.uniforms.uCol.value.setScalar(1);
        // lights: the chest's gold glow (brightens as it opens), two flickering torches, a cold fill from the mouth
        const fl = q => 0.85 + 0.15 * Math.sin(t * 11 + q * 3) * Math.sin(t * 7.3 + q);
        torches.forEach(([f, f2], q) => { const s = fl(q); f.scale.set(1, s, 1); f2.scale.set(1, 2 - s, 1); });
        pt(0, CX, 1.1, CZ + 0.6, (0.55 + 1.6 * open) * dim, (0.4 + 1.2 * open) * dim, 0.1 * dim);
        pt(1, torches[0][2], 2.1, torches[0][4] + 0.4, 1.15 * fl(0) * dim, 0.55 * fl(0) * dim, 0.18 * dim);
        pt(2, torches[1][2], 2.1, torches[1][4] + 0.4, 1.15 * fl(1) * dim, 0.55 * fl(1) * dim, 0.18 * dim);
        pt(3, CX + 0.3, 4.5, CZ - 0.2, 0.25, 0.32, 0.55);   // the moonbeam's pool of light on the treasure
      },
    };
  }

  // =====================================================================================================================
  function pearl() {
    const G = new THREE.Group(), SEA = PEARL.SEA, [MX, MZ] = PEARL.MAST, RAIL = PEARL.RAIL;
    const plankT = tex(16, 16, (x, r) => { px(x, '#3e2c20', 0, 0, 16, 16); for (let i = 0; i < 16; i += 4) px(x, '#241810', i, 0, 1, 16); noise(x, r, 16, 16, ['#34261c', '#4a3526', '#3a2a1e'], 60); for (const y of [3, 11]) px(x, '#241810', 2, y, 1, 1); }, 711);
    G.add(flat(8.3, 30, mat({ map: plankT, rep: [2.5, 9] }), 0, 0, -2));
    // ---- the hull below the deck: black with a gold line, the bow narrowing to a point ----
    const hullT = tex(16, 16, (x, r) => { px(x, '#101014', 0, 0, 16, 16); noise(x, r, 16, 16, ['#0c0c10', '#18181e'], 40); px(x, '#8a6a2a', 0, 2, 16, 1); }, 712), hullM = mat({ map: hullT, rep: [8, 1] });
    for (const s of [-1, 1]) G.add(at(box(0.3, 2.7, 30, hullM), s * 4.3, -1.25, -2));
    G.add(at(box(8.9, 2.7, 0.3, hullM), 0, -1.25, 13));
    const bowM = mat({ map: hullT, rep: [3, 1] }), bowDeck = mat({ map: plankT, rep: [2.5, 2.5] });   // the bow: a triangular prism, its top flush with the deck
    const bowG = new THREE.CylinderGeometry(4.97, 4.97, 2.65, 3); const bow = new THREE.Mesh(bowG, [bowM, bowDeck, bowM]); bow.rotation.y = PI; bow.position.set(0, -1.3, -19.48); G.add(bow);
    G.add(rot(at(cyl(0.14, 0.22, 9, 5, M(0x2a1c12)), 0, 1.6, -26.5), -1.2, 0, 0));   // the bowsprit
    // ---- rails: a dark top rail on posts, gold trim; cannons poking through ----
    const railM = M(0x221610), trim = M(0x9a7a32);
    for (const s of [-1, 1]) {
      G.add(at(box(0.16, 0.1, 30, railM), s * RAIL, 0.95, -2)); G.add(at(box(0.18, 0.03, 30, trim), s * RAIL, 1.01, -2));
      const posts = []; for (let z = -16.5; z <= 12.5; z += 1.2) posts.push(at(new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.95, 0.09)), s * RAIL, 0.47, z)); G.add(merged(posts, railM));
      for (const z of [-9, -6, 2.5, 5.5]) G.add(rot(at(cyl(0.14, 0.18, 1.2, 8, M(0x141418)), s * (RAIL + 0.3), 0.55, z), 0, 0, s * PI / 2));
    }
    G.add(at(box(8.6, 0.1, 0.16, railM), 0, 0.95, 12.9));
    // ---- three masts under tattered black sails (holes: alpha-0 texels), yards, a Jolly Roger ----
    const mastM = M(0x2a1c12);
    const sailT = tex(16, 16, (x, r) => { px(x, '#1c1c22', 0, 0, 16, 16); noise(x, r, 16, 16, ['#26262e', '#141418', '#202028'], 60); for (let i = 0; i < 7; i++) x.clearRect(Math.floor(r() * 15), 8 + Math.floor(r() * 8), 1 + Math.floor(r() * 2), 1 + Math.floor(r() * 2)); }, 713);
    const sailM = mat({ map: sailT, side: THREE.DoubleSide }), sails = [];
    for (const [z, h] of [[-10, 16], [MZ, 19], [6.5, 13]]) {
      G.add(at(cyl(0.2, 0.3, h, 6, mastM), z === MZ ? MX : 0, h / 2, z));
      for (const [y, w] of [[h * 0.42, 7.2], [h * 0.72, 5.4]]) { G.add(at(box(w + 0.9, 0.14, 0.14, mastM), 0, y + 2.1, z)); const sl = at(box(w, 3.9, 0.06, sailM), 0, y, z + 0.3); G.add(sl); sails.push([sl, y, z]); }
      G.add(at(cyl(0.65, 0.55, 0.55, 8, mastM), 0, h * 0.88, z));   // the crow's nest
    }
    const flagT = tex(16, 12, x => { px(x, '#0a0a0c', 0, 0, 16, 12); px(x, '#f0ece0', 6, 2, 4, 4); px(x, '#0a0a0c', 7, 3, 1, 1); px(x, '#0a0a0c', 9, 3, 1, 1); for (let i = 0; i < 8; i++) { px(x, '#f0ece0', 3 + i, 7 + (i % 2), 1, 1); px(x, '#f0ece0', 3 + i, 8 - (i % 2), 1, 1); } });
    const flag = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 1.6, 6, 1), mat({ map: flagT, side: THREE.DoubleSide })); G.add(at(flag, 1.2, 19.4, MZ)); const flagP = flag.geometry.attributes.position, flagX = Array.from({ length: flagP.count }, (_, i) => flagP.getX(i));
    // rigging: shrouds from the masts to the rails (thin, well above the cameras' eye line)
    // no shrouds: thin lines crossed faces in the deck shots (the reviewer, 2026-09-26); the loop stays for a daytime ship
    for (const s of []) for (const [z, top] of [[-10, 14], [MZ, 17], [6.5, 11]]) { const a = new THREE.Vector3(0, top, z), b = new THREE.Vector3(s * RAIL, 1, z + 1.8), d = a.clone().sub(b), r = box(0.035, d.length(), 0.035, M(0x1a120c)); r.position.copy(a).add(b).multiplyScalar(0.5); r.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize()); G.add(r); }
    // ---- deck dressing: barrels, crates, a coil of rope, the wheel on its pedestal, two lanterns ----
    const barrelM = mat({ map: tex(8, 8, x => { px(x, '#5a3a20', 0, 0, 8, 8); px(x, '#2a2a2a', 0, 1, 8, 1); px(x, '#2a2a2a', 0, 6, 8, 1); }), rep: [3, 1] });
    for (const [x, z] of [[-3.3, -6.2], [-3.5, -7.1], [-2.7, -6.7], [3.4, 4.2], [3.2, 5.1]]) G.add(at(cyl(0.34, 0.3, 0.85, 8, barrelM), x, 0.42, z));
    for (const [x, z, r] of [[-3.2, 3.2, 0.3], [-3.0, 4.2, -0.2]]) G.add(rot(at(box(0.8, 0.6, 0.7, M(0x6a4a2a)), x, 0.3, z), 0, r, 0));
    const [WX, WZ] = PEARL.WHEEL; G.add(at(box(0.3, 1.0, 0.3, mastM), WX, 0.5, WZ + 0.3));
    const wheel = new THREE.Group(); wheel.add(at(new THREE.Mesh(new THREE.TorusGeometry(0.5, 0.05, 4, 10), M(0x6a4428)), 0, 0, 0)); for (let i = 0; i < 8; i++) { const sp = box(0.04, 1.3, 0.04, M(0x6a4428)); sp.rotation.z = i / 8 * PI; wheel.add(sp); }
    wheel.position.set(WX, 1.25, WZ); G.add(wheel);
    const lanterns = [[MX + 0.35, 2.3, MZ + 0.1], [2.5, 2.0, 7.4]].map(([x, y, z]) => { G.add(at(box(0.2, 0.28, 0.2, M(0x1a1a1a)), x, y, z)); const f = at(box(0.14, 0.2, 0.14, glow(0xffc050)), x, y, z); G.add(f); return f; });
    // ---- Kob's hammock: a canvas sling between two posts on the starboard side ----
    const [HX, HZ, HY] = PEARL.HAMMOCK, canvasM = M(0xc8b890);
    for (const z of [HZ - 1.5, HZ + 1.5]) G.add(at(cyl(0.07, 0.08, 1.35, 5, mastM), HX, 0.67, z));
    for (let i = 0; i < 9; i++) { const u = i / 8 - 0.5, z = HZ + u * 2.6, y = HY - 0.02 + (u * u) * 2.2; const seg = at(box(0.78, 0.035, 0.34, canvasM), HX, y, z); seg.rotation.x = -u * 1.1; G.add(seg); }
    for (const s of [-1, 1]) for (const z of [HZ - 1.5, HZ + 1.5]) { const top = new THREE.Vector3(HX, 1.28, z), end = new THREE.Vector3(HX + s * 0.36, HY + 0.52, HZ + Math.sign(z - HZ) * 1.3), d = top.clone().sub(end), c = box(0.02, d.length(), 0.02, M(0x8a7a5a)); c.position.copy(top).add(end).multiplyScalar(0.5); c.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize()); G.add(c); }
    // ---- the chain round Saxo and the mainmast (flag `chain`): two loops of dark links and a padlock ----
    const linkT = tex(16, 4, x => { for (let i = 0; i < 16; i += 4) { px(x, '#a8acb8', i, 0, 3, 4); px(x, '#5a5e6a', i + 3, 0, 1, 4); px(x, '#d8dce6', i + 1, 1, 1, 1); } });
    const chainM = mat({ map: linkT, rep: [12, 1] }), chainG = new THREE.Group(); G.add(chainG);   // loose boxes read as broken geometry (reviewer, 2026-09-26)
    const chains = [0.36, 0.56].map(y => { const r = new THREE.Mesh(new THREE.TorusGeometry(1, 0.05, 5, 32), chainM); r.rotation.x = PI / 2; r.position.y = y; chainG.add(r); return r; });
    const lock = at(box(0.13, 0.15, 0.07, M(0xc8b060)), 0, 0.44, 0); chainG.add(lock);
    // ---- the sea below: dark blue with moon glitter; the lifeboat; islands; the moon behind the bow ----
    const seaM = mat({ map: seaTex('#0c1c30', ['#10243c', '#08162a', '#16304c'], 714), rep: [90, 90] });
    const sea = flat(700, 700, seaM, 0, SEA, -60); G.add(sea);
    const lifeboat = rowboat(); G.add(lifeboat);
    const isles = new THREE.Group(); for (const [x, z, s] of [[-80, -160, 1], [90, -190, 0.8], [-150, 40, 0.9]]) isles.add(at(new THREE.Mesh(new THREE.SphereGeometry(18 * s, 8, 4, 0, TAU, 0, PI / 2), M(0x0a1016)), x, SEA, z)); G.add(isles);
    const mn = moon(7); mn.position.set(...PEARL.MOON); mn.lookAt(0, 3, -4); G.add(mn);
    const starsM = stars(110, 200, 71, 0xdde4ff, 0.06); starsM.position.set(0, 0, -40); G.add(starsM);
    // ---- white water: the monster's burst, the foam round her, the wake behind her ears, spray over the bow ----
    const foamM = glow(0xe8f2ff), foamM2 = mat({ color: 0xb8d0e8, unlit: 0.8 });
    const burst = []; for (let q = 0; q < 120; q++) { const b = box(0.3, 0.3, 0.3, q % 3 ? foamM : foamM2); G.add(b); burst.push(b); }   // big cubes read as broken polygons
    const foam = []; for (let q = 0; q < 40; q++) { const b = box(0.9, 0.25, 0.9, q % 2 ? foamM : foamM2); G.add(b); foam.push(b); }
    const wake = []; for (let q = 0; q < 36; q++) { const b = box(0.35, 0.14, 0.35, q % 2 ? foamM : foamM2); G.add(b); wake.push(b); }
    const gust = []; for (let q = 0; q < 70; q++) { const b = box(0.035, 0.035, 0.2, q % 2 ? foamM2 : foamM); b.rotation.y = PI / 2; G.add(b); gust.push(b); }
    const spray = []; for (let q = 0; q < 30; q++) { const b = box(0.22, 0.22, 0.22, q % 2 ? foamM : foamM2); G.add(b); spray.push(b); }
    // the lightning bolt (flag `light`): a jagged self-lit line in the sky over the port side
    const bolt = new THREE.Group(); { let x = 0, y = 0; for (let q = 0; q < 7; q++) { const nx = x + (hash(q, 30) - 0.5) * 5, ny = y - 4.5, d = new THREE.Vector3(nx - x, ny - y, 0), s = box(0.35, d.length(), 0.35, glow(0xeef4ff)); s.position.set((x + nx) / 2, (y + ny) / 2, 0); s.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize()); bolt.add(s); x = nx; y = ny; } }
    bolt.position.set(-70, 34, 12); bolt.rotation.y = PI / 2; bolt.traverse(m => { if (m.material) m.material.uniforms.uNoFog.value = 1; }); G.add(bolt);
    return {
      group: G, sky: grad([[0, '#01030a'], [0.55, '#07102a'], [1, '#18264a']]), shadowCol: 0x1c140e,
      light() { lights(0x3a4870, 0x9ab0e0, [0.22, -0.55, 0.8], 0x050914, [22, 120], 8); },
      anim(t, P = {}) {
        const dark = P.dark != null && t >= P.dark ? 1 : 0, fl = P.light != null ? Math.max(0, 1 - Math.abs(t - P.light - 0.08) / 0.12) + (t >= P.light && t < P.light + 0.4 ? 0.35 * Math.max(0, Math.sin((t - P.light) * 60)) : 0) : 0;
        const ambK = (1 - 0.72 * dark) + 1.6 * fl;
        U.uAmb.value.set(0x3a4870).multiplyScalar(ambK); U.uDirCol.value.set(0x9ab0e0).multiplyScalar((1 - 0.85 * dark) + 2 * fl);
        mn.visible = !P.noMoon; mn.userData.disc.material.uniforms.uCol.value.setScalar(1 - 0.8 * dark);
        bolt.visible = fl > 0.2;
        // the ship rocks: the sea, the islands and the moon move, the deck stays level (the camera sees it roll)
        const bob = Math.sin(t * 0.8) * 0.12;
        sea.position.y = SEA + bob * 0.3; seaM.uniforms.uOff.value.set(t * 0.012, t * 0.05); isles.position.y = bob * 0.5;
        const calm = P.calm ? 0.25 : 1;
        sails.forEach(([s, y, z], i) => { s.scale.z = 1 + (2.5 + 1.5 * Math.sin(t * 1.3 + i)) * calm; s.position.z = z + 0.3 + 0.12 * Math.sin(t * 1.3 + i) * calm; });
        for (let i = 0; i < flagP.count; i++) { const x = flagX[i] + 1.2; flagP.setZ(i, Math.sin(t * 6 - x * 2.5) * 0.18 * x * calm); } flagP.needsUpdate = true;
        lanterns.forEach((f, q) => f.material.uniforms.uCol.value.set(0xffc050).multiplyScalar(0.8 + 0.2 * Math.sin(t * 9 + q * 2)));
        // the chain: from `chain` seconds (true = on the whole shot), it snaps shut over 0.12 s
        const cOn = P.chain === true ? 1 : P.chain != null ? sm((t - P.chain) / 0.12) : 0;
        const R = P.chainRing || [MX, MZ, 0.8, 0.72, 0], k = 0.6 + 0.4 * cOn;   // [centre x, z, radius along the axis, across it, the axis yaw]
        chainG.position.set(R[0], 0, R[1]); chainG.rotation.y = R[4] * PI / 180; lock.position.set(-R[2] * k - 0.03, 0.44, 0);
        chains.forEach(c => { c.visible = cOn > 0; c.scale.set(R[2] * k, R[3] * k, 1); }); lock.visible = cOn >= 1;
        // the lifeboat rowing across the shot
        const B = P.boat; lifeboat.visible = !!B;
        if (B) { const u = cl((t - (P.t0 ?? 0)) / Math.max(0.1, (P.t1 ?? t + 1) - (P.t0 ?? 0))); lifeboat.position.set(B[0] + (B[2] - B[0]) * u, SEA + bob * 0.3, B[1] + (B[3] - B[1]) * u); lifeboat.rotation.set(0.03 * Math.sin(t * 1.4), Math.atan2(B[2] - B[0], B[3] - B[1]) + PI, 0.04 * Math.sin(t * 1.1)); }
        // the burst: white water thrown up round the monster as she rises, falling back
        const S = P.splash; burst.forEach((b, q) => {
          const dt = S ? t - S[2] - hash(q, 40) * 0.15 : -1; b.visible = !!S && dt > 0 && dt < 2.2; if (!b.visible) return;
          const a = hash(q, 41) * TAU, R = 5 + hash(q, 42) * 7, v = 11 + hash(q, 43) * 9, y = v * dt - 4.9 * dt * dt;
          b.position.set(S[0] + Math.cos(a) * R * (1 + dt * 0.4), SEA + Math.max(0, y), S[1] + Math.sin(a) * R * 0.6 * (1 + dt * 0.4)); b.scale.setScalar(0.6 + hash(q, 44) * 1.0); b.rotation.set(dt * 3 + q, q, 0);
        });
        const F = P.foam; foam.forEach((b, q) => { b.visible = !!F; if (!F) return; const a = q / foam.length * TAU + 0.2 * Math.sin(t + q), R = F[2] * (0.95 + 0.1 * Math.sin(t * 2 + q * 1.7)); b.position.set(F[0] + Math.cos(a) * R, SEA + bob * 0.3 + 0.08 + 0.08 * Math.sin(t * 3 + q), F[1] + Math.sin(a) * R * 0.7); b.rotation.y = a; });
        const W = P.fins; wake.forEach((b, q) => {
          b.visible = !!W; if (!W) return;
          const u = cl((t - (P.t0 ?? 0)) / Math.max(0.1, (P.t1 ?? t + 1) - (P.t0 ?? 0))), side = q % 2 ? 1 : -1, back = (q >> 1) * 0.55, dx = W[2] - W[0], dz = W[3] - W[1], L = Math.hypot(dx, dz) || 1;
          const x = W[0] + dx * u - dx / L * back, z = W[1] + dz * u - dz / L * back, spread = 0.9 + back * 0.35;
          b.position.set(x + dz / L * side * spread * (W[4] || 1), SEA + bob * 0.3 + 0.05, z - dx / L * side * spread * (W[4] || 1)); b.scale.setScalar(1.6 - back * 0.07);
        });
        const Gu = P.gust; gust.forEach((b, q) => {
          const dt = Gu ? t - Gu[3] : -1; b.visible = !!Gu && dt > 0 && dt < Gu[4]; if (!b.visible) return;
          const u = fr(dt * 2.2 + hash(q, 60)); b.position.set(Gu[0] - 2.5 + u * 5.5, Gu[1] + (hash(q, 61) - 0.5) * 1.6, Gu[2] + (hash(q, 62) - 0.5) * 1.8);
        });
        const hitB = P.waves ? hit(t) : 0; spray.forEach((b, q) => {
          b.visible = !!P.waves && hitB > 0.2; if (!b.visible) return;
          const s = q % 2 ? 1 : -1, u = 1 - hitB; b.position.set(s * (RAIL + 0.2) + s * u * 1.2 * hash(q, 50), 0.6 + (1.8 + 2 * hash(q, 51)) * Math.sin(Math.min(1, u * 1.6) * PI), -15 + hash(q, 52) * 8); b.scale.setScalar(0.8 + 1.4 * hash(q, 53));
        });
        // lights: the mast lantern, the stern lantern, the flash
        const lk = 1 - 0.35 * dark;
        pt(0, MX + 0.35, 2.3, MZ + 0.4, 1.25 * lk, 0.72 * lk, 0.25 * lk);
        pt(1, 2.5, 2.0, 7.4, 1.0, 0.6, 0.2);
        pt(2, 0, 3.5, -8, 0.25 + 3 * fl, 0.3 + 3 * fl, 0.45 + 3.2 * fl);
      },
    };
  }

  return { cave: cave(), pearl: pearl() };
}
