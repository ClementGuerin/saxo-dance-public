# The "The Fate of Ophelia" episode (2026-10-15; Taylor Swift, 2025): writes episodes/2026-10-15.json.
# Kit 2026-10-15: 75.4849 s, song beats 20-176 (verse 1, the pre-chorus and the chorus), 123.9983 BPM, kit beat 0 at 0 s.
# The words, from whitelisted keywords per line (never the lines): verse 1 'calling' and 'megaphone' (k4.4, 8.4), 'alone'
# (16.2), 'light' (31.1), 'watch' (34.2), 'drowned' (48.3), two lines with no action word (54.1, 64.0); the pre-chorus
# 'alone' and 'tower' (79.5, 81.8); the hook 'night' and 'grave' (97.7, 101.8), 'saved', 'heart', 'fate' (103.1, 104.2,
# 105.8), the title name twice (107.4, 107.9); the chorus 'hundred' (115.1), 'sea' (120.2, 123.3), 'hands' (126.4),
# 'night' (142.0), 'fate' and the name (150.2, 151.7).
# The world (the official video, contact sheets): a gilded theatre at night, the famous painting of Ophelia floating among
# flowers coming alive in its gold frame, stagehands carrying painted flats, showgirls, a painted ship on cut-out waves, a
# swimming number of life rings in teal, a bathtub. Ours (src/maps49.js ophelia): the shoot of "Ophelia" on a theatre's
# stage, the painting's stream running down into a real pool where Ophelia floats among the flowers, a 1920s film camera,
# the director's chair, a lifeguard tower, and the swimming number (teal light, a painted sea, a chorus line of rings).
# The story (structure RESCUER, new: the pet universal of the dog who thinks you're drowning every time you swim; each
# rescue ruins a take, the clapperboard's take count climbs, they send him further away each time; the payoff: the one
# who mocked him really falls in, and he's the only one who goes in after her):
#   0 (verse 1, k0-76): the shoot of Ophelia: the director calls action through her megaphone, TAKE 1, Ophelia floats
#     alone among the flowers, the spot comes on; the dog on lifeguard duty at the edge watches her not moving, panics,
#     and on 'drowned' he dives in and tows her out in a life ring, soaked and furious. CUT. TAKE 2.
#   1 (the pre-chorus, k76-96): they send him up the lifeguard tower, alone; take 2 rolls; up there he can't stand it.
#   2 (the hook, k96-112): Ophelia lies in state on the water, a flower on her chest (the 'grave' pose); on 'saved' he
#     swan-dives off the tower, and on the title the splash drenches the whole set.
#   3 (the chorus, k112-149): the director gives up and turns the shoot into the clip's swimming number: the painted sea,
#     a chorus line of life rings ('hundred'), his face framed by a ring, the waves ('sea'), paws up ('hands'), a
#     kaleidoscope of rings from above; the director conducts it from the pool's edge, delighted; TAKE 47.
#   4 (the payoff, k149-156): 'fate': the director slips on the wet stage and falls backwards into the pool; 'Ophelia':
#     the cat who hates water floats like the painting, and the dog's life ring lands round her: the one real rescue, the
#     same frame as Ophelia's tableau (the match cut).
import json, math, os, re, sys
sys.path.insert(0, os.path.dirname(__file__))
from cam import view, vpath

HERE = os.path.dirname(__file__)
PER, B0T = 60 / 123.9983, 0.0
def T(b): return B0T + b * PER                  # kit seconds of kit beat b
def S(b, b0): return round((b - b0) * PER, 3)   # seconds from shot beat b0 to beat b

# the map (src/maps49.js OPHELIA)
WY = -0.18                                     # the water
FLOAT = WY - 0.08                              # a floating body's lift
SWIM = WY - 0.62                               # a swimmer's lift (the head out of the water)
POOL = dict(x0=-2.8, x1=2.8, z0=-4.9, z1=0.6)
OPH = (0.0, -2.7)
CHAIR, SEAT_Y = (-3.45, -1.1), 0.5
CAMERA = (-4.6, 1.2)
TOWER, TOWER_Y = (4.05, -2.3), 2.4
LOOK = {'saxo': 'swimcap', 'sadi': 'ophelia', 'kob': 'director', 'compote': 'drummer'}
HEAD = {'saxo': 1.5, 'sadi': 1.45, 'kob': 1.5, 'compote': 1.5}
FACE = {'saxo': 0.9, 'sadi': 0.84, 'kob': 0.86, 'compote': 0.86}
RAD = {'saxo': 0.48, 'sadi': 0.45, 'kob': 0.42, 'compote': 0.42}
CHARL = 2.467
def kick_at(rv): return round((1.6 - rv) % CHARL, 3)   # charleston's kick (clip 1.6 s) on the review frame, rv s into the shot

# the karaoke's word times (kit beats; numbers only, never a word)
_src = open(os.path.join(HERE, '2026-10-15.lyrics.js')).read()
_rows = json.loads(re.search(r'window\.LYRICS = (.*?);\n', _src).group(1)); _ends = json.loads(re.search(r'window\.LINE_END = (.*?);\n', _src).group(1))
def Bt(t): return (t - B0T) / PER
def W(line, word): return round(Bt(_rows[line][word][0]), 2)
LINES = [(Bt(row[0][0] - 0.35), Bt(e)) for row, e in zip(_rows, _ends)]
def has_line(b0, b1): return any(a < b1 and b > b0 for a, b in LINES)

