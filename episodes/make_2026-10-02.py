# make_2026-10-02.py: writes episodes/2026-10-02.json, "Jamaican (Bam Bam)" (HUGEL & SOLTO (FR); #43 on Spotify's global
# daily chart on 2026-09-30 and the day's second-biggest climber, 804k TikTok videos on its 60 s sound). No clip: the
# official visualizer is a still of the record sleeve (a singer at a mic, a sun) in a jungle, so the world comes from the
# title and the words (whitelisted keywords: Kingston, the sound, "you come and see", woman, lady, man, "nice up
# Jamaica", a chant of "Jamaican" on every other beat, and "bam bam" all over).
# Ours, "the Jamaican bobsled team" (new structure, UNDERDOG: the team nobody believed in turns up in the wrong place
# with the wrong gear, fails at the decisive moment and wins the crowd anyway): four beach pets in yellow-green-black
# racing suits at the Winter Olympics with a bathtub on skis. Cold open on their warm-up dance at the start in the snow
# (the rivals in white stare; Kob already sits in the tub in a mint parka with her milk). The break flashes back to
# Kingston: pushing the tub in the sand (it won't budge), training for the cold in an ice-cream freezer (Kob, in her
# parka, sips her milk beside it), the team photo under the KINGSTON sign, the sound system, the locals coming to see,
# and four coconuts on four heads, one per "bam". Back in the snow: the push start, one jumps in per "bam bam", the tub
# tips over the lip on the last "bam" and the song's own silent bar freezes them looking down. The build is the run; the
# stiff winter crowd starts to dance ("nice up Jamaica") and chants "Jamaican" with the song; on the drop the tub bangs
# the walls on every "bam bam", Sadi screams, Saxo dances instead of steering, Kob sips; the last "bam bam" wrecks it.
# The four fall out of the sky onto the ice one per "bam" (the cat lands on her feet, milk in paw), and they carry the
# bathtub over the finish line on their heads, Kob sitting in it, to a standing ovation: the famous ending, our way.
# Beats: 122.000 BPM, kit beat b at b * 60 / 122 s (kit beat 0 = song beat 168, a downbeat); a bar = 4 beats (1.967 s).
# The kit: b0-8 drop 1's last two bars, b8-56 the break (verse 2: K00 'Kingston' b27.14, K01 'lyrics', K02 'hear the
# sound' b31.5-33.4, K03 'come... see' b35.5-37.7, K04 'bam bam .. bam bam' b38.73 b38.98 b41.48 b41.81, K05/K06 the
# refrain b45.12 45.57 46.99 47.50 / b49.13 49.55 51.00 51.50, K07 b53.80 53.98), b56-72 the sweep (K08-K10 'bam bam'
# b58.74/59.25, b62.75/63.26, b66.75/67.24, K11 'bam' b69.60), b72-76 the song's silent bar, b76-100 the build (K12
# 'woman' b76.92, K13 'lady' b83.96 'man' b86.29, K15 'nice up Jamaica' b90.97-91.95, the chant from b95), b100-148 drop
# 2 (the chant's 'Jamaican' on every odd beat b95-b129, K26 'bam bam' b115.25/115.92, K34 b131.23/131.92, K35
# b135.24/135.93, K36 b137.13 137.56 139.00 139.51, K37 b141.13 141.56 143.00 143.49, K38 b146.40 147.09), the end b148
# (72.79 s) and a 0.45 s tail. The lyrics stay in episodes/2026-10-02.lyrics.js.
import json, math, os, re, sys
sys.path.insert(0, os.path.dirname(__file__))
from cam import view, vpath, low, deadpan, topdown

HERE = os.path.dirname(__file__)
PER = 60 / 122.0
def T(b): return b * PER
def S(b, b0): return round(T(b) - T(b0), 3)    # seconds from shot beat b0 to beat b

LOOK = {'saxo': 'bobsled', 'sadi': 'bobsled', 'kob': 'parka', 'compote': 'bobsled'}
HEAD = {'saxo': 1.42, 'sadi': 1.3, 'kob': 1.4, 'compote': 1.48}   # the top of each head standing (beanies, the bobble hat, the ears)
FACE = {'saxo': 0.9, 'sadi': 0.84, 'kob': 0.88, 'compote': 0.86}
DROP = 0.3                                     # a seated body's head sits ~0.3 m lower than standing (male_driving_a_car)
SEATS = [(-0.28, -1.25), (0.28, -0.42), (-0.28, 0.42), (0.28, 1.25)]   # the tub's seats (local x, z; nose at -z), zigzag: every face shows from a 3/4 lens (review loop 1: in single file only the pilot's did; loop 2: +-0.24 still stacked them)
LIFTS = [0.28, 0.36, 0.44, 0.52]              # stepped up towards the back, stadium seating; high enough that the chest and raised paws clear the rim (loop 3: seated at 0.1 the shoulders were at the rim and the paws hid)
ORDER = ['saxo', 'sadi', 'kob', 'compote']     # the pilot, the second, the passenger with her milk, the brakewoman

def A(who, clip, x, z, **o):
    return {'who': who, 'look': o.pop('look', LOOK[who]), 'clip': clip, 'x': round(x, 3), 'z': round(z, 3), 'face': o.pop('face', 'camera'),
            'yaw': o.pop('yaw', 0), 'at': o.pop('at', 'auto'), **o}
def yaw_to(a, b): return round(math.degrees(math.atan2(b[0] - a[0], b[1] - a[1])), 1)
def rot(lx, lz, psi):                          # a tub-local offset to world (three.js rotation.y = psi)
    p = math.radians(psi); return (lx * math.cos(p) + lz * math.sin(p), -lx * math.sin(p) + lz * math.cos(p))
def seat(tub, k):                              # world mark and lift of seat k in a tub {x, z, yaw}
    dx, dz = rot(SEATS[k][0], SEATS[k][1], tub.get('yaw', 0)); return (tub['x'] + dx, tub['z'] + dz, LIFTS[k] + tub.get('y', 0))
def rider(tub, who, k=None, clip='male_driving_a_car', **o):
    k = ORDER.index(who) if k is None else k
    x, z, lift = seat(tub, k); yaw = (tub.get('yaw', 0) + 180) % 360
    if 'to' in tub:                            # the tub moves over the shot: the rider moves with it, from the same second
        o.setdefault('mx', round(tub['to'][0] - tub['x'], 3)); o.setdefault('mz', round(tub['to'][1] - tub['z'], 3)); o.setdefault('moveAt', tub.get('at', 0))
    lift += o.pop('dlift', 0)                   # dlift: above the seat (a jump in, dropping onto it with `my`)
    return A(who, clip, x, z, face='world', yaw=yaw, lift=round(lift, 3), at=o.pop('at', 0.4), speed=o.pop('speed', 0.6), noShadow=True, **o)
def scream(**o): return dict(arm='both', aim='flail', flapEvery=0.5, **o)            # arms thrown up and out, flailing (caramell's paws by the ears read as chest height in a still, review loop 2)
def groove(**o): return dict(arm='both', aim='rave', flapEvery=1, sway=10, swayEvery=1, **o)   # raise the roof on the beat, the body rocking side to side: dancing in the seat
def kobcup(**o): return {'hold': 'milk', 'arm': 'R', 'aim': 'sip', **o}           # Kob's milk, raised to her mouth every 4th beat
def push(lean=30, **o): return dict(arm='both', aim=[0.1, -0.15, 0.95], lean=lean, **o)   # paws on the tub, the body leaned into it
PUSHR = [0.4, -0.15, 0.9]                      # one paw out and forward onto the tub's side (outward is +x for either arm)

# ---- a projection check (numbers only): where each face lands in the 9:16 frame at the shot's start and end ----
def _proj(cam, look, fov, pt):
    f = [look[i] - cam[i] for i in range(3)]; n = math.sqrt(sum(v * v for v in f)); f = [v / n for v in f]
    r = [-f[2], 0.0, f[0]]; rn = math.sqrt(r[0] ** 2 + r[2] ** 2) or 1; r = [r[0] / rn, 0.0, r[2] / rn]
    u = [r[1] * f[2] - r[2] * f[1], r[2] * f[0] - r[0] * f[2], r[0] * f[1] - r[1] * f[0]]
    d = [pt[i] - cam[i] for i in range(3)]; z = sum(a * b for a, b in zip(d, f))
    if z <= 0.05: return None
    tv = math.tan(math.radians(fov) / 2); th = tv * 9 / 16
    return (0.5 + sum(a * b for a, b in zip(d, r)) / z / th / 2, 0.5 - sum(a * b for a, b in zip(d, u)) / z / tv / 2)
