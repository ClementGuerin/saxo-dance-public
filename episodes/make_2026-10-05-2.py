# make_2026-10-05-2.py: writes episodes/2026-10-05-2.json, "DtMF" (Bad Bunny, 2025; the queue being empty: +22 on
# Spotify's US daily chart on 2026-10-05, its 60 s TikTok sound has 1.09M videos).
# No clip to study (the official upload is a history-lesson visualizer), so the world is the album's: Puerto Rico, a
# family party at night, two white plastic chairs among plantain plants (its cover), a frog for a mascot, the title:
# "I should have taken more photos".
# Ours, "the group photo" (a new structure, PHOTO FAIL: the lead tries to take one photo all video and every flash
# catches a failure, worse each time; the one photo nobody tried for is perfect): at a carport party, Saxo (a straw
# pava hat, a guayabera) wants ONE photo of the whole gang, and like every pet owner who ever tried, he can't get it.
# The selfie: Kob walks out of it. The self-timer: he trips and lands face down in front of them, a frog sitting on
# his back. Handheld: the flash goes off in Compote's face and her boxing glove fills the next print. The chorus sings
# the title over him, dizzy on the floor. The couple selfie with Sadi: she leans in for a kiss and the frog leaps in
# between. The timer again: everyone has gone, only the frog on the chair. He slumps at the domino table among the
# failed prints. On the second chorus Sadi pulls him to the dance, Kob finally dances (on a plastic chair, the best of
# them), and on the break the frog hops onto the forgotten camera and presses the shutter: the perfect photo, all four
# dancing, the one nobody posed for. Button: Saxo holds it up, the frog on his hat.
# Beats: 113.000 BPM, kit beat b at b * 0.530973 s (kit beat 0 = song beat 96, the drop); a bar = 4 beats (2.124 s).
# Sections (kit beats): b0-56 verse end and pre-chorus, a dip b28-32; the quiet bar b57-64 (the chorus vocal enters
# at b61.8); chorus 1 b64-96; chorus 2 b96-120 (louder); the break b120-124, b124-128 sparse; the cut ends at b127.85,
# silence to b128.82 (68.40 s).
# Key words (whitelisted single words only): tiro b46.44 | tirar b62.53, fotos b64.13, tuve b68.27 | beso b72.47,
# abrazo b74.07 | ojala b82.08, nunca b84.94 | hoy b89.16 | tirar b94.52, fotos b96.13, tuve b100.27 | beso b104.47,
# abrazo b106.07 | ojala b114.66, nunca b116.99 | hoy b123.02.
# The lyrics stay in episodes/2026-10-05-2.lyrics.js (the generator reads only their times).
import json, math, os, re, sys
sys.path.insert(0, os.path.dirname(__file__))
from cam import view, swoop, low, deadpan

HERE = os.path.dirname(__file__)
PER = 60 / 113.0
def T(b): return b * PER
def S(b, b0): return round(T(b) - T(b0), 3)    # seconds from shot beat b0 to beat b

LOOK = {'saxo': 'pava', 'sadi': 'fiesta', 'kob': 'housecoat', 'compote': 'boxer'}
HEAD = {'saxo': 1.42, 'sadi': 1.28, 'kob': 1.45, 'compote': 1.42}       # the top of each head standing (the hat, the bow, the curlers, the ears)
FACE = {'saxo': 0.9, 'sadi': 0.84, 'kob': 0.86, 'compote': 0.86}
RAD = {'saxo': 0.56, 'sadi': 0.38, 'kob': 0.4, 'compote': 0.38, 'frog': 0.2}
SIT = 0.06                                          # a chair clip sits the chibi 6 cm lower than standing

# the map (src/maps30.js)
DANCE = (-4.0, -1.5)
CHAIRS = [(3.5, -2.35), (4.5, -2.35)]; CHAIR_Y = 0.42
TABLE = (4.0, 2.6); TABLE_Y = 0.56
CAM = (4.0, 0.84, 2.3)                              # the instant camera on its tripod, lens to -z
POV = (4.0, 0.86, 2.15)                             # its lens: the photos' point of view
KOB_SEAT = (3.0, 2.75)                              # Kob's chair at the table, facing +x
FROG = (4.38, 0.56, 2.72)
CAM_TOP = (4.0, 0.975, 2.31)                        # the frog sitting on the camera
SPOT = {'saxo': (2.95, -1.95), 'sadi': (3.5, -2.22), 'kob': (4.5, -2.22), 'compote': (4.98, -1.95)}   # the group photo: two standing, two seated
PLANTS = [(2.6, -3.5), (3.7, -3.95), (5.0, -3.6), (5.9, -3.0), (1.9, -2.6)]
FENCE_Z = 5.4

def A(who, clip, x, z, **o):
    return {'who': who, 'look': o.pop('look', LOOK[who]), 'clip': clip, 'x': round(x, 3), 'z': round(z, 3), 'face': o.pop('face', 'camera'),
            'yaw': o.pop('yaw', 0), 'at': o.pop('at', 'auto'), **o}
def yaw_to(frm, to): return round(math.degrees(math.atan2(to[0] - frm[0], to[1] - frm[1])), 1)
def seated(who, x, z, yaw=0, **o):
    """Seated on a white plastic chair (a chair clip held: the head up)."""
    return A(who, o.pop('clip', 'sitting_talking'), x, z, face='world', yaw=yaw, lift=CHAIR_Y, at=o.pop('at', 0.05), speed=o.pop('speed', 0.0), sit=True, **o)
