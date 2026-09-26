// maps10.js: the "Caramelldansen" map (2026-09-27, the user's queue: "a really Japanese, kawaii clip"). Same contract
// as the other map files, pure in t:
//   matsuri  a shrine's cherry-blossom festival at night (yozakura): a stone lane from a red torii between festival
//            stalls (takoyaki, candy apples, cotton candy, masks, shaved ice, a goldfish-scooping tub; kana signs), a
//            gravel plaza round a yagura tower (platform top at MATSURI.PLAT, a taiko drum at DRUM, red-and-white
//            curtains, a pole with lantern strings fanning out), the shrine hall at the back, a pagoda against the
//            night, cherry trees glowing pink with petals falling, and the lucky-cat display: a stepped stand under a
//            little roof, red felt on every step (row r's top at TIER[0] + r * TIER[1], rows TIER[2] m apart towards
//            -z from DISPLAY, the front row's centre), where the crowd's porcelain lucky cats stand. Kawaii festival pets
//            in yukata (cats, dogs, bunnies, bears, pandas) fill the lane and the Bon Odori ring (RING radii round the
//            tower); they do the Caramelldansen on cue: paws up flapping on the beat, swaying side to side.
//            Shot flags read by anim(t, P): `lane` (how many lane pets dance, nearest the lane mark first; the rest
//            watch `look` [x, z] or the lane mark; dancers face `danceLook` [x, z] or +z), `ring` (how many ring pets
//            have joined: shown and dancing), `ringFace` ('in' | 'out' | 'cw' | 'ccw'), `walk` ([from s, deg/s]: the
//            ring walks round the tower), `clap` ([a, b] cut s: every dancer claps), `freeze` (cut s: everyone stops
//            dead), `fw` (a firework on every bar: true = over the shrine, [x, z] = round that point, far off), `noguests`, `drum` (false hides the taiko), `key`
//            ([x, y, z, r, g, b]: a light on the action), `petals` (0 stops the petals), `clear` ([[x, z, r], ...]: no
//            pet within r of those points: the lens, the squad's marks).
import { mapKit } from './mapkit.js';

export const MATSURI = {
  YAGURA: [0, -2.0], PLAT: 1.1, HALF: 1.3, DRUM: [0, -1.78], DRUMMER: [0, -2.3], POLE: 6.2,
  RING: [3.3, 4.3, 5.3], RING_N: [18, 22, 26],
  LANE: [0.35, 10.0], LANE_X: 1.8, STALL_Z: [6.2, 8.6, 11.0], TORII_Z: 15.2, GOLDFISH: [-1.92, 11.0],
  DISPLAY: [9.0, -7.5], TIER: [0.3, 0.42, 0.62], COLS: 13, ROWS: 4, DX: 0.72, HALL_Z: -15.5,
};
MATSURI.KOB = [MATSURI.DISPLAY[0], MATSURI.DISPLAY[1] - MATSURI.TIER[2]];   // the middle of the second row
MATSURI.KOB_Y = MATSURI.TIER[0] + MATSURI.TIER[1];                          // its step's top

