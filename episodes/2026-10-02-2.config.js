// kit for episodes/2026-10-02-2.json ("Bring Me To Life", Evanescence, 2003; a throwback on the charts in spooky season:
// #66 on Spotify's global daily chart and #60 in the US on 2026-10-01, 697k TikTok videos on its 60 s sound): its own cut
// (?kit=2026-10-02-2) 52.3487-138.3513 s of ~/personal/saxo-video/songs/bring-me-to-life/song.mp3 (the official audio,
// the 2023 remaster, 236.4 s): chorus 1, the break bar, verse 2, the song's own near-silent bar, chorus 2 and the title
// post-chorus, ending on the bridge's downbeat. 94.8809 BPM (one constant tempo, a click track: the three choruses sit
// exactly 72, 128 and 200 beats apart; a DP tracker's beats fit it within 3 ms median), song beat 0 at 0.49423 s, bars
// on song beats 2 mod 4; the kit starts on song beat 82 (chorus 1's downbeat), so kit beat b = song beat 82 + b.
// TikTok's official sound (Evanescence, 60 s, 697k videos) is song 53.16-113.16 s: the kit's 0.81-60.81 s.
Object.assign(CONFIG, { title: 'Saxo dance — Bring Me To Life', song: { title: 'Bring Me To Life', artist: 'Evanescence' }, duration: 86.0, bpm: 94.8809, beatOffset: 0 });
CONFIG.audio = { ...CONFIG.audio, tracks: [{ file: 'assets/audio/kits/2026-10-02-2.mp3', gain: 1, start: 0, offset: 0 }] };
