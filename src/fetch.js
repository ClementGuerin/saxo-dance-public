// fetch.js: the things thrown for the dog (2026-10-12, "Beat It"), from primitives, shared by the props in paws and in
// flight (src/ps1.js: `hold: "stick"`, a `toss`, the actor field `fetch`: one carried in the jaws) and the rumble map's
// flying throws and pile (src/maps43.js). About twice real size so they read at 270x480 next to a 1.25 m dog; light
// colours with a little `unlit` (a hex renders darker through the linear conversion, and the warehouse is dark).
// Each is built along x (its long axis), centred, so a dog carries it crosswise in his jaws.
export const FETCH = ['stick', 'ball', 'fish', 'yarn', 'frisbee', 'bone', 'sock', 'tyre', 'rose'];

export function fetchMesh(K, kind) {   // K: the renderer's map kit (THREE, mat)
  const { THREE, mat } = K, G = new THREE.Group(), PI = Math.PI;
  const M = (c, u = 0.35) => mat({ color: c, unlit: u });
  const box = (w, h, d, m) => new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m);
  const cyl = (rt, rb, h, seg, m) => new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), m);
  const ico = (r, d, m) => new THREE.Mesh(new THREE.IcosahedronGeometry(r, d), m);
  const add = (o, x = 0, y = 0, z = 0) => { o.position.set(x, y, z); G.add(o); return o; };
  if (kind === 'stick') {         // a crooked branch with a twig: the classic fetch stick
    const m = M(0xb07a44), d = M(0x7a5230);
    const a = add(cyl(0.028, 0.034, 0.36, 5, m), -0.16, 0, 0); a.rotation.z = PI / 2 + 0.12;
    const b = add(cyl(0.026, 0.028, 0.34, 5, m), 0.16, 0.02, 0); b.rotation.z = PI / 2 - 0.1;
    const tw = add(cyl(0.012, 0.016, 0.16, 4, d), 0.06, 0.07, 0.01); tw.rotation.z = -0.7;
    for (const x of [-0.33, 0.33]) add(ico(0.03, 0, d), x, x < 0 ? -0.02 : 0.04, 0);
  } else if (kind === 'ball') {   // a tennis ball (the one the dog never lets go)
    add(ico(0.11, 1, M(0xd8f02a, 0.5)));
    const seam = add(new THREE.Mesh(new THREE.TorusGeometry(0.105, 0.012, 4, 14), M(0xffffff, 0.6))); seam.rotation.x = 0.6;
  } else if (kind === 'fish') {   // a silver-blue fish (the cats' prize), along x, head at +x
    const body = add(ico(0.1, 1, M(0x8ab4d8, 0.4))); body.scale.set(2.2, 0.85, 0.55);
    const tail = add(new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.16, 4), M(0x9cc4e4, 0.55)), -0.27, 0, 0);   // light: a dark tail read as a black square tail.rotation.z = PI / 2; tail.scale.set(1, 1, 0.35);
    for (const s of [-1, 1]) { add(ico(0.025, 0, M(0x101010, 0.2)), 0.15, 0.03, s * 0.045); add(ico(0.009, 0, M(0xffffff, 1)), 0.162, 0.038, s * 0.055); }
    const fin = add(box(0.12, 0.06, 0.012, M(0x6a94c0, 0.4)), -0.02, 0.09, 0); fin.rotation.z = 0.25;
  } else if (kind === 'yarn') {   // a red ball of yarn with a loose strand (the cats' toy)
    add(ico(0.12, 1, M(0xe83a4a, 0.45)));
    for (let i = 0; i < 3; i++) { const r = add(new THREE.Mesh(new THREE.TorusGeometry(0.115, 0.01, 4, 14), M(0xc82a3a, 0.4))); r.rotation.set(i * 1.1, i * 0.7, 0); }
    const str = add(cyl(0.01, 0.01, 0.3, 4, M(0xe83a4a, 0.45)), 0.2, -0.06, 0); str.rotation.z = 1.1;
  } else if (kind === 'frisbee') {   // a pink flying disc, flat in the xz plane
    add(cyl(0.2, 0.18, 0.04, 12, M(0xff6aa8, 0.5)));
    add(new THREE.Mesh(new THREE.TorusGeometry(0.19, 0.02, 4, 16), M(0xffffff, 0.5)), 0, 0.01, 0).rotation.x = PI / 2;
  } else if (kind === 'bone') {   // a chew bone
    const m = M(0xf6f0de, 0.4); add(cyl(0.035, 0.035, 0.4, 6, m)).rotation.z = PI / 2;
    for (const x of [-0.2, 0.2]) for (const y of [-0.04, 0.04]) add(ico(0.055, 0, m), x, y, 0);
  } else if (kind === 'sock') {   // a striped sock (stolen from the laundry)
    const w = M(0xf4f4f0, 0.45), r = M(0xe84a4a, 0.45);
    add(box(0.3, 0.1, 0.07, w), -0.05, 0, 0); add(box(0.12, 0.1, 0.07, w), 0.14, -0.05, 0).rotation.z = -0.6;
    for (const x of [-0.16, -0.06]) add(box(0.03, 0.105, 0.075, r), x, 0, 0);
  } else if (kind === 'rose') {   // "Gabriela" (2026-10-13): a long-stemmed red rose, the bloom at +x (the telenovela rose between the teeth)
    const st = add(cyl(0.014, 0.016, 0.42, 5, M(0x3a8a3a, 0.35)), -0.05, 0, 0); st.rotation.z = PI / 2;
    for (const [x, s] of [[-0.12, 1], [0.02, -1]]) { const lf = add(ico(0.045, 0, M(0x4aa04a, 0.4)), x, 0.03 * s, 0.02); lf.scale.set(1.6, 0.35, 0.8); lf.rotation.z = 0.5 * s; }
    const red = M(0xe0283a, 0.45), deep = M(0xa8141e, 0.4);
    const bud = add(ico(0.075, 1, red), 0.2, 0, 0); bud.scale.set(0.9, 1, 1);
    for (let i = 0; i < 5; i++) { const a = i / 5 * PI * 2, p = add(ico(0.05, 0, i % 2 ? deep : red), 0.19, Math.sin(a) * 0.06, Math.cos(a) * 0.06); p.scale.set(0.6, 1, 1); }
    add(ico(0.03, 0, deep), 0.27, 0, 0);
  } else if (kind === 'tyre') {   // a bike tyre: the biggest thing they throw
    add(new THREE.Mesh(new THREE.TorusGeometry(0.26, 0.05, 5, 14), M(0x2a2a2e, 0.2))).rotation.x = PI / 2;
    add(cyl(0.04, 0.04, 0.03, 8, M(0x9a9aa4, 0.4)));
    for (let i = 0; i < 6; i++) { const sp = add(cyl(0.006, 0.006, 0.42, 3, M(0xb8b8c0, 0.4))); sp.rotation.set(PI / 2, 0, i * PI / 6); sp.rotation.order = 'ZXY'; }
  }
  return G;
}
