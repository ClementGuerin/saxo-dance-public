// maps5.js: the "Dans le club" maps (Michou, 2026-09-25). Same contract as the other map files, pure in t:
//   kobflat  Kob's flat at night: a low floor sofa (seat top 0.1 m: the seated clips sit hips 0.16-0.2 m up), a TV with
//            a game running, a big window on the harbour where the yacht party flashes (FOMO), a cat tree. Shot flags:
//            `shake` (the bass through the walls: frames and lamp jump on each beat), `empty` (the pad left on the sofa).
//   yacht    a white yacht moored stern-to at a Saint-Tropez quay at sunset: teak aft deck (y = 0) with a DJ booth, string
//            lights, the VIP table (milk, juice, carrots: "pas d'bouteilles sur la table"), white sofas, a velvet rope at
//            the passerelle, pet party guests in white, jet-skis circling in the harbour, pastel houses and a bell tower
//            on the quay. Spots by a shot's `focus`: the party at the origin, the rope at ROPE, the bow at BOW, the water
//            by the hull at SEA (y = WATER). A shot's `spot: "bow"` relights for faces turned to the open sea.
//   lounge   the yacht's saloon as a club: LED dance floor, pink and violet neon, a mirror ball, a "LE CLUB" sign,
//            white leather banquettes, a juice bar and dusk harbour windows.
import { mapKit } from './mapkit.js';

export const YACHT = { ROPE: [2.6, 5.7], BOW: [0, -26.5], SEA: [9.5, -6], WATER: -1.6, TABLE: [2.55, -1.2, 0.3], KOB: [-0.2, -1.4] };

