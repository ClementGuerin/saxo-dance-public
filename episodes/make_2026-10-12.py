# The "Beat It" episode (2026-10-12; Michael Jackson, 1982): writes episodes/2026-10-12.json.
# Kit 2026-10-12: 79.590 s = 184 beats at 138.7113 BPM from the chorus's pickup (kit beat -1 at 0 s): chorus 1, verse 2,
# the double chorus 2 and its tag, then one silent beat (kit beats 182-183).
# The world (the official video, contact sheets of its verse and its closing dance only, never the fight): rival gangs at
# night, a backlit alley behind a chain-link fence in smoke, a corridor to a bright door, a dark warehouse in teal light and
# fog where the singer in a red leather jacket dances both gangs into one formation. The words (whitelisted keywords per
# line, never the text): the title on every chorus line ('beat it' = go away), 'defeated', 'fight', 'funky', 'strong',
# 'wrong', 'right', 'leave', 'stay', 'scared', 'show', 'truth', 'dare', 'kick', 'fair', 'bad'.
# The story (structure FETCH, new: every 'beat it' is a throw, and the dog brings it back): the alley cats (Kob's gang)
# and the bunny gang (Compote's, with Sadi) meet in the warehouse for a rumble; the dog in the red jacket dances in the
# middle. Every time someone tells him to beat it, they throw something out of the door, and he brings it back.
#   1 (chorus 1, b-1..47): the standoff, the dog dancing between the gangs; Compote throws a stick out of the loading
#     door, he sprints after it and trots back in with it; the leaders' face-off with a dog and a stick between them;
#     the cats' hiss and the bunnies' thump, which he dances along to; then the four 'beat it's: a throw and a return
#     each (yarn, fish, ball, frisbee), the pile growing at the leaders' feet.
#   2 (verse 2, b47..111): everyone points at the door; he trots out; they shut the roll-up door; outside he sits and
#     stays; they square off again... and he pushes in through the dog flap with the stick; 'show them you're not
#     scared': he rolls belly up between the leaders; Compote's dare (the tyre) and her kick (the ball); he's back with
#     both; everyone grabs everything and throws it at once.
#   3 (chorus 2, b111..175): the throwing chorus line (the clip's formation, every paw throwing on the beat); the dog
#     catching in the alley; they slow down, pant, and drop flat one by one, the two leaders last; the dog dances among
#     the bodies, fresh; Sadi, the only one who loves it, throws for him again.
#   4 (the tag and the button, b175..183): he drops the ball on Kob, flat on her back; she flicks it ten centimetres with
#     one claw; he fetches it and drops it on her again. Silence.
import json, math, os, re, sys
sys.path.insert(0, os.path.dirname(__file__))
from cam import view, deadpan

HERE = os.path.dirname(__file__)
PER = 60 / 138.7113
def Bt(t): return t / PER - 1.0                    # kit seconds -> kit beat (kit beat -1 at 0 s)
def S(b, b0): return round((b - b0) * PER, 3)      # seconds from shot beat b0 to beat b
rad = math.radians

LOOK = {'saxo': 'redjacket', 'sadi': 'denim', 'kob': 'greaser', 'compote': 'punk'}
HEAD = {'saxo': 1.46, 'sadi': 1.38, 'kob': 1.47, 'compote': 1.5}
FACE = {'saxo': 0.9, 'sadi': 0.84, 'kob': 0.86, 'compote': 0.86}
RAD = {'saxo': 0.5, 'sadi': 0.45, 'kob': 0.42, 'compote': 0.42}
# the warehouse (src/maps43.js RUMBLE)
KOB_M = (-1.55, 0.4); COMP_M = (1.55, 0.4); DOG_M = (0.0, 0.75); SADI_M = (2.3, 1.45)
DOOR_Z = -7.0; OUT_PT = [0.35, 0.08, -12.0]
PILE_C = (0.0, 1.5)

def A(who, clip, x, z, **o):
    return {'who': who, 'look': o.pop('look', LOOK[who]), 'clip': clip, 'x': round(x, 3), 'z': round(z, 3), 'face': o.pop('face', 'world'),
            'yaw': round(o.pop('yaw', 0), 1), 'at': o.pop('at', 'auto'), **o}
def yaw_to(frm, to): return round(math.degrees(math.atan2(to[0] - frm[0], to[1] - frm[1])), 1)
IDLE = dict(clip='happy_idle', at=0.3, speed=0.1)
def still(who, x, z, yaw, **o): return A(who, x=x, z=z, yaw=yaw, **{**IDLE, **o})
THROW_AT = 0.9                                   # goalie_overhand_throw from its wind-up: the paw lets go ~0.8 s later
def thrower(who, x, z, to, hold, **o):           # winds up and throws `hold` at `to` [x, y, z]
    return A(who, 'goalie_overhand_throw', x, z, yaw=o.pop('yaw', yaw_to((x, z), (to[0], to[2]))), at=THROW_AT, speed=1,
             hold=hold, toss={'at': o.pop('rel', 0.8), 'to': to, 'dur': o.pop('dur', 0.9), 'arc': o.pop('arc', 1.4), 'scale': o.pop('tscale', 1.5)}, **o)
def run(x0, z0, x1, z1, dur, **o):               # the dog's sprint from (x0, z0) to (x1, z1) over the shot
    return A('saxo', 'happy_run', x0, z0, mx=round(x1 - x0, 3), mz=round(z1 - z0, 3), yaw=yaw_to((x0, z0), (x1, z1)), speed=o.pop('speed', 1.5), **o)
BELLY = dict(clip='laying_idle', at=1.0, speed=0, lying=True, arm='both', aim=[0.3, 0.7, 0.65], upAt=-1, tongue=True)
FLAT = dict(clip='knocked_out_falling_to_back', at=3.3, speed=0, lying=True)
CHARL = 2.467
def kick_at(rv): return round((1.6 - rv) % CHARL, 3)   # charleston's kick (clip 1.6 s) on the review frame, rv s into the shot

