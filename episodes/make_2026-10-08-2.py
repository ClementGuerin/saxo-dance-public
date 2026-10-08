# make_2026-10-08-2.py: writes episodes/2026-10-08-2.json, "Poker Face" (Lady Gaga, 2008; the queue being empty: the
# biggest official TikTok sound of the eight chart candidates checked, 1.15M videos on its 60 s sound, with Lady Gaga's
# catalogue climbing Spotify's global chart).
# The world (the official video, looked at as contact sheets every 3 s; nothing violent in it): a white modernist villa
# by a pool at night, two harlequin Great Danes lying either side of the pool, the singer rising out of the water in a
# mirrored visor, a platinum bob with blunt bangs and a lightning bolt on her cheek, a teal latex one-piece, a poker
# table with red chips and cards under a red-orange canopy, a party on white sofas. The title: a face that gives
# nothing away.
# Ours, "the dog with no poker face" (TELL, a new structure: the one who can't hide what he feels gives every hand away,
# the one who shows nothing takes every pot; the payoff: he finally hides it, and the bluff beats the unbeatable one;
# the button: his own joy undoes the win): Saxo, in the singer's platinum bob and teal catsuit, rises out of his pool
# between the two Great Danes and hosts poker night at his villa. Kob deals in a green visor, Sadi plays in red sequins,
# Compote in her cowboy hat. A dog can't keep a poker face: aces, and his tongue flops out and he bounces in his chair,
# so everyone folds and he wins two biscuits (he eats them); junk, and he sobs into his paws, so everyone piles in
# (and Kob's kings take the girls' stacks too). The cat never moves a whisker. Down to his last stack he lets the
# "deal with it" sunglasses drop onto his face on the chorus, goes all in with a seven and a two, and for once the
# cat can't read him: she folds her aces. He wins the mountain of biscuits, can't hold it in, flips the 7-2 at her,
# jumps on the table and dances, and his own victory kick sends the whole pot flying into the pool. He dives in
# after it (and the video loops to him rising out of the pool).
# Beats: 118.9986 BPM, kit beat b at b * 0.504208 s (kit beat 0 = song beat 28, bar 7's downbeat).
# Sections (kit beats): the intro chant b0-20 (K00 b2, K01 b10, K02 b18; the drums drop at b4); verse 1 b20-52 (K03
# b20, K04 b27.8, K05 b35.7, K06 b43.6); the pre-chorus b52-84 (K07 b52.3, K08 b60.5, K09 b68.3, K10 b76.5); the
# chorus b84-116 (K11 b84.3, K12 b88.5, K13 b100.3, K14 b104.5); the post-chorus b116-132 (K15 b117, K16 b124.6); the
# music stops at b132 (66.555 s), its last downbeat fading to 66.86 s.
# Key words (whitelisted single words with their kit beats, never the lines): mum/mah b2-4, b10-12, b18-19.7 | hold
# b22.0, Texas b25.3, please b26.9 | fold b27.8, hit b30.0, raise b31.0, stay b32.9 | intuition b37.3, play b39.4,
# cards b40.2, spades b41.0, start b42.3 | hooked b46.2, play b47.3, heart b50.5 | oh b52.3, ooh b57.9 | show b63.6 | oh
# b68.3, ooh b73.9 | show b79.6 | read b85.3, b87.2 | read b90.4, poker b92.0, face b93.4, nobody b98.7 | read b101.3,
# b103.2 | read b106.4, poker b108.0, face b109.4, nobody b114.7 | face b118.9, b121.7 | face b127.0, b129.6.
# The lyrics stay in episodes/2026-10-08-2.lyrics.js (the generator reads only their times).
import json, math, os, re, sys
sys.path.insert(0, os.path.dirname(__file__))
from cam import view, vpath, swoop, deadpan, topdown

HERE = os.path.dirname(__file__)
PER, B0 = 60 / 118.9986, 0.0
def T(b): return B0 + b * PER
def Bt(t): return (t - B0) / PER
def S(b, b0): return round((b - b0) * PER, 3)    # seconds from shot beat b0 to beat b

LOOK = {'saxo': 'platinum', 'sadi': 'glam', 'kob': 'bartender', 'compote': 'cowgirl'}
HEAD = {'saxo': 1.42, 'sadi': 1.36, 'kob': 1.42, 'compote': 1.5}        # the top of each head standing (the bob, the ears, the hat)
FACE = {'saxo': 0.9, 'sadi': 0.84, 'kob': 0.86, 'compote': 0.86}
RAD = {'saxo': 0.5, 'sadi': 0.43, 'kob': 0.42, 'compote': 0.42}           # the bob widens his head
SEATED = 0.04                                                             # sitting_talking's hips sit 4 cm under standing

# ---- the map (src/maps36.js, MANSION) ----
TX, TZ, TABLE_R, TABLE_Y, CHAIR_Y = 0.0, 3.0, 0.8, 0.56, 0.42
SEATS = {'saxo': (0.0, 1.82, 0), 'kob': (0.0, 4.18, 180), 'sadi': (-1.18, 3.0, 90), 'compote': (1.18, 3.0, -90)}
POOL = (-4.5, 4.5, -6.8, -2.6); WATER_Y = -0.1
DANES = [(-1.0, -1.5), (1.0, -1.5)]
POSTS = [(-2.15, 2.05), (2.15, 2.05), (-2.15, 3.95), (2.15, 3.95)]
STEP2 = (0.0, -3.23, -0.62)                                              # his spot on the pool's second step: waist-deep

def A(who, clip, x, z, **o):
    return {'who': who, 'look': o.pop('look', LOOK[who]), 'clip': clip, 'x': round(x, 3), 'z': round(z, 3), 'face': o.pop('face', 'camera'),
            'yaw': o.pop('yaw', 0), 'at': o.pop('at', 'auto'), **o}
def seated(who, **o):
    x, z, yw = SEATS[who]
    return A(who, o.pop('clip', 'sitting_talking'), x, z, face='world', yaw=yw, at=o.pop('at', 0.05), speed=o.pop('speed', 0.0), lift=CHAIR_Y, sit=True, **o)
KOB = dict(visor=True)
TELL = dict(clip='celebrating_after_a_win_while_seated', at=1.55, speed=0.25, tongue=True)               # aces: paws up, the tongue out
SOB = dict(clip='crying_and_rubbing_eyes', at=0.9, speed=0.35)                                             # junk: sobbing into his paws
PUSH = dict(arm='both', aim=[0.12, -0.3, 0.9], upAt=-1)                                                     # both paws on the felt, shoving
NERVOUS = dict(arm='both', aim=[0.2, 0.45, 0.42], upAt=-1)                                                  # paws at her mouth

