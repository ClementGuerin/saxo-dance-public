# make_2026-10-10-2.py: writes episodes/2026-10-10-2.json, "WHERE IS MY HUSBAND!" (RAYE, 2025; the queue being empty:
# a chart song climbing, Spotify global #51 and +101k streams a day on 2026-10-09, RAYE's own 60 s TikTok sound 318k
# videos).
# The world (the official video, looked at as contact sheets every 3 s; nothing violent in it): a 1940s picture show
# ("RAYE PRESENTS", a cartoon "The End"): the singer in a red sequin halter gown at a ribbon mic before a big band under
# rows of bulb panels, her backing trio in red sequin minis; black-and-white hotel corridors with a man's silhouette in
# the light at the end, a grand wood-panelled hall with a chandelier and a staircase, a bright room with tall windows;
# a backing singer's card YOUR HUSBAND IS COMING!, a crate THIS BOX MAY CONTAIN RAYE, a man's card FIND YOURSELF & LOVE
# WILL FIND YOU!
# The words (whitelisted single words per line, never the lines; keywords.py, kitmap.py): baby, where, husband, taking,
# long, find, oh, lover, another, yeah, tell, see, holler, lonely, dress, tired, ready, wife, wait, heart, love,
# praying, hurry, need, away, man.
# Ours, "right behind you" (new structure; the live reference `right-behind-you`, MEMES.md: "calling my dog's name
# when he's right next to me"): Sadi, the 1940s torch singer in the clip's red sequin gown, sings where is my husband
# to the whole supper club and searches the grand hotel for him, while Saxo, the husband in a pinstripe suit and fedora,
# is right behind her the whole time, copying her every move, a ring box in his paw, and every time she turns he hides
# worse (behind the thin mic stand, in a doorway, as a marble statue on a plinth, flat on the floor); the room points,
# her backing singer holds up HE'S BEHIND YOU!, she gives up; in the last chorus the whole stage copies her behind her
# back and freezes when she turns, and on the band's dead stop she finally turns round: he's holding out the open ring.
# Beats: 115.9961 BPM, kit beat b at b * 0.517259 s (kit beat 0 = song beat 106, chorus 2's downbeat; bars on kit
# beats 0 mod 4).
# Sections (kit beats): chorus 2 b0-32 (K00-K08); the stop bar b32-36 (the band stops, the a cappella tag K09, 'holler'
# b33.84; verse 2's pickup from b35.08); verse 2 b36-68 (K10-K23); pre-chorus 2 b68-100 (K24-K32, the band's break
# b98-100); chorus 3 b100-132 (K33-K41); the band's dead stop at b132.13, then one silent beat (the button) to b133.13.
# Key words (kit beats): husband b4.34 | find b11.57 | oh b14.59 | where b18.03, lover b20.35 | another b24.06 | yeah
# b26.52 | see b29.36, b31.37 | holler b33.84 | lonely b36.05 | dress b39.02 | tired b40.92 | ready b45.05 | where
# b50.10, wife b51.26 | wait b51.74, heart b54.41 | love b58.32 | praying b61.02 | hurry b63.73, b64.12 | baby b65.51 |
# need b69.82 | heart b78.27 | away b85.19 | man b91.03 | need b98.18, tell b99.34 | husband b104.29 | find b111.40 |
# oh b115.19 | where b117.67, lover b120.37 | another b124.09 | yeah b126.52 | see b129.35, b131.36 (end b132.03).
# The lyrics stay in episodes/2026-10-10-2.lyrics.js (the generator reads only their times).
import json, math, os, re, sys
sys.path.insert(0, os.path.dirname(__file__))
from cam import view, swoop, low, deadpan

HERE = os.path.dirname(__file__)
PER = 60 / 115.9961
def Bt(t): return t / PER
def S(b, b0): return round((b - b0) * PER, 3)    # seconds from shot beat b0 to beat b

LOOK = {'saxo': 'fedora', 'sadi': 'torch', 'kob': 'sequin', 'compote': 'sequin'}
HEAD = {'saxo': 1.52, 'sadi': 1.38, 'kob': 1.47, 'compote': 1.47}      # the top of each head standing (the fedora, the bow, the ears)
FACE = {'saxo': 0.9, 'sadi': 0.84, 'kob': 0.86, 'compote': 0.86}
RAD = {'saxo': 0.5, 'sadi': 0.45, 'kob': 0.42, 'compote': 0.4}

# ---- the maps (src/maps40.js) ----
SING, MIC = (0.0, 0.6), (0.42, 1.02)                              # the singer's mark, the ribbon mic's stand
BEHIND = (-0.62, 0.0)                                             # right behind her shoulder, on the side away from the mic (at 0.44 m her head hid half his face)
RISERS = [(0.95, 4.2, -3.05, -1.95, 0.25), (0.95, 4.2, -4.3, -3.05, 0.5)]   # |x| range, z range, top
TABLES = [(-5.2, 4.9), (-2.6, 5.2), (2.6, 5.2), (5.2, 4.9), (-6.2, 7.4), (-3.4, 7.7), (0, 7.9), (3.4, 7.7), (6.2, 7.4), (-4.6, 10.3), (-1.6, 10.5), (1.6, 10.5), (4.6, 10.3)]
CORR_Z0, PED, PED_Y = -18.0, (-4.4, -21.6), 0.62                 # the corridor's far end (the hall beyond), the plinth
DOOR_L3 = -1.4                                                    # the left wall's door 3 (z -1.4: doors sort by z, so `door: [3, ...]`)