# ---- a projection check (numbers only): where each face lands in the 9:16 frame at the shot's start and end ----
def _proj(cam, look, fov, pt):
    f = [look[i] - cam[i] for i in range(3)]; n = math.sqrt(sum(v * v for v in f)); f = [v / n for v in f]
    r = [-f[2], 0.0, f[0]]; rn = math.sqrt(r[0] ** 2 + r[2] ** 2) or 1; r = [r[0] / rn, 0.0, r[2] / rn]
    u = [r[1] * f[2] - r[2] * f[1], r[2] * f[0] - r[0] * f[2], r[0] * f[1] - r[1] * f[0]]
    d = [pt[i] - cam[i] for i in range(3)]; z = sum(a * b for a, b in zip(d, f))
    if z <= 0.05: return None
    tv = math.tan(math.radians(fov) / 2); th = tv * 9 / 16
    return (0.5 + sum(a * b for a, b in zip(d, r)) / z / th / 2, 0.5 - sum(a * b for a, b in zip(d, u)) / z / tv / 2)
_src = open(os.path.join(HERE, '2026-10-12.lyrics.js')).read()
_rows = json.loads(re.search(r'window\.LYRICS = (.*?);\n', _src).group(1)); _ends = json.loads(re.search(r'window\.LINE_END = (.*?);\n', _src).group(1))
LINES = [(Bt(row[0][0] - 0.35), Bt(e)) for row, e in zip(_rows, _ends)]
def has_line(b0, b1): return any(a < b1 and b > b0 for a, b in LINES)
WARN = []
def body(a, end):                                # (who, x, z, face y, head top y) at the shot's start (0) or end (1)
    who = a['who']; sc = a.get('scale', 1)
    x, z = a['x'] + a.get('mx', 0) * end, a['z'] + a.get('mz', 0) * end
    lift = a.get('lift', 0) + (a.get('my', 0) if end else 0)
    fy, hy = FACE[who] * sc, HEAD[who] * sc
    if a.get('clip') in ('sitting_talking', 'situps'): fy, hy = fy - 0.3, hy - 0.3
    return (who, x, z, fy + lift, hy + lift)
def check(beat, b1, cam, look, fov, actors, end, W):
    line = has_line(beat, b1)
    for a in actors:
        if a.get('fg') or a.get('lying') or a.get('away'): continue
        who, x, z, fy, hy = body(a, end)
        top, face = _proj(cam, look, fov, (x, hy, z)), _proj(cam, look, fov, (x, fy, z))
        tag = ' at the end' if end else ''
        if not top or not face: W.append(f'b{beat}: {who} behind the lens{tag}'); continue
        if line and top[1] < 0.27: W.append(f'b{beat}: {who} head top at {top[1]:.2f} (lyric rows){tag}')
        if face[0] < 0.12 or face[0] > 0.88: W.append(f'b{beat}: {who} face x {face[0]:.2f} (edge){tag}')
        if face[1] > 0.82 or face[1] < 0.0: W.append(f'b{beat}: {who} face y {face[1]:.2f}{tag}')
def _occl(cam, look, fov, pts):
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
# ---- the set: a lens stays inside the warehouse (or in the alley), clear of the crates, drums, forklift and columns ----
BOXES = [(-8.5, -7.3, -6.2, -3.5, 3.1), (7.3, 8.5, -6.1, -4.9, 2.1), (-8.4, -7.2, 4.8, 6.0, 2.1), (7.3, 8.5, 5.6, 6.8, 3.1), (-6.7, -5.5, -6.5, -5.3, 1.1),
         (7.0, 8.7, -3.3, -1.0, 1.1), (-8.7, -7.1, 0.9, 3.5, 1.1), (6.4, 8.4, 2.6, 4.6, 2.6)]
COLS = [(-6.6, -4.2), (6.6, -4.2), (-6.6, 2.8), (6.6, 2.8), (-6.6, 7.6), (6.6, 7.6)]
def free(c, m='in'):
    x, y, z = c
    if m == 'alley': return -5.7 < x < 5.7 and -18.5 < z < -7.3 and 0.15 < y < 6.0
    if any(x0 - 0.1 < x < x1 + 0.1 and z0 - 0.1 < z < z1 + 0.1 and y < top + 0.1 for x0, x1, z0, z1, top in BOXES): return False
    if any(math.hypot(x - cx, z - cz) < 0.35 for cx, cz in COLS): return False
    return -8.7 < x < 8.7 and -6.75 < z < 8.7 and 0.12 < y < 6.2
def lens(v, k=0):
    c, f = v; a = math.radians(c['ang'][k]); fy = f[2] if len(f) > 2 else 0
    return (f[0] + math.sin(a) * c['r'][k], c['h'][k] + fy, f[1] + math.cos(a) * c['r'][k])
def problems(beat, b1, actors, v, m, W):
    c, focus = v; fy = focus[2] if len(focus) > 2 else 0
    for k, end in ((0, 0), (-1, 1)):
        cam, look = lens(v, k), (focus[0], c['look'][k] + fy, focus[1])
        check(beat, b1, cam, look, c['fov'], actors, end, W)
        for oc in _occl(cam, look, c['fov'], [body(a, end)[:4] for a in actors if not a.get('lying') and not a.get('fg') and not a.get('away')]):
            W.append(f'b{beat}: {oc}{" at the end" if end else ""}')
        if not free(cam, m): W.append(f'b{beat}: lens outside the set{" at the end" if end else ""} {tuple(round(q, 2) for q in cam)}')
    return W
def clear_for(v, actors):                        # gang pets off the lens and off its lines to the actors' faces
    pts = []
    for k, end in ((0, 0), (-1, 1)):
        cam = lens(v, k); pts.append([round(cam[0], 2), round(cam[2], 2), 1.1])
        for a in actors:
            if a.get('fg'): continue
            _, x, z, fy, _h = body(a, end)
            d = math.dist((cam[0], cam[2]), (x, z)); n = max(1, int(d / 0.5))
            for i in range(1, n + 1):
                u = i / n
                if u > 0.92: break
                pts.append([round(cam[0] + (x - cam[0]) * u, 2), round(cam[2] + (z - cam[2]) * u, 2), 0.5])
    return pts
shots = []; REV = []
def add(beat, b1, actors, lyric, v, m='in', rv=None, **o):
    c, focus = v
    o = {k: val for k, val in o.items() if val is not None}
    REV.append(round(beat * PER + PER + (rv if rv is not None else 0.6 * (b1 - beat) * PER), 2))
    o['clear'] = o.get('clear', []) + clear_for(v, actors)
    if m == 'alley': o.setdefault('zone', 'alley')
    shots.append({'beat': beat, 'kind': 'dance', 'map': 'rumble', 'actors': actors, 'lyric': lyric, 'cam': c, 'focus': focus, **o})
    problems(beat, b1, actors, v, m, WARN)
