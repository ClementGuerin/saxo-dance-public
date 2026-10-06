# make_2026-10-06-2.py: writes episodes/2026-10-06-2.json, "Choosin' Texas" (Ella Langley, 2025; the queue being empty:
# Spotify US #2 after 352 days on the chart, global #13, 385k TikTok videos on its 60 s sound).
# The world (the official video, looked at as contact sheets): a white pickup with a horse trailer rolls past the
# WELCOME TO Abilene sign at golden hour; a Texas dance hall at night, string lights, pool tables, a bar, a Texas-shaped
# neon; the singer (long dark hair with bangs, a white blouse, red flares, an acoustic guitar) sings in a spotlight in
# the middle of the dance floor while the couples two-step round her; the cowboy in a white hat drifts off to the bar.
# Ours, "make the dog choose" (CHOICE, a new structure: every line the lead is offered the one who loves him and
# something his nature wants, and takes the thing; the payoff is the pet-owner video everyone knows, both calling him
# from either side): Sadi, the singer from Tennessee, falls for cowboy Saxo and he drives her back to Abilene (Compote
# glaring out of the horse trailer); at the dance hall she sings him her song, but he's a dog in Texas: he turns his
# back on her for the smell of Kob's barbecue, stares at a Texas-shaped steak over the counter (the counter-peek meme),
# dances with her for one line, leaves her for the mechanical bull (Compote throws him off it), lunges for the steak
# (Kob slides it away), follows it out across the hall; on her knees Sadi calls him back, Compote holds out her one
# carrot, Kob holds up the steak, and on 'choosin' Texas' the dog runs to the steak. Button: Compote's carrot bonks him.
# Beats: 112.000 BPM, kit beat b at b * 0.535714 s (kit beat 0 = song beat 26, bar 6); a bar = 4 beats (2.143 s).
# Sections (kit beats): b0-4 the intro's last bar; verse 1 b4-52 (lines K00 b5.1, K01 b21.1, K02 b37.0, K03 b45.4); the
# stop b52-56 (near silence; K04 starts over it); the chorus slams in at b56 (K04-K11 every 8 beats from b52.7); its
# last line ends b114.6; the music stops dead at b116 (62.14 s); silence to b116.93 (62.64 s).
# Key words (whitelisted single words with their beats, never the lines): fall b12.0 | love b13.9 | tennessee b15.1 |
# take b28.6 | back b29.6 | abilene b31.6 | back b40.5 | texas b54.1 | tell b56.3 | two b61.4 | smile b71.1 |
# face b76.2 | take b87.0 | see b92.3 | cowboy b94.3 | always b95.0 | finds b96.1 | leave b100.3 | choosin b109.2 |
# texas b110.5 | tell b112.4.
# The lyrics stay in episodes/2026-10-06-2.lyrics.js (the generator reads only their times).
import json, math, os, re, sys
sys.path.insert(0, os.path.dirname(__file__))
from cam import view, vpath, swoop, low, deadpan, orbit

HERE = os.path.dirname(__file__)
PER = 60 / 112.0
def T(b): return b * PER
def S(b, b0): return round(T(b) - T(b0), 3)    # seconds from shot beat b0 to beat b

LOOK = {'saxo': 'cowboy', 'sadi': 'singer', 'kob': 'pitmaster', 'compote': 'cowgirl'}
HEAD = {'saxo': 1.46, 'sadi': 1.32, 'kob': 1.5, 'compote': 1.44}        # the top of each head standing (the hats, the bow, the ears)
FACE = {'saxo': 0.9, 'sadi': 0.84, 'kob': 0.86, 'compote': 0.86}
RAD = {'saxo': 0.6, 'sadi': 0.45, 'kob': 0.42, 'compote': 0.42}           # the cowboy hat's brim widens his head
SIT = 0.06

# the maps (src/maps32.js)
SPOT = (0.0, -1.4)
BAR_X0, BAR_X1, BAR_Z0, BAR_Z1, BAR_Y = -7.2, -6.4, -6.2, 2.2, 0.82
KOB_BAR = (-7.75, -1.2); DECK = 0.3; BOARD = (-6.72, -1.2)
SMOKER = (-7.9, 3.6)
BULL = (5.2, -1.8); BULL_Y = 0.86; SADDLE = (5.25, -1.8)
CTRL = (7.35, 1.3); OPER = (7.95, 1.3)
DOORS = (9.0, 4.6)
CAB_Y = 1.02; DRIVER = (-0.35, 0.44); PASSENGER = (-0.35, -0.44); STAND = (4.1, -0.55); TRAILER_FLOOR = 0.45
COUNTER_MARK = (-5.98, -1.2)          # Saxo at the counter: his eyes and ears just over its top
CHOICE = {'saxo': (-0.1, 0.6), 'sadi': (-1.15, -1.5), 'compote': (0.3, -2.2), 'kob': (1.15, -1.5)}

def A(who, clip, x, z, **o):
    return {'who': who, 'look': o.pop('look', LOOK[who]), 'clip': clip, 'x': round(x, 3), 'z': round(z, 3), 'face': o.pop('face', 'camera'),
            'yaw': o.pop('yaw', 0), 'at': o.pop('at', 'auto'), **o}
