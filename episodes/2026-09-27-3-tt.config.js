// kit for episodes/2026-09-27-3-tt.json: TikTok's official sound for "Patient Zero" (Taylor Swift, music id
// 7689287423901698054, 60 s, 23k videos), which is song 114.878-174.878 s of ~/personal/saxo-video/songs/patient-zero/full.mp3
// (onset match 1.018 against 0.705, waveform r 0.986 at the head and 0.988 at the tail; tt_align.py there): the pickup
// beat into chorus 2, chorus 2 and its ad-lib, then the bridge, which the main cut never had. The video is uploaded
// silent and the sound added in the TikTok app (TikTok muted the main post, 2026-09-27); this audio is the official
// sound itself, only for the preview and the QA of the sync. 92 BPM, beat 0 at 0.808 s: song 115.686 s, chorus 2's
// downbeat (the main kit's beat 80: tt beat b = main beat b + 80).
Object.assign(CONFIG, { title: 'Saxo dance — Patient Zero (TikTok)', song: { title: 'Patient Zero', artist: 'Taylor Swift' }, duration: 60.0, bpm: 92, beatOffset: 0.808 });
CONFIG.audio = { ...CONFIG.audio, tracks: [{ file: 'assets/audio/kits/2026-09-27-3-tt.mp3', gain: 1, start: 0, offset: 0 }] };
