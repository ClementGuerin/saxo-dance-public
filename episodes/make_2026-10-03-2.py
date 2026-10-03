# make_2026-10-03-2.py: writes episodes/2026-10-03-2.json, "we fell in love in october" (girl in red, 2018; a trending
# song, the queue being empty: the day's biggest climber on Spotify's global daily chart on 2026-10-02, +80 places to
# #58 and +429k streams, the October surge; 1.74M TikTok videos on its 42 s sound, 201M views on the official video).
# The clip (studied from a 360p copy, its burned-in subtitles cropped out): two girls in love in autumn Oslo, on a
# rooftop over the city's orange trees and grey towers with a church spire, in a pine and birch wood, one of them in a
# red knit sweater (the girl in red), the singer in a black-and-white Nordic knit sweater; dark performance shots under
# streaks of projected light.
# Ours, "the park" (new structure, SISYPHUS: the one who keeps redoing a chore while the lead keeps undoing it, the chore
# bigger and the stare harder each time, until the chore is done to him): October in a city park, Saxo in the singer's
# Nordic sweater falls for the girl in red (Sadi) literally: he falls flat into the leaf pile the park keeper (Kob, in a
# hi-vis vest, with her rake) has just raked, dives into the next one, sees stars, and creeps after Sadi inside a third.
# He bursts out of it with a red maple leaf for her and she falls for him too; Kob rakes it all back, bigger, glaring;
# Compote buries her winter carrot stash in the biggest pile of all under the big maple and climbs in to guard it. At
# dusk the two slow-dance under the lamp, eye the giant pile, and on the band's return they dive into it together: leaves
# and carrots explode, Compote erupts in a fury; the lovers dance in the leaf rain. Kob rakes them into the garden sack,
# where they're happy in their own little world, and they hop away in it like a sack race. Kob, alone at last under the
# big maple, leans on her rake: the maple drops every leaf it has on her. The music stops dead.
# Beats: 129.9953 BPM, kit beat b at b * 60 / 129.9953 s (kit beat 0 = song beat 228, chorus 2's downbeat); a bar = 4
# beats (1.846 s). Sections: b0-32 chorus 2 (the full band), b32-68 the half-time post-chorus, b68-100 the quiet
# breakdown, b100-164 the band's return to the song's dead stop (b164), b164-165 its decay. Acted words (kit beats):
# 'fell' b4.72, 'love' b6.97, 'october' b9.18, 'fall' b19.80, 'looking' b21.49, 'stars' b27.38, 'admiring' b29.33,
# 'afar' b34.49; the post-chorus's held word b44.93, b52.29, b61.52; the breakdown's b69.71, 71.79, 75.43, 83.84, 85.88,
# 87.96, 91.42; the return's b99.79, 101.74, 103.77, 107.28, 115.82, 117.86, 119.81, 123.27; 'world' b131.90, 133.89,
# 136.44, 139.43; the last line b147.93. The lyrics stay in episodes/2026-10-03-2.lyrics.js.
import json, math, os, re, sys
sys.path.insert(0, os.path.dirname(__file__))
from cam import view, vpath, deadpan, swoop, low

HERE = os.path.dirname(__file__)
PER = 60 / 129.9953
def T(b): return b * PER
def S(b, b0): return round(T(b) - T(b0), 3)    # seconds from shot beat b0 to beat b

LOOK = {'saxo': 'nordic', 'sadi': 'redsweater', 'kob': 'keeper', 'compote': 'compote'}
HEAD = {'saxo': 1.32, 'sadi': 1.28, 'kob': 1.34, 'compote': 1.42}     # the top of each head standing (Sadi's bow, Kob's beanie, Compote's ears)
FACE = {'saxo': 0.9, 'sadi': 0.84, 'kob': 0.86, 'compote': 0.86}
RAD = {'saxo': 0.42, 'sadi': 0.38, 'kob': 0.38, 'compote': 0.38}     # a head's silhouette radius with ears

# the map (src/maps26.js PARK)
PATH_Z, BENCH, BENCH_Y, LAMP, MAPLE, BARROW = -2.9, (2.8, -3.9), 0.42, (4.0, -1.5), (-2.6, -6.4), (-3.3, -0.4)
P0 = dict(x=-3.0, z=-2.7, r=0.7, h=0.6)         # Kob's working pile, beside her
P1 = dict(x=0.1, z=-1.05, r=0.78, h=0.68)       # behind Saxo's mark: the one he falls into
P2 = dict(x=2.45, z=0.5, r=0.76, h=0.66)        # the one he dives into
BIG = dict(x=-2.0, z=-4.9, r=1.45, h=1.2)       # the giant pile under the big maple (Compote's carrot stash)
SX = (0.0, 0.0)                                  # Saxo's mark in the hook
KOB = (-1.85, -2.35)                              # Kob raking beside P0, behind Saxo's mark and well to his left
def pile(p, **o): return {**p, **o}

def A(who, clip, x, z, **o):
    return {'who': who, 'look': o.pop('look', LOOK[who]), 'clip': clip, 'x': round(x, 3), 'z': round(z, 3), 'face': o.pop('face', 'camera'),
            'yaw': o.pop('yaw', 0), 'at': o.pop('at', 'auto'), **o}
def yaw_to(frm, to): return round(math.degrees(math.atan2(to[0] - frm[0], to[1] - frm[1])), 1)
RAKE = dict(hold='rake', arm='both', aim='rake')

# ---- a projection check (numbers only): where each face lands in the 9:16 frame at the shot's start and end ----
def _proj(cam, look, fov, pt):
    f = [look[i] - cam[i] for i in range(3)]; n = math.sqrt(sum(v * v for v in f)); f = [v / n for v in f]
    r = [-f[2], 0.0, f[0]]; rn = math.sqrt(r[0] ** 2 + r[2] ** 2) or 1; r = [r[0] / rn, 0.0, r[2] / rn]
    u = [r[1] * f[2] - r[2] * f[1], r[2] * f[0] - r[0] * f[2], r[0] * f[1] - r[1] * f[0]]
    d = [pt[i] - cam[i] for i in range(3)]; z = sum(a * b for a, b in zip(d, f))
    if z <= 0.05: return None
    tv = math.tan(math.radians(fov) / 2); th = tv * 9 / 16
    return (0.5 + sum(a * b for a, b in zip(d, r)) / z / th / 2, 0.5 - sum(a * b for a, b in zip(d, u)) / z / tv / 2)
_src = open(os.path.join(HERE, '2026-10-03-2.lyrics.js')).read()
_rows = json.loads(re.search(r'window\.LYRICS = (.*?);\n', _src).group(1)); _ends = json.loads(re.search(r'window\.LINE_END = (.*?);\n', _src).group(1))
LINES = [((row[0][0] - 0.35) / PER, e / PER) for row, e in zip(_rows, _ends)]
def has_line(b0, b1): return any(a < b1 and b > b0 for a, b in LINES)
WARN = []
def body(a, end):                               # (who, x, z, face y, head top y) of an actor at the shot's start (0) or end (1)
    who = a['who']
    x, z = a['x'] + a.get('mx', 0) * end, a['z'] + a.get('mz', 0) * end
    lift = a.get('lift', 0) + (a.get('my', 0) if end else 0) - (0.3 if a['clip'] == 'male_driving_a_car' else 0)   # seated: the head ~0.3 m lower
    return (who, x, z, FACE[who] + lift, HEAD[who] + lift)