def solve(beat, b1, actors, look, ang, dist, h, fov=50, m='in', push=0.08, dang=30, rng=(0.8, 1.6), dh=0.3, **kw):
    best = None
    for da in (0, -5, 5, -10, 10, -15, 15, -20, 20, -25, 25, -30, 30, -40, 40):
        if abs(da) > dang: continue
        for dk in (1.0, 1.1, 0.92, 1.2, 1.3, 1.45, 1.6, 0.85, 0.8):
            if not rng[0] <= dk <= rng[1]: continue
            for dhh in (0, 0.15, -0.15, 0.3, -0.3):
                if abs(dhh) > dh: continue
                a = math.radians(ang + da); d = dist * dk
                p0 = (look[0] + math.sin(a) * d, h + dhh, look[2] + math.cos(a) * d)
                p1 = (look[0] + math.sin(a) * d * (1 - push), h + dhh, look[2] + math.cos(a) * d * (1 - push))
                v = view(p0, look, fov, p1=p1, **kw)
                n = len(problems(beat, b1, actors, v, m, []))
                score = n * 1000 + abs(da) + abs(dk - 1) * 40 + abs(dhh) * 20
                if best is None or score < best[0]: best = (score, v)
                if n == 0 and score < 1: return v
    return best[1]
def clean(actors):
    for a in actors:
        for k in ('lying', 'away'): a.pop(k, None)
    return actors

# ---- the pile at the leaders' feet, growing with every return ----
PILE_SPOTS = [(-0.25, 1.55, 20), (0.3, 1.7, -35), (0.05, 1.25, 80), (-0.45, 1.25, 140), (0.55, 1.3, 10), (-0.1, 1.95, 60), (0.42, 2.0, -70),
              (-0.55, 1.85, 30), (0.15, 1.55, 120), (-0.3, 1.0, -20), (0.7, 1.75, 100), (-0.75, 1.5, -60), (0.25, 0.95, 45), (-0.05, 2.25, 0), (0.85, 1.05, 150), (-0.85, 1.1, 75)]
ORDER = ['stick', 'yarn', 'fish', 'ball', 'frisbee', 'tyre', 'sock', 'bone', 'stick', 'fish', 'yarn', 'ball', 'sock', 'bone', 'stick', 'fish']
def pile(n, balls=True): return [[x, z, ORDER[i], yw] for i, (x, z, yw) in enumerate(PILE_SPOTS[:n]) if balls or ORDER[i] != 'ball']
SQUARE = dict(cats='square', buns='square')

# =====================================================================================================================
# CHORUS 1 (b-1..47): the rumble, the first throw and return, the face-off, the hiss and the thump, the four 'beat it's.
# S00 (b-1..2): the hook: over Kob's shoulder, the bunny gang squared off across the floor with Compote and Sadi, the dog
# in the red jacket dancing in the middle, oblivious
s00 = [A('saxo', 'charleston', 0.0, 2.05, face='camera', yaw=0, at=1.45, speed=1, tongue=True), still('kob', -1.15, 0.45, yaw=100), still('compote', 1.15, 0.45, yaw=-100, hold='stick', holdScale=1.3)]
v = view((0.2, 1.05, 6.0), (0.0, 1.0, 0.7), fov=60, p1=(0.19, 1.03, 5.6), roll=(-6, -3))
GANGS_TIGHT = [[-1.75, -0.25], [-2.05, 0.75], [-1.5, -1.05], [-2.4, -0.6], [1.75, -0.25], [2.05, 0.75], [1.5, -1.05], [2.4, -0.6]]
add(-1, 2, s00, "the hook: the rumble: the alley cats and the bunny gang squared off across the warehouse, their leaders face to face, and in front of them the dog in the red leather jacket dancing, oblivious", v,
    cats='claw', buns='stomp', gspots=GANGS_TIGHT, rv=0.6)
# S01 (b2..5): 'beat it': Compote hurls a stick out of the loading door, at the lens; the dog's eyes on it
s01 = [thrower('compote', 1.25, -0.2, [2.6, 2.2, -6.2], 'stick', yaw=195, tscale=1.05), still('saxo', 0.45, 0.45, yaw=170, tongue=True)]
v = view((1.15, 1.25, -3.4), (1.0, 0.95, 0.0), fov=56, p1=(1.12, 1.25, -3.25))
add(2, 5, s01, "'beat it': Compote hurls a stick out of the loading door; the dog's eyes follow it", v, cats='stare', buns='stare', stare=[0.6, -7.0], rv=0.95)
# S02 (b5..7): he sprints after it, out of the door into the foggy alley, from behind
s02 = [run(0.0, 0.2, 0.25, -4.6, S(7, 5), speed=1.6, away=True)]
v = view((0.6, 0.75, 3.6), (0.0, 1.0, -5.0), fov=56, p1=(0.55, 0.75, 3.4), roll=(4, 6))
add(5, 7, s02, "he sprints after it, out of the door", v, cats='stare', buns='stare', stare=[0.0, -6.0])
# S03 (b7..11): he trots back in through the backlit door with the stick across his jaws, proud
s03 = [run(0.15, -8.9, 0.6, -4.3, S(11, 7), speed=1.1, fetch='stick')]
v = view((1.9, 0.95, -0.9), (0.2, 0.95, -6.6), fov=54, p1=(1.85, 0.95, -1.1))
add(7, 11, s03, "he trots back in through the backlit door with the stick across his jaws, proud", v, cats='stare', buns='stare', stare=[0.4, -5.5])
# S04 (b11..15; 'defeated'): the leaders' face-off, nose to nose in profile, and the dog in front of them with the stick
# in his jaws, tail up: throw it again
s04 = [still('kob', -0.8, 0.25, yaw=90), still('compote', 0.8, 0.25, yaw=-90), A('saxo', 'happy_idle', 0.0, 1.75, face='camera', yaw=0, at=0.4, speed=0.6, fetch='stick', hop=[0.04, 1])]
v = view((0.0, 2.6, 4.7), (0.0, 0.95, 0.9), fov=50, p1=(0.0, 2.55, 4.45))
add(11, 15, s04, "'no one wants to be defeated': the two leaders nose to nose; in front of them the dog with the stick in his jaws, hopping: throw it again", v, **SQUARE)
# S05 (b15..19; 'funky, strong, fight'): the cats' hiss: Kob and her gang claw the air; the dog claws along, a dance
s05 = [A('kob', 'happy_idle', -1.55, 0.4, yaw=95, at=0.3, speed=0.1, arm='both', aim='claw', flapPh=0.5), A('saxo', 'charleston', -0.45, 1.25, face='camera', yaw=0, at=0.7, speed=1, arm='both', aim='claw', upAt=0.6)]
v = solve(15, 19, s05, (-1.0, 0.95, 0.8), 70, 3.6, 1.05, fov=56, push=0.1, rng=(0.85, 1.3))
add(15, 19, s05, "'funky and strong': the cats hiss and claw the air; the dog claws along: he thinks it's a dance", v, cats='claw', buns='square')
# S06 (b19..23): the bunnies' thump (a hop, one hind foot raised, slammed down on the beat); the dog kicks along
s06 = [A('compote', 'male_front_snap_kick_with_the_lead_foot', 1.55, 0.4, yaw=-95, at=round(1.1 - S(21.4, 19), 3), speed=1), A('saxo', 'charleston', 0.95, 1.05, face='camera', yaw=0, at=kick_at(S(21.4, 19)), speed=1, tongue=True)]
v = solve(19, 23, s06, (1.2, 0.95, 0.9), 290, 3.8, 1.05, fov=56, push=0.1, rng=(0.9, 1.3))
add(19, 23, s06, "the bunnies thump their warning, hopping and slamming a foot down; the dog kicks along: he thinks it's a dance", v, cats='square', buns='stomp',
    gspots=[None, None, None, None, [2.3, -0.2], [2.65, 2.05], [2.0, -1.1], [2.9, 0.3]])   # the brown bunny off the line behind his head (its ears stood up out of his crown)
