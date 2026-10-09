# make_2026-10-10.py: writes episodes/2026-10-10.json, "BIRDS OF A FEATHER" (Billie Eilish, 2024; the queue being
# empty: a chart hit climbing again, +200k streams a day and +4 places on Spotify's global chart on 2026-10-09, its
# TikTok sound 1.78M videos).
# The world (the official video, looked at as contact sheets every 3 s; nothing violent in it): an empty 1970s office,
# a room of dark wood panelling over a green carpet under a ceiling of fluorescent panels, one lone chair in its middle,
# a brown leather sofa, white rooms; the singer in a black beanie, round glasses, an oversized white sweatshirt and
# green camo cargos is tipped back on her chair, dragged across the floor, pushed up the walls and laid flat by an
# invisible force.
# The words (whitelisted single words per line, never the lines; keywords.py, kw_times.mjs): always, blue, please,
# nothing, lose, baby, birds, feather, stick, together, alone, better, change, weather, forever, crying, love, day, die,
# light, leaves, eyes.
# Ours, "the groomer turnaround" (TURNAROUND, new: the dog fights going in with everything a pet has, and the payoff is
# the same fight to stay): the clip's invisible force is a pink leash. Saxo, in the singer's look, is dragged into a
# 70s grooming salon (the clip's wood-panelled room, its lone chair, its sofa) by Sadi: he leans out at an impossible
# angle, goes boneless and is dragged across the carpet on his back, begs the groomer (Kob, deadpan, snipping her
# scissors), clings to the lone chair while Compote the bather drags it to the door; splash, he's in the tub: he dances
# in the foam, shakes himself dry all over the cat, dances in the rain head, and Kob's dryer blasts him back like the
# clip's force until he vanishes in a cloud of fluff. The cloud blows away: a show poodle with a pink bow. Sadi melts,
# he falls in love with himself in the mirror, the groomer's flash: the photo. Then they try to take him home: he hugs
# the mirror, and on every 'die' he plays dead so they can't move him: in front of the mirror, at the door, and at the
# front door, the grandest; Sadi gives up and lies down beside him (birds of a feather); the button: Kob's flash.
# Beats: 105.000 BPM, kit beat b at b * 0.571429 s (kit beat 0 = song beat 44, bar 11's downbeat).
# Sections (kit beats): pre-chorus b0-27.6 (K00 b1.81, K01 b8.56, K02 b18.0); chorus b27.6-60 (K03 b27.6 .. K06 b51);
# post-chorus b60-87.5 (K07 b60, K08 b69.6, K09 b76.9); hook b87.6-121 (K10 b87.6 .. K13 b113.3, held to b120.9); the
# silent button b121-122.
# Key words (kit beats): always b3.24 | blue b11.85, please b13.95 | nothing b18.0, lose b20.4, baby b23.9 | birds b27.6,
# feather b30.4, stick b33.0, together b33.5, know b35.9 | said b37.2, never b38.35, better b42.1, alone b43.1 | change
# b45.35, weather b46.4, forever b49.65 | forever b53.4, better b58.0 | know b63.2, crying b66.4 | think b71.2, love
# b74.1 | baby b82.2 | love b87.9, day b90.2, die b92.04 | day b98.2, die b100.16 | light b106.25, leaves b106.6, eyes
# b109.3 | day b114.2, die b117.2 (held to b120.9).
# The lyrics stay in episodes/2026-10-10.lyrics.js (the generator reads only their times).
import json, math, os, re, sys
sys.path.insert(0, os.path.dirname(__file__))
from cam import view, vpath, swoop

HERE = os.path.dirname(__file__)
PER = 60 / 105.0
def T(b): return b * PER
def Bt(t): return t / PER
def S(b, b0): return round((b - b0) * PER, 3)    # seconds from shot beat b0 to beat b

LOOK = {'saxo': 'beanie', 'sadi': 'tracksuit', 'kob': 'groomer', 'compote': 'bather'}
HEAD = {'saxo': 1.45, 'sadi': 1.4, 'kob': 1.5, 'compote': 1.46}      # the top of each head standing (the beanie, the sunglasses on her head, the cap, the ears)
FACE = {'saxo': 0.9, 'sadi': 0.84, 'kob': 0.86, 'compote': 0.86}
RAD = {'saxo': 0.5, 'sadi': 0.43, 'kob': 0.42, 'compote': 0.4}
POODLE_HEAD = 1.55                                                    # the poodle cut's topknot and bow

# ---- the map (src/maps39.js, SALON) ----
DOOR = (0.95, 2.25, 2.3)                       # the GROOMING door's opening in the wall z = 0 (x0, x1, height)
FRONT = (2.6, 3.9, 9.0)                        # the front door's opening in the wall z = 9
CHAIR, CHAIR_Y = (-1.6, 4.4), 0.42
TUB, TUB_Y, WATER, RIM = (-2.2, -4.4), 0.55, 0.8, 1.02
TUB_BOX = (-3.0, -1.4, -4.9, -3.9)             # its footprint (x0, x1, z0, z1)
DRYER = (0.7, -4.45)                           # its head reaches 0.95 m towards the tub (-x)
MIRROR_Z, MIRROR_X = -7.9, 2.4
MIR_SPOT = (2.4, -6.7)                          # where he stands before the mirror (facing -z); the reflection at 2 MIRROR_Z - z
FAME_SAXO = (5.95, 1.55, 6.0)
SADI_GROOM = (0.55, -1.7)                       # Sadi waits in the grooming room by the door