_src = open(os.path.join(HERE, '2026-10-02.lyrics.js')).read()
_rows = json.loads(re.search(r'window\.LYRICS = (.*?);\n', _src).group(1)); _ends = json.loads(re.search(r'window\.LINE_END = (.*?);\n', _src).group(1))
LINES = [((row[0][0] - 0.35) / PER, e / PER) for row, e in zip(_rows, _ends)]
def has_line(b0, b1): return any(a < b1 and b > b0 for a, b in LINES)
WARN = []
def check(beat, b1, lenses, look, fov, actors):
    line = has_line(beat, b1)
    for k, cam in enumerate(lenses):
        end = k == len(lenses) - 1
        for a in actors:
            if a.get('fg'): continue
            who = a['who']; x, z = a['x'] + a.get('mx', 0) * end, a['z'] + a.get('mz', 0) * end
            seated = a['clip'] == 'male_driving_a_car'; lift = a.get('lift', 0) + (a.get('my', 0) if end else 0)
            hy, fy = HEAD[who] - (DROP if seated else 0) + lift, FACE[who] - (DROP if seated else 0) + lift
            top, face = _proj(cam, look, fov, (x, hy, z)), _proj(cam, look, fov, (x, fy, z))
            if not top or not face: WARN.append(f'b{beat}: {who} behind the lens'); continue
            if line and top[1] < 0.26: WARN.append(f'b{beat}: {who} head top at {top[1]:.2f} (lyric rows){" at the end" if end else ""}')
            if face[0] < 0.12 or face[0] > 0.88: WARN.append(f'b{beat}: {who} face x {face[0]:.2f} (edge){" at the end" if end else ""}')
            if face[1] > 0.8: WARN.append(f'b{beat}: {who} face y {face[1]:.2f} (low)')

def offcheck(beat, lenses, look, fov, hidden):   # riders a shot leaves out must stay out of the frame
    for cam in lenses:
        for who, x, z, lift in hidden:
            p = _proj(cam, look, fov, (x, FACE[who] - DROP + lift, z))
            if p and -0.3 < p[0] < 1.3 and -0.15 < p[1] < 1.15: WARN.append(f'b{beat}: left-out {who} in frame at x {p[0]:.2f} y {p[1]:.2f}')

RAD = {'saxo': 0.38, 'sadi': 0.33, 'kob': 0.33, 'compote': 0.33}   # a head's silhouette radius with its ears and hat
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
            r_px = (RAD[w2] / d2 + 0.1 / df) / (2 * math.tan(math.radians(fov) / 2)) * 1920   # the nearer head's disc plus most of the face's own (loop 2: a face centre just outside 0.85 of the disc was half hidden)
            if math.hypot((pf[0] - pc[0]) * 1080, (pf[1] - pc[1]) * 1920) < r_px: out.append(f'{w} behind {w2}')
    return out
def occl_check(beat, lenses, look, fov, actors):
    pts = []
    for a in actors:
        if a.get('fg'): continue
        seated = a['clip'] == 'male_driving_a_car'
        pts.append((a['who'], a['x'], a['z'], FACE[a['who']] - (DROP if seated else 0) + a.get('lift', 0)))
    for k, cam in enumerate(lenses):
        for o in _occl(cam, look, fov, pts): WARN.append(f'b{beat}: {o}{" at the end" if k else ""}')

shots = []
def lens(v, k=0):
    c, f = v; a = math.radians(c['ang'][k]); fy = f[2] if len(f) > 2 else 0
    return (f[0] + math.sin(a) * c['r'][k], c['h'][k] + fy, f[1] + math.cos(a) * c['r'][k])
def add(beat, b1, mp, actors, lyric, v, hidden=(), **o):
    c, focus = v
    o = {k: val for k, val in o.items() if val is not None}
    s = {'beat': beat, 'kind': 'dance', 'map': mp, 'actors': actors, 'lyric': lyric, 'cam': c, 'focus': focus, **o}
    look = (focus[0], c['look'][0] + (focus[2] if len(focus) > 2 else 0), focus[1])
    check(beat, b1, [lens(v, 0), lens(v, -1)], look, c['fov'], actors)
    if hidden: offcheck(beat, [lens(v, 0), lens(v, -1)], look, c['fov'], hidden)
    occl_check(beat, [lens(v, 0), lens(v, -1)], look, c['fov'], actors)
    shots.append(s)

# ================= a lens search with the occlusion test (review loop 1: faces hidden behind the one in front) =================
def subj(a, ph):                                 # an actor as a subject at the shot's start (ph 0) or end (1): (who, x, z, face y, head top y)
    seated = a['clip'] == 'male_driving_a_car'; lift = a.get('lift', 0) + (a.get('my', 0) if ph else 0)
    return (a['who'], a['x'] + a.get('mx', 0) * ph, a['z'] + a.get('mz', 0) * ph, FACE[a['who']] - (DROP if seated else 0) + lift, HEAD[a['who']] - (DROP if seated else 0) + lift)
WHY = {}
def _no(r): WHY[r] = WHY.get(r, 0) + 1; return None
def _ok(cam, look, fov, phases, outs, line, occ=None, below=()):
    worst = 1.0
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
        pts = [(w, x, z, fy) for w, x, z, fy, _ in subs] + [o_ for o_ in (occ or []) if o_[0] not in [s_[0] for s_ in subs]]
        oc = [r_ for r_ in _occl(cam, look, fov, pts) if r_.split(' behind ')[0] in [s_[0] for s_ in subs]]
        if oc: return _no(oc[0])
    for pt_ in below:                             # a sign that must read: under the lyric rows, inside the frame
        q = _proj(cam, look, fov, pt_)
        if not q or q[1] < 0.33 or q[1] > 0.9 or not 0.02 < q[0] < 0.98: return _no(f'sign {pt_}')   # the karaoke's two rows reach 0.3 of the height
    for w, x, z, lift in outs:                    # the riders a shot leaves out: their whole head off the frame
        p = _proj(cam, look, fov, (x, FACE[w] - DROP + lift, z))
        if p and -0.35 < p[0] < 1.35 and -0.2 < p[1] < 1.2: return _no(f'{w} not out')
    return worst
def lens_for(actors, ang, dist, hs=(1.6,), fov=50, look=None, spread=40, dr=(0.8, 1.5), line=True, free=None, push=0.06, out=(), below=(), **o):
    vis = [a for a in actors if not a.get('fg')]
    phases = [[subj(a, 0) for a in vis], [subj(a, 1) for a in vis]]
    occ = [subj(a, 0)[:4] for a in actors if a.get('fg')]
    allp = phases[0] + phases[1]
    cx = sum(s_[1] for s_ in allp) / len(allp); cz = sum(s_[2] for s_ in allp) / len(allp); ly = sum(s_[3] for s_ in allp) / len(allp) + 0.06
    L = look or (cx, ly, cz); best = None; WHY.clear(); nfree = 0
    for da in range(-spread, spread + 1, 5):
        for k in range(13):
            d = dist * (dr[0] + (dr[1] - dr[0]) * k / 12)
            for h in hs:
                a = math.radians(ang + da); cam = (L[0] + math.sin(a) * d, h, L[2] + math.cos(a) * d)
                if free and not free(cam): nfree += 1; continue
                f = _ok(cam, L, fov, phases, out, line, occ, below)
                if f is None or f < 0: continue
                score = abs(da) / 40 + abs(d - dist) / dist + (0.25 - min(f, 0.25))
                if best is None or score < best[0]: best = (score, cam)
    if best is None:
        a = math.radians(ang); cam = (L[0] + math.sin(a) * dist, hs[0], L[2] + math.cos(a) * dist)
        why = [f"{w}: face {_proj(cam, L, fov, (x, fy, z))}" for w, x, z, fy, ty in allp]
        raise SystemExit(f'no lens for {[s_[0] for s_ in phases[0]]} round {ang} deg at {dist} m; at the preferred lens: {why}; occluded: {_occl(cam, L, fov, [(w, x, z, fy) for w, x, z, fy, _ in phases[0]])}; rejections: {sorted(WHY.items(), key=lambda kv: -kv[1])[:6]}, not free: {nfree}')
    cam = best[1]; p1 = (cam[0] + (L[0] - cam[0]) * push, cam[1], cam[2] + (L[2] - cam[2]) * push)
    return view(tuple(round(c, 3) for c in cam), tuple(round(c, 3) for c in L), fov, p1=tuple(round(c, 3) for c in p1), **o)
