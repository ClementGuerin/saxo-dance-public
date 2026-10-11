// kit for episodes/2026-10-12.json ("Beat It", Michael Jackson, 1982; the queue being empty: a throwback climbing in a
// Michael Jackson wave, +116.8k streams a day and +4 places on Spotify's global chart on 2026-10-10 (#69), Michael
// Jackson's own 60 s TikTok sound "Beat It" 951,108 videos): its own cut (?kit=2026-10-12) 65.5092-144.6664 s of
// ~/personal/saxo-video/songs/beat-it/song.mp3 (the official audio, 258.40 s): song beat 151 (the chorus's pickup, half a
// beat before its first word) through chorus 1, verse 2 and the double chorus 2 to its tag (song beat 334, before the
// post-chorus chant), 30 ms fade in, 40 ms fade out, then one silent beat (the button). It holds the official sound but
// its first 0.49 s (song 65.016-125.10 s, music id 6696417475073935361: kit -0.49 to 59.59 s).
// 138.7113 BPM (a DP tracker's beats fit one tempo within 6.7 ms median over the song), song beat 0 at 0.1937 s; the
// downbeats on song beats 0 mod 4: kit beat -1 = song beat 151 at 0 s, kit beat 0 (the chorus's downbeat) at 0.4326 s,
// bars on kit beats 0 mod 4.
Object.assign(CONFIG, { title: 'Saxo dance — Beat It', song: { title: 'Beat It', artist: 'Michael Jackson' }, duration: 79.5898, bpm: 138.7113, beatOffset: 0.432553 });
CONFIG.audio = { ...CONFIG.audio, truePeak: -2.0, tracks: [{ file: 'assets/audio/kits/2026-10-12.mp3', gain: 1, start: 0, offset: 0 }] };   // a -2.0 dBTP master: at the default -1.5 the AAC encode overshot to -1.1
