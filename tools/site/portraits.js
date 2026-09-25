// portraits.js: chest-up renders of Saxo in each look, with the site's PS1 shader, on a transparent background, for
// tools/site_portraits.mjs to pixelate into the wardrobe's 8-bit icons. window.PORTRAIT(look) → PNG data URL.
import * as THREE from 'three';
import { loadLook, loadClips, Character } from '/site/src/chars.js';
import { U } from '/site/src/ps1.js';

const S = 256;
const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false, preserveDrawingBuffer: true });
renderer.setPixelRatio(1); renderer.setSize(S, S); renderer.setClearColor(0x000000, 0); renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
U.uAmb.value.set(0xc4b8d6); U.uDirCol.value.set(0xfff0dc); U.uDirDir.value.set(0.45, -0.5, -0.8).normalize();
U.uFog.value.set(200, 400); U.uSnap.value.set(4096, 4096); U.uPtCol.value.forEach(c => c.setRGB(0, 0, 0));
const scene = new THREE.Scene(), camera = new THREE.PerspectiveCamera(24, 1, 0.1, 50);
const clips = await loadClips('core');
const V = new THREE.Vector3();
window.PORTRAIT = async (look, clip = 'happy_idle', at = 0.6) => {
  const ch = new Character('p', clips).addTo(scene); ch.setLook(await loadLook(look)); ch.shadow.visible = false;
  ch.play(clip, { fade: 0 }); ch.mixer.update(at); ch.update(0); ch.holder.updateMatrixWorld(true);
  const b = new THREE.Box3();
  for (const m of ch.meshes) { m.skeleton.update(); const n = m.geometry.attributes.position.count; for (let i = 0; i < n; i += 3) { m.getVertexPosition(i, V); b.expandByPoint(V.applyMatrix4(m.matrixWorld)); } }
  const top = b.max.y, cy = top - 0.44, d = 0.5 / Math.tan(THREE.MathUtils.degToRad(12)), a = THREE.MathUtils.degToRad(22);
  camera.position.set(Math.sin(a) * d, cy + 0.18, Math.cos(a) * d); camera.lookAt(0, cy, 0);
  renderer.render(scene, camera);
  const url = renderer.domElement.toDataURL('image/png');
  scene.remove(ch.holder); scene.remove(ch.shadow);
  return url;
};
window.ready = true;