CAM_UP = dict(hold='instant', arm='R', aim=[0.75, 0.55, 0.35])      # the camera held up beside the head
def frog(x, y, z, yaw=0, **o): return {'x': round(x, 3), 'y': round(y, 3), 'z': round(z, 3), 'yaw': yaw, 'scale': o.pop('scale', 1.25), **o}
FROG_TABLE = frog(*FROG, yaw=-70)

# ---- a projection check (numbers only): where each face lands in the 9:16 frame at the shot's start and end ----
def _proj(cam, look, fov, pt):
    f = [look[i] - cam[i] for i in range(3)]; n = math.sqrt(sum(v * v for v in f)); f = [v / n for v in f]
    r = [-f[2], 0.0, f[0]]; rn = math.sqrt(r[0] ** 2 + r[2] ** 2) or 1; r = [r[0] / rn, 0.0, r[2] / rn]
    u = [r[1] * f[2] - r[2] * f[1], r[2] * f[0] - r[0] * f[2], r[0] * f[1] - r[1] * f[0]]
    d = [pt[i] - cam[i] for i in range(3)]; z = sum(a * b for a, b in zip(d, f))
    if z <= 0.05: return None
    tv = math.tan(math.radians(fov) / 2); th = tv * 9 / 16
    return (0.5 + sum(a * b for a, b in zip(d, r)) / z / th / 2, 0.5 - sum(a * b for a, b in zip(d, u)) / z / tv / 2)
_src = open(os.path.join(HERE, '2026-10-05-2.lyrics.js')).read()
_rows = json.loads(re.search(r'window\.LYRICS = (.*?);\n', _src).group(1)); _ends = json.loads(re.search(r'window\.LINE_END = (.*?);\n', _src).group(1))
LINES = [((row[0][0] - 0.35) / PER, e / PER) for row, e in zip(_rows, _ends)]
def has_line(b0, b1): return any(a < b1 and b > b0 for a, b in LINES)
WARN = []
def body(a, end):                               # (who, x, z, face y, head top y) at the shot's start (0) or end (1)
    who = a['who']; sc = a.get('scale', 1)
    x, z = a['x'] + a.get('mx', 0) * end, a['z'] + a.get('mz', 0) * end
    lift = a.get('lift', 0) + (a.get('my', 0) if end else 0) - (a.get('sitDrop', SIT) if a.get('sit') else 0)
    return (who, x, z, FACE[who] * sc + lift, HEAD[who] * sc + lift)
def check(beat, b1, cam, look, fov, actors, end):
    line = has_line(beat, b1)
    for a in actors:
        if a.get('fg') or a.get('reveal', 0) >= 1.0 or a.get('lying'): continue
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
            c = (x2, fy2 + (0.28 if w2 == 'saxo' else 0.1), z2); d2 = math.dist(cam, c)   # the straw hat sits high on his head
            if d2 >= df - 0.2: continue
            pc = _proj(cam, look, fov, c)
            if not pc: continue
            r_px = (RAD[w2] / d2 + 0.1 / df) / (2 * math.tan(math.radians(fov) / 2)) * 1920
            if math.hypot((pf[0] - pc[0]) * 1080, (pf[1] - pc[1]) * 1920) < r_px: out.append(f'{w} behind {w2}')
    return out

shots = []
def lens(v, k=0):
    c, f = v; a = math.radians(c['ang'][k]); fy = f[2] if len(f) > 2 else 0
    return (f[0] + math.sin(a) * c['r'][k], c['h'][k] + fy, f[1] + math.cos(a) * c['r'][k])
def clear_at(v, r=0.9):                         # no guest or plantain at the lens or along its first stretch of sight
    c, f = v; p = lens(v, 0); q = lens(v, -1)
    out = [[round(p[0], 2), round(p[2], 2), r], [round(q[0], 2), round(q[2], 2), r]]
    for k in range(1, 4):
        u = k / 8; out.append([round(p[0] + (f[0] - p[0]) * u, 2), round(p[2] + (f[1] - p[2]) * u, 2), r * 0.8])
    return out
def clear_line(v, u0=0.4, u1=0.8, n=4, r=0.7):   # guests off the rest of the line of sight, short of the marks
    c, f = v; p = lens(v, 0)
    return [[round(p[0] + (f[0] - p[0]) * (u0 + (u1 - u0) * k / (n - 1)), 2), round(p[2] + (f[1] - p[2]) * (u0 + (u1 - u0) * k / (n - 1)), 2), r] for k in range(n)]
def add(beat, b1, actors, lyric, v, **o):
    c, focus = v
    o = {k: val for k, val in o.items() if val is not None}
    o.setdefault('clear', clear_at(v))
    shots.append({'beat': beat, 'kind': 'dance', 'map': 'marquesina', 'actors': actors, 'lyric': lyric, 'cam': c, 'focus': focus, **o})
    fy = focus[2] if len(focus) > 2 else 0
    for k, end in ((0, 0), (-1, 1)):
        cam, look = lens(v, k), (focus[0], c['look'][k] + fy, focus[1])
        check(beat, b1, cam, look, c['fov'], actors, end)
        for oc in _occl(cam, look, c['fov'], [body(a, end)[:4] for a in actors if not a.get('lying') and not a.get('fg')]):
            if not next(a for a in actors if a['who'] == oc.split(' behind ')[0]).get('fg'): WARN.append(f'b{beat}: {oc}{" at the end" if end else ""}')
def clean(actors):                               # the generator's own keys off the actors
    for a in actors: a.pop('sit', None); a.pop('sitDrop', None); a.pop('lying', None)
    return actors

