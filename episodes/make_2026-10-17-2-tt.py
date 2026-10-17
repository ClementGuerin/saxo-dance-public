# The TikTok cut of "Shape of You" (2026-10-17 2nd): writes episodes/2026-10-17-2-tt.json from episodes/2026-10-17-2.json
# (run make_2026-10-17-2.py first). Kit 2026-10-17-2-tt: Ed Sheeran's own 60 s sound is song 43.352-103.352 s at the
# song's own speed, the main kit's 15.847-75.847 s (main kit beats 24.86-120.86), so the cut keeps the main's shots on
# their bars (tt beat = main beat - 25; tt beat 0 at 0.0877 s) from Sadi dancing at the prom (joined 1.16 beats in) to
# the button on the restroom door: 48.098 s, where the main's music stops the sound plays on into verse 2 under it.
import json, os
HERE = os.path.dirname(__file__)
PER = 0.625
SHIFT, START = 25, 24.86                           # tt beat = main beat - SHIFT; the sound's first main beat
main = json.load(open(os.path.join(HERE, '2026-10-17-2.json')))
M = [json.loads(json.dumps(s)) for s in main['shots']]
first = max(i for i, s in enumerate(M) if s['beat'] <= START)
shots = M[first:]
# the first shot is joined part-way in: its clips, its moves and its timed events move on by as much
dt = (START - shots[0]['beat']) * PER
for a in shots[0]['actors']:
    a['at'] = round(a.get('at', 0) + dt * a.get('speed', 1), 3)
    for f in ('moveAt', 'myAt', 'reveal'):
        if f in a: a[f] = round(max(0.0, a[f] - dt), 3)
for s in shots: s['beat'] = round(s['beat'] - SHIFT, 3)
ep = {k: v for k, v in main.items() if k not in ('shots', 'yt')}
ep['logline'] = main['logline'] + ' (TikTok cut on the official sound: from Sadi dancing at the prom to the restroom door.)'
ep['clips'] = sorted({a['clip'] for s in shots for a in s['actors']})
ep['shots'] = shots
json.dump(ep, open(os.path.join(HERE, '2026-10-17-2-tt.json'), 'w'), indent=1, ensure_ascii=False)
print(len(shots), 'shots; first at tt beat', shots[0]['beat'], 'last at', shots[-1]['beat'], '| joined', round(dt, 3), 's into the first')