def A(who, clip, x, z, **o):
    return {'who': who, 'look': o.pop('look', LOOK[who]), 'clip': clip, 'x': round(x, 3), 'z': round(z, 3), 'face': o.pop('face', 'world'),
            'yaw': o.pop('yaw', 0), 'at': o.pop('at', 'auto'), **o}
def yaw_to(frm, to): return round(math.degrees(math.atan2(to[0] - frm[0], to[1] - frm[1])), 1)
SHIM = 'swing_dance_shim_sham_variation_1'                        # the clip's dance: frontal and upright at clip 3-7 s (the probe sheet)
SHIM2 = 'swing_dance_shim_sham_variation_2'
RING = dict(hold='ringopen', arm='R', aim=[0.3, 0.3, 0.75], upAt=-1, holdScale=1.7)   # the open ring box held out in front, sparkling
RING_UP = dict(hold='ringopen', arm='R', aim=[0.55, 0.62, 0.45], upAt=-1, holdScale=1.7)   # held up beside his head (over her shoulder)
RING_L = dict(holdL='ringopen', arm='L', aim=[0.25, 0.42, 0.66], upAt=-1, holdScale=2.2)   # in his outer paw when he stands on her +x side (his right paw would hide behind her); bigger: in black and white the red box goes grey and only the diamond reads
GASP = dict(arm='both', aim=[0.25, 0.55, 0.55], upAt=-1)           # paws up to the cheeks
def copy(a, who, x, z, **o):                                        # the same move behind her: same clip, same at, same speed
    b = {k: v for k, v in a.items() if k not in ('who', 'look', 'x', 'z', 'hold', 'holdL', 'holdScale', 'fg')}
    return {**b, 'who': who, 'look': LOOK[who], 'x': round(x, 3), 'z': round(z, 3), **o}

# ---- a projection check (numbers only): where each face lands in the 9:16 frame at the shot's start and end ----
def _proj(cam, look, fov, pt):
    f = [look[i] - cam[i] for i in range(3)]; n = math.sqrt(sum(v * v for v in f)); f = [v / n for v in f]
    r = [-f[2], 0.0, f[0]]; rn = math.sqrt(r[0] ** 2 + r[2] ** 2) or 1; r = [r[0] / rn, 0.0, r[2] / rn]
    u = [r[1] * f[2] - r[2] * f[1], r[2] * f[0] - r[0] * f[2], r[0] * f[1] - r[1] * f[0]]
    d = [pt[i] - cam[i] for i in range(3)]; z = sum(a * b for a, b in zip(d, f))
    if z <= 0.05: return None
    tv = math.tan(math.radians(fov) / 2); th = tv * 9 / 16
    return (0.5 + sum(a * b for a, b in zip(d, r)) / z / th / 2, 0.5 - sum(a * b for a, b in zip(d, u)) / z / tv / 2)
_src = open(os.path.join(HERE, '2026-10-10-2.lyrics.js')).read()
_rows = json.loads(re.search(r'window\.LYRICS = (.*?);\n', _src).group(1)); _ends = json.loads(re.search(r'window\.LINE_END = (.*?);\n', _src).group(1))
LINES = [(Bt(row[0][0] - 0.35), Bt(e)) for row, e in zip(_rows, _ends)]
def has_line(b0, b1): return any(a < b1 and b > b0 for a, b in LINES)
WARN = []
def body(a, end):                                # (who, x, z, face y, head top y) at the shot's start (0) or end (1)
    who = a['who']; sc = a.get('scale', 1)
    x, z = a['x'] + a.get('mx', 0) * end, a['z'] + a.get('mz', 0) * end
    lift = a.get('lift', 0) + (a.get('my', 0) if end else 0)
    L = math.radians(a.get('lean', 0)); yw = math.radians(a.get('yaw', 0)); fx, fz = math.sin(yw), math.cos(yw)
    fy, hy = FACE[who] * sc, HEAD[who] * sc
    return (who, x + fx * (fy + lift) * math.sin(L), z + fz * (fy + lift) * math.sin(L), (fy + lift) * math.cos(L), (hy + lift) * math.cos(L))
def check(beat, b1, cam, look, fov, actors, end, W=None):
    W = WARN if W is None else W
    line = has_line(beat, b1)
    for a in actors:
        if a.get('fg') or a.get('reveal', 0) >= 1.0 or a.get('lying') or a.get('away'): continue
        who, x, z, fy, hy = body(a, end)
        top, face = _proj(cam, look, fov, (x, hy, z)), _proj(cam, look, fov, (x, fy, z))
        tag = ' at the end' if end else ''
        if not top or not face: W.append(f'b{beat}: {who} behind the lens{tag}'); continue
        if line and top[1] < 0.27: W.append(f'b{beat}: {who} head top at {top[1]:.2f} (lyric rows){tag}')
        if face[0] < 0.12 or face[0] > 0.88: W.append(f'b{beat}: {who} face x {face[0]:.2f} (edge){tag}')
        if face[1] > 0.82 or face[1] < 0.0: W.append(f'b{beat}: {who} face y {face[1]:.2f}{tag}')
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