def check(beat, b1, cam, look, fov, actors, end):
    line = has_line(beat, b1)
    for a in actors:
        if a.get('fg') or a.get('lying') or a.get('reveal', 0) >= 1.0: continue
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
def clear_line(v, *pts, r=0.7):                  # hide the falling leaves near a lens and along its first stretch of sight
    c, f = v; p = lens(v, 0); q = lens(v, -1)
    out = [[round(p[0], 2), round(p[2], 2), r], [round(q[0], 2), round(q[2], 2), r]]
    for k in range(1, 4):
        u = k / 8; out.append([round(p[0] + (f[0] - p[0]) * u, 2), round(p[2] + (f[1] - p[2]) * u, 2), r * 0.8])
    return out + [list(x) for x in pts]
def add(beat, b1, actors, lyric, v, **o):
    c, focus = v
    o = {k: val for k, val in o.items() if val is not None}
    o.setdefault('clear', clear_line(v))
    shots.append({'beat': beat, 'kind': 'dance', 'map': 'park', 'actors': actors, 'lyric': lyric, 'cam': c, 'focus': focus, **o})
    fy = focus[2] if len(focus) > 2 else 0
    for k, end in ((0, 0), (-1, 1)):
        cam, look = lens(v, k), (focus[0], c['look'][k] + fy, focus[1])
        check(beat, b1, cam, look, c['fov'], actors, end)
        for oc in _occl(cam, look, c['fov'], [body(a, end)[:4] for a in actors if not a.get('lying')]):
            if not next(a for a in actors if a['who'] == oc.split(' behind ')[0]).get('fg'): WARN.append(f'b{beat}: {oc}{" at the end" if end else ""}')
def clean(actors):                               # the generator's own keys off the actors
    for a in actors: a.pop('lying', None)
    return actors

# ================= a lens search (the bobsled and agency episodes'): every face inside the frame and under the lyric
# rows at the shot's start and end, no face inside a nearer head's disc, the lens clear of the park's trunks and props =================
TRUNKS = [(-7.5, -7.8), (5.6, -7.2), (8.8, -4.6), (-9.6, -3.6), (1.4, -10.6), (-4.8, -11.6), (9.4, -11.2), (-11.8, -9.6), MAPLE]
def park_free(c):
    x, y, z = c
    if y < 0.15: return False
    if any(math.hypot(x - tx, z - tz) < 0.6 for tx, tz in TRUNKS): return False
    if math.hypot(x - LAMP[0], z - LAMP[1]) < 1.1 or math.hypot(x - BARROW[0], z - BARROW[1]) < 0.75: return False   # a lens by the lamp post had it down the frame's edge
    if abs(x - BENCH[0]) < 1.0 and abs(z - BENCH[1]) < 0.45 and y < 1.0: return False
    return True
def lamp_off(look, m=0.9):                      # a free() that also keeps the lamp post off the line of sight (it ran down the frame's edge)
    def ok(c):
        if not park_free(c): return False
        dx, dz = look[0] - c[0], look[2] - c[2]; L = math.hypot(dx, dz) or 1; ux, uz = dx / L, dz / L
        px, pz = LAMP[0] - c[0], LAMP[1] - c[2]; t = px * ux + pz * uz
        return t < 0 or t > L + 1 or abs(px * uz - pz * ux) > m + 0.35 * t
    return ok
WHY = {}
def _no(r): WHY[r] = WHY.get(r, 0) + 1; return None
FACING = {}                                     # who -> yaw (deg) of the actors turned to the world in the shot being solved
def _ok(cam, look, fov, phases, line, occ=(), maxoff=105):
    worst = 1.0
    for w, yw in FACING.items():                # a lens behind a face never sees it (the first solve put two lenses behind the runners)
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
def lens_for(actors, ang, dist, b0, b1, hs=(1.0,), fov=50, look=None, spread=40, dr=(0.8, 1.5), free=park_free, push=0.04, facing=True, maxoff=105, **o):
    vis = [a for a in actors if not a.get('fg') and not a.get('lying')]
    FACING.clear(); FACING.update({a['who']: a.get('yaw', 0) for a in vis if a.get('face') == 'world'} if facing else {})   # facing=False: an action read from behind (a dive)
    phases = [[body(a, 0) for a in vis], [body(a, 1) for a in vis]]
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

# ================= ACT 1, chorus 2 (b0-40): he falls for her, literally, into the park keeper's piles =================
# S01 the hook: a swoop down through the falling leaves onto Saxo dancing the charleston on the lawn in the singer's
# Nordic sweater, the park keeper raking behind him, a fresh pile at his back
s01 = [A('saxo', 'charleston', *SX, at=0.75), A('kob', 'happy_idle', *KOB, at=0.3, speed=0.5, **RAKE)]
v = swoop([(1.1, 2.5, 5.6), (0.85, 1.7, 4.6), (0.55, 0.75, 3.6), (0.45, 0.42, 3.2)], (SX[0] - 0.3, 0.95, SX[1] - 0.2), fov=60, roll=(0, -3, -10, -6), hand=0.15)
add(0, 3, s01, "HOOK: a golden October afternoon in a city park, leaves falling everywhere: the lens swoops down through them onto Saxo dancing the charleston on the lawn in the singer's black Nordic sweater; behind him a fresh pile of leaves, and the park keeper (Kob, hi-vis vest, beanie) raking",
    v, piles=[P1, P0], fall=1.6, stars=['saxo'])
# S01b one beat: the girl in red walks up in front of him, glancing his way
SADI2 = (0.6, 1.75)
s01b = [A('sadi', 'happy_walk', SADI2[0] + 0.55, SADI2[1] + 0.05, face='world', yaw=-75, at=0.3, mx=-0.4)]
v = view((SADI2[0] - 0.1, 0.98, SADI2[1] + 2.2), (SADI2[0] + 0.4, 0.92, SADI2[1]), 46, p1=(SADI2[0] - 0.05, 0.98, SADI2[1] + 2.1), ease='lin')   # from x -0.4 the lamp post stood straight up out of her head
add(3, 4, s01b, "one beat: the girl in red (Sadi, a red knit sweater) walks up in front of him through the falling leaves",
    v, piles=[P1], fall=2, leafAt=[SADI2[0] + 0.2, SADI2[1] + 0.3], leafR=0.3, stars=['sadi'])
# S02 'fell': he sees her, freezes, and falls flat on his back into the pile on the word, which bursts
s02 = [A('saxo', 'knocked_out_falling_to_back', *SX, face='world', yaw=yaw_to(SX, SADI2), at=1.7, ground='mesh', once=True)]
v = view((0.45, 1.25, 3.5), (-0.15, 0.55, -0.55), 54, p1=(0.4, 1.2, 3.35))
add(4, 8, s02, "'fell' (b4.72): Saxo catches sight of someone off to his right (the girl in red), freezes, and falls flat on his back into the leaf pile on the word; it bursts, leaves flying up and raining down",
    v, piles=[pile(P1, burst=S(5.1, 4)), P0], fall=1.6, stars=['saxo'])
# S03 'october': the reverse: Sadi giggles at him, the burst's leaves raining down round her
s03 = [A('sadi', 'laughing_standing', *SADI2, face='world', yaw=yaw_to(SADI2, (-0.3, -0.9)), at=0.3),
       A('saxo', 'knocked_out_falling_to_back', *SX, face='world', yaw=yaw_to(SX, SADI2), at=3.5, speed=0.02, ground='mesh', fg=True, lying=True)]
