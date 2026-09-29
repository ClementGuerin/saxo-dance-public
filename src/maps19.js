// maps19.js: the "Ain't In LA" maps (2026-09-30, ADÉLA, 2026; the clip: a pink-haired girl in her childhood bedroom
// in a Slovak housing estate, full of trophies and posters, dreaming of Hollywood; a painted HOLLYWOOD backdrop in the
// estate with folk dancers in front of it, a car drifting in a port, a fountain, bikes, the grey prefab blocks). Same
// contract as the other map files, pure in t:
//   estate  a grey prefab block of flats (a panelák, 8 floors, its front at ESTATE.FACE_Z) over a car park: pastel
//           panels, a window per unit, balconies (BALC_X columns, floors 1-7) with low solid fronts; the stairwell
//           door (DOOR) and a corner shop (POTRAVINY) on the ground floor; Kob's balcony on floor 2 (KOB, floor at
//           KOB_Y: stand her 0.3 m above it, on a step, or the balcony's front hides her face); HOLLYWOOD painted on
//           bedsheets pegged to a line strung along the floor-2 balconies from x0 to her railing at x1 (SHEET: its centre, width, top and bottom), the
//           "Hollywood hills" behind the dance mark; a potted palm (PALM), a chalk Walk of Fame star with SAXO on the
//           tarmac (STAR, the dance mark), lamps, a bench, old boxy cars parked at the sides, a parked shopping
//           trolley (TROLLEY_PARK). Neighbours (box pets in cardigans) on the balconies.
//           Flags read by anim(t, P): `zone` ('day' overcast | 'dusk' | 'night': the sky, the lights, lit windows),
//           `rain` (true, or s into the shot: it starts then), `wet` (puddles without rain), `sheet` (0: taken in),
//           `sheetPull` (s into the shot: it is yanked up and over Kob's railing in 0.45 s; taken in, it hangs folded on her own line), `balc` ('watch' |
//           'dance' | 'cheer': the neighbours on the balconies), `stare` ([x, y, z]: every neighbour looks there),
//           `trolley` (false hides the parked one), `noguests`.
//   panel   inside the block: Saxo's childhood bedroom (x < 0) and Kob's flat (x > 0), back to back through one thin
//           panel wall at x = 0. His: pink starry wallpaper, the bed (BED, mattress top BED_Y), the trophy shelf
//           (SHELF), LA posters, the HOLLYWOOD poster on the shared wall (POSTER), a window onto the rainy estate.
//           Hers: 70s floral wallpaper, her armchair (CHAIR, seat top CHAIR_Y, facing +z), the TV, a side table with
//           her milk, a framed photo on the shared wall (FRAME). Flags: `thump` (the frame, the poster and the
//           trophies jump on every beat: the music through the wall), `bang` ([s, ...]: a fist on the wall at those s
//           into the shot: everything jumps once), `posterFall` (s into the shot: the poster drops off the wall),
//           `poster` (0: it lies on the floor), `rain` (on the windows), `lamp`.
import { mapKit } from './mapkit.js';

export const ESTATE = { FACE_Z: -13, FLOOR_H: 2.8, FLOORS: 8, BALC_X: [-10.8, -3.6, 3.6, 10.8], BALC_D: 1.2, KOB: [4.4, -12.2], KOB_Y: 5.6,
  SHEET: { x: 0.3, z: -11.72, w: 8.6, top: 6.1, bottom: 1.1, x0: -4.0, x1: 4.6 }, DOOR: [-7.2, -13], PALM: [-2.5, -9.2], STAR: [0, -7.4],
  LAMPS: [[-5.5, -4.5], [5.5, -4.5], [-5.5, 6.5], [5.5, 6.5]], BENCH: [-4.2, -9.6], TROLLEY_PARK: [3.0, -9.0, 30] };
export const PANEL = { W: 4.2, D0: -2.6, D1: 6.4, H: 2.7, BED: [-3.15, -1.3], BED_Y: 0.5, SHELF: [-1.5, -2.55], POSTER: [-0.03, 1.45, -0.6],
  CHAIR: [2.1, -1.2], CHAIR_Y: 0.12, TV: [3.6, 0.6], FRAME: [1.45, 1.62, -2.57], WIN_S: [-2.4, -2.6], WIN_K: [3.35, -2.6] };

// the shopping trolley: a wire basket (grey bars) on a chassis with four castors and a red handle at the back (-z);
// a rider sits in the basket (`ride: "trolley"`, seat at TROLLEY.SEAT); its front is +z
export const TROLLEY = { SEAT: 0.44 };
export function trolleyModel(K) {
  const { THREE, mat, box } = K, g = new THREE.Group(), wire = mat({ color: 0xb8bcc4 }), dark = mat({ color: 0x2a2a30 }), red = mat({ color: 0xe8243a });
  const bar = (w, h, d, x, y, z, m = wire) => { const o = box(w, h, d, m); o.position.set(x, y, z); g.add(o); };
  const L = 0.95, Wd = 0.62, B = 0.4, T = 0.95;
  for (const s of [-1, 1]) for (const zz of [L / 2, -L / 2]) bar(0.03, T - B, 0.03, s * Wd / 2, (B + T) / 2, zz);
  for (const y of [B, T, (B + T) / 2]) { bar(Wd, 0.025, 0.025, 0, y, L / 2); bar(Wd, 0.025, 0.025, 0, y, -L / 2); for (const s of [-1, 1]) bar(0.025, 0.025, L, s * Wd / 2, y, 0); }
  for (let i = 1; i < 5; i++) { bar(0.018, T - B, 0.018, -Wd / 2 + i * Wd / 5, (B + T) / 2, L / 2); for (const s of [-1, 1]) bar(0.018, T - B, 0.018, s * Wd / 2, (B + T) / 2, -L / 2 + i * L / 5); }
  bar(Wd, 0.025, L, 0, B, 0);
  for (const s of [-1, 1]) { bar(0.035, B - 0.1, 0.035, s * 0.24, (B + 0.1) / 2, L / 2 - 0.1); bar(0.035, B - 0.1, 0.035, s * 0.24, (B + 0.1) / 2, -L / 2 + 0.05); }
  for (const [x, z] of [[-0.24, 0.38], [0.24, 0.38], [-0.24, -0.42], [0.24, -0.42]]) bar(0.05, 0.1, 0.1, x, 0.05, z, dark);
  bar(Wd + 0.06, 0.06, 0.06, 0, T + 0.08, -L / 2 - 0.12, red);
  for (const s of [-1, 1]) bar(0.03, 0.16, 0.16, s * Wd / 2, T + 0.02, -L / 2 - 0.06);
  return g;
}