# ---- the sets: a lens stays in the room (never in a wall, a riser, a table, the mic, the stairs or the plinth) ----
def free(c, m):
    x, y, z = c
    if m == 'ballroom':
        if not (0.12 < y < 6.3 and -8.7 < x < 8.7 and -4.85 < z < 13.8): return False
        for x0, x1, z0, z1, top in RISERS:
            if x0 - 0.05 < abs(x) < x1 + 0.05 and z0 - 0.05 < z < z1 + 0.05 and y < top + 0.15: return False
        if any(math.hypot(x - tx, z - tz) < 0.7 and y < 0.95 for tx, tz in TABLES): return False
        if math.hypot(x - MIC[0], z - MIC[1]) < 0.22 and y < 1.05: return False
        return True
    if z > CORR_Z0: return -1.3 < x < 1.3 and 0.12 < y < 3.3 and z < 4.9
    if not (-6.9 < x < 6.9 and -31.9 < z < CORR_Z0 - 0.05 and 0.12 < y < 7.1): return False
    if -2.45 < x < 2.45 and z < -24.95 and y < 0.2 * min(16, (-24.95 - z) / 0.42 + 1) + 0.15: return False
    if math.hypot(x - PED[0], z - PED[1]) < 0.6 and y < 0.8: return False
    return True

shots = []
def lens(v, k=0):
    c, f = v; a = math.radians(c['ang'][k]); fy = f[2] if len(f) > 2 else 0
    return (f[0] + math.sin(a) * c['r'][k], c['h'][k] + fy, f[1] + math.cos(a) * c['r'][k])
def problems(beat, b1, actors, v, m, W):
    c, focus = v; fy = focus[2] if len(focus) > 2 else 0
    for k, end in ((0, 0), (-1, 1)):
        cam, look = lens(v, k), (focus[0], c['look'][k] + fy, focus[1])
        check(beat, b1, cam, look, c['fov'], actors, end, W)
        for oc in _occl(cam, look, c['fov'], [body(a, end)[:4] for a in actors if not a.get('lying') and not a.get('fg') and not a.get('away')]):
            W.append(f'b{beat}: {oc}{" at the end" if end else ""}')
        if not free(cam, m): W.append(f'b{beat}: lens inside the set{" at the end" if end else ""} {tuple(round(q, 2) for q in cam)}')
    return W
def add(beat, b1, actors, lyric, v, m='ballroom', **o):
    c, focus = v
    o = {k: val for k, val in o.items() if val is not None}
    shots.append({'beat': beat, 'kind': 'dance', 'map': m, 'actors': actors, 'lyric': lyric, 'cam': c, 'focus': focus, **o})
    problems(beat, b1, actors, v, m, WARN)
def solve(beat, b1, actors, look, ang, dist, h, fov=50, m='ballroom', push=0.08, dang=30, rng=(0.8, 1.7), dh=0.3, **kw):
    """a lens round the look point (x, y, z): the preferred direction ang (deg, 0 = +z), distance and height; the
    nearest candidate with no framing, occlusion or set problem wins (else the one with the fewest)"""
    best = None
    for da in (0, -5, 5, -10, 10, -15, 15, -20, 20, -25, 25, -30, 30):
        if abs(da) > dang: continue
        for dk in (1.0, 1.1, 0.92, 1.2, 1.3, 1.45, 1.6, 1.7, 0.85, 0.8):
            if not rng[0] <= dk <= rng[1]: continue
            for dhh in (0, 0.15, -0.15, 0.3, -0.3):
                if abs(dhh) > dh: continue
                a = math.radians(ang + da); d = dist * dk
                p0 = (look[0] + math.sin(a) * d, h + dhh, look[2] + math.cos(a) * d)
                p1 = (look[0] + math.sin(a) * d * (1 - push), h + dhh, look[2] + math.cos(a) * d * (1 - push))
                v = view(p0, look, fov, p1=p1, **kw)
                n = len(problems(beat, b1, actors, v, m, []))
                score = n * 1000 + abs(da) + abs(dk - 1) * 40 + abs(dhh) * 20
                if best is None or score < best[0]: best = (score, v)
                if n == 0 and score < 1: return v
    return best[1]
def clean(actors):
    for a in actors:
        for k in ('lying', 'away'): a.pop(k, None)
    return actors

def stage(**o): return dict(pets='watch', stare=list(BEHIND), **o)   # the guests watch the stage, their heads on him
def mono(**o): return dict(mono=True, **o)

