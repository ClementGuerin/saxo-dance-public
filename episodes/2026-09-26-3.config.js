// kit for episodes/2026-09-26-3.json ("Die Young", Kesha): its own cut, so it renders after src/ moves on (?kit=2026-09-26-3)
// 142.71–211.30 s of ~/personal/saxo-video/songs/die-young/full.mp3: pre-chorus 2 (8 bars), the 4-bar break (quiet
// from 15.0 s, the chorus pickup at 21.2 s), the half-time chorus, the full chorus, the chant and the last refrain; the
// beat stops dead at 67.50 s, the last word holds to 67.94 s and the cut keeps 0.65 s of its decay as the button.
// 128.000 BPM measured from the song's two identical 40-bar cycles (75.000 s apart), beat 0 on the kick at 142.71 s
Object.assign(CONFIG, { title: 'Saxo dance — Die Young', song: { title: 'Die Young', artist: 'Kesha' }, duration: 68.59, bpm: 128, beatOffset: 0 });
CONFIG.audio = { ...CONFIG.audio, tracks: [{ file: 'assets/audio/kits/2026-09-26-3.mp3', gain: 1, start: 0, offset: 0 }] };
