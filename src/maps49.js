// maps49.js: the "The Fate of Ophelia" map (2026-10-15, Taylor Swift; the clip: a gilded theatre at night, the famous
// painting of Ophelia floating among flowers coming alive in its gold frame, stagehands carrying painted flats, showgirls,
// a painted ship on cut-out waves, a swimming number of life rings on a staircase in teal, and a bathtub). Same contract
// as the other map files, pure in t:
//   ophelia  a film set on an old theatre's stage at night (y = 0): the shoot of "Ophelia". The painting is the set: a
//            giant gilded frame (FRAME) whose canvas (a riverbank, a willow, wild flowers, the stream) runs down into a
//            real pool sunk in the stage (POOL, the water at WATER_Y, its floor at FLOOR_Y: a pet standing in it is
//            chest-deep; a floating body lies at about WATER_Y - 0.08), flowers and lily pads drifting on it, reeds and
//            willow fronds at its back corners; Ophelia floats at OPH, her head towards the painting. Stage left the
//            director's corner: her canvas chair (CHAIR, seat SEAT_Y, facing +x, the pool's edge 0.6 m from its front),
//            a 1920s hand-cranked film camera on a tripod (CAMERA) and a work light. Stage right the lifeguard tower
//            (TOWER, its platform TOWER_Y up, facing -x over the pool, a ladder at its back, a red cross, two life rings).
//            The proscenium (a gold arch, red velvet swags, a valance) at LIP with footlights; beyond it the stalls rise
//            in rows of red seats (AUD) with box-pet spectators, gilded boxes on the side walls, a chandelier.
//            Flags: `zone` 'set' (warm work lights, the default) | 'number' (the swimming number: teal and pink show
//            light, the water aqua, the canvas turned to a painted sea) | 'dark' (only the follow spot); `spot` [x, z]
//            (a follow-spot's pool and light, on from s0 into the shot when given: [x, z, s0]); `crew` 'work' | 'stare' | 'gasp' | 'cheer' | false (the film crew: a boom
//            operator over the pool, the camera operator cranking, a stagehand); `chorus` 'line' | 'up' (rings raised
//            on the beat) | 'frame' (rings held round their faces) | 'swim' (floating in rings in the pool) | 'stare' |
//            'float' (ten floating on their backs in a star, heads in, arms out: the Busby Berkeley float, round STAR) | 'pile'
//            (the ten heaped on the stage's front edge, dripping: rescued) | false (box-pet swimmers in teal swimsuits and
//            sequin caps); `audience` 'watch' | 'cheer' | 'gasp' | 'stare'
//            | false; `stare` [x, z]; `waves` (0-1 or [s0, s1, a, b]: three rows of cut-out painted waves rise in front of
//            the pool and roll on the beat; `wavesZ` moves the first row, the others 0.35 m behind it); `buoys` [[x, z, s0]] (life rings floating on the water from s0); `buoyToss`
//            [x0, y0, z0, x1, z1, s0, dur] (a ring flies an arc and lands on the water there); `splash` [[x, z, s, size]];
//            `bigSplash` [x, z, s] (a dive: a crown of small drops, a see-through column, rings); `rainAt` [x, z, s0, r] (the
//            dive's drops raining down round a point: the soaked clapper loader); `drips` [[x, z, h]] (water dripping off a
//            soaked one, a puddle at the feet); `wet` (puddles all round the pool: after the dive); `hearts` [[x, y, z,
//            s0, loop]] + `heartYaw`; `hide` ['tower', 'chair', 'camera', 'crew', 'chorus', 'audience', 'painting',
//            'flowers', 'light']; `clear` [[x, z, r]] (no box pet there); `noguests` (no box pets at all); `key`.
import { mapKit } from './mapkit.js';

export const OPHELIA = {
  X: 8.5, Z0: -7.6, LIP: 3.4, H: 9.0,
  POOL: { x0: -2.8, x1: 2.8, z0: -4.9, z1: 0.6 }, WATER_Y: -0.18, FLOOR_Y: -0.86,
  FRAME: { z: -4.96, w: 7.2, h: 4.9, y0: -0.3, bar: 0.36 },
  OPH: [0, -2.7],
  CHAIR: [-3.45, -1.1], SEAT_Y: 0.5,
  CAMERA: [-4.6, 1.2], LIGHT: [-5.4, -3.2],
  TOWER: [4.05, -2.3], TOWER_Y: 2.4,
  AUD: { y0: -0.12, z0: 4.6, rows: 6, dz: 1.05, dy: 0.3, x: 6.6 },
  CREW: [[3.55, 0.25], [-5.15, 1.75], [-5.6, -0.4]],
  CHORUS: [[-2.3, 1.15], [-1.4, 1.2], [-0.47, 1.22], [0.47, 1.22], [1.4, 1.2], [2.3, 1.15], [-3.3, -0.9], [3.3, -0.9], [-3.3, -3.3], [3.3, -3.3]],
  SWIM: [[-1.6, -0.9], [1.6, -0.9], [-1.8, -2.9], [1.8, -2.9], [0, -0.4], [0, -4.1], [-1.2, -4.0], [1.2, -4.0], [-2.2, -1.9], [2.2, -1.9]],
  STAR: [0.0, -2.3, 1.05],                   // the floating star: its centre and the radius of the heads' ring
  PILE: [[-1.9, 0, 1.25, 30, 1], [-1.3, 0, 1.45, -60, 0], [-1.6, 0, 0.95, 110, 1], [-2.35, 0, 1.6, 200, 0], [-1.0, 0, 1.05, 160, 1], [-1.75, 0.3, 1.3, 75, 0], [-1.35, 0.3, 1.2, -20, 1], [-2.05, 0.3, 1.4, 140, 1], [-1.6, 0.58, 1.25, 40, 0], [-1.8, 0.84, 1.22, -80, 1]],   // [x, y, z, yaw, on the back]
};

