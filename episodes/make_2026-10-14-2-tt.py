# The TikTok cut of "Every Breath You Take" (2026-10-14 2nd) on The Police's own 28 s sound: writes
# episodes/2026-10-14-2-tt.json from the main episode's shots (episodes/2026-10-14-2.json, run make_2026-10-14-2.py first).
# Kit 2026-10-14-2-tt: song 172.768-200.876 s, the outro: the end of a held 'watching', an instrumental bar, then verses
# 1 and 2's lines sung again a bar apart (tt beat 0 = song beat 340 at kit 1.4442 s; the kits share one grid, so a main
# shot keeps its beat phase). The outro's keywords (tt beats): 'watching' 11.4, 'breath' 14.6, 'move' 18.9, 'bond' and
# 'break' 22.7 and 24.5, 'step ... watching' 26.3 and 27.6, 'day' 31.9, 'word' and 'say' 34.9 and 36.4, 'game' and
# 'play' 38.6 and 40.6, 'night ... stay ... watching' 42.5 and 43.5, 'move' 46.6, the sound's end 52.15.
# The cut tells the whole story at a bar a line: the hook, the dance off the bass, the stare, the two-shot, the swing on
# 'move', keep-away, the window, the beg, the heart, the flop, the fish dropped, the role swap on the second 'move', the
# cat's stare and her flop on the last bar, looping into the hook.
import copy, json, math, os
HERE = os.path.dirname(__file__)
PER = 60 / 117.3531
main = json.load(open(os.path.join(HERE, '2026-10-14-2.json')))
M = main['shots']
FISH_UP = [0.45, 0.62, 0.45]; FISH_ACROSS = [-0.25, 0.6, 0.65]
def S(b, b0): return round((b - b0) * PER, 3)
def swing_seq(b0, b1, first=FISH_UP, second=FISH_ACROSS):   # the fish swung from side to side on every beat (as in the main)
    out = [[-1, first]]; b = math.floor(b0) + 1; k = 1
    while b < b1: out.append([round(S(b, b0) - 0.04, 3), second if k % 2 else first]); b += 1; k += 1
    return out
PLAN = [   # (main shot index, tt start beat, tt end beat)
    (0, -2.82, 3.0), (2, 3.0, 9.0), (4, 9.0, 14.4), (5, 14.4, 18.2), (1, 18.2, 21.3), (8, 21.3, 25.8), (10, 25.8, 29.3),
    (11, 29.3, 33.8), (14, 33.8, 37.0), (15, 37.0, 41.0), (16, 41.0, 44.8), (17, 44.8, 48.6), (23, 48.6, 50.4), (24, 50.4, 52.15)]
shots = []
for k, (i, b0, b1) in enumerate(PLAN):
    s = copy.deepcopy(M[i]); s['beat'] = b0; s['lyric'] = f"(main S{i:02d}) " + s['lyric']
    if i == 1:   # the swing re-timed on this shot's beats
        for a in s['actors']:
            if a['who'] == 'kob' and a.get('aimSeq'): a['aimSeq'] = swing_seq(b0, b1)
    if i == 2 and s.get('bassFall'): s['bassFall'] = [round(S(b1, b0) - 0.75, 3), s['bassFall'][1]]   # it lands just before the cut
    shots.append(s)
ep = {
    'date': main['date'], 'song': main['song'],
    'logline': main['logline'] + " (the TikTok cut on the band's own 28 s sound: the outro, the verses' lines sung again a bar apart)",
    'new': "the TikTok cut on the official sound: the main's shots on the outro's matching lines, a bar a line",
    'notes': main['notes'], 'tiktok_sound': main['tiktok_sound'], 'with': main['with'],
    'clips': sorted({a['clip'] for s in shots for a in s['actors']}), 'tags': main['tags'], 'shots': shots,
}
json.dump(ep, open(os.path.join(HERE, '2026-10-14-2-tt.json'), 'w'), indent=1, ensure_ascii=False)
REV = [1.0] + [round(1.4442 + (b0 + 0.6 * (b1 - b0)) * PER, 2) for _, b0, b1 in PLAN[1:]]
open(os.path.join(HERE, '..', 'out', 'check', 'ebyt_tt_rev_times.txt'), 'w').write(','.join(f'{t:.2f}' for t in REV))
print(len(shots), 'shots; review times', ','.join(f'{t:.2f}' for t in REV))
