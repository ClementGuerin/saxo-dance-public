// maps51.js: the "Ordinary" map (2026-10-16, Alex Warren, 2025; the clip: a man waiting in a teal-lit laundromat sees a
// girl across the machines, their hands touch over the laundry, a washing machine's drum turns into a portal of light and
// the two drift through a forest, a beach and a desert at golden hour). Same contract as the other map files, pure in t:
//   laundromat  a laundromat late at night (y = 0): a checker floor, pale aqua walls over white tiles, fluorescent strips;
//               seven columns of stacked dryers along the back wall (DRY_X, front face DRY_Z, door centres DRY_Y, glass
//               DOOR_R), their drums tumbling laundry and glowing warm; front-loaders along the left wall (WASH_Z, front
//               face WASH_X, facing +x) with blue suds swirling; the folding table in the middle (TABLE [x0, x1, z0, z1],
//               top TABLE_Y 0.48) with the folder's mark behind it (FOLDER, facing +z); a wire laundry cart on castors
//               (CART, its floor CART_Y, its rim CART_TOP); the attendant's counter along the right wall (COUNTER, top
//               COUNTER_Y, her mark ATTENDANT facing -x); plastic chairs (CHAIRS) with box-pet customers; a LAUNDRY neon
//               over the dryers and a NO PETS sign beside them (NOPETS); the night street through the front windows.
//               Flags: `zone` 'night' (the default: cool fluorescent) | 'heaven' (warm gold: an angel up in the clouds);
//               `heaven` (0-1 or a ramp) blends towards it; `run` (false stops the drums); `doors` [[col, row, 0-1 or a
//               ramp]] (a dryer door swung open, hinged on its left); `cloud` [{ from: [col, row], x, z, s0, n, r, h }]
//               (warm laundry billowing out of that dryer onto a heap round (x, z): r wide, h high; s0 < 0: already
//               there); `pile` [{ x, z, y, r, h, n }] (a heap of clean laundry); `stack` [{ x, z, y, n, grow: [s0,
//               beats, n0], fall: s, dir, spread, freeze }] (folded towels piled up; grown one per `beats` from s0;
//               toppling at `fall` towards dir deg and scattering over `spread` m; `freeze` s stops them mid-air);
//               `socks` [[x, y, z, yaw]] (odd socks lying about); `steam` [[x, y, z]] (warm wisps off fresh laundry);
//               `rays` [[x, z, r]] (a soft shaft of light from above); `sparkle` [[x, y, z, r]] (golden specks rising);
//               `customers` 'wait' | 'stare' | 'gasp' | 'cheer' | false; `stare` [x, z]; `hearts` [[x, y, z, s0]] +
//               `heartYaw`; `stop` (s: the drums, the steam, the sparkles and falling towels freeze: the dead stop);
//               `cart` { x, z, yaw, to: [x, z], at, dur } (the cart moved); `hide` ['table', 'cart', 'counter',
//               'chairs', 'neon', 'sign', 'washers']; `clear` [[x, z, r]]; `noguests`; `key`.
import { mapKit } from './mapkit.js';

export const LAUNDRO = {
  X: 6.5, Z0: -5.6, Z1: 8.4, H: 4.6,
  DRY_X: [-4.2, -2.8, -1.4, 0, 1.4, 2.8, 4.2], DRY_Z: -4.75, DRY_Y: [0.62, 1.72], DOOR_R: 0.42, DRY_W: 1.3, DRY_TOP: 2.3,
  WASH_X: -5.45, WASH_Z: [-3.4, -2.2, -1.0, 0.2, 1.4, 2.6, 3.8], WASH_Y: 0.55, WASH_R: 0.32,
  TABLE: [-1.7, 1.7, -0.3, 1.0], TABLE_Y: 0.48,   // low enough for a chibi's paws to fold on it (at 0.62 they and the towel were under its top)
  FOLDER: [0, -0.55],
  STACK: [0.85, 0.2],
  CART: [-2.6, 1.6], CART_Y: 0.46, CART_TOP: 0.86,
  COUNTER: [4.75, 5.45, 1.6, 3.8], COUNTER_Y: 0.6, ATTENDANT: [5.95, 2.7],
  NOPETS: [5.4, 1.55],
  CHAIRS: [[6.0, -1.7], [6.0, -0.95], [6.0, -0.2], [6.0, 0.55]],
  TOWEL: [0.52, 0.08, 0.38],
};
export const LAUNDRY_COLS = [0xa8e6d4, 0xffc2d6, 0xd6c2f0, 0xfff0a8, 0xf8f6f0, 0xa8d4f4, 0xffd0a8];   // mint, pink, lilac, butter, white, sky, peach

