# The "Shape of You" episode (2026-10-17 2nd; Ed Sheeran, 2017): writes episodes/2026-10-17-2.json.
# Kit 2026-10-17-2: 63.945 s, song 27.505-90.700 s + 0.75 s of silence (the pre-chorus from its half-beat pickup, the
# chorus, the post-chorus to the title line's last word), 96 BPM, kit beat 0 = song beat 44 at kit 0.3097 s
# (kit t = 0.3097 + beat x 0.625). The official TikTok sound is kit beats 24.86-120.86: its cut is this episode's
# shots from 24.86 to the end (episodes/make_2026-10-17-2-tt.py).
# The words, from whitelisted keywords per line (never the lines; kit beats): dance 2.0, singing 3.2, love 7.2 and 8.3,
# lead 15.2, crazy 17.1, talk 22.0, waist 25.2, body 27.2, lead 31.2 and 34.2, love 38.2, SHAPE 39.2, push 41.6,
# pull 42.2, magnet 43.5, heart 46.2, falling 47.1, love 50.3, body 51.3, night 54.0, room 56.1, bed 58.3, smell 59.0,
# day 61.0, discovering 61.5, new 64.2; the post-chorus: body 67.5, 75.4, 83.5, 91.2 (vocalised rows between), day 93.0,
# discovering 93.4, new 96.1, love 98.2, SHAPE 99.2.
# The world (the official video, contact sheets): a boxer in a blue hoodie training in a red-brick gym under big
# windows, a diner date in a varsity jacket, runs past freight trains, an underground sumo bout; Ed in a navy varsity
# jacket with cream sleeves over a grey hoodie.
# The story (structure VELCRO, new: the pet universal of the dog who can't be apart from you for one second: wherever
# she goes he gets there in a straight line, through whatever stands in the way, leaving his shape in it; the others
# try ever harder to keep him out; the payoff looks back down the line):
#   0 (the pickup, k0..2.4): a cold open on the end: prom night in the school gym, the dog in his varsity jacket dancing
#     beside Sadi in her prom dress in front of a fresh dog-shaped hole in the wall; then a white flash: earlier.
#   1 (the pre-chorus, k2.4..19.5): home alone, he stares at the front door (her photo on it); the run-up; then the
#     line in a cartoon montage, one burst a line: the front door, the picket fence, the taxi van (in one door, out the
#     other), the clip's boxing gym (the boxers mid-punch), the diner (straight over a couple's milkshake date), out
#     onto the street, the school's lit gym ahead.
#   2 (k19.5..39.2): the prom: Sadi and Kob the prom queen at the punch bowl, Compote the school's security at the NO
#     DOGS doors; Sadi dances; a thud on the wall; Compote frowns; the outline of a dog cracks open in the cinderblock.
#   3 (the chorus, k39.2..64.7): on 'shape' he bursts in through his own outline and lands on the dance floor; 'push':
#     Compote throws him out of the doors; 'pull ... magnet': he's straight back through the wall beside them; hearts
#     fall round Sadi; they dance; Compote boards up the holes; Kob, unimpressed, sips; he sits at Sadi's feet; thrown
#     out again.
#   4 (the post-chorus, k64.7..100): every 'body' he's back through something new: beside Compote on guard (she doesn't
#     flinch), out of the PROM backdrop beside the DJ (the prom does his dance), through the photo booth behind the
#     queen at the flash (the official prom photo); everyone dances, the queen too; the gang looks through the first
#     hole: on the last 'shape' the line of dog-shaped holes runs all the way back home, one inside the next, his hall
#     light at the end.
#   5 (the button, the silence): Sadi has slipped into the restroom; his shape bursts through its door.
# Review loop 1 (6 of 32 stills passed): every burst read as a T-pose planted in front of a hidden hole. The bursts now
# come from `burst()`: the dog flying with his paws up in a V and leaning into the flight (a probe sheet: the jumping
# jacks' level arms read as a T-pose), and a lens searched round the hole so that at the review frame the hole is whole
# in the frame and at most 10% of it behind him, his face in frame, the others' faces clear.
import json, math, os, re, sys
sys.path.insert(0, os.path.dirname(__file__))
from cam import view

HERE = os.path.dirname(__file__)
PER, B0 = 0.625, 0.3097
def T(b): return B0 + b * PER                    # kit seconds of kit beat b
def S(b, b0): return round((b - b0) * PER, 3)    # seconds from shot beat b0 to beat b
def cl(x, a=0.0, b=1.0): return max(a, min(b, x))
def sm(x): x = cl(x); return x * x * (3 - 2 * x)

# the map (src/maps54.js PROM, TOWN, HOLES, SIL): the line is z = 0, the dog runs to +x
SIL = json.loads(re.search(r'export const SIL = (\[.*?\]);', open(os.path.join(HERE, '..', 'src', 'maps54.js')).read()).group(1))
X_, Z_ = (0, 0, -1), (0, 0, 1)
HOLE = {   # id: (the silhouette's feet centre, the wall's u axis in the world, the dog's way through)
    'door': ((-48.0, 0.0, 0.0), X_, (1, 0, 0)), 'fence': ((-44.0, 0.0, 0.0), X_, (1, 0, 0)),
    'cab1': ((-40.4, 0.38, 0.0), X_, (1, 0, 0)), 'cab2': ((-38.6, 0.38, 0.0), X_, (1, 0, 0)),
    'gym1': ((-34.0, 0.0, 0.0), X_, (1, 0, 0)), 'gym2': ((-26.0, 0.0, 0.0), X_, (1, 0, 0)),
    'din1': ((-22.0, 0.0, 0.0), X_, (1, 0, 0)), 'din2': ((-16.0, 0.0, 0.0), X_, (1, 0, 0)),
    'prom': ((-10.0, 0.0, 0.0), X_, (1, 0, 0)), 'side': ((-10.0, 0.0, 2.6), X_, (1, 0, 0)), 'comp': ((-10.0, 0.0, -2.0), X_, (1, 0, 0)),
    'banner': ((8.9, 0.9, 0.0), Z_, (-1, 0, 0)), 'photo': ((-4.4, 0.0, 7.35), (-1, 0, 0), (0, 0, -1)), 'wc': ((3.0, 0.0, 8.0), (1, 0, 0), (0, 0, 1)),
}
LINE = ['door', 'fence', 'cab1', 'cab2', 'gym1', 'gym2', 'din1', 'din2']
STAGE_Y = 0.9
DJ_HEAD = (9.2, STAGE_Y + 0.94, -1.75)
DOORWAY = (-10.0, 1.0, 6.0)
LOOK = {'saxo': 'varsity', 'sadi': 'prom', 'kob': 'sequin', 'compote': 'cop'}
HEAD = {'saxo': 1.38, 'sadi': 1.36, 'kob': 1.42, 'compote': 1.42}
FACE = {'saxo': 0.9, 'sadi': 0.84, 'kob': 0.86, 'compote': 0.86}
RAD = {'saxo': 0.48, 'sadi': 0.45, 'kob': 0.42, 'compote': 0.42}
CHARL = 2.467
def kick_at(rv): return round((1.6 - rv) % CHARL, 3)   # charleston's kick (clip 1.6 s) on the review frame, rv s into the shot
QUEEN = dict(hat='crown', hatY=0.68)                    # a probe sheet: 0.84 floated over her ears, 0.58 sank to her brow

# the karaoke's rows (kit seconds; numbers only, never a word)
_src = open(os.path.join(HERE, '2026-10-17-2.lyrics.js')).read()
_rows = json.loads(re.search(r'window\.LYRICS = (.*?);\n', _src).group(1)); _ends = json.loads(re.search(r'window\.LINE_END = (.*?);\n', _src).group(1))
def Bt(t): return (t - B0) / PER
LINES = [(Bt(row[0][0] - 0.35), Bt(e)) for row, e in zip(_rows, _ends)]
def has_line(b0, b1): return any(a < b1 and b > b0 for a, b in LINES)

def A(who, clip, x, z, **o):
    return {'who': who, 'look': o.pop('look', LOOK[who]), 'clip': clip, 'x': round(x, 3), 'z': round(z, 3), 'face': o.pop('face', 'world'),
            'yaw': round(o.pop('yaw', 0), 1), 'at': o.pop('at', 0.4), 'speed': o.pop('speed', 1), **o}
def idle(who, x, z, yaw, **o): return A(who, 'happy_idle', x, z, yaw=yaw, at=o.pop('at', 2.125), speed=o.pop('speed', 0), **o)
def dancer(who, x, z, yaw, rv, clip='charleston', **o):
    if clip == 'charleston': o.setdefault('at', kick_at(rv)); o.setdefault('speed', 1)
    return A(who, clip, x, z, yaw=yaw, **o)