v = view((-0.75, 0.62, -1.75), (SADI2[0], 1.0, SADI2[1]), 50, p1=(-0.72, 0.62, -1.62), ease='lin')
add(8, 12, s03, "'october' (b9.18): the reverse: the girl in red giggles at the boy flat in the leaves, the burst's leaves still raining down round her",
    v, piles=[pile(P1, burst=-9), P0], fall=2, leafAt=[0.0, 0.0], clear=[], stars=['sadi'])
# S04 the park keeper's deadpan: her freshly raked pile scattered all over the lawn; she stares, rake in paws
K4 = yaw_to(KOB, (P1['x'], P1['z']))
s04 = [A('kob', 'happy_idle', *KOB, face='world', yaw=K4, at=0.6, speed=0.15, **RAKE)]
_u = (math.sin(math.radians(K4)), math.cos(math.radians(K4)))
v = view((KOB[0] + _u[0] * 3.6, 0.95, KOB[1] + _u[1] * 3.6), (KOB[0], 1.0, KOB[1]), 42, p1=(KOB[0] + _u[0] * 3.45, 0.95, KOB[1] + _u[1] * 3.45), ease='lin')
add(12, 16, s04, "the park keeper's deadpan: Kob, in her hi-vis vest and beanie, rake in paws, stares at what's left of the pile she had just raked",
    v, piles=[pile(P1, burst=-9), P0], stars=['kob'])
# S05 'fall': Saxo dives into her next pile on the word (the dog-in-a-leaf-pile meme): a run and a leap, the pile explodes
D0 = (0.05, 0.5); UP = 0.8
s05 = [A('saxo', 'happy_run', *D0, face='world', yaw=90, at=0.0, mx=1.55, my=UP, myAt=0.8, myDur=0.55, air=True, reveal=0.45, noShadow=True)]
v = view((1.0, 0.3, 4.5), (1.5, 1.15, 0.5), 60, p1=(1.05, 0.3, 4.35), ease='lin')   # from the grass: at the top of the leap his feet are over the horizon, against the sky, the trunks off to the side (from x 1.5 a maple's trunk stood under his sneakers: perched in it; level with him, or from above with the shadow, which rises with an actor's lift, he read as standing on the lawn behind)
add(16, 19, s05, "the run-up: Saxo takes a run at Kob's next pile and leaps, side on, cut at the top of the leap",
    v, piles=[P2], fall=1.4, noguests=True, stars=['saxo'])
s05b = [A('saxo', 'happy_run', P2['x'] - 0.45, P2['z'], face='world', yaw=90, at=0.4, speed=0.6, mx=0.45, lift=UP, my=-UP - 0.9, myAt=0.05, myDur=S(19.8, 19) - 0.05, air=True)]
v = view((P2['x'] + 1.6, 0.85, P2['z'] + 3.0), (P2['x'] - 0.1, 0.95, P2['z']), 60, p1=(P2['x'] + 1.52, 0.85, P2['z'] + 2.85), roll=[-6, -9])
add(19, 22, s05b, "'fall' (b19.80): from the grass, he drops into the pile on the word and vanishes in it, leaves bursting up all round (the dog-in-a-leaf-pile meme)",
    v, piles=[pile(P2, burst=S(19.8, 19), puff=True)], fall=1.4, stars=['saxo'])
# S06 'looking': his head pops up out of the leaves, leaves on his head, grinning; behind him Kob rakes harder
s06 = [A('saxo', 'happy_idle', P2['x'], P2['z'], at=0.5, speed=0.4, lift=-0.9, my=0.72, myAt=0.25, myDur=0.3, air=True),
       A('kob', 'happy_idle', 0.85, -1.15, at=0.2, speed=0.9, **RAKE)]
v = lens_for(s06, 10, 3.2, 22, 26, hs=(0.6, 0.75, 0.9), fov=52, roll=[-6, -4])
add(22, 26, s06, "'looking' (b21.49): his head pops up out of the leaves, leaves on his head, grinning at her; behind him, Kob rakes harder",
    v, piles=[pile(P2, h=0.5, r=0.95), P0], fall=1.2, stars=['saxo'])
# S07 'stars': flat on his back in the scattered leaves, seeing stars (they circle his head), gazing up at the girl in red
LIE = (2.5, 0.35)
s07 = [A('saxo', 'shot_to_the_chest_falling_backwards', *LIE, face='world', yaw=0, at=9.0, speed=0.0, ground='mesh', dizzy=True, lying=True),   # lies flat on his back, face up (the knocked-out clip ends on its side)
       A('sadi', 'happy_idle', LIE[0] + 0.95, LIE[1] - 0.45, face='world', yaw=yaw_to((LIE[0] + 0.95, LIE[1] - 0.45), (LIE[0], LIE[1] - 0.9)), at=0.3, speed=0.4, lean=12, fg=True)]   # beside his head, not over it (leaning over his face her head hid half of it)
v = view((LIE[0] + 0.3, 3.3, LIE[1] + 0.55), (LIE[0] + 0.3, 0.2, LIE[1] - 0.6), 62, p1=(LIE[0] + 0.3, 3.0, LIE[1] + 0.47), roll=[0, 8])
add(26, 30, s07, "'stars' (b27.38): from above: Saxo flat on his back in the scattered leaves, seeing stars (they circle his head), gazing up dreamily at the girl in red leaning over him",
    v, piles=[pile(P2, burst=-9)], fall=1.2, stars=['saxo'])
# S08 'admiring': hidden in another pile, only his eyes and ears over the top, he admires her from afar: she reads on a bench
P3a = dict(x=0.15, z=-2.0, r=0.85, h=0.74)
_d8 = (BENCH[0] - P3a['x'], BENCH[1] - P3a['z']); _n8 = math.hypot(*_d8); _d8 = (_d8[0] / _n8, _d8[1] / _n8)
s08 = [A('saxo', 'happy_idle', P3a['x'], P3a['z'], at=1.0, speed=0.15, face='world', yaw=yaw_to((P3a['x'], P3a['z']), BENCH) - 8, lift=-0.18),   # sunk: only his eyes and ears over the top
       A('sadi', 'male_driving_a_car', BENCH[0], BENCH[1] + 0.13, face='world', yaw=yaw_to(BENCH, (P3a['x'], P3a['z'])), at=0.4, speed=0.05, lift=0.24, hold='book', arm='both', aim=[0.2, 0.1, 0.9], fg=True)]   # her back to us, reading
v = view((BENCH[0] + 1.15, 1.7, BENCH[1] - 1.45), (P3a['x'], 0.85, P3a['z']), 41, p1=(BENCH[0] + 1.1, 1.68, BENCH[1] - 1.33), ease='lin')   # from 1 m behind her head it was a black slab and a pink block
add(30, 34, s08, "'admiring' (b29.33): from the bench, over the shoulder of the girl in red reading: across the lawn, a pile of leaves with his eyes and ears peeking over its top, staring at her",
    v, piles=[P3a], stars=['saxo'])
