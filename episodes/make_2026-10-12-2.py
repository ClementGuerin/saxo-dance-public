# The "Everybody Wants To Rule The World" episode (2026-10-12 2nd; Tears For Fears, 1985): writes episodes/2026-10-12-2.json.
# Kit 2026-10-12-2: 71.749 s = 134 beats at 112.0571 BPM from two bars of the intro riff (kit beat 0 at 0 s): verse 1 and
# its refrain, the riff break (kit beats 64-80), verse 2 and its refrain, the music's end just before the bridge's first
# word (kit beat 132.9), then a 0.6 s silent button (to kit beat 134).
# The world (the official video, contact sheets): a dark green 1960s British roadster driving through the California
# desert, a roadside gas station with a red pump where two men in tuxedos dance, a diner under an EAT sign, a phone booth,
# an Airstream trailer, palms and telephone poles, and the drive into a pink-orange sunset with the headlights on; the
# singer in a salmon-pink polo shirt, the driver in a black-and-white zig-zag jacket and dark glasses. The words
# (whitelisted keywords per line, never the text): 'welcome', 'back', 'sleep', 'find', 'best behaviour', 'turn your back',
# 'mother nature', the title on each refrain ('everybody wants to rule the world'), 'own design', 'decide', 'help',
# 'freedom', 'pleasure', 'nothing ever lasts forever'.
# The story (structure USURPER, new: every time the owner turns her back, the dog takes her seat, a little further each
# time; when she looks he's on his best behaviour; the payoff: he drives off with it):
#   0 (the intro riff, b0..8): the cold open: on the desert highway at sunset the dog drives the green roadster in Kob's
#     shades, Sadi beside him in love: how did that happen?
#   1 (verse 1, b8..52): earlier: Kob drives it into a gas station, the dog in the passenger seat; Compote the pump
#     attendant waves them in; Kob gets out to fill up; every time she looks back he's an angel: asleep under his
#     travel mask, sitting up straight, paws on his knees; she turns her back...
#   2 (refrain 1, b52..64): ...and he's in her seat, paws on the wheel (the meme: the dog in the driver's seat); her
#     shades drop onto his nose; she turns round: he's back in his seat, best behaviour, still in her shades.
#   3 (the riff break, b64..80): the cat's secret: she and Compote do the clip's pump dance in sync, deadpan, while the
#     tank fills; the dog joins in; then she strolls into the diner, her back to the car again.
#   4 (verse 2, b80..124): the dog at the wheel again, honking; Sadi the waitress melts in the diner's door; Compote
#     glares at him over the windscreen with her squeegee; he studies a road map over the wheel, can't decide; Sadi
#     hops in beside him; the engine roars; Kob comes out with her milk: her car's gone; Compote throws her squeegee.
#   5 (refrain 2 and the button, b124..134): the dog drives off into the sunset with Sadi; silence: Kob alone at the
#     pump in the dust with her milk.
import json, math, os, re, sys
sys.path.insert(0, os.path.dirname(__file__))
from cam import view

HERE = os.path.dirname(__file__)
PER = 60 / 112.0571
def Bt(t): return t / PER                       # kit seconds -> kit beat (kit beat 0 at 0 s)
def S(b, b0): return round((b - b0) * PER, 3)   # seconds from shot beat b0 to beat b

LOOK = {'saxo': 'polo', 'sadi': 'waitress', 'kob': 'zigzag', 'compote': 'bouncer'}
HEAD = {'saxo': 1.46, 'sadi': 1.38, 'kob': 1.47, 'compote': 1.5}
FACE = {'saxo': 0.9, 'sadi': 0.84, 'kob': 0.86, 'compote': 0.86}
RAD = {'saxo': 0.5, 'sadi': 0.45, 'kob': 0.42, 'compote': 0.42}
SEATED = ('sitting_talking', 'situps', 'male_driving_a_car', 'clap_while_seated', 'celebrating_after_a_win_while_seated', 'pointing_while_seated', 'waving_someone_over_while_seated')
# the gas station (src/maps44.js MOJAVE, CAR): the roadster parked at CP nose to -x (yaw 180): its driver's side on +z,
# to the road and the usual lenses; the passenger's side and the filler by the pumps
CP = (0.35, 0.95); SEAT_Y = 0.45
DRV = (CP[0] + 0.18, CP[1] + 0.5); PAS = (CP[0] + 0.18, CP[1] - 0.5); RY = -90   # the riders face -x
DRV_R = (-0.18, -0.5); PAS_R = (-0.18, 0.5); RY_R = 90                           # on the road map: the car at the origin, nose to +x
HOSE = [1.98, 1.0, -1.15]                             # pump 1's hose, where the nozzle's black hose runs to
KOB_FILL = (2.85, -0.25)                              # Kob filling the tank behind the car's tail, by pump 1
DOOR = (-2.95, -3.8)

def A(who, clip, x, z, **o):
    return {'who': who, 'look': o.pop('look', LOOK[who]), 'clip': clip, 'x': round(x, 3), 'z': round(z, 3), 'face': o.pop('face', 'world'),
            'yaw': round(o.pop('yaw', 0), 1), 'at': o.pop('at', 'auto'), **o}
