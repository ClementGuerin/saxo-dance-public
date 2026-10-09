# make_2026-10-09-2.py: writes episodes/2026-10-09-2.json, "Espresso" (Sabrina Carpenter, 2024; the queue being empty: a
# chart hit climbing again, +15 places and +39.5k streams a day on Spotify's global chart, its TikTok sound 527k videos).
# The world (the official video, looked at as contact sheets every 3 s; nothing violent in it): a 1960s Italian lake in
# warm film colours: a varnished wooden speedboat, a beach club of green-and-white striped umbrellas and orange loungers,
# the singer in cat-eye sunglasses and a pink silk headscarf, men fawning, a lifeguard tower with an ESPRESSO visor, a
# dance on the shore at sunset, and a white police car with a red light: she's arrested and rides in the back, feet up.
# The words (whitelisted single words per line, never the lines): move, up, down, left, right, switch, nintendo, sleep,
# espresso, night, sweet, guess, desperation, vacation, calling, ex, dream, skin, perfumed, mountain, dew, morning,
# coffee, brewed, touch.
# Ours, "the espresso that kept the town up" (ESCALATION: 1 → 2 → 8 → the whole lakefront, one cup at a time; the cat
# last): 3 a.m. on a little Italian lakefront. Saxo, in the singer's look (a platinum wig, a pink headscarf, cat-eye
# sunglasses, a mint 60s dress and an apron), runs the espresso bar and dances alone, the song's up, down, left and
# right on the words. Across the piazza Kob, in an old nightgown and nightcap, can't sleep. Sadi stomps down in her
# nightie to complain: one espresso and her eyes go googly, she dances. The neighbours lean out yelling, come down in
# pyjamas and nightcaps: a tray of espressos, googly eyes, dancing. Kob phones the police: Compote rolls up in the
# clip's white police car, red light flashing, and marches to the bar with a ticket; he brews her a morning coffee,
# googly eyes, and she dances on the police car's roof. The whole lakefront dances; Kob covers her ears, then storms out
# with her milk bottle; the town does the song's up, down, left, right behind her deadpan; on 'switch' he swaps her
# milk for an espresso; she sips without looking: googly eyes on 'can't sleep', and the cat who never dances leaps onto
# the counter and outdances them all. The button: the dog asleep in the cat's bed, her sleep mask on, the party below.
# Beats: 103.9993 BPM, kit beat b at b * 0.576927 s (kit beat 0 = song bar 8's downbeat).
# Sections (kit beats): chorus 1's second half b0-16 (K00 b1.06, K01 b5.13, K02 b8.97, K03 b13.3); verse 1 b16-47.5 (K04
# b16.5 .. K09 b45.5); pre-chorus b48-78.8 (K10 b48.6 .. K15 b71.8); chorus 2 b78.8-113 (K16 b78.8 .. K23 b109.3); tag
# b113.5-120 (K24, K25).
# Key words (kit beats): move b1.18, up b1.73, down b2.77, left b3.36, right b4.26 | switch b5.13, up b5.76, nintendo
# b6.48 | sleep b10.23 | espresso b14.87 | desperation b22.1 | vacation b30.7 | calling b39.0 | ex b49.9 | dream b54.0 |
# skin b57.2, perfumed b58.4 | morning b69.1, coffee b69.75, brewed b70.65 | touch b73.3 | night b83.65 | sweet b86.1,
# guess b87.1 | sleep b90.2 | espresso b94.8 | move b97.1, up b97.76, down b98.59, left b99.35, right b100.26 | switch
# b101.0, up b101.75, nintendo b102.47 | sleep b106.18 | espresso b111.2 | sweet b118.0, guess b119.0.
# The lyrics stay in episodes/2026-10-09-2.lyrics.js (the generator reads only their times).
import json, math, os, re, sys
sys.path.insert(0, os.path.dirname(__file__))
from cam import view, vpath, swoop

HERE = os.path.dirname(__file__)
PER = 60 / 103.9993
def T(b): return b * PER
def Bt(t): return t / PER
def S(b, b0): return round((b - b0) * PER, 3)    # seconds from shot beat b0 to beat b

LOOK = {'saxo': 'riviera', 'sadi': 'nightie', 'kob': 'nightgown', 'compote': 'cop'}
HEAD = {'saxo': 1.42, 'sadi': 1.36, 'kob': 1.46, 'compote': 1.46}        # the top of each head standing (the wig and scarf, the nightcap, the cap)
FACE = {'saxo': 0.9, 'sadi': 0.84, 'kob': 0.86, 'compote': 0.86}
RAD = {'saxo': 0.5, 'sadi': 0.43, 'kob': 0.42, 'compote': 0.4}
SIT = 0.4                                                                 # sitting: the face drops ~0.4 m

# ---- the map (src/maps38.js, PIAZZA) ----
LAKE_Z, FACADE_Z = -4.6, 5.0
COUNTER_Y, COUNTER_Z = 0.84, -0.3                # the counter's top and its front face
DECK = 0.32; BAR = (0.0, -1.3)                   # the barista's duckboard and his mark behind the counter
MACHINE = (-0.74, -0.56)
KOB_WIN = (-0.8, 0.8, 3.0, 4.3)
ROOM_Y, BED_Y = 2.6, 3.08; KOB_BED = (0.0, 8.75); BED_LIFT = BED_Y - 0.08
KOB_DOOR, SADI_DOOR = (-2.0, 5.0), (6.0, 5.0)
CAR = (-4.4, 2.45); CAR_BOX = (-6.3, -2.5, 1.6, 3.3, 1.4)
DRIVER, SEAT_Y = (-0.05, -0.38), 0.45                  # the open-topped car's driver's mark (car frame, nose to +x) and seat
BONNET = (1.3, 0.75); BEACON = (-0.62, 1.32, 0.45)      # the bonnet's middle and top; the red light on its post (car frame x, y, z)
SPOTS = [[-3.0, 1.6], [3.0, 1.8], [-5.2, -0.4], [5.0, -0.6], [-2.2, -3.2], [2.4, -3.3], [-6.8, 1.4], [6.8, 1.2], [-4.4, -2.6], [4.6, -2.4],
         [-8.4, -0.8], [8.6, -0.6], [-1.8, 3.4], [2.2, 3.5], [-9.8, 2.2], [9.6, 2.4], [-6.0, 3.6], [-10.6, -2.8], [10.4, -2.6], [-12.0, 0.6], [12.2, 0.8], [0.8, 2.6], [-0.8, 2.4], [6.2, 3.4]]
NPET = len(SPOTS)

def A(who, clip, x, z, **o):
    return {'who': who, 'look': o.pop('look', LOOK[who]), 'clip': clip, 'x': round(x, 3), 'z': round(z, 3), 'face': o.pop('face', 'world'),
            'yaw': o.pop('yaw', 0), 'at': o.pop('at', 'auto'), **o}
