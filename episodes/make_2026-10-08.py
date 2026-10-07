# make_2026-10-08.py: writes episodes/2026-10-08.json, "So Easy (To Fall In Love)" (Olivia Dean, 2025; the queue being
# empty: the biggest TikTok sound of every candidate checked, 5.15M videos on its 60 s sound, Spotify global #49, the clip
# 108M views on YouTube).
# The world (the official video, looked at as contact sheets every 4 s; nothing violent in it): a London city musical. She
# types at her desk in an open-plan office, then dances through it in a white midi dress with big black flowers, long
# dark curls; the office joins in; a man on the stairs, a black cab, a flower stall, a pale perfume counter, a bookshop
# where she dances with the booksellers, white stucco townhouses at night under old lamp posts, and a crowd dancing in
# the street to end it, the camera rising over them. The title: falling in love is easy.
# Ours, "the cat and the box" (COURTSHIP, a new structure: the lead courts the one who couldn't care less with ever
# grander gifts, each ignored or ruined; the payoff: she falls for the worthless part, the box the gift came in, and he
# finds his own happiness in the gift): Saxo, in the singer's floral dress and curls, is the dog everyone in London falls
# for: the pets swoon as he dances past, Sadi the florist literally falls for him. He only has eyes for Kob, the
# bookshop cat reading in her window, who never looks up: the rose (she turns a page), his begging (she pulls the blind
# down in his face), the biggest bouquet in London (Compote, the shop's bouncer, eats it). At night he gathers the whole
# street under her window for a flash mob (the clip's ending), the blind goes up at last, she comes out, and Compote
# drags in his last gift: a giant box with a red bow. The lid flies off on a pink velvet cat palace with a gold crown;
# Kob walks past it and drops into the empty box, and falls in love with it. The dog sniffs the palace, flops into it,
# and falls in love with that: the cat in the box, the dog in the cat bed, hearts over both, the street dancing round
# them as the camera rises.
# Beats: 139.995 BPM, kit beat b at 0.063 + b * 0.428587 s (kit beat 0 = song beat 196, the chorus 2 downbeat).
# Sections (kit beats): chorus 2 b0-72 (K00 b0, K01 b15.4, K02 b31.2, K03 b44.5, K04 b52, K05 b59.5); bridge b72-128 (the
# ad-libs K06 b71.3, K07 b79.3, K08 b90.2, three 'easy' lines K09 b96, K10 b104, K11 b112, K12 b118.7); chorus 3 b128-192
# (K13 b127.6, K14 b139.4, K15 b155.2, K16 b168.5, K17 b176, K18 b183.5); the music fades out by b191.
# Key words (whitelisted single words with their kit beats, never the lines): easy b4.3, fall b8.5, love b12.5 | come
# b16.1, give b17.2, call b20.6, fall b25.4 | night b38.1, life b43.1 | heart b47.0 | easy b54.6 | fall b61.2, love b62.6
# | yeah b72.2 | easy b98.6, b106.6, b114.6 | yeah b119.6 | easy b128.1, fall b132.4, love b136.4 | come b140.1, give
# b141.2, call b144.6, fall b149.4 | night b162.1, life b167.1 | heart b171.0 | easy b178.6 | fall b185.6, love b186.6.
# The lyrics stay in episodes/2026-10-08.lyrics.js (the generator reads only their times).
import json, math, os, re, sys
sys.path.insert(0, os.path.dirname(__file__))
from cam import view, vpath, swoop, deadpan, topdown

HERE = os.path.dirname(__file__)
PER, B0 = 60 / 139.995, 0.063
def T(b): return B0 + b * PER
def Bt(t): return (t - B0) / PER
def S(b, b0): return round((b - b0) * PER, 3)    # seconds from shot beat b0 to beat b

LOOK = {'saxo': 'floral', 'sadi': 'florist', 'kob': 'kob', 'compote': 'compote'}
HEAD = {'saxo': 1.38, 'sadi': 1.36, 'kob': 1.42, 'compote': 1.42}        # the top of each head standing (the curly wig, the ears)
FACE = {'saxo': 0.9, 'sadi': 0.84, 'kob': 0.86, 'compote': 0.86}
RAD = {'saxo': 0.5, 'sadi': 0.43, 'kob': 0.4, 'compote': 0.4}            # the curly wig widens his head
SIT = 0.4                                                                 # a cat sitting on the floor: her face drops ~0.4 m

# ---- the map (src/maps35.js, LONDON) ----
FACADE_Z, KERB_Z = -3.0, 2.0
WIN = (-2.1, 0.3, 0.45, 2.15)                  # x0, x1, y0, y1 of the bookshop window
DOOR = (0.75, 1.75, 2.2)
KOB_WIN = (-0.9, -3.45)                         # Kob reading in her window
SADI_STALL = (-5.15, -0.95)
CABB = (-2.25, 1.45, 2.15, 3.85, 1.65)          # the cab's box: x0, x1, z0, z1, top
SPOTS = [[-8.6, -2.3], [-8.0, 1.1], [-3.6, 1.0], [3.4, -2.4], [4.8, 1.1], [7.6, -2.5], [8.6, 1.0], [-12.0, -1.0], [12.2, -0.8],
         [-6.9, 1.2], [6.9, 0.9], [9.8, -2.6], [-12.8, 1.0], [13.2, 1.2], [-4.2, -2.4], [3.2, 1.3], [-9.6, -0.6], [10.2, -1.2],
         [-14.0, -2.2], [14.4, -2.2], [-5.2, 1.4], [5.6, -1.0], [-11.2, 1.3], [11.4, 1.3]]     # = the map's SPOTS
NPET = len(SPOTS)

def A(who, clip, x, z, **o):
    return {'who': who, 'look': o.pop('look', LOOK[who]), 'clip': clip, 'x': round(x, 3), 'z': round(z, 3), 'face': o.pop('face', 'camera'),
            'yaw': o.pop('yaw', 0), 'at': o.pop('at', 'auto'), **o}
def yaw_to(frm, to): return round(math.degrees(math.atan2(to[0] - frm[0], to[1] - frm[1])), 1)
BOOK = dict(hold='book', arm='both', aim=[0.12, 0.12, 0.95], upAt=-1)

