# make_2026-10-09.py: writes episodes/2026-10-09.json, "Danza Kuduro" (Don Omar & Lucenzo, 2010; the queue being empty:
# a throwback climbing again, +21 places and +90k streams a day on Spotify's global chart on 2026-10-08; its TikTok
# sounds have 1.49M, 535k and 307k videos).
# The world (the official video, looked at as contact sheets every 3 s; nothing violent in it): a white motor yacht off
# green Caribbean hills, a white villa with columns and a pool terrace, sunbathers in black on the sunpads, a BMW
# convertible on a coast road, a marina, dancers on a white beach under a white-curtained cabana; the singer in a white
# Breton top with navy stripes, white trousers and aviators, the other in a navy blazer. The song: a chorus of dance
# moves called out (hand up, waist alone, a half turn, don't get tired now, move your head), the Danza Kuduro every
# holiday resort's entertainer makes the pool dance to.
# Ours, "the cat does the Danza Kuduro lying down" (MALICIOUS COMPLIANCE, a new structure: the one forced to join obeys
# every called move to the letter, in the laziest way; the leader's frustration grows while the others come to prefer
# her version; the payoff: the whole crowd does the lazy version in sync, and the leader ends up serving them): Saxo,
# the resort's entertainer in the singer's Breton top and aviators, calls the moves from his podium and the whole pool
# dances them; Kob, on her sunbed in her bathrobe and towel turban, does every one too, lying down: 'hand up', her paw
# goes up, and Compote the waitress has to bring her a coconut; 'half turn', she rolls over to tan the other side. He
# comes down to her sunbed with Sadi, his keenest pupil, and calls them in her face: she obeys again, lying down (a
# paw up, a roll over, cucumber slices on her eyes on 'don't get tired now'). He gets the class to splash her: she puts
# up a little umbrella and the wave soaks him and Sadi. Sadi lies down beside the cat to dry, paw up; the class climbs out after her, and the
# sunbeds fill. The last chorus: every guest on a sunbed, paws up for coconuts on 'hand up', the whole resort rolling
# over in sync on 'half turn', the entertainer alone on his podium; Compote throws down her tray and lies down too,
# paw up; he picks up the tray and dances between the sunbeds serving coconuts.
# Beats: 130.0012 BPM, kit beat b at b * 0.461534 s (kit beat 0 = song beat 24, bar 6's downbeat, the drop).
# Sections (kit beats): the drop's two bars b0-8 (two shouts, K00 b3.5, K01 b5.3); the chorus b8-40 (K02-K09: a line a
# bar from b8.8) and again b40-72 (K10-K17); verse 1 b72-104 (K18-K25, each line on a pickup from beat 3.6-3.9 of the
# bar before); its short chorus b104-136 (K26-K33); the cut ends on the downbeat of the Portuguese section (b136,
# 62.77 s) and the loop runs on into the drop.
# Key words (whitelisted single words with their kit beats, never the lines): mano b9.2, arriba b9.8 | cintura b13.0,
# sola b14.0 | media b17.1, vuelta b17.9 | danza b20.7, kuduro b21.6 | (don't get tired now) b24.7 | empieza b29.8 |
# mueve b32.8, cabeza b33.8 | kuduro b37.6 | arriba b41.8 | sola b46.0 | vuelta b49.9 | kuduro b53.6 | (tired) b56.7 |
# empieza b61.8 | cabeza b65.8 | kuduro b69.6 | mar b75.4 | sol b81.4 | nena b86.6 | bailar b91.1 | fuego b96.1 |
# arriba b105.5 | sola b110.0 | vuelta b113.9 | duro b118.1 | (tired) b120.5 | empieza b125.8 | cabeza b129.8 |
# duro b133.7, kuduro b134.2.
# The lyrics stay in episodes/2026-10-09.lyrics.js (the generator reads only their times).
import json, math, os, re, sys
sys.path.insert(0, os.path.dirname(__file__))
from cam import view

HERE = os.path.dirname(__file__)
PER, B0 = 0.461534, 0.0
def T(b): return B0 + b * PER
def Bt(t): return (t - B0) / PER
def S(b, b0): return round((b - b0) * PER, 3)    # seconds from shot beat b0 to beat b

LOOK = {'saxo': 'breton', 'sadi': 'beach', 'kob': 'spa', 'compote': 'waitress'}
HEAD = {'saxo': 1.38, 'sadi': 1.38, 'kob': 1.5, 'compote': 1.5}           # the top of each head standing (the turban, the ears)
FACE = {'saxo': 0.9, 'sadi': 0.84, 'kob': 0.86, 'compote': 0.86}
RAD = {'saxo': 0.48, 'sadi': 0.43, 'kob': 0.44, 'compote': 0.42}

# ---- the map (src/maps37.js, RESORT) ----
POOL = (-5.0, 5.0, -7.2, -2.2); WATER_Y, FLOOR_Y = -0.06, -0.45
PODIUM = (0.0, -8.7); PODIUM_Y = 0.4; STAGE = (0.0, -8.4)                # Saxo's mark on the podium
CLASS = [(x + (r % 2) * 0.35, z) for r, z in enumerate((-3.3, -4.5, -5.7)) for x in (-3.75, -2.25, -0.75, 0.75, 2.25, 3.75)]
BED_Y = 0.32; BED_ROWS = (0.9, 3.2, 5.5); BED_XS = (-6, -4, -2, 0, 2, 4, 6)
BEDS = [(x, z) for z in BED_ROWS for x in BED_XS]
BED_ORDER = [(x, z) for r, z in enumerate(BED_ROWS) for x in sorted(BED_XS, key=lambda v: (abs(v), v)) if not (r == 0 and x == 0)]
KOB = (0.0, 1.22)                                                         # her mark on her sunbed (0, 0.9): the hips 0.09 m behind it, the head to -z
PARASOL = (0.85, 0.55)
SADI_POOL = (0.75, -5.7)                                                  # the front row of the class, nearest the podium
SADI_BED = (-2.0, 1.22)                                                   # the next sunbed (BED_ORDER[0])
TORCHES = [(-1.45, -7.75), (1.45, -7.75)]; SPEAKERS = [(-2.0, -8.9), (2.0, -8.9)]
POLES = [(-5.6, -8.3), (5.6, -8.3), (-5.6, -1.4), (5.6, -1.4)]
PALMS = [(-9.6, -3.2), (9.8, -6.4), (-10.2, 4.2), (11.2, 5.6), (-7.2, 8.8), (7.4, 9.0), (-11.4, -8.4), (11.8, -9.0)]
BAR = (7.8, 9.9, -2.3, 1.1)