# ---- a projection check (numbers only): where each face lands in the 9:16 frame at the shot's start and end ----
def _proj(cam, look, fov, pt):
    f = [look[i] - cam[i] for i in range(3)]; n = math.sqrt(sum(v * v for v in f)); f = [v / n for v in f]
    r = [-f[2], 0.0, f[0]]; rn = math.sqrt(r[0] ** 2 + r[2] ** 2) or 1; r = [r[0] / rn, 0.0, r[2] / rn]
    u = [r[1] * f[2] - r[2] * f[1], r[2] * f[0] - r[0] * f[2], r[0] * f[1] - r[1] * f[0]]
    d = [pt[i] - cam[i] for i in range(3)]; z = sum(a * b for a, b in zip(d, f))
    if z <= 0.05: return None
    tv = math.tan(math.radians(fov) / 2); th = tv * 9 / 16
    return (0.5 + sum(a * b for a, b in zip(d, r)) / z / th / 2, 0.5 - sum(a * b for a, b in zip(d, u)) / z / tv / 2)
_src = open(os.path.join(HERE, '2026-10-08-2.lyrics.js')).read()
_rows = json.loads(re.search(r'window\.LYRICS = (.*?);\n', _src).group(1)); _ends = json.loads(re.search(r'window\.LINE_END = (.*?);\n', _src).group(1))
LINES = [(Bt(row[0][0] - 0.35), Bt(e)) for row, e in zip(_rows, _ends)]
def has_line(b0, b1): return any(a < b1 and b > b0 for a, b in LINES)
WARN = []
def body(a, end):                                # (who, x, z, face y, head top y) at the shot's start (0) or end (1)
    who = a['who']; sc = a.get('scale', 1)
    x, z = a['x'] + a.get('mx', 0) * end, a['z'] + a.get('mz', 0) * end
    lift = a.get('lift', 0) + (a.get('my', 0) if end else 0) - (SEATED if a.get('sit') else 0)
    lean = math.radians(a.get('lean', 0)); yw = math.radians(a.get('yaw', 0)) if a.get('face') == 'world' else 0
    x += math.sin(yw) * math.sin(lean) * 0.75; z += math.cos(yw) * math.sin(lean) * 0.75
    return (who, x, z, FACE[who] * sc + lift - (1 - math.cos(lean)) * 0.6, HEAD[who] * sc + lift - (1 - math.cos(lean)) * 0.6)
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

# ---- the set: a lens must be on the deck, over the table or over the water, never inside the table, a chair, a Dane,
# an arch post or a seated head ----
def free(c, heads=()):
    x, y, z = c
    over_pool = POOL[0] < x < POOL[1] and POOL[2] < z < POOL[3]
    if y < (WATER_Y + 0.06 if over_pool else 0.06): return False
    if math.hypot(x - TX, z - TZ) < TABLE_R + 0.1 and y < TABLE_Y + 0.2: return False
    for n, (sx, sz, _) in SEATS.items():
        if math.hypot(x - sx, z - sz) < 0.42 and y < 1.05: return False
    for dx, dz in DANES:
        if abs(x - dx) < 0.45 and -2.65 < z < -0.5 and y < 1.45: return False
    for px_, pz in POSTS:
        if math.hypot(x - px_, z - pz) < 0.15: return False
    for (hx, hy, hz, r) in heads:
        if math.dist(c, (hx, hy, hz)) < r: return False
    return True
def blocked(cam, pt):
    """an arch post (0.05 m, 2.97 m tall) or the lamp's shade (y 1.89-2.15, r 0.42 over the table) on the line from the
    lens to a point"""
    ax, az, bx, bz = cam[0], cam[2], pt[0], pt[2]; dx, dz = bx - ax, bz - az; L2 = dx * dx + dz * dz or 1
    for px_, pz in POSTS:
        u = max(0.0, min(1.0, ((px_ - ax) * dx + (pz - az) * dz) / L2))
        if 0.02 < u < 0.98 and math.hypot(ax + u * dx - px_, az + u * dz - pz) < 0.14: return 'a post'
    for k in range(1, 40):
        u = k / 40; q = [cam[i] + (pt[i] - cam[i]) * u for i in range(3)]
        if abs(q[1] - 2.02) < 0.15 and math.hypot(q[0] - TX, q[2] - TZ) < 0.46: return 'the lamp'
    return None
def heads_of(actors):
    out = []
    for a in actors:
        who, x, z, fy, hy = body(a, 0); out.append((x, (fy + hy) / 2, z, RAD[who] + 0.12))
    return out

shots = []
def lens(v, k=0):
    c, f = v; a = math.radians(c['ang'][k]); fy = f[2] if len(f) > 2 else 0
    return (f[0] + math.sin(a) * c['r'][k], c['h'][k] + fy, f[1] + math.cos(a) * c['r'][k])
def add(beat, b1, actors, lyric, v, **o):
    c, focus = v
    o = {k: val for k, val in o.items() if val is not None}
    shots.append({'beat': beat, 'kind': 'dance', 'map': 'mansion', 'actors': actors, 'lyric': lyric, 'cam': c, 'focus': focus, **o})
    fy = focus[2] if len(focus) > 2 else 0
    hd = heads_of([a for a in actors if not a.get('fg')])
    for k, end in ((0, 0), (-1, 1)):
        cam, look = lens(v, k), (focus[0], c['look'][k] + fy, focus[1])
        check(beat, b1, cam, look, c['fov'], actors, end)
        for oc in _occl(cam, look, c['fov'], [body(a, end)[:4] for a in actors if not a.get('lying') and not a.get('fg') and not a.get('away')]):
            WARN.append(f'b{beat}: {oc}{" at the end" if end else ""}')
        if not free(cam, hd): WARN.append(f'b{beat}: lens inside the set or a head{" at the end" if end else ""} {tuple(round(q, 2) for q in cam)}')
        for a in actors:
            if a.get('fg') or a.get('away'): continue
            w_, x_, z_, fy_, _ = body(a, end); bl = blocked(cam, (x_, fy_, z_))
            if bl: WARN.append(f'b{beat}: {w_} behind {bl}{" at the end" if end else ""}')
