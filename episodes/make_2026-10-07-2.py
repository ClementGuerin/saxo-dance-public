# make_2026-10-07-2.py: writes episodes/2026-10-07-2.json, "Take on Me" (a-ha, 1985; a throwback on the charts, the queue
# being empty: Spotify global #126 after 116 days, ~976k TikTok videos on its 30 s sound and 510k on its 60 s one; picked
# from the charts on disk and SocialCrawl after the night's second run was stopped by the filter while picking).
# The world (the official video, looked at as contact sheets every 3 s, its chase in the middle left out): a pencil-drawn
# comic of a vintage motor race (leather helmets, goggles, number 13, a starting flag, speed lines), a girl reading it at
# a café table (white curtains, an ICE COLD MILK sign in the window, a waitress in black), the drawn hero winking at her
# from the page and reaching his hand out of it, pulling her into the drawn world (white frames standing in a white void
# showing the real world through them), then, at her home, throwing himself at the walls of the panels until he comes
# out into her world, half drawn and half real.
# Ours, "the dog at the door" (DOORWAY, a new structure: the pet who begs to go through a door, then begs to come back,
# again and again, each crossing changing him, the doorkeeper's patience running out; the payoff stops him in the
# doorway, half and half): Saxo is the drawn racing hero of a comic (pencil: the shader's sketch plane and the 2D layer's
# sketchFx, new), winning a race against Compote in car 7. The comic's page is the back wall of a real 80s diner, where
# Sadi reads it at her table and Kob, the waitress, minds the counter. The drawn dog notices his reader, leans out of
# the page (his snout in colour), holds his paw out of it, and on the chorus's first "take" pulls her in: she's drawn too.
# They dance in the white void until Compote comes for him with a giant wrench; he dives out into the diner, in colour
# for the first time, Kob slams the page shut on the wrench... and he scratches at it to go back in. In, out, in: Kob
# opens and shuts the page for him every time, deader in the eyes; on "two" he stops in the doorway, half drawn and half
# real, wagging, and won't choose.
# Beats: 169.0943 BPM, kit beat b at 0.0041 + b * 0.354832 s (kit beat 0 = song beat 16, the riff's first bar); a bar = 4.
# Sections (kit beats): the riff b0-32 (the synth alone with the drums), the riff with the band b32-80, verse 1 b80-128
# (K00 b80.6, K01 b88.5, K02 b96.1, K03 b104.0, K04 b114.0, K05 b122.0), chorus 1 b128-192 (K06 b128.6, K07 b144.6, K08
# b160.3, K09 b173.7; its last word held to the end); the music stops at b190.8 (67.71 s); silence to b191.8 (68.06 s).
# Key words (whitelisted single words with their kit beats, never the lines): talking b81.3, away b83.9 | know b90.7,
# say b94.7 | say b98.0 | day b108.5, find b111.4 | away b116.4 | love b125.4, okay b126.5 | take b128.6, b141.5 | take
# b144.6, b157.3 | gone b169.2 | day b176.0, two b178.5. The lyrics stay in episodes/2026-10-07-2.lyrics.js (the
# generator reads only their times).
import json, math, os, re, sys
sys.path.insert(0, os.path.dirname(__file__))
from cam import view, vpath, swoop, low, deadpan

HERE = os.path.dirname(__file__)
PER, B0 = 60 / 169.0943, 0.0041
END_B = 191.8
def T(b): return B0 + b * PER
def Bt(t): return (t - B0) / PER                 # kit seconds -> kit beat
def S(b, b0): return round((b - b0) * PER, 3)    # seconds from shot beat b0 to beat b

LOOK = {'saxo': 'racer', 'sadi': 'reader', 'kob': 'bartender', 'compote': 'bobsled'}   # Compote the rival racer in her yellow racing suit (the punk jacket's studs hatched into a second grin)
HEAD = {'saxo': 1.36, 'sadi': 1.46, 'kob': 1.42, 'compote': 1.42}        # the top of each head standing (the helmet, the perm, the ears)
FACE = {'saxo': 0.9, 'sadi': 0.84, 'kob': 0.86, 'compote': 0.86}
RAD = {'saxo': 0.5, 'sadi': 0.52, 'kob': 0.4, 'compote': 0.4}            # the helmet's flaps and the perm widen two heads
SIT = 0.06

# ---- the map (src/maps34.js COMIC): the page wall at z = 0, the diner in front (z > 0), the comic drawn behind ----
DOOR_X, DOOR_H = 0.62, 2.05                       # the door's clear half-width and height (inside its inked border)
TABLE = (-1.15, 1.5); CHAIR = (-1.15, 2.12); CHAIR_Y = 0.42
KOB_BAR = (4.95, 4.2); DECK = 0.3
KOB_DOOR = (1.9, 0.92)                            # Kob minding the page beyond its hinge (1.51 m from it: the 1.4 m leaf turning flat against the wall never reaches her)
LANE13, LANE7, GRID = -5.55, -7.35, -1.0
SEAT_Y, SEAT_DX = 0.5, 0.35
GUESTS = [(-5.55, 2.12), (-5.55, 3.68), (-5.55, 4.52), (-5.55, 8.48), (3.1, 4.95), (3.1, 7.15)]

