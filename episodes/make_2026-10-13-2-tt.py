# make_2026-10-13-2-tt.py: writes episodes/2026-10-13-2-tt.json, the TikTok cut of "SaWaDiKa" (LISA) on TikTok's
# official sound (LISA's own, music id 7681077868771887105, 60 s, 77,614 videos; found with the song): song
# 127.0118-187.0118 s at the song's own speed (~/personal/saxo-video/songs/sawadika/tt_rate.py: 29 log-spectrum pieces
# of 3 s, 0.7 ms residual), i.e. the main kit's 27.2254 s on. Made with the video (the user, 2026-10-12: every new video's
# TikTok is its official-sound cut).
# The main cut was picked to hold the sound's window (its last 129 beats), so:
#   tt 0 - beat 3      a cold open on the gag (the critic, 2026-10-13: the gag must be in frame 1): the main's own cold open,
#                      the first dodge (the bow, her flying punch over his back), then the punch landing on the referee
#   tt beat 3 - end    the main's shots on their own bars (tt beat = main beat - 63), from the champion's warm-up through
#                      the three dodges, the double bow's bonk and the button, to the main kit's end (tt beat 129)
# Built from episodes/2026-10-13-2.json (run make_2026-10-13-2.py first). Uploaded silent: the official sound is added in
# TikTok Studio. Every actor and map timing counts from the shot's start, so a moved shot keeps them.
import copy, json, os

HERE = os.path.dirname(os.path.abspath(__file__))
ID, MAIN = '2026-10-13-2-tt', '2026-10-13-2'
PER = 60 / 140.0004
T0 = 0.0095                                        # tt time of tt beat 0 (main kit beat 63)
END = 55.2855                                      # the video: the sound's first 129 beats
SHIFT = 63
main = json.load(open(os.path.join(HERE, MAIN + '.json')))
M = {s['beat']: s for s in main['shots']}
T = lambda b: round(T0 + b * PER, 3)
assert abs((T0 + 129 * PER) - END) < 0.012, T0 + 129 * PER

def moved(mb, tb, what=None):
    s = copy.deepcopy(M[mb]); s['beat'] = round(tb, 3)
    s['lyric'] = f"(tt {max(T(tb), 0)} s, main beat {mb}) " + (what or s.get('lyric', ''))
    return s

COLD = moved(-0.5, 0, "the cold open: the main's own, the first dodge (the bow, her flying punch over his back), on its own 1.5 beats")
COLD2 = moved(97, 1.5, "and the punch lands on the referee (the main's S23, its moves in 1.5 beats), then the story")
# the critic on the main's cold open (16/25: his half bow and her body merged into a piggyback, small in the frame): here the bow is
# at full depth from frame 1, she flies 0.3 m higher so the crowd shows between them, and the lens is 1/6 closer
for a in COLD['actors']:
    if a['who'] == 'saxo': a['bow'] = [[0.0, 58]]
    if a['who'] == 'compote': a['lift'] = round(a['lift'] + 0.3, 3)
COLD['cam'] = {**COLD['cam'], 'r': [round(r * 0.833, 3) for r in COLD['cam']['r']], 'look': [round(l + 0.15, 3) for l in COLD['cam']['look']]}
MAIN_BEATS = sorted(M)
def trimmed(mb, at_b):                             # a main shot that starts before tt beat 3, joined at main beat at_b: its clips set on
    s = moved(mb, at_b - SHIFT); dt = (at_b - mb) * PER
    for a in s['actors']:
        a['at'] = round(a.get('at', 0) + dt * a.get('speed', 1), 3)
        assert not any(a.get(k) for k in ('mx', 'mz', 'my', 'moveAt', 'aimSeq', 'bow', 'toss')), 'trim a moving shot by hand'
    return s
first = max(mb for mb in MAIN_BEATS if mb <= SHIFT + 3)   # (the warm-up starts at main b64 since the catch was cut: joined at b66)
STORY = ([trimmed(first, SHIFT + 3)] if first < SHIFT + 3 else []) + [moved(mb, mb - SHIFT) for mb in MAIN_BEATS if mb >= SHIFT + 3]
assert STORY[0]['beat'] == 3, STORY[0]['beat']
shots = [COLD, COLD2] + STORY
beats = [s['beat'] for s in shots]
assert beats == sorted(beats) and len(set(beats)) == len(beats), 'shots out of order'
assert END - T(beats[-1]) > 0.8, 'the last shot is too short'
for sh in shots:
    assert not any(k2.startswith('word') for k2 in sh)
    assert all(a.get('clip') != 'tpose' for a in sh['actors'])
clips = {a['clip'] for s in shots for a in s['actors']}
ep = {**{k2: v for k2, v in main.items() if k2 not in ('shots', 'clips', 'song', 'yt', 'new', 'notes', 'logline')},
      'song': {'title': 'SaWaDiKa', 'artist': 'LISA', 'window': [127.0118, 187.0118], 'rate': 1.0, 'bpm': 140.0004,
               'tiktok_sound': {'music_id': '7681077868771887105', 'title': 'SaWaDiKa', 'author': 'LISA', 'seconds': 60, 'videos': 77614}},
      'logline': main['logline'],
      'new': ["the TikTok cut keeps the main's shots on their own bars (the official sound is the main cut's last 129 beats) "
              "and opens on the main's dance hook squeezed into 3 beats; 129 beats, so the loop keeps the beat"],
      'notes': "The official sound (LISA's own, 77,614 videos, 60 s) is song 127.0118-187.0118 s (29 log-spectrum pieces "
               "of 3 s, 0.7 ms residual), the main kit's 27.2254 s on (tt beat = main beat - 63). See the generator's header.",
      'clips': sorted(clips), 'shots': shots}
ep['tags'] = {**main['tags'], 'experiment': main['tags'].get('experiment', '') + " (TikTok cut on the 60 s official sound: the main's shots on their own bars, opened on the dance hook)"}
out = os.path.join(HERE, ID + '.json')
json.dump(ep, open(out, 'w'), ensure_ascii=False, indent=1)
starts = [T(s['beat']) if i else 0 for i, s in enumerate(shots)]
print(out, len(shots), 'shots; first shots at', starts[:3], '; last at', starts[-1], 'to', END)
