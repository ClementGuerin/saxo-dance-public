// kit for episodes/2026-10-06.json ("Golden", HUNTR/X with EJAE, AUDREY NUNA and REI AMI, from the 2025 film
// KPop Demon Hunters; the queue being empty: Spotify global #70 after 470 days on the chart, 2.12M TikTok videos on its
// 60 s sound): its own cut (?kit=2026-10-06) 22.1150-94.3062 s of ~/personal/saxo-video/songs/golden/song.mp3 (the
// official audio, Republic Records, 194.0 s): from the bar before verse 1's first line through the pre-chorus, the
// chorus and the post-chorus to the downbeat where verse 2 drops to a whisper (bar 44), stopped dead over 0.08 s, then
// half a second of silence (the button) to 72.70 s. 123.000 BPM (a DP tracker's beats fit it within 1.9 ms median over
// 8-93 s; the bridge after 94 s shifts the grid by a quarter beat, outside the cut), song beat 0 at 8.4525 s, bars on
// song beats 0 mod 4 (the kick's strongest beat and every section change); the kit starts on song beat 28 (bar 7), so
// kit beat b = song beat 28 + b.
Object.assign(CONFIG, { title: 'Saxo dance — Golden', song: { title: 'Golden', artist: 'HUNTR/X' }, duration: 72.7, bpm: 123, beatOffset: 0 });
CONFIG.audio = { ...CONFIG.audio, tracks: [{ file: 'assets/audio/kits/2026-10-06.mp3', gain: 1, start: 0, offset: 0 }] };
