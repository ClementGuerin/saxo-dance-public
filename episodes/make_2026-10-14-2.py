# The "Every Breath You Take" episode (2026-10-14 2nd; The Police, 1983): writes episodes/2026-10-14-2.json.
# Kit 2026-10-14-2: 65.4435 s, song beats 28-156 (verse 1, verse 2, the bridge, verse 3), 117.3531 BPM, kit beat 0 at 0 s.
# The words, from whitelisted keywords per line (never the lines): verse 1 'breath' (k2.8), 'move' (11.2), 'bond' and
# 'break' (18.5, 20.8), 'step' (22.5), 'watching' (26.7); verse 2 'day' (36.8), 'word' and 'say' (43.3, 45.4), 'game'
# and 'play' (50.5, 52.6), 'night' and 'stay' (54.6, 56.8), 'watching' (58.8); the bridge 'see' (69.6), 'belong'
# (74.8), 'heart aches' (~84-89.5, the last word held); verse 3 'step' (90.9), 'move' (99.1), 'break' (109.6), two
# lines with no action word (112.8, 118.0), 'watching' (122.7).
# The world (the official video, contact sheets): a black-and-white sound stage in hard light, the singer in black with a
# short bleached-blond crop at his upright bass, a grand piano silhouetted before a tall arched window with a round pane,
# a window washer in a fedora on his cradle behind the glass wiping all song long, a string section, a drummer behind a
# glowing bass drum, a chandelier, a table top in a shaft of light. Ours (src/maps48.js soundstage) keeps all of it and
# puts the cat's dinner on that table.
# The story (structure THE STARE, new: the pet universal of the stare at your food, closer on every line; the payoff: the
# stare wins it, and the roles turn):
#   0 (verse 1, k0-32): the singer at his bass sings with his eyes on the cat's steaming fish; she moves it, his whole
#     body follows it; he dances off towards it, his bass crashing to the floor on 'break'; 'watching': his stare, from
#     the fish's point of view.
#   1 (verse 2, k32-64): at her elbow: she eats, he stares; NO; keep-away (he hops for it on the beat); STAY (he sits,
#     she walks off with it); 'watching': she eats at the big window, and his face is pressed to the glass behind her.
#   2 (the bridge, k64-90): the beg from her chair; 'belong': the pianist melts, thinking the love song is for her; the
#     reverse: his paw on the fish; 'heart aches': the drama queen: paw on his heart, the strings swell, he flops on his
#     back, paws in the air (the live reference food-tantrum).
#   3 (verse 3, k90-128): she gives in and drops the fish on him; he's in her chair with it, and every move he makes, the
#     cat follows (the match cut of verse 1); the band breaks off and the whole set stares at him; 'watching': her stare,
#     from the fish's point of view; the button: the cat flops on her back, paws up: she learned the trick.
import json, math, os, re, sys
sys.path.insert(0, os.path.dirname(__file__))
from cam import view

HERE = os.path.dirname(__file__)
PER, B0T = 60 / 117.3531, 0.0
def T(b): return B0T + b * PER                  # kit seconds of kit beat b
def S(b, b0): return round((b - b0) * PER, 3)   # seconds from shot beat b0 to beat b

# the map (src/maps48.js SOUNDSTAGE)
TABLE, TY, PLATE = (1.7, -1.7), 0.72, (1.7, -1.42)
KOB_SEAT, SEAT_Y = (1.7, -2.5), 0.42
SINGER = (0.0, -5.0)
PIANIST, BENCH_Y = (-1.72, -7.0), 0.42
DRUMMER, STOOL_Y = (2.7, -7.55), 0.4
WIN_Z, CRADLE_Z = -9.0, -9.48
LOOK = {'saxo': 'shag', 'sadi': 'glam', 'kob': 'kob', 'compote': 'drummer'}
HEAD = {'saxo': 1.5, 'sadi': 1.38, 'kob': 1.47, 'compote': 1.5}
FACE = {'saxo': 0.9, 'sadi': 0.84, 'kob': 0.86, 'compote': 0.86}
RAD = {'saxo': 0.48, 'sadi': 0.45, 'kob': 0.42, 'compote': 0.42}
CHARL = 2.467
def kick_at(rv): return round((1.6 - rv) % CHARL, 3)   # charleston's kick (clip 1.6 s) on the review frame, rv s into the shot

