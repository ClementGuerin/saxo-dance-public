// glb2obj.mjs: convert a single-mesh Tripo GLB into a Mixamo-ready OBJ zip (obj + mtl + base colour texture).
// Usage: node tools/glb2obj.mjs <in.glb> <out.zip> [yawDeg]   yawDeg turns the model so it faces +z (Mixamo front).
import { readFileSync, writeFileSync, mkdirSync, rmSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join, basename } from 'node:path';

const [inp, out, yawArg = '-90'] = process.argv.slice(2);
const buf = readFileSync(inp), jlen = buf.readUInt32LE(12), J = JSON.parse(buf.slice(20, 20 + jlen));
const BIN = 20 + jlen + 8;
const view = i => { const bv = J.bufferViews[i]; return buf.subarray(BIN + (bv.byteOffset || 0), BIN + (bv.byteOffset || 0) + bv.byteLength); };
function acc(i) {
  const a = J.accessors[i], v = view(a.bufferView), n = { SCALAR: 1, VEC2: 2, VEC3: 3, VEC4: 4 }[a.type];
  const T = { 5126: Float32Array, 5123: Uint16Array, 5125: Uint32Array }[a.componentType];
  return new T(v.buffer, v.byteOffset + (a.byteOffset || 0), a.count * n);
}
const P = J.meshes[0].primitives[0], pos = acc(P.attributes.POSITION), nor = acc(P.attributes.NORMAL), uv = acc(P.attributes.TEXCOORD_0), idx = acc(P.indices);
const yaw = +yawArg * Math.PI / 180, c = Math.cos(yaw), s = Math.sin(yaw);
const rot = (x, z) => [x * c + z * s, -x * s + z * c];   // same convention as three.js rotation.y

const dir = out.replace(/\.zip$/, ''), name = basename(dir);
rmSync(dir, { recursive: true, force: true }); mkdirSync(dir, { recursive: true });
const img = J.images[J.textures[J.materials[0].pbrMetallicRoughness.baseColorTexture.index].source];
const ext = img.mimeType === 'image/png' ? 'png' : 'jpg';
writeFileSync(join(dir, `${name}.${ext}`), view(img.bufferView));
writeFileSync(join(dir, `${name}.mtl`), `newmtl saxo\nKd 1 1 1\nKa 0 0 0\nKs 0 0 0\nmap_Kd ${name}.${ext}\n`);

const L = [`mtllib ${name}.mtl`, `o ${name}`];
for (let i = 0; i < pos.length; i += 3) { const [x, z] = rot(pos[i], pos[i + 2]); L.push(`v ${x.toFixed(6)} ${pos[i + 1].toFixed(6)} ${z.toFixed(6)}`); }
for (let i = 0; i < uv.length; i += 2) L.push(`vt ${uv[i].toFixed(6)} ${(1 - uv[i + 1]).toFixed(6)}`);   // glTF v runs down, OBJ v runs up
for (let i = 0; i < nor.length; i += 3) { const [x, z] = rot(nor[i], nor[i + 2]); L.push(`vn ${x.toFixed(6)} ${nor[i + 1].toFixed(6)} ${z.toFixed(6)}`); }
L.push('usemtl saxo');
for (let i = 0; i < idx.length; i += 3) { const f = [idx[i] + 1, idx[i + 1] + 1, idx[i + 2] + 1]; L.push('f ' + f.map(k => `${k}/${k}/${k}`).join(' ')); }
writeFileSync(join(dir, `${name}.obj`), L.join('\n') + '\n');

rmSync(out, { force: true });
execFileSync('zip', ['-j', '-q', out, join(dir, `${name}.obj`), join(dir, `${name}.mtl`), join(dir, `${name}.${ext}`)]);
console.log(`${out}: ${pos.length / 3} verts, ${idx.length / 3} tris, texture ${ext}, yaw ${yawArg}°`);
