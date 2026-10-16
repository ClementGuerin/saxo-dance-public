# The "deja vu" episode (2026-10-16 2nd; Olivia Rodrigo, 2021): writes episodes/2026-10-16-2.json.
# Kit 2026-10-16-2: 66.032 s, song 147.42-213.452 s (the post-chorus's two lines, its three déjà vu lines, the bridge's rapid
# list, the outro's hook line three times, to the last chord gone), 90.4957 BPM, kit beat 0 = song beat 20 at 1.0563 s
# (kit t = 1.0563 + kit beat x 0.663015). The TikTok cut is the official sound's first 90 beats: kit -0.403-59.268 s
# (kit beats -2.2..87.8), the same grid (episodes/make_2026-10-16-2-tt.py shifts these shots by 0.403 s).
# The words, from whitelisted keywords per line (never the lines): 'show' (k0.0), 'played ... song ... singing' (k2.8-5.2),
# three déjà vu lines (k12-30.8), 'strawberry ice cream ... Malibu' (k31.9-34.6), 'jackets' (k41.3), 'play' (k48.2), 'girl
# ... new' (k57.1, 59.0), the hook line three times (k59.8, 76.0, 92.0).
# The world (the official video, contact sheets): a cream 1960s convertible along the Malibu coast, the new girl at the
# wheel in a paisley headscarf and sunglasses, strawberry ice cream with a blue spoon, a Spanish house on the cliff under
# red bougainvillea, a pink room, a green dress, a dark room of stacked old TVs replaying the memories.
# The story (structure REPLACED: the pet universal of the new arrival, here a robot vacuum; every one of the dog's moments
# replayed on the old TV, then the same frame now with the vacuum in his place; the payoff replaces the replacement):
#   0 (the post-chorus, k-1.5..12): in the beach house at dusk the dog (the singer's green dress and long hair) dances for
#     Sadi, who sits on the sofa singing to her new robot vacuum on her lap; his deadpan; he turns to the wall of old TVs.
#   1 (the déjà vu lines, k12..32): three memories on the old TV (faded home video, the date in the corner) and the same
#     frame now: their dance on the rug (now she dances with the spinning vacuum), him belly up on her lap (now the
#     vacuum), him in the convertible's passenger seat on the coast road (now the vacuum on a booster in tiny sunglasses,
#     the dog running after the car).
#   2 (the bridge, k32..60): her strawberry ice cream drops and the vacuum sucks it up from under his nose (his job); it
#     shares her ice cream in Malibu; they wear matching cardigans on 'jackets'; the cat rides it past him; on 'play' it
#     eats his ball; he barks at it; on 'girl ... new' every TV in the wall switches to the vacuum.
#   3 (the outro, k60..98): his furious dance in front of the TV wall; the courier at the door; out of the parcel pops a
#     robot dog; Sadi's new love on the sofa, the vacuum put on the floor; it rolls up to the dog: déjà vu for it too;
#     both chase her car; the duo's robot dance; he rides it; the button: both couples on the sofa, hearts.
import json, math, os, re, sys
sys.path.insert(0, os.path.dirname(__file__))
from cam import view

HERE = os.path.dirname(__file__)
PER, B0T = 60 / 90.4957, 1.0563
def T(b): return B0T + b * PER                   # kit seconds of kit beat b
def S(b, b0): return round((b - b0) * PER, 3)    # seconds from shot beat b0 to beat b

# the maps (src/maps52.js)
SEAT_Y, SLIFT = 0.2, 0.02                        # the low sofa's seat; a sitter's lift (the seated clip's hips 0.18 m over its feet)
SADI_M, SPOT = (0.62, -3.3), (-0.5, -3.3)       # Sadi's mark on the sofa, the dog's old spot beside her
LAPZ, LAPY = 0.3, 0.34                          # a vacuum on a sitter's lap: 0.3 m in front of the mark, 0.34 m up
CAR_PASS, CAR_DRV, CSEAT = (-0.18, 0.5), (-0.18, -0.5), 0.45
KS = 0.6                                         # the cat: Kob at 0.6, a cat-sized cat
LOOK = {'saxo': 'greendress', 'sadi': 'newgirl', 'kob': 'kob', 'compote': 'courier'}
HEAD = {'saxo': 1.55, 'sadi': 1.45, 'kob': 1.5 * KS, 'compote': 1.5}
FACE = {'saxo': 0.9, 'sadi': 0.84, 'kob': 0.86 * KS, 'compote': 0.86}
RAD = {'saxo': 0.48, 'sadi': 0.45, 'kob': 0.42 * KS, 'compote': 0.42}
CHARL = 2.467
def kick_at(rv): return round((1.6 - rv) % CHARL, 3)   # charleston's kick (clip 1.6 s) on the review frame, rv s into the shot

# the karaoke's word times (kit seconds; numbers only, never a word)
_src = open(os.path.join(HERE, '2026-10-16-2.lyrics.js')).read()
_rows = json.loads(re.search(r'window\.LYRICS = (.*?);\n', _src).group(1)); _ends = json.loads(re.search(r'window\.LINE_END = (.*?);\n', _src).group(1))
def Bt(t): return (t - B0T) / PER
LINES = [(Bt(row[0][0] - 0.35), Bt(e)) for row, e in zip(_rows, _ends)]
def has_line(b0, b1): return any(a < b1 and b > b0 for a, b in LINES)

