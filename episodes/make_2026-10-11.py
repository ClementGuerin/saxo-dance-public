# The "Dracula" episode (2026-10-11; Tame Impala & JENNIE, "Dracula (JENNIE Remix)"): writes episodes/2026-10-11.json.
# Kit 2026-10-11: 66.776 s = 128 beats at 115.0108 BPM, pre-chorus 1, verse 2, pre-chorus 2 and chorus 1.
# The world (the official video, contact sheets every 3 s): a lonely farmhouse at night under string lights, a man in
# white on a dark road, a big rig pulling up in clouds of smoke with its lights blazing, a crowd dancing in the dust in
# its headlights, and at dawn the house hauled away on a truck. The words (whitelisted keywords per line, never the
# text): a night that must never leave, never seeing the light of day, late, back to the dark, a car, friends, shut,
# love; the chorus: run from the sunlight, Dracula.
# The story (structure WEAKNESS, new): Dracula Saxo's all-night party at his farmhouse must never see the light of day.
#   1 (pre-chorus 1, b0-32, night): the party in the string-lit yard under the moon: Saxo the count dances, Sadi the
#     vampire and Compote the mummy with him, costumed guests all round; Kob, the countess, never goes out: she sits
#     on the red sofa inside with her goblet by the grandfather clock, then comes to the door holding up a ringing
#     alarm clock ('late', 'time'); he waves her off and dances on.
#   2 (verse 2, b32-64, first light): the sky goes pink over the hills: they run back into the dark house ('run back
#     to the dark'); a big rig rolls in out of the smoke, headlights blazing; inside the party goes on, Compote slams
#     the door ('shut'); outside the trucker bulldog hooks a chain onto the house while Saxo dances past the window
#     (nobody inside sees); Saxo goes for Sadi's neck like a count... and licks her cheek like a dog ('love').
#   3 (pre-chorus 2, b64-91, dawn closing in): the clock nears six; Saxo and Compote board up the windows with
#     hammers on the beat ('never leave'); they dance on in the candlelight; six o'clock, a line of light under the
#     door; the first ray pierces a gap in the planks.
#   4 (chorus, b91-128, sunrise): on every 'run' a run from the sunlight: the first beam lands at Saxo's feet and he
#     leaps away; his Dracula pose on 'Dracula'; the beams multiply and they hop between the stripes; Kob strolls into
#     one and lies down in it (the cat in the sunbeam); the planks fall, the light pours in, the three cram into the
#     last dark corner by the coffins; outside the rig pulls away, the chain snaps tight... and the house is gone,
#     towed off down the track (the clip's ending): the three stand in full sun on the bare floor, frozen in their
#     vampire poses on the last 'Dracula'. The button: they flop down beside Kob, belly up in the sun (pets).
import json, math, os, re, sys
sys.path.insert(0, os.path.dirname(__file__))
from cam import view, swoop, low, deadpan, above

HERE = os.path.dirname(__file__)
PER = 60 / 115.0108
def Bt(t): return t / PER
def S(b, b0): return round((b - b0) * PER, 3)    # seconds from shot beat b0 to beat b

LOOK = {'saxo': 'dracula', 'sadi': 'vampire', 'kob': 'countess', 'compote': 'mummy'}
HEAD = {'saxo': 1.46, 'sadi': 1.38, 'kob': 1.47, 'compote': 1.5}       # the top of each head standing (hair, bow, ears)
FACE = {'saxo': 0.9, 'sadi': 0.84, 'kob': 0.86, 'compote': 0.86}
RAD = {'saxo': 0.48, 'sadi': 0.45, 'kob': 0.42, 'compote': 0.42}

# ---- the map (src/maps41.js, FARMHOUSE) ----
X0, X1, Z0, Z1, HH = -4.6, 4.6, -3.8, 3.8, 3.4                     # the room
DOOR = (0.0, 3.8)
CLOCK, SOFA, SOFA_Y = (-0.66, -3.5), (1.15, -3.2), 0.42
COFFINS = [(-4.3, -2.35), (-4.3, -1.25), (-4.3, -0.15)]
TABLE, CANDLES = (-3.8, 2.35), [(-1.75, -3.35), (2.95, -3.35)]
TRUCK_X, TRUCK_Z = -6.6, 0.3
POLES = [(-7, 5.2), (7, 5.2), (-7, 13.6), (7, 13.6)]
KOB_SEAT = (0.42, -3.07)                                            # Kob on the sofa's left end, beside the clock
# the sunbeams' floor stripes (centres), in the order they come in (BEAM_ORDER [5, 2, 4, 1, 3, 0])
STRIPES = [(-1.63, 0.13), (-1.63, -3.12), (-0.49, 0.38), (-0.49, -2.87), (0.66, 0.63), (0.66, -2.62)]
CORNER = [(-3.2, -2.3), (-3.72, -1.55), (-2.66, -3.06)]              # the last dark corner by the coffins: saxo, sadi, compote, in a row across the lens's line (from +x+z)

def A(who, clip, x, z, **o):
    return {'who': who, 'look': o.pop('look', LOOK[who]), 'clip': clip, 'x': round(x, 3), 'z': round(z, 3), 'face': o.pop('face', 'world'),
            'yaw': o.pop('yaw', 0), 'at': o.pop('at', 'auto'), **o}
def yaw_to(frm, to): return round(math.degrees(math.atan2(to[0] - frm[0], to[1] - frm[1])), 1)
CLAW = dict(aim='claw', arm='both', flap=0, upAt=-1)               # the monster pose: paws raised beside the head, claws forward (held)
GASP = dict(arm='both', aim=[0.25, 0.55, 0.55], upAt=-1)           # paws up to the cheeks
RAVE = dict(aim='rave', arm='both', flapEvery=1000, flapPh=90, upAt=-1)   # both paws up, pinned at the swing's peak
GOBLET = dict(hold='goblet', arm='R', aim=[0.35, 0.05, 0.55], upAt=-1, holdScale=1.4)
SEAT = dict(lift=SOFA_Y, clip='sitting_talking', at=0.05, speed=0)

