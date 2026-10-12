// kit for episodes/2026-10-13.json ("Gabriela", KATSEYE, 2025; the queue being empty: a chart climber, +11 places on
// Spotify's global chart on 2026-10-11 (#152), KATSEYE's own 60 s TikTok sound 822,934 videos): its own cut
// (?kit=2026-10-13) 32.3219-111.00 s of ~/personal/saxo-video/songs/gabriela/song.mp3 (the official audio from the
// group's performance video, 197.81 s): from inside the pre-chorus's dead silence (song grid beat 78) through chorus 1,
// verse 2, pre-chorus 2 and chorus 2, to the gap after chorus 2's last line (the post-chorus pickup follows); 30 ms fade
// in, 40 ms fade out, then silence to song grid beat 271 (a 0.63 s silent button).
// 146.011 BPM (a DP tracker's beats fit one tempo within 2.8 ms median over the song; chorus 1 to chorus 2 is exactly 128
// beats, the onset envelopes r 0.999), song grid beat 0 at 0.2695 s, the downbeats on grid beats 0 mod 4 (the kick):
// kit beat 0 = grid 80 (chorus 1's downbeat) at kit 0.8218 s, bars on kit beats 0 mod 4; verse 2 kit beat 64,
// pre-chorus 2 kit beat 96, chorus 2 kit beat 128.
// The official TikTok sound (music id 7515269970908252177, 60 s) is song 30.0558-90.0558 s at the song's own speed (29
// log-spectrum pieces, 0.6 ms residual): kit -2.266 to 57.734 s, i.e. the pre-chorus's last 1.1 bars, chorus 1, verse 2,
// pre-chorus 2 and chorus 2's first 2.6 bars (kit beat 138.5).
Object.assign(CONFIG, { title: 'Saxo dance — Gabriela', song: { title: 'Gabriela', artist: 'KATSEYE' }, duration: 79.3091, bpm: 146.011, beatOffset: 0.8218 });
CONFIG.audio = { ...CONFIG.audio, truePeak: -2.0, tracks: [{ file: 'assets/audio/kits/2026-10-13.mp3', gain: 1, start: 0, offset: 0 }] };   // a -2.0 dBTP master: at the default -1.5 the AAC encode overshot to -1.1
