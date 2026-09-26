// kit for episodes/2026-09-26-tt.json: TikTok's official sound for "He's A Pirate (Save Me)" (Gabry Ponte & Steve Aoki &
// KEL, music id 7397314274513930256, 60 s, 1.8k videos), which is song 43.021-103.021 s of
// ~/personal/saxo-video/songs/hes-a-pirate/full.mp3 (spectrogram match 0.92, waveform r 0.99; tt_align*.py there). The
// video is uploaded silent and the sound added in the TikTok app (TikTok muted the main post, 2026-09-26); this audio is
// the official sound itself, only for the preview and the QA of the sync. 144 BPM, beat 0 at 0.352 s: a downbeat, on the
// main kit's grid (song 43.373 s = the main cut's beat -88).
Object.assign(CONFIG, { title: "Saxo dance — He's A Pirate (TikTok)", song: { title: "He's A Pirate (Save Me)", artist: 'Gabry Ponte, Steve Aoki, KEL' }, duration: 60.0, bpm: 144, beatOffset: 0.352 });
CONFIG.audio = { ...CONFIG.audio, tracks: [{ file: 'assets/audio/kits/2026-09-26-tt.mp3', gain: 1, start: 0, offset: 0 }] };