def yaw_to(frm, to): return round(math.degrees(math.atan2(to[0] - frm[0], to[1] - frm[1])), 1)
# the song's up, down, left, right (body frame: x out on that arm's side, y up, z forward); left/right: [aimL, aimR]
UP, DOWN = 'up', [0.38, -0.88, 0.3]
LEFT, RIGHT = ([0.85, 0.5, 0.12], [0.45, -0.6, 0.45]), ([0.45, -0.6, 0.45], [0.85, 0.5, 0.12])   # the disco point to that side: a raised paw hid behind his head, an arm across the body ended under his muzzle   # one arm out to that side, the other up: an arm across the body ended under his muzzle (a chin-on-paw read)
DISCO = ([0.8, 0.55, 0.2], [0.4, -0.55, 0.5])                                                     # frame 1: the disco point, not paws at his sides
def moves(b0, words=(1.73, 2.77, 3.36, 4.26)):
    s = [S(w, 0) - S(b0, 0) - 0.06 for w in words]
    return [[-1, *DISCO], [round(s[0], 3), UP], [round(s[1], 3), DOWN], [round(s[2], 3), *LEFT], [round(s[3], 3), *RIGHT]]
DANCE = dict(clip='happy_idle', at=0.3, speed=0.25, hop=[0.05, 1], sway=5)
WIRED = dict(arm='both', aim='rave', upAt=-1)
WDANCE = {**DANCE, **WIRED, 'hop': [0.06, 0.5]}           # wired: the rave arms and a hop on every half beat

# ---- a projection check (numbers only): where each face lands in the 9:16 frame at the shot's start and end ----
def _proj(cam, look, fov, pt):
    f = [look[i] - cam[i] for i in range(3)]; n = math.sqrt(sum(v * v for v in f)); f = [v / n for v in f]
    r = [-f[2], 0.0, f[0]]; rn = math.sqrt(r[0] ** 2 + r[2] ** 2) or 1; r = [r[0] / rn, 0.0, r[2] / rn]
    u = [r[1] * f[2] - r[2] * f[1], r[2] * f[0] - r[0] * f[2], r[0] * f[1] - r[1] * f[0]]
    d = [pt[i] - cam[i] for i in range(3)]; z = sum(a * b for a, b in zip(d, f))
    if z <= 0.05: return None
    tv = math.tan(math.radians(fov) / 2); th = tv * 9 / 16
    return (0.5 + sum(a * b for a, b in zip(d, r)) / z / th / 2, 0.5 - sum(a * b for a, b in zip(d, u)) / z / tv / 2)
_src = open(os.path.join(HERE, '2026-10-09-2.lyrics.js')).read()
_rows = json.loads(re.search(r'window\.LYRICS = (.*?);\n', _src).group(1)); _ends = json.loads(re.search(r'window\.LINE_END = (.*?);\n', _src).group(1))
LINES = [(Bt(row[0][0] - 0.35), Bt(e)) for row, e in zip(_rows, _ends)]
def has_line(b0, b1): return any(a < b1 and b > b0 for a, b in LINES)
WARN = []
def body(a, end):                                # (who, x, z, face y, head top y) at the shot's start (0) or end (1)
    who = a['who']; sc = a.get('scale', 1)
    x, z = a['x'] + a.get('mx', 0) * end, a['z'] + a.get('mz', 0) * end
    lift = a.get('lift', 0) + (a.get('my', 0) if end else 0) - (SIT if a.get('sit') else 0)
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

# ---- the set: a lens must be on the piazza (or over the lake, or inside Kob's room), never inside the bar, a house,
# the car or the balustrade; a line of sight between the room and the piazza passes through her window; a face behind
# the counter must be seen over it and clear of the machine ----
def free(c, car=False):
    x, y, z = c
    if z > FACADE_Z - 0.05:
        return -2.5 < x < 2.5 and FACADE_Z + 0.3 < z < 9.3 and ROOM_Y + 0.05 < y < ROOM_Y + 2.5
    if z < LAKE_Z + 0.25 and z > LAKE_Z - 0.25 and y < 1.05: return False
    if y < (0.06 if z > LAKE_Z else -0.8): return False
    if -1.62 < x < 1.62 and -0.9 < z < -0.22 and y < COUNTER_Y + 0.08: return False      # the counter
    if -1.55 < x < 1.55 and -2.05 < z < -1.65 and y < 1.3: return False                  # the back shelf and its bottles
    if -1.55 < x < 1.55 and -1.7 < z < -0.8 and y < DECK + 0.1: return False              # the duckboard
    if -1.1 < x < -0.38 and -0.8 < z < -0.32 and y < 1.62: return False                   # the machine
    if -1.75 < x < 1.75 and -2.25 < z < 0.8 and 2.05 < y < 2.5: return False              # the awning
    if car and CAR_BOX[0] < x < CAR_BOX[1] and CAR_BOX[2] < z < CAR_BOX[3] and y < CAR_BOX[4]: return False
    return True
def sight(cam, p):
    inside = lambda q: q[2] > FACADE_Z + 0.2
    if inside(cam) != inside(p):
        u = (FACADE_Z - cam[2]) / (p[2] - cam[2]); X = cam[0] + (p[0] - cam[0]) * u; Y = cam[1] + (p[1] - cam[1]) * u
        if not (KOB_WIN[0] + 0.05 < X < KOB_WIN[1] - 0.05 and KOB_WIN[2] + 0.05 < Y < KOB_WIN[3] - 0.05): return False
    if p[2] < COUNTER_Z - 0.4 and cam[2] > COUNTER_Z and p[2] > -2.1:        # behind the counter, seen from its front
        u = (COUNTER_Z - cam[2]) / (p[2] - cam[2]); Y = cam[1] + (p[1] - cam[1]) * u
        if Y < COUNTER_Y + 0.04: return False
    for k in range(1, 20):                                                  # the machine's box on the line
        u = k / 20; q = [cam[i] + (p[i] - cam[i]) * u for i in range(3)]
        if -1.06 < q[0] < -0.42 and -0.77 < q[2] < -0.35 and COUNTER_Y < q[1] < COUNTER_Y + 0.62: return False
    return True

shots = []
def lens(v, k=0):
    c, f = v; a = math.radians(c['ang'][k]); fy = f[2] if len(f) > 2 else 0
    return (f[0] + math.sin(a) * c['r'][k], c['h'][k] + fy, f[1] + math.cos(a) * c['r'][k])
def pet_xy(o):
    if o.get('spots'): return [tuple(p) for p in o['spots']]
    if o.get('mob'):
        cx, cz, cols, rows, dx, dz, _ = o['mob']; out = []
        for i in range(NPET):
            c, r = i % cols, i // cols
            if r >= rows: continue
            out.append((cx + (c - (cols - 1) / 2) * dx + (dx * 0.25 if r % 2 else 0), cz + r * dz))
        return out
    if o.get('gather'):
        gx, gz, gr, a0, a1 = o['gather'][:5]
        return [(gx + math.sin(math.radians(a0 + (a1 - a0) * i / (NPET - 1))) * gr, gz + math.cos(math.radians(a0 + (a1 - a0) * i / (NPET - 1))) * gr) for i in range(NPET)]
    return [tuple(p) for p in SPOTS]