def A(who, clip, x, z, **o):
    return {'who': who, 'look': o.pop('look', LOOK[who]), 'clip': clip, 'x': round(x, 3), 'z': round(z, 3), 'face': o.pop('face', 'camera'),
            'yaw': o.pop('yaw', 0), 'at': o.pop('at', 'auto'), **o}
def yaw_to(frm, to): return round(math.degrees(math.atan2(to[0] - frm[0], to[1] - frm[1])), 1)
def milk(**o):                                   # Kob's milk bottle held out at her side (in front of her belly a white bottle vanished on the shirt)
    return dict(holdL='milkbottle', holdScale=1.3, arm='L', aim=[0.62, -0.2, 0.3], upAt=-1, **o)
def reading(**o):                                # Sadi at her table, reading the comic (the seated clip held at its head-up moment)
    return A('sadi', 'sitting_talking', *CHAIR, face='world', yaw=180, at=0.05, speed=0.0, lift=CHAIR_Y, sit=True, hold='comic', **o)
def driver(who, car_x, lane, **o):               # a racer in the cockpit, facing the car's nose (-x)
    return A(who, o.pop('clip', 'male_driving_a_car'), car_x + SEAT_DX, lane, face='world', yaw=-90, at=o.pop('at', 0.5), lift=o.pop('lift', SEAT_Y), sit=True, **o)
def wrench(**o):                                 # Compote's giant spanner held out beside her head (bigger, its head rose into the lyric rows and read as a post)
    return dict(hold='wrench', holdScale=0.95, arm='R', aim=[0.75, 0.45, 0.25], upAt=-1, **o)

# ---- a projection check (numbers only): where each face lands in the 9:16 frame at the shot's start and end ----
def _proj(cam, look, fov, pt):
    f = [look[i] - cam[i] for i in range(3)]; n = math.sqrt(sum(v * v for v in f)); f = [v / n for v in f]
    r = [-f[2], 0.0, f[0]]; rn = math.sqrt(r[0] ** 2 + r[2] ** 2) or 1; r = [r[0] / rn, 0.0, r[2] / rn]
    u = [r[1] * f[2] - r[2] * f[1], r[2] * f[0] - r[0] * f[2], r[0] * f[1] - r[1] * f[0]]
    d = [pt[i] - cam[i] for i in range(3)]; z = sum(a * b for a, b in zip(d, f))
    if z <= 0.05: return None
    tv = math.tan(math.radians(fov) / 2); th = tv * 9 / 16
    return (0.5 + sum(a * b for a, b in zip(d, r)) / z / th / 2, 0.5 - sum(a * b for a, b in zip(d, u)) / z / tv / 2)
_src = open(os.path.join(HERE, '2026-10-07-2.lyrics.js')).read()
_rows = json.loads(re.search(r'window\.LYRICS = (.*?);\n', _src).group(1)); _ends = json.loads(re.search(r'window\.LINE_END = (.*?);\n', _src).group(1))
LINES = [(Bt(row[0][0] - 0.35), Bt(e)) for row, e in zip(_rows, _ends)]
def has_line(b0, b1): return any(a < b1 and b > b0 for a, b in LINES)
WARN = []
def body(a, end):                                # (who, x, z, face y, head top y) at the shot's start (0) or end (1)
    who = a['who']; sc = a.get('scale', 1)
    x, z = a['x'] + a.get('mx', 0) * end, a['z'] + a.get('mz', 0) * end
    lift = a.get('lift', 0) + (a.get('my', 0) if end else 0) - (a.get('sitDrop', SIT) if a.get('sit') else 0)
    return (who, x, z, FACE[who] * sc + lift, HEAD[who] * sc + lift)
LEAF = ((0.7, 0.0), (2.05, 0.36))                 # the page leaf turned open (page 1 = 165 deg), in plan
def _cross(a, b, c, d):
    def o(p, q, r): return (q[0] - p[0]) * (r[1] - p[1]) - (q[1] - p[1]) * (r[0] - p[0])
    return o(a, b, c) * o(a, b, d) < 0 and o(c, d, a) * o(c, d, b) < 0
def door_sight(cam, p):                          # a line of sight across the page wall must pass through the door, and none through the open leaf
    if _cross((cam[0], cam[2]), (p[0], p[2]), *LEAF):
        u = 0.5; return False
    if (cam[2] > 0) == (p[2] > 0): return True
    u = cam[2] / (cam[2] - p[2]); X = cam[0] + (p[0] - cam[0]) * u; Y = cam[1] + (p[1] - cam[1]) * u
    return abs(X) < DOOR_X and Y < DOOR_H
def comic_free(c):                               # a lens in the diner (inside its walls, under its ceiling) or in the drawn world
    x, y, z = c
    if y < 0.12: return False
    if z > 0.1: return abs(x) < 6.2 and z < 9.2 and y < 3.35 and not (3.45 < x < 5.7 and 2.1 < z < 8.7 and y < 1.0) and not (0.55 < x < 2.25 and z < 0.65)
    if z < -0.1: return abs(x) < 40 and z > -60
    return False
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
        if not door_sight(cam, (x, fy, z)) and abs(z) > 0.35: WARN.append(f'b{beat}: {who} behind the page wall{tag}')
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
def guest_clear(v):                              # the diner's customers (map objects) near a lens
    out = []
    for k in (0, -1):
        cam = lens(v, k)
        out += [[gx, gz, 0.1] for gx, gz in GUESTS if math.hypot(gx - cam[0], gz - cam[2]) < 1.3]
    return [list(c) for c in {tuple(c) for c in out}]
