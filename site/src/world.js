// world.js: Saxo's place, a floating PS1 diorama seen from above like a doll's house.
// North-west: the living room (the TV, Kob's gaming chair, the wardrobe). North-east: the club (dance floor, Sadi).
// South-west: Compote's carrot garden. South-east: the pool. Everything is built from primitives and tiny canvas
// textures with the videos' PS1 material. x runs east, z south (towards the camera), y up; Saxo is 1.25 m tall.
import * as THREE from 'three';
import { mat, tex, px, noise, selfLit, U, tessellate } from './ps1.js';

const TAU = Math.PI * 2, PI = Math.PI;
const box = (w, h, d, m) => new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m);
const cyl = (rt, rb, h, seg, m) => new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), m);
const cone = (r, h, seg, m) => new THREE.Mesh(new THREE.ConeGeometry(r, h, seg), m);
const at = (o, x, y, z) => { o.position.set(x, y, z); return o; };
const rotY = (o, a) => { o.rotation.y = a; return o; };
const flat = (w, d, m, x = 0, y = 0, z = 0) => { const p = new THREE.Mesh(new THREE.PlaneGeometry(w, d), m); p.rotation.x = -PI / 2; p.position.set(x, y, z); return p; };
// decals: a clear gap from the surface under them is not enough once the PS1 vertex snap moves their corners by a
// few cm, so each stacking layer also gets its own depth offset (layer 1 = on the ground, 2 = on a layer-1 decal…)
const decal = (m, layer = 1) => { const ms = Array.isArray(m.material) ? m.material : [m.material]; for (const x of ms) { x.polygonOffset = true; x.polygonOffsetFactor = -2 * layer; x.polygonOffsetUnits = -4 * layer; } m.userData.noTess = true; return m; };
const hash = (a, b = 0) => { const x = Math.sin(a * 127.1 + b * 311.7) * 43758.5453; return x - Math.floor(x); };

// text on a canvas, drawn small and magnified with nearest filtering (pixel type, like the videos' karaoke)
export function label(text, { w = 128, h = 32, size = 22, fg = '#ff5fa2', stroke = '#ffffff', sw = 4, bg = null, glow = false, font = 'Fredoka' } = {}) {
  return tex(w, h, x => {
    if (bg) px(x, bg, 0, 0, w, h);
    x.font = `700 ${size}px ${font}`; x.textAlign = 'center'; x.textBaseline = 'middle'; x.lineJoin = 'round';
    if (stroke) { x.strokeStyle = stroke; x.lineWidth = sw; x.strokeText(text, w / 2, h / 2 + 1); }
    x.fillStyle = fg; x.fillText(text, w / 2, h / 2 + 1);
    if (glow) { const d = x.getImageData(0, 0, w, h); for (let i = 3; i < d.data.length; i += 4) if (d.data[i] > 100) d.data[i] = 204; x.putImageData(d, 0, 0); }
  });
}

