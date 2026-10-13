# make_2026-10-14-tt.py: writes episodes/2026-10-14-tt.json, the TikTok cut of "On The Floor" (Jennifer Lopez ft. Pitbull)
# on TikTok's official sound (the artists' own, music id 6917324503026501634, 60 s, 701,980 videos; found with the song):
# song 49.0160-109.0160 s at the song's own speed (~/personal/saxo-video/songs/on-the-floor/tt_rate.py: 29 log-spectrum
# pieces, 0.7 ms residual), i.e. the main kit's 4.8324 to 64.8324 s (main kit beats 9.97-139.97). Made with the video
# (the user, 2026-10-12: every new video's TikTok is its official-sound cut).
# The main cut was picked to hold the sound's window, so the main's shots keep their own bars (tt beat = main beat - 12,
# the kit's beat 0 = song grid beat 108, the first downbeat inside the sound): from 1.97 beats into the main's 'party
# freak' shot (its clip set on by as much) to 0.03 beats before the main's music stops (the dog digging the cat's own
# floor), 128 beats, so the loop keeps the beat: the dog digging her floor loops into the party stomping on his first one.
# The main's opening (the cutaway hook, the swoop, k-0.5..8) lies before the sound; the cutaway comes back at its 'work'.
# Uploaded silent: the official sound is added in TikTok Studio. Built from episodes/2026-10-14.json (run
# make_2026-10-14.py first).
import copy, json, os

HERE = os.path.dirname(os.path.abspath(__file__))
ID, MAIN = '2026-10-14-tt', '2026-10-14'
PER = 60 / 129.9988
LEAD = 9.97 - 12                                   # tt beat of the sound's first sample (main kit beat 9.97)
END_B = 128 + LEAD                                 # the video: the sound's first 128 beats
main = json.load(open(os.path.join(HERE, MAIN + '.json')))
M = sorted(main['shots'], key=lambda s: s['beat'])
first = max(i for i, s in enumerate(M) if s['beat'] <= 9.97)
shots = []
for i, s in enumerate(M[first:]):
    if s['beat'] - 12 >= END_B - 0.5: break
    s = copy.deepcopy(s); s['beat'] = round(s['beat'] - 12, 3)
    if i == 0:                                     # joined mid-way: its clips set on by the part the sound leaves out
        dt = (9.97 - M[first]['beat']) * PER
        for a in s['actors']:
            if isinstance(a.get('at'), (int, float)): a['at'] = round(a['at'] + dt * a.get('speed', 1), 3)
        s['beat'] = round(LEAD, 3)
    s['lyric'] = f"(main beat {round(s['beat'] + 12, 2)}) " + s.get('lyric', '')
    shots.append(s)
beats = [s['beat'] for s in shots]
assert beats == sorted(beats) and len(set(beats)) == len(beats), 'shots out of order'
for sh in shots:
    assert not any(k.startswith('word') for k in sh) and all(a.get('clip') != 'tpose' for a in sh['actors'])
ep = {**{k: v for k, v in main.items() if k not in ('shots', 'clips', 'song', 'yt', 'new', 'notes')},
      'song': {'title': 'On The Floor', 'artist': 'Jennifer Lopez', 'window': [49.0160, 109.0160], 'rate': 1.0, 'bpm': 129.9988,
               'tiktok_sound': {'music_id': '6917324503026501634', 'title': 'On The Floor', 'author': 'Jennifer Lopez & Pitbull', 'seconds': 60, 'videos': 701980}},
      'new': ["the TikTok cut keeps the main's shots on their own bars (the official sound covers the main from its 'party freak' "
              "call-out to its end); 128 beats, so the loop keeps the beat"],
      'notes': "The official sound (the artists' own, 701,980 videos, 60 s) is song 49.0160-109.0160 s (29 log-spectrum pieces of "
               "3 s, 0.7 ms residual), the main kit's 4.8324 to 64.8324 s (tt beat = main beat - 12). See the generator's header.",
      'clips': sorted({a['clip'] for s in shots for a in s['actors']}), 'shots': shots}
ep['tags'] = {**main['tags'], 'experiment': main['tags'].get('experiment', '') + " (TikTok cut on the 60 s official sound: the main's shots on their own bars)"}
json.dump(ep, open(os.path.join(HERE, ID + '.json'), 'w'), ensure_ascii=False, indent=1)
print(ID, len(shots), 'shots; from tt beat', beats[0], 'to', beats[-1], '; ends', round(END_B, 2))
