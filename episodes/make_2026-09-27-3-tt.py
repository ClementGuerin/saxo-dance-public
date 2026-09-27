# make_2026-09-27-3-tt.py: writes episodes/2026-09-27-3-tt.json, the TikTok cut of "Patient Zero" (Taylor Swift) on
# TikTok's official sound (music id 7689287423901698054, 60 s, 23k videos): song 114.878-174.878 s, the pickup into
# chorus 2, chorus 2 (tt L00-L03) and its ad-lib, then the bridge (tt L04-L14), which the main cut never had.
# TikTok muted the main post (itemMute), 2026-09-27.
# Chorus 2 is the main cut's own chorus 2 (tt beat b = main beat b + 80; its karaoke is the same alignment, within
# 2 ms), so the ward's payoff moves over beat for beat on the same words. The bridge is half-time (a kick on each
# downbeat, claps on 2 and 4), nearly silent for b38-b40 right after the camera falls, quieter until b72, then building
# again; its words hold few actions (whitelisted keywords, tt seconds: friends 29.54 = b44.06, bright 40.04, light 42.34,
# lost 49.10, won 50.06, said 51.82, face 53.52 = b80.82, walked 59.00). So the story is rotated: the payoff first, then
# the night before as a flashback on the bridge, ending on his cured cheer in the morning, which loops into the ward:
#   tt b-1.24..b36  the ward (main b80-b114): the party in hospital beds, he walks in with his balloon, the devil, the
#                   tissue box, the flatline, the box into the lens, 'patient zero': they all point at him, the shrug
#   tt b36..b40     CHOO on the camera, which falls over (main b116) and lies there through the bridge's break
#   tt b40..b56     the night before (main b-1, b64 without him, b8, b19.5): sick in bed, sneezing; his friends dancing
#                   at the party without him on 'friends'; the devil pops up and points at it; he dies on the pillow
#   tt b56..b76     the party (main b28, b36, b32, b40, b56): patient zero walks in (b56-b59); the light-up floor on 'bright ...
#                   light'; the punch turns green; Compote's carrot; Kob's mask
#   tt b76..b86     Sadi (main b44, b60, b63, b64): the dance, the kiss in the rain, the sneeze in her face on 'face',
#                   then every guest with a red nose
#   tt b86..end     the morning (main b72, b76): asleep under the quilt, then the cured cheer, which loops into the ward
# Left out for the 60 s: the party's window from his bed (main b4: the friends' cutaway replaces it), the thermometer (b16), the walk across the street (b22), Kob's deadpan and her raised paw
# (b48, b52) before his sneeze on her mask, her own sneeze (b68).
# Built from episodes/2026-09-27-3.json (run make_2026-09-27-3.py first). Uploaded silent: the official sound is added in
# the TikTok app. Every actor and map timing in these shots counts from the shot's start, so a moved shot keeps them.
import copy, json, math, os, re

P = 60 / 92.0
B0 = 0.808
END = 60.0
T = lambda b: round(B0 + b * P, 3)                 # tt beat -> tt seconds
MAIN_FALL = 77.44 - (0.652 + 116 * P)              # the main's fall shot: its beat 116 to the cut's end (1.136 s)
HERE = os.path.dirname(os.path.abspath(__file__))
main = json.load(open(os.path.join(HERE, '2026-09-27-3.json')))
M = {s['beat']: s for s in main['shots']}

def lyrics(name):
    js = open(os.path.join(HERE, name + '.lyrics.js')).read()
    return json.loads(re.search(r'window\.LYRICS = (.*?);\nwindow\.LINE_END', js, re.S).group(1))

FACE = lyrics('2026-09-27-3-tt')[12][-1][0]        # tt L12's last word: the sneeze in her face lands on it, as in the main (L07)
assert abs(FACE - 53.52) < 0.1, FACE

def moved(mb, beat, what=None, **o):
    """main shot mb at tt beat `beat` (its timings count from the shot's start, so they move with it)"""
    s = copy.deepcopy(M[mb]); s['beat'] = beat
    s['lyric'] = f"(tt {T(beat)} s, main beat {mb}) " + (what or s.get('lyric', ''))
    s.update(o)
    return s

def actor(s, who, **o):
    """patch one actor of a shot"""
    for a in s['actors']:
        if a['who'] == who: a.update(o)
    return s

def held_fall(cam, main_dur, dur):
    """the camera's fall at the main's speed, then lying still: the keys (linear, evenly spread) padded with the last one"""
    n = len(cam['ang']); k = round(dur / (main_dur / (n - 1)))
    return {**cam, **{f: cam[f] + [cam[f][-1]] * (k + 1 - n) for f in ('ang', 'r', 'h', 'look', 'roll')}}

