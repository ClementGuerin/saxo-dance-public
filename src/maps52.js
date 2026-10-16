// maps52.js: the "deja vu" maps (2026-10-16 2nd, Olivia Rodrigo, 2021; the clip: a cream 1960s convertible along the
// Malibu coast with the new girl at the wheel in a paisley headscarf and sunglasses, strawberry ice cream with a blue
// spoon, a Spanish house on the cliff under red bougainvillea, a pink room, a green dress, and a dark room of stacked old
// TVs replaying the memories). Same contract as the other map files, pure in t:
//   beachhouse  the living room of a Spanish house on the Malibu cliff at dusk (y = 0; x +-6, z -4.6..6.2, 4.2 m high):
//               terracotta tiles, dusty pink walls under dark beams, the back wall's two arched windows on the sunset sea
//               behind the pink velvet sofa (BH.SOFA: a low lounge sofa, its seat SEAT_Y 0.2 along x, its middle line at SOFA.z, facing
//               +z; Sadi's mark SADI, the dog's old spot SPOT), a round stained-glass window over it, a round rug in the
//               middle (RUG), the wall of old TVs facing the sofa across the room (on a low cabinet, their fronts at
//               TV_Z, facing -z; their screens by `tvs`: 'show' (a sunny beach), 'vac' (the robot vacuum and a heart on
//               every screen), 'robo' (the robot dog), 'static', 'heart', 'off', or a list per screen), the front door in
//               the right wall (DOOR, `door` 0-1 or a ramp [s0, s1, a, b]: swung in on the sunny porch), potted
//               bougainvillea, a floor lamp. Flags `zone` 'dusk' (the default) | 'day' (the memories: a bright
//               afternoon) | 'night' (the TVs the main light), `vac`, `robo`, `parcel`, `snack`, `hearts` + `heartYaw`,
//               `tvs2` [s, mode] (the screens switch mid-shot), 'memory' (the dog and Sadi with a heart), `bark` [[x, y, z, yaw, s0]]
//               (white arcs out of a barking mouth every half second), `hide` ['sofa', 'rug', 'tvs', 'lamp', 'plants', 'glass'], `key`.
//   coastroad   the Pacific Coast Highway at golden hour streaming past the still convertible at the origin (nose to +x,
//               the driver on -z, DCAR), the sea on +z below a white wooden guard rail and a cliff, a hillside on -z with
//               fan palms and pink ice plant, a white house on the hill, the sun low over the sea: `speed` (m/s, default
//               CR.SPEED), `still`, `vac` / `robo` (world coordinates: the passenger seat is DCAR.PASS at DCAR.SEAT_Y),
//               `hearts`, `hide` ['palms', 'rocks'], `key`.
// Shared by both maps:
//   vac    [{ x, z, y, yaw, to: [x, z], at, dur, lin, spin (deg/s), tilt (deg: its top turned towards its front, the
//          front edge dipping: on a lap or a seat, its face to a lens in front), eyes 'dot' | 'heart' | 'sad' | 'happy', cardigan (true or s: Sadi's pink cardigan
//          draped over it), shades, booster (m: a pink cushion under it), bump [s, ...] (a hop on each), hearts (s: three
//          hearts rising over it, looping),
//          hide }]: the robot vacuum (VAC: radius R, its top TOP for a rider's `lift`): a charcoal disc with a silver
//          bumper, a lighter lid, a sensor turret, a cyan ring light pulsing on the beat, two big LED eyes on its front
//          (it's a character), two side brushes that spin while it moves; at yaw 0 its front faces +z.
//   robo   { x, z, y, yaw, pose 'stand' | 'sit', wag, eyes 'dot' | 'heart', pop [s0, dur] (rising out of the parcel
//          from 0.55 m down), hearts (s), hide }: the robot dog: white plastic, grey joints, a black visor face with
//          LED eyes, triangle ears, a wagging antenna tail; at yaw 0 it faces +z.
//   parcel { x, z, yaw, open (s: the lid flies off and lands beside it) }: a big cardboard box tied with a red ribbon
//          and a bow, hollow, so the robot dog can rise out of it.
//   snack  [{ kind 'scoop' | 'ball', from: [x, y, z], to: [x, z], s0, dur, arc, gone (s: sucked up, shrinking over
//          0.25 s) }]: a scoop of strawberry ice cream dropped out of its cup (pink with sprinkles, a splat once it
//          lands), a tennis ball.
import { mapKit } from './mapkit.js';

export const BH = {
  X: 6, Z0: -4.6, Z1: 6.2, H: 4.2,
  SOFA: { x: 0, z: -3.5, w: 3.0, d: 0.86, SEAT_Y: 0.2, BACK_Y: 0.78 },   // a low lounge sofa: a chibi's hips sit 0.18 m over its feet (at 0.42 m every sitter stood on the cushion)
  SADI: [0.62, -3.38], SPOT: [-0.5, -3.32],
  RUG: [0, -0.7, 1.95],
  TV_Z: 5.45, CAB_Y: 0.45,
  DOOR: [6, 1.7], DOOR_W: 1.25, DOOR_H: 2.4,
};
export const CR = { SPEED: 9, ROAD: [-3.8, 2.0], MID: -0.9, RAIL_Z: 2.85 };
export const VAC = { R: 0.22, H: 0.085, TOP: 0.1 };
export const DCAR = { L: 3.9, W: 2.0, SEAT_Y: 0.45, DRIVER: [-0.18, -0.5], PASS: [-0.18, 0.5], WHEEL: [0.1, 0.85, -0.46] };