def A(who, clip, x, z, **o):
    return {'who': who, 'look': o.pop('look', LOOK[who]), 'clip': clip, 'x': round(x, 3), 'z': round(z, 3), 'face': o.pop('face', 'camera'),
            'yaw': o.pop('yaw', 0), 'at': o.pop('at', 'auto'), **o}
# Kob on her sunbed: on her back (yaw -54 lays the clip's body along the sunbed, head to -z) or on her front (yaw -126)
BACK = dict(clip='laying_idle', at=1.0, speed=0, face='world', ground='mesh', lift=BED_Y, yaw=0, lying=True, noShadow=True)   # face up (probed): her face at (x - 0.06, BED_Y + 0.64, z - 0.49)
FRONT = dict(clip='knocked_out_falling_to_stomach', at=3.0, speed=0, face='world', ground='mesh', lift=BED_Y, yaw=-126, lying=True, noShadow=True, front=True)   # on her front her face looks to +x (probed)
def kob(front=False, **o):
    base = dict(FRONT if front else BACK); clip = base.pop('clip')
    return A('kob', clip, KOB[0], KOB[1], **{**base, **o})
PAWUP = dict(arm='R', aim=[0.12, 1.0, 0.0])                                 # a paw up to the sky while lying (out to the side: it reads from the side)
SIDE = dict(arm='R', aim=[0.7, 0.6, 0.2])                                   # the coconut held up out beside her face (from her feet: straight up, it covered her face, the critic)
SIDE2 = dict(arm='R', aim=[0.5, 0.85, 0.15])                                # the same, more upright: 'hand up'
FEETUP = dict(arm='R', aim=[0.25, 0.65, 0.7]); FEETUP_L = dict(arm='L', aim=[0.25, 0.65, 0.7])   # lying, a paw up that clears the big head: up and towards the feet (straight up it stopped level with the face, probed)
def sadi_pool(**o): return A('sadi', o.pop('clip', 'samba'), SADI_POOL[0], SADI_POOL[1], face='world', yaw=180, lift=FLOOR_Y, **o)
def saxo_stage(clip='samba', **o): return A('saxo', clip, STAGE[0], STAGE[1], face='world', yaw=o.pop('yaw', 0), lift=PODIUM_Y, hold=o.pop('hold', 'mic'), **o)
CALL = dict(arm='R', aim=[0.6, 0.5, 0.35])                                 # the mic up beside his muzzle, calling the move
def lying(who, x, z, **o): return A(who, 'laying_idle', x, z, at=1.0, speed=0, face='world', ground='mesh', lift=BED_Y, yaw=0, lying=True, noShadow=True, **o)
def lying_front(who, x, z, **o): return A(who, 'knocked_out_falling_to_stomach', x, z, at=3.0, speed=0, face='world', ground='mesh', lift=BED_Y, yaw=-126, lying=True, noShadow=True, front=True, **o)

# ---- a projection check (numbers only): where each face lands in the 9:16 frame at the shot's start and end ----
def _proj(cam, look, fov, pt):
    f = [look[i] - cam[i] for i in range(3)]; n = math.sqrt(sum(v * v for v in f)); f = [v / n for v in f]
    r = [-f[2], 0.0, f[0]]; rn = math.sqrt(r[0] ** 2 + r[2] ** 2) or 1; r = [r[0] / rn, 0.0, r[2] / rn]
    u = [r[1] * f[2] - r[2] * f[1], r[2] * f[0] - r[0] * f[2], r[0] * f[1] - r[1] * f[0]]
    d = [pt[i] - cam[i] for i in range(3)]; z = sum(a * b for a, b in zip(d, f))
    if z <= 0.05: return None
    tv = math.tan(math.radians(fov) / 2); th = tv * 9 / 16
    return (0.5 + sum(a * b for a, b in zip(d, r)) / z / th / 2, 0.5 - sum(a * b for a, b in zip(d, u)) / z / tv / 2)
_src = open(os.path.join(HERE, '2026-10-09.lyrics.js')).read()
_rows = json.loads(re.search(r'window\.LYRICS = (.*?);\n', _src).group(1)); _ends = json.loads(re.search(r'window\.LINE_END = (.*?);\n', _src).group(1))
LINES = [(Bt(row[0][0] - 0.35), Bt(e)) for row, e in zip(_rows, _ends)]
def has_line(b0, b1): return any(a < b1 and b > b0 for a, b in LINES)
WARN = []
def body(a, end):                                # (who, x, z, face y, head top y) at the shot's start (0) or end (1)
    who = a['who']; sc = a.get('scale', 1)
    x, z = a['x'] + a.get('mx', 0) * end, a['z'] + a.get('mz', 0) * end
    lift = a.get('lift', 0) + (a.get('my', 0) if end else 0)
    if a.get('lying'):
        if a.get('front'): return (who, x + 0.27, z - 0.67, lift + 0.28, lift + 0.6)   # on her front: the face looks to +x
        return (who, x - 0.08, z - 0.6, lift + 0.2, lift + 0.44)                       # on her back: the face up, the head sunk into the pad (the nose fitted on four probe stills; 0.64 up was 0.44 too high)
    return (who, x, z, FACE[who] * sc + lift, HEAD[who] * sc + lift)
def check(beat, b1, cam, look, fov, actors, end):
    line = has_line(beat, b1)
    for a in actors:
        if a.get('fg') or a.get('reveal', 0) >= 1.0 or a.get('away'): continue
        who, x, z, fy, hy = body(a, end)
        top, face = _proj(cam, look, fov, (x, hy, z)), _proj(cam, look, fov, (x, fy, z))
        tag = ' at the end' if end else ''
        if not top or not face: WARN.append(f'b{beat}: {who} behind the lens{tag}'); continue
        if line and top[1] < 0.27: WARN.append(f'b{beat}: {who} head top at {top[1]:.2f} (lyric rows){tag}')
        if face[0] < 0.1 or face[0] > 0.9: WARN.append(f'b{beat}: {who} face x {face[0]:.2f} (edge){tag}')
        if face[1] > 0.85 or face[1] < 0.2: WARN.append(f'b{beat}: {who} face y {face[1]:.2f}{tag}')
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

