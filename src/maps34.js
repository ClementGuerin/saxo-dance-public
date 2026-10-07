// maps34.js: the "Take on Me" map (2026-10-07 2nd, a-ha, 1985; the clip: a pencil-drawn comic of a motor race, a girl
// reading it in a café, the drawn hero reaching out of the page and pulling her into his world, then breaking out into
// hers, half drawn and half real). Same contract as the other map files, pure in t:
//   comic   one map, two worlds split by the page wall at z = 0 (COMIC.WALL_Z). In front (z > 0) a real 80s diner in
//           colour: a cream-and-teal checker floor, mint walls, red booths under curtained windows along the left wall,
//           the counter along the right (its top COMIC.COUNTER.Y; Kob behind it on her duckboard, COMIC.KOB / DECK),
//           stools, a milk dispenser, menu boards, an ICE COLD MILK neon in the front window (the clip's café),
//           fluorescent tubes; Sadi's little table by the page (COMIC.TABLE, her chair COMIC.SADI facing -z). Its back
//           wall is a giant comic page whose middle panel is a door (COMIC.DOOR): a paper leaf hinged on its right edge
//           that turns into the diner like a page (`page`). Behind the wall (z < 0) the comic's own world, drawn in pencil
//           (the map sets ps1.js's sketch plane, uSk, so everything at z < 0 goes through the 2D layer's sketchFx; a
//           character standing in the doorway is half drawn, half real): a white void with free-standing panel frames
//           by the wall, then a race track along x (COMIC.ROAD) with its start and finish gantry, kerbs, a fence, hay
//           bales, flags, a grandstand of pet spectators, and two vintage racing cars (13 and 7, noses to -x).
// Flags: page (0-1 or [s0, s1, a, b]: the leaf turned open into the diner, 1 = 165 deg, flat against the wall), knock ([s, ...]: the leaf jolts
// as if hit from the drawn side: the wrench), cars ([{ num, x, z, yaw, y, tx, dur }]: where the cars stand, drifting to
// x = tx linearly over dur s; omitted: both on the grid), race ({ speed (m/s: the road, kerbs, fence and gantry stream past along +x), finish (s: the gantry passes
// car 13's nose then), lines (true: speed lines round the cars) }), flag (s: the starter drops the flag), fans
// ('cheer' | 'watch' | 'stare': the grandstand), guests ('eat' | 'stare' | 'cheer': the diner's customers), stare
// ([x, z]: the customers turn there), starter ([x, z]) + starterYaw (deg): where the flag man stands, milk (false: no glass on Sadi's table), hearts ([[x, y, z, s0]]: three hearts pop
// and rise; drawn ones at z < 0), heartYaw, noCeil (the diner's ceiling off: a lens above), noguests, clear ([[x, z,
// r]]: no pet there), key ([x, y, z, r, g, b]). Never name a flag like a shot field (`sketch` is the shot's own: it
// overrides this map's plane).
import { mapKit } from './mapkit.js';

export const COMIC = {
  WALL_Z: 0,                                              // the page wall: z < 0 is drawn
  DOOR: { x0: -0.7, x1: 0.7, H: 2.15 },                   // the page door, hinged at x1, turning into the diner (+z)
  TABLE: [-1.15, 1.5], TABLE_Y: 0.62,                     // Sadi's little round table (its top)
  SADI: [-1.15, 2.12], CHAIR_Y: 0.42,                     // her chair (its seat top), facing -z: the page across the table
  COUNTER: { x0: 3.6, x1: 4.4, z0: 2.2, z1: 8.6, Y: 0.82 },   // the counter: front face x0, back face x1, top Y
  KOB: [4.95, 4.2], DECK: 0.3,                            // Kob behind the counter on her duckboard (stand her at lift DECK)
  ROAD: { z0: -4.5, z1: -8.5 }, LANE13: -5.55, LANE7: -7.35,   // the track along x; the two cars' lanes
  GRID_X: -2.6,                                           // the start and finish line at rest (the gantry's x; at -1 its post stood at the hook's lens)
  CAR: { SEAT_Y: 0.5, SEAT_DX: 0.35 },                   // a racing car's seat top, the seat behind the car's centre (+x)
  FRAMES: [[-3.6, -1.9, 22], [3.4, -2.3, -26], [-6.4, -3.2, 8], [6.8, -1.4, -10]],   // free-standing panel frames by the wall [x, z, yaw]
  STARTER: [-0.4, -9.05],                                 // the starter with the flag, on the far kerb at the line (on the near side he stood in every lens)
};

