# make_2026-10-05.py: writes episodes/2026-10-05.json, "No Scrubs" (TLC, 1999; a throwback trending again, the queue
# being empty: +8 on Spotify's US daily chart on 2026-10-04, its 60 s TikTok sound has 153k videos).
# The clip: the trio in shiny black vinyl and silver dancing in a white spaceship set, a giant chrome three-letter sign
# on the back wall, a round chamber lit through rows of holes, a glass pod with light bars.
# Ours, "the scrub" (structure CUTAWAY: every time the girls sing about the scrub, cut to Saxo doing exactly that,
# escalating; the payoff turns the cutaway on them): Sadi, Kob and Compote are the girl group, in the clip's white
# high-collared jackets and black vinyl, dancing in their chrome spaceship set in front of a giant chrome NO. Saxo is
# the scrub, a red cap backwards and a gold chain, with no ride of his own: he hangs out of the passenger window of his
# pal's car (the "Dai Dai" keeper's bulldog, in shades at the wheel of a turquoise lowrider with a primer
# door), his tongue in the wind, a dog with his head out of a car window. He dances by the car ('fine'), opens his
# wallet and a moth flies out ('broke'), rolls up to the girls' landed saucer waving his phone ('number') and howls at
# them; they turn their backs. Chorus 1: the girls dance; he hangs out of the ride down the boulevard and cruises past
# their ramp. Verse 2: the lowrider hops on its hydraulics while he flexes ('weak'); the bulldog sees the girls and
# swoons. Pre-chorus 2: Compote snatches his phone and throws it away ('number'), the bulldog's hearts, the girls look
# at the car: they want the RIDE. They walk over, Compote yanks the scrub out, and on chorus 2 they cruise off in his
# pal's lowrider, Sadi hanging out of the window in his place, tongue out, then Kob too. The scrub is
# left on the kerb... then turns to their empty saucer, its ramp still down, runs up it, and on the button the saucer
# lifts off with his head out of its hangar, tongue in the wind: a dog takes any ride.
# Beats: 92.9114 BPM, kit beat b at b * 0.645777 s (kit beat 0 = song beat 12, bar 3); a bar = 4 beats (2.583 s).
# Key words (keytimes.py in ~/personal/saxo-video/songs/no-scrubs: whitelisted words only): fine b6.77 | sits b16.27,
# broke b17.85 | number b23.04, give b26.06, time b35.29 | chorus 1 b40-67 (passenger b46.18, ride b49.37; passenger
# b62.19, ride b65.38) | verse 2: got b67.41, weak b71.0, know b72.08, get b80.38 | number b87.04, give b90.06, time
# b98.97 | chorus 2 b104-132 (hanging b108.86, passenger b110.16, ride b113.37; hanging b124.86, passenger b126.16,
# ride b129.36) | the last hit b132, silence from b132.5 to the end (b133.5, 86.21 s).
# The lyrics stay in episodes/2026-10-05.lyrics.js (the generator reads only their times).
import json, math, os, re, sys
sys.path.insert(0, os.path.dirname(__file__))
from cam import view, swoop, low, deadpan

HERE = os.path.dirname(__file__)
PER = 0.645777
def T(b): return b * PER
def S(b, b0): return round(T(b) - T(b0), 3)    # seconds from shot beat b0 to beat b

LOOK = {'saxo': 'scrub', 'sadi': 'chrome', 'kob': 'chrome', 'compote': 'chrome'}
HEAD = {'saxo': 1.3, 'sadi': 1.28, 'kob': 1.42, 'compote': 1.42}       # the top of each head standing (the cap, the bow, the ears)
FACE = {'saxo': 0.9, 'sadi': 0.84, 'kob': 0.86, 'compote': 0.86}
RAD = {'saxo': 0.46, 'sadi': 0.38, 'kob': 0.38, 'compote': 0.38, 'dog': 0.36}   # a head's silhouette radius (dog: the driver, a map object)
SIT = 0.06                                         # a chair clip sits the chibi 6 cm lower than standing

# the maps (src/maps29.js)
TRIO = {'sadi': (-1.05, -0.9), 'kob': (0.0, -1.3), 'compote': (1.05, -0.9)}
POD = (3.6, -3.3)
CAR = (1.2, 3.25); CAR_YAW = 90; ROAD_Y = -0.14; SEAT_Y = 0.42; DOOR_Y = 0.88
RAMP = (0.0, -1.45)
SEATS = {'driver': (-0.46, -0.12), 'passenger': (0.48, -0.12), 'rearL': (-0.46, 1.0), 'rearR': (0.48, 1.0)}
DOG_HEAD = (1.09, 3.71, 1.19)                     # the driver's head when the ride is parked (maps29.js poseDriver)
DOG_CRUISE = (-0.46, -0.11, 1.33)                 # the driver's head in the cruise map (the ride at the origin, nose -z)

def A(who, clip, x, z, **o):
    return {'who': who, 'look': o.pop('look', LOOK[who]), 'clip': clip, 'x': round(x, 3), 'z': round(z, 3), 'face': o.pop('face', 'camera'),
            'yaw': o.pop('yaw', 0), 'at': o.pop('at', 'auto'), **o}
def yaw_to(frm, to): return round(math.degrees(math.atan2(to[0] - frm[0], to[1] - frm[1])), 1)
def car_pt(lx, lz, car=CAR, yaw=CAR_YAW):          # a point of the ride's frame (nose -z, passenger +x) in the world
    th = math.radians(yaw)
    return (round(car[0] + lx * math.cos(th) + lz * math.sin(th), 3), round(car[1] - lx * math.sin(th) + lz * math.cos(th), 3))
