// maps50.js: the "Umbrella" map (2026-10-15 2nd, Rihanna ft. JAY-Z, 2007; the clip: a row of dancers in black hoodies
// and sunglasses under a sparkling rain on a black stage, the singer's cabaret routine with a furled umbrella in a room of
// white wainscot panels washed orange under gold sconces, a white dress dancing in slow-motion splashes, the finale in a
// downpour with the umbrella held up). Same contract as the other map files, pure in t:
//   parlour  the clip's panelled room as a salon at night (y = 0): white wainscot walls washed orange from the floor, gold
//            candle sconces, a crystal chandelier, a pale marble floor; the dog's act at the back (STAGE) with four box-pet
//            backup dancers in black hoodies, hoods up, and black sunglasses (DANCERS); two rows of gold party chairs facing
//            it (ROWS x SEATS_X, seat SEAT_Y; Kob's in the middle of the front row, KOB) with box-pet guests in their best;
//            the haze machine stage left (HAZE, its nozzle to +x); the fire bell and its red strobe on the back wall
//            (ALARM); red sprinkler pipes across the ceiling, a head every 2.5 m (HEADS).
//            Flags: `zone` 'party' (warm, the default) | 'rain' (cool and dim, a backlight that makes the rain sparkle);
//            `alarm` (true or s: ringing from s into the shot: the bell shakes, rings of sound, the strobe flashes the
//            room red; `strobeAt` [x, y, z] puts its red flash on a subject); `haze` (0-1, true, or [s0, s1, a, b]: a low fog rolling out of the machine across the floor);
//            `rain` (0-1, true, or a ramp: the sprinklers: streaks fanning down from every head, splashes on the floor);
//            `dry` [[x, z, r, y]] (an umbrella's canopy: no rain under it below y, water running off its rim); `rainClear` [[x, z, r] or [x0, z0, x1, z1, r]] (no streaks near a lens, or along its line of sight to a face); `wet`
//            (0-1 or a ramp: puddles spreading); `drips` [[x, z, h, heavy, size]] (water dripping off a soaked one, a puddle at
//            the feet; size scales the drops for a wide); `shake` [x, y, z, s0, s1] (a wet dog's shake: a ring of drops flung out on every half beat);
//            `dancers` 'dance' | 'soaked' | 'stare' | 'cheer' | false; `guests` 'watch' | 'cheer' | 'soaked' | 'gasp' |
//            'stare' | false (seated); `stare` [x, z]; `hearts` [[x, y, z, s0]] + `heartYaw`; `hide` ['chandelier',
//            'chairs', 'haze', 'pipes', 'alarm', 'sconces', 'dancers']; `clear` [[x, z, r]] (no box pet there); `noguests`; `key`.
import { mapKit } from './mapkit.js';

export const PARLOUR = {
  X: 7.0, Z0: -6.0, Z1: 9.0, H: 6.0,
  STAGE: [0, -1.4],
  DANCERS: [[-0.95, -3.65], [0.95, -3.65], [-2.5, -3.4], [2.5, -3.4]],
  HAZE: [-4.9, -1.8],
  ALARM: [3.4, 2.9],
  ROWS: [2.4, 3.6], SEATS_X: [-2.6, -1.3, 0, 1.3, 2.6], SEAT_Y: 0.45,
  KOB: [0, 2.4], SADI_SEAT: [-1.3, 2.4],
  PIPE_Y: 5.78,
  HEADS: [-5, -2.5, 0, 2.5, 5].flatMap(x => [-4.5, -1.5, 1.5, 4.5, 7.5].map(z => [x, z])),
};

