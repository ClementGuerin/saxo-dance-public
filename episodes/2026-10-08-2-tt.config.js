// kit for episodes/2026-10-08-2-tt.json: TikTok's official sound for "Poker Face" (Lady Gaga's own, music id
// 6917492138762569730, 60 s, 1,146,898 videos), which is song 14.0003-74.0003 s of
// ~/personal/saxo-video/songs/poker-face/song.mp3 at the song's own speed (tt_rate.py there: 29 log-spectrum pieces of
// 3 s, 0.7 ms residual, rate 1.000000), i.e. the main kit's -0.2077 to 59.7923 s: one beat's tail before bar 7's
// downbeat, the intro chant, verse 1, the pre-chorus, the chorus and 2.6 beats of the post-chorus. It goes to TikTok
// silent and the sound is added in TikTok Studio (TikTok muted the main post, 2026-10-08); this audio is the official
// sound itself (TikTok's AAC preview), only for the preview and the QA of the sync. The beats are the main's
// 118.9986 BPM from main kit beat 0 (the first downbeat inside the sound): beat 0 at 0.2077 s, so tt beat = main beat.
Object.assign(CONFIG, { title: 'Saxo dance — Poker Face (TikTok)', song: { title: 'Poker Face', artist: 'Lady Gaga' }, duration: 60.0, bpm: 118.9986, beatOffset: 0.2077 });
CONFIG.audio = { ...CONFIG.audio, tracks: [{ file: 'assets/audio/kits/2026-10-08-2-tt.mp3', gain: 1, start: 0, offset: 0 }] };
