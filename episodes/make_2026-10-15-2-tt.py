# The TikTok cut of "Umbrella" (2026-10-15 2nd): writes episodes/2026-10-15-2-tt.json from episodes/2026-10-15-2.json
# (run make_2026-10-15-2.py first). Kit 2026-10-15-2-tt: Rihanna's own 60 s sound is song 177.006-237.006 s, the main
# kit's 11.860-71.860 s (main kit beats 16.197-103.194): it opens on the bridge's line before the burst and runs to the
# outro's first line, the main cut minus its first 12.9 s. tt beat = main kit beat - 20 (tt beat 0 = song beat 260, the
# first downbeat inside the sound, at 2.6229 s). The main's shot that starts at kit beat 16.197 (the dog dancing under
# his parasol as the first drops fall) is the sound's first frame, the rest follow on their own bars; the last shot is
# cut at the sound's end. The loop goes from the dripping button back to the dry dancing dog: dry, then rain, again.
import json, os
HERE = os.path.dirname(__file__)
SHIFT = 20
main = json.load(open(os.path.join(HERE, '2026-10-15-2.json')))
shots = []
for s in main['shots']:
    if s['beat'] < 16.19: continue
    t = json.loads(json.dumps(s)); t['beat'] = round(s['beat'] - SHIFT, 3); shots.append(t)
ep = {k: v for k, v in main.items() if k not in ('shots', 'yt')}
ep['logline'] = main['logline'] + ' (TikTok cut on the official sound: from the first drops to the drips under the umbrella.)'
ep['clips'] = sorted({a['clip'] for s in shots for a in s['actors']})
ep['shots'] = shots
json.dump(ep, open(os.path.join(HERE, '2026-10-15-2-tt.json'), 'w'), indent=1, ensure_ascii=False)
print(len(shots), 'shots; first at tt beat', shots[0]['beat'], 'last at', shots[-1]['beat'])