# S07 (b23..27; 'wrong, right'): Kob, deadpan, tosses her ball of yarn out of the door, past the lens
s07 = [thrower('kob', -0.85, -0.3, [-0.15, 1.9, -6.0], 'yarn', yaw=172, tscale=1.0), still('saxo', 0.1, 0.45, yaw=195, tongue=True)]
v = view((-0.6, 1.25, -3.7), (-0.75, 1.0, -0.3), fov=56, p1=(-0.6, 1.25, -3.55))
add(23, 27, s07, "'wrong or right': Kob, deadpan, tosses her ball of yarn out of the door", v, cats='stare', buns='stare', stare=[-0.3, -7.0], rv=0.95, pile=pile(1))
# S08 (b27..31): he's off again, low and dutch
s08 = [run(0.2, 0.0, -0.3, -4.9, S(31, 27), speed=1.6, away=True)]
v = view((-0.5, 0.45, 3.2), (0.0, 1.1, -5.2), fov=58, p1=(-0.45, 0.45, 3.0), roll=(-8, -6))
add(27, 31, s08, "he's off again", v, cats='stare', buns='stare', stare=[0.0, -6.0], pile=pile(1))
# ---- the four 'beat it's (b31..47): a return and a throw each, the pile growing ----
RET = lambda kind, b0, b1, x0=0.2: [run(x0, -8.8, x0 + 0.35, -4.6, S(b1, b0), speed=1.2, fetch=kind)]
DOOR_V = lambda k=0: view((1.9 - k, 0.95, -0.9), (0.2 - 0.3 * k, 0.95, -6.6), fov=54, p1=(1.85 - k, 0.95, -1.1))
# S09 (b31..33): back with the yarn
add(31, 33, RET('yarn', 31, 33), "'beat it': back with the yarn", DOOR_V(), cats='stare', buns='stare', stare=[0.4, -5.5], pile=pile(1))
# S10 (b33..35): a cat flings a fish out of the door: it flies broadside past the lens
s10 = [still('kob', -0.9, -0.15, yaw=185)]
v = view((-1.15, 1.15, -4.0), (-1.6, 1.05, -0.6), fov=52, p1=(-1.15, 1.15, -3.85))
add(33, 35, s10, "a cat flings a fish out of the door: it flies broadside past the lens", v, gmode=['throw', 'stare', 'stare', 'stare', False, False, False, False],
    gspots=[[-1.85, -0.5], [-2.3, 0.4], [-1.4, 0.6], [-2.55, -0.55], None, None, None, None], gface=[-0.6, -7.0],
    throws=[[0.1, 'fish', -1.75, 1.15, -0.75, 0.5, 0.95, -5.4, 0.6, 0.15]], stare=[-0.6, -7.0], pile=pile(2), rv=0.28)
# S11 (b35..37): back with the fish
add(35, 37, RET('fish', 35, 37, -0.2), "'beat it': back with the fish", DOOR_V(0.4), cats='stare', buns='stare', stare=[0.4, -5.5], pile=pile(2))
# S12 (b37..39): Sadi throws him the ball, happily: hearts
s12 = [thrower('sadi', 1.6, 0.9, [2.3, 2.0, -5.0], 'ball', yaw=200, rel=0.55, tscale=1.3)]
v = view((1.05, 1.25, -2.4), (1.5, 0.95, 0.8), fov=54, p1=(1.05, 1.25, -2.25))
add(37, 39, s12, "Sadi throws him the ball, happily (she loves him)", v, cats='stare', buns='stare', stare=[0.6, -7.0], hearts=[[1.6, 1.55, 0.9, 0.1, 1]], heartYaw=180, pile=pile(3), rv=0.68)
# S13 (b39..41): back with the ball
add(39, 41, RET('ball', 39, 41), "'beat it': back with the ball", DOOR_V(), cats='stare', buns='stare', stare=[0.4, -5.5], pile=pile(3))
# S14 (b41..43): Compote, furious, hurls a frisbee
s14 = [thrower('compote', 1.2, -0.3, [2.4, 2.3, -6.4], 'frisbee', yaw=192, rel=0.55, tscale=1.15)]
v = view((1.05, 1.25, -3.5), (1.0, 0.95, -0.1), fov=54, p1=(1.05, 1.25, -3.35))
add(41, 43, s14, "Compote, furious, hurls a frisbee", v, cats='stare', buns='stare', stare=[0.6, -7.0], pile=pile(4), rv=0.68)
# S15 (b43..47): the pile at the leaders' feet (stick, yarn, fish, ball, frisbee), the dog beside it ready for more, from
# a high three-quarter; the leaders' deadpan stares
s15 = [still('kob', -1.05, 0.55, yaw=yaw_to((-1.05, 0.55), (0.0, 1.5))), still('compote', 1.05, 0.55, yaw=yaw_to((1.05, 0.55), (0.0, 1.5))),
       A('saxo', 'charleston', 1.15, 2.2, face='camera', yaw=0, at=1.6, speed=1, tongue=True)]