def A(who, clip, x, z, **o):
    return {'who': who, 'look': o.pop('look', LOOK[who]), 'clip': clip, 'x': round(x, 3), 'z': round(z, 3), 'face': o.pop('face', 'world'),
            'yaw': round(o.pop('yaw', 0), 1), 'at': o.pop('at', 0.4), 'speed': o.pop('speed', 1), **o}
def yaw_to(frm, to): return round(math.degrees(math.atan2(to[0] - frm[0], to[1] - frm[1])), 1)
def idle(who, x, z, yaw, **o): return A(who, 'happy_idle', x, z, yaw=yaw, at=2.125, speed=0, **o)
def dancer(who, x, z, yaw, rv, clip='charleston', **o):
    if clip == 'charleston': o.setdefault('at', kick_at(rv)); o.setdefault('speed', 1)
    return A(who, clip, x, z, yaw=yaw, **o)
def seated(who, x, z, yaw, lift, **o): return A(who, 'sitting_talking', x, z, yaw=yaw, at=0.05, speed=0, lift=lift, **o)
def ophelia(x=OPH[0], z=OPH[1], **o):          # Sadi floating on her back among the flowers, her head towards the painting
    return A('sadi', 'laying_idle', x, z, yaw=o.pop('yaw', 0), at=1.0, speed=0, lift=FLOAT, noShadow=True, arm=o.pop('arm', 'both'), aim=o.pop('aim', [0.3, 0.6, 0.6]), upAt=-1, **o)
def director(**o):                             # Kob in her canvas chair, facing the pool, the megaphone at her muzzle
    return seated('kob', *CHAIR, o.pop('yaw', 90), SEAT_Y, **o)
def clapper(take, x, z, yaw, clap, **o):       # Compote holds the slate up beside her face and snaps it on `clap` s
    return idle('compote', x, z, yaw, arm='L', aim=[0.45, 0.62, 0.64], holdL='clap' + str(take), clapAt=clap, upAt=-1, **o)
def panic(x, z, toward, **o):                  # the dog's panic: hops on the half beat, paws flapping by his ears, swaying, turned to `toward` (the lens)
    return A('saxo', 'happy_idle', x, z, yaw=yaw_to((x, z), toward), at=2.125, speed=0, arm='both', aim='caramell', flapEvery=0.5, upAt=-1, hop=o.pop('hop', [0.1, 0.5]), sway=7, swayEvery=0.5, air=True, **o)

# ---- a projection check (numbers only): where each face lands in the 9:16 frame at the shot's start and end ----
def head_rf(cam, look, fov, pt, rad):
    f = [look[i] - cam[i] for i in range(3)]; n = math.sqrt(sum(v * v for v in f)); dep = sum((pt[i] - cam[i]) * f[i] / n for i in range(3))
    return rad / max(dep, 0.1) / (math.tan(math.radians(fov) / 2) * 9 / 16) / 2
def _proj(cam, look, fov, pt):
    f = [look[i] - cam[i] for i in range(3)]; n = math.sqrt(sum(v * v for v in f)); f = [v / n for v in f]
    r = [-f[2], 0.0, f[0]]; rn = math.sqrt(r[0] ** 2 + r[2] ** 2) or 1; r = [r[0] / rn, 0.0, r[2] / rn]
    u = [r[1] * f[2] - r[2] * f[1], r[2] * f[0] - r[0] * f[2], r[0] * f[1] - r[1] * f[0]]
    d = [pt[i] - cam[i] for i in range(3)]; z = sum(a * b for a, b in zip(d, f))
    if z <= 0.05: return None
    tv = math.tan(math.radians(fov) / 2); th = tv * 9 / 16
    return (0.5 + sum(a * b for a, b in zip(d, r)) / z / th / 2, 0.5 - sum(a * b for a, b in zip(d, u)) / z / tv / 2)
def body(a, end):
    who = a['who']; x, z = a['x'] + a.get('mx', 0) * end, a['z'] + a.get('mz', 0) * end
    lift = a.get('lift', 0) + (a.get('my', 0) if end else 0)
    fy, hy = FACE[who], HEAD[who]
    if a.get('clip') == 'sitting_talking': fy, hy = 0.78, 1.36
    if a.get('clip') == 'situps': fy, hy = 0.5, 1.02
    if a.get('clip') == 'laying_idle':                        # lying: the head 0.55 m from the mark, opposite the facing, near the floor
        yw = math.radians(a.get('yaw', 0)); x, z = x - math.sin(yw) * 0.55, z - math.cos(yw) * 0.55; fy, hy = 0.28, 0.55
    elif a.get('lean', 0) > 8: d = 0.9 * math.sin(math.radians(a['lean'])); yw = math.radians(a.get('yaw', 0)); x, z = x + math.sin(yw) * d, z + math.cos(yw) * d
    return (who, x, z, fy + lift, hy + lift)
def occluded(cam, look, fov, actors, end, W_, beat):   # a face inside a nearer head's disc
    pts = []
    for a in actors:
        if a.get('fg'): continue
        who, x, z, fy, hy = body(a, end); p = _proj(cam, look, fov, (x, fy, z))
        if not p: continue
        dep = math.dist((cam[0], cam[2]), (x, z)); pts.append((dep, who, p, head_rf(cam, look, fov, (x, fy, z), RAD[who])))
    pts.sort()
    for i, (d0, w0, p0, r0) in enumerate(pts):
        for d1, w1, p1, r1 in pts[i + 1:]:
            if math.hypot(p0[0] - p1[0], (p0[1] - p1[1]) * 16 / 9) < r0 + 0.45 * r1: W_.append(f'b{beat}: {w1} behind {w0}' + (' at the end' if end else ''))
