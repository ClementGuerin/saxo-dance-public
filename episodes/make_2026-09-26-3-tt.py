# make_2026-09-26-3-tt.py: writes episodes/2026-09-26-3-tt.json, the TikTok cut of "Die Young" (Kesha) on TikTok's
# official sound (music id 7024143773030418434, 60 s, 51k videos): song 48.104-108.104 s, the intro's last refrain
# (tt L00), verse 1 (L01-L06), pre-chorus 1 (L07-L10), the first chorus, half-time (L11-L14), and the chant (L15-L16).
# TikTok muted the main post (itemMute), 2026-09-26.
# The same words come back on the same bars in the main cut (word starts within ~0.1 s, make_lyrics_tt.py): tt L00 is
# the main's last refrain L14, pre-chorus 1 is the main's pre-chorus 2 (L00-L03), the first chorus is sung like the
# main's half-time chorus (L04-L07; its music matches that one best, tt_sections.py) and the chant is the main's L12-L13.
# So the story is rotated on that grid, as in make_2026-09-26-tt.py:
#   tt b-2..b12   the payoff first: his cheeky dance with her glaring beside him, her uppercut landing on L00's 'die',
#                 him flat (main b136-b144); the sound ends 1 s after the snatch that comes just before it in the story
#   tt b12..b40   verse 1 (new shots): the epilogue, Compote takes the stage and belts into the golden carrot, Sadi
#                 dancing with her (her betrayal thread), Kob unimpressed at the bar (main b96)
#   tt b40..b72   pre-chorus 1 = the main's arrival (main b0-b24: the car, the rope, the stop paw, the diva shimmy, the
#                 party inside), then Compote in the blazing doorway points at him (main b44, without the break's hush)
#   tt b72..b104  the chorus = the chase and the fake throw (main b48-b78)
#   tt b104..end  the chant = Kob snitches, Compote comes back through the parting crowd (main b112-b124), then he hands
#                 the carrot back and she snatches it (main b128-b132), which loops into the uppercut
# The break's spotlight reveal and the stage on the full chorus (main b32-b40, b80-b92, b100-b108) don't fit the 60 s.
# Built from episodes/2026-09-26-3.json (run make_2026-09-26-3.py first). Uploaded silent: the official sound is added
# in the TikTok app. Beats: B0 = 0.856 s (song 48.960 s = the main cut's beat -200, a downbeat), 128 BPM.
import copy, json, math, os, re

P = 60 / 128.0
B0 = 0.856
END = 60.0
T = lambda b: round(B0 + b * P, 3)                 # tt beat -> tt seconds
TM = lambda b: round(b * P, 3)                     # main beat -> main seconds
HERE = os.path.dirname(os.path.abspath(__file__))
main = json.load(open(os.path.join(HERE, '2026-09-26-3.json')))
M = {s['beat']: s for s in main['shots']}
TIMES = ('hush', 'freeze', 'confetti', 'part')      # the chapel's and the village's flags in cut seconds

def lyrics(name):
    js = open(os.path.join(HERE, name + '.lyrics.js')).read()
    return json.loads(re.search(r'window\.LYRICS = (.*?);\nwindow\.LINE_END', js, re.S).group(1))

# the uppercut lands on the same word as in the main cut: main L14's word at 67.07 s is tt L00's word at the same index
LM, LT = lyrics('2026-09-26-3'), lyrics('2026-09-26-3-tt')
I_DIE = min(range(len(LM[14])), key=lambda i: abs(LM[14][i][0] - 67.07))
DIE = LT[0][I_DIE][0]
UPS = round(1.2 / (DIE - T(4)), 4)                 # the paired clips' contact (1.2 s in) on the word, as in the main

def moved(mb, beat, drop=(), **o):
    """main shot mb at tt beat `beat`: its cut-second flags move with it (main beat mb + k plays at tt beat beat + k)"""
    s = copy.deepcopy(M[mb]); sh = T(beat) - TM(mb)
    for k in TIMES:
        if isinstance(s.get(k), (int, float)) and not isinstance(s[k], bool): s[k] = round(s[k] + sh, 3)
    if s.get('armsUp'): s['armsUp'] = [round(x + sh, 3) for x in s['armsUp']]
    for k in drop: s.pop(k, None)
    s['beat'] = beat
    s['lyric'] = f"(tt {T(beat)} s, main beat {mb}) " + s.get('lyric', '')
    s.update(o)
    return s