# ---- a projection check (numbers only): where each face lands in the 9:16 frame at the shot's start and end ----
def _proj(cam, look, fov, pt):
    f = [look[i] - cam[i] for i in range(3)]; n = math.sqrt(sum(v * v for v in f)); f = [v / n for v in f]
    r = [-f[2], 0.0, f[0]]; rn = math.sqrt(r[0] ** 2 + r[2] ** 2) or 1; r = [r[0] / rn, 0.0, r[2] / rn]
    u = [r[1] * f[2] - r[2] * f[1], r[2] * f[0] - r[0] * f[2], r[0] * f[1] - r[1] * f[0]]
    d = [pt[i] - cam[i] for i in range(3)]; z = sum(a * b for a, b in zip(d, f))
    if z <= 0.05: return None
    tv = math.tan(math.radians(fov) / 2); th = tv * 9 / 16
    return (0.5 + sum(a * b for a, b in zip(d, r)) / z / th / 2, 0.5 - sum(a * b for a, b in zip(d, u)) / z / tv / 2)
_src = open(os.path.join(HERE, '2026-10-11.lyrics.js')).read()
_rows = json.loads(re.search(r'window\.LYRICS = (.*?);\n', _src).group(1)); _ends = json.loads(re.search(r'window\.LINE_END = (.*?);\n', _src).group(1))
LINES = [(Bt(row[0][0] - 0.35), Bt(e)) for row, e in zip(_rows, _ends)]
def has_line(b0, b1): return any(a < b1 and b > b0 for a, b in LINES)
WARN = []
def body(a, end):                                # (who, x, z, face y, head top y) at the shot's start (0) or end (1)
    who = a['who']; sc = a.get('scale', 1)
    x, z = a['x'] + a.get('mx', 0) * end, a['z'] + a.get('mz', 0) * end
    lift = a.get('lift', 0) + (a.get('my', 0) if end else 0)
    L = math.radians(a.get('lean', 0)); yw = math.radians(a.get('yaw', 0)); fx, fz = math.sin(yw), math.cos(yw)
    fy, hy = FACE[who] * sc, HEAD[who] * sc
    if a.get('clip') == 'sitting_talking': fy, hy = fy - 0.16, hy - 0.16    # seated: the hips 0.16 m lower than standing
    return (who, x + fx * (fy + lift) * math.sin(L), z + fz * (fy + lift) * math.sin(L), (fy + lift) * math.cos(L), (hy + lift) * math.cos(L))
def check(beat, b1, cam, look, fov, actors, end, W=None):
    W = WARN if W is None else W
    line = has_line(beat, b1)
    for a in actors:
        if a.get('fg') or a.get('reveal', 0) >= 1.0 or a.get('lying') or a.get('away'): continue
        who, x, z, fy, hy = body(a, end)
        top, face = _proj(cam, look, fov, (x, hy, z)), _proj(cam, look, fov, (x, fy, z))
        tag = ' at the end' if end else ''
        if not top or not face: W.append(f'b{beat}: {who} behind the lens{tag}'); continue
        if line and top[1] < 0.27: W.append(f'b{beat}: {who} head top at {top[1]:.2f} (lyric rows){tag}')
        if face[0] < 0.12 or face[0] > 0.88: W.append(f'b{beat}: {who} face x {face[0]:.2f} (edge){tag}')
        if face[1] > 0.82 or face[1] < 0.0: W.append(f'b{beat}: {who} face y {face[1]:.2f}{tag}')
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

# ---- the set: a lens inside the room stays in it, clear of the furniture; outside, clear of the house, the rig, the poles ----
FURN = [(-1.06, -0.26, -3.76, -3.24, 2.45), (-0.15, 2.45, -3.65, -2.75, 1.2), (-4.62, -3.9, -2.8, 0.3, 2.0), (-4.18, -3.42, 1.65, 3.05, 1.0),
        (-1.98, -1.52, -3.58, -3.12, 1.6), (2.72, 3.18, -3.58, -3.12, 1.6)]
def free(c, m):
    x, y, z = c
    if any(x0 - 0.12 < x < x1 + 0.12 and z0 - 0.12 < z < z1 + 0.12 and y < top + 0.12 for x0, x1, z0, z1, top in FURN): return False
    if m == 'in': return X0 + 0.15 < x < X1 - 0.15 and Z0 + 0.15 < z < Z1 - 0.15 and 0.12 < y < HH - 0.15
    if y < 0.12: return False
    if m == 'out' and X0 - 0.4 < x < X1 + 0.4 and Z0 - 0.4 < z < Z1 + 0.6 and y < 6.0: return False
    if -15.0 < x < -6.3 and -1.1 < z < 1.7 and y < 4.6: return False   # the rig
    if any(math.hypot(x - px, z - pz) < 0.35 for px, pz in POLES): return False
    return -40 < x < 40 and -40 < z < 16.3
HOUSE_BOX = (-4.76, 4.76, 0.0, 5.6, -3.96, 3.96)          # x0, x1, y0, y1, z0, z1: the standing house blocks every outside lens's view through it
RIG_BOX = (-15.0, -6.4, 0.0, 4.4, -1.0, 1.6)
def _seg_box(p, q, b):                           # does the segment p-q cross the box (slab test)?
    t0, t1 = 0.0, 1.0
    for i, (lo, hi) in enumerate(((b[0], b[1]), (b[2], b[3]), (b[4], b[5]))):
        d = q[i] - p[i]
        if abs(d) < 1e-9:
            if not lo < p[i] < hi: return False
            continue
        a, c = (lo - p[i]) / d, (hi - p[i]) / d
        if a > c: a, c = c, a
        t0, t1 = max(t0, a), min(t1, c)
        if t0 > t1: return False
    return True