def add(beat, b1, actors, lyric, v, **o):
    c, focus = v
    o = {k: val for k, val in o.items() if val is not None}
    gc = guest_clear(v)
    if gc: o['clear'] = o.get('clear', []) + gc
    shots.append({'beat': beat, 'kind': 'dance', 'map': 'comic', 'actors': actors, 'lyric': lyric, 'cam': c, 'focus': focus, **o})
    fy = focus[2] if len(focus) > 2 else 0
    for k, end in ((0, 0), (-1, 1)):
        cam, look = lens(v, k), (focus[0], c['look'][k] + fy, focus[1])
        if not comic_free(cam): WARN.append(f'b{beat}: lens {tuple(round(q, 2) for q in cam)} inside the set{" at the end" if end else ""}')
        check(beat, b1, cam, look, c['fov'], actors, end)
        for oc in _occl(cam, look, c['fov'], [body(a, end)[:4] for a in actors if not a.get('lying') and not a.get('fg') and not a.get('away')]):
            WARN.append(f'b{beat}: {oc}{" at the end" if end else ""}')
def clean(actors):                               # the generator's own keys off the actors
    for a in actors:
        for k in ('sit', 'sitDrop', 'lying', 'away'): a.pop(k, None)
    return actors
def at_on(clip_s, b, b0, speed=1.0):             # the clip offset that puts clip time clip_s on beat b of a shot starting at b0
    return round(clip_s - S(b, b0) * speed, 3)

# ================= a lens search: every face inside the frame and under the lyric rows at the shot's start and end,
# no face inside a nearer head's disc, the lens free of the set, every line of sight across the page through its door =================
WHY = {}
def _no(r): WHY[r] = WHY.get(r, 0) + 1; return None
FACING = {}
def _ok(cam, look, fov, phases, line, occ=(), maxoff=105, sight=None):
    worst = 1.0
    for w, yw in FACING.items():
        x0, z0 = next(((s_[1], s_[2]) for s_ in phases[0] if s_[0] == w), (None, None))
        if x0 is None: continue
        dx, dz = cam[0] - x0, cam[2] - z0; dn = math.hypot(dx, dz) or 1
        if (math.sin(math.radians(yw)) * dx + math.cos(math.radians(yw)) * dz) / dn < math.cos(math.radians(maxoff)): return _no(f'{w} faces away')
    fx, fz = look[0] - cam[0], look[2] - cam[2]; n = math.hypot(fx, fz) or 1; rx, rz = -fz / n, fx / n
    for subs in phases:
        for w, x, z, fy, ty in subs:
            if sight and abs(z) > 0.35 and not sight(cam, (x, fy, z)): return _no(f'{w} behind the wall')
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
def lens_for(actors, ang, dist, b0, b1, hs=(1.0,), fov=50, look=None, spread=40, dr=(0.8, 1.5), free=comic_free, sight=door_sight, push=0.04, facing=True, maxoff=105, **o):
    vis = [a for a in actors if not a.get('fg') and not a.get('lying') and not a.get('away')]
    FACING.clear(); FACING.update({a['who']: a.get('yaw', 0) for a in vis if a.get('face') == 'world'} if facing else {})
    phases = [[body(a, 0) for a in vis if not a.get('reveal')], [body(a, 1) for a in vis]]
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
                f = _ok(cam, L, fov, phases, line, occ, maxoff, sight)
                if f is None or f < 0: continue
                score = abs(da) / 40 + abs(d - dist) / dist + (0.25 - min(f, 0.25))
                if best is None or score < best[0]: best = (score, cam)
    if best is None:
        raise SystemExit(f'b{b0}: no lens for {[s_[0] for s_ in phases[0]]} round {ang} deg at {dist} m; rejections: {sorted(WHY.items(), key=lambda kv: -kv[1])[:6]}, not free: {nfree}')
    cam = best[1]; p1 = (cam[0] + (L[0] - cam[0]) * push, cam[1], cam[2] + (L[2] - cam[2]) * push)
    return view(tuple(round(c, 3) for c in cam), tuple(round(c, 3) for c in L), fov, p1=tuple(round(c, 3) for c in p1), **o)

CARS_GRID = [{'num': 13, 'x': 0.9, 'z': LANE13}, {'num': 7, 'x': 0.9, 'z': LANE7}]