def walk_in(s, dur):
    """the main shot's first `dur` seconds: its walk (mz over the shot) and its push-in (r, default ease in) stop where they were"""
    main_dur = 4 * P; u = dur / main_dur; k = u * (0.35 + 0.65 * u)
    r0, r1 = s['cam']['r']; s['cam']['r'] = [r0, round(r0 + (r1 - r0) * k, 3)]
    for a in s['actors']:
        for f in ('mx', 'mz'):
            if a.get(f): a[f] = round(a[f] * u, 3)
    return s

def deeper(s, dz):
    """the shot's marks and focus moved dz along z (negative: further into the party room, away from its front wall)"""
    for a in s['actors']: a['z'] = round(a['z'] + dz, 3)
    s['focus'] = [s['focus'][0], round(s['focus'][1] + dz, 3)]
    return s

def indoors(s):
    """the main's b64 pull-back ends at r 3.2, where the lens crosses the party house's front wall (z -14.41) at the window's
    height: its last 0.6 s turned into a flat dotted pane (the reviewer, 2026-09-27); stopped 0.24 m inside"""
    s['cam'] = {**s['cam'], 'r': [s['cam']['r'][0], 2.95]}
    return s

def friends(beat):
    """new: his friends at the party without him: the main's b64 wide (a pull-back rising over the dance floor), before the
    sneeze reached anyone: no Saxo, no red noses, Sadi and Compote a little closer. The main's own shot for this, the
    party's lit window from his bed on a long lens (b4), read as one flashing box with two specks in it"""
    s = moved(64, beat, what="'friends' (29.54): meanwhile, across the street, his friends dance at the party without him: "
              "Sadi and Compote on the light-up floor, the guests in party hats round them")
    s['actors'] = [a for a in s['actors'] if a['who'] != 'saxo']
    for a in s['actors']:
        a.pop('nose', None); a.pop('sneeze', None)
        a['x'] = {'sadi': 1.5, 'compote': 0.5}[a['who']]
        a['clip'] = 'twist'   # side to side read as standing still in the review's stills, and Compote's shuffle bowed her head
    s.pop('sickGuests', None); s['stars'] = ['compote', 'sadi']
    return indoors(s)

# ================= chorus 2: the ward, the main cut's own payoff on the same words (main b80-b114) =================
ward = moved(80, round(-B0 / P, 3), what=M[80]['lyric'] + ' (the TikTok opens on it: the sound starts 1.24 beats before the chorus)')
# Kob and Compote never come into this frame (their boxes stay past the edges to the end: the main's 2.2 s reveal left
# 0.41 s, under the gate's 0.5 s); the pull-back runs 3.42 s here, so they're listed only where the camera sees them
ward['actors'] = [a for a in ward['actors'] if a['who'] == 'sadi']
shots = [ward] + [moved(b, b - 80) for b in (84, 88, 92, 96, 100, 102, 104, 108, 110, 112, 114)]
# the button: CHOO on the camera, which falls at the main's speed and lies on the floor through the bridge's break (b38-b40)
fall = moved(116, 36, what="CHOO! He sneezes on the camera, and the camera falls over onto the floor, still looking up at him; "
             "it lies there through the bridge's near-silent break (b38-b40)")
fall['cam'] = held_fall(M[116]['cam'], MAIN_FALL, T(40) - T(36))
# the sneeze blows it back as it falls (r 1.25 -> 1.75 m): lying still for 1.7 s, the main's rest frame (1.1 m, an extreme
# close-up turned 90 degrees: fur, one eye, the nose) didn't read as a camera on the floor; from 1.75 m his whole face does
fall['cam']['r'] = [1.25, 1.25, 1.4, 1.6] + [1.75] * (len(fall['cam']['r']) - 4)
shots.append(fall)

