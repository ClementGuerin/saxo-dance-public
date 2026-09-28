// kit for episodes/2026-09-28-2-tt.json: TikTok's official sound for "Hootie Frutti" (KATSEYE's own, music id
// 7686192374074329105, 60 s, 28 videos on 2026-09-28), which is song 51.051-111.051 s of
// ~/personal/saxo-video/songs/hootie-frutti/full.mp3 (onset match 1.053 against 0.681, waveform r 0.998 at the head and
// 0.997 at the tail; tt_align.py there): the end of pre-chorus 1, chorus 1 (the same words on the same bars as the main
// cut's chorus 2, 28 bars later), verse 2 and pre-chorus 2 (the main cut's own), then the first 12 beats of chorus 2,
// where the sound stops dead. The video is uploaded silent and the sound added in TikTok (TikTok muted the main post,
// 2026-09-28); this audio is the official sound itself, only for the preview and the QA of the sync. 130 BPM, beat 0
// at 0.853 s: song beat 112 (51.904 s), a downbeat; tt beat b = main beat b + 40 (verse 2's downbeat is tt beat 40).
Object.assign(CONFIG, { title: 'Saxo dance — Hootie Frutti (TikTok)', song: { title: 'Hootie Frutti', artist: 'KATSEYE' }, duration: 60.0, bpm: 130, beatOffset: 0.853 });
CONFIG.audio = { ...CONFIG.audio, tracks: [{ file: 'assets/audio/kits/2026-09-28-2-tt.mp3', gain: 1, start: 0, offset: 0 }] };
