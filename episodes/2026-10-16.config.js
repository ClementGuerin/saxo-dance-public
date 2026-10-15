// kit for episodes/2026-10-16.json ("Ordinary", Alex Warren, 2025; the queue being empty: a chart hit still climbing,
// #31 (+2) on Spotify's global daily chart and #47 (+5) in the US on 2026-10-14 (+61k streams a day), Alex Warren's own
// 60 s TikTok sound 1,983,570 videos (its wedding version 1.6M)): its own cut (?kit=2026-10-16) 93.0614-165.9209 s of
// ~/personal/saxo-video/songs/ordinary/song.mp3 (the official video's audio, 187.0 s), then 0.75 s of silence: song
// beats 130-232, the pre-chorus's pickup line, chorus 2, the post-chorus, the middle eight, the hushed bridge and the
// build to the final chorus, cut on the downbeat where its drums would come in (the drop that never comes);
// 20 ms fade in, 40 ms fade out.
// 83.9974 BPM (a DP tracker's beats fit one tempo within 3.8 ms median over the song), song beat 0 at 0.2014 s,
// downbeats on beats 0 mod 4 (chorus 1 on song beat 48, chorus 2 on 132, the bridge on 204, the final chorus on 232):
// kit beat 0 = song beat 132 at kit 1.4286 s (the pickup line sits in kit beats -2..0).
// Sections (kit beats): chorus 2 0-24, the post-chorus 24-48, the middle eight 48-72, the bridge 72-96, the build 96-100.
// The official TikTok sound (music id 7467450862064879632, 60 s) is song 93.0576-153.0576 s at the song's own speed
// (waveform r 0.988 over the whole sound): kit -0.004-59.996 s, so the TikTok cut is this kit's first 60 s.
Object.assign(CONFIG, { title: 'Saxo dance — Ordinary', song: { title: 'Ordinary', artist: 'Alex Warren' }, duration: 73.6094, bpm: 83.9974, beatOffset: 1.42862 });
CONFIG.audio = { ...CONFIG.audio, truePeak: -2.0, tracks: [{ file: 'assets/audio/kits/2026-10-16.mp3', gain: 1, start: 0, offset: 0 }] };   // a -2.0 dBTP master: at the default -1.5 the AAC encode overshot to -1.1
