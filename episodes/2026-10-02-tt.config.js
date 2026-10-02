// kit for episodes/2026-10-02-tt.json: TikTok's official sound for "Jamaican (Bam Bam)" (HUGEL & SOLTO (FR)'s own, music id
// 7566356377771591696, 60 s, 805,351 videos on 2026-10-02), which is song 96.0931-156.0931 s of
// ~/personal/saxo-video/songs/jamaican-bam-bam/full.mp3 at the song's own speed (15 waveform pieces of 3 s, r 0.94-0.995,
// 0.0 ms residual; tt/tt_check.py there): the main cut's kit 13.3875 s to its end (main b27.22 to b148.9), kit time =
// tt + 13.3875. The video goes to TikTok silent and the sound is added in TikTok Studio (TikTok muted the main post,
// 2026-10-02); this audio is the official sound itself, only for the preview and the QA of the sync. The beats are the
// main's constant 122.000 BPM from main beat 28 (the first downbeat inside the sound): beat 0 at 0.3829 s, tt beat b =
// main beat b + 28 (tt/tt_grid_check.py: the kick within 15 ms of the grid in every 8 s).
Object.assign(CONFIG, { title: 'Saxo dance — Jamaican (Bam Bam) (TikTok)', song: { title: 'Jamaican (Bam Bam)', artist: 'HUGEL & SOLTO' }, duration: 60.0, bpm: 122, beatOffset: 0.3829 });
CONFIG.audio = { ...CONFIG.audio, tracks: [{ file: 'assets/audio/kits/2026-10-02-tt.mp3', gain: 1, start: 0, offset: 0 }] };
