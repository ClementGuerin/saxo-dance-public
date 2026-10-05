# make_2026-10-06.py: writes episodes/2026-10-06.json, "Golden" (HUNTR/X with EJAE, AUDREY NUNA and REI AMI, from the
# 2025 film KPop Demon Hunters; the queue being empty: Spotify global #70 after 470 days on the chart, 2.12M TikTok
# videos on its 60 s sound, the biggest of the night's shortlist).
# The world (the film's own "Golden" sequence, studied from Netflix's clip): a K-pop girl group's first live performance
# of the song, a GOLDEN premiere with a countdown, a sea of fans in purple with lightsticks and banners, the leader with
# a long lavender braid in a black-and-gold stage jacket, her two bandmates in white and gold; in the film their voices
# raise a golden barrier over the city.
# Ours, "the high note" (LINE-UP: one test, the whole cast in turn, each true to character, the lead last and absurd;
# the spicy-lineup format, "who did it best?"): at the GOLDEN premiere the idol trio (Saxo in the leader's braid,
# Sadi, Compote) dances in perfect sync until a fan throws a tennis ball onto the stage and the leader, a dog, drops
# the choreography to fetch it; he comes back with the ball in his mouth and Compote has taken his centre spot. The
# mic rises out of the stage for the big note and they take it in turn: Compote screams it and blows the speaker
# stacks, Sadi swoons it and the front row faints, Kob the manager, spotlit on her gold throne in the wings, won't even
# put her milk down; then the leader spits out his ball and HOWLS it at the moon: every pet in the arena howls with
# him and a golden barrier bursts out of the stage over the whole arena (the film's barrier, raised by a dog). Button:
# Kob pulls the plug; in the dark, every muzzle still points at the moon.
# Beats: 123.000 BPM, kit beat b at b * 0.487805 s (kit beat 0 = song beat 28, bar 7); a bar = 4 beats (1.951 s).
# Sections (kit beats): b0-4 the intro's last bar; verse 1 b4-52; the pre-chorus b52-84 (the chorus's first belt, a
# held note, b76.4-80.2); the drop b84; the chorus b84-112; the post-chorus b112-148 (held notes b112.7-115.5,
# b125.5-127.9, b129.4-134.1, b142.3-144.7); the dead stop b148, silence to b149.04 (72.70 s).
# Key words (whitelisted single words, sorted per line, never the lines): throne b3.1 | believe b8.4 | queen b11.9 |
# lives, sides b18.1 | find, own, place b25.9 | wild b34.1 | stage b42.0 | born b58.7 | believe b74.0 | up b81.2 |
# moment b86.3 | glowing, together b89.4 | golden b93.4 | up b97.4 | voices b101.8 | golden b109.5 | born b122.8 |
# fear, lies, time b129.3 | born b138.7.
# The lyrics stay in episodes/2026-10-06.lyrics.js (the generator reads only their times).
import json, math, os, re, sys
sys.path.insert(0, os.path.dirname(__file__))
from cam import view, vpath, swoop, low, deadpan, orbit

HERE = os.path.dirname(__file__)
PER = 60 / 123.0
def T(b): return b * PER
def S(b, b0): return round(T(b) - T(b0), 3)    # seconds from shot beat b0 to beat b

LOOK = {'saxo': 'idol', 'sadi': 'idol', 'kob': 'ceo', 'compote': 'idol'}
HEAD = {'saxo': 1.36, 'sadi': 1.3, 'kob': 1.4, 'compote': 1.44}        # the top of each head standing (the hair, the bow, the ears)
FACE = {'saxo': 0.9, 'sadi': 0.84, 'kob': 0.86, 'compote': 0.86}
RAD = {'saxo': 0.56, 'sadi': 0.42, 'kob': 0.4, 'compote': 0.42}
SIT = 0.06                                          # a seated clip sits the chibi 6 cm lower than standing

# the map (src/maps31.js)
EDGE_Z, BACK_Z, PIT_Y, BARRIER_Z = 2.4, -5.2, -1.1, 3.0
FORM = {'sadi': (-1.1, 0.5), 'saxo': (0.0, 0.3), 'compote': (1.1, 0.5)}      # the trio's formation
FORM2 = {'sadi': (-1.1, 0.5), 'compote': (0.0, 0.3), 'saxo': (1.1, 0.5)}     # after the fetch: Compote has his centre spot
SING = (0.0, 0.35); MIC_BASE = (0.0, 0.96)
SPEAKERS = [(-6.3, 1.4), (6.3, 1.4)]
THRONE = (-9.3, 0.0); THRONE_Y = 0.45; KOB_SEAT = (THRONE[0] + 0.1, THRONE[1])   # Kob sits facing +x
SOCKET = (-10.45, 0.55, -1.25)

def A(who, clip, x, z, **o):
    return {'who': who, 'look': o.pop('look', LOOK[who]), 'clip': clip, 'x': round(x, 3), 'z': round(z, 3), 'face': o.pop('face', 'camera'),
            'yaw': o.pop('yaw', 0), 'at': o.pop('at', 'auto'), **o}
def yaw_to(frm, to): return round(math.degrees(math.atan2(to[0] - frm[0], to[1] - frm[1])), 1)
def throne_kob(**o):
    """Kob on her gold throne in the wings, the manager: studio headphones for a headset, a glass of milk (a chair clip held: the head up)."""
    return A('kob', o.pop('clip', 'sitting_talking'), KOB_SEAT[0], KOB_SEAT[1], face='world', yaw=o.pop('yaw', 90), lift=THRONE_Y, at=o.pop('at', 0.05),
             speed=o.pop('speed', 0.0), sit=True, hold=o.pop('hold', 'milk'), **o)
