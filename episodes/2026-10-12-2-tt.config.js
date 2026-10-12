// kit for episodes/2026-10-12-2-tt.json: TikTok's official sound for "Everybody Wants To Rule The World" (Tears For Fears'
// own, music id 6927235393519618049, 60 s, 819,939 videos), which is song 80.0170 + 1.000000 x tt of
// ~/personal/saxo-video/songs/everybody-wants-to-rule-the-world/song.mp3 (tt_rate.py there: 29 log-spectrum pieces of 3 s,
// 0.7 ms residual: the song's own speed), i.e. the main kit's 55.43 s (main beat 103.52) on: the main's last four lines
// (refrain 2), then the bridge (never in the main kit) and 35.5 beats of the guitar solo. The video is the sound's first
// 112 beats (59.9694 s), so the loop keeps the beat. It goes to TikTok silent and the sound is added in TikTok Studio
// (TikTok muted the main post, 2026-10-12 20:00); this audio is the official sound itself (TikTok's AAC preview), only for
// the preview and the QA of the sync. The beats are the main's 112.0571 BPM from song beat 149 (main kit beat 104, the
// first downbeat inside the sound): beat 0 at 0.2568 s, so tt beat = main beat - 104 for the main's ending.
Object.assign(CONFIG, { title: 'Saxo dance — Everybody Wants To Rule The World (TikTok)', song: { title: 'Everybody Wants To Rule The World', artist: 'Tears For Fears' }, duration: 59.9694, bpm: 112.0571, beatOffset: 0.2568 });
CONFIG.audio = { ...CONFIG.audio, tracks: [{ file: 'assets/audio/kits/2026-10-12-2-tt.mp3', gain: 1, start: 0, offset: 0 }] };