# S09 'afar': the wide: the pile creeps across the lawn towards her bench; in front, Kob's head turns to follow it
P3b = (1.75, -3.0)
s09 = [A('saxo', 'happy_idle', P3a['x'], P3a['z'], at=1.0, speed=0.15, mx=round(P3b[0] - P3a['x'], 2), mz=round(P3b[1] - P3a['z'], 2), face='world', yaw=yaw_to((P3a['x'], P3a['z']), P3b)),
       A('kob', 'happy_idle', -0.55, -0.85, face='world', yaw=yaw_to((-0.55, -0.85), (1.0, -2.5)), at=0.3, speed=0.3, **RAKE),
       A('sadi', 'male_driving_a_car', BENCH[0], BENCH[1] + 0.13, at=0.4, speed=0.05, lift=0.24, hold='book', arm='both', aim=[0.2, 0.1, 0.9])]
v = lens_for(s09, 75, 5.2, 34, 40, hs=(1.2, 1.5, 1.8), fov=56, spread=45, dr=(0.85, 1.5), maxoff=110)
L9 = S(40, 34)
add(34, 40, s09, "'afar' (b34.49): a pile of leaves creeps across the lawn towards the bench, his head poking out of its top; the park keeper, rake in paws, turns to watch it go",
    v, piles=[pile(P3a, to=[P3b[0], P3b[1], 0, L9])], stars=['saxo'])

# ================= ACT 2, the post-chorus (b40-68, half-time): he bursts out with a maple leaf; Compote's stash =================
# S10 the pile stops at her feet; she lowers her book and looks down at it
s10 = [A('sadi', 'male_driving_a_car', BENCH[0], BENCH[1] + 0.13, face='world', yaw=yaw_to(BENCH, P3b), at=0.4, speed=0.05, lift=0.24, lean=14, hold='book', arm='both', aim=[0.2, -0.45, 0.75]),
       A('saxo', 'happy_idle', *P3b, at=1.0, speed=0.15, face='world', yaw=yaw_to(P3b, BENCH))]
v = lens_for(s10, 60, 3.2, 40, 44, hs=(0.95, 1.1, 1.25), fov=50, spread=45)
add(40, 44, s10, "the pile stops at her feet; the girl in red lowers her book and looks down at it",
    v, piles=[pile(P3a, x=P3b[0], z=P3b[1])], stars=['sadi'])
# S11 the held word: he bursts out of the pile in front of her holding up a big red maple leaf; she's charmed: hearts
SAXO11 = (P3b[0] + 0.1, P3b[1] + 0.15)
s11 = [A('saxo', 'happy_idle', *SAXO11, at=0.3, speed=0.5, holdL='mapleleaf', arm='L', aim=[0.8, 0.22, 0.5], upAt=S(44.93, 44) - 0.05),   # to the lens, the leaf out beside his head on her side (in the near paw it hid his face)
       A('sadi', 'male_driving_a_car', BENCH[0], BENCH[1] + 0.13, face='world', yaw=yaw_to(BENCH, SAXO11) + 25, at=0.4, speed=0.05, lift=0.24, hold='book', arm='both', aim=[0.2, -0.2, 0.85])]
v = lens_for(s11, 30, 3.0, 44, 48, hs=(0.95, 1.1, 1.25), fov=50, spread=75, dr=(0.8, 1.6), maxoff=80, free=lamp_off((SAXO11[0] + 0.5, 0.9, SAXO11[1] - 0.4)))
add(44, 48, s11, "the held word (b44.93): he bursts out of the pile in front of her, leaves flying, holding up a big red maple leaf for her; she's charmed: hearts pop over her",
    v, piles=[pile(P3a, x=P3b[0], z=P3b[1], burst=S(44.93, 44) - 0.1, puff=True)], hearts=[[BENCH[0], 1.6, BENCH[1] + 0.15, S(46, 44)]], stars=['saxo', 'sadi'])
# S12 the park keeper's second deadpan: she rakes the scattered leaves back into a pile, bigger, glaring
K12 = -46; F12 = (math.sin(math.radians(K12)), math.cos(math.radians(K12))); P12 = (KOB[0] + 1.85 * F12[0], KOB[1] + 1.85 * F12[1])   # the pile just past the tines (0.95 m ahead)
s12 = [A('kob', 'happy_idle', *KOB, face='world', yaw=K12, at=0.6, speed=0.4, **RAKE)]
LK12 = (KOB[0] + 0.8 * F12[0], 0.75, KOB[1] + 0.8 * F12[1]); _b = math.radians(K12 + 80)   # side on (from the front the pile hid the rake: she read as hugging it)
v = view((LK12[0] + math.sin(_b) * 3.9, 1.0, LK12[2] + math.cos(_b) * 3.9), LK12, 52, p1=(LK12[0] + math.sin(_b) * 3.75, 1.0, LK12[2] + math.cos(_b) * 3.75), ease='lin')
add(48, 52, s12, "the park keeper rakes the scattered leaves back up into a pile, bigger this time, glaring the whole time",
    v, piles=[pile(P0, x=P12[0], z=P12[1], r=0.8, h=0.7, grow=[0.1, S(52, 48) - 0.2])], stars=['kob'])
# S13 the held word: Saxo dances for her on the lawn, the maple leaf in his paw, leaves falling
s13 = [A('saxo', 'charleston', 0.6, -0.4, at=0.8)]
v = low((1.05, 0.24, 2.6), (0.6, 0.85, -0.4), (0.95, 0.24, 2.15), fov=60, roll=(-8, -5), hand=0.3)
add(52, 56, s13, "the held word (b52.29): Saxo dances the charleston for her on the lawn in the falling leaves, from the grass",
    v, fall=1.6, stars=['saxo'])
# S14 she gets up and joins him: the two dance the twist together in the falling leaves
s14 = [A('saxo', 'charleston', 0.15, -0.5, at=0.85), A('sadi', 'charleston', 1.05, -0.5, at=1.5)]
v = low((0.65, 0.3, 2.95), (0.6, 0.86, -0.5), (0.63, 0.3, 2.65), fov=62, roll=(5, 3), hand=0.3)
add(56, 60, s14, "the girl in red gets up and joins him: the two dance the twist together in the falling leaves",
    v, fall=1.6, stars=['saxo', 'sadi'])
# S15 the held word: Compote's cutaway: under the big maple she buries her winter carrot stash in the biggest pile of all,
# glaring round to see if anyone's watching
CMP = (BIG['x'] + 1.05, BIG['z'] + 0.65)
s15 = [A('compote', 'happy_idle', *CMP, at=0.4, speed=0.4, face='world', yaw=-12, hold='carrot', arm='R', aim=[0.85, -0.25, 0.3])]   # her glare to the lens, the carrot pushed into the pile at her side
v = view((CMP[0] + 0.45, 0.98, CMP[1] + 2.45), (CMP[0] - 0.3, 0.92, CMP[1] - 0.15), 50, p1=(CMP[0] + 0.43, 0.98, CMP[1] + 2.3), ease='lin')
add(60, 64, s15, "the held word (b61.52): meanwhile, under the big maple: Compote buries her winter carrot stash in the biggest pile of all, glaring round to make sure nobody's watching",
    v, piles=[BIG], stash=[CMP[0] + 0.25, CMP[1] + 0.45, 9], stars=['compote'])