def A(who, clip, x, z, **o):
    return {'who': who, 'look': o.pop('look', LOOK[who]), 'clip': clip, 'x': round(x, 3), 'z': round(z, 3), 'face': o.pop('face', 'world'),
            'yaw': o.pop('yaw', 0), 'at': o.pop('at', 'auto'), **o}
def yaw_to(frm, to): return round(math.degrees(math.atan2(to[0] - frm[0], to[1] - frm[1])), 1)
PANIC = dict(arm='both', aim='caramell', flapEvery=0.5, upAt=-1)                     # paws flapping by the ears: distress
RAVE = dict(arm='both', aim='rave', upAt=-1, flapEvery=1000, flapPh=90)              # the rave swing pinned at its peak (the poodle keeps its arms up: hanging down, its shoulder fluff tore into spikes)

# ---- a projection check (numbers only): where each face lands in the 9:16 frame at the shot's start and end ----
def _proj(cam, look, fov, pt):
    f = [look[i] - cam[i] for i in range(3)]; n = math.sqrt(sum(v * v for v in f)); f = [v / n for v in f]
    r = [-f[2], 0.0, f[0]]; rn = math.sqrt(r[0] ** 2 + r[2] ** 2) or 1; r = [r[0] / rn, 0.0, r[2] / rn]
    u = [r[1] * f[2] - r[2] * f[1], r[2] * f[0] - r[0] * f[2], r[0] * f[1] - r[1] * f[0]]
    d = [pt[i] - cam[i] for i in range(3)]; z = sum(a * b for a, b in zip(d, f))
    if z <= 0.05: return None
    tv = math.tan(math.radians(fov) / 2); th = tv * 9 / 16
    return (0.5 + sum(a * b for a, b in zip(d, r)) / z / th / 2, 0.5 - sum(a * b for a, b in zip(d, u)) / z / tv / 2)
_src = open(os.path.join(HERE, '2026-10-10.lyrics.js')).read()
_rows = json.loads(re.search(r'window\.LYRICS = (.*?);\n', _src).group(1)); _ends = json.loads(re.search(r'window\.LINE_END = (.*?);\n', _src).group(1))
LINES = [(Bt(row[0][0] - 0.35), Bt(e)) for row, e in zip(_rows, _ends)]
def has_line(b0, b1): return any(a < b1 and b > b0 for a, b in LINES)
WARN = []
def body(a, end):                                # (who, x, z, face y, head top y) at the shot's start (0) or end (1), the lean carried
    who = a['who']; sc = a.get('scale', 1)
    x, z = a['x'] + a.get('mx', 0) * end, a['z'] + a.get('mz', 0) * end
    lift = a.get('lift', 0) + (a.get('my', 0) if end else 0)
    head = POODLE_HEAD if a.get('look') == 'poodle' else HEAD[who]
    L = math.radians(a.get('lean', 0)); yw = math.radians(a.get('yaw', 0)); fx, fz = math.sin(yw), math.cos(yw)
    fy, hy = FACE[who] * sc, head * sc
    return (who, x + fx * fy * math.sin(L), z + fz * fy * math.sin(L), fy * math.cos(L) + lift, hy * math.cos(L) + lift)
def check(beat, b1, cam, look, fov, actors, end):
    line = has_line(beat, b1)
    for a in actors:
        if a.get('fg') or a.get('reveal', 0) >= 1.0 or a.get('lying') or a.get('away'): continue
        who, x, z, fy, hy = body(a, end)
        top, face = _proj(cam, look, fov, (x, hy, z)), _proj(cam, look, fov, (x, fy, z))
        tag = ' at the end' if end else ''
        if not top or not face: WARN.append(f'b{beat}: {who} behind the lens{tag}'); continue
        if line and top[1] < 0.27: WARN.append(f'b{beat}: {who} head top at {top[1]:.2f} (lyric rows){tag}')
        if face[0] < 0.12 or face[0] > 0.88: WARN.append(f'b{beat}: {who} face x {face[0]:.2f} (edge){tag}')
        if face[1] > 0.82 or face[1] < 0.0: WARN.append(f'b{beat}: {who} face y {face[1]:.2f}{tag}')
def _occl(cam, look, fov, pts):                 # pts: [(who, x, z, face_y)]; who's face sits inside a nearer head's disc
    out = []
    for w, x, z, fy in pts:
        pf = _proj(cam, look, fov, (x, fy, z)); df = math.dist(cam, (x, fy, z))
        if not pf: continue
        for w2, x2, z2, fy2 in pts:
            if w2 == w: continue
            c = (x2, fy2 + 0.1, z2); d2 = math.dist(cam, c)
            if d2 >= df - 0.2: continue
            pc = _proj(cam, look, fov, c)
            if not pc: continue
            r_px = (RAD[w2] / d2 + 0.1 / df) / (2 * math.tan(math.radians(fov) / 2)) * 1920
            if math.hypot((pf[0] - pc[0]) * 1080, (pf[1] - pc[1]) * 1920) < r_px: out.append(f'{w} behind {w2}')
    return out

