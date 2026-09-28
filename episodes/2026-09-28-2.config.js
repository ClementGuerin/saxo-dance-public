// kit for episodes/2026-09-28-2.json ("Hootie Frutti", KATSEYE; its official MV at 108M views, the Saturday Night Live
// performance of 2026-09-27 on YouTube's US trending music, 30 then 24k videos on its TikTok sounds): its own cut, so it
// renders after src/ moves on (?kit=2026-09-28-2)
// 70.326–137.300 s of ~/personal/saxo-video/songs/hootie-frutti/full.mp3 (the official lyric video's audio): verse 2,
// pre-chorus 2, chorus 2, the outro chant ("fruit" seven times a line, four lines) and the last word on the final hit,
// then the song's own dead stop (136.4 s) and 0.9 s of its tail, faded over the last 0.35 s. 130.000 BPM measured from
// chorus 1 against chorus 2 (28 bars apart, 51.692 s, r 0.94 low band / 0.98 full), a constant-tempo fit of the kicks
// over the whole song (129.98-130.00); beat 0 on the kick at 70.366 s (verse 2's downbeat, 0.04 s into the kit; the
// song's downbeats sit at 0.212 s + 4n * 60/130 by its section changes); B0 is a downbeat.
Object.assign(CONFIG, { title: 'Saxo dance — Hootie Frutti', song: { title: 'Hootie Frutti', artist: 'KATSEYE' }, duration: 66.97, bpm: 130, beatOffset: 0.04 });
CONFIG.audio = { ...CONFIG.audio, tracks: [{ file: 'assets/audio/kits/2026-09-28-2.mp3', gain: 1, start: 0, offset: 0 }] };
