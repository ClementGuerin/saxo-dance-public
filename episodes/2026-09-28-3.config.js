// kit for episodes/2026-09-28-3.json ("Billie Jean", Michael Jackson; back on Spotify's global daily chart, #21 on
// 2026-09-27, 856k videos on its TikTok sound): its own cut, so it renders after src/ moves on (?kit=2026-09-28-3)
// 28.936–107.927 s of ~/personal/saxo-video/songs/billie-jean/full.mp3 (the official audio): verse 1 (both halves), the
// pre-chorus and chorus 1, the music stopping dead on beat 154 (the kick after the chorus's last word), then 0.61 s of
// silence (the button). 116.96 BPM from chorus 1 against chorus 2 (40 bars apart, 81.984 s) and a constant-tempo fit of
// the kicks over the cut (the kick lands within ±16 ms of the grid all through); beat 0 is the kit's first frame, a
// downbeat (song beat 56 at 0.208 + 56 * 60/116.96 s: the bassline's F# lands on it, the kick on beats 1 and 3).
Object.assign(CONFIG, { title: 'Saxo dance — Billie Jean', song: { title: 'Billie Jean', artist: 'Michael Jackson' }, duration: 79.6, bpm: 116.96, beatOffset: 0 });
// truePeak -3.5: this dense 1983 master overshot by 2.3 dB in the AAC encode (the -1.5 ceiling measured +0.8 dBTP in the MP4)
CONFIG.audio = { ...CONFIG.audio, truePeak: -3.5, tracks: [{ file: 'assets/audio/kits/2026-09-28-3.mp3', gain: 1, start: 0, offset: 0 }] };
