// nav.js: walking on the island. Circle-vs-box/circle collision for direct control, and a grid A* for click-to-move.
const CELL = 0.25;

export function makeNav(colliders, bounds, radius = 0.32) {
  const [bx0, bz0, bx1, bz1] = bounds;
  const W = Math.ceil((bx1 - bx0) / CELL), H = Math.ceil((bz1 - bz0) / CELL);
  const dyn = [];   // moving obstacles (NPCs): [x, z, r]
  const blockedAt = (x, z, r = radius) => {
    if (x < bx0 + r || x > bx1 - r || z < bz0 + r || z > bz1 - r) return true;
    for (const [x0, z0, x1, z1] of colliders.boxes) if (x > x0 - r && x < x1 + r && z > z0 - r && z < z1 + r) return true;
    for (const [cx, cz, cr] of colliders.circles) if ((x - cx) ** 2 + (z - cz) ** 2 < (cr + r) ** 2) return true;
    return false;
  };
  let grid = null;
  const build = () => {
    grid = new Uint8Array(W * H);
    for (let j = 0; j < H; j++) for (let i = 0; i < W; i++) grid[j * W + i] = blockedAt(bx0 + (i + 0.5) * CELL, bz0 + (j + 0.5) * CELL) ? 1 : 0;
  };
  build();
  const cellOf = (x, z) => [Math.max(0, Math.min(W - 1, Math.floor((x - bx0) / CELL))), Math.max(0, Math.min(H - 1, Math.floor((z - bz0) / CELL)))];
  const free = (i, j) => i >= 0 && j >= 0 && i < W && j < H && !grid[j * W + i] && !dynBlocked(bx0 + (i + 0.5) * CELL, bz0 + (j + 0.5) * CELL);
  const dynBlocked = (x, z) => dyn.some(([cx, cz, cr]) => (x - cx) ** 2 + (z - cz) ** 2 < (cr + radius) ** 2);

  // push a circle out of every obstacle (a few passes so corners resolve)
  function resolve(p, r = radius) {
    for (let pass = 0; pass < 3; pass++) {
      p.x = Math.max(bx0 + r, Math.min(bx1 - r, p.x)); p.z = Math.max(bz0 + r, Math.min(bz1 - r, p.z));
      for (const [x0, z0, x1, z1] of colliders.boxes) {
        const cx = Math.max(x0, Math.min(x1, p.x)), cz = Math.max(z0, Math.min(z1, p.z)), dx = p.x - cx, dz = p.z - cz, d2 = dx * dx + dz * dz;
        if (d2 >= r * r) continue;
        if (d2 > 1e-8) { const d = Math.sqrt(d2), k = (r - d) / d; p.x += dx * k; p.z += dz * k; }
        else { const o = [[p.x - x0 + r, -1, 0], [x1 - p.x + r, 1, 0], [p.z - z0 + r, 0, -1], [z1 - p.z + r, 0, 1]].sort((a, b) => a[0] - b[0])[0]; p.x += o[1] * o[0]; p.z += o[2] * o[0]; }
      }
      for (const [cx, cz, cr] of [...colliders.circles, ...dyn]) {
        const dx = p.x - cx, dz = p.z - cz, d = Math.hypot(dx, dz), m = cr + r;
        if (d < m && d > 1e-6) { p.x = cx + dx / d * m; p.z = cz + dz / d * m; }
      }
    }
    return p;
  }

  // A* over the grid, 8-connected, then string-pulled so the walk goes straight where it can
  function path(from, to) {
    let [si, sj] = cellOf(from.x, from.z), [ti, tj] = cellOf(to.x, to.z);
    if (!free(ti, tj)) {   // clicked on something solid: walk to the nearest free cell around it
      let best = null;
      for (let r = 1; r < 16 && !best; r++) for (let dj = -r; dj <= r; dj++) for (let di = -r; di <= r; di++) {
        if (Math.max(Math.abs(di), Math.abs(dj)) !== r || !free(ti + di, tj + dj)) continue;
        const d = di * di + dj * dj; if (!best || d < best[2]) best = [ti + di, tj + dj, d];
      }
      if (!best) return null; [ti, tj] = best;
    }
    const N = W * H, g = new Float32Array(N).fill(Infinity), came = new Int32Array(N).fill(-1), open = [], closed = new Uint8Array(N);
    const h = (i, j) => { const dx = Math.abs(i - ti), dz = Math.abs(j - tj); return Math.max(dx, dz) + 0.414 * Math.min(dx, dz); };
    const s = sj * W + si; g[s] = 0; open.push([h(si, sj), s]);
    let found = false, iter = 0;
    while (open.length && iter++ < 40000) {
      let bi = 0; for (let k = 1; k < open.length; k++) if (open[k][0] < open[bi][0]) bi = k;
      const [, c] = open.splice(bi, 1)[0]; if (closed[c]) continue; closed[c] = 1;
      const ci = c % W, cj = (c / W) | 0;
      if (ci === ti && cj === tj) { found = true; break; }
      for (let dj = -1; dj <= 1; dj++) for (let di = -1; di <= 1; di++) {
        if (!di && !dj) continue; const ni = ci + di, nj = cj + dj;
        if (!free(ni, nj) || (di && dj && (!free(ci + di, cj) || !free(ci, cj + dj)))) continue;
        const n = nj * W + ni, ng = g[c] + (di && dj ? 1.414 : 1);
        if (ng < g[n]) { g[n] = ng; came[n] = c; open.push([ng + h(ni, nj), n]); }
      }
    }
    if (!found) return null;
    const cells = []; for (let c = tj * W + ti; c !== -1; c = came[c]) cells.push(c);
    cells.reverse();
    const pts = cells.map(c => ({ x: bx0 + (c % W + 0.5) * CELL, z: bz0 + (((c / W) | 0) + 0.5) * CELL }));
    if (free(...cellOf(to.x, to.z))) pts[pts.length - 1] = { x: to.x, z: to.z };
    // string pulling: skip points while the straight segment stays clear
    const out = [pts[0]]; let a = 0;
    while (a < pts.length - 1) { let b = pts.length - 1; while (b > a + 1 && !clear(pts[a], pts[b])) b--; out.push(pts[b]); a = b; }
    out.shift();
    return out;
  }
  function clear(a, b) {
    const d = Math.hypot(b.x - a.x, b.z - a.z), n = Math.ceil(d / (CELL * 0.5));
    for (let k = 1; k < n; k++) { const x = a.x + (b.x - a.x) * k / n, z = a.z + (b.z - a.z) * k / n; const [i, j] = cellOf(x, z); if (!free(i, j)) return false; }
    return true;
  }
  return { resolve, path, blockedAt, dyn, rebuild: build };
}