v = solve(43, 47, s15, (0.1, 0.8, 1.35), -18, 5.0, 2.6, fov=56, push=0.06, rng=(0.9, 1.45), dang=25)
add(43, 47, s15, "the pile at the leaders' feet: stick, yarn, fish, ball, frisbee; the dog beside it, ready for more; their deadpan stares", v, **SQUARE, pile=pile(5), stare=[0.0, 1.5])

# =====================================================================================================================
# VERSE 2 (b47..111): out; the door shut; 'stay'; the dog flap; belly up; the dare and the kick; everyone throws.
# S16 (b47..55; 'leave'; the Short's first frame): side on, both gangs turned to the door, pointing at it, for once
# together; the dog dances in front of them with the stick across his jaws
s16 = [A('saxo', 'charleston', 1.6, -0.35, face='camera', yaw=0, at=0.7, speed=1, fetch='stick')]
v = view((5.3, 1.35, -0.3), (-0.2, 1.0, -0.4), fov=58, p1=(5.1, 1.33, -0.3))
add(47, 55, s16, "'better leave': both gangs turn to the door and point at it, together for once; the dog dances in front of them with the stick in his jaws", v,
    cats='point', buns='point', pointAt=[0.0, -9.0], gspots=[[-0.6, -1.6], [-1.2, -1.5], [-0.3, 0.8], [-1.5, 0.7], [0.3, -1.3], [-0.9, -2.3], [0.45, 0.65], [-1.9, -1.7]], gface=[5.3, -0.3], pile=pile(5))
# S17 (b55..59): he trots out of the door into the alley, from behind
s17 = [run(0.1, -3.4, 0.2, -8.6, S(59, 55), speed=1.0, away=True, fetch='stick')]
v = view((-0.4, 0.8, 1.2), (0.1, 1.0, -8.0), fov=50, p1=(-0.4, 0.8, 0.9))
add(55, 59, s17, "he trots out with the stick, into the foggy alley", v, cats='stare', buns='stare', stare=[0.0, -7.0], pile=pile(5))
# S18 (b59..63): the roll-up door comes down: Compote dusts off her paws
s18 = [A('compote', 'happy_idle', 0.5, -5.3, yaw=10, at=0.3, speed=0.4, arm='both', aim='clap')]
v = view((0.2, 1.15, -1.6), (0.25, 1.45, -6.6), fov=56, p1=(0.2, 1.14, -1.8))
add(59, 63, s18, "the roll-up door slams down behind Compote; she dusts off her paws, satisfied", v, cats=False, buns=False, door=[0.0, 0.45, 1, 0], pile=pile(5), rv=0.9)
# S19 (b63..67; 'stay'): outside, he sits in front of the shut door, the stick across his jaws: he stays
s19 = [A('saxo', 'situps', 0.25, -7.95, yaw=10, at=1.0, speed=0, fetch='stick')]
v = view((-1.0, 1.25, -10.6), (0.25, 0.85, -7.5), fov=52, p1=(-0.96, 1.24, -10.45))
add(63, 67, s19, "'stay': outside the shut door, he sits and stays, the stick across his jaws", v, m='alley', door=0, pile=pile(5))
# S20 (b67..71): inside, the rumble's back on: the leaders square off again
s20 = [still('kob', -0.6, 0.3, yaw=90), still('compote', 0.6, 0.3, yaw=-90)]
v = view((0.35, 1.35, 3.9), (0.0, 1.0, 0.3), fov=50, p1=(0.33, 1.33, 3.7))
add(67, 71, s20, "inside, the rumble's back on: the two leaders square off again", v, cats='claw', buns='stomp', door=0, pile=pile(5))
# S21 (b71..75; 'beat it'): the dog flap bursts open: the dog crawls in with the stick
s21 = [A('saxo', 'crawling_forward_on_hands_and_knees', 0.0, -7.55, yaw=0, mz=0.95, at='auto', speed=0.8, noLie=True, fetch='stick', reveal=0.4)]
v = view((1.3, 0.85, -2.9), (0.0, 0.55, -7.0), fov=56, p1=(1.25, 0.85, -3.05))
add(71, 75, s21, "'beat it': the dog flap bursts open: he crawls back in with the stick", v, cats=False, buns=False, door=0, flap=0.15, pile=pile(5))
# S22 (b75..79): everyone turns and stares at him (over his shoulder, from the door)
s22 = [A('saxo', 'happy_idle', 0.15, -5.6, yaw=10, at=0.4, speed=0.6, fetch='stick', fg=True)]
v = view((0.7, 1.45, -6.6), (0.0, 1.05, 0.3), fov=56, p1=(0.68, 1.43, -6.4))
add(75, 79, s22, "everyone turns and stares at him", v, cats='stare', buns='stare', stare=[0.15, -5.6], door=0, pile=pile(5),
    gspots=[[-1.3, -0.9], [-1.9, -0.2], [-0.8, 0.0], [-2.3, -1.2], [1.3, -0.9], [1.9, -0.2], [0.8, 0.0], [2.3, -1.2]], gface=[0.15, -5.6])