def clean(actors):
    for a in actors:
        for k in ('sit', 'lying', 'away'): a.pop(k, None)
    return actors

# ================= a lens search (the London generator's): every face inside the frame and under the lyric rows at the
# shot's start and end, no face inside a nearer head's disc, the lens free of the set =================
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
            bl = blocked(cam, (x, fy, z))
            if bl: return _no(f'{w} behind {bl}')
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
def lens_for(actors, ang, dist, b0, b1, hs=(1.3,), fov=50, look=None, spread=40, dr=(0.8, 1.5), push=0.04, facing=True, maxoff=105, **o):
    vis = [a for a in actors if not a.get('fg') and not a.get('lying') and not a.get('away')]
    FACING.clear(); FACING.update({a['who']: a.get('yaw', 0) for a in vis if a.get('face') == 'world'} if facing else {})
    phases = [[body(a, 0) for a in vis if not a.get('reveal')], [body(a, 1) for a in vis]]
    occ = [body(a, 0)[:4] for a in actors if a.get('fg')]
    hd = heads_of(actors)
    allp = phases[0] + phases[1]
    cx = sum(s_[1] for s_ in allp) / len(allp); cz = sum(s_[2] for s_ in allp) / len(allp); ly = sum(s_[3] for s_ in allp) / len(allp) + 0.06
    L = look or (cx, ly, cz); best = None; WHY.clear(); nfree = 0; line = has_line(b0, b1)
    for da in range(-spread, spread + 1, 5):
        for k in range(13):
            d = dist * (dr[0] + (dr[1] - dr[0]) * k / 12)
            for h in hs:
                a = math.radians(ang + da); cam = (L[0] + math.sin(a) * d, h, L[2] + math.cos(a) * d)
                if not free(cam, hd): nfree += 1; continue
                f = _ok(cam, L, fov, phases, line, occ, maxoff)
                if f is None or f < 0: continue
                score = abs(da) / 40 + abs(d - dist) / dist + (0.25 - min(f, 0.25))
                if best is None or score < best[0]: best = (score, cam)
    if best is None:
        raise SystemExit(f'b{b0}: no lens for {[s_[0] for s_ in phases[0]]} round {ang} deg at {dist} m; rejections: {sorted(WHY.items(), key=lambda kv: -kv[1])[:6]}, not free: {nfree}')
    cam = best[1]; p1 = (cam[0] + (L[0] - cam[0]) * push, cam[1], cam[2] + (L[2] - cam[2]) * push)
    return view(tuple(round(c, 3) for c in cam), tuple(round(c, 3) for c in L), fov, p1=tuple(round(c, 3) for c in p1), **o)

# ---- the hands and the chips ----
H1 = {'saxo': ['As', 'Ah'], 'sadi': ['9c', '4d'], 'compote': ['Js', '3h'], 'kob': ['Qd', '8s']}
H2 = {'saxo': ['2c', '7d'], 'sadi': ['Tc', 'Th'], 'compote': ['Jd', 'Jc'], 'kob': ['Kh', 'Kd']}
H3 = {'saxo': ['7s', '2h'], 'kob': ['Ad', 'Ac']}
def cards(hand, **per):            # per: seat -> dict of extra states (up, peek, fold, foldUp, show)
    return {n: {'c': c, **per.get(n, {})} for n, c in hand.items()}
ST0 = {'saxo': 14, 'sadi': 12, 'kob': 14, 'compote': 12}                 # before the first deal
ST1 = {'saxo': 14, 'sadi': 11, 'kob': 14, 'compote': 11}                 # hand 1: the blinds in the pot
ST2 = {'saxo': 13, 'sadi': 11, 'kob': 14, 'compote': 11}                 # hand 2 dealt (his blind in)
ST3 = {'saxo': 13, 'kob': 38}                                             # after hand 2: the girls are out, the cat's tower
ST4 = {'saxo': 13, 'kob': 18}                                             # hand 3: she raised 20 into the middle
PALM_CLEAR = [[x, z, 0.8] for x, z in ((-7.6, -4.0), (7.4, -4.6), (-8.2, 3.6), (8.0, 4.4), (-6.0, -8.2), (6.6, -8.0))]   # a palm straight behind a head grows out of it
SET_CLEAR = PALM_CLEAR + [[-5.6, 0.6, 0.8]]                                                                    # and the statue
DANE_AT = lambda x, z: [round(x, 2), round(z, 2)]
def fyof(who, seated_=True): return FACE[who] + (CHAIR_Y - SEATED if seated_ else 0)
def close(who, b0, b1, actors=None, ang_off=0, dist=2.3, fov=52, dy=0.24, hs=None, spread=20, dr=(0.85, 1.3), **o):
    """a seated character frontal across the table, the lens through the empty seat opposite (that character unlisted):
    the look point dy above the face so the head stays under the lyric rows"""
    x, z, yw = SEATS[who]; fy = fyof(who)
    return lens_for(actors or [seated(who)], yw + ang_off, dist, b0, b1, hs=hs or (fy + 0.05, fy + 0.2, fy + 0.35, fy + 0.5), fov=fov, look=(x, fy + dy, z), spread=spread, dr=dr, facing=False, **o)
def group(actors, ang, dist, b0, b1, hs=(1.9, 2.2, 2.5, 2.8), fov=60, look=(0.0, 1.15, 3.0), spread=30, dr=(0.85, 1.45), **o):
    return lens_for(actors, ang, dist, b0, b1, hs=hs, fov=fov, look=look, spread=spread, dr=dr, facing=False, **o)

# =====================================================================================================================
# BEAT 1, the intro chant (b0-20): the host rises out of his pool between the Great Danes; poker night is set
# S01 the hook (b0-4; 'mum mum mum mah' b2-4): a swoop from over the left Dane's head down to the water: Saxo waist-deep
# on the pool's steps, dancing in the singer's platinum bob and teal catsuit, the second Dane beyond him, the villa lit
# he rises out of the water to the waist, swaying on the beat, his paws under the water: the rave and caramell swings both
# read as arms held out on the water (a T pose, review loop 2), so the hook is his rise and the swoop, low and frontal
s01 = [A('saxo', 'happy_idle', STEP2[0], STEP2[1], face='world', yaw=0, at=0.4, speed=0.3, lift=STEP2[2] - 0.22, my=0.22, myAt=0.0, myDur=1.1, sway=7, hop=[0.04, 1], noShadow=True, treat={'mouth': True})]
v = swoop([(0.22, 1.5, 0.35), (0.16, 1.15, -0.45), (0.08, 0.86, -1.2), (0.0, 0.74, -1.55)], (0.0, 0.58, -3.23), fov=58, roll=(0, -2, -6, -3), hand=0.15)
add(0, 4, s01, "the hook ('mum mum mum mah'), the ending it loops from: a swoop down to his glowing pool full of floating biscuits: Saxo in the singer's platinum bob and teal catsuit, a biscuit across his jaws, rises to the waist, swaying on the beat, the villa lit behind", v,
    floaters=[0.0, -3.9, 26], danes=False, key=[-0.75, 1.9, 0.45, 1.0, 0.95, 0.85])