def trio(clip, at, form=FORM, ball=False, speed=1.0, **o):
    """The three in sync: the same clip at the same offset, facing the lens (a K-pop group's formation)."""
    out = []
    for who in ('sadi', 'saxo', 'compote'):
        x, z = form[who]
        a = A(who, clip, x, z, at=at, speed=speed, **o)
        if ball and who == 'saxo': a['ballMouth'] = True
        out.append(a)
    return out

# ---- a projection check (numbers only): where each face lands in the 9:16 frame at the shot's start and end ----
def _proj(cam, look, fov, pt):
    f = [look[i] - cam[i] for i in range(3)]; n = math.sqrt(sum(v * v for v in f)); f = [v / n for v in f]
    r = [-f[2], 0.0, f[0]]; rn = math.sqrt(r[0] ** 2 + r[2] ** 2) or 1; r = [r[0] / rn, 0.0, r[2] / rn]
    u = [r[1] * f[2] - r[2] * f[1], r[2] * f[0] - r[0] * f[2], r[0] * f[1] - r[1] * f[0]]
    d = [pt[i] - cam[i] for i in range(3)]; z = sum(a * b for a, b in zip(d, f))
    if z <= 0.05: return None
    tv = math.tan(math.radians(fov) / 2); th = tv * 9 / 16
    return (0.5 + sum(a * b for a, b in zip(d, r)) / z / th / 2, 0.5 - sum(a * b for a, b in zip(d, u)) / z / tv / 2)
_src = open(os.path.join(HERE, '2026-10-06.lyrics.js')).read()
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
def clear_at(v, r=0.95):                        # no fan at the lens or along its first stretch of sight (the pit's lenses)
    c, f = v; out = []
    for k in (0, -1):
        p = lens(v, k)
        if p[2] < EDGE_Z: continue
        out.append([round(p[0], 2), round(p[2], 2), r])
        for u in (0.12, 0.24, 0.36):
            q = (p[0] + (f[0] - p[0]) * u, p[2] + (f[1] - p[2]) * u)
            if q[1] > EDGE_Z: out.append([round(q[0], 2), round(q[1], 2), r * 0.8])
    return out
def pit_clear(v, r=0.55):                       # a low lens among the fans: clear only round the lens itself (the rows in front stay: bodies at the lens)
    return [[round(p[0], 2), round(p[2], 2), r] for p in (lens(v, 0), lens(v, -1)) if p[2] > EDGE_Z]
def add(beat, b1, actors, lyric, v, **o):
    c, focus = v
    o = {k: val for k, val in o.items() if val is not None}
    o.setdefault('clear', clear_at(v))
    o.setdefault('mic', False)
    shots.append({'beat': beat, 'kind': 'dance', 'map': 'premiere', 'actors': actors, 'lyric': lyric, 'cam': c, 'focus': focus, **o})
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
def prem_free(c):
    x, y, z = c
    if y < 0.12 or y > 9.0: return False
    if z > EDGE_Z - 0.05 and y < 0.25: return False                              # in the pit: over the fans' heads (their tops at ~0.2)
    if z < BACK_Z + 0.4 and abs(x) < 7.6: return False                           # the screen and its riser
    if 7.3 < abs(x) < 8.6 and 0.4 < z < 2.4: return False                        # the side towers
    for sx, sz in SPEAKERS:
        if math.hypot(x - sx, z - sz) < 1.05 and y < 3.0: return False
    if x < -7.5 and (z < -2.8 or z > 2.3 or x < -11.4 or y > 4.0): return False  # the wings' walls
    if x > 7.5 and z < 2.4: return False                                        # nothing beyond stage right
    if math.hypot(x - MIC_BASE[0], z - MIC_BASE[1]) < 0.3 and y < 1.1: return False
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
def lens_for(actors, ang, dist, b0, b1, hs=(1.0,), fov=50, look=None, spread=40, dr=(0.8, 1.5), free=prem_free, push=0.04, facing=True, maxoff=105, **o):
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

def kob_lens(b0, b1, ang, dist, fov=44, push=0.1, hs=(1.2, 1.3, 1.42)):
    """Kob's deadpan inserts on the throne: frontal-ish, locked off, a narrow lens, a slow linear push (her face sits 1.25 m up)."""
    return lens_for([throne_kob()], ang, dist, b0, b1, hs=hs, fov=fov, look=(KOB_SEAT[0], 1.22, KOB_SEAT[1]), spread=10, dr=(0.95, 1.3), push=push, ease='lin', maxoff=110)

COUNT = [48, 4]          # the screen's countdown: 9 at kit beat 48, one less a bar, 0 from the drop (b84)
SPOT_SING = [SING[0], SING[1]]
HOWL_AT = 1.2            # long_yell_while_standing_leaning_back: the muzzle points at the sky from clip 1.0 to 1.4 s