def clear_line(v, depth=3.6, r=1.3):
    c, f = v; out = []
    for k in (0, -1):
        p = lens(v, k); dx, dz = f[0] - p[0], f[1] - p[2]; n = math.hypot(dx, dz) or 1
        out += [[round(p[0] + dx / n * d, 2), round(p[2] + dz / n * d, 2), r] for d in [0.0] + [depth * i / 4 for i in range(1, 5)]]
    return out
def clear_frustum(v, depth=4.5, r=0.9):        # clear every fan and lamp in the view's wedge out to `depth` m (a fan in a red parka by a lens outside the wall filled a third of the frame, loop 2)
    c, f = v; out = []; hf = math.atan(math.tan(math.radians(c['fov']) / 2) * 9 / 16) + 0.12
    for k in (0, -1):
        p = lens(v, k); dx, dz = f[0] - p[0], f[1] - p[2]; n = math.hypot(dx, dz) or 1; fx, fz = dx / n, dz / n; rx, rz = -fz, fx
        d = 0.0
        while d <= depth + 1e-6:
            half = d * math.tan(hf) + r * 0.5; m = max(1, int(math.ceil(half * 2 / r)))
            out += [[round(p[0] + fx * d + rx * (-half + 2 * half * i / m), 2), round(p[2] + fz * d + rz * (-half + 2 * half * i / m), 2), r] for i in range(m + 1)]
            d += r * 0.8
    return out
def ice_free(tub, side_ok=False):               # inside the channel or above its walls; never inside the tub
    def f(c):
        x, y, z = c
        if abs(x - tub['x']) < 0.8 and abs(z - tub['z']) < 2.0 and y < 1.75: return False
        if 1.1 < abs(x) < 2.1 and y < 1.25 and not side_ok: return False
        return True
    return f
def king_free(c):
    x, y, z = c
    for bx, bz, rx, rz, h in [(3.7, -1.4, 1.6, 0.7, 1.0), (5.4, -4.4, 1.9, 1.6, 3.2), (-3.5, -3.8, 1.3, 0.6, 3.1), (5.75, -1.0, 0.4, 0.4, 0.5)]:
        if abs(x - bx) < rx and abs(z - bz) < rz and y < h: return False
    return True

# ================= the places =================
TS = {'x': 0.0, 'z': -3.0, 'yaw': 0}           # the ice track's start: the tub on the ramp, nose to -z, the lip at z -7.5
HOOKZ = 1.0                                    # the three dance behind the tub, in front of the start line's crowd
TR = {'x': 0.0, 'z': 0.0, 'yaw': 0}            # the run: the tub still at the origin, the channel scrolling
ROWZ, ROWX = -4.6, [-1.5, -0.5, 0.5, 1.5]      # the team photo's row (by ORDER), in front of the KINGSTON sign, under the coconut palm
FRZ = (3.7, -1.4)                              # the ice-cream freezer (2.9 m wide)
CRATE = (5.75, -1.0, 0.34)                     # Kob's crate by the freezer
SND = (-3.5, -3.8)                             # the sound system
LIP = -7.5
SLOPE = 0.445                                  # tan 24 deg: past the lip the channel falls 0.445 m a metre
RUN_ICE = {'zone': 'run'}
def left_out(only, tub=TR): return [(w, *seat(tub, ORDER.index(w))) for w in ORDER if w not in only]
DANCE = dict(clip='charleston', at=0.25, speed=1.0)   # the team's warm-up: charleston's kick lands 0.45 s and 1.35 s into the shot
TUBFREE = lambda c: not (abs(c[0]) < 0.8 and abs(c[2]) < 2.0 and c[1] < 1.75)   # anywhere but inside the tub (a lens outside a wall hides that wall and clears its fans)

# ================= the hook (b0-8): the warm-up dance at the start, in the snow =================
H3 = [('saxo', 0.0, HOOKZ), ('sadi', -1.02, HOOKZ + 0.2), ('compote', 1.02, HOOKZ + 0.2)]
v = low((0.15, 0.5, HOOKZ - 4.6), (0.0, 0.9, HOOKZ), (0.12, 0.5, HOOKZ - 4.0), fov=60, roll=(-5, -3))
add(0, 4, 'icetrack', [A(w, DANCE['clip'], x, z, face='world', yaw=180, at=DANCE['at'], speed=1.0) for w, x, z in H3],
    "HOOK (drop 1's last bars): the Winter Olympics' start at night, in the snow: three pets in yellow, green and black racing suits do their warm-up dance in sync (a charleston kick), the crowd behind the start line",
    v, zone='start', rivals=[0.0, HOOKZ], fans='cheer', stars=['saxo'])
# the bathtub's reveal: a low 3/4 from the front, the rolled rim, clawfeet, skis and JAM side, Kob seated in it; Saxo and Sadi dance in the lanes beside it
k2 = [A('kob', 'male_driving_a_car', -0.24, TS['z'] + 0.42, face='world', yaw=180, at=0.4, lift=0.2, speed=0.6, noShadow=True, hold='milk'), A('saxo', DANCE['clip'], -0.98, TS['z'] - 0.2, face='world', yaw=180, at=1.2), A('sadi', DANCE['clip'], 0.98, TS['z'] + 0.5, face='world', yaw=180, at=1.2)]   # loop 3's fallback: round 2's reveal, which passed, as it was
v = ({'steady': True, 'ang': [-160, -160], 'r': [6.095, 5.73], 'h': [1.4, 1.4], 'look': [0.85, 0.85], 'fov': 48}, [0, -2.9])
add(4, 8, 'icetrack', k2,
    "drop 1: the reveal: their sled is a white clawfoot bathtub on wooden skis, painted yellow, green and black (JAM); Kob sits in it in a mint parka sipping her milk, deadpan, while Saxo and Sadi dance either side",
    v, zone='start', tub=dict(TS), rivals=[0.0, TS['z']], fans='cheer', hideWall=-1, clear=clear_line(v), stars=['kob'])

# ================= the break (b8-56): flashback to Kingston =================
TK = {'x': 0.8, 'z': 1.2, 'yaw': 90}           # nose to -x, inland of the freezer (loop 2: the freezer hid Sadi); Kob in the front seat faces the lens
def tk(lx, lz): d = rot(lx, lz, TK['yaw']); return (round(TK['x'] + d[0], 3), round(TK['z'] + d[1], 3))
PUSH3 = [('saxo', -0.55), ('compote', 0.0), ('sadi', 0.55)]   # across the tail (tub-local x), 0.45 m behind it, either side of the taps
pushers = [A(w, 'happy_run', *tk(lx, 2.25), face='world', yaw=270, at=0.2 + 0.35 * i, speed=1.6, **push(lean=22 if w == 'compote' else 18)) for i, (w, lx) in enumerate(PUSH3)]   # leaned 30-38 the chibi heads hid their faces (loop 3)
k3 = [rider(TK, 'kob', k=0, fg=True, **kobcup())] + pushers   # from behind: Kob rides at the front, the pushers in the foreground
v = lens_for(k3, 70, 3.6, hs=(1.2, 1.4, 1.6), fov=52, free=king_free, spread=20, dr=(0.85, 1.4))   # loop 3's fallback: behind the pushers (S14's grammar, which passed): backs bent into the tail, Kob ahead, the beach beyond
add(8, 12, 'kingston', k3,
    "the break, flashback: Kingston in the sun, the sea, palms: from behind them, the team trains the push start on the sand; three of them shove the bathtub flat out, leaned into its tail, sand flying, and it doesn't move an inch; Kob sits in front with her milk",
    v, tub=dict(TK, taps=False), puffs=[list(tk(lx, 2.6)) for _, lx in PUSH3], hide=['freezer', 'crate'], noguests=True, stars=['compote'])
