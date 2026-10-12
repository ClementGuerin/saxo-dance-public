// kit for episodes/2026-10-13-tt.json: TikTok's official sound for "Gabriela" (KATSEYE's own, music id
// 7515269970908252177, 60 s, 822,934 videos), which is song 30.0558-90.0558 s of
// ~/personal/saxo-video/songs/gabriela/song.mp3 at the song's own speed (tt_rate.py there: 29 log-spectrum pieces of 3 s,
// 0.6 ms residual), i.e. the main kit's -2.2661 to 57.7339 s: the pre-chorus's last line, chorus 1, verse 2,
// pre-chorus 2 and chorus 2's first 2.5 bars. The video is the sound's first 146 beats (59.9955 s), so the loop keeps
// the beat. It goes to TikTok silent and the sound is added in TikTok Studio; this audio is the official sound itself
// (TikTok's AAC preview), only for the preview and the QA of the sync. The beats are the main's 146.011 BPM from main
// kit beat 0 (chorus 1's downbeat) at 3.0879 s, so tt beat = main beat.
Object.assign(CONFIG, { title: 'Saxo dance — Gabriela (TikTok)', song: { title: 'Gabriela', artist: 'KATSEYE' }, duration: 59.9955, bpm: 146.011, beatOffset: 3.0879 });
CONFIG.audio = { ...CONFIG.audio, truePeak: -2.0, tracks: [{ file: 'assets/audio/kits/2026-10-13-tt.mp3', gain: 1, start: 0, offset: 0 }] };
