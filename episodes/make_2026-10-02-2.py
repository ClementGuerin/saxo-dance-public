# make_2026-10-02-2.py: writes episodes/2026-10-02-2.json, "Bring Me To Life" (Evanescence, 2003; a throwback on the
# charts in spooky season: #66 on Spotify's global daily chart and #60 in the US on 2026-10-01, 697k TikTok videos on its
# 60 s sound). The clip: a gothic city at night in the rain; the singer, asleep in a white nightgown, sleepwalks out of
# her tower window onto the ledge, past lit windows (a party in clown masks, the band in a padded room), hangs over the
# drop, is caught by the wrists, falls, and wakes up in bed.
# Ours, "the sleepwalker" (new structure, SLEEPWALKER: the lead walks through every danger asleep and untouched while
# the ones trying to save him take every hit; he wakes up fresh and they're the wrecks): a sleepover at Saxo's, high up
# in a gothic tower. He sleep-dances out of the window in his nightshirt, nightcap and sleep mask. Sadi and Compote try
# to wake him on every 'wake': Compote's ringing alarm clock at his ear (he dances away, the clock goes over the edge),
# Sadi yelling from the window. He steps off the end of the ledge on 'nothing' and a crane's girder swings in under his
# foot; it carries him, dancing, to the steel skeleton of the tower going up next door. They crawl after him across a
# plank over the drop; on 'breathe' Sadi's true-love kiss lands on a steel column, Compote's bucket of water bounces off
# it onto Sadi, and Compote's uppercut misses and sends her off the edge, where the crane's hook catches her by the
# pyjamas. He walks off the end of a beam on the song's own near-silent bar; on the downbeat of chorus 2 the hook rises
# under him and he dances on top of it, Compote dangling below. The crane brings them back to his window; Sadi leans
# out to grab them, slips, and he catches her paw in his sleep (the clip's catch, reversed). He steps off the hook into
# the void: the clip's fall, past the lit windows... and it's dawn: he's asleep in bed, the alarm clock rings, he wakes
# up fresh ('life'), dances his morning dance, opens the curtains: Sadi and Compote asleep outside, soaked, Compote
# still hanging from the hook. Kob never leaves her armchair all night, milk in paw, and is asleep in it by morning.
# Beats: 94.8809 BPM, kit beat b at b * 60 / 94.8809 s (kit beat 0 = song beat 82, chorus 1's downbeat); a bar = 4 beats
# (2.529 s). Sections: b0-32 chorus 1, b32-36 its break bar, b36-68 verse 2, b68-72 the song's near-silent bar, b72-104
# chorus 2, b104-136 the title post-chorus (b128-136 instrumental). Acted words (kit beats): 'wake' b0, b1.77, b4.49,
# b5.91, b16.11, b20.49, b70.99, b73.77, b76.49, b77.91, b88.11, b92.49; 'save' b8.38, b12.14, b25.05, b25.76, b80.38,
# b84.14, b97.05, b97.76; 'nothing' b28.34, b100.34, b117.59; 'breathe' b50.30; 'real' b59.54; 'life' b68.20, b112.10,
# b127.69; 'lie' b115.15. The lyrics stay in episodes/2026-10-02-2.lyrics.js.
import json, math, os, re, sys
sys.path.insert(0, os.path.dirname(__file__))
from cam import view, vpath, deadpan

HERE = os.path.dirname(__file__)
PER = 60 / 94.8809
def T(b): return b * PER
def S(b, b0): return round(T(b) - T(b0), 3)    # seconds from shot beat b0 to beat b

LOOK = {'saxo': 'sleepwalker', 'sadi': 'nightie', 'kob': 'pyjama', 'compote': 'pyjamas'}
HEAD = {'saxo': 1.42, 'sadi': 1.28, 'kob': 1.32, 'compote': 1.42}   # the top of each head standing (the nightcap, the bow, the mask on her forehead, the ears)
FACE = {'saxo': 0.9, 'sadi': 0.84, 'kob': 0.86, 'compote': 0.86}
NECK = {'saxo': 0.65, 'sadi': 0.6, 'kob': 0.59, 'compote': 0.6}    # the head bone, standing (the collar: a hook catches it there)
RAD = {'saxo': 0.4, 'sadi': 0.35, 'kob': 0.35, 'compote': 0.35}     # a head's silhouette radius with ears and hats
DROP = 0.3                                     # a seated body's head sits ~0.3 m lower than standing (male_driving_a_car)

# the map (src/maps24.js TOWER)
FACE_Z, LEDGE_Z, X0, X1 = -0.5, 0.45, -7.2, 6.5
LZ, BZ = -0.02, -0.05                          # the ledge's middle line, the skeleton's middle beam
BED, BED_Y = (-2.0, -3.2), 0.5
CHAIR, CHAIR_YAW = (1.9, -4.6), round(math.degrees(-0.45), 1)
JIB_Z, BLOCK_TOP, GIRDER_DROP = 1.0, 1.6, 2.0
GIRDER_TOP = 0.36; HOOK_GIRDER = GIRDER_TOP + GIRDER_DROP   # the hook's height carrying the girder (its top a step above the ledge)

def A(who, clip, x, z, **o):
    return {'who': who, 'look': o.pop('look', LOOK[who]), 'clip': clip, 'x': round(x, 3), 'z': round(z, 3), 'face': o.pop('face', 'camera'),
            'yaw': o.pop('yaw', 0), 'at': o.pop('at', 'auto'), **o}
