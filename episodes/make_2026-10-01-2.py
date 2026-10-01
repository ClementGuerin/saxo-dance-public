# make_2026-10-01-2.py: writes episodes/2026-10-01-2.json, "Stop The Wedding!" (Ashe; climbing Spotify's daily charts on
# 2026-09-30, +21k streams a day globally, 51k TikTok videos on its 60 s sound). The clip: a 1960s melodrama in faded
# Technicolor, a jealous blonde (curlers, a pink dress, white gloves, a flowered hat) at her vanity, a wedding invitation
# delivered by a white-gloved hand, a cake topper, a rotary phone, a pale vintage car, the ex in a dark suit.
# Ours, "the objection that works too well" (new structure, BACKFIRE: the lead gets exactly what he wanted, in the way he
# least wanted it): Sadi is marrying the bulldog keeper from "Dai Dai" in a white country chapel. Saxo, in the clip's
# 60s look (a blonde bouffant, a pink shift dress, white gloves), crashes it doing the Twist up the aisle, pulls out a
# STOP sign and raises it on every "stop the wedding". Compote, the flower girl, answers with a volley of roses and
# throws him out; the doors slam, and his STOP sign pops up in the door's window behind her back. The ceremony goes on
# (the bride, Kob the officiant reading the vows, the bride's white heels) until "speak now": everyone turns to the
# doors, and they burst open: Saxo, backlit, sign up. He marches to the altar... and the groom falls in love with HIM:
# hearts, down on one knee, the ring. Saxo blocks the kiss with his STOP sign, the guests cheer the new couple, Compote
# pelts them with roses, and Saxo runs, the groom after him with the ring. Sadi shrugs and tosses her bouquet over her
# shoulder: Kob catches it (the cat who never goes out). The button: the wedding photo at the doors, the wrong couple.
# Beats are the kit's tempo map (episodes/2026-10-01-2.beats.js: the choruses ~132.1 BPM, the verse ~134.9): kit beat
# b sits at grid[b]; a bar = 4 beats (~1.81 s). Chorus 1 b0-64, verse 2 b64-96, chorus 2 b96-160, two instrumental bars
# b160-168 (the video ends at 76.0 s). Lyric rows K00-K23 (episodes/2026-10-01-2.lyrics.js; the lyrics stay in their
# files). Action words (whitelisted keywords, kit beats): 'heart' b9.96/b105.95; 'stop' b18.90 b26.43 b50.84 b58.54
# b114.88 b122.42 b146.84 b154.55 ('wedding' ~1.2-2 beats after each); 'burn dress run' b44.31/46.37/47.80 and
# b140.30/142.36/143.80; 'girl' b71.04/b79.63; 'talking' b74.32; 'white heels' b88.17/b89.52; 'know' b92.53.
import json, math, os, re, sys
sys.path.insert(0, os.path.dirname(__file__))
from cam import view, low, deadpan, backs

HERE = os.path.dirname(__file__)
_b = open(os.path.join(HERE, '2026-10-01-2.beats.js')).read()
GRID = json.loads(_b[_b.index('{'):_b.rindex('}') + 1])['grid']
def T(b):                                      # kit seconds at kit beat b (the tempo map)
    n = len(GRID)
    if b <= 0: return GRID[0] + b * (GRID[1] - GRID[0])
    if b >= n - 1: return GRID[-1] + (b - n + 1) * (GRID[-1] - GRID[-2])
    i = int(b); return GRID[i] + (b - i) * (GRID[i + 1] - GRID[i])
def POS(t):                                    # kit beat at kit seconds t
    if t <= GRID[0]: return (t - GRID[0]) / (GRID[1] - GRID[0])
    if t >= GRID[-1]: return len(GRID) - 1 + (t - GRID[-1]) / (GRID[-1] - GRID[-2])
    lo, hi = 0, len(GRID) - 1
    while hi - lo > 1:
        m = (lo + hi) // 2
        if GRID[m] <= t: lo = m
        else: hi = m
    return lo + (t - GRID[lo]) / (GRID[lo + 1] - GRID[lo])
def S(b, b0): return round(T(b) - T(b0), 3)    # seconds from shot beat b0 to beat b (for in-shot timings)

LOOK = {'saxo': 'bouffant', 'sadi': 'bride', 'kob': 'officiant', 'compote': 'flowergirl'}
HEAD = {'saxo': 1.5, 'sadi': 1.32, 'kob': 1.38, 'compote': 1.5}   # the top of each head standing (the bouffant, the tiara, the ears, the crown)
FACE = {'saxo': 0.95, 'sadi': 0.88, 'kob': 0.9, 'compote': 0.9}
# ---- the chapel (src/maps22.js WEDDING) ----
BRIDE = (-0.5, -2.9); GROOM = (0.5, -2.9); OFF = (0.0, -3.95); FLOWER = (-1.4, -2.35); DOORZ = 11.0
AIS = (0.0, 2.2)                               # Saxo's mark in the aisle, between the third and fourth rows
SIGN_SIDE = [0.45, 0.62, 0.64]                 # the STOP sign held up beside his face (the FRUIT ONLY placard's aim)
SIGN_HIGH = [0.35, 0.95, 0.35]                 # ...raised high on "stop"
SIGN_LOW = [0.3, 0.05, 0.85]                   # ...carried at the chest

def A(who, clip, x, z, **o):
    return {'who': who, 'look': o.pop('look', LOOK[who]), 'clip': clip, 'x': round(x, 3), 'z': round(z, 3), 'face': o.pop('face', 'camera'),
            'yaw': o.pop('yaw', 0), 'at': o.pop('at', 'auto'), **o}
def yaw_to(a, b): return round(math.degrees(math.atan2(b[0] - a[0], b[1] - a[1])), 1)
def kob_book(**o):                             # Kob the officiant behind the altar, reading from her book
    return A('kob', o.pop('clip', 'happy_idle'), *o.pop('at_', OFF), face=o.pop('face', 'world'), yaw=o.pop('yaw', 0), at=o.pop('at', 0.3), speed=o.pop('speed', 0.35), hold='book', **o)
def sadi_hands(yaw=90, at_=BRIDE, **o):        # the bride holding the groom's paws
    return A('sadi', 'happy_idle', *at_, face='world', yaw=yaw, at=o.pop('at', 0.6), speed=o.pop('speed', 0.35), arm='both', aim=o.pop('aim', [0.08, 0.12, 0.98]), **o)
def compote_basket(x, z, **o):
    return A('compote', o.pop('clip', 'happy_idle'), x, z, at=o.pop('at', 0.4), speed=o.pop('speed', 0.5), hold='basket', **o)

# ---- a projection check (numbers only): where each face lands in the 9:16 frame at the shot's start and end ----
def _proj(cam, look, fov, pt):
    f = [look[i] - cam[i] for i in range(3)]; n = math.sqrt(sum(v * v for v in f)); f = [v / n for v in f]
    r = [-f[2], 0.0, f[0]]; rn = math.sqrt(r[0] ** 2 + r[2] ** 2) or 1; r = [r[0] / rn, 0.0, r[2] / rn]
    u = [r[1] * f[2] - r[2] * f[1], r[2] * f[0] - r[0] * f[2], r[0] * f[1] - r[1] * f[0]]
    d = [pt[i] - cam[i] for i in range(3)]; z = sum(a * b for a, b in zip(d, f))
    if z <= 0.05: return None
    tv = math.tan(math.radians(fov) / 2); th = tv * 9 / 16
    return (0.5 + sum(a * b for a, b in zip(d, r)) / z / th / 2, 0.5 - sum(a * b for a, b in zip(d, u)) / z / tv / 2)
