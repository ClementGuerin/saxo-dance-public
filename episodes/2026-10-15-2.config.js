// kit for episodes/2026-10-15-2.json ("Umbrella", Rihanna ft. JAY-Z, 2007; the queue being empty: a throwback climbing
// in a Rihanna wave, +14 places on Spotify's global daily chart on 2026-10-14 (#140, +91k streams a day), Rihanna's own
// 60 s TikTok sound 150,062 videos (a fan upload of the song 1.39M)): its own cut (?kit=2026-10-15-2) 165.1460-237.5616 s
// of ~/personal/saxo-video/songs/umbrella/song.mp3 (the album audio from YouTube Music, 276.0 s): song beats 239-344,
// the bridge (from its pickup), the last chorus and the outro's first line; 20 ms fade in, 250 ms fade out on the
// downbeat after the outro's first line, 0.08 s before its next ad-lib.
// 86.9978 BPM (a DP tracker's beats fit one tempo within 6.4 ms median over the song), song beat 0 at 0.3142 s,
// downbeats on beats 0 mod 4 (the choruses on song beats 80, 176 and 272, the bridge on 240, the outro on 336):
// kit beat 0 = song beat 240 at kit 0.6897 s (the bridge's downbeat; its pickup sits in kit beat -1).
// Sections (kit beats): the bridge 0-32, the last chorus 32-96, the outro 96-104.
// The official TikTok sound (music id 6921472986260178945, 60 s) is song 177.006-237.006 s at the song's own speed (15
// log-spectrum pieces of 3 s, all at the same offset, r 0.998-1.000): song beats 256.197-343.194, kit 11.860-71.860 s.
Object.assign(CONFIG, { title: 'Saxo dance — Umbrella', song: { title: 'Umbrella', artist: 'Rihanna ft. JAY-Z' }, duration: 72.4156, bpm: 86.9978, beatOffset: 0.68967 });
CONFIG.audio = { ...CONFIG.audio, truePeak: -2.0, tracks: [{ file: 'assets/audio/kits/2026-10-15-2.mp3', gain: 1, start: 0, offset: 0 }] };   // a -2.0 dBTP master: at the default -1.5 the AAC encode overshot to -1.1