def pet_clear(v, actors, o, reach=0.5, lensR=1.0):
    """hide the pets on a line of sight to a face, or near the lens"""
    out = []
    for k in (0, -1):
        cam = lens(v, k)
        for (sx, sz) in pet_xy(o):
            if math.hypot(sx - cam[0], sz - cam[2]) < lensR: out.append([round(sx, 3), round(sz, 3), 0.05]); continue
            for a in actors:
                if a.get('away'): continue
                who, x, z, fy, _ = body(a, 1 if k else 0)
                dx, dz = x - cam[0], z - cam[2]; L = math.hypot(dx, dz) or 1
                u = ((sx - cam[0]) * dx + (sz - cam[2]) * dz) / (L * L)
                if not 0 < u < 1: continue
                hy = cam[1] + (fy - cam[1]) * u
                if math.hypot(sx - (cam[0] + dx * u), sz - (cam[2] + dz * u)) < reach and hy < 1.35 and math.hypot(sx - x, sz - z) > 0.25:
                    out.append([round(sx, 3), round(sz, 3), 0.05]); break
    return [list(c) for c in {tuple(c) for c in out}]
def add(beat, b1, actors, lyric, v, **o):
    c, focus = v
    o = {k: val for k, val in o.items() if val is not None}
    reach = o.pop('reach', 0.5)
    if o.get('pets') and not o.get('noguests'):
        o['clear'] = o.get('clear', []) + pet_clear(v, actors, o, reach)
    shots.append({'beat': beat, 'kind': 'dance', 'map': 'piazza', 'actors': actors, 'lyric': lyric, 'cam': c, 'focus': focus, **o})
    fy = focus[2] if len(focus) > 2 else 0
    for k, end in ((0, 0), (-1, 1)):
        cam, look = lens(v, k), (focus[0], c['look'][k] + fy, focus[1])
        check(beat, b1, cam, look, c['fov'], actors, end)
        for oc in _occl(cam, look, c['fov'], [body(a, end)[:4] for a in actors if not a.get('lying') and not a.get('fg') and not a.get('away')]):
            WARN.append(f'b{beat}: {oc}{" at the end" if end else ""}')
        if not free(cam, bool(o.get('police'))): WARN.append(f'b{beat}: lens inside the set{" at the end" if end else ""} {tuple(round(q, 2) for q in cam)}')
        for a in actors:
            if a.get('fg') or a.get('away'): continue
            who, x, z, fy2, _ = body(a, end)
            if not sight(cam, (x, fy2, z)): WARN.append(f'b{beat}: {who} hidden by the set{" at the end" if end else ""}')
def solve(actors, b0, b1, look, ang, dist, hs=(1.0, 1.2, 1.4), fov=52, spread=40, dr=(0.8, 1.4), police=False, push=0.04, extra=None, **o):
    best = None
    for da in sorted(range(-spread, spread + 1, 5), key=abs):
        for k in range(9):
            d = dist * (dr[0] + (dr[1] - dr[0]) * k / 8)
            for h in hs:
                a = math.radians(ang + da); cam = (look[0] + math.sin(a) * d, h, look[2] + math.cos(a) * d)
                if not free(cam, police): continue
                if extra and not extra(cam, look, fov): continue
                p1 = tuple(cam[i] + (look[i] - cam[i]) * push for i in range(3))
                n0 = len(WARN)
                for kk, end, cc in ((0, 0, cam), (1, 1, p1)):
                    check(b0, b1, cc, look, fov, actors, end)
                    WARN.extend(_occl(cc, look, fov, [body(a_, end)[:4] for a_ in actors if not a_.get('lying') and not a_.get('fg') and not a_.get('away')]))
                    for a_ in actors:
                        if a_.get('fg') or a_.get('away'): continue
                        if not sight(cc, body(a_, end)[1:4][:2] and (body(a_, end)[1], body(a_, end)[3], body(a_, end)[2])): WARN.append('hidden')
                bad = len(WARN) - n0; del WARN[n0:]
                if bad == 0:
                    sc = abs(da) / 40 + abs(d - dist) / dist
                    if best is None or sc < best[0]: best = (sc, cam, p1)
    if best is None: raise SystemExit(f'b{b0}: no lens round {ang} deg at {dist} m')
    _, cam, p1 = best
    print(f'  b{b0}: lens {tuple(round(c, 2) for c in cam)}')
    return view(tuple(round(c, 3) for c in cam), tuple(round(c, 3) for c in look), fov, p1=tuple(round(c, 3) for c in p1), **o)
def car_pt(cx, cz, p):                             # a point of the car (car frame x, y, z: nose to +x) in the world
    return (cx + p[0], p[1], cz + p[2])
def silhouette(cam, look, fov, who, x, z, lift=0.0):   # (head centre, head radius, body x range, body y range) in the frame
    h = _proj(cam, look, fov, (x, FACE[who] + 0.1 + lift, z)); d = math.dist(cam, (x, FACE[who] + 0.1 + lift, z))
    k = 1 / (2 * math.tan(math.radians(fov) / 2) * 9 / 16) / d
    feet, neck = _proj(cam, look, fov, (x, lift, z)), _proj(cam, look, fov, (x, FACE[who] - 0.35 + lift, z))
    return h, RAD[who] * k, (h[0] - 0.3 * k, h[0] + 0.3 * k), (h[1], feet[1])
def beside(pt, who, x, z, lift=0.0, gap=(0.07, 0.25), dy=(0.25, 0.8)):   # a lens test: pt shows beside the head or the body, not behind them
    def ok(cam, look, fov):
        a = _proj(cam, look, fov, pt)
        if not a or not (0.06 < a[0] < 0.94 and dy[0] < a[1] < dy[1]): return False
        h, r, bx, by = silhouette(cam, look, fov, who, x, z, lift)
        dh = math.hypot(a[0] - h[0], (a[1] - h[1]) * 16 / 9) - r
        in_body = bx[0] - gap[0] < a[0] < bx[1] + gap[0] and by[0] < a[1] < by[1]
        return not in_body and gap[0] < dh < gap[1]
    return ok
def clear_line(cam, to, r=0.55, n=8):              # no pet on the line from the lens to a point (a car rolling in, a window)
    return [[round(cam[0] + (to[0] - cam[0]) * k / n, 2), round(cam[2] + (to[2] - cam[2]) * k / n, 2), r] for k in range(1, n + 1)]
def clean(actors):
    for a in actors:
        for k in ('sit', 'lying', 'away'): a.pop(k, None)
    return actors

NIGHT = dict(wake=0, kobLamp=False)
def googly_at(b, b0): return S(b, b0)
def sipping(b_mouth, b0):                        # the held cup at the mouth on beat b_mouth (the sip swing, every 4 beats)
    return dict(arm='R', aim='sip', flapPh=round(b_mouth % 4, 3), upAt=-1)
