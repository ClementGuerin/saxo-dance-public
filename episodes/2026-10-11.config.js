// kit for episodes/2026-10-11.json ("Dracula (JENNIE Remix)", Tame Impala & JENNIE, 2026; the queue being empty: a
// chart climber, +99.8k streams a day and +22 places on Spotify's global chart on 2026-10-10, Tame Impala's own 52 s
// TikTok sound "Dracula (with JENNIE)" 1,337,042 videos): its own cut (?kit=2026-10-11) 46.5433-113.3196 s of
// ~/personal/saxo-video/songs/dracula/song.mp3 (the official lyric video's audio, 210.35 s): song beat 89 (pre-chorus
// 1's downbeat) through verse 2, pre-chorus 2 and chorus 1 to beat 217 (the downbeat after chorus 1's outro bar,
// before the break and JENNIE's first line), 15 ms fade in, 40 ms fade out. It holds the whole official sound but its
// last 2.75 beats (song 62.729-114.742 s = song beats 120.04-219.75, kit beats 31.04-130.75).
// 115.0108 BPM (a DP tracker's beats fit one tempo within 2.7 ms median over the cut; 2.3 ms over the song), song beat 0
// at 0.1129 s; the downbeats (the kick's bar) on song beats 1 mod 4: kit beat 0 = song beat 89 at 0 s, bars on kit
// beats 0 mod 4.
Object.assign(CONFIG, { title: 'Saxo dance — Dracula', song: { title: 'Dracula', artist: 'Tame Impala, JENNIE' }, duration: 66.776, bpm: 115.0108, beatOffset: 0 });
CONFIG.audio = { ...CONFIG.audio, tracks: [{ file: 'assets/audio/kits/2026-10-11.mp3', gain: 1, start: 0, offset: 0 }] };
