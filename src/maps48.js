// maps48.js: the "Every Breath You Take" map (2026-10-14 2nd, The Police, 1983; the clip: a black-and-white sound stage
// in hard light, the singer at his upright bass, a grand piano silhouetted before a tall arched window with a round pane,
// a window washer in a fedora on his cradle behind the glass wiping all song long, a string section, a drummer behind a
// glowing bass drum, a chandelier, and a table top in a shaft of light). Same contract as the other map files, pure in t:
//   soundstage  the set at night, in black, white and greys (the cast keeps its colours): a dark glossy floor at y = 0,
//         black walls, the back wall at Z0 with the arched window (WIN: 4.2 m wide, straight sides to WIN.H, a round arch
//         over them, the round pane ROSE in it) glowing white behind a see-through pane; behind the glass the washer's
//         cradle (`cradle` y: its floor, default 1.2; CRADLE.z its depth) with a box-pet washer in a fedora (`washer`
//         'wipe' (the squeegee across the glass on the beat) / 'stare' (leaning in, his face to the glass) / false); an
//         actor standing on it with `lift` = the cradle's y and its mark at CRADLE.z presses its face to the glass.
//         The band: the grand piano (PIANO, its keyboard on its +x side at KEYS_Y, Sadi's bench mark PIANIST facing -x,
//         seat BENCH_Y), the drum kit at 0.8 scale (DRUMS, the bass drum's front head glowing white, Compote's stool
//         DRUMMER facing +z, seat STOOL_Y), four box-pet violinists on stools (VIOLINS; `strings` 'play' / 'swell' (leaning
//         in, sawing hard, heads tilted: the tragic swell) / 'stare' (bows down, heads to `stare`) / false), a crystal
//         chandelier (CHANDELIER). The diner: the cat's café table (TABLE, a white cloth, top TABLE_Y) with her plate
//         (PLATE) and the fish on it (`plateFish` false: gone), a glass of milk, a candle, her bentwood chair (KOB: her
//         mark, facing +z, seat SEAT_Y), a shaft of light slanting down onto it (`shaft` false hides it), steam rising off
//         the fish (`steam`). The singer's upright bass (`bass` [x, z, yaw, tilt]: standing on its endpin, its front to
//         yaw, tilted back `tilt` deg; `bassFall` [s, dir deg]: it topples over that way and lies on the floor from then).
//         `hearts` [[x, y, z, s0, loop]] + `heartYaw` + `heartScale`; `stare` [x, z] (the box pets' heads turn there); `hide`
//         ['table', 'chair', 'piano', 'drums', 'strings', 'chandelier', 'shaft', 'milk', 'candle', 'plate', 'cradle'];
//         `clear` [[x, z, r]] hides the box pets there; `key` [x, y, z, r, g, b] a light for a corner; `glass` false
//         takes the window's pane away (a lens close to it).
import { mapKit } from './mapkit.js';

export const SOUNDSTAGE = {
  X0: -8, X1: 8, Z0: -9.0, Z1: 6, H: 7.5,
  WIN: { x: 0, w: 4.2, y0: 0.25, H: 4.4, R: 2.1 }, ROSE: [0, 4.55, 0.8],
  CRADLE: { z: -9.48, w: 2.4, y: 1.2 },
  PIANO: [-2.75, -7.0], KEYS_X: -2.13, KEYS_Y: 0.62, PIANIST: [-1.72, -7.0], BENCH_Y: 0.42,
  DRUMS: [2.7, -6.95], DRUMMER: [2.7, -7.55], STOOL_Y: 0.4,
  VIOLINS: [[-5.0, -3.4], [-4.3, -4.25], [-3.55, -5.0], [-5.55, -4.75]],
  CHANDELIER: [0, 5.2, -3.6],
  TABLE: [1.7, -1.7], TABLE_R: 0.42, TABLE_Y: 0.72,
  PLATE: [1.7, -1.42], KOB: [1.7, -2.5], SEAT_Y: 0.42,
  SINGER: [0, -5.0],
};

