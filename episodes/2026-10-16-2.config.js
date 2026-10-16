// kit for episodes/2026-10-16-2.json ("deja vu", Olivia Rodrigo, 2021; the queue being empty: a throwback climbing again
// in Olivia Rodrigo's new era, +22 places on Spotify's US daily chart (#158) and +7 on the global one (#142, 1.27M streams
// a day) on 2026-10-15, her own 60 s TikTok sound 965,521 videos): its own cut (?kit=2026-10-16-2) 147.42-213.452 s of
// ~/personal/saxo-video/songs/deja-vu/song.mp3 (the official audio, 215.5 s): the post-chorus's two lines, its three
// "déjà vu" lines, the bridge's rapid list and the outro's hook line three times, to the last chord gone; 30 ms fade in,
// 0.6 s fade out.
// 90.4957 BPM (a DP tracker's beats over song 135-215 s fit one tempo within 2.6 ms median), song beat 0 at 135.216 s,
// downbeats on beats 0 mod 4: kit beat 0 = song beat 20 at kit 1.0563 s (the post-chorus's first line sits in kit beats
// -1.5..2). Sections (kit beats): the post-chorus -1.5-12, the déjà vu lines 12-32, the bridge 32-60, the outro 60-98.
// The official TikTok sound (music id 6945541245435381761, 60 s) is song 147.017-207.017 s at the song's own speed (15
// log-spectrum pieces of 3 s, r 0.998-0.999, one offset): the TikTok cut is its first 90 beats, kit -0.403-59.268 s.
Object.assign(CONFIG, { title: 'Saxo dance — deja vu', song: { title: 'deja vu', artist: 'Olivia Rodrigo' }, duration: 66.0318, bpm: 90.4957, beatOffset: 1.0563 });
CONFIG.audio = { ...CONFIG.audio, truePeak: -2.0, tracks: [{ file: 'assets/audio/kits/2026-10-16-2.mp3', gain: 1, start: 0, offset: 0 }] };   // a -2.0 dBTP master: at the default -1.5 the AAC encode overshot to -1.1
