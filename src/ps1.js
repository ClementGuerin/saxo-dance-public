// ps1.js: a PlayStation 1 look for three.js, plus Saxo built from boxes and two maps (night street, beach).
// PS1 tricks: low internal resolution, vertex snapping (wobble), affine texture mapping (warp), per-vertex
// lighting, nearest-filtered tiny textures, 15-bit colour with ordered dither, distance fog.
// Everything is a pure function of t: window.render3d(t) returns the low-res canvas for that moment.
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js';
import * as SkeletonUtils from 'three/addons/utils/SkeletonUtils.js';
import { buildMoreMaps } from './maps.js';
import { buildIndoorMaps } from './maps2.js';
import { buildOutdoorMaps } from './maps3.js';
import { buildSeaMaps } from './maps4.js';
import { buildClubMaps } from './maps5.js';
import { buildTechnoMaps } from './maps6.js';
import { buildPirateMaps } from './maps7.js';

const RW = CONFIG.ps1.w, RH = CONFIG.ps1.h;
const renderer = new THREE.WebGLRenderer({ antialias: false, preserveDrawingBuffer: true });
renderer.setPixelRatio(1); renderer.setSize(RW, RH, false);
renderer.outputColorSpace = THREE.LinearSRGBColorSpace;   // shaders write sRGB values straight through

