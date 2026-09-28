// maps17.js: the "Dai Dai" maps (2026-09-28, Shakira & Burna Boy, the 2026 World Cup song: the clip dances in front of a
// giant baobab tree at dusk, kids play barefoot football on a village's dirt pitch, a troupe dances on a stadium's pitch
// under the floodlights, Shakira dances on top of the Earth in space, and it ends in fireworks). Same contract as the
// other map files, pure in t:
//   final   the World Cup final at night, at 0.7 scale round a 1.25 m cast: the penalty spot at the origin, the goal on
//           the goal line (FINAL.GOAL_Z) with its net, the pitch mown in stripes, the stands all round full of pets
//           (the first rows behind the goal in 3D, waving flags), floodlight towers, LED boards, the big screen's
//           penalty tally, the players' tunnel in the left stand at the halfway line (TUNNEL), and the other team's
//           keeper, a big bulldog in magenta with orange gloves, posed by `keeper`.
//           Flags read by anim(t, P) (s = seconds into the shot):
//             ball    [[s, x, y, z, arc], ...]: keyframes; the ball rests on the first one's point until its s, then moves
//                     from key to key (a parabola of `arc` m on top of the straight line), spinning as it goes. Without
//                     it the ball rests on the spot; `noBall` hides it
//             net     [s, x, y, depth, hold]: the back net bulges round (x, y) from s (depth m); hold (s) keeps it
//                     out that long, then it relaxes over 0.6 s (true: for the rest of the shot)
//             keeper  { pose, at, dir, x, z, look, yaw, hide }: 'ready' (bouncing, gloves out), 'dive' (at s, to dir =
//                     -1|1 in world x, lying there after), 'blown' (at s: blasted back into the net with the ball),
//                     'swoon' (from at: gloves on his heart, hearts pop, down on his knees), 'beckon' (come on: both
//                     gloves curling), 'wait' (arms folded, a foot tapping), 'sit', 'sleep' (slumped on the goal line,
//                     a snot bubble breathing at his nose), 'wake' (at s, out of sleep: a jolt), 'sad'
//             fans    'cheer' | 'wave' (a Mexican wave along the stand behind the goal) | 'sleep' | 'gasp' (paws on
//                     cheeks) | default bouncing on the beat; `stare` [x, z]: every fan's head turns there
//             kiss    [s, x, y, z, tx, ty, tz]: three pink hearts fly from (x, y, z) to (tx, ty, tz), growing (a blown kiss)
//             score   [ours, theirs]: the big screen's tally (4 penalties a side, lit dots)
//             flares  s: red flares light up in the stand behind the goal (and smoke)
//             confetti true | s (confZ: its box, 10 m wide, sits that far along z from the focus, -3);  fw  true | s: a firework over the stand behind the goal on every bar from s
//             (fwZ, fwY move them, fwR sizes them);  dawn  0-1: the sky and the light at sunrise;  noguests;  clear [[x, z, r]] (no fan
//             there);  key [x, y, z, r, g, b]
//   globe   a tiny Earth in space, 10 m across, its top at y = 0 under the dancer: blue seas, green and sand
//           continents, clouds, a few tiny landmarks (pyramids, a tower, a stadium, a tree, a baobab, towers, a peak)
//           on its surface, stars, the moon and a low sun. `spin` (rad/s, default 0.35) turns it about z, so its top
//           runs towards -x under a runner facing +x.
//   baobab  the clip's savanna at dusk: dusty red earth, a giant baobab behind the dance mark (BAOBAB.TREE), round mud
//           huts with thatched roofs, a stake fence, acacias, a huge low sun, and pet kids playing barefoot football on
//           a dirt pitch between stick goals. `kids`: 'play' (default: passing a ball) | 'cheer'; `stare` [x, z];
//           `noguests`; `clear`; `key`.
import { mapKit } from './mapkit.js';

export const FINAL = {
  GOAL_Z: -7.7, GOAL_W: 5.6, GOAL_H: 1.9, NET_D: 1.5, SPOT: [0, 0], KEEPER: [0, -7.25],
  BOX_Z: 3.85, BOX_W: 14.1, SIX_Z: -3.85, SIX_W: 6.4, HALF_Z: 29.05, CIRCLE_R: 6.4, TOUCH_X: 23.8,
  TUNNEL: [-25.2, 29.05], STAND_Z: -12.5, BALL_R: 0.15,
};
export const GLOBE = { R: 5 };
export const BAOBAB = { TREE: [0.6, -9.5], HUTS: [[-8.5, -6.5], [8.8, -7.5], [-12.5, -11]], GOALS: [[-6.2, -3.4], [6.2, -3.4]] };

