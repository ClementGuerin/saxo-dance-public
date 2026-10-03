// kit for episodes/2026-10-03-2.json ("we fell in love in october", girl in red, 2018; a trending song, the queue being
// empty: the day's biggest climber on Spotify's global daily chart, +80 places to #58 and +429k streams on 2026-10-02,
// the October surge; 1.74M TikTok videos on its 42 s sound, 201M views on the official video): its own cut
// (?kit=2026-10-03-2) 105.2432-181.3998 s of ~/personal/saxo-video/songs/we-fell-in-love-in-october/song.mp3 (the
// official video's audio, 187.3 s): chorus 2, the half-time post-chorus, the quiet breakdown, the band's return for
// the final run and the song's own dead stop (song beat 392) plus one beat of its decay. 129.9953 BPM (one constant
// tempo: a DP tracker's beats fit it within 2.8 ms median over the whole song; the choruses sit exactly 160 beats
// apart), song beat 0 at 0.0086 s, bars on song beats 0 mod 4 (the kick); the kit starts on song beat 228 (bar 57,
// chorus 2's downbeat), so kit beat b = song beat 228 + b.
Object.assign(CONFIG, { title: 'Saxo dance — we fell in love in october', song: { title: 'we fell in love in october', artist: 'girl in red' }, duration: 76.157, bpm: 129.9953, beatOffset: 0 });
CONFIG.audio = { ...CONFIG.audio, tracks: [{ file: 'assets/audio/kits/2026-10-03-2.mp3', gain: 1, start: 0, offset: 0 }] };
