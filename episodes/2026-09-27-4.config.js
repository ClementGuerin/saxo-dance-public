// kit for episodes/2026-09-27-4.json ("Beauty And A Beat", Justin Bieber ft. Nicki Minaj; a throwback trending again:
// #10 on Spotify's global daily chart on 2026-09-26, 3.2M streams, and 660k videos on its official TikTok sound): its
// own cut, so it renders after src/ moves on (?kit=2026-09-27-4)
// 15.62–90.62 s of ~/personal/saxo-video/songs/beauty-and-a-beat/full.mp3 (the official audio): verse 1, the
// pre-chorus, both halves of the chorus and the 8-bar instrumental drop, cut 0.04 s before verse 2's downbeat (its
// voice comes in on the bar: the centre channel rises there) with a 0.05 s fade. 128.000 BPM measured from chorus 1
// against chorus 2 (40 bars apart, 74.996 s, r 0.91); beat 0 on the kick at 15.659 s (0.039 s into the kit: bar 8 of
// the song's grid, whose downbeats sit at 0.659 s + n * 1.875 s by the section changes); B0 is a downbeat.
Object.assign(CONFIG, { title: 'Saxo dance — Beauty And A Beat', song: { title: 'Beauty And A Beat', artist: 'Justin Bieber, Nicki Minaj' }, duration: 75, bpm: 128, beatOffset: 0.039 });
CONFIG.audio = { ...CONFIG.audio, tracks: [{ file: 'assets/audio/kits/2026-09-27-4.mp3', gain: 1, start: 0, offset: 0 }] };
