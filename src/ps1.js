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
import { buildMatsuriMaps } from './maps10.js';
import { buildBubbleMaps } from './maps11.js';
import { buildPatientMaps } from './maps12.js';
import { buildPoolMaps } from './maps13.js';
import { buildStudioMaps } from './maps14.js';
import { buildWarehouseMaps } from './maps15.js';
import { buildNoirMaps } from './maps16.js';
import { buildWorldCupMaps } from './maps17.js';
import { buildPlayaMaps } from './maps18.js';
import { buildEstateMaps, trolleyModel, TROLLEY } from './maps19.js';
import { buildSelfAwareMaps } from './maps20.js';
import { buildShipMaps } from './maps21.js';
import { buildWeddingMaps, drawStop } from './maps22.js';
import { buildBobsledMaps } from './maps23.js';
import { buildTowerMaps } from './maps24.js';
import { buildAgencyMaps } from './maps25.js';
import { buildParkMaps } from './maps26.js';
import { boneLook } from './bones.js';
import { buildCemeteryMaps } from './maps27.js';
import { buildCanyonMaps } from './maps28.js';
import { buildScrubMaps } from './maps29.js';
import { buildFotoMaps } from './maps30.js';
import { buildGoldenMaps } from './maps31.js';
import { buildTonkMaps, texasSteak } from './maps32.js';
import { buildAptMaps } from './maps33.js';
import { buildComicMaps } from './maps34.js';
import { buildLondonMaps } from './maps35.js';
import { buildMansionMaps } from './maps36.js';
import { buildResortMaps } from './maps37.js';
import { buildPiazzaMaps } from './maps38.js';
import { buildSalonMaps } from './maps39.js';
import { fruitMesh, FRUITS } from './fruit.js';
import { buildPirateMaps } from './maps7.js';
import { buildPlaneMaps, jetModel } from './maps8.js';
import { buildDieYoungMaps } from './maps9.js';
import { mapKit } from './mapkit.js';

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
  uWaterY: { value: -1e4 }, uWaterCol: { value: new THREE.Color(0x1f6f8f) },   // "SWIM" (2026-10-01): below this y everything is tinted as under water
  // "Take on Me" (2026-10-07): the drawn world. A fragment where dot(xyz, its world position) < w is drawn in pencil (the
  // 2D layer's sketchFx); (0, 0, 0, 1) draws everything, (0, 0, 0, -1), the default, nothing
  uSk: { value: new THREE.Vector4(0, 0, 0, -1) },
};

const VS = /* glsl */`
#include <common>
#include <skinning_pars_vertex>
uniform vec2 uSnap; uniform vec3 uAmb, uDirCol, uDirDir; uniform vec3 uPtPos[4]; uniform vec3 uPtCol[4]; uniform float uPtRange;
uniform vec2 uRep, uOff;
varying vec3 vLight; varying vec3 vUvw; varying float vFogD; varying float vWY; varying vec3 vWP;
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
  vLight = L; vWY = wp.y; vWP = wp.xyz;
  vec4 vp = viewMatrix * wp; vFogD = -vp.z;
  vec4 cp = projectionMatrix * vp;
  cp.xy = floor(cp.xy / cp.w * uSnap + 0.5) / uSnap * cp.w;      // vertex snap to a coarse screen grid
  vUvw = vec3((uv * uRep + uOff) * cp.w, cp.w);                  // affine mapping: undo perspective correction
  gl_Position = cp;
}`;
const FS = /* glsl */`
uniform sampler2D map; uniform float uUseMap; uniform vec3 uCol; uniform vec3 uFogCol; uniform vec2 uFog; uniform float uUnlit; uniform float uLift; uniform float uShadow; uniform vec3 uShadowCol; uniform float uNoFog; uniform float uPale; uniform float uSee;
uniform float uWaterY; uniform vec3 uWaterCol; uniform vec4 uSk; uniform float uKeep;
varying vec3 vLight; varying vec3 vUvw; varying float vFogD; varying float vWY; varying vec3 vWP;
// "Take on Me": a drawn fragment is written as a code the 2D layer turns into pencil (dance.js sketchFx): r its luminance
// (the fog fading it into the paper), g = r + 5/255 (a gap the 15-bit colours below never make: they step by 8 or 9), b
// its depth (/40 m) for the outlines
bool drawn() { return uKeep < 0.5 && dot(uSk.xyz, vWP) < uSk.w; }   // uKeep: this material stays real even in the drawn world
vec4 pencil(vec3 c) {
  float Y = clamp(dot(c, vec3(0.299, 0.587, 0.114)) * 1.05 + 0.2, 0.0, 1.0);   // lifted: white paper, hatching for the shadows and darks, no solid black (a dark fur scribbled into noise, review 2026-10-07)
  Y = mix(Y, 1.0, smoothstep(uFog.x, uFog.y, vFogD) * (1.0 - uNoFog) * 0.85);
  float y = floor(clamp(Y, 0.0, 1.0) * 249.0 + 0.5) / 255.0;
  return vec4(y, y + 5.0 / 255.0, clamp(vFogD / 40.0, 0.0, 1.0), 1.0);
}
vec3 underwater(vec3 c) {                                          // "SWIM": the sea over the deck; a lens under it sees everything through the water
  if (cameraPosition.y < uWaterY) {                                // from below: everything blue by distance, the surface itself bright
    if (vWY > uWaterY - 0.06) return mix(c, vec3(0.72, 0.94, 1.0), 0.62);
    return mix(c, uWaterCol, clamp(0.5 + vFogD * 0.06, 0.0, 0.93));
  }
  if (vWY < uWaterY) return mix(c, uWaterCol, clamp(0.1 + (uWaterY - vWY) * 1.1, 0.0, 0.86));   // a thin film barely tints (the planks show), a waist of water is blue
  return c;
}
float bayer(vec2 p) {
  int x = int(mod(p.x, 4.0)), y = int(mod(p.y, 4.0));
  const float m[16] = float[16](0., 8., 2., 10., 12., 4., 14., 6., 3., 11., 1., 9., 15., 7., 13., 5.);
  return m[x + y * 4] / 16.0;
}
void main() {
  if (uShadow > 0.0) {                                            // blob shadow: radial falloff drawn as a dither pattern
    vec2 q = vUvw.xy / vUvw.z - 0.5; float a = uShadow * (1.0 - 4.0 * dot(q, q));
    if (a <= bayer(gl_FragCoord.xy)) discard;
    if (drawn()) { gl_FragColor = pencil(uShadowCol * 0.85); return; }
    gl_FragColor = vec4(mix(underwater(uShadowCol), uFogCol, smoothstep(uFog.x, uFog.y, vFogD)), 1.0); return;
  }
  if (uSee > 0.0 && bayer(gl_FragCoord.xy) < uSee) discard;         // see: screen-door see-through (a soap bubble), dithered like the PS1's own
  vec4 tx = uUseMap > 0.5 ? texture2D(map, vUvw.xy / vUvw.z) : vec4(1.0);
  if (tx.a < 0.4) discard;
  tx.rgb = mix(tx.rgb, 0.74 + 0.26 * tx.rgb, uPale);             // pale: porcelain (a crowd of lucky-cat statues); 0 on every other material
  float glow = max(uUnlit, step(tx.a, 0.9));                     // alpha ~0.8 in a texture = self-lit (windows, lamps)
  vec3 lit = mix(vLight, vec3(1.0), uLift);                       // uLift > 0 keeps the hero readable in dark maps
  vec3 c = underwater(tx.rgb * uCol * mix(lit, vec3(1.0), glow));
  if (drawn()) { gl_FragColor = pencil(c); return; }
  c = mix(c, uFogCol, smoothstep(uFog.x, uFog.y, vFogD) * (1.0 - uNoFog));   // nofog: the moon and the stars, far beyond the fog
  c = floor(clamp(c, 0.0, 1.0) * 31.0 + bayer(gl_FragCoord.xy)) / 31.0;   // 15-bit colour, ordered dither
  gl_FragColor = vec4(c, 1.0);
}`;