# =====================================================================================================================
# ACT 1, chorus 2 (b0-32): the supper club. Sadi sings at the ribbon mic; right behind her Saxo copies every move.
# S01 the hook (b0-4; husband b4.34): a swoop from high over the tables down over the footlights to the stage floor,
# pushing in on the two dancing the shim sham in sync, the backing singers swaying either side, the band behind
sadi01 = A('sadi', SHIM, *SING, at=5.0, speed=1)
s01 = [sadi01, copy(sadi01, 'saxo', *BEHIND), A('kob', SHIM2, -1.45, -0.1, at=1.6, speed=1, fg=True), A('compote', SHIM2, 1.45, -0.1, at=1.6, speed=1, fg=True)]   # fg: they leave the frame as the swoop closes in
v = swoop([(0.0, 2.3, 7.4), (-0.1, 1.55, 4.9), (-0.25, 0.75, 3.3), (-0.3, 0.5, 2.55)], (-0.18, 0.92, 0.35), fov=60)
add(0, 4, s01, "the hook: a swoop down to the stage: Sadi dances at the ribbon mic, and right behind her Saxo does the exact same move", v, **stage())
# S02 (b4-8; husband b4.34, taking long): she looks out for him over the room; behind her he looks the same way
sadi02 = A('sadi', 'being_surprised_and_looking_right', *SING, at=0.9, speed=0.5)
s02 = [sadi02, copy(sadi02, 'saxo', *BEHIND)]
v = solve(4, 8, s02, (-0.3, 1.05, 0.3), 0, 3.4, 1.05)
add(4, 8, s02, "'husband': she looks out over the room for him; right behind her he looks the same way", v, **stage())
# S03 (b8-12; find b11.57): the reverse from behind the two: the whole room points at him, she peers out over them
s03 = [A('saxo', SHIM, *BEHIND, at=5.0 + S(8, 0), speed=1, fg=True), A('sadi', 'being_surprised_and_looking_right', *SING, at=1.2, speed=0.4)]
v = solve(8, 12, s03, (0.0, 0.6, 4.5), 185, 5.7, 1.5, fov=56, dang=15, rng=(0.9, 1.2))
add(8, 12, s03, "'find': from behind them: the whole supper club points at him; she peers over their heads", v, pets='point', stare=list(BEHIND))
# S04 (b12-14.5): she sings on, he dances behind her, from the floor at the footlights
sadi04 = A('sadi', SHIM, *SING, at=7.0, speed=1)
s04 = [sadi04, copy(sadi04, 'saxo', *BEHIND)]
v = low((-0.3, 0.32, 2.75), (-0.3, 1.0, 0.3), (-0.3, 0.3, 2.4), fov=62, roll=(-8, -5))
add(12, 14.5, s04, "she sings on; behind her he dances the same steps", v, **stage())
# S05 (b14.5-16; oh b14.59): on 'oh' she spins round to the mic side: he has frozen behind the mic stand's thin pole,
# arms stiff, sure he's hidden; over her shoulder
s05 = [A('sadi', 'being_surprised_and_looking_right', -0.55, 0.9, yaw=90, at=0.35, speed=0.2),
       A('saxo', 'happy_idle', MIC[0], MIC[1] - 0.3, yaw=-90, at=0.25, speed=0, arm='both', aim=[0.08, -0.95, 0.05], upAt=-1)]   # straight behind the pole from the lens: the thin chrome pole runs down the middle of him
v = solve(14.5, 16, s05, (0.0, 1.0, 0.85), 0, 3.4, 1.0, push=0.03, dang=8)
add(14.5, 16, s05, "'oh': she spins round to the mic: he has frozen behind its thin pole, arms stiff, sure he's hidden", v, **stage())
# S06 (b16-20; where b18.03, lover b20.35): the watchers: Kob and Compote, the backing singers, deadpan to the lens:
# Kob thumbs over her shoulder at him, Compote glares
s06 = [A('kob', 'pointing_behind_with_thumb', -0.42, -0.1, at=0.9, speed=0.3), A('compote', 'happy_idle', 0.42, -0.1, at=0.3, speed=0.05)]
v = deadpan((0.0, -0.1), 0.95, 3.4, fov=46)
add(16, 20, s06, "'where... lover': the backing singers, deadpan: Kob thumbs over her shoulder at him, Compote glares", v, **stage(band='stop', mic=False, key=[0, 2.6, 1.8, 0.6, 0.55, 0.5]))
# S07 (b20-24; another b24.06): she asks her backing singers where he is, palms up; behind her he asks too
sadi07 = A('sadi', 'asking_question', *SING, yaw=-28, at=1.3, speed=0.5)
s07 = [sadi07, copy(sadi07, 'saxo', *BEHIND)]
v = solve(20, 24, s07, (-0.3, 1.05, 0.3), -25, 3.3, 1.05)
add(20, 24, s07, "'another': she asks her backing singers where he is, palms up; behind her, so does he", v, **stage())
# S08 (b24-28; yeah b26.52): the room on its feet, pointing at him, the band pointing too; she sings on, he dances
sadi08 = A('sadi', SHIM, *SING, at=9.0, speed=1)
s08 = [sadi08, copy(sadi08, 'saxo', *BEHIND)]
v = solve(24, 28, s08, (-0.3, 0.8, 0.4), 150, 3.8, 2.6, fov=52, dh=0.4)
add(24, 28, s08, "'yeah': the whole room on its feet pointing at him, the band pointing too; she sings on, he dances behind her", v, pets='stand', band='point', stare=list(BEHIND))
# S09 (b28-32; see b29.36, b31.37): she asks the room if anyone's seen him; he asks too, at her shoulder
sadi09 = A('sadi', 'asking_question', *SING, at=2.6, speed=0.5)
s09 = [sadi09, copy(sadi09, 'saxo', *BEHIND)]
v = solve(28, 32, s09, (-0.3, 1.05, 0.3), 5, 3.3, 1.0, push=0.1, ease='lin')
add(28, 32, s09, "'see... see': she asks the room if anyone has seen him; at her shoulder he asks too", v, pets='point', stare=list(BEHIND))
# S10 (b32-36, the stop bar: the band stops dead, the a cappella tag, holler b33.84): she hollers it at the ceiling,
# and behind her he howls too: two muzzles up, the band frozen, the room dark
sadi10 = A('sadi', 'long_yell_while_standing_leaning_back', *SING, at=0.95, speed=0.25)
s10 = [sadi10, copy(sadi10, 'saxo', *BEHIND)]
v = view((-0.1, 0.32, 2.35), (-0.18, 1.05, 0.3), 56, p1=(-0.1, 0.3, 2.15), ease='lin')
add(32, 36, s10, "the band stops dead: she hollers the tag at the ceiling; behind her he howls it too", v, pets='watch', band='stop', hush=True)

