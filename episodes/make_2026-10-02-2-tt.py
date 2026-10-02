# make_2026-10-02-2-tt.py: writes episodes/2026-10-02-2-tt.json, the TikTok cut of "Bring Me To Life" (Evanescence) on
# TikTok's official sound (Evanescence's own, music id 6919944869083351041, 60 s, 696,574 videos): song
# 53.1313-113.2051 s played 0.1229% fast (another master: ~/personal/saxo-video/songs/bring-me-to-life/tt_rate.py), the
# main cut from kit 0.7826 s (b1.24, just past chorus 1's downbeat) to 60.856 s (b96.24, inside chorus 2's last line).
# TikTok muted the main post (itemMute), 2026-10-02.
# The sound sits inside the main cut, so the main's shots move over on the beat grid (tt beat = main beat - 4: the kit's
# grid starts on main b4, the first downbeat inside the sound) up to chorus 2's downbeat. What lies past the sound (the
# catch, the fall, the dawn) holds the payoff, so chorus 2 is retold a bar a shot and Kob's second deadpan goes:
#   tt 0 s-b0      the HOOK (main b0), joined 0.78 s late: the first shot always starts at 0 s, so its clip goes on by
#                  as much and its swoop runs in 1.74 s instead of 2.53
#   tt b0-b68      unchanged (main b4-b72): the window, the alarm clock, the girder, the plank, the kiss, the bucket,
#                  the uppercut and the hook, the beam, the near-silent bar
#   tt b68-b72     chorus 2: the hook rises under him (main b72, unchanged)
#   tt b72-b76     the crane swings them back over the gap (main b80: its 8 beats in 4, the swing over the shot)
#   tt b76-b80     'save': Sadi leans out of the window for them (main b88)
#   tt b80-b82     she topples off the ledge (main b92, cut after 2 beats as she lands)
#   tt b82-b88     'wake': he catches her paw in his sleep (main b96: its 8 beats in 6)
#   tt b88-end     the last 'wake': dawn, he throws the curtains open, fresh; outside Sadi asleep on her feet and
#                  Compote asleep on the hook, both soaked (main b128, the main's last shot, its 8 beats in 4.24); the
#                  last 0.15 s (past tt b92) is the same frame held still, so no beat punch twitches the loop's seam
# Built from episodes/2026-10-02-2.json (run make_2026-10-02-2.py first). Uploaded silent: the official sound is added in
# TikTok Studio. Every actor, crane and map timing in these shots counts from the shot's start, so a moved shot keeps
# them; the trolley, the walks (mx) and the pushes span the shot, so a shot cut to 4 beats does them twice as fast.
import copy, json, os

HERE = os.path.dirname(os.path.abspath(__file__))
ID, MAIN = '2026-10-02-2-tt', '2026-10-02-2'
SH = -4                                            # tt beat = main beat - 4
RATE = 1.001229                                    # the sound plays the song 0.1229% fast
PER = 60 / 94.8809 / RATE                          # a tt beat (94.9975 BPM)
OFF = 1.7448                                       # tt beat 0 (main b4) in tt seconds
KIT0 = 0.7826                                      # the sound's start in main kit seconds
END = 60.0
main = json.load(open(os.path.join(HERE, MAIN + '.json')))
M = {s['beat']: s for s in main['shots']}
T = lambda b: round(OFF + b * PER, 3)              # tt beat -> tt seconds
assert abs(T(SH) + KIT0 / RATE) < 0.002, 'the grid and the window disagree'
assert abs(T(92.235) - END) < 0.01, T(92.235)

TIMED_ACTOR = ('bumps', 'myAt', 'moveAt', 'reveal', 'holdAt', 'upAt', 'aim2At', 'holdFrom', 'holdTo', 'hatFrom', 'toss')
TIMED_SHOT = ('flash', 'white', 'ring', 'douse', 'dripAt', 'trolleyAt', 'trolleyDur')

def moved(mb, tb=None, what=None):
    """main shot mb at tt beat tb (default mb + SH); its timings count from the shot's start, so they move with it"""
    s = copy.deepcopy(M[mb]); s['beat'] = round(mb + SH if tb is None else tb, 3)
    s['lyric'] = f"(tt {max(0, T(s['beat']))} s, main beat {mb}) " + (what or s.get('lyric', ''))
    return s