def actor(s, who, **o):
    """patch one actor of a shot"""
    for a in s['actors']:
        if a['who'] == who: a.update(o)
    return s

# ---- the epilogue's helpers (as in make_2026-09-26-3.py) ----
LOOK = {'saxo': 'kesha', 'sadi': 'rave', 'kob': 'bartender', 'compote': 'bouncer'}
S = 0.6; OSZ = -5.35                               # the stage top, the performers' mark on it
MIC = [-0.14, 0.5, 0.86]                           # the carrot at the muzzle like a microphone (negative x crosses the body)

def A(who, clip, x=0, z=0, **o):
    return {'who': who, 'look': o.pop('look', LOOK[who]), 'clip': clip, 'x': round(x, 3), 'z': round(z, 3), **o}

def star(clip, mic=True, **o):                      # Compote on stage, the golden carrot in her left paw (up at her muzzle: a mic)
    if mic: o = {'arm': 'L', 'aim': MIC, 'upAt': 0.0, **o}
    return A('compote', clip, -0.5, OSZ, lift=S, face='world', yaw=0, holdL='gcarrot', holdScale=1.35, **o)

def sadi(clip, **o):
    return A('sadi', clip, 0.6, OSZ - 0.1, lift=S, face='world', yaw=0, **o)

def view(p0, l, fov=50, p1=None, ly1=None, ease=None):
    def polar(p): dx, dz = p[0] - l[0], p[2] - l[2]; return round(math.degrees(math.atan2(dx, dz)), 2), round(math.hypot(dx, dz), 3), round(p[1], 3)
    a0, r0, h0 = polar(p0); a1, r1, h1 = polar(p1 or p0)
    c = {'ang': [a0, a1], 'r': [r0, r1], 'h': [h0, h1], 'look': [round(l[1], 3), round(ly1 if ly1 is not None else l[1], 3)], 'fov': fov}
    if ease: c['ease'] = ease
    return c, [l[0], l[2]]

def shot(beat, actors, lyric, v, **o):
    c, focus = v
    return {'beat': beat, 'kind': 'dance', 'map': 'chapel', 'actors': actors, 'lyric': f"(tt {T(beat)} s, new) " + lyric, 'cam': c, 'focus': focus, **o}

up = lambda s: actor(s, 'compote', speed=UPS)

def held(s):
    """after the snatch Compote keeps the carrot out in front of her (the main lowered it to her far side, where it hid)"""
    for a in s['actors']:
        if a['who'] == 'compote': a.pop('upEnd', None)
    return s