def A(who, clip, x, z, **o):
    a = {'who': who, 'look': o.pop('look', LOOK[who]), 'clip': clip, 'x': round(x, 3), 'z': round(z, 3), 'face': o.pop('face', 'world'),
         'yaw': round(o.pop('yaw', 0), 1), 'at': o.pop('at', 0.4), 'speed': o.pop('speed', 1), **o}
    if who == 'kob': a.setdefault('scale', KS)
    return a
def idle(who, x, z, yaw, **o): return A(who, 'happy_idle', x, z, yaw=yaw, at=o.pop('at', 2.125), speed=o.pop('speed', 0), **o)
def dancer(who, x, z, yaw, rv, clip='charleston', **o):
    if clip == 'charleston': o.setdefault('at', kick_at(rv)); o.setdefault('speed', 1)
    return A(who, clip, x, z, yaw=yaw, **o)
def sofa(who, x=SADI_M[0], z=SADI_M[1], yaw=0, **o): return A(who, 'sitting_talking', x, z, yaw=yaw, at=0.05, speed=0, lift=SLIFT, **o)
def sit(who, x, z, yaw, lift=0.0, **o): return A(who, 'situps', x, z, yaw=yaw, at=o.pop('at', 1.0), speed=0, lift=lift, noLie=True, **o)
def lie(who, x, z, yaw, lift=0.0, **o): return A(who, 'laying_idle', x, z, yaw=yaw, at=o.pop('at', 1.0), speed=0, lift=lift, ground='mesh', **o)
PAWS_LAP = dict(arm='both', aim=[0.15, -0.45, 0.85], upAt=-1)            # both paws round the vacuum on her lap
PAW_ON = dict(arm='R', aim=[0.7, -0.45, 0.35], upAt=-1)                  # her right paw out on the vacuum beside her
BESIDE = (SADI_M[0] - 0.62, SADI_M[1] + 0.05)                          # the cushion at her right, where the dog used to sit
def sidevac(**o): return {'x': BESIDE[0], 'z': BESIDE[1], 'y': SEAT_Y, 'yaw': o.pop('yaw', 10), 'tilt': o.pop('tilt', 26), **o}
def lapvac(x=SADI_M[0], z=SADI_M[1], **o): return {'x': x, 'z': round(z + LAPZ, 3), 'y': o.pop('y', LAPY), 'yaw': o.pop('yaw', 0), 'tilt': o.pop('tilt', 38), **o}   # its top (the ring and the eyes) tipped to the lens: held flat it read as a dark dish
MEM = dict(zone='day')                                                  # the memories: a bright afternoon

# ---- a projection check (numbers only): where each face lands in the 9:16 frame at the shot's start and end ----
def head_rf(cam, look, fov, pt, rad):
    f = [look[i] - cam[i] for i in range(3)]; n = math.sqrt(sum(v * v for v in f)); dep = sum((pt[i] - cam[i]) * f[i] / n for i in range(3))
    return rad / max(dep, 0.1) / (math.tan(math.radians(fov) / 2) * 9 / 16) / 2
def _proj(cam, look, fov, pt):
    f = [look[i] - cam[i] for i in range(3)]; n = math.sqrt(sum(v * v for v in f)); f = [v / n for v in f]
    r = [-f[2], 0.0, f[0]]; rn = math.sqrt(r[0] ** 2 + r[2] ** 2) or 1; r = [r[0] / rn, 0.0, r[2] / rn]
    u = [r[1] * f[2] - r[2] * f[1], r[2] * f[0] - r[0] * f[2], r[0] * f[1] - r[1] * f[0]]
    d = [pt[i] - cam[i] for i in range(3)]; z = sum(a * b for a, b in zip(d, f))
    if z <= 0.05: return None
    tv = math.tan(math.radians(fov) / 2); th = tv * 9 / 16
    return (0.5 + sum(a * b for a, b in zip(d, r)) / z / th / 2, 0.5 - sum(a * b for a, b in zip(d, u)) / z / tv / 2)
def body(a, end):
    who = a['who']; x, z = a['x'] + a.get('mx', 0) * end, a['z'] + a.get('mz', 0) * end
    lift = a.get('lift', 0) + (a.get('my', 0) if end else 0); sc = a.get('scale', 1) / (KS if who == 'kob' else 1)
    fy, hy = FACE[who] * sc, HEAD[who] * sc
    if a.get('clip') == 'situps': fy, hy = 0.5 * a.get('scale', 1), 1.02 * a.get('scale', 1)
    if a.get('clip') == 'sitting_talking': fy, hy = 0.66 * sc, 1.18 * sc
    if a.get('clip') == 'laying_idle':   # lying face up: the face ~0.2 m over the body, the head out along -z rotated by yaw
        yw = math.radians(a.get('yaw', 0)); d = 0.6 * a.get('scale', 1); x, z = x - math.sin(yw) * d, z - math.cos(yw) * d; fy, hy = 0.3 * a.get('scale', 1), 0.45 * a.get('scale', 1)
    return (who, x, z, fy + lift, hy + lift)