TAIL = tk(0.0, 2.45)
c4 = A('compote', 'happy_run', *TAIL, face='world', yaw=270, at=0.2, speed=1.6, **push(lean=8))   # barely leaned: a chibi leaned 20 deg looks at its feet and hides its face (loop 3)
v = view((TAIL[0] - 1.45, 1.85, TAIL[1] + 1.95), (TAIL[0] - 0.15, 0.92, TAIL[1] + 0.05), 44, p1=(TAIL[0] - 1.38, 1.83, TAIL[1] + 1.85))   # loop 3's fallback: her face over the tub's tail corner, 40 deg off her nose and above the rim, the close-up grammar (S32); no taps on the beach
add(12, 16, 'kingston', [c4, rider(TK, 'kob', k=0, fg=True, **kobcup())],
    "the break: her face over the tub's tail: Compote leaned into it with all her fury, paws on the rim, legs pumping, sand kicked up behind her on the beat, getting nowhere",
    v, tub=dict(TK, taps=False), puffs=[[TAIL[0] + 0.35, TAIL[1]]], hide=['freezer', 'crate'], noguests=True, stars=['compote'])
fx = [FRZ[0] - 0.88, FRZ[0], FRZ[0] + 0.88]
v = view((FRZ[0] + 0.0, 1.45, FRZ[1] + 4.75), (FRZ[0], 0.86, FRZ[1]), 52, p1=(FRZ[0], 1.43, FRZ[1] + 4.6))
add(16, 20, 'kingston', [A(w, 'male_driving_a_car', x, FRZ[1] - 0.05, face='world', yaw=0, at=0.4, speed=0.3, sway=3, swayEvery=0.25, lift=0.18, noShadow=True) for w, x in zip(['sadi', 'saxo', 'compote'], fx)],
    "the break: cold training: Saxo, Sadi and Compote sit in the beach bar's ice-cream freezer up to their necks, frost on the rims, shivering",
    v, lid=1, mist=True, stars=['saxo'])
# Kob on her crate, the freezer 1.5-2 m behind her shoulder with two shivering heads beside hers (loop 2: the freezer sat empty at the edge)
k6 = A('kob', 'male_driving_a_car', CRATE[0], CRATE[1], face='camera', at=0.4, speed=0.3, lift=CRATE[2] - 0.08, **kobcup())
k6b = [A(w, 'male_driving_a_car', x, FRZ[1] - 0.05, face='world', yaw=0, at=0.4, speed=0.3, sway=3, swayEvery=0.25, lift=0.18, noShadow=True, fg=(w == 'sadi')) for w, x in zip(['sadi', 'saxo', 'compote'], fx)]
v = lens_for([k6] + k6b, 18, 5.4, hs=(1.35, 1.5, 1.65), fov=50, free=lambda c: king_free(c) and c[0] < 6.6, spread=12, dr=(0.9, 1.3))   # loop 3's fallback: the freezer from the front (S05's grammar, passed in every round), turned 18 deg to take in Kob's crate; Sadi's end out of the frame
add(20, 24, 'kingston', [k6] + k6b,
    "the break: on a crate beside the freezer, Kob in her mint parka, pink scarf and bobble hat sips her milk in the sun, deadpan, while the three shiver in the freezer just behind her: the only one dressed for snow",
    v, lid=1, mist=True, noguests=True, stars=['kob'])
v = view((0.0, 1.3, ROWZ + 8.3), (0.0, 1.0, ROWZ), 50, p1=(0.0, 1.29, ROWZ + 8.0))
add(24, 28, 'kingston', [A(w, 'happy_idle', x, ROWZ, face='world', yaw=0, at=0.4 + i * 0.3, speed=0.5, **({'hold': 'milk'} if w == 'kob' else {})) for i, (w, x) in enumerate(zip(ORDER, ROWX))],
    "K00 'Kingston' (b27.14): the team photo: the four in a row under the coconut palm, in front of the hand-painted KINGSTON sign, proud",
    v, stars=['saxo'])
SY = (SND[0] + 0.55, SND[1] + 2.2)
v = low((SY[0] + 0.25, 0.4, SY[1] + 5.1), (SY[0], 0.9, SY[1]), (SY[0] + 0.2, 0.4, SY[1] + 4.7), fov=62, roll=(6, 4))
add(28, 34, 'kingston', [A('saxo', DANCE['clip'], *SY, face='world', yaw=0, at=0.25), A('sadi', DANCE['clip'], SY[0] - 0.92, SY[1] + 0.3, face='world', yaw=0, at=0.25),
                         A('compote', DANCE['clip'], SY[0] + 0.92, SY[1] + 0.3, face='world', yaw=0, at=0.25)],
    "K01 'lyrics' / K02 'hear the sound' (b31.5-33.4): the sound system: speaker boxes stacked three high, cones pumping; the three do their warm-up dance in sync in front of it, the charleston kick together",
    v, stars=['saxo'])
v = view((SY[0] + 1.2, 3.4, SY[1] + 6.5), (SY[0], 0.8, SY[1] - 0.2), 50, p1=(SY[0] + 1.1, 3.3, SY[1] + 6.2))
add(34, 38, 'kingston', [A('saxo', DANCE['clip'], *SY, face='world', yaw=0, at=0.25), A('sadi', DANCE['clip'], SY[0] - 1.0, SY[1] + 0.3, face='world', yaw=0, at=0.25),
                         A('compote', DANCE['clip'], SY[0] + 1.0, SY[1] + 0.3, face='world', yaw=0, at=0.25)],
    "K03 'come... see' (b35.5-37.7): the beach locals come to see, crowding round the dancers in a ring, cheering",
    v, gather=[SY[0], SY[1], 2.6, -100, 100], cheer=True, stars=['saxo'])
def rowx(w): return ROWX[ORDER.index(w)]
CROWN = {'saxo': 1.38, 'sadi': 1.26, 'kob': 1.36, 'compote': 1.18}   # where a coconut lands: the beanie or bobble top between the ears (Compote's ears stand 0.3 m above it)
def bonk(w, b, b0, top=3.4): return [S(b, b0), rowx(w), ROWZ, CROWN[w], top]
FLINCH = dict(bumpAmp=0.12)                    # a startled hop on the bonk (a duck sank into the sand: the floor rule cancels it, and the shadow went with it, loop 2)
v = view((-0.85, 1.15, ROWZ + 4.3), (-1.0, 1.02, ROWZ), 48, p1=(-0.85, 1.15, ROWZ + 4.1))
add(38, 40, 'kingston', [A('saxo', 'happy_idle', rowx('saxo'), ROWZ, face='world', yaw=0, at=0.4, speed=0.5, bumps=[S(38.73, 38)], **FLINCH),
                         A('sadi', 'happy_idle', rowx('sadi'), ROWZ, face='world', yaw=0, at=0.7, speed=0.5, bumps=[S(38.98, 38)], **FLINCH)],
    "K04 'bam bam' (b38.73/b38.98): posing again under the palm: a coconut drops on Saxo's head (bam, a ring and stars, he jumps), then on Sadi's (bam)",
    v, coconuts=[bonk('saxo', 38.73, 38), bonk('sadi', 38.98, 38)], stars=['saxo'])
v = view((1.0, 1.15, ROWZ + 5.0), (1.0, 0.98, ROWZ), 48, p1=(1.0, 1.15, ROWZ + 4.8))
add(40, 42, 'kingston', [A('kob', 'happy_idle', rowx('kob'), ROWZ, face='world', yaw=0, at=0.5, speed=0.3, **kobcup()),
                         A('compote', 'happy_idle', rowx('compote'), ROWZ, face='world', yaw=0, at=0.4, speed=0.5, bumps=[S(41.48, 40)], **FLINCH)],
    "K04 'bam bam' (b41.48/b41.81): then on Compote's (bam, she jumps), and on Kob's bobble hat (bam): she doesn't even blink, sipping",
    v, coconuts=[bonk('compote', 41.48, 40, 2.6), bonk('kob', 41.81, 40, 2.6)], stars=['compote'])
