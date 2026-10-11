// kit for episodes/2026-10-11-2.json ("Don't Stop The Music", Rihanna, 2007; the queue being empty: a chart climber,
// +104.5k streams a day and +12 places on Spotify's global chart on 2026-10-10 (#73), +14 places in the US, in a
// Rihanna wave (Only Girl +103k, Umbrella +64k); Rihanna's own 60 s TikTok sound 98,584 videos): its own cut
// (?kit=2026-10-11-2) of ~/personal/saxo-video/songs/dont-stop-the-music/song.mp3 (the official video's audio,
// 233.2 s, the radio edit): song beat 308 (the downbeat of chorus 2's last line, the title line) through the chant and
// its breakdown and the whole last chorus to song beat 444, where the song's own beat drops out. The DJ's stops are
// built in (make_kit.py): a turntable brake (the music's last 0.25 s stretched to 0.5 s, its rate falling to 0) and
// silence, one bar each, after song beats 316 and 364 (kit beats 8-12 and 60-64), and the same brake with a 2-beat
// silent button after 444 (kit beats 144-146). Kit beat k = song beat k + 308 (k < 8), k + 304 (12 <= k < 60),
// k + 300 (64 <= k < 144).
// 122.7011 BPM (a DP tracker's beats fit one tempo within 3.2 ms median from 12 s on), song beat 0 at 0.2767 s; the
// downbeats (the kick's bar, the chorus's stressed words) on song beats 0 mod 4: kit beat 0 = song beat 308 at 0 s,
// bars on kit beats 0 mod 4 (the stops are whole bars).
Object.assign(CONFIG, { title: "Saxo dance — Don't Stop The Music", song: { title: "Don't Stop The Music", artist: 'Rihanna' }, duration: 71.393, bpm: 122.7011, beatOffset: 0 });
CONFIG.audio = { ...CONFIG.audio, tracks: [{ file: 'assets/audio/kits/2026-10-11-2.mp3', gain: 1, start: 0, offset: 0 }] };
