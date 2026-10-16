// maps53.js: the "As It Was" map (2026-10-17, Harry Styles, 2022; the clip: a man in a red sequin jumpsuit and a woman
// in blue sequins dance a push-and-pull duet on a white disc in a white hall; London's Barbican, its concrete towers, a
// crowd in winter coats, rain on its terraces). Same contract as the other map files, pure in t:
//   petflat   Sadi's flat high in a concrete block at dusk (y = 0; x +-5.8, z -4.6..6.0, 3.4 m high): pale parquet,
//             white walls, a big window in the back wall on the towers and balconies at dusk (WIN), a low mustard sofa
//             under it (SOFA, seat SEAT_Y 0.2), the coffee table (TABLE, top TABLE_Y 0.3), the round white rug with a black
//             ring in the middle (RUG, the clip's disc), the front door in the left wall (DOOR, swinging in: `door` 0-1 or a
//             ramp) with a brass bell over it (`bell` [s]: it shakes and rings), the dog's round red bed beside it (BED,
//             cushion BED_Y 0.1), the cat tree in the back right corner (TREE, its top TREE_Y 1.3), a closet beside the front
//             door (CLOSET, `closet` 0-1 or a ramp), the kitchen counter along the right wall (COUNTER), a side table with a
//             red landline (PHONE; `ring` [s]: the handset rattles and rings; `handset` false: it's in a paw), a floor
//             lamp and a monstera; the pet cam on a shelf high on the front wall (CAMDEV, aimed at CAMLOOK; `camLight`
//             true | s | [s0, s1]: its LED red, the owner watching).
//             The party: `party` (streamers, bunting, balloons, string lights, the disco ball DISCO turning with its light
//             spots, pink and cyan lights) and `mess` (0-1: confetti, red cups, pizza boxes on the table, the pillows on
//             the floor; `pizza` false: no boxes); box-pet guests in party hats: `guests` a mode for all or `gmode` [n] per
//             guest: dance, freeze (the dance pose, held), lamp (a lampshade on its head, stiff), plant (a potted monstera
//             held on its head), hide (crouched: behind the sofa its ears and hat show over the back), pizza (a slice at
//             its mouth), cheer, gasp, stare (`stare` [x, z]), flee, spill (lying in a heap), courier (a tall stack of
//             pizza boxes), conga, false; `gspots` [[x, z, yaw?] | null] places them, else round the rug (FLAT_PARTY);
//             `stop` (s: the disco ball, the lights and every guest freeze: the red light came on); `closetFull` (guests
//             crammed inside the closet); `spill` (s: they tumble out of it and lie in a heap in front of it); `drawn` (the
//             curtains shut) + `feet` (n pairs of feet under them); `hearts` [[x, y, z, s0]] + `heartYaw`; `zone` 'party' |
//             'tidy'; `hide` ['sofa', 'table', 'tree', 'bed', 'lamp', 'plant', 'disco', 'phone', 'cam', 'counter',
//             'rug', 'mullion' (the window's centre upright)]; `clear` [[x, z, r]]; `noguests`; `key` [x, y, z, r, g, b].
import { mapKit } from './mapkit.js';

export const FLAT = {
  X: 5.8, Z0: -4.6, Z1: 6.0, H: 3.4,
  WIN: { x0: -2.4, x1: 2.4, y0: 0.75, y1: 2.95 },
  SOFA: [0, -3.55], SOFA_W: 2.6, SEAT_Y: 0.2, BACK_Y: 0.78,
  TABLE: [0, -2.15], TABLE_Y: 0.3,
  RUG: [0, 0.3], RUG_R: 1.65,
  DOOR: { x0: -2.4, x1: -1.2, y1: 2.2 },        // in the front wall (z = Z1), hinged at x0, swinging into the room
  BED: [-1.6, 2.5], BED_Y: 0.1,                 // in front of the front door, under the pet cam
  TREE: [2.75, -3.45], TREE_Y: 1.0,
  CLOSET: { x0: -3.8, x1: -2.6, y1: 2.2 },      // in the front wall too, left of the door, hinged at x1: a frame from the room holds the front door, the closet and the bed
  COUNTER: [5.15, 5.8, 1.4, 4.4], COUNTER_Y: 0.9,
  PHONE: [1.78, -3.55], PHONE_Y: 0.5,
  LAMP: [-1.85, -3.9], PLANT: [-3.0, -3.95],
  CAMDEV: [-1.8, 2.62, 5.74], CAMLOOK: [-0.5, 0.3, -0.8],   // over the front door, looking down the room: the bed below, the rug, the sofa and the tree beyond
  DISCO: [0, 2.95, 0.3],
  BOUNCER: [-3.0, 4.6],
};
// the guests' party spots at the rug's sides (x, z), facing its middle: the front (+z, the lenses' side) and the back (the table, the sofa) left open
export const FLAT_PARTY = [[2.5, 1.6], [2.8, 0.4], [2.6, -0.8], [2.2, -1.9], [-2.3, 1.3], [-2.8, 0.1], [-2.6, -1.1], [-2.1, -2.2], [3.6, -1.6], [-3.7, -0.7], [3.9, 0.9], [-3.8, 0.9], [4.2, -2.6], [-1.4, -2.85]];