# ---- the set: a lens stays inside a room (never in a wall, the tub, the dryer, the desk or the sofa); a line of sight
# between the rooms passes through the GROOMING door's opening; a lens in the mirror's case only for the mirror's view ----
def free(c, mirror=False):
    x, y, z = c
    if not (0.12 < y < 3.15): return False
    if mirror: return MIRROR_X - 0.6 < x < MIRROR_X + 0.6 and MIRROR_Z - 2.3 < z < MIRROR_Z - 0.1 and y < 1.9
    if not (-5.85 < x < 5.85): return False
    if z > 0.12: inside = z < 8.85
    elif z < -0.12: inside = z > -7.85
    else: inside = DOOR[0] + 0.1 < x < DOOR[1] - 0.1 and y < DOOR[2] - 0.1
    if not inside: return False
    if TUB_BOX[0] - 0.05 < x < TUB_BOX[1] + 0.05 and TUB_BOX[2] - 0.05 < z < TUB_BOX[3] + 0.05 and y < RIM + 0.08: return False
    if DRYER[0] - 1.05 < x < DRYER[0] + 0.3 and DRYER[1] - 0.3 < z < DRYER[1] + 0.3 and y < 1.45: return False
    if 2.95 < x < 5.65 and 1.95 < z < 2.85 and y < 1.1: return False                  # the desk
    if -5.95 < x < -5.0 and 4.8 < z < 7.6 and y < 0.95: return False                  # the sofa
    return True
def sight(cam, p):
    if (cam[2] > 0) != (p[2] > 0):
        u = (0 - cam[2]) / (p[2] - cam[2]); X = cam[0] + (p[0] - cam[0]) * u; Y = cam[1] + (p[1] - cam[1]) * u
        if not (DOOR[0] + 0.06 < X < DOOR[1] - 0.06 and Y < DOOR[2] - 0.05): return False
    return True

shots = []
def lens(v, k=0):
    c, f = v; a = math.radians(c['ang'][k]); fy = f[2] if len(f) > 2 else 0
    return (f[0] + math.sin(a) * c['r'][k], c['h'][k] + fy, f[1] + math.cos(a) * c['r'][k])
def add(beat, b1, actors, lyric, v, mirror=False, **o):
    c, focus = v
    o = {k: val for k, val in o.items() if val is not None}
    shots.append({'beat': beat, 'kind': 'dance', 'map': 'salon', 'actors': actors, 'lyric': lyric, 'cam': c, 'focus': focus, **o})
    fy = focus[2] if len(focus) > 2 else 0
    for k, end in ((0, 0), (-1, 1)):
        cam, look = lens(v, k), (focus[0], c['look'][k] + fy, focus[1])
        check(beat, b1, cam, look, c['fov'], actors, end)
        for oc in _occl(cam, look, c['fov'], [body(a, end)[:4] for a in actors if not a.get('lying') and not a.get('fg') and not a.get('away')]):
            WARN.append(f'b{beat}: {oc}{" at the end" if end else ""}')
        if not free(cam, mirror): WARN.append(f'b{beat}: lens inside the set{" at the end" if end else ""} {tuple(round(q, 2) for q in cam)}')
        for a in actors:
            if a.get('fg') or a.get('away') or a.get('lying'): continue
            who, x, z, fy2, _ = body(a, end)
            if not sight(cam, (x, fy2, z)): WARN.append(f'b{beat}: {who} hidden by the wall{" at the end" if end else ""}')
def clean(actors):
    for a in actors:
        for k in ('lying', 'away'): a.pop(k, None)
    return actors

GROOM = dict(zone='groom', foam=True, duck=True)
BEHIND_L, BEHIND_R, STEP = (-2.95, -5.15), (-1.45, -5.15), 0.42     # the grooming team behind the tub, on a step: their faces over its rim (the step hidden by the tub)
WAIT = dict(zone='wait')
def reflection(a):                                # the mirror's reflection of an actor: a crowd of one at the mirrored spot, same clip and swing
    c = {'who': 'saxo', 'look': a['look'], 'clip': a['clip'], 'at': a['at'], 'speed': a.get('speed', 1), 'n': 1, 'cols': 1, 'jitter': 0,
         'x0': a['x'], 'z0': round(2 * MIRROR_Z - a['z'], 3), 'yaw': round((180 - a.get('yaw', 0)) % 360, 1), 'face': 'world', 'noShadow': True}
    for k in ('arm', 'aim', 'upAt', 'flapEvery', 'flapPh', 'flap', 'hop', 'sway', 'swayEvery'):
        if k in a: c[k] = a[k]
    return c

# =====================================================================================================================
# ACT 1, the pre-chorus (b0-26.75): dragged in
# S01 the hook (b0-4; always b3.24): a swoop down to the carpet: Saxo in the singer's look leans out at an impossible
# angle at the end of a taut pink leash, paws flapping, Sadi pulling him backwards into the GROOMING door, Kob the
# groomer beside it snipping her scissors, deadpan
s01 = [A('saxo', 'happy_idle', 1.6, 2.55, yaw=0, at=0.3, speed=0.2, lean=38, **PANIC),
       A('sadi', 'happy_idle', 1.6, 0.5, yaw=0, at=0.3, speed=0.15, lean=-16, hold='leash', hookTo='saxo', arm='R', aim=[0.2, 0.05, 0.9], upAt=-1),
       A('kob', 'happy_idle', 0.3, 0.5, yaw=20, at=0.3, speed=0.06, hold='scissors', holdScale=1.3, arm='R', aim=[0.45, 0.62, 0.64], upAt=-1)]