def kobcup(**o): return {'hold': 'milk', 'arm': 'R', 'aim': 'sip', **o}           # Kob's milk, raised to her mouth every 4th beat
def asleep(**o): return {'sleep': True, **o}                                     # the sleep mask over the eyes
SLEEPWALK = dict(arm='both', aim=[0.06, 0.12, 1.0])                            # both arms straight out in front: the sleepwalker (reads side on)
def kob_chair(**o):                            # Kob in her armchair all night, deadpan, her milk
    return A('kob', 'male_driving_a_car', CHAIR[0], CHAIR[1], face='world', yaw=CHAIR_YAW, at=0.4, speed=0.3, lift=0.24, **{**kobcup(), **o})

# ---- a projection check (numbers only): where each face lands in the 9:16 frame at the shot's start and end ----
def _proj(cam, look, fov, pt):
    f = [look[i] - cam[i] for i in range(3)]; n = math.sqrt(sum(v * v for v in f)); f = [v / n for v in f]
    r = [-f[2], 0.0, f[0]]; rn = math.sqrt(r[0] ** 2 + r[2] ** 2) or 1; r = [r[0] / rn, 0.0, r[2] / rn]
    u = [r[1] * f[2] - r[2] * f[1], r[2] * f[0] - r[0] * f[2], r[0] * f[1] - r[1] * f[0]]
    d = [pt[i] - cam[i] for i in range(3)]; z = sum(a * b for a, b in zip(d, f))
    if z <= 0.05: return None
    tv = math.tan(math.radians(fov) / 2); th = tv * 9 / 16
    return (0.5 + sum(a * b for a, b in zip(d, r)) / z / th / 2, 0.5 - sum(a * b for a, b in zip(d, u)) / z / tv / 2)
_src = open(os.path.join(HERE, '2026-10-02-2.lyrics.js')).read()
_rows = json.loads(re.search(r'window\.LYRICS = (.*?);\n', _src).group(1)); _ends = json.loads(re.search(r'window\.LINE_END = (.*?);\n', _src).group(1))
LINES = [((row[0][0] - 0.35) / PER, e / PER) for row, e in zip(_rows, _ends)]
def has_line(b0, b1): return any(a < b1 and b > b0 for a, b in LINES)
WARN = []
def body(a, end):                               # (who, x, z, face y, head top y) of an actor at the shot's start (0) or end (1)
    who = a['who']; seated = a['clip'] == 'male_driving_a_car'
    x, z = a['x'] + a.get('mx', 0) * end, a['z'] + a.get('mz', 0) * end
    lift = a.get('lift', 0) + (a.get('my', 0) if end else 0)
    if a['clip'] == 'laying_idle': return (who, x, z, lift + 0.25, lift + 0.5)
    if a['clip'].startswith('crawling'): return (who, x, z, lift + 0.45, lift + 0.8)   # on all fours: the head low and forward
    dz = DROP if seated else 0
    return (who, x, z, FACE[who] - dz + lift, HEAD[who] - dz + lift)
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
def add(beat, b1, actors, lyric, v, **o):
    c, focus = v
    o = {k: val for k, val in o.items() if val is not None}
    shots.append({'beat': beat, 'kind': 'dance', 'map': 'tower', 'actors': actors, 'lyric': lyric, 'cam': c, 'focus': focus, **o})
    fy = focus[2] if len(focus) > 2 else 0
    for k, end in ((0, 0), (-1, 1)):
        cam, look = lens(v, k), (focus[0], c['look'][k] + fy, focus[1])
        check(beat, b1, cam, look, c['fov'], actors, end)
        for oc in _occl(cam, look, c['fov'], [body(a, end)[:4] for a in actors]):
            if not next(a for a in actors if a['who'] == oc.split(' behind ')[0]).get('fg'): WARN.append(f'b{beat}: {oc}{" at the end" if end else ""}')

# ================= a lens search (the bobsled episode's): faces inside the frame and under the lyric rows, at the shot's
# start and end, no face inside a nearer head's disc =================
WHY = {}
def _no(r): WHY[r] = WHY.get(r, 0) + 1; return None
def _ok(cam, look, fov, phases, line, occ=()):
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
        pts = [(w, x, z, fy) for w, x, z, fy, _ in subs] + [o_ for o_ in occ if o_[0] not in [s_[0] for s_ in subs]]
        oc = [r_ for r_ in _occl(cam, look, fov, pts) if r_.split(' behind ')[0] in [s_[0] for s_ in subs]]
        if oc: return _no(oc[0])
    return worst
def lens_for(actors, ang, dist, b0, b1, hs=(1.2,), fov=50, look=None, spread=40, dr=(0.8, 1.5), free=None, push=0.03, **o):
    vis = [a for a in actors if not a.get('fg')]
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
                f = _ok(cam, L, fov, phases, line, occ)
                if f is None or f < 0: continue
                score = abs(da) / 40 + abs(d - dist) / dist + (0.25 - min(f, 0.25))
                if best is None or score < best[0]: best = (score, cam)
    if best is None:
        raise SystemExit(f'b{b0}: no lens for {[s_[0] for s_ in phases[0]]} round {ang} deg at {dist} m; rejections: {sorted(WHY.items(), key=lambda kv: -kv[1])[:6]}, not free: {nfree}')
    cam = best[1]; p1 = (cam[0] + (L[0] - cam[0]) * push, cam[1], cam[2] + (L[2] - cam[2]) * push)
    return view(tuple(round(c, 3) for c in cam), tuple(round(c, 3) for c in L), fov, p1=tuple(round(c, 3) for c in p1), **o)