def yaw_to(frm, to): return round(math.degrees(math.atan2(to[0] - frm[0], to[1] - frm[1])), 1)
def singer(x=SPOT[0], z=SPOT[1], **o):
    """Sadi with her acoustic guitar across both paws at the hips, facing the room (playing_a_guitar bowed her head over it)."""
    return A('sadi', o.pop('clip', 'happy_idle'), x, z, face=o.pop('face', 'world'), yaw=o.pop('yaw', 0), at=o.pop('at', 0.2), speed=o.pop('speed', 0.3), hold='acoustic',
             arm='both', aim=o.pop('aim', [0.2, -0.12, 0.55]), upAt=-1, **o)   # the paws in front of the belly: the guitar across it (at the hips it hung at her knees)

# ---- a projection check (numbers only): where each face lands in the 9:16 frame at the shot's start and end ----
def _proj(cam, look, fov, pt):
    f = [look[i] - cam[i] for i in range(3)]; n = math.sqrt(sum(v * v for v in f)); f = [v / n for v in f]
    r = [-f[2], 0.0, f[0]]; rn = math.sqrt(r[0] ** 2 + r[2] ** 2) or 1; r = [r[0] / rn, 0.0, r[2] / rn]
    u = [r[1] * f[2] - r[2] * f[1], r[2] * f[0] - r[0] * f[2], r[0] * f[1] - r[1] * f[0]]
    d = [pt[i] - cam[i] for i in range(3)]; z = sum(a * b for a, b in zip(d, f))
    if z <= 0.05: return None
    tv = math.tan(math.radians(fov) / 2); th = tv * 9 / 16
    return (0.5 + sum(a * b for a, b in zip(d, r)) / z / th / 2, 0.5 - sum(a * b for a, b in zip(d, u)) / z / tv / 2)
_src = open(os.path.join(HERE, '2026-10-06-2.lyrics.js')).read()
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

shots = []
def lens(v, k=0):
    c, f = v; a = math.radians(c['ang'][k]); fy = f[2] if len(f) > 2 else 0
    return (f[0] + math.sin(a) * c['r'][k], c['h'][k] + fy, f[1] + math.cos(a) * c['r'][k])
def clear_at(v, r=0.9):                         # no patron at the lens or along its first stretch of sight
    c, f = v; out = []
    for k in (0, -1):
        p = lens(v, k); out.append([round(p[0], 2), round(p[2], 2), r])
        for u in (0.15, 0.3, 0.45):
            q = (p[0] + (f[0] - p[0]) * u, p[2] + (f[1] - p[2]) * u); out.append([round(q[0], 2), round(q[1], 2), r * 0.8])
    return out
def add(beat, b1, mp, actors, lyric, v, **o):
    c, focus = v
    o = {k: val for k, val in o.items() if val is not None}
    if mp == 'honkytonk': o.setdefault('clear', clear_at(v) + [[a['x'], a['z'], 0.7] for a in actors] + [[a['x'] + a.get('mx', 0), a['z'] + a.get('mz', 0), 0.7] for a in actors])
    shots.append({'beat': beat, 'kind': 'dance', 'map': mp, 'actors': actors, 'lyric': lyric, 'cam': c, 'focus': focus, **o})
    fy = focus[2] if len(focus) > 2 else 0
    for k, end in ((0, 0), (-1, 1)):
        cam, look = lens(v, k), (focus[0], c['look'][k] + fy, focus[1])
        check(beat, b1, cam, look, c['fov'], actors, end)
        for oc in _occl(cam, look, c['fov'], [body(a, end)[:4] for a in actors if not a.get('lying') and not a.get('fg') and not a.get('away')]):
            WARN.append(f'b{beat}: {oc}{" at the end" if end else ""}')
def clean(actors):                               # the generator's own keys off the actors
    for a in actors:
        for k in ('sit', 'sitDrop', 'lying', 'away'): a.pop(k, None)
    return actors

# ================= a lens search: every face inside the frame and under the lyric rows at the shot's start and end,
# no face inside a nearer head's disc, the lens free of the set =================
def tonk_free(c):
    x, y, z = c
    if y < 0.12 or y > 5.4 or abs(x) > 8.7 or abs(z) > 7.7: return False
    if BAR_X0 - 0.15 < x < BAR_X1 + 0.2 and BAR_Z0 - 0.15 < z < BAR_Z1 + 0.15 and y < BAR_Y + 0.2: return False
    if x < BAR_X0 and y < DECK + 0.25: return False
    if math.hypot(x - BULL[0], z - BULL[1]) < 1.2 and y < 1.7: return False
    if math.hypot(x - CTRL[0], z - CTRL[1]) < 0.55 and y < 1.2: return False
    for px, pz in ((4.2, -6.4), (7.0, -6.4)):
        if abs(x - px) < 0.7 and abs(z - pz) < 1.1 and y < 1.0: return False
    if abs(x) < 2.2 and z < -6.3 and y < 1.4: return False
    for tx, tz in ((-4.2, 5.6), (0.0, 6.4), (4.2, 5.6)):
        if math.hypot(x - tx, z - tz) < 0.65 and y < 0.95: return False
    if math.hypot(x - SMOKER[0], z - SMOKER[1]) < 1.0 and y < 2.2: return False
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
def lens_for(actors, ang, dist, b0, b1, hs=(1.0,), fov=50, look=None, spread=40, dr=(0.8, 1.5), free=tonk_free, push=0.04, facing=True, maxoff=105, **o):
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
                f = _ok(cam, L, fov, phases, line, occ, maxoff)
                if f is None or f < 0: continue
                score = abs(da) / 40 + abs(d - dist) / dist + (0.25 - min(f, 0.25))
                if best is None or score < best[0]: best = (score, cam)
    if best is None:
        raise SystemExit(f'b{b0}: no lens for {[s_[0] for s_ in phases[0]]} round {ang} deg at {dist} m; rejections: {sorted(WHY.items(), key=lambda kv: -kv[1])[:6]}, not free: {nfree}')
    cam = best[1]; p1 = (cam[0] + (L[0] - cam[0]) * push, cam[1], cam[2] + (L[2] - cam[2]) * push)
    return view(tuple(round(c, 3) for c in cam), tuple(round(c, 3) for c in L), fov, p1=tuple(round(c, 3) for c in p1), **o)

