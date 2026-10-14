// kit for episodes/2026-10-15-2-tt.json, the TikTok cut of "Umbrella" (Rihanna ft. JAY-Z) on Rihanna's own 60 s sound
// (music id 6921472986260178945, 150,062 videos): song 177.006-237.006 s of ~/personal/saxo-video/songs/umbrella/song.mp3
// at the song's own speed (15 log-spectrum pieces of 3 s, all at the same offset, r 0.998-1.000): song beats
// 256.197-343.194, the main kit's 11.860-71.860 s (main kit beats 16.197-103.194). The video is the whole sound, 60.0 s.
// 86.9978 BPM; tt beat 0 = song beat 260 (the first downbeat inside the sound) at 2.6229 s = main kit beat 20.
// TikTok gets this video silent with the official sound added in Studio; this kit's audio is the same window of the
// song, for the render and the checks.
Object.assign(CONFIG, { title: 'Saxo dance — Umbrella (TikTok)', song: { title: 'Umbrella', artist: 'Rihanna ft. JAY-Z' }, duration: 60.0, bpm: 86.9978, beatOffset: 2.6229 });
CONFIG.audio = { ...CONFIG.audio, truePeak: -2.0, tracks: [{ file: 'assets/audio/kits/2026-10-15-2-tt.mp3', gain: 1, start: 0, offset: 0 }] };