export function buildDejaVuMaps(K) {
  const k = mapKit(K);
  const { THREE, mat, tex, px, noise, box, TAU, PI, beat, hash, fr, cyl, cone, ico, at, rot, flat, lights, pt } = k;
  const M = (c, o = {}) => mat({ color: c, ...o }), glow = (c, u = 1) => mat({ color: c, unlit: u });
  const cl = x => Math.max(0, Math.min(1, x)), sm = x => { x = cl(x); return x * x * (3 - 2 * x); };
  const pmod = (a, n) => ((a % n) + n) % n;
  const ramp = (v, s) => Array.isArray(v) ? v[2] + (v[3] - v[2]) * sm((s - v[0]) / Math.max(0.01, v[1] - v[0])) : (v === true ? 1 : (v || 0));
  const from = (v, s) => v === true || (typeof v === 'number' && s >= v);
  const shotT = (t, P) => P.t0 != null ? t - P.t0 : 0;
  const CHROME = M(0xd8dce4, { unlit: 0.25 });

  // ---------- the robot vacuum, the robot dog, the parcel, the snacks (both maps) ----------
  const VB = M(0x2c3038), VRIM = M(0xb8bec8, { unlit: 0.2 }), VLID = M(0x4a505c), VRING = glow(0x5af0ff, 1), VEYE = glow(0xe8fbff, 1), VHEART = glow(0xff4f9a, 1);
  const PINK = M(0xffc2da, { unlit: 0.55 }), SHADE = M(0x111114, { unlit: 0.1 });
  function heartMesh(m, s = 1) {
    const h = new THREE.Group();
    h.add(at(ico(0.1 * s, 0, m), -0.075 * s, 0, 0)); h.add(at(ico(0.1 * s, 0, m), 0.075 * s, 0, 0)); h.add(rot(at(cone(0.125 * s, 0.18 * s, 4, m), 0, -0.11 * s, 0), PI, 0, 0));
    return h;
  }
  function vacModel() {
    const g = new THREE.Group(), tiltG = new THREE.Group(), body = new THREE.Group(); g.add(tiltG); tiltG.add(body);
    body.add(at(cyl(VAC.R, VAC.R, 0.07, 16, VB), 0, 0.047, 0));
    // a booster cushion under it (a passenger seat: on the bare seat the door hid it), its height set per shot
    const booster = at(box(0.5, 1, 0.5, PINK), 0, 0, 0); booster.visible = false; g.add(booster);
    body.add(at(cyl(VAC.R + 0.006, VAC.R + 0.006, 0.03, 16, VRIM), 0, 0.03, 0));
    body.add(at(cyl(0.175, 0.175, 0.012, 16, VLID), 0, 0.087, 0));
    const ring = at(new THREE.Mesh(new THREE.TorusGeometry(0.19, 0.011, 4, 20), VRING), 0, 0.094, 0); ring.rotation.x = PI / 2; body.add(ring);
    body.add(at(cyl(0.045, 0.045, 0.025, 10, M(0x1a1c22)), 0, 0.105, -0.1)); body.add(at(box(0.026, 0.012, 0.026, glow(0x7affb0, 1)), 0, 0.12, -0.1));
    // the face: a dark visor band on the front of the bumper, tilted up so lenses above see it, two big eyes in it
    const face = at(new THREE.Group(), 0, 0.098, 0.075); face.rotation.x = -PI / 2 + 0.3; body.add(face);
    face.add(at(box(0.3, 0.13, 0.02, M(0x101216)), 0, 0, 0));
    const eyes = { dot: new THREE.Group(), heart: new THREE.Group(), sad: new THREE.Group(), happy: new THREE.Group() };
    for (const sx of [-1, 1]) {
      const dot = at(cyl(0.034, 0.034, 0.01, 8, VEYE), sx * 0.075, 0, 0.012); dot.rotation.x = PI / 2; eyes.dot.add(dot);
      eyes.heart.add(at(heartMesh(VHEART, 0.3), sx * 0.075, 0.006, 0.014));
      const sd = at(box(0.065, 0.018, 0.01, VEYE), sx * 0.075, 0, 0.013); sd.rotation.z = -sx * 0.5; eyes.sad.add(sd);
      for (const hx of [-1, 1]) { const hp = at(box(0.04, 0.015, 0.01, VEYE), sx * 0.075 + hx * 0.016, 0.006, 0.013); hp.rotation.z = -hx * 0.7; eyes.happy.add(hp); }
    }
    Object.values(eyes).forEach(e => face.add(e));
    // two side brushes under the front corners: three white bristle arms each
    const brushes = [-1, 1].map(sx => {
      const b = at(new THREE.Group(), sx * 0.16, 0.012, 0.12);
      for (let i = 0; i < 3; i++) { const arm = new THREE.Group(); arm.rotation.y = i / 3 * TAU; arm.add(at(box(0.012, 0.006, 0.09, M(0xf2f2ee)), 0, 0, 0.04)); b.add(arm); }
      body.add(b); return b;
    });
    // Sadi's pink cardigan draped over it like a cape: a shallow dome and two sleeves down its sides, three buttons
    const card = new THREE.Group(); body.add(card);
    {
      const dome = new THREE.Mesh(new THREE.SphereGeometry(0.205, 12, 6, 0, TAU, 0, PI * 0.42), PINK); dome.scale.set(1, 0.42, 1); dome.position.y = 0.075; card.add(dome);
      for (const sx of [-1, 1]) { const sl = at(box(0.07, 0.16, 0.1, PINK), sx * 0.23, 0.03, 0.06); sl.rotation.z = sx * 0.2; card.add(sl); card.add(at(box(0.075, 0.03, 0.105, M(0xfaf6ee, { unlit: 0.4 })), sx * 0.245, -0.045, 0.06)); }
      card.add(at(box(0.03, 0.03, 0.34, M(0xfaf6ee, { unlit: 0.4 })), 0, 0.105, 0.0));   // the white button placket down its middle
      for (const z of [-0.1, 0.0, 0.1]) card.add(at(box(0.026, 0.02, 0.026, M(0xd8a8c0)), 0, 0.122, z));
    }
    // tiny cat-eye sunglasses above its eyes
    const shades = at(new THREE.Group(), 0, 0.045, 0.012); face.add(shades);
    for (const sx of [-1, 1]) { const l = at(box(0.075, 0.036, 0.012, SHADE), sx * 0.065, 0, 0.012); l.rotation.z = sx * 0.12; shades.add(l); }
    shades.add(at(box(0.05, 0.01, 0.01, SHADE), 0, 0.006, 0.012));
    const hearts = Array.from({ length: 3 }, () => { const h = heartMesh(M(0xff4f9a, { unlit: 0.8 }), 0.9); h.visible = false; g.add(h); return h; });
    return { g, tiltG, body, ring, eyes, brushes, card, shades, hearts, booster };
  }
  const WHITE = M(0xf4f4f6, { unlit: 0.15 }), JOINT = M(0x8a8e98), VISOR = M(0x0c0e12), LED = glow(0x6af6ff, 1);
  function roboModel() {
    const g = new THREE.Group(), body = at(new THREE.Group(), 0, 0.4, 0); g.add(body);
    body.add(box(0.3, 0.22, 0.46, WHITE)); body.add(at(box(0.31, 0.06, 0.3, JOINT), 0, -0.07, 0.02));
    const legs = [];
    for (const [sx, sz] of [[-1, 1], [1, 1], [-1, -1], [1, -1]]) {
      const hip = at(new THREE.Group(), sx * 0.11, -0.06, sz * 0.16); body.add(hip); legs.push({ hip, front: sz > 0 });
      hip.add(ico(0.05, 0, JOINT)); hip.add(at(cyl(0.045, 0.04, 0.17, 6, WHITE), 0, -0.1, 0)); hip.add(at(ico(0.04, 0, JOINT), 0, -0.19, 0));
      hip.add(at(cyl(0.035, 0.04, 0.13, 6, WHITE), 0, -0.26, 0)); hip.add(at(box(0.07, 0.035, 0.09, JOINT), 0, -0.33, 0.015));
    }
    const head = at(new THREE.Group(), 0, 0.2, 0.22); body.add(head);
    head.add(at(box(0.27, 0.22, 0.25, WHITE), 0, 0.03, 0)); head.add(at(box(0.15, 0.08, 0.1, WHITE), 0, -0.04, 0.16));
    head.add(at(box(0.24, 0.11, 0.015, VISOR), 0, 0.06, 0.128));
    const eyes = { dot: new THREE.Group(), heart: new THREE.Group() };
    for (const sx of [-1, 1]) { eyes.dot.add(at(box(0.04, 0.04, 0.01, LED), sx * 0.06, 0.06, 0.137)); eyes.heart.add(at(heartMesh(M(0xff4f9a, { unlit: 1 }), 0.24), sx * 0.06, 0.065, 0.14)); }
    head.add(eyes.dot); head.add(eyes.heart);
    for (const sx of [-1, 1]) { const e = at(cone(0.06, 0.13, 3, WHITE), sx * 0.09, 0.2, -0.02); e.rotation.z = -sx * 0.3; head.add(e); }
    const tail = at(new THREE.Group(), 0, 0.08, -0.23); body.add(tail);
    const stalk = at(cyl(0.012, 0.012, 0.2, 4, JOINT), 0, 0.09, -0.03); stalk.rotation.x = -0.35; tail.add(stalk); tail.add(at(ico(0.03, 0, LED), 0, 0.19, -0.07));
    const hearts = Array.from({ length: 3 }, () => { const h = heartMesh(M(0xff4f9a, { unlit: 0.8 }), 0.9); h.visible = false; g.add(h); return h; });
    return { g, body, legs, head, eyes, tail, hearts };
  }
  const CARD = M(0xc89a62), RIB = M(0xd8202e, { unlit: 0.35 });
  function parcelModel() {
    const g = new THREE.Group(), w = 0.74, h = 0.62, th = 0.03;
    g.add(at(box(w, th, w, CARD), 0, th / 2, 0));
    for (const [x, z, ww, dd] of [[0, w / 2 - th / 2, w, th], [0, -w / 2 + th / 2, w, th], [w / 2 - th / 2, 0, th, w], [-w / 2 + th / 2, 0, th, w]]) g.add(at(box(ww, h, dd, CARD), x, h / 2, z));
    for (const z of [w / 2 + 0.004, -w / 2 - 0.004]) g.add(at(box(0.09, h, 0.006, RIB), 0, h / 2, z));
    for (const x of [w / 2 + 0.004, -w / 2 - 0.004]) g.add(at(box(0.006, h, 0.09, RIB), x, h / 2, 0));
    const lid = at(new THREE.Group(), 0, h, 0); g.add(lid);
    lid.add(at(box(w + 0.04, 0.07, w + 0.04, CARD), 0, 0.035, 0)); lid.add(at(box(0.09, 0.075, w + 0.05, RIB), 0, 0.036, 0)); lid.add(at(box(w + 0.05, 0.075, 0.09, RIB), 0, 0.036, 0));
    for (const sx of [-1, 1]) { const loop = at(ico(0.11, 0, RIB), sx * 0.1, 0.14, 0); loop.scale.set(1.1, 0.75, 0.45); loop.rotation.z = sx * 0.5; lid.add(loop); }
    lid.add(at(ico(0.05, 0, RIB), 0, 0.11, 0));
    return { g, lid, h };
  }
  const SCOOP = M(0xf6a0b8, { unlit: 0.3 }), SPRINK = [glow(0xffe14a, 0.6), glow(0x6ad0ff, 0.6), glow(0xffffff, 0.6), glow(0x8affa0, 0.6)];
  function snackModel(kind) {
    const g = new THREE.Group();
    if (kind === 'ball') { g.add(ico(0.065, 1, M(0xd8f04a, { unlit: 0.35 }))); return g; }
    const sc = ico(0.12, 1, SCOOP); sc.scale.set(1, 0.85, 1); g.add(sc);
    for (let i = 0; i < 12; i++) { const a = i * 2.4, e = 0.3 + (i % 3) * 0.25; g.add(at(box(0.028, 0.012, 0.012, SPRINK[i % 4]), Math.cos(a) * 0.11 * Math.cos(e), 0.045 + Math.sin(e) * 0.06, Math.sin(a) * 0.11 * Math.cos(e))); }
    return g;
  }
  // three hearts rising over a point and looping (a vacuum's, the robot dog's)
  function loopHearts(hs, x, y, z, s, s0, P) {
    hs.forEach((h, j) => {
      h.visible = false; if (s0 == null || s < s0) return;
      const u = fr((s - s0) * 0.8 + j / 3); h.visible = true;
      h.position.set(x + 0.14 * Math.sin(u * 5 + j), y + u * 0.6, z); h.scale.setScalar(0.7 + 0.35 * Math.sin(u * PI)); h.rotation.y = (P.heartYaw || 0) * PI / 180;
    });
  }
  // the shared per-shot dressing: up to three vacuums, the robot dog, the parcel, the snacks
  function props(G) {
    const vacs = Array.from({ length: 3 }, () => { const v = vacModel(); v.g.visible = false; G.add(v.g); return v; });
    const robo = roboModel(); robo.g.visible = false; G.add(robo.g);
    const parcel = parcelModel(); parcel.g.visible = false; G.add(parcel.g);
    const snacks = { scoop: [0, 1].map(() => { const q = snackModel('scoop'); q.visible = false; G.add(q); return q; }), ball: [0, 1].map(() => { const q = snackModel('ball'); q.visible = false; G.add(q); return q; }) };
    return (P, t, s) => {
      const bt = beat(t);
      vacs.forEach((v, i) => {
        const V = (P.vac || [])[i];
        v.g.visible = !!V && !V.hide;
        if (!v.g.visible) { v.hearts.forEach(h => { h.visible = false; }); return; }
        const u = V.to ? (V.lin ? cl((s - (V.at || 0)) / (V.dur || 1)) : sm((s - (V.at || 0)) / (V.dur || 1))) : 0;
        const x = V.x + (V.to ? (V.to[0] - V.x) * u : 0), z = V.z + (V.to ? (V.to[1] - V.z) * u : 0);
        const hop = (V.bump || []).reduce((m, b) => { const e = s - b; return e >= 0 && e < 0.3 ? Math.max(m, 0.08 * Math.sin(e / 0.3 * PI)) : m; }, 0);
        const bh = V.booster || 0; v.booster.visible = bh > 0; if (bh > 0) { v.booster.scale.set(1, bh, 1); v.booster.position.y = -bh / 2; }
        v.g.position.set(x, (V.y || 0) + bh + hop, z);
        v.g.rotation.y = ((V.yaw || 0) + (V.spin || 0) * s) * PI / 180;
        const tl = (V.tilt || 0) * PI / 180; v.tiltG.rotation.x = tl; v.tiltG.position.y = VAC.R * Math.abs(Math.sin(tl));
        const moving = (V.to && u > 0 && u < 1) || !!V.spin;
        v.brushes.forEach((b, j) => { b.rotation.y = moving ? (j ? 1 : -1) * t * 22 : j * 0.6; });
        v.ring.scale.setScalar(1 + 0.08 * Math.exp(-fr(bt) * 5));
        const ey = V.eyes || 'dot';
        Object.entries(v.eyes).forEach(([kk, e]) => { e.visible = kk === ey; });
        v.card.visible = from(V.cardigan, s); v.shades.visible = !!V.shades;
        loopHearts(v.hearts, x, (V.y || 0) + bh + 0.35, z, s, V.hearts, P);
      });
      const R = P.robo;
      robo.g.visible = !!R && !R.hide;
      if (robo.g.visible) {
        const pop = R.pop ? -0.55 * (1 - sm((s - R.pop[0]) / (R.pop[1] || 0.4))) : 0, sit = R.pose === 'sit';
        robo.g.position.set(R.x, (R.y || 0) + pop, R.z); robo.g.rotation.y = (R.yaw || 0) * PI / 180; robo.g.scale.setScalar(R.scale || 1);
        robo.body.rotation.x = sit ? -0.42 : 0; robo.body.position.y = sit ? 0.33 : 0.4 + 0.012 * Math.abs(Math.sin(bt * PI));
        robo.legs.forEach(({ hip, front }) => { hip.rotation.x = sit ? (front ? 0.42 : -1.15) : 0; });
        robo.head.rotation.x = sit ? 0.42 : 0; robo.head.rotation.z = 0.12 * Math.sin(bt * PI * 0.5);
        robo.tail.rotation.z = R.wag ? 0.6 * Math.sin(t * 14) : 0;
        robo.eyes.dot.visible = R.eyes !== 'heart'; robo.eyes.heart.visible = R.eyes === 'heart';
        loopHearts(robo.hearts, R.x, (R.y || 0) + pop + 0.95 * (R.scale || 1), R.z, s, R.hearts, P);
      } else robo.hearts.forEach(h => { h.visible = false; });
      const Q = P.parcel;
      parcel.g.visible = !!Q;
      if (Q) {
        parcel.g.position.set(Q.x, 0, Q.z); parcel.g.rotation.y = (Q.yaw || 0) * PI / 180;
        const e = Q.open == null ? -1 : s - Q.open, L = parcel.lid;
        if (e < 0) { L.position.set(0, parcel.h, 0); L.rotation.set(0, 0, 0); }
        else { const u = cl(e / 0.6); L.position.set(0.9 * u, parcel.h + 0.9 * Math.sin(u * PI) - parcel.h * u * 0.97, 0.15 * u); L.rotation.set(0.3 * u, 0, -2.2 * sm(u)); }
      }
      const used = { scoop: 0, ball: 0 };
      Object.values(snacks).flat().forEach(q => { q.visible = false; });
      (P.snack || []).forEach(S => {
        const kind = S.kind || 'scoop', q = snacks[kind][used[kind]++]; if (!q) return;
        const [x0, y0, z0] = S.from, [x1, z1] = S.to || [S.from[0], S.from[2]], u = cl((s - (S.s0 || 0)) / (S.dur || 0.45));
        if (S.gone != null && s > S.gone + 0.25) return;
        q.visible = true;
        const y1 = kind === 'ball' ? 0.065 : 0.03, arc = S.arc ?? 0.12;
        q.position.set(x0 + (x1 - x0) * u, y0 + (y1 - y0) * u * u + arc * 4 * u * (1 - u), z0 + (z1 - z0) * u);
        const landed = u >= 1 && kind !== 'ball', g0 = S.gone != null && s > S.gone ? Math.max(0.01, 1 - (s - S.gone) / 0.25) : 1;
        q.scale.set(g0 * (landed ? 1.35 : 1), g0 * (landed ? 0.45 : 1), g0 * (landed ? 1.35 : 1));
        q.rotation.set(0, kind === 'ball' ? 0 : 0.6, kind === 'ball' ? -(x1 - x0) * u / 0.065 : 0);
      });
    };
  }
  // bark [[x, y, z, yaw, s0]]: three white arcs spreading out of a mouth along yaw, a new set every half second from s0
  function barkSet(G) {
    const m = M(0xffffff, { unlit: 1 }), arcs = Array.from({ length: 9 }, () => { const q = new THREE.Mesh(new THREE.TorusGeometry(0.16, 0.022, 3, 10, 1.6), m); q.visible = false; G.add(q); return q; });
    return (P, s) => arcs.forEach((q, i) => {
      const B = (P.bark || [])[Math.floor(i / 3)]; q.visible = false; if (!B || s < B[4]) return;
      const e = ((s - B[4]) % 0.5) / 0.5, k = i % 3, d = 0.12 + (k * 0.12 + e * 0.35), a = (B[3] || 0) * PI / 180;
      q.visible = true; q.position.set(B[0] + Math.sin(a) * d, B[1], B[2] + Math.cos(a) * d); q.rotation.set(0, a + PI / 2, -0.8); q.scale.setScalar(0.6 + k * 0.35 + e * 0.5);
    });
  }
  function heartSet(G) {
    const heartM = M(0xff4f9a, { unlit: 0.8 }), hearts = [];
    for (let i = 0; i < 12; i++) { const h = heartMesh(heartM); h.visible = false; G.add(h); hearts.push(h); }
    return (P, s) => hearts.forEach((h, i) => {
      const q = (P.hearts || [])[Math.floor(i / 3)]; h.visible = false; if (!q || s < (q[3] || 0)) return;
      const u = fr((s - (q[3] || 0)) * 0.8 + (i % 3) / 3);
      h.visible = true; h.position.set(q[0] + ((i % 3) - 1) * 0.2 + 0.06 * Math.sin(u * 6 + i), q[1] + 0.6 * u, q[2]); h.scale.setScalar(0.7 + 0.4 * Math.sin(u * PI));
      h.rotation.y = (P.heartYaw ?? 0) * PI / 180;
    });
  }

  // ---------- the house's textures ----------
  const floorT = tex(16, 16, (x, r) => { px(x, '#c8785a', 0, 0, 16, 16); noise(x, r, 16, 16, ['#c07052', '#d08262', '#bc6c4e'], 60); px(x, '#a85e44', 0, 0, 16, 1); px(x, '#a85e44', 0, 0, 1, 16); }, 5201);
  const wallT = tex(32, 64, (x, r) => { px(x, '#e8a8ac', 0, 0, 32, 64); noise(x, r, 32, 64, ['#e4a2a6', '#eeb2b4', '#e2a0a6'], 120); px(x, '#fbf4ec', 0, 58, 32, 6); px(x, '#d8c8b8', 0, 58, 32, 1); }, 5202);
  // the back wall: two tall arched windows on the sunset sea between the pink plaster
  const backT = tex(96, 36, (x, r) => {
    px(x, '#e8a8ac', 0, 0, 96, 36); noise(x, r, 96, 36, ['#e4a2a6', '#eeb2b4'], 260); px(x, '#fbf4ec', 0, 33, 96, 3);
    for (const cx of [21, 75]) {
      const w = 13, y0 = 5, y1 = 30;
      x.fillStyle = '#fbf4ec'; x.fillRect(cx - w / 2 - 1.5, y0 + w / 2 - 1, w + 3, y1 - y0 - w / 2 + 2); x.beginPath(); x.arc(cx, y0 + w / 2, w / 2 + 1.5, PI, 0); x.fill();
      x.save(); x.beginPath(); x.rect(cx - w / 2, y0 + w / 2, w, y1 - y0 - w / 2); x.arc(cx, y0 + w / 2, w / 2, PI, 0); x.clip();
      const gr = x.createLinearGradient(0, y0, 0, y1); gr.addColorStop(0, '#6a7ac0'); gr.addColorStop(0.35, '#f08a8a'); gr.addColorStop(0.55, '#ffc07a'); gr.addColorStop(0.58, '#3a7aa8'); gr.addColorStop(1, '#2a5a88'); x.fillStyle = gr; x.fillRect(cx - w, y0, 2 * w, y1 - y0);
      px(x, '#ffe0a0', cx - 2, y0 + 13, 4, 1); px(x, '#ffd890', cx - 1, y0 + 15, 2, 1); px(x, '#5a4a5a', cx - w / 2, y0 + 15, 4, 2);
      x.restore(); px(x, '#fbf4ec', cx - 0.5, y0, 1, y1 - y0); px(x, '#fbf4ec', cx - w / 2, y0 + 15.5, w, 1);
    }
  }, 5203);
  const glassT = tex(32, 32, x => {
    const c = ['#d8282e', '#2a6ad8', '#f2c42a', '#3aa85a', '#d8282e', '#2a6ad8'];
    for (let i = 0; i < 6; i++) { x.fillStyle = c[i]; x.beginPath(); x.moveTo(16, 16); x.arc(16, 16, 16, i / 6 * TAU, (i + 1) / 6 * TAU); x.fill(); }
    x.strokeStyle = '#1a1414'; x.lineWidth = 2;
    for (let i = 0; i < 6; i++) { x.beginPath(); x.moveTo(16, 16); x.lineTo(16 + Math.cos(i / 6 * TAU) * 16, 16 + Math.sin(i / 6 * TAU) * 16); x.stroke(); }
    x.beginPath(); x.arc(16, 16, 15, 0, TAU); x.stroke(); x.fillStyle = '#ffe680'; x.beginPath(); x.arc(16, 16, 4, 0, TAU); x.fill();
  }, 5204);
  const velvetT = tex(16, 16, (x, r) => { px(x, '#e88aa8', 0, 0, 16, 16); noise(x, r, 16, 16, ['#e284a2', '#ee94b0', '#dc7c9c'], 50); }, 5205);
  const rugT = tex(32, 32, x => { x.clearRect(0, 0, 32, 32); x.fillStyle = '#e86a8a'; x.beginPath(); x.arc(16, 16, 16, 0, TAU); x.fill(); x.fillStyle = '#f6e8d2'; x.beginPath(); x.arc(16, 16, 13.5, 0, TAU); x.fill(); x.strokeStyle = '#f2a0b8'; x.lineWidth = 1.5; x.beginPath(); x.arc(16, 16, 8, 0, TAU); x.stroke(); }, 5206);
  const porchT = tex(32, 32, (x, r) => { const gr = x.createLinearGradient(0, 0, 0, 32); gr.addColorStop(0, '#a8d8f0'); gr.addColorStop(0.55, '#fff2d0'); gr.addColorStop(0.56, '#5a9a4a'); gr.addColorStop(0.75, '#4a8a3a'); gr.addColorStop(0.76, '#d8b88a'); gr.addColorStop(1, '#d0ae80'); x.fillStyle = gr; x.fillRect(0, 0, 32, 32); for (let i = 0; i < 40; i++) px(x, ['#6aaa5a', '#d8406a', '#e85a8a'][i % 3], Math.floor(r() * 32), 18 + Math.floor(r() * 6)); }, 5207);
  const woodT = tex(16, 16, x => { px(x, '#6a3e22', 0, 0, 16, 16); for (let y = 2; y < 16; y += 4) px(x, '#5a3218', 0, y, 16, 1); }, 5208);
  // the TV screens: one canvas per picture (48 x 36), drawn once
  const scr = (seed, f) => tex(48, 36, f, seed);
  const heartPath = (x, cx, cy, r) => { x.beginPath(); x.arc(cx - r * 0.5, cy, r * 0.55, 0, TAU); x.arc(cx + r * 0.5, cy, r * 0.55, 0, TAU); x.fill(); x.beginPath(); x.moveTo(cx - r * 1.02, cy + r * 0.2); x.lineTo(cx, cy + r * 1.25); x.lineTo(cx + r * 1.02, cy + r * 0.2); x.fill(); };
  const SCREENS = {
    show: scr(5211, x => {
      const gr = x.createLinearGradient(0, 0, 0, 36); gr.addColorStop(0, '#7ac8f0'); gr.addColorStop(0.55, '#bfe8ff'); gr.addColorStop(0.56, '#2a9ad0'); gr.addColorStop(0.72, '#5ab8e0'); gr.addColorStop(0.73, '#f2dca8'); gr.addColorStop(1, '#e8c890'); x.fillStyle = gr; x.fillRect(0, 0, 48, 36);
      x.fillStyle = '#fff6c0'; x.beginPath(); x.arc(36, 8, 4, 0, TAU); x.fill(); px(x, '#3a8a4a', 4, 18, 2, 10); px(x, '#3a8a4a', 1, 16, 8, 3);
    }),
    vac: scr(5212, x => {
      px(x, '#ffc8dc', 0, 0, 48, 36); x.fillStyle = '#2c3038'; x.beginPath(); x.ellipse(24, 23, 16, 8, 0, 0, TAU); x.fill();
      x.strokeStyle = '#5af0ff'; x.lineWidth = 1.5; x.beginPath(); x.ellipse(24, 21, 10, 4.5, 0, 0, TAU); x.stroke(); px(x, '#e8fbff', 18, 25, 3, 3); px(x, '#e8fbff', 27, 25, 3, 3);
      x.fillStyle = '#ff4f9a'; heartPath(x, 24, 8, 4.5);
    }),
    robo: scr(5213, x => {
      px(x, '#a8f0ff', 0, 0, 48, 36); px(x, '#f4f4f6', 15, 10, 18, 16); px(x, '#0c0e12', 17, 14, 14, 6); px(x, '#6af6ff', 19, 16, 3, 3); px(x, '#6af6ff', 26, 16, 3, 3);
      x.fillStyle = '#f4f4f6'; x.beginPath(); x.moveTo(15, 10); x.lineTo(18, 3); x.lineTo(21, 10); x.fill(); x.beginPath(); x.moveTo(27, 10); x.lineTo(30, 3); x.lineTo(33, 10); x.fill();
      x.fillStyle = '#ff4f9a'; heartPath(x, 7, 26, 3); heartPath(x, 41, 26, 3);
    }),
    heart: scr(5214, x => { px(x, '#ffd6e6', 0, 0, 48, 36); x.fillStyle = '#ff4f9a'; heartPath(x, 24, 15, 9); }),
    memory: scr(5219, x => {   // the dog and Sadi, a heart over them: a still of the old days
      px(x, '#f6e2c0', 0, 0, 48, 36); x.fillStyle = '#9a9aa4'; x.beginPath(); x.arc(16, 22, 9, 0, TAU); x.fill(); x.fillStyle = '#8a5a2a'; x.beginPath(); x.arc(32, 22, 8.5, 0, TAU); x.fill();
      px(x, '#2a2a2a', 12, 20, 2, 2); px(x, '#2a2a2a', 18, 20, 2, 2); px(x, '#111', 15, 24, 3, 2); px(x, '#2a2a2a', 29, 20, 2, 2); px(x, '#2a2a2a', 35, 20, 2, 2); px(x, '#111', 31, 24, 3, 2); px(x, '#ff7ab0', 35, 12, 4, 2);
      x.fillStyle = '#ff4f9a'; heartPath(x, 24, 6, 3.5);
    }),
    off: scr(5215, x => { px(x, '#1a2024', 0, 0, 48, 36); px(x, '#2a3238', 6, 4, 10, 2); }),
    static: [5216, 5217, 5218].map(sd => scr(sd, (x, r) => { for (let yy = 0; yy < 36; yy++) for (let xx = 0; xx < 48; xx += 2) { const v = Math.floor(40 + r() * 200); px(x, `rgb(${v},${v},${v})`, xx, yy, 2, 1); } })),
  };
  // [x, y0, w, h, casing]: three rows on the cabinet, mixed old sets
  const TVS = [
    [-2.15, 0.45, 0.95, 0.74, 0], [-1.02, 0.45, 1.12, 0.86, 1], [0.27, 0.45, 1.26, 0.94, 2], [1.55, 0.45, 0.98, 0.76, 0], [2.5, 0.45, 0.78, 0.64, 1],
    [-2.0, 1.21, 0.86, 0.64, 2], [-0.82, 1.33, 1.02, 0.76, 0], [0.44, 1.41, 1.08, 0.8, 1], [1.62, 1.23, 0.92, 0.68, 2],
    [-1.36, 1.87, 0.82, 0.6, 1], [-0.02, 2.23, 0.92, 0.62, 2], [1.22, 1.93, 0.78, 0.56, 0],
  ];
  const CASE = [M(0x8a5a32, { unlit: 0.3 }), M(0xe0d4bc, { unlit: 0.3 }), M(0x55555e, { unlit: 0.3 })];   // a little self-lit: their fronts face away from the windows' light and read black

  function house() {
    const G = new THREE.Group(), S = BH, W = 2 * S.X, D = S.Z1 - S.Z0, ZC = (S.Z0 + S.Z1) / 2, hearts = heartSet(G), barks = barkSet(G), dress = props(G);
    G.add(flat(W, D, mat({ map: floorT, rep: [W, D] }), 0, 0, ZC));
    G.add(at(new THREE.Mesh(new THREE.PlaneGeometry(W, S.H), mat({ map: backT, unlit: 0.12 })), 0, S.H / 2, S.Z0));
    const sideM = mat({ map: wallT, rep: [D / 2.4, 1], unlit: 0.05 });
    G.add(rot(at(new THREE.Mesh(new THREE.PlaneGeometry(D, S.H), sideM), -S.X, S.H / 2, ZC), 0, PI / 2, 0));
    // the right wall round the front door, the porch's sunlight beyond it
    const [, dz] = S.DOOR, d0 = dz - S.DOOR_W / 2, d1 = dz + S.DOOR_W / 2, rwM = mat({ map: wallT, rep: [1, 1], unlit: 0.05 });
    G.add(rot(at(new THREE.Mesh(new THREE.PlaneGeometry(d0 - S.Z0, S.H), rwM), S.X, S.H / 2, (S.Z0 + d0) / 2), 0, -PI / 2, 0));
    G.add(rot(at(new THREE.Mesh(new THREE.PlaneGeometry(S.Z1 - d1, S.H), rwM), S.X, S.H / 2, (d1 + S.Z1) / 2), 0, -PI / 2, 0));
    G.add(rot(at(new THREE.Mesh(new THREE.PlaneGeometry(S.DOOR_W, S.H - S.DOOR_H), rwM), S.X, S.DOOR_H + (S.H - S.DOOR_H) / 2, dz), 0, -PI / 2, 0));
    G.add(rot(at(new THREE.Mesh(new THREE.PlaneGeometry(6, 4), mat({ map: porchT, unlit: 0.85 })), S.X + 2.4, 1.6, dz), 0, -PI / 2, 0));
    G.add(flat(2.6, 4.4, M(0xd8b88a, { unlit: 0.3 }), S.X + 1.2, -0.005, dz));   // the porch's floor (the doorway showed a black void under it)
    for (const zz of [d0 - 0.06, d1 + 0.06]) G.add(at(box(0.18, S.DOOR_H + 0.08, 0.12, M(0xfbf4ec)), S.X - 0.04, (S.DOOR_H + 0.08) / 2, zz));
    G.add(at(box(0.18, 0.12, S.DOOR_W + 0.36, M(0xfbf4ec)), S.X - 0.04, S.DOOR_H + 0.06, dz));
    const hinge = at(new THREE.Group(), S.X - 0.03, 0, d0); G.add(hinge);
    hinge.add(at(box(0.07, S.DOOR_H, S.DOOR_W, mat({ map: woodT, rep: [1, 2] })), 0, S.DOOR_H / 2, S.DOOR_W / 2));
    hinge.add(at(ico(0.04, 0, M(0x2a2a2a)), -0.06, 1.05, S.DOOR_W - 0.12));
    // the front wall behind the TVs, the ceiling and its dark beams
    G.add(rot(at(new THREE.Mesh(new THREE.PlaneGeometry(W, S.H), mat({ map: wallT, rep: [W / 2.4, 1], unlit: 0.05 })), 0, S.H / 2, S.Z1), 0, PI, 0));
    const ceil = new THREE.Mesh(new THREE.PlaneGeometry(W, D), M(0xf6efe4)); ceil.rotation.x = PI / 2; G.add(at(ceil, 0, S.H, ZC));
    for (let z = S.Z0 + 0.8; z < S.Z1; z += 1.6) G.add(at(box(W, 0.18, 0.16, M(0x5a3420)), 0, S.H - 0.09, z));
    // the round stained-glass window over the sofa
    const glass = at(new THREE.Mesh(new THREE.CircleGeometry(0.62, 18), mat({ map: glassT, unlit: 0.8 })), 0, 3.25, S.Z0 + 0.02); G.add(glass);
    const glassRim = at(new THREE.Mesh(new THREE.TorusGeometry(0.64, 0.05, 4, 18), M(0xfbf4ec)), 0, 3.25, S.Z0 + 0.03); G.add(glassRim);
    // the sofa: pink velvet, long and low, against the back wall
    const sofa = new THREE.Group(); G.add(sofa);
    {
      const F = S.SOFA, V = mat({ map: velvetT, rep: [2, 1] });
      sofa.add(at(box(F.w, F.SEAT_Y - 0.1, F.d, V), F.x, (F.SEAT_Y - 0.1) / 2 + 0.03, F.z));
      for (let i = 0; i < 3; i++) sofa.add(at(box(F.w / 3 - 0.04, 0.1, F.d - 0.06, V), F.x - F.w / 3 + i * F.w / 3, F.SEAT_Y - 0.05, F.z + 0.02));
      sofa.add(at(box(F.w + 0.3, F.BACK_Y, 0.26, V), F.x, F.BACK_Y / 2, F.z - F.d / 2 - 0.12));
      for (const sx of [-1, 1]) sofa.add(at(box(0.26, 0.46, F.d + 0.24, V), F.x + sx * (F.w / 2 + 0.13), 0.23, F.z - 0.06));
      for (const sx of [-0.9, 0.95]) { const c = at(box(0.42, 0.36, 0.12, M(0xf6d6a8)), F.x + sx, F.SEAT_Y + 0.2, F.z - F.d / 2 + 0.08); c.rotation.x = -0.2; sofa.add(c); }
    }
    const rug = flat(2 * S.RUG[2], 2 * S.RUG[2], mat({ map: rugT }), S.RUG[0], 0.012, S.RUG[1]); G.add(rug);
    // the wall of old TVs on a low wooden cabinet, facing the sofa
    const tvG = new THREE.Group(); G.add(tvG);
    tvG.add(at(box(5.9, S.CAB_Y, 0.75, mat({ map: woodT, rep: [4, 1] })), 0.15, S.CAB_Y / 2, S.TV_Z + 0.35));
    const screens = TVS.map(([x, y0, w, h, c], i) => {
      tvG.add(at(box(w, h, 0.62, CASE[c]), x, y0 + h / 2, S.TV_Z + 0.31));
      // the screen on the viewer's left of the set (+x: the sets face -z), the knobs on its right (-x); the screen 3 cm proud of the
      // casing and its dark bezel 1.5 cm proud (a bezel 4 mm in front of the screen hid every picture)
      const sw = w * 0.74, sh = h * 0.72, sx0 = x + w * 0.09;
      const q = at(new THREE.Mesh(new THREE.PlaneGeometry(sw, sh), mat({ map: SCREENS.show, unlit: 1 })), sx0, y0 + h / 2, S.TV_Z - 0.03); q.rotation.y = PI; tvG.add(q);
      tvG.add(at(box(sw + 0.06, sh + 0.06, 0.02, M(0x101012)), sx0, y0 + h / 2, S.TV_Z - 0.01));
      for (const ky of [0.18, -0.08]) tvG.add(at(rot(cyl(0.035, 0.035, 0.03, 8, M(0x1a1a1a)), PI / 2, 0, 0), x - w * 0.38, y0 + h / 2 + ky * h, S.TV_Z - 0.015));
      if (y0 > 1.8) for (const a of [-0.5, 0.5]) { const an = at(cyl(0.008, 0.008, 0.6, 3, CHROME), x + a * 0.25, y0 + h + 0.26, S.TV_Z + 0.3); an.rotation.z = a; tvG.add(an); }
      return { q, i };
    });
    // the floor lamp beside the sofa, the potted bougainvillea in the corners
    const lampG = new THREE.Group(); G.add(lampG);
    lampG.add(at(cyl(0.18, 0.2, 0.04, 8, M(0x2a2a2a)), -4.6, 0.02, -3.9)); lampG.add(at(cyl(0.02, 0.02, 1.7, 4, M(0x2a2a2a)), -4.6, 0.87, -3.9));
    lampG.add(at(cyl(0.2, 0.3, 0.34, 8, glow(0xffe0b0, 0.9)), -4.6, 1.85, -3.9));
    const plantsG = new THREE.Group(); G.add(plantsG);
    const FLOW = [M(0xd8206a, { unlit: 0.3 }), M(0xe83a8a, { unlit: 0.3 }), M(0xc81858, { unlit: 0.3 })], LEAF = M(0x3a7a3a);
    for (const [x, z] of [[-5.25, -3.85], [5.25, -3.85], [-5.25, 4.6], [5.2, 4.7]]) {
      plantsG.add(at(cyl(0.32, 0.24, 0.5, 8, M(0xc0643a)), x, 0.25, z));
      for (let i = 0; i < 16; i++) { const a = i * 2.4, rr = 0.15 + 0.32 * hash(i, x, 5221), y = 0.6 + 1.2 * hash(i, z, 5222); plantsG.add(at(ico(0.13 + 0.06 * hash(i, 5223), 0, i % 3 ? FLOW[i % 3] : LEAF), x + Math.cos(a) * rr, y, z + Math.sin(a) * rr)); }
    }
    function light(P, s, bt) {
      const zn = P.zone || 'dusk', tvk = 0.85 + 0.15 * Math.exp(-fr(bt) * 4);
      if (zn === 'day') { lights(0xb8a090, 0xfff0d0, [0.2, -0.55, 0.8], 0xe8d0c0, [22, 50], 9); pt(0, 0, 3.6, -0.8, 0.95, 0.85, 0.7); pt(1, 0, 1.5, 4.6, 0.45, 0.5, 0.5); }
      else if (zn === 'night') { lights(0x3a3448, 0x8a7aa8, [0.2, -0.6, 0.75], 0x1a1622, [16, 40], 9); pt(0, 0, 3.6, -0.8, 0.35, 0.3, 0.4); pt(1, 0, 1.5, 4.6, 0.55 * tvk, 0.85 * tvk, 1.1 * tvk); }
      else { lights(0x8a6a7a, 0xffb47a, [0.15, -0.45, 0.88], 0x3a2a34, [18, 44], 9); pt(0, 0, 3.6, -0.8, 0.8, 0.6, 0.5); pt(1, 0, 1.5, 4.6, 0.42 * tvk, 0.62 * tvk, 0.82 * tvk); }
      pt(2, -2.0, 1.7, -2.6, 0.85, 0.6, 0.32);
      const dOpen = ramp(P.door, s); pt(3, S.X - 0.4, 1.6, dz, 1.0 * dOpen, 0.9 * dOpen, 0.7 * dOpen);
      if (P.key) pt(3, P.key[0], P.key[1], P.key[2], P.key[3], P.key[4], P.key[5]);
    }
    return {
      group: G, sky: null, shadowCol: 0x9a5a48, indoor: true, shadowY: 0.022,
      light() { light({}, 0, 0); },
      anim(t, P = {}) {
        const s = shotT(t, P), bt = beat(t), hide = new Set(P.hide || []);
        light(P, s, bt);
        sofa.visible = !hide.has('sofa'); rug.visible = !hide.has('rug'); tvG.visible = !hide.has('tvs'); lampG.visible = !hide.has('lamp'); plantsG.visible = !hide.has('plants');
        glass.visible = !hide.has('glass'); glassRim.visible = !hide.has('glass');
        hinge.rotation.y = 1.45 * ramp(P.door, s);
        const mode = P.tvs2 && s >= P.tvs2[0] ? P.tvs2[1] : (P.tvs || 'show');   // tvs2 [s, mode]: every screen switches there
        screens.forEach(({ q, i }) => {
          const m = Array.isArray(mode) ? mode[i % mode.length] : mode;
          const T = m === 'static' ? SCREENS.static[pmod(Math.floor(t * 15) + i, 3)] : (SCREENS[m] || SCREENS.show);
          if (q.material.uniforms && q.material.uniforms.map) q.material.uniforms.map.value = T; else q.material.map = T;
        });
        dress(P, t, s);
        hearts(P, s); barks(P, s);
      },
    };
  }

  // ---------- the coast road ----------
  const roadT = tex(16, 16, (x, r) => { px(x, '#4a4a52', 0, 0, 16, 16); noise(x, r, 16, 16, ['#44444c', '#52525a', '#4e4c54'], 40); }, 5231);
  const dashT = tex(16, 4, x => { px(x, '#4a4a52', 0, 0, 16, 4); px(x, '#f0c43a', 0, 0, 16, 1); px(x, '#f0c43a', 0, 3, 16, 1); }, 5232);
  const iceT = tex(16, 16, (x, r) => { px(x, '#6a8a4a', 0, 0, 16, 16); noise(x, r, 16, 16, ['#5e7e42', '#76964e', '#e86aa8', '#f08ab8'], 70); }, 5233);
  const cliffT = tex(16, 16, (x, r) => { px(x, '#b08a6a', 0, 0, 16, 16); noise(x, r, 16, 16, ['#a07a5a', '#bc967a', '#9a7454', '#c8a284'], 90); }, 5234);
  const hillT = tex(16, 16, (x, r) => { px(x, '#a89a5a', 0, 0, 16, 16); noise(x, r, 16, 16, ['#9a8c50', '#b4a868', '#7a8a4a', '#6a7a40'], 90); }, 5235);
  const seaT = tex(32, 32, (x, r) => { px(x, '#2a7ab0', 0, 0, 32, 32); noise(x, r, 32, 32, ['#3a8ac0', '#2470a8', '#4a9ac8'], 120); for (let i = 0; i < 14; i++) px(x, '#a8d8f0', Math.floor(r() * 28), Math.floor(r() * 32), 4, 1); }, 5236);
  const creamT = tex(16, 16, (x, r) => { px(x, '#f2e8d2', 0, 0, 16, 16); noise(x, r, 16, 16, ['#eee2ca', '#f6eedc'], 20); px(x, '#fffaf0', 0, 0, 16, 1); }, 5237);
  const hubT = tex(16, 16, x => { px(x, '#1a1a1e', 0, 0, 16, 16); x.fillStyle = '#d8dce4'; x.beginPath(); x.arc(8, 8, 5.5, 0, TAU); x.fill(); x.fillStyle = '#f6f6f2'; x.beginPath(); x.arc(8, 8, 3, 0, TAU); x.fill(); }, 5238);
  // the clip's cream 1960s two-seater, top down: nose to +x, the driver's side on -z (DCAR); a tan interior, the folded hood
  function convertible() {
    const g = new THREE.Group(), body = new THREE.Group(); g.add(body);
    const CRM = mat({ map: creamT }), SEAT = M(0xc87a4a), DASH = M(0xe8dcc4), TYRE = M(0x1a1a1e), RED = glow(0xd8202a, 0.6);
    const { L, W } = DCAR, x0 = -L / 2, x1 = L / 2, C0 = -0.82, C1 = 0.36, BON = 1.9;
    body.add(at(box(BON - C1 + 0.05, 0.44, W - 0.3, CRM), (BON + C1) / 2, 0.42, 0));
    { const top = at(rot(cyl(0.2, 0.2, BON - C1, 10, CRM), 0, 0, PI / 2), (BON + C1) / 2, 0.6, 0); top.scale.set(1, 1, 3.6); body.add(top); }
    for (const sd of [-1, 1]) body.add(at(box(L * 0.42, 0.42, 0.28, CRM), 1.05, 0.42, sd * (W / 2 - 0.14)));
    body.add(at(box(x1 - BON + 0.02, 0.36, W - 0.5, CRM), (x1 + BON) / 2, 0.38, 0));
    for (const sd of [-1, 1]) {
      body.add(at(rot(cyl(0.15, 0.15, 0.06, 12, glow(0xfff2c8, 0.95)), 0, 0, PI / 2), x1 - 0.02, 0.56, sd * 0.62));
      body.add(at(rot(new THREE.Mesh(new THREE.TorusGeometry(0.15, 0.025, 4, 12), CHROME), 0, PI / 2, 0), x1, 0.56, sd * 0.62));
    }
    body.add(at(box(0.04, 0.16, 0.6, CHROME), x1 + 0.01, 0.42, 0)); body.add(at(box(0.08, 0.1, W - 0.1, CHROME), x1 + 0.06, 0.24, 0));
    body.add(at(box(C1 - C0, 0.62, 0.06, CRM), (C0 + C1) / 2, 0.47, W / 2 - 0.03)); body.add(at(box(C1 - C0, 0.62, 0.06, CRM), (C0 + C1) / 2, 0.47, -W / 2 + 0.03));
    body.add(at(box(C1 - C0, 0.06, W - 0.1, M(0x5a3a2a)), (C0 + C1) / 2, 0.26, 0));
    for (const sd of [-1, 1]) body.add(at(box(C1 - C0, 0.035, 0.07, CHROME), (C0 + C1) / 2, 0.79, sd * (W / 2 - 0.03)));
    for (const sz of [DCAR.DRIVER[1], DCAR.PASS[1]]) { body.add(at(box(0.6, 0.12, 0.72, SEAT), DCAR.DRIVER[0] + 0.02, DCAR.SEAT_Y - 0.06, sz)); body.add(at(box(0.12, 0.5, 0.72, SEAT), C0 + 0.1, DCAR.SEAT_Y + 0.2, sz)); }
    body.add(at(box(0.12, 0.12, W - 0.16, DASH), C1 - 0.04, 0.8, 0));
    const wheel = at(new THREE.Mesh(new THREE.TorusGeometry(0.17, 0.022, 4, 12), M(0xf2ead8)), DCAR.WHEEL[0], DCAR.WHEEL[1], DCAR.WHEEL[2]); wheel.rotation.order = 'ZYX'; wheel.rotation.set(0, -PI / 2, -0.55); body.add(wheel);
    body.add(at(rot(cyl(0.02, 0.02, 0.36, 5, M(0x2a1a14)), 0, 0, 1.0), DCAR.WHEEL[0] + 0.16, DCAR.WHEEL[1] - 0.06, DCAR.WHEEL[2]));
    for (const sd of [-1, 1]) body.add(at(box(0.035, 0.11, 0.035, CHROME), C1 + 0.02, 0.845, sd * (W / 2 - 0.12)));
    body.add(at(box(0.035, 0.025, W - 0.22, CHROME), C1 + 0.02, 0.9, 0));
    body.add(at(box(C0 - x0, 0.46, W - 0.06, CRM), (C0 + x0) / 2, 0.44, 0));
    { const top = at(rot(cyl(0.16, 0.16, C0 - x0, 10, CRM), 0, 0, PI / 2), (C0 + x0) / 2, 0.64, 0); top.scale.set(1, 1, 5.8); body.add(top); }
    body.add(at(box(0.3, 0.14, W - 0.3, M(0x2a2a2e)), C0 - 0.12, 0.84, 0));
    for (const sd of [-1, 1]) body.add(at(box(0.04, 0.12, 0.18, RED), x0 - 0.01, 0.55, sd * 0.68));
    body.add(at(box(0.08, 0.1, W - 0.1, CHROME), x0 - 0.05, 0.24, 0));
    const spin = [];
    for (const [wx, wz] of [[-1.25, 0.86], [1.28, 0.86], [-1.25, -0.86], [1.28, -0.86]]) {
      const w = at(new THREE.Group(), wx, 0.32, wz); g.add(w); spin.push(w);
      w.add(rot(cyl(0.32, 0.32, 0.22, 12, TYRE), PI / 2, 0, 0));
      for (const sd of [-1, 1]) { const d = at(new THREE.Mesh(new THREE.CircleGeometry(0.22, 12), mat({ map: hubT, unlit: 0.2 })), 0, 0, sd * 0.115); if (sd < 0) d.rotation.y = PI; w.add(d); }
    }
    g.add(flat(L + 0.2, W + 0.1, mat({ color: 0x3a2a24, see: 0.45 }), 0, 0.02, 0));
    return { g, body, spin };
  }
  function fanPalm(h) {
    const g = new THREE.Group(); g.add(at(cyl(0.13, 0.2, h, 6, M(0x8a7258)), 0, h / 2, 0));
    for (let i = 0; i < 9; i++) { const f = at(new THREE.Group(), 0, h, 0); f.rotation.set(0, i / 9 * TAU, 0); const lf = at(box(0.36, 0.04, 1.3, M(0x4a7a3a)), 0, -0.15, 0.6); lf.rotation.x = 0.35; f.add(lf); g.add(f); }
    g.add(at(ico(0.3, 0, M(0x8a6a48)), 0, h - 0.2, 0));
    return g;
  }
  function road() {
    const G = new THREE.Group(), hearts = heartSet(G), dress = props(G), C = CR;
    const skyT = tex(4, 64, x => { const gr = x.createLinearGradient(0, 0, 0, 64); gr.addColorStop(0, '#3a5aa0'); gr.addColorStop(0.28, '#9a8ac0'); gr.addColorStop(0.42, '#f29a8a'); gr.addColorStop(0.48, '#ffc88a'); gr.addColorStop(0.5, '#ffe0a8'); gr.addColorStop(1, '#ffe0a8'); x.fillStyle = gr; x.fillRect(0, 0, 4, 64); });
    G.add(new THREE.Mesh(new THREE.SphereGeometry(188, 16, 12), mat({ map: skyT, unlit: 1, nofog: 1, side: THREE.BackSide })));
    { const sun = new THREE.Mesh(new THREE.CircleGeometry(10, 22), mat({ color: 0xffd27a, unlit: 1, nofog: 1 })); sun.position.set(-40, 9, 172); sun.lookAt(0, 3, 0); G.add(sun); }
    const seaM = mat({ map: seaT, rep: [60, 60], unlit: 0.35, nofog: 1 }); G.add(flat(500, 500, seaM, 0, -14, 250));
    { const glint = flat(14, 170, mat({ color: 0xffe6a8, unlit: 1, see: 0.55, nofog: 1 }), -20, -13.9, 95); glint.rotation.z = 0.12; G.add(glint); }
    // the land: the hillside on -z, the road, the shoulder of ice plant, the cliff down to the sea on +z
    const hillM = mat({ map: hillT, rep: [80, 6] });
    { const h = flat(400, 26, hillM, 0, 0, 0); h.rotation.x = -PI / 2 + 0.55; h.position.set(0, 5.5, C.ROAD[0] - 11.6); G.add(h); }
    const edgeM = mat({ map: iceT, rep: [100, 1] }); G.add(flat(400, 0.6, edgeM, 0, 0.005, C.ROAD[0] - 0.3));
    const roadM = mat({ map: roadT, rep: [80, 2] }); G.add(flat(400, C.ROAD[1] - C.ROAD[0], roadM, 0, 0, (C.ROAD[0] + C.ROAD[1]) / 2));
    const dashM = mat({ map: dashT, rep: [100, 1] }); G.add(flat(400, 0.2, dashM, 0, 0.004, C.MID));
    G.add(flat(400, 0.1, M(0xe8e4d8), 0, 0.004, C.ROAD[1] - 0.15));
    const iceM = mat({ map: iceT, rep: [100, 1] }); G.add(flat(400, C.RAIL_Z + 0.5 - C.ROAD[1], iceM, 0, 0.003, (C.ROAD[1] + C.RAIL_Z + 0.5) / 2));
    const cliffM = mat({ map: cliffT, rep: [80, 4] });
    { const c = flat(400, 16, cliffM, 0, 0, 0); c.rotation.x = -PI / 2 - 1.05; c.position.set(0, -7, C.RAIL_Z + 0.5 + 3.9); G.add(c); }
    G.add(at(box(400, 0.12, 0.1, M(0xf6f2ea, { unlit: 0.2 })), 0, 0.62, C.RAIL_Z));
    G.add(at(box(400, 0.1, 0.08, M(0xf6f2ea, { unlit: 0.2 })), 0, 0.36, C.RAIL_Z));
    const near = [], far = [];
    for (let i = 0; i < 40; i++) { const p = at(box(0.14, 0.72, 0.14, M(0xf6f2ea, { unlit: 0.2 })), -60 + i * 3, 0.36, C.RAIL_Z); G.add(p); near.push([p, -60 + i * 3, 120]); }
    for (let i = 0; i < 12; i++) { const z = C.ROAD[0] - 1.6 - hash(i, 5241) * 3, x = -60 + i * 10; const o = at(fanPalm(5.5 + hash(i, 5242) * 3), x, 0.2 + hash(i, 5243) * 0.6, z); G.add(o); near.push([o, x, 120, 'palms']); }
    for (let i = 0; i < 10; i++) { const z = C.ROAD[0] - 4 - hash(i, 5244) * 6, x = -60 + i * 12; const r = at(ico(1, 0, mat({ map: cliffT })), x, 1.5 + hash(i, 5245) * 2, z); r.scale.set(1.6 + hash(i, 5246), 1 + hash(i, 5247), 1.4); G.add(r); near.push([r, x, 120, 'rocks']); }
    {
      const hs = new THREE.Group(); hs.add(at(box(9, 5, 7, M(0xf6f0e4, { unlit: 0.3 })), 0, 2.5, 0)); hs.add(at(box(9.6, 0.6, 7.6, M(0xc8643a)), 0, 5.3, 0));
      for (const x of [-2.6, 0, 2.6]) hs.add(at(box(1.2, 1.6, 0.05, glow(0xffd890, 0.7)), x, 2.6, 3.53));
      for (let i = 0; i < 8; i++) hs.add(at(ico(0.9, 0, M(0xd8206a, { unlit: 0.3 })), -4 + i * 1.1, 0.6 + (i % 2) * 0.5, 3.6));
      hs.position.set(70, 9, -26); hs.rotation.y = -0.4; G.add(hs); far.push([hs, 70, 260]);
    }
    G.add(at(cone(30, 22, 5, mat({ color: 0x8a7a6a, unlit: 0.45, nofog: 1 })), 150, -4, 70));
    const car = convertible(); G.add(car.g);
    const scroll = (m, n, d) => { if (m.uniforms && m.uniforms.uOff) m.uniforms.uOff.value.set((d / 400) * n % 1, 0); };
    return {
      group: G, sky: skyT, shadowCol: 0x2a2228, shadowY: 0.02,
      light() { lights(0xa08aa0, 0xffc890, [0.1, -0.35, -0.93], 0xe8a88a, [60, 190], 8); pt(0, 3.4, 2.2, 0.8, 0.9, 0.75, 0.6); pt(1, 1.0, 1.8, 2.8, 0.5, 0.42, 0.4); },
      anim(t, P = {}) {
        const s = shotT(t, P), speed = P.still ? 0 : (P.speed ?? C.SPEED), d = speed * t;
        if (P.key) pt(3, P.key[0], P.key[1], P.key[2], P.key[3], P.key[4], P.key[5]);
        scroll(roadM, 80, d); scroll(hillM, 80, d); scroll(iceM, 100, d); scroll(edgeM, 100, d); scroll(cliffM, 80, d); scroll(dashM, 100, d);
        const hideR = new Set(P.hide || []);
        near.forEach(([p, x0, L, kind]) => { p.position.x = pmod(x0 - d + L / 2, L) - L / 2; p.visible = !hideR.has(kind); });
        far.forEach(([p, x0, L]) => { p.position.x = pmod(x0 - d * 0.15 + L / 2, L) - L / 2; });
        car.spin.forEach(w => { w.rotation.z = -d / 0.32; });
        car.body.position.y = speed ? 0.01 * Math.sin(t * 41) + 0.005 * Math.sin(t * 23) : 0;
        dress(P, t, s);
        hearts(P, s);
      },
    };
  }

  return { beachhouse: house(), coastroad: road() };
}
