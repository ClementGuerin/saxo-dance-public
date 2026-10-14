// kit for episodes/2026-10-14-2.json ("Every Breath You Take", The Police, 1983; the queue being empty: a throwback
// climbing again, +25 places on Spotify's US daily chart and +4 on the global one on 2026-10-13 (#42, +116k streams a
// day), The Police's own 28 s TikTok sound 615,447 videos (their 60 s one 152,930), and the song TikTok's pets stare
// at their owners to): its own cut (?kit=2026-10-14-2) 14.6936-80.1371 s of
// ~/personal/saxo-video/songs/every-breath-you-take/song.m4a (the official audio, 252.7 s): song beats 28-156, verse 1,
// verse 2, the bridge and verse 3; 20 ms fade in, 40 ms fade out, no silence (verse 3's last bar loops into verse 1).
// 117.3531 BPM (a DP tracker's beats fit one tempo within 8.1 ms median over the song), song beat 0 at 0.3778 s,
// downbeats on beats 0 mod 4: kit beat 0 = song beat 28 at kit 0.0 s. Sections (kit beats): verse 1 0-32, verse 2
// 32-64, the bridge 64-88, verse 3 88-128.
// The official TikTok sound (music id 7432444695299787553, 28 s) is song 172.768-200.876 s at the song's own speed (7
// log-spectrum pieces of 3 s, all at the same offset): song beats 337.17-392.16, the outro, which sings verses 1 and
// 2's lines again a bar apart. The 60 s one (6754121489244506113) is song 47.345-107.345 s (beats 91.86-209.2: the
// bridge, verse 3 and the middle 8).
Object.assign(CONFIG, { title: 'Saxo dance — Every Breath You Take', song: { title: 'Every Breath You Take', artist: 'The Police' }, duration: 65.4435, bpm: 117.3531, beatOffset: 0 });
CONFIG.audio = { ...CONFIG.audio, truePeak: -2.0, tracks: [{ file: 'assets/audio/kits/2026-10-14-2.mp3', gain: 1, start: 0, offset: 0 }] };   // a -2.0 dBTP master: at the default -1.5 the AAC encode overshot to -1.1