GC = [0.95, -0.85, 25]          # the singer's open guitar case on the floor beside the spotlight, its TENN plate up
def HEART(x, y, z, s0): return [round(x, 2), round(y, 2), round(z, 2), round(s0, 2)]

# =====================================================================================================================
# BEAT 1, the verse (b0-52): she falls for the cowboy; he drives her back to Abilene; the dance hall; the smell
# S00 the hook (b0-4, the intro's last bar): a swoop from behind a front table down to the floor: cowboy Saxo in the
# horse-riding dance, the whole hall line-dancing behind him under the TEXAS neon
s00 = [A('saxo', 'gangnam', 0.0, 0.9, at=1.1)]
v = swoop([(0.3, 2.3, 7.7), (0.18, 1.5, 5.7), (0.06, 0.55, 3.7), (0.0, 0.34, 3.15)], (0.0, 0.82, 0.9), fov=66, roll=(0, -3, -10, -5), ease='out')
add(0, 4, 'honkytonk', s00, "the hook: a swoop from behind a front table down to the dance floor: cowboy Saxo doing the horse-riding dance, the whole hall line-dancing behind him under the TEXAS neon", v,
    patrons='line', clear=[[0.0, 6.7, 1.3], [0.0, 5.0, 1.0], [0.0, 3.3, 0.9], [0.0, 0.9, 0.8]])
# S01 (b4-8; the Short's first frame): a low dolly-in with a dutch roll on his charleston kick, the line behind him
s01 = [A('saxo', 'charleston', 0.0, 0.9, at=0.53)]   # the kick (clip 1.6 s) lands mid-shot
v = low((-1.25, 0.22, 3.35), (0.0, 0.8, 0.9), (-0.95, 0.2, 2.75), fov=64, roll=(-10, -6))
add(4, 8, 'honkytonk', s01, "a low dolly-in on cowboy Saxo's charleston kick, the line dancers behind him", v, patrons='line')
# S02 (b8-12): Sadi, the singer, in the spotlight in the middle of the floor with her acoustic guitar, her open guitar
# case at her feet (a TENN plate on its lid); couples two-step round her (the clip)
s02 = [singer()]
v = lens_for(s02, 18, 2.9, 8, 12, hs=(0.85, 0.95), fov=56, spread=10, dr=(0.95, 1.25), push=0.08, roll=[5, 2], hand=0.25)
add(8, 12, 'honkytonk', s02, "Sadi, the singer, in the spotlight with her acoustic guitar, her open guitar case at her feet (a Tennessee plate on its lid); couples two-step round her", v,
    patrons='twostep')
# S03 (b12-16, 'fall' b12.0, 'love' b13.9, 'tennessee' b15.1): she sees him dancing and falls for him: hearts pop over
# her head; Saxo dances in front of her, the guitar case with its plate on the floor
s03 = [A('saxo', 'gangnam', 1.15, 0.45, face='world', yaw=-10, at=1.1), singer(-0.15, -1.3, yaw=35)]
v = lens_for(s03, 8, 4.5, 12, 16, hs=(0.9, 1.05), fov=56, spread=12, dr=(0.95, 1.2), push=0.04)
s03_clear = [[2.6, 1.6, 1.2], [2.2, 0.2, 1.0], [1.8, 2.8, 1.1]]
add(12, 16, 'honkytonk', s03, "'fall', 'love', 'tennessee': Sadi sees cowboy Saxo dancing and falls for him: hearts pop over her head; her guitar case with its Tennessee plate on the floor", v,
    patrons='twostep', hearts=[HEART(-0.15, 1.5, -1.3, 0.0), HEART(-0.15, 1.5, -1.3, 1.0)], clear=clear_at(v) + s03_clear + [[a['x'], a['z'], 0.8] for a in s03])
# S04 (b16-20): over her shoulder: he dances for her, she sways with the guitar, more hearts
s04 = [A('saxo', 'charleston', 0.5, 0.45, at=0.7), singer(-0.55, -1.45, yaw=25)]
v = lens_for(s04, 8, 3.6, 16, 20, hs=(0.24, 0.3), fov=64, spread=10, dr=(0.95, 1.25), push=0.1, roll=[-8, -5], hand=0.3)
add(16, 20, 'honkytonk', s04, "a low dolly-in on cowboy Saxo's charleston for her, Sadi behind him with her guitar and hearts over her head", v,
    patrons='twostep', hearts=[HEART(-0.55, 1.5, -1.45, 0.25)])

# S05 (b20-24): the road at golden hour: the white pickup and its horse trailer roll towards Abilene, the two in the cab
def CAB(): return [A('saxo', 'male_driving_a_car', *DRIVER, face='world', yaw=270, at=0.5, lift=CAB_Y, sit=True),
                   A('sadi', 'sitting_talking', *PASSENGER, face='world', yaw=325, at=0.05, speed=0.0, lift=CAB_Y, sit=True, arm='L', aim='heart', upAt=-1)]
