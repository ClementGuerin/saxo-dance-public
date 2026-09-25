// video.config.js: the one place for format, timing and audio. Read by the page and by render.mjs.
window.CONFIG = {
  title: 'Saxo dance — Nicole Kidman',   // audio: tools/cut_song.mjs picks the window
  song: { title: 'Nicole Kidman', artist: 'ADÉLA' },   // read by publish.mjs for captions and hashtags
  width: 1080,
  height: 1920,
  scale: 1,
  fps: 30,
  duration: 68.8,   // hand-cut 41.6–110.4 s of full.mp3 (verse 1, pre-chorus, first chorus), ends before the bridge
  ps1: { w: 270, h: 480, snap: [135, 240] },   // internal 3D resolution (4x upscale, nearest) and vertex snap grid
  background: '#000000',
  bpm: 142.2,
  beatOffset: 0.441,
  boil: 12,
  fonts: {
    display: '"Arial Black", Impact, sans-serif',
    body: 'system-ui, -apple-system, "Segoe UI", sans-serif',
    cute: '"Cute", "Arial Rounded MT Bold", sans-serif',   // assets/fonts/Fredoka.ttf, lyrics and watermark
    load: ['700 80px Cute', '600 60px Cute'],
  },
  captions: {},
  safe: { top: .12, bottom: .2 },
  audio: {
    synthGain: 0,
    lufs: -14,
    truePeak: -1.5,
    bus: {},
    tracks: [
      { file: 'assets/audio/chorus.mp3', gain: 1, start: 0, offset: 0 },
    ],
  },
};