def yaw_to(frm, to): return round(math.degrees(math.atan2(to[0] - frm[0], to[1] - frm[1])), 1)
def drive(who, pos=DRV, **o):                    # at the wheel: the driving clip's paws sit on it
    return A(who, 'male_driving_a_car', pos[0], pos[1], yaw=o.pop('yaw', RY_R if pos == DRV_R else RY), at=o.pop('at', 0.3), speed=o.pop('speed', 0.4), lift=SEAT_Y, **o)
def sit(who, pos=PAS, **o):                      # seated upright, head forward (sitting_talking held at its first moment)
    return A(who, o.pop('clip', 'sitting_talking'), pos[0], pos[1], yaw=o.pop('yaw', RY_R if pos in (DRV_R, PAS_R) else RY), at=o.pop('at', 0.05), speed=o.pop('speed', 0), lift=SEAT_Y, **o)
GOOD = dict(arm='both', aim=[0.12, -0.2, 0.55], upAt=-1)   # best behaviour: paws on the knees, sitting up straight
CHARL = 2.467
def kick_at(rv): return round((1.6 - rv) % CHARL, 3)     # charleston's kick (clip 1.6 s) on the review frame, rv s into the shot

# ---- a projection check (numbers only): where each face lands in the 9:16 frame at the shot's start and end ----
def _proj(cam, look, fov, pt):
    f = [look[i] - cam[i] for i in range(3)]; n = math.sqrt(sum(v * v for v in f)); f = [v / n for v in f]
    r = [-f[2], 0.0, f[0]]; rn = math.sqrt(r[0] ** 2 + r[2] ** 2) or 1; r = [r[0] / rn, 0.0, r[2] / rn]
    u = [r[1] * f[2] - r[2] * f[1], r[2] * f[0] - r[0] * f[2], r[0] * f[1] - r[1] * f[0]]
    d = [pt[i] - cam[i] for i in range(3)]; z = sum(a * b for a, b in zip(d, f))
    if z <= 0.05: return None
    tv = math.tan(math.radians(fov) / 2); th = tv * 9 / 16
    return (0.5 + sum(a * b for a, b in zip(d, r)) / z / th / 2, 0.5 - sum(a * b for a, b in zip(d, u)) / z / tv / 2)
_src = open(os.path.join(HERE, '2026-10-12-2.lyrics.js')).read()
_rows = json.loads(re.search(r'window\.LYRICS = (.*?);\n', _src).group(1)); _ends = json.loads(re.search(r'window\.LINE_END = (.*?);\n', _src).group(1))
LINES = [(Bt(row[0][0] - 0.35), Bt(e)) for row, e in zip(_rows, _ends)]
def has_line(b0, b1): return any(a < b1 and b > b0 for a, b in LINES)
WARN = []
def body(a, end):                                # (who, x, z, face y, head top y) at the shot's start (0) or end (1)
    who = a['who']; sc = a.get('scale', 1)
    x, z = a['x'] + a.get('mx', 0) * end, a['z'] + a.get('mz', 0) * end
    lift = a.get('lift', 0) + (a.get('my', 0) if end else 0)
    fy, hy = FACE[who] * sc, HEAD[who] * sc
    if a.get('clip') in SEATED: fy, hy = fy - 0.3, hy - 0.3
    return (who, x, z, fy + lift, hy + lift)
def check(beat, b1, cam, look, fov, actors, end, W):
    line = has_line(beat, b1)
    for a in actors:
        if a.get('fg') or a.get('lying') or a.get('away') or (a.get('reveal') and not end): continue
        who, x, z, fy, hy = body(a, end)
        top, face = _proj(cam, look, fov, (x, hy, z)), _proj(cam, look, fov, (x, fy, z))
        tag = ' at the end' if end else ''
        if not top or not face: W.append(f'b{beat}: {who} behind the lens{tag}'); continue
        if line and top[1] < 0.27: W.append(f'b{beat}: {who} head top at {top[1]:.2f} (lyric rows){tag}')
        if face[0] < 0.12 or face[0] > 0.88: W.append(f'b{beat}: {who} face x {face[0]:.2f} (edge){tag}')
        if face[1] > 0.82 or face[1] < 0.0: W.append(f'b{beat}: {who} face y {face[1]:.2f}{tag}')
def _occl(cam, look, fov, pts):
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
# ---- the set: a lens stays out of the car, the pump island, the diner, the booth, the trailer and the poles ----
def car_box(cx, cz): return (cx - 2.05, cx + 2.05, cz - 1.05, cz + 1.05, 0.98)
SET = [(-0.5, 2.6, -1.75, -0.75, 2.1), (-10.6, -1.9, -8.7, -3.7, 3.7), (3.8, 4.8, -3.7, -2.7, 2.2), (4.8, 11.6, -7.6, -5.2, 2.7), (-7.3, -5.9, -3.4, -2.0, 2.6)]
POLES = [(-1.35, -4.45), (5.65, -2.4), (6.75, -2.4)]
def free(c, m, carpos=CP):
    x, y, z = c
    if m == 'road':
        x0, x1, z0, z1, top = car_box(0, 0)
        return not (x0 < x < x1 and z0 < z < z1 and y < top) and 0.15 < y < 12
    boxes = SET + ([car_box(*carpos)] if carpos else [])
    if any(x0 < x < x1 and z0 < z < z1 and y < top for x0, x1, z0, z1, top in boxes): return False
    if any(math.hypot(x - px, z - pz) < 0.3 for px, pz in POLES): return False
    return 0.12 < y < 12