s22[0:0] = [still('kob', -0.65, -1.55, yaw=yaw_to((-0.65, -1.55), (0.15, -5.6))), still('compote', 0.75, -1.55, yaw=yaw_to((0.75, -1.55), (0.15, -5.6)))]
# S23 (b79..87; 'scared', 'show'): he rolls belly up between the leaders: he shows them his belly; they look down at him
s23 = [A('saxo', x=0.0, z=0.9, yaw=0, **BELLY), still('kob', -0.8, 0.1, yaw=yaw_to((-0.8, 0.1), (0.0, 1.6))), still('compote', 0.8, 0.1, yaw=yaw_to((0.8, 0.1), (0.0, 1.6)))]
v = view((0.0, 3.0, 5.0), (0.0, 0.6, 0.45), fov=54, p1=(0.0, 2.92, 4.8))
add(79, 87, s23, "'show them that you're really not scared': he rolls belly up between the leaders, paws in the air, tongue out", v, **SQUARE, door=0, pile=pile(5))
# S24 (b87..94; 'truth or dare'): Compote's dare: she rolls the door up and hurls the bike tyre into the night
s24 = [thrower('compote', 0.6, -2.4, [1.9, 2.4, -8.6], 'tyre', yaw=185, rel=0.8, tscale=1.1, dur=0.9, arc=1.2)]
v = view((0.4, 1.25, -5.9), (0.55, 1.0, -2.2), fov=56, p1=(0.4, 1.24, -5.75))
add(87, 94, s24, "'truth or dare': Compote's dare: the door up, she hurls a bike tyre into the night", v, cats='stare', buns='stare', stare=[0.5, -7.0], door=[0.0, 0.5, 0, 1], pile=pile(5), rv=0.95)
# S25 (b94..99; 'kick'): and kicks the tennis ball after it, side on
s25 = [A('compote', 'male_front_snap_kick_with_the_lead_foot', 0.6, -4.2, yaw=180, at=0.65, speed=1)]
v = view((4.1, 1.0, -5.5), (0.45, 0.85, -4.55), fov=60)
add(94, 99, s25, "'they'll kick you': she kicks the ball out after it, side on", v, cats='stare', buns='stare', stare=[0.5, -7.0],
    throws=[[0.45, 'ball', 0.6, 0.35, -4.75, 0.3, 0.08, -13.0, 1.1, 1.2]], pile=pile(5), rv=0.55)
# S26 (b99..103; 'fair'): he's back: the tyre round his neck, the ball in his jaws
s26 = RET('ball', 99, 103)
add(99, 103, s26, "'tell you it's fair': he's back with the ball", DOOR_V(), cats='stare', buns='stare', stare=[0.4, -5.5], pile=pile(6))
# S27 (b103..111; 'bad'): everyone grabs everything and throws it at once: the volley flies at the lens, big, across the
# middle third (the still at release)
VOLLEY = [[0.55 + 0.04 * i, k, x, 1.1, z, tx, 1.55 + 0.12 * (i % 3), -6.4, 0.6, 0.35] for i, (k, x, z, tx) in enumerate(
    [('stick', -2.2, 0.8, -1.3), ('fish', 2.2, 0.8, 1.3), ('sock', -1.9, -0.6, -0.8), ('bone', 1.9, -0.6, 0.8), ('yarn', -2.8, 0.1, -1.7), ('ball', 2.8, 0.1, 1.7), ('frisbee', -1.3, 0.2, -0.35), ('stick', 1.3, 0.2, 0.4)])]
s27 = [thrower('kob', -0.55, -0.45, [-0.9, 1.7, -6.4], 'sock', yaw=180, rel=0.8), thrower('compote', 0.55, -0.45, [0.9, 1.7, -6.4], 'bone', yaw=180, rel=0.8)]
v = view((0.0, 1.25, -4.6), (0.0, 1.0, 0.0), fov=60, p1=(0.0, 1.22, -4.4))
add(103, 111, s27, "'bad': everyone grabs everything and throws it at once, at the door", v, cats='throw', buns='throw',
    gspots=[[-2.2, 0.8], [-1.9, -0.6], [-2.8, 0.1], [-1.3, 0.2], [2.2, 0.8], [1.9, -0.6], [2.8, 0.1], [1.3, 0.2]], gface=[0.0, -7.0], throws=VOLLEY, pile=pile(6), rv=0.95)

# =====================================================================================================================
# CHORUS 2 (b111..175): the throwing chorus line; the catch; they slow down and drop; the dog dances among the bodies.
LINE = [[-2.1, -0.3], [-1.55, -0.1], [1.55, -0.1], [2.1, -0.3], [-1.85, 0.65], [-1.25, 0.85], [1.25, 0.85], [1.85, 0.65]]
# S28 (b111..115; 'beat it'): the throwing chorus line: both gangs in one row facing the door, every paw up together on
# the beat, the things flying up over their heads (the clip's formation as a volley)
UP = dict(clip='happy_idle', at=0.3, speed=0.1, arm='both', aim='rave', flapEvery=1000, flapPh=90, upAt=-1)
s28 = [A('kob', x=-0.95, z=-0.45, yaw=180, **UP), A('sadi', x=0.0, z=-0.6, yaw=180, **UP), A('compote', x=0.95, z=-0.45, yaw=180, **UP)]
v = view((0.0, 1.55, -5.3), (0.0, 1.05, -0.4), fov=62, p1=(0.0, 1.54, -5.15), roll=(3, 1))
add(111, 115, s28, "the throwing chorus line: both gangs in one row facing the door, every paw up together on the beat, the things flying over their heads", v,
    cats='throw', buns='throw', gspots=LINE, gface=[0.0, -7.0], rv=0.13,
    throws=[[0.02 + 0.02 * j, ['stick', 'fish', 'ball', 'yarn', 'sock', 'bone'][j], -1.9 + 0.75 * j, 1.65, -0.3, -1.6 + 0.65 * j, 2.9, -6.6, 0.8, 0.6] for j in range(6)], pile=pile(6))
# S29 (b115..119): in the alley things rain down round him; he trots back through them with the ball in his jaws
s29 = [run(0.15, -12.6, 0.45, -9.9, S(119, 115), speed=1.1, fetch='ball')]
v = view((0.85, 0.95, -7.6), (0.25, 0.95, -11.2), fov=56, p1=(0.85, 0.95, -7.75))
add(115, 119, s29, "in the alley it rains sticks and fish round him; he trots back through them with the ball in his jaws", v, m='alley', rv=0.55,
    throws=[[0.05, 'stick', -0.6, 3.4, -7.2, -0.9, 0.08, -10.6, 0.7, 0.3], [0.2, 'fish', 0.8, 3.4, -7.2, 1.0, 0.08, -11.3, 0.7, 0.3], [0.35, 'sock', 0.0, 3.4, -7.2, -0.45, 0.08, -11.8, 0.7, 0.3], [0.5, 'yarn', 0.4, 3.4, -7.2, 0.95, 0.13, -10.2, 0.7, 0.3]])