# ================= a lens search: every face inside the frame and under the lyric rows at the shot's start and end,
# no face inside a nearer head's disc, the lens free of the set =================
def marq_free(c):
    x, y, z = c
    if y < 0.12 or y > 6.0 or z < -4.3 or z > FENCE_Z - 0.35 or abs(x) > 12: return False   # inside the front wall (beyond it, its bars filled the frame)
    if -7.7 < x < -0.3 and -4.7 < z < 1.5 and y > 2.75: return False          # inside the carport's slab
    for cx, cz in ((-7.35, 1.2), (-0.65, 1.2)):
        if math.hypot(x - cx, z - cz) < 0.45: return False                       # its columns
    if 3.2 < x < 4.8 and 1.75 < z < 3.4 and y < 1.7: return False               # the domino table, the camera on it
    if math.hypot(x - KOB_SEAT[0], z - KOB_SEAT[1]) < 1.2 and y < 1.5: return False   # her chair at the table
    for px_, pz in PLANTS:
        if math.hypot(x - px_, z - pz) < 0.9 and y < 3.0: return False
    if math.hypot(x - 7.4, z + 2.4) < 1.9 and y < 4.5: return False             # the mango tree
    return True
WHY = {}
def _no(r): WHY[r] = WHY.get(r, 0) + 1; return None
FACING = {}
def _ok(cam, look, fov, phases, line, occ=(), maxoff=105):
    worst = 1.0
    for w, yw in FACING.items():
        x0, z0 = next(((s_[1], s_[2]) for s_ in phases[0] if s_[0] == w), (None, None))
        if x0 is None: continue
        dx, dz = cam[0] - x0, cam[2] - z0; dn = math.hypot(dx, dz) or 1
        if (math.sin(math.radians(yw)) * dx + math.cos(math.radians(yw)) * dz) / dn < math.cos(math.radians(maxoff)): return _no(f'{w} faces away')
    fx, fz = look[0] - cam[0], look[2] - cam[2]; n = math.hypot(fx, fz) or 1; rx, rz = -fz / n, fx / n
    for subs in phases:
        for w, x, z, fy, ty in subs:
            face, top = _proj(cam, look, fov, (x, fy, z)), _proj(cam, look, fov, (x, ty, z))
            if not face or not top: return _no('behind the lens')
            ex = [_proj(cam, look, fov, (x + sg * RAD[w] * rx, fy, z + sg * RAD[w] * rz)) for sg in (-1, 1)]
            if not all(ex): return _no('behind the lens')
            m = {f'{w} face x': min(face[0] - 0.16, 0.84 - face[0]), f'{w} head edge': min(min(e[0] for e in ex) - 0.02, 0.98 - max(e[0] for e in ex)), f'{w} face low': 0.78 - face[1], f'{w} lyric rows': (top[1] - 0.28) if line else 1.0}
            k_, v_ = min(m.items(), key=lambda kv: kv[1])
            if v_ < 0: return _no(k_)
            worst = min(worst, v_)
        pts = [(w, x, z, fy) for w, x, z, fy, _ in subs] + [o_ for o_ in occ if o_[0] not in [s_[0] for s_ in subs]]
        oc = [r_ for r_ in _occl(cam, look, fov, pts) if r_.split(' behind ')[0] in [s_[0] for s_ in subs]]
        if oc: return _no(oc[0])
    return worst
def lens_for(actors, ang, dist, b0, b1, hs=(1.0,), fov=50, look=None, spread=40, dr=(0.8, 1.5), free=marq_free, push=0.04, facing=True, maxoff=105, **o):
    vis = [a for a in actors if not a.get('fg') and not a.get('lying')]
    FACING.clear(); FACING.update({a['who']: a.get('yaw', 0) for a in vis if a.get('face') == 'world'} if facing else {})
    phases = [[body(a, 0) for a in vis if not a.get('reveal')], [body(a, 1) for a in vis]]   # a revealed actor enters the frame during the shot
    occ = [body(a, 0)[:4] for a in actors if a.get('fg')]
    allp = phases[0] + phases[1]
    cx = sum(s_[1] for s_ in allp) / len(allp); cz = sum(s_[2] for s_ in allp) / len(allp); ly = sum(s_[3] for s_ in allp) / len(allp) + 0.06
    L = look or (cx, ly, cz); best = None; WHY.clear(); nfree = 0; line = has_line(b0, b1)
    for da in range(-spread, spread + 1, 5):
        for k in range(13):
            d = dist * (dr[0] + (dr[1] - dr[0]) * k / 12)
            for h in hs:
                a = math.radians(ang + da); cam = (L[0] + math.sin(a) * d, h, L[2] + math.cos(a) * d)
                if free and not free(cam): nfree += 1; continue
                f = _ok(cam, L, fov, phases, line, occ, maxoff)
                if f is None or f < 0: continue
                score = abs(da) / 40 + abs(d - dist) / dist + (0.25 - min(f, 0.25))
                if best is None or score < best[0]: best = (score, cam)
    if best is None:
        raise SystemExit(f'b{b0}: no lens for {[s_[0] for s_ in phases[0]]} round {ang} deg at {dist} m; rejections: {sorted(WHY.items(), key=lambda kv: -kv[1])[:6]}, not free: {nfree}')
    cam = best[1]; p1 = (cam[0] + (L[0] - cam[0]) * push, cam[1], cam[2] + (L[2] - cam[2]) * push)
    return view(tuple(round(c, 3) for c in cam), tuple(round(c, 3) for c in L), fov, p1=tuple(round(c, 3) for c in p1), **o)

