// kit for the _ratoshi test (episodes/make_ratoshi_test.py): a copy of the 2026-09-25-2-tt kit under its own name, so its frames go to out/frames/_ratoshi.
// kit for episodes/2026-09-25-2-tt.json: TikTok's official 32 s sound for "Dans le club" (song 120.00-152.37 s). The video
// is uploaded silent and the sound added in the app; this audio is only for the preview and the QA of the sync.
Object.assign(CONFIG, { title: 'Saxo dance — Dans le club (TikTok)', song: { title: 'Dans le club', artist: 'Michou' }, duration: 32.35, bpm: 115, beatOffset: -0.7435 });
CONFIG.audio = { ...CONFIG.audio, tracks: [{ file: 'assets/audio/kits/2026-09-25-2-tt.mp3', gain: 1, start: 0, offset: 0 }] };
