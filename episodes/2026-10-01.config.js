// kit for episodes/2026-10-01.json ("SWIM", BTS; #22 on Spotify's global daily chart on 2026-09-30, 2.18M TikTok videos
// on its 60 s sound, 164M views on the official video): its own cut (?kit=2026-10-01) 95.6952-158.4000 s of
// ~/personal/saxo-video/songs/swim/full.mp3 (the official audio, YouTube Music, 159.0 s): the one-word pickup, chorus 3,
// the bridge and the final chorus to the song's own dead stop (157.75 s), then one silent beat (0.65 s). 93.99 BPM (a DP
// beat tracker at the true tempo: 125.3 was its dotted-eighth pulse; chorus 2 to chorus 3 is exactly 64 beats), song
// beat 0 at 0.6125 s pinned on the kick, downbeats on song beats 2 mod 4; the kit starts 0.03 s before song beat 149 (the
// pickup), so kit beat 0 (0.6683 s) is song beat 150, the chorus downbeat.
Object.assign(CONFIG, { title: 'Saxo dance — SWIM', song: { title: 'SWIM', artist: 'BTS' }, duration: 62.7, bpm: 93.99, beatOffset: 0.6683 });
CONFIG.audio = { ...CONFIG.audio, tracks: [{ file: 'assets/audio/kits/2026-10-01.mp3', gain: 1, start: 0, offset: 0 }] };
