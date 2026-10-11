// maps41.js: the "Dracula" map (2026-10-11, Tame Impala & JENNIE; the clip: a lonely farmhouse at night under string
// lights, a big rig pulling up in clouds of smoke, a crowd dancing in its headlights, and at dawn the house hauled away
// on a truck). Same contract as the other map files, pure in t:
//   farmhouse  one set at y = 0: Dracula's farmhouse in a field (FARMHOUSE: the room inside x X0..X1, z Z0..Z1, H
//         high; white clapboard outside, damask wallpaper, floorboards and candlelight inside), the yard in front of it
//         (z > Z1: packed dirt under a canopy of string lights on four poles, hay bales), the barn, fences, trees and
//         hills. The house SHELL (walls, ceiling, roof, windows, door, curtains, planks, the chandelier, the portrait)
//         is one group the big rig tows away (`tow`); the floor and the furniture stay: the grandfather clock (CLOCK,
//         `clock`: the time in hours, or [h0, h1, s0, s1] spun over the shot), the red velvet sofa (SOFA, seat SOFA_Y),
//         three coffins standing against the left wall (COFFINS), the punch table (TABLE), floor candelabras.
//         The big rig (a long-nose red tractor unit, nose to +x) is parked against the house's left wall, its front
//         bumper at TRUCK_X with a chain to the wall; `arrive` [s0, dur, x0] drives it in from x0 (headlights on,
//         smoke from its stacks); `lights` (headlights), `smoke`; `tow` [s0, dur, dist, from]: it reverses to -x dragging
//         the shell with it; `truck` false hides it, `chain` false the chain. Its driver, the "Dai Dai" keeper's
//         bulldog in a trucker cap and a plaid shirt (`driver` { pose: 'cab' | 'hook' (bent at the chain by the
//         wall) | 'wave' | 'stand' (at [x, z, yaw]), hide }).
//         Windows: `boards` (0-1: how much of each window is boarded, from the bottom plank up; `boardsAt` [s0, gap]
//         pops them in one by one; `nail` [s0, gap, 'R1', ...]: those windows' planks hammered on one by one, keyed
//         F0 F1 B0 B1 (front, back, by x) R0 R1 (right, by z) L0), `curtains` (0 open .. 1 drawn). The light: `zone` 'night' | 'predawn' |
//         'sunrise' (the sky, the outside light), `inside` (the room's own light: candles at night, dark at sunrise),
//         `beams` (sunrise: how many shafts of sunlight come in through the plank gaps of the right wall's windows,
//         0-6, in BEAM_ORDER), `flood` (0-1: the right windows' planks fall from the top and the whole window pours
//         in), `crack` (a line of light under the door). The guests (box pets in Halloween costumes: ghosts, witches,
//         devils, pumpkins, bats): `guests` 'dance' | 'flee' | 'cheer' | 'stare' | false, in the yard or the room
//         (`where` 'yard' | 'room'), on an arc (`gather` [cx, cz, r, a0, a1, n]: deg, 0 = +z, facing its centre) or
//         at `spots` [[x, z], ...]; `stare` [x, z]; `clear` [[x, z, r]], `noguests`, `panes` false (the windows' warm
//         glow from outside at night), `hearts` [[x, y, z, s0, loop]] + `heartYaw`, `moon` [x, y, z], `key`.
import { mapKit } from './mapkit.js';

export const FARMHOUSE = {
  H: 3.4, X0: -4.6, X1: 4.6, Z0: -3.8, Z1: 3.8, T: 0.14,
  DOOR: [0, 1.1, 2.3], WIN: { w: 1.3, h: 1.35, sill: 0.85 },
  WIN_F: [-2.7, 2.7], WIN_R: [-1.75, 1.5], WIN_B: [-2.2, 2.2], WIN_L: [-1.6],
  CLOCK: [-0.66, -3.5], SOFA: [1.15, -3.2], SOFA_Y: 0.42, TABLE: [-3.8, 2.35], COFFINS: [[-4.3, -2.35], [-4.3, -1.25], [-4.3, -0.15]],
  CORNER: [-3.4, -2.55], CANDLES: [[-1.75, -3.35], [2.95, -3.35]],
  TRUCK_X: -6.6, TRUCK_Z: 0.3,
  POLES: [[-7, 5.2], [7, 5.2], [-7, 13.6], [7, 13.6]], BALES: [[-5.6, 7.6, 0.3], [5.4, 8.4, -0.4], [-3.6, 12.2, 0.1], [4.0, 12.6, 0.2]],
  SUN: [1, 0.3, 0.22],   // towards the sun (east, +x, low): the shafts travel the other way
};
const PLANKS = 4;   // per window: planks from the sill up, gaps between them (the shafts' slits)