export function buildComicMaps(K) {
  const k = mapKit(K);
  const { THREE, mat, tex, px, box, U, TAU, PI, beat, cyl, cone, ico, at, rot, flat, lights, pt, hash, fr } = k;
  const M = (c, o = {}) => mat({ color: c, ...o }), glow = (c, u = 1) => mat({ color: c, unlit: u });
  const shotT = (t, P) => P.t0 != null ? t - P.t0 : 0;
  const cl = x => Math.max(0, Math.min(1, x)), sm = x => { x = cl(x); return x * x * (3 - 2 * x); };
  const cleared = (P, x, z) => (P.clear || []).some(([cx, cz, r]) => (x - cx) ** 2 + (z - cz) ** 2 < r * r);
  const pmod = (a, n) => ((a % n) + n) % n;
  const ramp = (v, s) => Array.isArray(v) ? v[2] + (v[3] - v[2]) * sm((s - v[0]) / Math.max(0.01, v[1] - v[0])) : (v || 0);
  const { WALL_Z, DOOR, TABLE, TABLE_Y, SADI, CHAIR_Y, COUNTER, KOB, DECK, ROAD, LANE13, LANE7, GRID_X, CAR, FRAMES, STARTER } = COMIC;

  // pencil strokes for the printed comic art (the mural, the leaf's panel): a few jittered lines
  const strokes = (x, r, pts, col = '#2a3044', w = 1) => { x.strokeStyle = col; x.lineWidth = w; x.beginPath(); pts.forEach(([a, b], i) => (i ? x.lineTo(a + (r() - 0.5) * 0.8, b + (r() - 0.5) * 0.8) : x.moveTo(a, b))); x.stroke(); };
  function drawCar(x, r, cx, cy, s, num) {   // a vintage racer in profile, nose to the left, speed lines behind it
    x.fillStyle = '#f6f4ee'; x.strokeStyle = '#2a3044'; x.lineWidth = 1.2;
    x.beginPath(); x.ellipse(cx, cy, 20 * s, 6 * s, 0, 0, TAU); x.fill(); x.stroke();
    for (const wx of [-12, 11]) { x.beginPath(); x.arc(cx + wx * s, cy + 6 * s, 5 * s, 0, TAU); x.fillStyle = '#3a4058'; x.fill(); x.fillStyle = '#d8dce6'; x.beginPath(); x.arc(cx + wx * s, cy + 6 * s, 2 * s, 0, TAU); x.fill(); }
    x.fillStyle = '#ffffff'; x.beginPath(); x.arc(cx + 2 * s, cy, 3.4 * s, 0, TAU); x.fill(); x.stroke();
    x.fillStyle = '#1c2030'; x.font = `bold ${Math.round(4.2 * s)}px monospace`; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(String(num), cx + 2 * s, cy + 0.3 * s);
    for (let i = 0; i < 6; i++) { const y = cy - 5 * s + i * 2.4 * s; strokes(x, r, [[cx + 24 * s, y], [cx + (34 + 8 * r()) * s, y]], '#5a6480', 1); }
  }
  function drawFace(x, r, cx, cy, s) {   // the racer dog's face in a panel: helmet, goggles, a big grin
    x.fillStyle = '#e8e6e0'; x.strokeStyle = '#2a3044'; x.lineWidth = 1.2;
    x.beginPath(); x.arc(cx, cy, 11 * s, 0, TAU); x.fill(); x.stroke();
    x.fillStyle = '#8a7a6a'; x.beginPath(); x.arc(cx, cy - 2 * s, 11 * s, PI * 1.05, PI * 1.95); x.fill(); x.stroke();
    for (const ex of [-4, 4]) { x.fillStyle = '#ffffff'; x.beginPath(); x.arc(cx + ex * s, cy - 7 * s, 3 * s, 0, TAU); x.fill(); x.stroke(); x.fillStyle = '#1c2030'; x.beginPath(); x.arc(cx + ex * s, cy + 1 * s, 1.6 * s, 0, TAU); x.fill(); }
    x.beginPath(); x.arc(cx, cy + 4 * s, 1.8 * s, 0, TAU); x.fill();
    strokes(x, r, [[cx - 5 * s, cy + 7 * s], [cx, cy + 9 * s], [cx + 5 * s, cy + 7 * s]], '#1c2030', 1.2);
  }
  // the giant comic page on the diner's back wall: panels round the door (transparent where the door is)
  const muralT = tex(320, 216, (x, r) => {
    x.scale(2, 2);   // drawn at 160 x 108, rendered at twice that (at 1x its strokes were 3 cm blocks up close)
    px(x, '#f4f2ea', 0, 0, 160, 108);
    x.strokeStyle = '#1c2030'; x.lineWidth = 2;
    const panel = (a, b, w, h) => { x.strokeRect(a + 0.5, b + 0.5, w, h); };
    panel(3, 3, 48, 30); drawCar(x, r, 27, 18, 0.95, 13);
    panel(55, 3, 50, 30); drawFace(x, r, 80, 18, 1.0);
    panel(109, 3, 48, 30); for (let i = 0; i < 9; i++) strokes(x, r, [[133, 18], [133 + 22 * Math.cos(i / 9 * TAU), 18 + 13 * Math.sin(i / 9 * TAU)]], '#3a4058', 1);
    x.fillStyle = '#1c2030'; for (let i = 0; i < 4; i++) for (let j = 0; j < 3; j++) if ((i + j) % 2) x.fillRect(125 + i * 4, 13 + j * 4, 4, 4);
    panel(3, 37, 50, 68); drawCar(x, r, 28, 60, 1.05, 7); for (let i = 0; i < 5; i++) strokes(x, r, [[8, 82 + i * 4], [48, 82 + i * 4]], '#5a6480', 1);
    panel(107, 37, 50, 68); drawCar(x, r, 128, 62, 0.95, 7); for (let i = 0; i < 6; i++) strokes(x, r, [[112, 84 + i * 3.5], [152, 84 + i * 3.5]], '#5a6480', 1);   // a car, not a face: Kob stands in front of it
    x.clearRect(59, 42, 44, 66);   // the door: 1.4 x 2.15 m of the 5.2 x 3.5 m page (alpha 0: the shader discards it)
    x.strokeRect(58.5, 41.5, 45, 68);
  }, 3401);
  // the leaf's printed panel (its diner face): the car speeding through a panel of speed lines
  const leafT = tex(96, 144, (x, r) => {
    x.scale(2, 2);
    px(x, '#f4f2ea', 0, 0, 48, 72); x.strokeStyle = '#1c2030'; x.lineWidth = 2; x.strokeRect(1, 1, 46, 70);
    for (let i = 0; i < 14; i++) strokes(x, r, [[4, 6 + i * 4.6], [10 + 34 * r(), 6 + i * 4.6]], '#7a84a0', 1);
    drawCar(x, r, 22, 40, 0.85, 13);
  }, 3402);
  const paperT = tex(32, 32, (x, r) => { px(x, '#f2f1ec', 0, 0, 32, 32); for (let i = 0; i < 40; i++) px(x, r() < 0.5 ? '#ebeae4' : '#f7f6f2', Math.floor(r() * 32), Math.floor(r() * 32), 1, 1); }, 3403);
  const paper = mat({ map: paperT, rep: [1, 1], unlit: 0.2 });

  // ---------- box pets: the diner's customers (80s pastels) and the grandstand's fans ----------
  const FURS = [0xd8a868, 0xe8d8c0, 0xb08a60, 0xf2eee6, 0xc8c0d0, 0xe0c8a0, 0xf0dcc0, 0xd0b090];
  const TOPS = [0xff8ab8, 0x6ad0e8, 0xffd36a, 0x9ae07a, 0xc89af0, 0xff9a6a, 0x7ab8ff, 0xf6f6f0];
  function pet(i, seated = false) {
    const g = new THREE.Group(), F = M(FURS[i % FURS.length]), top = M(TOPS[(i * 3) % TOPS.length], { unlit: 0.15 }), body = new THREE.Group(); g.add(body);
    body.add(at(box(0.42, 0.44, 0.3, top), 0, 0.33, 0));
    const legs = [-1, 1].map(s => { const l = at(new THREE.Group(), s * 0.1, 0.1, 0.02); l.add(at(box(0.12, 0.2, 0.13, M(0x4a5a8a)), 0, -0.05, seated ? 0.1 : 0)); l.add(at(box(0.13, 0.08, 0.18, M(0xf2f2f2)), 0, -0.14, seated ? 0.2 : 0.02)); body.add(l); return l; });
    const arms = [-1, 1].map(s => { const a = at(new THREE.Group(), s * 0.24, 0.52, 0); a.add(at(box(0.1, 0.3, 0.1, top), 0, -0.13, 0)); a.add(at(box(0.09, 0.09, 0.09, F), 0, -0.3, 0)); body.add(a); return a; });
    const head = at(new THREE.Group(), 0, 0.8, 0); body.add(head);
    const skull = ico(0.24, 1, F); skull.scale.set(1, 0.9, 0.92); head.add(skull);
    const snout = at(ico(0.1, 1, M(0xf6ece0)), 0, -0.07, 0.19); snout.scale.set(1.1, 0.8, 0.9); head.add(snout);
    head.add(at(ico(0.035, 0, M(0x151515)), 0, -0.03, 0.28));
    for (const e of [-1, 1]) { head.add(at(ico(0.038, 0, M(0x0e0e0e)), e * 0.1, 0.05, 0.19)); head.add(at(ico(0.012, 0, glow(0xffffff)), e * 0.1 + 0.012, 0.065, 0.225)); head.add(rot(at(box(0.07, 0.24, 0.16, F), e * 0.24, 0.02, 0), 0, 0, e * 0.3)); }
    return { g, body, head, arms, legs, i };
  }
  // modes: eat (a paw to the mouth now and then), watch (sway), stare (frozen, turned), cheer (paws up in a V on the beat)
  function animPet(p, mode, bb, yaw) {
    const { body, head, arms, i } = p, ph = i * 0.37, u = fr(bb + ph);
    body.rotation.set(0, yaw, 0); body.position.y = 0; head.rotation.set(0, 0, 0);
    arms.forEach((a, s) => a.rotation.set(0, 0, (s ? -1 : 1) * 0.12));
    if (mode === 'cheer') { const up = 0.8 + 0.2 * Math.sin(u * TAU); arms.forEach((a, s) => a.rotation.set(0, 0, (s ? -1 : 1) * 2.45 * up)); body.position.y = 0.05 * Math.max(0, Math.sin(u * PI)); }
    else if (mode === 'eat') { if (pmod(Math.floor(bb + i), 4) === 0) arms[1].rotation.set(-1.9 * Math.sin(u * PI), 0, -0.25); head.rotation.x = 0.06 * Math.sin(bb * PI + ph); }
    else if (mode === 'watch') { body.rotation.z = 0.05 * Math.sin(bb * PI + ph); }
  }

  // ---------- a vintage racing car (1930s): a cigar body, a cockpit, wire wheels, its number in a roundel, nose to -x ----------
  const numT = n => tex(32, 32, x => { px(x, '#2a3044', 0, 0, 32, 32); x.fillStyle = '#ffffff'; x.beginPath(); x.arc(16, 16, 14, 0, TAU); x.fill(); x.fillStyle = '#1c2030'; x.font = 'bold 17px monospace'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(String(n), 16, 17); }, 3410 + n);
  function racer(num, bodyCol) {
    const g = new THREE.Group(), body = M(bodyCol, { unlit: 0.12 }), dark = M(0x23262e), metal = M(0xc8ccd4, { unlit: 0.25 }), wheels = [];
    g.add(rot(at(cyl(0.4, 0.4, 2.3, 10, body), 0.1, 0.46, 0), 0, 0, PI / 2));
    g.add(rot(at(cone(0.4, 0.75, 10, body), -1.38, 0.46, 0), 0, 0, PI / 2));                  // the nose, to -x
    g.add(rot(at(cone(0.4, 0.9, 10, body), 1.7, 0.46, 0), 0, 0, -PI / 2));                    // the tail
    g.add(rot(at(cyl(0.2, 0.2, 0.06, 10, M(0x9aa0aa)), -1.06, 0.46, 0), 0, 0, PI / 2));       // the grille's ring
    g.add(at(box(0.62, 0.06, 0.62, dark), CAR.SEAT_DX, 0.86, 0));                              // the cockpit's rim (open: the rider shows)
    g.add(rot(at(cyl(0.045, 0.045, 1.4, 6, metal), 0.2, 0.32, -0.42), 0, 0, PI / 2));          // the exhaust along the right side
    for (const s of [-1, 1]) { const rn = at(new THREE.Mesh(new THREE.CircleGeometry(0.24, 12), mat({ map: numT(num), unlit: 0.5 })), 0.75, 0.5, s * 0.405); rn.rotation.y = s > 0 ? 0 : PI; g.add(rn); }
    const board = at(new THREE.Mesh(new THREE.PlaneGeometry(0.42, 0.42), mat({ map: numT(num), unlit: 0.5, side: THREE.DoubleSide })), -0.62, 0.98, 0); board.rotation.y = -PI / 2; g.add(board);   // the number on a board on the hood, read from the front
    g.add(rot(at(new THREE.Mesh(new THREE.TorusGeometry(0.11, 0.02, 4, 12), dark), CAR.SEAT_DX - 0.36, 0.9, 0), 0, PI / 2, 0.45));   // the steering wheel, low (at 0.98 it crossed a driver's mouth)
    for (const [x, z] of [[-0.85, 0.66], [-0.85, -0.66], [0.95, 0.66], [0.95, -0.66]]) {
      const w = new THREE.Group(); w.position.set(x, 0.38, z); g.add(w);
      w.add(new THREE.Mesh(new THREE.TorusGeometry(0.31, 0.07, 5, 14), dark));
      for (let q = 0; q < 6; q++) w.add(rot(box(0.02, 0.58, 0.02, metal), 0, 0, q / 6 * PI));
      w.add(rot(cyl(0.07, 0.07, 0.1, 6, metal), PI / 2, 0, 0));
      wheels.push(w);
    }
    return { g, wheels };
  }

  // =====================================================================================================================
  function comic() {
    const G = new THREE.Group();
    const DW = 6.4, DZ = 9.4, DH = 3.5;
    // ---------- the diner (colour, z > 0) ----------
    const checkT = tex(16, 16, x => { for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) px(x, (i + j) % 2 ? '#8fcfc4' : '#efe6cf', i * 8, j * 8, 8, 8); }, 3420);
    G.add(flat(DW * 2, DZ, mat({ map: checkT, rep: [DW, DZ / 2] }), 0, 0, DZ / 2));
    const mint = M(0xa8dcc8), cream = M(0xf4ecd8), chrome = M(0xd8dce2, { unlit: 0.3 }), red = M(0xd8343e, { unlit: 0.12 });
    // side walls and the front wall: mint below a chrome strip, cream above
    for (const s of [-1, 1]) { G.add(at(box(0.1, 1.2, DZ, mint), s * (DW + 0.05), 0.6, DZ / 2)); G.add(at(box(0.1, DH - 1.2, DZ, cream), s * (DW + 0.05), 1.2 + (DH - 1.2) / 2, DZ / 2)); G.add(at(box(0.04, 0.06, DZ, chrome), s * (DW - 0.01), 1.2, DZ / 2)); }
    G.add(at(box(DW * 2, 1.0, 0.1, mint), 0, 0.5, DZ + 0.05)); G.add(at(box(DW * 2, 0.5, 0.1, cream), 0, DH - 0.25, DZ + 0.05));
    for (const x of [-DW + 0.2, -0.4, 3.0, DW - 0.2]) G.add(at(box(0.3, DH, 0.1, cream), x, DH / 2, DZ + 0.05));   // window piers
    // outside the front windows: a pale street (a facade across the road, the sky), self-lit so the day reads
    const facadeT = tex(64, 32, (x, r) => { px(x, '#cfe6f2', 0, 0, 64, 32); px(x, '#e8d2b8', 0, 12, 64, 20); for (let i = 0; i < 8; i++) px(x, '#7a8ca0', 3 + i * 8, 15, 4, 5); px(x, '#9a9aa2', 0, 29, 64, 3); }, 3421);
    G.add(at(rot(new THREE.Mesh(new THREE.PlaneGeometry(26, 8), mat({ map: facadeT, unlit: 0.85 })), 0, PI, 0), 0, 3.0, DZ + 5));
    for (const s of [-1, 1]) G.add(at(rot(new THREE.Mesh(new THREE.PlaneGeometry(24, 8), mat({ map: facadeT, unlit: 0.85 })), 0, -s * PI / 2, 0), s * (DW + 5), 3.0, DZ / 2));
    // the ICE COLD MILK neon hanging in the front window, its words facing into the diner
    const neonT = tex(64, 32, x => { x.clearRect(0, 0, 64, 32); x.fillStyle = '#1a2230'; x.fillRect(2, 2, 60, 28); x.font = 'bold 9px monospace'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillStyle = '#ff6ab4'; x.fillText('ICE COLD', 32, 11); x.fillStyle = '#7af0ff'; x.font = 'bold 12px monospace'; x.fillText('MILK', 32, 23); }, 3422);
    const neon = at(rot(new THREE.Mesh(new THREE.PlaneGeometry(1.6, 0.8), mat({ map: neonT, unlit: 1 })), 0, PI, 0), -2.2, 2.25, DZ - 0.08); G.add(neon);
    // the ceiling and its fluorescent tubes
    const ceil = at(box(DW * 2, 0.06, DZ, M(0xf6f4ee)), 0, DH + 0.03, DZ / 2); G.add(ceil);
    const tubes = []; for (const z of [2.2, 5.0, 7.8]) for (const x of [-3.2, 0, 3.2]) { const tb = at(box(1.4, 0.06, 0.16, glow(0xf4fbff, 0.95)), x, DH - 0.04, z); G.add(tb); tubes.push(tb); }
    // booths along the left wall: a red bench each side of a table, a window with a white half curtain above
    const wood = M(0xc89060), tableM = M(0xf2f0ea, { unlit: 0.1 });
    for (const z of [2.9, 5.3, 7.7]) {
      G.add(at(box(1.3, 0.06, 0.8, tableM), -5.55, 0.66, z)); G.add(at(box(0.1, 0.62, 0.1, chrome), -5.55, 0.33, z));
      for (const s of [-1, 1]) { G.add(at(box(1.3, 0.38, 0.45, red), -5.55, 0.19, z + s * 0.78)); G.add(at(box(1.3, 0.7, 0.14, red), -5.55, 0.62, z + s * 1.02)); }
      G.add(at(box(0.04, 1.0, 1.6, mat({ color: 0xcfe8f6, unlit: 0.7 })), -DW + 0.01, 1.85, z));                 // the window's daylight
      G.add(at(box(0.05, 0.42, 1.7, M(0xffffff, { unlit: 0.25 })), -DW + 0.04, 1.58, z));                       // its white half curtain
      for (const [dx, c] of [[-0.3, 0xd8343e], [-0.18, 0xf2c83a]]) G.add(at(cyl(0.035, 0.035, 0.18, 6, M(c, { unlit: 0.2 })), -5.55 + dx, 0.78, z - 0.2));   // ketchup and mustard
    }
    // the counter along the right wall, its stools, the milk dispenser, the coffee machine, the pie case, menu boards
    const { x0: cx0, x1: cx1, z0: cz0, z1: cz1, Y: CY } = COUNTER;
    G.add(at(box(cx1 - cx0, CY - 0.06, cz1 - cz0, M(0xff8ab8, { unlit: 0.08 })), (cx0 + cx1) / 2, (CY - 0.06) / 2, (cz0 + cz1) / 2));
    G.add(at(box(cx1 - cx0 + 0.12, 0.06, cz1 - cz0 + 0.1, M(0xf2f0ea, { unlit: 0.12 })), (cx0 + cx1) / 2, CY - 0.03, (cz0 + cz1) / 2));
    G.add(at(box(0.02, 0.05, cz1 - cz0, chrome), cx0 - 0.005, CY - 0.2, (cz0 + cz1) / 2));
    G.add(at(box(1.2, DECK, cz1 - cz0, wood), KOB[0], DECK / 2, (cz0 + cz1) / 2));                                  // Kob's duckboard
    for (let z = cz0 + 0.55; z < cz1; z += 1.1) { G.add(at(cyl(0.05, 0.05, 0.5, 6, chrome), cx0 - 0.5, 0.25, z)); G.add(at(cyl(0.2, 0.2, 0.09, 8, red), cx0 - 0.5, 0.52, z)); }
    const disp = new THREE.Group(); disp.position.set(cx0 + 0.4, CY, 3.0); G.add(disp);
    disp.add(at(box(0.36, 0.5, 0.3, M(0xf6f6f6, { unlit: 0.3 })), 0, 0.25, 0)); disp.add(at(box(0.3, 0.12, 0.02, M(0x3a7ae8, { unlit: 0.5 })), 0, 0.36, -0.16)); disp.add(at(box(0.05, 0.08, 0.05, chrome), 0, 0.05, -0.18));
    const coffee = at(new THREE.Group(), cx0 + 0.4, CY, 6.6); G.add(coffee);
    coffee.add(at(box(0.5, 0.55, 0.36, M(0x2a2c32)), 0, 0.28, 0)); coffee.add(at(cyl(0.09, 0.08, 0.2, 8, M(0x1a1410)), -0.12, 0.1, -0.2)); coffee.add(at(box(0.08, 0.06, 0.02, glow(0xff5a3a)), 0.14, 0.42, -0.19));
    const pieT = tex(16, 16, x => { px(x, '#f2d8a0', 0, 0, 16, 16); px(x, '#c84a5a', 0, 9, 16, 7); }, 3423);
    G.add(at(cyl(0.22, 0.22, 0.1, 10, mat({ map: pieT })), cx0 + 0.4, CY + 0.05, 5.0)); G.add(at(new THREE.Mesh(new THREE.SphereGeometry(0.26, 8, 5, 0, TAU, 0, PI / 2), mat({ color: 0xe8f4ff, see: 0.6, unlit: 0.3 })), cx0 + 0.4, CY + 0.08, 5.0));
    const menuT = tex(64, 24, x => { px(x, '#1c2030', 0, 0, 64, 24); x.fillStyle = '#ffe28a'; x.font = 'bold 7px monospace'; x.textAlign = 'left'; ['BURGER  2.50', 'FRIES   1.20', 'SHAKE   1.80'].forEach((l, i) => x.fillText(l, 4, 7 + i * 7)); }, 3424);
    for (const z of [3.2, 6.2]) G.add(at(rot(new THREE.Mesh(new THREE.PlaneGeometry(1.8, 0.7), mat({ map: menuT, unlit: 0.6 })), 0, -PI / 2, 0), DW - 0.02, 2.45, z));
    // Sadi's little round table by the page and her chair (facing -z, the page across the table)
    G.add(at(cyl(0.38, 0.38, 0.05, 12, tableM), TABLE[0], TABLE_Y - 0.025, TABLE[1])); G.add(at(cyl(0.05, 0.05, TABLE_Y, 6, chrome), TABLE[0], TABLE_Y / 2, TABLE[1])); G.add(at(cyl(0.22, 0.22, 0.03, 8, chrome), TABLE[0], 0.015, TABLE[1]));
    const chair = at(new THREE.Group(), SADI[0], 0, SADI[1]); G.add(chair);
    chair.add(at(box(0.48, 0.06, 0.44, red), 0, CHAIR_Y - 0.03, 0)); chair.add(at(box(0.48, 0.5, 0.06, red), 0, CHAIR_Y + 0.25, 0.22));
    for (const [a, b] of [[-0.2, -0.18], [0.2, -0.18], [-0.2, 0.18], [0.2, 0.18]]) chair.add(at(box(0.03, CHAIR_Y, 0.03, chrome), a, CHAIR_Y / 2, b));
    const milkGlass = at(cyl(0.05, 0.045, 0.16, 8, M(0xfafafa, { unlit: 0.45 })), TABLE[0] + 0.2, TABLE_Y + 0.08, TABLE[1] - 0.12); G.add(milkGlass);
    // the back wall: mint each side of the giant comic page; the page itself with the door panel cut out of it
    const PW = 5.2, PH = DH;
    for (const [xa, xb] of [[-DW, DOOR.x0], [DOOR.x1, DW]]) G.add(at(box(xb - xa, DH, 0.04, mint), (xa + xb) / 2, DH / 2, WALL_Z));
    G.add(at(box(DOOR.x1 - DOOR.x0, DH - DOOR.H, 0.04, mint), 0, DOOR.H + (DH - DOOR.H) / 2, WALL_Z));
    G.add(at(new THREE.Mesh(new THREE.PlaneGeometry(PW, PH), mat({ map: muralT, unlit: 0.25 })), 0, PH / 2, WALL_Z + 0.025));
    // the page leaf: a sheet of paper in the door, hinged on its right edge, turning into the diner
    const leafPiv = at(new THREE.Group(), DOOR.x1, 0, WALL_Z); G.add(leafPiv);
    const LW = DOOR.x1 - DOOR.x0, leaf = new THREE.Group(); leafPiv.add(leaf);
    leaf.add(at(box(LW - 0.02, DOOR.H - 0.02, 0.02, paper), -LW / 2, DOOR.H / 2, 0));
    leaf.add(at(new THREE.Mesh(new THREE.PlaneGeometry(LW - 0.04, DOOR.H - 0.04), mat({ map: leafT, unlit: 0.25 })), -LW / 2, DOOR.H / 2, 0.012));
    // its back: the page's reverse, more panels (turned open, this side faces the diner)
    const backT = tex(96, 144, (x, r) => {
      x.scale(2, 2);
      px(x, '#f4f2ea', 0, 0, 48, 72); x.strokeStyle = '#1c2030'; x.lineWidth = 2;
      for (const [a, b, w, h] of [[2, 2, 44, 22], [2, 26, 21, 22], [25, 26, 21, 22], [2, 50, 44, 20]]) x.strokeRect(a + 0.5, b + 0.5, w, h);
      drawCar(x, r, 22, 13, 0.75, 13); drawCar(x, r, 12, 37, 0.42, 13); drawCar(x, r, 35, 37, 0.42, 7);
      for (let i = 0; i < 9; i++) strokes(x, r, [[24, 60], [24 + 20 * Math.cos(i / 9 * TAU), 60 + 9 * Math.sin(i / 9 * TAU)]], '#3a4058', 1);
    }, 3404);
    leaf.add(at(rot(new THREE.Mesh(new THREE.PlaneGeometry(LW - 0.04, DOOR.H - 0.04), mat({ map: backT, unlit: 0.25 })), 0, PI, 0), -LW / 2, DOOR.H / 2, -0.012));
    // ---------- the comic's world (drawn, z < 0) ----------
    // the page seen from inside: a paper wall far wider and taller than the diner, so no colour shows round it
    const backM = M(0xf2f2ee, { unlit: 0.3 });
    for (const [xa, xb] of [[-70, DOOR.x0], [DOOR.x1, 70]]) G.add(at(box(xb - xa, 40, 0.02, backM), (xa + xb) / 2, 20, WALL_Z - 0.035));
    G.add(at(box(LW + 0.12, 40 - DOOR.H, 0.02, backM), 0, DOOR.H + (40 - DOOR.H) / 2, WALL_Z - 0.035));   // overlapping its neighbours: abutting, the sky showed through a crack
    G.add(at(box(LW + 0.16, 0.08, 0.06, M(0x1c2030)), 0, DOOR.H + 0.04, WALL_Z - 0.05));      // the door panel's inked border, from inside
    for (const x of [DOOR.x0 - 0.04, DOOR.x1 + 0.04]) G.add(at(box(0.08, DOOR.H, 0.06, M(0x1c2030)), x, DOOR.H / 2, WALL_Z - 0.05));
    // the paper ground and a sky dome (white paper with a faint blue), both only ever seen drawn
    G.add(flat(140, 80, mat({ map: paperT, rep: [40, 24], unlit: 0.15 }), 0, -0.002, -40));
    const sky = new THREE.Mesh(new THREE.SphereGeometry(95, 16, 10), mat({ color: 0xe6edf4, unlit: 1, nofog: 1, side: THREE.BackSide })); sky.position.set(0, -10, -25); G.add(sky);
    const cloudM = M(0xffffff, { unlit: 0.9 }), clouds = [];
    for (let i = 0; i < 9; i++) { const c = new THREE.Group(); for (let q = 0; q < 4; q++) { const b = ico(1.4 + hash(i, q) * 1.2, 1, cloudM); b.position.set(q * 1.8 - 2.7, hash(i, q + 5) * 0.8, 0); b.scale.y = 0.6; c.add(b); } c.position.set(-40 + i * 10 + hash(i, 9) * 4, 14 + hash(i, 3) * 8, -48 - hash(i, 4) * 12); G.add(c); clouds.push(c); }
    // free-standing panel frames by the wall: white boards inside thick inked borders (the clip's frames in the void)
    for (const [x, z, yaw] of FRAMES) {
      const f = at(new THREE.Group(), x, 0, z); f.rotation.y = yaw * PI / 180; G.add(f);
      f.add(at(box(1.9, 2.6, 0.04, M(0xf8f8f4, { unlit: 0.3 })), 0, 1.45, 0));
      for (const [w, h, dx, dy] of [[2.0, 0.1, 0, 2.75], [2.0, 0.1, 0, 0.15], [0.1, 2.7, -0.95, 1.45], [0.1, 2.7, 0.95, 1.45]]) f.add(at(box(w, h, 0.06, M(0x1c2030)), dx, dy, 0));
    }
    // the race track: grey asphalt, a centre line, kerbs of alternating blocks, a fence and bales on the far side
    G.add(flat(160, ROAD.z0 - ROAD.z1, M(0xa4a6aa), 0, 0.004, (ROAD.z0 + ROAD.z1) / 2));
    const STRIDE = 48, scroll = new THREE.Group(); G.add(scroll);   // everything that streams past in a race, wrapped every 3 STRIDE m
    const dashM = M(0xf6f6f2, { unlit: 0.3 }), kerbA = M(0x2a3044), kerbB = M(0xf6f6f2, { unlit: 0.2 }), fenceM = M(0xf6f6f2);
    const items = [];
    const add = (o, x) => { scroll.add(o); items.push([o, x]); return o; };
    for (let x = -72; x < 72; x += 4) add(at(box(2.0, 0.012, 0.16, dashM), 0, 0.012, (ROAD.z0 + ROAD.z1) / 2), x);
    for (let x = -72; x < 72; x += 1) for (const [z, sd] of [[ROAD.z0 + 0.2, 0], [ROAD.z1 - 0.2, 1]]) add(at(box(0.98, 0.06, 0.4, pmod(x + sd, 2) ? kerbA : kerbB), 0, 0.03, z), x);
    for (let x = -72; x < 72; x += 3) { add(at(box(0.1, 0.9, 0.1, fenceM), 0, 0.45, ROAD.z1 - 1.0), x); add(at(box(3.0, 0.08, 0.05, fenceM), 0, 0.75, ROAD.z1 - 1.0), x + 1.5); add(at(box(3.0, 0.08, 0.05, fenceM), 0, 0.4, ROAD.z1 - 1.0), x + 1.5); }
    for (let x = -70; x < 72; x += 7) add(rot(at(cyl(0.5, 0.5, 0.9, 10, M(0xe8d8a8)), 0, 0.5, ROAD.z1 - 1.8), PI / 2, 0, 0), x + hash(x, 1) * 2);
    for (let x = -66; x < 72; x += 12) { add(at(box(0.06, 3.2, 0.06, M(0x6a6e78)), 0, 1.6, ROAD.z1 - 1.5), x); add(at(box(0.9, 0.55, 0.02, M(pmod(x, 24) ? 0x1c2030 : 0xf6f6f2)), 0, 2.9, ROAD.z1 - 1.5), x + 0.45); }   // flags on poles behind the far fence (on the near side they crossed every lens)
    // the start and finish gantry: two posts and a chequered banner across the road (it streams past in a race too)
    const chkT = tex(8, 2, x => { for (let i = 0; i < 8; i++) for (let j = 0; j < 2; j++) px(x, (i + j) % 2 ? '#1c2030' : '#f6f6f2', i, j, 1, 1); }, 3425);   // big squares: smaller ones hatched into grey
    const flagT = tex(4, 3, x => { for (let i = 0; i < 4; i++) for (let j = 0; j < 3; j++) px(x, (i + j) % 2 ? '#1c2030' : '#f6f6f2', i, j, 1, 1); }, 3427);
    const gantry = new THREE.Group(); G.add(gantry);
    for (const z of [ROAD.z0 + 0.35, ROAD.z1 - 0.35]) gantry.add(at(box(0.16, 3.4, 0.16, M(0x3a3e4a)), 0, 1.7, z));
    gantry.add(at(box(0.08, 1.0, ROAD.z0 - ROAD.z1 + 0.2, mat({ map: chkT, unlit: 0.4 })), 0, 3.05, (ROAD.z0 + ROAD.z1) / 2));
    gantry.add(at(flat(0.5, ROAD.z0 - ROAD.z1, mat({ map: chkT, rep: [1, 2], unlit: 0.3 })), 0, 0.008, (ROAD.z0 + ROAD.z1) / 2));
    // the grandstand behind the far fence: four tiers of pet fans under a roof (its crowd painted on, streaming by UV in a race)
    const crowdT = tex(64, 16, (x, r) => { px(x, '#e8e8e4', 0, 0, 64, 16); for (let i = 0; i < 32; i++) { const c = ['#c8ccd8', '#9aa0b4', '#e0d0b8', '#b8c0a8'][Math.floor(r() * 4)]; px(x, c, i * 2, 4 + Math.floor(r() * 3), 2, 7); px(x, '#5a6078', i * 2, 3 + Math.floor(r() * 2), 1, 1); } }, 3426);
    const crowdM = mat({ map: crowdT, rep: [12, 1], unlit: 0.3 });
    for (let r = 0; r < 4; r++) { G.add(at(box(90, 0.5, 1.0, M(0xd8d8d4)), 0, 0.25 + r * 0.5, -11.2 - r * 1.0)); G.add(at(new THREE.Mesh(new THREE.PlaneGeometry(90, 0.9), crowdM), 0, 0.95 + r * 0.5, -10.75 - r * 1.0)); }
    G.add(at(box(90, 0.12, 5.4, M(0xf2f2ee)), 0, 4.6, -12.6)); for (let x = -44; x <= 44; x += 8) G.add(at(box(0.12, 4.6, 0.12, M(0x6a6e78)), x, 2.3, -10.2));
    // hills far beyond
    for (let i = 0; i < 7; i++) { const h = ico(14 + hash(i, 1) * 8, 1, M(0xdcdcd6)); h.scale.set(1.6, 0.35, 1); h.position.set(-60 + i * 20, -2, -60 - hash(i, 2) * 10); G.add(h); }
    // the starter with the flag at the line, and the two cars
    const starter = pet(5); starter.g.position.set(STARTER[0], 0, STARTER[1]); G.add(starter.g);
    const flagPole = new THREE.Group(); starter.arms[1].add(flagPole);
    flagPole.add(at(box(0.03, 1.0, 0.03, M(0x3a3e4a)), 0, -0.65, 0)); flagPole.add(at(box(0.03, 0.6, 0.8, mat({ map: flagT, unlit: 0.45 })), 0, -0.95, -0.41));
    const cars = { 13: racer(13, 0xf6f4ee), 7: racer(7, 0xb8bcc8) };
    for (const c of Object.values(cars)) G.add(c.g);
    // speed lines round the cars: long thin strokes streaming past
    const lineInk = M(0x2a3044), sLines = [];
    for (let i = 0; i < 28; i++) { const l = box(2.2 + hash(i, 1) * 2.4, 0.03, 0.03, lineInk); G.add(l); sLines.push(l); }
    // the fans in the grandstand's front row and the diner's customers (real box pets)
    const fans = []; for (let i = 0; i < 14; i++) { const p = pet(i + 11); p.g.position.set(-13 + i * 2.0 + hash(i, 7) * 0.4, 0.5, -11.0); G.add(p.g); fans.push(p); }
    const GUESTS = [[-5.55, 2.12, 0], [-5.55, 3.68, PI], [-5.55, 4.52, 0], [-5.55, 8.48, PI], [cx0 - 0.5, 4.95, -PI / 2], [cx0 - 0.5, 7.15, -PI / 2]];
    const guests = GUESTS.map(([x, z, yaw], i) => { const p = pet(i + 3, true); p.g.position.set(x, 0.38, z); p.home = [x, z, yaw]; G.add(p.g); return p; });
    // hearts (three at a time, popping and rising: drawn behind the wall, pink in the diner)
    const heartM = M(0xff4f9a, { unlit: 0.8, keep: 1 }), hearts = [];   // keep: pink even behind the page (hatched, a heart read as a grey cloud)
    for (let i = 0; i < 15; i++) { const h = new THREE.Group(); h.add(at(ico(0.1, 0, heartM), -0.075, 0, 0)); h.add(at(ico(0.1, 0, heartM), 0.075, 0, 0)); h.add(rot(at(cone(0.125, 0.18, 4, heartM), 0, -0.11, 0), PI, 0, 0)); h.visible = false; G.add(h); hearts.push(h); }

    return {
      group: G, sky: k.grad([[0, '#bfe0f4'], [1, '#f4f8fa']]), shadowCol: 0x7a7a6e, shadowY: 0.02, indoor: true,
      light() {
        lights(0x9a9aa0, 0xfff2dc, [0.35, -0.85, -0.25], 0xe8eef2, [22, 90], 8);
        pt(0, 0, 3.2, 3.0, 0.35, 0.36, 0.38);               // the fluorescents
        pt(1, 3.0, 3.0, 6.0, 0.3, 0.3, 0.32);
        pt(2, -3.0, 3.0, 6.0, 0.3, 0.3, 0.32);
      },
      anim(t, P = {}) {
        const s = shotT(t, P), bb = beat(t), hb = bb >= 0 ? Math.exp(-fr(bb) * 4) : 0;
        U.uSk.value.set(0, 0, 1, WALL_Z);   // the comic: everything behind the page wall in pencil (a shot's own `sketch` overrides it)
        if (P.key) pt(3, P.key[0], P.key[1], P.key[2], P.key[3], P.key[4], P.key[5]); else pt(3, 0, -99, 0, 0, 0, 0);
        ceil.visible = !P.noCeil; tubes.forEach(tb => { tb.visible = !P.noCeil; });
        // the page leaf: turned open into the diner; a knock jolts it (the wrench from the drawn side)
        let kn = 0; for (const q of P.knock || []) { const e = s - q; if (e >= 0 && e < 0.4) kn = Math.max(kn, Math.exp(-e * 9) * Math.abs(Math.sin(e * 40))); }
        leafPiv.rotation.y = ramp(P.page, s) * 2.88 + 0.12 * kn;   // 1 = 165 deg: turned flat against the wall like a page (standing at 100 deg it walled off every lens from the right)
        leaf.scale.z = 1 + 3 * kn;
        // the cars: on the grid unless the shot places them; racing, they bob and their wheels spin
        const R = P.race || null, speed = R ? (R.speed ?? 14) : 0, travel = speed * s;
        const place = P.cars || [{ num: 13, x: GRID_X + 1.5, z: LANE13 }, { num: 7, x: GRID_X + 1.5, z: LANE7 }];
        for (const c of Object.values(cars)) c.g.visible = false;
        place.forEach(q => {
          const c = cars[q.num]; if (!c) return; c.g.visible = true;
          const bob = R ? 0.03 * Math.sin(t * 31 + q.num) + 0.02 * Math.sin(t * 17) : 0;
          const x = q.tx != null && q.dur ? q.x + (q.tx - q.x) * cl(s / q.dur) : q.x;   // tx + dur: it drifts there linearly over the shot (falling behind: a rider's mx does the same)
          c.g.position.set(x, bob + (q.y || 0), q.z); c.g.rotation.set(R ? 0.01 * Math.sin(t * 23) : 0, (q.yaw || 0) * PI / 180, 0);
          c.wheels.forEach(w => { w.rotation.z = travel / 0.38; });
        });
        // the track's furniture streams past along +x in a race (noses to -x), wrapped so it never runs out
        items.forEach(([o, x0]) => { o.position.x = R ? pmod(x0 + travel + STRIDE * 1.5, STRIDE * 3) - STRIDE * 1.5 : x0; });
        crowdM.uniforms.uOff.value.x = R ? -travel / 7.5 : 0;
        const c13 = place.find(q => q.num === 13);
        gantry.position.x = R && R.finish != null && c13 ? c13.x - 1.6 + (s - R.finish) * speed : GRID_X;
        gantry.visible = P.gantry !== false && Math.abs(gantry.position.x) < 60 && (!R || R.finish != null);   // racing, it shows only as the finish line
        gantry.children[0].visible = !R;   // racing, the near post goes (it swept through every lens on the near side): the banner hangs from the far one
        // speed lines round the cars
        sLines.forEach((l, i) => {
          l.visible = !!(R && R.lines); if (!l.visible) return;
          const cz = i % 2 ? LANE13 : LANE7, x = pmod(hash(i, 3) * 40 + travel * 1.6, 40) - 20 + (c13 ? c13.x : 0);
          l.position.set(x, 0.25 + hash(i, 4) * 1.9, cz + (hash(i, 5) - 0.5) * 1.6);
        });
        // the starter drops the flag; the fans
        const fl = P.flag != null && s >= P.flag ? sm((s - P.flag) / 0.2) : 0;
        const st = P.starter || STARTER; starter.g.position.set(st[0], 0, st[1]);
        starter.g.visible = !P.noguests && !cleared(P, st[0], st[1]);
        animPet(starter, 'watch', bb, P.starterYaw != null ? P.starterYaw * PI / 180 : Math.atan2(GRID_X + 2 - st[0], LANE13 - st[1]));
        starter.arms[1].rotation.set(0, 0, -2.6 + 2.2 * fl);
        fans.forEach(p => { p.g.visible = !P.noguests; if (p.g.visible) animPet(p, P.fans || 'cheer', bb, 0); });
        // the diner's customers eat, stare or cheer
        guests.forEach(p => {
          const [x, z, yaw0] = p.home; p.g.visible = !P.noguests && !cleared(P, x, z);
          if (!p.g.visible) return;
          const yaw = P.stare ? Math.atan2(P.stare[0] - x, P.stare[1] - z) : yaw0;
          animPet(p, P.guests || 'eat', bb, yaw);
        });
        milkGlass.visible = P.milk !== false;
        neon.material.uniforms.uCol.value.setScalar(0.85 + 0.15 * hb);
        clouds.forEach((c, i) => { c.position.x = -40 + i * 10 + hash(i, 9) * 4 + 0.15 * t; });
        hearts.forEach((h, i) => {
          const q = (P.hearts || [])[Math.floor(i / 3)]; h.visible = false; if (!q) return;
          const e = s - q[3] - (i % 3) * 0.18; if (e < 0 || e > 1.6) return;
          const hy = (P.heartYaw || 0) * PI / 180, k = (i % 3) - 1, sp = 0.3 * k + 0.06 * Math.sin(e * 6 + i);
          h.visible = true; h.position.set(q[0] + sp * Math.cos(hy), q[1] + 0.5 * e + 0.12 * Math.abs(k), q[2] - sp * Math.sin(hy)); h.scale.setScalar(Math.min(1, e * 5) * (1.15 - 0.25 * (e / 1.6)));
          h.rotation.y = hy;
        });
      },
    };
  }
  return { comic: comic() };
}