# where a lens may stand: outside the tower's walls, or inside the bedroom; never inside the crane's mast
def outside(c):
    x, y, z = c
    if X0 - 0.15 < x < X1 + 0.15 and z < FACE_Z + 0.15 and y < 9.6: return False
    return not (abs(x - 19.0) < 0.9 and abs(z - JIB_Z) < 0.9)
def in_room(c):
    x, y, z = c
    return -2.85 < x < 2.85 and -6.25 < z < -0.95 and 0.15 < y < 2.85
def ra(v):                                      # the rain falls round the lens
    p = lens(v, 0); return [round(p[0], 2), round(p[1], 2), round(p[2], 2)]

# ================= ACT 1, chorus 1 (b0-32): the ledge =================
# S01 the hook: a swoop from high over the drop (the lit facade falling away under the ledge, the street lamps 45 m down)
# to the ledge's level, on Saxo sleep-dancing a charleston at its edge in his nightshirt, nightcap and sleep mask
s01 = [A('saxo', 'charleston', 1.7, 0.1, at=2.37, **asleep())]   # kicks at 0.95, 1.6 and 2.3 s
v = view((4.3, 4.4, 5.6), (1.7, -0.9, 0.1), 62, p1=(2.7, 1.0, 2.8), ly1=0.74, ease='out', roll=[-10, -3], hand=0.25)   # the swoop: from high out over the drop (the lit floors falling away under the ledge) down to the ledge's level, 2.5 m out, on his kick
add(0, 4, s01, "HOOK, 'wake' (b0, b1.77): night, rain, a gothic city: from out over the drop, looking down past a narrow stone ledge high up a tower (the lit facade and the street lamps far below), where Saxo, in a white nightshirt, nightcap and sleep mask, dances a charleston in his sleep; the open window behind him, red curtains billowing out",
    v, rainAt=[2.7, 1.0, 2.8], stars=['saxo'])
# S02 the watchers: Sadi and Compote, chest-high over the sill, lean out of the window, appalled; his shoulder at the lens
s02 = [A('saxo', 'charleston', 1.75, LZ, at=1.0, fg=True, **asleep()),
       A('sadi', 'short_yell_while_standing', -0.32, -0.98, face='world', yaw=40, at=0.3, lean=14, lift=0.28),
       A('compote', 'short_yell_while_standing_2', 0.36, -0.98, face='world', yaw=40, at=0.5, lean=14, lift=0.28)]
v = lens_for(s02, 18, 3.5, 4, 8, hs=(1.1, 1.25, 1.4), fov=50, free=outside, spread=20, dr=(0.9, 1.3))
add(4, 8, s02, "'wake' (b4.49, b5.91): Sadi (pink nightie) and Compote (red check pyjamas) lean out of the window, both yelling at him; his white shoulder at the edge of the frame",
    v, rainAt=ra(v), blow=False, stars=['sadi', 'compote'])
# S03 Compote climbs out with the alarm clock ringing, held out beside her head on the lens side, and edges along the ledge
s03 = [A('sadi', 'short_yell_while_standing', 0.1, -0.98, face='world', yaw=40, at=0.8, lean=14, lift=0.28),
       A('compote', 'happy_walk', 0.62, LZ, face='world', yaw=90, at=0.2, speed=0.7, mx=1.0, hold='clock', arm='R', aim=[0.05, 0.3, 1.0]),
       A('saxo', 'charleston', 2.45, LZ, at=0.9, **asleep())]
v = lens_for(s03, 0, 7.0, 8, 16, hs=(1.0, 1.2, 1.4), fov=50, free=outside, spread=15, dr=(0.85, 1.3))
add(8, 16, s03, "'save' (b8.38), 'call' (b9.82), 'name' (b10.99), 'save' (b12.14): a wide from the void: Sadi yells from the window; Compote climbs out with a red alarm clock ringing in her paw, held out beside her head, and edges along the ledge towards him; Saxo dances on, asleep",
    v, rainAt=ra(v), blow=False, stars=['compote'])
# S04 'wake': the ringing clock right at his ear; he dances on
s04 = [A('compote', 'happy_idle', 2.15, 0.02, face='world', yaw=90, at=0.3, hold='clock', arm='R', aim=[0.0, 0.62, 0.8]),   # in profile, the clock held forward into the gap at his ear
       A('saxo', 'gangnam', 2.92, LZ, at=1.1, **asleep())]
v = lens_for(s04, 0, 3.7, 16, 20, hs=(0.85, 1.0, 1.15), fov=50, free=outside, spread=10, dr=(0.9, 1.2))   # frontal: the clock between their heads
add(16, 20, s04, "'wake' (b16.11): Compote holds the ringing alarm clock right up to his ear; Saxo, asleep under his sleep mask, keeps dancing (gangnam's horse stance)",
    v, rainAt=ra(v), stars=['saxo', 'compote'])
# S05 'wake': from above the void: Compote, lunging after him, teeters on the very edge, paws windmilling; her clock
# tumbles away down the lit facade towards the street lamps; behind her he shimmies on, asleep
s05 = [A('compote', 'happy_idle', 2.75, 0.36, face='world', yaw=10, at=0.3, lean=30, arm='both', aim='flail', flapEvery=0.5, hold='clock', toss={'at': 0.3, 'to': [2.9, -4.2, 1.5], 'dur': 2.0, 'arc': 0.55, 'scale': 1.7}),
       A('saxo', 'shimmy', 1.85, -0.25, at=1.0, **asleep())]