def lens(v, k=0):
    c, f = v; a = math.radians(c['ang'][k]); fy = f[2] if len(f) > 2 else 0
    return (f[0] + math.sin(a) * c['r'][k], c['h'][k] + fy, f[1] + math.cos(a) * c['r'][k])
PIECES = [(px_, py_, -1.25, pr) for px_ in (-0.45, 1.65) for py_, pr in ((2.0, 0.22), (1.5, 0.34), (0.95, 0.34))]   # the pumps: globe, rounded top, body (x, y, z, radius)
def behind(beat, cam, look, fov, actors, end, W, m):
    if m != 'station': return
    for a in actors:
        if a.get('fg') or a.get('lying') or a.get('away'): continue
        who, x, z, fy, hy = body(a, end)
        hc = (x, (fy + hy) / 2, z); ph = _proj(cam, look, fov, hc); dh = math.dist(cam, hc)
        if not ph: continue
        for px_, py_, pz_, pr in PIECES:
            q = (px_, py_, pz_); dq = math.dist(cam, q)
            if dq < dh + 0.3: continue
            pq = _proj(cam, look, fov, q)
            if not pq: continue
            r_px = (RAD[who] / dh + pr / dq) / (2 * math.tan(math.radians(fov) / 2)) * 1920 * 0.8
            if math.hypot((pq[0] - ph[0]) * 1080, (pq[1] - ph[1]) * 1920) < r_px: W.append(f'b{beat}: a pump behind {who}\'s head{" at the end" if end else ""}'); break
def problems(beat, b1, actors, v, m, W, carpos=CP):
    c, focus = v; fy = focus[2] if len(focus) > 2 else 0
    for k, end in ((0, 0), (-1, 1)):
        cam, look = lens(v, k), (focus[0], c['look'][k] + fy, focus[1])
        check(beat, b1, cam, look, c['fov'], actors, end, W)
        behind(beat, cam, look, c['fov'], actors, end, W, m)
        for oc in _occl(cam, look, c['fov'], [body(a, end)[:4] for a in actors if not a.get('lying') and not a.get('fg') and not a.get('away')]):
            W.append(f'b{beat}: {oc}{" at the end" if end else ""}')
        if not free(cam, m, carpos): W.append(f'b{beat}: lens inside the set{" at the end" if end else ""} {tuple(round(q, 2) for q in cam)}')
    return W
shots = []; REV = []
def add(beat, b1, actors, lyric, v, m='station', rv=None, carpos=CP, **o):
    c, focus = v
    o = {k: val for k, val in o.items() if val is not None}
    REV.append(round(beat * PER + (rv if rv is not None else 0.6 * (b1 - beat) * PER), 2))
    shots.append({'beat': beat, 'kind': 'dance', 'map': 'mojave' if m == 'station' else 'mojaveroad', 'actors': actors, 'lyric': lyric, 'cam': c, 'focus': focus, **o})
    problems(beat, b1, actors, v, m, WARN, carpos)
def solve(beat, b1, actors, look, ang, dist, h, fov=50, m='station', push=0.08, dang=30, rng=(0.8, 1.6), dh=0.3, carpos=CP, **kw):
    best = None
    for da in (0, -5, 5, -10, 10, -15, 15, -20, 20, -25, 25, -30, 30, -40, 40):
        if abs(da) > dang: continue
        for dk in (1.0, 1.1, 0.92, 1.2, 1.3, 1.45, 1.6, 0.85, 0.8):
            if not rng[0] <= dk <= rng[1]: continue
            for dhh in (0, 0.15, -0.15, 0.3, -0.3):
                if abs(dhh) > dh: continue
                a = math.radians(ang + da); d = dist * dk
                p0 = (look[0] + math.sin(a) * d, h + dhh, look[2] + math.cos(a) * d)
                p1 = (look[0] + math.sin(a) * d * (1 - push), h + dhh, look[2] + math.cos(a) * d * (1 - push))
                v = view(p0, look, fov, p1=p1, **kw)
                n = len(problems(beat, b1, actors, v, m, [], carpos))
                score = n * 1000 + abs(da) + abs(dk - 1) * 40 + abs(dhh) * 20
                if best is None or score < best[0]: best = (score, v)
                if n == 0 and score < 1: return v
    return best[1]
def clean(actors):
    for a in actors:
        for k in ('lying', 'away'): a.pop(k, None)
    return actors
LOCALS = dict(pets='stare', stare=[CP[0], CP[1]])

# =====================================================================================================================
# THE COLD OPEN (the intro riff, b0..8): the dog drives the roadster down the desert highway at sunset, in Kob's shades,
# Sadi beside him in love
# S00 (b0..4): low in front of the car, pushing in on the two faces over the bonnet
s00 = [drive('saxo', DRV_R, shades=True, tongue=True, hop=[0.03, 1], air=True), sit('sadi', PAS_R, arm='both', aim='heart', upAt=-1)]
v = view((4.8, 1.75, 0.5), (-0.2, 1.02, 0.0), fov=40, p1=(4.4, 1.72, 0.46), roll=(-6, -3))
add(0, 4, s00, "the cold open: on the desert highway at sunset the dog drives the green roadster in Kob's shades, tongue out, bobbing to the riff; Sadi beside him, her paw on her heart", v, m='road', rv=0.9)
# S01 (b4..8): a three-quarter from the roadside ahead, the poles whipping past, both of them
s01 = [drive('saxo', DRV_R, shades=True, tongue=True, hop=[0.03, 1], air=True), sit('sadi', PAS_R, arm='both', aim='heart', upAt=-1)]
v = view((3.6, 1.45, 3.4), (-0.2, 1.05, 0.0), fov=50, p1=(3.4, 1.4, 3.1), roll=(5, 3))
add(4, 8, s01, "the riff: the roadster eats the desert highway, the dog at the wheel, Sadi in love", v, m='road', hearts=[[-0.18, 1.75, 0.5, 0.2, 1]], heartYaw=45)

