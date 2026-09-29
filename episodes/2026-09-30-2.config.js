// kit for episodes/2026-09-30-2.json ("Self Aware", Temper City; #11 on Spotify's global daily chart on 2026-09-29, 3.19M
// TikTok videos on its 29 s sound, 41M views on the official video): its own cut (?kit=2026-09-30-2) 38.4726-122.2064 s
// of ~/personal/saxo-video/songs/self-aware/full.mp3 (the official video's audio, 180.8 s): chorus 1, verse 2 and chorus 2,
// ending two beats into the quiet instrumental with a 0.12 s fade and one silent beat (0.37 s). 162.000 BPM (a DP beat
// tracker on the onsets, a constant fit over 10-120 s with a 3 ms median residual: a click track); song beat 0 at
// -0.0157 s, the downbeat on the kick's phase; the kit starts 0.03 s before song beat 104, the chorus downbeat.
Object.assign(CONFIG, { title: 'Saxo dance — Self Aware', song: { title: 'Self Aware', artist: 'Temper City' }, duration: 84.1, bpm: 162, beatOffset: 0.03 });
CONFIG.audio = { ...CONFIG.audio, tracks: [{ file: 'assets/audio/kits/2026-09-30-2.mp3', gain: 1, start: 0, offset: 0 }] };