def occluded(cam, look, fov, actors, end, W_, beat):   # a face inside a nearer head's disc
    pts = []
    for a in actors:
        if a.get('fg') or a['x'] < -20: continue
        who, x, z, fy, hy = body(a, end); p = _proj(cam, look, fov, (x, fy, z))
        if not p: continue
        dep = math.dist((cam[0], cam[2]), (x, z)); pts.append((dep, who, p, head_rf(cam, look, fov, (x, fy, z), RAD[who] * a.get('scale', 1) / (KS if who == 'kob' else 1))))
    pts.sort()
    for i, (d0, w0, p0, r0) in enumerate(pts):
        for d1, w1, p1, r1 in pts[i + 1:]:
            if math.hypot(p0[0] - p1[0], (p0[1] - p1[1]) * 16 / 9) < r0 + 0.45 * r1: W_.append(f'b{beat}: {w1} behind {w0}' + (' at the end' if end else ''))
def check(beat, b1, cam, look, fov, actors, end, W_):
    line = has_line(beat, b1)
    occluded(cam, look, fov, actors, end, W_, beat)
    for a in actors:
        if a.get('fg') or a['x'] < -20 or (a.get('reveal') and not end): continue
        who, x, z, fy, hy = body(a, end)
        top, face = _proj(cam, look, fov, (x, hy, z)), _proj(cam, look, fov, (x, fy, z))
        tag = ' at the end' if end else ''
        if not top or not face: W_.append(f'b{beat}: {who} behind the lens{tag}'); continue
        if line and top[1] < 0.27: W_.append(f'b{beat}: {who} head top at {top[1]:.2f} (lyric rows){tag}')
        if face[0] < 0.12 or face[0] > 0.88: W_.append(f'b{beat}: {who} face x {face[0]:.2f} (edge){tag}')
        if face[1] > 0.86 or face[1] < 0.0: W_.append(f'b{beat}: {who} face y {face[1]:.2f}{tag}')
def lens(v, k=0):
    c, f = v; a = math.radians(c['ang'][k]); fy = f[2] if len(f) > 2 else 0
    return (f[0] + math.sin(a) * c['r'][k], c['h'][k] + fy, f[1] + math.cos(a) * c['r'][k])
def inside(c, zone='room'):
    x, y, z = c
    if zone == 'road': return y > 0.12 and z < 2.7 and not (abs(x) < 2.15 and abs(z) < 1.12 and y < 1.0)
    if not (-5.8 < x < 5.8 and -4.35 < z < 5.25 and 0.08 < y < 4.0): return False
    if zone == 'open': return True
    if -1.85 < x < 1.85 and -4.35 < z < -3.0 and y < 1.12: return False      # inside the sofa
    if -2.55 < x < -1.95 and z < -3.4 and y < 2.1: return False              # in the floor lamp
    return True
def V(p0, l, fov=50, p1=None, **o): return ('V', p0, l, fov, p1, o)
def place(spec, dl=0.0, dk=1.0, da=0.0, dh=0.0):
    _, p0, l, fov, p1, o = spec
    L = (l[0], l[1] + dl, l[2])
    def tr(q):
        dx, dz = q[0] - l[0], q[2] - l[2]; a = math.radians(da); c, s_ = math.cos(a), math.sin(a)
        return (round(l[0] + (dx * c + dz * s_) * dk, 3), round(q[1] + dl + dh, 3), round(l[2] + (-dx * s_ + dz * c) * dk, 3))
    return view(tr(p0), L, fov, p1=tr(p1) if p1 else None, **o)
def problems(beat, b1, actors, v, zone):
    W_ = []; c, focus = v
    for k, end in ((0, 0), (-1, 1)):
        cam, look = lens(v, k), (focus[0], c['look'][k] + (focus[2] if len(focus) > 2 else 0), focus[1])
        check(beat, b1, cam, look, c['fov'], actors, end, W_)
        if not inside(cam, zone): W_.append(f'b{beat}: lens outside the {zone}')
    return W_
SOLVED = {}
def fit(spec, beat, b1, actors, zone):
    best = None
    for dl in (0, 0.1, 0.2, 0.3, 0.45):
        for dk in (1.0, 1.12, 1.25, 0.9, 1.4):
            for da in (0, -8, 8, -16, 16, -24, 24):
                for dh in (0, 0.15, -0.15, 0.3):
                    v = place(spec, dl, dk, da, dh)
                    n = len(problems(beat, b1, actors, v, zone))
                    score = n * 1000 + dl * 30 + abs(dk - 1) * 40 + abs(da) + abs(dh) * 20
                    if best is None or score < best[0]: best = (score, v, (dl, dk, da, dh))
                    if n == 0 and score < 1: return v
    SOLVED[beat] = best[2]
    return best[1]
shots = []; REV = []; WARN = []
def add(beat, b1, actors, lyric, v, rv=None, map_='beachhouse', **o):
    if o.pop('drop', False): return
    o = {k: val for k, val in o.items() if val is not None}
    zone = o.pop('zone_lens', 'road' if map_ == 'coastroad' else 'room')
    if v[0] == 'V': v = fit(v, beat, b1, actors, zone)
    c, focus = v
    for k, end in ((0, 0), (-1, 1)):
        cam, look = lens(v, k), (focus[0], c['look'][k] + (focus[2] if len(focus) > 2 else 0), focus[1])
        check(beat, b1, cam, look, c['fov'], actors, end, WARN)
        if not inside(cam, zone): WARN.append(f'b{beat}: lens outside the {zone} {tuple(round(q, 2) for q in cam)}')
    t0 = 0 if not shots else T(beat)
    REV.append(round(t0 + (rv if rv is not None else 0.6 * (T(b1) - t0)), 2))
    if all(a['x'] < -20 for a in actors): o.setdefault('stars', ['saxo'])
    shots.append({'beat': beat, 'kind': 'dance', 'map': map_, 'actors': actors, 'lyric': lyric, 'cam': c, 'focus': focus, **o})
    return v