# S30 (b119..127; 'defeated'): back inside, the throwers have sat down on the floor, out of breath (the box pets bent
# double, panting); the dog is back, fresh, kicking
SAT = dict(clip='situps', at=1.0, speed=0, tongue=True)
s30 = [A('saxo', 'charleston', 0.45, 2.45, face='camera', yaw=0, at=kick_at(S(123.8, 119)), speed=1, tongue=True),
       A('kob', x=-1.0, z=0.85, yaw=30, **SAT), A('compote', x=1.0, z=0.85, yaw=-30, **SAT)]
v = solve(119, 127, s30, (0.0, 0.8, 1.45), 50, 4.3, 1.05, fov=56, push=0.06, rng=(0.9, 1.4), dang=25)
add(119, 127, s30, "'no one wants to be defeated': the throwers have sat down on the floor, out of breath, tongues out; the dog is back, fresh, kicking", v,
    cats='pant', buns='pant', gspots=[[-2.0, 0.0], [-2.6, 0.9], [-1.6, -0.9], [-3.1, -0.4], [2.0, 0.0], [2.6, 0.9], [1.6, -0.9], [3.1, -0.4]], pile=pile(9))
# S31 (b127..135; 'funky, strong'): low along the row of throwers dropped flat, from their feet; the dog dances among them
TIRED_SP = [[-2.6, 0.5], [-2.9, 1.5], [-2.5, -1.6], [-3.4, -0.6], [2.3, 0.2], [2.9, 1.3], [1.7, -1.0], [3.3, -0.7]]
TIRED_YAW = [250, 200, 300, 230, 110, 160, 60, 130]
ROW_SP = [[-3.2 + 0.9 * i, 0.55 + (0.12 if i % 2 else 0.0)] for i in range(8)]
s31 = [A('saxo', 'charleston', 0.55, 1.75, face='camera', yaw=0, at=1.6, speed=1, tongue=True)]
v = view((3.9, 0.8, 3.4), (-0.4, 0.55, 0.6), fov=56, p1=(3.75, 0.8, 3.25))
add(127, 135, s31, "'funky and strong': the throwers have dropped flat in a row, chests heaving; the dog dances among them", v,
    gmode=['tired'] * 8, gspots=ROW_SP, gyaw=[0] * 8, pile=pile(9))
# S32 (b135..143; 'wrong, right'): the two leaders, the last ones up, sitting on the floor out of breath; the dog kicks
# in front of them with the ball: again?
s32 = [A('kob', x=-0.85, z=0.3, yaw=20, **SAT), A('compote', x=0.05, z=0.3, yaw=-20, **SAT), A('saxo', 'charleston', 0.75, 1.65, face='camera', yaw=0, at=kick_at(S(139.8, 135)), speed=1, fetch='ball')]
v = view((0.25, 2.2, 5.8), (0.25, 0.8, 0.8), fov=56, p1=(0.25, 2.16, 5.55))
add(135, 143, s32, "'wrong or right': the two leaders, the last ones up, sit down on the floor out of breath; the dog kicks in front of them with the ball: again?", v, gmode=['tired'] * 8, gspots=TIRED_SP, gyaw=TIRED_YAW, pile=pile(9))
# S33 (b143..152; 'beat it'): the dog dances among the bodies, fresh as ever, low (a kick: a standing silhouette)
s33 = [A('saxo', 'charleston', 0.9, 2.6, face='camera', yaw=0, at=kick_at(S(148.4, 143)), speed=1, tongue=True)]
v = view((1.15, 0.55, 5.9), (0.8, 1.1, 1.5), fov=60, p1=(1.13, 0.55, 5.6), roll=(-7, -4))
add(143, 152, s33, "'beat it': the dog dances among the bodies, fresh as ever", v, gmode=['tired'] * 8, gspots=TIRED_SP, gyaw=TIRED_YAW, pile=pile(12))
# S34 (b152..159; 'defeated'): a high three-quarter: everyone flat on the floor, the dog dancing by the pile, paws up
s34 = [A('saxo', 'charleston', 0.0, 2.45, face='camera', yaw=0, at=1.6, speed=1, tongue=True, arm='both', aim='rave', flapEvery=1000, flapPh=90, upAt=-1),
       A('kob', x=-1.0, z=0.4, yaw=0, **FLAT), A('compote', x=1.0, z=0.4, yaw=0, **FLAT)]
v = view((0.0, 3.6, 5.6), (0.0, 0.55, 1.4), fov=56, p1=(0.0, 3.5, 5.4))
add(152, 159, s34, "'no one wants to be defeated': everyone flat on the floor, the dog dancing in the middle by the pile, paws up", v,
    gmode=['tired'] * 8, gspots=TIRED_SP, gyaw=TIRED_YAW, pile=pile(12))
# S35 (b159..166; 'funky, strong'): Sadi, the only one still standing, throws the ball for him again, hearts; he's off
s35 = [thrower('sadi', 1.6, 0.9, [2.3, 2.0, -5.0], 'ball', yaw=200, rel=0.55, tscale=1.3)]   # [fallback after three loops: S12's passed throw, the callback]
v = view((1.05, 1.25, -2.4), (1.5, 0.95, 0.8), fov=54, p1=(1.05, 1.25, -2.25))
add(159, 166, s35, "Sadi, the only one still standing, throws the ball for him again: she loves it", v, gmode=['tired'] * 4 + [False] * 4, gspots=TIRED_SP, gyaw=TIRED_YAW,
    hearts=[[1.6, 1.55, 0.9, 0.1, 1]], heartYaw=180, pile=pile(12), rv=0.68)
# S36 (b166..175; 'wrong, right'): he drops the ball on Kob, flat on her back; her deadpan, upside down
KOBFLAT = dict(clip='laying_idle', at=1.0, speed=0, lying=True)
s36 = [A('kob', x=-1.6, z=-0.6, yaw=0, **KOBFLAT), A('saxo', 'happy_idle', -0.65, -0.55, face='camera', yaw=0, at=0.4, speed=0.6, tongue=True, hop=[0.04, 1])]
v = view((-1.35, 3.0, 2.35), (-1.1, 0.55, -0.55), fov=54, p1=(-1.33, 2.95, 2.25))
END = dict(gmode=[False] * 4 + ['tired'] * 4, gspots=TIRED_SP, gyaw=TIRED_YAW, pile=pile(12, balls=False))
add(166, 175, s36, "'wrong or right': he drops the ball on Kob, flat on her back, and waits, tail up", v, **END,
    throws=[[0.1, 'ball', -0.65, 0.95, -0.15, -1.6, 0.42, -0.55, 0.35, 0.15]])