# =====================================================================================================================
# BEAT 1, the premiere (b0-50): the idol trio in perfect sync; a tennis ball from the crowd; the leader fetches it
# S00 the hook (b0-4, the intro's last bar): a swoop from high behind the fans' lightsticks, over the front rows, down to
# the stage's edge: the trio in the horse stance in sync under the giant GOLDEN screen
s00 = trio('gangnam', 1.1)
v = swoop([(0.0, 2.6, 10.2), (0.0, 1.55, 7.0), (0.0, 0.8, 5.2), (0.0, 0.66, 4.75)], (0.0, 0.84, 0.4), fov=68, roll=(0, -3, -9, -5), ease='out')
add(0, 4, s00, "the hook: a swoop from behind the fans' purple lightsticks down to the stage, the idol trio dancing in sync under the giant GOLDEN screen, Saxo at the centre in the leader's lavender braid", v, fans='wave', clear=[[0.0, 4.75, 0.7]])
# S01 (b4-8, 'throne'): Kob, the group's manager, on a gold throne in the wings: headset, milk, deadpan
s01 = [throne_kob()]
v = kob_lens(4, 8, 90, 3.2, fov=48)
add(4, 8, s01, "'throne': Kob, the manager, sits on a gold stage-prop throne in the wings, headset on, a glass of milk, deadpan", v, noguests=True)
# S02 (b8-12, 'believe'): the fans' point of view: a low lens in the pit behind the front row's lightsticks, the trio above
s02 = trio('house_dance_variation_two', 0.8)
v = lens_for(s02, 0, 4.9, 8, 12, hs=(0.28, 0.34), fov=64, spread=12, dr=(0.95, 1.2), push=0.06, roll=[-6, -4], hand=0.3)
add(8, 12, s02, "the fans' view: the front row's purple lightsticks waving in the foreground, the trio dancing in sync on the stage above", v, fans='wave', clear=pit_clear(v))
# S03 (b12-16, 'queen'): Sadi struts to the stage's edge over a QUEEN banner in the front row; the banner's fans cheer
s03 = [A('sadi', 'female_hip_hop_raise_the_roof_dancing', -1.55, 1.75, face='world', yaw=12, at=1.2)]
v = view((-1.6, 0.62, 5.7), (-1.55, 0.9, 1.75), 56, p1=(-1.6, 0.6, 5.45), roll=[4, 2])
add(12, 16, s03, "'queen': Sadi struts to the stage's edge and poses over the QUEEN banner the front row holds up for her; they cheer", v,
    banner=True, fans='cheer', clear=[[-1.6, 5.7, 0.75], [-1.6, 5.1, 0.6], [-1.6, 4.55, 0.45]])
# S04 (b16-18): Compote at her mark, glaring at Sadi's banner
s04 = [A('compote', 'happy_idle', *FORM['compote'], face='world', yaw=-25, at=0.5, speed=0.3)]
v = lens_for(s04, 12, 2.8, 16, 18, hs=(0.95, 1.05), fov=42, spread=10, push=0.02)
add(16, 18, s04, "Compote at her mark, glaring at Sadi's banner", v, noguests=True)
# S05 (b18-22, 'lives, sides'): a tennis ball sails out of the crowd and bounces across the stage past the trio; the
# leader's head whips round after it (the other life: he's a dog)
s05 = [A('sadi', 'gangnam', *FORM['sadi'], at=1.1), A('compote', 'gangnam', *FORM['compote'], at=1.1),
       A('saxo', 'being_surprised_and_looking_right', *FORM['saxo'], at=0.25, speed=0.8)]
BALL1 = [[0.25, 1.9, -0.6, 4.0], [0.6, 1.0, 1.45, 2.0], [0.9, 0.3, 0.11, 1.1], [1.15, -0.45, 0.62, 0.55], [1.42, -0.55, 0.11, -0.3], [1.62, -0.6, 0.36, -0.9], [1.82, -0.65, 0.11, -1.5], [1.95, -0.7, 0.16, -1.75]]
v = lens_for(s05, 0, 4.6, 18, 22, hs=(0.95, 1.1), fov=64, spread=10, dr=(0.95, 1.2), push=0.03)
add(18, 22, s05, "'lives, sides': a tennis ball sails out of the crowd and bounces across the stage past the trio; the leader's head whips round after it", v, ball=BALL1, fans='wave')
# S06 (b22-26): he drops the choreography and sprints after it upstage, past the GOLDEN screen; the girls dance on
s06 = [A('sadi', 'house_dance_variation_two', *FORM['sadi'], at=0.8),
       A('saxo', 'happy_run', 0.0, 0.3, face='world', yaw=290, at=0.1, speed=1.3, mx=-2.5, mz=0.9, away=True)]   # in front of Sadi (behind her, he vanished)
BALL2 = [[0.0, -0.75, 0.16, 0.6], [0.5, -1.6, 0.15, 0.95], [1.2, -2.6, 0.15, 1.25], [1.95, -3.4, 0.15, 1.45]]
v = view((1.9, 1.0, 4.3), (-1.4, 0.75, -0.3), 60, p1=(1.8, 1.0, 4.2))   # side on: the chase across the frame, the ball ahead of him
add(22, 26, s06, "he drops the choreography and sprints across the stage after the ball, past Sadi, who dances on", v, ball=BALL2, fans='wave', clear=[])
# S07 (b26-30, 'find, own, place'): he trots back with the ball in his mouth to find Compote dancing on his centre mark
s07 = [A('sadi', 'house_dance_variation_two', *FORM2['sadi'], at=1.6), A('compote', 'house_dance_variation_two', *FORM2['compote'], at=1.6),
       A('saxo', 'happy_walk', 1.2, -0.9, face='world', yaw=10, at=0.2, mz=1.3, ballMouth=True)]