# ACT 2, verse 2 (b36-68): the search through the grand hotel, in black and white (the clip's own)
# S11 (b36-40; lonely b36.05): down the long corridor towards the lens, the white doorway behind: she walks alone and
# lonely; he tiptoes right behind her in step
sadi11 = A('sadi', 'happy_walk', 0.0, -6.0, at=0.2, speed=0.6, mz=0.5)
s11 = [sadi11, copy(sadi11, 'saxo', 0.62, -6.62)]
v = solve(36, 40, s11, (0.3, 1.0, -6.1), 0, 3.1, 1.0, fov=52, m='hotel', push=0.12, ease='lin')
add(36, 40, s11, "'lonely': down the long corridor, the white doorway behind: she walks alone; he tiptoes right behind her in step", v, m='hotel', **mono())
# S12 (b40-44; tired b40.92): by a door she stops and yawns, tired of waiting; behind her he yawns too
sadi12 = A('sadi', 'big_yawn_while_standing', 0.0, -5.0, at=5.15, speed=0.32)
s12 = [sadi12, copy(sadi12, 'saxo', 0.42, -5.62)]
v = solve(40, 44, s12, (0.2, 1.05, -5.3), 15, 2.9, 1.05, m='hotel')
add(40, 44, s12, "'tired': she stops and yawns, tired of waiting; behind her he yawns the same yawn", v, m='hotel', **mono())
# S13 (b44-48; ready b45.05): she whirls round to look back down the corridor: his head is poking out of a doorway
# beside her, eyes wide
s13 = [A('sadi', 'being_surprised_and_looking_right', 0.15, -0.6, yaw=180, at=1.0, speed=0.3),
       A('saxo', 'happy_idle', -1.78, DOOR_L3, yaw=90, at=0.25, speed=0, lean=20)]   # inside the doorway: the wall hides his body, only his head leans out
v = solve(44, 48, s13, (-0.55, 1.0, -0.9), 20, 3.4, 1.12, fov=52, m='hotel', dang=15, push=0.02)
add(44, 48, s13, "'ready': she whirls round to look back down the corridor: his head pokes out of a doorway right beside her", v, m='hotel', door=[3, 1], **mono())
# S14 (b48-52; where b50.10, wife b51.26): her head drops, no husband, no ring; right behind her he holds up the open
# ring box, sparkling
s14 = [A('sadi', 'disappointed_awe_shucks', 0.0, -4.0, at=1.6, speed=0.35), A('saxo', 'happy_idle', 0.62, -4.6, at=0.3, speed=0.1, **RING_L)]
v = solve(48, 52, s14, (0.45, 1.1, -4.3), 0, 3.5, 1.1, fov=46, m='hotel')   # the look point between his face and the ring at his shoulder
add(48, 52, s14, "'where... wife': her head drops: no husband, no ring; right behind her he holds up the open ring box, sparkling", v, m='hotel', **mono())
# S15 (b52-56; wait b51.74, heart b54.41): the grand hall at the foot of the staircase: she clutches her heart; behind
# her, so does he
sadi15 = A('sadi', 'happy_idle', 0.0, -23.6, at=0.3, speed=0.1, arm='both', aim='heart', upAt=-1)
s15 = [sadi15, copy(sadi15, 'saxo', 0.62, -24.25)]
v = solve(52, 56, s15, (0.25, 1.05, -23.9), -5, 4.0, 0.55, fov=54, m='hotel', push=0.15, ease='lin')
add(52, 56, s15, "'heart': at the foot of the grand staircase she clutches her heart; behind her he clutches his", v, m='hotel', zone='hall', **mono())
# S16 (b56-60; love b58.32): she sways, dreaming of love, gazing up the staircase; he sways behind her
sadi16 = A('sadi', 'happy_idle', 0.0, -22.6, at=0.4, speed=0.4, sway=7, swayEvery=1, arm='both', aim='heart', upAt=-1)
s16 = [sadi16, copy(sadi16, 'saxo', 0.62, -23.2)]
v = solve(56, 60, s16, (0.3, 1.25, -22.8), 0, 3.1, 0.42, fov=58, m='hotel', push=0.06, dh=0.15)
add(56, 60, s16, "'love': she sways, dreaming, gazing up the grand staircase; behind her he sways the same way", v, m='hotel', zone='hall', **mono())
# S17 (b60-64; praying b61.02): she prays for a husband, paws clasped; right behind her he holds out the ring
s17 = [A('sadi', 'falling_to_knees_in_prayer', 0.0, -23.0, at=3.3, speed=0.25), A('saxo', 'happy_idle', 0.62, -23.62, at=0.3, speed=0.1, lean=8, **RING_L)]
v = solve(60, 64, s17, (0.45, 1.1, -23.3), 0, 3.3, 1.05, fov=46, m='hotel')
add(60, 64, s17, "'praying': she prays for a husband, paws clasped; right behind her he holds out the open ring box", v, m='hotel', zone='hall', **mono())
# S18 (b64-68; hurry b63.73, b64.12, baby b65.51): she whirls round: the hall is empty but for a new white marble statue
# on the plinth, a dog in a fedora frozen mid-dance (him); she looks straight past it
s18 = [A('sadi', 'being_surprised_and_looking_right', -2.6, -20.4, yaw=120, at=1.1, speed=0.3)]
statue = {'who': 'saxo', 'look': 'fedora', 'clip': SHIM, 'at': 5.0, 'speed': 0, 'n': 1, 'cols': 1, 'jitter': 0, 'x0': PED[0], 'z0': PED[1], 'y0': PED_Y,
          'yaw': 35, 'face': 'world', 'pale': 0.92, 'holdAt': 0}
