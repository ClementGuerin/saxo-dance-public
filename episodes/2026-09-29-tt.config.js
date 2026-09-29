// kit for episodes/2026-09-29-tt.json: TikTok's official sound for "Vamos a la playa" (Loona's own, music id
// 6880901401719883777, 60 s, 43,221 videos on 2026-09-29), which is song 5.988-65.988 s of
// ~/personal/saxo-video/songs/vamos-a-la-playa/full.mp3 at the song's own speed (onset envelope xcorr, then waveform
// lags per 15 s piece within 4 ms; tt/xc.py there): the main cut's own b13-b143.6, kit time = tt + 5.7549 s. The video
// is uploaded silent and the sound added in TikTok (TikTok muted the main post, 2026-09-29); this audio is the
// official sound itself, only for the preview and the QA of the sync. 131.002 BPM, beat 0 at 0.1992 s: main beat 13,
// a downbeat (tt beat b = main beat b - 13).
Object.assign(CONFIG, { title: 'Saxo dance — Vamos a la playa (TikTok)', song: { title: 'Vamos a la playa', artist: 'Loona' }, duration: 60, bpm: 131.002, beatOffset: 0.1992 });
CONFIG.audio = { ...CONFIG.audio, tracks: [{ file: 'assets/audio/kits/2026-09-29-tt.mp3', gain: 1, start: 0, offset: 0 }] };
