// bake.js: runs in headless Chrome (driven by tools/site_bake.mjs). Turns the video pipeline's characters and Mixamo
// clips into small web files for the saxo.dance site:
//   - one GLB per character look (skinned mesh + skeleton, 512 px JPEG texture, merged vertices), with the partners and
//     costumes fitted onto Saxo's skeleton exactly like src/ps1.js addOutfit() does at render time;
//   - clip packs: every bone's rotation (and the hips' position) sampled at a fixed rate and stored as int16, far
//     smaller than glTF float animation channels.
// window.BAKE(spec) returns { files: { name: base64 } } for the node side to write.
import * as THREE from 'three';
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { GLTFExporter } from 'three/addons/exporters/GLTFExporter.js';
import * as SkeletonUtils from 'three/addons/utils/SkeletonUtils.js';
import { mergeVertices } from 'three/addons/utils/BufferGeometryUtils.js';

const TEX = 512, FPS = 30;
const loaderFor = url => url.endsWith('.fbx') ? new FBXLoader() : new GLTFLoader();
async function loadAny(url) { const r = await loaderFor(url).loadAsync(url); return r.scene ? { root: r.scene, animations: r.animations } : { root: r, animations: r.animations }; }
const loadImg = url => new Promise((ok, no) => { const im = new Image(); im.onload = () => ok(im); im.onerror = no; im.src = url; });
function shrink(img, flipY) {
  const c = document.createElement('canvas'); c.width = c.height = TEX;
  const x = c.getContext('2d'); x.imageSmoothingQuality = 'high'; x.drawImage(img, 0, 0, TEX, TEX);
  const t = new THREE.CanvasTexture(c); t.flipY = flipY; t.userData.mimeType = 'image/jpeg'; return t;
}

// Saxo: the Mixamo rig (FBX) with his colour texture, scaled to 1.25 m with his feet on y = 0 (as in ps1.js loadTripo)
async function loadSaxo() {
  const img = await loadImg('/assets/mixamo/saxo_mixamo/saxo_mixamo.jpg');
  const { root, animations } = await loadAny('/assets/mixamo/saxo_skin_gangnam.fbx');
  root.traverse(o => { if (o.isMesh) { o.material = new THREE.MeshBasicMaterial({ map: shrink(img, true) }); o.name = 'body'; } });
  root.updateMatrixWorld(true);
  const b = new THREE.Box3().setFromObject(root), k = 1.25 / (b.max.y - b.min.y);
  root.scale.multiplyScalar(k); root.position.y = -b.min.y * k; root.name = 'saxo'; root.updateMatrixWorld(true);
  return { root, gangnam: animations[0] };
}