# S02 (b4-8; the drums drop on b4, 'mah'): low and frontal on the deck: he dances up the steps out of the water between
# the two Danes, their heads turning to him
s02 = [A('saxo', 'charleston', STEP2[0], STEP2[1], face='world', yaw=0, at=0.55, lift=STEP2[2], my=0.62, myAt=0.0, myDur=1.25, mz=1.0)]
v = view((0.0, 0.48, 1.3), (0.0, 0.72, -2.6), 58, p1=(0.0, 0.46, 0.9), roll=[-4, -2], hand=0.25)
add(4, 8, s02, "the drums drop: low and frontal from the deck: he dances up the steps out of the glowing water, kicking", v,
    floaters=[0.0, -3.9, 26], danes=False)
# S03 (b8-12; 'mum mum mum mah' b10-12): the watcher: Kob at the poker table under the green lamp, in her dealer's visor,
# shuffling the deck on the beat, deadpan
s03 = [seated('kob', hold='deck', arm='both', aim='clap', upAt=-1, **KOB)]
v = close('kob', 8, 12, s03, ang_off=-12, dist=2.3, fov=46, push=0.05, ease='lin')
add(8, 12, s03, "the watcher: Kob the dealer at the poker table under the green lamp, her green visor on, shuffling the deck on the beat, deadpan", v,
    stacks=ST0, danes='watch')
# S04 (b12-16): the table from the pool side: Sadi in red sequins, her paw on her heart and hearts over her, Compote in her
# cowboy hat glaring, Kob shuffling, his empty chair in front
s04 = [seated('sadi', arm='R', aim='heart', upAt=-1), seated('compote'), seated('kob', hold='deck', arm='both', aim='clap', upAt=-1, **KOB)]
v = lens_for(s04, 180, 5.0, 12, 16, hs=(1.55, 1.75, 1.95), fov=62, look=(0.0, 1.15, 3.0), spread=20, dr=(0.85, 1.4), facing=False)
add(12, 16, s04, "the table from the pool side: Sadi in red sequins, her paw on her heart, hearts over her; Compote in her cowboy hat, glaring; Kob shuffling; his empty chair waiting", v,
    stacks=ST0, hearts=[[-1.18, 1.85, 3.0, 0.0, 1]], heartYaw=180, danes='watch')
# S05 (b16-20; the Short's first frame at b17.3; 'mum mum mum mah' b18-20): low on the deck: he dances in front of the
# table, the three of them seated behind him
s05 = [A('saxo', 'charleston', 0.6, 1.15, face='world', yaw=190, at=0.55), seated('kob', hold='deck', arm='both', aim='clap', upAt=-1, **KOB)]
v = lens_for(s05, 190, 3.6, 16, 20, hs=(0.95, 1.1, 1.25), fov=58, spread=35, dr=(0.8, 1.5), facing=False, roll=[6, 3], hand=0.3)
add(16, 20, s05, "the Short's first frame: low on the deck: he dances in front of the poker table, Kob the dealer seated behind him", v, stacks=ST0, danes='watch')

# =====================================================================================================================
# BEAT 2, verse 1 (b20-52): hand one: aces, and a dog can't hide it
ALL1 = lambda **o: [seated('saxo', **o.get('saxo', {})), seated('sadi', **o.get('sadi', {})), seated('kob', **{**KOB, **o.get('kob', {})}), seated('compote', **o.get('compote', {}))]
# S06 (b20-22): the deal: from high over the table, the painting's view: the four seated, the cards flying from Kob's paws
s06 = [seated('sadi', fg=True)]
v = view((0.0, 2.65, 3.06), (0.0, 0.56, 2.95), 52, p1=(0.08, 2.5, 3.05), roll=[0, 6])
add(20, 22, s06, "the deal: straight down on the felt: the cards flying out of the dealer's paws to each seat", v,
    deal=[0.03, 0.085], stacks=ST1, pot=2, noLamp=True, chairs={'saxo': False, 'kob': False}, danes=False)
# S07 (b22-24; 'hold' b22.0): his point of view: he peeks at his two cards: the ace of spades and the ace of hearts
v = view((0.0, 1.22, 1.85), (0.0, 0.56, 2.62), 46, p1=(0.0, 1.2, 1.9))
add(22, 24, [seated('kob', fg=True, **KOB)], "'hold': his point of view: he peeks at his two cards: the ace of spades and the ace of hearts", v,
    cards=cards(H1, saxo={'up': True}), stacks=ST1, pot=2)
# S08 (b24-26; 'Texas' b25.3): Compote in her cowboy hat (Texas hold'em), glaring over her cards
v = close('compote', 24, 26, ang_off=15, dist=2.2, fov=48, push=0.03, ease='lin')
add(24, 26, [seated('compote')], "'Texas': Compote in her cowboy hat, glaring over her cards", v, cards=cards(H1), stacks=ST1, pot=2, danes=False)
# S09 (b26-28; 'please' b26.9): his tell: across the table, frontal: his tongue flops out, paws up, bouncing in his chair
v = close('saxo', 26, 28, [seated('saxo', hop=[0.05, 1], **TELL)], ang_off=8, dist=2.4, fov=54)
add(26, 28, [seated('saxo', hop=[0.05, 1], **TELL)], "'please': his tell, frontal across the table: aces, and his tongue flops out, paws up, bouncing in his chair", v,
    cards=cards(H1), stacks=ST1, pot=2, danes=False)
# S10 (b28-30; 'fold' b27.8): Sadi takes one look at him and throws her cards in with the back of her paw
s10 = [seated('sadi', arm='R', aim=[0.35, 0.15, 0.55], upAt=-1, aim2=[0.25, -0.32, 0.9], aim2At=0.08)]
v = close('sadi', 28, 30, s10, ang_off=-25, dist=2.6, fov=52, dy=0.04, hs=(0.95, 1.05, 1.15))
add(28, 30, s10, "'fold': Sadi takes one look at his face and throws her cards in with the back of her paw", v,
    cards=cards(H1, sadi={'fold': 0.12}), stacks={**ST1, 'compote': 0}, pot=2, danes=False)