_src = open(os.path.join(HERE, '2026-10-01-2.lyrics.js')).read()
_rows = json.loads(re.search(r'window\.LYRICS = (.*?);\n', _src).group(1)); _ends = json.loads(re.search(r'window\.LINE_END = (.*?);\n', _src).group(1))
LINES = [(POS(row[0][0] - 0.35), POS(e)) for row, e in zip(_rows, _ends)]
def has_line(b0, b1): return any(a < b1 and b > b0 for a, b in LINES)
WARN = []
def check(beat, b1, lenses, look, fov, actors, groom=None):
    line = has_line(beat, b1)
    pts = [(a['who'], a['x'], a['z'], a.get('lift', 0), a.get('mx', 0), a.get('mz', 0), a.get('fg')) for a in actors]
    if groom: pts.append(('groom', groom[0], groom[1], 0, groom[2] if len(groom) > 2 else 0, groom[3] if len(groom) > 3 else 0, False))
    for k, cam in enumerate(lenses):
        end = k == len(lenses) - 1
        for who, x0, z0, lift, mx, mz, fg in pts:
            if fg: continue
            x, z = x0 + mx * end, z0 + mz * end
            hy, fy = (1.36, 1.14) if who == 'groom' else (HEAD[who], FACE[who])
            top, face = _proj(cam, look, fov, (x, hy + lift, z)), _proj(cam, look, fov, (x, fy + lift, z))
            if not top or not face: WARN.append(f'b{beat}: {who} behind the lens'); continue
            if line and top[1] < 0.26: WARN.append(f'b{beat}: {who} head top at {top[1]:.2f} (lyric rows){" at the end" if end else ""}')
            if face[0] < 0.12 or face[0] > 0.88: WARN.append(f'b{beat}: {who} face x {face[0]:.2f} (edge){" at the end" if end else ""}')
            if face[1] > 0.8: WARN.append(f'b{beat}: {who} face y {face[1]:.2f} (low)')
            fx, fz = look[0] - cam[0], look[2] - cam[2]; n = math.hypot(fx, fz) or 1; rx, rz = -fz / n, fx / n
            R = 0.47 if who == 'saxo' else 0.3 if who == 'groom' else 0.43   # the groom's skull at 0.82 scale is ~0.3 m round
            ex = [_proj(cam, look, fov, (x + sgn * R * rx, fy + lift, z + sgn * R * rz)) for sgn in (-1, 1)]
            if all(ex) and (min(e[0] for e in ex) < 0.0 or max(e[0] for e in ex) > 1.0): WARN.append(f'b{beat}: {who} head spans x {min(e[0] for e in ex):.2f}-{max(e[0] for e in ex):.2f} (cut){" at the end" if end else ""}')

shots = []
def lens(v, k=0):
    c, f = v; a = math.radians(c['ang'][k]); fy = f[2] if len(f) > 2 else 0
    return (f[0] + math.sin(a) * c['r'][k], c['h'][k] + fy, f[1] + math.cos(a) * c['r'][k])
def L2(v): return [lens(v, 0), lens(v, -1)]
def add(beat, b1, actors, lyric, v, groom_pt=None, **o):
    c, focus = v
    o = {k: val for k, val in o.items() if val is not None}
    o.setdefault('groom', {'hide': True})       # the groom is placed shot by shot (his default mark leaked into Kob's catch)
    s = {'beat': beat, 'kind': 'dance', 'map': 'wedding', 'actors': actors, 'lyric': lyric, 'cam': c, 'focus': focus, **o}
    look = (focus[0], c['look'][0] + (focus[2] if len(focus) > 2 else 0), focus[1])
    check(beat, b1, L2(v), look, c['fov'], actors, groom_pt)
    shots.append(s)
def clear_lens(v, extra=()):                   # no guest at the lens nor along the first 2.4 m of its line of sight
    c, f = v; p = lens(v, 0); q = lens(v, -1); look = (f[0], 0, f[1])
    near = 0.75 if p[1] < 1.5 else 1.4          # a high lens over the pews sees the nearest guests' heads big: clear wider
    out = [[round(p[0], 2), round(p[2], 2), near], [round(q[0], 2), round(q[2], 2), near]]
    dx, dz = look[0] - p[0], look[2] - p[2]; n = math.hypot(dx, dz) or 1
    for dd in (0.8, 1.6, 2.4, 3.2):
        out.append([round(p[0] + dx / n * dd, 2), round(p[2] + dz / n * dd, 2), 0.75])
    return out + [list(e) for e in extra]
GR = lambda **g: {'x': GROOM[0], 'z': GROOM[1], 'yaw': -90, **g}   # the groom's map flag, at his mark facing the bride

# ---- a lens solver: the Self Aware run's small grid search, generalised ----
# subjects: [(x, z, head_top, face_y), ...] (the groom: head 1.36, face 1.14). Searches lens positions round a preferred
# direction `ang` (deg, 0 = +z from the look point) and distance, at heights hs, for one where every face sits in
# [0.16, 0.84] across and above 0.76 down, every head fits inside the frame, and every head top stays under the lyric
# rows (y >= 0.28); among those it keeps the one nearest the preferred angle and distance. A lens low among the pews
# (|x| > 0.9 inside the rows, under 1.35 m) or inside a wall is skipped.
SUBJ = lambda who, x, z, lift=0.0: (x, z, (1.36 if who == 'groom' else HEAD[who]) + lift, (1.14 if who == 'groom' else FACE[who]) + lift, 0.3 if who == 'groom' else (0.47 if who == 'saxo' else 0.43))
def _fits(cam, look, fov, subs, line=True):
    worst = 1.0
    for x, z, ht, fy, R in subs:
        top, face = _proj(cam, look, fov, (x, ht, z)), _proj(cam, look, fov, (x, fy, z))
        if not top or not face: return None
        fx, fz = look[0] - cam[0], look[2] - cam[2]; n = math.hypot(fx, fz) or 1; rx, rz = -fz / n, fx / n
        ex = [_proj(cam, look, fov, (x + sg * R * rx, fy, z + sg * R * rz)) for sg in (-1, 1)]
        if not all(ex): return None
        lo_x, hi_x = min(e[0] for e in ex), max(e[0] for e in ex)
        m = min(face[0] - 0.16, 0.84 - face[0], lo_x - 0.02, 0.98 - hi_x, 0.76 - face[1], (top[1] - 0.28) if line else 1.0)
        worst = min(worst, m)
    return worst
OBST = [(-2.05, -4.35), (2.05, -4.35), (-3.2, -4.15), (3.2, -4.15), (2.85, -3.35)]   # candle stands, flower pedestals, the cake
def _free(cam):
    x, y, z = cam
    if any(math.hypot(x - ox, z - oz) < 0.6 for ox, oz in OBST): return False
    if abs(x) > 5.3 or z < -6.0 or z > 10.7: return False
    if -1.0 < z < 7.2 and abs(x) > 0.9 and y < 1.35: return False
    return True