# ============================================ the post-chorus: the new girl on his sofa ============================================
# S00 (k-1.47..2; 'show'): the hook: low on the rug, the dog in the singer's green dress dances the charleston for Sadi, who
# sits behind him on the pink sofa with her new robot vacuum on her lap, petting it, hearts: she never looks at him
s = [dancer('saxo', -0.55, -1.45, 10, S(0.6, -1.47)), sofa('sadi', **PAW_ON)]
add(-1.47, 2, s, "the hook: the beach house at dusk, the dog in the singer's green dress and long hair dancing the charleston at the lens, and behind him Sadi on the pink sofa cuddling her new robot vacuum on her lap, hearts over them: she never looks at him",
    V((0.3, 0.3, 0.75), (0.05, 0.72, -2.3), fov=60, p1=(0.25, 0.28, 0.4), roll=[-8, -5]), vac=[sidevac(eyes='heart', hearts=0)], hearts=[[SADI_M[0], 1.25, SADI_M[1] + 0.2, 0]], rv=S(0.6, -1.47))
# S01 (k2..6.6; 'played ... song ... singing'): she sings to the vacuum held up on her lap; the dog's head peeks over the sofa's arm
s = [sofa('sadi', **PAW_ON), A('saxo', 'happy_idle', 1.72, -3.15, yaw=-40, at=2.125, speed=0, lift=-0.5)]
add(2, 6.6, s, "'played ... song ... singing': Sadi sings to the robot vacuum on her lap, hearts; the dog's eyes and ears peek over the end of the sofa, deadpan",
    V((0.75, 0.9, -0.45), (0.8, 0.5, -3.2), fov=62), vac=[sidevac(eyes='heart', hearts=0)], hearts=[[SADI_M[0], 1.2, SADI_M[1] + 0.2, 0]], rv=S(5.2, 2))
# S02 (k6.6..9.3): the dog's deadpan, locked off: the green dress, the TV light on his face, the two lovebirds behind him
s = [idle('saxo', -0.45, -0.6, 0), sofa('sadi', **PAW_ON)]
add(6.6, 9.3, s, "the dog's deadpan, locked off and frontal, the TVs' glow on his face; behind him Sadi and the vacuum on the sofa",
    V((-0.42, 1.0, 1.6), (-0.4, 0.98, -0.6), fov=46, p1=(-0.42, 1.0, 1.35)), vac=[sidevac(eyes='heart', hearts=0)], rv=S(8, 6.6))
# S03 (k9.3..12): he turns to the wall of old TVs, his back to us: the lens pushes in on the middle set
s = [idle('saxo', -0.55, 2.4, 180, fg=True)]
add(9.3, 12, s, "he turns to the wall of old TVs, his back to us, and the lens pushes past him into one screen: the memories",
    view((0.2, 1.35, 0.9), (0.3, 1.3, 5.4), 56, p1=(0.28, 1.33, 3.2)), tvs=['memory', 'show', 'heart', 'memory', 'show', 'memory', 'heart', 'memory', 'show', 'memory', 'heart', 'show'], zone_lens='open', rv=S(10.3, 9.3))

# ============================================ the déjà vu lines: three memories, three replays ============================================
# S04 (k12..16; the first déjà vu line): on the old TV (faded home video, the date): the dog in his own check suit and Sadi in her pink blazer dancing together on this rug
s = [dancer('saxo', -0.48, -0.4, 12, S(13.6, 12), look='saxo'), dancer('sadi', 0.48, -0.4, -12, S(13.6, 12) + 0.3, look='sadi')]
M1 = add(12, 16, s, "the first déjà vu line: a memory on the old TV (faded home video, the date in the corner): the dog in his own check suit and Sadi in her pink blazer dancing the charleston together on this rug, hearts",
    V((0.0, 1.05, 3.5), (0.0, 1.0, -0.5), fov=54), crt={'date': 'JUL 4 2025'}, hearts=[[0.0, 1.85, -0.4, 0]], **MEM, rv=S(13.6, 12))
# S05 (k16..20): now, the same frame: Sadi dances with the spinning vacuum where he was; he watches from the edge
s = [dancer('sadi', 0.48, -0.4, -12, S(17.6, 16) + 0.3)]
add(16, 20, s, "now, the same frame: Sadi dances the same dance with the robot vacuum spinning on the rug where he stood, hearts; the dog at the frame's edge",
    M1, vac=[{'x': -0.3, 'z': -0.3, 'yaw': 25, 'eyes': 'heart', 'tilt': 34, 'bump': [S(b, 16) for b in (16.5, 17.5, 18.5, 19.5)]}], hearts=[[0.1, 1.85, -0.4, 0]], rv=S(17.6, 16))
# S06 (k20..24; the second): on the old TV: the dog belly up across Sadi's lap on the sofa, her paw on his belly, tongue out, hearts
s = [sofa('sadi', look='sadi', arm='R', aim=[0.3, -0.35, 0.8], upAt=-1), lie('saxo', SADI_M[0] - 0.05, SADI_M[1] + 0.36, 90, lift=SEAT_Y + 0.08, look='saxo', tongue=True, arm='both', aim=[0.45, 0.45, 0.8], upAt=-1)]
M2 = add(20, 24, s, "the second déjà vu line: on the old TV: the dog in his check suit belly up across Sadi's lap on the sofa, her paw on his belly, his tongue out, hearts",
    V((1.7, 1.75, -1.2), (0.45, 0.45, -3.0), fov=54), crt={'date': 'AUG 2 2025'}, hearts=[[SADI_M[0], 1.35, SADI_M[1] + 0.1, 0]], **MEM, rv=S(22, 20))