def kob_bed(**o):                                # Kob sitting up in bed, awake, facing the foot of the bed (-z)
    return A('kob', 'sitting_talking', *KOB_BED, yaw=180, at=o.pop('at', 0.05), speed=o.pop('speed', 0), lift=BED_LIFT, sit=True, **o)
BEDCAM = lambda push=0.12, fov=44, h=3.66: view((0.0, h, 6.1), (0.0, 3.7, 8.75), fov, p1=(0.0, h, 6.1 + push))

# =====================================================================================================================
# BEAT 1, chorus 1's second half (b0-16): 3 a.m., the barista dances alone; the cat can't sleep
# S01 the hook (b0-5; move b1.18, up b1.73, down b2.77, left b3.36, right b4.26): a swoop down from over the cafe tables to
# the cobbles: Saxo in the singer's look dancing alone in front of his espresso bar, the moon over the lake behind, the
# song's up, down, left, right acted on the words (review loop 1: the charleston's kicks under the arm moves, a disco
# point on frame 1, where his paws hung at his sides)
s01 = [A('saxo', 'charleston', 0.0, 0.7, yaw=0, at=0.55, hop=[0.04, 1], arm='both', aim=DOWN, upAt=-1, aimSeq=moves(0))]
v = swoop([(-1.6, 2.2, 4.4), (-1.2, 1.5, 3.9), (-0.85, 0.98, 3.45), (-0.7, 0.8, 3.2)], (0.0, 1.06, 0.7), fov=58, roll=(0, 3, 8, 5), hand=0.15)   # from the left: from the right the machine sat on his head
add(0, 5, s01, "the hook ('move it up, down, left, right'): a swoop down from over the cafe tables: 3 a.m., Saxo in the singer's headscarf, cat-eye shades and mint dress dancing alone in front of his espresso bar, the moon on the lake behind; up, down, left, right on the words", v,
    **NIGHT, pets=False, stools=False, steam=True)
# S02 (b5-8; switch b5.13, nintendo b6.48): alone at 3 a.m. behind his counter, the barista plays a game pad, steam puffing
# from the machine beside him (review loop 1: working the levers never read, his paws never reached them)
s02 = [A('saxo', 'happy_idle', 0.1, -1.1, yaw=-12, at=0.3, speed=0.3, lift=DECK, hold='pad', holdScale=1.8, arm='both', aim=[0.15, 0.4, 0.85], upAt=-1, hop=[0.03, 1])]
v = view((0.95, 1.3, 1.75), (-0.3, 1.25, -1.0), 48, p1=(0.88, 1.29, 1.6))
add(5, 8, s02, "'switch it up like Nintendo': alone at 3 a.m. behind his counter, the barista plays a game pad, steam puffing from the machine beside him", v,
    **NIGHT, pets=False, steam=True, stools=False, counterCups=3)
# S03 (b8-12; sleep b10.23): across the piazza, upstairs: Kob sitting up in bed in her nightgown and nightcap, wide awake,
# her bedside lamp clicking on
v = BEDCAM()
add(8, 12, [kob_bed()], "'say you can't sleep': upstairs across the piazza, Kob sitting up in bed in her nightgown and nightcap, wide awake, glaring; her lamp clicks on", v,
    **{**NIGHT, 'kobLamp': 0.35})
# S04 (b12-16; espresso b14.87): her window's point of view, from inside her room: down on the bar, he raises a cup to her
# window, the machine's steam bursting on 'espresso'
s04 = [A('saxo', 'happy_idle', 0.15, -1.3, yaw=0, at=0.3, speed=0.2, lift=DECK, hold='espresso', holdScale=1.6, arm='R', aim='toast', upAt=-1)]
v = view((0.1, 3.55, 4.72), (0.15, 1.3, -1.3), 30, p1=(0.1, 3.55, 4.8))   # a long lens from her windowsill: he was a speck from inside the room
add(12, 16, s04, "'that's that me espresso': her window's point of view from inside her dark room: down on the bar he raises an espresso to her window, steam bursting from the machine", v,
    **{**NIGHT, 'kobLamp': True}, pets=False, steam=[S(14.87, 12)])
# =====================================================================================================================
# BEAT 2, verse 1 (b16-48): Sadi comes down to complain: one espresso and she's dancing; the neighbours wake
# S05 (b16-20, Sadi stomping out of her door): failed three review loops (at the lens she stood still, side on the door
# read as a pole and the scooter as a cart); folded into S06, which starts on b16
# S06 (b20-22): at the counter Sadi shoves her ringing alarm clock at us (it's 3 a.m.), the barista grinning behind his
# machine (review loops 1-2: a point never read on her chibi arm; over her shoulder her head hid the clock, which always
# faces +z)
s06 = [A('sadi', 'happy_idle', -0.4, 0.75, yaw=-10, at=0.3, speed=0.2, hold='clock', holdScale=1.4, arm='R', aim=[0.45, 0.75, 0.4], upAt=-1, hop=[0.03, 0.5]),
       A('saxo', 'happy_idle', 0.4, -1.1, yaw=-10, at=0.3, speed=0.2, lift=DECK)]
v = solve(s06, 20, 22, (-0.2, 1.05, -0.1), 0, 3.3, hs=(1.2, 1.35, 1.5), fov=56, spread=35)
add(16, 22, s06, "at the counter Sadi shoves her ringing alarm clock at us: it's 3 a.m.; the barista grins behind his machine", v,
    wake=2, kobLamp=True, pets=False, stools=False)
# S07 (b22-24; desperation b22.1): an espresso in her paw: she sips, and her eyes go googly
s07 = [A('sadi', 'happy_idle', 0.7, 1.0, yaw=180, at=0.3, speed=0.15, hold='espresso', holdScale=1.5, **sipping(22.6, 22), googly=googly_at(23.15, 22))]
v = view((0.6, 1.5, -1.6), (0.7, 1.12, 1.0), 44, p1=(0.61, 1.5, -1.5))
add(22, 24, s07, "'desperation': one sip of his espresso and Sadi's eyes go googly", v, wake=2, kobLamp=True, pets=False, stools=False, counterCups=0)
# S08 (b24-28; the Short's first frame ~b25.3): wired, she dances with him in front of the bar, a low dolly
s08 = [A('sadi', **WDANCE, x=0.65, z=0.75, yaw=-25, googly=True), A('saxo', 'charleston', -0.45, 0.55, yaw=20, at=0.55)]
v = view((-0.45, 0.4, 3.5), (0.15, 0.98, 0.65), 60, p1=(-0.32, 0.38, 3.2), roll=[-8, -5], hand=0.3)
add(24, 28, s08, "the Short's first frame: wired on espresso, googly-eyed Sadi dances with him in front of the bar (a low dolly)", v,
    wake=2, kobLamp=True, pets=False, stools=False, steam=True)