# S16 the two walk off together along the path into the golden light, the girl in red and the boy in the Nordic sweater
W0 = (-0.9, PATH_Z)
s16 = [A('saxo', 'happy_walk', W0[0], W0[1] - 0.45, face='world', yaw=90, at=0.0, mx=1.1), A('sadi', 'happy_walk', W0[0], W0[1] + 0.45, face='world', yaw=90, at=0.5, mx=1.1)]
v = lens_for(s16, 55, 3.8, 64, 68, hs=(0.95, 1.1), fov=54, spread=25)
add(64, 68, s16, "the two stroll off together along the gravel path through the falling leaves, side by side",
    v, fall=1.4, stars=['saxo', 'sadi'])

# ================= ACT 3, the breakdown (b68-100, quiet): dusk, the slow dance, the giant pile =================
LMP = (LAMP[0] - 1.35, LAMP[1] + 0.75)           # by the lamp, its post beside them (behind a head it grew out of it)
SA, SD = (LMP[0] - 0.42, LMP[1]), (LMP[0] + 0.42, LMP[1])
SLOW = dict(at=0.4, speed=0.35, sway=6, swayEvery=2, arm='both', aim=[0.15, 0.12, 0.98])
# S17 dusk, the lamp lit: they slow-dance under it, face to face, swaying, leaves drifting through the light
s17 = [A('saxo', 'happy_idle', *SA, face='world', yaw=90, **SLOW), A('sadi', 'happy_idle', *SD, face='world', yaw=-90, **SLOW)]
v = view((LMP[0] - 0.35, 0.55, LMP[1] + 3.5), (LMP[0] + 0.3, 1.25, LMP[1] - 0.3), 56, p1=(LMP[0] - 0.33, 0.55, LMP[1] + 3.3), ease='lin')
add(68, 72, s17, "dusk, the lamp lit (b69.71, b71.79): the two slow-dance under it, face to face, swaying, leaves drifting through the lamplight",
    v, zone='dusk', fall=1.0, leafAt=[LMP[0], LMP[1]], stars=['saxo', 'sadi'])
# S18 the park keeper's third deadpan: at dusk she has raked the giant pile under the big maple, and leans on her rake beside it
KB = (BIG['x'] + 1.55, BIG['z'] + 0.6)
s18 = [A('kob', 'happy_idle', *KB, at=0.6, speed=0.1, face='world', yaw=-20, hold='rake', arm='R', aim=[0.35, -0.2, 0.9])]
v = view((KB[0] + 0.9, 1.25, KB[1] + 3.3), (KB[0] - 0.75, 0.95, KB[1] - 0.3), 50, p1=(KB[0] + 0.85, 1.22, KB[1] + 3.1), ease='lin')
add(72, 76, s18, "(b75.43) at dusk the park keeper has raked the giant pile under the big maple, the biggest of all; she leans on her rake beside it, deadpan",
    v, zone='dusk', piles=[BIG], stars=['kob'])
# S19 Compote climbs into the giant pile to guard her stash: only her ear tips stick out of the top; Kob doesn't notice
CEARS = (BIG['x'] + 0.3, BIG['z'] + 0.5)
s19 = [A('compote', 'happy_idle', *CEARS, at=0.4, speed=0.2, lift=0.02, fg=True)]
v = view((CEARS[0] + 0.55, 1.75, CEARS[1] + 2.0), (CEARS[0], 1.15, CEARS[1]), 44, p1=(CEARS[0] + 0.52, 1.72, CEARS[1] + 1.88), ease='lin')
add(76, 80, s19, "Compote has climbed into the giant pile to guard her stash: only her two ear tips stick out of the top; Kob, beside it, hasn't noticed",
    v, zone='dusk', piles=[BIG], stars=['compote'])
# S20 the slow dance from the grass, the lamp glowing over them, a handheld lens drifting round
s20 = [A('saxo', 'happy_idle', *SA, face='world', yaw=90, **SLOW), A('sadi', 'happy_idle', *SD, face='world', yaw=-90, **SLOW)]
v = low((LMP[0] - 0.6, 0.24, LMP[1] + 2.6), (LMP[0], 0.9, LMP[1]), (LMP[0] - 0.25, 0.24, LMP[1] + 2.3), fov=60, roll=(8, 5), hand=0.6)
add(80, 84, s20, "the slow dance from the grass, the lamp glowing over them, leaves drifting down",
    v, zone='dusk', fall=1.0, leafAt=[LMP[0], LMP[1]], stars=['saxo', 'sadi'])
# S21-S23 the three held words a beat apart: his eyes go to the giant pile, hers too, and the pile itself
s21 = [A('saxo', 'happy_idle', *SA, face='world', yaw=yaw_to(SA, (BIG['x'], BIG['z'])), at=1.2, speed=0.05)]
v = lens_for(s21, yaw_to(SA, (BIG['x'], BIG['z'])) + 25, 2.2, 84, 86, hs=(0.55, 0.65), fov=44, spread=10, dr=(0.9, 1.2), look=(SA[0], 1.05, SA[1]))
add(84, 86, s21, "(b83.84) his eyes go to the giant pile under the big maple...", v, zone='dusk', still=True, stars=['saxo'])
s22 = [A('sadi', 'happy_idle', *SD, face='world', yaw=yaw_to(SD, (BIG['x'], BIG['z'])), at=1.2, speed=0.05)]
v = lens_for(s22, yaw_to(SD, (BIG['x'], BIG['z'])) + 25, 2.1, 86, 88, hs=(0.5, 0.6), fov=44, spread=10, dr=(0.9, 1.2), look=(SD[0], 1.0, SD[1]))
add(86, 88, s22, "(b85.88) ...hers too...", v, zone='dusk', still=True, stars=['sadi'])
s23 = [A('compote', 'happy_idle', *CEARS, at=0.4, speed=0.2, lift=0.02, fg=True)]   # their point of view: the giant pile and the ear tips on it (the keeper had S18 and S19)
_t = (CEARS[0] - MAPLE[0], CEARS[1] - MAPLE[1]); _n = math.hypot(*_t); _t = (_t[0] / _n, _t[1] / _n)   # from the trunk through the ear tips: the dark trunk behind them (against the pale city they read as a grey lump)
v = view((CEARS[0] + _t[0] * 3.5, 1.0, CEARS[1] + _t[1] * 3.5), (CEARS[0], 1.42, CEARS[1]), 18, p1=(CEARS[0] + _t[0] * 3.1, 1.0, CEARS[1] + _t[1] * 3.1), ease='lin')   # a long lens creeping in (held still it read as a freeze)
add(88, 92, s23, "(b87.96) ...the giant pile, as they see it: huge, Compote's ear tips sticking out of its top against the maple",
    v, zone='dusk', still=True, piles=[BIG], stars=['compote'])
