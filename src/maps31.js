// maps31.js: the "Golden" map (2026-10-06, HUNTR/X, from the 2025 film KPop Demon Hunters: a girl group of idols whose
// voices raise a golden barrier over the city; the song's live premiere under a giant GOLDEN screen, a sea of fans with
// lightsticks). Same contract as the other map files, pure in t:
//   premiere  an open-air K-pop arena at night: the stage (y = 0) from the LED screen (PREM.BACK_Z) to its front edge
//             (PREM.EDGE_Z), the pit below it (PREM.PIT_Y) behind a crowd barrier, full of pet fans in purple tees with
//             lightsticks, tiered stands of lightstick dots all round, the city's towers and a tower on a hill beyond,
//             a full moon. On the stage: the trio's marks (PREM.MARKS), the centre mic that rises out of a hatch (its
//             singer's mark PREM.SING, facing +z), two speaker stacks at the front corners (PREM.SPEAKERS), confetti
//             cannons. Stage left, behind its tower: the wings, Kob's gold stage-prop throne (PREM.THRONE, facing +x, seat
//             PREM.THRONE_Y), a flight case, the power box whose socket (PREM.SOCKET) feeds the whole show.
// Flags (shot fields read by anim(t, P)): screen ('logo' | 'count' | 'gold' | 'off'; count: the countdown, `count`
// = the number shown, or [b9, per]: 9 at the kit's beat b9, one less every `per` beats, held at 0), mic (true | false | [s, dur]: it rises out of the hatch),
// spot ([x, z] or [[x, z], ...]: a spotlight's cone and its pool), hush (the stage dims round the spot), fans ('wave' |
// 'cheer' | 'jump' | 'howl' | 'still'), stare ([x, z]: every fan's head turns there), blown (s: the front rows are
// blown back), knock (s: the front two rows knocked flat on their backs), faint (s: the front row swoons and falls flat on its back), hearts (s: pink hearts rise over the
// crowd), gold (the lightsticks turn gold), banner (the QUEEN banner in the front row), blow (s: the speaker stacks
// blow out: smoke, sparks, the cones popped; they smoke from then on), confetti (s, negative = started earlier: amber,
// white and lilac confetti rains over the stage and lies on it), dome ([s, dur] or 0-1: the golden barrier grows out of
// the stage over the whole arena), waves ([s, x, y, z, colour, dir] or a list of them: rings of sound rising from a howl, gold by default; dir 'fwd' blasts them towards +z), ball ([[s, x, y, z],
// ...]: a tennis ball's keyframes, shown between the first and the last), blackout (s: the stage lights and screens
// die; the moon, the dome and the lightsticks stay), moon ([x, y, z] for one shot), noguests, clear ([[x, z, r]]: no
// fan there), key ([x, y, z, r, g, b]).
import { mapKit } from './mapkit.js';

export const PREM = {
  EDGE_Z: 2.4, BACK_Z: -5.2, HALF_W: 7.4, PIT_Y: -1.1, BARRIER_Z: 3.0,
  MARKS: { center: [0, 0.3], left: [-1.7, 0.55], right: [1.7, 0.55] },
  SING: [0, 0.35], MIC: [0, 0.86, 0.86], MIC_BASE: [0, 0.96],
  SPEAKERS: [[-6.3, 1.4], [6.3, 1.4]],
  TOWER_X: 7.95,                                   // the side towers' centres (x = +-), their front at z 2.3
  THRONE: [-9.3, 0.0], THRONE_Y: 0.45, CASE: [-9.25, 0.95], SOCKET: [-10.45, 0.55, -1.25],
  WING: [-11.6, -7.6, -3.0, 2.4],                  // the wings' floor: x0, x1, z0, z1 (at the stage's height)
};