HANG_ARMS = dict(arm='both', aim=[0.15, -0.25, 0.95])   # both paws over the door top (no lean: it pushed the body out through the door)
def hang(who, side='R', row='front', car=CAR, yaw=CAR_YAW, y0=ROAD_Y, look_off=0, inset=0.0, **o):
    """Standing on the seat at the door, paws over it, head out of the side, tongue in the wind (a dog at a car window).
    side R: the passenger side (+x of the ride); L: the driver's side. look_off turns the face from straight out (deg,
    + towards the nose)."""
    lx = (0.62 - inset) if side == 'R' else -(0.62 - inset); lz = -0.12 if row == 'front' else 1.0
    x, z = car_pt(lx, lz, car, yaw)
    face_yaw = (yaw + (90 if side == 'R' else -90) + (look_off if side == 'R' else -look_off)) % 360
    arms = {} if o.pop('noArms', False) else HANG_ARMS
    return A(who, o.pop('clip', 'happy_idle'), x, z, face='world', yaw=round(face_yaw, 1), lift=round(y0 + SEAT_Y, 3), at=o.pop('at', 1.0),
             tongue=o.pop('tongue', True), sway=o.pop('sway', 3), swayEvery=o.pop('swayEvery', 1), **{**arms, **o})
def seated(who, seat, car=CAR, yaw=CAR_YAW, y0=ROAD_Y, **o):
    """Seated in the ride facing its nose (a chair clip held: the head up)."""
    lx, lz = SEATS[seat]; x, z = car_pt(lx, lz - 0.05, car, yaw)
    return A(who, o.pop('clip', 'sitting_talking'), x, z, face='world', yaw=round(yaw + 180, 1) % 360, lift=round(y0 + SEAT_Y, 3), at=o.pop('at', 0.05),
             speed=o.pop('speed', 0.0), sit=True, **o)

# ---- a projection check (numbers only): where each face lands in the 9:16 frame at the shot's start and end ----
def _proj(cam, look, fov, pt):
    f = [look[i] - cam[i] for i in range(3)]; n = math.sqrt(sum(v * v for v in f)); f = [v / n for v in f]
    r = [-f[2], 0.0, f[0]]; rn = math.sqrt(r[0] ** 2 + r[2] ** 2) or 1; r = [r[0] / rn, 0.0, r[2] / rn]
    u = [r[1] * f[2] - r[2] * f[1], r[2] * f[0] - r[0] * f[2], r[0] * f[1] - r[1] * f[0]]
    d = [pt[i] - cam[i] for i in range(3)]; z = sum(a * b for a, b in zip(d, f))
    if z <= 0.05: return None
    tv = math.tan(math.radians(fov) / 2); th = tv * 9 / 16
    return (0.5 + sum(a * b for a, b in zip(d, r)) / z / th / 2, 0.5 - sum(a * b for a, b in zip(d, u)) / z / tv / 2)
_src = open(os.path.join(HERE, '2026-10-05.lyrics.js')).read()
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
        if a.get('fg') or a.get('reveal', 0) >= 1.0: continue
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

shots = []
def lens(v, k=0):
    c, f = v; a = math.radians(c['ang'][k]); fy = f[2] if len(f) > 2 else 0
    return (f[0] + math.sin(a) * c['r'][k], c['h'][k] + fy, f[1] + math.cos(a) * c['r'][k])
def clear_at(v, *pts, r=1.2):                    # no lamp, palm or shop front at the lens or along its first stretch of sight
    c, f = v; p = lens(v, 0); q = lens(v, -1)
    out = [[round(p[0], 2), round(p[2], 2), r], [round(q[0], 2), round(q[2], 2), r]]
    for k in range(1, 4):
        u = k / 8; out.append([round(p[0] + (f[0] - p[0]) * u, 2), round(p[2] + (f[1] - p[2]) * u, 2), r * 0.8])
    return out + [list(x) for x in pts]
def add(beat, b1, mp, actors, lyric, v, **o):
    c, focus = v
    o = {k: val for k, val in o.items() if val is not None}
    if mp == 'curb': o.setdefault('clear', clear_at(v))
    shots.append({'beat': beat, 'kind': 'dance', 'map': mp, 'actors': actors, 'lyric': lyric, 'cam': c, 'focus': focus, **o})
    fy = focus[2] if len(focus) > 2 else 0
    for k, end in ((0, 0), (-1, 1)):
        cam, look = lens(v, k), (focus[0], c['look'][k] + fy, focus[1])
        check(beat, b1, cam, look, c['fov'], actors, end)
        for oc in _occl(cam, look, c['fov'], [body(a, end)[:4] for a in actors]):
            if not next(a for a in actors if a['who'] == oc.split(' behind ')[0]).get('fg'): WARN.append(f'b{beat}: {oc}{" at the end" if end else ""}')
def clean(actors):                               # the generator's own keys off the actors
    for a in actors: a.pop('sit', None); a.pop('sitDrop', None)
    return actors

# ================= a lens search: every face inside the frame and under the lyric rows at the shot's start and end,
# no face inside a nearer head's disc, the lens free of the set (per map) =================
def chrome_free(c):
    x, y, z = c
    if y < 0.12 or y > 6.0 or abs(x) > 8.0 or z < -5.0 or z > 8.2: return False
    return math.hypot(x - POD[0], z - POD[1]) > 0.9