# ---- the set: a lens must be above the water and the deck, never inside the podium, a speaker, a sunbed, the bar, a
# palm or a head ----
def free(c, heads=(), parasol=True):
    x, y, z = c
    over_pool = POOL[0] < x < POOL[1] and POOL[2] < z < POOL[3]
    if y < (WATER_Y + 0.1 if over_pool else 0.08): return False
    if abs(x - PODIUM[0]) < 1.6 and -9.6 < z < -7.8 and y < PODIUM_Y + 0.12: return False
    for sx, sz in SPEAKERS:
        if abs(x - sx) < 0.42 and abs(z - sz) < 0.38 and y < 1.3: return False
    for bx, bz in BEDS:
        if abs(x - bx) < 0.42 and abs(z - bz) < 1.05 and y < BED_Y + 0.2: return False
    if parasol and math.hypot(x - PARASOL[0], z - PARASOL[1]) < 1.25 and 1.85 < y < 2.45: return False
    if BAR[0] < x < BAR[1] and BAR[2] < z < BAR[3] and y < 3.6: return False
    for px_, pz in PALMS:
        if math.hypot(x - px_, z - pz) < 0.45: return False
    for (hx, hy, hz, r) in heads:
        if math.dist(c, (hx, hy, hz)) < r: return False
    return True
def blocked(cam, pt, parasol=True):
    """a thin post on the line from the lens to a point: a torch, a bunting pole, the parasol's pole, a palm trunk"""
    ax, az, bx, bz = cam[0], cam[2], pt[0], pt[2]; dx, dz = bx - ax, bz - az; L2 = dx * dx + dz * dz or 1
    posts = [(p, 0.1, 1.9) for p in TORCHES] + [(p, 0.1, 3.4) for p in POLES] + [(p, 0.32, 6.0) for p in PALMS] + ([(PARASOL, 0.08, 2.2)] if parasol else [])
    for (px_, pz), r, h in posts:
        u = max(0.0, min(1.0, ((px_ - ax) * dx + (pz - az) * dz) / L2))
        if 0.02 < u < 0.98 and math.hypot(ax + u * dx - px_, az + u * dz - pz) < r + 0.06:
            y = cam[1] + (pt[1] - cam[1]) * u
            if y < h: return 'a post'
    return None
def heads_of(actors):
    out = []
    for a in actors:
        who, x, z, fy, hy = body(a, 0)
        out.append((x, fy - (0.1 if a.get('lying') else -0.15), z, RAD[who] + 0.12))
    return out
def clear_line(cam, pts, r=0.55, near=0.9, beds=True, cls=True):
    """the class's spots and the sunbathers' beds near the line from the lens to each point, or near the lens"""
    out = []
    spots = (CLASS if cls else []) + ([(x, z + 0.12) for x, z in BED_ORDER] if beds else [])
    for sx, sz in spots:
        hit = math.hypot(sx - cam[0], sz - cam[2]) < near
        for p in pts:
            ax, az, bx, bz = cam[0], cam[2], p[0], p[-1]; dx, dz = bx - ax, bz - az; L2 = dx * dx + dz * dz or 1
            u = max(0.0, min(1.0, ((sx - ax) * dx + (sz - az) * dz) / L2))
            if 0.0 < u < 0.97 and math.hypot(ax + u * dx - sx, az + u * dz - sz) < r: hit = True
        if hit: out.append([round(sx, 2), round(sz, 2), 0.35])
    return out

shots = []
def lens(v, k=0):
    c, f = v; a = math.radians(c['ang'][k]); fy = f[2] if len(f) > 2 else 0
    return (f[0] + math.sin(a) * c['r'][k], c['h'][k] + fy, f[1] + math.cos(a) * c['r'][k])
def add(beat, b1, actors, lyric, v, **o):
    c, focus = v
    o = {k: val for k, val in o.items() if val is not None}
    shots.append({'beat': beat, 'kind': 'dance', 'map': 'resort', 'actors': actors, 'lyric': lyric, 'cam': c, 'focus': focus, **o})
    fy = focus[2] if len(focus) > 2 else 0
    hd = heads_of([a for a in actors if not a.get('fg')])
    par = False   # the parasol is off the set (its pole cut every two-shot at her sunbed)
    for k, end in ((0, 0), (-1, 1)):
        cam, look = lens(v, k), (focus[0], c['look'][k] + fy, focus[1])
        check(beat, b1, cam, look, c['fov'], actors, end)
        for oc in _occl(cam, look, c['fov'], [body(a, end)[:4] for a in actors if not a.get('fg') and not a.get('away')]):
            WARN.append(f'b{beat}: {oc}{" at the end" if end else ""}')
        if not free(cam, hd, par): WARN.append(f'b{beat}: lens inside the set or a head{" at the end" if end else ""} {tuple(round(q, 2) for q in cam)}')
        for a in actors:
            if a.get('fg') or a.get('away'): continue
            w_, x_, z_, fy_, _ = body(a, end); bl = blocked(cam, (x_, fy_, z_), par)
            if bl: WARN.append(f'b{beat}: {w_} behind {bl}{" at the end" if end else ""}')
def clean(actors):
    for a in actors:
        for k in ('lying', 'away', 'front'): a.pop(k, None)
    return actors

# ================= a lens search: every face inside the frame and under the lyric rows at the shot's start and end, no
# face inside a nearer head's disc, the lens free of the set =================
WHY = {}
def _no(r): WHY[r] = WHY.get(r, 0) + 1; return None
FACING = {}
def _ok(cam, look, fov, phases, line, occ=(), maxoff=105, par=True):
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
            bl = blocked(cam, (x, fy, z), par)
            if bl: return _no(f'{w} behind {bl}')
            ex = [_proj(cam, look, fov, (x + sg * RAD[w] * rx, fy, z + sg * RAD[w] * rz)) for sg in (-1, 1)]
            if not all(ex): return _no('behind the lens')
            m = {f'{w} face x': min(face[0] - 0.16, 0.84 - face[0]), f'{w} head edge': min(min(e[0] for e in ex) - 0.02, 0.98 - max(e[0] for e in ex)), f'{w} face low': 0.8 - face[1], f'{w} lyric rows': (top[1] - 0.28) if line else 1.0}
            k_, v_ = min(m.items(), key=lambda kv: kv[1])
            if v_ < 0: return _no(k_)
            worst = min(worst, v_)
        pts = [(w, x, z, fy) for w, x, z, fy, _ in subs] + [o_ for o_ in occ if o_[0] not in [s_[0] for s_ in subs]]
        oc = [r_ for r_ in _occl(cam, look, fov, pts) if r_.split(' behind ')[0] in [s_[0] for s_ in subs]]
        if oc: return _no(oc[0])
    return worst