v = lens_for(s07, 0, 4.7, 26, 30, hs=(1.0, 1.15), fov=62, spread=10, dr=(0.95, 1.2), push=0.03)
add(26, 30, s07, "'find, own, place': he trots back with the ball in his mouth, and Compote is dancing on his centre mark", v, fans='wave')
# S08 (b30-33): the two side by side: Saxo with the ball in his mouth looks at Compote; she glares back from his spot
s08 = [A('compote', 'happy_idle', *FORM2['compote'], face='world', yaw=30, at=0.4, speed=0.3),
       A('saxo', 'happy_idle', *FORM2['saxo'], face='world', yaw=-30, at=0.6, speed=0.3, ballMouth=True)]
v = lens_for(s08, 0, 3.1, 30, 33, hs=(1.0, 1.1), fov=50, spread=10, push=0.04)
add(30, 33, s08, "Saxo, the ball in his mouth, looks at Compote on his spot; she glares back", v, noguests=True)
# S09 (b33-38, 'wild'; the Short's first frame): the crowd goes wild: a low lens among the fans' raised arms, the trio
# dancing in sync above them, the leader with the ball in his mouth on the right
s09 = trio('gangnam', 1.05, form=FORM2, ball=True)
v = lens_for(s09, -5, 4.8, 33, 38, hs=(0.28, 0.34), fov=66, spread=10, dr=(0.95, 1.2), push=0.07, roll=[7, 4], hand=0.4)
add(33, 38, s09, "'wild': the crowd goes wild, paws up with their lightsticks in the foreground; the trio dances in sync, the leader with a tennis ball in his mouth", v, fans='cheer', clear=pit_clear(v))
# S10 (b38-42): a handheld orbit on the trio's kick
s10 = trio('charleston', 0.7, form=FORM2, ball=True)
v = lens_for(s10, 25, 4.6, 38, 42, hs=(0.6, 0.75), fov=64, spread=12, dr=(0.95, 1.2), push=0.0)
c, f = v; c['ang'] = [c['ang'][0], c['ang'][0] - 30]; c['ease'] = 'lin'; c['hand'] = 1.0; c['roll'] = [5, -4]
add(38, 42, s10, "a handheld orbit on the trio kicking in sync", (c, f), fans='wave')
# S11 (b42-46, 'stage'): the high wide of the whole arena: the stage, the GOLDEN screen, the stands' sea of lightsticks,
# the city, the tower on its hill, the moon
s11 = trio('charleston', 1.6, form=FORM2, ball=True)
v = view((3.5, 6.6, 15.5), (0.0, 1.2, 0.0), 50, p1=(3.2, 6.2, 14.6), ease='lin')
add(42, 46, s11, "'stage': the high wide: the whole arena, the stage under the GOLDEN screen, the stands full of purple lightsticks, the city and its tower beyond, the moon", v, fans='wave', moon=[-30, 46, -120])
# S12 (b46-50): Kob in the wings, unimpressed, from the stage side and lower
s12 = [throne_kob()]
v = kob_lens(46, 50, 140, 3.1, fov=48, hs=(0.95, 1.1))
add(46, 50, s12, "Kob in the wings on her throne, unimpressed, milk in paw", v, noguests=True)

# =====================================================================================================================
# BEAT 2, the pre-chorus (b50-84): the countdown; the mic rises; Compote gets to it first; her note blows the speakers
# S13 (b50-54): the screen counts down; the centre mic rises out of its hatch into a spotlight
v = view((0.35, 0.42, 3.2), (0.0, 0.62, 0.9), 54, p1=(0.33, 0.42, 3.05))
add(50, 54, [], "the giant screen counts down to the big note; the centre mic rises out of a hatch in the stage into a spotlight", v,
    mic=[0.35, 0.9], spot=list(MIC_BASE), screen='count', count=COUNT, hush=True, noguests=True)
# S14 (b54-58): the three turn their heads to the mic, the mic in the foreground
s14 = [A(w, 'happy_idle', *FORM2[w], face='world', yaw=yaw_to(FORM2[w], MIC_BASE), at=0.4, speed=0.4, **({'ballMouth': True} if w == 'saxo' else {})) for w in ('sadi', 'compote', 'saxo')]
v = lens_for(s14, 22, 4.6, 54, 58, hs=(1.0, 1.1), fov=60, spread=10, dr=(0.95, 1.3), push=0.04, maxoff=115)
add(54, 58, s14, "the three turn to look at the mic; the screen counting down behind them", v, mic=True, spot=list(MIC_BASE), screen='count', count=COUNT, fans='still', stare=list(MIC_BASE))
# S15 (b58-62, 'born'): the leader struts to the mic, chest out, the ball still in his mouth
s15 = [A('saxo', 'happy_walk', 0.9, 0.55, face='world', yaw=-55, at=0.3, mx=-0.75, mz=-0.15, ballMouth=True)]
v = lens_for(s15, 20, 2.9, 58, 62, hs=(0.55, 0.7), fov=56, spread=15, push=0.06, roll=[-6, -3], hand=0.3, maxoff=110)
add(58, 62, s15, "'born': the leader struts to the mic, chest out, the ball still in his mouth", v, mic=True, spot=list(MIC_BASE), screen='count', count=COUNT, noguests=True)
# S16 (b62-66): Compote cuts in front of him and takes the mic; he stops dead behind her shoulder
s16 = [A('compote', 'happy_walk', -0.55, 0.55, face='world', yaw=60, at=0.2, mx=0.55, mz=-0.2, speed=1.5),
       A('saxo', 'happy_idle', 1.0, -0.2, face='world', yaw=-45, at=0.4, speed=0.3, ballMouth=True)]