# =====================================================================================================================
# THE COMIC (the riff, b0-32): a pencil-drawn race
# S01 the hook (b0-8): the drawn dog alone doing the charleston in the comic's white void (its kick on frame 1), the
# page's open door behind him showing the real diner in colour. The fallback after three review loops: S20's passed low
# lens (a swoop over car 13 to him on the start line read as a jumble under the big head, the car as a blob)
s = [A('saxo', 'charleston', -0.45, -1.5, at=0.7)]
v = low((-0.25, 0.55, -5.6), (-0.45, 0.85, -1.5), (-0.27, 0.52, -5.2), fov=56, roll=(-6, -4))
add(0, 8, s, "the riff (no words): the drawn dog dances in the comic's white void, the real diner in colour through the page's door", v, page=1, cars=[])
# S02 (b8-12): Compote in car 7, a deadpan glare over its nose, the wrench up
s = [driver('compote', 0.9, LANE7, **wrench())]
v = deadpan((0.9 + SEAT_DX, LANE7), 1.05, 3.1, cam_y=1.25, ang=-90, fov=46)
add(8, 12, s, "the rival in car 7 glares, wrench up", v, cars=CARS_GRID, clear=[[-0.4, -9.05, 0.6]])
# S03 (b12-16): the dog in car 13 at the wheel, tongue out: the reverse of her glare. The fallback after three review
# loops: S02's passed framing mirrored onto car 13 (the starter's flag pole kept landing on his goggles)
s = [driver('saxo', 0.9, LANE13, tongue=True, lift=SEAT_Y + 0.07)]   # 7 cm up: at the seat the number board covered his mouth and tongue (the final review)
v = deadpan((0.9 + SEAT_DX, LANE13), 1.05, 3.1, cam_y=1.25, ang=-102, fov=46)   # 12 deg round: the far fence's flag poles stood behind his helmet at -90 (the final review)
add(12, 16, s, "the dog at the wheel, tongue out: the reverse of her glare", v, cars=CARS_GRID, clear=[[-0.4, -9.05, 0.6]])
# S04-S05 (b16-32): the race and the finish, the classic shot: from behind car 13 the world streams past, the dog standing
# in his seat pumping both paws, and the chequered banner comes up the road and sweeps over it (the Short opens just
# before it). The fallback after three review loops: S05's passed lens now covers the race too (the side-by-side never
# showed car 7); happy_idle at 0.2 x so it stays before its head roll (clip 1.2 s) and holds S05's pose at the finish
S05_CAM = (5.4, 2.3, -5.1)                         # 4.2 m behind the car and 2.3 m up (under the banner's 2.55 m bottom): the road behind his head, the stand's roof posts and the approaching banner near the horizon above it (3 m behind looking up at the banner it read as a head over hatched planks; at 1.3 m up the roof posts and the banner sat on his helmet)
s = [A('saxo', 'happy_idle', 0.9 + SEAT_DX, LANE13, face='world', yaw=yaw_to((0.9 + SEAT_DX, LANE13), (S05_CAM[0], S05_CAM[2])), at=0.3, speed=0.1, lift=SEAT_Y - 0.12, tongue=True, arm='both', aim=[0.15, -0.25, 0.95], upAt=-1)]   # the dog in a convertible: both paws over the cockpit's edge, tongue in the wind (the rave swing put his paws at his cheeks: panic)
v = view(S05_CAM, (1.25, 1.3, -5.55), 52, p1=(5.15, 2.25, -5.15), ease='lin')
add(16, 32, s, "the race and the finish: from behind car 13, the dog standing in his seat pumping both paws; the chequered banner sweeps over it", v,
    cars=[CARS_GRID[0]], race={'speed': 13, 'finish': S(26.5, 16), 'lines': False}, fans='cheer')

# =====================================================================================================================
# THE DINER (the riff with the band, b32-80): the comic is the diner's back wall, and Sadi is reading it
# S06 the reveal (b32-40, the band comes in): a pull-back out of the drawn world through the page's open door into the
# colour diner, ending over Sadi's shoulder at her table (she reads the comic; the winner beyond the door)
s = [reading(fg=True), A('saxo', 'high_enthusiasm_fist_pump', -0.05, -4.95, at=1.2, tongue=True, reveal=0.6)]
v = vpath([(0.05, 1.3, -2.3), (-0.12, 1.34, -0.7), (-0.42, 1.48, 1.6), (-0.82, 1.62, 3.55)], (-0.05, 1.0, -6.0), 54, looks=[1.0, 1.0, 1.05, 1.12], ease='out')
add(32, 40, s, "the reveal: out of the comic through the page's door into the diner, over Sadi's shoulder: she's reading it", v,
    page=1, cars=[CARS_GRID[0], {'num': 7, 'x': 3.4, 'z': LANE7}], fans='cheer')