def lens_for(actors, ang, dist, b0, b1, hs=(1.3,), fov=50, look=None, spread=40, dr=(0.8, 1.5), push=0.04, facing=True, maxoff=105, par=False, **o):
    vis = [a for a in actors if not a.get('fg') and not a.get('away')]
    FACING.clear(); FACING.update({a['who']: a.get('yaw', 0) for a in vis if a.get('face') == 'world' and not a.get('lying')} if facing else {})
    phases = [[body(a, 0) for a in vis if not a.get('reveal')], [body(a, 1) for a in vis]]
    occ = [body(a, 0)[:4] for a in actors if a.get('fg') and not a.get('away')]
    hd = heads_of(actors)
    allp = phases[0] + phases[1]
    cx = sum(s_[1] for s_ in allp) / len(allp); cz = sum(s_[2] for s_ in allp) / len(allp); ly = sum(s_[3] for s_ in allp) / len(allp) + 0.06
    L = look or (cx, ly, cz); best = None; WHY.clear(); nfree = 0; line = has_line(b0, b1)
    for da in range(-spread, spread + 1, 5):
        for k in range(13):
            d = dist * (dr[0] + (dr[1] - dr[0]) * k / 12)
            for h in hs:
                a = math.radians(ang + da); cam = (L[0] + math.sin(a) * d, h, L[2] + math.cos(a) * d)
                if not free(cam, hd, par): nfree += 1; continue
                f = _ok(cam, L, fov, phases, line, occ, maxoff, par)
                if f is None or f < 0: continue
                score = abs(da) / 40 + abs(d - dist) / dist + (0.25 - min(f, 0.25))
                if best is None or score < best[0]: best = (score, cam)
    if best is None:
        raise SystemExit(f'b{b0}: no lens for {[s_[0] for s_ in phases[0]]} round {ang} deg at {dist} m; rejections: {sorted(WHY.items(), key=lambda kv: -kv[1])[:6]}, not free: {nfree}')
    cam = best[1]; p1 = (cam[0] + (L[0] - cam[0]) * push, cam[1], cam[2] + (L[2] - cam[2]) * push)
    return view(tuple(round(c, 3) for c in cam), tuple(round(c, 3) for c in L), fov, p1=tuple(round(c, 3) for c in p1), **o)

KOB_FACE = (-0.43, 0.56, 0.88)                                             # her face lying on her back: turned fully to her right, looking to -x (probed)

# =====================================================================================================================
# BEAT 1, the drop (b0-8): the resort's pool party; the cat on her sunbed toasts with her coconut, the whole pool dances
# beyond her, and the entertainer dances on his podium
# S01 the hook (b0-4): the watcher, from her feet: the cat lying in her bathrobe and turban, face up, a coconut raised,
# deadpan, in the lower third; the whole pool dancing beyond her, the dog on his KUDURO podium (the critic's fix: the
# joke's two layers in frame 1)
s01 = [kob(**SIDE, upAt=-1, hold='coconut', holdScale=1.5), saxo_stage('samba', at=0.6), sadi_pool(away=True)]
v = view((0.05, 2.05, 3.85), (-0.1, 0.65, -2.6), 56, p1=(0.05, 2.02, 3.65))   # review 2's critic: she was in the corner, seen from under her chin, the coconut over half her face
add(0, 4, s01, "the hook, from the cat's feet: lying on her sunbed in her bathrobe and towel turban, face up, deadpan, a coconut cocktail raised; beyond her the whole pool dances and the dog dances on his KUDURO podium", v,
    move='dance', clear=[list(SADI_POOL) + [0.35]])
# S02 (b4-8): low among the class, dancing heads in the foreground: Saxo, the entertainer, dances on his podium in the
# singer's Breton top and aviators, the mic in his paw
s02 = [saxo_stage('samba', at=1.4), sadi_pool(fg=True)]
cam02 = (0.3, 1.25, -4.15)
v = view(cam02, (0.0, 1.42, -8.4), 50, p1=(0.28, 1.22, -4.6), roll=[-6, -3], hand=0.3)
add(4, 8, s02, "low among the dancing class: Saxo, the resort's entertainer, dances the kuduro on his podium in the singer's Breton top and aviators, the mic in his paw", v,
    move='dance', clear=[[x, z, 0.35] for x, z in CLASS if math.hypot(x - cam02[0], z - cam02[2]) < 0.75 or (x, z) == SADI_POOL])

# =====================================================================================================================
# BEAT 2, the chorus (b8-40): every move he calls, the pool dances; the cat does each one too, lying down
# S03 (b8-10; 'arriba' b9.8): over his shoulder from behind the podium: every paw in the pool goes up with his
s03 = [saxo_stage('happy_idle', at=0.4, speed=0.4, arm='both', aim=[0.6, 0.8, 0.15], upAt=S(9.45, 8))]
v = view((0.0, 2.6, -1.2), (0.0, 0.9, -7.2), 52, p1=(0.0, 2.57, -1.4))   # review 2: from behind him his head was a grey lump; a high 3/4 from behind still was (probed)
add(8, 10, s03, "'hand up': high from the pool's near edge: on the word the dog's paws go up on his podium and every paw in the pool goes up with his", v,
    move='up', upAt=S(9.45, 8))
# S04 (b10-12): the cat's version, from her feet, the pool's raised paws beyond her: she lifts her empty coconut: a refill
s04 = [kob(**SIDE2, upAt=S(10.3, 10), hold='coconutempty', holdScale=1.7), saxo_stage('happy_idle', at=0.4, speed=0.3, arm='both', aim=[0.6, 0.8, 0.15], upAt=-1, fg=True)]
v = view((0.05, 2.0, 3.1), (-0.1, 0.65, -2.2), 54, p1=(0.05, 1.97, 2.95))
add(10, 14, s04, "the cat's version, from her feet: everyone beyond her has a paw up, and lying down she lifts hers, her empty coconut in it: a refill, please", v,
    move='up', upAt=-1)
# S05 (b12-14, 'waist'): folded into S04 (review 4, the 3rd failed loop: the hips never read in a still), so the cat's version holds two beats more
# S06 (b14-16; 'sola' b14.0): the waitress brings her a full coconut, and glares at us over her tray
s06 = [kob(**PAWUP, upAt=-1, hold='coconut', holdScale=1.5), A('compote', 'happy_idle', 0.95, 2.05, at=0.4, speed=0.2, hold='tray', arm='R', aim=[0.55, 0.4, 0.35], upAt=-1)]
v = ({'steady': True, 'ang': [10, 10], 'r': [4.15, 3.984], 'h': [1.95, 1.95], 'look': [0.85, 0.85], 'fov': 52}, [0.35, 1.25])   # passed review 2: frozen (lens_for on the old face estimate)
add(14, 16, s06, "her raised paw was an order: the waitress Compote has brought her a full coconut, and glares at us over her tray; the cat sips", v)
# S07 (b16-18; 'media' b17.1, 'vuelta' b17.9): over his other shoulder: the whole class turns round, backs to him
s07 = [saxo_stage('happy_idle', at=2.1, speed=0, **CALL)]
v = view((3.0, 2.2, -0.9), (-0.5, 0.9, -7.0), 54, p1=(2.95, 2.18, -1.05))
add(16, 18, s07, "'half turn': from the pool's corner: on the word the whole class turns round to face us, their backs to the dog calling on his podium", v,
    move='turn', turnAt=S(17.0, 16))