def curb_free(c, car=CAR):
    x, y, z = c
    if y < 0.12 or z < -3.0 or z > 10.5: return False
    if math.hypot(x - DOG_HEAD[0], z - DOG_HEAD[1]) < 1.1 and y < 2.0: return False   # never at the driver's head
    lx = (x - car[0]); lz = (z - car[1])            # the parked ride (yaw 90): x along its length, z across
    if abs(lx) < 2.6 and abs(lz) < 1.05 and y < 1.25: return False
    return True
def cruise_free(c):
    x, y, z = c
    if y < 0.12 or abs(x) > 6.0: return False
    if abs(x) < 1.05 and abs(z + 0.05) < 2.5 and y < 1.25: return False
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
def lens_for(actors, ang, dist, b0, b1, hs=(1.0,), fov=50, look=None, spread=40, dr=(0.8, 1.5), free=chrome_free, push=0.04, facing=True, maxoff=105, dog=False, dog_at=DOG_HEAD, **o):
    vis = [a for a in actors if not a.get('fg')]
    FACING.clear(); FACING.update({a['who']: a.get('yaw', 0) for a in vis if a.get('face') == 'world'} if facing else {})
    phases = [[body(a, 0) for a in vis], [body(a, 1) for a in vis]]
    occ = [body(a, 0)[:4] for a in actors if a.get('fg')] + ([('dog', dog_at[0], dog_at[1], dog_at[2])] if dog else [])
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

# the trio in their V, all facing the lens side (+z) or a given yaw
def trio(clip, at=1.0, speed=1.0, yaw=0, face='world', fg=(), only=('sadi', 'kob', 'compote'), **o):
    return [A(w, clip, *TRIO[w], face=face, yaw=yaw, at=at, speed=speed, **({'fg': True} if w in fg else {}), **o) for w in only]
CURB_GIRLS = {'sadi': (-0.95, 0.45), 'kob': (0.0, 0.15), 'compote': (0.95, 0.45)}   # at the foot of the ramp, facing the kerb
def girls(clip, at=0.6, speed=0.0, to=CAR, only=('sadi', 'kob', 'compote'), fg=(), **o):
    out = []
    for w in only:
        p = CURB_GIRLS[w]
        out.append(A(w, clip, *p, face='world', yaw=yaw_to(p, to), at=at, speed=speed, **({'fg': True} if w in fg else {}), **o))
    return out
DRIVE = {'pose': 'drive'}
SWOON = {'pose': 'swoon', 'at': -1}

# =====================================================================================================================
# BEAT 1, the hook and verse 1 (b0-20): the girl group in its spaceship; the scrub, cut to every time they describe him
# S00 the hook (b0-4, the intro's quiet bar): a swoop from high over the set down to the trio dancing in front of the chrome NO
s00 = trio('charleston', at=0.7)
v = swoop([(0.2, 3.6, 6.2), (0.1, 0.7, 4.2), (0.05, 0.3, 3.35)], (0.0, 0.92, -1.05), fov=62, roll=(0, -8, -6), ease='out')   # dives fast and settles low on the trio
add(0, 4, 'chrome', s00, "the hook: a swoop down to the girl group dancing in sync in its white spaceship set, a giant chrome NO behind them", v)
# S01 'fine' (b6.77): cut to the scrub: Saxo dancing by his best friend's turquoise lowrider at the kerb, cap backwards, chain swinging
P01 = (0.35, 1.45)
s01 = [A('saxo', 'charleston', *P01, at=0.05)]
v = low((-0.55, 0.24, -0.95), (0.3, 0.86, 1.6), (-0.42, 0.24, -0.62), fov=58, roll=(7, 4))
add(4, 8, 'curb', s01, "'fine': cut to the scrub, Saxo in a backwards red cap and a gold chain, dancing on the kerb by a turquoise lowrider at night", v, driver=DRIVE, noPeds=True)
# S02 Kob's deadpan in the glass pod: frontal, locked, unimpressed
s02 = [A('kob', 'happy_idle', *POD, face='world', yaw=0, at=1.2, speed=0.0)]
v = deadpan(POD, 0.98, 2.8, cam_y=1.02, fov=42)
add(8, 12, 'chrome', s02, "the girl in the glass pod: Kob's deadpan, unimpressed", v, stars=['kob'])
# S03 'wants': the scrub and his best friend side by side in the lowrider, the bulldog at the wheel in shades, both nodding
s03 = [seated('saxo', 'passenger')]
v = view((-3.75, 1.32, 3.12), (0.75, 1.02, 3.22), 46, p1=(-3.45, 1.3, 3.13))
add(12, 16, 'curb', s03, "'wants': the scrub in the passenger seat beside his best friend, a bulldog in shades and a backwards cap at the wheel, both nodding to the beat", v, driver=DRIVE, noPeds=True)
# S04 'sits' (b16.27), 'broke' (b17.85): he opens his wallet and a moth flutters out
s04 = [hang('saxo', hold='wallet', arm='both', aim=[0.0, 0.3, 0.95], moth=S(17.85, 16), mothPale=True, tongue=False, sway=0)]   # the wallet held up over the door, a pale moth
v = view((2.3, 1.85, 0.5), (0.95, 1.45, 2.4), 52, p1=(2.25, 1.84, 0.56))   # three-quarters from above: the open wallet in his paws, the cream moth over the dark sidewalk (from low it read as a bow tie on the door)
add(16, 20, 'curb', s04, "'sits', 'broke': in the passenger seat he opens his wallet and a moth flutters out", v, driver=DRIVE, noPeds=True)

