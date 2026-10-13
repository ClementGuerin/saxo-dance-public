// kit for episodes/2026-10-14.json ("On The Floor", Jennifer Lopez ft. Pitbull, 2011; the queue being empty: a 2011 club
// anthem climbing again, +6 places on Spotify's global chart on 2026-10-12 (#88), the artists' own 60 s TikTok sound
// 701,980 videos): its own cut (?kit=2026-10-14) 44.1846-108.1083 s of ~/personal/saxo-video/songs/on-the-floor/song.m4a
// (the official album audio, 284.9 s): from the call-outs' pickup (song grid beat 95.5) through the call-outs, verse 1, the
// chorus with its breakdown and the build, the hook's first line on the beat drop and its repeat, to the gap before the
// rapper's verse (grid beat 234); 20 ms fade in, 40 ms fade out, then 0.6 s of silence (the button).
// 129.9988 BPM (a DP tracker's beats fit one tempo within 2.6 ms median over the song), song grid beat 0 at 0.1073 s,
// downbeats on grid beats 0 mod 4: kit beat 0 = grid 96 at kit 0.2308 s; the breakdown kit beats 72-116 (the kick gone),
// the beat drop at kit beat 120 (grid 216), the hook's lines at kit beats 114 and 130.
// The official TikTok sound (music id 6917324503026501634, 60 s) is song 49.0160-109.0160 s at the song's own speed
// (29 log-spectrum pieces, 0.7 ms residual): kit 4.831 to 64.831 s, i.e. grid beats 105.97-235.97 (kit 9.97-139.97).
Object.assign(CONFIG, { title: 'Saxo dance — On The Floor', song: { title: 'On The Floor', artist: 'Jennifer Lopez' }, duration: 64.5237, bpm: 129.9988, beatOffset: 0.2308 });
CONFIG.audio = { ...CONFIG.audio, truePeak: -2.0, tracks: [{ file: 'assets/audio/kits/2026-10-14.mp3', gain: 1, start: 0, offset: 0 }] };   // a -2.0 dBTP master: at the default -1.5 the AAC encode overshot to -1.1
