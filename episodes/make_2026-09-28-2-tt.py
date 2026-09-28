# make_2026-09-28-2-tt.py: writes episodes/2026-09-28-2-tt.json, the TikTok cut of "Hootie Frutti" (KATSEYE) on TikTok's
# official sound (KATSEYE's own, music id 7686192374074329105, 60 s, 28 videos): song 51.051-111.051 s, the end of
# pre-chorus 1, chorus 1 (tt L00-L10), verse 2 and pre-chorus 2 (tt L11-L25), then the first 12 beats of chorus 2
# (tt L26-L29), where the sound stops. TikTok muted the main post (itemMute), 2026-09-28.
# Chorus 1 is the main cut's chorus 2 word for word, 28 bars earlier (tt beat b = main beat b - 72; its karaoke takes
# the main kit's timings), and verse 2 + pre-chorus 2 are the main's own (tt beat b = main beat b + 40), so those shots
# move over beat for beat on the same words. The main's payoff, the outro chant's volley (a fruit on each of its 28
# 'fruit's), is outside the sound, so the story is rotated round it:
#   tt b-1.85..b4   COLD OPEN, the end first: from above, the banana flat on his back in a heap of fruit, the whole
#                   watermelon on his belly, the crowd round the podium (the main's button, alive, the camera sinking):
#                   how did he get there? It is the frame the video ends on, so the loop is seamless
#   tt b4..b40      the party at its peak (main b76-b110): the flap on every 'hootie frutti', Compote behind the fruit
#                   bar loading up, Kob's toast, the watermelon hoisted, his bow on the podium, then the reverse over his shoulder: the hall cheering him (into the break)
#   tt b40..b116    earlier (main b0-b76): the carrot turned away at the door, the window, the pineapple disguise, the
#                   crawl in, the podium, Compote behind the bar, Kob's stare, the build
#   tt b116..end    the payoff, the chant's 35 beats compressed onto chorus 2's first 12 (main b110, b118, b134,
#                   b138.5, each keeping its own timings from its start): fruit into the lens, fruit in his face, he
#                   topples, and on L29's 'hootie' (b126.9) the watermelon lands on his belly
# Built from episodes/2026-09-28-2.json (run make_2026-09-28-2.py first). Uploaded silent: the official sound is added
# in TikTok. Every actor, pelt and map timing in these shots counts from the shot's start, so a moved shot keeps them.
import copy, json, math, os, re, sys
sys.path.insert(0, os.path.dirname(__file__))
from cam import view

P = 60 / 130.0
B0 = 0.853
END = 60.0
T = lambda b: round(B0 + b * P, 3)                 # tt beat -> tt seconds
S = lambda b: round(b * P, 3)                      # beats -> seconds into a shot
HERE = os.path.dirname(os.path.abspath(__file__))
main = json.load(open(os.path.join(HERE, '2026-09-28-2.json')))
M = {s['beat']: s for s in main['shots']}

def lyrics(name):
    js = open(os.path.join(HERE, name + '.lyrics.js')).read()
    return json.loads(re.search(r'window\.LYRICS = (.*?);\nwindow\.LINE_END', js, re.S).group(1))

HOOTIE = lyrics('2026-09-28-2-tt')[29][0][0]      # tt L29's first word, where the sound cuts in: the watermelon lands on it
assert abs(HOOTIE - 59.42) < 0.05, HOOTIE

def moved(mb, beat, what=None, **o):
    """main shot mb at tt beat `beat` (its timings count from the shot's start, so they move with it)"""
    s = copy.deepcopy(M[mb]); s['beat'] = beat
    s['lyric'] = f"(tt {T(beat)} s, main beat {mb}) " + (what or s.get('lyric', ''))
    s.update(o)
    return s

def actor(s, who):
    return next(a for a in s['actors'] if a['who'] == who)

# ---- the heap from above: the main's b138.5 (lying at 3.2, slowed to 0.05) and its button, on the podium ----
# Lying there (probed at clip 3.2-3.3): toe (0.24, -5.07), hips (0.01, -5.13), head bone (-0.31, -5.37), the chibi head
# ~0.6 m past it: his feet-to-head line runs 61.4 deg off -z towards -x. The main's lens (screen-up -z) laid his head
# sideways at the left, one eye under the hood's rim (the reviewer): a straight-down lens has its screen-up along the
# line from the camera to the look point, so the camera sits on his feet's side of that line and his face reads upright.
MIDDLE = (-0.30, -5.37)        # the middle of his body, head included
HEAD_ANG = 61.4
AT_LIE, LIE_SPEED = 3.2, 0.05
P4_DUR = round(END - T(126), 4)                    # the last shot: b126 to the sound's end (0.993 s)

def over(h, turn, r=0.3, shift=0.25):
    """a lens h m up, straight down on him, his head screen-up (turned `turn` deg); the look point `shift` m towards
    his head so the body sits under the lyric rows"""
    ux, uz = -math.sin(math.radians(HEAD_ANG)), -math.cos(math.radians(HEAD_ANG))
    look = (round(MIDDLE[0] + shift * ux, 3), 0.0, round(MIDDLE[1] + shift * uz, 3))
    a = math.radians(HEAD_ANG + turn)
    return (round(look[0] + r * math.sin(a), 3), h, round(look[2] + r * math.cos(a), 3)), look

