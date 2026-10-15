// kit for episodes/2026-10-16-tt.json, the TikTok cut of "Ordinary" (Alex Warren) on his own 60 s sound (music id
// 7467450862064879632, 1,983,570 videos): song 93.0576-153.0576 s of ~/personal/saxo-video/songs/ordinary/song.mp3 at the
// song's own speed (waveform r 0.988), the main kit's -0.004-59.996 s: this kit is the main kit's first 60 s (kit beats
// -2..82), the same beat grid. The video is the whole sound, 60.0 s. TikTok gets this video silent with the official sound
// added in Studio; this kit's audio is the same window of the song, for the render and the checks.
Object.assign(CONFIG, { title: 'Saxo dance — Ordinary (TikTok)', song: { title: 'Ordinary', artist: 'Alex Warren' }, duration: 60.0, bpm: 83.9974, beatOffset: 1.42862 });
CONFIG.audio = { ...CONFIG.audio, truePeak: -2.0, tracks: [{ file: 'assets/audio/kits/2026-10-16-tt.mp3', gain: 1, start: 0, offset: 0 }] };