# ---- a projection check (numbers only): where each face lands in the 9:16 frame at the shot's start and end ----
def _proj(cam, look, fov, pt):
    f = [look[i] - cam[i] for i in range(3)]; n = math.sqrt(sum(v * v for v in f)); f = [v / n for v in f]
    r = [-f[2], 0.0, f[0]]; rn = math.sqrt(r[0] ** 2 + r[2] ** 2) or 1; r = [r[0] / rn, 0.0, r[2] / rn]
    u = [r[1] * f[2] - r[2] * f[1], r[2] * f[0] - r[0] * f[2], r[0] * f[1] - r[1] * f[0]]
    d = [pt[i] - cam[i] for i in range(3)]; z = sum(a * b for a, b in zip(d, f))
    if z <= 0.05: return None
    tv = math.tan(math.radians(fov) / 2); th = tv * 9 / 16
    return (0.5 + sum(a * b for a, b in zip(d, r)) / z / th / 2, 0.5 - sum(a * b for a, b in zip(d, u)) / z / tv / 2)
_src = open(os.path.join(HERE, '2026-10-08.lyrics.js')).read()
_rows = json.loads(re.search(r'window\.LYRICS = (.*?);\n', _src).group(1)); _ends = json.loads(re.search(r'window\.LINE_END = (.*?);\n', _src).group(1))
LINES = [(Bt(row[0][0] - 0.35), Bt(e)) for row, e in zip(_rows, _ends)]
def has_line(b0, b1): return any(a < b1 and b > b0 for a, b in LINES)
WARN = []
def body(a, end):                                # (who, x, z, face y, head top y) at the shot's start (0) or end (1)
    who = a['who']; sc = a.get('scale', 1)
    x, z = a['x'] + a.get('mx', 0) * end, a['z'] + a.get('mz', 0) * end
    lift = a.get('lift', 0) + (a.get('my', 0) if end else 0) - (SIT if a.get('sit') else 0)
    return (who, x, z, FACE[who] * sc + lift, HEAD[who] * sc + lift)
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

# ---- the set: a lens must be on the pavement or the road (or inside the bookshop), never in a wall or the cab; a line
# of sight between the street and the shop must pass through its window (or its open door) ----
def free(c, cab=True):
    x, y, z = c
    if z < FACADE_Z + 0.12:
        if not (-2.3 < x < 2.3 and FACADE_Z - 3.3 < z < FACADE_Z - 0.3 and 0.1 < y < 2.85): return False
    if y < (0.06 if z < KERB_Z else -0.04): return False
    if cab and CABB[0] < x < CABB[1] and CABB[2] < z < CABB[3] and y < CABB[4]: return False
    return True
def sight(cam, p, door=False):
    if (cam[2] > FACADE_Z) == (p[2] > FACADE_Z): return True
    u = (FACADE_Z - cam[2]) / (p[2] - cam[2]); X = cam[0] + (p[0] - cam[0]) * u; Y = cam[1] + (p[1] - cam[1]) * u
    if WIN[0] + 0.05 < X < WIN[1] - 0.05 and WIN[2] + 0.05 < Y < WIN[3] - 0.05: return True
    return door and DOOR[0] + 0.1 < X < DOOR[1] - 0.05 and Y < DOOR[2] - 0.05

shots = []
def lens(v, k=0):
    c, f = v; a = math.radians(c['ang'][k]); fy = f[2] if len(f) > 2 else 0
    return (f[0] + math.sin(a) * c['r'][k], c['h'][k] + fy, f[1] + math.cos(a) * c['r'][k])
def pet_xy(o):
    """the map pets' floor positions for this shot (their spots, a mob block or a gather arc), as maps35.js places them"""
    if o.get('spots'): return [tuple(p) for p in o['spots']]
    if o.get('mob'):
        cx, cz, cols, rows, dx, dz, _ = o['mob']; out = []
        for i in range(NPET):
            c, r = i % cols, i // cols
            if r >= rows: continue
            out.append((cx + (c - (cols - 1) / 2) * dx + (dx * 0.25 if r % 2 else 0), cz + r * dz))
        return out
    if o.get('gather'):
        gx, gz, gr, a0, a1 = o['gather'][:5]
        return [(gx + math.sin(math.radians(a0 + (a1 - a0) * i / (NPET - 1))) * gr, gz + math.cos(math.radians(a0 + (a1 - a0) * i / (NPET - 1))) * gr) for i in range(NPET)]
    return [tuple(p) for p in SPOTS]
def pet_clear(v, actors, o, reach=0.5, lensR=1.0):
    """hide the pets on a line of sight to a face, or near the lens"""
    out = []
    for k in (0, -1):
        cam = lens(v, k)
        for (sx, sz) in pet_xy(o):
            if math.hypot(sx - cam[0], sz - cam[2]) < lensR: out.append([round(sx, 3), round(sz, 3), 0.05]); continue
            for a in actors:
                if a.get('away'): continue
                who, x, z, fy, _ = body(a, 1 if k else 0)
                dx, dz = x - cam[0], z - cam[2]; L = math.hypot(dx, dz) or 1
                u = ((sx - cam[0]) * dx + (sz - cam[2]) * dz) / (L * L)
                if not 0 < u < 1: continue
                hy = cam[1] + (fy - cam[1]) * u
                if math.hypot(sx - (cam[0] + dx * u), sz - (cam[2] + dz * u)) < reach and hy < 1.35 and math.hypot(sx - x, sz - z) > 0.25:
                    out.append([round(sx, 3), round(sz, 3), 0.05]); break
    return [list(c) for c in {tuple(c) for c in out}]
