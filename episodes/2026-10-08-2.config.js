// kit for episodes/2026-10-08-2.json ("Poker Face", Lady Gaga, 2008; the queue being empty: the biggest official TikTok
// sound of the eight chart candidates checked, 1.15M videos on its 60 s sound, Lady Gaga's catalogue climbing Spotify's
// global chart): its own cut (?kit=2026-10-08-2) 14.208-81.063 s of ~/personal/saxo-video/songs/poker-face/song.mp3
// (the official audio, The Fame, 237.2 s): bar 7's downbeat (song beat 28, one beat before the third intro chant)
// through the chant, verse 1, the pre-chorus, chorus 1 and the post-chorus to bar 40's downbeat (song beat 160, where
// verse 2 comes in), plus 0.3 s of that downbeat fading out; a 20 ms fade in. 118.9986 BPM (a DP tracker's beats fit
// one tempo within 1.9 ms median over the whole song), song beat 0 at 0.0902 s; kit beat 0 = song beat 28 at 0 s;
// bars on song beats 0 mod 4 (the choruses' energy rises land on them).
Object.assign(CONFIG, { title: 'Saxo dance — Poker Face', song: { title: 'Poker Face', artist: 'Lady Gaga' }, duration: 66.86, bpm: 118.9986, beatOffset: 0 });
CONFIG.audio = { ...CONFIG.audio, tracks: [{ file: 'assets/audio/kits/2026-10-08-2.mp3', gain: 1, start: 0, offset: 0 }] };