v = solve(64, 68, s18, (-3.4, 1.15, -21.0), 70, 3.6, 1.3, m='hotel')
add(64, 68, s18, "'hurry... baby': she whirls round: the hall is empty but for a new marble statue on the plinth, a dog in a fedora frozen mid-dance; she looks straight past it", v, m='hotel', zone='hall', crowd=statue, **mono())

# ACT 3, pre-chorus 2 (b68-100): back on stage, the gang tries to tell her
# S19 (b68-72; need b69.82): Kob, deadpan, holds up the card: HE'S BEHIND YOU!
s19 = [A('kob', 'happy_idle', -1.5, -0.1, at=0.3, speed=0.05, hold='behindsign', arm='R', aim=[0.45, 0.62, 0.64], upAt=-1, holdScale=1.25)]
v = deadpan((-1.5, -0.1), 1.0, 2.95, fov=46)
add(68, 72, s19, "'need': Kob, deadpan, holds up the card: HE'S BEHIND YOU!", v, **stage(band='stop'))
# S20 (b72-76; the held word): she reads it and turns slowly round: he has dropped flat on his back behind her heels
s20 = [A('sadi', 'happy_idle', *SING, yaw=180, at=0.3, speed=0.1), A('saxo', 'laying_idle', -0.1, -0.25, yaw=90, at=1.0, speed=0.3, lying=True, arm='both', aim=[0.2, -0.2, 0.9], upAt=-1)]
v = solve(72, 76, s20, (-0.05, 0.5, 0.15), 48, 2.4, 2.6, fov=52, dh=0.4)
add(72, 76, s20, "she reads it and turns slowly round: he has dropped flat on his back behind her heels", v, **stage())
# S21 (b76-80; heart b78.27): the whole room on its feet pointing, the band pointing, the follow-spot on her: she shrugs
s21 = [A('sadi', 'shoulder_shrug', *SING, at=0.6, speed=0.35), A('saxo', SHIM, *BEHIND, at=9.0, speed=1)]
v = view((0.0, 3.4, 13.0), (0.0, 0.8, 1.0), 40, p1=(0.0, 3.3, 12.6))   # high from the back of the room: the standing guests below, their paws pointing at the stage, her in the spot   # from the side wall: the guests on their feet in profile, pointing at the stage (from behind them their backs were black blocks)
add(76, 80, s21, "'heart': the whole room on its feet pointing, the band pointing, the spot on her; she shrugs; behind her he dances", v, pets='stand', band='point', stare=list(BEHIND), spot=list(SING))
# S22 (b80-84): the reverse from behind him: every guest pointing at the lens
s22 = [A('saxo', SHIM, *BEHIND, at=9.0 + S(80, 76), speed=1, fg=True), A('sadi', 'shoulder_shrug', *SING, at=1.4, speed=0.2)]
v = solve(80, 84, s22, (0.0, 0.6, 5.0), 185, 6.3, 1.5, fov=56, dang=15, rng=(0.9, 1.2))
add(80, 84, s22, "from behind him: every guest in the room pointing straight at him", v, pets='stand', stare=list(BEHIND), spot=list(SING))
# S23 (b84-88; away b85.19): she gives up: sits on the edge of the stage; right behind her he sits too
sadi23 = A('sadi', 'happy_walk', 0.35, 0.9, yaw=-90, at=0.2, speed=0.6, mx=-0.5)
s23 = [sadi23, copy(sadi23, 'saxo', 0.97, 0.9)]
v = solve(84, 88, s23, (0.4, 1.0, 0.9), 0, 3.4, 1.0, push=0.04)
add(84, 88, s23, "'away': she gives up and walks off along the stage; right behind her, in step, so does he", v, pets='watch', stare=[0.7, 0.9], mic=False)
# S24 (b88-92; man b91.03): Compote marches up and points at him, furious; Sadi looks at her, lost
s24 = [A('compote', 'quickly_pointing_angrily_forward', -1.25, 1.35, yaw=yaw_to((-1.25, 1.35), (0.47, 0.9)), at=0.8, speed=0.35),
       A('sadi', 'happy_idle', -0.15, 0.9, yaw=-60, at=0.3, speed=0.1), A('saxo', 'happy_idle', 0.47, 0.9, yaw=-60, at=0.3, speed=0.1)]
v = solve(88, 92, s24, (-0.3, 0.95, 1.0), 10, 4.0, 1.0)
add(88, 92, s24, "'man': Compote marches up and points at him, furious; Sadi looks at her, lost; he freezes", v, pets='watch', stare=[0.47, 0.9])
# S25 (b92-96): Kob, deadpan: her head drops (she's hopeless)
s25 = [A('kob', 'happy_idle', -1.5, -0.1, at=0.25, speed=0.03)]   # the deadpan stare (her bowed head read as a grey lump)
v = deadpan((-1.5, -0.1), 0.98, 2.9, fov=46)
add(92, 96, s25, "Kob, deadpan, stares at the lens: unbelievable", v, **stage())
# S26 (b96-100; need b98.18, tell b99.34; the band's break b98-100): Sadi back at the mic for the last chorus, the spot
# on her; he straightens up behind her
sadi26 = A('sadi', 'happy_idle', *SING, at=0.4, speed=0.4)
s26 = [sadi26, copy(sadi26, 'saxo', *BEHIND)]
v = solve(96, 100, s26, (-0.3, 1.05, 0.3), 5, 3.2, 0.95, ease='lin')
add(96, 100, s26, "'need... tell': back at the mic for the last chorus, the spot on her; behind her he straightens up", v, **stage(spot=list(SING), band='stop'))

