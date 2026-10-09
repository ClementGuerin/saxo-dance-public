// kit for episodes/2026-10-10.json ("BIRDS OF A FEATHER", Billie Eilish, 2024; the queue being empty: a chart hit
// climbing again, +200k streams a day and +4 places on Spotify's global chart on 2026-10-09, its TikTok sound 1.78M
// videos): its own cut (?kit=2026-10-10) 25.5057-94.6485 s of ~/personal/saxo-video/songs/birds-of-a-feather/song.m4a
// (the album audio, 210.4 s): song beat 44 (bar 11's downbeat, in the gap after verse 1) through the pre-chorus,
// chorus 1, the post-chorus and the hook, to beat 165 (just after its last held word), a 60 ms fade, then one silent
// beat (the button). 105.000 BPM (a DP tracker's beats fit one tempo within 2.5 ms median from 9 s to 183 s), song
// beat 0 at 0.3628 s (the onset grid; the kick's attack within 1 ms); kit beat 0 = song beat 44 at 0 s; bars on song
// beats 0 mod 4 (the kick on 1).
Object.assign(CONFIG, { title: 'Saxo dance — BIRDS OF A FEATHER', song: { title: 'BIRDS OF A FEATHER', artist: 'Billie Eilish' }, duration: 69.714, bpm: 105, beatOffset: 0 });
CONFIG.audio = { ...CONFIG.audio, tracks: [{ file: 'assets/audio/kits/2026-10-10.mp3', gain: 1, start: 0, offset: 0 }] };