def sit(who, x, z, yaw, lift=0.0, **o): return A(who, 'situps', x, z, yaw=yaw, at=o.pop('at', 0.8), speed=0, lift=lift, noLie=True, **o)
def yaw_to(x, z, tx, tz): return round(math.degrees(math.atan2(tx - x, tz - z)), 1)
HEART = dict(arm='L', aim='heart', upAt=-1)
VARMS = dict(arm='both', aim=[0.6, 0.55, 0.2], upAt=-1)  # the leap: paws up in a V (level arms read as a T-pose)
def flyer(x0, z0, x1, z1, lift=0.0, land=None, moveAt=0.0, floor=0.0, lean=18, **o):
    """The dog through a hole: jumping jacks held at 0.2 s (the pose his silhouette was cut from) with his paws up in a
    V, leaning into the flight, from (x0, z0) to (x1, z1) over the shot from moveAt (negative: already on his way at
    the cut), `lift` m up then landing on `floor` `land` s into the shot."""
    a = A('saxo', 'standard_jumping_jacks', x0, z0, yaw=yaw_to(x0, z0, x1, z1), at=0.2, speed=0, mx=round(x1 - x0, 3), mz=round(z1 - z0, 3), moveAt=round(moveAt, 3), air=True, lean=lean, **{**VARMS, **o})
    if lift: a['lift'] = round(lift, 3)
    if land is not None and lift > floor: a.update(my=round(floor - lift, 3), myAt=round(moveAt, 3), myDur=round(max(0.05, land - moveAt), 3))
    return a
def riser(x0, z0, x1, z1, base=0.0, peak=1.0, rise=0.32, moveAt=0.0, lean=22, myAt=None, **o):
    """Out of a hole and up into a leap: his feet from `base` (the hole's sill) to `peak` over `rise` s from moveAt,
    paws up in a V, leaning into the flight, airborne to the cut (low over the floor he read as standing: review 2)."""
    a = A('saxo', 'standard_jumping_jacks', x0, z0, yaw=yaw_to(x0, z0, x1, z1), at=0.2, speed=0, mx=round(x1 - x0, 3), mz=round(z1 - z0, 3), moveAt=round(moveAt, 3), air=True, lean=lean, **{**VARMS, **o})
    a['lift'] = round(base, 3); a.update(my=round(peak - base, 3), myAt=round(moveAt if myAt is None else myAt, 3), myDur=round(rise, 3))
    return a
def gset(pairs):   # gmode and gspots for the 14 guests from [(mode, [x, z, yaw])]; the rest hidden
    gm, gs = [False] * 14, [None] * 14
    for i, (m, sp) in enumerate(pairs): gm[i], gs[i] = m, sp
    return {'gmode': gm, 'gspots': gs}

# ---- projection (numbers only): where a point lands in the 9:16 frame ----
def _proj(cam, look, fov, pt):
    f = [look[i] - cam[i] for i in range(3)]; n = math.sqrt(sum(v * v for v in f)); f = [v / n for v in f]
    r = [-f[2], 0.0, f[0]]; rn = math.sqrt(r[0] ** 2 + r[2] ** 2) or 1; r = [r[0] / rn, 0.0, r[2] / rn]
    u = [r[1] * f[2] - r[2] * f[1], r[2] * f[0] - r[0] * f[2], r[0] * f[1] - r[1] * f[0]]
    d = [pt[i] - cam[i] for i in range(3)]; z = sum(a * b for a, b in zip(d, f))
    if z <= 0.05: return None
    tv = math.tan(math.radians(fov) / 2); th = tv * 9 / 16
    return (0.5 + sum(a * b for a, b in zip(d, r)) / z / th / 2, 0.5 - sum(a * b for a, b in zip(d, u)) / z / tv / 2, z)
def rad_w(fov, rad, dep): return rad / max(dep, 0.1) / (math.tan(math.radians(fov) / 2) * 9 / 16) / 2   # a radius in frame widths

# ---- bodies at a moment: (name, centre, radius) parts, the flyer's lean pivoting on the floor ----
def where(a, s, dur):
    u = cl((s - a.get('moveAt', 0)) / max(0.01, dur - a.get('moveAt', 0)))
    x, z = a['x'] + a.get('mx', 0) * u, a['z'] + a.get('mz', 0) * u
    lift = a.get('lift', 0)
    if 'my' in a: lift += a['my'] * sm((s - a.get('myAt', 0)) / max(0.01, a.get('myDur', dur)))
    return x, z, lift
SAXO_PARTS = [('head', 0.9, 0.0, 0.48), ('chest', 0.62, 0.0, 0.3), ('hips', 0.35, 0.0, 0.3), ('pawL', 0.85, 0.48, 0.11), ('pawR', 0.85, -0.48, 0.11), ('footL', 0.06, 0.22, 0.12), ('footR', 0.06, -0.22, 0.12)]
def parts(a, s, dur):
    x, z, lift = where(a, s, dur); who = a['who']; sc = a.get('scale', 1)
    yw = math.radians(a.get('yaw', 0)); d, p = (math.sin(yw), math.cos(yw)), (math.cos(yw), -math.sin(yw))
    ln = math.radians(a.get('lean', 0))
    if who == 'saxo' and a.get('clip') == 'standard_jumping_jacks': spec = SAXO_PARTS
    elif a.get('clip') == 'situps': spec = [('head', 0.55, 0.0, RAD[who]), ('chest', 0.3, 0.0, 0.3)]
    else: spec = [('head', FACE[who], 0.0, RAD[who]), ('chest', 0.55, 0.0, 0.3), ('hips', 0.3, 0.0, 0.28)]
    out = []
    for nm, hr, lat, r in spec:
        h = lift + hr * sc
        out.append((nm, (x + d[0] * h * math.sin(ln) + p[0] * lat * sc, h * math.cos(ln), z + d[1] * h * math.sin(ln) + p[1] * lat * sc), r * sc))
    return out
def face_top(a, s, dur):
    x, z, lift = where(a, s, dur); who = a['who']; sc = a.get('scale', 1)
    if a.get('clip') == 'situps': return (x, lift + 0.55 * sc, z), (x, lift + 1.02 * sc, z)
    if a.get('clip') == 'standard_jumping_jacks':
        yw, ln = math.radians(a.get('yaw', 0)), math.radians(a.get('lean', 0)); d = (math.sin(yw), math.cos(yw))
        pf, pt = (lift + 0.9) * sc, (lift + 1.38) * sc
        return (x + d[0] * pf * math.sin(ln), pf * math.cos(ln), z + d[1] * pf * math.sin(ln)), (x + d[0] * pt * math.sin(ln), pt * math.cos(ln), z + d[1] * pt * math.sin(ln))
    return (x, lift + FACE[who] * sc, z), (x, lift + HEAD[who] * sc, z)

# ---- the hole: its outline and inside points in the world ----
def _inside(px, py):
    c = False; j = len(SIL) - 1
    for i in range(len(SIL)):
        (xi, yi), (xj, yj) = SIL[i], SIL[j]
        if (yi > py) != (yj > py) and px < (xj - xi) * (py - yi) / (yj - yi) + xi: c = not c
        j = i
    return c
SIL_IN = [(x / 100, y / 100) for x in range(-54, 58, 7) for y in range(3, 123, 7) if _inside(x / 100, y / 100)]
def hole_pts(hid, pts):
    (ox, oy, oz), u, _ = HOLE[hid]
    return [(ox + u[0] * sx, oy + sy, oz + u[2] * sx) for sx, sy in pts]
def hole_mid(hid): (ox, oy, oz), _, _ = HOLE[hid]; return (ox, oy + 0.62, oz)

# ---- the lens zones (no lens inside a wall, the stage, a van) ----
def inside(c, zone='prom'):
    x, y, z = c
    if zone == 'prom':
        if not (-9.7 < x < 9.7 and -7.7 < z < 7.7 and 0.08 < y < 6.0): return False
        if x > 6.3 and y < 1.05: return False                                   # the stage
        if z < -6.3 and -8.7 < x < 3.7 and y < 2.2: return False                  # the bleachers
        return True
    if zone == 'home': return -55.8 < x < -48.25 and -4.8 < z < 4.8 and 0.08 < y < 2.9
    if zone == 'gym': return -33.75 < x < -26.25 and -4.7 < z < 4.7 and 0.08 < y < 4.4
    if zone == 'diner': return -21.85 < x < -16.15 and -3.8 < z < 3.8 and 0.08 < y < 3.3
    if zone == 'wc': return 0.65 < x < 5.35 and 8.2 < z < 12.45 and 0.08 < y < 2.85
    if zone == 'street':
        for x0, x1, zz in ((-56, -48, 5), (-34, -26, 5), (-22, -16, 4), (-10, 10, 8)):
            if x0 - 0.15 < x < x1 + 0.15 and -zz - 0.15 < z < zz + 0.15: return False
        if -40.6 < x < -38.4 and -2.5 < z < 2.5 and y < 2.0: return False      # the van
        if abs(x + 44) < 0.15 and abs(z) < 5.1 and y < 1.4: return False         # the fence
        return 0.08 < y and -60 < x < -10.2
    return True

