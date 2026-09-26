// kit for episodes/2026-09-26.json ("He's A Pirate (Save Me)", Gabry Ponte, Steve Aoki, KEL): its own cut, so it renders after src/ moves on (?kit=2026-09-26)
// 80.04–148.87 s of ~/personal/saxo-video/songs/hes-a-pirate/full.mp3: the bar before chorus 2 (its first word is a pickup at 0.96 s),
// chorus 2, the tag and build, drop 2 (two instrumental phrases, then the last chorus over the third), the outro and its ring-out;
// 144.0 BPM measured from the two halves' repeat (40 bars = 66.667 s), the kick on the grid, beat 0 on the cut's first sample
Object.assign(CONFIG, { title: "Saxo dance — He's A Pirate", song: { title: "He's A Pirate (Save Me)", artist: 'Gabry Ponte, Steve Aoki, KEL' }, duration: 68.83, bpm: 144, beatOffset: 0 });
CONFIG.audio = { ...CONFIG.audio, tracks: [{ file: 'assets/audio/kits/2026-09-26.mp3', gain: 1, start: 0, offset: 0 }] };