# the karaoke's word times (kit beats; numbers only, never a word)
_src = open(os.path.join(HERE, '2026-10-14-2.lyrics.js')).read()
_rows = json.loads(re.search(r'window\.LYRICS = (.*?);\n', _src).group(1)); _ends = json.loads(re.search(r'window\.LINE_END = (.*?);\n', _src).group(1))
def Bt(t): return (t - B0T) / PER
def W(line, word): return round(Bt(_rows[line][word][0]), 2)
LINES = [(Bt(row[0][0] - 0.35), Bt(e)) for row, e in zip(_rows, _ends)]
def has_line(b0, b1): return any(a < b1 and b > b0 for a, b in LINES)

def A(who, clip, x, z, **o):
    return {'who': who, 'look': o.pop('look', LOOK[who]), 'clip': clip, 'x': round(x, 3), 'z': round(z, 3), 'face': o.pop('face', 'world'),
            'yaw': round(o.pop('yaw', 0), 1), 'at': o.pop('at', 0.4), 'speed': o.pop('speed', 1), **o}
def yaw_to(frm, to): return round(math.degrees(math.atan2(to[0] - frm[0], to[1] - frm[1])), 1)
def seated(who, x, z, yaw, lift, **o): return A(who, 'sitting_talking', x, z, yaw=yaw, at=0.05, speed=0, lift=lift, **o)
def kob(**o):                                   # the cat at her dinner: seated in her chair, napkin tucked in
    return seated('kob', *KOB_SEAT, o.pop('yaw', 0), SEAT_Y, napkin=True, **o)
def dancer(who, x, z, yaw, rv, clip='charleston', **o):
    if clip == 'charleston': o.setdefault('at', kick_at(rv)); o.setdefault('speed', 1)
    return A(who, clip, x, z, yaw=yaw, **o)
def pianist(**o): return seated('sadi', *PIANIST, o.pop('yaw', -90), BENCH_Y, arm=o.pop('arm', 'both'), aim=o.pop('aim', 'keys'), upAt=-1, **o)
def drummer(**o): return seated('compote', *DRUMMER, o.pop('yaw', 0), STOOL_Y, arm='both', aim=o.pop('aim', 'drums'), hold='dstick', holdL='dstick', upAt=-1, **o)
BASS = (SINGER[0] + 0.42, SINGER[1] + 0.2)     # the upright bass at his left, its neck beside his ear
def singer(rv, **o):                             # the dog at his bass: the left paw up on its neck, the right plucking across, bobbing on the beat
    yw = o.pop('yaw', yaw_to(SINGER, PLATE))
    return A('saxo', 'happy_idle', *SINGER, yaw=yw, at=2.125, speed=0, arm='L', aim=[0.55, 0.62, 0.4], armB='R', aimB=[-0.35, -0.15, 0.85], upAt=-1, hop=[0.03, 1], **o)

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
    if zone == 'stage': return -7.6 < x < 7.6 and -8.75 < z < 5.6 and 0.08 < y < 6.8
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
    zone = o.pop('zone', 'stage')
    if v[0] == 'V': v = fit(v, beat, b1, actors, zone)
    c, focus = v
    for k, end in ((0, 0), (-1, 1)):
        cam, look = lens(v, k), (focus[0], c['look'][k] + (focus[2] if len(focus) > 2 else 0), focus[1])
        check(beat, b1, cam, look, c['fov'], actors, end, WARN)
        if not inside(cam, zone): WARN.append(f'b{beat}: lens outside the {zone} {tuple(round(q, 2) for q in cam)}')
    t0 = 0 if not shots else T(beat)
    REV.append(round(t0 + (rv if rv is not None else 0.6 * (T(b1) - t0)), 2))
    shots.append({'beat': beat, 'kind': 'dance', 'map': 'soundstage', 'actors': actors, 'lyric': lyric, 'cam': c, 'focus': focus, **o})

# ---------------- marks ----------------
DOG_T = (2.45, -2.25)                      # his spot at her elbow, beside her chair, leaning towards her plate
YAW_T = yaw_to(DOG_T, PLATE)
def starer(**o):                            # the dog at her elbow: still, leaning in, his eyes on her fish
    return A('saxo', 'happy_idle', *DOG_T, yaw=o.pop('yaw', YAW_T), at=2.125, speed=0, lean=o.pop('lean', 12), **o)
