// maps14.js: the "Love Me Not" map (2026-09-28, the user's queue: recreate Olivia Dean's viral Live Lounge session, its
// scenes and choreography). Same contract as the other map files, pure in t:
//   studio  a radio station's live-session studio at night: a dark room with blue neon strips slanting across the
//           ceiling and walls, ribbed acoustic walls lit blue, big potted plants; the singer's mark at STUDIO.MIC in
//           front of a glowing red backdrop (dark-red bokeh, "RADIO" + a paw in a circle, "LIVE LOUNGE": our parody of
//           the show's board, no real logo) with a mic stand whose mic sits at his muzzle; the drum booth (an aluminium
//           frame, its front pane's badge) round a small drum kit sized for a seated chibi (DRUMMER: the stool, facing
//           +x; the snare at SNARE, the paws' height); a keyboard on an X-stand (KEYS, keys' top at KEYS_Y) with a vase
//           of three daisies at its +z end (VASE); guitar and bass amps; the horn section (three pets with trombone,
//           sax and trumpet at HORNS) and a bass pet (BASS), all in headphones, and a vase of white blossom by the horns.
//           Shot flags read by anim(t, P): `horns` (true, or s into the shot: the horn section lifts its horns and
//           plays; before, they hold them down and nod), `petals` (0-36: the daisies' petals left, the last daisy
//           plucked first; default 36), `pile` (0-30: loose petals on the keys and the floor), `stop` (cut s: the
//           music stops dead, every pet freezes where it is), `noguests`, `blossom` (false hides the blossom vase),
//           `noRide` / `noCrash` (hide a cymbal in front of a lens), `noMic` (hide the mic stand), `key`
//           ([x, y, z, r, g, b]: a light on the action), `clear` ([[x, z, r]]: no pet near those points).
import { mapKit } from './mapkit.js';

export const STUDIO = {
  MIC: [0, 0], PANEL_Z: -1.3, MIC_POS: [0, 0.78, 0.56],
  DRUMMER: [-2.78, 0.9], SNARE: [-2.5, 0.72], BOOTH: [-4.05, -1.85, -0.25, 2.05],
  GUITAR: [-1.35, 2.3], AMP: [-3.4, 3.6],
  KEYS: [2.46, 0.95], KOB: [2.8, 0.95], KEYS_Y: 0.33, KEYS_LEN: 1.0, VASE: [2.46, 1.52],
  BASS: [1.6, 2.8], HORNS: [[3.3, -1.5], [4.0, -1.15], [4.7, -0.8]], BLOSSOM: [2.45, -0.62],
  X: [-7.5, 7.5], Z: [-6.5, 7.5], H: 5.8,
};