# S08 (b18-20): the cat's half turn: she has rolled over onto her front, to tan the other side (her face to us)
v = view((2.05, 1.55, 1.45), (0.15, 0.55, 0.55), 50, p1=(2.0, 1.52, 1.4))
add(18, 20, [kob(front=True)], "the cat's half turn: she has rolled over onto her front, to tan the other side, and gives us the same deadpan", v)
# S09 (b20-24; 'kuduro' b21.6): high from the pool's corner: the dog and the whole class dance the kuduro
v = view((5.6, 2.6, -1.4), (0.0, 0.6, -6.5), 58, p1=(5.45, 2.55, -1.55), roll=[5, 3], hand=0.3)
add(20, 24, [saxo_stage('samba', at=1.0)], "'danza kuduro': high from the pool's corner: the dog on his podium and the whole class dance the kuduro", v, move='dance')
# S10 (b24-28; 'don't get tired now' b24.7): Sadi in the front row, his keenest pupil: dancing, her paw on her heart
s10 = [sadi_pool(clip='samba', at=0.4, arm='R', aim='heart', upAt=-1)]
v = view((1.12, 0.8, -7.8), (0.75, 0.62, -5.7), 50, p1=(1.08, 0.79, -7.7))
add(24, 28, s10, "Sadi in the front row, his keenest pupil: dancing for him, her paw on her heart, a heart popping over her", v,
    move='dance', hearts=[[0.75, 0.72, -5.7, 0.2, 0]], heartYaw=180, clear=[[0.75, -5.7, 0.4], [-0.75, -5.7, 0.4], [2.25, -5.7, 0.4]])
# S11 (b28-32; 'empieza' b29.8): the dog stops dancing: he's spotted the one guest who isn't: deadpan on the podium
s11 = [saxo_stage('happy_idle', at=2.1, speed=0, **CALL)]
v = lens_for(s11, 0, 3.4, 28, 32, hs=(1.25, 1.4, 1.55), fov=46, look=(0.0, 1.45, -8.4), spread=15, push=0.06, ease='lin')
add(28, 32, s11, "the dog stops dancing: he's spotted the one guest who isn't; deadpan on the podium, the mic still up", v,
    move='dance', clear=clear_line(lens(v), [STAGE], r=0.45), still=True)
# S12 (b32-36; 'mueve' b32.8, 'cabeza' b33.8): low from the far corner of the pool: every head in the class bobbing
v = view((3.9, 1.35, -7.2), (0.2, 0.45, -4.0), 52, p1=(3.8, 1.33, -7.1), roll=[-4, -2], hand=0.3)
add(32, 36, [saxo_stage('chicken', at=0.4, fg=True)], "'move your head': low from the far corner of the pool: every head in the class bobbing and tilting on the beat", v,
    move='heads', clear=[[x, z, 0.35] for x, z in CLASS if math.hypot(x - 3.7, z + 7.05) < 1.0])
# S13 (b36-40; 'kuduro' b37.6): he dances off round the pool towards her, mic in paw, the class turning to watch
v = view((5.6, 2.6, -1.4), (0.0, 0.6, -6.5), 58, p1=(5.45, 2.55, -1.55), roll=[5, 3], hand=0.3)   # review 4, the 3rd failed loop: S09's proven shot again on the chorus's same line
add(36, 40, [saxo_stage('samba', at=1.0)], "'danza kuduro': high from the pool's corner again: the dog on his podium and the whole class dance the kuduro", v, move='dance')

# =====================================================================================================================
# BEAT 3, the chorus again (b40-72): at her sunbed he calls every move in her face, Sadi beside him; the cat obeys again
SX, SD = (-0.92, 0.95), (-0.98, 2.0)                                      # his mark and Sadi's on the cat's left, facing her
def saxo_bed(clip='happy_idle', **o): return A('saxo', clip, SX[0], SX[1], face='world', yaw=o.pop('yaw', 80), hold=o.pop('hold', 'mic'), **o)
def sadi_bed(clip='happy_idle', **o): return A('sadi', clip, SD[0], SD[1], face='world', yaw=o.pop('yaw', 100), **o)
# S14 (b40-44; 'arriba' b41.8): their paws up in her face; on her front, she lifts one too, without looking: a refill
s14 = [saxo_bed('happy_idle', at=0.4, speed=0.3, arm='both', aim=[0.6, 0.8, 0.15], upAt=S(41.5, 40)), sadi_bed('happy_idle', at=0.6, speed=0.3, arm='R', aim=[0.55, 0.8, 0.1], upAt=S(41.5, 40)),
       kob(front=True, **PAWUP, upAt=S(42.2, 40), hold='coconutempty', holdScale=1.7)]