# ---- solid set pieces between a lens and what it must see: (x0, y0, z0, x1, y1, z1) ----
_TOWN = [(-56, 0, -5, -48, 3.0, 5), (-34, 0, -5, -26, 4.6, 5), (-22, 0, -4, -16, 3.6, 4), (-40.4, 0, -2.3, -38.6, 1.95, 2.3),
         (-10, 0, -8, 10, 6.4, 5), (-10, 0, 7, 10, 6.4, 8), (-10, 2.0, 5, 10, 6.4, 7), (-8.9, 0, 5, 10, 6.4, 7)]   # the prom, its doorway open
BOXES = {
    'street': _TOWN, 'home': [(-52.0, 0, -5, -50.4, 0.35, -3.5)],
    'gym': [(bx - 0.23, 0.87, bz - 0.23, bx + 0.23, 1.83, bz + 0.23) for bx, bz in ((-32.3, -1.3), (-32.3, 1.3), (-29.5, 3.6), (-29.5, -3.6))],
    'diner': [(-19.65, 0, -0.35, -18.35, 0.66, 0.35), (-19.7, 0, -1.2, -18.3, 0.95, -0.6), (-19.7, 0, 0.6, -18.3, 0.95, 1.2), (-21.5, 0, -3.75, -16.5, 1.0, -3.25)],
    'prom': [(6.4, 0, -5.2, 10, 0.9, 5.2), (-6.4, 0, -6.2, -4.4, 0.8, -5.2), (-5.4, 0, 7.3, -3.4, 2.3, 7.4), (-8.6, 0, -8, 3.6, 2.1, -6.5), (8.4, 0.9, -3.6, 9.0, 1.75, -2.2)],
    'wc': [(0.5, 0.75, 8.1, 1.6, 0.9, 8.5), (4.4, 0.75, 8.1, 5.5, 0.9, 8.5)],
}
def seg_hits(a, b, box, pad=0.05):
    x0, y0, z0, x1, y1, z1 = box; lo, hi = (x0 + pad, y0 + pad, z0 + pad), (x1 - pad, y1 - pad, z1 - pad); t0, t1 = 0.0, 1.0
    for i in range(3):
        d = b[i] - a[i]
        if abs(d) < 1e-9:
            if a[i] < lo[i] or a[i] > hi[i]: return False
            continue
        u0, u1 = (lo[i] - a[i]) / d, (hi[i] - a[i]) / d
        if u0 > u1: u0, u1 = u1, u0
        t0, t1 = max(t0, u0), min(t1, u1)
        if t0 > t1: return False
    return True
def behind_head(cam, look, fov, face, pts):   # any of pts on the screen within 1.3 head radii of the face (a lamp growing out of it)
    f = _proj(cam, look, fov, face)
    if not f: return False
    rr = 1.3 * rad_w(fov, 0.48, f[2])
    return any((q := _proj(cam, look, fov, p)) and q[2] > f[2] and math.hypot(q[0] - f[0], (q[1] - f[1]) * 16 / 9) < rr for p in pts)
def head_pts(cam, c, r=0.4):   # a face and its head's sides and top, as seen from the lens
    dx, dz = c[0] - cam[0], c[2] - cam[2]; n = math.hypot(dx, dz) or 1; px, pz = -dz / n * r, dx / n * r
    return [c, (c[0] + px, c[1], c[2] + pz), (c[0] - px, c[1], c[2] - pz), (c[0], c[1] + 0.35, c[2])]
def walled(cam, pts, zone): return any(seg_hits(cam, q, bx) for q in pts for bx in BOXES.get(zone, []))

# ---- the burst solver: a lens round the hole and the flight, judged at the review frame ----
def solve(tag, dur, rv, dog, hole=None, others=(), occ=(), need=(), zone='prom', ok=None, line=False, prefer=40, fovs=(56, 62),
          alphas=(16, 24, 32, 40, 48, 56, 64, 72, 80), dists=(2.6, 3.0, 3.5, 4.0, 4.6, 5.3, 6.1), heights=(0.45, 0.7, 0.95, 1.25, 1.6, 2.0), cover=0.1, endc=True, mid=None, hmin=0.13, avoid=()):
    dp = parts(dog, rv, dur); dface, dtop = face_top(dog, rv, dur); efc, etp = face_top(dog, max(rv + 0.1, dur - 0.45), dur)   # he may leave the frame in the last 0.45 s (the gate allows 0.5)
    hp = hole_pts(hole, SIL) if hole else []; hin = hole_pts(hole, SIL_IN) if hole else []
    if mid: M = mid
    elif hole: hm = hole_mid(hole); M = tuple((hm[i] + dp[1][1][i]) / 2 for i in range(3))
    else: M = dp[1][1]
    if dog.get('mx') or dog.get('mz'): fl = (dog.get('mx', 0), dog.get('mz', 0))
    else: fl = (HOLE[hole][2][0], HOLE[hole][2][2])
    n = math.hypot(*fl); fd = (fl[0] / n, fl[1] / n); pp = (fd[1], -fd[0])
    oth = [(a, parts(a, rv, dur), face_top(a, rv, dur)) for a in others]
    best = None; tried = 0
    for side in (1, -1):
        for al in alphas:
            ca, sa = math.cos(math.radians(al)), math.sin(math.radians(al)) * side
            for R in dists:
                for y in heights:
                    cam = (M[0] + R * (ca * fd[0] + sa * pp[0]), y, M[2] + R * (ca * fd[1] + sa * pp[1]))
                    if not inside(cam, zone) or (ok and not ok(cam)): continue
                    if any(seg_hits(cam, cam, bx, pad=-(1.5 if zone == 'street' else 0.6)) for bx in BOXES.get(zone, [])): continue   # not right beside a set piece
                    if walled(cam, head_pts(cam, dface) + ([hole_mid(hole)] + [hp[k] for k in (0, 17, 35, 53)] if hole else []) + [ft[0] for _, _, ft in oth] + [q for q, _ in need], zone): continue
                    for w, ly in LOOKS:
                        lk = tuple(M[i] + w * (dp[1][1][i] - M[i]) for i in range(3)) if hole else M
                        look = (lk[0], lk[1] + ly if ly < 0.5 else dface[1] - 0.25, lk[2])
                        for fov in fovs:
                            tried += 1
                            sc = judge(cam, look, fov, dp, dface, dtop, (efc, etp), hp, hin, oth, occ, need, line, cover, endc, hmin)
                            if sc is not None and avoid and behind_head(cam, look, fov, dface, avoid): sc = no('behind head')
                            if sc is None: continue
                            sc += -abs(al - prefer) * 0.5 - abs(y - 0.95) * 4
                            if best is None or sc > best[0]: best = (sc, cam, look, fov, al * side, R)
    if not best:
        print(f'  {tag}: NO LENS ({tried} tried)', sorted(WHY.items(), key=lambda kv: -kv[1])[:6]); WHY.clear(); return None
    WHY.clear()
    _, cam, look, fov, al, R = best
    print(f'  {tag}: lens ({cam[0]:.2f}, {cam[1]:.2f}, {cam[2]:.2f}) look y {look[1]:.2f} fov {fov} alpha {al} R {R} | {judge(cam, look, fov, dp, dface, dtop, (efc, etp), hp, hin, oth, occ, need, line, cover, endc, hmin, report=True)}')
    p1 = tuple(cam[i] + 0.05 * (look[i] - cam[i]) for i in range(3))
    return view(tuple(round(v, 3) for v in cam), tuple(round(v, 3) for v in look), fov, p1=tuple(round(v, 3) for v in p1))
def covered(cam, look, fov, pts, blockers):
    """The share of points behind any blocker (part centre, radius) nearer the lens."""
    hit = 0
    for q in pts:
        pq = _proj(cam, look, fov, q)
        if not pq: continue
        for c, r in blockers:
            pc = _proj(cam, look, fov, c)
            if pc and pc[2] < pq[2] and math.hypot(pq[0] - pc[0], (pq[1] - pc[1]) * 16 / 9) < rad_w(fov, r, pc[2]): hit += 1; break
    return hit / max(1, len(pts))
