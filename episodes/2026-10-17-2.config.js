// kit for episodes/2026-10-17-2.json ("Shape of You", Ed Sheeran, 2017; the queue being empty: a throwback climbing
// again, +8 places on Spotify's global daily chart (#82, +50.9k streams a day), the clip 6.8B views, Ed Sheeran's own
// 60 s TikTok sound 410,501 videos; the night's other candidates: KAROL G's Si Antes Te Hubiera Conocido 1.83M, Zara
// Larsson's Midnight Sun 507k): its own cut (?kit=2026-10-17-2) 27.505-90.700 s of
// ~/personal/saxo-video/songs/shape-of-you/song.mp3 (the official audio, 235.1 s), then 0.75 s of silence: the
// pre-chorus from its half-beat pickup, the chorus, the post-chorus to the title line's last word, just past verse 2's
// downbeat; 10 ms fade in, 40 ms fade out.
// 96.0000 BPM (the DP tracker's verse beats fit one tempo within 7 ms median; it slips half a beat in the syncopated
// choruses), song beat 0 at 0.3147 s, downbeats on beats 0 mod 4: kit beat 0 = song beat 44 at kit 0.3097 s.
// Sections (kit beats): pre-chorus 0-36 (its pickup at -0.45), chorus 36-64, post-chorus 64-100, verse 2's downbeat
// 100, the music cut at 100.6, silence 100.6-101.8.
// The official TikTok sound (music id 6705004477235070977, 60 s) is song 43.352-103.352 s at the song's own speed
// (log-spectrum r 0.998-0.999 over the whole sound): kit 15.847-75.847 s (kit beats 24.86-120.86), so the TikTok cut
// is this kit's own shots from kit beat 24.86 to the end of the music.
Object.assign(CONFIG, { title: 'Saxo dance — Shape of You', song: { title: 'Shape of You', artist: 'Ed Sheeran' }, duration: 63.945, bpm: 96, beatOffset: 0 });
CONFIG.audio = { ...CONFIG.audio, truePeak: -2.0, tracks: [{ file: 'assets/audio/kits/2026-10-17-2.mp3', gain: 1, start: 0, offset: 0 }] };   // a -2.0 dBTP master: at the default -1.5 the AAC encode overshot to -1.1