# S11 (b30-32; 'hit' b30.0): Compote slams her paw down on her cards at the rim: everything on the felt jumps and her
# cards fly into the middle. Loops 2-3: from her left the jumping cards crossed her muzzle, from the front her paw pointed
# at the lens, in profile it hung short of the felt (a chibi paw reaches the rim, no further): her cards lie under it
# (r 0.72) and a high three-quarter on her right looks down on the felt
s11 = [seated('compote', arm='R', aim=[0.2, 0.62, 0.5], upAt=-1, aim2=[0.15, -0.45, 0.75], aim2At=0.05)]
v = view((-0.05, 2.15, 1.55), (0.95, 1.55, 3.0), 62, p1=(-0.03, 2.14, 1.6))
add(30, 32, s11, "'hit': from above her right: Compote slams her paw down on her cards at the edge of the table: everything on the felt jumps and her cards fly into the middle", v,
    cards=cards(H1, compote={'r': 0.72, 'fold': 0.16}, sadi={'fold': -1}), stacks={'saxo': 14, 'kob': 14}, pot=2, bump=0.1, chairs={'saxo': False}, danes=False)
# S12 cut in review loop 2 (his raise read as a rerun of his tell, and a chibi's paws can't reach a stack 0.6 m out):
# everyone folds to his tell, and he wins only the two biscuits of the blinds
# S13 (b32-36; 'stay' b32.9): Kob doesn't move a whisker; then she slides her cards in under one claw (her cards lie
# under her paws, r 0.72, and slide flat: tossed, they flew up past her chin like cards held up)
s13 = [seated('kob', arm='R', aim=[0.15, -0.55, 0.8], upAt=1.05, lean=6, **KOB)]
v = close('kob', 32, 36, s13, ang_off=-40, dist=2.4, fov=54, dy=0.1, hs=(1.4, 1.5, 1.6), push=0.05, ease='lin')
add(32, 36, s13, "'stay': the cat doesn't move a whisker; then she slides her cards into the middle under one claw: fold", v,
    cards=cards(H1, sadi={'fold': -1}, compote={'fold': -1}, kob={'r': 0.72, 'fold': 1.25, 'slide': True}), stacks=ST1, pot=2, danes='watch')
# S14 (b36-40; 'intuition' b37.3, 'play' b39.4): everyone folded: the pot slides to him: the two biscuits of the
# blinds, from high on his side
s14 = [seated('saxo', fg=True, arm='both', aim=[0.1, -0.28, 0.75], upAt=-1, tongue=True)]
v = view((0.82, 1.45, 1.7), (0.0, 0.62, 2.55), 52, p1=(0.8, 1.42, 1.75))
add(36, 40, s14, "'play': over his paws: everyone folded, and the pot slides to him: the two biscuits of the blinds, all he wins", v,
    cards=cards(H1, sadi={'fold': -1}, compote={'fold': -1}, kob={'fold': -1, 'r': 0.72, 'slide': True}), stacks=ST1, pot=2, rake=['saxo', 0.3, 0.9], danes=False)
# S15 (b40-44; 'cards' b40.2, 'spades' b41.0): from high behind him: he flips his cards face up for everyone: the two
# aces; the three of them deadpan
s15 = [seated('kob', **KOB)]
v = view((0.0, 0.9, 1.6), (0.0, 1.24, 4.18), 58, p1=(0.0, 0.9, 1.68))
add(40, 44, s15, "'cards', 'spades': low behind his cards: he flips them face up, the two aces big in the foreground, the cat deadpan beyond", v,
    cards=cards(H1, saxo={'show': 0.12}, sadi={'fold': -1}, compote={'fold': -1}, kob={'fold': -1}), stacks={**ST1, 'saxo': 16}, chairs={'saxo': False}, danes=False)
# S16 (b44-48; 'hooked' b46.2): he eats his winnings, a biscuit across his jaws, paws up, bouncing in his chair (the
# tell's pose: sitting stiffly with the biscuit he read as disappointed by two biscuits, loop 3)
s16 = [seated('saxo', clip='celebrating_after_a_win_while_seated', at=1.55, speed=0.25, treat={'mouth': 0.15}, hop=[0.05, 1])]
v = close('saxo', 44, 48, s16, ang_off=-12, dist=2.4, fov=54)
add(44, 48, s16, "'hooked': he eats his winnings, a biscuit across his jaws, paws up, bouncing in his chair, delighted", v,
    cards=cards(H1, saxo={'up': True}, sadi={'fold': -1}, compote={'fold': -1}, kob={'fold': -1}), stacks={**ST1, 'saxo': 14}, danes=False)
# S17 (b48-52; 'heart' b50.5): Sadi's paw on her heart, hearts over her: she adores the worst poker player in the world
v = close('sadi', 48, 52, [seated('sadi', arm='R', aim='heart', upAt=-1)], ang_off=12, dist=2.3, fov=48)
add(48, 52, [seated('sadi', arm='R', aim='heart', upAt=-1)], "'heart': Sadi's paw on her heart, hearts over her: she adores the worst poker player in the world", v,
    stacks={**ST1, 'saxo': 14}, hearts=[[-1.18, 1.52, 3.0, 0.0, 1]], heartYaw=90, danes=False)

# =====================================================================================================================
# BEAT 3, the pre-chorus (b52-84): hand two: junk, and he can't hide that either; the cat takes everything
# S18 (b52-56; 'oh' b52.3): his point of view: the new hand: a two and a seven
v = view((0.0, 1.22, 1.85), (0.0, 0.56, 2.62), 46, p1=(0.0, 1.2, 1.9))
add(52, 56, [seated('kob', fg=True, **KOB)], "'oh': his point of view: the new hand: a two and a seven, the worst there is", v,
    cards=cards(H2, saxo={'up': True}), stacks=ST2, pot=3)