# S09 (b28-32; vacation b30.7): the two side by side doing the charleston, the moon over the lake behind (a handheld orbit)
s09 = [A('sadi', 'charleston', 0.5, 0.6, yaw=-10, at=0.6, googly=True), A('saxo', 'charleston', -0.45, 0.6, yaw=10, at=0.6)]
v = view((1.6, 0.6, 3.4), (0.0, 1.0, 0.6), 58, p1=(0.6, 0.55, 3.75), hand=1.0, roll=[5, -3], ease='lin')
add(28, 32, s09, "'on vacation': side by side doing the charleston, the moon on the lake behind them", v,
    wake=2, kobLamp=True, pets=False, stools=False)
# S10 (b32-36; 'calling' b39 is the next shot's): from the nightstand's side, Kob in bed with the black handset at her ear,
# glaring: she's calling the police (review loop 1: a pink phone at arm's length read as a card; a new lens, not the bed's)
s10 = [kob_bed(hold='handset', holdScale=1.3, arm='R', aim=[0.3, 0.85, 0.05], upAt=-1)]
v = view((1.55, 3.72, 6.65), (0.0, 3.62, 8.75), 46, p1=(1.5, 3.72, 6.75))
add(32, 40, s10, "'this one boy won't stop calling': from the nightstand's side, Kob in bed with the black handset at her ear, glaring: she's calling the police", v, wake=3, kobLamp=True)
# S11 (b36-40, the windows waking): failed three review loops (one neighbour, then fists that read as sipped cups);
# folded into S10, the handset held to b40, so the cat is on the phone on 'calling' (b39)
# S12 (b40-44): the neighbours come down in pyjamas and nightcaps, shaking their fists at the bar; he holds up a tray of
# espressos (review loops 1-2: their heads at the lens read as cones, then the tray covered his muzzle and he was small:
# the tray out to his side, a longer lens on him, the crowd in a U round the counter so its middle stays clear)
YELL = [[-1.2, 0.45], [-0.5, 0.55], [0.5, 0.55], [1.2, 0.45], [-0.85, 1.05], [0.85, 1.05]]   # off the lens: at 1.25 m their nightcaps filled the frame's corners
s12 = [A('saxo', 'happy_idle', 0.0, -1.15, yaw=0, at=0.3, speed=0.2, lift=DECK, holdL='espressotray', holdScale=2.0, arm='L', aim=[0.85, 0.55, 0.15], upAt=-1)]
v = view((0.35, 2.7, 4.6), (0.0, 1.2, -0.9), 44, p1=(0.33, 2.68, 4.4))   # back far enough for whole neighbours, not caps in the corners
add(40, 44, s12, "the neighbours come down in pyjamas and nightcaps, shaking their fists at the bar; he holds up a tray of espressos", v,
    wake=10, winPets='yell', kobLamp=True, pets='yell', spots=YELL, spotsAt=[0, -1.2], stools=False, reach=0.4)
# S13 (b44-48): one sip each: googly eyes all round, and the neighbours dance with their cups in a ring behind the two
# (review loop 1: the floor lens showed bare paving and a neighbour cut behind Sadi: the lens up, the ring behind them)
s13 = [A('saxo', 'charleston', 0.0, 1.6, yaw=-20, at=0.6), A('sadi', **WDANCE, x=0.95, z=1.85, yaw=-35, googly=True)]
DANCERS = [[-1.4, 1.3], [1.9, 0.9], [-0.9, 2.2], [0.6, 2.6], [-2.4, 0.15], [2.6, 1.9], [-1.8, 3.0], [1.6, 3.4], [-5.6, 0.6], [3.2, 0.4], [-0.2, 3.6], [-2.2, -0.95]]   # none in the car's footprint or on the cop's path
RING13 = [[round(0.45 + 1.6 * math.sin(math.radians(a)), 2), round(1.7 + 1.6 * math.cos(math.radians(a)), 2)] for a in range(36, 253, 36)]   # the ring's far side: its near side stood between the lens and his chin
v = view((-1.3, 2.5, 4.4), (0.45, 1.0, 1.55), 54, p1=(-1.15, 2.45, 4.15))   # from above: at their height the ring's nightcaps sat on their heads like hats
add(44, 48, s13, "one espresso each: googly eyes all round, and the neighbours in their pyjamas and nightcaps dance with their cups in a ring behind the two", v,
    wake=10, winPets='dance', kobLamp=True, pets='dance', wired=True, cups=True, spots=RING13, spotsAt=[0.45, 1.7], stools=False)
# =====================================================================================================================
# BEAT 3, the pre-chorus (b48-79): the police; the morning coffee
# S14 (b48-52; ex b49.9): the clip's white police car rolls up at the lens, Compote at the wheel, the red light flashing;
# the googly-eyed dancers frozen either side (the critic's weakest moment: the car from behind the two, parked, no cop;
# the car is open-topped now so she shows)
X0 = -7.4   # (loop 3: from 10 m out the car was small over empty paving: it rolls the last 3 m, the frame that passed)
POLICE_IN = {'x': X0, 'z': CAR[1], 'to': list(CAR), 'at': 0.0, 'dur': S(52, 48), 'lin': True}
s14 = [A('compote', 'male_driving_a_car', X0 + DRIVER[0], CAR[1] + DRIVER[1], yaw=90, at=0.5, lift=SEAT_Y, sit=True, mx=CAR[0] - X0, noShadow=True)]
L14 = (-0.9, 1.25, 1.6)
PATH14 = [[x, 1.12] for x in (-3.6, -5.2, -6.8, -8.4)] + [[x, 3.8] for x in (-3.3, -4.9, -6.5, -8.1)]   # frozen dancers lining the car's way in (review loop 2: an empty street)
v = view(L14, (CAR[0] + DRIVER[0], 1.0, CAR[1] + DRIVER[1]), 52, p1=(-0.95, 1.25, 1.62))
add(48, 52, s14, "'ex': the clip's white police car rolls up at the lens, Compote the cop at the wheel, red light flashing; the googly-eyed dancers freeze and stare", v,
    wake=10, winPets='stare', kobLamp=True, pets='stare', wired=True, cups=True, spots=DANCERS, stare=[-4.4, 2.4], police=POLICE_IN, siren=True, stools=False, reach=0.6,
    clear=clear_line(L14, (X0, 1.0, CAR[1] + DRIVER[1]), r=0.9, n=12))
# S15 (b52-56; dream b54.0): out of her car behind its open door, Compote glares at the bar and holds up a citation, the
# red light flashing beside her head (the critic's fix; review loop 1: the neighbours behind her lent her their googly
# eyes: the line behind her cleared)
CP_OUT = (CAR[0] - 0.05, CAR[1] - 1.2)
B15 = car_pt(*CAR, BEACON)
s15 = [A('compote', 'happy_idle', *CP_OUT, yaw=140, at=0.3, speed=0.15, holdL='citation', holdScale=1.5, arm='L', aim=[0.6, 0.62, 0.42], upAt=-1)]   # the citation in her left paw: the red light shows on her right
v = solve(s15, 52, 56, (CP_OUT[0], 1.05, CP_OUT[1]), 160, 3.3, hs=(1.0, 1.2, 1.4), fov=46, spread=45, police=True,
          extra=beside(B15, 'compote', *CP_OUT))
