// kit for episodes/2026-10-14-tt.json: TikTok's official sound for "On The Floor" (Jennifer Lopez & Pitbull's own, music id
// 6917324503026501634, 60 s, 701,980 videos), which is song 49.0160-109.0160 s of ~/personal/saxo-video/songs/on-the-floor/
// song.m4a at the song's own speed (tt_rate.py there: 29 log-spectrum pieces of 3 s, 0.7 ms residual), i.e. the main kit's
// 4.8324 to 64.8324 s (main kit beats 9.97-139.97): the call-outs from 'party freak', verse 1, the chorus, the breakdown,
// the build, the hook on the drop and its repeat, and 2 beats of the rapper's verse. The video is the sound's first 128 beats
// (59.0775 s), so the loop keeps the beat. It goes to TikTok silent and the sound is added in TikTok Studio; this audio is
// the official sound itself (TikTok's AAC preview), only for the preview and the QA of the sync. The beats are the main's
// 129.9988 BPM from the first downbeat inside the sound (main kit beat 12, song grid beat 108) at 0.9379 s, so tt beat =
// main beat - 12.
Object.assign(CONFIG, { title: 'Saxo dance — On The Floor (TikTok)', song: { title: 'On The Floor', artist: 'Jennifer Lopez' }, duration: 59.0775, bpm: 129.9988, beatOffset: 0.9379 });
CONFIG.audio = { ...CONFIG.audio, truePeak: -2.0, tracks: [{ file: 'assets/audio/kits/2026-10-14-tt.mp3', gain: 1, start: 0, offset: 0 }] };