export function buildLaundromatMaps(K) {
  const k = mapKit(K);
  const { THREE, mat, tex, px, noise, box, TAU, PI, beat, hash, fr, cyl, cone, ico, at, rot, flat, lights, pt } = k;
  const M = (c, o = {}) => mat({ color: c, ...o }), glow = (c, u = 1) => mat({ color: c, unlit: u });
  const cl = x => Math.max(0, Math.min(1, x)), sm = x => { x = cl(x); return x * x * (3 - 2 * x); };
  const ramp = (v, s) => Array.isArray(v) ? v[2] + (v[3] - v[2]) * cl((s - v[0]) / Math.max(0.01, v[1] - v[0])) : (v === true ? 1 : (v || 0));
  const shotT = (t, P) => P.t0 != null ? t - P.t0 : 0;
  const cleared = (P, x, z) => (P.clear || []).some(([cx, cz, r]) => (x - cx) ** 2 + (z - cz) ** 2 < r * r);
  const S = LAUNDRO;
  const CHROME = M(0xc8ccd4, { unlit: 0.2 }), STEEL = M(0xdfe3e8, { unlit: 0.12 }), DARK = M(0x2a2e36);

  // ---------- textures ----------
  const floorT = tex(16, 16, (x, r) => { px(x, '#cfc8b8', 0, 0, 16, 16); px(x, '#b4ccc4', 0, 0, 8, 8); px(x, '#b4ccc4', 8, 8, 8, 8); noise(x, r, 16, 16, ['rgba(80,90,90,.05)'], 40); }, 5101);   // 2 m of 1 m cells: cream and pale mint, low contrast
  const wallT = tex(32, 64, (x, r) => {
    px(x, '#bfe3dc', 0, 0, 32, 64); noise(x, r, 32, 64, ['rgba(60,110,100,.05)'], 60);
    px(x, '#f2f4f2', 0, 44, 32, 20); for (let yy = 44; yy < 64; yy += 5) px(x, '#d8dedc', 0, yy, 32, 1); for (let xx = 0; xx < 32; xx += 8) px(x, '#d8dedc', xx, 44, 1, 20);   // white tiles to ~1.25 m
    px(x, '#5aa89a', 0, 42, 32, 2);   // a teal tile border
  }, 5102);
  const ceilT = tex(16, 16, (x, r) => { px(x, '#eef0ee', 0, 0, 16, 16); px(x, '#d6dad8', 0, 0, 16, 1); px(x, '#d6dad8', 0, 0, 1, 16); }, 5103);
  // a drum's tumbling laundry: colourful lumps on a dark steel ground, seen through the round glass
  const drumT = tex(32, 32, (x, r) => {
    px(x, '#3a3e46', 0, 0, 32, 32);
    const cols = ['#a8e6d4', '#ffc2d6', '#d6c2f0', '#fff0a8', '#f8f6f0', '#a8d4f4', '#ffd0a8', '#e85a5a'];
    for (let i = 0; i < 26; i++) { const c = cols[Math.floor(r() * cols.length)], a = r() * TAU, d = 3 + r() * 11; const cx = 16 + Math.cos(a) * d, cy = 16 + Math.sin(a) * d; x.fillStyle = c; x.beginPath(); x.ellipse(cx, cy, 2 + r() * 3, 1.5 + r() * 2, r() * 3, 0, TAU); x.fill(); }
  }, 5104);
  const sudsT = tex(32, 32, (x, r) => {
    px(x, '#5aa0d8', 0, 0, 32, 32);
    for (let i = 0; i < 40; i++) { x.fillStyle = r() < 0.6 ? '#eaf6ff' : '#bfe0f8'; x.beginPath(); x.arc(r() * 32, 4 + r() * 16, 1 + r() * 2.5, 0, TAU); x.fill(); }
    for (let i = 0; i < 8; i++) { x.fillStyle = ['#ffc2d6', '#fff0a8', '#f8f6f0'][i % 3]; x.fillRect(r() * 28, 18 + r() * 12, 3, 2); }
  }, 5105);
  const noPetsT = tex(48, 48, x => {
    px(x, '#ffffff', 0, 0, 48, 48);
    x.fillStyle = '#2a2a2a'; const pad = (cx, cy, rx, ry) => { x.beginPath(); x.ellipse(cx, cy, rx, ry, 0, 0, TAU); x.fill(); };
    pad(24, 28, 7, 6); pad(16, 19, 3, 3.6); pad(21, 15, 3, 3.6); pad(27, 15, 3, 3.6); pad(32, 19, 3, 3.6);   // a paw print
    x.strokeStyle = '#d42020'; x.lineWidth = 4; x.beginPath(); x.arc(24, 24, 19, 0, TAU); x.stroke();
    x.beginPath(); x.moveTo(11, 11); x.lineTo(37, 37); x.stroke();
  }, 5106);
  const neonT = tex(64, 16, x => { px(x, '#1a1420', 0, 0, 64, 16); x.fillStyle = '#ff6ab0'; x.font = 'bold 12px monospace'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('LAUNDRY', 32, 9); }, 5107);
  const streetT = tex(64, 32, (x, r) => {
    const g = x.createLinearGradient(0, 0, 0, 32); g.addColorStop(0, '#0e1430'); g.addColorStop(1, '#1c2440'); x.fillStyle = g; x.fillRect(0, 0, 64, 32);
    for (let i = 0; i < 6; i++) { px(x, '#141a2c', i * 11, 6 + (i % 3) * 3, 9, 26); for (let yy = 9 + (i % 3) * 3; yy < 28; yy += 4) for (let xx = i * 11 + 1; xx < i * 11 + 8; xx += 3) if (r() < 0.45) px(x, '#ffd890', xx, yy, 2, 2); }
    px(x, '#2a2e3a', 0, 27, 64, 5); px(x, '#ffe2a0', 50, 10, 2, 2); px(x, '#8a8a90', 50.5, 12, 1, 15);
  }, 5108);

  // ---------- box pets: customers waiting for their wash (a magazine, the machines) ----------
  const FURS = [0xf2eee6, 0xd8a868, 0x9a9aa4, 0xe8c090, 0x8a7a6c, 0xc8b8a8, 0x6a5a4c, 0xe0d0b8];
  const TOPS = [0x5a7ad8, 0xe86a8a, 0x6ac0a0, 0xd8b04a, 0x9a6ad0, 0x4a4a58];
  function pet(i) {
    const g = new THREE.Group(), F = M(FURS[i % FURS.length]), ears = i % 3, body = new THREE.Group(); g.add(body);
    const top = M(TOPS[i % TOPS.length]);
    const legs = [-1, 1].map(sx => { const l = at(new THREE.Group(), sx * 0.1, 0.3, 0); l.add(at(box(0.13, 0.3, 0.13, M(0x3a3e4a)), 0, -0.15, 0)); body.add(l); return l; });
    body.add(at(box(0.4, 0.38, 0.28, top), 0, 0.52, 0));
    const arms = [-1, 1].map(sx => { const a = at(new THREE.Group(), sx * 0.23, 0.66, 0); a.add(at(box(0.09, 0.28, 0.09, top), 0, -0.12, 0)); a.add(at(box(0.08, 0.08, 0.08, F), 0, -0.28, 0)); body.add(a); return a; });
    const mag = at(box(0.2, 0.26, 0.02, M([0xe84a4a, 0x4a8ae8, 0xf2c94c][i % 3], { unlit: 0.3 })), 0, 0.52, 0.22); mag.visible = false; body.add(mag);
    const head = at(new THREE.Group(), 0, 0.94, 0); body.add(head);
    const skull = ico(0.24, 1, F); skull.scale.set(1, 0.9, 0.92); head.add(skull);
    const snout = at(ico(0.1, 1, M(0xf0e6d8)), 0, -0.07, 0.19); snout.scale.set(1.1, 0.8, 0.9); head.add(snout);
    head.add(at(ico(0.035, 0, M(0x151515)), 0, -0.03, 0.28));
    const mouth = at(box(0.09, 0.07, 0.02, M(0x5a1a1a)), 0, -0.13, 0.25); mouth.visible = false; head.add(mouth);
    for (const e of [-1, 1]) {
      head.add(at(ico(0.038, 0, M(0x0e0e0e)), e * 0.1, 0.05, 0.19)); head.add(at(ico(0.012, 0, glow(0xffffff)), e * 0.1 + 0.012, 0.065, 0.225));
      head.add(ears === 0 ? rot(at(cone(0.08, 0.2, 4, F), e * 0.15, 0.27, 0), 0, 0, -e * 0.25) : ears === 1 ? at(box(0.08, 0.3, 0.06, F), e * 0.1, 0.33, 0) : rot(at(box(0.07, 0.24, 0.16, F), e * 0.24, 0.02, 0), 0, 0, e * 0.3));
    }
    return { g, body, head, arms, legs, mouth, mag, i };
  }
  const turnTo = (q, x, z, P, yaw) => { if (!P.stare) return; const a = Math.atan2(P.stare[0] - x, P.stare[1] - z) - yaw; q.head.rotation.y = Math.max(-1.2, Math.min(1.2, Math.atan2(Math.sin(a), Math.cos(a)))); };
  const reset = q => { q.body.position.set(0, 0, 0); q.body.rotation.set(0, 0, 0); q.head.rotation.set(0, 0, 0); q.mouth.visible = false; q.mag.visible = false; q.arms.forEach(a => a.rotation.set(0, 0, 0)); q.legs.forEach(l => l.rotation.set(0, 0, 0)); };

  // ---------- a folded towel, a lump of clean laundry, an odd sock ----------
  const towelMats = LAUNDRY_COLS.map(c => M(c, { unlit: 0.25 })), lumpMats = LAUNDRY_COLS.map(c => M(new THREE.Color(c).lerp(new THREE.Color(0xffffff), 0.35).getHex(), { unlit: 0.3 })), bandMats = LAUNDRY_COLS.map(c => M(new THREE.Color(c).multiplyScalar(0.82).getHex(), { unlit: 0.2 }));
  function towel(i) {   // folded: a soft slab with a darker band and a rounded fold edge at the front
    const g = new THREE.Group(), [w, h, d] = S.TOWEL, m = towelMats[i % towelMats.length];
    g.add(box(w, h, d, m)); g.add(at(box(w + 0.004, h * 0.4, d + 0.004, bandMats[i % bandMats.length]), 0, -h * 0.1, 0));
    const fold = new THREE.Mesh(new THREE.CylinderGeometry(h / 2, h / 2, w, 6), m); fold.rotation.z = PI / 2; fold.position.set(0, 0, d / 2); g.add(fold);
    return g;
  }
  function lump(i) {   // a crumpled piece of clean laundry: flat and tilted like cloth (round lumps read as a ball pit; big ones filled the frame)
    const q = ico(1, 1, lumpMats[(i * 3 + 1) % lumpMats.length]); q.scale.set(0.15 + 0.08 * hash(i, 5111), 0.028 + 0.02 * hash(i, 5112), 0.1 + 0.06 * hash(i, 5113)); q.rotation.set((hash(i, 5114) - 0.5) * 1.2, hash(i, 5115) * TAU, (hash(i, 5116) - 0.5) * 1.0); return q;
  }
  const sockMats = [M(0xf8f6f0, { unlit: 0.25 }), M(0xff9ab8, { unlit: 0.25 }), M(0xa8d4f4, { unlit: 0.25 })], stripeM = M(0xe85a5a, { unlit: 0.3 });
  function sock(i) {
    const g = new THREE.Group(), m = sockMats[i % sockMats.length];
    g.add(at(box(0.075, 0.035, 0.24, m), 0, 0, 0)); g.add(at(box(0.08, 0.04, 0.05, stripeM), 0, 0, -0.09));
    const foot = at(box(0.075, 0.035, 0.11, m), 0.03, 0, 0.16); foot.rotation.y = 0.5; g.add(foot);
    return g;
  }

  function laundromat() {
    const G = new THREE.Group();
    const W = 2 * S.X, D = S.Z1 - S.Z0, ZC = (S.Z0 + S.Z1) / 2;
    G.add(flat(W, D, mat({ map: floorT, rep: [W / 2, D / 2] }), 0, 0, ZC));
    const wall = (w, h) => new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat({ map: wallT, rep: [w / 2.2, 1], unlit: 0.05 }));
    G.add(at(wall(W, S.H), 0, S.H / 2, S.Z0));
    G.add(rot(at(wall(D, S.H), -S.X, S.H / 2, ZC), 0, PI / 2, 0));
    G.add(rot(at(wall(D, S.H), S.X, S.H / 2, ZC), 0, -PI / 2, 0));
    const ceil = new THREE.Mesh(new THREE.PlaneGeometry(W, D), mat({ map: ceilT, rep: [W / 1.2, D / 1.2] })); ceil.rotation.x = PI / 2; G.add(at(ceil, 0, S.H, ZC));
    // the fluorescent strips
    const tubeM = glow(0xf4fff8, 1);
    for (const x of [-3.8, 0, 3.8]) for (const z of [-3.5, 0, 3.5, 7]) G.add(at(box(0.22, 0.05, 1.8, tubeM), x, S.H - 0.03, z));
    // the front wall with three big windows on the night street
    const front = new THREE.Group(); G.add(front);
    const wallM = mat({ map: wallT, rep: [1, 1], unlit: 0.05 });
    for (const [x, w] of [[-6.05, 0.9], [-2.25, 0.5], [2.25, 0.5], [6.05, 0.9]]) front.add(rot(at(new THREE.Mesh(new THREE.PlaneGeometry(w, S.H), wallM), x, S.H / 2, S.Z1), 0, PI, 0));
    front.add(rot(at(new THREE.Mesh(new THREE.PlaneGeometry(W, S.H - 2.9), wallM), 0, 2.9 + (S.H - 2.9) / 2, S.Z1), 0, PI, 0));
    front.add(rot(at(new THREE.Mesh(new THREE.PlaneGeometry(W, 0.5), wallM), 0, 0.25, S.Z1), 0, PI, 0));
    front.add(rot(at(new THREE.Mesh(new THREE.PlaneGeometry(W + 6, 5), mat({ map: streetT, unlit: 0.9, nofog: true })), 0, 2.2, S.Z1 + 3.5), 0, PI, 0));
    for (const x of [-4, 0, 4]) { front.add(at(box(0.08, 2.4, 0.08, CHROME), x - 1.75, 1.7, S.Z1 - 0.02)); front.add(at(box(0.08, 2.4, 0.08, CHROME), x + 1.75, 1.7, S.Z1 - 0.02)); }
    front.add(at(box(W, 0.08, 0.1, CHROME), 0, 2.9, S.Z1 - 0.02)); front.add(at(box(W, 0.08, 0.1, CHROME), 0, 0.5, S.Z1 - 0.02));

    // ---------- the dryers: two stacked per column along the back wall ----------
    const dryG = new THREE.Group(); G.add(dryG);
    const drums = [], doors = [], glows = [];
    const ringGeo = new THREE.TorusGeometry(S.DOOR_R + 0.03, 0.045, 4, 16), glassM = mat({ color: 0xcfe8f4, unlit: 0.4, see: 0.55 });
    const drumM = mat({ map: drumT, unlit: 0.55 }), drumGlowM = glow(0xffc070, 0.9);
    S.DRY_X.forEach((x, ci) => {
      dryG.add(at(box(S.DRY_W, S.DRY_TOP, 0.85, STEEL), x, S.DRY_TOP / 2, S.DRY_Z - 0.425));
      dryG.add(at(box(0.04, S.DRY_TOP, 0.86, M(0xb0b6be)), x + S.DRY_W / 2, S.DRY_TOP / 2, S.DRY_Z - 0.43));   // the seam between columns
      S.DRY_Y.forEach((y, ri) => {
        dryG.add(at(box(S.DRY_W - 0.08, 0.16, 0.03, M(0x8a929c)), x, y + 0.55, S.DRY_Z + 0.015));   // the control strip with a coin slot and a light
        dryG.add(at(box(0.08, 0.05, 0.02, glow(ri === 0 ? 0xff4a3a : 0x6aff8a, 0.9)), x + 0.42, y + 0.55, S.DRY_Z + 0.035));
        dryG.add(at(box(0.18, 0.06, 0.02, DARK), x - 0.3, y + 0.55, S.DRY_Z + 0.035));
        const drum = at(new THREE.Mesh(new THREE.CircleGeometry(S.DOOR_R * 0.96, 14), drumM), x, y, S.DRY_Z + 0.012); dryG.add(drum); drums.push(drum);
        const gl = at(new THREE.Mesh(new THREE.RingGeometry(S.DOOR_R * 0.96, S.DOOR_R * 1.04, 14), drumGlowM), x, y, S.DRY_Z + 0.014); dryG.add(gl); glows.push(gl);
        const hinge = at(new THREE.Group(), x - S.DOOR_R - 0.04, y, S.DRY_Z + 0.03); dryG.add(hinge);   // the door, hinged on its left edge
        const dg = new THREE.Group(); dg.position.x = S.DOOR_R + 0.04; hinge.add(dg);
        dg.add(new THREE.Mesh(ringGeo, CHROME)); const gls = at(box(0.05, 0.3, 0.005, glow(0xffffff, 0.8)), -0.14, 0.12, 0.02); gls.rotation.z = 0.6; dg.add(gls);   // a glint where the glass would be (a pale pane hid the drum)
        dg.add(at(box(0.05, 0.16, 0.05, DARK), S.DOOR_R + 0.04, 0, 0.03));   // the handle
        doors.push({ hinge, ci, ri });
      });
    });
    // the LAUNDRY neon over the dryers, the NO PETS sign beside them
    const neon = at(new THREE.Mesh(new THREE.PlaneGeometry(2.4, 0.6), mat({ map: neonT, unlit: 1 })), 0, 3.3, S.Z0 + 0.02); G.add(neon);
    const signP = at(new THREE.Mesh(new THREE.CircleGeometry(0.34, 16), mat({ map: noPetsT, unlit: 0.55 })), S.NOPETS[0], S.NOPETS[1], S.Z0 + 0.02); G.add(signP);

    // ---------- the front-loaders on the left wall ----------
    const washG = new THREE.Group(); G.add(washG);
    const sudsM = mat({ map: sudsT, unlit: 0.5 }), suds = [];
    S.WASH_Z.forEach(z => {
      washG.add(at(box(0.9, 1.05, 0.95, M(0xf6f8fa, { unlit: 0.1 })), S.WASH_X - 0.45, 0.525, z));
      washG.add(at(box(0.92, 0.04, 0.97, M(0xd8dce2)), S.WASH_X - 0.45, 1.07, z));
      washG.add(rot(at(new THREE.Mesh(ringGeo, CHROME), S.WASH_X + 0.02, S.WASH_Y, z), 0, PI / 2, 0));
      const sd = rot(at(new THREE.Mesh(new THREE.CircleGeometry(S.WASH_R * 1.05, 14), sudsM), S.WASH_X + 0.012, S.WASH_Y, z), 0, PI / 2, 0); washG.add(sd); suds.push(sd);
      washG.add(at(box(0.04, 0.12, 0.5, M(0x8a929c)), S.WASH_X + 0.005, 0.92, z));   // the dial strip
    });

    // ---------- the folding table, the cart, the counter, the chairs, the machines ----------
    const [tx0, tx1, tz0, tz1] = S.TABLE, tableG = new THREE.Group(); G.add(tableG);
    tableG.add(at(box(tx1 - tx0, 0.05, tz1 - tz0, M(0xfafaf6, { unlit: 0.1 })), (tx0 + tx1) / 2, S.TABLE_Y - 0.025, (tz0 + tz1) / 2));
    tableG.add(at(box(tx1 - tx0 + 0.02, 0.03, tz1 - tz0 + 0.02, M(0x8a929c)), (tx0 + tx1) / 2, S.TABLE_Y - 0.06, (tz0 + tz1) / 2));
    for (const x of [tx0 + 0.1, tx1 - 0.1]) for (const z of [tz0 + 0.1, tz1 - 0.1]) tableG.add(at(cyl(0.025, 0.025, S.TABLE_Y - 0.06, 5, CHROME), x, (S.TABLE_Y - 0.06) / 2, z));
    const cartG = at(new THREE.Group(), S.CART[0], 0, S.CART[1]); G.add(cartG);
    const wire = M(0xd8dce2, { unlit: 0.2 });
    cartG.add(at(box(1.1, 0.03, 0.7, wire), 0, S.CART_Y, 0));
    for (const [w, d, x, z] of [[1.1, 0.03, 0, -0.35], [1.1, 0.03, 0, 0.35], [0.03, 0.7, -0.55, 0], [0.03, 0.7, 0.55, 0]]) {
      cartG.add(at(box(w, 0.03, d, wire), x, S.CART_TOP, z));
      for (let yy = S.CART_Y + 0.1; yy < S.CART_TOP; yy += 0.1) cartG.add(at(box(w, 0.012, d, wire), x, yy, z));
    }
    for (const x of [-0.53, 0.53]) for (const z of [-0.33, 0.33]) { cartG.add(at(box(0.03, S.CART_TOP, 0.03, wire), x, S.CART_TOP / 2, z)); cartG.add(at(ico(0.05, 0, DARK), x, 0.05, z)); }
    cartG.add(at(box(0.03, 0.75, 0.03, wire), -0.53, S.CART_TOP + 0.37, -0.33)); cartG.add(at(box(0.03, 0.75, 0.03, wire), 0.53, S.CART_TOP + 0.37, -0.33)); cartG.add(at(box(1.1, 0.03, 0.03, wire), 0, S.CART_TOP + 0.75, -0.33));   // the hanging bar
    const counterG = new THREE.Group(); G.add(counterG);
    const [cx0, cx1, cz0, cz1] = S.COUNTER;
    counterG.add(at(box(cx1 - cx0, S.COUNTER_Y, cz1 - cz0, M(0x5aa89a)), (cx0 + cx1) / 2, S.COUNTER_Y / 2, (cz0 + cz1) / 2));
    counterG.add(at(box(cx1 - cx0 + 0.1, 0.05, cz1 - cz0 + 0.1, M(0xfafaf6)), (cx0 + cx1) / 2, S.COUNTER_Y + 0.025, (cz0 + cz1) / 2));
    counterG.add(at(box(0.32, 0.22, 0.26, M(0x3a3e46)), cx0 + 0.3, S.COUNTER_Y + 0.16, cz0 + 0.5));   // the till
    counterG.add(at(box(0.2, 0.18, 0.2, M(0xffd43b, { unlit: 0.3 })), cx0 + 0.25, S.COUNTER_Y + 0.14, cz1 - 0.45));   // a detergent box
    const chairsG = new THREE.Group(); G.add(chairsG);
    const chairM = M(0xf2a23a, { unlit: 0.15 });
    S.CHAIRS.forEach(([x, z]) => { chairsG.add(at(box(0.42, 0.05, 0.42, chairM), x, 0.44, z)); chairsG.add(at(box(0.05, 0.44, 0.42, chairM), x + 0.2, 0.68, z)); for (const dz of [-0.17, 0.17]) chairsG.add(at(box(0.03, 0.44, 0.03, CHROME), x, 0.22, z + dz)); });
    const vendG = new THREE.Group(); G.add(vendG);
    vendG.add(at(box(0.7, 1.8, 0.8, M(0x3a6ad8, { unlit: 0.15 })), S.X - 0.4, 0.9, -3.8)); vendG.add(at(box(0.04, 1.2, 0.6, glow(0xdff0ff, 0.6)), S.X - 0.77, 1.1, -3.8));
    vendG.add(at(box(0.6, 1.4, 0.6, M(0x9aa2ac)), S.X - 0.35, 0.7, -2.6)); vendG.add(at(box(0.04, 0.3, 0.3, glow(0x6aff8a, 0.6)), S.X - 0.66, 1.0, -2.6));

    // ---------- box-pet customers: four on the chairs, two at the washers ----------
    const custs = S.CHAIRS.map(([x, z], i) => { const q = pet(i); G.add(q.g); return { q, x, z, seat: true }; });
    [[-4.6, -2.8], [-4.7, 2.0]].forEach(([x, z], i) => { const q = pet(i + 4); G.add(q.g); custs.push({ q, x, z, seat: false }); });

    // ---------- the effects: laundry clouds, piles, stacks, socks, steam, rays, sparkles, hearts ----------
    const lumps = Array.from({ length: 150 }, (_, i) => { const q = lump(i); q.visible = false; G.add(q); return q; });
    const towels = Array.from({ length: 60 }, (_, i) => { const q = towel(i); q.visible = false; G.add(q); return q; });
    const socks = Array.from({ length: 16 }, (_, i) => { const q = sock(i); q.visible = false; G.add(q); return q; });
    const steamM = mat({ color: 0xfffaf0, unlit: 0.8, see: 0.55 }), steam = Array.from({ length: 30 }, () => { const q = ico(1, 1, steamM); q.visible = false; G.add(q); return q; });
    const rayM = mat({ color: 0xfff0c0, unlit: 1, see: 0.72 }), rays = Array.from({ length: 4 }, () => { const q = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 1.0, S.H, 10, 1, true), rayM); q.visible = false; G.add(q); return q; });
    const sparkM = glow(0xffe680, 1), sparks = Array.from({ length: 40 }, () => { const q = box(0.03, 0.03, 0.03, sparkM); q.visible = false; G.add(q); return q; });
    const heartM = M(0xff4f9a, { unlit: 0.8 }), hearts = [];
    for (let i = 0; i < 9; i++) { const h = new THREE.Group(); h.add(at(ico(0.1, 0, heartM), -0.075, 0, 0)); h.add(at(ico(0.1, 0, heartM), 0.075, 0, 0)); h.add(rot(at(cone(0.125, 0.18, 4, heartM), 0, -0.11, 0), PI, 0, 0)); h.visible = false; G.add(h); hearts.push(h); }

    const doorAt = (ci, ri) => [S.DRY_X[ci] + 0.1, S.DRY_Y[ri], S.DRY_Z + 0.2];
    const _ca = new THREE.Color(), _cb = new THREE.Color();
    const mix = (a, b, k2) => _ca.set(a).lerp(_cb.set(b), k2).getHex();
    function light(P, s) {
      const hv = P.zone === 'heaven' ? 1 : cl(ramp(P.heaven, s));
      lights(mix(0x5a6868, 0x7a5a38, hv), mix(0xa8b8b4, 0xe0b878, hv), [0.2, -0.9, -0.35], mix(0x1a2226, 0x2a1c0c, hv), [18, 46], 9);
      pt(0, -2.8, 1.4, S.DRY_Z + 1.2, 0.9 + 0.5 * hv, 0.62 + 0.3 * hv, 0.3);   // the dryers' warm glow on the room
      pt(1, 2.8, 1.4, S.DRY_Z + 1.2, 0.9 + 0.5 * hv, 0.62 + 0.3 * hv, 0.3);
      pt(2, 0, 3.6, 1.0, 0.42 + 0.35 * hv, 0.46 + 0.2 * hv, 0.45 - 0.15 * hv);   // the strips over the table
      pt(3, -4.6, 1.2, 0.2, 0.3, 0.5, 0.7);   // the washers' blue
      if (P.key) pt(1, P.key[0], P.key[1], P.key[2], P.key[3], P.key[4], P.key[5]);
    }
    return {
      group: G, sky: null, shadowCol: 0x9aa8a4, indoor: true,
      light() { light({}, 0); },
      anim(t, P = {}) {
        const s = shotT(t, P), hide = new Set(P.hide || []), stopAt = P.stop === true ? -99 : P.stop;
        const tt = stopAt != null && s > stopAt ? t - (s - stopAt) : t, ss = stopAt != null ? Math.min(s, stopAt) : s;   // the dead stop freezes the set's clock
        light(P, s);
        tableG.visible = !hide.has('table'); cartG.visible = !hide.has('cart'); counterG.visible = !hide.has('counter'); chairsG.visible = !hide.has('chairs');
        neon.visible = !hide.has('neon'); signP.visible = !hide.has('sign'); washG.visible = !hide.has('washers');
        // the drums tumble (a lurch on every beat), the suds swirl
        const run = P.run !== false, bt = beat(tt);
        drums.forEach((d, i) => { d.rotation.z = run ? tt * 2.2 + i * 0.7 + 0.25 * Math.sin(bt * PI) : i * 0.7; });
        glows.forEach(g => { g.visible = run; });
        suds.forEach((d, i) => { d.rotation.x = run ? -tt * 3.1 - i : -i; });
        doors.forEach(({ hinge, ci, ri }) => { const o = (P.doors || []).find(([c, r]) => c === ci && r === ri); hinge.rotation.y = o ? -1.9 * cl(ramp(o[2], ss)) : 0; });
        if (P.cart) { const C = P.cart, u = C.to ? sm((ss - (C.at || 0)) / (C.dur || 1)) : 0; cartG.position.set(C.x + (C.to ? (C.to[0] - C.x) * u : 0), 0, C.z + (C.to ? (C.to[1] - C.z) * u : 0)); cartG.rotation.y = (C.yaw || 0) * PI / 180; }
        else { cartG.position.set(S.CART[0], 0, S.CART[1]); cartG.rotation.y = 0; }
        // the customers
        const cm = P.noguests ? false : (P.customers ?? 'wait');
        custs.forEach(({ q, x, z, seat }, i) => {
          q.g.visible = !!cm && !cleared(P, x, z) && !(seat && hide.has('chairs')); if (!q.g.visible) return;
          reset(q); q.g.rotation.y = seat ? -PI / 2 : PI / 2;
          q.g.position.set(seat ? x - 0.05 : x, seat ? 0.44 - 0.31 : 0, z);
          if (seat) q.legs.forEach(l => { l.rotation.x = -PI / 2; });
          if (cm === 'wait') { if (seat && i % 2 === 0) { q.mag.visible = true; q.arms.forEach(a => a.rotation.set(-1.2, 0, 0)); q.head.rotation.x = 0.25; } else q.head.rotation.y = 0.15 * Math.sin(tt * 0.7 + i); }
          else if (cm === 'gasp') { q.arms.forEach((a, j) => a.rotation.set(-2.35, 0, (j ? -1 : 1) * 0.35)); q.mouth.visible = true; turnTo(q, x, z, P, q.g.rotation.y); }
          else if (cm === 'cheer') { q.arms.forEach((a, j) => a.rotation.set(0, 0, (j ? 1 : -1) * 2.45)); q.mouth.visible = true; q.body.position.y = 0.04 * Math.abs(Math.sin(bt * PI)); }
          else if (cm === 'stare') turnTo(q, x, z, P, q.g.rotation.y);
        });
        // the laundry: everything hidden, then each effect draws its share
        lumps.forEach(q => { q.visible = false; }); towels.forEach(q => { q.visible = false; }); socks.forEach(q => { q.visible = false; });
        let li = 0, ti = 0;
        (P.cloud || []).forEach((C, ck) => {   // warm laundry billowing out of a dryer onto a heap
          const [dx, dy, dz] = doorAt(...(C.from || [3, 0])), n = C.n || 60, r = C.r || 0.9, h = C.h || 0.5;
          for (let j = 0; j < n && li < lumps.length; j++) {
            const q = lumps[li++], a = hash(j, ck, 5121) * TAU, d = r * Math.sqrt(hash(j, ck, 5122));
            const ex = C.x + Math.cos(a) * d, ez = C.z + Math.sin(a) * d, ey = 0.06 + h * (1 - (d / r) ** 2) * (0.5 + 0.5 * hash(j, ck, 5123));
            const u = cl((ss - (C.s0 ?? -9) - j * 0.012) / 0.55);
            if (u <= 0) continue;
            const arc = 0.3 + 0.25 * hash(j, ck, 5124);   // low arcs: high ones flew up into the lens over the heap
            q.visible = true; q.position.set(dx + (ex - dx) * u, dy + (ey - dy) * u + arc * 4 * u * (1 - u), dz + (ez - dz) * u);
          }
        });
        (P.pile || []).forEach((Pp, pk) => {   // a static heap of clean laundry
          const n = Pp.n || 24, r = Pp.r || 0.45, h = Pp.h || 0.3;
          for (let j = 0; j < n && li < lumps.length; j++) {
            const q = lumps[li++], a = hash(j, pk, 5131) * TAU, d = r * Math.sqrt(hash(j, pk, 5132));
            q.visible = true; q.position.set(Pp.x + Math.cos(a) * d, (Pp.y || 0) + 0.05 + h * (1 - (d / r) ** 2) * (0.4 + 0.6 * hash(j, pk, 5133)), Pp.z + Math.sin(a) * d);
          }
        });
        (P.stack || []).forEach((St, sk) => {   // folded towels piled up; grown one at a time; toppled and scattered
          const [, th] = S.TOWEL, y0 = St.y ?? S.TABLE_Y;
          let n = St.n ?? 6;
          if (St.grow) { const [g0, per, n0 = 0] = St.grow; n = Math.min(n, n0 + Math.max(0, Math.floor((ss - g0) / ((per || 1) * 60 / 84) + 1))); }
          const fall = St.fall, dir = (St.dir || 0) * PI / 180, spread = St.spread || 1.4, fz = St.freeze != null ? Math.min(ss, St.freeze) : ss;
          for (let j = 0; j < n && ti < towels.length; j++) {
            const q = towels[ti++]; q.visible = true;
            const bx = St.x + 0.02 * (hash(j, sk, 5141) - 0.5), bz = St.z + 0.02 * (hash(j, sk, 5142) - 0.5), by = y0 + th / 2 + j * th, byaw = (St.yaw || 0) * PI / 180 + 0.06 * (hash(j, sk, 5143) - 0.5);
            if (fall == null || fz < fall) { q.position.set(bx, by, bz); q.rotation.set(0, byaw, 0); continue; }
            const a = dir + (hash(j, sk, 5144) - 0.5) * 1.6, dist = spread * (0.35 + 0.65 * hash(j, sk, 5145)), tl = 0.45 + 0.25 * hash(j, sk, 5146) + 0.03 * j;
            const u = cl((fz - fall - 0.015 * (n - j)) / tl), ex = bx + Math.sin(a) * dist, ez = bz + Math.cos(a) * dist, ey = th / 2;
            const up = 0.5 + 0.6 * hash(j, sk, 5147);
            q.position.set(bx + (ex - bx) * u, by + (ey - by) * u + up * 4 * u * (1 - u), bz + (ez - bz) * u);
            // in flight a towel tips up towards +z (the lenses) as well as rolling: rolled about z alone it was edge-on to a frontal lens, "flying sticks" (the critic)
            q.rotation.set(u < 1 ? Math.sin(u * PI) * (0.7 + 0.5 * hash(j, sk, 5150)) : 0, byaw + u * (hash(j, sk, 5148) - 0.5) * 6, u < 1 ? Math.sin(u * PI) * (hash(j, sk, 5149) - 0.5) * 1.6 : 0);
          }
        });
        (P.socks || []).forEach(([x, y, z, yaw = 0], k2) => { const q = socks[k2]; if (!q) return; q.visible = true; q.position.set(x, y + 0.02, z); q.rotation.set(0, yaw * PI / 180, 0); });
        // warm steam off fresh laundry, a shaft of light, golden sparkles
        steam.forEach(q => { q.visible = false; });
        (P.steam || []).forEach(([x, y, z], k2) => { for (let j = 0; j < 10; j++) { const q = steam[k2 * 10 + j]; if (!q) return; const u = fr(tt * 0.35 + j / 10); q.visible = true; q.position.set(x + 0.15 * Math.sin(j * 2.1 + tt), y + u * 0.9, z + 0.12 * Math.cos(j * 1.7 + tt)); q.scale.setScalar(0.06 + 0.12 * u); } });
        rays.forEach((q, i) => { const R = (P.rays || [])[i]; q.visible = !!R; if (R) { q.position.set(R[0], S.H / 2, R[1]); q.scale.set(R[2] || 1, 1, R[2] || 1); } });
        sparks.forEach(q => { q.visible = false; });
        (P.sparkle || []).forEach(([x, y, z, r = 0.8], k2) => { for (let j = 0; j < 20; j++) { const q = sparks[k2 * 20 + j]; if (!q) return; const u = fr(tt * 0.4 + hash(j, k2, 5151)), a = hash(j, k2, 5152) * TAU, d = r * (0.3 + 0.7 * hash(j, k2, 5153)); q.visible = true; q.position.set(x + Math.cos(a) * d, y + u * 1.4, z + Math.sin(a) * d); q.scale.setScalar(0.35 + 0.7 * Math.sin(u * PI)); } });
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
  return { laundromat: laundromat() };
}