# S07 (k24..28): now, the same frame: the vacuum on her lap, her paws round it, hearts; the dog's head peeks up at the frame's bottom
s = [sofa('sadi', **PAWS_LAP)]
add(24, 28, s, "now, the same frame: the robot vacuum on her lap, her paws round it, hearts; the dog's eyes peek up into the bottom of the frame",
    M2, vac=[lapvac(eyes='heart', y=0.27, z=SADI_M[1] + 0.06, tilt=18)], hearts=[[SADI_M[0], 1.35, SADI_M[1] + 0.1, 0]], rv=S(26, 24))
# S08 (k28..30; the third): on the old TV: the coast road, the dog in the convertible's passenger seat, paws over the door, tongue out in the wind, Sadi at the wheel
s = [A('sadi', 'male_driving_a_car', *CAR_DRV, yaw=90, at=0.5, speed=1, lift=CSEAT, look='sadi'), A('saxo', 'happy_idle', CAR_PASS[0] + 0.08, CAR_PASS[1] + 0.12, yaw=90, at=2.125, speed=0, lift=CSEAT, look='saxo', tongue=True, arm='both', aim=[0.15, -0.25, 0.95], upAt=-1)]
M3 = add(28, 30, s, "the third déjà vu line: on the old TV: the coast road, the dog in his check suit standing in the convertible's passenger seat, paws over the door, tongue out in the wind, Sadi at the wheel",
    V((2.6, 1.2, 2.2), (-0.15, 1.0, 0.25), fov=52), map_='coastroad', crt={'date': 'SEP 9 2025'}, hide=['palms'], rv=S(29.2, 28))
# S09 (k30..32): now, the same frame: the vacuum on a booster in his seat, tiny sunglasses on; the dog running after the car
s = [A('sadi', 'male_driving_a_car', *CAR_DRV, yaw=90, at=0.5, speed=1, lift=CSEAT)]
add(30, 32, s, "now, the same frame: the robot vacuum in his seat on a pink booster cushion, tiny sunglasses on, Sadi at the wheel",
    M3, map_='coastroad', hide=['palms'], vac=[{'x': CAR_PASS[0] + 0.02, 'z': CAR_PASS[1], 'y': CSEAT, 'booster': 0.62, 'yaw': 90, 'tilt': 30, 'shades': True, 'eyes': 'happy'}], rv=S(31.3, 30))

# ============================================ the bridge: everything that was his ============================================
# S10 (k32..34; dropped with S11 after the critic: the scoop flew through the lyric rows and nothing read as stolen; their beats went to S09 and S12): Sadi's strawberry ice cream: the scoop slips out of her cup; the dog sitting below her lights up
CUP = (SADI_M[0] + 0.36, 0.76, SADI_M[1] + 0.38)
s = [sit('saxo', 0.75, -2.2, 0, tongue=True)]
add(32, 34, s, "'strawberry ice cream': Sadi's scoop of strawberry ice cream slips out of her cup; the dog sitting at her feet lights up, tongue out (catching what falls is his job)",
    view((0.75, 0.75, 0.6), (0.72, 0.45, -1.75), 58), snack=[{'kind': 'scoop', 'from': [1.25, 1.55, -1.75], 'to': [1.05, -1.6], 's0': S(33.0, 32), 'dur': 0.45, 'arc': 0.0}], drop=True, rv=S(33.0, 32) + 0.25)
# S11 (k34..36; 'Malibu'): on the floor: the vacuum zooms in under his nose and sucks the scoop up
s = [sit('saxo', 0.75, -2.2, 0, tongue=True)]
add(34, 36, s, "'... in Malibu': on the floor: the vacuum zooms in under his nose and sucks the scoop up, the dog's tongue out over nothing",
    V((0.75, 0.75, 0.6), (0.72, 0.45, -1.75), fov=58), vac=[{'x': -0.5, 'z': -1.6, 'yaw': 90, 'to': [0.82, -1.6], 'at': 0.05, 'dur': 0.55, 'eyes': 'happy', 'tilt': 12}],
    snack=[{'kind': 'scoop', 'from': [1.05, 0.03, -1.6], 'to': [1.05, -1.6], 's0': -1, 'dur': 0.1, 'gone': 0.55}], drop=True, rv=0.62)
# S12 (k36..40): the coast road: the vacuum shares her ice cream in Malibu (a scoop on its lid), the dog running after the car
s = [A('sadi', 'male_driving_a_car', *CAR_DRV, yaw=90, at=0.5, speed=1, lift=CSEAT), A('saxo', 'happy_run', -4.7, 0.65, yaw=90, at=0.6, speed=1.6)]
M12 = add(34, 40, s, "the coast road at sunset: the vacuum on its booster with a scoop of strawberry ice cream on its lid, heart eyes, Sadi at the wheel; the dog still running after the car",
    V((3.6, 1.3, 2.3), (-1.2, 0.95, 0.2), fov=52), map_='coastroad', vac=[{'x': CAR_PASS[0] + 0.02, 'z': CAR_PASS[1], 'y': CSEAT, 'booster': 0.5, 'yaw': 90, 'tilt': 12, 'eyes': 'heart', 'hearts': 0.3}],
    snack=[{'kind': 'scoop', 'from': [CAR_PASS[0] + 0.02, CSEAT + 0.5 + 0.15, CAR_PASS[1]], 'to': [CAR_PASS[0] + 0.02, CAR_PASS[1]], 's0': 99}], rv=S(38, 36))
