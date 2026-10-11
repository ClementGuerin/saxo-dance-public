// kit for episodes/2026-10-11-tt.json: TikTok's official sound for "Dracula (JENNIE Remix)" (Tame Impala's own,
// "Dracula (with JENNIE)", music id 7603221525400455169, 52 s, 1,337,255 videos; first in the plain and the most-used
// searches), which is song 62.7302-114.7433 s of ~/personal/saxo-video/songs/dracula/song.mp3 at the song's own speed
// (tt_rate.py there: 25 log-spectrum pieces of 3 s, 0.8 ms residual, rate 1.000006): the main kit's 16.1870 s on
// (main beat 31.028, pre-chorus 1's last beat), verse 2, pre-chorus 2, chorus 1 and its outro bar to the main kit's
// end, then 2.73 beats of the break. The video is the sound's first 97 beats (50.6039 s, ending 0.03 beats after the
// main kit's last downbeat), so the loop keeps the beat. It goes to TikTok silent and the sound is added in TikTok
// Studio (TikTok muted the main post, 2026-10-11); this audio is the official sound itself (TikTok's AAC preview),
// only for the preview and the QA of the sync. The beats are the main's 115.0108 BPM from main beat 32 (verse 2's
// downbeat, the first downbeat inside the sound): beat 0 at 0.5071 s, so tt beat = main beat - 32.
Object.assign(CONFIG, { title: 'Saxo dance — Dracula (TikTok)', song: { title: 'Dracula', artist: 'Tame Impala, JENNIE' }, duration: 50.6039, bpm: 115.0108, beatOffset: 0.5071 });
CONFIG.audio = { ...CONFIG.audio, tracks: [{ file: 'assets/audio/kits/2026-10-11-tt.mp3', gain: 1, start: 0, offset: 0 }] };
