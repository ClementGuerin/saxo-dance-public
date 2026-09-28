# make_2026-09-28-3-tt.py: writes episodes/2026-09-28-3-tt.json, the TikTok cut of "Billie Jean" (Michael Jackson) on
# TikTok's official sound (Michael Jackson's own, music id 6748693359088418818, 40 s, 855,903 videos: the artist's most
# used; his 60 s one had 124k): song 67.7513-108.632 s played 0.26% slower (tt_grid.py in the song's folder), the main
# cut's b75.7-b155.4: the end of the break before the pre-chorus, the pre-chorus (tt L00-L04) and chorus 1 (tt L05-L09),
# fading out from 40.24 s, where the main's music stopped dead. TikTok muted the main post (itemMute), 2026-09-28.
# The window is the main's own second half, so its shots move over beat for beat on the same words (tt beat b = main
# beat b - 76). The main's setup before b76 (the strut, the private eye tailing him, the photo he isn't in) falls
# outside the sound, and the story still reads without it: the private eye is a cat with a camera who keeps firing.
#   tt 0..b3        COLD OPEN on the evidence, the main's own (b0): the private eye's instant photo, developed, in a
#                   black and white world: big Saxo and the tiny one in the same leather jacket, the same pose. Over the
#                   break's bass line, 1.7 s (the main's was 1.0 s); the video ends on this photo, so it loops onto it
#   tt b3..b76      the main's pre-chorus and chorus 1 as they are (main b79-b148): the flash cuts in from the photo
#                   (as the main's b2), the block gathers round him, Sadi steps out of the HOTEL with the pup, and his
#                   denial is copied move for move beside him while the private eye's flash keeps going off
#   tt b76..end     the main's button (b152): the flash and the frame freezing into her photo, developing, as the
#                   sound fades out; the loop lands on the cold open's card
# Built from episodes/2026-09-28-3.json (run make_2026-09-28-3.py first). Uploaded silent: the official sound is added
# in TikTok. Every actor, trail and map timing in these shots counts from the shot's start, so a moved shot keeps them
# (the tt's beat is 0.26% longer than the main's: under 11 ms over the longest shot).
import copy, json, os

P = 60 / 116.66
B0 = 0.1728
END = 40.95
SHIFT = 76                                         # tt beat = main beat - SHIFT
T = lambda b: round(B0 + b * P, 3)                 # tt beat -> tt seconds
HERE = os.path.dirname(os.path.abspath(__file__))
main = json.load(open(os.path.join(HERE, '2026-09-28-3.json')))
M = {s['beat']: s for s in main['shots']}


def moved(mb, what=None, **o):
    """main shot mb on the same words, at tt beat mb - SHIFT (its timings count from the shot's start)"""
    s = copy.deepcopy(M[mb]); s['beat'] = round(mb - SHIFT, 3)
    s['lyric'] = f"(tt {T(mb - SHIFT)} s, main beat {mb}) " + (what or s.get('lyric', ''))
    s.update(o)
    return s


cold = moved(0, what="COLD OPEN (tt 0, the break before the pre-chorus): the evidence first: the private eye's instant "
             "photo, developed, in a black and white world: big Saxo and a tiny Saxo in the same leather jacket and bow "
             "tie, in the same pose. The frame the video ends on, so the loop lands on it")
cold['beat'] = round(-B0 / P, 3)                   # from the sound's first frame
story = [moved(b) for b in sorted(M) if 79 <= b < 152]
story[0]['flashAt'] = [0]                          # the flash cuts out of the photo into the story, as the main's b2
story[0]['lyric'] += "; the flash cuts in from the cold open's photo"
button = moved(152, what="BUTTON: the flash, and the frame freezes into the private eye's instant photo, developing: "
               "the two of them in the same pose, side by side, as the sound fades out; it loops into the cold open")

shots = [cold] + story + [button]
assert [s['beat'] for s in shots] == sorted(s['beat'] for s in shots), 'shots out of order'
assert abs(T(cold['beat'])) < 0.002 and T(story[0]['beat']) > 1.7 and T(button['beat']) < END - 1.5
assert [s['beat'] + SHIFT for s in story] == [b for b in sorted(M) if 79 <= b < 152]
for sh in shots:
    assert not any(k.startswith('word') for k in sh), sh['lyric']
    assert all(a.get('clip') != 'tpose' for a in sh['actors'])
clips = {a['clip'] for s in shots for a in s['actors']} | {s['crowd']['clip'] for s in shots if s.get('crowd')}
ep = {**{k: v for k, v in main.items() if k not in ('shots', 'clips', 'song', 'n', 'yt', 'new', 'notes', 'logline')},
      'n': '3-tt',
      'song': {'title': 'Billie Jean', 'artist': 'Michael Jackson', 'window': [67.7513, 108.632], 'rate': 0.997426,
               'bpm': 116.66, 'tiktok_sound': '6748693359088418818'},
      'logline': "It opens on the evidence: a private eye's instant photo of Saxo in his 1983 leather jacket beside a tiny "
                 "Saxo in the very same one. On the night street the block gathers round him, and Sadi steps out of the "
                 "HOTEL in red with the pup at her side. Through the chorus he denies it with every move, and the pup "
                 "copies every move beside him, until the private eye's flash freezes them into that photo.",
      'new': ['the TikTok cut on the artist\'s most used official sound (40 s, 856k videos), the main\'s second half beat '
              'for beat with its cold open, and the first official sound that plays at another speed than the song '
              '(0.26% slower: its own beat grid)'],
      'notes': "TikTok muted the main post (itemMute, 2026-09-28). The official sound (Michael Jackson's own, 855,903 "
               "videos) is song 67.7513-108.632 s, 0.26% slower than the official audio: the main cut's own pre-chorus "
               "and chorus 1, fading out where the main's music stopped. The main's shots move over beat for beat; the "
               "setup before them is outside the sound (see the generator's header).",
      'clips': sorted(c for c in clips if c in set(main['clips'])), 'shots': shots}
ep['tags'] = {**main['tags'], 'experiment': main['tags']['experiment'] + ' (TikTok cut on the 40 s official sound: the main\'s second half beat for beat, opening on the cold open\'s photo)'}
out = os.path.join(HERE, '2026-09-28-3-tt.json')
json.dump(ep, open(out, 'w'), ensure_ascii=False, indent=1)
print(out, len(shots), 'shots,', len(ep['clips']), 'library clips (built-in dances:', sorted(clips - set(main['clips'])), '); cold open 0 -', T(story[0]['beat']), 's; button', T(button['beat']), '-', END, 's')
starts = [T(s['beat']) if i else 0 for i, s in enumerate(shots)]
print('sheet times:', ','.join(str(round((starts[i] + (starts[i + 1] if i + 1 < len(shots) else END)) / 2, 2)) for i in range(len(shots))))