# S19 (b56-60; 'ooh' b57.9): his tell: he sobs into his paws
v = close('saxo', 56, 60, [seated('saxo', **SOB)], ang_off=6, dist=2.4, fov=54, hs=(0.95, 1.05, 1.15))
add(56, 60, [seated('saxo', **SOB)], "'ooh': his tell: he sobs into his paws", v, cards=cards(H2), stacks=ST2, pot=3, danes=False)
# S20 (b60-64; 'show' b63.6): from behind him: the three of them shove everything in at once; he throws his cards in.
# Review loop 2: straight down, a loose handful and one stack still at the edge read as nothing (and as the deal again):
# the three push from in front of the lens, their stacks land as towers in the middle, his cards fly in after them
s20 = [seated('saxo'), seated('kob', fg=True, **{**KOB, **PUSH})]
v = view((0.75, 2.15, 5.25), (0.0, 1.15, 2.3), 58, p1=(0.73, 2.13, 5.15))
add(60, 64, s20, "'show': from high behind the cat: everyone's biscuits slide into the middle at once, towers piling up in front of the miserable dog; he throws his cards in", v,
    cards=cards(H2, saxo={'fold': 1.0}), stacks=ST2, pot=3, push=[['sadi', 0.1, 0.4], ['compote', 0.18, 0.4], ['kob', 0.26, 0.4]], danes=False)
# S21 (b64-68): the showdown, low behind the cat's cards (the framing of S15 and S34, which passed): her two kings turn
# over big in the foreground, the girls' tens and jacks beside, the dog beyond with nothing (her paws reaching in from
# the near edge covered the kings); then she rakes the whole pot to her side (beside her cards: raked past them it hid the kings)
s21 = [seated('saxo')]
v = view((0.0, 1.15, 4.8), (0.0, 1.08, 1.82), 62, p1=(-0.08, 1.15, 4.8))
add(64, 68, s21, "the showdown, low behind the cat's cards: her two kings turn over big in the foreground, the girls' cards shown beside them, the dog beyond with nothing; then the whole pot slides to her side", v,
    cards=cards(H2, saxo={'fold': -1}, sadi={'show': 0.1}, compote={'show': 0.2}, kob={'show': 0.4}), stacks={'saxo': 13}, pot=40, rake=['kob', 1.0, 0.8, 0.42], chairs={'kob': False}, danes=False)
# S22 (b68-72; 'oh' b68.3): straight down on the table: the cat's tower of biscuits, his small stack, the girls' empty
# places
v = view((0.42, 1.02, 4.8), (0.0, 1.3, 1.82), 52, p1=(0.41, 1.02, 4.72))
add(68, 72, [seated('saxo')], "'oh': low over the felt from the cat's side: her tower of biscuits in the foreground, the dog behind it with his little stack", v,
    stacks=ST3, danes=False)
# S23 (b72-76; 'ooh' b73.9): he leans across the table to read her, his paws on its edge, closer and closer; from 30
# degrees off the cat's line at her eye height the lean shows (frontal it was a plain portrait, loop 3)
s23 = [seated('saxo', lean=14, arm='both', aim=[0.12, -0.35, 0.85], upAt=-1)]
v = close('saxo', 72, 76, s23, ang_off=30, dist=2.5, fov=54, hs=(1.15, 1.25, 1.35), dy=0.14, push=0.12, ease='lin')
add(72, 76, s23, "'ooh': from beside the cat's place: he leans right across the table to read her face, his paws on its edge, closer and closer", v, stacks=ST3, clear=PALM_CLEAR, danes=False)
# S24 (b76-80; 'show' b79.6): the cat's poker face: locked off, she sips her milk through a straw
s24 = [seated('kob', holdL='milkbottle', holdScale=1.3, arm='L', aim=[0.62, -0.2, 0.3], upAt=-1, **KOB)]
v = close('kob', 76, 80, s24, ang_off=-22, dist=2.4, fov=48, dy=0.12, hs=(1.05, 1.15, 1.25), push=0.05, ease='lin')
add(76, 80, s24, "'show': the cat's poker face: locked off, her milk bottle in her paw, not a whisker moving", v, stacks=ST3, danes='watch')
# S25 (b80-88; 'read' b85.3, b87.2): frontal on him over his last stack: the "deal with it" sunglasses drop onto his face
# on the chorus's first beat
v = close('saxo', 80, 88, [seated('saxo', shades=S(84, 80), arm='both', aim=[0.1, -0.25, 0.7], upAt=-1)], ang_off=-6, dist=2.4, fov=54, push=0.08, ease='lin')
add(80, 88, [seated('saxo', shades=S(84, 80), arm='both', aim=[0.1, -0.25, 0.7], upAt=-1)], "frontal on him over his stack: he stops sobbing, and the 'deal with it' sunglasses drop onto his face on the chorus's first beat", v,
    cards=cards(H3), stacks=ST3, danes=False)

# =====================================================================================================================
# BEAT 4, the chorus (b84-116): the last hand: now he has a poker face too
# S26 (b88-92; 'read' b90.4): over his shoulder, his bob and shades at the near edge: Kob raises, both paws on half her
# tower, pushing it into the middle. Review loop 2: the lens search had kept his head out of the frame (the same frame
# as her poker face), so the lens is placed by hand 0.64 m beside his head's centre at 1 m deep: its edge at x 0.85
s26 = [seated('saxo', fg=True, shades=True), seated('kob', arm='both', aim=[0.12, -0.3, 0.9], upAt=-1, **KOB)]
v = view((0.8, 1.75, 1.0), (0.0, 1.36, 4.18), 44, p1=(0.78, 1.75, 1.06))
add(88, 92, s26, "'read': over his shoulder, his ear at the edge of the frame: the cat raises, both paws on a heap of her biscuits, pushing it into the middle", v,
    cards=cards(H3), stacks=ST4, pot=20, potIn=['kob', 0.45, 1.3], danes='watch')
# S27 (b92-96; 'poker' b92.0, 'face' b93.4): his poker face in the shades, locked off; he shoves his whole stack in,
# slowly, deadpan: the stack starts under his paws (stackAt: 0.6 m out, a chibi paw never reached it, loops 1-3)
v = close('saxo', 92, 96, [seated('saxo', shades=True, **PUSH)], ang_off=40, dist=2.6, fov=56, dy=0.1, hs=(0.95, 1.05, 1.15), push=0.02, ease='lin')
add(92, 96, [seated('saxo', shades=True, **PUSH)], "'poker face': his poker face in the sunglasses, locked off: both paws on his stack, he shoves it all in, slowly, deadpan", v,
    cards=cards(H3), stacks=ST4, stackAt={'saxo': [0.7, -0.12]}, pot=20, push=[['saxo', 0.5, 1.0]], swing=4, clear=PALM_CLEAR, danes=False, still=True)
