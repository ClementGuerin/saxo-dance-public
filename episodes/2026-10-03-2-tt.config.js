// kit for episodes/2026-10-03-2-tt.json: TikTok's official sound for "we fell in love in october" (girl in red's own,
// music id 6711980022204205826, 42 s, 1,744,736 videos), which is song 25.351-68.087 s of
// ~/personal/saxo-video/songs/we-fell-in-love-in-october/song.mp3 at the song's own speed (tt_rate.py there: 20
// log-spectrum pieces of 3 s, 0.8 ms residual, rate 0.99999): pre-chorus 1's last line, chorus 1 and post-chorus 1, all
// before the main cut (song 105.24-181.40 s). The video goes to TikTok silent and the sound is added in TikTok Studio
// (TikTok muted the main post, 2026-10-03); this audio is the official sound itself (TikTok's AAC preview), only for
// the preview and the QA of the sync. The beats are the main's 129.9953 BPM from song beat 56 (the first downbeat
// inside the sound): beat 0 at 0.5047 s. Chorus 1 is chorus 2 160 beats earlier (tt beat = main beat + 12) and
// post-chorus 1 the main's final run 224 beats earlier (tt beat = main beat - 52): tt_sections.py there.
Object.assign(CONFIG, { title: 'Saxo dance — we fell in love in october (TikTok)', song: { title: 'we fell in love in october', artist: 'girl in red' }, duration: 42.736, bpm: 129.9953, beatOffset: 0.5047 });
CONFIG.audio = { ...CONFIG.audio, tracks: [{ file: 'assets/audio/kits/2026-10-03-2-tt.mp3', gain: 1, start: 0, offset: 0 }] };
