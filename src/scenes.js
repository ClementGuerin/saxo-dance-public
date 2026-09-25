// scenes.js: short action scenes (?scene=skate | fight) instead of the dance video. Same rules as the dance renderer:
// every frame is a pure function of t (the clips are sampled at absolute times, nothing carries between frames).
// window.SCENE_FX tells the 2D layer what to draw on top: a comic "POW!" burst at a screen point, a flash, a K.O. card.

export function sceneRenderer(name, K, opt = {}) {
  const { THREE, scene, camera, renderer, MAPS, tripo: saxo, sadi, mat, box, SADI_SCALE, SHADOW, footY, clipGround, shake, bounce, wearOutfit } = K;
  const cl = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v)), sm = x => { x = cl(x); return x * x * (3 - 2 * x); };
  const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
  const bone = (D, re) => { let f = null; D.root.traverse(o => { if (!f && o.isBone && re.test(o.name)) f = o; }); return f; };
  for (const D of [saxo, sadi]) if (D) { D.hips = bone(D, /Hips$/); D.headB = bone(D, /Head$/); }

  // put a character in one clip at one time (loop, or hold the last frame)
  function pose(D, clip, time, hold = false) {
    const c = D.clips[clip], a = D.actions[clip];
    for (const x of Object.values(D.actions)) x.weight = x === a ? 1 : 0;
    a.time = hold ? cl(time, 0, c.duration - 1e-3) : ((time % c.duration) + c.duration) % c.duration;
    D.mixer.update(0); D.holder.updateMatrixWorld(true);
  }
  function shadowAt(D, map, s = 1) {
    const p = D.hips.getWorldPosition(V()), lift = Math.max(0, minVertY(D, 6) - (D.deck || 0));   // height of the lowest point of the body
    D.shadow.visible = true; D.shadow.position.set(p.x, 0.012, p.z); D.shadow.scale.setScalar(s * Math.max(0.45, 1 - lift * 0.9));
    D.shadow.material.uniforms.uShadow.value = SHADOW * Math.max(0.3, 1 - lift);
    D.shadow.material.uniforms.uShadowCol.value.set(map.shadowCol || 0x333333);
  }
  // ---- floor contact, measured on the skinned mesh itself (bones sit inside the body, so they can't tell) ----
  const _v = new THREE.Vector3();
  function skins(D) { const out = []; D.root.traverse(o => { if (o.isSkinnedMesh && o.visible) out.push(o); }); return out; }
  function minVertY(D, stride = 2) {   // lowest point of the visible body/outfit, world y
    let m = Infinity;
    for (const sk of skins(D)) { const n = sk.geometry.attributes.position.count; for (let i = 0; i < n; i += stride) { sk.getVertexPosition(i, _v); _v.applyMatrix4(sk.matrixWorld); if (_v.y < m) m = _v.y; } }
    return m;
  }
  // Per clip, per outfit: the holder height that keeps the lowest point of the mesh on the floor, frame by frame
  // (feet when standing, back and head when lying). Frames where the clip itself is airborne (its lowest bone
  // well above the clip's own floor level) are bridged between the contact frames around them, so jumps and
  // flights survive. Then smoothed a little so there's no jitter. Deterministic, cached.
  const GC = {};
  function groundCurve(D, clip, look) {
    const key = (D === sadi ? 'A:' : 'B:') + clip + ':' + look + ':' + D.holder.scale.x; if (GC[key]) return GC[key];
    const keep = D.holder.position.y, dur = D.clips[clip].duration, N = Math.ceil(dur * 30) + 1;
    wearOutfit(D, look); D.holder.position.y = 0;
    const mv = [];
    for (let k = 0; k < N; k++) { pose(D, clip, Math.min(k / 30, dur - 1e-3), true); mv.push(minVertY(D, 3)); }
    // airborne = the body's lowest point is above where it was standing on frame 0 (every one of these clips starts
    // standing). Bone heights can't tell: the dogs' big heads and bodies reach much further below their bones than
    // the Mixamo actor's, so lying frames sit lower than standing ones in the clip's own space.
    const level = mv[0], off = mv.map(v => v < level + 0.08 ? -v : NaN), air = off.map(v => isNaN(v));
    for (let k = 0; k < N; k++) if (isNaN(off[k])) {   // bridge airborne frames linearly
      let a = k; while (a >= 0 && isNaN(off[a])) a--; let b = k; while (b < N && isNaN(off[b])) b++;
      off[k] = a < 0 ? off[b] : b >= N ? off[a] : off[a] + (off[b] - off[a]) * (k - a) / (b - a);
    }
    const sm5 = off.map((_, k) => { let s = 0, c = 0; for (let j = -2; j <= 2; j++) if (off[k + j] !== undefined) { s += off[k + j]; c++; } return s / c; });
    for (let k = 0; k < N; k++) if (!air[k]) sm5[k] = Math.max(sm5[k], -mv[k]);   // smoothing must never push the body into the floor
    D.holder.position.y = keep;
    return GC[key] = { off: sm5, air, dur };
  }
  function groundAt(D, clip, look, time, hold = true) {
    const g = groundCurve(D, clip, look), d = g.dur, x = (hold ? cl(time, 0, d) : ((time % d) + d) % d) * 30, k = Math.floor(x), f = x - k;
    const a = g.off[Math.min(k, g.off.length - 1)], b = g.off[Math.min(k + 1, g.off.length - 1)];
    D.air = g.air[Math.min(Math.round(x), g.air.length - 1)];   // meant to be in the air (the QA gate allows it)
    return a + (b - a) * f;
  }
  // audit: lowest mesh point of each visible character at time t (0 = on the floor)
  window.GROUND_AUDIT = t => { window.render3d(t); return [saxo, sadi].filter(D => D && D.holder.visible && skins(D).length).map(D => +minVertY(D, 1).toFixed(3)); };

  let curMap = null;
  function useMap(m, t, ...lightArgs) {
    const map = MAPS[m];
    for (const m of Object.values(MAPS)) m.group.visible = m === map;   // an episode's dance shots switch maps in between
    scene.background = map.sky; curMap = map;
    map.light(...lightArgs); map.anim(t); return map;
  }
  function shoot(pos, look, fov, t, seed, kick = 0) {
    if (opt.wide) pos = look.clone().lerp(pos, opt.wide);   // an episode can pull every camera back (its shots are cut tighter)
    const sh = shake(t, seed), bo = bounce(t);
    camera.position.set(pos.x + sh[0] * 0.05 + kick * Math.sin(t * 90) * 0.12, pos.y + sh[1] * 0.04 - bo * 0.6 + kick * Math.cos(t * 77) * 0.08, pos.z + sh[2] * 0.04);
    camera.fov = fov * (1 - bo) * (1 - kick * 0.12); camera.updateProjectionMatrix();
    camera.lookAt(look.x + sh[1] * 0.03, look.y, look.z); window.WHIP = 0;
  }
  function toScreen(p) { const q = p.clone().project(camera); return { x: (q.x + 1) / 2, y: (1 - q.y) / 2 }; }
  const shotOf = (shots, t, cam) => { if (cam != null) return [cam, shots[cam], shots[cam + 1] ?? Infinity];   // an episode picks the camera, the bar grid picks the cut
    let i = 0; while (i + 1 < shots.length && t >= shots[i + 1]) i++; return [i, shots[i], shots[i + 1] ?? Infinity]; };
  // an episode alternates scenes with dance shots: each call says who and what is visible, and hide() clears the props
  const show = (...on) => { for (const D of [saxo, sadi]) if (D) { D.holder.visible = on.includes(D); D.shadow.visible = on.includes(D); D.air = false; D.deck = 0; } };

  return name === 'skate' ? skate() : fight();

  // ---------------- Sadi skates down the night street and ollies a traffic cone ----------------
  function skate() {
    const D = opt.who === 'saxo' ? saxo : sadi, s = D === sadi ? SADI_SCALE : 1, DECK = 0.1, look = opt.look || D.base; D.deck = DECK;
    // stance, from the riding clip in the bind orientation: board centre (between the feet), board axis
    // (back foot → front foot) and the way her body faces (perpendicular to the board)
    D.holder.rotation.y = 0; D.holder.position.set(0, 0, 0); pose(D, 'skate_idle', 0);
    const [fL, fR] = D.feet.map(f => f.getWorldPosition(V())), c = fL.clone().add(fR).multiplyScalar(0.5);
    const theta = Math.atan2(fL.x - fR.x, fL.z - fR.z);
    const d = D.R.getWorldPosition(V()).sub(D.L.getWorldPosition(V())), faceA = Math.atan2(d.z, -d.x);   // body forward, as an angle from +z
    // ride height: the lowest toe over the riding clip sits on the deck (toes rest restFoot above the sole)
    let minToe = Infinity; for (let x = 0; x < 1; x += 0.1) { pose(D, 'skate_idle', x); minToe = Math.min(minToe, footY(D)); }
    const ground = D.restFoot * s - minToe;
    // the board: deck with kicked-up ends, trucks, four wheels (low-poly, PS1 material)
    const board = new THREE.Group(), deckM = mat({ color: 0xff5fa2 }), gripM = mat({ color: 0x1a1a22 }), truckM = mat({ color: 0xb8bcc8 }), wheelM = mat({ color: 0xf2e6c8 });
    const deck = box(0.2, 0.022, 0.56, deckM); deck.position.y = DECK - 0.011; board.add(deck);
    const grip = box(0.19, 0.006, 0.54, gripM); grip.position.y = DECK + 0.002; board.add(grip);
    for (const e of [-1, 1]) {
      const kick = box(0.2, 0.022, 0.13, deckM); kick.position.set(0, DECK + 0.02, e * 0.33); kick.rotation.x = -e * 0.45; board.add(kick);
      const tr = box(0.16, 0.03, 0.04, truckM); tr.position.set(0, DECK - 0.035, e * 0.2); board.add(tr);
    }
    const wheels = [];
    for (const [x, z] of [[-0.08, -0.2], [0.08, -0.2], [-0.08, 0.2], [0.08, 0.2]]) {
      const w = new THREE.Mesh(new THREE.CylinderGeometry(0.032, 0.032, 0.03, 6), wheelM); w.rotation.z = Math.PI / 2; w.position.set(x, 0.032, z);
      const g = new THREE.Group(); g.position.copy(w.position); w.position.set(0, 0, 0); g.add(w); board.add(g); wheels.push(g);
    }
    board.rotation.order = 'YXZ'; D.holder.add(board);
    board.position.set(c.x / s, -(ground + DECK) / s, c.z / s); board.scale.setScalar(1 / s);   // wheels on the street under her (the holder rides at ground + deck)
    // a traffic cone to ollie over
    const coneM = mat({ color: 0xff6a1a }), stripeM = mat({ color: 0xf4f4f4 });
    const cone = new THREE.Group(); const cb = box(0.34, 0.03, 0.34, coneM); cb.position.y = 0.015; cone.add(cb);
    const ck = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.42, 6), coneM); ck.position.y = 0.24; cone.add(ck);
    const cs = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.09, 0.07, 6), stripeM); cs.position.y = 0.2; cone.add(cs);
    scene.add(cone);

    // travel down the street (-z) in the right lane: pushes speed her up for 3 s, then she glides
    const X0 = 1.2, Z0 = 0, PHI = Math.PI, psi = PHI - theta;
    const dist = t => t < 3 ? t + 0.275 * t * t + 0.06 * Math.sin(t * 2 * Math.PI / 2.17) : 5.475 + 2.65 * (t - 3);
    const TO = 6.3, OL = 0.8;                                // ollie start and airtime
    const zAt = t => Z0 - dist(t), coneZ = zAt(TO + OL / 2);
    cone.position.set(X0, 0, coneZ); cone.visible = false;
    const travel = V(Math.sin(PHI), 0, Math.cos(PHI)), side = V(Math.sin(faceA + psi), 0, Math.cos(faceA + psi));   // the side her face is on
    const SHOTS = [0, 3.0, 5.3, 8.2];
    window.SCENE_END = 10;
    const R = (t, cam) => {
      const [i, t0, t1] = shotOf(SHOTS, t, cam), u = cl((t - t0) / (Math.min(t1, 10) - t0));
      const P = V(X0, 0, zAt(t)), map = useMap('street', t, P.z / 1.4);
      show(D); D.deck = DECK; cone.visible = true; board.visible = true;
      // ollie: pop (nose up), float, land (tail touches first)
      const o = (t - TO) / OL, air = o > 0 && o < 1 ? Math.sin(Math.PI * o) : 0;
      const jump = 0.55 * air, pitch = o > 0 && o < 1 ? (o < 0.3 ? 0.55 * Math.sin(Math.PI * o / 0.3) : -0.18 * Math.sin(Math.PI * (o - 0.3) / 0.7)) : 0;
      D.holder.rotation.y = psi;
      const cw = c.clone().applyAxisAngle(V(0, 1, 0), psi);
      const clip = t < 3 ? 'skate_push' : 'skate_idle', gy = groundAt(D, clip, look, t, false);
      D.holder.position.set(P.x - cw.x, gy + DECK + jump, P.z - cw.z);
      wearOutfit(D, look); pose(D, clip, t);
      board.position.y = -(gy + DECK) / s; if (jump > 0.02) D.air = true;   // wheels stay on the street; only the ollie lifts the board
      board.rotation.set(-pitch, theta, 0);
      for (const w of wheels) w.rotation.x = -dist(t) / 0.032;
      shadowAt(D, map, s * 1.1);
      const at = P.clone().add(V(0, 0.75 + jump * 0.6, 0));
      if (i === 0) shoot(P.clone().addScaledVector(side, 3.4).addScaledVector(travel, 0.8).setY(0.85), at, 50, t, 3);            // tracking alongside
      else if (i === 1) shoot(P.clone().addScaledVector(travel, 3.4 - 1.2 * u).addScaledVector(side, 1.5).setY(0.3), at, 62, t, 7); // low, ahead of her, she rolls in
      else if (i === 2) shoot(V(X0, 0, coneZ).addScaledVector(side, 4.2).addScaledVector(travel, -0.8).setY(0.55), at, 52, t, 11);   // locked on the cone, pans with her
      else shoot(P.clone().addScaledVector(travel, -3.2 - 0.6 * u).addScaledVector(side, 1.1).setY(2.0), P.clone().addScaledVector(travel, 2).setY(0.5), 55, t, 13);   // chase
      const land = o > 1 ? Math.exp(-(o - 1) * OL * 12) : 0;
      window.SCENE_FX = { flash: 0, pow: 0 };
      if (land > 0.02) window.SCENE_FX = { pow: land, word: opt.word || 'SICK!', ...toScreen(P.clone().add(V(0, D === saxo ? 0.55 : 1.3, 0)).addScaledVector(travel, D === saxo ? 1.1 : 0)) };   // Saxo's big head fills that spot: put it ahead of him
      renderer.render(scene, camera);
      return renderer.domElement;
    };
    R.hide = () => { cone.visible = false; board.visible = false; D.deck = 0; };
    return R;
  }

  // ---------------- Sadi (cheerleader) beats Saxo up in the stadium: uppercut, replay, slam, K.O. ----------------
  function fight() {
    const A = sadi, B = saxo, D_OFF = +(new URLSearchParams(location.search).get('gap') || 0.5);   // victim's head start in the uppercut
    const SLAM_X = -0.14;   // Saxo is chunkier than the Mixamo actor the slam was made for: step him back so bodies don't merge
    const UP = 1.2, SLAM0 = 1.0;   // uppercut contact in the clip; where the slam shot starts in its clip
    // slam contact: the moment the victim's hips drop fastest (measured once, deterministic)
    let slamHit = 6;
    { B.holder.position.set(0, 0, 0); B.holder.rotation.y = 0; let best = 0, prev = null;
      for (let x = 4; x < 7.4; x += 1 / 30) { pose(B, 'slam_vic', x, true); const y = B.hips.getWorldPosition(V()).y; if (prev !== null && prev - y > best) { best = prev - y; slamHit = x; } prev = y; } }
    const SHOTS = [0, 3.4, 5.0, 5.0 + (7.4 - SLAM0), 5.0 + (7.4 - SLAM0) + 2.4];
    const END = SHOTS[4];
    window.SCENE_END = END;
    const R = (t, cam) => {
      const [i, t0, t1] = shotOf(SHOTS, t, cam), u = cl((t - t0) / (Math.min(t1, END) - t0));
      const map = useMap('stadium', t); show(A, B);
      wearOutfit(A, 'cheer'); wearOutfit(B, 'saxo');
      A.holder.rotation.y = 0; B.holder.rotation.y = 0; A.holder.position.set(0, 0, 0); B.holder.position.set(0, 0, 0);
      let hitT = null, kick = 0, fx = { pow: 0, flash: 0 };
      if (i <= 1) {
        const ct = i === 0 ? t : 0.85 + (t - t0) * 0.4;        // shot 2 is the slow-motion replay of the hit
        B.holder.position.z = D_OFF;
        A.holder.position.y = groundAt(A, 'uppercut_atk', 'cheer', ct); B.holder.position.y = groundAt(B, 'uppercut_vic', 'saxo', ct);
        pose(A, 'uppercut_atk', ct, true); pose(B, 'uppercut_vic', ct, true);
        const since = ct - UP; if (since > 0) { const e = Math.exp(-since * (i === 0 ? 5 : 2.5)); kick = e; fx = { pow: e, word: i === 0 ? 'POW!' : 'BAM!', flash: i === 0 ? 0.6 * Math.exp(-since * 18) : 0 }; }
        if (i === 0) shoot(V(3.3, 1.0, 1.9), V(0, 0.95, 0.55), 50, t, 5, kick * 0.8);
        else shoot(V(2.6, 0.45, 1.2 + D_OFF), V(0, 1.1, 0.5 + D_OFF * 0.5), 55, t, 9, kick * 0.5);   // low, from the victim's side
        hitT = B.headB;
      } else if (i === 2) {
        const ct = SLAM0 + (t - t0);
        B.holder.position.x = SLAM_X;
        A.holder.position.y = groundAt(A, 'slam_atk', 'cheer', ct); B.holder.position.y = groundAt(B, 'slam_vic', 'saxo', ct);
        pose(A, 'slam_atk', ct, true); pose(B, 'slam_vic', ct, true);
        const since = ct - slamHit; if (since > 0) { const e = Math.exp(-since * 4); kick = e; fx = { pow: e, word: 'BOOM!', flash: 0.6 * Math.exp(-since * 18) }; }
        const ang = (200 - 48 * sm(u)) * Math.PI / 180, r = 4.3 - 0.8 * u;
        shoot(V(-0.2 + Math.sin(ang) * r, 1.35 - 0.3 * u, Math.cos(ang) * r), V(-0.25, 0.8, 0), 50, t, 15, kick);
        hitT = B.hips;
      } else {
        // K.O.: Saxo stays down, Sadi celebrates next to him
        B.holder.position.set(SLAM_X, groundAt(B, 'slam_vic', 'saxo', 7.5), 0); pose(B, 'slam_vic', 7.5, true);
        A.holder.position.set(0.55, groundAt(A, 'gangnam', 'cheer', t - t0 + 2, false), 0.55); pose(A, 'gangnam', t - t0 + 2);
        shoot(V(0.2 + 0.4 * u, 0.5 + 0.3 * u, 3.6 - 1.0 * u), V(0.1, 0.55, 0.2), 55, t, 19);
        fx = { ko: sm((t - t0) / 0.35), pow: 0 };
      }
      shadowAt(A, map); shadowAt(B, map);
      if (hitT && fx.pow > 0.02) Object.assign(fx, toScreen(hitT.getWorldPosition(V()).add(V(0, 0.15, 0))));
      window.SCENE_FX = fx;
      renderer.render(scene, camera);
      return renderer.domElement;
    };
    R.hide = () => {};
    return R;
  }
}