# =====================================================================================================================
# VERSE 1 (b8..52): earlier, at the gas station
# S02 (b8..16; 'welcome'): the gas station under the EAT sign: Kob drives the roadster in and stops at the red pumps, the dog
# beside her, tongue out; Compote the pump attendant beckons them in
X0 = 5.6
COMP_IN = (-2.2, -0.15)
COMP_IN = (-2.05, -0.2)
s02 = [drive('kob', (DRV[0] + X0 - CP[0], DRV[1]), mx=round(CP[0] - X0, 3), shades=True, reveal=3.5), sit('saxo', (PAS[0] + X0 - CP[0], PAS[1]), mx=round(CP[0] - X0, 3), tongue=True, reveal=3.5),
       A('compote', 'happy_idle', COMP_IN[0], COMP_IN[1], yaw=-4, at=0.4, speed=0.4, arm='R', aim='maneki')]
v = solve(8, 16, s02, (-0.9, 1.0, 0.45), -45, 5.4, 1.6, fov=54, push=0.04, dang=40)
add(8, 16, s02, "'welcome': the gas station in the desert, its red pumps under the EAT sign: Kob drives the green roadster in, the dog beside her, tongue out; Compote the pump attendant beckons them in", v,
    car={'x': X0, 'z': CP[1], 'to': [CP[0], CP[1]], 'at': 0, 'dur': S(16, 8), 'lin': True}, **LOCALS, rv=3.7)