export function buildMatsuriMaps(K) {
  const k = mapKit(K);
  const { THREE, mat, tex, px, noise, box, TAU, PI, hash, beat, grad, cyl, cone, ico, at, rot, flat, lights, pt, stars, fall, prism } = k;
  const M = (c, o = {}) => mat({ color: c, ...o }), glow = c => mat({ color: c, unlit: 1 });
  const sm = x => { const u = Math.min(1, Math.max(0, x)); return u * u * (3 - 2 * u); };
  const [YX, YZ] = MATSURI.YAGURA, PL = MATSURI.PLAT, HF = MATSURI.HALF;

  // ---------- kawaii festival pets ----------
  const FURS = [0xf2eee6, 0xe8a060, 0x7a7a84, 0xd8c2a0, 0x4a3a30, 0xf0d0c0, 0x9a7a5a, 0xc8b8e0, 0xffe0a0];
  const YUK = [['#ff8fb8', '#ffffff'], ['#7fc8f0', '#ffffff'], ['#fff0a0', '#ff8a5a'], ['#b8a0f0', '#ffe0f0'], ['#a8e8c0', '#ff6a8a'],
    ['#ffffff', '#3a6ad8'], ['#ff6a6a', '#ffe8a0'], ['#3a4a8a', '#ffd0e0'], ['#ffc8e0', '#ff5a9a']];
  const OBI = [0xff3a6a, 0xffd23f, 0x3a6ad8, 0xff8a2a, 0x8a3ad8, 0xe8322a, 0x2ab8a0];
  const yukM = YUK.map(([a, c], i) => mat({ map: tex(16, 16, x => {
    px(x, a, 0, 0, 16, 16);
    if (i % 3 === 0) { for (let y = 1; y < 16; y += 5) for (let X = (y % 2) * 2 + 1; X < 16; X += 5) px(x, c, X, y, 2, 2); }   // flowers
    else if (i % 3 === 1) { for (let X = 0; X < 16; X += 4) px(x, c, X, 0, 1, 16); }                                          // stripes
    else { for (let y = 2; y < 16; y += 4) for (let X = (y % 8 === 2 ? 1 : 3); X < 16; X += 4) px(x, c, X, y, 1, 1); }          // dots
  }, 1000 + i) }));
  const blackM = M(0x141418), whiteM = glow(0xffffff), blushM = M(0xff8fb0), getaM = M(0x6a4428), pinkM = M(0xffb0c8);
  function pet(i) {
    const g = new THREE.Group(), body = new THREE.Group(); g.add(body);
    const kind = i % 5, furC = kind === 4 ? 0xf4f4f0 : FURS[(i * 7) % FURS.length], fur = M(furC), yk = yukM[(i * 5) % yukM.length];
    body.add(at(box(0.34, 0.34, 0.26, yk), 0, 0.3, 0));
    body.add(at(box(0.36, 0.07, 0.28, M(OBI[i % OBI.length])), 0, 0.27, 0));
    for (const s of [-1, 1]) { body.add(at(box(0.11, 0.12, 0.12, fur), s * 0.09, 0.08, 0.02)); body.add(at(box(0.12, 0.03, 0.16, getaM), s * 0.09, 0.015, 0.03)); }
    const head = at(box(0.44, 0.38, 0.38, fur), 0, 0.66, 0); body.add(head);
    for (const s of [-1, 1]) {
      if (kind === 4) head.add(at(box(0.13, 0.12, 0.02, blackM), s * 0.1, 0.02, 0.192));   // panda patches
      head.add(at(box(0.07, 0.08, 0.02, blackM), s * 0.1, 0.02, 0.2));
      head.add(at(box(0.025, 0.025, 0.02, whiteM), s * 0.1 - 0.015, 0.04, 0.212));
      head.add(at(box(0.07, 0.035, 0.02, blushM), s * 0.15, -0.07, 0.195));
      if (kind === 0) { head.add(rot(at(cone(0.08, 0.18, 4, fur), s * 0.14, 0.26, 0), 0, PI / 4, 0)); head.add(rot(at(cone(0.045, 0.1, 4, pinkM), s * 0.14, 0.24, 0.03), 0, PI / 4, 0)); }
      else if (kind === 1) head.add(rot(at(box(0.08, 0.22, 0.06, M(new THREE.Color(furC).multiplyScalar(0.7).getHex())), s * 0.24, 0.0, 0), 0, 0, s * 0.3));
      else if (kind === 2) { head.add(at(box(0.08, 0.3, 0.05, fur), s * 0.09, 0.33, 0)); head.add(at(box(0.04, 0.22, 0.02, pinkM), s * 0.09, 0.33, 0.03)); }
      else head.add(rot(at(cyl(0.075, 0.075, 0.05, 6, kind === 4 ? blackM : fur), s * 0.16, 0.2, 0), PI / 2, 0, 0));
    }
    if (kind !== 0) head.add(at(box(0.14, 0.09, 0.05, M(new THREE.Color(furC).lerp(new THREE.Color(0xffffff), 0.5).getHex())), 0, -0.07, 0.2));
    head.add(at(box(0.05, 0.035, 0.02, blackM), 0, -0.04, kind !== 0 ? 0.227 : 0.2));
    if (i % 4 === 1) head.add(rot(at(box(0.12, 0.08, 0.04, M(0xff5a8a)), 0.13, 0.19, 0.12), 0, 0, 0.4));   // a bow
    const arms = [-1, 1].map(s => { const a = new THREE.Group(); a.position.set(s * 0.21, 0.44, 0); a.add(at(box(0.09, 0.24, 0.09, yk), 0, -0.12, 0)); a.add(at(box(0.1, 0.08, 0.1, fur), 0, -0.27, 0)); body.add(a); return a; });
    return { g, body, head, arms, i };
  }
  const shM = mat({ shadow: 0.5 });
  function petShadow(G) { const s = new THREE.Mesh(new THREE.PlaneGeometry(0.75, 0.75), shM); s.rotation.x = -PI / 2; s.position.y = 0.012; G.add(s); return s; }
  // a pet's pose this frame: 0 watching, 1 the Caramelldansen, 2 clapping; b = beats (frozen beats hold the pose)
  function pose(p, mode, b) {
    const { body, arms, head } = p;
    const c = Math.cos(PI * b), sway = mode ? 0.13 * Math.sign(c) * Math.pow(Math.abs(c), 0.7) : 0;
    body.rotation.z = mode === 1 ? sway : mode === 2 ? sway * 0.4 : 0; body.position.y = mode ? 0.02 * Math.abs(Math.sin(PI * b)) : 0;
    head.rotation.z = mode === 1 ? -sway * 0.5 : 0.04 * Math.sin(b * 0.7 + p.i);
    const kk = Math.pow(0.5 + 0.5 * Math.cos(TAU * b), 1.4);
    arms.forEach((a, j) => {
      const s = j ? 1 : -1;
      if (mode === 1) a.rotation.set(0.95 * kk, 0, s * (PI - 0.34));                     // paws up by the ears, flapping forward on the beat
      else if (mode === 2) a.rotation.set(-1.35, 0, -s * (0.22 + 0.2 * kk));             // clapping in front, paws meeting on the beat
      else a.rotation.set(0, 0, s * 0.1);
    });
  }

  // =====================================================================================================================
  function matsuri() {
    const G = new THREE.Group();
    // ---- the ground: pale gravel round the tower, a stone lane from the torii, dark earth beyond ----
    const gravelT = tex(32, 32, (x, r) => { px(x, '#c4b8b0', 0, 0, 32, 32); noise(x, r, 32, 32, ['#b8aca4', '#d2c8c0', '#bcb0a8', '#dad0c8'], 360); }, 1101);
    G.add(flat(90, 90, mat({ map: tex(16, 16, (x, r) => { px(x, '#3a3230', 0, 0, 16, 16); noise(x, r, 16, 16, ['#342c2a', '#403634', '#2e2826'], 60); }, 1102), rep: [40, 40] }), 0, -0.002, -10));
    G.add(flat(26, 22, mat({ map: gravelT, rep: [13, 11] }), 3.0, 0, -4.5));
    const laneT = tex(16, 16, (x, r) => { px(x, '#8a8680', 0, 0, 16, 16); noise(x, r, 16, 16, ['#7e7a74', '#96928c'], 50); px(x, '#6a6660', 0, 7, 16, 1); px(x, '#6a6660', 0, 15, 16, 1); px(x, '#6a6660', 7, 0, 1, 8); px(x, '#6a6660', 15, 8, 1, 8); }, 1103);
    G.add(flat(MATSURI.LANE_X * 2 + 1.2, 12, mat({ map: laneT, rep: [2.5, 8] }), 0, 0.004, 12.0));
    // ---- the sky: deep blue into a pink glow, stars, a big pale moon behind the pagoda ----
    G.add(stars(160, 80, 1104, 0xfff4ff, 0.18));
    const moon = at(new THREE.Mesh(new THREE.CircleGeometry(5.5, 20), mat({ color: 0xfff4dc, unlit: 1, nofog: 1 })), -26, 30, -72); moon.lookAt(0, 4, 0); G.add(moon);
    // ---- the pagoda, the forest and the shrine hall at the back ----
    const roofM = M(0x1e2426), redM = M(0xc8322a), redGlow = mat({ color: 0xd8382e, unlit: 0.25 });
    const pagoda = new THREE.Group();
    for (let i = 0; i < 5; i++) { const w = 4.4 - i * 0.55, y = 1.9 + i * 2.6; pagoda.add(at(box(w, 2.2, w, redGlow), 0, y, 0)); pagoda.add(at(box(w + 1.9, 0.28, w + 1.9, roofM), 0, y + 1.25, 0)); pagoda.add(at(box(w * 0.5, 0.5, 0.05, glow(0xffc870)), 0, y, w / 2 + 0.03)); }
    pagoda.add(at(cyl(0.12, 0.12, 4.2, 5, M(0x8a7a3a)), 0, 16.2, 0)); G.add(at(pagoda, -15, 0, -30));
    const forestM = M(0x14201a);
    for (let i = 0; i < 26; i++) { const a = -1.2 + i / 25 * 2.4, R = 22 + hash(i, 1105) * 6, h = 9 + hash(i, 1106) * 7; G.add(at(cone(2.4 + hash(i, 1107) * 1.6, h, 6, forestM), Math.sin(a) * R, h / 2, -8 - Math.cos(a) * R)); }
    const HZ = MATSURI.HALL_Z, hall = new THREE.Group(), shojiT = tex(16, 16, x => { px(x, '#f4ead0', 0, 0, 16, 16); for (let X = 0; X < 16; X += 4) px(x, '#5a3a22', X, 0, 1, 16); for (let y = 0; y < 16; y += 4) px(x, '#5a3a22', 0, y, 16, 1); x.fillStyle = 'rgba(255,220,150,0.8)'; x.fillRect(1, 1, 3, 3); });
    hall.add(at(box(13, 0.7, 7, M(0x8a847a)), 0, 0.35, 0));
    hall.add(at(box(11, 3.6, 5.4, mat({ map: shojiT, rep: [8, 3], unlit: 0.2 })), 0, 2.5, 0));
    for (const x of [-5.4, -2.7, 0, 2.7, 5.4]) hall.add(at(box(0.36, 3.8, 0.36, redM), x, 2.6, 2.8));
    hall.add(at(prism(5.2, 14.6, roofM), 0, 5.6, 0)); hall.add(at(box(14.4, 0.25, 8.6, roofM), 0, 4.45, 0));
    const rope = at(cyl(0.2, 0.2, 7.2, 8, M(0xd8c07a)), 0, 3.9, 2.95); rope.rotation.z = PI / 2; hall.add(rope);
    for (let i = 0; i < 7; i++) hall.add(at(box(0.16, 0.5, 0.02, whiteM), -3 + i, 3.45, 3.12));   // the zigzag paper strips
    hall.add(at(box(1.4, 0.8, 0.7, M(0x6a4428)), 0, 1.1, 3.4));   // the offering box
    G.add(at(hall, 0, 0, HZ));
    // ---- the torii at the lane's end ----
    const torii = new THREE.Group();
    for (const s of [-1, 1]) { torii.add(at(cyl(0.2, 0.24, 4.4, 8, redM), s * 2.3, 2.2, 0)); torii.add(at(box(0.6, 0.4, 0.6, M(0x1a1a1a)), s * 2.3, 0.2, 0)); }
    torii.add(at(box(6.6, 0.32, 0.5, M(0x141414)), 0, 4.55, 0)); torii.add(at(box(6.0, 0.22, 0.4, redM), 0, 4.3, 0)); torii.add(at(box(5.6, 0.22, 0.3, redM), 0, 3.5, 0));
    torii.add(at(box(0.5, 0.75, 0.12, M(0x1a1a1a)), 0, 3.95, 0.16));
    G.add(at(torii, 0, 0, MATSURI.TORII_Z));
    // ---- the stalls along the lane: striped awnings, kana signs lit from inside, wares, bulbs ----
    const kanaSign = (txt, bg, fg) => tex(64, 16, x => { px(x, bg, 0, 0, 64, 16); px(x, fg, 0, 0, 64, 1); px(x, fg, 0, 15, 64, 1); x.fillStyle = fg; x.font = 'bold 12px sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(txt, 32, 8.5); });
    const STALLS = [['たこやき', '#ffffff', '#d8322a'], ['りんごあめ', '#ffe8f0', '#e8325a'], ['わたあめ', '#e8f4ff', '#3a6ad8'], ['おめん', '#fff4d0', '#2a2a2a'], ['きんぎょ', '#e8fbff', '#e86a1a'], ['かきごおり', '#ffffff', '#2a8ad8']];
    const stripe = (a, c) => tex(16, 16, x => { px(x, a, 0, 0, 16, 16); for (let X = 0; X < 16; X += 4) px(x, c, X, 0, 2, 16); });
    const awnT = [stripe('#e8322a', '#ffffff'), stripe('#3a6ad8', '#ffffff'), stripe('#ff8fb8', '#ffffff')];
    MATSURI.STALL_Z.forEach((z, zi) => [-1, 1].forEach(side => {
      const si = zi * 2 + (side > 0 ? 1 : 0), [txt, bg, fg] = STALLS[si], x = side * (MATSURI.LANE_X + 1.0), st = new THREE.Group();
      st.add(at(box(0.9, 0.95, 2.0, M(0x8a5a3a)), 0, 0.475, 0));                                       // the counter
      st.add(at(box(0.92, 0.12, 2.04, mat({ map: awnT[si % 3], rep: [1, 2] })), 0, 0.9, 0));             // its striped top
      for (const dz of [-0.95, 0.95]) st.add(at(box(0.08, 2.3, 0.08, M(0x6a4428)), -side * 0.4, 1.15, dz));
      const awn = at(box(1.5, 0.08, 2.3, mat({ map: awnT[si % 3], rep: [2, 3] })), -side * 0.15, 2.35, 0); awn.rotation.z = side * 0.28; st.add(awn);
      st.add(rot(at(new THREE.Mesh(new THREE.PlaneGeometry(1.9, 0.48), mat({ map: kanaSign(txt, bg, fg), unlit: 0.9 })), -side * 0.47, 2.0, 0), 0, -side * PI / 2, 0));
      st.add(at(box(0.12, 0.14, 0.12, glow(0xffe0a0)), -side * 0.3, 1.75, 0.5));                        // a bare bulb
      for (let q = 0; q < 3; q++) st.add(at(box(0.16, 0.16, 0.16, M([0xff4a4a, 0xffd23f, 0x7ad84a, 0xff8fb8, 0x3ad0ff][(si + q) % 5])), -side * 0.2, 1.03, -0.6 + q * 0.6));   // wares on the counter
      if (si === 4) {   // the goldfish tub in front of the counter, on the lane side
        st.add(at(box(0.85, 0.32, 1.7, M(0x3a8ad8)), -side * 0.88, 0.16, 0));
        st.add(flat(0.72, 1.56, mat({ color: 0x5ac8f8, unlit: 0.35 }), -side * 0.88, 0.325, 0));
      }
      G.add(at(st, x, 0, z));
    }));
    const fish = [];
    for (let i = 0; i < 7; i++) { const f = box(0.1, 0.03, 0.05, glow(i % 3 ? 0xff7a2a : 0xff3a3a)); G.add(f); fish.push(f); }
    // stone lanterns along the lane
    const stoneM = M(0x8a8a86), toroLit = glow(0xffd890);
    for (const z of [7.4, 9.8, 12.2, 14.2]) for (const s of [-1, 1]) {   // none at the plaza's edge: it filled the plaza's low shots
      const g = new THREE.Group(); g.add(at(box(0.5, 0.15, 0.5, stoneM), 0, 0.075, 0)); g.add(at(cyl(0.1, 0.12, 0.7, 6, stoneM), 0, 0.5, 0)); g.add(at(box(0.44, 0.3, 0.44, toroLit), 0, 1.0, 0)); g.add(at(cone(0.42, 0.3, 4, stoneM), 0, 1.3, 0));
      G.add(rot(at(g, s * (MATSURI.LANE_X + 0.25), 0, z - 1.2), 0, PI / 4, 0));
    }
    // ---- the yagura: a wooden scaffold, the platform at PL, red-and-white curtains, a low railing, the taiko ----
    const Y = new THREE.Group(), curT = tex(16, 16, x => { for (let X = 0; X < 16; X++) px(x, (Math.floor(X / 4) % 2) ? '#ffffff' : '#e8322a', X, 0, 1, 16); });
    for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) Y.add(at(box(0.16, PL + 0.4, 0.16, M(0x6a4428)), sx * (HF - 0.08), (PL + 0.4) / 2, sz * (HF - 0.08)));
    Y.add(at(box(HF * 2, 0.12, HF * 2, M(0x7a5234)), 0, PL - 0.06, 0));
    const curM = mat({ map: curT, rep: [6, 1], unlit: 0.1 });
    for (const [x, z, ry] of [[0, HF, 0], [0, -HF, PI], [HF, 0, PI / 2], [-HF, 0, -PI / 2]]) Y.add(rot(at(new THREE.Mesh(new THREE.PlaneGeometry(HF * 2, PL - 0.12), curM), x, (PL - 0.12) / 2, z), 0, ry, 0));
    for (const [x, z, w, d] of [[0, HF - 0.03, HF * 2, 0.05], [0, -HF + 0.03, HF * 2, 0.05], [HF - 0.03, 0, 0.05, HF * 2], [-HF + 0.03, 0, 0.05, HF * 2]]) Y.add(at(box(w, 0.05, d, M(0x5a3a22)), x, PL + 0.26, z));   // the low railing
    Y.add(at(cyl(0.07, 0.09, MATSURI.POLE - PL, 6, M(0x6a4428)), 0, PL + (MATSURI.POLE - PL) / 2, -HF + 0.2));   // the lantern pole at the back
    const drum = new THREE.Group(), [DX, DZ] = MATSURI.DRUM;
    // a small taiko on a low stand, its head tilted up towards the drummer standing behind it (at DRUMMER): at the camera's
    // height she shows from the waist up (a big upright drum hid all of her but the ears)
    const TILT = -0.62, AX = [0, Math.cos(TILT), Math.sin(TILT)];
    for (const dx of [-0.17, 0.17]) drum.add(at(box(0.05, 0.26, 0.05, M(0x5a3a22)), dx, 0.13, 0.04));
    const barrel = at(cyl(0.24, 0.24, 0.3, 10, M(0xa8642a)), 0, 0.3, 0); barrel.rotation.x = TILT; drum.add(barrel);
    for (const e of [-1, 1]) drum.add(rot(at(cyl(0.245, 0.245, 0.04, 10, M(0x2a1a12)), 0, 0.3 + e * 0.13 * AX[1], e * 0.13 * AX[2]), TILT, 0, 0));   // the tacked rims
    const skin = rot(at(cyl(0.225, 0.225, 0.02, 10, M(0xf4ead0)), 0, 0.3 + 0.155 * AX[1], 0.155 * AX[2]), TILT, 0, 0); drum.add(skin);
    drum.position.set(DX - YX, PL, DZ - YZ); Y.add(drum);
    G.add(at(Y, YX, 0, YZ));
    // lantern strings from the pole's top to posts round the plaza
    const lantT = [tex(8, 16, x => { px(x, '#ff4a3a', 0, 0, 8, 16); px(x, '#1a1a1a', 0, 0, 8, 2); px(x, '#1a1a1a', 0, 14, 8, 2); px(x, '#ffd0a0', 2, 5, 4, 6); }), tex(8, 16, x => { px(x, '#fff4e0', 0, 0, 8, 16); px(x, '#1a1a1a', 0, 0, 8, 2); px(x, '#1a1a1a', 0, 14, 8, 2); px(x, '#e8322a', 3, 4, 2, 8); })];
    const lanM = lantT.map(m => mat({ map: m, unlit: 0.9 })), lanterns = [], top = [YX, MATSURI.POLE, YZ - HF + 0.2];
    for (let i = 0; i < 9; i++) {
      const a = PI * 0.08 + i / 8 * PI * 1.84, R = 10.5, end = [YX + Math.sin(a) * R, 3.4, YZ + Math.cos(a) * R];
      if (end[0] > 3.5 && end[2] < -4) continue;   // keep the lucky-cat display's sky clear
      G.add(at(cyl(0.08, 0.1, 3.4, 5, M(0x5a3a22)), end[0], 1.7, end[2]));
      const dx = end[0] - top[0], dy = end[1] - top[1], dz = end[2] - top[2], L = Math.hypot(dx, dy, dz);
      const line = at(box(0.02, 0.02, L, M(0x1a1a1a)), (top[0] + end[0]) / 2, (top[1] + end[1]) / 2, (top[2] + end[2]) / 2); line.lookAt(end[0], end[1], end[2]); G.add(line);
      for (let q = 1; q <= 6; q++) { const u = q / 7, l = new THREE.Group(); l.add(at(cyl(0.17, 0.17, 0.38, 8, lanM[(q + i) % 2]), 0, -0.26, 0)); l.add(at(box(0.26, 0.05, 0.26, blackM), 0, -0.05, 0)); G.add(at(l, top[0] + dx * u, top[1] + dy * u - 0.35 * Math.sin(u * PI), top[2] + dz * u)); lanterns.push([l, i * 7 + q]); }
    }
    // ---- cherry trees in bloom, lit from below ----
    const blossomT = tex(16, 16, (x, r) => { px(x, '#ffb8d0', 0, 0, 16, 16); noise(x, r, 16, 16, ['#ffc8dc', '#ff9ec0', '#ffe0ec', '#f48ab0'], 140); }, 1110);
    const blossomM = mat({ map: blossomT, unlit: 0.6 }), trunkM = M(0x3a2420);
    const TREES = [[-4.2, 6.0], [4.4, 7.4], [-4.6, 11.4], [4.3, 12.4], [-8.4, 1.0], [-8.9, -5.2], [-6.0, -9.8], [5.2, -11.8], [8.8, 2.8], [14.6, -9.5], [3.0, -10.2], [-12.0, -2.4], [11.8, -1.6]];
    TREES.forEach(([x, z], i) => {
      const tr = new THREE.Group(), h = 2.6 + hash(i, 1111) * 0.8;
      tr.add(rot(at(cyl(0.14, 0.22, h, 6, trunkM), 0, h / 2, 0), 0, 0, (hash(i, 1112) - 0.5) * 0.3));
      for (let q = 0; q < 4; q++) tr.add(at(ico(1.0 + hash(i, q + 1113) * 0.7, 0, blossomM), (hash(i, q + 1114) - 0.5) * 2.2, h + 0.4 + hash(i, q + 1115) * 0.9, (hash(i, q + 1116) - 0.5) * 2.0));
      G.add(at(tr, x, 0, z));
    });
    const petM = mat({ color: 0xffc0d8, unlit: 0.6, side: THREE.DoubleSide }), petG = new THREE.PlaneGeometry(0.07, 0.07), petalRuns = [];
    for (const [x, z, n, seed] of [[0, 8.5, 90, 1120], [0, -2, 110, 1121], [8.5, -6.5, 70, 1122]]) { const pg = new THREE.Group(); pg.position.set(x, 0, z); G.add(pg); petalRuns.push([pg, fall(pg, n, petM, petG, { w: 14, top: 7, speed: 0.55, spin: 1.7, drift: 0.9, seed })]); }
    // ---- the lucky-cat display: a stepped stand, red felt, a little roof, a plaque ----
    const [DXc, DZc] = MATSURI.DISPLAY, [T0, TH, TD] = MATSURI.TIER, W = MATSURI.COLS * MATSURI.DX + 0.7;
    const feltT = tex(16, 16, (x, r) => { px(x, '#b8222a', 0, 0, 16, 16); noise(x, r, 16, 16, ['#a81e26', '#c82a32'], 40); px(x, '#e8c24a', 0, 0, 16, 1); }, 1130);
    const disp = new THREE.Group();
    for (let r = 0; r < MATSURI.ROWS; r++) { const topY = T0 + r * TH; disp.add(at(box(W, topY, TD + 0.01, mat({ map: feltT, rep: [W / 1.2, 1] })), 0, topY / 2, -r * TD)); }
    const backZ = -(MATSURI.ROWS - 0.5) * TD - 0.2;
    disp.add(at(box(W + 0.4, 4.2, 0.2, M(0x3a2418)), 0, 2.1, backZ));
    for (const s of [-1, 1]) { disp.add(at(box(0.2, 4.0, 0.2, redM), s * (W / 2 + 0.1), 2.0, 0.35)); disp.add(at(box(0.2, 4.0, 0.2, redM), s * (W / 2 + 0.1), 2.0, backZ)); }
    disp.add(at(box(W + 1.6, 0.22, -backZ + 1.4, roofM), 0, 4.1, backZ / 2 + 0.3));
    const plaqueT = tex(48, 16, x => { px(x, '#2a1a12', 0, 0, 48, 16); px(x, '#e8c24a', 0, 0, 48, 1); px(x, '#e8c24a', 0, 15, 48, 1); x.fillStyle = '#ffe8a0'; x.font = 'bold 12px sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('招き猫', 24, 8.5); });
    disp.add(at(new THREE.Mesh(new THREE.PlaneGeometry(2.2, 0.72), mat({ map: plaqueT, unlit: 0.6 })), 0, 3.62, 0.46));
    const dispLant = [];
    for (let q = 0; q < 7; q++) { if (q === 3) continue;   // none in front of the plaque
      const lx = -W / 2 + 0.6 + q * (W - 1.2) / 6, l = new THREE.Group(); l.add(at(cyl(0.16, 0.16, 0.34, 8, lanM[q % 2]), 0, -0.24, 0)); G.add(at(l, DXc + lx, 3.9, DZc + 0.55)); dispLant.push([l, 90 + q]); disp.add(at(box(0.02, 0.2, 0.02, blackM), lx, 3.95, 0.55)); }
    G.add(at(disp, DXc, 0, DZc));
    // ---- the pets: the lane's (stall keepers and strollers) and the ring's ----
    const LANE_SPOTS = [[1.45, 9.3], [-1.55, 9.4], [1.3, 11.4], [-0.45, 11.7], [0.6, 12.5], [-1.3, 12.4], [1.3, 7.6], [-0.3, 7.7], [0.9, 6.3], [-1.2, 6.1],
      [1.4, 13.4], [-0.6, 13.6], [0.4, 5.0], [-1.4, 4.8]];   // clear of the squad's lane marks (about 1 m round LANE and Sadi beside it)
    const [LX, LZ] = MATSURI.LANE;
    const laneOrder = LANE_SPOTS.map((p, i) => [Math.hypot(p[0] - LX, p[1] - LZ), i]).sort((a, c) => a[0] - c[0]).map(p => p[1]);
    const lane = LANE_SPOTS.map(([x, z], i) => { const p = pet(i); p.g.position.set(x, 0, z); p.home = [x, z]; p.rank = laneOrder.indexOf(i); p.sh = petShadow(G); p.sh.position.set(x, 0.012, z); G.add(p.g); return p; });
    const ring = [];
    MATSURI.RING.forEach((R, ri) => { const n = MATSURI.RING_N[ri]; for (let q = 0; q < n; q++) { const p = pet(40 + ring.length); p.a = (q + 0.5 * (ri % 2)) / n * TAU; p.R = R + (hash(ring.length, 1140) - 0.5) * 0.25; p.sh = petShadow(G); G.add(p.g); ring.push(p); } });
    const ringOrder = ring.map((p, i) => [hash(i, 1141) + (p.R > 4.8 ? 1 : p.R > 3.8 ? 0.5 : 0), i]).sort((a, c) => a[0] - c[0]).map(p => p[1]);   // inner rings fill first
    ring.forEach((p, i) => { p.rank = ringOrder.indexOf(i); });
    // ---- fireworks over the shrine: a burst on every bar of a shot that asks for them ----
    const FW = [0, 1].map(() => { const g = new THREE.Group(), parts = [], m = mat({ color: 0xffffff, unlit: 1, nofog: 1 }); for (let q = 0; q < 60; q++) { const s = box(1.0, 1.0, 1.0, m); g.add(s); parts.push(s); } G.add(g); return { g, parts, m }; });   // big sparks: 0.4 m ones read as specks at 45 m
    const DIRS = Array.from({ length: 60 }, (_, q) => { const y = 1 - 2 * (q + 0.5) / 60, r = Math.sqrt(1 - y * y), a = q * 2.39996; return [Math.cos(a) * r, y, Math.sin(a) * r]; });
    const FWC = [0xff5a9a, 0xffd23f, 0x5ad8ff, 0xb46aff, 0x7aff8a, 0xff8a3a];

    return {
      group: G, sky: grad([[0, '#07061c'], [0.45, '#1a1440'], [0.8, '#4a2a5e'], [1, '#8a4a78']]), shadowCol: 0x2a2230,
      light() {
        lights(0x8a7a86, 0xc8bce8, [0.35, -1, -0.45], 0x2c1c46, [32, 95], 8.5);   // a warm festival night: lantern-lit, pastel
        pt(0, YX, PL + 2.4, YZ + 1.2, 1.7, 1.1, 0.7);          // the tower's lanterns
        pt(1, 0, 2.6, 9.6, 1.6, 1.15, 0.8);                    // the lane
        pt(2, DXc, 3.2, DZc + 2.6, 1.6, 1.25, 1.0);            // the display
      },
      anim(t, P = {}) {
        const b0 = beat(t), frozen = P.freeze != null && t >= P.freeze, b = frozen ? beat(P.freeze) : b0;
        if (P.key) pt(3, P.key[0], P.key[1], P.key[2], P.key[3], P.key[4], P.key[5]);
        lanterns.forEach(([l, s]) => { l.rotation.z = 0.07 * Math.sin(t * 1.3 + s); });
        dispLant.forEach(([l, s]) => { l.rotation.z = 0.06 * Math.sin(t * 1.1 + s); });
        petalRuns.forEach(([pg, run]) => { pg.visible = P.petals !== 0; if (pg.visible) run(t); });
        const [GX, GZ] = MATSURI.GOLDFISH;
        fish.forEach((f, i) => { const a = t * (0.5 + 0.13 * i) + i * 0.9, rr = 0.18 + 0.05 * (i % 3); f.position.set(GX + Math.cos(a) * rr * 0.9, 0.335, GZ + Math.sin(a) * rr * 2.4); f.rotation.y = -a; });
        drum.visible = P.drum !== false;
        // the pets
        const look = P.look || [LX, LZ], clapping = !!P.clap && t >= P.clap[0] && t < P.clap[1];
        const nLane = P.noguests ? -1 : P.lane ?? 0;
        const cleared = (x, z) => (P.clear || []).some(([cx, cz, r]) => (x - cx) ** 2 + (z - cz) ** 2 < r * r);
        lane.forEach(p => {
          const on = !P.noguests && !cleared(p.home[0], p.home[1]), dance = on && p.rank < nLane; p.g.visible = p.sh.visible = on;
          if (!on) return;
          const [x, z] = p.home;
          p.g.rotation.y = dance ? (P.danceLook ? Math.atan2(P.danceLook[0] - x, P.danceLook[1] - z) : 0) : Math.atan2(look[0] - x, look[1] - z);
          pose(p, dance ? (clapping ? 2 : 1) : 0, b + (dance ? 0 : p.i * 0.37));
        });
        const nRing = P.noguests ? 0 : P.ring ?? 0, walk = P.walk ? Math.max(0, (frozen ? P.freeze : t) - P.walk[0]) * P.walk[1] * PI / 180 : 0;
        const face = { in: 0, out: PI, cw: -PI / 2, ccw: PI / 2 }[P.ringFace || 'in'] || 0;
        ring.forEach(p => {
          const on = p.rank < nRing; p.g.visible = p.sh.visible = on; if (!on) return;
          const a = p.a + walk, x = YX + Math.sin(a) * p.R, z = YZ + Math.cos(a) * p.R;
          if (cleared(x, z)) { p.g.visible = p.sh.visible = false; return; }
          p.g.position.set(x, 0, z); p.sh.position.set(x, 0.012, z); p.g.rotation.y = Math.atan2(YX - x, YZ - z) + face;
          pose(p, clapping ? 2 : 1, b);
        });
        // fireworks: the current bar's burst and the one before, 2.4 s each
        FW.forEach(F => { F.g.visible = false; });
        if (P.fw) {
          const spb = 1 / (beat(1) - beat(0)), n = Math.floor(b0 / 4);
          for (const bar of [n - 1, n]) {
            const age = (b0 - bar * 4) * spb;
            if (age < 0 || age > 2.4) continue;
            const F = FW[((bar % 2) + 2) % 2], grow = 1 - Math.exp(-age * 2.4), fade = 1 - sm((age - 1.4) / 1.0);
            const [fx, fz] = Array.isArray(P.fw) ? P.fw : [0, -47], cx = fx - 9 + 18 * hash(bar, 1150), cy = 17 + 7 * hash(bar, 1151), cz = fz + 3 - 6 * hash(bar, 1152);
            F.g.visible = true; F.m.uniforms.uCol.value.set(FWC[((bar % FWC.length) + FWC.length) % FWC.length]);
            F.parts.forEach((s, q) => { const [dx, dy, dz] = DIRS[q], R = 10 * grow; s.position.set(cx + dx * R, cy + dy * R - 1.6 * age * age, cz + dz * R); s.scale.setScalar(Math.max(0.01, fade)); });
          }
        }
      },
    };
  }
  return { matsuri: matsuri() };
}