s05 = CAB()
v = view((-10.5, 1.15, -3.4), (-0.2, 1.45, 0.2), 40, p1=(-10.0, 1.15, -3.3), ease='lin')
add(20, 24, 'prairie', s05, "the road at golden hour: the white pickup and its horse trailer roll towards Abilene, cowboy Saxo at the wheel, Sadi beside him", v)
# S06 (b24-28): through the windshield: Saxo driving, Sadi gazing at him, her paw on her heart
s06 = CAB()
v = view((-4.6, 2.12, 0.05), (-0.35, 1.84, 0.0), 46, p1=(-4.45, 2.11, 0.05), hand=0.25)
add(24, 28, 'prairie', s06, "through the windshield: cowboy Saxo driving, Sadi beside him gazing at him with her paw on her heart, hearts over her", v,
    hearts=[HEART(-1.15, 1.72, -0.42, 0.15), HEART(-1.15, 1.72, -0.42, 1.1)], heartYaw=-90)
# S07 (b28-32, 'take' b28.6, 'back' b29.6, 'abilene' b31.6): from beside the trailer, the WELCOME TO ABILENE TEXAS sign
# comes up the road and passes on the word
s07 = CAB()
v = view((-5.9, 3.05, 3.9), (-0.8, 1.95, -1.2), 58, p1=(-5.75, 3.02, 3.82))   # high front three-quarters: the two in the cab, the sign's board over the cab beyond them   # the road ahead, front three-quarters at cab height: the cab, the trailer's near window, the sign beyond
add(28, 32, 'prairie', s07, "'abilene': the rig rolls into Abilene, Saxo at the wheel, Sadi beside him, the WELCOME TO ABILENE TEXAS sign sliding past behind them on the word", v,
    sign=round(S(31.6, 28) + 1.0 / 9, 3))
# S08 (b32-36): the horse trailer's window: Compote's furious face (she rode in the horse trailer)
s08 = [A('compote', 'happy_idle', *STAND, face='world', yaw=180, at=0.4, speed=0.25, lift=TRAILER_FLOOR)]
v = deadpan(STAND, 1.45, 2.8, cam_y=1.45, push=0.1, fov=46, ang=180)
add(32, 36, 'prairie', s08, "the horse trailer's side window: Compote rode in the horse trailer, and her face says so", v)

# S09 (b36-40): night: the dance hall's doors swing open and the two walk in from the car park; the patrons turn
s09 = [A('saxo', 'happy_walk', 10.15, 4.25, face='world', yaw=270, at=0.2, mx=-1.9, reveal=0.6), A('sadi', 'happy_walk', 10.35, 5.0, face='world', yaw=270, at=0.6, mx=-1.9, reveal=0.6)]
v = lens_for(s09, 255, 4.4, 36, 40, hs=(1.0, 1.15), fov=54, spread=20, dr=(0.95, 1.3), push=0.03)
add(36, 40, 'honkytonk', s09, "night: the dance hall's doors swing open and cowboy Saxo and Sadi walk in from the car park; the patrons turn to look", v,
    doors=[0.0, 0.35, 0, 1], patrons='watch', stare=[9.0, 4.6])
# S10 (b40-44, 'back' b40.5): Sadi steps into the spotlight with her guitar; Saxo turns his back on her: nose to the
# bar, tongue out (the smell of the barbecue)
s10 = [singer(0.2, -1.5, yaw=-15), A('saxo', 'happy_idle', -1.3, 0.35, face='world', yaw=-52, at=0.4, speed=0.3, tongue=True, lean=10)]
v = lens_for(s10, -30, 4.6, 40, 44, hs=(0.95, 1.1), fov=56, look=(-0.85, 0.95, -0.55), spread=15, dr=(0.95, 1.25), push=0.04)
add(40, 44, 'honkytonk', s10, "'back': Sadi steps into the spotlight with her guitar, and Saxo turns his back on her, nose to the bar, tongue out: the smell of the barbecue", v,
    patrons='twostep')
# S11 (b44-48): Kob, the pitmaster behind the bar, holds up the steak on its board: Texas-shaped; the smoker smokes
s11 = [A('kob', 'happy_idle', *KOB_BAR, face='world', yaw=90, at=0.5, speed=0.2, lift=DECK, hold='steak', arm='both', aim=[0.25, 0.12, 0.72], upAt=-1)]
v = deadpan(KOB_BAR, 1.35, 3.2, cam_y=1.44, push=0.12, fov=40, ang=90)
add(44, 48, 'honkytonk', s11, "Kob, the pitmaster behind the bar, holds up her steak on its board, deadpan: it's shaped like Texas", v, steak=False, patrons='watch')
# S12 (b48-52): Saxo trots to the bar, tongue out; Sadi sings behind him, watching him go
s12 = [singer(0.6, -1.2, yaw=-70), A('saxo', 'happy_walk', -2.0, -0.3, face='world', yaw=265, at=0.3, mx=-1.6, mz=-0.15, tongue=True)]
v = view((-7.3, 1.2, -2.0), (-2.6, 0.95, -0.7), 46, p1=(-7.25, 1.2, -1.98))   # from behind the counter: the steak's point of view
add(48, 52, 'honkytonk', s12, "from behind the counter: Saxo trots towards the bar with his tongue out; behind him in the spotlight Sadi turns to watch him go", v, patrons='twostep',
    clear=clear_at(v) + [[-5.7, 0.4, 1.0], [-5.8, -3.0, 1.0], [-5.6, -4.6, 1.0], [-5.8, 3.6, 1.0], [-2.0, -0.3, 0.8], [-3.6, -0.45, 0.8]])