def solve(subs, ang, dist, look_y=None, hs=(1.1,), fov=46, spread=40, dr=(0.8, 1.6), line=True, look=None):
    cx = sum(s[0] for s in subs) / len(subs); cz = sum(s[1] for s in subs) / len(subs)
    ly = look_y if look_y is not None else sum(s[3] for s in subs) / len(subs) + 0.08
    L = look or (cx, ly, cz); best = None
    for da in range(-spread, spread + 1, 5):
        for k in range(0, 13):
            d = dist * (dr[0] + (dr[1] - dr[0]) * k / 12)
            for h in hs:
                a = math.radians(ang + da); cam = (L[0] + math.sin(a) * d, h, L[2] + math.cos(a) * d)
                if not _free(cam): continue
                f = _fits(cam, L, fov, subs, line)
                if f is None or f < 0: continue
                score = abs(da) / 40 + abs(d - dist) / dist + (0.3 - min(f, 0.3))
                if best is None or score < best[0]: best = (score, cam)
    if best is None: raise SystemExit(f'no lens for {subs} round {ang} deg at {dist} m')
    return best[1], L
def sv(subs, ang, dist, hs=(1.1,), fov=46, push=0.06, look_y=None, look=None, spread=40, dr=(0.8, 1.6), line=True, **o):   # a solved lens, pushing in by `push` of the way
    cam, L = solve(subs, ang, dist, look_y=look_y, hs=hs, fov=fov, spread=spread, dr=dr, line=line, look=look)
    p1 = (cam[0] + (L[0] - cam[0]) * push, cam[1], cam[2] + (L[2] - cam[2]) * push)
    return view(tuple(round(c, 3) for c in cam), L, fov, p1=tuple(round(c, 3) for c in p1), **o)

# ================= chorus 1 (b0-64): the crasher, the STOP sign, the flower girl's roses, thrown out =================
HK = (0.0, 0.9)                                # the hook's mark: three rows up the aisle from the couple
v = view((0.02, 1.32, -4.35), (0.0, 1.05, HK[1]), 54, p1=(0.02, 1.3, -4.1))
add(0, 8, [A('saxo', 'twist', *HK, at=0.4, hold='stopsign', arm='R', aim=SIGN_HIGH),
           A('sadi', 'being_surprised_and_looking_right', *BRIDE, face='world', yaw=yaw_to(BRIDE, HK), at=0.2, speed=0.6, fg=True)],
    "HOOK (K00): from behind the bride and groom at the altar: the guests have all turned round to a grey dog in a blonde 60s bouffant and a pink shift dress doing the Twist up the aisle with a red STOP sign held high; the couple turns round too",
    v, groom=GR(pose='stand', yaw=yaw_to(GROOM, HK), look=list(HK)), stare=list(HK), petals=True, stars=['saxo'])
v = sv([SUBJ('saxo', *AIS)], 180, 3.0, hs=(1.05, 1.15), fov=46)
add(8, 12, [A('saxo', 'happy_idle', *AIS, face='world', yaw=180, at=0.5, speed=0.5, arm='R', aim='heart', holdL='stopsign')],
    "K01 'heart' (b9.96): he stops dead, a white-gloved paw on his heart, gazing up the aisle at the bride: it's his ex",
    v, stare=list(AIS), petals=True, clear=clear_lens(v), stars=['saxo'])
B3, G3, K3 = (-0.66, -2.85), (0.66, -2.85), (0.0, -4.25)   # apart and three-quarter (three heads touched: both seemed to kiss the officiant)
v = sv([SUBJ('sadi', *B3), SUBJ('groom', *G3), SUBJ('kob', *K3)], 0, 4.6, hs=(1.45, 1.55), fov=48, spread=10)
add(12, 16, [sadi_hands(yaw=60, at_=B3), kob_book(at_=K3, arm='both', aim=[0.1, -0.2, 0.95])],
    "K02: his point of view down the aisle: the bride in white holding the bulldog groom's paws under the flower arch, the officiant reading",
    v, groom_pt=G3, groom=GR(pose='hands', x=G3[0], z=G3[1], yaw=-60), petals=True, noStands=True, clear=clear_lens(v), stars=['sadi'])
v = low((0.22, 0.3, 0.55), (0.0, 1.0, AIS[1]), (0.2, 0.3, 0.85), fov=60, roll=(8, 5))
add(16, 20, [A('saxo', 'happy_idle', *AIS, face='world', yaw=180, at=1.2, speed=0.6, hold='stopsign', arm='R', aim=SIGN_LOW, aim2=SIGN_HIGH, aim2At=S(18.9, 16) - 0.05)],
    "K02 'now' / K03 'stop' (b18.9): his STOP sign snaps up high on the word, low and dutch from the altar side",
    v, stare=list(AIS), clear=clear_lens(v), stars=['saxo'])
v = view((-0.15, 1.12, -0.6), (-0.5, 1.0, BRIDE[1]), 44, p1=(-0.17, 1.12, -0.75))
add(20, 24, [A('sadi', 'being_surprised_and_looking_right', *BRIDE, face='world', yaw=20, at=0.25, speed=0.7)],
    "K03 'wedding' (b20.94): the bride turns round and gasps at the dog with the STOP sign (a reaction close-up from the aisle)",
    v, groom=GR(pose='stand', yaw=0, look=list(AIS)), noStands=True, stars=['sadi'])
v = deadpan(FLOWER, 1.02, 2.8, cam_y=1.32, ang=yaw_to(FLOWER, AIS), fov=44, push=0.1)
add(24, 26, [A('compote', 'happy_idle', *FLOWER, face='world', yaw=yaw_to(FLOWER, AIS), at=0.2, speed=0.3, hold='rose', arm='R', aim=[0.45, 0.55, 0.55])],
    "K04 insert: the flower girl, Compote, in pink frills and a flower crown, glares at him and draws a red rose like a dart",
    v, stare=list(AIS), noStands=True, clear=clear_lens(v), stars=['compote'])
CP = (-0.25, -1.1)                              # the flower girl steps into the aisle to throw
v = view((-0.05, 1.04, 1.4), (-0.25, 1.0, CP[1]), 50, p1=(-0.06, 1.04, 1.25))
add(26, 30, [A('compote', 'happy_idle', *CP, face='world', yaw=yaw_to(CP, AIS), at=0.3, speed=0.6, arm='both', aim='pelt',
               pelt={'times': [0.12, 0.36, 0.6, 0.84], 'to': [AIS[0] + 0.05, 1.0, AIS[1] - 0.2], 'kinds': ['bloom'], 'dur': 0.45, 'arc': 0.25, 'big': 1.8, 'spread': 0.14})],
    "K04 'stop' / 'wedding' (b26.43/b27.88): his point of view: the flower girl fires roses straight at us like fastballs, one on every beat, the second one filling the lens on 'wedding'",
    v, stare=list(AIS), clear=clear_lens(v), stars=['compote'])
