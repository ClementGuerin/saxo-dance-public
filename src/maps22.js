// maps22.js: the "Stop The Wedding!" map (2026-10-01, Ashe; the clip: a 1960s melodrama, a jealous blonde in curlers
// at her vanity, a wedding invitation in a white-gloved hand, a cake topper, a rotary phone, a pink dress, a drive in a
// pale vintage car). Same contract as the other map files, pure in t:
//   wedding  a white country chapel by day: pale wooden boards, a white aisle runner strewn with pink petals from the
//            double doors (DOORS, z 11, onto a sunny lawn) to the altar, where the couple stands under a flower arch
//            (BRIDE, GROOM facing each other, the OFFICIANT behind them facing +z), candle stands, a three-tier cake
//            (CAKE), six rows of white pews either side (PEWS) full of pet guests in their wedding best, tall pastel
//            stained-glass windows along both walls, a round rose window over the arch, dark beams under the ceiling.
//            The groom is a big bulldog in a black tuxedo (the "Dai Dai" keeper, now in love with anyone), posed by
//            `groom`: { pose, x, z, yaw, at, to: [x, z], dur, look: [x, z], hearts: s, ring }: 'stand', 'hands' (both
//            paws forward, holding the bride's), 'swoon' (paws on his heart, hearts popping, dreamy eyes, a sway),
//            'walk' / 'run' (from (x, z) to `to` over [at, at + dur], a waddle or a sprint, facing where he goes),
//            'kneel' (from `at`: down on one knee, the open ring box held up and forward, hearts), 'pucker' (leaning in,
//            eyes shut, lips out), 'pose' (the photo: chest out, the ring box up). `hearts` (s) pops hearts over any pose;
//            `ring` shows the ring box in his right paw.
//            Guests (seated in the pews unless `stand`): `stare` [x, z] (every guest turns to it), `gasp` (paws on
//            cheeks), `cheer` (paws up, clapping on the beat), `clap`, `stand` (on their feet by the pews), `hearts` (s),
//            `stop` (s: frozen from then), `noguests`, `clear` [[x, z, r]] (no guest there: lenses, marks).
//            `doors` (0 shut .. 1 wide open, or [s0, s1, a, b]: from a to b between s0 and s1 s into the shot): the leaves
//            swing inwards and sunlight pours down the aisle. `doorSign` (s: a STOP sign pops up in the right leaf's
//            window from outside), `petals` (pink petals drifting down the aisle), `rice` ([s, z]: the guests throw a
//            shower of petals over the aisle at z), `candles` (flicker, default on), `noStands` / `noCake` (hide the candle stands and
//            flower pedestals / the cake for a lens that would look through them), `key` [x, y, z, r, g, b].
import { mapKit } from './mapkit.js';

export const WEDDING = {
  BRIDE: [-0.5, -2.9], GROOM: [0.5, -2.9], OFFICIANT: [0, -3.95], FLOWER: [-1.4, -2.35], CAKE: [2.85, -3.35],
  ARCH_Z: -4.55, ARCH_W: 2.7, ARCH_H: 2.95, AISLE: [0.62, -3.5, 10.8], DOORS: [0, 11.0], DOOR_W: 1.1, DOOR_H: 2.9,
  WIN: [0.38, 0.7, 1.45],   // the doors' windows: half width, bottom and top (a chibi face at the glass fills one: his eyes sit at ~0.95 m)
  PEWS: { z: [-0.55, 0.9, 2.35, 3.8, 5.25, 6.7], x: [0.98, 3.7], SEAT: 0.34, BACK: 0.76 },
  WALL_X: 5.6, BACK_Z: -6.2, CEIL: 7.2,
};

// the STOP sign's face: a white-rimmed red octagon with STOP in white block capitals (canvas, 48 px)
export function drawStop(x) {
  x.fillStyle = '#ffffff'; x.fillRect(0, 0, 48, 48);
  const oct = (r, col) => { x.fillStyle = col; x.beginPath(); for (let i = 0; i < 8; i++) { const a = (i + 0.5) / 8 * Math.PI * 2; x[i ? 'lineTo' : 'moveTo'](24 + Math.cos(a) * r, 24 + Math.sin(a) * r); } x.fill(); };
  oct(24, '#ffffff'); oct(21, '#d8202c');
  x.fillStyle = '#ffffff'; x.font = 'bold 15px monospace'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('STOP', 24, 25);
}