def clear_for(v, actors):                        # guests off the lens (start and end) and off its lines to the actors' faces
    pts = []
    for k, end in ((0, 0), (-1, 1)):
        cam = lens(v, k); pts.append([round(cam[0], 2), round(cam[2], 2), 1.3])
        for a in actors:
            if a.get('fg'): continue
            _, x, z, fy, _h = body(a, end)
            d = math.dist((cam[0], cam[2]), (x, z)); n = max(1, int(d / 0.6))
            for i in range(1, n + 4):                # from the lens to the face, then 1.8 m beyond it
                u = i / n; pts.append([round(cam[0] + (x - cam[0]) * u, 2), round(cam[2] + (z - cam[2]) * u, 2), 0.7])
    return pts
shots = []
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
        if not free(cam, m): W.append(f'b{beat}: lens inside the set{" at the end" if end else ""} {tuple(round(q, 2) for q in cam)}')
        for a in actors:                         # an outside lens sees no one through the standing house or the rig
            if a.get('fg') or a.get('lying') or a.get('away') or m not in ('out', 'open'): continue
            _, ax, az, afy, _h = body(a, end)
            if (m == 'out' and _seg_box(cam, (ax, afy, az), HOUSE_BOX)) or _seg_box(cam, (ax, afy, az), RIG_BOX): W.append(f'b{beat}: {a["who"]} hidden by the house or the rig{" at the end" if end else ""}')
    return W
def add(beat, b1, actors, lyric, v, m='out', **o):
    c, focus = v
    o = {k: val for k, val in o.items() if val is not None}
    if m == 'in': o.setdefault('inside', True)
    o['clear'] = o.get('clear', []) + clear_for(v, actors)
    if all(a['x'] == -30.0 and a.get('fg') for a in actors): o.setdefault('stars', ['saxo'])
    if m == 'win': m = 'open'                     # a lens looking in through a window: no line check against the house
    shots.append({'beat': beat, 'kind': 'dance', 'map': 'farmhouse', 'actors': actors, 'lyric': lyric, 'cam': c, 'focus': focus, **o})
    problems(beat, b1, actors, v, m, WARN)
def solve(beat, b1, actors, look, ang, dist, h, fov=50, m='out', push=0.08, dang=30, rng=(0.8, 1.7), dh=0.3, **kw):
    """a lens round the look point (x, y, z): the preferred direction ang (deg, 0 = +z), distance and height; the
    nearest candidate with no framing, occlusion or set problem wins (else the one with the fewest)"""
    best = None
    for da in (0, -5, 5, -10, 10, -15, 15, -20, 20, -25, 25, -30, 30, -40, 40):
        if abs(da) > dang: continue
        for dk in (1.0, 1.1, 0.92, 1.2, 1.3, 1.45, 1.6, 1.7, 0.85, 0.8):
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
def hidden(who='kob', x=-30.0, z=30.0):          # an actor parked out of every frame (the engine needs one; fg: the QA skips its framing)
    return A(who, 'happy_idle', x, z, at=0.3, speed=0.1, fg=True)

NIGHT = dict(zone='night')
YARD_RING = dict(gather=[0.0, 7.7, 2.9, 45, 315, 14, 140, 220])   # the guests round the dancers: a gap towards +z (the lenses) and none straight behind them (a guest behind a head grows out of it)

# =====================================================================================================================
# ACT 1, pre-chorus 1 (b0-32): the party in the yard at night.
# The button's frame (S32), also the cold open (S00): the four lie side by side on the sunlit boards (off the dark rug:
# the critic read the rug in flat light as a nap), belly up, paws in the air, the 'deal with it' shades on. Seen high
# from their feet's side and 24 deg off their line, so the bodies run diagonal (straight on, side-by-side lying bodies
# read as standing)
LIE = dict(clip='laying_idle', at=1.0, speed=0, aim=[0.3, 0.7, 0.65], arm='both', upAt=-1, lying=True)
ROW_Z = 2.9
def sunbath():
    return [A('saxo', x=0.95, z=ROW_Z, yaw=0, tongue=True, shades=True, **LIE), A('kob', 'laying_idle', 0.0, ROW_Z, yaw=0, at=1.0, speed=0, lying=True, shades=True),
            A('sadi', x=-0.95, z=ROW_Z, yaw=0, tongue=True, shades=True, **LIE), A('compote', x=-1.9, z=ROW_Z, yaw=0, shades=True, **LIE)]
