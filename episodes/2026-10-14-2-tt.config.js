// kit for episodes/2026-10-14-2-tt.json, the TikTok cut of "Every Breath You Take" (The Police, 1983) on the band's own
// 28 s sound (music id 7432444695299787553, 615,447 videos): song 172.768-200.876 s of
// ~/personal/saxo-video/songs/every-breath-you-take/song.m4a at the song's own speed (7 log-spectrum pieces of 3 s, all at
// offset 172.768 s), the outro: the end of a held 'watching', an instrumental bar, then verses 1 and 2's lines sung again
// a bar apart. 117.3531 BPM; tt beat 0 = song beat 340 (the first downbeat inside the sound) at kit 1.4442 s. The upload
// is silent (TikTok adds the sound); this audio is for the render and the checks.
Object.assign(CONFIG, { title: 'Saxo dance — Every Breath You Take (TikTok)', song: { title: 'Every Breath You Take', artist: 'The Police' }, duration: 28.108, bpm: 117.3531, beatOffset: 1.4442 });
CONFIG.audio = { ...CONFIG.audio, truePeak: -2.0, tracks: [{ file: 'assets/audio/kits/2026-10-14-2-tt.mp3', gain: 1, start: 0, offset: 0 }] };
