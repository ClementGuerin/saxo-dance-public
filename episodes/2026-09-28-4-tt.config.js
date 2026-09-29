// kit for episodes/2026-09-28-4-tt.json: TikTok's official sound for "Dai Dai" (Shakira & Burna Boy's own, music id
// 7637147165290924831, 60 s, 2,693,893 videos on 2026-09-29), which is the song's last section: song = 177.7216 +
// 1.000977 x tt s of ~/personal/saxo-video/songs/dai-dai/official_audio.m4a (log-spectrum pieces, then waveform lags per
// 3 s piece within 0.8 ms; tt/lags.py there), the intro's hook reprised, then the title hook four times, the music
// stopping on tt beat 80 (41.80 s; the sound's last 18 s are near silence). The video ends at 42.30 s and is uploaded
// silent, the sound added in TikTok (TikTok muted the main post, 2026-09-29); this audio is the official sound itself,
// only for the preview and the QA of the sync. 116.113 BPM (the main's 116.00 x 1.000977), beat 0 at 0.4585 s: song
// beat 344, the tt beat n = main beat n + 48 in the main's story (tt beat 64 is the main's b0 bar for bar).
Object.assign(CONFIG, { title: 'Saxo dance — Dai Dai (TikTok)', song: { title: 'Dai Dai', artist: 'Shakira & Burna Boy' }, duration: 42.3, bpm: 116.1133, beatOffset: 0.4585 });
CONFIG.audio = { ...CONFIG.audio, tracks: [{ file: 'assets/audio/kits/2026-09-28-4-tt.mp3', gain: 1, start: 0, offset: 0 }] };
