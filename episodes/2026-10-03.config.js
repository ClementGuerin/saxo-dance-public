// kit for episodes/2026-10-03.json ("Animal", KATSEYE, 2026; a trending song, the queue being empty: #53 on Spotify's
// global daily chart and climbing (+122k streams a day on 2026-10-01), 435k TikTok videos on its 60 s sound, 122M views
// on the official video): its own cut (?kit=2026-10-03) 91.2647-155.2659 s of ~/personal/saxo-video/songs/animal/song.mp3
// (the official audio, 158.5 s): chorus 2, the instrumental bar, the dance-break bridge (the song's loudest bars) and the
// final chorus to the song's own end. 149.9972 BPM (one constant tempo, a click track: a DP tracker's beats fit it
// within 2.8 ms median over the whole song; the choruses sit exactly 128 beats apart), song beat 0 at 0.0630 s, bars on
// song beats 0 mod 4 (the kick); the kit starts on song beat 228 (bar 57, chorus 2's downbeat), so kit beat b = song
// beat 228 + b.
Object.assign(CONFIG, { title: 'Saxo dance — Animal', song: { title: 'Animal', artist: 'KATSEYE' }, duration: 64.0, bpm: 149.9972, beatOffset: 0 });
CONFIG.audio = { ...CONFIG.audio, tracks: [{ file: 'assets/audio/kits/2026-10-03.mp3', gain: 1, start: 0, offset: 0 }] };
