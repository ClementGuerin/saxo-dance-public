// kit for episodes/2026-10-10-2.json ("WHERE IS MY HUSBAND!", RAYE, 2025; the queue being empty: a chart song climbing,
// Spotify global #51 and +101k streams a day on 2026-10-09, RAYE's own 60 s TikTok sound 318k videos): its own cut
// (?kit=2026-10-10-2) 54.8150-123.1604 s of ~/personal/saxo-video/songs/where-is-my-husband/mv_audio.m4a (the official
// video's audio, 197.9 s; no Topic upload found): song beat 106 (chorus 2's downbeat, after the pre-chorus's break)
// through chorus 2, its stop bar (the a cappella tag), verse 2, pre-chorus 2 and chorus 3, to beat 238.13 (the band's
// dead stop after chorus 3's last line, before the a cappella tag), a 50 ms fade, then one silent beat (the button).
// 115.9961 BPM (a DP tracker's beats fit one tempo within 3.5 ms median from 8 s to 190 s; the onset autocorrelation's
// 154 BPM is the dotted-eighth pulse, x3/4), song beat 0 at -0.0144 s (the kick on the downbeats within 2 ms); kit
// beat 0 = song beat 106 at 0 s; bars on song beats 2 mod 4 (kit beats 0 mod 4).
Object.assign(CONFIG, { title: 'Saxo dance — WHERE IS MY HUSBAND!', song: { title: 'WHERE IS MY HUSBAND!', artist: 'RAYE' }, duration: 68.863, bpm: 115.9961, beatOffset: 0 });
CONFIG.audio = { ...CONFIG.audio, tracks: [{ file: 'assets/audio/kits/2026-10-10-2.mp3', gain: 1, start: 0, offset: 0 }] };