# S03 (b16..24; 'back'): she climbs out and walks off along the car to the pump, her back to him; he watches her go
K_OUT = (DRV[0] - 0.1, DRV[1] + 0.75); K_REAR = (2.7, DRV[1] + 0.8)
s03 = [sit('saxo', yaw=58), A('kob', 'happy_walk', K_OUT[0], K_OUT[1], mx=round(K_REAR[0] - K_OUT[0], 3), mz=round(K_REAR[1] - K_OUT[1], 3), yaw=yaw_to(K_OUT, K_REAR), speed=1.2, shades=True)]
v = solve(16, 24, s03, (1.6, 1.0, 1.8), 70, 4.0, 1.45, fov=52, push=0.05, dang=30)
add(16, 24, s03, "'there's no turning back': Kob climbs out to fill up and walks off along the car, her back to him; the dog watches her go from his seat", v, **LOCALS)
# S04 (b24..28; 'sleep'): she glances back: the dog is asleep under his travel mask, chin up
s04 = [sit('saxo', sleep=True, **GOOD)]
v = solve(24, 28, s04, (PAS[0], 1.14, PAS[1]), -100, 2.6, 1.36, fov=46, push=0.05)
add(24, 28, s04, "'even while we sleep': she glances back: the dog is fast asleep under a travel mask, an angel", v, pets=False)
# S05 (b28..32): her deadpan at the back of the car, nozzle in paw, her shades on: she doesn't buy it
KOB_D = dict(clip='happy_idle', at=0.4, speed=0.1, hold='nozzle', cable=HOSE, arm='R', aim=[0.25, -0.05, 0.75], upAt=-1)
s05 = [A('kob', x=KOB_FILL[0], z=KOB_FILL[1], yaw=10, shades=True, **KOB_D)]
v = solve(28, 32, s05, (KOB_FILL[0], 1.16, KOB_FILL[1]), 25, 2.3, 1.3, fov=44, push=0.05)
add(28, 32, s05, "her deadpan from the pump, the nozzle in her paw: she doesn't buy it", v, nozzle=[1], pets=False)
# S06 (b32..36; 'find'): she takes her shades off: found you (he's still 'asleep')
s06 = [A('kob', x=KOB_FILL[0], z=KOB_FILL[1], yaw=10, shades={'at': -1, 'off': 0.35}, **KOB_D)]
v = solve(32, 36, s06, (KOB_FILL[0], 1.2, KOB_FILL[1]), 5, 2.0, 1.3, fov=40, push=0.05)
add(32, 36, s06, "'we will find you': she takes her shades off and stares", v, nozzle=[1], pets=False, rv=0.95)
# S07 (b36..44; 'best behaviour'): the dog, mask off, sitting bolt upright, paws on his knees, chest out: the good boy
s07 = [sit('saxo', **GOOD)]
v = solve(36, 44, s07, (PAS[0], 1.14, PAS[1]), -75, 2.9, 1.5, fov=44, push=0.05)
add(36, 44, s07, "'acting on your best behaviour': the dog sits bolt upright, paws on his knees, chest out: the good boy", v, pets=False)
# ---- the creep lens (the critic: Kob and the dog were never in one frame, so the gag only came together across cuts):
# one lens in front of the car's nose, Kob in the foreground with her back to her car, oblivious, the dog behind her:
# the same frame before and after he takes her seat, her shades landing on his nose, and later the horn behind her
LENS_C = (-4.7, 2.5, -0.6); LOOK_C = (-0.3, 0.9, 0.95)
_dc = (LOOK_C[0] - LENS_C[0], LOOK_C[2] - LENS_C[2]); _n = math.hypot(*_dc); _dc = (_dc[0] / _n, _dc[1] / _n); _rc = (-_dc[1], _dc[0])
KOB_FRONT = (LENS_C[0] + 2.6 * _dc[0] - 0.3 * _rc[0], LENS_C[2] + 2.6 * _dc[1] - 0.3 * _rc[1])
KOB_FY = yaw_to(KOB_FRONT, (LENS_C[0], LENS_C[2]))
def creep_v(): return view(LENS_C, LOOK_C, fov=54, p1=(LENS_C[0] + 0.12 * _dc[0], LENS_C[1], LENS_C[2] + 0.12 * _dc[1]))
KOB_OBL = dict(clip='happy_idle', at=0.4, speed=0.1)
# S08 (b44..48; 'turn your back'): she has turned her back on the car and stands in front of it, deadpan; behind her the
# dog sits in his own seat, the good boy
s08 = [A('kob', x=KOB_FRONT[0], z=KOB_FRONT[1], yaw=KOB_FY, **KOB_OBL), sit('saxo', **GOOD)]
add(44, 48, s08, "'turn your back': she turns her back on her car; behind her the dog sits in his own seat, the good boy", creep_v(), pets=False)
# S09 (b48..52; 'mother nature'): the same frame: she hasn't moved, and behind her the dog is in her seat, paws on the wheel
s09 = [A('kob', x=KOB_FRONT[0], z=KOB_FRONT[1], yaw=KOB_FY, **KOB_OBL), drive('saxo', speed=0, at=0.4)]
add(48, 52, s09, "'mother nature': the same frame: she hasn't moved, and behind her the dog is in her seat, paws on the wheel (the dog in the driver's seat)", creep_v(), pets=False)
# S10 (b52..56; 'everybody wants to rule'): the same frame: her shades drop onto his nose; he bobs at the wheel behind her
s10 = [A('kob', x=KOB_FRONT[0], z=KOB_FRONT[1], yaw=KOB_FY, **KOB_OBL), drive('saxo', shades=0.0, tongue=True, hop=[0.03, 1], air=True)]
add(52, 56, s10, "'everybody wants to rule the world': the same frame: her shades drop onto his nose and he bobs at the wheel right behind her back", creep_v(), pets=False)
# S11 (b56..60): she turns round: the deadpan, from beside the car
s11 = [A('kob', x=KOB_FRONT[0], z=KOB_FRONT[1], yaw=yaw_to(KOB_FRONT, DRV), **KOB_OBL)]
v = view((DRV[0] - 0.2, 1.3, DRV[1] - 0.05), (KOB_FRONT[0], 1.02, KOB_FRONT[1]), fov=40, p1=(DRV[0] - 0.3, 1.3, DRV[1] - 0.08))
add(56, 60, s11, "she turns round and stares straight at him: the deadpan (his point of view from her seat)", v, pets=False, noTable=True)
# S12 (b60..64; 'world'): he's back in his own seat on his best behaviour, still wearing her shades
s12 = [sit('saxo', shades=True, **GOOD)]
v = solve(60, 64, s12, (PAS[0], 1.14, PAS[1]), -118, 2.7, 1.42, fov=46, push=0.05, dang=20)
add(60, 64, s12, "'the world': he's back in his own seat on his best behaviour, still wearing her shades", v, pets=False)