v = lens_for(s14, 65, 3.7, 40, 44, hs=(1.5, 1.7, 1.9), fov=56, look=(-0.35, 0.8, 1.2), spread=25, facing=False)
add(40, 44, s14, "'hand up': at her sunbed the dog and Sadi throw their paws up in her face; on her front, she lifts one too, her empty coconut in it", v)
# S15 (b44-48; 'sola' b46.0): the waitress, furious, brings another coconut to the paw
s15 = [kob(front=True, **PAWUP, upAt=-1, hold='coconut', holdScale=1.5, holdFrom=S(44.9, 44)), A('compote', 'happy_idle', 1.05, 2.0, at=0.4, speed=0.2, hold='tray', arm='R', aim=[0.55, 0.4, 0.35], upAt=-1)]
v = lens_for(s15, 40, 3.2, 44, 48, hs=(1.5, 1.7), fov=52, look=(0.55, 0.8, 1.3), spread=30, facing=False)
add(44, 48, s15, "'waist': and the waitress, furious, has to bring her another coconut", v)
# S16 (b48-52; 'vuelta' b49.9): the dog and Sadi spin; the cat has rolled back onto her back: the other side's done
s16 = [saxo_bed('northern_soul_spin', at=0.3), sadi_bed('northern_soul_spin', at=0.5), kob()]
v = ({'steady': True, 'ang': [19.99, 20.01], 'r': [4.592, 4.408], 'h': [2.1, 2.1], 'look': [0.8, 0.8], 'fov': 58}, [-0.4, 1.2])   # passed review 2: frozen
add(48, 52, s16, "'half turn': the dog and Sadi spin round at her sunbed; the cat has rolled back over onto her back: the other side's done", v)
# S17 (b52-56; 'kuduro' b53.6): they dance the kuduro right at her, harder; she doesn't blink
s17 = [A('saxo', 'charleston', -0.85, 0.35, face='world', yaw=55, at=0.86, hold='mic'), A('sadi', 'samba', 0.75, 0.35, face='world', yaw=-70, at=0.5), kob()]   # the charleston's kick (clip 1.6 s) on the word; Sadi turned to the cat (review 3)
v = lens_for(s17, 0, 4.0, 52, 56, hs=(2.5, 2.8), fov=58, look=(-0.05, 0.85, 0.42), spread=15, dr=(0.95, 1.15), maxoff=80, roll=[3, 2], hand=0.3)   # higher, the empty sunbed under the frame
add(52, 56, s17, "'danza kuduro': they dance the kuduro right at her, either side of her head, harder; she doesn't blink", v, clear=clear_line(lens(v), [(-0.85, 0.35), (0.75, 0.35), (-0.08, 0.62)], r=0.6))
# S18 (b56-60; 'don't get tired now' b56.7): the cat naps, cucumber slices over her eyes (the spa day's cliche)
v = view((0.0, 2.55, 1.75), (-0.06, 0.96, 0.6), 48, p1=(0.0, 2.52, 1.7), ease='lin')
add(56, 60, [kob(cucumbers=True)], "'don't get tired now': the cat naps, cucumber slices over her eyes", v)
# S19 (b60-64; 'empieza' b61.8): the dog, deadpan, mic still up: this is only the beginning
s19 = [saxo_bed('happy_idle', at=2.1, speed=0, **CALL)]
v = lens_for(s19, 72, 2.6, 60, 64, hs=(1.2, 1.35), fov=46, spread=15, push=0.05, ease='lin')
add(60, 64, s19, "the dog, deadpan, the mic still up: this is only the beginning", v, still=True)
# S20 (b64-68; 'mueve' b64.8, 'cabeza' b65.8): Sadi does the chicken at her, the cat naps on under her cucumbers
s20 = [A('sadi', 'happy_idle', -1.05, 0.5, at=2.125, speed=0, arm='both', aim='rave', flapEvery=1000, flapPh=90, upAt=-1, hop=[0.05, 1]), kob(cucumbers=True)]
v = view((0.1, 2.5, 3.3), (-0.55, 1.0, 0.5), 58, p1=(0.08, 2.47, 3.15))
add(64, 70, s20, "'move your head': Sadi dances beside the cat's head, both paws up, hopping on the beat; the cat naps on under her cucumber slices", v, clear=clear_line(lens(v), [(-1.05, 0.5), (-0.08, 0.62)], r=0.6))
# S21 (b68-72): folded into S20 and S22 (review 4, the 3rd failed loop: the conductor never read), two beats each

# =====================================================================================================================
# BEAT 4, verse 1 (b72-104): the splash backfires; Sadi and then the whole class go over to the cat's side
SPLASH_X = [(-0.95, -0.3), (0.9, -0.4)]                                     # the dog and Sadi between her sunbed and the pool, either side of her head from her feet
# S22 (b72-76; 'mar' b75.4): from her feet: the cat puts up a little umbrella; behind the dog and Sadi the whole class
# scoops a sheet of water out of the pool, and it lands on the two of them
s22 = [kob(**PAWUP, upAt=S(74.6, 70), hold='brolly', holdFrom=S(74.6, 70)), A('saxo', 'happy_idle', SPLASH_X[0][0], SPLASH_X[0][1], at=0.4, speed=0.3, hold='mic', **CALL, aim2=[0.85, 0.3, 0.15], aim2At=S(75.45, 70)),
       A('sadi', 'happy_idle', SPLASH_X[1][0], SPLASH_X[1][1], at=0.6, speed=0.3, arm='both', aim=[0.15, -0.95, 0.1], upAt=-1, aim2=[0.85, 0.3, 0.15], aim2At=S(75.45, 70))]   # thrown out as it lands (the critic: neither wet nor reacting)
v = view((0.0, 1.62, 3.55), (0.0, 0.95, -0.6), 66, p1=(0.0, 1.6, 3.42))
add(70, 76, s22, "'sea': from her feet: the cat puts up a little umbrella; behind the dog and Sadi the whole class scoops a sheet of water out of the pool, and it lands on the two of them", v,
    move='splash', splashWall=[0.0, -3.0, 0.0, -0.35, S(75.4, 70), 1.15])
# S23 (b76-80): the dog and Sadi, soaked, dripping into puddles, deadpan; the cat dry under her umbrella
s23 = [kob(**PAWUP, upAt=-1, hold='brolly'), A('saxo', 'happy_idle', SPLASH_X[0][0], SPLASH_X[0][1], at=2.1, speed=0), A('sadi', 'happy_idle', SPLASH_X[1][0], SPLASH_X[1][1], at=2.1, speed=0)]
v = view((0.0, 1.66, 3.45), (0.0, 0.95, -0.3), 64, p1=(0.0, 1.64, 3.3), ease="lin")
add(76, 80, s23, "the dog and Sadi, soaked, dripping into puddles, deadpan; the cat dry under her little umbrella in front of them", v,
    drips=[[SPLASH_X[0][0], SPLASH_X[0][1], 1.32], [SPLASH_X[1][0], SPLASH_X[1][1], 1.3]])
# S24 (b80-84; 'sol' b81.4): Sadi lies down on the next sunbed to dry in the sun, and lifts a paw
s24 = [lying('sadi', SADI_BED[0], SADI_BED[1], **PAWUP, upAt=S(81.3, 80)), kob()]
v = view((-1.0, 3.2, 4.6), (-1.0, 0.5, 0.75), 60, p1=(-1.0, 3.15, 4.5))
add(80, 84, s24, "'sun': Sadi gives up: she lies down on the next sunbed to dry in the sun, beside the cat, and lifts a paw", v, beds=0)
# S25 (b84-88; 'nena' b86.6): the waitress has to bring Sadi a coconut too; Compote glares at us
s25 = [lying('sadi', SADI_BED[0], SADI_BED[1], **PAWUP, upAt=-1, hold='coconut', holdScale=1.5), kob(), A('compote', 'happy_idle', -1.0, 2.15, at=0.4, speed=0.2, hold='tray', arm='R', aim=[0.55, 0.4, 0.35], upAt=-1)]
v = ({'steady': True, 'ang': [0, 0], 'r': [4.35, 4.176], 'h': [2.1, 2.1], 'look': [0.8, 0.8], 'fov': 58}, [-1.0, 1.3])   # passed review 2: frozen
add(84, 88, s25, "'girl': Sadi has her coconut too, the cat beside her, and the waitress glares at us: two customers now", v, beds=0)
# S26 (b88-92; 'bailar' b91.1): from behind his podium: the dog dances alone while the whole class climbs out of the
# pool for the sunbeds, one by one
s26 = [saxo_stage('samba', at=0.6, fg=True)]
v = view((-2.2, 4.4, -14.2), (0.0, 0.2, -3.5), 56, p1=(-2.16, 4.35, -14.0))
add(88, 92, s26, "'dance': from behind his podium: the dog dances on alone while the whole class climbs out of the pool for the sunbeds, one by one", v,
    move='idle', classOut=[0.0, 0.06, 1.0], beds=1, clear=[[-2.0, 0.9, 0.3]])
