// chars.js: the baked characters (tools/site_bake.mjs) and their clips, with a small animation state machine.
// Every look shares Saxo's skeleton, so any clip plays on anyone.
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { mat } from './ps1.js';

const gltf = new GLTFLoader();
const looks = new Map();
// one look = a skinned mesh on its own skeleton, drawn with the PS1 material and faceted like the videos
export function loadLook(name, onProgress) {
  if (looks.has(name)) return looks.get(name);
  const p = gltf.loadAsync(`assets/chars/${name}.glb`, onProgress).then(g => {
    g.scene.traverse(o => {
      if (o.isBone) o.userData.rest = { p: o.position.clone(), q: o.quaternion.clone() };
      if (!o.isSkinnedMesh) return;
      const map = o.material.map;
      if (map) { map.colorSpace = THREE.NoColorSpace; map.magFilter = THREE.NearestFilter; map.minFilter = THREE.NearestFilter; map.generateMipmaps = false; map.needsUpdate = true; }
      o.geometry = o.geometry.toNonIndexed(); o.geometry.computeVertexNormals();
      o.material = mat({ map, lift: 0.4 }); o.material.uniforms.uCol.value.setScalar(1.25);
      o.frustumCulled = false;
    });
    return g.scene;
  });
  looks.set(name, p);
  return p;
}

// clip packs: int16 quaternions per bone per frame (see tools/site/bake.js packClips)
export async function loadClips(pack) {
  const [index, bin] = await Promise.all([fetch(`assets/anims/${pack}.json`).then(r => r.json()), fetch(`assets/anims/${pack}.bin`).then(r => r.arrayBuffer())]);
  const out = {};
  for (const c of index.clips) {
    const times = Float32Array.from({ length: c.frames }, (_, i) => Math.min(c.duration, i / index.fps)), tracks = [];
    for (const [bone, kind, at, still] of c.tracks) {
      const n = still ? 1 : c.frames, size = kind === 'q' ? 4 : 3;
      let v = kind === 'q' ? Float32Array.from(new Int16Array(bin, at, n * 4), x => x / 32767) : new Float32Array(bin.slice(at, at + n * 12));
      let t = times;
      if (still) { t = new Float32Array([0, c.duration]); const w = new Float32Array(size * 2); w.set(v, 0); w.set(v, size); v = w; }
      tracks.push(kind === 'q' ? new THREE.QuaternionKeyframeTrack(`${bone}.quaternion`, t, v) : new THREE.VectorKeyframeTrack(`${bone}.position`, t, v));
    }
    out[c.name] = new THREE.AnimationClip(c.name, c.duration, tracks);
  }
  return out;
}