# BEAT 2, pre-chorus 1 (b20-40): he rolls up to the girls' saucer and tries; they turn their backs
# S05 'number' (b23.04): the lowrider rolls in along the kerb past the saucer's glowing ramp, him hanging out of the window waving his phone
C05 = (5.0, CAR[1])
s05 = [hang('saxo', car=C05, holdL='phone', arm='L', aim=[0.75, 0.55, 0.35], armB='R', aimB=[0.15, -0.25, 0.95], tongue=False, mx=round(CAR[0] - C05[0], 3), sway=0, reveal=1.6, holdScale=1.5)]
v = view((-0.4, 1.3, 0.3), (1.1, 1.25, 2.6), 56, p1=(-0.3, 1.29, 0.42))   # front three-quarters from the sidewalk: he rolls in waving the phone beside his head, the shop neon behind (from across the road the phone was a sliver)
add(20, 24, 'curb', s05, "'number': the lowrider rolls in past the girls' landed saucer, the scrub hanging out of the window waving his phone", v,
    car={'x': C05[0], 'z': C05[1], 'to': list(CAR), 'at': 0, 'dur': S(24, 20), 'lin': True}, driver=DRIVE, noPeds=True)
# S06 'give' (b26.06): the trio has come out to the foot of the ramp; over his shoulder from the car
s06 = girls('happy_idle', at=1.0)   # the girl group from low in the road, the hangar glowing behind them (over his shoulder, his head hid Compote)
v = view((-2.3, 0.8, 1.85), (0.0, 1.0, 0.25), 56, p1=(-2.15, 0.8, 1.75))   # low on the sidewalk off the ride's nose: the trio three-quarters, the hangar behind (from the road the car's nose hid them)
add(24, 28, 'curb', s06, "'give': the girl group at the foot of their ramp in the hangar's light, from low in the road", v, driver=DRIVE, noPeds=True)
# S07 'want' (b29.62): he howls at them out of the car, paws over the door; from low on the sidewalk
s07 = [hang('saxo', clip='long_yell_while_standing_leaning_back', at=0.5, tongue=False, sway=0)]
v = view((-1.05, 1.12, 1.55), (1.0, 1.3, 2.6), 46, p1=(-0.92, 1.12, 1.6))
add(28, 32, 'curb', s07, "'want': he howls at them out of the car, his paws over the primer door", v, driver=DRIVE, noPeds=True)
# S08 'time' (b35.29): the three, unimpressed, from his side: frontal on the trio
s08 = girls('happy_idle', at=1.0)
v = lens_for(s08, 20, 3.6, 32, 36, hs=(1.3, 1.45), fov=52, spread=15, free=curb_free, dog=True, maxoff=55)
add(32, 36, 'curb', s08, "'time': the three of them, unimpressed, staring at the scrub", v, driver=DRIVE, noPeds=True)
# S09 'want' (b38.22): they turn their backs and walk back up to the hangar, the scrub in the foreground
s09 = [A(w, 'happy_walk', *CURB_GIRLS[w], face='world', yaw=180, at=0.3, speed=1.3, mz=-1.1, fg=True) for w in ('sadi', 'kob', 'compote')]
v = view((-0.2, 1.75, 3.1), (0.0, 0.95, -1.2), 54, p1=(-0.2, 1.73, 2.85))
add(36, 40, 'curb', s09, "'want': they turn their backs on him and walk back to the glowing hangar", v, driver=DRIVE, noPeds=True)

# BEAT 3, chorus 1 (b40-68): the girls dance; he hangs out of the ride down the boulevard and cruises past their ramp
s10 = trio('charleston', at=0.05)
v = low((0.0, 0.12, 3.5), (0.0, 0.92, -1.1), (0.0, 0.12, 2.95), fov=64, roll=(-13, -9))
add(40, 44, 'chrome', s10, "the chorus: the girl group dancing in sync in front of the chrome NO, low and dutch", v)
# S11 'passenger' (b46.18): THE image: the scrub hanging out of his pal's car, tongue in the wind, the boulevard streaming past
s11 = [hang('saxo', car=(0, 0), yaw=0, y0=0.0, look_off=40)]
v = view((1.95, 1.32, -2.4), (0.86, 1.25, -0.12), 50, p1=(1.84, 1.31, -2.2), hand=0.4)
add(44, 48, 'cruise', s11, "'passenger': the scrub hanging out of his pal's lowrider, tongue flapping in the wind, the boulevard streaming past", v, driver=DRIVE)
# S12 'ride' (b48.19-49.37): the whole ride from the front, the bulldog at the wheel, the scrub hanging out
s12 = [hang('saxo', car=(0, 0), yaw=0, y0=0.0, look_off=40)]
v = view((2.6, 1.55, -5.4), (0.15, 0.95, -0.2), 50, p1=(2.45, 1.52, -5.0))
add(48, 50, 'cruise', s12, "'ride': the whole lowrider from the front, the bulldog in shades at the wheel, the scrub hanging out", v, driver=DRIVE, hop=[0.06, 1])
# S13 the hook line (b50-52): the trio kicks the charleston in unison
s13 = trio('charleston', at=0.825)   # the kick (clip 1.6 s) lands 0.78 s in
v = lens_for(s13, 0, 4.6, 50, 52, hs=(0.55, 0.7), fov=58, spread=10, roll=[6, 4])
add(50, 52, 'chrome', s13, "the hook line: the trio kicks in unison", v)
# S14 'want' (b54.2): Kob in the pod, dancing as little as possible
s14 = [A('kob', 'hip_hop_dancing_shimmy', *POD, face='world', yaw=0, at=0.6, speed=0.5)]
v = deadpan(POD, 0.98, 2.9, cam_y=0.98, fov=44, ang=8)
add(52, 56, 'chrome', s14, "Kob in the glass pod, dancing as little as she can get away with", v, stars=['kob'])
# S15 (b56-60): the trio again, the gangnam stance, from high and to the side
s15 = trio('charleston', at=1.45)
v = lens_for(s15, 30, 4.8, 56, 60, hs=(2.6, 2.9), fov=56, spread=10)
add(56, 60, 'chrome', s15, "the trio in the horse stance, from high in the set", v)
# S16 'passenger' (b62.19): the ride cruises slowly past their ramp, him hanging out, howling; from the sidewalk by the ramp
C16a, C16b = (2.4, CAR[1]), (-0.4, CAR[1])
s16 = [hang('saxo', car=C16a, tongue=True, sway=0, mx=round(C16b[0] - C16a[0], 3), reveal=0.7, noArms=True, arm='R', aim=[0.6, 0.75, 0.25], wave=1, armB='L', aimB=[0.15, -0.25, 0.95]),
       *girls('happy_idle', at=1.0, to=(0.6, 6.0))]