# S27 (b92-96): high over the sunbeds: they fill up, pet after pet lying down
v = view((0.0, 6.2, 9.6), (0.0, 0.0, 1.5), 50, p1=(0.0, 6.0, 9.2))
add(92, 96, [kob(), lying('sadi', SADI_BED[0], SADI_BED[1], fg=True)], "high over the sunbeds: they fill up, pet after pet lying down beside the cat and Sadi", v,
    classN=0, beds=20, bedsAt=[0.0, 0.08], clear=[[-2.0, 0.9, 0.3]])
# S28 (b96-100; 'fuego' b96.1): the dog alone on his podium between the burning torches, dancing to an empty pool
s28 = [saxo_stage('macarena', at=0.4)]
v = view((0.25, 1.9, -1.6), (0.0, 1.0, -8.4), 56, p1=(0.24, 1.88, -1.9), roll=[2, 1])   # review 2: S02's framing again, the torches out of frame
add(96, 100, s28, "'fire': the dog alone on his podium between the burning torches, dancing to an empty pool", v, classN=0, beds=20)
# S29 (b100-104): the waitress looks out over a resort lying down
s29 = [A('compote', 'happy_idle', 2.6, -0.9, at=0.4, speed=0.2, face='world', yaw=200, hold='tray', arm='R', aim=[0.55, 0.4, 0.35], upAt=-1)]
v = view((4.6, 1.5, -4.1), (1.6, 0.75, 2.2), 52, p1=(4.55, 1.47, -3.95))
add(100, 104, s29, "the waitress, her tray of coconuts, looks out over a whole resort lying down", v, classN=0, beds=20, clear=[[-2.0, 0.9, 0.3]])

# =====================================================================================================================
# BEAT 5, the short chorus (b104-136): the whole resort does the cat's version, in sync; the entertainer serves
ALLBEDS = dict(classN=0, beds=20, clear=[[-2.0, 0.9, 0.3]])
# S30 (b104-108; 'arriba' b105.5): a high three-quarter down the rows: every paw on every sunbed goes up at once
ROW = lambda k=0: view((-2.7 + 0.05 * k, 2.5 - 0.03 * k, 2.4 - 0.1 * k), (1.75, 0.55, 0.4), 62, p1=(-2.65 + 0.05 * k, 2.47 - 0.03 * k, 2.3 - 0.1 * k))   # along the front row from its feet side, the cat nearest, the row behind her
add(104, 108, [kob(), lying('sadi', SADI_BED[0], SADI_BED[1], fg=True)], "'hand up': along the front row from its feet: the cat lies there deadpan and on the word every paw on every sunbed behind her goes up with a coconut cocktail: the whole resort toasts her", ROW(),   # review 4, the 3rd failed loop: her own raised coconut always covered her face; S32a's proven pose
    bedMove='paw', pawAt=S(105.3, 104), coco=True, cocoAt=-1, **ALLBEDS)   # the cocktails in their paws as they rise (the critic saw bare arms: they came 0.4 s later)
# S31 (b108-112; 'sola' b110.0): the dog alone on his podium, swaying his hips at an empty pool
v = view((0.3, 0.72, -3.7), (0.0, 1.25, -8.4), 56, p1=(0.29, 0.73, -3.95), roll=[-4, -2])
add(108, 112, [saxo_stage('samba', at=0.5, sway=10, swayEvery=0.5)], "'waist': over the empty pool: the dog alone on his podium swaying his hips at nobody", v, classN=0, beds=20)
# S32 (b112-116; 'vuelta' b113.9): straight down on the rows: the whole resort rolls over in sync, the cat with them
add(112, 113.75, [kob(), lying('sadi', SADI_BED[0], SADI_BED[1], fg=True)], "'half turn': along the front row again: the whole resort lying on its back, the cat nearest", ROW(1), **ALLBEDS)
add(113.75, 116, [kob(front=True), lying_front('sadi', SADI_BED[0], SADI_BED[1], fg=True)], "'half turn': on the word, the cut: the cat and the whole row behind her have rolled over onto their fronts at once, heads up", ROW(2),
    flip=-0.4, headsUp=True, **ALLBEDS)