def SUN_V(): return view((1.36, 3.97, 7.1), (-0.475, 0.3, 2.15), fov=66, p1=(1.31, 3.89, 6.97))
SUN_FLAGS = dict(m='open', zone='sunrise', tow=[-10, 0.01, 16], noguests=True, truck=False, clock=6.1, candles=False, heartYaw=24, strings=False, key=[-0.5, 2.6, 4.2, 1.25, 1.0, 0.6])
# S00 (b0-1.5) the cold open: the count sunbathing in shades, close, from above his feet (how did he get here?), then a
# white flash into the night before
add(0, 1.5, sunbath()[:1], "the cold open: the vampire count sunbathing in shades on bare boards in full sun, belly up, tongue out, hearts rising", view((1.0, 2.6, 5.05), (0.95, 0.25, 2.7), fov=54, p1=(1.0, 2.5, 4.9)), hearts=[[0.95, 0.9, 2.6, -0.5, 1]], **{**SUN_FLAGS, 'heartYaw': 0})
# S01 the hook (b1.5-4; hope b3.1), flashed in from the cold open: a swoop from over the string lights down to the count dancing the charleston in his
# yard, the costumed guests dancing round him; behind his head the plain clapboard (the dark doorway sat on his hair)
s01 = [A('saxo', 'charleston', 1.25, 7.6, at=round(1.5 * PER, 3), speed=1)]
v = swoop([(1.8, 3.1, 12.9), (1.5, 1.3, 10.6), (1.4, 0.62, 9.85)], (1.25, 0.9, 7.6), fov=62, roll=(-3, -12, -4))
add(1.5, 4, s01, "the hook: a swoop down through the string lights to Dracula Saxo dancing the charleston in his farmhouse yard at night, costumed guests round him", v, **NIGHT, gather=[1.25, 7.7, 2.9, 45, 315, 14, 150, 210], flashAt=[0])
# S02 (b4-8): the trio: Sadi the vampire and Compote the mummy dance either side of him, from the dirt
s02 = [A('saxo', 'charleston', 0.0, 7.6, at=1.3, speed=1), A('sadi', 'shimmy', -1.05, 7.3, yaw=12, at=0.5, speed=1), A('compote', 'twist', 1.05, 7.3, yaw=-12, at=0.9, speed=1)]
v = solve(4, 8, s02, (0.0, 0.95, 7.45), 4, 4.7, 0.6, fov=60, roll=(-6, -3))
add(4, 8, s02, "Sadi the vampire and Compote the mummy dance either side of him", v, **NIGHT, **YARD_RING)
# S03 (b8-12; K01 from b8.05): inside, Kob the countess, who never goes out, on the red sofa with her goblet beside the
# grandfather clock (2 a.m.), deadpan
s03 = [A('kob', **SEAT, x=KOB_SEAT[0], z=KOB_SEAT[1], **GOBLET)]
v = deadpan((0.05, -3.07), 1.18, 3.0, fov=52, push=0.1)
add(8, 12, s03, "inside, Kob the countess, who never goes out, deadpan on the red sofa with her goblet, beside the grandfather clock", v, m='in', clock=2.1)
# S04 (b12-16; never b12.2, leave b13.2, never b14.6, leave b14.8): 'never leave': the party will never end: the guests
# cheer in a ring behind the trio, from high over the yard
s04 = [A('saxo', 'charleston', 0.0, 7.6, at=0.7, speed=1), A('sadi', 'happy_idle', -1.05, 7.3, at=0.3, speed=0.1, aim='rave', arm='both', flapEvery=1000, flapPh=90, upAt=-1, hop=[0.06, 1], air=True), A('compote', 'happy_idle', 1.05, 7.3, at=0.3, speed=0.1, aim='rave', arm='both', flapEvery=1000, flapPh=90, upAt=-1, hop=[0.06, 1], air=True)]
v = solve(12, 16, s04, (0.0, 0.85, 7.5), 30, 4.8, 2.0, fov=58)
add(12, 16, s04, "'never leave': the party will never end: the trio dances, the guests cheer round them", v, **NIGHT, guests='cheer', gather=[0.0, 7.6, 3.3, 120, 300, 14, 195, 225])
# S05 (b16-20; ever b17.2, see b17.9): Saxo and Sadi dance face to face under the lights
s05 = [A('saxo', 'charleston', 0.5, 7.6, yaw=-50, at=0.2, speed=1), A('sadi', 'happy_idle', -0.55, 7.6, yaw=50, at=0.3, speed=0.1, aim='rave', arm='both', flapEvery=1000, flapPh=90, upAt=-1, hop=[0.06, 1], air=True)]
v = solve(16, 20, s05, (0.0, 0.95, 7.6), 0, 4.2, 0.95, fov=56)
add(16, 20, s05, "Saxo and Sadi dance face to face under the string lights", v, **NIGHT, gather=[0.0, 7.7, 3.3, 110, 250, 14, 165, 195])
# S06 (b20-24; light b20.4, day b21.9) [fallback: S04's passed setup]: the trio dances on, the guests cheering in a ring
# behind them (the Short opens here, on a dance)
s06 = [A('saxo', 'charleston', 0.0, 7.6, at=1.45, speed=1), A('sadi', 'happy_idle', -1.05, 7.3, at=0.3, speed=0.1, aim='rave', arm='both', flapEvery=1000, flapPh=90, upAt=-1, hop=[0.06, 1], air=True), A('compote', 'happy_idle', 1.05, 7.3, at=0.3, speed=0.1, aim='rave', arm='both', flapEvery=1000, flapPh=90, upAt=-1, hop=[0.06, 1], air=True)]
v = solve(20, 24, s06, (0.0, 0.85, 7.5), 30, 4.8, 2.0, fov=58)
add(20, 24, s06, "'light of day': the party dances on in the yard, the guests cheering round them", v, **NIGHT, guests='cheer', gather=[0.0, 7.6, 3.3, 120, 300, 14, 195, 225])
# Short opens here, on a dance)
s06 = [A('saxo', 'charleston', 0.0, 7.6, at=1.45, speed=1), A('sadi', 'happy_idle', -1.05, 7.3, at=0.3, speed=0.1, aim='rave', arm='both', flapEvery=1000, flapPh=90, upAt=-1, hop=[0.06, 1], air=True), A('compote', 'happy_idle', 1.05, 7.3, at=0.3, speed=0.1, aim='rave', arm='both', flapEvery=1000, flapPh=90, upAt=-1, hop=[0.06, 1], air=True)]
v = solve(20, 24, s06, (0.0, 1.0, 7.4), -24, 5.4, 1.7, fov=58)
add(20, 24, s06, "'light of day': the whole party dances in the yard, the farmhouse glowing behind them", v, **NIGHT, gather=[0.0, 7.6, 3.4, 70, 250, 14, 140, 205])
# S07 (b24-28; late b25.5): Kob in the doorway, deadpan, holding up a ringing alarm clock at the lens: it's late
s07 = [A('kob', 'happy_idle', 0.05, 3.45, at=0.3, speed=0.1, hold='clock', arm='R', aim=[0.8, 0.05, 0.42], upAt=-1, holdScale=1.25)]
v = deadpan((0.05, 3.45), 1.15, 2.9, fov=46, push=0.12)
add(24, 28, s07, "'late': Kob in the doorway, deadpan, holding up a ringing alarm clock", v, m='win', **NIGHT, door=1, guests='stare', stare=[0.05, 3.45], gather=[0.0, 7.7, 2.9, 45, 315, 14, 140, 220])
# S08 (b28-32; time b28.1, come b29.4) [fallback: S02's passed setup]: they ignore her and dance on, from the dirt
s08 = [A('saxo', 'charleston', 0.0, 7.6, at=1.3, speed=1), A('sadi', 'shimmy', -1.05, 7.3, yaw=12, at=0.5, speed=1), A('compote', 'twist', 1.05, 7.3, yaw=-12, at=0.9, speed=1)]
v = solve(28, 32, s08, (0.0, 0.95, 7.45), 4, 4.7, 0.6, fov=60, roll=(-6, -3))
add(28, 32, s08, "'time': they ignore her and dance on, the guests round them", v, **NIGHT, **YARD_RING)
# =====================================================================================================================
# ACT 2, verse 2 (b32-64): first light. Back into the dark house; the rig arrives and hooks it.
PRE = dict(zone='predawn')
# S09 (b32-36): the sky goes pink over the hills: the three freeze mid-dance, staring up
s09 = [A('saxo', 'happy_idle', 0.0, 7.4, yaw=180, at=0.3, speed=0.1, **GASP), A('sadi', 'happy_idle', -0.9, 8.0, yaw=172, at=0.3, speed=0.1, **GASP), A('compote', 'happy_idle', 0.9, 8.0, yaw=188, at=0.3, speed=0.1, **GASP)]
v = view((0.1, 0.75, 4.6), (0.0, 1.25, 7.8), fov=72, p1=(0.1, 0.75, 4.72))
add(32, 36, s09, "the sky turns pink over the hills behind them: the three freeze mid-dance, paws to their cheeks", v, **PRE, noguests=True)
# S10 (b36-40; run b36.3, back b36.6, dark b38.3): 'run back to the dark': from the doorway, they sprint at the lens
s10 = [A('sadi', 'happy_run', -0.85, 9.2, yaw=180, at=0.5, speed=1.1, mz=-1.5, mx=0.15), A('saxo', 'happy_run', 0.15, 8.6, yaw=180, at=0.2, speed=1.1, mz=-1.5), A('compote', 'happy_run', 1.1, 9.4, yaw=180, at=0.1, speed=1.1, mz=-1.5, mx=-0.15)]
v = view((0.1, 1.05, 4.55), (0.1, 0.95, 7.8), fov=62)
add(36, 40, s10, "'run back to the dark': from the doorway: they sprint for the house, at the lens", v, **PRE, door=1, noguests=True)
# S11 (b40-44): the big rig rolls in out of its smoke, headlights blazing (the clip's shot)
s11 = [hidden()]
v = view((-5.4, 0.5, 4.9), (-14.0, 1.7, 0.4), fov=52)
add(40, 44, s11, "a big rig rolls in out of the smoke, headlights blazing", v, **PRE, arrive=[-1.6, 3.6, -40], lights=True, smoke=True, driver={'pose': 'cab'})
# S12 (b44-48): inside, the party goes on in the candlelight: the three dance on the rug
s12 = [A('saxo', 'charleston', -0.35, 0.3, at=0.7, speed=1), A('sadi', 'happy_idle', -1.08, 0.62, yaw=15, at=0.3, speed=0.1, aim='rave', arm='both', flapEvery=1000, flapPh=90, upAt=-1, hop=[0.06, 1], air=True), A('compote', 'happy_idle', 0.38, 0.62, yaw=-15, at=0.3, speed=0.1, aim='rave', arm='both', flapEvery=1000, flapPh=90, upAt=-1, hop=[0.06, 1], air=True)]
v = solve(44, 48, s12, (-0.35, 0.95, 0.3), 5, 3.25, 1.1, fov=66, m='in', rng=(0.85, 1.0), dang=25)
add(44, 48, s12, "inside, the party goes on in the candlelight", v, m='in', guests='dance', where='room', clock=5.6)
# S13 (b48-52; friends b47.9, shut b50.1): from the yard: Compote slams the front door in our face
s13 = [A('compote', 'happy_idle', 0.12, 3.25, yaw=0, at=0.3, speed=0.1, arm='both', aim=[0.25, 0.35, 0.9], upAt=-1)]
v = view((0.25, 1.05, 6.4), (0.1, 1.0, 3.6), fov=52, p1=(0.25, 1.05, 6.25))
add(48, 52, s13, "'shut': from the yard: Compote slams the front door in our face", v, m='win', zone='predawn', door=[S(49.6, 48), S(50.1, 48), 1, 0], noguests=True, clock=5.65, key=[0.1, 2.0, 2.6, 0.9, 0.7, 0.5])
# S14 (b52-56; get b52.8, car b54.1): outside, the trucker bulldog hooks a chain onto the house; through the window,
# Saxo dances on
s14 = [hidden()]
v = view((-5.9, 1.25, 5.4), (-5.85, 0.95, 0.0), fov=58, p1=(-5.88, 1.24, 5.2))
add(52, 56, s14, "'get... car': outside, the trucker hooks a chain onto the house while the party glows in its windows", v, **PRE, driver={'pose': 'hook', 'at': [-5.6, -0.3], 'yaw': 0}, lights=False, curtains=0, key=[-5.7, 1.7, 1.7, 1.0, 0.85, 0.65])
# S15 (b56-60; wanna b57.3, right b58.8): the count looms behind Sadi, claws up, at her neck; she has no idea
s15 = [A('sadi', 'happy_idle', -0.85, 0.55, yaw=35, at=0.3, speed=0.1, aim='rave', arm='both', flapEvery=1000, flapPh=90, upAt=-1, hop=[0.06, 1], air=True), A('saxo', 'charleston', 0.05, 0.55, yaw=-35, at=0.7, speed=1)]
v = view((-0.4, 1.15, 3.5), (-0.4, 1.0, 0.55), fov=56, p1=(-0.4, 1.13, 3.35))
add(56, 60, s15, "'wanna... right': the count dances for Sadi in the candlelight, her paws up", v, m='in', clock=5.75)
# S16 (b60-66; oh b62.3, love b63.4) [takes two of the dropped S17's beats]: ...and licks her cheek like a dog: she melts, hearts
s16 = [A('sadi', 'happy_idle', -0.78, 0.5, yaw=12, at=0.3, speed=0.1, aim='heart', arm='both', upAt=-1, sway=6), A('saxo', 'happy_idle', 0.02, 0.52, yaw=-88, at=0.3, speed=0.1, lean=6, tongue=True)]
v = view((-0.4, 1.15, 3.35), (-0.45, 1.0, 0.5), fov=54, p1=(-0.4, 1.13, 3.2))
add(60, 66, s16, "'love': and licks her cheek like a dog: she melts, hearts", v, m='in', clock=5.8, hearts=[[-0.85, 1.3, 0.6, S(61.0, 60), 1]], heartYaw=0)

