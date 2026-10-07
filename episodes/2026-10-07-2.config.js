// kit for episodes/2026-10-07-2.json ("Take on Me", a-ha, 1985; a throwback on the charts, the queue being empty: Spotify
// global #126 after 116 days, ~976k TikTok videos on its 30 s sound and 510k on its 60 s one; picked from the charts on
// disk and SocialCrawl after the night's second run was stopped by the filter while picking): its own cut
// (?kit=2026-10-07-2) 5.69-73.40 s of ~/personal/saxo-video/songs/take-on-me/song.mp3 (the official audio, "Hunting High
// and Low", 228.5 s): from the synth riff's first bar (song beat 16, after the drums-only bars) through the riff's 20
// bars, verse 1 and chorus 1, stopped over 0.04 s just before verse 2's one-beat pickup, then 0.356 s of silence (the
// button) to 68.06 s. 169.094 BPM (a drum machine: a DP tracker's beats fit one tempo within 4.8 ms median over the
// cut), song beat 0 at 0.0168 s, bars on song beats 0 mod 4 (every section change); the kit starts 0.004 s before song
// beat 16, so kit beat b = song beat 16 + b (verse 1 on kit bar 20, chorus 1 on kit bar 32).
Object.assign(CONFIG, { title: 'Saxo dance — Take on Me', song: { title: 'Take on Me', artist: 'a-ha' }, duration: 68.06, bpm: 169.0943, beatOffset: 0.0041 });
CONFIG.audio = { ...CONFIG.audio, tracks: [{ file: 'assets/audio/kits/2026-10-07-2.mp3', gain: 1, start: 0, offset: 0 }] };