# a frozen photo: a static lens, the flash at s, the print from s + 0.12 (the frame freezes there: the map's stop, the
# actors' holdAt); the 2D flash and the print come from the engine's flashAt and photo
def photo_fields(s): return dict(flashAt=[round(s, 3)], photo=round(s + 0.12, 3), stop=round(s + 0.1, 3), still=True)
def frozen(actors, s):
    for a in actors: a['holdAt'] = round(s + 0.1, 3)
    return actors
TRIPOD = view(POV, (4.0, 0.98, -2.1), 68)      # the camera's own view of the photo spot

# =====================================================================================================================
# BEAT 1, the party and the idea (b0-16): the drop; Kob at her dominoes with a frog; "a photo of all of us!"
# S00 the hook (b0-8, the drop): a swoop down under the string lights to the three dancing in the carport, Saxo in his
# straw hat with the instant camera in his paw
s00 = [A('saxo', 'charleston', -4.0, -1.15, at=0.7, hold='instant'),
       A('sadi', 'salsa_dancing_side_to_side', -4.85, -1.6, face='world', yaw=18, at=0.3),
       A('compote', 'salsa_dancing_side_to_side', -3.2, -1.6, face='world', yaw=-18, at=1.2)]
v = swoop([(-4.0, 2.55, 4.6), (-4.0, 1.5, 3.5), (-4.0, 0.75, 2.75), (-4.0, 0.55, 2.4)], (-4.0, 0.86, -1.35), fov=64, roll=(0, -4, -9, -6), ease='out')
add(0, 8, s00, "the hook: a swoop down under the string lights to the party in the carport, Saxo in his straw hat dancing with an instant camera in his paw, Sadi and Compote beside him", v,
    clear=clear_at(v) + [[-5.2, -3.7, 0.6], [-3.0, -3.9, 0.6]])
# S01 (b8-12): Kob's deadpan at the domino table, her partner a frog across the dominoes
s01 = [seated('kob', KOB_SEAT[0] + 0.1, KOB_SEAT[1], yaw=90)]
v = lens_for(s01, 90, 3.2, 8, 12, hs=(1.1, 1.25, 1.4), fov=40, spread=10, push=0.05, ease='lin')
add(8, 12, s01, "Kob at the domino table in her housecoat and curlers, deadpan, playing dominoes against a frog", v, noguests=True, tripod=False, frog=frog(4.1, TABLE_Y, 3.0, yaw=75, scale=0.9))
# S02 (b12-16): Saxo holds up the camera: a photo of all of us! Sadi claps, Compote glares
s02 = [A('saxo', 'happy_idle', -4.0, -1.2, at=0.4, **CAM_UP),
       A('sadi', 'clap_while_standing', -4.85, -1.55, face='world', yaw=30, at=0.2),
       A('compote', 'boxing_taunt', -3.15, -1.55, face='world', yaw=-30, at=0.3)]
v = lens_for(s02, 0, 3.6, 12, 16, hs=(0.55, 0.8), fov=56, push=0.12)
add(12, 16, s02, "Saxo holds up his camera: a photo of all of us! Sadi claps, Compote glares", v, tripod=False)

# =====================================================================================================================
# BEAT 2, three failed photos (b16-64)
# S03 PHOTO 1 (b16-24; the Short's first frame): his camera's view of the three by the plastic chairs: Sadi beaming on
# her chair, Compote glaring, and Kob between them with her back to the camera: the flash on b20, the print
s03 = [seated('sadi', *SPOT['sadi'], clip='clap_while_seated', at=0.3, speed=1.0),
       A('kob', 'happy_idle', 4.05, -2.0, face='world', yaw=180, at=0.3, speed=0.3),
       A('compote', 'happy_idle', 4.75, -1.9, face='world', yaw=-15, at=1.0, speed=0.5, arm='both', aim=[-0.3, -0.1, 0.4])]
fl = S(20, 16)
frozen(s03, fl)
v = view((4.1, 1.05, 1.05), (4.1, 1.0, -2.1), 60)   # his camera, held at his eyes
add(16, 24, s03, "PHOTO 1, his camera's view: Sadi beaming on her chair, Compote glaring, and Kob between them with her back to the camera: the flash, the print", v,
    tripod=False, noguests=True, frog=FROG_TABLE, **photo_fields(fl))
# S04 (b24-28): Saxo looks at the print: Kob's back. He sags
s04 = [A('saxo', 'shaking_head_no_dismissively', 3.9, -1.0, face='world', yaw=0, at=0.3, hold='polaroid1', holdScale=1.8, arm='R', aim=[0.55, 0.5, 0.55])]
v = lens_for(s04, 0, 2.6, 24, 28, hs=(0.95, 1.1), fov=50, spread=15, push=0.06)
add(24, 28, s04, "Saxo shakes his head at the print in his paw: the cat's back", v, tripod=False, noguests=True)
# S05 (b28-32): the self-timer: the camera on its little tripod on the domino table, its lens to us; Saxo at the table's
# side presses the red button on top and the red light starts blinking
SIDE = (4.72, 2.32)
s05 = [A('saxo', 'waving', 4.95, 2.32, face='world', yaw=-127, at=0.1, speed=0.6)]
v = view((2.6, 1.1, 0.45), (4.45, 0.98, 2.3), 50, p1=(2.66, 1.1, 0.51))
add(28, 32, s05, "the self-timer: the camera on its little tripod on the domino table, its red light starts blinking; Saxo waves everyone into place", v,
    tripod={'blink': [S(30.5, 28), 9.0]}, noguests=True, frog=frog(4.35, TABLE_Y, 2.85, yaw=200, scale=1.0))
