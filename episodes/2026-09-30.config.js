// kit for episodes/2026-09-30.json ("Ain't In LA", ADÉLA, 2026; #5 on Spotify's global daily chart and ~600k TikTok
// videos on its sounds): its own cut (?kit=2026-09-30) 15.7497-84.8194 s of ~/personal/saxo-video/songs/aint-in-la/full.mp3
// (the official audio, 184.9 s) = bars 9-49 of the song's grid: the hook's second cycle, verse 1, the pre-chorus and
// chorus 1, ending as the next hook's pickup comes in, with a 0.08 s fade and one silent beat (0.43 s). 138.99 BPM from
// the hook against its repeats 40 and 48 bars later (69.07 and 82.88 s, onset cross-correlation, both bands agree);
// song beat 0 at 0.209 s, a downbeat (every section change lands on a bar); the kit's first frame is a downbeat.
Object.assign(CONFIG, { title: "Saxo dance — Ain't In LA", song: { title: "Ain't In LA", artist: 'ADÉLA' }, duration: 69.5, bpm: 138.99, beatOffset: 0 });
CONFIG.audio = { ...CONFIG.audio, tracks: [{ file: 'assets/audio/kits/2026-09-30.mp3', gain: 1, start: 0, offset: 0 }] };