# =====================================================================================================================
# THE RIFF BREAK (b64..80): the cat's secret pump dance with Compote; the dog joins; she strolls into the diner
DC = (3.45, -0.95); DU = (math.sin(math.radians(55)), math.cos(math.radians(55))); DP = (DU[1], -DU[0])
PD_K = (DC[0] + 0.55 * DP[0], DC[1] + 0.55 * DP[1]); PD_C = (DC[0] - 0.55 * DP[0], DC[1] - 0.55 * DP[1]); PD_S = (DC[0] + 1.25 * DP[0], DC[1] + 1.25 * DP[1])
def dancer(who, at_rv, m, **o): return A(who, 'charleston', m[0], m[1], yaw=55, at=kick_at(at_rv), speed=1, **o)
# S13 (b64..68): Kob and Compote do the clip's pump dance in sync beside the red pumps, deadpan
s13 = [dancer('kob', S(66.4, 64), PD_K), dancer('compote', S(66.4, 64), PD_C)]
v = solve(64, 68, s13, (DC[0], 0.95, DC[1]), 55, 4.4, 1.15, fov=50, push=0.07, carpos=None)
add(64, 68, s13, "the riff: the cat's secret: Kob and Compote do the clip's pump dance in sync beside the red pumps, deadpan", v, **LOCALS)
# S14 (b68..72): a low dolly in on the two, dutch (the ratoshi lens)
s14 = [dancer('kob', S(70.4, 68) + S(68, 64), PD_K), dancer('compote', S(70.4, 68) + S(68, 64), PD_C)]
v = view((DC[0] + DU[0] * 3.0 + DP[0] * 0.3, 0.25, DC[1] + DU[1] * 3.0 + DP[1] * 0.3), (DC[0], 0.85, DC[1]), fov=62, p1=(DC[0] + DU[0] * 2.3 + DP[0] * 0.3, 0.25, DC[1] + DU[1] * 2.3 + DP[1] * 0.3), roll=(-9, -6))
add(68, 72, s14, "low and dutch on the two, kicking in sync", v, **LOCALS)
# S15 (b72..76): the dog joins in, in her shades: three dancers at the pumps
s15 = [dancer('saxo', S(74.4, 72), PD_S, shades=True), dancer('kob', S(74.4, 72) + S(72, 64), PD_K), dancer('compote', S(74.4, 72) + S(72, 64), PD_C)]
C15 = (DC[0] + 0.35 * DP[0], DC[1] + 0.35 * DP[1])
v = view((C15[0] + DU[0] * 4.6, 0.95, C15[1] + DU[1] * 4.6), (C15[0], 0.85, C15[1]), fov=58, p1=(C15[0] + DU[0] * 4.4, 0.95, C15[1] + DU[1] * 4.4))
add(72, 76, s15, "he hops out and joins in: three dancers at the pumps", v, **LOCALS, clear=[[4.3, -2.6, 0.9]])
# S16 (b76..80): she strolls off to the diner, her back to the car again; Sadi the waitress holds its door open
K_GO = (-1.0, -2.3); K_DOOR = (DOOR[0] + 0.4, DOOR[1] + 0.55)
s16 = [A('kob', 'happy_walk', K_GO[0], K_GO[1], mx=round(K_DOOR[0] - K_GO[0], 3), mz=round(K_DOOR[1] - K_GO[1], 3), yaw=yaw_to(K_GO, K_DOOR), speed=1.3),
]
v = view((-1.45, 3.1, 3.7), (-2.25, 0.95, -2.9), fov=52, p1=(-1.45, 3.05, 3.45))
add(76, 80, s16, "she strolls into the diner, her back to the car again", v, dinerDoor=1, **LOCALS)

