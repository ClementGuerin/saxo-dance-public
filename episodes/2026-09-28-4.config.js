// kit for episodes/2026-09-28-4.json ("Dai Dai", Shakira & Burna Boy, the official 2026 World Cup song; #14 on Spotify's
// global daily chart on 2026-09-27 and rising, 2.69M videos on its TikTok sound): its own cut (?kit=2026-09-28-4)
// 25.078–91.285 s of ~/personal/saxo-video/songs/dai-dai/official_audio.m4a (the official audio): the title hook sung
// twice, the 4-bar instrumental break, verse 1 and chorus 1, ending on song beat 176, the downbeat where the next verse
// comes in (its first word 0.18 s later), with a 0.13 s fade. 116.00 BPM from chorus 1 against chorus 2 (34 bars apart,
// 70.342 s) and a constant-tempo fit of the kicks (115.99-116.00 over 20-220 s); beat 0 is the kit's first frame, song
// beat 48 at 0.25 + 48 * 60/116 s, the downbeat the hook's first word lands on (the kick is strongest there in the choruses).
Object.assign(CONFIG, { title: 'Saxo dance — Dai Dai', song: { title: 'Dai Dai', artist: 'Shakira & Burna Boy' }, duration: 66.2, bpm: 116, beatOffset: 0 });
CONFIG.audio = { ...CONFIG.audio, tracks: [{ file: 'assets/audio/kits/2026-09-28-4.mp3', gain: 1, start: 0, offset: 0 }] };