# S24 the held word: they look at each other and grin: the plan
s24 = [A('saxo', 'big_vegas_pointing_gesture', *SA, at=0.35, speed=0.55), A('sadi', 'clap_while_standing', *SD, at=0.5)]   # his arm straight out to his left, off frame towards the pile; she claps (from behind his back hid his face, and her fist pump read as paws at her cheeks)
v = view((LMP[0] - 0.2, 1.0, LMP[1] - 3.25), (LMP[0] - 0.05, 0.95, LMP[1]), 52, p1=(LMP[0] - 0.2, 1.0, LMP[1] - 3.1), ease='lin')
add(92, 96, s24, "the held word (b91.42): the plan: he points off at the giant pile, arm out, she claps", v, zone='dusk', stars=['saxo', 'sadi'])
# S25 they run at it, side by side, side on
RUN0 = (0.6, -3.6)
s25 = [A('saxo', 'happy_run', RUN0[0], RUN0[1] - 0.25, face='world', yaw=-90, at=0.0, mx=-1.5, mz=-0.25, my=UP, myAt=1.3, myDur=0.55, air=True), A('sadi', 'happy_run', RUN0[0] + 0.15, RUN0[1] + 0.55, face='world', yaw=-90, at=0.3, mx=-1.5, mz=-0.25, my=UP, myAt=1.3, myDur=0.55, air=True)]
v = lens_for(s25, 75, 3.6, 96, 100, hs=(1.3, 1.6), fov=56, spread=30, facing=False, look=(RUN0[0] - 1.3, 0.85, RUN0[1] - 0.4))
add(96, 100, s25, "they run at the giant pile together, side by side, the band coming back in under them", v, zone='dusk', piles=[BIG], stars=['saxo', 'sadi'])

# ================= ACT 4, the band's return (b100-124): the dive, the carrots, the fury, the leaf rain =================
# S26 the drop, two beats: frontal on the giant pile at head height, the two drop in from above, arms up, and it bursts
# round them, the carrot stash flying out
JA, JB = (BIG['x'] - 0.45, BIG['z'] + 0.4), (BIG['x'] + 0.45, BIG['z'] + 0.4)
DROP = dict(at=0.4, speed=0.5, arm='both', aim=[0.38, 0.92, 0.12], upAt=-0.2, lift=1.45, my=-2.35, myAt=0.1, myDur=0.24, air=True)   # arms up from the first frame (the rave swing read as a T pose); their heads under the lyric rows
s26 = [A('saxo', 'happy_idle', *JA, **DROP), A('sadi', 'happy_idle', *JB, **DROP)]
v = view((BIG['x'] + 0.1, 1.25, BIG['z'] + 4.6), (BIG['x'], 1.75, BIG['z'] + 0.35), 58, p1=(BIG['x'] + 0.1, 1.25, BIG['z'] + 4.45), roll=[-3, -6])   # back and tilted up: from 3.9 m their heads hung in the lyric rows as the line came up
add(100, 102, s26, "the drop (b100): frontal on the giant pile, the two drop into it from above, arms up, and it bursts round them: leaves and a whole stash of carrots fly out",
    v, zone='dusk', piles=[pile(BIG, burst=0.3, puff=True)], carrots=[BIG['x'], BIG['z'], 0.3, 20], fall=2, leafAt=[BIG['x'], BIG['z'] + 0.5], stars=['saxo', 'sadi'])
# S27 the held word: three heads pop up out of the pile on the word, the two grinning, Compote glaring between them with
# a carrot in each paw, carrots raining down round them, the park keeper behind the pile, deadpan
POP = dict(at=0.4, speed=0.4, lift=-0.9, my=0.86, myAt=S(103.77, 102) - 0.28, myDur=0.26, air=True)
HA, HC, HB = (BIG['x'] - 0.56, BIG['z'] + 0.62), (BIG['x'], BIG['z'] + 0.74), (BIG['x'] + 0.56, BIG['z'] + 0.62)
s27 = [A('saxo', 'happy_idle', *HA, **POP), A('sadi', 'happy_idle', *HB, **POP),
       A('compote', 'happy_idle', *HC, hold='carrot', holdL='carrot', arm='both', aim=[0.5, 0.82, 0.28], **{**POP, 'my': 1.25})]   # up to her waist, carrots held up (level with them her paws stayed in the leaves)   # the keeper gets the next shot (behind the three heads she was either hidden or cut by the edge)
v = view((BIG['x'] + 0.15, 0.92, BIG['z'] + 4.4), (BIG['x'] + 0.12, 0.92, BIG['z'] + 0.3), 52, p1=(BIG['x'] + 0.15, 0.92, BIG['z'] + 4.2), ease='lin', roll=[2, 0])
add(102, 106, s27, "the held word (b103.77): three heads pop up out of the giant pile on the word, the two grinning, Compote glaring between them with a carrot in each paw (it was her stash), carrots raining down round them",
    v, zone='dusk', piles=[pile(BIG, burst=-9, puff=True)], carrots=[BIG['x'], BIG['z'] + 0.45, 0.15, 20, 'rain', 1.6], fall=2, leafAt=[BIG['x'], BIG['z'] + 0.6], stars=['compote'])
# S28 the held word: the park keeper's deadpan as the carrots keep raining on her, one bouncing off her beanie
KB2 = (BIG['x'] + 1.9, BIG['z'] + 1.4)
s28 = [A('kob', 'happy_idle', *KB2, at=0.6, speed=0.1, face='world', yaw=-15, hold='rake', arm='R', aim=[0.35, -0.2, 0.9])]
v = view((KB2[0] + 1.0, 1.1, KB2[1] + 2.2), (KB2[0], 1.15, KB2[1]), 50, p1=(KB2[0] + 0.93, 1.1, KB2[1] + 2.08), roll=[-5, -3])   # from 0.62 m her whiskers hung down like drool
add(106, 110, s28, "the held word (b107.28): the park keeper's deadpan as carrots rain down round her, one bouncing off her beanie",
    v, zone='dusk', piles=[pile(BIG, burst=-9, puff=True)], carrots=[KB2[0], KB2[1], -0.05, 20, 'rain', 1.6, 1.36], fall=2, stars=['kob'])   # carrot 0 bonks off her beanie on the word (b107.28), the rest raining round her all shot
# S29 the two dance in the leaf rain, the carrots she pelts at them flying past
DA, DB = (BIG['x'] + 0.95, BIG['z'] + 1.8), (BIG['x'] + 1.85, BIG['z'] + 1.8)
s29 = [A('saxo', 'charleston', *DA, at=0.7), A('sadi', 'charleston', *DB, at=1.5)]
v = view((BIG['x'] + 1.55, 1.05, BIG['z'] + 5.9), (BIG['x'] + 1.4, 0.85, BIG['z'] + 1.8), 54, p1=(BIG['x'] + 1.5, 1.02, BIG['z'] + 5.6), ease='lin', roll=[-3, 2])
add(110, 116, s29, "the two dance the charleston in the leaf rain, laughing, carrots lying all round them",
    v, zone='dusk', piles=[pile(BIG, burst=-9)], carrots=[BIG['x'], BIG['z'], -9, 20], fall=2, leafAt=[BIG['x'] + 1.4, BIG['z'] + 1.8], stars=['saxo', 'sadi'])
