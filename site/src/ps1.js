// ps1.js: the videos' PlayStation 1 look (src/ps1.js in the video pipeline), shared by everything in the world.
// Vertex snapping to a coarse screen grid, affine texture mapping, per-vertex light, nearest-filtered tiny textures,
// 15-bit colour with an ordered dither, and distance fog.
import * as THREE from 'three';

export const U = {
  uSnap: { value: new THREE.Vector2(240, 135) },
  uAmb: { value: new THREE.Color() }, uDirCol: { value: new THREE.Color() }, uDirDir: { value: new THREE.Vector3(0, -1, 0) },
  uPtPos: { value: [0, 1, 2, 3].map(() => new THREE.Vector3(0, -99, 0)) },
  uPtCol: { value: [0, 1, 2, 3].map(() => new THREE.Color(0, 0, 0)) },
  uPtRange: { value: 7 },
  uFogCol: { value: new THREE.Color() }, uFog: { value: new THREE.Vector2(30, 80) },
};

const VS = /* glsl */`
#include <common>
#include <skinning_pars_vertex>
uniform vec2 uSnap; uniform vec3 uAmb, uDirCol, uDirDir; uniform vec3 uPtPos[4]; uniform vec3 uPtCol[4]; uniform float uPtRange;
uniform vec2 uRep, uOff;
varying vec3 vLight; varying vec3 vUvw; varying float vFogD;
void main() {
  #include <skinbase_vertex>
  #include <begin_vertex>
  #include <beginnormal_vertex>
  #include <skinning_vertex>
  #include <skinnormal_vertex>
  vec4 wp = modelMatrix * vec4(transformed, 1.0);
  vec3 n = normalize(mat3(modelMatrix) * objectNormal);
  vec3 L = uAmb + uDirCol * max(dot(n, -uDirDir), 0.0);
  for (int i = 0; i < 4; i++) {
    vec3 d = uPtPos[i] - wp.xyz; float dist = max(length(d), 1e-3);
    float att = clamp(1.0 - dist / uPtRange, 0.0, 1.0);
    L += uPtCol[i] * att * att * (0.35 + 0.65 * max(dot(n, d / dist), 0.0));
  }
  vLight = L;
  vec4 vp = viewMatrix * wp; vFogD = -vp.z;
  vec4 cp = projectionMatrix * vp;
  cp.xy = floor(cp.xy / cp.w * uSnap + 0.5) / uSnap * cp.w;
  vUvw = vec3((uv * uRep + uOff) * cp.w, cp.w);
  gl_Position = cp;
}`;
const FS = /* glsl */`
uniform sampler2D map; uniform float uUseMap; uniform vec3 uCol; uniform vec3 uFogCol; uniform vec2 uFog; uniform float uUnlit; uniform float uLift; uniform float uShadow; uniform vec3 uShadowCol; uniform float uFlash; uniform float uAlpha;
varying vec3 vLight; varying vec3 vUvw; varying float vFogD;
float bayer(vec2 p) {
  int x = int(mod(p.x, 4.0)), y = int(mod(p.y, 4.0));
  const float m[16] = float[16](0., 8., 2., 10., 12., 4., 14., 6., 3., 11., 1., 9., 15., 7., 13., 5.);
  return m[x + y * 4] / 16.0;
}
void main() {
  if (uShadow > 0.0) {
    vec2 q = vUvw.xy / vUvw.z - 0.5; float a = uShadow * (1.0 - 4.0 * dot(q, q));
    if (a <= bayer(gl_FragCoord.xy)) discard;
    gl_FragColor = vec4(mix(uShadowCol, uFogCol, smoothstep(uFog.x, uFog.y, vFogD)), 1.0); return;
  }
  if (uAlpha < 1.0 && bayer(gl_FragCoord.xy) >= uAlpha) discard;   // screen-door transparency (water)
  vec4 tx = uUseMap > 0.5 ? texture2D(map, vUvw.xy / vUvw.z) : vec4(1.0);
  if (tx.a < 0.4) discard;
  float glow = max(uUnlit, step(tx.a, 0.9));
  vec3 lit = mix(vLight, vec3(1.0), uLift);
  vec3 c = tx.rgb * uCol * mix(lit, vec3(1.0), glow);
  c = mix(c, vec3(1.0), uFlash);
  c = mix(c, uFogCol, smoothstep(uFog.x, uFog.y, vFogD));
  c = floor(clamp(c, 0.0, 1.0) * 31.0 + bayer(gl_FragCoord.xy)) / 31.0;
  gl_FragColor = vec4(c, 1.0);
}`;