function mat({ map = null, color = 0xffffff, rep = [1, 1], unlit = 0, lift = 0, shadow = 0, side = THREE.FrontSide, nofog = 0, see = 0, keep = 0 } = {}) {
  return new THREE.ShaderMaterial({
    vertexShader: VS, fragmentShader: FS, side,
    uniforms: { ...U, map: { value: map }, uUseMap: { value: map ? 1 : 0 }, uCol: { value: new THREE.Color(color) },
      uRep: { value: new THREE.Vector2(...rep) }, uOff: { value: new THREE.Vector2() }, uUnlit: { value: unlit }, uLift: { value: lift }, uShadow: { value: shadow }, uShadowCol: { value: new THREE.Color(0.22, 0.2, 0.24) }, uNoFog: { value: nofog },
      uPale: { value: 0 }, uSee: { value: see }, uKeep: { value: keep ? 1 : 0 } },   // every material uploads its own 0 (uKeep too): a GL uniform keeps the last value set on the shared program, so the porcelain crowd's paleness leaked onto every character drawn after it (2026-09-27)
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
const GRIDB = window.beatGrid;   // a kit's tempo map (src/core.js), else the one BPM
const bp = t => GRIDB ? GRIDB.pos(t) : (t - B0) * BPMv / 60;
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

export const BEACH = { SUNBED: [-0.7, -4.2], BED: 0.3, DUCK: [0.6, -11.2], SEA: -0.05, KOB: [-2.95, -5.0] };   // the daybed's centre and pad height, the duck float's wait, Kob's towel   // the lounger's centre and pad height, where the duck float waits
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
  // "Voyage Voyage" story props, off unless a shot's flags ask (BEACH spots): `sunbed` (the lounger under the umbrella),
  // `towels`, `duck` ([x, z]: Compote's giant rubber-duck float waiting at the water's edge), `jet` ([x0, y0, z0, x1, y1, z1]:
  // the airliner crossing the sky over the shot)
  const bedM = mat({ map: tex(16, 4, x => { for (let i = 0; i < 16; i += 4) { px(x, '#2a8ad8', i, 0, 2, 4); px(x, '#f6f1e6', i + 2, 0, 2, 4); } }), rep: [1, 3] });
  const sunbed = new THREE.Group(), frameM = mat({ color: 0xf2f2f2 });
  const bedPad = box(1.4, 0.1, 2.0, bedM); bedPad.position.set(0, BEACH.BED - 0.05, 0); sunbed.add(bedPad);   // a flat striped daybed: lying, sitting or dancing on it
  for (const [x, z] of [[-0.62, -0.9], [0.62, -0.9], [-0.62, 0.9], [0.62, 0.9]]) { const l = box(0.08, BEACH.BED - 0.1, 0.08, frameM); l.position.set(x, (BEACH.BED - 0.1) / 2, z); sunbed.add(l); }
  sunbed.position.set(BEACH.SUNBED[0], 0, BEACH.SUNBED[1]); G.add(sunbed);
  const towels = new THREE.Group();
  for (const [x, z, c, r] of [[-2.95, -5.0, 0xb05ad8, 0.1], [1.7, -6.9, 0xff8a3a, -0.2]]) { const tw = box(0.95, 0.02, 1.7, mat({ map: tex(8, 8, xx => { px(xx, '#' + c.toString(16).padStart(6, '0'), 0, 0, 8, 8); px(xx, '#ffffff', 0, 1, 8, 1); px(xx, '#ffffff', 0, 6, 8, 1); }) })); tw.position.set(x, 0.012, z); tw.rotation.y = r; towels.add(tw); }
  G.add(towels);
  const duck = duckFloat(); G.add(duck);
  const jet = jetModel(mapKit(MAP_KIT)); G.add(jet); const jv = new THREE.Vector3();
  return {
    group: G, sky, shadowCol: 0x9c7c48,
    light() {
      U.uAmb.value.set(0x8a8f9e); U.uDirCol.value.set(0xfff0d0); U.uDirDir.value.set(-0.5, -1, -0.6).normalize();
      U.uFogCol.value.set(0xc9ecff); U.uFog.value.set(25, 110); U.uPtRange.value = 1;
      U.uPtCol.value.forEach(c => c.setRGB(0, 0, 0));
    },
    anim(t, P = {}) {
      seaM.uniforms.uOff.value.set(t * 0.12, t * 0.05); palms.forEach((c, i) => { c.rotation.z = 0.06 * Math.sin(t * 1.3 + i); c.rotation.x = 0.04 * Math.sin(t * 0.9 + i * 2); });
      sunbed.visible = !!P.sunbed; towels.visible = !!P.towels; duck.visible = !!P.duck;
      if (P.duck) { duck.position.set(P.duck[0], 0.02 + 0.03 * Math.sin(t * 2.1), P.duck[1]); duck.rotation.set(0.03 * Math.sin(t * 1.7), P.duck[2] ?? 0, 0.04 * Math.sin(t * 1.3)); }
      jet.visible = !!P.jet;
      if (P.jet) { const [x0, y0, z0, x1, y1, z1] = P.jet, u = cl((t - P.t0) / Math.max(0.1, P.t1 - P.t0)); jet.position.set(x0 + (x1 - x0) * u, y0 + (y1 - y0) * u, z0 + (z1 - z0) * u); jv.set(x1 - x0, y1 - y0, z1 - z0); jet.rotation.set(0, Math.atan2(-jv.x, -jv.z), 0); jet.rotateX(Math.atan2(jv.y, Math.hypot(jv.x, jv.z))); jet.rotateZ(-0.1); }
    },
  };
}
// Compote's giant rubber duck float ("Voyage Voyage"): a yellow ring with a duck's head and beak at the front (-z) and a
// tail at the back; the rider sits in the ring (`ride: "duck"`), or it waits at the water's edge (the beach's `duck` flag)
function duckFloat() {
  const G = new THREE.Group(), yel = mat({ color: 0xffd21f }), org = mat({ color: 0xff8a1a }), blk = mat({ color: 0x151515 }), wht = mat({ color: 0xffffff });
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.52, 0.2, 6, 12), yel); ring.rotation.x = Math.PI / 2; ring.position.y = 0.14; G.add(ring);
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.2, 0.55, 8), yel); neck.position.set(0, 0.4, -0.62); neck.rotation.x = -0.25; G.add(neck);
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.26, 8, 6), yel); head.position.set(0, 0.74, -0.7); G.add(head);
  const beak = box(0.26, 0.09, 0.2, org); beak.position.set(0, 0.7, -0.95); G.add(beak);
  for (const s of [-1, 1]) { const e = box(0.08, 0.1, 0.03, wht); e.position.set(s * 0.12, 0.8, -0.93); G.add(e); const p = box(0.045, 0.06, 0.02, blk); p.position.set(s * 0.12, 0.8, -0.95); G.add(p); }
  const tail = new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.34, 6), yel); tail.position.set(0, 0.36, 0.66); tail.rotation.x = 0.9; G.add(tail);
  return G;
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
  const act = T.actions[name], d = T.clips[name].duration, kq = T.holder.quaternion.clone(), py = T.holder.position.y;   // the whole rotation: a swaying body is tilted too
  T.holder.rotation.set(0, 0, 0); T.holder.position.y = 0; for (const x of Object.values(T.actions)) x.weight = x === act ? 1 : 0;
  let m = Infinity;
  for (let i = 0; i < 24; i++) { act.time = (a + len * i / 23) % d; T.mixer.update(0); T.holder.updateMatrixWorld(true); m = Math.min(m, footY(T)); }
  T.holder.quaternion.copy(kq); T.holder.position.y = py;
  return T.faceCache[key] = T.restFoot - m;
}
// Body heading from the shoulder line (left → right upper arm) in world xz; skeleton-axis independent.
const _a = new THREE.Vector3(), _b = new THREE.Vector3();
function shoulderYaw(T) { T.L.getWorldPosition(_a); T.R.getWorldPosition(_b); return Math.atan2(_b.x - _a.x, _b.z - _a.z); }
// Average heading of the body over [a, a+len] of a clip (circular mean), relative to the rest pose.
// Deterministic: depends only on the clip and the range, so caching it keeps frames pure.
function clipFacing(T, name, a, len) {
  const key = name + '@' + a + '+' + len.toFixed(2); if (key in T.faceCache) return T.faceCache[key];
  const act = T.actions[name], d = T.clips[name].duration, keep = T.holder.quaternion.clone();
  T.holder.rotation.set(0, 0, 0); for (const x of Object.values(T.actions)) x.weight = x === act ? 1 : 0;
  let sx = 0, sz = 0;
  for (let i = 0; i < 12; i++) { act.time = (a + len * i / 11) % d; T.mixer.update(0); T.holder.updateMatrixWorld(true); const y = shoulderYaw(T) - T.restYaw; sx += Math.sin(y); sz += Math.cos(y); }
  T.holder.quaternion.copy(keep);
  return T.faceCache[key] = { yaw: Math.atan2(sx, sz), R: Math.hypot(sx, sz) / 12 };   // R near 1 = steady heading, low = spinning
}
// Lowest head height over a window, as a fraction of the standing head height (1 = upright, ~0.6 = crouched).
function headLow(T, name, a, len) {
  if (!T.head) return 1;
  const key = 'h:' + name + '@' + a + '+' + len.toFixed(2); if (key in T.faceCache) return T.faceCache[key];
  const act = T.actions[name], d = T.clips[name].duration, kq = T.holder.quaternion.clone(), py = T.holder.position.y;   // the whole rotation: a swaying body is tilted too
  T.holder.rotation.set(0, 0, 0); T.holder.position.y = 0; for (const x of Object.values(T.actions)) x.weight = x === act ? 1 : 0;
  let m = Infinity; for (let i = 0; i < 12; i++) { act.time = (a + len * i / 11) % d; T.mixer.update(0); T.holder.updateMatrixWorld(true); m = Math.min(m, T.head.getWorldPosition(_a).y - footY(T) + T.restFoot); }
  T.holder.quaternion.copy(kq); T.holder.position.y = py;
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
// Looks whose bare arms tore into flat fins when the arms came down ("So Easy", 2026-10-08: the floral dress): the chibi
// head's underside sits just over the T-posed arms, so a thin arm's top surface took the Head's weights and stayed put.
// Their arm vertices take weights only from body vertices skinned mostly to that arm's bones (see `nearFor` below).
const ARM_FIX = new Set(['floral', 'riviera', 'poodle']), ARM_OPT = { poodle: { r: 0.26, onHead: 0.05 } };   // ARM_OPT (the poodle: white fluff from the neck onto the upper arm, big white cuffs): in the arm zone (near-white texels out to r m) a vertex takes that arm's bones alone (blending the spine's, its cuffs' tops still stood up as spikes); one lying on the head's own surface (nearest body vertex the head's, within onHead m) keeps the plain rule   // riviera ("Espresso"): its bare forearms tore into flat grey blades; poodle ("BIRDS OF A FEATHER"): its arms tore into white wings from the shoulders to the pom-poms
async function addOutfit(T, name, url) {
  const body = []; T.root.traverse(o => { if (o.isSkinnedMesh) body.push(o); });
  const sm = body[0]; T.root.updateMatrixWorld(true);
  if (url === 'proc:bones') { (T.outfits ||= { [T.base]: body })[name] = boneLook(THREE, mat, sm); return; }   // "Spooky, Scary Skeletons" (2026-10-04): the skeleton from primitives (src/bones.js)
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
  // ARM_FIX: a costume vertex within 0.11 m of an arm (its shoulder joint to 0.12 m past the paw, bind pose) and out past
  // the shoulder joint takes its weights only from the body vertices skinned mostly to that arm's bones
  let nearFor = (x, y, z) => near(x, y, z, 6);
  if (ARM_FIX.has(name)) {
    // first move the costume's arms onto the skeleton's: Tripo drew the floral dress with its arms 0.19 m higher and
    // 0.075 m further forward than Saxo's (measured at the paw tips once fitted by span). Below the arms' height the
    // costume is squashed to it (feet kept on the floor), above it shifted down (the head keeps its size); the arms,
    // out past the shoulder joints, also move back. Then they skin to the arm bones alone (nearFor).
    const half = (bb.max.x - bb.min.x) / 2, tip = (pts, get) => { let n = 0, y = 0, z = 0; for (const p of pts) { const [px, py, pz] = get(p); if (Math.abs(px) < 0.88 * half) continue; n++; y += py; z += pz; } return n ? [y / n, z / n] : null; };
    const tb = tip(B, b => b), idx = Array.from({ length: P.count }, (_, k) => k), tc = tip(idx, k => [P.getX(k), P.getY(k), P.getZ(k)]);
    const shX = Math.abs(sm.skeleton.bones.find(bn => /LeftArm$/.test(bn.name))?.getWorldPosition(new THREE.Vector3()).x || 0.19) + 0.06;
    if (tb && tc && tc[0] > tb[0] + 0.03) {
      const [yb, zb] = tb, [yc, zc] = tc, dz = zb - zc;
      for (let k = 0; k < P.count; k++) {
        const x = P.getX(k), y = P.getY(k), w = Math.min(1, Math.max(0, (Math.abs(x) - shX) / 0.13)), ws = w * w * (3 - 2 * w);
        P.setY(k, y <= yc ? y * yb / yc : y - (yc - yb)); P.setZ(k, P.getZ(k) + dz * ws);
      }
      P.needsUpdate = true; memo.clear();
      console.warn(`outfit ${name}: arms moved from y ${yc.toFixed(2)} z ${zc.toFixed(2)} to y ${yb.toFixed(2)} z ${zb.toFixed(2)}`);
    }
    const bones = sm.skeleton.bones, wp = re => { const bn = bones.find(b => re.test(b.name)); return bn ? bn.getWorldPosition(new THREE.Vector3()) : null; };
    const dom = B.map((_, j) => { let bb = -1, w = 0; for (let c = 0; c < 4; c++) if (bw.getComponent(j, c) > w) { w = bw.getComponent(j, c); bb = bi.getComponent(j, c); } return bones[bb]?.name || ''; });
    const arms = ['Left', 'Right'].map(sd => {
      const a = wp(new RegExp(sd + 'Arm$')), h = wp(new RegExp(sd + 'Hand$')); if (!a || !h) return null;
      const d = h.clone().sub(a).normalize(); return { a, b: h.clone().addScaledVector(d, 0.12), re: new RegExp(sd + '(Arm|ForeArm|Hand)') };
    }).filter(Boolean);
    const segD = (p, A, Bq) => { const ab = Bq.clone().sub(A), t = Math.max(0, Math.min(1, p.clone().sub(A).dot(ab) / ab.lengthSq())); return p.distanceTo(A.clone().addScaledVector(ab, t)); };
    // in the arm zone, the costume's texel says what a vertex is: grey fur (low saturation, not dark) is the arm and
    // takes that arm's bones; a saturated texel (the brown wig's ends, a gold hoop) belongs to the head and takes the
    // head's; anything else there (a puff of the dress, its print) takes no arm bone
    const m0t = Array.isArray(mesh.material) ? mesh.material[0] : mesh.material, im = m0t?.map?.image, uvA = g.attributes.uv;
    let kindOf = () => 'fur';
    if (im && uvA) {
      const cv = document.createElement('canvas'); cv.width = im.width; cv.height = im.height; const cx = cv.getContext('2d'); cx.drawImage(im, 0, 0);
      const data = cx.getImageData(0, 0, cv.width, cv.height).data, flip = !!m0t.map.flipY;
      kindOf = k => {
        let u = uvA.getX(k) % 1, v = uvA.getY(k) % 1; if (u < 0) u += 1; if (v < 0) v += 1;
        const px = Math.min(cv.width - 1, Math.floor(u * cv.width)), py = Math.min(cv.height - 1, Math.floor((flip ? 1 - v : v) * cv.height)), o = (py * cv.width + px) * 4;
        const r = data[o], gg = data[o + 1], b2 = data[o + 2], mx = Math.max(r, gg, b2), mn = Math.min(r, gg, b2);
        const sat = mx ? (mx - mn) / mx : 0, lum = (r + gg + b2) / 765;
        return sat < 0.15 && lum > 0.72 ? 'white' : sat < 0.2 && lum > 0.5 ? 'light' : sat < 0.2 && lum > 0.3 ? 'fur' : sat > 0.25 ? 'head' : 'body';
      };
    }
    const anyArm = /(Arm|ForeArm|Hand)/, headish = /(Head|Neck)/, pv = new THREE.Vector3();
    const hv = B.filter((_, j) => /Head$/.test(dom[j])), headC = new THREE.Vector3(); hv.forEach(b => headC.x += b[0] / hv.length); hv.forEach(b => { headC.y += b[1] / hv.length; headC.z += b[2] / hv.length; });
    const hd = hv.map(b => Math.hypot(b[0] - headC.x, b[1] - headC.y, b[2] - headC.z)).sort((a, b) => a - b), headR = hd[Math.floor(hd.length * 0.92)] || 0.45;   // the chibi head as a sphere: its body vertices' centroid and 92nd-percentile radius
    nearFor = (x, y, z, k) => {
      pv.set(x, y, z);
      const opt = ARM_OPT[name];
      if (opt) {
        const kd0 = kindOf(k), zone = arms.find(q => Math.sign(x) === Math.sign(q.a.x) && Math.abs(x) > Math.abs(q.a.x) + 0.02 && segD(pv, q.a, q.b) < (kd0 === 'white' || kd0 === 'light' ? opt.r : 0.13));   // the fluff's shaded curls are light grey, not white
        if (!zone) return near(x, y, z, 6);
        const nn = near(x, y, z, 1)[0]; if (nn && nn[0] < opt.onHead * opt.onHead && headish.test(dom[nn[1]])) return near(x, y, z, 6);
        const pick = near(x, y, z, 160).filter(([, j]) => zone.re.test(dom[j])).slice(0, 6); return pick.length >= 2 ? pick : near(x, y, z, 6);
      }
      const arm = arms.find(q => {   // ARM_OPT (the poodle): its wrist pom-poms reach 0.2 m from the arm (their tops took the head's weights and stood up as spikes), and its grey arms match its grey face (the head's lower sides went down with the arms as flaps)
        if (Math.sign(x) !== Math.sign(q.a.x) || Math.abs(x) <= Math.abs(q.a.x) + 0.02) return false;
        const d = segD(pv, q.a, q.b); if (!opt) return d < 0.13;
        const nn = near(x, y, z, 1)[0]; if (nn && nn[0] < opt.onHead * opt.onHead && /Head$/.test(dom[nn[1]])) return false;
        return kindOf(k) === 'white' ? d < opt.r : d < 0.13;
      });
      if (!arm) return near(x, y, z, 6);
      const kd = kindOf(k), pick = near(x, y, z, 160).filter(([, j]) => kd === 'fur' || kd === 'white' || kd === 'light' ? arm.re.test(dom[j]) : kd === 'head' ? headish.test(dom[j]) : !anyArm.test(dom[j])).slice(0, 6);
      return pick.length >= 2 ? pick : near(x, y, z, 6);
    };
  }
  for (let k = 0; k < n; k++) {
    const x = P.getX(k), y = P.getY(k), z = P.getZ(k), key = x.toFixed(4) + ',' + y.toFixed(4) + ',' + z.toFixed(4);
    let w = memo.get(key);
    if (!w) {
      const acc = {};   // inverse-distance blend of the 6 nearest body vertices' weights, keep the top 4 bones
      for (const [d2, j] of nearFor(x, y, z, k)) { const f = 1 / (d2 + 1e-6); for (let c = 0; c < 4; c++) { const wt = bw.getComponent(j, c); if (wt > 0) acc[bi.getComponent(j, c)] = (acc[bi.getComponent(j, c)] || 0) + wt * f; } }
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
  pirate: 'assets/models/saxo_pirate.glb',   // the pirate captain: tricorn over a red bandana, short beaded dreadlocks, kohl, linen shirt, waistcoat, red sash ("He's A Pirate", 2026-09-26)
  tourist: 'assets/models/saxo_tourist.glb',   // the tourist: turquoise hibiscus shirt, orange travel neck pillow, red instant camera, khaki cargo shorts ("Voyage Voyage", 2026-09-26)
  kesha: 'assets/models/saxo_kesha.glb',   // the pop-star disguise: messy platinum shag wig, eyeliner, gold glitter, red lips, studded black biker jacket, chains ("Die Young", 2026-09-26)
  sailor: 'assets/models/saxo_sailor.glb',   // the anime sailor school uniform: white blouse, navy sailor collar, red neckerchief, navy pleated skirt, loafers ("Caramelldansen", 2026-09-27)
  trench: 'assets/models/saxo_trench.glb',   // the French film look: a camel trench coat belted over a black turtleneck, grey trousers, brown shoes ("Dans ma bulle", 2026-09-27)   // the anime sailor school uniform: white blouse, navy sailor collar, red neckerchief, navy pleated skirt, loafers ("Caramelldansen", 2026-09-27)
  pyjama: 'assets/models/saxo_pyjama.glb',   // sick-day pyjamas: pale blue striped flannel, a red knitted scarf wound twice round the neck, grey slippers ("Patient Zero", 2026-09-27)
  devil: 'assets/models/saxo_devil.glb',   // the devil on his shoulder ("Patient Zero")
  lifeguard: 'assets/models/saxo_lifeguard.glb',   // the lifeguard: red swim shorts with white side stripes, a white tank top with a red cross, a red whistle on a white cord, red flip-flops ("Beauty And A Beat", 2026-09-27)   // the devil on his shoulder: a red onesie, small curved horns, a short arrow tail, black gloves and boots ("Patient Zero", 2026-09-27)
  soul: 'assets/models/saxo_soul.glb',
  // the 1983 street look: a shiny black leather jacket open over a pale pink shirt, a small red bow tie, black leather trousers, white socks, loafers, a little black hat ("Billie Jean", 2026-09-28)
  billie: 'assets/models/saxo_billie.glb',
  // the team kit: a sunflower-yellow jersey with a green collar and cuffs, green shorts, yellow socks with green bands, black boots; his green 10 and a red captain's armband ("Dai Dai", 2026-09-28)
  football: 'assets/models/saxo_football.glb',
  // the beach diva: a long wavy golden-blonde wig to the shoulders, white sunglasses pushed up on it, gold hoops and a gold chain, a silver sequinned one-piece swimsuit, bare paws ("Vamos a la playa", 2026-09-29)
  diva: 'assets/models/saxo_diva.glb',
  // the pop singer: long straight hot-pink hair to the shoulders, a navy satin varsity bomber with white striped cuffs worn open, a yellow sports crop top, black cycling shorts, white chunky sneakers ("Ain't In LA", 2026-09-30)
  popstar: 'assets/models/saxo_popstar.glb',
  // an indie rock frontman: a black leather biker jacket open over a white shirt, a thin black tie, charcoal trousers, black boots, a slicked-back black quiff ("Self Aware", 2026-09-30)
  frontman: 'assets/models/saxo_frontman.glb',
  // the band's captain in the clip's naval look: a black double-breasted officer's jacket, two rows of gold buttons, gold cuff stripes, a white captain's cap with a gold anchor ("SWIM", 2026-10-01)
  captain: 'assets/models/saxo_captain.glb',
  // the clip's 1960s blonde: a teased blonde bouffant flipped up at the shoulders (his ears out on top), a pale pink shift dress with a white Peter Pan collar, white gloves, pearl earrings, white heels ("Stop The Wedding!", 2026-10-01)
  bouffant: 'assets/models/saxo_bouffant.glb',
  // the bobsled team's captain: a bright yellow racing suit with green side panels and black stripes, a green, yellow and black striped beanie with a pompom, black boots ("Jamaican (Bam Bam)", 2026-10-02)
  bobsled: 'assets/models/saxo_bobsled.glb',
  // the sleepwalker, the clip's white nightgown: a white cotton nightshirt to the knees with a small frilled collar and three buttons, white bed socks, a long droopy white nightcap with a pompom ("Bring Me To Life", 2026-10-02)
  sleepwalker: 'assets/models/saxo_sleepwalker.glb',
  // the singer's look in the clip: a black Nordic knit sweater with a white snowflake and star yoke, cream cuffs and hem, slim blue jeans, white sneakers ("we fell in love in october", 2026-10-03)
  nordic: 'assets/models/saxo_nordic.glb',
  // the indie rock singer's look in the clip: a big mop of dark brown curls over the ears and forehead, a black jacket with a cream fleece collar open over a white t-shirt, slim blue jeans, brown boots ("Beautiful Things", 2026-10-04)
  rocker: 'assets/models/saxo_rocker.glb',
  // the scrub: a red baseball cap worn backwards, a white ribbed tank top, a chunky gold chain, baggy light-blue jeans, white high-top sneakers ("No Scrubs", 2026-10-05)
  scrub: 'assets/models/saxo_scrub.glb',
  // the DtMF-era straw pava hat (pale woven straw, a black band, a medium brim) over a short-sleeved white guayabera with four pockets and thin pleats, untucked, beige linen trousers, white sneakers ("DtMF", 2026-10-05 2nd)
  pava: 'assets/models/saxo_pava.glb',
  // the K-pop idol lead in the film's stage look: long straight lavender hair with a thick braid over his left shoulder, his ears out, a cropped black stage jacket with gold baroque embroidery open over a white crop top, white high-waisted trousers, white platform boots, gold hoops ("Golden", 2026-10-06)
  idol: 'assets/models/saxo_idol.glb',
  // the APT. duo's punk look from the clip: a black cap worn backwards, small black sunglasses, a black leather biker jacket open over a white t-shirt, a pearl necklace, a red tartan kilt over black leggings, white sneakers ("APT.", 2026-10-07)
  kilt: 'assets/models/saxo_kilt.glb',
  // the comic's racing hero from "Take on Me": a snug brown leather racing helmet with ear flaps and round goggles pushed up on it, a white one-piece racing overall with a red stripe and a black 13 in a white circle, brown leather gloves, a short red scarf knotted at the neck, brown lace-up boots (2026-10-07 2nd)
  racer: 'assets/models/saxo_racer.glb',
  // the singer's look from the "So Easy (To Fall In Love)" clip: a long voluminous dark brown curly wig to the shoulders, his ears out on top, gold hoops, an off-the-shoulder white midi sundress printed with big black flowers, black strappy heels (2026-10-08)
  floral: 'assets/models/saxo_floral.glb',
  // the singer's look from the "Poker Face" clip: a sleek platinum-blonde bob with thick blunt bangs, his ears out on top, a pale-blue lightning bolt painted on his cheek, a glossy teal-blue latex catsuit with long sleeves and diamond cut-outs at the waist, teal fingerless gloves, black ankle boots (2026-10-08 2nd)
  platinum: 'assets/models/saxo_platinum.glb',
  // the entertainer in the "Danza Kuduro" clip's look: a white Breton top with thin navy stripes, white linen trousers, white boat shoes, black aviator sunglasses (2026-10-09)
  breton: 'assets/models/saxo_breton.glb',
  // the singer's look from the "Espresso" clip, as the lakefront's barista: a long wavy platinum-blonde wig with curtain bangs, his ears out on top, a pink silk headscarf tied under the chin, black cat-eye sunglasses, a mint-teal 1960s mini dress with puff sleeves, a white frilly waist apron, white sneakers (2026-10-09 2nd)
  riviera: 'assets/models/saxo_riviera.glb',
  // the singer's look from the "BIRDS OF A FEATHER" clip: a slouchy black knit beanie with his ears poking out on top, thin round wire-rim glasses, long straight dark brown hair to the shoulders, an oversized white sweatshirt with a small red-and-black print, baggy olive camo cargo trousers, striped socks, black skate sneakers (2026-10-10)
  beanie: 'assets/models/saxo_beanie.glb',
  // the groomer's show-poodle cut: fluffy white curls on his chest and shoulders, big pom-poms round his wrists and ankles, a puff of curls on his head with a pink satin bow, a pink collar with a gold heart tag, a pom-pom on his tail ("BIRDS OF A FEATHER", 2026-10-10)
  poodle: 'assets/models/saxo_poodle.glb',
  banana:'assets/models/saxo_banana.glb' };   // the banana suit: a yellow onesie, a snug hood ending in the brown stem, three peel flaps round the shoulders ("Hootie Frutti", 2026-09-28)   // the soul singer: a long dark curly wig, gold hoops, a butter-yellow quilted jacket open over a white camisole, cream trousers, white sneakers ("Love Me Not", the Live Lounge, 2026-09-28)
// Sadi (a black-and-tan terrier girl, sheets in assets/ref/sadi/) is modelled on Saxo's T-pose and proportions, so she
// rides a clone of his skeleton: her base look and every costume are fitted like outfits, and all his clips play on her.
// Kob (a grumpy grey tabby cat girl, sheets in assets/ref/kob/) is built the same way and takes the same slot: the
// partner slot holds one of them per render, picked by ?with=sadi (default) | kob | compote, or by ?cast=<name>.
// Compote (an always-angry grey dwarf bunny girl in a plum hoodie, sheets in assets/ref/compote/) is the fourth.
const PARTNERS = {
  sadi: { scale: 0.92, models: { sadi: 'assets/models/sadi_base.glb', cowgirl: 'assets/models/sadi_cowgirl.glb', astronaut: 'assets/models/sadi_astronaut.glb',
    disco: 'assets/models/sadi_disco.glb', beach: 'assets/models/sadi_beach.glb', cheer: 'assets/models/sadi_cheer.glb', poop: 'assets/models/sadi_poop.glb', patrick: 'assets/models/sadi_patrick.glb', hotdog: 'assets/models/sadi_hotdog.glb',
    white: 'assets/models/sadi_white.glb', rave: 'assets/models/sadi_rave.glb',   // rave: neon-green mesh top, cargo pants, glow bracelets ("99 Luftballons")
    pirate: 'assets/models/sadi_pirate.glb',   // pirate heroine: red bandana, gold hoops, white blouse, laced corset vest, red sash, boots ("He's A Pirate")
    hostess: 'assets/models/sadi_hostess.glb',   // flight attendant: navy jacket with gold buttons and wings, red scarf, pillbox hat, her pink bow ("Voyage Voyage")
    yukata: 'assets/models/sadi_yukata.glb',   // a pink cherry-blossom yukata ("Caramelldansen")
    paris: 'assets/models/sadi_paris.glb',
    // an 80s evening look: a red sequin cocktail dress with puffed shoulders, a pearl necklace, red heels, her pink bow ("Billie Jean", 2026-09-28)
    glam: 'assets/models/sadi_glam.glb',
    // the team kit: a sunflower-yellow jersey with a green collar and cuffs, green shorts, yellow socks with green bands, pink boots; her green 7 and her pink bow ("Dai Dai", 2026-09-28)
    football: 'assets/models/sadi_football.glb',
    // an LA wannabe's velour tracksuit: a hot-pink zip-up hoodie and pants, white sneakers, white heart-shaped sunglasses pushed up on her head, her pink bow ("Ain't In LA", 2026-09-30)
    tracksuit: 'assets/models/sadi_tracksuit.glb',
    // the clip's heroine: a long caramel wool coat open over a white satin slip dress, tan ankle boots, her pink bow ("SWIM", 2026-10-01)
    coat: 'assets/models/sadi_coat.glb',
    // the bride: a short white wedding dress with a lace bodice and a flared skirt, a short tulle veil from a small silver tiara, her pink bow, white heels ("Stop The Wedding!", 2026-10-01)
    bride: 'assets/models/sadi_bride.glb',
    // the team's racing suit (yellow, green panels, black stripes) and the striped beanie with her pink bow on it ("Jamaican (Bam Bam)", 2026-10-02)
    bobsled: 'assets/models/sadi_bobsled.glb',
    // the sleepover: a short pale pink nightdress with white lace trim and puffed sleeves, fluffy pink slippers, her pink bow ("Bring Me To Life", 2026-10-02)
    nightie: 'assets/models/sadi_nightie.glb',
    // the talent agency's staff uniform: a fitted black suit jacket over a white shirt and a thin black tie, a black pencil skirt, black tights and flats, a white staff badge, her pink bow ("Animal", 2026-10-03)
    assistant: 'assets/models/sadi_assistant.glb',
    // the girl in red: a chunky bright red cable-knit sweater over a black turtleneck, slim blue jeans, black ankle boots, her pink bow ("we fell in love in october", 2026-10-03)
    redsweater: 'assets/models/sadi_redsweater.glb',
    // the vampire: a black satin cape with a red lining and a tall stand-up collar fastened with a gold clasp, a short black dress with a red sash, black tights, red shoes, her pink bow ("Spooky, Scary Skeletons", 2026-10-04)
    vampire: 'assets/models/sadi_vampire.glb',
    // the band's guitarist and his trainer: a light blue denim jacket, sleeves rolled, over a white t-shirt, black jeans, white sneakers, a brown leather treat pouch at her hip, her pink bow ("Beautiful Things", 2026-10-04)
    denim: 'assets/models/sadi_denim.glb',
    // the girl group's stage look from the clip: a white zip-up jacket with a high stand-up collar, shiny black vinyl trousers with a wide silver belt and a round red buckle, chunky silver platform sneakers, her pink bow ("No Scrubs", 2026-10-05)
    chrome: 'assets/models/sadi_chrome.glb',
    // the party dress: a white ruffled sundress to the knees with puffed sleeves, a red sash with a red hibiscus on it, red sandals, her pink bow ("DtMF", 2026-10-05 2nd)
    fiesta: 'assets/models/sadi_fiesta.glb',
    // the idol singer: a long hot-pink high ponytail down her back, her pink bow, a white cropped stage jacket with a high collar and gold trim over a white crop top, white wide trousers with a gold chain belt, gold platform boots ("Golden", 2026-10-06)
    idol: 'assets/models/sadi_idol.glb',
    // the honky-tonk singer from the clip: a long straight dark brown wig with short blunt bangs above her eyes, her ears out on top and her pink bow, a white peasant blouse with puffed long sleeves, a turquoise stone necklace, red flared bell-bottoms, brown cowboy boots ("Choosin' Texas", 2026-10-06 2nd)
    singer: 'assets/models/sadi_singer.glb',
    // the APT. duo's other half from the clip: a short messy platinum-blonde bob wig with a fringe, her pink bow on it, a black leather biker jacket open over a white cropped top, black leather mini shorts, black ankle boots ("APT.", 2026-10-07)
    bob: 'assets/models/sadi_bob.glb',
    // the comic's reader from "Take on Me": a big curly blonde 80s perm, her ears and her pink bow on top, an oversized pale grey blazer with the sleeves pushed up over a white t-shirt, light stonewashed jeans, white sneakers, small gold hoops (2026-10-07 2nd)
    reader: 'assets/models/sadi_reader.glb',
    // the London flower-stall florist from "So Easy (To Fall In Love)": a dark green canvas apron over a white blouse with rolled sleeves, a pink rose behind one ear beside her bow, light blue jeans, brown ankle boots (2026-10-08)
    florist: 'assets/models/sadi_florist.glb',
    strawberry: 'assets/models/sadi_strawberry.glb' },   // the strawberry suit: red with yellow seeds, a green leafy collar, a leaf cap with a stalk, her pink bow ("Hootie Frutti", 2026-09-28)   // the Parisienne: a Breton striped top, a red skirt, red ballet flats, a red beret, red lips ("Dans ma bulle")   // a pink cherry-blossom yukata, red obi with a bow at the back, geta, her pink bow ("Caramelldansen")
    heads: { white: 'sadi' },   // the white dress came back from Tripo with a faceless head: wear her own
    byMap: { moon: 'astronaut', club: 'disco', beach: 'beach', western: 'cowgirl', stadium: 'cheer', mars: 'astronaut', spaceship: 'astronaut', underwater: 'astronaut', bikini: 'patrick', stage: 'disco', arcade: 'disco', farm: 'cowgirl', jungle: 'cowgirl', pyramids: 'cowgirl', school: 'cheer', pirate: 'beach', candy: 'beach', volcano: 'beach', supermarket: 'hotdog' } },
  kob: { scale: 0.92, models: { kob: 'assets/models/kob_base.glb', astronaut: 'assets/models/kob_astronaut.glb', cowgirl: 'assets/models/kob_cowgirl.glb',
    popstar: 'assets/models/kob_popstar.glb', beach: 'assets/models/kob_beach.glb', ninja: 'assets/models/kob_ninja.glb', witch: 'assets/models/kob_witch.glb', chef: 'assets/models/kob_chef.glb', poop: 'assets/models/kob_poop.glb', moto: 'assets/models/kob_moto.glb',
    pyjama: 'assets/models/kob_pyjama.glb',
    bartender: 'assets/models/kob_bartender.glb',   // the bartender: white shirt, sleeves rolled, black waistcoat and bow tie, her bell collar ("Die Young")
    maneki: 'assets/models/kob_maneki.glb',   // the lucky-cat suit ("Caramelldansen")
    driver: 'assets/models/kob_driver.glb',
    // the private eye: a beige belted trench coat, collar up, a small brown fedora, her bell ("Billie Jean", 2026-09-28)
    detective: 'assets/models/kob_detective.glb',
    // the team kit: a sunflower-yellow jersey with a green collar and cuffs, green shorts, yellow socks with green bands, black boots; her green 9 and her bell collar ("Dai Dai", 2026-09-28)
    football: 'assets/models/kob_football.glb',
    // the grumpy neighbour at home: a faded pink quilted flowery housecoat, belted, pink foam curlers across her head, grey fluffy slippers, her bell ("Ain't In LA", 2026-09-30)
    housecoat: 'assets/models/kob_housecoat.glb',
    // the band's bass player: a black suit jacket, a white shirt, a thin black tie, black trousers, her bell ("Self Aware", 2026-09-30)
    bassist: 'assets/models/kob_bassist.glb',
    // the only one who came prepared: a bright orange life jacket (black straps, a white reflective stripe, a whistle) over her mint tweed, her bell ("SWIM", 2026-10-01)
    lifevest: 'assets/models/kob_lifevest.glb',
    // the wedding's officiant: a long black robe with wide sleeves, a white collar tab, a thin gold sash, black shoes, her bell collar ("Stop The Wedding!", 2026-10-01)
    officiant: 'assets/models/kob_officiant.glb',
    // the only one dressed for the snow: a quilted mint puffer parka zipped to the chin, a long pink scarf, a pink bobble hat, mint mittens, grey snow boots ("Jamaican (Bam Bam)", 2026-10-02)
    parka: 'assets/models/kob_parka.glb',
    // the agency's CEO: a sharp double-breasted black power suit with gold buttons and padded shoulders, a white silk blouse, pearls and pearl earrings, black heels, her bell ("Animal", 2026-10-03)
    ceo: 'assets/models/kob_ceo.glb',
    // the barbecue pitmaster: a small black cowboy hat between her ears, a red bandana over her bell collar, a light blue denim shirt with rolled sleeves under a brown leather apron with a pocket, dark jeans, brown cowboy boots ("Choosin' Texas", 2026-10-06 2nd)
    pitmaster: 'assets/models/kob_pitmaster.glb',
    // the insomniac: an old-fashioned long white cotton nightgown printed with tiny blue flowers, long sleeves, a lace collar, a white frilly nightcap between her ears, grey fluffy slippers, her bell collar ("Espresso", 2026-10-09 2nd)
    nightgown: 'assets/models/kob_nightgown.glb',
    // the pet groomer: a pale lilac work smock with short sleeves and a front pocket of steel scissors and a comb, a name badge, a small lilac cap between her ears, black leggings, white rubber clogs, her bell collar ("BIRDS OF A FEATHER", 2026-10-10)
    groomer: 'assets/models/kob_groomer.glb',
    // the park keeper: a dark olive work jacket under a fluorescent yellow high-visibility vest with silver stripes, green work trousers, green rubber boots, brown work gloves, a dark green beanie, her bell ("we fell in love in october", 2026-10-03)
    keeper: 'assets/models/kob_keeper.glb',
    // the clip's drummer: a bright pink knitted beanie between her ears, a beige canvas work jacket open over a white t-shirt, light blue jeans, white sneakers, her bell ("Beautiful Things", 2026-10-04)
    beanie: 'assets/models/kob_beanie.glb',
    // the girl group's stage look: the white high-collared zip jacket, shiny black vinyl trousers, the silver belt with its red buckle, silver platforms, her bell ("No Scrubs", 2026-10-05)
    chrome: 'assets/models/kob_chrome.glb',
    spa: 'assets/models/kob_spa.glb' },   // the spa day: a fluffy white bathrobe with a pink belt, a pink towel turban, fluffy slippers, her bell ("Beauty And A Beat": the cat who won't touch the water)   // the city bus driver: pale blue short-sleeved shirt, navy tie, navy trousers, a peaked cap with a gold badge, her bell ("Dans ma bulle")   // a maneki-neko lucky-cat suit: white with calico patches, red bib, gold bell, a gold koban coin ("Caramelldansen")
    byMap: { moon: 'astronaut', mars: 'astronaut', spaceship: 'astronaut', underwater: 'astronaut', bikini: 'astronaut', western: 'cowgirl', farm: 'cowgirl', jungle: 'cowgirl', pyramids: 'cowgirl',
      club: 'popstar', stage: 'popstar', arcade: 'popstar', beach: 'beach', pirate: 'beach', candy: 'beach', volcano: 'beach', tokyo: 'ninja', snow: 'ninja', subway: 'ninja', graveyard: 'witch', supermarket: 'chef', highway: 'moto' } },
  compote: { scale: 0.92, models: { compote: 'assets/models/compote_base.glb', astronaut: 'assets/models/compote_astronaut.glb', cowgirl: 'assets/models/compote_cowgirl.glb',
    punk: 'assets/models/compote_punk.glb', beach: 'assets/models/compote_beach.glb', boxer: 'assets/models/compote_boxer.glb', poop: 'assets/models/compote_poop.glb',
    bouncer: 'assets/models/compote_bouncer.glb',
    happi: 'assets/models/compote_happi.glb',
    // the team kit: a sunflower-yellow jersey with a green collar and cuffs, green shorts, yellow socks with green bands, black boots; her green 4, a red sweatband, her carrot clip ("Dai Dai", 2026-09-28)
    football: 'assets/models/compote_football.glb',
    // a Slovak folk dancer: a white blouse with puffed sleeves, a red vest embroidered with flowers, a red skirt with ribbons, a white apron, a crown of red and white flowers, red boots, her carrot clip ("Ain't In LA", 2026-09-30)
    folk: 'assets/models/compote_folk.glb',
    // the band's drummer: a black cap backwards, a white shirt with rolled sleeves and a loose black tie, black jeans, white sneakers, black sweatbands ("Self Aware", 2026-09-30)
    drummer: 'assets/models/compote_drummer.glb',
    // the bosun in sailor whites: a white middy top with a navy striped collar and neckerchief, white bell-bottoms, black shoes, a white sailor cap, her carrot clip ("SWIM", 2026-10-01)
    sailor: 'assets/models/compote_sailor.glb',
    // the flower girl: a pale pink frilly dress with puffed sleeves and a big satin bow at the back, white tights, pink shoes, a crown of pink and white flowers, her carrot clip ("Stop The Wedding!", 2026-10-01)
    flowergirl: 'assets/models/compote_flowergirl.glb',
    // the team's racing suit (yellow, green panels, black stripes) and the striped beanie with her carrot clip on it ("Jamaican (Bam Bam)", 2026-10-02)
    bobsled: 'assets/models/compote_bobsled.glb',
    // the sleepover: red and white checked flannel pyjamas with a white collar and a carrot patch, grey fluffy slippers, her carrot clip ("Bring Me To Life", 2026-10-02)
    pyjamas: 'assets/models/compote_pyjamas.glb',
    // the jack-o'-lantern: a round orange padded pumpkin onesie with a carved face printed on the belly, a green stem-and-leaf cap between her ears, her carrot clip ("Spooky, Scary Skeletons", 2026-10-04)
    pumpkin: 'assets/models/compote_pumpkin.glb',
    // the girl group's stage look: the white high-collared zip jacket with a carrot patch, shiny black vinyl trousers, the silver belt with its red buckle, silver platforms, her carrot clip ("No Scrubs", 2026-10-05)
    chrome: 'assets/models/compote_chrome.glb',
    // the idol rapper: black hair in two round buns low at the sides of her head and a short fringe, her carrot clip, an oversized white varsity jacket with gold trim over a black crop top, black shorts, white high-tops ("Golden", 2026-10-06)
    idol: 'assets/models/compote_idol.glb',
    // the pool bar's waitress: a turquoise Hawaiian shirt with white palm leaves and pink hibiscus, a short white waist apron, white shorts, white sneakers, her carrot clip ("Danza Kuduro", 2026-10-09)
    waitress: 'assets/models/compote_waitress.glb',
    // the clip's police officer: a light blue short-sleeved uniform shirt with a silver star badge and a navy tie, navy trousers, a black belt, a small navy peaked cap with a silver badge between her ears, black shoes, a whistle on a chain, her carrot clip ("Espresso", 2026-10-09 2nd)
    cop: 'assets/models/compote_cop.glb',
    // the salon's bather: a bright yellow rubber apron from her chest to her knees over a plum short-sleeved top, long yellow rubber gloves to the elbows, green rubber boots, her carrot clip ("BIRDS OF A FEATHER", 2026-10-10)
    bather: 'assets/models/compote_bather.glb',
    carrot: 'assets/models/compote_carrot.glb' },   // the carrot suit: orange with brown rings, carrot leaves on her head between the ears, her carrot clip ("Hootie Frutti", 2026-09-28: a vegetable at the fruits-only party)   // the festival taiko drummer: indigo happi coat with white waves, red sash, white shorts, a hachimaki headband ("Caramelldansen")
    heads: { chrome: 'compote' },   // the girl-group look came back from Tripo with the top of her head sliced flat (ears and eyes gone): wear her own ("No Scrubs", 2026-10-05)
    byMap: { moon: 'astronaut', mars: 'astronaut', spaceship: 'astronaut', underwater: 'astronaut', bikini: 'astronaut', western: 'cowgirl', farm: 'cowgirl', jungle: 'cowgirl', pyramids: 'cowgirl',
      club: 'punk', stage: 'punk', arcade: 'punk', subway: 'punk', tokyo: 'punk', graveyard: 'punk', beach: 'beach', pirate: 'beach', candy: 'beach', volcano: 'beach', stadium: 'boxer', school: 'boxer' } },
  // "Spooky, Scary Skeletons" (2026-10-04): a cartoon skeleton built from primitives on a clone of Saxo's skeleton
  // (src/bones.js), a fifth body: an episode's `with` loads it, a shot's `actors` and `crowd` place it (`who: 'skel'`),
  // and an actor's or a crowd's `hideParts` (skull, torso, armL, armR, legL, legR) takes bones away
  skel: { scale: 1, models: { skel: 'proc:bones' }, byMap: {} },
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
    // actors and crowds name their looks (a crowd can be a list); until 2026-09-27 a bare `if (s.crowd)` sat inside
    // this chain, so every actors shot without a crowd fell through to `return null` and loaded every look
    if (s.actors || s.crowd) { for (const a of s.actors || []) add(a.who || 'saxo', a.look || a.who || 'saxo'); for (const c of [].concat(s.crowd || [])) add(c.who, c.look || c.who); }
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
// More (2026-09-27, "Caramelldansen"): a shot's `crowd` can be a list (each its own pool and pose); `ring: [cx, cz, r]`
// puts n copies on `rows` circles `dr` m apart round a point (a Bon Odori ring round the festival tower), facing
// `face`: 'in' (the centre), 'out', 'cw' / 'ccw' (walking round it), `a0` (deg) turns the ring and `spin` (deg over the
// shot) walks it round; `lookAt: [x, z]` turns every copy to one point (the stare); `y0` + `dy` raise the rows onto
// tiered shelves (row r stands at y0 + r * dy: the lucky-cat display); `arm`/`aim`/`flap`/`sway` as for actors.
const CROWDS = {}, crowdKey = (c, i) => c.who + ':' + (c.look || c.who) + (c.pale ? '~' + c.pale : '') + '#' + i;   // one pool per look (and paleness) and per slot in the shot's list
if (tripo && EP) for (const sh of EP.shots) for (const [ci, c] of [].concat(sh.crowd || []).entries()) {
  const look = c.look || c.who, key = crowdKey(c, ci), D = CREW[c.who];
  if (!D || !D.outfits?.[look]?.length) { console.error('crowd: look not loaded', key); continue; }
  if (!CROWDS[key]) {
    const root = SkeletonUtils.clone(tripo.root), holder = new THREE.Group(); holder.add(root);
    root.traverse(o => { if (o.isSkinnedMesh) o.visible = false; });
    const R = rig(holder, root, tripo.clips, tripo.faceCache); let body = null; root.traverse(o => { if (o.isSkinnedMesh && !body) body = o; });
    holder.scale.setScalar(D.scale || 1); scene.add(holder);
    // pale: porcelain statues, the look washed towards white (own materials that still share the scene's light uniforms)
    const mats = new Map(D.outfits[look].map(m => [m, !c.pale ? m.material : new THREE.ShaderMaterial({ vertexShader: m.material.vertexShader, fragmentShader: m.material.fragmentShader, side: m.material.side, uniforms: { ...m.material.uniforms, uPale: { value: c.pale } } })]));
    CROWDS[key] = { R, body, D, look, mats, copies: [], shadows: [] };
  }
  const C = CROWDS[key];
  while (C.copies.length < Math.min(99, c.n || 99)) {
    C.copies.push(D.outfits[look].map(m => { const k = new THREE.SkinnedMesh(m.geometry, C.mats.get(m)); k.userData.part = m.userData.part; k.bindMode = THREE.DetachedBindMode; k.bind(C.body.skeleton, m.bindMatrix); k.matrixAutoUpdate = false; k.frustumCulled = false; k.visible = false; scene.add(k); return k; }));
    C.shadows.push(makeShadow());
  }
}
const MAP_KIT = { THREE, mat, tex, px, noise, box, selfLit, U, TAU, beat: bp };
const PRINT_MAT = mat({ color: 0x6a8aa8, unlit: 0.6 }), PRINT1_MAT = mat({ color: 0x6a8aa8, unlit: 0.6 });   // an instant print's picture ("DtMF"): its photos, loaded below
const MAPS = { street: buildStreet(), beach: buildBeach(), ...buildMoreMaps(MAP_KIT), ...buildIndoorMaps(MAP_KIT), ...buildOutdoorMaps(MAP_KIT), ...buildSeaMaps(MAP_KIT), ...buildClubMaps(MAP_KIT), ...buildTechnoMaps(MAP_KIT), ...buildPirateMaps(MAP_KIT), ...buildPlaneMaps(MAP_KIT), ...buildDieYoungMaps(MAP_KIT), ...buildMatsuriMaps(MAP_KIT), ...buildBubbleMaps(MAP_KIT), ...buildPatientMaps(MAP_KIT), ...buildPoolMaps(MAP_KIT), ...buildStudioMaps(MAP_KIT), ...buildWarehouseMaps(MAP_KIT), ...buildNoirMaps(MAP_KIT), ...buildWorldCupMaps(MAP_KIT), ...buildPlayaMaps(MAP_KIT), ...buildEstateMaps(MAP_KIT), ...buildSelfAwareMaps(MAP_KIT), ...buildShipMaps(MAP_KIT), ...buildWeddingMaps(MAP_KIT), ...buildBobsledMaps(MAP_KIT), ...buildTowerMaps(MAP_KIT), ...buildAgencyMaps(MAP_KIT), ...buildParkMaps(MAP_KIT), ...buildCemeteryMaps(MAP_KIT), ...buildCanyonMaps(MAP_KIT), ...buildScrubMaps(MAP_KIT), ...buildFotoMaps(MAP_KIT), ...buildGoldenMaps(MAP_KIT), ...buildTonkMaps(MAP_KIT), ...buildAptMaps(MAP_KIT), ...buildComicMaps(MAP_KIT), ...buildLondonMaps(MAP_KIT), ...buildMansionMaps(MAP_KIT), ...buildResortMaps(MAP_KIT), ...buildPiazzaMaps(MAP_KIT), ...buildSalonMaps(MAP_KIT) };
try {
  const pt = await new THREE.TextureLoader().loadAsync('assets/ui/bus_poster.png');
  pt.magFilter = pt.minFilter = THREE.NearestFilter; pt.generateMipmaps = false; pt.colorSpace = THREE.NoColorSpace;
  const u = MAPS.bus.posterMat.uniforms; u.map.value = pt; u.uUseMap.value = 1; u.uCol.value.set(0xffffff);
} catch (e) { console.warn('bus poster: none yet'); }
try {   // "DtMF": the perfect photo (a still of its last print, the bus poster's way) on the prints in paws and in the camera's slot
  const pt = await new THREE.TextureLoader().loadAsync('assets/ui/dtmf_print.png');
  pt.magFilter = pt.minFilter = THREE.NearestFilter; pt.generateMipmaps = false; pt.colorSpace = THREE.NoColorSpace;
  for (const m of [PRINT_MAT, MAPS.marquesina.printMat]) { const u = m.uniforms; u.map.value = pt; u.uUseMap.value = 1; u.uCol.value.set(0xffffff); }
  const p1 = await new THREE.TextureLoader().loadAsync('assets/ui/dtmf_print1.png');
  p1.magFilter = p1.minFilter = THREE.NearestFilter; p1.generateMipmaps = false; p1.colorSpace = THREE.NoColorSpace;
  { const u = PRINT1_MAT.uniforms; u.map.value = p1; u.uUseMap.value = 1; u.uCol.value.set(0xffffff); }
} catch (e) { console.warn('dtmf print: none yet'); }
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

const beatT = n => GRIDB ? GRIDB.time(n) : B0 + n * 60 / BPMv, barOf = t => Math.round(bp(t) / 4);
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
//     holdTo (the held prop goes at that second: it has been taken), noShadow, fg (a body across the lens: the QA's
//     framing rules skip it), reveal (s: off-frame allowed for the shot's first s seconds) }
function actorSpec(a, e, map) {
  const who = a.who || 'saxo', P = PARTNERS[who];
  return { who, look: a.look || (P ? P.byMap[map] || who : e.outfit || MAP_OUTFIT[map] || 'saxo'), clip: a.clip || e.clip || 'gangnam', at: a.at ?? e.at ?? 'auto',
    speed: a.speed ?? 1, once: !!a.once, x: a.x || 0, z: a.z || 0, mx: a.mx || 0, mz: a.mz || 0, face: a.face || 'camera', yaw: (a.yaw || 0) * Math.PI / 180, ground: a.ground || 'toe',
    lift: a.lift || 0, hold: a.hold || null, holdL: a.holdL || null, ride: a.ride || null, star: a.star !== false,
    arm: a.arm || null, aim: a.aim || 'up', upAt: a.upAt, upEnd: a.upEnd, wave: a.wave || 0,   // arm: L | R | both, aim: up | toast | phone | [x, y, z], wave: flap
    aim2: a.aim2 || null, aim2At: a.aim2At ?? null, toss: a.toss || null, cable: a.cable || null, holdFrom: a.holdFrom ?? null, holdTo: a.holdTo ?? null,
    // scale: a giant (the sea monster is a 16x Compote), my: metres risen (+) or sunk (-) from myAt s over myDur s
    // (smoothstep; default the whole shot), holdScale: the held prop's size (a carrot pinched in a giant's paw), noShadow
    fg: !!a.fg, reveal: a.reveal || 0, scale: a.scale || 1, my: a.my || 0, myAt: a.myAt || 0, myDur: a.myDur ?? null, holdScale: a.holdScale || 1, noShadow: !!a.noShadow, air: !!a.air,
    hat: a.hat || null, hatFrom: a.hatFrom ?? null, hatY: a.hatY ?? 0.7, bump: a.bump || 0, bumps: a.bumps || null, bumpAmp: a.bumpAmp ?? null, shove: a.shove || null, rideY: a.rideY ?? null, moveAt: a.moveAt || 0, rideYaw: (a.rideYaw || 0) * Math.PI / 180,
    // the beat-locked swings and sway (SWINGS, swayRoll), and holdAt: the actor freezes that many seconds into the shot
    // (clip, swing and sway), caught mid-move (2026-09-27; until then these fields never reached the actors)
    flap: a.flap ?? null, flapEvery: a.flapEvery || null, flapPh: a.flapPh || 0, sway: a.sway || 0, swayEvery: a.swayEvery || null, swayPh: a.swayPh || 0, holdAt: a.holdAt ?? null,
    gum: a.gum || null, splat: a.splat ?? null, buds: a.buds ?? null, bubble: a.bubble || null, moth: a.moth ?? null, mothPale: !!a.mothPale,   // "Dans ma bulle": bubble gum, its splat, earbuds, the dream bubble, a moth out of the wallet   // moveAt: the mx/mz walk starts that many seconds into the shot   // hat: a prop sitting on the head from hatFrom s (the juice glass upside down), bump: turbulence, jolted up on every beat (m)   // air: the shot means it off the floor (a slide down a rope)   // holdFrom: the held prop shows from that second of the shot   // aim2 from aim2At s (a yank), toss: the held prop flies off, cable: [x, y, z] the held plug's cable runs to
    // "Patient Zero" (2026-09-27): the sick look's face props, a red nose (true, or from s into the shot), a thermometer
    // in the mouth and a surgical mask, and a sneeze: a spray out of the nose s into the shot
    nose: a.nose ?? null, therm: !!a.therm, mask: !!a.mask, sleep: !!a.sleep, sneeze: a.sneeze ?? null,
    // "Danza Kuduro" (2026-10-09): cucumber slices over the eyes (true, or from s into the shot): the spa day's nap
    cucumbers: a.cucumbers ?? null,
    // "Espresso" (2026-10-09 2nd): cartoon wide eyes, jittering, when the espresso hits (true, s into the shot, or { at, off, r });
    // aimSeq [[s, aim], [s, aimL, aimR], ...]: the arms snap to each aim from its second (the song's up, down, left, right)
    googly: a.googly ?? null, aimSeq: a.aimSeq || null,
    // "Beauty And A Beat" (2026-09-27): what a held rescue hook reaches, [x, y, z] or a character's name (its collar, at the head bone)
    hookTo: a.hookTo ?? null, waveRate: a.waveRate || 0, dip: a.dip || null,
    // "Love Me Not" (2026-09-28): studio headphones on the head, and how many of a held daisy's 12 petals are left
    phones: !!a.phones, petalsLeft: a.petalsLeft ?? null, petalFall: a.petalFall ?? null, pluckEvery: a.pluckEvery || null,
    armB: a.armB || null, aimB: a.aimB || null,   // armB + aimB: the other arm's own aim or swing (one paw holds, the other plucks)
    // "Hootie Frutti" (2026-09-28): a volley of fruit thrown on given seconds of the shot (peltFruit)
    pelt: a.pelt || null,
    // "Vamos a la playa" (2026-09-29): hop: [m, beats] hops of that height, one every that many beats (0.5 = two a
    // beat), a parabola off the floor, the shadow shrinking under it (the hot-sand hop); hopPh shifts it
    hop: a.hop || null, hopPh: a.hopPh || 0,
    noLie: !!a.noLie, dizzy: a.dizzy ?? null,
    shades: a.shades ?? null, visor: !!a.visor,   // "Poker Face" (2026-10-08 2nd): dark sunglasses (true, s: dropped onto the eyes landing s into the shot, { at, off }: flown off at off), the dealer's green visor
    hideParts: a.hideParts || null, chew: a.chew ?? null, tongue: a.tongue ?? null, treat: a.treat || null, ballMouth: a.ballMouth ?? null, steakMouth: a.steakMouth ?? null, sip: a.sip ?? null, sipHand: a.sipHand || 'R',   // "Spooky, Scary Skeletons": a skeleton's parts taken away (src/bones.js BONE_PARTS); chew: a bone across the mouth (true or from s)   // dizzy: true or from s, cartoon stars circling the head ("we fell in love in october")
    lean: (a.lean || 0) * Math.PI / 180 };   // lean: deg pitched forward from the feet ("Jamaican (Bam Bam)": shoving a bathtub, the body leaned into it)   // noLie: never settle as lying (a crawl on all fours sank to its nose, 2026-09-28)
}
function planShots() {
  if (EP) return episodeShots();
  const dur = CONFIG.duration, beats = Math.floor(bp(dur)), L = window.LYRICS || [], C = window.LINE_CHORUS || [];
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
  const n = Math.floor(bp(t) + 1e-6), tb = beatT(n), per = beatT(n + 1) - tb, tau = t - tb;   // the beat's own length (a tempo map moves it)
  if (n < 0 || BOUNCE === 0 || (half && n % 2)) return 0;
  const cutHit = Math.abs(tb - t0) < 0.02;   // this beat is the cut
  const amp = (((n % 4) + 4) % 4 === 0 ? 0.06 : 0.03) * (cutHit ? 1.6 : 1) * BOUNCE;
  const att = cutHit ? 1 : Math.min(1, tau / 0.06), env = tau < 0.06 ? att * att * (3 - 2 * att) : Math.exp(-(tau - 0.06) / (per * 0.28));
  return amp * env;
}

// ---- hand-placed actors (a shot's `actors`, see actorSpec) with props in their paws ----
// Props are low-poly primitives, one per character and kind, placed in world space from the paw bones every frame
// (so they stay pure in t): drinks stay upright like a real glass, the phone is held screen-in, the pad sits between
// both paws, the foam finger follows the forearm. A jet-ski is fitted under a seated rider from his hips and paws.
const PROPS = {}; if (window.DBG) window.DBG.PROPS = PROPS;
const _pa = new THREE.Vector3(), _pb = new THREE.Vector3(), _pc = new THREE.Vector3(), _pd = new THREE.Vector3(), _up = new THREE.Vector3(0, 1, 0);
function propMesh(kind) {
  if (FRUITS.includes(kind) || kind === 'strawberry' || kind === 'fruitsign') return fruitMesh(MAP_KIT, kind);   // fruit in paws and in flight, the FRUIT ONLY placard (src/fruit.js)
  const G = new THREE.Group(), M = c => mat({ color: c }), glow = c => mat({ color: c, unlit: 1 }), at3 = (m, x, y, z) => { m.position.set(x, y, z); return m; };
  const cyl = (rt, rb, h, m, seg = 6) => new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), m);
  const add = (m, x = 0, y = 0, z = 0) => { m.position.set(x, y, z); G.add(m); return m; };
  if (kind === 'espresso') {      // "Espresso": a white demitasse of black coffee on its saucer, held level like a drink
    add(new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.045, 0.07, 8, 1, true), mat({ color: 0xfafaf6, side: THREE.DoubleSide })), 0, 0.045); add(cyl(0.056, 0.056, 0.004, M(0x3a2414), 8), 0, 0.07);   // open-topped: a closed cup's top z-fought the coffee (a white wedge in it)
    add(cyl(0.095, 0.09, 0.012, M(0xfafaf6), 10), 0, 0.006);
    add(new THREE.Mesh(new THREE.TorusGeometry(0.024, 0.008, 4, 6, Math.PI), M(0xfafaf6)), 0.066, 0.05).rotation.z = -Math.PI / 2;
  } else if (kind === 'handset') {   // "Espresso": a red 1960s telephone handset held upright at the ear (a smartphone read as a pink card; a black one read as a hole in the wall), its cups bent to the face, a coiled cord
    const R = mat({ color: 0xd0303a, unlit: 0.3 });
    add(box(0.055, 0.24, 0.05, R)); add(box(0.09, 0.07, 0.08, R), 0, 0.13, 0.04); add(box(0.09, 0.07, 0.08, R), 0, -0.13, 0.04);
    for (let i = 0; i < 5; i++) { const c = new THREE.Mesh(new THREE.TorusGeometry(0.022, 0.007, 3, 8), R); c.rotation.x = Math.PI / 2; add(c, 0, -0.19 - i * 0.03, 0.03); }
  } else if (kind === 'citation') {   // "Espresso": a police citation, a long narrow white slip with printed lines and a red stamp, held up beside the face
    add(box(0.13, 0.3, 0.008, mat({ color: 0xfafaf4, unlit: 0.45 })));
    for (let i = 0; i < 6; i++) add(box(0.09, 0.008, 0.002, M(0x5a5a64)), -0.005, 0.1 - i * 0.035, 0.005);
    add(box(0.05, 0.05, 0.002, mat({ color: 0xd8202a, unlit: 0.4 })), 0.025, -0.1, 0.005);
  } else if (kind === 'espressotray') {   // "Espresso": a round silver tray of four espressos, carried flat on one paw
    add(cyl(0.26, 0.26, 0.02, mat({ color: 0xe8ecf4, unlit: 0.3 }), 12), 0, 0.01);   // bigger and brighter: a small tray was lost against the counter
    for (const [x, z] of [[-0.11, -0.1], [0.11, -0.1], [-0.11, 0.1], [0.11, 0.1], [0, 0]]) { add(new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.038, 0.06, 8, 1, true), mat({ color: 0xfafaf6, side: THREE.DoubleSide })), x, 0.05, z); add(cyl(0.046, 0.046, 0.004, M(0x3a2414), 8), x, 0.072, z); }
  } else if (kind === 'coconut') {        // "Danza Kuduro": a coconut cocktail, a pink straw and a yellow paper umbrella
    const c = new THREE.Mesh(new THREE.SphereGeometry(0.08, 7, 5, 0, Math.PI * 2, 0, Math.PI * 0.62), M(0x7a4a2a)); add(c, 0, 0.05);
    add(new THREE.Mesh(new THREE.CircleGeometry(0.066, 7), M(0xf8f4ea)), 0, 0.083).rotation.x = -Math.PI / 2;
    add(cyl(0.008, 0.008, 0.17, M(0xff5fa2), 4), 0.025, 0.16).rotation.z = -0.3;
    add(new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.035, 6), M(0xffd43b)), -0.035, 0.2).rotation.z = 0.35;
  } else if (kind === 'brolly') {   // "Danza Kuduro": a little beach umbrella held up, blue and white panels, a white handle down to the paw
    add(cyl(0.012, 0.012, 0.5, M(0xf4f4f0), 4), 0, 0.25);
    for (let i = 0; i < 8; i++) { const p = new THREE.Mesh(new THREE.ConeGeometry(0.42, 0.16, 8, 1, true, i * Math.PI / 4, Math.PI / 4), mat({ color: i % 2 ? 0x2a6ae0 : 0xf6f6f2, side: THREE.DoubleSide })); p.position.y = 0.56; G.add(p); }
    add(new THREE.Mesh(new THREE.IcosahedronGeometry(0.025, 0), M(0xf4f4f0)), 0, 0.66);
  } else if (kind === 'coconutempty') {   // "Danza Kuduro": an empty coconut shell held up for a refill, tipped towards the lens
    const c = new THREE.Mesh(new THREE.SphereGeometry(0.08, 7, 5, 0, Math.PI * 2, 0, Math.PI * 0.62), M(0x7a4a2a)); add(c, 0, 0.05).rotation.x = 0.6;
    add(new THREE.Mesh(new THREE.CircleGeometry(0.066, 7), M(0xf8f4ea)), 0, 0.09, 0.03).rotation.x = -Math.PI / 2 + 0.6;
  } else if (kind === 'tray') {   // "Danza Kuduro": the waiter's round silver tray with four coconut cocktails, carried flat on one paw
    add(cyl(0.2, 0.2, 0.02, M(0xd8dce4), 12), 0, 0.01);
    for (const [x, z] of [[-0.09, -0.07], [0.09, -0.07], [-0.09, 0.08], [0.09, 0.08]]) { add(new THREE.Mesh(new THREE.SphereGeometry(0.06, 6, 4, 0, Math.PI * 2, 0, Math.PI * 0.62), M(0x7a4a2a)), x, 0.06, z); add(cyl(0.006, 0.006, 0.13, M(0xff5fa2), 4), x + 0.02, 0.13, z).rotation.z = -0.3; }
  } else if (kind === 'mic') {    // "Danza Kuduro": the entertainer's handheld mic, a black handle and a silver ball, up beside the muzzle
    add(cyl(0.022, 0.016, 0.16, M(0x1c1c22), 6), 0, 0.08); add(new THREE.Mesh(new THREE.IcosahedronGeometry(0.045, 1), M(0xc8ccd4)), 0, 0.18);
  } else if (kind === 'glass') {          // a tall glass of orange juice, pink straw, a lemon slice on the rim
    add(cyl(0.05, 0.04, 0.15, M(0xff9a2e)), 0, 0.075); add(cyl(0.053, 0.053, 0.02, M(0xf4fbff)), 0, 0.155);
    add(cyl(0.008, 0.008, 0.14, M(0xff5fa2), 4), 0.02, 0.2).rotation.z = -0.3; add(box(0.06, 0.014, 0.03, M(0xffd43b)), -0.045, 0.15).rotation.z = 0.5;
  } else if (kind === 'milkbottle') {   // a glass milk bottle, white with a blue cap and band ("APT.": the critic read the blue milk glass as soda)
    add(cyl(0.05, 0.05, 0.13, mat({ color: 0xf8f8f8, unlit: 0.55 })), 0, 0.065); add(cyl(0.03, 0.05, 0.05, mat({ color: 0xf8f8f8, unlit: 0.55 })), 0, 0.155); add(cyl(0.032, 0.032, 0.025, M(0x2a7ae8)), 0, 0.19);
    add(cyl(0.052, 0.052, 0.03, M(0x2a7ae8)), 0, 0.07);
  } else if (kind === 'redcup') {  // a red party cup with a white rim ("APT.": the clip's drinking game)
    add(cyl(0.06, 0.042, 0.15, M(0xe02a2a)), 0, 0.075); add(cyl(0.062, 0.062, 0.02, M(0xf6f6f6)), 0, 0.152);
  } else if (kind === 'milk') {    // a glass of milk (Kob stays in)
    add(cyl(0.052, 0.044, 0.16, M(0x6aa8e8)), 0, 0.08); add(cyl(0.046, 0.046, 0.02, M(0xffffff)), 0, 0.15); add(cyl(0.008, 0.008, 0.13, M(0xff5fa2), 4), 0.018, 0.2).rotation.z = -0.3;   // blue glass, white milk: a white glass vanished on her pyjamas
  } else if (kind === 'camera') {  // the private eye's camera, lens forward: a black body under a silver top, a big lens, a flash unit on top ("Billie Jean")
    add(box(0.16, 0.1, 0.07, M(0x1c1c22))); add(box(0.16, 0.028, 0.072, M(0xc8ccd4)), 0, 0.064);
    const lens = add(cyl(0.045, 0.05, 0.07, M(0x2a2a30), 10), 0.01, -0.005, 0.065); lens.rotation.x = Math.PI / 2;
    const glass = add(cyl(0.032, 0.032, 0.01, glow(0x5a7ab8), 10), 0.01, -0.005, 0.1); glass.rotation.x = Math.PI / 2;
    add(box(0.07, 0.05, 0.05, M(0xc8ccd4)), -0.035, 0.105); add(box(0.06, 0.036, 0.004, glow(0xffffff)), -0.035, 0.105, 0.027);
  } else if (kind === 'bucket') {   // a red bucket with a grey rim and handle, water inside ("SWIM": Compote bails the sea)
    add(cyl(0.13, 0.1, 0.22, M(0xd8382e), 8), 0, 0); add(cyl(0.135, 0.135, 0.02, M(0xb8bcc4), 8), 0, 0.11); add(cyl(0.118, 0.118, 0.01, mat({ color: 0x3aa8d8, unlit: 0.4 }), 8), 0, 0.085);
  } else if (kind === 'clock') {   // "Bring Me To Life": a red twin-bell alarm clock, its face forward; held ringing, it shakes (holdProp)
    const face = mat({ color: 0xfaf6ee }), ink = M(0x141414); add(cyl(0.11, 0.11, 0.08, M(0xe0282e), 10), 0, 0.12).rotation.x = Math.PI / 2; add(cyl(0.09, 0.09, 0.01, face, 10), 0, 0.12, 0.042).rotation.x = Math.PI / 2;
    add(box(0.012, 0.07, 0.01, ink), 0, 0.15, 0.05); add(box(0.05, 0.012, 0.01, ink), 0.02, 0.12, 0.05);
    for (const s of [-1, 1]) { add(new THREE.Mesh(new THREE.IcosahedronGeometry(0.06, 1), M(0xd8d8e0)), s * 0.08, 0.24); add(box(0.022, 0.07, 0.022, M(0x2a2a30)), s * 0.065, 0.02).rotation.z = s * 0.4; }
    G.userData.ring = [-1, 1].flatMap(s => [0, 1, 2].map(k => { const l = add(box(0.016, 0.075, 0.016, glow(0xffffff)), s * (0.2 + k * 0.025), 0.3 - k * 0.07); l.rotation.z = s * (0.5 + k * 0.45); return l; }));   // the ringing: strokes either side of the bells (a still reads it)
  } else if (kind === 'stopsign') {   // "Stop The Wedding!": a red STOP sign on a grey pole, held up beside the face like the FRUIT ONLY placard; an octagon on both faces (a planar UV keeps STOP upright)
    const face = mat({ map: tex(48, 48, x => drawStop(x), 2240), unlit: 0.6 }), oct = new THREE.CircleGeometry(0.23, 8, Math.PI / 8);
    add(new THREE.Mesh(oct, face), 0, 0.5, 0.008); add(new THREE.Mesh(oct, face), 0, 0.5, -0.008).rotation.y = Math.PI;
    add(cyl(0.016, 0.016, 0.5, M(0x9a9aa4), 4), 0, 0.12);
  } else if (kind === 'rose') {   // a red rose, the flower girl's ammunition: a faceted bloom, a green stem and a leaf
    add(new THREE.Mesh(new THREE.IcosahedronGeometry(0.06, 0), mat({ color: 0xe8203c, unlit: 0.35 })), 0, 0.2);
    for (let q = 0; q < 3; q++) add(box(0.05, 0.03, 0.05, mat({ color: 0xff4a6a, unlit: 0.35 })), Math.sin(q * 2.1) * 0.035, 0.22, Math.cos(q * 2.1) * 0.035).rotation.y = q;
    add(cyl(0.008, 0.008, 0.22, M(0x3a9a3a), 4), 0, 0.08); add(box(0.05, 0.01, 0.025, M(0x4ab04a)), 0.03, 0.08).rotation.z = 0.5;
  } else if (kind === 'bloom') {   // a rose head alone, for the volleys (in flight a stem read as a green stick in the thrower's mouth)
    add(new THREE.Mesh(new THREE.IcosahedronGeometry(0.075, 0), mat({ color: 0xe8203c, unlit: 0.4 })), 0, 0);
    for (let q = 0; q < 4; q++) add(box(0.06, 0.035, 0.06, mat({ color: 0xff4a6a, unlit: 0.4 })), Math.sin(q * 1.57) * 0.05, 0.03, Math.cos(q * 1.57) * 0.05).rotation.y = q;
    for (const q of [-1, 1]) add(box(0.06, 0.012, 0.03, M(0x4ab04a)), q * 0.06, -0.05, 0).rotation.z = q * 0.5;
  } else if (kind === 'bouquet') {   // the bride's bouquet: a dome of pink, white and red roses over a white-wrapped handle with a satin bow
    const cols = [0xff8ab8, 0xffffff, 0xe8203c, 0xffc8dc, 0xff5f9a, 0xfff0f6, 0xff8ab8];
    add(new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.18, 6), M(0xfaf6f0)), 0, 0.02).rotation.x = Math.PI;
    for (let q = 0; q < 7; q++) { const a = q / 6 * Math.PI * 2, r = q ? 0.07 : 0; add(new THREE.Mesh(new THREE.IcosahedronGeometry(0.05, 0), mat({ color: cols[q], unlit: 0.35 })), Math.sin(a) * r, 0.14 + (q ? 0 : 0.03), Math.cos(a) * r); }
    for (let q = 0; q < 5; q++) { const a = q / 5 * Math.PI * 2 + 0.3; add(box(0.05, 0.012, 0.025, M(0x5ab05a)), Math.sin(a) * 0.1, 0.1, Math.cos(a) * 0.1).rotation.y = a; }
    add(box(0.09, 0.03, 0.02, mat({ color: 0xff8ab8, unlit: 0.4 })), 0, 0.07, 0.05);
  } else if (kind === 'basket') {   // the flower girl's wicker basket of petals, hanging from the paw by its handle
    add(new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.09, 0.1, 8, 1, true), M(0xd8a860)), 0, -0.2);
    add(new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 0.01, 8), mat({ color: 0xff9ec4, unlit: 0.4 })), 0, -0.16);
    for (let q = 0; q < 4; q++) add(new THREE.Mesh(new THREE.IcosahedronGeometry(0.03, 0), mat({ color: q % 2 ? 0xffffff : 0xe8203c, unlit: 0.4 })), Math.sin(q * 1.6) * 0.06, -0.14, Math.cos(q * 1.6) * 0.06);
    const h = add(new THREE.Mesh(new THREE.TorusGeometry(0.1, 0.012, 3, 8, Math.PI), M(0xc89850)), 0, -0.15); h.rotation.y = Math.PI / 2;
  } else if (kind === 'handmirror') {   // Sadi's pink hand mirror held up beside her face ("Self Aware"): a silver glass on both faces in a pink rim, a pink handle
    const disc = add(cyl(0.1, 0.1, 0.025, mat({ color: 0xffb4dc, unlit: 0.6 }), 10), 0, 0.06); disc.rotation.x = Math.PI / 2;
    for (const fz of [-0.016, 0.016]) { const face = add(cyl(0.083, 0.083, 0.006, glow(0xe8f4ff), 10), 0, 0.06, fz); face.rotation.x = Math.PI / 2; }   // silver on both faces: from the lens its pink back read as a paddle
    add(box(0.035, 0.13, 0.025, mat({ color: 0xffb4dc, unlit: 0.6 })), 0, -0.08);
  } else if (kind === 'phone') {   // held up filming: screen towards the holder, flash on the back
    add(box(0.11, 0.2, 0.02, mat({ color: 0xffb4dc, unlit: 0.6 }))); add(box(0.094, 0.18, 0.004, glow(0x8fd8ff)), 0, 0, -0.012);   // a candy-pink case (0xff4f9a rendered dark plum at night; a black phone vanished against the shades)
    G.userData.led = add(box(0.03, 0.03, 0.004, glow(0xffffff)), -0.028, 0.07, 0.012);
  } else if (kind === 'deck') {    // a deck of cards between both paws ("Poker Face": the dealer shuffling): white edges, a red back on top
    add(box(0.11, 0.05, 0.15, M(0xf2eee6))); add(box(0.112, 0.004, 0.152, mat({ color: 0xc8202e, unlit: 0.3 })), 0, 0.026);
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
  } else if (kind === 'getwell') { // a get-well balloon on a 1.2 m string, clear above the holder's head ("Patient Zero": the short one read as a red cap)
    const b = new THREE.Mesh(new THREE.IcosahedronGeometry(0.2, 1), mat({ color: 0xe8243a, unlit: 0.35 })); b.scale.set(1, 1.2, 1); add(b, 0, 1.46); add(new THREE.Mesh(new THREE.ConeGeometry(0.035, 0.05, 4), mat({ color: 0xe8243a, unlit: 0.35 })), 0, 1.22);
    add(box(0.008, 1.2, 0.008, M(0xf0f0f0)), 0, 0.6);
  } else if (kind === 'carrot') {  // Compote's carrot: an orange cone, tip down, with a green top
    add(new THREE.Mesh(new THREE.ConeGeometry(0.045, 0.26, 5), M(0xff7a1a)), 0, -0.02).rotation.x = Math.PI; for (let k = 0; k < 3; k++) add(box(0.02, 0.1, 0.02, M(0x3fae47)), (k - 1) * 0.02, 0.15).rotation.z = (k - 1) * 0.4;
  } else if (kind === 'gcarrot') { // the cursed treasure: a golden carrot, self-lit so it glows gold (not orange) in the moonlight, green top
    add(new THREE.Mesh(new THREE.ConeGeometry(0.055, 0.3, 5), mat({ color: 0xffe23a, unlit: 1 })), 0, -0.03).rotation.x = Math.PI;
    add(box(0.012, 0.16, 0.02, mat({ color: 0xfffbe0, unlit: 1 })), 0.03, -0.02, 0.03).rotation.z = 0.12;   // a glint
    for (let k = 0; k < 3; k++) add(box(0.022, 0.11, 0.022, mat({ color: 0x5ad84a, unlit: 0.4 })), (k - 1) * 0.022, 0.16).rotation.z = (k - 1) * 0.45;
  } else if (kind === 'comic') {   // "Take on Me": the comic Sadi reads, open between both paws: two pages in a V (panels inked on them) over a cover printed with the racer's 13
    const pageT = tex(24, 32, x => { x.fillStyle = '#f6f4ec'; x.fillRect(0, 0, 24, 32); x.strokeStyle = '#1c2030'; x.lineWidth = 1; for (const [a, b, w, h] of [[2, 2, 20, 12], [2, 16, 9, 14], [13, 16, 9, 14]]) x.strokeRect(a + 0.5, b + 0.5, w, h); x.fillStyle = '#5a6480'; x.fillRect(5, 7, 12, 3); });
    const coverT = tex(24, 32, x => { x.fillStyle = '#ffd43b'; x.fillRect(0, 0, 24, 32); x.fillStyle = '#ffffff'; x.beginPath(); x.arc(12, 17, 8, 0, Math.PI * 2); x.fill(); x.fillStyle = '#1c2030'; x.font = 'bold 9px monospace'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('13', 12, 18); x.fillStyle = '#d8343e'; x.fillRect(0, 0, 24, 6); });
    for (const s of [-1, 1]) { const h = new THREE.Group(); h.add(at3(box(0.15, 0.012, 0.21, mat({ map: coverT, unlit: 0.35 })), s * 0.075, 0, 0)); h.add(at3(box(0.14, 0.02, 0.19, mat({ map: pageT, unlit: 0.3 })), s * 0.072, 0.015, 0)); h.rotation.z = -s * 0.32; G.add(h); }
  } else if (kind === 'wrench') {  // "Take on Me": the rival's giant spanner, held upright like a club: a red handle, an open C-shaped steel head (a square pipe-wrench jaw read as a letter F)
    const steel = mat({ color: 0xb8bec8, unlit: 0.3 });
    add(box(0.07, 0.62, 0.05, mat({ color: 0xd8343e, unlit: 0.3 })), 0, 0.22); add(box(0.075, 0.1, 0.055, steel), 0, 0.57);
    const head = add(new THREE.Mesh(new THREE.TorusGeometry(0.12, 0.04, 4, 10, Math.PI * 1.45), steel), 0, 0.72); head.rotation.z = Math.PI * 0.5 + Math.PI * 0.275;   // the C opens upwards
  } else if (kind === 'book') {    // Kob's book, open between both paws: two page halves in a V over a red cover (a flat slab read as a board)
    for (const s of [-1, 1]) { const h = new THREE.Group(); h.add(at3(box(0.13, 0.012, 0.19, M(0xc8243a)), s * 0.065, 0, 0)); h.add(at3(box(0.12, 0.02, 0.17, M(0xfaf4e4)), s * 0.062, 0.015, 0));
      for (let k = 0; k < 3; k++) h.add(at3(box(0.08, 0.004, 0.012, M(0x7a7a8a)), s * 0.065, 0.027, -0.05 + k * 0.045)); h.rotation.z = -s * 0.32; G.add(h); }
  } else if (kind === 'juicehat') { // the juice glass upside down on a head (worn flipped): clear glass, the orange juice spilt round its rim, drips down
    add(cyl(0.048, 0.058, 0.16, mat({ color: 0xd8f0ff, unlit: 0.3 })), 0, 0.09); add(cyl(0.05, 0.05, 0.02, M(0xbfe4ff)), 0, 0.005);   // the glass, its base at y = 0 (up in the air once worn)
    add(cyl(0.14, 0.13, 0.03, M(0xff9a2e)), 0, 0.172); add(cyl(0.045, 0.055, 0.05, M(0xff9a2e)), 0, 0.14);   // juice spilt round the rim and the last of it inside
    [[0.11, 0, 0.13], [-0.1, 0.05, 0.1], [0.02, 0.12, 0.2], [-0.04, -0.12, 0.08]].forEach(([x, z, l]) => add(box(0.028, l, 0.028, M(0xff8a1a)), x, 0.18 + l / 2, z));   // drips past the rim: down the head once flipped
  } else if (kind === 'instant') {   // "DtMF": a mint instant camera, lens forward (+z), a flash window, a red self-timer light; the print slot on top
    add(box(0.2, 0.15, 0.09, mat({ color: 0x8ee0c8, unlit: 0.3 }))); add(box(0.2, 0.025, 0.092, M(0xf2f6f4)), 0, 0.065);
    const lens = add(cyl(0.05, 0.054, 0.05, M(0x24282c), 10), 0, -0.008, 0.06); lens.rotation.x = Math.PI / 2;
    const glass = add(cyl(0.034, 0.034, 0.01, glow(0x3a5a8a), 10), 0, -0.008, 0.087); glass.rotation.x = Math.PI / 2;
    add(box(0.055, 0.028, 0.006, glow(0xffffff)), -0.06, 0.048, 0.047); add(box(0.026, 0.026, 0.006, M(0x24282c)), 0.065, 0.048, 0.047); add(box(0.016, 0.016, 0.006, glow(0xff2a2a)), 0.07, -0.05, 0.047);
  } else if (kind === 'glove') {     // "DtMF": a red boxing glove (Compote's spare, thrown at the camera): a padded fist, a thumb, a dark red cuff
    const red = mat({ color: 0xe02a2a, unlit: 0.35 }), fist = new THREE.Mesh(new THREE.IcosahedronGeometry(0.1, 1), red); fist.scale.set(1.0, 1.15, 0.9); add(fist, 0, 0.1);
    add(new THREE.Mesh(new THREE.IcosahedronGeometry(0.045, 1), red), 0.08, 0.06, 0.03); add(cyl(0.07, 0.075, 0.07, mat({ color: 0xa81818, unlit: 0.3 }), 8), 0, -0.02); add(cyl(0.076, 0.076, 0.015, M(0xf4f4f0), 8), 0, 0.012);   // a dark red cuff, one white band (a white cuff read as a grey pipe)
  } else if (kind === 'polaroid' || kind === 'polaroid1') {  // "DtMF": an instant print held up: a white card, its picture one of the episode's own photos on both faces (polaroid: the perfect one, assets/ui/dtmf_print.png; polaroid1: the first failure, dtmf_print1.png)
    const pm = kind === 'polaroid1' ? PRINT1_MAT : PRINT_MAT; add(box(0.19, 0.23, 0.01, M(0xf6f3ea)));
    add(new THREE.Mesh(new THREE.PlaneGeometry(0.16, 0.16), pm), 0, 0.02, 0.0062); add(new THREE.Mesh(new THREE.PlaneGeometry(0.16, 0.16), pm), 0, 0.02, -0.0062).rotation.y = Math.PI;
  } else if (kind === 'ticket') {  // a boarding pass held up: white card, a pink band, a black barcode (it must read at 270x480)
    add(box(0.17, 0.25, 0.012, M(0xfafafa))); add(box(0.172, 0.07, 0.014, M(0xff5fa2)), 0, 0.085); for (let k = 0; k < 5; k++) add(box(0.012, 0.07, 0.016, M(0x1a1a1a)), -0.05 + k * 0.025, -0.07);
  } else if (kind === 'bachi') {   // a taiko stick along the forearm, red lacquer with a white grip (festival drummer, 2026-09-27; pale wood vanished against the shoji)
    add(box(0.04, 0.42, 0.04, mat({ color: 0xb8241a, unlit: 0.3 })), 0, 0.17); add(box(0.048, 0.1, 0.048, M(0xf4f0e8)), 0, -0.02);
  } else if (kind === 'dstick') {   // a drumstick along the forearm: pale maple, a lighter tip ("Love Me Not", 2026-09-28: pale reads in the dark studio)
    add(box(0.03, 0.4, 0.03, mat({ color: 0xe8c890, unlit: 0.25 })), 0, 0.16); add(box(0.036, 0.05, 0.036, M(0xf8f0dc)), 0, 0.37);
  } else if (kind === 'guitar') {   // Sadi's red electric guitar along +x from its body, its face towards +z (holdProp lays the neck from the strumming paw to the fretting paw)
    // the silhouette carries it (a pickguard with two dark pickups side by side read as a sleepy face, the reviewer): the
    // lower bout, the waist, two horns reaching along the neck, a white pickguard sweep, a long maple neck with frets
    const red = mat({ color: 0xe0203a, unlit: 0.2 }), maple = M(0xf0d890), white = M(0xf4f2ea), dark = M(0x2a2a2a);
    add(box(0.2, 0.26, 0.05, red), -0.12, 0); add(box(0.1, 0.19, 0.05, red), -0.01, 0.0);            // the lower bout and the waist
    add(box(0.09, 0.05, 0.05, red), 0.07, 0.07).rotation.z = 0.35; add(box(0.07, 0.045, 0.05, red), 0.06, -0.07).rotation.z = -0.3;   // the two horns
    add(box(0.13, 0.07, 0.052, white), -0.1, -0.06).rotation.z = 0.45;                             // the pickguard sweep
    add(box(0.02, 0.1, 0.054, dark), -0.16, 0.0);                                                   // the bridge, across
    add(box(0.4, 0.036, 0.032, maple), 0.3, 0.0, 0.004);                                            // the neck
    for (let i = 0; i < 6; i++) add(box(0.006, 0.038, 0.034, M(0x9a8a60)), 0.14 + i * 0.055, 0.0, 0.005);   // frets
    add(box(0.1, 0.055, 0.026, maple), 0.54, 0.012, 0.004).rotation.z = 0.15;                       // the headstock
  } else if (kind === 'acoustic') {   // "Choosin' Texas" (2026-10-06 2nd): the singer's acoustic guitar, like the red one along +x from its body, its face to +z: a honey sunburst body (two bouts and a dark rim), the sound hole, the bridge, a long brown neck
    const honey = mat({ color: 0xe8a84a, unlit: 0.25 }), rim = M(0x5a2e14), neck = M(0x7a4a2a), dk = M(0x1a120c);
    for (const [x, r] of [[-0.12, 0.16], [0.06, 0.12]]) { add(cyl(r + 0.012, r + 0.012, 0.06, rim, 12), x, 0).rotation.x = Math.PI / 2; add(cyl(r, r, 0.064, honey, 12), x, 0).rotation.x = Math.PI / 2; }
    add(cyl(0.048, 0.048, 0.068, dk, 10), -0.02, 0, 0.002).rotation.x = Math.PI / 2;     // the sound hole
    add(box(0.03, 0.12, 0.07, dk), -0.19, 0, 0.002);                                     // the bridge
    add(box(0.4, 0.036, 0.034, neck), 0.33, 0.0, 0.006);                                // the neck
    for (let i = 0; i < 6; i++) add(box(0.006, 0.038, 0.036, M(0xc8b890)), 0.18 + i * 0.05, 0.0, 0.007);   // frets
    add(box(0.1, 0.06, 0.03, neck), 0.57, 0.01, 0.006).rotation.z = 0.15;              // the headstock
  } else if (kind === 'steak' || kind === 'board') {   // "Choosin' Texas": a cutting board with the Texas-shaped steak on it (or empty), carried in both paws
    add(box(0.42, 0.03, 0.34, M(0xd8a868)), 0, 0); add(box(0.4, 0.008, 0.32, M(0xb8884a)), 0, 0.016);
    if (kind === 'steak') { const st = texasSteak(MAP_KIT, 0.36); st.position.y = 0.02; G.add(st); }
  } else if (kind === 'daisy') {    // a daisy held up by its stem, its face tilted up; the actor's petalsLeft of 12 petals show (Kob plucks them: love me, love me not)
    add(box(0.012, 0.2, 0.012, M(0x3a8a3a)), 0, 0.06);   // a short stem: held at the chest, the head sits under her chin (longer, it covered her eye)
    const face = add(new THREE.Group(), 0, 0.17, 0.02); face.rotation.x = -0.6;
    const c = cyl(0.032, 0.032, 0.02, mat({ color: 0xffc820, unlit: 0.4 }), 8); c.rotation.x = Math.PI / 2; face.add(c);
    const pm = mat({ color: 0xffffff, unlit: 0.45 }); G.userData.petals = [];
    for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2, p = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.08, 0.008), pm); p.position.set(Math.sin(a) * 0.068, Math.cos(a) * 0.068, 0); p.rotation.z = -a; face.add(p); G.userData.petals.push(p); }
  } else if (kind === 'goldfish') {   // a festival goldfish in a water bag, hanging from the paw by its knot (it must read at 270x480: a bright fish)
    const bag = new THREE.Mesh(new THREE.IcosahedronGeometry(0.1, 1), mat({ color: 0xe4f6ff, unlit: 0.45 })); bag.scale.set(1, 1.2, 0.7); add(bag, 0, -0.17);
    add(box(0.15, 0.012, 0.075, mat({ color: 0x8fd8ff, unlit: 0.5 })), 0, -0.12, 0.0);   // the water line
    add(box(0.1, 0.055, 0.02, mat({ color: 0xff6a10, unlit: 0.9 })), 0.012, -0.19, 0.078); add(box(0.04, 0.05, 0.02, mat({ color: 0xff3010, unlit: 0.9 })), -0.058, -0.19, 0.078);   // the fish, on the bag's front
    add(box(0.016, 0.016, 0.02, M(0x101010)), 0.045, -0.18, 0.09);
    add(box(0.035, 0.07, 0.035, M(0xff5fa2)), 0, -0.04);
  } else if (kind === 'wata') {   // cotton candy: a big pink cloud on a stick
    add(box(0.016, 0.26, 0.016, M(0xf4f0e8)), 0, 0.08);
    for (const [x, y, z, r] of [[0, 0.3, 0, 0.12], [0.07, 0.26, 0.02, 0.08], [-0.07, 0.27, -0.01, 0.085], [0.01, 0.37, 0.02, 0.07]]) add(new THREE.Mesh(new THREE.IcosahedronGeometry(r, 0), mat({ color: 0xffb0d8, unlit: 0.4 })), x, y, z);
  } else if (kind === 'carrotpoke') {   // Compote's carrot held like a pin, tip first along the forearm ("Dans ma bulle": she pops his bubble with it)
    add(new THREE.Mesh(new THREE.ConeGeometry(0.045, 0.26, 5), M(0xff7a1a)), 0, 0.2); for (let k = 0; k < 3; k++) add(box(0.02, 0.1, 0.02, M(0x3fae47)), (k - 1) * 0.02, 0.03).rotation.z = (k - 1) * 0.4;
  } else if (kind === 'stone') {   // a flat grey pebble for skimming (2026-09-27, "Dans ma bulle": it sinks at once)
    const p = new THREE.Mesh(new THREE.IcosahedronGeometry(0.085, 0), mat({ color: 0xe4ded2, unlit: 0.45 })); p.scale.set(1, 0.45, 0.85); add(p);   // pale and a little self-lit: a grey one vanished against the coat at night
  } else if (kind === 'paperball') {   // "Animal" (2026-10-03): a crumpled sheet of office paper, tossed at the bin and fetched (white and a little self-lit: it must read against the dark office)
    add(new THREE.Mesh(new THREE.IcosahedronGeometry(0.1, 0), mat({ color: 0xffffff, unlit: 0.85 })));
    for (const [x, y, z] of [[0.07, 0.04, 0.02], [-0.06, -0.04, 0.05], [0.01, 0.06, -0.06]]) add(new THREE.Mesh(new THREE.IcosahedronGeometry(0.05, 0), mat({ color: 0xf0f0ea, unlit: 0.8 })), x, y, z);
  } else if (kind === 'wallet') {  // an open wallet between both paws, empty: two red leather halves in a V (a brown one vanished on the black turtleneck), pale card slots
    for (const sd of [-1, 1]) { const h = new THREE.Group(); h.add(at3(box(0.11, 0.014, 0.085, M(0xc8322a)), sd * 0.056, 0, 0)); h.add(at3(box(0.09, 0.018, 0.02, M(0xf2d8b0)), sd * 0.056, 0.012, -0.022)); h.add(at3(box(0.09, 0.018, 0.02, M(0xf2d8b0)), sd * 0.056, 0.012, 0.012)); h.rotation.z = -sd * 0.35; G.add(h); }
  } else if (kind === 'plug') {    // the booth's big yellow power plug, pins forward (a little self-lit: it must read in the blackout)
    add(box(0.14, 0.14, 0.2, mat({ color: 0xffd21f, unlit: 0.85 }))); add(box(0.16, 0.05, 0.05, M(0x2a5ad8)), 0, 0, -0.08); for (const x of [-0.035, 0.035]) add(box(0.02, 0.02, 0.07, M(0xd8d8e0)), x, 0, 0.13);
  } else if (kind === 'partyhat') {   // "Patient Zero": a striped party cone, built upside down (wearHat flips hats: the tip at the anchor, the brim below it)
    const c = new THREE.Mesh(new THREE.ConeGeometry(0.075, 0.2, 6), mat({ color: 0xff5fa2, unlit: 0.35 })); c.rotation.x = Math.PI; add(c, 0, 0.1);
    for (const y of [0.07, 0.13]) add(cyl(0.075 * y / 0.2 + 0.006, 0.075 * (y + 0.02) / 0.2 + 0.006, 0.02, mat({ color: 0xffd43b, unlit: 0.35 })), 0, y);
    add(new THREE.Mesh(new THREE.IcosahedronGeometry(0.032, 0), mat({ color: 0x3fd4ff, unlit: 0.5 })), 0, -0.005);
  } else if (kind === 'icepack') {    // a blue ice bag on a feverish head (worn flipped too), its white cap to one side
    const b = new THREE.Mesh(new THREE.IcosahedronGeometry(0.11, 1), mat({ color: 0x5aa8f0, unlit: 0.35 })); b.scale.set(1.05, 0.72, 0.95); add(b, 0, 0.07);
    add(cyl(0.03, 0.03, 0.04, mat({ color: 0xf4f4f4, unlit: 0.3 })), 0.1, 0.02).rotation.z = 1.2;
  } else if (kind === 'thermo') {     // a thermometer held up to read: white glass, a red column, a silver bulb
    add(box(0.035, 0.26, 0.035, mat({ color: 0xf6fbff, unlit: 0.5 })), 0, 0.1); add(box(0.018, 0.2, 0.04, mat({ color: 0xff2a2a, unlit: 0.8 })), 0, 0.12); add(box(0.05, 0.05, 0.05, M(0xc8ccd4)), 0, -0.04);
  } else if (kind === 'selfie') {     // "Beauty And A Beat": a selfie stick along the forearm, an action camera at its end looking back at the holder, its red REC light on
    add(box(0.032, 1.15, 0.032, M(0x1a1a22)), 0, 0.575); add(box(0.055, 0.14, 0.055, M(0x2a2a30)), 0, 0.03);
    add(box(0.13, 0.1, 0.11, M(0x3a3a46)), 0, 1.2); add(box(0.06, 0.06, 0.02, mat({ color: 0x8fd8ff, unlit: 1 })), 0, 1.2, -0.06); add(box(0.024, 0.024, 0.02, mat({ color: 0xff2a2a, unlit: 1 })), 0.04, 1.23, 0.06);
  } else if (kind === 'selfiepov') {  // the same stick seen from its own camera: a bare pole running from the paw out of the frame (the near end clipped by the lens)
    add(box(0.032, 3.0, 0.032, M(0x1a1a22)), 0, 1.5); add(box(0.055, 0.14, 0.055, M(0x2a2a30)), 0, 0.03);
  } else if (kind === 'hook') {       // the lifeguard's rescue pole: aluminium, a red crook at its far end (holdProp stretches it to what it hooks)
    G.userData.pole = add(box(0.045, 1, 0.045, M(0xd8dce4)), 0, 0.5);
    const crook = new THREE.Group(), arc = new THREE.Mesh(new THREE.TorusGeometry(0.19, 0.04, 4, 9, Math.PI), M(0xe8243a)); arc.position.x = -0.19; crook.add(arc); G.userData.crook = crook; G.add(crook);
  } else if (kind === 'brush') {      // "BIRDS OF A FEATHER": the bather's scrub brush, along the forearm: a wooden handle, a bristle block at its end
    add(box(0.05, 0.3, 0.05, M(0xc8935a)), 0, 0.15); add(box(0.16, 0.08, 0.1, M(0xd8a868)), 0, 0.32); add(box(0.15, 0.06, 0.1, M(0xf2f2ea)), 0, 0.38);
  } else if (kind === 'scissors') {   // "BIRDS OF A FEATHER": the groomer's steel scissors, held up beside the face, snipping on the beat (holdProp opens and shuts the blades)
    const steelM = mat({ color: 0xe8eef6, unlit: 0.45 }), ringM = M(0xe8547a);
    for (const sd of [-1, 1]) {
      const bl = new THREE.Group(); bl.add(at3(box(0.035, 0.26, 0.012, steelM), 0, 0.13, 0)); bl.add(at3(new THREE.Mesh(new THREE.TorusGeometry(0.04, 0.012, 4, 8), ringM), 0, -0.05, 0)); G.add(bl); (G.userData.blades ||= []).push(bl);
    }
  } else if (kind === 'leash') {      // "BIRDS OF A FEATHER": a pink lead from the paw to a collar, taut (holdProp stretches it like the hook), a loop in the paw and a chrome clip at the collar
    G.userData.pole = add(box(0.032, 1, 0.032, mat({ color: 0xff4f9a, unlit: 0.45 })), 0, 0.5);
    const loop = new THREE.Mesh(new THREE.TorusGeometry(0.06, 0.016, 4, 8), mat({ color: 0xff4f9a, unlit: 0.45 })); loop.position.y = -0.04; G.add(loop);
    const clip = new THREE.Group(); clip.add(new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.07, 0.05), M(0xd8dde6))); G.userData.crook = clip; G.add(clip);
  } else if (kind === 'mapleleaf') {  // "we fell in love in october": a big red maple leaf held up like a rose, its stem in the paw: serrated lobes and a dark midrib (a five-point star read as a red star, the critic)
    const lf = new THREE.Mesh(MAPLE_GEO, mat({ color: 0xff4a1e, unlit: 0.5, side: THREE.DoubleSide })); lf.scale.setScalar(0.34); lf.position.y = 0.2; G.add(lf);
    const vein = mat({ color: 0x9a1a10, unlit: 0.4, side: THREE.DoubleSide });
    for (const [a, l] of [[0, 0.3], [0.95, 0.24], [-0.95, 0.24], [1.75, 0.16], [-1.75, 0.16]]) { const v = new THREE.Mesh(new THREE.PlaneGeometry(0.012, l), vein); v.position.set(Math.sin(a) * l / 2, 0.2 + Math.cos(a) * l / 2, 0.003); v.rotation.z = -a; G.add(v); }
    add(box(0.016, 0.22, 0.016, M(0x7a4a22)), 0, 0.09);
  } else if (kind === 'rake') {       // "we fell in love in october": the park keeper's leaf rake, a pale wooden handle (holdProp stretches it to the tines' tips on the ground) and a green fan of tines
    G.userData.pole = add(box(0.045, 1, 0.045, M(0xc8935a)), 0, 0.5);
    const head = new THREE.Group(), tm = M(0x2e9a44); G.userData.rakeHead = head; G.add(head);
    head.add(at3(new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.08, 0.06), tm), 0, 0.02, 0));
    for (let i = 0; i < 11; i++) { const tip = new THREE.Vector3((i / 10 - 0.5) * 0.6, 0.3, 0), tn = new THREE.Mesh(new THREE.BoxGeometry(0.028, tip.length(), 0.012), tm); tn.position.copy(tip).multiplyScalar(0.5); tn.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), tip.clone().normalize()); head.add(tn); }
    head.add(at3(new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.03, 0.025), tm), 0, 0.2, 0));
  } else if (kind === 'bone') {       // "Spooky, Scary Skeletons" (2026-10-04): a cartoon femur held crosswise in front of the paw (along x, a knob pair at each end), ivory and a little self-lit so it reads at night
    const iv = mat({ color: 0xf6f0de, unlit: 0.35 }), sh = add(cyl(0.028, 0.028, 0.36, iv), 0, 0.075); sh.rotation.z = Math.PI / 2;
    for (const x of [-0.18, 0.18]) for (const y of [-0.03, 0.03]) add(new THREE.Mesh(new THREE.IcosahedronGeometry(0.042, 0), iv), x, 0.075 + y);
  } else if (kind === 'biscuit' || kind === 'bigbiscuit') {   // "Beautiful Things" (2026-10-04 2nd): a dog biscuit, bone-shaped, golden and a little self-lit (it must read at 270x480); the big one is the jackpot
    G.add(biscuitMesh(kind === 'bigbiscuit' ? 2.6 : 1));
  } else if (kind === 'pail') {       // the trick-or-treat pail: an orange jack-o'-lantern bucket with a black face and handle, hanging from the paw, candy on top
    const o = mat({ color: 0xff7a14, unlit: 0.35 }), ink = mat({ color: 0x15100c }); add(cyl(0.12, 0.1, 0.16, o, 8), 0, -0.13);
    for (const sd of [-1, 1]) add(new THREE.Mesh(new THREE.ConeGeometry(0.026, 0.04, 3), ink), sd * 0.045, -0.1, 0.116).rotation.x = Math.PI / 2;
    add(box(0.11, 0.025, 0.01, ink), 0, -0.165, 0.112);
    const h = add(new THREE.Mesh(new THREE.TorusGeometry(0.11, 0.008, 3, 8, Math.PI), M(0x1a1a1a)), 0, -0.05); h.rotation.y = 0;
    [[0xff4f9a, -0.04], [0x3fd4ff, 0.03], [0xffe23a, 0.0]].forEach(([c, x], k) => add(box(0.05, 0.03, 0.04, mat({ color: c, unlit: 0.5 })), x, -0.045 + k * 0.012, (k - 1) * 0.03));
  } else if (kind === 'broom') {      // the witch's broom held upright like a staff, the straw UP beside her head (pale and a little self-lit: bristles down at her feet were out of every close frame and the stick read as a bare cane, review 2026-10-04)
    add(box(0.034, 0.95, 0.034, M(0x7a5030)), 0, 0.02); add(new THREE.Mesh(new THREE.ConeGeometry(0.13, 0.3, 6), mat({ color: 0xf2d27a, unlit: 0.45 })), 0, 0.62);
    add(cyl(0.05, 0.05, 0.045, M(0xb8402a), 6), 0, 0.47);
  } else if (kind === 'tissue') {     // a crumpled white tissue in the paw
    add(new THREE.Mesh(new THREE.IcosahedronGeometry(0.06, 0), mat({ color: 0xfafafa, unlit: 0.45 })), 0, 0.03); add(box(0.06, 0.07, 0.01, mat({ color: 0xfafafa, unlit: 0.45 })), 0.02, 0.09).rotation.z = 0.4;
  } else if (kind === 'tissuebox') {  // a box of tissues with a blue band, one tissue sticking out (thrown in the ward)
    add(box(0.26, 0.13, 0.14, mat({ color: 0x2a7ae8, unlit: 0.45 }))); add(box(0.265, 0.035, 0.145, mat({ color: 0xffd43b, unlit: 0.45 })), 0, 0.02); add(box(0.12, 0.16, 0.02, mat({ color: 0xffffff, unlit: 0.8 })), 0, 0.14).rotation.z = 0.25; add(box(0.1, 0.12, 0.02, mat({ color: 0xffffff, unlit: 0.8 })), 0.03, 0.2).rotation.z = -0.3;
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
// slot: the same prop in both paws needs two meshes (Compote's two taiko sticks shared one, and the left paw's moved it, 2026-09-27)
function propFor(D, kind, slot = '') { const key = D.base + ':' + kind + slot; if (!PROPS[key]) { PROPS[key] = kind === 'jetski' ? jetskiMesh() : kind.endsWith(':flying') ? new THREE.Group() : propMesh(kind); scene.add(PROPS[key]); } return PROPS[key]; }
function palm(D, side) {   // world point in the middle of a paw
  const h = D['hand' + side], m = D['mid' + side], f = D['fore' + side]; if (!h) return null;
  h.getWorldPosition(_pa);
  if (m) m.getWorldPosition(_pb); else if (f) { f.getWorldPosition(_pb); _pb.sub(_pa).multiplyScalar(-0.35).add(_pa); } else _pb.copy(_pa);
  return _pc.copy(_pa).lerp(_pb, 0.85);
}
function holdProp(D, kind, side, bodyYaw, t) {
  const g = propFor(D, kind, side === 'L' ? ':L' : ''), s = D.curScale || D.scale || 1; g.visible = true; g.scale.setScalar(s * 1.25 * (D.holdScale || 1));   // a little oversized so it reads at 270x480
  if (kind === 'pad' || kind === 'deck' || kind === 'book' || kind === 'comic' || kind === 'wallet' || kind === 'bucket' || kind === 'steak' || kind === 'board' || (kind === 'melon' && D.twoPaw)) {   // held in both paws (a melon only when both arms carry it)
    const a = palm(D, 'L')?.clone(), b = palm(D, 'R'); if (!a || !b) return;
    g.position.copy(a).add(b).multiplyScalar(0.5); g.rotation.set(kind === 'pad' ? 0.35 : kind === 'melon' ? 0 : kind === 'bucket' ? 0.45 : kind === 'steak' || kind === 'board' ? 0.75 : -0.75, bodyYaw, 0, 'YXZ');   // the steak's board tips its face to the lens   // the book and the wallet tilt open towards the holder
    if (kind === 'melon') g.position.addScaledVector(_up, 0.1 * s);   // it sits on the paws
    if (kind === 'wallet') D.walletAt = g.position.clone();
    return;
  }
  if (kind === 'guitar' || kind === 'acoustic') {   // the body at the strumming (right) paw, the neck laid towards the fretting (left) paw, the face towards the body's front
    const a = palm(D, 'R')?.clone(), b = palm(D, 'L'); if (!a || !b) return;
    const dir = b.clone().sub(a).normalize(), n = new THREE.Vector3(Math.sin(bodyYaw), 0, Math.cos(bodyYaw)), up = new THREE.Vector3();
    n.addScaledVector(dir, -n.dot(dir)).normalize(); up.crossVectors(n, dir);
    g.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(dir, up, n));   // the body in front of the belly: from the strumming paw, in along the neck and forward (at the paw it sat behind the hip)
    g.position.copy(a).addScaledVector(dir, 0.1 * s).addScaledVector(n, 0.07 * s).addScaledVector(up, -0.02 * s);
    return;
  }
  const p = palm(D, side); if (!p) return;
  if (kind === 'hook' || kind === 'leash') {   // from the paw to D.hookTo: [x, y, z], or a character's name (its collar, under the head bone); else 2.2 m along the forearm
    const H = D.hookTo, C = typeof H === 'string' ? CREW[H] : null, from = p.clone();
    let to = Array.isArray(H) ? new THREE.Vector3(...H) : C?.head ? C.head.getWorldPosition(new THREE.Vector3()).addScaledVector(_up, 0.02 * (C.curScale || 1)) : null;   // the head bone sits at the neck: the collar (0.3 m under it was his waist)
    if (!to) { D['fore' + side].getWorldPosition(_pd); to = from.clone().addScaledVector(_pa.clone().sub(_pd).normalize(), 2.2); }
    const d = to.clone().sub(from), len = Math.max(0.2, d.length());
    g.scale.setScalar(1); g.position.copy(from); g.quaternion.setFromUnitVectors(_up, d.normalize());
    g.userData.pole.scale.y = len; g.userData.pole.position.y = len / 2; g.userData.crook.position.y = len; return;
  }
  if (kind === 'rake') {   // the handle from the paw to its tines' tips: D.hookTo [x, y, z], else 0.95 m ahead of the paw on the ground (pulled along by the rake swing)
    const from = p.clone(), fwd = new THREE.Vector3(Math.sin(bodyYaw), 0, Math.cos(bodyYaw));
    const to = Array.isArray(D.hookTo) ? new THREE.Vector3(...D.hookTo) : from.clone().addScaledVector(fwd, 0.95 * s).setY(0.03);
    const d = to.clone().sub(from), len = Math.max(0.4, d.length()); d.normalize();
    const xb = new THREE.Vector3().crossVectors(_up, d); if (xb.lengthSq() < 1e-6) xb.set(1, 0, 0); xb.normalize();
    g.scale.setScalar(1); g.position.copy(from); g.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(xb, d, new THREE.Vector3().crossVectors(xb, d)));
    const pl = len - 0.3; g.userData.pole.scale.y = pl; g.userData.pole.position.y = pl / 2; g.userData.rakeHead.position.y = pl; return;
  }
  if (kind === 'finger' || kind === 'bachi' || kind === 'dstick' || kind === 'carrotpoke' || kind === 'selfie' || kind === 'selfiepov' || kind === 'brush') {   // along the forearm, pointing where the paw points
    D['fore' + side].getWorldPosition(_pd); const dir = _pa.clone().sub(_pd).normalize();
    g.quaternion.setFromUnitVectors(_up, dir); g.position.copy(p); return;
  }
  if (kind === 'scissors') { g.position.copy(p).addScaledVector(_up, 0.02 * s); g.rotation.set(0, bodyYaw, 0); const o = 0.12 + 0.3 * Math.abs(Math.sin(t * Math.PI * 105 / 60)); (g.userData.blades || []).forEach((bl, i) => { bl.rotation.z = (i ? 1 : -1) * o; }); return; }   // snipping: the blades open and shut twice a beat at 105 BPM, their faces to the body's front
  if (kind === 'clock') { g.position.copy(p).addScaledVector(_up, 0.02 * s); g.rotation.set(0, 0, 0.22 * Math.sin(t * 55)); (g.userData.ring || []).forEach((l, i) => { l.visible = Math.sin(t * 40 + i) > -0.6; }); return; }   // ringing: it shakes in the paw, its face always to the front (+z, where the lenses are: turned with the body it went edge-on in profile)
  if (kind === 'balloon' || kind === 'getwell' || kind === 'goldfish') { g.position.copy(p); g.rotation.set(0.12 * Math.sin(t * 1.3), bodyYaw, 0.1 * Math.sin(t * 1.7 + 1)); return; }
  g.rotation.set(0, bodyYaw, 0);
  g.position.copy(p).addScaledVector(_up, kind === 'phone' || kind === 'ticket' || kind === 'camera' || kind === 'handmirror' || kind === 'instant' || kind === 'polaroid' || kind === 'polaroid1' || kind === 'espresso' || kind === 'handset' || kind === 'citation' ? 0.02 : -0.075 * s);   // drinks are gripped around the middle
  if (g.userData.led) g.userData.led.material.uniforms.uCol.value.setScalar(0.6 + 0.4 * (Math.sin(t * 40) > 0.6));
  if (g.userData.petals) {   // the petals left: petalsLeft, minus one on every pluckEvery beats since the shot's start (the pluck swing reaches on the beat), or
    // minus the one that falls at petalFall s; the latest plucked petal flutters down to the keys (a mesh of its own in PROPS, hidden each frame)
    let n = D.petalsLeft ?? 12, k = -1;
    if (D.pluckEvery) {
      const e = D.pluckEvery, b1 = Math.floor(bp(t) / e), c = Math.max(0, b1 - Math.floor(bp(t - D.since) / e));
      if (c > 0 && n > 0) { const m0 = Math.min(c, n); n -= m0; k = t - beatT(b1 * e); }
    } else if (D.petalFall != null && D.since >= D.petalFall && n > 0) { n -= 1; k = D.since - D.petalFall; }
    const fallen = g.userData.petals[n];
    g.userData.petals.forEach((q, i) => { q.visible = i < n; });
    if (k >= 0 && k < 0.75 && fallen) {
      const key = D.base + ':petalfall'; if (!PROPS[key]) { PROPS[key] = new THREE.Mesh(fallen.geometry, fallen.material); scene.add(PROPS[key]); }
      const m = PROPS[key]; g.updateMatrixWorld(true); fallen.getWorldPosition(m.position); m.visible = true; m.scale.setScalar(s * 1.25 * (D.holdScale || 1) * 1.3);
      m.position.x += 0.08 * Math.sin(k * 9); m.position.y -= 0.9 * k * k + 0.15 * k; m.position.z += 0.12 * k; m.rotation.set(k * 7, k * 3, k * 5);
    }
  }
}
function rideDuck(D, bodyYaw, base, t) {   // the rider sits in the ring of Compote's duck float, leaning back on the duck's neck
  const key = D.base + ':duck'; if (!PROPS[key]) { PROPS[key] = duckFloat(); scene.add(PROPS[key]); }
  const g = PROPS[key], s = D.scale || 1; g.visible = true; D.hips.getWorldPosition(_pa);
  g.position.set(_pa.x, base - 0.15, _pa.z); g.rotation.set(0.04 * Math.sin(t * 1.9), bodyYaw, 0.05 * Math.sin(t * 1.4)); g.scale.setScalar(s);   // the duck's head behind him, a backrest: his face stays clear from the front
}
function rideTrolley(D, bodyYaw, base, t) {   // the rider sits in the basket of a shopping trolley ("Ain't In LA"), its handle behind him; base: the floor under it
  const key = D.base + ':trolley'; if (!PROPS[key]) { PROPS[key] = trolleyModel(MAP_KIT); scene.add(PROPS[key]); }
  const g = PROPS[key], s = D.scale || 1; g.visible = true; D.hips.getWorldPosition(_pa);
  g.position.set(_pa.x, base + 0.012 * Math.abs(Math.sin(t * 17)), _pa.z); g.rotation.set(0, bodyYaw, 0.015 * Math.sin(t * 23)); g.scale.setScalar(s);   // a rattle over the tarmac
}
function wearHat(D, kind, bodyYaw, y) {   // a prop on top of the head (a glass upside down after the spill)
  const key = D.base + ':hat:' + kind; if (!PROPS[key]) { PROPS[key] = propMesh(kind); scene.add(PROPS[key]); }
  const g = PROPS[key], s = D.curScale || D.scale || 1; g.visible = true; g.scale.setScalar(s * 1.7);   // bigger than in a paw: it must read on top of a head
  D.head.getWorldPosition(_pa); g.position.copy(_pa).addScaledVector(_up, y * s); g.rotation.set(Math.PI, bodyYaw, 0.2);
  if (FRUITS.includes(kind)) g.rotation.set(0, bodyYaw, 0.12);   // a fruit sits upright (a pineapple on a head: the crown up)
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
// Beat-locked arm swings (2026-09-27, "Caramelldansen"), `aim: <preset>` with `arm: "both" | "L" | "R"`: each arm
// blends from pose A to pose B (the upper arm and the forearm aimed separately, body frame as for AIMS) and back once
// per `flapEvery` beats, peaking on the beat. caramell: each paw straight up by the head, the forearm flapping out and
// forward like a floppy ear (flapped straight forward, the paw foreshortened into a flipper seen from the front: the
// reviewer, 2026-09-27); maneki: the lucky cat's beckon, the forearm curling forward (`arm: "R"`); taiko: both arms up and down onto a drum
// in front, the right arm a beat after the left; clap: both paws meet in front of the chest on every beat. flap: how far (1; 0 holds pose A: a statue's raised paw), flapPh: the
// phase in beats (a real cat among the statues beckons a hair off the beat). The body's `sway` roll (D.roll) tilts the
// aims with it. Pure in t.
const SWINGS = {
  caramell: { up: [[0.5, 0.86, 0.1], [0.5, 0.86, 0.1]], fore: [[0.5, 0.86, 0.1], [0.62, 0.55, 0.56]], alt: 0, every: 1 },
  maneki: { up: [[0.5, 0.86, 0.1], [0.5, 0.86, 0.1]], fore: [[0.5, 0.86, 0.1], [0.3, 0.32, 0.9]], alt: 0, every: 1 },
  taiko: { up: [[0.32, 0.6, 0.73], [0.2, -0.05, 0.98]], fore: [[0.22, 0.82, 0.53], [0.1, -0.42, 0.9]], alt: 1, every: 2 },
  clap: { up: [[0.55, 0.2, 0.81], [0.2, 0.15, 0.97]], fore: [[0.45, 0.3, 0.84], [-0.55, 0.18, 0.82]], alt: 0, every: 1 },
  keys: { up: [[0.28, -0.3, 0.91], [0.26, -0.38, 0.89]], fore: [[0.18, -0.12, 0.98], [0.16, -0.58, 0.8]], alt: 0.5, every: 1 },   // "Love Me Not": the paws on the keys, tapping one after the other
  pluck: { up: [[0.2, 0.05, 0.98], [-0.7, 0.28, 0.66]], fore: [[0.3, 0.2, 0.93], [-0.72, 0.3, 0.62]], alt: 0, every: 1 },
  heart: { up: [[0.1, -0.7, 0.7], [0.1, -0.7, 0.7]], fore: [[-0.85, 0.12, 0.52], [-0.85, 0.12, 0.52]], alt: 0, every: 1 },
  rave: { up: [[0.95, 0.28, 0.12], [0.86, 0.48, 0.18]], fore: [[0.22, 0.96, 0.12], [0.55, 0.82, 0.15]], alt: 0, every: 1 },   // "Jamaican (Bam Bam)": raise the roof, elbows out wide and forearms up, the paws flung out on the beat (a chibi's 0.3 m arms raised straight up end at its cheeks, inside its big head's silhouette: "arms down" in a still)
  flail: { up: [[0.95, 0.15, 0.25], [0.62, 0.76, -0.15]], fore: [[0.75, 0.6, 0.25], [0.2, 0.95, -0.2]], alt: 0.5, every: 1 },   // a panicked flail: arms thrown up and out, the right half a swing after the left (a fixed face can't scream: the body sells it)
  sip: { up: [[0.2, -0.85, 0.48], [0.25, -0.3, 0.92]], fore: [[0.15, -0.1, 0.98], [-0.42, 0.84, 0.34]], alt: 0, every: 4 },   // the held glass in front of the belly, raised to the mouth on every 4th beat (`arm: "R"`, `hold: "milk"`)
  drums: { up: [[0.3, 0.1, 0.95], [0.2, -0.05, 0.98]], fore: [[0.22, 0.38, 0.9], [0.1, -0.42, 0.9]], alt: 1, every: 2 },
  paddle: { up: [[0.2, 0.32, 0.93], [0.2, -0.3, 0.93]], fore: [[0.15, 0.22, 0.96], [0.1, -0.7, 0.71]], alt: 0.5, every: 1 },   // reaching forward at chest height, then pulling down (paws at the chin or chest read as nothing, the reviewer)   // "SWIM": the doggy paddle, paws down in front of the chest on the beat, the right half a beat after the left
  bail: { up: [[0.1, -0.55, 0.83], [0.12, 0.72, 0.68]], fore: [[0.06, -0.45, 0.89], [0.06, 0.9, 0.43]], alt: 0, every: 1 },   // paws close together on the bucket (spread wide it floated between them)   // up to the bucket over her head on the beat (at chest height its handle crossed her muzzle)   // "SWIM": bailing, both paws low (the scoop), then the bucket swung up to the chest on the beat   // a drum kit: taiko's hit with a lower wind-up (the taiko one raised the stick across her face from the side)   // a paw on the heart: the upper arm down, the forearm folded in to the chest (held; a straight arm read as pointing)   // the right paw reaches across to the daisy in the left one on the beat, and pulls away
  rake: { up: [[0.2, -0.3, 0.93], [0.24, -0.74, 0.63]], fore: [[0.1, -0.42, 0.9], [0.12, -0.82, 0.56]], alt: 0, every: 2 },   // "we fell in love in october": raking, both paws low on the handle, reaching forward, pulled back on every other beat
  claw: { up: [[0.62, 0.62, 0.48], [0.3, 0.45, 0.84]], fore: [[0.5, 0.45, 0.74], [0.25, -0.2, 0.95]], alt: 0, every: 1 },   // "Animal" (2026-10-03): the clip's claw move, paws raised beside the head and angled forward (pose A, held by flap 0), striking forward on the beat (pose B); arms out at shoulder height read as a T-pose and paws at the cheeks as worry, so neither is a pose
}, _rq = new THREE.Quaternion(), _rf = new THREE.Vector3();
function swingK(A, t, side) {   // 1 at pose B (on the beat), 0 at pose A half a swing later
  const S = SWINGS[A.aim], b = (bp(t) - (A.flapPh || 0) - (side === 'R' ? S.alt : 0)) / (A.flapEvery || S.every);
  return (A.flap ?? 1) * Math.pow(0.5 + 0.5 * Math.cos(TAU * b), 1.4);
}
function swayRoll(A, t) {   // the body's side-to-side tilt (rad): one side on each beat (swayEvery beats per side)
  if (!A.sway) return 0;
  const c = Math.cos(Math.PI * (bp(t) - (A.swayPh || 0)) / (A.swayEvery || 1));
  return A.sway * Math.PI / 180 * Math.sign(c) * Math.pow(Math.abs(c), 0.7);
}
function aimArms(D, A, bodyYaw, since, t = 0) {
  const w = cl((since - (A.upAt || 0)) / 0.15) * (A.upEnd != null ? cl((A.upEnd - since) / 0.15) : 1); if (w <= 0) return;
  const cy = Math.cos(bodyYaw), sy = Math.sin(bodyYaw);
  if (D.roll) _rq.setFromAxisAngle(_rf.set(sy, 0, cy), D.roll);   // the sway tilts the aims with the body
  if (A.aim === 'pelt' && A.pelt) {   // the pelt's throwing arms: each paw cocked behind the head, snapping forward on its own throws
    const up = [[0.62, 0.7, -0.35], [0.22, 0.32, 0.92]], fore = [[0.55, 0.8, -0.2], [0.18, 0.12, 0.98]], mix = (p, k) => p[0].map((u, i) => u + (p[1][i] - u) * k);   // cocked out beside the head (behind it, the chibi head hid the paw)
    for (const side of ['L', 'R']) {
      const sx = side === 'L' ? 1 : -1, ts = A.pelt.times.filter((_, i) => i % 2 === (side === 'R' ? 0 : 1));
      const d = ts.reduce((m, ti) => Math.abs(since - ti - 0.04) < Math.abs(m) ? since - ti - 0.04 : m, 9);
      const k = Math.exp(-((d / 0.13) ** 2)), W = v => { const bx = v[0] * sx, o = new THREE.Vector3(bx * cy + v[2] * sy, v[1], -bx * sy + v[2] * cy).normalize(); return D.roll ? o.applyQuaternion(_rq) : o; };
      aimBone(side === 'L' ? D.L : D.R, D['fore' + side], W(mix(up, k)), w); aimBone(D['fore' + side], D['hand' + side], W(mix(fore, k)), w);
    }
    return;
  }
  if (SWINGS[A.aim]) {
    const S = SWINGS[A.aim], mix = (p, k) => p[0].map((u, i) => u + (p[1][i] - u) * k);
    for (const side of A.arm === 'both' ? ['L', 'R'] : [A.arm]) {
      const sx = side === 'L' ? 1 : -1, k = swingK(A, t, side), W = d => { const bx = d[0] * sx, v = new THREE.Vector3(bx * cy + d[2] * sy, d[1], -bx * sy + d[2] * cy).normalize(); return D.roll ? v.applyQuaternion(_rq) : v; };
      aimBone(side === 'L' ? D.L : D.R, D['fore' + side], W(mix(S.up, k)), w); aimBone(D['fore' + side], D['hand' + side], W(mix(S.fore, k)), w);
    }
    return;
  }
  let d0 = Array.isArray(A.aim) ? A.aim : AIMS[A.aim] || AIMS.up;
  if (A.aim2 && A.aim2At != null && since > A.aim2At) {   // a second aim from aim2At s, snapped in over 0.08 s (a yank)
    const d2 = Array.isArray(A.aim2) ? A.aim2 : AIMS[A.aim2] || AIMS.up, k2 = sm((since - A.aim2At) / 0.08); d0 = d0.map((v, i) => v + (d2[i] - v) * k2);
  }
  for (const side of A.arm === 'both' ? ['L', 'R'] : [A.arm]) {
    let d1 = d0;
    if (A.aimSeq) for (const [s0, aL, aR] of A.aimSeq) {   // each aim snapped in over 0.08 s from its second; [s, aimL, aimR] gives each arm its own
      if (since <= s0) continue;
      const a1 = side === 'R' && aR ? aR : aL, d2 = Array.isArray(a1) ? a1 : AIMS[a1] || AIMS.up, k2 = sm((since - s0) / 0.08); d1 = d1.map((v, i) => v + (d2[i] - v) * k2);
    }
    // wave: a slow flap of the aim's height (wings in the wind), the two arms a little out of phase; pure in `since`
    const dy = d1[1] + (A.wave || 0) * Math.sin(since * (A.waveRate || 2.4) + (side === 'L' ? 0 : 0.7));   // waveRate (rad/s): a fast wave for help ("Beauty And A Beat": 9)
    const sx = side === 'L' ? 1 : -1, bx = d1[0] * sx, v = new THREE.Vector3(bx * cy + d1[2] * sy, dy, -bx * sy + d1[2] * cy).normalize();   // body frame → world
    if (D.roll) v.applyQuaternion(_rq);
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
  g.visible = u < 1;
  if (!g.visible) { if (T.splash) splashAt(D, T.to, since - T.at - (T.dur || 0.6)); return; }
  const big = T.scale || 1.6;   // a thrown prop is drawn bigger so its arc reads
  const fx = Math.sin(bodyYaw), fz = Math.cos(bodyYaw), rx = Math.cos(bodyYaw), rz = -Math.sin(bodyYaw);
  const x0 = D.holder.position.x - rx * 0.22 * s + fx * 0.15 * s, y0 = D.holder.position.y + 1.0 * s, z0 = D.holder.position.z - rz * 0.22 * s + fz * 0.15 * s;
  g.position.set(x0 + (T.to[0] - x0) * u, y0 + (T.to[1] - y0) * u + (T.arc ?? 0.9) * 4 * u * (1 - u), z0 + (T.to[2] - z0) * u);
  g.rotation.set(u * 14, bodyYaw, u * 5); g.scale.setScalar(s * 1.25 * big);
}
// A volley of thrown fruit (an actor's `pelt`, "Hootie Frutti", 2026-09-28): { times: [s into the shot], to: [x, y, z],
// kinds: [fruit, ...] (cycled; default FRUITS), dur: each flight in s (0.42), arc: m (0.35), spread: m of scatter round
// the target (0.22), big: the fruit's size (1.3), floorY: where they come to rest (0), fly: m/s they bounce off at (1.3) }.
// to, big, floorY and fly also take one value per throw (a last watermelon aimed at a belly, resting on it).
// Each fruit leaves a shoulder (the right paw first, then alternating) at its time, flies an arc to the target
// spinning, bounces off up and away from the thrower, and lies where it lands for the rest of the shot. The target is a
// point, not a character: a body posed after the thrower in the same frame would lag a frame. Pure in t.
function peltFruit(D, A, bodyYaw, since) {
  const V = A.pelt, s = D.curScale || D.scale || 1, dur = V.dur || 0.42, kinds = V.kinds || FRUITS, big = V.big || 1.3, sp = V.spread ?? 0.22;
  const fx = Math.sin(bodyYaw), fz = Math.cos(bodyYaw), rx = Math.cos(bodyYaw), rz = -Math.sin(bodyYaw);
  const h = (i, k) => { const x = Math.sin(i * 127.1 + k * 311.7) * 43758.5453; return x - Math.floor(x); };
  V.times.forEach((ti, i) => {
    const u = (since - ti) / dur; if (u < 0) return;
    const per = (v, d) => Array.isArray(v) ? v[i] ?? d : v ?? d;   // big, floorY, fly: one value, or one per throw
    const to = Array.isArray(V.to[0]) ? V.to[i] : V.to, flr = (per(V.floorY, 0) || 0) + 0.07;
    const g = propFor(D, kinds[i % kinds.length], ':pelt' + i); g.visible = true; g.scale.setScalar(s * 1.25 * per(V.big, big));
    const side = i % 2 ? 1 : -1, x0 = D.holder.position.x + side * rx * 0.22 * s + fx * 0.15 * s, y0 = D.holder.position.y + 1.0 * s, z0 = D.holder.position.z + side * rz * 0.22 * s + fz * 0.15 * s;
    const tx = to[0] + (h(i, 1) - 0.5) * 2 * sp, ty = to[1] + (h(i, 2) - 0.5) * sp, tz = to[2] + (h(i, 3) - 0.5) * sp;
    if (u <= 1) {
      g.position.set(x0 + (tx - x0) * u, y0 + (ty - y0) * u + (V.arc ?? 0.35) * 4 * u * (1 - u), z0 + (tz - z0) * u);
      g.rotation.set(u * 12 + i, bodyYaw + i, u * 5); return;
    }
    // the bounce: away from the thrower and to one side, up 1.6 m/s, falling to the floor, then still
    const dx = tx - x0, dz = tz - z0, dl = Math.hypot(dx, dz) || 1, ux = dx / dl, uz = dz / dl, sd = (h(i, 4) - 0.5) * 2, fly = per(V.fly, 1.3), lat = Math.min(0.8, fly * 0.6);
    const land = (1.6 + Math.sqrt(1.6 * 1.6 + 19.6 * Math.max(0, ty - flr))) / 9.8, v = Math.min(since - ti - dur, land);
    g.position.set(tx + (ux * fly - uz * sd * lat) * v, Math.max(flr, ty + 1.6 * v - 4.9 * v * v), tz + (uz * fly + ux * sd * lat) * v);
    g.rotation.set(12 + i + v * 9, bodyYaw + i, 5 + v * 4);
  });
}
// ---- "Dans ma bulle" (2026-09-27): bubble gum blown from the mouth (`gum`: [at, full, r, pop], seconds into the shot
// and the full radius in m; pop: it bursts into pink bits), the gum left on the face (`splat`: from s), earbuds (`buds`:
// true or from s), the giant see-through bubble a body floats in (`bubble`: { r, at, full, pop, dy }: it grows from at
// to full round the hips, bursts into droplets at pop; see: its see-through, 0.58, clearer for a close lens) and a moth
// out of an open wallet (`moth`: from s). Face props sit
// in the head bone's frame, whose axes are the body's at rest (measured on Saxo's bind pose: the nose tip 0.44 m in
// front of the bone and 0.14 m up, the ear flaps 0.47 m out), so they follow its nods and turns. Pure in t.
const FACE = { mouth: [0, 0.07, 0.4], budL: [0.44, 0.24, 0.02], budR: [-0.44, 0.24, 0.02] }, GUM_PINK = 0xffb4dc;   // renders bubblegum pink: a hex goes darker and redder through the linear conversion (0xff86c4 read magenta)
const _fq = new THREE.Quaternion(), _fo = new THREE.Vector3(), _fc = new THREE.Vector3(), _fr = new THREE.Vector3(), _fu = new THREE.Vector3();
function faceAt(D, off, out) { const s = D.curScale || D.scale || 1; D.head.getWorldPosition(out); D.head.getWorldQuaternion(_fq); return out.add(_fo.set(off[0] * s, off[1] * s, off[2] * s).applyQuaternion(_fq)); }
function faceProp(D, key, make) { const k = D.base + ':' + key; if (!PROPS[k]) { PROPS[k] = make(); scene.add(PROPS[k]); } PROPS[k].visible = true; return PROPS[k]; }
const BURST = Array.from({ length: 14 }, (_, i) => { const y = 1 - 2 * (i + 0.5) / 14, r = Math.sqrt(1 - y * y), a = i * 2.39996; return new THREE.Vector3(Math.cos(a) * r, y, Math.sin(a) * r); });
function blowGum(D, G, c, t) {   // the bubble is mostly self-lit (unlit 0.75): candy pink in the dusk's violet light too
  const [at, full, r, pop] = G; if (c < at) return;
  const s = D.curScale || D.scale || 1, R = r * s;
  if (pop != null && c >= pop) {   // pink bits fly out from where the bubble was, and fall
    if (c >= pop + 0.35) return;
    const g = faceProp(D, 'gumbits', () => { const q = new THREE.Group(), m = mat({ color: GUM_PINK, unlit: 0.35 }); BURST.forEach(() => q.add(new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), m))); return q; });
    const k = c - pop; faceAt(D, [FACE.mouth[0], FACE.mouth[1], FACE.mouth[2] + r * 0.92], g.position); g.quaternion.identity(); g.scale.setScalar(1);
    g.children.forEach((b, i) => { b.position.copy(BURST[i]).multiplyScalar(R + k * 2.6 * s); b.position.y -= 3 * k * k; b.scale.setScalar(Math.max(0.01, 0.08 * s * (1 - k / 0.35))); });
    return;
  }
  const u = full > at ? sm((c - at) / (full - at)) : 1, rad = r * (0.12 + 0.88 * u) * (1 + 0.025 * Math.sin(t * 9));
  const g = faceProp(D, 'gum', () => { const q = new THREE.Group(); q.add(new THREE.Mesh(new THREE.IcosahedronGeometry(1, 2), mat({ color: GUM_PINK, unlit: 0.75 }))); const gl = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.2, 0.1), mat({ color: 0xffffff, unlit: 1 })); gl.position.set(-0.42, 0.42, 0.8); q.add(gl); return q; });
  faceAt(D, [FACE.mouth[0], FACE.mouth[1], FACE.mouth[2] + rad * 0.92], g.position); g.quaternion.copy(_fq); g.scale.setScalar(rad * s);
}
const SPLAT = [[0, 0.12, 0.45, 0.2, 0.15], [0.15, 0.22, 0.4, 0.13, 0.11], [-0.16, 0.24, 0.39, 0.14, 0.11], [0.04, 0.34, 0.36, 0.13, 0.09], [-0.07, 0.0, 0.42, 0.12, 0.08], [0.25, 0.08, 0.35, 0.09, 0.12], [-0.26, 0.1, 0.35, 0.09, 0.1], [0.09, -0.08, 0.4, 0.05, 0.1]];   // [x, y, z, rx, ry] in the head's frame
function gumSplat(D) {
  const g = faceProp(D, 'splat', () => { const q = new THREE.Group(), m = mat({ color: GUM_PINK, unlit: 0.35 }); SPLAT.forEach(([x, y, z, rx, ry]) => { const b = new THREE.Mesh(new THREE.IcosahedronGeometry(1, 1), m); b.position.set(x, y, z); b.scale.set(rx, ry, 0.05); q.add(b); }); return q; });
  faceAt(D, [0, 0, 0], g.position); g.quaternion.copy(_fq); g.scale.setScalar(D.curScale || D.scale || 1);
}
// "we fell in love in october" (2026-10-03): `dizzy` (true or from s into the shot): cartoon stars circling the head after
// a fall, five yellow stars on a ring round the head in the world's horizontal plane, 0.3 m above its middle (seen
// from above they ring a face looking up; standing, they circle the crown), each facing the lens. Pure in t.
// a maple leaf's outline (base at the origin, its top lobe at y = 1): five serrated lobes
const MAPLE_GEO = (() => { const R = [[0.18, -0.06], [0.42, -0.22], [0.36, 0.02], [0.72, 0.16], [0.58, 0.28], [0.82, 0.5], [0.5, 0.48], [0.44, 0.6], [0.28, 0.5], [0.2, 0.74], [0.08, 0.68], [0, 1]];
  const pts = [[0, 0], ...R, ...R.slice(0, -1).reverse().map(([x, y]) => [-x, y])], sh = new THREE.Shape(); pts.forEach(([x, y], i) => i ? sh.lineTo(x, y) : sh.moveTo(x, y)); sh.closePath(); return new THREE.ShapeGeometry(sh); })();
