// kit for episodes/2026-10-17-tt.json, the TikTok cut of "As It Was" (Harry Styles) on his own 60 s sound (music id
// 7081404214387148802, 2,334,454 videos): song 53.383-113.383 s of ~/personal/saxo-video/songs/as-it-was/song.mp3 at the
// song's own speed (log-spectrum r 0.999), the main kit's 17.374-77.374 s (main kit beats 25.19-112.19). The same grid:
// tt beat = main kit beat - 28 (the first downbeat inside the sound, main kit 19.311 s = tt 1.9368 s). The video is the
// whole sound, 60.0 s. TikTok gets it silent with the official sound added in Studio; this kit's audio is that window of
// the song, for the render and the checks.
Object.assign(CONFIG, { title: 'Saxo dance — As It Was (TikTok)', song: { title: 'As It Was', artist: 'Harry Styles' }, duration: 60.0, bpm: 86.9976, beatOffset: 1.9368 });
CONFIG.audio = { ...CONFIG.audio, truePeak: -2.0, tracks: [{ file: 'assets/audio/kits/2026-10-17-tt.mp3', gain: 1, start: 0, offset: 0 }] };