export function buildGoldenMaps(K) {
  const k = mapKit(K);
  const { THREE, mat, tex, px, noise, box, TAU, PI, beat, cyl, cone, ico, at, rot, flat, lights, pt, hash, merged, fr, stars, U, facade } = k;
  const M = (c, o = {}) => mat({ color: c, ...o }), glow = (c, u = 1, o = {}) => mat({ color: c, unlit: u, ...o });
  const shotT = (t, P) => P.t0 != null ? t - P.t0 : 0;
  const cl = x => Math.max(0, Math.min(1, x)), sm = x => { x = cl(x); return x * x * (3 - 2 * x); };
  const cleared = (P, x, z) => (P.clear || []).some(([cx, cz, r]) => (x - cx) ** 2 + (z - cz) ** 2 < r * r);
  const { EDGE_Z, BACK_Z, HALF_W, PIT_Y, BARRIER_Z, MIC, MIC_BASE, SPEAKERS, TOWER_X, THRONE, THRONE_Y, CASE, SOCKET, WING } = PREM;
  const GOLD = 0xffb52a, LILAC = 0xb88aff;

  // ---------- the LED screen's faces: the GOLDEN logo, a countdown (one texture a digit), the gold shimmer ----------
  const logoT = tex(192, 48, x => {
    const g = x.createLinearGradient(0, 0, 0, 48); g.addColorStop(0, '#2a0a5a'); g.addColorStop(0.55, '#5a1a9a'); g.addColorStop(1, '#14082e');
    x.fillStyle = g; x.fillRect(0, 0, 192, 48);
    for (let i = 0; i < 7; i++) { x.fillStyle = `rgba(255,190,80,${0.05 + (i % 3) * 0.03})`; x.fillRect(0, 4 + i * 6, 192, 1); }
    x.font = 'bold 9px monospace'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillStyle = '#c8b0e8'; x.fillText('LIVE  PREMIERE', 96, 14);
    x.font = 'bold 17px monospace';   // low on the screen and a soft gold: high and bright, it sat under the karaoke's second row and matched its sung yellow
    x.fillStyle = '#5a3200'; x.fillText('GOLDEN', 97, 33); x.fillStyle = '#e0a848'; x.fillText('GOLDEN', 96, 32);
  });
  const countT = Array.from({ length: 10 }, (_, n) => tex(192, 48, x => {   // one big digit in the middle: a 9:16 frame sees the middle of the screen
    px(x, '#120626', 0, 0, 192, 48);
    x.font = 'bold 40px monospace'; x.textAlign = 'center'; x.textBaseline = 'middle';
    x.fillStyle = '#5a3200'; x.fillText(String(n), 97, 27); x.fillStyle = '#e0a848'; x.fillText(String(n), 96, 26);
    x.font = 'bold 9px monospace'; x.fillStyle = '#c8a8ff'; x.fillText('GOLDEN', 48, 24); x.fillText('GOLDEN', 144, 24);
  }));
  const goldT = tex(64, 16, (x, r) => { const g = x.createLinearGradient(0, 0, 0, 16); g.addColorStop(0, '#ffd86a'); g.addColorStop(1, '#c8801a'); x.fillStyle = g; x.fillRect(0, 0, 64, 16); noise(x, r, 64, 16, ['#fff2c0', '#ffe08a'], 40); });   // a calm gold (a busy one fought the karaoke)
  const offT = tex(4, 4, x => px(x, '#06040c', 0, 0, 4, 4));

  // ---------- box pets in purple fan tees, a lightstick in the right paw ----------
  const FURS = [0xd8a868, 0xe8d8c0, 0xb08a60, 0xf2eee6, 0xc8c0d0, 0xe0c8a0, 0xf0dcc0, 0xd0b090];
  const TEES = [0x8a4ad8, 0x6a3ab8, 0xa05ae8, 0x7a42c8];
  const stickPurple = glow(0xc890ff, 1), stickGold = glow(0xffc24a, 1), stickHandle = M(0xf2f2f2, { unlit: 0.3 });
  function fan(i) {
    const g = new THREE.Group(), F = M(FURS[i % FURS.length]), tee = M(TEES[i % TEES.length], { unlit: 0.2 }), body = new THREE.Group(); g.add(body);
    body.add(at(box(0.42, 0.44, 0.3, tee), 0, 0.33, 0));
    body.add(at(box(0.16, 0.12, 0.02, glow(0xffd25a, 0.6)), 0, 0.38, 0.155));   // the merch tee's gold print
    const legs = [-1, 1].map(s => { const l = at(new THREE.Group(), s * 0.1, 0.1, 0.02); l.add(at(box(0.12, 0.2, 0.13, M(0x2a2a3a)), 0, -0.05, 0)); l.add(at(box(0.13, 0.07, 0.17, M(0xf2f2f2)), 0, -0.14, 0.02)); body.add(l); return l; });
    const arms = [-1, 1].map(s => { const a = at(new THREE.Group(), s * 0.24, 0.52, 0); a.add(at(box(0.1, 0.3, 0.1, tee), 0, -0.13, 0)); a.add(at(box(0.09, 0.09, 0.09, F), 0, -0.3, 0)); body.add(a); return a; });
    // the lightstick in the right paw: a white handle, a glowing ball beyond the paw (purple, or gold with `gold`)
    const stick = at(new THREE.Group(), 0, -0.3, 0); arms[1].add(stick);
    stick.add(at(box(0.04, 0.22, 0.04, stickHandle), 0, -0.06, 0.06));
    const ballP = at(ico(0.075, 1, stickPurple), 0, -0.2, 0.06), ballG = at(ico(0.075, 1, stickGold), 0, -0.2, 0.06); stick.add(ballP); stick.add(ballG);
    const head = at(new THREE.Group(), 0, 0.8, 0); body.add(head);
    const skull = ico(0.24, 1, F); skull.scale.set(1, 0.9, 0.92); head.add(skull);
    const snout = at(ico(0.1, 1, M(0xf6ece0)), 0, -0.07, 0.19); snout.scale.set(1.1, 0.8, 0.9); head.add(snout);
    head.add(at(ico(0.035, 0, M(0x151515)), 0, -0.03, 0.28));
    const ek = i % 3;
    for (const e of [-1, 1]) {
      head.add(at(ico(0.038, 0, M(0x0e0e0e)), e * 0.1, 0.05, 0.19)); head.add(at(ico(0.012, 0, glow(0xffffff)), e * 0.1 + 0.012, 0.065, 0.225));
      head.add(ek === 0 ? rot(at(cone(0.08, 0.2, 4, F), e * 0.15, 0.27, 0), 0, 0, -e * 0.25) : ek === 1 ? at(box(0.08, 0.3, 0.06, F), e * 0.1, 0.33, 0) : rot(at(box(0.07, 0.24, 0.16, F), e * 0.24, 0.02, 0), 0, 0, e * 0.3));
    }
    return { g, body, head, arms, legs, ballP, ballG, i };
  }
  // the arms' rotations as [x, y, z] (z: the arm swung out and up, PI = straight up); row 0 is the front row
  function animFan(p, P, mode, bb, s, x, z, row) {
    const ph = (bb + p.i * 0.13) * PI, b = Math.abs(Math.sin(ph)), hb = bb >= 0 ? Math.exp(-fr(bb) * 5) : 0;
    const st = P.stare;
    p.g.rotation.y = st ? Math.atan2(st[0] - x, st[1] - z) : p.g.userData.yaw;
    p.body.rotation.set(0, 0, 0); p.body.position.set(0, 0, 0); p.head.rotation.set(0, 0, 0);
    let la = [0.05, 0, -0.12], ra = [0, 0, 0.12];
    if (mode === 'wave') { ra = [-0.25, 0, 2.5 + 0.45 * Math.sin((bb + p.i * 0.07) * PI)]; la = [0.1, 0, -0.2]; }
    else if (mode === 'cheer') { la = [0.35, 0, -(2.45 + 0.25 * b)]; ra = [0.35, 0, 2.45 + 0.25 * b]; p.body.position.y = 0.06 * b; }
    else if (mode === 'jump') { la = [0.3, 0, -2.6]; ra = [0.3, 0, 2.6]; p.body.position.y = 0.16 * Math.max(0, 1 - fr(bb) * 2.4); }
    else if (mode === 'howl') { ra = [-0.2, 0, 2.3]; la = [0.2, 0, -0.35]; p.head.rotation.x = -0.95 - 0.08 * Math.sin((bb + p.i * 0.2) * PI * 0.5); p.body.rotation.x = -0.12; }
    else if (mode === 'still') { ra = [-0.15, 0, 2.2]; }
    else if (mode === 'swoon') { la = [-1.2, 0, 0.42]; ra = [-1.2, 0, -0.42]; p.body.rotation.x = -0.28 - 0.05 * Math.sin((bb + p.i * 0.3) * PI * 0.5); p.head.rotation.x = -0.35; }
    // blown back by the speakers: the front rows lean away, arms flung back, for 1.6 s from `blown`
    if (P.blown != null && row <= 1) {
      const e = s - P.blown;
      if (e >= 0 && e < 1.6) { const w = Math.sin(cl(e / 1.6) * PI) * (row ? 0.6 : 1); p.body.rotation.x = -0.55 * w; la = [1.3 * w + la[0] * (1 - w), 0, -1.2 * w + la[2] * (1 - w)]; ra = [1.3 * w + ra[0] * (1 - w), 0, 1.2 * w + ra[2] * (1 - w)]; p.head.rotation.x = -0.3 * w; }
    }
    // the swoon: the front row falls flat on its back (in 0.45 s, staggered), paws on their hearts
    if (P.faint != null && row <= 1) {   // the two front rows: the first alone lay hidden under the barrier from the stage's edge
      const e = s - P.faint - (p.i % 4) * 0.12;
      if (e >= 0) { const w = sm(e / 0.45); p.body.rotation.x = -1.42 * w; p.body.position.y = 0.06 * w; la = [-0.9 * w, 0, -0.3]; ra = [-0.9 * w + ra[0] * (1 - w), 0, 0.3 * w + ra[2] * (1 - w)]; }
    }
    if (P.knock != null && row <= 1) {
      const e = s - P.knock - (6.6 - Math.abs(x)) * 0.03;
      if (e >= 0) { const w = sm(e / 0.3); p.body.rotation.x = -1.42 * w; p.body.position.y = 0.06 * w; la = [1.6 * w, 0, -1.4 * w]; ra = [1.6 * w, 0, 1.4 * w]; p.head.rotation.x = 0; }
    }
    p.arms[0].rotation.set(...la); p.arms[1].rotation.set(...ra);
    p.legs.forEach(l => { l.rotation.x = mode === 'jump' ? -0.3 * hb : 0; });
    p.ballP.visible = !P.gold; p.ballG.visible = !!P.gold;
    const pulse = 1 + 0.25 * hb; p.ballP.scale.setScalar(pulse); p.ballG.scale.setScalar(pulse);
  }

  // ---------- a pink heart (two lobes and a point), flat, both sides ----------
  const HEART_GEO = (() => { const sh = new THREE.Shape(); sh.moveTo(0, -0.9); sh.bezierCurveTo(-1.2, -0.1, -1.0, 0.95, 0, 0.45); sh.bezierCurveTo(1.0, 0.95, 1.2, -0.1, 0, -0.9); return new THREE.ShapeGeometry(sh, 6); })();

  // =====================================================================================================================
  function premiere() {
    const G = new THREE.Group();
    // ---------------- the night sky, the stars, the full moon, the city and the tower on its hill ----------------
    const skyT = tex(4, 64, x => { const gr = x.createLinearGradient(0, 0, 0, 64); gr.addColorStop(0, '#03041a'); gr.addColorStop(0.3, '#0a0a34'); gr.addColorStop(0.44, '#26164e'); gr.addColorStop(0.5, '#4a2a62'); gr.addColorStop(1, '#4a2a62'); x.fillStyle = gr; x.fillRect(0, 0, 4, 64); });
    G.add(new THREE.Mesh(new THREE.SphereGeometry(188, 16, 12), mat({ map: skyT, unlit: 1, nofog: 1, side: THREE.BackSide })));
    { const st = stars(160, 170, 3101, 0xffffff, 0.16); st.material = mat({ color: 0xffffff, unlit: 1, nofog: 1 }); G.add(st); }
    const moon = new THREE.Group(); G.add(moon);
    moon.add(new THREE.Mesh(new THREE.CircleGeometry(9, 20), mat({ color: 0xfff6dc, unlit: 1, nofog: 1 })));
    for (const [x, y, r] of [[-2.5, 2, 1.6], [3, -1.5, 1.2], [0.5, 3.8, 0.9], [-3.5, -3, 1.0]]) moon.add(at(new THREE.Mesh(new THREE.CircleGeometry(r, 10), mat({ color: 0xe8dcc0, unlit: 1, nofog: 1 })), x, y, 0.05));
    const MOON0 = [-26, 58, -128];
    const facades = [facade('#2a2c44', 3111, 0.5), facade('#34304a', 3112, 0.4), facade('#2c3448', 3113, 0.55)];
    for (let i = 0; i < 26; i++) {
      const a = -1.5 + i / 25 * 3.0 + (hash(i, 3114) - 0.5) * 0.08, d = 82 + hash(i, 3115) * 30, h = 18 + hash(i, 3116) * 34, w = 8 + hash(i, 3117) * 8;
      const b = at(new THREE.Mesh(new THREE.BoxGeometry(w, h, w), mat({ map: facades[i % 3], rep: [w / 4, h / 4], nofog: 1 })), Math.sin(a) * d, h / 2 - 2, -Math.cos(a) * d);
      b.rotation.y = -a; G.add(b);
    }
    {
      G.add(at(new THREE.Mesh(new THREE.SphereGeometry(30, 12, 6, 0, TAU, 0, PI / 2), M(0x0c1420, { nofog: 1 })), -44, -6, -118));
      const tw = new THREE.Group(); tw.position.set(-44, 22, -118); G.add(tw);
      tw.add(at(cyl(0.9, 1.4, 34, 8, M(0xd8d4e0, { nofog: 1, unlit: 0.3 })), 0, 17, 0));
      tw.add(at(cyl(4.2, 3.0, 4.5, 12, M(0xb8b4c8, { nofog: 1, unlit: 0.3 })), 0, 30, 0));
      tw.add(at(cyl(4.3, 4.3, 0.9, 12, glow(0xffd88a, 0.9, { nofog: 1 })), 0, 31, 0));
      tw.add(at(cyl(0.3, 0.5, 12, 6, M(0xe8e4f0, { nofog: 1 })), 0, 39, 0));
      tw.add(at(ico(0.7, 0, glow(0xff4060, 1, { nofog: 1 })), 0, 45.4, 0));
    }

    // ---------------- the stands: tiers in an arc behind the pit, a sea of lightstick dots ----------------
    const tierM = M(0x1a1628, { unlit: 0.05 });
    for (let r = 0; r < 6; r++) {
      const R = 15 + r * 3.2, y = 0.2 + r * 1.6;
      for (let j = 0; j < 14; j++) { const a = -1.35 + (j + 0.5) / 14 * 2.7, w = R * 2.7 / 14 + 0.3; const b = at(box(w, 1.6, 3.2, tierM), Math.sin(a) * R, y - 0.8, 2 + Math.cos(a) * R); b.rotation.y = a; G.add(b); }
    }
    const dotsP = [], dotsG = [];
    for (let i = 0; i < 900; i++) {
      const r = Math.floor(hash(i, 3121) * 6), R = 14.2 + r * 3.2 + hash(i, 3122) * 2.4, a = -1.32 + hash(i, 3123) * 2.64, y = 0.2 + r * 1.6 + 0.55 + hash(i, 3124) * 0.25;
      const m = at(new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.16, 0.16)), Math.sin(a) * R, y, 2 + Math.cos(a) * R);
      (i % 9 === 0 ? dotsG : dotsP).push(m);
    }
    const standP = merged(dotsP, glow(0xc890ff, 1)), standPG = merged(dotsP.map(m => m.clone()), glow(0xffc24a, 1)), standG = merged(dotsG, glow(0xffc24a, 1));
    G.add(standP); G.add(standPG); G.add(standG);

    // ---------------- the pit: dark concrete, the crowd barrier ----------------
    const pitT = tex(16, 16, (x, r) => { px(x, '#1e1c26', 0, 0, 16, 16); noise(x, r, 16, 16, ['#1a1822', '#24222c'], 40); }, 3125);
    G.add(flat(34, 22, mat({ map: pitT, rep: [10, 7] }), 0, PIT_Y, EDGE_Z + 11));
    const barrier = [];
    for (let x = -HALF_W + 0.4; x <= HALF_W - 0.39; x += 0.9) {
      barrier.push(at(new THREE.Mesh(new THREE.BoxGeometry(0.86, 0.05, 0.05)), x, PIT_Y + 1.0, BARRIER_Z));
      barrier.push(at(new THREE.Mesh(new THREE.BoxGeometry(0.04, 1.0, 0.04)), x - 0.43, PIT_Y + 0.5, BARRIER_Z));
      barrier.push(at(new THREE.Mesh(new THREE.BoxGeometry(0.86, 0.04, 0.04)), x, PIT_Y + 0.55, BARRIER_Z));
    }
    G.add(merged(barrier, M(0x8a8c98, { unlit: 0.2 })));

    // ---------------- the stage: a glossy navy floor in 2 m tiles with faint gold seams, a gold ring at its centre ----------------
    const floorT = tex(32, 32, (x, r) => { px(x, '#1c1838', 0, 0, 32, 32); noise(x, r, 32, 32, ['#201c40', '#1a1634', '#24204a'], 90); px(x, '#5a4a30', 0, 0, 32, 1); px(x, '#5a4a30', 0, 0, 1, 32); }, 3126);
    G.add(flat(HALF_W * 2, EDGE_Z - BACK_Z, mat({ map: floorT, rep: [HALF_W, (EDGE_Z - BACK_Z) / 2] }), 0, 0, (EDGE_Z + BACK_Z) / 2));
    const ring = new THREE.Mesh(new THREE.RingGeometry(1.15, 1.3, 32), glow(0xc8902a, 0.55)); ring.rotation.x = -PI / 2; ring.position.set(0, 0.004, 0.2);
    ring.material.polygonOffset = true; ring.material.polygonOffsetFactor = -2; G.add(ring);
    const hatch = flat(0.6, 0.6, M(0x0a0814), MIC_BASE[0], 0.004, MIC_BASE[1]); hatch.material.polygonOffset = true; hatch.material.polygonOffsetFactor = -3; G.add(hatch);
    // the stage's front face over the pit, an LED strip along its top edge
    G.add(at(box(HALF_W * 2, -PIT_Y, 0.1, M(0x120e1e)), 0, PIT_Y / 2, EDGE_Z + 0.05));
    const edgeLed = at(box(HALF_W * 2, 0.07, 0.04, glow(0xb070ff, 1)), 0, -0.05, EDGE_Z + 0.11); G.add(edgeLed);
    // the LED screen: a black frame, the face (logo / countdown / gold), the riser under it
    const SW = 13, SH = 3.1, SY = 1.05;
    G.add(at(box(SW + 0.5, SH + 0.5, 0.4, M(0x0a0812)), 0, SY + SH / 2, BACK_Z - 0.25));
    const screen = at(new THREE.Mesh(new THREE.PlaneGeometry(SW, SH), mat({ map: logoT, unlit: 1 })), 0, SY + SH / 2, BACK_Z - 0.03); G.add(screen);
    G.add(at(box(HALF_W * 2 + 2, 1.25, 0.3, M(0x16121e)), 0, 0.62, BACK_Z - 0.2));
    // the side towers at the front corners: LED faces that chase on the beat; the left one hides the wings
    const towerLeds = [];
    for (const s of [-1, 1]) {
      const tw = new THREE.Group(); tw.position.set(s * TOWER_X, 0, 1.4); G.add(tw);
      tw.add(at(box(1.1, 8.2, 1.8, M(0x14101e)), 0, 4.1 + PIT_Y / 2, 0));
      for (let j = 0; j < 7; j++) { const l = at(box(0.9, 0.85, 0.04, glow(0x8a4ad8, 1)), 0, 0.7 + j * 1.05, 0.92); tw.add(l); towerLeds.push([l, j, s]); }
    }
    // the truss over the stage, its lamps
    const trussM = M(0x9a9aa8, { unlit: 0.2 });
    for (const z of [-3.6, 1.6]) G.add(at(box(HALF_W * 2 + 1, 0.3, 0.3, trussM), 0, 8.6, z));
    for (const x of [-HALF_W - 0.4, HALF_W + 0.4]) G.add(at(box(0.3, 0.3, 5.5, trussM), x, 8.6, -1.0));
    for (let i = 0; i < 8; i++) G.add(at(cyl(0.16, 0.2, 0.36, 6, M(0x2a2a34)), -6.3 + i * 1.8, 8.3, 1.6));
    // searchlight beams behind the screen, sweeping the sky
    const beams = [];
    for (let i = 0; i < 6; i++) {
      const b = new THREE.Group(); b.position.set(-9 + i * 3.6, 1.0, BACK_Z - 1.6); G.add(b);
      const c = at(cone(1.4, 30, 8, glow(i % 2 ? 0xd8b0ff : 0xffe2a0, 1, { see: 0.82, nofog: 1 })), 0, 15, 0); c.rotation.x = PI; b.add(c); beams.push(b);
    }
    // ---------------- the speaker stacks, their cones, the smoke and sparks of the blow-out ----------------
    const stacks = SPEAKERS.map(([sx, sz], si) => {
      const g = new THREE.Group(); g.position.set(sx, 0, sz); g.rotation.y = -Math.sign(sx) * 0.25; G.add(g);
      const cones = [];
      for (let j = 0; j < 3; j++) {
        g.add(at(box(1.15, 0.9, 0.8, M(0x2c2a34)), 0, 0.45 + j * 0.92, 0));
        g.add(at(box(1.17, 0.05, 0.05, M(0x8a8a96, { unlit: 0.3 })), 0, 0.9 + j * 0.92, 0.4));   // a grey trim along each box's top front edge
        for (const cx of [-0.27, 0.27]) {
          const c = rot(at(cyl(0.21, 0.24, 0.06, 12, M(0x6a6a78)), cx, 0.45 + j * 0.92, 0.41), PI / 2, 0, 0); g.add(c); cones.push(c);
          g.add(rot(at(cyl(0.07, 0.07, 0.07, 8, M(0x5a5a66)), cx, 0.45 + j * 0.92, 0.44), PI / 2, 0, 0));
        }
      }
      const led = at(box(0.9, 0.05, 0.02, glow(0x5ae0ff, 0.9)), 0, 2.72, 0.41); g.add(led);
      const smoke = []; for (let q = 0; q < 9; q++) { const m = ico(0.4, 1, M(0xb4b2bc, { unlit: 0.55 })); g.add(m); smoke.push(m); }
      const sparks = []; for (let q = 0; q < 28; q++) { const m = box(0.09, 0.09, 0.09, glow(q % 3 ? 0xffa030 : 0xfff0a0)); g.add(m); sparks.push(m); }
      return { g, cones, led, smoke, sparks, si };
    });
    // ---------------- the centre mic stand (it rises out of the hatch) ----------------
    const micG = new THREE.Group(); G.add(micG);
    const metal = M(0xb8bcc8, { unlit: 0.3 }), black = M(0x14141a), chrome = M(0xe8ecf4, { unlit: 0.45 });
    micG.add(at(cyl(0.16, 0.17, 0.03, 10, black), MIC_BASE[0], 0.015, MIC_BASE[1]));
    micG.add(at(cyl(0.014, 0.014, MIC[1] - 0.06, 5, metal), MIC_BASE[0], (MIC[1] - 0.06) / 2, MIC_BASE[1]));
    {
      const m = at(new THREE.Group(), MIC[0], MIC[1] - 0.05, MIC_BASE[1]); m.rotation.x = -0.95; micG.add(m);
      m.add(at(cyl(0.018, 0.024, 0.14, 6, black), 0, 0.06, 0)); m.add(at(ico(0.042, 1, chrome), 0, 0.15, 0)); m.add(at(cyl(0.045, 0.045, 0.012, 8, glow(GOLD, 0.6)), 0, 0.11, 0));
    }
    // ---------------- confetti cannons at the front corners, the confetti ----------------
    for (const s of [-1, 1]) G.add(rot(at(cyl(0.16, 0.2, 0.9, 8, M(0x2a2a34)), s * 5.2, 0.4, 1.9), 0.5, 0, s * 0.35));
    const confM = [glow(0xff9f1c, 0.85, { side: THREE.DoubleSide }), glow(0xf6f2ff, 0.8, { side: THREE.DoubleSide }), glow(LILAC, 0.85, { side: THREE.DoubleSide })];   // amber, not the karaoke's yellow (ksync)
    const confetti = []; for (let i = 0; i < 140; i++) { const m = new THREE.Mesh(new THREE.PlaneGeometry(0.09, 0.06), confM[i % 3]); G.add(m); confetti.push(m); }
    // ---------------- the golden barrier: a geodesic dome of gold bars over the arena ----------------
    const dome = new THREE.Group(); dome.position.set(0, PIT_Y, 0.35); G.add(dome);   // centred on the singer's mark: it bursts out of the stage from him
    {
      const ig = new THREE.IcosahedronGeometry(1, 3), pos = ig.attributes.position, seen = new Set(), bars = [], R = 34;
      const v = j => new THREE.Vector3(pos.getX(j), pos.getY(j), pos.getZ(j));
      for (let j = 0; j < pos.count; j += 3) for (const [a, b] of [[j, j + 1], [j + 1, j + 2], [j + 2, j]]) {
        const A = v(a), B = v(b); if (A.y < -0.02 || B.y < -0.02) continue;
        const key = [A, B].map(p => p.toArray().map(n => n.toFixed(3)).join(',')).sort().join('|'); if (seen.has(key)) continue; seen.add(key);
        const m = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.16, A.distanceTo(B) * R));
        m.position.copy(A).add(B).multiplyScalar(R / 2); m.lookAt(B.clone().multiplyScalar(R)); bars.push(m);
      }
      dome.add(merged(bars, glow(0xffc040, 1, { nofog: 1 })));
      dome.add(new THREE.Mesh(new THREE.SphereGeometry(R * 0.995, 24, 10, 0, TAU, 0, PI / 2), glow(0xffcf60, 1, { see: 0.8, nofog: 1, side: THREE.DoubleSide })));
      dome.add(rot(at(new THREE.Mesh(new THREE.TorusGeometry(R, 0.5, 4, 48), glow(0xfff0b0, 1, { nofog: 1 })), 0, 0.2, 0), PI / 2, 0, 0));
    }
    // ---------------- the howl's rings of sound, hearts over the crowd, the tennis ball ----------------
    const rings = []; for (let i = 0; i < 12; i++) { const m = new THREE.Mesh(new THREE.TorusGeometry(1, 0.035, 4, 24), glow(0xffd05a, 1, { nofog: 1 })); m.rotation.x = PI / 2; G.add(m); rings.push(m); }
    const hearts = []; for (let i = 0; i < 14; i++) { const m = new THREE.Mesh(HEART_GEO, glow(0xff7ab8, 0.95, { side: THREE.DoubleSide })); G.add(m); hearts.push(m); }
    const beamM = glow(0xfff2c8, 1, { see: 0.74, nofog: 1, side: THREE.DoubleSide });
    const spotCone = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.62, 5.0, 14, 1, true), beamM); G.add(spotCone);   // the shaft stops 1.85 m up: through a head, its dither veiled the singer
    const spotPool = new THREE.Mesh(new THREE.CircleGeometry(0.95, 18), glow(0xfff0c0, 0.55)); spotPool.rotation.x = -PI / 2; spotPool.material.polygonOffset = true; spotPool.material.polygonOffsetFactor = -4; G.add(spotPool);
    const ball = new THREE.Group(); G.add(ball);
    ball.add(ico(0.15, 1, M(0xd8f02a, { unlit: 0.55 }))); ball.add(rot(new THREE.Mesh(new THREE.TorusGeometry(0.145, 0.016, 4, 14), glow(0xffffff, 0.6)), 0.6, 0, 0));   // big enough to follow across a wide

    // ---------------- the wings, stage left: the floor, a black flat, the throne, a flight case, the power box ----------------
    const [wx0, wx1, wz0, wz1] = WING;
    G.add(flat(wx1 - wx0, wz1 - wz0, M(0x2a2630), (wx0 + wx1) / 2, 0, (wz0 + wz1) / 2));
    G.add(at(box(wx1 - wx0, 4.2, 0.2, M(0x0e0c14)), (wx0 + wx1) / 2, 2.1, wz0));
    G.add(at(box(0.2, 4.2, wz1 - wz0, M(0x16141c)), wx0, 2.1, (wz0 + wz1) / 2));
    G.add(at(box(wx1 - wx0 + 0.4, -PIT_Y, 0.1, M(0x120e1e)), (wx0 + wx1) / 2, PIT_Y / 2, wz1 + 0.05));
    {
      const th = new THREE.Group(); th.position.set(THRONE[0], 0, THRONE[1]); th.rotation.y = PI / 2; G.add(th);   // facing +x, towards the stage
      const goldM = M(0xe0a830, { unlit: 0.35 }), velvet = M(0xb01838, { unlit: 0.15 });
      th.add(at(box(0.62, THRONE_Y - 0.08, 0.56, goldM), 0, (THRONE_Y - 0.08) / 2, 0));
      th.add(at(box(0.56, 0.08, 0.5, velvet), 0, THRONE_Y - 0.04, 0.01));
      th.add(at(box(0.66, 1.25, 0.1, goldM), 0, THRONE_Y + 0.55, -0.28)); th.add(at(box(0.5, 0.95, 0.04, velvet), 0, THRONE_Y + 0.52, -0.22));
      for (const s of [-1, 1]) { th.add(at(box(0.08, 0.22, 0.5, goldM), s * 0.33, THRONE_Y + 0.12, 0)); th.add(at(ico(0.07, 0, goldM), s * 0.31, THRONE_Y + 1.22, -0.28)); }
      th.add(at(cone(0.09, 0.2, 4, goldM), 0, THRONE_Y + 1.3, -0.28));
    }
    {
      const fc = new THREE.Group(); fc.position.set(CASE[0], 0, CASE[1]); G.add(fc);
      fc.add(at(box(0.7, 0.55, 0.5, M(0x1a1a20)), 0, 0.275, 0));
      for (const y of [0.02, 0.53]) fc.add(at(box(0.72, 0.04, 0.52, M(0xb8bcc8, { unlit: 0.3 })), 0, y, 0));
    }
    {
      const pb = new THREE.Group(); pb.position.set(SOCKET[0] - 0.05, 0, SOCKET[2]); G.add(pb);
      pb.add(at(box(0.3, 1.3, 0.7, M(0x6a6e78)), -0.12, 0.65, 0));
      pb.add(at(box(0.04, 0.18, 0.2, M(0x2a2a30)), 0.05, SOCKET[1], 0));
      pb.add(at(box(0.02, 0.3, 0.3, M(0xffd21f, { unlit: 0.3 })), 0.04, 1.0, 0));   // a hazard plate
    }
    G.add(at(box(0.2, 0.16, 0.2, M(0x2a2a30)), -9.6, 3.6, -2.7)); G.add(at(box(0.16, 0.04, 0.16, glow(0xfff4d8, 1)), -9.6, 3.51, -2.66));   // a clamp work light

    // ---------------- the fans: five rows in the pit, the QUEEN banner in the front row ----------------
    const fans = [];
    for (let r = 0; r < 5; r++) for (let c = 0; c < 11; c++) {
      const x = -6.0 + c * 1.2 + (r % 2) * 0.55 + (hash(r, c + 3130) - 0.5) * 0.3, z = BARRIER_Z + 0.55 + r * 1.15 + (hash(c, r + 3131) - 0.5) * 0.25;
      if (Math.abs(x) > 6.6) continue;
      const p = fan(r * 11 + c); p.g.position.set(x, PIT_Y, z); p.g.userData.yaw = PI + (hash(r, c + 3132) - 0.5) * 0.4 + Math.atan2(x, 9) * 0.6; G.add(p.g); fans.push({ p, x, z, r });
    }
    const bannerT = tex(64, 20, x => { px(x, '#f8f2ff', 0, 0, 64, 20); px(x, '#ff5aa8', 0, 0, 64, 2); px(x, '#ff5aa8', 0, 18, 64, 2); x.font = 'bold 14px monospace'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillStyle = '#e8287a'; x.fillText('QUEEN', 32, 11); });
    const banner = new THREE.Group(); banner.position.set(-1.7, PIT_Y + 1.25, BARRIER_Z + 0.42); G.add(banner);
    banner.add(at(new THREE.Mesh(new THREE.PlaneGeometry(1.25, 0.42), mat({ map: bannerT, unlit: 0.6 })), 0, 0, 0.01));
    banner.add(rot(at(new THREE.Mesh(new THREE.PlaneGeometry(1.25, 0.42), mat({ map: bannerT, unlit: 0.6 })), 0, 0, -0.01), 0, PI, 0));
    for (const s of [-1, 1]) banner.add(at(box(0.04, 1.1, 0.04, M(0xd8d8e0)), s * 0.64, -0.3, 0));

    let lastScreen = null;
    const setScreen = T => { if (lastScreen !== T) { screen.material.uniforms.map.value = T; lastScreen = T; } };
    return {
      group: G, sky: skyT, shadowCol: 0x0c0a18,
      light() {
        lights(0x4a3a6a, 0xc0b0e0, [0.15, -0.55, -0.82], 0x0a0818, [30, 150], 9);
        pt(0, 0, 4.6, 3.2, 1.15, 0.86, 0.52);      // the gold wash over the stage's front
        pt(1, 0, 3.0, -3.6, 0.6, 0.32, 0.95);      // the screen's purple glow
        pt(2, 0, 2.0, 7.0, 0.55, 0.36, 0.8);       // the pit
        pt(3, -9.5, 3.2, -1.2, 0.85, 0.82, 0.8);   // the wings' work light
      },
      anim(t, P = {}) {
        const s = shotT(t, P), bb = beat(t), hb = bb >= 0 ? Math.exp(-fr(bb) * 5) : 0;
        if (P.key) pt(3, P.key[0], P.key[1], P.key[2], P.key[3], P.key[4], P.key[5]);
        const dark = P.blackout != null && s >= P.blackout;
        const flick = P.blackout != null && s >= P.blackout - 0.16 && s < P.blackout ? (fr((s - P.blackout) * 12) < 0.5 ? 0.3 : 1) : 1;
        // the screen: the logo pulsing on the beat, the countdown, the gold shimmer, or off
        const mode = dark ? 'off' : P.screen || 'logo';
        if (mode === 'count') { const c = Array.isArray(P.count) ? 9 - Math.floor((bb - P.count[0]) / P.count[1]) : (P.count ?? 9); setScreen(countT[Math.max(0, Math.min(9, c))]); }   // count: [the kit beat showing 9, beats per step]
        else setScreen(mode === 'gold' ? goldT : mode === 'off' ? offT : logoT);
        screen.material.uniforms.uCol.value.setScalar(mode === 'off' ? 1 : (0.82 + 0.22 * hb) * (P.hush ? 0.45 : 1) * flick);
        edgeLed.visible = !dark; edgeLed.material.uniforms.uCol.value.setRGB(0.69 + 0.3 * hb, 0.44, 1.0);
        towerLeds.forEach(([l, j, sd]) => { const on = !dark && ((Math.floor(bb) + j + (sd > 0 ? 2 : 0)) % 4 === 0 || hb > 0.6); l.material.uniforms.uCol.value.setRGB(on ? 0.9 : 0.25, on ? 0.55 : 0.12, on ? 1.0 : 0.45); });
        beams.forEach((b, i) => { b.visible = !dark && !P.hush; b.rotation.set(0.25 * Math.sin(t * 0.7 + i), 0, 0.45 * Math.sin(t * 0.5 + i * 1.3)); });
        if (dark || P.hush) { U.uAmb.value.multiplyScalar(dark ? 0.25 : 0.55); U.uDirCol.value.multiplyScalar(dark ? 0.15 : 0.5); for (const q of [0, 1, 2]) U.uPtCol.value[q].multiplyScalar(dark ? 0.05 : 0.35); if (dark) U.uPtCol.value[3].multiplyScalar(0.4); }
        if (dark && P.dome) { U.uAmb.value.setRGB(0.42, 0.32, 0.14); U.uDirCol.value.setRGB(0.55, 0.42, 0.18); U.uDirDir.value.set(0.1, -0.35, 0.93).normalize(); }   // the dome's glow lights the dark arena from behind the crowd
        if (flick < 1) U.uAmb.value.multiplyScalar(flick);
        // the moon (turned to the arena)
        const mp = P.moon || MOON0; moon.position.set(mp[0], mp[1], mp[2]); moon.lookAt(0, 1, 2);
        // the mic: rising out of its hatch over [s, s + dur]
        const mic = P.mic === undefined ? true : P.mic;
        micG.visible = mic !== false; micG.position.y = (Array.isArray(mic) ? -1.2 * (1 - sm((s - mic[0]) / (mic[1] || 0.6))) : 0) - (P.micDrop || 0);   // micDrop: the stand sunk into its hatch for a singer leaning in low
        // the spotlight: its pool lit by the third point light (the pit's), from over the stage's front
        const spots = P.spot ? (Array.isArray(P.spot[0]) ? P.spot : [P.spot]) : [];
        if (spots.length && !dark) { const [sx, sz] = spots[0]; pt(2, sx, 3.4, sz + 0.6, 1.5, 1.3, 1.0); }
        spotCone.visible = false; spotPool.visible = spots.length > 0 && !dark;   // the pool only: a dithered beam veiled whoever stood in it, cut short it hung like a lampshade
        if (spotCone.visible) { const [sx, sz] = spots[0]; spotCone.position.set(sx, 4.35, sz); spotPool.position.set(sx, 0.008, sz); }
        // the speakers: cones pumping on the beat; the blow-out
        stacks.forEach(st => {
          const be = P.blow != null ? s - P.blow : -1, blown = be >= 0;
          st.cones.forEach(c => c.scale.set(1, 1 + (blown ? 2.2 : 0.7 * hb), 1));
          st.led.visible = !blown && !dark;
          st.g.rotation.z = blown && be < 0.6 ? 0.05 * Math.sin(be * 40) * (1 - be / 0.6) : 0;
          st.smoke.forEach((m, q) => {
            if (!blown) { m.visible = false; return; }
            const ph = (be * 0.55 + q / st.smoke.length) % 1;
            m.visible = true; m.position.set((hash(q, st.si + 3140) - 0.5) * 0.9, 1.6 + ph * 3.2, 0.55 + ph * 0.8); m.scale.setScalar(0.25 + ph * 1.3);
          });
          st.sparks.forEach((m, q) => {
            const e = be - (q % 6) * 0.06; if (!blown || e > 1.4 || e < 0) { m.visible = false; return; }
            const a = hash(q, st.si + 3141) * TAU, v = 1.6 + hash(q, st.si + 3142) * 2.2;
            m.visible = true; m.position.set(Math.cos(a) * v * e * 0.6, 1.4 + 2.6 * e - 4.9 * e * e + 0.9 * hash(q, 3143), 0.5 + Math.abs(Math.sin(a)) * v * e);
          });
        });
        // confetti: from `confetti` s, raining over the stage and lying on it
        confetti.forEach((m, i) => {
          if (P.confetti == null) { m.visible = false; return; }
          const e = s - P.confetti - hash(i, 3150) * 0.7; if (e < 0) { m.visible = false; return; }
          const x0 = (hash(i, 3151) - 0.5) * 12, z0 = -3.4 + hash(i, 3152) * 5.4, y0 = 6 + hash(i, 3153) * 4.5, v = 1.0 + hash(i, 3154) * 0.6;
          const y = Math.max(0.012, y0 - v * e), landed = y <= 0.012;
          m.visible = true; m.position.set(x0 + (landed ? 0 : 0.3 * Math.sin(e * 2.2 + i)), y, z0 + (landed ? 0 : 0.2 * Math.cos(e * 1.7 + i)));
          if (landed) m.rotation.set(-PI / 2, 0, i); else m.rotation.set(e * 5 + i, e * 3.7 + i * 2, 0);
        });
        // the golden dome, pulsing a little on the beat
        const dv = P.dome == null || P.dome === false ? 0 : Array.isArray(P.dome) ? sm((s - P.dome[0]) / (P.dome[1] || 1.2)) : P.dome;
        dome.visible = dv > 0.005; dome.scale.setScalar(Math.max(0.01, dv) * (1 + 0.012 * hb));
        // the howl's rings: one every 0.2 s from `waves`, each growing and rising for 0.9 s
        const W = !P.waves ? [] : Array.isArray(P.waves[0]) ? P.waves : [P.waves];
        rings.forEach((m, i) => {
          const em = W[i % Math.max(1, W.length)], k = Math.floor(i / Math.max(1, W.length));
          if (!em || k > 5) { m.visible = false; return; }
          const [w0, wx, wy, wz, col, dir] = em, e = s - w0, age = (e - k * 0.2) % 1.2;
          if (e < k * 0.2 || age > 0.9) { m.visible = false; return; }
          m.visible = true; m.material.uniforms.uCol.value.setHex(col || 0xffd05a);
          if (Array.isArray(dir)) { m.position.set(wx + dir[0] * age * 2.2, wy + dir[1] * age * 2.2, wz + dir[2] * age * 2.2); m.lookAt(m.position.x + dir[0], m.position.y + dir[1], m.position.z + dir[2]); m.scale.setScalar(0.15 + age * 0.9); }   // blasted along dir (at the lens), facing it
          else if (dir === 'fwd') { m.rotation.set(0, 0, 0); m.position.set(wx, wy + age * 0.15, wz + age * 2.2); m.scale.setScalar(0.15 + age * 0.9); }
          else { m.rotation.set(PI / 2, 0, 0); m.position.set(wx, wy + age * 1.6, wz + age * 0.25); m.scale.setScalar(0.18 + age * 1.5); }
        });
        // hearts rising over the crowd
        hearts.forEach((m, i) => {
          if (P.hearts == null) { m.visible = false; return; }
          const e = s - P.hearts - (i % 7) * 0.18; if (e < 0 || e > 2.6) { m.visible = false; return; }
          const x = -5 + hash(i, 3160) * 10, z = BARRIER_Z + 0.7 + hash(i, 3161) * 1.0;
          m.visible = true; m.position.set(x + 0.15 * Math.sin(e * 3 + i), PIT_Y + 0.6 + e * 0.25, z); m.scale.setScalar(0.22 * sm(e / 0.3)); m.rotation.set(0, 0, 0.2 * Math.sin(e * 4 + i));
        });
        // the tennis ball's keyframes
        const kf = P.ball;
        if (kf && kf.length > 1 && s >= kf[0][0] && s <= kf[kf.length - 1][0]) {
          let j = 0; while (j < kf.length - 2 && s > kf[j + 1][0]) j++;
          const [a0, ax, ay, az] = kf[j], [b0, bx, by, bz] = kf[j + 1], u = cl((s - a0) / Math.max(0.001, b0 - a0));
          ball.visible = true; ball.position.set(ax + (bx - ax) * u, ay + (by - ay) * u, az + (bz - az) * u); ball.rotation.set(s * 9, s * 5, 0);
        } else ball.visible = false;
        // the fans
        const fm = P.fans || 'wave';
        fans.forEach(({ p, x, z, r }) => { p.g.visible = !P.noguests && !cleared(P, x, z); if (p.g.visible) animFan(p, P, fm, bb, s, x, z, r); });
        banner.visible = !!P.banner && !P.noguests;
        standP.visible = !P.gold; standPG.visible = !!P.gold;
      },
    };
  }

  return { premiere: premiere() };
}
