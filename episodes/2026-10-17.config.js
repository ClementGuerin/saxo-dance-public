// kit for episodes/2026-10-17.json ("As It Was", Harry Styles, 2022; the queue being empty: a Harry Styles wave on the
// charts, #87 (+6, +40.6k streams a day) on Spotify's global daily chart on 2026-10-15 while "Sign of the Times" climbs
// +69k; Harry Styles' own 60 s TikTok sound 2,334,454 videos): its own cut (?kit=2026-10-17) 36.0089-124.2773 s of
// ~/personal/saxo-video/songs/as-it-was/song.mp3 (the official audio, 165.6 s), then 0.7 s of silence: song beats
// 52-180, chorus 1 from the bar before its pickup, the post-chorus, verse 2, chorus 2 and the post-chorus, cut 10 ms
// before the bridge's downbeat; 20 ms fade in, 40 ms fade out.
// 86.9976 BPM (a DP tracker's beats fit one tempo within 2.3 ms median over the song), song beat 0 at 0.1458 s,
// downbeats on beats 0 mod 4 (verse 1 on song beat 20, chorus 1 on 56, verse 2 on 100, chorus 2 on 136, the bridge on
// 180): kit beat 0 = song beat 52 at kit 0.
// Sections (kit beats): intro bar 0-4 (chorus pickup at 2.6), chorus 1 4-36, post-chorus 36-48, verse 2 48-80, the
// gap 80-84 (chorus pickup at 82.6), chorus 2 84-116, post-chorus 116-128, silence 128-129.
// The official TikTok sound (music id 7081404214387148802, 60 s) is song 53.383-113.383 s at the song's own speed
// (log-spectrum r 0.999 over the whole sound): kit 17.374-77.374 s (kit beats 25.19-112.19).
Object.assign(CONFIG, { title: 'Saxo dance — As It Was', song: { title: 'As It Was', artist: 'Harry Styles' }, duration: 88.9684, bpm: 86.9976, beatOffset: 0 });
CONFIG.audio = { ...CONFIG.audio, truePeak: -2.0, tracks: [{ file: 'assets/audio/kits/2026-10-17.mp3', gain: 1, start: 0, offset: 0 }] };   // a -2.0 dBTP master: at the default -1.5 the AAC encode overshot to -1.1