export function buildFlatMaps(K) {
  const k = mapKit(K);
  const { THREE, mat, tex, px, noise, box, TAU, PI, beat, hash, fr, cyl, cone, ico, at, rot, flat, lights, pt } = k;
  const M = (c, o = {}) => mat({ color: c, ...o }), glow = (c, u = 1) => mat({ color: c, unlit: u });
  const cl = x => Math.max(0, Math.min(1, x)), sm = x => { x = cl(x); return x * x * (3 - 2 * x); };
  const ramp = (v, s) => Array.isArray(v) ? v[2] + (v[3] - v[2]) * sm((s - v[0]) / Math.max(0.01, v[1] - v[0])) : (v === true ? 1 : (v || 0));
  const shotT = (t, P) => P.t0 != null ? t - P.t0 : 0;
  const cleared = (P, x, z) => (P.clear || []).some(([cx, cz, r]) => (x - cx) ** 2 + (z - cz) ** 2 < r * r);
  const offset = m => { m.polygonOffset = true; m.polygonOffsetFactor = -2; m.polygonOffsetUnits = -4; return m; };
  const S = FLAT, PARTY = FLAT_PARTY;
  const WOOD = M(0x8a5a34), BRASS = M(0xd8b048, { unlit: 0.3 }), DARK = M(0x2a2a30), WHITE = M(0xf6f4ee, { unlit: 0.08 });

  // ---------- textures ----------
  const floorT = tex(16, 16, (x, r) => { px(x, '#d2ae80', 0, 0, 16, 16); for (let yy = 0; yy < 16; yy += 4) px(x, '#c29e70', 0, yy, 16, 1); for (let i = 0; i < 6; i++) px(x, '#c6a274', Math.floor(r() * 16), Math.floor(r() * 4) * 4 + 1, 1, 3); noise(x, r, 16, 16, ['rgba(90,60,30,.05)'], 30); }, 5301);   // pale oak boards, low contrast
  const wallT = tex(32, 64, (x, r) => { px(x, '#f2efe8', 0, 0, 32, 64); noise(x, r, 32, 64, ['rgba(120,110,90,.035)'], 50); px(x, '#e0dacd', 0, 58, 32, 6); px(x, '#d2cbbc', 0, 57, 32, 1); }, 5302);   // white walls, a skirting board
  const ceilT = tex(8, 8, x => { px(x, '#f6f4ee', 0, 0, 8, 8); }, 5303);
  const rugT = tex(64, 64, x => {
    px(x, '#f4f2ec', 0, 0, 64, 64);
    x.strokeStyle = '#2a2a2e'; x.lineWidth = 2.2; x.beginPath(); x.arc(32, 32, 27.5, 0, TAU); x.stroke();   // the clip's disc: white with a black ring
  }, 5304);
  const towersT = tex(96, 64, (x, r) => {
    const g = x.createLinearGradient(0, 0, 0, 64); g.addColorStop(0, '#1e2a5a'); g.addColorStop(0.5, '#7a5a8a'); g.addColorStop(0.8, '#e88a6a'); g.addColorStop(1, '#f2b07a'); x.fillStyle = g; x.fillRect(0, 0, 96, 64);
    const tower = (x0, w, top) => {   // a concrete tower: grey slabs, balconies as pale stripes, lit windows
      px(x, '#4a4c54', x0, top, w, 64 - top);
      for (let yy = top + 2; yy < 62; yy += 3) { px(x, '#6a6c74', x0, yy, w, 1); for (let xx = x0 + 1; xx < x0 + w - 1; xx += 3) if (r() < 0.38) px(x, r() < 0.7 ? '#ffd890' : '#fff2c8', xx, yy + 1, 2, 1); }
      px(x, '#3a3c44', x0 + w - 1, top, 1, 64 - top);
    };
    tower(6, 16, 6); tower(40, 14, 12); tower(70, 18, 4);
    px(x, '#3e4048', 0, 48, 96, 16); for (let xx = 1; xx < 96; xx += 4) for (let yy = 50; yy < 63; yy += 3) if (r() < 0.45) px(x, '#ffd890', xx, yy, 2, 1);   // the low block across the courtyard
  }, 5305);
  const photoT = tex(16, 20, x => { px(x, '#f2a0c0', 0, 0, 16, 20); px(x, '#a8d8f0', 2, 2, 12, 16); px(x, '#9a9aa4', 3, 9, 4, 6); px(x, '#3a2a20', 9, 8, 4, 7); px(x, '#ff6aa0', 10, 7, 2, 2); }, 5306);   // a photo of Sadi with the dog
  const boxT = tex(16, 16, x => { px(x, '#e8d6b0', 0, 0, 16, 16); px(x, '#d8442a', 4, 5, 8, 6); px(x, '#f2e6c8', 6, 7, 4, 2); }, 5307);   // a pizza box, a red logo

  // ---------- box-pet guests in party hats ----------
  const FURS = [0xf2eee6, 0xd8a868, 0x9a9aa4, 0xe8c090, 0x8a7a6c, 0xc8b8a8, 0x6a5a4c, 0xe0d0b8];
  const TOPS = [0x5a7ad8, 0xe86a8a, 0x6ac0a0, 0xd8b04a, 0x9a6ad0, 0x4a4a58, 0xe8884a];
  const HATS = [0xff5fa2, 0x4ad0e8, 0xffd43b, 0x8aff8a, 0xb07aff];
  const potM = M(0xc8643a), boxM = mat({ map: boxT, unlit: 0.2 }), cheeseM = M(0xffd060, { unlit: 0.35 });
  const leafM = mat({ color: 0x3a9a4a, unlit: 0.15, side: THREE.DoubleSide }), shadeM = mat({ color: 0xf4e6c4, unlit: 0.45, side: THREE.DoubleSide });
  function pet(i) {
    const g = new THREE.Group(), F = M(FURS[i % FURS.length]), ears = i % 3, body = new THREE.Group(); g.add(body);
    const top = M(TOPS[i % TOPS.length]);
    const legs = [-1, 1].map(sx => { const l = at(new THREE.Group(), sx * 0.1, 0.3, 0); l.add(at(box(0.13, 0.3, 0.13, M(0x3a3e4a)), 0, -0.15, 0)); body.add(l); return l; });
    body.add(at(box(0.4, 0.38, 0.28, top), 0, 0.52, 0));
    const arms = [-1, 1].map(sx => { const a = at(new THREE.Group(), sx * 0.23, 0.66, 0); a.add(at(box(0.09, 0.28, 0.09, top), 0, -0.12, 0)); a.add(at(box(0.08, 0.08, 0.08, F), 0, -0.28, 0)); body.add(a); return a; });
    const slice = at(new THREE.Group(), 0, -0.34, 0.02); arms[1].add(slice);   // a pizza slice in the right paw (pizza mode)
    const sw = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.13, 0.025, 4, 1, false, -0.42, 0.84), cheeseM); sw.rotation.x = PI / 2; sw.position.y = -0.13; slice.add(sw); slice.rotation.x = PI;
    const stack = at(new THREE.Group(), 0, 0.6, 0.3); body.add(stack);   // the courier's pizza boxes
    for (let j = 0; j < 5; j++) stack.add(at(box(0.44, 0.07, 0.44, boxM), 0, j * 0.075, 0));
    const head = at(new THREE.Group(), 0, 0.94, 0); body.add(head);
    const skull = ico(0.24, 1, F); skull.scale.set(1, 0.9, 0.92); head.add(skull);
    const snout = at(ico(0.1, 1, M(0xf0e6d8)), 0, -0.07, 0.19); snout.scale.set(1.1, 0.8, 0.9); head.add(snout);
    head.add(at(ico(0.035, 0, M(0x151515)), 0, -0.03, 0.28));
    const mouth = at(box(0.09, 0.07, 0.02, M(0x5a1a1a)), 0, -0.13, 0.25); mouth.visible = false; head.add(mouth);
    for (const e of [-1, 1]) {
      head.add(at(ico(0.038, 0, M(0x0e0e0e)), e * 0.1, 0.05, 0.19)); head.add(at(ico(0.012, 0, glow(0xffffff)), e * 0.1 + 0.012, 0.065, 0.225));
      head.add(ears === 0 ? rot(at(cone(0.08, 0.2, 4, F), e * 0.15, 0.27, 0), 0, 0, -e * 0.25) : ears === 1 ? at(box(0.08, 0.3, 0.06, F), e * 0.1, 0.33, 0) : rot(at(box(0.07, 0.24, 0.16, F), e * 0.24, 0.02, 0), 0, 0, e * 0.3));
    }
    const hat = rot(at(cone(0.085, 0.24, 6, M(HATS[i % HATS.length], { unlit: 0.3 })), 0.06, 0.3, 0), 0, 0, -0.22); head.add(hat);
    const shade = at(new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.32, 0.36, 8, 1, true), shadeM), 0, 0.12, 0); head.add(shade);   // lamp mode: the shade down over the head to the snout
    const plant = new THREE.Group(); head.add(plant); plant.scale.setScalar(1.45); plant.add(at(cyl(0.14, 0.11, 0.2, 7, potM), 0, 0.34, 0));   // big enough to read on the feed
    for (let j = 0; j < 5; j++) { const lf = at(new THREE.Mesh(new THREE.CircleGeometry(0.16, 6), leafM), Math.sin(j * 1.26) * 0.12, 0.62 + 0.04 * (j % 2), Math.cos(j * 1.26) * 0.12); lf.rotation.set(-0.9 + 0.3 * Math.cos(j * 1.26), j * 1.26, 0); plant.add(lf); }
    return { g, body, head, arms, legs, mouth, hat, shade, plant, slice, stack, i };
  }
  const reset = q => {
    q.body.position.set(0, 0, 0); q.body.rotation.set(0, 0, 0); q.head.rotation.set(0, 0, 0); q.mouth.visible = false;
    q.arms.forEach(a => a.rotation.set(0, 0, 0)); q.legs.forEach(l => l.rotation.set(0, 0, 0));
    q.hat.visible = true; q.shade.visible = false; q.plant.visible = false; q.slice.visible = false; q.stack.visible = false;
  };
  const turnTo = (q, x, z, P, yaw) => { if (!P.stare) return; const a = Math.atan2(P.stare[0] - x, P.stare[1] - z) - yaw; q.head.rotation.y = Math.max(-1.2, Math.min(1.2, Math.atan2(Math.sin(a), Math.cos(a)))); };
  function pose(q, mode, bt, tt, i, x, z, P, yaw) {   // one guest's pose (bt: the beat clock, frozen by `stop`)
    const ph = i * 0.37, b = Math.abs(Math.sin((bt + ph) * PI));
    if (mode === 'dance' || mode === 'freeze') {   // paws up overhead on the beat (never level: a level arm reads as a T-pose)
      q.body.position.y = 0.06 * b; q.body.rotation.z = 0.12 * Math.sin((bt + ph) * PI);
      q.arms.forEach((a, j) => a.rotation.set(-2.55 - 0.3 * Math.sin((bt + ph) * PI + j * PI), 0, (j ? -1 : 1) * 0.28));
      q.head.rotation.z = 0.15 * Math.sin((bt + ph) * PI); q.mouth.visible = i % 2 === 0;
    } else if (mode === 'lamp') { q.hat.visible = false; q.shade.visible = true; }
    else if (mode === 'plant') { q.hat.visible = false; q.plant.visible = true; q.arms.forEach((a, j) => a.rotation.set(-2.95, 0, (j ? -1 : 1) * 0.18)); }
    else if (mode === 'hide') { q.body.position.y = -0.15; q.legs.forEach(l => { l.rotation.x = -1.2; }); turnTo(q, x, z, P, yaw); }   // eyes and ears peeking over whatever hides it
    else if (mode === 'pizza') { q.slice.visible = true; q.arms[1].rotation.set(-2.25, 0, -0.42); q.head.rotation.x = -0.12; q.mouth.visible = true; q.body.position.y = 0.03 * b; }
    else if (mode === 'cheer') { q.arms.forEach((a, j) => a.rotation.set(0, 0, (j ? 1 : -1) * 2.45)); q.mouth.visible = true; q.body.position.y = 0.05 * b; }
    else if (mode === 'gasp') { q.arms.forEach((a, j) => a.rotation.set(-2.35, 0, (j ? -1 : 1) * 0.35)); q.mouth.visible = true; turnTo(q, x, z, P, yaw); }
    else if (mode === 'stare') turnTo(q, x, z, P, yaw);
    else if (mode === 'flee') { const s2 = Math.sin(tt * 11 + ph * 7); q.body.rotation.x = 0.28; q.legs.forEach((l, j) => { l.rotation.x = (j ? 1 : -1) * 0.75 * s2; }); q.arms.forEach((a, j) => a.rotation.set((j ? -1 : 1) * 0.9 * s2 - 0.3, 0, 0)); q.mouth.visible = true; }
    else if (mode === 'spill') { q.body.rotation.set(-PI / 2 + 0.25 * (hash(i, 5361) - 0.5), 0, (hash(i, 5362) - 0.5) * 0.8); q.body.position.set(0, 0.2, 0.05); q.arms.forEach((a, j) => a.rotation.set(-2.6 + 0.6 * hash(i, j, 5363), 0, (j ? -1 : 1) * 0.5)); q.legs.forEach((l, j) => { l.rotation.x = -0.5 - 0.4 * hash(i, j, 5364); }); q.mouth.visible = true; }
    else if (mode === 'courier') { q.stack.visible = true; q.arms.forEach((a, j) => a.rotation.set(-1.4, 0, (j ? -1 : 1) * 0.08)); }
    else if (mode === 'conga') { q.arms.forEach((a, j) => a.rotation.set(-1.35, 0, (j ? -1 : 1) * 0.1)); const kk = Math.floor(bt) % 2; q.legs[kk].rotation.z = (kk ? -1 : 1) * 0.6 * Math.max(0, Math.sin(fr(bt) * PI)); q.body.position.y = 0.04 * b; q.mouth.visible = true; }
  }

  function petflat() {
    const G = new THREE.Group();
    const W = 2 * S.X, D = S.Z1 - S.Z0, ZC = (S.Z0 + S.Z1) / 2;
    G.add(flat(W, D, mat({ map: floorT, rep: [W / 2, D / 2] }), 0, 0, ZC));
    const wallM = (w, h) => mat({ map: wallT, rep: [Math.max(0.2, w / 2.2), h / S.H], unlit: 0.04 });
    const panel = (w, h, x, y, z, ry) => { const p = new THREE.Mesh(new THREE.PlaneGeometry(w, h), wallM(w, h)); p.position.set(x, y, z); p.rotation.y = ry; G.add(p); return p; };
    const frameM = M(0xe8e4dc);
    // the back wall round the window, the towers outside
    const { x0: wx0, x1: wx1, y0: wy0, y1: wy1 } = S.WIN;
    panel(wx0 + S.X, S.H, (-S.X + wx0) / 2, S.H / 2, S.Z0, 0); panel(S.X - wx1, S.H, (S.X + wx1) / 2, S.H / 2, S.Z0, 0);
    panel(wx1 - wx0, wy0, 0, wy0 / 2, S.Z0, 0); panel(wx1 - wx0, S.H - wy1, 0, (S.H + wy1) / 2, S.Z0, 0);
    G.add(at(box(wx1 - wx0 + 0.16, 0.08, 0.2, frameM), 0, wy0 - 0.02, S.Z0 + 0.06)); G.add(at(box(wx1 - wx0 + 0.16, 0.06, 0.12, frameM), 0, wy1, S.Z0 + 0.02));
    // the window's three uprights; hide 'mullion' takes the centre one away (from a low lens it ran into a head)
    const mullions = [wx0, 0, wx1].map(x => { const q = at(box(0.07, wy1 - wy0, 0.1, frameM), x, (wy0 + wy1) / 2, S.Z0 + 0.02); G.add(q); return q; });
    G.add(at(new THREE.Mesh(new THREE.PlaneGeometry(34, 18), mat({ map: towersT, unlit: 0.95, nofog: true })), 0, 4.2, S.Z0 - 7));
    // the left and right walls; the front wall round the front door and the closet beside it (the pet cam over the door)
    const { x0: dx0, x1: dx1, y1: dy1 } = S.DOOR, { x0: cx0, x1: cx1, y1: cy1 } = S.CLOSET;
    panel(D, S.H, -S.X, S.H / 2, ZC, PI / 2); panel(D, S.H, S.X, S.H / 2, ZC, -PI / 2);
    const holes = [[dx0, dx1], [cx0, cx1]].sort((a, b) => a[0] - b[0]); let wx = -S.X;
    for (const [a, b] of holes) { if (a > wx) panel(a - wx, S.H, (wx + a) / 2, S.H / 2, S.Z1, PI); wx = b; }
    panel(S.X - wx, S.H, (wx + S.X) / 2, S.H / 2, S.Z1, PI);
    panel(dx1 - dx0, S.H - dy1, (dx0 + dx1) / 2, (S.H + dy1) / 2, S.Z1, PI); panel(cx1 - cx0, S.H - cy1, (cx0 + cx1) / 2, (S.H + cy1) / 2, S.Z1, PI);
    const hall = new THREE.Group(); G.add(hall);   // the building's corridor behind the front door
    const concM = M(0xa8a6a0, { unlit: 0.15 }), hx = (dx0 + dx1) / 2;
    hall.add(at(box(3.4, 0.05, 2.6, M(0x7a7872)), hx, -0.02, S.Z1 + 1.3)); hall.add(at(box(3.4, 2.7, 0.05, concM), hx, 1.35, S.Z1 + 2.6));
    hall.add(at(box(0.05, 2.7, 2.6, concM), hx - 1.7, 1.35, S.Z1 + 1.3)); hall.add(at(box(0.05, 2.7, 2.6, concM), hx + 1.7, 1.35, S.Z1 + 1.3)); hall.add(at(box(0.6, 0.05, 0.3, glow(0xfff0c8, 0.9)), hx, 2.62, S.Z1 + 1.2));
    const doorHinge = at(new THREE.Group(), dx0, 0, S.Z1 - 0.03); G.add(doorHinge);
    doorHinge.add(at(box(dx1 - dx0 - 0.02, dy1 - 0.02, 0.05, M(0x2a7a8a)), (dx1 - dx0) / 2, (dy1 - 0.02) / 2, 0));
    doorHinge.add(at(ico(0.04, 0, BRASS), dx1 - dx0 - 0.12, 1.0, -0.06));
    G.add(at(box(dx1 - dx0 + 0.16, 0.08, 0.06, frameM), hx, dy1 + 0.04, S.Z1 - 0.02));
    const bellG = at(new THREE.Group(), dx1 + 0.35, 2.05, S.Z1 - 0.06); G.add(bellG);
    const bellPts = [[0.0, 0.17], [0.05, 0.165], [0.085, 0.13], [0.1, 0.06], [0.12, 0.01], [0.15, -0.03], [0.14, -0.045]].map(([r, y]) => new THREE.Vector2(r, y));
    const bellDome = at(new THREE.Mesh(new THREE.LatheGeometry(bellPts, 10), mat({ color: 0xe8c050, unlit: 0.35, side: THREE.DoubleSide })), 0, -0.02, -0.17); bellG.add(bellDome);   // a classic bell, hung from a bracket off the wall
    bellG.add(at(ico(0.035, 0, M(0x8a6a2a)), 0, -0.08, -0.17)); bellG.add(at(box(0.04, 0.04, 0.2, BRASS), 0, 0.17, -0.08)); bellG.add(at(box(0.12, 0.12, 0.02, WOOD), 0, 0.17, 0.02));
    const strokeM = glow(0xffffff, 1), bellStrokes = [], phoneStrokes = [];
    for (let j = 0; j < 6; j++) { const q = box(0.025, 0.12, 0.025, strokeM); q.visible = false; G.add(q); bellStrokes.push(q); }
    const closetG = new THREE.Group(); G.add(closetG);   // the closet behind the front wall, its door
    closetG.add(at(box(cx1 - cx0, 0.04, 0.7, M(0x5a4a3c)), (cx0 + cx1) / 2, 0.0, S.Z1 + 0.35)); closetG.add(at(box(cx1 - cx0, cy1, 0.04, M(0x4a3e34)), (cx0 + cx1) / 2, cy1 / 2, S.Z1 + 0.7));
    closetG.add(at(box(0.04, cy1, 0.7, M(0x4a3e34)), cx0, cy1 / 2, S.Z1 + 0.35)); closetG.add(at(box(0.04, cy1, 0.7, M(0x4a3e34)), cx1, cy1 / 2, S.Z1 + 0.35));
    for (let j = 0; j < 3; j++) closetG.add(at(box(0.34, 0.9, 0.08, M([0xc84a4a, 0x4a6ac8, 0xd8b04a][j])), cx0 + 0.25 + j * 0.36, 1.45, S.Z1 + 0.4));   // coats on a rail
    const closetHinge = at(new THREE.Group(), cx1, 0, S.Z1 - 0.03); G.add(closetHinge);
    closetHinge.add(at(box(cx1 - cx0 - 0.02, cy1 - 0.02, 0.05, M(0xf6f4ee, { unlit: 0.05 })), -(cx1 - cx0) / 2, (cy1 - 0.02) / 2, 0));
    closetHinge.add(at(ico(0.035, 0, BRASS), -(cx1 - cx0) + 0.12, 1.0, -0.05));
    G.add(at(box(cx1 - cx0 + 0.16, 0.08, 0.06, frameM), (cx0 + cx1) / 2, cy1 + 0.04, S.Z1 - 0.02));
    const ceil = new THREE.Mesh(new THREE.PlaneGeometry(W, D), mat({ map: ceilT, rep: [W / 2, D / 2] })); ceil.rotation.x = PI / 2; G.add(at(ceil, 0, S.H, ZC));
    // the curtains: open at the window's sides, or drawn across it with feet under them
    const curtM = mat({ color: 0xd8c8e8, unlit: 0.12, side: THREE.DoubleSide });
    const curtains = [-1, 1].map(sx => { const c = new THREE.Mesh(new THREE.PlaneGeometry(1, S.H - 0.25), curtM); G.add(c); return { c, sx }; });
    const feetM = M(0x3a3e4a), feet = Array.from({ length: 14 }, () => { const q = box(0.11, 0.08, 0.16, feetM); q.visible = false; G.add(q); return q; });

    // ---------- the furniture ----------
    const [sx0, sz0] = S.SOFA, sofaG = new THREE.Group(); G.add(sofaG);
    const sofaM = M(0xe0a838, { unlit: 0.06 });
    sofaG.add(at(box(S.SOFA_W, S.SEAT_Y, 0.9, sofaM), sx0, S.SEAT_Y / 2, sz0)); sofaG.add(at(box(S.SOFA_W, S.BACK_Y, 0.22, sofaM), sx0, S.BACK_Y / 2, sz0 - 0.36));
    for (const e of [-1, 1]) sofaG.add(at(box(0.2, 0.42, 0.9, sofaM), sx0 + e * (S.SOFA_W / 2 + 0.1), 0.21, sz0));
    const pillows = [[-0.85, 0xff6aa0], [0.85, 0x4ac8d8]].map(([dx, c]) => { const q = rot(at(box(0.36, 0.34, 0.12, M(c, { unlit: 0.15 })), sx0 + dx, S.SEAT_Y + 0.17, sz0 - 0.2), -0.2, 0, 0); G.add(q); return { q, dx }; });
    const [tx0, tz0] = S.TABLE, tableG = new THREE.Group(); G.add(tableG);
    tableG.add(at(box(1.3, 0.05, 0.7, WOOD), tx0, S.TABLE_Y - 0.025, tz0)); for (const dx of [-0.58, 0.58]) for (const dz of [-0.28, 0.28]) tableG.add(at(box(0.05, S.TABLE_Y - 0.05, 0.05, WOOD), tx0 + dx, (S.TABLE_Y - 0.05) / 2, tz0 + dz));
    const rug = new THREE.Mesh(new THREE.CircleGeometry(S.RUG_R, 24), offset(mat({ map: rugT, unlit: 0.12 }))); rug.rotation.x = -PI / 2; rug.position.set(S.RUG[0], 0.006, S.RUG[1]); G.add(rug);   // a disc, its canvas drawn edge to edge
    const [bx, bz] = S.BED, bedG = new THREE.Group(); G.add(bedG);
    bedG.add(at(cyl(0.52, 0.55, S.BED_Y, 12, M(0x2aa89a, { unlit: 0.1 })), bx, S.BED_Y / 2, bz));   // teal: his red jumpsuit vanished into a red bed
    bedG.add(at(rot(new THREE.Mesh(new THREE.TorusGeometry(0.5, 0.1, 5, 14), M(0x3ac8b4, { unlit: 0.1 })), PI / 2, 0, 0), bx, S.BED_Y + 0.06, bz));
    const [trx, trz] = S.TREE, treeG = new THREE.Group(); G.add(treeG);
    const sisal = M(0xd8c49a), carpet = M(0xa8b0c8, { unlit: 0.08 });
    treeG.add(at(box(0.9, 0.06, 0.9, carpet), trx, 0.03, trz)); treeG.add(at(cyl(0.07, 0.07, S.TREE_Y, 6, sisal), trx - 0.2, S.TREE_Y / 2, trz)); treeG.add(at(cyl(0.07, 0.07, 0.55, 6, sisal), trx + 0.25, 0.27, trz + 0.2));
    treeG.add(at(box(0.5, 0.36, 0.44, carpet), trx + 0.18, 0.21, trz - 0.12)); treeG.add(at(box(0.26, 0.22, 0.04, DARK), trx + 0.18, 0.2, trz + 0.11));
    treeG.add(at(cyl(0.34, 0.34, 0.06, 10, carpet), trx + 0.25, 0.58, trz + 0.2)); treeG.add(at(cyl(0.44, 0.44, 0.07, 10, carpet), trx - 0.2, S.TREE_Y, trz));
    const [kx0, kx1, czz0, czz1] = S.COUNTER, counterG = new THREE.Group(); G.add(counterG);
    counterG.add(at(box(kx1 - kx0, S.COUNTER_Y - 0.04, czz1 - czz0, WHITE), (kx0 + kx1) / 2, (S.COUNTER_Y - 0.04) / 2, (czz0 + czz1) / 2)); counterG.add(at(box(kx1 - kx0 + 0.06, 0.05, czz1 - czz0 + 0.04, WOOD), (kx0 + kx1) / 2, S.COUNTER_Y - 0.02, (czz0 + czz1) / 2));
    counterG.add(at(box(0.7, 1.9, 0.72, M(0xf8f8f6, { unlit: 0.1 })), S.X - 0.36, 0.95, czz1 + 0.42)); counterG.add(at(box(0.03, 0.5, 0.04, DARK), S.X - 0.72, 1.3, czz1 + 0.15));
    counterG.add(at(box(0.3, 0.32, 0.2, M(0xd84a4a)), (kx0 + kx1) / 2, S.COUNTER_Y + 0.16, czz0 + 0.5)); counterG.add(at(cyl(0.09, 0.09, 0.24, 8, M(0xfafaf6)), (kx0 + kx1) / 2, S.COUNTER_Y + 0.12, czz0 + 1.3));
    const [phx, phz] = S.PHONE, phoneG = new THREE.Group(); G.add(phoneG);
    phoneG.add(at(cyl(0.24, 0.24, 0.04, 10, WOOD), phx, S.PHONE_Y - 0.02, phz)); phoneG.add(at(cyl(0.03, 0.05, S.PHONE_Y - 0.04, 6, WOOD), phx, (S.PHONE_Y - 0.04) / 2, phz));
    const phoneRed = M(0xd8322a, { unlit: 0.2 });
    phoneG.add(at(box(0.26, 0.1, 0.2, phoneRed), phx, S.PHONE_Y + 0.05, phz)); phoneG.add(at(cyl(0.06, 0.06, 0.012, 10, M(0xf6f4ee)), phx, S.PHONE_Y + 0.106, phz + 0.02));
    const handset = at(new THREE.Group(), phx, S.PHONE_Y + 0.15, phz - 0.02); phoneG.add(handset);
    handset.add(box(0.3, 0.04, 0.06, phoneRed)); for (const e of [-1, 1]) handset.add(at(box(0.07, 0.07, 0.08, phoneRed), e * 0.14, -0.03, 0));
    for (let j = 0; j < 6; j++) { const q = box(0.025, 0.12, 0.025, strokeM); q.visible = false; G.add(q); phoneStrokes.push(q); }
    const lampG = new THREE.Group(); G.add(lampG);
    lampG.add(at(cyl(0.18, 0.2, 0.04, 8, DARK), S.LAMP[0], 0.02, S.LAMP[1])); lampG.add(at(cyl(0.02, 0.02, 1.6, 5, DARK), S.LAMP[0], 0.8, S.LAMP[1]));
    lampG.add(at(new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.32, 0.36, 8, 1, true), mat({ color: 0xf4e6c4, unlit: 0.7, side: THREE.DoubleSide })), S.LAMP[0], 1.72, S.LAMP[1]));
    const plantG = new THREE.Group(); G.add(plantG);
    plantG.add(at(cyl(0.24, 0.18, 0.4, 8, potM), S.PLANT[0], 0.2, S.PLANT[1]));
    for (let j = 0; j < 9; j++) { const a = j * 0.7, lf = at(new THREE.Mesh(new THREE.CircleGeometry(0.26, 6), leafM), S.PLANT[0] + Math.sin(a) * 0.3, 0.75 + 0.12 * (j % 4), S.PLANT[1] + Math.cos(a) * 0.3); lf.rotation.set(-0.7, a, 0.2); plantG.add(lf); }
    // the front wall: a sideboard with a record player, framed photos; the pet cam on its shelf
    const sideG = new THREE.Group(); G.add(sideG);
    sideG.add(at(box(1.8, 0.7, 0.45, WOOD), 3.7, 0.35, S.Z1 - 0.25)); sideG.add(at(box(0.5, 0.1, 0.4, DARK), 3.3, 0.75, S.Z1 - 0.26));
    const record = at(cyl(0.16, 0.16, 0.012, 12, M(0x151515)), 3.3, 0.81, S.Z1 - 0.26); sideG.add(record);
    for (const [x, y] of [[3.2, 1.7], [4.2, 1.9], [0.6, 1.6]]) sideG.add(rot(at(new THREE.Mesh(new THREE.PlaneGeometry(0.42, 0.52), mat({ map: photoT, unlit: 0.4 })), x, y, S.Z1 - 0.02), 0, PI, 0));
    const [cdx, cdy, cdz] = S.CAMDEV, camG = at(new THREE.Group(), cdx, cdy, cdz); G.add(camG);
    const camShelf = at(box(0.44, 0.04, 0.24, WHITE), cdx, cdy - 0.15, cdz - 0.06); G.add(camShelf);
    const camBody = new THREE.Group(); camG.add(camBody);
    const camWhite = M(0xfafaf6, { unlit: 0.6 }); camBody.add(cyl(0.1, 0.11, 0.2, 10, camWhite)); camBody.add(at(new THREE.Mesh(new THREE.SphereGeometry(0.1, 10, 5, 0, TAU, 0, PI / 2), camWhite), 0, 0.1, 0));
    const lensFace = at(new THREE.Group(), 0, 0.03, 0.095); camBody.add(lensFace);
    lensFace.add(rot(cyl(0.068, 0.068, 0.03, 12, M(0x1a1a20)), PI / 2, 0, 0)); lensFace.add(at(box(0.02, 0.02, 0.01, glow(0xffffff, 0.9)), 0.025, 0.028, 0.03));   // a glint on the glass lensFace.add(at(rot(cyl(0.03, 0.03, 0.035, 10, M(0x2a3a5a, { unlit: 0.35 })), PI / 2, 0, 0), 0, 0, 0.005));
    const ledOff = M(0x5a3030), ledOn = glow(0xff2020, 1);
    const led = at(ico(0.018, 1, ledOff), 0.075, 0.055, 0.015); lensFace.add(led);
    const halo = at(new THREE.Mesh(new THREE.RingGeometry(0.024, 0.045, 10), mat({ color: 0xff3a3a, unlit: 1, see: 0.4 })), 0.075, 0.055, 0.025); lensFace.add(halo);
    camBody.rotation.set(0.35, Math.atan2(S.CAMLOOK[0] - cdx, S.CAMLOOK[2] - cdz), 0, 'YXZ');   // its lens to the room, tipped down
    camG.scale.setScalar(1.3);

    // ---------- the party: decorations, the disco ball and its spots ----------
    const partyG = new THREE.Group(); G.add(partyG);
    const PC = [0xff5fa2, 0x4ad0e8, 0xffd43b, 0x9a7aff];
    for (let j = 0; j < 17; j++) {   // bunting over the window
      const x = -4.4 + j * 0.55, sag = 0.18 * Math.sin((j / 16) * PI);
      partyG.add(rot(at(cone(0.13, 0.26, 3, M(PC[j % 4], { unlit: 0.3 })), x, 3.12 - sag, S.Z0 + 0.06), PI, 0, 0));
    }
    for (const [ex, ez] of [[-S.X + 0.3, S.Z0 + 0.3], [S.X - 0.3, S.Z0 + 0.3], [-S.X + 0.3, S.Z1 - 0.3], [S.X - 0.3, S.Z1 - 0.3]]) {   // crepe streamers from the ball's hook to the corners
      const len = Math.hypot(ex - S.DISCO[0], ez - S.DISCO[2]) / 9 + 0.02, yawS = Math.atan2(ex - S.DISCO[0], ez - S.DISCO[2]);
      for (let j = 0; j < 9; j++) { const u = (j + 0.5) / 9, x = S.DISCO[0] + (ex - S.DISCO[0]) * u, z = S.DISCO[2] + (ez - S.DISCO[2]) * u, y = S.H - 0.08 - 0.35 * Math.sin(u * PI); partyG.add(rot(at(box(0.06, 0.03, len, M(PC[(j + (ex > 0 ? 1 : 0)) % 4], { unlit: 0.35 })), x, y, z), 0.3 * Math.sin(j * 2), yawS, 0)); }
    }
    for (const [bx2, bz2, n] of [[-5.1, -3.9, 3], [5.1, 5.2, 3], [-5.2, 5.0, 2], [4.6, -4.1, 2]]) for (let j = 0; j < n; j++) {   // balloons on strings
      const y = 1.7 + 0.35 * j, x = bx2 + 0.22 * Math.sin(j * 2.1), z = bz2 + 0.22 * Math.cos(j * 2.1);
      partyG.add(at(ico(0.2, 1, M(PC[(j + n) % 4], { unlit: 0.3 })), x, y, z)); partyG.add(at(box(0.008, y - 0.2, 0.008, M(0xf6f6f6)), x, (y - 0.2) / 2, z));
    }
    const bulbs = [];
    for (const [x0, z0, x1, z1] of [[-S.X + 0.05, S.Z0 + 0.2, -S.X + 0.05, S.Z1 - 0.2], [S.X - 0.05, S.Z0 + 0.2, S.X - 0.05, S.Z1 - 0.2]]) for (let j = 0; j < 22; j++) { const u = j / 21, q = at(ico(0.035, 0, glow(PC[j % 4], 1)), x0 + (x1 - x0) * u, 3.2 - 0.12 * Math.abs(Math.sin(u * PI * 5)), z0 + (z1 - z0) * u); partyG.add(q); bulbs.push(q); }
    const discoG = at(new THREE.Group(), ...S.DISCO), discoM = mat({ color: 0xe8ecf4, unlit: 0.55 });
    discoG.add(ico(0.26, 1, discoM)); discoG.add(at(box(0.01, S.H - S.DISCO[1], 0.01, DARK), 0, (S.H - S.DISCO[1]) / 2, 0)); G.add(discoG);
    const spotM = glow(0xfff6e8, 1), spots = Array.from({ length: 26 }, () => { const q = new THREE.Mesh(new THREE.PlaneGeometry(0.09, 0.09), spotM); G.add(q); return q; });

    // ---------- the mess ----------
    const confM = PC.map(c => offset(M(c, { unlit: 0.4 }))), confetti = Array.from({ length: 90 }, (_, j) => { const q = new THREE.Mesh(new THREE.PlaneGeometry(0.06, 0.06), confM[j % 4]); q.rotation.set(-PI / 2, 0, hash(j, 5373) * 3); q.position.set(-4.8 + 9.6 * hash(j, 5371), 0.008, -3.0 + 8.4 * hash(j, 5372)); G.add(q); return q; });
    const cupM = M(0xe02a2a, { unlit: 0.15 }), cups = Array.from({ length: 10 }, (_, j) => {
      const q = cyl(0.06, 0.042, 0.15, 7, cupM), lying = j > 3;
      q.position.set(lying ? -3.6 + 7.2 * hash(j, 5374) : -0.45 + 0.3 * j, lying ? 0.05 : S.TABLE_Y + 0.075, lying ? -2.6 + 6.0 * hash(j, 5375) : S.TABLE[1] + 0.18 * ((j % 2) ? 1 : -1));
      if (lying) q.rotation.set(PI / 2, hash(j, 5376) * 3, 0); G.add(q); return q;
    });
    const pizzaG = new THREE.Group(); G.add(pizzaG);
    for (const [dx, open] of [[-0.3, true], [0.35, true], [0.35, false]]) {
      const y = S.TABLE_Y + (open ? 0.02 : 0.08); pizzaG.add(at(box(0.48, 0.06, 0.48, boxM), S.TABLE[0] + dx, y, S.TABLE[1]));
      if (open) { pizzaG.add(rot(at(box(0.48, 0.48, 0.02, boxM), S.TABLE[0] + dx, y + 0.24, S.TABLE[1] - 0.24), -0.25, 0, 0)); pizzaG.add(at(cyl(0.21, 0.21, 0.025, 8, cheeseM), S.TABLE[0] + dx, y + 0.04, S.TABLE[1])); }
    }

    // ---------- the guests, the hearts ----------
    const guests = PARTY.map((_, i) => { const q = pet(i); G.add(q.g); return q; });
    const heartM = M(0xff4f9a, { unlit: 0.8 }), hearts = [];
    for (let i = 0; i < 9; i++) { const h = new THREE.Group(); h.add(at(ico(0.1, 0, heartM), -0.075, 0, 0)); h.add(at(ico(0.1, 0, heartM), 0.075, 0, 0)); h.add(rot(at(cone(0.125, 0.18, 4, heartM), 0, -0.11, 0), PI, 0, 0)); h.visible = false; G.add(h); hearts.push(h); }

    const on = (v, s) => v === true ? true : Array.isArray(v) ? s >= v[0] && s < v[1] : (typeof v === 'number' ? s >= v : false);
    function light(P, s, bt) {
      if (P.zone === 'tidy') {
        lights(0x6a5c52, 0xffc8a0, [0.15, -0.55, 0.9], 0x2a2230, [16, 44], 8);
        pt(0, S.LAMP[0], 1.75, S.LAMP[1] + 0.3, 0.85, 0.62, 0.36); pt(1, 0, 3.1, 0.6, 0.5, 0.46, 0.42); pt(2, 0, 1.8, S.Z0 + 0.8, 0.38, 0.26, 0.3);
      } else {
        const h = Math.exp(-fr(bt) * 4);
        lights(0x3e3456, 0xd89878, [0.12, -0.5, 0.9], 0x1a1424, [16, 44], 7.5);
        pt(0, -2.9, 2.6, 0.9, 0.85 * (0.75 + 0.25 * h), 0.3, 0.55); pt(1, 2.9, 2.6, 0.9, 0.25, 0.62 * (0.75 + 0.25 * h), 0.9);
        pt(2, S.DISCO[0], 2.6, S.DISCO[2], 0.72, 0.62, 0.48); pt(3, S.LAMP[0], 1.75, S.LAMP[1] + 0.3, 0.5, 0.38, 0.22);
      }
      if (P.key) pt(3, P.key[0], P.key[1], P.key[2], P.key[3], P.key[4], P.key[5]);
    }
    // a bell or a phone ringing: it shakes, white strokes either side, on and off on the half beat
    function ringing(L, s, R0, cx, cy, cz, axis, strokes, obj) {
      strokes.forEach(q => { q.visible = false; }); obj.rotation.z = 0;
      const r = (L || []).find(f => s >= f && s < f + 1.6); if (r == null) return;
      const e = s - r; obj.rotation.z = 0.16 * Math.sin(e * 70);
      if (Math.sin(e * 22) < -0.2) return;
      strokes.forEach((q, j) => {
        const side = j < 3 ? -1 : 1, a = ((j % 3) - 1) * 0.5; q.visible = true;
        if (axis === 'x') { q.position.set(cx + 0.06, cy + Math.sin(a) * R0 + 0.02, cz + side * Math.cos(a) * R0); q.rotation.set(-side * (a + PI / 2), 0, 0); }
        else { q.position.set(cx + side * Math.cos(a) * R0, cy + Math.sin(a) * R0 + 0.04, cz + 0.02); q.rotation.set(0, 0, side * (a + PI / 2)); }
      });
    }
    const inCloset = [[S.CLOSET.x0 + 0.3, S.Z1 + 0.25], [S.CLOSET.x0 + 0.65, S.Z1 + 0.3], [S.CLOSET.x0 + 0.95, S.Z1 + 0.25], [S.CLOSET.x0 + 0.45, S.Z1 + 0.5], [S.CLOSET.x0 + 0.85, S.Z1 + 0.5]];
    return {
      group: G, sky: null, shadowCol: 0x8a6a48, shadowY: 0.03, indoor: true,
      light() { light({}, 0, 0); },
      anim(t, P = {}) {
        const s = shotT(t, P), hide = new Set(P.hide || []), stopAt = P.stop === true ? -99 : P.stop;
        const tt = stopAt != null && s > stopAt ? t - (s - stopAt) : t, ss = stopAt != null ? Math.min(s, stopAt) : s, bt = beat(tt);
        light(P, s, bt);
        mullions[1].visible = !hide.has('mullion');
        sofaG.visible = !hide.has('sofa'); tableG.visible = !hide.has('table'); treeG.visible = !hide.has('tree'); bedG.visible = !hide.has('bed'); lampG.visible = !hide.has('lamp');
        plantG.visible = !hide.has('plant'); phoneG.visible = !hide.has('phone'); counterG.visible = !hide.has('counter'); camG.visible = !hide.has('cam'); camShelf.visible = !hide.has('cam'); rug.visible = !hide.has('rug');
        // the doors
        const dOpen = cl(ramp(P.door, s)), cOpen = cl(ramp(P.closet, s));
        doorHinge.rotation.y = 1.75 * dOpen; closetHinge.rotation.y = -1.75 * cOpen;   // both leaves swing into the room
        hall.visible = dOpen > 0.01; closetG.visible = cOpen > 0.01 || !!P.closetFull || P.spill != null;
        // the bell and the phone
        ringing(P.bell, s, 0.28, S.DOOR.x1 + 0.35, 2.0, S.Z1 - 0.23, 'z', bellStrokes, bellG);
        handset.visible = P.handset !== false;
        ringing(P.ring, s, 0.26, S.PHONE[0], S.PHONE_Y + 0.15, S.PHONE[1], 'z', phoneStrokes, handset);
        // the pet cam's LED: red while the owner watches
        const lit = on(P.camLight, s); led.material = lit ? ledOn : ledOff; halo.visible = lit;
        // the curtains
        const drawn = !!P.drawn;
        curtains.forEach(({ c, sx }) => { const w = drawn ? (S.WIN.x1 - S.WIN.x0) / 2 + 0.25 : 0.7; c.scale.x = w; c.position.set(drawn ? sx * w / 2 : sx * (S.WIN.x1 + 0.25), (S.H - 0.25) / 2 + 0.12, S.Z0 + 0.22); });
        const nf = drawn ? (P.feet || 0) : 0;
        feet.forEach((q, j) => { q.visible = j < nf * 2; if (!q.visible) return; const pair = Math.floor(j / 2), u = (pair + 0.5) / Math.max(1, nf); q.position.set(S.WIN.x0 + 0.3 + (S.WIN.x1 - S.WIN.x0 - 0.6) * u + (j % 2 ? 0.08 : -0.08), 0.04, S.Z0 + 0.34); });
        // the party
        const party = P.party !== false && P.zone !== 'tidy';
        partyG.visible = party; discoG.visible = party && !hide.has('disco'); discoG.rotation.y = tt * 1.1;
        bulbs.forEach((q, j) => { q.visible = party && (Math.floor(bt * 2) + j) % 3 !== 0; });
        spots.forEach((q, j) => {
          q.visible = party && !hide.has('disco'); if (!q.visible) return;
          const a = j * 2.399 + tt * 1.1, ev = 0.25 + 0.5 * hash(j, 5381);
          const dx = Math.sin(a), dz = Math.cos(a), dy = -0.9 + 1.4 * ev;   // a ray from the ball onto a wall or the floor
          let u = 99; const o = S.DISCO;
          if (dy < 0) u = Math.min(u, -o[1] / dy);
          if (dx > 0) u = Math.min(u, (S.X - 0.02 - o[0]) / dx); else if (dx < 0) u = Math.min(u, (-S.X + 0.02 - o[0]) / dx);
          if (dz > 0) u = Math.min(u, (S.Z1 - 0.02 - o[2]) / dz); else if (dz < 0) u = Math.min(u, (S.Z0 + 0.02 - o[2]) / dz);
          const px2 = o[0] + dx * u, py = o[1] + dy * u, pz = o[2] + dz * u; q.position.set(px2, Math.max(0.012, py), pz);
          if (py <= 0.02) q.rotation.set(-PI / 2, 0, 0); else if (Math.abs(px2) > S.X - 0.05) q.rotation.set(0, px2 > 0 ? -PI / 2 : PI / 2, 0); else q.rotation.set(0, pz > 0 ? PI : 0, 0);
        });
        record.rotation.y = party ? tt * 3.5 : 0;
        // the mess
        const mess = P.zone === 'tidy' ? 0 : cl(P.mess ?? (party ? 0.5 : 0));
        confetti.forEach((q, j) => { q.visible = j < 90 * mess && !cleared(P, q.position.x, q.position.z); });
        cups.forEach((q, j) => { q.visible = j < 10 * mess && !cleared(P, q.position.x, q.position.z); });
        pizzaG.visible = mess > 0.3 && !hide.has('table') && P.pizza !== false;
        pillows.forEach(({ q, dx }, j) => {
          q.visible = !hide.has('sofa');
          if (mess > 0.6) { q.position.set(sx0 + dx * 1.2, 0.08, sz0 + 0.75 + 0.2 * j); q.rotation.set(-PI / 2 + 0.2, 0.4 * (j ? 1 : -1), 0); }
          else { q.position.set(sx0 + dx, S.SEAT_Y + 0.17, sz0 - 0.2); q.rotation.set(-0.2, 0, 0); }
        });
        // the guests
        const gm = P.noguests ? false : (P.guests ?? (party ? 'dance' : false));
        guests.forEach((q, i) => {
          let mode = (P.gmode && P.gmode[i] !== undefined) ? P.gmode[i] : gm, spot = P.gspots ? P.gspots[i] : PARTY[i];
          if (P.closetFull && i < inCloset.length) { spot = [...inCloset[i], 180]; mode = 'freeze'; }
          if (P.spill != null && i < 12 && s >= P.spill) { const a = (hash(i, 5391) - 0.5) * 2.4, d = 0.4 + 1.9 * hash(i, 5392), u = sm((s - P.spill - 0.02 * i) / 0.3); spot = [(S.CLOSET.x0 + S.CLOSET.x1) / 2 + Math.sin(a) * d * u, S.Z1 - 0.3 - (0.5 + 0.55 * Math.abs(Math.cos(a)) * d) * u, hash(i, 5393) * 360]; mode = 'spill'; }
          q.g.visible = !!mode && !!spot && !cleared(P, spot ? spot[0] : 0, spot ? spot[1] : 0);
          if (!q.g.visible) return;
          reset(q);
          const [x, z, yawD] = spot, yaw = yawD != null ? yawD * PI / 180 : Math.atan2(S.RUG[0] - x, S.RUG[1] - z);
          q.g.position.set(x, 0, z); q.g.rotation.y = yaw;
          pose(q, mode, bt, tt, i, x, z, P, yaw);
        });
        hearts.forEach(h => { h.visible = false; });
        (P.hearts || []).forEach(([x, y, z, s0 = 0], k2) => {
          for (let j = 0; j < 3; j++) {
            const h = hearts[k2 * 3 + j]; if (!h) return; const u = fr((ss - s0) * 0.8 + j / 3); h.visible = ss >= s0;
            h.position.set(x + 0.18 * Math.sin(u * 5 + j), y + u * 0.7, z); h.scale.setScalar(0.8 + 0.4 * Math.sin(u * PI)); h.rotation.y = (P.heartYaw || 0) * PI / 180;
          }
        });
      },
    };
  }
  return { petflat: petflat() };
}
