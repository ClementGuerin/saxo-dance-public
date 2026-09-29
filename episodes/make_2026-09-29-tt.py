# make_2026-09-29-tt.py: writes episodes/2026-09-29-tt.json, the TikTok cut of "Vamos a la playa" (Loona) on TikTok's
# official sound (Loona's own, music id 6880901401719883777, 60 s, 43,221 videos): song 5.988-65.988 s at the song's own
# speed, i.e. the main's kit time tt + 5.7549 s = main b13 to b143.6 (a beat is 0.45801 s; tt beat b = main beat b - 13,
# the kit's beat 0 at 0.1992 s). TikTok muted the main post (itemMute: copyrighted), 2026-09-29.
# The window is the main's own body, so every shot moves over beat for beat on the same words:
#   tt -0.26 s   the main's b12 shot (the two hopping side by side) starts 0.26 s before the sound, so the video opens
#                on the hop already going (the main's opening swoop and the drop fall before the sound)
#   tt b0..b124  the main's b13-b140 shots as they are (Sadi copying, the towels, the volleyball players, the bar, the
#                thermometer, Compote's castle and fury, the rows, the bolt into the sea, the splash, the stampede)
#   tt b127..end the main's button (b144), moved onto the payoff wide's slot (b140): the sound has no break, it ends on
#                the chant at 60 s, so the punchline (Kob belly-up on the empty beach) takes the last 1.6 s and the
#                loop lands on the hop
# Built from episodes/2026-09-29.json (run make_2026-09-29.py first). Uploaded silent: the official sound is added by
# TikTok Studio. Every actor, trail and map timing counts from the shot's start, so a moved shot keeps them.
import copy, json, os

P = 60 / 131.002
B0 = 0.1992
END = 60.0
SHIFT = 13                                         # tt beat = main beat - SHIFT
T = lambda b: round(B0 + b * P, 3)                 # tt beat -> tt seconds
HERE = os.path.dirname(os.path.abspath(__file__))
main = json.load(open(os.path.join(HERE, '2026-09-29.json')))
M = {s['beat']: s for s in main['shots']}


def moved(mb, what=None, **o):
    """main shot mb on the same words, at tt beat mb - SHIFT (its timings count from the shot's start)"""
    s = copy.deepcopy(M[mb]); s['beat'] = round(mb - SHIFT, 3)
    s['lyric'] = f"(tt {T(mb - SHIFT)} s, main beat {mb}) " + (what or s.get('lyric', ''))
    s.update(o)
    return s


body = [moved(b) for b in sorted(M) if 12 <= b < 140]
button = moved(144, what="BUTTON: from the surf, over the heads of the diva, Sadi and the whole beach cooling off: the beach is empty "
               "but for Kob, belly-up on the burning sand in the smoke; on the payoff wide's slot, the last 1.6 s of the sound")
button['beat'] = round(140 - SHIFT, 3)
shots = body + [button]
assert [s['beat'] for s in shots] == sorted(s['beat'] for s in shots), 'shots out of order'
assert T(shots[0]['beat']) < 0 and T(shots[1]['beat']) > 1.5 and T(button['beat']) < END - 1.5
for sh in shots:
    assert not any(k.startswith('word') for k in sh), sh['lyric']
clips = {a['clip'] for s in shots for a in s['actors']} | {s['crowd']['clip'] for s in shots if s.get('crowd')}
ep = {**{k: v for k, v in main.items() if k not in ('shots', 'clips', 'song', 'n', 'new', 'notes', 'logline')},
      'n': '1-tt',
      'song': {'title': 'Vamos a la playa', 'artist': 'Loona', 'window': [5.988, 65.988], 'rate': 1.0,
               'bpm': 131.002, 'tiktok_sound': '6880901401719883777'},
      'logline': main['logline'],
      'notes': "TikTok muted the main post (itemMute, 2026-09-29). The official sound (Loona's own, 43,221 videos, 60 s) is song "
               "5.988-65.988 s at the song's own speed: the main cut's b13-b143.6, so the main's shots move over beat for beat, "
               "opening on the hop already going and ending on the button (Kob belly-up) on the last 1.6 s of the sound.",
      'clips': sorted(c for c in clips if c in set(main['clips'])), 'shots': shots}
out = os.path.join(HERE, '2026-09-29-tt.json')
json.dump(ep, open(out, 'w'), ensure_ascii=False, indent=1)
print(out, len(shots), 'shots; first', T(shots[0]['beat']), 's; button', T(button['beat']), '-', END, 's')
starts = [max(T(s['beat']), 0) for s in shots]
print('sheet times:', ','.join(str(round((starts[i] + (starts[i + 1] if i + 1 < len(shots) else END)) / 2, 2)) for i in range(len(shots))))