// ps1.js addOutfit(), minus the PS1 material: fit an unrigged Tripo model over the rigged body and copy the bone
// weights of the 6 nearest body vertices. Returns the new SkinnedMesh, bound to the body's skeleton.
async function fitOutfit(root, url) {
  const body = []; root.traverse(o => { if (o.isSkinnedMesh && o.name === 'body') body.push(o); });
  const sm = body[0]; root.updateMatrixWorld(true);
  const src = (await loadAny(url)).root; src.updateMatrixWorld(true);
  let mesh = null; src.traverse(o => { if (!mesh && o.isMesh) mesh = o; });
  const bg = sm.geometry, bp = bg.attributes.position, bi = bg.attributes.skinIndex, bw = bg.attributes.skinWeight, v = new THREE.Vector3();
  const B = []; for (let k = 0; k < bp.count; k++) { v.fromBufferAttribute(bp, k).applyMatrix4(sm.matrixWorld); B.push([v.x, v.y, v.z, k]); }
  const bb = new THREE.Box3().setFromArray(B.flatMap(b => b.slice(0, 3)));
  const g0 = mesh.geometry.index ? mesh.geometry.toNonIndexed() : mesh.geometry.clone(); g0.applyMatrix4(mesh.matrixWorld);
  const fit = yaw => {
    const g = g0.clone(); g.rotateY(yaw); g.computeBoundingBox(); const ob = g.boundingBox;
    const k = (bb.max.x - bb.min.x) / (ob.max.x - ob.min.x);
    g.translate(-(ob.max.x + ob.min.x) / 2, -ob.min.y, -(ob.max.z + ob.min.z) / 2); g.scale(k, k, k);
    g.translate((bb.max.x + bb.min.x) / 2, bb.min.y, (bb.max.z + bb.min.z) / 2); return g;
  };
  const CELL = (bb.max.y - bb.min.y) / 24, grid = new Map(), seen = new Set(), ck = (i, j, k) => i + ',' + j + ',' + k;
  for (const b of B) { const q = b[0].toFixed(4) + b[1].toFixed(4) + b[2].toFixed(4); if (seen.has(q)) continue; seen.add(q); const key = ck(Math.floor(b[0] / CELL), Math.floor(b[1] / CELL), Math.floor(b[2] / CELL)); (grid.get(key) || grid.set(key, []).get(key)).push(b); }
  const near = (x, y, z, n) => {
    const ci = Math.floor(x / CELL), cj = Math.floor(y / CELL), ck2 = Math.floor(z / CELL); let found = [];
    for (let r = 0; r < 40; r++) {
      for (let i = -r; i <= r; i++) for (let j = -r; j <= r; j++) for (let k = -r; k <= r; k++) {
        if (Math.max(Math.abs(i), Math.abs(j), Math.abs(k)) !== r) continue;
        const c = grid.get(ck(ci + i, cj + j, ck2 + k)); if (c) for (const b of c) found.push([(b[0] - x) ** 2 + (b[1] - y) ** 2 + (b[2] - z) ** 2, b[3]]);
      }
      if (found.length >= n && r >= 1) break;
    }
    found.sort((a, b) => a[0] - b[0]); return found.slice(0, n);
  };
  let best = null;
  for (const yaw of [-Math.PI / 2, 0, Math.PI / 2, Math.PI]) {
    const g = fit(yaw), P = g.attributes.position; let e = 0, c = 0;
    for (let k = 0; k < P.count; k += 37) { e += Math.sqrt(near(P.getX(k), P.getY(k), P.getZ(k), 1)[0][0]); c++; }
    if (!best || e / c < best.e * (best.yaw === -Math.PI / 2 ? 0.8 : 1)) best = { g, e: e / c, yaw };
  }
  const g = best.g, P = g.attributes.position, n = P.count, SI = new Uint16Array(n * 4), SW = new Float32Array(n * 4), memo = new Map();
  for (let k = 0; k < n; k++) {
    const x = P.getX(k), y = P.getY(k), z = P.getZ(k), key = x.toFixed(4) + ',' + y.toFixed(4) + ',' + z.toFixed(4);
    let w = memo.get(key);
    if (!w) {
      const acc = {};
      for (const [d2, j] of near(x, y, z, 6)) { const f = 1 / (d2 + 1e-6); for (let c = 0; c < 4; c++) { const wt = bw.getComponent(j, c); if (wt > 0) acc[bi.getComponent(j, c)] = (acc[bi.getComponent(j, c)] || 0) + wt * f; } }
      const top = Object.entries(acc).sort((a, b) => b[1] - a[1]).slice(0, 4), sum = top.reduce((a, b) => a + b[1], 0);
      w = top.map(([b, x]) => [+b, x / sum]); memo.set(key, w);
    }
    w.forEach(([b, x], c) => { SI[k * 4 + c] = b; SW[k * 4 + c] = x; });
  }
  g.applyMatrix4(sm.matrixWorld.clone().invert());
  g.setAttribute('skinIndex', new THREE.Uint16BufferAttribute(SI, 4)); g.setAttribute('skinWeight', new THREE.Float32BufferAttribute(SW, 4));
  const m0 = Array.isArray(mesh.material) ? mesh.material[0] : mesh.material, img = m0 && m0.map && m0.map.image;
  const out = new THREE.SkinnedMesh(g, new THREE.MeshBasicMaterial({ map: img ? shrink(img, m0.map.flipY) : null }));
  sm.parent.add(out); out.position.copy(sm.position); out.quaternion.copy(sm.quaternion); out.scale.copy(sm.scale);
  out.bind(sm.skeleton, sm.bindMatrix); out.frustumCulled = false;
  console.log(`fit ${url}: ${n} verts, yaw ${Math.round(best.yaw * 180 / Math.PI)}°, error ${best.e.toFixed(3)} m`);
  return out;
}

// merged vertices (normals are rebuilt faceted on the site), so the GLB carries each corner once
function compact(mesh) {
  let g = mesh.geometry.clone(); g.deleteAttribute('normal');
  for (const k of Object.keys(g.attributes)) if (!['position', 'uv', 'skinIndex', 'skinWeight'].includes(k)) g.deleteAttribute(k);
  g = mergeVertices(g, 1e-5); mesh.geometry = g; return g;
}
async function exportGLB(root, keep) {
  const hidden = []; root.traverse(o => { if (o.isMesh && o !== keep && o.visible) { o.visible = false; hidden.push(o); } });
  const was = keep.visible; keep.visible = true;
  const buf = await new GLTFExporter().parseAsync(root, { binary: true, onlyVisible: true, maxTextureSize: TEX });
  hidden.forEach(o => { o.visible = true; }); keep.visible = was;
  return buf;
}

