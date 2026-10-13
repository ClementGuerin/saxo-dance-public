// kit for episodes/2026-10-13-2-tt.json: TikTok's official sound for "SaWaDiKa" (LISA's own, music id
// 7681077868771887105, 60 s, 77,614 videos), which is song 127.0118-187.0118 s of
// ~/personal/saxo-video/songs/sawadika/song.mp3 at the song's own speed (tt_rate.py there: 29 log-spectrum pieces of 3 s,
// 0.7 ms residual), i.e. the main kit's 27.2254 s on: pre-chorus 2 from just inside its pickup line, the last chorus,
// the outro's four hooks, the music's dead stop and its tail. The video is the sound's first 129 beats (55.2855 s, to the
// main kit's end), so the loop keeps the beat. It goes to TikTok silent and the sound is added in TikTok Studio; this
// audio is the official sound itself (TikTok's AAC preview), only for the preview and the QA of the sync. The beats are
// the main's 140.0004 BPM from main kit beat 63 at 0.0095 s, so tt beat = main beat - 63.
Object.assign(CONFIG, { title: 'Saxo dance — SaWaDiKa (TikTok)', song: { title: 'SaWaDiKa', artist: 'LISA' }, duration: 55.2855, bpm: 140.0004, beatOffset: 0.0095 });
CONFIG.audio = { ...CONFIG.audio, truePeak: -2.0, tracks: [{ file: 'assets/audio/kits/2026-10-13-2-tt.mp3', gain: 1, start: 0, offset: 0 }] };