v = sv([SUBJ('saxo', *AIS)], 190, 2.9, hs=(1.1,), fov=48)
add(30, 34, [A('compote', 'happy_idle', 0.95, -0.5, face='world', yaw=yaw_to((0.95, -0.5), AIS), at=0.3, speed=0.6, fg=True, arm='both', aim='pelt',
               pelt={'times': [0.1, 0.34, 0.58, 0.82], 'to': [AIS[0], 1.0, AIS[1]], 'kinds': ['bloom'], 'dur': 0.4, 'arc': 0.25, 'big': 2.0, 'spread': 0.2}),
             A('saxo', 'happy_idle', *AIS, face='world', yaw=180, at=0.9, speed=1.2, hold='stopsign', arm='R', aim=SIGN_SIDE)],
    "K04 end: the hits from the front: roses bounce off his bouffant and his dress and pile up round his heels",
    v, stare=list(AIS), clear=clear_lens(v), stars=['saxo'])
C5 = (0.0, -0.6)
v = sv([SUBJ('saxo', *AIS), SUBJ('compote', -0.38, -0.7), SUBJ('compote', -0.38, 0.3)], -40, 4.2, hs=(2.0, 2.2), fov=50, push=0.02)
add(34, 40, [A('saxo', 'happy_idle', *AIS, face='world', yaw=180, at=0.4, speed=0.5, hold='stopsign', arm='R', aim=[0.25, 0.3, 0.9]),
             A('compote', 'happy_walk', -0.38, -0.7, face='world', yaw=8, at=0.3, speed=1.0, mz=1.0, arm='both', aim='pelt',
               pelt={'times': [0.2, 0.5, 0.8, 1.1, 1.4, 1.7, 2.0], 'to': [AIS[0] - 0.05, 1.1, AIS[1] - 0.2], 'kinds': ['bloom'], 'dur': 0.42, 'arc': 0.3, 'big': 1.4, 'spread': 0.25})],
    "K05: high over the pews: the flower girl marches up the aisle at him, still throwing, and he hides behind his STOP sign",
    v, stare=list(AIS), clear=clear_lens(v), stars=['compote'])
v = view((-0.7, 1.15, -2.55), (-1.55, 0.95, 0.4), 50, p1=(-0.7, 1.15, -2.4))
add(40, 44, [A('compote', 'happy_idle', -0.2, 0.9, face='world', yaw=0, at=0.3, speed=0.6, arm='both', aim='pelt', fg=True,
               pelt={'times': [0.15, 0.45, 0.75, 1.05, 1.35], 'to': [AIS[0], 1.05, AIS[1] + 0.4], 'kinds': ['bloom'], 'dur': 0.4, 'arc': 0.25, 'big': 1.6, 'spread': 0.2})],
    "K06 'guests': the guests on the left pews clutch their cheeks, turned to the rose fight in the aisle",
    v, gasp=True, clear=[[-0.7, -2.55, 0.8]], stars=[])
RUN0, RUN1 = (-0.22, 2.4), (-0.22, 4.2)
v = sv([SUBJ('saxo', *RUN0), SUBJ('saxo', *RUN1), SUBJ('compote', 0.42, 1.6), SUBJ('compote', 0.42, 3.4)], 75, 5.0, hs=(2.1, 2.3), fov=64, push=0.0, spread=25)
add(44, 50, [A('saxo', 'happy_run', *RUN0, face='world', yaw=0, at=0.3, speed=1.0, mz=RUN1[1] - RUN0[1], moveAt=S(47.8, 44) - 0.2),
             A('compote', 'happy_run', 0.42, 1.6, face='world', yaw=0, at=0.7, speed=1.0, mz=1.8, moveAt=S(47.8, 44) + 0.1)],
    "K07 'run' (b47.8): he runs for the doors, the flower girl sprinting after him, three-quarter from the back of the chapel",
    v, stare=[0.0, 5.0], clear=clear_lens(v), stars=['saxo'])
OUTS = (0.0, 11.75)                             # outside the doors, on the path
v = view((0.0, 1.35, 16.2), (0.0, 1.15, 11.4), 50, p1=(0.0, 1.34, 16.0))
add(50, 54, [A('compote', 'happy_idle', -0.4, 10.5, face='world', yaw=10, at=0.4, speed=0.7, arm='both', aim=[0.12, 0.3, 0.95]),
             A('saxo', 'happy_idle', 0.42, 12.3, face='world', yaw=0, at=0.6, speed=1.3, hold='stopsign', arm='R', aim=SIGN_LOW)],
    "K08 'stop' / 'wedding' (b50.84/b52.27): from the lawn: he stumbles out towards us, the flower girl shoving in the doorway behind him, and the doors slam shut on her on 'wedding'",
    v, doors=[S(51.6, 50), S(52.27, 50), 1, 0], clear=clear_lens(v), stars=['saxo'])
v = deadpan((0.0, 10.25), 1.0, 2.9, cam_y=1.06, ang=180, fov=44, push=0.1)
add(54, 58, [A('compote', 'clap_while_standing', 0.0, 10.25, face='world', yaw=180, at=0.2, speed=1.0)],
    "K08 end: the flower girl turns round in front of the shut doors and dusts off her paws, glaring",
    v, doors=0, clear=clear_lens(v), stars=['compote'])
v = sv([SUBJ('compote', -0.05, 10.2), (0.55, 10.95, 1.45, 1.07, 0.38)], 200, 3.2, hs=(1.2,), fov=46)
add(58, 64, [A('compote', 'happy_idle', -0.05, 10.2, face='world', yaw=180, at=0.3, speed=0.35, arm='both', aim=[0.1, -0.05, 0.9])],
    "K09 'stop' (b58.54): behind her back, the STOP sign pops up in the door's window, from outside, right on the word; she doesn't notice",
    v, doors=0, doorSign=S(58.54, 58) - 0.1, clear=clear_lens(v), stars=['compote'])

# ================= verse 2 (b64-96): the ceremony goes on; the face at the window; "speak now" =================
v = view((1.1, 1.2, -1.2), (-0.5, 0.98, -2.9), 46, p1=(1.0, 1.2, -1.32), ease='lin')
add(64, 72, [A('sadi', 'happy_idle', *BRIDE, face='world', yaw=yaw_to(BRIDE, (1.1, -1.2)) - 15, at=0.5, speed=0.35, hold='bouquet', arm='R', aim=[0.15, -0.1, 0.9])],
    "K10 'girl' (b71.04): the bride, radiant, her bouquet in her paws, glancing at us (the groom just off the frame's edge)",
    v, groom=GR(pose='stand'), noStands=True, petals=True, stars=['sadi'])
L, R, BY, v = backs(OFF, ang=0, spread=0.66, depth=1.25, right=(0.62, 1.25), cam=(2.35, 2.15, 1.25), look_y=1.02, fov=46, roll=(0, 0), hand=0)
add(72, 80, [A('kob', 'happy_idle', *OFF, face='world', yaw=0, at=0.3, speed=0.3, hold='book', arm='both', aim=[0.12, -0.15, 0.95]),
             A('sadi', 'happy_idle', *L, face='world', yaw=BY, at=0.5, speed=0.3, fg=True)],
    "K11 'talking' (b74.32): between the couple's backs: the officiant, Kob, in a black robe, reads the vows off her book, deadpan",
    v, groom=GR(x=R[0], z=R[1], yaw=BY), stars=['kob'])