def add(beat, b1, actors, lyric, v, **o):
    c, focus = v
    o = {k: val for k, val in o.items() if val is not None}
    reach = o.pop('reach', 0.5)
    if o.get('pets', 'idle') and not o.get('noguests'):
        o['clear'] = o.get('clear', []) + pet_clear(v, actors, o, reach)
    door = o.get('door', 0); door = (door[3] if isinstance(door, list) else door) > 0.6
    shots.append({'beat': beat, 'kind': 'dance', 'map': 'london', 'actors': actors, 'lyric': lyric, 'cam': c, 'focus': focus, **o})
    fy = focus[2] if len(focus) > 2 else 0
    for k, end in ((0, 0), (-1, 1)):
        cam, look = lens(v, k), (focus[0], c['look'][k] + fy, focus[1])
        check(beat, b1, cam, look, c['fov'], actors, end)
        for oc in _occl(cam, look, c['fov'], [body(a, end)[:4] for a in actors if not a.get('lying') and not a.get('fg') and not a.get('away')]):
            WARN.append(f'b{beat}: {oc}{" at the end" if end else ""}')
        if not free(cam, o.get('cab', True) and o.get('zone', 'day') != 'night'): WARN.append(f'b{beat}: lens inside the set{" at the end" if end else ""}')
        for a in actors:
            if a.get('fg') or a.get('away'): continue
            who, x, z, fy2, _ = body(a, end)
            if not sight(cam, (x, fy2, z), door): WARN.append(f'b{beat}: {who} hidden by the shop front{" at the end" if end else ""}')
def clean(actors):
    for a in actors:
        for k in ('sit', 'lying', 'away'): a.pop(k, None)
    return actors

# ================= a lens search (the APT. generator's): every face inside the frame and under the lyric rows at the
# shot's start and end, no face inside a nearer head's disc, the lens free of the set =================
WHY = {}
def _no(r): WHY[r] = WHY.get(r, 0) + 1; return None
FACING = {}
def _ok(cam, look, fov, phases, line, occ=(), maxoff=105, door=False):
    worst = 1.0
    for w, yw in FACING.items():
        x0, z0 = next(((s_[1], s_[2]) for s_ in phases[0] if s_[0] == w), (None, None))
        if x0 is None: continue
        dx, dz = cam[0] - x0, cam[2] - z0; dn = math.hypot(dx, dz) or 1
        if (math.sin(math.radians(yw)) * dx + math.cos(math.radians(yw)) * dz) / dn < math.cos(math.radians(maxoff)): return _no(f'{w} faces away')
    fx, fz = look[0] - cam[0], look[2] - cam[2]; n = math.hypot(fx, fz) or 1; rx, rz = -fz / n, fx / n
    for subs in phases:
        for w, x, z, fy, ty in subs:
            if not sight(cam, (x, fy, z), door): return _no(f'{w} behind the shop front')
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
def lens_for(actors, ang, dist, b0, b1, hs=(1.0,), fov=50, look=None, spread=40, dr=(0.8, 1.5), cab=True, door=False, push=0.04, facing=True, maxoff=105, **o):
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
                if not free(cam, cab): nfree += 1; continue
                f = _ok(cam, L, fov, phases, line, occ, maxoff, door)
                if f is None or f < 0: continue
                score = abs(da) / 40 + abs(d - dist) / dist + (0.25 - min(f, 0.25))
                if best is None or score < best[0]: best = (score, cam)
    if best is None:
        raise SystemExit(f'b{b0}: no lens for {[s_[0] for s_ in phases[0]]} round {ang} deg at {dist} m; rejections: {sorted(WHY.items(), key=lambda kv: -kv[1])[:6]}, not free: {nfree}')
    cam = best[1]; p1 = (cam[0] + (L[0] - cam[0]) * push, cam[1], cam[2] + (L[2] - cam[2]) * push)
    return view(tuple(round(c, 3) for c in cam), tuple(round(c, 3) for c in L), fov, p1=tuple(round(c, 3) for c in p1), **o)

def kob_reads(**o):                              # Kob in her window, reading, never looking up
    return A('kob', 'happy_idle', *KOB_WIN, face='world', yaw=0, at=o.pop('at', 0.3), speed=o.pop('speed', 0.15), **BOOK, **o)
def hearts_over(x, z, y=1.35, s0=0.0, loop=1): return [round(x, 3), y, round(z, 3), s0, loop]
SAXO_W = (-0.15, -1.55)                          # his mark on the pavement in front of the window (the window to his right in a frontal lens)

# =====================================================================================================================
# BEAT 1, chorus 2 (b0-32): everyone falls for the dog in the dress except the bookshop cat
# S01 the hook (b0-8; 'easy' b4.3): over the black cab's roof and down: Saxo dancing on the pavement in front of the
# bookshop with a red rose, the pets either side swooning, Kob reading in the window behind him, not looking
s01 = [A('saxo', 'charleston', *SAXO_W, at=0.55, hold='rose'), kob_reads()]
v = swoop([(-0.1, 3.0, 4.8), (-0.2, 2.45, 2.45), (-0.25, 1.05, 1.65), (-0.25, 0.42, 1.0)], (-0.45, 0.95, -2.2), fov=60, roll=(0, -3, -9, -4), hand=0.15)
SWOON = [[-2.35, -1.0], [2.05, -1.15], [-2.7, 0.35], [2.4, 0.2], [-1.9, -2.45], [1.65, -2.5]]
add(0, 8, s01, "the hook ('easy'): over the black cab's roof and down to the pavement: Saxo in the singer's floral dress and curls dancing with a red rose in front of the bookshop, the pets either side swooning with hearts, Kob reading in the window behind him", v,
    zone='day', pets='swoon', spots=SWOON, spotsAt=list(SAXO_W))
# S02 (b8-12; 'fall' b8.5): Sadi the florist sees him dance past her stall, hearts, and falls flat on her back for him
s02 = [A('sadi', 'knocked_out_falling_to_back', *SADI_STALL, face='world', yaw=20, at=1.35, speed=1.0, hold='bouquet', ground='mesh'),
       A('saxo', 'charleston', -3.3, -0.45, face='world', yaw=-60, at=0.55, hold='rose', fg=True)]
v = view((-4.1, 1.05, 2.6), (-5.0, 0.8, -0.9), 50, p1=(-4.15, 1.0, 2.45))
add(8, 12, s02, "'fall': Sadi the florist at her flower stall sees him dance past and falls flat on her back for him, hearts popping", v,
    zone='day', pets='swoon', hearts=[hearts_over(-5.15, -0.95, 1.3, 0.0, 1)])