v = swoop([(4.6, 2.4, 6.4), (4.25, 1.6, 5.8), (3.9, 0.9, 5.2), (3.7, 0.6, 4.85)], (1.65, 0.98, 2.3), fov=58, roll=(0, 2, 6, 4), hand=0.15)
add(0, 4, s01, "the hook ('always'): a swoop down to the carpet: Saxo in the singer's beanie and glasses leaning out at an impossible angle at the end of a taut pink leash, paws flapping, Sadi pulling him backwards into the GROOMING door, Kob the groomer snipping her scissors beside it", v,
    **WAIT, door=1, pets='stare', stare=[1.6, 2.5])
# S02 (b4-10): the clip's invisible force: he goes boneless and is dragged across the green carpet on his back by the
# collar, head first, the leash running off to the door
s02 = [A('saxo', 'laying_idle', 1.6, 3.9, yaw=0, at=1.0, speed=0.3, mz=-2.4, lying=True, tongue=True),
       A('sadi', 'happy_idle', 1.6, 0.35, yaw=0, at=0.3, speed=0.15, lean=-16, hold='leash', hookTo='saxo', arm='R', aim=[0.2, 0.0, 0.9], upAt=-1, mz=-0.6, fg=True)]
v = view((1.62, 3.0, 6.0), (1.6, 0.1, 1.75), 50, p1=(1.62, 2.9, 4.4))
add(4, 10, s02, "'always': the clip's invisible force: he goes boneless and is dragged on his back across the green carpet by the collar, the leash running off to the door", v,
    **WAIT, door=1, pets='stare', stare=[1.6, 3.0])
# S03 (b10-14; blue b11.85): over the groomer's shoulder, through the doorway: he begs, paws clasped
s03 = [A('saxo', 'falling_to_knees_in_prayer', 1.6, 1.45, yaw=180, at=3.0, speed=0)]
v = view((1.62, 1.62, -0.8), (1.6, 1.12, 1.45), 46, p1=(1.62, 1.6, -0.7))
add(10, 14, s03, "'blue': the groomer's point of view from the doorway: Saxo begs, paws clasped under his chin, looking up at her", v, zone='wait', door=1, pets='stare', stare=[1.6, 1.35])
# S04 (b14-16; please b13.95): the groomer's answer, frontal and locked off: snip, snip
s04 = [A('kob', 'happy_idle', 1.6, -0.1, yaw=0, at=0.3, speed=0.05, hold='scissors', holdScale=1.3, arm='R', aim=[0.45, 0.62, 0.64], upAt=-1)]
v = view((1.6, 1.15, 2.55), (1.6, 1.16, -0.1), 40, p1=(1.6, 1.15, 2.43), ease='lin')
add(14, 16, s04, "'please': the groomer's answer, deadpan, frontal and locked off: snip, snip", v, **WAIT, door=1)
# S05 (b16-24; nothing b18.0, lose b20.4): the clip's own shot: the lone chair in the middle of the wood-panelled room,
# a frontal wide under the fluorescent panels; he clings to it, sitting, while Compote the bather drags the chair to
# the door by his leash
MV = (0.95, -1.15)                               # the chair's drag, from its mark towards the door
s05 = [A('saxo', 'sitting_talking', CHAIR[0], CHAIR[1], yaw=0, at=0.05, speed=0, lift=CHAIR_Y, mx=MV[0], mz=MV[1], moveAt=0.5),
       A('compote', 'happy_idle', 0.15, 1.9, yaw=yaw_to((0.15, 1.9), CHAIR), at=0.3, speed=0.15, lean=-18, hold='leash', hookTo='saxo', arm='R', aim=[0.2, 0.05, 0.9], upAt=-1, mx=0.35, mz=-0.45, moveAt=0.5)]
v = view((-1.2, 1.4, 8.7), (-0.9, 1.0, 3.2), 50, p1=(-1.2, 1.38, 8.4), ease='lin')
add(16, 24, s05, "'nothing', 'lose': the clip's own shot: the lone chair in the empty wood-panelled room under the fluorescent panels; he clings to it, sitting, while Compote the bather drags it to the door by his leash", v,
    **WAIT, door=1, chairAt=[CHAIR[0], CHAIR[1], CHAIR[0] + MV[0], CHAIR[1] + MV[1], 0.5, S(24, 16)], pets='stare', stare=[-1.2, 3.9])
# S06 (b24-26.75; baby b23.9): splash: he drops into the grooming room's tub
s06 = [A('saxo', 'happy_idle', TUB[0], TUB[1], yaw=0, at=0.3, speed=0.3, lift=TUB_Y + 1.5, my=-1.5, myAt=0.0, myDur=0.42, air=True, reveal=0.5, **PANIC)]
v = view((-2.05, 1.32, -0.9), (-2.2, 1.38, -4.4), 56)
add(24, 26.75, s06, "'baby': splash: he drops into the grooming room's tub", v, **GROOM, splash=[[TUB[0], TUB[1], 0.42, 1.3]])

