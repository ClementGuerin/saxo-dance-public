// bones.js: the procedural skeleton look ("Spooky, Scary Skeletons", 2026-10-04). A cartoon skeleton built from
// primitives on the rig's bind pose (a big skull with dark eye sockets, a nose hole and teeth on the chibi head; a
// ribcage, a spine and a pelvis; bones with knobbed ends on the limbs) and skinned rigidly, each piece to one bone, so
// it is a SkinnedMesh on the same skeleton like any Tripo outfit: every Mixamo clip plays on it, and the grounding and
// the QA gate read it like a body. One mesh per part group and colour (BONE_PARTS), so an actor's `hideParts` can take
// a bone away: the dog stole it. Sizes are the bind pose's world metres on Saxo's 1.25 m rig (the head bone at the
// base of the head, 0.67 m up; the crown 0.54 m above it; the nose tip 0.44 m in front of it).
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

export const BONE_PARTS = ['skull', 'torso', 'armL', 'armR', 'legL', 'legR'];
const IVORY = 0xf6f0de, SOCKET = 0x17121e;

export function boneLook(THREE, mat, sm) {
  const bones = sm.skeleton.bones;
  const find = end => { const i = bones.findIndex(b => b.name.endsWith(end)); if (i < 0) throw new Error('bones: no bone ' + end); return i; };
  const W = end => bones[find(end)].getWorldPosition(new THREE.Vector3());
  const V = (x, y, z) => new THREE.Vector3(x, y, z);
  const groups = new Map();   // `${part}|${colour}` -> geometries, each already skinned to its bone
  const flatGeo = g => { const n = g.index ? g.toNonIndexed() : g.clone(); for (const k of Object.keys(n.attributes)) if (k !== 'position') n.deleteAttribute(k); return n; };
  function add(part, colour, geo, boneEnd) {
    const g = flatGeo(geo), n = g.attributes.position.count, bi = find(boneEnd);
    const si = new Uint16Array(n * 4), sw = new Float32Array(n * 4);
    for (let k = 0; k < n; k++) { si[k * 4] = bi; sw[k * 4] = 1; }
    g.setAttribute('skinIndex', new THREE.Uint16BufferAttribute(si, 4)); g.setAttribute('skinWeight', new THREE.Float32BufferAttribute(sw, 4));
    const key = part + '|' + colour; if (!groups.has(key)) groups.set(key, []); groups.get(key).push(g);
  }
  const placed = (geo, x, y, z, sx = 1, sy = 1, sz = 1) => { geo.scale(sx, sy, sz); geo.translate(x, y, z); return geo; };
  // a bone from a to b: a shaft and two knobs at each end, set side by side in the plane facing the lens (+z), so the
  // cartoon bone's silhouette reads from the front
  function limb(part, a, b, r, boneEnd, knobs = true) {
    const d = b.clone().sub(a), L = d.length(), mid = a.clone().add(b).multiplyScalar(0.5);
    const shaft = new THREE.CylinderGeometry(r, r, L, 6);
    shaft.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(V(0, 1, 0), d.clone().normalize())); shaft.translate(mid.x, mid.y, mid.z);
    add(part, IVORY, shaft, boneEnd);
    if (!knobs) return;
    const side = d.clone().cross(V(0, 0, 1)); if (side.lengthSq() < 1e-6) side.set(1, 0, 0); side.normalize();
    for (const e of [a, b]) for (const s of [-1, 1]) add(part, IVORY, placed(new THREE.IcosahedronGeometry(r * 1.3, 0), e.x + side.x * s * r * 0.85, e.y + side.y * s * r * 0.85, e.z), boneEnd);
  }
  const H = W('Head');
  // the skull: a round cranium on the chibi head's volume, the face flat at the front
  add('skull', IVORY, placed(new THREE.IcosahedronGeometry(1, 2), H.x, H.y + 0.3, H.z + 0.03, 0.3, 0.285, 0.29), 'Head');
  add('skull', IVORY, placed(new THREE.BoxGeometry(0.3, 0.1, 0.16), H.x, H.y + 0.065, H.z + 0.18), 'Head');   // the jaw
  for (let i = 0; i < 5; i++) add('skull', IVORY, placed(new THREE.BoxGeometry(0.038, 0.05, 0.03), H.x - 0.1 + i * 0.05, H.y + 0.125, H.z + 0.285), 'Head');   // the teeth
  add('skull', SOCKET, placed(new THREE.BoxGeometry(0.26, 0.075, 0.03), H.x, H.y + 0.125, H.z + 0.27), 'Head');   // the dark between the teeth
  for (const s of [-1, 1]) add('skull', SOCKET, placed(new THREE.IcosahedronGeometry(1, 1), H.x + s * 0.125, H.y + 0.325, H.z + 0.265, 0.095, 0.105, 0.06), 'Head');   // the eye sockets
  const nose = new THREE.ConeGeometry(0.042, 0.075, 3); nose.rotateX(Math.PI); nose.translate(H.x, H.y + 0.215, H.z + 0.305); add('skull', SOCKET, nose, 'Head');
  // the spine, a ribcage open at the front with a breastbone, the collarbones, the pelvis
  const spineAt = y => y < W('Spine').y ? 'Hips' : y < W('Spine1').y ? 'Spine' : y < W('Spine2').y ? 'Spine1' : y < W('Neck').y ? 'Spine2' : 'Neck';
  const Hp = W('Hips'), Nk = W('Neck');
  for (let y = Hp.y + 0.03; y < Nk.y + 0.04; y += 0.045) add('torso', IVORY, placed(new THREE.BoxGeometry(0.065, 0.032, 0.06), Hp.x, y, Hp.z - 0.035), spineAt(y));
  const S1 = W('Spine1'), S2 = W('Spine2');
  [[S1.y + 0.01, 0.125, 'Spine1'], [S1.y + 0.055, 0.14, 'Spine1'], [S2.y + 0.005, 0.14, 'Spine2'], [S2.y + 0.05, 0.125, 'Spine2']].forEach(([y, R, b]) => {
    const rib = new THREE.TorusGeometry(R, 0.022, 3, 14, Math.PI * 1.72);
    rib.rotateZ(Math.PI / 2 + Math.PI * 0.14); rib.rotateX(Math.PI / 2); rib.scale(1, 1, 0.8); rib.translate(S1.x, y, S1.z + 0.01);   // the gap at the front (+z)
    add('torso', IVORY, rib, b);
  });
  add('torso', IVORY, placed(new THREE.BoxGeometry(0.04, 0.15, 0.03), S2.x, (S1.y + S2.y) / 2 + 0.03, S2.z + 0.12), 'Spine2');   // the breastbone
  const aL = W('LeftArm'), aR = W('RightArm');
  limb('torso', V(aR.x, aR.y + 0.012, aR.z), V(aL.x, aL.y + 0.012, aL.z), 0.02, 'Spine2', false);   // the collarbones
  for (const s of [-1, 1]) add('torso', IVORY, placed(new THREE.IcosahedronGeometry(1, 0), Hp.x + s * 0.075, Hp.y + 0.005, Hp.z, 0.08, 0.065, 0.05), 'Hips');   // the hip bones
  add('torso', IVORY, placed(new THREE.BoxGeometry(0.06, 0.07, 0.05), Hp.x, Hp.y - 0.01, Hp.z - 0.03), 'Hips');
  // arms, paws with three finger bones, legs and feet
  for (const [sd, part] of [['Left', 'armL'], ['Right', 'armR']]) {
    const A = W(sd + 'Arm'), F = W(sd + 'ForeArm'), Hd = W(sd + 'Hand'), dir = Hd.clone().sub(F).normalize();
    limb(part, A, F, 0.028, sd + 'Arm'); limb(part, F, Hd, 0.024, sd + 'ForeArm');
    const palm = Hd.clone().addScaledVector(dir, 0.03);
    add(part, IVORY, placed(new THREE.BoxGeometry(0.06, 0.024, 0.065), palm.x, palm.y, palm.z), sd + 'Hand');
    for (let f = -1; f <= 1; f++) { const tip = palm.clone().addScaledVector(dir, 0.06); add(part, IVORY, placed(new THREE.BoxGeometry(0.07, 0.016, 0.016), tip.x, tip.y, tip.z + f * 0.022), sd + 'Hand'); }
  }
  for (const [sd, part] of [['Left', 'legL'], ['Right', 'legR']]) {
    const U = W(sd + 'UpLeg'), L = W(sd + 'Leg'), F = W(sd + 'Foot'), T = W(sd + 'ToeBase');
    limb(part, U, L, 0.032, sd + 'UpLeg'); limb(part, L, F, 0.028, sd + 'Leg');
    add(part, IVORY, placed(new THREE.BoxGeometry(0.085, 0.05, 0.17), (F.x + T.x) / 2, Math.max(0.025, (F.y + T.y) / 2 - 0.02), (F.z + T.z) / 2 + 0.02), sd + 'Foot');
  }
  // one SkinnedMesh per part and colour, in the body's local space, bound like an outfit
  const toLocal = sm.matrixWorld.clone().invert(), out = [];
  for (const [key, geos] of groups) {
    const [part, colour] = key.split('|'), g = mergeGeometries(geos);
    g.applyMatrix4(toLocal); g.computeVertexNormals();   // faceted: every face its own normal (non-indexed)
    g.setAttribute('uv', new THREE.Float32BufferAttribute(new Float32Array(g.attributes.position.count * 2), 2));   // the PS1 shader reads a uv (no map here)
    const m = new THREE.SkinnedMesh(g, mat({ color: +colour, lift: 0.4, unlit: +colour === IVORY ? 0.22 : 0 }));
    m.frustumCulled = false; sm.parent.add(m); m.position.copy(sm.position); m.quaternion.copy(sm.quaternion); m.scale.copy(sm.scale);
    m.bind(sm.skeleton, sm.bindMatrix); m.visible = false; m.userData.part = part; out.push(m);
  }
  return out;
}