# the practice run along the beach at last: the tub (Saxo, Sadi, Kob in it) coming at a front 3/4 lens, the sea behind, Compote pushing at the tail; it hops on every 'bam'
TKR = {'x': 0.3, 'z': -1.4, 'yaw': 180, 'to': [0.3, -0.8], 'at': 0.0}   # 0.6 m over the shot (2 m swept the group across a fixed lens)
hitsK = [S(b, 42) for b in [45.12, 45.57, 46.99, 47.50, 49.13, 49.55]]
cpush = A('compote', 'happy_run', TKR['x'] + 0.8, TKR['z'] - 2.0, face='world', yaw=0, at=0.2, speed=1.6, mx=0.0, mz=0.6, **push(lean=32))
k12 = [rider(TKR, 'saxo', bumps=hitsK, **groove()), rider(TKR, 'sadi', bumps=hitsK, **scream()), rider(TKR, 'kob', bumps=hitsK, **kobcup()), cpush]
v = lens_for(k12, 14, 5.2, hs=(2.2, 2.5, 2.8), fov=52, free=king_free, spread=16, dr=(0.85, 1.5))   # loop 3's fallback: the front-high grammar (S34, passed), Compote shoving outboard on the lens' side
add(42, 50, 'kingston', k12,
    "K05/K06 the refrain, eight 'bam's (b45-b51.5): the practice run along the beach at last: Compote pushes, leaned in; Saxo rides paws up, Sadi flails, Kob sips; the tub bounces on every 'bam'",
    v, tub=dict(TKR), hits=[[h, 1] for h in hitsK], stars=['saxo'])

# ================= back in the snow (b50-56): the start =================
RIV = [[-2.0, 0.2, 0.86], [-2.1, 1.2, 0.86], [2.0, 0.3, 0.86], [2.1, 1.3, 0.86]]   # the rivals' crews in white on the banks right beside our tub, staring at it (by the start lights, 5 m back, they were specks)
k13 = [rider(TS, 'kob', **kobcup()), A('saxo', 'happy_idle', -0.88, TS['z'] - 0.6, face='world', yaw=180, at=0.3, speed=0.5),
       A('sadi', 'happy_idle', 0.88, TS['z'] - 0.2, face='world', yaw=180, at=0.6, speed=0.5), A('compote', 'happy_idle', -0.95, TS['z'] + 1.6, face='world', yaw=180, at=0.2, speed=0.5, fg=True)]
v = lens_for(k13, 180, 6.4, hs=(1.6, 1.8, 2.0, 2.2, 2.5), fov=52, free=ice_free(TS), spread=25, dr=(0.85, 1.5),
             below=[(-1.55, 2.4, 2.0), (1.55, 2.4, 2.0), (-2.05, 1.95, 0.7), (2.05, 1.95, 0.8), (0.0, 3.05, 6.65)])
add(50, 56, 'icetrack', k13,
    "K07 'bam bam' (b53.80/b53.98): back at the Olympics, at night: the team lines up round the bathtub at the top of the run, the rival crews in white staring from the banks by the start lights; the lights go green on the 'bam'",
    v, zone='start', tub=dict(TS), rivals=[0.0, TS['z']], rivalPos=RIV, sledPos=[[-2.5, 0.9, 0, 1.16], [2.5, 1.0, 0, 1.16]], go=S(53.8, 50),
    clear=clear_line(v) + [[r[0], r[1], 0.75] for r in RIV], stars=['saxo'])

# ================= the sweep (b56-72): the push start, one jumps in per 'bam' =================
def pushers_at(tub, mz, saxo=True, sadi=True, compote=True, ph=0.0):
    out = []
    if saxo: out.append(A('saxo', 'happy_run', tub['x'] - 0.98, tub['z'] - 0.5, face='world', yaw=180, at=0.3 + ph, speed=1.5, mz=mz, arm='R', aim=PUSHR, lean=28))
    if sadi: out.append(A('sadi', 'happy_run', tub['x'] + 0.98, tub['z'] - 0.1, face='world', yaw=180, at=0.7 + ph, speed=1.5, mz=mz, arm='L', aim=PUSHR, lean=28))
    if compote: out.append(A('compote', 'happy_run', tub['x'] + 0.38, tub['z'] + 2.25, face='world', yaw=180, at=0.2 + ph, speed=1.6, mz=mz, **push(lean=34)))
    return out
TP = {'x': 0.0, 'z': TS['z'], 'yaw': 0, 'to': [0.0, TS['z'] - 1.0], 'at': 0.0}
l1 = [S(58.74, 56), S(59.25, 56)]
k14 = [dict(a, fg=a['who'] != 'compote') for a in pushers_at(TP, -1.0)] + [rider(TP, 'kob', **kobcup())]   # from behind: backs; the side pushers are framing, not subjects
v = lens_for(k14, 20, 4.6, hs=(0.9, 1.1, 1.3), fov=52, free=ice_free(TP), spread=20, dr=(0.8, 1.6))
add(56, 60, 'icetrack', k14,
    "K08 'bam bam' (b58.74/b59.25): GO: from behind the tail, low, the run and the lip ahead: Saxo, Sadi and Compote shove off, leaned in, running flat out; the tub bounds on each 'bam'",
    v, zone='start', tub=dict(TP), hops=l1, fans='cheer', go=-1, clear=clear_frustum(v, 3.0), stars=['compote'])
TP2 = {'x': 0.0, 'z': TS['z'] - 1.0, 'yaw': 0, 'to': [0.0, TS['z'] - 1.5], 'at': 0.0}
k15a = [dict(a, fg=a['who'] != 'saxo') for a in pushers_at(TP2, -0.5, ph=0.2)] + [rider(TP2, 'kob', fg=True, **kobcup())]
v = lens_for(k15a, 215, 3.4, hs=(0.6, 0.8, 1.0), fov=54, free=TUBFREE, spread=20, dr=(0.85, 1.5))
add(60, 62, 'icetrack', k15a,
    "the push: low, front-left: Saxo sprinting beside the nose, leaned in, about to leap",
    v, zone='start', tub=dict(TP2), fans='cheer', go=-1, hideWall=-1, clear=clear_frustum(v, 3.0), stars=['saxo'])
TP3 = {'x': 0.0, 'z': TS['z'] - 1.5, 'yaw': 0, 'to': [0.0, TS['z'] - 2.0], 'at': 0.0}
l2 = [S(62.75, 62), S(63.26, 62)]
k15b = [rider(TP3, 'saxo', bumps=l2[:1], dlift=0.3, my=-0.3, myAt=round(l2[0] - 0.2, 3), myDur=0.2, air=True, **groove()), rider(TP3, 'kob', fg=True, **kobcup())] + [dict(a, fg=True) for a in pushers_at(TP3, -0.5, saxo=False, ph=0.4)]   # loop 3's fallback: a close-up on Saxo plopping into his seat on the word (the cannonball read as standing on air)
v = lens_for(k15b, 200, 2.5, hs=(1.5, 1.7, 1.9), fov=44, free=TUBFREE, spread=20, dr=(0.9, 1.4))
add(62, 64, 'icetrack', k15b,
    "K09 'bam bam' (b62.75/b63.26): front three-quarter: Saxo in the air, paws up, cannonballing into the front seat on the 'bam'; Sadi runs alongside, Compote shoves the tail",
    v, zone='start', tub=dict(TP3), hops=l2, fans='cheer', go=-1, hideWall=1, clear=clear_frustum(v), stars=['saxo'])
TP4a = {'x': 0.0, 'z': TS['z'] - 2.0, 'yaw': 0, 'to': [0.0, TS['z'] - 2.5], 'at': 0.0}
k16a = [rider(TP4a, 'saxo', **groove()), rider(TP4a, 'kob', **kobcup())] + pushers_at(TP4a, -0.5, saxo=False, ph=0.6)
v = lens_for(k16a, 8, 3.6, hs=(2.5, 2.8), fov=54, free=ice_free(TP4a), spread=15, dr=(0.85, 1.4))
add(64, 66, 'icetrack', k16a,
    "the push: from behind and above, the lip ahead: Sadi and Compote still shoving, Saxo in front paws up, Kob sipping",
    v, zone='start', tub=dict(TP4a), fans='cheer', go=-1, stars=['sadi'])
TP5 = {'x': 0.0, 'z': TS['z'] - 2.5, 'yaw': 0, 'to': [0.0, TS['z'] - 2.8], 'at': 0.0}
l3 = [S(66.75, 66), S(67.24, 66)]
k16b = [rider(TP5, 'saxo', fg=True, **groove()), rider(TP5, 'kob', fg=True, **kobcup()),
        rider(TP5, 'sadi', bumps=l3[:1], dlift=0.3, my=-0.3, myAt=round(l3[0] - 0.2, 3), myDur=0.2, air=True, **scream()),
        rider(TP5, 'compote', bumps=l3[1:], dlift=0.6, my=-0.6, myAt=round(l3[1] - 0.3, 3), myDur=0.3, air=True, fg=True)]   # loop 3's fallback: a close-up on Sadi landing in her seat, Compote dropping in behind her
