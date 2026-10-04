// kit for episodes/2026-10-05.json ("No Scrubs", TLC, 1999; a throwback trending again, the queue being empty: +8 on
// Spotify's US daily chart on 2026-10-04, its 60 s TikTok sound has 153k videos): its own cut (?kit=2026-10-05)
// 7.8289-93.4200 s of ~/personal/saxo-video/songs/no-scrubs/song.mp3 (the official audio, 214.4 s): the intro's last
// bar, verse 1, pre-chorus 1, chorus 1, verse 2, pre-chorus 2 and chorus 2 to its last word (verse 3 starts at 93.64 s),
// faded over 0.06 s, then one silent beat (the button) to 86.21 s. 92.9114 BPM (a drum machine: a DP tracker's beats
// fit it within 4.7 ms median), song beat 0 at 0.0796 s, bars on song beats 0 mod 4 (the kick); the kit starts on song
// beat 12 (bar 3), so kit beat b = song beat 12 + b.
Object.assign(CONFIG, { title: 'Saxo dance — No Scrubs', song: { title: 'No Scrubs', artist: 'TLC' }, duration: 86.21, bpm: 92.9114, beatOffset: 0 });
CONFIG.audio = { ...CONFIG.audio, tracks: [{ file: 'assets/audio/kits/2026-10-05.mp3', gain: 1, start: 0, offset: 0 }] };