v = view((3.8, 2.45, 4.1), (2.35, 0.55, 0.1), 54, p1=(3.75, 2.4, 3.95), roll=[5, 8], hand=0.3)
add(20, 24, s05, "'wake' (b20.49): from above, over the drop: Compote lunges after him and teeters on the very edge of the ledge, paws windmilling, as her alarm clock tumbles away down the lit facade towards the street far below; Saxo shimmies on behind her, asleep",
    v, rainAt=ra(v), stars=['compote'])
# S06 'nothing': he sleepwalks to the end of the ledge, arms out, and steps off into nothing; a girder on the crane's
# cables slides in under his foot just in time (b28.34) and he steps up onto it. From the front, the gap and its drop in frame.
T_STEP = S(28.34, 24)
s06 = [A('saxo', 'happy_walk', 5.62, -0.3, face='world', yaw=90, at=0.1, speed=1.0, mx=round(6.82 - 5.62, 3), moveAt=0.0, my=GIRDER_TOP, myAt=round(T_STEP - 0.12, 3), myDur=0.25, lean=-5, **SLEEPWALK, **asleep())]
v = view((11.9, 2.1, 3.3), (6.7, 0.55, 0.3), 52)   # from his right, 60 deg round: the girder's back cable 0.5 m clear of his head, the gap and its drop beside him
add(24, 29, s06, "'save' (b25.05, b25.76), 'nothing' (b28.34): Saxo sleepwalks to the end of the ledge, arms out in front, and steps off into nothing, over a 40-floor drop; a steel girder on the crane's cables slides in under his foot just in time and he steps up onto it",
    v, rainAt=ra(v), girder=True, trolley=[14.5, 6.8], trolleyAt=0.0, trolleyDur=round(T_STEP - 0.05, 3), hookY=HOOK_GIRDER, stars=['saxo'])

# ================= ACT 2, the break (b32-36) and verse 2 (b36-68): the girders =================
# S07 (from b29) the crane swings the girder out over the gap with him dancing on it; Sadi at the corner, aghast
s07 = [A('saxo', 'charleston', 6.82, 0.05, lift=GIRDER_TOP, mx=round(9.3 - 6.82, 3), at=0.25, **asleep()),
       A('sadi', 'being_surprised_and_looking_right', 5.9, 0.0, face='world', yaw=45, at=0.4)]
v = lens_for(s07, 20, 8.6, 29, 36, hs=(2.4, 2.8, 3.2), fov=54, free=outside, spread=30, dr=(0.9, 1.4))
add(29, 36, s07, "the break bar: the crane carries the girder out over the gap with Saxo dancing on it, asleep, the street lamps 45 m below; Sadi at the corner of the ledge, aghast",
    v, rainAt=ra(v), girder=True, trolley=[6.82, 9.3], hookY=HOOK_GIRDER, stars=['saxo'])
# S08 Kob's deadpan #1: in her armchair in the bedroom, she sips her milk, unmoved
s08 = [kob_chair(flapPh=2)]
v = deadpan(CHAIR, 1.0, 2.1, cam_y=1.02, push=0.1, fov=42, ang=CHAIR_YAW)
add(36, 40, s08, "verse 2 begins: Kob in her armchair in the bedroom, lilac pyjamas, sleep mask up on her forehead; she sips her milk, unmoved",
    v, rain=False, stars=['kob'])
# S09 the plank: Sadi and Compote crawl after him on all fours across a scaffold board over the drop
s09 = [A('sadi', 'happy_walk', 7.4, BZ, face='world', yaw=90, at=0.2, speed=0.55, lift=0.05, mx=0.7, arm='both', aim='flail', flapEvery=2),
       A('compote', 'happy_walk', 6.45, BZ, face='world', yaw=90, at=0.8, speed=0.55, lift=0.05, mx=0.7, arm='both', aim='flail', flapEvery=2)]
v = lens_for(s09, 15, 4.8, 40, 48, hs=(2.0, 2.4, 2.8), fov=54, free=outside, spread=20, dr=(0.85, 1.3), look=(7.6, 0.55, BZ))
add(40, 48, s09, "'without' (b43.12), 'leave' (b47.46): from above the void: Sadi and Compote inch after him across a narrow scaffold board laid over the gap, paws out for balance, the street lamps far below",
    v, rainAt=ra(v), plank=True, trolley=18.0, hookY=-1.4, stars=['sadi'])
# S10 'breathe': true love's kiss to wake him lands on a steel column, hearts popping; he dances on behind it
s10 = [A('sadi', 'kissing_a_taller_person_for_a_short_period', 11.93, BZ, face='world', yaw=90, at=0.5, speed=0.9),
       A('saxo', 'charleston', 13.05, -0.55, at=0.7, **asleep())]
v = lens_for(s10, 4, 4.2, 48, 52, hs=(0.9, 1.05, 1.2), fov=50, free=outside, spread=15, dr=(0.9, 1.3))
add(48, 52, s10, "'breathe' (b50.30): on the skeleton's steel deck: Sadi leans in for true love's kiss to wake him and kisses a steel column instead, pink hearts popping; Saxo dances a charleston on behind it, asleep",
    v, rainAt=ra(v), plank=True, trolley=18.0, hookY=-1.4, hearts=[[12.25, 1.25, BZ + 0.15, round(S(50.3, 48), 3)]], stars=['sadi'])