# S33 (b116-120; 'duro' b118.1): the waitress, her one tray, every guest round her with a paw up for a coconut
s33 = [A('compote', 'happy_idle', 1.1, 2.15, at=0.4, speed=0.4, hold='tray', arm='R', aim=[0.55, 0.4, 0.35], upAt=-1)]
v = lens_for(s33, 175, 3.2, 116, 120, hs=(1.3, 1.5), fov=54, spread=20, facing=False)
add(116, 120, s33, "'hard': the waitress, her one tray of coconuts, every guest round her on their fronts with an empty paw up for one", v, bedMove='paw', pawAt=-1, coco=False, **{**ALLBEDS, 'flip': -5})
# S34 (b120-124; 'don't get tired now' b120.5): she flops onto a sunbed herself and lifts a paw too
COMP_BED = (2.0, 1.22)                                                    # the bed beside the cat's (BED_ORDER[1]): the tray falls in the aisle between them
s34 = [lying('compote', COMP_BED[0], COMP_BED[1], **FEETUP_L, upAt=S(120.6, 120))]
s34.append(kob(front=True))
v = view((1.0, 3.2, 4.6), (1.0, 0.5, 0.75), 60, p1=(1.0, 3.15, 4.5))   # review 3 (2nd fail): S24's proven lens, mirrored: the two ladies side by side   # review 2: from her feet her face was a dome and the pool ladder stood on her head
add(120, 124, s34, "'don't get tired now': the waitress flops onto the sunbed beside the cat's and lifts a paw, the cat beside her on her front", v, bedMove='front', **{**ALLBEDS, 'clear': [[-2.0, 0.9, 0.3], [2.0, 0.9, 0.3]]})
# S35 (b124-128; 'empieza' b125.8): the dog picks up the tray
s35 = [A('saxo', 'happy_idle', 0.95, 2.4, at=0.4, speed=0.3, hold='tray', arm='R', aim=[0.55, 0.4, 0.35], upAt=S(125.6, 124))]
v = ({'steady': True, 'ang': [180, 180], 'r': [3.1, 2.976], 'h': [1.4, 1.4], 'look': [0.96, 0.96], 'fov': 50}, [0.95, 2.4])   # passed review 2: frozen
add(124, 128, s35, "'only the beginning': the dog picks up the waitress's tray", v, bedMove='front', **{**ALLBEDS, 'clear': [[-2.0, 0.9, 0.3], [2.0, 0.9, 0.3]]})
# S36 (b128-132, 'move your head'): folded into S37 (review 4, the 3rd failed loop: the guests' lifted heads never read), so the payoff holds eight beats
# S37 (b132-136; 'kuduro' b134.2): the entertainer dances towards us between the sunbeds with the tray, serving the
# resort its coconuts; the cat's paw up behind him (the loop goes back to her toasting at the start)
s37 = [A('saxo', 'samba', -0.8, 1.0, face='camera', at=0.5, holdL='tray', arm='L', aim=[0.55, 0.4, 0.35], upAt=-1), kob(**SIDE, upAt=-1, hold='coconut', holdScale=1.5)]
v = view((0.0, 2.5, 4.8), (-0.1, 0.7, -3.0), 60, p1=(0.0, 2.47, 4.6), hand=0.3)   # the hook's lens again (the critic's fix): the cat toasting as in frame 1, the pool and the podium empty, the dog beside her with the tray
add(128, 136, s37, "'danza kuduro': frame 1 again: the cat on her sunbed toasting with a fresh coconut, but the pool behind her is empty, the podium too, and the entertainer dances beside her sunbed holding out the tray: her waiter now", v,
    bedMove='paw', pawAt=-1, coco=True, cocoAt=-1, **{**ALLBEDS, 'clear': [[-2.0, 0.9, 0.3], [2.0, 0.9, 0.3], [0.0, 3.2, 0.3]]})   # the guest under the lens: its cocktail filled the frame's bottom

for s in shots: clean(s['actors'])
shots.sort(key=lambda x: x['beat'])
ep = {
    'date': '2026-10-09', 'song': {'title': 'Danza Kuduro', 'artist': 'Don Omar & Lucenzo'},
    'logline': "The resort's entertainer calls the Danza Kuduro's moves at the pool and everyone obeys, the cat on her sunbed too, lying down: 'hand up' and her paw goes up for a coconut, 'half turn' and she rolls over to tan the other side; called in her face she obeys again, lying down, his splash attack soaks him instead, and one by one the whole resort goes over to her version, until every guest is lying in rows doing it in sync and the entertainer is the one serving the coconuts",
    'new': "src/maps37.js: resort (an all-inclusive resort's pool at midday: the aqua-gym class waist-deep in the water, dancing the called moves (`move`: dance, up, hips, turn, heads, splash) and climbing out for the sunbeds (`classOut`); the entertainer's KUDURO podium with speakers and tiki torches; rows of sunbeds whose box-pet sunbathers lie, raise a paw for a coconut (`bedMove: 'paw'`) and roll over in sync (`flip`); Kob's sunbed (a parasol, off unless a shot asks: `parasol`, `parasolTilt`); water dripping off the soaked (`drips`, with puddles); a sheet of water scooped out of the pool (`splashWall`); the pool bar; the clip's white villa with columns, the beach, a white-curtained cabana, the sea, the white yacht and green hills); src/ps1.js: the `coconut`, `tray`, `mic` and `brolly` props and the `cucumbers` face prop (cucumber slices over the eyes); two looks: saxo breton (the singer's white Breton top with navy stripes, white trousers, boat shoes, aviators) and compote waitress (a turquoise Hawaiian shirt, a white waist apron)",
    'notes': "The world, from the official video (contact sheets every 3 s; nothing violent in it): a white motor yacht off green Caribbean hills, a white villa with columns and a pool terrace, sunbathers in black on the sunpads, dancers on a white beach under a white-curtained cabana; the singer in a white Breton top with navy stripes, white trousers and aviators. The words, from whitelisted keywords per line (keywords.py: sorted, never the lines): a chorus of dance moves called out (hand up, waist alone, a half turn, don't get tired now, move your head), the sea, the sun, the girl, dancing, fire. Kob wears her spa look (the bathrobe and towel turban: the cat who won't touch the water), Sadi her beach look (the life vest and the flower: the keenest pupil in the pool), Compote the new waitress look. The class and the sunbathers are map objects.",
    'with': ['sadi', 'kob', 'compote'],
    'clips': ['happy_idle', 'samba', 'shimmy', 'macarena', 'charleston', 'chicken', 'northern_soul_spin', 'running_man', 'laying_idle', 'knocked_out_falling_to_stomach'],
    'tags': {'structure': 'malicious compliance', 'scenes': ['the entertainer on his podium', 'the aqua-gym class', 'hand up: her paw for a coconut', 'half turn: she rolls over', 'the waitress', 'in her face', 'the sleep mask', 'the splash backfires', 'Sadi lies down', 'the class climbs out', 'the resort lying down', 'paws up in sync', 'the synchronised roll over', 'the waitress quits', 'the entertainer serves'],
             'cast': ['saxo', 'sadi', 'kob', 'compote'], 'hook': 'dance', 'maps': ['resort'], 'ref': 'dog-human-job',
             'lyric_literal': "'hand up' (every paw goes up; the cat's for a coconut), 'waist alone' (the pool's hips), 'half turn' (the class turns round; the cat rolls over to tan the other side; the whole resort rolls over in sync), 'danza kuduro' (the dance), 'don't get tired now' (the cat's cucumber nap; the waitress lies down), 'move your head' (the pool's heads; every head turns to him), 'sea' (the class scoops the pool at her), 'sun' (Sadi lies down to dry), 'girl' (Sadi's coconut), 'dance' (he dances alone), 'fire' (the tiki torches over an empty pool)",
             'experiment': "A song whose chorus is dance moves called out, acted out as the dance class everyone has been dragged into at a holiday resort, with a pet-owner universal as the twist (the cat obeys every move to the letter, lying down) and a new structure (MALICIOUS COMPLIANCE): does a dance-class gag on a resort anthem everyone in Europe knows earn more likes per 1,000 views on the Short than the last week's chart-song episodes (8-10)?"},
    'yt': 'end',
    'shots': shots,
}
json.dump(ep, open(os.path.join(HERE, '2026-10-09.json'), 'w'), indent=1, ensure_ascii=False)
print(len(shots), 'shots;', len(WARN), 'warnings')
for w in WARN: print('  ', w)
