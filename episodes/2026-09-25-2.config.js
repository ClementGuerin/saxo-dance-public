// kit for episodes/2026-09-25-2.json ("Dans le club", Michou): its own cut, so it renders after src/ moves on (?kit=2026-09-25-2)
Object.assign(CONFIG, { title: 'Saxo dance — Dans le club', song: { title: 'Dans le club', artist: 'Michou' }, duration: 75.6, bpm: 115, beatOffset: 0.255 });
CONFIG.audio = { ...CONFIG.audio, tracks: [{ file: 'assets/audio/kits/2026-09-25-2.mp3', gain: 1, start: 0, offset: 0 }] };