# S06 (b32-36): the timer: the camera close from the front, its red light blinking faster, the frog beside it
v = view((3.72, 0.98, 1.4), (4.0, 0.86, 2.3), 44, p1=(3.76, 0.97, 1.5))
add(32, 36, [], "the timer: the camera close from the front, its red light blinking faster and faster", v,
    tripod={'blink': [-2.0, 6.0]}, noguests=True, frog=False)
# S07 (b36-40): the three wait by the plastic chairs in the timer's view, Sadi clapping, Compote's glove on Kob's shoulder
s07 = [seated('sadi', *SPOT['sadi'], clip='clap_while_seated', at=0.3, speed=1.0),
       seated('kob', *SPOT['kob']),
       A('compote', 'happy_idle', *SPOT['compote'], face='world', yaw=-15, at=0.5, arm='R', aim=[-0.55, 0.15, 0.55])]
v = view((4.0, 1.05, 1.95), (4.1, 1.0, -2.1), 60, p1=(4.0, 1.05, 1.85))
add(36, 40, s07, "the three wait by the plastic chairs, Sadi clapping, Compote's glove on Kob's shoulder: the timer running", v, noguests=True, tripod={'blink': [-4.0, 4.0]})
# S08 (b40-42.5): Saxo sprints for his place, side on
s08 = [A('saxo', 'happy_run', 1.45, -1.15, face='world', yaw=90, at=0.1, speed=1.4, mx=0.95, reveal=0.3)]
v = view((2.2, 0.8, 1.75), (2.2, 0.85, -1.15), 56)
add(40, 42.5, s08, "Saxo sprints for his place, side on, the timer about to go", v, noguests=True)
# S08b (b42.5-44): he trips: flat on his face in the grass
s08b = [A('saxo', 'falling_flat_on_face', 2.6, -1.3, face='world', yaw=90, at=0.0, speed=0.33, air=True)]   # the trip's flying start: off the floor by design
v = view((1.75, 0.55, 1.6), (2.95, 0.8, -1.3), 60, p1=(1.8, 0.55, 1.5), roll=[6, 10])
add(42.5, 44, s08b, "he trips and falls flat on his face in the grass", v, noguests=True, tripod={'blink': [-6.0, 2.0]})
# S09 PHOTO 2 (b44-50): the camera's view: the three posed, Saxo face down in front of them, the frog hops onto his
# back: the flash on "tiro" (b46.44), the print
s09 = [A('saxo', 'falling_flat_on_face', 3.0, -1.3, face='world', yaw=90, at=0.35, speed=0.15, air=True, lying=True),   # mid-fall in profile (clip 0.55 s at the flash): his head ~0.4 m under standing, beside Sadi (checked on the sheet)
       seated('sadi', *SPOT['sadi'], clip='clap_while_seated', at=0.55),
       seated('kob', *SPOT['kob']),
       A('compote', 'happy_idle', *SPOT['compote'], face='world', yaw=-15, at=0.5, speed=0, arm='R', aim=[-0.55, 0.15, 0.55])]
fl = S(46.44, 44)
frozen(s09, fl)
add(44, 50, s09, "PHOTO 2, the camera's view: the three posed, and the flash on 'tiro' catches Saxo mid-fall beside them, the print", TRIPOD,
    noguests=True, tripod=False, frog=False, **photo_fields(fl))
# S10 (b50-54): Kob's deadpan in her chair
s10 = [seated('kob', *SPOT['kob'])]
v = lens_for(s10, -5, 2.9, 50, 54, hs=(1.15, 1.3, 1.45), fov=40, spread=10, push=0.05, ease='lin')
add(50, 54, s10, "Kob in her chair, deadpan", v, noguests=True, tripod={})
# S11 (b54-58): handheld: Saxo aims the camera at Compote, an inch from her face; she raises her gloves
COMP3 = (-2.45, -1.6); SAX3 = (-2.45, -0.8)
s11 = [A('saxo', 'happy_idle', *SAX3, face='world', yaw=180, at=0.4, hold='instant', arm='R', aim=[0.1, 0.75, 0.6]),
       A('compote', 'happy_idle', *COMP3, face='world', yaw=0, at=0.5, arm='both', aim=[0.35, 0.7, 0.5], upAt=-1)]
v = view((1.05, 1.1, -0.95), (-2.45, 1.0, -1.02), 54, p1=(0.9, 1.1, -0.96))
add(54, 58, s11, "handheld: Saxo shoves his camera in Compote's face; she raises her boxing gloves", v, tripod=False, guests='watch', stare=[-2.45, -1.0], clear=clear_at(v) + clear_line(v))
# S12 PHOTO 3 (b58-61): his camera's view: her glove flies at the lens: the flash, the print
s12 = [A('compote', 'happy_idle', *COMP3, face='world', yaw=0, at=0.6, speed=0.5, hold='glove', arm='R', aim=[0.15, 0.55, 0.8], upAt=-1,
           toss={'at': 0.3, 'to': [-2.48, 0.8, -0.55], 'dur': 0.6, 'arc': 0.1, 'scale': 1.3})]   # she hurls a glove at the lens; the freeze holds it ~0.6 m from it, beside her face
