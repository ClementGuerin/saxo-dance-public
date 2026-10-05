// maps30.js: the "DtMF" map (2026-10-05 2nd, Bad Bunny, 2025; the album's world: Puerto Rico, two white plastic chairs
// among plantain plants on its cover, a frog for a mascot). Same contract as the other map files, pure in t:
//   marquesina  a family party at night at a pastel concrete house: the carport (marquesina) under its flat slab (the
//               dance floor, MARQ.DANCE; string lights, the speaker, the cooler, pet guests dancing salsa), and the yard
//               beside it: the two white plastic chairs among the plantains (MARQ.CHAIRS, the photo spot, facing +z),
//               the domino table in front of them (MARQ.TABLE) with Kob's chair, the dominoes and the instant camera
//               on its little tripod (MARQ.CAM, its lens facing the chairs), a mango tree, the low front wall with
//               iron bars, the street and the neighbours' houses, the hills with house lights, a crescent moon.
// The frog (`frog`): a cartoon toad with a crest over its eyes, a map object posed by its flag, the photobomber.
// Flags: stop (s: everything freezes, the photo), noguests, guests ('dance' | 'watch' | 'cheer'), stare ([x, z]: the
// guests turn there), tripod ({ x, y, z, yaw (deg, 0: the lens to -z), blink: [s0, s1] (the self-timer's red light,
// faster towards s1), flash: s (a white burst out of its flash window, the yard lit white), eject: s (the print slides
// out of its slot), print (the print sticks out already), hide } or false; not `cam`: a shot's own camera move), photos (n: failed prints fanned on the
// table), frog ({ x, y, z, yaw (deg, 0: facing +z), pose: 'sit' | 'hop' | 'leap' | 'press' | 'puff', at, to: [x, y,
// z], dur, arc (m), scale, hide }; a hop or a leap flies from (x, y, z) to `to` over [at, at + dur] and lands
// sitting; press bounces on the shutter at `at`; puff swells its throat on every beat), flash ([s]: the set lit
// white), clear ([[x, z, r]]: no guest or plantain there), key [x, y, z, r, g, b].
import { mapKit } from './mapkit.js';

export const MARQ = {
  HOUSE_Z: -4.6, SLAB_Y: 3.0,
  PORCH: [-7.6, -0.4, -4.6, 1.4],                 // the carport's slab: x0, x1, z0, z1
  DANCE: [-4.0, -1.5],                            // the carport's dance floor
  CHAIRS: [[3.5, -2.35], [4.5, -2.35]], CHAIR_Y: 0.42,   // the two white plastic chairs (seat tops), facing +z
  TABLE: [4.0, 2.6], TABLE_Y: 0.56,               // the domino table (its top), the camera on its -z edge
  CAM: [4.0, 0.84, 2.3],                          // the instant camera's lens on its tripod, facing -z (the chairs 4.65 m away)
  KOB_SEAT: [3.0, 2.75],                          // Kob's plastic chair at the table, facing +x (nearer, her knees came up through its top)
  FROG: [4.38, 0.56, 2.72],                       // the frog's spot on the table, across from Kob
  FENCE_Z: 5.4,
};