# S13 (k40..44; 'jackets'): twinning: the vacuum in a pink cardigan just like hers, Sadi posing beside it, hearts; the dog stares
s = [idle('sadi', 0.5, -0.75, -20, arm='both', aim='heart', upAt=-1), idle('saxo', -0.6, -0.15, 30)]
add(40, 44, s, "'jackets': twinning: the vacuum wears a pink cardigan just like hers and Sadi poses beside it, hearts; the dog stares",
    V((0.25, 0.95, 1.6), (0.15, 0.6, -0.6), fov=56), vac=[{'x': 0.05, 'z': -0.4, 'yaw': 10, 'tilt': 30, 'cardigan': S(41.2, 40), 'eyes': 'heart', 'hearts': S(41.3, 40)}], rv=S(42, 40))
# S14 (k44..48): the cat rides the vacuum across the rug past the dog, deadpan; his head follows her
s = [A('kob', 'situps', 0.95, -1.75, yaw=-35, at=1.0, speed=0, lift=0.1, noLie=True, mx=-0.75, mz=1.15), idle('saxo', -0.75, -1.2, 40)]
add(44, 48, s, "the cat rides the vacuum across the rug past the dog, deadpan; even the cat has gone over to it",
    V((0.55, 0.6, 1.2), (0.2, 0.5, -1.0), fov=58), vac=[{'x': 0.95, 'z': -1.75, 'yaw': -35, 'to': [0.2, -0.6], 'at': 0, 'dur': 2.65, 'lin': True, 'eyes': 'happy'}], rv=S(46, 44))
# S15 (k48..52; 'play'): he drops his ball for a game; the vacuum rolls over it and swallows it
s = [A('saxo', 'happy_idle', 0.1, -1.0, yaw=0, at=2.125, speed=0, fetch={'kind': 'ball', 'until': S(49.6, 48)})]
add(48, 54, s, "'play': the dog drops his ball at the lens for a game, and the vacuum rolls over it and swallows it",
    V((0.2, 1.05, 1.5), (0.1, 0.4, -0.75), fov=56), vac=[{'x': -1.2, 'z': -0.25, 'yaw': 90, 'to': [0.15, -0.25], 'at': S(50.0, 48), 'dur': 0.7, 'eyes': 'happy'}],
    snack=[{'kind': 'ball', 'from': [0.1, 0.62, -0.62], 'to': [0.15, -0.25], 's0': S(49.6, 48), 'dur': 0.35, 'arc': 0.05, 'gone': S(50.95, 48)}], rv=S(50.75, 48))
# S16 (k52..56): he barks at it; it bumps his paws on every beat, the cat riding it, unbothered
s = [A('saxo', 'long_yell_leaning_forward', -0.75, -0.95, yaw=90, at=1.45, speed=0.15), A('kob', 'situps', 0.75, -0.95, yaw=-90, at=1.0, speed=0, lift=0.1, noLie=True)]
add(52, 56, s, drop=True, lyric="the dog barks at the vacuum; it bumps into his paws on every beat with the cat riding it, unbothered",
    v=V((0.0, 0.75, 2.0), (0.0, 0.62, -0.95), fov=58), vac=[{'x': 0.75, 'z': -0.95, 'yaw': -90, 'bump': [S(b, 52) for b in (52.5, 53.5, 54.5, 55.5)], 'eyes': 'dot'}], bark=[[-0.22, 0.8, -0.95, 90, 0]], rv=S(54.5, 52))
# S17 (k56..60; 'girl ... new'): over his shoulder at the wall of TVs: on 'girl' every screen switches to the vacuum
s = [idle('saxo', -0.45, 2.7, 180, fg=True)]
add(54, 60, s, "'girl ... new': over the dog's shoulder at the wall of old TVs: on 'girl' every screen switches to the vacuum with a heart",
    view((-1.05, 1.3, 1.1), (0.2, 1.35, 5.4), 58), tvs='show', tvs2=[S(57.0, 54), 'vac'], zone='night', zone_lens='open', rv=S(58.4, 54))

# ============================================ the outro: the replacement replaced ============================================
# S18 (k60..64; the hook line): his furious dance in front of the TVs, every screen the vacuum: low and dutch
s = [dancer('saxo', 0.15, 3.35, 185, S(62, 60))]
add(60, 64, s, "the hook line: the dog's furious charleston in front of the wall of TVs, every screen showing the vacuum with a heart",
    V((0.45, 0.32, 0.95), (0.2, 0.92, 3.35), fov=62, p1=(0.4, 0.3, 1.35), roll=[9, 6]), tvs='vac', zone='night', zone_lens='open', rv=S(62, 60))
# S19 (k64..68): the door swings open: the courier with a huge parcel tied with a red bow, deadpan
s = [idle('compote', 6.75, 1.45, -90, arm='R', aim=[0.45, -0.2, 0.7], upAt=-1)]
add(64, 68, s, "the doorbell: the front door swings open on the courier, deadpan, a huge parcel tied with a red bow at her feet",
    V((3.2, 1.1, 1.75), (6.4, 0.95, 1.6), fov=52), door=[0.0, 0.6, 0, 1], parcel={'x': 5.4, 'z': 1.25}, zone_lens='open', rv=S(66.5, 64))