# S30-S32 the three held words a beat apart: him, her, the two together from the grass
s30 = [A('saxo', 'charleston', *DA, at=1.35)]   # the kick (clip 1.5 s) early in the shot; gangnam's stance read as paws clasped
v = view((DA[0] - 0.2, 0.95, DA[1] + 2.6), (DA[0], 0.95, DA[1]), 48)
add(116, 118, s30, "(b115.82) Saxo in the leaf rain", v, zone='dusk', piles=[pile(BIG, burst=-9)], carrots=[BIG['x'], BIG['z'], -9, 20], fall=2, leafAt=[DA[0], DA[1] + 0.7], leafR=0.16, stars=['saxo'])   # a dense shower round him (not one leaf crossed the frame)
s31 = [A('sadi', 'gangnam', *DB, at=1.3)]
v = view((DB[0] + 0.25, 0.92, DB[1] + 2.5), (DB[0], 0.9, DB[1]), 48)
add(118, 120, s31, "(b117.86) the girl in red in the leaf rain", v, zone='dusk', clear=[], piles=[pile(BIG, burst=-9)], carrots=[BIG['x'], BIG['z'], -9, 20], fall=2, leafAt=[DB[0] + 0.25, DB[1] + 2.0], stars=['sadi'])
s32 = [A('saxo', 'charleston', *DA, at=0.7), A('sadi', 'charleston', *DB, at=0.7)]
v = low((BIG['x'] + 1.4, 0.35, BIG['z'] + 5.3), (BIG['x'] + 1.4, 0.95, BIG['z'] + 1.8), (BIG['x'] + 1.4, 0.35, BIG['z'] + 5.0), fov=58, roll=(5, 3), hand=0.4)
add(120, 124, s32, "(b119.81) the two together from the grass, the leaves still coming down",
    v, zone='dusk', piles=[pile(BIG, burst=-9)], carrots=[BIG['x'], BIG['z'], -9, 20], fall=2, leafAt=[BIG['x'] + 1.4, BIG['z'] + 1.8], stars=['saxo', 'sadi'])

# ================= ACT 5 (b124-165): the sack, their own little world, the sack race, the maple's revenge =================
BAG = (-0.45, -1.3)
IN_A, IN_B = (BAG[0] - 0.4, BAG[1]), (BAG[0] + 0.4, BAG[1])
INS = dict(lift=0.04, at=0.4, speed=0.4, air=True)   # in the sack: their feet never show, and the hops read as floating to the gate
# S33 the held word: the park keeper has raked the two of them into the garden sack: only their heads stick out; she and
# Compote stand beside it, the rake in her paw
s33 = [A('saxo', 'happy_idle', *IN_A, **INS), A('sadi', 'happy_idle', *IN_B, **INS),
       A('kob', 'happy_idle', BAG[0] - 1.1, BAG[1] + 0.5, face='world', yaw=30, at=0.6, speed=0.1, hold='rake', arm='R', aim=[0.35, -0.2, 0.9]),
       A('compote', 'happy_idle', BAG[0] + 1.1, BAG[1] + 0.5, face='world', yaw=-30, at=0.6, speed=0.1)]
v = lens_for(s33, 0, 4.8, 124, 132, hs=(1.1, 1.3), fov=54, spread=15, dr=(0.9, 1.4))
add(124, 132, s33, "the held word (b123.27): the park keeper has raked the two of them into the garden sack: only their heads stick out of it; she and Compote stand either side of it, the rake in her paw",
    v, zone='dusk', noguests=True, bag={'x': BAG[0], 'z': BAG[1]}, stars=['kob', 'compote'])
# S34 'world': in the sack, cheek to cheek, they're happy in their own little world: hearts
s34 = [A('saxo', 'happy_idle', BAG[0] - 0.36, BAG[1], face='world', yaw=12, **INS), A('sadi', 'happy_idle', BAG[0] + 0.36, BAG[1], face='world', yaw=-12, **INS)]
v = view((BAG[0] + 0.05, 1.0, BAG[1] + 3.1), (BAG[0], 0.84, BAG[1]), 46, p1=(BAG[0] + 0.05, 0.98, BAG[1] + 2.9), ease='lin')
add(132, 136, s34, "'world' (b131.90, b133.89): in the sack, cheek to cheek, the two are happy in their own little world: hearts pop over them",
    v, zone='dusk', noguests=True, bag={'x': BAG[0], 'z': BAG[1]}, hearts=[[BAG[0], 1.2, BAG[1], S(132.3, 132)], [BAG[0], 1.2, BAG[1], S(134.3, 132)]], stars=['saxo', 'sadi'])
# S35 'world': they start hopping in it, the sack bouncing on the beat, from the grass
HOP = [0.22, 1]
s35 = [A('saxo', 'happy_idle', *IN_A, hop=HOP, **INS), A('sadi', 'happy_idle', *IN_B, hop=HOP, **INS)]
v = view((BAG[0] + 2.6, 0.5, BAG[1] + 2.2), (BAG[0], 0.75, BAG[1]), 54, p1=(BAG[0] + 2.45, 0.5, BAG[1] + 2.05), roll=[-5, -3])
add(136, 140, s35, "'world' (b136.44, b139.43): they start hopping in it, the sack bouncing on every beat",
    v, zone='dusk', noguests=True, bag={'x': BAG[0], 'z': BAG[1], 'hop': HOP}, hearts=[[BAG[0], 1.2, BAG[1], S(137, 136)]], stars=['saxo', 'sadi'])
# S36 the sack race: they hop away along the path in it; the park keeper and Compote watch them go, deadpan (backs to us)
RACE = BAG; L36 = S(148, 140); GO = 1.35
s36 = [A('saxo', 'happy_idle', RACE[0] - 0.4, RACE[1], face='world', yaw=80, hop=HOP, mx=GO, **INS), A('sadi', 'happy_idle', RACE[0] + 0.4, RACE[1], face='world', yaw=80, hop=HOP, mx=GO, **INS),
       A('kob', 'happy_idle', RACE[0] - 1.05, RACE[1] + 0.25, face='world', yaw=70, at=0.6, speed=0.1, hold='rake', arm='R', aim=[0.35, -0.2, 0.9]),
       A('compote', 'happy_idle', RACE[0] - 1.8, RACE[1] + 0.25, face='world', yaw=75, at=0.6, speed=0.1)]   # side on: the sack hops off to the right, the two left standing on the left
v = lens_for(s36, 15, 5.2, 140, 148, hs=(1.0, 1.2, 1.4), fov=58, dr=(0.9, 1.6), spread=30, look=(RACE[0] + 0.0, 0.85, RACE[1]))
add(140, 148, s36, "the sack race: side on, they hop off in it, bouncing, leaving the park keeper and Compote standing there, deadpan",
    v, zone='dusk', noguests=True, bag={'x': RACE[0], 'z': RACE[1], 'hop': HOP, 'to': [RACE[0] + GO, RACE[1]], 'at': 0, 'dur': L36, 'yaw': -10}, stars=['saxo', 'sadi'])
# S37 the last line: the sack hops off into the golden distance (wide)
FAR0 = (RACE[0] + 0.25, RACE[1] - 1.3); L37 = S(152, 148)   # the sack 2.1 m past them, hopping 2.4 m further (from 0.55 m it filled the frame, and Kob stood out of it)
s37 = [A('saxo', 'happy_idle', FAR0[0] - 0.4, FAR0[1], face='world', yaw=180, hop=HOP, mz=-2.4, fg=True, **INS), A('sadi', 'happy_idle', FAR0[0] + 0.4, FAR0[1], face='world', yaw=180, hop=HOP, mz=-2.4, fg=True, **INS),
       A('kob', 'happy_idle', RACE[0] - 0.3, RACE[1] + 0.8, face='world', yaw=180, at=0.6, speed=0.1, hold='rake', arm='R', aim=[0.35, -0.2, 0.9], fg=True),
       A('compote', 'happy_idle', RACE[0] + 0.8, RACE[1] + 0.8, face='world', yaw=180, at=0.6, speed=0.1, fg=True)]
