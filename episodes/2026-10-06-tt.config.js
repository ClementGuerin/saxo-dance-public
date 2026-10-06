// kit for episodes/2026-10-06-tt.json: TikTok's official sound for "Golden" (HUNTR/X's own, with EJAE, AUDREY NUNA,
// REI AMI and the KPop Demon Hunters cast; music id 7515251957310539792, 60 s, 2,117,372 videos), which is song
// 14.0579-74.0579 s of ~/personal/saxo-video/songs/golden/song.mp3 at the song's own speed (tt_rate.py there: 29
// log-spectrum pieces of 3 s, 0.7 ms residual, rate 1.000000), i.e. the main kit's -8.0571 to 51.9429 s: 1.2 s near
// silent, the intro's two lines over the verse's groove, verse 1, the pre-chorus, the first chorus line's big note and
// the chorus's first 22.5 beats. The video is the whole 60 s. It goes to TikTok silent and the sound is added in
// TikTok Studio (TikTok muted the main post, 2026-10-06); this audio is the official sound itself (TikTok's AAC
// preview), only for the preview and the QA of the sync. The beats are the main's 123 BPM on the song's own grid: beat
// 0 is song beat 12 (the first downbeat inside the sound) at 0.2483 s, so tt beat = main beat + 16.
Object.assign(CONFIG, { title: 'Saxo dance — Golden (TikTok)', song: { title: 'Golden', artist: 'HUNTR/X' }, duration: 60, bpm: 123, beatOffset: 0.2483 });
CONFIG.audio = { ...CONFIG.audio, tracks: [{ file: 'assets/audio/kits/2026-10-06-tt.mp3', gain: 1, start: 0, offset: 0 }] };