FISH_UP = [0.45, 0.62, 0.45]                 # the fish held up by the tail, out to her right and up
FISH_ACROSS = [-0.25, 0.6, 0.65]            # ... and swung across in front of her
def kob_fish(seq=None, **o):                # the cat holding her fish by the tail in her right paw
    if seq: return kob(arm='R', aimSeq=seq, hold='fish', holdScale=o.pop('holdScale', 1.25), upAt=-1, **o)
    return kob(arm='R', aim=o.pop('aim', 'sip'), hold='fish', holdScale=o.pop('holdScale', 1.25), upAt=-1, **o)
def swing_seq(b0, b1, first=FISH_UP, second=FISH_ACROSS):   # the fish swung from side to side on every beat
    out = [[-1, first]]; b = math.floor(b0) + 1; k = 1
    while b < b1: out.append([round(S(b, b0) - 0.04, 3), second if k % 2 else first]); b += 1; k += 1
    return out

# The fallback (DAILY_ROUTINE "Fallback", 2026-10-14 03:55): six shots failed three review loops (the bass toppling behind
# the dance-off, the walk-up, the high two-shot, keep-away, the drummer's and the violinists' stares, the over-the-shoulder
# stare): the dance-off runs through the walk-up's beats with the bass left standing, the two-shot and the last stare take the
# passed S19 frame (with the roles swapped for the two-shot), and the stare, the stay and the pianist's stare take the beats of
# keep-away and the band inserts.
# =====================================================================================================================
def along(face, toward, dist):              # a point `dist` m from a face, on the floor-plane line through `toward`
    dx, dz = toward[0] - face[0], toward[1] - face[1]; n = math.hypot(dx, dz)
    return (round(face[0] + dx / n * dist, 3), round(face[1] + dz / n * dist, 3))
def leaned(mark, yaw, lean):                # where a leaning head ends up (0.9 m along the facing x sin(lean))
    d = 0.9 * math.sin(math.radians(lean)); a = math.radians(yaw)
    return (round(mark[0] + math.sin(a) * d, 3), round(mark[1] + math.cos(a) * d, 3))
# S00 (k0..9.4; 'breath'): the hook: from just behind the cat's plate: her fish steaming at the bottom of the frame, and
# across the set the singer at his upright bass, bobbing on the beat, his eyes on it; a slow push over the plate
s = [singer(S(4, 0))]
v = V((2.15, 1.0, -0.55), (0.0, 0.7, -5.0), fov=58, p1=(2.08, 0.99, -0.72), ease='lin')
add(0, 9.4, s, "the hook: from just behind the cat's plate: her fish steaming in the foreground, the singer at his upright bass across the set, eyes on it", v,
    bass=[*BASS, 25, 10], shaft=False, hide=['candle', 'milk', 'chair'], key=[0.6, 2.1, -3.7, 1.35, 1.3, 1.25], rv=S(3, 0))
# S01 (k9.4..14.4; 'move'): every move she makes: the cat lifts the fish by its tail and swings it side to side on the
# beat, and behind her the singer leans after it, bass and all
MATCH = V((1.05, 1.25, 1.35), (1.25, 1.0, -3.4), fov=66, p1=(1.05, 1.22, 1.15))
s = [kob_fish(seq=swing_seq(9.4, 14.4)), singer(S(11.2, 9.4), yaw=yaw_to(SINGER, KOB_SEAT), lean=14, sway=10, swayEvery=1, swayPh=0.0)]
add(9.4, 14.4, s, "'move': the cat swings her fish by the tail on the beat, the singer behind her leaning after it", MATCH, bass=[*BASS, 25, 10], plateFish=False, shaft=False, rv=S(11.2, 9.4))
# S02 (k14.4..21.6; 'bond ... break'): the Short opens here: he dances off his mark towards the fish, the charleston, and
# behind him his abandoned bass topples and crashes to the floor on 'break'
BREAK = W(2, 3)
D2 = (0.7, -4.4); D2E = (1.3, -3.25)
s = [dancer('saxo', *D2, yaw_to(D2, PLATE), S(18.6, 14.4), mx=round(D2E[0] - D2[0], 2), mz=round(D2E[1] - D2[1], 2))]
v = V((0.75, 0.42, -1.05), (0.9, 0.85, -3.9), fov=62, p1=(0.8, 0.4, -1.25), roll=(-8, -5), hand=0.3)
add(14.4, 25.4, s, "'bond ... break ... step': he has left his bass standing and dances off towards the fish, step by step", v,
    bass=[*BASS, 25, 10], shaft=False, washer=False, hide=['drums', 'candle', 'milk', 'chair'], rv=S(18.6, 14.4))
