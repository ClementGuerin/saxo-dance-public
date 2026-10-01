// kit for episodes/2026-10-01-2-tt.json: TikTok's official sound for "Stop The Wedding!" (Ashe's own, music id
// 7670069535470848017, 60 s, 51,417 videos on 2026-10-01), which is song 34.000-94.000 s of
// ~/personal/saxo-video/songs/stop-the-wedding/full.mp3 at the song's own speed (3 s waveform pieces, r 0.99, 0.0 ms
// residual; tt/tt_check.py there): the main cut's kit -3.226 to 56.774 s (main b-7.09 to b125.7), kit time = tt - 3.226.
// The video goes to TikTok silent and the sound is added in TikTok Studio (TikTok muted the main post, 2026-10-01); this
// audio is the official sound itself, only for the preview and the QA of the sync. The beats are the main's tempo map
// (tt/tt_grid.py: the same smoothed tracker beats, from main beat -4, the downbeat before chorus 1): beat 0 at 1.4199 s,
// tt beat b = main beat b + 4.
Object.assign(CONFIG, { title: 'Saxo dance — Stop The Wedding! (TikTok)', song: { title: 'Stop The Wedding!', artist: 'Ashe' }, duration: 60.0, bpm: 132.8, beatOffset: 1.4199 });
CONFIG.audio = { ...CONFIG.audio, tracks: [{ file: 'assets/audio/kits/2026-10-01-2-tt.mp3', gain: 1, start: 0, offset: 0 }] };