# S07 (b40-44): Kob behind the counter, deadpan, her milk (the watcher)
s = [A('kob', 'happy_idle', *KOB_BAR, face='world', yaw=-90, at=0.4, speed=0.2, lift=DECK, **milk())]
v = deadpan(KOB_BAR, 1.3, 2.55, cam_y=1.32, ang=-90, fov=44)
add(40, 44, s, "Kob, the waitress, deadpan behind the counter with her milk", v, page=1)
# S08 (b44-48): Sadi reading, seen from inside the comic through the open door (the hero's view of his reader)
s = [reading()]
v = view((-0.25, 1.15, -1.15), (-1.15, 1.18, 2.12), 46, p1=(-0.25, 1.15, -1.0), ease='lin')
add(44, 48, s, "the reader, from inside the comic: through the door, the girl at her table with the comic", v, page=1)
# S09 (b48-56): the drawn dog notices her: over her shoulder, through the door, he walks up from the track to the page
s = [reading(fg=True), A('saxo', 'happy_walk', 0.45, -3.4, face='world', yaw=-6, at=0.2, mz=2.75, mx=-0.3)]
v = view((-0.55, 1.62, 4.35), (0.2, 0.95, -0.9), 50, p1=(-0.5, 1.58, 4.1), ease='lin')
add(48, 56, s, "over her shoulder: the drawn dog walks up to the page's door", v, page=1)
# S10 (b56-64): she looks up from the comic: her face, smitten (hearts), from the door's side
s = [reading()]
v = view((-0.35, 1.15, 0.3), (-1.15, 1.2, 2.12), 46, p1=(-0.4, 1.15, 0.45), ease='lin')
add(56, 64, s, "she looks up from the comic: smitten", v, page=1, hearts=[[-1.15, 1.42, 2.15, S(58, 56)]], heartYaw=yaw_to((-1.15, 2.1), (-0.35, 0.3)))
# S11 (b64-72): the drawn dog dances for her in the doorway (a pencil charleston), over her head
s = [reading(fg=True), A('saxo', 'charleston', 0.0, -0.95, at=0.2)]
v = view((-0.95, 1.12, 3.15), (0.0, 0.88, -0.55), 52, p1=(-0.85, 1.08, 2.85), ease='lin')
add(64, 72, s, "the drawn dog dances for her in the page's door", v, page=1)
# S12 (b72-80): Kob deadpan again, a new angle: turned to the page, sipping (the lens looks over her face: K00 comes up)
s = [A('kob', 'happy_idle', *KOB_BAR, face='world', yaw=yaw_to(KOB_BAR, (0, 0)), at=0.4, speed=0.15, lift=DECK, **milk())]
v = deadpan(KOB_BAR, 1.42, 2.05, cam_y=1.46, ang=yaw_to(KOB_BAR, (0, 0)), fov=44)
add(72, 80, s, "Kob turned to the page, deadpan", v, page=1)

# =====================================================================================================================
# VERSE 1 (b80-128): the seduction
# S13 (b80-88, K00 'talking' b81.3, 'away' b83.9): over her shoulder: he leans out of the page towards her and his head
# comes out of it in colour, his body still drawn behind it
s = [reading(fg=True), A('saxo', 'happy_idle', 0.0, -0.78, face='world', yaw=yaw_to((0, -0.78), CHAIR), at=0.3, speed=0.4, lean=30, tongue=True)]
v = view((-0.35, 1.52, 3.85), (0.0, 1.0, -0.2), 46, p1=(-0.32, 1.49, 3.6), ease='lin')
add(80, 88, s, "K00: he leans out of the page towards her, his head in colour", v, page=1)
# S14 (b88-96, K01 'know' b90.7, 'say' b94.7): from inside the comic, through the door: the reader, smitten (hearts on
# 'know'). The fallback after three review loops: S08's passed lens with S10's passed hearts (her giggle never read)
S14_CAM = (-0.25, 1.15, -1.15)
s = [reading()]
v = view(S14_CAM, (-1.15, 1.18, 2.12), 46, p1=(-0.25, 1.15, -1.1), ease='lin')
add(88, 96, s, "K01: from inside the comic, through the door: the reader, smitten", v, page=1,
    hearts=[[-1.15, 1.42, 2.15, S(90.7, 88)]], heartYaw=yaw_to((-1.15, 2.1), (S14_CAM[0], S14_CAM[2])))
# S15 (b96-104, K02 'say' b98.0): Kob shakes her head (no), deadpan, frontal (the lens over her face: a line is up)
s = [A('kob', 'shaking_head_no_dismissively', *KOB_BAR, face='world', yaw=-90, at=0.2, speed=0.8, lift=DECK, **milk())]
v = deadpan(KOB_BAR, 1.3, 2.55, cam_y=1.32, ang=-90, fov=44)
add(96, 104, s, "K02: Kob shakes her head: no", v, page=1)
# S16 (b104-112, K03 'day' b108.5, 'find' b111.4): he holds a rose out of the page towards her (the clip's hand out of the
# comic; a chibi paw reaching forward vanishes in front of its own head): the rose is drawn in pencil until it crosses
# the page, then it's red
ROSE_AT = (0.05, -0.3)
s = [A('saxo', 'happy_idle', *ROSE_AT, face='world', yaw=64, at=0.3, speed=0.0, hold='rose', holdScale=1.5, arm='R', aim=[0.9, 0.42, 0.2], upAt=S(106, 104), tongue=True)]
v = view((1.9, 1.2, 1.95), (0.0, 1.0, -0.1), 46, p1=(1.8, 1.18, 1.85), ease='lin')
add(104, 112, s, "K03: he holds a rose out of the page towards her; it turns red as it comes out", v, page=1)
# S17 (b112-120, K04 'away' b116.4): over Sadi's shoulder at her table: she looks to Kob, and Kob shakes her head again
KOB_B2 = (4.95, 3.8)                              # along the counter, so the line from Sadi passes between two stools
s = [A('sadi', 'sitting_talking', *CHAIR, face='world', yaw=yaw_to(CHAIR, KOB_B2), at=0.05, speed=0.0, lift=CHAIR_Y, sit=True, hold='comic', fg=True),
     A('kob', 'shaking_head_no_dismissively', *KOB_B2, face='world', yaw=yaw_to(KOB_B2, CHAIR), at=0.4, speed=0.8, lift=DECK, **milk())]