export function buildParlourMaps(K) {
  const k = mapKit(K);
  const { THREE, mat, tex, px, noise, box, TAU, PI, beat, hash, fr, cyl, cone, ico, at, rot, flat, lights, pt } = k;
  const M = (c, o = {}) => mat({ color: c, ...o }), glow = (c, u = 1) => mat({ color: c, unlit: u });
  const cl = x => Math.max(0, Math.min(1, x));
  const ramp = (v, s) => Array.isArray(v) ? v[2] + (v[3] - v[2]) * cl((s - v[0]) / Math.max(0.01, v[1] - v[0])) : (v === true ? 1 : (v || 0));
  const from = (v, s) => v === true || (typeof v === 'number' && s >= v);
  const shotT = (t, P) => P.t0 != null ? t - P.t0 : 0;
  const cleared = (P, x, z) => (P.clear || []).some(([cx, cz, r]) => (x - cx) ** 2 + (z - cz) ** 2 < r * r);
  const S = PARLOUR, GOLD = M(0xd8a83a, { unlit: 0.3 }), PALEGOLD = M(0xe8c868, { unlit: 0.4 });
  const HB = 30 / 86.9978;   // half a beat, seconds

  // ---------- textures ----------
  // the clip's wainscot: a short dado panel, the chair rail, a tall raised panel, the cornice (one tile is 1.75 m x the wall)
  const panelT = tex(32, 96, (x, r) => {
    const g = x.createLinearGradient(0, 0, 0, 96); g.addColorStop(0, '#f6f0e4'); g.addColorStop(1, '#ecdcc4'); x.fillStyle = g; x.fillRect(0, 0, 32, 96);
    noise(x, r, 32, 96, ['rgba(120,90,50,.035)'], 80);
    const frame = (x0, y0, w, h) => { px(x, '#c8b494', x0, y0, w, 1); px(x, '#c8b494', x0, y0, 1, h); px(x, '#fffaf0', x0, y0 + h - 1, w, 1); px(x, '#fffaf0', x0 + w - 1, y0, 1, h); px(x, '#d8c8aa', x0 + 2, y0 + 2, w - 4, 1); px(x, '#d8c8aa', x0 + 2, y0 + 2, 1, h - 4); };
    frame(4, 74, 24, 16);                       // the dado panel
    px(x, '#d0bc9c', 0, 69, 32, 2); px(x, '#fffaf0', 0, 68, 32, 1);   // the chair rail
    frame(5, 14, 22, 50);                       // the tall panel
    px(x, '#d8c4a4', 0, 0, 32, 6); px(x, '#fffaf0', 0, 6, 32, 1); px(x, '#c0aa88', 0, 7, 32, 1);   // the cornice
  }, 5001);
  const marbleT = tex(32, 32, (x, r) => {
    px(x, '#e9e1d2', 0, 0, 32, 32); noise(x, r, 32, 32, ['#e4dbcb', '#eee7da', '#e0d6c4'], 150);
    for (let i = 0; i < 3; i++) { let yy = r() * 32; for (let xx = 0; xx < 32; xx++) { yy += (r() - 0.5) * 1.6; px(x, '#d2c6b0', xx, Math.floor(yy) & 31, 1, 1); } }
    px(x, '#d8ccb6', 0, 0, 32, 1); px(x, '#d8ccb6', 0, 0, 1, 32);
  }, 5002);
  const ceilT = tex(16, 16, (x, r) => { px(x, '#efe8dc', 0, 0, 16, 16); noise(x, r, 16, 16, ['#ebe3d6'], 30); }, 5003);
  const bellT = tex(16, 16, x => { px(x, '#c81e1e', 0, 0, 16, 16); x.fillStyle = '#ffffff'; x.font = 'bold 5px monospace'; x.textAlign = 'center'; x.fillText('FIRE', 8, 9); }, 5004);

  // ---------- box pets: the backup dancers (black hoodies, hoods up, black shades), the guests in their best ----------
  const FURS = [0xf2eee6, 0xd8a868, 0x9a9aa4, 0xe8c090, 0x8a7a6c, 0xc8b8a8, 0x6a5a4c, 0xe0d0b8];
  const SUITS = [0x6a1a2a, 0x1a2a5a, 0x2a4a3a, 0x5a3a6a, 0x8a6a2a, 0x2a2a34];
  function pet(i, kind) {
    const g = new THREE.Group(), F = M(FURS[i % FURS.length]), ears = i % 3, body = new THREE.Group(); g.add(body);
    const top = kind === 'hood' ? M(0x16161c) : M(SUITS[i % SUITS.length]);
    const legs = [-1, 1].map(sx => { const l = at(new THREE.Group(), sx * 0.1, 0.3, 0); l.add(at(box(0.13, 0.3, 0.13, kind === 'hood' ? F : M(0x1c1c22)), 0, -0.15, 0)); body.add(l); return l; });
    if (kind === 'hood') body.add(at(box(0.42, 0.12, 0.3, M(0x101014)), 0, 0.34, 0));   // black shorts
    body.add(at(box(0.4, 0.38, 0.28, top), 0, 0.52, 0));
    if (kind === 'hood') body.add(at(box(0.03, 0.34, 0.01, M(0xb8bcc6, { unlit: 0.3 })), 0, 0.52, 0.145));   // the hoodie's zip
    else body.add(at(box(0.1, 0.05, 0.03, M(0xf4f2ec)), 0, 0.66, 0.145));
    const arms = [-1, 1].map(sx => { const a = at(new THREE.Group(), sx * 0.23, 0.66, 0); a.add(at(box(0.09, 0.28, 0.09, top), 0, -0.12, 0)); a.add(at(box(0.08, 0.08, 0.08, F), 0, -0.28, 0)); body.add(a); return a; });
    const head = at(new THREE.Group(), 0, 0.94, 0); body.add(head);
    const skull = ico(0.24, 1, F); skull.scale.set(1, 0.9, 0.92); head.add(skull);
    const snout = at(ico(0.1, 1, M(0xf0e6d8)), 0, -0.07, 0.19); snout.scale.set(1.1, 0.8, 0.9); head.add(snout);
    head.add(at(ico(0.035, 0, M(0x151515)), 0, -0.03, 0.28));
    const mouth = at(box(0.09, 0.07, 0.02, M(0x5a1a1a)), 0, -0.13, 0.25); mouth.visible = false; head.add(mouth);
    if (kind === 'hood') {
      const hood = new THREE.Mesh(new THREE.SphereGeometry(0.285, 10, 7, PI / 2 + 0.95, TAU - 1.9, 0, PI * 0.66), mat({ color: 0x16161c, side: THREE.DoubleSide })); hood.scale.set(1, 0.95, 0.95); hood.position.y = 0.02; head.add(hood);
      head.add(at(box(0.36, 0.08, 0.04, M(0x0a0a0c)), 0, 0.05, 0.2)); head.add(at(box(0.06, 0.02, 0.01, glow(0xc8d8f0, 0.8)), 0.08, 0.07, 0.225));   // the shades and a glint
    } else {
      for (const e of [-1, 1]) {
        head.add(at(ico(0.038, 0, M(0x0e0e0e)), e * 0.1, 0.05, 0.19)); head.add(at(ico(0.012, 0, glow(0xffffff)), e * 0.1 + 0.012, 0.065, 0.225));
        head.add(ears === 0 ? rot(at(cone(0.08, 0.2, 4, F), e * 0.15, 0.27, 0), 0, 0, -e * 0.25) : ears === 1 ? at(box(0.08, 0.3, 0.06, F), e * 0.1, 0.33, 0) : rot(at(box(0.07, 0.24, 0.16, F), e * 0.24, 0.02, 0), 0, 0, e * 0.3));
      }
    }
    return { g, body, head, arms, legs, mouth, i, kind };
  }
  const turnTo = (q, x, z, P, yaw) => { if (!P.stare) return; const a = Math.atan2(P.stare[0] - x, P.stare[1] - z) - yaw; q.head.rotation.y = Math.max(-1.2, Math.min(1.2, Math.atan2(Math.sin(a), Math.cos(a)))); };
  const reset = q => { q.body.position.set(0, 0, 0); q.body.rotation.set(0, 0, 0); q.head.rotation.set(0, 0, 0); q.mouth.visible = false; q.arms.forEach(a => a.rotation.set(0, 0, 0)); q.legs.forEach(l => l.rotation.set(0, 0, 0)); };

  function parlour() {
    const G = new THREE.Group();
    const W = 2 * S.X, D = S.Z1 - S.Z0, ZC = (S.Z0 + S.Z1) / 2;
    G.add(flat(W, D, mat({ map: marbleT, rep: [W / 1.2, D / 1.2] }), 0, 0, ZC));
    const wall = (w, h) => new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat({ map: panelT, rep: [w / 1.75, 1], unlit: 0.06 }));
    G.add(at(wall(W, S.H), 0, S.H / 2, S.Z0));
    G.add(rot(at(wall(W, S.H), 0, S.H / 2, S.Z1), 0, PI, 0));
    G.add(rot(at(wall(D, S.H), -S.X, S.H / 2, ZC), 0, PI / 2, 0));
    G.add(rot(at(wall(D, S.H), S.X, S.H / 2, ZC), 0, -PI / 2, 0));
    const ceil = new THREE.Mesh(new THREE.PlaneGeometry(W, D), mat({ map: ceilT, rep: [W / 2, D / 2] })); ceil.rotation.x = PI / 2; G.add(at(ceil, 0, S.H, ZC));
    // the skirting board, gold
    G.add(at(box(W, 0.12, 0.04, PALEGOLD), 0, 0.06, S.Z0 + 0.02));
    for (const sx of [-1, 1]) G.add(at(box(0.04, 0.12, D, PALEGOLD), sx * (S.X - 0.02), 0.06, ZC));
    // the sconces: a gold plate, three candle arms, small flames
    const sconceG = new THREE.Group(); G.add(sconceG);
    const flameM = glow(0xffd48a, 1), flames = [];
    const sconce = (x, z, ry) => {
      const s = rot(at(new THREE.Group(), x, 2.35, z), 0, ry, 0); sconceG.add(s);
      s.add(at(box(0.16, 0.34, 0.03, GOLD), 0, 0, 0.015));
      for (const dx of [-0.2, 0, 0.2]) {
        s.add(at(box(0.03, 0.03, 0.16, GOLD), dx * 0.7, -0.08, 0.1)); s.add(at(cyl(0.035, 0.03, 0.05, 6, GOLD), dx, dx ? -0.02 : 0.02, 0.17));
        s.add(at(cyl(0.022, 0.022, 0.14, 6, M(0xfaf6ea, { unlit: 0.4 })), dx, dx ? 0.06 : 0.1, 0.17));
        const f = at(cone(0.022, 0.06, 5, flameM), dx, dx ? 0.16 : 0.2, 0.17); s.add(f); flames.push(f);
      }
    };
    for (const x of [-5.4, -1.9, 1.9, 5.4]) sconce(x, S.Z0 + 0.02, 0);
    for (const z of [-3.2, 0.6, 4.2, 7.6]) { sconce(-S.X + 0.02, z, PI / 2); sconce(S.X - 0.02, z, -PI / 2); }
    // the chandelier: a gold ring, candles, crystal drops
    const chand = at(new THREE.Group(), 0, 4.75, 1.0); G.add(chand);
    chand.add(at(cyl(0.02, 0.02, 1.25, 4, GOLD), 0, 0.62, 0));
    const ringC = new THREE.Mesh(new THREE.TorusGeometry(0.75, 0.04, 4, 16), GOLD); ringC.rotation.x = PI / 2; chand.add(ringC);
    const cryM = glow(0xf4f8ff, 0.75);
    for (let i = 0; i < 12; i++) { const a = i / 12 * TAU; chand.add(at(cyl(0.025, 0.025, 0.12, 5, M(0xfaf6ea, { unlit: 0.4 })), Math.cos(a) * 0.75, 0.08, Math.sin(a) * 0.75)); chand.add(at(cone(0.022, 0.05, 5, flameM), Math.cos(a) * 0.75, 0.17, Math.sin(a) * 0.75)); chand.add(at(ico(0.04, 0, cryM), Math.cos(a + 0.26) * 0.62, -0.16 - 0.06 * (i % 2), Math.sin(a + 0.26) * 0.62)); }
    chand.add(at(ico(0.09, 0, cryM), 0, -0.35, 0));
    // the sprinkler pipes and heads
    const pipeG = new THREE.Group(); G.add(pipeG);
    const redM = M(0xb82020, { unlit: 0.15 }), brass = M(0xc8a050, { unlit: 0.25 });
    for (const z of [-4.5, -1.5, 1.5, 4.5, 7.5]) { const p = at(cyl(0.045, 0.045, W - 0.4, 6, redM), 0, S.PIPE_Y, z); p.rotation.z = PI / 2; pipeG.add(p); }
    for (const [x, z] of S.HEADS) { pipeG.add(at(cyl(0.03, 0.03, 0.12, 5, brass), x, S.PIPE_Y - 0.08, z)); pipeG.add(at(cyl(0.07, 0.07, 0.015, 8, brass), x, S.PIPE_Y - 0.15, z)); pipeG.add(at(ico(0.03, 0, M(0xff3020, { unlit: 0.6 })), x, S.PIPE_Y - 0.11, z)); }
    // the fire bell and its strobe on the back wall
    const alarmG = new THREE.Group(); G.add(alarmG);
    const [ax, ay] = S.ALARM, bell = at(new THREE.Group(), ax, ay, S.Z0 + 0.06); alarmG.add(bell);
    const dome = new THREE.Mesh(new THREE.SphereGeometry(0.2, 10, 6, 0, TAU, 0, PI / 2), M(0xd02020, { unlit: 0.35 })); dome.rotation.x = PI / 2; bell.add(dome);
    bell.add(at(box(0.05, 0.05, 0.16, M(0x2a2a2a)), 0, -0.24, 0.06));   // the striker
    alarmG.add(at(new THREE.Mesh(new THREE.PlaneGeometry(0.3, 0.3), mat({ map: bellT, unlit: 0.5 })), ax, ay - 0.55, S.Z0 + 0.03));
    alarmG.add(at(box(0.22, 0.14, 0.1, M(0x5a1010)), ax, ay + 0.45, S.Z0 + 0.06));
    const strobeOn = at(box(0.2, 0.12, 0.1, glow(0xff3030, 1)), ax, ay + 0.45, S.Z0 + 0.08); alarmG.add(strobeOn);
    const soundM = mat({ color: 0xff6a5a, unlit: 0.9, see: 0.35 });
    const sound = Array.from({ length: 3 }, () => { const q = new THREE.Mesh(new THREE.TorusGeometry(1, 0.03, 4, 18), soundM); q.visible = false; G.add(q); return q; });
    // the haze machine: a black box, a nozzle, a red lamp; the fog it pours out
    const hazeG = at(new THREE.Group(), S.HAZE[0], 0, S.HAZE[1]); G.add(hazeG);
    hazeG.add(at(box(0.62, 0.36, 0.42, M(0x1c1c22)), 0, 0.18, 0));
    const nozzle = at(cyl(0.06, 0.08, 0.2, 6, M(0x3a3a40)), 0.38, 0.22, 0); nozzle.rotation.z = PI / 2; hazeG.add(nozzle);
    hazeG.add(at(box(0.1, 0.06, 0.02, glow(0xff3a2a, 0.9)), -0.15, 0.3, 0.215)); hazeG.add(at(box(0.04, 0.22, 0.04, M(0x8a8a90)), 0.2, 0.46, -0.1));
    const fogM = mat({ color: 0xf0eef4, unlit: 0.5, see: 0.5 });
    const fog = Array.from({ length: 36 }, () => { const q = ico(1, 1, fogM); q.visible = false; G.add(q); return q; });
    const jetM = mat({ color: 0xf6f4f8, unlit: 0.6, see: 0.45 }), jet = Array.from({ length: 14 }, () => { const q = ico(1, 1, jetM); q.visible = false; G.add(q); return q; });
    // the gold party chairs
    const chairsG = new THREE.Group(); G.add(chairsG);
    const chair = (x, z) => {
      const c = at(new THREE.Group(), x, 0, z); chairsG.add(c);
      c.add(at(box(0.44, 0.05, 0.42, PALEGOLD), 0, S.SEAT_Y - 0.025, 0)); c.add(at(box(0.4, 0.04, 0.38, M(0xf2ece0)), 0, S.SEAT_Y + 0.005, 0));
      for (const [lx, lz] of [[-0.19, -0.18], [0.19, -0.18], [-0.19, 0.18], [0.19, 0.18]]) c.add(at(box(0.035, S.SEAT_Y, 0.035, PALEGOLD), lx, S.SEAT_Y / 2, lz));
      for (const lx of [-0.19, 0.19]) c.add(at(box(0.035, 0.5, 0.035, PALEGOLD), lx, S.SEAT_Y + 0.25, 0.19));
      for (const y of [0.62, 0.78, 0.92]) c.add(at(box(0.4, 0.03, 0.03, PALEGOLD), 0, y, 0.19));
      return c;
    };
    const chairs = [];
    for (const z of S.ROWS) for (const x of S.SEATS_X) chairs.push({ x, z, c: chair(x, z) });
    // the dancers and the guests (the seats left for Kob and Sadi stay empty)
    const isSeat = ([sx, sz], x, z) => Math.abs(x - sx) < 0.1 && Math.abs(z - sz) < 0.1;
    const dancers = S.DANCERS.map(([x, z], i) => { const q = pet(i + 3, 'hood'); G.add(q.g); return { q, x, z }; });
    const guests = chairs.filter(({ x, z }) => !isSeat(S.KOB, x, z) && !isSeat(S.SADI_SEAT, x, z)).map(({ x, z }, i) => { const q = pet(i, 'guest'); G.add(q.g); return { q, x, z }; });
    // the rain: streaks fanning down from each head, splashes, the run-off round an umbrella's rim
    const rainM = mat({ color: 0xf2f8ff, unlit: 1, see: 0.2 });
    const NR = 560, streaks = Array.from({ length: NR }, () => { const q = box(0.016, 0.7, 0.016, rainM); q.visible = false; G.add(q); return q; });
    const dropM = mat({ color: 0xdff0ff, unlit: 0.9 }), splashes = Array.from({ length: 180 }, () => { const q = ico(1, 0, dropM); q.visible = false; G.add(q); return q; });
    const runoff = Array.from({ length: 48 }, () => { const q = box(0.016, 0.3, 0.016, rainM); q.visible = false; G.add(q); return q; });
    // drops (the shake), drips off the soaked, puddles, hearts
    const wetM = mat({ color: 0x8fd4ff, unlit: 0.85 });
    const shakeM = mat({ color: 0x9ad8ff, unlit: 0.85 });   // the shake: blue drops (white ones read as snowballs)
    const drops = Array.from({ length: 560 }, () => { const q = box(1, 1, 1, shakeM); q.visible = false; G.add(q); return q; });
    const wet = Array.from({ length: 200 }, () => { const q = box(1, 1, 1, wetM); q.visible = false; G.add(q); return q; });
    const puddleM = mat({ color: 0xa8c8dc, unlit: 0.45, see: 0.45 });
    const PUD = Array.from({ length: 16 }, (_, i) => [(hash(i, 5011) - 0.5) * 9, -3.2 + hash(i, 5012) * 8.5, 0.45 + 0.6 * hash(i, 5013)]);
    const puddles = PUD.map(() => { const q = flat(1, 1, puddleM, 0, 0.014, 0); q.geometry = new THREE.CircleGeometry(1, 12); q.visible = false; G.add(q); return q; });
    const dripPuddles = Array.from({ length: 6 }, () => { const q = flat(1, 1, puddleM, 0, 0.016, 0); q.geometry = new THREE.CircleGeometry(0.42, 12); q.visible = false; G.add(q); return q; });
    const heartM = M(0xff4f9a, { unlit: 0.8 }), hearts = [];
    for (let i = 0; i < 9; i++) { const h = new THREE.Group(); h.add(at(ico(0.1, 0, heartM), -0.075, 0, 0)); h.add(at(ico(0.1, 0, heartM), 0.075, 0, 0)); h.add(rot(at(cone(0.125, 0.18, 4, heartM), 0, -0.11, 0), PI, 0, 0)); h.visible = false; G.add(h); hearts.push(h); }

    const inDry = (dry, x, z, y) => dry.some(([dx, dz, r, dy]) => y < dy && (x - dx) ** 2 + (z - dz) ** 2 < r * r);
    function light(P, on) {
      const z = P.zone || 'party';
      if (z === 'rain') { lights(0x3a4250, 0x98a8c4, [0.25, -0.9, -0.45], 0x0c1016, [12, 36], 9); pt(0, -4.6, 1.0, -4.9, 0.75, 0.38, 0.16); pt(1, 4.6, 1.0, -4.9, 0.75, 0.38, 0.16); pt(2, 0, 3.4, -4.6, 0.95, 1.05, 1.2); pt(3, 0, 2.2, 6.0, 0.48, 0.54, 0.66); }
      else { lights(0x685848, 0xe8d0b0, [0.25, -0.9, -0.42], 0x1c140e, [16, 44], 9); pt(0, -4.6, 1.0, -4.9, 1.05, 0.52, 0.22); pt(1, 4.6, 1.0, -4.9, 1.05, 0.52, 0.22); pt(2, 0, 4.4, 1.0, 0.8, 0.72, 0.58); pt(3, 0, 1.8, 6.4, 0.6, 0.48, 0.36); }
      if (on) { const sa = P.strobeAt || [S.ALARM[0], 2.6, S.Z0 + 1.6]; pt(3, sa[0], sa[1], sa[2], 1.6, 0.12, 0.1); }   // strobeAt [x, y, z]: the red flash on a subject
      if (P.key) pt(1, P.key[0], P.key[1], P.key[2], P.key[3], P.key[4], P.key[5]);
    }
    return {
      group: G, sky: null, shadowCol: 0x6a5a44, indoor: true,
      light() { light({}, false); },
      anim(t, P = {}) {
        const s = shotT(t, P), bt = beat(t), hide = new Set(P.hide || []);
        const ringing = from(P.alarm, s), strobe = ringing && fr(t * 3.2) < 0.45;
        light(P, strobe);
        chand.visible = !hide.has('chandelier'); chairsG.visible = !hide.has('chairs'); pipeG.visible = !hide.has('pipes'); alarmG.visible = !hide.has('alarm'); hazeG.visible = !hide.has('haze'); sconceG.visible = !hide.has('sconces');
        flames.forEach((f, i) => { f.scale.y = 0.85 + 0.25 * Math.sin(t * 9 + i * 1.7); });
        chand.rotation.y = 0.05 * Math.sin(t * 0.4);
        // the fire bell
        bell.rotation.z = ringing ? 0.12 * Math.sin(t * 70) : 0; strobeOn.visible = strobe;
        sound.forEach((q, i) => { const u = fr(t * 1.6 + i / 3); q.visible = ringing && !hide.has('alarm'); if (!q.visible) return; q.position.set(S.ALARM[0], S.ALARM[1], S.Z0 + 0.12 + u * 0.4); q.scale.setScalar(0.25 + u * 0.9); });
        // the fog rolling out of the machine along the floor (kept under the chins)
        const hz = hide.has('haze') ? 0 : cl(ramp(P.haze, s));
        fog.forEach((q, i) => {
          q.visible = i / fog.length < hz; if (!q.visible) return;
          const u = fr(t * 0.11 + i / fog.length), a = (hash(i, 5021) - 0.5) * 1.6;
          q.position.set(S.HAZE[0] + 0.5 + u * 6.2, 0.1 + 0.04 * u + 0.03 * Math.sin(t + i), S.HAZE[1] + Math.sin(a) * u * 3.2 + 0.2 * Math.sin(t * 0.3 + i));
          q.scale.set(0.35 + u * 0.75, 0.1 + u * 0.12, 0.35 + u * 0.75);   // flat and low: a fog bank at the ankles (at chest height it veiled every face)
        });
        // the haze jet: thick white puffs out of the nozzle, rolling along the floor (`hazeJet` true or s)
        const hj = Array.isArray(P.hazeJet) ? P.hazeJet : [S.HAZE[0] + 3, S.HAZE[1]], hjx = hj[0] - S.HAZE[0], hjz = hj[1] - S.HAZE[1], hjn = Math.hypot(hjx, hjz) || 1;   // hazeJet: true, or [x, z] the jet rolls towards (a lens)
        jet.forEach((q, i) => { q.visible = !!P.hazeJet && !hide.has('haze'); if (!q.visible) return; const u = fr(t * 0.6 + i / jet.length); q.position.set(S.HAZE[0] + (0.4 + u * 0.8) * hjx / hjn, 0.3 + 0.3 * u, S.HAZE[1] + (0.4 + u * 0.8) * hjz / hjn + 0.1 * Math.sin(i * 2.3 + t)); q.scale.setScalar(0.12 + 0.26 * u); });   // a short jet: carried right up to a close lens it veiled the whole frame
    // the box pets
        const noG = !!P.noguests;
        const dm = P.dancers ?? 'dance';
        dancers.forEach(({ q, x, z }, i) => {
          q.g.visible = !!dm && !noG && !hide.has('dancers') && !cleared(P, x, z); if (!q.g.visible) return;
          reset(q); const yaw = Math.atan2(-x * 0.15, 4); q.g.position.set(x, 0, z); q.g.rotation.y = yaw;
          if (dm === 'dance') {   // the clip's line: a bounce on every beat, a step side to side every two, arms pumping in turn
            const h = Math.abs(Math.sin(bt * PI)); q.body.position.y = 0.05 * h; q.body.position.x = 0.12 * Math.sin(bt * PI / 2);
            q.arms.forEach((a, j) => { const up = (Math.floor(bt) + j) % 2 === 0; a.rotation.set(up ? -2.2 : -0.5, 0, (j ? 1 : -1) * (up ? 0.25 : 0.1)); });
            q.legs.forEach((l, j) => { l.rotation.x = 0.3 * Math.sin(bt * PI + j * PI); });
          } else if (dm === 'soaked') {   // paws over the head, shivering
            q.arms.forEach((a, j) => a.rotation.set(-2.75, 0, (j ? -1 : 1) * 0.55)); q.head.rotation.x = 0.25; q.body.position.x = 0.012 * Math.sin(t * 40 + i);
          } else if (dm === 'cheer') { q.arms.forEach((a, j) => a.rotation.set(0, 0, (j ? 1 : -1) * 2.45)); q.body.position.y = 0.05 * Math.abs(Math.sin(bt * PI)); q.mouth.visible = true; }
          else if (dm === 'stare') { turnTo(q, x, z, P, yaw); }
        });
        const gm = P.guests ?? 'watch';
        guests.forEach(({ q, x, z }, i) => {
          q.g.visible = !!gm && !noG && !hide.has('chairs') && !cleared(P, x, z); if (!q.g.visible) return;
          reset(q); const yaw = PI; q.g.position.set(x, S.SEAT_Y - 0.31, z + 0.04); q.g.rotation.y = yaw;
          q.legs.forEach(l => { l.rotation.x = -PI / 2; });
          if (gm === 'cheer') { q.arms.forEach((a, j) => a.rotation.set(0, 0, (j ? 1 : -1) * (2.3 + 0.25 * Math.abs(Math.sin(bt * PI))))); q.mouth.visible = true; }
          else if (gm === 'soaked') { q.arms.forEach((a, j) => a.rotation.set(-2.75, 0, (j ? -1 : 1) * 0.55)); q.head.rotation.x = 0.3; q.body.position.x = 0.01 * Math.sin(t * 38 + i); }
          else if (gm === 'gasp') { q.arms.forEach((a, j) => a.rotation.set(-2.35, 0, (j ? -1 : 1) * 0.35)); q.mouth.visible = true; }
          else if (gm === 'stare') turnTo(q, x, z, P, yaw);
          else q.head.rotation.x = -0.05 * Math.abs(Math.sin(bt * PI));
        });
        // the sprinklers: streaks fanning out from each head down to the floor; none under an umbrella; splashes
        const rn = cl(ramp(P.rain, s)), dry = P.dry || [], rc = P.rainClear || [], nearLens = (x, z) => rc.some(c => { if (c.length < 5) return (x - c[0]) ** 2 + (z - c[1]) ** 2 < c[2] * c[2]; const [x0, z0, x1, z1, r] = c, dx = x1 - x0, dz = z1 - z0, u = Math.max(0, Math.min(1, ((x - x0) * dx + (z - z0) * dz) / (dx * dx + dz * dz || 1))); return (x - x0 - u * dx) ** 2 + (z - z0 - u * dz) ** 2 < r * r; });   // rainClear [[x, z, r]]: no streak near a lens (one at the lens is a white bar across the frame)
        const nOn = Math.floor(rn * NR);
        streaks.forEach((q, i) => {
          q.visible = i < nOn; if (!q.visible) return;
          const [hx, hz] = S.HEADS[i % S.HEADS.length], a = hash(i, 5031) * TAU, rr = 1.75 * Math.sqrt(hash(i, 5032));
          const u = fr(t * 1.25 * (0.85 + 0.3 * hash(i, 5033)) + hash(i, 5034)), y = S.PIPE_Y - 0.2 - u * (S.PIPE_Y - 0.2);
          const x = hx + Math.cos(a) * rr * (0.25 + 0.75 * u), z = hz + Math.sin(a) * rr * (0.25 + 0.75 * u);
          if (Math.abs(x) > S.X - 0.1 || z < S.Z0 + 0.1 || z > S.Z1 - 0.1 || inDry(dry, x, z, y - 0.27) || nearLens(x, z)) { q.visible = false; return; }
          q.position.set(x, y, z);
        });
        splashes.forEach((q, j) => {
          q.visible = rn > 0.05 && j < rn * splashes.length; if (!q.visible) return;
          const u = fr(t * 2.3 + hash(j, 5041)); if (u > 0.22) { q.visible = false; return; }
          const kk = Math.floor(t * 2.3 + hash(j, 5041)), x = (hash(j, kk, 5042) - 0.5) * 2 * (S.X - 0.4), z = S.Z0 + 0.4 + hash(j, kk, 5043) * (D - 0.8);
          if (inDry(dry, x, z, 0.5)) { q.visible = false; return; }
          const v = u / 0.22; q.position.set(x + (hash(j, 5044) - 0.5) * 0.1 * v, 0.02 + 0.16 * Math.sin(v * PI), z); q.scale.setScalar(0.018 + 0.01 * hash(j, 5045));
        });
        runoff.forEach((q, i) => {
          const c = dry[Math.floor(i / 16)];
          q.visible = rn > 0.1 && !!c; if (!q.visible) return;
          const [dx, dz, r, dy] = c, a = (i % 16) / 16 * TAU + 0.2, u = fr(t * 1.9 + (i % 16) * 0.37), rimY = dy - 0.35, rx = dx + Math.cos(a) * r * 0.98, rz = dz + Math.sin(a) * r * 0.98;
          if (nearLens(rx, rz)) { q.visible = false; return; }
          q.position.set(rx, rimY - u * rimY, rz);
        });
        // puddles spreading over the floor
        const wv = cl(ramp(P.wet, s));
        puddles.forEach((q, i) => { const [x, z, r] = PUD[i]; q.visible = wv > 0.02; if (!q.visible) return; q.position.set(x, 0.014, z); q.scale.setScalar(r * wv); });
        // the wet dog's shake: a ring of drops flung out on every half beat, falling as they fly
        drops.forEach(q => { q.visible = false; }); wet.forEach(q => { q.visible = false; });
        let di = 0, wi = 0;
        if (P.shake) {
          const [x, y, z, s0 = 0, s1 = 99] = P.shake;
          for (let w = 0; w < 3; w++) {
            const bb = Math.floor(bt * 2) - w, age = (bt * 2 - bb) * HB, sb = s - age; if (sb < s0 || sb > s1) continue;
            for (let j = 0; j < 90 && di < drops.length; j++) {
              const a = (j / 90) * TAU + hash(bb, j, 5051) * 0.25, el = 0.15 + 0.75 * hash(bb, j, 5052), v = 2.2 + 1.0 * hash(bb, j, 5053), y0 = y - 0.35 + 0.8 * hash(bb, j, 5055);   // from head to hips, on upward arcs (all flat at chest height they stacked into one bar)
              const vx = Math.cos(a) * Math.cos(el) * v, vz = Math.sin(a) * Math.cos(el) * v, vy = Math.sin(el) * v - 9.8 * age;
              const q = drops[di++], y1 = y0 + Math.sin(el) * v * age - 4.9 * age * age, r0 = 0.3; q.visible = y1 > 0.02; if (!q.visible) continue;
              q.position.set(x + Math.cos(a) * r0 + vx * age, y1, z + Math.sin(a) * r0 + vz * age);   // from a ring round the body, not its middle
              q.scale.set(0.02, 0.02, 0.09); q.lookAt(q.position.x + vx, q.position.y + vy, q.position.z + vz);   // stretched along its flight: spray, not polka dots
            }
          }
        }
        // drips off the soaked: small blue drops from round the head to the floor, a puddle at the feet
        (P.drips || []).forEach(([x, z, h = 1.25, heavy = 0, sz = 1], k2) => {
          const n = heavy ? 30 : 12;
          for (let j = 0; j < n; j++) {
            const ph = fr(t * (heavy ? 2.4 : 1.7) + hash(j, k2, 5061)), a = hash(j, k2, 5062) * TAU, r = 0.3 + 0.22 * hash(j, k2, 5063), yy = h * (1 - ph * ph);   // from h (the shoulders) down, 0.3-0.52 m out: off the face
            const q = wet[wi++]; if (!q) break;
            q.visible = true; q.position.set(x + Math.cos(a) * r, Math.max(0.02, yy), z + Math.sin(a) * r); q.scale.set(0.012 * sz, (0.05 + 0.04 * hash(j, k2, 5064)) * sz, 0.012 * sz);   // a streak running down, not a dot (dots read as confetti)
          }
        });
        dripPuddles.forEach((q, k2) => { const pd = (P.drips || [])[k2]; q.visible = !!pd; if (pd) { q.position.set(pd[0], 0.016, pd[1]); q.scale.setScalar(pd[3] ? 1.4 : 1); } });
        // hearts rising
        hearts.forEach(h => { h.visible = false; });
        (P.hearts || []).forEach(([x, y, z, s0 = 0], k2) => {
          for (let j = 0; j < 3; j++) {
            const h = hearts[k2 * 3 + j]; if (!h) return; const u = fr((s - s0) * 0.8 + j / 3); h.visible = s >= s0;
            h.position.set(x + 0.18 * Math.sin(u * 5 + j), y + u * 0.7, z); h.scale.setScalar(0.8 + 0.4 * Math.sin(u * PI)); h.rotation.y = (P.heartYaw || 0) * PI / 180;
          }
        });
      },
    };
  }
  return { parlour: parlour() };
}