fl = 0.55
frozen(s12, fl)
v = view((-2.45, 1.02, -0.25), (-2.45, 1.08, -1.6), 64)
add(58, 61, s12, "PHOTO 3, his camera's view: Compote hurls a boxing glove at the lens: the flash, the print: a red glove filling it, her glare behind", v, tripod=False, noguests=True, **photo_fields(fl))
# S13 (b61-64, the quiet bar; the chorus sings the title over him): Saxo on the floor, dizzy, the camera in his lap
s13 = [A('saxo', 'situps', -2.45, -0.55, face='world', yaw=0, at=1.0, speed=0, hold='instant', arm='R', aim=[0.2, -0.15, 0.6], sit=True, sitDrop=0.42)]
v = view((-1.2, 0.95, 1.6), (-2.45, 0.66, -0.55), 50, p1=(-1.25, 0.95, 1.5))
add(61, 64, s13, "on the quiet bar the chorus sings the title over him: Saxo sitting on the floor, staring at his camera", v, tripod=False, noguests=True)

# =====================================================================================================================
# BEAT 3, chorus 1 (b64-96): the party won't pose; the couple selfie and the frog; the empty chairs; the slump
# S14 (b64-68, 'fotos' on the drop): the party explodes; Sadi and Compote dance, Saxo behind them trying to frame it
s14 = [A('sadi', 'female_salsa_dancing', -4.45, -1.85, face='world', yaw=10, at=2.6),
       A('compote', 'salsa_dancing_side_to_side', -3.55, -1.85, face='world', yaw=-10, at=0.9),
       A('saxo', 'happy_idle', -5.15, -1.15, face='world', yaw=55, at=0.8, hold='instant', arm='R', aim=[0.1, 0.75, 0.6])]
v = lens_for(s14, 0, 4.0, 64, 68, hs=(0.95, 1.1), fov=62, spread=20, dr=(0.9, 1.3), push=0.05, roll=[-5, -3], hand=0.3)
add(64, 68, s14, "'fotos' on the drop: Sadi and Compote dance among the guests; Saxo at the side holds his camera up at them, nobody stays still", v, tripod=False, clear=clear_at(v))
# S15 PHOTO 4 (b68-76): the couple selfie in the carport, cheek to cheek; on 'beso' she leans in for a kiss and the frog
# leaps in between: the flash, the print
SAX4 = (-4.05, -1.3); SADI4 = (-4.72, -1.38)
s15 = [A('saxo', 'happy_idle', *SAX4, face='world', yaw=-8, at=1.0, speed=0.5, arm='R', aim=[0.2, 0.85, 0.5]),
       A('sadi', 'happy_idle', *SADI4, face='world', yaw=55, at=0.4, speed=0.5)]
fl = S(72.47, 68)
frozen(s15, fl)
v = view((-4.25, 1.9, 0.9), (-4.3, 1.0, -1.35), 74)
add(68, 76, s15, "PHOTO 4: the couple selfie, cheek to cheek; on 'beso' she leans in for a kiss and the frog leaps in between: the flash, the print", v, tripod=False,
    frog=frog(-5.6, 0.0, -0.4, yaw=20, pose='leap', at=fl - 0.38, to=[-4.39, 0.72, -1.16], dur=0.38, arc=0.3, scale=1.3), **photo_fields(fl))
# S16 (b76-80): Sadi shakes it off; the frog sits on Saxo's straw hat
s16 = [A('saxo', 'happy_idle', -4.05, -1.3, at=0.1, speed=0),
       A('sadi', 'shaking_head_no_dismissively', -4.95, -1.45, face='world', yaw=40, at=0.3)]
v = lens_for(s16, 10, 3.0, 76, 80, hs=(1.05, 1.3), fov=52, push=0.08)
add(76, 80, s16, "Sadi shakes it off; the frog sits on Saxo's straw hat, his face blank", v, tripod=False, noguests=True, frog=frog(-4.05, 1.28, -1.3, yaw=0, pose='puff'))
# S17 (b80-84, 'ojala'): the timer again: he sets it and runs
s17 = []
v = view((4.6, 0.95, 1.6), (4.0, 0.86, 2.3), 44, p1=(4.57, 0.95, 1.64))
add(80, 84, s17, "'ojala': the timer again, its red light blinking: he's off running for the chairs", v, tripod={'blink': [0.2, 6.0]}, noguests=True, frog=False, photos=3)
# S18 PHOTO 5 (b84-88, 'nunca'): the camera's view: nobody's left at the chairs but the frog on Sadi's; Saxo dives
# into the edge of the frame: the flash, the print
s18 = []
fl = S(84.94, 84)
add(84, 88, s18, "PHOTO 5, the camera's view, on 'nunca': nobody's left at the plastic chairs but the frog on Sadi's: the flash, the print", view(POV, (4.0, 0.72, -2.3), 50),
    noguests=True, tripod=False, frog=frog(CHAIRS[0][0], CHAIR_Y, CHAIRS[0][1] + 0.05, yaw=0, scale=1.4), **photo_fields(fl))