def check(beat, b1, cam, look, fov, actors, end, W_):
    line = has_line(beat, b1)
    occluded(cam, look, fov, actors, end, W_, beat)
    for a in actors:
        if a.get('fg') or (a.get('reveal') and not end): continue
        who, x, z, fy, hy = body(a, end)
        top, face = _proj(cam, look, fov, (x, hy, z)), _proj(cam, look, fov, (x, fy, z))
        tag = ' at the end' if end else ''
        if not top or not face: W_.append(f'b{beat}: {who} behind the lens{tag}'); continue
        if line and top[1] < 0.27: W_.append(f'b{beat}: {who} head top at {top[1]:.2f} (lyric rows){tag}')
        if face[0] < 0.12 or face[0] > 0.88: W_.append(f'b{beat}: {who} face x {face[0]:.2f} (edge){tag}')
        if face[1] > 0.86 or face[1] < 0.0: W_.append(f'b{beat}: {who} face y {face[1]:.2f}{tag}')
def lens(v, k=0):
    c, f = v; a = math.radians(c['ang'][k]); fy = f[2] if len(f) > 2 else 0
    return (f[0] + math.sin(a) * c['r'][k], c['h'][k] + fy, f[1] + math.cos(a) * c['r'][k])
def inside(c, zone):
    x, y, z = c
    if zone == 'water': return POOL['x0'] + 0.1 < x < POOL['x1'] - 0.1 and POOL['z0'] + 0.1 < z < POOL['z1'] - 0.1 and y > WY + 0.15
    if not (-8.0 < x < 8.0 and -7.4 < z < 13.5 and 0.1 < y < 8.4): return False
    if POOL['x0'] - 0.05 < x < POOL['x1'] + 0.05 and POOL['z0'] < z < POOL['z1'] + 0.05 and y < 0.35: return False   # not down at the water
    if abs(x - TOWER[0]) < 0.7 and abs(z - TOWER[1]) < 0.75 and y < TOWER_Y + 0.9: return False                      # not in the tower's legs
    return True
def V(p0, l, fov=50, p1=None, **o): return ('V', p0, l, fov, p1, o)
def place(spec, dl=0.0, dk=1.0, da=0.0, dh=0.0):
    _, p0, l, fov, p1, o = spec
    L = (l[0], l[1] + dl, l[2])
    def tr(q):
        dx, dz = q[0] - l[0], q[2] - l[2]; a = math.radians(da); c, s_ = math.cos(a), math.sin(a)
        return (round(l[0] + (dx * c + dz * s_) * dk, 3), round(q[1] + dl + dh, 3), round(l[2] + (-dx * s_ + dz * c) * dk, 3))
    return view(tr(p0), L, fov, p1=tr(p1) if p1 else None, **o)
def problems(beat, b1, actors, v, zone):
    W_ = []; c, focus = v
    for k, end in ((0, 0), (-1, 1)):
        cam, look = lens(v, k), (focus[0], c['look'][k] + (focus[2] if len(focus) > 2 else 0), focus[1])
        check(beat, b1, cam, look, c['fov'], actors, end, W_)
        if not inside(cam, zone): W_.append(f'b{beat}: lens outside the {zone}')
    return W_
SOLVED = {}
def fit(spec, beat, b1, actors, zone):
    best = None
    for dl in (0, 0.1, 0.2, 0.3, 0.45):
        for dk in (1.0, 1.12, 1.25, 0.9, 1.4):
            for da in (0, -8, 8, -16, 16, -24, 24):
                for dh in (0, 0.15, -0.15, 0.3):
                    v = place(spec, dl, dk, da, dh)
                    n = len(problems(beat, b1, actors, v, zone))
                    score = n * 1000 + dl * 30 + abs(dk - 1) * 40 + abs(da) + abs(dh) * 20
                    if best is None or score < best[0]: best = (score, v, (dl, dk, da, dh))
                    if n == 0 and score < 1: return v
    SOLVED[beat] = best[2]
    return best[1]
shots = []; REV = []; WARN = []
def add(beat, b1, actors, lyric, v, rv=None, **o):
    if o.pop('drop', False): return
    o = {k: val for k, val in o.items() if val is not None}
    zone = o.pop('zone_lens', 'stage')
    if v[0] == 'V': v = fit(v, beat, b1, actors, zone)
    c, focus = v
    for k, end in ((0, 0), (-1, 1)):
        cam, look = lens(v, k), (focus[0], c['look'][k] + (focus[2] if len(focus) > 2 else 0), focus[1])
        check(beat, b1, cam, look, c['fov'], actors, end, WARN)
        if not inside(cam, zone): WARN.append(f'b{beat}: lens outside the {zone} {tuple(round(q, 2) for q in cam)}')
    t0 = 0 if not shots else T(beat)
    REV.append(round(t0 + (rv if rv is not None else 0.6 * (T(b1) - t0)), 2))
    shots.append({'beat': beat, 'kind': 'dance', 'map': 'ophelia', 'actors': actors, 'lyric': lyric, 'cam': c, 'focus': focus, **o})

# ---------------- marks ----------------
EDGE = (0.0, 1.12)                         # the dog's lifeguard spot on the stage at the pool's front edge
DIRECTOR_STAND = (-3.1, -1.65)             # the director up at the pool's left edge, conducting
TOWER_TOP = (TOWER[0] - 0.15, TOWER[1])    # his mark on the tower's platform
LIFT_TOWER = TOWER_Y
RING_IN = (0.15, -1.9)                     # where he lands by her
CL = (-2.7, 1.55)                          # the clapper loader's mark in front of the film camera