v = lens_for(s16, 35, 3.6, 62, 66, hs=(0.9, 1.05), fov=54, spread=10, push=0.03, maxoff=115)
add(62, 66, s16, "Compote cuts in front of him and takes the mic; he stops dead behind her shoulder", v, mic=True, spot=list(SPOT_SING), screen='count', count=COUNT, noguests=True)
# S17 (b66-70): Kob in the wings, from the other side of the throne, she sips on
s17 = [throne_kob()]
v = kob_lens(66, 70, 115, 3.1, fov=48, hs=(1.55, 1.7))
add(66, 70, s17, "Kob in the wings, her milk, her headset, deadpan", v, noguests=True)
# S18 (b70-74): Compote at the mic in the spotlight, the stage dimmed, the crowd hushed
s18 = [A('compote', 'happy_idle', *SING, face='world', yaw=0, at=0.3, speed=0.3)]
v = lens_for(s18, 25, 2.7, 70, 74, hs=(0.6, 0.75), fov=52, spread=10, push=0.08, maxoff=110)
add(70, 74, s18, "Compote at the mic in the spotlight, the stage dimmed, the crowd hushed", v, mic=True, spot=list(SPOT_SING), hush=True, screen='count', count=COUNT, noguests=True)
# S19 (b74-77.5, the first belt, its held note from b76.4): COMPOTE'S NOTE: she screams it at the mic, leaning in, furious
s19 = [A('compote', 'long_yell_leaning_forward', SING[0], SING[1] - 0.18, face='world', yaw=0, at=1.2, speed=0.4)]
v = lens_for(s19, 36, 2.7, 74, 77.5, hs=(0.6, 0.72), fov=58, spread=8, push=0.1, roll=[4, 9], hand=0.4)
hit = S(76.4, 74)
add(74, 77.5, s19, "COMPOTE'S HIGH NOTE: she screams it into the mic, leaning in, furious, red rings of sound blasting out of the mic at the lens, the frame jolting", v, mic=True, spot=list(SPOT_SING), screen='count', count=COUNT, noguests=True,
    micDrop=0.22, waves=[round(hit, 3), 0.45, 0.72, 1.6, 0xff3a3a, [0.59, 0.0, 0.81]], jolt=[round(hit + k * PER, 3) for k in range(3)])
# S20 (b77.5-82): the speaker stack blows out (smoke, sparks, popped cones) and the front rows are blown back; Compote
# still screaming at the mic beyond
s20 = [A('compote', 'long_yell_leaning_forward', *SING, face='world', yaw=0, at=1.5, speed=0.25)]
blow = S(78.0, 77.5)
v = view((3.4, 1.75, 6.6), (5.0, -0.25, 3.4), 64, p1=(3.45, 1.75, 6.45))   # looking down: the knocked-flat rows in front of the smoking stack
add(77.5, 82, [], "her note blows the speaker stack out in smoke and sparks, popped cones, and the front two rows are knocked flat on their backs", v,
    mic=True, spot=list(SPOT_SING), blow=blow, knock=round(blow + 0.08, 3), screen='count', count=COUNT, key=[5.0, 2.8, 3.4, 1.3, 1.05, 0.9], clear=[[3.4, 6.6, 0.8]])
# S21 (b82-84): Kob in the wings, deadpan through it (a low three-quarter from the stage)
s21 = [throne_kob()]
v = kob_lens(82, 84, 95, 3.3, fov=44, push=0.03, hs=(1.0, 1.1))   # at 70 deg the stage-left tower stood between the lens and her: a black frame
add(82, 84, s21, "Kob in the wings, deadpan through it, milk in paw", v, noguests=True, blow=-2.0)

