// maps37.js: the "Danza Kuduro" map (2026-10-09, Don Omar & Lucenzo, 2010; the clip: a white motor yacht off green
// Caribbean hills, a white villa with columns and a pool terrace, sunbathers in black on the sunpads, dancers on a white
// beach under a white-curtained cabana). Same contract as the other map files, pure in t:
//   resort  an all-inclusive resort's pool at midday (y = 0): the pool (RESORT.POOL, the water at WATER_Y, its floor at
//           FLOOR_Y: a pet in it stands waist-deep), the entertainer's podium at its far side (PODIUM, its top at
//           PODIUM_Y, facing +z, KUDURO on its skirt), the aqua-gym class in the water facing it (CLASS: 3 rows of 6),
//           the sunbeds in rows on the near side (BED_ROWS x BED_XS, their pads at BED_Y, the head end towards -z),
//           Kob's sunbed in front of the middle (KOB_BED) with her parasol beside it (PARASOL), the pool bar on the right
//           (BAR, its counter top at BAR_Y), palms, the clip's white villa with columns behind the sunbeds (VILLA_Z),
//           the beach behind the podium with a white-curtained cabana, the sea with the white yacht and green hills.
// Flags read by anim(t, P) (s = seconds into the shot):
//   move      the class in the pool: 'dance' (the kuduro: paws pumping, a bob) | 'up' (one paw up from upAt) | 'hips'
//             | 'turn' (a half turn from turnAt: their backs to the podium) | 'heads' (nodding on the beat) | 'splash'
//             (both paws scooping water forward on every beat) | 'idle'; stare [x, z] turns them all to a point;
//             classN (how many stand in the pool, default 18); classOut [s0, gap, dur]: they climb out one by one and
//             walk to the next free sunbeds (after `beds`), lying down there
//   beds      how many sunbeds are taken (BED_ORDER: the front row first, from the middle out); bedMove 'lie' (on their
//             backs) | 'paw' (one paw up from pawAt, a coconut in it from cocoAt, default pawAt + 0.4) | 'front' (on their fronts) |
//             { look: [x, z] } (heads turned to a point); flip: s (everyone lying rolls over onto the front in 0.35 s,
//             in sync); bedsAt [s0, gap] (the sunbeds fill one by one from s0)
//   parasol   0-1 or [s0, s1, a, b]: Kob's parasol (0 furled, 1 open), tilted towards the pool by parasolTilt (deg)
//   splashWall [x0, z0, x1, z1, s, spread]: a sheet of water scooped out of the pool round (x0, z0), landing round (x1,
//             z1) on s (drops in arcs); splash [[x, z, s, size]] (a burst on the water)
//   hearts    [[x, y, z, s0, loop]]: three pink hearts pop and rise (heartYaw deg); noguests; clear [[x, z, r]] (no palm,
//             cabana or bather there); key [x, y, z, r, g, b]; bunting (false hides the flags over the pool)
// Never name a flag like a shot field: `crowd`, `cam`, `still`, `focus` are taken.
import { mapKit } from './mapkit.js';

export const RESORT = {
  POOL: { x0: -5, x1: 5, z0: -7.2, z1: -2.2 }, WATER_Y: -0.06, FLOOR_Y: -0.45,
  PODIUM: [0, -8.7], PODIUM_W: 3.0, PODIUM_D: 1.6, PODIUM_Y: 0.4,
  CLASS: { xs: [-3.75, -2.25, -0.75, 0.75, 2.25, 3.75], zs: [-3.3, -4.5, -5.7] },
  BED_Y: 0.32, BED_ROWS: [0.9, 3.2, 5.5], BED_XS: [-6, -4, -2, 0, 2, 4, 6],
  KOB_BED: [0, 0.9], PARASOL: [0.85, 0.55],
  BAR: [8.9, -0.6], BAR_Y: 0.95, VILLA_Z: 11.5,
};