# ACT 4, chorus 3 (b100-132): the whole stage copies her behind her back
# S27 (b100-104; husband b104.29): behind her, Saxo, Kob and Compote in a line, all doing her shim sham in sync
LINE = [BEHIND, (0.62, -0.15), (1.25, -0.55)]   # staggered so every face shows from the front, 0.62 m apart
sadi27 = A('sadi', SHIM, *SING, at=11.0, speed=1)
s27 = [sadi27] + [copy(sadi27, w, x, z) for w, (x, z) in zip(('saxo', 'kob', 'compote'), LINE)]
v = solve(100, 104, s27, (0.15, 0.95, 0.0), 0, 4.8, 0.45, fov=58, push=0.12, dh=0.3, rng=(0.8, 1.35), roll=[-8, -5])
add(100, 104, s27, "'where is my husband': behind her, Saxo, Kob and Compote in a line, all doing her dance in sync", v, **stage(spot=list(SING)))
# S28 (b104-108; taking long): the line of copycats from high at the side
s28 = [dict(a, at=11.0 + S(104, 100)) for a in s27]
v = solve(104, 108, s28, (0.2, 0.8, -0.1), 25, 4.8, 2.2, fov=52, dh=0.4)
add(104, 108, s28, "the line of copycats behind her back, every step in sync", v, **stage())
# S29 (b108-112; find b111.40): she peers out with the spot sweeping the floor; from behind the line, the room points
s29 = [A('saxo', SHIM, *LINE[0], at=13.0, speed=1, fg=True), A('sadi', 'being_surprised_and_looking_right', *SING, at=1.1, speed=0.3)]
v = solve(108, 112, s29, (0.0, 0.6, 5.0), 185, 6.0, 1.5, fov=56, dang=15, rng=(0.9, 1.2))
add(108, 112, s29, "'find': she peers out, the spot sweeping the floor; the whole room points back at them", v, pets='point', stare=list(LINE[0]), spot=[-1.6, 5.4])
# S30 (b112-114.5): the line dancing behind her
s30 = [dict(a, at=15.0) for a in s27]
v = solve(112, 114.5, s30, (0.15, 1.0, 0.0), 0, 5.0, 1.05, push=0.03)
add(112, 114.5, s30, "the line dancing behind her", v, **stage())
# S31 (b114.5-116; oh b115.19): she spins round: the line freezes mid-step like statues
s31 = [A('sadi', 'happy_idle', *SING, yaw=180, at=0.3, speed=0.1)] + [dict(a, holdAt=0) for a in s30[1:]]
add(114.5, 116, s31, "'oh': she spins round: the whole line freezes mid-step like statues", v, **stage(still=True))
# S32 (b116-120; where b117.67, lover b120.37): she turns back to the room; behind her the line dances again and Saxo
# takes out the ring box
sadi32 = A('sadi', SHIM, *SING, at=17.0, speed=1)
s32 = [sadi32, A('saxo', 'happy_idle', *BEHIND, at=0.3, speed=0.2, **RING_UP), copy(sadi32, 'kob', *LINE[1]), copy(sadi32, 'compote', *LINE[2])]
v = solve(116, 120, s32, (0.15, 1.0, 0.1), 0, 4.8, 1.0)
add(116, 120, s32, "'where... lover': she turns back to the room; the line dances on, and Saxo takes out the ring box", v, **stage())
# S33 (b120-124; another b124.09): he holds the open ring out behind her; the whole room gasps
s33 = [A('sadi', SHIM, *SING, at=19.0, speed=1), A('saxo', 'happy_idle', *BEHIND, at=0.3, speed=0.1, lean=8, **RING)]
v = solve(120, 124, s33, (-0.3, 1.0, 0.3), -22, 3.3, 1.1)
add(120, 124, s33, "'another': he holds the open ring out behind her; the whole room gasps", v, pets='gasp', stare=list(BEHIND), spot=list(SING))
# S34 (b124-128; yeah b126.52): the ring box sparkling at her shoulder, his hopeful face beside it
s34 = [A('sadi', SHIM, *SING, at=21.0, speed=1, fg=True), A('saxo', 'happy_idle', *BEHIND, at=0.3, speed=0.1, lean=8, **RING_UP)]
v = solve(124, 128, s34, (-0.55, 1.1, 0.05), -15, 2.6, 1.1, fov=44)
add(124, 128, s34, "'yeah': the ring sparkling at her shoulder, his hopeful face beside it", v, pets='gasp', stare=list(BEHIND))
# S35 (b128-129.35; see b129.35): she starts to turn
s35 = [A('sadi', 'being_surprised_and_looking_right', *SING, at=1.0, speed=0.5), A('saxo', 'happy_idle', *BEHIND, at=0.3, speed=0.1, lean=8, **RING)]
v = solve(128, 129.35, s35, (-0.3, 1.0, 0.3), -10, 3.3, 1.0, push=0.02)
add(128, 129.35, s35, "'see': she starts to turn round", v, pets='gasp', stare=list(BEHIND))
# S36 (b129.35-132.13; see b131.36): she has turned: face to face with him, he holds out the open ring, her paws fly to
# her cheeks; the band stops dead on the last word
s36 = [A('sadi', 'happy_idle', 0.15, 0.55, yaw=yaw_to((0.15, 0.55), (-0.45, -0.2)), at=0.3, speed=0.1, **GASP), A('saxo', 'happy_idle', -0.45, -0.2, yaw=yaw_to((-0.45, -0.2), (0.15, 0.55)), at=0.3, speed=0.1, lean=6, hold='ringopen', arm='R', aim=[0.1, 0.55, 0.75], upAt=-1, holdScale=2.3)]   # 0.96 m apart (nose to nose it read as a kiss), the ring held up between their faces
v = solve(129.35, 132.13, s36, (-0.1, 1.0, 0.22), 123, 2.8, 1.05, push=0.04)
add(129.35, 132.13, s36, "'see': she has turned round: face to face with him, he holds out the open ring, her paws fly to her cheeks", v, pets='gasp', stare=list(BEHIND))
# S37 (b132.13-133.13): the button, in the silence: everyone frozen, the ring still sparkling
s37 = [dict(a, holdAt=0) for a in s36]
add(132.13, 133.13, s37, "the button, in the silence: everyone frozen; only the ring sparkles", v, pets='gasp', stare=list(BEHIND), stop=True, still=True)

