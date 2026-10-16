# The TikTok cut of "As It Was" (2026-10-17): writes episodes/2026-10-17-tt.json from episodes/2026-10-17.json (run
# make_2026-10-17.py first). Kit 2026-10-17-tt: Harry Styles' own 60 s sound is song 53.383-113.383 s, the main kit's
# 17.374-77.374 s (main kit beats 25.19-112.19), so the cut keeps the main's shots on their bars (tt beat = main beat - 28)
# from the duet on the disc (joined 1.19 beats in) to the cat caught on the feed; the sound ends 2 beats before the main's
# post-chorus, so the run home, the panic, the dive into bed, the door and Sadi over the dog in her jumpsuit are squeezed
# into its last 6.2 beats (each keeping its own timings), the loop going from the flat "as it was" back to the party.
import json, os
HERE = os.path.dirname(__file__)
PER = 60 / 86.9976
SHIFT, START, END = 28, 25.19, 112.19            # tt beat = main beat - SHIFT; the sound's first and last main beats
main = json.load(open(os.path.join(HERE, '2026-10-17.json')))
M = [json.loads(json.dumps(s)) for s in main['shots']]
shots = [s for s in M if START - 4 <= s['beat'] < 106]   # S07 (main 24) .. S27 (main 102-106)
# the first shot is joined 1.19 beats in: its clips move on by as much
dt = (START - shots[0]['beat']) * PER
for a in shots[0]['actors']:
    a['at'] = round(a.get('at', 0) + dt * a.get('speed', 1), 3)
for s in shots: s['beat'] = round(s['beat'] - SHIFT, 3)
# the squeezed ending: (the main shot's start beat, main beat start, main beat end, overrides); shots are found by
# their start beat, since the fallback's drops moved the indices
def squeeze(at, b0, b1, **o):
    i = next(j for j, s in enumerate(M) if abs(s['beat'] - at) < 1e-6)
    s = json.loads(json.dumps(M[i])); old = (M[i + 1]['beat'] if i + 1 < len(M) else 129.1) - M[i]['beat']; k = (b1 - b0) / old
    for a in s['actors']:
        for f in ('mx', 'mz'):
            if f in a: a[f] = round(a[f] * k, 3)
    s.update(o); s['beat'] = round(b0 - SHIFT, 3); return s
shots += [squeeze(106, 106.0, 107.4),                                  # Sadi runs off from her stall
          squeeze(110, 107.4, 108.8),                                  # the panic: the closet, the broom
          squeeze(114.2, 108.8, 110.2),                                # the key, the dive into bed, the flat spotless
          squeeze(117.6, 110.2, 111.1, door=[0, 0.4, 0, 1]),          # the door opens on Sadi
          squeeze(121.4, 111.1, END)]                                  # Sadi over the dog asleep in her jumpsuit, as it was
ep = {k: v for k, v in main.items() if k not in ('shots', 'yt')}
ep['logline'] = main['logline'] + ' (TikTok cut on the official sound: from the duet on the disc, through the pet cam checks, to the cover-up squeezed into its last bars.)'
ep['clips'] = sorted({a['clip'] for s in shots for a in s['actors']})
ep['shots'] = shots
json.dump(ep, open(os.path.join(HERE, '2026-10-17-tt.json'), 'w'), indent=1, ensure_ascii=False)
print(len(shots), 'shots; first at tt beat', shots[0]['beat'], 'last at', shots[-1]['beat'], '| joined', round(dt, 3), 's into the first')