# =====================================================================================================================
# Fix loop 1 (2026-10-14 22:45): the reviewer (21/34) and the critic (17/25): the first rescue at ~11 s (a thrown ring), the
# leap side on and close, the tow by a rope in his jaws (breaststroke), the splash's crown raining on the soaked clapper
# loader with his legs kicking out of the water, the swimming number's gag (the chorus floats in a star and he rescues
# them all into a dripping pile), a slip that reads, and the dog's proud face as the last frame.
# ---- verse 1: take 1 and take 2 ----
DOG_R = (3.15, -3.0)                        # the hook: on duty at the pool's right edge, beyond her head
HOOK_L = (-0.4, 2.2, -2.4)                  # loop 3 (the critic: "she reads as a white umbrella"): high over her feet, so her face shows
s = [ophelia(x=1.4, z=-3.0, yaw=-90, aim=[-0.15, 0.35, 0.6], hold='bloom', holdScale=1.4), A('saxo', 'charleston', *DOG_R, yaw=yaw_to(DOG_R, (HOOK_L[0], HOOK_L[2])), at=kick_at(S(2.2, 0)), arm='R', aim=[0.8, 0.4, 0.35], hold='lifebuoy', upAt=-1)]
v = V(HOOK_L, (2.73, 0.59, -3.0), fov=68, p1=(-0.25, 2.12, -2.48), ease='lin')
add(0, 4, s, "the hook: Ophelia floating calm in the foreground, a flower on her chest, her face up, the lifeguard dog dancing on the edge above her with his life ring up, ready to throw", v, zone_lens='water', rv=S(2.2, 0))
# S01 (k4..8; 'calling'): the director in her canvas chair calls action through her megaphone
s = [director(megaphone={'yaw': 26, 'pitch': -35, 'calls': [S(4.4, 4), S(5.4, 4)]}, arm='R', aim=[0.35, 0.3, 0.75], upAt=-1)]
v = V((-1.75, 1.32, -0.05), (-3.45, 1.22, -1.1), fov=46, p1=(-1.85, 1.31, -0.12), ease='lin')
add(4, 8, s, "'calling': the director in her chair calls action through her megaphone", v, rv=S(5.6, 4))
# S02 (k8..12; 'megaphone'): TAKE 1
s = [clapper(1, *CL, 20, S(8.6, 8))]
v = V((-1.95, 1.2, 4.35), (-2.55, 1.12, 1.55), fov=46)
add(8, 12, s, "'megaphone': TAKE 1: Compote snaps the clapperboard at the lens", v, rv=S(9.0, 8))
# S03 (k12..18; 'alone'): Ophelia floats alone among the flowers: the tableau, from above
FLOWER_V = view((0.0, 3.0, -1.55), (0.0, -0.2, -2.95), 50, p1=(0.0, 2.85, -1.65), ease='lin')
add(12, 18, [ophelia()], "'alone': Ophelia floats alone among the flowers: the tableau, from above", FLOWER_V, rv=S(16.4, 12))
# S04 (k18..22): over her flower crown: the dog on duty at the edge, the life ring in his paw, watching her
OVER = V((0.42, 0.72, -4.25), (0.0, 0.88, 1.12), fov=40, p1=(0.4, 0.71, -4.0), ease='lin')
s = [ophelia(fg=True), idle('saxo', *EDGE, 180, hold='lifebuoy', arm='R', aim=[0.35, -0.35, 0.35], upAt=-1)]
add(18, 22, s, "over her flower crown: the dog on duty at the edge, the life ring in his paw, watching her", OVER, zone_lens='water', rv=S(20.0, 18))
# S05 (k22..26): rescue 1: he throws the ring, and it flies at the lens, at her
TOSS = round(S(23.6, 22), 3)
s = [ophelia(fg=True), A('saxo', 'goalie_overhand_throw', *EDGE, yaw=180, at=0.9, speed=1, hold='lifebuoy', toss={'at': TOSS, 'to': [0.0, -0.05, -2.85], 'dur': 0.7, 'arc': 1.1, 'scale': 1.25})]
v = view((0.35, 0.62, -4.1), (0.0, 0.85, 1.12), 44, p1=(0.33, 0.6, -3.9), ease='lin')
add(22, 26, s, "rescue 1: he throws the life ring, and it flies at the lens, at her", v, zone_lens='water', buoys=[[0.0, -2.85, TOSS + 0.7]], rv=S(23.9, 22))
# S06 (k26..30): PLONK: from above, the ring round her, her arms flung out, glaring
add(26, 30, [ophelia(aim=[0.6, 0.55, 0.3])], "PLONK: from above, the life ring round her waist, her arms flung out", FLOWER_V, buoys=[[0.0, -2.85]], splash=[[0.0, -2.85, 0.0, 0.8]], rv=S(27.0, 26))
# S07 (k30..34; 'light'): take 2: the follow spot snaps on, the ring gone
v = V((1.6, 2.6, 0.6), (0.0, -0.2, -2.65), fov=54, p1=(1.5, 2.45, 0.4), ease='lin')
add(30, 34, [ophelia()], "'light': take 2: the follow spot snaps on: Ophelia in a pool of light, the ring gone", v, spot=[0.0, -2.75, S(31.1, 30)], rv=S(32.0, 30))
# S08 (k34..37; 'watch'): the dog's eyes: frontal, over the water, worried
s = [idle('saxo', *EDGE, 180)]
v = V((0.0, 1.05, -1.0), (0.0, 0.98, 1.12), fov=44, p1=(0.0, 1.04, -0.8), ease='lin')
add(34, 37, s, "'watch': the dog watches her, worried: she hasn't moved", v, zone_lens='water', rv=S(35.4, 34))
# S09 (k37..46): the panic at the edge: hopping, paws flapping by his ears, she floats on behind him
PL0 = (0.55, 1.1); PLENS = (2.4, 1.3, 4.3)
s = [panic(*PL0, (PLENS[0], PLENS[2]), flap=0.55), ophelia()]
v = view(PLENS, (0.0, 0.55, -1.0), 56, roll=[-6, -3], hand=0.3)   # loop 3: him on the left third (at the edge a paw left the frame)
add(37, 46, s, "the panic at the edge: hopping and flapping, paws by his ears, while she floats on behind him", v, rv=S(40.25, 37))
# S10 (k46..49; 'drowned'): rescue 2: the leap: side on and close, flat in the air over the water, the ring held out
s = [A('saxo', 'happy_idle', 0.0, 0.95, yaw=180, at=2.125, speed=0, lift=0.95, lean=95, arm='both', aim=[0.05, 0.1, 1.0], upAt=-1,
       mz=-1.2, my=-1.45, myAt=0.4, myDur=0.95, air=True, noLie=True, noShadow=True)]   # loop 3: 0.95 m up at the still (no air under him at 0.5), the ring ahead in the far paw
