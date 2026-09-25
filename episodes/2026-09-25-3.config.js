// kit for episodes/2026-09-25-3.json ("99 Luftballons", Snoblack techno): its own cut, so it renders after src/ moves on (?kit=2026-09-25-3)
// 23.389–90.207 s of the song (the drop's downbeat → the breakdown's last beat, where the music stops dead) + 0.64 s of silence
// (the user's cut, 2026-09-25: start straight on the hook, and don't end long on no sound)
Object.assign(CONFIG, { title: 'Saxo dance — 99 Luftballons', song: { title: '99 Luftballons (Techno)', artist: 'Snoblack' }, duration: 67.45, bpm: 176, beatOffset: 0 });
CONFIG.audio = { ...CONFIG.audio, tracks: [{ file: 'assets/audio/kits/2026-09-25-3.mp3', gain: 1, start: 0, offset: 0 }] };