export function buildWorldCupMaps(K) {
  const k = mapKit(K);
  const { THREE, mat, tex, px, noise, box, TAU, PI, hash, beat, cyl, cone, ico, at, rot, flat, lights, pt, stars, selfLit, fall } = k;
  const M = (c, o = {}) => mat({ color: c, ...o }), glow = c => mat({ color: c, unlit: 1 });
  const sm = u => { const v = Math.min(1, Math.max(0, u)); return v * v * (3 - 2 * v); };
  const cl = u => Math.min(1, Math.max(0, u));
  const cleared = (P, x, z) => (P.clear || []).some(([cx, cz, r]) => (x - cx) ** 2 + (z - cz) ** 2 < r * r);
  const { GOAL_Z, GOAL_W, GOAL_H, NET_D, BOX_Z, BOX_W, SIX_Z, SIX_W, HALF_Z, CIRCLE_R, TOUCH_X, TUNNEL, STAND_Z, BALL_R } = FINAL;

  // ---------- a football, white with black patches ----------
  const ballT = tex(16, 16, x => { px(x, '#f4f4f0', 0, 0, 16, 16); for (const [a, b] of [[2, 2], [9, 1], [5, 7], [12, 8], [1, 11], [8, 13], [14, 3]]) px(x, '#1a1a1e', a, b, 3, 3); }, 1701);
  const ballMesh = () => new THREE.Mesh(new THREE.IcosahedronGeometry(BALL_R, 1), mat({ map: ballT, unlit: 0.25 }));

  // ---------- pets: fans in the stands, kids on the savanna ----------
  const FURS = [0xd8a868, 0xe8d8c0, 0xb08a60, 0xf2eee6, 0x9a9aa4, 0x6a5a50, 0xe8c090, 0xc86a3a];
  const hex = c => '#' + c.toString(16).padStart(6, '0');
  function pet(i, { top = 0xf2d23a, trim = 0x2a9a4a, scale = 1, flag = false } = {}) {
    const g = new THREE.Group(), F = M(FURS[i % FURS.length]), kind = i % 3, shirt = M(top);
    const body = new THREE.Group(); body.scale.setScalar(scale); g.add(body);
    body.add(at(box(0.4, 0.46, 0.28, shirt), 0, 0.36, 0)); body.add(at(box(0.42, 0.06, 0.3, M(trim)), 0, 0.58, 0));
    for (const s of [-1, 1]) body.add(at(box(0.13, 0.14, 0.14, M(0x2a2a30)), s * 0.1, 0.07, 0.02));
    const arms = [-1, 1].map(s => { const a = at(new THREE.Group(), s * 0.23, 0.55, 0); a.add(at(box(0.09, 0.3, 0.09, shirt), 0, -0.13, 0)); a.add(at(box(0.08, 0.08, 0.08, F), 0, -0.3, 0)); body.add(a); return a; });
    const head = at(new THREE.Group(), 0, 0.82, 0); body.add(head);
    const skull = new THREE.Mesh(new THREE.IcosahedronGeometry(0.24, 1), F); skull.scale.set(1, 0.9, 0.92); head.add(skull);
    const snout = at(new THREE.Mesh(new THREE.IcosahedronGeometry(0.1, 1), M(0xf0e6d8)), 0, -0.07, 0.19); snout.scale.set(1.1, 0.8, 0.9); head.add(snout);
    head.add(at(new THREE.Mesh(new THREE.IcosahedronGeometry(0.035, 0), M(0x151515)), 0, -0.03, 0.28));
    for (const e of [-1, 1]) {
      head.add(at(new THREE.Mesh(new THREE.IcosahedronGeometry(0.038, 0), M(0x0e0e0e)), e * 0.1, 0.05, 0.19));
      head.add(at(new THREE.Mesh(new THREE.IcosahedronGeometry(0.012, 0), glow(0xffffff)), e * 0.1 + 0.012, 0.065, 0.225));
      head.add(kind === 0 ? rot(at(cone(0.08, 0.2, 4, F), e * 0.15, 0.27, 0), 0, 0, -e * 0.25) : kind === 1 ? at(box(0.08, 0.3, 0.06, F), e * 0.1, 0.33, 0) : rot(at(box(0.07, 0.24, 0.16, F), e * 0.24, 0.02, 0), 0, 0, e * 0.3));
    }
    let fl = null;
    if (flag) {
      // a small flag on a stick in the right paw, in the pet's team colours
      fl = new THREE.Group(); arms[1].add(at(fl, 0, -0.3, 0.04));
      fl.add(at(cyl(0.012, 0.012, 0.7, 4, M(0x3a2a1a)), 0, 0.3, 0));
      const ft = tex(8, 6, x => { px(x, hex(top), 0, 0, 8, 6); px(x, hex(trim), 0, 2, 8, 2); }, 1702 + (top & 7));
      fl.add(at(new THREE.Mesh(new THREE.PlaneGeometry(0.34, 0.24), mat({ map: ft, side: THREE.DoubleSide, unlit: 0.3 })), 0.18, 0.55, 0));
    }
    return { g, body, head, arms, fl, i };
  }
  // pose a pet for this frame: the fans' and kids' shared moves
  function posePet(p, mode, bb, faceY) {
    const bounce = Math.abs(Math.sin(bb * PI));
    p.g.rotation.y = faceY; p.body.position.y = 0; p.head.rotation.set(0, 0, 0);
    if (mode === 'sleep') { p.head.rotation.x = 0.55; p.arms.forEach((a, k2) => a.rotation.set(0.1, 0, (k2 ? 1 : -1) * 0.1)); return; }
    if (mode === 'gasp') { p.arms.forEach((a, k2) => a.rotation.set(-2.2, 0, (k2 ? 1 : -1) * -0.55)); p.head.rotation.x = -0.12; return; }
    if (mode === 'cheer') { p.body.position.y = 0.06 * bounce; p.arms.forEach((a, k2) => a.rotation.set(0.35, 0, (k2 ? 1 : -1) * (2.45 + 0.25 * Math.sin(bb * TAU)))); return; }
    p.body.position.y = 0.035 * bounce; p.head.rotation.x = 0.08 * bounce;
    p.arms.forEach((a, k2) => a.rotation.set(0.25 * Math.sin(bb * PI + k2 * PI), 0, (k2 ? 1 : -1) * 0.14));
    if (p.fl) p.arms[1].rotation.set(-0.3, 0, 1.2 + 0.35 * Math.sin(bb * PI));
  }

  // ---------- the keeper: a big bulldog in magenta, orange gloves ----------
  function keeperPet() {
    const g = new THREE.Group();
    const jersey = M(0xff6ab4, { unlit: 0.2 }), shorts = M(0x1c1c26), socks = M(0xff6ab4, { unlit: 0.2 }), fur = M(0xc9a27a), furL = M(0xefdcc4), dark = M(0x16121a), glove = M(0xff8a1a), boot = M(0x141414), white = M(0xffffff, { unlit: 0.4 });
    const hips = at(new THREE.Group(), 0, 0.5, 0); g.add(hips);
    const torso = new THREE.Group(); hips.add(torso);
    torso.add(at(box(0.7, 0.58, 0.46, jersey), 0, 0.32, 0)); torso.add(at(box(0.66, 0.16, 0.44, shorts), 0, 0.0, 0));
    torso.add(at(box(0.72, 0.06, 0.48, shorts), 0, 0.6, 0));
    torso.add(at(box(0.07, 0.26, 0.01, white), 0.02, 0.32, 0.235)); torso.add(at(box(0.07, 0.05, 0.01, white), -0.03, 0.42, 0.235));
    const head = at(new THREE.Group(), 0, 0.84, 0.03); torso.add(head);
    const skull = new THREE.Mesh(new THREE.IcosahedronGeometry(0.31, 1), fur); skull.scale.set(1.18, 0.92, 1.0); head.add(skull);
    const muz = at(new THREE.Mesh(new THREE.IcosahedronGeometry(0.17, 1), furL), 0, -0.11, 0.21); muz.scale.set(1.35, 0.78, 0.85); head.add(muz);
    for (const s of [-1, 1]) { const j = at(new THREE.Mesh(new THREE.IcosahedronGeometry(0.1, 1), furL), s * 0.15, -0.17, 0.18); j.scale.set(1, 1.1, 0.9); head.add(j); }
    head.add(at(new THREE.Mesh(new THREE.IcosahedronGeometry(0.065, 0), dark), 0, -0.03, 0.36));
    for (const s of [-1, 1]) head.add(at(cone(0.022, 0.07, 4, M(0xffffff)), s * 0.08, -0.2, 0.33));
    const eyes = [-1, 1].map(s => { const e = at(new THREE.Group(), s * 0.13, 0.06, 0.26); e.add(new THREE.Mesh(new THREE.IcosahedronGeometry(0.048, 0), dark)); e.add(at(new THREE.Mesh(new THREE.IcosahedronGeometry(0.014, 0), glow(0xffffff)), 0.014, 0.018, 0.04)); head.add(e); return e; });
    for (const s of [-1, 1]) head.add(rot(at(box(0.14, 0.035, 0.04, dark), s * 0.13, 0.14, 0.26), 0, 0, s * 0.28));
    for (const s of [-1, 1]) head.add(rot(at(box(0.12, 0.16, 0.05, M(0x8a6a4a)), s * 0.3, 0.2, -0.02), 0, 0, s * 0.9));
    const arms = [-1, 1].map(s => {
      const sh = at(new THREE.Group(), s * 0.39, 0.52, 0); torso.add(sh);
      sh.add(at(box(0.17, 0.34, 0.17, jersey), 0, -0.14, 0));
      const el = at(new THREE.Group(), 0, -0.29, 0); sh.add(el);
      el.add(at(box(0.14, 0.26, 0.14, fur), 0, -0.12, 0));
      el.add(at(box(0.26, 0.26, 0.15, glove), 0, -0.33, 0));
      return { sh, el };
    });
    const legs = [-1, 1].map(s => {
      const hp = at(new THREE.Group(), s * 0.18, 0, 0); hips.add(hp);
      hp.add(at(box(0.21, 0.27, 0.23, shorts), 0, -0.12, 0));
      const kn = at(new THREE.Group(), 0, -0.25, 0); hp.add(kn);
      kn.add(at(box(0.17, 0.21, 0.17, socks), 0, -0.1, 0)); kn.add(at(box(0.2, 0.09, 0.32, boot), 0, -0.21, 0.06));
      return { hp, kn };
    });
    // the swoon's hearts and the sleeper's snot bubble
    const hearts = new THREE.Group(); g.add(hearts);
    const hm = mat({ color: 0xff5fa2, unlit: 0.85 });
    for (let q = 0; q < 3; q++) {
      const h = new THREE.Group();
      h.add(at(new THREE.Mesh(new THREE.IcosahedronGeometry(0.08, 0), hm), -0.06, 0, 0)); h.add(at(new THREE.Mesh(new THREE.IcosahedronGeometry(0.08, 0), hm), 0.06, 0, 0));
      const tip = at(cone(0.1, 0.15, 4, hm), 0, -0.09, 0); tip.rotation.x = PI; h.add(tip); hearts.add(h);
    }
    const bubble = at(new THREE.Mesh(new THREE.IcosahedronGeometry(0.1, 1), mat({ color: 0xe4f4ff, unlit: 0.75, see: 0.3 })), 0.09, -0.1, 0.42); head.add(bubble);
    bubble.add(at(new THREE.Mesh(new THREE.IcosahedronGeometry(0.025, 0), glow(0xffffff)), -0.04, 0.05, 0.07));
    return { g, hips, torso, head, arms, legs, hearts, bubble, eyes };
  }
  // the keeper's pose for this frame, set from scratch (pure in t); he stands at (x, z) facing +z
  function poseKeeper(kp, Kf, s, b) {
    const { g, hips, torso, head, arms, legs, hearts, bubble, eyes } = kp;
    const x0 = Kf.x ?? FINAL.KEEPER[0], z0 = Kf.z ?? FINAL.KEEPER[1], pose = Kf.pose || 'ready', at0 = Kf.at ?? 0, dir = Kf.dir ?? 1;
    g.visible = !Kf.hide; g.position.set(x0, 0, z0); g.rotation.set(0, Kf.yaw || 0, 0);
    hips.position.set(0, 0.5, 0); hips.rotation.set(0, 0, 0); torso.rotation.set(0, 0, 0); torso.scale.set(1, 1, 1); head.rotation.set(0, 0, 0);
    arms.forEach(a => { a.sh.rotation.set(0, 0, 0); a.el.rotation.set(0, 0, 0); });
    legs.forEach(l => { l.hp.rotation.set(0, 0, 0); l.kn.rotation.set(0, 0, 0); });
    eyes.forEach(e => e.scale.set(1, 1, 1)); hearts.visible = false; bubble.visible = false;
    const bounce = Math.abs(Math.sin(b * PI));
    const ready = () => {
      hips.position.y = 0.42 + 0.035 * bounce;
      legs.forEach((l, i) => { const sd = i ? 1 : -1; l.hp.rotation.set(-0.55, 0, sd * 0.28); l.kn.rotation.x = 0.85; });
      torso.rotation.x = 0.3; head.rotation.x = -0.28;
      arms.forEach((a, i) => { const sd = i ? 1 : -1; a.sh.rotation.set(-0.35, 0, sd * (1.05 + 0.08 * Math.sin(b * PI))); a.el.rotation.x = -0.35; });
      g.position.x = x0 + 0.16 * Math.sin(b * PI / 2);
    };
    const u = s - at0;
    if (pose === 'ready') ready();
    else if (pose === 'dive') {
      if (u < 0) ready();
      else {
        const e = sm(u / 0.42), fly = Math.sin(PI * cl(u / 0.42));
        g.position.x = x0 + dir * 0.5 * e; g.position.y = 0.34 * e + 0.45 * fly; g.rotation.z = -dir * 1.5 * e;
        arms.forEach((a, i) => { const sd = i ? 1 : -1; a.sh.rotation.set(0, 0, sd * (1.05 + 1.7 * e)); a.el.rotation.x = -0.1; });
        legs.forEach((l, i) => { l.hp.rotation.set(-0.2 * e, 0, (i ? 1 : -1) * 0.18); l.kn.rotation.x = 0.3; });
        if (Kf.look) { head.rotation.y = dir * 0.2 * e; head.rotation.x = -0.35 * e; }
      }
    } else if (pose === 'blown') {
      if (u < 0) ready();
      else {
        const e = sm(u / 0.32), fly = Math.sin(PI * cl(u / 0.32)), sag = cl((u - 0.5) / 2.5);
        g.position.z = z0 - 1.3 * e; g.position.y = 0.3 * fly + 0.32 * e - 0.1 * sag; g.rotation.x = -0.32 * e;
        arms.forEach((a, i) => { const sd = i ? 1 : -1; a.sh.rotation.set(0.15 * e, 0, sd * (1.05 + 1.25 * e)); a.el.rotation.x = -0.1; });
        legs.forEach((l, i) => { l.hp.rotation.set(-0.15 * e, 0, (i ? 1 : -1) * (0.28 + 0.4 * e)); l.kn.rotation.x = 0.15; });
        head.rotation.x = -0.15 * e; eyes.forEach(ey => ey.scale.set(1.4, 1.4, 1));
      }
    } else if (pose === 'swoon') {
      const e = sm(u / 0.5), kneel = sm((u - 0.8) / 0.6), sway = Math.sin(s * 3.2) * 0.12;
      hips.position.y = 0.5 - 0.24 * kneel; g.rotation.z = sway * e;
      legs.forEach(l => { l.hp.rotation.set(-0.12 * (1 - kneel), 0, 0); l.kn.rotation.x = 1.5 * kneel; });
      arms.forEach((a, i) => { const sd = i ? 1 : -1; a.sh.rotation.set(-1.0 * e, 0, sd * (0.4 - 0.75 * e)); a.el.rotation.set(-1.45 * e, 0, 0); });
      head.rotation.set(-0.15 * e, 0, 0.3 * e); torso.rotation.x = -0.1 * e;
      eyes.forEach(ey => ey.scale.set(1, 0.35 + 0.65 * (1 - e), 1));
      if (u >= 0) {
        hearts.visible = true;
        hearts.children.forEach((h, q) => { const a2 = u - q * 0.35, vis = a2 > 0; h.visible = vis; if (!vis) return; const pop = cl(a2 / 0.2); h.position.set((q - 1) * 0.28, 1.55 + 0.35 * ((a2 % 1.6) / 1.6) - 0.24 * kneel, 0.1); h.scale.setScalar(1.6 * (0.5 + 0.5 * pop) * (1 + 0.12 * Math.sin(a2 * 10))); });
      }
    } else if (pose === 'beckon') {
      hips.position.y = 0.47; torso.rotation.x = 0.1; head.rotation.x = -0.18;
      legs.forEach((l, i) => { l.hp.rotation.set(-0.2, 0, (i ? 1 : -1) * 0.22); l.kn.rotation.x = 0.35; });
      const curl = Math.abs(Math.sin(b * PI * 2));
      arms[1].sh.rotation.set(-0.35, 0, 2.3); arms[1].el.rotation.set(-0.2 - 1.3 * curl, 0, 0);
      arms[0].sh.rotation.set(0.2, 0, -0.75); arms[0].el.rotation.set(-1.6, 0, 0);
    } else if (pose === 'dance') {
      // bored of waiting, he grooves on his line: a side-to-side bob, the arms pumping, the eyes half shut
      const sw = Math.sin(b * PI), bob = Math.abs(sw);
      hips.position.y = 0.46 + 0.05 * bob; g.position.x = x0 + 0.12 * Math.sin(b * PI / 2); g.rotation.z = 0.12 * sw;
      legs.forEach((l, i) => { const sd = i ? 1 : -1; l.hp.rotation.set(-0.3 * Math.max(0, sd * sw), 0, sd * 0.2); l.kn.rotation.x = 0.5 * Math.max(0, sd * sw); });
      const side = Math.floor(b / 4) % 2 ? 1 : 0;
      arms.forEach((a, i) => { const sd = i ? 1 : -1; if (i === side) { a.sh.rotation.set(-0.2, 0, sd * (2.55 + 0.12 * bob)); a.el.rotation.set(0, 0, 0); } else { a.sh.rotation.set(0.2, 0, sd * 0.75); a.el.rotation.set(-1.6, 0, 0); } });
      head.rotation.set(-0.1 + 0.12 * bob, 0, -0.15 * sw); eyes.forEach(ey => ey.scale.set(1, 0.4, 1));
    } else if (pose === 'wait') {
      torso.rotation.x = -0.05; head.rotation.set(0.05, 0, 0.12);
      arms.forEach((a, i) => { const sd = i ? 1 : -1; a.sh.rotation.set(-0.85, 0, -sd * 0.5); a.el.rotation.set(-1.55, 0, 0); });
      legs[1].kn.rotation.x = 0.35 * Math.max(0, Math.sin(b * PI)); legs[1].hp.rotation.x = -0.18 * Math.max(0, Math.sin(b * PI));
    } else if (pose === 'sit' || pose === 'sleep' || pose === 'sad' || pose === 'wake') {
      const sleeping = pose === 'sleep' || (pose === 'wake' && u < 0);
      hips.position.y = 0.2; torso.rotation.x = -0.18;
      legs.forEach((l, i) => { l.hp.rotation.set(-1.4, 0, (i ? 1 : -1) * 0.25); l.kn.rotation.x = 0.5; });
      arms.forEach((a, i) => { const sd = i ? 1 : -1; a.sh.rotation.set(-0.5, 0, sd * 0.25); a.el.rotation.x = -0.4; });
      if (pose === 'sad') { head.rotation.x = 0.7; torso.rotation.x = 0.25; arms.forEach((a, i) => { const sd = i ? 1 : -1; a.sh.rotation.set(-0.9, 0, sd * 0.2); a.el.rotation.x = -0.2; }); }
      if (sleeping) {
        head.rotation.set(0.62, 0, 0.22); torso.rotation.z = 0.14; torso.scale.y = 1 + 0.025 * Math.sin(s * 2.4);
        eyes.forEach(ey => ey.scale.set(1.1, 0.15, 1));
        bubble.visible = true; bubble.scale.setScalar(0.5 + 1.1 * (0.5 + 0.5 * Math.sin(s * 2.4)));
      }
      if (pose === 'wake' && u >= 0) {
        const e = sm(u / 0.35), jolt = Math.sin(PI * cl(u / 0.35));
        hips.position.y = 0.2 + 0.3 * e + 0.25 * jolt; torso.rotation.x = -0.18 + 0.4 * e;
        legs.forEach((l, i) => { l.hp.rotation.set(-1.4 * (1 - e) - 0.4 * e, 0, (i ? 1 : -1) * 0.3); l.kn.rotation.x = 0.5 + 0.4 * e; });
        arms.forEach((a, i) => { const sd = i ? 1 : -1; a.sh.rotation.set(-0.3, 0, sd * (0.25 + 2.3 * jolt + 0.9 * e)); a.el.rotation.x = -0.3; });
        eyes.forEach(ey => ey.scale.set(1.5, 1.5, 1)); head.rotation.set(-0.2, (Kf.look ?? 0) * e, 0);
      }
    }
  }

  // ======================================================================================================================
  function final() {
    const G = new THREE.Group();
    // ---------------- the pitch: stripes of mown grass, white lines ----------------
    const grassT = tex(16, 16, (x, r) => { px(x, '#3f8f3a', 0, 0, 16, 16); noise(x, r, 16, 16, ['#469a40', '#3a8636', '#4a9e44'], 60); }, 1710);
    const W = 60;
    for (let i = 0; i < 20; i++) { const z0 = -16 + i * 4.2; G.add(flat(W, 4.2, mat({ map: grassT, rep: [W / 2, 2.1], color: i % 2 ? 0xdcefd8 : 0xffffff }), 0, 0, z0 + 2.1)); }
    const lineM = mat({ color: 0xf4f4ec, unlit: 0.55 });
    const line = (x0, z0, x1, z1, w = 0.12) => { const len = Math.hypot(x1 - x0, z1 - z0); G.add(flat(x0 === x1 ? w : len, x0 === x1 ? len : w, lineM, (x0 + x1) / 2, 0.006, (z0 + z1) / 2)); };
    line(-TOUCH_X, GOAL_Z, TOUCH_X, GOAL_Z); line(-TOUCH_X, HALF_Z, TOUCH_X, HALF_Z);
    line(-TOUCH_X, GOAL_Z, -TOUCH_X, 64); line(TOUCH_X, GOAL_Z, TOUCH_X, 64);
    line(-BOX_W, GOAL_Z, -BOX_W, BOX_Z); line(BOX_W, GOAL_Z, BOX_W, BOX_Z); line(-BOX_W, BOX_Z, BOX_W, BOX_Z);
    line(-SIX_W, GOAL_Z, -SIX_W, SIX_Z); line(SIX_W, GOAL_Z, SIX_W, SIX_Z); line(-SIX_W, SIX_Z, SIX_W, SIX_Z);
    // the penalty spot, the D and the centre circle, as short segments
    G.add(at(rot(new THREE.Mesh(new THREE.CircleGeometry(0.2, 10), lineM), -PI / 2, 0, 0), 0, 0.007, 0));
    const arc = (cx, cz, r, a0, a1, n) => { for (let q = 0; q < n; q++) { const a = a0 + (a1 - a0) * (q + 0.5) / n, seg = flat(0.12, (a1 - a0) * r / n + 0.02, lineM, cx + Math.sin(a) * r, 0.006, cz + Math.cos(a) * r); seg.rotation.z = -a; G.add(seg); } };
    const dA = Math.acos(BOX_Z / CIRCLE_R); arc(0, 0, CIRCLE_R, -dA, dA, 10);
    arc(0, HALF_Z, CIRCLE_R, 0, TAU, 40); G.add(at(rot(new THREE.Mesh(new THREE.CircleGeometry(0.2, 10), lineM), -PI / 2, 0, 0), 0, 0.007, HALF_Z));
    G.add(flat(220, 220, M(0x243024), 0, -0.02, 20));

    // ---------------- the goal: posts, net (the back one bulges), stanchions ----------------
    const postM = M(0xffffff, { unlit: 0.5 }), hw = GOAL_W / 2, NZ = GOAL_Z - NET_D;
    for (const sx of [-1, 1]) G.add(at(cyl(0.06, 0.06, GOAL_H, 8, postM), sx * hw, GOAL_H / 2, GOAL_Z));
    G.add(at(rot(cyl(0.06, 0.06, GOAL_W + 0.12, 8, postM), 0, 0, PI / 2), 0, GOAL_H, GOAL_Z));
    for (const sx of [-1, 1]) { G.add(at(rot(cyl(0.03, 0.03, NET_D, 6, M(0xd8d8d8)), PI / 2, 0, 0), sx * hw, GOAL_H - 0.05, GOAL_Z - NET_D / 2)); G.add(at(cyl(0.03, 0.03, GOAL_H - 0.05, 6, M(0xd8d8d8)), sx * hw, (GOAL_H - 0.05) / 2, NZ)); }
    const netT = tex(16, 16, x => { x.clearRect(0, 0, 16, 16); const c = 'rgba(250,250,250,0.95)'; px(x, c, 0, 0, 16, 1); px(x, c, 0, 0, 1, 16); px(x, c, 8, 0, 1, 16); px(x, c, 0, 8, 16, 1); }, 1711);
    const netMat = (w, h) => { const m = mat({ map: netT, rep: [w / 0.5, h / 0.5], unlit: 0.4, side: THREE.DoubleSide }); m.transparent = true; m.alphaTest = 0.4; return m; };
    const backGeo = new THREE.PlaneGeometry(GOAL_W, GOAL_H, 22, 9), back = new THREE.Mesh(backGeo, netMat(GOAL_W, GOAL_H)); back.position.set(0, GOAL_H / 2, NZ); G.add(back);
    const backBase = backGeo.attributes.position.array.slice();
    const roof = new THREE.Mesh(new THREE.PlaneGeometry(GOAL_W, NET_D), netMat(GOAL_W, NET_D)); roof.rotation.x = -PI / 2; roof.position.set(0, GOAL_H, GOAL_Z - NET_D / 2); G.add(roof);
    for (const sx of [-1, 1]) { const side = new THREE.Mesh(new THREE.PlaneGeometry(NET_D, GOAL_H), netMat(NET_D, GOAL_H)); side.rotation.y = PI / 2; side.position.set(sx * hw, GOAL_H / 2, GOAL_Z - NET_D / 2); G.add(side); }

    // ---------------- LED boards round the pitch ----------------
    const ledT = tex(64, 8, x => {
      px(x, '#101018', 0, 0, 64, 8); x.font = 'bold 7px monospace'; x.textBaseline = 'middle';
      let xx = 1; for (const [w, c] of [['DAI DAI', '#ffd83a'], ['SAXO', '#ff5fa2'], ['DAI DAI', '#5ad8ff'], ['GOAL', '#7aff8a']]) { x.fillStyle = c; x.fillText(w, xx, 4.5); xx += w.length * 4.2 + 3; }
      selfLit(x, 64, 8);
    }, 1712);
    const boards = [];
    const board = (w, x, z, ry) => { const m = mat({ map: ledT, rep: [w / 8, 1], unlit: 0.9 }), bd = new THREE.Mesh(new THREE.BoxGeometry(w, 0.8, 0.12), m); bd.position.set(x, 0.4, z); bd.rotation.y = ry; G.add(bd); boards.push(m); };
    board(40, 0, GOAL_Z - 3.2, 0); for (const sx of [-1, 1]) board(70, sx * (TOUCH_X + 2.2), 26, PI / 2);

    // ---------------- the stands: a bowl of pets (a painted crowd), the first rows behind the goal in 3D ----------------
    const crowdT = (seed, cols) => tex(64, 32, (x, r) => {
      px(x, '#23202c', 0, 0, 64, 32);
      for (let row = 0; row < 8; row++) for (let q = 0; q < 16; q++) {
        const cx = q * 4 + (row % 2) * 2, cy = row * 4, fur = ['#d8a868', '#e8d8c0', '#b08a60', '#f2eee6', '#9a9aa4', '#6a5a50'][Math.floor(r() * 6)];
        px(x, cols[Math.floor(r() * cols.length)], cx, cy + 2, 3, 2); px(x, fur, cx + 0.5, cy, 2, 2);
        if (r() < 0.08) px(x, cols[Math.floor(r() * cols.length)], cx + 2, cy - 1, 2, 2);
      }
    }, seed);
    const OURS = ['#f2d23a', '#f2d23a', '#2a9a4a', '#ffffff'], THEIRS = ['#e0307e', '#e0307e', '#1c1c26', '#ffffff'];
    const lightsT = tex(16, 2, x => { px(x, '#fff8e0', 0, 0, 16, 2); for (let q = 1; q < 16; q += 2) px(x, '#8a8070', q, 0, 1, 2); }, 1713);
    const stand = (w, depth, h, x, z, ry, cols, seed) => {
      const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = ry; G.add(g);
      const slope = Math.hypot(depth, h), p = new THREE.Mesh(new THREE.PlaneGeometry(w, slope), mat({ map: crowdT(seed, cols), rep: [w / 8, slope / 4] }));
      p.rotation.x = -(PI / 2 - Math.atan2(h, depth)); p.position.set(0, 0.9 + h / 2, -depth / 2); g.add(p);
      g.add(at(box(w, 1.0, 0.4, M(0x3a3a48)), 0, 0.5, 0.1));
      g.add(at(box(w + 2, 0.5, depth + 4, M(0x2a2a34)), 0, h + 5.5, -depth / 2 - 1));
      g.add(at(new THREE.Mesh(new THREE.BoxGeometry(w, 0.25, 0.3), mat({ map: lightsT, rep: [w / 4, 1], unlit: 1 })), 0, h + 5.1, 1.0));
      return g;
    };
    stand(64, 18, 11, 0, STAND_Z, 0, [...OURS, ...THEIRS], 1714);
    stand(90, 18, 11, -(TOUCH_X + 3.5), 26, PI / 2, OURS, 1715);
    stand(90, 18, 11, TOUCH_X + 3.5, 26, -PI / 2, THEIRS, 1716);
    stand(64, 18, 11, 0, 68, PI, [...OURS, ...THEIRS], 1717);
    // floodlight towers in the corners, their banks facing the pitch
    const bankT = tex(8, 8, x => { px(x, '#fffbe8', 0, 0, 8, 8); for (let q = 0; q < 8; q += 2) { px(x, '#b8b098', 0, q + 1, 8, 1); px(x, '#b8b098', q + 1, 0, 1, 8); } }, 1718);
    for (const [fx, fz] of [[-30, -18], [30, -18], [-30, 70], [30, 70]]) {
      G.add(at(cyl(0.4, 0.6, 26, 6, M(0x5a5a66)), fx, 13, fz));
      const bank = new THREE.Mesh(new THREE.BoxGeometry(6, 3.5, 0.5), mat({ map: bankT, rep: [3, 2], unlit: 1, nofog: 1 }));
      bank.position.set(fx, 27, fz); bank.lookAt(0, 0, 26); G.add(bank);
    }
    // the players' tunnel in the left stand at the halfway line: a lit mouth under a canopy
    const [tx, tz] = TUNNEL;
    G.add(at(box(0.4, 3.2, 5.4, M(0x2a2a34)), tx + 0.4, 1.6, tz));
    G.add(at(box(0.3, 2.3, 3.2, M(0x06060a)), tx + 0.62, 1.15, tz));
    G.add(at(box(3.2, 0.22, 4.2, M(0xe8e8f0)), tx + 2.0, 2.55, tz));
    for (const sz of [-1, 1]) G.add(at(box(3.2, 1.9, 0.12, M(0xb8bcc8)), tx + 2.0, 1.6, tz + sz * 2.05));
    G.add(at(box(0.06, 2.0, 2.6, glow(0xfff4d8)), tx + 0.5, 1.2, tz));
    // the big screen over the stand behind the goal: the penalty tally, 4 a side
    const screen = at(new THREE.Group(), 0, 15.5, STAND_Z - 19.5); G.add(screen);
    screen.add(at(box(12, 5, 0.5, M(0x16161e)), 0, 0, 0));
    const dotOn = [glow(0xffd83a), glow(0xe0307e)], dotOff = M(0x3a3a46), dots = [[], []];
    for (let row = 0; row < 2; row++) for (let q = 0; q < 4; q++) { const d = at(new THREE.Mesh(new THREE.CircleGeometry(0.7, 10), dotOff), -3.9 + q * 2.6, row ? -1.1 : 1.1, 0.27); screen.add(d); dots[row].push(d); }
    // ---------------- the fans: three rows of 3D pets behind the goal, on the first steps ----------------
    const fans = [];
    for (let row = 0; row < 3; row++) for (let q = 0; q < 14; q++) {
      const x = -12.6 + q * 1.95 + (row % 2) * 0.9, ours = (x > 0) === (row !== 1), fl = (q + row) % 3 === 0;
      const p = pet(q + row * 14, ours ? { top: 0xf2d23a, trim: 0x2a9a4a, flag: fl } : { top: 0xe0307e, trim: 0x1c1c26, flag: fl });
      G.add(p.g); fans.push({ p, x, y: 1.05 + row * 0.62, z: STAND_Z - 0.9 - row * 1.0 });
    }
    // flares: red lights and smoke among the fans
    const flares = [[-1.9, 1.9, STAND_Z - 1.9], [0.7, 2.5, STAND_Z - 2.9], [2.6, 1.3, STAND_Z - 0.9]].map(([x, y, z]) => {
      const g = new THREE.Group(); g.position.set(x, y, z); G.add(g);
      g.add(at(new THREE.Mesh(new THREE.IcosahedronGeometry(0.26, 1), glow(0xff4a2a)), 0, 0.45, 0)); g.add(at(new THREE.Mesh(new THREE.IcosahedronGeometry(0.75, 1), mat({ color: 0xff3a1a, unlit: 1, see: 0.55 })), 0, 0.5, 0)); g.add(at(cyl(0.03, 0.03, 0.4, 4, M(0x2a2a2a)), 0, 0.18, 0));
      const puffs = []; for (let q = 0; q < 7; q++) { const pf = new THREE.Mesh(new THREE.IcosahedronGeometry(0.35, 1), mat({ color: 0xe8b8b0, unlit: 0.45, see: 0.45 })); g.add(pf); puffs.push(pf); }
      return { g, puffs };
    });
    // confetti round the shot's focus, fireworks over the stand behind the goal
    const confM = [0xffd83a, 0x2a9a4a, 0xffffff, 0xff5fa2].map(c => mat({ color: c, unlit: 0.7, side: THREE.DoubleSide }));
    const confG = new THREE.Group(); G.add(confG);
    const confetti = [0, 1, 2, 3].map(q => fall(confG, 70, confM[q], new THREE.PlaneGeometry(0.16, 0.11), { w: 10, top: 9, speed: 1.1, spin: 3, drift: 0.6, seed: 1720 + q }));
    const FW = [0, 1].map(() => { const g = new THREE.Group(), parts = [], m = mat({ color: 0xffffff, unlit: 1, nofog: 1 }); for (let q = 0; q < 90; q++) { const sp = box(0.38, 0.38, 0.38, m); g.add(sp); parts.push(sp); } G.add(g); return { g, parts, m }; });
    const DIRS = Array.from({ length: 90 }, (_, q) => { const y = 1 - 2 * (q + 0.5) / 90, r = Math.sqrt(1 - y * y), a = q * 2.39996; return [Math.cos(a) * r, y, Math.sin(a) * r]; });
    const FWC = [0xffd83a, 0x5ad8ff, 0xff5a9a, 0x7aff8a, 0xffffff, 0xff8a3a];
    // the skies: a night dome with stars, a sunrise dome and its sun
    const nightT = tex(4, 64, x => { const g = x.createLinearGradient(0, 0, 0, 64); g.addColorStop(0, '#05061a'); g.addColorStop(0.4, '#101640'); g.addColorStop(0.5, '#2a2a5a'); g.addColorStop(0.6, '#161430'); g.addColorStop(1, '#0a0a16'); x.fillStyle = g; x.fillRect(0, 0, 4, 64); }, 1721);
    const dawnT = tex(4, 64, x => { const g = x.createLinearGradient(0, 0, 0, 64); g.addColorStop(0, '#4a6ab8'); g.addColorStop(0.3, '#b88ac8'); g.addColorStop(0.44, '#ffb07a'); g.addColorStop(0.5, '#ffe0a0'); g.addColorStop(0.56, '#e08a6a'); g.addColorStop(1, '#3a2a3a'); x.fillStyle = g; x.fillRect(0, 0, 4, 64); }, 1722);
    const skyN = new THREE.Mesh(new THREE.SphereGeometry(185, 16, 12), mat({ map: nightT, unlit: 1, side: THREE.BackSide, nofog: 1 })); G.add(skyN);
    const starsN = stars(180, 175, 1723, 0xf0f0ff, 0.25); G.add(starsN);
    const skyD = new THREE.Mesh(new THREE.SphereGeometry(184, 16, 12), mat({ map: dawnT, unlit: 1, side: THREE.BackSide, nofog: 1 })); G.add(skyD);
    const sun = at(new THREE.Mesh(new THREE.IcosahedronGeometry(9, 1), mat({ color: 0xffe8a0, unlit: 1, nofog: 1 })), 60, 6, 150); G.add(sun);
    // the ball and the keeper
    const kissG = new THREE.Group(); G.add(kissG);
    const km = mat({ color: 0xff5fa2, unlit: 0.9 });
    for (let q = 0; q < 3; q++) { const h = new THREE.Group(); h.add(at(new THREE.Mesh(new THREE.IcosahedronGeometry(0.07, 0), km), -0.05, 0, 0)); h.add(at(new THREE.Mesh(new THREE.IcosahedronGeometry(0.07, 0), km), 0.05, 0, 0)); const tp = at(cone(0.085, 0.12, 4, km), 0, -0.075, 0); tp.rotation.x = PI; h.add(tp); kissG.add(h); }
    const ball = ballMesh(); G.add(ball);
    const kp = keeperPet(); G.add(kp.g);

    return {
      group: G, sky: null, shadowCol: 0x2a5a2a, indoor: false,
      light() {
        lights(0x7a8a9a, 0xe8f0ff, [0.25, -1, 0.35], 0x141a30, [40, 150], 12);
        pt(0, 0, 9, GOAL_Z + 3, 1.1, 1.1, 1.0);
        pt(1, 0, 9, 8, 1.0, 1.0, 0.95);
        pt(2, -8, 8, 22, 0.8, 0.8, 0.8);
        pt(3, 0, 3, STAND_Z - 1, 0.25, 0.25, 0.3);
      },
      anim(t, P = {}) {
        const c = P.t0 != null ? t - P.t0 : 0, b = beat(t), dawn = P.dawn ?? 0;
        skyN.visible = starsN.visible = dawn < 0.5; skyD.visible = sun.visible = dawn >= 0.5;
        if (dawn >= 0.5) { lights(0xa8a0a8, 0xffe0c0, [-0.5, -0.6, -0.6], 0x8a7a8a, [45, 160], 12); pt(0, 0, 9, GOAL_Z + 3, 0.7, 0.6, 0.5); pt(1, 0, 9, 8, 0.6, 0.55, 0.5); }
        if (P.key) pt(3, P.key[0], P.key[1], P.key[2], P.key[3], P.key[4], P.key[5]);
        boards.forEach(m => { m.uniforms.uOff.value.x = (t * 0.12) % 1; });
        kissG.visible = !!P.kiss;
        if (P.kiss) { const [ks, x0, y0, z0, x1, y1, z1] = P.kiss; kissG.children.forEach((h, q) => { const u = (c - ks - q * 0.16) / 0.8; h.visible = u > 0 && u < 1; if (!h.visible) return; const e = sm(u); h.position.set(x0 + (x1 - x0) * e, y0 + (y1 - y0) * e + 0.15 * Math.sin(u * PI), z0 + (z1 - z0) * e); h.scale.setScalar(0.8 + 1.8 * e); h.rotation.z = 0.3 * Math.sin(u * 9); }); }
        // the tally
        const [ours = 0, theirs = 3] = P.score || [];
        dots[0].forEach((d, q) => { d.material = q < ours ? dotOn[0] : dotOff; }); dots[1].forEach((d, q) => { d.material = q < theirs ? dotOn[1] : dotOff; });
        // the ball
        ball.visible = !P.noBall;
        const keys = P.ball || [[0, 0, BALL_R, 0]];
        let bx = keys[0][1], by = keys[0][2], bz = keys[0][3], dist = 0;
        for (let q = 1; q < keys.length; q++) {
          const [s0, x0, y0, z0] = keys[q - 1], [s1, x1, y1, z1, arcH = 0] = keys[q];
          if (c <= s0) break;
          const u = cl((c - s0) / Math.max(0.01, s1 - s0));
          bx = x0 + (x1 - x0) * u; bz = z0 + (z1 - z0) * u; by = y0 + (y1 - y0) * u + arcH * 4 * u * (1 - u);
          dist += Math.hypot(x1 - x0, z1 - z0, y1 - y0) * u;
          if (c < s1) break;
        }
        ball.position.set(bx, by, bz); ball.rotation.set(-dist / BALL_R, 0, dist * 0.4 / BALL_R);
        // the net: a bulge round (x, y) that holds, then relaxes
        const pos = backGeo.attributes.position, arr = pos.array; let bulge = 0, nx = 0, ny = 1;
        if (P.net) {
          const [s0, x0, y0, depth = 0.6, hold = 0.6] = P.net, u = c - s0;
          if (u >= 0) { const grow = sm(u / 0.12), rel = hold === true ? 0 : sm((u - hold) / 0.6); bulge = depth * grow * (1 - rel) * (1 + 0.12 * Math.sin(u * 22) * Math.exp(-u * 4)); nx = x0; ny = y0; }
        }
        for (let q = 0; q < arr.length; q += 3) { const d2 = (backBase[q] - nx) ** 2 + (backBase[q + 1] + GOAL_H / 2 - ny) ** 2; arr[q + 2] = backBase[q + 2] - bulge * Math.exp(-d2 / 0.35); }
        pos.needsUpdate = true;
        // the keeper
        poseKeeper(kp, P.keeper || {}, c, b);
        // the fans
        const mode = P.fans || 'bounce';
        fans.forEach((f, i) => {
          const show = !P.noguests && !cleared(P, f.x, f.z); f.p.g.visible = show; if (!show) return;
          f.p.g.position.set(f.x, f.y, f.z);
          let m2 = mode;
          if (mode === 'wave') { const ph = ((b * 0.5 - (f.x + 13) / 26 * 2) % 2 + 2) % 2; m2 = ph < 0.45 ? 'cheer' : 'bounce'; }
          const face = P.stare ? Math.atan2(P.stare[0] - f.x, P.stare[1] - f.z) : Math.atan2(-f.x * 0.3, 10);
          posePet(f.p, m2, b + i * 0.11, face);
        });
        // flares, confetti, fireworks
        const fl = P.flares != null && c >= P.flares;
        flares.forEach(F => {
          F.g.visible = fl; if (!fl) return;
          const a = c - P.flares;
          F.puffs.forEach((pf, j) => { const life = (a * 0.6 + j / 7) % 1; pf.position.set(Math.sin(j * 2.1 + a) * 0.4 * life, 0.6 + life * 3.2, -0.3 * life); pf.scale.setScalar(0.4 + 1.4 * life); });
        });
        if (fl) pt(3, 0, 2.6, STAND_Z - 1.4, 1.4, 0.35, 0.25);
        const conf = P.confetti === true || (P.confetti != null && c >= P.confetti);
        confG.visible = !!conf; if (conf) { confetti.forEach(f => f(t)); confG.position.set(P.focus?.[0] || 0, 0, (P.focus?.[1] || 0) + (P.confZ ?? -3)); }
        FW.forEach(F => { F.g.visible = false; });
        const fwOn = P.fw === true || (P.fw != null && c >= P.fw);
        if (fwOn) {
          const spb = 1 / (beat(1) - beat(0)), n = Math.floor(b / 4);
          for (const bar of [n - 1, n]) {
            const age = (b - bar * 4) * spb;
            if (age < 0 || age > 2.4) continue;
            const F = FW[((bar % 2) + 2) % 2], grow = 1 - Math.exp(-age * 2.4), fade = 1 - sm((age - 1.4) / 1.0);
            const cx = -14 + 28 * hash(bar, 1730), cy = (P.fwY ?? 26) + 8 * hash(bar, 1731), cz = (P.fwZ ?? -45) + 6 * hash(bar, 1732);
            F.g.visible = true; F.m.uniforms.uCol.value.set(FWC[((bar % FWC.length) + FWC.length) % FWC.length]);
            F.parts.forEach((sp, q) => { const [dx, dy, dz] = DIRS[q], R = (P.fwR ?? 11) * grow; sp.position.set(cx + dx * R, cy + dy * R - 1.6 * age * age, cz + dz * R); sp.scale.setScalar(Math.max(0.01, fade)); });
          }
        }
      },
    };
  }

  // ======================================================================================================================
  function globe() {
    const G = new THREE.Group(), R = GLOBE.R;
    const earthT = tex(64, 32, (x, r) => {
      px(x, '#2a6ac8', 0, 0, 64, 32); noise(x, r, 64, 32, ['#3276d0', '#2462b8', '#3a80d8'], 300);
      for (const [cx, cy, rx, ry] of [[8, 8, 6, 4], [12, 18, 3, 5], [27, 7, 4, 3], [31, 16, 4, 6], [44, 7, 8, 4], [52, 21, 4, 3], [20, 27, 6, 2]])
        for (let yy = -ry; yy <= ry; yy++) for (let xx = -rx; xx <= rx; xx++) {
          if ((xx / rx) ** 2 + (yy / ry) ** 2 > 1 - r() * 0.25) continue;
          px(x, r() < 0.7 ? (cy < 12 || cy > 22 ? '#5aa84a' : '#d8b870') : '#4a9a3e', (cx + xx + 64) % 64, cy + yy, 1, 1);
        }
      px(x, '#f2f6ff', 0, 0, 64, 2); px(x, '#f2f6ff', 0, 30, 64, 2);
    }, 1740);
    const planet = new THREE.Group(); planet.position.set(0, -R, 0); G.add(planet);
    planet.add(new THREE.Mesh(new THREE.SphereGeometry(R, 32, 20), mat({ map: earthT, unlit: 0.18 })));
    // clouds and tiny landmarks ride on the surface (children of the planet, so they turn with it)
    const up = new THREE.Vector3(0, 1, 0);
    const onSurface = (o, lat, lon, h = 0) => { const v = new THREE.Vector3(Math.sin(lon) * Math.cos(lat), Math.cos(lon) * Math.cos(lat), Math.sin(lat)); o.position.copy(v).multiplyScalar(R + h); o.quaternion.setFromUnitVectors(up, v); planet.add(o); return o; };
    const cloudM = mat({ color: 0xffffff, unlit: 0.5 });
    for (let q = 0; q < 18; q++) { const cg = new THREE.Group(); for (let j = 0; j < 3; j++) { const pf = at(new THREE.Mesh(new THREE.IcosahedronGeometry(0.28 + 0.12 * hash(q, j, 1741), 0), cloudM), (j - 1) * 0.3, 0, 0); pf.scale.y = 0.45; cg.add(pf); } const la = (hash(q, 1742) - 0.5) * 2.2; onSurface(cg, la + Math.sign(la || 1) * 0.35, hash(q, 1743) * TAU, 0.55); }
    const lm = (lat, lon, build) => { const o = new THREE.Group(); build(o); onSurface(o, lat, lon, 0); };
    // landmarks on the band behind the runner (lat -0.3: towards -z), and a few in front
    lm(-0.3, 0.9, o => { for (const [dx, s] of [[0, 0.7], [0.55, 0.5], [-0.5, 0.4]]) o.add(at(cone(s * 0.75, s, 4, M(0xe8c878)), dx, s / 2, 0)); });
    lm(-0.3, 2.1, o => { o.add(at(cone(0.28, 1.5, 4, M(0x8a7a6a)), 0, 0.75, 0)); o.add(at(box(0.5, 0.06, 0.5, M(0x8a7a6a)), 0, 0.5, 0)); });
    lm(-0.3, 3.3, o => { o.add(at(cyl(0.7, 0.8, 0.35, 12, M(0xd8d8e0)), 0, 0.17, 0)); o.add(at(cyl(0.55, 0.55, 0.02, 12, M(0x3f8f3a)), 0, 0.2, 0)); });
    lm(-0.3, 4.4, o => { o.add(at(cyl(0.14, 0.22, 0.6, 6, M(0x8a6a4a)), 0, 0.3, 0)); o.add(at(ico(0.4, 0, M(0x3a8a3a)), 0, 0.75, 0)); });
    lm(-0.3, 5.5, o => { o.add(at(cyl(0.25, 0.35, 0.9, 6, M(0x9a8a7a)), 0, 0.45, 0)); for (let j = 0; j < 4; j++) o.add(rot(at(cyl(0.05, 0.08, 0.6, 4, M(0x9a8a7a)), Math.sin(j * 1.6) * 0.3, 1.05, Math.cos(j * 1.6) * 0.3), Math.cos(j * 1.6) * 0.6, 0, -Math.sin(j * 1.6) * 0.6)); });
    lm(-0.32, 6.0, o => { for (let j = 0; j < 3; j++) o.add(at(box(0.3, 0.5 + j * 0.3, 0.3, M(0xb8c0d0)), (j - 1) * 0.36, 0.25 + j * 0.15, 0)); });
    // a faint atmosphere, the stars, the moon, the sun
    const atmo = new THREE.Mesh(new THREE.SphereGeometry(R * 1.06, 32, 20), mat({ color: 0x8ac8ff, unlit: 1, side: THREE.BackSide, see: 0.55 })); atmo.position.copy(planet.position); G.add(atmo);
    const spaceT = tex(4, 64, x => { const g = x.createLinearGradient(0, 0, 0, 64); g.addColorStop(0, '#02030c'); g.addColorStop(0.5, '#0a0c24'); g.addColorStop(1, '#04040e'); x.fillStyle = g; x.fillRect(0, 0, 4, 64); }, 1744);
    G.add(new THREE.Mesh(new THREE.SphereGeometry(185, 16, 12), mat({ map: spaceT, unlit: 1, side: THREE.BackSide, nofog: 1 })));
    G.add(stars(320, 175, 1745, 0xffffff, -1.2));
    G.add(at(new THREE.Mesh(new THREE.IcosahedronGeometry(7, 1), mat({ color: 0xd8d8e0, unlit: 0.85, nofog: 1 })), -45, 22, -120));
    G.add(at(new THREE.Mesh(new THREE.IcosahedronGeometry(10, 1), mat({ color: 0xfff0b0, unlit: 1, nofog: 1 })), 90, 8, -140));
    return {
      group: G, sky: null, shadowCol: 0x1a3a6a, indoor: false,
      light() {
        lights(0x6a7090, 0xfff4e0, [-0.6, -0.55, -0.4], 0x04040e, [60, 190], 10);
        pt(0, 2.5, 2.5, 3, 0.6, 0.6, 0.7);
      },
      anim(t, P = {}) {
        planet.rotation.z = t * (P.spin ?? 0.35);
        if (P.key) pt(3, P.key[0], P.key[1], P.key[2], P.key[3], P.key[4], P.key[5]);
      },
    };
  }

  // ======================================================================================================================
  function baobab() {
    const G = new THREE.Group();
    const dirtT = tex(16, 16, (x, r) => { px(x, '#b8764a', 0, 0, 16, 16); noise(x, r, 16, 16, ['#c28252', '#a86a40', '#c88a5a', '#9a6038'], 70); }, 1750);
    G.add(flat(160, 160, mat({ map: dirtT, rep: [80, 80] }), 0, 0, 0));
    const skyT = tex(4, 64, x => { const g = x.createLinearGradient(0, 0, 0, 64); g.addColorStop(0, '#3a2a5a'); g.addColorStop(0.3, '#a85a6a'); g.addColorStop(0.44, '#f09a5a'); g.addColorStop(0.5, '#ffd08a'); g.addColorStop(0.55, '#c8784a'); g.addColorStop(1, '#5a3a2a'); x.fillStyle = g; x.fillRect(0, 0, 4, 64); }, 1751);
    G.add(new THREE.Mesh(new THREE.SphereGeometry(185, 16, 12), mat({ map: skyT, unlit: 1, side: THREE.BackSide, nofog: 1 })));
    G.add(at(new THREE.Mesh(new THREE.IcosahedronGeometry(14, 1), mat({ color: 0xffd890, unlit: 1, nofog: 1 })), -40, 12, -160));
    for (let q = 0; q < 9; q++) { const h = new THREE.Mesh(new THREE.SphereGeometry(18 + 10 * hash(q, 1752), 10, 6), M(0x7a4a3a)); h.scale.y = 0.18; h.position.set(-110 + q * 28, 0, -120 - 20 * hash(q, 1753)); G.add(h); }
    // the giant baobab: a bottle trunk, thick gnarled branches, a few leaf clumps
    const bark = M(0x8a7666), [tx, tz] = BAOBAB.TREE, tree = at(new THREE.Group(), tx, 0, tz); G.add(tree);
    const prof = [[1.6, 0], [1.75, 0.8], [1.85, 2.2], [1.7, 3.8], [1.35, 5.2], [1.0, 6.2], [0.8, 6.8]].map(([r0, y0]) => new THREE.Vector2(r0, y0));
    tree.add(new THREE.Mesh(new THREE.LatheGeometry(prof, 9), bark));
    const branch = (a, el, len, r0, y0) => {
      const g = new THREE.Group(); g.position.set(0, y0, 0); g.rotation.set(0, a, 0); tree.add(g);
      const b1 = new THREE.Group(); b1.rotation.z = -el; g.add(b1);
      b1.add(at(cyl(r0 * 0.55, r0, len, 6, bark), 0, len / 2, 0));
      for (const s of [-1, 1]) { const b2 = at(new THREE.Group(), 0, len * 0.85, 0); b2.rotation.set(0, s * 0.8, -s * 0.5); b1.add(b2); b2.add(at(cyl(r0 * 0.25, r0 * 0.5, len * 0.6, 5, bark), 0, len * 0.3, 0)); b2.add(at(ico(0.55, 0, M(0x5a7a3a)), 0, len * 0.65, 0)); }
    };
    for (let q = 0; q < 7; q++) branch(q * TAU / 7 + 0.3, 0.55 + 0.35 * hash(q, 1754), 2.6 + 1.2 * hash(q, 1755), 0.42, 6.4);
    // round mud huts with thatched roofs, a stake fence, acacias
    const mud = M(0xa86a44), thatch = M(0xc8a060);
    for (const [hx, hz] of BAOBAB.HUTS) { G.add(at(cyl(1.4, 1.5, 1.8, 10, mud), hx, 0.9, hz)); G.add(at(cone(1.95, 1.6, 10, thatch), hx, 2.6, hz)); G.add(at(box(0.6, 1.1, 0.1, M(0x3a2418)), hx, 0.55, hz + 1.46)); }
    for (let q = 0; q < 26; q++) G.add(at(cyl(0.05, 0.06, 1.1 + 0.35 * hash(q, 1756), 4, M(0x6a4a2a)), -16 + q * 0.62, 0.6, -13.5 + 0.2 * Math.sin(q)));
    for (let q = 0; q < 4; q++) G.add(at(box(9, 0.06, 0.06, M(0x6a4a2a)), -11.8 + (q % 2) * 7.6, 0.55 + 0.35 * (q > 1), -13.5));
    for (const [ax, az, s] of [[-22, -30, 1.3], [26, -26, 1.1], [14, -40, 1.6], [-35, -48, 1.8]]) { const a = at(new THREE.Group(), ax, 0, az); a.scale.setScalar(s); G.add(a); a.add(at(cyl(0.12, 0.18, 3, 5, M(0x5a4030)), 0, 1.5, 0)); a.add(at(new THREE.Mesh(new THREE.CylinderGeometry(2.4, 1.6, 0.6, 8), M(0x4a6a2a)), 0, 3.2, 0)); }
    // the dirt pitch: stick goals and the kids
    for (const [gx, gz] of BAOBAB.GOALS) { for (const s of [-1, 1]) G.add(at(cyl(0.05, 0.06, 1.2, 4, M(0x5a3a22)), gx, 0.6, gz + s * 1.2)); G.add(at(rot(cyl(0.04, 0.05, 2.5, 4, M(0x5a3a22)), PI / 2, 0, 0), gx, 1.18, gz)); }
    const KIDS = [[-3.0, -2.4], [-1.5, -4.2], [1.9, -2.8], [3.4, -4.4], [-4.4, -4.6]];
    const kids = KIDS.map(([x, z], i) => { const p = pet(i + 3, { top: [0xf2f2f2, 0xf2d23a, 0x3a8ad8, 0xe0503a, 0x2a9a4a][i], trim: 0x5a3a22, scale: 0.72 }); G.add(p.g); return { p, x, z }; });
    const kball = ballMesh(); kball.scale.setScalar(0.85); G.add(kball);
    return {
      group: G, sky: null, shadowCol: 0x7a4a2a, indoor: false,
      light() {
        lights(0xa87a6a, 0xffd0a0, [0.7, -0.45, 0.5], 0xc8805a, [30, 140], 9);
        pt(0, -6, 3, 6, 0.9, 0.55, 0.35);
      },
      anim(t, P = {}) {
        if (P.key) pt(3, P.key[0], P.key[1], P.key[2], P.key[3], P.key[4], P.key[5]);
        const b = beat(t), mode = P.kids || 'play';
        // the kids pass the ball round the ring on every beat; it bounces between them
        const n = kids.length, seg = Math.floor(b), u = b - seg, A = kids[((seg % n) + n) % n], B = kids[(((seg + 2) % n) + n) % n];
        kball.visible = mode === 'play' && !P.noguests;
        kball.position.set(A.x + (B.x - A.x) * u, 0.13 + 0.9 * u * (1 - u), A.z + (B.z - A.z) * u); kball.rotation.x = b * 6;
        kids.forEach((q, i) => {
          const show = !P.noguests && !cleared(P, q.x, q.z); q.p.g.visible = show; if (!show) return;
          const run = mode === 'play' ? 0.35 * Math.sin(b * 0.9 + i * 1.7) : 0;
          q.p.g.position.set(q.x + run, 0, q.z);
          const face = P.stare ? Math.atan2(P.stare[0] - q.x, P.stare[1] - q.z) : mode === 'play' ? Math.atan2(kball.position.x - q.x, kball.position.z - q.z) : Math.atan2(-q.x, 12 - q.z);
          posePet(q.p, mode === 'cheer' ? 'cheer' : 'bounce', b * (mode === 'play' ? 2 : 1) + i * 0.3, face);
        });
      },
    };
  }
  return { final: final(), globe: globe(), baobab: baobab() };
}