# S11 the bucket: Compote flings a bucket of water at him; it bounces off the column all over Sadi, who's left dripping
T_THROW = 0.75
s11 = [A('compote', 'happy_idle', 11.05, 0.42, face='world', yaw=75, at=0.3, hold='bucket', arm='both', aim='bail', flapEvery=4, flapPh=round(-T_THROW / PER, 3)),
       A('sadi', 'long_yell_while_standing_leaning_back', 11.93, BZ, face='world', yaw=30, at=0.4),
       A('saxo', 'charleston', 13.05, -0.55, at=1.9, **asleep())]
v = lens_for(s11, 6, 4.2, 52, 56, hs=(0.9, 1.05, 1.2), fov=50, free=outside, spread=20, dr=(0.85, 1.3))
add(52, 56, s11, "Compote flings a bucket of water at him; it splashes off the steel column all over Sadi, who's left dripping and shocked; Saxo dances on behind it, dry and asleep",
    v, rainAt=ra(v), plank=True, trolley=18.0, hookY=-1.4, douse=[11.35, 0.85, 0.42, 11.95, 1.2, BZ + 0.1, T_THROW, 0.4], drips=[[11.93, BZ + 0.15, 1.3]], dripAt=round(T_THROW + 0.45, 3), stars=['compote'])
# S12 'real': side on: her uppercut in slow motion; he moonwalks away from it in his sleep and it whistles past his nose
s12 = [A('compote', 'standing_left_uppercut_punch', 10.95, -0.45, face='world', yaw=90, at=0.06, speed=0.2, once=True, holdAt=2.2),   # slow motion, frozen on 'real' at full reach (clip 0.5 s: the left fist 0.36 m out at her face's height)
       A('saxo', 'happy_idle', 11.33, -0.45, face='world', yaw=-90, at=0.5, lean=-12, **asleep())]   # his nose a hand past her fist
v = view((11.2, 0.62, -3.6), (11.2, 0.85, -0.45), 50)   # from behind the skeleton: her punching (left) paw on the near side, their heads against the open sky
add(56, 60, s12, "'real' (b59.54): side on: Compote throws an uppercut in slow motion; Saxo leans back from it in his sleep and her fist stops a hair from his nose",
    v, rainAt=ra(v), plank=True, trolley=18.0, hookY=-1.4, key=[11.2, 1.6, -2.2, 0.75, 0.75, 0.9], stars=['compote'])
# S13 her swing carries her off the edge... and the crane's hook catches her by the pyjama collar: she dangles, kicking
HC = (13.95, JIB_Z)                             # where the hook waits under the deck's edge
s13 = [A('compote', 'happy_run', HC[0], HC[1], at=0.3, speed=1.4, lift=round(-1.4 - NECK['compote'] - 0.03, 3), air=True, arm='both', aim='flail', flapEvery=0.5, noShadow=True)]
v = lens_for(s13, 35, 3.4, 60, 64, hs=(-1.2, -0.9, -0.6), fov=52, free=outside, spread=15, dr=(0.9, 1.3))
add(60, 64, s13, "she flew off the edge of the deck... and the crane's hook caught her by her pyjama collar: Compote dangles from it over the drop, kicking, paws flailing, furious",
    v, rainAt=ra(v), plank=True, trolley=HC[0], hookY=-1.4, stars=['compote'])
# S14 'life': side on, he sleepwalks along a bare beam to its end, arms out, head up, and steps off it
FZ_ = 2.9; BEAM_END = 15.65                   # the skeleton's front row: a bare beam, no columns, ending at x 15.65
s14 = [A('saxo', 'happy_walk', 14.9, FZ_, face='world', yaw=90, at=0.1, speed=0.75, mx=1.05, lean=-6, air=True, **SLEEPWALK, **asleep())]
v = view((15.4, 0.75, FZ_ + 4.2), (15.4, 0.8, FZ_), 50)   # side on, eye level: the beam ends under his last steps, then air under his lead foot
add(64, 68, s14, "'life' (b68.20): side on: Saxo sleepwalks along a bare steel beam to its end, arms out in front, and steps off into the void",
    v, rainAt=ra(v), plank=True, trolley=19.5, hookY=3.5, stars=['saxo'])
# S15 the song's near-silent bar: from below, he stands on the night sky past the end of the beam, frozen; lightning
s15 = [A('saxo', 'happy_walk', 16.05, FZ_, face='world', yaw=90, at=0.7, speed=0.0, air=True, noShadow=True, lean=-6, **SLEEPWALK, **asleep())]   # no shadow: nothing under him
v = view((15.3, 2.2, FZ_ + 3.7), (15.95, 0.5, FZ_), 58)   # side on from a little above: the beam's end a step behind his heels and only the street 45 m below his feet (from the beam's level a far roofline sat on his feet; the middle row's end column stands clear on his left)
add(68, 72, s15, "the song's near-silent bar: side on: Saxo stands on nothing in mid-air past the end of the beam, arms out, asleep, against the night sky; a flash of lightning",
    v, rainAt=ra(v), plank=True, trolley=19.5, hookY=3.5, still=True, flash=[0.15], white=[0.15], stars=['saxo'])

