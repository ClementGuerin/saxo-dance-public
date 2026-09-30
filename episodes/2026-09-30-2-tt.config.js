// kit for episodes/2026-09-30-2-tt.json: TikTok's official sound for "Self Aware" (Temper City's own, music id
// 7600130441848687390, 29.86 s, 3,196,226 videos on 2026-09-30), which is song 44.3861-74.2441 s of
// ~/personal/saxo-video/songs/self-aware/full.mp3 at the song's own speed (onset envelope xcorr, then 3 s waveform
// pieces every 2 s on one line, 0.0 ms residual; tt/xc.py there): the main cut's own b15.885-b96.5, kit time = tt +
// 5.9135 s. The video goes to TikTok silent and the sound is added in TikTok Studio (TikTok muted the main post,
// 2026-09-30); this audio is the official sound itself, only for the preview and the QA of the sync. 162 BPM, beat 0 at
// 0.0424 s: main beat 16, a downbeat (tt beat b = main beat b - 16).
Object.assign(CONFIG, { title: 'Saxo dance — Self Aware (TikTok)', song: { title: 'Self Aware', artist: 'Temper City' }, duration: 29.85, bpm: 162, beatOffset: 0.0424 });
CONFIG.audio = { ...CONFIG.audio, tracks: [{ file: 'assets/audio/kits/2026-09-30-2-tt.mp3', gain: 1, start: 0, offset: 0 }] };