WIN_P = (0.55, 11.3)                            # outside, his face at the right leaf's window
v = sv([SUBJ('saxo', *WIN_P)], 180, 3.3, hs=(1.1,), fov=42, spread=15)
add(80, 88, [A('saxo', 'happy_idle', *WIN_P, face='world', yaw=180, at=0.5, speed=0.35, arm='both', aim=[0.55, 0.45, 0.7])],
    "K12: meanwhile, outside: his face squashed against the window of the church door, paws on the glass",
    v, doors=0, clear=clear_lens(v), stars=['saxo'])
v = view((-0.32, 0.1, -1.85), (-0.5, 0.2, -2.9), 52, p1=(-0.33, 0.1, -2.0), roll=[-4, -3])
add(88, 92, [A('sadi', 'happy_idle', *BRIDE, face='world', yaw=15, at=0.5, speed=0.4, fg=True)],
    "K12 'white heels' (b88.17): at floor level: the bride's white heels on the rug, shifting impatiently",
    v, groom=GR(pose='hands'), stars=['sadi'])
v = view((0.05, 1.5, 10.3), (0.0, 1.0, -2.6), 40, p1=(0.05, 1.48, 10.0))
add(92, 96, [A('kob', 'happy_idle', *OFF, face='world', yaw=0, at=0.3, speed=0.3, hold='book', arm='both', aim=[0.12, -0.15, 0.95]),
             A('sadi', 'being_surprised_and_looking_right', *BRIDE, face='world', yaw=5, at=0.6, speed=0.4)],
    "K13 'know' (b92.53): 'speak now': the doors' point of view: the whole chapel, the bride, the groom and the officiant, has turned round to stare at the shut doors, holding its breath",
    v, groom=GR(pose='stand', yaw=-5), stare=[0.0, 11.0], doors=0, stars=[])

# ================= chorus 2 (b96-160): the doors burst open; the groom falls for him; the bouquet =================
DOORWAY = (0.0, 10.55)
v = low((0.18, 0.34, 7.1), (0.0, 1.05, DOORWAY[1]), (0.16, 0.34, 7.45), fov=56, roll=(-7, -4))
add(96, 100, [A('saxo', 'happy_idle', *DOORWAY, face='world', yaw=180, at=0.6, speed=0.6, hold='stopsign', arm='R', aim=SIGN_HIGH)],
    "K14: the doors burst open on the downbeat: Saxo in the doorway, backlit by the sun, STOP sign held high",
    v, doors=[0.0, 0.3, 0, 1], stare=list(DOORWAY), gasp=True, clear=clear_lens(v), stars=['saxo'])
v = view((0.1, 1.05, 2.6), (0.0, 1.0, 8.0), 60, p1=(0.1, 1.05, 2.45))
add(100, 104, [A('saxo', 'happy_walk', 0.0, 9.0, face='world', yaw=180, at=0.3, speed=1.0, mz=-2.4, hold='stopsign', arm='R', aim=SIGN_HIGH)],
    "K14 'night': he marches down the aisle holding the sign up, the guests gasping on both sides",
    v, doors=1, stare=[0.0, 7.4], gasp=True, clear=[[0.1, 2.6, 0.5]], stars=['saxo'])
v = sv([SUBJ('groom', *GROOM)], 10, 2.5, hs=(1.2,), fov=42, spread=15)
add(104, 108, [],
    "K15 'heart' (b105.95): the groom turns to look at the dog in the pink dress... and falls head over heels: paws on his heart, hearts popping over his head; the bride beside him out of frame",
    v, groom_pt=GROOM, groom=GR(pose='swoon', yaw=0, at=S(105.95, 104) - 0.1, look=[0.0, 2.0]), stars=['sadi'])
SA = (0.0, -0.9)                                # Saxo at the altar's edge, facing the couple
v = view((0.78, 1.38, 0.45), (0.0, 1.0, -2.3), 52, p1=(0.76, 1.37, 0.35), ease='lin')
add(108, 114, [A('saxo', 'happy_idle', -0.15, -0.6, face='world', yaw=180, at=0.8, speed=0.5, holdL='stopsign', fg=True),
               A('sadi', 'being_surprised_and_looking_right', -0.75, -2.95, face='world', yaw=15, at=0.2, speed=0.6)],
    "K16 'now' (b113.1): over Saxo's shoulder: the groom, in a daze, lets go of her and walks away towards Saxo and his STOP sign, hearts trailing",
    v, groom_pt=(0.35, -1.75), groom=GR(pose='walk', yaw=0, at=0.5, to=[0.35, -1.75], dur=2.0), noStands=True, stars=['sadi'])
v = view((5.2, 1.05, -1.9), (0.0, 0.88, -1.9), 56, p1=(5.1, 1.05, -1.9))
add(114, 118, [A('saxo', 'happy_idle', *SA, face='world', yaw=180, at=0.3, speed=0.7),
               A('sadi', 'being_surprised_and_looking_right', *BRIDE, face='world', yaw=70, at=0.2, speed=0.7)],
    "K17 'stop' / 'wedding' (b114.88/b116.93): side on: the groom drops to one knee in front of him and holds up an open ring box; the bride's jaw drops, the officiant doesn't blink",
    v, groom_pt=(0.3, -1.8), groom=GR(pose='kneel', x=0.3, z=-1.8, yaw=35, at=0.15, ring=True), clear=[[1.42, -0.57, 0.8], [2.3, -0.57, 0.8], [3.2, -0.57, 0.8], [1.42, 0.88, 0.6]], stars=['saxo'])
v = view((-0.55, 1.25, -2.75), (0.0, 1.06, SA[1]), 56, p1=(-0.54, 1.25, -2.68))
add(118, 122, [A('saxo', 'shaking_head_no_dismissively', *SA, face='world', yaw=180, at=0.2, speed=0.8, hold='stopsign', arm='R', aim=SIGN_LOW)],
    "K17 end: frontal, from just above the kneeling groom's ears: Saxo's horror, shaking his head, no, no, no",
    v, groom=GR(pose='kneel', x=0.3, z=-1.8, yaw=0, at=-1.0, ring=True, hearts=999), stars=['saxo'])
GP = (-0.08, -1.78)                             # behind the sign's plane and off its edge (seen from +x): half his puckered face peeks round it
v = view((3.35, 1.12, -1.25), (0.0, 1.02, -1.25), 50, p1=(3.3, 1.11, -1.25))
add(122, 126, [A('saxo', 'happy_idle', 0.1, -0.9, face='world', yaw=90, at=0.4, speed=0.6, holdL='stopsign', arm='L', aim=[0.9, -0.12, 0.28])],
    "K18 'stop' / 'wedding' (b122.42/b123.87): side on: the groom, back on his feet, puckers up for a kiss; Saxo, turned to us, holds the STOP sign out between them and the groom kisses the sign",
    v, groom_pt=GP, groom=GR(pose='pucker', x=GP[0], z=GP[1], yaw=0, at=S(122.42, 122), hearts=0.1), clear=[[1.42, -0.57, 0.7], [2.3, -0.57, 0.7], [3.2, -0.57, 0.7]], stars=['saxo'])