# S19 (b88-92, 'hoy'): he slumps in Kob's chair at the domino table over the failed prints, S01's framing with him in her
# place (a sit on the grass read as standing twice, and a profile turns the print edge-on: it faces his yaw)
s19 = [seated('saxo', KOB_SEAT[0] + 0.1, KOB_SEAT[1], yaw=90, hold='polaroid1', holdScale=1.6, arm='R', aim=[0.55, 0.5, 0.55])]
v = lens_for(s19, 90, 3.2, 88, 92, hs=(1.1, 1.25, 1.4), fov=40, spread=10, push=0.05, ease='lin')
add(88, 92, s19, "'hoy': he slumps in Kob's chair at the domino table, the failed prints fanned out in front of him, holding up the first one; the frog across the table", v, tripod={}, photos=5, noguests=True, frog=frog(4.1, TABLE_Y, 3.0, yaw=75, scale=0.9))
# S20 (b92-96): Sadi takes his paw and pulls him off to dance; the camera left on the table
s20 = [A('sadi', 'happy_walk', 3.95, 1.3, face='world', yaw=200, at=0.1, mx=-0.3, mz=-0.7, arm='L', aim=[0.6, 0.0, -0.5]),
       A('saxo', 'happy_walk', 4.75, 1.6, face='world', yaw=200, at=0.5, mx=-0.3, mz=-0.7)]
v = lens_for(s20, 215, 3.2, 92, 96, hs=(0.95, 1.15), fov=54, spread=40, push=0.05)
add(92, 96, s20, "Sadi takes his paw and leads him off to dance; the camera stays on the table", v, tripod={}, photos=5, noguests=True, frog=FROG_TABLE)

# =====================================================================================================================
# BEAT 4, chorus 2 (b96-120): they dance for real; Kob dances; the frog takes the camera
# S21 (b96-100, 'fotos' on the drop): the three dance by the plastic chairs; Kob watches from her table
DSPOT = {'saxo': (2.85, -1.55), 'sadi': (4.25, -1.65), 'compote': (4.95, -1.55), 'kob': (3.5, -2.3)}
s21 = [A('saxo', 'charleston', *DSPOT['saxo'], face='world', yaw=10, at=0.7),
       A('sadi', 'female_salsa_dancing', *DSPOT['sadi'], face='world', yaw=0, at=1.2),
       A('compote', 'salsa_dancing_side_to_side', *DSPOT['compote'], face='world', yaw=-10, at=0.6)]
v = low((3.9, 0.22, 2.25), (3.9, 0.85, -1.6), (3.9, 0.22, 2.05), fov=74, roll=(8, 5))
add(96, 100, s21, "'fotos' on the drop: they forget the photo and dance by the plastic chairs", v, tripod={}, noguests=True, frog=FROG_TABLE, photos=5)
# S22 (b100-104): Kob dances: standing on the plastic chair, the best of them, deadpan
s22 = [A('kob', 'charleston', CHAIRS[0][0], CHAIRS[0][1] + 0.05, face='world', yaw=0, at=1.45, lift=CHAIR_Y)]
v = view((3.5, 0.55, 0.15), (3.5, 1.25, -2.3), 56, p1=(3.5, 0.55, -0.15), roll=[-7, -4])
add(100, 104, s22, "and Kob dances: up on the plastic chair, kicking, the best of them, deadpan", v, tripod={}, noguests=True, frog=FROG_TABLE, photos=5)
# S23 (b104-108, 'beso', 'abrazo'): Sadi kisses his cheek for real, no frog, nobody filming
s23 = [A('saxo', 'happy_idle', 3.5, -1.5, face='world', yaw=-20, at=0.5, speed=0.5),
       A('sadi', 'happy_idle', 3.02, -1.5, face='world', yaw=90, at=1.2, speed=0.5)]
v = view((3.4, 1.0, 1.1), (3.3, 0.95, -1.5), 50, p1=(3.4, 1.0, 0.9))
add(104, 108, s23, "'beso': Sadi kisses his cheek for real, no frog, nobody filming", v, tripod={}, noguests=True, frog=FROG_TABLE, photos=5)
# S24 (b108-112): the frog hops off the table onto the camera
v = view((4.6, 1.2, 0.95), (4.05, 0.98, 2.4), 46, p1=(4.58, 1.2, 1.02))
add(108, 112, [], "the frog hops off the domino table onto the forgotten camera", v, tripod={}, noguests=True, photos=5,
    frog=frog(*FROG, yaw=200, pose='hop', at=0.6, to=list(CAM_TOP), dur=0.45, arc=0.3, scale=1.0))
# S25 (b112-116, 'ojala'): the four dance by the chairs, the camera and the frog in the foreground
s25 = [A('saxo', 'charleston', *DSPOT['saxo'], face='world', yaw=10, at=1.4),
       A('sadi', 'female_salsa_dancing', *DSPOT['sadi'], face='world', yaw=0, at=2.2),
       A('compote', 'salsa_dancing_side_to_side', *DSPOT['compote'], face='world', yaw=-10, at=1.4),
       A('kob', 'charleston', CHAIRS[0][0], CHAIRS[0][1] + 0.05, face='world', yaw=0, at=1.4, lift=CHAIR_Y)]
v = view((3.9, 1.15, 1.95), (3.9, 0.98, -1.8), 74, p1=(3.9, 1.14, 1.87))
add(112, 116, s25, "'ojala': the four dance by the plastic chairs, all of them, Kob kicking on her chair", v, tripod={}, noguests=True, photos=5, frog=frog(*CAM_TOP, yaw=200, scale=1.0))
# S26 (b116-120, 'nunca'): the frog on the camera raises a front leg over the shutter...
v = view((3.6, 1.15, 1.35), (4.0, 1.04, 2.31), 44, p1=(3.62, 1.15, 1.42))
add(116, 120, [], "'nunca': the frog on the camera lifts a front leg over the shutter", v, tripod={}, noguests=True, photos=5,
    frog=frog(*CAM_TOP, yaw=200, pose='press', at=S(119.6, 116), scale=1.0))
