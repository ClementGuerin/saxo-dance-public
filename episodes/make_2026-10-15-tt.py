# The TikTok cut of "The Fate of Ophelia" (2026-10-15): writes episodes/2026-10-15-tt.json from episodes/2026-10-15.json
# (run make_2026-10-15.py first). Kit 2026-10-15-tt: Taylor Swift's own 60 s sound is song 27.0411-87.0411 s, the main
# kit's 17.0062 s on (main kit beat 35.145); the video is the sound's first 120 beats (58.0652 s, to main kit beat 155.145,
# inside the main cut). tt beat = main kit beat - 36 (tt beat 0 = song beat 56, the first downbeat inside the sound, at
# 0.4133 s). The sound opens on the main's hook as a 0.9 s cold open (Ophelia floating in the foreground, the lifeguard
# dog behind her with his ring up: the premise in frame 1, in place of the main's 'watch' close-up, which showed only his
# face), then the main's shots from the panic on their own bars, to the cat floating in the dog's ring and the proud dog on
# the last line. The first shot always starts at 0 s, so the hook's swoop plays its first 0.9 s. The loop goes from the
# proud dog back to the dog ready with his ring.
import json, os
HERE = os.path.dirname(__file__)
SHIFT = 36
main = json.load(open(os.path.join(HERE, '2026-10-15.json')))
shots = []
hook = json.loads(json.dumps(main['shots'][0])); hook['beat'] = 34 - SHIFT; shots.append(hook)
for s in main['shots']:
    if s['beat'] < 37: continue
    t = json.loads(json.dumps(s)); t['beat'] = round(s['beat'] - SHIFT, 3); shots.append(t)
ep = {k: v for k, v in main.items() if k not in ('shots', 'yt')}
ep['logline'] = main['logline'] + ' (TikTok cut on the official sound: from the dog watching her float to the cat in his ring.)'
ep['clips'] = sorted({a['clip'] for s in shots for a in s['actors']})
ep['shots'] = shots
json.dump(ep, open(os.path.join(HERE, '2026-10-15-tt.json'), 'w'), indent=1, ensure_ascii=False)
print(len(shots), 'shots; first at tt beat', shots[0]['beat'], 'last at', shots[-1]['beat'])