v = view((FAR0[0], 1.45, RACE[1] + 3.6), (FAR0[0], 0.85, RACE[1] - 1.7), 58, p1=(FAR0[0], 1.43, RACE[1] + 3.45), ease='lin')
add(148, 152, s37, "the last line (b147.93): from behind the park keeper and Compote, the sack hops away from them into the dusk, the two heads bobbing",
    v, zone='dusk', noguests=True, bag={'x': FAR0[0], 'z': FAR0[1], 'hop': HOP, 'to': [FAR0[0], FAR0[1] - 2.4], 'at': 0, 'dur': L37}, fall=1.4, stars=['kob', 'compote'])
# S38 the park keeper alone at last under the big maple, leaning on her rake, satisfied; Compote beside her with a carrot
KF, CF = (MAPLE[0] + 0.75, MAPLE[1] + 1.25), (MAPLE[0] + 1.55, MAPLE[1] + 1.35)
s38 = [A('kob', 'happy_idle', *KF, at=0.6, speed=0.1, hold='rake', arm='R', aim=[0.35, -0.2, 0.9]),
       A('compote', 'happy_idle', *CF, at=0.4, speed=0.2, hold='carrot', arm='R', aim=[0.5, 0.0, 0.8])]
v = view((KF[0] + 0.65, 1.15, KF[1] + 3.6), (KF[0] + 0.4, 0.95, KF[1]), 52, p1=(KF[0] + 0.62, 1.12, KF[1] + 3.35), ease='lin')
add(152, 160, s38, "the park keeper alone at last under the big maple, leaning on her rake, satisfied; Compote beside her with a carrot",
    v, zone='dusk', noguests=True, piles=[pile(BIG, burst=-9)], carrots=[BIG['x'], BIG['z'], -9, 20], stars=['kob', 'compote'])
# S39 the maple's revenge: it drops every leaf it has on them at once, a pile growing over them up to their chins
s39 = [A('kob', 'happy_idle', *KF, at=0.6, speed=0.1, hold='rake', arm='R', aim=[0.35, -0.2, 0.9]),
       A('compote', 'happy_idle', *CF, at=0.4, speed=0.2)]
v = view((KF[0] + 0.7, 1.6, KF[1] + 4.6), (KF[0] + 0.3, 1.5, KF[1] - 0.6), 56, p1=(KF[0] + 0.68, 1.55, KF[1] + 4.4), ease='lin')
add(160, 164, s39, "the maple's revenge (b160.5): it drops every leaf it has on the two of them at once, a pile growing over them up to their chins",
    v, zone='dusk', noguests=True, piles=[pile(BIG, burst=-9)], carrots=[BIG['x'], BIG['z'], -9, 20], dump=[S(160.5, 160), (KF[0] + CF[0]) / 2, KF[1] + 0.05, 1.25, 0.8], stars=['kob'])
# S40 the dead stop: the park keeper's eyes and beanie over the new pile, Compote's ears beside her: deadpan, one beat
s40 = [A('kob', 'happy_idle', *KF, at=0.6, speed=0.0), A('compote', 'happy_idle', *CF, at=0.4, speed=0.0)]
v = view((KF[0] + 0.45, 0.8, KF[1] + 4.1), (KF[0] + 0.1, 1.75, KF[1] - 1.0), 56)
add(164, 165, s40, "the dead stop (b164): the park keeper's eyes and beanie peek out over the new pile, Compote's ears beside her; nobody moves",
    v, zone='dusk', noguests=True, piles=[pile(BIG, burst=-9)], dump=[-9, (KF[0] + CF[0]) / 2, KF[1] + 0.05, 1.25, 0.8], still=True, stars=['kob'])

for s in shots: clean(s['actors'])
shots.sort(key=lambda x: x['beat'])
ep = {
    'date': '2026-10-03', 'song': {'title': 'we fell in love in october', 'artist': 'girl in red'},
    'logline': "Saxo falls for the girl in red in October, literally: every time, flat into a leaf pile the park keeper has just raked, until he and Sadi dive into her biggest pile together, which hides Compote's winter carrot stash; the keeper rakes the lovebirds into the garden sack (they hop away in it), and the big maple drops every leaf it has on her.",
    'new': "the SISYPHUS structure (the one who keeps redoing a chore while the lead keeps undoing it, bigger each time, until it's done to him); src/maps26.js: park (an October city park, golden afternoon or dusk: maples and birches, a lawn of leaf litter, a gravel path, a bench, a lamp post, a wheelbarrow, pumpkins, pets strolling on the far path, the city's roofs, towers and a green copper spire beyond; leaf piles as flags: a lumpy dome that bursts into leaves fluttering down and lying round it, grows back when raked, creeps with someone inside; a carrot stash bursting out of a pile; the big maple dropping every leaf at once onto a point; a big kraft-paper garden sack two can stand in, hopping along; hearts; a dusk sky and city); the rake prop (a wooden handle stretched to its fan of tines on the ground) and the raking swing; dizzy stars (an actor's dizzy: five yellow stars circling the head); the maple-leaf prop; three looks (Saxo's black Nordic sweater, the singer's look; Sadi's red knit sweater, the girl in red; Kob's park keeper's hi-vis vest and beanie)",
    'notes': "The clip (studied from a 360p copy, its burned-in subtitles cropped out of the sheets): two girls in love in autumn Oslo, on a rooftop over the city's orange trees, grey towers and a church spire, in a pine and birch wood, one in a red knit sweater (the girl in red), the singer in a black-and-white Nordic knit sweater, and dark performance shots under streaks of projected light. Ours keeps autumn in the city (the park, the orange trees, the towers and the spire beyond), the two sweaters (Saxo the singer in the Nordic one, Sadi the girl in red) and the love story, and turns the season's pun into the gag: he falls for her, literally, into the leaf piles. The whole cast: Saxo the lead who falls for her (the joke is on him, every pile), Sadi the girl in red (the romance; she falls for him too), Kob the park keeper who rakes it all back up, deadpan, and bags them (grumpy, unimpressed, then the maple's leaves land on her), Compote who buries her winter carrot stash in the biggest pile and erupts out of it in a fury when it explodes (violent over a carrot).",
    'with': ['sadi', 'kob', 'compote'],
    'clips': ['happy_idle', 'happy_walk', 'happy_run', 'knocked_out_falling_to_back', 'shot_to_the_chest_falling_backwards', 'male_driving_a_car', 'laughing_standing', 'big_vegas_pointing_gesture', 'clap_while_standing'],
    'yt': 'end',
    'tags': {'structure': 'sisyphus', 'scenes': ['leaf pile', 'dizzy', 'creeping pile', 'carrot burst', 'sack race', 'dump'], 'cast': ['saxo', 'sadi', 'kob', 'compote'], 'hook': 'dance', 'maps': ['park'], 'ref': 'dog-leaf-pile',
             'lyric_literal': "'fell' (he falls flat into the pile), 'fall' (he dives into the next one), 'stars' (he's seeing stars), 'admiring from afar' (he admires her from inside a pile, then creeps after her in it), 'world' (in the sack, the two in their own little world)",
             'experiment': "Does a seasonal song in its own season (the October surge of a 2018 indie love song, +429k streams a day) with the season's own pet meme (dogs diving into leaf piles), opened on the dance, get more shares per 1,000 views than our non-seasonal story plots?"},
    'shots': shots,
}
json.dump(ep, open(os.path.join(HERE, '2026-10-03-2.json'), 'w'), indent=1, ensure_ascii=False)
print(len(shots), 'shots;', len(WARN), 'warnings')
for w in WARN: print('  ', w)