add(52, 58, s15, "'dream': out of her car behind its open door, the cop glares at the bar, a citation held up beside her head, the red light flashing beside her", v,
    wake=10, winPets='stare', kobLamp=True, pets='stare', wired=True, cups=True, spots=DANCERS, stare=list(CP_OUT), police={'x': CAR[0], 'z': CAR[1]}, siren=True, carDoor=[0.0, 0.3, 0.0, 1.0], stools=False,
    clear=clear_line(lens(v), (CP_OUT[0] + (CP_OUT[0] - lens(v)[0]) * 1.5, 1.0, CP_OUT[1] + (CP_OUT[1] - lens(v)[2]) * 1.5), r=0.8))
# S16 (b56-60, the march to the bar): failed three review loops (an empty piazza, then the machine over his face);
# folded into S15 (to b58) and S17 (from b58)
# S17 (b60-64): at the counter she holds a citation up at him, glaring (over his shoulder; review loop 1: the neighbours
# behind her head lent her their googly eyes: the line behind her cleared; a long white citation, not a ticket)
s17 = [A('compote', 'happy_idle', -0.5, 0.95, yaw=175, at=0.3, speed=0.15, hold='citation', holdScale=1.6, arm='R', aim=[0.5, 0.62, 0.58], upAt=-1),
       A('saxo', 'happy_idle', 0.15, -1.3, yaw=-10, at=0.3, speed=0.2, lift=DECK, fg=True)]
v = view((1.35, 1.62, -1.8), (-0.45, 1.05, 0.95), 50, p1=(1.32, 1.6, -1.7))
add(58, 64, s17, "at the counter she holds a citation up at him, glaring (over his shoulder)", v,
    wake=10, winPets='stare', kobLamp=True, pets='stare', wired=True, cups=True, spots=DANCERS, stare=[-0.5, 0.5], police={'x': CAR[0], 'z': CAR[1]}, siren=True, carDoor=1, stools=False, counterCups=2,
    clear=clear_line((1.35, 1.62, -1.8), (-2.2, 1.0, 4.4), r=0.75, n=10))
# S18 (b64-68, 'Mountain Dew'): failed three review loops (the lever pull never read, the steam read as a dotted tree);
# folded into S19, which starts on b64
# S19 (b68-72; morning b69.1, coffee b69.75, brewed b70.65): the reverse, over her cap: he holds her morning coffee out
# across the counter at her (review loops 1-2: S17's lens again, then the cup hidden behind the machine: the cup in his
# paw away from it)
s19 = [A('saxo', 'happy_idle', 0.0, -1.1, yaw=20, at=0.3, speed=0.2, lift=DECK, holdL='espresso', holdScale=1.8, arm='L', aim=[0.6, 0.45, 0.55], upAt=-1),   # the arm out to the side: held forward the cup hid his paw and floated by his chin
       A('compote', 'happy_idle', 1.8, 1.0, yaw=-139, at=0.3, speed=0.15, fg=True)]
v = view((2.0, 1.5, 2.4), (0.05, 1.25, -1.0), 46, p1=(1.95, 1.49, 2.28))   # over her right shoulder: from the left an awning pole and a lamp post grew out of his head and the cup
add(64, 72, s19, "'that morning coffee, brewed it for ya': over her cap, he holds her morning coffee out across the counter to her", v,
    wake=10, kobLamp=True, pets='stare', wired=True, cups=True, spots=DANCERS, police={'x': CAR[0], 'z': CAR[1]}, siren=True, stools=False, counterCups=2)
# S20 (b72-76; touch b73.3): she sips: googly eyes on 'touch' (review loop 1: the machine cut her eye and a neighbour
# peeked behind her: the lens to the right, the line behind her cleared)
s20 = [A('compote', 'happy_idle', -0.4, 0.95, yaw=180, at=0.3, speed=0.15, hold='espresso', holdScale=1.5, **sipping(72.6, 72), googly=googly_at(73.3, 72))]
v = view((-0.05, 1.5, -1.6), (-0.4, 1.12, 0.95), 44, p1=(-0.06, 1.5, -1.5))
add(72, 76, s20, "'one touch': she sips, and her eyes go googly", v, wake=10, kobLamp=True, pets='stare', wired=True, cups=True, spots=DANCERS, police={'x': CAR[0], 'z': CAR[1]}, siren=True, stools=False, counterCups=0,
    clear=clear_line((-0.05, 1.5, -1.6), (-1.4, 1.0, 4.4), r=0.8, n=10))
# S21 (b76-79): the googly-eyed cop kicks the charleston on her police car's bonnet, the red light flashing beside her
# (review loop 1: on the roof she floated over it and read as a shrug; the car is open-topped now)
CP_BON = (CAR[0] + BONNET[0], CAR[1])
B21 = car_pt(*CAR, BEACON)
s21 = [A('compote', 'charleston', *CP_BON, yaw=105, at=0.55, lift=BONNET[1], googly=True)]
v = solve(s21, 76, 79, (CP_BON[0], 1.75, CP_BON[1]), 100, 3.2, hs=(1.2, 1.5, 1.8), fov=52, spread=40, police=True,
          extra=beside(B21, 'compote', *CP_BON, lift=BONNET[1], gap=(0.07, 0.3)))
add(76, 79, s21, "the googly-eyed cop kicks the charleston on her police car's bonnet, the red light flashing beside her", v,
    wake=12, winPets='dance', kobLamp=True, pets='dance', wired=True, cups=True, spots=DANCERS, police={'x': CAR[0], 'z': CAR[1]}, siren=True, carDoor=1,
    clear=clear_line(lens(v), (CP_BON[0], 1.0, CP_BON[1]), r=0.9))
# =====================================================================================================================
# BEAT 4, chorus 2 (b79-113): the whole lakefront is up; the cat storms out; the switch; the cat dances
ALL = [[-1.6, 1.4], [1.9, 1.0], [-0.9, 2.3], [0.7, 2.7], [-2.6, 0.6], [2.8, 2.0], [-1.9, 3.2], [1.7, 3.6], [-3.4, 4.1], [3.4, 0.4], [-0.2, 3.7], [-3.3, 0.45],
       [4.2, 1.6], [-4.6, -0.6], [4.6, -0.4], [-2.9, 4.0], [2.9, 4.0], [5.4, 2.6], [-5.6, 0.4], [5.8, 0.0], [-1.0, -3.0], [1.4, -3.2], [-3.2, -2.4], [3.4, -2.2]]