export function buildStudioMaps(K) {
  const k = mapKit(K);
  const { THREE, mat, tex, px, noise, box, TAU, PI, hash, beat, cyl, cone, at, rot, flat, lights, pt, room } = k;
  const M = (c, o = {}) => mat({ color: c, ...o }), glow = c => mat({ color: c, unlit: 1 });
  const sm = u => { const v = Math.min(1, Math.max(0, u)); return v * v * (3 - 2 * v); };
  const cleared = (P, x, z) => (P.clear || []).some(([cx, cz, r]) => (x - cx) ** 2 + (z - cz) ** 2 < r * r);
  const { PANEL_Z, MIC_POS, DRUMMER, SNARE, BOOTH, AMP, KEYS, KOB, KEYS_Y, KEYS_LEN, VASE, BASS, HORNS, BLOSSOM, X, Z, H } = STUDIO;
  const BRASS = mat({ color: 0xe0b040, unlit: 0.25 }), CHROME = M(0xc8ccd4), BLACK = M(0x18181e), METAL = M(0x5a5e68);

  // our parody badge: a white circle with a black paw (where the show's "1" would be)
  const pawBadge = (x, cx, cy, r) => {
    x.fillStyle = '#ffffff'; x.beginPath(); x.arc(cx, cy, r, 0, TAU); x.fill();
    x.fillStyle = '#16121c'; x.beginPath(); x.ellipse(cx, cy + r * 0.22, r * 0.36, r * 0.3, 0, 0, TAU); x.fill();
    for (const [dx, dy] of [[-0.42, -0.2], [-0.15, -0.46], [0.15, -0.46], [0.42, -0.2]]) { x.beginPath(); x.arc(cx + dx * r, cy + dy * r, r * 0.14, 0, TAU); x.fill(); }
  };
  // headphones for a pet's head (box head of width w): a band over the top and two cups, a cyan ring so they read in the dark
  const phones = (w, y) => {
    const g = new THREE.Group(), cup = M(0x3a3e48), band = M(0xb8bcc6), ringM = mat({ color: 0x2a8ab8, unlit: 0.5 });
    for (const s of [-1, 1]) { g.add(at(box(0.07, 0.16, 0.16, cup), s * (w / 2 + 0.03), y, 0)); g.add(at(box(0.012, 0.08, 0.08, ringM), s * (w / 2 + 0.07), y, 0)); }
    g.add(at(box(w + 0.1, 0.035, 0.05, band), 0, y + 0.24, 0));
    for (const s of [-1, 1]) g.add(at(box(0.035, 0.18, 0.05, band), s * (w / 2 + 0.035), y + 0.14, 0));
    return g;
  };

  // ---------- session pets: big heads, headphones, the band's dark shirts in colours that still read in the dark room (black ones were silhouettes) ----------
  const FURS = [0xd8a868, 0xe8d8c0, 0xb08a60, 0xf2eee6, 0x9a9aa4];
  function pet(i, fur) {
    const g = new THREE.Group(), F = M(fur ?? FURS[i % FURS.length]), kind = i % 3, shirt = M([0x3a5a9a, 0x8a3a4a, 0x4a6a4a][i % 3]);
    const body = new THREE.Group(); g.add(body);
    body.add(at(box(0.38, 0.46, 0.27, shirt), 0, 0.33, 0));
    for (const s of [-1, 1]) body.add(at(box(0.12, 0.12, 0.13, M(0x1a1a20)), s * 0.1, 0.06, 0.02));   // shoes
    const head = at(new THREE.Group(), 0, 0.78, 0); body.add(head);
    const skull = new THREE.Mesh(new THREE.IcosahedronGeometry(0.24, 1), F); skull.scale.set(1, 0.9, 0.92); head.add(skull);
    const snout = at(new THREE.Mesh(new THREE.IcosahedronGeometry(0.1, 1), M(0xf0e6d8)), 0, -0.07, 0.19); snout.scale.set(1.1, 0.8, 0.9); head.add(snout);
    head.add(at(new THREE.Mesh(new THREE.IcosahedronGeometry(0.035, 0), M(0x151515)), 0, -0.03, 0.28));   // the nose
    for (const e of [-1, 1]) {
      head.add(at(new THREE.Mesh(new THREE.IcosahedronGeometry(0.038, 0), M(0x0e0e0e)), e * 0.1, 0.05, 0.19));
      head.add(at(new THREE.Mesh(new THREE.IcosahedronGeometry(0.012, 0), glow(0xffffff)), e * 0.1 + 0.012, 0.065, 0.225));
      head.add(kind === 0 ? rot(at(cone(0.08, 0.2, 4, F), e * 0.15, 0.27, 0), 0, 0, -e * 0.25) : kind === 1 ? at(box(0.08, 0.3, 0.06, F), e * 0.1, 0.33, 0) : rot(at(box(0.07, 0.24, 0.16, F), e * 0.24, 0.02, 0), 0, 0, e * 0.3));
    }
    head.add(phones(0.44, 0.02));
    return { g, body, head, i };
  }
  // instruments, built along +z from the pet's chest (the player faces +z)
  function trombone() {
    const g = new THREE.Group();
    g.add(at(rot(cyl(0.018, 0.018, 0.62, 5, BRASS), PI / 2, 0, 0), 0.05, 0, 0.31)); g.add(at(rot(cyl(0.018, 0.018, 0.62, 5, BRASS), PI / 2, 0, 0), -0.05, 0, 0.31));
    g.add(at(box(0.12, 0.03, 0.03, BRASS), 0, 0, 0.62)); g.add(at(rot(cone(0.1, 0.18, 8, BRASS), -PI / 2, 0, 0), 0.05, 0, 0.66));
    g.userData.slide = at(box(0.14, 0.035, 0.035, BRASS), 0, -0.02, 0.5); g.add(g.userData.slide);
    return g;
  }
  function sax() {
    const g = new THREE.Group();
    g.add(at(rot(cyl(0.03, 0.05, 0.38, 6, BRASS), 0.35, 0, 0), 0, -0.12, 0.1)); g.add(at(rot(cone(0.08, 0.14, 8, BRASS), PI - 0.6, 0, 0), 0, -0.3, 0.2));
    g.add(at(rot(cyl(0.012, 0.012, 0.16, 4, M(0x1a1a1a)), PI / 2 + 0.5, 0, 0), 0, 0.08, 0.02));
    return g;
  }
  function trumpet() {
    const g = new THREE.Group();
    g.add(at(rot(cyl(0.016, 0.016, 0.3, 5, BRASS), PI / 2, 0, 0), 0, 0, 0.15)); g.add(at(box(0.06, 0.07, 0.08, BRASS), 0, 0.03, 0.12));
    g.add(at(rot(cone(0.07, 0.12, 8, BRASS), -PI / 2, 0, 0), 0, 0, 0.34));
    return g;
  }
  function bass() {   // across the body: natural body, maple neck to the pet's left
    const g = new THREE.Group(), wood = M(0xc88a4a), maple = M(0xf0d890);
    g.add(at(box(0.3, 0.2, 0.05, wood), -0.05, 0, 0)); g.add(at(box(0.14, 0.12, 0.052, M(0x1a1a1a)), -0.02, 0.02, 0.005));
    g.add(at(box(0.52, 0.045, 0.03, maple), 0.33, 0.05, 0.01)); g.add(at(box(0.1, 0.07, 0.03, maple), 0.62, 0.07, 0.01));
    g.rotation.z = 0.35; return g;
  }

  function studio() {
    const G = new THREE.Group();
    // ---------------- the room: dark navy walls, a black ceiling, a charcoal floor ----------------
    const floorT = tex(16, 16, (x, r) => { px(x, '#24222a', 0, 0, 16, 16); px(x, '#1c1a22', 0, 0, 16, 1); px(x, '#1c1a22', 0, 0, 1, 16); noise(x, r, 16, 16, ['#28262e', '#201e26'], 40); }, 1401);
    const W = X[1] - X[0], D = Z[1] - Z[0], cz = (Z[0] + Z[1]) / 2;
    G.add(flat(W, D, mat({ map: floorT, rep: [W / 1.4, D / 1.4] }), 0, 0, cz));
    const wallT = tex(16, 16, (x, r) => { px(x, '#161a30', 0, 0, 16, 16); noise(x, r, 16, 16, ['#1a1e36', '#12162a'], 50); }, 1402);
    room(G, W, D, H, wallT, 1.6, 0x07070c, { cz });
    // a rug under the singer: deep red with a navy border (low contrast: fine patterns alias at 270x480)
    const rugT = tex(16, 12, (x, r) => { px(x, '#3a1a26', 0, 0, 16, 12); px(x, '#1e2440', 0, 0, 16, 1); px(x, '#1e2440', 0, 11, 16, 1); px(x, '#1e2440', 0, 0, 1, 12); px(x, '#1e2440', 15, 0, 1, 12); px(x, '#4a2230', 5, 4, 6, 4); noise(x, r, 16, 12, ['#401e2a', '#34161f'], 30); }, 1403);
    const rug = flat(3.4, 2.6, mat({ map: rugT }), 0.1, 0.004, 0.9); rug.material.polygonOffset = true; rug.material.polygonOffsetFactor = -1; G.add(rug);
    // neon: blue lines slanting across the ceiling and down the walls, the studio's signature
    const neonB = glow(0x3f6aff), neonV = glow(0x8a5aff);
    const strips = [];
    for (let i = 0; i < 9; i++) {
      const s = at(box(0.07, 0.05, 9.5, i % 3 === 1 ? neonV : neonB), -6 + i * 1.5, H - 0.08, cz); s.rotation.y = 0.55 + (i % 2) * 0.18; G.add(s); strips.push([s, i % 3 === 1 ? 0x8a5aff : 0x3f6aff]);
    }
    for (const [x0, z0, ry] of [[X[0] + 0.03, -3.5, PI / 2], [X[0] + 0.03, 2.5, PI / 2], [X[1] - 0.03, -3.0, -PI / 2], [X[1] - 0.03, 3.0, -PI / 2], [-4.5, Z[0] + 0.03, 0], [4.5, Z[0] + 0.03, 0]]) {
      const m = glow(0x3f6aff), s = at(box(0.06, 5.2, 0.05, m), x0, H / 2, z0); s.rotation.set(0, ry, 0.5); G.add(s); strips.push([s, 0x3f6aff]);
    }
    // ribbed acoustic walls: fins lit blue from below, behind the horns (+x) and at the back
    const finM = M(0x1c2240), finGlow = glow(0x2a4aff);
    for (let i = 0; i < 18; i++) { G.add(at(box(0.12, 3.4, 0.45, finM), X[1] - 0.3, 1.7, -5.8 + i * 0.62)); G.add(at(box(0.14, 0.04, 0.47, finGlow), X[1] - 0.3, 0.05, -5.8 + i * 0.62)); }
    for (let i = 0; i < 14; i++) { G.add(at(box(0.45, 3.4, 0.12, finM), -4.4 + i * 0.62, 1.7, Z[0] + 0.3)); G.add(at(box(0.47, 0.04, 0.14, finGlow), -4.4 + i * 0.62, 0.05, Z[0] + 0.3)); }
    // dark blue drapes on the left wall
    const drapeT = tex(8, 16, (x, r) => { for (let i = 0; i < 8; i++) px(x, i % 2 ? '#141a3a' : '#1c2450', i, 0, 1, 16); noise(x, r, 8, 16, ['#10152e'], 10); }, 1404);
    G.add(rot(at(new THREE.Mesh(new THREE.PlaneGeometry(D - 1, H - 0.2), mat({ map: drapeT, rep: [(D - 1) / 1.2, 1] })), X[0] + 0.08, H / 2, cz), 0, PI / 2, 0));

    // ---------------- the red backdrop behind the singer (self-lit), with our parody of the show's board ----------------
    const PW = 3.2, PH = 3.3, PX = -0.1;
    // the text sits beside his head, not over it (the karaoke owns the frame's top quarter): "RADIO" + the badge at y ~1.55 m,
    // "LIVE LOUNGE" at ~1.3 m, from x -1.57 to -0.5 (his head spans -0.5..0.5 from the front; a camera looking a little to
    // his right shows it beside him). 80 texels a metre: 256 x 264 for the 3.2 x 3.3 m panel.
    const panelT = tex(256, 264, (x, r) => {
      const gr = x.createRadialGradient(170, 150, 16, 128, 132, 220); gr.addColorStop(0, '#e0203c'); gr.addColorStop(1, '#8a0a1e'); x.fillStyle = gr; x.fillRect(0, 0, 256, 264);
      for (let i = 0; i < 30; i++) { const cx = r() * 256, cy = r() * 264, rad = 10 + r() * 24; x.fillStyle = r() < 0.5 ? 'rgba(90,0,14,0.55)' : 'rgba(255,90,110,0.25)'; x.beginPath(); x.arc(cx, cy, rad, 0, TAU); x.fill(); }
      x.fillStyle = '#ffffff'; x.font = 'bold 20px sans-serif'; x.textBaseline = 'middle'; x.textAlign = 'left';
      x.fillText('RADIO', 10, 140); pawBadge(x, 90, 139, 11);
      x.fillStyle = '#ffffff'; x.font = 'bold 13px sans-serif'; x.fillText('LIVE LOUNGE', 10, 161);   // white again: pawBadge left the fill black
    }, 1405);
    G.add(at(new THREE.Mesh(new THREE.PlaneGeometry(PW, PH), mat({ map: panelT, unlit: 0.8 })), PX, PH / 2, PANEL_Z));
    G.add(at(box(PW + 0.1, PH + 0.1, 0.06, BLACK), PX, PH / 2, PANEL_Z - 0.05));
    // the mic stand: a round base, a pole, the mic angled up at his muzzle
    const micG = new THREE.Group(); G.add(micG);
    const [mx, my, mz] = MIC_POS, baseZ = mz + 0.1;
    micG.add(at(cyl(0.13, 0.14, 0.025, 8, BLACK), mx, 0.012, baseZ));
    micG.add(at(cyl(0.012, 0.012, my - 0.07, 5, METAL), mx, (my - 0.07) / 2, baseZ));
    const mic = at(new THREE.Group(), mx, my - 0.06, baseZ); mic.rotation.x = -0.9; micG.add(mic);
    mic.add(at(cyl(0.016, 0.022, 0.13, 6, BLACK), 0, 0.06, 0)); mic.add(at(new THREE.Mesh(new THREE.IcosahedronGeometry(0.036, 1), CHROME), 0, 0.14, 0));

    // ---------------- the drum booth and the kit (a seated chibi: the paws at ~0.35 m) ----------------
    const [bx0, bx1, bz0, bz1] = BOOTH, BH = 2.2, frameM = M(0xb8bcc6);
    for (const [x, z] of [[bx0, bz0], [bx0, bz1], [bx1, bz0], [bx1, bz1]]) G.add(at(box(0.05, BH, 0.05, frameM), x, BH / 2, z));
    G.add(at(box(bx1 - bx0, 0.05, 0.05, frameM), (bx0 + bx1) / 2, BH, bz0)); G.add(at(box(bx1 - bx0, 0.05, 0.05, frameM), (bx0 + bx1) / 2, BH, bz1));
    G.add(at(box(0.05, 0.05, bz1 - bz0, frameM), bx1, BH, (bz0 + bz1) / 2)); G.add(at(box(0.05, 0.05, bz1 - bz0, frameM), bx0, BH, (bz0 + bz1) / 2));
    const boothRug = flat(bx1 - bx0 - 0.1, bz1 - bz0 - 0.1, M(0x2a2034), (bx0 + bx1) / 2, 0.006, (bz0 + bz1) / 2); boothRug.material.polygonOffset = true; boothRug.material.polygonOffsetFactor = -2; G.add(boothRug);
    const shell = M(0x2a48b0), skin = M(0xeae6dc), cymM = mat({ color: 0xd8a848, unlit: 0.15 });
    const [dx, dz] = DRUMMER, [sx, sz] = SNARE;
    G.add(at(rot(cyl(0.2, 0.2, 0.3, 10, shell), 0, 0, PI / 2), dx + 0.62, 0.2, dz));                 // the kick
    G.add(at(rot(cyl(0.19, 0.19, 0.012, 10, skin), 0, 0, PI / 2), dx + 0.78, 0.2, dz));
    const kickLogoT = tex(16, 16, x => { px(x, '#eae6dc', 0, 0, 16, 16); pawBadge(x, 8, 8, 5); }, 1407);
    G.add(rot(at(new THREE.Mesh(new THREE.PlaneGeometry(0.2, 0.2), mat({ map: kickLogoT })), dx + 0.79, 0.2, dz), 0, PI / 2, 0));
    const drum = (r, h, x, y, z, tilt = 0) => { const g = at(new THREE.Group(), x, y, z); g.rotation.z = tilt; g.add(cyl(r, r, h, 10, shell)); g.add(at(cyl(r * 0.96, r * 0.96, 0.008, 10, skin), 0, h / 2 + 0.004, 0)); g.add(at(cyl(r + 0.008, r + 0.008, 0.012, 10, CHROME), 0, h / 2, 0)); G.add(g); return g; };
    drum(0.12, 0.08, sx, 0.3, sz, 0.12);                            // the snare, at her left knee
    drum(0.09, 0.08, dx + 0.5, 0.5, dz - 0.34, 0.35); drum(0.09, 0.08, dx + 0.5, 0.5, dz + 0.34, 0.35);   // rack toms off to the sides (in front they hid her paws on the snare)
    drum(0.13, 0.2, dx + 0.3, 0.2, dz + 0.3, 0.05);                 // the floor tom at her right
    G.add(at(cyl(0.008, 0.008, 0.3, 4, METAL), sx, 0.15, sz));
    const cymbals = {};
    const cymbal = (name, r, x, y, z, rx, rz) => { const g = new THREE.Group(); g.add(at(cyl(0.008, 0.008, y, 4, METAL), x, y / 2, z)); const c = at(cyl(r, r * 0.2, 0.012, 12, cymM), x, y, z); c.rotation.set(rx, 0, rz); g.add(c); G.add(g); cymbals[name] = { g, c, rx, rz }; return g; };
    cymbal('hat', 0.12, sx + 0.02, 0.44, sz - 0.2, 0, 0); G.add(at(cyl(0.12, 0.024, 0.012, 12, cymM), sx + 0.02, 0.41, sz - 0.2));
    cymbal('crash', 0.17, dx + 0.5, 0.78, dz - 0.36, -0.25, 0.25);
    cymbal('ride', 0.19, dx + 0.46, 0.72, dz + 0.42, 0.28, 0.22);
    G.add(at(cyl(0.14, 0.12, 0.05, 8, M(0x1a1a20)), dx - 0.05, 0.1, dz)); G.add(at(cyl(0.02, 0.02, 0.1, 4, METAL), dx - 0.05, 0.05, dz));   // the stool

    // ---------------- the keyboard on its X-stand, the daisies at its +z end ----------------
    const [kx, kz] = KEYS, keysT = tex(32, 4, x => { px(x, '#f4f2ea', 0, 0, 32, 4); for (let i = 0; i < 32; i += 2) px(x, '#2a2a2a', i, 0, 1, 4); for (let i = 1; i < 32; i += 7) { px(x, '#101010', i, 0, 1, 2); px(x, '#101010', i + 2, 0, 1, 2); px(x, '#101010', i + 4, 0, 1, 2); } }, 1408);
    G.add(at(box(0.24, 0.06, KEYS_LEN, BLACK), kx, KEYS_Y - 0.03, kz));
    const keysTop = at(new THREE.Mesh(new THREE.PlaneGeometry(KEYS_LEN - 0.06, 0.12), mat({ map: keysT })), kx + 0.04, KEYS_Y + 0.002, kz); keysTop.rotation.set(-PI / 2, 0, PI / 2); G.add(keysTop);
    G.add(at(box(0.05, 0.05, KEYS_LEN, M(0x2a2a34)), kx - 0.1, KEYS_Y + 0.02, kz));   // the panel behind the keys
    for (const s of [-1, 1]) for (const lean of [0.6, -0.6]) { const leg = at(box(0.03, 0.44, 0.03, METAL), kx, KEYS_Y / 2 - 0.02, kz + s * 0.28); leg.rotation.x = lean; G.add(leg); }
    // the vase (pale blue ceramic) and three daisies, their faces turned to +x/+z (the cameras); 12 petals each
    const [vx, vz] = VASE, vy = KEYS_Y;
    G.add(at(cyl(0.05, 0.065, 0.16, 8, M(0x8ab8e8)), vx, vy + 0.08, vz));
    const petalM = mat({ color: 0xffffff, unlit: 0.45 }), centreM = mat({ color: 0xffc820, unlit: 0.4 }), stemM = M(0x3a8a3a);
    const petals = [];
    [[-0.04, 0.34, -0.02, 0.35], [0.03, 0.4, 0.03, -0.1], [0.0, 0.29, 0.05, 0.25]].forEach(([ox, h, oz, lean], d) => {
      const st = at(box(0.012, h, 0.012, stemM), vx + ox, vy + 0.12 + h / 2, vz + oz); st.rotation.z = lean * 0.3; G.add(st);
      const fl = at(new THREE.Group(), vx + ox - Math.sin(lean * 0.3) * h / 2, vy + 0.12 + h, vz + oz); fl.rotation.set(0, PI / 4 + d * 0.3, 0); G.add(fl);
      const face = new THREE.Group(); face.rotation.x = -0.35; fl.add(face);
      const ctr = cyl(0.03, 0.03, 0.02, 8, centreM); ctr.rotation.x = PI / 2; face.add(ctr);
      for (let i = 0; i < 12; i++) { const a = i / 12 * TAU, p = at(box(0.028, 0.075, 0.008, petalM), Math.sin(a) * 0.065, Math.cos(a) * 0.065, 0); p.rotation.z = -a; face.add(p); petals.push(p); }
    });
    // loose petals on the keys and the floor below (P.pile)
    const loose = [];
    // on the keyboard's dark back panel and body and on the floor round the stand, where white shows (on the white keys they vanished)
    for (let i = 0; i < 30; i++) { const onKeys = i < 12, p = at(box(0.04, 0.008, 0.09, petalM), onKeys ? kx - 0.1 + (hash(i, 1409) - 0.5) * 0.05 : kx + (hash(i, 1409) - 0.5) * 0.9, onKeys ? KEYS_Y + 0.05 : 0.006, onKeys ? kz + 0.4 - hash(i, 1410) * 0.8 : kz + 0.4 - hash(i, 1410) * 1.1); p.rotation.y = hash(i, 1411) * TAU; G.add(p); loose.push(p); }

    // ---------------- amps, the band's pets, the blossom, the plants ----------------
    const amp = (x, z, ry, w = 0.5, h = 0.46) => { const g = at(new THREE.Group(), x, 0, z); g.rotation.y = ry; g.add(at(box(w, h, 0.3, M(0x1e1e24)), 0, h / 2, 0)); g.add(at(box(w - 0.06, h * 0.55, 0.01, M(0x2e2a26)), 0, h * 0.38, 0.152)); g.add(at(box(w - 0.06, 0.08, 0.01, M(0xc8b890)), 0, h - 0.07, 0.152)); G.add(g); return g; };
    amp(AMP[0], AMP[1], 0.6);   // one guitar amp, out of every lens's way (one stood under the singer in the band wide)
    const guests = [];
    const horn = [trombone(), sax(), trumpet()];
    HORNS.forEach(([x, z], i) => {
      const p = pet(i + 1); p.g.position.set(x, 0, z); p.g.rotation.y = Math.atan2(0.3 - x, 1.2 - z); G.add(p.g);
      const inst = horn[i]; inst.scale.setScalar(1.3); p.body.add(inst); p.inst = inst;   // a little oversized so the brass reads at 270x480
      guests.push({ p, x, z, kind: 'horn', n: i });
    });
    { const p = pet(0); p.g.position.set(BASS[0], 0, BASS[1]); p.g.rotation.y = Math.atan2(3.6 - BASS[0], 5.0 - BASS[1]); G.add(p.g); const b = bass(); b.position.set(0, 0.36, 0.17); p.body.add(b); guests.push({ p, x: BASS[0], z: BASS[1], kind: 'bass' }); }
    // the white blossom by the horns (the session's flowers in the foreground of the horn shots)
    const blossom = at(new THREE.Group(), BLOSSOM[0], 0, BLOSSOM[1]); G.add(blossom);
    blossom.add(at(cyl(0.08, 0.1, 0.32, 8, M(0xe8e4dc)), 0, 0.16, 0));
    const bloomM = mat({ color: 0xfff4f8, unlit: 0.5 });
    for (let i = 0; i < 7; i++) {
      const a = i / 7 * TAU, br = at(box(0.015, 0.7, 0.015, M(0x4a3a2a)), Math.sin(a) * 0.08, 0.62, Math.cos(a) * 0.08); br.rotation.set(Math.cos(a) * 0.35, 0, -Math.sin(a) * 0.35); blossom.add(br);
      for (let j = 0; j < 5; j++) blossom.add(at(new THREE.Mesh(new THREE.IcosahedronGeometry(0.045 + 0.02 * hash(i, j + 1412), 0), bloomM), Math.sin(a) * (0.1 + j * 0.05) + (hash(i, j + 1413) - 0.5) * 0.06, 0.45 + j * 0.12, Math.cos(a) * (0.1 + j * 0.05)));
    }
    const plant = (x, z, s = 1) => {
      const g = at(new THREE.Group(), x, 0, z); g.scale.setScalar(s); G.add(g);
      g.add(at(cyl(0.22, 0.17, 0.45, 8, M(0x2a2a30)), 0, 0.225, 0));
      const leafM = M(0x2f7a3a), leafM2 = M(0x3f9a48);
      for (let i = 0; i < 11; i++) { const a = i / 11 * TAU + hash(i, 1414), l = at(box(0.3, 0.02, 0.62, i % 2 ? leafM : leafM2), Math.sin(a) * 0.3, 0.75 + hash(i, 1415) * 0.9, Math.cos(a) * 0.3); l.rotation.set(-0.5 - hash(i, 1416) * 0.4, a, 0, 'YXZ'); g.add(l); }
      return g;
    };
    plant(6.6, -3.9, 1.3); plant(-5.9, -3.4, 1.3); plant(5.6, 3.9, 1.1); plant(-5.4, 4.6, 1.2); plant(5.4, -0.6, 1.0); plant(-3.9, -2.0, 1.1);

    return {
      group: G, sky: null, shadowCol: 0x141218, indoor: true,
      light() {
        lights(0x2c3160, 0x8a96c8, [0.3, -1, 0.55], 0x05060f, [16, 42], 7);
        pt(0, 0.35, 2.3, 1.7, 0.95, 0.78, 0.62);       // the warm key on the singer
        pt(1, DRUMMER[0] + 0.5, 2.4, DRUMMER[1], 0.28, 0.38, 0.95);
        pt(2, KOB[0] + 0.6, 2.4, 0.2, 0.55, 0.36, 0.95);
        pt(3, 0, 2.2, 3.6, 0.3, 0.34, 0.62);
      },
      anim(t, P = {}) {
        if (P.key) pt(3, P.key[0], P.key[1], P.key[2], P.key[3], P.key[4], P.key[5]);
        const c = P.t0 != null ? t - P.t0 : 0, stopped = P.stop != null && c >= P.stop, b = beat(stopped ? P.t0 + P.stop : t);
        const fb = ((b % 1) + 1) % 1;   // before the first beat the beat index is negative
        strips.forEach(([s, col]) => s.material.uniforms.uCol.value.set(col).multiplyScalar(stopped ? 0.9 : 0.85 + 0.15 * Math.exp(-fb * 4)));
        micG.visible = !P.noMic; blossom.visible = P.blossom !== false;
        cymbals.ride.g.visible = !P.noRide; cymbals.crash.g.visible = !P.noCrash;
        for (const [name, q] of Object.entries(cymbals)) q.c.rotation.set(q.rx + (stopped ? 0 : 0.06 * Math.exp(-fb * 6) * (name === 'hat' ? 0.3 : 1)), 0, q.rz);
        // the daisies: the last daisy is plucked first; loose petals pile up on the keys and the floor
        const left = P.petals ?? 36; petals.forEach((p, i) => { p.visible = i < left; });
        const pile = Array.isArray(P.pile) ? P.pile[0] + Math.floor(Math.max(0, b - beat(P.t0 ?? t)) * P.pile[1]) : (P.pile || 0);   // [n0, per beat]: the pile grows as she plucks
        loose.forEach((p, i) => { p.visible = i < pile; });
        // the band's pets nod on the beat; the horns come up to play on `horns`
        const hornsUp = P.horns === true ? 1 : P.horns != null && P.horns !== false ? sm((c - P.horns) / 0.35) : 0;
        guests.forEach((q, i) => {
          const { p } = q, show = !P.noguests && !cleared(P, q.x, q.z); p.g.visible = show; if (!show) return;
          const bb = b + i * 0.13, nod = stopped ? 0 : Math.abs(Math.sin(bb * PI));
          p.body.position.y = 0.02 * nod; p.head.rotation.x = 0.12 * nod; p.body.rotation.z = stopped ? 0 : 0.05 * Math.sin(bb * PI);
          if (q.kind !== 'horn') return;
          const inst = p.inst, up = hornsUp;
          if (q.n === 1) { inst.position.set(0, 0.36 + 0.3 * up, 0.18); inst.rotation.set(-0.2 + 0.2 * up, 0, 0); }        // the sax, hanging, then at the mouth
          else { inst.position.set(0, 0.34 + 0.42 * up, 0.16 + 0.08 * up); inst.rotation.set(1.1 * (1 - up) - (q.n === 0 ? 0.08 : 0.12) * up, 0, 0); }   // trombone and trumpet: down at the chest, then up to the mouth, level
          if (inst.userData.slide) inst.userData.slide.position.z = 0.5 + (stopped ? 0 : 0.12 * up * Math.sin(bb * PI));
          if (up) p.head.rotation.x = -0.05;
        });
      },
    };
  }
  return { studio: studio() };
}