# S03 (k21.6..25.4; 'step'): he walks up beside her chair, every step closer, his eyes on her plate
DS = (DOG_T[0] + 0.45, DOG_T[1] - 0.55)
s = [kob_fish(), A('saxo', 'happy_walk', *DS, yaw=yaw_to(DS, DOG_T), at=0.3, speed=0.9, mx=round(DOG_T[0] - DS[0], 2), mz=round(DOG_T[1] - DS[1], 2), reveal=1.4)]
v = V((3.3, 1.15, 0.5), (1.9, 0.95, -2.1), fov=54)
add(21.6, 25.4, s, drop=True, lyric="'step': he walks up beside her chair, step by step, his eyes on her fish", v=v, shaft=False, plateFish=False, hide=['piano', 'drums'], rv=S(24.6, 21.6))
# S04 (k25.4..32; 'watching'): from beyond her plate (the fish's point of view): his face leaning in at the table's edge,
# staring down the lens, the fish on the plate at the bottom of the frame
FT = leaned(DOG_T, YAW_T, 14); L04 = along(FT, PLATE, 2.25)
STARE_V = V((L04[0], 1.3, L04[1]), (FT[0], 1.1, FT[1]), fov=46, p1=(L04[0] + 0.04, 1.3, L04[1] - 0.05), ease='lin')
add(25.4, 36.5, [starer(lean=14)], "'watching': from beyond her plate: his face leaning in at the table's edge, staring down the lens, the fish at the bottom", STARE_V, shaft=False, hide=['milk', 'candle'], rv=S(27.5, 25.4))

# ---- verse 2: at her elbow ----
# S05 (k32..41.5; 'day'): the wide two-shot, locked off: she eats, he stares at every bite, the band playing behind them
KE = (2.5, -2.3)
s = [kob_fish(), A('saxo', 'happy_idle', *KE, yaw=yaw_to(KE, KOB_SEAT), at=2.125, speed=0, lean=10)]
v = V((0.9, 1.3, 0.2), (2.0, 1.1, -2.35), fov=58)   # S19's setup (passed), the roles the other way round, the lens on his front side
add(32, 41.5, s, drop=True, lyric="'every single day': she eats her fish in her chair, the fish at her mouth, and the dog at her elbow stares at every bite", v=v, plateFish=False, shaft=False, washer=False, hide=['candle', 'drums', 'milk'], rv=S(36.05, 32))
# S06 (k41.5..45.2; 'word'): his point of view: she says the word, no: a slow head shake, deadpan, the fish in her paw
KF = (KOB_SEAT[0], KOB_SEAT[1]); L06 = along(KF, (KF[0] + math.sin(math.radians(68)), KF[1] + math.cos(math.radians(68))), 2.3)
s = [A('kob', 'shaking_head_no_dismissively', *KOB_SEAT, yaw=68, at=0.5, speed=1, lift=SEAT_Y, napkin=True, holdL='fish', holdScale=1.15)]
v = V((L06[0], 1.3, L06[1]), (KF[0], 1.38, KF[1]), fov=44)
add(36.5, 45.2, s, "'day ... word': his point of view: the cat says no, a slow head shake, deadpan", v, plateFish=False, hide=['candle'], rv=S(43.3, 36.5))
# S07 (k45.2..47; 'say'): the reverse: his stare hasn't moved: S04's frame again
add(45.2, 50.0, [starer(lean=14)], "'say': the reverse: his stare hasn't moved: the same frame again", STARE_V, shaft=False, hide=['milk', 'candle'], rv=S(46.2, 45.2))
# S08 (k47..53.8; 'game ... play'): keep-away: she holds the fish up out of his reach, he hops for it on every beat
HOPM = (2.55, -1.3)    # the cat up on her table with the fish dangling high on her far side; he jumps for it at the table's edge, paws up
s = [A('kob', 'happy_idle', *TABLE, yaw=15, at=2.125, speed=0, lift=TY, napkin=True, arm='R', aim=[0.62, 0.75, 0.12], hold='fish', holdScale=1.35, upAt=-1),
     A('saxo', 'happy_idle', *HOPM, yaw=yaw_to(HOPM, TABLE), at=2.125, speed=0, arm='both', aim=[0.2, 0.75, 0.55], upAt=-1, hop=[0.3, 1], air=True)]
