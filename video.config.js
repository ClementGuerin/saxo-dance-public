// video.config.js: the one place for format, timing and audio. Read by the page and by render.mjs.
window.CONFIG = {
  title: 'Saxo dance — Dans le club',   // audio: hand-cut, see ~/personal/saxo-video/songs/dans-le-club/make_lyrics.py
  song: { title: 'Dans le club', artist: 'Michou' },   // read by publish.mjs for captions and hashtags
  width: 1080,
  height: 1920,
  scale: 1,
  fps: 30,
  duration: 75.6,   // hand-cut 8.40–82.60 s of full.mp3 (muffled spoken intro, chorus 1, verse 1, pre-chorus, chorus 2) + 1.4 s of silence after "j'dead ça"
  ps1: { w: 270, h: 480, snap: [135, 240] },   // internal 3D resolution (4x upscale, nearest) and vertex snap grid
  background: '#000000',
  bpm: 115,
  beatOffset: 0.255,
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