# S13 (b52-56, the stop: near silence; 'texas' b54.1): the counter-peek: his eyes and ears just over the counter's edge,
# staring at the Texas-shaped steak on its board in front of the lens
s13 = [A('saxo', 'happy_idle', *COUNTER_MARK, face='world', yaw=270, at=0.6, speed=0.0, lift=-0.16)]   # only his eyes and ears over the counter
v = view((-8.15, 1.42, -1.2), (-6.0, 1.02, -1.2), 54, p1=(-8.1, 1.41, -1.2), ease='lin')
add(52, 56, 'honkytonk', s13, "the stop, 'texas': the counter-peek: Saxo's eyes and ears just over the edge of the counter, staring at the Texas-shaped steak", v,
    still=True, steakTilt=0.3, patrons='watch', smoke=False)

# =====================================================================================================================
# BEAT 2, the chorus (b56-116): the line dance; one line with her; the bull; the steak; he follows it; the choice
# S14 (b56-60, the slam, 'tell' b56.3): the band slams back in: the whole hall line-dances, Sadi strumming in the
# spotlight, Saxo back on the floor in the front of the line
s14 = [singer(-0.35, -1.4, yaw=8), A('saxo', 'charleston', 1.35, -2.5, at=0.7)]
v = view((2.6, 3.4, 5.9), (0.4, 0.7, -2.2), 54, p1=(2.45, 3.25, 5.5), ease='lin')
add(56, 60, 'honkytonk', s14, "the slam: the whole hall line-dances under the TEXAS neon, Sadi strumming in the spotlight, Saxo kicking at the front of the line", v, patrons='line')
# S15 (b60-64, 'two' b61.4): the two of them dancing side by side in sync, hearts over Sadi
s15 = [A('sadi', 'charleston', -0.55, -1.25, at=0.7), A('saxo', 'charleston', 0.55, -1.25, at=0.7)]
v = lens_for(s15, 0, 4.0, 60, 64, hs=(0.3, 0.38), fov=62, spread=10, dr=(0.95, 1.25), push=0.08, roll=[-7, -4], hand=0.3)
add(60, 64, 'honkytonk', s15, "'two': the two of them kicking side by side in sync in the spotlight, hearts over Sadi", v,
    patrons='line', hearts=[HEART(-0.55, 1.45, -1.25, 0.35)])
# S16 (b64-68): he trots off towards the mechanical bull mid-dance, tongue out; Sadi dances on alone
s16 = [A('sadi', 'charleston', -0.55, -1.25, at=round(0.7 + T(4), 3)), A('saxo', 'happy_walk', 0.6, -1.2, face='world', yaw=95, at=0.2, mx=1.7, mz=-0.15, tongue=True)]
v = lens_for(s16, -30, 4.6, 64, 68, hs=(1.0, 1.15), fov=56, spread=15, dr=(0.95, 1.3), push=0.03, facing=False)
add(64, 68, 'honkytonk', s16, "mid-dance he trots off towards the mechanical bull, tongue out; Sadi dances on alone", v, patrons='line', bull={'buck': 0.15})
# S17 (b68-72, 'smile' b71.1): on the bull: grinning, tongue out, his paw up; it bucks; Compote at the lever beyond
RIDE = dict(face='world', yaw=270, lift=BULL_Y, hop=[0.05, 1], air=True, sit=True)
s17 = [A('saxo', 'male_driving_a_car', *SADDLE, at=0.5, tongue=True, arm='R', aim=[0.62, 0.6, 0.15], upAt=-1, **RIDE)]
v = lens_for(s17, 250, 3.2, 68, 72, hs=(1.3, 1.45, 1.6), fov=54, spread=20, dr=(0.9, 1.4), push=0.05, roll=[-6, -3], hand=0.4)
add(68, 72, 'honkytonk', s17, "'smile': cowboy Saxo on the mechanical bull, grinning with his tongue out, one paw up; it bucks", v,
    bull={'buck': 0.8}, patrons='watch', stare=list(BULL))
# S18 (b72-76): Sadi alone in the spotlight, her paw on her heart, watching him ride
s18 = [A('sadi', 'happy_idle', *SPOT, face='world', yaw=40, at=0.5, speed=0.0, arm='L', aim='heart', upAt=-1)]
v = deadpan(SPOT, 0.97, 2.3, cam_y=1.02, push=0.1, fov=42, ang=20)
add(72, 76, 'honkytonk', s18, "Sadi alone in the spotlight, her paw on her heart, watching him ride", v, patrons='watch', stare=list(BULL), bull={'buck': 0.8})
# S19 (b76-80, 'face' b76.2): Compote's face at the controls, her paw on the lever
s19 = [A('compote', 'happy_idle', *OPER, face='world', yaw=270, at=0.4, speed=0.2, arm='R', aim=[0.3, 0.12, 0.75], aim2=[0.3, -0.35, 0.25], aim2At=S(79.4, 76), upAt=-1)]
v = deadpan(OPER, 1.06, 2.4, cam_y=1.12, push=0.1, fov=42, ang=270)
add(76, 80, 'honkytonk', s19, "'face': Compote's face at the bull's controls, her paw on the lever; at the end of the bar she yanks it to the end", v, patrons='watch', bull={'buck': 0.8}, lever=[S(79.4, 76), S(79.7, 76), 0, 1])
# S20 (b80-84): she yanks the lever to the end: the bull rears and throws him off sideways across the mats
s20 = [A('saxo', 'being_thrown_to_the_side', SADDLE[0] - 0.5, SADDLE[1] + 0.3, face='world', yaw=300, at=0.75, speed=0.6, once=True, lift=1.15, my=-1.15, myAt=0.45, myDur=0.6, mx=-1.3, mz=0.9, moveAt=0.0, air=True, ground='mesh'),
       ]
