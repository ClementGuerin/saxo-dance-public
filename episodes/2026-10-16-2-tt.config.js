// kit for episodes/2026-10-16-2-tt.json, the TikTok cut of "deja vu" (Olivia Rodrigo) on her own 60 s sound (music id
// 6945541245435381761, 965,521 videos): song 147.017-206.688 s of ~/personal/saxo-video/songs/deja-vu/song.mp3 at the
// song's own speed, the sound's first 90 beats (59.671 s): the main kit's -0.403-59.268 s, the same beat grid (kit beat 0
// at 1.4593 s here). TikTok gets this video silent with the official sound added in Studio; this kit's audio is the same
// window of the song, for the render and the checks.
Object.assign(CONFIG, { title: 'Saxo dance — deja vu (TikTok)', song: { title: 'deja vu', artist: 'Olivia Rodrigo' }, duration: 59.6714, bpm: 90.4957, beatOffset: 1.4593 });
CONFIG.audio = { ...CONFIG.audio, truePeak: -2.0, tracks: [{ file: 'assets/audio/kits/2026-10-16-2-tt.mp3', gain: 1, start: 0, offset: 0 }] };