v = V((2.75, 0.95, 1.2), (2.05, 1.3, -1.55), fov=62)
add(47, 53.8, s, drop=True, lyric="'game ... play': keep-away: up on her table she holds the fish high out of reach and he jumps for it on every beat", v=v, plateFish=False, shaft=False, hide=['drums', 'plate', 'milk', 'candle'], rv=S(50.5, 47))
# S09 (k53.8..57.5; 'night ... stay'): side on, in front of her table: she's up, the fish in her other paw, and gives the
# order, stay, her paw out at him; he sits, good boy
STAY = W(8, 3)
KST, DST = (0.95, -0.75), (2.45, -0.75)
s = [A('kob', 'happy_idle', *KST, yaw=90, at=2.125, speed=0, arm='R', aim=[0.05, 0.08, 1.0], upAt=-1),
     A('saxo', 'situps', *DST, yaw=-90, at=0.8, speed=0, noLie=True)]
v = V((1.68, 0.95, 2.35), (1.68, 0.72, -0.75), fov=58)
add(50.0, 57.5, s, "'stay': side on, in front of her table: she's up and gives the order, her paw up at him; he sits, good boy", v, hide=['chair'], rv=S(STAY + 0.2, 50.0))
# S10 (k57.5..64; 'watching'): she eats at the big window, her back to it, and his face is pressed to the glass behind
# her, out on the window washer's cradle, the washer staring at him
KW = (-0.35, -8.25); DW = (-0.85, CRADLE_Z)
s = [A('kob', 'happy_idle', *KW, yaw=8, at=2.125, speed=0, napkin=True, arm='R', aim='sip', hold='fish', holdScale=1.2, upAt=-1),
     A('saxo', 'happy_idle', *DW, yaw=0, at=2.125, speed=0, lift=0.05, arm='both', aim=[0.25, 0.45, 0.9], upAt=-1, noShadow=True)]
v = V((0.45, 1.25, -5.35), (-0.55, 1.0, -8.6), fov=50)
add(57.5, 64, s, "'watching': she eats at the big window with her back to it, and his face is pressed to the glass right behind her, out on the washer's cradle", v,
    cradle=0.05, washer='stare', stare=[DW[0], -9.1], key=[-0.4, 1.6, -7.2, 1.15, 1.1, 1.05], shaft=False, plateFish=False, rv=S(60.05, 57.5))

# ---- the bridge: the drama queen ----
# S11 (k64..73.6; 'see'): her point of view from her chair: the beg, up on his hind legs, paws together, gazing at her
BEG = (1.75, -0.4)
s = [A('saxo', 'happy_idle', *BEG, yaw=180, at=2.125, speed=0, arm='both', aim=[-0.12, 0.12, 0.9], upAt=-1, lean=6, hop=[0.03, 1])]
v = V((1.7, 1.45, -2.65), (1.75, 0.95, -0.4), fov=50)
add(64, 73.6, s, "'see': her point of view from her chair, her fish on the plate in front: across the table he begs, paws together, gazing at her", v, hide=['chair', 'candle', 'milk'], shaft=False, rv=S(69.6, 64))
# S12 (k73.6..77.2; 'belong'): the pianist turns on her bench to the singer and melts, paw on her heart, hearts rising:
# she thinks the love line is sung to her
SY = 62; LS = along(PIANIST, (PIANIST[0] + math.sin(math.radians(SY)), PIANIST[1] + math.cos(math.radians(SY))), 2.8)
s = [pianist(arm='R', aim='heart', yaw=SY)]   # one paw on her heart (both crossed read as sulking)
v = V((LS[0], 1.3, LS[1]), (PIANIST[0], 1.4, PIANIST[1]), fov=50)
add(73.6, 77.2, s, "'belong': the pianist turns to the singer and melts, paw on her heart, hearts rising: she thinks the love line is for her", v,
    hearts=[[PIANIST[0] + 0.58 * math.cos(math.radians(SY)), 1.32, PIANIST[1] - 0.58 * math.sin(math.radians(SY)), 0.0, 1]], heartYaw=SY, heartScale=0.55, rv=S(75.5, 73.6))