# S03 (b12-16; 'love' b12.5): from above: Sadi on her back on the pavement, her bouquet on her chest, hearts popping over her
s03 = [A('sadi', 'knocked_out_falling_to_back', *SADI_STALL, face='world', yaw=20, at=3.4, speed=0.0, hold='bouquet', ground='mesh', lying=True)]
v = view((-4.95, 2.55, 1.35), (-5.15, 0.1, -1.25), 50, p1=(-4.98, 2.45, 1.2), roll=[0, 5])
add(12, 16, s03, "'love': from above: Sadi on her back on the pavement among dropped flowers, her bouquet on her chest, hearts popping: she fell for him", v,
    zone='day', pets='swoon', hearts=[hearts_over(-5.0, -1.3, 0.55, 0.0, 1)], cab=False)
# S04 (b16-20; 'come' b16.1, 'give' b17.2): side on: he holds the rose up to her window; behind the glass she reads on
s04 = [A('saxo', 'happy_idle', -0.75, -2.15, face='world', yaw=180, at=0.3, speed=0.2, hold='rose', arm='R', aim=[0.55, 0.62, 0.45], upAt=-1), kob_reads(fg=True)]
v = view((0.0, 1.2, -4.8), (-0.8, 0.98, -2.0), 46, p1=(-0.02, 1.2, -4.65))
add(16, 20, s04, "'come', 'give': from inside the shop, over her shoulder as she reads: he holds the rose up to her window, his face at the glass; she never looks up", v, zone='day', pets='idle', cab=False)
# S05 (b20-24; 'call' b20.6): her deadpan through the glass: she turns a page, the rose at the frame's edge
s05 = [kob_reads(speed=0.35, at=0.6)]
v = deadpan(KOB_WIN, 1.0, 2.95, cam_y=1.04, push=0.12, fov=40, ang=0)
add(20, 24, s05, "'call': through the glass, Kob's deadpan: she turns a page; he isn't there", v, zone='day', pets='idle', cab=False)
# S06 (b24-28; 'fall' b25.4): low, frontal: he begs at her window, paws clasped under his chin with the rose
s06 = [A('saxo', 'falling_to_knees_in_prayer', -0.1, -1.45, face='world', yaw=-32, at=3.0, speed=0.35, hold='rose'), kob_reads()]
v = view((-1.6, 0.4, 0.75), (-0.48, 0.9, -2.03), 66, p1=(-1.57, 0.39, 0.64), roll=[-8, -5], hand=0.3)
add(24, 28, s06, "'fall': low and frontal: he begs at her window, paws clasped under his chin, the rose between them; she reads on behind him", v, zone='day', pets='idle')
# S07 (b28-32): over his shoulder: without looking up, she pulls the blind down in his face
s07 = [A('saxo', 'falling_to_knees_in_prayer', -0.6, -1.85, face='world', yaw=180, at=3.4, speed=0.2, hold='rose', fg=True), kob_reads()]
v = view((-0.2, 1.25, 0.55), (-0.9, 1.0, -3.0), 46, p1=(-0.25, 1.22, 0.4))
add(28, 32, s07, "over his shoulder: without looking up, she pulls the blind down in his face", v, zone='day', pets='idle', blind=[0.35, 1.15, 0, 1], cab=False)

# =====================================================================================================================
# BEAT 2, chorus 2 (b32-72): the biggest bouquet in London, eaten; dusk; he dances alone under her window
# S08 (b32-36): Sadi, back on her feet and still swooning, hands him the biggest bouquet in her stall
s08 = [A('sadi', 'happy_idle', -5.3, -1.05, face='world', yaw=60, at=0.3, speed=0.2, hold='bouquet', holdScale=1.9, arm='R', aim=[0.35, 0.15, 0.85], upAt=-1),
       A('saxo', 'happy_idle', -4.2, -0.5, face='world', yaw=-110, at=0.4, speed=0.2, arm='L', aim=[0.3, 0.1, 0.85], upAt=-1)]
v = view((-4.45, 1.05, 2.35), (-4.68, 0.85, -0.8), 50, p1=(-4.45, 1.05, 2.28))
add(32, 36, s08, "Sadi, back on her feet and still swooning, hands him the biggest bouquet in London", v,
    zone='day', pets='swoon', hearts=[hearts_over(-5.3, -1.05, 1.35, 0.0, 1)])
# S09 (b36-40; 'night' b38.1; the lipsync-animal reference): dusk: his locked-off diva close-up, the giant bouquet under his
# chin, the lamp lit behind him: sure of himself
s09 = [A('saxo', 'happy_idle', 0.2, -1.4, face='world', yaw=0, at=0.25, speed=0.12, hold='bouquet', holdScale=1.6, arm='both', aim=[0.12, -0.1, 0.6], upAt=-1)]
v = deadpan((0.2, -1.4), 0.98, 2.6, cam_y=1.0, push=0.12, fov=42, ang=0)
add(36, 40, s09, "'night': dusk falls: his locked-off diva close-up, the giant bouquet under his chin, deadpan sure of himself", v, zone='dusk', pets='idle', cab=False)
# S10 (b40-44; 'life' b43.1): the shop door opens: Compote, the bookshop's bouncer, takes the bouquet off the doorstep and
# eats it, glaring at him; his back in the foreground
s10 = [A('compote', 'happy_idle', 1.25, -2.75, face='world', yaw=0, at=0.3, speed=0.2, hold='bouquet', holdScale=1.6, arm='both', aim=[0.1, 0.05, 0.6], swing='sip', upAt=-1),
       A('saxo', 'happy_idle', 0.0, -1.1, face='world', yaw=150, at=0.3, speed=0.1, fg=True)]
v = view((0.85, 1.0, 1.05), (1.15, 0.85, -2.7), 44, p1=(0.86, 1.0, 0.9))
add(40, 44, s10, "'life': the shop door opens: Compote, the bookshop's bouncer, eats his bouquet on the doorstep, glaring at him", v,
    zone='dusk', pets='idle', door=[0.0, 0.5, 0.0, 1.0], cab=False)
# S11 (b44-48; 'heart' b47.0): frontal: his paw on his heart, heartbroken; Compote munching in the doorway behind him
s11 = [A('saxo', 'happy_idle', 0.4, -1.15, face='world', yaw=0, at=0.3, speed=0.1, arm='R', aim='heart', upAt=-1),
       A('compote', 'happy_idle', 1.25, -2.75, face='world', yaw=0, at=0.5, speed=0.2, hold='bouquet', holdScale=1.6, arm='both', aim=[0.1, 0.05, 0.6], swing='sip', upAt=-1)]