v = view((1.1, 1.65, 1.9), (4.3, 1.38, -1.0), 62, p1=(1.2, 1.65, 1.85))   # front three-quarters on the side he flies to: his face, the bull rearing behind him   # side on: the bull in profile, its head to the left
add(80, 84, 'honkytonk', s20, "the bull rears and throws cowboy Saxo off sideways across the mats", v,
    lever=1, bull={'buck': 1.0, 'throw': 0.0}, patrons='watch', stare=list(BULL))
# S21 (b84-88, 'take' b87.0): he comes to at the counter, nose to the steak; he lunges for it and Kob slides the board away
s21 = [A('saxo', 'happy_idle', COUNTER_MARK[0] + 0.22, COUNTER_MARK[1], face='world', yaw=270, at=0.6, speed=0.3, tongue=True, lean=12, lift=-0.08),
       A('kob', 'happy_idle', -7.75, 0.25, face='world', yaw=110, at=0.5, speed=0.2, lift=DECK, arm='L', aim=[0.6, -0.12, 0.62], aim2=[0.35, -0.1, 0.3], aim2At=S(86.8, 84), upAt=-1, fg=True)]
v = view((-8.6, 1.5, -0.95), (-6.2, 0.98, -0.6), 62, p1=(-8.55, 1.49, -0.94))   # the counter-peek's lens, wider: the board slides right, out from under his nose, to Kob's paw   # the counter-peek's lens again, Kob's paw coming in at the left
add(84, 88, 'honkytonk', s21, "'take': back at the counter he lunges for the steak under his nose, and Kob pulls the board away to herself", v,
    boardSlide=[S(86.8, 84), S(87.8, 84), 1.25], patrons='watch', steakTilt=0.25, clear=[[-5.6, -1.2, 1.4], [-5.7, 0.4, 1.0], [-5.8, -3.0, 1.0]])
# S22 (b88-92): Kob carries the steak across the hall towards the doors; Saxo trots after it, tongue out
s22 = [A('kob', 'happy_walk', -3.0, 0.9, face='world', yaw=55, at=0.3, mx=0.75, mz=0.55, hold='steak', holdScale=1.3, arm='both', aim=[0.25, 0.28, 0.7], upAt=-1),
       A('saxo', 'happy_walk', -3.42, -0.24, face='world', yaw=55, at=0.7, mx=0.75, mz=0.55, tongue=True)]
v = lens_for(s22, 70, 4.2, 88, 92, hs=(0.95, 1.1), fov=56, spread=20, dr=(0.95, 1.3), push=0.02)
add(88, 92, 'honkytonk', s22, "Kob carries the steak across the hall towards the doors, and cowboy Saxo trots after it, tongue out", v, patrons='watch', steak=False)
# S23 (b92-96, 'see' b92.3, 'cowboy' b94.3, 'always' b95.0): Sadi sees him go: her deadpan in the spotlight
s23 = [singer(yaw=0, at=0.6, speed=0.0)]
v = deadpan(SPOT, 0.97, 2.3, cam_y=1.02, push=0.12, fov=42, ang=0)
add(92, 96, 'honkytonk', s23, "'see', 'cowboy', 'always': Sadi sees him go, deadpan in the spotlight, guitar in her paws", v, patrons='watch', steak=False)
# S24 (b96-100, 'finds' b96.1, 'leave' b100.3): over her shoulder: the cowboy leaves her, following the steak to the doors
s24 = [A('kob', 'happy_walk', 8.25, 4.85, face='world', yaw=90, at=0.3, mx=1.6, hold='steak', holdScale=1.3, arm='both', aim=[0.25, 0.28, 0.7], upAt=-1, away=True),
       A('saxo', 'happy_walk', 7.2, 4.35, face='world', yaw=90, at=0.7, mx=1.6, tongue=True, away=True)]
v = view((4.6, 1.2, 2.2), (9.2, 1.0, 4.7), 52, p1=(4.7, 1.2, 2.25))   # from inside: their backs going out of the doors into the night, Kob's board beside him
add(96, 100, 'honkytonk', s24, "'finds', 'leave': the cowboy leaves: he follows Kob and the steak out of the doors into the night", v, patrons='watch', steak=False, doors=1, stare=[9.0, 4.6])
# S25 (b100-104): she drops to her knees in the spotlight and begs; the patrons gather round in a ring
s25 = [A('sadi', 'falling_to_knees_in_prayer', *CHOICE['sadi'], face='world', yaw=yaw_to(CHOICE['sadi'], CHOICE['saxo']), at=1.9, speed=0.55, once=True)]
v = lens_for(s25, 40, 2.7, 100, 104, hs=(0.55, 0.7), fov=52, spread=15, dr=(0.95, 1.25), push=0.05)
add(100, 104, 'honkytonk', s25, "she clasps her paws and begs him to come back; the patrons gather round in a ring", v,
    patrons='watch', ring=[0.0, -0.6, 4.6, 100, 260], steak=False)
