// kit for episodes/2026-10-15-tt.json, the TikTok cut of "The Fate of Ophelia" on Taylor Swift's own 60 s sound (music id
// 7556815852168759313, 2,427,711 videos): song 27.0411-85.1063 s of ~/personal/saxo-video/songs/the-fate-of-ophelia/song.m4a
// (the sound is song 27.0411-87.0411 s at the song's own speed: 6 waveform pieces of 8 s at one offset, r 0.994-0.999), its
// first 120 beats (58.0652 s: TikTok plays the sound for the video's length, and a whole number of beats keeps the loop on
// the beat), ending at main kit beat 155.145, inside the main cut. 123.9983 BPM, tt beat 0 = song beat 56 (the first
// downbeat inside the sound) at 0.4133 s = main kit beat 36. The upload is silent; out/2026-10-15-tt_sound.mp4 keeps the
// sound for the checks.
Object.assign(CONFIG, { title: 'Saxo dance — The Fate of Ophelia (TikTok)', song: { title: 'The Fate of Ophelia', artist: 'Taylor Swift' }, duration: 58.0652, bpm: 123.9983, beatOffset: 0.4133 });
CONFIG.audio = { ...CONFIG.audio, truePeak: -2.0, tracks: [{ file: 'assets/audio/kits/2026-10-15-tt.mp3', gain: 1, start: 0, offset: 0 }] };