v = lens_for(s11, 15, 4.0, 44, 48, hs=(0.95, 1.1, 1.25), fov=48, spread=25, dr=(0.9, 1.35), door=True)
add(44, 48, s11, "'heart': his paw on his heart, heartbroken; behind him Compote munches his bouquet in the doorway", v, zone='dusk', pets='idle', door=1, cab=False)
# S12 (b48-56; 'easy' b54.6): low dolly: undeterred, he dances alone under the lamp in front of the shop; the blind down, lit
s12 = [A('saxo', 'gangnam', -0.2, -1.3, at=1.1)]
v = view((-1.95, 0.25, 1.95), (-0.45, 0.85, -1.95), 60, p1=(-1.75, 0.23, 1.55), roll=[-10, -6], hand=0.3)
add(48, 56, s12, "'easy': low dolly: undeterred, he dances alone in front of the bookshop at dusk, the blind down and lit, her silhouette reading on it", v,
    zone='dusk', pets='idle', blind=1, shadow=True, cab=False)
# S13 (b56-64; the Short's first frame at b58.7; 'fall' b61.2, 'love' b62.6): frontal: he dances in front of her lit blind
# (her silhouette reading on it), then falls flat on his back, lovesick
s13a = [A('saxo', 'charleston', -0.2, -1.4, face='world', yaw=-22, at=0.7)]
v = view((-1.8, 0.95, 2.3), (-0.55, 0.98, -2.2), 56, p1=(-1.76, 0.95, 2.18))
add(56, 60, s13a, "the Short's first frame: frontal: he dances on in front of her lit blind, her silhouette reading on it", v,
    zone='dusk', pets='idle', blind=1, shadow=True, cab=False)
s13 = [A('saxo', 'knocked_out_falling_to_back', -0.2, -1.4, face='world', yaw=-22, at=1.0, speed=1.0, ground='mesh')]
v = view((-1.76, 0.95, 2.18), (-0.55, 0.9, -2.2), 56, p1=(-1.72, 0.93, 2.05))
add(60, 64, s13, "'fall': in front of her lit blind (her silhouette reading on it) he swoons and falls flat on his back, lovesick", v,
    zone='dusk', pets='idle', blind=1, shadow=True, cab=False)
# S14 (b64-72; 'love' tail): from above: he lies on the pavement, hearts popping over him; night falls
s14 = [A('saxo', 'knocked_out_falling_to_back', -0.2, -1.4, face='world', yaw=-22, at=3.4, speed=0.0, ground='mesh', lying=True)]
v = view((-0.4, 1.9, 0.75), (-0.65, 0.45, -2.1), 52, p1=(-0.42, 1.8, 0.55), ease='lin')
add(64, 72, s14, "from his feet: lovesick on his back on the pavement, hearts popping over him, as night falls; above him her silhouette reads on", v,
    zone='night', pets='idle', blind=1, shadow=True, hearts=[hearts_over(-0.5, -1.55, 0.95, 0.2, 1)], cab=False)

# =====================================================================================================================
# BEAT 3, the bridge (b72-128): night: the whole street dances under her window; the blind goes up; she comes out
MOB = [0.0, 3.0, 6, 4, 1.15, 1.1, 180]          # 24 pets in the road in four rows, facing the shop
# S15 (b72-80; 'yeah' b72.2): high behind the crowd: the street's pets gather in rows under her window; Saxo in front
s15 = [A('saxo', 'happy_idle', -0.4, 1.0, face='world', yaw=180, at=0.3, speed=0.3, arm='R', aim='up', upAt=0.3)]
v = view((0.4, 4.6, 10.2), (-0.3, 0.9, -1.2), 54, p1=(0.4, 4.4, 9.6))
add(72, 80, s15, "'yeah': night: high behind them: the street's pets gather in rows in the road under her window, Saxo in front raising a paw", v,
    zone='night', pets='stare', mob=MOB, stare=[-0.9, -3.0], blind=1, shadow=True)
# S16 (b80-88): side on: Compote drags in his last gift, a giant box with a red bow, furious
s16 = [A('compote', 'happy_walk', -2.5, 0.75, face='world', yaw=90, at=0.2, speed=0.8, mx=1.8, arm='both', aim=[0.25, -0.35, -0.85], upAt=-1)]
v = view((-1.65, 1.05, 5.4), (-1.6, 0.7, 0.6), 56, p1=(-1.55, 1.05, 5.25))
add(80, 88, s16, "side on: Compote drags in his last gift, a giant box with a red bow, furious", v,
    zone='night', pets='stare', mob=MOB, stare=[-0.9, -3.0], blind=1, gift={'x': -3.4, 'z': 0.6, 'to': [-1.6, 0.6], 'at': 0.2, 'dur': 3.1})
# S17 (b88-96): Sadi in the crowd's front row, hearts over her: she's still in love with him
s17 = [A('sadi', 'happy_idle', 1.6, 2.4, face='world', yaw=200, at=0.3, speed=0.2, arm='R', aim='heart', upAt=-1)]
v = view((2.4, 1.02, -0.55), (1.6, 0.9, 2.4), 44, p1=(2.37, 1.02, -0.4))
add(88, 96, s17, "Sadi in the crowd's front row, her paw on her heart, hearts over her: she's still in love with him", v,
    zone='night', pets='stare', mob=MOB, stare=[-0.9, -3.0], blind=1, hearts=[hearts_over(1.6, 2.4, 1.35, 0.2, 1)], heartYaw=200, gift={'x': -1.6, 'z': 0.6})
# S18 (b96-104; 'easy' b98.6): the flash mob, move 1: low along the front row: everyone dancing in sync, Saxo leading
s18 = [A('saxo', 'charleston', -0.25, 1.05, face='world', yaw=180, at=0.6),
       A('sadi', 'charleston', 0.8, 1.95, face='world', yaw=180, at=0.6), A('compote', 'charleston', -1.25, 1.95, face='world', yaw=180, at=0.6)]
v = lens_for(s18, 195, 4.0, 96, 104, hs=(0.35, 0.5, 0.7), fov=66, spread=30, dr=(0.8, 1.16), facing=True, maxoff=70, cab=False, roll=[8, 5], hand=0.3)
add(96, 104, s18, "'easy': the flash mob, move one: low along the front row from the shop's side: the whole street dancing in sync, Saxo leading", v,
    zone='night', pets='dance', mob=MOB, blind=1, gift={'x': -1.6, 'z': 0.6}, petals=True, petalsAt=[0, 2])
