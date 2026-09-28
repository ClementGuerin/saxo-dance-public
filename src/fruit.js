// fruit.js: low-poly fruit from primitives (2026-09-28, "Hootie Frutti"), shared by the props in paws and flying
// (src/ps1.js: `hold: "banana"`, an actor's `pelt`) and the map's fruit bar and pile (src/maps15.js). Sizes are about
// twice a real fruit's, so they read at 270x480 next to a 1.25 m dog. Colours are light: a hex renders darker and
// redder through the linear conversion, and a little `unlit` keeps them bright in the warehouse's shade.
export const FRUITS = ['banana', 'orange', 'apple', 'melon', 'pineapple', 'grapes', 'lemon', 'slice'];
export const SMALL_FRUIT = ['orange', 'apple', 'banana', 'lemon', 'grapes', 'pineapple', 'strawberry'];   // what a pile or a volley is made of

// the FRUIT ONLY sign (a 64 x 80 canvas): the words, a banana, cherries, a strawberry, a pineapple, and a carrot crossed out
export function drawFruitOnly(x, TAU = Math.PI * 2) {
  const px = (c, a, b, w, h) => { x.fillStyle = c; x.fillRect(a, b, w, h); };
  px('#fffdf2', 0, 0, 64, 80); px('#2a2a2a', 0, 0, 64, 2); px('#2a2a2a', 0, 78, 64, 2); px('#2a2a2a', 0, 0, 2, 80); px('#2a2a2a', 62, 0, 2, 80);
  x.fillStyle = '#e8384a'; x.font = 'bold 13px sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('FRUIT', 32, 11); x.fillText('ONLY', 32, 25);
  px('#ffd83a', 8, 36, 12, 4); px('#ffd83a', 6, 34, 3, 3); px('#6a4a2a', 20, 37, 2, 2);
  px('#e8384a', 26, 38, 5, 5); px('#e8384a', 33, 39, 5, 5); px('#3a8a3a', 30, 33, 2, 5);
  px('#e8384a', 44, 35, 8, 7); px('#3a9a3a', 44, 33, 8, 2); px('#ffe08a', 46, 38, 1, 1); px('#ffe08a', 49, 37, 1, 1);
  px('#d8a030', 26, 50, 8, 11); px('#3a9a3a', 27, 45, 6, 5);
  px('#ff8a2a', 22, 66, 20, 5); px('#ff8a2a', 26, 71, 12, 2); px('#3a9a3a', 40, 63, 5, 4);
  x.strokeStyle = '#e8384a'; x.lineWidth = 3; x.beginPath(); x.arc(32, 68, 12, 0, TAU); x.stroke(); x.beginPath(); x.moveTo(24, 76); x.lineTo(40, 60); x.stroke();
}