# S20 (k68..72): the lid flies off: a robot dog pops out, heart eyes; Sadi's paws on her cheeks
s = [idle('sadi', 2.75, 1.3, 50, arm='both', aim=[0.05, 0.42, 0.6], upAt=-1)]
add(68, 72, s, "the parcel opens: its lid flies off and a robot dog pops out with heart eyes, wagging; Sadi's paws on her cheeks, hearts",
    V((3.3, 1.15, 4.0), (3.25, 0.85, 1.3), fov=54), parcel={'x': 3.75, 'z': 1.1, 'open': S(68.6, 68)}, robo={'x': 3.75, 'z': 1.1, 'yaw': -15, 'pop': [S(68.6, 68) + 0.08, 0.35], 'eyes': 'heart', 'wag': True, 'hearts': S(68.9, 68)}, hearts=[[2.75, 1.3, 1.3, S(68.9, 68)]], zone_lens='open', rv=S(68.6, 68) + 0.42)
# S21 (k72..76): the sofa: the robot dog beside her now, her paw on it, hearts; the vacuum on the floor, its eyes sad
s = [sofa('sadi', x=0.55, arm='R', aim=[-0.85, -0.35, 0.3], upAt=-1)]
add(72, 76, s, "on the sofa the robot dog sits in the old spot beside her, her paw on it, hearts; the vacuum put down on the floor, its eyes sad",
    V((0.25, 0.9, -0.55), (0.25, 0.5, -3.0), fov=60), robo={'x': -0.15, 'z': -3.3, 'y': SEAT_Y, 'yaw': 15, 'pose': 'sit', 'eyes': 'heart', 'wag': True}, hearts=[[0.2, 1.05, -3.2, 0]], vac=[{'x': 0.05, 'z': -2.1, 'yaw': 0, 'eyes': 'sad', 'tilt': 30}], rv=S(74, 72))
# S22 (k76..80; the hook line again): the old vacuum rolls up to the dog and bumps his paw; he looks down: déjà vu, for it too
s = [sit('saxo', -0.6, -0.2, 180, fg=True)]
add(76, 78, s, drop=True, lyric= "the hook line again: the old vacuum, put aside, rolls slowly across the rug towards the dog, its eyes sad",
    v=view((0.35, 1.75, 1.55), (-0.35, 0.15, -1.5), 56), vac=[{'x': 0.1, 'z': -2.3, 'yaw': -15, 'to': [-0.45, -0.85], 'at': 0, 'dur': 1.33, 'lin': True, 'eyes': 'sad'}], rv=S(77.2, 76))
s = [sit('saxo', -0.3, -0.75, 10)]
add(76, 80, s, "the hook line again: the old vacuum, put aside, rolls slowly in and bumps his paw, then settles beside him: the two exes side by side facing us, deadpan: déjà vu, for it too",
    V((0.0, 0.9, 1.25), (-0.05, 0.45, -0.6), fov=54), vac=[{'x': 1.25, 'z': -0.2, 'yaw': -95, 'to': [0.25, -0.5], 'at': 0.2, 'dur': 1.5, 'eyes': 'sad', 'tilt': 25, 'bump': [S(78.3, 76)]}], rv=S(79.2, 76))
# S23 (k80..84): the coast road: the robot dog in the passenger seat now, wagging; behind the car the dog AND the vacuum chase it
s = [A('sadi', 'male_driving_a_car', *CAR_DRV, yaw=90, at=0.5, speed=1, lift=CSEAT), A('saxo', 'happy_run', -4.7, 0.65, yaw=90, at=0.6, speed=1.6)]
add(80, 84, s, "the coast road: the robot dog rides in the passenger seat now, wagging, heart eyes; behind the car the dog and the old vacuum chase it together",
    M12, map_='coastroad', robo={'x': CAR_PASS[0], 'z': CAR_PASS[1], 'y': CSEAT, 'yaw': 90, 'pose': 'sit', 'eyes': 'heart', 'wag': True},
    vac=[{'x': -4.2, 'z': 1.35, 'yaw': 90, 'eyes': 'happy', 'tilt': 30, 'bump': [S(b, 80) for b in (80.5, 81.5, 82.5, 83.5)]}], hide=['palms'], rv=S(82, 80))
# S24 (k84..88): name a better duo: the dog does the robot beside the vacuum spinning on the rug
s = [dancer('saxo', -0.3, -0.5, 10, S(86, 84))]
add(84, 88, s, "the duo: the dog dances the charleston he used to dance with her, the vacuum spinning beside him in time, heart eyes",
    V((0.05, 0.85, 1.9), (0.0, 0.65, -0.5), fov=56), vac=[{'x': 0.35, 'z': -0.35, 'spin': 270, 'eyes': 'heart', 'tilt': 22}], rv=S(86, 84))