const STAR_GEO = (() => { const sh = new THREE.Shape(); for (let i = 0; i < 10; i++) { const a = Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? 0.45 : 1; if (i) sh.lineTo(Math.cos(a) * r, Math.sin(a) * r); else sh.moveTo(Math.cos(a) * r, Math.sin(a) * r); } sh.closePath(); return new THREE.ShapeGeometry(sh); })();
function dizzyStars(D, t) {
  const sc = D.curScale || D.scale || 1, c = faceAt(D, [0, 0.3, 0.05], new THREE.Vector3());
  const g = faceProp(D, 'dizzy', () => { const q = new THREE.Group(), m = mat({ color: 0xffe23a, unlit: 1, side: THREE.DoubleSide }); for (let i = 0; i < 5; i++) q.add(new THREE.Mesh(STAR_GEO, m)); return q; });
  g.position.set(0, 0, 0); g.quaternion.identity(); g.scale.setScalar(1);
  const a0 = bp(t) * Math.PI;   // half a turn a beat
  g.children.forEach((st, i) => { const a = a0 + i * TAU / 5; st.position.set(c.x + Math.cos(a) * 0.5 * sc, c.y + (0.3 + 0.05 * Math.sin(2 * a)) * sc, c.z + Math.sin(a) * 0.5 * sc); st.quaternion.copy(camera.quaternion); st.scale.setScalar(0.15 * sc); });
}
// "Spooky, Scary Skeletons" (2026-10-04): `chew`, a femur held across the mouth like a dog carries a stick (sticking out on
// both sides of the muzzle), in the head bone's frame like FACE, so it follows the head through any clip
function chewBone(D) {
  const g = faceProp(D, 'chew', () => {
    const q = new THREE.Group(), iv = mat({ color: 0xf6f0de, unlit: 0.35 }), sh = new THREE.Mesh(new THREE.CylinderGeometry(0.032, 0.032, 0.6, 6), iv); sh.rotation.z = Math.PI / 2; q.add(sh);
    for (const x of [-0.3, 0.3]) for (const y of [-0.035, 0.035]) { const k = new THREE.Mesh(new THREE.IcosahedronGeometry(0.05, 0), iv); k.position.set(x, y, 0); q.add(k); }
    return q;
  });
  faceAt(D, [0, 0.07, 0.38], g.position); g.quaternion.copy(_fq); g.scale.setScalar(D.curScale || D.scale || 1);
}
// "Spooky, Scary Skeletons" (2026-10-04): `tongue`, a dog's pink tongue hanging out of the mouth, wagging a little:
// delight (his drawn mouth can't smile wider), in the head bone's frame like FACE
// "Beautiful Things" (2026-10-04 2nd): a dog biscuit bone-shaped (a bar with two lobes at each end), along x, centred
function biscuitMesh(k = 1) {
  const q = new THREE.Group(), m = mat({ color: 0xd8963c, unlit: 0.35 }), dark = mat({ color: 0xb87428, unlit: 0.3 });
  const bar = new THREE.Mesh(new THREE.BoxGeometry(0.2 * k, 0.05 * k, 0.03 * k), m); q.add(bar);
  for (const x of [-0.1, 0.1]) for (const y of [-0.028, 0.028]) { const l = new THREE.Mesh(new THREE.CylinderGeometry(0.034 * k, 0.034 * k, 0.03 * k, 8), m); l.rotation.x = Math.PI / 2; l.position.set(x * k, y * k, 0); q.add(l); }
  for (const x of [-0.04, 0, 0.04]) { const d = new THREE.Mesh(new THREE.BoxGeometry(0.012 * k, 0.012 * k, 0.034 * k), dark); d.position.set(x * k, 0.004 * k, 0); q.add(d); }   // the baked dots
  return q;
}
// `treat` (actor field): the dog-biscuit trick. { nose: s | true (balanced across the top of the muzzle from s), big
// (the jackpot, x2.6), flip: s (it leaves the nose upwards, spinning, and drops into the mouth over dur, 0.55 s, peaking
// h m, 0.8, over the line between its start, `from` [x, y, z] or the nose, and the mouth), mouth: s (held across the
// jaws from s; after a flip, from its end), gone: s (no biscuit from s: eaten, or taken), noseOff / mouthOff (the head
// bone's frame, measured on Saxo; a cat's muzzle is shorter), mouthRot (rad about the head's up: crosswise reads from the
// front, PI / 2 along the muzzle reads in profile) }. Pure in t, in the head bone's frame like FACE.
const NOSE_TOP = [0, 0.22, 0.375];   // on the bridge of the muzzle, between the eyes and the nose tip (lower, it sat behind the nose: two orange cheek blobs from the front)
const _bq = new THREE.Quaternion(), _be = new THREE.Euler(), _bA = new THREE.Vector3(), _bB = new THREE.Vector3();
function biscuitTrick(D, T, c) {
  if (T.gone === true || (T.gone != null && T.gone !== false && c >= T.gone)) return;
  const k = T.big ? 2.0 : 1.3, sc = D.curScale || D.scale || 1, dur = T.dur || 0.55;   // the jackpot at 2.2: at 2.6 it hid his straining eyes
  const inMouth = T.mouth === true || (T.mouth != null && T.mouth !== false && c >= T.mouth) || (T.flip != null && c >= T.flip + dur);   // true: from the shot's start (c >= true compared with 1)
  const flying = T.flip != null && c >= T.flip && c < T.flip + dur;
  const onNose = !inMouth && !flying && T.nose != null && T.nose !== false && (T.nose === true || c >= T.nose);
  if (!inMouth && !flying && !onNose) return;
  const g = faceProp(D, T.big ? 'bigtreat' : 'treat', () => biscuitMesh(k));
  if (onNose) { faceAt(D, T.noseOff || NOSE_TOP, g.position); g.quaternion.copy(_fq).multiply(_bq.setFromEuler(_be.set(-0.25, 0, 0.08))); g.scale.setScalar(sc); return; }
  if (inMouth) { faceAt(D, T.mouthOff || [0, 0.06, 0.4], g.position); g.quaternion.copy(_fq).multiply(_bq.setFromEuler(_be.set(0.15, T.mouthRot || 0, 0))); g.scale.setScalar(sc); return; }   // mouthRot: turned about the head's up (PI / 2: along the muzzle, which reads in profile)
  const u = (c - T.flip) / dur, uu = u * u * (3 - 2 * u);
  if (T.from) _bA.set(T.from[0], T.from[1], T.from[2]); else faceAt(D, T.noseOff || NOSE_TOP, _bA);
  faceAt(D, T.mouthOff || [0, 0.06, 0.4], _bB);
  g.position.copy(_bA).lerp(_bB, uu); g.position.y += (T.h ?? 0.8) * 4 * u * (1 - u);
  g.quaternion.copy(camera.quaternion).multiply(_bq.setFromEuler(_be.set(0, 0, u * Math.PI * 4))); g.scale.setScalar(sc);   // spinning in the screen's plane: broadside to the lens all the way (tumbling, it went edge-on and read as a stick)
}
// "Golden" (2026-10-06): `ballMouth` (true or from s into the shot), a tennis ball held in the jaws (the idol fetched it
// mid-show), in the head bone's frame like FACE, a little in front of the mouth so it reads from the front and in profile
function mouthBall(D) {
  const g = faceProp(D, 'ballmouth', () => { const q = new THREE.Group(); q.add(new THREE.Mesh(new THREE.IcosahedronGeometry(0.115, 1), mat({ color: 0xd8f02a, unlit: 0.5 }))); const seam = new THREE.Mesh(new THREE.TorusGeometry(0.11, 0.012, 4, 14), mat({ color: 0xffffff, unlit: 0.6 })); seam.rotation.x = 0.6; q.add(seam); return q; });
  faceAt(D, [0, 0.04, 0.47], g.position); g.quaternion.copy(_fq); g.scale.setScalar(D.curScale || D.scale || 1);
}
// "Choosin' Texas" (2026-10-06 2nd): `steakMouth` (true or from s into the shot), the Texas-shaped steak carried in the
// jaws the way a dog carries his prize: its top edge between the teeth, hanging under the muzzle and out to one side,
// its face (and the state's outline) to the front, so the eyes stay clear; in the head bone's frame like FACE
function mouthSteak(D) {
  const g = faceProp(D, 'steakmouth', () => { const q = new THREE.Group(), st = texasSteak(MAP_KIT, 0.46); st.rotation.x = Math.PI / 2; q.add(st); return q; });
  faceAt(D, [0.3, -0.08, 0.44], g.position);   // out beside the muzzle: hanging under it, it sat on his red bandana and read as a blob g.quaternion.copy(_fq); g.scale.setScalar(D.curScale || D.scale || 1);
}
// "Golden" (2026-10-06): `sip` (true or from s), a long pink straw from the cup in the right paw up into the corner of
// the mouth: chibi arms can't lift a cup to the mouth (it sat on the cheek and read as singing), the straw's line carries it
const _sa = new THREE.Vector3(), _sb = new THREE.Vector3(), _sy = new THREE.Vector3(0, 1, 0);
function sipStraw(D, hand = 'R') {   // hand: the paw holding the cup ('L' when that side faces the lens)
  const sc = D.curScale || D.scale || 1, g = faceProp(D, 'sip', () => { const q = new THREE.Group(); q.add(new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.016, 1, 6), mat({ color: 0xff6a9a, unlit: 0.55 }))); return q; });
  faceAt(D, [hand === 'L' ? 0.08 : -0.08, 0.03, 0.4], _sa); (hand === 'L' ? D.handL : D.handR).getWorldPosition(_sb); _sb.y += 0.14 * sc;
  g.position.copy(_sa).add(_sb).multiplyScalar(0.5); g.quaternion.setFromUnitVectors(_sy, _sb.clone().sub(_sa).normalize()); g.scale.set(sc, _sa.distanceTo(_sb), sc);
}
function dogTongue(D, t) {
  const g = faceProp(D, 'tongue', () => { const q = new THREE.Group(), m = mat({ color: 0xff8ab0, unlit: 0.45 }); const tg = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.17, 0.035), m); tg.position.set(0, -0.085, 0); q.add(tg); const tip = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.065, 0.035, 8), m); tip.rotation.x = Math.PI / 2; tip.position.set(0, -0.17, 0); q.add(tip); return q; });
  faceAt(D, [0, 0.03, 0.42], g.position); g.quaternion.copy(_fq).multiply(_tq.setFromEuler(_te.set(0.35, 0, 0.18 * Math.sin(t * 13)))); g.scale.setScalar(D.curScale || D.scale || 1);
}
function earbuds(D) {   // small and on the ear line, behind the cheek: bigger and further forward they read as a plaster in a three-quarter view (the reviewer)
  for (const k of ['budL', 'budR']) {
    const g = faceProp(D, k, () => { const q = new THREE.Group(), m = mat({ color: 0xffffff, unlit: 0.7 }); q.add(new THREE.Mesh(new THREE.BoxGeometry(0.065, 0.065, 0.065), m)); const st = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.09, 0.03), m); st.position.set(0, -0.065, 0.012); q.add(st); return q; });
    faceAt(D, FACE[k], g.position); g.quaternion.copy(_fq); g.scale.setScalar(D.curScale || D.scale || 1);
  }
}
// "Love Me Not" (2026-09-28): studio headphones (`phones`), in the head bone's frame like FACE: two cups just outside the ear
// line and a band arching over the crown (0.59 m above the bone; a wig's curls reach a little higher), a cyan ring on
// each cup so they read in a dark studio.
const PHONE_BAND = Array.from({ length: 9 }, (_, i) => { const a = Math.PI * i / 8; return [Math.cos(a) * 0.47, 0.32 + Math.sin(a) * 0.28]; });
function headphones(D) {
  const g = faceProp(D, 'phones', () => {
    const q = new THREE.Group(), cup = mat({ color: 0x7a808c }), band = mat({ color: 0xc0c4cc }), ring = mat({ color: 0x3a9ac8, unlit: 0.4 });
    for (const sd of [-1, 1]) {   // round cups, a dim cyan cap on each (flat bright squares read as phone screens)
      const c = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.08, 10), cup); c.rotation.z = Math.PI / 2; c.position.set(sd * 0.47, 0.26, -0.02); q.add(c);
      const r = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.055, 0.012, 8), ring); r.rotation.z = Math.PI / 2; r.position.set(sd * 0.516, 0.26, -0.02); q.add(r);
    }
    for (let i = 0; i < PHONE_BAND.length - 1; i++) {
      const [x0, y0] = PHONE_BAND[i], [x1, y1] = PHONE_BAND[i + 1], b = new THREE.Mesh(new THREE.BoxGeometry(Math.hypot(x1 - x0, y1 - y0) + 0.02, 0.045, 0.07), band);
      b.position.set((x0 + x1) / 2, (y0 + y1) / 2, -0.02); b.rotation.z = Math.atan2(y1 - y0, x1 - x0); q.add(b);
    }
    return q;
  });
  faceAt(D, [0, 0, 0], g.position); g.quaternion.copy(_fq); g.scale.setScalar(D.curScale || D.scale || 1);
}
// "Patient Zero" (2026-09-27): the sick look, in the head bone's frame like FACE. A red nose over the muzzle's tip, a
// thermometer out of the side of the mouth (tilted down and out, a red bulb at its end), a pale blue surgical mask over
// the muzzle with loops back to the ears, and the sneeze: a spray out of the nose along the face, spreading and falling
// (at a lens a metre away the nearest drops fill the frame: the sneeze on the camera).
const _tq = new THREE.Quaternion(), _te = new THREE.Euler(), NOSE = [0, 0.14, 0.46];
function redNose(D) {
  const g = faceProp(D, 'rednose', () => new THREE.Mesh(new THREE.IcosahedronGeometry(1, 1), mat({ color: 0xff4a4a, unlit: 0.4 })));
  faceAt(D, NOSE, g.position); g.quaternion.copy(_fq); g.scale.setScalar(0.075 * (D.curScale || D.scale || 1));
}
function thermometer(D) {
  const g = faceProp(D, 'therm', () => {
    const q = new THREE.Group(), st = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.03, 0.26), mat({ color: 0xf6fbff, unlit: 0.5 })); st.position.z = 0.13; q.add(st);
    const col = new THREE.Mesh(new THREE.BoxGeometry(0.012, 0.034, 0.17), mat({ color: 0xff2a2a, unlit: 0.8 })); col.position.set(0, 0.004, 0.14); q.add(col);
    const bulb = new THREE.Mesh(new THREE.BoxGeometry(0.045, 0.045, 0.05), mat({ color: 0xc8d4e4, unlit: 0.6 })); bulb.position.z = 0.26; q.add(bulb); return q;
  });
  faceAt(D, [0.08, 0.02, 0.38], g.position); g.quaternion.copy(_fq).multiply(_tq.setFromEuler(_te.set(0.12, 0.35, 0))); g.scale.setScalar(D.curScale || D.scale || 1);
}
const SLEEP_AT = { riviera: { off: [0, 0.18, 0.45], k: 1.02, thin: true } };   // a look whose shades stick out of the face: the mask goes over them (behind them it read as a band on his forehead, the critic)
function sleepMask(D, pink = false, at = null) {   // a pale blue sleep mask over both eyes, pink trim, two closed eyes with lashes printed on it: asleep (the plain navy band read as a censor bar, 2026-10-02); pink: Kob's own pyjama mask pulled down ("APT.": the blue one read as a second mask)
  const base = pink ? '#ffb4d2' : '#9ccff2', trim = pink ? '#ff6aa8' : '#ff8ac0';
  const g = faceProp(D, pink ? 'sleepmaskpink' : 'sleepmask', () => {
    const q = new THREE.Group(), face = tex(48, 16, x => { px(x, base, 0, 0, 48, 16); px(x, trim, 0, 0, 48, 2); px(x, trim, 0, 14, 48, 2); for (const cx of [13, 35]) { for (let i = -6; i <= 6; i++) px(x, '#1a1a2e', cx + i, 6 + Math.round(i * i / 12), 1, 2); for (const i of [-5, -2, 2, 5]) px(x, '#1a1a2e', cx + i, 8 + Math.round(i * i / 12), 1, 3); } }, 2250);
    const plain = mat({ color: pink ? 0xffb4d2 : 0x9ccff2, unlit: 0.4 });   // the eyes on the front face only (from above, a second pair showed on its top)
    q.add(new THREE.Mesh(new THREE.BoxGeometry(0.66, 0.2, 0.1), [plain, plain, plain, plain, mat({ map: face, unlit: 0.4 }), plain])); return q;
  });
  faceAt(D, at ? at.off : D === CREW.compote ? [0, 0.2, 0.36] : [0, 0.3, 0.33], g.position); g.quaternion.copy(_fq); g.scale.setScalar((D.curScale || D.scale || 1) * (pink ? 0.82 : at ? at.k : 1));   // Compote's eyes sit lower on her head: hers rode up on her forehead; Kob's pink one narrower (the full width floated past her cheeks)
  if (at && at.thin) { g.scale.y *= 0.85; g.scale.z *= 0.35; }   // flat on the eyes: a full-depth box over the shades read as a brick (the critic)
}
// "Danza Kuduro" (2026-10-09): `cucumbers`, two cucumber slices over the eyes, the spa-day cliche: a cat napping in her
// bathrobe and towel turban. Green rims, pale green flesh with a ring of seeds, in the head bone's frame like the shades.
function cucumberSlices(D, C = {}) {
  const g = faceProp(D, 'cucumbers', () => {
    const q = new THREE.Group(), flesh = tex(16, 16, x => { px(x, '#2e8a3a', 0, 0, 16, 16); px(x, '#cdeeb0', 2, 2, 12, 12); px(x, '#cdeeb0', 1, 4, 14, 8); px(x, '#cdeeb0', 4, 1, 8, 14); for (const [a, b] of [[7, 4], [10, 6], [10, 9], [7, 11], [5, 9], [5, 6]]) px(x, '#e8f8d8', a, b, 2, 1); });
    const rim = mat({ color: 0x2e8a3a, unlit: 0.35 }), face = mat({ map: flesh, unlit: 0.45 });
    for (const sd of [-1, 1]) { const c = new THREE.Mesh(new THREE.CylinderGeometry(0.095, 0.095, 0.035, 10), [rim, face, face]); c.rotation.x = Math.PI / 2; c.position.set(sd * 0.155, 0, 0); q.add(c); }
    return q;
  });
  // flush on the eyes (0.36 forward, 0.19 up, x1.2): at [0, 0.3, 0.41] they floated 0.1 m off the face, and a lens at her feet seeing the
  // face at a grazing angle put them up on her turban, her eyes open below them (the critic: "wide awake"); probed on four lenses
  faceAt(D, C.off || (D === CREW.compote ? [0, 0.12, 0.38] : [0, 0.19, 0.36]), g.position); g.quaternion.copy(_fq); g.scale.setScalar((D.curScale || D.scale || 1) * (C.r || 1.2));
}
// "Espresso" (2026-10-09 2nd): `googly`, cartoon wide eyes over the eyes, the moment the espresso hits: two white discs
// ringed in black with black pupils that jitter (pure in t), popping in over 0.12 s; in the head bone's frame like the
// shades. true, s into the shot, or { at, off, r } (a head-frame offset and a size, per look).
const GOOGLY_AT = { saxo: [0, 0.3, 0.36], sadi: [0, 0.27, 0.34], kob: [0, 0.23, 0.34], compote: [0, 0.15, 0.36] };   // flush on each one's eyes (head frame)
function googlyEyes(D, Gy, c, t) {
  const g = faceProp(D, 'googly', () => {
    const q = new THREE.Group(), white = mat({ color: 0xffffff, unlit: 0.9 }), rim = mat({ color: 0x141414, unlit: 0.3 }), blk = mat({ color: 0x0a0a0a, unlit: 0.2 });
    q.userData.pupils = [];
    for (const sd of [-1, 1]) {
      const e = new THREE.Group(); e.position.set(sd * 0.16, 0, 0); q.add(e);
      const w = new THREE.Mesh(new THREE.SphereGeometry(0.125, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2), white); w.rotation.x = Math.PI / 2; w.scale.set(1, 0.55, 1); e.add(w);   // a dome bulging out of the face: it covers the eyes from above and below too
      e.add(new THREE.Mesh(new THREE.TorusGeometry(0.125, 0.014, 4, 14), rim));
      const pu = new THREE.Mesh(new THREE.SphereGeometry(0.052, 10, 6), blk); pu.scale.set(1, 1, 0.45); pu.position.z = 0.062; e.add(pu);
      q.userData.pupils.push(pu);
    }
    return q;
  });
  const pop = Math.min(1, Math.max(0, c / 0.12)), boing = 1 + 0.18 * Math.max(0, 1 - c / 0.3);
  g.userData.pupils.forEach((pu, i) => { pu.position.x = 0.045 * Math.sin(t * 43 + i * 2.1); pu.position.y = 0.04 * Math.cos(t * 37 + i * 1.3); });
  faceAt(D, Gy.off || GOOGLY_AT[D.base] || [0, 0.28, 0.35], g.position); g.quaternion.copy(_fq);
  g.scale.setScalar((D.curScale || D.scale || 1) * (Gy.r || 1) * (0.35 + 0.65 * pop) * boing);
}
// "Poker Face" (2026-10-08 2nd): `shades`, dark sunglasses over the eyes: the poker player's face that gives nothing away.
// true (on all shot), s (they drop from 0.9 m above onto the eyes over 0.35 s, landing s into the shot: the "deal with
// it" glasses) or { at, off } (at as s; off: they fly up and back off the face over 0.45 s). Black lenses with a white
// glint each (plain black read as holes), a bar across the top, short temples; in the head bone's frame like the mask.
function sunglasses(D, S, c) {
  const at = S === true ? -9 : typeof S === 'number' ? S : (S.at ?? -9), off = typeof S === 'object' && S !== null ? S.off : null;
  if (c < at - 0.35 || (off != null && c > off + 0.45)) return;
  const g = faceProp(D, 'shades', () => {
    const q = new THREE.Group(), blk = mat({ color: 0x0c0c12, unlit: 0.25 }), gl = mat({ color: 0xffffff, unlit: 1 });
    for (const sd of [-1, 1]) {
      const l = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.15, 0.04), blk); l.position.set(sd * 0.155, 0, 0); q.add(l);
      const g1 = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.1, 0.006), gl); g1.position.set(sd * 0.155 - 0.06, 0.01, 0.023); g1.rotation.z = -0.6; q.add(g1);
      const tp = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.03, 0.34), blk); tp.position.set(sd * 0.3, 0.05, -0.17); q.add(tp);
    }
    const bar = new THREE.Mesh(new THREE.BoxGeometry(0.64, 0.035, 0.045), blk); bar.position.set(0, 0.07, 0); q.add(bar);
    return q;
  });
  const sc = D.curScale || D.scale || 1, dn = c < at ? (at - c) / 0.35 : 0, up = off != null && c > off ? (c - off) / 0.45 : 0;
  const base = D === CREW.compote ? [0, 0.2, 0.41] : [0, 0.3, 0.4];
  faceAt(D, [base[0], base[1] + 0.9 * dn * dn + 0.9 * up, base[2] + 0.5 * up], g.position); g.quaternion.copy(_fq);
  if (up) g.rotateX(-up * 5); g.scale.setScalar(sc);
}
// the dealer's green visor: a see-through green brim over the eyes on a dark band round the forehead
function dealerVisor(D) {
  const g = faceProp(D, 'visor', () => {
    const w = new THREE.Group(), q = new THREE.Group(), green = mat({ color: 0x3ad87a, unlit: 0.55, see: 0.3 }), edge = mat({ color: 0x1a7a3a, unlit: 0.3 });
    // a round brim (a half disc over a dark green rim) on a band round the front of the head: a square brim read as a
    // plank floating off the head in three-quarter views ("Poker Face" review loop 2), a 0.6 m flat one as a tray on her
    // head, and in profile a brim past the nose on a band to the back of the skull as a stick through it (loop 3)
    const half = r => new THREE.CylinderGeometry(r, r, 0.018, 12, 1, false, -Math.PI / 2, Math.PI);
    q.add(new THREE.Mesh(half(0.155), green));
    const rim = new THREE.Mesh(half(0.172), edge); rim.position.y = -0.006; q.add(rim);
    q.rotation.x = 0.32; w.add(q);
    const band = new THREE.Mesh(new THREE.CylinderGeometry(0.43, 0.43, 0.055, 16, 1, true, -1.13, 2.26), edge);
    band.position.set(0, 0.01, -0.33); band.rotation.x = 0.1; w.add(band);
    return w;
  });
  faceAt(D, [0, 0.43, 0.33], g.position); g.quaternion.copy(_fq); g.scale.setScalar(D.curScale || D.scale || 1);
}
function faceMask(D) {
  const g = faceProp(D, 'mask', () => {
    const q = new THREE.Group(), blue = mat({ color: 0xbfe0f2, unlit: 0.35 }), pleat = mat({ color: 0x8ab8d8, unlit: 0.35 }), loop = mat({ color: 0xffffff, unlit: 0.5 });
    q.add(new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.25, 0.1), blue));
    for (let k = -1; k <= 1; k++) { const p = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.014, 0.01), pleat); p.position.set(0, k * 0.062, 0.055); q.add(p); }
    for (const sd of [-1, 1]) { const l = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.02, 0.3), loop); l.position.set(sd * 0.21, 0.04, -0.15); l.rotation.y = -sd * 0.25; q.add(l); }
    return q;
  });
  faceAt(D, [0, 0.07, 0.37], g.position); g.quaternion.copy(_fq); g.scale.setScalar(D.curScale || D.scale || 1);
}
const SNZ = Array.from({ length: 40 }, (_, i) => { const a = i * 2.39996, r = 0.6 * Math.sqrt((i + 0.5) / 40); return new THREE.Vector3(Math.cos(a) * r, Math.sin(a) * r * 0.7, 1).normalize(); });
function sneezeSpray(D, k) {   // k: seconds since the sneeze
  if (k < 0 || k >= 0.7) return;
  const s = D.curScale || D.scale || 1;
  const g = faceProp(D, 'sneeze', () => {
    const q = new THREE.Group(), ms = [mat({ color: 0xd4ff9a, unlit: 0.9 }), mat({ color: 0xffffff, unlit: 0.95 }), mat({ color: 0xa8f070, unlit: 0.9 })];
    SNZ.forEach((_, i) => q.add(new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), ms[i % 3])));
    for (let p = 0; p < 5; p++) q.add(new THREE.Mesh(new THREE.IcosahedronGeometry(1, 1), mat({ color: 0xf2ffe0, unlit: 0.9, see: 0.45 })));   // the puff: a cloud that bursts out of the nose
    return q;
  });
  faceAt(D, NOSE, g.position); g.quaternion.identity(); g.scale.setScalar(1);
  g.children.forEach((b, i) => {
    if (i >= SNZ.length) { const p = i - SNZ.length, u = Math.min(1, k / 0.25); b.position.copy(SNZ[p * 7]).applyQuaternion(_fq).multiplyScalar((0.12 + 0.35 * u) * s); b.scale.setScalar(Math.max(0.01, (0.1 + 0.12 * u) * s * (1 - Math.max(0, k - 0.3) / 0.4))); return; }
    const v = (2.0 + (i % 6) * 0.5) * s; b.position.copy(SNZ[i]).applyQuaternion(_fq).multiplyScalar(v * k); b.position.y -= 2.0 * k * k;
    b.scale.setScalar(Math.max(0.01, (0.05 + (i % 3) * 0.018) * s * (1 - k / 0.7 * 0.5)));
  });
}
let _bubT = null;
function dreamBubble(D, B, c, t) {
  const at = B.at || 0; if (c < at || !D.hips) return;
  const s = D.curScale || D.scale || 1, R = (B.r || 0.95) * s; D.hips.getWorldPosition(_fc); _fc.y += (B.dy ?? 0.14) * s;
  if (B.pop != null && c >= B.pop) {   // droplets fly out from the rim and fall
    const k = c - B.pop; if (k >= 0.5) return;
    const g = faceProp(D, 'dreambits', () => { const q = new THREE.Group(), ms = [0xffffff, 0xff9ad8, 0x9af0ff, 0xfff09a].map(col => mat({ color: col, unlit: 1 })); for (let i = 0; i < 28; i++) q.add(new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), ms[i % 4])); return q; });
    g.position.copy(_fc); g.children.forEach((b, i) => { const d = BURST[i % 14]; b.position.copy(d).multiplyScalar(R * (1 + k * (i < 14 ? 2.2 : 1.3))); b.position.y -= 2.5 * k * k; b.position.x += i >= 14 ? 0.1 * R : 0; b.scale.setScalar(Math.max(0.01, 0.06 * s * (1 - k / 0.5))); });
    return;
  }
  const u = B.full != null && B.full > at ? sm((c - at) / (B.full - at)) : 1, rr = R * (0.15 + 0.85 * u);
  const g = faceProp(D, 'dream', () => {
    _bubT = _bubT || tex(32, 32, (x, r) => { const C = ['#ffb8e8', '#b8f4ff', '#fff4b0', '#d8c0ff', '#c0ffe0']; for (let i = -32; i < 64; i += 4) for (let y = 0; y < 32; y++) { x.fillStyle = C[((i / 4) % 5 + 5) % 5]; x.fillRect(i + y, y, 4, 1); } for (let i = 0; i < 12; i++) px(x, '#ffffff', Math.floor(r() * 30), Math.floor(r() * 30), 2, 1); }, 1401);
    const q = new THREE.Group(); q.add(new THREE.Mesh(new THREE.IcosahedronGeometry(1, 2), mat({ map: _bubT, unlit: 0.75, see: 0.58 })));
    const rim = new THREE.Mesh(new THREE.TorusGeometry(1, 0.025, 4, 32), mat({ color: 0xf4f0ff, unlit: 1 })); q.add(rim);
    const gl = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.16, 0.05), mat({ color: 0xffffff, unlit: 1 })); q.add(gl); const gl2 = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.07, 0.05), mat({ color: 0xffffff, unlit: 1 })); q.add(gl2);
    return q;
  });
  g.position.copy(_fc); g.scale.setScalar(rr);
  const [ball, rim, gl, gl2] = g.children; ball.rotation.set(0.3 * Math.sin(t * 0.4), t * 0.3, 0); ball.material.uniforms.uOff.value.set(t * 0.04, t * 0.06);
  ball.material.uniforms.uSee.value = B.see ?? 0.58;   // see: clearer for a close lens (at 0.58 the dither turned him to mush from 2 m, the critic's catch)
  camera.getWorldPosition(_fo); const toCam = _fo.sub(_fc).normalize(); rim.lookAt(camera.position); rim.position.set(0, 0, 0);
  _fr.setFromMatrixColumn(camera.matrixWorld, 0); _fu.setFromMatrixColumn(camera.matrixWorld, 1);
  gl.position.copy(toCam).multiplyScalar(0.9).addScaledVector(_fu, 0.42).addScaledVector(_fr, -0.36); gl.lookAt(camera.position);
  gl2.position.copy(toCam).multiplyScalar(0.92).addScaledVector(_fu, 0.26).addScaledVector(_fr, -0.5); gl2.lookAt(camera.position);
}
function mothOut(D, k, pale) {   // a dusky moth flutters out of the open wallet, up his right side (across his face it read as a plank), dark against the lit shop window; pale ("No Scrubs", 2026-10-05): cream wings, bigger, for a night sky
  if (!D.walletAt || k > 1.6) return;
  const g = faceProp(D, pale ? 'mothPale' : 'moth', () => { const q = new THREE.Group(), m = mat({ color: pale ? 0xf4ead0 : 0x6a6258, unlit: pale ? 0.6 : 0 }); q.add(new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.03, 0.08), mat({ color: 0x2a2620 }))); for (const sd of [-1, 1]) { const w = new THREE.Group(), p = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.012, 0.08), m); p.position.x = sd * 0.05; w.add(p); q.add(w); } return q; });
  const s = D.curScale || D.scale || 1; camera.updateMatrixWorld(); _fr.setFromMatrixColumn(camera.matrixWorld, 0); camera.getWorldPosition(_fc).sub(D.walletAt).normalize();   // up and off to the screen's right, never across his face
  const side = pale ? 0.22 + 0.18 * k : 0.5 + 0.35 * k, rise = pale ? 0.1 + 0.5 * k : 0.08 + 0.55 * k;   // the pale one keeps near the wallet: a close lens lost it off the frame's edge
  g.position.copy(D.walletAt).addScaledVector(_fr, side * s).addScaledVector(_fc, 0.1 * s).add(_fo.set(0.05 * Math.sin(k * 9), rise * s, 0)); g.scale.setScalar(s * (pale ? 3.2 : 2.2));
  const f = Math.sin(k * 55); g.children[1].rotation.z = 0.9 * f; g.children[2].rotation.z = -0.9 * f; g.rotation.set(0.3, k * 2, 0);
}
function splashAt(D, to, k) {   // a tossed prop hits the water: a white ring spreading and droplets thrown up
  if (k < 0 || k > 0.7) return;
  const g = faceProp(D, 'splash', () => { const q = new THREE.Group(), m = mat({ color: 0xf4f8ff, unlit: 1 }); for (let i = 0; i < 22; i++) q.add(new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), m)); return q; });
  g.position.set(to[0], to[1], to[2]);
  g.children.forEach((b, i) => {
    if (i < 12) { const a = i / 12 * Math.PI * 2, rr = 0.12 + k * 1.3; b.position.set(Math.cos(a) * rr, 0.02, Math.sin(a) * rr); b.scale.set(0.13, 0.04, 0.13).multiplyScalar(Math.max(0.05, 1 - k / 0.7)); }
    else { const a = (i - 12) / 10 * Math.PI * 2, v = 2.4 + 0.8 * ((i * 7) % 3); b.position.set(Math.cos(a) * 0.15 * (1 + k * 2), v * k - 4.9 * k * k, Math.sin(a) * 0.15 * (1 + k * 2)); b.scale.setScalar(Math.max(0.01, 0.09 * (1 - k / 0.7))); }
  });
}
// The held plug's cable: a thick black run from the paw to where it goes into the booth (`cable: [x, y, z]`)
function plugCable(D, to, side = 'R') {   // side: the paw holding the plug ('Golden': Kob's left, on the lens side)
  const key = D.base + ':cable'; if (!PROPS[key]) { PROPS[key] = new THREE.Mesh(new THREE.BoxGeometry(0.055, 1, 0.055), mat({ color: 0xff7a1a, unlit: 0.25 })); scene.add(PROPS[key]); }   // the orange lead, like the map's
  const c = PROPS[key], p = palm(D, side); if (!p) return;
  const a = p.clone(), b = new THREE.Vector3(...to), d = b.clone().sub(a);
  c.visible = true; c.position.copy(a).add(b).multiplyScalar(0.5); c.scale.set(1, d.length(), 1); c.quaternion.setFromUnitVectors(_up, d.normalize());
}
// ---- A lying body rests on its torso (the user, 2026-09-26: "the head can be in the ground, it's ok, but the body needs
// to be the closest to the ground; a bit in the ground is ok"). The chibi head is wider than the torso is thick, so a
// Mixamo lying pose (made for human proportions) grounded on its lowest point balanced the body on the back of its head:
// the torso 10-25 cm and the legs up to 35 cm in the air, the shadow off to one side. A body whose spine lies flat is
// grounded on its torso, LIE_SINK into the floor, and its head goes through the floor; `spineFlat` blends it in as the
// spine tips over in a fall. Parts come from each vertex's heaviest bone (cached per mesh: the weights never change).
const LIE_SINK = 0.015, _lv = new THREE.Vector3(), _lw = new THREE.Vector3(), _parts = new WeakMap();
const PART = n => { n = n.replace(/^mixamorig:?/, ''); return /^(Neck|Head)/.test(n) ? 'head' : /^Left(UpLeg|Leg|Foot|Toe)/.test(n) ? 'legL' : /^Right(UpLeg|Leg|Foot|Toe)/.test(n) ? 'legR' : /^Left(Arm|ForeArm|Hand)/.test(n) ? 'armL' : /^Right(Arm|ForeArm|Hand)/.test(n) ? 'armR' : 'torso'; };
function partsOf(o) {   // { part: [vertex indices] } of a skinned mesh, every second vertex (like the QA)
  let P = _parts.get(o); if (P) return P;
  P = {}; const si = o.geometry.attributes.skinIndex, sw = o.geometry.attributes.skinWeight, n = o.geometry.attributes.position.count, names = o.skeleton.bones.map(b => PART(b.name));
  for (let i = 0; i < n; i += 2) { let bi = 0, bw = -1; for (let k = 0; k < 4; k++) { const w = sw.getComponent(i, k); if (w > bw) { bw = w; bi = si.getComponent(i, k); } } (P[names[bi]] ||= []).push(i); }
  _parts.set(o, P); return P;
}
function partLows(D) {   // lowest world y of each body part over the visible skinned meshes
  const L = { head: Infinity, torso: Infinity, legL: Infinity, legR: Infinity, armL: Infinity, armR: Infinity };
  D.root.traverse(o => { if (!o.isSkinnedMesh || !o.visible) return; for (const [p, ix] of Object.entries(partsOf(o))) for (const i of ix) { o.getVertexPosition(i, _lv); _lv.applyMatrix4(o.matrixWorld); if (_lv.y < L[p]) L[p] = _lv.y; } });
  return L;
}
function boneOf(D, re) { const k = 'bone:' + re.source; if (!(k in D)) { D[k] = null; D.root.traverse(o => { if (!D[k] && o.isBone && re.test(o.name)) D[k] = o; }); } return D[k]; }
function spineFlat(D) {   // 0 while the hips-to-neck line is within 45 deg of upright, 1 once it lies within 20 deg of the floor
  const neck = boneOf(D, /Neck$/); if (!D.hips || !neck) return 0;
  D.hips.getWorldPosition(_lv); neck.getWorldPosition(_lw).sub(_lv);
  return sm((Math.acos(Math.min(1, Math.abs(_lw.y) / (_lw.length() || 1))) * 180 / Math.PI - 45) / 25);
}
const _lc = new THREE.Vector3(), _lq = new THREE.Quaternion(), _lqw = new THREE.Quaternion(), _lqp = new THREE.Quaternion(), _lax = new THREE.Vector3();
function partLow1(D, part, c) {   // lowest world y of one body part (its centroid into c when given)
  let low = Infinity, n = 0; if (c) c.set(0, 0, 0);
  D.root.traverse(o => { if (!o.isSkinnedMesh || !o.visible) return; for (const i of partsOf(o)[part] || []) { o.getVertexPosition(i, _lv); _lv.applyMatrix4(o.matrixWorld); if (_lv.y < low) low = _lv.y; if (c) { c.add(_lv); n++; } } });
  if (c && n) c.divideScalar(n); return low;
}
// A limb lying beside a round torso floats (a thin leg off the hip joint sat 10-20 cm up): turn it down at its root
// joint, about the level axis across it, until its lowest point has dropped by `drop` m (at most `max` rad; bisection).
// The mixer only writes a bone whose clip value changed since its last update, so on a held pose (a `once` clip's last
// frame, a still track) a turn carried into the next frame and stacked up (the swung legs then read as standing and
// the body floated 15 cm): every turned bone is put back to its clip rotation before the next frame poses anyone.
const SWUNG = [];
function unswing() { for (const [b, q] of SWUNG) b.quaternion.copy(q); SWUNG.length = 0; }
function swingDown(D, part, bone, drop, max) {
  if (!bone || drop < 0.01) return;
  const low0 = partLow1(D, part, _lc); _lax.crossVectors(_up, _lc.sub(bone.getWorldPosition(_lw))); if (_lax.lengthSq() < 1e-8) return; _lax.normalize();
  SWUNG.push([bone, bone.quaternion.clone()]); bone.getWorldQuaternion(_lqw); bone.parent.getWorldQuaternion(_lqp).invert();
  const turn = a => { bone.quaternion.copy(_lqp).multiply(_lq.setFromAxisAngle(_lax, a)).multiply(_lqw); bone.updateMatrixWorld(true); };
  let lo = 0, hi = max; turn(hi); if (low0 - partLow1(D, part) <= drop) return;   // not enough even at the limit: keep the limit
  for (let k = 0; k < 8; k++) { const m = (lo + hi) / 2; turn(m); if (low0 - partLow1(D, part) >= drop) hi = m; else lo = m; }
  turn(hi);
}
// How much a body lies on the floor (0..1): its spine flat, a thigh off the vertical (a knee up still counts), no upper
// arm propping it up, and its head or torso below its feet. Standing, bowing, twerking and kneeling keep both thighs
// under the hips, crawling and push-ups prop the body on the arms, and a squat keeps the head above the feet, so they
// all stay on their limbs ("Die Young": Compote crawling, her big head lower than her knees, sank 12 cm when only the
// spine and the head were checked). In a fall it ramps in over the 10 cm the head drops below the feet.
const down = (a, b) => { if (!a || !b) return 0; a.getWorldPosition(_lc); b.getWorldPosition(_lw).sub(_lc); return -_lw.y / (_lw.length() || 1); };   // 1: b hangs straight below a
function lyingWeight(D, L, s) {
  const f = spineFlat(D); if (f <= 0) return 0;
  const legs = Math.max(...[['Left', 'L'], ['Right', 'R']].map(([k]) => 1 - sm((down(boneOf(D, new RegExp(k + 'UpLeg$')), boneOf(D, new RegExp(k + 'Leg$'))) - 0.7) / 0.2)));
  const propped = Math.max(sm((down(D.L, D.foreL) - 0.75) / 0.15), sm((down(D.R, D.foreR) - 0.75) / 0.15));
  const low = sm((Math.min(L.legL, L.legR) - Math.min(L.head, L.torso)) / (0.1 * s));
  D.lyingWhy = [f, legs, propped, low].map(v => +v.toFixed(2)); return f * legs * (1 - propped) * low;   // for LIE_PROBE
}
// Settle a lying body (weight w, part lows L): its legs, and the arms the shot doesn't use, swing down to the torso's
// level, unless they're above the hips (a leg crossed over, a paw on the belly: pushed down they'd go into the body).
// Returns the height to ground on (world y): the lowest point blended into the torso's, LIE_SINK in, by w.
function settleLying(D, A, w, s, L) {
  const hy = D.hips.getWorldPosition(_lw).y, limbs = [['legL', /LeftUpLeg$/, 0.9], ['legR', /RightUpLeg$/, 0.9]];
  if (!A.arm && !A.hold && !A.holdL) limbs.push(['armL', /LeftArm$/, 0.7], ['armR', /RightArm$/, 0.7]);
  for (const [p, re, max] of limbs) if (L[p] < hy) swingDown(D, p, boneOf(D, re), (L[p] - L.torso) * w, max);
  const M = partLows(D), all = Math.min(M.head, M.torso, M.legL, M.legR, M.armL, M.armR);
  return all + (M.torso + LIE_SINK * s - all) * w;   // the holder drops by this: the torso ends LIE_SINK under the floor
}
function lieShadow(D, w) {   // the blob stretched under a lying body: an ellipse on its footprint (x, z moments of the vertices), blended in by w
  let n = 0, mx = 0, mz = 0, xx = 0, zz = 0, xz = 0;
  D.root.traverse(o => { if (!o.isSkinnedMesh || !o.visible) return; const c = o.geometry.attributes.position.count;
    for (let i = 0; i < c; i += 9) { o.getVertexPosition(i, _lv); _lv.applyMatrix4(o.matrixWorld); n++; mx += _lv.x; mz += _lv.z; xx += _lv.x * _lv.x; zz += _lv.z * _lv.z; xz += _lv.x * _lv.z; } });
  if (!n) return;
  mx /= n; mz /= n; const a = xx / n - mx * mx, c = zz / n - mz * mz, b = xz / n - mx * mz, m = (a + c) / 2, d = Math.sqrt(((a - c) / 2) ** 2 + b * b);
  const S = D.shadow, r0 = S.scale.x * 0.45, ax = r => (r0 + (2.2 * Math.sqrt(Math.max(0, r)) + 0.06 - r0) * w) / 0.45;   // the plane is 0.9 m: its disc has a 0.45 m radius
  S.position.x += (mx - S.position.x) * w; S.position.z += (mz - S.position.z) * w;
  S.rotation.z = -0.5 * Math.atan2(2 * b, a - c); S.scale.set(ax(m + d), ax(m - d), 1);   // local x = the major axis (the plane lies flat: local y is world -z)
}
function placeActors(P, t, t0, t1, camAng, map) {
  // the mixer only rewrites a bone whose clip value changed, so on a held clip (speed 0: a statue) last frame's arm aims
  // stayed on: Kob kept a raised paw into the next shot (2026-09-27). Put the aimed bones back before anyone is posed.
  for (const D of Object.values(CREW)) if (D.aimSaved) { for (const [bone, q] of D.aimSaved) bone.quaternion.copy(q); D.aimSaved = null; }
  for (const D of Object.values(CREW)) { D.holder.visible = false; D.shadow.visible = false; D.air = false; D.fg = false; D.deck = 0; D.lying = 0; D.lyingWhy = null; D.curScale = D.scale || 1; D.holder.scale.setScalar(D.curScale); }
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
    const s = (D.scale || 1) * A.scale, bob = A.ride && A.ride !== 'trolley' ? 0.035 * Math.sin(t * 3.1) + 0.02 * Math.sin(t * 5.3 + 1) : 0;
    const um = A.my ? sm((t - t0 - A.myAt) / (A.myDur ?? Math.max(0.01, len - A.myAt))) : 0, bb = bp(t), jolt = A.bump && bb >= 0 ? A.bump * Math.exp(-fr(bb) * 7) : 0;
    const dip = A.dip ? -A.dip[0] * (0.5 + 0.5 * Math.sin((t - t0) * A.dip[1])) : 0;   // dip: [m, rad/s], bobbing under the waves (a swimmer in trouble)
    let hitHop = 0; if (A.bumps) for (const h of A.bumps) { const d = t - t0 - h; if (d >= 0 && d < 0.25) { const v = (A.bumpAmp ?? 0.09) * Math.sin(d / 0.25 * Math.PI); if (Math.abs(v) > Math.abs(hitHop)) hitHop = v; } }   // bumps: the bathtub's wall hits ("Jamaican (Bam Bam)")
    const lift = A.lift + bob + A.my * um + jolt + dip + hitHop;   // my: a rise or a sink; bump: turbulence jolts on the beat
    D.curScale = s; D.holdScale = A.holdScale; D.holder.scale.setScalar(s); D.air = A.air; D.fg = A.fg || t - t0 < A.reveal;
    wearOutfit(D, A.look); D.holder.visible = true; D.shadow.visible = !A.ride && !A.noShadow;
    if (A.hideParts) for (const m of D.outfits?.[A.look] || []) if (A.hideParts.includes(m.userData.part)) m.visible = false;   // the skeleton's stolen bones
    for (const [k, a] of Object.entries(D.actions)) a.weight = k === n ? 1 : 0;
    const th = A.holdAt != null ? Math.min(t, t0 + A.holdAt) : t;   // holdAt: frozen from there on
    if (n) { const d = D.clips[n].duration, tc = at + (th - t0) * A.speed; D.actions[n].time = A.once ? Math.min(Math.max(0, tc), d - 1e-3) : ((tc % d) + d) % d; }
    D.mixer.update(0);
    const u = cl((t - t0 - A.moveAt) / Math.max(0.01, len - A.moveAt));   // mx, mz: a walk-in across the shot (the clips' own root motion is pinned), from moveAt s
    let shoveX = 0; if (A.shove) for (const [h, dx] of A.shove) { const d = t - t0 - h; shoveX += dx * (d < -0.15 ? 0 : d < 0 ? sm((d + 0.15) / 0.15) : d < 0.12 ? 1 : Math.exp(-(d - 0.12) * 5)); }   // shove: [[s, dx]], slammed sideways into a wall ("Jamaican (Bam Bam)")
    D.holder.rotation.set(0, yaw, 0); D.holder.position.set(A.x + A.mx * u + shoveX, ground * s + lift, A.z + A.mz * u);
    D.roll = swayRoll(A, th); if (D.roll) D.holder.rotateOnAxis(_rf.set(Math.sin(fyaw), 0, Math.cos(fyaw)), D.roll);
    if (A.lean) D.holder.rotateOnAxis(_rf.set(Math.cos(fyaw), 0, -Math.sin(fyaw)), A.lean);   // leaned forward, pivoting on the feet   // sway: tilted side to side on the beat, pivoting on the feet
    D.holder.updateMatrixWorld(true);
    if (A.arm || A.armB) {
      D.aimSaved = [D.L, D.R, D.foreL, D.foreR].filter(Boolean).map(bone => [bone, bone.quaternion.clone()]);
      if (A.arm) aimArms(D, A, yaw + fyaw, th - t0, th);
      if (A.armB) aimArms(D, { ...A, arm: A.armB, aim: A.aimB, aim2: null, wave: 0, flapEvery: null, flapPh: 0 }, yaw + fyaw, th - t0, th);   // the other paw's own aim or swing
    }
    // the toes set the shot's floor, but a hem, a paw or a big head can reach lower: never let the mesh sink;
    // "mesh" grounding keeps the lowest point on the floor every frame (falling); a flat body touching the floor is
    // grounded on its torso instead, the head through the floor (see LIE_SINK)
    let low = meshLow(D, 3) - lift;
    let flat = 0;
    if ((A.ground === 'mesh' || low < 0.1 * s) && spineFlat(D) > 0 && !A.noLie) { const L = partLows(D); flat = lyingWeight(D, L, s); if (flat > 0) low = settleLying(D, A, flat, s, L) - lift; D.lying = flat; }
    if (A.ground === 'mesh' || low < 0 || flat > 0) { D.holder.position.y -= low; D.holder.updateMatrixWorld(true); }
    if (A.hop && th - t0 >= 0) {   // the hot-sand hop: a parabola every A.hop[1] beats, on top of the grounded pose (the QA's floor stays at lift)
      const hu = fr((bp(th) - A.hopPh) / A.hop[1]); D.holder.position.y += A.hop[0] * 4 * hu * (1 - hu); D.holder.updateMatrixWorld(true);
    }
    D.deck = lift;
    const up = Math.max(0, footY(D) / s - D.restFoot - lift / s) * (1 - flat);
    const hp = D.hips ? D.hips.getWorldPosition(_pb) : D.holder.position;
    D.shadow.position.set(hp.x, (map.shadowY ?? 0.012) + lift - hitHop, hp.z); D.shadow.rotation.z = 0;   // a hit's hop leaves the shadow on the floor D.shadow.scale.setScalar(s * Math.max(0.5, 1 - up * 0.8) * (A.ground === 'mesh' ? 1.5 : 1));
    if (flat > 0) lieShadow(D, flat);
    D.shadow.material.uniforms.uShadow.value = SHADOW * Math.max(0.35, 1 - up);
    D.shadow.material.uniforms.uShadowCol.value.set(map.shadowCol || 0x333333);
    const bodyYaw = yaw + fyaw;
    const tossed = A.toss && t - t0 >= A.toss.at, holding = (A.holdFrom == null || t - t0 >= A.holdFrom) && (A.holdTo == null || t - t0 < A.holdTo);
    D.hookTo = A.hookTo; D.petalsLeft = A.petalsLeft; D.petalFall = A.petalFall; D.pluckEvery = A.pluckEvery; D.since = t - t0; D.twoPaw = A.arm === 'both';
    if (A.hold && !tossed && holding) holdProp(D, A.hold, 'R', bodyYaw, t);
    if (A.holdL && (A.hold || holding)) holdProp(D, A.holdL, 'L', bodyYaw, t);   // with no right-paw prop, holdFrom/holdTo time the left one
    if (tossed) tossProp(D, A, bodyYaw, A.holdAt != null ? Math.min(t - t0, A.holdAt) : t - t0);   // a frozen photo freezes it mid-air ("DtMF")
    if (A.pelt) peltFruit(D, A, bodyYaw, t - t0);
    if (A.cable && (A.hold === 'plug' || A.holdL === 'plug') && holding) plugCable(D, A.cable, A.hold === 'plug' ? 'R' : 'L');
    if (A.ride === 'jetski') rideJetski(D, bodyYaw, lift, t);
    if (A.ride === 'trolley') rideTrolley(D, bodyYaw + A.rideYaw, A.rideY ?? 0, t);
    if (A.ride === 'duck') rideDuck(D, bodyYaw + A.rideYaw, A.rideY != null ? A.rideY + 0.15 + bob : lift, t);   // rideY: the float's base (standing in the ring, legs in the water)
    if (A.hat && (A.hatFrom == null || t - t0 >= A.hatFrom) && D.head) wearHat(D, A.hat, bodyYaw, A.hatY);
    if (A.gum && D.head) blowGum(D, A.gum, t - t0, t);
    if (A.splat != null && t - t0 >= A.splat && D.head) gumSplat(D);
    if (A.buds != null && A.buds !== false && (A.buds === true || t - t0 >= A.buds) && D.head) earbuds(D);
    if (A.phones && D.head) headphones(D);
    if (A.bubble) dreamBubble(D, A.bubble, t - t0, t);
    if (A.moth != null && t - t0 >= A.moth) mothOut(D, t - t0 - A.moth, A.mothPale);
    if (A.nose != null && A.nose !== false && (A.nose === true || t - t0 >= A.nose) && D.head) redNose(D);
    if (A.therm && D.head) thermometer(D);
    if (A.mask && D.head) faceMask(D);
    if (A.sleep != null && A.sleep !== false && (A.sleep === true || t - t0 >= A.sleep) && D.head) sleepMask(D, A.look === 'pyjama' && D === CREW.kob, SLEEP_AT[A.look]);   // true, or from s into the shot
    if (A.cucumbers != null && A.cucumbers !== false && D.head) { const C = typeof A.cucumbers === "object" ? A.cucumbers : { at: A.cucumbers === true ? -9 : A.cucumbers }; if (t - t0 >= (C.at ?? -9)) cucumberSlices(D, C); }   // true, s into the shot, or { at, off, r } (a head-frame offset and a size, per look)
    if (A.sneeze != null && D.head) sneezeSpray(D, t - t0 - A.sneeze);
    if (A.googly != null && A.googly !== false && D.head) { const Gy = typeof A.googly === 'object' ? A.googly : { at: A.googly === true ? -9 : A.googly }; if (t - t0 >= (Gy.at ?? -9)) googlyEyes(D, Gy, t - t0 - (Gy.at ?? -9), t); }   // the espresso hits
    if (A.shades != null && A.shades !== false && D.head) sunglasses(D, A.shades, t - t0);
    if (A.visor && D.head) dealerVisor(D);
    if (A.dizzy != null && A.dizzy !== false && (A.dizzy === true || t - t0 >= A.dizzy) && D.head) dizzyStars(D, t);
    if (A.chew != null && A.chew !== false && (A.chew === true || t - t0 >= A.chew) && D.head) chewBone(D);
    if (A.tongue != null && A.tongue !== false && (A.tongue === true || t - t0 >= A.tongue) && D.head) dogTongue(D, t);
    if (A.ballMouth != null && A.ballMouth !== false && (A.ballMouth === true || t - t0 >= A.ballMouth) && D.head) mouthBall(D);
    if (A.steakMouth != null && A.steakMouth !== false && (A.steakMouth === true || t - t0 >= A.steakMouth) && D.head) mouthSteak(D);
    if (A.sip != null && A.sip !== false && (A.sip === true || t - t0 >= A.sip) && D.head && D.handR) sipStraw(D, A.sipHand);
    if (A.treat && D.head) biscuitTrick(D, A.treat, t - t0);
    if (A.star && D.head) { D.head.getWorldPosition(_pa).project(camera); if (Math.abs(_pa.x) < 1.1 && _pa.z < 1) stars.push([_pa.x, A.who]); }
  }
  window.STARS = [...new Set(stars.sort((a, b) => a[0] - b[0]).map(s => s[1]))].slice(0, 2);   // more than two faces cover the lyrics
  if (P.stars) window.STARS = P.stars;   // a shot can name the faces itself (Kob's empty sofa shows hers)
  else if (!window.STARS.length) window.STARS = [P.actors[0]?.who || 'saxo'];
}