# =====================================================================================================================
# ACT 2, the chorus (b26.75-60): the bath
# S07 the Short's first frame (b26.75-33; birds b27.6, feather b30.4): he dances in the foam, the shimmy that is the
# wet dog's shake (drops flung off him on every half beat), the rubber duck bobbing; Compote scrubs on the beat, Kob
# beside the tub gets the spray
s07 = [A('saxo', 'twist', TUB[0], TUB[1], yaw=0, at='auto', lift=TUB_Y, sway=9, swayEvery=0.5),
       A('compote', 'happy_idle', *BEHIND_L, yaw=15, at=0.3, speed=0.15, lift=STEP, hold='brush', holdScale=1.3, arm='R', aim='taiko', upAt=-1),
       A('kob', 'happy_idle', *BEHIND_R, yaw=-15, at=0.3, speed=0.05, lift=STEP)]
v = view((-2.15, 1.1, -1.05), (-2.2, 1.32, -4.6), 58, p1=(-2.15, 1.1, -1.45), roll=[-5, -3], hand=0.3)
add(26.75, 33, s07, "'birds of a feather': the Short's first frame: he dances in the foam, the shimmy that is a wet dog's shake (drops flung off him on every half beat), the rubber duck bobbing; Compote scrubs on the beat, Kob gets the spray", v,
    **GROOM, shake=[TUB[0], 1.2, TUB[1], 0, 99])
# S08 (b33-37; stick b33.0, together b33.5, know b35.9): the shake from the cat's side: every drop lands on her
s08 = [A('kob', 'happy_idle', *BEHIND_R, yaw=-40, at=0.3, speed=0.04, lift=STEP),
       A('saxo', 'twist', TUB[0], TUB[1], yaw=35, at='auto', lift=TUB_Y, sway=12, swayEvery=0.5)]
v = view((-0.1, 1.35, -1.55), (-1.95, 1.5, -4.85), 50, p1=(-0.2, 1.35, -1.7))
add(33, 37, s08, "'stick together': the shake from the cat's side: every drop he flings lands on the groomer", v,
    **GROOM, shake=[TUB[0], 1.2, TUB[1], 0, 99], drips=[[BEHIND_R[0], BEHIND_R[1], 1.6]])
# S09 (b37-43; better b42.1): the cat, soaked, dripping into a puddle: a frontal deadpan, locked off
s09 = [A('kob', 'happy_idle', *BEHIND_R, yaw=0, at=0.3, speed=0.04, lift=STEP)]
v = view((BEHIND_R[0], 1.6, -2.85), (BEHIND_R[0], 1.6, BEHIND_R[1]), 42, p1=(BEHIND_R[0], 1.6, -2.97), ease='lin')
add(37, 43, s09, "'better': the groomer soaked, dripping, deadpan, frontal and locked off", v, **GROOM, drips=[[BEHIND_R[0], BEHIND_R[1], 1.6]])
# S10 (b43-45; alone b43.1): she turns the dryer on him
s10 = [A('kob', 'happy_idle', 1.25, -4.85, yaw=-10, at=0.3, speed=0.05, arm='R', aim=[0.6, -0.1, 0.5], upAt=-1)]
v = view((1.05, 1.25, -2.35), (0.95, 1.2, -4.75), 48)
add(43, 45, s10, "'alone': deadpan, she turns the dryer on him", v, **GROOM, drips=[[1.25, -4.85, 1.3]], dryer=[TUB[0], 1.3, TUB[1], 0.55])
# S11 (b45-51; change b45.35, weather b46.4, forever b49.65): the weather: Compote turns the rain head on him and he
# dances in the rain, paws up
s11 = [A('saxo', 'happy_idle', TUB[0], TUB[1], yaw=0, at=0.3, speed=0.3, lift=TUB_Y, hop=[0.04, 1], **{**RAVE, 'flapEvery': 1}),
       A('compote', 'happy_idle', *BEHIND_L, yaw=15, at=0.3, speed=0.15, lift=STEP, hold='brush', holdScale=1.3, arm='R', aim='taiko', upAt=-1)]
v = view((-2.25, 0.95, -1.05), (-2.2, 1.5, -4.5), 60, p1=(-2.24, 0.95, -1.5), roll=[4, 2], hand=0.3)
add(45, 51, s11, "'weather': Compote turns the rain head on and he dances in the rain, paws up", v, **GROOM, shower=0.75)
# S12 (b51-56; forever b53.4): the clip's force: the dryer's blast pushes him back across the tub, leaning out at the
# hook's impossible angle the other way, paws flapping
s12 = [A('saxo', 'happy_idle', TUB[0] + 0.15, TUB[1], yaw=80, at=0.3, speed=0.3, lift=TUB_Y, lean=-26, mx=-0.45, **PANIC)]
v = view((-0.35, 1.35, -1.95), (-2.3, 1.4, -4.45), 50, p1=(-0.45, 1.35, -2.1))
add(51, 56, s12, "'forever': the clip's force: the dryer's blast pushes him back across the tub, leaning out at an impossible angle, paws flapping", v,
    **GROOM, dryer=[TUB[0], 1.3, TUB[1], 0])
# S13 (b56-60; better b58.0): the fluff swells round him until he's lost in a white cloud
s13 = [A('saxo', 'happy_idle', TUB[0] - 0.25, TUB[1], yaw=0, at=0.3, speed=0.3, lift=TUB_Y, lean=-10, **PANIC)]
v = view((-2.15, 1.35, -1.35), (-2.3, 1.45, -4.4), 54, p1=(-2.15, 1.35, -1.6))
add(56, 60, s13, "'better': the fluff swells round him until he's lost in a white cloud", v, **GROOM, dryer=[TUB[0], 1.3, TUB[1], 0], fluff=[TUB[0] - 0.25, TUB[1], 0.2, 99, 0.85, 1.35])