# S26 (b104-108): the choice: from behind the dog: Sadi on her knees, Compote holding out her one carrot, Kob holding
# out the steak; the whole hall watching in a ring
PRAY = dict(face='world', at=3.0, speed=0.0)   # falling_to_knees_in_prayer: paws together under the chin, held (begging)
s26 = [A('sadi', 'falling_to_knees_in_prayer', *CHOICE['sadi'], yaw=yaw_to(CHOICE['sadi'], CHOICE['saxo']), **PRAY),
       A('compote', 'happy_idle', *CHOICE['compote'], face='world', yaw=0, at=0.4, speed=0.2, hold='carrot', holdScale=1.8, arm='R', aim=[0.62, 0.3, 0.4], upAt=-1),
       A('kob', 'happy_idle', *CHOICE['kob'], face='world', yaw=yaw_to(CHOICE['kob'], CHOICE['saxo']), at=0.5, speed=0.2, hold='steak', holdScale=1.5, arm='both', aim=[0.25, 0.28, 0.7], upAt=-1)]
v = lens_for(s26, 0, 5.4, 104, 108, hs=(1.0, 1.1), fov=60, look=(0.0, 0.85, -1.7), spread=10, dr=(0.9, 1.3), push=0.05, facing=False)
add(104, 108, 'honkytonk', s26, "the choice, from the dog's eye level: Sadi on her knees, Compote holding out her one carrot, Kob holding out the steak; the whole hall watching in a ring", v,
    patrons='watch', ring=[0.0, -0.6, 4.6, 95, 265], steak=False)
# S27 (b108-109): his blank stare (the brain-stopped meme): frozen, frontal
s27 = [A('saxo', 'happy_idle', *CHOICE['saxo'], face='world', yaw=180, at=0.4, speed=0.0)]
v = deadpan(CHOICE['saxo'], 1.08, 2.4, cam_y=1.1, push=0.16, fov=42, ang=180)   # a slow creep: held dead still, the stare tripped freezedetect (0.47 s)
add(108, 109, 'honkytonk', s27, "his blank stare: the dog's brain stops", v, still=True, patrons='watch', ring=[0.0, -0.6, 4.6, 95, 265], steak=False)
# S28 (b109-112, 'choosin' b109.2, 'texas' b110.5): he bolts for the steak and chomps it out of Kob's paws on 'Texas'
run_to = (CHOICE['kob'][0] - 0.45, CHOICE['kob'][1] + 0.55)
RUN0 = CHOICE['saxo']
s28 = [A('saxo', 'happy_run', *RUN0, face='world', yaw=yaw_to(RUN0, run_to), at=0.1, speed=1.2, mx=round(run_to[0] - RUN0[0], 3), mz=round(run_to[1] - RUN0[1], 3), moveAt=0.05, steakMouth=S(110.5, 109), reveal=0.45),
       A('kob', 'happy_idle', *CHOICE['kob'], face='world', yaw=yaw_to(CHOICE['kob'], CHOICE['saxo']), at=0.5, speed=0.2, hold='steak', holdScale=1.3, holdTo=S(110.5, 109), arm='both', aim=[0.25, 0.28, 0.7], upAt=-1)]
v = lens_for(s28, 40, 5.2, 109, 112, hs=(1.0, 1.15, 1.3), fov=60, spread=20, dr=(0.95, 1.4), push=0.02, facing=False)
add(109, 112, 'honkytonk', s28, "'choosin' Texas': the dog bolts for the steak and chomps it out of Kob's paws on 'Texas'", v, patrons='watch', ring=[0.0, -0.6, 4.6, 150, 330], steak=False)
# S29 (b112-116, 'tell' b112.4): the steak in his jaws, hearts; Kob deadpan; Compote throws her carrot, it bonks him
end_saxo = run_to
s29 = [A('saxo', 'happy_idle', *end_saxo, face='world', yaw=25, at=0.4, speed=0.4, steakMouth=True, dizzy=S(114.6, 112)),
       A('kob', 'happy_idle', 1.5, -1.05, face='world', yaw=-20, at=0.5, speed=0.2, arm='both', aim=[0.25, 0.28, 0.7], upAt=-1),
       A('compote', 'happy_idle', -0.55, -1.45, face='world', yaw=60, at=0.4, speed=0.2, hold='carrot', arm='R', aim=[0.25, 0.08, 0.66], aim2=[0.55, 0.55, 0.3], aim2At=S(113.9, 112), upAt=-1,
         toss={'at': S(114.0, 112), 'to': [round(end_saxo[0], 3), 1.42, round(end_saxo[1], 3)], 'dur': 0.5, 'arc': 0.6, 'scale': 1.4})]
v = lens_for(s29, 15, 4.8, 112, 116, hs=(1.0, 1.15, 1.3), fov=56, spread=25, dr=(0.9, 1.35), push=0.04)
add(112, 116, 'honkytonk', s29, "the dog with the Texas steak in his jaws, hearts over him; Kob deadpan with empty paws; Compote throws her rejected carrot and it bonks him", v,
    patrons='cheer', ring=[0.0, -0.6, 4.6, 95, 265], steak=False, hearts=[HEART(end_saxo[0], 1.6, end_saxo[1], 0.2)])