# S13 (k77.2..81.7): the reverse: his paw on the fish on her plate, claiming it; she glares
DP = (2.27, -1.47)
s = [kob(yaw=35), A('saxo', 'happy_idle', *DP, yaw=-92, at=2.125, speed=0, arm='L', aim=[0.12, -0.2, 0.95], upAt=-1, lean=4)]
v = V((0.75, 1.8, -0.15), (1.9, 0.82, -1.6), fov=52)
add(77.2, 81.7, s, "the reverse: his paw on the fish on her plate, claiming it; she glares", v, shaft=False, hide=['candle'], rv=S(79.5, 77.2))
# S14 (k81.7..85.8; 'poor heart'): the drama: paw on his heart, swaying, the string section swelling behind him
DH = (-2.45, -3.35); HY = yaw_to(DH, (-0.35, -1.75))
s = [A('saxo', 'happy_idle', *DH, yaw=HY, at=2.125, speed=0, arm='R', aim='heart', upAt=-1, sway=8, swayEvery=2, lean=-6)]
v = V((-0.35, 1.05, -1.75), (-2.85, 1.0, -3.85), fov=56)
add(81.7, 85.8, s, "'poor heart': paw on his heart, swaying, the string section swelling behind him", v, strings='swell', shaft=False, rv=S(84, 81.7))
# S15 (k85.8..90.2; 'aches'): the flop: flat on his back by her chair, paws in the air, tongue out, wailing; she looks
# down at him (from above his feet: a lying body reads upright from its feet's side)
FL = (2.95, -1.75)
FLOP_V = V((2.75, 1.6, 0.95), (2.6, 0.45, -1.95), fov=56)
KU = (2.55, -2.55)
s = [A('kob', 'happy_idle', *KU, yaw=yaw_to(KU, FL), at=2.125, speed=0, napkin=True), A('saxo', 'laying_idle', *FL, yaw=90, at=1.0, speed=0, arm='both', aim=[0.3, 0.7, 0.65], upAt=-1, tongue=True, ground='mesh')]
add(85.8, 90.2, s, "'aches': the flop: flat on his back by her chair, paws in the air, tongue out; she stands over him, looking down", FLOP_V, shaft=False, hide=['drums'], rv=S(87.5, 85.8))

# ---- verse 3: the stare wins it, and the roles turn ----
# S16 (k90.2..95.4; 'step'): she gives in: up from her chair, over him, she drops the fish and his jaws snap it up
DROP = round(S(W(13, 2), 90.2) - 0.25, 3)
KS = (2.65, -2.45)
s = [A('kob', 'happy_idle', *KS, yaw=yaw_to(KS, FL), at=2.125, speed=0, napkin=True, arm='R', aim=[0.45, 0.2, 0.75], upAt=-1, hold='fish', holdScale=1.2, holdTo=DROP),
     A('saxo', 'laying_idle', *FL, yaw=90, at=1.0, speed=0, arm='both', aim=[0.3, 0.7, 0.65], upAt=-1, ground='mesh', fetch={'kind': 'fish', 'at': round(DROP + 0.3, 3)})]