# =====================================================================================================================
# VERSE 2 (b80..124): the dog at the wheel again, a bit further each time, until he drives off with it
# S17 (b80..84; 'own design') [the creep lens, the critic's note]: the dog's at the wheel again, in her shades, leaning on
# the horn: orange rings burst out of the grille at the lens, where she stood
s17 = [drive('saxo', shades=True, bump=0.05, air=True)]
add(80, 84, s17, "'it's my own design': the same frame, her spot empty: the dog's at the wheel again in her shades, leaning on the horn: rings of sound burst out of the grille", creep_v(), honk=True, honkYaw=-118, pets=False)
# S18 (b84..88): Sadi in the diner's door melts: a paw on her heart, hearts
SADI_D = (DOOR[0] + 1.05, DOOR[1] + 0.5)
s18 = [A('sadi', 'happy_idle', SADI_D[0], SADI_D[1], yaw=yaw_to(SADI_D, DRV), at=0.3, speed=0.3, arm='R', aim='heart', upAt=-1)]
v = solve(84, 88, s18, (SADI_D[0], 1.12, SADI_D[1]), yaw_to(SADI_D, DRV), 2.4, 1.25, fov=44, push=0.05, dang=25)
add(84, 88, s18, "Sadi the waitress, in the diner's door, melts for the dog in shades", v, hearts=[[SADI_D[0], 1.48, SADI_D[1], 0.15, 1]], heartYaw=yaw_to(SADI_D, DRV), pets=False)
# S19 (b88..92; 'own') [fallback after three loops: the squeegee standoff over the windscreen never read (the prop end-on
# through her face); the beat is now her glare as a frontal deadpan from his seat, the proven insert]: Compote, the
# attendant, glares at him from in front of the car, her squeegee at her side
COMP_G = (-2.45, DRV[1] - 0.05)
s19 = [A('compote', 'happy_idle', COMP_G[0], COMP_G[1], yaw=90, at=0.3, speed=0.1, hold='squeegee', arm='R', aim=[0.4, -0.35, 0.25], upAt=-1)]
v = view((-0.35, 1.2, COMP_G[1] + 0.05), (COMP_G[0], 1.14, COMP_G[1]), fov=44, p1=(-0.45, 1.2, COMP_G[1] + 0.05))
add(88, 92, s19, "'my own': Compote the attendant glares at him from in front of the car, her squeegee at her side (his point of view)", v, pets=False)
# S19b (b92..96) [the S10 lens, passed]: he licks his chops at the wheel in her shades, unbothered
s19b = [drive('saxo', shades=True, tongue=True)]
v = solve(92, 96, s19b, (DRV[0] - 0.1, 1.08, DRV[1]), -50, 2.5, 1.35, fov=46, push=0.07, roll=(-5, -3))
add(92, 96, s19b, "he sits at the wheel in her shades, tongue out, unbothered", v, pets=False)
# S20 (b96..104; 'decide, help') [fallback after three loops: the road map never read (it hid his face or went through it);
# the S09 lens, passed]: at the wheel he tilts his head side to side: which way?
s20 = [drive('saxo', shades=True)]
v = solve(96, 104, s20, (DRV[0] - 0.1, 1.05, DRV[1]), -28, 2.6, 1.36, fov=44, push=0.05)
add(96, 104, s20, "'help me to decide': side on at the wheel, paws on it, in her shades: where to?", v, pets=False)
# S21 (b104..108; 'help'): Sadi hops into the seat beside him, hearts
s21 = [drive('saxo', shades=True), sit('sadi', arm='R', aim='heart', upAt=-1)]
v = solve(104, 108, s21, (CP[0] + 0.18, 1.08, CP[1]), -92, 3.5, 1.5, fov=50, push=0.05, dang=15)
add(104, 108, s21, "'help me': Sadi hops into the seat beside him, in love", v, hearts=[[PAS[0], 1.68, PAS[1], 0.1, 1]], heartYaw=-90, pets=False)
# S22 (b108..112; 'freedom'): the engine roars: exhaust, the car shaking, his paws up, tongue out
s22 = [drive('saxo', shades=True, tongue=True, arm='both', aim='rave', flapEvery=1000, flapPh=90, upAt=-1), sit('sadi', arm='R', aim='heart', upAt=-1)]
v = solve(108, 112, s22, (CP[0] + 0.3, 1.12, CP[1]), -75, 4.2, 1.2, fov=52, push=0.07, roll=(-6, -3), dang=25)
add(108, 112, s22, "'freedom': the engine on, the car shaking, he throws his paws up at the wheel, tongue out", v, rumble=True, exhaust=True, pets=False)
# S23 (b112..116; 'pleasure') [fallback after four loops: every drive-off at the pumps read as a parked car (pumps behind
# the heads like hats, the dust a patch); the road three-quarter that passed every loop (S01's lens) instead: a hard cut
# from 'freedom' to the open road]: the dog drives Kob's roadster down the highway, Sadi beside him in love
s23 = [drive('saxo', DRV_R, shades=True, tongue=True, hop=[0.03, 1], air=True), sit('sadi', PAS_R, arm='both', aim='heart', upAt=-1)]
v = view((3.6, 1.45, 3.4), (-0.2, 1.05, 0.0), fov=50, p1=(3.4, 1.4, 3.1), roll=(5, 3))
add(112, 116, s23, "'pleasure': cut to the open road: the dog drives Kob's roadster down the desert highway, Sadi beside him in love", v, m='road', hearts=[[-0.18, 1.75, 0.5, 0.2, 1]], heartYaw=45)
# S24 (b116..120; 'nothing ever lasts forever'): Kob comes out of the diner with her milk: her car's gone, the dust settling
KOB_OUT = (DOOR[0] + 0.45, DOOR[1] + 1.9); BAY_L = (KOB_OUT[0] + 0.35 * (CP[0] - KOB_OUT[0]), KOB_OUT[1] + 0.35 * (CP[1] - KOB_OUT[1]))
s24 = [A('kob', 'happy_idle', KOB_OUT[0], KOB_OUT[1], yaw=-80, at=0.4, speed=0.1, holdL='milkbottle', arm='L', aim=[0.62, -0.2, 0.3], upAt=-1, holdScale=1.3)]
_d = ((CP[0] - KOB_OUT[0]) / math.dist(CP, KOB_OUT), (CP[1] - KOB_OUT[1]) / math.dist(CP, KOB_OUT)); _r = (-_d[1], _d[0])
_L = (KOB_OUT[0] - 2.1 * _d[0] + 0.15 * _r[0], KOB_OUT[1] - 2.1 * _d[1] + 0.15 * _r[1])
v = view((_L[0], 1.5, _L[1]), (_L[0] + 4.0 * _d[0], 0.95, _L[1] + 4.0 * _d[1]), fov=54, p1=(_L[0] + 0.1 * _d[0], 1.49, _L[1] + 0.1 * _d[1]))
add(116, 124, s24, "'nothing ever lasts forever': Kob comes out of the diner with her milk: her car's gone, only dust", v, car=False, dust=[[x, z, t0, 1.3] for t0 in (-0.6, 0.5, 1.5, 2.4, 3.3) for x, z in ((0.3, 0.9), (1.7, 1.1))], dinerDoor=0, pets='stare', stare=[0.4, 0.95])
# S25 (b120..124) [dropped after three loops: the thrown squeegee hovered over Compote like a mallet in every staging; S24
# holds Kob's deadpan over the dust instead]

# =====================================================================================================================
# REFRAIN 2 (b124..133) and the button: into the sunset; Kob alone
# S26 (b124..128; 'everybody wants to rule'): the cold open's lens: the dog drives into the sunset with Sadi
s26 = [drive('saxo', DRV_R, shades=True, tongue=True, hop=[0.03, 1], air=True), sit('sadi', PAS_R, arm='both', aim='heart', upAt=-1)]
v = view((4.8, 1.75, 0.5), (-0.2, 1.02, 0.0), fov=40, p1=(4.4, 1.72, 0.46), roll=(-6, -3))
add(124, 128, s26, "'everybody wants to rule the world': the dog drives the green roadster into the sunset with Sadi", v, m='road')
# S27 (b128..130; 'the world'): high behind: the roadster small on the long highway into the sun
s27 = [drive('saxo', DRV_R, shades=True, fg=True), sit('sadi', PAS_R, fg=True)]
v = view((-6.5, 3.4, 1.4), (6.0, 0.6, -0.6), fov=50, p1=(-7.0, 3.6, 1.5))
add(128, 130, s27, "'the world': from high behind, the roadster on the long highway into the sun", v, m='road', speed=16)
# S28 (b130..134, the refrain's last word, then silence) [the critic's twist, on the passed creep lens]: the same fixed
# frame as the creeps: the car is back at the pump (she never filled the tank), the dog bolt upright in his own seat on
# his best behaviour, still in her shades, Sadi in the driver's seat beside him; Kob in front with her milk, deadpan
s28 = [A('kob', x=KOB_FRONT[0], z=KOB_FRONT[1], yaw=KOB_FY, clip='happy_idle', at=0.4, speed=0.1, holdL='milkbottle', arm='L', aim=[0.62, -0.2, 0.3], upAt=-1, holdScale=1.3),
       sit('saxo', shades=True, **GOOD), sit('sadi', DRV, arm='R', aim='heart', upAt=-1)]