# S30 the button (b116-116.93, the dead stop and its silence): frozen: the dazed dog, the steak still in his jaws
s30 = [A('saxo', 'happy_idle', *end_saxo, face='world', yaw=25, at=round(0.4 + T(4) * 0.4, 3), speed=0.0, steakMouth=True, dizzy=True)]
c, f = v; v30 = (dict(c, ang=[c['ang'][-1]] * 2, r=[round(c['r'][-1] * 0.8, 3)] * 2, h=[c['h'][-1]] * 2, look=[c['look'][-1]] * 2), f)
add(116, 116.93, 'honkytonk', s30, "the button: the music stops dead; the dazed dog, stars round his hat, the steak still in his jaws", v30,
    still=True, patrons='cheer', stop=0.0, ring=[0.0, -0.6, 4.6, 95, 265], steak=False)

for s in shots: clean(s['actors'])
shots.sort(key=lambda x: x['beat'])
ep = {
    'date': '2026-10-06', 'song': {'title': "Choosin' Texas", 'artist': 'Ella Langley'},
    'logline': "Sadi, a honky-tonk singer from Tennessee, sings her heart out to cowboy Saxo, but he's a dog in Texas: he turns his back on her for the smell of Kob's barbecue, leaves her for the mechanical bull, chases a Texas-shaped steak across the dance hall, and when she drops to her knees and the whole hall makes him choose, the dog runs to the steak on 'choosin' Texas'",
    'new': "src/maps32.js: honkytonk (an Abilene dance hall at night: the dance floor with the singer's spotlight, a TEXAS neon shaped like the state, the bar with Kob's duckboard and a Texas-shaped steak on its board (it slides away along the counter), a barrel smoker, a mechanical bull that bucks and throws on a lever Compote pulls, double doors onto the car park with the pickup, pool tables, a jukebox, wagon-wheel chandeliers, the Lone Star flag, pet patrons in cowboy hats who line-dance, two-step in couples, watch, cheer and gather in a ring) and prairie (the road into Abilene at golden hour streaming past a still pickup with its horse trailer, the WELCOME TO ABILENE TEXAS sign passing on the word); the Texas-shaped steak (texasSteak: on a board in both paws, in the jaws: `steakMouth`), the singer's acoustic guitar; two looks: Sadi the singer from the clip (long dark hair with bangs, a white peasant blouse, red flares, cowboy boots) and Kob the barbecue pitmaster (a black cowboy hat, a red bandana, a denim shirt, a leather apron)",
    'notes': "The world, from the official video (looked at as contact sheets every 3 s; nothing violent in it): a pickup with a horse trailer, the WELCOME TO Abilene sign at golden hour, a dance hall at night (string lights, pool tables, a bar, a Texas-shaped neon), the singer with an acoustic guitar in a spotlight on the floor while couples two-step round her, a cowboy in a white hat. The words, from whitelisted keywords per line (keywords.py: sorted, never the lines): fall, love, tennessee, take, back, abilene, texas, tell, two, smile, face, see, cowboy, always, finds, leave, choosin. Cast: Saxo the cowboy (his wardrobe cowboy look), Sadi the singer (new), Kob the pitmaster with the steak (new), Compote at the bull's lever (her cowgirl look) and in the horse trailer. The TikTok sound (Ella Langley, 60 s) is this cut's own kit 2.014-62.014 s.",
    'with': ['sadi', 'kob', 'compote'],
    'clips': ['happy_idle', 'happy_walk', 'happy_run', 'sitting_talking', 'male_driving_a_car', 'playing_a_guitar', 'charleston', 'being_thrown_to_the_side',
              'jump_and_catch_with_one_hand', 'falling_to_knees_in_prayer'],
    'yt': [2.4, 61.9],
    'tags': {'structure': 'choice', 'scenes': ['the horse-riding dance', 'falls in love', 'the drive into Abilene', 'Compote in the horse trailer', 'the doors swing open', 'the counter-peek', 'the line dance', 'one line together', 'the mechanical bull', 'thrown off', 'the steak slides away', 'he follows the steak', 'she begs on her knees', 'make the dog choose', 'the chomp', 'the carrot bonk'],
             'cast': ['saxo', 'sadi', 'kob', 'compote'], 'hook': 'dance', 'maps': ['honkytonk', 'prairie'], 'ref': 'counter-peek',
             'lyric_literal': "'fall', 'love' (hearts over her), 'tennessee' (the TENN plate on her guitar case), 'abilene' (the sign passes on the word), 'back' (he turns his back on her), 'texas' (the counter-peek at the Texas steak), 'two' (the two of them dancing), 'smile' (his grin on the bull), 'face' (Compote's face at the lever), 'take' (he lunges, the steak slides away), 'see' (her deadpan), 'cowboy, always, finds, leave' (he follows the steak away), 'choosin' Texas' (the dog chooses the Texas steak)",
             'experiment': "The pet-owner format everyone knows as the payoff (make the dog choose: the one who loves him on her knees, the treat held out, the dog runs to the treat), landing on the song's own title line, on a #2 US country hit with a 385k-video sound: more shares per 1,000 views than the last week's episodes?"},
    'shots': shots,
}
json.dump(ep, open(os.path.join(HERE, '2026-10-06-2.json'), 'w'), indent=1, ensure_ascii=False)
print(len(shots), 'shots;', len(WARN), 'warnings')
for w in WARN: print('  ', w)