v = sv([SUBJ('sadi', *BRIDE)], 10, 2.7, hs=(1.05,), fov=44)
add(126, 130, [A('sadi', 'shoulder_shrug', *BRIDE, face='world', yaw=10, at=0.1, speed=1.0)],
    "K18 end: the bride shrugs: whatever",
    v, stars=['sadi'])
v = view((1.15, 1.45, -2.6), (2.3, 1.1, 2.4), 46, p1=(1.15, 1.45, -2.45))
add(130, 136, [],
    "K19: the guests jump to their feet and cheer the 'happy couple', paws up in a V, hearts popping over the pews",
    v, groom=GR(pose='kneel', x=0.3, z=-1.8, yaw=0, at=-1.0, ring=True, hearts=999), stand=True, cheer=True, hearts=0.3, stare=[0.1, -1.4], noStands=True, stars=[])
CF = (-1.05, -1.55)
v = view((-0.1, 1.3, 0.75), (-1.05, 1.05, -1.55), 46, p1=(-0.12, 1.3, 0.62))
add(136, 140, [A('compote', 'happy_idle', *CF, face='world', yaw=yaw_to(CF, SA), at=0.3, speed=0.6, arm='both', aim='pelt',
                 pelt={'times': [0.15, 0.4, 0.65, 0.9, 1.15], 'to': [SA[0] + 0.1, 1.2, SA[1]], 'kinds': ['bloom'], 'dur': 0.34, 'arc': 0.25, 'big': 1.3, 'spread': 0.25})],
    "K20 'guests': the flower girl does her job at last and throws her roses over the happy couple: hard, at Saxo's head, off the edge of the frame",
    v, groom=GR(pose='kneel', x=0.3, z=-1.8, yaw=0, at=-1.0, ring=True), clear=[[-1.42, -0.57, 0.6], [-2.3, -0.57, 0.6]], stars=['compote'])
v = view((1.3, 1.38, -2.95), (0.0, 1.0, SA[1]), 52, p1=(1.28, 1.38, -2.9))
add(140, 144, [A('saxo', 'happy_idle', *SA, face='world', yaw=180, at=0.3, speed=0.5, holdL='stopsign')],
    "K21 'burn' / 'dress' (b140.3/b142.36): over the groom's shoulder: he holds the open ring box out at him, and Saxo stares at it in horror",
    v, groom=GR(pose='offer', x=0.28, z=-1.95, yaw=-8, at=0.1, ring=True, hearts=999), stars=['saxo'])
EX0 = (0.0, -0.8)
v = view((1.65, 1.4, 6.6), (0.0, 0.95, 0.6), 52, p1=(1.63, 1.4, 6.5))
add(144, 150, [A('saxo', 'happy_run', -0.25, EX0[1], face='world', yaw=0, at=0.3, speed=1.0, mz=3.1, moveAt=0.05)],
    "K21 'run' (b143.8) / K22 'stop the wedding': he runs for it, down the aisle towards the open doors, the groom chasing him with the ring, hearts streaming; the guests throw petals over them like newlyweds",
    v, doors=1, groom_pt=(0.55, -2.6, 0.0, 4.0), groom=GR(pose='run', x=0.55, z=-2.6, yaw=0, at=0.35, to=[0.55, 1.4], dur=2.4, ring=True), stand=True, cheer=True, rice=[0.2, 0.8], stare=[0.0, 1.0], clear=clear_lens(v), stars=['saxo'])
v = view((1.15, 1.0, -1.35), (-0.55, 1.15, -3.0), 52, p1=(1.1, 1.0, -1.42))
add(150, 154, [A('sadi', 'happy_idle', *BRIDE, face='world', yaw=0, at=0.2, speed=0.6, hold='bouquet', arm='R', aim=[0.45, 0.2, 0.7], aim2=[0.3, 0.95, -0.25], aim2At=S(151.2, 150) - 0.08, toss={'at': S(151.2, 150), 'to': [0.0, 1.05, -3.85], 'dur': 0.7, 'arc': 1.1, 'scale': 1.6})],
    "K22 end: the bride, dumped at the altar, flicks her bouquet away over her shoulder without looking",
    v, noStands=True, stars=['sadi'])
v = deadpan(OFF, 1.0, 2.8, cam_y=1.06, ang=0, fov=44, push=0.1)
add(154, 160, [A('kob', 'happy_idle', *OFF, face='world', yaw=0, at=0.3, speed=0.3, hold='bouquet', holdFrom=S(155.69, 154) - 0.05, arm='R', aim=[0.45, 0.55, 0.6])],
    "K23 'stop' / 'wedding' (b154.55/b155.69): the officiant catches it one-pawed on 'wedding'... and looks at the bouquet in her paw: the cat who never goes out is next",
    v, stars=['kob'])

# ================= the button (b160-168): the wedding photo =================
PH = (-0.1, 12.25)
v = view((0.3, 1.12, 15.6), (0.2, 1.0, 11.7), 50)
add(160, 168, [A('saxo', 'happy_run', *PH, face='world', yaw=0, at=0.55, speed=1.0, hold='stopsign', arm='R', aim=SIGN_LOW, holdAt=0.55)],
    "BUTTON: flash: the wedding photo on the church steps: Saxo bolting out of the doors under the petals, the bulldog groom leaping after him with the ring and his hearts: the wrong couple, framed for ever",
    v, doors=1, groom_pt=(0.75, 11.55), groom=GR(pose='run', x=0.75, z=10.6, yaw=0, at=-0.5, to=[0.75, 12.0], dur=1.6, ring=True), rice=[-0.45, 12.1], stop=0.55, still=True, flashAt=[0.5], photo=0.55, stars=['saxo'])

# ================= the fallback (2026-10-01, after three review loops): proven compositions for the 16 shots that kept failing =================
# The review failed these three times running (a second character hidden behind the lead or a guest on the lens line, a rose
# crossing a face, reactions shot from the wrong side). Per the routine they fall back to the setups that passed in this
# video: frontal inserts, lenses in the aisle (no guest can stand on its line), the officiant's point of view, the S10 pew bank.
FALLBACK = [20, 26, 30, 34, 44, 88, 92, 100, 108, 114, 118, 130, 136, 140, 144, 150]
shots[:] = [x for x in shots if x['beat'] not in FALLBACK]
WARN[:] = [w for w in WARN if int(w.split(':')[0][1:].split('.')[0]) not in FALLBACK]
FRONT = (0.0, 3.0)                              # a lens in the aisle a little up from the altar: the trio frontal, no guest near its line
# S05: the wedding party turns round to stare at him (the couple and the officiant frontal, from the aisle)
v = view((0.05, 1.3, 2.4), (0.0, 1.0, -3.2), 44, p1=(0.05, 1.29, 2.2))
add(20, 24, [A('sadi', 'happy_idle', *BRIDE, face='world', yaw=10, at=0.3, speed=0.4), kob_book()],
    "K03 'wedding' (b20.94): the wedding party has turned round to stare down the aisle at him: the bride, the bulldog groom and the officiant, frontal under the arch",
    v, groom=GR(pose='stand', yaw=-10), noStands=True, stars=['sadi'])