WHY = {}
MAXHR = [0.26]
LOOKS = [(w, ly) for w in (0.0, 0.3, 0.6) for ly in (-0.15, 0.12, 0.4, 9)]   # the look point: from the mid-point towards the dog, raised; 9 = at his face - 0.25
def no(k): WHY[k] = WHY.get(k, 0) + 1
def judge(cam, look, fov, dp, dface, dtop, efc, hp, hin, oth, occ, need, line, cover, endc, hmin=0.13, report=False):
    P = lambda q: _proj(cam, look, fov, q)
    f, t = P(dface), P(dtop)
    if not f or not t or not (0.15 < f[0] < 0.85 and 0.28 < f[1] < 0.8): return no('face out')
    if line and t[1] < 0.27: return no('lyric rows')
    if f[2] < 1.5: return no('too close')
    hr0 = rad_w(fov, 0.48, f[2])
    if f[0] - hr0 < 0.02 or f[0] + hr0 > 0.98: return no('head cut')
    if hr0 > MAXHR[0]: return no('too big')
    for _, c, r in dp:
        pc = P(c)
        if not pc or not (0.0 < pc[0] < 1.0 and 0.02 < pc[1] < 0.99): return no('body out')
    if endc:
        e, et = P(efc[0]), P(efc[1])
        if not e or not et or not (0.04 < e[0] < 0.96 and 0.1 < e[1] < 0.95): return no('end out')
        if line and et[1] < 0.27: return no('end rows')
    hw = 0.0
    if hp:
        xs = []
        for q in hp:
            pq = P(q)
            if not pq or not (0.03 < pq[0] < 0.97 and 0.05 < pq[1] < 0.97): return no('hole out')
            xs.append(pq[0])
        hw = max(xs) - min(xs)
        if hw < hmin: return no('hole small')
        cv = covered(cam, look, fov, hin, [(c, r) for _, c, r in dp] + [(c, r) for _, ps, _ in oth for _, c, r in ps] + list(occ))
        if cv > cover: return no('hole covered')
    else: cv = 0.0
    hr = rad_w(fov, 0.48, f[2])
    blockers = [(c, r) for _, ps, _ in oth for _, c, r in ps] + list(occ)
    if covered(cam, look, fov, [dface], blockers) > 0: return no('face hidden')
    for a, ps, (fc, tp) in oth:
        pf, pt = P(fc), P(tp)
        if not pf or not pt or not (0.18 < pf[0] < 0.82 and 0.25 < pf[1] < 0.85): return no('other out')
        ohr = rad_w(fov, RAD[a['who']] * a.get('scale', 1), pf[2])
        if ohr > 0.22 or pf[0] - ohr < 0.02 or pf[0] + ohr > 0.98: return no('other size')
        if line and pt[1] < 0.27: return no('other rows')
        others_b = [(c, r) for _, c, r in dp] + [(c, r) for b, qs, _ in oth if b is not a for _, c, r in qs] + list(occ)
        if covered(cam, look, fov, [fc], others_b) > 0: return no('other hidden')
    for q, m in need:
        pq = P(q)
        if not pq or not (m < pq[0] < 1 - m and m < pq[1] < 1 - m): return no('need out')
        if covered(cam, look, fov, [q], [(c, r) for _, c, r in dp]) > 0: return no('need hidden')
    if report: return f'face ({f[0]:.2f}, {f[1]:.2f}) head r {hr:.3f} hole w {hw:.2f} covered {cv:.2f}'
    return min(hr, 0.17) * 220 + min(hw, 0.3) * 50 - cv * 40 - abs(f[0] - 0.5) * 10

# ---- the generic check: faces in the frame and clear of each other at the shot's start and end ----
def lens(v, k=0):
    c, f = v; a = math.radians(c['ang'][k]); fy = f[2] if len(f) > 2 else 0
    return (f[0] + math.sin(a) * c['r'][k], c['h'][k] + fy, f[1] + math.cos(a) * c['r'][k])
def check(beat, b1, v, actors, zone, W_):
    c, focus = v; dur = (b1 - beat) * PER; line = has_line(beat, b1)
    for k, s in ((0, 0.02), (-1, dur - 0.02)):
        cam, look = lens(v, k), (focus[0], c['look'][k] + (focus[2] if len(focus) > 2 else 0), focus[1])
        if not inside(cam, zone): W_.append(f'b{beat}: lens outside the {zone} {tuple(round(q, 2) for q in cam)}')
        tag = ' at the end' if k else ''
        for a in actors:
            if a.get('fg') or (a.get('reveal') and s < a['reveal']) or a.get('x', 0) > 30: continue
            fc, tp = face_top(a, s, dur); pf, pt = _proj(cam, look, c['fov'], fc), _proj(cam, look, c['fov'], tp)
            if not pf or not pt: W_.append(f'b{beat}: {a["who"]} behind the lens{tag}'); continue
            if line and pt[1] < 0.27: W_.append(f'b{beat}: {a["who"]} head top at {pt[1]:.2f} (lyric rows){tag}')
            if not 0.1 < pf[0] < 0.9: W_.append(f'b{beat}: {a["who"]} face x {pf[0]:.2f} (edge){tag}')
            if not -0.02 < pf[1] < 0.9: W_.append(f'b{beat}: {a["who"]} face y {pf[1]:.2f}{tag}')
            blk = [(cc, r) for b in actors if b is not a and not b.get('fg') and b.get('x', 0) < 30 for _, cc, r in parts(b, s, dur)]
            if covered(cam, look, c['fov'], [fc], blk) > 0: W_.append(f'b{beat}: {a["who"]} behind someone{tag}')

shots = []; REV = []; WARN = []
def add(beat, b1, actors, lyric, v, rv=None, zone_lens=None, **o):
    if o.pop('drop', False): return
    o = {k: val for k, val in o.items() if val is not None}
    zone = zone_lens or o.get('zone', 'prom')
    if v is None: WARN.append(f'b{beat}: no lens'); return
    check(beat, b1, v, actors, zone, WARN)
    c, focus = v
    t0 = 0 if not shots else T(beat)
    REV.append(round(t0 + (rv if rv is not None else 0.6 * (T(b1) - t0)), 2))
    shots.append({'beat': beat, 'kind': 'dance', 'map': 'prom', 'actors': actors, 'lyric': lyric, 'cam': c, 'focus': focus, **o})
    return v
def fg_guests(v, mode, d=1.9, lat=0.62, k=2, turn=0):
    """gspots for guests in the frame's lower corners, d m ahead of the lens, facing what it looks at."""
    c, focus = v; cam = lens(v, 0); f = (focus[0] - cam[0], focus[1] - cam[2]); n = math.hypot(*f); f = (f[0] / n, f[1] / n); r = (-f[1], f[0])
    out = []
    for sd in (1, -1)[:k]:
        x, z = cam[0] + f[0] * d + r[0] * lat * sd, cam[2] + f[1] * d + r[1] * lat * sd
        out.append((mode, [round(x, 2), round(z, 2), round(yaw_to(x, z, focus[0], focus[1]) + sd * turn, 1)]))
    return gset(out)
FREEZE = {   # bursts whose solved lens passed a review: kept as rendered (the solver has moved on since)
    'S03 door': ({'steady': True, 'ang': [31.28, 31.28], 'r': [3.818, 3.627], 'h': [0.95, 0.982], 'look': [1.593, 1.593], 'fov': 62}, [-46.796, 0.161]),
    'S06 gym': ({'steady': True, 'ang': [69.08, 69.07], 'r': [6.406, 6.086], 'h': [1.0, 1.018], 'look': [1.361, 1.361], 'fov': 62}, [-32.36, 0.13]),
    'S08 street': view((-10.97, 0.95, 3.31), (-15.0, 1.73, 0.05), 56, p1=(-11.17, 1.0, 3.15)),   # review 3's lens (the burst read), the dog now off the neon's side
    'S14 shape': ({'steady': True, 'ang': [100.32, 100.32], 'r': [4.797, 4.557], 'h': [0.95, 0.983], 'look': [1.614, 1.614], 'fov': 56}, [-8.575, 0.419]),
}
V15 = ({'steady': True, 'ang': [-73.35, -73.35], 'r': [4.6, 4.37], 'h': [0.45, 0.517], 'look': [1.8, 1.8], 'fov': 56}, [-11.7, 5.6])   # the throw (passed review 3), reused for the callback
PARK = [idle('saxo', 40, 40, 0, fg=True)]   # the engine needs one actor: parked off the map for an insert
DONE = {h: -9 for h in LINE}                # the line's holes, all burst long ago
def dur_of(b0, b1): return (b1 - b0) * PER

# ============================================ 0: the cold open ============================================
# S00 (k0..2.4; 'dance' k2.0): prom night: the dog and Sadi dance the charleston either side of the fresh dog-shaped
# hole in the wall, the night dark through it, two guests cheering behind them at the sides
rv = S(1.9, 0)
CAM0 = (-2.75, 1.1, 0.0)
s = [dancer('saxo', -8.1, 0.95, yaw_to(-8.1, 0.95, CAM0[0], CAM0[2]), rv), dancer('sadi', -8.1, -0.95, yaw_to(-8.1, -0.95, CAM0[0], CAM0[2]), rv)]
add(0, 2.4, s, "the cold open: prom night in the school gym, the dog in his varsity jacket and Sadi in her prom dress dance the charleston either side of a fresh dog-shaped hole in the cinderblock wall, the night dark through it, debris on the floor, guests cheering",
    view(CAM0, (-8.6, 1.18, 0.0), 62, p1=(-2.9, 1.1, 0.0), ease='out'), holes={'prom': -6, **DONE}, **gset([('cheer', [-9.0, 1.62, 125]), ('cheer', [-9.0, -1.62, 55]), ('cheer', [-9.45, 2.25, 135]), ('cheer', [-9.45, -2.25, 45])]), hide=['spots'], rv=rv)

