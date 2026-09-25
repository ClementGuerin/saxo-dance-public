// maps6.js: the "99 Luftballons" map (Snoblack techno, 2026-09-25). Same contract as the other map files, pure in t:
//   techno  a warehouse techno club at night: a concrete floor and walls with tags, steel trusses, the DJ booth on a stage
//           under a giant "99" neon, speaker stacks, lasers and a strobe on the beat, pet ravers with glow sticks, and 99
//           balloons in a net under the ceiling that fall on the drop (TECHNO.DROP) and float over the crowd from then on.
//           Spots (TECHNO): the dance floor at the origin, the DJ at BOOTH on the stage (top at STAGE), the bouncer's door and
//           rope at DOOR, the booth's power box on the floor at the stage's left corner with its plug at SOCKET (the cable runs
//           back along the floor from CABLE, up the stage front and over to the booth; Kob stands behind it at PLUGSPOT). Shot flags read by anim(t, P): `alarm` (red beacons and light), `co2` (white jets on every bar), `freeze`
//           (cut seconds: the ravers stop dead), `unplugAt` (cut seconds: the plug leaves the socket), `doorOpen` (street light),
//           `confetti` (cut seconds: the cannons fire), `planes` ({ n, at }: paper planes chase the balloons), `ring` (the
//           ravers stand in a ring around the floor: a dance battle), `blackout`
//           (cut seconds: every light dies with the music), `last` ([x, z, t0]: one red balloon rising in the dark), `half`
//           (the breakdown: the ravers sway at half time), `noguests`, `noballoons`.
import { mapKit } from './mapkit.js';

export const TECHNO = { STAGE: 0.9, BOOTH: [0, -5.25], DOOR: [6.4, 2.6], SOCKET: [-2.3, 0.32, -2.55], CABLE: [-2.3, 0.03, -2.86], PLUGSPOT: [-2.3, -2.87], DROP: 0 };   // DROP: cut seconds (the episode starts on the drop)