shots = [
  # ================= the payoff first (main b136-b144): L00 is the main's last refrain =================
  # the hook: his cheeky dance with her glaring beside him, the carrot held out at him (a watcher shot; the reviewer
  # found the snatch shot's tail too weak an opening frame: the carrot on her far side, his face behind the wig)
  actor(moved(136, -2), 'compote', arm='L', aim=[0.35, 0.4, 0.8], upAt=0.0),
  up(moved(140, 4)),
  actor(actor(moved(142, 6), 'compote', at=round(UPS * (T(6) - T(4)), 3), speed=UPS), 'saxo', at=round(UPS * (T(6) - T(4)), 3), speed=UPS),
  moved(144, 8, drop=('still',)),                  # him flat, her holding up the carrot; the music plays on into verse 1
  # ================= verse 1: the epilogue, Compote the star (new) =================
  shot(12, [star('hip_hop_dancing_side_to_side', at=3.0), sadi('female_hip_hop_raise_the_roof_dancing', at=0.5)],
       "confetti: Compote takes the stage and belts it into the golden carrot, Sadi jumping up beside her, the whole chapel jumping",
       view((0.2, 1.5, 0.3), (0.05, 1.55, -5.2), 52, p1=(0.15, 1.5, -0.5)), confetti=T(12), pit=True, stars=['compote', 'sadi']),
  shot(16, [star('hip_hop_dancing_side_to_side', at=5.0), sadi('hip_hop_dancing_side_to_side', at=5.3)],
       "on stage, Compote and Sadi dance in step, the columns flashing behind them",
       view((-1.3, 1.45, -1.4), (0.05, 1.55, -5.3), 50, p1=(-0.8, 1.45, -1.9)), pit=True, stars=['compote', 'sadi']),
  moved(96, 20),                                   # Kob behind the bar watches the new star's show: not impressed either
  shot(24, [star('hip_hop_dancing_side_to_side', at=5.0)],   # the offset where the carrot sits at her muzzle (b16)
       "the push-in on her alone: the bouncer turned diva, singing into the golden carrot",
       view((-0.45, 1.45, -2.0), (-0.45, 1.42, -5.35), 50, p1=(-0.45, 1.45, -2.55)), pit=True, stars=['compote']),
  shot(28, [star('hip_hop_dancing_side_to_side', at=1.5), sadi('female_hip_hop_body_wave_dancing', at=2.0)],
       "from the right of the stage: the bouncer is the star now",
       view((2.0, 1.55, -1.6), (0.05, 1.5, -5.3), 50), pit=True, stars=['compote', 'sadi']),
  shot(32, [star('female_hip_hop_raise_the_roof_dancing', mic=False, at=1.0, arm='L', aim='up', upAt=0.3),
            sadi('female_hip_hop_raise_the_roof_dancing', at=1.6)],
       "the finale: she holds the golden carrot straight up like a trophy, the whole room's arms up; the camera eases back",
       view((0.05, 1.55, -1.5), (0.05, 1.6, -5.3), 52, p1=(0.05, 1.6, -0.9)), armsUp=[T(33), T(40)], pit=True, stars=['compote', 'sadi']),
]
# ================= pre-chorus 1 = the main's pre-chorus 2: the disguise and the rope, then she spots him =================
shots += [moved(b, b + 40) for b in (0, 4, 6, 8, 12, 16, 20, 24)]
shots.append(moved(44, 68, drop=('hush', 'still')))
# ================= the chorus = the main's half-time chorus: the chase and the fake throw =================
shots += [moved(b, b + 24) for b in (48, 52, 54, 56, 60, 64, 68, 72, 75, 76, 78)]
# ================= the chant and the snatch (main b112-b132, 8 beats earlier) =================
shots += [moved(b, b - 8) for b in (112, 116, 120, 124, 128)]
shots.append(held(moved(132, 124)))

assert [s['beat'] for s in shots] == sorted(s['beat'] for s in shots), 'shots out of order'
assert T(shots[-1]['beat']) < END - 0.5
for sh in shots:
    assert not any(k.startswith('word') for k in sh), sh['lyric']
    assert all(a.get('clip') != 'tpose' for a in sh['actors'])
BASE = {'tpose', 'gangnam', 'twist', 'macarena', 'silly_twist', 'chicken', 'twerk', 'ymca', 'robot', 'shopping_cart', 'running_man', 'moonwalk', 'shuffle', 'tut', 'booty_step', 'arm_wave', 'snake', 'shimmy', 'charleston', 'samba', 'belly', 'northern_soul_spin',
        'skate_push', 'skate_idle', 'uppercut_atk', 'uppercut_vic', 'slam_atk', 'slam_vic'}
clips = {a['clip'] for s in shots for a in s['actors']}
ep = {**{k: v for k, v in main.items() if k not in ('shots', 'clips', 'song', 'n', 'yt', 'new', 'notes')},
      'n': '3-tt', 'song': {'title': 'Die Young', 'artist': 'Kesha', 'window': [48.104, 108.104], 'bpm': 128.0, 'tiktok_sound': '7024143773030418434'},
      'new': ['the story rotated onto the official sound: the payoff first (a seamless loop from the snatch into the uppercut), '
              'then an epilogue on verse 1 where Compote takes the stage with the golden carrot as her mic'],
      'notes': "TikTok muted the main post (itemMute, 2026-09-26). The official sound (Ke$ha's own, 51k videos) is song "
               "48.104-108.104 s, a different part of the song from the main cut (142.71-211.30 s), so this kit rotates the "
               "story on the bars where the same words come back (see the generator's header).",
      'clips': sorted(clips - BASE), 'shots': shots}
ep['tags'] = {**main['tags'], 'experiment': main['tags']['experiment'] + ' (TikTok cut on the 60 s official sound, the story rotated: payoff first)'}
out = os.path.join(HERE, '2026-09-26-3-tt.json')
json.dump(ep, open(out, 'w'), ensure_ascii=False, indent=1)
print(out, len(shots), 'shots,', len(ep['clips']), 'clips; die at', DIE, 's (word', I_DIE, ') ups', UPS, '; last shot at', T(shots[-1]['beat']), 's')
