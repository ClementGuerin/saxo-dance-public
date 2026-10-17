// maps54.js: the "Shape of You" map (2026-10-17 2nd, Ed Sheeran, 2017; the clip: a boxer in a blue hoodie training in
// a brick gym, a diner date in a varsity jacket, runs past freight trains, an underground sumo bout). One map: the
// school gym decorated for prom and, west of it on one straight line (z = 0), the town the velcro dog crosses to get to
// Sadi, every wall on that line able to burst open in his own silhouette. Same contract as the other map files, pure in t:
//   prom   the school gym at night (y = 0; x PROM.X0..X1, z Z0..Z1, H high): a maple court with low-contrast lines,
//          painted cinderblock walls, folded bleachers on the north wall (BLEACH), the stage at the east end (STAGE, top
//          STAGE.y) with a balloon arch, the PROM backdrop (a hole can burst through it: `banner`) and a box-pet DJ
//          behind his decks (DJ), the punch table (PUNCH, top PUNCH_Y), the photo booth's star backdrop (PHOTO, a hole:
//          `photo`), the double doors in the west wall (DOORS, a NO DOGS sign on them; `doors` 0-1 or a ramp swings
//          them out), the girls' restroom door in the south wall (WC, a hole: `wc`) with the restroom behind it, a
//          disco ball (DISCO) and its light spots, string lights, streamers; box-pet prom guests in suits and gowns
//          (`guests` a mode for all or `gmode` [n] per guest: dance, stare (`stare` [x, z]), cheer, gasp, slow (a
//          couple's sway), false; `gspots` [[x, z, yaw] | null], else round the floor (GUEST_SPOTS)); `stop` (s: the
//          ball, the lights and the guests freeze); `hearts` [[x, y, z, s0]] + `heartYaw`; `rain` [s0, x, z] (hearts
//          falling from above round a point: the falling heart).
//   the line (west of the gym, the dog running to +x, every hole at z = 0): his house (HOUSE: the living room, his
//          bed, Sadi's photo, the front door in the east wall: the hole `door`), the front yard's tall picket fence
//          (FENCE: `fence`), a yellow taxi van parked across the street (CAB: in one sliding door and out of the other,
//          `cab1` `cab2`, its holes 0.38 m up: he jumped), the clip's brick boxing gym (GYM: punching bags, box-pet
//          boxers in blue hoodies; `gym1` `gym2`), the diner (DINER: a couple on a date in a booth across his line,
//          sharing a milkshake; `din1` `din2`), the prom's west wall (`prom`, and `side` and `comp` beside the doors).
//   The holes: `holes` { id: s } (s into the shot it bursts: debris flies out on the dog's side and lies on the floor;
//          a negative s = long ago, the debris lying; absent = the wall intact), `crack` { id: [s0, s1] } (the
//          outline cracks open round his shape before a burst, the wall shaking), `planks` [id] (boards nailed across a
//          hole on the dog's side), `zone` 'prom' | 'street' | 'home' | 'gym' | 'diner' (the lights), `boxers` and
//          `couple` (the town's box pets' mode: punch, stare, gasp...), `shake` false (the milkshake gone), `noguests`,
//          `clear` [[x, z, r]], `key` [x, y, z, r, g, b], `hide` ['ball', 'spots', 'arch', 'dj', 'punch', 'bleach', 'booth', 'neon'].
import { mapKit } from './mapkit.js';

// Saxo's front silhouette in his varsity look, jumping jacks at 0.2 s (arms out from under the head, legs apart):
// rasterised from his skinned mesh at 1 cm and traced (~/personal/saxo-video/songs/shape-of-you/trace.py). Metres,
// x across, y up from his feet; 1.14 m wide, 1.24 m tall.
export const SIL = [[-0.025,1.24],[0.025,1.21],[0.095,1.23],[0.105,1.21],[0.145,1.21],[0.155,1.18],[0.275,1.21],[0.285,1.18],[0.415,1.16],[0.465,1.08],[0.475,0.96],[0.465,0.95],[0.435,0.98],[0.385,0.97],[0.375,0.84],[0.395,0.82],[0.355,0.8],[0.355,0.73],[0.525,0.72],[0.585,0.68],[0.585,0.64],[0.565,0.62],[0.495,0.63],[0.265,0.52],[0.245,0.32],[0.225,0.3],[0.225,0.26],[0.185,0.23],[0.185,0.19],[0.225,0.16],[0.225,0.11],[0.265,0.05],[0.265,0.01],[0.245,0.0],[0.165,0.0],[0.105,0.06],[0.105,0.14],[0.065,0.15],[0.045,0.19],[-0.025,0.19],[-0.045,0.15],[-0.085,0.14],[-0.095,0.05],[-0.135,0.01],[-0.235,0.01],[-0.245,0.05],[-0.205,0.1],[-0.195,0.17],[-0.165,0.2],[-0.165,0.24],[-0.205,0.26],[-0.225,0.33],[-0.235,0.51],[-0.555,0.66],[-0.555,0.69],[-0.495,0.74],[-0.435,0.71],[-0.345,0.72],[-0.345,0.83],[-0.365,0.85],[-0.345,0.87],[-0.345,1.0],[-0.405,1.01],[-0.435,0.99],[-0.445,1.01],[-0.385,1.17],[-0.295,1.21],[-0.235,1.2],[-0.225,1.23],[-0.095,1.19],[-0.085,1.22],[-0.035,1.22]];

export const PROM = {
  X0: -10, X1: 10, Z0: -8, Z1: 8, H: 6.4,
  STAGE: { x0: 6.4, x1: 10, z0: -5.2, z1: 5.2, y: 0.9 },
  BANNER: [8.9, 0],                   // the PROM backdrop's hole cell on the stage, facing -x (its feet on the stage)
  DJ: [9.2, -1.75],                    // the DJ behind his decks, stage right
  DOORS: { z0: 5, z1: 7, h: 2 },      // the double doors in the west wall (x = X0)
  BLEACH: { x0: -8.6, x1: 3.6, z: -8, d: 1.5, h: 2.1 },
  PUNCH: [-5.4, -5.7], PUNCH_Y: 0.78,
  PHOTO: [-4.4, 7.35],                // the photo booth's backdrop, facing -z, against the south wall
  WC: [3.0, 8],                       // the girls' restroom door in the south wall, the restroom behind it (z > Z1)
  DISCO: [0, 3.35, 0],
  BOUNCER: [-8.7, 5.2],               // Compote by the doors
};
export const TOWN = {
  DINER: { x0: -22, x1: -16, z: 4, h: 3.4 }, TABLE: [-19, 0], TABLE_Y: 0.62,
  GYM: { x0: -34, x1: -26, z: 5, h: 4.6 },
  CAB: { x: -39.5, w: 1.8, len: 4.6, y0: 0.35, h: 1.85 },
  FENCE: -44, FENCE_H: 1.35,
  HOUSE: { x0: -56, x1: -48, z: 5, h: 3.0 }, BED: [-51.2, 1.5],
};
// every hole: its wall (built below with its centre and through axis: the dog travels along the wall's local +z), its
// u (across the wall, metres from its centre; on the line's walls u = -z) and its feet's height in the wall's frame (hy)
export const HOLES = {
  door:  { wall: 'house', u: 0, hy: 0, kind: 'door' },
  fence: { wall: 'fence', u: 0, hy: 0 },
  cab1:  { wall: 'cab1', u: 0, hy: 0.03 }, cab2: { wall: 'cab2', u: 0, hy: 0.03 },
  gym1:  { wall: 'gym1', u: 0, hy: 0 }, gym2: { wall: 'gym2', u: 0, hy: 0 },
  din1:  { wall: 'din1', u: 0, hy: 0 }, din2: { wall: 'din2', u: 0, hy: 0 },
  prom:  { wall: 'west', u: 0, hy: 0 }, side: { wall: 'west', u: -2.6, hy: 0 }, comp: { wall: 'west', u: 2.3, hy: 0 },
  banner: { wall: 'banner', u: 0, hy: 0 }, photo: { wall: 'photo', u: 0, hy: 0 }, wc: { wall: 'wc', u: 0, hy: 0 },
};
// the guests' spots round the dance floor (x, z), facing its middle; the line's side (the west) and the front left open
export const GUEST_SPOTS = [[2.2, -2.6], [3.4, -1.2], [3.6, 0.6], [2.8, 2.2], [1.2, 3.3], [-0.6, 3.5], [-2.4, 3.1], [-1.6, -3.4], [0.2, -3.7], [4.6, -2.9], [4.9, 2.8], [-3.4, -2.6], [1.0, -5.2], [3.2, 5.0]];