# ================= the bridge: the night before, as a flashback =================
shots += [
  moved(-1, 40, what="THE NIGHT BEFORE (the bridge's groove comes in): the swoop down onto Saxo sick in bed (red nose, "
        "thermometer, ice pack, a tissue), sneezing; the party flashing across the street through his window"),
  friends(44),
  moved(8, 48, what="POOF: the tiny devil on his shoulder, laughing, points at the party"),
  moved(19.5, 53.5, what="the drama queen: he flops back onto the pillow and dies (from above); the devil shrugs by his head"),
  # the main's first 1.96 s of it (a beat shorter: tt L08 shows through it, and his head reaches the lyric rows as he nears
  # the low lens): the walk and the push-in cut to where they were then, so neither speeds up
  walk_in(moved(28, 56, what="he goes anyway: patient zero walks in through the party's door, the street and the lamp behind him"), T(59) - T(56)),
  moved(36, 59, what="'bright' (40.04) ... 'light' (42.34): on the light-up floor under the mirror ball he dances in his "
        "pyjamas and sneezes on the dancers round him; Sadi dances behind"),
  moved(32, 64, what="at the snack table he sneezes into the pink punch: it ripples and turns green"),
  moved(40, 68, what="Compote, her carrot up in her paw: he sneezes all over it, right across her face; she glares"),
  moved(56, 72, what="Kob, who never goes out, on the couch in her face mask: he sits down right next to her and sneezes on "
        "her mask. Deadpan"),
  # two beats instead of the main's four: its push-in would run twice as fast and keep both cut by the edges, so a wider,
  # gentler one (fov 64), centred a little towards him (his twist carries him left); the pair 0.4 m further into the room,
  # because the party house's front wall is at z -14.41 (a lens at r 3.2 from their marks saw them through the window)
  deeper(moved(44, 76, what="he dances with Sadi under the mirror ball, side by side, in step",
         cam={**M[44]['cam'], 'r': [3.05, 2.8], 'fov': 64}, focus=[0.92, M[44]['focus'][1]]), -0.4),
  moved(60, 78, what="'said' (51.82): under the street lamp, in the rain, Sadi kisses him"),
  # cut at b81.5 (0.49 s): her hit reaction snaps her head back until 0.37 s into the clip, then drops it forward onto his
  # chest (the reviewer's catch at 0.69 s), so the cut comes on the snap
  moved(63, 80.75, what=f"'face' ({FACE}): ...and he sneezes right in her face; her head snaps back"),
  indoors(moved(64, 81.5, what="it spreads: back inside, every guest has a red nose now; Sadi sneezes, Compote sneezes, the party "
        "dances on")),
  moved(72, 86, what="the night passes: morning sun through the window; he sleeps like a baby under the quilt, no red nose"),
  # the clip's paws rise through arms-out at 0.9 s and stay up by his head from 1.2 s to 2.7 s (CLIP_PROBE): started at 1.0 s,
  # the whole shot is the cheer and the loop point too ('auto' started it at 0: arms out at 59.2 s, a broken rig to the reviewer)
  actor(moved(76, 88, what="he sits up in the sunshine and cheers: cured (the video loops into the ward, where he walks in)"), 'saxo', at=1.0),
]

assert [s['beat'] for s in shots] == sorted(s['beat'] for s in shots), 'shots out of order'
FRONT = -14.41                                     # the party house's front wall (inner face): a lens past it sees the room through the window
for sh in shots:
    if sh.get('zone') == 'party':
        c, (fx, fz) = sh['cam'], sh['focus']
        angs, rs = (x if isinstance(x, list) else [x] for x in (c['ang'], c['r']))
        for a, r in zip(angs * len(rs) if len(angs) == 1 else angs, rs):
            assert fz + math.cos(math.radians(a)) * r < FRONT - 0.05, ('lens at the front wall', sh['lyric'][:60], a, r)   # past the near plane
assert T(shots[-1]['beat']) < END - 1.0
assert abs(T(80.75) + 0.05 - FACE) < 0.06, (T(80.75), FACE)   # the cut 0.05 s before the word, the spray on it (as in the main)
for sh in shots:
    assert not any(k.startswith('word') for k in sh), sh['lyric']
    assert all(a.get('clip') != 'tpose' for a in sh['actors'])
crowds = [c for s in shots for c in ([s['crowd']] if isinstance(s.get('crowd'), dict) else s.get('crowd') or [])]
clips = {a['clip'] for s in shots for a in s['actors']} | {c['clip'] for c in crowds}
ep = {**{k: v for k, v in main.items() if k not in ('shots', 'clips', 'song', 'n', 'yt', 'new', 'notes')},
      'n': '3-tt', 'song': {'title': 'Patient Zero', 'artist': 'Taylor Swift', 'window': [114.878, 174.878], 'bpm': 92, 'tiktok_sound': '7689287423901698054'},
      'new': ['the story rotated onto the official sound: the ward payoff first on chorus 2 (the same words on the same bars), '
              'then the night before as a flashback on the bridge, ending on his cured cheer, which loops into the ward'],
      'notes': "TikTok muted the main post (itemMute, 2026-09-27). The official sound (Taylor Swift's own, 23k videos) is song "
               "114.878-174.878 s: the main cut's chorus 2 (62.86-139.70 s) plus the bridge, so this kit keeps the ward on "
               "chorus 2 and replays the night before, compressed, on the bridge (see the generator's header).",
      'clips': sorted(c for c in clips if c in set(main['clips'])), 'shots': shots}
ep['tags'] = {**main['tags'], 'experiment': main['tags']['experiment'] + ' (TikTok cut on the 60 s official sound, the story rotated: the payoff first, the night before on the bridge)'}
out = os.path.join(HERE, '2026-09-27-3-tt.json')
json.dump(ep, open(out, 'w'), ensure_ascii=False, indent=1)
print(out, len(shots), 'shots,', len(ep['clips']), 'clips (not in the main list:', sorted(clips - set(main['clips'])), '); face at', FACE,
      's, cut', T(80.75), '; fall keys', len(fall['cam']['ang']), '; last shot at', T(shots[-1]['beat']), 's')