add(130, 134, s28, "the button: the same frame as the creeps: the car is back at the pump, out of fuel; the dog sits bolt upright in his own seat on his best behaviour, still in her shades, Sadi beside him; Kob in front with her milk, deadpan", creep_v(), pets=False, still=True)

for s in shots:
    clean(s['actors'])
shots.sort(key=lambda x: x['beat'])
ep = {
    'date': '2026-10-12', 'song': {'title': 'Everybody Wants To Rule The World', 'artist': 'Tears For Fears'},
    'logline': "Every time Kob turns her back on her green roadster at a desert gas station, the dog is in the driver's seat, a little further each time, until he drives off into the sunset with it.",
    'new': "src/maps44.js: mojave (a desert gas station on a golden afternoon: red vintage pumps on an island, a diner under an EAT sign with a door that opens, a price board, a phone booth, an Airstream trailer, a parked semi, palms, Joshua trees, saguaros, telephone poles, mountains; the green 1960s roadster (wire wheels, chrome headlamps, a low windscreen, the wheel under the driving clip's paws) parked or rolling with its riders, its engine shaking, exhaust puffs, a dust trail; box-pet locals) and mojaveroad (the desert highway at sunset streaming past the still roadster, its headlights on); props nozzle (with its black hose to the pump), squeegee and roadmap; looks saxo polo, kob zigzag and sadi waitress; the structure USURPER",
    'notes': "The world, from the official video (contact sheets): a dark green 1960s British roadster through the California desert, a roadside gas station with a red pump where two men in tuxedos dance, a diner under an EAT sign, a phone booth, an Airstream trailer, palms and telephone poles, the drive into a pink-orange sunset with the headlights on; the singer in a salmon-pink polo shirt, the driver in a black-and-white zig-zag jacket and dark glasses. Our version: the title taken the way a dog takes a car: everybody wants the driver's seat, and the dog in the driver's seat when the owner comes back is every dog owner's photo. The words, from whitelisted keywords per line: 'welcome', 'back', 'sleep', 'find', 'best behaviour', 'turn your back', 'mother nature', the title on each refrain, 'own design', 'decide', 'help', 'freedom', 'pleasure', 'nothing ever lasts forever'. Cast: Saxo in the singer's pink polo (the dog who wants to drive), Kob the roadster's owner in the driver's zig-zag jacket (deadpan; she secretly dances the clip's pump dance; she loses the car for once), Compote the pump attendant in her black bouncer suit (the clip's tuxedoed pump dancers; furious, she throws her squeegee after them), Sadi the diner's waitress (the romance: she rides off with him).",
    'yt': 'end',
    'tiktok_sound': '6927235393519618049',
    'with': ['sadi', 'kob', 'compote'],
    'clips': sorted({a['clip'] for s in shots for a in s['actors']}),
    'tags': {'structure': 'usurper', 'scenes': ['the cold open: the dog driving into the sunset', 'the arrival at the gas station', 'the fake sleep', 'the deadpan over the shades', 'the good boy sit', "the dog in the driver's seat", 'the shades drop', 'caught in her shades', 'the pump dance', 'the honk', 'the windscreen glare', 'the road map', 'the engine roars', 'the drive-off', 'the thrown squeegee', 'the cat left in the dust'],
             'cast': ['saxo', 'sadi', 'kob', 'compote'], 'hook': 'action', 'maps': ['mojave', 'mojaveroad'], 'ref': 'twin-trend',
             'lyric_literal': "'turn your back' (every time Kob turns her back, the dog takes her seat), 'acting on your best behaviour' (the good-boy sit whenever she looks), 'even while we sleep' (his fake sleep under a travel mask), 'help me to decide' (the road map), 'freedom' (the engine roars, paws up), 'nothing ever lasts forever' (her car's gone), the title on each refrain (the dog rules the road)",
             'experiment': "Does the most-shared dog-owner photo there is (the dog in the driver's seat the moment you leave the car) as the running gag, with its payoff (he really drives off) as the cold open, get more views and likes per view on Facebook and Instagram than our last three episodes (Facebook ~200, Instagram ~140)?"},
    'shots': shots,
}
json.dump(ep, open(os.path.join(HERE, '2026-10-12-2.json'), 'w'), indent=1, ensure_ascii=False)
os.makedirs(os.path.join(HERE, '..', 'out', 'check'), exist_ok=True)
open(os.path.join(HERE, '..', 'out', 'check', 'ewtrtw_rev_times.txt'), 'w').write(','.join(f'{t:.2f}' for t in REV))
print(len(shots), 'shots;', len(WARN), 'warnings')
for w in WARN: print('  ', w)