def shift_clips(s, dt):
    """move every clip in shot s on by dt seconds (the clip time is at + (t - t0) x speed, wrapped)"""
    for a in s['actors']:
        assert isinstance(a.get('at'), (int, float)), a
        a['at'] = round(a['at'] + dt * a.get('speed', 1), 3)
        for k in TIMED_ACTOR:
            assert k not in a, f'{a["who"]} has a timed {k}'
    for k in TIMED_SHOT:
        assert k not in s, f'a shifted shot has a timed {k}'

def continued(s, beat, what):
    """shot s going on from tt beat `beat` (a later cut into the same moment): its clips where they were"""
    t = copy.deepcopy(s); dt = T(beat) - T(s['beat']); t['beat'] = beat
    t['lyric'] = f"(tt {T(beat)} s) " + what
    for a in t['actors']:
        if isinstance(a.get('at'), (int, float)): a['at'] = round(a['at'] + a.get('speed', 1) * dt, 3)
    return t

# the hook, joined 0.78 s late: from out over the drop, the swoop down onto him sleep-dancing on the ledge
hook = moved(0, SH, "HOOK (joined 0.78 s into the main's shot): " + M[0]['lyric'])
shift_clips(hook, KIT0)
TT = {mb: moved(mb) for mb in sorted(M) if 4 <= mb <= 72}
assert sorted(TT) == [4, 8, 16, 20, 24, 29, 36, 40, 48, 52, 56, 60, 64, 68, 72], sorted(TT)

# chorus 2 retold, a bar a shot, so the catch and the morning land inside the sound
swing = moved(80, 72, "'wake' (tt b72.49, b73.91): from above, the crane swings them back over the gap, high over the street "
                      "lamps, Saxo dancing on the hook block, Compote dangling below (the main's 8 beats in 4)")
lean = moved(88, 76, "'save' (tt b76.38), 'call', 'name': back at his window: Sadi, on the ledge again, leans out over the edge "
                     "with both paws reaching for them as the hook comes by")
topple = moved(92, 80, "'save' (tt b80.14): Sadi leans too far and topples off the ledge into the void, paws flailing")
catch = moved(96, 82, "'wake' (tt b84.11): Saxo catches her paw in his sleep: Sadi dangles from his paw over the drop while "
                      "his other paw keeps dancing (the main's 8 beats in 6; the topple before it is cut to 2 beats, as she lands)")
dawn = moved(128, 88, "the last 'wake' (tt b88.49): dawn: he throws the curtains open on a bright morning, fists pumping, "
                      "fresh: outside the window, Sadi asleep on her feet on the ledge and Compote asleep hanging from the "
                      "crane's hook, both soaked and dripping (the main's last shot)")
assert all(isinstance(x, (int, float)) for x in dawn['cam']['r']) and dawn['curtains'] == [0, 0.7, 1, 0], dawn['cam']

def actor(s, who):
    return next(a for a in s['actors'] if a['who'] == who)

# Review loops 1-2 (2026-10-02): her drop ends 1.2 s into the topple shot and she then hung still beside the block for
# the rest of the bar ("floating beside the block"); a drop moved to the bar's end left her leaning on the block for 2 s,
# which read as resting on it. So the topple keeps the main's timing (the lean, the drop at 0.75 s) and is cut after 2
# beats, as she lands (catch below)
assert actor(topple, 'sadi')['myAt'] == 0.75
# Review loops 1-2: the fist pump never rose above his chin and its head tilt read as puzzled; happy_idle rolls its head
# too, and the rave swing's paws at his cheeks (half a beat off its peak) read as shock. What read as "a cheerful good
# morning" was happy_idle's frontal moment (clip 2.125 s) with the rave swing at its peak (elbows out, paws flung up and
# out, clear of his face): held there for the whole shot (flapEvery 1000 from beat 90 keeps the swing at its peak), the
# body frozen on that moment, a small hop on every beat to keep him alive
saxo = actor(dawn, 'saxo')
assert saxo['clip'] == 'high_enthusiasm_fist_pump', saxo
saxo.update(clip='happy_idle', at=2.125, speed=0, arm='both', aim='rave', flapEvery=1000, flapPh=90, hop=[0.04, 1])
# the last 0.15 s (tt b92, chorus 2's downbeat, to the end) hold the frame still: the beat punch there twitched the
# loop's seam on an earlier cut; a linear push split at that beat keeps the lens moving through the join
TAIL_B = 92
r0, r1 = dawn['cam']['r']
rm = round(r0 + (r1 - r0) * (T(TAIL_B) - T(88)) / (END - T(88)), 3)
cam = {**dawn['cam'], 'ease': 'lin'}
dawn['cam'] = {**cam, 'r': [r0, rm]}
tail = continued(dawn, TAIL_B, "the last frames held still (no beat punch), the push going on: the loop's seam")
tail['cam'] = {**cam, 'r': [rm, r1]}
tail['still'] = True
tail['curtains'] = 0                               # open by then (0.7 s into the dawn shot)