# S19 (b104-112; 'easy' b106.6): move two: the blind goes up: Kob's face in the window, looking out at last
s19 = [A('kob', 'happy_idle', *KOB_WIN, face='world', yaw=0, at=0.3, speed=0.1)]
v = deadpan(KOB_WIN, 0.92, 3.4, cam_y=1.02, push=0.15, fov=38, ang=0)
add(104, 112, s19, "'easy': move two: the blind goes up, and Kob looks out at last, deadpan, the dancing street reflected", v,
    zone='night', pets='dance', mob=MOB, blind=[S(105.6, 104), S(106.8, 104), 1, 0], gift={'x': -1.6, 'z': 0.6})
# S20 (b112-120; 'easy' b114.6): move three: the crane, high over the street: the whole crowd in sync, the box with its bow
s20 = [A('saxo', 'gangnam', -0.3, 1.0, face='world', yaw=180, at=1.1),
       A('sadi', 'gangnam', 0.8, 1.95, face='world', yaw=180, at=1.1), A('compote', 'gangnam', -1.25, 1.95, face='world', yaw=180, at=1.1)]
v = view((1.2, 5.6, 9.8), (-0.2, 0.5, 0.6), 56, p1=(1.0, 6.4, 10.4))
add(112, 120, s20, "'easy': move three: the crane over the street: the whole crowd in sync under her window, the giant box with its bow in front of the shop", v,
    zone='night', pets='dance', mob=MOB, blind=0, gift={'x': -1.6, 'z': 0.6}, petals=True, petalsAt=[0, 2.5])
# S21 (b120-128; 'yeah' b119.6): the door opens and Kob steps out onto the pavement; the crowd freezes; he shows her the box
s21 = [A('kob', 'happy_walk', 1.25, -2.85, face='world', yaw=0, at=0.4, speed=0.75, mz=1.0, moveAt=0.5),
       A('saxo', 'happy_idle', -0.4, 0.25, face='world', yaw=40, at=0.3, speed=0.2, arm='L', aim=[0.65, 0.05, 0.4], upAt=-1)]
v = lens_for(s21, 10, 4.6, 120, 128, hs=(1.2, 1.4), fov=50, spread=25, dr=(0.85, 1.25), door=True, facing=False, cab=False)
add(120, 128, s21, "'yeah': the door opens and Kob steps out at last; the crowd freezes; he shows her the box", v,
    zone='night', pets='stare', mob=MOB, stare=[1.25, -2.0], blind=0, door=[0.0, 0.7, 0.0, 1.0], gift={'x': -1.6, 'z': 0.6})

# =====================================================================================================================
# BEAT 4, chorus 3 (b128-192): the box
BOX = (-1.6, 0.6); PAL = (-0.5, 0.72)
s22 = [A('kob', 'happy_idle', -0.55, -0.3, face='world', yaw=-70, at=0.3, speed=0.1),
       A('saxo', 'happy_idle', -2.55, 1.15, face='world', yaw=40, at=0.3, speed=0.3, arm='both', aim='rave', upAt=-1)]
# S22 (b128-132; 'easy' b128.1): the lid flies off: a pink velvet cat palace with a gold crown rises out of the box; the
# crowd cheers; she looks at it, deadpan
v = lens_for(s22, 0, 5.4, 128, 132, hs=(1.4, 1.7, 2.0), fov=52, look=(-1.55, 0.75, 0.45), spread=30, dr=(0.85, 1.3), facing=False, cab=False)
add(128, 132, s22, "'easy': the lid flies off: a pink velvet cat palace with a gold crown rises out of the box; the crowd cheers; she looks at it, deadpan", v,
    zone='night', pets='cheer', mob=MOB, gift={'x': BOX[0], 'z': BOX[1], 'lid': [0.05, 0.5, 0, 1]}, palace={'x': BOX[0], 'z': BOX[1], 'y': 0.03, 'to': [BOX[0], BOX[1], 0.6], 'at': 0.25, 'dur': 1.1})
# S23 (b132-136; 'fall' b132.4): the palace set down beside the box: she walks past it and drops into the empty box
s23 = [A('kob', 'situps', BOX[0] + 0.05, BOX[1] - 0.15, face='world', yaw=0, at=1.0, speed=0, noLie=True, lift=0.42, my=-0.4, myAt=0.05, myDur=0.28, air=True, sit=True)]
v = view((-0.3, 1.25, 3.6), (-1.5, 0.55, 0.5), 50, p1=(-0.35, 1.22, 3.45))
add(132, 136, s23, "'fall': she walks right past the palace and drops into the empty box", v,
    zone='night', pets='stare', mob=MOB, stare=list(BOX), gift={'x': BOX[0], 'z': BOX[1], 'lid': 1}, palace={'x': PAL[0], 'z': PAL[1], 'yaw': -20})
# S24 (b136-140; 'love' b136.4): the payoff: the cat sitting in the plain cardboard box, hearts popping over her: in love
s24 = [A('kob', 'situps', BOX[0] + 0.05, BOX[1] - 0.15, face='world', yaw=0, at=1.0, speed=0, noLie=True, lift=0.02, sit=True)]
v = view((-1.45, 1.0, 3.0), (-1.55, 0.62, 0.45), 46, p1=(-1.45, 0.98, 2.85))
add(136, 140, s24, "'love': the payoff: the cat in the plain cardboard box, hearts popping over her: she's in love (with the box)", v,
    zone='night', pets='stare', mob=MOB, stare=list(BOX), gift={'x': BOX[0], 'z': BOX[1], 'lid': 1}, palace={'x': PAL[0], 'z': PAL[1], 'yaw': -20},
    hearts=[hearts_over(BOX[0] + 0.05, BOX[1] - 0.15, 1.05, 0.15, 1)])
# S25 (b140-144; 'come' b140.1, 'give' b141.2): he points her to the palace (the gift!); she doesn't open her eyes
s25 = [A('saxo', 'happy_idle', -0.35, 1.1, face='world', yaw=-60, at=0.3, speed=0.2, arm='R', aim=[0.75, 0.25, 0.55], upAt=-1),
       A('kob', 'situps', BOX[0] + 0.05, BOX[1] - 0.15, face='world', yaw=0, at=1.0, speed=0, noLie=True, lift=0.02, sit=True)]
