// kit for episodes/2026-10-02.json ("Jamaican (Bam Bam)", HUGEL & SOLTO (FR); #43 on Spotify's global daily chart on
// 2026-09-30 and the day's second-biggest climber (+221k streams), 804k TikTok videos on its 60 s sound): its own cut
// (?kit=2026-10-02) 82.7056-155.9500 s of ~/personal/saxo-video/songs/jamaican-bam-bam/full.mp3 (the official audio,
// MoBlack Records' original mix, 156.5 s): the last two bars of drop 1, the 12-bar break with the verse, the 4-bar sweep,
// the song's own silent bar, the 6-bar build and drop 2 to the song's end. 122.000 BPM (one constant tempo: the kick's
// click measured on every beat of the intro and both drops, within 6 ms), song beat 0 at 0.0826 s, bars on song beats
// 0 mod 4; the kit starts on song beat 168 (a downbeat), so kit beat b = song beat 168 + b. TikTok's official sound is
// song 96.093-156.093 s, the kit's 13.39 s to its end.
Object.assign(CONFIG, { title: 'Saxo dance — Jamaican (Bam Bam)', song: { title: 'Jamaican (Bam Bam)', artist: 'HUGEL & SOLTO' }, duration: 73.24, bpm: 122, beatOffset: 0 });
CONFIG.audio = { ...CONFIG.audio, tracks: [{ file: 'assets/audio/kits/2026-10-02.mp3', gain: 1, start: 0, offset: 0 }] };