export function buildClubMaps(K) {
  const k = mapKit(K);
  const { THREE, mat, tex, px, noise, box, selfLit, U, TAU, PI, hash, fr, hit, barHit, beatN, beat, grad, sign, cyl, cone, sph, ico, at, rot, merged, flat, lights, pt, room, stars } = k;
  const M = (c, o = {}) => mat({ color: c, ...o }), glow = c => mat({ color: c, unlit: 1 });

  // ---------- a party guest: a low-poly pet in white (the white party of the clip), bouncing and waving on the beat ----------
  const FURS = [0xd8c2a0, 0x3a2e28, 0xf2eee6, 0x9a7a5a, 0x6a6a72, 0xe8a060, 0x2a2a30, 0xc8b8e0];
  const OUT = [0xf8f8f4, 0x9ad8e8, 0xfafafa, 0xf2c0d8, 0xe8e0a0, 0xb8e0b0];   // white party, a few pastels
  function guest(i) {
    const g = new THREE.Group(), fur = M(FURS[i % FURS.length]), out = M(OUT[(i * 5) % OUT.length]), kind = i % 3; g.scale.setScalar(0.88);
    g.add(at(box(0.36, 0.34, 0.26, out), 0, 0.3, 0));                     // body in a white outfit
    for (const s of [-1, 1]) g.add(at(box(0.11, 0.14, 0.12, fur), s * 0.1, 0.07, 0.02));   // feet
    const head = at(box(0.46, 0.4, 0.4, fur), 0, 0.68, 0); g.add(head);
    head.add(at(box(0.16, 0.1, 0.1, M(0x1a1a1a)), 0, -0.06, 0.2));       // snout and nose
    for (const s of [-1, 1]) {
      head.add(at(box(0.07, 0.07, 0.02, M(0x101010)), s * 0.11, 0.04, 0.205));   // eyes
      const ear = kind === 0 ? rot(at(cone(0.08, 0.2, 4, fur), s * 0.15, 0.27, 0), 0, 0, -s * 0.25)   // cat ears
        : kind === 1 ? at(box(0.08, 0.3, 0.06, fur), s * 0.1, 0.33, 0)                                  // bunny ears
          : rot(at(box(0.07, 0.24, 0.16, fur), s * 0.25, -0.02, 0), 0, 0, s * 0.35);                   // floppy dog ears
      head.add(ear);
    }
    const arms = [-1, 1].map(s => { const a = new THREE.Group(); a.position.set(s * 0.21, 0.44, 0); a.add(at(box(0.09, 0.28, 0.09, out), 0, -0.13, 0)); g.add(a); return a; });
    return { g, head, arms, i };
  }
  // `dieAt` (cut seconds, a shot's guestsDie): the whole party keels over backwards, staggered, and stays down
  const guestAnim = (G, t, mood = 1, dieAt = null) => G.forEach(({ g, head, arms, i }) => {
    const f = dieAt == null ? 0 : Math.min(1, Math.max(0, (t - dieAt - hash(i, 9) * 0.45) / 0.3)), fe = f * f;
    g.rotation.x = -fe * PI / 2 * 0.98; if (f > 0) { g.position.y = g.userData.y0; arms.forEach((a, s) => { a.rotation.z = (s ? 1 : -1) * (0.3 + 1.6 * fe); }); head.rotation.z = 0.3 * fe; return; }
    const b = beat(t) + hash(i, 7) * 0.25, up = Math.abs(Math.sin(b * PI));
    g.position.y = g.userData.y0 + up * 0.14 * mood; head.rotation.z = 0.12 * Math.sin(b * PI) * mood;
    const wave = (Math.floor(b / 2) + i) % 3 === 0;   // every other bar some guests throw both arms up
    arms.forEach((a, s) => { a.rotation.z = (s ? 1 : -1) * (wave ? 2.6 + 0.3 * Math.sin(b * TAU) : 0.3 + 0.25 * up) * mood; });
  });

  // =====================================================================================================================
  function kobflat() {
    const G = new THREE.Group(), shakers = [];
    const parquet = tex(32, 32, (x, r) => { px(x, '#7a5236', 0, 0, 32, 32); for (let y = 0; y < 32; y += 8) { px(x, '#6a4630', 0, y, 32, 1); for (let X = (y / 8) % 2 ? 4 : 12; X < 32; X += 16) px(x, '#6a4630', X, y, 1, 8); } noise(x, r, 32, 32, ['#845a3c', '#71492f'], 90); }, 501);
    G.add(flat(10, 7.6, mat({ map: parquet, rep: [4, 3] }), 0, 0, 1.2));
    const paper = tex(16, 16, (x, r) => { px(x, '#5a4a78', 0, 0, 16, 16); for (let X = 0; X < 16; X += 4) px(x, '#66558a', X, 0, 2, 16); noise(x, r, 16, 16, ['#54456e', '#6a5a88'], 20); }, 502);
    room(G, 10, 7.6, 3.4, paper, 1.2, 0x2a2238, { skip: ['front'], cz: 1.2 });
    const base = M(0x3a2e48); G.add(at(box(10, 0.1, 0.04, base), 0, 0.05, -2.58));   // skirting
    // the low floor sofa: seat top at y = 0.10 (seated clips sit with their hips 0.16-0.2 m up), teal velvet, cushions
    const velvet = tex(8, 8, (x, r) => { px(x, '#2e7a7a', 0, 0, 8, 8); noise(x, r, 8, 8, ['#277070', '#358888'], 14); }, 503), velM = mat({ map: velvet, rep: [3, 1] });
    const sofa = new THREE.Group();
    sofa.add(at(box(2.8, 0.1, 0.5, velM), 0, 0.05, -1.52));             // seat, z -1.77..-1.27
    sofa.add(at(box(2.8, 0.58, 0.26, velM), 0, 0.29, -1.9));            // backrest
    for (const s of [-1, 1]) sofa.add(at(box(0.24, 0.3, 0.76, velM), s * 1.52, 0.15, -1.64));   // armrests
    sofa.add(rot(at(box(0.5, 0.36, 0.14, M(0xe8b84a)), -1.05, 0.3, -1.72), -0.25, 0.2, 0));      // a mustard cushion
    sofa.add(rot(at(box(0.44, 0.32, 0.14, M(0xd86a8a)), 1.1, 0.28, -1.72), -0.25, -0.25, 0));   // a pink one
    sofa.position.x = -0.2; G.add(sofa);
    const blanket = rot(at(box(0.8, 0.03, 0.55, M(0xb8a0d8)), 0.95, 0.115, -1.5), 0, 0.3, 0); G.add(blanket);
    // what Kob leaves behind when she goes out (`empty`): the pad on the seat
    const leftPad = new THREE.Group(); leftPad.add(box(0.2, 0.04, 0.1, M(0x2a2d36))); leftPad.add(at(box(0.03, 0.02, 0.03, glow(0xe8173a)), 0.06, 0.025, 0));
    G.add(rot(at(leftPad, -0.25, 0.13, -1.5), 0, 0.4, 0));
    // coffee table: pizza box, the milk carton, a bowl of kibble
    const woodM = M(0x8a6a4a);
    G.add(at(box(1.3, 0.05, 0.62, woodM), -0.35, 0.22, -0.3)); for (const [x, z] of [[-0.9, -0.52], [0.2, -0.52], [-0.9, -0.08], [0.2, -0.08]]) G.add(at(box(0.05, 0.2, 0.05, woodM), x, 0.1, z));
    const pizzaT = tex(16, 16, x => { px(x, '#d8b890', 0, 0, 16, 16); px(x, '#b8322a', 3, 5, 10, 6); x.fillStyle = '#1a1a1a'; x.font = 'bold 5px monospace'; x.fillText('PIZZA', 1, 14); });
    G.add(rot(at(box(0.5, 0.05, 0.5, mat({ map: pizzaT })), -0.55, 0.27, -0.28), 0, 0.2, 0));
    const carton = new THREE.Group(); carton.add(at(box(0.1, 0.2, 0.1, M(0xf4f4f4)), 0, 0.1, 0)); carton.add(at(box(0.1, 0.06, 0.1, M(0x3a8ad8)), 0, 0.12, 0.001)); carton.add(at(cone(0.075, 0.06, 4, M(0xf4f4f4)), 0, 0.23, 0).rotateY(PI / 4));
    G.add(at(carton, 0.05, 0.245, -0.4));
    G.add(at(cyl(0.1, 0.07, 0.07, 8, M(0xd84a6a)), 0.02, 0.28, -0.12));
    const rug = tex(16, 16, (x, r) => { px(x, '#c86a8a', 0, 0, 16, 16); px(x, '#e8c86a', 1, 1, 14, 14); px(x, '#c86a8a', 2, 2, 12, 12); noise(x, r, 16, 16, ['#b85a7a', '#d87a9a'], 30); }, 504);
    G.add(flat(3.4, 2.2, mat({ map: rug }), -0.3, 0.004, -0.5));
    // the TV front-left, turned to the sofa, a platformer running on it; the console under it
    const tvG = new THREE.Group(), tvScreen = tex(32, 18, x => { px(x, '#2a6ad8', 0, 0, 32, 18); px(x, '#4ab84a', 0, 13, 32, 5); px(x, '#6a4a2a', 0, 16, 32, 2); }), scrM = mat({ map: tvScreen, unlit: 1 });
    tvG.add(at(box(1.5, 0.9, 0.08, M(0x16161c)), 0, 0.95, 0)); tvG.add(at(box(1.38, 0.78, 0.01, scrM), 0, 0.95, 0.045));
    const hero = at(box(0.07, 0.1, 0.01, glow(0xe84a4a)), 0, 0.7, 0.052), coin = at(box(0.04, 0.04, 0.01, glow(0xffd43b)), 0.3, 0.9, 0.052); tvG.add(hero); tvG.add(coin);
    tvG.add(at(box(1.7, 0.42, 0.5, woodM), 0, 0.21, 0)); tvG.add(at(box(0.36, 0.08, 0.26, M(0x2a2a30)), 0.4, 0.46, 0.05)); tvG.add(at(box(0.04, 0.02, 0.01, glow(0x3fd4ff)), 0.3, 0.46, 0.18));
    const tvPos = [-3.3, 1.3]; tvG.position.set(tvPos[0], 0, tvPos[1]); tvG.rotation.y = Math.atan2(-0.2 - tvPos[0], -1.5 - tvPos[1]); G.add(tvG);
    // the window on the harbour (back wall, right): night city, and the yacht far away with its party flashing
    const viewT = tex(64, 48, (x, r) => {
      const g = x.createLinearGradient(0, 0, 0, 48); g.addColorStop(0, '#0a0e2a'); g.addColorStop(0.7, '#2a2458'); g.addColorStop(1, '#5a3a6a'); x.fillStyle = g; x.fillRect(0, 0, 64, 48);
      for (let i = 0; i < 26; i++) px(x, '#ffffff', Math.floor(r() * 64), Math.floor(r() * 20), 1, 1);
      px(x, '#f4f0d8', 50, 6, 5, 5); px(x, '#2a2458', 52, 6, 3, 3);   // a crescent moon
      for (let X = 0; X < 64; X += 7) { const h = 10 + Math.floor(r() * 12); px(x, '#141430', X, 48 - h - 8, 6, h); for (let y = 48 - h - 6; y < 40; y += 3) for (let c = 1; c < 5; c += 2) if (r() < 0.4) px(x, 'rgba(255,214,120,0.8)', X + c, y, 1, 1); }
      px(x, '#1a2a4a', 0, 40, 64, 8);                                  // harbour water
      px(x, '#f2f2f4', 18, 36, 22, 3); px(x, '#dcdcec', 22, 33, 12, 3); // the yacht
      for (let X = 18; X < 40; X += 2) px(x, 'rgba(255,120,200,0.8)', X, 35, 1, 1);
      for (let X = 16; X < 44; X += 3) px(x, 'rgba(255,230,160,0.8)', X, 42 + (X % 2), 1, 1);   // reflections
      selfLit(x, 64, 48);
    });
    const win = new THREE.Group(), frameM = M(0xe8e4f0);
    win.add(at(box(2.6, 2.0, 0.02, mat({ map: viewT, unlit: 1 })), 0, 0, 0));
    for (const [w, h, x, y] of [[2.72, 0.08, 0, 1.02], [2.72, 0.08, 0, -1.02], [0.08, 2.1, -1.32, 0], [0.08, 2.1, 1.32, 0], [0.05, 2.0, 0, 0], [2.6, 0.05, 0, 0.35]]) win.add(at(box(w, h, 0.06, frameM), x, y, 0.02));
    const fireworks = []; for (let f = 0; f < 3; f++) { const fw = new THREE.Group(); for (let s = 0; s < 8; s++) { const a = s / 8 * TAU; fw.add(at(box(0.05, 0.05, 0.01, glow([0xff5fa2, 0xffd43b, 0x3fd4ff][f])), Math.cos(a) * 0.14, Math.sin(a) * 0.14, 0)); } win.add(at(fw, -0.7 + f * 0.6, 0.55, 0.012)); fireworks.push(fw); }
    for (const s of [-1, 1]) win.add(at(box(0.5, 2.3, 0.08, M(0x8a4a6a)), s * 1.6, 0, 0.08));   // curtains
    win.position.set(3.2, 1.55, -2.55); G.add(win);
    // floor lamp (warm), a cat tree, frames on the wall, a shelf of books, a plant
    const lamp = new THREE.Group(); lamp.add(at(cyl(0.18, 0.2, 0.04, 8, M(0x2a2a30)), 0, 0.02, 0)); lamp.add(at(cyl(0.02, 0.02, 1.6, 4, M(0x2a2a30)), 0, 0.8, 0)); lamp.add(at(cyl(0.18, 0.28, 0.34, 8, mat({ color: 0xffe2a8, unlit: 1 })), 0, 1.7, 0));
    lamp.position.set(-3.9, 0, -2.0); G.add(lamp); shakers.push([lamp, 0.02, 0.6]);
    const sisal = M(0xc8a878), plush = M(0x8a7ab8), tree = new THREE.Group();
    tree.add(at(box(0.9, 0.08, 0.9, plush), 0, 0.04, 0)); tree.add(at(cyl(0.08, 0.08, 1.6, 6, sisal), 0, 0.8, 0)); tree.add(at(box(0.6, 0.08, 0.6, plush), 0, 0.9, 0)); tree.add(at(box(0.7, 0.3, 0.7, plush), 0, 1.7, 0)); tree.add(at(sph(0.08, 6, 4, M(0xe84a6a)), 0.3, 0.6, 0.2));
    tree.position.set(4.3, 0, 1.2); G.add(tree);
    for (const [x, y, w, h, c] of [[-2.9, 1.9, 0.7, 0.55, 0xe8b84a], [-1.9, 2.1, 0.45, 0.6, 0x3fb8a8], [-0.9, 1.85, 0.6, 0.45, 0xd86a8a]]) {
      const f = new THREE.Group(); f.add(box(w, h, 0.04, M(0x2a2238))); f.add(at(box(w * 0.8, h * 0.8, 0.01, M(c)), 0, 0, 0.025)); f.position.set(x, y, -2.56); G.add(f); shakers.push([f, 0.025, 0.12]);
    }
    const shelf = new THREE.Group(); shelf.add(box(1.6, 0.05, 0.3, woodM));
    for (let i = 0; i < 9; i++) shelf.add(at(box(0.1 + hash(i, 5) * 0.06, 0.28 + hash(i, 6) * 0.1, 0.22, M([0xd84a4a, 0x3a8ad8, 0xe8b84a, 0x4ab84a, 0xb86ad8][i % 5])), -0.7 + i * 0.17, 0.17, 0));
    shelf.position.set(-4.84, 1.6, -0.6); shelf.rotation.y = PI / 2; G.add(shelf); shakers.push([shelf, 0.015, 0.05]);
    const plant = new THREE.Group(); plant.add(at(cyl(0.18, 0.14, 0.3, 6, M(0xc86a4a)), 0, 0.15, 0)); for (let i = 0; i < 6; i++) plant.add(rot(at(box(0.08, 0.5, 0.02, M(0x3a9a4a)), Math.sin(i) * 0.08, 0.5, Math.cos(i) * 0.08), 0.3 * Math.cos(i * 2), i, 0.3 * Math.sin(i * 2)));
    plant.position.set(1.7, 0, -2.2); G.add(plant);
    // the door Saxo bursts through (left wall), ajar, the hallway light spilling in
    const door = new THREE.Group(); door.add(at(box(1.1, 2.2, 0.06, M(0x6a4a3a)), 0.55, 1.1, 0)); door.add(at(sph(0.05, 6, 4, M(0xe8c84a)), 0.95, 1.05, 0.05));
    door.position.set(-4.95, 0, 0.2); door.rotation.y = PI / 2 + 0.9; G.add(door);
    G.add(rot(at(new THREE.Mesh(new THREE.PlaneGeometry(1.1, 2.2), glow(0xfff0c8)), -4.97, 1.1, 0.75), 0, PI / 2, 0));
    return {
      group: G, sky: grad([[0, '#0a0814'], [1, '#1a1428']]), shadowCol: 0x3a2a24, indoor: true,
      light() {
        lights(0x7a70a0, 0x7a88c8, [0.2, -0.6, 1], 0x1a1430, [10, 24], 6.5);
        pt(0, -3.9, 1.8, -2.0, 1.8, 1.3, 0.8);              // floor lamp
        pt(2, 3.2, 1.6, -1.8, 0.35, 0.3, 0.7);              // moonlight through the window
      },
      anim(t, P = {}) {
        const n = Math.floor(t * 6.5), tv = 0.6 + 0.4 * hash(n, 3);   // the TV flickers blue on her face
        pt(1, tvPos[0] + 0.4, 1.0, tvPos[1] - 0.6, 0.35 * tv, 0.6 * tv, 1.4 * tv);
        hero.position.x = -0.5 + fr(t * 0.23) * 1.0; hero.position.y = 0.7 + Math.abs(Math.sin(t * 5)) * 0.08; coin.visible = fr(t * 0.23) < 0.75;
        fireworks.forEach((f, i) => { const u = fr(beat(t) / 4 + i / 3); f.scale.setScalar(0.2 + u * 1.3); f.visible = u < 0.7; });
        const sh = P.shake ? hit(t) : 0;
        shakers.forEach(([o, a, s]) => { o.userData.p ||= o.position.clone(); o.position.copy(o.userData.p); o.position.y += sh * a * 2; o.rotation.z = sh * s * (beatN(t) % 2 ? 1 : -1); });
        leftPad.visible = !!P.empty; blanket.visible = !P.empty;
      },
    };
  }

  // =====================================================================================================================
  function yacht() {
    const G = new THREE.Group(), W = YACHT.WATER;
    const teak = tex(32, 32, (x, r) => { px(x, '#a8845e', 0, 0, 32, 32); for (let X = 0; X < 32; X += 16) px(x, '#9e7a56', X, 0, 1, 32); noise(x, r, 32, 32, ['#a27e58', '#ae8a64'], 60); }, 511);   // pale teak: the sunset turned a saturated one into an orange slab   // faint seams: fine lines alias into waves at 270x480
    const teakM = mat({ map: teak, rep: [3, 4] }), white = M(0xf4f4f0), offW = M(0xe6e8ea), chrome = M(0xc8ccd4), navy = M(0x1a2a4a), glass = M(0x1e2a3a), cushion = M(0xfafaf6);
    // water: the harbour at sunset, gently scrolling; a darker band in the hull's shadow
    const seaT = tex(32, 32, (x, r) => { px(x, '#2a5a7a', 0, 0, 32, 32); noise(x, r, 32, 32, ['#326a8a', '#244e6c', '#3a7a98'], 200); for (let i = 0; i < 8; i++) px(x, '#ffc890', Math.floor(r() * 28), Math.floor(r() * 32), 3, 1); }, 512);
    const seaM = mat({ map: seaT, rep: [60, 60] }); G.add(flat(300, 300, seaM, 0, W, -40));
    // ---- the hull: aft deck at y = 0 from the transom (z 6.6) forward; a wedge bow to z -31 ----
    const hullT = tex(32, 16, (x, r) => { px(x, '#f2f2ee', 0, 0, 32, 16); noise(x, r, 32, 16, ['#e8e8e4', '#fafaf6'], 30); px(x, '#1a2a4a', 0, 13, 32, 3); px(x, '#c8a860', 0, 3, 32, 1); for (let X = 3; X < 32; X += 8) { px(x, '#1e2a3a', X, 6, 3, 3); px(x, '#6a8aa8', X, 6, 1, 1); } }, 513);
    const hullM = mat({ map: hullT, rep: [6, 1] });
    G.add(at(box(8.4, 1.58, 32.6, hullM), 0, -0.81, -9.7));                        // z -26..6.6, top 2 cm under the deck planks
    const bowShape = new THREE.Shape(); bowShape.moveTo(-4.2, 0); bowShape.lineTo(4.2, 0); bowShape.lineTo(0, -5.4); bowShape.lineTo(-4.2, 0);
    const bowG = new THREE.ExtrudeGeometry(bowShape, { depth: 1.62, bevelEnabled: false }); bowG.rotateX(PI / 2); const bow = new THREE.Mesh(bowG, hullM); bow.position.set(0, -0.02, -26); G.add(bow);
    // decks: the aft party deck, side decks, foredeck (all y = 0), the swim platform below the transom
    G.add(flat(8.4, 10.6, teakM, 0, 0.001, 1.3));
    for (const s of [-1, 1]) G.add(flat(0.9, 22, teakM, s * 3.75, 0.001, -15));
    G.add(flat(8.4, 6, teakM, 0, 0.001, -23));
    const foreShape = new THREE.Shape(); foreShape.moveTo(-4.2, 0); foreShape.lineTo(4.2, 0); foreShape.lineTo(0, 5.4); foreShape.lineTo(-4.2, 0);   // +y becomes -z once laid flat
    const fore = new THREE.Mesh(new THREE.ShapeGeometry(foreShape), teakM); fore.rotation.x = -PI / 2; fore.position.set(0, 0.002, -26); G.add(fore);
    G.add(at(box(6, 0.12, 1.1, teakM), 0, -1.1, 7.1));                             // swim platform
    for (let s = 0; s < 5; s++) G.add(at(box(1.1, 0.06, 0.26, teakM), -3.2, -0.22 * s - 0.1, 6.75 + s * 0.08));   // steps down to it
    // railings: stainless posts and two rails along the sides and round the bow (open at the transom)
    const railPost = (x, z) => G.add(at(cyl(0.025, 0.025, 0.72, 4, chrome), x, 0.36, z));
    const rail = (x0, z0, x1, z1, y) => { const d = Math.hypot(x1 - x0, z1 - z0), r = at(cyl(0.022, 0.022, d, 4, chrome), (x0 + x1) / 2, y, (z0 + z1) / 2); r.rotation.set(PI / 2, 0, 0); r.rotation.y = Math.atan2(x1 - x0, z1 - z0); r.rotation.order = 'YXZ'; r.rotation.set(PI / 2, Math.atan2(x1 - x0, z1 - z0), 0); G.add(r); };
    for (const s of [-1, 1]) { for (let z = 6; z > -26; z -= 2) railPost(s * 4.12, z); rail(s * 4.12, 6.2, s * 4.12, -26, 0.72); rail(s * 4.12, 6.2, s * 4.12, -26, 0.38); rail(s * 4.12, -26, 0, -31.2, 0.72); rail(s * 4.12, -26, 0, -31.2, 0.38); for (let f = 1; f < 4; f++) railPost(s * 4.12 * (1 - f / 4), -26 - 5.2 * f / 4); }
    railPost(0, -31.1);
    // ---- the superstructure: the saloon (the lounge map is its inside), flybridge, radar arch ----
    const winT = tex(32, 16, (x, r) => { px(x, '#f4f4f0', 0, 0, 32, 16); px(x, '#1a2433', 1, 3, 30, 9); for (let X = 2; X < 30; X += 4) px(x, 'rgba(255,120,210,0.8)', X, 5 + (X % 3), 2, 5); px(x, '#3a4a66', 1, 3, 30, 1); selfLit(x, 32, 16); }, 514);
    const saloon = new THREE.Group();
    saloon.add(at(box(6.6, 2.5, 11, mat({ map: winT, rep: [3, 1] })), 0, 1.25, -9.6));
    saloon.add(at(box(6.9, 0.14, 12.4, white), 0, 2.56, -9.2));                       // flybridge floor / roof overhang
    saloon.add(at(box(5.6, 1.1, 5, mat({ map: winT, rep: [2, 1] })), 0, 3.2, -12));   // wheelhouse
    saloon.add(at(box(5.9, 0.12, 5.4, white), 0, 3.8, -12));
    saloon.add(at(box(6.6, 0.9, 0.4, offW), 0, 0.45, -4.0));                          // aft bulkhead skirt
    // sliding glass doors to the lounge, lit pink from inside
    saloon.add(at(box(3.2, 2.1, 0.05, mat({ color: 0x8a2a6a, unlit: 1 })), 0, 1.05, -4.08));   // tinted glass, the lounge's pink inside
    for (const x of [-1.6, 0, 1.6]) saloon.add(at(box(0.06, 2.1, 0.08, chrome), x, 1.05, -4.04));
    G.add(saloon);
    const arch = new THREE.Group();
    for (const s of [-1, 1]) arch.add(rot(at(box(0.3, 3.2, 0.5, white), s * 2.9, 4.1, -5.2), 0, 0, s * -0.12));
    arch.add(at(box(6.4, 0.35, 0.6, white), 0, 5.65, -5.2)); arch.add(at(cyl(0.3, 0.3, 0.2, 8, white), 0, 6.0, -5.2)); arch.add(at(box(1.4, 0.06, 0.2, M(0x2a2a30)), 0, 6.2, -5.2));
    G.add(arch);
    for (const s of [-1, 1]) { G.add(at(box(0.8, 0.5, 2.2, cushion), s * 2.2, 2.9, -7)); }   // sunbeds up top
    // ---- the party on the aft deck ----
    // DJ booth against the bulkhead, speakers that thump, a neon front
    const djFront = tex(32, 8, x => { px(x, '#16101e', 0, 0, 32, 8); px(x, '#ff3fa4', 1, 1, 30, 1); px(x, '#3fd4ff', 1, 6, 30, 1); x.fillStyle = '#ff9ad8'; x.font = 'bold 6px monospace'; x.fillText('DJ', 12, 6); });
    G.add(at(box(2.2, 0.82, 0.7, mat({ map: djFront, unlit: 1 })), 0, 0.41, -3.35));
    const decks = [-0.5, 0.5].map(x => { const d = at(cyl(0.2, 0.2, 0.03, 10, M(0x2a2a30)), x, 0.84, -3.35); G.add(d); return d; });
    const spk = tex(8, 16, x => { px(x, '#111', 0, 0, 8, 16); x.fillStyle = '#444'; x.beginPath(); x.arc(4, 5, 3, 0, TAU); x.arc(4, 12, 2, 0, TAU); x.fill(); });
    const speakers = []; for (const s of [-1, 1]) { const sp = at(box(0.7, 1.3, 0.6, mat({ map: spk })), s * 1.8, 0.65, -3.3); G.add(sp); speakers.push(sp); }
    // string lights from the arch to the stern posts, flashing on the beat
    const bulbs = [];
    for (const s of [-1, 1]) { G.add(at(cyl(0.04, 0.04, 2.4, 4, chrome), s * 4.0, 1.2, 6.2)); for (let i = 0; i <= 14; i++) { const u = i / 14, b = at(sph(0.07, 4, 3, glow(0xffe2a0)), s * (2.9 + 1.1 * u), 5.2 - 3.0 * u - Math.sin(u * PI) * 0.5, -5.2 + 11.4 * u); G.add(b); bulbs.push([b, i + (s > 0 ? 20 : 0)]); } }
    for (let i = 0; i <= 12; i++) { const u = i / 12, b = at(sph(0.07, 4, 3, glow(0xffe2a0)), -4 + 8 * u, 2.4 - Math.sin(u * PI) * 0.45, 6.2); G.add(b); bulbs.push([b, i + 40]); }
    // the VIP table: "pas d'bouteilles sur la table": milk cartons, juice, a bowl of carrots; white sofas round it
    const [tx, tz, th] = YACHT.TABLE, table = new THREE.Group();
    table.add(at(box(1.5, 0.06, 0.9, white), 0, th, 0)); table.add(at(cyl(0.12, 0.2, th, 6, chrome), 0, th / 2, 0));
    for (let i = 0; i < 3; i++) { const c = new THREE.Group(); c.add(at(box(0.1, 0.2, 0.1, M(0xf4f4f4)), 0, 0.1, 0)); c.add(at(box(0.1, 0.06, 0.1, M([0x3a8ad8, 0xd83a6a, 0x4ab84a][i])), 0, 0.12, 0.001)); c.add(at(cone(0.075, 0.06, 4, M(0xf4f4f4)), 0, 0.23, 0).rotateY(PI / 4)); table.add(at(c, -0.5 + i * 0.22, th + 0.03, -0.22)); }
    for (let i = 0; i < 3; i++) table.add(at(cyl(0.045, 0.036, 0.14, 6, M(0xff9a2e)), 0.2 + i * 0.13, th + 0.1, 0.18));
    table.add(at(cyl(0.2, 0.14, 0.1, 8, M(0xf2f2f2)), 0.45, th + 0.08, -0.15));
    for (let i = 0; i < 5; i++) {   // carrots lying in a fan on the table, green tops out (upright cones read as flames)
      const c = new THREE.Group(); c.add(rot(at(cone(0.032, 0.2, 5, M(0xff7a1a)), 0.1, 0, 0), 0, 0, -PI / 2)); c.add(at(box(0.05, 0.035, 0.05, M(0x3fae47)), -0.015, 0, 0));
      c.position.set(0.28 + i * 0.03, th + 0.06, -0.28 + i * 0.07); c.rotation.y = -0.5 + i * 0.25; table.add(c);
    }
    table.position.set(tx, 0, tz); G.add(table);
    const sofaM = M(0xfafaf4);
    G.add(at(box(0.7, 0.36, 2.6, sofaM), tx + 1.15, 0.18, tz)); G.add(at(box(0.2, 0.5, 2.6, sofaM), tx + 1.45, 0.45, tz));
    G.add(at(box(2.2, 0.36, 0.7, sofaM), tx, 0.18, tz - 1.05)); G.add(at(box(2.2, 0.5, 0.2, sofaM), tx, 0.45, tz - 1.35));
    for (const [x, z] of [[-2.9, 1.2], [-2.9, 2.6]]) G.add(at(box(0.9, 0.34, 0.9, sofaM), x, 0.17, z));   // poufs on the port side
    // the velvet rope at the head of the passerelle (Compote's post), the passerelle down to the quay
    const [rx, rz] = YACHT.ROPE, brass = M(0xd8b048), velvetM = M(0xb8123a);
    for (const s of [-1, 1]) { G.add(at(cyl(0.05, 0.08, 0.02, 6, brass), rx + s * 0.65, 0.01, rz + 0.5)); G.add(at(cyl(0.025, 0.025, 0.72, 5, brass), rx + s * 0.65, 0.36, rz + 0.5)); G.add(at(sph(0.05, 5, 4, brass), rx + s * 0.65, 0.74, rz + 0.5)); }
    for (let i = 0; i < 8; i++) { const u = (i + 0.5) / 8; G.add(at(box(0.18, 0.05, 0.05, velvetM), rx - 0.65 + 1.3 * u, 0.68 - Math.sin(u * PI) * 0.16, rz + 0.5)); }
    const pass = rot(at(box(0.9, 0.06, 3.4, M(0xd8d8dc)), rx, -0.3, rz + 2.4), Math.atan2(0.6, 3.4), 0, 0); G.add(pass);   // down to the quay
    // ---- the quay behind the stern: stone edge, bollards, lamp posts, pastel Saint-Tropez houses and the bell tower ----
    const stoneT = tex(16, 16, (x, r) => { px(x, '#c8b89a', 0, 0, 16, 16); for (let y = 0; y < 16; y += 4) px(x, '#a8987a', 0, y, 16, 1); noise(x, r, 16, 16, ['#bcac8e', '#d4c4a6'], 40); }, 515);
    G.add(at(box(80, 1.0, 12, mat({ map: stoneT, rep: [20, 3] })), 0, -1.1, 15.8));   // top at -0.6
    for (let x = -20; x <= 20; x += 5) G.add(at(cyl(0.16, 0.2, 0.4, 6, M(0x2a2a30)), x + 1.3, -0.4, 10.4));
    const houses = [0xe8a45a, 0xf2d27a, 0xe88a7a, 0xf4e4c8, 0xd8b06a, 0xf0b89a, 0xe8c070];
    houses.forEach((c, i) => {
      const w = 5 + hash(i, 1) * 2, h = 7 + hash(i, 2) * 5, x = -18 + i * 6.2;
      const fac = tex(16, 32, (X, r) => { px(X, '#' + c.toString(16).padStart(6, '0'), 0, 0, 16, 32); noise(X, r, 16, 32, ['rgba(0,0,0,.08)', 'rgba(255,255,255,.1)'], 40); for (let y = 4; y < 30; y += 7) for (let xx = 2; xx < 14; xx += 5) { px(X, '#3a6a4a', xx, y, 1, 4); px(X, '#3a6a4a', xx + 3, y, 1, 4); px(X, r() < 0.5 ? 'rgba(255,214,140,0.8)' : '#2a2a38', xx + 1, y, 2, 4); } selfLit(X, 16, 32); }, 520 + i);
      G.add(at(box(w, h, 5, mat({ map: fac, rep: [1, 1] })), x, -0.6 + h / 2, 24));
      G.add(at(box(w + 0.4, 0.4, 5.4, M(0xb85a3a)), x, -0.6 + h + 0.2, 24));      // terracotta roofline
    });
    const tower = new THREE.Group(); tower.add(at(box(3.2, 16, 3.2, M(0xe8b870)), 0, 8, 0)); tower.add(at(box(3.6, 0.5, 3.6, M(0xd8a060)), 0, 16.2, 0)); tower.add(at(box(2.2, 2.2, 2.2, M(0xf0c880)), 0, 17.6, 0)); tower.add(at(cone(1.2, 1.8, 4, M(0x5a5a62)), 0, 19.6, 0).rotateY(PI / 4));
    tower.add(at(sph(0.5, 6, 4, glow(0xfff0c0)), 0, 17.6, 1.12)); tower.position.set(6, -0.6, 32); G.add(tower);
    const lampPosts = []; for (const x of [-8, 8]) { G.add(at(cyl(0.06, 0.08, 3.2, 5, M(0x2a2a30)), x, 1.0, 11.5)); const l = at(sph(0.2, 5, 4, glow(0xfff0c0)), x, 2.7, 11.5); G.add(l); lampPosts.push(l); }
    // ---- neighbours moored either side, the jetty with a lighthouse, the hills across the gulf ----
    for (const [x, len, col] of [[-11.5, 26, 0xf2f2ee], [21, 22, 0xe8eef2], [-22, 18, 0xf4f0e8], [32, 30, 0xf2f2f2]]) {   // starboard kept clear for the jet-ski
      const n = new THREE.Group(); n.add(at(box(6, 1.5, len, white), 0, W / 2 + 0.05, -len / 2 + 7)); n.add(at(box(4.6, 1.8, len * 0.45, mat({ map: winT, rep: [2, 1] })), 0, 0.9, -len * 0.35)); n.add(at(box(0.1, 9, 0.1, chrome), 0, 4.5, -len * 0.4));
      n.position.set(x, 0, 0); G.add(n);
    }
    const jetty = at(box(3, 1.6, 40, mat({ map: stoneT, rep: [2, 10] })), -30, -1.0, -60); jetty.rotation.y = 0.7; G.add(jetty);
    const lh = new THREE.Group(); lh.add(at(cyl(0.9, 1.1, 6, 8, M(0xf2f2f2)), 0, 3, 0)); lh.add(at(cyl(0.95, 0.95, 1.2, 8, M(0xd83a3a)), 0, 4.2, 0)); lh.add(at(cyl(0.6, 0.7, 1, 8, glow(0xfff4c0)), 0, 6.5, 0)); lh.position.set(-44, -0.6, -74); G.add(lh);
    const hillM = M(0x4a5a3a), hillM2 = M(0x3a4a34), pineM = M(0x2a3a26);
    for (let i = 0; i < 14; i++) { const a = -1.3 + i * 0.2, d = 150 + hash(i, 3) * 40, h = 18 + hash(i, 4) * 26; const hl = new THREE.Mesh(new THREE.ConeGeometry(30 + hash(i, 5) * 20, h, 5), i % 2 ? hillM : hillM2); G.add(at(hl, Math.sin(a) * d, W + h / 2 - 3, -Math.cos(a) * d)); }
    for (let i = 0; i < 40; i++) { const a = -1.2 + hash(i, 8) * 2.4, d = 120 + hash(i, 9) * 30; G.add(at(cone(1.6, 4, 4, pineM), Math.sin(a) * d, W + 5 + hash(i, 10) * 10, -Math.cos(a) * d)); }
    for (let i = 0; i < 12; i++) { const a = -1.0 + hash(i, 11) * 2, d = 118 + hash(i, 12) * 20; G.add(at(box(3, 2.2, 3, M([0xf4e4c8, 0xe8a45a, 0xf2f2ee][i % 3])), Math.sin(a) * d, W + 4 + hash(i, 13) * 8, -Math.cos(a) * d)); }
    const sun = at(new THREE.Mesh(new THREE.CircleGeometry(7, 12), glow(0xffc070)), -60, 30, -100); sun.lookAt(0, 0, 0); G.add(sun);   // above the ridge, inside the fog
    // ---- jet-skis circling in the harbour, seagulls, and the pet party guests in white ----
    const skis = []; for (let i = 0; i < 2; i++) { const j = new THREE.Group(); j.add(at(box(0.6, 0.3, 1.5, M(i ? 0x3fb8ff : 0xffd43b)), 0, 0, 0)); j.add(at(box(0.3, 0.5, 0.4, M(0x2a2a30)), 0, 0.4, -0.1)); j.add(at(box(0.9, 0.05, 2.4, glow(0xf4fbff)), 0, -0.14, -1.6)); G.add(j); skis.push(j); }
    const gulls = []; for (let i = 0; i < 5; i++) { const g = new THREE.Group(); for (const s of [-1, 1]) g.add(rot(at(box(0.6, 0.03, 0.18, glow(0xf4f4f4)), s * 0.3, 0, 0), 0, 0, s * 0.3)); G.add(g); gulls.push(g); }
    const guests = [];
    // behind and beside the party spot only (cameras sit at z 4-6), a DJ behind the booth, two up on the flybridge
    for (const [x, z, ry, y] of [[-2.2, -2.3, 0.3, 0], [-1.2, -2.8, 0.1, 0], [1.2, -2.7, -0.1, 0], [-3.3, -1.3, 0.8, 0], [-3.5, 0.4, 1.2, 0], [-3.2, 2.0, 1.6, 0], [3.5, 1.4, -1.6, 0], [-0.3, -2.9, 0, 0], [0, -3.85, 0, 0], [-2.0, -6.2, 0.2, 2.63], [1.6, -7.0, -0.2, 2.63]]) {
      const g = guest(guests.length); g.g.position.set(x, y, z); g.g.rotation.y = ry; g.g.userData.y0 = y; G.add(g.g); guests.push(g);
    }
    return {
      group: G, sky: grad([[0, '#2a2a6a'], [0.35, '#7a4a8a'], [0.62, '#e87a7a'], [0.82, '#f8b060'], [1, '#ffd890']]), shadowCol: 0x7a5232,
      light() {
        lights(0x8a7aa0, 0xffc890, [-0.35, -0.55, -0.75], 0xe8a0a0, [60, 260], 7);
        pt(0, 0, 1.6, -2.6, 1.2, 0.3, 0.9);     // DJ booth glow
        pt(1, -3.6, 2.2, 3.5, 1.0, 0.8, 0.45);  // string lights, port
        pt(2, 3.6, 2.2, 3.5, 1.0, 0.8, 0.45);   // starboard
      },
      anim(t, P = {}) {
        const h = hit(t), n = beatN(t);
        if (P.spot === 'bow') U.uDirDir.value.set(-0.3, -0.5, 0.8).normalize();       // faces turned to the open sea get the sun
                seaM.uniforms.uOff.value.set(t * 0.03, P.ride ? t * P.ride : t * 0.05);         // the jet-ski shot streams the water past (+ = towards +z)
        bulbs.forEach(([b, i]) => { const on = (i + n) % 3 !== 0; b.material.uniforms.uCol.value.setScalar(on ? 0.75 + 0.35 * h : 0.35); });
        speakers.forEach(s => s.scale.setScalar(1 + 0.06 * h)); decks.forEach((d, i) => { d.rotation.y = t * 3.5 * (i ? 1 : -1); });
        U.uPtCol.value[0].setRGB(1.2 * (0.6 + 0.6 * h), 0.3, 0.9 * (0.6 + 0.6 * h));
        skis.forEach((j, i) => { const a = t * (0.35 + i * 0.12) + i * 2.4, R = 12 + i * 5, cx = i ? -8 : 16, cz = -22 - i * 10; j.position.set(cx + Math.cos(a) * R, W + 0.12 + 0.05 * Math.sin(t * 6 + i), cz + Math.sin(a) * R); j.rotation.set(0, -a, 0.15 * Math.sin(t * 2 + i)); });
        gulls.forEach((g, i) => { const a = t * 0.25 + i * 1.3; g.position.set(Math.cos(a) * (14 + i * 3), 9 + i * 1.5 + Math.sin(t + i), -12 + Math.sin(a) * 10); g.rotation.y = -a; g.children.forEach((w, s) => { w.rotation.z = (s ? 1 : -1) * (0.3 + 0.4 * Math.sin(t * 7 + i)); }); });
        guestAnim(guests, t, P.calm ? 0.12 : 1, P.guestsDie ?? null);   // calm: the music has died, they barely sway
        guests.forEach(g => { g.g.visible = !P.noguests; });
        lampPosts.forEach(l => l.material.uniforms.uCol.value.setScalar(0.9));
      },
    };
  }

  // =====================================================================================================================
  function lounge() {
    const G = new THREE.Group(), N = 8, S = 1.3, tiles = [];
    for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) { const m = glow(0x222222), tl = at(box(S - 0.06, 0.05, S - 0.06, m), (i - N / 2 + 0.5) * S, -0.026, (j - N / 2 + 0.5) * S - 0.6); G.add(tl); tiles.push([tl, i, j]); }
    const floorT = tex(16, 16, (x, r) => { px(x, '#f0ece6', 0, 0, 16, 16); noise(x, r, 16, 16, ['#e6e2dc', '#f6f2ec'], 30); }, 531);
    G.add(flat(16, 14, mat({ map: floorT, rep: [6, 5] }), 0, -0.002, 0));
    const wallT = tex(16, 16, (x, r) => { px(x, '#2a1438', 0, 0, 16, 16); noise(x, r, 16, 16, ['#321a42', '#22102e'], 40); px(x, '#6a3a7a', 0, 15, 16, 1); }, 532);
    room(G, 14, 12, 3.4, wallT, 1.4, 0x1a0c24, { skip: ['front'], cz: -0.5 });
    // dusk harbour windows along both sides (the yacht's saloon glazing)
    const duskT = tex(32, 12, (x, r) => { const g = x.createLinearGradient(0, 0, 0, 12); g.addColorStop(0, '#3a3a7a'); g.addColorStop(0.6, '#e87a8a'); g.addColorStop(1, '#2a4a6a'); x.fillStyle = g; x.fillRect(0, 0, 32, 12); for (let X = 0; X < 32; X += 5) px(x, 'rgba(255,214,140,0.8)', X + 1, 7, 1, 1); px(x, '#f2f2ee', 6, 6, 6, 2); selfLit(x, 32, 12); }, 533);
    for (const s of [-1, 1]) G.add(rot(at(new THREE.Mesh(new THREE.PlaneGeometry(9, 1.3), mat({ map: duskT, unlit: 1, rep: [2, 1] })), s * 6.97, 1.9, -1.5), 0, -s * PI / 2, 0));
    // neon: pink strips along the ceiling edges, violet at the floor, the "LE CLUB" sign over the DJ
    const neonP = glow(0xff4fb8), neonV = glow(0x9a4aff), neonC = glow(0x3fd4ff);
    for (const s of [-1, 1]) { G.add(at(box(0.06, 0.06, 12, neonP), s * 6.9, 3.3, -0.5)); G.add(at(box(0.06, 0.05, 12, neonV), s * 6.9, 0.06, -0.5)); }
    G.add(at(box(14, 0.06, 0.06, neonP), 0, 3.3, -6.45));
    const signT = tex(64, 16, x => { px(x, '#12081c', 0, 0, 64, 16); x.fillStyle = '#ff6ac8'; x.font = 'bold 12px sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('LE CLUB', 32, 9); });
    const signM = mat({ map: signT, unlit: 1 }); G.add(at(box(3.0, 0.75, 0.06, signM), 0, 1.75, -6.4));   // low enough to sit under the lyric rows
    // DJ booth, speakers, a juice bar on the left, white leather banquettes on the right, the mirror ball
    const djT = tex(32, 8, x => { px(x, '#16101e', 0, 0, 32, 8); for (let X = 1; X < 31; X += 3) px(x, ['#ff3fa4', '#3fd4ff', '#ffd43b'][X % 3], X, 3, 2, 2); });
    G.add(at(box(2.6, 0.9, 0.8, mat({ map: djT, unlit: 1 })), 0, 0.45, -5.6));
    const spk = tex(8, 16, x => { px(x, '#111', 0, 0, 8, 16); x.fillStyle = '#444'; x.beginPath(); x.arc(4, 5, 3, 0, TAU); x.arc(4, 12, 2, 0, TAU); x.fill(); });
    const speakers = []; for (const s of [-1, 1]) { const sp = at(box(0.9, 1.8, 0.8, mat({ map: spk })), s * 2.4, 0.9, -5.7); G.add(sp); speakers.push(sp); }
    const bar = new THREE.Group(); bar.add(at(box(0.8, 1.0, 4.2, M(0xf4f4f0)), 0, 0.5, 0)); bar.add(at(box(0.9, 0.06, 4.3, M(0xd8b048)), 0, 1.02, 0)); bar.add(at(box(0.04, 0.9, 4.2, neonC), 0.42, 0.5, 0));
    for (let i = 0; i < 6; i++) bar.add(at(cyl(0.05, 0.04, 0.15, 6, M([0xff9a2e, 0xff5fa2, 0xfaf7ef][i % 3])), 0, 1.13, -1.6 + i * 0.6));
    bar.position.set(-6.0, 0, -1.8); G.add(bar);
    const leather = M(0xf6f4ee); for (let i = 0; i < 3; i++) { G.add(at(box(0.8, 0.4, 2.0, leather), 6.2, 0.2, -4.4 + i * 2.3)); G.add(at(box(0.25, 0.7, 2.0, leather), 6.6, 0.55, -4.4 + i * 2.3)); }
    const ballT = tex(16, 16, (x, r) => { for (let i = 0; i < 16; i += 2) for (let j = 0; j < 16; j += 2) px(x, ['#e8e8f0', '#9a9aa8', '#ffffff', '#6a6a78'][Math.floor(r() * 4)], i, j, 2, 2); }, 534);
    const ball = at(ico(0.3, 1, mat({ map: ballT, unlit: 1, rep: [3, 3] })), 0, 3.05, -5.4); G.add(ball);   // small and far back: it sat in the lyric rows
    const dots = []; for (let i = 0; i < 30; i++) { const d = at(box(0.08, 0.08, 0.02, glow(0xffffff)), 0, 0, 0); G.add(d); dots.push(d); }   // mirror-ball specks on the back wall
    const guests = [];
    for (const [x, z, ry] of [[-3.6, -3.4, 0.4], [-2.4, -4.2, 0.2], [2.6, -4.1, -0.2], [3.8, -3.0, -0.5], [-4.4, -1.2, 1.0], [4.5, -1.0, -1.1], [-3.8, 1.4, 1.9], [4.0, 1.8, -2.0]]) {
      const g = guest(guests.length + 3); g.g.position.set(x, 0, z); g.g.rotation.y = ry; g.g.userData.y0 = 0; G.add(g.g); guests.push(g);
    }
    const PAL = [[1, 0.25, 0.7], [0.6, 0.3, 1], [0.25, 0.85, 1], [1, 0.85, 0.3]];
    return {
      group: G, sky: grad([[0, '#0a0410'], [1, '#1a0a24']]), shadowCol: 0x3a2a3a, indoor: true,
      light() { lights(0x4a3858, 0x3a2a4a, [0, -1, 0.3], 0x140a1c, [9, 24], 7); },
      anim(t, P = {}) {
        const n = beatN(t), h = hit(t);
        tiles.forEach(([m, i, j]) => { const on = hash(i, j, n) < 0.42, c = PAL[Math.floor(hash(j, i, n) * PAL.length)], kk = on ? 0.3 + 0.7 * h : 0.06; m.material.uniforms.uCol.value.setRGB(c[0] * kk, c[1] * kk, c[2] * kk); });
        ball.rotation.y = t * 0.8;
        for (let i = 0; i < 4; i++) { const a = t * 0.7 + i * TAU / 4, c = PAL[(((n + i) % 4) + 4) % 4]; pt(i, Math.sin(a) * 3.5, 2.8, -1.5 + Math.cos(a) * 3, c[0] * (0.9 + h), c[1] * (0.9 + h), c[2] * (0.9 + h)); }
        dots.forEach((d, i) => { const a = hash(i, 2) * TAU + t * 0.8, e = 0.3 + hash(i, 3) * 1.2; d.position.set(Math.sin(a) * 6.5, 0.6 + e * 2, -6.42); d.visible = Math.cos(a) > -0.2; });
        speakers.forEach(s => s.scale.setScalar(1 + 0.06 * h));
        signM.uniforms.uCol.value.setScalar(0.8 + 0.2 * (hash(Math.floor(t * 9), 4) > 0.08 ? 1 : 0.2));   // the neon buzzes
        guestAnim(guests, t, 1, P.guestsDie ?? null); guests.forEach(g => { g.g.visible = !P.noguests; });
      },
    };
  }

  return { kobflat: kobflat(), yacht: yacht(), lounge: lounge() };
}