export function buildSoundstageMaps(K) {
  const k = mapKit(K);
  const { THREE, mat, tex, px, noise, box, TAU, PI, beat, cyl, cone, ico, at, rot, flat, lights, pt } = k;
  const M = (c, o = {}) => mat({ color: c, ...o }), glow = (c, u = 1) => mat({ color: c, unlit: u });
  const cl = x => Math.max(0, Math.min(1, x));
  const shotT = (t, P) => P.t0 != null ? t - P.t0 : 0;
  const S = SOUNDSTAGE;

  // ---------- textures ----------
  const floorT = tex(32, 32, (x, r) => { px(x, '#16161a', 0, 0, 32, 32); noise(x, r, 32, 32, ['#141418', '#19191e', '#1b1b20'], 160); for (let i = 0; i < 32; i += 8) px(x, '#202026', 0, i, 32, 1); }, 4801);
  const wallT = tex(16, 16, (x, r) => { px(x, '#101014', 0, 0, 16, 16); noise(x, r, 16, 16, ['#0e0e12', '#131318'], 40); }, 4802);
  const clothT = tex(16, 16, (x, r) => { px(x, '#eeeeea', 0, 0, 16, 16); noise(x, r, 16, 16, ['#e6e6e2', '#f4f4f0'], 30); for (let i = 0; i < 16; i += 4) px(x, '#d8d8d4', i, 0, 1, 16); }, 4803);
  const keysT = tex(32, 4, x => { px(x, '#f4f4ee', 0, 0, 32, 4); for (let i = 0; i < 32; i += 2) px(x, '#9a9a96', i, 0, 1, 4); for (const i of [1, 3, 7, 9, 11, 15, 17, 21, 23, 25, 29, 31]) px(x, '#141414', i, 0, 1, 2); }, 4804);
  const headT = tex(32, 32, x => {   // the bass drum's front head: white, a dark paw in a ring
    px(x, '#f6f6f2', 0, 0, 32, 32); x.strokeStyle = '#26262a'; x.lineWidth = 2; x.beginPath(); x.arc(16, 16, 12, 0, TAU); x.stroke();
    x.fillStyle = '#26262a'; x.beginPath(); x.ellipse(16, 19, 5, 4, 0, 0, TAU); x.fill();
    for (const [a, b] of [[10, 12], [14, 9], [18, 9], [22, 12]]) { x.beginPath(); x.ellipse(a, b, 2, 2.4, 0, 0, TAU); x.fill(); }
  }, 4805);

  function soundstage() {
    const G = new THREE.Group();
    const W = S.X1 - S.X0, D = S.Z1 - S.Z0, ZC = (S.Z0 + S.Z1) / 2;
    G.add(flat(W, D, mat({ map: floorT, rep: [W / 1.6, D / 1.6], unlit: 0.06 }), 0, 0, ZC));
    // the walls: black; the back wall with the arched window cut out of it (a shape with an arched hole)
    const wallM = mat({ map: wallT, rep: [4, 4], unlit: 0.02 });
    const side = (x, ry) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(D, S.H), wallM); m.position.set(x, S.H / 2, ZC); m.rotation.y = ry; G.add(m); };
    side(S.X0, PI / 2); side(S.X1, -PI / 2);
    const front = new THREE.Mesh(new THREE.PlaneGeometry(W, S.H), wallM); front.position.set(0, S.H / 2, S.Z1); front.rotation.y = PI; G.add(front);
    const { x: wx, w: ww, y0: wy0, H: wh, R: wr } = S.WIN;
    const shape = new THREE.Shape(); shape.moveTo(S.X0, 0); shape.lineTo(S.X1, 0); shape.lineTo(S.X1, S.H); shape.lineTo(S.X0, S.H); shape.lineTo(S.X0, 0);
    const hole = new THREE.Path(); hole.moveTo(wx - ww / 2, wy0); hole.lineTo(wx + ww / 2, wy0); hole.lineTo(wx + ww / 2, wh);
    hole.absarc(wx, wh, wr, 0, PI, false); hole.lineTo(wx - ww / 2, wy0); shape.holes.push(hole);
    const back = new THREE.Mesh(new THREE.ShapeGeometry(shape, 12), M(0x111115, { unlit: 0.03 })); back.position.z = S.Z0; G.add(back);
    // the window: the white light behind it, its frame and bars, the round pane, a see-through pane with glints
    const sky = new THREE.Mesh(new THREE.PlaneGeometry(9, 9), glow(0xf8f8f4, 1)); sky.position.set(0, 4.0, S.Z0 - 2.4); G.add(sky);
    const frameM = M(0x1a1a1e, { unlit: 0.05 }), barM = M(0x24242a, { unlit: 0.08 });
    const winG = new THREE.Group(); G.add(winG);
    for (const s of [-1, 1]) winG.add(at(box(0.16, wh - wy0, 0.12, frameM), wx + s * (ww / 2 + 0.05), (wh + wy0) / 2, S.Z0 + 0.02));
    winG.add(at(box(ww + 0.3, 0.14, 0.14, frameM), wx, wy0, S.Z0 + 0.04));   // the sill
    for (let i = 0; i <= 16; i++) { const a = i / 16 * PI, b = at(box(0.16, 0.16, 0.12, frameM), wx + Math.cos(a) * (wr + 0.05), wh + Math.sin(a) * (wr + 0.05), S.Z0 + 0.02); b.rotation.z = a; winG.add(b); }
    winG.add(at(box(0.07, wh - wy0, 0.06, barM), wx, (wh + wy0) / 2, S.Z0 - 0.02));            // the middle bar
    for (const y of [1.45, 2.65, 3.75]) winG.add(at(box(ww, 0.06, 0.06, barM), wx, y, S.Z0 - 0.02));
    const [rx, ry, rr] = S.ROSE;
    const ring = new THREE.Mesh(new THREE.TorusGeometry(rr, 0.07, 6, 28), barM); ring.position.set(rx, ry, S.Z0 - 0.02); winG.add(ring);
    for (let i = 1; i < 8; i += 2) { const b = at(box(0.05, 2 * rr, 0.05, barM), rx, ry, S.Z0 - 0.02); b.rotation.z = i / 8 * PI; winG.add(b); }
    for (let i = 0; i <= 8; i++) { const a = i / 8 * PI, m = (rr + wr) / 2, b = at(box(0.05, wr - rr, 0.05, barM), wx + Math.cos(a) * m, wh + Math.sin(a) * m, S.Z0 - 0.02); b.rotation.z = a - PI / 2; winG.add(b); }
    const paneM = mat({ color: 0xe8eef4, unlit: 0.5, see: 0.9 });
    const pane = new THREE.Mesh(new THREE.PlaneGeometry(ww, wh - wy0 + wr), paneM); pane.position.set(wx, (wh - wy0 + wr) / 2 + wy0, S.Z0 + 0.005); G.add(pane);
    const glintM = mat({ color: 0xffffff, unlit: 1, see: 0.55 });
    const glints = [[-1.4, 1.0, 0.5], [1.3, 3.3, 0.35]].map(([x, y, w]) => { const g = new THREE.Mesh(new THREE.PlaneGeometry(w, 0.05), glintM); g.position.set(wx + x, y, S.Z0 + 0.01); g.rotation.z = 0.7; G.add(g); return g; });
    // the washer's cradle behind the glass: a platform, its rails, two cables up out of sight
    const cradle = new THREE.Group(); G.add(cradle);
    const steel = M(0x2a2a30, { unlit: 0.05 });
    cradle.add(at(box(S.CRADLE.w, 0.08, 0.6, steel), 0, -0.04, 0));
    for (const s of [-1, 1]) { cradle.add(at(box(0.05, 0.45, 0.05, steel), s * S.CRADLE.w / 2, 0.22, 0.26)); cradle.add(at(box(0.05, 1.0, 0.05, steel), s * S.CRADLE.w / 2, 0.5, -0.26)); cradle.add(at(box(0.03, 8, 0.03, steel), s * (S.CRADLE.w / 2 - 0.1), 4.0, 0)); }
    cradle.add(at(box(S.CRADLE.w, 0.05, 0.05, steel), 0, 1.0, -0.26)); cradle.add(at(box(S.CRADLE.w, 0.05, 0.05, steel), 0, 0.55, -0.26));
    cradle.add(at(box(S.CRADLE.w, 0.05, 0.05, steel), 0, 0.42, 0.26));   // the front rail low: at 0.95 it crossed the face of anyone pressed to the glass
    cradle.add(at(cyl(0.12, 0.1, 0.22, 8, M(0x3a3a40)), -0.85, 0.11, 0));   // the bucket

    // ---------- the box pets: violinists in black tie, the window washer ----------
    const FURS = [0xd8b080, 0x8a8a92, 0xf2eee6, 0x5a4030, 0xe8a058, 0x3a3a40];
    function pet(i, outfit) {
      const fur = M(FURS[i % FURS.length]), suit = M(outfit === 'washer' ? 0x4a4e58 : 0x18181c, { unlit: 0.1 }), kind = i % 3;
      const g = new THREE.Group(), body = new THREE.Group(); g.add(body); let vioRef = null;
      const legs = [-1, 1].map(sx => { const l = at(new THREE.Group(), sx * 0.1, 0.3, 0); l.add(at(box(0.13, 0.3, 0.13, M(0x1a1a1e)), 0, -0.15, 0)); body.add(l); return l; });
      body.add(at(box(0.4, 0.38, 0.28, suit), 0, 0.5, 0));
      if (outfit !== 'washer') { body.add(at(box(0.14, 0.32, 0.01, M(0xf4f4f0)), 0, 0.52, 0.142)); body.add(at(box(0.1, 0.04, 0.02, M(0x101010)), 0, 0.66, 0.15)); }   // the shirt front, the bow tie
      else body.add(at(box(0.3, 0.22, 0.01, M(0x5a5e68)), 0, 0.46, 0.142));                                                                                      // the bib of his overalls
      const arms = [-1, 1].map(sx => { const a = at(new THREE.Group(), sx * 0.23, 0.64, 0); a.add(at(box(0.09, 0.28, 0.09, suit), 0, -0.12, 0)); a.add(at(box(0.08, 0.08, 0.08, fur), 0, -0.28, 0)); body.add(a); return a; });
      const head = at(new THREE.Group(), 0, 0.92, 0); body.add(head);
      const skull = ico(0.24, 1, fur); skull.scale.set(1, 0.9, 0.92); head.add(skull);
      const snout = at(ico(0.09, 1, M(0xf0e6d8)), 0, -0.07, 0.19); snout.scale.set(1.1, 0.75, 0.8); head.add(snout);
      head.add(at(ico(0.03, 0, M(0x2a1a1a)), 0, -0.03, 0.27));
      for (const e of [-1, 1]) {
        head.add(at(ico(0.04, 0, M(0x0e0e0e)), e * 0.1, 0.05, 0.19)); head.add(at(ico(0.012, 0, glow(0xffffff)), e * 0.1 + 0.012, 0.065, 0.225));
        if (outfit === 'washer') continue;
        if (kind === 0) head.add(rot(at(cone(0.1, 0.2, 4, fur), e * 0.14, 0.26, 0), 0, 0, -e * 0.3));
        else if (kind === 1) head.add(rot(at(box(0.1, 0.26, 0.05, fur), e * 0.2, 0.0, 0), 0, 0, e * 0.25));
        else head.add(rot(at(box(0.08, 0.34, 0.05, fur), e * 0.09, 0.36, 0), 0, 0, -e * 0.12));
      }
      if (outfit === 'washer') {   // a dark fedora, a squeegee in the right paw
        const hatM = M(0x141418, { unlit: 0.05 });
        head.add(at(cyl(0.34, 0.34, 0.03, 10, hatM), 0, 0.17, 0)); head.add(at(cyl(0.2, 0.23, 0.2, 10, hatM), 0, 0.28, 0)); head.add(at(cyl(0.235, 0.235, 0.05, 10, M(0x3a3a40)), 0, 0.2, 0));
        const sq = new THREE.Group(); sq.add(at(box(0.03, 0.36, 0.03, M(0x8a8a90)), 0, 0.18, 0)); sq.add(at(box(0.4, 0.06, 0.04, M(0x202024)), 0, 0.38, 0)); arms[1].add(at(sq, 0, -0.3, 0.04));
      } else {                     // a violin under the chin, a bow in the right paw
        const vio = new THREE.Group(), wood = M(0x7a3a18, { unlit: 0.15 });
        vio.add(at(box(0.15, 0.05, 0.3, wood), 0, 0, 0)); vio.add(at(box(0.03, 0.03, 0.24, M(0x101010)), 0, 0.03, 0.24)); vio.add(at(box(0.05, 0.05, 0.06, wood), 0, 0.03, 0.38));
        vio.position.set(-0.16, 0.74, 0.14); vio.rotation.set(0.25, -0.75, 0.55); body.add(vio); vioRef = vio;
        const bow = at(new THREE.Group(), 0, -0.3, 0.06); bow.add(at(box(0.02, 0.02, 0.55, M(0xd8c8a0)), 0, 0, 0.12)); arms[1].add(bow);
      }
      const mouth = at(box(0.1, 0.07, 0.02, M(0x5a1a1a)), 0, -0.14, 0.25); mouth.visible = false; head.add(mouth);
      return { g, body, head, arms, legs, mouth, i, vio: vioRef };
    }
    const violins = S.VIOLINS.map((p, i) => { const q = pet(i, 'violin'); G.add(q.g); q.g.position.set(p[0], 0, p[1]); return q; });
    const stoolM = M(0x1e1e22), vStools = [];
    S.VIOLINS.forEach(([x, z]) => { const st = new THREE.Group(); st.add(at(cyl(0.18, 0.18, 0.04, 8, stoolM), x, 0.4, z)); st.add(at(cyl(0.03, 0.03, 0.38, 5, stoolM), x, 0.2, z)); G.add(st); vStools.push(st); });
    const washer = pet(5, 'washer'); cradle.add(washer.g); washer.g.position.set(0.55, 0, 0);

    // ---------- the grand piano and Sadi's bench ----------
    const lacquer = M(0x0c0c0e, { unlit: 0.02 }), hi = M(0x3a3a42, { unlit: 0.1 });
    const piano = new THREE.Group(); G.add(piano); piano.position.set(S.PIANO[0], 0, S.PIANO[1]);
    piano.add(at(box(1.0, 0.3, 1.5, lacquer), 0, 0.82, 0));
    const tail = new THREE.Mesh(new THREE.CylinderGeometry(0.75, 0.75, 0.3, 14, 1, false, PI, PI), lacquer); tail.position.set(-0.25, 0.82, 0); tail.scale.set(1.2, 1, 1); piano.add(tail);
    const lid = at(box(1.2, 0.03, 1.5, hi), -0.2, 1.3, 0); lid.rotation.z = 0.55; piano.add(lid);
    piano.add(at(box(0.03, 0.55, 0.03, hi), -0.45, 1.15, 0.6));                                     // the lid's prop stick
    for (const [x, z] of [[0.4, -0.6], [0.4, 0.6], [-0.8, 0]]) piano.add(at(box(0.09, 0.67, 0.09, lacquer), x, 0.33, z));
    const keyboard = at(box(0.24, 0.05, 1.3, mat({ map: keysT, rep: [1, 1], unlit: 0.35 })), 0.62, S.KEYS_Y - 0.02, 0); piano.add(keyboard);
    piano.add(at(box(0.3, 0.12, 1.4, lacquer), 0.55, S.KEYS_Y - 0.1, 0));
    piano.add(at(box(0.04, 0.28, 1.0, hi), 0.43, S.KEYS_Y + 0.18, 0));                             // the music desk
    piano.add(at(box(0.02, 0.2, 0.3, glow(0xf2f2ec, 0.7)), 0.46, S.KEYS_Y + 0.2, 0.1));             // a sheet of music
    const bench = new THREE.Group(); G.add(bench); bench.position.set(S.PIANIST[0], 0, S.PIANIST[1]);
    bench.add(at(box(0.4, 0.08, 0.75, lacquer), 0, S.BENCH_Y - 0.04, 0));
    for (const [x, z] of [[-0.15, -0.3], [0.15, -0.3], [-0.15, 0.3], [0.15, 0.3]]) bench.add(at(box(0.05, S.BENCH_Y - 0.08, 0.05, lacquer), x, (S.BENCH_Y - 0.08) / 2, z));

    // ---------- the drum kit (0.8 scale: full size, its toms and cymbals hid a seated chibi's face) ----------
    const drums = new THREE.Group(); G.add(drums); drums.position.set(S.DRUMS[0], 0, S.DRUMS[1]); drums.scale.setScalar(0.8);
    const shell = M(0x16161a, { unlit: 0.05 }), chrome = M(0xb8b8c0, { unlit: 0.25 }), skin = M(0xe8e8e2, { unlit: 0.3 }), brass = M(0xc8a850, { unlit: 0.25 });
    const kick = at(new THREE.Group(), 0, 0.35, 0); drums.add(kick);
    kick.add(rot(cyl(0.35, 0.35, 0.4, 14, shell), PI / 2, 0, 0));
    const kHead = at(new THREE.Mesh(new THREE.CircleGeometry(0.33, 18), mat({ map: headT, unlit: 1 })), 0, 0, 0.205); kick.add(kHead);
    drums.add(at(rot(cyl(0.2, 0.2, 0.14, 12, chrome), 0.15, 0, 0), -0.42, 0.62, -0.25)); drums.add(at(cyl(0.19, 0.19, 0.01, 12, skin), -0.42, 0.7, -0.24));
    for (const s of [-1, 1]) drums.add(at(rot(cyl(0.16, 0.16, 0.18, 12, shell), 0.4, 0, -s * 0.15), s * 0.2, 0.86, -0.08));
    drums.add(at(cyl(0.2, 0.2, 0.3, 12, shell), 0.55, 0.36, -0.35));                                 // the floor tom
    const hat = at(new THREE.Group(), -0.72, 0.88, -0.35); drums.add(hat); hat.add(at(cyl(0.17, 0.17, 0.01, 12, brass), 0, 0, 0)); hat.add(at(cyl(0.17, 0.17, 0.01, 12, brass), 0, 0.03, 0)); drums.add(at(cyl(0.015, 0.015, 0.88, 4, chrome), -0.72, 0.44, -0.35));
    drums.add(at(rot(cyl(0.24, 0.24, 0.01, 14, brass), 0.3, 0, -0.25), 0.62, 1.15, -0.1)); drums.add(at(cyl(0.015, 0.015, 1.1, 4, chrome), 0.66, 0.57, -0.12));
    const stool = new THREE.Group(); G.add(stool); stool.position.set(S.DRUMMER[0], 0, S.DRUMMER[1]);
    stool.add(at(cyl(0.2, 0.2, 0.06, 10, M(0x1a1a1e)), 0, S.STOOL_Y - 0.03, 0)); stool.add(at(cyl(0.03, 0.04, S.STOOL_Y - 0.06, 5, chrome), 0, (S.STOOL_Y - 0.06) / 2, 0));

    // ---------- the chandelier ----------
    const chand = new THREE.Group(); G.add(chand); chand.position.set(...S.CHANDELIER);
    const crystal = glow(0xf4f6ff, 0.85);
    chand.add(at(box(0.03, 2.5, 0.03, chrome), 0, 1.25, 0));
    for (const [r, y, n] of [[0.75, 0, 12], [0.5, -0.32, 9], [0.25, -0.6, 6]]) for (let i = 0; i < n; i++) { const a = i / n * TAU; chand.add(at(ico(0.07, 0, crystal), Math.sin(a) * r, y - 0.12 * (i % 2), Math.cos(a) * r)); chand.add(at(box(0.02, 0.18, 0.02, crystal), Math.sin(a) * r, y + 0.1, Math.cos(a) * r)); }
    chand.add(at(ico(0.14, 0, crystal), 0, -0.85, 0));

    // ---------- the cat's table: a white cloth, her plate and the fish, milk, a candle; her chair ----------
    const [tx, tz] = S.TABLE;
    const table = new THREE.Group(); G.add(table);
    table.add(at(cyl(S.TABLE_R, S.TABLE_R, 0.03, 18, mat({ map: clothT, rep: [2, 1], unlit: 0.25 })), tx, S.TABLE_Y - 0.015, tz));
    table.add(at(cyl(S.TABLE_R + 0.04, S.TABLE_R + 0.06, 0.28, 18, mat({ map: clothT, rep: [3, 1], unlit: 0.2 })), tx, S.TABLE_Y - 0.15, tz));   // the cloth's drop (short: a seated chibi's knees go under it)
    table.add(at(cyl(0.04, 0.05, S.TABLE_Y - 0.3, 6, M(0x18181c)), tx, (S.TABLE_Y - 0.3) / 2, tz)); table.add(at(cyl(0.25, 0.28, 0.03, 10, M(0x18181c)), tx, 0.015, tz));
    const plateG = at(new THREE.Group(), S.PLATE[0], S.TABLE_Y, S.PLATE[1]); G.add(plateG);
    plateG.add(at(cyl(0.17, 0.13, 0.025, 16, M(0xf8f8f4, { unlit: 0.45 })), 0, 0.0125, 0)); plateG.add(at(cyl(0.12, 0.12, 0.004, 14, M(0xe2e2dc, { unlit: 0.4 })), 0, 0.027, 0));
    const fishG = new THREE.Group(); plateG.add(fishG); fishG.position.set(0, 0.06, 0); fishG.rotation.y = 0.35;
    { const sil = M(0x9ab0c8, { unlit: 0.35 }), dark = M(0x4a6a8a, { unlit: 0.2 });
      const b = ico(0.1, 1, sil); b.scale.set(1.5, 0.55, 0.5); fishG.add(b);
      const fin = cone(0.09, 0.12, 4, dark); fin.rotation.z = PI / 2; fin.position.set(-0.19, 0, 0); fin.scale.set(1, 1, 0.3); fishG.add(fin);
      fishG.add(at(ico(0.02, 0, M(0x101010)), 0.11, 0.02, 0.045)); fishG.add(at(box(0.14, 0.012, 0.012, dark), 0, 0.055, 0)); }
    const milk = at(new THREE.Group(), S.PLATE[0] + 0.24, S.TABLE_Y, S.PLATE[1] - 0.22); G.add(milk);
    milk.add(at(cyl(0.05, 0.045, 0.2, 8, mat({ color: 0xdfe8f0, unlit: 0.4, see: 0.35 })), 0, 0.1, 0)); milk.add(at(cyl(0.045, 0.04, 0.15, 8, M(0xfafaf6, { unlit: 0.6 })), 0, 0.075, 0));
    const candle = at(new THREE.Group(), S.PLATE[0] - 0.25, S.TABLE_Y, S.PLATE[1] - 0.2); G.add(candle);
    candle.add(at(cyl(0.035, 0.04, 0.03, 8, chrome), 0, 0.015, 0)); candle.add(at(cyl(0.022, 0.022, 0.2, 6, M(0xf6f2e6, { unlit: 0.5 })), 0, 0.12, 0));
    const flame = at(ico(0.025, 0, glow(0xffd070)), 0, 0.25, 0); flame.scale.set(0.7, 1.4, 0.7); candle.add(flame);
    const chair = new THREE.Group(); G.add(chair); chair.position.set(S.KOB[0], 0, S.KOB[1]);
    { const cw = M(0x16161a, { unlit: 0.05 });
      chair.add(at(cyl(0.22, 0.22, 0.05, 12, cw), 0, S.SEAT_Y - 0.025, 0));
      for (const [x, z] of [[-0.15, -0.15], [0.15, -0.15], [-0.15, 0.15], [0.15, 0.15]]) chair.add(at(box(0.035, S.SEAT_Y, 0.035, cw), x, S.SEAT_Y / 2, z));
      const backR = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.025, 5, 12, PI), cw); backR.position.set(0, S.SEAT_Y + 0.3, -0.2); chair.add(backR);
      for (const s of [-1, 1]) chair.add(at(box(0.03, 0.32, 0.03, cw), s * 0.2, S.SEAT_Y + 0.16, -0.2)); }
    // the shaft of light: a slanted see-through beam from high on the left down onto the table
    const shaftM = mat({ color: 0xf4f4ee, unlit: 1, see: 0.82 });
    const sFrom = new THREE.Vector3(-4.2, 7.2, -4.6), sTo = new THREE.Vector3(tx, 0.6, tz);
    const shaft = new THREE.Mesh(new THREE.BoxGeometry(0.85, 1, 0.5), shaftM); G.add(shaft);
    shaft.position.copy(sFrom).add(sTo).multiplyScalar(0.5); shaft.scale.y = sFrom.distanceTo(sTo);
    shaft.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), sTo.clone().sub(sFrom).normalize());
    // steam off the hot fish
    const steamM = mat({ color: 0xf2f2f0, unlit: 0.8, see: 0.6 });
    const steam = Array.from({ length: 8 }, () => { const p = ico(0.018, 0, steamM); p.visible = false; G.add(p); return p; });

    // ---------- the upright bass: a set piece, standing on its endpin or fallen over ----------
    const bassG = new THREE.Group(); G.add(bassG); const bassBody = new THREE.Group(); bassG.add(bassBody);
    { const wood = M(0x8a4a20, { unlit: 0.18 }), ebony = M(0x141414), pale = M(0xd8d0b8, { unlit: 0.3 });
      const lo = ico(0.24, 1, wood); lo.scale.set(1, 1.05, 0.38); lo.position.y = 0.34; bassBody.add(lo);
      const up = ico(0.19, 1, wood); up.scale.set(1, 1.0, 0.38); up.position.y = 0.66; bassBody.add(up);
      bassBody.add(at(box(0.07, 0.78, 0.03, ebony), 0, 0.85, 0.075));                     // the fingerboard
      bassBody.add(at(box(0.06, 0.3, 0.05, wood), 0, 1.22, 0.02));                         // the neck's top, the pegbox
      bassBody.add(at(ico(0.05, 0, wood), 0, 1.4, 0.02));                                  // the scroll
      bassBody.add(at(cyl(0.012, 0.012, 0.12, 4, M(0x8a8a8a)), 0, 0.04, 0));               // the endpin
      bassBody.add(at(box(0.12, 0.05, 0.02, pale), 0, 0.42, 0.095));                       // the bridge
      for (const s of [-1, 1]) bassBody.add(rot(at(box(0.012, 0.12, 0.01, ebony), s * 0.09, 0.44, 0.092), 0, 0, s * 0.2));   // the f-holes
      for (let i = 0; i < 4; i++) bassBody.add(at(box(0.004, 1.0, 0.004, pale), -0.022 + i * 0.015, 0.92, 0.095)); }

    // ---------- hearts over points ----------
    const heartM = M(0xff4f9a, { unlit: 0.8 }), hearts = [];
    for (let i = 0; i < 12; i++) { const h = new THREE.Group(); h.add(at(ico(0.1, 0, heartM), -0.075, 0, 0)); h.add(at(ico(0.1, 0, heartM), 0.075, 0, 0)); h.add(rot(at(cone(0.125, 0.18, 4, heartM), 0, -0.11, 0), PI, 0, 0)); h.visible = false; G.add(h); hearts.push(h); }

    const cleared = (P, x, z) => (P.clear || []).some(([cx, cz, r]) => (x - cx) ** 2 + (z - cz) ** 2 < r * r);
    const turnTo = (q, x, z, P, yaw) => { if (!P.stare) return; const a = Math.atan2(P.stare[0] - x, P.stare[1] - z) - yaw; q.head.rotation.y = Math.max(-1.2, Math.min(1.2, Math.atan2(Math.sin(a), Math.cos(a)))); };
    function light(P = {}) {
      lights(0x4c4c56, 0xeef0ff, [0.35, -0.85, -0.4], 0x0a0a0e, [11, 34], 8);
      pt(0, S.SINGER[0], 2.7, S.SINGER[1] + 1.6, 1.0, 1.0, 1.05);   // the singer's key
      pt(1, tx + 0.4, 2.3, tz + 1.2, 1.05, 1.0, 0.95);              // the table
      pt(2, -1.6, 2.4, -5.6, 0.75, 0.78, 0.9);                      // the band
      pt(3, 0, 2.6, S.Z0 + 1.3, 0.85, 0.88, 0.95);                  // the window's glow on the room
      if (P.key) pt(1, P.key[0], P.key[1], P.key[2], P.key[3], P.key[4], P.key[5]);
    }
    return {
      group: G, sky: null, shadowCol: 0x050507, indoor: true,
      light() { light(); },
      anim(t, P = {}) {
        const s = shotT(t, P), hide = new Set(P.hide || []), bt = beat(t);
        light(P);
        table.visible = !hide.has('table'); chair.visible = !hide.has('chair'); piano.visible = bench.visible = !hide.has('piano');
        drums.visible = stool.visible = !hide.has('drums'); chand.visible = !hide.has('chandelier');
        milk.visible = !hide.has('milk') && table.visible; candle.visible = !hide.has('candle') && table.visible;
        plateG.visible = !hide.has('plate') && table.visible; fishG.visible = P.plateFish !== false;
        shaft.visible = P.shaft !== false && !hide.has('shaft') && table.visible;
        pane.visible = P.glass !== false; glints.forEach(g => { g.visible = P.glass !== false; });
        flame.scale.set(0.7, 1.4 + 0.25 * Math.sin(t * 17), 0.7);
        kHead.scale.setScalar(1 + 0.03 * Math.exp(-(((bt % 1) + 1) % 1) * 6));
        chand.rotation.y = 0.05 * Math.sin(t * 0.4);
        // the cradle and the washer
        cradle.visible = !hide.has('cradle'); cradle.position.set(0, P.cradle ?? S.CRADLE.y, S.CRADLE.z);
        const wm = P.washer ?? 'wipe';
        washer.g.visible = !!wm && cradle.visible; washer.body.rotation.set(0, 0, 0); washer.head.rotation.set(0, 0, 0); washer.arms.forEach(a => a.rotation.set(0, 0, 0)); washer.mouth.visible = false;
        if (wm === 'wipe') { const ph = Math.sin(bt * PI); washer.arms[1].rotation.set(-2.1, 0, 0.55 * ph); washer.arms[0].rotation.set(-0.4, 0, -0.2); washer.body.rotation.y = 0.12 * ph; }
        else if (wm === 'stare') { washer.body.rotation.x = 0.28; washer.arms.forEach((a, j) => { a.rotation.set(-2.4, 0, (j ? -1 : 1) * 0.35); }); washer.mouth.visible = true; }
        if (P.stare && wm) turnTo(washer, 0.55, S.CRADLE.z, P, 0);
        // the violinists
        const sm = P.strings ?? 'play';
        violins.forEach((q, i) => {
          const [vx, vz] = S.VIOLINS[i];
          q.g.visible = vStools[i].visible = !!sm && !hide.has('strings') && !cleared(P, vx, vz); if (!q.g.visible) return;
          const yaw = Math.atan2(0 - vx, -2.6 - vz); q.g.rotation.y = yaw;
          q.body.position.set(0, 0.1, 0); q.body.rotation.set(0, 0, 0); q.head.rotation.set(0, 0, 0); q.mouth.visible = false;
          q.legs.forEach(l => { l.rotation.x = -PI / 2; }); q.arms.forEach(a => a.rotation.set(0, 0, 0));
          q.arms[0].rotation.set(-1.9, 0.3, 0.5);                                   // the left paw up on the violin's neck
          if (q.vio) { q.vio.position.set(-0.16, 0.74, 0.14); q.vio.rotation.set(0.25, -0.75, 0.55); }
          const ph = bt + i * 0.07;
          if (sm === 'play') { q.arms[1].rotation.set(-1.2, 0, -0.35 + 0.45 * Math.sin(ph * PI)); q.head.rotation.z = 0.25; q.body.rotation.z = 0.04 * Math.sin(ph * PI); }
          else if (sm === 'swell') { q.arms[1].rotation.set(-1.25, 0, -0.5 + 0.8 * Math.sin(ph * PI * 0.5)); q.head.rotation.z = 0.45 + 0.1 * Math.sin(t * 2 + i); q.body.rotation.x = 0.22; q.body.rotation.z = 0.12 * Math.sin(ph * PI * 0.5); }
          else if (sm === 'stare') { q.arms[1].rotation.set(-0.3, 0, -0.15); q.arms[0].rotation.set(-0.5, 0, 0.2); q.mouth.visible = true; turnTo(q, vx, vz, P, yaw); if (q.vio) { q.vio.position.set(-0.24, 0.42, 0.16); q.vio.rotation.set(1.35, 0, 0.3); } }   // bows and violins down (held at the chin they read as sticks in their mouths)
        });
        // steam off the fish
        steam.forEach((p, i) => {
          p.visible = !!P.steam && fishG.visible && plateG.visible; if (!p.visible) return;
          const e = (t * 0.55 + i / 8) % 1; p.position.set(S.PLATE[0] + 0.07 * Math.sin(i * 2.3 + t * 1.5), S.TABLE_Y + 0.1 + 0.45 * e, S.PLATE[1] + 0.05 * Math.cos(i * 1.7 + t));
          p.scale.setScalar(0.6 + 1.0 * e);
        });
        // the upright bass: standing on its endpin (tilted back), or toppling over and lying on the floor
        bassG.visible = !!P.bass;
        if (P.bass) {
          const [bx, bz, byaw = 0, tilt = 12] = P.bass; bassG.position.set(bx, 0, bz); bassG.rotation.set(0, byaw * PI / 180, 0);
          bassBody.rotation.set(-tilt * PI / 180, 0, 0);
          if (P.bassFall) {
            const [f0, dir = 90] = P.bassFall, e = cl((s - f0) / 0.55), fallA = (PI / 2 - 0.1) * e * e;
            bassG.rotation.set(0, dir * PI / 180, 0); bassBody.rotation.set(-tilt * PI / 180 * (1 - e) + fallA, (byaw - dir) * PI / 180, 0);   // XYZ: its own spin first, then the fall towards dir
          }
        }
        // hearts over points: three pink hearts popping and rising (looping when q[4])
        hearts.forEach((h, i) => {
          const q = (P.hearts || [])[Math.floor(i / 3)]; h.visible = false; if (!q) return;
          let e = s - q[3] - (i % 3) * 0.3; if (q[4] && e > 0) e %= 1.2;
          if (e < 0 || e > 1.4) return;
          const hs = P.heartScale ?? 1; h.visible = true; h.position.set(q[0] + ((i % 3) - 1) * 0.22 * hs + 0.06 * Math.sin(e * 6 + i), q[1] + 0.55 * e * hs, q[2]); h.scale.setScalar(hs * Math.min(1, e * 5) * (1.15 - 0.25 * (e / 1.4)));
          h.rotation.y = (P.heartYaw ?? 0) * PI / 180;
        });
      },
    };
  }

  return { soundstage: soundstage() };
}
