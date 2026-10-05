// kit for episodes/2026-10-05-tt.json: TikTok's official sound for "No Scrubs" (TLC's own, music id
// 7460679357998008336, 60 s, 154,445 videos), which is song 8.0052-68.0052 s of
// ~/personal/saxo-video/songs/no-scrubs/song.mp3 at the song's own speed (tt_rate.py there: 29 log-spectrum pieces of
// 3 s, 0.7 ms residual, rate 1.000000), i.e. the main kit's 0.1763-60.1763 s: the intro's last bar, verse 1,
// pre-chorus 1, chorus 1, verse 2 and half of pre-chorus 2. The video takes its first 46.1 s, to the end of verse 2's
// first line. It goes to TikTok silent and the sound is added in TikTok Studio (TikTok muted the main post,
// 2026-10-05); this audio is the official sound itself (TikTok's AAC preview), only for the preview and the QA of the
// sync. The beats are the main's 92.9114 BPM from main kit beat 4 (the first downbeat inside the sound): beat 0 at
// 2.4068 s, so tt beat = main beat - 4.
Object.assign(CONFIG, { title: 'Saxo dance — No Scrubs (TikTok)', song: { title: 'No Scrubs', artist: 'TLC' }, duration: 46.1, bpm: 92.9114, beatOffset: 2.4068 });
CONFIG.audio = { ...CONFIG.audio, tracks: [{ file: 'assets/audio/kits/2026-10-05-tt.mp3', gain: 1, start: 0, offset: 0 }] };