v = lens_for(k16b, 160, 2.6, hs=(1.6, 1.8, 2.0), fov=44, free=TUBFREE, spread=20, dr=(0.9, 1.4))
add(66, 68, 'icetrack', k16b,
    "K10 'bam bam' (b66.75/b67.24): Sadi drops into her seat (bam), Compote into the back seat (bam): all four in, sliding for the lip",
    v, zone='start', tub=dict(TP5), hops=l3, fans='cheer', go=-1, hideWall=1, clear=clear_frustum(v), stars=['compote'])
TP4 = {'x': 0.0, 'z': LIP + 1.75 - 0.05, 'yaw': 0, 'pitch': -14, 'pitchAt': S(69.6, 68) - 0.25}
def tipped(w): return round(0.242 * SEATS[ORDER.index(w)][1], 3)   # how far a seat drops (-) or rises when the tub pitches 14 deg nose down
k17 = [rider(TP4, w, my=tipped(w), myAt=TP4['pitchAt'], myDur=0.5, fg=w == 'compote', **(kobcup() if w == 'kob' else groove() if w == 'saxo' else {})) for w in ORDER]
over = lambda c: c[2] < LIP - 1.5 and c[1] > -(LIP - c[2]) * SLOPE + 1.6 and abs(c[0]) < 2.5
v = view((0.95, -1.0, -10.7), (0.0, 0.62, -6.7), 50, p1=(0.9, -0.98, -10.5))   # loop 3's fallback: from 3.5 m down the slope, 1 m under the lip, 12 deg right (the chute's wall stops a wider angle): the lit edge a hard line, the nose tipping over it
add(68, 72, 'icetrack', k17,
    "K11 'bam' (b69.60): from past the lip, front-right: the bathtub's nose tips over the edge on the word, the shaded slope and the chute falling away below it, the faces above the rim",
    v, zone='start', tub=dict(TP4), fans='watch', go=-1, stars=['saxo'])
# the song's silent bar: from 1.4-2 m above the slope, in front and off the axis, four faces staring down the drop
k18 = [rider(TP4, w, lean=14, dlift=tipped(w), fg=w == 'compote', **({**kobcup()} if w == 'kob' else {'holdAt': 0.0})) for w in ORDER]   # the brakewoman at the back is the one the stagger can't free
beyond2 = lambda c: c[2] < LIP - 1.5 and c[1] > -(LIP - c[2]) * SLOPE + 1.2 and abs(c[0]) < 4.0
v = lens_for(k18, 165, 4.6, hs=(0.4, 0.8, 1.2, 1.6, 2.0), fov=52, free=beyond2, spread=25, dr=(0.85, 1.3), push=0.0)
add(72, 76, 'icetrack', k18,
    "the song's silent bar (b72-76): frozen at the lip, leaning over it: four faces staring down the icy drop at the lens, blank; only Kob, sipping",
    v, zone='start', tub=dict(TP4, pitchAt=-1), fans='watch', stop=0.0, still=True, go=-1, hideWall=1, stars=['saxo'])

# ================= the build (b76-100): the run =================
def ride(only=ORDER, **per):                   # the riders in the run's tub; per: {who: {extra fields}}; only: who the shot features (the others ride along as cropped neighbours, fg)
    out = []
    for w in ORDER:
        o = dict(per.get(w, {}))
        if w not in only: o['fg'] = True
        if w == 'kob': o = {**kobcup(), **o}
        out.append(rider(TR, w, **o))
    return out
SH = 0.72                                      # the shove into a wall on a hit: the tub's side meets the wall (half-width 0.59, the wall's face at 1.3)
def hitride(H, sides, only=ORDER, **per):      # every rider jolted on the hits and slid into the walls with the tub
    sh = [[h, sd * SH] for h, sd in zip(H, sides)]
    return ride(only, **{w: {'bumps': list(H), 'shove': sh, **per.get(w, {})} for w in ORDER})
GRIP = {'arm': 'both', 'aim': [0.35, -0.55, 0.45]}   # Compote gripping the rim, glaring
k19 = ride(only=('saxo', 'sadi', 'kob'), saxo=groove(), sadi=scream(), compote=GRIP)
v = lens_for(k19, 192, 4.6, hs=(2.2, 2.5, 2.8), fov=54, free=TUBFREE, spread=12, dr=(0.85, 1.4), hand=0.8, look=(-0.3, 0.9, -0.3))   # loop 3's fallback: the front-high grammar (S34, passed)
add(76, 80, 'icetrack', k19,
    "K12 'woman' (b76.92): they plunge: front, high: Saxo at the front paws up, Sadi flailing, Kob sipping, Compote gripping the rim behind them",
    v, **RUN_ICE, speed=13, tub=dict(TR), fans='watch', clear=clear_frustum(v, 3.0), stars=['saxo'])
k20 = ride(only=('compote',), saxo=groove(), sadi=scream(), compote=GRIP)   # loop 3's fallback: a close-up on Compote (the grammar of Kob's, S32): side-on rows never fit the 9:16 frame
v = lens_for(k20, 150, 3.0, hs=(1.8, 2.0, 2.2), fov=40, free=TUBFREE, dr=(0.9, 1.4), spread=20, hand=0.5)
add(80, 84, 'icetrack', k20,
    "K12 'one' / K13 'lady' (b82.29/b83.96): close on Compote at the back, gripping the rim, glaring, the fans streaking past",
    v, **RUN_ICE, speed=15, tub=dict(TR), fans='watch', clear=clear_frustum(v, 3.0), stars=['compote'])
v = topdown((0.0, -0.3), 6.8, 6.3, fov=54, roll=(0, 8))
add(84, 88, 'icetrack', ride(saxo=groove(), sadi=scream()),
    "K13 'man' (b86.29): from above: four heads in a bathtub, racing down the ice",
    v, **RUN_ICE, speed=16, tub=dict(TR), fans='watch', stars=[])
v = view((-1.1, 1.75, 2.2), (2.4, 1.85, 8.4), 50, p1=(-1.05, 1.75, 2.1), roll=[-2, 0], hand=0.4)   # loop 3's fallback: from the near wall top, down the far bank: its fans recede, a row of them whole, level with their faces
add(88, 92, 'icetrack', [],
    "K15 'nice up Jamaica' (b90.97-91.95): from the wall top across the channel: the stiff winter crowd on the bank starts to dance, paws up in a V, the pines behind",
    v, hidden=left_out(()), **RUN_ICE, speed=16, tub=dict(TR), fans='cheer', noLamps=True, stare=[-1.1, 2.2], stars=[])
k23 = ride(only=('saxo', 'sadi'), saxo=groove(), sadi=groove())
v = lens_for(k23, 168, 4.2, hs=(2.2, 2.5, 2.8), fov=52, free=TUBFREE, spread=10, dr=(0.85, 1.3), hand=0.6, roll=[5, 2], look=(0.0, 0.9, -0.8))   # loop 3's fallback: the front-high grammar (S34) from the right
add(92, 96, 'icetrack', k23,
    "the chant begins (b95): front-right, high: in the tub, Saxo and Sadi dance in their seats, paws up in a V against the white ice",
    v, **RUN_ICE, speed=17, tub=dict(TR), fans='dance', hideWall=1, clear=clear_frustum(v, 6.0), stars=['saxo'])
k24 = ride(saxo=groove(), sadi=groove(), compote=groove())
v = view((-1.0, 2.6, 5.4), (0.0, 0.95, -0.6), 50, p1=(-0.95, 2.55, 5.15), hand=0.5)
add(96, 100, 'icetrack', k24,
    "'Jamaican' (b97/b99): from behind and above: the bathtub racing down the long lit channel, fans on both banks",
    v, **RUN_ICE, speed=18, tub=dict(TR), fans='dance', stars=['saxo'])

# ================= drop 2 (b100-148): the run, the hits, the wreck, the finish =================
k25 = ride(saxo=groove(), sadi=groove(), compote=groove())
v = topdown((0.0, -0.2), 7.0, 6.5, fov=54, roll=(0, -10))   # loop 3's fallback: the top-down grammar (S23, passed): three pairs of paws pumping, Kob's cup
add(100, 104, 'icetrack', k25,
    "drop 2, 'Jamaican' on every other beat: low over the left wall: three of them dancing in their seats, paws up, Kob sipping",
    v, **RUN_ICE, speed=21, tub=dict(TR), fans='chant', hideWall=-1, clear=clear_frustum(v, 6.0), stars=['saxo'])