# =====================================================================================================================
# ACT 3, pre-chorus 2 (b64-91): dawn closes in. The windows boarded up, the clock nears six.
# S18 (b66-72; hope b67.2) [takes two of the dropped S17's beats]: Kob, deadpan on the sofa, the clock beside her at five to six
s18 = [A('kob', **SEAT, x=KOB_SEAT[0], z=KOB_SEAT[1], **GOBLET)]
v = deadpan((0.05, -3.1), 1.12, 3.0, fov=56, push=0.1)
add(66, 72, s18, "Kob, deadpan, the clock beside her at five to six", v, m='in', zone='predawn', clock=5.92)
# S19 (b72-76) [fallback: S20's passed setup]: Compote hammers planks across the back-right window
s19 = [A('compote', 'happy_idle', 3.9, -1.8, yaw=140, at=0.3, speed=0.1, hold='hammer', arm='R', aim=[0.35, 0.75, 0.5], upAt=-1, holdScale=1.7, sway=7, swayEvery=0.5)]
v = view((3.6, 1.25, -3.55), (4.0, 1.15, -1.6), fov=58, p1=(3.65, 1.23, -3.42))
add(72, 76, s19, "'never leave': Compote hammers planks across the window", v, m='in', zone='predawn', boards=0, nail=[0.15, 2 * PER, 'R0'], clock=5.95)
# S20 (b76-80; never b79.5, leave b79.8) [passed]: she hammers on, furious, the last planks on a half beat
s20 = [A('compote', 'happy_idle', 3.9, -1.8, yaw=140, at=0.3, speed=0.1, hold='hammer', arm='R', aim=[0.35, 0.75, 0.5], upAt=-1, holdScale=1.7, sway=7, swayEvery=0.5)]
v = view((3.6, 1.25, -3.55), (4.0, 1.15, -1.6), fov=58, p1=(3.65, 1.23, -3.42))
add(76, 80, s20, "'never leave': Compote hammers on, furious; every window boarded", v, m='in', zone='predawn', boards=0, nail=[[-9, 0, 'R1'], [0.05 - PER, PER * 0.5, 'R0']], clock=5.97)
# S21 (b80-84) [fallback: S15's passed setup]: behind the boarded windows the count dances for Sadi in the candlelight
s21 = [A('sadi', 'happy_idle', -0.85, 0.55, yaw=35, at=0.3, speed=0.1, aim='rave', arm='both', flapEvery=1000, flapPh=90, upAt=-1, hop=[0.06, 1], air=True), A('saxo', 'charleston', 0.05, 0.55, yaw=-35, at=0.7, speed=1)]
v = view((-0.4, 1.15, 3.5), (-0.4, 1.0, 0.55), fov=56, p1=(-0.4, 1.13, 3.35))
add(80, 84, s21, "behind the boarded windows the count dances for Sadi in the candlelight, relieved", v, m='in', zone='predawn', boards=1, clock=5.98)
# S22 (b84-88): six o'clock: Saxo by the clock, frozen; a line of light under the door
s22 = [A('saxo', 'happy_idle', 0.3, -2.6, yaw=-5, at=0.3, speed=0.1, **GASP)]
v = solve(84, 88, s22, (-0.15, 1.2, -2.95), 8, 3.1, 1.2, fov=56, m='in', dang=15)
add(84, 88, s22, "six o'clock: Saxo by the clock, paws to his cheeks", v, m='in', zone='sunrise', boards=1, clock=[5.98, 6.0, 0.0, 0.6], crack=True)
# S23 (b88-91): the first ray pierces a gap in the planks and creeps towards them
s23 = [hidden()]
v = view((0.2, 1.25, 2.9), (4.4, 1.55, 1.45), fov=56, p1=(0.4, 1.27, 2.8))
add(88, 91, s23, "the first ray of sun pierces a gap in the planks", v, m='in', zone='sunrise', boards=1, beams=[0.35, 0.8, 0, 1], crack=True, clock=6.0, noguests=True, key=[3.3, 1.9, 2.4, 0.8, 0.62, 0.4])

