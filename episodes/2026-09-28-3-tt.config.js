// kit for episodes/2026-09-28-3-tt.json: TikTok's official sound for "Billie Jean" (Michael Jackson's own, music id
// 6748693359088418818, 40 s, 855,903 videos on 2026-09-28, the artist's most used), which is song 67.7513-108.632 s of
// ~/personal/saxo-video/songs/billie-jean/full.mp3 played 0.26% slower (per-piece onset lags on three bands fall on one
// line, song = 67.7513 + 0.997426 * tt, residual 0.9 ms; tt_grid.py there): the break before the pre-chorus, the
// pre-chorus and chorus 1, the main cut's own b75.7-b155.4, fading out from 40.24 s. The video is uploaded silent and
// the sound added in TikTok (TikTok muted the main post, 2026-09-28); this audio is the official sound itself, only for
// the preview and the QA of the sync. 116.66 BPM (the main's 116.96 x 0.997426), beat 0 at 0.1728 s: main beat 76,
// a downbeat (tt beat b = main beat b - 76).
Object.assign(CONFIG, { title: 'Saxo dance — Billie Jean (TikTok)', song: { title: 'Billie Jean', artist: 'Michael Jackson' }, duration: 40.95, bpm: 116.66, beatOffset: 0.1728 });
// truePeak -3.5 as the main kit: this dense 1983 master overshoots in the AAC encode
CONFIG.audio = { ...CONFIG.audio, truePeak: -3.5, tracks: [{ file: 'assets/audio/kits/2026-09-28-3-tt.mp3', gain: 1, start: 0, offset: 0 }] };