export function buildDraculaMaps(K) {
  const k = mapKit(K);
  const { THREE, mat, tex, px, noise, box, TAU, PI, beat, fr, cyl, cone, ico, at, rot, flat, lights, pt, hash, grad, stars, prism } = k;
  const M = (c, o = {}) => mat({ color: c, ...o }), glow = (c, u = 1) => mat({ color: c, unlit: u });
  const cl = x => Math.max(0, Math.min(1, x)), sm = x => { x = cl(x); return x * x * (3 - 2 * x); };
  const cleared = (P, x, z) => (P.clear || []).some(([cx, cz, r]) => (x - cx) ** 2 + (z - cz) ** 2 < r * r);
  const ramp = (v, s, d = 0) => v == null ? d : Array.isArray(v) ? v[2] + (v[3] - v[2]) * cl((s - v[0]) / Math.max(0.01, v[1] - v[0])) : (v === true ? 1 : v === false ? 0 : v);
  const shotT = (t, P) => P.t0 != null ? t - P.t0 : 0;
  const F = FARMHOUSE, W = F.X1 - F.X0, D = F.Z1 - F.Z0;

  // ---------- textures ----------
  const clapT = tex(32, 32, (x, r) => { px(x, '#d8d6cc', 0, 0, 32, 32); noise(x, r, 32, 32, ['#d0cec4', '#dcdad0', '#c8c6bc'], 160); for (let j = 0; j < 32; j += 6) { px(x, '#9a988e', 0, j, 32, 1); px(x, '#eeece4', 0, j + 1, 32, 1); } }, 4101);
  const roofT = tex(32, 32, (x, r) => { px(x, '#3a3a40', 0, 0, 32, 32); noise(x, r, 32, 32, ['#34343a', '#404048', '#2e2e34'], 220); for (let j = 0; j < 32; j += 5) { px(x, '#24242a', 0, j, 32, 1); for (let i = (j / 5) % 2 ? 0 : 4; i < 32; i += 8) px(x, '#24242a', i, j, 1, 5); } }, 4102);
  const damaskT = tex(32, 32, (x, r) => { px(x, '#4a1820', 0, 0, 32, 32); noise(x, r, 32, 32, ['#46161e', '#501c24'], 90); for (const [i, j] of [[8, 8], [24, 24], [24, 8], [8, 24]]) { px(x, '#6a2a30', i - 1, j - 4, 2, 8); px(x, '#6a2a30', i - 4, j - 1, 8, 2); px(x, '#5e2228', i - 2, j - 2, 4, 4); } px(x, '#2e0e12', 0, 31, 32, 1); }, 4103);
  const boardsT = tex(32, 32, (x, r) => { px(x, '#6a4a30', 0, 0, 32, 32); noise(x, r, 32, 32, ['#64462c', '#704e34', '#5e4028'], 200); for (let i = 0; i < 32; i += 8) px(x, '#4a3020', i, 0, 1, 32); }, 4104);
  const plankT = tex(32, 8, (x, r) => { px(x, '#8a6a46', 0, 0, 32, 8); noise(x, r, 32, 8, ['#846442', '#927250', '#7a5c3c'], 80); px(x, '#5a4028', 0, 7, 32, 1); px(x, '#3a2a1a', 2, 3, 1, 1); px(x, '#3a2a1a', 29, 3, 1, 1); }, 4105);
  const dirtT = tex(32, 32, (x, r) => { px(x, '#8a6a4a', 0, 0, 32, 32); noise(x, r, 32, 32, ['#82623f', '#927254', '#7a5a3c', '#9a7a5a'], 300); }, 4106);
  const grassT = tex(32, 32, (x, r) => { px(x, '#5a6a34', 0, 0, 32, 32); noise(x, r, 32, 32, ['#546430', '#62723a', '#4e5e2c', '#6a7a40'], 320); }, 4107);
  const velvetT = tex(16, 32, (x, r) => { for (let i = 0; i < 16; i++) { const v = Math.sin(i / 16 * TAU * 2); px(x, v > 0.3 ? '#9a1424' : v > -0.3 ? '#7a0e1c' : '#560a14', i, 0, 1, 32); } }, 4108);
  const coffinT = tex(16, 32, (x, r) => { px(x, '#3a2418', 0, 0, 16, 32); noise(x, r, 16, 32, ['#36201a', '#40281c'], 60); px(x, '#c8a040', 7, 6, 2, 12); px(x, '#c8a040', 4, 10, 8, 2); }, 4109);
  const satinT = tex(8, 16, (x, r) => { px(x, '#8a1022', 0, 0, 8, 16); noise(x, r, 8, 16, ['#7a0c1c', '#9a1428'], 30); }, 4110);
  const strawT = tex(16, 16, (x, r) => { px(x, '#d8b860', 0, 0, 16, 16); noise(x, r, 16, 16, ['#c8a850', '#e8c870', '#b89840'], 90); px(x, '#8a6a30', 0, 5, 16, 1); px(x, '#8a6a30', 0, 11, 16, 1); }, 4111);

  // ---------- a box pet in a Halloween costume (the guests): a ghost sheet, a witch hat, devil horns, a pumpkin head, bat wings ----------
  const FURS = [0xf2eee6, 0xd8a868, 0x9a9aa4, 0xe8c090, 0x8a7a6c, 0xc8b8a8, 0x6a5a4c];
  const TOPS = [0x4a2a6a, 0x1e1e26, 0xd8642a, 0x2a5a3a, 0x6a1a24, 0x2a3a6a];
  const COSTUMES = ['ghost', 'witch', 'devil', 'pumpkin', 'bat', 'ghost', 'witch', 'devil', 'bat', 'pumpkin'];
  function guestPet(i) {
    const g = new THREE.Group(), Fm = M(FURS[i % FURS.length]), J = M(TOPS[i % TOPS.length]), kind = COSTUMES[i % COSTUMES.length];
    const body = new THREE.Group(); g.add(body);
    const legs = [-1, 1].map(sx => { const l = at(new THREE.Group(), sx * 0.1, 0.3, 0); l.add(at(box(0.13, 0.3, 0.13, M(0x24222a)), 0, -0.15, 0)); body.add(l); return l; });
    body.add(at(box(0.4, 0.38, 0.28, J), 0, 0.5, 0));
    const arms = [-1, 1].map(sx => { const a = at(new THREE.Group(), sx * 0.23, 0.64, 0); a.add(at(box(0.09, 0.28, 0.09, J), 0, -0.12, 0)); a.add(at(box(0.08, 0.08, 0.08, Fm), 0, -0.28, 0)); body.add(a); return a; });
    const head = at(new THREE.Group(), 0, 0.92, 0); body.add(head);
    const pumpkin = kind === 'pumpkin';
    const skull = ico(0.24, 1, pumpkin ? M(0xe8781a, { unlit: 0.2 }) : Fm); skull.scale.set(pumpkin ? 1.15 : 1, 0.9, 0.92); head.add(skull);
    if (pumpkin) { head.add(at(cyl(0.03, 0.04, 0.1, 5, M(0x3a5a20)), 0, 0.24, 0)); for (const e of [-1, 1]) head.add(rot(at(cone(0.05, 0.06, 3, glow(0xffd84a)), e * 0.09, 0.05, 0.21), PI / 2, 0, 0)); head.add(at(box(0.16, 0.04, 0.02, glow(0xffd84a)), 0, -0.07, 0.22)); }
    else {
      const snout = at(ico(0.1, 1, M(0xf0e6d8)), 0, -0.07, 0.19); snout.scale.set(1.1, 0.8, 0.9); head.add(snout);
      head.add(at(ico(0.035, 0, M(0x151515)), 0, -0.03, 0.28));
      for (const e of [-1, 1]) { head.add(at(ico(0.038, 0, M(0x0e0e0e)), e * 0.1, 0.05, 0.19)); head.add(at(ico(0.012, 0, glow(0xffffff)), e * 0.1 + 0.012, 0.065, 0.225)); head.add(rot(at(cone(0.08, 0.2, 4, Fm), e * 0.15, 0.27, 0), 0, 0, -e * 0.25)); }
    }
    const mouth = at(box(0.09, 0.07, 0.02, M(0x5a1a1a)), 0, -0.13, 0.25); mouth.visible = false; if (!pumpkin) head.add(mouth);
    if (kind === 'ghost') {   // a white sheet over the whole pet, two black eye holes: the costume reads at any size
      body.add(at(new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.42, 1.05, 8, 1, true), M(0xf4f4f0, { unlit: 0.25, side: THREE.DoubleSide })), 0, 0.62, 0));
      body.add(at(new THREE.Mesh(new THREE.SphereGeometry(0.3, 8, 5, 0, TAU, 0, PI / 2), M(0xf4f4f0, { unlit: 0.25 })), 0, 1.14, 0));
      for (const e of [-1, 1]) body.add(at(box(0.07, 0.1, 0.02, M(0x101014)), e * 0.1, 1.24, 0.27));
      head.visible = false; arms.forEach(a => { a.visible = false; });
    } else if (kind === 'witch') { head.add(at(cyl(0.3, 0.3, 0.02, 10, M(0x16141c)), 0, 0.2, 0)); head.add(rot(at(cone(0.17, 0.42, 6, M(0x16141c)), 0.02, 0.42, -0.02), -0.15, 0, 0.12)); head.add(at(cyl(0.18, 0.18, 0.05, 8, M(0x7a3aa8)), 0, 0.24, 0)); }
    else if (kind === 'devil') { for (const e of [-1, 1]) head.add(rot(at(cone(0.04, 0.14, 4, M(0xd8242a, { unlit: 0.2 })), e * 0.12, 0.25, 0.04), 0, 0, -e * 0.4)); body.add(rot(at(cyl(0.015, 0.015, 0.4, 4, M(0xd8242a)), 0, 0.4, -0.22), 0.9, 0, 0)); }
    else if (kind === 'bat') { for (const e of [-1, 1]) { const w = at(new THREE.Group(), e * 0.2, 0.68, -0.15); w.add(rot(at(box(0.42, 0.26, 0.02, M(0x1a1a22)), e * 0.2, 0, 0), 0, 0, e * 0.2)); body.add(w); } }
    return { g, body, head, arms, legs, mouth, kind, i };
  }

  // ---------- the trucker: the "Dai Dai" keeper's bulldog in a trucker cap and a plaid shirt ----------
  function bulldog() {
    const g = new THREE.Group();
    const plaidT = tex(16, 16, x => { px(x, '#b82a2a', 0, 0, 16, 16); for (let i = 0; i < 16; i += 8) { px(x, '#2a1414', i, 0, 3, 16); px(x, '#2a1414', 0, i, 16, 3); } px(x, '#e8d8c8', 5, 0, 1, 16); px(x, '#e8d8c8', 0, 5, 16, 1); });
    const shirt = mat({ map: plaidT, rep: [2, 2] }), jeans = M(0x2a3a5a), fur = M(0xc9a27a), furL = M(0xefdcc4), dark = M(0x16121a), boot = M(0x5a3a22), cap = M(0x2a5aa8, { unlit: 0.1 }), capF = M(0xf2f0ea);
    const hips = at(new THREE.Group(), 0, 0.5, 0); g.add(hips);
    const torso = new THREE.Group(); hips.add(torso);
    torso.add(at(box(0.7, 0.58, 0.46, shirt), 0, 0.32, 0)); torso.add(at(box(0.66, 0.16, 0.44, jeans), 0, 0.0, 0));
    const head = at(new THREE.Group(), 0, 0.84, 0.03); torso.add(head);
    const skull = ico(0.31, 1, fur); skull.scale.set(1.18, 0.92, 1.0); head.add(skull);
    const muz = at(ico(0.17, 1, furL), 0, -0.11, 0.21); muz.scale.set(1.35, 0.78, 0.85); head.add(muz);
    for (const s of [-1, 1]) { const j = at(ico(0.1, 1, furL), s * 0.15, -0.17, 0.18); j.scale.set(1, 1.1, 0.9); head.add(j); }
    head.add(at(ico(0.065, 0, dark), 0, -0.03, 0.36));
    for (const s of [-1, 1]) head.add(at(cone(0.022, 0.07, 4, M(0xffffff)), s * 0.08, -0.2, 0.33));
    for (const s of [-1, 1]) { head.add(at(ico(0.048, 0, dark), s * 0.13, 0.06, 0.26)); head.add(at(ico(0.014, 0, glow(0xffffff)), s * 0.13 + 0.014, 0.076, 0.3)); }
    for (const s of [-1, 1]) head.add(rot(at(box(0.12, 0.16, 0.05, M(0x8a6a4a)), s * 0.3, 0.2, -0.02), 0, 0, s * 0.9));
    // the trucker cap, forwards: a blue dome with a white front panel and the brim over his eyes
    const capG = at(new THREE.Group(), 0, 0.14, -0.02); head.add(capG);
    const dome = new THREE.Mesh(new THREE.SphereGeometry(0.3, 10, 6, 0, TAU, 0, PI / 2), cap); dome.scale.set(1.15, 0.75, 1.05); capG.add(dome);
    capG.add(rot(at(box(0.3, 0.16, 0.02, capF), 0, 0.09, 0.28), -0.35, 0, 0));
    capG.add(rot(at(box(0.38, 0.03, 0.24, cap), 0, 0.0, 0.4), 0.12, 0, 0));
    const arms = [-1, 1].map(s => {
      const sh = at(new THREE.Group(), s * 0.39, 0.52, 0); torso.add(sh);
      sh.add(at(box(0.17, 0.3, 0.17, shirt), 0, -0.12, 0));
      const el = at(new THREE.Group(), 0, -0.27, 0); sh.add(el);
      el.add(at(box(0.15, 0.24, 0.15, fur), 0, -0.1, 0)); el.add(at(box(0.17, 0.12, 0.16, furL), 0, -0.25, 0));
      return { sh, el };
    });
    const legs = [-1, 1].map(s => {
      const hp = at(new THREE.Group(), s * 0.18, 0, 0); hips.add(hp);
      hp.add(at(box(0.21, 0.27, 0.23, jeans), 0, -0.12, 0));
      const kn = at(new THREE.Group(), 0, -0.25, 0); hp.add(kn);
      kn.add(at(box(0.17, 0.21, 0.17, jeans), 0, -0.1, 0)); kn.add(at(box(0.2, 0.09, 0.32, boot), 0, -0.21, 0.06));
      return { hp, kn };
    });
    return { g, hips, torso, head, arms, legs };
  }

  // ---------- the big rig: a long-nose red tractor unit, nose to +x, its front bumper at x = 0 of its group ----------
  function rig() {
    const g = new THREE.Group(), red = M(0x9a1a22, { unlit: 0.12 }), redD = M(0x6a1018), chrome = M(0xd8dde6, { unlit: 0.35 }), tyre = M(0x18181c), blackM = M(0x1a1a20), glass = M(0x2a3444, { unlit: 0.15 });
    const amber = glow(0xffb43a), headOn = glow(0xfff6d8), headOff = M(0x9a9a90), heads = [], spin = [];
    g.add(at(box(0.3, 0.32, 2.5, chrome), -0.15, 0.62, 0));                                  // the bumper
    g.add(at(box(0.12, 1.25, 1.4, chrome), -0.36, 1.5, 0));                                  // the tall grille
    g.add(at(box(2.3, 1.25, 1.9, red), -1.55, 1.55, 0));                                     // the long nose
    g.add(at(box(2.3, 0.12, 1.96, redD), -1.55, 2.2, 0));
    for (const s of [-1, 1]) { g.add(rot(at(cyl(0.2, 0.2, 0.1, 10, chrome), -0.32, 1.25, s * 0.95), 0, 0, PI / 2)); const h = at(new THREE.Mesh(new THREE.CircleGeometry(0.16, 10), headOn), -0.26, 1.25, s * 0.95); h.rotation.y = PI / 2; g.add(h); heads.push(h); }
    for (const s of [-1, 1]) g.add(rot(at(new THREE.Mesh(new THREE.CylinderGeometry(0.62, 0.62, 0.5, 10, 1, true, -PI / 2, PI), M(0x9a1a22, { unlit: 0.12, side: THREE.DoubleSide })), -1.4, 0.62, s * 1.05), PI / 2, 0, 0));   // the front fenders
    const cab = new THREE.Group(); g.add(cab);
    cab.add(at(box(1.7, 2.3, 2.3, red), -3.55, 2.05, 0));                                    // the cab
    cab.add(at(box(0.06, 0.8, 2.0, glass), -2.69, 2.6, 0));                                  // the windshield
    for (const s of [-1, 1]) cab.add(at(box(0.9, 0.7, 0.04, glass), -3.4, 2.6, s * 1.16));  // side windows
    cab.add(at(box(1.9, 0.12, 2.3, redD), -3.6, 3.25, 0));                                   // the roof
    for (let i = 0; i < 5; i++) cab.add(at(box(0.08, 0.08, 0.08, amber), -2.75, 3.35, -0.8 + i * 0.4));   // the roof marker lights
    cab.add(at(box(1.8, 2.5, 2.3, red), -5.3, 2.15, 0));                                     // the sleeper
    for (const s of [-1, 1]) { cab.add(at(cyl(0.11, 0.11, 3.3, 8, chrome), -4.4, 2.6, s * 1.25)); cab.add(at(cyl(0.12, 0.08, 0.15, 8, blackM), -4.4, 4.3, s * 1.25)); }   // the exhaust stacks
    for (const s of [-1, 1]) cab.add(at(box(0.08, 0.4, 0.25, chrome), -2.7, 2.5, s * 1.3));  // mirrors
    g.add(at(box(3.2, 0.35, 1.2, blackM), -7.6, 1.05, 0));                                   // the chassis behind
    g.add(at(cyl(0.55, 0.55, 0.12, 10, M(0x2a2a30)), -7.4, 1.3, 0));                          // the fifth wheel
    const axle = (x, r = 0.55) => { for (const s of [-1, 1]) { const w = rot(at(cyl(r, r, 0.4, 12, tyre), x, r, s * 1.0), PI / 2, 0, 0); g.add(w); spin.push(w); g.add(rot(at(cyl(r * 0.45, r * 0.45, 0.42, 8, chrome), x, r, s * 1.0), PI / 2, 0, 0)); } };
    axle(-1.4); axle(-6.6); axle(-8.0);
    for (const s of [-1, 1]) g.add(rot(at(cyl(0.32, 0.32, 1.1, 10, chrome), -5.0, 0.95, s * 1.15), 0, 0, PI / 2));   // the fuel tanks
    // the headlights' beams: two dithered cones out of the front, on at night
    const beamM = mat({ color: 0xfff2c8, unlit: 1, see: 0.72, nofog: 1 }), beams = new THREE.Group(); g.add(beams);
    for (const s of [-1, 1]) { const c = new THREE.Mesh(new THREE.ConeGeometry(1.4, 7, 10, 1, true), beamM); c.rotation.z = PI / 2; c.position.set(3.2, 1.0, s * 0.95); beams.add(c); }
    // the smoke: grey puffs rising out of the stacks
    const puffM = mat({ color: 0xc8c8cc, unlit: 0.5, see: 0.45 }), puffs = [];
    for (let i = 0; i < 14; i++) { const p = ico(0.35, 1, puffM); g.add(p); puffs.push(p); }
    return { g, spin, beams, puffs, heads, headOn, headOff };
  }

  function farmhouse() {
    const G = new THREE.Group();
    // ---------- the ground: the field's grass, the yard's dirt, the truck's patch and the track ----------
    G.add(flat(160, 160, mat({ map: grassT, rep: [160 / 3, 160 / 3] }), 0, -0.01, 0));
    G.add(flat(20, 14, mat({ map: dirtT, rep: [20 / 2.5, 14 / 2.5] }), 0, 0.004, 10.8));
    G.add(flat(30, 9, mat({ map: dirtT, rep: [30 / 2.5, 9 / 2.5] }), -15, 0.003, 0.5));
    // ---------- the room's floor and its furniture (they stay when the house goes) ----------
    const floorG = new THREE.Group(); G.add(floorG);
    floorG.add(flat(W + 2 * F.T, D + 2 * F.T, mat({ map: boardsT, rep: [W / 1.6, D / 1.6] }), 0, 0.012, 0));
    const rug = flat(1, 1, M(0x6a1424), -0.3, 0.02, 0.2); rug.geometry = new THREE.CircleGeometry(1.9, 14); floorG.add(rug);
    // the grandfather clock: a tall dark case, a big white face with 12 ticks and two hands, a pendulum behind glass
    const clockG = at(new THREE.Group(), F.CLOCK[0], 0, F.CLOCK[1]); floorG.add(clockG);
    const caseM = M(0x3a2216);
    clockG.add(at(box(0.66, 1.92, 0.42, caseM), 0, 0.96, 0)); clockG.add(at(box(0.78, 0.12, 0.5, caseM), 0, 1.98, 0)); clockG.add(at(box(0.78, 0.1, 0.5, caseM), 0, 0.05, 0));
    const faceT = tex(32, 32, x => { x.fillStyle = '#f4ecd8'; x.beginPath(); x.arc(16, 16, 15, 0, TAU); x.fill(); x.fillStyle = '#2a2018'; for (let i = 0; i < 12; i++) { const a = i * TAU / 12; x.fillRect(16 + Math.sin(a) * 12 - 1, 16 - Math.cos(a) * 12 - 1, i % 3 ? 2 : 3, i % 3 ? 2 : 3); } });
    clockG.add(at(new THREE.Mesh(new THREE.CircleGeometry(0.3, 16), mat({ map: faceT, unlit: 0.5 })), 0, 1.5, 0.215));
    clockG.add(at(new THREE.Mesh(new THREE.RingGeometry(0.3, 0.34, 16), M(0xc8a040, { unlit: 0.3 })), 0, 1.5, 0.216));
    const handM = M(0x14100c), hourH = at(new THREE.Group(), 0, 1.5, 0.225), minH = at(new THREE.Group(), 0, 1.5, 0.23);
    hourH.add(at(box(0.04, 0.17, 0.01, handM), 0, 0.075, 0)); minH.add(at(box(0.028, 0.25, 0.01, handM), 0, 0.115, 0)); clockG.add(hourH, minH);
    clockG.add(at(box(0.36, 0.7, 0.02, M(0x1a1410, { unlit: 0.2 })), 0, 0.72, 0.215));
    const pend = at(new THREE.Group(), 0, 1.06, 0.23); clockG.add(pend);
    pend.add(at(box(0.02, 0.5, 0.01, M(0xc8a040, { unlit: 0.3 })), 0, -0.25, 0)); pend.add(rot(at(cyl(0.08, 0.08, 0.02, 10, M(0xd8b048, { unlit: 0.4 })), 0, -0.52, 0), PI / 2, 0, 0));
    // the red velvet sofa against the back wall
    const sofa = at(new THREE.Group(), F.SOFA[0], 0, F.SOFA[1]); floorG.add(sofa);
    const vel = mat({ map: velvetT, rep: [3, 1] });
    sofa.add(at(box(2.1, 0.32, 0.8, vel), 0, F.SOFA_Y - 0.16, 0)); sofa.add(at(box(2.1, 0.85, 0.22, vel), 0, 0.7, -0.33));
    for (const s of [-1, 1]) sofa.add(at(box(0.2, 0.62, 0.8, vel), s * 1.1, 0.4, 0));
    for (const s of [-1, 1]) for (const z of [-0.3, 0.3]) sofa.add(at(box(0.08, 0.12, 0.08, M(0xc8a040)), s * 0.95, 0.06, z));
    // three coffins standing against the left wall, lids swung open towards +z (their red satin shows)
    const coffinShape = new THREE.Shape(); coffinShape.moveTo(-0.22, 0); coffinShape.lineTo(0.22, 0); coffinShape.lineTo(0.32, 1.45); coffinShape.lineTo(0.2, 1.95); coffinShape.lineTo(-0.2, 1.95); coffinShape.lineTo(-0.32, 1.45); coffinShape.lineTo(-0.22, 0);
    for (const [x, z] of F.COFFINS) {
      const c = at(new THREE.Group(), x, 0, z); floorG.add(c);
      const bodyC = new THREE.Mesh(new THREE.ExtrudeGeometry(coffinShape, { depth: 0.36, bevelEnabled: false }), M(0x2a1810)); bodyC.rotation.y = PI / 2; bodyC.position.set(-0.2, 0, 0); c.add(bodyC);
      const inside = new THREE.Mesh(new THREE.ShapeGeometry(coffinShape), mat({ map: satinT })); inside.rotation.y = PI / 2; inside.scale.set(0.88, 0.96, 1); c.add(at(inside, 0.17, 0.03, 0));
      const lidP = at(new THREE.Group(), 0.17, 0, 0.32); c.add(lidP);
      const lid = new THREE.Mesh(new THREE.ShapeGeometry(coffinShape), mat({ map: coffinT, side: THREE.DoubleSide })); lid.rotation.y = PI / 2; lid.position.set(0, 0, -0.32); lidP.add(lid); lidP.rotation.y = -1.3;
    }
    // the punch table and its bowl, a candelabra on it; two tall floor candelabras by the sofa
    const table = at(new THREE.Group(), F.TABLE[0], 0, F.TABLE[1]); floorG.add(table);
    table.add(at(box(0.7, 0.06, 1.3, M(0x3a2216)), 0, 0.78, 0)); for (const [dx, dz] of [[-0.3, -0.58], [0.3, -0.58], [-0.3, 0.58], [0.3, 0.58]]) table.add(at(box(0.06, 0.78, 0.06, M(0x2a180e)), dx, 0.39, dz));
    table.add(at(cyl(0.22, 0.14, 0.16, 10, M(0xd8e4f0, { unlit: 0.3 })), 0, 0.9, -0.25)); table.add(at(cyl(0.2, 0.2, 0.02, 10, M(0xa8142a, { unlit: 0.3 })), 0, 0.96, -0.25));
    const flame = glow(0xffd070), wax = M(0xf2ead8), brass = M(0xc8a040, { unlit: 0.3 });
    const candelabra = h => { const c = new THREE.Group(); c.add(at(cyl(0.02, 0.03, h, 5, brass), 0, h / 2, 0)); c.add(at(box(0.5, 0.03, 0.03, brass), 0, h, 0)); c.add(at(cyl(0.14, 0.16, 0.04, 8, brass), 0, 0.02, 0)); for (const dx of [-0.24, 0, 0.24]) { c.add(at(cyl(0.025, 0.025, 0.14, 5, wax), dx, h + 0.08, 0)); c.add(at(cone(0.025, 0.06, 4, flame), dx, h + 0.18, 0)); } return c; };
    table.add(at(candelabra(0.3), 0, 0.82, 0.3));
    const floorCandles = F.CANDLES.map(([x, z]) => { const c = at(candelabra(1.35), x, 0, z); floorG.add(c); return c; });
    // ---------- the shell: walls, ceiling, roof, windows, door, the portrait, the chandelier (towed away) ----------
    const shell = new THREE.Group(); G.add(shell);
    const { w: ww, h: wh, sill } = F.WIN;
    // a wall along `axis` ('x': at z = at0, 'z': at x = at0) with rectangular holes [c, w, y0, y1]; nOut points outside
    // (its clapboard face is F.T further out); the inside face is damask; frames line each hole
    function wall(len, axis, at0, holes, nOut) {
      const H = F.H, cuts = holes.map(([c, w, y0, y1]) => [c - w / 2, c + w / 2, y0, y1]).sort((a, b) => a[0] - b[0]), segs = [];
      let p = -len / 2;
      for (const [a, b, y0, y1] of cuts) { if (a > p) segs.push([p, a, 0, H]); segs.push([a, b, 0, y0]); segs.push([a, b, y1, H]); p = b; }
      if (p < len / 2) segs.push([p, len / 2, 0, H]);
      const face = (T2, a, b, y0, y1, off, outward) => {
        const m = new THREE.Mesh(new THREE.PlaneGeometry(b - a, y1 - y0), mat({ map: T2, rep: [(b - a) / 1.2, (y1 - y0) / 1.2] })), c = (a + b) / 2, yc = (y0 + y1) / 2;
        const n = outward ? nOut : -nOut;   // the way this face looks
        if (axis === 'x') { m.position.set(c, yc, at0 + off); m.rotation.y = n > 0 ? 0 : PI; }
        else { m.position.set(at0 + off, yc, c); m.rotation.y = n > 0 ? PI / 2 : -PI / 2; }
        shell.add(m);
      };
      for (const [a, b, y0, y1] of segs) { if (b - a < 0.005 || y1 - y0 < 0.005) continue; face(damaskT, a, b, y0, y1, 0, false); face(clapT, a, b, y0, y1, nOut * F.T, true); }
      const frameM = M(0xf0eee6);
      for (const [a, b, y0, y1] of cuts) {
        const pieces = [[b - a, 0.05, (a + b) / 2, y0], [b - a, 0.05, (a + b) / 2, y1], [0.05, y1 - y0, a, (y0 + y1) / 2], [0.05, y1 - y0, b, (y0 + y1) / 2]];
        for (const [sx, sy, pc, py] of pieces) { const bx = axis === 'x' ? box(sx, sy, F.T, frameM) : box(F.T, sy, sx, frameM); if (axis === 'x') bx.position.set(pc, py, at0 + nOut * F.T / 2); else bx.position.set(at0 + nOut * F.T / 2, py, pc); shell.add(bx); }
      }
    }
    const winHole = c => [c, ww, sill, sill + wh];
    wall(W, 'x', F.Z1, [[F.DOOR[0], F.DOOR[1], 0.001, F.DOOR[2]], ...F.WIN_F.map(winHole)], 1);
    wall(W, 'x', F.Z0, F.WIN_B.map(winHole), -1);
    wall(D, 'z', F.X1, F.WIN_R.map(winHole), 1);
    wall(D, 'z', F.X0, F.WIN_L.map(winHole), -1);
    for (const [x, z] of [[F.X0 - F.T / 2, F.Z0 - F.T / 2], [F.X1 + F.T / 2, F.Z0 - F.T / 2], [F.X0 - F.T / 2, F.Z1 + F.T / 2], [F.X1 + F.T / 2, F.Z1 + F.T / 2]]) shell.add(at(box(F.T + 0.06, F.H, F.T + 0.06, M(0xf0eee6)), x, F.H / 2, z));
    // the ceiling, the roof (a gable along x), the gable ends, the chimney
    const ceil = new THREE.Mesh(new THREE.PlaneGeometry(W, D), M(0x2a1416)); ceil.rotation.x = PI / 2; shell.add(at(ceil, 0, F.H, 0));
    const roofH = 2.1, run = D / 2 + F.T + 0.45, rafter = Math.hypot(run, roofH);
    for (const s of [-1, 1]) { const r = at(box(W + 1.0, 0.12, rafter, mat({ map: roofT, rep: [(W + 1) / 1.5, rafter / 1.5] })), 0, F.H + roofH / 2 - 0.05, s * run / 2); r.rotation.x = s * Math.atan2(roofH, run); shell.add(r); }
    for (const sx of [-1, 1]) { const gs = new THREE.Shape(); gs.moveTo(-(D / 2 + F.T), 0); gs.lineTo(D / 2 + F.T, 0); gs.lineTo(0, roofH); gs.lineTo(-(D / 2 + F.T), 0); const gm = new THREE.Mesh(new THREE.ShapeGeometry(gs), mat({ map: clapT, rep: [D / 1.2, 2], side: THREE.DoubleSide })); gm.rotation.y = PI / 2; gm.position.set(sx * (W / 2 + F.T), F.H, 0); shell.add(gm); }
    shell.add(at(box(0.6, 1.6, 0.6, M(0x7a3a2a)), 2.6, F.H + roofH + 0.1, -0.9));
    // the awning and the porch light over the door
    shell.add(rot(at(box(1.8, 0.06, 0.8, mat({ map: roofT, rep: [1.5, 1] })), 0, 2.75, F.Z1 + F.T + 0.38), -0.25, 0, 0));
    const porchLamp = at(ico(0.09, 1, glow(0xffd890)), 0.75, 2.45, F.Z1 + F.T + 0.08); shell.add(porchLamp);
    // the door: a dark leaf hinged on its left edge, swinging in
    const doorP = at(new THREE.Group(), F.DOOR[0] - F.DOOR[1] / 2, 0, F.Z1 + F.T / 2); shell.add(doorP);
    doorP.add(at(box(F.DOOR[1], F.DOOR[2], 0.06, M(0x3a2216)), F.DOOR[1] / 2, F.DOOR[2] / 2, 0));
    doorP.add(at(ico(0.04, 0, brass), F.DOOR[1] - 0.12, 1.05, 0.06));
    // the count's portrait over the sofa, cobwebs in the corners, an iron chandelier
    shell.add(at(box(1.1, 1.3, 0.05, M(0xc8a040, { unlit: 0.25 })), F.SOFA[0], 2.35, F.Z0 + 0.04));
    const portT = tex(16, 20, x => { px(x, '#2a1a24', 0, 0, 16, 20); px(x, '#8a8a90', 4, 4, 8, 7); px(x, '#1a1418', 4, 2, 8, 3); px(x, '#1a1418', 3, 12, 10, 8); px(x, '#a8142a', 6, 13, 4, 2); px(x, '#f4f0e6', 7, 12, 2, 3); px(x, '#101010', 6, 7, 1, 1); px(x, '#101010', 9, 7, 1, 1); });
    shell.add(at(new THREE.Mesh(new THREE.PlaneGeometry(0.95, 1.15), mat({ map: portT, unlit: 0.2 })), F.SOFA[0], 2.35, F.Z0 + 0.07));
    const webM = mat({ color: 0xe8e8ec, unlit: 0.5, see: 0.35 });
    for (const [x, z, ry] of [[F.X0 + 0.02, F.Z0 + 0.02, PI / 4], [F.X1 - 0.02, F.Z0 + 0.02, -PI / 4], [F.X0 + 0.02, F.Z1 - 0.02, 3 * PI / 4]]) {
      const w = new THREE.Group();
      for (let i = 0; i < 5; i++) { const a = (i / 4 - 0.5) * PI * 0.5, l = at(box(0.012, 0.75, 0.012, webM), Math.sin(a) * 0.37, -Math.cos(a) * 0.37, 0); l.rotation.z = a; w.add(l); }
      for (const r of [0.25, 0.45, 0.65]) w.add(at(box(r * 1.3, 0.012, 0.012, webM), 0, -r * 0.8, 0));
      w.position.set(x, F.H - 0.02, z); w.rotation.y = ry; shell.add(w);
    }
    const chand = at(new THREE.Group(), -0.3, F.H - 0.75, 0.2); shell.add(chand);
    { const ring = new THREE.Mesh(new THREE.TorusGeometry(0.45, 0.03, 4, 14), M(0x2a2a30)); ring.rotation.x = PI / 2; chand.add(ring); chand.add(at(cyl(0.01, 0.01, 0.75, 4, M(0x2a2a30)), 0, 0.37, 0));
      for (let i = 0; i < 6; i++) { const a = i * TAU / 6; chand.add(at(cyl(0.022, 0.022, 0.12, 5, wax), Math.cos(a) * 0.45, 0.07, Math.sin(a) * 0.45)); chand.add(at(cone(0.022, 0.05, 4, flame), Math.cos(a) * 0.45, 0.16, Math.sin(a) * 0.45)); } }
    // the windows: red curtains inside, planks nailed across (from the sill up, gaps between them)
    const curtains = [], planks = [], winList = [...F.WIN_F.map(c => ['F', c]), ...F.WIN_B.map(c => ['B', c]), ...F.WIN_R.map(c => ['R', c]), ...F.WIN_L.map(c => ['L', c])];
    const ph = (wh - 0.03 * (PLANKS - 1)) / PLANKS;
    const winKey = winList.map(([side], i) => side + winList.slice(0, i).filter(([s2]) => s2 === side).length);
    winList.forEach(([side, c], wi) => {
      const place = (o, inset) => {   // at the window's centre, `inset` metres inside the room, facing in
        if (side === 'F') { o.position.set(c, sill + wh / 2, F.Z1 - inset); o.rotation.y = PI; }
        else if (side === 'B') { o.position.set(c, sill + wh / 2, F.Z0 + inset); o.rotation.y = 0; }
        else if (side === 'R') { o.position.set(F.X1 - inset, sill + wh / 2, c); o.rotation.y = -PI / 2; }
        else { o.position.set(F.X0 + inset, sill + wh / 2, c); o.rotation.y = PI / 2; }
        return o;
      };
      for (const s of [-1, 1]) { const cu = place(new THREE.Group(), 0.12); const leaf = at(box(ww / 2 + 0.15, wh + 0.5, 0.05, mat({ map: velvetT, rep: [2, 1] })), 0, 0.1, 0); cu.add(leaf); cu.userData = { leaf, s }; shell.add(cu); curtains.push(cu); }
      const pg = place(new THREE.Group(), 0.03); shell.add(pg);
      for (let i = 0; i < PLANKS; i++) { const p = at(box(ww + 0.24, ph, 0.05, mat({ map: plankT })), 0, -wh / 2 + ph / 2 + i * (ph + 0.03), 0); p.rotation.z = (hash(i, wi * 3 + 7) - 0.5) * 0.06; pg.add(p); planks.push({ p, side, i, wi }); }
    });
    // warm panes in the windows, seen from outside at night (the party's light): one per window, facing out
    const paneM = mat({ color: 0xffc070, unlit: 0.9, see: 0.35 }), panes = [];
    winList.forEach(([side, c]) => {
      const m = new THREE.Mesh(new THREE.PlaneGeometry(ww, wh), paneM);
      if (side === 'F') { m.position.set(c, sill + wh / 2, F.Z1 + F.T + 0.01); }
      else if (side === 'B') { m.position.set(c, sill + wh / 2, F.Z0 - F.T - 0.01); m.rotation.y = PI; }
      else if (side === 'R') { m.position.set(F.X1 + F.T + 0.01, sill + wh / 2, c); m.rotation.y = PI / 2; }
      else { m.position.set(F.X0 - F.T - 0.01, sill + wh / 2, c); m.rotation.y = -PI / 2; }
      shell.add(m); panes.push(m);
    });
    // ---------- the sunbeams: a flat sheet of light per gap between the right windows' planks, and the gaps' floor stripes ----------
    const beamM = mat({ color: 0xffe2a0, unlit: 1, see: 0.62, side: THREE.DoubleSide }), patchM = mat({ color: 0xffd890, unlit: 0.95, side: THREE.DoubleSide }), floodM = mat({ color: 0xffe6b0, unlit: 1, see: 0.7, side: THREE.DoubleSide });
    const dir = new THREE.Vector3(...F.SUN).normalize().negate();
    const tri = (pts, m) => { const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pts.flat(), 3)); g.computeVertexNormals(); return new THREE.Mesh(g, m); };
    const sheet = (y0, y1, z0, z1, m) => {   // the band y0..y1 of the slit at x = X1 (z0..z1), along dir to the floor
      const q = (y, zz, yy = null) => { const tq = y / -dir.y; return [F.X1 + dir.x * tq, yy ?? 0.025, zz + dir.z * tq]; };
      const y = (y0 + y1) / 2, a = [F.X1 - 0.02, y, z0], b = [F.X1 - 0.02, y, z1];
      const shaft = tri([a, b, q(y, z1, 0.03), a, q(y, z1, 0.03), q(y, z0, 0.03)], m);
      const stripe = tri([q(y0, z0), q(y1, z0), q(y1, z1), q(y0, z0), q(y1, z1), q(y0, z1)], patchM);
      const mid = q(y, (z0 + z1) / 2);
      return { shaft, stripe, mid };
    };
    const BEAMS = [];
    F.WIN_R.forEach(c => { for (let i = 0; i < PLANKS - 1; i++) { const yg = sill + (i + 1) * ph + i * 0.03, b = sheet(yg - 0.03, yg + 0.06, c - ww / 2 + 0.06, c + ww / 2 - 0.06, beamM); BEAMS.push(b); floorG.add(b.stripe); shell.add(b.shaft); } });
    const BEAM_ORDER = [5, 2, 4, 1, 3, 0];   // the front window's top gap first (it lands mid-room), then the rest
    const floods = F.WIN_R.map(c => { const b = sheet(sill, sill + wh, c - ww / 2, c + ww / 2, floodM); floorG.add(b.stripe); shell.add(b.shaft); return b; });
    const doorCrack = at(box(F.DOOR[1], 0.01, 0.5, patchM), F.DOOR[0], 0.02, F.Z1 - 0.25); floorG.add(doorCrack);
    const sunPatch = flat(1, 1, patchM, 0, 0.03, 0); sunPatch.visible = false; floorG.add(sunPatch);   // `patch` [x, z, w, d]: a sun patch of its own (the cat's)
    // ---------- the yard: four poles, the string lights in a canopy, hay bales, a fence, a barn, trees, hills ----------
    const poleM = M(0x4a3626), wireM = M(0x1a1a1a), bulbM = glow(0xffd88a), bulbOff = M(0x8a7a60), bulbs = [];
    const stringsG = new THREE.Group(); G.add(stringsG);   // `strings` false hides the poles and the string lights (a wide lens through them)
    for (const [x, z] of F.POLES) stringsG.add(at(cyl(0.06, 0.08, 4.2, 6, poleM), x, 2.1, z));
    const strand = (a, b, n, sag) => {
      const P3 = u => [a[0] + (b[0] - a[0]) * u, 4.0 - sag * 4 * u * (1 - u), a[1] + (b[1] - a[1]) * u];
      for (let i = 0; i <= n; i++) {
        const [x, y, z] = P3(i / n); const q = at(ico(0.07, 0, bulbM), x, y - 0.08, z); stringsG.add(q); bulbs.push(q);
        if (i < n) { const [x2, y2, z2] = P3((i + 1) / n), seg = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.02, Math.hypot(x2 - x, y2 - y, z2 - z)), wireM); seg.position.set((x + x2) / 2, (y + y2) / 2, (z + z2) / 2); seg.lookAt(x2, y2, z2); stringsG.add(seg); }
      }
    };
    const [p0, p1, p2, p3] = F.POLES;
    strand(p0, p1, 16, 0.5); strand(p2, p3, 16, 0.5); strand(p0, p2, 10, 0.4); strand(p1, p3, 10, 0.4); strand(p0, p3, 20, 0.7); strand(p1, p2, 20, 0.7);
    for (const [x, z, ry] of F.BALES) G.add(rot(at(box(1.1, 0.5, 0.55, mat({ map: strawT, rep: [2, 1] })), x, 0.25, z), 0, ry, 0));
    for (let x = -11; x <= 11; x += 2.2) { G.add(at(box(0.1, 1.0, 0.1, poleM), x, 0.5, 16.5)); if (x < 10.9) G.add(at(box(2.2, 0.08, 0.05, poleM), x + 1.1, 0.75, 16.5)); }
    const barn = at(new THREE.Group(), -13, 0, -12); G.add(barn);
    barn.add(at(box(7, 5, 6, M(0x8a2a22)), 0, 2.5, 0)); const bRoof = prism(4.2, 7.4, M(0x3a3a40), 'x'); bRoof.position.set(0, 5.6, 0); barn.add(bRoof);
    barn.add(at(box(2.4, 3, 0.05, M(0xf0ece4)), 0, 1.5, 3.02));
    for (const [x, z, s] of [[9, -8, 1.2], [12, 4, 1], [-12.5, 14.5, 1.1], [15, -14, 1.4], [-21, 5, 1.3], [6, -16, 1.1], [-6, -18, 1.5]]) {
      const tr = at(new THREE.Group(), x, 0, z); G.add(tr); tr.scale.setScalar(s);
      tr.add(at(cyl(0.18, 0.25, 2.4, 6, M(0x3a2a1c)), 0, 1.2, 0)); tr.add(at(ico(1.6, 1, M(0x2a3a22)), 0, 3.2, 0)); tr.add(at(ico(1.1, 1, M(0x324428)), 0.6, 4.1, 0.3));
    }
    const hillM = M(0x3a4630), hills = new THREE.Group(); G.add(hills);
    for (let i = 0; i < 16; i++) { const a = -PI + i * TAU / 16 + hash(i, 2) * 0.2, d = 75 + hash(i, 3) * 25, h = 8 + hash(i, 4) * 10, w = 30 + hash(i, 5) * 20; const m = at(new THREE.Mesh(new THREE.ConeGeometry(w, h, 5), hillM), Math.sin(a) * d, h / 2 - 1, -Math.cos(a) * d); m.scale.z = 0.6; m.rotation.y = a; hills.add(m); }
    // ---------- the sky: night (stars, a full moon), pre-dawn (indigo to pink), sunrise (the sun over the eastern hills) ----------
    const nightT = grad([[0, '#0a1030'], [0.5, '#141c48'], [1, '#2a305a']]), preT = grad([[0, '#141a48'], [0.3, '#3a2e6a'], [0.44, '#b8587e'], [0.5, '#ff9a7a'], [0.56, '#ffc08a'], [1, '#ffc08a']]), riseT = grad([[0, '#4a7ab8'], [0.45, '#9ab8d8'], [0.6, '#ffc890'], [1, '#ffb070']]);
    const dome = (T2, r) => { const m = new THREE.Mesh(new THREE.SphereGeometry(r, 16, 10), mat({ map: T2, unlit: 1, nofog: 1, side: THREE.BackSide })); G.add(m); return m; };
    const nightDome = dome(nightT, 190), preDome = dome(preT, 189), riseDome = dome(riseT, 188);
    const starsM = stars(140, 180, 41, 0xffffff, 0.15); G.add(starsM);
    const moon = at(new THREE.Mesh(new THREE.CircleGeometry(12, 18), mat({ color: 0xf4f0dc, unlit: 1, nofog: 1 })), -30, 62, -150); moon.lookAt(0, 0, 0); G.add(moon);
    const sunDisc = at(new THREE.Mesh(new THREE.CircleGeometry(10, 18), mat({ color: 0xfff2c0, unlit: 1, nofog: 1 })), 160, 14, 30); sunDisc.lookAt(0, 0, 0); G.add(sunDisc);
    const sunHalo = at(new THREE.Mesh(new THREE.RingGeometry(10, 22, 18), mat({ color: 0xffd890, unlit: 1, nofog: 1, see: 0.5 })), 159, 14, 30); sunHalo.lookAt(0, 0, 0); G.add(sunHalo);
    // ---------- the guests: costumed box pets dancing in the yard or the room ----------
    const YARD_SPOTS = [[-5.0, 6.4], [-3.4, 9.6], [-1.6, 12.2], [1.6, 12.4], [3.6, 9.8], [5.2, 6.6], [-6.0, 10.6], [6.0, 11.0], [-2.6, 14.4], [2.6, 14.6], [0, 15.2], [-4.6, 13.0], [4.6, 13.2], [-6.4, 7.8]];
    const ROOM_SPOTS = [[-2.6, 2.8], [2.8, 2.6], [3.6, 0.6], [-1.6, -2.6], [2.9, -2.4], [3.8, -1.0], [1.6, 3.0], [-3.0, 1.2]];
    const guests = YARD_SPOTS.map((p, i) => { const q = guestPet(i); G.add(q.g); return q; });
    // ---------- hearts over a point: [[x, y, z, s0, loop]] (three pink hearts popping and rising), heartYaw ----------
    const heartM = M(0xff4f9a, { unlit: 0.8 }), hearts = [];
    for (let i = 0; i < 12; i++) { const h = new THREE.Group(); h.add(at(ico(0.1, 0, heartM), -0.075, 0, 0)); h.add(at(ico(0.1, 0, heartM), 0.075, 0, 0)); h.add(rot(at(cone(0.125, 0.18, 4, heartM), 0, -0.11, 0), PI, 0, 0)); h.visible = false; G.add(h); hearts.push(h); }
    // ---------- the rig, its driver, the chain ----------
    const R = rig(); G.add(R.g);
    const driver = bulldog(); G.add(driver.g);
    // steel links big enough to read as a chain (thin pale ones read as floating white hexagons: the critic)
    const chainM = M(0x9aa0aa, { unlit: 0.3 }), chain = new THREE.Group(); G.add(chain);
    // each link oval along the chain, in turn upright and flat (both planes hold the chain's line; the old odd links stood
    // across it, face on to the yard)
    for (let i = 0; i < 9; i++) { const l = new THREE.Mesh(new THREE.TorusGeometry(0.13, 0.045, 5, 10), chainM); l.rotation.set(i % 2 ? PI / 2 : 0, 0, 0); l.scale.set(1.4, 1, 1); chain.add(l); }

    return {
      group: G, sky: null, shadowCol: 0x3a2c22,
      light() { lights(0x40486a, 0x8aa0d0, [0.3, -0.8, 0.5], 0x141a34, [30, 110], 9); },
      anim(t, P = {}) {
        const s = shotT(t, P), b = beat(t), zone = P.zone || 'night', inside = !!P.inside, rise = zone === 'sunrise', pre = zone === 'predawn';
        const tow = P.tow ? (P.tow[3] || 0) + (P.tow[2] - (P.tow[3] || 0)) * sm((s - P.tow[0]) / Math.max(0.01, P.tow[1])) : 0;
        // `haul` [x0, z0, x1, z1] (+ `haulDur` s): the house dragged across the field far off, its centre moving at a steady
        // pace from (x0, z0) to (x1, z1), the rig ahead of it on that line, nose back to the house (the reveal: seen from
        // behind, along the tow's own line, the house hides the rig)
        const hl = P.haul, hu = hl ? cl(s / Math.max(0.01, P.haulDur || 4)) : 0, hdx = hl ? hl[2] - hl[0] : 0, hdz = hl ? hl[3] - hl[1] : 0, hL = Math.hypot(hdx, hdz) || 1;
        const opened = tow > 0.2 || !!hl;
        // the light: outside by zone; inside, candles at night, the dark room at sunrise until the house goes
        if (inside && !rise) { lights(0x5a4048, 0xffd8a8, [0.2, -0.9, -0.3], 0x120a0c, [12, 40], 7); pt(0, -0.3, 2.4, 0.2, 1.1, 0.8, 0.5); pt(1, F.CANDLES[0][0], 1.6, F.CANDLES[0][1] + 0.6, 0.6, 0.42, 0.22); pt(2, F.CANDLES[1][0], 1.6, F.CANDLES[1][1] + 0.6, 0.6, 0.42, 0.22); }
        else if (inside && rise && !opened) lights(0x3a3036, 0xffc890, [-0.9, -0.35, -0.2], 0x0e0a0a, [12, 40], 6);
        else if (rise) lights(0xb8a8a0, 0xffd0a0, [-0.92, -0.3, -0.22], 0xd8b0a0, [40, 170], 9);
        else if (pre) { lights(0x4a4870, 0xc8a0c0, [-0.7, -0.5, -0.3], 0x3a3058, [30, 120], 9); pt(0, 0, 3.6, 9.4, 0.7, 0.5, 0.3); }
        else { lights(0x40486a, 0x8aa0d0, [0.3, -0.8, 0.5], 0x141a34, [30, 110], 9); pt(0, 0, 3.6, 9.4, 1.1, 0.8, 0.45); pt(1, 0, 3.0, 5.6, 0.7, 0.5, 0.3); }
        nightDome.visible = !pre && !rise; preDome.visible = pre; riseDome.visible = rise; starsM.visible = !rise; moon.visible = !rise && !pre; sunDisc.visible = rise; sunHalo.visible = rise;
        if (P.moon) { moon.position.set(...P.moon); moon.lookAt(0, 0, 0); }
        bulbs.forEach((q, i) => { q.material = rise ? bulbOff : bulbM; q.scale.setScalar(rise ? 0.7 : 0.85 + 0.25 * Math.exp(-fr(b + i * 0.13) * 3)); });
        porchLamp.visible = !rise; floorCandles.forEach(c => { c.visible = P.candles !== false; }); stringsG.visible = P.strings !== false; panes.forEach(m => { m.visible = !inside && !rise && P.panes !== false; });
        // the shell follows the tow; the door
        if (hl) shell.position.set(hl[0] + hdx * hu, 0, hl[1] + hdz * hu); else shell.position.set(-tow, 0, 0);
        shell.visible = P.shell !== false;
        doorP.rotation.y = -1.4 * ramp(P.door, s, 0);
        // the curtains: open (pulled to the sides) .. drawn
        const cur = ramp(P.curtains, s, 0);
        curtains.forEach(cu => { cu.userData.leaf.position.x = cu.userData.s * (ww / 4 + 0.1 + (1 - cur) * (ww / 2 + 0.05)); });
        // the planks: `boards` 0-1 of each window, bottom first; `boardsAt` [s0, gap] pops them in; a flood knocks the right ones off from the top
        const bfrac = ramp(P.boards, s, 0), flood = ramp(P.flood, s, 0);
        planks.forEach(q => {
          let on = bfrac * PLANKS > q.i + 0.01;
          if (P.boardsAt) { const [s0, gap] = P.boardsAt; on = on && s >= s0 + (q.i + q.wi * 0.25) * gap; }
          for (const n of (P.nail ? (Array.isArray(P.nail[0]) ? P.nail : [P.nail]) : [])) if (n.slice(2).includes(winKey[q.wi])) on = s >= n[0] + q.i * n[1];   // this window's planks hammered on one by one (a list of such schedules)
          if (q.side === 'R' && flood > 0.05) on = on && q.i < PLANKS * (1 - flood) - 0.01;
          q.p.visible = on;
        });
        // the sunbeams (sunrise only): n of them, in order; the floods once the right planks are down; the door's crack
        const nBeam = rise ? Math.round(ramp(P.beams, s, 0)) : 0;
        BEAMS.forEach(q => { q.shaft.visible = false; q.stripe.visible = false; });
        BEAM_ORDER.slice(0, nBeam).forEach(i => { if (!BEAMS[i]) return; BEAMS[i].shaft.visible = P.shafts !== false; BEAMS[i].stripe.visible = !opened; });
        floods.forEach(q => { const on = rise && flood > 0.05 && !opened; q.shaft.visible = on && P.shafts !== false; q.stripe.visible = on; });
        doorCrack.visible = (pre || rise) && !!P.crack && !opened;
        sunPatch.visible = !!P.patch && rise && !opened; if (P.patch) { sunPatch.position.set(P.patch[0], 0.03, P.patch[1]); sunPatch.scale.set(P.patch[2], P.patch[3], 1); }
        if (inside && rise && !opened && (nBeam || flood > 0.05)) {
          const mb = BEAMS[BEAM_ORDER[0]].mid; pt(0, mb[0], 0.9, mb[2], 1.2, 0.95, 0.6);
          if (flood > 0.05) floods.forEach((q, i) => pt(1 + i, q.mid[0], 1.0, q.mid[2], 1.3 * flood, 1.0 * flood, 0.65 * flood));
          else if (nBeam > 2) { const m2 = BEAMS[BEAM_ORDER[2]].mid; pt(1, m2[0], 0.9, m2[2], 0.9, 0.7, 0.45); }
        }
        if (P.key) pt(3, P.key[0], P.key[1], P.key[2], P.key[3], P.key[4], P.key[5]);
        // the clock: the time (hours), or spun from h0 to h1 over [s0, s1]; the pendulum swings on the beat
        const hrs = Array.isArray(P.clock) ? P.clock[0] + (P.clock[1] - P.clock[0]) * sm((s - P.clock[2]) / Math.max(0.01, P.clock[3] - P.clock[2])) : (P.clock ?? 2.0);
        minH.rotation.z = -(hrs % 1) * TAU; hourH.rotation.z = -(hrs / 12) * TAU;
        pend.rotation.z = 0.28 * Math.sin(b * PI);
        // the rig: parked at TRUCK_X (nose to +x), driving in, or reversing away with the house
        const showT = P.truck !== false;
        let tx = F.TRUCK_X - tow;
        if (P.arrive) { const [s0, dur, x0] = P.arrive, u = cl((s - s0) / dur); tx = x0 + (F.TRUCK_X - x0) * (1 - (1 - u) * (1 - u)); }
        R.g.visible = showT; R.g.position.set(tx, 0, F.TRUCK_Z); R.g.rotation.y = 0; R.spin.forEach(w => { w.rotation.y = (tx - F.TRUCK_X) * 1.8; });
        if (hl) {   // the rig 2 m ahead of the house's edge along the haul, nose back to it
          const ux = hdx / hL, uz = hdz / hL, ext = Math.abs(ux) * (W / 2 + F.T) + Math.abs(uz) * (D / 2 + F.T) + 2.0;
          R.g.position.set(shell.position.x + ux * ext, 0, shell.position.z + uz * ext); R.g.rotation.y = Math.atan2(uz, -ux);
          R.spin.forEach(w => { w.rotation.y = hL * hu * 1.8; });
        }
        const lightsOn = P.lights ?? !!P.arrive;
        R.beams.visible = !!lightsOn && !rise; R.heads.forEach(h => { h.material = lightsOn ? R.headOn : R.headOff; });
        const smoke = P.smoke ?? (!!P.arrive || !!P.tow);
        R.puffs.forEach((q, i) => { const u = fr(s * 0.6 + i / R.puffs.length), side = i % 2 ? 1 : -1; q.visible = !!smoke; q.position.set(-4.4 - u * 1.6, 4.4 + u * 3.2, side * 1.25 + Math.sin(i * 7 + s) * 0.3); q.scale.setScalar(0.5 + u * 1.8); });
        if (lightsOn && !rise && !inside) pt(2, tx + 3.5, 1.3, F.TRUCK_Z, 1.2, 1.1, 0.85);
        // the chain from the bumper to the left wall
        chain.visible = showT && P.chain !== false && !P.arrive && !hl;
        const cx0 = F.X0 - F.T - tow, cx1 = tx - 0.1;
        chain.children.forEach((l, i) => { const u = (i + 0.5) / chain.children.length; l.position.set(cx0 + (cx1 - cx0) * u, 0.5 - 0.3 * Math.sin(u * PI) * (tow > 0.1 ? 0 : 1), F.TRUCK_Z); });   // slack, it sags to the dirt
        // the driver: in the cab, at the chain, waving, standing
        const Dv = P.driver || { pose: 'cab' }, dg = driver.g;
        dg.visible = showT && !Dv.hide;
        driver.legs.forEach(l => { l.hp.rotation.set(0, 0, 0); l.kn.rotation.set(0, 0, 0); }); driver.arms.forEach(a => { a.sh.rotation.set(0, 0, 0); a.el.rotation.set(0, 0, 0); });
        driver.torso.rotation.set(0, 0, 0); driver.head.rotation.set(0, 0, 0); dg.rotation.set(0, 0, 0); dg.scale.setScalar(0.92);
        const seated = () => driver.legs.forEach(l => { l.hp.rotation.set(-1.45, 0, 0); l.kn.rotation.set(1.3, 0, 0); });
        if (Dv.pose === 'hook') {   // bent at the chain by the house's left wall, hooking it on
          const ha = Dv.at || [F.X0 - F.T - 0.8, F.TRUCK_Z + 0.6]; dg.position.set(ha[0] - tow, 0, ha[1]); dg.rotation.y = Dv.yaw != null ? Dv.yaw * PI / 180 : PI * 0.62; driver.torso.rotation.x = 0.55; driver.head.rotation.x = -0.35;
          driver.arms.forEach((a, i) => { a.sh.rotation.set(-1.2, 0, (i ? 1 : -1) * 0.15); a.el.rotation.set(-0.3 - 0.25 * Math.abs(Math.sin(s * 9 + i)), 0, 0); });
          driver.legs.forEach(l => { l.hp.rotation.set(-0.35, 0, 0); l.kn.rotation.set(0.5, 0, 0); });
        } else if (Dv.pose === 'stand') { const [x, z, yaw] = Dv.at || [F.X0 - 2.2, 2.0, PI / 2]; dg.position.set(x, 0, z); dg.rotation.y = yaw; }
        else {   // in the cab, facing +x behind the windshield, at the wheel (or waving out of the side window)
          dg.position.set(tx - 3.3, 1.55, F.TRUCK_Z - 0.45); dg.rotation.y = PI / 2; seated();
          if (hl) { const th = R.g.rotation.y, c = Math.cos(th), sn = Math.sin(th); dg.position.set(R.g.position.x - 3.3 * c - 0.45 * sn, 1.55, R.g.position.z + 3.3 * sn - 0.45 * c); dg.rotation.y = PI / 2 + th; }
          if (Dv.pose === 'wave') { dg.rotation.y = PI / 2 + 0.6; driver.arms[0].sh.rotation.set(-0.3, 0, -2.4); driver.arms[0].el.rotation.set(0, 0, -0.4 + 0.35 * Math.sin(s * 9)); driver.arms[1].sh.rotation.set(-1.15, 0, 0); }
          else { driver.arms.forEach(a => { a.sh.rotation.set(-1.15, 0, 0); a.el.rotation.set(-0.5, 0, 0); }); driver.head.rotation.x = 0.12 * Math.exp(-fr(b) * 4); }
        }
        hearts.forEach((h, i) => {
          const q = (P.hearts || [])[Math.floor(i / 3)]; h.visible = false; if (!q) return;
          let e = s - q[3] - (i % 3) * 0.3; if (q[4] && e > 0) e %= 1.2;
          if (e < 0 || e > 1.4) return;
          h.visible = true; h.position.set(q[0] + ((i % 3) - 1) * 0.22 + 0.06 * Math.sin(e * 6 + i), q[1] + 0.55 * e, q[2]); h.scale.setScalar(Math.min(1, e * 5) * (1.15 - 0.25 * (e / 1.4)));
          h.rotation.y = (P.heartYaw ?? 0) * PI / 180;
        });
        // the guests: in the yard or the room, dancing, fleeing for the door, cheering, staring
        const mode = P.noguests ? false : (P.guests ?? (inside ? false : 'dance'));
        let spots = P.spots || (P.where === 'room' ? ROOM_SPOTS : YARD_SPOTS);
        if (P.gather) { const [cx, cz, r, a0 = -150, a1 = 150, n = guests.length, k0 = 999, k1 = 999] = P.gather; spots = Array.from({ length: n }, (_, i) => { const a = (a0 + (a1 - a0) * (n > 1 ? i / (n - 1) : 0.5)) * PI / 180, rr = r + (i % 2) * 0.55, deg = a * 180 / PI; return deg > k0 && deg < k1 ? null : [cx + Math.sin(a) * rr, cz + Math.cos(a) * rr]; }); }   // k0..k1: an angle range left empty (the space straight behind the leads)
        const gc = P.gather ? [P.gather[0], P.gather[1]] : null;
        guests.forEach((q, i) => {
          const sp = spots[i], show = mode !== false && !!sp && !cleared(P, sp[0], sp[1]);
          q.g.visible = show; if (!show) return;
          q.g.position.set(sp[0], 0, sp[1]); q.body.position.y = 0; q.body.rotation.set(0, 0, 0); q.head.rotation.set(0, 0, 0);
          q.arms.forEach(a => a.rotation.set(0, 0, 0)); q.legs.forEach(l => l.rotation.set(0, 0, 0)); q.mouth.visible = false;
          const tx2 = P.stare ? P.stare[0] : gc ? gc[0] : 0, tz2 = P.stare ? P.stare[1] : gc ? gc[1] : (P.where === 'room' ? 0 : 8.6);
          q.g.rotation.y = Math.atan2(tx2 - sp[0], tz2 - sp[1]);
          const ph2 = b + (i % 3) * 0.33;
          if (mode === 'dance') { const up = Math.abs(Math.sin(ph2 * PI)); q.body.position.y = 0.06 * up; q.body.rotation.z = 0.12 * Math.sin(ph2 * PI); q.arms.forEach((a, j) => { a.rotation.z = (j ? 1 : -1) * (2.3 + 0.35 * up); }); q.head.rotation.z = 0.15 * Math.sin(ph2 * PI); }
          else if (mode === 'cheer') { q.arms.forEach((a, j) => { a.rotation.z = (j ? 1 : -1) * 2.55; }); q.mouth.visible = true; q.body.position.y = 0.05 * Math.abs(Math.sin(b * PI)); }
          else if (mode === 'stare') q.mouth.visible = true;
          else if (mode === 'flee') {   // running for the door, arms up, legs pumping, from the spot over the shot
            const dx = F.DOOR[0] - sp[0], dz = F.Z1 + 0.6 - sp[1], len = Math.hypot(dx, dz), u = cl(s * 1.6 / Math.max(1, len) - (i % 4) * 0.12);
            q.g.position.set(sp[0] + dx * u, 0, sp[1] + dz * u); q.g.rotation.y = Math.atan2(dx, dz); q.g.visible = u < 0.97;
            q.legs.forEach((l, j) => { l.rotation.x = 0.7 * Math.sin(s * 16 + j * PI); }); q.arms.forEach((a, j) => { a.rotation.z = (j ? 1 : -1) * 2.6; a.rotation.x = 0.3 * Math.sin(s * 16 + j * PI); }); q.mouth.visible = true;
          }
        });
      },
    };
  }

  return { farmhouse: farmhouse() };
}
