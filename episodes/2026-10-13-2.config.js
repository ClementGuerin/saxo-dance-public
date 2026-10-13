// kit for episodes/2026-10-13-2.json ("SaWaDiKa", LISA, 2026; the queue being empty: a K-pop solo hit, #169 (+5) on
// Spotify's global chart on 2026-10-11, its official video 205.9M views in about five weeks; LISA's own 60 s TikTok
// sound 77,614 videos): its own cut (?kit=2026-10-13-2) 99.7864-182.3068 s of ~/personal/saxo-video/songs/sawadika/song.mp3
// (the official audio, LLOUD's upload, 188.53 s): from verse 2's first word (a pickup 21 ms before song grid beat 232.5)
// through verse 2, pre-chorus 2, the last chorus and the outro's four hooks, to the music's dead stop (grid beat 421,
// 180.59 s) and its tail (to grid beat 425, -30 dB); 30 ms fade in, 0.35 s fade out (make_kit.py in the song's folder).
// 140.0004 BPM (a DP tracker's beats fit one tempo within ~5 ms over the song; chorus 1 to chorus 2 is exactly 168 beats
// and to chorus 3 exactly 328; in the outro the tracker locks onto the off-beat claps, the kick stays on the grid), song
// grid beat 0 at 0.1646 s, downbeats on grid beats 1 mod 4 (every 'hello' of the hook falls half a beat before one):
// kit beat 0 = grid 233 (verse 2's downbeat) at kit 0.2350 s, bars on kit beats 0 mod 4; pre-chorus 2 kit beat 64 (its
// first line a 2-beat pickup from kit beat 62), the last chorus kit beat 96, the outro's hooks kit beats 160, 168, 176
// and 184, the stop kit beat 188 (80.806 s).
// The official TikTok sound (music id 7681077868771887105, 60 s) is song 127.0118-187.0118 s at the song's own speed (29
// log-spectrum pieces, 0.7 ms residual): kit 27.2254 s on, 9.5 ms before kit beat 63; the cut 2026-10-13-2-tt is this
// kit's last 129 beats on the same bars.
Object.assign(CONFIG, { title: 'Saxo dance — SaWaDiKa', song: { title: 'SaWaDiKa', artist: 'LISA' }, duration: 82.5204, bpm: 140.0004, beatOffset: 0.2350 });
CONFIG.audio = { ...CONFIG.audio, truePeak: -2.0, tracks: [{ file: 'assets/audio/kits/2026-10-13-2.mp3', gain: 1, start: 0, offset: 0 }] };   // a -2.0 dBTP master: at the default -1.5 the AAC encode overshot to -1.1