export function buildFotoMaps(K) {
  const k = mapKit(K);
  const { THREE, mat, tex, px, noise, box, TAU, PI, beat, cyl, cone, ico, at, rot, flat, lights, pt, hash, merged, fr, stars, U } = k;
  const M = (c, o = {}) => mat({ color: c, ...o }), glow = (c, u = 1) => mat({ color: c, unlit: u });
  const shotT = (t, P) => P.t0 != null ? t - P.t0 : 0;
  const cl = x => Math.max(0, Math.min(1, x)), sm = x => { x = cl(x); return x * x * (3 - 2 * x); };
  const cleared = (P, x, z) => (P.clear || []).some(([cx, cz, r]) => (x - cx) ** 2 + (z - cz) ** 2 < r * r);
  const pmod = (a, n) => ((a % n) + n) % n;
  const { HOUSE_Z, SLAB_Y, PORCH, DANCE, CHAIRS, CHAIR_Y, TABLE, TABLE_Y, CAM, KOB_SEAT, FROG, FENCE_Z } = MARQ;

  // ---------- a white plastic chair (the monobloc): seat, back, arms, four legs; facing +z ----------
  const chairM = M(0xf2f1ec, { unlit: 0.18 });
  function plasticChair() {
    const g = new THREE.Group();
    g.add(at(box(0.5, 0.05, 0.46, chairM), 0, CHAIR_Y - 0.025, 0));
    const back = at(new THREE.Group(), 0, CHAIR_Y, -0.22); back.rotation.x = -0.14; g.add(back);
    back.add(at(box(0.5, 0.5, 0.04, chairM), 0, 0.27, 0));
    for (const x of [-0.12, 0, 0.12]) back.add(at(box(0.03, 0.26, 0.045, M(0xc8c8c4)), x, 0.3, 0));
    for (const s of [-1, 1]) {
      g.add(at(box(0.05, 0.05, 0.42, chairM), s * 0.25, CHAIR_Y + 0.2, -0.01));
      g.add(at(box(0.045, 0.2, 0.045, chairM), s * 0.25, CHAIR_Y + 0.1, 0.18));
      for (const z of [-0.2, 0.2]) g.add(rot(at(box(0.05, CHAIR_Y, 0.05, chairM), s * 0.24, CHAIR_Y / 2 - 0.02, z), z > 0 ? 0.08 : -0.08, 0, s * 0.05));
    }
    return g;
  }

  // ---------- the frog: a cartoon toad, olive with a pale belly, a crest over big eyes ----------
  const frogM = M(0x86ae3a, { unlit: 0.38 }), frogD = M(0x5e8030, { unlit: 0.3 }), bellyM = M(0xeeeaa8, { unlit: 0.4 }), inkM = M(0x101010), eyeW = M(0xf8f6e8, { unlit: 0.4 });
  function frogModel() {
    const g = new THREE.Group(), body = new THREE.Group(); g.add(body);
    const torso = ico(0.2, 1, frogM); torso.scale.set(1.0, 0.62, 1.1); torso.position.set(0, 0.13, 0); body.add(torso);
    const belly = ico(0.16, 1, bellyM); belly.scale.set(0.95, 0.55, 0.9); belly.position.set(0, 0.09, 0.07); body.add(belly);
    const throat = ico(0.09, 1, M(0xf2eeb8, { unlit: 0.3 })); throat.position.set(0, 0.08, 0.17); body.add(throat);
    body.add(at(box(0.2, 0.018, 0.02, inkM), 0, 0.12, 0.215));
    for (const [x, z] of [[-0.1, -0.05], [0.12, -0.1], [0.02, -0.14], [-0.07, 0.04]]) body.add(at(ico(0.025, 0, frogD), x, 0.23, z));
    const eyes = [-1, 1].map(s => {
      const e = at(new THREE.Group(), s * 0.1, 0.24, 0.08); body.add(e);
      e.add(ico(0.065, 1, frogM)); e.add(at(ico(0.05, 1, eyeW), 0, 0.012, 0.03));
      e.add(at(ico(0.03, 0, inkM), 0, 0.015, 0.07)); e.add(at(ico(0.01, 0, glow(0xffffff)), 0.012, 0.03, 0.095));
      return e;
    });
    body.add(at(box(0.13, 0.03, 0.06, frogD), 0, 0.29, 0.06));
    const arms = [-1, 1].map(s => { const a = at(new THREE.Group(), s * 0.1, 0.1, 0.14); a.add(at(box(0.045, 0.11, 0.045, frogM), 0, -0.05, 0)); a.add(at(box(0.07, 0.02, 0.07, frogD), 0, -0.1, 0.02)); body.add(a); return a; });
    const legs = [-1, 1].map(s => {
      const l = at(new THREE.Group(), s * 0.15, 0.07, -0.06); body.add(l);
      l.add(at(box(0.09, 0.08, 0.17, frogM), 0, 0, 0)); l.add(at(box(0.09, 0.02, 0.13, frogD), 0, -0.05, 0.08));
      return l;
    });
    const puff = ico(0.1, 1, M(0xf6f2c0, { unlit: 0.4 })); puff.position.set(0, 0.07, 0.19); puff.visible = false; body.add(puff);
    return { g, body, eyes, arms, legs, puff };
  }
  function poseFrog(F, P, s, bb, stopS) {
    const f = P.frog, def = { x: FROG[0], y: FROG[1], z: FROG[2], yaw: -70, pose: 'sit' };
    const o = f === false ? null : { ...def, ...(f || {}) };
    F.g.visible = !!o && !o.hide; if (!F.g.visible) return;
    const u0 = stopS != null ? Math.min(s, stopS) : s, sc = o.scale || 1;
    let x = o.x, y = o.y, z = o.z, air = 0, stretch = 0;
    const travel = (o.pose === 'hop' || o.pose === 'leap') && o.to;
    if (travel) {
      const u = cl((u0 - (o.at || 0)) / (o.dur || 0.5)), a = o.arc ?? (o.pose === 'leap' ? 0.25 : 0.35);
      x += (o.to[0] - x) * u; z += (o.to[2] - z) * u; y += (o.to[1] - y) * u + a * 4 * u * (1 - u);
      air = u > 0 && u < 1 ? 1 : 0; stretch = air ? (o.pose === 'leap' ? 1 : Math.sin(u * PI)) : 0;
    }
    F.g.position.set(x, y, z); F.g.rotation.set(0, (o.yaw || 0) * PI / 180, 0); F.g.scale.setScalar(sc);
    // the throat pulses on the beat; the body leans forward and the legs stretch out in the air
    const bt = bb >= 0 ? Math.exp(-fr(bb) * 5) : 0;
    F.body.rotation.x = stretch * 0.5; F.body.position.y = 0;
    F.legs.forEach(l => { l.rotation.x = -stretch * 1.3; l.position.z = -0.06 - stretch * 0.08; });
    F.arms.forEach(a => { a.rotation.x = -stretch * 1.4; a.rotation.z = 0; });
    F.puff.visible = o.pose === 'puff' || o.pose === 'press'; F.puff.scale.setScalar(0.6 + 0.5 * bt);
    if (o.pose === 'press') {
      const e = u0 - (o.at || 0), down = e >= 0 && e < 0.35 ? Math.sin(cl(e / 0.35) * PI) : 0;
      F.arms[1].rotation.x = -1.2 + 0.9 * down; F.body.position.y = -0.03 * down;
    }
    if (o.pose === 'leap' && air) F.arms.forEach(a => { a.rotation.x = -2.2; });
    F.eyes.forEach(e => e.scale.set(1, air ? 1.25 : 1, 1));
  }

  // ---------- the instant camera on its little tripod: mint, a big lens, a flash window, the self-timer's red light ----------
  const mintM = M(0x8ee0c8, { unlit: 0.25 }), camDark = M(0x24282c), printM = M(0xf4f1e8, { unlit: 0.3 }), printMat = M(0x5a6a78, { unlit: 0.6 });   // printMat: the photo (ps1.js loads it)
  function instantCamera() {
    const g = new THREE.Group(), cam = new THREE.Group(); g.add(cam); cam.position.y = 0.28;
    cam.add(box(0.3, 0.22, 0.13, mintM));
    cam.add(at(box(0.3, 0.035, 0.135, M(0xf2f6f4, { unlit: 0.3 })), 0, 0.095, 0));
    cam.add(rot(at(cyl(0.075, 0.08, 0.06, 12, camDark), 0, -0.01, -0.09), PI / 2, 0, 0));
    cam.add(rot(at(cyl(0.05, 0.05, 0.01, 12, glow(0x3a5a8a, 0.6)), 0, -0.01, -0.122), PI / 2, 0, 0));
    const flashWin = at(box(0.08, 0.04, 0.01, glow(0xffffff, 0.6)), -0.09, 0.07, -0.068); cam.add(flashWin);
    cam.add(at(box(0.04, 0.04, 0.01, camDark), 0.1, 0.07, -0.068));
    const led = at(ico(0.026, 0, glow(0xff2a2a)), 0.11, -0.06, -0.07); cam.add(led);
    const halo = at(new THREE.Mesh(new THREE.CircleGeometry(0.06, 10), glow(0xff5a4a)), 0.11, -0.06, -0.075); halo.rotation.y = PI; cam.add(halo);   // the light's glow when on (dark, it read as off)
    const shutter = rot(at(cyl(0.03, 0.03, 0.03, 10, M(0xe8302a, { unlit: 0.35 })), -0.08, 0.125, -0.02), 0, 0, 0); cam.add(shutter);   // the shutter button the frog presses
    cam.add(at(box(0.07, 0.06, 0.02, camDark), 0.07, 0.05, 0.072)); cam.add(at(box(0.045, 0.035, 0.012, glow(0x3a4a5a, 0.4)), 0.07, 0.05, 0.083));   // the viewfinder on the back
    cam.add(at(box(0.18, 0.012, 0.03, camDark), 0, 0.114, 0.02));   // the print slot on top
    const burst = new THREE.Group(); burst.position.set(-0.09, 0.07, -0.12); cam.add(burst);
    burst.add(ico(0.12, 1, glow(0xffffff)));
    for (let i = 0; i < 8; i++) { const a = i / 8 * TAU; burst.add(rot(at(box(0.03, 0.26, 0.01, glow(0xfff8e0)), Math.cos(a) * 0.17, Math.sin(a) * 0.17, 0), 0, 0, a + PI / 2)); }
    const print = at(new THREE.Group(), 0, -0.13, 0.0); cam.add(print);
    print.add(at(box(0.2, 0.24, 0.006, printM), 0, 0.12, 0)); print.add(rot(at(new THREE.Mesh(new THREE.PlaneGeometry(0.17, 0.17), printMat), 0, 0.14, -0.0035), 0, PI, 0));   // its picture faces the lens side (-z)
    for (let i = 0; i < 3; i++) { const a = i / 3 * TAU; g.add(rot(at(box(0.018, 0.24, 0.018, camDark), Math.sin(a) * 0.05, 0.11, Math.cos(a) * 0.05), Math.cos(a) * 0.3, 0, -Math.sin(a) * 0.3)); }
    return { g, cam, led, halo, flashWin, burst, print };
  }

  // ---------- box pets in party tops (light furs: dark ones read as black boxes at night) ----------
  const FURS = [0xd8a868, 0xe8d8c0, 0xb08a60, 0xf2eee6, 0xc8c0d0, 0xe0c8a0, 0xf0dcc0, 0xd0b090];
  const TOPS = [0xff5a7a, 0x3ad0c0, 0xffd21f, 0xff9a3c, 0x7ad04a, 0xb08aff, 0xf2f2f2, 0x3a8aff];
  function pet(i) {
    const g = new THREE.Group(), F = M(FURS[i % FURS.length]), top = M(TOPS[i % TOPS.length], { unlit: 0.15 }), body = new THREE.Group(); g.add(body);
    body.add(at(box(0.42, 0.44, 0.3, top), 0, 0.33, 0));
    for (let q = 0; q < 4; q++) body.add(at(box(0.07, 0.07, 0.02, M(0xffffff)), -0.12 + (q % 2) * 0.22, 0.25 + Math.floor(q / 2) * 0.17, 0.155));
    const legs = [-1, 1].map(s => { const l = at(new THREE.Group(), s * 0.1, 0.1, 0.02); l.add(at(box(0.12, 0.2, 0.13, M(0xe8e2d4)), 0, -0.05, 0)); l.add(at(box(0.13, 0.07, 0.17, M(0x2a2230)), 0, -0.14, 0.02)); body.add(l); return l; });
    const arms = [-1, 1].map(s => { const a = at(new THREE.Group(), s * 0.24, 0.52, 0); a.add(at(box(0.1, 0.3, 0.1, top), 0, -0.13, 0)); a.add(at(box(0.09, 0.09, 0.09, F), 0, -0.3, 0)); body.add(a); return a; });
    const head = at(new THREE.Group(), 0, 0.8, 0); body.add(head);
    const skull = ico(0.24, 1, F); skull.scale.set(1, 0.9, 0.92); head.add(skull);
    const snout = at(ico(0.1, 1, M(0xf6ece0)), 0, -0.07, 0.19); snout.scale.set(1.1, 0.8, 0.9); head.add(snout);
    head.add(at(ico(0.035, 0, M(0x151515)), 0, -0.03, 0.28));
    const ek = i % 3;
    for (const e of [-1, 1]) {
      head.add(at(ico(0.038, 0, M(0x0e0e0e)), e * 0.1, 0.05, 0.19)); head.add(at(ico(0.012, 0, glow(0xffffff)), e * 0.1 + 0.012, 0.065, 0.225));
      head.add(ek === 0 ? rot(at(cone(0.08, 0.2, 4, F), e * 0.15, 0.27, 0), 0, 0, -e * 0.25) : ek === 1 ? at(box(0.08, 0.3, 0.06, F), e * 0.1, 0.33, 0) : rot(at(box(0.07, 0.24, 0.16, F), e * 0.24, 0.02, 0), 0, 0, e * 0.3));
    }
    return { g, body, head, arms, legs, i };
  }
  function animPet(p, mode, bb, faceTo, x, z) {
    const ph = (bb + p.i * 0.13) * PI, b = Math.abs(Math.sin(ph));
    p.g.rotation.y = faceTo ? Math.atan2(faceTo[0] - x, faceTo[1] - z) : p.g.userData.yaw;
    p.body.position.y = mode === 'cheer' ? 0.06 * b : mode === 'dance' ? 0.04 * b : 0.005 * b;
    p.body.rotation.z = mode === 'dance' ? 0.16 * Math.sin(ph) : 0;
    p.head.rotation.set(0, mode === 'dance' ? 0.2 * Math.sin((bb + p.i * 0.29) * PI) : 0, 0);
    p.arms.forEach((a, k2) => {
      const sd = k2 ? 1 : -1;
      if (mode === 'cheer') a.rotation.set(0.35, 0, sd * (2.45 + 0.25 * b));
      else if (mode === 'dance') a.rotation.set(-0.6, 0, sd * (0.25 + 0.35 * (k2 ? b : 1 - b)));
      else a.rotation.set(0.05, 0, sd * 0.12);
    });
    p.legs.forEach((l, k2) => { l.rotation.x = mode === 'dance' ? 0.25 * Math.sin((bb + k2) * PI) : 0; });
  }

  // =====================================================================================================================
  function marquesina() {
    const G = new THREE.Group();
    // the night sky: a deep blue dome warming to a hazy horizon, stars, a crescent moon; the hills with house lights
    const skyT = tex(4, 64, x => { const gr = x.createLinearGradient(0, 0, 0, 64); gr.addColorStop(0, '#05081e'); gr.addColorStop(0.3, '#0c1638'); gr.addColorStop(0.44, '#23305a'); gr.addColorStop(0.5, '#5a4a6a'); gr.addColorStop(1, '#5a4a6a'); x.fillStyle = gr; x.fillRect(0, 0, 4, 64); });
    G.add(new THREE.Mesh(new THREE.SphereGeometry(188, 16, 12), mat({ map: skyT, unlit: 1, nofog: 1, side: THREE.BackSide })));
    { const st = stars(140, 170, 3001, 0xffffff, 0.14); st.material = mat({ color: 0xffffff, unlit: 1, nofog: 1 }); G.add(st); }
    { const moon = new THREE.Group(); moon.position.set(-38, 62, -150); G.add(moon); moon.lookAt(0, 0, 0);
      moon.add(new THREE.Mesh(new THREE.CircleGeometry(6.5, 18), mat({ color: 0xfff4d6, unlit: 1, nofog: 1 })));
      moon.add(at(new THREE.Mesh(new THREE.CircleGeometry(6.0, 18), mat({ color: 0x17224a, unlit: 1, nofog: 1 })), 2.6, 1.4, 0.05)); }
    const hillM = M(0x0e1a24, { nofog: 1 }), hill2 = M(0x142430, { nofog: 1 });
    for (let i = 0; i < 7; i++) G.add(at(new THREE.Mesh(new THREE.SphereGeometry(22 + hash(i, 3002) * 14, 10, 6, 0, TAU, 0, PI / 2), i % 2 ? hillM : hill2), -120 + i * 40, -4, -110 - hash(i, 3003) * 30));
    { const dots = []; for (let i = 0; i < 70; i++) dots.push(at(new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.5, 0.2)), -130 + hash(i, 3004) * 260, 1 + hash(i, 3005) * 14, -95 - hash(i, 3006) * 30)); G.add(merged(dots, mat({ color: 0xffd890, unlit: 1, nofog: 1 }))); }

    // the ground: the yard's grass, the carport's tiles, the concrete drive from the carport to the gate, the street
    const grassT = tex(32, 32, (x, r) => { px(x, '#2e5a2a', 0, 0, 32, 32); noise(x, r, 32, 32, ['#2a5226', '#356432', '#264a22'], 220); }, 3010);
    G.add(flat(40, 26, mat({ map: grassT, rep: [20, 13] }), 4, 0, -0.6));
    const tileT = tex(16, 16, (x, r) => { px(x, '#cfc4b0', 0, 0, 16, 16); noise(x, r, 16, 16, ['#c6baa4', '#d8cdb8', '#bfb39c', '#e0d6c2'], 70); px(x, '#a89c88', 0, 0, 16, 1); px(x, '#a89c88', 0, 0, 1, 16); }, 3011);
    G.add(flat(PORCH[1] - PORCH[0], PORCH[3] - PORCH[2], mat({ map: tileT, rep: [7, 6] }), (PORCH[0] + PORCH[1]) / 2, 0.006, (PORCH[2] + PORCH[3]) / 2));
    const concT = tex(16, 16, (x, r) => { px(x, '#8a8a86', 0, 0, 16, 16); noise(x, r, 16, 16, ['#828280', '#92928e'], 50); }, 3012);
    G.add(flat(PORCH[1] - PORCH[0] - 1.2, FENCE_Z - PORCH[3], mat({ map: concT, rep: [5, 3] }), (PORCH[0] + PORCH[1]) / 2, 0.005, (PORCH[3] + FENCE_Z) / 2));
    const roadT = tex(16, 16, (x, r) => { px(x, '#262830', 0, 0, 16, 16); noise(x, r, 16, 16, ['#22242c', '#2c2e36'], 40); }, 3013);
    G.add(flat(80, 8, mat({ map: roadT, rep: [20, 2] }), 0, -0.02, FENCE_Z + 4.6));

    // the house: a pastel concrete front, a flat roof with a parapet, iron bars on its windows, the front door
    const wallT = tex(16, 16, (x, r) => { px(x, '#58b8b0', 0, 0, 16, 16); noise(x, r, 16, 16, ['#52b0a8', '#60c0b8', '#4ea8a0'], 60); }, 3014);
    const wallM = mat({ map: wallT, rep: [8, 2], unlit: 0.12 });
    G.add(at(new THREE.Mesh(new THREE.PlaneGeometry(17, 3.4), wallM), 0, 1.7, HOUSE_Z));
    G.add(at(box(17.2, 0.3, 0.3, M(0xe8e4dc, { unlit: 0.15 })), 0, 3.45, HOUSE_Z + 0.05));
    G.add(at(box(17, 0.12, 0.12, M(0xe8e4dc, { unlit: 0.15 })), 0, 0.06, HOUSE_Z + 0.06));
    const winLit = glow(0xffc87a, 0.85), barM = M(0xf4f4f0, { unlit: 0.3 });
    const windowAt = (x, y, w, h) => {
      G.add(at(box(w, h, 0.04, winLit), x, y, HOUSE_Z + 0.02));
      G.add(at(box(w + 0.16, 0.08, 0.1, M(0xe8e4dc)), x, y - h / 2 - 0.04, HOUSE_Z + 0.05));
      const bars = [];
      for (let i = 0; i <= 6; i++) bars.push(at(new THREE.Mesh(new THREE.BoxGeometry(0.03, h, 0.03)), x - w / 2 + i * w / 6, y, HOUSE_Z + 0.09));
      for (let j = 0; j <= 3; j++) bars.push(at(new THREE.Mesh(new THREE.BoxGeometry(w, 0.03, 0.03)), x, y - h / 2 + j * h / 3, HOUSE_Z + 0.09));
      for (let i = 0; i < 6; i++) { const c = new THREE.Mesh(new THREE.TorusGeometry(0.07, 0.012, 4, 8)); c.position.set(x - w / 2 + (i + 0.5) * w / 6, y + h / 6, HOUSE_Z + 0.1); bars.push(c); }
      G.add(merged(bars, barM));
    };
    windowAt(-5.9, 1.6, 1.3, 1.1); windowAt(1.4, 1.6, 1.5, 1.1); windowAt(6.6, 1.6, 1.5, 1.1);
    G.add(at(box(1.0, 2.1, 0.06, M(0x8a5a32, { unlit: 0.12 })), -3.2, 1.05, HOUSE_Z + 0.03));
    G.add(at(box(0.12, 0.12, 0.06, glow(0xffe0a0)), -3.2, 2.35, HOUSE_Z + 0.08));
    G.add(at(ico(0.04, 0, M(0xd8c060)), -2.82, 1.0, HOUSE_Z + 0.08));
    // the carport: a concrete slab on two square columns, string lights along its edge and zigzagging under it
    const slabM = M(0xe8e4dc, { unlit: 0.12 });
    G.add(at(box(PORCH[1] - PORCH[0], 0.22, PORCH[3] - PORCH[2], slabM), (PORCH[0] + PORCH[1]) / 2, SLAB_Y + 0.11, (PORCH[2] + PORCH[3]) / 2));
    for (const x of [PORCH[0] + 0.25, PORCH[1] - 0.25]) G.add(at(box(0.3, SLAB_Y, 0.3, slabM), x, SLAB_Y / 2, PORCH[3] - 0.2));
    const bulbs = [], bulbCols = [0xffd27a, 0xff8a5a, 0xfff0b0, 0x8af0ff, 0xff7ab8];
    const string = (a, b, n, sag, seed) => {
      for (let i = 0; i <= n; i++) {
        const u = i / n, p = new THREE.Vector3().lerpVectors(a, b, u); p.y -= sag * 4 * u * (1 - u);
        const m = at(ico(0.055, 0, glow(bulbCols[(i + seed) % bulbCols.length], 0.95)), p.x, p.y, p.z); G.add(m); bulbs.push([m, i + seed]);
      }
      const line = new THREE.Mesh(new THREE.BoxGeometry(0.01, 0.01, a.distanceTo(b)), M(0x4a4a50));
      line.position.lerpVectors(a, b, 0.5); line.position.y -= sag * 0.7; line.lookAt(b.x, b.y - sag * 0.7, b.z); G.add(line);
    };
    const V = (x, y, z) => new THREE.Vector3(x, y, z);
    string(V(PORCH[0] + 0.2, SLAB_Y - 0.05, PORCH[3] - 0.05), V(PORCH[1] - 0.2, SLAB_Y - 0.05, PORCH[3] - 0.05), 16, 0.25, 0);
    string(V(PORCH[0] + 0.3, SLAB_Y - 0.08, HOUSE_Z + 0.3), V(PORCH[1] - 0.3, SLAB_Y - 0.08, PORCH[3] - 0.4), 14, 0.35, 2);
    string(V(PORCH[1] - 0.3, SLAB_Y - 0.08, HOUSE_Z + 0.3), V(PORCH[0] + 0.3, SLAB_Y - 0.08, PORCH[3] - 0.4), 14, 0.35, 4);
    string(V(PORCH[1] - 0.15, SLAB_Y - 0.05, PORCH[3] - 0.1), V(7.2, 2.9, -2.4), 16, 0.5, 1);
    string(V(PORCH[1] - 0.15, SLAB_Y - 0.05, -3.8), V(7.2, 2.9, -2.4), 14, 0.45, 3);
    // the speaker stack and the cooler under the carport, a few spare chairs stacked against the wall
    const spk = new THREE.Group(); spk.position.set(PORCH[0] + 0.6, 0, HOUSE_Z + 0.55); spk.rotation.y = 0.5; G.add(spk);
    spk.add(at(box(0.8, 1.3, 0.6, M(0x1c1c22)), 0, 0.65, 0));
    const cones = [0.95, 0.4].map(y => { const c = rot(at(cyl(0.22, 0.24, 0.05, 12, M(0x3a3a44)), 0, y, 0.31), PI / 2, 0, 0); spk.add(c); return c; });
    spk.add(at(box(0.5, 0.06, 0.02, glow(0x5ae0ff, 0.8)), 0, 1.22, 0.305));
    const cooler = new THREE.Group(); cooler.position.set(PORCH[1] - 0.9, 0, HOUSE_Z + 0.5); G.add(cooler);
    cooler.add(at(box(0.7, 0.42, 0.42, M(0x2f6bd8, { unlit: 0.15 })), 0, 0.21, 0)); cooler.add(at(box(0.72, 0.1, 0.44, M(0xf4f4f0, { unlit: 0.2 })), 0, 0.47, 0));
    for (let i = 0; i < 3; i++) { const c = plasticChair(); c.position.set(PORCH[1] - 2.2, i * 0.07, HOUSE_Z + 0.45); c.rotation.y = 0.15; G.add(c); }

    // the yard: the two white plastic chairs among the plantains (the album's cover), the mango tree, the domino table
    CHAIRS.forEach(([x, z]) => { const c = plasticChair(); c.position.set(x, 0, z); G.add(c); });
    const stemM = M(0x6a8a3a), leafM = M(0x3a8a32, { side: THREE.DoubleSide, unlit: 0.1 }), leaf2 = M(0x2e7428, { side: THREE.DoubleSide, unlit: 0.1 }), bunchM = M(0x8ab040), budM = M(0x7a2a4a);
    const plantains = [];
    const plantainAt = (x, z, h, seed) => {
      const p = new THREE.Group(); p.position.set(x, 0, z); G.add(p); plantains.push([p, x, z]);
      p.add(at(cyl(0.11, 0.15, h, 7, stemM), 0, h / 2, 0));
      for (let i = 0; i < 7; i++) {
        const a = i / 7 * TAU + hash(seed, i) * 0.6, f = new THREE.Group(); f.position.y = h - 0.1; f.rotation.y = a; p.add(f);
        const lf = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 1.9), i % 2 ? leafM : leaf2); lf.rotation.x = -0.75 - hash(seed, i + 9) * 0.5; lf.position.set(0, 0.55, 0.62); f.add(lf);
        f.add(rot(at(box(0.03, 0.03, 1.4, stemM), 0, 0.35, 0.55), -0.6, 0, 0));
      }
      if (seed % 2 === 0) { p.add(at(ico(0.17, 1, bunchM), 0.12, h - 0.45, 0.1)); p.add(rot(at(cone(0.08, 0.22, 6, budM), 0.14, h - 0.75, 0.12), PI, 0, 0)); }
    };
    plantainAt(2.6, -3.5, 2.5, 30); plantainAt(3.7, -3.95, 2.9, 31); plantainAt(5.0, -3.6, 2.6, 32); plantainAt(5.9, -3.0, 2.2, 33); plantainAt(1.9, -2.6, 1.9, 34);
    { const tree = new THREE.Group(); tree.position.set(7.4, 0, -2.4); G.add(tree);
      tree.add(at(cyl(0.18, 0.26, 2.6, 7, M(0x5a4030)), 0, 1.3, 0));
      for (const [x, y, z, r] of [[0, 3.2, 0, 1.6], [0.9, 2.8, 0.4, 1.1], [-0.8, 2.9, -0.3, 1.2], [0.2, 3.7, -0.4, 1.1]]) tree.add(at(ico(r, 1, M(0x234a24)), x, y, z));
      plantains.push([tree, 7.4, -2.4]); }
    // the domino table: a square folding table, its dominoes in a train, Kob's chair at its -x side facing +x
    const table = new THREE.Group(); table.position.set(TABLE[0], 0, TABLE[1]); G.add(table);
    table.add(at(box(0.95, 0.05, 0.95, M(0xe8e2d0, { unlit: 0.15 })), 0, TABLE_Y - 0.025, 0));
    for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) table.add(at(box(0.04, TABLE_Y - 0.05, 0.04, M(0x6a6a70)), sx * 0.42, (TABLE_Y - 0.05) / 2, sz * 0.42));
    const domT = tex(8, 16, x => { px(x, '#f6f2e8', 0, 0, 8, 16); px(x, '#1a1a1a', 0, 7, 8, 1); for (const [a, b] of [[2, 2], [5, 4], [2, 10], [5, 12], [3, 12]]) px(x, '#1a1a1a', a, b, 1, 1); }, 3020);
    const doms = [];
    for (let i = 0; i < 9; i++) { const d = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.014, 0.12)); d.position.set(-0.3 + i * 0.075, TABLE_Y + 0.007, 0.05 + (i % 3 === 1 ? 0.07 : 0)); d.rotation.y = i % 3 === 1 ? PI / 2 : 0; doms.push(d); }
    table.add(merged(doms, mat({ map: domT, unlit: 0.3 })));
    for (let i = 0; i < 5; i++) table.add(rot(at(box(0.06, 0.012, 0.12, M(0xf6f2e8, { unlit: 0.3 })), 0.3, TABLE_Y + 0.006 + i * 0.013, -0.25), 0, 0.3 * i, 0));
    { const kobChair = plasticChair(); kobChair.position.set(KOB_SEAT[0], 0, KOB_SEAT[1]); kobChair.rotation.y = PI / 2; G.add(kobChair); }
    // the prints fanned on the table (the failed photos), the camera on its tripod at the table's -z edge
    const prints = [];
    for (let i = 0; i < 6; i++) {
      const pr = new THREE.Group(); pr.position.set(TABLE[0] - 0.22 + i * 0.09, TABLE_Y + 0.004 + i * 0.002, TABLE[1] + 0.12 + (i % 2) * 0.05); pr.rotation.y = -0.5 + i * 0.22; G.add(pr);
      pr.add(at(box(0.17, 0.004, 0.2, printM), 0, 0, 0)); pr.add(at(box(0.14, 0.006, 0.14, M([0x4a5a6a, 0x5a4a5a, 0x6a5a3a, 0x3a5a4a, 0x5a5a6a, 0x4a4a5a][i])), 0, 0.001, -0.015));
      prints.push(pr);
    }
    const IC = instantCamera(); G.add(IC.g);
    const FR = frogModel(); G.add(FR.g);
    // the front wall with iron bars, the gate, the streetlamp outside, the neighbours' houses across the street
    const fence = [];
    for (let x = -8; x <= 8.01; x += 0.5) if (x < PORCH[0] + 0.8 || x > PORCH[1] - 1.0) { fence.push(at(new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.6, 0.18)), x, 0.3, FENCE_Z)); fence.push(at(new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.7, 0.03)), x, 0.95, FENCE_Z)); }
    G.add(merged(fence, M(0xe8e4dc, { unlit: 0.12 })));
    G.add(at(box(16, 0.03, 0.03, barM), 0, 1.28, FENCE_Z));
    { const lampG = new THREE.Group(); lampG.position.set(1.5, 0, FENCE_Z + 1.2); G.add(lampG);
      lampG.add(at(cyl(0.06, 0.08, 4.8, 5, M(0x5a5a62)), 0, 2.4, 0)); lampG.add(at(box(0.5, 0.12, 0.26, M(0x5a5a62)), 0, 4.8, -0.2)); lampG.add(at(box(0.4, 0.04, 0.2, glow(0xffc070)), 0, 4.73, -0.2)); }
    const nbM = [0xe89aa8, 0xf2d27a, 0x9ac8f0].map(c => M(c, { unlit: 0.18 }));
    [[-9, 0], [0, 1], [8, 2]].forEach(([x, q]) => {
      const h = new THREE.Group(); h.position.set(x, 0, FENCE_Z + 11); G.add(h);
      h.add(at(box(7, 3.2, 5, nbM[q]), 0, 1.6, 0)); h.add(at(box(7.2, 0.2, 5.2, M(0xe8e4dc)), 0, 3.3, 0));
      for (const wx of [-2, 0.5, 2.4]) h.add(at(box(0.9, 0.8, 0.05, winLit), wx, 1.6, -2.53));
    });
    // the party: pet guests round the carport's dance floor
    const guests = [];
    const GUEST = [[-6.6, -2.8, 0.9], [-6.2, -0.3, 1.5], [-5.4, 0.8, 2.6], [-2.2, 0.7, -2.4], [-1.3, -0.9, -1.3], [-1.4, -3.4, -0.6], [-5.2, -3.7, 0.4], [-3.0, -3.9, 0]];
    GUEST.forEach(([x, z, yaw], i) => { const p = pet(i); p.g.position.set(x, 0, z); p.g.userData.yaw = yaw; G.add(p.g); guests.push({ p, x, z }); });

    return {
      group: G, sky: skyT, shadowCol: 0x24302a, printMat,
      light() {
        lights(0x5a5a7a, 0x8a9ad0, [0.3, -0.8, -0.45], 0x0c1430, [25, 110], 7);
        pt(0, DANCE[0], 2.6, DANCE[1], 1.05, 0.74, 0.46);
        pt(1, 4.2, 2.6, -0.6, 0.95, 0.7, 0.45);
        pt(2, 3.0, 2.2, 3.6, 0.55, 0.5, 0.42);
      },
      anim(t, P = {}) {
        const s = shotT(t, P), stopS = P.stop != null ? P.stop : null, stopped = stopS != null && s >= stopS;
        const tt = stopped ? t - (s - stopS) : t, bb = beat(tt);
        if (P.key) pt(3, P.key[0], P.key[1], P.key[2], P.key[3], P.key[4], P.key[5]);
        // the string lights twinkle: every other bulb flares on the beat
        const hb = bb >= 0 ? Math.exp(-fr(bb) * 4) : 0;
        bulbs.forEach(([m, i]) => { const on = pmod(Math.floor(bb) + i, 2) === 0; m.scale.setScalar(on ? 1 + 0.25 * hb : 0.85); });
        cones.forEach(c => { c.scale.set(1, 1 + 0.6 * hb, 1); });
        // the guests dance (or watch, cheer, stare at a point)
        const mode = P.guests || 'dance';
        guests.forEach(({ p, x, z }) => { p.g.visible = !P.noguests && !cleared(P, x, z); if (p.g.visible) animPet(p, mode, bb, P.stare, x, z); });
        plantains.forEach(([p, x, z]) => { p.visible = !cleared(P, x, z); });
        // the prints on the table
        const n = P.photos || 0; prints.forEach((pr, i) => { pr.visible = i < n; });
        // the instant camera: on its tripod by default; the self-timer's light, the flash, the print sliding out
        const C = P.tripod === false ? null : (P.tripod || {});
        IC.g.visible = !!C && !C.hide;
        if (C) {
          IC.g.position.set(C.x ?? CAM[0], (C.y ?? CAM[1]) - 0.28, C.z ?? CAM[2]); IC.g.rotation.set(0, (C.yaw || 0) * PI / 180, 0);
          const u = stopped ? stopS : s;
          let ledOn = false;
          if (C.blink) { const [b0, b1] = C.blink, e = u - b0, len = Math.max(0.1, b1 - b0); if (e >= 0 && e < len) { const rate = 2 + 8 * (e / len); ledOn = fr(e * rate) < 0.5; } }
          IC.led.material.uniforms.uCol.value.setRGB(ledOn ? 2.0 : 0.75, ledOn ? 0.55 : 0.12, ledOn ? 0.5 : 0.1); IC.halo.visible = ledOn;
          const fe = C.flash != null ? s - C.flash : -1, fl = fe >= 0 && fe < 0.3 ? 1 - fe / 0.3 : 0;
          IC.burst.visible = fl > 0.02; IC.burst.scale.setScalar(0.6 + 1.6 * (1 - fl)); IC.flashWin.material.uniforms.uCol.value.setScalar(1 + 2 * fl);
          if (fl > 0) U.uAmb.value.lerp(new THREE.Color(1, 1, 1), fl);
          const ee = C.eject != null ? u - C.eject : (C.print ? 1 : -1), out = C.print ? 1 : sm(ee / 0.6);
          IC.print.visible = ee >= 0 || !!C.print; IC.print.position.y = -0.13 + 0.15 * out;
        }
        for (const f of P.flash || []) { const e = s - f; if (e >= 0 && e < 0.3) U.uAmb.value.lerp(new THREE.Color(1, 1, 1), 1 - e / 0.3); }
        poseFrog(FR, P, s, bb, stopS);
      },
    };
  }

  return { marquesina: marquesina() };
}