# ================= ACT 3, chorus 2 (b72-104): the crane =================
HK = (15.85, JIB_Z)
def on_block(hy, x, **o): return A('saxo', o.pop('clip', 'charleston'), x, JIB_Z + 0.1, lift=round(hy + BLOCK_TOP, 3), noShadow=True, **{**asleep(), **o})
def dangling(who, hy, x, dz=0.0, **o): return A(who, o.pop('clip', 'happy_run'), x, JIB_Z + 0.22 + dz, lift=round(hy - NECK[who] - 0.03, 3), air=True, noShadow=True, **o)   # hung in front of the hook: the shank runs behind her head
# S16 the downbeat: the hook rises under him and he lands on top of the block, dancing; Compote dangles below
s16 = [on_block(-1.6, HK[0], at=0.25), dangling('compote', -1.6, HK[0], dz=0.0, at=0.4, speed=1.4, arm='both', aim='flail', flapEvery=0.5)]
v = lens_for(s16, 20, 6.0, 72, 76, hs=(-0.6, -0.3, 0.0), fov=58, free=outside, spread=20, dr=(0.9, 1.3))
add(72, 76, s16, "'wake' (b70.99, b73.77): chorus 2 slams in: the crane's hook rises under him and he lands on top of the hook block, dancing on it in his sleep, over the city; Compote dangles from the hook below him by her collar, kicking",
    v, rainAt=ra(v), trolley=HK[0], hookY=-1.6, stars=['saxo'])
# S17 Kob's deadpan #2, a new angle: lower, from her right; she sips
s17 = [kob_chair(flapPh=2)]
v = deadpan(CHAIR, 1.0, 2.45, cam_y=0.72, push=0.1, fov=44, ang=CHAIR_YAW + 32)
add(76, 80, s17, "'wake' (b76.49, b77.91): Kob in her armchair, from low on her right: she sips her milk, unmoved",
    v, rain=False, stars=['kob'])
# S18 the crane swings them back over the gap, high over the street: he dances on the block, Compote dangles below
HX = (7.9, JIB_Z)
s18 = [on_block(0.4, HX[0] + 0.8, mx=-0.8, at=0.9), dangling('compote', 0.4, HX[0] + 0.8, dz=0.0, mx=-0.8, at=0.2, speed=1.4, arm='both', aim='flail', flapEvery=0.5)]
v = lens_for(s18, -25, 5.4, 80, 88, hs=(3.6, 4.0, 4.4), fov=56, free=outside, spread=20, dr=(0.85, 1.3))   # from the tower's side: no skeleton beam across him
add(80, 88, s18, "'save' (b80.38), 'call' (b81.82), 'name' (b82.99), 'save' (b84.14): from above: the crane swings them back over the gap, high over the street lamps, Saxo dancing on the hook block, Compote dangling below",
    v, rainAt=ra(v), trolley=[HX[0] + 0.8, HX[0]], hookY=0.4, stars=['saxo'])
# S19 back at his window: Sadi, on the ledge again, leans out over the edge, both paws reaching for them
HW = (1.05, JIB_Z); HL = -1.05                 # the hook by the window: his feet just above the ledge's level, Compote below it
HC2 = -1.6                                     # for the catch: the block's top at the ledge's level, she hangs below it
s19 = [A('sadi', 'happy_idle', 0.32, 0.3, face='world', yaw=40, at=0.3, lean=20, arm='both', aim=[0.2, 0.35, 0.95]),
       on_block(HL, HW[0] + 0.5, mx=-0.5, at=0.5), dangling('compote', HL, HW[0] + 0.5, dz=0.0, mx=-0.5, at=0.6, speed=1.4, arm='both', aim='flail', flapEvery=0.5)]
v = lens_for(s19, -30, 5.4, 88, 92, hs=(0.2, 0.5, 0.8), fov=56, free=outside, spread=20, dr=(0.85, 1.3))   # from her side of the block
add(88, 92, s19, "'wake' (b88.11): back at his window: Sadi, on the ledge again, leans out over the edge with both paws reaching for them as the hook comes by",
    v, rainAt=ra(v), trolley=[HW[0] + 0.5, HW[0]], hookY=HL, stars=['sadi'])
# S20 'wake': she leans too far and topples off the ledge into the void, flailing
s20 = [A('sadi', 'happy_idle', 0.32, 0.32, face='world', yaw=30, at=0.3, lean=30, arm='both', aim='flail', flapEvery=0.5, my=-0.75, myAt=0.75, myDur=0.45, mz=0.55, moveAt=0.75, air=True, noShadow=True),
       on_block(HL, HW[0], at=1.6), dangling('compote', HL, HW[0], dz=0.0, at=0.6, speed=1.4, arm='both', aim='flail', flapEvery=0.5)]
v = lens_for([{k: val for k, val in a.items() if k not in ('my', 'mz')} for a in s20], -30, 5.8, 92, 96, hs=(0.2, 0.5, 0.8), fov=56, free=outside, spread=20, dr=(0.9, 1.3))
add(92, 96, s20, "'wake' (b92.49): Sadi leans too far and topples off the ledge into the void, paws flailing",
    v, rainAt=ra(v), trolley=HW[0], hookY=HL, stars=['sadi'])
# S21 'save': he catches her paw in his sleep (the clip's catch, reversed): she dangles from his near paw over the drop
HC3 = -2.15                                    # the catch: the block's top 0.55 m under the ledge's level
SADI_X, SADI_LIFT = HW[0] - 0.8, -0.83         # beside the block (0.66 wide), her paw held out sideways in his lowered one
s21 = [on_block(HC3, HW[0], at=0.4, clip='happy_idle', arm='R', aim=[0.75, -0.6, 0.15]),
       A('sadi', 'happy_run', SADI_X, JIB_Z - 0.15, at=0.3, speed=0.8, lift=SADI_LIFT, air=True, noShadow=True, arm='L', aim=[0.9, 0.42, 0.1], armB='R', aimB=[0.5, 0.4, 0.5])]   # Compote hangs below, out of the frame
