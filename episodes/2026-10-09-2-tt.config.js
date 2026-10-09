// kit for episodes/2026-10-09-2-tt.json: TikTok's official sound for "Espresso" (Sabrina Carpenter's own, music id
// 7364498342501435408, 60 s, 527,734 videos), which is song 44.0368-104.0367 s of
// ~/personal/saxo-video/songs/espresso/song.mp3 at the song's own speed (tt_rate.py there: 29 log-spectrum pieces of
// 3 s, 0.6 ms residual, rate 0.999999), i.e. the main kit's 25.2371 s to its end (main b43.744-b120) and then 16 s of
// verse 2 the main never had. The video is its first 76 beats (43.8464 s: the main's last 76 beats, ending 0.256 beats
// before verse 2's downbeat, where the sound starts too, so the loop keeps the beat). It goes to TikTok silent and the
// sound is added in TikTok Studio (TikTok muted the main post, 2026-10-09); this audio is the official sound itself
// (TikTok's AAC preview), only for the preview and the QA of the sync. The beats are the main's 103.9993 BPM from main
// kit beat 44 (the first downbeat inside the sound): beat 0 at 0.1477 s, so tt beat = main beat - 44.
Object.assign(CONFIG, { title: 'Saxo dance — Espresso (TikTok)', song: { title: 'Espresso', artist: 'Sabrina Carpenter' }, duration: 43.8464, bpm: 103.9993, beatOffset: 0.1477 });
CONFIG.audio = { ...CONFIG.audio, tracks: [{ file: 'assets/audio/kits/2026-10-09-2-tt.mp3', gain: 1, start: 0, offset: 0 }] };