# =====================================================================================================================
# ACT 3, the post-chorus (b60-87.5): the reveal
# S14 (b60-66; know b63.2): from behind the cloud: the three stare at it (the cloud in the foreground)
s14 = [A('sadi', 'happy_idle', -2.85, -2.35, yaw=180, at=0.3, speed=0.08),
       A('kob', 'happy_idle', -2.05, -2.2, yaw=180, at=0.3, speed=0.05),
       A('compote', 'happy_idle', -1.25, -2.35, yaw=180, at=0.3, speed=0.08, hold='brush', holdScale=1.3)]
v = view((-2.05, 2.8, -5.65), (-2.05, 0.95, -2.3), 56, p1=(-2.05, 2.78, -5.5), ease='lin')
add(60, 66, s14, "'know': from behind the cloud of fluff in the tub, the three stare at it, waiting", v, **GROOM, fluff=[TUB[0] - 0.25, TUB[1], -2, 99, 0.62, 1.25], drips=[[-2.05, -2.15, 1.3]])
# S15 (b66-70; crying b66.4): the cloud blows away: a show poodle, all white curls and pom-poms, a pink bow on his topknot
s15 = [A('saxo', 'happy_idle', TUB[0] - 0.25, TUB[1], look='poodle', yaw=0, at=0.2, speed=0.15, lift=TUB_Y, hop=[0.04, 1], **RAVE)]
v = view((-2.3, 1.0, -1.55), (-2.3, 1.55, -4.4), 52, p1=(-2.3, 1.0, -2.05))
add(66, 70, s15, "'crying': the cloud blows away: a show poodle, white curls, pom-poms and a pink bow on his topknot", v, **GROOM, fluff=[TUB[0] - 0.25, TUB[1], -2, 0.15, 0.85, 1.35])
# S16 (b70-74; think b71.2): Sadi melts: a paw on her heart, hearts
s16 = [A('sadi', 'happy_idle', *SADI_GROOM, yaw=yaw_to(SADI_GROOM, TUB), at=0.3, speed=0.1, arm='R', aim='heart', upAt=-1)]
v = view((-1.05, 1.15, -3.25), (0.55, 1.12, -1.7), 44, p1=(-0.97, 1.15, -3.17), ease='lin')
add(70, 74, s16, "'think': Sadi melts, a paw on her heart, hearts rising", v, **GROOM, hearts=[[SADI_GROOM[0], 1.55, SADI_GROOM[1], 0.2, 1]], heartYaw=-130)
# S17 (b74-77; love b74.1): he meets his reflection: over his shoulder at the mirror, hearts bursting out of his head
MIR = A('saxo', 'happy_idle', *MIR_SPOT, look='poodle', yaw=180, at=0.2, speed=0.15, hop=[0.04, 1], **RAVE)
v = view((3.05, 1.62, -4.85), (2.4, 1.2, -7.9), 50, p1=(3.0, 1.6, -5.05))
add(74, 77, [MIR], "'love': he meets his reflection: over his shoulder at the mirror, hearts bursting out of his head", v,
    **GROOM, crowd=reflection(MIR), hearts=[[MIR_SPOT[0], 1.75, MIR_SPOT[1], 0.0, 1]], heartYaw=180)
# S18 (b77-82): the mirror's point of view: the poodle posing for himself, framed by the bulbs, hearts looping
v = view((2.4, 1.25, -9.35), (2.4, 1.15, -6.7), 50, p1=(2.4, 1.25, -9.2))
add(77, 82, [MIR], "the mirror's point of view: the poodle posing for himself, framed by its bulbs, hearts looping", v, mirror=True,
    **GROOM, noGlass=True, hearts=[[MIR_SPOT[0], 1.75, MIR_SPOT[1], 0.0, 1]])
# S19 (b82-87.5; baby b82.2): the groomer's photo: her flash and the instant photo of the proud poodle, the mirror behind
PHOTO = A('saxo', 'happy_idle', 2.4, -6.5, look='poodle', yaw=0, at=0.2, speed=0.15, **RAVE, holdAt=0.12)
v = view((2.4, 1.28, -4.15), (2.4, 1.18, -6.5), 46)
add(82, 87.5, [PHOTO], "'baby': the groomer's photo: her flash, and the instant photo of the proud poodle, the mirror behind him (the groomer posted a picture of you)", v,
    **GROOM, flashAt=[0.12], photo=0.3, still=True)