# S25 (k88..92): he rides it: sitting on the vacuum, tongue out, cruising at the lens
s = [A('saxo', 'situps', -1.3, -1.4, yaw=40, at=1.0, speed=0, lift=0.1, noLie=True, tongue=True, mx=1.6, mz=1.15)]
add(88, 92, s, "he rides it: the dog sitting on the vacuum, tongue out, cruising across the rug towards the lens, both happy",
    V((0.6, 0.42, 1.25), (-0.3, 0.45, -0.7), fov=60), vac=[{'x': -1.3, 'z': -1.4, 'yaw': 40, 'to': [0.3, -0.25], 'at': 0, 'dur': 2.65, 'lin': True, 'eyes': 'happy'}], rv=S(90, 88))
# S26 (k92..98; the hook line, the last chord): both couples on the sofa: Sadi and the robot dog, the dog with the vacuum on his lap: hearts over both
s = [sofa('sadi', x=0.95, arm='R', aim=[0.7, -0.45, 0.35], upAt=-1), sofa('saxo', x=-0.95, arm='L', aim=[0.7, -0.45, 0.35], upAt=-1)]
add(92, 98.0, s, "the hook line and the last chord: both couples on the sofa: Sadi with the robot dog on her lap, the dog with the vacuum on his, hearts over both",
    V((0.0, 1.25, 2.0), (0.0, 1.05, -3.2), fov=54), hearts=[[-0.65, 1.15, -3.1, 0.4], [0.65, 1.15, -3.1, 0.0]], robo={'x': 0.33, 'z': -3.28, 'y': SEAT_Y, 'yaw': 0, 'pose': 'sit', 'eyes': 'heart', 'wag': True, 'scale': 0.85},
    vac=[{'x': -0.35, 'z': -3.25, 'y': SEAT_Y, 'yaw': -5, 'eyes': 'heart', 'tilt': 26}], rv=S(95, 92))

shots.sort(key=lambda x: x['beat'])
ep = {
    'date': '2026-10-16', 'song': {'title': 'deja vu', 'artist': 'Olivia Rodrigo'},
    'logline': "Sadi's new robot vacuum gets every one of the dog's moments, her lap, the convertible's passenger seat, her strawberry ice cream, matching cardigans, even the cat, each one replayed on the old TV and then the same frame now, until a robot dog pops out of a parcel and the vacuum gets déjà vu too.",
    'new': "src/maps52.js: beachhouse (the clip's pink room in a Spanish house on the Malibu cliff at dusk: the sunset sea in the arched windows, a stained-glass window, the pink velvet sofa, a wall of old TVs whose screens switch per shot, the front door on the porch) and coastroad (the Pacific Coast Highway at golden hour streaming past the clip's cream convertible); the robot vacuum (a character: LED eyes dot, heart, sad, happy, a cardigan, sunglasses, a booster cushion, spinning, sucking up a scoop and a ball), the robot dog, the parcel; the 2D `crt` frame (a memory replayed on an old TV, faded like a home video); the props `icecream` and `icecup`; three looks: Saxo's green slip dress and long brunette hair (the singer's), Sadi's paisley headscarf and pink cardigan, Compote the courier; the structure REPLACED",
    'notes': "The world, from the official video (contact sheets): a cream 1960s convertible on the Malibu coast with the new girl at the wheel in a paisley headscarf, strawberry ice cream with a blue spoon, a Spanish house on the cliff, a pink room, a green dress, a dark room of stacked old TVs replaying the memories. The words, from whitelisted keywords per line: show, played, song, singing, strawberry, ice cream, Malibu, jackets, play, girl, new. Cast: Saxo in the singer's green dress (the dog replaced), Sadi in the new girl's headscarf and cardigan (the one who moved on), the robot vacuum (the new girl), Kob at 0.6 scale (the cat who rides it), Compote the courier (delivers the robot dog). The memories wear the base looks.",
    'tiktok_sound': '6945541245435381761',
    'with': ['sadi', 'kob', 'compote'],
    'clips': sorted({a['clip'] for s in shots for a in s['actors']}),
    'tags': {'structure': 'replaced', 'scenes': ['the vacuum on her lap', 'the memories on the old TV', 'the vacuum in his seat', 'the dog chasing the car', 'the scoop sucked up', 'matching cardigans', 'the cat on the vacuum', 'the ball swallowed', 'the bark', 'the TV wall', 'the parcel', 'the robot dog', 'the duo', 'riding the vacuum', 'both couples'],
             'cast': ['saxo', 'sadi', 'kob', 'compote'], 'hook': 'dance', 'maps': ['beachhouse', 'coastroad'], 'ref': 'none',
             'lyric_literal': "'show' (watching the TV), 'played ... song ... singing' (she sings to the vacuum), 'strawberry ice cream' (her scoop drops), 'Malibu' (the coast road), 'jackets' (matching cardigans), 'play' (his ball), 'girl ... new' (every TV switches to the vacuum)",
             'experiment': "Does a gadget as the rival (the dog replaced by a robot vacuum, every moment replayed on the old TV then the same frame now, the vacuum replaced in turn by a robot dog) read as a story with no second face, and hold the Short's views against our pet-rival episodes?"},
    'shots': shots,
}
json.dump(ep, open(os.path.join(HERE, '2026-10-16-2.json'), 'w'), indent=1, ensure_ascii=False)
os.makedirs(os.path.join(HERE, '..', 'out', 'check'), exist_ok=True)
open(os.path.join(HERE, '..', 'out', 'check', 'dv_rev_times.txt'), 'w').write(','.join(f'{t:.2f}' for t in REV))
print(len(shots), 'shots;', len(WARN), 'warnings')
for b, q in SOLVED.items(): print('   moved', b, q)
for w in WARN: print('  ', w)