export function buildResortMaps(K) {
  const k = mapKit(K);
  const { THREE, mat, tex, px, noise, box, TAU, PI, hash, beat, grad, cyl, cone, ico, at, rot, flat, lights, pt, fr, U } = k;
  const M = (c, o = {}) => mat({ color: c, ...o }), glow = (c, u = 1) => mat({ color: c, unlit: u });
  const shotT = (t, P) => P.t0 != null ? t - P.t0 : 0;
  const cl = x => Math.max(0, Math.min(1, x)), sm = x => { x = cl(x); return x * x * (3 - 2 * x); };
  const cleared = (P, x, z) => (P.clear || []).some(([cx, cz, r]) => (x - cx) ** 2 + (z - cz) ** 2 < r * r);
  const ramp = (v, s) => Array.isArray(v) ? v[2] + (v[3] - v[2]) * sm((s - v[0]) / Math.max(0.01, v[1] - v[0])) : v;
  const { POOL, WATER_Y, FLOOR_Y, PODIUM, PODIUM_W, PODIUM_D, PODIUM_Y, CLASS, BED_Y, BED_ROWS, BED_XS, KOB_BED, PARASOL, BAR, BAR_Y, VILLA_Z } = RESORT;
  // the sunbeds the bathers take, front row first, from the middle out (Kob's own sunbed is not one of them)
  const BED_ORDER = [];
  BED_ROWS.forEach((z, r) => [...BED_XS].sort((a, b) => Math.abs(a) - Math.abs(b) || a - b).forEach(x => { if (!(r === 0 && x === KOB_BED[0])) BED_ORDER.push([x, z]); }));

  // ---------- a box pet (the playa's): a box body in a swimsuit, legs and arms of its own, a faceted head ----------
  // no black fur (a dark pet read as a faceless silhouette); swimsuits in the clip's black and the resort's colours
  const FURS = [0xd8c2a0, 0xb08a68, 0xf2eee6, 0x9a7a5a, 0x9a9aa6, 0xe8a060, 0x8a7a6c, 0xc8b0a0];
  const SUITS = [0x26262c, 0xff5fa2, 0x3fb4ff, 0xffd43b, 0x26262c, 0xff8a3c, 0x2ad8c8, 0xa46aff];
  const eyeM = M(0x101010), noseM = M(0x1a1a1a), glintM = glow(0xffffff);
  const cocoM = M(0x7a4a2a), cocoIn = M(0xf8f4ea), strawM = M(0xff5fa2), umbM = M(0xffd43b, { unlit: 0.3 });
  function coconut() {
    const q = new THREE.Group();
    q.add(new THREE.Mesh(new THREE.SphereGeometry(0.075, 7, 5, 0, TAU, 0, PI * 0.62), cocoM));
    q.add(rot(at(new THREE.Mesh(new THREE.CircleGeometry(0.06, 7), cocoIn), 0, 0.03, 0), -PI / 2, 0, 0));
    q.add(rot(at(cyl(0.007, 0.007, 0.16, 4, strawM), 0.025, 0.1, 0), 0, 0, -0.3));
    q.add(rot(at(cone(0.06, 0.03, 6, umbM), -0.03, 0.13, 0), 0, 0, 0.35));
    return q;
  }
  const bellyM = M(0xf6e8cc, { unlit: 0.25 });
  function pet(i) {
    const g = new THREE.Group(), fur = M(FURS[i % FURS.length]), suit = M(SUITS[(i * 3) % SUITS.length]), kind = i % 3;
    const body = new THREE.Group(); g.add(body);
    body.add(at(box(0.34, 0.3, 0.24, suit), 0, 0.38, 0));
    body.add(at(box(0.3, 0.12, 0.22, fur), 0, 0.58, 0));
    body.add(at(box(0.2, 0.3, 0.02, bellyM), 0, 0.5, 0.125));   // a pale belly: lying, face up and face down read apart (review 3: the same box all round)
    const legs = [-1, 1].map(s => { const l = new THREE.Group(); l.position.set(s * 0.09, 0.24, 0); l.add(at(box(0.11, 0.24, 0.12, fur), 0, -0.12, 0)); body.add(l); return l; });
    const arms = [-1, 1].map(s => { const a = new THREE.Group(); a.position.set(s * 0.2, 0.58, 0); a.add(at(box(0.08, 0.26, 0.09, fur), 0, -0.12, 0)); body.add(a); return a; });
    const head = at(new THREE.Group(), 0, 0.84, 0); body.add(head);
    const skull = new THREE.Mesh(new THREE.IcosahedronGeometry(0.24, 0), fur); skull.scale.set(1, 0.86, 0.9); head.add(skull);
    head.add(at(box(0.14, 0.1, 0.12, fur), 0, -0.05, 0.19)); head.add(at(box(0.07, 0.05, 0.04, noseM), 0, -0.02, 0.26));
    for (const e of [-1, 1]) {
      head.add(at(box(0.05, 0.06, 0.02, eyeM), e * 0.1, 0.05, 0.2)); head.add(at(box(0.02, 0.02, 0.01, glintM), e * 0.1 + 0.012, 0.07, 0.212));
      head.add(kind === 0 ? rot(at(cone(0.07, 0.18, 4, fur), e * 0.13, 0.22, 0), 0, 0, -e * 0.3) : kind === 1 ? at(box(0.07, 0.26, 0.05, fur), e * 0.09, 0.28, 0) : rot(at(box(0.06, 0.22, 0.14, fur), e * 0.23, 0.0, 0), 0, 0, e * 0.35));
    }
    // a coconut cocktail in the right paw, upright when the paw points up (the arm's -y is the paw)
    const drink = coconut(); drink.position.set(0, -0.3, 0.02); drink.rotation.x = PI / 2; drink.visible = false; arms[1].add(drink);
    return { g, body, legs, arms, head, drink, i };
  }
  const resetPet = p => {
    p.body.position.set(0, 0, 0); p.body.rotation.set(0, 0, 0, 'XYZ'); p.head.rotation.set(0, 0, 0);
    p.legs.forEach(l => l.rotation.set(0, 0, 0)); p.arms.forEach(a => { a.rotation.set(0, 0, 0); a.scale.set(1, 1, 1); }); p.drink.visible = false; p.drink.scale.set(1, 1, 1);
  };

  // ---------- a sunbed: a white frame, a blue-striped pad, a pillow at the head end (-z) ----------
  const padT = tex(16, 16, x => { for (let i = 0; i < 16; i += 4) { px(x, '#2a6ae0', i, 0, 2, 16); px(x, '#f6f6f2', i + 2, 0, 2, 16); } }, 3701);
  const frameM = M(0xf4f4f0), legM = M(0xc8c8c4), padM = mat({ map: padT, rep: [1, 2] }), pillowM = M(0xf8f8f4);
  function sunbed() {
    const s = new THREE.Group();
    s.add(at(box(0.7, 0.06, 1.95, frameM), 0, BED_Y - 0.08, 0));
    s.add(at(box(0.64, 0.05, 1.86, padM), 0, BED_Y - 0.025, 0));
    s.add(at(box(0.5, 0.07, 0.26, pillowM), 0, BED_Y + 0.03, -0.78));
    for (const [sx, sz] of [[-0.3, -0.88], [0.3, -0.88], [-0.3, 0.88], [0.3, 0.88]]) s.add(at(box(0.05, BED_Y - 0.1, 0.05, legM), sx, (BED_Y - 0.1) / 2, sz));
    return s;
  }

  function resort() {
    const G = new THREE.Group();
    // ---------------- the deck: big pale sandstone tiles (1.2 m), round the pool's hole ----------------
    const deckT = tex(16, 16, (x, r) => { px(x, '#e6d6b8', 0, 0, 16, 16); noise(x, r, 16, 16, ['#e0cfb0', '#ecdcc0', '#dccaa8'], 40); px(x, '#cdbb98', 0, 0, 16, 1); px(x, '#cdbb98', 0, 0, 1, 16); }, 3702);
    const DX0 = -13, DX1 = 13, DZ0 = -10, DZ1 = 10.5, dm = (w, d) => mat({ map: deckT, rep: [w / 1.2, d / 1.2] });
    G.add(flat(DX1 - DX0, DZ1 - POOL.z1, dm(DX1 - DX0, DZ1 - POOL.z1), 0, 0, (DZ1 + POOL.z1) / 2));
    G.add(flat(DX1 - DX0, POOL.z0 - DZ0, dm(DX1 - DX0, POOL.z0 - DZ0), 0, 0, (POOL.z0 + DZ0) / 2));
    G.add(flat(POOL.x0 - DX0, POOL.z1 - POOL.z0, dm(POOL.x0 - DX0, POOL.z1 - POOL.z0), (DX0 + POOL.x0) / 2, 0, (POOL.z0 + POOL.z1) / 2));
    G.add(flat(DX1 - POOL.x1, POOL.z1 - POOL.z0, dm(DX1 - POOL.x1, POOL.z1 - POOL.z0), (DX1 + POOL.x1) / 2, 0, (POOL.z0 + POOL.z1) / 2));
    // the sand round the deck (in pieces: one plane under everything showed through the pool's hole), sloping into the
    // sea behind the podium
    const sandT = tex(16, 16, (x, r) => { px(x, '#f2e2c0', 0, 0, 16, 16); noise(x, r, 16, 16, ['#ead8b2', '#f6e8c8', '#e6d2aa'], 50); }, 3703);
    const smat = (w, d) => mat({ map: sandT, rep: [w / 2, d / 2] });
    G.add(flat(80, 40 - DZ1, smat(80, 40 - DZ1), 0, -0.02, (40 + DZ1) / 2));
    G.add(flat(DX0 + 40, DZ1 - DZ0, smat(DX0 + 40, DZ1 - DZ0), (DX0 - 40) / 2, -0.02, (DZ0 + DZ1) / 2));
    G.add(flat(40 - DX1, DZ1 - DZ0, smat(40 - DX1, DZ1 - DZ0), (40 + DX1) / 2, -0.02, (DZ0 + DZ1) / 2));
    G.add(flat(80, 9, smat(80, 9), 0, -0.02, DZ0 - 4.5));
    const beach2 = flat(80, 4, smat(80, 4), 0, -0.22, DZ0 - 10.2); beach2.rotation.x = -PI / 2 + 0.09; G.add(beach2);
    G.add(at(box(DX1 - DX0, 0.16, 0.25, M(0xd8c8a8)), 0, -0.06, DZ0 - 0.1));   // the deck's low edge at the beach
    // ---------------- the sea, the white yacht, the green hills ----------------
    const seaT = tex(32, 32, (x, r) => { px(x, '#2ab8c8', 0, 0, 32, 32); for (let i = 0; i < 40; i++) px(x, ['#5ad2dc', '#1aa0b4', '#7ae0e6'][i % 3], Math.floor(r() * 30), Math.floor(r() * 32), 2 + Math.floor(r() * 4), 1); }, 3704);
    G.add(flat(400, 220, mat({ map: seaT, rep: [60, 30], unlit: 0.35 }), 0, -0.42, DZ0 - 12 - 110));
    const foam = flat(80, 0.5, M(0xf6fbfa, { unlit: 0.6 }), 0, -0.4, DZ0 - 12.2); G.add(foam);
    const yacht = at(new THREE.Group(), 13, -0.42, -46); yacht.rotation.y = -0.35; G.add(yacht);
    {
      const W = M(0xf8f8f6, { unlit: 0.25 }), BK = M(0x16181e, { unlit: 0.1 });
      yacht.add(at(box(3.6, 1.6, 13, W), 0, 0.8, 0)); yacht.add(rot(at(cone(1.8, 3.5, 4, W), 0, 0.8, -8.2), -PI / 2, PI / 4, 0));
      yacht.add(at(box(3.62, 0.5, 11, BK), 0, 1.15, 0.6));
      yacht.add(at(box(3.0, 1.2, 6.5, W), 0, 2.2, 1.5)); yacht.add(at(box(3.02, 0.4, 5.6, BK), 0, 2.3, 1.2));
      yacht.add(at(box(2.4, 0.8, 3.0, W), 0, 3.2, 2.5)); yacht.add(at(box(0.15, 1.5, 0.15, W), 0, 4.2, 2.6));
    }
    const hillM = [M(0x3a7a3a), M(0x4a8a42), M(0x2e6a36)];
    for (let i = 0; i < 9; i++) G.add(at(new THREE.Mesh(new THREE.ConeGeometry(16 + hash(i, 3705) * 14, 14 + hash(i, 3706) * 16, 7), hillM[i % 3]), -95 + i * 24 + hash(i, 3707) * 8, 6, -130 - hash(i, 3708) * 25));
    for (let i = 0; i < 5; i++) G.add(at(ico(10 + hash(i, 3709) * 6, 1, hillM[(i + 1) % 3]), -60 + i * 32, -2, -105 - hash(i, 3710) * 10));
    // ---------------- the sky: a bright Caribbean blue, a high sun, a few clouds ----------------
    const skyT = grad([[0, '#1f78d8'], [0.35, '#4aa6ec'], [0.5, '#b8e2f6'], [1, '#b8e2f6']]);
    G.add(new THREE.Mesh(new THREE.SphereGeometry(185, 16, 12), mat({ map: skyT, unlit: 1, side: THREE.BackSide, nofog: 1 })));
    G.add(at(new THREE.Mesh(new THREE.CircleGeometry(7, 14), mat({ color: 0xfffbe8, unlit: 1, nofog: 1 })), 60, 120, -110));
    const cloudM = mat({ color: 0xffffff, unlit: 0.9, nofog: 1 });
    for (let i = 0; i < 8; i++) { const c = new THREE.Group(); for (let j = 0; j < 4; j++) c.add(at(ico(5 + hash(i, j, 3713) * 4, 1, cloudM), j * 6 - 9, hash(j, i, 3714) * 3, 0)); c.position.set(-120 + i * 34 + hash(i, 3711) * 10, 45 + hash(i, 3712) * 25, -160); G.add(c); }
    // ---------------- the pool: tiled walls and floor, the see-through water, a ladder ----------------
    const tileT = tex(16, 16, x => { px(x, '#48d0e0', 0, 0, 16, 16); for (let i = 0; i < 16; i += 4) { px(x, '#8ae8f0', i, 0, 1, 16); px(x, '#8ae8f0', 0, i, 16, 1); } }, 3715);
    const tileM = (w, h) => mat({ map: tileT, rep: [w / 0.8, h / 0.8], unlit: 0.3 });
    const pw = POOL.x1 - POOL.x0, pd = POOL.z1 - POOL.z0, depth = -FLOOR_Y, wallP = (w, h, m) => new THREE.Mesh(new THREE.PlaneGeometry(w, h), m);
    G.add(at(wallP(pw, depth, tileM(pw, depth)), (POOL.x0 + POOL.x1) / 2, FLOOR_Y / 2, POOL.z0));
    G.add(rot(at(wallP(pw, depth, tileM(pw, depth)), (POOL.x0 + POOL.x1) / 2, FLOOR_Y / 2, POOL.z1), 0, PI, 0));
    G.add(rot(at(wallP(pd, depth, tileM(pd, depth)), POOL.x0, FLOOR_Y / 2, (POOL.z0 + POOL.z1) / 2), 0, PI / 2, 0));
    G.add(rot(at(wallP(pd, depth, tileM(pd, depth)), POOL.x1, FLOOR_Y / 2, (POOL.z0 + POOL.z1) / 2), 0, -PI / 2, 0));
    G.add(flat(pw, pd, tileM(pw, pd), (POOL.x0 + POOL.x1) / 2, FLOOR_Y, (POOL.z0 + POOL.z1) / 2));
    const copeM = M(0xfaf8f2);
    for (const z of [POOL.z0 - 0.15, POOL.z1 + 0.15]) G.add(at(box(pw + 0.6, 0.06, 0.3, copeM), (POOL.x0 + POOL.x1) / 2, -0.01, z));
    for (const x of [POOL.x0 - 0.15, POOL.x1 + 0.15]) G.add(at(box(0.3, 0.06, pd, copeM), x, -0.01, (POOL.z0 + POOL.z1) / 2));
    const waterT = tex(32, 32, (x, r) => { px(x, '#4ad8e8', 0, 0, 32, 32); for (let i = 0; i < 30; i++) { const xx = Math.floor(r() * 30), yy = Math.floor(r() * 30); px(x, '#b8f6fa', xx, yy, 2 + Math.floor(r() * 4), 1); } }, 3716);
    const waterM = mat({ map: waterT, rep: [pw / 2.2, pd / 2.2], unlit: 0.55, see: 0.42 });
    const water = flat(pw, pd, waterM, (POOL.x0 + POOL.x1) / 2, WATER_Y, (POOL.z0 + POOL.z1) / 2); G.add(water);
    for (const dx of [-0.25, 0.25]) G.add(rot(at(new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.025, 4, 8, PI), M(0xd8dce4)), 3.9 + dx, 0.0, POOL.z1 + 0.05), 0, PI / 2, 0));
    // ---------------- the entertainer's podium: a white stage with KUDURO on its blue skirt, speakers, torches ----------------
    const [PX, PZ] = PODIUM;
    const skirtT = tex(64, 12, x => { px(x, '#1c64d0', 0, 0, 64, 12); x.font = 'bold 10px monospace'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillStyle = '#ffd43b'; x.fillText('KUDURO', 32, 6.5); }, 3717);
    G.add(at(box(PODIUM_W, 0.06, PODIUM_D, M(0xfaf8f2)), PX, PODIUM_Y - 0.03, PZ));
    G.add(at(box(PODIUM_W - 0.04, PODIUM_Y - 0.06, PODIUM_D - 0.04, M(0x1c64d0)), PX, (PODIUM_Y - 0.06) / 2, PZ));
    G.add(at(new THREE.Mesh(new THREE.PlaneGeometry(PODIUM_W - 0.1, PODIUM_Y - 0.08), mat({ map: skirtT, unlit: 0.5 })), PX, (PODIUM_Y - 0.06) / 2, PZ + PODIUM_D / 2 - 0.01));
    const spk = [];
    for (const s of [-1, 1]) {
      const g = at(new THREE.Group(), PX + s * 2.0, 0, PZ - 0.2); G.add(g);
      g.add(at(box(0.6, 1.2, 0.5, M(0x1a1a20)), 0, 0.6, 0));
      spk.push([0.3, 0.85].map(y => { const c = rot(at(cyl(0.18, 0.12, 0.06, 10, M(0x3a3a44)), 0, y, 0.26), PI / 2, 0, 0); g.add(c); return c; }));
    }
    const torchM = M(0x8a6a4a), flameM = glow(0xffa83a), flames = [];
    for (const s of [-1, 1]) { G.add(at(cyl(0.04, 0.05, 1.6, 5, torchM), PX + s * 1.45, 0.8, PZ + 0.95)); const f = at(cone(0.09, 0.26, 5, flameM), PX + s * 1.45, 1.72, PZ + 0.95); G.add(f); flames.push(f); }
    // bunting over the pool's long sides: two poles each, a line of little flags
    const bunt = new THREE.Group(); G.add(bunt);
    const FLAGC = [0xff5fa2, 0xffd43b, 0x3fb4ff, 0x5ad46b, 0xff8a3c];
    for (const s of [-1, 1]) {
      bunt.add(at(cyl(0.04, 0.04, 3.4, 5, M(0xf4f4f0)), s * 5.6, 1.7, PZ + 0.4)); bunt.add(at(cyl(0.04, 0.04, 3.4, 5, M(0xf4f4f0)), s * 5.6, 1.7, -1.4));
      for (let i = 0; i < 12; i++) { const u = i / 11, z = PZ + 0.4 + (-1.4 - PZ - 0.4) * u, y = 3.3 - 0.35 * Math.sin(u * PI); bunt.add(rot(at(cone(0.13, 0.26, 3, M(FLAGC[i % 5], { unlit: 0.3 })), s * 5.6, y - 0.13, z), PI, 0, 0)); }
    }
    // ---------------- the sunbeds in rows (Kob's in front of the middle), her parasol ----------------
    for (const z of BED_ROWS) for (const x of BED_XS) { const s = sunbed(); s.position.set(x, 0, z); G.add(s); }
    const parasol = at(new THREE.Group(), PARASOL[0], 0, PARASOL[1]); G.add(parasol);
    parasol.add(at(cyl(0.025, 0.025, 2.2, 5, M(0xf4f4f0)), 0, 1.1, 0));
    const canopy = at(new THREE.Group(), 0, 2.15, 0); parasol.add(canopy);
    const canT = tex(32, 8, x => { for (let i = 0; i < 32; i += 8) { px(x, '#f6f6f2', i, 0, 4, 8); px(x, '#2a6ae0', i + 4, 0, 4, 8); } }, 3718);
    const canMesh = new THREE.Mesh(new THREE.ConeGeometry(1.15, 0.45, 8, 1, true), mat({ map: canT, rep: [1, 1], side: THREE.DoubleSide })); canopy.add(canMesh);
    canopy.add(at(ico(0.05, 0, M(0xf4f4f0)), 0, 0.26, 0));
    // ---------------- the pool bar: a thatched hut, a counter, bottles, coconuts ----------------
    const [BX, BZ] = BAR, thatchT = tex(16, 16, (x, r) => { px(x, '#c8a05a', 0, 0, 16, 16); for (let i = 0; i < 16; i += 2) px(x, '#a8803e', 0, i, 16, 1); noise(x, r, 16, 16, ['#d8b06a', '#b89048'], 30); }, 3719);
    const bar = at(new THREE.Group(), BX, 0, BZ); G.add(bar);
    bar.add(at(box(0.7, BAR_Y, 3.0, M(0x8a5a32)), -0.6, BAR_Y / 2, 0));
    bar.add(at(box(0.9, 0.06, 3.2, M(0xc89a5a)), -0.6, BAR_Y + 0.03, 0));
    for (const [sx, sz] of [[-1.0, -1.6], [-1.0, 1.6], [0.9, -1.6], [0.9, 1.6]]) bar.add(at(cyl(0.07, 0.08, 2.7, 5, M(0x7a5a3a)), sx, 1.35, sz));
    bar.add(rot(at(new THREE.Mesh(new THREE.ConeGeometry(2.6, 1.3, 4), mat({ map: thatchT, rep: [3, 2] })), 0, 3.25, 0), 0, PI / 4, 0));
    for (let i = 0; i < 7; i++) bar.add(at(cyl(0.04, 0.04, 0.3, 5, M([0x2a8a4a, 0xd8a03a, 0xe85a3a, 0x3a6ad8][i % 4], { unlit: 0.25 })), 0.65, 1.4 + (i % 2) * 0.4, -1.2 + i * 0.4));
    bar.add(at(box(0.3, 0.9, 3.0, M(0xa87a4a)), 0.75, 1.55, 0));
    for (let i = 0; i < 5; i++) { const c = coconut(); c.position.set(-0.7, BAR_Y + 0.08, -1.0 + i * 0.5); bar.add(c); }
    // ---------------- palms; the clip's villa with columns behind the sunbeds; the cabana on the beach ----------------
    const extras = [];
    const PALMS = [[-9.6, -3.2], [9.8, -6.4], [-10.2, 4.2], [11.2, 5.6], [-7.2, 8.8], [7.4, 9.0], [-11.4, -8.4], [11.8, -9.0], [-15, 1], [15.5, 0.5]];
    const trunk = M(0x9a7a52), frond = M(0x2a8a46), frond2 = M(0x3a9a52);
    PALMS.forEach(([x, z], i) => {
      const p = at(new THREE.Group(), x, 0, z), sg = i % 2 ? -1 : 1; G.add(p); extras.push([p, x, z]);
      for (let j = 0; j < 6; j++) p.add(rot(at(cyl(0.16 - j * 0.01, 0.18 - j * 0.01, 1.0, 6, trunk), 0.04 * j * j * sg, 0.5 + j * 0.95, 0), 0, 0, -0.04 * j * sg));
      const top = at(new THREE.Group(), sg, 5.9, 0); p.add(top);
      for (let j = 0; j < 7; j++) { const h = new THREE.Group(); h.rotation.set(0, j / 7 * TAU, 0.0); const f = at(box(0.5, 0.04, 2.4, j % 2 ? frond : frond2), 0, -0.45, 1.1); f.rotation.x = 0.4; h.add(f); top.add(h); }
    });
    {
      const W = M(0xfffaf0, { unlit: 0.8 }), SH = M(0xf0e6d4, { unlit: 0.7 }), vz = VILLA_Z;   // self-lit: its front faces away from the sun (it read as a flat grey wall in 11 stills, review 1)
      G.add(at(box(22, 0.5, 4.2, W), 0, 0.25, vz + 2.1));                       // the terrace's step
      G.add(at(box(22, 3.6, 3.0, W), 0, 2.3, vz + 5.5));                        // the ground floor behind the colonnade
      G.add(at(box(22, 0.35, 4.6, W), 0, 4.2, vz + 4.7));                       // the colonnade's roof
      for (let i = 0; i < 9; i++) { const x = -10 + i * 2.5; G.add(at(cyl(0.22, 0.24, 3.7, 8, W), x, 2.35, vz + 2.8)); G.add(at(box(0.6, 0.18, 0.6, SH), x, 0.59, vz + 2.8)); G.add(at(box(0.6, 0.18, 0.6, SH), x, 4.12, vz + 2.8)); }
      const winT = tex(16, 24, x => { px(x, '#fffaf0', 0, 0, 16, 24); px(x, '#3a6aa8', 0, 3, 3, 20); px(x, '#3a6aa8', 13, 3, 3, 20); for (let i = 5; i < 23; i += 3) { px(x, '#2a5a98', 0, i, 3, 1); px(x, '#2a5a98', 13, i, 3, 1); } px(x, '#4a6a8a', 4, 6, 8, 17); px(x, '#4a6a8a', 5, 4, 6, 2); px(x, '#8ab0d0', 5, 7, 2, 6); px(x, '#fffaf0', 4, 14, 8, 1); }, 3720);
      for (let i = 0; i < 8; i++) G.add(at(new THREE.Mesh(new THREE.PlaneGeometry(1.6, 2.4), mat({ map: winT, unlit: 0.6 })), -8.75 + i * 2.5, 1.85, vz + 3.99));
      const roofT = tex(16, 8, x => { px(x, '#c8603a', 0, 0, 16, 8); for (let i = 0; i < 16; i += 4) px(x, '#a8482a', i, 0, 1, 8); px(x, '#e07a50', 0, 0, 16, 2); }, 3721);
      G.add(at(box(22.4, 0.4, 0.6, mat({ map: roofT, rep: [10, 1], unlit: 0.5 })), 0, 4.55, vz + 2.45)); G.add(at(box(16.6, 0.4, 0.6, mat({ map: roofT, rep: [8, 1], unlit: 0.5 })), 0, 7.75, vz + 3.2));
      const bougM = [M(0xe8308a, { unlit: 0.45 }), M(0xff5aa8, { unlit: 0.45 }), M(0x3a8a3a, { unlit: 0.3 })];
      for (let i = 0; i < 40; i++) G.add(at(ico(0.28 + hash(i, 3722) * 0.25, 0, bougM[i % 3]), -10.5 + hash(i, 3723) * 21, 0.6 + hash(i, 3724) * 3.6, vz + 2.6 + hash(i, 3725) * 0.4));
      G.add(at(box(16, 3.0, 5.0, W), 0, 5.9, vz + 6.0));                        // the upper floor
      for (let i = 0; i < 6; i++) G.add(at(new THREE.Mesh(new THREE.PlaneGeometry(1.4, 2.0), mat({ map: winT, unlit: 0.6 })), -6.25 + i * 2.5, 5.9, vz + 3.49));
      G.add(at(box(16.6, 0.25, 5.6, W), 0, 7.5, vz + 6.0));
    }
    {
      const cab = at(new THREE.Group(), -8.5, -0.02, DZ0 - 4.6); G.add(cab); extras.push([cab, -8.5, DZ0 - 4.6]);
      const W = M(0xf4f2ea), curtM = mat({ color: 0xffffff, unlit: 0.35, side: THREE.DoubleSide, see: 0.25 });
      for (const [sx, sz] of [[-1.3, -1.3], [1.3, -1.3], [-1.3, 1.3], [1.3, 1.3]]) cab.add(at(cyl(0.07, 0.07, 2.6, 5, W), sx, 1.3, sz));
      cab.add(at(box(2.9, 0.18, 2.9, W), 0, 2.65, 0)); cab.add(at(box(2.2, 0.35, 2.0, M(0xf8f8f4)), 0, 0.18, 0));
      for (const s of [-1, 1]) for (const cz of [-0.9, 0.9]) { const c = at(new THREE.Mesh(new THREE.PlaneGeometry(0.9, 2.4), curtM), s * 1.3, 1.35, cz); c.rotation.y = PI / 2; cab.add(c); }
    }
    // ---------------- the box pets: the aqua-gym class in the pool, the sunbathers ----------------
    const classPets = []; CLASS.zs.forEach((z, r) => CLASS.xs.forEach((x, c) => { const p = pet(r * 6 + c); G.add(p.g); classPets.push({ p, x: x + (r % 2) * 0.35, z }); }));
    const bathers = BED_ORDER.map(([x, z], i) => { const p = pet(40 + i); G.add(p.g); return { p, x, z }; });
    // ---------------- drops, splashes, hearts ----------------
    const dropM = mat({ color: 0xe8fcff, unlit: 0.9 }), sheetM = mat({ color: 0x7ad0f0, unlit: 0.75 }), ringM = mat({ color: 0xf2fdff, unlit: 0.8, see: 0.3 });
    const dropP = Array.from({ length: 160 }, () => { const q = new THREE.Mesh(new THREE.IcosahedronGeometry(1, 0), dropM); q.visible = false; G.add(q); return q; });
    const sheetP = Array.from({ length: 220 }, () => { const q = new THREE.Mesh(new THREE.IcosahedronGeometry(1, 0), sheetM); q.visible = false; G.add(q); return q; });
    const ringP = Array.from({ length: 4 }, () => { const q = new THREE.Mesh(new THREE.TorusGeometry(1, 0.06, 4, 18), ringM); q.rotation.x = PI / 2; q.visible = false; G.add(q); return q; });
    const puddles = Array.from({ length: 3 }, () => { const q = flat(1, 1, mat({ color: 0x5aa8d0, unlit: 0.4, see: 0.3 }), 0, 0.012, 0); q.geometry = new THREE.CircleGeometry(0.5, 12); q.visible = false; G.add(q); return q; });
    const heartM = M(0xff4f9a, { unlit: 0.8 }), hearts = [];
    for (let i = 0; i < 12; i++) { const h = new THREE.Group(); h.add(at(ico(0.1, 0, heartM), -0.075, 0, 0)); h.add(at(ico(0.1, 0, heartM), 0.075, 0, 0)); h.add(rot(at(cone(0.125, 0.18, 4, heartM), 0, -0.11, 0), PI, 0, 0)); h.visible = false; G.add(h); hearts.push(h); }

    // a pet lying on a sunbed at (x, z), its head towards -z: on its back (front 0) to on its front (front 1), rolling
    // about its spine; the group sits so the lying body rests on the pad
    function lie(p, x, z, front, pawUp, coco, look, headsUp = false) {
      p.g.position.set(x, BED_Y - 0.02, z + 0.12); p.g.rotation.set(0, 0, 0);
      p.body.rotation.set(-PI / 2, front * PI, 0, 'XYZ'); p.body.position.set(0, 0.14, 0.45);
      p.head.rotation.set(front > 0.5 ? (headsUp ? -1.05 : -0.25) : 0.45, front < 0.5 ? look : 0, 0);   // headsUp: lying on the front, the head lifted to look ahead
      // a paw up to the sky: on the back the arm swings forward (local -z is up), on the front backward; the coconut stays upright
      if (pawUp > 0) { const up = front < 0.5 ? -1 : 1; p.arms[1].rotation.x = up * PI / 2 * pawUp; p.arms[1].scale.y = 1 + 0.6 * pawUp; p.drink.rotation.x = PI; p.drink.visible = coco; p.drink.scale.set(1.9, 1.9 / (1 + 0.6 * pawUp), 1.9); }   // x1.9, the arm stretch undone: at its own size the cocktail was a few pixels (the critic found none)
      else p.arms.forEach((a, s) => { a.rotation.z = (s ? 1 : -1) * 0.15; });
      p.legs.forEach(l => { l.rotation.x = 0.05; });
    }

    return {
      group: G, sky: null, shadowCol: 0xc4b08a, indoor: false,
      light() { lights(0xa8b4c6, 0xfff0d6, [-0.35, -1, -0.55], 0xcfe8f6, [55, 210], 9); },
      anim(t, P = {}) {
        const s = shotT(t, P), b = beat(t);
        if (P.key) pt(0, P.key[0], P.key[1], P.key[2], P.key[3], P.key[4], P.key[5]);
        U.uWaterY.value = WATER_Y; U.uWaterCol.value.set(0x2ab0c4);
        water.position.y = WATER_Y + 0.006 * Math.sin(t * 2.1);
        foam.position.z = DZ0 - 12.2 + 0.3 * Math.sin(t * 0.9);
        yacht.position.y = -0.42 + 0.06 * Math.sin(t * 0.8); yacht.rotation.z = 0.02 * Math.sin(t * 0.6);
        flames.forEach((f, i) => { f.scale.set(1, 0.8 + 0.3 * Math.abs(Math.sin(t * 9 + i * 2)), 1); });
        const kick = Math.exp(-fr(b) * 6); spk.forEach(cs => cs.forEach(c => { c.scale.set(1 + 0.12 * kick, 1, 1 + 0.12 * kick); }));
        bunt.visible = P.bunting !== false;
        for (const [o, x, z] of extras) o.visible = !cleared(P, x, z);
        // Kob's parasol: furled to open, tilted towards the pool
        const po = P.parasol == null ? 1 : ramp(P.parasol, s);
        canMesh.scale.set(0.12 + 0.88 * po, 1 + 0.6 * (1 - po), 0.12 + 0.88 * po); canMesh.position.y = -0.25 * (1 - po);
        canopy.rotation.x = -(P.parasolTilt || 0) * PI / 180;
        parasol.visible = P.parasol != null;   // off unless a shot asks: its pole stood in the middle of every two-shot at her sunbed (the first sheet)
        // ---- the class in the pool ----
        const nClass = P.noguests ? 0 : P.classN ?? 18, out = P.classOut, nb0 = P.beds ?? 0;
        classPets.forEach((q, i) => {
          const { p } = q; resetPet(p);
          if (i >= nClass) { p.g.visible = false; return; }
          let x = q.x, z = q.z, y = FLOOR_Y, yaw = PI, mode = P.move || 'idle';
          // climbing out to a sunbed: walking from the pool spot to the bed's foot, then lying on it
          if (out && s >= out[0] + i * out[1]) {
            const bed = BED_ORDER[nb0 + i]; if (!bed) { p.g.visible = false; return; }
            const u = cl((s - out[0] - i * out[1]) / out[2]);
            if (u >= 1) { p.g.visible = !cleared(P, bed[0], bed[1]); lie(p, bed[0], bed[1], 0, 0, false, 0); return; }
            x = q.x + (bed[0] - q.x) * u; z = q.z + (bed[1] + 1.1 - q.z) * u;
            y = z > POOL.z1 ? 0 : FLOOR_Y + (0 - FLOOR_Y) * cl((z - (POOL.z1 - 1.2)) / 1.2);
            yaw = Math.atan2(bed[0] - q.x, bed[1] + 1.1 - q.z); mode = 'walk';
          }
          if (cleared(P, x, z)) { p.g.visible = false; return; }
          p.g.visible = true; p.g.position.set(x, y, z);
          if (Array.isArray(P.stare) && mode !== 'walk') yaw = Math.atan2(P.stare[0] - x, P.stare[1] - z);
          const bb = b + (i % 5) * 0.05, ph = fr(bb);
          if (mode === 'turn') { const u = P.turnAt != null ? sm((s - P.turnAt) / 0.3) : 1; yaw += PI * u; }
          p.g.rotation.set(0, yaw, 0);
          if (mode === 'dance' || mode === 'turn') {   // the kuduro: paws pumping at the shoulders, a bob, a sway
            p.body.position.y = 0.05 * Math.abs(Math.sin(bb * PI)); p.body.rotation.z = 0.12 * Math.sin(bb * PI);
            if (mode === 'turn') p.arms.forEach((a, k2) => { a.rotation.z = (k2 ? 1 : -1) * 0.3; });
            else p.arms.forEach((a, k2) => { a.rotation.z = (k2 ? 1 : -1) * (2.7 + 0.22 * Math.sin((bb + k2) * PI)); a.rotation.x = -0.3; a.scale.y = 1.35; });   // high: near level they read as arms held out (review 1)
          } else if (mode === 'up') {   // one paw up, from upAt
            const u = P.upAt != null ? sm((s - P.upAt) / 0.18) : 1;
            p.arms[1].rotation.z = 2.95 * u; p.arms[1].scale.y = 1 + 0.75 * u; p.arms[0].rotation.z = -0.25; p.body.rotation.z = -0.1 * u;   // stretched so the paw clears the head
          } else if (mode === 'hips') {   // the waist alone: the body twists on every beat, the paws on the hips
            p.body.rotation.y = 0.45 * Math.sin(bb * PI); p.body.rotation.z = 0.34 * Math.sin(bb * PI); p.body.position.x = 0.1 * Math.sin(bb * PI);   // a sway that shows over the water
            p.arms.forEach((a, k2) => { a.rotation.z = (k2 ? 1 : -1) * 0.3; });   // close to the body: at 0.75 rad, plus the sway, they read as arms held out (a T pose, review 2)
          } else if (mode === 'heads') {
            p.head.rotation.x = 0.35 * Math.sin(bb * PI); p.head.rotation.z = 0.3 * Math.sin(bb * PI * 0.5); p.arms.forEach((a, k2) => { a.rotation.z = (k2 ? 1 : -1) * 0.35; });
          } else if (mode === 'splash') {   // both paws scooping water forward on every beat
            const sw = Math.sin(ph * PI); p.arms.forEach(a => { a.rotation.x = -0.4 - 1.9 * sw; }); p.body.rotation.x = 0.15 * sw;
          } else if (mode === 'walk') {
            const wb = fr(b * 2); p.body.position.y = 0.05 * Math.abs(Math.sin(wb * PI));
            p.legs.forEach((l, k2) => { l.rotation.x = (k2 ? 1 : -1) * 0.7 * Math.sin(wb * TAU); }); p.arms.forEach((a, k2) => { a.rotation.x = (k2 ? -1 : 1) * 0.6 * Math.sin(wb * TAU); });
          } else {
            p.body.position.y = 0.02 * Math.abs(Math.sin(bb * PI)); p.head.rotation.y = 0.15 * Math.sin(bb * 0.5 * PI);
          }
        });
        // ---- the sunbathers ----
        const nb = P.noguests ? 0 : nb0, bf = P.bedsAt, flip = P.flip, mvObj = P.bedMove && typeof P.bedMove === 'object' ? P.bedMove : null;
        bathers.forEach((q, i) => {
          const { p } = q; resetPet(p);
          const on = i < nb && (!bf || s >= bf[0] + i * bf[1]);
          if (!on || cleared(P, q.x, q.z)) { p.g.visible = false; return; }
          p.g.visible = true;
          const mv = typeof P.bedMove === 'string' ? P.bedMove : 'lie';
          let front = mv === 'front' ? 1 : 0;
          if (flip != null) front = sm((s - flip - (i % 4) * 0.012) / 0.35);
          const pawU = mv === 'paw' ? sm((s - (P.pawAt ?? 0) - (i % 3) * 0.02) / 0.2) : 0;
          const lk = mvObj && mvObj.look ? Math.max(-1.1, Math.min(1.1, Math.atan2(mvObj.look[0] - q.x, q.z - mvObj.look[1]))) : 0;
          lie(p, q.x, q.z, front, pawU, mv === 'paw' && P.coco !== false && s >= (P.cocoAt ?? (P.pawAt ?? 0) + 0.4), lk, !!P.headsUp);   // cocoAt: the cocktail in the paw from then (a toast raises the one they hold)
        });
        // ---- a sheet of water scooped out of the pool, landing on a point; splashes on the water ----
        dropP.forEach(q => { q.visible = false; }); ringP.forEach(q => { q.visible = false; });
        let di = 0;
        sheetP.forEach(q => { q.visible = false; });
        if (P.splashWall) {
          const [x0, z0, x1, z1, s1, spread = 0.8] = P.splashWall;
          for (let j = 0; j < 220; j++) {
            const st = s1 - 0.55 + hash(j, 3730) * 0.1, u = (s - st) / 0.55;
            if (u < 0 || u > 1.5) continue;
            const ax = x0 + (hash(j, 3731) - 0.5) * 2.4, az = z0 + (hash(j, 3732) - 0.5) * 0.8;
            const bx = x1 + (hash(j, 3733) - 0.5) * spread * 2, bz = z1 + (hash(j, 3734) - 0.5) * spread * 0.9, by = 0.6 + hash(j, 3735) * 0.9;
            const q = sheetP[j]; q.visible = true;
            if (u <= 1) q.position.set(ax + (bx - ax) * u, WATER_Y + (by - WATER_Y) * u + Math.sin(u * PI) * 0.9, az + (bz - az) * u);
            else { const f = (u - 1) * 0.55; q.position.set(bx + (bx - ax) * f * 0.3, by - 4.9 * f * f - 1.2 * f, bz + (bz - az) * f * 0.3); if (q.position.y < 0.02) q.visible = false; }
            q.scale.setScalar(0.05 + 0.06 * hash(j, 3736));
          }
        }
        (P.splash || []).forEach(([x, z, s0, size = 1], k2) => {
          const age = s - s0; if (age < 0 || age > 0.9) return;
          for (let j = 0; j < 24 && di < dropP.length; j++) {
            const a = hash(j, 3737) * TAU, v = (1.8 + 1.4 * hash(j, 3738)) * size, sp = (0.6 + 0.9 * hash(j, 3739)) * size, y = WATER_Y + v * age - 4.9 * age * age;
            if (y < WATER_Y - 0.05) continue;
            const q = dropP[di++]; q.visible = true; q.position.set(x + Math.cos(a) * sp * age, y, z + Math.sin(a) * sp * age); q.scale.setScalar((0.04 + 0.03 * hash(j, 3740)) * size);
          }
          const rg = ringP[k2 % ringP.length]; rg.visible = true; rg.position.set(x, WATER_Y + 0.02, z); rg.scale.setScalar((0.3 + age * 1.6) * size);
        });
        // ---- drips off the soaked ones: drops falling from round the head to the floor, and a wet patch at the feet ----
        (P.drips || []).forEach(([x, z, h = 1.25], k2) => {
          for (let j = 0; j < 14 && di < dropP.length; j++) {
            const ph = fr(t * 1.6 + hash(j, k2, 3741)), a = hash(j, k2, 3742) * TAU, r = 0.22 + 0.2 * hash(j, k2, 3743), y = h * (1 - ph * ph);
            const q = sheetP[(j + k2 * 14 + 150) % sheetP.length]; q.visible = true; q.position.set(x + Math.cos(a) * r, Math.max(0.02, y), z + Math.sin(a) * r); q.scale.setScalar(0.035 + 0.02 * hash(j, k2, 3744));
          }
        });
        puddles.forEach((q, k2) => { const pd = (P.drips || [])[k2]; q.visible = !!pd; if (pd) { q.position.set(pd[0], 0.012, pd[1]); q.scale.setScalar(0.95); } });
        // ---- hearts: three pink hearts pop and rise from each point, again every 1.2 s when it loops ----
        hearts.forEach((h, i) => {
          const q = (P.hearts || [])[Math.floor(i / 3)]; h.visible = false; if (!q) return;
          let e = s - q[3] - (i % 3) * 0.3; if (q[4] && e > 0) e %= 1.2;
          if (e < 0 || e > 1.4) return;
          h.visible = true; h.position.set(q[0] + ((i % 3) - 1) * 0.22 + 0.06 * Math.sin(e * 6 + i), q[1] + 0.55 * e, q[2]); h.scale.setScalar(Math.min(1, e * 5) * (1.15 - 0.25 * (e / 1.4)));
          h.rotation.y = (P.heartYaw ?? 0) * PI / 180;
        });
      },
    };
  }
  return { resort: resort() };
}