# =====================================================================================================================
# ACT 4, the hook (b87.5-122): he won't leave
# S20 (b87.5-90.55; love b87.9, day b90.2): time to go: Sadi pulls the leash; he hugs the mirror, his reflection hugging back
HUG = A('saxo', 'happy_idle', 2.4, -7.42, look='poodle', yaw=180, at=0.2, speed=0.2, arm='both', aim='caramell', flap=0.55, upAt=-1)
s20 = [HUG, A('sadi', 'happy_idle', 3.75, -5.35, yaw=yaw_to((3.75, -5.35), (1.6, 0.0)), at=0.3, speed=0.2, lean=16, fg=True, hold='leash', hookTo='saxo', arm='R', aim=[0.35, -0.25, -0.7], upAt=-1)]
v = view((3.2, 1.68, -4.75), (2.4, 1.2, -7.9), 52, p1=(3.15, 1.66, -4.9))
add(87.5, 90.55, s20, "'love', 'day': time to go home: the leash pulls him from off the frame (the clip's invisible force again, Sadi at its edge); he hugs the mirror, his reflection hugging back", v, **GROOM, crowd=reflection(HUG))
# S21 (b90.55-97; die b92.04): bang: he plays dead on the word (knocked_out_falling_to_back joined at 1.45 s, its impact ~2.3 s), falling back in front of the mirror, tongue out
s21 = [A('saxo', 'knocked_out_falling_to_back', 2.4, -6.3, look='poodle', yaw=0, at=1.45, speed=1, once=True, tongue=True)]
v = view((2.5, 2.5, -3.55), (2.42, 0.78, -6.4), 54, p1=(2.5, 2.45, -3.65))
add(90.55, 97, s21, "'die': bang: he plays dead on the word, falling back in front of the mirror, tongue out", v, **GROOM)
# S22 (b97-99.5; day b98.2): dragged out of the grooming room on his back, through the door, head first
s22 = [A('saxo', 'laying_idle', 1.6, -1.6, look='poodle', yaw=180, at=1.0, speed=0.3, mz=2.6, lying=True, tongue=True),
       A('sadi', 'happy_idle', 1.6, 2.1, yaw=180, at=0.3, speed=0.2, lean=-15, hold='leash', hookTo='saxo', arm='R', aim=[0.2, 0.0, 0.9], upAt=-1, mz=1.1, fg=True)]
v = view((2.85, 0.7, 4.5), (1.6, 0.42, 0.4), 54)
add(97, 99.15, s22, "'day': dragged out of the grooming room on his back, through the door, head first", v, **WAIT, door=1, pets='stare', stare=[1.6, 0.6])
# S23 (b99.5-105; die b100.16): Sadi stands him up; on the word he drops again like a sack
s23 = [A('saxo', 'knocked_out_falling_to_back', 1.6, 1.4, look='poodle', yaw=0, at=1.45, speed=1.5, once=True, tongue=True),
       A('sadi', 'happy_idle', 2.25, 1.75, yaw=-110, at=0.3, speed=0.1, hold='leash', hookTo='saxo', arm='R', aim=[0.25, -0.2, 0.85], upAt=-1)]
v = view((1.85, 1.95, 5.0), (1.8, 0.75, 1.3), 52, p1=(1.85, 1.92, 4.85))
add(99.15, 105, s23, "'die': Sadi stands him up; on the word he drops again like a sack", v, **WAIT, door=1, pets='gasp', stare=[1.6, 1.4])
# S24 (b105-109; light b106.25, leaves b106.6): the clip's drag again, the other way: across the carpet on his back
s24 = [A('saxo', 'laying_idle', 2.05, 2.6, look='poodle', yaw=yaw_to((2.05, 2.6), (3.25, 8.4)) + 180, at=1.0, speed=0.3, mx=0.75, mz=3.2, lying=True, tongue=True),
       A('sadi', 'happy_idle', 2.35, 4.15, yaw=yaw_to((2.05, 2.6), (3.25, 8.4)), at=0.3, speed=0.2, lean=18, hold='leash', hookTo='saxo', arm='R', aim=[0.35, -0.25, -0.7], upAt=-1, mx=0.75, mz=3.2, fg=True)]
v = view((1.5, 2.9, 1.3), (2.7, 0.1, 5.3), 52, p1=(1.75, 2.8, 3.1))
add(105, 109, s24, "'light', 'leaves': the clip's drag again, the other way: across the green carpet on his back, towards the front door", v, **WAIT, pets='stare', stare=[2.5, 4.5], fame=True)
# S25 (b109-113; eyes b109.3): his eyes on the wall of fame: his own photo in the gold frame, hearts
s25 = [A('saxo', 'laying_idle', 2.8, 5.8, look='poodle', yaw=yaw_to((2.05, 2.6), (3.25, 8.4)) + 180, at=1.0, speed=0.3, mx=0.2, mz=0.85, lying=True, tongue=True, fg=True)]
v = view((4.3, 1.35, 4.7), (5.95, 1.45, 6.0), 46, p1=(4.4, 1.35, 4.85))
add(109, 113, s25, "'eyes': his eyes on the wall of fame: his own photo in the gold frame", v, **WAIT, fame=True, hearts=[[5.8, 1.9, 6.0, 0.2, 1]], heartYaw=-90)
# S26 (b113-121; day b114.2, die b117.2 held): the front door: the grandest death on the held 'die': he staggers in
# the doorway and falls back across the threshold; Sadi gives up and lies down beside him (birds of a feather)
s26 = [A('saxo', 'shot_to_the_chest_falling_backwards', 3.25, 8.15, look='poodle', yaw=180, at=0.15, speed=1, once=True, tongue=True),
       A('sadi', 'dying_falling_backward', 2.45, 8.05, yaw=180, at=0, speed=0.6, once=True)]