v = view((-0.11, 0.35, 3.94), (0.65, 0.21, JIB_Z + 0.1), 54)   # frontal from the void: she hangs clear beside the block from his paw, her feet over the wall under the ledge
add(96, 104, s21, "'save' (b97.05, b97.76), 'nothing' (b100.34): Saxo catches her paw in his sleep: Sadi dangles from his paw over the drop while his other paw keeps dancing; Compote dangles from the hook below",
    v, rainAt=ra(v), trolley=HW[0], hookY=HC3, stars=['saxo', 'sadi'])

# ================= ACT 4, the title post-chorus (b104-136): the fall, and the morning =================
# S22 he sets Sadi down on the ledge and steps off the front of the hook block into the void
s22 = [A('sadi', 'being_surprised_and_looking_right', 0.2, 0.05, face='world', yaw=40, at=0.4),
       A('saxo', 'happy_walk', HW[0], JIB_Z + 0.1, face='world', yaw=10, at=0.1, lift=HL + BLOCK_TOP, my=-2.6, myAt=1.55, myDur=0.6, mz=0.35, air=True, noShadow=True, **SLEEPWALK, **asleep()),
       dangling('compote', HL, HW[0], dz=0.0, at=0.6, speed=1.4, arm='both', aim='flail', flapEvery=0.5)]
v = lens_for([{k: val for k, val in a.items() if k not in ('my', 'mz')} for a in s22], 75, 5.4, 104, 108, hs=(0.3, 0.6, 0.9), fov=56, free=outside, spread=20, dr=(0.85, 1.35))   # side on: his foot goes off the front of the block   # framed on his stand: the drop takes him out of the frame in the shot's last 0.4 s
add(104, 108, s22, "the title line begins (b106): he sets Sadi down on the ledge and steps off the front of the hook block into the void, arms out, still asleep; Compote dangles below",
    v, rainAt=ra(v), trolley=HW[0], hookY=HL, stars=['saxo'])
# S23 the fall (the clip's own): the lens falls with him down the tower's face, its lit windows streaming up past him
FALL = 14.0
def smooth(u): return u * u * (3 - 2 * u)
FALL = 10.0
def smooth(u): return u * u * (3 - 2 * u)
s23 = [A('saxo', 'happy_idle', 1.0, 1.15, at=0.3, my=-FALL, myAt=0.0, myDur=round(4 * PER, 3), air=True, noShadow=True, arm='both', aim='flail', flapEvery=0.5, **asleep())]
pts = [(1.0, round(2.55 + 1.15 - FALL * smooth(i / 8), 3), 3.55) for i in range(9)]
looks = [round(1.15 + 0.55 - FALL * smooth(i / 8), 3) for i in range(9)]
c, f = vpath(pts, (1.0, 1.7, 1.15), 56, looks=looks, ease='lin', hand=0.3, roll=[4, 8, 4, 0])   # the lens falls with him, above and in front, looking down: the lit facade and the street lamps below him
add(108, 112, s23, "the fall, the clip's own: he drops down the tower's face, nightshirt flapping, paws flailing, the lens falling with him, lit windows streaming up past",
    (c, f), rainAt=[1.2, 1.0, 2.4], trolley=HW[0], hookY=HL, stars=['saxo'])
# S24 dawn: from above, he's asleep in bed, tucked in to the chin, mask on; the alarm clock on the nightstand rings
s24 = [A('saxo', 'laying_idle', BED[0] + 0.2, BED[1] + 0.15, face='world', yaw=0, at=2.0, speed=0.4, lift=BED_Y, ground='mesh', **asleep())]
v = view((-1.45, 3.45, -3.05), (-1.5, 0.55, -4.05), 62, p1=(-1.42, 3.3, -3.1), ease='lin', roll=[0, 5])   # from above the ceiling (not drawn from above): his face on the pillow, the whole clock ringing on the nightstand
add(112, 116, s24, "'life' (b112.10), 'living' (b114.20), 'lie' (b115.15): dawn: from above, Saxo asleep in his bed, tucked in to the chin, sleep mask on; the red alarm clock rings on the nightstand beside him",
    v, zone='dawn', ring=0.0, curtains=1, glass=True, tucked=True, hide=['bags'], stars=['saxo'])
# S25 he's up, mask off, eyes open: a huge stretch by the bed, fresh
s25 = [A('saxo', 'male_cheering_with_two_fists_pump', 0.2, -3.9, face='world', yaw=12, at=0.4)]
v = lens_for(s25, 12, 2.5, 116, 120, hs=(0.85, 0.95), fov=56, free=in_room, spread=20, dr=(0.95, 1.12), look=(0.2, 0.95, -3.9))
add(116, 120, s25, "'nothing' (b117.59), 'inside' (b118.06): he's up, mask off, eyes wide open, both fists pumping in the morning light, fresh",
    v, zone='dawn', ring=0.0, curtains=1, glass=True, stars=['saxo'])
# S26 his morning charleston; Kob asleep in her armchair behind him at last
s26 = [A('saxo', 'charleston', 0.85, -3.05, at=0.25), kob_chair(**asleep())]
v = lens_for(s26, -72, 3.9, 120, 128, hs=(1.0, 1.2, 1.4), fov=66, free=in_room, spread=15, dr=(0.95, 1.2), look=(1.05, 0.9, -3.35))   # wide and aimed nearer him: his charleston travels right; the side wall stops the lens backing off   # from the side wall: his whole dance, Kob asleep behind him
add(120, 128, s26, "the title line again ('life' b127.69): wide awake, Saxo dances his morning charleston in the dawn light; behind him Kob, who watched all night, has finally fallen asleep in her armchair, milk in paw",
    v, zone='dawn', curtains=1, glass=True, hide=['bags'], stars=['saxo'])
