// boot.js: render hooks for render.mjs, plus the preview player (play, scrub, sound, arrow keys, ?t=seconds).
(() => {
  const params = new URLSearchParams(location.search), RENDER = params.has('render');
  if (RENDER) document.body.classList.add('render');
  const SCALE = CONFIG.scale || 1;
  const ex = document.createElement('canvas'); ex.width = W * SCALE; ex.height = H * SCALE;
  const exg = ex.getContext('2d'); exg.imageSmoothingEnabled = false;
  const exportCanvas = () => { if (SCALE === 1) return cv; exg.drawImage(cv, 0, 0, ex.width, ex.height); return ex; };
  if (SCALE > 1) cv.style.imageRendering = 'pixelated';

  window.renderAt = (t, type = 'image/jpeg', q = .92) => { drawFrame(t); return exportCanvas().toDataURL(type, q); };
  // Contact sheet: several times on one image, each labelled with its time and shot name.
  window.renderSheet = (times, cols = 3, w = 640) => {
    const h = Math.round(w * H / W), lab = 26, rows = Math.ceil(times.length / cols);
    const sh = document.createElement('canvas'); sh.width = cols * w; sh.height = rows * (h + lab);
    const sg = sh.getContext('2d'); sg.fillStyle = '#111'; sg.fillRect(0, 0, sh.width, sh.height);
    const ms = [];
    times.forEach((t, i) => {
      const t0 = performance.now(); drawFrame(t); ms.push(Math.round(performance.now() - t0));
      const x = (i % cols) * w, y = Math.floor(i / cols) * (h + lab);
      sg.drawImage(cv, x, y + lab, w, h);
      const s = shotAt(t);
      sg.fillStyle = '#e8e8e8'; sg.font = '600 15px system-ui, sans-serif'; sg.textBaseline = 'middle';
      sg.fillText(`${t.toFixed(2)}s  ${s ? s.name : '-'}`, x + 8, y + lab / 2);
    });
    return { url: sh.toDataURL('image/jpeg', .88), ms };
  };
  window.meta = () => ({ W: W * SCALE, H: H * SCALE, fps: FPS, DUR, title: CONFIG.title, audio: CONFIG.audio || {}, hasScore: typeof score === 'function' });
  window.shotList = shotList;

  const loads = (CONFIG.fonts?.load || []).map(f => document.fonts.load(f));
  Promise.all([...loads, ...LOADING]).then(() => document.fonts.ready).then(() => {
    window.ready = true;
    if (!RENDER) preview();
  });

  function preview() {
    const play = document.getElementById('play'), snd = document.getElementById('snd'), scrub = document.getElementById('scrub');
    const clock = document.getElementById('clock'), shot = document.getElementById('shot');
    let t = Math.min(DUR, +(params.get('t') || 0)), playing = false, sound = false, t0 = 0, n0 = 0;
    scrub.max = DUR;
    const start = () => { playing = true; if (t >= DUR) t = 0; t0 = t; n0 = performance.now(); play.textContent = 'Pause'; if (sound) audioStart(t); };
    const stop = () => { playing = false; play.textContent = 'Play'; audioStop(); };
    play.onclick = () => playing ? stop() : start();
    snd.onclick = () => { sound = !sound; snd.textContent = sound ? 'Sound on' : 'Sound off'; if (playing) sound ? audioStart(t) : audioStop(); };
    scrub.oninput = () => { t = +scrub.value; if (playing) { t0 = t; n0 = performance.now(); if (sound) audioStart(t); } };
    addEventListener('keydown', e => {
      if (e.target.tagName === 'INPUT' && e.key !== ' ') return;
      if (e.key === ' ') { e.preventDefault(); playing ? stop() : start(); }
      if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { if (playing) stop(); t = clamp(t + (e.key === 'ArrowRight' ? 1 : -1) * (e.shiftKey ? 1 : 1 / FPS), 0, DUR); }
    });
    const fmt = s => `${Math.floor(s / 60)}:${(s % 60).toFixed(2).padStart(5, '0')}`;
    (function loop(now) {
      if (playing) { t = t0 + (now - n0) / 1000; if (t >= DUR) { t = DUR; stop(); } }
      drawFrame(Math.min(t, DUR - 1e-4));
      scrub.value = t; clock.textContent = `${fmt(t)} / ${fmt(DUR)}  beat ${beatN(t)}`;
      const s = shotAt(t); shot.textContent = s ? `${s.chapter} · ${s.name}` : '';
      requestAnimationFrame(loop);
    })(performance.now());
  }
})();