# S27 PHOTO 6 (b120-124, the break): the camera's view: the flash on the drop: all four dancing, the perfect photo
s27 = [A('saxo', 'charleston', *DSPOT['saxo'], face='world', yaw=10, at=1.55),
       A('sadi', 'female_salsa_dancing', *DSPOT['sadi'], face='world', yaw=0, at=1.8),
       A('compote', 'salsa_dancing_side_to_side', *DSPOT['compote'], face='world', yaw=-10, at=1.9),
       A('kob', 'charleston', CHAIRS[0][0], CHAIRS[0][1] + 0.05, face='world', yaw=0, at=1.55, lift=CHAIR_Y)]
fl = 0.0
frozen(s27, fl)
add(120, 124, s27, "PHOTO 6, the camera's view, on the break: the flash, and the print develops: all four dancing, Kob kicking on her chair: the perfect photo, the one nobody posed for", view(POV, (3.95, 0.98, -2.1), 76),
    noguests=True, tripod=False, **photo_fields(fl))
# S28 the button (b124-128.82): Saxo holds the perfect print up beside his face to us, tongue out, the frog on his hat
s28 = [A('saxo', 'happy_idle', 3.6, -1.3, at=0.6, speed=0.5, hold='polaroid', holdScale=2.2, arm='R', aim=[0.5, 0.5, 0.6], tongue=True)]
v = view((3.35, 1.15, 1.2), (3.45, 1.08, -1.3), 50, p1=(3.37, 1.15, 1.03))
add(124, 128.82, s28, "the button: Saxo holds the perfect print up beside his face, tongue out, the frog on his hat puffing", v, tripod={}, noguests=True, photos=5,
    frog=frog(3.6, 1.28, -1.3, yaw=0, pose='puff', scale=1.0))

for s in shots: clean(s['actors'])
shots.sort(key=lambda x: x['beat'])
ep = {
    'date': '2026-10-05', 'song': {'title': 'DtMF', 'artist': 'Bad Bunny'},
    'logline': "Saxo wants one photo of the whole gang at the family party, and like every pet owner who ever tried, he can't get it: Kob turns her back on his camera, he trips in front of the self-timer, the flash sets off Compote's boxing glove, the frog leaps into Sadi's kiss, then nobody's left but the frog; he gives up and they finally dance, and the frog presses the shutter: the perfect photo, the one nobody posed for",
    'new': "src/maps30.js: marquesina (a Puerto Rican family party at night: a pastel concrete house with iron-barred windows, the carport under its flat slab with string lights, a speaker and pet guests dancing; the yard with the album cover's two white plastic chairs among plantain plants, a mango tree, the domino table with Kob's chair, the low front wall, the neighbours' houses and the hills' lights, a crescent moon); the frog (a cartoon toad with a crest: sit, hop, leap, press, puff), the instant camera on its tripod (a self-timer light that blinks faster, a flash burst, a print sliding out), the failed prints on the table; props instant (a mint instant camera), polaroid and polaroid1 (a print held up, showing the episode's own photos) and glove (a red boxing glove thrown at the lens, frozen mid-air in the photo); two looks: Saxo's straw pava hat and white guayabera, Sadi's white ruffled sundress with a red hibiscus",
    'notes': "No clip: the official upload is a visualizer with a history lesson about the island's music. The world is the album's: Puerto Rico, a family party, the cover's two white plastic chairs among plantains, its frog. The words, from whitelisted keywords per line (keywords_es.py: sorted, never the lines): fotos, tirar, tuve, beso, abrazo, nunca, ojala, hoy, calle, corazon. The chorus says the singer should have taken more photos when he had her; ours makes it the pet owner's eternal group photo. The karaoke masks two words (a vulgar one and a drug slang word). Kob is the auntie in her housecoat and curlers who won't be photographed (and secretly dances best), Compote the boxer the flash sets off, Sadi the romance (her kiss goes to the frog first), the frog the photobomber who takes the only good photo. The Short (60 s or less, the end kept) opens on photo 1 (S03).",
    'with': ['sadi', 'kob', 'compote'],
    'clips': ['happy_idle', 'happy_walk', 'happy_run', 'sitting_talking', 'situps', 'charleston', 'salsa_dancing_side_to_side', 'female_salsa_dancing',
              'clap_while_standing', 'clap_while_seated', 'boxing_taunt', 'falling_flat_on_face', 'shaking_head_no_dismissively', 'waving'],
    'tags': {'structure': 'photo fail', 'scenes': ['carport party', 'the cat turns her back', 'self-timer trip', 'flash and the glove', 'frog photobomb', 'empty chairs', 'Kob dances on a chair', 'the frog takes the photo'],
             'cast': ['saxo', 'sadi', 'kob', 'compote'], 'hook': 'dance', 'maps': ['marquesina'], 'ref': 'none',
             'lyric_literal': "'fotos' (six photos, two on the chorus downbeats), 'tiro' (the flash on the word), 'beso' (the kiss that lands on the frog, then the real one), 'nunca' (nobody's left in the photo)",
             'experiment': "A pet-owner universal as the whole story (the impossible group photo of four pets: five failed prints, one perfect) on a Spanish-language global hit with a 1.09M-video sound: more likes per 1,000 views than the last week's chart-song episodes (8-10)?"},
    'shots': shots,
}
json.dump(ep, open(os.path.join(HERE, '2026-10-05-2.json'), 'w'), indent=1, ensure_ascii=False)
print(len(shots), 'shots;', len(WARN), 'warnings')
for w in WARN: print('  ', w)