# S37 (b175..182; the tag 'beat it'): she flicks it ten centimetres with one claw; he pounces on it, proud
s37 = [A('kob', x=-1.6, z=-0.6, yaw=0, **{**KOBFLAT, 'arm': 'R', 'aim': [0.35, 0.6, 0.5], 'upAt': 0.85}), A('saxo', 'happy_idle', -0.65, -0.55, face='camera', yaw=0, at=0.4, speed=0.6, tongue=True, fetch={'kind': 'ball', 'at': 1.75})]
add(175, 182, s37, "'beat it': she flicks it ten centimetres with one claw; he pounces on it, proud", v, **END,
    throws=[[1.0, 'ball', -1.6, 0.42, -0.55, -0.95, 0.13, -0.2, 0.5, 0.18, True]])
# S38 (b182..183; the silent beat): the button: he drops it on her again; nobody moves
s38 = [A('kob', x=-1.6, z=-0.6, yaw=0, **KOBFLAT), A('saxo', 'happy_idle', -0.65, -0.55, face='camera', yaw=0, at=0.4, speed=0, holdAt=0, tongue=True)]
add(182, 183, s38, "the button: silence; the ball on the cat again; nobody moves", v, **END, still=True,
    throws=[[-1, 'ball', -1.6, 0.42, -0.55, -1.6, 0.42, -0.55, 0.1, 0.0]])

for s in shots:
    clean(s['actors'])
shots.sort(key=lambda x: x['beat'])
ep = {
    'date': '2026-10-12', 'song': {'title': 'Beat It', 'artist': 'Michael Jackson'},
    'logline': "The alley cats and the bunny gang meet in a warehouse for a rumble, and every time someone tells the dog in the red jacket to beat it, they throw something out of the door and he brings it back, until both gangs drop flat on the floor and the dog wants more.",
    'new': "src/maps43.js: rumble (a warehouse at night in the clip's teal light: a stained concrete floor, corrugated walls over a brick dado, a hazard-striped loading door that rolls up and down (`door`) with a dog flap (`flap`), the foggy alley outside behind a chain-link fence and a street lamp, crates, drums, a forklift, a gantry; two gangs of box pets, alley cats in black leather and bunnies in purple denim, with modes: square, claw, stomp, point, throw, stare, pant, tired, dance, cheer; things thrown on parabolas (`throws`) and the pile of fetched things (`pile`)); src/fetch.js (a stick, a tennis ball, a fish, a ball of yarn, a frisbee, a bone, a sock, a bike tyre); the actor field `fetch` (a thing carried in the jaws); looks saxo redjacket and kob greaser; the structure FETCH",
    'notes': "The world, from the official video (contact sheets of its verse and its closing dance, never the fight): rival gangs at night, a backlit alley behind a chain-link fence in smoke, a long corridor to a bright door, a dark warehouse in teal light and fog where the singer in a red leather jacket dances both gangs into one formation. Our version: the rumble in the warehouse, and the title taken the way a dog takes it: 'beat it' means go away, so they throw something out of the door to get rid of him, and he brings it back, every time. The words, from whitelisted keywords per line: the title on every chorus line, 'defeated', 'fight', 'funky', 'strong', 'wrong', 'right', 'leave', 'stay', 'scared', 'show', 'truth', 'dare', 'kick', 'fair', 'bad'. Cast: Saxo in the singer's red jacket (the dog who never tires of fetch), Kob the alley cats' leader in black leather (deadpan; her lazy flick is the button), Compote the bunny gang's leader in her punk jacket (furious: the hardest throws, the dare, the kick), Sadi in the bunny gang in denim (the romance: the only one who loves throwing for him).",
    'yt': 'end',
    'tiktok_sound': '6696417475073935361',
    'with': ['sadi', 'kob', 'compote'],
    'clips': sorted({a['clip'] for s in shots for a in s['actors']}),
    'tags': {'structure': 'fetch', 'scenes': ['the rumble', 'the throw out of the door', 'the sprint out', 'the return with it in his jaws', 'the face-off with a dog between', 'the hiss danced along', 'the thump danced along', 'the pile of fetched things', 'everyone points at the door', 'the door shut', 'stay', 'the dog flap', 'belly up', 'the dare', 'the kick', 'the volley', 'the throwing chorus line', 'the catch', 'the throwers collapse', 'the dog dances among the bodies', 'the lazy flick'],
             'cast': ['saxo', 'sadi', 'kob', 'compote'], 'hook': 'dance', 'maps': ['rumble'], 'ref': 'none',
             'lyric_literal': "'beat it' (every one a throw out of the door, every one brought back), 'defeated' (the leaders' face-off; the throwers out of breath), 'funky and strong is your fight' (the cats' hiss and the bunnies' thump, which the dog dances along to), 'leave' (everyone points at the door), 'stay' (he sits outside the shut door), 'show them that you're really not scared' (he shows them his belly), 'truth or dare' (Compote's dare: the tyre), 'kick' (she kicks the ball out)",
             'experiment': "Now that the Shorts are barely shown (10, 6 and 6 views on the last three), does a single pet universal repeated on every title word (every 'beat it' is a throw the dog brings back: the dog who never tires of fetch) get more views on Facebook and Instagram, now our main platforms, than the last three episodes there (Facebook ~200, Instagram ~140)?"},
    'shots': shots,
}
json.dump(ep, open(os.path.join(HERE, '2026-10-12.json'), 'w'), indent=1, ensure_ascii=False)
os.makedirs(os.path.join(HERE, '..', 'out', 'check'), exist_ok=True)
open(os.path.join(HERE, '..', 'out', 'check', 'beatit_rev_times.txt'), 'w').write(','.join(f'{t:.2f}' for t in REV))
print(len(shots), 'shots;', len(WARN), 'warnings')
for w in WARN: print('  ', w)
