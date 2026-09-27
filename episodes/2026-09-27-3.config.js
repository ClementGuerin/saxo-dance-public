// kit for episodes/2026-09-27-3.json ("Patient Zero", Taylor Swift; a trending song: the new album's #1 on Apple Music
// and Spotify, US and global, 2026-09-26): its own cut, so it renders after src/ moves on (?kit=2026-09-27-3)
// 62.86–139.70 s of ~/personal/saxo-video/songs/patient-zero/full.mp3 (the official lyric video's audio): the pickup
// beat into chorus 1, chorus 1 and its one-bar tag, verse 2, pre-chorus 2 (its 3-beat kick break into the chorus),
// chorus 2 and its ad-lib, cut 0.06 s before the bridge's first word with a 0.15 s fade, then 0.6 s of silence: the
// button (his sneeze knocks the camera over). 92.000 BPM measured from chorus 1 against chorus 2 (20 bars apart, r 0.92)
// and the last chorus (44 bars), beat 0 on the kick at 63.512 s (0.652 s into the kit: the pickup beat before it);
// bars start on song beats 1 mod 4 (the grid B0 0.251 s + n * 0.652 s), snare on 2 and 4.
Object.assign(CONFIG, { title: 'Saxo dance — Patient Zero', song: { title: 'Patient Zero', artist: 'Taylor Swift' }, duration: 77.44, bpm: 92, beatOffset: 0.652 });
CONFIG.audio = { ...CONFIG.audio, tracks: [{ file: 'assets/audio/kits/2026-09-27-3.mp3', gain: 1, start: 0, offset: 0 }] };
