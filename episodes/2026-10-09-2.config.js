// kit for episodes/2026-10-09-2.json ("Espresso", Sabrina Carpenter, 2024; the queue being empty: a chart hit climbing
// again, +15 places and +39.5k streams a day on Spotify's global chart on 2026-10-09, its TikTok sound 527k videos):
// its own cut (?kit=2026-10-09-2) 18.7997-88.0209 s of ~/personal/saxo-video/songs/espresso/song.mp3 (the official
// audio, 175.5 s): bar 8's downbeat (the chorus's second half, its first word on beat 2) through verse 1, the
// pre-chorus, chorus 2 and its tag, to just before bar 38's downbeat (verse 2): no button, the loop runs bar 37 back
// into bar 8; 10/15 ms fades. 103.9993 BPM (a DP tracker's beats fit one tempo within 7.5 ms median over the whole
// song), song beat 0 at 0.338 s (the kick's attack, 35 ms after the onset grid); kit beat 0 = song beat 32 at 0 s;
// bars on song beats 0 mod 4 (the kick on 1 and 3, the snare on 2 and 4).
Object.assign(CONFIG, { title: 'Saxo dance — Espresso', song: { title: 'Espresso', artist: 'Sabrina Carpenter' }, duration: 69.22, bpm: 103.9993, beatOffset: 0 });
CONFIG.audio = { ...CONFIG.audio, tracks: [{ file: 'assets/audio/kits/2026-10-09-2.mp3', gain: 1, start: 0, offset: 0 }] };