v = view((0.5, 2.7, 9.4), (0.45, 0.85, 1.0), 56, p1=(0.5, 2.68, 9.2))   # from high across the road: the ride passes, the trio standing on the sidewalk beyond it (a level lens put them in the car)
add(60, 64, 'curb', s16, "'passenger': the ride cruises slowly past the girls' ramp, the scrub hanging out of it howling", v,
    car={'x': C16a[0], 'z': C16a[1], 'to': list(C16b), 'at': 0, 'dur': S(64, 60), 'lin': True}, driver=DRIVE)
# S17 'ride' (b65.38) and the hook line: the trio shake their heads, no
s17 = trio('shaking_head_no_dismissively', at=0.4)
v = lens_for(s17, 0, 5.0, 64, 68, hs=(0.95, 1.1), fov=58, spread=10)
add(64, 68, 'chrome', s17, "the hook line: the trio shake their heads, no", v)

# BEAT 4, verse 2 (b68-84): he tries harder; the best friend sees the girls
# S18 'weak' (b71.0): the lowrider hops on its hydraulics in front of the saucer while he flexes on the seat
s18 = [hang('saxo', clip='happy_idle', at=1.0, inset=0.1, noArms=True, arm='L', aim=[0.6, 0.72, 0.3], wave=1, armB='R', aimB=[0.15, -0.25, 0.95], tongue=True, sway=0, hop=[0.22, 1], air=True)]   # his near paw up and waving (the fist pump was behind his head)   # the flex hid behind the door: elbows out, forearms pumping (the rave swing reads on chibi arms)
v = low((-2.1, 0.5, 1.25), (1.0, 0.95, 2.85), (-1.95, 0.5, 1.35), fov=56, roll=(-7, -5))
add(68, 72, 'curb', s18, "'weak': the lowrider hops on its hydraulics in front of the saucer while he raves on the seat, paws pumping", v, driver=DRIVE, hop=[0.22, 1], noPeds=True)
# S19 'know' (b72.08): Kob's deadpan at the foot of the ramp
s19 = girls('happy_idle', only=('kob',), at=1.2)
v = deadpan(CURB_GIRLS['kob'], 0.98, 2.8, cam_y=1.02, fov=42, ang=yaw_to(CURB_GIRLS['kob'], CAR))
add(72, 76, 'curb', s19, "'know': Kob at the foot of the ramp, deadpan", v, stars=['kob'], driver=DRIVE, noPeds=True)
# S20 (b76-80): Sadi sways to his beat, tempted; Compote glares at her
S20P = {'sadi': (-0.5, 0.45), 'compote': (0.48, 0.42)}   # closer for the two-shot
s20 = [A('sadi', 'happy_idle', *S20P['sadi'], face='world', yaw=yaw_to(S20P['sadi'], CAR), at=1.0, sway=8, swayEvery=0.5),   # turned to the car, swaying
       A('compote', 'happy_idle', *S20P['compote'], face='world', yaw=-50, at=1.2, speed=0.0)]   # turned to Sadi, glaring
v = lens_for(s20, 0, 3.2, 76, 80, hs=(1.25, 1.4), fov=48, spread=20, free=curb_free, dog=True, maxoff=75)
add(76, 80, 'curb', s20, "Sadi sways to his beat, tempted; Compote glares at her", v, driver=DRIVE, noPeds=True)
# S21 'get' (b80.38): the best friend sees the girls: his shades slide down his nose, dreamy eyes, hearts
s21 = [hang('saxo', tongue=False, sway=0, fg=True)]
v = view((-2.15, 1.5, 3.95), (1.08, 1.34, 3.72), 40, p1=(-2.0, 1.49, 3.93))
add(80, 84, 'curb', s21, "'get': the bulldog at the wheel sees the girls: his shades slide down his nose, dreamy eyes, hearts", v,
    driver={'pose': 'swoon', 'at': S(80.38, 80)}, noPeds=True)

# BEAT 5, pre-chorus 2 (b84-104): they want the ride, not him
# S22 'number' (b87.04): he holds his phone out again; Compote, at the door, snatches it and throws it over her shoulder
SNATCH = S(86.5, 84)
CP = (0.62, 1.58)                                  # Compote on the sidewalk, back from the door and to its left: their muzzles 0.6 m apart
s22 = [hang('saxo', holdL='phone', holdTo=SNATCH, arm='L', aim=[0.55, 0.05, 0.85], armB='R', aimB=[0.15, -0.25, 0.95], tongue=False, sway=0, holdScale=2.0),
       A('compote', 'happy_idle', *CP, face='world', yaw=yaw_to(CP, (0.75, 2.5)), at=0.8, speed=0.0, hold='phone', holdFrom=SNATCH, holdScale=2.0, arm='R', aim=[0.15, 0.35, 0.9], upAt=SNATCH - 0.4,
         toss={'at': SNATCH + 0.35, 'to': [2.6, 0.05, 1.2], 'dur': 0.7, 'arc': 0.9, 'scale': 1.3})]   # tossed away towards the lens's side: over her shoulder it flew out of the frame at once