def sink(h0, h1, turn0, turn1, roll):
    (p0, look), (p1, _) = over(h0, turn0), over(h1, turn1)
    return view(p0, look, 56, p1=p1, ease='lin', roll=list(roll))

def heap_volley(src, shot_beat, words):
    """the main's last volley (orange, apple, lemon, then the watermelon on his belly), its last three landing on `words`"""
    p = copy.deepcopy(src)
    for k in ('to', 'kinds', 'floorY', 'fly', 'big'):
        p[k] = p[k][1:]
    p['times'] = [round(S(w - shot_beat) - p['dur'], 3) for w in words]
    return p

# ================= the payoff: chorus 2's first 12 beats (tt L26-L29) =================
p1 = moved(110, 116, what="L26: on the fruit's path: Compote behind the bar hurls fruit at the podium, both paws, each "
           "flying straight into the lens (three land before the cut)")
p2 = moved(118, 119, what="L27 (J, 'hootie' b119.1): on the podium the banana takes an orange, an apple, a lemon in the "
           "face (b120, b120.75, b121.5), flinching")
# the main's 8 beats let the strawberry jump clear; in 3 she only spread her arms (a T-pose to the reviewer) with the
# fruit's flight lines crossing her face: she's off the podium already
p2['actors'] = [a for a in p2['actors'] if a['who'] != 'sadi']
p2['stars'] = ['saxo']
p3 = moved(134, 122, what="L28 (J): close on the banana: hit, hit, hit (b123, b123.75, b124.5), and on the fourth (b125.5) "
           "he topples over backwards into the heap")
p4 = moved(138.5, 126, what=f"L29 ('hootie' {HOOTIE}): from above: the banana flat on his back in the heap of fruit, an apple "
           "and a lemon land on him, and on 'hootie' the whole watermelon she hoisted lands on his belly; the sound stops "
           "on it and the video loops into the same frame")
p4.pop('stop', None)
comp4 = actor(p4, 'compote')
comp4['pelt'] = heap_volley(comp4['pelt'], 126, [126.3, 126.6, 126.9])
assert abs(T(126.9) - HOOTIE) < 0.05, (T(126.9), HOOTIE)
# The sound ends 0.07 s after b128's downbeat, and the beat punch that starts there zoomed the last frames ~5% against
# the cold open's first (the reviewer: every loop twitched): the last beat is its own shot, the same lens held `still`.
# Its actors and pelt go on where the shot before left them (their timings count from the shot's start).
TAIL_B = 128
u = S(TAIL_B - 126) / P4_DUR                       # how far the sink has gone at b128
h_mid, turn_mid, roll_mid = round(4.45 - 0.15 * u, 3), round(2 * u, 2), round(u, 2)
p4['cam'], p4['focus'] = sink(4.45, h_mid, 0, turn_mid, (0, roll_mid))

def continued(s, beat, what):
    """shot s going on from `beat` (a later cut into the same moment): clips, pelts and the pile where they were"""
    t = copy.deepcopy(s); dt = S(beat - s['beat']); t['beat'] = beat
    t['lyric'] = f"(tt {T(beat)} s) " + what
    for a in t['actors']:
        if isinstance(a.get('at'), (int, float)): a['at'] = round(a['at'] + a.get('speed', 1) * dt, 3)
        if a.get('pelt'): a['pelt']['times'] = [round(x - dt, 3) for x in a['pelt']['times']]
    return t

tail = continued(p4, TAIL_B, "the last beat, held still (no beat punch) so the loop lands on the cold open's frame")
tail['cam'], tail['focus'] = sink(h_mid, 4.3, turn_mid, 2, (roll_mid, 1))
tail['still'] = True

# ================= the cold open: the end first, alive (the main's button) =================
cold = moved(143, round(-B0 / P, 3), what="COLD OPEN (the pickup into chorus 1): from above, the banana flat on his back in a "
             "heap of fruit on the podium, the whole watermelon on his belly, the crowd round the podium: how did he get "
             "there? The frame the video ends on, the camera still sinking, so the loop is seamless")
for k in ('stop', 'still'):
    cold.pop(k, None)
cold['cam'], cold['focus'] = sink(4.3, 3.8, 2, 8, (1, 3))   # on from where the last shot's sink ended
actor(cold, 'saxo').update(at=round(AT_LIE + LIE_SPEED * P4_DUR, 3), speed=LIE_SPEED)
comp0 = actor(cold, 'compote')
comp0.update(speed=actor(p4, 'compote').get('speed', 0.4), at=round(0.5 + 0.4 * P4_DUR, 3))
comp0['pelt'] = copy.deepcopy(comp4['pelt'])
comp0['pelt']['times'] = [round(t - P4_DUR, 3) for t in comp4['pelt']['times']]   # all landed, where the last shot left them

