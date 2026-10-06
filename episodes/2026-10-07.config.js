// kit for episodes/2026-10-07.json ("APT.", ROSÉ & Bruno Mars, 2024; the queue being empty: Spotify global #105 after
// 716 days on the chart, the biggest TikTok sound of every candidate checked (3.74M videos on its 60 s sound, 7.5M over
// its three), a K-pop star after the K-pop episodes led the Shorts): its own cut (?kit=2026-10-07) 32.40-96.62 s of
// ~/personal/saxo-video/songs/apt/song.mp3 (the official audio, 170.0 s): from pre-chorus 1's first word (a 0.04 s
// pickup before bar 20) through the chant chorus, verse 2, pre-chorus 2 and the second chant chorus, stopped over
// 0.06 s just before the post-chorus's pickup, then 0.72 s of silence (the button) to 64.94 s. 148.995 BPM, steady
// (a DP tracker's beats fit one tempo within 2.5 ms median over the song), song beat 0 at 0.2839 s, bars on song beats
// 0 mod 4 (every section change); the kit starts 0.104 s before song beat 80 (bar 20), so kit beat b = song beat 80 + b.
Object.assign(CONFIG, { title: 'Saxo dance — APT.', song: { title: 'APT.', artist: 'ROSÉ & Bruno Mars' }, duration: 64.94, bpm: 148.99, beatOffset: 0.104 });
CONFIG.audio = { ...CONFIG.audio, tracks: [{ file: 'assets/audio/kits/2026-10-07.mp3', gain: 1, start: 0, offset: 0 }] };