v = view((-1.95, 1.62, 2.4), (4.95, 1.25, 3.8), 26, p1=(-1.9, 1.6, 2.4), ease='lin')
add(112, 120, s, "K04: over her shoulder, she looks to Kob; Kob shakes her head", v, page=1)
# S18 (b120-128, K05 'love' b125.4, 'okay' b126.5): she gets up and goes to the page; he holds the rose out to her
# (red on her side of the page); hearts on 'love'
SADI_UP = (-0.55, 0.95); SAXO_ROSE = (0.15, -0.36)
s = [A('sadi', 'happy_idle', *SADI_UP, face='world', yaw=yaw_to(SADI_UP, (-0.25, 0.1)), at=0.3, speed=0.3),
     A('saxo', 'happy_idle', *SAXO_ROSE, face='world', yaw=40, at=0.3, speed=0.0, hold='rose', holdScale=1.7, arm='R', aim=[0.92, 0.38, 0.3], upAt=-1)]
v = lens_for(s, 35, 3.3, 120, 128, hs=(1.15, 1.3, 1.45), fov=52, spread=25, dr=(0.8, 1.5))
add(120, 128, s, "K05: she comes to the page; he holds the rose out through it, between them; hearts on 'love'", v, page=1, hearts=[[SADI_UP[0], 1.85, SADI_UP[1], S(125.4, 120)]], heartYaw=40)

# =====================================================================================================================
# CHORUS 1 (b128-192): the pull-in, then the dog at the door
# S19 (b128-132, K06 'take' b128.6): she takes his paw and he pulls her in: from inside the comic, she comes through the
# page at the lens, real, then drawn (the split crossing her as she passes)
s = [A('sadi', 'happy_run', -0.3, 0.7, face='world', yaw=180, at=0.2, speed=0.9, mz=-1.85, moveAt=0.3),
     A('saxo', 'happy_walk', 0.42, -0.45, face='world', yaw=180, at=0.3, speed=1.0, mz=-0.9, moveAt=0.2, tongue=True)]
v = lens_for(s, 180, 2.9, 128, 132, hs=(1.0, 1.15, 1.3), fov=52, spread=30)
add(128, 132, s, "K06 'take': she takes his paw and he pulls her into the comic: she comes through the page, then she's drawn", v, page=1)
# S20 (b132-140, the held 'take'): inside the comic the two of them dance in the white void, drawn; the diner in colour
# through the door behind them
s = [A('saxo', 'charleston', -0.85, -1.45, at=0.7), A('sadi', 'charleston', -0.05, -1.5, at=0.7)]
v = low((-0.25, 0.55, -5.6), (-0.45, 0.85, -1.5), (-0.27, 0.52, -5.2), fov=56, roll=(-6, -4))
add(132, 140, s, "K06 held: inside the comic the two dance, drawn, the diner in colour through the door", v, page=1, cars=[])
# S21 (b140-144, the quick 'take' b141.5): Compote marches up behind them, wrench raised, deadpan
s = [A('compote', 'happy_walk', 1.55, -3.9, face='world', yaw=yaw_to((1.55, -3.9), (0.1, -1.4)), at=0.2, speed=0.8, mx=-0.4, mz=0.7, **wrench())]
v = lens_for(s, -30, 2.4, 140, 144, hs=(0.9, 1.1, 1.3), fov=44, spread=25)
add(140, 144, s, "K06 'take': the rival marches up, wrench raised", v, page=1)
# S22 (b144-148, K07 'take' b144.6): he bolts out of the page at the lens, Kob at the door (the first of his crossings
# out: S28 rhymes with it). The fallback after three review loops: S28's passed composition (the spanner's swing behind
# him never read, nor his drawn back half from the side)
s = [A('saxo', 'happy_run', 0.3, -0.95, face='world', yaw=0, at=0.1, speed=1.2, mz=2.1, moveAt=0.25),
     A('kob', 'happy_idle', *KOB_DOOR, face='world', yaw=-20, at=0.3, speed=0.2, **milk())]
v = lens_for(s, 12, 3.6, 144, 148, hs=(1.0, 1.15, 1.3, 1.45), fov=52, spread=40, dr=(0.8, 1.9))
add(144, 148, s, "K07 'take': he bolts out of the page, Kob at the door", v, page=1)
# S23 (b148-152): Kob slams the page shut behind him; the wrench thumps it from inside; he jumps
s = [A('saxo', 'happy_idle', 0.3, 1.0, face='world', yaw=15, at=0.3, speed=0.5),
     A('kob', 'happy_idle', *KOB_DOOR, face='world', yaw=-35, at=0.3, speed=0.2, arm='R', aim=[0.6, 0.1, 0.8], upAt=-1, aim2=[0.7, 0.15, 0.45], aim2At=0.15, holdL='milkbottle')]