# S28 (b96-100; 'nobody' b98.7): his point of view: the seven and the two: nothing. He's bluffing
v = view((0.0, 1.22, 1.85), (0.0, 0.56, 2.62), 46, p1=(0.0, 1.21, 1.88))
add(96, 100, [seated('kob', fg=True, **KOB)], "'nobody': his point of view: a seven and a two: nothing. He's bluffing", v,
    cards=cards(H3, saxo={'up': True}), stacks={**ST4, 'saxo': 0}, pot=33)
# S29 (b100-104; 'read' b101.3, b103.2): over her shoulder, her ears and visor at the near edge: the cat leans in to read
# him; his shades give her nothing (review loop 2: she was out of the frame and a palm grew out of his bob)
s29 = [seated('kob', fg=True, lean=22, **KOB), seated('saxo', shades=True)]
v = view((-1.2, 1.45, 5.0), (0.0, 1.4, 1.82), 44, p1=(-1.18, 1.45, 4.94))
add(100, 104, s29, "'read': over her shoulder, her ears and green visor at the edge of the frame: the cat leans in across the table to read him; his sunglasses give her nothing", v,
    cards=cards(H3), stacks={**ST4, 'saxo': 0}, pot=33, clear=PALM_CLEAR, danes=False)
# S30 (b104-108; 'read' b106.4): Sadi swoons at the cool dog in his sunglasses, her paw on her heart, hearts over her (both
# paws on the heart crossed her arms: sulking); then Compote glaring
s30 = [seated('sadi', arm='R', aim='heart', upAt=-1)]
v = close('sadi', 104, 106, s30, ang_off=-14, dist=2.2, fov=46)
add(104, 106, s30, "'read': Sadi swoons at the dog in his sunglasses, her paw on her heart, hearts popping over her", v, cards=cards(H3), stacks={**ST4, 'saxo': 0}, pot=33,
    hearts=[[-1.18, 1.52, 3.0, 0.0, 1]], heartYaw=90, danes=False)
v = close('compote', 106, 108, ang_off=-10, dist=2.3, fov=48)
add(106, 108, [seated('compote')], "Compote, out of chips, glaring from one to the other", v, cards=cards(H3), stacks={**ST4, 'saxo': 0}, pot=33, danes=False)
# S31 (b108-112; 'poker' b108.0, 'face' b109.4): the standoff, cross-cut in true profile on a long lens, both lenses on
# the same side so they face each other across the cut: the cat facing right, the dog facing left (review loop 2: the
# three-quarter close-ups repeated her poker face and his read)
v = view((3.26, 1.35, 2.66), (0.0, 1.45, 4.05), 34, p1=(3.2, 1.35, 2.69))
add(108, 110, [seated('kob', **KOB)], "'poker': the standoff, cross-cut on a long lens: the cat in three-quarter, facing right, not a whisker moving", v,
    cards=cards(H3), stacks={**ST4, 'saxo': 0}, pot=33, swing=7, clear=SET_CLEAR, danes=False)
v = view((3.26, 1.35, 3.34), (0.0, 1.48, 1.95), 34, p1=(3.2, 1.35, 3.31))
add(110, 112, [seated('saxo', shades=True)], "'face': and the dog in three-quarter in his sunglasses, facing left, not a whisker moving either", v,
    cards=cards(H3), stacks={**ST4, 'saxo': 0}, pot=33, swing=7, clear=SET_CLEAR, danes=False)
# S32 (b112-116; 'nobody' b114.7): over her shoulder: the cat folds: she tosses her two aces face up into the middle,
# and the dog in his sunglasses gives nothing away (from high on her side without her, the aces lay there, loop 3)
s32 = [seated('kob', fg=True, arm='L', aim=[0.15, -0.4, 0.85], upAt=0.85, **KOB), seated('saxo', shades=True)]
v = view((-0.8, 1.35, 4.75), (0.0, 1.05, 1.9), 62, p1=(-0.78, 1.35, 4.7))
add(112, 116, s32, "'nobody': over her shoulder, her ear and visor at the edge: the cat folds: her two aces slide face up into the middle, and the dog in his sunglasses beyond gives nothing away", v,
    cards=cards(H3, kob={'show': 0.45, 'fold': 1.05, 'foldUp': True, 'slide': True}), stacks={**ST4, 'saxo': 0}, pot=33, clear=PALM_CLEAR, danes=False)

# =====================================================================================================================
# BEAT 5, the post-chorus (b116-132): he wins, he can't hold it in, and his joy sends it all into the pool
# S33 (b116-120; 'face' b118.9): frontal: the mountain of biscuits slides to him; the sunglasses fly off, his tongue
# flops out and he bounces in his chair (review loop 2: caught in flight the shades read as a wire frame round his head,
# so they're gone by the beat; his cards are flipped in the next shot)
s33 = [seated('saxo', shades={'off': 0.35}, hop=[0.06, 1], **{**TELL, 'at': 1.3, 'speed': 0.5})]
v = close('saxo', 116, 120, s33, ang_off=-18, dist=2.6, fov=56, dy=0.14, hs=(1.1, 1.2, 1.3))
add(116, 120, s33, "'face': frontal: the mountain of biscuits slides to him; the sunglasses fly off, his tongue flops out and he bounces in his chair", v,
    cards=cards(H3, kob={'fold': -1, 'foldUp': True}), stacks={'kob': 18}, pot=40, rake=['saxo', 0.05, 0.5], clear=PALM_CLEAR, danes=False)
# S34 (b120-124; 'face' b121.7): low behind his cards (S15's framing): he flips them for her: a seven and a two, big in
# the foreground; her two aces face up beyond them; nothing moves on her face (review loop 2: turned to her they read
# upside down from his side, and the left edge cut the seven)
s34 = [seated('kob', **KOB)]
v = view((0.0, 1.15, 1.2), (0.0, 1.08, 4.18), 62, p1=(0.08, 1.15, 1.2), ease='lin')
add(120, 124, s34, "'face': low behind his cards: he flips them for her: a seven and a two, big in the foreground, her two aces face up beyond them; nothing moves on her face", v,
    cards=cards(H3, saxo={'show': 0.2}, kob={'fold': -1, 'foldUp': True}), stacks={'kob': 18}, pot=0, chairs={'saxo': False}, danes=False)