# ============================================ 1: home alone, then the line ============================================
# S01 (k2.4..4.0; 'singing' k3.2): earlier (a white flash): home alone, he sits facing the front door with her photo
# on it, side on to the lens (a floor sit reads only side on), his bed behind him
s = [idle('saxo', -48.68, 0.3, 90, arm='both', aim=[0.12, 0.45, 0.88], upAt=-1, lean=-5)]   # the dog at the door, paws up on it, looking up at her photo on the wall beside it (a floor sit read as a crouch)
if False: add(2.4, 4.0, s, "earlier (a white flash): home alone, over his shoulder: the dog stands at the front door with his paws up on it, looking up at Sadi's framed photo on the wall beside it",
    view((-51.2, 1.5, -0.95), (-48.15, 1.12, 1.0), 54, p1=(-51.05, 1.49, -0.9)), zone='home', flashAt=[0], rv=S(3.4, 2.4))
# S02 (k4.0..7.15): the run-up: from the back of the room he charges the door, which cracks in his outline as he comes;
# from three-quarters behind him, the crack beside him
s = [A('saxo', 'happy_run', -51.4, 0.0, yaw=90, at=0.118, speed=1.6, mx=2.7, moveAt=1.795)]   # at: the stride that passed (the final check saw him upright at 0.37 s into the cycle)   # revving up on the spot, then the dash (his place at the review frame is the one that passed)
add(2.4, 7.15, s, "earlier (a white flash): home alone, the dog revs up on the spot, legs spinning, then charges straight at the front door, her photo beside it, the door cracking in his outline before he gets there (from three-quarters behind him)",
    view((-54.9, 1.3, -3.5), (-49.4, 0.8, 0.0), 54, p1=(-54.6, 1.28, -3.4)), zone='home', flashAt=[0], crack={'door': [1.35, 2.25]}, rv=2.3)

# S03..S08: the montage, a burst a line, each lens from solve() (`burst` prints its choice)
def burst(tag, beat, b1, hole, x1, z1, rv, lz, b0=-0.12, back0=0.6, ext=True, lift=0.35, land=0.55, floor=0.0, peak=None, rise=0.32, lyric='', others=(), occ=(), need=(), ok=None, prefer=40, holes=None, extra=None, heights=None, dists=None, fovs=None, alphas=None, hmin=0.13, cover=0.1, dog_o=None, avoid=(), **o):
    d = dur_of(beat, b1); (hx, hy, hz), _, nrm = HOLE[hole]
    mv, my_at = b0, None
    if b0 > 0:   # bursting mid-shot: he waits behind the wall, not stuck in it
        hx, hz = hx - nrm[0] * back0, hz - nrm[2] * back0
        if peak and ext:   # and 0.7 m further back along his line, or his leaning snout pokes through the wall while he waits (the gym's
            # 2.9 s wait showed his face on the bricks): the same line started earlier, so from b0 on his path is unchanged
            D = math.hypot(x1 - hx, z1 - hz); ux, uz = (x1 - hx) / D, (z1 - hz) / D
            e = (1.3 - back0) / max(0.35, ux * nrm[0] + uz * nrm[2])
            hx, hz = hx - ux * e, hz - uz * e; mv, my_at = b0 - e * (d - b0) / D, b0
    dog = riser(hx, hz, x1, z1, base=hy + 0.02, peak=peak + hy, rise=rise, moveAt=mv, myAt=my_at, **(dog_o or {})) if peak else flyer(hx, hz, x1, z1, lift=lift + hy, land=land, moveAt=b0, floor=floor, **(dog_o or {}))
    kw = {k: val for k, val in (('heights', heights), ('dists', dists), ('fovs', fovs), ('alphas', alphas)) if val}
    v = FREEZE[tag] if tag in FREEZE else solve(tag, d, rv, dog, hole=hole, others=others, occ=occ, need=need, zone=lz, ok=ok, line=has_line(beat, b1), prefer=prefer, hmin=hmin, cover=cover, avoid=avoid, **kw)
    add(beat, b1, [dog] + list(extra or others), lyric, v, rv=rv, zone_lens=lz, holes=holes, **o)
    return dog, v
print('bursts:')
# S03 (k7.15..8.34; 'love' k7.15): out through his own front door into the yard, the hall light warm through the hole
if False: burst('S03 door', 7.15, 8.34, 'door', -45.0, 0.4, 0.24, 'street', peak=1.0, ok=lambda c: c[0] < -44.4, zone='street', holes={'door': -0.12}, lit=['home'],
      lyric="'love': BANG: out through his own front door in his shape into the front yard, the door's chunks flying, the warm hall light through the dog-shaped hole")
if False: add(7.15, 8.34, PARK, "'love': BANG: the same view of his front door from inside: the door now holed in his exact shape, chunks still flying out into the night yard through it: he's gone",
    view((-54.6, 1.28, -3.4), (-48.2, 0.78, 0.0), 54, p1=(-51.8, 1.08, -1.95), ease='out'), zone='home', lit=['street'], holes={'door': -0.05}, rv=0.5)   # the yard lit through the hole (dark, the hole read as a barred black figure)
# S04 (k8.34..10.0; 'love' k8.3): through the white picket fence, his door's hole behind it (dropped after three loops:
# above the rail he read as standing on it; its beats went to the gym's boxers, the burst kept on k13)
if False: burst('S04 fence', 8.34, 10.0, 'fence', -41.4, -0.45, 0.55, 'street', peak=1.25, prefer=20, heights=(0.45, 0.7, 0.95), ok=lambda c: abs(c[0] + 39.5) > 2.4 or abs(c[2]) > 5.2, zone='street', holes={'door': -1.2, 'fence': -0.12}, lit=['home'],
      lyric="'love': BANG: through the white picket fence in his shape, pickets flying, his front door's hole behind it")
# S05 (k10..12): in through the van's far sliding door and out of the near one, a jump up
if False: burst('S05 van', 10.0, 12.0, 'cab2', -36.3, 0.45, 0.45, 'street', peak=1.0, avoid=[(lx, y, -5.1) for lx in (-13, -24, -39, -46) for y in (1.0, 2.0, 3.0, 4.2)], need=[((-38.6, 1.85, -2.25), 0.03), ((-38.6, 1.85, 2.25), 0.03)], hmin=0.1, dists=(4.0, 4.6, 5.3, 6.1, 7.0), zone='street', holes={'door': -2.2, 'fence': -1.2, 'cab1': -0.3, 'cab2': -0.12}, prefer=30,
      lyric="BANG: in through one sliding door of the yellow taxi van and out of the other in his shape, a jump up")
# S06 (k12..15.2; 'lead' k15.2): the clip's boxing gym: boxers punching their bags; BANG through the far wall, he flies
# the length of the gym at the lens past the boxers, who turn their heads
BAGS = [((-32.3, 1.35, -1.3), 0.24), ((-32.3, 1.35, 1.3), 0.24), ((-29.5, 1.35, 3.6), 0.24), ((-29.5, 1.35, -3.6), 0.24)]
BOXERS = [((-32.3, 0.94, -1.92), 0.26), ((-32.3, 0.94, 1.92), 0.26), ((-29.5, 0.94, 4.22), 0.26)]
b6 = S(11.81, 7.15)   # the passed shot's timing (the boxers 2.91 s, then the burst), moved up to the door's beats after the door, the van and the fence were dropped
burst('S06 gym', 7.15, 14.02, 'gym1', -29.7, 0.3, b6 + 0.55, 'gym', b0=b6, peak=1.25, zone='gym', occ=BAGS + BOXERS + [((x, 0.5, z), 0.3) for (x, _, z), _ in BOXERS], need=[(BOXERS[0][0], 0.05), (BOXERS[1][0], 0.05)], heights=(0.6, 0.8, 1.0, 1.25, 1.6), dists=(3.5, 4.0, 4.6, 5.3, 6.1, 7.0), cover=0.14, prefer=12,
      holes={**{h: -3 for h in ['door', 'fence', 'cab1', 'cab2']}, 'gym1': b6}, boxers='punch', stare=[-33.0, 0.0],
      lyric="the clip's brick boxing gym: boxers in blue hoodies punching their bags; BANG through the far wall in his shape and he flies the length of the gym at the lens, the boxers turning their heads mid-punch")
# S07 (k15.21..17.12; 'crazy' k17.1): the diner: a couple on a milkshake date; BANG through the wall behind them, he
# flies straight over their table between their faces
b7 = S(15.45, 15.21)
COUPLE = [((-19.0, 1.12, -0.78), 0.26), ((-19.0, 1.12, 0.78), 0.26)]
if False: burst('S07 diner', 15.21, 17.12, 'din1', -17.0, 0.0, 0.72, 'diner', b0=b7, peak=0.72, rise=0.35, zone='diner', occ=COUPLE, need=[(c, 0.08) for c, _ in COUPLE], fovs=(62, 68, 74), dists=(2.2, 2.6, 3.0, 3.5, 4.0, 4.6), heights=(1.0, 1.15, 1.3, 1.5, 1.8), cover=0.3, dog_o={'noShadow': True}, alphas=(0, 6, 12, 18), prefer=6, avoid=[(-19.0, y, z) for z in (-0.78, 0.78) for y in (0.9, 1.2)],
      holes={**{h: -4 for h in ['door', 'fence', 'cab1', 'cab2', 'gym1', 'gym2']}, 'din1': b7}, couple='gasp', stare=[-19.0, 0.0],
      lyric="'crazy': the diner: a couple on a milkshake date in their booth; BANG through the wall behind them and he flies straight over the table between their faces, the couple gasping")
