// kit for episodes/2026-09-26-3-tt.json: TikTok's official sound for "Die Young" (Ke$ha, music id 7024143773030418434,
// 60 s, 51k videos), which is song 48.104-108.104 s of ~/personal/saxo-video/songs/die-young/full.mp3 (onset match 0.917
// against 0.788, spectrogram 0.958 against 0.635, waveform r 0.98-0.99 at four points; tt_align*.py there): the intro's
// last refrain, verse 1, pre-chorus 1, the first chorus (half-time) and the chant. The video is uploaded silent and the
// sound added in the TikTok app (TikTok muted the main post, 2026-09-26); this audio is the official sound itself, only
// for the preview and the QA of the sync. 128 BPM, beat 0 at 0.856 s: song 48.960 s, a downbeat on the main kit's grid
// (the main cut's beat -200), measured on the kick (tt_phase.py).
Object.assign(CONFIG, { title: 'Saxo dance — Die Young (TikTok)', song: { title: 'Die Young', artist: 'Kesha' }, duration: 60.0, bpm: 128, beatOffset: 0.856 });
CONFIG.audio = { ...CONFIG.audio, tracks: [{ file: 'assets/audio/kits/2026-09-26-3-tt.mp3', gain: 1, start: 0, offset: 0 }] };