# =====================================================================================================================
# BEAT 3, the chorus (b84-112): the drop; confetti; the trio dances; Sadi's turn
# S22 (b84-88, the drop, 'moment'): the confetti cannons fire; a low dolly-in on the trio in sync, confetti raining
s22 = trio('house_dance_variation_two', 0.6, form=FORM2, ball=True)
v = lens_for(s22, 8, 4.6, 84, 88, hs=(0.3,), fov=66, spread=10, dr=(0.95, 1.2), push=0.05, roll=[-7, -3], hand=0.4)
v[0]['h'] = [v[0]['h'][0], 1.25]; v[0]['look'] = [v[0]['look'][0], v[0]['look'][0] + 0.15]   # a crane up out of the pit on the drop
add(84, 88, s22, "the drop, 'moment': the confetti cannons fire and the trio dances in sync in the falling confetti, the lens craning up out of the jumping pit", v, confetti=0.0, blow=-4.0, screen='gold', fans='jump', clear=pit_clear(v))
# S23 (b88-92, 'glowing, together'): the reverse from upstage, low over the trio's backs: the pit's lightsticks pulsing
# together, the stands' sea of lights
s23 = [A(w, 'house_dance_variation_two', *FORM2[w], face='world', yaw=0, at=1.4, fg=True) for w in ('sadi', 'compote', 'saxo')]
v = view((0.2, 1.5, -2.9), (0.0, 0.2, 7.0), 74, p1=(0.2, 1.52, -2.75), roll=[4, 2], hand=0.3)
add(88, 92, s23, "'glowing, together': from behind the trio, the whole pit's lightsticks pulsing together, the stands a sea of lights", v, confetti=-S(88, 84), blow=-6.0, fans='wave', clear=[])
# S24 (b92-96, 'golden'): the leader alone, a handheld orbit in the confetti, the screen turned gold
s24 = [A('saxo', 'charleston', *FORM2['saxo'], at=1.4, ballMouth=True)]
v = orbit(FORM2['saxo'], 2.3, 0.4, -30, 35, 0.78, fov=60, hand=1.1)
add(92, 96, s24, "'golden': the leader alone in the gold confetti, kicking, the ball in his mouth, the screen behind him turned gold", v, confetti=-S(92, 84), blow=-8.0, screen='gold', noguests=True)
# S25 (b96-100, 'up'): the trio jumps on every beat, paws pumping, from the side, low
s25 = trio('happy_idle', 0.4, form=FORM2, ball=True, hop=[0.32, 1], air=True, arm='both', aim='rave', flapEvery=1)
v = lens_for(s25, 40, 4.6, 96, 100, hs=(1.2, 1.35), fov=62, spread=12, dr=(0.95, 1.2), push=0.05, roll=[-8, -5])
add(96, 100, s25, "'up': the trio jumps on every beat, paws pumping, in the confetti", v, confetti=-S(96, 84), blow=-10.0, screen='gold', fans='jump')
# S26 (b100-104, 'voices'): the crowd sings: a lens in the pit among the jumping fans, the stage above
s26 = trio('charleston', 0.7, form=FORM2, ball=True)
v = lens_for(s26, 10, 5.4, 100, 104, hs=(0.5, 0.6), fov=66, spread=12, dr=(0.95, 1.15), push=0.05, roll=[-5, -2], hand=0.5)
add(100, 104, s26, "'voices': the whole pit jumps and sings, lightsticks up, the trio above them", v, confetti=-S(100, 84), blow=-12.0, screen='gold', fans='jump', clear=pit_clear(v))
# S27 (b104-109): the trio's kick from the front, wide, the screen gold
s27 = trio('charleston', 0.45, form=FORM2, ball=True)
v = lens_for(s27, -10, 5.0, 104, 109, hs=(2.5, 2.8), fov=60, spread=12, dr=(0.95, 1.2), push=0.05)
add(104, 109, s27, "the trio's kicks in sync from the front, the screen gold behind them", v, confetti=-S(104, 84), blow=-14.0, screen='gold', fans='cheer')
# S28 (b109-112, 'golden'): Sadi's turn: she steps up to the mic; Compote, done, steps aside
s28 = [A('sadi', 'happy_walk', -0.75, 0.5, face='world', yaw=55, at=0.3, mx=0.75, mz=-0.15),
       A('compote', 'happy_idle', 0.95, 0.75, face='world', yaw=-20, at=0.5, speed=0.3)]
v = lens_for(s28, 0, 3.3, 109, 112, hs=(0.95, 1.1), fov=54, spread=15, push=0.04, maxoff=115)
add(109, 112, s28, "'golden': Sadi's turn: she steps up to the mic in the spotlight; Compote, done, steps aside", v, mic=True, spot=list(SPOT_SING), confetti=-S(109, 84), blow=-16.0, screen='gold', noguests=True)

# =====================================================================================================================
# BEAT 4, the post-chorus (b112-148): Sadi's note, Kob's turn, the leader's howl
# S29 (b112-116, the held note from b112.7): SADI'S NOTE: a paw on her heart, chin up, the diva
s29 = [A('sadi', 'happy_idle', *SING, face='world', yaw=0, at=0.3, speed=0.4, arm='R', aim='heart', upAt=-1)]
v = lens_for(s29, 25, 3.0, 112, 116, hs=(0.65, 0.8), fov=56, spread=10, push=0.08, maxoff=110)
add(112, 116, s29, "SADI'S HIGH NOTE: a paw on her heart, chin up, the diva at the mic", v, mic=True, spot=list(SPOT_SING), hush=True, confetti=-S(112, 84), blow=-18.0, noguests=True)
# S30 (b116-120): the pit from the stage's edge: hearts over the crowd, the whole front row fainted flat on its back
v = view((-0.5, 0.95, 2.1), (-0.4, -1.0, 4.4), 62, p1=(-0.5, 0.93, 2.2))
add(116, 120, [], "the pit from the stage's edge: pink hearts rising over the crowd, the whole front row fainted flat on its back", v,
    hearts=-0.15, faint=-0.4, fans='swoon', confetti=-S(116, 84), blow=-20.0, clear=[])
# S31 (b120-124): the spotlight swings to the wings and finds Kob on her throne: her turn
s31 = [throne_kob()]
v = kob_lens(120, 124, 100, 3.6, fov=52, push=0.2, hs=(1.9, 2.1))
add(120, 124, s31, "the spotlight swings off the stage and finds Kob on her throne in the wings: her turn", v, spot=list(KOB_SEAT), noguests=True, blow=-22.0)
# S32 (b124-129, the held note b125.5-127.9): KOB'S TURN: she won't even put her milk down: deadpan through the whole note
s32 = [throne_kob(hold=None, holdL='milk', sip=True, sipHand='L')]   # the cup low in her paw, a long straw up into her mouth, in profile
v = kob_lens(124, 129, 150, 2.9, fov=46, push=0.06, hs=(1.15, 1.3))
add(124, 129, s32, "KOB'S TURN: she sips her milk through the whole high note, deadpan, and doesn't sing a word", v, spot=list(KOB_SEAT), noguests=True, blow=-24.0)
# S33 (b129-134, the held notes b129.4-134.1): the leader's turn: he walks to the mic in the spotlight, the ball in his
# mouth; Sadi and Compote at the side, smug
s33 = [A('saxo', 'happy_walk', 0.75, 1.0, face='world', yaw=-35, at=0.3, mx=-0.75, mz=-0.65, ballMouth=True),
       A('sadi', 'happy_idle', -1.15, 0.75, face='world', yaw=40, at=0.6, speed=0.3), A('compote', 'happy_idle', 1.2, 0.85, face='world', yaw=-40, at=0.2, speed=0.3)]