# S08 (k17.12..19.5): out through the diner's front onto the street, the school gym's lit windows ahead
# the street: the shot that passed the final check, moved up to k14.02 (the diner dropped after four fails; its crack-first
# restage read as a drawing on a fence) and 0.15 beats shorter (on this grid his exit left him off the frame 0.5 s: the gate)
burst('S08 street', 14.02, 16.25, 'din2', -12.9, -0.9, 0.42, 'street', peak=1.0, zone='street', lit=['diner'], prefer=45, avoid=[(-15.9, 1.8, z) for z in (1.9, 2.6, 3.3, -1.9, -2.6, -3.3)] + [(lx, y, -5.1) for lx in (-13, -24, -39, -46) for y in (1.0, 2.0, 3.0, 4.2)], fovs=(56, 62, 68), dists=(4.0, 4.6, 5.3, 6.1, 7.0, 8.0), heights=(0.45, 0.7, 0.95, 1.25), alphas=(24, 32, 40, 48, 56, 64, 72, 80, 88),
      holes={**{h: -5 for h in LINE if h != 'din2'}, 'din2': -0.12}, hide=['neon'],
      lyric="BANG: out through the diner's front wall in his shape onto the night street, heading for the school")

# ============================================ 2: the prom ============================================
# S09 (k19.5..23.7; 'talk' k22.0): the punch bowl: Sadi in her prom dress and Kob the prom queen in her crown chat over
# red cups (passed review 1 but the crown; Kob's cup now in the paw she raises)
s = [idle('sadi', -6.05, -4.55, 60, hold='redcup', arm='R', aim=[0.55, 0.45, 0.45], upAt=-1), idle('kob', -4.8, -4.55, -60, holdL='redcup', arm='L', aim=[0.55, 0.45, 0.45], upAt=-1, **QUEEN)]
add(16.25, 23.7, s, "'talk': prom night: at the punch bowl Sadi in her prom dress and Kob the prom queen in her crown chat over red cups",
    ({'steady': True, 'ang': [0.0, 0.0], 'r': [3.875, 3.5], 'h': [1.2, 1.18], 'look': [1.0, 1.0], 'fov': 50}, [-5.4, -4.6]), rv=S(22, 16.25))   # the passed lens
# S10 (k23.7..28.75; 'waist body'; the TikTok cut opens at k24.86): Sadi dances in the middle of the floor (passed)
add(23.7, 28.75, [dancer('sadi', 0.0, 0.2, 15, S(26, 23.7))], "Sadi dances the charleston in the middle of the dance floor under the disco ball, the prom dancing round her (the TikTok cut's first frame)",
    ({'steady': True, 'ang': [11.31, 11.31], 'r': [3.059, 2.55], 'h': [0.3, 0.32], 'look': [0.9, 0.9], 'fov': 60, 'roll': [-7, -4]}, [0.0, 0.2]), clear=[[0.4, 2.6, 1.3]], rv=S(26, 23.7))
# S11 (k28.75..31.21; 'lead' k31.2): a THUD on the west wall: it shudders and starts to crack; the guests in the
# foreground turn to stare at it, the crack between them
s11 = gset([('gasp', [-8.2, 0.72, -100]), ('gasp', [-8.25, -0.72, -80]), ('gasp', [-9.0, 1.45, -125])])
add(28.75, 31.21, PARK, "a thud on the gym's west wall: the cinderblock shudders and a crack starts in it, the guests in the foreground turning to stare at it",
    view((-4.4, 1.35, 0.0), (-9.9, 0.75, 0.0), 54, p1=(-4.6, 1.34, 0.0)), crack={'prom': [S(30.2, 28.75) - 0.3, S(31.2, 28.75) + 0.6]}, stare=[-10, 0.4], **s11, rv=S(30.9, 28.75))
# S12 (k31.21..34.18; 'lead' k34.2): Compote at the NO DOGS doors turns to the wall, frowning (passed)
add(31.21, 34.18, [idle('compote', -8.55, 4.7, 205)], "Compote, the school's security in her police uniform, by the NO DOGS doors: she turns to the wall and frowns",
    ({'steady': True, 'ang': [144.83, 144.06], 'r': [2.691, 2.47], 'h': [1.12, 1.12], 'look': [1.0, 1.0], 'fov': 42}, [-8.55, 4.7]), rv=S(33, 31.21))
# S13 (k34.18..39.2; 'love' k38.2): from behind three gasping guests: the dog's outline cracks open all the way round (passed)
add(34.18, 39.2, PARK, "from behind three gasping guests: the crack runs on round a shape in the wall: big round head, floppy ears, arms out, legs apart: the outline of a dog, shaking",
    ({'steady': True, 'ang': [90.0, 90.0], 'r': [5.8, 5.5], 'h': [1.42, 1.4], 'look': [0.75, 0.75], 'fov': 52}, [-9.9, 0.0]), crack={'prom': [-0.3, S(38.8, 34.18)]}, **gset([('gasp', [-6.6, 0.45, -95]), ('gasp', [-6.4, -0.48, -85]), ('gasp', [-5.5, 0.95, -100])]), stare=[-10, 0], rv=S(38.6, 34.18))

# ============================================ 3: the chorus ============================================
print('chorus:')
# S14 (k39.2..41.0; SHAPE k39.2): BANG: in through his own outline, landing on the dance floor facing the lens, the hole
# dark behind him, chunks bouncing, the guests gasping
burst('S14 shape', 39.2, 41.0, 'prom', -5.55, 1.31, 0.25, 'prom', b0=-0.1, peak=0.85, prefer=18, holes={**DONE, 'prom': -0.1}, noguests=True, hide=['spots'], dog_o={'fg': True},
      lyric="'shape': BANG: the dog bursts in through his own outline, out of the night, chunks of cinderblock flying")
s = [sit('saxo', -9.62, 0.0, 90, at=0.9, **VARMS)]
if False: add(39.8, 41.0, s,  "he lands crouched in front of the hole in his exact shape, paws up, facing us, guests gasping either side, chunks bouncing",
    view((-5.0, 0.85, 0.0), (-9.8, 0.72, 0.0), 54, p1=(-5.15, 0.85, 0.0)), holes={**DONE, 'prom': -0.475}, **gset([('gasp', [-7.7, 1.75, -130]), ('gasp', [-7.7, -1.75, -50]), ('gasp', [-6.9, 2.1, -125])]), stare=[-8.6, 0.0], hide=['spots'], rv=0.45)
# S15 (k41.0..42.19; 'push' k41.6): outside, the NO DOGS doors burst open and Compote throws him out, mid-air over the
# road, her paws still out from the throw
comp15 = idle('compote', -9.55, 6.2, -95, arm='both', aim=[0.62, 0.32, 0.55], upAt=-1)
dog15 = riser(-10.45, 6.0, -13.0, 5.3, base=0.7, peak=1.1, rise=0.3, moveAt=-0.05, lean=22)
v15 = solve('S15 push', dur_of(41.0, 42.19), 0.32, dog15, others=[comp15], need=[(DOORWAY, 0.05), ((-10.3, 1.42, 4.5), 0.04)], zone='street', line=has_line(41.0, 42.19), prefer=58, mid=(-11.7, 1.4, 5.6), dists=(3.5, 4.0, 4.6, 5.3, 6.1, 7.0), alphas=(32, 40, 48, 56, 64, 72, 80))
add(41.0, 42.19, [dog15, comp15], "'push': outside, the NO DOGS doors burst open and Compote throws him out: he flies spread over the road, her paws still out from the throw",
    v15, zone='street', zone_lens='street', doors=1, holes={**DONE, 'prom': -2}, rv=0.32)
# S16 (k42.19..44.87; 'pull' k42.2, 'magnet' k43.5): BANG: straight back in through the wall beside the doors, at the
# lens, the guests in the foreground gasping
_, v16 = burst('S16 side', 42.19, 44.87, 'side', -7.8, 1.6, 0.55, 'prom', b0=-0.1, peak=1.25, need=[((-10.1, 1.42, 5.5), 0.04)], prefer=12,
      holes={**DONE, 'prom': -3, 'side': -0.1}, stare=[-8.5, 2.3], hide=['spots'],
      lyric="'pull ... magnet': BANG: he's straight back in through the wall beside the NO DOGS doors, flying at us, the guests gasping")
# S17 (k44.87..48.76; 'heart falling' k46.2, 47.1): Sadi melts, hearts falling round her; the dog presses against her (passed)
s = [idle('sadi', -5.2, 1.0, 70, **HEART), idle('saxo', -5.95, 1.5, 100, lean=8)]
add(44.87, 48.76, s, "'heart falling': Sadi melts, her paw on her heart, hearts falling all round her; the dog presses against her side, gazing up at her",
    ({'steady': True, 'ang': [46.43, 46.43], 'r': [2.829, 2.829], 'h': [1.15, 1.15], 'look': [0.95, 0.95], 'fov': 50}, [-5.45, 1.25]), holes={**DONE, 'prom': -5, 'side': -2}, rain=[0.0, -5.4, 1.25], rv=S(47.1, 44.87))