v = view((-4.0, 0.65, -0.55), (0.0, 1.05, -0.65), 56, p1=(-3.9, 0.5, -0.7), ly1=0.7, ease='lin')   # loop 3: the swan dive's lens turned round: from his side and below, his face down-forward, no ring (held, it stood up off his back like a fin; side on at his height he read as a lump with a horn)
add(46, 49, s, "'drowned': rescue 2: the leap, side on: flat in the air over the water, the life ring held out", v, hide=['crew', 'chair', 'camera'], rv=S(46.75, 46))
# S11 (k49..52): the splash beside her: he surfaces, the ring round her, she flails
SW = (1.15, -2.45)
S11L = (-0.4, 1.7, -0.5)                    # loop 3: higher over her feet (from 1 m her face hid under her chin); him treading water at the lens, head up
s = [ophelia(aim=[0.6, 0.55, 0.3], buoy={'at': 0.15, 'dy': 0.0, 'r': 0.46}), A('saxo', 'running_man', *SW, yaw=yaw_to(SW, (S11L[0], S11L[2])), at=0.4, speed=0.55, lift=WY - 0.62, arm='both', aim='paddle', upAt=-1, dip=[0.04, 3.0], noShadow=True, noLie=True, air=True)]
v = V(S11L, (0.3, 0.15, -2.65), fov=54)
add(49, 52, s, "the splash beside her: he surfaces, the life ring round her, her arms flung out", v, zone_lens='water', splash=[[1.15, -2.45, 0.0, 1.0]], rv=S(50.0, 49))
# S12 (k52..60): the tow: breaststroke, the ring's rope in his jaws, towing her to the edge, side on
s = [ophelia(z=-2.45, mz=1.15, buoy={'dy': 0.0, 'r': 0.46}), A('saxo', 'swimming_breastroke_to_edge_of_pool', 0.0, -1.1, yaw=0, at=0.4, speed=1, lift=WY - 0.2, noShadow=True, noLie=True, mz=1.15, hold='rope', ropeMouth=True, hookTo='sadi:hips')]
v = V((4.3, 1.45, -1.25), (0.0, 0.25, -1.3), fov=58)
add(52, 60, s, "the tow: breaststroke, the ring's rope in his jaws, he tows her to the edge", v, hide=['crew'], rv=S(55.0, 52))
# S13 (k60..64): hauled out: she sits on the edge soaked, the dog proud beside her, tongue out
SE, DE = (-0.45, 1.05), (0.55, 1.15)
s = [A('sadi', 'situps', *SE, yaw=10, at=1.0, speed=0, noLie=True), A('saxo', 'high_enthusiasm_fist_pump', *DE, yaw=-20, at=0.763, speed=1, tongue=True)]
v = V((0.15, 1.15, 4.6), (0.05, 0.8, 1.1), fov=50)
add(60, 64, s, "hauled out: Ophelia sits on the edge soaked, the dog proud beside her, a fist pump, tongue out", v, drips=[[SE[0] - 0.22, SE[1], 1.15, True], [SE[0] + 0.2, SE[1] + 0.1, 1.05, True]], rv=S(62.0, 60))
# S14 (k64..68): CUT!: the megaphone's bell straight at the lens, her eyes over it, the rings of sound coming at us
s = [director(megaphone={'yaw': 0, 'pitch': 8, 'calls': [S(64.3, 64), S(65.3, 64), S(66.3, 64)]}, arm='R', aim=[0.3, 0.1, 0.8], upAt=-1)]
v = view((-1.05, 1.74, -1.1), (-3.45, 1.5, -1.1), 46)
add(64, 68, s, "CUT: the megaphone's bell straight at the lens, the director's eyes over it", v, hide=['crew'], rv=S(65.5, 64))
# S15 (k68..72): TAKE 3
s = [clapper(3, *CL, 20, S(68.5, 68))]
v = V((-1.2, 0.8, 3.7), (-2.55, 1.15, 1.55), fov=50)            # low, from her slate's side
add(68, 72, s, "TAKE 3: the clapperboard again, from below", v, rv=S(68.9, 68))
# S16 (k72..76): Compote marches him off to the lifeguard tower on a lead, along the stage
WK0, WK1 = (1.35, 1.45), (2.85, 1.1)
s = [A('saxo', 'happy_walk', *WK0, yaw=yaw_to(WK0, WK1), at=0.3, speed=0.9, mx=round(WK1[0] - WK0[0], 2), mz=round(WK1[1] - WK0[1], 2)),
     A('compote', 'happy_walk', WK0[0] + 0.8, WK0[1] - 0.05, yaw=yaw_to(WK0, WK1), at=0.8, speed=0.9, mx=round(WK1[0] - WK0[0], 2), mz=round(WK1[1] - WK0[1], 2), hold='leash', hookTo='saxo')]