k26 = [dict(a, fg=True) for a in ride(saxo=groove(), sadi=groove(), compote=groove())]
v = view((0.0, 1.4, 9.4), (0.0, 1.0, -8.0), 50, p1=(0.0, 1.38, 9.0), roll=[3, 1], hand=0.5)   # loop 3's fallback: 9 m behind, the tub small ahead, the near fans big, as the reviewer asked
add(104, 108, 'icetrack', k26,
    "the chant: from the channel's centre behind the tub, looking down the run: both banks converge, the fans turned to the lens jumping on every 'Jamaican', paws up; the tub small ahead",
    v, **RUN_ICE, speed=21, tub=dict(TR), fans='chant', stare=[0.0, 6.2], stars=[])
k27 = ride(only=('saxo', 'sadi', 'kob'), saxo=groove(), sadi=scream(), compote=GRIP)
v = lens_for(k27, 186, 4.4, hs=(2.4, 2.7, 3.0), fov=54, free=TUBFREE, spread=12, dr=(0.85, 1.4), hand=0.8, look=(-0.3, 0.9, -0.3))   # loop 3's fallback: the front-high grammar (S34) from the left, a little lower
add(108, 112, 'icetrack', k27,
    "the chant: front-right, low: Compote at the back gripping the rim, glaring; Kob sipping; Sadi flailing; Saxo dancing at the front",
    v, **RUN_ICE, speed=21, tub=dict(TR), fans='chant', hideWall=1, clear=clear_frustum(v, 6.0), stars=['compote'])
H1 = [S(115.25, 112), S(115.92, 112)]
k28 = hitride(H1, [1, -1], only=('saxo', 'sadi', 'kob'), saxo=groove(), sadi=scream())
v = lens_for(k28, 168, 4.6, hs=(2.2, 2.5, 2.8), fov=54, free=TUBFREE, spread=12, dr=(0.85, 1.4), hand=1.0, roll=[6, -6], look=(0.6, 0.9, -0.3))   # loop 3's fallback: S34 (the second hit, passed) mirrored: high in front on the side of the wall it hits first
add(112, 116, 'icetrack', k28,
    "K26 'bam bam' (b115.25/b115.92): in the channel ahead of the tub: BAM, it slams into the right wall, ice bursting up between the tub and the wall; BAM, into the left",
    v, **RUN_ICE, speed=22, tub=dict(TR), hits=[[H1[0], 1, SH], [H1[1], -1, SH]], jolt=H1, fans='chant', stars=['saxo'])
k29 = ride(only=('sadi',), sadi=scream())
v = lens_for(k29, 160, 2.6, hs=(1.6, 1.8, 2.0), fov=42, free=TUBFREE, dr=(0.9, 1.4), spread=20)   # loop 3's fallback: a frontal close-up (the grammar of Kob's, S32), higher, her arms thrown out
add(116, 120, 'icetrack', k29,
    "the chant: Sadi alone, arms flailing over her head, panicking",
    v, **RUN_ICE, speed=22, tub=dict(TR), fans='chant', clear=clear_frustum(v), stars=['sadi'])
k30 = ride(only=('kob',))
v = lens_for(k30, 100, 2.5, hs=(1.45, 1.6), fov=38, free=lambda c: not 2.15 < abs(c[0]) < 2.95, dr=(0.7, 1.3), spread=40)   # off the lamps' line (x 2.55)
add(120, 124, 'icetrack', k30,
    "the chant: Kob in the middle of it all, sipping her milk through the chaos, deadpan",
    v, **RUN_ICE, speed=22, tub=dict(TR), fans='chant', hideWall=1, clear=clear_line(v), stars=['kob'])
k31 = ride(only=('saxo',), saxo=groove())
v = lens_for(k31, 200, 3.2, hs=(2.0, 2.2, 2.4), fov=42, free=TUBFREE, dr=(1.0, 1.4), spread=20, roll=[-6, -6])   # loop 3's fallback: a frontal close-up (S32's grammar), higher, paws out
add(124, 128, 'icetrack', k31,
    "the chant: Saxo, the pilot, both paws up in the air, dancing instead of steering",
    v, **RUN_ICE, speed=22, tub=dict(TR), fans='chant', hideWall=-1, clear=clear_frustum(v), stars=['saxo'])
H2 = [S(131.23, 128), S(131.92, 128)]
k32 = hitride(H2, [-1, 1], only=('saxo', 'sadi', 'kob'), saxo=groove(), sadi=scream())
v = lens_for(k32, 192, 4.6, hs=(2.2, 2.5, 2.8), fov=54, free=TUBFREE, spread=12, dr=(0.85, 1.4), hand=1.0, roll=[-6, 6], look=(-0.6, 0.9, -0.3))   # aimed between the tub and the left wall
add(128, 132, 'icetrack', k32,
    "K34 'bam bam' (b131.23/b131.92): front-left, high, the left wall in frame: BAM into it, ice exploding between the tub and the wall; BAM into the right",
    v, **RUN_ICE, speed=23, tub=dict(TR), hits=[[H2[0], -1, SH], [H2[1], 1, SH]], jolt=H2, fans='gasp', clear=clear_frustum(v, 3.0), stars=['saxo'])
H3 = [S(135.24, 132), S(135.93, 132)]
k33 = hitride(H3[:1], [-1], saxo=scream(), sadi=scream(), compote=scream())
v = lens_for(k33, 230, 4.8, hs=(1.35, 1.5), fov=52, free=lambda c: True, hand=1.4, roll=[-6, -14])
add(132, 135.5, 'icetrack', k33,
    "K35 'bam' (b135.24): BAM: the tub slams into the left wall, everyone flailing",
    v, **RUN_ICE, speed=24, tub=dict(TR), hits=[[H3[0], -1, SH]], jolt=H3[:1], fans='gasp', hideWall=-1, clear=clear_frustum(v, 6.0), stars=['saxo'])
# the wreck on the last 'bam' (the critic, 2026-10-02: show it): into the right wall, the tub flips over, the four thrown up out of the frame
TF = S(135.93, 135.5)
k33b = [rider(TR, w, shove=[[TF, SH]], my=2.2, myAt=round(TF + 0.02, 3), myDur=0.22, mx=0.8, moveAt=round(TF + 0.02, 3), air=True, fg=True, **(kobcup() if w == 'kob' else groove() if w == 'saxo' else scream())) for w in ORDER]   # flung up 2.2 m in 0.22 s and 0.8 m right, clear of the tub that rises and rolls left (rising with it they were cut by it: the final check); Kob still seated, sipping
v = view((-3.5, 3.4, -8.0), (0.4, 1.8, 0.2), 52, p1=(-3.4, 3.35, -7.8), roll=[-3, 4], hand=0.8)   # high front-left, 9 m out: the tub in the lower half, the four flung above it under the lyric rows
add(135.5, 136.75, 'icetrack', k33b,
    "K35 'bam' (b135.93): the wreck, in a high wide from the front-left: BAM into the right wall, the bathtub flips over and the four are launched into the air above it, Saxo still dancing, Kob rising seated with her milk; a white flash",
    v, **RUN_ICE, speed=24, tub=dict(TR), hits=[[TF, 1, SH]], flip=[round(TF + 0.04, 3), 0.6, 1], jolt=[TF], flashAt=[TF], fans='gasp', hideWall=-1, clear=clear_frustum(v, 7.0), stars=[])
# the run-out (zone 'finish'): the bathtub upside down on its rim, claw feet in the air; the four fall out of the sky one per 'bam', the cat last, on her feet
CR = {'x': 0.35, 'z': -3.9, 'yaw': 10}
LAND = [S(137.13, 136.75), S(137.56, 136.75), S(139.0, 136.75), S(139.51, 136.75)]
def faller(who, x, z, t_land, clip='knocked_out_falling_to_back', at=3.3, yaw=0, **o):
    return A(who, clip, x, z, face='world', yaw=yaw, at=at, speed=0.05, lift=3.0, my=-3.0, myAt=round(t_land - 0.4, 3), myDur=0.4, ground='mesh', air=True, reveal=round(t_land + 0.05, 3), **o)