# S18 (k48.76..52.75; 'love body' k50.3, 51.3): they dance side by side, the prom cheering (passed)
s = [dancer('saxo', -0.55, 0.3, 12, S(51.3, 48.76)), dancer('sadi', 0.55, 0.3, -12, S(51.3, 48.76) + 0.3)]
add(48.76, 52.75, s, "'love body': the dog and Sadi dance the charleston side by side in the middle of the floor, the prom cheering round them",
    ({'steady': True, 'ang': [0.0, 0.0], 'r': [3.1, 2.65], 'h': [0.32, 0.34], 'look': [0.9, 0.9], 'fov': 60, 'roll': [6, 3]}, [0.0, 0.3]), guests='cheer', clear=[[0.0, 2.8, 1.3]], rv=S(51.3, 48.76))
# S19 (k52.75..56.12; 'night' k54.0): Compote boards up the holes: between them, side on, her hammer raised beside her
# head in the paw nearest the lens, planks across both dog-shaped holes
s = [idle('compote', -9.15, 1.3, 50, holdL='hammer', arm='L', aim=[0.62, 0.62, 0.3], upAt=-1, holdScale=1.7)]
add(52.75, 56.12, s, "Compote boards up the holes: planks nailed across both dog-shaped holes, she stands between them side on, her hammer raised for the last nail",
    view((-4.6, 1.3, 1.3), (-9.6, 0.85, 1.3), 66, p1=(-4.8, 1.29, 1.3)), holes={**DONE, 'prom': -6, 'side': -4}, planks=['prom', 'side'], noguests=True, rv=S(54.5, 52.75))
# S20 (k56.12..58.33; 'room' k56.1): the queen, unimpressed, sips her punch, the cup at her mouth in the paw nearest us
add(56.12, 58.33, [idle('kob', -4.8, -4.55, 29, holdL='redcup', arm='L', aim='sip', flapEvery=1000, flapPh=90, upAt=-1, **QUEEN)], "the prom queen, unimpressed, her red cup of punch raised under her chin",
    view((-3.6, 1.28, -2.4), (-4.8, 1.08, -4.55), 42, p1=(-3.65, 1.27, -2.5)), rv=S(57.2, 56.12))
# S21 (k58.33..61.02; 'bed' k58.3, 'smell' k59.0): the good boy sits at Sadi's feet like on his own bed while she
# dances, gazing up at her; a low side lens
s = [idle('sadi', -5.2, 1.0, 70, **HEART), idle('saxo', -5.9, 1.42, 104, lean=16, tongue=True)]
add(58.33, 61.02, s, "'smell': the good boy leans in close, his nose at her cheek, tongue out, in heaven; Sadi with her paw and corsage at her heart",
    ({'steady': True, 'ang': [46.43, 46.43], 'r': [2.829, 2.829], 'h': [1.15, 1.15], 'look': [0.95, 0.95], 'fov': 50}, [-5.45, 1.25]), holes={**DONE, 'prom': -6, 'side': -4}, planks=['prom', 'side'], rv=S(59.4, 58.33))
# S22 (k61.02..64.73; 'day ... new'): thrown out again: from across the street, the doors fly open and Compote flings
# him out into the night, spread like his holes, Compote off his line
b22 = S(61.6, 61.02)
comp22 = idle('compote', -9.55, 6.2, -95, arm='both', aim=[0.62, 0.32, 0.55], upAt=-1)
dog22 = riser(-10.45, 6.0, -10.45 - 2.55 * 4.22, 6.0 - 0.7 * 4.22, base=0.7, peak=1.1, rise=0.3, moveAt=b22, lean=22, fg=True)   # S15's throw at S15's speed: out of the frame after the review frame
v22 = V15 if True else solve('S22 again', dur_of(61.02, 64.73), b22 + 0.6, dog22, others=[comp22], need=[(DOORWAY, 0.05)], zone='street', line=has_line(61.02, 64.73), prefer=60, mid=(-12.6, 1.5, 6.8), dists=(3.5, 4.0, 4.6, 5.3, 6.1, 7.0), alphas=(40, 48, 56, 64, 72, 80))
add(61.02, 64.73, [dog22, comp22], "thrown out again (the callback): from across the street, the doors fly open and Compote flings him out into the night, spread like his holes",
    v22, zone='street', zone_lens='street', doors=1, holes={**DONE, 'prom': -8, 'side': -6}, planks=['prom', 'side'], rv=b22 + 0.37)

# ============================================ 4: the post-chorus ============================================
print('post-chorus:')
# S23 (k64.73..68.33; 'body' k67.5): Compote stands guard in front of the boarded holes; BANG: right beside her he's
# back in; she doesn't even turn her head
b23 = S(67.52, 64.73)
comp23 = idle('compote', -9.15, -0.62, 88)
burst('S23 guard', 64.73, 68.33, 'comp', -7.6, -2.6, b23 + 0.42, 'prom', b0=b23, peak=1.0, others=[comp23], need=[((-10.0, 0.9, 0.62), 0.03)], prefer=12,
      holes={**DONE, 'prom': -10, 'side': -8, 'comp': b23}, planks=['prom', 'side'], noguests=True, hide=['spots'],
      lyric="'body': Compote stands guard in front of the boarded hole; BANG: right beside her he bursts back in; she doesn't even turn her head")
# S24 (k68.33..74.6): the dog and Sadi dance again, the prom cheering (passed)
s = [dancer('saxo', -0.5, -0.4, 20, S(71, 68.33)), dancer('sadi', 0.55, -0.35, -15, S(71, 68.33))]
add(68.33, 74.6, s, "the dog and Sadi dance again on the floor, the prom cheering round them, a crane over them",
    ({'steady': True, 'ang': [21.52, -18.2], 'r': [3.816, 3.842], 'h': [2.0, 2.1], 'look': [0.8, 0.8], 'fov': 54, 'ease': 'lin'}, [0.0, -0.35]), guests='cheer', clear=[[0.0, 1.6, 1.3]], rv=S(71, 68.33))
# S25 (k74.6..77.5; 'body' k75.4): BANG: out through the PROM backdrop on the stage, landing beside the DJ at his decks
b25 = S(75.38, 74.6)
burst('S25 banner', 74.6, 77.5, 'banner', 7.6, 1.5, b25 + 0.4, 'prom', b0=b25, peak=0.3, prefer=35,
      ok=lambda c: c[1] > 1.5, heights=(1.6, 1.9, 2.2, 2.6), dists=(3.0, 3.5, 4.0, 4.6), need=[((6.45, 0.95, 1.0), 0.0)], holes={**DONE, 'banner': b25}, noguests=True, hide=['spots'],
      lyric="'body': BANG: he bursts out through the PROM backdrop on the stage in his shape, chunks flying")
# S26 (k77.5..80.5): the whole prom does his dance, the dog leading it on the stage in front of his hole: from behind
# the dancing crowd
CROWD26 = [('dance', [x, z, 90]) for x, z in ((3.0, -1.7), (3.0, -0.55), (3.0, 0.6), (3.0, 1.75), (4.4, -1.15), (4.4, 0.0), (4.4, 1.15), (5.6, -1.9), (5.6, 2.0))]
add(77.5, 80.5, [idle('saxo', 7.4, 1.25, -95, lift=STAGE_Y, arm='both', aim='rave', flapEvery=1000, flapPh=90, upAt=-1, hop=[0.06, 1])], "the whole prom does his dance, from behind the crowd: the dog leads it on the stage in front of his hole in the PROM backdrop",
    view((-0.4, 1.45, 0.45), (7.4, 1.55, 0.6), 46, p1=(-0.1, 1.45, 0.47)), **gset(CROWD26), holes={**DONE, 'banner': -2}, rv=S(79, 77.5))
# S27 (k80.5..88.85; 'body' k83.5): the official prom photo: the queen poses deadpan beside the star backdrop; the flash;
# the print: frozen at the instant he burst out of the backdrop behind her, leaping up over her shoulder, the hole in his
# shape beside her, chunks in the air (a static frame: flying at the lens he hid his own hole in every frontal photo)
CAM27 = (-4.75, 1.22, 2.75)
kob27 = idle('kob', -5.45, 6.6, yaw_to(-5.45, 6.6, CAM27[0], CAM27[2]), **QUEEN)
add(80.5, 83.51, [kob27], "the official prom photo: the prom queen poses deadpan beside the star backdrop of the photo booth, the photographer's lens on her",
    view(CAM27, (-5.1, 1.02, 7.0), 52, p1=(-4.78, 1.2, 2.95)), noguests=True, rv=S(83.0, 80.5))