v = V((2.3, 1.55, 4.25), (2.3, 0.85, 1.0), fov=60)
add(72, 76, s, "Compote marches him off to the lifeguard tower on a lead", v, hide=['crew'], rv=S(74.5, 72))

# ---- the pre-chorus: the tower ----
s = [seated('saxo', *TOWER_TOP, -90, LIFT_TOWER)]
v = V((0.9, 2.35, 3.2), (3.7, 2.75, -2.3), fov=50)
add(76, 82, s, "'alone ... tower': alone up on the lifeguard tower, he watches the pool below", v, rv=S(80.0, 76))
s = [ophelia(), seated('saxo', *TOWER_TOP, -90, LIFT_TOWER, fg=True)]
v = view((5.0, 4.2, -0.6), (0.2, -0.15, -2.95), 50)
add(82, 88, s, "take 3 rolls: from the tower, past his ear, Ophelia floating far below in the spot", v, spot=[0.0, -2.75], rv=S(85.0, 82))
s = [panic(*TOWER_TOP, (1.7, 1.05), lift=LIFT_TOWER, hop=[0.06, 0.5], flap=0.55)]
v = V((1.7, 2.9, 1.05), (3.9, 3.05, -2.3), fov=50)
add(88, 96, s, "he can't stand it: up on the tower's platform, hopping and flapping, eyes on her", v, rv=S(90.4, 88))

# ---- the hook: the high dive ----
STATE_V = view((0.0, 2.3, -1.85), (0.0, -0.2, -3.4), 46, p1=(0.0, 2.2, -1.95), ease='lin')   # loop 3: closer than the tableau (the reviewer: "the same as S03")
add(96, 100, [ophelia(aim=[-0.1, 0.8, 0.15], hold='daisy', holdScale=1.2)], "'night': Ophelia lies in state on the water, a daisy held up under her chin", STATE_V, spot=[0.0, -2.75], rv=S(97.8, 96))
s = [idle('saxo', TOWER_TOP[0] - 0.1, TOWER_TOP[1], -90, lift=LIFT_TOWER, lean=30, arm='both', aim=[0.25, -0.1, 0.9], upAt=-1)]
v = view((2.15, 1.0, 0.45), (3.75, 3.45, -2.3), 58, roll=[8, 10])   # loop 3: lean 30 (18 read as upright)
add(100, 103, s, "'grave': from below, he leans out over the tower's edge, eyes wide", v, rv=S(101.8, 100))
DIVE0 = (TOWER_TOP[0] - 0.2, TOWER_TOP[1])
s = [A('saxo', 'happy_idle', *DIVE0, yaw=-90, at=2.125, speed=0, lift=LIFT_TOWER, lean=100, arm='both', aim=[0.05, 0.12, 1.0], upAt=-1,
       mx=-2.45, moveAt=0.08, my=-2.65, myAt=0.25, myDur=0.95, air=True, noLie=True, noShadow=True)]
v = view((2.15, 2.0, 3.6), (2.1, 2.6, -2.3), 60, p1=(1.75, 0.95, 3.3), ly1=0.45, ease='lin')
add(103, 105.5, s, "'saved ... heart': rescue 3: the swan dive off the tower, flat over the pool, the painting behind", v, rv=S(104.2, 103))
# S23 (k105.5..109; the title): the splash, behind Compote's shoulder and her slate: his legs kicking up out of the water
# beside Ophelia, the crown of drops raining onto the slate
CF = (-2.35, 2.0)
s = [A('compote', 'happy_idle', *CF, yaw=yaw_to(CF, (0.9, -2.35)), at=2.125, speed=0, arm='L', aim=[0.45, 0.62, 0.64], holdL='clap3', clapAt=-1, upAt=-1, fg=True),
     ophelia(aim=[0.6, 0.55, 0.3]), A('saxo', 'running_man', 1.0, -2.25, yaw=90, at=0.4, speed=1.3, lift=WY - 0.75, lean=178, air=True, noLie=True, noShadow=True)]
v = view((-2.75, 1.6, 4.45), (0.55, 0.35, -2.1), 52)
add(105.5, 109, s, "'fate of Ophelia': the splash, behind the clapper loader's slate: his legs kicking up out of the water beside Ophelia, the drops raining on the set", v, bigSplash=[1.0, -2.25, 0.0], rainAt=[CF[0], CF[1], 0.55, 0.75], rv=S(106.4, 105.5))
s = [clapper(4, *CL, 20, S(110.0, 109))]
v = V((-2.15, 1.2, 3.55), (-2.55, 1.12, 1.55), fov=46)          # closer: the wet face
add(109, 112, s, "Compote dripping, glaring: TAKE 4", v, drips=[[CL[0], CL[1], 1.35]], wet=True, rv=S(110.3, 109))