const V = new THREE.Vector3(), V2 = new THREE.Vector3(), M = new THREE.Matrix4();
const shadowGeo = new THREE.PlaneGeometry(0.8, 0.8);
// A character in the world: a holder (position, yaw, scale) around the current look, a mixer, a blob shadow.
export class Character {
  constructor(name, clips, { scale = 1, shadowCol = 0x6b4a6e } = {}) {
    this.name = name; this.clips = clips; this.scale = scale;
    this.holder = new THREE.Group(); this.holder.scale.setScalar(scale);
    this.body = new THREE.Group(); this.holder.add(this.body);   // carries the per-clip floor offset
    this.yaw = 0; this.targetYaw = null; this.turnRate = 10;
    this.shadow = new THREE.Mesh(shadowGeo, mat({ shadow: 0.45 })); this.shadow.rotation.x = -Math.PI / 2;
    Object.assign(this.shadow.material, { polygonOffset: true, polygonOffsetFactor: -12, polygonOffsetUnits: -24 });   // above rugs, tiles, decks
    this.shadow.material.uniforms.uShadowCol.value.set(shadowCol); this.shadow.scale.setScalar(scale);
    this.current = null; this.floor = {}; this.lift = 0; this.liftTarget = 0; this.flash = 0; this.extraLift = 0;
  }
  setLook(root) {
    const keep = this.current, keepTime = this.action ? this.action.time : 0, loop = this.loopMode, then = this.then;
    if (this.root) { this.mixer.stopAllAction(); this.body.remove(this.root); }
    root.traverse(o => { if (o.isBone && o.userData.rest) { o.position.copy(o.userData.rest.p); o.quaternion.copy(o.userData.rest.q); } });
    this.root = root; this.body.add(root);
    this.mixer = new THREE.AnimationMixer(root); this.actions = {};
    this.mixer.addEventListener('finished', e => { if (e.action === this.action && this.then) { const f = this.then; this.then = null; f(); } });
    this.meshes = []; root.traverse(o => { if (o.isSkinnedMesh) this.meshes.push(o); });
    this.bones = {}; root.traverse(o => { if (o.isBone) this.bones[o.name.replace('mixamorig', '')] = o; });
    this.current = null; this.action = null;
    if (keep) { this.play(keep, { fade: 0, loop, then }); this.action.time = keepTime; this.mixer.update(0); }
  }
  addTo(scene) { scene.add(this.holder); scene.add(this.shadow); return this; }
  toeLow() {
    const toes = [this.bones.LeftToeBase, this.bones.RightToeBase].filter(Boolean); let low = Infinity;
    M.copy(this.body.matrixWorld).invert();
    for (const t of toes) { t.getWorldPosition(V).applyMatrix4(M); low = Math.min(low, V.y); }
    return low;
  }
  act(name) {
    if (!this.actions[name]) { const c = this.clips[name]; if (!c) return null; this.actions[name] = this.mixer.clipAction(c); }
    return this.actions[name];
  }
  has(name) { return !!this.clips[name]; }
  // crossfade to a clip. loop false plays it once, holds the last frame and calls then()
  play(name, { fade = 0.25, loop = true, speed = 1, then = null, at = 0 } = {}) {
    if (!this.clips[name]) { console.warn('no clip', name); return; }
    if (this.current === name && loop && this.loopMode === loop) { this.action.timeScale = speed; return; }
    this.floorOf(name);
    const next = this.act(name), prev = this.action;
    next.reset(); next.enabled = true; next.setEffectiveWeight(1); next.timeScale = speed; next.time = at;
    next.setLoop(loop ? THREE.LoopRepeat : THREE.LoopOnce, Infinity); next.clampWhenFinished = !loop;
    if (prev && prev !== next && fade > 0) { next.play(); prev.crossFadeTo(next, fade, false); }
    else { if (prev && prev !== next) prev.stop(); next.play(); }
    this.current = name; this.action = next; this.loopMode = loop; this.then = then; this.liftTarget = this.floor[name];
  }
  speed(s) { if (this.action) this.action.timeScale = s; }
  // lowest point of the skinned body, in holder units with no lift (the rig's bones sit well off the mesh, so only
  // the mesh can tell where the feet are: the videos learned this the hard way)
  meshLow(stride = 5) {
    const keep = this.body.position.y; this.body.position.y = 0; this.holder.updateMatrixWorld(true);
    let low = Infinity; const hy = this.holder.position.y, k = this.scale;
    for (const m of this.meshes) {
      m.skeleton.update(); const n = m.geometry.attributes.position.count;
      for (let i = 0; i < n; i += stride) { m.getVertexPosition(i, V); V.applyMatrix4(m.matrixWorld); if (V.y < low) low = V.y; }
    }
    this.body.position.y = keep; this.holder.updateMatrixWorld(true);
    return (low - hy) / k;
  }
  // per clip: lift the body so the lowest point of the mesh over the whole clip touches the floor (like the videos'
  // clipGround, measured on the mesh). Measured once per clip, on a probe mixer; jumps keep their air.
  floorOf(name) {
    if (name in this.floor) return this.floor[name];
    const clip = this.clips[name];
    if (!clip) return (this.floor[name] = 0);
    const probe = new THREE.AnimationMixer(this.root), a = probe.clipAction(clip); a.play();
    let low = Infinity;
    for (let i = 0; i < 14; i++) { a.time = clip.duration * i / 13; probe.update(0); this.root.updateMatrixWorld(true); low = Math.min(low, this.meshLow(9)); }
    a.stop(); probe.uncacheRoot(this.root);
    if (this.mixer) { this.mixer.update(0); this.root.updateMatrixWorld(true); }
    return (this.floor[name] = Math.max(-1.5, Math.min(1.5, -low)));
  }
  replant(name, opts = {}) {
    this.root.updateMatrixWorld(true); const a = this.bones.Hips.getWorldPosition(new THREE.Vector3());
    this.play(name, { ...opts, fade: 0 }); this.mixer.update(0); this.root.updateMatrixWorld(true);
    const b = this.bones.Hips.getWorldPosition(new THREE.Vector3());
    this.holder.position.x += a.x - b.x; this.holder.position.z += a.z - b.z;
  }
  faceTo(x, z) { this.targetYaw = Math.atan2(x - this.holder.position.x, z - this.holder.position.z); }
  update(dt) {
    if (this.mixer) this.mixer.update(dt);
    if (this.targetYaw != null) {
      let d = this.targetYaw - this.yaw; d = Math.atan2(Math.sin(d), Math.cos(d));
      this.yaw += d * Math.min(1, dt * this.turnRate); if (Math.abs(d) < 0.002) { this.yaw = this.targetYaw; this.targetYaw = null; }
    }
    this.holder.rotation.y = this.yaw;
    if (this.groundEveryFrame && this.meshes) { this.root.updateMatrixWorld(true); this.lift = -this.meshLow(6); }
    else this.lift += (this.liftTarget - this.lift) * Math.min(1, dt * 8);
    this.body.position.y = this.lift + this.extraLift;
    const hips = this.bones && this.bones.Hips;   // the shadow follows the body, which root motion can carry off the holder
    if (hips) { hips.getWorldPosition(V2); this.shadow.position.set(V2.x, this.holder.position.y + 0.05, V2.z); }
    else this.shadow.position.set(this.holder.position.x, this.holder.position.y + 0.05, this.holder.position.z);
    if (this.flash > 0) this.flash = Math.max(0, this.flash - dt * 3);
    for (const m of this.meshes || []) m.material.uniforms.uFlash.value = this.flash;
  }
  headPos(out = V2) { const h = this.bones.HeadTop_End || this.bones.Head; if (h) return h.getWorldPosition(out); return out.copy(this.holder.position).setY(1.4 * this.scale); }
  get pos() { return this.holder.position; }
}
