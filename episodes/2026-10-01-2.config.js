// kit for episodes/2026-10-01-2.json ("Stop The Wedding!", Ashe; climbing on Spotify on 2026-09-30, +21k a day
// globally, 51k TikTok videos on its 60 s sound): its own cut (?kit=2026-10-01-2) 37.226-113.232 s of
// ~/personal/saxo-video/songs/stop-the-wedding/full.mp3 (the official audio, 198.8 s): chorus 1, verse 2, chorus 2 and
// the two instrumental bars after it (a 0.3 s fade before the interlude's first word). The band's tempo moves (choruses
// ~132.1 BPM, verse 2 ~134.9): the beats are a tempo map (grid in .beats.js, a DP tracker's beats smoothed over +-6,
// within ~4 ms of the kick and the snare), kit beat 0 (0.0054 s) the chorus's first downbeat, the kick on beat 1 and
// the snare on beat 3 (a half-time groove). TikTok's official sound is song 34.000-94.000 s (kit -3.226 to 56.774).
Object.assign(CONFIG, { title: 'Saxo dance — Stop The Wedding!', song: { title: 'Stop The Wedding!', artist: 'Ashe' }, duration: 76.0, bpm: 132.6, beatOffset: 0.0054 });
CONFIG.audio = { ...CONFIG.audio, tracks: [{ file: 'assets/audio/kits/2026-10-01-2.mp3', gain: 1, start: 0, offset: 0 }] };
