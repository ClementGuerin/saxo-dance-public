# The TikTok cut of "Ordinary" (2026-10-16): writes episodes/2026-10-16-tt.json from episodes/2026-10-16.json (run
# make_2026-10-16.py first). Kit 2026-10-16-tt: Alex Warren's own 60 s sound is song 93.0576-153.0576 s, the main kit's
# -0.004-59.996 s, so the cut is the main's first 60 s on the same bars (tt beat = main kit beat): the hook, chorus 2, the
# post-chorus, the middle eight and the bridge to the two pets rolled up in towels on the folding table, Sadi behind
# them with hearts (main kit beats -2..82). The loop goes from the folded pets back to the cat asleep on her fresh stack.
import json, os
HERE = os.path.dirname(__file__)
END = 82                                   # the sound's last beat (60.0 s)
main = json.load(open(os.path.join(HERE, '2026-10-16.json')))
shots = [json.loads(json.dumps(s)) for s in main['shots'] if s['beat'] < END]
ep = {k: v for k, v in main.items() if k not in ('shots', 'yt')}
ep['logline'] = main['logline'] + ' (TikTok cut on the official sound: from the cat on the fresh stack to the two pets folded like laundry.)'
ep['clips'] = sorted({a['clip'] for s in shots for a in s['actors']})
ep['shots'] = shots
json.dump(ep, open(os.path.join(HERE, '2026-10-16-tt.json'), 'w'), indent=1, ensure_ascii=False)
print(len(shots), 'shots; first at beat', shots[0]['beat'], 'last at', shots[-1]['beat'])