v = lens_for(s33, 5, 4.6, 129, 134, hs=(0.9, 1.05), fov=60, spread=12, dr=(0.95, 1.35), push=0.04, maxoff=115)
add(129, 134, s33, "the leader's turn: he walks up to the mic, the ball still in his mouth; Sadi and Compote at the side, smug", v, mic=True, spot=list(SPOT_SING), hush=True, blow=-26.0, fans='still', stare=list(SING))
# S34 (b134-138): at the mic he spits the ball out (it bounces off the stage) and fills his lungs
s34 = [A('saxo', 'happy_idle', *SING, face='world', yaw=0, at=0.4, speed=0.4)]
BALL3 = [[0.0, 0.0, 0.88, 0.8], [0.62, 0.0, 0.88, 0.8], [0.75, 0.38, 1.22, 0.95], [0.95, 0.72, 0.95, 1.1], [1.2, 1.0, 0.15, 1.3], [1.45, 1.22, 0.45, 1.45], [1.7, 1.42, 0.15, 1.6], [1.95, 1.6, 0.15, 1.7]]   # spat out sideways, clear of the stand at once (dropping along it, it read as a lollipop)
v = lens_for(s34, 40, 2.6, 134, 138, hs=(0.75, 0.9), fov=54, spread=10, push=0.08)
add(134, 138, s34, "at the mic he spits the ball out, it bounces off the stage, and he fills his lungs", v, mic=True, spot=list(SPOT_SING), hush=True, blow=-28.0, noguests=True, ball=BALL3)
# S35 (b138-142.3, 'born'): a low lens: he leans back, the full moon over him, the arena holding its breath
s35 = [A('saxo', 'long_yell_while_standing_leaning_back', *SING, face='world', yaw=0, at=0.35, speed=0.32)]
v = view((0.85, 0.3, 2.25), (0.0, 1.05, 0.35), 62, p1=(0.8, 0.28, 2.05), roll=[-5, -8])
add(138, 142.3, s35, "'born': from the floor, he leans back for it, the full moon above him, the arena holding its breath", v, mic=True, spot=list(SPOT_SING), hush=True, blow=-30.0, noguests=True, moon=[-21, 26, -46])
# S36 (b142.3-145, the last held note): THE HOWL: muzzle to the moon, rings of sound rising from it, and the golden
# barrier bursts out of the stage over the arena
s36 = [A('saxo', 'long_yell_while_standing_leaning_back', *SING, face='world', yaw=0, at=HOWL_AT, speed=0.1)]
v = view((0.55, 0.5, 2.6), (0.0, 1.25, 0.35), 64, p1=(0.5, 0.45, 2.5), roll=[6, 3])
add(142.3, 145, s36, "THE HOWL: the leader throws his head back and howls the note at the moon, rings of sound rising from his muzzle; the golden barrier bursts out of the stage", v,
    mic=True, spot=list(SPOT_SING), blow=-32.0, noguests=True, moon=[-1, 40, -50], waves=[0.05, 0.0, 1.35, 0.75], dome=[0.15, 1.0], gold=True)
# S37 (b145-147): the whole arena howls under the golden dome: every fan's muzzle up, Sadi and Compote howling too, the
# stands' lights gone gold
s37 = [A('sadi', 'long_yell_while_standing_leaning_back', -1.1, 0.75, face='world', yaw=12, at=HOWL_AT, speed=0.1),
       A('saxo', 'long_yell_while_standing_leaning_back', *SING, face='world', yaw=20, at=HOWL_AT + 0.05, speed=0.1),
       A('compote', 'long_yell_while_standing_leaning_back', 1.25, 0.1, face='world', yaw=28, at=HOWL_AT, speed=0.1)]
v = lens_for(s37, 55, 6.2, 145, 147, hs=(0.42, 0.5), fov=60, spread=15, dr=(0.9, 1.15), push=0.04)   # stage right in the pit: the front rows howling in the foreground, the three beyond   # side-on from the pit floor at the end of the front row: profiles against the gold stands
add(145, 147, s37, "the whole arena howls with him: the front row in profile throwing their heads back against the gold stands, Sadi and Compote howling on the stage edge above them, rings rising, the moon and the dome", v,
    mic=True, blow=-34.0, fans='howl', dome=1, gold=True, screen='gold', clear=pit_clear(v, 0.7), moon=[-43, 13, -30],
    waves=[[0.0, -1.1, 1.05, 0.95], [0.1, 0.0, 1.1, 0.55], [0.05, 1.25, 1.05, 0.3]])
# S38 (b147-148): Kob, standing at the power box in the wings, yanks the plug out on the downbeat
s38 = [A('kob', 'happy_idle', -9.75, -0.7, face='world', yaw=90, at=0.5, speed=0.2, holdL='plug', cable=[-9.25, 0.03, -1.95],
         arm='L', aim=[0.62, -0.12, -0.35], aim2=[0.72, 0.66, 0.25], aim2At=S(147.8, 147), upAt=-1)]