# ================= chorus 1: the party at its peak, the main's chorus 2 on the same words (tt L00-L10) =================
chorus = [moved(b, b - 72) for b in (76, 79, 83, 87, 91, 93, 95, 99, 103, 106)]
# chorus 1's break is 2 beats longer than the chant's pickup the main cut went on to, and the fist pump lasts 1.933 s
# (the main's 4 beats from 0.4 already wrap it once): the 2 beats go to the reverse, the pump going on where it was
PUMP = 1.933
rev = moved(106, 38, what="L10's end into the break: the reverse, craning up from behind the podium over the banana's left "
            "shoulder: the whole hall's four rows cheering him, paws up, as he pumps his fist at them")
# the main's b79 lens (behind the podium, 2.7 m up) read as that shot's flap again: this one starts at his shoulder on
# his left, the line to the crowd passing just left of his head, and cranes up and back over it
rev['cam'], rev['focus'] = view((-1.1, 2.1, -7.1), (0.2, 0.5, -1.9), 64, p1=(-1.45, 3.1, -8.0), ease='lin')
rev['clear'] = copy.deepcopy(M[79]['clear'])
actor(rev, 'saxo').update(face='world', yaw=0, at=round((0.4 + S(4)) % PUMP, 3), fg=True)
actor(rev, 'sadi').update(fg=True)
chorus.append(rev)

# ================= earlier: verse 2 and pre-chorus 2, the main's own (tt L11-L25) =================
verse = [moved(b, b + 40) for b in (0, 4, 8, 16, 20, 24, 32, 36, 39, 48, 52.5, 56.5, 60.5, 64, 68.5)]
verse[0]['lyric'] = verse[0]['lyric'].replace('HOOK, L00', 'EARLIER (the flashback), L11')
# a straight cut read as "later she turns up at the door" (the reviewer): a flash, then black and white warming back to
# colour over its first second, marks the jump back
verse[0].update(flashAt=[0], mono=[0.5, 1.1])

shots = [cold] + chorus + verse + [p1, p2, p3, p4, tail]
assert [s['beat'] for s in shots] == sorted(s['beat'] for s in shots), 'shots out of order'
assert shots[1]['beat'] == 4 and verse[0]['beat'] == 40 and p1['beat'] == 116
assert T(p4['beat']) < END - 0.9 and T(tail['beat']) < END
for sh in shots:
    assert not any(k.startswith('word') for k in sh), sh['lyric']
    assert all(a.get('clip') != 'tpose' for a in sh['actors'])
clips = {a['clip'] for s in shots for a in s['actors']}
ep = {**{k: v for k, v in main.items() if k not in ('shots', 'clips', 'song', 'n', 'yt', 'new', 'notes', 'logline')},
      'n': '2-tt',
      'song': {'title': 'Hootie Frutti', 'artist': 'KATSEYE', 'window': [51.051, 111.051], 'bpm': 130, 'tiktok_sound': '7686192374074329105'},
      'logline': "It opens on the banana flat on his back under a heap of fruit, a watermelon on his belly. At the "
                 "warehouse's fruits-only dance-off he and the strawberry own the podium while a carrot loads up behind "
                 "the fruit bar. Earlier, he had turned her away at the door; she tried the window, a pineapple disguise, "
                 "then crawled in. On the chorus she empties the bar at him, and the watermelon lands where the video began.",
      'new': ['the story rotated onto the official sound: the ending first as a cold open, the party at its peak on '
              'chorus 1 (the main\'s chorus 2 on the same words), the door story as a flashback on verse 2, and the '
              'chant\'s volley compressed onto chorus 2\'s first 12 beats, landing on the cold open\'s frame (a loop)'],
      'notes': "TikTok muted the main post (itemMute, 2026-09-28). The official sound (KATSEYE's own, 28 videos; a fan "
               "upload of the whole song had 24k) is song 51.051-111.051 s: pre-chorus 1's end, chorus 1, the main cut's "
               "verse 2 and pre-chorus 2, and chorus 2's first line and a half. The main's chant, its payoff, is past the "
               "sound's end, so this kit compresses the volley onto chorus 2 and opens on its last frame (see the "
               "generator's header).",
      'clips': sorted(c for c in clips if c in set(main['clips'])), 'shots': shots}
ep['tags'] = {**main['tags'], 'experiment': main['tags']['experiment'] + ' (TikTok cut on the 60 s official sound, the story rotated: the ending as a cold open, the door story as a flashback, the volley compressed)'}
out = os.path.join(HERE, '2026-09-28-2-tt.json')
json.dump(ep, open(out, 'w'), ensure_ascii=False, indent=1)
print(out, len(shots), 'shots,', len(ep['clips']), 'clips (not in the main list:', sorted(clips - set(main['clips'])), '); hootie at',
      HOOTIE, 's, melon lands', T(126.9), '; last shot', T(p4['beat']), '-', END, 's; cold open lying at', actor(cold, 'saxo')['at'])
starts = [T(s['beat']) if i else 0 for i, s in enumerate(shots)]
print('sheet times:', ','.join(str(round((starts[i] + (starts[i + 1] if i + 1 < len(shots) else END)) / 2, 2)) for i in range(len(shots))))