export function buildTechnoMaps(K) {
  const k = mapKit(K);
  const { THREE, mat, tex, px, noise, box, U, TAU, PI, hash, fr, hit, beatN, beat, grad, cyl, cone, ico, at, rot, flat, lights, pt, room } = k;
  const M = (c, o = {}) => mat({ color: c, ...o }), glow = c => mat({ color: c, unlit: 1 });
  const S = TECHNO.STAGE;

  // ---------- a pet raver: dark outfit, neon accents, a glow stick in each paw; jumps on the beat ----------
  const FURS = [0xd8c2a0, 0x3a2e28, 0xf2eee6, 0x9a7a5a, 0x6a6a72, 0xe8a060, 0x2a2a30, 0xc8b8e0];
  const OUT = [0x1a1a22, 0x2a2438, 0x14141a, 0x3a1a3a, 0x1a2a3a, 0x222222];
  const NEON = [0x39ff6a, 0xff3fd8, 0x3fd4ff, 0xffe23f];
  function raver(i) {
    const g = new THREE.Group(), fur = M(FURS[i % FURS.length]), out = M(OUT[(i * 5) % OUT.length]), neon = glow(NEON[i % NEON.length]), kind = i % 3;
    g.add(at(box(0.36, 0.34, 0.26, out), 0, 0.3, 0));
    g.add(at(box(0.37, 0.05, 0.27, neon), 0, 0.2, 0));                 // a neon stripe on the top
    for (const s of [-1, 1]) g.add(at(box(0.11, 0.14, 0.12, fur), s * 0.1, 0.07, 0.02));
    const head = at(box(0.46, 0.4, 0.4, fur), 0, 0.68, 0); g.add(head);
    head.add(at(box(0.16, 0.1, 0.1, M(0x1a1a1a)), 0, -0.06, 0.2));
    for (const s of [-1, 1]) {
      head.add(at(box(0.07, 0.07, 0.02, M(0x101010)), s * 0.11, 0.04, 0.205));
      head.add(kind === 0 ? rot(at(cone(0.08, 0.2, 4, fur), s * 0.15, 0.27, 0), 0, 0, -s * 0.25)
        : kind === 1 ? at(box(0.08, 0.3, 0.06, fur), s * 0.1, 0.33, 0) : rot(at(box(0.07, 0.24, 0.16, fur), s * 0.25, -0.02, 0), 0, 0, s * 0.35));
    }
    if (i % 4 === 1) head.add(at(box(0.36, 0.07, 0.03, glow(0xff3fd8)), 0, 0.06, 0.215));   // neon shades
    const arms = [-1, 1].map(s => { const a = new THREE.Group(); a.position.set(s * 0.21, 0.44, 0); a.add(at(box(0.09, 0.28, 0.09, out), 0, -0.13, 0)); a.add(at(box(0.04, 0.2, 0.04, neon), 0, -0.32, 0.02)); g.add(a); return a; });
    return { g, head, arms, i };
  }
  const raverAnim = (G, t, P) => G.forEach(({ g, head, arms, i }) => {
    const stop = P.freeze ?? P.blackout, frozen = stop != null && t >= stop;   // the door opens / the plug is out: everyone freezes where they stand
    const tt = frozen ? stop : t, b = beat(tt) + hash(i, 7) * 0.2, half = P.half ? 0.5 : 1;
    const up = Math.abs(Math.sin(b * PI * half)), jump = P.half ? 0.05 : 0.16;
    g.position.y = g.userData.y0 + up * jump; head.rotation.z = 0.14 * Math.sin(b * PI * half);
    const wave = (Math.floor(b / 4) + i) % 2 === 0;   // every other bar half the room throws both arms up
    arms.forEach((a, s) => { a.rotation.z = (s ? 1 : -1) * (wave ? 2.7 + 0.25 * Math.sin(b * TAU) : 0.35 + 0.3 * up); });
  });

  // =====================================================================================================================
  function techno() {
    const G = new THREE.Group();
    // ---- the shell: concrete floor, block walls with tags, a black ceiling with steel trusses ----
    const floorT = tex(32, 32, (x, r) => { px(x, '#2c2b31', 0, 0, 32, 32); noise(x, r, 32, 32, ['#28272d', '#313036', '#2a292f'], 260); px(x, '#252429', 0, 15, 32, 1); px(x, '#252429', 15, 0, 1, 32); }, 601);
    G.add(flat(18, 18, mat({ map: floorT, rep: [9, 9] }), 0, 0, 0.5));
    const wallT = tex(32, 32, (x, r) => { px(x, '#23222a', 0, 0, 32, 32); for (let y = 0; y < 32; y += 8) { px(x, '#1d1c23', 0, y, 32, 1); for (let X = (y / 8) % 2 ? 0 : 8; X < 32; X += 16) px(x, '#1d1c23', X, y, 1, 8); } noise(x, r, 32, 32, ['#26252d', '#201f26'], 90); }, 602);
    room(G, 18, 16, 6.4, wallT, 2, 0x0c0b10, { skip: ['front'], cz: 0.5 });
    const tagT = tex(64, 32, (x, r) => {   // graffiti tags, low contrast so they don't fight the dancers
      px(x, '#23222a', 0, 0, 64, 32); noise(x, r, 64, 32, ['#26252d', '#201f26'], 200);
      const col = ['#8a3a7a', '#3a7a8a', '#8a7a3a', '#6a3a9a'];
      for (let s = 0; s < 7; s++) { x.strokeStyle = col[s % 4]; x.lineWidth = 2; x.beginPath(); let X = 4 + r() * 54, Y = 8 + r() * 18; x.moveTo(X, Y); for (let q = 0; q < 5; q++) { X += (r() - 0.3) * 9; Y += (r() - 0.5) * 10; x.lineTo(X, Y); } x.stroke(); }
    }, 603);
    for (const s of [-1, 1]) G.add(rot(at(new THREE.Mesh(new THREE.PlaneGeometry(9, 2.6), mat({ map: tagT })), s * 8.97, 1.6, -1.2), 0, -s * PI / 2, 0));
    const steel = M(0x3a3a44), trussT = tex(16, 8, x => { px(x, '#3a3a44', 0, 0, 16, 8); x.strokeStyle = '#55556a'; x.lineWidth = 1; x.beginPath(); for (let X = 0; X < 16; X += 8) { x.moveTo(X, 0); x.lineTo(X + 8, 8); x.moveTo(X + 8, 0); x.lineTo(X, 8); } x.stroke(); });
    for (const z of [-5.2, -1.5, 2.2]) G.add(at(box(17, 0.4, 0.4, mat({ map: trussT, rep: [34, 1] })), 0, 5.7, z));
    for (const x of [-4, 4]) G.add(at(box(0.4, 0.4, 12, mat({ map: trussT, rep: [24, 1] })), x, 5.9, -1.5));
    // ---- the stage at the back: its front face at z = -3.8, top at y = STAGE ----
    const stageT = tex(16, 8, (x, r) => { px(x, '#16151b', 0, 0, 16, 8); noise(x, r, 16, 8, ['#1b1a21', '#121116'], 30); });
    G.add(at(box(9, S, 3.6, mat({ map: stageT, rep: [4, 1] })), 0, S / 2, -5.6));
    const lip = at(box(9, 0.05, 0.06, glow(0xff3fd8)), 0, S - 0.03, -3.79); G.add(lip);   // a neon strip along the stage lip
    // the DJ table: decks, a mixer with lit knobs, a laptop; its top at STAGE + 0.55 hides the DJ's legs
    const djT = tex(32, 8, x => { px(x, '#101014', 0, 0, 32, 8); for (let X = 1; X < 31; X += 3) px(x, ['#ff3fd8', '#3fd4ff', '#39ff6a'][X % 3], X, 5, 2, 1); });
    const TT = 0.42;   // table top above the stage: low enough that the DJ's chest and paws show over the decks
    const table = at(box(2.6, TT, 0.7, mat({ map: djT })), TECHNO.BOOTH[0], S + TT / 2, TECHNO.BOOTH[1] + 0.62); G.add(table);
    const tableLed = at(box(2.62, 0.04, 0.02, glow(0x3fd4ff)), TECHNO.BOOTH[0], S + TT - 0.05, TECHNO.BOOTH[1] + 0.98); G.add(tableLed);
    const decks = []; for (const s of [-1, 1]) {
      const d = new THREE.Group(); d.add(cyl(0.2, 0.2, 0.03, 10, M(0x1a1a1a))); d.add(at(box(0.05, 0.035, 0.18, glow(0xffffff)), 0, 0.005, 0.06));
      d.position.set(TECHNO.BOOTH[0] + s * 0.75, S + TT + 0.02, TECHNO.BOOTH[1] + 0.6); G.add(d); decks.push(d);
    }
    const mixer = at(box(0.36, 0.06, 0.34, M(0x22222a)), TECHNO.BOOTH[0], S + TT + 0.03, TECHNO.BOOTH[1] + 0.6); G.add(mixer);
    const knobs = []; for (let q = 0; q < 6; q++) { const kb = at(box(0.04, 0.03, 0.04, glow(NEON[q % 4])), TECHNO.BOOTH[0] - 0.1 + (q % 3) * 0.1, S + TT + 0.07, TECHNO.BOOTH[1] + 0.52 + Math.floor(q / 3) * 0.14); G.add(kb); knobs.push(kb); }
    const laptop = new THREE.Group(); laptop.add(box(0.34, 0.02, 0.24, M(0xc8c8d0))); laptop.add(rot(at(box(0.34, 0.22, 0.015, glow(0xff5fc8)), 0, 0.11, -0.11), -0.3, 0, 0));
    laptop.position.set(TECHNO.BOOTH[0] + 1.05, S + TT + 0.01, TECHNO.BOOTH[1] + 0.55); laptop.rotation.y = 0.5; G.add(laptop);
    // speaker stacks either side of the booth, pumping on the kick
    const spkT = tex(8, 16, x => { px(x, '#101012', 0, 0, 8, 16); x.fillStyle = '#34343c'; x.beginPath(); x.arc(4, 4.5, 3, 0, TAU); x.arc(4, 11.5, 3, 0, TAU); x.fill(); x.fillStyle = '#1a1a1e'; x.beginPath(); x.arc(4, 4.5, 1.2, 0, TAU); x.arc(4, 11.5, 1.2, 0, TAU); x.fill(); });
    const speakers = []; for (const s of [-1, 1]) for (let q = 0; q < 2; q++) { const sp = at(box(1.1, 1.2, 0.9, mat({ map: spkT })), s * 3.3, S + 0.6 + q * 1.22, -5.2); G.add(sp); speakers.push(sp); }
    // the "99" neon over the DJ (under the lyric rows from the floor cameras), in a pink frame; it buzzes
    const signT = tex(64, 32, x => { px(x, '#07060a', 0, 0, 64, 32); x.font = 'bold 30px sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillStyle = '#ff2f8f'; x.fillText('99', 32, 18); x.fillStyle = '#ffd0ea'; x.fillText('99', 31, 17); });
    const signM = mat({ map: signT, unlit: 1 }); G.add(at(box(3.4, 1.7, 0.06, signM), 0, S + 1.95, -7.35));
    const frameN = glow(0xff3fd8); for (const [w, h, x, y] of [[3.6, 0.06, 0, 1.73], [3.6, 0.06, 0, -0.03], [0.06, 1.8, -1.8, 0.85], [0.06, 1.8, 1.8, 0.85]]) G.add(at(box(w, h, 0.06, frameN), x, S + 1.1 + y - 0.02, -7.3));
    // lasers: two emitters at the stage's back corners fanning green and red beams over the crowd
    const lasers = [];
    for (const s of [-1, 1]) for (let q = 0; q < 3; q++) {
      const beamG = new THREE.Group(), beam = at(box(0.022, 0.022, 10, glow(q % 2 ? 0xff2a3a : 0x39ff6a)), 0, 0, 5); beamG.add(beam);   // 10 m: they end before the cameras
      beamG.position.set(s * 3.9, S + 2.6, -6.6); beamG.rotation.order = 'YXZ'; G.add(beamG); lasers.push([beamG, s, q]);
    }
    // alarm beacons on the speaker tops (the "Alarm" line): red domes whose beams spin
    const beacons = []; for (const [bx, by, bz, k] of [[-3.3, S + 2.55, -5.2, 1], [3.3, S + 2.55, -5.2, 1], [-1.35, S + TT + 0.14, TECHNO.BOOTH[1] + 0.62, 1.3], [1.35, S + TT + 0.14, TECHNO.BOOTH[1] + 0.62, 1.3]]) {
      const bc = new THREE.Group(); bc.add(cyl(0.12, 0.14, 0.18, 8, glow(0xff2020))); const bm = at(box(0.9, 0.05, 0.05, glow(0xff5050)), 0.45, 0.02, 0); bc.add(bm); bc.scale.setScalar(k); bc.position.set(bx, by, bz); G.add(bc); beacons.push(bc); }
    // CO2 cannons: four nozzles on the stage lip; white jets fire on the bar
    // each jet is a column of fog puffs (low-poly spheres) that shoots up and swells, lighter at the top
    const fogM = [mat({ color: 0xe8eef8, unlit: 0.6 }), mat({ color: 0xf8fbff, unlit: 0.8 })], puffGeo = new THREE.IcosahedronGeometry(0.2, 0);
    const jets = []; for (let q = 0; q < 4; q++) { const j = new THREE.Group(); for (let c = 0; c < 9; c++) { const m = new THREE.Mesh(puffGeo, fogM[c % 2]); m.userData = { y: 0.25 + c * 0.36, x: (hash(q, c, 41) - 0.5) * 0.3, z: (hash(q, c, 42) - 0.5) * 0.3, r: 0.9 + c * 0.28 }; j.add(m); } j.position.set(-3 + q * 2, S, -3.95); G.add(j); jets.push(j); G.add(at(box(0.18, 0.2, 0.18, steel), -3 + q * 2, S + 0.1, -3.95)); }
    // confetti from two cannons at the stage corners: a burst up and out, then it drifts down over the floor
    const confM = [0xff3fd8, 0x3fd4ff, 0xffe23f, 0x39ff6a, 0xffffff].map(c => glow(c)), confetti = [];
    confM.forEach(m => { m.side = THREE.DoubleSide; }); const confGeo = new THREE.PlaneGeometry(0.2, 0.13);
    for (let q = 0; q < 180; q++) { const c = new THREE.Mesh(confGeo, confM[q % confM.length]); G.add(c); confetti.push(c); }
    // the door on the right wall (the bouncer's spot), its light box, the velvet rope
    const [dx, dz] = TECHNO.DOOR;
    G.add(at(box(0.08, 2.4, 1.9, M(0x2a2a34)), 8.95, 1.2, dz)); G.add(at(box(0.1, 0.12, 2.1, steel), 8.93, 2.46, dz));
    const exitT = tex(32, 12, x => { px(x, '#0e5a2a', 0, 0, 32, 12); px(x, '#2ad86a', 0, 0, 32, 1); px(x, '#2ad86a', 0, 11, 32, 1); px(x, '#2ad86a', 0, 0, 1, 12); px(x, '#2ad86a', 31, 0, 1, 12); x.fillStyle = '#e8fff0'; x.font = 'bold 8px monospace'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('EXIT', 16, 6.5); });
    const doorLight = at(new THREE.Mesh(new THREE.PlaneGeometry(0.7, 0.26), mat({ map: exitT, unlit: 1 })), 8.88, 2.75, dz); doorLight.rotation.y = -PI / 2; G.add(doorLight);   // faces the room, text the right way round
    const streetT = tex(16, 24, (x, r) => { px(x, '#6a5a4a', 0, 0, 16, 24); px(x, '#c8a878', 2, 0, 12, 18); px(x, '#3a3440', 0, 18, 16, 6); px(x, '#f2e0b0', 6, 2, 4, 3); noise(x, r, 16, 24, ['rgba(0,0,0,.12)'], 40); });
    const doorGlow = at(new THREE.Mesh(new THREE.PlaneGeometry(1.3, 2.2), mat({ map: streetT, unlit: 1 })), 8.9, 1.1, dz); doorGlow.rotation.y = -PI / 2; doorGlow.material.uniforms.uCol.value.setScalar(0.7); G.add(doorGlow);   // the door open onto the stairwell light (Kob's entrance)
    const chrome = M(0xc8ccd4), velvet = M(0xc8102e);
    // the rope between the bouncer and the door: she stands in front of it, facing the floor
    for (const z of [dz - 0.9, dz + 0.9]) { G.add(at(cyl(0.035, 0.035, 0.9, 6, chrome), dx + 1.1, 0.45, z)); G.add(at(cyl(0.12, 0.12, 0.04, 8, chrome), dx + 1.1, 0.02, z)); G.add(at(ico(0.06, 0, chrome), dx + 1.1, 0.93, z)); }
    G.add(at(box(0.05, 0.05, 1.8, velvet), dx + 1.1, 0.78, dz));
    // the power socket in the stage front and the booth's cable (Kob's target): a yellow plug in a grey box
    const [sx, sy, sz] = TECHNO.SOCKET, [cx, cy, cz] = TECHNO.CABLE;
    const hazT = tex(16, 8, x => { px(x, '#e8c21f', 0, 0, 16, 8); x.fillStyle = '#1a1a1e'; for (let X = -8; X < 16; X += 6) { x.beginPath(); x.moveTo(X, 8); x.lineTo(X + 3, 8); x.lineTo(X + 8, 0); x.lineTo(X + 5, 0); x.fill(); } });
    G.add(at(box(0.44, sy - 0.04, 0.34, mat({ map: hazT })), sx, (sy - 0.04) / 2, sz)); G.add(at(box(0.3, 0.02, 0.24, M(0x2a2a30)), sx, sy - 0.03, sz));   // a hazard-striped floor box
    const plugIn = new THREE.Group(); plugIn.add(at(box(0.16, 0.24, 0.16, mat({ color: 0xffd21f, unlit: 0.3 })), 0, 0.12, 0)); plugIn.add(at(box(0.18, 0.05, 0.18, M(0x2a5ad8)), 0, 0.03, 0)); plugIn.add(at(box(0.1, 0.06, 0.04, M(0x2a2a30)), 0, 0.26, 0));
    plugIn.position.set(sx, sy - 0.02, sz); G.add(plugIn);
    const cableM = mat({ color: 0xff7a1a, unlit: 0.25 });   // an orange extension lead: a black one vanished on the dark floor
    const run = (a, b) => { const m = new THREE.Mesh(new THREE.BoxGeometry(0.055, 1, 0.055), cableM), A = new THREE.Vector3(...a), B = new THREE.Vector3(...b), d = B.clone().sub(A); m.position.copy(A).add(B).multiplyScalar(0.5); m.scale.set(1, d.length(), 1); m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize()); G.add(m); return m; };
    const plugRun = run([sx, sy + 0.2, sz - 0.02], [cx, cy, cz]);   // the plug's own lead down behind the box (Kob's prop draws it once she holds it)
    run([cx, cy, cz], [cx, 0.03, -3.78]); run([cx, 0.03, -3.78], [cx, S + 0.01, -3.82]); run([cx, S + 0.03, -3.82], [TECHNO.BOOTH[0] - 1.0, S + 0.03, TECHNO.BOOTH[1] + 0.3]);
    // ---- the crowd of pet ravers: behind the squad and along the sides, clear of the cameras at z 3-6 ----
    const SPOTS = [[-4.3, -2.6, 0.4], [-1.0, -3.2, 0.1], [0.3, -3.1, 0], [1.5, -2.6, -0.1], [2.7, -2.1, -0.3], [-3.9, -0.9, 0.7], [3.7, -0.9, -0.8], [-4.2, 0.6, 1.1], [4.3, 0.8, -1.2],
      [-5.0, -3.2, 0.4], [3.2, -3.1, -0.4], [-5.2, -1.8, 0.9], [5.3, -1.6, -0.9], [-5.6, 1.9, 1.4], [5.2, -2.7, -0.6], [-0.2, -3.5, 0.05], [0.9, -3.45, -0.05], [-6.3, -0.2, 1.2]];
    const ravers = SPOTS.map(([x, z, ry], i) => { const r = raver(i); r.g.position.set(x, 0, z); r.g.rotation.y = ry; r.g.userData.y0 = 0; r.g.userData.home = [x, z, ry]; G.add(r.g); return r; });
    // ---- 99 balloons: in the net under the ceiling until the drop, then falling slowly and floating over the crowd ----
    const BAL = [0xe8243a, 0xff5fa8, 0xf6f4f0, 0xffd43b, 0x3a8aff, 0x39d86a, 0xa45aff];
    const balGeo = new THREE.IcosahedronGeometry(0.2, 1); balGeo.scale(1, 1.2, 1);
    const knotGeo = new THREE.ConeGeometry(0.04, 0.06, 4), strGeo = new THREE.BoxGeometry(0.01, 0.55, 0.01);
    const strM = M(0xe8e8e8), balloons = [];
    for (let i = 0; i < 99; i++) {
      const b = new THREE.Group(), m = mat({ color: BAL[i % BAL.length], unlit: 0.35 });
      b.add(new THREE.Mesh(balGeo, m)); b.add(at(new THREE.Mesh(knotGeo, m), 0, -0.29, 0)); b.add(at(new THREE.Mesh(strGeo, strM), 0, -0.6, 0));
      // a third are helium and float at 2.5-3.4 m; the rest fall to the floor and get kicked around (clear of the squad's
      // spot at the origin and of the power box). z < 0.8: never up against the cameras
      let x0 = -5.5 + hash(i, 1) * 11, z0 = -3.6 + hash(i, 2) * 4.4; const yN = 5.1 + hash(i, 3) * 0.55, helium = hash(i, 8) < 0.34;
      if (!helium && Math.abs(x0) < 1.8 && z0 > -1.6) z0 -= 2.0;
      if (!helium && (x0 - TECHNO.SOCKET[0]) ** 2 + (z0 - TECHNO.SOCKET[2] + 0.2) ** 2 < 2.6) x0 = TECHNO.SOCKET[0] + (x0 < TECHNO.SOCKET[0] ? -1.7 : 1.7) + (x0 - TECHNO.SOCKET[0]) * 0.3;
      const hf = helium ? 2.5 + hash(i, 4) * 0.9 : 0.24;
      b.userData = { x0, z0, yN, hf, helium, d: hash(i, 5) * 0.35, v: 2.2 + hash(i, 6) * 1.2, ph: hash(i, 7) * TAU, lie: (hash(i, 9) - 0.5) * 2.4 };   // v: they rain (2.2-3.4 m/s): a real balloon's slow drift hung in the ceiling band for the whole hook
      G.add(b); balloons.push(b);
    }
    const net = new THREE.Group(); for (let q = 0; q < 12; q++) { net.add(at(box(11.5, 0.02, 0.02, strM), 0, 5.75, -3.6 + q * 0.58)); net.add(at(box(0.02, 0.02, 6.6, strM), -5.7 + q * 1.04, 5.75, -0.4)); } G.add(net);
    // paper planes (the "squadron"): white darts circling over the floor in a loose V
    const tri = v => { const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(v, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(new Array(v.length / 3 * 2).fill(0), 2)); g.computeVertexNormals(); return g; };
    // a folded paper plane, nose at +z: two white wings in a shallow V, a grey keel under the fold
    const wingGeo = tri([0, 0, 0.36, -0.26, 0.05, -0.3, 0, 0, -0.3,   0, 0, 0.36, 0, 0, -0.3, 0.26, 0.05, -0.3]), keelGeo = tri([0, 0, 0.36, 0, 0, -0.3, 0, -0.1, -0.26]);
    const planeM = mat({ color: 0xfafaf6, unlit: 0.5, side: THREE.DoubleSide }), keelM = mat({ color: 0x9a9aa8, unlit: 0.3, side: THREE.DoubleSide }), planes = [];
    for (let q = 0; q < 99; q++) { const p = new THREE.Group(); p.add(new THREE.Mesh(wingGeo, planeM)); p.add(new THREE.Mesh(keelGeo, keelM)); G.add(p); planes.push(p); }
    // a single red balloon for the end (rises in the dark)
    const last = new THREE.Group(); { const m = mat({ color: 0xe8243a, unlit: 0.95 }); last.add(new THREE.Mesh(balGeo, m)); last.add(at(new THREE.Mesh(knotGeo, m), 0, -0.29, 0)); last.add(at(new THREE.Mesh(strGeo, strM), 0, -0.6, 0)); } last.scale.setScalar(1.25); G.add(last);
    return {
      group: G, sky: grad([[0, '#050408'], [1, '#0c0a12']]), shadowCol: 0x1c1b22, indoor: true,
      light() {
        lights(0x5a4a72, 0x6a5a8a, [0.1, -1, 0.35], 0x0c0814, [10, 30], 8);
        pt(0, 0, S + 2.2, -4.4, 1.3, 0.35, 1.0);           // stage wash, magenta
      },
      anim(t, P = {}) {
        const out = P.blackout != null && t >= P.blackout, h = out ? 0 : hit(t), n = beatN(t), half = !!P.half;
        const kick = half ? (n % 2 ? h * 0.35 : h) : h;      // the breakdown has no kick on the off beats
        // ---- lights: two moving colour washes over the floor, the strobe on the beat, the alarm ----
        const PAL = [[1, 0.2, 0.8], [0.2, 0.8, 1], [0.3, 1, 0.45], [1, 0.85, 0.25]];
        if (!out) {
          for (let q = 1; q <= 2; q++) { const a = t * 0.9 + q * PI, c = PAL[(((Math.floor(beat(t) / 4) + q) % 4) + 4) % 4]; pt(q, Math.sin(a) * 3.2, 3.2, -0.8 + Math.cos(a) * 2.4, c[0] * (0.8 + kick), c[1] * (0.8 + kick), c[2] * (0.8 + kick)); }
          U.uPtCol.value[0].setRGB(1.3 * (0.6 + 0.6 * kick), 0.35, 1.0 * (0.6 + 0.6 * kick));
          if (P.key) pt(2, ...P.key);   // key: [x, y, z, r, g, b], a light for a shot away from the floor (the door)
          if (P.alarm) { const on = Math.sin(t * 14) > 0; pt(3, 0, 3, 0.5, on ? 2.2 : 0.5, 0.05, 0.05); U.uAmb.value.setRGB(0.45 + 0.25 * on, 0.12, 0.16); }
          else { const st = !half && n % 2 === 0 ? Math.exp(-fr(beat(t)) * 18) : 0; pt(3, 0, 5.2, 1.5, 1.6 * st, 1.6 * st, 1.8 * st); }
        } else {   // the plug is out: near black, a trace of street light from the open door
          lights(0x16161f, 0x10101a, [0.1, -1, 0.35], 0x040306, [8, 22], 8); pt(0, 7.8, 1.2, TECHNO.DOOR[1], 0.35, 0.33, 0.3); if (P.key) pt(2, ...P.key);
        }
        // beams fan over the crowd from 3.5 m, dipping to ~2.3 m across the room (above the heads)
        lasers.forEach(([g, s, q]) => { g.visible = !out && !P.alarm; const sw = Math.sin(t * 1.6 + q * 0.9 + (s > 0 ? 1.7 : 0)); g.rotation.set(0.01 + 0.03 * q + 0.02 * Math.sin(t * 2.3 + q), -s * (0.3 + 0.32 * sw), 0); });
        beacons.forEach((b, i) => { b.visible = !!P.alarm && !out; b.rotation.y = t * 9 + i * PI; });
        speakers.forEach(sp => sp.scale.set(1 + 0.05 * kick, 1 + 0.03 * kick, 1 + 0.05 * kick));
        decks.forEach((d, i) => { d.rotation.y = out ? 0 : t * 3.5 * (i ? 1 : -1); });
        knobs.forEach((kb, i) => { kb.visible = !out; kb.scale.y = 1 + 2 * kick * hash(i, n); });
        signM.uniforms.uCol.value.setScalar((out ? 0.06 : 0.82 + 0.18 * (hash(Math.floor(t * 9), 4) > 0.08 ? 1 : 0.2)) * (P.signDim ?? 1));
        frameN.uniforms.uCol.value.setScalar(out ? 0.05 : 0.7 + 0.3 * kick); lip.visible = !out; tableLed.visible = !out;
        doorGlow.visible = !!P.doorOpen;
        // ---- CO2 jets on each bar, confetti, paper planes ----
        const since = fr(beat(t) / 4) * 4 * 60 / 176;   // seconds since the bar's downbeat
        // three.js only hides an object on visible === false, so every flag here is a real boolean
        jets.forEach((j, q) => { const on = !!P.co2 && !out && since < 0.55, u = since / 0.55; j.visible = on; if (on) j.children.forEach((c, ci) => { const d = c.userData, grow = Math.min(1, Math.max(0, u * 4 - ci * 0.3)); c.visible = grow > 0.02; c.position.set(d.x * (1 + u * 2), d.y * (0.4 + 0.6 * Math.min(1, u * 3)), d.z * (1 + u * 2)); c.scale.setScalar(d.r * grow * (1 + u * 0.9) * (1 - 0.55 * u * u)); c.rotation.set(ci + t * 2, ci * 2, 0); }); });
        const cf = P.confetti != null ? t - P.confetti : -1;
        confetti.forEach((c, i) => {
          c.visible = cf > 0 && cf < 5 && !out; if (!c.visible) return;
          const s = i % 2 ? 1 : -1, a = hash(i, 11), up = Math.min(cf, 0.55) / 0.55, e = 1 - (1 - up) ** 2;   // shot up and out in 0.55 s
          const y = Math.max(0.05, S + 0.3 + (1.3 + hash(i, 12) * 1.3) * e - Math.max(0, cf - 0.55) * (0.8 + hash(i, 13) * 0.5));   // peaks 2.5-3.8 m: inside the floor cameras' frame
          c.position.set(s * (3.6 - (1.2 + a * 3.8) * e) + Math.sin(cf * 2.3 + i) * 0.25, y, -3.6 + (0.6 + hash(i, 14) * 4.4) * e);
          c.rotation.set(cf * 6 + i, cf * 4 + i * 2, 0);
        });
        // planes: { n, at, R (orbit radius), y (height), cx, cz (orbit centre), size, rowY }: a loose flock circling over the floor;
        // or { pass: [[x, y, z], [x, y, z]], n, at, dur }: a V formation crossing between two points, again every `dur` s
        const pl = P.planes; planes.forEach((p, q) => {
          p.visible = !!pl && q < pl.n && !out; if (!p.visible) return;
          if (pl.pass) {
            const [A, B] = pl.pass, dur = pl.dur || 1.6, u = fr((t - (pl.at || 0)) / dur), side = q % 2 ? 1 : -1, rank = Math.ceil(q / 2);
            const dx = B[0] - A[0], dz = B[2] - A[2], L = Math.hypot(dx, dz), fx = dx / L, fz = dz / L;   // flight direction; the V trails behind the leader
            p.position.set(A[0] + dx * u - fx * rank * 0.45 + fz * side * rank * 0.4, A[1] + (B[1] - A[1]) * u + 0.06 * Math.sin(t * 5 + q), A[2] + dz * u - fz * rank * 0.45 - fx * side * rank * 0.4);
            p.rotation.set(0, Math.atan2(fx, fz), 0.25 * side); p.scale.setScalar(pl.size ?? 1.2); p.visible = u > 0.02 && u < 0.98; return;
          }
          const u = t - (pl.at || 0), lane = q % 11, row = Math.floor(q / 11), sp = 0.62 + hash(q, 21) * 0.1;
          const a = u * sp + lane * 0.13 + row * 0.7, R = (pl.R ?? 3.4) + row * 0.3 + hash(q, 22) * 0.5;
          p.position.set((pl.cx ?? 0) + Math.sin(a) * R, (pl.y ?? 2.6) + row * (pl.rowY ?? 0.12) + 0.25 * Math.sin(u * 2 + q), (pl.cz ?? -1.2) + Math.cos(a) * R * 0.7); p.scale.setScalar(1.3 * (pl.size ?? 1));
          p.rotation.set(0, a + PI / 2, 0.45); p.rotateX(0.1 * Math.sin(u * 3 + q));
        });
        // ---- balloons ----
        balloons.forEach((b, i) => {
          const U2 = b.userData; b.visible = !P.noballoons;
          if (!b.visible) return;
          b.children[0].material.uniforms.uUnlit.value = out ? 0.02 : 0.35;   // dark once the lights die: only the last one glows
          const tt = out ? P.blackout : t, dt = tt - (P.drop ?? TECHNO.DROP) - U2.d;   // drop: a shot can move the release (the TikTok cut's drop is 6.3 s in)
          if (dt < 0) { b.position.set(U2.x0, U2.yN, U2.z0); b.rotation.set(0, 0, 0); return; }
          const fallY = U2.yN - dt * U2.v, drift = Math.min(dt, 3) / 3, landed = !U2.helium && fallY <= U2.hf;
          // kicked by the crowd: every other bar a few of them get knocked up (a metre up in the air, a hop on the floor)
          const bar = Math.floor(beat(tt) / 8), bi = hash(i, bar, 3) < 0.2, bu = fr(beat(tt) / 8), bat = bi && !P.half ? Math.sin(Math.min(1, bu * 1.6) * PI) * (U2.helium ? 1.0 : 0.55) : 0;
          const y = Math.max(U2.hf, fallY) + (U2.helium ? 0.12 * Math.sin(tt * 1.3 + U2.ph) : 0) + bat;
          b.position.set(U2.x0 + drift * 0.6 * Math.sin(tt * 0.31 + U2.ph), y, U2.z0 + drift * 0.5 * Math.cos(tt * 0.27 + U2.ph));
          b.children[2].visible = !landed;   // a balloon lying on the floor: no hanging string
          if (landed && bat < 0.05) b.rotation.set(0, U2.ph, U2.lie); else b.rotation.set(0.15 * Math.sin(tt * 1.1 + U2.ph), 0, 0.15 * Math.cos(tt * 0.9 + U2.ph));
        });
        net.visible = !P.noballoons;
        const L = P.last; last.visible = !!L; if (L) { const u = Math.max(0, t - L[2]); last.position.set(L[0] + 0.15 * Math.sin(u * 1.4), 0.9 + u * 0.75, L[1]); last.rotation.z = 0.12 * Math.sin(u * 1.1); }
        // ---- the plug: in the socket, or in Kob's paw (the actor holds it; the cable is drawn by the prop) ----
        const unplugged = P.unplugAt != null && t >= P.unplugAt;   // from then on Kob holds it (the actor's plug prop draws its cable)
        plugIn.visible = !unplugged; plugRun.visible = !unplugged;
        // ---- the ravers: jumping, a ring for the battle, frozen in the blackout ----
        ravers.forEach((r, i) => {
          r.g.visible = !P.noguests;
          const [x, z, ry] = r.g.userData.home;
          // the battle ring is open towards the camera (+z)
          if (P.ring) { const a = -0.75 * PI + (i / (ravers.length - 1)) * 1.5 * PI, R = 2.7 + hash(i, 31) * 0.5; r.g.position.set(Math.sin(a) * R, r.g.position.y, -0.6 - Math.cos(a) * R * 0.8); r.g.rotation.y = Math.atan2(-r.g.position.x, -0.6 - r.g.position.z); }
          else { r.g.position.x = x; r.g.position.z = z; r.g.rotation.y = ry; }
        });
        raverAnim(ravers, t, P);
      },
    };
  }

  return { techno: techno() };
}