v = view((3.0, 1.95, 4.6), (2.95, 0.95, 8.0), 50, p1=(3.0, 1.92, 4.75))
add(113, 121, s26, "'die' (held): the front door: the grandest death: he staggers in the doorway and falls back across the threshold; Sadi gives up and lies down beside him", v, **WAIT, front=1, pets='stare', stare=[3.0, 8.0])
# S27 (b121-122): the button, in the silence: the groomer's flash: the photo of the two lying side by side
s27 = [dict(s26[0], at=4.0, speed=0), dict(s26[1], at=2.0, speed=0)]
v = view((3.0, 1.92, 4.75), (2.95, 0.95, 8.0), 50)
add(121, 122, s27, "the button, in the silence: the groomer's flash: the photo of the two lying side by side in the doorway", v, **WAIT, front=1, flashAt=[0.0], photo=-0.6, still=True)

for s in shots: clean(s['actors'])
shots.sort(key=lambda x: x['beat'])
ep = {
    'date': '2026-10-10', 'song': {'title': 'BIRDS OF A FEATHER', 'artist': 'Billie Eilish'},
    'logline': "The clip's invisible force is a pink leash: Saxo, in the singer's beanie and glasses, is dragged into a 70s grooming salon (the clip's wood-panelled room and its lone chair) leaning out at impossible angles, boneless on his back, clinging to the chair; bathed, he shakes himself dry all over Kob the groomer, whose dryer blasts him into a cloud of fluff; out steps a show poodle in a pink bow who falls in love with himself in the mirror, and when it's time to go home he plays dead on every 'die' so they can't move him",
    'new': "src/maps39.js: salon (the clip's 70s office as a grooming salon: a wood-panelled waiting room on a green carpet under a ceiling of fluorescent panels, the lone chair that tips and is dragged (`tip`, `chairAt`), its leather sofa, waiting customers, a reception desk with lovebirds, a wall of fame (`fame`), the front door (`front`), the GROOMING door (`door`); a white-tiled grooming room: a raised tub with foam and a rubber duck (`foam`, `duck`), a rain head (`shower`), a splash (`splash`), a wet dog's shake flinging drops every half beat (`shake`), drips and puddles (`drips`), a dryer whose blast streams at its target (`dryer`, `dryerAim`), a cloud of fluff (`fluff`), hearts, a dressing mirror with bulbs as a portal); src/ps1.js: the `leash` prop (a taut pink lead from a paw to a collar), the `brush` and `scissors` props (snipping on the beat), ARM_OPT (a costume with big white cuffs and fluff on its shoulders: the poodle); four looks: saxo beanie (the singer's look), saxo poodle (the groomed show-poodle cut), kob groomer, compote bather",
    'notes': "The world, from the official video (contact sheets every 3 s; nothing violent in it): an empty 1970s office, dark wood panelling over a green carpet, a ceiling of fluorescent panels, one lone chair, a brown leather sofa, white rooms; the singer in a black beanie, round glasses, an oversized white sweatshirt and green camo cargos, tipped back on her chair, dragged across the floor and pushed about by an invisible force. The words, from whitelisted keywords per line (keywords.py, kw_times.mjs: never the lines): always, blue, please, nothing, lose, baby, birds, feather, stick, together, alone, better, change, weather, forever, crying, love, day, die, light, leaves, eyes. Saxo wears the singer's look until the grooming, then a show-poodle cut (its arms stay up in every standing shot: hanging down, its shoulder fluff tore into spikes); Sadi her pink velour tracksuit (she brings him); Kob the groomer (the cat who hates water, soaked by his shake); Compote the bather. The live reference: groomer-photo ('the groomer posted a picture of you': the proud poodle's photo).",
    'yt': [15.42, 69.7],   # the Short opens on the chorus's first line: the dance in the foam (from the earliest line that fits it opened on the chair shot, a story beat)
    'with': ['sadi', 'kob', 'compote'],
    'clips': ['happy_idle', 'twist', 'laying_idle', 'sitting_talking', 'falling_to_knees_in_prayer', 'dying_falling_backward', 'shot_to_the_chest_falling_backwards', 'knocked_out_falling_to_back'],
    'tags': {'structure': 'turnaround', 'scenes': ['dragged on the leash', 'boneless on his back', 'begging the groomer', 'clinging to the lone chair', 'the splash into the tub', 'the wet dog shake', 'the cat soaked', 'dancing in the rain head', 'the dryer blast', 'the cloud of fluff', 'the poodle reveal', 'love at first sight in the mirror', 'the groomer\'s photo', 'playing dead', 'dragged out', 'lying down together'],
             'cast': ['saxo', 'sadi', 'kob', 'compote'], 'hook': 'action', 'maps': ['salon'], 'ref': 'groomer-photo',
             'lyric_literal': "'please' (he begs the groomer), 'weather' (the rain head on him), 'better alone' (the soaked cat), 'love' (hearts at his own reflection), 'baby' (the groomer's photo), 'die' x3 (he plays dead on every one: in front of the mirror, at the door, at the front door), 'eyes' (on his own photo), 'stick together' (the shake's spray on the cat), 'birds of a feather' (the shimmy in the foam)",
             'experiment': "A pet-owner universal in two halves (the dog who won't go in, then won't leave) with the clip's invisible force made literal (a leash) and a before/after transformation reveal (scruffy to show poodle): does a transformation payoff on a 1.78M-video sound lift the Short's views at 24 h over the last two episodes?"},
    'shots': shots,
}
json.dump(ep, open(os.path.join(HERE, '2026-10-10.json'), 'w'), indent=1, ensure_ascii=False)
print(len(shots), 'shots;', len(WARN), 'warnings')
for w in WARN: print('  ', w)
