// kit for episodes/2026-10-12-tt.json: TikTok's official sound for "Beat It" (Michael Jackson's own, music id
// 6696417475073935361, 60 s, 951,108 videos), which is song 65.0099 + 1.000817 x tt of
// ~/personal/saxo-video/songs/beat-it/song.mp3 (tt_rate.py there: 29 log-spectrum pieces of 3 s, 0.7 ms residual: it plays
// 0.08% fast against our master), i.e. the main kit's -0.4993 s (the last word of the line before the chorus) to
// 59.5497 s: chorus 1, verse 2 and the first 25.7 beats of chorus 2. The video is the sound's first 138 beats
// (59.6436 s), so the loop keeps the beat. It goes to TikTok silent and the sound is added in TikTok Studio (TikTok
// muted the main post, 2026-10-12); this audio is the official sound itself (TikTok's AAC preview), only for the
// preview and the QA of the sync. The beats are the main's 138.7113 BPM x 1.000817 from main kit beat 0 (the chorus's
// downbeat, the first downbeat inside the sound): beat 0 at 0.931092 s, so tt beat = main beat.
Object.assign(CONFIG, { title: 'Saxo dance — Beat It (TikTok)', song: { title: 'Beat It', artist: 'Michael Jackson' }, duration: 59.6436, bpm: 138.8246, beatOffset: 0.931092 });
CONFIG.audio = { ...CONFIG.audio, tracks: [{ file: 'assets/audio/kits/2026-10-12-tt.mp3', gain: 1, start: 0, offset: 0 }] };