v = lens_for(s22, 115, 2.9, 84, 88, hs=(1.15, 1.3, 1.45), fov=50, spread=25, free=curb_free, dog=True, facing=False)   # from the boot's side of the sidewalk: both faces three-quarters, the phone between them
add(84, 88, 'curb', s22, "'number': he holds his phone out again; Compote snatches it out of his paw and throws it over her shoulder", v, driver=DRIVE, noPeds=True)
# S23 'give' (b90.06): the bulldog in love, hearts; the scrub beside him clueless
s23 = [hang('saxo', tongue=True, sway=3)]
v = view((-2.2, 1.55, 4.6), (1.1, 1.25, 3.2), 50, p1=(-2.05, 1.54, 4.5))   # the two best friends from the front-left: the bulldog's hearts, the scrub beside him clueless
add(88, 92, 'curb', s23, "'give': the bulldog's hearts for the girls", v, driver=SWOON, noPeds=True)
# S24 'want' (b93.62): the girls look past the scrub at the ride: they want the ride
s24 = girls('happy_idle', at=1.0, to=(DOG_HEAD[0], DOG_HEAD[1])) + [hang('saxo', tongue=True, sway=3, fg=True)]
v = lens_for(s24, -40, 4.4, 92, 96, hs=(1.2, 1.4, 1.6), fov=52, spread=15, free=curb_free, dog=True, maxoff=80)   # off the ride's nose: their eyes go past the lens to the car (over his shoulder it was S08 again)
add(92, 96, 'curb', s24, "'want': the three look past the scrub at the lowrider: they want the ride", v, driver=SWOON, noPeds=True)
# S25 'time' (b98.97): they strut to the car in a line, towards the lens
S25P = {'sadi': (-0.2, 0.85), 'kob': (-0.2, 0.15), 'compote': (-0.2, -0.55)}   # single file to the car: side on they stand apart in the frame
s25 = [A(w, 'happy_walk', *S25P[w], face='world', yaw=0, at=0.3 + 0.2 * k, speed=1.25, mz=0.95) for k, w in enumerate(('sadi', 'kob', 'compote'))]
v = lens_for(s25, -90, 4.6, 96, 100, hs=(1.0, 1.2), fov=58, spread=20, dr=(0.9, 1.6), free=curb_free, dog=True, facing=False)   # side on: the strut in profile
add(96, 100, 'curb', s25, "'time': the three strut towards the car in a line", v, driver=SWOON, noPeds=True)
# S26 'want' (b102.22): Compote at the door yanks the scrub out by the collar...
CY = (1.0, 1.7)                                    # on the sidewalk under his window
PUNCH = S(101.8, 100)                              # her fist reaches the lens on the cut's last half beat
s26 = [A('compote', 'happy_idle', *CY, face='world', yaw=0, at=1.2, speed=0.0, arm='R', aim=[0.75, 0.7, 0.3], upAt=-0.2)]   # her fist up at the lens: the uppercut clip only showed the top of her head
v = view((0.99, 1.5, 3.7), (0.99, 1.22, 1.7), 54, p1=(0.99, 1.49, 3.6))   # his point of view from the passenger seat, pushing in on her glare   # his point of view from the car: her uppercut comes up at the lens (the grabs read as kisses)
add(100, 102, 'curb', s26, "from the scrub's seat: Compote glares up at him and raises her fist at the lens, a white flash...", v, driver={'hide': True}, noPeds=True, white=[PUNCH])
# S27 ...and he's sitting on the sidewalk seeing stars, while the girls take his place in the car
SAXO_OUT = (2.2, 1.35)                             # where he lands: on the sidewalk, by the ride's back wheel
s27 = [A('saxo', 'situps', *SAXO_OUT, face='world', yaw=200, at=1.0, speed=0.0, sit=True, sitDrop=0.17, noLie=True, dizzy=True),
       hang('sadi', tongue=False, sway=0, at=0.5), seated('kob', 'rearL', fg=True), seated('compote', 'rearR', fg=True)]
v = lens_for(s27, 205, 4.2, 102, 104, hs=(1.0, 1.2, 1.4), fov=54, spread=20, free=curb_free, dog=True, maxoff=80, facing=False)
add(102, 104, 'curb', s27, "...and he's sitting on the sidewalk seeing stars, while the girls take his seat", v, driver=SWOON, noPeds=True)

# BEAT 6, chorus 2 (b104-133.5): the payoff and the button
# S28 the ride pulls away with the girls aboard, the dazed scrub on the sidewalk in the foreground
C28b = (-1.4, CAR[1]); DX28 = round(C28b[0] - CAR[0], 3)
s28 = [A('saxo', 'situps', *SAXO_OUT, face='world', yaw=190, at=1.0, speed=0.0, sit=True, sitDrop=0.17, noLie=True),
       hang('sadi', at=0.5, tongue=True, mx=DX28, moveAt=0.6, sway=0, fg=True), seated('kob', 'rearL', mx=DX28, moveAt=0.6, fg=True), seated('compote', 'rearR', mx=DX28, moveAt=0.6, fg=True)]