v = view((-9.0, 1.0, -2.55), (-9.95, 0.8, -0.85), 52, p1=(-9.02, 1.0, -2.5))   # from her left: the plug side on, its lead to the socket
add(147, 148, s38, "Kob, standing at the power box in the wings, yanks the plug out on the downbeat", v, noguests=True, blow=-36.0)
# S39 the button (b148-149.04, the dead stop and its silent beat): the blackout: the stage dark and silent, and every
# muzzle in the arena still pointing at the moon under the golden dome
s39 = [A('saxo', 'long_yell_while_standing_leaning_back', *SING, face='world', yaw=0, at=HOWL_AT + 0.2, speed=0.0),
       A('sadi', 'long_yell_while_standing_leaning_back', -1.05, 0.6, face='world', yaw=8, at=HOWL_AT + 0.15, speed=0.0),
       A('compote', 'long_yell_while_standing_leaning_back', 1.05, 0.6, face='world', yaw=-8, at=HOWL_AT + 0.15, speed=0.0)]
v = view((0.5, 0.5, 5.6), (0.0, 1.35, 0.5), 62, p1=(0.49, 0.5, 5.55))
add(148, 149.04, s39, "the button: blackout, the music dead, and every muzzle in the arena still pointing at the moon under the golden dome", v,
    blackout=0.0, still=True, mic=True, fans='howl', dome=1, gold=True, blow=-38.0, moon=[-10, 30, -60], clear=[[0.5, 5.6, 0.55]])

for s in shots: clean(s['actors'])
shots.sort(key=lambda x: x['beat'])
ep = {
    'date': '2026-10-06', 'song': {'title': 'Golden', 'artist': 'HUNTR/X'},
    'logline': "At the GOLDEN premiere the idol trio takes the big high note in turn: Compote screams it and blows the speaker stacks, Sadi swoons it and the front row faints, Kob the manager won't even put down her milk; then the leader, a dog who fetched a fan's tennis ball mid-show, spits it out and HOWLS the note at the moon, the whole arena howls with him and a golden barrier bursts over the stadium, until Kob pulls the plug",
    'new': "src/maps31.js: premiere (an open-air K-pop arena at night: the stage under a giant GOLDEN LED screen that counts down and turns gold, side towers chasing on the beat, searchlight beams, a centre mic that rises out of a hatch into a spotlight, speaker stacks that blow out in smoke and sparks, confetti cannons, the pit of pet fans in purple tees with lightsticks that wave, cheer, jump, faint, get blown back and howl, a QUEEN banner, stands of lightstick dots that turn gold, the city and a tower on its hill, a full moon; the wings with Kob's gold throne and the power box; the golden barrier, a geodesic dome of gold bars that bursts out of the stage; rings of sound rising from a howl; hearts over the crowd; a tennis ball's keyframes); the actor field ballMouth (a tennis ball in the jaws); three looks: the idol trio in the film's stage colours (Saxo's lavender braid and black-and-gold jacket, Sadi's pink ponytail in white and gold, Compote's black buns and white varsity jacket)",
    'notes': "The world, from the film's own clip of its Golden sequence (looked at as contact sheets; its burnt-in subtitles not transcribed): the girl group's live premiere of the song under a GOLDEN sign, the fans in purple with lightsticks and banners, the leader's lavender braid and black-and-gold jacket, a countdown, the dressing room; in the film the idols' voices raise a golden barrier over the city. The words, from whitelisted keywords per line (keywords.py: sorted, never the lines): throne, queen, lives, sides, place, wild, stage, born, up, moment, glowing, together, golden, voices. The line-up: the high note, each in character (GAGS 3): Compote violent (the speakers), Sadi the romance (the fainting fans), Kob refuses (her milk), and the lead last and absurd (a dog: he howls it, and the dogs' trend on this song is exactly that). Kob is the manager on her throne in the wings (the watcher's deadpan inserts), and she unplugs things (the 2026-09-25 thread). The karaoke has no blocklisted word. The Short (60 s or less, the end kept) opens on the crowd going wild (S09, a dance).",
    'with': ['sadi', 'kob', 'compote'],
    'clips': ['happy_idle', 'happy_walk', 'happy_run', 'sitting_talking', 'charleston', 'house_dance_variation_two', 'female_hip_hop_raise_the_roof_dancing',
              'being_surprised_and_looking_right', 'long_yell_leaning_forward', 'long_yell_while_standing_leaning_back'],
    'tags': {'structure': 'line-up', 'scenes': ['idol trio in sync', 'the fetch', 'spot stolen', 'the mic rises', 'speaker blow-out', 'fans faint', 'Kob sips through her turn', 'the howl', 'golden barrier', 'Kob pulls the plug'],
             'cast': ['saxo', 'sadi', 'kob', 'compote'], 'hook': 'dance', 'maps': ['premiere'], 'ref': 'spicy-lineup',
             'lyric_literal': "'throne' (Kob's gold throne), 'queen' (the QUEEN banner), 'place' (his centre mark taken), 'wild' (the crowd), 'up' (the trio jumps), 'glowing, together' (the lightsticks), 'golden' (the screen turns gold, the barrier), 'voices' (the pit sings, then howls)",
             'experiment': "A line-up of the cast taking the same high note in turn (the spicy-lineup format, each in character, the dog last: he howls it) on a 2.1M-video film hit: more comments per 1,000 views than the last week's story episodes?"},
    'shots': shots,
}
json.dump(ep, open(os.path.join(HERE, '2026-10-06.json'), 'w'), indent=1, ensure_ascii=False)
print(len(shots), 'shots;', len(WARN), 'warnings')
for w in WARN: print('  ', w)