v = lens_for(s, 15, 3.6, 148, 152, hs=(1.0, 1.15, 1.3), fov=52, spread=40, dr=(0.8, 1.9))
add(148, 152, s, "Kob slams the page shut; the wrench thumps it from inside", v, page=[0.05, 0.28, 1, 0], knock=[S(150, 148), S(150.6, 148)])
# S24 (b152-156): real for the first time: he looks at himself in colour and does a happy dance on the checker floor
s = [A('saxo', 'gangnam', 0.15, 1.2, at=1.2, tongue=True)]
v = low((0.45, 0.3, 3.5), (0.15, 0.82, 1.2), (0.4, 0.28, 3.1), fov=60, roll=(-9, -6))
add(152, 156, s, "real for the first time: a happy dance in colour", v, page=0)
# S25 (b156-160, K07 'take' b157.3): he turns and scratches at the shut page to go back in (his back to us, as every dog
# at every door); on 'take' Kob opens it
s = [A('saxo', 'happy_idle', 0.3, 0.42, face='world', yaw=180, at=0.3, speed=0.4, arm='both', aim='caramell', flapEvery=0.5),
     A('kob', 'happy_idle', KOB_DOOR[0] - 0.2, KOB_DOOR[1], face='world', yaw=20, at=0.3, speed=0.2, **milk())]
v = lens_for(s, 5, 3.4, 156, 160, hs=(1.0, 1.15, 1.3), fov=52, spread=40, dr=(0.8, 1.9), facing=False)
add(156, 160, s, "K07 'take': he scratches at the shut page to go back in; Kob opens it", v, page=[S(157.3, 156), S(158.2, 156), 0, 1])
# S26 (b160-164, K08): he trots back in towards us, real until he's through the page, then drawn again; Sadi waves him in
# (drawn hearts)
s = [A('saxo', 'happy_run', 0.15, 0.8, face='world', yaw=180, at=0.1, speed=1.1, mz=-1.95, moveAt=0.1),
     A('sadi', 'happy_idle', -0.85, -1.75, face='world', yaw=150, at=0.4, hop=[0.22, 1], air=True, arm='both', aim='rave')]
v = lens_for(s, 200, 3.2, 160, 164, hs=(1.0, 1.15, 1.3), fov=52, spread=35, facing=False)
add(160, 164, s, "K08: he trots back in, drawn again; she waves", v, page=1, hearts=[[-0.85, 1.75, -1.75, S(161.5, 160)]], heartYaw=200)
# S27 (b164-168): inside: the wrench goes up again, the rival closing in from the side; he looks round
s = [A('saxo', 'being_surprised_and_looking_right', 0.05, -0.75, face='world', yaw=200, at=0.3),
     A('compote', 'happy_walk', -1.55, -1.75, face='world', yaw=yaw_to((-1.55, -1.75), (0.05, -0.75)), at=0.3, speed=0.7, mx=0.4, mz=0.25, **wrench())]
v = lens_for(s, 105, 3.0, 164, 168, hs=(1.0, 1.15, 1.3), fov=52, spread=30)
add(164, 168, s, "the wrench goes up again; he looks round", v, page=0)
# S28 (b168-172, K08 'gone' b169.2): Kob opens and he hops out again: gone
s = [A('saxo', 'happy_run', 0.3, -0.95, face='world', yaw=0, at=0.1, speed=1.2, mz=2.1, moveAt=0.25),
     A('kob', 'happy_idle', *KOB_DOOR, face='world', yaw=-20, at=0.3, speed=0.2, **milk())]
v = lens_for(s, 12, 3.6, 168, 172, hs=(1.0, 1.15, 1.3, 1.45), fov=52, spread=40, dr=(0.8, 1.9))
add(168, 172, s, "K08 'gone': the page opens, he hops out again", v, page=[0.0, 0.22, 0, 1])
# S29 (b172-176, K09): he turns straight round to go back in; Kob holds the page open and stares at him (deadpan, frontal)
s = [A('kob', 'happy_idle', *KOB_DOOR, face='world', yaw=0, at=0.3, speed=0.0, **milk())]
v = deadpan(KOB_DOOR, 1.0, 2.6, cam_y=1.05, ang=0, fov=44)
add(172, 176, s, "K09: he wants back in; Kob holds the page and stares at him", v, page=1)
# S30 (b176-182, K09 'day' b176.0, 'two' b178.5): he steps into the doorway and stops, on 'two': Kob holding the page,
# the dog half in (his front real, his back drawn)
s = [A('saxo', 'happy_walk', -0.05, 0.62, face='world', yaw=180, at=0.2, speed=0.9, mz=-0.62, moveAt=0.0, holdAt=S(178.5, 176), sway=6, swayEvery=0.5),
     A('kob', 'happy_idle', *KOB_DOOR, face='world', yaw=-30, at=0.3, speed=0.0, **milk())]
v = lens_for(s, 20, 3.4, 176, 182, hs=(1.15, 1.3, 1.45), fov=54, spread=40, dr=(0.8, 2.0), facing=False)
add(176, 182, s, "K09 'two': he stops in the doorway, half in, Kob holding the page", v, page=1)
# S31 (b182-190.8, the held last word): the payoff: he stands in the doorway side on to the wall, facing along it away from
# the open page, his head on the page's plane: from 45 deg in the diner his near eye and cheek are real and his far eye
# and cheek drawn, seen through the door (the critic: a three-quarter showed only the back of his head drawn, a pale hood)
s = [A('saxo', 'happy_idle', 0.0, 0.0, face='world', yaw=-90, at=0.3, speed=0.35)]
v = view((-2.15, 1.15, 0.98), (-0.2, 1.04, 0.07), 46, p1=(-1.86, 1.12, 0.88), ease='out')   # ~29 deg off his facing: both eyes show, the far one through the door (from 45 deg it hid behind his snout)
add(182, 190.8, s, "K09 held: the payoff: half drawn, half real, his face split down the middle in the doorway", v, page=1)
# S32 the button (b190.8-end, the music stopped: silence): the same frame, held
s32 = [dict(a) for a in s]
for a_ in s32:
    a_['at'] = round(0.3 + 0.35 * S(190.8, 182), 3); a_['speed'] = 0.0   # the pose S31 ends on, frozen
