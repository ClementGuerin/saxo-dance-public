// maps29.js: the "No Scrubs" maps (2026-10-05, TLC, 1999; the clip: the trio in shiny black vinyl and silver dancing in a
// white spaceship set, a giant chrome three-letter sign on its back wall, a round chamber whose walls are lit through
// rows of holes, a glass pod with light bars). Same contract as the other map files, pure in t:
//   chrome  the girl group's spaceship set: a glossy white floor, white ribbed walls with cyan light strips, a giant
//           chrome NO on a plinth at the back (CHROME_SET.LETTERS_Z) in front of a round recess lit through rows of
//           holes, the glass pod stage right (POD: a back half of glass, light bars, chrome rings; whoever stands in it
//           has no glass between her and the lens), a ring light on the ceiling. The trio's marks: TRIO (a V).
//   curb    the street where the girls' saucer has landed, at night: the near sidewalk at y = 0 (z from -1.6 to the
//           kerb at CURB.KERB_Z), the road 0.14 m lower (ROAD_Y) with its lane dashes, the far sidewalk, shop fronts
//           with neon, palms and cobra-head lamps across the street; behind the near sidewalk the chrome saucer on its
//           legs (SHIP), its ramp coming down from a glowing doorway in its belly to the sidewalk (RAMP: its foot),
//           the light spilling down it. The best friend's ride parks at the kerb (the flag `car`).
//   cruise  the boulevard at night scrolling past the still car (nose to -z at the origin, the world moving +z at
//           `speed` m/s): lane dashes, cobra-head lamps sweeping their orange glow over the car, palms, shop fronts
//           with neon, oncoming cars, a starry sky over a pink city haze.
// The ride (`rideModel`, both street maps): a 60s lowrider convertible in candy turquoise with a grey primer passenger
// door (the beat-up one), whitewalls, chrome, a white tuck-and-roll bench front and back, pink fuzzy dice; its frame:
// the nose at -z, the passenger side +x, the wheels on y = 0, seat tops at RIDE.SEAT_Y, the door tops at RIDE.DOOR_Y;
// RIDE.SEATS gives the four marks. Its driver is the "Dai Dai" keeper's bulldog (the best friend: a red cap backwards
// like Saxo's, shades, a gold chain, the keeper's magenta jersey), posed by the flag `driver`.
// Flags (curb): car { x, z, yaw (deg, 0 = nose to -z; 90 = nose to -x, the passenger side to the ship), to: [x, z]
// + at + dur (a drive, eased; lin: linear, to match the riders' mx/mz), hide }, hop ([m, beats]: the hydraulics, the body bouncing a parabola every that many
// beats, the same curve as an actor's `hop`), driver { pose: 'drive' | 'swoon' | 'wave' | 'honk' | 'lean', hearts: s,
// hide }, shipLift ([s0, dur, H]: the saucer rises H m on an actor's `my` curve; its ramp folded up), rampUp, doorGlow (0-1), stare ([x, z]: the passers-by on the
// far sidewalk turn to look), noPeds, clear ([[x, z, r]]: no shop front, lamp or palm there), key [x, y, z, r, g, b].
// cruise: speed (m/s, default 11), hop, driver, hearts ([[x, y, z, s0]]), noTraffic, key.
// chrome: pulse (false: the recess's holes stop pulsing on the beat), podGlow (0: the pod's light bars off), podChase
// (the bars chase round on the beat), flash ([s]: the set's lights flare white), noLetters, noPod, key.
import { mapKit } from './mapkit.js';

export const CHROME_SET = {
  TRIO: [[-1.3, -0.95], [0, -1.3], [1.3, -0.95]],   // Sadi, Kob, Compote in a V (Kob at the point, upstage)
  POD: [3.6, -3.3],                                 // the glass pod's centre: a mark inside it faces +z
  LETTERS_Z: -5.6, WALL_Z: -6.4, WALL_X: 8.5, CEIL: 6.5,
};
export const CURB = {
  KERB_Z: 2.0, ROAD_Y: -0.14, FAR_Z: 11.0, FACE_Z: 13.6,
  SHIP: [0, -11.2], SHIP_R: 8.4, BELLY_Y: 1.25,       // the saucer's centre, the rim's radius, the belly's height
  RAMP: [0, -1.45], RAMP_TOP: [0, 1.25, -6.0],        // the ramp's foot on the sidewalk, its top at the hangar's mouth
  CAR: [1.2, 3.25],                                   // the ride parked at the kerb, nose to -x (yaw 90)
};
export const RIDE = {
  SEAT_Y: 0.42, DOOR_Y: 0.88, W: 1.9, LEN: 4.6,
  SEATS: { driver: [-0.46, -0.12], passenger: [0.48, -0.12], rearL: [-0.46, 1.0], rearR: [0.48, 1.0] },
};

