// kit for episodes/2026-09-26-2.json ("Voyage Voyage (Techno)", Hyper Duck): its own cut, so it renders after src/ moves on (?kit=2026-09-26-2)
// 0.00–62.44 s of ~/personal/saxo-video/songs/voyage-voyage/full.mp3: verse 1 and the pre-chorus over the light intro beat,
// the near-silent bar, the drop with the first half of the chorus (the vocal stops at 49.2 s), the drop's instrumental
// half and the break's decaying stabs (quiet from 61 s); it ends on bar 39's downbeat, before verse 2's pickup at 63.8 s.
// 150.0 BPM measured from the drops' repeats (40 bars = 64.00 s), beat 0 on the kick's click at 0.040 s
Object.assign(CONFIG, { title: 'Saxo dance — Voyage Voyage', song: { title: 'Voyage Voyage (Techno)', artist: 'Hyper Duck' }, duration: 62.44, bpm: 150, beatOffset: 0.04 });
CONFIG.audio = { ...CONFIG.audio, tracks: [{ file: 'assets/audio/kits/2026-09-26-2.mp3', gain: 1, start: 0, offset: 0 }] };
