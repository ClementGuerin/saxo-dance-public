// kit for episodes/2026-10-10-2-tt.json: TikTok's official sound for "WHERE IS MY HUSBAND!" (RAYE's own, music id
// 7548420986895861761, 60 s, 318,017 videos), which is song 2.1751-62.1751 s of
// ~/personal/saxo-video/songs/where-is-my-husband/mv_audio.m4a at the song's own speed (tt_rate.py there: 29
// log-spectrum pieces of 3 s, 0.7 ms residual, rate 0.999999): the intro's last 1.77 beats, chorus 1, its a cappella
// tag, verse 1, pre-chorus 1 and chorus 2's first 14.23 beats, i.e. the main kit's music one 100-beat cycle earlier
// (tt_sections.py: log-spectrum cosine 0.92-0.997 bar by bar at lag 0). The video is the whole sound (60 s). It goes
// to TikTok silent and the sound is added in TikTok Studio (TikTok muted the main post, 2026-10-10); this audio is the
// official sound itself (TikTok's AAC preview), only for the preview and the QA of the sync. The beats are the main's
// 115.9961 BPM from song beat 6 (chorus 1's downbeat, the first downbeat inside the sound): beat 0 at 0.914 s, so
// tt beat = main beat.
Object.assign(CONFIG, { title: 'Saxo dance — WHERE IS MY HUSBAND! (TikTok)', song: { title: 'WHERE IS MY HUSBAND!', artist: 'RAYE' }, duration: 60, bpm: 115.9961, beatOffset: 0.914 });
CONFIG.audio = { ...CONFIG.audio, tracks: [{ file: 'assets/audio/kits/2026-10-10-2-tt.mp3', gain: 1, start: 0, offset: 0 }] };