v = view((3.3, 0.8, -0.7), (1.0, 1.0, 2.6), 54, p1=(3.25, 0.8, -0.55))   # low in front of him: him on the left third, the ride leaving on the right
add(104, 108, 'curb', s28, "the lowrider pulls away with the girl group in it, the scrub left sitting on the sidewalk", v,
    car={'to': list(C28b), 'at': 0.6, 'dur': S(108, 104) - 0.6, 'lin': True}, driver={'pose': 'swoon', 'at': -1, 'hearts': -1}, noPeds=True)
# S29 'hanging', 'passenger' (b108.86): Sadi in his place, tongue in the wind (the match cut on S11)
s29 = [hang('sadi', car=(0, 0), yaw=0, y0=0.0, look_off=40), seated('kob', 'rearL', car=(0, 0), yaw=0, y0=0.0, fg=True), seated('compote', 'rearR', car=(0, 0), yaw=0, y0=0.0, fg=True)]
v = view((1.95, 1.3, -2.4), (0.86, 1.22, -0.12), 50, p1=(1.84, 1.29, -2.2), hand=0.4)
add(108, 112, 'cruise', s29, "'hanging', 'passenger': Sadi in the scrub's place, her tongue in the wind, the boulevard streaming past", v, driver={'pose': 'drive', 'hearts': 0})
# S30 'ride' (b112.19-113.37): the whole ride, the bulldog with hearts, the three girls aboard
s30 = [hang('sadi', car=(0, 0), yaw=0, y0=0.0, look_off=40), hang('kob', side='L', row='rear', car=(0, 0), yaw=0, y0=0.0, look_off=40), hang('compote', row='rear', car=(0, 0), yaw=0, y0=0.0, look_off=20)]
v = lens_for(s30, 180, 5.4, 112, 114.3, hs=(1.75, 2.0, 2.3, 2.6), fov=50, spread=45, free=cruise_free, facing=False, dog=True, dog_at=DOG_CRUISE)
add(112, 114.3, 'cruise', s30, "'ride': the whole lowrider, the bulldog with hearts at the wheel, the three girls aboard", v, driver={'pose': 'drive', 'hearts': 0}, hop=[0.06, 1])
# S31 the hook line (b114.3-116.7): the scrub alone on the sidewalk, a blank stare
s31 = [A('saxo', 'situps', *SAXO_OUT, face='world', yaw=200, at=1.0, speed=0.0, sit=True, sitDrop=0.17, noLie=True)]
v = deadpan(SAXO_OUT, 0.78, 2.5, cam_y=0.86, fov=42, ang=200)
add(114.3, 116.7, 'curb', s31, "the scrub alone on the sidewalk, a blank stare", v, car=False, noPeds=True)
# S32 'want' (b118.2): Kob hangs out of the back too: the grumpy cat in the wind
s32 = [hang('kob', side='L', row='rear', car=(0, 0), yaw=0, y0=0.0, look_off=40), hang('sadi', car=(0, 0), yaw=0, y0=0.0, look_off=40, fg=True)]
v = view((-2.1, 1.45, -1.45), (-0.72, 1.32, 0.95), 48, p1=(-2.0, 1.44, -1.3), hand=0.4)
add(116.7, 120, 'cruise', s32, "'want': Kob hangs out of the back of the ride too, the grumpy cat in the wind", v, driver={'pose': 'drive', 'hearts': -2})
# S33 (b120-124): the ride hopping down the boulevard, heads out on both sides
s33 = [hang('sadi', car=(0, 0), yaw=0, y0=0.0, look_off=40, hop=[0.2, 1], air=True), hang('kob', side='L', row='rear', car=(0, 0), yaw=0, y0=0.0, look_off=40, hop=[0.2, 1], air=True),
       hang('compote', row='rear', car=(0, 0), yaw=0, y0=0.14, look_off=40, hop=[0.2, 1], air=True)]   # Compote up on the rear seat's back: her face over Sadi's
v = lens_for(s33, -140, 4.4, 120, 124, hs=(1.2, 1.35, 1.5), fov=52, spread=25, free=cruise_free, facing=False, dog=True, dog_at=DOG_CRUISE)   # front three-quarters at head height: the three faces and the wheels
add(120, 124, 'cruise', s33, "the lowrider hopping down the boulevard on its hydraulics, three heads out of it", v, driver={'pose': 'drive', 'hearts': -3}, hop=[0.2, 1])
# S34 'hanging', 'passenger' (b124.86): Sadi and Compote out of the passenger side, front and back
s34 = [hang('sadi', car=(0, 0), yaw=0, y0=0.0, look_off=40), hang('compote', row='rear', car=(0, 0), yaw=0, y0=0.0, look_off=40)]
v = lens_for(s34, 125, 3.4, 124, 128, hs=(1.2, 1.35), fov=50, spread=15, free=cruise_free, maxoff=80)
add(124, 128, 'cruise', s34, "'hanging', 'passenger': Sadi and Compote out of the passenger side, tongues in the wind", v, driver={'pose': 'drive', 'hearts': -1})
# S35 'ride' (b128-130.3): the scrub on the sidewalk turns to the girls' empty saucer behind him, its ramp still down
SAXO_UP = (0.55, 0.65)
s35 = [A('saxo', 'being_surprised_and_looking_right', *SAXO_UP, face='world', yaw=200, at=0.6)]
v = view((1.6, 1.0, 2.9), (0.2, 1.0, -0.8), 48, p1=(1.5, 0.98, 2.75))
add(128, 130.3, 'curb', s35, "the scrub on the sidewalk turns round: the girls' saucer behind him, empty, its ramp still down", v, car=False, noPeds=True)
# S36 the hook line (b130.3-132): he runs up the ramp into the hangar, side on
s36 = [A('saxo', 'happy_run', 0.0, -1.2, face='world', yaw=180, at=0.2, speed=1.1, mz=-2.6, my=0.65, air=True)]
v = view((-5.5, 1.4, -2.5), (0.0, 1.05, -2.5), 60, p1=(-5.4, 1.42, -2.55))
add(130.3, 132, 'curb', s36, "he runs up the ramp into the glowing hangar", v, car=False, noPeds=True)
# S37 the button (b132-133.5, the last hit and the silence): the saucer lifts off with his head out of its hangar, tongue in the wind
HANGAR = (0.0, -6.15)
s37 = [A('saxo', 'happy_idle', *HANGAR, face='world', yaw=15, at=1.0, lift=1.25, my=3.0, myAt=0.1, myDur=0.87, tongue=True, air=True, noShadow=True, **HANG_ARMS)]
v = view((4.6, 0.62, 5.2), (0.0, 3.4, -6.4), 60, p1=(4.6, 0.62, 5.2), ly1=5.4, hand=0.6)   # wide enough for the rim lights and the lit mouth with him in it
add(132, 133.5, 'curb', s37, "the button: the saucer lifts off into the night with the scrub's head out of its hangar, tongue in the wind", v, car=False, noPeds=True,
    shipLift=[0.1, 0.87, 3.0])