// ---------- clips ----------
const q16 = v => Math.max(-32767, Math.min(32767, Math.round(v * 32767)));
function sampleClip(clip, name, { pin = true } = {}) {
  const dur = clip.duration, frames = Math.max(2, Math.round(dur * FPS) + 1), tracks = [];
  for (const tr of clip.tracks) {
    const [bone, prop] = tr.name.split('.');
    if (prop === 'scale') continue;
    if (prop === 'position' && !/Hips$/.test(bone)) continue;   // bones keep their bind offsets; only the hips travel
    const it = tr.createInterpolant(), size = tr.getValueSize(), out = new Float32Array(frames * size);
    for (let f = 0; f < frames; f++) { const r = it.evaluate(Math.min(dur, f / FPS)); out.set(r.subarray ? r.subarray(0, size) : r, f * size); }
    if (prop === 'position' && pin) for (let f = 0; f < frames; f++) { out[f * 3] = out[0]; out[f * 3 + 2] = out[2]; }   // stay on the mark
    if (prop === 'quaternion') for (let f = 1; f < frames; f++) {   // keep neighbours in the same hemisphere
      let d = 0; for (let c = 0; c < 4; c++) d += out[f * 4 + c] * out[(f - 1) * 4 + c];
      if (d < 0) for (let c = 0; c < 4; c++) out[f * 4 + c] *= -1;
    }
    let still = true; for (let f = 1; f < frames && still; f++) for (let c = 0; c < size; c++) if (Math.abs(out[f * size + c] - out[c]) > 2e-4) { still = false; break; }
    tracks.push({ bone, prop, data: still ? out.subarray(0, size) : out });
  }
  return { name, duration: dur, frames, tracks };
}
function packClips(list) {
  const index = { fps: FPS, clips: [] }, chunks = []; let off = 0;
  const push = arr => { const pad = (4 - (off % 4)) % 4; if (pad) { chunks.push(new Uint8Array(pad)); off += pad; } const at = off; chunks.push(new Uint8Array(arr.buffer, arr.byteOffset, arr.byteLength)); off += arr.byteLength; return at; };
  for (const c of list) {
    const tracks = c.tracks.map(t => {
      const n = t.data.length / (t.prop === 'quaternion' ? 4 : 3), still = n === 1;
      const at = t.prop === 'quaternion' ? push(Int16Array.from(t.data, q16)) : push(Float32Array.from(t.data));
      return [t.bone, t.prop === 'quaternion' ? 'q' : 'p', at, still ? 1 : 0];
    });
    index.clips.push({ name: c.name, duration: +c.duration.toFixed(4), frames: c.frames, tracks });
  }
  const bin = new Uint8Array(off); let p = 0; for (const ch of chunks) { bin.set(ch, p); p += ch.byteLength; }
  return { index, bin };
}

const b64 = buf => { const u = new Uint8Array(buf); let s = ''; for (let i = 0; i < u.length; i += 0x8000) s += String.fromCharCode.apply(null, u.subarray(i, i + 0x8000)); return btoa(s); };

window.BAKE = async spec => {
  const files = {}, log = [];
  const { root, gangnam } = await loadSaxo();
  const body = []; root.traverse(o => { if (o.isSkinnedMesh) body.push(o); });
  const bones = []; root.traverse(o => { if (o.isBone) bones.push(o.name); });
  log.push(`saxo: ${body.length} skinned mesh(es), ${bones.length} bones, ${body[0].geometry.attributes.position.count} verts`);
  // Saxo himself
  compact(body[0]);
  files['chars/saxo.glb'] = b64(await exportGLB(root, body[0]));
  // Saxo's costumes, on his own skeleton
  for (const [name, url] of Object.entries(spec.costumes || {})) {
    const m = await fitOutfit(root, url); compact(m);
    files[`chars/saxo_${name}.glb`] = b64(await exportGLB(root, m)); m.parent.remove(m);
  }
  // partners: a clone of his skeleton, their own look fitted on it (ps1.js: sadi = rig(SkeletonUtils.clone(...)))
  for (const [name, url] of Object.entries(spec.partners || {})) {
    const clone = SkeletonUtils.clone(root); clone.name = name; clone.updateMatrixWorld(true);
    clone.traverse(o => { if (o.isSkinnedMesh) o.name = 'body'; });
    const m = await fitOutfit(clone, url); compact(m); m.name = name;
    files[`chars/${name}.glb`] = b64(await exportGLB(clone, m));
  }
  // clip packs
  for (const [pack, clips] of Object.entries(spec.packs || {})) {
    const list = [];
    for (const [name, file, opt] of clips) {
      const clip = file === '@gangnam' ? gangnam : (await loadAny(`/assets/mixamo/anims/${file}.fbx`)).animations[0];
      list.push(sampleClip(clip, name, opt || {}));
    }
    const { index, bin } = packClips(list);
    files[`anims/${pack}.bin`] = b64(bin.buffer);
    files[`anims/${pack}.json`] = btoa(unescape(encodeURIComponent(JSON.stringify(index))));
    log.push(`${pack}: ${list.length} clips, ${(bin.byteLength / 1024).toFixed(0)} KB`);
  }
  log.push('bones: ' + bones.join(' '));
  return { files, log };
};
window.ready = true;
