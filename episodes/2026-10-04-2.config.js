// kit for episodes/2026-10-04-2.json ("Beautiful Things", Benson Boone, 2024; a trending song, the queue being empty:
// its 34 s TikTok sound has 4.69M videos, the official video 1.1B views, #58 on Spotify's global daily chart on
// 2026-10-03): its own cut (?kit=2026-10-04-2) 101.1091-177.1091 s of ~/personal/saxo-video/songs/beautiful-things/song.mp3
// (the official audio, 180.4 s): the riff after chorus 1, the post-chorus cry, verse 3 and chorus 2 to the song's own
// stop (175.5 s) and its reverb tail, faded over the last 0.6 s. 105.000 BPM (a click track: a DP tracker's beats fit it
// within 7.6 ms median), song beat 0 at 0.5377 s, bars on song beats 0 mod 4; the kit starts on song beat 176 (bar 44),
// so kit beat b = song beat 176 + b.
Object.assign(CONFIG, { title: 'Saxo dance — Beautiful Things', song: { title: 'Beautiful Things', artist: 'Benson Boone' }, duration: 76.0, bpm: 105, beatOffset: 0 });
CONFIG.audio = { ...CONFIG.audio, tracks: [{ file: 'assets/audio/kits/2026-10-04-2.mp3', gain: 1, start: 0, offset: 0 }] };