v = lens_for(s25, 15, 4.4, 140, 144, hs=(1.05, 1.25, 1.45), fov=50, spread=30, dr=(0.85, 1.3), facing=False, cab=False)
add(140, 144, s25, "'come', 'give': he points her to the palace, the gift; she sits on in her box, eyes half shut, hearts", v,
    zone='night', pets='stare', mob=MOB, stare=list(BOX), gift={'x': BOX[0], 'z': BOX[1], 'lid': 1}, palace={'x': PAL[0], 'z': PAL[1], 'yaw': -20},
    hearts=[hearts_over(BOX[0] + 0.05, BOX[1] - 0.15, 1.05, 0.0, 1)])
# S26 (b144-148; 'call' b144.6): the crowd's gasp, from behind the box: every pet with its paws at its face, Compote glaring
s26 = [A('compote', 'quickly_pointing_angrily_forward', -1.3, 2.25, face='world', yaw=180, at=0.3, speed=0.6),
       A('sadi', 'happy_idle', 0.95, 2.25, face='world', yaw=180, at=0.3, speed=0.2, arm='R', aim='heart', upAt=-1)]
v = view((-0.9, 2.5, -2.55), (-0.2, 0.85, 2.4), 58, p1=(-0.9, 2.46, -2.65))
add(144, 148, s26, "'call': the crowd gasps, paws at their faces; Compote points at the box, furious; Sadi still only has eyes for him", v,
    zone='night', pets='gasp', mob=MOB, gift={'x': BOX[0], 'z': BOX[1], 'lid': 1}, palace={'x': PAL[0], 'z': PAL[1], 'yaw': -20}, cab=False)
# S27 (b148-152; 'fall' b149.4): side on: he sniffs the palace, then flops into it
s27 = [A('saxo', 'situps', PAL[0] + 0.05, PAL[1] + 0.05, face='world', yaw=-20, at=1.0, speed=0, noLie=True, lift=0.45, my=-0.31, myAt=0.25, myDur=0.28, air=True, sit=True)]
v = view((2.0, 1.05, 2.4), (-0.2, 0.6, 0.6), 50, p1=(1.9, 1.03, 2.3))
add(148, 152, s27, "'fall': he sniffs the cat palace, then flops into it", v,
    zone='night', pets='stare', mob=MOB, stare=list(PAL), gift={'x': BOX[0], 'z': BOX[1], 'lid': 1}, palace={'x': PAL[0], 'z': PAL[1], 'yaw': -20})
# S28 (b152-160): the second payoff: the dog in the cat palace, the cat in the box, side by side, hearts over both
TWO = [A('saxo', 'situps', PAL[0] + 0.05, PAL[1] + 0.05, face='world', yaw=-20, at=1.0, speed=0, noLie=True, lift=0.14, sit=True),
       A('kob', 'situps', BOX[0] + 0.05, BOX[1] - 0.15, face='world', yaw=0, at=1.0, speed=0, noLie=True, lift=0.02, sit=True)]
v = view((-0.96, 0.8, 3.75), (-0.98, 0.62, 0.55), 52, p1=(-0.96, 0.79, 3.62))
add(152, 160, TWO, "the second payoff: the dog in the cat palace, the cat in the box, side by side, hearts over both", v,
    zone='night', pets='stare', mob=MOB, gift={'x': BOX[0], 'z': BOX[1], 'lid': 1}, palace={'x': PAL[0], 'z': PAL[1], 'yaw': -20},
    hearts=[hearts_over(BOX[0] + 0.05, BOX[1] - 0.15, 1.05, 0.0, 1), hearts_over(PAL[0] + 0.05, PAL[1] + 0.05, 1.12, 0.4, 1)])
# S29 (b160-168; 'night' b162.1, 'life' b167.1): the crowd dances in a ring round them, petals falling; a slow orbit
RING = [-1.05, 0.6, 3.3, 75, 285]
v = view((-0.9 + 3.9 * math.sin(math.radians(20)), 1.6, 0.6 + 3.9 * math.cos(math.radians(20))), (-0.9, 0.62, 0.55), 54,
         p1=(-0.9 + 3.9 * math.sin(math.radians(-15)), 1.6, 0.6 + 3.9 * math.cos(math.radians(-15))), ease='lin', hand=0.6)
add(160, 168, [dict(a) for a in TWO], "'night', 'life': the street dances in a ring round the two of them, petals falling; a slow orbit", v,
    zone='night', pets='dance', gather=RING, gift={'x': BOX[0], 'z': BOX[1], 'lid': 1}, palace={'x': PAL[0], 'z': PAL[1], 'yaw': -20}, petals=True, petalsAt=[-0.9, 0.6],
    hearts=[hearts_over(BOX[0] + 0.05, BOX[1] - 0.15, 1.05, 0.0, 1), hearts_over(PAL[0] + 0.05, PAL[1] + 0.05, 1.12, 0.4, 1)])
# S30 (b168-176; 'heart' b171.0): the girls: Sadi's paw on her heart, Compote finishing his bouquet's last stem
s30 = [A('sadi', 'happy_idle', 1.0, 2.6, face='world', yaw=200, at=0.3, speed=0.2, arm='R', aim='heart', upAt=-1),
       A('compote', 'happy_idle', 2.0, 2.4, face='world', yaw=200, at=0.5, speed=0.2, hold='bouquet', holdScale=1.2, arm='both', aim=[0.1, 0.05, 0.6], swing='sip', upAt=-1)]
v = lens_for(s30, 200, 3.2, 168, 176, hs=(1.0, 1.15), fov=46, spread=20, dr=(0.9, 1.3), facing=False, cab=False)
add(168, 176, s30, "'heart': Sadi's paw on her heart for him; beside her Compote finishes his bouquet", v,
    zone='night', pets='dance', gather=RING, hearts=[hearts_over(1.0, 2.6, 1.35, 0.1, 1)], heartYaw=200)
