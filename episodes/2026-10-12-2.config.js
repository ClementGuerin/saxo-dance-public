// kit for episodes/2026-10-12-2.json ("Everybody Wants To Rule The World", Tears For Fears, 1985; the queue being empty: a
// throwback climbing again, +25 places on Spotify's global chart on 2026-10-11 (#149), Tears For Fears' own 60 s TikTok
// sound 819,939 videos): its own cut (?kit=2026-10-12-2) 24.5878-95.74 s of
// ~/personal/saxo-video/songs/everybody-wants-to-rule-the-world/song.mp3 (the official audio, 251.49 s): song grid beat 45
// (two bars of the intro riff) through verse 1, its refrain, the riff break, verse 2 and its refrain, to just before the
// bridge's first word (95.78 s); 30 ms fade in, 40 ms fade out, then silence to song beat 179 (a 0.6 s silent button).
// 112.0571 BPM (a DP tracker's beats fit one tempo within 2.0 ms median over the song), song beat 0 at 0.4930 s, the
// downbeats on song beats 1 mod 4 (the kick in the low band; the snare's backbeat is the full band's loudest): kit beat 0
// = song beat 45 at 0 s, bars on kit beats 0 mod 4; verse 1's downbeat kit beat 8, verse 2's kit beat 80.
// The official TikTok sound (music id 6927235393519618049, 60 s) is song 80.01-140.01 s (10 log-spectrum pieces, score
// 0.99): only the cut's last 15.7 s, then the bridge and the solo. A muted TikTok needs its own kit on that window.
Object.assign(CONFIG, { title: 'Saxo dance — Everybody Wants To Rule The World', song: { title: 'Everybody Wants To Rule The World', artist: 'Tears For Fears' }, duration: 71.7491, bpm: 112.0571, beatOffset: 0 });
CONFIG.audio = { ...CONFIG.audio, truePeak: -2.0, tracks: [{ file: 'assets/audio/kits/2026-10-12-2.mp3', gain: 1, start: 0, offset: 0 }] };   // a -2.0 dBTP master: at the default -1.5 the AAC encode overshot to -1.1
