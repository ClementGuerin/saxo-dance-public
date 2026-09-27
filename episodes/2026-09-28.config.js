// kit for episodes/2026-09-28.json ("Love Me Not", Olivia Dean's cover in BBC Radio 1's Live Lounge, 2025; the user's
// queue: recreate the video itself, its scenes and choreography): its own cut, so it renders after src/ moves on
// (?kit=2026-09-28). 0.00-66.73 s of ~/personal/saxo-video/songs/love-me-not/full.mp3 (the session's own audio, from
// the video): the band's intro (a drum fill, then 4 bars of groove), verse 1 and both halves of chorus 1, ending on
// the downbeat hit of verse 2 choked in 0.1 s, then 0.57 s of silence (the button). A live band: its tempo holds
// 119.202 BPM within 32 ms over this window only (a DP beat tracker; later sections drift from 117 to 123 BPM), so
// the window is the song's first 66 s. Beat 0 on the drum fill's first hit at 0.135 s; B0 is a downbeat (the kick's
// strongest phase; the snare on 2 and 4).
Object.assign(CONFIG, { title: 'Saxo dance — Love Me Not', song: { title: 'Love Me Not', artist: 'Olivia Dean' }, duration: 67.3, bpm: 119.202, beatOffset: 0.135 });
CONFIG.audio = { ...CONFIG.audio, tracks: [{ file: 'assets/audio/kits/2026-09-28.mp3', gain: 1, start: 0, offset: 0 }] };