FULL = dict(wake=18, winPets='dance', kobLamp=True, pets='dance', wired=True, cups=True, spots=ALL, police={'x': CAR[0], 'z': CAR[1]}, siren=True, carDoor=1, stools=False)
# S22 (b79-83): a crane over the lake: the whole lakefront dancing at 3 a.m. in rows before Sadi's house, every window lit
# but the cat's (she's trying to sleep) (review loops 1-2: the two under the awning, then the awning hid the rows behind
# the bar from any lens over the lake: the crowd moved off to the side)
s22 = [A('saxo', 'charleston', 3.7, -0.7, yaw=180, at=0.6), A('sadi', 'charleston', 4.7, -0.6, yaw=180, at=0.6, googly=True)]
v = view((3.0, 5.0, -8.0), (4.2, 1.0, 0.9), 56, p1=(3.2, 4.4, -7.1), ease='lin')
add(79, 87, s22, "a crane over the lake: the whole lakefront dancing at 3 a.m. in rows on the piazza, every window lit but the cat's", v,
    **{**FULL, 'spots': None, 'mob': [4.2, 0.35, 6, 3, 1.0, 0.9, 180], 'kobLamp': False})
# S23 (b83-87, through the crowd): failed three review loops (the crowd never in front, faces at the edges); folded
# into S22, the crane over the lake held to b87
# S24 (b87-91; sleep b90.2): straight down on her bed: Kob lying on her back, wide awake, eyes on the ceiling (review loop 1:
# paws by her cheeks read as thrown up, and the bed's frontal lens a third time)
LIE = dict(clip='laying_idle', x=0.0, z=8.3, yaw=180, at=1.0, speed=0, lift=BED_Y, ground='mesh', lying=True)   # on her back in her bed, head on the pillow
BEDTOP = lambda: view((0.45, 5.0, 7.5), (0.0, 3.26, 9.09), 52, p1=(0.43, 4.95, 7.55))   # tilted up 5 deg: the sleeper's mask sat under the lyric rows   # from above the foot of the bed: straight down she read as standing
s24 = [A('kob', **LIE)]
v = BEDTOP()
add(87, 91, s24, "'say you can't sleep': straight down on her bed: Kob lying on her back, wide awake, staring at the ceiling", v, wake=18, kobLamp=0.4)
# S25 (b91-95; espresso b94.8): square to her green door as it bursts open: Kob storms out at the lens in her nightgown and
# nightcap, milk bottle held up (review loop 1: no door in frame, a neighbour in the foreground)
s25 = [A('kob', 'happy_walk', -2.0, 4.55, yaw=180, at=0.3, speed=1.3, mz=-1.5, moveAt=0.3, hold='milkbottle', holdScale=1.5, arm='R', aim=[0.45, 0.3, 0.6], upAt=-1, hop=[0.04, 1])]
v = view((-2.05, 1.1, 1.0), (-2.0, 1.2, 4.6), 50, p1=(-2.05, 1.1, 1.08))
add(91, 95, s25, "'espresso': square to her green door as it bursts open: Kob storms out at the lens in her nightgown and nightcap, milk bottle held up", v,
    **{**FULL, 'kobDoor': [0.0, 0.25, 0.0, 1.0]}, reach=0.6, clear=clear_line((-2.05, 1.1, 1.0), (-2.0, 1.0, 5.0), r=1.0))
# S26 (b95-97): she marches through the dancers to the bar
s26 = [A('kob', 'happy_walk', -1.45, 2.4, yaw=150, at=0.3, speed=1.4, mx=0.9, mz=-1.5, hold='milkbottle', holdScale=1.3)]
v = solve(s26, 95, 97, (-1.0, 1.0, 1.6), 110, 4.0, hs=(0.8, 1.0, 1.2), fov=54, spread=40, police=True)
add(95, 97, s26, "she marches through the dancers to the bar", v, **FULL, reach=0.6)
# S27 (b97-101; up b97.76, down b98.59, left b99.35, right b100.26): the barista's point of view: Kob at the counter,
# deadpan, milk in paw, while the whole lakefront behind her does the song's up, down, left, right on the words
MOVES_AT = [S(w, 97) - 0.04 for w in (97.76, 98.59, 99.35, 100.26)]
s27 = [A('kob', 'happy_idle', -0.1, 0.95, yaw=180, at=0.3, speed=0.12, hold='milkbottle', holdScale=1.3)]
v = view((-0.05, 1.55, -1.5), (-0.1, 1.28, 0.95), 56, p1=(-0.05, 1.54, -1.4))
add(97, 101, s27, "'move it up, down, left, right': the barista's point of view: Kob at the counter, deadpan, milk in paw, while the whole lakefront behind her does up, down, left, right on the words", v,
    **{**FULL, 'pets': 'moves', 'movesAt': [round(m, 3) for m in MOVES_AT], 'winPets': 'dance'}, reach=0.4)
# S28 (b101-102.5; switch b101.0): side on over the counter: he reaches out with an espresso, she holds up her milk
SW = [A('saxo', 'happy_idle', 0.15, -1.0, yaw=40, at=0.3, speed=0.2, lift=DECK), A('kob', 'happy_idle', -0.2, 0.08, yaw=150, at=0.3, speed=0.12)]
s28 = [dict(SW[0], hold='espresso', holdScale=1.6, arm='R', aim=[0.2, 0.18, 0.95], upAt=-1), dict(SW[1], hold='milkbottle', holdScale=1.3, arm='R', aim=[0.25, 0.1, 0.9], upAt=-1)]
v = view((3.3, 1.22, -0.5), (0.0, 1.2, -0.5), 48, p1=(3.23, 1.22, -0.5))
add(101, 102.5, s28, "'switch': side on over the counter, he reaches out with an espresso and she holds up her milk bottle", v, **FULL)
# S29 (b102.5-105; nintendo b102.47): the switch done: he holds her milk bottle up, grinning; she holds his espresso, glaring
s29 = [dict(SW[0], hold='milkbottle', holdScale=1.3, arm='R', aim=[0.45, 0.62, 0.64], upAt=-1), dict(SW[1], hold='espresso', holdScale=1.6, arm='R', aim=[0.25, 0.1, 0.9], upAt=-1)]   # (review loop 1: her cup at her hip, out of frame)
v = view((3.3, 1.22, -0.5), (0.0, 1.2, -0.5), 48, p1=(3.23, 1.22, -0.5))
add(102.5, 105, s29, "'like Nintendo': switched: he holds up her milk bottle, grinning; she holds his espresso and glares at him", v, **FULL)
# S30 (b105-109; sleep b106.18): she sips without looking: googly eyes on 'can't sleep'
s30 = [A('kob', 'happy_idle', -0.1, 0.95, yaw=180, at=0.3, speed=0.12, hold='espresso', holdScale=1.5, **sipping(105.6, 105), googly=googly_at(106.18, 105))]
v = view((-0.05, 1.52, -1.6), (-0.1, 1.15, 0.95), 44, p1=(-0.06, 1.52, -1.5))
add(105, 109, s30, "'say you can't sleep, baby, I know': she sips without looking, and the cat's eyes go googly", v, **{**FULL, 'counterCups': 0})
# S31 (b109-113; espresso b111.2): the cat who never dances leaps onto the counter and outdances them all
s31 = [A('kob', 'charleston', -0.1, -0.55, yaw=0, at=0.55, speed=1.15, lift=COUNTER_Y, googly=True)]
v = view((0.35, 0.65, 2.75), (-0.1, 1.85, -0.55), 56, p1=(0.3, 0.6, 2.55), roll=[6, 3], hand=0.3)
add(109, 117, s31, "'that's that me espresso': the cat who never dances leaps onto the counter, googly-eyed, and outdances them all", v, **{**FULL, 'pets': 'cheer'})
# S32 (b113-117, the crane round the bar): failed three review loops (the machine hid her kick, the two at the edges);
# folded into S31, the cat's dance on the counter held to b117
# S33 (b117-120; sweet b118.0, guess b119.0): the button, the cat's sleepless frame again (S24's lens): now the dog lies
# exactly where she lay, asleep under her sleep mask, her milk bottle on his chest (the critic's fix: sitting up in her
# bed, his mask above his shades, he was small behind the footboard and nothing said why he sleeps)
s33 = [A('saxo', **LIE, sleep=True, hold='milkbottle', holdScale=1.3, arm='R', aim=[0.25, 0.6, 0.7], upAt=-1)]
v = BEDTOP()
add(117, 120, s33, "the button, the cat's sleepless frame again: the dog lies where she lay, fast asleep under her sleep mask, her milk bottle on his chest", v,
    wake=18, kobLamp=0.4)