export function fruitMesh(K, kind) {   // K: the renderer's map kit (THREE, mat, tex)
  const { THREE, mat, tex } = K, G = new THREE.Group(), PI = Math.PI;
  const M = (c, u = 0.3) => mat({ color: c, unlit: u });
  const ico = (r, d, m) => new THREE.Mesh(new THREE.IcosahedronGeometry(r, d), m);
  const cyl = (rt, rb, h, seg, m) => new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), m);
  const cone = (r, h, seg, m) => new THREE.Mesh(new THREE.ConeGeometry(r, h, seg), m);
  const add = (o, x = 0, y = 0, z = 0) => { o.position.set(x, y, z); G.add(o); return o; };
  const leaf = (x, y, z, s = 1) => { const l = add(new THREE.Mesh(new THREE.BoxGeometry(0.05 * s, 0.012, 0.03 * s), M(0x5ad05a)), x, y, z); l.rotation.z = 0.5; return l; };
  if (kind === 'fruitsign') {       // the FRUIT ONLY placard on a stick, both faces (the door's host holds it up)
    const face = mat({ map: tex(64, 80, x => drawFruitOnly(x), 1503), unlit: 0.6 });
    add(new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.54, 0.02), M(0x8a6a44, 0.1)), 0, 0.4, 0);
    for (const f of [1, -1]) { const m = add(new THREE.Mesh(new THREE.PlaneGeometry(0.4, 0.5), face), 0, 0.4, f * 0.012); m.rotation.y = f > 0 ? 0 : PI; }
    add(cyl(0.012, 0.012, 0.36, 4, M(0x8a6a44, 0.1)), 0, 0.0, 0);   // the paw grips the stick under the board
  } else if (kind === 'banana') {          // a curved banana: four segments on an arc, brown tips; its middle at the origin
    const Y = M(0xffe45a, 0.35), B = M(0x6a4a2a, 0.1);
    for (let i = 0; i < 4; i++) { const a = -0.6 + i * 0.4, s = cyl(0.034, 0.034, 0.085, 6, Y); s.position.set(Math.sin(a) * 0.17, (1 - Math.cos(a)) * 0.17 - 0.05, 0); s.rotation.z = -a + PI / 2; G.add(s); }
    const tip = (a, len) => { const s = cyl(0.012, 0.02, len, 5, B); s.position.set(Math.sin(a) * 0.19, (1 - Math.cos(a)) * 0.19 - 0.05, 0); s.rotation.z = -a + PI / 2; G.add(s); };
    tip(-0.82, 0.04); tip(0.82, 0.03);
  } else if (kind === 'orange') {
    add(ico(0.075, 1, M(0xffa33a))); leaf(0.02, 0.075, 0);
  } else if (kind === 'lemon') {
    const l = add(ico(0.065, 1, M(0xfff06a, 0.35))); l.scale.set(1.3, 0.95, 0.95);
    for (const s of [-1, 1]) add(cone(0.02, 0.03, 5, M(0xfff06a, 0.35)), s * 0.09, 0, 0).rotation.z = -s * PI / 2;
  } else if (kind === 'apple') {
    const a = add(ico(0.075, 1, M(0xff5a5a))); a.scale.set(1, 0.9, 1);
    add(cyl(0.006, 0.008, 0.05, 4, M(0x5a3a1a, 0.1)), 0, 0.08, 0); leaf(0.025, 0.085, 0);
  } else if (kind === 'melon') {    // a whole watermelon: striped green, long
    const T = tex(16, 8, x => { x.fillStyle = '#5aba4a'; x.fillRect(0, 0, 16, 8); x.fillStyle = '#2a7a2a'; for (let i = 0; i < 16; i += 3) x.fillRect(i, 0, 1, 8); }, 1501);
    const m = add(new THREE.Mesh(new THREE.IcosahedronGeometry(0.2, 1), mat({ map: T, unlit: 0.25 }))); m.scale.set(1.35, 1, 1);
  } else if (kind === 'slice') {    // a watermelon slice: red flesh, a green rind on the arc, black seeds
    const flesh = add(new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.05, 8, 1, false, -PI / 3, 2 * PI / 3), M(0xff4a5e, 0.35)));
    flesh.rotation.x = PI / 2;
    const rind = add(new THREE.Mesh(new THREE.CylinderGeometry(0.175, 0.175, 0.052, 8, 1, true, -PI / 3, 2 * PI / 3), M(0x3aa03a, 0.3)));
    rind.rotation.x = PI / 2; rind.material.side = THREE.DoubleSide;
    for (let i = 0; i < 7; i++) { const u = (i - 3) / 3; add(new THREE.Mesh(new THREE.BoxGeometry(0.012, 0.018, 0.056), M(0x151515, 0)), u * 0.075, -0.105 + 0.012 * (1 - u * u), 0); }   // a curved row of seeds above the rind: three read as a little face
    G.children.forEach(o => { o.position.y += 0.16; });   // the wedge points down from its tip: lifted, the rind sits in the paw and the tip points up
  } else if (kind === 'pineapple') {
    const T = tex(8, 8, x => { x.fillStyle = '#e8b040'; x.fillRect(0, 0, 8, 8); x.fillStyle = '#a06a1a'; for (let i = 0; i < 8; i++) { x.fillRect(i, i, 1, 1); x.fillRect(7 - i, i, 1, 1); } }, 1502);
    add(new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.09, 0.2, 7), mat({ map: T, unlit: 0.3 })));
    for (let i = 0; i < 5; i++) { const c = add(cone(0.03, 0.14, 4, M(0x4ab84a)), Math.sin(i * 1.26) * 0.025, 0.16, Math.cos(i * 1.26) * 0.025); c.rotation.set(Math.cos(i * 1.26) * 0.35, 0, -Math.sin(i * 1.26) * 0.35); }
  } else if (kind === 'grapes') {
    const P = M(0xa05ae8, 0.3);
    [[0, 0.05, 0], [-0.04, 0.02, 0.02], [0.04, 0.02, 0.02], [0, 0.0, -0.035], [-0.02, -0.04, 0.02], [0.025, -0.04, 0], [0, -0.08, 0.01], [0.04, 0.05, -0.02], [-0.045, 0.05, -0.015]].forEach(p => add(ico(0.032, 0, P), ...p));
    add(cyl(0.006, 0.006, 0.05, 4, M(0x5a3a1a, 0.1)), 0, 0.1, 0);
  } else {                          // a strawberry
    const s = add(cone(0.065, 0.12, 6, M(0xff4a5a, 0.35))); s.rotation.x = PI;
    for (let i = 0; i < 4; i++) { const l = add(new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.01, 0.02), M(0x4ab84a)), Math.sin(i * PI / 2) * 0.03, 0.065, Math.cos(i * PI / 2) * 0.03); l.rotation.y = i * PI / 2; }
  }
  G.userData.kind = kind;
  return G;
}