# S07: the flower girl's throw, frontal: one rose head leaves her right shoulder and flies off past her side
v = view((-0.05, 1.3, 1.6), (-0.25, 1.02, CP[1]), 48, p1=(-0.06, 1.3, 1.45))
add(26, 30, [A('compote', 'happy_idle', *CP, face='world', yaw=0, at=0.3, speed=0.6, arm='R', aim='pelt',
               pelt={'times': [0.15, 0.95], 'to': [-1.6, 1.25, 1.2], 'kinds': ['bloom'], 'dur': 0.5, 'arc': 0.2, 'big': 1.8, 'spread': 0.05})],
    "K04 'stop' / 'wedding' (b26.43/b27.88): the flower girl fires a rose head like a fastball, out past her shoulder at him",
    v, stare=list(AIS), noStands=True, stars=['compote'])
# S08: the hits: roses already lying round his heels, one more bouncing off him
v = view((0.3, 1.12, -0.85), (0.0, 1.0, AIS[1]), 50, p1=(0.28, 1.12, -0.7))
add(30, 34, [A('compote', 'happy_idle', 1.05, -0.4, face='world', yaw=yaw_to((1.05, -0.4), AIS), at=0.3, speed=0.6, fg=True, arm='both', aim='pelt',
               pelt={'times': [0.0, 0.1, 0.2, 0.3, 0.4, 1.35], 'to': [AIS[0], 1.0, AIS[1]], 'kinds': ['bloom'], 'dur': 0.3, 'arc': 0.15, 'big': 1.6, 'spread': 0.35}),
             A('saxo', 'happy_idle', *AIS, face='world', yaw=180, at=0.9, speed=1.2, hold='stopsign', arm='R', aim=SIGN_SIDE)],
    "K04 end: the hits from the front: rose heads lie all round his heels and one more bounces off him",
    v, stare=list(AIS), clear=clear_lens(v), stars=['saxo'])
# S09: the flower girl marches up the aisle at us (his point of view), still throwing, the roses flying past the lens
v = view((0.1, 1.12, 2.5), (-0.05, 1.02, -0.5), 50, p1=(0.1, 1.12, 2.45))
add(34, 40, [A('compote', 'happy_walk', -0.05, -0.9, face='world', yaw=0, at=0.3, speed=1.0, mz=0.8, arm='both', aim='pelt',
               pelt={'times': [0.3, 0.9, 1.5, 2.1], 'to': [0.85, 1.3, 2.0], 'kinds': ['bloom'], 'dur': 0.45, 'arc': 0.2, 'big': 1.6, 'spread': 0.2})],
    "K05: his point of view: the flower girl marches up the aisle at us, still throwing rose heads",
    v, stare=list(AIS), stars=['compote'])
# S11: the run, in the aisle, him in front, the flower girl a body length behind in her own lane
v = view((0.25, 1.05, 8.7), (-0.1, 0.95, 3.0), 50, p1=(0.25, 1.05, 8.62))
add(44, 50, [A('saxo', 'happy_run', -0.3, 2.6, face='world', yaw=0, at=0.3, speed=1.0, mz=2.6, moveAt=S(47.8, 44) - 0.2),
             A('compote', 'happy_run', 0.45, 1.3, face='world', yaw=0, at=0.7, speed=1.0, mz=2.6, moveAt=S(47.8, 44) + 0.1)],
    "K07 'run' (b47.8): he runs for the doors down the aisle, the flower girl sprinting after him in the next lane",
    v, stare=[0.0, 4.0], stars=['saxo'])
# S18: the officiant's point of view: the couple at the altar facing us, the vows
v = view((0.05, 1.25, -5.6), (0.0, 1.0, -2.8), 60, p1=(0.05, 1.25, -5.5))
add(88, 92, [A('sadi', 'happy_idle', -0.42, -2.8, face='world', yaw=180, at=0.5, speed=0.35, hold='bouquet', arm='R', aim=[0.15, -0.1, 0.9])],
    "K12 'white heels' (b88.17): the officiant's point of view: the bride in white with her bouquet and the bulldog groom side by side, saying their vows",
    v, groom=GR(pose='stand', x=0.42, z=-2.8, yaw=180), noStands=True, stars=['sadi'])
# S19: 'speak now': from the middle of the aisle, the couple and the officiant turned round towards the doors, frontal
v = view((0.15, 1.3, 6.55), (0.0, 1.0, 10.3), 46, p1=(0.14, 1.29, 6.7))
add(92, 96, [A('compote', 'happy_idle', 0.0, 10.2, face='world', yaw=180, at=0.3, speed=0.35, arm='both', aim=[0.1, -0.05, 0.9])],
    "K13 'know' (b92.53): 'speak now': the whole chapel turns round to the shut doors, where the flower girl stands guard, arms folded",
    v, stare=[0.0, 11.0], doors=0, clear=[[0.15, 6.55, 0.6]], stars=['compote'])
# S21: the march, low in the aisle ahead of him, closer than the doorway shot
v = view((0.18, 0.5, 4.75), (0.0, 1.05, 8.0), 56, p1=(0.18, 0.5, 4.7), roll=[6, 4])
add(100, 104, [A('saxo', 'happy_walk', 0.0, 8.6, face='world', yaw=180, at=0.3, speed=1.0, mz=-1.6, hold='stopsign', arm='R', aim=SIGN_HIGH)],
    "K14 'night': he marches down the aisle with the sign held high",
    v, doors=1, stare=[0.0, 7.4], gasp=True, clear=[[0.18, 4.9, 0.5]], stars=['saxo'])
# S23: the groom walks towards us (Saxo's point of view), hearts streaming, the bride left behind
v = view((0.1, 1.25, 0.9), (0.08, 1.08, -2.3), 48, p1=(0.1, 1.25, 0.78))
add(108, 114, [A('sadi', 'happy_idle', -0.3, -3.05, face='world', yaw=20, at=0.5, speed=0.4, hold='bouquet', arm='R', aim=[0.15, -0.1, 0.9])],
    "K16 'now' (b113.1): his point of view: the groom, in a daze, walks away from the bride straight at us, hearts streaming",
    v, groom=GR(pose='walk', x=0.45, z=-2.9, yaw=0, at=0.5, to=[0.3, -1.4], dur=2.2), noStands=True, stars=['sadi'])
# S24: the proposal side on, the guests behind his head cleared
v = view((5.2, 1.05, -1.9), (0.0, 0.88, -1.9), 56, p1=(5.1, 1.05, -1.9))
add(114, 118, [A('saxo', 'happy_idle', *SA, face='world', yaw=180, at=0.3, speed=0.7),
               A('sadi', 'being_surprised_and_looking_right', *BRIDE, face='world', yaw=70, at=0.2, speed=0.7)],
    "K17 'stop' / 'wedding' (b114.88/b116.93): side on: the groom drops to one knee in front of Saxo and holds up an open ring box; the bride stares",
    v, groom=GR(pose='kneel', x=0.3, z=-1.8, yaw=35, at=0.15, ring=True), clear=[[x, z, 0.7] for x in (-1.42, -2.3, -3.2, 1.42, 2.3, 3.2) for z in (-0.57, 0.88, 2.33)], noStands=True, stars=['saxo'])
