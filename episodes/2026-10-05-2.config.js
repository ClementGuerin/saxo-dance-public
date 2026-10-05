// kit for episodes/2026-10-05-2.json ("DtMF", Bad Bunny, 2025; the queue being empty: +22 on Spotify's US daily chart on
// 2026-10-05, its 60 s TikTok sound has 1.09M videos): its own cut (?kit=2026-10-05-2) 51.0152-118.9000 s of
// ~/personal/saxo-video/songs/dtmf/song.mp3 (the official audio, 240.3 s): from the drop (song beat 96) through the end
// of verse 1, the pre-chorus and the chorus twice, to the last word of its break (verse 2 starts at ~119 s), faded over
// 0.1 s, then half a second of silence (the button) to 68.40 s. 113.000 BPM (a 160-beat repeat, r 0.64; a DP tracker's
// beats fit it within 3.8 ms median), song beat 0 at 0.0417 s, bars on song beats 0 mod 4 (the section changes); the
// kit starts on song beat 96 (bar 24), so kit beat b = song beat 96 + b.
Object.assign(CONFIG, { title: 'Saxo dance — DtMF', song: { title: 'DtMF', artist: 'Bad Bunny' }, duration: 68.4, bpm: 113, beatOffset: 0 });
CONFIG.audio = { ...CONFIG.audio, tracks: [{ file: 'assets/audio/kits/2026-10-05-2.mp3', gain: 1, start: 0, offset: 0 }] };