dog27 = A('saxo', 'standard_jumping_jacks', -3.7, 6.45, yaw=yaw_to(-3.7, 6.45, CAM27[0], CAM27[2]) + 20, at=0.2, speed=0, lift=0.55, air=True, lean=14, holdAt=0, **VARMS)
add(83.51, 88.85, [kob27 | {'holdAt': 0}, dog27], "'body': FLASH: the print develops: at that very instant he burst out of the backdrop behind her, leaping up over her shoulder, the hole in his shape beside her, chunks frozen in the air, her deadpan unchanged",
    view(CAM27, (-4.5, 1.4, 7.0), 62), holes={**DONE, 'photo': -0.16}, stop=0, flashAt=[0], photo=0.05, photoDim=0.88, still=True, noguests=True, rv=1.6)
# S28 (k88.85..92.51; 'love body' k91.2): everyone dances: the four of them in a row in sync, the queen too
rv28 = S(91.2, 88.85)
s = [dancer('compote', -1.45, -0.35, 10, rv28), dancer('saxo', -0.45, 0.55, 4, rv28), dancer('sadi', 0.45, 0.55, -4, rv28), dancer('kob', 1.45, -0.35, -10, rv28, **QUEEN)]
add(88.85, 92.51, s, "'love body': everyone dances in sync: Compote, the dog, Sadi and the queen in a row, the queen finally dancing too, the prom round them",
    view((0.0, 2.3, 6.3), (0.0, 0.85, 0.2), 58, p1=(0.0, 2.28, 6.15)), **gset([('dance', [x, -5.6, 0]) for x in (-3.3, -2.2, -1.1, 0.0, 1.1, 2.2, 3.3)] + [('dance', [x, -6.6, 0]) for x in (-2.75, -1.65, -0.55, 0.55, 1.65, 2.75)]), rv=rv28)
# S29 (k92.51..96.5; 'day ... new'): the gang at the first hole, from behind them: four backs in a row, the hole between
# the middle two, lit outlines receding through it
s = [idle('sadi', -8.75, 0.64, -92, fg=True), idle('saxo', -8.75, -0.64, -88, fg=True)]
if False: add(92.51, 96.5, s, "at the first hole, over their shoulders: Sadi and the dog peer through his shape in the wall, the lit outlines of more dog-shaped holes receding through it",
    view((-6.25, 1.25, 0.0), (-9.9, 0.82, 0.0), 60, p1=(-6.45, 1.24, 0.0)), holes={**DONE, 'prom': -12}, townLit=True, noguests=True, hide=['booth', 'spots'], rv=S(94.5, 92.51))
# S30 (k96.5..100; 'love shape' k98.2, 99.2): THE TUNNEL: through the hole, the line of dog-shaped holes runs all the way
# back home, one inside the next: the diner, the boxing gym, the van, the fence, his front door, the hall light at the end
add(92.51, 100.0, PARK, "'shape': through the hole: a tunnel of dog-shaped holes running all the way back home, one inside the next: the diner, the boxing gym, the taxi van, the fence and his front door at the end, the hall light on",
    view((-1.5, 0.66, 0.02), (-40.0, 0.72, 0.0), [24, 13], p1=(-1.7, 0.66, 0.02)), holes={**DONE, 'prom': -14}, townLit=True, noguests=True, hide=['booth', 'spots'], rv=S(99.2, 92.51),
    lit=['diner', 'gym', 'home'])   # the rooms lit (the critic: the dark diner merged the rings into 'a dark figure'): teal, cream, brick, yellow, home
# S31 (k100..101.82; the silence): the button: Sadi has slipped into the girls' restroom; BANG: his shape bursts through
# its door behind her and there he is, beside her between the mirrors
b31 = S(100.75, 100.0)
sadi31 = idle('sadi', 1.15, 8.6, 0, arm='R', aim=[0.3, 0.82, 0.25], upAt=-1)
MAXHR[0] = 0.3
dog31 = flyer(3.0, 7.4, 2.0, 8.75, lift=0.3, land=b31 + 0.4, moveAt=b31, lean=0)
add(100.0, 101.82, [dog31, sadi31], "the button, in the silence: inside the girls' restroom Sadi fixes her bow at the mirror; BANG: his shape bursts through the door and there he is, landed right beside her, both facing us",
    view((2.14, 1.15, 12.3), (2.14, 1.0, 8.0), 70, p1=(2.14, 1.15, 12.2)), holes={**DONE, 'wc': b31}, still=True, noguests=True, zone_lens='wc', rv=b31 + 0.62)
if False: burst('S31 restroom', 100.0, 101.82, 'wc', 3.95, 9.75, b31 + 0.38, 'wc', b0=b31, lift=0.3, land=b31 + 0.55, others=[sadi31], prefer=34,
      holes={**DONE, 'wc': b31}, still=True, noguests=True, heights=(1.0, 1.3, 1.6, 1.9, 2.2), dists=(2.4, 2.8, 3.2, 3.6, 4.0), fovs=(62, 68, 74),
      lyric="the button, in the silence: inside the girls' restroom Sadi fixes her bow between the mirrors; BANG: his shape bursts through the door and there he is, beside her")

shots.sort(key=lambda x: x['beat'])
ep = {
    'date': '2026-10-17', 'song': {'title': 'Shape of You', 'artist': 'Ed Sheeran'},
    'logline': "The velcro dog can't stand Sadi going to prom without him, so he goes to her in a straight line, bursting through his front door, a boxing gym and a diner, leaving his shape in each; every time Compote throws him out he's back through a new wall; and through the first hole the gang sees the tunnel of dog-shaped holes all the way back home.",
    'new': "src/maps54.js: prom (the school gym decorated for prom: a maple court, cinderblock walls, folded bleachers, the stage with a balloon arch, the PROM backdrop and a box-pet DJ, the punch table, the photo booth's star backdrop, the NO DOGS double doors, the girls' restroom with mirrors and sinks; box-pet guests in suits and gowns) and, west of it on one straight line, the town he crosses: his house, a tall picket fence, a yellow taxi van, the clip's brick boxing gym with box-pet boxers, a diner with a couple on a milkshake date; every wall on the line bursts in his exact silhouette (rasterised from his skinned mesh in jumping jacks at 0.2 s and traced: an extruded cell with the shape cut out and a dark broken rim, its plug, debris flung off the rim, a crack that draws his outline on both faces, planks across it); the town dims when seen from the prom, lit for the tunnel; two looks: Saxo's navy varsity jacket over a grey hoodie (the clip's), Sadi's baby-blue prom dress with a rose corsage (her bare arms and the corsage join ARM_FIX and ARM_CUFFS); the structure VELCRO; a burst lens solver in the generator",
    'notes': "The world, from the official video (contact sheets): a boxer in a blue hoodie training in a red-brick gym, a diner date in a varsity jacket, runs past freight trains, an underground sumo bout. The words, from whitelisted keywords per line: dance, singing, love, lead, crazy, talk, waist, body, shape, push, pull, magnet, heart, falling, night, room, bed, smell, day, discovering, new. Cast: Saxo the velcro dog in the clip's varsity jacket; Sadi at prom in her new dress (the romance thread: she melts); Kob the prom queen (her sequin dress, the crown), unimpressed until she finally dances; Compote the school's security (her police uniform) who keeps throwing him out.",
    'tiktok_sound': '6705004477235070977',
    'with': ['sadi', 'kob', 'compote'],
    'clips': sorted({a['clip'] for s in shots for a in s['actors']}),
    'tags': {'structure': 'velcro', 'scenes': ['the cold open', 'home alone at the door', 'the run-up', 'the door burst', 'the fence', 'the taxi van', 'the boxing gym', 'the diner date', 'the street', 'the punch bowl', 'Sadi dances', 'the thud', 'the crack', 'the shape burst', 'thrown out', 'back through the wall', 'falling hearts', 'the duet', 'the planks', 'the sip', 'at her feet', 'beside the guard', 'the PROM backdrop', 'the prom photo', 'everyone dances', 'the tunnel of holes', 'the restroom door'],
             'cast': ['saxo', 'sadi', 'kob', 'compote'], 'hook': 'dance', 'maps': ['prom'], 'ref': 'none',
             'lyric_literal': "'shape' (he bursts through his own outline, twice), 'push' / 'pull ... magnet' (thrown out, straight back), 'heart falling' (hearts falling round Sadi), 'bed' (he sits at her feet), 'dance' (the cold open), 'lead' (the run to her), 'body' (a new burst on every one)",
             'experiment': "Does a cartoon-physics visual gag that reads with the sound off (a dog-shaped hole in every wall, ending on a tunnel of them) hold the Short's viewers better than our pet-universal gags, on a song everyone knows?"},
    'shots': shots,
}
json.dump(ep, open(os.path.join(HERE, '2026-10-17-2.json'), 'w'), indent=1, ensure_ascii=False)
os.makedirs(os.path.join(HERE, '..', 'out', 'check'), exist_ok=True)
open(os.path.join(HERE, '..', 'out', 'check', 'soy_rev_times.txt'), 'w').write(','.join(f'{t:.2f}' for t in REV))
print(len(shots), 'shots;', len(WARN), 'warnings')
for w in WARN: print('  ', w)