def tada(who, x, z, t_land):                   # dropped out of the sky onto their feet, arms up like gymnasts sticking a landing (lying, they read as a face-down lump: loop 3's fallback)
    return A(who, 'happy_idle', x, z, face='world', yaw=0, at=0.3, speed=0.5, lift=3.0, my=-3.0, myAt=round(t_land - 0.4, 3), myDur=0.4, air=True, reveal=round(t_land + 0.05, 3), arm='both', aim='up', bumps=[round(t_land, 3)], bumpAmp=0.1)
k34 = [tada('saxo', -1.05, -1.2, LAND[0]), tada('sadi', -0.35, -1.0, LAND[1]), tada('compote', 0.35, -1.2, LAND[2]),
       A('kob', 'happy_idle', 1.05, -1.0, face='world', yaw=0, at=0.3, speed=0.3, lift=3.0, my=-3.0, myAt=round(LAND[3] - 0.4, 3), myDur=0.4, air=True, reveal=round(LAND[3] + 0.05, 3), **kobcup())]
v = view((0.0, 1.5, 3.6), (0.0, 0.85, -1.6), 54, p1=(0.0, 1.48, 3.4))   # loop 3's fallback: a row facing the lens (the team photo's grammar, passed), the upturned tub behind them
add(136.75, 140, 'icetrack', k34,
    "K36 'bam bam bam bam' (b137.13-b139.51): the run-out: the bathtub upside down on its rim behind them, claw feet in the air; the team drops out of the sky one per 'bam', each sticking the landing, arms up like a gymnast; the cat lands last, on her feet, still sipping her milk",
    v, zone='finish', tub=dict(CR), flip=[-1.0, 0.6, 1], fans='gasp', stars=['kob'])
# the carry: three heads under the bathtub (staggered), Kob back in it, walking it over the line
CARRY = [('saxo', -0.45, -1.1), ('sadi', 0.0, 0.0), ('compote', 0.45, 1.1)]   # a diagonal under the tub: from the front-right every face shows (a zigzag stacked the two on one side)   # staggered under the tub so every face shows
def carriers(tub, **o):
    return [A(w, 'happy_walk', tub['x'] + dx, tub['z'] + dz, face='world', yaw=180, at=0.2 + i * 0.35, speed=1.0, mx=tub['to'][0] - tub['x'], mz=tub['to'][1] - tub['z'], arm='both', aim='up', **o) for i, (w, dx, dz) in enumerate(CARRY)]
TC = {'x': 0.0, 'z': -2.0, 'yaw': 0, 'y': 1.15, 'to': [0.0, -3.0], 'at': 0.0}   # the skis on the beanies (loop 2: at 1.1 a runner crossed Sadi's eye)
k35 = carriers(TC) + [rider(TC, 'kob', dlift=-0.16, **kobcup())]
v = lens_for(k35, 145, 5.0, hs=(1.1, 1.4, 1.7), fov=50, free=TUBFREE, hand=0.4, spread=20, dr=(0.9, 1.6))
add(140, 144, 'icetrack', k35,
    "K37 'bam bam bam bam' (b141.13-b143.49): they pick themselves up and carry the bathtub on their heads, paws up holding it, Kob sitting in it with her milk, stomping on every 'bam'",
    v, zone='finish', tub=dict(TC), fans='cheer', hideWall=1, clear=clear_frustum(v, 6.0), stars=['saxo'])
TC2 = {'x': 0.0, 'z': -8.7, 'yaw': 0, 'y': 1.15, 'to': [0.0, -9.4], 'at': 0.0}   # loop 3: at 1.45 the tub floated over them; at 1.15 their heads go up into its belly and their paws touch it
k36 = [dict(a, fg=a['who'] == 'sadi') for a in carriers(TC2)] + [rider(TC2, 'kob', dlift=-0.16, **kobcup())]   # Sadi, in the middle, frames it
v = lens_for(k36, 172, 6.8, hs=(1.6, 2.0, 2.4, 2.8), fov=50, free=lambda c: abs(c[0]) < 1.4, hand=0.3, spread=12, dr=(0.85, 1.3), push=0.03, look=(0.0, 2.15, -9.0), below=[(-1.1, 3.3, -9.5), (1.1, 3.3, -9.5), (0.0, 3.45, -9.5)])   # the team stops short of the banner (z -9.5): Kob's head clears it
add(144, 148.9, 'icetrack', k36,
    "K38 'bam bam' (b146.40/b147.09) to the end: under the FINISH gantry, the bathtub on their heads, Kob sipping on top, to a standing ovation: confetti, flares, the board lit with JAM",
    v, zone='finish', tub=dict(TC2), fans='cheer', confetti=True, flares=True, clear=clear_frustum(v, 4.0), stars=['saxo'])

shots.sort(key=lambda x: x['beat'])
ep = {
    'date': '2026-10-02', 'song': {'title': 'Jamaican (Bam Bam)', 'artist': 'HUGEL & SOLTO'},
    'logline': "The Jamaican bobsled team turns up at the Winter Olympics with a bathtub on skis: it bangs a wall on every 'bam', the last one wrecks it, and they carry it over the finish line on their heads with Kob still sitting in it.",
    'new': "the UNDERDOG structure (the team with no business being there fails at the decisive moment and wins the crowd anyway); src/maps23.js: kingston (the team's training beach: a coconut palm whose coconuts drop on cue, a KINGSTON sign, a sound system with pumping cones, an ice-cream freezer three heads fit in, beach locals who gather round) and icetrack (the Olympic bobsled track at night: the start ramp with its lip, rival sleds, a run whose channel, lamps and fans scroll past a still tub, a bank, ice bursting off the walls on hits, the finish gantry and grandstands); the bathtub sled (a clawfoot tub on skis, painted 'JAM'); the frame's `jolt` as a list of hit times and the actors' `bumps`; four looks (the team's bobsled suit for Saxo, Sadi and Compote, Kob's mint parka); the wreck shown on the last 'bam' (the tub's `flip`: thrown up, rolled over, landing upside down on its rim and taps, claw feet in the air); the drop past the lip (at the start the channel and the snow stop at the lip and a shaded slope and chute fall away); wall hits that touch the wall (the shove held through the hit, the tub riding 10 degrees up it, 64 ice chunks spraying back over it); three new arm swings (`rave`, `flail`, `sip`) and the actors' `lean`; the push start's cannonballs into the seats, one per 'bam'",
    'notes': "No clip to study: the official visualizer is a still of the record sleeve (a singer at a mic, a sun, a pink-red ground) in a jungle. The world is built from the title and the words: the Jamaican bobsled team (an underdog story the whole world knows), Kingston, the sound system, the crowd that comes to see. The whole cast: Saxo the pilot and lead (overconfident, dancing instead of steering); Sadi the screaming second (the reality check, flapping); Kob the passenger who never pushes, the only one dressed for the snow, sipping her milk through everything and landing on her feet (Kob came prepared, 'SWIM'); Compote the furious brakewoman whose shove can't move a bathtub in sand. Callback: the twin-trend synced dance as the team's warm-up; the coconuts on the four heads on the four 'bam's of one line.",
    'with': ['sadi', 'kob', 'compote'],
    'clips': ['happy_idle', 'happy_run', 'happy_walk', 'male_driving_a_car', 'knocked_out_falling_to_back'],
    'yt': 'end',
    'tags': {'structure': 'underdog', 'scenes': ['bathtub run', 'coconuts', 'freezer'], 'cast': ['saxo', 'sadi', 'kob', 'compote'], 'hook': 'dance', 'maps': ['icetrack', 'kingston'], 'ref': 'twin-trend',
             'lyric_literal': "'bam' (every one: four coconuts on four heads, the tub's bounces, each jump into the tub, the tip over the lip, the wall hits, the crash, the four landings), 'Kingston' (the sign), 'hear the sound' (the sound system), 'come... see' (the locals gather), 'nice up Jamaica' (the crowd starts to dance), 'Jamaican' (the crowd chants it on the beat)",
             'experiment': "Does an underdog sports parody everyone knows (the Jamaican bobsled team, in a bathtub) with a sound gag on every 'bam' of a rising afro-house hit, opened on the dance, get more shares per 1,000 views than our story plots?"},
    'shots': shots,
}
json.dump(ep, open(os.path.join(HERE, '2026-10-02.json'), 'w'), indent=1, ensure_ascii=False)
print(len(shots), 'shots;', len(WARN), 'warnings')
for w in WARN: print('  ', w)