export function buildScrubMaps(K) {
  const k = mapKit(K);
  const { THREE, mat, tex, px, noise, box, TAU, PI, beat, grad, cyl, cone, ico, at, rot, flat, lights, pt, hash, merged, fr, stars, selfLit, U } = k;
  const M = (c, o = {}) => mat({ color: c, ...o }), glow = (c, u = 1) => mat({ color: c, unlit: u });
  const shotT = (t, P) => P.t0 != null ? t - P.t0 : 0;
  const cl = x => Math.max(0, Math.min(1, x)), sm = x => { x = cl(x); return x * x * (3 - 2 * x); };
  const cleared = (P, x, z) => (P.clear || []).some(([cx, cz, r]) => (x - cx) ** 2 + (z - cz) ** 2 < r * r);
  const CHROME = M(0xdfe4ec, { unlit: 0.28 }), DARK = M(0x16161c);
  const flatAt = (o, x, y, z) => { o.rotation.x = -PI / 2; o.position.set(x, y, z); return o; };

  // ---------- a heart: two balls and a cone (the driver's swoon) ----------
  const heartM = M(0xff4f9a, { unlit: 0.85 });
  function heart() {
    const h = new THREE.Group();
    h.add(at(ico(0.1, 0, heartM), -0.075, 0, 0)); h.add(at(ico(0.1, 0, heartM), 0.075, 0, 0));
    h.add(rot(at(cone(0.125, 0.18, 4, heartM), 0, -0.11, 0), PI, 0, 0));
    return h;
  }

  // ---------- the ride: a 60s lowrider convertible, candy turquoise, the passenger door in grey primer ----------
  function rideModel() {
    const g = new THREE.Group(), body = new THREE.Group(); g.add(body);   // body: everything the hydraulics lift
    const paint = M(0x1fc2c8, { unlit: 0.12 }), primer = M(0x8e8e94), seatM = M(0xf4efe6, { unlit: 0.12 }), seamM = M(0xd8d0c4),
      tyre = M(0x18181c), white = M(0xf4f4f0, { unlit: 0.2 }), floorM = M(0x2a2a30);
    const { W, LEN, SEAT_Y, DOOR_Y } = RIDE, hw = W / 2;
    // the lower body, the hood, the trunk deck
    body.add(at(box(W, 0.4, LEN, paint), 0, 0.42, -0.05));
    body.add(at(box(W - 0.04, 0.12, 1.55, paint), 0, 0.68, -1.58));
    body.add(at(box(W - 0.04, 0.14, 0.98, paint), 0, 0.69, 1.74));
    body.add(at(box(W - 0.3, 0.05, 1.3, M(0x16a4aa, { unlit: 0.12 })), 0, 0.745, -1.6));   // a darker stripe down the hood
    // the cabin's sides: the driver's side in paint, the passenger's front door in primer (the beat-up one)
    body.add(at(box(0.08, DOOR_Y - 0.6, 2.1, paint), -hw + 0.04, (DOOR_Y + 0.6) / 2, 0.22));
    body.add(at(box(0.08, DOOR_Y - 0.6, 1.12, primer), hw - 0.04, (DOOR_Y + 0.6) / 2, -0.29));
    body.add(at(box(0.08, DOOR_Y - 0.6, 0.98, paint), hw - 0.04, (DOOR_Y + 0.6) / 2, 0.76));
    for (const s of [-1, 1]) body.add(at(box(0.1, 0.04, LEN - 0.2, CHROME), s * (hw + 0.005), 0.6, -0.05));   // the chrome side strips
    for (const s of [-1, 1]) body.add(at(box(0.12, 0.05, 2.1, CHROME), s * (hw - 0.04), DOOR_Y + 0.02, 0.22));  // the door tops
    body.add(at(box(0.012, 0.02, 0.18, M(0x6a6a70)), hw + 0.002, 0.73, -0.55));   // the primer door's handle
    // the floor, the dashboard, the steering wheel, the windscreen with its chrome frame, the fuzzy dice
    body.add(at(box(W - 0.16, 0.05, 2.06, floorM), 0, 0.26, 0.22));
    body.add(at(box(W - 0.16, 0.16, 0.26, M(0x1a8a90, { unlit: 0.1 })), 0, 0.8, -0.72));
    const wheel = new THREE.Mesh(new THREE.TorusGeometry(0.17, 0.025, 4, 12), M(0xf0e6d0, { unlit: 0.2 }));
    wheel.position.set(RIDE.SEATS.driver[0], 0.86, -0.58); wheel.rotation.set(-0.95, 0, 0); body.add(wheel);
    body.add(rot(at(cyl(0.02, 0.02, 0.32, 4, CHROME), RIDE.SEATS.driver[0], 0.8, -0.68), 0.6, 0, 0));
    const ws = new THREE.Group(); ws.position.set(0, DOOR_Y - 0.02, -0.82); ws.rotation.x = 0.42; body.add(ws);   // the frame alone: a dithered pane veiled the faces behind it
    ws.add(at(box(W - 0.06, 0.03, 0.04, CHROME), 0, 0.17, 0));   // low: a taller one crossed the riders' faces from the front
    for (const s of [-1, 1]) ws.add(at(box(0.035, 0.18, 0.04, CHROME), s * (hw - 0.04), 0.09, 0));
    const dice = new THREE.Group(); dice.position.set(0.12, 0.15, 0.06); ws.add(dice);
    dice.add(at(box(0.004, 0.12, 0.004, DARK), 0, -0.06, 0));
    [-0.05, 0.05].forEach((dx, i) => dice.add(rot(at(box(0.075, 0.075, 0.075, M(0xff7ac0, { unlit: 0.3 })), dx, -0.15 - i * 0.02, 0), 0.3, 0.5 * i, 0.2)));
    // the benches: white tuck-and-roll, front and back
    const bench = (z, backZ) => {
      body.add(at(box(W - 0.22, 0.12, 0.56, seatM), 0, SEAT_Y - 0.06, z));
      for (let i = -3; i <= 3; i++) body.add(at(box(0.02, 0.005, 0.5, seamM), i * 0.22, SEAT_Y + 0.002, z));
      body.add(rot(at(box(W - 0.22, 0.46, 0.12, seatM), 0, SEAT_Y + 0.2, backZ), 0.12, 0, 0));
    };
    bench(RIDE.SEATS.driver[1], 0.24); bench(RIDE.SEATS.rearL[1], 1.36);
    // the nose and the tail: the chrome grille and bumpers, headlights, taillights
    body.add(at(box(W - 0.2, 0.2, 0.04, CHROME), 0, 0.46, -2.38));
    for (let i = -4; i <= 4; i++) body.add(at(box(0.02, 0.16, 0.05, DARK), i * 0.18, 0.46, -2.37));
    for (const z of [-2.42, 2.33]) body.add(at(box(W + 0.06, 0.09, 0.08, CHROME), 0, 0.27, z));
    for (const s of [-1, 1]) {   // round headlights in chrome rings (flat pale rectangles read as glitches), red taillights
      body.add(rot(at(cyl(0.085, 0.085, 0.03, 10, glow(0xfff4d0, 0.85)), s * 0.68, 0.52, -2.4), PI / 2, 0, 0)); body.add(rot(at(cyl(0.11, 0.11, 0.02, 10, CHROME), s * 0.68, 0.52, -2.385), PI / 2, 0, 0));
      body.add(at(box(0.3, 0.08, 0.03, glow(0xff2a3a)), s * 0.66, 0.56, 2.3));
    }
    // the wheels: black tyres with white walls and chrome hubs (they stay on the road when the body hops)
    const wheels = [];
    for (const [x, z] of [[-hw, -1.48], [hw, -1.48], [-hw, 1.38], [hw, 1.38]]) {
      const w = new THREE.Group(); w.position.set(x, 0.31, z); g.add(w); wheels.push(w);
      w.add(rot(cyl(0.31, 0.31, 0.24, 10, tyre), 0, 0, PI / 2));
      for (const s of [-1, 1]) { w.add(rot(at(cyl(0.22, 0.22, 0.012, 10, white), s * 0.121, 0, 0), 0, 0, PI / 2)); w.add(rot(at(cyl(0.13, 0.13, 0.014, 8, CHROME), s * 0.124, 0, 0), 0, 0, PI / 2)); }
    }
    return { g, body, wheels, dice };
  }
  // the hydraulics: the body bounces a parabola every hop[1] beats (the actors' `hop` curve, so riders bounce with it)
  function poseRide(R, t, P, bp) {
    R.body.position.y = 0; R.body.rotation.x = 0;
    const H = P.hop;
    if (H && bp >= 0) { const u = fr(bp / H[1]); R.body.position.y = H[0] * 4 * u * (1 - u); R.body.rotation.x = 0.05 * Math.sin(u * PI) * (H[0] > 0.15 ? 1 : 0.5); }
    R.dice.rotation.z = 0.35 * Math.sin(t * 5.3) + (H ? 0.5 * Math.sin(bp * PI) : 0); R.dice.rotation.x = 0.25 * Math.sin(t * 3.1);
  }

  // ---------- the best friend at the wheel: the "Dai Dai" keeper's bulldog, a red cap backwards, shades, a gold chain ----------
  function bulldog() {
    const g = new THREE.Group();
    const jersey = M(0xff6ab4, { unlit: 0.2 }), shorts = M(0x24242e), fur = M(0xc9a27a), furL = M(0xefdcc4), dark = M(0x16121a), shoe = M(0xf4f4f0),
      cap = M(0xd8242a, { unlit: 0.1 }), gold = M(0xffcc3a, { unlit: 0.35 }), shade = M(0x101016, { unlit: 0.1 });
    const hips = at(new THREE.Group(), 0, 0.5, 0); g.add(hips);
    const torso = new THREE.Group(); hips.add(torso);
    torso.add(at(box(0.7, 0.58, 0.46, jersey), 0, 0.32, 0)); torso.add(at(box(0.66, 0.16, 0.44, shorts), 0, 0.0, 0));
    torso.add(at(box(0.16, 0.12, 0.02, M(0xffffff, { unlit: 0.3 })), 0, 0.36, 0.235));   // a white patch on the jersey
    for (let q = 0; q < 7; q++) { const a = (q / 6 - 0.5) * 1.9; torso.add(at(ico(0.035, 0, gold), Math.sin(a) * 0.17, 0.5 - Math.cos(a) * 0.1, 0.24)); }   // the chain
    const head = at(new THREE.Group(), 0, 0.84, 0.03); torso.add(head);
    const skull = ico(0.31, 1, fur); skull.scale.set(1.18, 0.92, 1.0); head.add(skull);
    const muz = at(ico(0.17, 1, furL), 0, -0.11, 0.21); muz.scale.set(1.35, 0.78, 0.85); head.add(muz);
    for (const s of [-1, 1]) { const j = at(ico(0.1, 1, furL), s * 0.15, -0.17, 0.18); j.scale.set(1, 1.1, 0.9); head.add(j); }
    head.add(at(ico(0.065, 0, dark), 0, -0.03, 0.36));
    for (const s of [-1, 1]) head.add(at(cone(0.022, 0.07, 4, M(0xffffff)), s * 0.08, -0.2, 0.33));
    // the shades: two black lenses and a bridge over the eyes; the eyes show when they slide down his nose
    const shades = new THREE.Group(); head.add(shades);
    for (const s of [-1, 1]) shades.add(at(box(0.15, 0.085, 0.03, shade), s * 0.13, 0.07, 0.27));
    shades.add(at(box(0.08, 0.02, 0.03, shade), 0, 0.09, 0.28));
    for (const s of [-1, 1]) shades.add(rot(at(box(0.02, 0.02, 0.24, shade), s * 0.32, 0.08, 0.15), 0, s * 0.2, 0));
    const eyes = [-1, 1].map(s => { const e = at(new THREE.Group(), s * 0.13, 0.06, 0.26); e.add(ico(0.048, 0, dark)); e.add(at(ico(0.014, 0, glow(0xffffff)), 0.014, 0.016, 0.04)); head.add(e); return e; });
    for (const s of [-1, 1]) head.add(rot(at(box(0.12, 0.16, 0.05, M(0x8a6a4a)), s * 0.3, 0.2, -0.02), 0, 0, s * 0.9));
    // the cap, backwards: a red dome on the skull and the brim over the back of his neck
    const capG = at(new THREE.Group(), 0, 0.12, -0.02); head.add(capG);
    const dome = new THREE.Mesh(new THREE.SphereGeometry(0.3, 10, 6, 0, TAU, 0, PI / 2), cap); dome.scale.set(1.15, 0.72, 1.05); capG.add(dome);
    capG.add(rot(at(box(0.36, 0.03, 0.22, cap), 0, 0.0, -0.36), -0.12, 0, 0));
    const arms = [-1, 1].map(s => {
      const sh = at(new THREE.Group(), s * 0.39, 0.52, 0); torso.add(sh);
      sh.add(at(box(0.17, 0.3, 0.17, jersey), 0, -0.12, 0));
      const el = at(new THREE.Group(), 0, -0.27, 0); sh.add(el);
      el.add(at(box(0.15, 0.24, 0.15, fur), 0, -0.1, 0)); el.add(at(box(0.17, 0.12, 0.16, furL), 0, -0.25, 0));
      return { sh, el };
    });
    const legs = [-1, 1].map(s => {
      const hp = at(new THREE.Group(), s * 0.18, 0, 0); hips.add(hp);
      hp.add(at(box(0.21, 0.27, 0.23, fur), 0, -0.12, 0));
      const kn = at(new THREE.Group(), 0, -0.25, 0); hp.add(kn);
      kn.add(at(box(0.17, 0.21, 0.17, fur), 0, -0.1, 0)); kn.add(at(box(0.2, 0.09, 0.32, shoe), 0, -0.21, 0.06));
      return { hp, kn };
    });
    const hearts = new THREE.Group(); g.add(hearts);
    for (let q = 0; q < 3; q++) hearts.add(heart());
    return { g, hips, torso, head, arms, legs, eyes, shades, hearts };
  }
  // seated at the wheel (in the ride's frame: his group at the driver's seat, facing -z), posed from scratch each frame
  function poseDriver(D, Df, s, bp, seatY) {
    const { g, hips, torso, head, arms, legs, eyes, shades, hearts } = D;
    const pose = Df.pose || 'drive', at0 = Df.at ?? 0, u = s - at0;
    g.visible = !Df.hide; g.scale.setScalar(0.92);
    // seated a little higher and bigger than first built: at 0.8 his face sat behind the dash
    g.position.set(RIDE.SEATS.driver[0], seatY + 0.03, RIDE.SEATS.driver[1] + 0.04); g.rotation.set(0, PI, 0);
    hips.position.set(0, 0.12, 0); hips.rotation.set(0, 0, 0); torso.rotation.set(0, 0, 0); head.rotation.set(0, 0, 0);
    legs.forEach(l => { l.hp.rotation.set(-1.45, 0, 0); l.kn.rotation.set(1.3, 0, 0); });   // seated: thighs forward, shins down
    arms.forEach(a => { a.sh.rotation.set(0, 0, 0); a.el.rotation.set(0, 0, 0); });
    eyes.forEach(e => e.scale.set(1, 1, 1)); shades.position.set(0, 0, 0); hearts.visible = false;
    const bob = Math.exp(-fr(Math.max(0, bp)) * 5);   // a nod on every beat
    const wheelHands = () => arms.forEach((a, i) => { const sd = i ? 1 : -1; a.sh.rotation.set(-1.15, 0, sd * 0.18); a.el.rotation.set(-0.55, 0, 0); });
    if (pose === 'drive') { wheelHands(); head.rotation.set(0.14 * bob, 0, 0); torso.rotation.x = 0.03 * bob; }
    else if (pose === 'honk') { wheelHands(); arms[0].sh.rotation.set(-0.8, 0, -0.05); arms[0].el.rotation.set(-0.9 - 0.25 * Math.abs(Math.sin(s * 14)), 0, 0); head.rotation.set(0, -0.6, 0); }
    else if (pose === 'wave') { arms[1].sh.rotation.set(-1.15, 0, 0.18); arms[1].el.rotation.set(-0.55, 0, 0); arms[0].sh.rotation.set(-0.3, 0, -2.4); arms[0].el.rotation.set(0, 0, -0.4 + 0.35 * Math.sin(s * 9)); head.rotation.set(0, -0.35, 0.1); }
    else if (pose === 'lean') { arms[1].sh.rotation.set(-1.15, 0, 0.18); arms[1].el.rotation.set(-0.55, 0, 0); arms[0].sh.rotation.set(0.1, 0, -0.35); arms[0].el.rotation.set(-0.3, 0, 0); torso.rotation.set(0, 0, -0.08); head.rotation.set(0.1 * bob, -0.25, 0); }
    else if (pose === 'swoon') {   // paws on his heart, the shades slid down his nose, dreamy eyes, a sway: in love at first sight
      const e = sm(u / 0.45), sway = Math.sin(s * 3.2) * 0.1;
      g.rotation.z = sway * e; head.rotation.set(-0.15 * e, 0, 0.28 * e); torso.rotation.x = -0.1 * e;
      arms.forEach((a, i) => { const sd = i ? 1 : -1; a.sh.rotation.set(-1.0 * e - 0.4 * (1 - e), 0, sd * (0.3 - 0.7 * e)); a.el.rotation.set(-1.45 * e, 0, 0); });
      shades.position.set(0, -0.09 * e, 0.03 * e); eyes.forEach(ey => ey.scale.set(1, 1 - 0.6 * e, 1));
    }
    const hs = Df.hearts ?? (pose === 'swoon' ? at0 : null);
    if (hs != null && s >= hs) {
      hearts.visible = true; const a0 = s - hs;
      hearts.children.forEach((h, q) => {
        const a2 = a0 - q * 0.3, vis = a2 > 0; h.visible = vis; if (!vis) return;
        const pop = cl(a2 / 0.2), cyc = (a2 % 1.5) / 1.5;
        h.position.set((q - 1) * 0.26, 1.38 + 0.32 * cyc, 0.1);
        h.scale.setScalar(0.85 * (0.5 + 0.6 * pop) * (1 + 0.12 * Math.sin(a2 * 10)) * (cyc > 0.8 ? (1 - cyc) * 5 : 1));
      });
    }
  }

  // ---------- shared street pieces: a cobra-head lamp, a palm, a shop front with neon, a parked car ----------
  const lampPole = M(0x3a3a44), lampHead = glow(0xffb45a), trunkM = M(0x8a6a4a), frondM = M(0x2e7a4a, { unlit: 0.15 }), frond2 = M(0x3a9a5a, { unlit: 0.15 });
  function lamp(s = 1) {
    const g = new THREE.Group();
    g.add(at(cyl(0.07, 0.09, 5.2, 5, lampPole), 0, 2.6, 0)); g.add(rot(at(cyl(0.05, 0.05, 1.4, 4, lampPole), s * 0.62, 5.1, 0), 0, 0, PI / 2));
    g.add(at(box(0.55, 0.14, 0.3, lampPole), s * 1.3, 5.08, 0)); g.add(at(box(0.44, 0.04, 0.22, lampHead), s * 1.3, 5.0, 0));
    return g;
  }
  function palm(seed, h = 7) {
    const g = new THREE.Group(), lean = (hash(seed, 1) - 0.5) * 0.25;
    for (let i = 0; i < 6; i++) g.add(rot(at(cyl(0.13 - i * 0.012, 0.15 - i * 0.012, h / 6 + 0.05, 6, trunkM), Math.sin(lean) * (i + 0.5) * h / 6, (i + 0.5) * h / 6, 0), 0, 0, -lean));
    const top = at(new THREE.Group(), Math.sin(lean) * h, h, 0); g.add(top);
    for (let i = 0; i < 9; i++) { const a = i / 9 * TAU + hash(seed, i) * 0.3, f = new THREE.Group(); f.rotation.set(0, a, 0); top.add(f); f.add(rot(at(box(0.36, 0.03, 1.9, i % 2 ? frondM : frond2), 0, -0.25, 0.9), 0.45, 0, 0)); }
    top.add(ico(0.22, 0, trunkM));
    return g;
  }
  const NEON = [0xff3aa0, 0x3ad8ff, 0xffe03a, 0x9a5aff, 0x5aff8a];
  const facadeT = (q, seed) => tex(16, 32, (x, r) => {
    px(x, ['#3a2e48', '#2e3a4c', '#4a3440', '#2a3a3e', '#3e3a2e'][q % 5], 0, 0, 16, 32); noise(x, r, 16, 32, ['rgba(0,0,0,.15)', 'rgba(255,255,255,.05)'], 50);
    for (let y = 2; y < 22; y += 5) for (let X = 1; X < 16; X += 4) { x.fillStyle = r() < 0.5 ? 'rgba(255,214,140,0.85)' : '#141824'; x.fillRect(X, y, 2, 3); }
    px(x, '#ffe6b0', 1, 25, 14, 6); px(x, '#2a2a34', 7, 25, 2, 7); selfLit(x, 16, 32);
  }, seed);
  const FAC = [0, 1, 2, 3, 4].map(q => mat({ map: facadeT(q, 2910 + q), unlit: 0.35 }));
  function shopRow(G, z, x0, x1, seed, faceSign = -1) {   // a row of shop fronts along x, their fronts at z facing -z (faceSign -1) or +z
    const out = []; let x = x0;
    for (let i = 0; x < x1; i++) {
      const w = 5 + hash(i, seed) * 3.5, h = 4.5 + hash(i, seed + 1) * 5;
      const b = at(box(w - 0.3, h, 6, FAC[(i + seed) % 5]), x + w / 2, h / 2, z - faceSign * 3); G.add(b); out.push([b, x + w / 2, z]);
      const n = at(box(Math.min(2.6, w * 0.45), 0.42, 0.08, glow(NEON[(i + seed) % NEON.length])), x + w / 2, Math.min(3.6, h - 0.7), z + faceSign * 0.05); G.add(n); out.push([n, x + w / 2, z]);
      x += w;
    }
    return out;
  }
  function parkedCar(col) {
    const g = new THREE.Group();
    g.add(at(box(1.75, 0.55, 4.0, M(col)), 0, 0.5, 0)); g.add(at(box(1.55, 0.45, 2.0, M(0x1a1e2a, { unlit: 0.1 })), 0, 0.98, 0.15));
    for (const [x, z] of [[-0.85, -1.3], [0.85, -1.3], [-0.85, 1.3], [0.85, 1.3]]) g.add(rot(at(cyl(0.3, 0.3, 0.2, 8, M(0x18181c)), x, 0.3, z), 0, 0, PI / 2));
    return g;
  }
  // a dark night sky with stars and a pink city haze at the horizon, as a dome (the far plane is 200 m)
  function nightDome(G, seed) {
    const T = tex(4, 64, x => { const gr = x.createLinearGradient(0, 0, 0, 64); gr.addColorStop(0, '#06061a'); gr.addColorStop(0.32, '#141436'); gr.addColorStop(0.44, '#3a2456'); gr.addColorStop(0.5, '#8a3a6a'); gr.addColorStop(1, '#8a3a6a'); x.fillStyle = gr; x.fillRect(0, 0, 4, 64); });
    G.add(new THREE.Mesh(new THREE.SphereGeometry(188, 16, 12), mat({ map: T, unlit: 1, nofog: 1, side: THREE.BackSide })));
    const st = stars(120, 170, seed, 0xffffff, 0.12); st.material = mat({ color: 0xffffff, unlit: 1, nofog: 1 }); G.add(st);
  }

  // =====================================================================================================================
  // chrome: the girl group's spaceship set
  function chrome() {
    const G = new THREE.Group();
    const { POD, LETTERS_Z, WALL_Z, WALL_X, CEIL } = CHROME_SET;
    const tileT = tex(16, 16, (x, r) => { px(x, '#939db0', 0, 0, 16, 16); noise(x, r, 16, 16, ['#8d97aa', '#99a3b6'], 30); px(x, '#78829a', 0, 0, 16, 1); px(x, '#78829a', 0, 0, 1, 16); }, 2901);   // blue-grey: a white floor rendered at 255, no shadows, the jackets dissolving into it
    G.add(flat(2 * WALL_X, 15, mat({ map: tileT, rep: [11, 10] }), 0, 0, WALL_Z + 7.5));
    G.add(flatAt(new THREE.Mesh(new THREE.CircleGeometry(2.4, 24), M(0x7f8aa0)), 0, 0.004, -1.0));   // a darker disc under the trio: their white jackets stand out on it
    // the back wall: white panels with seams, a round recess lit through rows of holes, the chrome NO on its plinth
    const panelT = tex(16, 32, (x, r) => { px(x, '#eceff4', 0, 0, 16, 32); noise(x, r, 16, 32, ['#e6e9ef', '#f2f4f8'], 30); px(x, '#c8ccd6', 0, 0, 1, 32); px(x, '#c8ccd6', 0, 15, 16, 1); }, 2902);
    G.add(at(new THREE.Mesh(new THREE.PlaneGeometry(2 * WALL_X, CEIL), mat({ map: panelT, rep: [9, 2], unlit: 0.22 })), 0, CEIL / 2, WALL_Z));
    const dotsT = tex(32, 32, (x, r) => { px(x, '#2a2e3a', 0, 0, 32, 32); for (let yy = 1; yy < 32; yy += 4) for (let xx = (yy % 8 === 1 ? 1 : 3); xx < 32; xx += 4) px(x, '#f4fbff', xx, yy, 2, 2); selfLit(x, 32, 32); }, 2903);
    const dotsM = mat({ map: dotsT, rep: [5, 5], unlit: 0.9 });
    G.add(at(new THREE.Mesh(new THREE.CircleGeometry(3.3, 28), dotsM), 0, 3.15, WALL_Z + 0.03));
    G.add(at(new THREE.Mesh(new THREE.TorusGeometry(3.35, 0.14, 4, 28), CHROME), 0, 3.15, WALL_Z + 0.08));
    const letters = new THREE.Group(); letters.position.set(0, 0, LETTERS_Z); G.add(letters);
    letters.add(at(box(5.8, 0.34, 0.9, M(0xf8f8fb, { unlit: 0.25 })), 0, 0.17, 0));
    const LT = 0.36, LH = 2.0, y0 = 0.34;
    letters.add(at(box(0.42, LH, LT, CHROME), -2.25, y0 + LH / 2, 0)); letters.add(at(box(0.42, LH, LT, CHROME), -0.75, y0 + LH / 2, 0));   // the N
    { const d = at(box(0.42, Math.hypot(1.5, LH) - 0.1, LT, CHROME), -1.5, y0 + LH / 2, 0); d.rotation.z = Math.atan2(1.5, LH); letters.add(d); }
    { const o = new THREE.Mesh(new THREE.TorusGeometry(0.8, 0.22, 6, 18), CHROME); o.position.set(1.3, y0 + LH / 2, 0); o.scale.set(0.95, 1.18, 1.6); letters.add(o); }   // the O
    // the side walls: white ribs with cyan light strips between them; the ceiling with its ring light; the front wall
    for (const s of [-1, 1]) {
      G.add(rot(at(new THREE.Mesh(new THREE.PlaneGeometry(15, CEIL), mat({ map: panelT, rep: [7, 2], unlit: 0.22 })), s * WALL_X, CEIL / 2, WALL_Z + 7.5), 0, -s * PI / 2, 0));
      for (let i = 0; i < 9; i++) {
        const z = WALL_Z + 0.8 + i * 1.6;
        G.add(at(box(0.3, CEIL - 0.6, 0.36, M(0xf6f7fa, { unlit: 0.25 })), s * (WALL_X - 0.15), CEIL / 2, z));
        G.add(at(box(0.06, CEIL - 1.4, 0.12, glow(0x5ae0ff)), s * (WALL_X - 0.04), CEIL / 2, z + 0.8));
      }
    }
    { const c = new THREE.Mesh(new THREE.PlaneGeometry(2 * WALL_X, 15), M(0xf0f2f6, { unlit: 0.2 })); c.rotation.x = PI / 2; G.add(at(c, 0, CEIL, WALL_Z + 7.5)); }
    const ring = new THREE.Mesh(new THREE.TorusGeometry(3.0, 0.1, 4, 28), glow(0x8af0ff)); ring.rotation.x = PI / 2; ring.position.set(0, CEIL - 0.05, -1.2); G.add(ring);
    G.add(rot(at(new THREE.Mesh(new THREE.PlaneGeometry(2 * WALL_X, CEIL), mat({ map: panelT, rep: [9, 2], unlit: 0.22 })), 0, CEIL / 2, WALL_Z + 15), 0, PI, 0));
    // the pod: the back half of a glass tube (nothing between whoever stands in it and the lens), light bars, chrome rings
    const pod = new THREE.Group(); pod.position.set(POD[0], 0, POD[1]); G.add(pod);
    const podGlass = new THREE.Mesh(new THREE.CylinderGeometry(0.72, 0.72, 2.5, 16, 1, true, PI / 2, PI), M(0xbfeaff, { see: 0.5, unlit: 0.35, side: THREE.DoubleSide }));
    podGlass.position.y = 1.4; pod.add(podGlass);
    for (const y of [0.06, 2.68]) { const r2 = new THREE.Mesh(new THREE.TorusGeometry(0.74, 0.07, 4, 18), CHROME); r2.rotation.x = PI / 2; r2.position.y = y; pod.add(r2); }
    pod.add(at(cyl(0.74, 0.74, 0.04, 18, glow(0xdff8ff)), 0, 2.74, 0)); pod.add(at(cyl(0.72, 0.72, 0.03, 18, glow(0xbff4ff, 0.7)), 0, 0.015, 0));
    const bars = [];
    for (let i = 0; i < 6; i++) { const a = PI / 2 + PI * (i + 0.5) / 6, b = at(box(0.05, 2.5, 0.05, glow(0x7ae8ff)), Math.cos(a) * 0.76, 1.4, -Math.sin(a) * 0.76); pod.add(b); bars.push(b); }
    return {
      group: G, indoor: true, sky: grad([[0, '#e8f4ff'], [1, '#ffffff']]), shadowCol: 0x3a4256,
      light() {
        lights(0x9aa2b0, 0xe8ecf4, [0.15, -0.8, -0.55], 0xf0f6ff, [40, 120], 7);   // dimmer: the floor still read white under the first key
        pt(0, -6, 3, -2, 0.25, 0.75, 0.95); pt(1, 6, 3, -2, 0.25, 0.75, 0.95); pt(2, 0, 2.6, 3.5, 0.55, 0.55, 0.6);
      },
      anim(t, P = {}) {
        const s = shotT(t, P), bb = beat(t), hitB = bb >= 0 ? Math.exp(-fr(bb) * 4) : 0;
        letters.visible = !P.noLetters; pod.visible = !P.noPod;
        const pulse = P.pulse !== false ? 0.75 + 0.25 * hitB : 0.85;
        dotsM.uniforms.uCol.value.setRGB(pulse, pulse, pulse);
        bars.forEach((b, i) => { b.visible = (P.podGlow ?? 1) > 0.05 && (!P.podChase || fr(bb / 2 + i / 6) < 0.8); });
        if (P.key) pt(3, P.key[0], P.key[1], P.key[2], P.key[3], P.key[4], P.key[5]);
        for (const f of P.flash || []) { const e = s - f; if (e >= 0 && e < 0.3) U.uAmb.value.lerp(new THREE.Color(1, 1, 1), 1 - e / 0.3); }
      },
    };
  }

  // =====================================================================================================================
  // curb: the street where the saucer landed
  function curb() {
    const G = new THREE.Group();
    const { KERB_Z, ROAD_Y, FAR_Z, FACE_Z, SHIP, SHIP_R, BELLY_Y, RAMP, RAMP_TOP } = CURB;
    nightDome(G, 2920);
    // the near sidewalk (y = 0), its kerb, the road, the far sidewalk
    const slabT = tex(16, 16, (x, r) => { px(x, '#8a8890', 0, 0, 16, 16); noise(x, r, 16, 16, ['#84828a', '#908e96', '#7e7c84'], 60); px(x, '#6a6870', 0, 0, 16, 1); px(x, '#6a6870', 0, 0, 1, 16); }, 2921);
    G.add(flat(70, 9, mat({ map: slabT, rep: [46, 6] }), 0, 0, KERB_Z - 4.5));
    G.add(at(box(70, 0.16, 0.18, M(0xa8a6ae)), 0, -0.07, KERB_Z));
    const roadM = mat({ map: tex(16, 16, (x, r) => { px(x, '#24242c', 0, 0, 16, 16); noise(x, r, 16, 16, ['#202028', '#2a2a32'], 40); }, 2922), rep: [24, 3] });
    G.add(flat(70, FAR_Z - KERB_Z, roadM, 0, ROAD_Y, (KERB_Z + FAR_Z) / 2));
    const dashes = []; for (let i = 0; i < 18; i++) dashes.push(at(new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.01, 0.12)), -34 + i * 4, ROAD_Y + 0.005, (KERB_Z + FAR_Z) / 2 + 0.3));
    G.add(merged(dashes, M(0xe8dca0, { unlit: 0.3 })));
    G.add(flat(70, 3, mat({ map: slabT, rep: [46, 2] }), 0, 0, FAR_Z + 1.5)); G.add(at(box(70, 0.16, 0.18, M(0xa8a6ae)), 0, -0.07, FAR_Z));
    // across the street: shop fronts with neon, palms, lamps, parked cars, a few pets strolling
    const deco = shopRow(G, FACE_Z, -36, 36, 2930, -1);
    const lamps = [];
    // near lamps well off the ride's spot (a pole grew out of heads)
    for (const x of [-18, -9, 9, 18]) { const l = lamp(-1); l.position.set(x, 0, KERB_Z - 0.35); l.rotation.y = PI / 2; G.add(l); lamps.push([l, x, KERB_Z - 0.35]); }
    for (const x of [-20, -10, 0, 10, 20]) { const l = lamp(-1); l.position.set(x, 0, FAR_Z + 0.4); l.rotation.y = -PI / 2; G.add(l); lamps.push([l, x, FAR_Z + 0.4]); }
    const palms = [];
    for (let i = 0; i < 8; i++) { const x = -31 + i * 9 + hash(i, 2931) * 2, p = palm(2932 + i, 6.5 + hash(i, 2933) * 2.5); p.position.set(x, 0, FAR_Z + 2.0); G.add(p); palms.push([p, x, FAR_Z + 2.0]); }
    [[-14, 0xd8322a], [9, 0xf2f2f2], [19, 0x2a5ad8]].forEach(([x, col]) => { const c = parkedCar(col); c.position.set(x, ROAD_Y, FAR_Z - 1.2); c.rotation.y = PI / 2; G.add(c); });
    const peds = [], PED = [0xd8a868, 0xe8d8c0, 0xb08a60, 0xf2eee6, 0xc8c0d0];
    for (let i = 0; i < 6; i++) {
      const p = new THREE.Group(), fur = M(PED[i % 5]), top = M(NEON[i % 5], { unlit: 0.2 });
      p.add(at(box(0.36, 0.42, 0.26, top), 0, 0.52, 0)); p.add(at(box(0.3, 0.3, 0.24, M(0x2a2a34)), 0, 0.17, 0));
      const hd = at(new THREE.Group(), 0, 0.98, 0); hd.add(ico(0.26, 1, fur)); hd.add(at(ico(0.1, 0, M(0x1a1a1e)), 0, -0.02, 0.24));
      for (const s of [-1, 1]) hd.add(at(box(0.08, 0.16, 0.05, fur), s * 0.18, 0.22, 0));
      p.add(hd); p.position.set(-13 + i * 5.2 + hash(i, 2934) * 1.5, 0, FAR_Z + 0.9 + hash(i, 2935) * 1.2); G.add(p); peds.push({ p, hd, i, x: p.position.x, z: p.position.z });
    }
    // ---------------- the saucer: a chrome rim on a lit belly, a dome, four legs, its ramp and glowing doorway ----------------
    const ship = new THREE.Group(); ship.position.set(SHIP[0], 0, SHIP[1]); G.add(ship);
    const hullM = M(0xd8dde6, { unlit: 0.22 }), hull2 = M(0xb8c0cc, { unlit: 0.22 }), bellyM = M(0x9aa4b4, { unlit: 0.2, side: THREE.DoubleSide });
    const GAP = 0.27;   // the hangar's mouth: a gap in the belly cone facing the street (+z)
    const lowerCone = new THREE.Mesh(new THREE.CylinderGeometry(SHIP_R, 5.2, 1.7, 28, 1, true, GAP, TAU - 2 * GAP), bellyM); lowerCone.position.y = BELLY_Y + 0.85; ship.add(lowerCone);
    const hangarM = glow(0xf4fbff);
    ship.add(at(new THREE.Mesh(new THREE.PlaneGeometry(3.6, 1.72), hangarM), 0, BELLY_Y + 0.86, 4.7));   // the lit hangar wall behind the mouth
    for (const sd of [-1, 1]) ship.add(rot(at(new THREE.Mesh(new THREE.PlaneGeometry(2.6, 1.72), mat({ color: 0xdfe8f4, unlit: 0.7, side: THREE.DoubleSide })), sd * 1.75, BELLY_Y + 0.86, 6.0), 0, PI / 2, 0));
    ship.add(rot(at(new THREE.Mesh(new THREE.PlaneGeometry(3.6, 2.6), mat({ color: 0xe8f0fa, unlit: 0.7, side: THREE.DoubleSide })), 0, BELLY_Y + 1.7, 6.0), PI / 2, 0, 0));   // its ceiling
    ship.add(at(new THREE.Mesh(new THREE.CylinderGeometry(5.2, 5.2, 0.06, 24), M(0x3a4458, { unlit: 0.3 })), 0, BELLY_Y, 0));   // dark: a bright disc read as a table from below
    { const ring = new THREE.Mesh(new THREE.TorusGeometry(4.9, 0.12, 4, 32), glow(0x6adcff, 0.9)); ring.rotation.x = PI / 2; ring.position.y = BELLY_Y - 0.05; ship.add(ring); }
    ship.add(at(cyl(SHIP_R + 0.15, SHIP_R + 0.15, 0.42, 32, hullM), 0, BELLY_Y + 1.9, 0));
    const upper = new THREE.Mesh(new THREE.CylinderGeometry(5.6, SHIP_R, 1.1, 28, 1, true), hull2); upper.position.y = BELLY_Y + 2.66; ship.add(upper);
    const dome = new THREE.Mesh(new THREE.SphereGeometry(5.6, 20, 8, 0, TAU, 0, PI / 2), hullM); dome.scale.set(1, 0.42, 1); dome.position.y = BELLY_Y + 3.2; ship.add(dome);
    const rimLights = [];
    for (let i = 0; i < 28; i++) { const a = i / 28 * TAU, l = at(box(0.3, 0.16, 0.06, glow(0x7af0ff)), Math.sin(a) * (SHIP_R + 0.2), BELLY_Y + 1.9, Math.cos(a) * (SHIP_R + 0.2)); l.rotation.y = a; ship.add(l); rimLights.push(l); }
    for (let i = 0; i < 14; i++) { const a = i / 14 * TAU + 0.11, p = new THREE.Mesh(new THREE.CircleGeometry(0.3, 10), glow(0xfff6d8, 0.9)); p.position.set(Math.sin(a) * 6.95, BELLY_Y + 2.66, Math.cos(a) * 6.95); p.rotation.set(-0.2, a, 0); ship.add(p); }
    for (let i = 0; i < 4; i++) {
      const a = PI / 4 + i * PI / 2;
      ship.add(rot(at(cyl(0.12, 0.16, BELLY_Y + 0.6, 6, CHROME), Math.sin(a) * 4.4, (BELLY_Y + 0.6) / 2 - 0.1, Math.cos(a) * 4.4), Math.cos(a) * 0.2, 0, -Math.sin(a) * 0.2));
      ship.add(at(cyl(0.5, 0.55, 0.08, 8, CHROME), Math.sin(a) * 4.7, 0.04, Math.cos(a) * 4.7));
    }
    // the doorway in the belly's front and the ramp down to the sidewalk (from RAMP_TOP to RAMP)
        const rampLen = Math.hypot(RAMP_TOP[2] - RAMP[1], RAMP_TOP[1]), rampA = Math.atan2(RAMP_TOP[1], RAMP[1] - RAMP_TOP[2]);
    const ramp = new THREE.Group(); G.add(ramp);
    ramp.add(box(2.5, 0.08, rampLen, M(0xe8ecf2, { unlit: 0.25 }))); ramp.add(at(box(1.9, 0.01, rampLen, glow(0xe8faff, 0.75)), 0, 0.045, 0));
    for (const s of [-1, 1]) ramp.add(at(box(0.08, 0.1, rampLen, CHROME), s * 1.25, 0.06, 0));
    const placeRamp = fold => {   // folded up into the belly as the saucer lifts
      const a = rampA + fold * 1.2;
      ramp.position.set(RAMP[0], RAMP_TOP[1] - Math.sin(a) * rampLen / 2, RAMP_TOP[2] + Math.cos(a) * rampLen / 2);
      ramp.rotation.set(a, 0, 0);
    };
    const spill = flatAt(new THREE.Mesh(new THREE.CircleGeometry(1.6, 14), mat({ color: 0xdff6ff, unlit: 0.6, see: 0.5 })), RAMP[0], 0.006, RAMP[1] + 0.6); G.add(spill);
    // ---------------- the ride and its driver ----------------
    const ride = rideModel(); G.add(ride.g); const driver = bulldog(); ride.body.add(driver.g);
    return {
      group: G, sky: grad([[0, '#06061a'], [1, '#3a2456']]), shadowCol: 0x3a3a46,
      light() {
        lights(0x5a5a80, 0x9aa8e0, [0.35, -0.75, -0.4], 0x1a1430, [30, 110], 9);
        pt(0, RAMP[0], 1.6, RAMP[1] - 1.0, 0.85, 0.95, 1.05);   // the doorway's light down the ramp
        pt(1, 5, 4.6, KERB_Z - 0.6, 1.0, 0.62, 0.3); pt(2, -5, 4.6, KERB_Z - 0.6, 1.0, 0.62, 0.3);
      },
      anim(t, P = {}) {
        const s = shotT(t, P), bb = beat(t);
        if (P.key) pt(3, P.key[0], P.key[1], P.key[2], P.key[3], P.key[4], P.key[5]);
        // the saucer: its rim lights chase round; shipUp lifts it off, the ramp folding up first
        rimLights.forEach((l, i) => { l.visible = fr(i / 28 - t * 0.35) < 0.7; });
        // shipLift [s0, dur, H]: it rises H m on the same smoothstep as an actor's my (myAt s0, myDur dur), so a rider in
        // its hangar rises with it; the ramp is folded up from the shot's start (rampUp, or any lift)
        const L = P.shipLift, up = L ? sm((s - L[0]) / L[1]) : 0, fold = L || P.rampUp ? 1 : 0;
        ship.position.y = L ? L[2] * up : 0; placeRamp(fold); ramp.visible = fold < 0.98; spill.visible = fold < 0.5;
        hangarM.uniforms.uCol.value.setScalar(P.doorGlow ?? 1);
        // the ride: parked, driving, hopping; the driver
        const C = P.car || {}; ride.g.visible = !C.hide && P.car !== false;
        let cx = C.x ?? CURB.CAR[0], cz = C.z ?? CURB.CAR[1];
        if (C.to) { const u = cl((s - (C.at || 0)) / (C.dur || 2)), e = C.lin ? u : sm(u); cx += (C.to[0] - cx) * e; cz += (C.to[1] - cz) * e; }   // lin: linear, like an actor's mx/mz from its moveAt, so riders keep their seats
        ride.g.position.set(cx, ROAD_Y, cz); ride.g.rotation.set(0, (C.yaw ?? 90) * PI / 180, 0);
        const moving = !!C.to && s > (C.at || 0) && s < (C.at || 0) + (C.dur || 2);
        ride.wheels.forEach(w => { w.rotation.x = moving ? -s * 9 : 0; });
        poseRide(ride, t, P, bb); poseDriver(driver, P.driver || {}, s, bb, RIDE.SEAT_Y);
        // set dressing cleared from the lenses; the passers-by turn to stare
        deco.forEach(([o, x, z]) => { o.visible = !cleared(P, x, z); });
        lamps.forEach(([l, x, z]) => { l.visible = !cleared(P, x, z); });
        palms.forEach(([p, x, z]) => { p.visible = !cleared(P, x, z); });
        peds.forEach(({ p, hd, i, x, z }) => {
          p.visible = !P.noPeds && !cleared(P, x, z);
          p.rotation.y = P.stare ? Math.atan2(P.stare[0] - x, P.stare[1] - z) : PI + 0.4 * Math.sin(t * 0.5 + i);
          hd.rotation.x = 0.05 * Math.sin(bb * PI + i);
        });
      },
    };
  }

  // =====================================================================================================================
  // cruise: the boulevard scrolling past the still ride (nose to -z)
  function cruise() {
    const G = new THREE.Group(), world = new THREE.Group(); G.add(world);
    nightDome(G, 2940);
    const roadM = mat({ map: tex(16, 16, (x, r) => { px(x, '#24242c', 0, 0, 16, 16); noise(x, r, 16, 16, ['#202028', '#2a2a32'], 40); }, 2941), rep: [6, 160] });
    world.add(flat(13.6, 380, roadM, 0, 0, -100));
    for (const s of [-1, 1]) world.add(flat(4, 380, M(0x5a5862), s * 8.8, 0.1, -100));
    world.add(flat(0.1, 380, M(0xe8c040, { unlit: 0.3 }), -5.2, 0.004, -100)); world.add(flat(0.1, 380, M(0xe8c040, { unlit: 0.3 }), -5.4, 0.004, -100));
    const WRAP = 240, items = [], lampsC = [];
    for (let i = 0; i < 40; i++) { const d = box(0.12, 0.01, 2.8, M(0xe8dca0, { unlit: 0.3 })); d.position.set(-1.8, 0.006, 0); world.add(d); items.push([d, i * 6]); }
    for (let i = 0; i < 12; i++) for (const s of [-1, 1]) { const l = lamp(1); l.position.x = s * 7.2; l.rotation.y = s > 0 ? PI : 0; world.add(l); items.push([l, i * 20 + (s > 0 ? 10 : 0)]); lampsC.push(l); }
    for (let i = 0; i < 14; i++) for (const s of [-1, 1]) { const p = palm(2943 + i * 2 + (s > 0 ? 1 : 0), 6.5 + hash(i, s + 2944) * 3); p.position.x = s * (9.4 + hash(i, s + 2945) * 0.8); world.add(p); items.push([p, i * 17 + (s > 0 ? 8 : 2)]); }
    for (let i = 0; i < 22; i++) for (const s of [-1, 1]) {
      const w = 6 + hash(i, s + 2946) * 4, h = 4.5 + hash(i, s + 2947) * 9, b = box(5, h, w - 0.4, FAC[(i + (s > 0 ? 2 : 0)) % 5]); b.position.set(s * 13.4, h / 2, 0); world.add(b); items.push([b, i * 11]);
      const n = box(0.1, 0.5, Math.min(3, w * 0.45), glow(NEON[(i + (s > 0 ? 1 : 3)) % NEON.length])); n.position.set(s * 10.85, Math.min(3.8, h - 0.7), 0); world.add(n); items.push([n, i * 11]);
    }
    const traffic = [];
    for (let i = 0; i < 4; i++) { const c = parkedCar([0xd8322a, 0xf2f2f2, 0x2a5ad8, 0xe8b830][i]); c.position.x = -3.6; for (const sx of [-0.55, 0.55]) c.add(at(box(0.28, 0.14, 0.04, glow(0xfff4d0)), sx, 0.55, 2.02)); world.add(c); traffic.push([c, i * 61 + 23]); }
    const ride = rideModel(); G.add(ride.g); const driver = bulldog(); ride.body.add(driver.g);
    const heartsM = []; for (let i = 0; i < 9; i++) { const h = heart(); h.visible = false; G.add(h); heartsM.push(h); }
    return {
      group: G, sky: grad([[0, '#06061a'], [1, '#3a2456']]), shadowCol: 0x18181e,
      light() { lights(0x5a5a80, 0x9aa8e0, [0.3, -0.8, 0.3], 0x1a1430, [40, 150], 9); },
      anim(t, P = {}) {
        const s = shotT(t, P), bb = beat(t), V = P.speed ?? 11;
        const place = off => ((off + t * V) % WRAP + WRAP) % WRAP - WRAP * 0.6;
        items.forEach(([o, off]) => { o.position.z = place(off); });
        traffic.forEach(([c, off]) => { c.visible = !P.noTraffic; c.position.z = ((off + t * V * 2) % WRAP + WRAP) % WRAP - WRAP * 0.6; });
        roadM.uniforms.uOff.value.set(0, -t * V / (380 / 160));
        // the nearest two lamps' orange glow sweeps over the car; a cool fill from the shop fronts
        const near = lampsC.filter(l => Math.abs(l.position.z) < 9).sort((a, b) => Math.abs(a.position.z) - Math.abs(b.position.z)).slice(0, 2);
        near.forEach((l, i) => pt(i, l.position.x * 0.6, 4.2, l.position.z, 1.1, 0.66, 0.3));
        pt(2, 0, 3.0, 4.5, 0.32, 0.3, 0.46);
        if (P.key) pt(3, P.key[0], P.key[1], P.key[2], P.key[3], P.key[4], P.key[5]);
        poseRide(ride, t, P, bb); poseDriver(driver, P.driver || {}, s, bb, RIDE.SEAT_Y);
        ride.wheels.forEach(w => { w.rotation.x = -t * V / 0.31; });
        heartsM.forEach((h, i) => {
          const q = (P.hearts || [])[Math.floor(i / 3)]; h.visible = false; if (!q) return;
          const e = s - q[3] - (i % 3) * 0.18; if (e < 0 || e > 1.4) return;
          h.visible = true; h.position.set(q[0] + ((i % 3) - 1) * 0.22 + 0.06 * Math.sin(e * 6 + i), q[1] + 0.55 * e, q[2] + e * 1.2); h.scale.setScalar(Math.min(1, e * 5) * (1.15 - 0.25 * (e / 1.4)));
        });
      },
    };
  }

  return { chrome: chrome(), curb: curb(), cruise: cruise() };
}
