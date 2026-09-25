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
uniform sampler2D map; uniform float uUseMap; uniform vec3 uCol; uniform vec3 uFogCol; uniform vec2 uFog; uniform float uUnlit; uniform float uLift; uniform float uShadow; uniform vec3 uShadowCol;
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
  c = mix(c, uFogCol, smoothstep(uFog.x, uFog.y, vFogD));
  c = floor(clamp(c, 0.0, 1.0) * 31.0 + bayer(gl_FragCoord.xy)) / 31.0;   // 15-bit colour, ordered dither
  gl_FragColor = vec4(c, 1.0);
}`;

function mat({ map = null, color = 0xffffff, rep = [1, 1], unlit = 0, lift = 0, shadow = 0, side = THREE.FrontSide } = {}) {
  return new THREE.ShaderMaterial({
    vertexShader: VS, fragmentShader: FS, side,
    uniforms: { ...U, map: { value: map }, uUseMap: { value: map ? 1 : 0 }, uCol: { value: new THREE.Color(color) },
      uRep: { value: new THREE.Vector2(...rep) }, uOff: { value: new THREE.Vector2() }, uUnlit: { value: unlit }, uLift: { value: lift }, uShadow: { value: shadow }, uShadowCol: { value: new THREE.Color(0.22, 0.2, 0.24) } },
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
  const T = { holder, root, mixer, actions, clips, L, R, head, feet, faceCache, base: 'saxo' };
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
function wearOutfit(T, name) { for (const [k, ms] of Object.entries(T.outfits || {})) ms.forEach(m => { m.visible = k === (T.outfits[name] ? name : T.base); }); }
const OUTFITS = { cowboy: 'assets/models/saxo_cowboy.glb', astronaut: 'assets/models/saxo_astronaut.glb', dj: 'assets/models/saxo_dj.glb', beach: 'assets/models/saxo_beach.glb', poop: 'assets/models/saxo_poop.glb', moto: 'assets/models/saxo_moto.glb', sponge: 'assets/models/saxo_sponge.glb' };
// Sadi (a black-and-tan terrier girl, sheets in assets/ref/sadi/) is modelled on Saxo's T-pose and proportions, so she
// rides a clone of his skeleton: her base look and every costume are fitted like outfits, and all his clips play on her.
// Kob (a grumpy grey tabby cat girl, sheets in assets/ref/kob/) is built the same way and takes the same slot: the
// partner slot holds one of them per render, picked by ?with=sadi (default) | kob | compote, or by ?cast=<name>.
// Compote (an always-angry grey dwarf bunny girl in a plum hoodie, sheets in assets/ref/compote/) is the fourth.
const PARTNERS = {
  sadi: { scale: 0.92, models: { sadi: 'assets/models/sadi_base.glb', cowgirl: 'assets/models/sadi_cowgirl.glb', astronaut: 'assets/models/sadi_astronaut.glb',
    disco: 'assets/models/sadi_disco.glb', beach: 'assets/models/sadi_beach.glb', cheer: 'assets/models/sadi_cheer.glb', poop: 'assets/models/sadi_poop.glb', patrick: 'assets/models/sadi_patrick.glb', hotdog: 'assets/models/sadi_hotdog.glb' },
    byMap: { moon: 'astronaut', club: 'disco', beach: 'beach', western: 'cowgirl', stadium: 'cheer', mars: 'astronaut', spaceship: 'astronaut', underwater: 'astronaut', bikini: 'patrick', stage: 'disco', arcade: 'disco', farm: 'cowgirl', jungle: 'cowgirl', pyramids: 'cowgirl', school: 'cheer', pirate: 'beach', candy: 'beach', volcano: 'beach', supermarket: 'hotdog' } },
  kob: { scale: 0.92, models: { kob: 'assets/models/kob_base.glb', astronaut: 'assets/models/kob_astronaut.glb', cowgirl: 'assets/models/kob_cowgirl.glb',
    popstar: 'assets/models/kob_popstar.glb', beach: 'assets/models/kob_beach.glb', ninja: 'assets/models/kob_ninja.glb', witch: 'assets/models/kob_witch.glb', chef: 'assets/models/kob_chef.glb', poop: 'assets/models/kob_poop.glb', moto: 'assets/models/kob_moto.glb' },
    byMap: { moon: 'astronaut', mars: 'astronaut', spaceship: 'astronaut', underwater: 'astronaut', bikini: 'astronaut', western: 'cowgirl', farm: 'cowgirl', jungle: 'cowgirl', pyramids: 'cowgirl',
      club: 'popstar', stage: 'popstar', arcade: 'popstar', beach: 'beach', pirate: 'beach', candy: 'beach', volcano: 'beach', tokyo: 'ninja', snow: 'ninja', subway: 'ninja', graveyard: 'witch', supermarket: 'chef', highway: 'moto' } },
  compote: { scale: 0.92, models: { compote: 'assets/models/compote_base.glb', astronaut: 'assets/models/compote_astronaut.glb', cowgirl: 'assets/models/compote_cowgirl.glb',
    punk: 'assets/models/compote_punk.glb', beach: 'assets/models/compote_beach.glb', boxer: 'assets/models/compote_boxer.glb', poop: 'assets/models/compote_poop.glb' },
    byMap: { moon: 'astronaut', mars: 'astronaut', spaceship: 'astronaut', underwater: 'astronaut', bikini: 'astronaut', western: 'cowgirl', farm: 'cowgirl', jungle: 'cowgirl', pyramids: 'cowgirl',
      club: 'punk', stage: 'punk', arcade: 'punk', subway: 'punk', tokyo: 'punk', graveyard: 'punk', beach: 'beach', pirate: 'beach', candy: 'beach', volcano: 'beach', stadium: 'boxer', school: 'boxer' } },
};
const PARTNER = Q.get('with') || (Q.get('cast') !== 'sadi' && PARTNERS[Q.get('cast')] ? Q.get('cast') : null);   // resolved against the episode below
// ?cast=saxo (default) | sadi | duo. A duo stands side by side, a little apart, dancing the same clip in sync.
// ?scene=skate | fight renders a short action scene instead of the dance video (src/scenes.js)
const SCENE = Q.get('scene');
// ?episode=<name> renders episodes/<name>.json: a shot list on the beat grid mixing dance shots and action scenes
const EP = Q.get('episode') ? await (await fetch(`episodes/${Q.get('episode')}.json`)).json() : null;
const WITH = PARTNERS[PARTNER || EP?.with] ? PARTNER || EP.with : 'sadi', { models: SADI, byMap: SADI_OUTFIT, scale: SADI_SCALE } = PARTNERS[WITH];
const slot = c => PARTNERS[c] ? 'sadi' : c;   // 'sadi' in cast logic means "the partner", whoever it is
const CAST = slot(Q.get('cast')) || (EP ? 'duo' : SCENE === 'skate' ? 'sadi' : SCENE === 'fight' ? 'duo' : 'saxo'), DUO_X = 0.42;   // an episode loads both dogs; each shot says who's in it
let sadi = null;
function makeShadow() { const s = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 0.9), mat({ shadow: 0.7 })); s.rotation.x = -Math.PI / 2; s.position.y = 0.012; scene.add(s); return s; }
if (CHAR === 'tripo') {
  const MIXAMO = ['twist', 'macarena', 'silly_twist', 'chicken', 'twerk', 'ymca', 'robot', 'shopping_cart', 'running_man', 'moonwalk', 'shuffle', 'tut', 'booty_step', 'arm_wave', 'snake', 'shimmy', 'thriller_1', 'thriller_2', 'thriller_3', 'thriller_4', 'charleston', 'samba', 'belly', 'northern_soul_spin',
    'skate_push', 'skate_idle', 'uppercut_atk', 'uppercut_vic', 'slam_atk', 'slam_vic',
    ...(EP?.clips || [])];   // an episode can list extra clips from the local library (assets/mixamo/anims/<slug>.fbx)
  tripo = Q.get('model') ? await loadTripo(Q.get('model'))
    : await loadTripo('assets/mixamo/saxo_skin_gangnam.fbx', MIXAMO.map(n => [n, `assets/mixamo/anims/${n}.fbx`]), 'gangnam', 'assets/mixamo/saxo_mixamo/saxo_mixamo.jpg');
  if (!Q.get('model') && CAST !== 'sadi') for (const [n, u] of Object.entries(OUTFITS)) await addOutfit(tripo, n, u).catch(e => console.error('outfit failed', n, e));
  if (!Q.get('model') && CAST !== 'saxo') {
    // clone before any outfit is worn on it; the clone's own skeleton, sharing Saxo's clips and facing cache
    const root = SkeletonUtils.clone(tripo.root), holder = new THREE.Group(); holder.add(root);
    root.traverse(o => { if (o.isSkinnedMesh) o.visible = false; });
    sadi = rig(holder, root, tripo.clips, tripo.faceCache); sadi.base = WITH; sadi.outfits = { [WITH]: [] };
    root.traverse(o => { if (o.isSkinnedMesh && !sadi.body) sadi.body = o; });
    for (const [n, u] of Object.entries(SADI)) await addOutfit(sadi, n, u).catch(e => console.error('sadi outfit failed', n, e));
    holder.scale.setScalar(SADI_SCALE); scene.add(holder); sadi.shadow = makeShadow();
    if (CAST === 'sadi') tripo.holder.visible = false;
  }
  window.DBG = { tripo, clipFacing, shoulderYaw, steadiestOffset, camera, get sadi() { return sadi; } };
  window.SAXO_CLIPS = Object.fromEntries(Object.entries(tripo.clips).map(([n, c]) => [n, c.duration]));
  scene.add(tripo.holder); saxo.root.visible = false;
  tripo.shadow = makeShadow(); if (CAST === 'sadi') tripo.shadow.visible = false;
}
const MAP_KIT = { THREE, mat, tex, px, noise, box, selfLit, U, TAU, beat: bp };
const MAPS = { street: buildStreet(), beach: buildBeach(), ...buildMoreMaps(MAP_KIT), ...buildIndoorMaps(MAP_KIT), ...buildOutdoorMaps(MAP_KIT), ...buildSeaMaps(MAP_KIT) };
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
    return { ...e, t0, map, kind: 'dance', cam: { ...CAM_MOVES[move], whip: !!e.whip }, move, clip: e.clip || DANCES[i % DANCES.length],
      cast: slot(e.cast) || 'saxo', outfit: e.outfit || MAP_OUTFIT[map] || 'saxo', sadiOutfit: e.sadiOutfit || SADI_OUTFIT[map] || WITH };
  });
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
function bounce(t, t0) {
  const bp = 60 / BPMv, n = Math.floor((t - B0) / bp + 1e-6), tau = t - (B0 + n * bp);
  if (n < 0 || BOUNCE === 0) return 0;
  const cutHit = Math.abs(B0 + n * bp - t0) < 0.02;   // this beat is the cut
  const amp = (((n % 4) + 4) % 4 === 0 ? 0.06 : 0.03) * (cutHit ? 1.6 : 1) * BOUNCE;
  const att = cutHit ? 1 : Math.min(1, tau / 0.06), env = tau < 0.06 ? att * att * (3 - 2 * att) : Math.exp(-(tau - 0.06) / (bp * 0.28));
  return amp * env;
}

// a duo seen from the side lines up and one hides the other, so its camera swings less (orbits span ±54°, not ±120°)
let curMap = null;
function danceFrame(t) {
  const i = shotIndex(t), [t0, mapName, cam, outfit, sadiOutfit, CAST] = SHOTS[i], t1 = i + 1 < SHOTS.length ? SHOTS[i + 1][0] : CONFIG.duration;
  const ANG_K = CAST === 'duo' ? 0.45 : 1;
  window.STARS = CAST === 'sadi' ? [WITH] : CAST === 'duo' && sadi ? ['saxo', WITH] : ['saxo'];   // whose emoji face rides the karaoke (dance.js)
  const map = MAPS[mapName];
  for (const m of Object.values(MAPS)) m.group.visible = m === map;   // set every frame: episode scenes switch maps too
  scene.background = map.sky; curMap = map;
  map.light(); map.anim(t);
  const u = cl((t - t0) / (t1 - t0)), sh = shake(t, i * 10), bo = bounce(t, t0);
  const k = cam.ease === 'lin' ? u : cam.ease === 'out' ? 1 - (1 - u) ** 3 : u * (0.35 + 0.65 * u);   // default: ease in, no ease out
  const lerp = x => Array.isArray(x) ? x[0] + (x[1] - x[0]) * k : x, ang = lerp(cam.ang) * ANG_K * Math.PI / 180, r = lerp(cam.r) * (CAST === 'duo' ? 1.2 : 1);   // a duo needs a wider frame
  camera.position.set(Math.sin(ang) * r + sh[0] * 0.05, lerp(cam.h) + sh[1] * 0.04 - bo * 0.6, Math.cos(ang) * r + sh[2] * 0.04);
  const fov = cam.frame ? 2 * Math.atan(cam.frame * (CAST === 'duo' ? 1.2 : 1) / 2 / r) * 180 / Math.PI : lerp(cam.fov);
  camera.fov = fov * (1 - bo); camera.updateProjectionMatrix();
  camera.lookAt(saxo.root.position.x * 0.6 + sh[1] * 0.03, lerp(cam.look), 0);
  // whip-in: the first ~0.25 s pans fast into place; the 2D layer smears the frame by window.WHIP
  const whip = cam.whip ? Math.exp(-(t - t0) * 16) : 0; camera.rotateY(whip * 0.9); window.WHIP = whip;
  applyPose(saxo, poseAt(t));
  if (tripo) {
    // each shot names a clip and a start offset into it; unknown names fall back to the first clip
    const [clipName, clipAt] = SHOT_CLIPS[i] || ['dance_01', 0], n = tripo.actions[clipName] ? clipName : Object.keys(tripo.actions)[0];
    if (!n) { tripo.holder.rotation.y = 0.35 * Math.sin(t * 0.8); } else {
      const at = clipAt === 'auto' ? steadiestOffset(tripo, n, t1 - t0) : clipAt;
      // bind pose faces +z at 0; turn towards the shot's average camera angle so side cameras still see the face
      const camAng = (cam.ang[0] + cam.ang[1]) / 2 * ANG_K * Math.PI / 180, yaw = -clipFacing(tripo, n, at, t1 - t0).yaw + camAng;   // orbits average out to the front
      const ground = clipGround(tripo, n, at, t1 - t0);
      const cast = CAST === 'sadi' ? [[sadi, 0, sadiOutfit]] : CAST === 'duo' && sadi ? [[tripo, -DUO_X, outfit], [sadi, DUO_X, sadiOutfit]] : [[tripo, 0, outfit]];
      for (const D of [tripo, sadi]) if (D) { const on = cast.some(c => c[0] === D); D.holder.visible = on; D.shadow.visible = on; D.air = false; D.deck = 0; }
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
  return { who, low: +(low - (D.deck || 0)).toFixed(3), air: !!D.air, box: B.map(v => +v.toFixed(3)) };
}
window.QA_PROBE = t => {
  window.render3d(t);
  return [[tripo, 'saxo'], [sadi, WITH]].filter(([D]) => D && D.holder.visible && D.holder.parent).map(([D, w]) => qaDog(D, w)).filter(d => isFinite(d.low));
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
    if (p.kind === 'action') { window.STARS = p.scene === 'fight' ? ['saxo', WITH] : [p.who === 'saxo' ? 'saxo' : WITH]; return R[p.key]((p.from || 0) + t - p.t0, p.sceneCam ?? null); }
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
        const D = p.cast === 'sadi' ? sadi : tripo; D.holder.getWorldPosition(_fv); _fv.y += 1.7 * (D === sadi ? SADI_SCALE : 1); _fv.project(camera);
        // beside the head, never on the face: the burst is ~a quarter of the frame wide
        const hx = (_fv.x + 1) / 2; fx.x = p.cast === 'duo' ? 0.5 : hx + (hx <= 0.5 ? 0.26 : -0.26); fx.y = (1 - _fv.y) / 2 - 0.1;
      }
    }
    return fx.flash > 0.01 || fx.pow > 0.01 ? fx : null;
  }
}
window._threeReady();