for s in shots: clean(s['actors'])
shots.sort(key=lambda x: x['beat'])
ep = {
    'date': '2026-10-05', 'song': {'title': 'No Scrubs', 'artist': 'TLC'},
    'logline': "The girl group sings about scrubs and every line cuts to Saxo doing it: a dog in a backwards cap hanging out of the window of his pal's lowrider, tongue in the wind, broke (a moth flies out of his wallet), waving his phone, howling at their saucer; they want the ride, not him, so they yank him out and cruise off hanging out of it themselves, and he takes their spaceship",
    'new': "src/maps29.js: chrome (the girl group's white spaceship set from the clip: a giant chrome NO on a plinth before a round recess lit through rows of holes, white ribbed walls with cyan light strips, a glass pod with light bars), curb (a night street where their saucer has landed: a chrome rim on a lit belly, a dome, legs, a hangar mouth with a ramp down to the sidewalk; shop fronts with neon, palms, cobra-head lamps; the saucer lifts off with a rider), cruise (the boulevard at night scrolling past the still car, lamps sweeping their glow over it); the ride (a 60s lowrider convertible in candy turquoise with a grey primer passenger door, whitewalls, white tuck-and-roll benches, pink fuzzy dice, hydraulics that hop on the beat with their riders) and its driver (the 'Dai Dai' keeper's bulldog in shades, a backwards red cap and a gold chain: drive, honk, wave, swoon); four looks: Saxo's scrub (a backwards red cap, a tank top, a gold chain, baggy jeans) and the girl group's stage look for Sadi, Kob and Compote (a white high-collared zip jacket, black vinyl trousers, a silver belt with a red buckle, silver platforms)",
    'notes': "The clip: TLC in shiny black vinyl and silver dancing in a white spaceship set, a giant chrome three-letter sign on its back wall, a round chamber whose walls are lit through rows of holes, a glass pod with light bars, fish-eye lenses. The song: three girls describe a guy with no money and no car who hollers at them from a friend's car; the chorus says no. The words, from whitelisted keywords per line (keywords.py: sorted, never the lines): fine, broke, sits, number, give, time, passenger, best, ride, hanging, weak, get. The girls' world is the clip's set; the scrub's is the street at night, where their saucer has landed. Kob, Sadi and Compote are the group (the whole female cast), Saxo the song's subject; the best friend is the bulldog keeper from 'Dai Dai' and the groom from 'Stop The Wedding!' (a callback: he swoons for anyone, the girls this time). Kob's thread: the cat who never goes out ends up with her head out of a car window. The Short (60 s or less, the end kept) opens on the car-window shot (S11).",
    'with': ['sadi', 'kob', 'compote'],
    'clips': ['happy_idle', 'happy_walk', 'happy_run', 'sitting_talking', 'situps', 'hip_hop_dancing_shimmy', 'long_yell_while_standing_leaning_back',
              'shaking_head_no_dismissively', 'being_surprised_and_looking_right', 'standing_left_uppercut_punch', 'high_enthusiasm_fist_pump', 'charleston'],
    'tags': {'structure': 'cutaway', 'scenes': ['girl group in the spaceship set', 'dog out of the car window', 'moth wallet', 'lowrider hydraulics', 'phone snatch', 'yanked out', 'they take the ride', 'saucer lift-off'],
             'cast': ['saxo', 'sadi', 'kob', 'compote'], 'hook': 'dance', 'maps': ['chrome', 'curb', 'cruise'], 'ref': 'none',
             'lyric_literal': "'passenger', 'ride' (four times: the scrub hanging out of the bulldog's lowrider, then the girls in his place), 'broke' (a moth out of his wallet), 'number' (his phone held out; Compote snatches it), 'fine' (him posing by the car), 'weak' (he flexes)",
             'experiment': "Does a Short that opens on a universal pet behaviour (a dog's head out of a car window, the song's own literal line, in its first frame) instead of a dance get more views at 24 h than our other chart-song Shorts?"},
    'shots': shots,
}
json.dump(ep, open(os.path.join(HERE, '2026-10-05.json'), 'w'), indent=1, ensure_ascii=False)
print(len(shots), 'shots;', len(WARN), 'warnings')
for w in WARN: print('  ', w)