for b, pt, (x, z), lift in ((48, car_pt(*CAR, BEACON), (CAR[0] + DRIVER[0], CAR[1] + DRIVER[1]), SEAT_Y - SIT), (52, B15, CP_OUT, 0.0), (76, B21, CP_BON, BONNET[1])):
    sh = next(q for q in shots if q['beat'] == b); c, f = sh['cam'], sh['focus']; fy = f[2] if len(f) > 2 else 0
    for k in (0, -1):
        cam, look = lens((c, f), k), (f[0], c['look'][k] + fy, f[1])
        a, (h, r, bx, by) = _proj(cam, look, c['fov'], pt), silhouette(cam, look, c['fov'], 'compote', x, z, lift)
        print(f'  b{b}{" end" if k else ""}: red light at ({a[0]:.2f}, {a[1]:.2f}); her head ({h[0]:.2f}, {h[1]:.2f}) r {r:.2f}, body x {bx[0]:.2f}-{bx[1]:.2f} y {by[0]:.2f}-{by[1]:.2f}')
for s in shots: clean(s['actors'])
shots.sort(key=lambda x: x['beat'])
ep = {
    'date': '2026-10-09', 'song': {'title': 'Espresso', 'artist': 'Sabrina Carpenter'},
    'logline': "3 a.m. on an Italian lakefront: Saxo, the barista in the singer's headscarf and cat-eye shades, dances alone at his espresso bar, and everyone who comes to complain gets an espresso and googly eyes and joins the dance: Sadi in her nightie, the neighbours in their nightcaps, Compote the cop in the clip's police car; the last is Kob, who storms out to make it stop: he switches her milk for an espresso, and the cat who never dances outdances them all on the counter, while the dog sleeps in her bed",
    'new': "src/maps38.js: piazza (a 1960s Italian lakefront at 3 a.m.: an open-air espresso bar with a lever machine whose levers pull and pump (`lever`, `pump`) and steam (`steam`), an Espresso neon, cups and stools; pastel houses whose windows light up one by one (`wake`) with neighbours leaning out (`winPets`); Kob's real window and her bedroom behind it (bed, lamp `kobLamp`, red phone); front doors that swing in (`kobDoor`, `sadiDoor`); the clip's white police car with a flashing red light (`police`, `siren`, `carDoor`); the lake with a moon path, a jetty and a varnished speedboat; neighbours in striped pyjamas and nightcaps with espresso cups (`pets`, `cups`) whose eyes go wide and jitter (`wired`), doing the song's up, down, left, right (`pets: 'moves'`, `movesAt`)); src/ps1.js: `googly` (cartoon wide eyes with jittering pupils, popping in), `aimSeq` (arm poses snapped in on given seconds), the `espresso` and `espressotray` props; three looks: saxo riviera (the singer's headscarf, cat-eye sunglasses, platinum wig, mint 60s dress and apron), compote cop (the clip's police uniform), kob nightgown (a flowered nightgown and a frilly nightcap)",
    'notes': "The world, from the official video (contact sheets every 3 s; nothing violent in it): a 1960s Italian lake in warm film colours, a varnished speedboat, a beach club of green-and-white striped umbrellas, the singer in cat-eye sunglasses and a pink silk headscarf, a dance on the shore at sunset, a white police car with a red light and an arrest. The words, from whitelisted keywords per line (songmap.py, kwtimes.py: never the lines): move, up, down, left, right, switch, nintendo, sleep, espresso, night, sweet, desperation, vacation, calling, ex, dream, morning, coffee, brewed, touch. Saxo wears the singer's look as the barista; Sadi her nightie (the first neighbour to complain); Compote the clip's police uniform; Kob a nightgown and nightcap (the insomniac). The live reference: rat-chef (the helper who won't stop helping you at 3 a.m.).",
    'yt': [14.57, 69.22],   # the Short opens on K05's lead-in: the googly-eyed dance of two (from line 4 it opened on Sadi leaving her door, a story beat)
    'with': ['sadi', 'kob', 'compote'],
    'clips': ['happy_idle', 'happy_walk', 'quickly_pointing_angrily_forward', 'sitting_talking', 'male_driving_a_car', 'laying_idle'],
    'tags': {'structure': 'escalation', 'scenes': ['the barista dances alone at 3 a.m.', 'up down left right on the words', 'the cat who can\'t sleep', 'an espresso and googly eyes', 'the neighbours in nightcaps', 'the police car', 'the cop on the car roof', 'the switch', 'the cat on the counter', 'the dog in the cat\'s bed'],
             'cast': ['saxo', 'sadi', 'kob', 'compote'], 'hook': 'dance', 'maps': ['piazza'], 'ref': 'rat-chef',
             'lyric_literal': "'move it up, down, left, right' (Saxo's arms on the words, then the whole lakefront's), 'switch it up like Nintendo' (the levers worked like a game pad; the milk switched for an espresso), 'can't sleep' (the cat awake in bed, ears covered, then googly-eyed), 'espresso' (every cup), 'calling' (the cat phones the police), 'morning coffee, brewed it for ya' (the cop's coffee), 'touch' (her googly eyes)",
             'experiment': "A dog-wins ending after the critic's 'the cat's laziness beats the dog's energy for the 4th time': the dog's espresso finally beats the cat (she dances, he sleeps). Do a cartoon reaction prop (googly eyes) and a dance instruction acted on the words lift the like rate over the last two episodes' at 24 h?"},
    'shots': shots,
}
json.dump(ep, open(os.path.join(HERE, '2026-10-09-2.json'), 'w'), indent=1, ensure_ascii=False)
print(len(shots), 'shots;', len(WARN), 'warnings')
for w in WARN: print('  ', w)