# S35 (b124-128; 'face' b127.0): up on the table, from the pool side: he dances on the heap of biscuits, and his kick
# sends the whole pot flying at the lens and over it into the pool (side on, the kick and the flight didn't show)
s35 = [A('saxo', 'charleston', 0.0, 3.25, face='world', yaw=180, at=0.15, lift=TABLE_Y)]
v = view((0.55, 1.5, 0.6), (0.0, 1.45, 3.25), 56, p1=(0.53, 1.48, 0.7), roll=[-4, -2], hand=0.3)
add(124, 128, s35, "'face': up on the table, frontal from the pool side: he dances on the heap of biscuits, and his kick sends the whole pot flying at the lens and over it into the pool", v,
    cards=cards(H3, saxo={'up': True}, kob={'fold': -1, 'foldUp': True}), stacks={'kob': 18}, pot=40, kick=[S(126.6, 124), -1.3, -4.4], chairs={'saxo': False}, danes=DANE_AT(0.0, 3.0))
# S36 cut in review loop 2 (three stagings of the leap read as a crouch or a lunge on the deck): the kick cuts to the
# splash among the floating biscuits, and his head pops up
# S37 (b128-132.6): from the deck: a splash among the biscuits bobbing on the glowing water (he dived in after them); his
# head pops up among them, a biscuit across his jaws, delighted (the loop goes back to him rising out of the pool)
s37 = [A('saxo', 'happy_idle', 0.0, -3.7, face='world', yaw=0, at=0.4, speed=0.2, lift=-1.55, my=1.1, myAt=1.0, myDur=0.5, treat={'mouth': True}, air=True, noShadow=True, reveal=1.1)]
v = view((0.36, 0.75, -1.75), (0.0, 0.55, -3.7), 58, p1=(0.35, 0.73, -1.85))
add(128, 133, s37, "'face': a big splash among the floating biscuits where he dived in after them; then his head pops up among them, one across his jaws, delighted", v,
    floaters=[0.0, -3.9, 26], splash=[[0.0, -3.7, 0.0, 1.3], [0.0, -3.7, 1.05, 0.6]], hearts=[[0.0, 1.0, -3.7, 1.5, 1]], danes='watch')

for s in shots: clean(s['actors'])
shots.sort(key=lambda x: x['beat'])
ep = {
    'date': '2026-10-08', 'song': {'title': 'Poker Face', 'artist': 'Lady Gaga'},
    'logline': "A dog can't keep a poker face: at Saxo's poker night by his pool, every good hand sets his tongue flopping and every bad one makes him sob, so the cat who never moves a whisker takes every pot; down to his last stack he lets the 'deal with it' sunglasses drop onto his face, goes all in with a seven and a two, and the cat folds her aces; he can't hold the win in, and his own victory kick sends the whole pot into the pool, so he dives in after it",
    'new': "src/maps36.js: mansion (a white modernist villa's pool deck at night: the teal-glowing pool with steps down from the middle of its near side, two harlequin Great Danes lying on the deck either side of them, white loungers, palms, a statue; the poker table under a red-orange arch with the famous painting's green-shaded lamp, four chairs, cards on the felt dealt from the dealer's paws (`deal`), peeked, folded, shown face up (`cards`), biscuit chips in stacks (`stacks`), pushed all in (`push`), a pot raked or pushed in (`rake`, `potIn`) and kicked into the pool (`kick`), biscuits bobbing on the water (`floaters`), splashes; the lamp swings); src/ps1.js: `shades` (dark sunglasses, dropped onto the eyes like the 'deal with it' glasses, or flown off), `visor` (the dealer's green visor), the `deck` prop; one look: saxo platinum (the singer's platinum bob with blunt bangs, a lightning bolt, a teal latex catsuit)",
    'notes': "The world, from the official video (looked at as contact sheets every 3 s; nothing violent in it): a white modernist villa by a pool at night, two harlequin Great Danes lying either side of the pool, the singer rising from the water in a mirrored visor, her platinum bob with blunt bangs, a lightning bolt on her cheek, a teal latex one-piece, a poker table with red chips under a red-orange canopy. The words, from whitelisted keywords per line (keywords.py: sorted, never the lines): hold, Texas, fold, hit, raise, stay, cards, spades, play, heart, show, read, poker, face, nobody. Kob deals in her bartender look with a green visor (the cat with the poker face), Sadi plays in her red sequin dress (glam), Compote in her cowgirl look (the Texas of Texas hold'em). The chips are dog biscuits; the famous painting of dogs playing poker gives the table its lamp. The Danes are map objects.",
    'with': ['sadi', 'kob', 'compote'],
    'clips': ['happy_idle', 'charleston', 'sitting_talking', 'celebrating_after_a_win_while_seated', 'crying_and_rubbing_eyes', 'dismissing_with_back_hand'],
    'tags': {'structure': 'tell', 'scenes': ['rising out of the pool', 'the deal', 'the peek', "the dog's tell", 'everyone folds', 'he eats his winnings', 'the sob', 'everyone piles in', "the cat's tower", 'the sniff', "the cat's poker face", 'deal with it sunglasses', 'all in', 'the bluff', 'the cat folds aces', 'the reveal', 'the victory kick', 'the dive'],
             'cast': ['saxo', 'sadi', 'kob', 'compote'], 'hook': 'dance', 'maps': ['mansion'], 'ref': 'none',
             'lyric_literal': "'hold' (he peeks at his cards), 'Texas' (Compote in her cowboy hat), 'fold' (Sadi throws her cards in), 'hit' (Compote slams the table), 'raise' (he shoves his stack in), 'stay' (the cat doesn't move), 'cards', 'spades' (the ace of spades turned over), 'heart' (Sadi's paw on hers), 'show' (the showdown), 'read' (he sniffs at her face; she leans in to read him), 'poker face' (her deadpan; then his, in sunglasses), 'nobody' (the seven and the two; the aces she folds)",
             'experiment': "A pet-owner universal everyone knows (dogs show everything on their faces, cats show nothing) played as a game the viewer can follow card by card (poker), on a song whose title is the joke, with the 'deal with it' sunglasses on the chorus's first beat: does a story that reads as a game hold the Short's viewers better (more likes per 1,000 views) than our last week's chart-song episodes (8-10)?"},
    'yt': 'end',
    'shots': shots,
}
json.dump(ep, open(os.path.join(HERE, '2026-10-08-2.json'), 'w'), indent=1, ensure_ascii=False)
print(len(shots), 'shots;', len(WARN), 'warnings')
for w in WARN: print('  ', w)
