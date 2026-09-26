// kit for episodes/2026-09-27-2.json ("Dans ma bulle (Veridis Remix)", Romsii; the user's queue, no instructions): its own
// cut, so it renders after src/ moves on (?kit=2026-09-27-2)
// 71.151–157.4 s of ~/personal/saxo-video/songs/dans-ma-bulle/full.mp3 (the Veridis Project upload): verse 2 from its
// downbeat, the bridge, the break (its one-beat hole at 41.8 s), chorus 2 on the drop, the 8-bar drop, and the soft
// outro, where the beat drops out on bar 40 (71.13 s): the story's pop; the song's last word, then 0.9 s of its own fade.
// 135.000 BPM measured from chorus 1 against chorus 2 (40 bars apart, r 0.86), the kick 0.06 s after the grid line; beat
// 0 at 71.171 s (0.020 s into the kit); bars start on song beats 0 mod 4 (bar 40 of the song = bar 0 of the kit).
Object.assign(CONFIG, { title: 'Saxo dance — Dans ma bulle', song: { title: 'Dans ma bulle (Veridis Remix)', artist: 'Romsii' }, duration: 86.2, bpm: 135, beatOffset: 0.02 });
CONFIG.audio = { ...CONFIG.audio, tracks: [{ file: 'assets/audio/kits/2026-09-27-2.mp3', gain: 1, start: 0, offset: 0 }] };