export function buildShapeMaps(K) {
  const k = mapKit(K);
  const { THREE, mat, tex, px, noise, box, TAU, PI, beat, hash, fr, cyl, cone, ico, at, rot, flat, lights, pt, sign } = k;
  const M = (c, o = {}) => mat({ color: c, ...o }), glow = (c, u = 1) => mat({ color: c, unlit: u });
  const cl = x => Math.max(0, Math.min(1, x)), sm = x => { x = cl(x); return x * x * (3 - 2 * x); };
  const ramp = (v, s) => Array.isArray(v) ? v[2] + (v[3] - v[2]) * sm((s - v[0]) / Math.max(0.01, v[1] - v[0])) : (v === true ? 1 : (v || 0));
  const shotT = (t, P) => P.t0 != null ? t - P.t0 : 0;
  const cleared = (P, x, z) => (P.clear || []).some(([cx, cz, r]) => (x - cx) ** 2 + (z - cz) ** 2 < r * r);
  const S = PROM, T = TOWN, CELL = 2;

  // ---------- textures (1 m tiles: a wall's cells and boxes each start a tile on their own left and bottom edges) ----------
  const blockT = tex(32, 32, (x, r) => {   // painted cinderblock, cream, low-contrast mortar: 2 x 4 blocks a metre
    px(x, '#ece2c8', 0, 0, 32, 32); noise(x, r, 32, 32, ['rgba(120,100,70,.05)'], 40);
    for (let yy = 0; yy < 32; yy += 8) { px(x, '#d8ccae', 0, yy, 32, 1); for (let xx = (yy / 8) % 2 ? 8 : 0; xx < 32; xx += 16) px(x, '#d8ccae', xx, yy, 1, 8); }
  }, 5401);
  const brickT = tex(32, 30, (x, r) => {   // the clip's red brick: 2 x 5 bricks a metre
    px(x, '#8a3a2a', 0, 0, 32, 30); noise(x, r, 32, 30, ['rgba(40,10,5,.12)', 'rgba(200,120,90,.07)'], 70);
    for (let row = 0; row < 5; row++) { const yy = row * 6; px(x, '#b8a898', 0, yy, 32, 1); for (let xx = row % 2 ? 8 : 0; xx < 32; xx += 16) px(x, '#b8a898', xx, yy, 1, 6); }
  }, 5402);
  const chromeT = tex(32, 32, x => {   // the diner's outside: teal enamel panels with steel seams (a grey diner seen through the gym's hole was the cinderblock's own tone: the hole didn't read)
    px(x, '#2e9a92', 0, 0, 32, 32); px(x, '#46b8ae', 0, 0, 32, 3);
    for (let xx = 0; xx < 32; xx += 8) px(x, '#c8d4d8', xx, 0, 1, 32);
  }, 5403);
  const sidingT = tex(32, 32, x => {   // the house's pale blue clapboard
    px(x, '#a8c4d8', 0, 0, 32, 32); for (let yy = 0; yy < 32; yy += 4) { px(x, '#8eaac0', 0, yy + 3, 32, 1); px(x, '#bcd4e4', 0, yy, 32, 1); }
  }, 5404);
  const doorT = tex(64, 64, x => {   // the house's front-door cell (2 x 2 m): the white door with its panels and brass knob in the clapboard
    for (let yy = 0; yy < 64; yy += 8) { px(x, '#a8c4d8', 0, yy, 64, 8); px(x, '#8eaac0', 0, yy + 7, 64, 1); px(x, '#bcd4e4', 0, yy, 64, 1); }
    px(x, '#5a4030', 13, 2, 38, 62); px(x, '#f4f2ec', 15, 3, 34, 61);
    for (const [xx, yy] of [[18, 8], [33, 8], [18, 34], [33, 34]]) { px(x, '#e0ded6', xx, yy, 13, 22); px(x, '#f8f6f0', xx + 1, yy + 1, 11, 20); }
    px(x, '#d8b048', 43, 30, 3, 3);
  }, 5405);
  const picketT = tex(32, 32, x => {   // white pickets, see-through between them (alpha 0: the shader discards it)
    x.clearRect(0, 0, 32, 32);
    for (let xx = 1; xx < 32; xx += 8) { px(x, '#f4f2ec', xx, 2, 5, 30); px(x, '#f4f2ec', xx + 1, 0, 3, 2); px(x, '#d8d6cc', xx + 4, 2, 1, 30); }
    px(x, '#e8e6dc', 0, 7, 32, 3); px(x, '#e8e6dc', 0, 24, 32, 3);
  }, 5406);
  const vanT = tex(32, 32, (x, r) => { px(x, '#f4c41c', 0, 0, 32, 32); noise(x, r, 32, 32, ['rgba(120,80,0,.06)'], 30); }, 5407);
  const checkT = tex(16, 4, x => { for (let xx = 0; xx < 16; xx += 2) { px(x, (xx / 2) % 2 ? '#1a1a1a' : '#f4f2ec', xx, 0, 2, 2); px(x, (xx / 2) % 2 ? '#f4f2ec' : '#1a1a1a', xx, 2, 2, 2); } }, 5421);
  const backdropT = tex(64, 64, (x, r) => {   // the PROM backdrop: midnight blue with gold stars and the word in pink
    const g = x.createLinearGradient(0, 0, 0, 64); g.addColorStop(0, '#1c1848'); g.addColorStop(1, '#3a2a6a'); x.fillStyle = g; x.fillRect(0, 0, 64, 64);
    for (let i = 0; i < 40; i++) px(x, r() < 0.5 ? '#ffd86a' : '#ffffff', Math.floor(r() * 64), Math.floor(r() * 64), 1, 1);
    x.fillStyle = '#ff6ab8'; x.font = 'bold 15px monospace'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('PROM', 32, 14);
  }, 5408);
  const starsT = tex(64, 64, (x, r) => {   // the photo booth's backdrop: silver stars on lilac, a pink frame
    px(x, '#b89ae0', 0, 0, 64, 64);
    for (let i = 0; i < 28; i++) { const sx = Math.floor(r() * 60), sy = Math.floor(r() * 60); px(x, '#f4f0ff', sx + 1, sy, 1, 3); px(x, '#f4f0ff', sx, sy + 1, 3, 1); }
    x.strokeStyle = '#ff6ab8'; x.lineWidth = 2; x.strokeRect(6, 6, 52, 52);
  }, 5409);
  const wcT = tex(64, 64, x => {   // the restroom door's cell: a pink door with a little sign
    px(x, '#ece2c8', 0, 0, 64, 64); px(x, '#6a5a4a', 6, 0, 52, 64); px(x, '#f0a8c8', 8, 0, 48, 62);
    px(x, '#ffffff', 26, 30, 12, 12); px(x, '#c0407a', 30, 32, 4, 3); px(x, '#c0407a', 28, 35, 8, 6);
    px(x, '#c0c0c8', 48, 34, 4, 3);
  }, 5410);
  const floorT = tex(32, 32, (x, r) => { px(x, '#d8a868', 0, 0, 32, 32); for (let yy = 0; yy < 32; yy += 4) px(x, '#cc9c5c', 0, yy, 32, 1); for (let i = 0; i < 10; i++) px(x, '#d0a060', Math.floor(r() * 32), Math.floor(r() * 8) * 4 + 1, 1, 3); }, 5411);
  const lineM = mat({ color: 0xc8463a, unlit: 0.1 });
  const asphaltT = tex(16, 16, (x, r) => { px(x, '#2e3038', 0, 0, 16, 16); noise(x, r, 16, 16, ['rgba(255,255,255,.04)', 'rgba(0,0,0,.08)'], 40); }, 5412);
  const walkT = tex(16, 16, x => { px(x, '#7a7c84', 0, 0, 16, 16); px(x, '#62646c', 0, 15, 16, 1); px(x, '#62646c', 15, 0, 1, 16); }, 5413);
  const grassT = tex(16, 16, (x, r) => { px(x, '#3e6a34', 0, 0, 16, 16); noise(x, r, 16, 16, ['rgba(120,180,90,.12)', 'rgba(0,0,0,.08)'], 50); }, 5414);
  const checkerT = tex(8, 8, x => { px(x, '#f2f0ea', 0, 0, 8, 8); px(x, '#2a2a30', 0, 0, 4, 4); px(x, '#2a2a30', 4, 4, 4, 4); }, 5415);
  const wallpaperT = tex(16, 16, x => { px(x, '#f2d88a', 0, 0, 16, 16); for (let yy = 2; yy < 16; yy += 8) for (let xx = 2; xx < 16; xx += 8) px(x, '#e8c470', xx, yy, 3, 3); }, 5416);
  const tileT = tex(16, 16, x => { px(x, '#f6c8dc', 0, 0, 16, 16); px(x, '#e8b0c8', 0, 15, 16, 1); px(x, '#e8b0c8', 15, 0, 1, 16); }, 5417);
  const nightT = tex(64, 384, (x, r) => { const g = x.createLinearGradient(0, 0, 0, 384); g.addColorStop(0, '#060818'); g.addColorStop(0.4, '#16205a'); g.addColorStop(0.5, '#2a3a7a'); g.addColorStop(0.6, '#141a3a'); g.addColorStop(1, '#0c0e1c'); x.fillStyle = g; x.fillRect(0, 0, 64, 384); for (let i = 0; i < 260; i++) px(x, r() < 0.7 ? '#f4f0ff' : '#ffe6a8', Math.floor(r() * 64), Math.floor(r() * 264), 1, 1); }, 5418);
  const photoT = tex(16, 20, x => { px(x, '#d8b048', 0, 0, 16, 20); px(x, '#a8d8f0', 1, 1, 14, 18); px(x, '#2a1a10', 4, 6, 8, 7); px(x, '#b07040', 5, 8, 6, 5); px(x, '#ff6aa0', 10, 5, 3, 2); px(x, '#a8c8e8', 5, 13, 6, 6); }, 5419);   // Sadi in her prom dress
  const noDogsT = tex(32, 32, x => {
    px(x, '#f4f2ec', 0, 0, 32, 32); x.strokeStyle = '#d82a2a'; x.lineWidth = 3; x.beginPath(); x.arc(16, 14, 10, 0, TAU); x.stroke();
    px(x, '#3a3a3a', 10, 11, 12, 6); px(x, '#3a3a3a', 9, 9, 4, 4); px(x, '#3a3a3a', 11, 17, 2, 3); px(x, '#3a3a3a', 19, 17, 2, 3);
    x.beginPath(); x.moveTo(9, 7); x.lineTo(23, 21); x.stroke(); x.fillStyle = '#d82a2a'; x.font = 'bold 7px monospace'; x.textAlign = 'center'; x.fillText('NO DOGS', 16, 30);
  }, 5420);

  // materials: a hole cell's UVs are in metres (rep 1 = a tile a metre, or its own cellRep); a box gets rep = its size
  const boxMat = (t, w, h, o = {}) => mat({ map: t, rep: [Math.max(0.01, w), Math.max(0.01, h)], unlit: UNLIT.get(t) || 0, ...o });
  const UNLIT = new Map([[blockT, 0.3], [brickT, 0.25], [chromeT, 0.4], [sidingT, 0.35], [doorT, 0.35], [picketT, 0.45], [vanT, 0.4], [backdropT, 0.35], [starsT, 0.4], [wcT, 0.35]]);
  const KIND = {
    block: { t: blockT, chip: 0xe0d4b8 }, brick: { t: brickT, chip: 0x8a3a2a }, chrome: { t: chromeT, chip: 0x3aa8a0 },
    siding: { t: sidingT, chip: 0xa8c4d8 }, door: { t: doorT, chip: 0xf4f2ec, cellRep: 0.5 }, picket: { t: picketT, chip: 0xf4f2ec },
    van: { t: vanT, chip: 0xf4c41c }, backdrop: { t: backdropT, chip: 0x2a2458, cellRep: 0.5 }, stars: { t: starsT, chip: 0xb89ae0, cellRep: 0.5 },
    wc: { t: wcT, chip: 0xf0a8c8, cellRep: 0.5 },
  };

  const G = new THREE.Group(), RIM = mat({ color: 0x2a2220, unlit: 0.1 });   // a hole's broken inner rim
  const holeState = {};   // id -> { plug, debris, dust, cracks, planks, W, floor }
  function inside(px2, py) {
    let c = false;
    for (let i = 0, j = SIL.length - 1; i < SIL.length; j = i++) {
      const [xi, yi] = SIL[i], [xj, yj] = SIL[j];
      if ((yi > py) !== (yj > py) && px2 < (xj - xi) * (py - yi) / (yj - yi) + xi) c = !c;
    }
    return c;
  }
  const TOWN_W = [], OWN = new Map();   // the town's walls on the line; material -> [its building, interior?, own unlit, own colour]
  const INNERS = [];   // [material, zone, its own unlit]: an interior on the line, lit only in its own zone
  const INNER = (m, zone) => { INNERS.push([m, zone, m.uniforms.uUnlit.value]); return m; };
  const silShape = (ox, oy, sh) => { SIL.forEach(([sx, sy], i) => (i ? sh.lineTo(ox + sx, oy + sy) : sh.moveTo(ox + sx, oy + sy))); sh.closePath(); return sh; };

  // ---------- a wall that can burst: 2 m cells along u (its local x), a hole's cell an extruded shape with the
  // silhouette cut out and its plug (the silhouette extruded alone, same UVs: seamless) shown until the burst ----------
  // o: { x, z, yaw (deg), len (across), H, T, kind, y0 (its foot), floorY (where its debris lands, world y), gaps: [[u0, u1, y1]] }
  function wall(name, o) {
    const W = new THREE.Group(); W.position.set(o.x, o.y0 || 0, o.z); W.rotation.y = o.yaw * PI / 180; G.add(W); if (o.town) TOWN_W.push(W);
    const skin = (geo, x, y) => { if (!o.inner) return null; const pr = geo.parameters; if (pr && pr.width) { const uv = geo.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * pr.width, uv.getY(i) * pr.height); } const q = at(new THREE.Mesh(geo, o.inner.m), x, y, o.inner.side * (Tk / 2 + 0.006)); W.add(q); return q; };   // the inside face's own skin (UVs in metres)
    const kd = KIND[o.kind], H = o.H, Tk = o.T, half = o.len / 2, cellH = Math.min(H, CELL);
    const cells = Object.entries(HOLES).filter(([, h]) => h.wall === name).map(([id, h]) => [h.u - CELL / 2, h.u + CELL / 2, id]);
    for (const g of o.gaps || []) cells.push([g[0], g[1], null, g[2]]);
    cells.sort((a, b) => a[0] - b[0]);
    let u = -half; const pieces = [];
    for (const c of cells) { if (c[0] > u + 0.001) pieces.push([u, c[0]]); u = c[1]; }
    if (half > u + 0.001) pieces.push([u, half]);
    for (const [a, b] of pieces) { const w = b - a; W.add(at(new THREE.Mesh(new THREE.BoxGeometry(w, H, Tk), boxMat(kd.t, w, H)), (a + b) / 2, H / 2, 0)); skin(new THREE.PlaneGeometry(w, H), (a + b) / 2, H / 2); }
    for (const c of cells) {
      const [a, b, id, gapY] = c, w = b - a;
      if (id == null) {   // an opening (a doorway): the wall over it
        if (H > gapY) W.add(at(new THREE.Mesh(new THREE.BoxGeometry(w, H - gapY, Tk), boxMat(kd.t, w, H - gapY)), (a + b) / 2, (gapY + H) / 2, 0));
        continue;
      }
      const kc = KIND[HOLES[id].kind || o.kind], hy = HOLES[id].hy, cm = mat({ map: kc.t, rep: [kc.cellRep || 1, kc.cellRep || 1], unlit: UNLIT.get(kc.t) || 0 });
      const sh = new THREE.Shape(); sh.moveTo(0, 0); sh.lineTo(w, 0); sh.lineTo(w, cellH); sh.lineTo(0, cellH); sh.closePath();
      sh.holes.push(silShape(w / 2, hy, new THREE.Path()));
      const cg = new THREE.ExtrudeGeometry(sh, { depth: Tk, bevelEnabled: false, curveSegments: 1 }); cg.translate(0, 0, -Tk / 2);
      W.add(at(new THREE.Mesh(cg, [cm, RIM]), a, 0, 0)); skin(new THREE.ShapeGeometry(sh, 1), a, 0);
      if (H > cellH) { W.add(at(new THREE.Mesh(new THREE.BoxGeometry(w, H - cellH, Tk), boxMat(kd.t, w, H - cellH)), (a + b) / 2, (cellH + H) / 2, 0)); skin(new THREE.PlaneGeometry(w, H - cellH), (a + b) / 2, (cellH + H) / 2); }
      const pg = new THREE.ExtrudeGeometry(silShape(w / 2, hy, new THREE.Shape()), { depth: Tk * 0.98, bevelEnabled: false, curveSegments: 1 }); pg.translate(-w / 2, -hy - 0.62, -Tk * 0.49); pg.scale(1.03, 1.02, 1); pg.translate(w / 2, hy + 0.62, 0);
      const plug = at(new THREE.Mesh(pg, cm), a, 0, 0); W.add(plug);
      if (o.inner) plug.add(at(new THREE.Mesh(new THREE.ShapeGeometry(silShape(w / 2, hy, new THREE.Shape()), 1), o.inner.m), 0, 0, o.inner.side * (Tk * 0.49 + 0.006)));
      // debris: chunks from inside the shape, flung out on the +z (the dog's) side; dust puffs
      const chipM = M(kc.chip, { unlit: 0.45 }), debris = [];
      for (let i = 0; i < 16; i++) {
        const [rx, ry] = SIL[Math.floor(hash(i, 5431) * SIL.length) % SIL.length], dx = rx, dy = ry - 0.62, dl = Math.hypot(dx, dy) || 1;   // a point on the outline, thrown away from the shape's middle
        const size = 0.06 + 0.09 * hash(i, 5433), m = new THREE.Mesh(new THREE.BoxGeometry(size, size * (0.6 + 0.6 * hash(i, 5434)), size * 0.8), chipM);
        m.visible = false; W.add(m);
        const out = 2.6 + 1.8 * hash(i, 5435);
        debris.push({ m, p0: [a + w / 2 + rx, hy + ry, Tk / 2], v: [dx / dl * out, 0.4 + dy / dl * out * 0.6 + 1.2 * hash(i, 5436), 0.8 + 1.6 * hash(i, 5437)], spin: [6 * hash(i, 5438), 8 * hash(i, 5439), 5 * hash(i, 5440)], size });
      }
      const dust = [];
      const dustM = mat({ color: 0xe8e0d0, unlit: 0.55 });
      for (let i = 0; i < 8; i++) { const [rx, ry] = SIL[Math.floor(hash(i, 5441) * SIL.length) % SIL.length], d = ico(0.035, 1, dustM); d.visible = false; W.add(d); dust.push({ d, p: [a + w / 2 + rx, hy + ry, Tk / 2 + 0.04], v: [rx * 1.2, 0.15 + 0.3 * hash(i, 5444), 0.3 + 0.5 * hash(i, 5445)] }); }
      // the crack: the outline as thin dark strips on the +z face
      const crackM = glow(0x2a2018, 0.6), cracks = [];
      for (let i = 0; i < SIL.length; i++) {
        const [x0, y0] = SIL[i], [x1, y1] = SIL[(i + 1) % SIL.length], L = Math.hypot(x1 - x0, y1 - y0);
        for (const sd of [1, -1]) { const q = new THREE.Mesh(new THREE.BoxGeometry(L + 0.03, 0.05, 0.012), crackM); q.position.set(a + w / 2 + (x0 + x1) / 2, hy + (y0 + y1) / 2, sd * (Tk / 2 + 0.008)); q.rotation.z = Math.atan2(y1 - y0, x1 - x0); q.visible = false; W.add(q); cracks.push(q); }
      }
      // planks nailed across it on the +z side
      const plankM = M(0x9a6a3a), planks = [];
      for (const [py, ang] of [[0.35, 0.16], [0.72, -0.12], [1.05, 0.1]]) { const q = new THREE.Mesh(new THREE.BoxGeometry(1.45, 0.16, 0.04), plankM); q.position.set(a + w / 2, hy + py, Tk / 2 + 0.03); q.rotation.z = ang; q.visible = false; W.add(q); planks.push(q); }
      holeState[id] = { plug, debris, dust, cracks, planks, W, floor: (o.floorY || 0) - (o.y0 || 0) };
    }
    return W;
  }

  // ---------- box pets: prom guests in suits and gowns, boxers in blue hoodies, the diner's couple, the DJ ----------
  const FURS = [0xf2eee6, 0xd8a868, 0x9a9aa4, 0xe8c090, 0x8a7a6c, 0xc8b8a8, 0x6a5a4c, 0xe0d0b8];
  const SUITS = [0x22263a, 0x1a1a1e, 0x3a3a48, 0x2a3a6a];
  const GOWNS = [0xf0a8c8, 0xc8a8f0, 0xa8e0c8, 0xf0d888, 0xf8b090, 0xa8c8f0];
  function pet(i, kind = 'guest') {
    const g = new THREE.Group(), F = M(FURS[i % FURS.length]), ears = i % 3, body = new THREE.Group(); g.add(body);
    const gown = kind === 'guest' && i % 2 === 1, topC = kind === 'boxer' ? 0x3a68c8 : kind === 'dj' ? 0xe8e4f0 : gown ? GOWNS[i % GOWNS.length] : SUITS[i % SUITS.length];
    const top = M(topC);
    const legs = [-1, 1].map(sx => { const l = at(new THREE.Group(), sx * 0.1, 0.3, 0); l.add(at(box(0.13, 0.3, 0.13, M(gown ? topC : 0x22222a)), 0, -0.15, 0)); body.add(l); return l; });
    if (gown) body.add(at(cyl(0.16, 0.28, 0.42, 6, top), 0, 0.2, 0));   // a full skirt
    body.add(at(box(0.4, 0.38, 0.28, top), 0, 0.52, 0));
    if (!gown && kind === 'guest') { body.add(at(box(0.1, 0.22, 0.02, M(0xf4f2ec)), 0, 0.56, 0.145)); body.add(at(box(0.09, 0.05, 0.03, M(0xd83a4a)), 0, 0.67, 0.155)); }   // shirt front, bow tie
    const pawS = kind === 'boxer' ? 0.13 : 0.08, pawM = kind === 'boxer' ? M(0xd82a2a) : F;
    const arms = [-1, 1].map(sx => { const a = at(new THREE.Group(), sx * 0.23, 0.66, 0); a.add(at(box(0.09, 0.28, 0.09, top), 0, -0.12, 0)); a.add(at(box(pawS, pawS, pawS, pawM), 0, -0.28, 0)); body.add(a); return a; });
    const head = at(new THREE.Group(), 0, 0.94, 0); body.add(head);
    const skull = ico(0.24, 1, F); skull.scale.set(1, 0.9, 0.92); head.add(skull);
    const snout = at(ico(0.1, 1, M(0xf0e6d8)), 0, -0.07, 0.19); snout.scale.set(1.1, 0.8, 0.9); head.add(snout);
    head.add(at(ico(0.035, 0, M(0x151515)), 0, -0.03, 0.28));
    const mouth = at(box(0.09, 0.07, 0.02, M(0x5a1a1a)), 0, -0.13, 0.25); mouth.visible = false; head.add(mouth);
    for (const e of [-1, 1]) {
      head.add(at(ico(0.038, 0, M(0x0e0e0e)), e * 0.1, 0.05, 0.19)); head.add(at(ico(0.012, 0, glow(0xffffff)), e * 0.1 + 0.012, 0.065, 0.225));
      head.add(ears === 0 ? rot(at(cone(0.08, 0.2, 4, F), e * 0.15, 0.27, 0), 0, 0, -e * 0.25) : ears === 1 ? at(box(0.08, 0.3, 0.06, F), e * 0.1, 0.33, 0) : rot(at(box(0.07, 0.24, 0.16, F), e * 0.24, 0.02, 0), 0, 0, e * 0.3));
    }
    if (kind === 'dj') { head.add(at(box(0.56, 0.06, 0.08, M(0x2a2a30)), 0, 0.2, 0)); for (const e of [-1, 1]) head.add(at(box(0.07, 0.16, 0.16, M(0x2a2a30)), e * 0.27, 0.02, 0)); }
    return { g, body, head, arms, legs, mouth, i };
  }
  const reset = q => { q.body.position.set(0, 0, 0); q.body.rotation.set(0, 0, 0); q.head.rotation.set(0, 0, 0); q.mouth.visible = false; q.arms.forEach(a => { a.rotation.set(0, 0, 0); a.position.z = 0; }); q.legs.forEach(l => l.rotation.set(0, 0, 0)); };
  const turnTo = (q, x, z, P, yaw) => { if (!P.stare) return; const a = Math.atan2(P.stare[0] - x, P.stare[1] - z) - yaw; q.head.rotation.y = Math.max(-1.2, Math.min(1.2, Math.atan2(Math.sin(a), Math.cos(a)))); };
  function pose(q, mode, bt, tt, i, x, z, P, yaw) {
    const ph = i * 0.37, b = Math.abs(Math.sin((bt + ph) * PI));
    if (mode === 'dance') {   // paws up on the beat (never level: a level arm reads as a T-pose)
      q.body.position.y = 0.06 * b; q.body.rotation.z = 0.12 * Math.sin((bt + ph) * PI);
      q.arms.forEach((a, j) => a.rotation.set(-2.55 - 0.3 * Math.sin((bt + ph) * PI + j * PI), 0, (j ? -1 : 1) * 0.28)); q.head.rotation.z = 0.15 * Math.sin((bt + ph) * PI); q.mouth.visible = i % 2 === 0;
    } else if (mode === 'slow') { q.body.rotation.z = 0.1 * Math.sin(bt * PI / 2 + ph); q.arms.forEach((a, j) => a.rotation.set(-1.5, 0, (j ? -1 : 1) * 0.2)); }
    else if (mode === 'cheer') { q.arms.forEach((a, j) => a.rotation.set(0, 0, (j ? 1 : -1) * 2.45)); q.mouth.visible = true; q.body.position.y = 0.05 * b; }
    else if (mode === 'gasp') { q.arms.forEach((a, j) => a.rotation.set(-2.35, 0, (j ? -1 : 1) * 0.35)); q.mouth.visible = true; turnTo(q, x, z, P, yaw); }
    else if (mode === 'stare') turnTo(q, x, z, P, yaw);
    else if (mode === 'punch') { const k2 = ((Math.floor(bt * 2 + ph) % 2) + 2) % 2, e = Math.exp(-fr(bt * 2 + ph) * 5); q.arms.forEach((a, j) => a.rotation.set(j === k2 ? -1.55 - 0.1 * e : -1.1, 0, (j ? -1 : 1) * 0.12)); q.arms[k2].position.z = 0.12 * e; q.body.rotation.y = (k2 ? 0.2 : -0.2) * e; turnTo(q, x, z, P, yaw); }
    else if (mode === 'sip') { q.arms.forEach((a, j) => a.rotation.set(-1.25, 0, (j ? -1 : 1) * 0.25)); q.head.rotation.x = 0.15; }
  }

  function prom() {
    // ================= the gym =================
    const W = S.X1 - S.X0, D = S.Z1 - S.Z0;
    G.add(flat(W, D, mat({ map: floorT, rep: [W / 2, D / 2] }), (S.X0 + S.X1) / 2, 0, (S.Z0 + S.Z1) / 2));
    const court = new THREE.Group(); G.add(court);   // low-contrast court lines (the tessellator gives flats this low a polygon offset)
    const ln = (w, d, x, z) => court.add(flat(w, d, lineM, x, 0.004, z));
    ln(0.08, D - 1.2, 0, 0); ln(W - 1.4, 0.08, 0, S.Z0 + 0.7); ln(W - 1.4, 0.08, 0, S.Z1 - 0.7);
    const ring = new THREE.Mesh(new THREE.RingGeometry(1.75, 1.83, 32), lineM); ring.rotation.x = -PI / 2; ring.position.y = 0.005; court.add(ring);
    // the walls: the west (the line's: holes, the doors), the north, the east, the south (the restroom's door cell), the ceiling
    wall('west', { x: S.X0, z: 0, yaw: 90, len: D, H: S.H, T: 0.25, kind: 'block', gaps: [[-S.DOORS.z1, -S.DOORS.z0, S.DOORS.h]] });
    G.add(at(new THREE.Mesh(new THREE.PlaneGeometry(W, S.H), boxMat(blockT, W, S.H)), 0, S.H / 2, S.Z0));
    G.add(rot(at(new THREE.Mesh(new THREE.PlaneGeometry(D, S.H), boxMat(blockT, D, S.H)), S.X1, S.H / 2, 0), 0, -PI / 2, 0));
    const wcX = S.WC[0];
    G.add(rot(at(new THREE.Mesh(new THREE.PlaneGeometry(wcX - 1 - S.X0, S.H), boxMat(blockT, wcX - 1 - S.X0, S.H)), (S.X0 + wcX - 1) / 2, S.H / 2, S.Z1), 0, PI, 0));
    G.add(rot(at(new THREE.Mesh(new THREE.PlaneGeometry(S.X1 - wcX - 1, S.H), boxMat(blockT, S.X1 - wcX - 1, S.H)), (wcX + 1 + S.X1) / 2, S.H / 2, S.Z1), 0, PI, 0));
    G.add(rot(at(new THREE.Mesh(new THREE.PlaneGeometry(2, S.H - 2), boxMat(blockT, 2, S.H - 2)), wcX, (S.H + 2) / 2, S.Z1), 0, PI, 0));
    wall('wc', { x: wcX, z: S.Z1, yaw: 0, len: 2, H: 2, T: 0.1, kind: 'wc' });
    const rr = new THREE.Group(); G.add(rr);   // the restroom behind its door: pink tiles, a mirror, a sink
    const RW = 5, RD = 4.6, RH = 3;
    for (const [x0, x1, y0, y1] of [[wcX - RW / 2, wcX - 1, 0, RH], [wcX + 1, wcX + RW / 2, 0, RH], [wcX - 1, wcX + 1, 2, RH]]) rr.add(at(new THREE.Mesh(new THREE.PlaneGeometry(x1 - x0, y1 - y0), mat({ map: tileT, rep: [x1 - x0, y1 - y0], unlit: 0.45 })), (x0 + x1) / 2, (y0 + y1) / 2, S.Z1 + 0.06));   // the restroom: 5 x 4.6 m behind its door, pink tiles, a mirror and a sink on its west wall
    rr.add(flat(RW, RD, mat({ map: tileT, rep: [RW, RD], unlit: 0.3 }), wcX, 0.001, S.Z1 + RD / 2));
    for (const mx of [wcX - 1.75, wcX + 1.75]) {
      rr.add(at(box(1.0, 0.82, 0.03, M(0xf4f2ec, { unlit: 0.4 })), mx, 1.5, S.Z1 + 0.08)); rr.add(at(new THREE.Mesh(new THREE.PlaneGeometry(0.88, 0.7), glow(0xc8e4f4, 0.75)), mx, 1.5, S.Z1 + 0.1)); rr.add(rot(at(box(0.5, 0.03, 0.02, glow(0xffffff, 0.9)), mx + 0.18, 1.66, S.Z1 + 0.105), 0, 0, 0.6));
      rr.add(at(box(0.7, 0.14, 0.42, M(0xf4f2ec, { unlit: 0.35 })), mx, 0.82, S.Z1 + 0.3)); rr.add(at(cyl(0.07, 0.09, 0.75, 6, M(0xf4f2ec, { unlit: 0.25 })), mx, 0.38, S.Z1 + 0.3)); rr.add(at(box(0.04, 0.12, 0.04, M(0xc0c4cc)), mx, 0.95, S.Z1 + 0.16));
      rr.add(at(box(0.9, 0.06, 0.12, glow(0xfff6e0, 1)), mx, 2.05, S.Z1 + 0.12));
    }
    rr.add(rot(at(new THREE.Mesh(new THREE.PlaneGeometry(RW, RH), mat({ map: tileT, rep: [RW, RH], unlit: 0.45 })), wcX, RH / 2, S.Z1 + RD), 0, PI, 0));
    for (const sx of [-1, 1]) rr.add(rot(at(new THREE.Mesh(new THREE.PlaneGeometry(RD, RH), mat({ map: tileT, rep: [RD, RH], unlit: 0.45 })), wcX + sx * RW / 2, RH / 2, S.Z1 + RD / 2), 0, -sx * PI / 2, 0));
    const rc = new THREE.Mesh(new THREE.PlaneGeometry(RW, RD), M(0xf8e0ec, { unlit: 0.4 })); rc.rotation.x = PI / 2; rr.add(at(rc, wcX, RH, S.Z1 + RD / 2));
    rr.add(rot(at(new THREE.Mesh(new THREE.PlaneGeometry(1.2, 0.8), glow(0xc8e0f0, 0.7)), wcX - RW / 2 + 0.02, 1.55, S.Z1 + 2.6), 0, PI / 2, 0));
    rr.add(at(box(0.45, 0.14, 0.7, M(0xf4f2ec, { unlit: 0.3 })), wcX - RW / 2 + 0.25, 0.85, S.Z1 + 2.6)); rr.add(at(cyl(0.06, 0.08, 0.85, 6, M(0xf4f2ec)), wcX - RW / 2 + 0.25, 0.42, S.Z1 + 2.6));
    const ceil = new THREE.Mesh(new THREE.PlaneGeometry(W, D), M(0x1a1830)); ceil.rotation.x = PI / 2; G.add(at(ceil, 0, S.H, 0));
    for (let xx = S.X0 + 2; xx < S.X1; xx += 4) G.add(at(box(0.18, 0.4, D, M(0x2a2840)), xx, S.H - 0.25, 0));   // trusses
    // the double doors in the west wall, a NO DOGS sign on the left leaf, the EXIT sign
    const leafM = M(0x6a8ab0), barM = M(0xc8ccd4);
    const doorG = [0, 1].map(j => { const h = new THREE.Group(); h.position.set(S.X0 - 0.14, 0, j ? S.DOORS.z1 : S.DOORS.z0); G.add(h); h.add(at(box(0.06, S.DOORS.h - 0.04, 0.98, leafM), 0, S.DOORS.h / 2, j ? -0.5 : 0.5)); h.add(at(box(0.08, 0.06, 0.7, barM), 0.06, 1.0, j ? -0.5 : 0.5)); if (!j) h.add(rot(at(new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.5), mat({ map: noDogsT, unlit: 0.3 })), 0.04, 1.42, 0.5), 0, PI / 2, 0)); return h; });
    G.add(rot(at(new THREE.Mesh(new THREE.PlaneGeometry(0.6, 0.22), mat({ map: sign('EXIT', '#202020', '#ff3a3a', 32, 12), unlit: 1 })), S.X0 + 0.14, S.DOORS.h + 0.3, (S.DOORS.z0 + S.DOORS.z1) / 2), 0, PI / 2, 0));
    // the bleachers folded against the north wall
    const bleachG = new THREE.Group(); G.add(bleachG);
    for (let st = 0; st < 6; st++) bleachG.add(at(box(S.BLEACH.x1 - S.BLEACH.x0, 0.35 * (st + 1), 0.25, M(st % 2 ? 0xb88850 : 0xa87840)), (S.BLEACH.x0 + S.BLEACH.x1) / 2, 0.175 * (st + 1), S.BLEACH.z + 0.13 + (5 - st) * 0.25));
    for (const sx of [-1, 1]) { const hx = sx > 0 ? S.X1 - 0.15 : S.X0 + 0.15; G.add(at(box(0.08, 1.05, 1.8, M(0xf4f2ec, { unlit: 0.2 })), hx, 4.7, 0)); G.add(at(box(0.06, 0.45, 0.6, M(0xd84a2a)), hx - sx * 0.05, 4.55, 0)); }   // the hoops, folded up
    // the stage: platform, steps, the PROM backdrop and its hole cell, the balloon arch, speakers, the DJ
    const st = S.STAGE;
    G.add(at(box(st.x1 - st.x0, st.y, st.z1 - st.z0, M(0x3a2a4a)), (st.x0 + st.x1) / 2, st.y / 2, (st.z0 + st.z1) / 2));
    G.add(at(box(0.04, 0.12, st.z1 - st.z0 + 0.02, glow(0xff6ab8, 0.7)), st.x0 - 0.01, st.y - 0.06, (st.z0 + st.z1) / 2));
    const skirtT = tex(16, 8, x => { for (let xx = 0; xx < 16; xx += 4) { px(x, '#8a3a8a', xx, 0, 2, 8); px(x, '#b04aa8', xx + 2, 0, 2, 8); } px(x, '#d86ac8', 0, 0, 16, 1); }, 5422);
    G.add(rot(at(new THREE.Mesh(new THREE.PlaneGeometry(st.z1 - st.z0, st.y - 0.12), mat({ map: skirtT, rep: [(st.z1 - st.z0) * 2, 1], unlit: 0.45 })), st.x0 - 0.012, (st.y - 0.12) / 2, (st.z0 + st.z1) / 2), 0, -PI / 2, 0));
    for (let s2 = 0; s2 < 3; s2++) G.add(at(box(0.35, st.y * (s2 + 1) / 3, 1.6, M(0x4a3a5a)), st.x0 - 0.35 * (3 - s2) + 0.175, st.y * (s2 + 1) / 6, 3.6));
    wall('banner', { x: S.BANNER[0], z: S.BANNER[1], yaw: -90, len: 2, H: 2.4, T: 0.08, kind: 'backdrop', y0: st.y, floorY: st.y });
    for (const sz of [-1, 1]) G.add(rot(at(new THREE.Mesh(new THREE.PlaneGeometry(3.4, 3.4), mat({ map: backdropT, unlit: 0.35 })), S.BANNER[0] + 0.02, st.y + 1.7, sz * 2.7), 0, -PI / 2, 0));
    const archG = new THREE.Group(); G.add(archG);
    const BAL = [0xff6ab8, 0xffffff, 0xffd86a, 0xc8a8f0];
    for (let i = 0; i < 46; i++) { const a = PI * i / 45, r = 2.9 + 0.12 * Math.sin(i * 2.3); archG.add(at(ico(0.2 + 0.04 * hash(i, 5450), 1, M(BAL[i % 4], { unlit: 0.25 })), S.BANNER[0] - 0.4, st.y + Math.sin(a) * r, Math.cos(a) * r)); }
    for (const sz of [-1, 1]) G.add(at(box(0.7, 1.5, 0.7, M(0x1a1a1e)), st.x0 + 0.6, st.y + 0.75, sz * 4.4));
    const deckG = new THREE.Group(); G.add(deckG); deckG.add(at(box(0.6, 0.8, 1.4, M(0x2a2a30)), S.DJ[0] - 0.5, st.y + 0.4, S.DJ[1])); deckG.add(at(box(0.62, 0.04, 1.42, glow(0x4ad0e8, 0.8)), S.DJ[0] - 0.5, st.y + 0.82, S.DJ[1]));
    const dj = pet(3, 'dj'); dj.g.position.set(S.DJ[0], st.y, S.DJ[1]); dj.g.rotation.y = -PI / 2; G.add(dj.g);
    // the punch table, red cups
    const punchG = new THREE.Group(); G.add(punchG);
    punchG.add(at(box(1.8, 0.05, 0.8, M(0xf4f2ec)), S.PUNCH[0], S.PUNCH_Y, S.PUNCH[1])); punchG.add(at(box(1.7, S.PUNCH_Y, 0.7, M(0xe8d0e0)), S.PUNCH[0], S.PUNCH_Y / 2, S.PUNCH[1]));
    punchG.add(at(cyl(0.26, 0.18, 0.18, 10, mat({ color: 0xe03a5a, unlit: 0.3, see: 0.25 })), S.PUNCH[0], S.PUNCH_Y + 0.12, S.PUNCH[1]));
    for (let i = 0; i < 6; i++) punchG.add(at(cyl(0.045, 0.035, 0.11, 6, M(0xd82a2a)), S.PUNCH[0] + 0.45 + 0.12 * (i % 3), S.PUNCH_Y + 0.08, S.PUNCH[1] - 0.15 + 0.15 * Math.floor(i / 3)));
    // the photo booth's backdrop (a hole cell)
    wall('photo', { x: S.PHOTO[0], z: S.PHOTO[1], yaw: 180, len: 2, H: 2.3, T: 0.08, kind: 'stars' });
    // the disco ball, its spots, string lights and streamers
    const discoG = new THREE.Group(); G.add(discoG); discoG.position.set(...S.DISCO);
    discoG.add(ico(0.45, 1, M(0xd8dce8, { unlit: 0.5 }))); G.add(at(box(0.02, S.H - S.DISCO[1], 0.02, M(0x444444)), S.DISCO[0], (S.H + S.DISCO[1]) / 2, S.DISCO[2]));
    const spotM = mat({ color: 0xffe8ff, unlit: 1, see: 0.35 }), spots = [];
    for (let i = 0; i < 26; i++) { const q = new THREE.Mesh(new THREE.CircleGeometry(0.16, 12), spotM); G.add(q); spots.push(q); }
    const bulbs = [], bulbM = [glow(0xffe0a0), glow(0xff8ad0), glow(0x8ae0ff)];
    for (let i = 0; i < 4; i++) for (let j = 0; j <= 24; j++) { const u = j / 24, q = ico(0.06, 0, bulbM[(i + j) % 3]); q.position.set(S.X0 + 1 + (W - 2) * u, S.H - 1.2 - 0.6 * Math.sin(u * PI), -6 + i * 4 + 0.7 * Math.sin(u * PI * 6)); G.add(q); bulbs.push(q); }
    const STREAM = [0xff6ab8, 0x8ae0ff, 0xffd86a];
    for (let i = 0; i < 18; i++) G.add(rot(at(box(0.08, 1.4 + 0.6 * hash(i, 5451), 0.01, M(STREAM[i % 3], { unlit: 0.3 })), S.X0 + 1 + (W - 2) * hash(i, 5452), S.H - 0.9, -7 + 14 * hash(i, 5453)), 0, hash(i, 5454) * PI, 0.1));
    const guests = GUEST_SPOTS.map((_, i) => { const q = pet(i); G.add(q.g); return q; });
    const hearts = [], heartM = glow(0xff6ab8, 0.9), HEART = (() => { const sh = new THREE.Shape(); sh.moveTo(0, -0.9); sh.bezierCurveTo(-1.2, -0.1, -1.0, 0.95, 0, 0.45); sh.bezierCurveTo(1.0, 0.95, 1.2, -0.1, 0, -0.9); return new THREE.ShapeGeometry(sh, 6); })();
    for (let i = 0; i < 30; i++) { const h = new THREE.Mesh(HEART, heartM); h.scale.setScalar(0.12); h.visible = false; G.add(h); hearts.push(h); }

    // ================= the line: west of the gym, z = 0 =================
    const town = new THREE.Group(); G.add(town);
    town.add(flat(70, 40, mat({ map: asphaltT, rep: [35, 20] }), -45, -0.002, 0));
    for (const [x0, x1] of [[-16, -10], [-26, -22], [-41, -34]]) for (const sz of [-1, 1]) town.add(flat(x1 - x0, 1.6, mat({ map: walkT, rep: [x1 - x0, 1.6] }), (x0 + x1) / 2, 0.004, sz * 6.4));
    const sky = new THREE.Mesh(new THREE.SphereGeometry(150, 16, 8), mat({ map: nightT, rep: [12, 1], unlit: 1, nofog: 1, side: THREE.BackSide })); sky.position.set(-25, 0, 0); G.add(sky);
    const starM = mat({ color: 0xffffff, unlit: 1, nofog: 1 });
    for (let i = 0; i < 60; i++) { const a = hash(i, 5460) * TAU, e = 0.15 + 0.7 * hash(i, 5461); G.add(at(ico(0.45, 0, starM), -25 + Math.cos(a) * Math.cos(e) * 140, Math.sin(e) * 140, Math.sin(a) * Math.cos(e) * 140)); }
    // the diner: steel outside, a red neon stripe, DINER on the roof; inside a checker floor, the booth, the couple
    const dn = T.DINER, dz = dn.z;
    const dinSkin = INNER(mat({ color: 0xf0f6f0, unlit: 0.8 }), 'diner'); dinSkin.side = THREE.DoubleSide;
    wall('din1', { x: dn.x0, z: 0, yaw: 90, len: 2 * dz, H: dn.h, T: 0.18, kind: 'chrome', town: true, inner: { m: dinSkin, side: 1 } });
    wall('din2', { x: dn.x1, z: 0, yaw: 90, len: 2 * dz, H: dn.h, T: 0.18, kind: 'chrome', town: true, inner: { m: dinSkin, side: -1 } });
    for (const sz of [-1, 1]) town.add(at(box(dn.x1 - dn.x0, dn.h, 0.18, boxMat(chromeT, dn.x1 - dn.x0, dn.h)), (dn.x0 + dn.x1) / 2, dn.h / 2, sz * dz));
    town.add(at(box(dn.x1 - dn.x0 + 0.2, 0.2, 2 * dz + 0.2, M(0x2a8a8a)), (dn.x0 + dn.x1) / 2, dn.h + 0.1, 0));
    const neonG = new THREE.Group(); town.add(neonG);   // hide 'neon': from the street lens it sat at the flying dog's mouth like a red plank
    for (const xx of [dn.x0 - 0.1, dn.x1 + 0.1]) { neonG.add(at(box(0.05, 0.22, 1.5, glow(0xd82a3a, 0.8)), xx, 1.8, 2.6)); neonG.add(at(box(0.05, 0.22, 1.5, glow(0xd82a3a, 0.8)), xx, 1.8, -2.6)); }
    town.add(rot(at(new THREE.Mesh(new THREE.PlaneGeometry(2.6, 0.7), mat({ map: sign('DINER', '#1a1a24', '#ff4a8a', 48, 14), unlit: 1 })), (dn.x0 + dn.x1) / 2, dn.h + 0.65, 0), 0, PI / 2, 0));
    town.add(flat(dn.x1 - dn.x0, 2 * dz, INNER(mat({ map: checkerT, rep: [(dn.x1 - dn.x0) * 2, dz * 4], unlit: 0.6 }), 'diner'), (dn.x0 + dn.x1) / 2, 0.003, 0));
    const dinIn = new THREE.Group(); town.add(dinIn);
    for (const sz of [-1, 1]) dinIn.add(rot(at(new THREE.Mesh(new THREE.PlaneGeometry(dn.x1 - dn.x0 - 0.4, dn.h), INNER(mat({ color: 0xf0f6f0, unlit: 0.8 }), 'diner')), (dn.x0 + dn.x1) / 2, dn.h / 2, sz * (dz - 0.1)), 0, sz > 0 ? PI : 0, 0));
    const tb = T.TABLE, boothG = new THREE.Group(); dinIn.add(boothG);
    boothG.add(at(box(1.3, 0.05, 0.7, M(0xe84a5a, { unlit: 0.2 })), tb[0], T.TABLE_Y, tb[1])); boothG.add(at(cyl(0.05, 0.05, T.TABLE_Y, 6, M(0xc8ccd4)), tb[0], T.TABLE_Y / 2, tb[1]));
    for (const sz of [-1, 1]) { boothG.add(at(box(1.4, 0.4, 0.5, M(0xc82a3a, { unlit: 0.2 })), tb[0], 0.2, tb[1] + sz * 0.85)); boothG.add(at(box(1.4, 0.75, 0.15, M(0xc82a3a, { unlit: 0.2 })), tb[0], 0.55, tb[1] + sz * 1.1)); }
    const shake = new THREE.Group(); boothG.add(shake); shake.position.set(tb[0], T.TABLE_Y + 0.03, tb[1]);
    shake.add(at(cyl(0.07, 0.05, 0.22, 8, mat({ color: 0xf8c8d8, unlit: 0.3 })), 0, 0.11, 0)); shake.add(at(ico(0.075, 1, M(0xfff4f0)), 0, 0.24, 0)); shake.add(at(ico(0.03, 0, M(0xd82a2a)), 0, 0.31, 0));
    for (const sz of [-1, 1]) shake.add(rot(at(box(0.012, 0.2, 0.012, M(0xff4a8a)), 0, 0.33, sz * 0.03), sz * 0.35, 0, 0));
    const couple = [0, 1].map(j => { const q = pet(10 + j); q.g.position.set(tb[0], 0.18, tb[1] + (j ? 0.78 : -0.78)); q.g.rotation.y = j ? PI : 0; boothG.add(q.g); return q; });
    dinIn.add(at(box(dn.x1 - dn.x0 - 1.0, 1.0, 0.5, M(0xc8ccd4, { unlit: 0.3 })), (dn.x0 + dn.x1) / 2, 0.5, -(dz - 0.5)));   // the counter along the north wall
    // the boxing gym (the clip's): brick, big lit windows, punching bags, boxers in blue hoodies
    const gy = T.GYM;
    const gymSkin = INNER(mat({ map: brickT, rep: [1, 1], unlit: 0.5 }), 'gym'); gymSkin.side = THREE.DoubleSide;
    wall('gym1', { x: gy.x0, z: 0, yaw: 90, len: 2 * gy.z, H: gy.h, T: 0.3, kind: 'brick', town: true, inner: { m: gymSkin, side: 1 } });
    wall('gym2', { x: gy.x1, z: 0, yaw: 90, len: 2 * gy.z, H: gy.h, T: 0.3, kind: 'brick', town: true, inner: { m: gymSkin, side: -1 } });
    for (const sz of [-1, 1]) town.add(at(box(gy.x1 - gy.x0, gy.h, 0.3, boxMat(brickT, gy.x1 - gy.x0, gy.h)), (gy.x0 + gy.x1) / 2, gy.h / 2, sz * gy.z));
    town.add(at(box(gy.x1 - gy.x0 + 0.4, 0.25, 2 * gy.z + 0.4, M(0x4a2a22)), (gy.x0 + gy.x1) / 2, gy.h + 0.12, 0));
    town.add(flat(gy.x1 - gy.x0, 2 * gy.z, INNER(M(0x8a7c70, { unlit: 0.55 }), 'gym'), (gy.x0 + gy.x1) / 2, 0.003, 0));
    for (const sz of [-1, 1]) town.add(rot(at(new THREE.Mesh(new THREE.PlaneGeometry(gy.x1 - gy.x0 - 0.6, gy.h), INNER(mat({ map: brickT, rep: [gy.x1 - gy.x0 - 0.6, gy.h], unlit: 0.6 }), 'gym')), (gy.x0 + gy.x1) / 2, gy.h / 2, sz * (gy.z - 0.16)), 0, sz > 0 ? PI : 0, 0));
    for (let tx = gy.x0 + 1; tx < gy.x1; tx += 2.2) town.add(at(box(1.4, 0.06, 0.14, glow(0xf4f8ff, 1)), tx, gy.h - 0.3, 0.9));
    const gymIn = new THREE.Group(); town.add(gymIn);
    for (const sz of [-1, 1]) for (let wx = gy.x0 + 1.3; wx < gy.x1 - 0.8; wx += 2.4) gymIn.add(rot(at(new THREE.Mesh(new THREE.PlaneGeometry(1.6, 1.4), glow(0x9ab8d8, 0.7)), wx, 2.9, sz * (gy.z - 0.22)), 0, sz > 0 ? PI : 0, 0));
    const bags = [[-32.3, -1.3], [-32.3, 1.3], [-29.5, 3.6], [-29.5, -3.6]];   // two either side of his line, near its far end: their boxers flank his flight down the gym
    for (const [bx, bz] of bags) { gymIn.add(at(cyl(0.22, 0.22, 0.95, 8, M(0xc82a2a, { unlit: 0.15 })), bx, 1.35, bz)); gymIn.add(at(box(0.02, gy.h - 1.8, 0.02, M(0x444444)), bx, (gy.h + 1.8) / 2, bz)); }
    const boxers = [0, 1, 2].map(j => { const q = pet(4 + j, 'boxer'); const [bx, bz] = bags[j], sd = Math.sign(bz); q.g.position.set(bx, 0, bz + sd * 0.62); q.g.rotation.y = sd > 0 ? PI : 0; gymIn.add(q.g); return q; });
    gymIn.add(at(new THREE.Mesh(new THREE.PlaneGeometry(2.4, 0.5), mat({ map: sign('BOXING', '#f4f2ec', '#1a1a2a', 48, 10), unlit: 0.4 })), (gy.x0 + gy.x1) / 2, 3.9, -(gy.z - 0.17)));
    // the taxi van across the street: yellow, a checker stripe, a TAXI light, sliding doors with holes on both sides
    const cb = T.CAB, cab = new THREE.Group(); town.add(cab);
    const vanIn = M(0xb8a688, { unlit: 0.55 }); vanIn.side = THREE.DoubleSide;   // the cab lit inside: through the holes it reads as the van's inside, not a black figure
    wall('cab1', { x: cb.x - cb.w / 2, z: 0, yaw: 90, len: cb.len, H: cb.h - cb.y0, T: 0.06, kind: 'van', y0: cb.y0, town: true, inner: { m: vanIn, side: 1 } });
    wall('cab2', { x: cb.x + cb.w / 2, z: 0, yaw: 90, len: cb.len, H: cb.h - cb.y0, T: 0.06, kind: 'van', y0: cb.y0, town: true, inner: { m: vanIn, side: -1 } });
    for (const sx of [-1, 1]) {
      cab.add(rot(at(new THREE.Mesh(new THREE.PlaneGeometry(cb.len - 0.2, 0.12), mat({ map: checkT, rep: [cb.len * 2, 1], unlit: 0.4 })), cb.x + sx * (cb.w / 2 + 0.035), cb.y0 + 1.4, 0), 0, sx * PI / 2, 0));   // the taxi's checker stripe, above the holes
      for (const wz of [-1.7, 1.7]) cab.add(rot(at(new THREE.Mesh(new THREE.PlaneGeometry(1.0, 0.5), mat({ color: 0x2a3a4a, unlit: 0.25 })), cb.x + sx * (cb.w / 2 + 0.04), cb.y0 + 1.0, wz), 0, sx * PI / 2, 0));   // windows fore and aft
      for (const [dz, dy, w2, h2] of [[-1.02, 0.66, 0.03, 1.32], [1.02, 0.66, 0.03, 1.32], [0, 1.33, 2.07, 0.03]]) cab.add(rot(at(new THREE.Mesh(new THREE.PlaneGeometry(w2, h2), M(0x5a4a10)), cb.x + sx * (cb.w / 2 + 0.04), cb.y0 + dy, dz), 0, sx * PI / 2, 0));   // the sliding door's seams
    }
    cab.add(at(box(cb.w, 0.06, cb.len, M(0xe8b818)), cb.x, cb.h, 0));
    for (const sz of [-1, 1]) cab.add(at(box(cb.w, cb.h - cb.y0, 0.06, M(0xf4c41c)), cb.x, (cb.h + cb.y0) / 2, sz * cb.len / 2));
    cab.add(at(box(cb.w - 0.1, 0.05, cb.len - 0.1, M(0x2a2a30)), cb.x, cb.y0 + 0.02, 0));
    cab.add(at(box(cb.w - 0.2, 0.4, 0.5, M(0x3a3a48, { unlit: 0.2 })), cb.x, cb.y0 + 0.25, -0.9)); cab.add(at(box(cb.w - 0.2, 0.5, 0.12, M(0x3a3a48, { unlit: 0.2 })), cb.x, cb.y0 + 0.55, -1.12));
    for (const sz of [-1, 1]) for (const sx of [-1, 1]) cab.add(rot(at(cyl(0.34, 0.34, 0.24, 10, M(0x1a1a1e)), cb.x + sx * (cb.w / 2 - 0.1), 0.34, sz * 1.5), 0, 0, PI / 2));
    cab.add(at(box(0.5, 0.18, 0.28, glow(0xfff4c8, 0.9)), cb.x, cb.h + 0.12, -0.6));
    for (const sz of [-1, 1]) cab.add(at(box(cb.w * 0.8, 0.2, 0.03, glow(sz < 0 ? 0xfff0c0 : 0xff3a2a, 0.9)), cb.x, 0.85, sz * (cb.len / 2 + 0.02)));
    // the front yard: the tall picket fence, the lawn; the house with its front door (the first hole)
    wall('fence', { x: T.FENCE, z: 0, yaw: 90, len: 10, H: T.FENCE_H, T: 0.06, kind: 'picket', town: true });
    const hs = T.HOUSE;
    town.add(flat(T.FENCE - hs.x1, 10, mat({ map: grassT, rep: [4, 10] }), (T.FENCE + hs.x1) / 2, 0.003, 0));
    wall('house', { x: hs.x1, z: 0, yaw: 90, len: 2 * hs.z, H: hs.h, T: 0.18, kind: 'siding', town: true });
    for (const sz of [-1, 1]) town.add(at(box(hs.x1 - hs.x0, hs.h, 0.18, boxMat(sidingT, hs.x1 - hs.x0, hs.h)), (hs.x0 + hs.x1) / 2, hs.h / 2, sz * hs.z));
    town.add(at(box(0.18, hs.h, 2 * hs.z, boxMat(sidingT, 2 * hs.z, hs.h)), hs.x0, hs.h / 2, 0));
    const roof = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 6.6, 2.4, 4, 1), M(0x5a3a3a)); roof.rotation.y = PI / 4; roof.scale.set(0.86, 1, 1.08); town.add(at(roof, (hs.x0 + hs.x1) / 2, hs.h + 1.2, 0));
    const homeIn = new THREE.Group(); town.add(homeIn);
    homeIn.add(flat(hs.x1 - hs.x0, 2 * hs.z, mat({ map: floorT, rep: [4, 5], unlit: 0.5 }), (hs.x0 + hs.x1) / 2, 0.003, 0));
    for (const sz of [-1, 1]) homeIn.add(rot(at(new THREE.Mesh(new THREE.PlaneGeometry(hs.x1 - hs.x0 - 0.4, hs.h), mat({ map: wallpaperT, rep: [4, 1.5], unlit: 0.75 })), (hs.x0 + hs.x1) / 2, hs.h / 2, sz * (hs.z - 0.1)), 0, sz > 0 ? PI : 0, 0));
    homeIn.add(rot(at(new THREE.Mesh(new THREE.PlaneGeometry(2 * hs.z - 0.4, hs.h), mat({ map: wallpaperT, rep: [5, 1.5], unlit: 0.75 })), hs.x0 + 0.1, hs.h / 2, 0), 0, PI / 2, 0));
    const hc = new THREE.Mesh(new THREE.PlaneGeometry(hs.x1 - hs.x0, 2 * hs.z), M(0xf4e8c8, { unlit: 0.5 })); hc.rotation.x = PI / 2; homeIn.add(at(hc, (hs.x0 + hs.x1) / 2, hs.h - 0.02, 0));
    homeIn.add(at(box(0.6, 0.62, 0.45, M(0x6a4a3a)), hs.x0 + 0.45, 0.31, 0.0)); homeIn.add(at(cyl(0.05, 0.08, 0.3, 6, M(0x3a3a3a)), hs.x0 + 0.45, 0.77, 0.0));
    homeIn.add(at(cyl(0.17, 0.27, 0.32, 8, glow(0xfff6d8, 1)), hs.x0 + 0.45, 1.06, 0.0));   // a table lamp at the back of the room on the line: the light at the tunnel's end
    homeIn.add(rot(at(new THREE.Mesh(new THREE.CircleGeometry(0.62, 16), mat({ color: 0xfffaf0, unlit: 1, see: 0.25 })), hs.x0 + 0.75, 1.02, 0.0), 0, PI / 2, 0));
    const bedG = new THREE.Group(); homeIn.add(bedG); bedG.position.set(T.BED[0], 0, T.BED[1]);
    bedG.add(at(cyl(0.62, 0.66, 0.16, 10, M(0x4a8ac8)), 0, 0.08, 0)); bedG.add(at(cyl(0.5, 0.5, 0.06, 10, M(0x8ac0e8)), 0, 0.15, 0));
    homeIn.add(rot(at(new THREE.Mesh(new THREE.PlaneGeometry(0.56, 0.7), mat({ map: photoT, unlit: 0.55 })), hs.x1 - 0.13, 1.22, 1.15), 0, -PI / 2, 0)); homeIn.add(rot(at(box(0.62, 0.76, 0.02, M(0xd8b048, { unlit: 0.3 })), hs.x1 - 0.1, 1.22, 1.15), 0, -PI / 2, 0));
    homeIn.add(at(box(2.0, 0.42, 0.8, M(0x8a4a6a)), hs.x0 + 2.6, 0.21, -(hs.z - 0.7))); homeIn.add(at(box(2.0, 0.5, 0.2, M(0x8a4a6a)), hs.x0 + 2.6, 0.55, -(hs.z - 0.3)));
    homeIn.add(at(cyl(0.02, 0.02, 1.5, 4, M(0x3a3a3a)), hs.x0 + 0.8, 0.75, -(hs.z - 0.8))); homeIn.add(at(cyl(0.18, 0.28, 0.32, 8, glow(0xfff0c0, 0.8)), hs.x0 + 0.8, 1.55, -(hs.z - 0.8)));
    // street lamps along the street (off the line), facades beyond for the reverse angles
    const lampM = glow(0xfff0c0, 1);
    const poolM = mat({ color: 0xffe8b0, unlit: 0.9 });
    for (const [lx, lz] of [[-13, -4.2], [-24, -4.2], [-39, -4.2], [-46, -4.2]]) { const pl = new THREE.Mesh(new THREE.CircleGeometry(1.3, 12), poolM); pl.rotation.x = -PI / 2; pl.position.set(lx, 0.006, lz); town.add(pl); }
    for (const lx of [-13, -24, -39, -46]) { town.add(at(cyl(0.05, 0.07, 4.2, 6, M(0x2a2a30)), lx, 2.1, -5.2)); town.add(at(box(0.5, 0.15, 0.3, lampM), lx, 4.2, -5.0)); }
    for (let i = 0; i < 9; i++) { const fx = -56 + i * 6.6, fh = 6 + 5 * hash(i, 5470), fm = mat({ map: k.facade('#3a3448', 54 + i, 0.4), rep: [2, fh / 3] }); town.add(at(new THREE.Mesh(new THREE.BoxGeometry(5.8, fh, 3), fm), fx, fh / 2, -11)); town.add(at(new THREE.Mesh(new THREE.BoxGeometry(5.8, fh + 2, 3), fm), fx + 2, fh / 2 + 1, 11)); }

    // ================= lights =================
    function light(P, s, bt) {
      const zone = P.zone || 'prom', h = Math.exp(-fr(bt) * 4);
      if (zone === 'street') { lights(0x5a6490, 0xa8b4e8, [0.4, -0.6, 0.5], 0x141a34, [18, 80], 9); pt(0, -13, 4.0, -4.6, 0.9, 0.78, 0.5); pt(1, -24, 4.0, -4.6, 0.9, 0.78, 0.5); pt(2, -39, 4.0, -4.6, 0.9, 0.78, 0.5); pt(3, -46, 4.0, -4.6, 0.9, 0.78, 0.5); }
      else if (zone === 'home') { lights(0x5a4c40, 0xffd8a0, [0.3, -0.6, 0.6], 0x1e1a14, [12, 60], 7); pt(0, T.HOUSE.x0 + 0.8, 1.7, -(T.HOUSE.z - 0.8), 0.95, 0.78, 0.48); pt(1, T.HOUSE.x0 + 4, 2.6, 0, 0.5, 0.42, 0.34); }
      else if (zone === 'gym') { lights(0x6a7484, 0xe8f0f8, [0.2, -0.8, 0.4], 0x1a1e26, [18, 70], 8); pt(0, -30, 3.8, 0, 0.75, 0.82, 0.9); pt(1, -27.5, 3.8, 2.5, 0.5, 0.55, 0.6); }
      else if (zone === 'diner') { lights(0x806868, 0xfff0dc, [0.2, -0.7, 0.5], 0x201418, [18, 70], 8); pt(0, -19, 3.0, 0, 0.95, 0.85, 0.75); pt(1, -17, 2.6, 2.6, 0.6, 0.4, 0.5); }
      else {
        lights(0x6a5a8c, 0xffc0dc, [0.25, -0.5, 0.75], 0x1a1428, P.townLit ? [60, 160] : [22, 80], 10);   // the tunnel: no fog on the house 47 m off (it dithered the end away)
        pt(0, -4.5, 4.4, 2.0, 0.85 * (0.75 + 0.25 * h), 0.3, 0.6); pt(1, 4.0, 4.4, -2.0, 0.25, 0.6 * (0.75 + 0.25 * h), 0.95);
        pt(2, S.DISCO[0], 4.6, S.DISCO[2], 0.72, 0.62, 0.55); pt(3, S.STAGE.x0 + 1, 2.6, 0, 0.6, 0.35, 0.55);
      }
      if (P.key) pt(3, P.key[0], P.key[1], P.key[2], P.key[3], P.key[4], P.key[5]);
    }

    G.updateMatrixWorld(true);
    const inG = new Set([homeIn, gymIn, dinIn]), inM = new Set(INNERS.map(e => e[0])), cc = new THREE.Vector3();
    const ownerAt = (x, z) => (x > -56.3 && x < -47.7 && Math.abs(z) < 5.3) ? 'home' : (x > -34.3 && x < -25.7 && Math.abs(z) < 5.3) ? 'gym' : (x > -22.35 && x < -15.65 && Math.abs(z) < 4.3) ? 'diner' : 'street';
    for (const g of [town, ...TOWN_W]) g.traverse(o => {
      if (!o.material || !o.geometry) return;
      let inner = false; for (let q = o; q; q = q.parent) if (inG.has(q)) { inner = true; break; }
      if (!o.geometry.boundingBox) o.geometry.computeBoundingBox();
      o.geometry.boundingBox.getCenter(cc); o.localToWorld(cc); const own = ownerAt(cc.x, cc.z);
      [].concat(o.material).forEach(m => { if (m.uniforms && m.uniforms.uUnlit && !OWN.has(m)) OWN.set(m, [own, inner || inM.has(m), m.uniforms.uUnlit.value, m.uniforms.uCol.value.clone()]); });
    });
    return {
      group: G, sky: null, shadowCol: 0x6a4a3a, shadowY: 0.03, indoor: true,
      light() { light({}, 0, 0); },
      anim(t, P = {}) {
        const s = shotT(t, P), hide = new Set(P.hide || []), stopAt = P.stop === true ? -99 : P.stop;
        const tt = stopAt != null && s > stopAt ? t - (s - stopAt) : t, bt = beat(tt);
        light(P, s, bt);
        const zn = P.zone || 'prom';   // the street lights the outsides, a building its own walls and rooms, the prom none (the night through a hole) unless `townLit` (the tunnel: the walls); lamps stay on
        const hideTown = zn === 'prom' && !P.townLit; town.visible = !hideTown; TOWN_W.forEach(w => { w.visible = !hideTown; });
        const litB = new Set(P.lit || []);
        OWN.forEach(([own, inner, u, col], m) => { const on = (inner && u >= 0.95) || litB.has(own) || (zn === 'street' ? !inner : zn === 'prom' ? (!!P.townLit && !inner) : own === zn); m.uniforms.uUnlit.value = on ? u : u * 0.15; m.uniforms.uCol.value.copy(col).multiplyScalar(on ? 1 : 0.3); });
        // the holes
        const H2 = P.holes || {}, CR = P.crack || {}, PL = new Set(P.planks || []);
        for (const [id, q] of Object.entries(holeState)) {
          const sh = stopAt != null && s > stopAt ? stopAt : s, b0 = H2[id], burst = b0 != null && sh >= b0, e = burst ? sh - b0 : -1;
          let jit = 0;
          if (!burst && CR[id]) { const [c0, c1] = CR[id], u = cl((sh - c0) / Math.max(0.01, c1 - c0)); q.cracks.forEach((c, i) => { c.visible = u > 0 && i < u * q.cracks.length; }); jit = u > 0 ? 0.012 * Math.sin(sh * 70) * u : 0; }
          else q.cracks.forEach(c => { c.visible = false; });
          q.plug.visible = !burst; q.plug.position.z = jit;
          q.planks.forEach(p => { p.visible = PL.has(id); });
          q.debris.forEach(d => {
            d.m.visible = burst; if (!burst) return;
            const g = 9.8, [vx, vy, vz] = d.v, [x0, y0, z0] = d.p0, floor = q.floor + d.size * 0.3;
            const tl = (vy + Math.sqrt(vy * vy + 2 * g * Math.max(0, y0 - floor))) / g, ee = Math.min(e, tl);
            d.m.position.set(x0 + vx * ee, y0 + vy * ee - 0.5 * g * ee * ee, z0 + vz * ee);
            if (e < tl) d.m.rotation.set(d.spin[0] * ee, d.spin[1] * ee, d.spin[2] * ee);
            else { d.m.rotation.set(0, d.spin[1] * tl, 0); d.m.position.y = floor; }
          });
          q.dust.forEach((d, i) => {
            const de = e - 0.02 * i; d.d.visible = burst && de >= 0 && de < 1.1; if (!d.d.visible) return;
            d.d.position.set(d.p[0] + d.v[0] * de, d.p[1] + d.v[1] * de, d.p[2] + d.v[2] * de); d.d.scale.setScalar(Math.max(0.01, 1.6 * (1 - de / 1.1)));
          });
        }
        // the gym
        doorG.forEach((h, j) => { h.rotation.y = (j ? 1 : -1) * 2.95 * cl(ramp(P.doors, s)); });
        archG.visible = !hide.has('arch'); dj.g.visible = deckG.visible = !hide.has('dj'); punchG.visible = !hide.has('punch'); bleachG.visible = !hide.has('bleach');
        discoG.visible = !hide.has('ball'); discoG.rotation.y = tt * 1.1;
        reset(dj); pose(dj, 'dance', bt, tt, 3, 0, 0, P, 0);
        bulbs.forEach((q, j) => { q.visible = (Math.floor(bt * 2) + j) % 3 !== 0; });
        const inProm = (P.zone || 'prom') === 'prom';
        spots.forEach((q, j) => {
          q.visible = inProm && !hide.has('ball') && !hide.has('spots'); if (!q.visible) return;
          const a = j * 2.399 + tt * 1.1, ev = 0.25 + 0.5 * hash(j, 5481), dx = Math.sin(a), dz2 = Math.cos(a), dy = -0.95 + 1.3 * ev, o = S.DISCO;
          let u = 99; if (dy < 0) u = Math.min(u, -o[1] / dy);
          if (dx > 0) u = Math.min(u, (S.X1 - 0.02 - o[0]) / dx); else if (dx < 0) u = Math.min(u, (S.X0 + 0.15 - o[0]) / dx);
          if (dz2 > 0) u = Math.min(u, (S.Z1 - 0.02 - o[2]) / dz2); else if (dz2 < 0) u = Math.min(u, (S.Z0 + 0.02 - o[2]) / dz2);
          const px2 = o[0] + dx * u, py = o[1] + dy * u, pz = o[2] + dz2 * u; q.position.set(px2, Math.max(0.012, py), pz);
          if (py <= 0.02) q.rotation.set(-PI / 2, 0, 0); else if (Math.abs(px2) > S.X1 - 0.3) q.rotation.set(0, px2 > 0 ? -PI / 2 : PI / 2, 0); else q.rotation.set(0, pz > 0 ? PI : 0, 0);
        });
        const gm = P.noguests ? false : (P.guests ?? 'dance');
        guests.forEach((q, i) => {
          const mode = (P.gmode && P.gmode[i] !== undefined) ? P.gmode[i] : gm, spot = P.gspots ? P.gspots[i] : GUEST_SPOTS[i];
          q.g.visible = !!mode && !!spot && !cleared(P, spot ? spot[0] : 0, spot ? spot[1] : 0);
          if (!q.g.visible) return;
          reset(q);
          const [x, z, yawD] = spot, yaw = yawD != null ? yawD * PI / 180 : Math.atan2(0 - x, 0 - z);
          q.g.position.set(x, 0, z); q.g.rotation.y = yaw; pose(q, mode, bt, tt, i, x, z, P, yaw);
        });
        // the town's box pets: boxers punch their bags, the couple sips until the dog flies over their table
        boxers.forEach((q, i) => { reset(q); pose(q, P.boxers || 'punch', bt, tt, i, q.g.position.x, q.g.position.z, P, q.g.rotation.y); });
        couple.forEach((q, i) => { reset(q); pose(q, P.couple || 'sip', bt, tt, i, q.g.position.x, q.g.position.z, P, q.g.rotation.y); });
        shake.visible = P.shake !== false; boothG.visible = !hide.has('booth'); neonG.visible = !hide.has('neon');
        // hearts: looping over points, or falling round one (the falling heart)
        hearts.forEach(h => { h.visible = false; });
        let n = 0;
        (P.hearts || []).forEach(([x, y, z, s0 = 0]) => { for (let j = 0; j < 3 && n < hearts.length; j++, n++) { const h = hearts[n], u = fr((s - s0) * 0.8 + j / 3); h.visible = s >= s0; h.position.set(x + 0.18 * Math.sin(u * 5 + j), y + u * 0.7, z); h.scale.setScalar(0.1 + 0.05 * Math.sin(u * PI)); h.rotation.set(0, (P.heartYaw || 0) * PI / 180, 0); } });
        if (P.rain) { const [r0, rx, rz] = P.rain; for (let j = 0; n < hearts.length; j++, n++) { const h = hearts[n], u = fr((s - r0) * 0.5 + j * 0.137); h.visible = s >= r0; h.position.set(rx + 1.4 * (hash(j, 5490) - 0.5), 3.2 - 3.0 * u, rz + 1.4 * (hash(j, 5491) - 0.5)); h.scale.setScalar(0.11); h.rotation.set(0, (P.heartYaw || 0) * PI / 180, 0.4 * Math.sin(u * 9 + j)); } }
      },
    };
  }
  return { prom: prom() };
}