export function buildWeddingMaps(K) {
  const k = mapKit(K);
  const { THREE, mat, tex, px, noise, box, TAU, PI, hash, beat, grad, cyl, cone, at, rot, flat, lights, pt, fall } = k;
  const M = (c, o = {}) => mat({ color: c, ...o }), glow = c => mat({ color: c, unlit: 1 });
  const cl = x => Math.max(0, Math.min(1, x)), sm = x => { x = cl(x); return x * x * (3 - 2 * x); };
  const shotT = (t, P) => P.t0 != null ? t - P.t0 : 0;
  const cleared = (P, x, z) => (P.clear || []).some(([cx, cz, r]) => (x - cx) ** 2 + (z - cz) ** 2 < r * r);
  const ico = (r, d, m) => new THREE.Mesh(new THREE.IcosahedronGeometry(r, d), m);
  const { GROOM, CAKE, ARCH_Z, ARCH_W, ARCH_H, AISLE, DOORS, DOOR_W, DOOR_H, WIN, PEWS, WALL_X, BACK_Z, CEIL } = WEDDING;

  // ---------- a heart: two balls and a cone (the swoon's, the guests') ----------
  const heartM = mat({ color: 0xff5fa2, unlit: 0.85 });
  function heart() {
    const h = new THREE.Group();
    h.add(at(ico(0.07, 0, heartM), -0.055, 0, 0)); h.add(at(ico(0.07, 0, heartM), 0.055, 0, 0));
    const tip = at(cone(0.09, 0.13, 4, heartM), 0, -0.08, 0); tip.rotation.x = PI; h.add(tip);
    return h;
  }

  // ---------- the guests: box pets in their wedding best (pastel suits and dresses, hats, bow ties) ----------
  const FURS = [0xd8a868, 0xe8d8c0, 0xb08a60, 0xf2eee6, 0xc8c0d0, 0xe0c8a0, 0xf0dcc0, 0xd0b090];   // light furs: dark ones read as black boxes indoors
  const SUITS = [0x9ab8e8, 0xf4b8c8, 0xb8e0c0, 0xe8d890, 0xc8b0e8, 0xf0c8a0, 0xa8d8e0, 0xe8a8b8];
  function guest(i) {
    const g = new THREE.Group(), F = M(FURS[i % FURS.length]), kind = i % 3, suit = M(SUITS[(i * 3) % SUITS.length]);
    const body = new THREE.Group(); g.add(body);
    body.add(at(box(0.4, 0.46, 0.28, suit), 0, 0.33, 0));
    if (i % 2) body.add(at(box(0.46, 0.14, 0.32, suit), 0, 0.12, 0));
    else { body.add(at(box(0.12, 0.2, 0.02, M(0xf8f8f8)), 0, 0.42, 0.145)); body.add(at(box(0.1, 0.04, 0.03, M(0x2a2a30)), 0, 0.53, 0.15)); }
    const legs = [-1, 1].map(s => { const l = at(new THREE.Group(), s * 0.1, 0.1, 0.02); l.add(at(box(0.12, 0.2, 0.13, suit), 0, -0.05, 0)); l.add(at(box(0.12, 0.08, 0.16, M(0x3a3038)), 0, -0.14, 0.02)); body.add(l); return l; });
    const arms = [-1, 1].map(s => { const a = at(new THREE.Group(), s * 0.23, 0.52, 0); a.add(at(box(0.09, 0.3, 0.09, suit), 0, -0.13, 0)); a.add(at(box(0.08, 0.08, 0.08, F), 0, -0.3, 0)); body.add(a); return a; });
    const head = at(new THREE.Group(), 0, 0.8, 0); body.add(head);
    const skull = ico(0.24, 1, F); skull.scale.set(1, 0.9, 0.92); head.add(skull);
    const snout = at(ico(0.1, 1, M(0xf6ece0)), 0, -0.07, 0.19); snout.scale.set(1.1, 0.8, 0.9); head.add(snout);
    head.add(at(ico(0.035, 0, M(0x151515)), 0, -0.03, 0.28));
    for (const e of [-1, 1]) {
      head.add(at(ico(0.038, 0, M(0x0e0e0e)), e * 0.1, 0.05, 0.19));
      head.add(at(ico(0.012, 0, glow(0xffffff)), e * 0.1 + 0.012, 0.065, 0.225));
      head.add(kind === 0 ? rot(at(cone(0.08, 0.2, 4, F), e * 0.15, 0.27, 0), 0, 0, -e * 0.25) : kind === 1 ? at(box(0.08, 0.3, 0.06, F), e * 0.1, 0.33, 0) : rot(at(box(0.07, 0.24, 0.16, F), e * 0.24, 0.02, 0), 0, 0, e * 0.3));
    }
    const hk = i % 5, hc = M([0x2a2430, 0xf4a0c0, 0x9ab8e8, 0xfff4f8, 0xe8d890][i % 5]);
    if (hk === 0) { head.add(at(cyl(0.2, 0.2, 0.02, 10, hc), 0, 0.2, -0.02)); head.add(at(cyl(0.12, 0.12, 0.2, 8, hc), 0, 0.3, -0.02)); }
    else if (hk === 1) { const f = at(cyl(0.11, 0.11, 0.03, 10, hc), 0.1, 0.22, 0); f.rotation.z = -0.35; head.add(f); head.add(rot(at(box(0.02, 0.2, 0.02, M(0xffffff)), 0.16, 0.32, -0.02), 0, 0, -0.5)); }
    else if (hk === 2) head.add(at(cyl(0.12, 0.13, 0.08, 10, hc), 0, 0.23, -0.02));
    else if (hk === 3) for (let q = 0; q < 5; q++) head.add(at(ico(0.04, 0, M([0xff8ab8, 0xffffff, 0xffc8dc][q % 3])), -0.16 + q * 0.08, 0.21, 0.02));
    const hrt = heart(); hrt.visible = false; g.add(hrt);
    return { g, body, head, arms, legs, heart: hrt, i };
  }

  // ---------- the groom: the "Dai Dai" keeper's bulldog, now in a black tuxedo ----------
  function groomPet() {
    const g = new THREE.Group();
    const jacket = M(0x3c3c4c), shirt = M(0xf8f8f8, { unlit: 0.15 }), trou = M(0x30303e),   // charcoal: pure black read as a flat slab (the reviewer)
      fur = M(0xc9a27a), furL = M(0xefdcc4), dark = M(0x16121a), shoe = M(0x0c0c10);
    const hips = at(new THREE.Group(), 0, 0.5, 0); g.add(hips);
    const torso = new THREE.Group(); hips.add(torso);
    torso.add(at(box(0.7, 0.58, 0.46, jacket), 0, 0.32, 0)); torso.add(at(box(0.66, 0.16, 0.44, trou), 0, 0.0, 0));
    torso.add(at(box(0.26, 0.5, 0.02, shirt), 0, 0.36, 0.235));
    for (const s of [-1, 1]) torso.add(rot(at(box(0.1, 0.36, 0.02, M(0x6a6a7c)), s * 0.14, 0.42, 0.242), 0, 0, s * 0.35));
    torso.add(at(box(0.16, 0.06, 0.04, dark), 0, 0.58, 0.25));
    for (const s of [-1, 1]) torso.add(rot(at(box(0.07, 0.07, 0.04, dark), s * 0.07, 0.58, 0.25), 0, 0, PI / 4));
    for (let q = 0; q < 4; q++) torso.add(at(ico(0.035, 0, M(q % 2 ? 0xffffff : 0xff8ab8)), -0.26 + (q % 2) * 0.05, 0.5 + Math.floor(q / 2) * 0.05, 0.25));
    const head = at(new THREE.Group(), 0, 0.84, 0.03); torso.add(head);
    const skull = ico(0.31, 1, fur); skull.scale.set(1.18, 0.92, 1.0); head.add(skull);
    const muz = at(ico(0.17, 1, furL), 0, -0.11, 0.21); muz.scale.set(1.35, 0.78, 0.85); head.add(muz);
    for (const s of [-1, 1]) { const j = at(ico(0.1, 1, furL), s * 0.15, -0.17, 0.18); j.scale.set(1, 1.1, 0.9); head.add(j); }
    head.add(at(ico(0.065, 0, dark), 0, -0.03, 0.36));
    for (const s of [-1, 1]) head.add(at(cone(0.022, 0.07, 4, M(0xffffff)), s * 0.08, -0.2, 0.33));
    const lips = at(ico(0.06, 0, M(0xff7aa8, { unlit: 0.4 })), 0, -0.19, 0.37); lips.scale.set(1.4, 0.8, 1.2); lips.visible = false; head.add(lips);
    const eyes = [-1, 1].map(s => { const e = at(new THREE.Group(), s * 0.13, 0.06, 0.26); e.add(ico(0.048, 0, dark)); e.add(at(ico(0.014, 0, glow(0xffffff)), 0.014, 0.016, 0.04)); head.add(e); return e; });
    for (const s of [-1, 1]) head.add(rot(at(box(0.14, 0.035, 0.04, dark), s * 0.13, 0.14, 0.26), 0, 0, -s * 0.18));
    for (const s of [-1, 1]) head.add(rot(at(box(0.12, 0.16, 0.05, M(0x8a6a4a)), s * 0.3, 0.2, -0.02), 0, 0, s * 0.9));
    const arms = [-1, 1].map(s => {
      const sh = at(new THREE.Group(), s * 0.39, 0.52, 0); torso.add(sh);
      sh.add(at(box(0.17, 0.34, 0.17, jacket), 0, -0.14, 0));
      const el = at(new THREE.Group(), 0, -0.29, 0); sh.add(el);
      el.add(at(box(0.15, 0.2, 0.15, jacket), 0, -0.08, 0)); el.add(at(box(0.16, 0.04, 0.16, shirt), 0, -0.19, 0));
      el.add(at(box(0.17, 0.16, 0.15, fur), 0, -0.28, 0));
      return { sh, el };
    });
    const legs = [-1, 1].map(s => {
      const hp = at(new THREE.Group(), s * 0.18, 0, 0); hips.add(hp);
      hp.add(at(box(0.21, 0.27, 0.23, trou), 0, -0.12, 0));
      const kn = at(new THREE.Group(), 0, -0.25, 0); hp.add(kn);
      kn.add(at(box(0.17, 0.21, 0.17, trou), 0, -0.1, 0)); kn.add(at(box(0.2, 0.09, 0.32, shoe), 0, -0.21, 0.06));
      return { hp, kn };
    });
    // the ring box, open, in the right paw: red velvet, a gold ring with a stone that glints
    const ringBox = new THREE.Group(); arms[1].el.add(ringBox); ringBox.position.set(0, -0.42, 0.08); ringBox.scale.setScalar(1.6);
    ringBox.add(box(0.16, 0.09, 0.14, M(0xc81e3a))); ringBox.add(at(box(0.16, 0.12, 0.02, M(0xc81e3a)), 0, 0.1, -0.07));
    ringBox.add(at(box(0.12, 0.02, 0.1, M(0xfff0f4)), 0, 0.046, 0));
    const ring = at(new THREE.Mesh(new THREE.TorusGeometry(0.035, 0.01, 4, 10), M(0xffd24a, { unlit: 0.5 })), 0, 0.085, 0); ringBox.add(ring);
    const stone = at(ico(0.022, 0, glow(0xe8fbff)), 0, 0.125, 0); ringBox.add(stone);
    const hearts = new THREE.Group(); g.add(hearts);
    for (let q = 0; q < 3; q++) hearts.add(heart());
    return { g, hips, torso, head, arms, legs, hearts, eyes, lips, ringBox, stone };
  }
  // the groom's pose for this frame, set from scratch (pure in t); he stands at (x, z), facing `yaw` (deg, 0 = +z)
  function poseGroom(gp, Gf, s) {
    const { g, hips, torso, head, arms, legs, hearts, eyes, lips, ringBox, stone } = gp;
    const x0 = Gf.x ?? GROOM[0], z0 = Gf.z ?? GROOM[1], pose = Gf.pose || 'stand', at0 = Gf.at ?? 0, u = s - at0;
    g.visible = !Gf.hide; g.scale.setScalar(Gf.scale ?? 0.82);
    g.position.set(x0, 0, z0); g.rotation.set(0, (Gf.yaw ?? -90) * PI / 180, 0);
    hips.position.set(0, 0.5, 0); hips.rotation.set(0, 0, 0); torso.rotation.set(0, 0, 0); head.rotation.set(0, 0, 0);
    arms.forEach(a => { a.sh.rotation.set(0, 0, 0); a.el.rotation.set(0, 0, 0); });
    legs.forEach(l => { l.hp.rotation.set(0, 0, 0); l.kn.rotation.set(0, 0, 0); });
    eyes.forEach(e => e.scale.set(1, 1, 1)); hearts.visible = false; lips.visible = false;
    ringBox.visible = !!Gf.ring; stone.scale.setScalar(1 + 0.6 * Math.abs(Math.sin(s * 9)));
    const breathe = Math.sin(s * 2.2) * 0.015;
    const dreamy = e => eyes.forEach(ey => ey.scale.set(1, 1 - 0.6 * e, 1));
    const faceTo = (tx, tz, e = 1) => { const a = Math.atan2(tx - g.position.x, tz - g.position.z), d = ((a - g.rotation.y + PI) % TAU + TAU) % TAU - PI; g.rotation.y += e * d; };
    const walkTo = fast => {   // along from (x0, z0) to `to` over [at, at + dur]
      const [x1, z1] = Gf.to || [x0, z0], dur = Gf.dur || 1.5, e = cl(u / dur), p = fast ? e : sm(e);
      g.position.set(x0 + (x1 - x0) * p, 0, z0 + (z1 - z0) * p);
      if (x1 !== x0 || z1 !== z0) g.rotation.y = Math.atan2(x1 - x0, z1 - z0);
      const moving = u > 0 && e < 1, f = fast ? 11 : 7, swing = moving ? Math.sin(s * f) : 0;
      legs.forEach((l, i) => { l.hp.rotation.x = (i ? 1 : -1) * swing * (fast ? 0.9 : 0.45); l.kn.rotation.x = Math.max(0, (i ? -1 : 1) * swing) * (fast ? 0.9 : 0.4); });
      hips.position.y = 0.5 + Math.abs(swing) * (fast ? 0.07 : 0.03); torso.rotation.x = fast ? 0.28 : 0.05;
      g.rotation.z = (fast ? 0.05 : 0.09) * swing;
      return swing;
    };
    if (pose === 'stand') {
      torso.rotation.x = breathe; arms.forEach((a, i) => { const sd = i ? 1 : -1; a.sh.rotation.set(0.05, 0, sd * 0.14); a.el.rotation.x = -0.25; });
    } else if (pose === 'hands') {   // both paws forward at chest height, holding the bride's
      torso.rotation.x = breathe; head.rotation.x = -0.06;
      arms.forEach((a, i) => { const sd = i ? 1 : -1; a.sh.rotation.set(-1.05, 0, sd * 0.12); a.el.rotation.x = -0.35; });
    } else if (pose === 'swoon') {   // paws on his heart, dreamy eyes, a sway: in love at first sight
      const e = sm(u / 0.45), sway = Math.sin(s * 3.2) * 0.1;
      if (Gf.look) faceTo(Gf.look[0], Gf.look[1], e);
      g.rotation.z = sway * e; head.rotation.set(-0.15 * e, 0, 0.28 * e); torso.rotation.x = -0.12 * e;
      arms.forEach((a, i) => { const sd = i ? 1 : -1; a.sh.rotation.set(-1.0 * e, 0, sd * (0.3 - 0.7 * e)); a.el.rotation.set(-1.45 * e, 0, 0); });
      dreamy(e);
    } else if (pose === 'walk' || pose === 'run') {
      const run = pose === 'run', swing = walkTo(run);
      arms.forEach((a, i) => { const sd = i ? 1 : -1; a.sh.rotation.set(-sd * swing * (run ? 0.9 : 0.4) - (i && Gf.ring ? 1.1 : 0), 0, sd * 0.2); a.el.rotation.x = run ? -1.2 : -0.35; });
      if (!run) dreamy(0.8);
    } else if (pose === 'kneel') {   // down on one knee, the open ring box up and forward
      const e = sm(u / 0.5);
      hips.position.y = 0.5 - 0.27 * e;   // down on one knee: the right knee on the floor (0.2 read as standing)
      legs[0].hp.rotation.x = -1.5 * e; legs[0].kn.rotation.x = 1.5 * e;
      legs[1].hp.rotation.x = 0.35 * e; legs[1].kn.rotation.x = 1.75 * e;
      torso.rotation.x = -0.12 * e; head.rotation.set(-0.32 * e, 0, 0.12 * e);
      arms[1].sh.rotation.set(-1.2 * e, 0, 0.12); arms[1].el.rotation.x = -0.25 * e;
      arms[0].sh.rotation.set(-1.0 * e, 0, -0.55 * e); arms[0].el.rotation.x = -1.5 * e;
      dreamy(0.7 * e); ringBox.visible = true;
    } else if (pose === 'pucker') {   // leaning in for the kiss, eyes shut, lips out
      const e = sm(u / 0.4);
      torso.rotation.x = 0.38 * e; head.rotation.x = -0.25 * e; hips.position.y = 0.5 - 0.02 * e;
      arms.forEach((a, i) => { const sd = i ? 1 : -1; a.sh.rotation.set(-0.75 * e, 0, sd * 0.45 * e); a.el.rotation.x = -0.9 * e; });
      eyes.forEach(ey => ey.scale.set(1.1, 1 - 0.85 * e, 1)); lips.visible = e > 0.2;
    } else if (pose === 'offer') {   // standing, the open ring box held straight out at chest height, the other paw on his heart
      const e = sm(u / 0.4);
      torso.rotation.x = 0.06 * e + breathe; head.rotation.set(-0.12 * e, 0, 0.1 * e);
      arms[1].sh.rotation.set(-1.35 * e, 0, 0.05); arms[1].el.rotation.x = -0.15 * e;
      arms[0].sh.rotation.set(-1.0 * e, 0, -0.55 * e); arms[0].el.rotation.x = -1.5 * e;
      dreamy(0.6 * e); ringBox.visible = true;
    } else if (pose === 'pose') {   // the photo: chest out, the ring box held up, the other paw on his hip
      torso.rotation.x = -0.1; head.rotation.set(-0.12, 0, 0.1);
      arms[1].sh.rotation.set(-2.2, 0, 0.35); arms[1].el.rotation.x = -0.2;
      arms[0].sh.rotation.set(0.1, 0, -0.9); arms[0].el.rotation.set(-1.9, 0, 0);
      dreamy(0.5); ringBox.visible = true;
    }
    if (Gf.look && pose !== 'swoon' && pose !== 'walk' && pose !== 'run') faceTo(Gf.look[0], Gf.look[1]);
    const hs = Gf.hearts ?? (['swoon', 'kneel', 'pose', 'walk', 'run', 'offer'].includes(pose) ? at0 : null);
    if (hs != null && s >= hs) {
      hearts.visible = true; const a0 = s - hs;
      hearts.children.forEach((h, q) => {
        const a2 = a0 - q * 0.3, vis = a2 > 0; h.visible = vis; if (!vis) return;
        const pop = cl(a2 / 0.2), cyc = (a2 % 1.5) / 1.5;
        h.position.set((q - 1) * 0.3, 1.92 + 0.4 * cyc + hips.position.y - 0.5, 0.1);   // above his head (at 1.62 they sat on his skull)
        h.scale.setScalar(1.9 * (0.5 + 0.6 * pop) * (1 + 0.12 * Math.sin(a2 * 10)) * (cyc > 0.8 ? (1 - cyc) * 5 : 1));
      });
    }
  }

  // ======================================================================================================================
  function wedding() {
    const G = new THREE.Group();
    const FZ0 = BACK_Z, FZ1 = DOORS[1];
    // ---------------- the floor: pale boards; the aisle runner with pink petals; the altar's round rug ----------------
    const boardT = tex(16, 16, (x, r) => { px(x, '#d8bf98', 0, 0, 16, 16); for (let j = 0; j < 16; j += 4) px(x, '#c4a880', 0, j, 16, 1); noise(x, r, 16, 16, ['#dcc49e', '#d0b690', '#e0caa4'], 40); }, 2201);
    G.add(flat(2 * WALL_X, FZ1 - FZ0, mat({ map: boardT, rep: [WALL_X, (FZ1 - FZ0) / 2] }), 0, 0, (FZ0 + FZ1) / 2));
    const runnerT = tex(8, 8, (x, r) => { px(x, '#fbf8f4', 0, 0, 8, 8); noise(x, r, 8, 8, ['#f6f2ee', '#fffdfb'], 10); }, 2202);
    G.add(flat(2 * AISLE[0], AISLE[2] - AISLE[1], mat({ map: runnerT, rep: [1, 8] }), 0, 0.006, (AISLE[1] + AISLE[2]) / 2));
    const petalM = M(0xff9ec4, { unlit: 0.35 }), petalW = M(0xfff0f6, { unlit: 0.35 });
    for (let i = 0; i < 90; i++) { const p = flat(0.07, 0.05, i % 4 ? petalM : petalW, (hash(i, 3) - 0.5) * 2 * AISLE[0] * 0.95, 0.012, AISLE[1] + hash(i, 4) * (AISLE[2] - AISLE[1])); p.rotation.z = hash(i, 5) * PI; G.add(p); }
    const rug = new THREE.Mesh(new THREE.CircleGeometry(2.1, 20), M(0xf2e4ea)); rug.rotation.x = -PI / 2; rug.position.set(0, 0.009, -3.4); G.add(rug);
    // ---------------- the walls, the ceiling, the beams ----------------
    const wallT = tex(8, 8, (x, r) => { px(x, '#f6f1ea', 0, 0, 8, 8); noise(x, r, 8, 8, ['#f2ece4', '#faf6f0'], 8); }, 2203);
    const wainT = tex(8, 8, x => { px(x, '#f2d6de', 0, 0, 8, 8); px(x, '#e8c4d0', 0, 0, 1, 8); }, 2204);
    const D = FZ1 - FZ0, cz = (FZ0 + FZ1) / 2;
    for (const s of [-1, 1]) {
      G.add(rot(at(new THREE.Mesh(new THREE.PlaneGeometry(D, CEIL), mat({ map: wallT, rep: [D / 2, CEIL / 2] })), s * WALL_X, CEIL / 2, cz), 0, -s * PI / 2));
      G.add(rot(at(new THREE.Mesh(new THREE.PlaneGeometry(D, 1.0), mat({ map: wainT, rep: [D / 0.6, 1] })), s * (WALL_X - 0.01), 0.5, cz), 0, -s * PI / 2));
    }
    G.add(at(new THREE.Mesh(new THREE.PlaneGeometry(2 * WALL_X, CEIL), mat({ map: wallT, rep: [WALL_X, CEIL / 2] })), 0, CEIL / 2, FZ0));
    G.add(at(new THREE.Mesh(new THREE.PlaneGeometry(2 * WALL_X, 1.0), mat({ map: wainT, rep: [2 * WALL_X / 0.6, 1] })), 0, 0.5, FZ0 + 0.01));
    const ceil = new THREE.Mesh(new THREE.PlaneGeometry(2 * WALL_X + 0.3, D + 0.3), M(0xefe6da)); ceil.rotation.x = PI / 2; ceil.position.set(0, CEIL, cz); G.add(ceil);
    for (let z = FZ0 + 1.6; z < FZ1; z += 2.6) G.add(at(box(2 * WALL_X, 0.28, 0.24, M(0x6a4a34)), 0, CEIL - 0.3, z));
    // the back wall round the double doors' opening
    const sideW = WALL_X - DOOR_W;
    for (const s of [-1, 1]) G.add(rot(at(new THREE.Mesh(new THREE.PlaneGeometry(sideW, CEIL), mat({ map: wallT, rep: [sideW / 2, CEIL / 2] })), s * (DOOR_W + sideW / 2), CEIL / 2, FZ1), 0, PI));
    G.add(rot(at(new THREE.Mesh(new THREE.PlaneGeometry(2 * DOOR_W, CEIL - DOOR_H), mat({ map: wallT, rep: [DOOR_W, 2] })), 0, DOOR_H + (CEIL - DOOR_H) / 2, FZ1), 0, PI));
    for (const s of [-1, 1]) G.add(rot(at(new THREE.Mesh(new THREE.PlaneGeometry(sideW, 1.0), mat({ map: wainT, rep: [sideW / 0.6, 1] })), s * (DOOR_W + sideW / 2), 0.5, FZ1 - 0.01), 0, PI));
    G.add(at(box(2 * DOOR_W + 0.3, 0.18, 0.2, M(0xffffff)), 0, DOOR_H + 0.09, FZ1 - 0.06));
    const backing = M(0xf2ece4);   // a skin behind the back wall's pieces: their seams showed the sky (the reviewer)
    const facadeT = tex(8, 8, x => { px(x, '#f8f4ec', 0, 0, 8, 8); px(x, '#e2dacc', 0, 7, 8, 1); }, 2206);   // white clapboard
    for (const s of [-1, 1]) G.add(at(new THREE.Mesh(new THREE.PlaneGeometry(sideW + 0.2, CEIL + 1.2), mat({ map: facadeT, rep: [1, (CEIL + 1.2) / 0.35] })), s * (DOOR_W + sideW / 2), (CEIL + 1.2) / 2, FZ1 + 0.09));
    G.add(at(new THREE.Mesh(new THREE.PlaneGeometry(2 * DOOR_W + 0.4, CEIL - DOOR_H + 1.2), mat({ map: facadeT, rep: [1, (CEIL - DOOR_H + 1.2) / 0.35] })), 0, DOOR_H + (CEIL - DOOR_H + 1.2) / 2, FZ1 + 0.09));
    G.add(at(box(2 * DOOR_W + 0.5, 0.22, 0.12, M(0xffffff)), 0, DOOR_H + 0.11, FZ1 + 0.14)); for (const s of [-1, 1]) G.add(at(box(0.18, DOOR_H, 0.12, M(0xffffff)), s * (DOOR_W + 0.09), DOOR_H / 2, FZ1 + 0.14));   // the outer door frame
    G.add(at(new THREE.Mesh(new THREE.CircleGeometry(0.55, 12), mat({ color: 0xc8e4ff, unlit: 0.7 })), 0, DOOR_H + 1.6, FZ1 + 0.11));   // a round window over the doors
    for (const s of [-1, 1]) G.add(rot(at(new THREE.Mesh(new THREE.PlaneGeometry(sideW + 0.2, CEIL + 0.2), backing), s * (DOOR_W + sideW / 2), CEIL / 2, FZ1 + 0.04), 0, PI));
    G.add(rot(at(new THREE.Mesh(new THREE.PlaneGeometry(2 * DOOR_W + 0.4, CEIL - DOOR_H + 0.2), backing), 0, DOOR_H + (CEIL - DOOR_H) / 2, FZ1 + 0.04), 0, PI));
    for (const s of [-1, 1]) G.add(at(box(0.15, DOOR_H, 0.2, M(0xffffff)), s * (DOOR_W + 0.07), DOOR_H / 2, FZ1 - 0.06));
    // outside: a sunny lawn, a white picket fence, trees and a blue sky (self-lit: seen through the doors)
    const skyM = mat({ map: grad([[0, '#6ab4f0'], [0.6, '#a8d8f8'], [1, '#e4f4ff']]), unlit: 1 });
    G.add(rot(at(new THREE.Mesh(new THREE.PlaneGeometry(24, 12), skyM), 0, 4.5, FZ1 + 9), 0, PI));
    G.add(flat(24, 10, M(0x7ac85a, { unlit: 0.7 }), 0, -0.01, FZ1 + 4.2));
    G.add(flat(1.6, 4.5, M(0xe8e0d0, { unlit: 0.7 }), 0, 0.0, FZ1 + 2.3));
    for (let x = -8; x <= 8; x += 0.32) if (Math.abs(x) > 1.0) G.add(at(box(0.08, 0.7, 0.04, M(0xffffff, { unlit: 0.7 })), x, 0.35, FZ1 + 5.2));
    G.add(at(box(16, 0.06, 0.03, M(0xffffff, { unlit: 0.7 })), 0, 0.5, FZ1 + 5.19));
    for (const [x, zz, r] of [[-4.2, 8.2, 1.4], [3.6, 7.6, 1.2], [6.8, 8.8, 1.6], [-7.2, 7.9, 1.3]]) { G.add(at(box(0.25, 1.8, 0.25, M(0x7a5a3a, { unlit: 0.5 })), x, 0.9, FZ1 + zz)); G.add(at(ico(r, 1, M(0x5aa84a, { unlit: 0.6 })), x, 2.3 + r * 0.5, FZ1 + zz)); }
    // the doors: two leaves hinged at the frame, a window in each, swinging inwards (towards -z)
    const leafM = M(0xfaf8f4), trimM = M(0xe6dccc), glassM = mat({ color: 0xd8f0ff, unlit: 0.6, see: 0.8 });
    const [ww, w0, w1] = WIN, gap = (DOOR_W - 2 * ww) / 2;
    const leaves = [-1, 1].map(s => {
      const hinge = at(new THREE.Group(), s * DOOR_W, 0, FZ1 - 0.08); G.add(hinge);
      const L = new THREE.Group(); L.position.set(-s * DOOR_W / 2, 0, 0); hinge.add(L);
      L.add(at(box(DOOR_W, w0, 0.07, leafM), 0, w0 / 2, 0)); L.add(at(box(DOOR_W, DOOR_H - w1, 0.07, leafM), 0, w1 + (DOOR_H - w1) / 2, 0));
      for (const q of [-1, 1]) L.add(at(box(gap, w1 - w0, 0.07, leafM), q * (ww + gap / 2), (w0 + w1) / 2, 0));
      L.add(at(box(2 * ww, w1 - w0, 0.01, glassM), 0, (w0 + w1) / 2, 0));
      L.add(at(box(DOOR_W * 0.7, 0.5, 0.08, trimM), 0, 0.45, 0)); L.add(at(box(DOOR_W * 0.7, 0.8, 0.08, trimM), 0, 2.3, 0));
      L.add(at(ico(0.05, 0, M(0xd8b44a)), -s * DOOR_W * 0.38, 1.0, -0.06));
      for (let q = 0; q < 6; q++) L.add(at(ico(0.06, 0, M(q % 2 ? 0xffffff : 0xff9ec4)), -0.25 + q * 0.1, 1.9, -0.05));
      return { hinge, L };
    });
    // the STOP sign that pops up in the right leaf's window, from outside
    const signG = new THREE.Group(); leaves[1].L.add(signG);
    {
      const face = mat({ map: tex(48, 48, x => drawStop(x), 2205), unlit: 0.7 });
      const oct = new THREE.CircleGeometry(0.3, 8, PI / 8); signG.add(at(new THREE.Mesh(oct, face), 0, 0, 0.01)); signG.add(rot(at(new THREE.Mesh(oct, face), 0, 0, -0.01), 0, PI, 0));
      signG.add(at(box(0.05, 0.9, 0.05, M(0x9a9aa4)), 0, -0.6, 0));
      signG.position.set(0, 1.3, 0.2); signG.rotation.y = PI;
    }
    // light spill down the aisle when the doors open
    const spill = flat(2.2, 6.5, mat({ color: 0xfff6d8, unlit: 0.9, see: 0.55 }), 0, 0.014, FZ1 - 3.3); G.add(spill);
    // ---------------- the stained-glass windows, the rose window ----------------
    const PANES = ['#ff9ec4', '#9ad0ff', '#fff0a0', '#b8f0c0', '#d8b8ff', '#ffc8a0'];
    const glassT = seed => tex(12, 24, x => {   // leaded diamond quarries, a rose in the middle (a grid of squares read as pastel skyscrapers)
      for (let j = 0; j < 24; j++) for (let i = 0; i < 12; i++) {
        const u = (i + j) % 6, v = ((i - j) % 6 + 6) % 6;
        const lead = u === 0 || v === 0, rose = Math.hypot(i - 5.5, j - 9.5) < 3.2;
        px(x, lead ? '#5a4a60' : rose ? (Math.hypot(i - 5.5, j - 9.5) < 1.6 ? '#fff0a0' : '#ff9ec4') : ['#d8f0ff', '#e8dcff', '#fff4d8'][Math.floor(hash(Math.floor((i + j) / 6) + seed, Math.floor((i - j + 24) / 6)) * 3)], i, j, 1, 1);
      }
    }, 2210 + seed);
    [-2.2, 1.4, 5.0, 8.4].forEach((z, q) => [-1, 1].forEach(s => {
      const w = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 2.6), mat({ map: glassT(q * 7 + (s > 0 ? 3 : 0)), unlit: 0.85 }));
      w.position.set(s * (WALL_X - 0.02), 2.9, z); w.rotation.y = -s * PI / 2; G.add(w);
      const tip = new THREE.Mesh(new THREE.CircleGeometry(0.55, 3), mat({ map: glassT(q + 11), unlit: 0.85 })); tip.position.set(s * (WALL_X - 0.02), 4.35, z); tip.rotation.set(0, -s * PI / 2, PI / 2); G.add(tip);
      G.add(at(box(0.06, 0.1, 1.3, M(0xffffff)), s * (WALL_X - 0.05), 1.55, z));
      for (const dz of [-0.6, 0.6]) G.add(at(box(0.07, 2.9, 0.08, M(0xffffff)), s * (WALL_X - 0.04), 3.0, z + dz));   // the white frame
    }));
    const roseT = tex(24, 24, x => {
      for (let j = 0; j < 24; j++) for (let i = 0; i < 24; i++) {
        const dx = i - 11.5, dy = j - 11.5, r = Math.hypot(dx, dy), a = (Math.atan2(dy, dx) + PI) / TAU * 8;
        if (r > 11.5) continue;
        px(x, r > 10 ? '#6a5a70' : r < 3 ? '#fff0a0' : Math.abs(a - Math.round(a)) < 0.12 ? '#6a5a70' : (Math.floor(a) % 2 ? (r > 6.5 ? '#9ad0ff' : '#ff9ec4') : (r > 6.5 ? '#d8b8ff' : '#ffc8a0')), i, j, 1, 1);
      }
    }, 2220);
    G.add(at(new THREE.Mesh(new THREE.CircleGeometry(1.1, 16), mat({ map: roseT, unlit: 0.85 })), 0, 5.1, FZ0 + 0.02));
    // ---------------- the altar: the flower arch, the altar table, candle stands, flower pedestals ----------------
    const archM = M(0xffffff), FLOWERS = [0xff8ab8, 0xffffff, 0xffc8dc, 0xff5f9a, 0xfff0f6];
    for (const s of [-1, 1]) G.add(at(box(0.14, ARCH_H, 0.14, archM), s * ARCH_W / 2, ARCH_H / 2, ARCH_Z));
    for (let q = 0; q <= 16; q++) {
      const a = PI * q / 16, x = -Math.cos(a) * ARCH_W / 2, y = ARCH_H + Math.sin(a) * 0.55;
      G.add(at(ico(0.13, 0, M(FLOWERS[q % 5], { unlit: 0.25 })), x, y, ARCH_Z));
      if (q % 2) G.add(at(ico(0.08, 0, M(0x6ac06a)), x + 0.06, y - 0.1, ARCH_Z + 0.05));
    }
    for (const s of [-1, 1]) for (let q = 0; q < 9; q++) G.add(at(ico(0.1 + 0.03 * (q % 2), 0, M(FLOWERS[(q + 2) % 5], { unlit: 0.25 })), s * (ARCH_W / 2 + 0.06 * Math.sin(q)), 0.3 + q * 0.31, ARCH_Z + 0.05));
    G.add(at(box(1.4, 0.95, 0.6, M(0xf8f4f0)), 0, 0.475, ARCH_Z - 0.95)); G.add(at(box(1.5, 0.05, 0.7, M(0xe8d8e0)), 0, 0.97, ARCH_Z - 0.95));
    const flames = [], flameM = mat({ color: 0xffd060, unlit: 1 }), stands = new THREE.Group(); G.add(stands);   // candle stands and flower pedestals (`noStands` hides them for a lens behind them)
    for (const s of [-1, 1]) {
      stands.add(at(cyl(0.05, 0.08, 1.5, 6, M(0xd8b44a)), s * 2.05, 0.75, ARCH_Z + 0.2));
      for (const q of [-1, 0, 1]) {
        const y = 1.6 + (q === 0 ? 0.08 : 0);
        stands.add(at(cyl(0.03, 0.03, 0.22, 5, M(0xfff8ee)), s * 2.05 + q * 0.14, y, ARCH_Z + 0.2));
        const f = at(cone(0.025, 0.07, 4, flameM), s * 2.05 + q * 0.14, y + 0.15, ARCH_Z + 0.2); stands.add(f); flames.push(f);
      }
      stands.add(at(cyl(0.18, 0.12, 0.9, 6, M(0xffffff)), s * 3.2, 0.45, ARCH_Z + 0.4));
      for (let q = 0; q < 10; q++) stands.add(at(ico(0.12, 0, M(FLOWERS[q % 5], { unlit: 0.25 })), s * 3.2 + (hash(q, 9) - 0.5) * 0.5, 1.0 + hash(q, 10) * 0.35, ARCH_Z + 0.4 + (hash(q, 11) - 0.5) * 0.4));
    }
    // ---------------- the cake: three white tiers with pink roses, on a round skirted table ----------------
    const cake = at(new THREE.Group(), CAKE[0], 0, CAKE[1]); G.add(cake);
    cake.add(at(cyl(0.5, 0.45, 0.7, 10, M(0xf4ecf0)), 0, 0.35, 0));
    const icing = M(0xfffaf4, { unlit: 0.2 });
    [[0.44, 0.34, 0.86], [0.34, 0.3, 1.18], [0.24, 0.26, 1.46]].forEach(([r, h, y]) => {
      cake.add(at(cyl(r, r, h, 12, icing), 0, y, 0));
      for (let q = 0; q < 6; q++) { const a = q / 6 * TAU; cake.add(at(ico(0.05, 0, M(0xff8ab8, { unlit: 0.3 })), Math.sin(a) * r, y + h / 2 - 0.03, Math.cos(a) * r)); }
    });
    cake.add(at(box(0.05, 0.14, 0.03, M(0x2a2a30)), -0.05, 1.68, 0)); cake.add(at(box(0.06, 0.14, 0.04, M(0xffffff)), 0.05, 1.68, 0));
    // ---------------- the pews: white benches either side of the aisle, a pink bow on each aisle end ----------------
    const pewM = M(0xfbf8f2), bowM = M(0xff8ab8, { unlit: 0.3 });
    const len = PEWS.x[1] - PEWS.x[0], mid = (PEWS.x[0] + PEWS.x[1]) / 2;
    for (const z of PEWS.z) for (const s of [-1, 1]) {
      G.add(at(box(len, 0.06, 0.4, pewM), s * mid, PEWS.SEAT, z));
      G.add(at(box(len, 0.44, 0.05, pewM), s * mid, PEWS.SEAT + 0.2, z + 0.22));   // the backrest behind the sitters (they face -z)
      for (const e of [0, 1]) G.add(at(box(0.05, PEWS.BACK, 0.48, pewM), s * PEWS.x[e], PEWS.BACK / 2, z + 0.02));
      G.add(at(ico(0.08, 0, bowM), s * (PEWS.x[0] - 0.04), 0.62, z + 0.1));
      for (const q of [-1, 1]) G.add(at(ico(0.06, 0, bowM), s * (PEWS.x[0] - 0.04), 0.62, z + 0.1 + q * 0.09));
    }
    // ---------------- the guests: 2-3 per pew side, seated facing the altar ----------------
    const guests = []; let gi = 0;
    PEWS.z.forEach((z, r) => [-1, 1].forEach(s => [1.42, 2.3, 3.2].forEach((dx, q) => {
      if (hash(r * 7 + q, s + 5) < 0.16) return;
      const p = guest(gi++); G.add(p.g); guests.push({ p, x: s * dx, z: z - 0.02 });
    })));
    // ---------------- the groom ----------------
    const gp = groomPet(); G.add(gp.g);
    // ---------------- falling petals and the rice shower ----------------
    const nBefore = G.children.length;
    const petalFall = fall(G, 70, M(0xff9ec4, { unlit: 0.4 }), new THREE.PlaneGeometry(0.06, 0.045), { w: 3.2, top: 4.5, speed: 0.55, spin: 2.2, drift: 0.35, seed: 2230 });
    const petalGroup = G.children.slice(nBefore);
    const riceM = M(0xfff4f8, { unlit: 0.6 }), rice = [];
    for (let i = 0; i < 60; i++) { const m = new THREE.Mesh(new THREE.PlaneGeometry(0.05, 0.04), i % 3 ? riceM : petalM); m.visible = false; G.add(m); rice.push(m); }

    return {
      group: G, sky: grad([[0, '#fdf6ef'], [1, '#f2e6dc']]), shadowCol: 0xa8906c, indoor: true,
      light() { lights(0xc4b8b0, 0xcabaa8, [-0.45, -0.8, -0.35], 0xf0e4dc, [18, 60], 9); },   // 0xd8ccc4 + 0xfff0dc washed the lit faces out; 0xa89c98 left the back wall and the doors dark brown
      anim(t, P = {}) {
        const s0 = shotT(t, P), stopAt = P.stop, stopped = stopAt != null && s0 >= stopAt, s = stopped ? stopAt : s0, tf = t - s0 + s, bb0 = beat(tf);   // a photo freezes the whole chapel from stop
        // candles flicker, the petals drift
        flames.forEach((f, i) => { f.scale.set(1, 0.85 + 0.3 * Math.abs(Math.sin(t * 13 + i * 1.7)), 1); f.visible = P.candles !== false; });
        stands.visible = !P.noStands; cake.visible = !P.noCake;
        petalGroup.forEach(p => { p.visible = !!P.petals; });
        if (P.petals) { petalFall(tf); petalGroup.forEach(p => { p.position.z += 3.5; }); }
        // the doors
        let open = 0; const Dd = P.doors;
        if (typeof Dd === 'number') open = Dd;
        else if (Array.isArray(Dd)) { const [s0, s1, a, b2] = Dd; open = a + (b2 - a) * sm((s - s0) / Math.max(0.01, s1 - s0)); }
        leaves.forEach((l, i) => { l.hinge.rotation.y = (i ? 1 : -1) * 1.75 * open; });
        spill.visible = open > 0.3; spill.material.uniforms.uUnlit.value = 0.9 * cl((open - 0.3) / 0.5);
        if (open > 0.3) pt(2, 0, 2.2, FZ1 - 1.2, 1.4 * open, 1.3 * open, 1.1 * open);
        else pt(2, 0, 3.2, FZ1 - 2.4, 0.5, 0.45, 0.4);   // a warm fill on the back wall and the shut doors
        // the STOP sign in the window
        const ds = P.doorSign; signG.visible = ds != null && s >= ds;
        if (signG.visible) { const e = sm((s - ds) / 0.18); signG.position.y = 0.2 + 0.88 * e; signG.rotation.z = 0.12 * Math.sin((s - ds) * 9) * (1 - e); }
        // warm candle light at the altar
        pt(0, -2.05, 1.8, ARCH_Z + 0.5, 0.55, 0.42, 0.25); pt(1, 2.05, 1.8, ARCH_Z + 0.5, 0.55, 0.42, 0.25);
        if (P.key) pt(3, P.key[0], P.key[1], P.key[2], P.key[3], P.key[4], P.key[5]);
        // the rice shower: from both pew banks over the aisle at z, from s0
        const R = P.rice;
        rice.forEach((m, i) => {
          if (!R) { m.visible = false; return; }
          const [s0, rz] = R, a = s - s0 - (i % 10) * 0.05; m.visible = a >= 0 && a < 1.6; if (!m.visible) return;
          const side = i % 2 ? 1 : -1, x0 = side * (1.2 + hash(i, 1) * 1.6), z0 = rz + (hash(i, 2) - 0.5) * 2.4, vx = -side * (1.3 + hash(i, 3)), vy = 2.6 + hash(i, 4) * 1.4;
          m.position.set(x0 + vx * a, Math.max(0.02, 0.9 + vy * a - 4.9 * a * a), z0 + (hash(i, 5) - 0.5) * a); m.rotation.set(a * 9 + i, a * 7, i);
        });
        // the guests
        guests.forEach((q, i) => {
          const { p, x, z } = q, show = !P.noguests && !cleared(P, x, z); p.g.visible = show; if (!show) return;
          const standing = !!P.stand, bb = bb0 + i * 0.13, bounce = stopped ? 0 : Math.abs(Math.sin(bb * PI));
          p.g.position.set(x, standing ? 0 : PEWS.SEAT - 0.08, z + (standing ? 0.3 : 0));
          p.legs.forEach(l => { l.rotation.x = standing ? 0 : -1.35; });
          p.g.rotation.y = P.stare ? Math.atan2(P.stare[0] - x, P.stare[1] - z) : PI;
          p.body.position.y = (P.cheer || P.clap ? 0.03 : 0.012) * bounce; p.head.rotation.set(stopped ? 0 : 0.06 * bounce, 0, 0);
          const clapK = (P.cheer || P.clap) && !stopped ? Math.abs(Math.sin(bb * PI)) : 0;
          p.arms.forEach((a, k2) => {
            const sd = k2 ? 1 : -1;
            if (P.gasp) a.rotation.set(-2.3, 0, -sd * 0.55);
            else if (P.cheer) a.rotation.set(0.35, 0, sd * (2.45 + 0.25 * clapK));   // paws up in a V, waving on the beat (forward-up read as seated)
            else if (P.clap) a.rotation.set(-1.25, 0, -sd * (0.3 - 0.28 * clapK));
            else a.rotation.set(standing ? 0.05 : -0.55, 0, sd * 0.12);
          });
          const h = p.heart, ha = P.hearts != null ? s - P.hearts - (i % 4) * 0.12 : -1;
          h.visible = ha >= 0 && ha < 2.2;
          if (h.visible) { const pop = Math.min(1, ha / 0.18); h.position.set(0, 1.25 + ha * 0.4, 0); h.scale.setScalar(1.6 * (0.6 + 0.6 * pop) * (1 + 0.1 * Math.sin(ha * 12))); }
        });
        // the groom
        poseGroom(gp, P.groom || {}, s);
      },
    };
  }
  return { wedding: wedding() };
}
