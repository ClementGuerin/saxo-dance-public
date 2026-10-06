// kit for episodes/2026-10-06-2.json ("Choosin' Texas", Ella Langley; the queue being empty: Spotify US #2 after 352
// days on the chart, global #13, 385k TikTok videos on its 60 s sound): its own cut (?kit=2026-10-06-2) 14.4489-76.5917 s
// of ~/personal/saxo-video/songs/choosin-texas/song.mp3 (the official audio, 231.0 s): the intro's last bar, verse 1,
// the stop before the chorus (bar 19: three beats of near silence under the chorus's first line) and chorus 1 to the
// crash that opens the turnaround (bar 35), stopped dead over 0.08 s, then half a second of silence (the button) to
// 62.64 s. 112.000 BPM (chorus 1 to chorus 2 is exactly 124 beats, chorus 2 to 3 exactly 104; a DP tracker's beats fit
// the grid within 7 ms median), song beat 0 at 0.5203 s, bars on song beats 2 mod 4 (the chords change there, the
// band slams back in there after the stop, and the crashes open the sections there); the kit starts on song beat 26
// (bar 6), so kit beat b = song beat 26 + b. TikTok's official sound (Ella Langley, 60 s) is song 16.463-76.463 s
// (log-spectrum match r 0.998, the same master): kit 2.014-62.014 s, so a muted fallback is this cut trimmed.
Object.assign(CONFIG, { title: "Saxo dance — Choosin' Texas", song: { title: "Choosin' Texas", artist: 'Ella Langley' }, duration: 62.64, bpm: 112, beatOffset: 0 });
CONFIG.audio = { ...CONFIG.audio, tracks: [{ file: 'assets/audio/kits/2026-10-06-2.mp3', gain: 1, start: 0, offset: 0 }] };