# S25: his horror, frontal and alone (the groom kneels below the frame)
v = view((0.0, 1.15, -3.15), (0.0, 1.06, SA[1]), 50, p1=(0.0, 1.15, -3.08))
add(118, 122, [A('saxo', 'happy_idle', *SA, face='world', yaw=180, at=0.4, speed=0.6, hold='stopsign', arm='R', aim=SIGN_SIDE)],
    "K17 end: his face: horror",
    v, groom={'hide': True}, noStands=True, stars=['saxo'])
# S28: the guests on their feet cheering, the S10 lens on the left bank
v = view((-0.7, 1.15, -2.55), (-1.55, 1.0, 0.4), 50, p1=(-0.7, 1.15, -2.4))
add(130, 136, [], "K19: the guests jump to their feet and cheer the 'happy couple', paws up, hearts popping over them",
    v, stand=True, cheer=True, hearts=0.3, clear=[[-0.7, -2.55, 0.8]], stars=[])
# S29: the flower girl glares at the new couple, a rose in her paw (the S06 lens)
v = deadpan(CF, 1.02, 2.8, cam_y=1.32, ang=yaw_to(CF, (0.0, 1.0)), fov=44, push=0.1)
add(136, 140, [A('compote', 'happy_idle', *CF, face='world', yaw=yaw_to(CF, (0.0, 1.0)), at=0.2, speed=0.3, hold='rose', arm='R', aim=[0.45, 0.55, 0.55])],
    "K20 'guests': the flower girl glares, a rose ready in her paw",
    v, noStands=True, stars=['compote'])
# S30: the groom holds the open ring box out at us, hearts over his head (the S22 lens)
v = view((0.62, 1.15, 0.65), (0.22, 1.0, -1.95), 46, p1=(0.6, 1.15, 0.5))
add(140, 144, [], "K21 'burn' / 'dress' (b140.3/b142.36): the groom holds the open ring box out at us, dreamy",
    v, groom=GR(pose='offer', x=0.28, z=-1.95, yaw=10, at=0.1, ring=True), noStands=True, stars=[])
# S31: the chase, in the aisle from the doors' end: him in front, the groom behind in the next lane with the ring
v = view((0.35, 1.05, 7.9), (0.05, 0.95, 1.5), 50, p1=(0.34, 1.05, 7.8))
add(144, 150, [A('saxo', 'happy_run', -0.3, -0.4, face='world', yaw=0, at=0.3, speed=1.0, mz=3.0, moveAt=0.05, hold='stopsign', arm='R', aim=SIGN_LOW)],
    "K21 'run' (b143.8) / K22: he runs for it down the aisle, the groom chasing him in the next lane with the ring, hearts streaming; the guests throw petals",
    v, doors=1, groom=GR(pose='run', x=0.5, z=-2.2, yaw=0, at=0.35, to=[0.5, 1.2], dur=2.4, ring=True), stand=True, cheer=True, rice=[0.3, 1.5], stare=[0.0, 1.0], clear=[[0.35, 7.9, 0.8]], noStands=True, stars=['saxo'])
# S32: the bouquet flies off past her, against the plain side wall
v = view((2.6, 1.05, -2.6), (-0.4, 1.15, -3.0), 50, p1=(2.5, 1.05, -2.6))
add(150, 154, [A('sadi', 'happy_idle', *BRIDE, face='world', yaw=60, at=0.2, speed=0.6, hold='bouquet', arm='R', aim=[0.45, 0.2, 0.7], aim2=[0.3, 0.95, -0.25], aim2At=S(151.2, 150) - 0.08,
                 toss={'at': S(151.2, 150), 'to': [-1.2, 1.1, -3.9], 'dur': 0.7, 'arc': 0.6, 'scale': 1.6})],
    "K22 end: the bride, dumped at the altar, flicks her bouquet away over her shoulder without looking",
    v, noStands=True, stars=['sadi'])
shots.sort(key=lambda x: x['beat'])

ep = {
    'date': '2026-10-01', 'song': {'title': 'Stop The Wedding!', 'artist': 'Ashe'},
    'logline': "Saxo crashes his ex's wedding in a 60s bouffant with a STOP sign; the flower girl throws him out with roses, he bursts back in on 'speak now'... and the bulldog groom falls in love with him instead.",
    'new': 'the BACKFIRE structure (the lead gets exactly what he wanted, in the way he least wanted it); a tempo map in the engine (a kit\'s BEATS.grid: the band\'s choruses at ~132.1 BPM, the verse at ~134.9); src/maps22.js wedding: a white country chapel (pews of pet guests who stare, gasp, stand and cheer, double doors that burst open onto a sunny lawn, a STOP sign that pops up in the door window, a rice shower) and the "Dai Dai" bulldog keeper back as the groom in a tuxedo (hands, swoon, walk, kneel with a ring box, pucker, run); props stopsign, rose (a pelt of roses), bouquet, basket; four looks (bouffant, bride, officiant, flowergirl)',
    'notes': "The clip (studied from a 360p copy, one frame every 3 s; its violent turn not looked at): a 1960s melodrama in faded Technicolor, a jealous blonde in curlers at a Victorian vanity by a window, a pink dress and pearl earrings, a white flowered hat, a wedding invitation in a white-gloved hand, a cake topper, a rotary phone, a pale vintage car at night. Kept: the 60s blonde (Saxo's bouffant, pink shift dress, white gloves: the lead in the artist's look), the wedding as the place, the cake. The whole cast: Saxo the jealous ex and lead (the joke is on him); Sadi the bride and the reality check (she shrugs him off and tosses the bouquet away); Kob the deadpan officiant who ends up with the bouquet (the cat who never goes out is next); Compote the angry flower girl who fights him with roses and throws him out (the bouncer thread). The groom is the bulldog keeper from 'Dai Dai', who swooned for Sadi's kiss there and swoons for anyone.",
    'with': ['sadi', 'kob', 'compote'],
    'clips': ['happy_idle', 'twist', 'happy_walk', 'happy_run', 'being_surprised_and_looking_right', 'shaking_head_no_dismissively', 'shoulder_shrug', 'dismissing_with_back_hand', 'jump_and_catch_with_one_hand', 'clap_while_standing'],
    'yt': 'end',
    'tags': {'structure': 'backfire', 'scenes': ['pelt', 'proposal', 'bouquet'], 'cast': ['saxo', 'sadi', 'kob', 'compote'], 'hook': 'dance', 'maps': ['wedding'], 'ref': 'none',
             'lyric_literal': "'stop the wedding' (the STOP sign raised on every 'stop', slammed doors, the sign in the window, the sign between the groom's lips and his), 'heart' (his paw on his heart, then the groom's hearts), 'run' (thrown out, then fleeing the groom), 'white heels' (the bride's), 'talking' (the vows)",
             'experiment': "Does a backfire payoff (the crasher who stops the wedding gets proposed to by the groom), opened on a dance in the aisle, on a chart-climbing song whose TikTok sound sits inside our cut, get more shares per 1,000 views than our story plots?"},
    'shots': shots,
}
json.dump(ep, open(os.path.join(HERE, '2026-10-01-2.json'), 'w'), indent=1, ensure_ascii=False)
print(len(shots), 'shots;', len(WARN), 'warnings')
for w in WARN: print('  ', w)
