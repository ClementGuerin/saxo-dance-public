// kit for episodes/2026-10-04.json ("Spooky, Scary Skeletons", Andrew Gold, 1996; the queue being empty and the night's
// first run stopped by the filter while picking from the charts, the pick came from SocialCrawl's music data: its
// 11 s TikTok sound has 3.46M videos, the most of the six spooky-season and chart songs checked, and the trend scan of
// 2026-10-04 says spooky season has started): its own cut (?kit=2026-10-04) 12.5000-74.8057 s of
// ~/personal/saxo-video/songs/spooky-scary-skeletons/song.mp3 (the official audio, 129.1 s): from the first sung line
// through the instrumental break to the song's own dead stop before verse 2 (song beat 192), plus one silent beat (the
// button). 154.079 BPM (one constant tempo: a DP tracker's beats fit it within 3.5 ms median over the whole song), song
// beat 0 at 0.0389 s, bars on song beats 0 mod 4; the kit starts on song beat 32 (the first line's downbeat), so kit
// beat b = song beat 32 + b.
Object.assign(CONFIG, { title: 'Saxo dance — Spooky, Scary Skeletons', song: { title: 'Spooky, Scary Skeletons', artist: 'Andrew Gold' }, duration: 62.695, bpm: 154.079, beatOffset: 0 });
CONFIG.audio = { ...CONFIG.audio, tracks: [{ file: 'assets/audio/kits/2026-10-04.mp3', gain: 1, start: 0, offset: 0 }] };
