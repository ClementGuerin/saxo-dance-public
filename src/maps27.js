// maps27.js: the "Spooky, Scary Skeletons" map (2026-10-04, Andrew Gold, 1996; no clip: the world is the skeleton
// dance in a graveyard at midnight, the 1929 cartoon's and every October meme's). Same contract as the other map files,
// pure in t:
//   cemetery  an old graveyard on Halloween night under a huge full moon: a gravel path along z from the iron gate
//             (GATE, z +7.5) to a stone crypt (CRYPT, its double door at DOOR, z -8.4); headstones in rows on both
//             sides, the three big ones by the path (STONES) tall enough to hide a skeleton behind; an open grave with a
//             dirt pile and a shovel (GRAVE); dead trees (TREES), jack-o'-lanterns glowing along the path, low fog,
//             bats crossing the moon, a church on the hill behind.
// Flags: heap ([{ x, z, s, r, h }]: a heap of bones and skulls, the skulls on top facing the lens; s = the second it
// appears, with a puff of dust: the skeletons fell apart in fright), dust ([[x, z, s, size]]: a puff of grey dust),
// doors (0 shut .. 1 open, or [s0, s1, a, b] over the shot), fog (0-1, default 1), bats (false: none), noGrave, hearts
// ([[x, y, z, s0]]: three pink hearts pop and rise from each point), remains ({ x, z, s, yaw, k }: one skeleton fallen
// apart: a skull looking up, a few ribs, its one leg standing straight up; from s, with a puff of dust), clear
// ([[x, z, r]]: no headstone, pumpkin or tree there: the lenses), key [x, y, z, r, g, b] (a light for a corner), moon
// ([x, y, z]: the moon and its halo moved for one shot, turned to the graveyard: beside the crypt for a low lens, which
// sees it behind the crypt otherwise), dirt ([[x, z, s, size]]: from s, a dark hole in the ground and clods of earth
// thrown up round it: something burst out of the ground there).
import { mapKit } from './mapkit.js';

export const CEMETERY = {
  PUMPKINS: [[-1.6, 6.4], [1.6, 6.3], [-1.75, 4.7], [1.8, 4.5], [-2.55, -7.6], [2.55, -7.7], [-3.1, 1.2], [3.15, -1.9], [-3.2, -5.2], [3.0, 3.4]],   // away from the path's action
  PATH: 1.1,                       // the path's half width (x)
  GATE: [0, 7.5], DOOR: [0, -8.4], CRYPT_Z: -10.2,
  STONES: [[-2.0, 2.6], [2.05, 0.1], [-2.05, -2.6]],   // the big headstones by the path, facing it; behind = further from the path
  STONE_H: 1.3, GRAVE: [2.7, -4.6], HEAP: [0, -5.6],
  TREES: [[-5.6, -6.2], [6.0, -2.4], [-6.6, 3.8]],
};