v = V((3.15, 1.65, 0.85), (2.75, 0.5, -1.95), fov=58)
add(90.2, 95.4, s, "'step': she gives in: over him, she drops the fish and his jaws snap it up", v, plateFish=False, shaft=False, hide=['drums'], rv=S(W(13, 2) + 0.6, 90.2))
# S17 (k95.4..103.4; 'move'): the match cut of S01, the same lens: now he sits in her chair with the fish, swaying it on
# the beat, and behind him, where he stood at his bass, the cat leans after it
KB = (0.35, -4.4)
s = [seated('saxo', *KOB_SEAT, 0, SEAT_Y, fetch='fish', sway=10, swayEvery=1, swayPh=0.0), A('kob', 'happy_idle', *KB, yaw=yaw_to(KB, KOB_SEAT), at=2.125, speed=0, lean=14, sway=10, swayEvery=1, swayPh=0.0)]
add(95.4, 103.4, s, "'move': the match cut: now he's in her chair with the fish, swaying it on the beat, and the cat behind him leans after it", MATCH, plateFish=False, shaft=False, bass=[0.36, -4.6, 160, 90], hide=['drums'], rv=S(99.1, 95.4))
# S18 (k103.4..109.6): he dances in her chair, the fish in his jaws, paws up
s = [seated('saxo', *KOB_SEAT, 0, SEAT_Y, fetch='fish', arm='both', aim='rave', flapEvery=1, upAt=-1)]
v = V((1.95, 1.3, -0.2), (1.7, 1.15, -2.5), fov=52)
add(103.4, 109.6, s, "he dances in her chair, the fish in his jaws", v, plateFish=False, shaft=False, hide=['candle', 'milk', 'drums'], washer=False, rv=S(106, 103.4))
# S19 (k109.6..112.7; 'break'): the band breaks off, and the whole set stares at him: the cat beside him, the pianist and
# the drummer behind, the washer at the window
KR = (1.0, -2.2)
KE = (2.5, -2.3)
s = [seated('saxo', *KOB_SEAT, 0, SEAT_Y, fetch='fish'), A('kob', 'happy_idle', *KE, yaw=yaw_to(KE, KOB_SEAT), at=2.125, speed=0, lean=10)]
v = V((2.15, 1.3, 0.5), (2.05, 1.1, -2.4), fov=58)
add(109.6, 114.5, s, "'break': the band breaks off; the cat at his elbow stares at the fish in his jaws, the way he stared at hers", v, strings='stare', stare=list(KOB_SEAT), washer=False, plateFish=False, shaft=False, hide=['candle', 'drums'], rv=S(110.6, 109.6))
# S20 (k112.7..115.3): the pianist's stare
PY = yaw_to(PIANIST, KOB_SEAT); LP = along(PIANIST, KOB_SEAT, 2.25)
s = [pianist(aim=[0.2, -0.3, 0.6], yaw=PY)]
v = V((LP[0], 1.3, LP[1]), (PIANIST[0], 1.42, PIANIST[1]), fov=46)
add(114.5, 121.2, s, "the pianist stares at him", v, shaft=False, rv=S(116.0, 114.5))
# S21 (k115.3..118): the drummer's glare over her kit
CY = yaw_to(DRUMMER, KOB_SEAT); LC = along(DRUMMER, KOB_SEAT, 2.3)
s = [drummer(aim=[0.15, -0.35, 0.75], yaw=CY)]
v = V((LC[0], 1.35, LC[1]), (DRUMMER[0], 1.42, DRUMMER[1]), fov=46)
add(115.3, 118, s, drop=True, lyric="the drummer glares at him over her kit", v=v, shaft=False, rv=S(116.5, 115.3))
# S22 (k118..121.2): the reverse from him: the violinists all turned to him, bows down, staring
s = [A('kob', 'happy_idle', *KR, yaw=yaw_to(KR, KOB_SEAT), at=2.125, speed=0, fg=True)]
v = V((-0.55, 1.35, -2.15), (-4.25, 0.9, -4.45), fov=62)
add(118, 121.2, s, drop=True, lyric="the reverse from him: the violinists all turned his way, violins down, staring", v=v, strings='stare', stare=list(KOB_SEAT), washer='stare', shaft=False, clear=[[-5.55, -4.75, 0.3]], key=[-2.6, 2.3, -2.6, 1.3, 1.25, 1.2], rv=S(119.5, 118))
# S23 (k121.2..124.6; 'watching'): the mirror of S04: from the fish in his jaws, the cat's face leaning in, staring
s = [seated('saxo', *KOB_SEAT, 0, SEAT_Y, fetch='fish'), A('kob', 'happy_idle', *KE, yaw=yaw_to(KE, KOB_SEAT), at=2.125, speed=0, lean=12)]
v = V((2.15, 1.3, 0.5), (2.05, 1.1, -2.4), fov=58)   # the passed S19 frame again, on the last 'watching'
add(121.2, 123.6, s, drop=True, lyric="'watching': S19's frame again: the cat at his elbow stares at the fish in his jaws", v=v, washer=False, plateFish=False, shaft=False, hide=['candle', 'drums'], rv=S(122.7, 121.2))
# S24 (k124.6..128; the button): S15's frame with the roles turned: the cat flat on her back by the chair, paws in the
# air: she learned the trick; he looks down at her from her chair with the fish
s = [seated('saxo', *KOB_SEAT, yaw_to(KOB_SEAT, FL), SEAT_Y, fetch='fish'), A('kob', 'laying_idle', *FL, yaw=90, at=1.0, speed=0, arm='both', aim=[0.3, 0.7, 0.65], upAt=-1, ground='mesh')]
v = V((2.95, 1.55, 0.9), (2.25, 0.7, -2.05), fov=58)
add(121.2, 128, s, "'watching' and the button: the roles turned: the cat flat on her back by the chair, paws in the air: she learned the trick; he looks down at her from her chair with the fish", v, plateFish=False, shaft=False, hide=['drums', 'cradle'], rv=S(126.0, 121.2))