shots = [hook] + [TT[b] for b in sorted(TT)] + [swing, lean, topple, catch, dawn, tail]
for sh in shots:
    assert not any(k.startswith('word') for k in sh), sh['lyric']
    assert all(a.get('clip') != 'tpose' for a in sh['actors'])
beats = [s['beat'] for s in shots]
assert beats == sorted(beats) and len(set(beats)) == len(beats), 'shots out of order'
assert T(beats[-1]) < END - 0.1, 'the tail starts past the end'
clips = {a['clip'] for s in shots for a in s['actors']}
ep = {**{k: v for k, v in main.items() if k not in ('shots', 'clips', 'song', 'n', 'yt', 'new', 'notes', 'logline')},
      'n': '2-tt',
      'song': {'title': 'Bring Me To Life', 'artist': 'Evanescence', 'window': [53.1313, 113.2051], 'rate': RATE, 'bpm': 94.9975,
               'tiktok_sound': {'music_id': '6919944869083351041', 'title': 'Bring Me To Life', 'author': 'Evanescence',
                                'seconds': 60, 'videos': 696574}},
      'logline': "Saxo sleep-dances out of his window at a sleepover, 40 floors up in the rain, and over a construction site "
                 "on a crane; his friends try every way to wake him and take every hit; he even catches Sadi in his sleep, "
                 "and at dawn he's fresh while they're the wrecks.",
      'new': ['the main cut moved onto the official sound beat for beat to chorus 2 (it starts just past chorus 1\'s '
              'downbeat, played 0.12% fast), then chorus 2 retold a bar a shot so the catch and the dawn reveal land '
              'inside the sound'],
      'notes': "TikTok muted the main post (itemMute, 2026-10-02). The official sound (Evanescence's own, 696,574 videos, "
               "60 s) is song 53.1313-113.2051 s, a master 0.1229% faster than our remaster (29 log-spectrum pieces of 3 "
               "s, 0.6 ms residual): the main kit's 0.7826 s (b1.24) to 60.856 s (b96.24). The main's shots up to chorus "
               "2's downbeat move over (tt beat = main beat - 4); chorus 2 is retold (see the generator's header).",
      'clips': sorted(c for c in clips if c in set(main['clips'])), 'shots': shots}
ep['tags'] = {**main['tags'], 'experiment': main['tags'].get('experiment', '') + ' (TikTok cut on the 60 s official sound: '
              'the main moved over to chorus 2, which is retold to end on the dawn reveal)'}
out = os.path.join(HERE, ID + '.json')
json.dump(ep, open(out, 'w'), ensure_ascii=False, indent=1)
print(out, len(shots), 'shots,', len(ep['clips']), 'clips (not in the main list:', sorted(clips - set(main['clips'])), ')')
print(f'hook clip at {[a["at"] for a in hook["actors"]]}; chorus 2 {T(68)} s; swing {T(72)}, lean {T(76)}, topple {T(80)}, '
      f'catch {T(82)}, dawn {T(88)}, still tail {T(TAIL_B)}-{END} (push r {r0} > {rm} > {r1})')
starts = [T(s['beat']) if i else 0 for i, s in enumerate(shots)]
print('sheet times:', ','.join(str(round((starts[i] + (starts[i + 1] if i + 1 < len(shots) else END)) / 2, 2)) for i in range(len(shots))))
