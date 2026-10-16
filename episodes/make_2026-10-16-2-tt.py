# The TikTok cut of "deja vu" (2026-10-16 2nd): writes episodes/2026-10-16-2-tt.json from episodes/2026-10-16-2.json (run
# make_2026-10-16-2.py first). Kit 2026-10-16-2-tt: Olivia Rodrigo's own 60 s sound is song 147.017-207.017 s; the video is
# its first 90 beats (59.671 s), the main kit's -0.403 to 59.268 s on the same bars (tt beat = main kit beat; kit beat 0 at
# 1.4593 s here, 1.0563 s in the main). The hook just runs 0.403 s longer at its start: nothing in it is tied to the music,
# and its frame 1 stays the main's (the reviewed hook). The cut ends 0.2 beats before main beat 88, in the duo's dance (the
# dog and the vacuum dancing together), which loops into the hook, the dog dancing for her alone.
import json, os
HERE = os.path.dirname(__file__)
END = 87.8                                 # the video's last beat (the sound's 90th from its start)
main = json.load(open(os.path.join(HERE, '2026-10-16-2.json')))
shots = [json.loads(json.dumps(s)) for s in main['shots'] if s['beat'] < END]
ep = {k: v for k, v in main.items() if k not in ('shots', 'yt')}
ep['logline'] = main['logline'] + ' (TikTok cut on the official sound: from the hook to the dog and the vacuum dancing together.)'
ep['clips'] = sorted({a['clip'] for s in shots for a in s['actors']})
ep['shots'] = shots
json.dump(ep, open(os.path.join(HERE, '2026-10-16-2-tt.json'), 'w'), indent=1, ensure_ascii=False)
print(len(shots), 'shots; first at beat', shots[0]['beat'], 'last at', shots[-1]['beat'])