export function buildOpheliaMaps(K) {
  const k = mapKit(K);
  const { THREE, mat, tex, px, noise, box, U, TAU, PI, beat, hash, fr, cyl, cone, ico, at, rot, flat, lights, pt } = k;
  const M = (c, o = {}) => mat({ color: c, ...o }), glow = (c, u = 1) => mat({ color: c, unlit: u });
  const cl = x => Math.max(0, Math.min(1, x));
  const ramp = (v, s) => Array.isArray(v) ? v[2] + (v[3] - v[2]) * cl((s - v[0]) / Math.max(0.01, v[1] - v[0])) : (v === true ? 1 : (v || 0));
  const shotT = (t, P) => P.t0 != null ? t - P.t0 : 0;
  const cleared = (P, x, z) => (P.clear || []).some(([cx, cz, r]) => (x - cx) ** 2 + (z - cz) ** 2 < r * r);
  const S = OPHELIA, PL = S.POOL, GOLD = M(0xd8a83a, { unlit: 0.3 }), DARKGOLD = M(0x9a7428, { unlit: 0.2 });

  // ---------- textures ----------
  const boardsT = tex(32, 32, (x, r) => { px(x, '#5a3a20', 0, 0, 32, 32); noise(x, r, 32, 32, ['#56371e', '#603e22', '#4e321a'], 170); for (let i = 0; i < 32; i += 8) px(x, '#3a2412', 0, i, 32, 1); for (let i = 4; i < 32; i += 16) px(x, '#3a2412', i, 0, 1, 8); }, 4901);
  const velvetT = tex(32, 32, (x, r) => { for (let i = 0; i < 32; i++) { const v = Math.sin(i / 32 * TAU * 2); px(x, v > 0.35 ? '#a8182a' : v > -0.35 ? '#861222' : '#5e0c18', i, 0, 1, 32); } noise(x, r, 32, 32, ['rgba(0,0,0,.08)'], 60); }, 4902);
  const drapeT = tex(32, 32, (x, r) => { for (let i = 0; i < 32; i++) { const v = Math.sin(i / 32 * TAU * 3); px(x, v > 0.3 ? '#2a2026' : v > -0.3 ? '#211a1f' : '#181317', i, 0, 1, 32); } }, 4903);
  const tileT = tex(16, 16, x => { px(x, '#2e5a52', 0, 0, 16, 16); for (let i = 0; i < 16; i += 4) { px(x, '#3e6e64', i, 0, 1, 16); px(x, '#3e6e64', 0, i, 16, 1); } }, 4904);
  const waterSetT = tex(32, 32, (x, r) => { px(x, '#1e4a44', 0, 0, 32, 32); for (let i = 0; i < 34; i++) px(x, ['#2e6a5e', '#3a7a6a', '#14382f'][i % 3], Math.floor(r() * 30), Math.floor(r() * 30), 2 + Math.floor(r() * 4), 1); }, 4905);
  const waterNumT = tex(32, 32, (x, r) => { px(x, '#2ab8c8', 0, 0, 32, 32); for (let i = 0; i < 34; i++) px(x, '#b8f6fa', Math.floor(r() * 30), Math.floor(r() * 30), 2 + Math.floor(r() * 4), 1); }, 4906);
  // the painting: Millais' riverbank as PS1 brushwork (dark greens, the stream running down to the frame's foot, a willow,
  // wild flowers on the banks, a pale sky at the top), and its other face: the swimming number's painted sea
  const canvasT = tex(64, 48, (x, r) => {
    const g = x.createLinearGradient(0, 0, 0, 48); g.addColorStop(0, '#b8c8b0'); g.addColorStop(0.18, '#4a6a3a'); g.addColorStop(0.6, '#2c4a26'); g.addColorStop(1, '#1e3a1c'); x.fillStyle = g; x.fillRect(0, 0, 64, 48);
    for (let i = 0; i < 260; i++) px(x, ['#3a5e2c', '#26421e', '#567a3a', '#1a3216'][i % 4], Math.floor(r() * 64), 6 + Math.floor(r() * 42), 2 + Math.floor(r() * 3), 1 + Math.floor(r() * 2));
    x.fillStyle = '#244a44'; x.beginPath(); x.moveTo(26, 14); x.lineTo(38, 14); x.lineTo(60, 48); x.lineTo(4, 48); x.closePath(); x.fill();          // the stream, widening towards us
    for (let i = 0; i < 60; i++) { const yy = 15 + Math.floor(r() * 33), w = 22 + (yy - 14) * 1.6; px(x, ['#3a6a62', '#1a3a34', '#4e7e72'][i % 3], Math.floor(32 - w / 2 + r() * w), yy, 2 + Math.floor(r() * 3), 1); }
    for (let i = 0; i < 18; i++) { const cx = 4 + r() * 18; px(x, '#30502a', Math.floor(cx), Math.floor(r() * 12), 3, 14); }            // the willow's hanging fronds, left
    for (let i = 0; i < 70; i++) { const side = i % 2 ? r() * 18 : 46 + r() * 18; px(x, ['#e8303a', '#f4f0e0', '#e86aa0', '#f0c840', '#7a8ae8'][i % 5], Math.floor(side), 16 + Math.floor(r() * 30), 1, 1); }   // flowers on the banks
    for (let i = 0; i < 26; i++) px(x, ['#e8303a', '#f4f0e0', '#e86aa0'][i % 3], Math.floor(16 + r() * 32), Math.floor(30 + r() * 18), 1, 1);   // and on the water
  }, 4907);
  const seaT = tex(64, 48, (x, r) => {
    const g = x.createLinearGradient(0, 0, 0, 48); g.addColorStop(0, '#f2e6c8'); g.addColorStop(0.45, '#9ad8d8'); g.addColorStop(1, '#2a8a9a'); x.fillStyle = g; x.fillRect(0, 0, 64, 48);
    for (const [cx, cy, s] of [[12, 10, 7], [46, 8, 9], [30, 14, 5]]) { x.fillStyle = '#fbf6ea'; for (let i = 0; i < 4; i++) { x.beginPath(); x.arc(cx + i * s * 0.7 - s, cy + (i % 2) * 2, s * 0.6, 0, TAU); x.fill(); } }   // painted clouds
    for (let row = 0; row < 4; row++) { const y0 = 24 + row * 6; x.fillStyle = ['#1a7a8a', '#22909e', '#2aa6b2', '#36bcc4'][row]; for (let i = -1; i < 9; i++) { x.beginPath(); x.arc(i * 8 + (row % 2) * 4, y0, 4.5, PI, 0); x.fill(); } x.fillRect(0, y0, 64, 6); }
    for (let i = 0; i < 40; i++) px(x, '#e8fbfb', Math.floor(r() * 64), 24 + Math.floor(r() * 24), 2, 1);
  }, 4908);
  const plaqueT = tex(48, 12, x => { px(x, '#3a2a10', 0, 0, 48, 12); px(x, '#d8a83a', 1, 1, 46, 10); x.font = 'bold 9px monospace'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillStyle = '#3a2410'; x.fillText('OPHELIA', 24, 6.5); }, 4909);

  // ---------- box pets: the film crew (black tees, caps), the swimmers (teal swimsuits, sequin caps, life rings), the audience ----------
  const FURS = [0xf2eee6, 0xd8a868, 0x9a9aa4, 0xe8c090, 0x8a7a6c, 0xc8b8a8, 0x6a5a4c, 0xe0d0b8];
  const SUITS = [0x22222a, 0x6a1a2a, 0x1a2a5a, 0x2a4a3a, 0x5a3a6a, 0x3a2a1a];
  function pet(i, kind, opt = {}) {
    const g = new THREE.Group(), F = M(FURS[i % FURS.length]), ears = i % 3, body = new THREE.Group(); g.add(body);
    const top = kind === 'crew' ? M(0x1a1a1e) : kind === 'swim' ? M(0x1fa8b0, { unlit: 0.2 }) : M(SUITS[i % SUITS.length]);
    const legs = [-1, 1].map(sx => { const l = at(new THREE.Group(), sx * 0.1, 0.3, 0); l.add(at(box(0.13, 0.3, 0.13, kind === 'swim' ? F : M(0x1c1c22)), 0, -0.15, 0)); body.add(l); return l; });
    body.add(at(box(0.4, 0.38, 0.28, top), 0, 0.5, 0));
    if (kind === 'swim') { body.add(at(box(0.41, 0.03, 0.29, M(0xf6f6f2)), 0, 0.33, 0)); body.add(at(box(0.41, 0.03, 0.29, M(0xf6f6f2)), 0, 0.67, 0)); }
    else if (kind === 'aud') body.add(at(box(0.1, 0.05, 0.03, M(0xf4f2ec)), 0, 0.66, 0.145));
    const arms = [-1, 1].map(sx => { const a = at(new THREE.Group(), sx * 0.23, 0.64, 0); a.add(at(box(0.09, 0.28, 0.09, kind === 'swim' ? F : top), 0, -0.12, 0)); a.add(at(box(0.08, 0.08, 0.08, F), 0, -0.28, 0)); body.add(a); return a; });
    const head = at(new THREE.Group(), 0, 0.92, 0); body.add(head);
    const skull = ico(0.24, 1, F); skull.scale.set(1, 0.9, 0.92); head.add(skull);
    const snout = at(ico(0.1, 1, M(0xf0e6d8)), 0, -0.07, 0.19); snout.scale.set(1.1, 0.8, 0.9); head.add(snout);
    head.add(at(ico(0.035, 0, M(0x151515)), 0, -0.03, 0.28));
    const mouth = at(box(0.09, 0.07, 0.02, M(0x5a1a1a)), 0, -0.13, 0.25); mouth.visible = false; head.add(mouth);
    for (const e of [-1, 1]) {
      head.add(at(ico(0.038, 0, M(0x0e0e0e)), e * 0.1, 0.05, 0.19)); head.add(at(ico(0.012, 0, glow(0xffffff)), e * 0.1 + 0.012, 0.065, 0.225));
      if (kind === 'swim') continue;
      head.add(ears === 0 ? rot(at(cone(0.08, 0.2, 4, F), e * 0.15, 0.27, 0), 0, 0, -e * 0.25) : ears === 1 ? at(box(0.08, 0.3, 0.06, F), e * 0.1, 0.33, 0) : rot(at(box(0.07, 0.24, 0.16, F), e * 0.24, 0.02, 0), 0, 0, e * 0.3));
    }
    let ring = null;
    if (kind === 'swim') {   // a sequin swim cap, and a white life ring with teal bands in the right paw
      const cap = new THREE.Mesh(new THREE.SphereGeometry(0.255, 10, 6, 0, TAU, 0, PI * 0.55), M(opt.cap ?? 0x22c0c8, { unlit: 0.45 })); cap.position.y = 0.03; head.add(cap);
      for (let j = 0; j < 10; j++) head.add(at(ico(0.02, 0, glow(0xd8fbff, 0.8)), Math.sin(j * 2.4) * 0.2, 0.12 + 0.08 * (j % 3), Math.cos(j * 2.4) * 0.2));
      ring = new THREE.Group(); for (let j = 0; j < 8; j++) { const a = new THREE.Mesh(new THREE.TorusGeometry(0.22, 0.06, 4, 3, PI / 4), M(j % 2 ? (opt.band ?? 0x1fa8b0) : 0xf6f6f2, { unlit: 0.4 })); a.rotation.z = j * PI / 4; ring.add(a); }
      g.add(ring);
    }
    if (kind === 'crew') { const cap = at(new THREE.Group(), 0, 0.17, 0); cap.add(cyl(0.22, 0.24, 0.1, 10, M(0x2a2a30))); cap.add(at(box(0.2, 0.025, 0.22, M(0x2a2a30)), 0, -0.04, 0.2)); head.add(cap); }
    return { g, body, head, arms, legs, mouth, ring, i, kind };
  }
  const turnTo = (q, x, z, P, yaw) => { if (!P.stare) return; const a = Math.atan2(P.stare[0] - x, P.stare[1] - z) - yaw; q.head.rotation.y = Math.max(-1.2, Math.min(1.2, Math.atan2(Math.sin(a), Math.cos(a)))); };
  const reset = q => { q.body.position.set(0, 0, 0); q.body.rotation.set(0, 0, 0); q.head.rotation.set(0, 0, 0); q.mouth.visible = false; q.arms.forEach(a => a.rotation.set(0, 0, 0)); q.legs.forEach(l => l.rotation.set(0, 0, 0)); };

  function ophelia() {
    const G = new THREE.Group();
    const W = 2 * S.X;
    // ---- the stage floor round the pool (four boards' panels leave the pool open) ----
    const fl = (x0, x1, z0, z1) => G.add(flat(x1 - x0, z1 - z0, mat({ map: boardsT, rep: [(x1 - x0) / 1.6, (z1 - z0) / 1.6] }), (x0 + x1) / 2, 0, (z0 + z1) / 2));
    fl(-S.X, PL.x0, S.Z0, S.LIP); fl(PL.x1, S.X, S.Z0, S.LIP); fl(PL.x0, PL.x1, PL.z1, S.LIP); fl(PL.x0, PL.x1, S.Z0, PL.z0);
    // the pool: dark green tiles, gilded coping, the water, flowers and lily pads drifting
    const pw = PL.x1 - PL.x0, pd = PL.z1 - PL.z0, depth = -S.FLOOR_Y, tileM = (w, h) => mat({ map: tileT, rep: [w / 0.8, h / 0.8], unlit: 0.15 });
    const wallP = (w, h, m) => new THREE.Mesh(new THREE.PlaneGeometry(w, h), m);
    G.add(rot(at(wallP(pw, depth, tileM(pw, depth)), (PL.x0 + PL.x1) / 2, S.FLOOR_Y / 2, PL.z1), 0, PI, 0));
    G.add(rot(at(wallP(pd, depth, tileM(pd, depth)), PL.x0, S.FLOOR_Y / 2, (PL.z0 + PL.z1) / 2), 0, PI / 2, 0));
    G.add(rot(at(wallP(pd, depth, tileM(pd, depth)), PL.x1, S.FLOOR_Y / 2, (PL.z0 + PL.z1) / 2), 0, -PI / 2, 0));
    G.add(at(wallP(pw, depth, tileM(pw, depth)), (PL.x0 + PL.x1) / 2, S.FLOOR_Y / 2, PL.z0));
    G.add(flat(pw, pd, tileM(pw, pd), (PL.x0 + PL.x1) / 2, S.FLOOR_Y, (PL.z0 + PL.z1) / 2));
    G.add(at(box(pw + 0.24, 0.05, 0.12, GOLD), (PL.x0 + PL.x1) / 2, 0.0, PL.z1 + 0.06));
    for (const x of [PL.x0 - 0.06, PL.x1 + 0.06]) G.add(at(box(0.12, 0.05, pd, GOLD), x, 0.0, (PL.z0 + PL.z1) / 2));
    const waterSetM = mat({ map: waterSetT, rep: [pw / 2.2, pd / 2.2], unlit: 0.5, see: 0.4 }), waterNumM = mat({ map: waterNumT, rep: [pw / 2.2, pd / 2.2], unlit: 0.6, see: 0.42 });
    const water = flat(pw, pd, waterSetM, (PL.x0 + PL.x1) / 2, S.WATER_Y, (PL.z0 + PL.z1) / 2); G.add(water);
    for (const dx of [-0.25, 0.25]) G.add(rot(at(new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.025, 4, 8, PI), GOLD), 2.1 + dx, 0.0, PL.z1 + 0.05), 0, PI / 2, 0));   // the pool's ladder
    const flowersG = new THREE.Group(); G.add(flowersG);
    const padM = M(0x3a7a32, { unlit: 0.25 }), FLC = [0xe8303a, 0xf6f2e2, 0xf07ab0, 0xf0c840, 0x8a9af0];
    const drift = [];
    for (let i = 0; i < 46; i++) {
      const near = i < 30, a = hash(i, 4911) * TAU, d = near ? 0.55 + hash(i, 4912) * 1.5 : 0.3 + hash(i, 4912) * 2.3;
      let x = near ? S.OPH[0] + Math.sin(a) * d * 1.1 : PL.x0 + 0.3 + hash(i, 4913) * (pw - 0.6), z = near ? S.OPH[1] + Math.cos(a) * d : PL.z0 + 0.3 + hash(i, 4914) * (pd - 0.6);
      x = Math.max(PL.x0 + 0.2, Math.min(PL.x1 - 0.2, x)); z = Math.max(PL.z0 + 0.2, Math.min(PL.z1 - 0.2, z));
      const f = new THREE.Group();
      if (i % 4 === 3) { const p = new THREE.Mesh(new THREE.CircleGeometry(0.17 + 0.07 * hash(i, 4915), 7, 0.4, TAU - 0.5), padM); p.rotation.x = -PI / 2; f.add(p); }
      else { const c = FLC[i % FLC.length], pm = glow(c, 0.55); for (let j = 0; j < 5; j++) { const pe = at(ico(0.045, 0, pm), Math.sin(j * TAU / 5) * 0.05, 0.015, Math.cos(j * TAU / 5) * 0.05); pe.scale.set(1, 0.4, 1); f.add(pe); } f.add(at(ico(0.025, 0, glow(0xf8d040, 0.7)), 0, 0.03, 0)); }
      f.position.set(x, S.WATER_Y + 0.012, z); flowersG.add(f); drift.push([f, x, z, i]);
    }
    // ---- the painting: a giant gilded frame, its canvas running down into the pool, reeds and willow fronds at its foot ----
    const F = S.FRAME, paint = new THREE.Group(); G.add(paint);
    const canvasM = mat({ map: canvasT, unlit: 0.55 }), seaM = mat({ map: seaT, unlit: 0.6 });
    const canvas = new THREE.Mesh(new THREE.PlaneGeometry(F.w, F.h), canvasM); canvas.position.set(0, F.y0 + F.h / 2, F.z - 0.06); paint.add(canvas);
    const b = F.bar;
    paint.add(at(box(F.w + 2 * b, b, 0.22, GOLD), 0, F.y0 + F.h + b / 2, F.z));
    paint.add(at(box(F.w + 2 * b, b * 0.7, 0.22, GOLD), 0, F.y0 - b * 0.35 + 0.02, F.z));
    for (const s of [-1, 1]) paint.add(at(box(b, F.h + 2 * b, 0.22, GOLD), s * (F.w / 2 + b / 2), F.y0 + F.h / 2, F.z));
    for (const s of [-1, 1]) for (const yy of [F.y0, F.y0 + F.h]) paint.add(at(ico(0.26, 0, DARKGOLD), s * (F.w / 2 + b / 2), yy + (yy > F.y0 ? b / 2 : 0.05), F.z + 0.1));   // the corners' ornaments
    for (let i = 0; i < 9; i++) paint.add(at(ico(0.09, 0, DARKGOLD), -F.w / 2 + (i + 0.5) * F.w / 9, F.y0 + F.h + b / 2, F.z + 0.12));
    const plaque = at(new THREE.Mesh(new THREE.PlaneGeometry(1.2, 0.3), mat({ map: plaqueT, unlit: 0.6 })), 0, F.y0 + F.h + b + 0.24, F.z + 0.02); paint.add(plaque);
    const reedM = M(0x3e6a2a, { unlit: 0.15 }), frondM = M(0x2e5a24, { unlit: 0.15 });
    for (const s of [-1, 1]) {
      for (let i = 0; i < 9; i++) { const r = at(box(0.03, 0.7 + 0.5 * hash(i, s, 4916), 0.03, reedM), s * (PL.x1 - 0.25 - 0.12 * (i % 3)), 0.1, PL.z0 + 0.15 + 0.1 * Math.floor(i / 3)); r.rotation.z = (hash(i, s, 4917) - 0.5) * 0.4; paint.add(r); }
    }
    const fronds = [];
    for (let i = 0; i < 7; i++) { const f = at(box(0.06, 1.6 + 0.6 * hash(i, 4918), 0.06, frondM), -F.w / 2 + 0.4 + i * 0.22, F.y0 + F.h - 0.6, F.z + 0.25); paint.add(f); fronds.push(f); }
    // ---- the proscenium: two gold columns, the arch, a valance, red velvet swags; footlights on the lip ----
    const velM = mat({ map: velvetT, rep: [3, 1] });
    for (const s of [-1, 1]) {
      G.add(at(box(0.7, S.H, 0.7, GOLD), s * (S.X - 0.35), S.H / 2, S.LIP - 0.2));
      const swag = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 1.25, S.H - 1.2, 8, 1, true, s > 0 ? PI : 0, PI), mat({ map: velvetT, rep: [2, 1], side: THREE.DoubleSide }));
      swag.position.set(s * (S.X - 1.5), (S.H - 1.2) / 2, S.LIP - 0.55); G.add(swag);
      G.add(at(ico(0.22, 0, GOLD), s * (S.X - 1.3), 3.0, S.LIP - 0.25));   // the tie-back's tassel
    }
    G.add(at(box(W, 1.1, 0.4, velM), 0, S.H - 0.55, S.LIP - 0.3));
    G.add(at(box(W, 0.18, 0.5, GOLD), 0, S.H - 1.15, S.LIP - 0.3));
    for (let x = -S.X + 0.3; x < S.X; x += 0.4) G.add(rot(at(cone(0.06, 0.2, 4, GOLD), x, S.H - 1.33, S.LIP - 0.1), PI, 0, 0));
    G.add(at(box(W, 0.12, 0.08, GOLD), 0, -0.06, S.LIP));
    const foot = [];
    for (let x = -6.8; x <= 6.81; x += 0.85) { const f = at(new THREE.Mesh(new THREE.SphereGeometry(0.06, 6, 3, 0, TAU, 0, PI / 2), glow(0xffe0a0)), x, 0.0, S.LIP + 0.1); G.add(f); foot.push(f); }
    // the stage's dark back and wings: black drapes
    const drapeM = mat({ map: drapeT, rep: [6, 1] });
    G.add(at(new THREE.Mesh(new THREE.PlaneGeometry(W, S.H), drapeM), 0, S.H / 2, S.Z0));
    for (const s of [-1, 1]) G.add(rot(at(new THREE.Mesh(new THREE.PlaneGeometry(S.LIP - S.Z0, S.H), drapeM), s * S.X, S.H / 2, (S.Z0 + S.LIP) / 2), 0, -s * PI / 2, 0));
    const ceil = new THREE.Mesh(new THREE.PlaneGeometry(W, S.LIP - S.Z0 + 14), M(0x0e0b0c)); ceil.rotation.x = PI / 2; G.add(at(ceil, 0, S.H, (S.Z0 + S.LIP + 14) / 2));
    // ---- the director's corner: her canvas chair, the hand-cranked camera on its tripod, a work light ----
    const chairG = new THREE.Group(); G.add(chairG); chairG.position.set(S.CHAIR[0], 0, S.CHAIR[1]); chairG.rotation.y = PI / 2;   // facing +x, the pool
    { const wood = M(0x6a4422), canvasRed = M(0xb81e2a, { unlit: 0.15 });
      for (const sx of [-1, 1]) { const x1 = at(box(0.04, 0.62, 0.04, wood), sx * 0.24, 0.26, 0); x1.rotation.x = 0.55; chairG.add(x1); const x2 = at(box(0.04, 0.62, 0.04, wood), sx * 0.24, 0.26, 0); x2.rotation.x = -0.55; chairG.add(x2); }
      chairG.add(at(box(0.5, 0.03, 0.42, canvasRed), 0, S.SEAT_Y - 0.015, 0));
      for (const sx of [-1, 1]) chairG.add(at(box(0.04, 0.95, 0.04, wood), sx * 0.26, 0.47, -0.2));
      chairG.add(at(box(0.52, 0.24, 0.02, canvasRed), 0, 0.82, -0.21)); for (const sx of [-1, 1]) chairG.add(at(box(0.04, 0.04, 0.4, wood), sx * 0.27, 0.66, 0)); }
    const camG = new THREE.Group(); G.add(camG); camG.position.set(S.CAMERA[0], 0, S.CAMERA[1]);
    { const blk = M(0x1c1c20), wood = M(0x7a5030), brass = M(0xc8a040, { unlit: 0.3 });
      for (let i = 0; i < 3; i++) { const a = i * TAU / 3, l = at(cyl(0.025, 0.025, 1.3, 4, wood), Math.sin(a) * 0.28, 0.6, Math.cos(a) * 0.28); l.rotation.set(Math.cos(a) * 0.42, 0, -Math.sin(a) * 0.42); camG.add(l); }
      const body = at(new THREE.Group(), 0, 1.38, 0); camG.add(body); body.rotation.y = Math.atan2(S.OPH[0] - S.CAMERA[0], S.OPH[1] - S.CAMERA[1]);
      body.add(box(0.32, 0.38, 0.5, blk)); body.add(at(rot(cyl(0.08, 0.1, 0.22, 10, blk), PI / 2, 0, 0), 0, -0.02, 0.34)); body.add(at(rot(cyl(0.06, 0.06, 0.01, 10, glow(0x5a7ab8, 0.8)), PI / 2, 0, 0), 0, -0.02, 0.455));
      for (const z of [-0.14, 0.16]) body.add(at(rot(cyl(0.17, 0.17, 0.05, 12, blk), 0, 0, PI / 2), 0, 0.34, z));   // the two film reels on top
      const crank = at(new THREE.Group(), 0.18, 0, 0); body.add(crank); crank.add(at(box(0.02, 0.18, 0.02, brass), 0, 0.08, 0)); crank.add(at(box(0.08, 0.03, 0.03, brass), 0.03, 0.17, 0)); camG.userData.crank = crank; }
    const lampG = new THREE.Group(); G.add(lampG); lampG.position.set(S.LIGHT[0], 0, S.LIGHT[1]);
    lampG.add(at(cyl(0.025, 0.025, 2.4, 5, M(0x1c1c20)), 0, 1.2, 0)); const lampHead = at(new THREE.Group(), 0, 2.45, 0); lampG.add(lampHead);
    lampHead.add(rot(cyl(0.22, 0.16, 0.36, 10, M(0x2a2a30)), PI / 2, 0, 0)); lampHead.add(at(rot(cyl(0.2, 0.2, 0.01, 10, glow(0xfff2c8)), PI / 2, 0, 0), 0, 0, 0.19)); lampHead.rotation.y = Math.atan2(S.OPH[0] - S.LIGHT[0], S.OPH[1] - S.LIGHT[1]); lampHead.rotation.x = 0.35;
    // ---- the lifeguard tower: four white legs, the platform and its rails, a ladder at its back, a red cross, two rings ----
    const tower = new THREE.Group(); G.add(tower); tower.position.set(S.TOWER[0], 0, S.TOWER[1]);
    { const wh = M(0xf2f0ea, { unlit: 0.15 }), red = M(0xd8283a, { unlit: 0.3 });
      for (const [x, z] of [[-0.4, -0.4], [0.4, -0.4], [-0.4, 0.4], [0.4, 0.4]]) { const l = at(box(0.08, S.TOWER_Y, 0.08, wh), x * 1.2, S.TOWER_Y / 2, z * 1.2); l.rotation.set(-z * 0.12, 0, x * 0.12); tower.add(l); }
      tower.add(at(box(0.95, 0.07, 0.95, wh), 0, S.TOWER_Y - 0.035, 0));
      tower.add(at(box(0.05, 0.75, 0.95, wh), 0.47, S.TOWER_Y + 0.37, 0));                                   // its back rail (on +x: it faces -x)
      for (const z of [-0.47, 0.47]) tower.add(at(box(0.95, 0.05, 0.05, wh), 0, S.TOWER_Y + 0.42, z));
      for (let i = 0; i < 7; i++) tower.add(at(box(0.05, 0.05, 0.55, wh), 0.62, 0.3 + i * 0.32, 0));       // the ladder's rungs behind it
      for (const z of [-0.28, 0.28]) tower.add(at(box(0.05, S.TOWER_Y, 0.05, wh), 0.62, S.TOWER_Y / 2, z));
      const crossP = new THREE.Group(); crossP.add(box(0.03, 0.42, 0.42, wh)); crossP.add(at(box(0.04, 0.3, 0.09, red), -0.01, 0, 0)); crossP.add(at(box(0.04, 0.09, 0.3, red), -0.01, 0, 0)); crossP.position.set(-0.5, S.TOWER_Y - 0.35, 0); tower.add(crossP);
      for (const z of [-0.5, 0.5]) { const r = new THREE.Group(); for (let j = 0; j < 8; j++) { const a = new THREE.Mesh(new THREE.TorusGeometry(0.22, 0.06, 4, 3, PI / 4), j % 2 ? red : wh); a.rotation.z = j * PI / 4; r.add(a); } r.position.set(0, 1.5, z * 1.25); tower.add(r); }
    }
    // ---- the stalls: rows of red seats rising from the lip, gilded boxes on the side walls, a chandelier ----
    const A = S.AUD, aud = new THREE.Group(); G.add(aud);
    const seatM = M(0x9a1424, { unlit: 0.12 }), aisle = 1.2;
    for (let r = 0; r < A.rows; r++) {
      const y = A.y0 + r * A.dy, z = A.z0 + r * A.dz;
      aud.add(at(box(2 * A.x + 2, A.dy, A.dz, M(0x3a1e22)), 0, y - A.dy / 2, z + 0.1));
      for (let x = -A.x; x <= A.x + 0.01; x += 0.62) { if (Math.abs(x) < aisle / 2) continue; aud.add(at(box(0.52, 0.42, 0.5, seatM), x, y + 0.21, z)); aud.add(at(box(0.52, 0.5, 0.1, seatM), x, y + 0.5, z + 0.28)); }
    }
    const hallW = 2 * (A.x + 1.6), hallZ1 = A.z0 + A.rows * A.dz + 1;
    for (const s of [-1, 1]) {
      aud.add(rot(at(new THREE.Mesh(new THREE.PlaneGeometry(hallZ1 - S.LIP, S.H + 1), M(0x5a1a20)), s * hallW / 2, (S.H - 1) / 2, (S.LIP + hallZ1) / 2), 0, -s * PI / 2, 0));
      for (const z of [5.6, 8.0]) { aud.add(at(box(0.6, 0.55, 1.8, GOLD), s * (hallW / 2 - 0.3), 3.2, z)); aud.add(at(box(0.6, 1.0, 1.8, M(0x3a0e14)), s * (hallW / 2 - 0.62), 3.9, z)); }
    }
    aud.add(rot(at(new THREE.Mesh(new THREE.PlaneGeometry(hallW, S.H + 1), M(0x4a1418)), 0, (S.H - 1) / 2, hallZ1), 0, PI, 0));
    const chand = new THREE.Group(); aud.add(chand); chand.position.set(0, 7.6, 7.2);
    { const cr = glow(0xfff2d0, 0.85); chand.add(at(box(0.03, 1.4, 0.03, GOLD), 0, 0.7, 0));
      for (const [r, y, n] of [[1.0, 0, 14], [0.65, -0.35, 10], [0.3, -0.65, 6]]) for (let i = 0; i < n; i++) { const a = i / n * TAU; chand.add(at(ico(0.08, 0, cr), Math.sin(a) * r, y - 0.1 * (i % 2), Math.cos(a) * r)); } }
    // ---- the box pets ----
    const crew = S.CREW.map((p, i) => { const q = pet(i + 2, 'crew'); G.add(q.g); return q; });
    const boom = new THREE.Group(); crew[0].arms[1].add(boom);   // the boom operator's pole and its fuzzy mic, out over the pool
    boom.add(at(box(0.03, 2.6, 0.03, M(0x9a9aa4)), 0, -0.3, 1.1)); boom.children[0].rotation.x = 1.25;
    boom.add(at(ico(0.14, 1, M(0x8a8a92)), 0, 0.12, 2.32));
    const chorus = S.CHORUS.map((p, i) => { const q = pet(i, 'swim'); G.add(q.g); return q; });
    const swimmers = S.SWIM.map((p, i) => { const q = pet(i + 4, 'swim', { cap: 0xf6f4ee, band: 0xe0283a }); G.add(q.g); return q; });   // white caps and red bands: teal on the aqua water read as blobs from above
    const audience = [];
    for (let r = 0; r < 3; r++) for (let j = 0; j < 8; j++) {
      const x = -A.x + 0.31 + j * 1.86 + (r % 2) * 0.62; if (Math.abs(x) < 0.9 || Math.abs(x) > A.x) continue;
      const q = pet(r * 8 + j, 'aud'); q.home = [x, A.y0 + r * A.dy + 0.12, A.z0 + r * A.dz - 0.05]; G.add(q.g); audience.push(q);
    }
    // ---- cut-out painted waves in front of the pool (the swimming number's sea), floating rings, drops, hearts ----
    const waveRows = [0, 1, 2].map(r => {
      const g = new THREE.Group(), m = M([0x1a7a8a, 0x22909e, 0x36bcc4][r], { unlit: 0.4, side: THREE.DoubleSide });
      for (let i = -5; i <= 5; i++) { const sc = new THREE.Mesh(new THREE.CircleGeometry(0.38, 8, 0, PI), m); sc.position.set(i * 0.66 + (r % 2) * 0.33, 0, 0); g.add(sc); }
      g.add(at(box(7.6, 0.3, 0.02, m), 0, -0.15, 0));
      g.add(at(box(7.6, 0.04, 0.03, M(0xf2fbfb, { unlit: 0.5 })), 0, 0.02, 0.01));
      g.position.set(0, 0, PL.z1 + 0.2 + r * 0.35); G.add(g); return g;
    });
    const floatRings = Array.from({ length: 6 }, () => { const r = new THREE.Group(); for (let j = 0; j < 8; j++) { const a = new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.08, 4, 3, PI / 4), M(j % 2 ? 0xe0283a : 0xf6f6f2, { unlit: 0.4 })); a.rotation.z = j * PI / 4; r.add(a); } r.rotation.x = -PI / 2; r.visible = false; G.add(r); return r; });
    const dropM = mat({ color: 0xe8fcff, unlit: 0.9 }), ringM = mat({ color: 0xf2fdff, unlit: 0.8, see: 0.3 }), colM = mat({ color: 0xe8fbfc, unlit: 0.85, see: 0.55 });
    const dropP = Array.from({ length: 220 }, () => { const q = new THREE.Mesh(new THREE.IcosahedronGeometry(1, 0), dropM); q.visible = false; G.add(q); return q; });
    const ringP = Array.from({ length: 6 }, () => { const q = new THREE.Mesh(new THREE.TorusGeometry(1, 0.06, 4, 18), ringM); q.rotation.x = PI / 2; q.visible = false; G.add(q); return q; });
    const column = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.55, 1, 9, 1, true), colM); column.visible = false; G.add(column);
    const puddles = Array.from({ length: 10 }, () => { const q = flat(1, 1, mat({ color: 0x6aa4b8, unlit: 0.5, see: 0.45 }), 0, 0.012, 0); q.geometry = new THREE.CircleGeometry(0.5, 10); q.visible = false; G.add(q); return q; });
    const heartM = M(0xff4f9a, { unlit: 0.8 }), hearts = [];
    for (let i = 0; i < 12; i++) { const h = new THREE.Group(); h.add(at(ico(0.1, 0, heartM), -0.075, 0, 0)); h.add(at(ico(0.1, 0, heartM), 0.075, 0, 0)); h.add(rot(at(cone(0.125, 0.18, 4, heartM), 0, -0.11, 0), PI, 0, 0)); h.visible = false; G.add(h); hearts.push(h); }
    const spotDisc = flat(1, 1, mat({ color: 0xfff4d0, unlit: 1, see: 0.55 }), 0, 0.02, 0); spotDisc.geometry = new THREE.CircleGeometry(1.0, 16); spotDisc.visible = false; G.add(spotDisc);

    function light(P = {}) {
      const z = P.zone || 'set';
      if (z === 'number') { lights(0x5a8a96, 0xd8fbff, [0.2, -0.9, -0.4], 0x0c1e24, [14, 40], 9); pt(0, 0, 3.4, -1.6, 0.9, 1.2, 1.25); pt(1, -4.5, 3.0, 1.0, 1.1, 0.55, 0.85); pt(2, 4.5, 3.0, 1.0, 0.5, 1.0, 1.1); pt(3, 0, 3.0, 6.5, 0.9, 0.7, 0.6); }
      else if (z === 'dark') { lights(0x2a2228, 0x8a7a70, [0.2, -0.9, -0.4], 0x070506, [10, 34], 8); }
      else { lights(0x6a5a52, 0xfff0d8, [0.3, -0.9, -0.45], 0x120c0a, [14, 42], 9); pt(0, S.OPH[0], 3.6, S.OPH[1] + 1.2, 1.25, 1.12, 0.92); pt(1, -4.2, 2.6, 0.4, 0.9, 0.78, 0.62); pt(2, 4.0, 2.8, -0.6, 0.85, 0.8, 0.7); pt(3, 0, 3.0, 6.5, 0.85, 0.66, 0.5); }
      if (P.spot && P.spotOn !== false) pt(3, P.spot[0], 3.2, P.spot[1] + 0.6, 1.35, 1.25, 1.05);
      if (P.key) pt(1, P.key[0], P.key[1], P.key[2], P.key[3], P.key[4], P.key[5]);
    }
    return {
      group: G, sky: null, shadowCol: 0x24170e, indoor: true,
      light() { light(); },
      anim(t, P = {}) {
        const s = shotT(t, P), bt = beat(t), hide = new Set(P.hide || []), z = P.zone || 'set';
        P = { ...P, spotOn: !!P.spot && (P.spot[2] == null || s >= P.spot[2]) };   // spot [x, z, s0]: on from s0 into the shot
        light(P);
        U.uWaterY.value = S.WATER_Y; U.uWaterCol.value.set(z === 'number' ? 0x2ab0c4 : 0x1e5a50);
        water.material = z === 'number' ? waterNumM : waterSetM; water.position.y = S.WATER_Y + 0.005 * Math.sin(t * 1.9);
        canvas.material = z === 'number' ? seaM : canvasM;
        paint.visible = !hide.has('painting'); flowersG.visible = !hide.has('flowers') && z !== 'number';
        drift.forEach(([f, x, zz, i]) => { f.position.x = x + 0.05 * Math.sin(t * 0.4 + i); f.position.z = zz + 0.04 * Math.cos(t * 0.33 + i * 1.7); f.rotation.y = t * 0.1 + i; });
        fronds.forEach((f, i) => { f.rotation.z = 0.05 * Math.sin(t * 0.8 + i); });
        chairG.visible = !hide.has('chair'); camG.visible = !hide.has('camera'); lampG.visible = !hide.has('light'); tower.visible = !hide.has('tower'); aud.visible = !hide.has('audience');
        camG.userData.crank.rotation.x = t * 6;
        foot.forEach((f, i) => { f.scale.setScalar(z === 'number' ? 1 + 0.25 * Math.exp(-fr(bt + i * 0.25) * 4) : 1); });
        // the follow spot's pool
        spotDisc.visible = P.spotOn; if (P.spotOn) { const onW = P.spot[0] > PL.x0 && P.spot[0] < PL.x1 && P.spot[1] > PL.z0 && P.spot[1] < PL.z1; spotDisc.position.set(P.spot[0], onW ? S.WATER_Y + 0.02 : 0.02, P.spot[1]); spotDisc.scale.setScalar(1.1); }
        // the crew
        const cm = P.crew ?? 'work', noG = !!P.noguests;
        crew.forEach((q, i) => {
          const [x, zz] = S.CREW[i]; q.g.visible = !!cm && !noG && !hide.has('crew') && !cleared(P, x, zz); if (!q.g.visible) return;
          reset(q); const yaw = Math.atan2(S.OPH[0] - x, S.OPH[1] - zz); q.g.position.set(x, 0, zz); q.g.rotation.y = yaw;
          if (i === 0) { q.arms[1].rotation.set(-2.5, 0, 0.2); q.arms[0].rotation.set(-2.3, 0, -0.3); }                 // holding the boom up
          else if (i === 1) { q.arms[1].rotation.set(-1.2 + 0.5 * Math.sin(t * 6), 0, 0.3); }                         // cranking
          if (cm === 'stare' || cm === 'gasp') { q.mouth.visible = cm === 'gasp'; turnTo(q, x, zz, P, yaw); if (cm === 'gasp' && i) q.arms.forEach((a, j) => a.rotation.set(-2.6, 0, (j ? -1 : 1) * 0.35)); }
          if (cm === 'cheer' && i) { q.arms.forEach((a, j) => a.rotation.set(0, 0, (j ? 1 : -1) * 2.45)); q.body.position.y = 0.05 * Math.abs(Math.sin(bt * PI)); }
        });
        // the swimmers: on the stage's edge round the pool, or in the water in their rings
        const ch = P.chorus ?? false;
        chorus.forEach((q, i) => {
          if (ch === 'pile') {   // the rescued chorus heaped on the stage's edge in their teal caps, the bottom row's rings at their feet (white caps heaped read as snowballs)
            const [px, py, pz, yw, back] = S.PILE[i]; q.g.visible = !noG && !hide.has('chorus'); if (!q.g.visible) return;
            reset(q); q.g.position.set(px, py + 0.14, pz); q.g.rotation.set(0, yw * PI / 180, 0);
            q.body.rotation.x = back ? -PI / 2 : PI / 2; q.arms.forEach((ar, j) => ar.rotation.set(0, 0, (j ? 1 : -1) * (0.9 + 0.3 * ((i + j) % 2)))); q.legs.forEach((l, j) => l.rotation.set((j ? 0.4 : -0.3), 0, 0));
            q.ring.visible = py === 0; q.ring.position.set(0.42, -0.1, 0.1); q.ring.rotation.set(PI / 2, 0, 0);
            return;
          }
          q.ring.visible = true; q.ring.position.set(0.23, 0.64, 0.05); q.ring.rotation.set(0, 0, 0);   // the rest pose (a pile's frame must not leak into the next)
          const [x, zz] = S.CHORUS[i]; q.g.visible = !!ch && ch !== 'swim' && !noG && !hide.has('chorus') && !cleared(P, x, zz); if (!q.g.visible) return;
          reset(q); q.g.position.set(x, 0, zz); q.g.rotation.set(0, 0, 0); q.g.rotation.y = zz > PL.z1 ? 0 : (x < 0 ? PI / 2 : -PI / 2) * 0.6;
          const up = Math.exp(-fr(bt) * 3), ph = Math.sin(bt * PI);
          if (ch === 'line' || ch === 'up') {   // the ring raised over the head on the beat, the other paw on the hip
            const lift = ch === 'up' ? 1 : 0.5 + 0.5 * up;
            q.arms[1].rotation.set(-PI * 0.9 * lift, 0, 0.15); q.arms[0].rotation.set(0, 0, -0.5); q.ring.position.set(0.23, 0.64 + 0.62 * lift, 0.05 + 0.1 * lift); q.ring.rotation.set(0, 0, 0);
            q.body.rotation.z = 0.08 * ph; q.body.position.y = 0.04 * up;
          } else if (ch === 'frame') {           // the ring held up round the face with both paws: the clip's portrait
            q.arms.forEach((a, j) => a.rotation.set(-2.2, 0, (j ? -1 : 1) * 0.5)); q.ring.position.set(0, 0.95, 0.24); q.ring.rotation.set(0, 0, 0);
          } else if (ch === 'stare') { q.ring.position.set(0.24, 0.42, 0.05); q.mouth.visible = true; turnTo(q, x, zz, P, q.g.rotation.y); }
        });
        swimmers.forEach((q, i) => {
          if (ch === 'pile') { q.g.visible = false; return; }   // the chorus itself is the heap
          if (ch === 'float') {
            q.g.visible = !noG && !hide.has('chorus'); if (!q.g.visible) return;
            reset(q); q.ring.visible = ch === 'float';
            if (ch === 'float') {   // on the back, the head towards the star's centre, arms and legs spread
              const [cx, cz, r] = S.STAR, a = i / 10 * TAU + 0.1 * Math.sin(t * 0.3), bob = 0.025 * Math.sin(t * 2 + i);
              q.g.position.set(cx + Math.sin(a) * (r + 0.55), S.WATER_Y - 0.02 + bob, cz + Math.cos(a) * (r + 0.55)); q.g.rotation.set(0, a, 0);
              q.body.rotation.x = -PI / 2; q.body.position.set(0, 0.12, 0);
              q.arms.forEach((ar, j) => ar.rotation.set(0, 0, (j ? 1 : -1) * (1.35 + 0.15 * Math.sin(bt * PI + i)))); q.legs.forEach((l, j) => l.rotation.set(0, 0, (j ? 1 : -1) * 0.35));
              q.ring.position.set(0, 0.06, -0.5); q.ring.rotation.set(PI / 2, 0, 0);
            } else {                 // heaped on the stage's edge, some on their backs, some face down
              const [x, y, zz, yw, back] = S.PILE[i];
              q.g.position.set(x, y + 0.14, zz); q.g.rotation.set(0, yw * PI / 180, 0);
              q.body.rotation.x = back ? -PI / 2 : PI / 2; q.arms.forEach((ar, j) => ar.rotation.set(0, 0, (j ? 1 : -1) * (0.9 + 0.3 * ((i + j) % 2)))); q.legs.forEach((l, j) => l.rotation.set((j ? 0.4 : -0.3), 0, 0));
            }
            return;
          }
          q.ring.visible = true;
          const [x, zz] = S.SWIM[i]; q.g.visible = ch === 'swim' && !noG && !hide.has('chorus') && !cleared(P, x, zz); if (!q.g.visible) return;
          reset(q); const bob = 0.04 * Math.sin(t * 2.2 + i);
          q.g.position.set(x, S.WATER_Y - 0.52 + bob, zz); q.g.rotation.y = Math.atan2(-x, 2 - zz) * 0.5;
          q.ring.position.set(0, 0.5, 0); q.ring.rotation.set(PI / 2, 0, 0);
          q.arms.forEach((a, j) => a.rotation.set(-PI * (0.85 + 0.1 * Math.sin(bt * PI + j)), 0, (j ? -1 : 1) * 0.35));
        });
        // the audience
        const am = P.audience ?? 'watch';
        audience.forEach((q, i) => {
          const [x, y, zz] = q.home; q.g.visible = !!am && !noG && !hide.has('audience') && !cleared(P, x, zz); if (!q.g.visible) return;
          reset(q); q.g.position.set(x, y, zz); q.g.rotation.y = PI; q.legs.forEach(l => { l.rotation.x = -PI / 2; }); q.body.position.y = -0.18;
          if (am === 'cheer') { q.arms.forEach((a, j) => a.rotation.set(0, 0, (j ? 1 : -1) * 2.45)); q.body.position.y = -0.18 + 0.05 * Math.abs(Math.sin(bt * PI + i)); }
          else if (am === 'gasp') { q.mouth.visible = true; q.arms.forEach((a, j) => a.rotation.set(-2.6, 0, (j ? -1 : 1) * 0.35)); }
          if (am === 'stare' || am === 'gasp') turnTo(q, x, zz, P, PI);
        });
        // the painted waves
        const wv = ramp(P.waves, s);
        waveRows.forEach((g, r) => { g.visible = wv > 0.01; g.position.y = -0.6 + 0.62 * wv + 0.05 * Math.sin(bt * PI + r); g.position.x = 0.25 * Math.sin(bt * PI * 0.5 + r * 1.3); g.position.z = (P.wavesZ ?? PL.z1 + 0.2) + r * 0.35; });   // wavesZ: the first row's z (in front of dancers on the stage)
        // rings floating on the water; one in flight
        floatRings.forEach(r => { r.visible = false; });
        let fi = 0;
        (P.buoys || []).forEach(([x, zz, s0 = -9]) => { if (s < s0 || fi >= floatRings.length) return; const r = floatRings[fi++]; r.visible = true; r.position.set(x, S.WATER_Y + 0.03 + 0.02 * Math.sin(t * 2.6 + x), zz); r.rotation.set(-PI / 2, 0, t * 0.2); });
        if (P.buoyToss && fi < floatRings.length) {
          const [x0, y0, z0, x1, z1, s0, dur = 0.7] = P.buoyToss, u = (s - s0) / dur;
          if (u >= 0) { const r = floatRings[fi++]; r.visible = true; const v = Math.min(1, u); r.position.set(x0 + (x1 - x0) * v, y0 + (S.WATER_Y + 0.03 - y0) * v + 1.4 * 4 * v * (1 - v), z0 + (z1 - z0) * v); r.rotation.set(-PI / 2 + (1 - v) * 1.4, 0, u * 6); }
        }
        // splashes, the dive's crown and column, drips, puddles
        dropP.forEach(q => { q.visible = false; }); ringP.forEach(q => { q.visible = false; }); column.visible = false;
        let di = 0, ri = 0;
        (P.splash || []).forEach(([x, zz, s0, size = 1]) => {
          const age = s - s0; if (age < 0 || age > 0.9) return;
          for (let j = 0; j < 22 && di < dropP.length; j++) {
            const a = hash(j, 4920) * TAU, v = (1.8 + 1.4 * hash(j, 4921)) * size, sp = (0.6 + 0.9 * hash(j, 4922)) * size, y = S.WATER_Y + v * age - 4.9 * age * age;
            if (y < S.WATER_Y - 0.05) continue;
            const q = dropP[di++]; q.visible = true; q.position.set(x + Math.cos(a) * sp * age, y, zz + Math.sin(a) * sp * age); q.scale.setScalar((0.04 + 0.03 * hash(j, 4923)) * size);
          }
          if (ri < ringP.length) { const rg = ringP[ri++]; rg.visible = true; rg.position.set(x, S.WATER_Y + 0.02, zz); rg.scale.setScalar((0.3 + age * 1.6) * size); }
        });
        if (P.bigSplash) {
          const [x, zz, s0] = P.bigSplash, age = s - s0;
          if (age >= 0 && age < 1.6) {
            for (let j = 0; j < 150 && di < dropP.length; j++) {   // the crown: small drops thrown up and out wide, then falling
              const a = hash(j, 4924) * TAU, v = 2.6 + 3.4 * hash(j, 4925), sp = 1.0 + 2.6 * hash(j, 4926), y = S.WATER_Y + v * age - 4.9 * age * age;
              if (y < S.WATER_Y - 0.05) continue;
              const q = dropP[di++]; q.visible = true; q.position.set(x + Math.cos(a) * sp * age, y, zz + Math.sin(a) * sp * age); q.scale.setScalar(0.03 + 0.025 * hash(j, 4927));
            }
            if (age < 0.7) { const h = 1.6 * Math.sin(Math.min(1, age / 0.35) * PI / 2) * (1 - cl((age - 0.35) / 0.35)); column.visible = h > 0.05; column.scale.set(0.7 + age, Math.max(0.05, h), 0.7 + age); column.position.set(x, S.WATER_Y + h / 2, zz); }
            for (let k2 = 0; k2 < 2 && ri < ringP.length; k2++) { const e = age - k2 * 0.25; if (e < 0) continue; const rg = ringP[ri++]; rg.visible = true; rg.position.set(x, S.WATER_Y + 0.02, zz); rg.scale.setScalar(0.5 + e * 2.2); }
          }
        }
        if (P.rainAt) {   // the dive's drops coming down round a point
          const [x, zz, s0, r = 0.8] = P.rainAt, age = s - s0;
          if (age >= 0 && age < 1.2) for (let j = 0; j < 40 && di < dropP.length; j++) {
            const st = hash(j, 4933) * 0.5, e = age - st; if (e < 0) continue;
            const y = 2.6 - 4.9 * e * e - 1.5 * e; if (y < 0.02) continue;
            const a = hash(j, 4934) * TAU, rr = r * Math.sqrt(hash(j, 4935)), q = dropP[di++]; q.visible = true; q.position.set(x + Math.cos(a) * rr, y, zz + Math.sin(a) * rr); q.scale.setScalar(0.03 + 0.02 * hash(j, 4936));
          }
        }
        (P.drips || []).forEach(([x, zz, h = 1.25], k2) => {
          for (let j = 0; j < 12 && di < dropP.length; j++) {
            const ph = fr(t * 1.6 + hash(j, k2, 4928)), a = hash(j, k2, 4929) * TAU, r = 0.22 + 0.2 * hash(j, k2, 4930), y = h * (1 - ph * ph);
            const q = dropP[di++]; q.visible = true; q.position.set(x + Math.cos(a) * r, Math.max(0.02, y), zz + Math.sin(a) * r); q.scale.setScalar(0.03 + 0.02 * hash(j, k2, 4931));
          }
        });
        puddles.forEach(q => { q.visible = false; });
        let pi2 = 0;
        (P.drips || []).forEach(([x, zz]) => { if (pi2 < puddles.length && !(x > PL.x0 && x < PL.x1 && zz > PL.z0 && zz < PL.z1)) { const q = puddles[pi2++]; q.visible = true; q.position.set(x, 0.012, zz); q.scale.setScalar(0.7); } });
        if (P.wet) for (let j = 0; j < 8 && pi2 < puddles.length; j++) { const q = puddles[pi2++]; const a = j / 8 * TAU; q.visible = true; q.position.set(Math.sin(a) * 3.6, 0.012, -2.0 + Math.cos(a) * 3.1); q.scale.setScalar(0.7 + 0.5 * hash(j, 4932)); }
        // hearts over points
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

  return { ophelia: ophelia() };
}