export function buildCemeteryMaps(K) {
  const k = mapKit(K);
  const { THREE, mat, tex, px, noise, box, TAU, PI, beat, grad, cyl, cone, ico, at, rot, flat, lights, pt, hash, merged, stars } = k;
  const M = (c, o = {}) => mat({ color: c, ...o }), glow = (c, u = 1) => mat({ color: c, unlit: u });
  const cl = x => Math.max(0, Math.min(1, x)), sm = x => { x = cl(x); return x * x * (3 - 2 * x); };
  const shotT = (t, P) => P.t0 != null ? t - P.t0 : 0;
  const cleared = (P, x, z) => (P.clear || []).some(([cx, cz, r]) => (x - cx) ** 2 + (z - cz) ** 2 < r * r);
  const { PATH, GATE, CRYPT_Z, STONES, STONE_H, GRAVE, TREES, PUMPKINS } = CEMETERY;

  function cemetery() {
    const G = new THREE.Group();
    // ground: dark moonlit grass, the gravel path
    const grassT = tex(32, 32, (x, r) => { px(x, '#2e3a2c', 0, 0, 32, 32); noise(x, r, 32, 32, ['#26321f', '#38452f', '#2a2f2a', '#3a3a30'], 260); }, 2701);
    G.add(flat(160, 160, mat({ map: grassT, rep: [50, 50] })));
    const gravelT = tex(16, 16, (x, r) => { px(x, '#6a6862', 0, 0, 16, 16); noise(x, r, 16, 16, ['#5a5852', '#7a786e', '#4e4c48', '#86847a'], 110); }, 2702);
    G.add(flat(PATH * 2, 17.5, mat({ map: gravelT, rep: [2, 16] }), 0, 0.004, -0.4));
    // headstones: rounded-top slabs and crosses facing the path, a low mound in front of each
    const stoneT = tex(16, 16, (x, r) => { px(x, '#8a8c90', 0, 0, 16, 16); noise(x, r, 16, 16, ['#7a7c80', '#9a9ca0', '#6e7276', '#5e7a5a'], 70); }, 2703);
    const stoneM = mat({ map: stoneT }), engr = M(0x3a3c40), moundM = M(0x56503e), deco = [];
    function headstone(x, z, s = 1, kind = 0, tilt = 0, mound = true) {
      const g = new THREE.Group(), face = x < 0 ? PI / 2 : -PI / 2;   // the engraved face turned to the path
      if (kind === 1) {   // a cross
        g.add(at(box(0.16 * s, 1.15 * s, 0.14 * s, stoneM), 0, 0.575 * s, 0)); g.add(at(box(0.62 * s, 0.15 * s, 0.14 * s, stoneM), 0, 0.82 * s, 0));
      } else {            // a slab with a rounded top, two engraved lines and a small cross
        const w = 0.7 * s, h = 0.95 * s; g.add(at(box(w, h, 0.16 * s, stoneM), 0, h / 2, 0));
        g.add(at(rot(cyl(w / 2, w / 2, 0.16 * s, 10, stoneM), PI / 2, 0, 0), 0, h, 0));
        for (const y of [0.62, 0.48]) g.add(at(box(w * 0.55, 0.035 * s, 0.01, engr), 0, y * s, 0.081 * s));
        g.add(at(box(0.05 * s, 0.22 * s, 0.01, engr), 0, 1.07 * s, 0.081 * s)); g.add(at(box(0.16 * s, 0.05 * s, 0.01, engr), 0, 1.11 * s, 0.081 * s));
      }
      g.rotation.set(0, face, tilt); g.position.set(x, 0, z); G.add(g);
      deco.push([g, x, z]);
      if (!mound || true) return g;   // no grave mounds: at night their dark domes read as holes and shadows (two review loops, 2026-10-04)
      const mx = x - Math.sign(x) * 0.8 * s, md = at(new THREE.Mesh(new THREE.SphereGeometry(1, 8, 4, 0, TAU, 0, PI / 2), moundM), mx, 0, z);
      md.scale.set(0.6 * s, 0.1, 0.36 * s); G.add(md); deco.push([md, mx, z]);
      return g;
    }
    // the three big ones by the path (a skeleton hides behind each), then the rows
    STONES.forEach(([x, z], i) => headstone(x, z, STONE_H / 1.25, 0, (i - 1) * 0.04, false));
    for (const sx of [-1, 1]) for (let zi = 0; zi < 7; zi++) for (let xi = 0; xi < 4; xi++) {
      const x = sx * (3.4 + xi * 1.6 + (hash(zi, xi, sx) - 0.5) * 0.5), z = 6.0 - zi * 2.1 + (hash(xi, zi, 7) - 0.5) * 0.6;
      if (Math.hypot(x - GRAVE[0], z - GRAVE[1]) < 1.6) continue;
      headstone(x, z, 0.8 + hash(xi, zi, sx + 3) * 0.45, hash(xi, zi, 11) < 0.3 ? 1 : 0, (hash(zi, xi, 13) - 0.5) * 0.3);
    }
    // the open grave: a dark hole, its dirt pile, a shovel stuck in it
    const grave = new THREE.Group(); G.add(grave);
    grave.add(flat(0.95, 1.9, M(0x0e0b0a), GRAVE[0], 0.006, GRAVE[1]));
    const pile = new THREE.Mesh(new THREE.SphereGeometry(1, 8, 5, 0, TAU, 0, PI / 2), M(0x4a3a28)); pile.scale.set(0.55, 0.42, 0.9); pile.position.set(GRAVE[0] + 0.95, 0, GRAVE[1]); grave.add(pile);
    const shovel = new THREE.Group(); shovel.add(at(box(0.04, 1.0, 0.04, M(0x6a4a2a)), 0, 0.5, 0)); shovel.add(at(box(0.22, 0.28, 0.03, M(0x8a8e94)), 0, -0.05, 0)); shovel.position.set(GRAVE[0] + 1.0, 0.35, GRAVE[1] + 0.2); shovel.rotation.set(0, 0.4, 0.25); grave.add(shovel);
    // the gate and the wall
    const ironM = M(0x16161a), pillarT = tex(16, 16, (x, r) => { px(x, '#6e6a64', 0, 0, 16, 16); for (let y = 3; y < 16; y += 4) px(x, '#55524c', 0, y, 16, 1); noise(x, r, 16, 16, ['#7e7a72', '#5e5a54'], 50); }, 2704);
    const pillarM = mat({ map: pillarT });
    for (const sx of [-1, 1]) {
      G.add(at(box(0.55, 2.1, 0.55, pillarM), sx * 1.55, 1.05, GATE[1])); G.add(at(box(0.68, 0.14, 0.68, pillarM), sx * 1.55, 2.17, GATE[1]));
      G.add(at(ico(0.17, 1, pillarM), sx * 1.55, 2.38, GATE[1]));
      G.add(at(box(10.5, 0.9, 0.42, mat({ map: pillarT, rep: [6, 1] })), sx * (1.85 + 5.25), 0.45, GATE[1]));
      const leaf = new THREE.Group(); leaf.position.set(sx * 1.25, 0, GATE[1]); leaf.rotation.y = sx * 1.25; G.add(leaf);   // the gate leaves swung open, in towards the graves
      for (let i = 0; i < 6; i++) leaf.add(at(box(0.035, 1.75, 0.035, ironM), -sx * (0.08 + i * 0.2), 0.95, 0));
      for (const y of [0.25, 1.6]) leaf.add(at(box(1.2, 0.05, 0.04, ironM), -sx * 0.58, y, 0));
      for (let i = 0; i < 6; i++) leaf.add(at(cone(0.04, 0.12, 4, ironM), -sx * (0.08 + i * 0.2), 1.87, 0));
    }
    const arch = new THREE.Mesh(new THREE.TorusGeometry(1.55, 0.04, 3, 18, PI), ironM); arch.position.set(0, 2.2, GATE[1]); G.add(arch);
    for (let i = 0; i < 5; i++) { const c = new THREE.Mesh(new THREE.TorusGeometry(0.16, 0.025, 3, 10), ironM); c.position.set(-0.9 + i * 0.45, 2.75 + Math.sin(i / 4 * PI) * 0.75, GATE[1]); G.add(c); }
    // the crypt: stone walls, a pediment, two columns, steps and a dark double door that can open
    const crypt = new THREE.Group(); crypt.position.set(0, 0, CRYPT_Z); G.add(crypt);
    const cryptT = tex(16, 16, (x, r) => { px(x, '#7a7670', 0, 0, 16, 16); for (let y = 0; y < 16; y += 4) px(x, '#5e5a54', 0, y, 16, 1); for (let y = 0; y < 16; y += 4) px(x, '#5e5a54', (y % 8) ? 4 : 10, y, 1, 4); noise(x, r, 16, 16, ['#86827a', '#6a665e', '#5a6a52'], 60); }, 2705);
    const cryptM = mat({ map: cryptT, rep: [3, 2] });
    crypt.add(at(box(4.6, 3.4, 3.2, cryptM), 0, 1.7, -0.4));
    const ped = new THREE.Mesh(new THREE.CylinderGeometry(1.0, 1.0, 4.9, 3), cryptM); ped.rotation.set(0, 0, PI / 2); ped.scale.set(1, 1, 0.6); ped.position.set(0, 3.9, 0.9); crypt.add(ped);
    for (const sx of [-1, 1]) crypt.add(at(cyl(0.2, 0.24, 3.3, 8, pillarM), sx * 1.55, 1.65, 1.5));
    for (let i = 0; i < 3; i++) crypt.add(at(box(3.4 - i * 0.3, 0.15, 0.5, pillarM), 0, 0.075 + i * 0.15, 2.25 - i * 0.4));
    const hole = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 2.2), M(0x050405)); hole.position.set(0, 1.35, 1.205); crypt.add(hole);
    const doorM = mat({ map: tex(16, 32, (x, r) => { px(x, '#3a2a1e', 0, 0, 16, 32); for (let i = 2; i < 16; i += 4) px(x, '#2a1e14', i, 0, 1, 32); px(x, '#c8a040', 11, 15, 2, 2); }, 2706) });
    const doors = [-1, 1].map(sx => { const piv = new THREE.Group(); piv.position.set(sx * 0.7, 1.35, 1.24); piv.add(at(box(0.7, 2.2, 0.08, doorM), -sx * 0.35, 0, 0)); crypt.add(piv); return [piv, sx]; });
    crypt.add(at(box(0.9, 0.22, 0.05, M(0x5a5650)), 0, 2.75, 1.22));
    // dead trees: twisted trunks and bare branches
    const barkM = M(0x2a2420);
    TREES.forEach(([x, z], i) => {
      const g = at(new THREE.Group(), x, 0, z); G.add(g);
      g.add(at(rot(cyl(0.16, 0.3, 3.4, 6, barkM), 0, 0, 0.1 * (i - 1)), 0, 1.7, 0));
      for (let b = 0; b < 6; b++) { const a = b / 6 * TAU + i, l = 1.2 + hash(i, b) * 1.1, br = cyl(0.04, 0.09, l, 4, barkM); br.position.set(Math.cos(a) * l * 0.35, 2.6 + hash(b, i) * 1.0, Math.sin(a) * l * 0.35); br.rotation.set(Math.sin(a) * 0.9, 0, -Math.cos(a) * 0.9); g.add(br); }
      deco.push([g, x, z]);
    });
    // the sky: the moon and its halo, stars, a church on the hill, clouds; bats
    const MOON = [14, 30, -120];
    const moon = at(new THREE.Mesh(new THREE.CircleGeometry(9, 20), mat({ color: 0xfff4c8, unlit: 1, nofog: 1 })), ...MOON); G.add(moon);
    const halo = at(new THREE.Mesh(new THREE.CircleGeometry(14, 20), mat({ color: 0x5a6aa0, unlit: 1, nofog: 1, see: 0.6 })), MOON[0], MOON[1], MOON[2] - 1); G.add(halo);
    G.add(stars(160, 150, 2707));
    const hillM = mat({ color: 0x141a26, nofog: 1 });
    const hill = new THREE.Mesh(new THREE.SphereGeometry(60, 12, 6, 0, TAU, 0, PI / 2), hillM); hill.scale.set(1.6, 0.18, 0.5); hill.position.set(-10, 0, -95); G.add(hill);
    const church = at(new THREE.Group(), -22, 8, -92); G.add(church);
    church.add(at(box(9, 6, 5, hillM), 0, 3, 0)); church.add(at(box(3, 13, 3, hillM), 5, 6.5, 0)); church.add(at(cone(2.3, 6, 4, hillM), 5, 16, 0));
    for (const wx of [-2, 1]) church.add(at(box(0.8, 1.4, 0.1, mat({ color: 0xffc860, unlit: 0.9, nofog: 1 })), wx, 3.4, 2.6));
    const cloudM = mat({ color: 0x3a4466, unlit: 1, nofog: 1, see: 0.35 }), clouds = [];
    for (let i = 0; i < 5; i++) { const c = new THREE.Mesh(new THREE.PlaneGeometry(26, 5), cloudM); c.position.set(-30 + i * 18, 20 + (i % 3) * 7, -110 + i); G.add(c); clouds.push([c, i]); }
    const batM = M(0x0c0c10), bats = [];
    for (let i = 0; i < 6; i++) {
      const b = new THREE.Group(); b.add(box(0.18, 0.12, 0.12, batM));
      const wings = [-1, 1].map(sd => { const w = new THREE.Group(); w.position.x = sd * 0.08; w.add(at(box(0.42, 0.02, 0.22, batM), sd * 0.21, 0, 0)); b.add(w); return [w, sd]; });
      G.add(b); bats.push([b, wings, i]);
    }
    // jack-o'-lanterns along the path: a round orange body, a stem, a glowing carved face towards the path
    const pumpkinM = mat({ color: 0xffa22e, unlit: 0.35 }), faceM = glow(0xffd84a), stemM = M(0x3a5a22), pumpkins = [];
    for (const [px0, pz] of PUMPKINS) {
      const sx = px0 < 0 ? -1 : 1, s = 0.8 + hash(pz, sx) * 0.35, g = at(new THREE.Group(), px0, 0, pz); G.add(g);
      const body = ico(0.26 * s, 1, pumpkinM); body.scale.set(1.15, 0.85, 1.15); body.position.y = 0.22 * s; g.add(body);
      g.add(at(box(0.05, 0.12, 0.05, stemM), 0, 0.46 * s, 0));
      const f = new THREE.Group(); f.position.set(-sx * 0.27 * s, 0.24 * s, 0); f.rotation.y = -sx * PI / 2; g.add(f);
      for (const ex of [-0.08, 0.08]) f.add(at(cone(0.05 * s, 0.07 * s, 3, faceM), ex * s, 0.05 * s, 0.01));
      f.add(at(box(0.18 * s, 0.045 * s, 0.02, faceM), 0, -0.06 * s, 0.01));
      pumpkins.push(body); deco.push([g, px0, pz]);
    }
    // low fog: see-through bands drifting at shin height (never up to a face)
    const fogM = mat({ color: 0x8a9ab8, unlit: 0.6, see: 0.72 }), fogs = [];
    for (let i = 0; i < 14; i++) { const f = flat(5 + hash(i, 1) * 4, 1.6 + hash(i, 2) * 1.2, fogM, 0, 0.12 + (i % 3) * 0.07, 0); G.add(f); fogs.push([f, i]); }
    // the bone heaps: femurs and ribs in a mound, skulls on top looking out at the lens (+z)
    const ivM = mat({ color: 0xf6f0de, unlit: 0.3 }), sockM = M(0x17121e), heaps = [];
    function makeHeap(seed) {
      const g = new THREE.Group(), boneParts = [], darkParts = [], ax = new THREE.Vector3();
      for (let i = 0; i < 78; i++) {   // femurs at random angles over a dome
        const a = hash(i, seed) * TAU, rr = Math.sqrt(hash(i, seed + 1)) * 0.95, y = (1 - rr * rr) * 0.75 * (0.6 + hash(i, seed + 2) * 0.4);
        const sh = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.38, 5)); sh.position.set(Math.cos(a) * rr, y, Math.sin(a) * rr); sh.rotation.set(hash(i, seed + 3) * TAU, hash(i, seed + 4) * TAU, hash(i, seed + 5) * TAU); boneParts.push(sh);
        ax.set(0, 1, 0).applyEuler(sh.rotation);
        for (const e of [-0.19, 0.19]) { const kn = new THREE.Mesh(new THREE.IcosahedronGeometry(0.045, 0)); kn.position.copy(sh.position).addScaledVector(ax, e); boneParts.push(kn); }
      }
      for (let i = 0; i < 5; i++) {    // rib arcs
        const r = new THREE.Mesh(new THREE.TorusGeometry(0.16, 0.022, 3, 10, PI * 1.4)); r.position.set((hash(i, seed + 9) - 0.5) * 1.2, 0.35 + hash(i, seed + 10) * 0.3, (hash(i, seed + 11) - 0.5) * 1.0); r.rotation.set(hash(i, seed + 12) * TAU, hash(i, seed + 13) * TAU, 0); boneParts.push(r);
      }
      [[-0.32, 0.72, 0.25], [0.3, 0.68, 0.32], [0.02, 0.86, 0.05], [-0.62, 0.42, 0.55], [0.6, 0.4, 0.52]].forEach(([x, y, z]) => {   // skulls looking out at the lens
        const sk = new THREE.Mesh(new THREE.IcosahedronGeometry(1, 1)); sk.scale.set(0.2, 0.19, 0.19); sk.position.set(x, y, z); boneParts.push(sk);
        const jaw = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.07, 0.12)); jaw.position.set(x, y - 0.15, z + 0.08); boneParts.push(jaw);
        for (const ex of [-0.075, 0.075]) { const so = new THREE.Mesh(new THREE.IcosahedronGeometry(1, 0)); so.scale.set(0.06, 0.068, 0.04); so.position.set(x + ex, y + 0.02, z + 0.165); darkParts.push(so); }
        const nz = new THREE.Mesh(new THREE.ConeGeometry(0.03, 0.05, 3)); nz.rotation.x = PI; nz.position.set(x, y - 0.06, z + 0.185); darkParts.push(nz);
      });
      [[-0.22, 0.83, -0.18], [0.27, 0.8, -0.05], [-0.05, 0.9, 0.32]].forEach(([x, y, z]) => {   // three skulls face up on the top: they read from above
        const sk = new THREE.Mesh(new THREE.IcosahedronGeometry(1, 1)); sk.scale.set(0.19, 0.17, 0.19); sk.position.set(x, y, z); boneParts.push(sk);
        for (const ex of [-0.07, 0.07]) { const so = new THREE.Mesh(new THREE.IcosahedronGeometry(1, 0)); so.scale.set(0.058, 0.035, 0.066); so.position.set(x + ex, y + 0.155, z + 0.04); darkParts.push(so); }
        const nz = new THREE.Mesh(new THREE.ConeGeometry(0.028, 0.045, 3)); nz.rotation.x = -PI / 2; nz.position.set(x, y + 0.16, z + 0.12); darkParts.push(nz);
        const tth = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.03, 0.05)); tth.position.set(x, y + 0.13, z + 0.2); boneParts.push(tth);
      });
      g.add(merged(boneParts, ivM)); g.add(merged(darkParts, sockM));
      const base = new THREE.Mesh(new THREE.SphereGeometry(1, 10, 5, 0, TAU, 0, PI / 2), M(0x9a927e)); base.scale.set(0.95, 0.42, 0.85); g.add(base);
      g.visible = false; G.add(g); return g;
    }
    heaps.push(makeHeap(2711), makeHeap(2723));
    // what one skeleton leaves when it falls apart: a single skull looking up at the lens, a few ribs, the pelvis, and
    // its one leg standing straight up out of the bits with its foot in the air
    function makeRemains() {
      const g = new THREE.Group(), bp = [], dp = [];
      const sk = new THREE.Mesh(new THREE.IcosahedronGeometry(1, 1)); sk.scale.set(0.27, 0.25, 0.26); sk.position.set(0.02, 0.24, 0.12); bp.push(sk);
      const jw = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.08, 0.13)); jw.position.set(0.02, 0.06, 0.26); bp.push(jw);
      for (const ex of [-0.1, 0.1]) { const so = new THREE.Mesh(new THREE.IcosahedronGeometry(1, 0)); so.scale.set(0.075, 0.085, 0.05); so.position.set(0.02 + ex, 0.27, 0.36); dp.push(so); }
      const nz = new THREE.Mesh(new THREE.ConeGeometry(0.035, 0.06, 3)); nz.rotation.x = PI; nz.position.set(0.02, 0.17, 0.385); dp.push(nz);
      const tth = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.05, 0.03)); tth.position.set(0.02, 0.1, 0.37); dp.push(tth);
      for (let i = 0; i < 4; i++) { const r = new THREE.Mesh(new THREE.TorusGeometry(0.13, 0.02, 3, 10, PI * 1.3)); r.position.set(-0.32 + i * 0.07, 0.05, -0.12 + i * 0.05); r.rotation.set(PI / 2 + 0.3, i * 0.7, 0.2); bp.push(r); }
      const pv = new THREE.Mesh(new THREE.IcosahedronGeometry(1, 0)); pv.scale.set(0.12, 0.06, 0.08); pv.position.set(0.3, 0.05, -0.08); bp.push(pv);
      const thigh = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.34, 5)); thigh.position.set(0.32, 0.22, -0.1); bp.push(thigh);   // the one leg, straight up
      const shin = new THREE.Mesh(new THREE.CylinderGeometry(0.026, 0.026, 0.3, 5)); shin.position.set(0.32, 0.55, -0.1); bp.push(shin);
      for (const y of [0.05, 0.39, 0.71]) for (const sx of [-0.03, 0.03]) { const kn = new THREE.Mesh(new THREE.IcosahedronGeometry(0.04, 0)); kn.position.set(0.32 + sx, y, -0.1); bp.push(kn); }
      const foot = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.05, 0.18)); foot.position.set(0.32, 0.74, -0.04); bp.push(foot);
      g.add(merged(bp, ivM)); g.add(merged(dp, sockM)); g.visible = false; G.add(g); return g;
    }
    const remains = makeRemains();
    const heartM = M(0xff4f9a, { unlit: 0.8 }), hearts = [];   // three pink hearts popping and rising from a point (the park's)
    for (let i = 0; i < 9; i++) { const h = new THREE.Group(); h.add(at(ico(0.1, 0, heartM), -0.075, 0, 0)); h.add(at(ico(0.1, 0, heartM), 0.075, 0, 0)); h.add(rot(at(cone(0.125, 0.18, 4, heartM), 0, -0.11, 0), PI, 0, 0)); h.visible = false; G.add(h); hearts.push(h); }
    const clodM = M(0x8a6440, { unlit: 0.3 }), holeM = M(0x0d0907), clods = [], holes = [];   // `dirt`: clods of earth and the hole they came out of
    for (let i = 0; i < 16; i++) { const c = ico(1, 0, clodM); c.visible = false; G.add(c); clods.push(c); }
    for (let i = 0; i < 2; i++) { const h = new THREE.Mesh(new THREE.CircleGeometry(1, 10), holeM); h.rotation.x = -PI / 2; h.visible = false; G.add(h); holes.push(h); }
    const dustM = mat({ color: 0xece6d8, unlit: 0.85, see: 0.35 }), dust = [];
    for (let i = 0; i < 16; i++) { const d = ico(1, 0, dustM); d.visible = false; G.add(d); dust.push(d); }

    return {
      group: G, sky: grad([[0, '#0c1024'], [0.55, '#1e2a52'], [1, '#3a3a66']]), shadowCol: 0x141a14,
      shadowY: 0.03,   // over the gravel path (a 4 mm flat with a polygon offset), the park's lesson
      light() { lights(0x6a7898, 0xc8d4ff, [0.3, -0.75, -0.6], 0x141c34, [14, 52], 6); },
      anim(t, P = {}) {
        const s = shotT(t, P), bb = beat(t);
        // warm light from the jack-o'-lanterns by the action, a cold one at the crypt
        pt(0, -1.7, 0.6, 5.5, 0.9, 0.55, 0.18); pt(1, 0, 0.8, -7.2, 0.8, 0.5, 0.16); pt(2, 0, 2.6, CRYPT_Z + 2.4, 0.5, 0.5, 0.75);
        if (P.key) pt(3, P.key[0], P.key[1], P.key[2], P.key[3], P.key[4], P.key[5]);
        deco.forEach(([o, x, z]) => { o.visible = !cleared(P, x, z); });
        grave.visible = !P.noGrave;
        // the crypt doors
        let d = 0; if (Array.isArray(P.doors)) { const [s0, s1, a, b] = P.doors; d = a + (b - a) * sm((s - s0) / Math.max(0.01, s1 - s0)); } else if (typeof P.doors === 'number') d = P.doors;
        doors.forEach(([piv, sx]) => { piv.rotation.y = sx * d * 1.6; });
        const mp = P.moon || MOON; moon.position.set(mp[0], mp[1], mp[2]); halo.position.set(mp[0], mp[1], mp[2]).multiplyScalar(1.008);
        moon.lookAt(0, 1, 0); halo.lookAt(0, 1, 0);
        const DI = P.dirt || [];
        holes.forEach((h, i) => {
          const q = DI[i]; h.visible = !!q && s >= q[2]; if (!h.visible) return;
          const k = (q[3] || 1) * 0.45 * Math.min(1, 0.4 + (s - q[2]) / 0.15); h.position.set(q[0], 0.012, q[1]); h.scale.set(k, k * 0.85, 1);
        });
        clods.forEach((c, i) => {   // thrown up and out, landing round the hole and lying there
          c.visible = false; if (!DI.length) return;
          const q = DI[i % DI.length], e = s - q[2]; if (e < 0) return;
          const a = hash(i, 4410) * TAU, out = (0.55 + hash(i, 4411) * 0.75) * (q[3] || 1), up = 1.5 + hash(i, 4412) * 1.1;
          const land = (up + Math.sqrt(up * up + 0.98)) / 9.8, te = Math.min(e, land);
          c.visible = true; c.position.set(q[0] + Math.cos(a) * out * te / land, Math.max(0.04, 0.05 + up * te - 4.9 * te * te), q[1] + Math.sin(a) * out * te / land);
          c.scale.setScalar((0.05 + hash(i, 4413) * 0.04) * (q[3] || 1)); c.rotation.set(te * 7 + i, te * 5, 0);
        });
        // bats across the sky, wings flapping
        bats.forEach(([b, wings, i]) => {
          b.visible = P.bats !== false;
          const u = (t * 0.05 + i * 0.17) % 1, y = 9 + (i % 3) * 2.2 + Math.sin(t * 1.3 + i) * 0.6;
          b.position.set(-16 + u * 34, y, -22 - (i % 4) * 4); b.rotation.set(0, PI / 2, 0);
          wings.forEach(([w, sd]) => { w.rotation.z = sd * 0.7 * Math.sin(t * 14 + i); });
        });
        clouds.forEach(([c, i]) => { c.visible = P.clouds !== false; c.position.x = -30 + i * 18 + ((t * 0.6) % 18); });   // `clouds` false: none (a dithered plane across the moon read as a glitch)
        // fog bands drifting
        const nfog = Math.round(14 * (P.fog ?? 1));
        fogs.forEach(([f, i]) => {
          const x = ((hash(i, 3) * 20 + t * (0.25 + hash(i, 4) * 0.2)) % 20) - 10, z = 7 - hash(i, 5) * 17;
          f.position.set(x, 0.12 + (i % 3) * 0.07, z); f.visible = i < nfog && !cleared(P, x, z);
        });
        pumpkins.forEach(b => { b.scale.y = 0.85 * (1 + 0.05 * Math.exp(-((bb % 1) + 1) % 1 * 6)); });   // they pulse on the beat
        hearts.forEach((h, i) => {   // `hearts` [[x, y, z, s0]]: three pink hearts pop and rise from each point
          const q = (P.hearts || [])[Math.floor(i / 3)]; h.visible = false; if (!q) return;
          const e = s - q[3] - (i % 3) * 0.18; if (e < 0 || e > 1.4) return;
          h.visible = true; h.position.set(q[0] + ((i % 3) - 1) * 0.22 + 0.06 * Math.sin(e * 6 + i), q[1] + 0.55 * e, q[2]); h.scale.setScalar(Math.min(1, e * 5) * (1.15 - 0.25 * (e / 1.4)));
        });
        // the bone heaps, and the dust they appear in
        const H = P.heap || [];
        heaps.forEach((g, i) => {
          const h = H[i]; g.visible = !!h && (h.s == null || s >= h.s); if (!g.visible) return;
          const u = h.s == null ? 1 : sm((s - h.s) / 0.12), r = h.r ?? 1;
          g.position.set(h.x, 0, h.z); g.scale.set(r, (h.h ?? 1) * (0.3 + 0.7 * u), r); g.rotation.y = h.yaw || 0;
        });
        const R = P.remains; remains.visible = !!R && (R.s == null || s >= R.s);   // `remains` { x, z, s, yaw, k }: one skeleton fallen apart
        if (remains.visible) { const u = R.s == null ? 1 : sm((s - R.s) / 0.1); remains.position.set(R.x, 0, R.z); remains.rotation.y = (R.yaw || 0) * PI / 180; remains.scale.setScalar((R.k || 1.25) * (0.4 + 0.6 * u)); }
        const dusts = [...(P.dust || []), ...H.filter(h => h.s != null).map(h => [h.x, h.z, h.s, h.r ?? 1]), ...(R && R.s != null ? [[R.x, R.z, R.s, 0.6]] : [])];
        dust.forEach((p, i) => {
          p.visible = false; if (!dusts.length) return;
          const q = dusts[i % dusts.length], e = s - q[2]; if (e < 0 || e > 0.9) return;
          const a = hash(i, 2730) * TAU, rr = (0.3 + e * 1.4) * (q[3] || 1) * (0.6 + hash(i, 2731) * 0.5);
          p.visible = true; p.position.set(q[0] + Math.cos(a) * rr, 0.08 + e * 0.25 + hash(i, 2732) * 0.12, q[1] + Math.sin(a) * rr * 0.7); p.scale.setScalar((0.14 + e * 0.26) * (1 - e / 0.9) * (q[3] || 1));
        });
      },
    };
  }
  return { cemetery: cemetery() };
}