# =====================================================================================================================
# ACT 4, chorus (b91-128): sunrise.
RISE = dict(zone='sunrise', boards=1, crack=True, clock=6.03)
# S24 (b91-95; run b91.0, sunlight b94.4): the first beam lands at Saxo's feet: he leaps away from it
s24 = [A('saxo', 'happy_idle', -1.63, 0.12, yaw=0, at=0.3, speed=0.1, hop=[0.4, 2], air=True, mz=-0.85, moveAt=0.1, lean=-8, **GASP), A('sadi', 'happy_idle', -2.75, -1.1, yaw=25, at=0.3, speed=0.1, **GASP)]
v = solve(91, 95, s24, (-1.95, 0.75, -0.3), 5, 3.3, 0.8, fov=62, m='in', dang=15)
add(91, 95, s24, "'run': the first beam lands at his feet: he leaps away from it", v, m='in', beams=1, **RISE)
# S25 (b95-99; Dracula b96.2): his Dracula pose at the lens, recoiling from the light
s25 = [A('saxo', 'happy_idle', -2.3, 0.15, yaw=70, at=0.3, speed=0.1, lean=-5, arm='both', aim=[0.2, 0.6, 0.45], upAt=-1)]
v = solve(95, 99, s25, (-2.1, 1.15, 0.2), 30, 2.7, 1.2, fov=56, m='in', dang=20)
add(95, 99, s25, "'Dracula': the count recoils from the sheet of light, paws to his cheeks", v, m='in', beams=1, **RISE)
# S26 (b99-103; run b99, sunlight b102.4) [fallback: S23's passed insert]: the beams multiply through every gap in the planks
s26 = [hidden()]
v = view((0.2, 1.25, 2.9), (4.4, 1.55, 1.45), fov=56, p1=(0.4, 1.27, 2.8))
add(99, 103, s26, "'run... sunlight': the beams multiply through every gap in the planks", v, m='in', beams=[0, 1.6, 1, 6], noguests=True, key=[3.3, 1.9, 2.4, 0.8, 0.62, 0.4], **RISE)
# S27a (b103-105; Dracula b104.2): Kob strolled into a stripe of sun and lies in it, eyes half shut, from above: the cat
# in the sunbeam
s27 = [A('kob', 'laying_idle', -0.5, 0.45, yaw=0, at=1.0, speed=0, lying=True)]
v = view((-0.45, 2.6, 2.6), (-0.5, 0.25, 0.25), fov=54, p1=(-0.45, 2.5, 2.45))
add(103, 105, s27, "'Dracula': Kob lies down in a patch of sunlight, eyes half shut: the cat in the sunbeam", v, m='in', beams=6, shafts=False, patch=[-0.5, 0.42, 0.9, 1.45], **RISE)
# S27b (b105-107): Sadi and Compote, in the dark, aghast at her
s27b = [A('sadi', 'happy_idle', -1.55, 1.25, yaw=125, at=0.3, speed=0.1, **GASP), A('compote', 'happy_idle', -1.6, -0.45, yaw=60, at=0.3, speed=0.1, **GASP), A('kob', 'laying_idle', -0.5, 0.45, yaw=0, at=1.0, speed=0, lying=True)]
v = solve(105, 107, s27b, (-1.2, 0.85, 0.4), 95, 3.2, 1.6, fov=58, m='in', dang=12)
add(105, 107, s27b, "Sadi and Compote, in the dark, aghast at the cat in the sun", v, m='in', beams=6, patch=[-0.5, 0.42, 0.9, 1.45], **RISE)
# S28 (b107-111; run b107.1, sunlight b110.6): the planks fall, the light pours in: they run for the dark corner
s28 = [A('saxo', 'happy_run', -1.2, -1.6, yaw=yaw_to((-1.2, -1.6), CORNER[0]), at=0.2, speed=1.1, mx=round(CORNER[0][0] + 1.2, 2), mz=round(CORNER[0][1] + 1.6, 2), moveAt=0.1),
       A('sadi', 'happy_run', -1.65, -0.55, yaw=yaw_to((-1.65, -0.55), CORNER[1]), at=0.5, speed=1.1, mx=round(CORNER[1][0] + 1.65, 2), mz=round(CORNER[1][1] + 0.55, 2), moveAt=0.1),
       A('compote', 'happy_run', -0.9, -2.5, yaw=yaw_to((-0.9, -2.5), CORNER[2]), at=0.1, speed=1.1, mx=round(CORNER[2][0] + 0.9, 2), mz=round(CORNER[2][1] + 2.5, 2), moveAt=0.1)]