shots.sort(key=lambda x: x['beat'])
ep = {
    'date': '2026-10-14', 'song': {'title': 'Every Breath You Take', 'artist': 'The Police'},
    'logline': "The singer can't sing the most famous love song of 1983 without staring at the cat's fish dinner: every move she makes, his whole body follows it, closer on every line, until his drama-queen flop on 'heart aches' wins it; then every move he makes, the cat follows, and on the last bar she flops too.",
    'new': "src/maps48.js: soundstage (the clip's black-and-white sound stage: the arched window with its round pane glowing white, the window washer in a fedora on his cradle behind the glass, a grand piano, a drum kit behind a glowing bass drum with a paw on it, a string section of box-pet violinists who play, swell and stare, a chandelier, a shaft of light onto the cat's dinner table, a steaming fish, an upright bass that topples); the `napkin` face prop; Saxo's look shag (the singer's short bleached-blond crop and black shirt); the structure THE STARE",
    'notes': "The world, from the official video (contact sheets): a black-and-white sound stage in hard light, the singer at an upright bass, a grand piano silhouetted before a tall arched window with a round pane, a window washer on his cradle behind the glass, violinists, a drummer behind a glowing bass drum, a chandelier, a table top in a shaft of light. The words, from whitelisted keywords per line: every line of the verses names something the one being watched does (breath, move, break, step, word, say, game, play, night, stay), each verse ending on 'watching'; the bridge's 'see', 'belong', 'heart aches'. TikTok uses this song for pets staring at their owners. Cast: Saxo in the singer's look (the dog who stares), Kob in her own tweed with a napkin tucked in (the cat at her fish dinner), Sadi in her glam dress at the piano (she thinks the love line is for her), Compote in her drummer look (the band). The live reference food-tantrum (the drama-queen dog denied a bite) is the bridge's flop.",
    'tiktok_sound': '7432444695299787553',
    'with': ['sadi', 'kob', 'compote'],
    'clips': sorted({a['clip'] for s in shots for a in s['actors']}),
    'tags': {'structure': 'stare', 'scenes': ["the fish's point of view", 'the fish swung, his body following', 'the bass toppling', 'at her elbow', 'no', 'keep-away hops', 'stay', 'his face pressed to the window', 'the beg', 'the pianist melts', 'paw on the fish', 'paw on his heart, the strings swell', 'the drama-queen flop', 'the fish dropped on him', 'the match cut: he swings it, she follows', 'the whole set stares', "the cat's stare", 'the cat flops too'],
             'cast': ['saxo', 'sadi', 'kob', 'compote'], 'hook': 'dance', 'maps': ['soundstage'], 'ref': 'food-tantrum',
             'lyric_literal': "'breath' (the fish steaming), 'move' (she swings it, his body follows), 'break' (his bass crashes to the floor), 'step' (he steps up to her chair), 'watching' (his stare from the fish's point of view, his face at the window, her stare at the end), 'word' (she says no), 'game ... play' (keep-away), 'stay' (he sits), 'belong' (his paw on the fish; the pianist thinks it's her), 'heart aches' (paw on his heart, the flop), 'step' (she gives in), 'move' (he swings it, she follows), 'break' (the band breaks off)",
             'experiment': "Does a pet universal that TikTok already uses this exact song for (the pet's stare at your food: 615k videos on The Police's own sound, 983k on its 'watching you' clip), told as a role swap on the same lines (verse 1 he stares at her fish, verse 3 she stares at it in his jaws), earn more likes per 1,000 views on the Short at 24 h than our last week's episodes?"},
    'shots': shots,
}
json.dump(ep, open(os.path.join(HERE, '2026-10-14-2.json'), 'w'), indent=1, ensure_ascii=False)
os.makedirs(os.path.join(HERE, '..', 'out', 'check'), exist_ok=True)
open(os.path.join(HERE, '..', 'out', 'check', 'ebyt_rev_times.txt'), 'w').write(','.join(f'{t:.2f}' for t in REV))
print(len(shots), 'shots;', len(WARN), 'warnings')
for b, q in SOLVED.items(): print('   moved', b, q)
for w in WARN: print('  ', w)
