// kit for episodes/2026-09-29.json ("Vamos a la playa", Loona, 2010; the user's queue, no instructions): its own cut
// (?kit=2026-09-29) 0.2331-67.28 s of ~/personal/saxo-video/songs/vamos-a-la-playa/full.mp3 (the official video's
// audio, 174.8 s): the song's first downbeat, chorus 1 (two cycles), verse 1, chorus 2, the instrumental, the bridge and
// its chant, ending in the song's own break before verse 2 (the bass drops out at 66.5 s, the pickup comes in at
// 67.35 s) with a 0.06 s fade and 0.45 s of silence. 131.002 BPM from chorus 3 against chorus 4 (33 bars apart,
// 60.462 s) and a DP beat tracker's constant-tempo fit (median residual 2.7 ms over the song); beat 0 is the kit's first
// frame, song beat 0 at 0.2331 s, a downbeat (every section change lands on a beat 4k).
Object.assign(CONFIG, { title: 'Saxo dance — Vamos a la playa', song: { title: 'Vamos a la playa', artist: 'Loona' }, duration: 67.5, bpm: 131.002, beatOffset: 0 });
CONFIG.audio = { ...CONFIG.audio, tracks: [{ file: 'assets/audio/kits/2026-09-29.mp3', gain: 1, start: 0, offset: 0 }] };