v = solve(107, 111, s28, (-2.0, 0.7, -1.6), 50, 6.0, 2.8, fov=64, m='in', dang=20, push=0.03, rng=(0.85, 1.05))
add(107, 111, s28, "'run... sunlight': the planks fall, the light pours in; they run for the dark corner", v, m='in', beams=6, flood=[0.0, 0.5, 0, 1], shafts=False, zone='sunrise', boards=1, crack=True, clock=6.05)
# S29 (b111-115; Dracula b112.2, run b113.9, sun b114.7): crammed in the corner by the coffins, the light at their toes;
# behind them Kob basks in the middle of it
s29 = [A('saxo', 'happy_idle', *CORNER[0], yaw=40, at=0.3, speed=0.1, **CLAW), A('sadi', 'happy_idle', *CORNER[1], yaw=70, at=0.3, speed=0.1, **GASP), A('compote', 'happy_idle', *CORNER[2], yaw=30, at=0.3, speed=0.1, **GASP)]
v = solve(111, 115, s29, (-3.4, 0.95, -2.2), 50, 3.6, 1.2, fov=58, m='in')
add(111, 115, s29, "'Dracula... run... sun': crammed in the last dark corner by the coffins, the light at their toes", v, m='in', beams=6, flood=1, zone='sunrise', boards=1, crack=True, clock=6.06)
# S31 (b115-122.83; Dracula b121.8) [S30, the tow wide, dropped after three loops; the reveal starts on its beat]: the house is gone, towed off down the track: the three stand in full sun on the bare
# floor in the corner, frozen in their vampire poses; Kob basks
s31 = [A('saxo', 'happy_idle', *CORNER[0], yaw=72, at=0.3, speed=0.1, **GASP), A('sadi', 'happy_idle', *CORNER[1], yaw=80, at=0.3, speed=0.1, **GASP), A('compote', 'happy_idle', *CORNER[2], yaw=75, at=0.3, speed=0.1, **GASP)]
v = view((1.8, 2.4, -1.2), (-3.8, 1.8, -2.1), fov=60, p1=(1.6, 2.35, -1.25))
add(115, 122.83, s31, "'Dracula': the house is gone, towed off down the track: they stand frozen in full sun on the bare floor while the rig drags the house away across the field behind them", v, m='open', zone='sunrise', haul=[-30.83, 0.14, -30.44, -2.33], haulDur=S(122.83, 115), lights=True, smoke=True, noguests=True, clock=6.1)
# S32 (b122.83-128): the button: the four lie side by side in the sun, belly up, paws in the air, shades on, hearts
# rising: pets (the cold open S00's frame: the loop lands back on it)
s32 = sunbath()
add(122.83, 128, s32, "the button: the four sunbathe side by side on the bare boards, belly up, paws in the air, shades on, hearts rising: pets", SUN_V(), hearts=[[0.95, 0.9, 2.6, 0.2, 1], [-0.95, 0.9, 2.6, 0.6, 1]], **SUN_FLAGS)
for s in shots: clean(s['actors'])
shots.sort(key=lambda x: x['beat'])
ep = {
    'date': '2026-10-11', 'song': {'title': 'Dracula', 'artist': 'Tame Impala, JENNIE'},
    'logline': "Dracula Saxo's all-night party at his farmhouse must never see the light of day: they board up the windows, but at sunrise the light comes through every gap and they run from each sunbeam on every 'run', the cat lies down in one, and the clip's truck tows the whole house away: the vampires end up sunbathing, belly up, because they're pets.",
    'new': "src/maps41.js: farmhouse (Dracula's farmhouse in a field at night: the string-lit yard with costumed box-pet guests (ghosts, witches, devils, pumpkins, bats: dance, flee, cheer, stare, on an arc with `gather`), the party room inside (damask, candelabras, a grandfather clock whose hands show `clock`, a red velvet sofa, three coffins, a punch table, an iron chandelier, the count's portrait), windows with curtains and planks nailed on the beat (`boards`, `boardsAt`), sunbeams through the plank gaps (`beams`: flat sheets of light and their stripes on the floor) and whole windows pouring in (`flood`), a line of light under the door (`crack`), skies for night, pre-dawn and sunrise, a big rig with headlights and smoke that drives in (`arrive`) and tows the house's shell away (`tow`), its trucker the bulldog keeper in a trucker cap (`driver`), hearts); looks saxo dracula, kob countess, compote mummy; props hammer and goblet; the structure WEAKNESS",
    'notes': "The world, from the official video (contact sheets every 3 s): a lonely farmhouse at night under string lights, a man in white on a dark road, a big rig pulling up in clouds of smoke with its lights blazing, a crowd dancing in the dust in its headlights, and at dawn the house hauled away on a truck. Our version: the title's count throws the party at that farmhouse, so the sunrise is the threat and the clip's ending (the house hauled away) is the payoff; the trucker is the bulldog keeper. The words, from whitelisted keywords per line: a night that must never leave, never seeing the light of day, late, time, back to the dark, a car, friends, shut, love; the chorus: run from the sunlight, Dracula. Cast: Saxo the count (the clip's star is the title), Sadi the vampire (her look from Spooky, Scary Skeletons), Kob the countess (who never goes out: on the sofa, then the alarm clock, then the first to lie in the sun), Compote the mummy (the door slammer, the furious hammer). The button pays off a pet universal: cats and dogs lie in the sun patch.",
    'yt': [11.40, 66.776],   # the Short opens on a dance (S06, the whole party in the yard; the karaoke's K03 shows from 11.40 s): from the earliest line that fits it opened on S04's cheer
    'with': ['sadi', 'kob', 'compote'],
    'clips': sorted({a['clip'] for s in shots for a in s['actors']}),
    'tags': {'structure': 'weakness', 'scenes': ['the yard party at night', 'the alarm clock at the door', 'run back to the dark', 'the rig arrives in smoke', 'the chain hooked on the house', 'the bite that is a lick', 'boarding up on the beat', 'the first ray', 'the floor is lava of light', 'the cat in the sunbeam', 'the last dark corner', 'the house towed away', 'sunbathing vampires'],
             'cast': ['saxo', 'sadi', 'kob', 'compote'], 'hook': 'dance', 'maps': ['farmhouse'], 'ref': 'none',
             'lyric_literal': "'never leave' (the party cheers on; the windows boarded), 'late' / 'time' (Kob's ringing alarm clock), 'run back to the dark' (they sprint into the house), 'shut' (Compote slams the door), 'car' (the rig, the chain), 'love' (the bite that is a lick), 'run... sunlight' x3 (a run from a sunbeam each time), 'Dracula' (his vampire pose, then frozen in the sun)",
             'experiment': "A seasonal monster episode (the Halloween run-up: a count, a vampire, a mummy, a countess) on a chart song with a K-pop star featured, its payoff a pet universal (the monsters who fear the sun are pets: they bask in it) and the clip's own ending (the house hauled away at dawn): does it lift the Short's views at 24 h over the last three episodes?"},
    'shots': shots,
}
json.dump(ep, open(os.path.join(HERE, '2026-10-11.json'), 'w'), indent=1, ensure_ascii=False)
print(len(shots), 'shots;', len(WARN), 'warnings')
for w in WARN: print('  ', w)