for s in shots: clean(s['actors'])
shots.sort(key=lambda x: x['beat'])
ep = {
    'date': '2026-10-10', 'song': {'title': 'WHERE IS MY HUSBAND!', 'artist': 'RAYE'},
    'logline': "Sadi, a 1940s torch singer in the clip's red sequin gown, sings where is my husband to a whole supper club and searches the grand hotel for him, while Saxo, the husband in a pinstripe suit and fedora, is right behind her the whole time, copying her every move with a ring box in his paw and hiding worse every time she turns (behind the mic stand's thin pole, in a doorway, as a marble statue, flat on the floor); the room points, Kob holds up HE'S BEHIND YOU!, the whole stage copies her behind her back and freezes when she turns, and on the band's dead stop she finally turns round: he's holding out the ring",
    'new': "src/maps40.js: ballroom (a 1940s supper club's big-band stage: the clip's bulb panels on the curtain and on tripods, a red velvet curtain and a gold valance, the ribbon mic, the band in white dinner jackets on risers (trumpet, sax, trombone, double bass, piano, drums: `band` play | point | stop), round tables of guests in evening wear (`pets` watch | point | stand | cheer | gasp), chandeliers, a follow-spot (`spot`), `hush`, `stop`) and hotel (the clip's black-and-white world: a long corridor of doors with the white light at its end, a marble hall with a chandelier, a grand staircase and a plinth for a statue; `zone`, `door`); src/ps1.js: the `behindsign` (HE'S BEHIND YOU!), `ringbox` and `ringopen` (the open ring box, its diamond twinkling) props; four looks: sadi torch (the clip's red sequin halter gown), saxo fedora (the husband's 1940s pinstripe suit and fedora), kob sequin and compote sequin (the backing singers' red sequin minis)",
    'notes': "The world, from the official video (contact sheets every 3 s; nothing violent in it): a 1940s picture show: the singer in a red sequin halter gown at a ribbon mic before a big band under rows of bulb panels, her backing trio in red sequin minis; black-and-white hotel corridors with a man's silhouette in the light at the end, a grand hall with a chandelier and a staircase; a backing singer's card YOUR HUSBAND IS COMING!, a crate THIS BOX MAY CONTAIN RAYE. Ours parodies it with the pet-owner universal behind the live reference `right-behind-you` (the dog you call while he's right next to you): the husband she sings for is the dog right behind her. Saxo is the lead of the joke (in every shot but the inserts), Sadi the singer (the romance, GAGS 3), Kob the deadpan backing singer who holds up the card, Compote the furious one who marches up and points.",
    'yt': [13.13, 68.863],   # the Short opens on a dance (S08: the room on its feet, he dances behind her; the karaoke's next line shows from 13.13 s): from the earliest line that fits it opened on a story beat (S07, the backing singers asked)
    'with': ['sadi', 'kob', 'compote'],
    'clips': sorted({a['clip'] for s in shots for a in s['actors']} | {SHIM}),
    'tags': {'structure': 'right behind you', 'scenes': ['copycat behind her back', 'the thin-pole hide', 'the doorway peek', 'the marble statue', 'flat on the floor', 'the room points', "HE'S BEHIND YOU! card", 'the line of copycats', 'the statues freeze', 'the ring on the dead stop'],
             'cast': ['saxo', 'sadi', 'kob', 'compote'], 'hook': 'dance', 'maps': ['ballroom', 'hotel'], 'ref': 'right-behind-you',
             'lyric_literal': "'husband' (she looks out for him, he's behind her), 'find' (the room points at him), 'oh' (she spins: he freezes behind the mic's thin pole), 'see' (she asks the room), the tag (both howl), 'lonely' (the empty corridor, him in step behind), 'tired' (two yawns), 'wife' (the ring box behind her drooping head), 'heart' (two paws on two hearts), 'praying' (she prays, he holds out the ring), 'need' (HE'S BEHIND YOU!), 'away' (she gives up), 'man' (Compote points), 'oh' (the line freezes), 'see' (she turns: the ring)",
             'experiment': "A pet-owner universal in the song's own question (the dog who is right behind you while you look for him) with a dance hook on a 318k-video sound: does a running hide-and-seek gag with a proposal payoff lift the Short's likes per view at 24 h over the last three episodes?"},
    'shots': shots,
}
json.dump(ep, open(os.path.join(HERE, '2026-10-10-2.json'), 'w'), indent=1, ensure_ascii=False)
print(len(shots), 'shots;', len(WARN), 'warnings')
for w in WARN: print('  ', w)