export function mat({ map = null, color = 0xffffff, rep = [1, 1], unlit = 0, lift = 0, shadow = 0, alpha = 1, side = THREE.FrontSide } = {}) {
  return new THREE.ShaderMaterial({
    vertexShader: VS, fragmentShader: FS, side,
    uniforms: { ...U, map: { value: map }, uUseMap: { value: map ? 1 : 0 }, uCol: { value: new THREE.Color(color) },
      uRep: { value: new THREE.Vector2(...rep) }, uOff: { value: new THREE.Vector2() }, uUnlit: { value: unlit }, uLift: { value: lift },
      uShadow: { value: shadow }, uShadowCol: { value: new THREE.Color(0.22, 0.2, 0.24) }, uFlash: { value: 0 }, uAlpha: { value: alpha } },
  });
}

export function rng(seed) { return () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
export function tex(w, h, draw, seed = 1) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  const x = c.getContext('2d'); x.imageSmoothingEnabled = false; draw(x, rng(seed), w, h);
  const t = new THREE.CanvasTexture(c);
  t.magFilter = t.minFilter = THREE.NearestFilter; t.generateMipmaps = false;
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.colorSpace = THREE.NoColorSpace;
  return t;
}
export const px = (x, c, X, Y, w = 1, h = 1) => { x.fillStyle = c; x.fillRect(X, Y, w, h); };
export function noise(x, r, w, h, cols, n = w * h / 3) { for (let i = 0; i < n; i++) px(x, cols[Math.floor(r() * cols.length)], Math.floor(r() * w), Math.floor(r() * h)); }
// pixels that should glow (lamp shades, screens, neon) are marked with alpha ~0.8
export function selfLit(x, w, h) {
  const d = x.getImageData(0, 0, w, h);
  for (let i = 0; i < d.data.length; i += 4) { const [r, g, b] = [d.data[i], d.data[i + 1], d.data[i + 2]]; if (r > 190 && g > 140 && b < 200 && r - b > 40) d.data[i + 3] = 204; }
  x.putImageData(d, 0, 0);
}

// Affine UVs warp in proportion to triangle size (and big quads lose point light between their corners), so every
// plane or box face longer than ~1.5 m is split into cells of about that size, like PS1 games tiled big floors.
// Flats a few mm above the ground get a polygon offset, since vertex snapping costs them the depth test otherwise.
export function tessellate(root, cell = 1.5, max = 48) {
  const seg = L => Math.min(max, Math.max(1, Math.ceil(L / cell)));
  const ws = new THREE.Vector3(), bb = new THREE.Box3(), cache = new Map();
  root.updateMatrixWorld(true);
  root.traverse(o => {
    if (!o.isMesh || o.isSkinnedMesh || o.userData.noTess) return;
    const g = o.geometry, p = g.parameters; o.getWorldScale(ws);
    const key = g.uuid + ws.toArray().map(v => v.toFixed(2)).join();
    if (g.type === 'PlaneGeometry' && p.widthSegments === 1 && p.heightSegments === 1) {
      const [a, b] = [seg(p.width * ws.x), seg(p.height * ws.y)];
      if (a * b > 1) { if (!cache.has(key)) cache.set(key, new THREE.PlaneGeometry(p.width, p.height, a, b)); o.geometry = cache.get(key); }
    } else if (g.type === 'BoxGeometry' && p.widthSegments === 1 && p.heightSegments === 1 && p.depthSegments === 1) {
      const [a, b, c] = [seg(p.width * ws.x), seg(p.height * ws.y), seg(p.depth * ws.z)];
      if (a * b * c > 1) { if (!cache.has(key)) cache.set(key, new THREE.BoxGeometry(p.width, p.height, p.depth, a, b, c)); o.geometry = cache.get(key); }
    }
    bb.setFromObject(o);
    if (bb.min.y > 0.0002 && bb.max.y < 0.08 && o.material && !o.material.polygonOffset) { o.material.polygonOffset = true; o.material.polygonOffsetFactor = -2; o.material.polygonOffsetUnits = -4; }
  });
}