v = view((-1.86, 1.12, 0.88), (-0.2, 1.04, 0.07), 46, p1=(-1.86, 1.12, 0.88), ease='lin')
add(190.8, END_B, s32, "the button: silence, held", v, page=1, still=True)

for s_ in shots: clean(s_['actors'])
shots.sort(key=lambda x: x['beat'])
ep = {
    'date': '2026-10-07', 'song': {'title': 'Take on Me', 'artist': 'a-ha'},
    'logline': "Saxo is the pencil-drawn racing hero of a comic whose page is the back wall of an 80s diner; he notices Sadi reading him, holds his paw out of the page and on the chorus's first 'take' pulls her in, but once Compote comes for him with a wrench and he dives out into the real diner, in colour, he's a dog at a door: he scratches to go back in, then out, then in, while Kob the waitress turns the page for him deader in the eyes each time, until on 'two' he stops in the doorway, half drawn and half real, and won't choose",
    'new': "The pencil look (src/ps1.js uSk + src/ch/dance.js sketchFx): the shader writes every fragment on one side of a world plane as a luminance code (g = r + 5/255, which the 15-bit colours never make, and its depth in b), and the 2D layer turns those pixels into paper, graphite hatching by tone and outlines (depth steps, strong tone steps, the edge of the real world), boiling every 1/8 s, so the drawn world and the real one share a frame and a character crossing the plane is half drawn and half real; a shot's `sketch` (true, false or a plane) or a map sets it. src/maps34.js: comic (an 80s diner in colour whose back wall is a giant comic page with a door-sized panel whose paper leaf turns into the diner like a page (`page`, `knock`), and the comic's drawn world behind it: a white void with free-standing panel frames, a race track whose road, kerbs, fence, bales and chequered gantry stream past (`race`), a grandstand, a flag starter, two vintage racing cars (`cars`), speed lines); the comic and wrench props; two looks: Saxo the comic's racer (a leather racing helmet with goggles, a white overall with a red stripe and a 13, a red scarf) and Sadi the reader (a big curly blonde 80s perm, an oversized grey blazer, stonewashed jeans)",
    'notes': "The world, from the official video (contact sheets every 3 s, its chase left out): a pencil comic of a vintage motor race, a girl reading it in a café with white curtains and an ICE COLD MILK sign, the drawn hero reaching out of the page and pulling her in, white panel frames in a white void, the hero half drawn and half real at the end. The words, from whitelisted keywords per line (keywords.py: sorted, never the lines): talking, away, know, say, day, find, love, okay, take (the chorus, four times), gone, two. Cast: Saxo the comic's racer (new look), Sadi the reader (new look), Kob the diner's waitress in her bartender look with her milk (the doorkeeper: the human in every dog-at-the-door clip), Compote in her yellow bobsled racing suit as the rival racer with a giant wrench (her punk jacket's studs hatched into a second grin).",
    'with': ['sadi', 'kob', 'compote'],
    'clips': ['happy_idle', 'happy_walk', 'happy_run', 'sitting_talking', 'male_driving_a_car', 'high_enthusiasm_fist_pump', 'being_surprised_and_looking_right',
              'quickly_pointing_angrily_forward', 'zombie_overhead_two_hand_attack', 'shaking_head_no_dismissively', 'waving'],
    'yt': [9.0, 68.06],   # the Short opens as the finish banner comes over the drawn dog in car 13 (its last 59.06 s; at 8.6 s the car's nose tip stood on his goggles like an antenna)
    'tags': {'structure': 'doorway', 'scenes': ['the drawn race', 'the finish', 'the reveal through the page', 'the reader', 'the waitress deadpan', 'the snout out of the page', 'the paw out of the page', 'the pull-in', 'the drawn dance', 'the wrench', 'the dive out into colour', 'the page slammed', 'scratching at the page', 'in again', 'out again', 'half drawn, half real'],
             'cast': ['saxo', 'sadi', 'kob', 'compote'], 'hook': 'dance', 'maps': ['comic'], 'ref': 'none',
             'lyric_literal': "'take' (she takes his paw and is pulled in, on the chorus's first word; the page opens on the next), 'gone' (he hops out again), 'two' (he stops in the doorway in two halves, drawn and real), 'love' (hearts as she reaches for his paw), 'away' (Kob's 'no')",
             'experiment': "A whole new look as the hook (the opening race in pencil, the clip's own world, then the real diner in colour and a dog crossing between them) on a 1985 hit everyone knows, with a pet-owner universal as the payoff (the dog at the door who wants in, then out): more views at 24 h than our other throwback Shorts (No Scrubs 0.56x, Bring Me To Life 0.87x)?"},
    'shots': shots,
}
json.dump(ep, open(os.path.join(HERE, '2026-10-07-2.json'), 'w'), indent=1, ensure_ascii=False)
print(len(shots), 'shots;', len(WARN), 'warnings')
for w in WARN: print('  ', w)