# ---- the chorus: the swimming number, and its rescue ----
s = [dancer('saxo', 0.0, 1.85, 0, S(115.1, 112)), dancer('sadi', -1.15, 1.95, 12, S(115.1, 112) + 0.4)]
v = V((0.0, 1.55, 7.0), (0.0, 1.0, 0.2), fov=56, p1=(0.0, 1.45, 6.4), ease='lin')
add(112, 116, s, "'hundred': the swimming number: the painted sea, a chorus line raising rings, the dog dancing front and centre", v, zone='number', chorus='line', crew='cheer', rv=S(115.1, 112))
s = [idle('saxo', 0.0, 1.85, 0, buoyFace=True, arm='both', aim=[0.6, 0.45, 0.55], upAt=-1, hop=[0.03, 1])]
v = V((0.0, 1.02, 5.25), (0.0, 1.05, 1.85), fov=46)
add(116, 120, s, "his face framed by a life ring: the clip's portrait", v, zone='number', chorus='frame', rv=S(118.0, 116))
s = [dancer('saxo', 0.45, 1.75, -8, S(121.0, 120)), dancer('sadi', -0.55, 1.85, 8, S(121.0, 120) + 0.3)]
v = V((0.0, 0.85, 4.9), (0.0, 0.85, 1.6), fov=54, roll=(-5, -3), hand=0.25)
add(120, 124, s, "'sea': the painted waves rise and roll in front of them as they dance", v, zone='number', chorus='line', waves=[0.0, 0.9, 0, 1], wavesZ=2.35, rv=S(122.0, 120))
s = [idle('saxo', 1.15, 1.85, -8, arm='both', aim='rave', flapEvery=1000, flapPh=90, upAt=-1, hop=[0.05, 1]), idle('sadi', -1.15, 1.95, 8, arm='both', aim='rave', flapEvery=1000, flapPh=90, upAt=-1, hop=[0.05, 1])]
v = V((0.0, 1.5, 5.9), (0.0, 1.1, 1.2), fov=56)
add(124, 128, s, "'hands': paws up: the chorus line's rings held high between the two leads", v, zone='number', chorus='up', waves=1, clear=[[1.4, 1.2, 0.3], [-1.4, 1.2, 0.3]], rv=S(126.5, 124))
# S29 (k128..132): the number's big moment: the chorus lies back and floats in a star, from above, 28 degrees off vertical
s = [idle('saxo', *EDGE, 180, fg=True)]
v = view((0.0, 4.3, 0.15), (0.0, -0.2, -2.3), 54, p1=(0.25, 4.1, 0.05), ease='lin', roll=[0, 8])
add(128, 132, s, "the number's big moment: the whole chorus lies back and floats in a star, from above", v, zone='number', chorus='float', hide=['crew'], rv=S(130.0, 128))
# S30 (k132..136): the dog at the edge sees ten bodies floating: panic
s = [panic(*EDGE, (0.0, -0.9), flap=0.55)]
v = V((0.0, 1.1, -1.3), (0.0, 1.08, 1.12), fov=48)
add(132, 136, s, "the dog sees ten bodies floating: panic", v, zone='number', zone_lens='water', rv=S(133.6, 132))
# S31 (k136..142): rescued, all ten: a dripping heap on the stage's edge, the dog panting proudly beside it, the director
# staring at it
DP = (-0.55, 1.95)                         # in front of the heap's right end: from behind it a top swimmer's cap sat on his mouth
s = [idle('saxo', *DP, 10, tongue=True, hop=[0.03, 1]), idle('kob', -2.7, 0.55, 55)]
v = V((-1.3, 3.0, 6.2), (-1.2, 0.85, 1.4), fov=52)
add(136, 142, s, "rescued, all ten: a dripping heap of swimmers on the edge, the dog panting proudly beside it, the director staring", v, zone='number', chorus='pile', drips=[[-1.7, 1.2, 1.2], [-1.2, 1.3, 0.9]], hide=['crew'], rv=S(139.0, 136))
# S32 (k142..146; 'night'): the director, her back to the pool, raises the megaphone: that's a wrap
KF = (-3.05, -1.75)
s = [idle('kob', *KF, -90, megaphone={'yaw': -45, 'pitch': -15, 'calls': [S(142.4, 142), S(144.4, 142)]}, arm='L', aim=[0.35, 0.3, 0.75], upAt=-1)]
v = view((-5.35, 1.4, -1.25), (-3.05, 1.3, -1.75), 46)
add(142, 146, s, "'night': the director, her back to the pool, calls the wrap through her megaphone", v, zone='number', wet=True, rv=S(143.5, 142))
s = [clapper(47, *CL, 20, S(146.4, 146))]
v = V((-1.9, 1.3, 3.1), (-2.6, 1.1, 1.55), fov=46, roll=[12, 10])  # a dutch close-up: take 47
add(146, 149, s, "TAKE 47: the last clap", v, zone='number', drips=[[CL[0], CL[1], 1.35]], rv=S(146.8, 146))

