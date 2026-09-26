// kit for episodes/2026-09-27.json ("Caramelldansen", Caramella Girls, the Swedish original; the user's queue: "start on
// the hook at 0:49", "a really Japanese, kawaii clip"): its own cut, so it renders after src/ moves on (?kit=2026-09-27)
// 49.873–121.08 s of ~/personal/saxo-video/songs/caramelldansen/full.mp3: the synth hook's bar (the downbeat at 49.893 s,
// the 0:49 the user asked for), chorus 1, the chant, verse 2, pre-chorus 2, chorus 2 and the 8-bar instrumental; the
// music stops dead 0.1 s before chorus 3's first word, then 0.6 s of silence as the button.
// 164.732 BPM measured from four pairs of chorus repeats (32 to 74 bars apart, all within 0.01 BPM), beat 0 on the kick
// at 49.893 s (0.020 s into the kit); bars start on song beats 1 mod 4.
Object.assign(CONFIG, { title: 'Saxo dance — Caramelldansen', song: { title: 'Caramelldansen', artist: 'Caramella Girls' }, duration: 71.8, bpm: 164.732, beatOffset: 0.02 });
CONFIG.audio = { ...CONFIG.audio, tracks: [{ file: 'assets/audio/kits/2026-09-27.mp3', gain: 1, start: 0, offset: 0 }] };