export function buildWorld(scene) {
  const G = new THREE.Group(); scene.add(G);
  const colliders = { boxes: [], circles: [] };
  const block = (x0, z0, x1, z1) => colliders.boxes.push([Math.min(x0, x1), Math.min(z0, z1), Math.max(x0, x1), Math.max(z0, z1)]);
  const round = (x, z, r) => colliders.circles.push([x, z, r]);
  const anims = [];

  // ---------- textures ----------
  const T = {
    grass: tex(32, 32, (x, r) => { px(x, '#86cf78', 0, 0, 32, 32); noise(x, r, 32, 32, ['#79c26c', '#93da84', '#6fb865', '#9fe08e'], 360); }, 11),
    dirt: tex(32, 32, (x, r) => { px(x, '#9b6848', 0, 0, 32, 32); for (let y = 0; y < 32; y += 8) px(x, '#8a5a3d', 0, y + 5, 32, 3); noise(x, r, 32, 32, ['#7d5136', '#ad7a55', '#6e462f'], 200); }, 12),
    wood: tex(32, 32, (x, r) => { px(x, '#e0a86e', 0, 0, 32, 32); for (let y = 0; y < 32; y += 8) { px(x, '#b9804c', 0, y, 32, 1); px(x, '#b9804c', (y * 5) % 32, y, 1, 8); } noise(x, r, 32, 32, ['#d69c60', '#e8b47c'], 120); }, 13),
    wallPink: tex(16, 16, (x) => { px(x, '#ffd0de', 0, 0, 16, 16); for (let i = 0; i < 16; i += 4) px(x, '#ffe4ec', i, 0, 2, 16); }),
    wallMint: tex(16, 16, (x, r) => { px(x, '#bfe9da', 0, 0, 16, 16); for (let i = 2; i < 16; i += 8) for (let j = 2; j < 16; j += 8) px(x, '#d8f5ea', i, j, 2, 2); }, 14),
    path: tex(32, 32, (x, r) => { px(x, '#d6d0cc', 0, 0, 32, 32); px(x, '#b3aaa6', 0, 15, 32, 1); px(x, '#b3aaa6', 15, 0, 1, 15); px(x, '#b3aaa6', 7, 16, 1, 16); px(x, '#b3aaa6', 23, 16, 1, 16); noise(x, r, 32, 32, ['#ccc5c1', '#e0dbd8', '#d0c9c5'], 140); }, 15),
    poolTile: tex(16, 16, (x) => { px(x, '#9fe3f0', 0, 0, 16, 16); px(x, '#e9fbff', 0, 0, 16, 1); px(x, '#e9fbff', 0, 0, 1, 16); px(x, '#e9fbff', 8, 0, 1, 16); px(x, '#e9fbff', 0, 8, 16, 1); }),
    water: tex(32, 32, (x, r) => { px(x, '#3cb6e6', 0, 0, 32, 32); noise(x, r, 32, 32, ['#4cc4ef', '#2fa6d9', '#6fd6f5'], 240); for (let i = 0; i < 7; i++) px(x, '#e8fbff', Math.floor(r() * 28), Math.floor(r() * 32), 4, 1); }, 16),
    rim: tex(16, 16, (x, r) => { px(x, '#f7f3ec', 0, 0, 16, 16); px(x, '#ddd6ca', 0, 15, 16, 1); px(x, '#ddd6ca', 7, 0, 1, 16); noise(x, r, 16, 16, ['#efe9df'], 20); }, 17),
    clubWall: tex(32, 32, (x, r) => { px(x, '#2d1b45', 0, 0, 32, 32); noise(x, r, 32, 32, ['#3a2458', '#24163a', '#43296a'], 160); }, 18),
    rug: tex(32, 32, (x) => { px(x, '#ff7fb0', 0, 0, 32, 32); x.strokeStyle = '#ffd43b'; x.lineWidth = 2; x.strokeRect(3, 3, 26, 26); px(x, '#c94f8d', 8, 8, 16, 16); px(x, '#ffd43b', 14, 14, 4, 4); }),
    fabric: tex(16, 16, (x, r) => { px(x, '#f06aa3', 0, 0, 16, 16); noise(x, r, 16, 16, ['#e45b96', '#fa7db1'], 60); }, 19),
    fence: tex(8, 8, (x) => { px(x, '#fbfbf6', 0, 0, 8, 8); px(x, '#dcdcd2', 0, 7, 8, 1); }),
    bark: tex(8, 16, (x) => { px(x, '#8a5a2e', 0, 0, 8, 16); for (let y = 0; y < 16; y += 3) px(x, '#5e3b1c', 0, y, 8, 1); }),
    soil: tex(16, 16, (x, r) => { px(x, '#6e4630', 0, 0, 16, 16); for (let y = 1; y < 16; y += 4) px(x, '#5a3824', 0, y, 16, 1); noise(x, r, 16, 16, ['#7d5136', '#5f3b27'], 50); }, 20),
    stripe: tex(16, 4, (x) => { for (let i = 0; i < 16; i += 4) { px(x, '#ff5fa2', i, 0, 2, 4); px(x, '#fff6e8', i + 2, 0, 2, 4); } }),
    towel: tex(16, 16, (x) => { for (let i = 0; i < 16; i += 4) { px(x, '#ffd43b', 0, i, 16, 2); px(x, '#ff8fc1', 0, i + 2, 16, 2); } }),
    books: tex(32, 16, (x, r) => { px(x, '#6b4a3a', 0, 0, 32, 16); for (let i = 1; i < 31; i += 3) px(x, ['#ff5fa2', '#ffd43b', '#5fc7ff', '#8ee07a', '#b18cff', '#ffffff'][Math.floor(r() * 6)], i, 2 + Math.floor(r() * 3), 2, 12); }, 21),
    disco: tex(16, 16, (x, r) => { for (let i = 0; i < 16; i += 2) for (let j = 0; j < 16; j += 2) px(x, r() < 0.3 ? 'rgba(255,255,255,0.8)' : ['#9aa0b8', '#c8ccdc', '#6c7088'][Math.floor(r() * 3)], i, j, 2, 2); }, 22),
    speaker: tex(16, 32, (x) => { px(x, '#1b1b22', 0, 0, 16, 32); x.fillStyle = '#34343f'; x.beginPath(); x.arc(8, 10, 6, 0, TAU); x.fill(); x.beginPath(); x.arc(8, 24, 5, 0, TAU); x.fill(); px(x, '#0c0c10', 7, 9, 2, 2); px(x, '#0c0c10', 7, 23, 2, 2); }),
    window: tex(16, 16, (x) => { px(x, '#ffffff', 0, 0, 16, 16); px(x, 'rgba(255,214,168,0.8)', 1, 1, 6, 6); px(x, 'rgba(255,190,200,0.8)', 9, 1, 6, 6); px(x, 'rgba(255,200,180,0.8)', 1, 9, 6, 6); px(x, 'rgba(255,176,196,0.8)', 9, 9, 6, 6); }),
  };

  // ---------- the floating island ----------
  const IX = 15, IZ = 11, POOL = [5, 2.5, 12, 6.5];   // island half extents; pool rect x0,z0,x1,z1
  // one grid mesh with shared vertices (separate quads crack along their seams under vertex snapping), holed for the pool
  {
    const C = 0.5, nx = Math.round(2 * IX / C), nz = Math.round(2 * IZ / C), pos = [], uv = [], idx = [];
    for (let j = 0; j <= nz; j++) for (let i = 0; i <= nx; i++) { const x = -IX + i * C, z = -IZ + j * C; pos.push(x, 0, z); uv.push(x / 2, -z / 2); }
    for (let j = 0; j < nz; j++) for (let i = 0; i < nx; i++) {
      const cx = -IX + (i + 0.5) * C, cz = -IZ + (j + 0.5) * C;
      if (cx > POOL[0] && cx < POOL[2] && cz > POOL[1] && cz < POOL[3]) continue;
      const a = j * (nx + 1) + i, b = a + 1, c = a + nx + 1, d = c + 1; idx.push(a, c, b, b, c, d);
    }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); g.setIndex(idx); g.computeVertexNormals();
    const top = new THREE.Mesh(g, mat({ map: T.grass })); top.userData.noTess = true; G.add(top);
  }
  // dirt sides and a grass lip, then rocks hanging underneath
  const side = (w, x, z, ry) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, 2.4), mat({ map: T.dirt, rep: [w / 3, 1] })); m.position.set(x, -1.2, z); m.rotation.y = ry; G.add(m); };
  side(2 * IX, 0, IZ, 0); side(2 * IX, 0, -IZ, PI); side(2 * IZ, IX, 0, PI / 2); side(2 * IZ, -IX, 0, -PI / 2);
  const lip = mat({ map: T.grass, rep: [15, 0.1] });
  for (const [w, d, x, z] of [[2 * IX + 0.3, 0.3, 0, IZ], [2 * IX + 0.3, 0.3, 0, -IZ], [0.3, 2 * IZ, IX, 0], [0.3, 2 * IZ, -IX, 0]]) G.add(at(box(w, 0.22, d, lip), x, -0.125, z));
  const under = mat({ map: T.dirt, rep: [2, 2] });
  G.add(at(box(2 * IX - 0.2, 0.2, 2 * IZ - 0.2, under), 0, -2.4, 0));
  for (let i = 0; i < 14; i++) {
    const x = (hash(i, 1) - 0.5) * 2 * (IX - 3), z = (hash(i, 2) - 0.5) * 2 * (IZ - 3), r = 2 + hash(i, 3) * 3, h = 2 + hash(i, 4) * 4;
    const c = cone(r, h, 5, under); c.rotation.x = PI; c.position.set(x, -2.4 - h / 2, z); G.add(c);
  }

  // ---------- paths ----------
  const pathM = w => mat({ map: T.path, rep: [w / 1.6, 1] });
  const path = (x0, z0, x1, z1) => { const w = Math.abs(x1 - x0), d = Math.abs(z1 - z0), m = mat({ map: T.path, rep: [w / 1.6, d / 1.6] }); G.add(flat(w, d, m, (x0 + x1) / 2, 0.006, (z0 + z1) / 2)); };
  path(-1.6, -1.2, 0.2, IZ - 0.2);     // entrance path from the south edge
  path(-13, -1.4, 13.5, 0.2);           // the east-west lane between the rooms and the gardens
  path(3.6, 0.2, 4.6, 7.2);             // down to the pool deck

  // ---------- living room (north-west) ----------
  const HX0 = -14.5, HX1 = -3, HZ0 = -10.5, HZ1 = -2;
  const woodM = mat({ map: T.wood, rep: [(HX1 - HX0) / 2, (HZ1 - HZ0) / 2] });
  G.add(decal(flat(HX1 - HX0, HZ1 - HZ0, woodM, (HX0 + HX1) / 2, 0.01, (HZ0 + HZ1) / 2), 1));
  const skirt = mat({ color: 0xc98c52 });
  G.add(at(box(HX1 - HX0, 0.12, 0.12, skirt), (HX0 + HX1) / 2, 0.06, HZ1));   // floor edge trim, facing the camera
  G.add(at(box(0.12, 0.12, HZ1 - HZ0, skirt), HX1, 0.06, (HZ0 + HZ1) / 2));
  const WH = 3.4;
  const wallN = at(box(HX1 - HX0 + 0.3, WH, 0.3, mat({ map: T.wallPink, rep: [(HX1 - HX0) / 1.2, WH / 1.2] })), (HX0 + HX1) / 2, WH / 2, HZ0 - 0.15); G.add(wallN);
  const wallW = at(box(0.3, WH, HZ1 - HZ0, mat({ map: T.wallMint, rep: [(HZ1 - HZ0) / 1.2, WH / 1.2] })), HX0 - 0.15, WH / 2, (HZ0 + HZ1) / 2); G.add(wallW);
  const capM = mat({ color: 0xffffff });
  G.add(at(box(HX1 - HX0 + 0.5, 0.14, 0.44, capM), (HX0 + HX1) / 2, WH + 0.07, HZ0 - 0.15));
  G.add(at(box(0.44, 0.14, HZ1 - HZ0 + 0.3, capM), HX0 - 0.15, WH + 0.07, (HZ0 + HZ1) / 2));
  block(HX0 - 0.4, HZ0 - 0.4, HX1 + 0.2, HZ0 + 0.05); block(HX0 - 0.4, HZ0 - 0.4, HX0 + 0.05, HZ1);
  // window on the west wall
  const win = at(box(0.06, 1.2, 1.8, mat({ map: T.window })), HX0 + 0.02, 1.9, -4.2); G.add(win);
  G.add(at(box(0.08, 0.1, 2.0, capM), HX0 + 0.04, 1.28, -4.2));

  // the TV: a big CRT on a low cabinet against the north wall, screen facing south (to the camera)
  const TVX = -8.6, TVZ = HZ0 + 0.85;
  const cab = mat({ map: T.wood, rep: [1, 0.4], color: 0xd08a5a });
  G.add(at(box(2.6, 0.62, 1.0, cab), TVX, 0.31, TVZ));
  const plastic = mat({ color: 0x3b3a48 }), plasticL = mat({ color: 0x55546a });
  const tvBody = at(box(1.9, 1.45, 1.25, plastic), TVX, 0.62 + 0.73, TVZ - 0.02); G.add(tvBody);
  G.add(at(box(1.62, 0.18, 0.08, plasticL), TVX, 0.62 + 0.14, TVZ + 0.62));
  for (const s of [-1, 1]) { const ant = cyl(0.02, 0.02, 0.9, 4, plasticL); ant.position.set(TVX + s * 0.25, 2.05 + 0.35, TVZ - 0.1); ant.rotation.z = -s * 0.5; G.add(ant); }
  G.add(at(box(0.3, 0.12, 0.2, plasticL), TVX, 2.1, TVZ - 0.1));
  // screen: a canvas static until the video loop is ready (setTvVideo)
  const staticTex = tex(64, 48, (x, r) => { for (let i = 0; i < 64; i++) for (let j = 0; j < 48; j++) { const v = Math.floor(80 + r() * 150); px(x, `rgb(${v},${v},${v + 10})`, i, j); } }, 31);
  const screenM = mat({ map: staticTex, unlit: 1 });
  const screen = decal(at(new THREE.Mesh(new THREE.PlaneGeometry(1.56, 1.14), screenM), TVX, 0.62 + 0.8, TVZ + 0.645), 2); G.add(screen);
  const tvLogo = at(new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.12), mat({ map: label('SAXO TV', { w: 64, h: 16, size: 11, fg: '#ffd43b', stroke: null, glow: true }) })), TVX - 0.55, 0.62 + 0.14, TVZ + 0.705); decal(tvLogo, 2); G.add(tvLogo);
  // a grey console with a cable to Kob's chair
  G.add(at(box(0.5, 0.1, 0.38, mat({ color: 0xb9b8c2 })), TVX + 1.05, 0.67, TVZ + 0.1));
  G.add(at(box(0.12, 0.02, 0.1, mat({ color: 0x5b8cff, unlit: 1 })), TVX + 0.9, 0.73, TVZ + 0.29));
  block(TVX - 1.35, TVZ - 0.55, TVX + 1.35, TVZ + 0.55);

  // Kob's gaming chair (it swivels: main.js turns chair.pivot with her)
  const CHX = TVX, CHZ = -6.2;
  const rug = new THREE.Mesh(new THREE.CircleGeometry(2.0, 8), mat({ map: T.rug, rep: [1, 1] })); rug.rotation.x = -PI / 2; rug.position.set(CHX, 0.035, CHZ - 0.5); decal(rug, 3); G.add(rug);
  const chair = new THREE.Group(); chair.position.set(CHX, 0, CHZ); G.add(chair);
  const blackM = mat({ color: 0x24222c }), pinkM = mat({ color: 0xff5fa2 });
  chair.add(at(cyl(0.06, 0.06, 0.34, 6, plasticL), 0, 0.2, 0));
  for (let i = 0; i < 5; i++) { const leg = box(0.06, 0.05, 0.42, blackM); leg.position.set(Math.sin(i / 5 * TAU) * 0.2, 0.04, Math.cos(i / 5 * TAU) * 0.2); leg.rotation.y = i / 5 * TAU; chair.add(leg); }
  const pivot = new THREE.Group(); pivot.position.y = 0; chair.add(pivot);
  const SEAT = 0.36;
  pivot.add(at(box(0.66, 0.12, 0.62, blackM), 0, SEAT - 0.06, 0));
  pivot.add(at(box(0.5, 0.02, 0.5, pinkM), 0, SEAT + 0.005, 0));
  pivot.add(at(box(0.66, 0.9, 0.12, blackM), 0, SEAT + 0.45, 0.33));        // backrest behind her (she faces -z, the TV)
  pivot.add(at(box(0.42, 0.62, 0.02, pinkM), 0, SEAT + 0.5, 0.265));
  for (const s of [-1, 1]) pivot.add(at(box(0.08, 0.26, 0.5, blackM), s * 0.36, SEAT + 0.12, -0.02));
  round(CHX, CHZ, 0.55);

  // sofa on the west wall, facing east
  const sofa = new THREE.Group(); sofa.position.set(HX0 + 0.75, 0, -6.4); sofa.rotation.y = PI / 2; G.add(sofa);
  const fab = mat({ map: T.fabric, rep: [2, 1] });
  sofa.add(at(box(2.8, 0.42, 1.0, fab), 0, 0.21, 0)); sofa.add(at(box(2.8, 0.7, 0.28, fab), 0, 0.6, -0.4));
  for (const s of [-1, 1]) sofa.add(at(box(0.26, 0.62, 1.0, fab), s * 1.4, 0.31, 0));
  for (const s of [-0.7, 0.7]) sofa.add(at(box(1.2, 0.1, 0.8, mat({ color: 0xffb3d1 })), s, 0.46, 0.05));
  block(HX0, -8, HX0 + 1.3, -4.8);

  // wardrobe in the north-west corner: costume changes
  const WRX = -13.1, WRZ = HZ0 + 0.45;
  const wr = mat({ map: T.wood, rep: [1, 2], color: 0x9ff0d4 });
  G.add(at(box(1.5, 2.5, 0.8, wr), WRX, 1.25, WRZ));
  G.add(at(box(0.04, 2.2, 0.02, mat({ color: 0x5a7ea8 })), WRX, 1.25, WRZ + 0.41));
  for (const s of [-1, 1]) G.add(at(box(0.06, 0.24, 0.06, mat({ color: 0xffd43b })), WRX + s * 0.12, 1.3, WRZ + 0.43));
  const hanger = at(new THREE.Mesh(new THREE.PlaneGeometry(1.5, 0.5), mat({ map: label('DRESS UP', { w: 96, h: 32, size: 20, fg: '#ffffff', stroke: '#ff5fa2', sw: 5 }) })), WRX, 2.85, WRZ + 0.46); decal(hanger, 2); G.add(hanger);
  block(WRX - 0.8, WRZ - 0.45, WRX + 0.8, WRZ + 0.45);

  // bookshelf, floor lamp, plant
  G.add(at(box(1.6, 1.8, 0.45, mat({ map: T.books, rep: [1, 2] })), -5.2, 0.9, HZ0 + 0.25));
  block(-6.05, HZ0, -4.35, HZ0 + 0.5);
  G.add(at(cyl(0.04, 0.04, 1.7, 5, plasticL), HX0 + 0.6, 0.85, -2.9)); G.add(at(cyl(0.18, 0.2, 0.06, 6, plasticL), HX0 + 0.6, 0.03, -2.9));
  const shade = at(cyl(0.22, 0.34, 0.36, 6, mat({ color: 0xfff1c0, unlit: 1 })), HX0 + 0.6, 1.8, -2.9); G.add(shade);
  round(HX0 + 0.6, -2.9, 0.35);
  const pot = at(cyl(0.3, 0.22, 0.5, 6, mat({ color: 0xe86f4f })), -3.6, 0.25, HZ0 + 0.5); G.add(pot);
  for (let i = 0; i < 6; i++) { const lf = box(0.12, 0.9, 0.02, mat({ color: 0x3fae47, side: THREE.DoubleSide })); lf.position.set(-3.6, 0.9, HZ0 + 0.5); lf.rotation.set(0.4 * Math.cos(i), i, 0.4 * Math.sin(i)); G.add(lf); }
  round(-3.6, HZ0 + 0.5, 0.4);

  // posters (filled in by setPosters with the latest videos)
  const posterSpots = [[-11.4, 2.3], [-6.2, 2.3], [-4.3, 2.3]].map(([x, y]) => ({ x, y, z: HZ0 + 0.02 }));
  const posterGroup = new THREE.Group(); G.add(posterGroup);

  // ---------- club (north-east) ----------
  const CX0 = -1.5, CX1 = 14.5, CZ0 = -10.5;
  const clubN = at(box(CX1 - CX0, 4.2, 0.3, mat({ map: T.clubWall, rep: [(CX1 - CX0) / 2, 2] })), (CX0 + CX1) / 2, 2.1, CZ0 - 0.15); G.add(clubN);
  G.add(at(box(CX1 - CX0 + 0.2, 0.14, 0.44, mat({ color: 0xff5fa2 })), (CX0 + CX1) / 2, 4.27, CZ0 - 0.15));
  block(CX0, CZ0 - 0.4, CX1 + 0.4, CZ0 + 0.05);
  const neon = at(new THREE.Mesh(new THREE.PlaneGeometry(4.6, 1.15), mat({ map: label('SAXO CLUB', { w: 128, h: 32, size: 24, fg: '#ff5fa2', stroke: '#ffd43b', sw: 3, glow: true }) })), 7.2, 3.35, CZ0 + 0.06); decal(neon, 2); G.add(neon);
  const neon2 = at(new THREE.Mesh(new THREE.PlaneGeometry(2.4, 0.5), mat({ map: label('@saxo.dance', { w: 96, h: 20, size: 14, fg: '#5fe0ff', stroke: null, glow: true }) })), 1.6, 2.5, CZ0 + 0.06); decal(neon2, 2); G.add(neon2);
  // dance floor: 5 × 5 light tiles
  const FX = 7.2, FZ = -5.6, TILE = 1.2, tiles = [];
  for (let i = 0; i < 5; i++) for (let j = 0; j < 5; j++) {
    const m = mat({ color: 0xffffff, unlit: 1 }); m.polygonOffset = true; m.polygonOffsetFactor = -6; m.polygonOffsetUnits = -12;
    const t = flat(TILE - 0.08, TILE - 0.08, m, FX + (i - 2) * TILE, 0.03, FZ + (j - 2) * TILE); t.userData.noTess = true;
    G.add(t); tiles.push({ m, i, j });
  }
  const floorBase = flat(5 * TILE + 0.3, 5 * TILE + 0.3, mat({ color: 0x1b1328 }), FX, 0.015, FZ); floorBase.userData.noTess = true;
  floorBase.material.polygonOffset = true; floorBase.material.polygonOffsetFactor = -3; floorBase.material.polygonOffsetUnits = -6; G.add(floorBase);
  const floorRect = [FX - 2.5 * TILE, FZ - 2.5 * TILE, FX + 2.5 * TILE, FZ + 2.5 * TILE];
  // DJ booth, speakers, truss and the disco ball
  const booth = new THREE.Group(); booth.position.set(FX, 0, CZ0 + 1.3); G.add(booth);
  booth.add(at(box(3.2, 1.0, 0.9, mat({ color: 0x2a2436 })), 0, 0.5, 0));
  booth.add(at(box(3.3, 0.08, 1.0, mat({ color: 0xff5fa2 })), 0, 1.04, 0));
  const decks = [];
  for (const s of [-1, 1]) { const d = at(cyl(0.3, 0.3, 0.05, 10, mat({ map: T.disco })), s * 0.8, 1.1, 0.05); booth.add(d); decks.push(d); }
  booth.add(at(box(0.6, 0.3, 0.04, mat({ color: 0xd8dce8 })), 0, 1.25, -0.1));
  const heartT = tex(16, 16, x => {   // the pixel heart (same shape as assets/ui/pixel/icons/heart.png), no glyphs
    px(x, '#d8dce8', 0, 0, 16, 16);
    for (let j = 0; j < 16; j++) for (let i = 0; i < 16; i++) { const u = (i + 0.5 - 8) / 5.2, v = -(j + 0.5 - 8.4) / 5.2; if ((u * u + v * v - 1) ** 3 - u * u * v ** 3 <= 0) px(x, u > 0.25 && v < -0.2 ? '#c93a7c' : '#e63c46', i, j); }
    px(x, '#ffffff', 5, 5); px(x, '#ffffff', 5, 6);
  });
  booth.add(decal(at(new THREE.Mesh(new THREE.PlaneGeometry(0.26, 0.26), mat({ map: heartT, unlit: 1 })), 0, 1.25, -0.05), 2));
  block(FX - 1.7, CZ0 + 0.8, FX + 1.7, CZ0 + 1.8);
  for (const s of [-1, 1]) { G.add(at(box(0.9, 1.9, 0.8, mat({ map: T.speaker })), FX + s * 3.6, 0.95, CZ0 + 1.1)); block(FX + s * 3.6 - 0.5, CZ0 + 0.6, FX + s * 3.6 + 0.5, CZ0 + 1.6); }
  const trussM = mat({ color: 0x9aa0b8 }), TZ = FZ - 3.15;
  for (const sx of [-1, 1]) G.add(at(box(0.14, 4.6, 0.14, trussM), FX + sx * 3.1, 2.3, TZ));
  G.add(at(box(6.3, 0.14, 0.14, trussM), FX, 4.6, TZ));
  G.add(at(box(0.14, 0.14, 3.2, trussM), FX, 4.6, TZ + 1.6));
  round(FX - 3.1, TZ, 0.2); round(FX + 3.1, TZ, 0.2);
  G.add(at(box(0.02, 0.9, 0.02, trussM), FX, 4.15, FZ + 0.05));
  const ball = at(new THREE.Mesh(new THREE.IcosahedronGeometry(0.42, 1), mat({ map: T.disco, rep: [3, 3], unlit: 1 })), FX, 3.55, FZ + 0.05); G.add(ball);
  // light sparkles swept across the floor by the ball
  const specks = [];
  const speckM = mat({ color: 0xffffff, unlit: 1 });
  for (let i = 0; i < 22; i++) { const s = decal(flat(0.14, 0.14, speckM), 5); G.add(s); specks.push({ s, a: hash(i, 7) * TAU, r: 0.6 + hash(i, 8) * 3.2 }); }
  // colour spots on the truss
  const spots = [];
  for (const sx of [-1, 1]) { const sp = at(cyl(0.12, 0.2, 0.3, 6, mat({ color: 0xffffff, unlit: 1 })), FX + sx * 2.2, 4.4, TZ); sp.rotation.x = -0.6; G.add(sp); spots.push(sp); }

  // ---------- Compote's garden (south-west) ----------
  const bedX = -9.3, bedZ = 5.2;
  G.add(at(box(4.2, 0.18, 2.6, mat({ map: T.soil, rep: [2, 1] })), bedX, 0.09, bedZ));
  const carrotM = mat({ color: 0xff8a2a }), leafM = mat({ color: 0x46b84a, side: THREE.DoubleSide }), carrots = [];
  for (let i = 0; i < 6; i++) for (let j = 0; j < 3; j++) {
    const c = new THREE.Group(); c.position.set(bedX - 1.6 + i * 0.64, 0.18, bedZ - 0.8 + j * 0.8); G.add(c);
    c.add(at(cone(0.09, 0.12, 5, carrotM), 0, 0.03, 0));
    for (let k = 0; k < 3; k++) { const l = box(0.05, 0.34, 0.01, leafM); l.position.y = 0.2; l.rotation.set(0.3 * Math.cos(k * 2.1), k * 2.1, 0.3 * Math.sin(k * 2.1)); c.add(l); }
    carrots.push(c);
  }
  const fenceM = mat({ map: T.fence });
  const fenceLine = (x0, z0, x1, z1) => {
    const len = Math.hypot(x1 - x0, z1 - z0), n = Math.round(len / 0.4), ang = Math.atan2(x1 - x0, z1 - z0);
    for (let i = 0; i <= n; i++) { const p = box(0.1, 0.62, 0.06, fenceM); p.position.set(x0 + (x1 - x0) * i / n, 0.31, z0 + (z1 - z0) * i / n); p.rotation.y = ang; G.add(p); const tip = box(0.07, 0.07, 0.04, fenceM); tip.position.set(p.position.x, 0.66, p.position.z); tip.rotation.set(0, ang, PI / 4); G.add(tip); }
    for (const y of [0.2, 0.46]) { const r = box(0.03, 0.06, len, fenceM); r.position.set((x0 + x1) / 2, y, (z0 + z1) / 2); r.rotation.y = ang; G.add(r); }
  };
  fenceLine(bedX - 2.4, bedZ - 1.6, bedX + 2.4, bedZ - 1.6); fenceLine(bedX - 2.4, bedZ + 1.6, bedX + 2.4, bedZ + 1.6); fenceLine(bedX - 2.4, bedZ - 1.6, bedX - 2.4, bedZ + 1.6);
  fenceLine(bedX + 2.4, bedZ - 1.6, bedX + 2.4, bedZ - 0.5); fenceLine(bedX + 2.4, bedZ + 0.5, bedX + 2.4, bedZ + 1.6);
  block(bedX - 2.5, bedZ - 1.7, bedX + 2.5, bedZ + 1.7);
  const keepOut = new THREE.Group(); keepOut.position.set(bedX + 2.75, 0, bedZ - 1.05); G.add(keepOut);
  keepOut.add(at(box(0.08, 1.1, 0.08, mat({ map: T.bark })), 0, 0.55, 0));
  keepOut.add(at(new THREE.Mesh(new THREE.PlaneGeometry(1.1, 0.55), mat({ map: label('KEEP OUT', { w: 64, h: 32, size: 14, fg: '#d8262f', stroke: null, bg: '#f4e2c0' }), side: THREE.DoubleSide })), 0, 1.05, 0.08));
  keepOut.rotation.y = 0.72;
  // trees and bushes
  const leafDark = mat({ color: 0x4faa55 }), leafLight = mat({ color: 0x67c464 });
  const tree = (x, z, s = 1) => {
    G.add(at(cyl(0.16 * s, 0.22 * s, 1.6 * s, 6, mat({ map: T.bark })), x, 0.8 * s, z));
    for (const [dx, dy, dz, r] of [[0, 2.1, 0, 1.1], [0.5, 1.7, 0.3, 0.8], [-0.5, 1.8, -0.2, 0.8], [0.1, 2.7, 0.1, 0.7]]) G.add(at(new THREE.Mesh(new THREE.IcosahedronGeometry(r * s, 0), dy > 2 ? leafLight : leafDark), x + dx * s, dy * s, z + dz * s));
    round(x, z, 0.4 * s);
  };
  tree(-13, 8.8, 1.1); tree(-12.6, 0.9, 0.9); tree(13.3, 9.3, 1.0); tree(-1.5, -9.3, 0.8);
  const bush = (x, z, r = 0.6) => { G.add(at(new THREE.Mesh(new THREE.IcosahedronGeometry(r, 0), leafDark), x, r * 0.6, z)); round(x, z, r * 0.8); };
  bush(-5.2, 9.6); bush(-6.4, 9.9, 0.45); bush(-13.8, 4.2, 0.7); bush(2.2, -2.8, 0.5); bush(14, 1.5, 0.6);
  // flowers
  const flowers = [];
  for (let i = 0; i < 26; i++) {
    const x = -14 + hash(i, 40) * 12, z = 1.8 + hash(i, 41) * 8.6;
    if (x > bedX - 2.8 && x < bedX + 3 && z > bedZ - 2 && z < bedZ + 2) continue;
    if (x > -2.6 && x < 1) continue;
    const f = new THREE.Group(); f.position.set(x, 0, z); G.add(f);
    f.add(at(box(0.02, 0.3, 0.02, leafM), 0, 0.15, 0));
    f.add(at(box(0.14, 0.14, 0.14, mat({ color: [0xff5fa2, 0xffd43b, 0xffffff, 0xb18cff, 0xff8a5a][i % 5] })), 0, 0.32, 0));
    flowers.push(f);
  }
  // mailbox and the signpost at the entrance
  const mail = new THREE.Group(); mail.position.set(-3.3, 0, 9.6); G.add(mail);
  mail.add(at(box(0.08, 0.9, 0.08, mat({ map: T.bark })), 0, 0.45, 0));
  mail.add(at(box(0.36, 0.3, 0.55, mat({ color: 0x4a9df0 })), 0, 1.0, 0));
  const flag = at(box(0.03, 0.22, 0.08, mat({ color: 0xff3b4a })), 0.2, 1.12, 0.1); mail.add(flag);
  round(-3.3, 9.6, 0.35);
  const post = new THREE.Group(); post.position.set(1.5, 0, 9.3); post.rotation.y = 0.72; G.add(post);
  post.add(at(box(0.12, 1.7, 0.12, mat({ map: T.bark })), 0, 0.85, 0));
  const sign = new THREE.Group(); sign.position.set(0, 1.95, 0.02); sign.rotation.x = -0.2; post.add(sign);   // leans back a little so it reads from above
  sign.add(at(box(2.3, 0.8, 0.1, mat({ color: 0xc98c52 })), 0, 0, 0));
  sign.add(decal(at(new THREE.Mesh(new THREE.PlaneGeometry(2.14, 0.64), mat({ map: label('saxo.dance', { w: 128, h: 40, size: 24, fg: '#ff5fa2', stroke: '#ffffff', sw: 5, bg: '#ffe7a3' }) })), 0, 0, 0.09), 2));
  round(1.5, 9.3, 0.3);
  // the red car from the videos' street, parked by the garden
  const car = new THREE.Group(); car.position.set(-8.6, 0, 9.4); car.rotation.y = PI / 2; G.add(car);
  const red = mat({ color: 0xd8303c }), glass = mat({ color: 0x2b3650 }), tyre = mat({ color: 0x1b1b22 }), chrome = mat({ color: 0xe8e8f0 });
  car.add(at(box(1.7, 0.5, 3.6, red), 0, 0.45, 0)); car.add(at(box(1.5, 0.45, 1.9, glass), 0, 0.92, -0.2)); car.add(at(box(1.52, 0.06, 1.95, red), 0, 1.16, -0.2));
  for (const [x, z] of [[-0.8, 1.1], [0.8, 1.1], [-0.8, -1.2], [0.8, -1.2]]) { const w = cyl(0.3, 0.3, 0.2, 8, tyre); w.rotation.z = PI / 2; w.position.set(x, 0.3, z); car.add(w); }
  for (const x of [-0.55, 0.55]) car.add(at(box(0.3, 0.14, 0.05, mat({ color: 0xfff1c0, unlit: 1 })), x, 0.55, 1.81));
  car.add(at(box(1.72, 0.08, 0.08, chrome), 0, 0.3, 1.8));
  block(-10.5, 8.5, -6.7, 10.3);
  // skateboard and a cone (the skate scene's ollie)
  const deckM = mat({ color: 0xff5fa2 }), skate = new THREE.Group(); skate.position.set(1.9, 0, 3.2); skate.rotation.y = 0.4; G.add(skate);
  skate.add(at(box(0.24, 0.03, 0.8, deckM), 0, 0.09, 0));
  for (const z of [-0.26, 0.26]) for (const x of [-0.09, 0.09]) skate.add(at(cyl(0.035, 0.035, 0.03, 6, mat({ color: 0xffd43b })), x, 0.04, z).rotateZ(PI / 2));
  G.add(at(cone(0.16, 0.42, 6, mat({ color: 0xff7a1a })), 2.6, 0.21, 2.5)); round(2.6, 2.5, 0.2);
  // street lamp
  const lampM = mat({ color: 0x6a6f8e });
  G.add(at(cyl(0.08, 0.11, 3.6, 5, lampM), 3.1, 1.8, 1.2)); G.add(at(box(0.7, 0.06, 0.06, lampM), 2.8, 3.55, 1.2));
  G.add(at(box(0.36, 0.14, 0.24, mat({ color: 0xfff1c0, unlit: 1 })), 2.5, 3.48, 1.2)); round(3.1, 1.2, 0.2);

  // ---------- pool (south-east) ----------
  const [PX0, PZ0, PX1, PZ1] = POOL, PD = 1.1, PW = PX1 - PX0, PL = PZ1 - PZ0;
  const tileM = (w, h) => mat({ map: T.poolTile, rep: [w / 0.8, h / 0.8] });
  const inner = (w, x, z, ry) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, PD), tileM(w, PD)); m.position.set(x, -PD / 2, z); m.rotation.y = ry; G.add(m); };
  inner(PW, (PX0 + PX1) / 2, PZ0, 0); inner(PW, (PX0 + PX1) / 2, PZ1, PI); inner(PL, PX0, (PZ0 + PZ1) / 2, PI / 2); inner(PL, PX1, (PZ0 + PZ1) / 2, -PI / 2);
  G.add(flat(PW, PL, tileM(PW, PL), (PX0 + PX1) / 2, -PD, (PZ0 + PZ1) / 2));
  const waterM = mat({ map: T.water, rep: [PW / 2, PL / 2], alpha: 0.72 });
  G.add(flat(PW, PL, waterM, (PX0 + PX1) / 2, -0.22, (PZ0 + PZ1) / 2));
  const rimM = mat({ map: T.rim, rep: [8, 1] });
  for (const [w, d, x, z] of [[PW + 0.8, 0.4, (PX0 + PX1) / 2, PZ0 - 0.2], [PW + 0.8, 0.4, (PX0 + PX1) / 2, PZ1 + 0.2], [0.4, PL, PX0 - 0.2, (PZ0 + PZ1) / 2], [0.4, PL, PX1 + 0.2, (PZ0 + PZ1) / 2]]) G.add(at(box(w, 0.1, d, rimM), x, 0.05, z));
  block(PX0 - 0.1, PZ0 - 0.1, PX1 + 0.1, PZ1 + 0.1);
  // ladder, donut float, beach ball
  for (const s of [-1, 1]) G.add(at(box(0.05, 0.9, 0.05, mat({ color: 0xdfe6ee })), PX1 - 0.9 + s * 0.22, 0.2, PZ0 + 0.05));
  const donut = at(new THREE.Mesh(new THREE.TorusGeometry(0.42, 0.17, 6, 10), mat({ color: 0xff6fb5 })), 7.2, -0.18, 4.2); donut.rotation.x = -PI / 2; G.add(donut);
  const beach = at(new THREE.Mesh(new THREE.IcosahedronGeometry(0.26, 1), mat({ map: T.stripe, rep: [2, 1] })), 10.4, -0.05, 5.4); G.add(beach);
  // deck: two loungers, an umbrella, the towel (Saxo's chill spot), a palm
  const deck = mat({ map: T.wood, rep: [2, 1], color: 0xf0c490 });
  G.add(decal(flat(7.2, 2.6, deck, 8.5, 0.012, 8.4), 1));
  const lounger = (x, z) => {
    const g = new THREE.Group(); g.position.set(x, 0, z); G.add(g);
    const w = mat({ color: 0xffffff }), c = mat({ map: T.stripe, rep: [1, 2] });
    g.add(at(box(0.7, 0.08, 1.4, c), 0, 0.35, 0.2)); const back = at(box(0.7, 0.08, 0.8, c), 0, 0.6, -0.72); back.rotation.x = 0.9; g.add(back);
    for (const [dx, dz] of [[-0.3, 0.8], [0.3, 0.8], [-0.3, -0.4], [0.3, -0.4]]) g.add(at(box(0.05, 0.35, 0.05, w), dx, 0.17, dz));
    block(x - 0.4, z - 1.1, x + 0.4, z + 0.95);
  };
  lounger(11.0, 8.5); lounger(12.3, 8.5);
  G.add(at(cyl(0.03, 0.03, 2.4, 4, mat({ color: 0xffffff })), 11.65, 1.2, 7.6));
  const umb = at(new THREE.Mesh(new THREE.ConeGeometry(1.4, 0.55, 8, 1, true), mat({ map: T.stripe, rep: [3, 1], side: THREE.DoubleSide })), 11.65, 2.35, 7.6); G.add(umb);
  round(11.65, 7.6, 0.15);
  const towel = decal(flat(0.9, 1.8, mat({ map: T.towel, rep: [1, 2] }), 6.4, 0.035, 8.4), 3); G.add(towel);
  // palm (beach map style)
  const palm = new THREE.Group(); palm.position.set(13.4, 0, 3.4); G.add(palm);
  let top = new THREE.Group(); palm.add(top);
  for (let i = 0; i < 7; i++) { const seg = cyl(0.14 - i * 0.008, 0.18 - i * 0.008, 0.6, 5, mat({ map: T.bark })); seg.position.y = 0.3; top.add(seg); const nx = new THREE.Group(); nx.position.y = 0.6; nx.rotation.z = 0.06; top.add(nx); top = nx; }
  const crown = new THREE.Group(); top.add(crown);
  for (let i = 0; i < 7; i++) { const lf = new THREE.Group(); lf.rotation.y = i / 7 * TAU; crown.add(lf); const bl = box(1.6, 0.02, 0.4, i % 2 ? leafDark : leafLight); bl.material.side = THREE.DoubleSide; bl.position.x = 0.75; bl.rotation.z = -0.45; lf.add(bl); }
  round(13.4, 3.4, 0.3);

  // ---------- clouds drifting around the island, and the sky ----------
  const cloudM = mat({ color: 0xffffff, unlit: 1 }), cloudP = mat({ color: 0xffd9ec, unlit: 1 }), clouds = [];
  for (let i = 0; i < 16; i++) {
    const g = new THREE.Group(), s = 1 + hash(i, 50) * 1.6;
    for (let k = 0; k < 4; k++) g.add(at(new THREE.Mesh(new THREE.IcosahedronGeometry((k === 1 ? 1.5 : 1.05) * s, 0), k % 2 ? cloudM : cloudP), (k - 1.5) * 1.5 * s, k === 1 ? 0.5 * s : 0, (k % 2 - 0.5) * 0.6 * s));
    const a = hash(i, 51) * TAU, r = 25 + hash(i, 52) * 16;
    g.userData = { a, r, y: -7 - hash(i, 53) * 10, sp: 0.004 + hash(i, 54) * 0.006 };
    G.add(g); clouds.push(g);
  }
  const sky = tex(4, 64, x => { const g = x.createLinearGradient(0, 0, 0, 64); g.addColorStop(0, '#ff7eb9'); g.addColorStop(0.55, '#ffb3c9'); g.addColorStop(1, '#ffe2c4'); x.fillStyle = g; x.fillRect(0, 0, 4, 64); });
  scene.background = sky;

  tessellate(G);

  // ---------- lights ----------
  function light() {
    U.uAmb.value.set(0xa894c6); U.uDirCol.value.set(0xfff0d8); U.uDirDir.value.set(-0.45, -1, -0.55).normalize();
    U.uFogCol.value.set(0xffc4d6); U.uFog.value.set(38, 95); U.uPtRange.value = 6.5;
  }
  light();

  // ---------- animation, driven by time and the music's beat ----------
  const PAL = [[1, 0.37, 0.64], [1, 0.83, 0.23], [0.37, 0.88, 1], [0.7, 0.55, 1], [0.55, 0.95, 0.5]];
  const tvLight = new THREE.Color();
  function update(t, beat, dancing) {
    const b = Math.max(0, Math.floor(beat)), f = Math.max(0, beat - b), hit = Math.exp(-f * 5), bar = Math.floor(b / 4);
    waterM.uniforms.uOff.value.set(t * 0.05, t * 0.02);
    donut.position.y = -0.18 + Math.sin(t * 1.6) * 0.04; donut.rotation.z = t * 0.2;
    beach.position.y = -0.05 + Math.sin(t * 1.3 + 1) * 0.05; beach.rotation.y = t * 0.3;
    ball.rotation.y = t * 0.8;
    for (const d of decks) d.rotation.y = t * 3;
    for (const { m, i, j } of tiles) {
      const k = (i + j + b + (bar % 2 ? i : 0)) % PAL.length, on = ((i * 3 + j * 7 + b) % 3) !== 0 || bar % 4 === 3;
      const c = PAL[k], e = on ? 0.55 + 0.45 * hit * (dancing ? 1 : 0.6) : 0.18;
      m.uniforms.uCol.value.setRGB(c[0] * e, c[1] * e, c[2] * e);
    }
    specks.forEach((s, i) => { const a = s.a + t * 0.5; s.s.position.set(FX + Math.cos(a) * s.r, 0.045, FZ + Math.sin(a) * s.r); s.s.visible = ((i + b) % 4) !== 0; });
    spots.forEach((sp, i) => { const c = PAL[(b + i * 2) % PAL.length]; sp.material.uniforms.uCol.value.setRGB(...c); });
    clouds.forEach(g => { const u = g.userData, a = u.a + t * u.sp; g.position.set(Math.cos(a) * u.r, u.y + Math.sin(t * 0.3 + u.a) * 0.3, Math.sin(a) * u.r * 0.8); g.rotation.y = -a; });
    flowers.forEach((fl, i) => { fl.rotation.z = Math.sin(t * 2 + i) * 0.08; });
    crown.rotation.z = Math.sin(t * 1.1) * 0.05;
    carrots.forEach((c, i) => { c.rotation.y = Math.sin(t * 1.5 + i) * 0.15; });
    flag.rotation.x = Math.sin(t * 2) * 0.1;
    // point lights: the lamp, two club colours on the beat, the TV's flicker
    U.uPtPos.value[0].set(HX0 + 0.6, 1.6, -2.9); U.uPtCol.value[0].setRGB(1.2, 0.95, 0.6);
    const c1 = PAL[b % PAL.length], c2 = PAL[(b + 2) % PAL.length], k = 0.8 + 1.2 * hit * (dancing ? 1.4 : 0.8);
    U.uPtPos.value[1].set(FX - 2, 2.2, FZ); U.uPtCol.value[1].setRGB(c1[0] * k, c1[1] * k, c1[2] * k);
    U.uPtPos.value[2].set(FX + 2, 2.2, FZ); U.uPtCol.value[2].setRGB(c2[0] * k, c2[1] * k, c2[2] * k);
    const fl = 0.75 + 0.25 * Math.sin(t * 13) * Math.sin(t * 7.3);
    tvLight.setRGB(0.5 * fl, 0.65 * fl, 1.1 * fl);
    U.uPtPos.value[3].set(TVX, 1.4, TVZ + 1.6); U.uPtCol.value[3].copy(tvLight);
  }

  // the TV screen plays a muted loop of the latest video; posters show the last few
  function setTvVideo(video) {
    const vt = new THREE.VideoTexture(video); vt.colorSpace = THREE.NoColorSpace; vt.magFilter = vt.minFilter = THREE.NearestFilter; vt.generateMipmaps = false;
    screenM.uniforms.map.value = vt; screenM.uniforms.uUseMap.value = 1;
  }
  function setPosters(textures) {
    posterGroup.clear();
    textures.slice(0, posterSpots.length).forEach((t, i) => {
      const s = posterSpots[i];
      posterGroup.add(at(box(0.98, 1.66, 0.06, mat({ color: 0xffffff })), s.x, s.y, s.z + 0.04));
      t.colorSpace = THREE.NoColorSpace; t.magFilter = t.minFilter = THREE.NearestFilter; t.generateMipmaps = false;
      const p = decal(at(new THREE.Mesh(new THREE.PlaneGeometry(0.84, 1.5), mat({ map: t, unlit: 0.6 })), s.x, s.y, s.z + 0.105), 2); posterGroup.add(p);
    });
  }

  // blob shadows are tinted to a darker ground colour (a black shadow reads as a stain)
  const shadowCol = (x, z) => x > HX0 && x < HX1 && z > HZ0 && z < HZ1 ? 0x9c6a42 : x > floorRect[0] && x < floorRect[2] && z > floorRect[1] && z < floorRect[3] ? 0x0e0816 : (Math.abs(z + 0.6) < 0.8 && x > -13 && x < 13.5) || (x > -1.6 && x < 0.2 && z > -1.2) ? 0x938a88 : 0x5a9a50;

  // where things are, for the game logic
  const places = {
    tv: { x: TVX, z: TVZ + 0.6, stand: [TVX + 1.9, -7.4] },
    chair: { x: CHX, z: CHZ, pivot, seat: SEAT },
    wardrobe: { x: WRX, z: WRZ + 0.4, stand: [WRX, WRZ + 1.35] },
    sofa: { x: HX0 + 0.75, z: -6.4 },
    towel: { x: 6.4, z: 8.4, stand: [6.4, 7.0] },
    floor: { rect: floorRect, x: FX, z: FZ },
    sadi: [FX - 0.9, FZ + 0.3], kob: [CHX, CHZ], compote: [bedX + 3.35, bedZ + 0.25],
    sign: { x: 1.5, z: 9.3, stand: [1.2, 8.2] },
    mail: { x: -3.3, z: 9.6, stand: [-3.1, 8.5] },
    carrots: { x: bedX, z: bedZ },
    posters: posterSpots,
    spawn: [-0.8, 1.6],
    bounds: [-IX + 0.5, -IZ + 0.6, IX - 0.5, IZ - 0.4],
  };
  return { group: G, colliders, places, update, setTvVideo, setPosters, light, screen, shadowCol };
}