export function buildEstateMaps(K) {
  const k = mapKit(K);
  const { THREE, mat, tex, px, noise, box, TAU, PI, hash, beat, grad, sign, cyl, cone, at, rot, merged, flat, lights, pt, fr, fall, room, selfLit } = k;
  const M = (c, o = {}) => mat({ color: c, ...o }), glow = c => mat({ color: c, unlit: 1 });
  const pmod = (a, n) => ((a % n) + n) % n;
  const sm = u => { const v = Math.min(1, Math.max(0, u)); return v * v * (3 - 2 * v); };
  const shotT = (t, P) => P.t0 != null ? t - P.t0 : 0;

  // a neighbour: a box pet in a cardigan (no black fur: it reads as a faceless silhouette)
  const FURS = [0xd8c2a0, 0xb08a68, 0xf2eee6, 0x9a7a5a, 0x9a9aa6, 0xe8a060, 0x8a7a6c, 0xc8b0a0], TOPS = [0xc85a7a, 0x5a8ac8, 0xd8b04a, 0x6aa86a, 0xc8783a, 0x8a6ac8, 0xd84a4a, 0x4ab8b0];
  const eyeM = M(0x101010), noseM = M(0x1a1a1a), glintM = glow(0xffffff);
  function pet(i) {   // lit a little from within: up on the balconies at night they read as black cut-outs otherwise
    const g = new THREE.Group(), fur = M(FURS[i % FURS.length], { unlit: 0.3 }), top = M(TOPS[(i * 3) % TOPS.length], { unlit: 0.3 }), kind = i % 3;
    const body = new THREE.Group(); g.add(body);
    body.add(at(box(0.34, 0.3, 0.24, top), 0, 0.38, 0)); body.add(at(box(0.3, 0.12, 0.22, fur), 0, 0.58, 0));
    body.add(at(box(0.3, 0.24, 0.2, M(0x4a4a58)), 0, 0.12, 0));
    const arms = [-1, 1].map(s => { const a = new THREE.Group(); a.position.set(s * 0.2, 0.58, 0); a.add(at(box(0.08, 0.26, 0.09, top), 0, -0.12, 0)); body.add(a); return a; });
    const head = at(new THREE.Group(), 0, 0.84, 0); body.add(head);
    const skull = new THREE.Mesh(new THREE.IcosahedronGeometry(0.24, 0), fur); skull.scale.set(1, 0.86, 0.9); head.add(skull);
    head.add(at(box(0.14, 0.1, 0.12, fur), 0, -0.05, 0.19)); head.add(at(box(0.07, 0.05, 0.04, noseM), 0, -0.02, 0.26));
    for (const e of [-1, 1]) {
      head.add(at(box(0.05, 0.06, 0.02, eyeM), e * 0.1, 0.05, 0.2)); head.add(at(box(0.02, 0.02, 0.01, glintM), e * 0.1 + 0.012, 0.07, 0.212));
      head.add(kind === 0 ? rot(at(cone(0.07, 0.18, 4, fur), e * 0.13, 0.22, 0), 0, 0, -e * 0.3) : kind === 1 ? at(box(0.07, 0.26, 0.05, fur), e * 0.09, 0.28, 0) : rot(at(box(0.06, 0.22, 0.14, fur), e * 0.23, 0.0, 0), 0, 0, e * 0.35));
    }
    return { g, body, arms, head, i };
  }
  function posePet(p, mode, b) {   // watch | dance | cheer, pure in the beat
    p.body.position.set(0, 0, 0); p.body.rotation.set(0, 0, 0); p.head.rotation.set(0, 0, 0); p.arms.forEach(a => a.rotation.set(0, 0, 0));
    const bb = b + p.i * 0.13;
    if (mode === 'dance') {
      p.body.position.y = 0.07 * Math.abs(Math.sin(bb * PI)); p.body.rotation.z = 0.16 * Math.sin(bb * PI);
      p.arms.forEach((a, s) => { a.rotation.z = (s ? 1 : -1) * (2.55 + 0.3 * Math.sin(fr(bb) * TAU)); });
    } else if (mode === 'cheer') { p.arms.forEach((a, s) => { a.rotation.z = (s ? 1 : -1) * 2.7; }); p.body.position.y = 0.04 * Math.abs(Math.sin(bb * PI)); }
    else p.head.rotation.y = 0.15 * Math.sin(bb * 0.5 * PI);
  }

  // ===================================================================================================================
  function estate() {
    const G = new THREE.Group(), { FACE_Z, FLOOR_H, FLOORS, BALC_X, BALC_D, KOB, KOB_Y, SHEET, DOOR, PALM, STAR, LAMPS, BENCH, TROLLEY_PARK } = ESTATE;
    const W = 36, H = FLOOR_H * FLOORS;
    // ---------------- the car park: asphalt, painted bays, the pavement along the block, grass strips ----------------
    const asT = tex(32, 32, (x, r) => { px(x, '#5a5c62', 0, 0, 32, 32); noise(x, r, 32, 32, ['#52545a', '#62646a', '#4c4e54'], 240); }, 1901);
    G.add(flat(90, 60, mat({ map: asT, rep: [45, 30] }), 0, 0, 2));
    const lineM = M(0xe8e8e0, { unlit: 0.3 }), lines = [];
    for (const zz of [3.2, 8.6]) for (let x = -16; x <= 16; x += 2.6) if (Math.abs(x) > 3.8) lines.push(at(new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.01, 2.4)), x, 0.006, zz));
    G.add(merged(lines, lineM));
    const pave = tex(16, 16, (x, r) => { px(x, '#9a988e', 0, 0, 16, 16); px(x, '#86847a', 0, 0, 16, 1); px(x, '#86847a', 0, 0, 1, 16); noise(x, r, 16, 16, ['#94928a', '#a4a298'], 30); }, 1902);
    G.add(flat(W + 10, 3.2, mat({ map: pave, rep: [(W + 10) / 1.2, 3.2 / 1.2] }), 0, 0.012, FACE_Z + 1.6));
    const grassM = M(0x5a7a3e);
    G.add(flat(14, 3, grassM, -20, 0.01, -8)); G.add(flat(14, 3, grassM, 20, 0.01, -8));
    // the chalk star on the tarmac with SAXO in it: the Walk of Fame, drawn by hand
    const starT = tex(64, 64, x => {
      px(x, '#5a5c62', 0, 0, 64, 64); x.strokeStyle = '#ff7ab8'; x.lineWidth = 3; x.beginPath();
      for (let i = 0; i <= 10; i++) { const a = -PI / 2 + i * PI / 5, r = i % 2 ? 13 : 30; x.lineTo(32 + Math.cos(a) * r + (i % 3 - 1), 33 + Math.sin(a) * r); }
      x.stroke(); x.fillStyle = '#fff4a8'; x.font = 'bold 11px monospace'; x.textAlign = 'center'; x.fillText('SAXO', 32, 37);
    }, 1903);
    G.add(flat(1.7, 1.7, mat({ map: starT, unlit: 0.4 }), STAR[0], 0.014, STAR[1]));
    // ---------------- the block: pastel panels, a window per unit, darker joints; lit windows at night ----------------
    const PASTEL = ['#d8cfa8', '#c8d0c4', '#d8b8a0', '#b8c4d0'];
    const faceTex = (night, seed) => tex(160, 112, (x, r) => {
      for (let fy = 0; fy < 7; fy++) for (let fx = 0; fx < 10; fx++) {
        const X0 = fx * 16, Y0 = fy * 16, col = PASTEL[pmod(Math.floor(fx / 2) + (fy > 4 ? 1 : 0), PASTEL.length)];
        px(x, col, X0, Y0, 16, 16); px(x, 'rgba(0,0,0,.18)', X0, Y0 + 15, 16, 1); px(x, 'rgba(0,0,0,.12)', X0 + 15, Y0, 1, 16);
        const lit = night && r() < 0.62, warm = r() < 0.7 ? '#ffd690' : '#ffe8b0';
        px(x, lit ? warm : '#2a3038', X0 + 4, Y0 + 4, 8, 8); px(x, '#e8e4dc', X0 + 3, Y0 + 12, 10, 1); px(x, lit ? '#e8b060' : '#3a4048', X0 + 8, Y0 + 4, 1, 8);
      }
      noise(x, r, 160, 112, ['rgba(0,0,0,.06)', 'rgba(255,255,255,.05)'], 900);
      if (night) selfLit(x, 160, 112);
    }, seed);
    const dayFace = faceTex(false, 1904), nightFace = faceTex(true, 1905);
    const faceM = mat({ map: dayFace, unlit: 0.12 });
    G.add(at(new THREE.Mesh(new THREE.PlaneGeometry(W, H - FLOOR_H), faceM), 0, FLOOR_H + (H - FLOOR_H) / 2, FACE_Z));
    const sideM = M(0xb8b4a8);
    G.add(at(box(0.4, H, 12, sideM), -W / 2, H / 2, FACE_Z - 6)); G.add(at(box(0.4, H, 12, sideM), W / 2, H / 2, FACE_Z - 6));
    G.add(at(box(W + 0.8, 0.5, 12.4, M(0x8a8680)), 0, H + 0.25, FACE_Z - 6));
    // the ground floor: grey plinth, the stairwell door with its canopy, the corner shop's window and sign
    G.add(at(box(W, FLOOR_H, 0.2, M(0x9a968c)), 0, FLOOR_H / 2, FACE_Z - 0.1));
    const [dx, dz] = DOOR, doorGlass = M(0x9ac8e0, { unlit: 0.3 });
    G.add(at(box(1.6, 2.2, 0.06, M(0x6a4a3a)), dx, 1.1, dz + 0.04)); G.add(at(box(0.66, 1.6, 0.02, doorGlass), dx - 0.36, 1.2, dz + 0.08)); G.add(at(box(0.66, 1.6, 0.02, doorGlass), dx + 0.36, 1.2, dz + 0.08));
    G.add(at(box(2.6, 0.12, 1.4, M(0x7a7872)), dx, 2.45, dz + 0.7));
    const doorLamp = at(box(0.3, 0.12, 0.2, glow(0xfff0c0)), dx, 2.3, dz + 0.2); G.add(doorLamp);
    G.add(at(box(0.8, 0.4, 0.04, mat({ map: sign('12', '#2a4a8a', '#ffffff', 32, 16), unlit: 0.6 })), dx + 1.3, 2.1, dz + 0.06));
    const shopX = 8.5;
    G.add(at(box(5.4, 1.7, 0.05, M(0xbcd8e0, { unlit: 0.35 })), shopX, 1.15, FACE_Z + 0.03));
    G.add(at(box(5.0, 0.55, 0.12, mat({ map: sign('POTRAVINY', '#2a7a4a', '#ffffff', 96, 16), unlit: 0.8 })), shopX, 2.35, FACE_Z + 0.08));
    for (let i = 0; i < 4; i++) G.add(at(box(0.5, 0.6 + hash(i, 1906) * 0.4, 0.3, M([0xe84a4a, 0xf2c94c, 0x4a8fe8, 0x6bd46b][i])), shopX - 1.8 + i * 1.2, 0.5, FACE_Z + 0.25));
    // ---------------- the balconies: slab, a low solid front (coloured), side panels, a thin rail ----------------
    const slabs = [], fronts = [[], [], [], []], rails = [];
    for (let f = 1; f < FLOORS; f++) BALC_X.forEach((bx, j) => {
      const y = f * FLOOR_H, q = pmod(j + f, 4);
      slabs.push(at(new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.16, BALC_D)), bx, y - 0.08, FACE_Z + BALC_D / 2));
      fronts[q].push(at(new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.52, 0.08)), bx, y + 0.26, FACE_Z + BALC_D - 0.04));
      for (const s of [-1, 1]) fronts[q].push(at(new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.52, BALC_D)), bx + s * 1.56, y + 0.26, FACE_Z + BALC_D / 2));
      rails.push(at(new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.05, 0.05)), bx, y + 0.6, FACE_Z + BALC_D - 0.04));
      for (const s of [-1, 1]) rails.push(at(new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.1, 0.04)), bx + s * 1.5, y + 0.56, FACE_Z + BALC_D - 0.04));
    });
    G.add(merged(slabs, M(0xc8c4bc, { unlit: 0.2 })));
    const FRONT_COLS = [0xd8a06a, 0x8ab0c8, 0xc8c07a, 0xc88a8a];
    fronts.forEach((ps, i) => ps.length && G.add(merged(ps, M(FRONT_COLS[i], { unlit: 0.18 }))));
    G.add(merged(rails, M(0x6a6a70)));
    // Kob's washing line on her balcony: socks, a towel... and a gap where her bedsheet was; her balcony door
    const [kx, kz] = KOB;
    G.add(at(box(0.9, 2.1, 0.05, M(0x9a7a5a, { unlit: 0.2 })), kx + 0.4, KOB_Y + 1.05, FACE_Z + 0.03)); G.add(at(box(0.6, 0.9, 0.02, M(0xbcd8e0, { unlit: 0.4 })), kx + 0.4, KOB_Y + 1.45, FACE_Z + 0.06));
    // ---------------- the HOLLYWOOD bedsheet: painted sky, hills, the letters, pegged to a line between two balconies ----------------
    const sheetT = tex(128, 74, (x, r) => {   // two bedsheets' worth, painted
      const g = x.createLinearGradient(0, 0, 0, 74); g.addColorStop(0, '#7ab8f0'); g.addColorStop(0.5, '#f6b8c8'); g.addColorStop(1, '#f8d8a0'); x.fillStyle = g; x.fillRect(0, 0, 128, 74);
      x.fillStyle = '#ffe070'; x.beginPath(); x.arc(102, 16, 8, 0, TAU); x.fill();
      x.fillStyle = '#a8784a'; x.beginPath(); x.moveTo(0, 74); for (let i = 0; i <= 16; i++) x.lineTo(i * 8, 40 - Math.sin(i * 0.8) * 8 - (i > 5 && i < 12 ? 7 : 0) + (r() - 0.5) * 2); x.lineTo(128, 74); x.fill();
      x.fillStyle = '#8a6038'; x.beginPath(); x.moveTo(0, 74); for (let i = 0; i <= 16; i++) x.lineTo(i * 8, 56 - Math.sin(i * 1.3 + 1) * 5); x.lineTo(128, 74); x.fill();
      x.fillStyle = '#ffffff'; x.font = 'bold 17px monospace'; x.textAlign = 'center';
      'HOLLYWOOD'.split('').forEach((ch, i) => { x.save(); x.translate(16 + i * 12, 43 + (i % 2) - Math.sin(i * 0.8) * 3); x.rotate((r() - 0.5) * 0.18); x.fillText(ch, 0, 0); x.restore(); });
      x.fillStyle = 'rgba(255,255,255,.7)'; for (let i = 0; i < 6; i++) x.fillRect(16 + i * 19 + r() * 4, 44 + r() * 3, 1, 2 + r() * 4);   // drips
      px(x, 'rgba(255,255,255,.55)', 0, 0, 128, 1); px(x, 'rgba(255,255,255,.55)', 0, 73, 128, 1); px(x, 'rgba(255,255,255,.4)', 63, 0, 1, 74);   // the seam between the two sheets
    }, 1907);
    const sheetM = mat({ map: sheetT, unlit: 0.4, side: THREE.DoubleSide });
    const sheetH = SHEET.top - SHEET.bottom;
    const sheetG = new THREE.Group(); G.add(sheetG);
    const sheetGeo = new THREE.PlaneGeometry(SHEET.w, sheetH, 8, 3);
    { const pos = sheetGeo.attributes.position; for (let i = 0; i < pos.count; i++) pos.setZ(i, 0.06 * Math.sin(pos.getX(i) * 2.1) * (0.5 - pos.getY(i) / sheetH)); }
    const sheet = new THREE.Mesh(sheetGeo, sheetM); sheet.position.y = -sheetH / 2; sheetG.add(sheet);
    const pegs = []; for (let i = 0; i < 7; i++) pegs.push(at(new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.12, 0.05)), -SHEET.w / 2 + 0.2 + i * (SHEET.w - 0.4) / 6, -0.02, 0.03));
    sheetG.add(merged(pegs, M(0xe84a6a)));
    G.add(at(box(SHEET.x1 - SHEET.x0, 0.015, 0.015, M(0xe8e8e8)), (SHEET.x0 + SHEET.x1) / 2, SHEET.top + 0.02, SHEET.z));
    const onLine = new THREE.Group(); onLine.position.set(kx - 0.75, KOB_Y + 0.62, FACE_Z + BALC_D - 0.04); G.add(onLine);   // once taken in: folded double over her railing beside her, airing
    { const foldM = mat({ map: sheetT, rep: [0.3, 0.45], unlit: 0.4, side: THREE.DoubleSide }); foldM.uniforms.uOff.value.set(0.62, 0.3);
      onLine.add(at(box(1.2, 0.05, 0.3, foldM), 0, 0.0, 0)); const hang = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 0.4), foldM); hang.position.set(0, -0.2, 0.16); onLine.add(hang);
      const back = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 0.3), foldM); back.position.set(0, -0.15, -0.16); onLine.add(back); } onLine.visible = false;
    const sheetLight = at(box(0.3, 0.2, 0.3, glow(0xfff4d0)), -3.9, 0.15, -10.9); G.add(sheetLight);   // a floodlight on the tarmac by the sheet's corner (night)
    // ---------------- the potted palm, the bench, the lamps, the parked cars, the trolley ----------------
    const [plx, plz] = PALM;
    G.add(at(cyl(0.3, 0.22, 0.5, 8, M(0xc8643a)), plx, 0.25, plz));
    const trunkM = M(0x8a5a2e), leafM = M(0x3f8a3a, { side: THREE.DoubleSide }), palmTop = new THREE.Group();
    for (let i = 0; i < 4; i++) G.add(at(cyl(0.06, 0.08, 0.4, 5, trunkM), plx, 0.7 + i * 0.38, plz));
    for (let i = 0; i < 7; i++) { const lf = new THREE.Group(); lf.rotation.y = i / 7 * TAU; const bl = box(0.9, 0.02, 0.26, leafM); bl.position.x = 0.42; bl.rotation.z = -0.55 - 0.15 * hash(i, 1908); lf.add(bl); palmTop.add(lf); }
    palmTop.position.set(plx, 2.2, plz); G.add(palmTop);
    const [bnx, bnz] = BENCH, woodM = M(0x8a5a3a);
    G.add(at(box(1.8, 0.06, 0.45, woodM), bnx, 0.44, bnz)); G.add(at(box(1.8, 0.4, 0.06, woodM), bnx, 0.7, bnz - 0.2));
    for (const s of [-0.8, 0.8]) G.add(at(box(0.06, 0.44, 0.4, M(0x3a3a40)), bnx + s, 0.22, bnz));
    const lampHeads = [];
    for (const [lx, lz] of LAMPS) { G.add(at(cyl(0.06, 0.08, 4.6, 6, M(0x5a5a62)), lx, 2.3, lz)); const h = at(box(0.5, 0.14, 0.26, glow(0xfff0c8)), lx + (lx > 0 ? -0.2 : 0.2), 4.6, lz); G.add(h); lampHeads.push(h); }
    const CAR_COLS = [0xd8d0b8, 0x8a2a2a, 0x3a5a8a, 0xe8e0c8, 0x5a7a4a, 0xc8a040];
    const car = (x, z, yaw, c) => {
      const g = new THREE.Group(), body = M(CAR_COLS[c % CAR_COLS.length]), glass = M(0x2a3a48, { unlit: 0.2 }), tyre = M(0x1a1a1e);
      g.add(at(box(1.6, 0.6, 3.6, body), 0, 0.55, 0)); g.add(at(box(1.45, 0.5, 1.9, body), 0, 1.08, -0.2)); g.add(at(box(1.47, 0.36, 1.7, glass), 0, 1.08, -0.2));
      for (const [ox, oz] of [[-0.78, 1.2], [0.78, 1.2], [-0.78, -1.2], [0.78, -1.2]]) g.add(rot(at(cyl(0.28, 0.28, 0.18, 8, tyre), ox, 0.28, oz), 0, 0, PI / 2));
      for (const s of [-0.5, 0.5]) g.add(at(box(0.3, 0.14, 0.04, glow(0xfff4d0)), s, 0.62, 1.81));
      g.position.set(x, 0, z); g.rotation.y = yaw; G.add(g);
    };
    [[-11, -6, PI / 2], [-11, -2.6, PI / 2], [-11, 0.8, PI / 2], [-11, 4.2, PI / 2], [11, -6, -PI / 2], [11, -2.6, -PI / 2], [11, 4.2, -PI / 2], [-7.8, 11, PI], [7.8, 11, PI], [13.8, 0.8, -PI / 2]].forEach(([x, z, y], i) => car(x, z, y, i));
    const trolleyP = trolleyModel(K); trolleyP.position.set(TROLLEY_PARK[0], 0, TROLLEY_PARK[1]); trolleyP.rotation.y = TROLLEY_PARK[2] * PI / 180; G.add(trolleyP);
    // the blocks across the car park behind the lens (reverse angles) and beside this one
    const farM = mat({ map: dayFace, unlit: 0.15 });
    const far = at(new THREE.Mesh(new THREE.PlaneGeometry(40, 16), farM), 0, 8, 25.8); far.rotation.y = PI; G.add(far);
    G.add(at(box(40, 16, 0.3, M(0x9a968c)), 0, 8, 26.1));
    for (const s of [-1, 1]) { const f2 = at(new THREE.Mesh(new THREE.PlaneGeometry(26, 20), farM), s * 33, 10, -18); f2.rotation.y = -s * 0.35; G.add(f2); }
    // ---------------- the neighbours on the balconies ----------------
    const SPOTS = [];
    for (let f = 1; f <= 4; f++) BALC_X.forEach((bx, j) => { if (f === 2 && j === 2) return; if (hash(f, j, 1911) < 0.72) SPOTS.push([bx + (hash(f, j, 1912) - 0.5) * 1.6, f * FLOOR_H + 0.25, FACE_Z + 0.9, f * 10 + j]); });   // up on a step at the front, like Kob
    const neighbours = SPOTS.map(([x, y, z, i]) => { const p = pet(i); p.g.position.set(x, y, z); G.add(p.g); return { p, x, y, z }; });
    // ---------------- sky domes, rain, puddles ----------------
    const dome = stops => { const d = new THREE.Mesh(new THREE.SphereGeometry(150, 16, 12), mat({ map: grad(stops), unlit: 1, nofog: 1, side: THREE.BackSide })); d.visible = false; G.add(d); return d; };
    const dusk = dome([[0, '#3a2a5a'], [0.45, '#c86a7a'], [0.8, '#f0a878'], [1, '#f6c890']]), night = dome([[0, '#05060f'], [0.6, '#141a36'], [1, '#2a2a48']]);
    const RG = new THREE.Group(); RG.position.set(0, 0, -3); G.add(RG);
    const rain = fall(RG, 700, mat({ color: 0xdce8f8, unlit: 0.9 }), new THREE.BoxGeometry(0.025, 0.5, 0.025), { w: 16, top: 9, speed: 11, drift: 0, seed: 1913 });
    const puddles = []; for (let i = 0; i < 8; i++) { const p = new THREE.Mesh(new THREE.CircleGeometry(0.5 + hash(i, 1914) * 0.6, 10), M(0x8a98a8, { unlit: 0.3 })); p.rotation.x = -PI / 2; p.position.set((hash(i, 1915) - 0.5) * 14, 0.008, -9 + hash(i, 1916) * 16); p.scale.y = 0.6; p.visible = false; G.add(p); puddles.push(p); }

    return {
      group: G, sky: grad([[0, '#8a9098'], [0.6, '#b0b4b8'], [1, '#c8c8c4']]), shadowCol: 0x3c3e44,
      light() { lights(0x8a8e98, 0xd8d8d0, [0.3, -1, 0.5], 0xb0b4b8, [30, 110], 8); },
      anim(t, P = {}) {
        const b = beat(t), c = shotT(t, P), zone = P.zone || 'day';
        dusk.visible = zone === 'dusk'; night.visible = zone === 'night';
        faceM.uniforms.map.value = zone === 'night' ? nightFace : dayFace; farM.uniforms.map.value = zone === 'night' ? nightFace : dayFace;
        faceM.uniforms.uUnlit.value = zone === 'night' ? 0.5 : zone === 'dusk' ? 0.25 : 0.12;
        lampHeads.forEach(h => { h.visible = zone !== 'day'; }); sheetLight.visible = zone === 'night'; doorLamp.visible = zone !== 'day';
        palmTop.rotation.y = 0.05 * Math.sin(t * 0.9);
        if (zone === 'dusk') {
          lights(0x7a6a80, 0xf0b890, [-0.5, -0.6, -0.6], 0xc88a88, [28, 110], 9);
          pt(0, DOOR[0], 2.3, DOOR[1] + 1.2, 0.6, 0.5, 0.35); pt(1, 8.5, 1.4, FACE_Z + 1.2, 0.35, 0.55, 0.4);
        } else if (zone === 'night') {
          lights(0x3a3c58, 0x6a78a8, [0.3, -1, 0.4], 0x0e1020, [18, 80], 9);
          pt(0, 0, 1.6, -9.0, 1.1, 0.95, 0.75);   // the floodlight on the sheet
          pt(1, LAMPS[0][0] + 0.2, 4.2, LAMPS[0][1], 0.9, 0.7, 0.45); pt(2, LAMPS[1][0] - 0.2, 4.2, LAMPS[1][1], 0.9, 0.7, 0.45);
          pt(3, 0, 3.0, 3.0, 0.45, 0.4, 0.55);
        }
        // the sheet: hung, yanked up over Kob's railing, or taken in
        const pull = P.sheetPull != null ? sm((c - P.sheetPull) / 0.7) : 0, gone = P.sheet === 0 || pull >= 1;
        sheetG.visible = !gone; onLine.visible = gone && !P.noLine;
        if (!gone) {
          sheetG.position.set(SHEET.x + (KOB[0] - 0.6 - SHEET.x) * pull, SHEET.top + 1.2 * Math.sin(pull * PI / 2), SHEET.z + 0.3 * pull);   // yanked up and in over her railing
          sheetG.scale.set(1 - 0.85 * pull, Math.max(0.05, 1 - 0.95 * pull), 1); sheetG.rotation.set(-0.7 * pull, 0, 0.25 * pull);
          sheet.rotation.x = 0.04 * Math.sin(t * 1.3);
        }
        trolleyP.visible = P.trolley !== false;
        const raining = P.rain === true || (typeof P.rain === 'number' && c >= P.rain);
        RG.visible = raining; if (raining) rain(t);
        puddles.forEach(p => { p.visible = !!P.rain || !!P.wet; });
        neighbours.forEach(({ p, x, y, z }) => {
          p.g.visible = !P.noguests && !!P.balc;
          if (!p.g.visible) return;
          p.g.position.set(x, y, z); p.g.rotation.set(0, P.stare ? Math.atan2(P.stare[0] - x, P.stare[2] - z) : 0, 0);
          posePet(p, P.balc === true ? 'watch' : P.balc, b);
        });
      },
    };
  }

  // ===================================================================================================================
  function panel() {
    const G = new THREE.Group(), { W, D0, D1, H, BED, BED_Y, SHELF, POSTER, CHAIR, CHAIR_Y, TV, FRAME, WIN_S, WIN_K } = PANEL;
    const D = D1 - D0, CZ = (D0 + D1) / 2;
    const pinkT = tex(16, 16, (x, r) => { px(x, '#f2b8cc', 0, 0, 16, 16); px(x, '#fff0a8', 3, 3, 2, 2); px(x, '#fff0a8', 11, 10, 2, 2); px(x, '#e8a0b8', 0, 15, 16, 1); noise(x, r, 16, 16, ['#eeb2c6', '#f6c0d2'], 20); }, 1920);
    const floralT = tex(16, 16, (x, r) => { px(x, '#c89a5a', 0, 0, 16, 16); px(x, '#a86a3a', 4, 4, 3, 3); px(x, '#e8c88a', 5, 5, 1, 1); px(x, '#8a5a2a', 12, 11, 3, 3); px(x, '#a8783a', 0, 8, 16, 1); noise(x, r, 16, 16, ['#c0925a', '#d0a262'], 20); }, 1921);
    const floorT = tex(16, 16, (x, r) => { px(x, '#b89870', 0, 0, 16, 16); for (let i = 0; i < 16; i += 4) px(x, '#a88860', 0, i, 16, 1); noise(x, r, 16, 16, ['#b49468', '#c0a078'], 30); }, 1922);
    for (const [s, T] of [[-1, pinkT], [1, floralT]]) {
      const R = new THREE.Group(); R.position.x = s * W / 2; G.add(R);
      room(R, W, D, H, T, 1.4, 0xece6dc, { cz: CZ, skip: [s < 0 ? 'right' : 'left'] });
      R.add(flat(W, D, mat({ map: floorT, rep: [W / 1.2, D / 1.2] }), 0, 0, CZ));
    }
    // the shared wall: one thin panel, his wallpaper on his side, hers on hers
    const wall = (T, s) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(D, H), mat({ map: T, rep: [D / 1.4, H / 1.4] })); m.rotation.y = s < 0 ? -PI / 2 : PI / 2; m.position.set(s * 0.02, H / 2, CZ); return m; };
    G.add(wall(pinkT, -1)); G.add(wall(floralT, 1));
    // the windows onto the rainy estate (a picture of the blocks behind a frame, rain streaks on the glass)
    const viewT = tex(48, 32, (x, r) => { px(x, '#9aa0a8', 0, 0, 48, 32); for (let i = 0; i < 4; i++) { px(x, '#b8b2a4', 2 + i * 12, 6 + (i % 2) * 3, 10, 26); for (let yy = 8; yy < 32; yy += 4) for (let xx = 3 + i * 12; xx < 11 + i * 12; xx += 3) px(x, r() < 0.3 ? '#e8d090' : '#4a525a', xx, yy + (i % 2) * 3, 2, 2); } }, 1923);
    const winFrame = M(0xf4f2ee), glassV = mat({ map: viewT, unlit: 0.55 }), dropM = M(0xd8e8f8, { unlit: 0.6 });
    const rainOnGlass = [];
    for (const [wx, wz] of [WIN_S, WIN_K]) {
      G.add(at(box(1.5, 1.1, 0.02, glassV), wx, 1.55, wz + 0.02));
      for (const [ox, oy, w, h] of [[0, 0.58, 1.6, 0.08], [0, -0.58, 1.6, 0.08], [-0.78, 0, 0.08, 1.2], [0.78, 0, 0.08, 1.2], [0, 0, 0.05, 1.2]]) G.add(at(box(w, h, 0.06, winFrame), wx + ox, 1.55 + oy, wz + 0.04));
      G.add(at(box(1.7, 0.06, 0.22, winFrame), wx, 0.98, wz + 0.1));
      for (let i = 0; i < 14; i++) { const d = at(box(0.03, 0.16, 0.01, dropM), wx - 0.7 + hash(i, 1924, wx) * 1.4, 1.55, wz + 0.035); G.add(d); rainOnGlass.push([d, i, wx]); }
    }
    // his bed: frame, mattress, pink quilt, pillow, headboard; a rug; the trophy shelf; posters
    const [bx, bz] = BED;
    G.add(at(box(1.05, BED_Y - 0.12, 2.05, M(0xf4f0ea)), bx, (BED_Y - 0.12) / 2, bz)); G.add(at(box(1.0, 0.12, 2.0, M(0xff8ab8)), bx, BED_Y - 0.06, bz));
    G.add(at(box(0.7, 0.14, 0.4, M(0xfff4f8)), bx, BED_Y + 0.07, bz - 0.75)); G.add(at(box(1.1, 0.7, 0.08, M(0xf4f0ea)), bx, 0.55, bz - 1.04));
    G.add(flat(1.6, 1.1, M(0xff6aa8), -1.5, 0.006, 0.6));
    const [sx, sz] = SHELF, shelfM = M(0xf4f0ea), goldM = mat({ color: 0xf2c94c, unlit: 0.35 }), silverM = mat({ color: 0xd8dce4, unlit: 0.3 }), baseM = M(0x3a2a20);
    const trophies = new THREE.Group(); trophies.position.set(sx, 0, sz + 0.12); G.add(trophies);
    for (let r = 0; r < 3; r++) {
      G.add(at(box(1.5, 0.04, 0.26, shelfM), sx, 1.1 + r * 0.42, sz + 0.13));
      for (let i = 0; i < 4; i++) {
        const cup = new THREE.Group(), m = (i + r) % 3 ? goldM : silverM, s = 0.8 + hash(i, r, 1925) * 0.5;
        cup.add(at(box(0.1, 0.04, 0.1, baseM), 0, 0.02, 0)); cup.add(at(cyl(0.015, 0.02, 0.1, 5, m), 0, 0.09, 0)); cup.add(at(cyl(0.07, 0.03, 0.1, 7, m), 0, 0.19, 0));
        cup.scale.setScalar(s); cup.position.set(-0.55 + i * 0.37, 1.12 + r * 0.42, 0); trophies.add(cup);
      }
    }
    const poster = (w, h, x, y, z, seed, draw) => { const m = at(box(w, h, 0.01, mat({ map: tex(48, 64, draw, seed), unlit: 0.4 })), x, y, z); G.add(m); return m; };
    poster(0.7, 0.95, -3.2, 1.75, D0 + 0.02, 1926, c => { const g = c.createLinearGradient(0, 0, 0, 64); g.addColorStop(0, '#ff8a6a'); g.addColorStop(1, '#ffd08a'); c.fillStyle = g; c.fillRect(0, 0, 48, 64); c.fillStyle = '#ffe860'; c.beginPath(); c.arc(24, 30, 9, 0, TAU); c.fill(); c.fillStyle = '#3a2a3a'; c.fillRect(10, 18, 2, 30); c.fillRect(36, 22, 2, 26); c.fillRect(4, 18, 14, 2); c.fillRect(30, 22, 14, 2); c.fillRect(0, 48, 48, 16); c.fillStyle = '#ffffff'; c.font = 'bold 6px monospace'; c.textAlign = 'center'; c.fillText('LOS ANGELES', 24, 58); });
    poster(0.5, 0.7, -0.55, 1.9, D0 + 0.02, 1927, c => { px(c, '#3a2a6a', 0, 0, 48, 64); c.fillStyle = '#ffd43b'; c.beginPath(); for (let i = 0; i <= 10; i++) { const a = -PI / 2 + i * PI / 5, r = i % 2 ? 8 : 18; c.lineTo(24 + Math.cos(a) * r, 28 + Math.sin(a) * r); } c.fill(); c.font = 'bold 8px monospace'; c.textAlign = 'center'; c.fillText('POP STAR', 24, 58); });
    // the HOLLYWOOD poster on the shared wall (it falls off on `posterFall`)
    const [pX, pY, pZ] = POSTER;
    const bigPoster = new THREE.Group(); bigPoster.position.set(pX, pY, pZ); G.add(bigPoster);
    bigPoster.add(new THREE.Mesh(new THREE.BoxGeometry(0.01, 1.05, 1.7), mat({ map: tex(64, 40, c => { const g = c.createLinearGradient(0, 0, 0, 40); g.addColorStop(0, '#6ab0f0'); g.addColorStop(0.6, '#f8b8c8'); g.addColorStop(1, '#a8784a'); c.fillStyle = g; c.fillRect(0, 0, 64, 40); c.fillStyle = '#8a6038'; c.fillRect(0, 30, 64, 10); c.fillStyle = '#ffffff'; c.font = 'bold 8px monospace'; c.textAlign = 'center'; c.fillText('HOLLYWOOD', 32, 28); }, 1928), unlit: 0.45 })));
    // her flat (x > 0): the armchair, the TV (flickering), a side table with her milk, a lamp, the framed photo on the wall
    const [cx, cz] = CHAIR, chairM = M(0x7a8a4a);
    G.add(at(box(0.95, CHAIR_Y, 0.85, chairM), cx, CHAIR_Y / 2, cz)); G.add(at(box(0.95, 0.75, 0.2, chairM), cx, 0.45, cz - 0.4));
    for (const s of [-1, 1]) G.add(at(box(0.16, 0.42, 0.85, chairM), cx + s * 0.47, 0.21, cz));
    const [tvx, tvz] = TV, tvScreenM = glow(0x8ac8e8);
    G.add(at(box(0.9, 0.5, 0.5, M(0x6a4a30)), tvx, 0.25, tvz)); G.add(rot(at(box(0.7, 0.55, 0.5, M(0x2a2a2e)), tvx, 0.78, tvz), 0, -0.9, 0));
    G.add(rot(at(box(0.56, 0.42, 0.02, tvScreenM), tvx - 0.2, 0.78, tvz + 0.15), 0, -0.9, 0));
    G.add(at(box(0.4, 0.5, 0.4, M(0x8a5a3a)), cx + 0.8, 0.25, cz + 0.1)); G.add(at(box(0.1, 0.2, 0.1, M(0xf8f8ff)), cx + 0.8, 0.6, cz + 0.1));
    G.add(at(cyl(0.02, 0.02, 1.3, 5, M(0x3a3a40)), 3.8, 0.65, -2.1)); const shadeK = at(cone(0.22, 0.26, 8, mat({ color: 0xf2d28a, unlit: 0.7 })), 3.8, 1.4, -2.1); G.add(shadeK);
    const [fX, fY, fZ] = FRAME, frame = new THREE.Group(); frame.position.set(fX, fY, fZ); frame.rotation.y = -PI / 2; G.add(frame);   // on her back wall, behind her chair: it hops in every deadpan
    frame.add(at(box(0.04, 0.6, 0.5, M(0xc8a040)), 0.01, 0, 0)); frame.add(at(box(0.01, 0.48, 0.38, mat({ map: tex(16, 20, c => { px(c, '#9ab8c8', 0, 0, 16, 20); px(c, '#6a6a70', 5, 6, 6, 8); px(c, '#6a6a70', 6, 3, 4, 4); px(c, '#6a8a4a', 0, 16, 16, 4); }, 1929), unlit: 0.3 })), 0.03, 0, 0));
    return {
      group: G, sky: null, shadowCol: 0x6a5a58, indoor: true,
      light() {
        lights(0x8a8088, 0xb8c0d0, [0.2, -1, 0.6], 0x4a4450, [9, 30], 5);
        pt(0, -2.4, 2.2, -0.2, 0.75, 0.5, 0.6); pt(1, 3.8, 1.6, -1.8, 0.8, 0.62, 0.35); pt(2, -2.4, 1.6, D0 + 0.6, 0.35, 0.4, 0.5); pt(3, 2.9, 1.6, D0 + 0.6, 0.3, 0.34, 0.44);
      },
      anim(t, P = {}) {
        const b = beat(t), c = shotT(t, P), hit = Math.exp(-fr(b) * 7);
        const bangs = (P.bang || []).map(s => c - s).filter(a => a >= 0 && a < 0.35), bang = bangs.length ? Math.exp(-bangs[0] * 10) : 0;
        const jolt = (P.thump ? hit : 0) * 0.03 + bang * 0.07;
        frame.position.set(fX, fY + jolt * 1.6, fZ); frame.rotation.x = (P.thump ? 0.1 * Math.sin(b * PI) : 0) + bang * 0.2;
        trophies.position.y = jolt * 0.6; trophies.rotation.z = bang * 0.03;
        const fallen = P.poster === 0 ? 1 : P.posterFall != null ? sm((c - P.posterFall) / 0.75) : 0;
        bigPoster.position.set(pX - 0.35 * fallen, pY + jolt - (pY - 0.02) * fallen, pZ); bigPoster.rotation.set(0, 0, (P.thump && !fallen ? 0.03 * Math.sin(b * PI) : 0) + fallen * (PI / 2 - 0.05));
        tvScreenM.uniforms.uCol.value.setRGB(0.5 + 0.3 * hash(Math.floor(t * 6), 1930), 0.7 + 0.2 * hash(Math.floor(t * 6), 1931), 0.9);
        shadeK.visible = P.lamp !== false;
        rainOnGlass.forEach(([d, i, wx]) => { d.visible = !!P.rain; d.position.y = 2.05 - fr(t * 0.6 + hash(i, 1932, wx)) * 1.0; });
      },
    };
  }
  return { estate: estate(), panel: panel() };
}