const _cm = new THREE.Matrix4(), _cm2 = new THREE.Matrix4(), _cmL = new THREE.Matrix4(), _cq = new THREE.Quaternion(), _cp = new THREE.Vector3(), _cs = new THREE.Vector3(), _ch = new THREE.Vector3();
function crowdSpots(c) {   // pure in the shot's spec: { x, z, jy (a small yaw jitter), row, a, r (ring spots) }
  const n = Math.min(99, c.n || 99), j = c.jitter ?? 0.15, out = [], holed = (x, z) => (c.skip || []).some(([sx, sz, sr]) => (x - sx) ** 2 + (z - sz) ** 2 < sr * sr);
  if (c.ring) {   // concentric circles round [cx, cz, r0], n shared out by circumference, alternate rows staggered
    const [cx, cz, r0] = c.ring, rows = c.rows || 1, dr = c.dr || 0.9, rs = Array.from({ length: rows }, (_, k) => r0 + k * dr), sum = rs.reduce((p, q) => p + q, 0);
    let left = n;
    rs.forEach((r, k) => {
      const m = k === rows - 1 ? left : Math.round(n * r / sum); left -= m;
      for (let q = 0; q < m; q++) {
        const ang = (q + 0.5 * (k % 2)) / m * TAU + (c.a0 || 0) * Math.PI / 180 + (hash2(k, q, 4) - 0.5) * 0.08, rr = r + (hash2(k, q, 1) - 0.5) * 2 * j;
        const x = cx + Math.sin(ang) * rr, z = cz + Math.cos(ang) * rr;
        if (!holed(x, z)) out.push({ x, z, jy: (hash2(k, q, 3) - 0.5) * 0.18, row: k, a: ang, r: rr });
      }
    });
    return out;
  }
  const cols = c.cols || 11;
  for (let r = 0; r < 40 && out.length < n; r++) for (let q = 0; q < cols && out.length < n; q++) {
    const x = (c.x0 || 0) + (q - (cols - 1) / 2) * (c.dx || 0.9) + (hash2(r, q, 1) - 0.5) * 2 * j, z = (c.z0 || 0) - r * (c.dz || 0.85) + (hash2(r, q, 2) - 0.5) * 2 * j;
    if (!holed(x, z)) out.push({ x, z, jy: (hash2(r, q, 3) - 0.5) * 0.18, row: r });
  }
  return out;
}
function hash2(a, b, c) { const x = Math.sin(a * 127.1 + b * 311.7 + c * 74.7) * 43758.5453; return x - Math.floor(x); }
function placeCrowd(P, t, t0, t1, camAng) {
  for (const C of Object.values(CROWDS)) { C.copies.forEach(ps => ps.forEach(k => { k.visible = false; })); C.shadows.forEach(sh => { sh.visible = false; }); }
  if (P && P.crowd) [].concat(P.crowd).forEach((c, i) => placeOneCrowd(c, CROWDS[crowdKey(c, i)], t, t0, t1, camAng));
}
const _cr = new THREE.Quaternion(), _cf = new THREE.Vector3();
function placeOneCrowd(c, C, t, t0, t1, camAng) {
  if (!C) return;
  // c.scale: a crowd of one small copy is a second Saxo beside the real one (the tiny devil on his shoulder, "Patient Zero")
  const R = C.R, s = (C.D.scale || 1) * (c.scale || 1), len = t1 - t0, speed = c.speed ?? 1, span = Math.max(0.1, len * speed);
  // the mixer only rewrites a bone whose clip value changed, so last frame's arm aims would stay on a held clip: undo them first
  if (C.saved) { for (const [bone, q] of C.saved) bone.quaternion.copy(q); C.saved = null; }
  const n = R.actions[c.clip] ? c.clip : Object.keys(R.actions)[0];
  const at = c.at == null || c.at === 'auto' ? steadiestOffset(tripo, n, span) : c.at;
  const clipYaw = clipFacing(tripo, n, at, span).yaw, fyaw = c.face === 'world' ? 0 : clipYaw, yaw = (c.face === 'world' ? 0 : -fyaw + camAng) + (c.yaw || 0) * Math.PI / 180;
  const ground = clipGround(tripo, n, at, span);
  for (const [k, a] of Object.entries(R.actions)) a.weight = k === n ? 1 : 0;
  // holdAt: frozen from there on, like an actor (the tiny double held the photo's pose while Saxo's froze: 2026-09-28)
  const th = c.holdAt != null ? Math.min(t, t0 + c.holdAt) : t;
  const d = R.clips[n].duration, tc = at + (th - t0) * speed; R.actions[n].time = c.once ? Math.min(Math.max(0, tc), d - 1e-3) : ((tc % d) + d) % d;
  R.mixer.update(0); R.holder.rotation.set(0, 0, 0); R.holder.position.set(0, ground * s, 0); R.holder.updateMatrixWorld(true);
  if (c.arm) { C.saved = [R.L, R.R, R.foreL, R.foreR].filter(Boolean).map(bone => [bone, bone.quaternion.clone()]); R.roll = 0; aimArms(R, c, clipYaw, th - t0, th); }
  const inv = _cm2.copy(R.holder.matrixWorld).invert(), u = cl((t - t0) / len), mx = (c.mx || 0) * u, mz = (c.mz || 0) * u;
  const spots = crowdSpots(c), roll = swayRoll(c, th), spin = (c.spin || 0) * Math.PI / 180 * u, yb = sp => (c.y0 || 0) + sp.row * (c.dy || 0);
  _cr.setFromAxisAngle(_cf.set(Math.sin(clipYaw), 0, Math.cos(clipYaw)), roll);   // the sway, about the body's own forward axis
  const spot = sp => {   // where a copy stands and which way its holder turns
    let x = sp.x, z = sp.z;
    if (c.ring && spin) { x = c.ring[0] + Math.sin(sp.a + spin) * sp.r; z = c.ring[1] + Math.cos(sp.a + spin) * sp.r; }
    let y = yaw;
    if (c.ring && c.face !== 'camera' && c.face !== 'world') {
      const inward = Math.atan2(c.ring[0] - x, c.ring[1] - z);
      y = inward + ({ in: 0, out: Math.PI, cw: -Math.PI / 2, ccw: Math.PI / 2 }[c.face || 'in'] || 0) - clipYaw + (c.yaw || 0) * Math.PI / 180;
    }
    if (c.lookAt) y = Math.atan2(c.lookAt[0] - x, c.lookAt[1] - z) - clipYaw + (c.yaw || 0) * Math.PI / 180;
    return [x + mx, z + mz, y];
  };
  const place = (i, lift) => {
    const sp = spots[i], parts = C.copies[i]; if (!parts) return null;
    const [x, z, y] = spot(sp);
    _cq.setFromAxisAngle(_up, y + sp.jy).multiply(_cr); _cm.compose(_cp.set(x, ground * s + lift + yb(sp), z), _cq, _cs.setScalar(s)).multiply(inv);
    for (const k of parts) { k.matrix.multiplyMatrices(_cm, k.bindMatrix); k.matrixWorldNeedsUpdate = true; k.updateMatrixWorld(true); k.visible = !(c.hideParts || []).includes(k.userData.part); }   // hideParts: the skeletons' missing bones
    return _cm;
  };
  // never sink: the lowest point of the first copy (they share the pose) sets a lift for all of them, from its own row's floor
  let low = Infinity; if (spots.length && place(0, 0)) for (const k of C.copies[0]) { const nv = k.geometry.attributes.position.count; for (let v = 0; v < nv; v += 4) { k.getVertexPosition(v, _qv); _qv.applyMatrix4(k.matrixWorld); if (_qv.y < low) low = _qv.y; } }
  low -= spots.length ? yb(spots[0]) : 0;
  const lift = low < 0 ? -low : 0;
  R.hips.getWorldPosition(_ch);
  spots.forEach((sp, i) => {
    const M = place(i, lift); if (!M) return;
    const sh = C.shadows[i], hp = _qv.copy(_ch).applyMatrix4(M); sh.visible = !c.noShadow; sh.position.set(hp.x, yb(sp) + 0.012, hp.z); sh.scale.setScalar(s);
    sh.material.uniforms.uShadow.value = SHADOW * 0.9; sh.material.uniforms.uShadowCol.value.set(curMap?.shadowCol || 0x333333);
  });
}
// a duo seen from the side lines up and one hides the other, so its camera swings less (orbits span ±54°, not ±120°)
let curMap = null;
function danceFrame(t) {
  unswing();   // last frame's lying limbs back to their clip rotations (see swingDown)
  const i = shotIndex(t), [t0, mapName, cam, outfit, sadiOutfit, CAST] = SHOTS[i], t1 = i + 1 < SHOTS.length ? SHOTS[i + 1][0] : CONFIG.duration, P = PLAN[i];
  const ACT = CAST === 'actors';   // a shot that places its characters by hand (`actors`) sets its own framing
  const ANG_K = ACT ? P.angK ?? 1 : CAST === 'duo' ? 0.45 : 1, WIDE = ACT ? P.wide ?? 1 : CAST === 'duo' ? 1.2 : 1, [FX, FZ, FY = 0] = P.focus || [0, 0];   // focus: [x, z, floor y] the camera orbits
  window.STARS = CAST === 'sadi' ? [WITH] : CAST === 'duo' && sadi ? ['saxo', WITH] : ['saxo'];   // whose emoji face rides the karaoke (dance.js)
  const map = MAPS[mapName];
  for (const m of Object.values(MAPS)) m.group.visible = m === map;   // set every frame: episode scenes switch maps too
  scene.background = map.sky; curMap = map;
  U.uWaterY.value = -1e4;   // dry unless the map floods this shot ("SWIM")
  U.uSk.value.set(0, 0, 0, -1);   // nothing drawn in pencil unless the map (its anim) or the shot says so ("Take on Me")
  map.light(); map.anim(t, P);   // anim runs after light, so a map can also relight per shot from P
  // sketch: the shot in pencil (true), none of it (false), or a plane [nx, ny, nz, d]: drawn where dot(n, p) < d (the
  // comic page's wall); window.SKETCH tells the 2D layer to turn the coded pixels into pencil (dance.js sketchFx)
  if (P.sketch != null) U.uSk.value.set(...(P.sketch === true ? [0, 0, 0, 1] : P.sketch === false ? [0, 0, 0, -1] : P.sketch));
  { const s = U.uSk.value; window.SKETCH = s.w > 0 || s.x !== 0 || s.y !== 0 || s.z !== 0; }
  // mono: the frame in black and white (true), or [a, b]: black and white until a s into the shot, colour back by b (the 2D
  // layer greys it: window.MONO, 0-1). photo: s into the shot, the frozen frame becomes an instant photo (window.PHOTO: s since)
  { const sIn = t - t0, m = P.mono; window.MONO = m === true ? 1 : Array.isArray(m) ? 1 - cl((sIn - m[0]) / Math.max(0.01, m[1] - m[0])) : 0; window.PHOTO = P.photo != null && sIn >= P.photo ? sIn - P.photo : null;
    // white: [s, …] a lightning flash over the whole frame at each listed second (two flickers, gone by 0.35 s; the 2D layer whites it out: window.WHITE, 0-1)
    window.WHITE = (P.white || []).reduce((m, f) => { const e = sIn - f; return e >= 0 && e < 0.35 ? Math.max(m, e < 0.06 ? 0.9 : e < 0.12 ? 0.25 : e < 0.18 ? 0.7 : 0.7 * Math.exp(-(e - 0.18) * 14)) : m; }, 0);
    // cctv: the shot is a security camera's feed ("Animal", 2026-10-03): its label (e.g. 'CAM 03 · CEO'), drawn by the 2D layer with a REC dot, a timecode and scanlines (window.CCTV);
    // cctvLost (s into the shot): the feed dies there, a white flash and then static with NO SIGNAL (the cat swats the camera)
    window.CCTV = P.cctv ? { label: P.cctv, s: sIn, clock: P.cctvClock ?? 85632, lost: P.cctvLost } : null; }
  const u = cl((t - t0) / (t1 - t0)), sh = shake(t, i * 10), bo = bounce(t, t0, !!P.half) * (P.still ? 0 : 1);
  const k = cam.ease === 'lin' ? u : cam.ease === 'out' ? 1 - (1 - u) ** 3 : u * (0.35 + 0.65 * u);   // default: ease in, no ease out
  // [from, to], or [a, b, c…] keyframes spread evenly over the move's easing (a path: over the decks, then down)
  const keys = x => { const f = k * (x.length - 1), j = Math.min(x.length - 2, Math.floor(f)); return x[j] + (x[j + 1] - x[j]) * (f - j); };
  const lerp = x => Array.isArray(x) ? keys(x) : x, ang = lerp(cam.ang) * ANG_K * Math.PI / 180, r = lerp(cam.r) * WIDE;   // a duo needs a wider frame
  // steady: no drift at all (the constant float and the old procedural dog's sway on the look point): a locked-off camera
  const sway = cam.steady ? 0 : 1;
  camera.position.set(FX + Math.sin(ang) * r + sh[0] * 0.05 * sway, FY + lerp(cam.h) + sh[1] * 0.04 * sway - bo * 0.6, FZ + Math.cos(ang) * r + sh[2] * 0.04 * sway);
  const fov = cam.frame ? 2 * Math.atan(cam.frame * WIDE / 2 / r) * 180 / Math.PI : lerp(cam.fov);
  camera.fov = fov * (1 - bo); camera.updateProjectionMatrix();
  camera.lookAt(FX + (saxo.root.position.x * 0.6 + sh[1] * 0.03) * sway + (cam.lookX || 0), FY + lerp(cam.look), FZ);
  // whip-in: the first ~0.25 s pans fast into place; the 2D layer smears the frame by window.WHIP
  const whip = cam.whip ? Math.exp(-(t - t0) * 16) : 0; camera.rotateY(whip * 0.9); window.WHIP = whip;
  // jolt: the bass through the walls kicks the whole frame on every beat (a drop and a small roll, decaying through the beat)
  if (Array.isArray(P.jolt)) { let j = 0, sg = 1; P.jolt.forEach((h, q) => { const d = t - t0 - h; if (d >= 0 && d < 0.6) { const v = 2.2 * Math.exp(-d * 9); if (v > j) { j = v; sg = q % 2 ? 1 : -1; } } }); camera.position.y -= 0.045 * j; camera.rotateZ(0.022 * j * sg); }   // jolt: [s, ...]: a kick on each listed second (a wall hit)
  else if (P.jolt) { const pos = bp(t), nb = Math.floor(pos + 1e-6), f = pos - nb, j = nb >= 0 ? Math.exp(-f * 7) : 0; camera.position.y -= 0.045 * j; camera.rotateZ(0.022 * j * (nb % 2 ? 1 : -1)); }
  // roll: a dutch angle in degrees (or [from, …, to] keyframes over the shot, on the move's easing). hand: a handheld operator on top
  // of the path (1 = the loose sway of the ratoshidance references: ~3 cm of drift, ~1° of wobble, ~1.2° of roll).
  const roll = cam.roll == null ? 0 : lerp(cam.roll), hand = cam.hand || 0, hw = (f, p) => Math.sin(t * f + p + i * 7.3);
  if (hand) {
    camera.position.x += hand * 0.03 * (0.6 * hw(2.1, 0) + 0.4 * hw(4.7, 1.7)); camera.position.y += hand * 0.02 * (0.6 * hw(2.5, 2.1) + 0.4 * hw(5.3, 0.4));
    camera.position.z += hand * 0.03 * (0.6 * hw(1.8, 4.2) + 0.4 * hw(4.1, 3.3));
    camera.rotateY(hand * 0.016 * (0.5 * hw(2.7, 5.1) + 0.3 * hw(5.9, 2.6) + 0.2 * hw(11, 0.8))); camera.rotateX(hand * 0.013 * (0.5 * hw(3.1, 0.9) + 0.3 * hw(6.4, 4.4) + 0.2 * hw(12.2, 2.9)));
  }
  if (roll || hand) camera.rotateZ((roll + hand * 1.2 * (0.6 * hw(1.9, 3.7) + 0.4 * hw(4.3, 1.1))) * Math.PI / 180);
  applyPose(saxo, poseAt(t));
  for (const g of Object.values(PROPS)) g.visible = false;
  // the crowd before the actors: its clip measurements (steadiestOffset, clipFacing, clipGround) pose Saxo's rig and leave
  // it in the crowd's clip, so placed after the actors it put Saxo in the crowd's pose once his props were placed (each
  // tab's first frame of a crowd shot, while the caches fill: the red nose 0.17 m off his face under the tiny devil,
  // 2026-09-27). Placed between placeActors and its `else`, it had also cut off the plain dance render below.
  if (tripo) placeCrowd(ACT ? P : null, t, t0, t1, (cam.ang[0] + cam.ang.at(-1)) / 2 * ANG_K * Math.PI / 180);
  if (tripo && ACT) placeActors(P, t, t0, t1, (cam.ang[0] + cam.ang.at(-1)) / 2 * ANG_K * Math.PI / 180, map);
  else if (tripo) {
    // each shot names a clip and a start offset into it; unknown names fall back to the first clip
    const [clipName, clipAt] = SHOT_CLIPS[i] || ['dance_01', 0], n = tripo.actions[clipName] ? clipName : Object.keys(tripo.actions)[0];
    if (!n) { tripo.holder.rotation.y = 0.35 * Math.sin(t * 0.8); } else {
      const at = clipAt === 'auto' ? steadiestOffset(tripo, n, t1 - t0) : clipAt;
      // bind pose faces +z at 0; turn towards the shot's average camera angle so side cameras still see the face
      const camAng = (cam.ang[0] + cam.ang.at(-1)) / 2 * ANG_K * Math.PI / 180, yaw = -clipFacing(tripo, n, at, t1 - t0).yaw + camAng;   // orbits average out to the front
      const ground = clipGround(tripo, n, at, t1 - t0);
      const cast = CAST === 'sadi' ? [[sadi, 0, sadiOutfit]] : CAST === 'duo' && sadi ? [[tripo, -DUO_X, outfit], [sadi, DUO_X, sadiOutfit]] : [[tripo, 0, outfit]];
      for (const D of Object.values(CREW)) { const on = cast.some(c => c[0] === D); D.holder.visible = on; D.shadow.visible = on; D.air = false; D.fg = false; D.deck = 0; D.curScale = D.scale || 1; D.holder.scale.setScalar(D.curScale); }
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
  // a lying body may put its head through the floor (LIE_SINK), so its lowest point leaves the head out, and once the
  // spine is flat its torso must touch the floor (`lie`, the rule "lies above the floor")
  let lie = null;
  if (spineFlat(D) > 0) { const L = partLows(D), w = lyingWeight(D, L, D.curScale || 1); if (w > 0) low = Math.min(L.torso, L.legL, L.legR, L.armL, L.armR); if (w > 0.99) lie = +(L.torso - (D.deck || 0)).toFixed(3); }
  // the head bone on screen (0..1): where the face is, for the framing rules (an arm past the edge reads fine, a face doesn't)
  const h = D.head ? D.head.getWorldPosition(_qv).project(camera) : null;
  return { who, low: +(low - (D.deck || 0)).toFixed(3), lie, air: !!D.air, box: B.map(v => +v.toFixed(3)), head: h && h.z < 1 ? [+((h.x + 1) / 2).toFixed(3), +((1 - h.y) / 2).toFixed(3)] : null, giant: (D.curScale || 1) > 2, fg: !!D.fg };
}
window.QA_PROBE = t => {
  window.render3d(t);
  return Object.entries(CREW).filter(([, D]) => D && D.holder.visible && D.holder.parent).map(([w, D]) => qaDog(D, w)).filter(d => isFinite(d.low));
};
// Debug probe for lying bodies (node render.mjs --eval="LIE_PROBE([12.5, 22.8])"): each visible actor's lowest point per
// body part above its floor (m; a lying body's head may be negative, through the floor), how flat its spine lies and the
// lying weight its grounding used (0..1)
window.LIE_PROBE = ts => ts.flatMap(t => { window.render3d(t); return Object.entries(CREW).filter(([, D]) => D.holder.visible && D.holder.parent).map(([w, D]) => {
  const L = partLows(D), r = v => +(v - (D.deck || 0)).toFixed(3);
  return { t, w, flat: +spineFlat(D).toFixed(2), lying: +(D.lying || 0).toFixed(2), why: D.lyingWhy, torso: r(L.torso), head: r(L.head), legs: r(Math.min(L.legL, L.legR)), arms: r(Math.min(L.armL, L.armR)) };
}); });
// Debug probe for staging props around a clip (node render.mjs --eval="CLIP_PROBE('gaming', [0, 1], 'kob')"): the
// character posed in the clip on the origin at yaw 0, lowest vertex on the floor; key points in metres, rounded to cm.
window.CLIP_PROBE = (name, ts = [0], who = 'saxo', look) => {
  const D = CREW[who]; if (!D) return 'no ' + who;
  unswing(); wearOutfit(D, look || D.base); D.holder.visible = true;
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
    unswing(); const p = PLAN[shotIndex(t)];
    for (const [k, r] of Object.entries(R)) if (k !== p.key) r.hide();
    if (p.kind === 'action') {
      window.MONO = 0; window.PHOTO = null; window.WHITE = 0; window.CCTV = null; window.SKETCH = false; U.uSk.value.set(0, 0, 0, -1);   // the 2D frame effects belong to dance shots
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
    if (!p.word && !p.flash && !p.flashAt) return null;
    const per = 60 / BPMv, fx = { flash: 0, pow: 0 };
    if (p.flash) { const n = Math.floor(bp(t) + 1e-6), tb = beatT(n), since = t - tb; if (tb >= p.t0 - 0.02) fx.flash = (n % 2 ? 0.22 : 0.42) * Math.exp(-since * 16); }
    // flashAt: [s, …] seconds into the shot: one camera flash each, a white-out that clears in ~0.3 s ("Billie Jean": the private eye's camera)
    for (const s of p.flashAt || []) { const d = t - (p.t0 + s); if (d >= 0) fx.flash = Math.max(fx.flash, 1.1 * Math.exp(-d * 9)); }
    if (p.word) {
      const since = t - (p.t0 + (p.wordAt ?? 1) * per);
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