# S27 he throws the curtains open on the morning: outside, Sadi and Compote asleep and soaked, Compote still hanging from the hook
s27 = [A('saxo', 'high_enthusiasm_fist_pump', 0.05, -1.0, at=0.4, lift=0.55),
       A('sadi', 'standing_praying_while_swaying', -0.55, 0.14, face='world', yaw=-15, at=0.4, speed=0.3, **asleep()),
       dangling('compote', 1.75, 1.15, dz=0.0, clip='happy_idle', at=0.3, speed=0.2, **asleep())]
v = lens_for(s27, 4, 5.4, 128, 136, hs=(1.2, 1.4, 1.6), fov=52, free=outside, spread=20, dr=(0.9, 1.3), look=(0.3, 1.55, -0.2))
add(128, 136, s27, "the end: he throws the curtains open on a bright morning, fists pumping, fresh: outside the window, Sadi asleep on her feet on the ledge and Compote asleep hanging from the crane's hook, both soaked and dripping",
    v, zone='dawn', curtains=[0.0, 0.7, 1, 0], trolley=1.15, hookY=1.75, drips=[[-0.55, 0.24, 1.3], [1.15, 1.22, 2.05]], puddles=[[-0.55, 0.2, 0.32]], stars=['saxo'])

shots.sort(key=lambda x: x['beat'])
ep = {
    'date': '2026-10-02', 'song': {'title': 'Bring Me To Life', 'artist': 'Evanescence'},
    'logline': "Saxo sleep-dances out of his window at a sleepover and across a construction site 40 floors up; his friends try every way to wake him and take every hit, while he wakes up fresh and they end up the wrecks.",
    'new': "the SLEEPWALKER structure (the lead walks through every danger asleep and untouched while the ones trying to save him take every hit; he wakes up fresh and they're the wrecks); src/maps24.js: tower (a gothic tower at night in the rain or at dawn: a stone ledge along its facade, the bedroom of the sleepover behind the window (red curtains that billow out, a bed, Kob's armchair, a nightstand with a ringing alarm clock), the neighbours' party in clown masks behind the next window, the steel skeleton of a tower going up next door with a deck, a scaffold plank over the gap, a tower crane whose trolley carries a girder or a hook block he can dance on, lightning, rain round the lens, a thrown bucket of water that splashes, drips, and a city of gothic towers with a street 45 m below); three looks (Saxo's white nightshirt and nightcap, Sadi's pink nightie, Compote's checked pyjamas); the held alarm clock prop, ringing",
    'notes': "The clip (studied from a 360p copy): a gothic city at night in the rain; the singer asleep in a white nightgown sleepwalks out of her tower window onto the ledge past lit windows (a party in clown masks, the band in a padded room), hangs over the drop, is caught by the wrists, falls, and wakes in bed. Ours keeps the tower, the rain, the white nightgown (Saxo's nightshirt), the red curtains, the clown party in the next window, the catch by the wrist (reversed: the sleepwalker catches his rescuer) and the fall that wakes him at dawn; the construction site is the cartoon sleepwalker's (girders that arrive under his foot just in time). The whole cast: Saxo the sleepwalker and lead, dancing through everything asleep and untouched; Sadi the romance (her true-love kiss lands on a steel column, she gets soaked, she slips, and he saves her in his sleep); Compote the violent rescuer (the alarm clock, the bucket, the uppercut that sends her off the edge onto the crane's hook, where she spends the night); Kob never goes out (she watches the whole night from her armchair with her milk and falls asleep in it by morning).",
    'with': ['sadi', 'kob', 'compote'],
    'clips': ['happy_idle', 'happy_walk', 'happy_run', 'male_cheering_with_two_fists_pump', 'male_driving_a_car', 'laying_idle', 'big_yawn_while_standing', 'kissing_a_taller_person_for_a_short_period',
              'standing_left_uppercut_punch', 'crawling_forward_on_hands_and_knees', 'being_surprised_and_looking_right', 'losing_balance_and_falling_off_an_edge',
              'short_yell_while_standing', 'short_yell_while_standing_2', 'quickly_pointing_angrily_forward', 'long_yell_while_standing_leaning_back', 'high_enthusiasm_fist_pump', 'standing_praying_while_swaying'],
    'yt': 'end',
    'tags': {'structure': 'sleepwalker', 'scenes': ['girder', 'crane hook', 'bucket', 'fall'], 'cast': ['saxo', 'sadi', 'kob', 'compote'], 'hook': 'dance', 'maps': ['tower'], 'ref': 'none',
             'lyric_literal': "'wake' (every one: the alarm clock at his ear, the yells, the kiss, the bucket, the punch; he never does, until the morning), 'save' (the rescuers reach for him; he saves Sadi in his sleep), 'nothing' (he steps off the ledge onto nothing and a girder arrives), 'breathe' (the kiss of life lands on a column), 'lie' (asleep in bed), 'life' (he steps off into the void; he comes to life at dawn)",
             'experiment': "Does a cartoon sleepwalker gag (the lead dances asleep through every danger untouched while his rescuers take every hit), on a 2003 throwback that trends every spooky season, opened on the dance, get more shares per 1,000 views than our story plots?"},
    'shots': shots,
}
json.dump(ep, open(os.path.join(HERE, '2026-10-02-2.json'), 'w'), indent=1, ensure_ascii=False)
print(len(shots), 'shots;', len(WARN), 'warnings')
for w in WARN: print('  ', w)