# S31 (b176-184; 'easy' b178.6): low and close: he dances sitting in the palace, paws up; she purrs in her box
TWO_D = [dict(TWO[0], clip='situps', aim='rave', arm='both', upAt=-1), dict(TWO[1])]
v = lens_for(TWO_D, 0, 3.0, 176, 184, hs=(0.45, 0.6, 0.75), fov=56, spread=20, dr=(0.9, 1.4), facing=False, cab=False, roll=[6, 3], hand=0.3)
add(176, 184, TWO_D, "'easy': low and close: he dances sitting in the cat palace, paws up; she sits on in her box", v,
    zone='night', pets='dance', gather=RING, gift={'x': BOX[0], 'z': BOX[1], 'lid': 1}, palace={'x': PAL[0], 'z': PAL[1], 'yaw': -20},
    hearts=[hearts_over(BOX[0] + 0.05, BOX[1] - 0.15, 1.05, 0.0, 1)])
# S32 (b184-192; 'fall' b185.6, 'love' b186.6): the clip's ending: the camera rises over the street, the crowd dancing in a
# ring round the cat in her box and the dog in his palace, the string lights, as the song fades
v = view((-1.0, 1.35, 3.9), (-1.05, 0.55, 0.5), 56, p1=(-0.8, 8.5, 7.8), ly1=0.2, ease='in')
add(184, 192, [dict(a) for a in TWO], "'fall', 'love': the clip's ending: the camera rises over the night street, the crowd dancing round the cat in her box and the dog in his palace", v,
    zone='night', pets='dance', gather=RING, gift={'x': BOX[0], 'z': BOX[1], 'lid': 1}, palace={'x': PAL[0], 'z': PAL[1], 'yaw': -20}, petals=True, petalsAt=[-0.9, 0.6],
    hearts=[hearts_over(BOX[0] + 0.05, BOX[1] - 0.15, 1.05, 0.0, 1), hearts_over(PAL[0] + 0.05, PAL[1] + 0.05, 1.12, 0.4, 1)])

for s in shots: clean(s['actors'])
shots.sort(key=lambda x: x['beat'])
ep = {
    'date': '2026-10-08', 'song': {'title': 'So Easy (To Fall In Love)', 'artist': 'Olivia Dean'},
    'logline': "Saxo, in the singer's floral dress and curls, is the dog all of London falls for (Sadi the florist literally falls flat for him), but the bookshop cat he courts never looks up from her book: the rose, the begging (she pulls the blind down), the biggest bouquet in London (Compote eats it), a whole street dancing under her window at night; she finally comes out for his last gift, walks right past the pink velvet cat palace in it and falls in love with the empty box, and the dog flops into the palace and falls in love with that",
    'new': "src/maps35.js: london (a London street: white stucco townhouses with black balconies, the BOOKS shop with Kob's window, a roller blind (`blind`) and a door (`door`), a flower stall, a black cab with its TAXI light, Victorian lamps, a red pillar box and phone box, a garden square across the road; day, dusk and night (`zone`: string lights over the street, wet puddles, lit windows); London pets in bowler hats and flat caps who swoon with hearts (`pets: 'swoon'`), dance a synced flash mob in rows (`mob`, `pets: 'dance'`) or a ring (`gather`), gasp and cheer; the giant cardboard box with a red bow whose lid flies off (`gift`), the pink velvet cat palace with a gold crown (`palace`), looping hearts over points (`hearts` [x, y, z, s0, loop]), falling petals); two looks: saxo floral (the singer's white dress with big black flowers, a long curly wig, gold hoops), sadi florist (a green apron, a rose behind her ear); src/ps1.js `ARM_FIX`: a costume whose bare arms Tripo drew higher than the skeleton's gets them moved onto it and skinned by texel (fur to the arm, the wig and hoops to the head), which ended the floral dress's arm fins",
    'notes': "The world, from the official video (looked at as contact sheets every 4 s; nothing violent in it): a London city musical: an open-plan office, a staircase, a black cab, a flower stall, a perfume counter, a bookshop, white stucco townhouses at night under lamp posts, a crowd dancing in the street at the end with the camera rising over it; the singer in a white midi dress with big black flowers and long dark curls. The words, from whitelisted keywords per line (keywords.py: sorted, never the lines): easy, fall, love, come, give, call, night, life, heart, yeah. Kob wears her own mint tweed (the bookshop cat), Compote her own hoodie (the bookshop's bouncer), Sadi the florist's apron. The lipsync-animal reference: Saxo's locked-off diva close-up at dusk (S09). Sadi's literal fall is the song's 'fall'; the cat's drop into the box and the dog's flop into the palace are its last two.",
    'with': ['sadi', 'kob', 'compote'],
    'clips': ['happy_idle', 'happy_walk', 'knocked_out_falling_to_back', 'falling_to_knees_in_prayer', 'situps', 'quickly_pointing_angrily_forward'],
    'tags': {'structure': 'courtship', 'scenes': ['everyone swoons', 'the florist falls for him', 'the rose at the window', 'the blind down in his face', 'the bouncer eats the bouquet', 'the diva close-up', 'lovesick on the pavement', 'the flash mob under her window', 'the blind goes up', 'the gift box', 'the cat palace', 'the cat in the box', 'the dog in the cat bed'],
             'cast': ['saxo', 'sadi', 'kob', 'compote'], 'hook': 'dance', 'maps': ['london'], 'ref': 'lipsync-animal',
             'lyric_literal': "'fall' (Sadi falls flat for him; he falls lovesick; the cat drops into the box; the dog flops into the palace), 'love' (hearts over each one who falls), 'give' (the rose held up to her window; the palace pointed at), 'call' (her deadpan through the glass), 'heart' (his paw on it, heartbroken; Sadi's for him), 'night' (dusk, then night falls), 'easy' (the flash mob's three moves on the bridge's three)",
             'experiment': "The biggest TikTok sound we've had (5.15M videos, a soul-pop hit, not K-pop) with a cat-owner universal as the payoff (the cat ignores the gift and loves its box): does the sound size alone carry the Short past the 1.8x of our K-pop episodes at 24 h?"},
    'shots': shots,
}
json.dump(ep, open(os.path.join(HERE, '2026-10-08.json'), 'w'), indent=1, ensure_ascii=False)
print(len(shots), 'shots;', len(WARN), 'warnings')
for w in WARN: print('  ', w)