# ---- the payoff: the director's fate ----
s = [A('kob', 'knocked_out_falling_to_back', *KF, yaw=-90, at=1.0, speed=1.0, mx=0.95, moveAt=0.25, my=-0.3, myAt=0.45, myDur=0.5, air=True, ground='mesh', noShadow=True)]
v = view((-2.6, 1.35, 1.6), (-2.6, 0.6, -1.75), 58)
add(149, 152, s, "'fate': the director slips on the wet stage and falls backwards into the pool: a big splash, boots up", v, wet=True, bigSplash=[-2.2, -1.75, 0.92], rv=S(150.97, 149))
s = [A('kob', 'laying_idle', *OPH, yaw=0, at=1.0, speed=0, lift=FLOAT, noShadow=True, arm='both', aim=[0.3, 0.6, 0.6], upAt=-1)]
add(152, 154.6, s, "'Ophelia': the match cut: the cat floats like the painting, and the dog's life ring lands round her", FLOWER_V,
    buoyToss=[0.0, 1.5, 1.2, OPH[0], OPH[1] - 0.12, 0.12, 0.62], rv=S(153.9, 152))
s = [idle('saxo', *EDGE, 180, tongue=True, hop=[0.04, 1])]
v = V((0.0, 1.1, -1.2), (0.0, 1.08, 1.12), fov=46)
add(154.6, 156, s, "the button: the dog on the edge, proud, panting, tongue out: his rescue", v, zone_lens='water', rv=S(155.6, 154.6))

shots.sort(key=lambda x: x['beat'])
ep = {
    'date': '2026-10-15', 'song': {'title': 'The Fate of Ophelia', 'artist': 'Taylor Swift'},
    'logline': "On the shoot of \"Ophelia\" the lifeguard dog thinks the star floating among the flowers is drowning: he dives in and tows her out on every take, from the edge, then from the lifeguard tower, until the director turns it into the clip's swimming number, slips on the wet stage and falls in herself: the cat who hates water floats like the painting, and his ring lands round her.",
    'new': "src/maps49.js: ophelia (the shoot of 'Ophelia' on a gilded theatre's stage: the famous painting's stream running down into a real pool with flowers and lily pads, a 1920s hand-cranked film camera, the director's chair, a work light, a lifeguard tower, the proscenium and the stalls with an audience, the film crew, a chorus line of swimmers with life rings, painted cut-out waves, the canvas turning to a painted sea for the swimming number, a diver's splash); the props `lifebuoy`, `rope`, the clapperboard `clap<take>` with `clapAt`, and the actor fields `buoy` (a ring round the waist), `buoyFace` (the clip's portrait) and `megaphone` (with rings of sound on `calls`); three looks: Saxo's swimcap, Sadi's ophelia, Kob's director; the structure RESCUER",
    'notes': "The world, from the official video (contact sheets): a gilded theatre at night, the painting of Ophelia floating among flowers coming alive in its gold frame, stagehands moving painted flats, showgirls in red, a painted ship on cut-out waves, a swimming number of life rings in teal (the singer's face framed by a ring), feathers, a bathtub. The words, from whitelisted keywords per line: calling, megaphone, alone, light, watch, drowned; alone, tower; night, grave, saved, heart, fate and the title name; hundred, sea, hands, night, fate and the name. Cast: Saxo in the singer's swimming-number look (the lifeguard dog), Sadi as Ophelia (the star he keeps rescuing), Kob the director in a beret with the megaphone (the cat who hates water, deadpan until the end), Compote the clapper loader in her drummer look (TAKE 1, 3, 4, 47, angrier each time, soaked by the dive). The lifeguard thread comes back (2026-09-27 4th: the lifeguard who filmed himself; now he saves everyone who doesn't need it) and Kob won't touch water (until she falls in).",
    'tiktok_sound': '7556815852168759313',
    'with': ['sadi', 'kob', 'compote'],
    'clips': sorted({a['clip'] for s in shots for a in s['actors']}),
    'tags': {'structure': 'rescuer', 'scenes': ['the film shoot', 'the megaphone', 'the clapperboard', "Ophelia's tableau", 'the panic at the edge', 'the dive', 'the tow in a life ring', 'the lifeguard tower', 'the swan dive', 'the big splash', 'the swimming number', 'the face in a life ring', 'painted waves', 'the kaleidoscope', 'the director falls in', 'the match cut'],
             'cast': ['saxo', 'sadi', 'kob', 'compote'], 'hook': 'dance', 'maps': ['ophelia'], 'ref': 'none',
             'lyric_literal': "'calling ... megaphone' (the director's call), 'alone' (Ophelia floats alone), 'light' (the follow spot), 'watch' (the dog watches), 'drowned' (he dives in), 'alone ... tower' (alone on the lifeguard tower), 'grave' (Ophelia lies in state), 'saved ... fate of Ophelia' (the swan dive and the splash), 'hundred' (the chorus line of rings), 'sea' (the painted waves), 'hands' (paws up), 'fate ... Ophelia' (the director falls in and floats like the painting)",
             'experiment': "Does a pet universal everyone has filmed (the dog who thinks you're drowning every time you swim), on the biggest TikTok sound we've had (2.43M videos on Taylor Swift's own), with the clip's own iconic image (the face framed by a life ring) in the chorus, lift the Short's views at 24 h over our last three episodes?"},
    'shots': shots,
}
json.dump(ep, open(os.path.join(HERE, '2026-10-15.json'), 'w'), indent=1, ensure_ascii=False)
os.makedirs(os.path.join(HERE, '..', 'out', 'check'), exist_ok=True)
open(os.path.join(HERE, '..', 'out', 'check', 'oph_rev_times.txt'), 'w').write(','.join(f'{t:.2f}' for t in REV))
print(len(shots), 'shots;', len(WARN), 'warnings')
for b, q in SOLVED.items(): print('   moved', b, q)
for w in WARN: print('  ', w)
