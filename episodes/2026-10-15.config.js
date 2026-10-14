// kit for episodes/2026-10-15.json ("The Fate of Ophelia", Taylor Swift, 2025; the queue being empty: the lead single of
// The Life of a Showgirl climbing again a year on, +6 places on Spotify's global daily chart on 2026-10-13 (#37, +160k
// streams a day), and Taylor Swift's own 60 s TikTok sound 2,427,711 videos, the biggest sound we've used): its own cut
// (?kit=2026-10-15) 10.0349-85.5198 s of ~/personal/saxo-video/songs/the-fate-of-ophelia/song.m4a (the official audio
// from the artist's lyric video, 229.7 s): song beats 20-176, verse 1, the pre-chorus and the chorus; 20 ms fade in,
// 300 ms fade out as the chorus's last held word decays (verse 2's first note is at ~86.4 s).
// 123.9983 BPM (a DP tracker's beats fit one tempo within 2.2 ms median over the song), song beat 0 at 0.3573 s,
// downbeats on beats 0 mod 4 (the choruses start on song beats 96, 252 and 368): kit beat 0 = song beat 20 at kit 0.0 s.
// Sections (kit beats): verse 1 0-76 (its first note on kit beat 1), the pre-chorus 76-112, the chorus 112-156.
// The official TikTok sound (music id 7556815852168759313, 60 s) is song 27.040-87.040 s at the song's own speed (15
// log-spectrum pieces of 3 s, all at the same offset, r 0.999): song beats 55.14-179.14, kit 17.005-77.005 s.
Object.assign(CONFIG, { title: 'Saxo dance — The Fate of Ophelia', song: { title: 'The Fate of Ophelia', artist: 'Taylor Swift' }, duration: 75.4849, bpm: 123.9983, beatOffset: 0 });
CONFIG.audio = { ...CONFIG.audio, truePeak: -2.0, tracks: [{ file: 'assets/audio/kits/2026-10-15.mp3', gain: 1, start: 0, offset: 0 }] };   // a -2.0 dBTP master: at the default -1.5 the AAC encode overshot to -1.1
