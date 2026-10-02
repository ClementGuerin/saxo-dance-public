// kit for episodes/2026-10-02-2-tt.json: TikTok's official sound for "Bring Me To Life" (Evanescence's own, music id
// 6919944869083351041, 60 s, 696,574 videos on 2026-10-02), which is song 53.1313-113.2051 s of
// ~/personal/saxo-video/songs/bring-me-to-life/song.mp3 (the 2023 remaster) played 0.1229% fast: another master (the
// waveform reads r 0.1), so the line came from 29 log-spectrum pieces of 3 s (0.6 ms residual; tt_rate.py there):
// song = 53.1313 + 1.001229 x tt, the main kit's 0.7826 s (b1.24) to 60.856 s (b96.24). The video goes to TikTok silent
// and the sound is added in TikTok Studio (TikTok muted the main post, 2026-10-02); this audio is the official sound
// itself (TikTok's AAC preview), only for the preview and the QA of the sync. The beats are the main's 94.8809 BPM x
// 1.001229 = 94.9975 BPM from main kit beat 4 (the first downbeat inside the sound): beat 0 at 1.7448 s, tt beat b =
// main beat b + 4 (tt/tt_grid_check.py: the same constant -28 ms onset lag as the main kit's grid on the same check).
Object.assign(CONFIG, { title: 'Saxo dance — Bring Me To Life (TikTok)', song: { title: 'Bring Me To Life', artist: 'Evanescence' }, duration: 60.0, bpm: 94.9975, beatOffset: 1.7448 });
CONFIG.audio = { ...CONFIG.audio, tracks: [{ file: 'assets/audio/kits/2026-10-02-2-tt.mp3', gain: 1, start: 0, offset: 0 }] };