// ---------- shared uniforms (lights and fog are set per map) ----------
const U = {
  uSnap: { value: new THREE.Vector2(...CONFIG.ps1.snap) },
  uAmb: { value: new THREE.Color() }, uDirCol: { value: new THREE.Color() }, uDirDir: { value: new THREE.Vector3(0, -1, 0) },
  uPtPos: { value: [0, 1, 2, 3].map(() => new THREE.Vector3(0, -99, 0)) },
  uPtCol: { value: [0, 1, 2, 3].map(() => new THREE.Color(0, 0, 0)) },
  uPtRange: { value: 7 },
  uFogCol: { value: new THREE.Color() }, uFog: { value: new THREE.Vector2(10, 40) },
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
  cp.xy = floor(cp.xy / cp.w * uSnap + 0.5) / uSnap * cp.w;      // vertex snap to a coarse screen grid
  vUvw = vec3((uv * uRep + uOff) * cp.w, cp.w);                  // affine mapping: undo perspective correction
  gl_Position = cp;
}`;
const FS = /* glsl */`
uniform sampler2D map; uniform float uUseMap; uniform vec3 uCol; uniform vec3 uFogCol; uniform vec2 uFog; uniform float uUnlit; uniform float uLift; uniform float uShadow; uniform vec3 uShadowCol; uniform float uNoFog;
varying vec3 vLight; varying vec3 vUvw; varying float vFogD;
float bayer(vec2 p) {
  int x = int(mod(p.x, 4.0)), y = int(mod(p.y, 4.0));
  const float m[16] = float[16](0., 8., 2., 10., 12., 4., 14., 6., 3., 11., 1., 9., 15., 7., 13., 5.);
  return m[x + y * 4] / 16.0;
}
void main() {
  if (uShadow > 0.0) {                                            // blob shadow: radial falloff drawn as a dither pattern
    vec2 q = vUvw.xy / vUvw.z - 0.5; float a = uShadow * (1.0 - 4.0 * dot(q, q));
    if (a <= bayer(gl_FragCoord.xy)) discard;
    gl_FragColor = vec4(mix(uShadowCol, uFogCol, smoothstep(uFog.x, uFog.y, vFogD)), 1.0); return;
  }
  vec4 tx = uUseMap > 0.5 ? texture2D(map, vUvw.xy / vUvw.z) : vec4(1.0);
  if (tx.a < 0.4) discard;
  float glow = max(uUnlit, step(tx.a, 0.9));                     // alpha ~0.8 in a texture = self-lit (windows, lamps)
  vec3 lit = mix(vLight, vec3(1.0), uLift);                       // uLift > 0 keeps the hero readable in dark maps
  vec3 c = tx.rgb * uCol * mix(lit, vec3(1.0), glow);
  c = mix(c, uFogCol, smoothstep(uFog.x, uFog.y, vFogD) * (1.0 - uNoFog));   // nofog: the moon and the stars, far beyond the fog
  c = floor(clamp(c, 0.0, 1.0) * 31.0 + bayer(gl_FragCoord.xy)) / 31.0;   // 15-bit colour, ordered dither
  gl_FragColor = vec4(c, 1.0);
}`;

function mat({ map = null, color = 0xffffff, rep = [1, 1], unlit = 0, lift = 0, shadow = 0, side = THREE.FrontSide, nofog = 0 } = {}) {
  return new THREE.ShaderMaterial({
    vertexShader: VS, fragmentShader: FS, side,
    uniforms: { ...U, map: { value: map }, uUseMap: { value: map ? 1 : 0 }, uCol: { value: new THREE.Color(color) },
      uRep: { value: new THREE.Vector2(...rep) }, uOff: { value: new THREE.Vector2() }, uUnlit: { value: unlit }, uLift: { value: lift }, uShadow: { value: shadow }, uShadowCol: { value: new THREE.Color(0.22, 0.2, 0.24) }, uNoFog: { value: nofog } },
  });
}

// ---------- tiny canvas textures ----------
function rng(seed) { return () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function tex(w, h, draw, seed = 1) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  const x = c.getContext('2d'); x.imageSmoothingEnabled = false; draw(x, rng(seed), w, h);
  const t = new THREE.CanvasTexture(c);
  t.magFilter = t.minFilter = THREE.NearestFilter; t.generateMipmaps = false;
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.colorSpace = THREE.NoColorSpace;
  return t;
}
// mark warm window pixels as self-lit (alpha 0.8), since canvas compositing over an opaque base keeps alpha at 1
function selfLit(x, w, h) {
  const d = x.getImageData(0, 0, w, h);
  for (let i = 0; i < d.data.length; i += 4) { const [r, g, b] = [d.data[i], d.data[i + 1], d.data[i + 2]]; if (r > 190 && g > 140 && b < 200 && r - b > 40) d.data[i + 3] = 204; }
  x.putImageData(d, 0, 0);
}
const px = (x, c, X, Y, w = 1, h = 1) => { x.fillStyle = c; x.fillRect(X, Y, w, h); };
function noise(x, r, w, h, cols, n = w * h / 3) { for (let i = 0; i < n; i++) px(x, cols[Math.floor(r() * cols.length)], Math.floor(r() * w), Math.floor(r() * h)); }

// Saxo textures (from ref/saxo_base.jpg: scruffy grey terrier, dark eye patches, grey check suit, "Saxo" tag)
const FUR = ['#cfccc6', '#bdb9b2', '#a9a59e', '#dedbd5'];
const T = {
  fur: tex(16, 16, (x, r) => { px(x, '#c4c0b9', 0, 0, 16, 16); noise(x, r, 16, 16, FUR, 90); }, 3),
  furDark: tex(16, 16, (x, r) => { px(x, '#7d7973', 0, 0, 16, 16); noise(x, r, 16, 16, ['#6a6660', '#8e8a84', '#75716b'], 90); }, 4),
  face: tex(32, 32, (x, r) => {
    px(x, '#c9c5be', 0, 0, 32, 32); noise(x, r, 32, 32, FUR, 260);
    px(x, '#e2dfda', 13, 0, 6, 32);                               // pale blaze down the middle
    [[3, 9], [19, 9]].forEach(([X, Y]) => { px(x, '#77736d', X, Y - 1, 10, 11); px(x, '#77736d', X + 1, Y - 2, 8, 13); });  // eye patches
    [[5, 10], [21, 10]].forEach(([X, Y]) => {
      px(x, '#101010', X + 1, Y, 4, 8); px(x, '#101010', X, Y + 1, 6, 6);          // round-ish outlined eye
      px(x, '#ffffff', X + 1, Y + 1, 4, 6); px(x, '#ffffff', X, Y + 2, 1, 0);
      px(x, '#101010', X + 2, Y + 3, 2, 3); px(x, '#ffffff', X + 2, Y + 3, 1, 1);  // pupil + glint
    });
    px(x, '#5c5852', 4, 7, 7, 1); px(x, '#5c5852', 21, 7, 7, 1);                  // worried brows
  }, 5),
  snout: tex(16, 8, (x, r) => {
    px(x, '#dcd9d3', 0, 0, 16, 8); noise(x, r, 16, 8, FUR, 20);
    px(x, '#111', 5, 0, 6, 3); px(x, '#111', 6, 3, 4, 1); px(x, '#eee', 6, 0, 2, 1);  // nose
    px(x, '#111', 7, 4, 1, 1);
    [3, 4, 5, 6, 7, 8, 9, 10, 11, 12].forEach((X, i) => px(x, '#222', X, 5 + (Math.floor(i / 2) % 2), 1, 1));   // wavy nervous mouth
  }, 6),
  check: tex(16, 16, (x) => {
    px(x, '#8b857d', 0, 0, 16, 16);
    for (let i = 0; i < 16; i += 2) { px(x, '#6f6a63', i, 0, 1, 16); px(x, '#6f6a63', 0, i, 16, 1); }
    for (let i = 0; i < 16; i += 4) for (let j = 0; j < 16; j += 4) px(x, '#5b5650', i, j, 1, 1);
  }),
  suitFront: tex(32, 32, (x) => {
    px(x, '#8b857d', 0, 0, 32, 32);
    for (let i = 0; i < 32; i += 2) { px(x, '#6f6a63', i, 0, 1, 32); px(x, '#6f6a63', 0, i, 32, 1); }
    x.fillStyle = '#f4f4f0'; x.beginPath(); x.moveTo(9, 0); x.lineTo(23, 0); x.lineTo(16, 16); x.fill();   // shirt V
    x.fillStyle = '#4a4d52'; x.beginPath(); x.moveTo(14, 1); x.lineTo(18, 1); x.lineTo(19, 12); x.lineTo(16, 16); x.lineTo(13, 12); x.fill();  // tie
    px(x, '#3c3a36', 9, 0, 1, 17); px(x, '#3c3a36', 22, 0, 1, 17);        // lapel edges
    px(x, '#111', 21, 11, 10, 6); px(x, '#f2f2f2', 22, 12, 8, 4);          // name tag
    x.fillStyle = '#111'; x.font = '5px monospace'; x.fillText('Saxo', 22, 15.5);
    px(x, '#222', 16, 21, 1, 1); px(x, '#222', 16, 26, 1, 1);             // buttons
  }),
};

// ---------- Saxo, built from boxes with a joint hierarchy ----------
const box = (w, h, d, m) => new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m);
function joint(parent, x, y, z) { const j = new THREE.Group(); j.position.set(x, y, z); parent.add(j); return j; }
function hang(parent, w, h, d, m, oy = 0) { const b = box(w, h, d, m); b.position.y = -h / 2 + oy; parent.add(b); return b; }

function buildSaxo() {
  const M = { fur: mat({ map: T.fur }), dark: mat({ map: T.furDark }), check: mat({ map: T.check }), front: mat({ map: T.suitFront }),
    face: mat({ map: T.face }), snout: mat({ map: T.snout }), black: mat({ color: 0x151515 }), paw: mat({ map: T.fur, color: 0xf0eee8 }) };
  const S = { root: new THREE.Group() };
  S.hips = joint(S.root, 0, 0.3, 0);
  S.torso = joint(S.hips, 0, 0, 0);
  const body = box(0.46, 0.42, 0.3, [M.check, M.check, M.check, M.check, M.front, M.check]); body.position.y = 0.21; S.torso.add(body);
  S.neck = joint(S.torso, 0, 0.42, 0);
  S.head = joint(S.neck, 0, 0, 0);
  const skull = box(0.62, 0.52, 0.5, [M.fur, M.fur, M.fur, M.fur, M.face, M.fur]); skull.position.y = 0.28; S.head.add(skull);
  const snout = box(0.24, 0.15, 0.14, [M.fur, M.fur, M.fur, M.fur, M.snout, M.fur]); snout.position.set(0, 0.13, 0.31); S.head.add(snout);
  // scruffy tufts on top and cheeks
  const tuft = new THREE.ConeGeometry(0.07, 0.14, 4);
  [[-0.2, 0.56, 0.05, 0.3], [-0.05, 0.6, 0, -0.1], [0.1, 0.58, 0.06, 0.2], [0.22, 0.55, -0.05, -0.35], [0, 0.57, -0.15, 0]].forEach(([x, y, z, rz], i) => {
    const m = new THREE.Mesh(tuft, i % 2 ? M.dark : M.fur); m.position.set(x, y, z); m.rotation.z = rz; S.head.add(m);
  });
  [[-0.33, 0.1, 1.9], [0.33, 0.1, -1.9]].forEach(([x, y, rz]) => { const m = new THREE.Mesh(tuft, M.fur); m.position.set(x, y, 0.1); m.rotation.z = rz; S.head.add(m); });
  // floppy ears, pivoting at the top corners of the head
  S.earL = joint(S.head, -0.33, 0.5, 0); hang(S.earL, 0.08, 0.3, 0.22, M.dark);
  S.earR = joint(S.head, 0.33, 0.5, 0); hang(S.earR, 0.08, 0.3, 0.22, M.dark);
  // arms: shoulder → elbow → paw
  for (const s of [-1, 1]) {
    const k = s < 0 ? 'L' : 'R';
    const sh = joint(S.torso, s * 0.29, 0.38, 0); hang(sh, 0.12, 0.2, 0.13, M.check);
    const el = joint(sh, 0, -0.2, 0); hang(el, 0.11, 0.17, 0.12, M.check);
    const cuff = hang(el, 0.1, 0.03, 0.1, mat({ color: 0xf2f2ee }), -0.17);
    const paw = hang(el, 0.13, 0.1, 0.13, M.paw, -0.2);
    S['sh' + k] = sh; S['el' + k] = el;
    const hip = joint(S.hips, s * 0.12, 0.01, 0); hang(hip, 0.15, 0.15, 0.16, M.fur);
    const kn = joint(hip, 0, -0.15, 0); hang(kn, 0.14, 0.13, 0.15, M.fur);
    const foot = box(0.17, 0.06, 0.24, M.paw); foot.position.set(0, -0.15, 0.04); kn.add(foot);
    S['hip' + k] = hip; S['kn' + k] = kn;
  }
  return S;
}

// ---------- dance: named moves as functions of beat position, blended on move boundaries ----------
const BPMv = (window.BEATS && window.BEATS.bpm) || CONFIG.bpm, B0 = window.BEATS ? window.BEATS.offset : CONFIG.beatOffset;
const bp = t => (t - B0) * BPMv / 60;
const TAU = Math.PI * 2, fr = x => x - Math.floor(x), cl = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const sm = x => { x = cl(x); return x * x * (3 - 2 * x); };
const hit = f => Math.exp(-f * 5);                       // 1 on the beat, decays through it
const dip = f => 0.5 + 0.5 * Math.cos(TAU * f);          // 1 on the beat (down), 0 on the off-beat

const MOVES = {
  groove(b) {            // bounce on the knees, arms swinging, head nods on the beat
    const f = fr(b), d = dip(f), s = Math.sin(Math.PI * b);
    return { y: -0.05 * d, hipsRz: 0.08 * s, torsoRy: 0.15 * s, headRx: 0.25 * hit(f), headRz: -0.1 * s,
      shLx: -0.6 * s, shRx: 0.6 * s, elLx: -0.7, elRx: -0.7, shLz: -0.15, shRz: 0.15,
      hipLx: -0.35 * d, knLx: 0.7 * d, hipRx: -0.35 * d, knRx: 0.7 * d, ear: 0.3 * hit(f) };
  },
  point(b) {             // disco point: right arm up on even beats, down across on odd, left hand on hip
    const k = Math.floor(b), f = fr(b), up = k % 2 === 0, a = sm(f * 3);
    const from = up ? -0.2 : 2.6, to = up ? 2.6 : -0.2, z = from + (to - from) * a;
    return { y: -0.03 * dip(f), hipsRz: (up ? 0.12 : -0.12) * a, hipsRy: up ? -0.25 : 0.2, torsoRz: up ? -0.08 : 0.08,
      shRz: z, shRx: up ? -0.2 : -0.9, elRx: -0.1, shLz: -0.7, elLx: -1.6, shLx: 0.2,
      headRz: up ? 0.2 : -0.1, headRy: up ? -0.3 : 0.2, hipRx: up ? -0.1 : -0.3, knRx: up ? 0.1 : 0.6, ear: 0.2 };
  },
  shuffle(b) {           // side steps with both arms up waving
    const f = fr(b), s = Math.sin(Math.PI * b), lift = Math.max(0, Math.sin(TAU * f)), odd = Math.floor(b) % 2;
    return { x: 0.22 * s, y: -0.04 * dip(f), hipsRz: -0.12 * s, torsoRz: 0.1 * s,
      shLz: -2.5 + 0.3 * Math.sin(TAU * b), shRz: 2.5 + 0.3 * Math.sin(TAU * b), elLz: 0, elRz: 0,
      hipLx: odd ? -0.8 * lift : 0, knLx: odd ? 1.2 * lift : 0, hipRx: odd ? 0 : -0.8 * lift, knRx: odd ? 0 : 1.2 * lift,
      headRz: 0.15 * s, headRx: -0.1, ear: 0.5 * lift };
  },
  spin(b, b0) {          // two-beat spin that lands in a big arms-up pose
    const p = cl((b - b0) / 2), e = sm(p);
    return { ry: TAU * e, y: 0.12 * Math.sin(Math.PI * p), shLz: -0.5 - 2.1 * e, shRz: 0.5 + 2.1 * e, elLx: -0.3, elRx: -0.3,
      hipLx: -0.3 * Math.sin(Math.PI * p), knLx: 0.6 * Math.sin(Math.PI * p), headRx: -0.2 * e, ear: 0.8 * Math.sin(Math.PI * p) };
  },
  pose(b, b0) {          // "ta-da" hold after the spin, breathing on the beat
    const f = fr(b);
    return { y: -0.02 * dip(f), shLz: -2.6, shRz: 2.6, elLx: -0.2, elRx: -0.2, headRx: -0.25, hipsRz: 0.05, ear: 0.2 * hit(f), hipRx: -0.2, knRx: 0.3 };
  },
  chicken(b) {           // elbows flapping, head poking forward on every beat
    const f = fr(b), flap = Math.abs(Math.sin(TAU * b)), d = dip(f);
    return { y: -0.06 * d, torsoRx: 0.15, shLz: -0.7 - 0.6 * flap, shRz: 0.7 + 0.6 * flap, elLz: 1.9, elRz: -1.9, shLx: -0.2, shRx: -0.2,
      headZ: 0.08 * hit(f), headRx: 0.3 * hit(f) - 0.1, hipLx: -0.4 * d, knLx: 0.8 * d, hipRx: -0.4 * d, knRx: 0.8 * d, ear: 0.6 * hit(f) };
  },
};
// Choreography in beats (134.7 BPM, beat 0 at 0.139 s). Lyric hits: "stay" b12, "say" b20, "got away" b28, end b37.
const CHOREO = [[0, 'groove'], [8, 'point'], [16, 'shuffle'], [24, 'groove'], [26, 'spin'], [28, 'pose'], [30, 'chicken'], [34, 'groove']];
function poseAt(t) {
  const b = bp(t);
  let i = 0; while (i + 1 < CHOREO.length && b >= CHOREO[i + 1][0]) i++;
  const [b0, name] = CHOREO[i], cur = MOVES[name](b, b0);
  const bl = 0.35;                                         // blend in from the previous move over 0.35 beat
  if (i > 0 && b - b0 < bl) {
    const [pb0, pn] = CHOREO[i - 1], prev = MOVES[pn](b, pb0), k = sm((b - b0) / bl), out = {};
    for (const key of new Set([...Object.keys(prev), ...Object.keys(cur)])) out[key] = (prev[key] || 0) * (1 - k) + (cur[key] || 0) * k;
    if (pn === 'spin') out.ry = 0;
    return out;
  }
  return cur;
}
function applyPose(S, P) {
  const v = k => P[k] || 0;
  S.root.position.x = v('x'); S.root.rotation.y = v('ry');
  S.hips.position.y = 0.3 + v('y'); S.hips.rotation.set(0, v('hipsRy'), v('hipsRz'));
  S.torso.rotation.set(v('torsoRx'), v('torsoRy'), v('torsoRz'));
  S.head.position.z = v('headZ'); S.head.rotation.set(v('headRx'), v('headRy'), v('headRz'));
  S.earL.rotation.z = -0.35 - v('ear'); S.earR.rotation.z = 0.35 + v('ear');
  for (const k of ['L', 'R']) {
    S['sh' + k].rotation.set(v('sh' + k + 'x'), 0, v('sh' + k + 'z'));
    S['el' + k].rotation.set(v('el' + k + 'x'), 0, v('el' + k + 'z'));
    S['hip' + k].rotation.set(v('hip' + k + 'x'), 0, 0);
    S['kn' + k].rotation.set(v('kn' + k + 'x'), 0, 0);
  }
}

// ---------- maps ----------
const STREET_SCALE = 1.4;
const SHADOW = +(new URLSearchParams(location.search).get('shadow') || 0.45);   // blob shadow density (dither coverage at the centre)
function buildStreet() {
  const G = new THREE.Group();
  const asphalt = tex(32, 32, (x, r) => { px(x, '#3b3d42', 0, 0, 32, 32); noise(x, r, 32, 32, ['#34363a', '#44464b', '#2f3034'], 300); }, 11);
  const road = new THREE.Mesh(new THREE.PlaneGeometry(6, 80, 6, 40), mat({ map: asphalt, rep: [3, 40] })); road.rotation.x = -Math.PI / 2; road.position.z = -30; G.add(road);
  const dash = mat({ color: 0xd8d8c8 }), zebra = mat({ color: 0xe8e8e0 });
  for (let z = -60; z < 0; z += 3) { const d = box(0.12, 0.01, 1.2, dash); d.position.set(0, 0.005, z); G.add(d); }
  for (let i = -5; i <= 5; i++) { const s = box(0.3, 0.01, 1.4, zebra); s.position.set(i * 0.5, 0.006, 1.6); G.add(s); }
  const curb = tex(16, 16, (x, r) => { px(x, '#77787c', 0, 0, 16, 16); noise(x, r, 16, 16, ['#6a6b6f', '#85868a'], 60); px(x, '#55565a', 0, 0, 16, 1); px(x, '#55565a', 0, 8, 16, 1); }, 12);
  for (const s of [-1, 1]) { const w = box(2.5, 0.15, 80, mat({ map: curb, rep: [2, 60] })); w.position.set(s * 4.25, 0.075, -30); G.add(w); }
  // buildings: boxes with lit-window textures (alpha 0.8 marks self-lit pixels)
  const facade = (base, seed) => tex(32, 32, (x, r) => {
    px(x, base, 0, 0, 32, 32); noise(x, r, 32, 32, ['rgba(0,0,0,.18)', 'rgba(255,255,255,.08)'], 120);
    for (let yy = 3; yy < 30; yy += 9) for (let xx = 3; xx < 30; xx += 8) {
      const lit = r() < 0.45; x.fillStyle = lit ? 'rgba(255,214,120,0.8)' : '#1c2233'; x.fillRect(xx, yy, 5, 6);
      if (lit) { x.fillStyle = 'rgba(255,240,190,0.8)'; x.fillRect(xx + 1, yy + 1, 2, 2); }
    }
    selfLit(x, 32, 32);
  }, seed);
  const bases = ['#3f5f9a', '#6b4b3e', '#4d6b5a', '#7a6a55', '#39507e', '#5d4f6e'];
  for (const s of [-1, 1]) for (let i = 0; i < 9; i++) {
    const h = 4 + ((i * 7 + (s > 0 ? 3 : 0)) % 5) * 1.6, w = 6.5, zc = 4 - i * 7.2;
    const m = mat({ map: facade(bases[(i + (s > 0 ? 2 : 0)) % bases.length], 20 + i + (s > 0 ? 50 : 0)), rep: [2, Math.round(h / 3)] });
    const b = box(4, h, w, m); b.position.set(s * 7.5, h / 2, zc); G.add(b);
    const roof = box(4.2, 0.25, w + 0.2, mat({ color: 0x2a2c33 })); roof.position.set(s * 7.5, h + 0.12, zc); G.add(roof);
  }
  // street lamps
  const pole = mat({ color: 0x3a3d44 }), bulb = mat({ color: 0xfff1c0, unlit: 1 });
  const lamps = [];
  for (const s of [-1, 1]) for (let z = 2 - (s > 0 ? 4 : 0); z > -50; z -= 8) {
    const p = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 3.6, 5), pole); p.position.set(s * 3.3, 1.8, z); G.add(p);
    const arm = box(0.9, 0.06, 0.06, pole); arm.position.set(s * 2.9, 3.55, z); G.add(arm);
    const head = box(0.4, 0.1, 0.22, bulb); head.position.set(s * 2.5, 3.5, z); G.add(head);
    lamps.push(new THREE.Vector3(s * 2.5, 3.3, z).multiplyScalar(STREET_SCALE));
  }
  // parked car (low-poly) for scale
  const car = new THREE.Group(); const red = mat({ color: 0xa3202a }), glass = mat({ color: 0x1b2433 }), tyre = mat({ color: 0x111111 });
  const c1 = box(1.7, 0.5, 3.6, red); c1.position.y = 0.45; car.add(c1);
  const c2 = box(1.5, 0.45, 1.9, glass); c2.position.set(0, 0.92, -0.2); car.add(c2);
  for (const [x, z] of [[-0.8, 1.1], [0.8, 1.1], [-0.8, -1.2], [0.8, -1.2]]) { const w = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.2, 8), tyre); w.rotation.z = Math.PI / 2; w.position.set(x, 0.3, z); car.add(w); }
  car.position.set(-2.2, 0, -7); G.add(car);
  G.scale.setScalar(STREET_SCALE);   // metres: car ~1.5 m tall, lamps ~5 m, buildings 5–15 m, next to a 1.25 m Saxo
  const sky = tex(4, 64, (x) => { const gr = x.createLinearGradient(0, 0, 0, 64); gr.addColorStop(0, '#05081a'); gr.addColorStop(0.7, '#101a3c'); gr.addColorStop(1, '#23305a'); x.fillStyle = gr; x.fillRect(0, 0, 4, 64); });
  return {
    group: G, sky, shadowCol: 0x1c1f2e,
    light(fz = 0.5) {   // fz: the lamps nearest this z light the scene (a scene that travels down the street passes it)
      U.uAmb.value.set(0x5a6390); U.uDirCol.value.set(0x6a74a8); U.uDirDir.value.set(0.3, -1, -0.4).normalize();
      U.uFogCol.value.set(0x141d3d); U.uFog.value.set(10, 55); U.uPtRange.value = 10;
      const near = [...lamps].sort((a, b) => Math.abs(a.z - fz) - Math.abs(b.z - fz)).slice(0, 4);
      near.forEach((p, i) => { U.uPtPos.value[i].copy(p); U.uPtCol.value[i].setRGB(1.6, 1.3, 0.8); });
    },
    anim() {},
  };
}

function buildBeach() {
  const G = new THREE.Group();
  const sandT = tex(32, 32, (x, r) => { px(x, '#e6cf92', 0, 0, 32, 32); noise(x, r, 32, 32, ['#d9bf80', '#f0dca6', '#cdb175'], 320); }, 31);
  const sand = new THREE.Mesh(new THREE.PlaneGeometry(60, 30, 20, 10), mat({ map: sandT, rep: [30, 15] })); sand.rotation.x = -Math.PI / 2; sand.position.z = 3; G.add(sand);
  const seaT = tex(32, 32, (x, r) => { px(x, '#2f8fc4', 0, 0, 32, 32); noise(x, r, 32, 32, ['#3aa3d6', '#2780b3', '#5cc0e6'], 200); for (let i = 0; i < 6; i++) px(x, '#e8f6ff', Math.floor(r() * 28), Math.floor(r() * 32), 4, 1); }, 32);
  const seaM = mat({ map: seaT, rep: [40, 30] });
  const sea = new THREE.Mesh(new THREE.PlaneGeometry(200, 120, 20, 12), seaM); sea.rotation.x = -Math.PI / 2; sea.position.set(0, -0.05, -72); G.add(sea);
  const foam = box(60, 0.02, 0.5, mat({ color: 0xf4fbff })); foam.position.set(0, 0.0, -11.8); G.add(foam);
  // palms: stacked trunk segments bending, leaves as flat boxes
  const bark = tex(8, 16, (x, r) => { px(x, '#8a5a2e', 0, 0, 8, 16); for (let y = 0; y < 16; y += 3) px(x, '#5e3b1c', 0, y, 8, 1); }, 33);
  const barkM = mat({ map: bark }), leafM = mat({ color: 0x2f8f3a, side: THREE.DoubleSide }), leafM2 = mat({ color: 0x3fae47, side: THREE.DoubleSide });
  const palms = [];
  for (const [x, z, lean, h] of [[-3.2, -2.5, 0.25, 7], [3.6, -4.5, -0.3, 8], [-6, -8, 0.15, 6], [7, -1, -0.2, 6]]) {
    const p = new THREE.Group(); let top = new THREE.Group(); p.add(top);
    for (let i = 0; i < h; i++) {
      const seg = new THREE.Mesh(new THREE.CylinderGeometry(0.16 - i * 0.008, 0.2 - i * 0.008, 0.6, 5), barkM); seg.position.y = 0.3; top.add(seg);
      const next = new THREE.Group(); next.position.y = 0.6; next.rotation.z = lean / h * 2; top.add(next); top = next;
    }
    const crown = new THREE.Group(); top.add(crown);
    for (let i = 0; i < 7; i++) {
      const lf = new THREE.Group(); lf.rotation.y = i / 7 * TAU; crown.add(lf);
      const blade = box(1.8, 0.02, 0.45, i % 2 ? leafM : leafM2); blade.position.x = 0.85; blade.rotation.z = -0.45; lf.add(blade);
    }
    const nut = box(0.18, 0.18, 0.18, mat({ color: 0x5a3a1c })); nut.position.set(0.15, -0.1, 0.1); crown.add(nut);
    p.position.set(x, 0, z); G.add(p); palms.push(crown);
  }
  // sandcastle (a nod to Saxo's lore) and a striped umbrella
  const castleM = mat({ map: sandT, color: 0xf2e2b0 });
  const keep = box(0.7, 0.45, 0.7, castleM); keep.position.set(1.5, 0.22, -1.2); G.add(keep);
  for (const [x, z] of [[1.15, -0.85], [1.85, -0.85], [1.15, -1.55], [1.85, -1.55]]) { const tw = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.15, 0.6, 6), castleM); tw.position.set(x, 0.3, z); G.add(tw); const cone = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.22, 6), castleM); cone.position.set(x, 0.71, z); G.add(cone); }
  const stripe = tex(16, 4, (x) => { for (let i = 0; i < 16; i += 4) { px(x, '#e8423a', i, 0, 2, 4); px(x, '#f6f1e6', i + 2, 0, 2, 4); } });
  const umb = new THREE.Mesh(new THREE.ConeGeometry(1.3, 0.5, 8, 1, true), mat({ map: stripe, rep: [2, 1], side: THREE.DoubleSide })); umb.position.set(-1.8, 2.1, -4.5); umb.rotation.z = 0.15; G.add(umb);
  const stick = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 2.1, 4), mat({ color: 0xeeeeee })); stick.position.set(-1.8, 1.05, -4.5); stick.rotation.z = 0.15; G.add(stick);
  // low-poly clouds and a sun disc
  const cloudM = mat({ color: 0xffffff, unlit: 1 });
  for (const [x, y, z, s] of [[-14, 11, -40, 1.4], [6, 13, -45, 1], [20, 10, -38, 1.2], [-3, 16, -50, 0.8]]) {
    for (let k = 0; k < 3; k++) { const c = box(3 * s, 1 * s, 1.5 * s, cloudM); c.position.set(x + (k - 1) * 2 * s, y + (k === 1 ? 0.5 * s : 0), z); G.add(c); }
  }
  const sun = new THREE.Mesh(new THREE.CircleGeometry(3, 8), mat({ color: 0xfff3b0, unlit: 1 })); sun.position.set(9, 8, -22); G.add(sun);
  const sky = tex(4, 64, (x) => { const gr = x.createLinearGradient(0, 0, 0, 64); gr.addColorStop(0, '#2b7fd8'); gr.addColorStop(0.75, '#8fd0f5'); gr.addColorStop(1, '#d9f1ff'); x.fillStyle = gr; x.fillRect(0, 0, 4, 64); });
  return {
    group: G, sky, shadowCol: 0x9c7c48,
    light() {
      U.uAmb.value.set(0x8a8f9e); U.uDirCol.value.set(0xfff0d0); U.uDirDir.value.set(-0.5, -1, -0.6).normalize();
      U.uFogCol.value.set(0xc9ecff); U.uFog.value.set(25, 110); U.uPtRange.value = 1;
      U.uPtCol.value.forEach(c => c.setRGB(0, 0, 0));
    },
    anim(t) { seaM.uniforms.uOff.value.set(t * 0.12, t * 0.05); palms.forEach((c, i) => { c.rotation.z = 0.06 * Math.sin(t * 1.3 + i); c.rotation.x = 0.04 * Math.sin(t * 0.9 + i * 2); }); },
  };
}

// ---------- scene, shots, handheld camera ----------
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(50, RW / RH, 0.05, 200);
const saxo = buildSaxo(); scene.add(saxo.root);

// Tripo Saxo: rigged low-poly GLB with a baked preset animation. Its colour texture is shrunk to 128 px
// (PS1 VRAM-sized) and drawn with the PS1 material; the clip is sampled at an absolute time, so frames stay pure.
const Q = new URLSearchParams(location.search), CHAR = Q.get('char') || 'tripo', TEX = +(Q.get('tex') || 1024);
let tripo = null;
// Load a rigged character (GLB from Tripo, or FBX from Mixamo) plus extra motion files that share its skeleton.
// `extra` is a list of [clipName, url]. Clips are keyed by name so shots can ask for them.
const loaderFor = url => url.endsWith('.fbx') ? new FBXLoader() : new GLTFLoader();
async function loadAny(url) { const r = await loaderFor(url).loadAsync(url); return r.scene ? { root: r.scene, animations: r.animations } : { root: r, animations: r.animations }; }
// Keep the dancer on his mark: pin the hips' horizontal root motion to its first key (height and rotation stay).
function pinRoot(clip) {
  for (const tr of clip.tracks) if (/hips\.position$/i.test(tr.name)) { const v = tr.values, x0 = v[0], z0 = v[2]; for (let i = 0; i < v.length; i += 3) { v[i] = x0; v[i + 2] = z0; } }
  return clip;
}
// paired fight clips keep their root motion: attacker and victim line up only if both travel as authored
const NOPIN = /_(atk|vic)$/;
async function loadTripo(url, extra = [], firstName = 'base', texUrl = null) {
  const { root, animations } = await loadAny(url);
  // Mixamo FBX exports come back without their texture, so the colour map can be supplied separately (OBJ UVs: flipY true)
  const texImg = texUrl ? await new Promise((ok, no) => { const im = new Image(); im.onload = () => ok(im); im.onerror = no; im.src = texUrl; }) : null;
  root.traverse(o => {
    if (!o.isMesh) return;
    const m0 = Array.isArray(o.material) ? o.material[0] : o.material, img = texImg || (m0 && m0.map && m0.map.image);
    let map = null;
    if (img) { map = tex(TEX, TEX, x => x.drawImage(img, 0, 0, TEX, TEX)); map.flipY = texImg ? true : m0.map.flipY; }   // keep the source's UV convention (glTF false, FBX true)
    // flat, faceted shading like a hand-made low-poly toy: split shared vertices so every face gets its own normal
    o.geometry = o.geometry.toNonIndexed(); o.geometry.computeVertexNormals();
    o.material = mat({ map, lift: +(Q.get('lift') || 0.4) }); o.material.uniforms.uCol.value.setScalar(+(Q.get('bright') || 1.25)); o.frustumCulled = false;
  });
  const box3 = new THREE.Box3().setFromObject(root), h = box3.max.y - box3.min.y, k = 1.25 / h;
  const holder = new THREE.Group(); root.scale.multiplyScalar(k); root.position.y = -box3.min.y * k; holder.add(root);
  const clips = {}; animations.forEach((c, i) => { c.name = i ? firstName + '_' + i : firstName; clips[c.name] = pinRoot(c); });
  for (const [name, u] of extra) { const r = await loadAny(u).catch(e => (console.error('clip failed', u, e), { animations: [] })); if (r.animations[0]) { r.animations[0].name = name; clips[name] = NOPIN.test(name) ? r.animations[0] : pinRoot(r.animations[0]); } }
  return rig(holder, root, clips);
}
// Mixer, actions and the bones the shot logic measures, for a (possibly cloned) rigged root inside its holder.
function rig(holder, root, clips, faceCache = {}) {
  const mixer = new THREE.AnimationMixer(root), actions = {};
  for (const [n, c] of Object.entries(clips)) { actions[n] = mixer.clipAction(c); actions[n].play(); actions[n].weight = 0; }
  const byEnd = re => { let f = null; root.traverse(o => { if (!f && o.isBone && re.test(o.name)) f = o; }); return f; };
  const L = byEnd(/(^L_Upperarm|LeftArm)$/), R = byEnd(/(^R_Upperarm|RightArm)$/), head = byEnd(/Head$/);
  const feet = [byEnd(/(LeftToeBase|L_ToeBase)$/), byEnd(/(RightToeBase|R_ToeBase)$/)].filter(Boolean);
  const T = { holder, root, mixer, actions, clips, L, R, head, feet, faceCache, base: 'saxo', hips: byEnd(/Hips$/),
    handL: byEnd(/LeftHand$/), handR: byEnd(/RightHand$/), foreL: byEnd(/LeftForeArm$/), foreR: byEnd(/RightForeArm$/),
    midL: byEnd(/LeftHandMiddle1$/), midR: byEnd(/RightHandMiddle1$/) };   // paws and forearms carry the props
  holder.rotation.y = 0; holder.updateMatrixWorld(true); T.restYaw = L && R ? shoulderYaw(T) : 0; T.restFoot = footY(T); T.restHead = head ? head.getWorldPosition(_a).y : 0;   // bind pose (no clip applied yet); unrigged previews have no bones
  return T;
}
function footY(T) { let m = Infinity; for (const f of T.feet) { f.getWorldPosition(_a); m = Math.min(m, _a.y); } return m; }
// Lowest toe height over a clip window, relative to the bind pose: the shot's ground offset (cached, deterministic).
function clipGround(T, name, a, len) {
  const key = 'g:' + name + '@' + a + '+' + len.toFixed(2); if (key in T.faceCache) return T.faceCache[key];
  if (!T.feet.length) return T.faceCache[key] = 0;
  const act = T.actions[name], d = T.clips[name].duration, ky = T.holder.rotation.y, py = T.holder.position.y;
  T.holder.rotation.y = 0; T.holder.position.y = 0; for (const x of Object.values(T.actions)) x.weight = x === act ? 1 : 0;
  let m = Infinity;
  for (let i = 0; i < 24; i++) { act.time = (a + len * i / 23) % d; T.mixer.update(0); T.holder.updateMatrixWorld(true); m = Math.min(m, footY(T)); }
  T.holder.rotation.y = ky; T.holder.position.y = py;
  return T.faceCache[key] = T.restFoot - m;
}
// Body heading from the shoulder line (left → right upper arm) in world xz; skeleton-axis independent.
const _a = new THREE.Vector3(), _b = new THREE.Vector3();
function shoulderYaw(T) { T.L.getWorldPosition(_a); T.R.getWorldPosition(_b); return Math.atan2(_b.x - _a.x, _b.z - _a.z); }
// Average heading of the body over [a, a+len] of a clip (circular mean), relative to the rest pose.
// Deterministic: depends only on the clip and the range, so caching it keeps frames pure.
function clipFacing(T, name, a, len) {
  const key = name + '@' + a + '+' + len.toFixed(2); if (key in T.faceCache) return T.faceCache[key];
  const act = T.actions[name], d = T.clips[name].duration, keep = T.holder.rotation.y;
  T.holder.rotation.y = 0; for (const x of Object.values(T.actions)) x.weight = x === act ? 1 : 0;
  let sx = 0, sz = 0;
  for (let i = 0; i < 12; i++) { act.time = (a + len * i / 11) % d; T.mixer.update(0); T.holder.updateMatrixWorld(true); const y = shoulderYaw(T) - T.restYaw; sx += Math.sin(y); sz += Math.cos(y); }
  T.holder.rotation.y = keep;
  return T.faceCache[key] = { yaw: Math.atan2(sx, sz), R: Math.hypot(sx, sz) / 12 };   // R near 1 = steady heading, low = spinning
}
// Lowest head height over a window, as a fraction of the standing head height (1 = upright, ~0.6 = crouched).
function headLow(T, name, a, len) {
  if (!T.head) return 1;
  const key = 'h:' + name + '@' + a + '+' + len.toFixed(2); if (key in T.faceCache) return T.faceCache[key];
  const act = T.actions[name], d = T.clips[name].duration, ky = T.holder.rotation.y, py = T.holder.position.y;
  T.holder.rotation.y = 0; T.holder.position.y = 0; for (const x of Object.values(T.actions)) x.weight = x === act ? 1 : 0;
  let m = Infinity; for (let i = 0; i < 12; i++) { act.time = (a + len * i / 11) % d; T.mixer.update(0); T.holder.updateMatrixWorld(true); m = Math.min(m, T.head.getWorldPosition(_a).y - footY(T) + T.restFoot); }
  T.holder.rotation.y = ky; T.holder.position.y = py;
  return T.faceCache[key] = m / T.restHead;
}
// Pick the start offset in a clip whose [a, a+len] window turns the least (highest R), scanning in 0.5 s steps.
function steadiestOffset(T, name, len) {
  const key = 'best:' + name + '+' + len.toFixed(2); if (key in T.faceCache) return T.faceCache[key];
  const d = T.clips[name].duration; let best = 0, bestR = -1;
  for (let a = 0; a + Math.min(len, d) <= d + 1e-6; a += 0.5) {
    const { R } = clipFacing(T, name, a, len), sc = R - 2 * Math.max(0, 0.82 - headLow(T, name, a, len));   // penalise crouching
    if (sc > bestR + 1e-3) { bestR = sc; best = a; }
  }
  return T.faceCache[key] = best;
}
// Outfits without Mixamo or Blender: an unrigged Tripo model of Saxo in a costume (same T-pose and proportions) is
// laid over the rigged body and every vertex copies the bone weights of the nearest rigged vertices. The result is a
// SkinnedMesh on the same skeleton, so every Mixamo clip plays on it unchanged.
async function addOutfit(T, name, url) {
  const body = []; T.root.traverse(o => { if (o.isSkinnedMesh) body.push(o); });
  const sm = body[0]; T.root.updateMatrixWorld(true);
  const src = (await loadAny(url)).root; src.updateMatrixWorld(true);
  let mesh = null; src.traverse(o => { if (!mesh && o.isMesh) mesh = o; });
  // rigged body in world space (the skeleton is still in its bind pose, so the raw positions are the skinned ones)
  const bg = sm.geometry, bp = bg.attributes.position, bi = bg.attributes.skinIndex, bw = bg.attributes.skinWeight, v = new THREE.Vector3();
  const B = []; for (let k = 0; k < bp.count; k++) { v.fromBufferAttribute(bp, k).applyMatrix4(sm.matrixWorld); B.push([v.x, v.y, v.z, k]); }
  const bb = new THREE.Box3().setFromArray(B.flatMap(b => b.slice(0, 3)));
  // outfit in world space, then fitted to the body: scale by arm span (a hat would spoil a height fit), feet on the
  // body's feet, centred; the yaw (0/90/180/270°) is whichever lands closest to the body
  const g0 = mesh.geometry.index ? mesh.geometry.toNonIndexed() : mesh.geometry.clone(); g0.applyMatrix4(mesh.matrixWorld);
  const fit = yaw => {
    const g = g0.clone(); g.rotateY(yaw); g.computeBoundingBox(); const ob = g.boundingBox;
    const k = (bb.max.x - bb.min.x) / (ob.max.x - ob.min.x);
    g.translate(-(ob.max.x + ob.min.x) / 2, -ob.min.y, -(ob.max.z + ob.min.z) / 2); g.scale(k, k, k);
    g.translate((bb.max.x + bb.min.x) / 2, bb.min.y, (bb.max.z + bb.min.z) / 2); return g;
  };
  // spatial hash of the body vertices (deduped), searched ring by ring, so each lookup touches a few cells, not 12k points
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
  // Tripo multiview models always land at -90°; another yaw must fit clearly better (20%) to win, because a costume
  // that looks the same front and back (the poop suit, a ninja's hood) fits almost as well turned 180° and danced backwards
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
      const acc = {};   // inverse-distance blend of the 6 nearest body vertices' weights, keep the top 4 bones
      for (const [d2, j] of near(x, y, z, 6)) { const f = 1 / (d2 + 1e-6); for (let c = 0; c < 4; c++) { const wt = bw.getComponent(j, c); if (wt > 0) acc[bi.getComponent(j, c)] = (acc[bi.getComponent(j, c)] || 0) + wt * f; } }
      const top = Object.entries(acc).sort((a, b) => b[1] - a[1]).slice(0, 4), sum = top.reduce((a, b) => a + b[1], 0);
      w = top.map(([b, x]) => [+b, x / sum]); memo.set(key, w);
    }
    w.forEach(([b, x], c) => { SI[k * 4 + c] = b; SW[k * 4 + c] = x; });
  }
  g.applyMatrix4(sm.matrixWorld.clone().invert());   // into the body's local space
  g.setAttribute('skinIndex', new THREE.Uint16BufferAttribute(SI, 4)); g.setAttribute('skinWeight', new THREE.Float32BufferAttribute(SW, 4));
  g.computeVertexNormals();   // faceted like the body
  const m0 = Array.isArray(mesh.material) ? mesh.material[0] : mesh.material, img = m0 && m0.map && m0.map.image;
  const map = img ? tex(TEX, TEX, x => x.drawImage(img, 0, 0, TEX, TEX)) : null; if (map) map.flipY = m0.map.flipY;
  const out = new THREE.SkinnedMesh(g, mat({ map, lift: +(Q.get('lift') || 0.4) }));
  out.material.uniforms.uCol.value.setScalar(+(Q.get('bright') || 1.25)); out.frustumCulled = false;
  sm.parent.add(out); out.position.copy(sm.position); out.quaternion.copy(sm.quaternion); out.scale.copy(sm.scale);
  out.bind(sm.skeleton, sm.bindMatrix); out.visible = false;
  (T.outfits ||= { [T.base]: body })[name] = [out];
  console[Q.has('fitlog') ? 'warn' : 'log'](`outfit ${name}: ${n} verts, yaw ${Math.round(best.yaw * 180 / Math.PI)}°, fit error ${best.e.toFixed(3)} m`);
}
// Head graft: Tripo sometimes bakes a costume's head badly (Sadi's white dress came back with a faceless grey dome), so
// a look can borrow the head of another: triangles skinned mostly to the Head bone come from `from`, the rest from the
// look itself. Both are SkinnedMeshes on the same skeleton, so the grafted head follows every clip. No re-roll needed.
function trianglesBy(mesh, keep) {
  const g = mesh.geometry, n = g.attributes.position.count, out = new THREE.BufferGeometry(), idx = [];
  for (let t = 0; t + 2 < n; t += 3) if (keep(t)) idx.push(t, t + 1, t + 2);
  for (const [k, a] of Object.entries(g.attributes)) {
    const arr = new a.array.constructor(idx.length * a.itemSize);
    idx.forEach((v, j) => { for (let c = 0; c < a.itemSize; c++) arr[j * a.itemSize + c] = a.array[v * a.itemSize + c]; });
    out.setAttribute(k, new THREE.BufferAttribute(arr, a.itemSize, a.normalized));
  }
  return out;
}
function graftHead(T, look, from) {
  const [body] = T.outfits?.[look] || [], [src] = T.outfits?.[from] || []; if (!body || !src) return;
  const isHead = body.skeleton.bones.map(b => /Head(Top_End)?$/.test(b.name));
  const headW = (m, i) => { const si = m.geometry.attributes.skinIndex, sw = m.geometry.attributes.skinWeight; let w = 0; for (let c = 0; c < 4; c++) if (isHead[si.getComponent(i, c)]) w += sw.getComponent(i, c); return w; };
  const tri = (m, t) => (headW(m, t) + headW(m, t + 1) + headW(m, t + 2)) / 3;
  body.geometry = trianglesBy(body, t => tri(body, t) < 0.5);
  const head = new THREE.SkinnedMesh(trianglesBy(src, t => tri(src, t) >= 0.5), src.material);
  head.frustumCulled = false; src.parent.add(head); head.position.copy(src.position); head.quaternion.copy(src.quaternion); head.scale.copy(src.scale);
  head.bind(src.skeleton, src.bindMatrix); head.visible = false; T.outfits[look].push(head);
}
function wearOutfit(T, name) { for (const [k, ms] of Object.entries(T.outfits || {})) ms.forEach(m => { m.visible = k === (T.outfits[name] ? name : T.base); }); }
const OUTFITS = { cowboy: 'assets/models/saxo_cowboy.glb', astronaut: 'assets/models/saxo_astronaut.glb', dj: 'assets/models/saxo_dj.glb', beach: 'assets/models/saxo_beach.glb', poop: 'assets/models/saxo_poop.glb', moto: 'assets/models/saxo_moto.glb', sponge: 'assets/models/saxo_sponge.glb',
  michou: 'assets/models/saxo_michou.glb',   // white tux with black satin lapels and black shades ("Dans le club", 2026-09-25)
  nena: 'assets/models/saxo_nena.glb',      // Nena's 1983 look: shaggy dark 80s hair, shiny black quilted vest, white shirt, jeans ("99 Luftballons", 2026-09-25)
  pirate: 'assets/models/saxo_pirate.glb' };   // the pirate captain: tricorn over a red bandana, short beaded dreadlocks, kohl, linen shirt, waistcoat, red sash ("He's A Pirate", 2026-09-26)
// Sadi (a black-and-tan terrier girl, sheets in assets/ref/sadi/) is modelled on Saxo's T-pose and proportions, so she
// rides a clone of his skeleton: her base look and every costume are fitted like outfits, and all his clips play on her.
// Kob (a grumpy grey tabby cat girl, sheets in assets/ref/kob/) is built the same way and takes the same slot: the
// partner slot holds one of them per render, picked by ?with=sadi (default) | kob | compote, or by ?cast=<name>.
// Compote (an always-angry grey dwarf bunny girl in a plum hoodie, sheets in assets/ref/compote/) is the fourth.
const PARTNERS = {
  sadi: { scale: 0.92, models: { sadi: 'assets/models/sadi_base.glb', cowgirl: 'assets/models/sadi_cowgirl.glb', astronaut: 'assets/models/sadi_astronaut.glb',
    disco: 'assets/models/sadi_disco.glb', beach: 'assets/models/sadi_beach.glb', cheer: 'assets/models/sadi_cheer.glb', poop: 'assets/models/sadi_poop.glb', patrick: 'assets/models/sadi_patrick.glb', hotdog: 'assets/models/sadi_hotdog.glb',
    white: 'assets/models/sadi_white.glb', rave: 'assets/models/sadi_rave.glb',   // rave: neon-green mesh top, cargo pants, glow bracelets ("99 Luftballons")
    pirate: 'assets/models/sadi_pirate.glb' },   // pirate heroine: red bandana, gold hoops, white blouse, laced corset vest, red sash, boots ("He's A Pirate")
    heads: { white: 'sadi' },   // the white dress came back from Tripo with a faceless head: wear her own
    byMap: { moon: 'astronaut', club: 'disco', beach: 'beach', western: 'cowgirl', stadium: 'cheer', mars: 'astronaut', spaceship: 'astronaut', underwater: 'astronaut', bikini: 'patrick', stage: 'disco', arcade: 'disco', farm: 'cowgirl', jungle: 'cowgirl', pyramids: 'cowgirl', school: 'cheer', pirate: 'beach', candy: 'beach', volcano: 'beach', supermarket: 'hotdog' } },
  kob: { scale: 0.92, models: { kob: 'assets/models/kob_base.glb', astronaut: 'assets/models/kob_astronaut.glb', cowgirl: 'assets/models/kob_cowgirl.glb',
    popstar: 'assets/models/kob_popstar.glb', beach: 'assets/models/kob_beach.glb', ninja: 'assets/models/kob_ninja.glb', witch: 'assets/models/kob_witch.glb', chef: 'assets/models/kob_chef.glb', poop: 'assets/models/kob_poop.glb', moto: 'assets/models/kob_moto.glb',
    pyjama: 'assets/models/kob_pyjama.glb' },
    byMap: { moon: 'astronaut', mars: 'astronaut', spaceship: 'astronaut', underwater: 'astronaut', bikini: 'astronaut', western: 'cowgirl', farm: 'cowgirl', jungle: 'cowgirl', pyramids: 'cowgirl',
      club: 'popstar', stage: 'popstar', arcade: 'popstar', beach: 'beach', pirate: 'beach', candy: 'beach', volcano: 'beach', tokyo: 'ninja', snow: 'ninja', subway: 'ninja', graveyard: 'witch', supermarket: 'chef', highway: 'moto' } },
  compote: { scale: 0.92, models: { compote: 'assets/models/compote_base.glb', astronaut: 'assets/models/compote_astronaut.glb', cowgirl: 'assets/models/compote_cowgirl.glb',
    punk: 'assets/models/compote_punk.glb', beach: 'assets/models/compote_beach.glb', boxer: 'assets/models/compote_boxer.glb', poop: 'assets/models/compote_poop.glb',
    bouncer: 'assets/models/compote_bouncer.glb' },
    byMap: { moon: 'astronaut', mars: 'astronaut', spaceship: 'astronaut', underwater: 'astronaut', bikini: 'astronaut', western: 'cowgirl', farm: 'cowgirl', jungle: 'cowgirl', pyramids: 'cowgirl',
      club: 'punk', stage: 'punk', arcade: 'punk', subway: 'punk', tokyo: 'punk', graveyard: 'punk', beach: 'beach', pirate: 'beach', candy: 'beach', volcano: 'beach', stadium: 'boxer', school: 'boxer' } },
};
const PARTNER = Q.get('with') || (Q.get('cast') !== 'sadi' && PARTNERS[Q.get('cast')] ? Q.get('cast') : null);   // resolved against the episode below
// ?cast=saxo (default) | sadi | duo. A duo stands side by side, a little apart, dancing the same clip in sync.
// ?scene=skate | fight renders a short action scene instead of the dance video (src/scenes.js)
const SCENE = Q.get('scene');
// ?episode=<name> renders episodes/<name>.json: a shot list on the beat grid mixing dance shots and action scenes
const EP = Q.get('episode') ? await (await fetch(`episodes/${Q.get('episode')}.json`)).json() : null;
// "with" names the partner, or several: ["sadi", "kob", "compote"] loads them all at once (the first one fills the
// partner slot that `cast` and the scenes use; every one of them can be placed by a shot's `actors`)
const EP_WITH = [].concat(EP?.with || []);
const WITH = PARTNERS[PARTNER || EP_WITH[0]] ? PARTNER || EP_WITH[0] : 'sadi', { models: SADI, byMap: SADI_OUTFIT, scale: SADI_SCALE } = PARTNERS[WITH];
// An episode built from `actors` shots loads only the looks it uses (each look costs load time in every render tab);
// null = load everything (the older episodes and the planner)
const LOOKS = (() => {
  if (!EP || !EP.shots.some(s => s.actors)) return null;
  const L = {}, add = (who, look) => (L[who] ||= new Set()).add(look);
  for (const s of EP.shots) {
    if (s.actors) for (const a of s.actors) add(a.who || 'saxo', a.look || a.who || 'saxo');
    if (s.crowd) add(s.crowd.who, s.crowd.look || s.crowd.who);
    else if (s.outfit && (s.sadiOutfit || s.cast === 'saxo' || !s.cast)) { add('saxo', s.outfit); if (s.sadiOutfit) add(WITH, s.sadiOutfit); }
    else return null;   // a shot that leans on the per-map defaults: keep every look
  }
  return L;
})();
const wantLook = (who, look) => !LOOKS || !!LOOKS[who]?.has(look);
const slot = c => PARTNERS[c] ? 'sadi' : c;   // 'sadi' in cast logic means "the partner", whoever it is
const CAST = slot(Q.get('cast')) || (EP ? 'duo' : SCENE === 'skate' ? 'sadi' : SCENE === 'fight' ? 'duo' : 'saxo'), DUO_X = 0.42;   // an episode loads both dogs; each shot says who's in it
let sadi = null;
const CREW = {};   // every loaded character by name (saxo, the partner, and any extra partners an episode brings)
function makeShadow() { const s = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 0.9), mat({ shadow: 0.7 })); s.rotation.x = -Math.PI / 2; s.position.y = 0.012; scene.add(s); return s; }
if (CHAR === 'tripo') {
  const MIXAMO = ['twist', 'macarena', 'silly_twist', 'chicken', 'twerk', 'ymca', 'robot', 'shopping_cart', 'running_man', 'moonwalk', 'shuffle', 'tut', 'booty_step', 'arm_wave', 'snake', 'shimmy', 'thriller_1', 'thriller_2', 'thriller_3', 'thriller_4', 'charleston', 'samba', 'belly', 'northern_soul_spin',
    'skate_push', 'skate_idle', 'uppercut_atk', 'uppercut_vic', 'slam_atk', 'slam_vic',
    ...(EP?.clips || [])];   // an episode can list extra clips from the local library (assets/mixamo/anims/<slug>.fbx)
  tripo = Q.get('model') ? await loadTripo(Q.get('model'))
    : await loadTripo('assets/mixamo/saxo_skin_gangnam.fbx', MIXAMO.map(n => [n, `assets/mixamo/anims/${n}.fbx`]), 'gangnam', 'assets/mixamo/saxo_mixamo/saxo_mixamo.jpg');
  if (!Q.get('model') && CAST !== 'sadi') for (const [n, u] of Object.entries(OUTFITS)) if (wantLook('saxo', n)) await addOutfit(tripo, n, u).catch(e => console.error('outfit failed', n, e));
  // clone before any partner look is worn on it: the clone's own skeleton, sharing Saxo's clips and facing cache
  const partner = async name => {
    const P = PARTNERS[name], root = SkeletonUtils.clone(tripo.root), holder = new THREE.Group(); holder.add(root);
    root.traverse(o => { if (o.isSkinnedMesh) o.visible = false; });
    const D = rig(holder, root, tripo.clips, tripo.faceCache); D.base = name; D.outfits = { [name]: [] }; D.scale = P.scale;
    root.traverse(o => { if (o.isSkinnedMesh && !D.body) D.body = o; });
    for (const [n, u] of Object.entries(P.models)) if (n === name || wantLook(name, n)) await addOutfit(D, n, u).catch(e => console.error(name + ' outfit failed', n, e));
    for (const [look, from] of Object.entries(P.heads || {})) graftHead(D, look, from);
    holder.scale.setScalar(P.scale); scene.add(holder); D.shadow = makeShadow();
    return D;
  };
  if (!Q.get('model') && CAST !== 'saxo') {
    sadi = await partner(WITH); CREW[WITH] = sadi;
    for (const n of EP_WITH.slice(1)) if (PARTNERS[n] && !CREW[n]) CREW[n] = await partner(n);
    if (CAST === 'sadi') tripo.holder.visible = false;
  }
  tripo.scale = 1; CREW.saxo = tripo;
  window.DBG = { tripo, clipFacing, shoulderYaw, steadiestOffset, camera, CREW, get sadi() { return sadi; } };
  window.SAXO_CLIPS = Object.fromEntries(Object.entries(tripo.clips).map(([n, c]) => [n, c.duration]));
  scene.add(tripo.holder); saxo.root.visible = false;
  tripo.shadow = makeShadow(); if (CAST === 'sadi') tripo.shadow.visible = false;
}
// ---- crowds (a shot's `crowd`): up to 99 copies of one character's look sharing one pose ("99 Kriegsminister": every
// neighbour of the building, in her pyjamas). A hidden clone of the skeleton plays the crowd's clip; each copy is a
// SkinnedMesh bound to that skeleton in detached mode, so its own matrix moves the posed body:
// M_copy = T_copy · T_src⁻¹ · bindMatrix. One pose for all of them: they move in sync (the joke).
//   crowd: { who, look, clip, at ('auto'), speed, once, n (≤ 99), cols, x0, z0 (front row centre), dx, dz (spacing),
//            jitter (m), yaw (deg), face ('camera' | 'world'), mx, mz (a march over the shot), skip: [[x, z, r]] (holes) }
const CROWDS = {};
if (tripo && EP) for (const sh of EP.shots) if (sh.crowd) {
  const c = sh.crowd, look = c.look || c.who, key = c.who + ':' + look, D = CREW[c.who];
  if (!D || !D.outfits?.[look]?.length) { console.error('crowd: look not loaded', key); continue; }
  if (!CROWDS[key]) {
    const root = SkeletonUtils.clone(tripo.root), holder = new THREE.Group(); holder.add(root);
    root.traverse(o => { if (o.isSkinnedMesh) o.visible = false; });
    const R = rig(holder, root, tripo.clips, tripo.faceCache); let body = null; root.traverse(o => { if (o.isSkinnedMesh && !body) body = o; });
    holder.scale.setScalar(D.scale || 1); scene.add(holder);
    CROWDS[key] = { R, body, D, look, copies: [], shadows: [] };
  }
  const C = CROWDS[key];
  while (C.copies.length < Math.min(99, c.n || 99)) {
    C.copies.push(D.outfits[look].map(m => { const k = new THREE.SkinnedMesh(m.geometry, m.material); k.bindMode = THREE.DetachedBindMode; k.bind(C.body.skeleton, m.bindMatrix); k.matrixAutoUpdate = false; k.frustumCulled = false; k.visible = false; scene.add(k); return k; }));
    C.shadows.push(makeShadow());
  }
}
const MAP_KIT = { THREE, mat, tex, px, noise, box, selfLit, U, TAU, beat: bp };
const MAPS = { street: buildStreet(), beach: buildBeach(), ...buildMoreMaps(MAP_KIT), ...buildIndoorMaps(MAP_KIT), ...buildOutdoorMaps(MAP_KIT), ...buildSeaMaps(MAP_KIT), ...buildClubMaps(MAP_KIT), ...buildTechnoMaps(MAP_KIT), ...buildPirateMaps(MAP_KIT) };
window.MAP_NAMES = Object.keys(MAPS);
// Affine UVs warp in proportion to triangle size, so a 60 m floor drawn as one quad folds its texture along the
// diagonal and swims as the camera moves. PS1 games cut big surfaces into small tiles; do the same here: every plane
// or box face longer than TESS_CELL metres (in world units) is split into cells of about that size.
// Floor decals (a mat, a puddle, a stripe a few mm above y = 0) lose the depth test to the floor once vertex snapping
// moves their corners, so they get a polygon offset that scales with the viewing slope.
const TESS_CELL = 1.5, TESS_MAX = 48;
function tessellate(root) {
  const seg = L => Math.min(TESS_MAX, Math.max(1, Math.ceil(L / TESS_CELL)));
  const ws = new THREE.Vector3(), bb = new THREE.Box3(), cache = new Map();
  root.updateMatrixWorld(true);
  root.traverse(o => {
    if (!o.isMesh || o.isSkinnedMesh) return;
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
    if (bb.min.y > 0.0002 && bb.max.y < 0.06 && o.material) { o.material.polygonOffset = true; o.material.polygonOffsetFactor = -2; o.material.polygonOffsetUnits = -4; }
  });
}
Object.values(MAPS).forEach(m => { tessellate(m.group); m.group.visible = false; scene.add(m.group); });

const beatT = n => B0 + n * 60 / BPMv, barOf = t => Math.round((t - B0) / (4 * 60 / BPMv));
// Shot planner (research/REFERENCE_ANALYSIS.md): cuts on bar lines; 4-bar shots in the verse, 2-bar shots in the
// chorus (a new place on each chorus line), and a ~4-bar orbit to close. Cameras are polar around Saxo:
// [angle° from, to], [radius from, to], [height from, to], look-at y, fov. The move eases in and carries into the cut.
// Camera moves. Polar around Saxo: ang° / r / h are [from, to]; look = look-at height; fov a number or [from, to];
// ease 'in' (default: accelerates into the cut), 'out' (arrives and settles) or 'lin'. dolly: r changes while the fov
// keeps a `frame`-metre-tall view of him (the vertigo zoom). whip: the shot opens with a fast pan into place.
const CAM_MOVES = {
  push:   { ang: [0, 8], r: [5.2, 3.8], h: [0.9, 0.8], look: 1.1, fov: 50 },
  arc:    { ang: [40, 12], r: [4.4, 3.6], h: [1.2, 1.0], look: 1.05, fov: 48 },
  arcL:   { ang: [-42, -14], r: [4.6, 3.8], h: [1.4, 1.1], look: 1.1, fov: 50 },
  low:    { ang: [-10, 6], r: [4.2, 1.9], h: [0.18, 0.2], look: 0.95, fov: 70 },
  high:   { ang: [-8, 8], r: [4.4, 4.8], h: [3.4, 3.0], look: 0.8, fov: 50 },
  locked: { ang: [16, 16], r: [4.8, 4.8], h: [1.0, 1.0], look: 1.1, fov: 48 },
  crane:  { ang: [-20, 10], r: [3.0, 5.6], h: [0.25, 5.0], look: [1.2, 0.5], fov: 52 },
  drone:  { ang: [12, 3], r: [26, 3.6], h: [22, 1.2], look: [0.3, 1.05], fov: 50, ease: 'out', outdoor: true },   // down the street axis, above the roofs
  orbit:  { ang: [-120, 120], r: [4.2, 4.2], h: [1.3, 1.0], look: 1.05, fov: 50, ease: 'lin' },
  track:  { ang: [-60, 60], r: [5.5, 5.5], h: [0.7, 0.7], look: 1.0, fov: 44, ease: 'lin' },
  dolly:  { ang: [4, 0], r: [8.5, 2.3], h: [1.0, 0.9], look: 0.95, frame: 2.6, ease: 'lin' },
  closer: { ang: [-70, 70], r: [3.6, 6.2], h: [1.1, 2.0], look: 1.1, fov: 50, ease: 'lin' },
};
const VERSE_MOVES = ['drone', 'crane', 'orbit', 'track'];                       // 4-bar shots get the big moves
const CHORUS_MOVES = ['push', 'low', 'arc', 'dolly', 'high', 'arcL', 'locked', 'push'];
// ?maps=a,b,c overrides the rotation (any MAPS key: see window.MAP_NAMES)
const MAP_ORDER = Q.get('maps') ? Q.get('maps').split(',') : ['street', 'club', 'beach', 'stadium', 'western', 'moon', 'highway', 'rooftop'];
// no crouching or floor clips (they read as a grey lump); 'auto' offsets also skip crouched windows
const DANCES = ['gangnam', 'macarena', 'shuffle', 'ymca', 'chicken', 'twist', 'running_man', 'silly_twist', 'arm_wave', 'charleston', 'booty_step', 'shimmy', 'samba', 'robot'];
// Viral pacing (research/REFERENCE_ANALYSIS.md, tightened): a 1-bar hook, 2-bar verse shots with the big moves, 1-bar
// shots for the build into the chorus, a stinger of one-beat flash cuts right before the drop, 1-bar chorus shots,
// and a 2-bar orbit to close. Cuts always land on beats. Each map dresses Saxo in its outfit.
const MAP_OUTFIT = { moon: 'astronaut', club: 'dj', beach: 'beach', western: 'cowboy', mars: 'astronaut', spaceship: 'astronaut', underwater: 'astronaut', bikini: 'sponge', stage: 'dj', arcade: 'dj', farm: 'cowboy', jungle: 'cowboy', pyramids: 'cowboy', pirate: 'beach', candy: 'beach', volcano: 'beach', highway: 'moto' };
// An episode's shots: { beat, kind: 'dance', map, move, clip, cast?, outfit?, sadiOutfit?, whip? } or
// { beat, kind: 'action', scene: 'skate' | 'fight', cam (the scene's own shot index), from (s into the scene), who?, word? }.
// `beat` counts from the first beat (B0); the first shot starts at 0 s. The next shot's beat is this one's cut.
function episodeShots() {
  return EP.shots.map((e, i) => {
    const t0 = i ? beatT(e.beat) : 0, map = e.map || 'street', move = e.move || 'push';
    if (e.kind === 'action') return { ...e, sceneCam: e.cam, t0, map: e.scene === 'fight' ? 'stadium' : 'street', cam: CAM_MOVES.locked, move: e.scene, clip: e.scene, outfit: 'saxo', sadiOutfit: WITH, cast: 'scene' };
    const actors = e.actors && e.actors.map(a => actorSpec(a, e, map));
    return { ...e, t0, map, kind: 'dance', cam: { ...CAM_MOVES[move], ...(e.cam || {}), whip: !!e.whip }, move, clip: e.clip || DANCES[i % DANCES.length],
      cast: actors ? 'actors' : slot(e.cast) || 'saxo', actors, outfit: e.outfit || MAP_OUTFIT[map] || 'saxo', sadiOutfit: e.sadiOutfit || SADI_OUTFIT[map] || WITH };
  });
}
// A shot's `actors` place any loaded characters by hand, each with its own clip and look:
//   { who: saxo|sadi|kob|compote, look, clip (a clip name, or "tpose" for the bind pose), at (s into the clip, or
//     "auto"), speed, once (hold the last frame instead of looping), x, z (world m), face: "camera" (default: turn
//     to the shot's camera, cancelling the clip's own heading) | "world" (yaw is absolute), yaw (deg, added),
//     ground: "toe" (default, jumps survive) | "mesh" (lowest vertex on the floor every frame: lying, falling),
//     lift (m, on top of the ground: a stage, a seat), hold / holdL (a prop in the right / left paw: glass, milk,
//     phone, pad, finger), ride ("jetski"), star (false keeps the face off the karaoke), mx / mz (m walked over the shot),
//     scale (a giant: 16 = a 18 m Compote rising from the sea), my / myAt / myDur (a rise or a sink, m), holdScale,
//     holdTo (the held prop goes at that second: it has been taken), noShadow }
function actorSpec(a, e, map) {
  const who = a.who || 'saxo', P = PARTNERS[who];
  return { who, look: a.look || (P ? P.byMap[map] || who : e.outfit || MAP_OUTFIT[map] || 'saxo'), clip: a.clip || e.clip || 'gangnam', at: a.at ?? e.at ?? 'auto',
    speed: a.speed ?? 1, once: !!a.once, x: a.x || 0, z: a.z || 0, mx: a.mx || 0, mz: a.mz || 0, face: a.face || 'camera', yaw: (a.yaw || 0) * Math.PI / 180, ground: a.ground || 'toe',
    lift: a.lift || 0, hold: a.hold || null, holdL: a.holdL || null, ride: a.ride || null, star: a.star !== false,
    arm: a.arm || null, aim: a.aim || 'up', upAt: a.upAt, upEnd: a.upEnd, wave: a.wave || 0,   // arm: L | R | both, aim: up | toast | phone | [x, y, z], wave: flap
    aim2: a.aim2 || null, aim2At: a.aim2At ?? null, toss: a.toss || null, cable: a.cable || null, holdFrom: a.holdFrom ?? null, holdTo: a.holdTo ?? null,
    // scale: a giant (the sea monster is a 16x Compote), my: metres risen (+) or sunk (-) from myAt s over myDur s
    // (smoothstep; default the whole shot), holdScale: the held prop's size (a carrot pinched in a giant's paw), noShadow
    scale: a.scale || 1, my: a.my || 0, myAt: a.myAt || 0, myDur: a.myDur ?? null, holdScale: a.holdScale || 1, noShadow: !!a.noShadow, air: !!a.air };   // air: the shot means it off the floor (a slide down a rope)   // holdFrom: the held prop shows from that second of the shot   // aim2 from aim2At s (a yank), toss: the held prop flies off, cable: [x, y, z] the held plug's cable runs to
}
function planShots() {
  if (EP) return episodeShots();
  const dur = CONFIG.duration, beats = Math.floor((dur - B0) * BPMv / 60), L = window.LYRICS || [], C = window.LINE_CHORUS || [];
  const ci = L.findIndex((_, i) => C[i]), chorusB = ci >= 0 ? barOf(L[ci][0][0]) * 4 : Infinity;   // chorus downbeat, in beats
  const closeB = Math.max(chorusB + 8, (Math.floor(beats / 4) - 2) * 4);
  const cuts = [[0, 'hook']];
  for (let b = 4; b < closeB; ) {
    if (b >= chorusB) { cuts.push([b, 'chorus']); b += 4; }
    else if (b >= chorusB - 4) { cuts.push([b, 'sting']); b += 1; }          // one-beat flash cuts into the drop
    else if (b >= chorusB - 12) { cuts.push([b, 'build']); b += 4; }        // 1-bar shots building up
    else { cuts.push([b, 'verse']); b = Math.min(b + 8, chorusB - 12 > b + 8 ? b + 8 : chorusB - 12); if (b <= cuts.at(-1)[0]) b = cuts.at(-1)[0] + 4; }
  }
  cuts.push([closeB, 'closer']);
  const outfit = Q.get('outfit'), onlyMap = Q.get('map');   // ?outfit=cowboy / ?map=club force one for previews
  const n = { verse: 0, chorus: 0, build: 0, sting: 0 }, POOL = { hook: ['push'], verse: VERSE_MOVES, build: ['arc', 'low', 'high'], sting: ['locked'], chorus: CHORUS_MOVES, closer: ['closer'] };
  return cuts.map(([b, kind], i) => {
    const map = onlyMap || MAP_ORDER[i % MAP_ORDER.length], pool = POOL[kind];
    let move = pool[(n[kind] = (n[kind] || 0) + 1) % pool.length];
    if (CAM_MOVES[move].outdoor && MAPS[map].indoor) move = 'crane';
    const whip = (kind === 'chorus' && i % 2 === 0) || (kind === 'chorus' && cuts[i - 1] && cuts[i - 1][1] === 'sting');
    return { t0: b ? beatT(b) : 0, map, kind, cam: { ...CAM_MOVES[move], whip }, move, clip: DANCES[i % DANCES.length],
      outfit: outfit || MAP_OUTFIT[map] || 'saxo', sadiOutfit: Q.get(WITH) || Q.get('sadi') || SADI_OUTFIT[map] || WITH };
  });
}
const PLAN = planShots();
PLAN.forEach((p, i) => { p.t1 = i + 1 < PLAN.length ? PLAN[i + 1].t0 : CONFIG.duration; });   // a map flag can run across its shot (a boat, a wake)
const SHOTS = PLAN.map(p => [p.t0, p.map, p.cam, p.outfit, p.sadiOutfit, p.cast || CAST]);
window.PS1_SHOTS = SHOTS.map(s => s[0]); window.PS1_PLAN = PLAN.map(p => `${p.t0.toFixed(2)} ${p.kind} ${p.map} ${p.move} ${p.clip} ${p.outfit}/${p.sadiOutfit}`);
// per shot: [clip name, seconds into the clip or 'auto' = the steadiest-facing window].
const SHOT_CLIPS = PLAN.map(p => [p.clip, p.at ?? 'auto']);
function shotIndex(t) { let i = 0; while (i + 1 < SHOTS.length && t >= SHOTS[i + 1][0]) i++; return i; }
// smooth deterministic handheld shake: sum of sines with fixed phases
const shake = (t, s) => [0, 1, 2].map(a => 0.5 * Math.sin(t * 1.7 + a * 2.1 + s) + 0.3 * Math.sin(t * 3.9 + a * 5.3 + s * 1.3) + 0.2 * Math.sin(t * 7.1 + a));

// beat bounce (house style, see research/REFERENCE_ANALYSIS.md rule 5): a zoom punch plus a small bob on every beat,
// bigger on the bar's downbeat and on the first beat of a shot. ~60 ms attack, exponential decay over the beat.
const BOUNCE = +(Q.get('bounce') ?? 1);   // 0 disables, 2 doubles
function bounce(t, t0, half = false) {   // half: the breakdown punches every other beat only (no kick on the off beats)
  const bp = 60 / BPMv, n = Math.floor((t - B0) / bp + 1e-6), tau = t - (B0 + n * bp);
  if (n < 0 || BOUNCE === 0 || (half && n % 2)) return 0;
  const cutHit = Math.abs(B0 + n * bp - t0) < 0.02;   // this beat is the cut
  const amp = (((n % 4) + 4) % 4 === 0 ? 0.06 : 0.03) * (cutHit ? 1.6 : 1) * BOUNCE;
  const att = cutHit ? 1 : Math.min(1, tau / 0.06), env = tau < 0.06 ? att * att * (3 - 2 * att) : Math.exp(-(tau - 0.06) / (bp * 0.28));
  return amp * env;
}

// ---- hand-placed actors (a shot's `actors`, see actorSpec) with props in their paws ----
// Props are low-poly primitives, one per character and kind, placed in world space from the paw bones every frame
// (so they stay pure in t): drinks stay upright like a real glass, the phone is held screen-in, the pad sits between
// both paws, the foam finger follows the forearm. A jet-ski is fitted under a seated rider from his hips and paws.
const PROPS = {}; if (window.DBG) window.DBG.PROPS = PROPS;
const _pa = new THREE.Vector3(), _pb = new THREE.Vector3(), _pc = new THREE.Vector3(), _pd = new THREE.Vector3(), _up = new THREE.Vector3(0, 1, 0);
function propMesh(kind) {
  const G = new THREE.Group(), M = c => mat({ color: c }), glow = c => mat({ color: c, unlit: 1 }), at3 = (m, x, y, z) => { m.position.set(x, y, z); return m; };
  const cyl = (rt, rb, h, m, seg = 6) => new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), m);
  const add = (m, x = 0, y = 0, z = 0) => { m.position.set(x, y, z); G.add(m); return m; };
  if (kind === 'glass') {          // a tall glass of orange juice, pink straw, a lemon slice on the rim
    add(cyl(0.05, 0.04, 0.15, M(0xff9a2e)), 0, 0.075); add(cyl(0.053, 0.053, 0.02, M(0xf4fbff)), 0, 0.155);
    add(cyl(0.008, 0.008, 0.14, M(0xff5fa2), 4), 0.02, 0.2).rotation.z = -0.3; add(box(0.06, 0.014, 0.03, M(0xffd43b)), -0.045, 0.15).rotation.z = 0.5;
  } else if (kind === 'milk') {    // a glass of milk (Kob stays in)
    add(cyl(0.052, 0.044, 0.16, M(0x6aa8e8)), 0, 0.08); add(cyl(0.046, 0.046, 0.02, M(0xffffff)), 0, 0.15); add(cyl(0.008, 0.008, 0.13, M(0xff5fa2), 4), 0.018, 0.2).rotation.z = -0.3;   // blue glass, white milk: a white glass vanished on her pyjamas
  } else if (kind === 'phone') {   // held up filming: screen towards the holder, flash on the back
    add(box(0.11, 0.2, 0.02, M(0xff4f9a))); add(box(0.094, 0.18, 0.004, glow(0x8fd8ff)), 0, 0, -0.012);   // a pink case: a black phone vanished against the shades
    G.userData.led = add(box(0.03, 0.03, 0.004, glow(0xffffff)), -0.028, 0.07, 0.012);
  } else if (kind === 'pad') {     // game controller
    add(box(0.18, 0.036, 0.085, M(0x2a2d36)));
    for (const s of [-1, 1]) { const h = add(cyl(0.032, 0.032, 0.075, M(0x2a2d36)), s * 0.08, -0.012, 0.03); h.rotation.x = Math.PI / 2; }
    [[0.05, 0xe8173a], [0.07, 0x3fae47], [0.06, 0xffd43b]].forEach(([x, c], k) => add(box(0.016, 0.014, 0.016, glow(c)), x, 0.024, -0.012 + k * 0.012));
    add(box(0.03, 0.014, 0.03, glow(0x8fd8ff)), -0.05, 0.024, 0);
  } else if (kind === 'finger') {  // foam "number one" hand
    add(box(0.17, 0.15, 0.08, M(0xffd43b))); add(box(0.06, 0.22, 0.06, M(0xffd43b)), -0.03, 0.18); add(box(0.18, 0.05, 0.09, M(0xe8173a)), 0, -0.1);
  } else if (kind === 'balloon') { // a red balloon on a 0.6 m string, held by its end (the group sways around the paw)
    const b = new THREE.Mesh(new THREE.IcosahedronGeometry(0.2, 1), mat({ color: 0xe8243a, unlit: 0.35 })); b.scale.set(1, 1.2, 1); add(b, 0, 0.86); add(new THREE.Mesh(new THREE.ConeGeometry(0.035, 0.05, 4), mat({ color: 0xe8243a, unlit: 0.35 })), 0, 0.62);
    add(box(0.008, 0.6, 0.008, M(0xf0f0f0)), 0, 0.3);
  } else if (kind === 'carrot') {  // Compote's carrot: an orange cone, tip down, with a green top
    add(new THREE.Mesh(new THREE.ConeGeometry(0.045, 0.26, 5), M(0xff7a1a)), 0, -0.02).rotation.x = Math.PI; for (let k = 0; k < 3; k++) add(box(0.02, 0.1, 0.02, M(0x3fae47)), (k - 1) * 0.02, 0.15).rotation.z = (k - 1) * 0.4;
  } else if (kind === 'gcarrot') { // the cursed treasure: a golden carrot, self-lit so it glows gold (not orange) in the moonlight, green top
    add(new THREE.Mesh(new THREE.ConeGeometry(0.055, 0.3, 5), mat({ color: 0xffe23a, unlit: 1 })), 0, -0.03).rotation.x = Math.PI;
    add(box(0.012, 0.16, 0.02, mat({ color: 0xfffbe0, unlit: 1 })), 0.03, -0.02, 0.03).rotation.z = 0.12;   // a glint
    for (let k = 0; k < 3; k++) add(box(0.022, 0.11, 0.022, mat({ color: 0x5ad84a, unlit: 0.4 })), (k - 1) * 0.022, 0.16).rotation.z = (k - 1) * 0.45;
  } else if (kind === 'book') {    // Kob's book, open between both paws: two page halves in a V over a red cover (a flat slab read as a board)
    for (const s of [-1, 1]) { const h = new THREE.Group(); h.add(at3(box(0.13, 0.012, 0.19, M(0xc8243a)), s * 0.065, 0, 0)); h.add(at3(box(0.12, 0.02, 0.17, M(0xfaf4e4)), s * 0.062, 0.015, 0));
      for (let k = 0; k < 3; k++) h.add(at3(box(0.08, 0.004, 0.012, M(0x7a7a8a)), s * 0.065, 0.027, -0.05 + k * 0.045)); h.rotation.z = -s * 0.32; G.add(h); }
  } else if (kind === 'plug') {    // the booth's big yellow power plug, pins forward (a little self-lit: it must read in the blackout)
    add(box(0.14, 0.14, 0.2, mat({ color: 0xffd21f, unlit: 0.85 }))); add(box(0.16, 0.05, 0.05, M(0x2a5ad8)), 0, 0, -0.08); for (const x of [-0.035, 0.035]) add(box(0.02, 0.02, 0.07, M(0xd8d8e0)), x, 0, 0.13);
  }
  return G;
}
function jetskiMesh() {
  const G = new THREE.Group(), white = mat({ color: 0xf2f4f8 }), pink = mat({ color: 0xff3d8a }), dark = mat({ color: 0x23263a }), seat = mat({ color: 0x15151b });
  const hull = box(0.66, 0.32, 1.35, white); hull.position.set(0, -0.14, -0.1); G.add(hull);
  const bow = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.33, 0.62, 4, 1), pink); bow.rotation.set(Math.PI / 2, Math.PI / 4, 0); bow.scale.set(1, 1, 0.55); bow.position.set(0, -0.08, 0.86); G.add(bow);
  const stripe = box(0.68, 0.06, 1.2, pink); stripe.position.set(0, -0.05, -0.12); G.add(stripe);
  const saddle = box(0.3, 0.14, 0.62, seat); saddle.position.set(0, 0.05, -0.32); G.add(saddle);
  const well = box(0.6, 0.02, 0.5, dark); well.position.set(0, 0.012, 0.2); G.add(well);
  const cowl = box(0.44, 0.2, 0.3, pink); cowl.position.set(0, 0.06, 0.58); G.add(cowl);
  G.userData.bar = new THREE.Group(); const bar = box(0.5, 0.035, 0.035, dark); G.userData.bar.add(bar); G.add(G.userData.bar);
  G.userData.col = box(0.05, 1, 0.05, dark); G.add(G.userData.col);
  // spray: white chunks thrown back and up from the stern, looping with t
  const spM = mat({ color: 0xf4fbff, unlit: 1 }); G.userData.spray = [];
  for (let k = 0; k < 26; k++) { const s = box(0.09, 0.09, 0.09, spM); G.add(s); G.userData.spray.push(s); }
  const wake = box(0.5, 0.012, 3.2, mat({ color: 0xe8f6ff, unlit: 1 })); wake.position.set(0, -0.095, -2.3); G.add(wake);
  return G;
}
function propFor(D, kind) { const key = D.base + ':' + kind; if (!PROPS[key]) { PROPS[key] = kind === 'jetski' ? jetskiMesh() : kind.endsWith(':flying') ? new THREE.Group() : propMesh(kind); scene.add(PROPS[key]); } return PROPS[key]; }
function palm(D, side) {   // world point in the middle of a paw
  const h = D['hand' + side], m = D['mid' + side], f = D['fore' + side]; if (!h) return null;
  h.getWorldPosition(_pa);
  if (m) m.getWorldPosition(_pb); else if (f) { f.getWorldPosition(_pb); _pb.sub(_pa).multiplyScalar(-0.35).add(_pa); } else _pb.copy(_pa);
  return _pc.copy(_pa).lerp(_pb, 0.85);
}
function holdProp(D, kind, side, bodyYaw, t) {
  const g = propFor(D, kind), s = D.curScale || D.scale || 1; g.visible = true; g.scale.setScalar(s * 1.25 * (D.holdScale || 1));   // a little oversized so it reads at 270x480
  if (kind === 'pad' || kind === 'book') {
    const a = palm(D, 'L')?.clone(), b = palm(D, 'R'); if (!a || !b) return;
    g.position.copy(a).add(b).multiplyScalar(0.5); g.rotation.set(kind === 'book' ? -0.75 : 0.35, bodyYaw, 0, 'YXZ'); return;   // the book tilts its pages up to the reader
  }
  const p = palm(D, side); if (!p) return;
  if (kind === 'finger') {   // along the forearm, pointing where the paw points
    D['fore' + side].getWorldPosition(_pd); const dir = _pa.clone().sub(_pd).normalize();
    g.quaternion.setFromUnitVectors(_up, dir); g.position.copy(p); return;
  }
  if (kind === 'balloon') { g.position.copy(p); g.rotation.set(0.12 * Math.sin(t * 1.3), bodyYaw, 0.1 * Math.sin(t * 1.7 + 1)); return; }
  g.rotation.set(0, bodyYaw, 0);
  g.position.copy(p).addScaledVector(_up, kind === 'phone' ? 0.02 : -0.075 * s);   // drinks are gripped around the middle
  if (g.userData.led) g.userData.led.material.uniforms.uCol.value.setScalar(0.6 + 0.4 * (Math.sin(t * 40) > 0.6));
}
function rideJetski(D, bodyYaw, base, t) {   // base: the rider's footwell height (the harbour water sits 0.16 m lower)
  const g = propFor(D, 'jetski'), s = D.scale || 1, fwd = _pd.set(Math.sin(bodyYaw), 0, Math.cos(bodyYaw));
  g.visible = true; D.hips.getWorldPosition(_pa);
  g.position.set(_pa.x + fwd.x * 0.3 * s, base, _pa.z + fwd.z * 0.3 * s); g.rotation.set(0.04 * Math.sin(t * 2.3), bodyYaw, 0.05 * Math.sin(t * 1.7)); g.scale.setScalar(s);
  g.updateMatrixWorld(true);
  const a = palm(D, 'L')?.clone(), b = palm(D, 'R');   // handlebar in the paws, its column down to the cowl
  if (a && b) {
    const mid = a.clone().add(b).multiplyScalar(0.5), loc = g.worldToLocal(mid.clone()), bar = g.userData.bar, col = g.userData.col;
    bar.position.copy(loc); bar.rotation.set(0, Math.atan2(g.worldToLocal(b.clone()).z - g.worldToLocal(a.clone()).z, g.worldToLocal(b.clone()).x - g.worldToLocal(a.clone()).x) * -1, 0);
    const base = new THREE.Vector3(0, 0.12, 0.55), d = loc.clone().sub(base);
    col.position.copy(base).add(loc).multiplyScalar(0.5); col.scale.set(1, d.length(), 1); col.quaternion.setFromUnitVectors(_up, d.normalize());
  }
  g.userData.spray.forEach((c, k) => {   // pure in t: each chunk loops through its own 0.7 s arc
    const age = ((t * 1.45 + k * 0.618) % 1 + 1) % 1, side = (k % 2 ? 1 : -1) * (0.15 + 0.35 * ((k * 0.37) % 1));
    c.position.set(side * (0.5 + age * 1.6), -0.08 + Math.sin(age * Math.PI) * (0.35 + 0.3 * ((k * 0.53) % 1)), -0.75 - age * 2.2);
    c.scale.setScalar(1.3 * (1 - age) + 0.2); c.visible = age < 0.92;
  });
}
// Procedural arm aims on top of any clip (the song's own moves: "tu lèves un bras, deux bras"): the upper arm and
// forearm are turned in world space so they point along a direction in the body's frame (x = the character's left,
// y up, z forward), blended in over 0.15 s from `upAt` s into the shot. Their chibi arms stop at chin height in the
// clips, so "arm up" is a Y that clears the big head. Pure in t: recomputed from the posed clip every frame.
const AIMS = { up: [0.64, 0.77, 0.05], toast: [0.2, 0.62, 0.76], phone: [0.18, 0.8, 0.57] };
const _aq = new THREE.Quaternion(), _aq2 = new THREE.Quaternion(), _aq3 = new THREE.Quaternion(), _av = new THREE.Vector3(), _aw = new THREE.Vector3();
function aimBone(bone, child, dir, w) {
  if (!bone || !child) return;
  bone.getWorldPosition(_av); child.getWorldPosition(_aw); const cur = _aw.sub(_av).normalize();
  const keep = bone.quaternion.clone();
  _aq.setFromUnitVectors(cur, dir).multiply(bone.getWorldQuaternion(_aq2));          // the bone's new world rotation
  bone.quaternion.copy(bone.parent.getWorldQuaternion(_aq3).invert().multiply(_aq));  // back into its parent's space
  bone.quaternion.copy(keep.slerp(bone.quaternion, w)); bone.updateMatrixWorld(true);
}
function aimArms(D, A, bodyYaw, since) {
  const w = cl((since - (A.upAt || 0)) / 0.15) * (A.upEnd != null ? cl((A.upEnd - since) / 0.15) : 1); if (w <= 0) return;
  let d0 = Array.isArray(A.aim) ? A.aim : AIMS[A.aim] || AIMS.up; const cy = Math.cos(bodyYaw), sy = Math.sin(bodyYaw);
  if (A.aim2 && A.aim2At != null && since > A.aim2At) {   // a second aim from aim2At s, snapped in over 0.08 s (a yank)
    const d2 = Array.isArray(A.aim2) ? A.aim2 : AIMS[A.aim2] || AIMS.up, k2 = sm((since - A.aim2At) / 0.08); d0 = d0.map((v, i) => v + (d2[i] - v) * k2);
  }
  for (const side of A.arm === 'both' ? ['L', 'R'] : [A.arm]) {
    // wave: a slow flap of the aim's height (wings in the wind), the two arms a little out of phase; pure in `since`
    const dy = d0[1] + (A.wave || 0) * Math.sin(since * 2.4 + (side === 'L' ? 0 : 0.7));
    const sx = side === 'L' ? 1 : -1, bx = d0[0] * sx, v = new THREE.Vector3(bx * cy + d0[2] * sy, dy, -bx * sy + d0[2] * cy).normalize();   // body frame → world
    const up = side === 'L' ? D.L : D.R, fore = D['fore' + side], hand = D['hand' + side];
    aimBone(up, fore, v, w); aimBone(fore, hand, v, w);
  }
}
// A thrown prop (an actor's `toss: { at, to: [x, y, z], dur }`): from `at` s into the shot the held prop leaves the paw
// and flies on an arc to `to`, spinning. The release point sits by the throwing shoulder (not the posed paw), so the arc
// is pure in t without posing the clip twice.
function tossProp(D, A, bodyYaw, since) {
  const g = propFor(D, A.hold + ':flying'), s = D.curScale || D.scale || 1, T = A.toss, u = cl((since - T.at) / (T.dur || 0.6));
  if (!g.userData.kind) { const m = propMesh(A.hold); g.add(m); g.userData.kind = A.hold; }
  g.visible = u < 1; if (!g.visible) return; const big = T.scale || 1.6;   // a thrown prop is drawn bigger so its arc reads
  const fx = Math.sin(bodyYaw), fz = Math.cos(bodyYaw), rx = Math.cos(bodyYaw), rz = -Math.sin(bodyYaw);
  const x0 = D.holder.position.x - rx * 0.22 * s + fx * 0.15 * s, y0 = D.holder.position.y + 1.0 * s, z0 = D.holder.position.z - rz * 0.22 * s + fz * 0.15 * s;
  g.position.set(x0 + (T.to[0] - x0) * u, y0 + (T.to[1] - y0) * u + (T.arc ?? 0.9) * 4 * u * (1 - u), z0 + (T.to[2] - z0) * u);
  g.rotation.set(u * 14, bodyYaw, u * 5); g.scale.setScalar(s * 1.25 * big);
}
// The held plug's cable: a thick black run from the paw to where it goes into the booth (`cable: [x, y, z]`)
function plugCable(D, to) {
  const key = D.base + ':cable'; if (!PROPS[key]) { PROPS[key] = new THREE.Mesh(new THREE.BoxGeometry(0.055, 1, 0.055), mat({ color: 0xff7a1a, unlit: 0.25 })); scene.add(PROPS[key]); }   // the orange lead, like the map's
  const c = PROPS[key], p = palm(D, 'R'); if (!p) return;
  const a = p.clone(), b = new THREE.Vector3(...to), d = b.clone().sub(a);
  c.visible = true; c.position.copy(a).add(b).multiplyScalar(0.5); c.scale.set(1, d.length(), 1); c.quaternion.setFromUnitVectors(_up, d.normalize());
}
function placeActors(P, t, t0, t1, camAng, map) {
  for (const D of Object.values(CREW)) { D.holder.visible = false; D.shadow.visible = false; D.air = false; D.deck = 0; D.curScale = D.scale || 1; D.holder.scale.setScalar(D.curScale); }
  const len = t1 - t0, plans = [];
  // pass 1: facing, start offset and ground are measured on Saxo's rig (shared caches) before anyone is posed this frame
  for (const A of P.actors) {
    const D = CREW[A.who]; if (!D) continue;
    const n = A.clip === 'tpose' ? null : tripo.actions[A.clip] ? A.clip : Object.keys(tripo.actions)[0], span = Math.max(0.1, len * A.speed);
    const at = !n ? 0 : A.at === 'auto' ? steadiestOffset(tripo, n, span) : A.at;
    const fyaw = n && A.face === 'camera' ? clipFacing(tripo, n, at, span).yaw : 0;
    plans.push({ A, D, n, at, fyaw, yaw: A.face === 'world' ? A.yaw : -fyaw + camAng + A.yaw, ground: n && A.ground === 'toe' ? clipGround(tripo, n, at, span) : 0 });
  }
  // pass 2: pose, place and ground each one, then its props
  const stars = [];
  for (const { A, D, n, at, fyaw, yaw, ground } of plans) {
    const s = (D.scale || 1) * A.scale, bob = A.ride ? 0.035 * Math.sin(t * 3.1) + 0.02 * Math.sin(t * 5.3 + 1) : 0;
    const um = A.my ? sm((t - t0 - A.myAt) / (A.myDur ?? Math.max(0.01, len - A.myAt))) : 0, lift = A.lift + bob + A.my * um;   // my: a rise or a sink
    D.curScale = s; D.holdScale = A.holdScale; D.holder.scale.setScalar(s); D.air = A.air;
    wearOutfit(D, A.look); D.holder.visible = true; D.shadow.visible = !A.ride && !A.noShadow;
    for (const [k, a] of Object.entries(D.actions)) a.weight = k === n ? 1 : 0;
    if (n) { const d = D.clips[n].duration, tc = at + (t - t0) * A.speed; D.actions[n].time = A.once ? Math.min(Math.max(0, tc), d - 1e-3) : ((tc % d) + d) % d; }
    D.mixer.update(0);
    const u = cl((t - t0) / len);   // mx, mz: a walk-in across the shot (the clips' own root motion is pinned)
    D.holder.rotation.y = yaw; D.holder.position.set(A.x + A.mx * u, ground * s + lift, A.z + A.mz * u); D.holder.updateMatrixWorld(true);
    if (A.arm) aimArms(D, A, yaw + fyaw, t - t0);
    // the toes set the shot's floor, but a hem, a paw or a big head can reach lower: never let the mesh sink;
    // "mesh" grounding keeps the lowest point on the floor every frame (lying down, falling)
    const low = meshLow(D, 3) - lift; if (A.ground === 'mesh' || low < 0) { D.holder.position.y -= low; D.holder.updateMatrixWorld(true); }
    D.deck = lift;
    const up = Math.max(0, footY(D) / s - D.restFoot - lift / s);
    const hp = D.hips ? D.hips.getWorldPosition(_pb) : D.holder.position;
    D.shadow.position.set(hp.x, 0.012 + lift, hp.z); D.shadow.scale.setScalar(s * Math.max(0.5, 1 - up * 0.8) * (A.ground === 'mesh' ? 1.5 : 1));
    D.shadow.material.uniforms.uShadow.value = SHADOW * Math.max(0.35, 1 - up);
    D.shadow.material.uniforms.uShadowCol.value.set(map.shadowCol || 0x333333);
    const bodyYaw = yaw + fyaw;
    const tossed = A.toss && t - t0 >= A.toss.at, holding = (A.holdFrom == null || t - t0 >= A.holdFrom) && (A.holdTo == null || t - t0 < A.holdTo);
    if (A.hold && !tossed && holding) holdProp(D, A.hold, 'R', bodyYaw, t);
    if (A.holdL) holdProp(D, A.holdL, 'L', bodyYaw, t);
    if (tossed) tossProp(D, A, bodyYaw, t - t0);
    if (A.cable && A.hold === 'plug' && holding) plugCable(D, A.cable);
    if (A.ride === 'jetski') rideJetski(D, bodyYaw, lift, t);
    if (A.star && D.head) { D.head.getWorldPosition(_pa).project(camera); if (Math.abs(_pa.x) < 1.1 && _pa.z < 1) stars.push([_pa.x, A.who]); }
  }
  window.STARS = [...new Set(stars.sort((a, b) => a[0] - b[0]).map(s => s[1]))].slice(0, 2);   // more than two faces cover the lyrics
  if (P.stars) window.STARS = P.stars;   // a shot can name the faces itself (Kob's empty sofa shows hers)
  else if (!window.STARS.length) window.STARS = [P.actors[0]?.who || 'saxo'];
}

const _cm = new THREE.Matrix4(), _cm2 = new THREE.Matrix4(), _cmL = new THREE.Matrix4(), _cq = new THREE.Quaternion(), _cp = new THREE.Vector3(), _cs = new THREE.Vector3(), _ch = new THREE.Vector3();
function crowdSpots(c) {   // the grid, front row first, with holes where the real characters stand; pure in the shot's spec
  const n = Math.min(99, c.n || 99), cols = c.cols || 11, out = [];
  for (let r = 0; r < 40 && out.length < n; r++) for (let q = 0; q < cols && out.length < n; q++) {
    const j = c.jitter ?? 0.15, x = (c.x0 || 0) + (q - (cols - 1) / 2) * (c.dx || 0.9) + (hash2(r, q, 1) - 0.5) * 2 * j, z = (c.z0 || 0) - r * (c.dz || 0.85) + (hash2(r, q, 2) - 0.5) * 2 * j;
    if ((c.skip || []).some(([sx, sz, sr]) => (x - sx) ** 2 + (z - sz) ** 2 < sr * sr)) continue;
    out.push([x, z, (hash2(r, q, 3) - 0.5) * 0.18]);
  }
  return out;
}
function hash2(a, b, c) { const x = Math.sin(a * 127.1 + b * 311.7 + c * 74.7) * 43758.5453; return x - Math.floor(x); }
function placeCrowd(P, t, t0, t1, camAng) {
  for (const C of Object.values(CROWDS)) { C.copies.forEach(ps => ps.forEach(k => { k.visible = false; })); C.shadows.forEach(sh => { sh.visible = false; }); }
  const c = P && P.crowd; if (!c) return;
  const C = CROWDS[c.who + ':' + (c.look || c.who)]; if (!C) return;
  const R = C.R, s = C.D.scale || 1, len = t1 - t0, speed = c.speed ?? 1, span = Math.max(0.1, len * speed);
  const n = R.actions[c.clip] ? c.clip : Object.keys(R.actions)[0];
  const at = c.at == null || c.at === 'auto' ? steadiestOffset(tripo, n, span) : c.at;
  const fyaw = c.face === 'world' ? 0 : clipFacing(tripo, n, at, span).yaw, yaw = (c.face === 'world' ? 0 : -fyaw + camAng) + (c.yaw || 0) * Math.PI / 180;
  const ground = clipGround(tripo, n, at, span);
  for (const [k, a] of Object.entries(R.actions)) a.weight = k === n ? 1 : 0;
  const d = R.clips[n].duration, tc = at + (t - t0) * speed; R.actions[n].time = c.once ? Math.min(Math.max(0, tc), d - 1e-3) : ((tc % d) + d) % d;
  R.mixer.update(0); R.holder.rotation.y = 0; R.holder.position.set(0, ground * s, 0); R.holder.updateMatrixWorld(true);
  const inv = _cm2.copy(R.holder.matrixWorld).invert(), u = cl((t - t0) / len), mx = (c.mx || 0) * u, mz = (c.mz || 0) * u;
  const spots = crowdSpots(c);
  const place = (i, lift) => {
    const [x, z, jy] = spots[i], parts = C.copies[i]; if (!parts) return null;
    _cq.setFromAxisAngle(_up, yaw + jy); _cm.compose(_cp.set(x + mx, ground * s + lift, z + mz), _cq, _cs.setScalar(s)).multiply(inv);
    for (const k of parts) { k.matrix.multiplyMatrices(_cm, k.bindMatrix); k.matrixWorldNeedsUpdate = true; k.updateMatrixWorld(true); k.visible = true; }
    return _cm;
  };
  // never sink: the lowest point of the first copy (they share the pose) sets a lift for all of them
  let low = Infinity; if (spots.length && place(0, 0)) for (const k of C.copies[0]) { const nv = k.geometry.attributes.position.count; for (let v = 0; v < nv; v += 4) { k.getVertexPosition(v, _qv); _qv.applyMatrix4(k.matrixWorld); if (_qv.y < low) low = _qv.y; } }
  const lift = low < 0 ? -low : 0;
  R.hips.getWorldPosition(_ch);
  spots.forEach((_, i) => {
    const M = place(i, lift); if (!M) return;
    const sh = C.shadows[i], hp = _qv.copy(_ch).applyMatrix4(M); sh.visible = true; sh.position.set(hp.x, 0.012, hp.z); sh.scale.setScalar(s);
    sh.material.uniforms.uShadow.value = SHADOW * 0.9; sh.material.uniforms.uShadowCol.value.set(curMap?.shadowCol || 0x333333);
  });
}
// a duo seen from the side lines up and one hides the other, so its camera swings less (orbits span ±54°, not ±120°)
let curMap = null;
function danceFrame(t) {
  const i = shotIndex(t), [t0, mapName, cam, outfit, sadiOutfit, CAST] = SHOTS[i], t1 = i + 1 < SHOTS.length ? SHOTS[i + 1][0] : CONFIG.duration, P = PLAN[i];
  const ACT = CAST === 'actors';   // a shot that places its characters by hand (`actors`) sets its own framing
  const ANG_K = ACT ? P.angK ?? 1 : CAST === 'duo' ? 0.45 : 1, WIDE = ACT ? P.wide ?? 1 : CAST === 'duo' ? 1.2 : 1, [FX, FZ, FY = 0] = P.focus || [0, 0];   // focus: [x, z, floor y] the camera orbits
  window.STARS = CAST === 'sadi' ? [WITH] : CAST === 'duo' && sadi ? ['saxo', WITH] : ['saxo'];   // whose emoji face rides the karaoke (dance.js)
  const map = MAPS[mapName];
  for (const m of Object.values(MAPS)) m.group.visible = m === map;   // set every frame: episode scenes switch maps too
  scene.background = map.sky; curMap = map;
  map.light(); map.anim(t, P);   // anim runs after light, so a map can also relight per shot from P
  const u = cl((t - t0) / (t1 - t0)), sh = shake(t, i * 10), bo = bounce(t, t0, !!P.half) * (P.still ? 0 : 1);
  const k = cam.ease === 'lin' ? u : cam.ease === 'out' ? 1 - (1 - u) ** 3 : u * (0.35 + 0.65 * u);   // default: ease in, no ease out
  const lerp = x => Array.isArray(x) ? x[0] + (x[1] - x[0]) * k : x, ang = lerp(cam.ang) * ANG_K * Math.PI / 180, r = lerp(cam.r) * WIDE;   // a duo needs a wider frame
  camera.position.set(FX + Math.sin(ang) * r + sh[0] * 0.05, FY + lerp(cam.h) + sh[1] * 0.04 - bo * 0.6, FZ + Math.cos(ang) * r + sh[2] * 0.04);
  const fov = cam.frame ? 2 * Math.atan(cam.frame * WIDE / 2 / r) * 180 / Math.PI : lerp(cam.fov);
  camera.fov = fov * (1 - bo); camera.updateProjectionMatrix();
  camera.lookAt(FX + saxo.root.position.x * 0.6 + sh[1] * 0.03 + (cam.lookX || 0), FY + lerp(cam.look), FZ);
  // whip-in: the first ~0.25 s pans fast into place; the 2D layer smears the frame by window.WHIP
  const whip = cam.whip ? Math.exp(-(t - t0) * 16) : 0; camera.rotateY(whip * 0.9); window.WHIP = whip;
  // jolt: the bass through the walls kicks the whole frame on every beat (a drop and a small roll, decaying through the beat)
  if (P.jolt) { const bpS = 60 / BPMv, nb = Math.floor((t - B0) / bpS + 1e-6), f = (t - B0) / bpS - nb, j = nb >= 0 ? Math.exp(-f * 7) : 0; camera.position.y -= 0.045 * j; camera.rotateZ(0.022 * j * (nb % 2 ? 1 : -1)); }
  applyPose(saxo, poseAt(t));
  for (const g of Object.values(PROPS)) g.visible = false;
  if (tripo && ACT) placeActors(P, t, t0, t1, (cam.ang[0] + cam.ang[1]) / 2 * ANG_K * Math.PI / 180, map);
  if (tripo) placeCrowd(ACT ? P : null, t, t0, t1, (cam.ang[0] + cam.ang[1]) / 2 * ANG_K * Math.PI / 180);
  else if (tripo) {
    // each shot names a clip and a start offset into it; unknown names fall back to the first clip
    const [clipName, clipAt] = SHOT_CLIPS[i] || ['dance_01', 0], n = tripo.actions[clipName] ? clipName : Object.keys(tripo.actions)[0];
    if (!n) { tripo.holder.rotation.y = 0.35 * Math.sin(t * 0.8); } else {
      const at = clipAt === 'auto' ? steadiestOffset(tripo, n, t1 - t0) : clipAt;
      // bind pose faces +z at 0; turn towards the shot's average camera angle so side cameras still see the face
      const camAng = (cam.ang[0] + cam.ang[1]) / 2 * ANG_K * Math.PI / 180, yaw = -clipFacing(tripo, n, at, t1 - t0).yaw + camAng;   // orbits average out to the front
      const ground = clipGround(tripo, n, at, t1 - t0);
      const cast = CAST === 'sadi' ? [[sadi, 0, sadiOutfit]] : CAST === 'duo' && sadi ? [[tripo, -DUO_X, outfit], [sadi, DUO_X, sadiOutfit]] : [[tripo, 0, outfit]];
      for (const D of Object.values(CREW)) { const on = cast.some(c => c[0] === D); D.holder.visible = on; D.shadow.visible = on; D.air = false; D.deck = 0; D.curScale = D.scale || 1; D.holder.scale.setScalar(D.curScale); }
      for (const [D, x, look] of cast) {
        const s = D === sadi ? SADI_SCALE : 1;
        wearOutfit(D, look);
        D.holder.rotation.y = yaw; D.holder.position.set(Math.cos(camAng) * x, ground * s, -Math.sin(camAng) * x);   // side by side as the camera sees them
        for (const [k, a] of Object.entries(D.actions)) a.weight = k === n ? 1 : 0;
        D.actions[n].time = (at + t - t0) % D.clips[n].duration; D.mixer.update(0);
        D.holder.updateMatrixWorld(true);
        // the toes set the shot's floor, but a hem, a hand or a big head can reach lower: never let the mesh sink
        const sink = meshLow(D, 3); if (sink < 0) { D.holder.position.y -= sink; D.holder.updateMatrixWorld(true); }
        const lift = Math.max(0, footY(D) / s - D.restFoot);
        D.shadow.position.set(D.holder.position.x, 0.012, D.holder.position.z); D.shadow.scale.setScalar(s * Math.max(0.5, 1 - lift * 0.8));
        D.shadow.material.uniforms.uShadow.value = SHADOW * Math.max(0.35, 1 - lift);
        D.shadow.material.uniforms.uShadowCol.value.set(map.shadowCol || 0x333333);
      }
    }
  }
  renderer.render(scene, camera);
  return renderer.domElement;
}
window.render3d = danceFrame;
// ---- QA probe (read by `node render.mjs --qa`, which gates every render): for each visible dog at time t, the lowest
// point of its skinned mesh relative to the floor (0 = touching; `deck` is subtracted, e.g. a skateboard), whether the
// shot means it to be airborne, and its screen box (0..1). Measured on the mesh, not bones: the dogs' heads and bodies
// reach far below their bones, so bone heights say nothing about floor contact.
const _qv = new THREE.Vector3();
function meshLow(D, stride = 2) {   // lowest point of the visible skinned meshes, world y
  let low = Infinity;
  D.root.traverse(o => { if (!o.isSkinnedMesh || !o.visible) return; const n = o.geometry.attributes.position.count;
    for (let i = 0; i < n; i += stride) { o.getVertexPosition(i, _qv); _qv.applyMatrix4(o.matrixWorld); if (_qv.y < low) low = _qv.y; } });
  return low;
}
function qaDog(D, who) {
  let low = Infinity; const B = [Infinity, Infinity, -Infinity, -Infinity];
  D.root.traverse(o => {
    if (!o.isSkinnedMesh || !o.visible) return;
    const n = o.geometry.attributes.position.count;
    for (let i = 0; i < n; i += 2) {
      o.getVertexPosition(i, _qv); _qv.applyMatrix4(o.matrixWorld); if (_qv.y < low) low = _qv.y;
      if (i % 8) continue; _qv.project(camera); const x = (_qv.x + 1) / 2, y = (1 - _qv.y) / 2;
      B[0] = Math.min(B[0], x); B[1] = Math.min(B[1], y); B[2] = Math.max(B[2], x); B[3] = Math.max(B[3], y);
    }
  });
  // the head bone on screen (0..1): where the face is, for the framing rules (an arm past the edge reads fine, a face doesn't)
  const h = D.head ? D.head.getWorldPosition(_qv).project(camera) : null;
  return { who, low: +(low - (D.deck || 0)).toFixed(3), air: !!D.air, box: B.map(v => +v.toFixed(3)), head: h && h.z < 1 ? [+((h.x + 1) / 2).toFixed(3), +((1 - h.y) / 2).toFixed(3)] : null, giant: (D.curScale || 1) > 2 };
}
window.QA_PROBE = t => {
  window.render3d(t);
  return Object.entries(CREW).filter(([, D]) => D && D.holder.visible && D.holder.parent).map(([w, D]) => qaDog(D, w)).filter(d => isFinite(d.low));
};
// Debug probe for staging props around a clip (node render.mjs --eval="CLIP_PROBE('gaming', [0, 1], 'kob')"): the
// character posed in the clip on the origin at yaw 0, lowest vertex on the floor; key points in metres, rounded to cm.
window.CLIP_PROBE = (name, ts = [0], who = 'saxo', look) => {
  const D = CREW[who]; if (!D) return 'no ' + who;
  wearOutfit(D, look || D.base); D.holder.visible = true;
  const r = v => v.toArray().map(x => Math.round(x * 100) / 100), w = b => b ? r(b.getWorldPosition(new THREE.Vector3())) : null;
  return ts.map(t => {
    for (const [k, a] of Object.entries(D.actions)) a.weight = k === name ? 1 : 0;
    if (D.actions[name]) D.actions[name].time = t % D.clips[name].duration;
    D.mixer.update(0); D.holder.rotation.y = 0; D.holder.position.set(0, 0, 0); D.holder.updateMatrixWorld(true);
    D.holder.position.y = -meshLow(D, 1); D.holder.updateMatrixWorld(true);
    const bb = new THREE.Box3(); D.root.traverse(o => { if (o.isSkinnedMesh && o.visible) { const n = o.geometry.attributes.position.count, v = new THREE.Vector3(); for (let i = 0; i < n; i += 3) { o.getVertexPosition(i, v); bb.expandByPoint(v.applyMatrix4(o.matrixWorld)); } } });
    return { t, dur: D.clips[name]?.duration, lift: Math.round(D.holder.position.y * 100) / 100, hips: w(D.hips), head: w(D.head), toeL: w(D.feet[0]), toeR: w(D.feet[1]), handL: w(D.handL), handR: w(D.handR), box: [r(bb.min), r(bb.max)] };
  });
};
const sceneKit = () => ({ THREE, scene, camera, renderer, MAPS, tripo, sadi, mat, box, U, SADI_SCALE, SHADOW, footY, clipGround, shake, wearOutfit, bounce: t => bounce(t, -1) });
if (SCENE) {
  const { sceneRenderer } = await import('./scenes.js');
  window.render3d = sceneRenderer(SCENE, sceneKit());
}
if (EP) {
  // one renderer per action shot setup (scene + who); action shots play the scene's time `from + (t - t0)` through the
  // scene's camera `cam`; dance shots hide every scene prop. Karaoke keeps running over the action (dance.js).
  const { sceneRenderer } = await import('./scenes.js'), R = {};
  for (const p of PLAN) if (p.kind === 'action') { const k = p.scene + ':' + (p.who || '') + ':' + (p.word || '') + ':' + (p.wide || ''); p.key = k; R[k] ||= sceneRenderer(p.scene, sceneKit(), { who: p.who, look: p.look, word: p.word, wide: p.wide }); }
  window.EPISODE = EP; window.SCENE_END = undefined;
  window.render3d = t => {
    const p = PLAN[shotIndex(t)];
    for (const [k, r] of Object.entries(R)) if (k !== p.key) r.hide();
    if (p.kind === 'action') {
      for (const [n, D] of Object.entries(CREW)) if (D !== tripo && D !== sadi) { D.holder.visible = false; D.shadow.visible = false; }   // the scenes only know Saxo and the partner
      for (const g of Object.values(PROPS)) g.visible = false; placeCrowd(null, t, 0, 1, 0);
      window.STARS = p.scene === 'fight' ? ['saxo', WITH] : [p.who === 'saxo' ? 'saxo' : WITH]; return R[p.key]((p.from || 0) + t - p.t0, p.sceneCam ?? null);
    }
    window.SCENE_FX = null; const frame = danceFrame(t); window.SCENE_FX = danceFx(p, t); return frame;
  };
  // dance shots can carry FX too: `word` (a comic burst beside the dancer's head, popping `wordAt` beats into the shot, default 1)
  // and `flash` (paparazzi camera flashes on every beat of the shot). Pure in t, like everything else.
  const _fv = new THREE.Vector3();
  function danceFx(p, t) {
    if (!p.word && !p.flash) return null;
    const bp = 60 / BPMv, fx = { flash: 0, pow: 0 };
    if (p.flash) { const n = Math.floor((t - B0) / bp + 1e-6), since = t - (B0 + n * bp); if (B0 + n * bp >= p.t0 - 0.02) fx.flash = (n % 2 ? 0.22 : 0.42) * Math.exp(-since * 16); }
    if (p.word) {
      const since = t - (p.t0 + (p.wordAt ?? 1) * bp);
      if (since > 0) {
        fx.pow = Math.min(1, since / 0.12) * Math.exp(-since * 0.9); fx.word = p.word;
        const who = p.actors ? CREW[p.wordWho || p.actors[0]?.who] : null;
        if (p.actors && !who) { fx.x = p.wordX ?? 0.5; fx.y = p.wordY ?? 0.5; return fx.flash > 0.01 || fx.pow > 0.01 ? fx : null; }   // nobody to point at: the shot places it
        const D = who || (p.cast === 'sadi' ? sadi : tripo), s = D.scale || (D === sadi ? SADI_SCALE : 1);
        if (who && D.head) { D.head.getWorldPosition(_fv); _fv.y += 0.35 * s; } else { D.holder.getWorldPosition(_fv); _fv.y += 1.7 * s; }
        _fv.project(camera);
        // beside the head, never on the face: the burst is ~a quarter of the frame wide
        const hx = (_fv.x + 1) / 2; fx.x = p.wordX ?? (p.cast === 'duo' ? 0.5 : hx + (hx <= 0.5 ? 0.26 : -0.26)); fx.y = p.wordY ?? (1 - _fv.y) / 2 - 0.1;
      }
    }
    return fx.flash > 0.01 || fx.pow > 0.01 ? fx : null;
  }
}
window._threeReady();
