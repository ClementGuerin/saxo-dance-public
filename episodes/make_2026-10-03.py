# make_2026-10-03.py: writes episodes/2026-10-03.json, "Animal" (KATSEYE, 2026; a trending song, the queue being empty:
# #53 on Spotify's global daily chart and climbing, +122k streams a day on 2026-10-01, 435k TikTok videos on its 60 s
# sound, 122M views on the official video). The clip (studied from a 360p copy): a sleek talent agency at night, dark
# offices in blue-grey, an interview panel in black suits and ties, keys and a lanyard, a contract signed, red stilettos,
# a girl crawling on the floor, a fast-food lunch at the boardroom table, a wardrobe brawl over the clothes, an icy boss
# in a black suit judging from a white chair, and a glossy red box under white light panels where the group dances the
# choreography (claws, prowls) in black, then in white fringe.
# Ours, "the agency" (new structure, HYPOCRITE: the strict one who shames everyone for breaking a rule is caught breaking
# it, worse, behind closed doors): Kob is the CEO of an ice-cold talent agency with a NO ANIMALS sign by her door, in an
# office where everyone is an animal in a suit. Saxo, the scruffy new hire in his own check suit, can't help dancing the
# claw move at his desk; she steps out, thumbs at the sign and slams her door in his face. Every chorus line an instinct
# slips out: the floor in front of her door lights up like a dance floor and he dances on it, the paper ball Sadi (her
# assistant) throws at the bin is fetched in mid-air, Sadi chases Compote (security) round the desks. Every "behind closed
# doors" lands on that black door: a slam, a thump and a red light pulsing under it, three faces at the gap, then the
# whole office dancing in front of it until she opens it on them and they freeze. On the bridge Compote plays the CCTV:
# behind her closed door the CEO knocks her mug off the desk, dances on it and leaps about her red office. On the final
# chorus's "behind closed doors" they burst in and catch her mid-move on her desk; she shrugs, leads the claw dance in
# her red box, beckons the whole office in, and the door closes behind them all; on the CCTV's last bar she spots the
# camera, rears up and swats it, and the feed dies to static.
# Beats: 149.9972 BPM, kit beat b at b * 60 / 149.9972 s (kit beat 0 = song beat 228, chorus 2's downbeat); a bar = 4
# beats (1.6 s). Sections: b0-64 chorus 2 (lines of 2 bars), b64-68 an instrumental bar, b68-103.6 the bridge (the song's
# loudest bars: the dance break), b103.6-160 the final chorus to the song's own end. Acted words (kit beats): 'control'
# b5.45, b37.45, b101.35, b133.45; 'doors' b14.20, b46.20, b110.20, b142.30 ('behind' 3 beats before); 'floor' b22.02,
# b54.02, b118.02, b150.02 ('dance' half a beat before); 'animal' b27.17, b59.20, b123.20, b155.20 ('move' 3 beats
# before); 'night' b90.10. The lyrics stay in episodes/2026-10-03.lyrics.js.
import json, math, os, re, sys
sys.path.insert(0, os.path.dirname(__file__))
from cam import view, deadpan, swoop, low

HERE = os.path.dirname(__file__)
PER = 60 / 149.9972
def T(b): return b * PER
def S(b, b0): return round(T(b) - T(b0), 3)    # seconds from shot beat b0 to beat b

LOOK = {'saxo': 'saxo', 'sadi': 'assistant', 'kob': 'ceo', 'compote': 'bouncer'}
HEAD = {'saxo': 1.32, 'sadi': 1.28, 'kob': 1.3, 'compote': 1.42}     # the top of each head standing (Sadi's bow, Compote's ears)
FACE = {'saxo': 0.9, 'sadi': 0.84, 'kob': 0.86, 'compote': 0.86}
RAD = {'saxo': 0.42, 'sadi': 0.38, 'kob': 0.38, 'compote': 0.38}     # a head's silhouette radius with ears
DROP = 0.3                                     # a seated body's head sits ~0.3 m lower than standing (male_driving_a_car)

# the map (src/maps25.js AGENCY)
SIGN = (-1.2, 1.62); ASSIST = (1.95, 1.3); BIN = (3.05, 1.75); SECURITY = (-4.4, 1.75)
OPERATOR = (SECURITY[0], SECURITY[1] + 0.67)      # Compote's seat at the console, facing its screens (-z)
WATCH_L, WATCH_R = (-4.98, 2.98), (-3.82, 2.98)   # Saxo and Sadi behind her chair
SAXO_DESK = (-2.4, 4.6); DESKS_X, DESKS_Z = (-4.6, -2.4, 2.4, 4.6), (4.6, 7.0, 9.4)
DESK, DESK_W, DESK_D, DESK_Y, CHAIR = (1.4, -3.6), 1.7, 0.75, 0.555, (1.4, -4.45)
CAM = (3.05, 2.92, -0.5)
CLAW = dict(arm='both', aim='claw')            # the clip's claw choreography on top of a dance clip (ps1.js SWINGS.claw)
SX = (-0.95, 5.25)                             # Saxo's dance mark in the aisle beside his desk
ECH = {'compote': (-1.55, -6.2), 'saxo': (-0.78, -6.05), 'kob': (0.0, -5.8), 'sadi': (0.78, -6.05)}   # the line in the red box, the CEO a step in front   # the echelon in the red box: a diagonal line, the CEO in front

def A(who, clip, x, z, **o):
    return {'who': who, 'look': o.pop('look', LOOK[who]), 'clip': clip, 'x': round(x, 3), 'z': round(z, 3), 'face': o.pop('face', 'camera'),
            'yaw': o.pop('yaw', 0), 'at': o.pop('at', 'auto'), **o}
def yaw_to(frm, to): return round(math.degrees(math.atan2(to[0] - frm[0], to[1] - frm[1])), 1)

# ---- a projection check (numbers only): where each face lands in the 9:16 frame at the shot's start and end ----
def _proj(cam, look, fov, pt):
    f = [look[i] - cam[i] for i in range(3)]; n = math.sqrt(sum(v * v for v in f)); f = [v / n for v in f]
    r = [-f[2], 0.0, f[0]]; rn = math.sqrt(r[0] ** 2 + r[2] ** 2) or 1; r = [r[0] / rn, 0.0, r[2] / rn]
    u = [r[1] * f[2] - r[2] * f[1], r[2] * f[0] - r[0] * f[2], r[0] * f[1] - r[1] * f[0]]
    d = [pt[i] - cam[i] for i in range(3)]; z = sum(a * b for a, b in zip(d, f))
    if z <= 0.05: return None
    tv = math.tan(math.radians(fov) / 2); th = tv * 9 / 16
    return (0.5 + sum(a * b for a, b in zip(d, r)) / z / th / 2, 0.5 - sum(a * b for a, b in zip(d, u)) / z / tv / 2)
_src = open(os.path.join(HERE, '2026-10-03.lyrics.js')).read()
_rows = json.loads(re.search(r'window\.LYRICS = (.*?);\n', _src).group(1)); _ends = json.loads(re.search(r'window\.LINE_END = (.*?);\n', _src).group(1))
LINES = [((row[0][0] - 0.35) / PER, e / PER) for row, e in zip(_rows, _ends)]
def has_line(b0, b1): return any(a < b1 and b > b0 for a, b in LINES)
WARN = []
def body(a, end):                               # (who, x, z, face y, head top y) of an actor at the shot's start (0) or end (1)
    who = a['who']; seated = a['clip'] == 'male_driving_a_car'
    x, z = a['x'] + a.get('mx', 0) * end, a['z'] + a.get('mz', 0) * end
    lift = a.get('lift', 0) + (a.get('my', 0) if end else 0)
    if a['clip'].startswith('crawling'): return (who, x, z, lift + 0.42, lift + 0.82)   # on all fours: the head low and forward
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
# the map's box-pet staff hide near a lens and along its line of sight (their spots per layout, as the map lays them out)
STAFF_SEATS = [(x, z) for x in DESKS_X for z in DESKS_Z if (x, z) != SAXO_DESK]
def _staff_spots(layout):
    if layout == 'desks': return [(x, z + 0.55) for x, z in STAFF_SEATS]
    if layout == 'stand': return [(x, z + 0.95) for x, z in STAFF_SEATS]
    if layout == 'peek': return [(-0.32, 0.3), (0.32, 0.3), (0, 0.62), (-0.55, 0.95), (0.55, 0.95), (-0.2, 1.3), (0.25, 1.35), (-0.75, 1.6), (0.8, 1.6), (0, 1.95), (-0.5, 2.25)]
    if layout == 'red': return ([(x, z) for z in (-6.6, -7.4) for x in (-2.0, -1.0, 0.0, 1.0)] + [(x, -8.05) for x in (-1.5, -0.5, 0.5)])[:len(STAFF_SEATS)]
    return []
def clear_for(v, layout='desks', actors=(), extra=()):
    c, f = v; p = lens(v, 0); q = lens(v, -1); look = (f[0], f[1])
    pts = [(p[0], p[2], 0.9), (q[0], q[2], 0.9)] + [(a['x'], a['z'], 0.55) for a in actors] + list(extra)
    for k in range(1, 6):   # the first stretch of the line of sight: nobody's back filling the lens
        u = k / 10; pts.append((p[0] + (look[0] - p[0]) * u, p[2] + (look[1] - p[2]) * u, 0.55))
    spots = _staff_spots(layout)
    return [[round(x, 2), round(z, 2), r] for x, z, r in pts if any((sx - x) ** 2 + (sz - z) ** 2 < r * r for sx, sz in spots)]
def add(beat, b1, actors, lyric, v, **o):
    c, focus = v
    o = {k: val for k, val in o.items() if val is not None}
    shots.append({'beat': beat, 'kind': 'dance', 'map': 'agency', 'actors': actors, 'lyric': lyric, 'cam': c, 'focus': focus, **o})
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
def lens_for(actors, ang, dist, b0, b1, hs=(1.0,), fov=50, look=None, spread=40, dr=(0.8, 1.5), free=None, push=0.03, **o):
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

# where a lens may stand: inside the office or the red box, never inside a desk, a chair, a monitor or the walls
def _in_box(c, x0, x1, z0, z1, y1): return x0 < c[0] < x1 and z0 < c[2] < z1 and c[1] < y1
def office(c):
    x, y, z = c
    if not (-6.85 < x < 6.85 and 0.12 < z < 11.85 and 0.08 < y < 3.3): return False
    for dx in DESKS_X:
        for dz in DESKS_Z:
            if _in_box(c, dx - 0.7, dx + 0.7, dz - 0.45, dz + 0.85, 1.05): return False
    if _in_box(c, ASSIST[0] - 0.75, ASSIST[0] + 0.75, ASSIST[1] - 0.4, ASSIST[1] + 0.4, 1.05): return False
    if _in_box(c, SECURITY[0] - 0.9, SECURITY[0] + 0.9, SECURITY[1] - 0.4, SECURITY[1] + 0.4, 1.45): return False
    return True
def redbox(c):
    x, y, z = c
    if not (-4.1 < x < 4.1 and -8.3 < z < -0.3 and 0.08 < y < 3.1): return False
    if _in_box(c, DESK[0] - 0.95, DESK[0] + 0.95, DESK[1] - 0.45, DESK[1] + 0.45, 0.75): return False
    if _in_box(c, CHAIR[0] - 0.5, CHAIR[0] + 0.5, CHAIR[1] - 0.5, CHAIR[1] + 0.4, 1.3): return False
    return True
def anywhere(c): return office(c) or redbox(c)
BANK = (-4.97, -3.83, 0.6, 1.4, 1.53, 1.71)       # the CCTV bank's box (x0, x1, y0, y1, z0, z1)
def clear_of_bank(actors):                      # a free() that also keeps the bank off every line from the lens to a face
    faces = [(b[1], b[3], b[2]) for b in (body(a, 0) for a in actors)]
    def ok(c):
        if not office(c): return False
        for f in faces:
            for k in range(1, 40):
                u = k / 40; x, y, z = (c[i] + (f[i] - c[i]) * u for i in range(3))
                if BANK[0] < x < BANK[1] and BANK[2] < y < BANK[3] and BANK[4] < z < BANK[5]: return False
        return True
    return ok
DESK_BOXES = [(dx - 0.7, dx + 0.7, 0.0, 1.15, dz - 0.45, dz + 0.85) for dx in DESKS_X for dz in DESKS_Z] + \
    [(ASSIST[0] - 0.75, ASSIST[0] + 0.75, 0.0, 1.1, ASSIST[1] - 0.4, ASSIST[1] + 0.4), (BANK[0], BANK[1], 0.0, BANK[3], BANK[4] - 0.25, BANK[5])]
def clear_of_desks(actors, n=40):               # a free() for the office: no desk, monitor or console on a line to a face or a body
    pts = [(b[1], y, b[2]) for e in (0, 1) for b in (body(a, e) for a in actors) for y in (b[3], 0.45)]
    def ok(c):
        if not office(c): return False
        for f in pts:
            for k in range(1, n):
                u = k / n; x, y, z = (c[j] + (f[j] - c[j]) * u for j in range(3))
                if any(x0 < x < x1 and y0 < y < y1 and z0 < z < z1 for x0, x1, y0, y1, z0, z1 in DESK_BOXES): return False
        return True
    return ok
def thru_door(c):                               # in the red box, or in the office straight out from the doorway (it frames the view)
    return redbox(c) or (office(c) and abs(c[0]) < 0.3 and c[2] < 2.6)

# ================= ACT 1, chorus 2's first half (b0-32): the rule =================
# S01 the hook: a swoop over the desks and down the aisle to Saxo, the scruffy new hire in his check suit, dancing the
# clip's claw move beside his desk among the staff typing away in black suits; the CEO's black door far behind him
s01 = [A('saxo', 'charleston', SX[0], SX[1], at=0.25, flapPh=0.5, upAt=-1, **CLAW)]   # strikes on the off-beats: frame 1 opens on the paws-up claw (on the beat, pose B's paws sat at his muzzle: "nibbling", the critic)
v = swoop([(-0.1, 1.6, 8.0), (-0.25, 1.25, 7.6), (-0.55, 0.64, 7.2), (-0.8, 0.3, 6.85)], (SX[0], 1.0, SX[1]),   # frame 1: the NO ANIMALS sign whole beside his head, under the lyric rows
           fov=60, roll=(0, -3, -10, -6), hand=0.15)
add(0, 4, s01, "HOOK: night, a sleek dark talent agency: from high over the rows of desks and the staff typing in black suits, the lens dives down the aisle to Saxo, the new hire in his scruffy check suit, dancing the claw move beside his desk; the CEO's black door far behind him",
    v, key=[round(SX[0] + 0.9, 2), 1.7, round(SX[1] + 1.6, 2), 1.0, 0.84, 0.62], clear=clear_for(v, 'desks', s01), stars=['saxo'])
# S02 the beat drop: Saxo loses all control: he bounces off the carpet with his claws out, and the staff at the desks round him gape
s02 = [A('saxo', 'happy_idle', SX[0], SX[1], face='world', yaw=round(yaw_to(SX, (0.75, 7.25)) - 28, 1), at=0.4, speed=0.6, hop=[0.3, 1], air=True, **CLAW)]
v = view((0.75, 1.55, 7.25), (SX[0], 0.85, SX[1]), 52, p1=(0.62, 1.48, 7.02), roll=[-4, -2], hand=0.4)
add(4, 8, s02, "the beat drops (b5.45): from his front right, a little above him: Saxo loses all control, bouncing off the carpet on every beat with both paws clawing, the night city behind him",
    v, stare=[SX[0], SX[1]], gasp=True, clear=clear_for(v, 'desks', s02), stars=['saxo'])
# S03 the CEO's door swings open: Kob, in her black power suit and pearls, steps into the doorway and stares, deadpan;
# the red glow of her office behind her
s03 = [A('kob', 'bored_idle', 0.05, 0.45, at=1.0, speed=0.4)]
v = deadpan((0.05, 0.45), 1.06, 2.0, cam_y=1.06, push=0.06, fov=40)
add(8, 12, s03, "the black door marked CEO swings open: Kob, the CEO, in a sharp black power suit with gold buttons and pearls, stands in the doorway, deadpan, the red glow of her office behind her",
    v, door=[0.0, 0.42, 0.0, 0.92], stars=['kob'])
# S04 'behind': she thumbs over her shoulder at the NO ANIMALS sign on the wall beside her door
s04 = [A('kob', 'pointing_behind_with_thumb', -0.78, 0.55, at=0.55)]
v = view((-0.92, 1.02, 3.3), (-0.92, 1.3, 0.3), 46, p1=(-0.92, 1.02, 3.2), ease='lin')
add(12, 14, s04, "'behind' (b11.15) ... 'closed' (b13.42): Kob jerks her thumb over her shoulder at the sign on the wall beside her door: NO ANIMALS (a paw print in a red prohibition circle)",
    v, door=0.92, stars=['kob'])
# S05 'doors': the door slams in his face; he recoils, nose first
s05 = [A('saxo', 'being_surprised_and_looking_right', 0.1, 0.85, at=0.15)]
v = view((0.25, 0.98, 3.25), (0.1, 1.08, 0.6), 48)
add(14, 16, s05, "'doors' (b14.20): the black door slams shut behind Saxo on the word, rattling; he freezes, caught, the CEO plate over his head",
    v, door=[0.0, 0.09, 0.92, 0.0], shake=[0.09], redUnder=[0.3, 0.6, 0, 1], stars=['saxo'])
# S06 'dance floor': the floor in front of her door lights up like a dance floor, red light pulsing under the door: he
# can't help it and dances on it
s06 = [A('saxo', 'charleston', 0.0, 1.35, at=0.7, **CLAW)]
v = low((0.45, 0.22, 4.45), (0.0, 0.8, 1.35), (0.35, 0.22, 3.55), fov=60, roll=(-8, -5), hand=0.3)
add(16, 24, s06, "'dance' (b21.45), 'floor' (b22.02): red light pulses out from under the CEO's door and the carpet tiles in front of it light up like a dance floor, square by square; Saxo can't help it: he dances a charleston on it, claws out",
    v, redUnder=1, glow=[0.3, S(21.45, 16), 0.15, 1.0], stars=['saxo'])
# S07 'animal': the fetch: Sadi, the CEO's assistant, tosses a crumpled paper ball at her bin; he leaps and catches it
T_CATCH = S(27.17, 24)
s07 = [A('sadi', 'happy_idle', 1.45, 0.72, face='world', yaw=12, at=0.4, hold='paperball', arm='R', aim=[0.2, 0.55, 0.8], upAt=round(T_CATCH - 0.75, 3), upEnd=round(T_CATCH - 0.35, 3),
         toss={'at': round(T_CATCH - 0.5, 3), 'to': [2.68, 0.98, 2.58], 'dur': 0.5, 'arc': 0.45, 'scale': 1.8}),
       A('saxo', 'jump_and_catch_with_one_hand', 2.95, 2.4, face='world', yaw=0, at=round(1.45 - T_CATCH, 3), hold='paperball', holdFrom=T_CATCH)]
v = view((6.6, 1.05, 2.1), (2.25, 0.95, 1.72), 52)
add(24, 28, s07, "'animal' (b27.17): Sadi, the CEO's assistant (black suit, tie, staff badge, pink bow), tosses a crumpled paper ball at her bin from behind her desk; Saxo leaps up in front of the bin and catches it in one paw, like a dog",
    v, redUnder=1, clear=clear_for(v, 'desks', s07), stars=['saxo'])
# S08 Compote, security, at her desk under the CCTV screens, glares at him, chewing her carrot
s08 = [A('compote', 'bored_idle', -3.35, 2.45, at=2.0, speed=0.4, hold='carrot')]
v = deadpan((-3.35, 2.45), 0.96, 2.8, cam_y=1.02, push=0.06, fov=42, ang=40)
add(28, 32, s08, "Compote, the agency's security (black suit, earpiece, shades on her forehead), stands by her console of CCTV screens, carrot in paw, glaring at him",
    v, monitors=0.4, clear=clear_for(v, 'desks', s08), stars=['compote'])

# ================= ACT 2, chorus 2's second half (b32-64): the slips =================
# S09 Compote patrols past the assistant's desk with her carrot; Sadi's eyes lock onto the bunny
s09 = [A('compote', 'happy_walk', -0.5, 2.3, face='world', yaw=90, at=0.2, speed=0.75, mx=1.0, hold='carrot'),
       A('sadi', 'happy_idle', 1.45, 0.72, face='world', yaw=-40, at=0.6, speed=0.3)]
v = lens_for(s09, -8, 5.0, 32, 36, hs=(0.85, 1.0), fov=50, free=office, spread=20, dr=(0.85, 1.35), look=(0.35, 0.86, 1.7))
add(32, 36, s09, "Compote walks her patrol past the assistant's desk, carrot in paw; behind the desk Sadi turns her head and stares at the bunny",
    v, clear=clear_for(v, 'desks', s09), stars=['sadi'])
# S10 the chase: Sadi loses control and chases the bunny across the office, both mid-run in three-quarter view, the bunny's paws flailing
s10 = [A('compote', 'happy_run', 0.75, 2.9, face='world', yaw=-72, at=0.3, speed=1.3, mx=-1.15, mz=0.37, arm='both', aim='flail'),
       A('sadi', 'happy_run', 1.375, 2.07, face='world', yaw=-72, at=0.75, speed=1.3, mx=-1.15, mz=0.37, **CLAW)]
v = lens_for(s10, -107, 3.9, 36, 40, hs=(0.75, 0.95, 1.15), fov=56, free=clear_of_desks(s10), spread=30, dr=(0.85, 1.3))   # ahead of them on Sadi's side: her lane clear of the bunny
add(36, 40, s10, "(b37.45): Sadi loses it and chases Compote across the office like a dog after a rabbit: both mid-run in three-quarter view, the bunny in front flailing her paws in panic, Sadi a stride behind her with her claws out",
    v, clear=clear_for(v, 'desks', s10), stars=['sadi'])
# S11 'behind': a thump behind the CEO's door stops them dead: the three, backs to us, stare at the black door rattling in
# its frame, red light flashing under it
s11 = [A('compote', 'happy_idle', -0.95, 2.05, face='world', yaw=180, at=0.5, speed=0.2, fg=True),
       A('saxo', 'happy_idle', 0.05, 2.2, face='world', yaw=180, at=1.2, speed=0.2, fg=True),
       A('sadi', 'happy_idle', 1.0, 2.05, face='world', yaw=180, at=0.9, speed=0.2, fg=True)]
v = view((0.1, 1.7, 5.6), (0.0, 1.0, 0.3), 50)
add(40, 44, s11, "'behind' (b43.15): a thump behind the CEO's door: the three stop dead, backs to us, staring at the black door as it rattles in its frame, red light flashing out from under it",
    v, redUnder=1, shake=[0.35, S(43.15, 40)], clear=clear_for(v, 'desks', s11), stars=['saxo'])
# S12 from under the door: the three down on all fours at the gap, faces lit red, trying to see in
s12 = [A('compote', 'crawling_forward_on_hands_and_knees', -0.6, 3.0, face='world', yaw=180, at=0.9, speed=0.0, noLie=True),
       A('saxo', 'crawling_forward_on_hands_and_knees', 0.0, 2.95, face='world', yaw=180, at=0.9, speed=0.0, noLie=True),
       A('sadi', 'crawling_forward_on_hands_and_knees', 0.6, 3.0, face='world', yaw=180, at=0.9, speed=0.0, noLie=True)]
v = view((0.0, 0.2, 0.12), (0.0, 0.58, 2.95), 80)
add(44, 48, s12, "(b46.20): from the gap under the CEO's door, at floor level: the three down on all fours side by side, faces to the carpet, lit red by the light that comes out under the door, trying to see in",
    v, redUnder=0.6, noPool=True, clear=clear_for(v, 'desks', s12), stars=['saxo'])
# S13 the beat through the door gets them: the tiles light up again and the three dance on them, claws out
s13 = [A('compote', 'shimmy', -1.0, 1.55, at=0.4, **CLAW), A('saxo', 'charleston', 0.0, 1.3, at=1.1, **CLAW), A('sadi', 'twist', 1.0, 1.55, at=0.7, **CLAW)]
v = lens_for(s13, 0, 4.5, 48, 52, hs=(0.3, 0.45), fov=56, free=office, spread=10, dr=(0.9, 1.2), roll=[-7, -4], hand=0.3)
add(48, 52, s13, "the muffled beat through the door gets them: the floor tiles light up again and the three dance on them in front of the black door, claws out",
    v, redUnder=1, glow=1, clear=clear_for(v, 'desks', s13), stars=['saxo'])
# S14 'dance floor': high and wide: the whole office is up and dancing at its desks, the three on the glowing floor
s14 = [A('compote', 'shimmy', -1.0, 1.55, at=2.0, **CLAW), A('saxo', 'charleston', 0.0, 1.3, at=2.7, **CLAW), A('sadi', 'twist', 1.0, 1.55, at=2.3, **CLAW)]
v = view((0.15, 3.25, 5.6), (0.0, 0.4, 1.4), 58, p1=(0.15, 3.18, 5.45))
add(52, 56, s14, "'dance' (b53.45), 'floor' (b54.02): from high above: the three dancing on the lit-up squares in front of the CEO's door, the dance floor of the office, the three on the glowing floor in front of the CEO's door",
    v, redUnder=1, glow=1, stare=[0.0, 1.4], gasp=True, stars=['saxo'])
# S15 'animal': the door swings open behind them: Kob in the doorway, deadpan; they freeze mid-claw on the word
T_FREEZE = S(59.2, 56)
s15 = [A('compote', 'shimmy', -0.85, 1.95, at=0.5, holdAt=T_FREEZE, flapPh=0.7, **CLAW), A('saxo', 'charleston', 0.8, 1.6, at=1.2, holdAt=T_FREEZE, flapPh=0.7, **CLAW),
       A('sadi', 'twist', 1.55, 2.45, at=0.9, holdAt=T_FREEZE, flapPh=0.7, **CLAW), A('kob', 'bored_idle', 0.0, -0.05, at=1.0, speed=0.3)]
v = lens_for(s15, -5, 6.0, 56, 60, hs=(1.3, 1.5, 1.7), fov=56, free=office, spread=20, dr=(0.85, 1.3), look=(0.3, 0.95, 1.3))
add(56, 60, s15, "'animal' (b59.20): the door swings open behind them: Kob in the doorway, deadpan, red light behind her; the three freeze mid-claw on the word",
    v, door=[0.35, 0.8, 0.0, 0.92], glow=[0.6, 1.2, 1.0, 0.0], staff='stand', clear=clear_for(v, 'stand', s15), stars=['kob'])
# S16 her stare, a new angle: lower, closer, from the office
s16 = [A('kob', 'bored_idle', 0.0, -0.05, at=1.6, speed=0.3)]
v = deadpan((0.0, -0.05), 1.05, 2.1, cam_y=0.72, push=0.08, fov=40, ang=-32)
add(60, 64, s16, "Kob's stare, from lower down and off to the side: the CEO in her doorway, the red office behind her, unimpressed",
    v, door=0.92, staff='stand', gasp=True, clear=clear_for(v, 'stand', s16), stars=['kob'])
# S17 the instrumental bar: she slams the door again; the three, in a queue facing it, slump
s17 = [A('saxo', 'disappointed_awe_shucks', 0.05, 0.6, face='world', yaw=180, at=0.3), A('sadi', 'disappointed_awe_shucks', -0.05, 1.22, face='world', yaw=180, at=0.5),
       A('compote', 'disappointed_awe_shucks', 0.05, 1.84, face='world', yaw=180, at=0.2)]
v = lens_for(s17, 70, 3.7, 64, 68, hs=(1.0, 1.15, 1.3), fov=54, free=office, spread=20, dr=(0.85, 1.35), look=(0.0, 1.0, 1.1))
add(64, 68, s17, "the instrumental bar: side on: the door shut in their faces again, the three, in a queue facing it, slump",
    v, redUnder=1, staff='desks', stars=['saxo'])

# ================= ACT 3, the bridge (b68-103.6): the CCTV =================
# S18 the three crowd round Compote's CCTV screens, their backs to us; on one screen, a red room
s18 = [A('compote', 'male_driving_a_car', OPERATOR[0], OPERATOR[1], face='world', yaw=180, at=0.4, speed=0.3, lift=0.2, fg=True),
       A('saxo', 'happy_idle', WATCH_L[0], WATCH_L[1], face='world', yaw=180, at=0.6, speed=0.3, lean=10, fg=True),
       A('sadi', 'happy_idle', WATCH_R[0], WATCH_R[1], face='world', yaw=180, at=1.1, speed=0.3, lean=10, fg=True)]
v = view((-4.4, 2.3, 3.85), (-4.4, 0.95, 1.62), 56, p1=(-4.4, 2.25, 3.75))
add(68, 72, s18, "the bridge: at the security desk, the three crowd round Compote's bank of CCTV screens, their backs to us; on one screen, a red room",
    v, monitors=1, clear=clear_for(v, 'desks', s18, extra=[(-4.6, 5.15, 1.0)]), stars=['compote'])
# S19 the CCTV, CAM 03: behind her closed door, the CEO sits at her desk in her white chair, typing, all business
s19 = [A('kob', 'male_driving_a_car', CHAIR[0], CHAIR[1], face='world', yaw=0, at=0.4, speed=0.5, lift=0.26)]
v = view(CAM, (1.25, 0.72, -3.95), 62)
add(72, 76, s19, "the CCTV, CAM 03, in grey: behind her closed door the CEO sits at her black desk in her white egg chair, typing, all business",
    v, zone='red', mono=True, cctv='CAM 03 · CEO', still=True, stars=['kob'])
# S20 the CCTV, closer: she climbs onto her desk, stares straight into the camera... and, still staring, pushes her mug off it
# with one paw, the cat's way (the critic's fix: the meme where the cat looks at you while it knocks something off the table)
T_MUG = 1.05
K20, LENS20 = (1.3, -3.6), (2.05, 2.45, -1.5)
_k20 = math.radians(yaw_to(K20, (LENS20[0], LENS20[2])))
MUG_DIR = (round(math.cos(_k20), 3), round(-math.sin(_k20), 3))                       # her left, as she faces the lens
MUG_AT = (round(K20[0] + MUG_DIR[0] * 0.33 + math.sin(_k20) * 0.18, 3), round(K20[1] + MUG_DIR[1] * 0.33 + math.cos(_k20) * 0.18, 3))
MUG_SLIDE = round((2.25 - MUG_AT[0]) / MUG_DIR[0], 3)                                    # to the desk's right edge
s20 = [A('kob', 'happy_idle', K20[0], K20[1], lift=DESK_Y, face='world', yaw=yaw_to(K20, (LENS20[0], LENS20[2])), at=1.0, speed=0.4,
         arm='L', aim=[0.5, -0.62, 0.6], aim2=[0.95, -0.28, 0.12], aim2At=round(T_MUG - 0.08, 3))]
v = view(LENS20, (1.7, 1.4, -3.5), 58)   # the mug mid-frame, above the CCTV's REC band (review 3: the timecode sat on it)
add(76, 80, s20, "the CCTV, CAM 03, closer: the CEO stands on top of her black desk and stares straight into the security camera... and, still staring at it, pushes her big white mug off the desk with one paw, the cat's way; it falls to the floor",
    v, zone='red', mono=True, cctv='CAM 03 · CEO', still=True, mug=T_MUG, mugAt=list(MUG_AT), mugDir=list(MUG_DIR), mugSlide=MUG_SLIDE, mugScale=1.6,
    cctvClock=85636, stars=['kob'])
# S21 the three turn from the screens, aghast, side by side facing us; Compote drops her carrot
s21 = [A('compote', 'long_yell_while_standing_leaning_back', -5.3, 2.75, at=0.4, hold='carrot', toss={'at': 0.3, 'to': [-5.05, 0.05, 3.25], 'dur': 0.4, 'arc': 0.2}),
       A('saxo', 'long_yell_while_standing_leaning_back', -4.35, 2.6, at=0.65),
       A('sadi', 'long_yell_while_standing_leaning_back', -3.4, 2.75, at=0.5)]
v = lens_for(s21, 20, 4.4, 80, 84, hs=(1.0, 1.2, 1.4, 1.65), fov=56, free=clear_of_desks(s21), spread=45, dr=(0.85, 1.25))
add(80, 84, s21, "the three turn from the CCTV screens, aghast, side by side facing us, leaning back with their mouths open; Compote drops her carrot: their boss is an animal",
    v, monitors=1, clear=clear_for(v, 'desks', s21), stars=['saxo'])
# S22 the CCTV: she jumps on her desk and dances on it, wild, claws out (the dance break)
s22 = [A('kob', 'gangnam', DESK[0], DESK[1], lift=DESK_Y, at=0.5, **CLAW)]
v = view((-1.7, 2.55, -1.1), (1.4, 0.95, -3.6), 54)
add(84, 92, s22, "the dance break, on the CCTV: the CEO dances on top of her desk, wild, claws out ('night' b90.10)",
    v, zone='red', mono=True, cctv='CAM 05 · CEO', still=True, mug=-9, cctvClock=85641, stars=['kob'])
# S23 the CCTV, CAM 04 from the far corner: she leaps about her red office, swatting at nothing like a cat
s23 = [A('kob', 'jumping_and_swatting_at_a_ball', -2.0, -5.7, face='world', yaw=yaw_to((-2.0, -5.7), (-3.95, -8.2)), at=0.2)]
v = view((-3.95, 2.85, -8.2), (-2.0, 0.85, -5.7), 56)
add(92, 96, s23, "the CCTV, CAM 04, from the far corner: the CEO leaps about her red office, swatting at nothing like a cat",
    v, zone='red', mono=True, cctv='CAM 04 · CEO', still=True, mug=-9, cctvClock=85649, stars=['kob'])
# S24 the three march from the security desk to her door, side on, Compote in front
s24 = [A('compote', 'happy_walk', -2.0, 1.2, face='world', yaw=90, at=0.1, speed=1.1, mx=0.9, hold='carrot'),
       A('saxo', 'happy_walk', -2.65, 1.25, face='world', yaw=90, at=0.5, speed=1.1, mx=0.9),
       A('sadi', 'happy_walk', -3.3, 1.2, face='world', yaw=90, at=0.8, speed=1.1, mx=0.9, reveal=0.6)]
v = view((-1.6, 1.65, 6.6), (-1.6, 0.9, 1.1), 62)
add(96, 100, s24, "side on: the three march to the CEO's door, Compote in front with her carrot",
    v, redUnder=1, clear=clear_for(v, 'desks', s24), stars=['compote'])
# S25 'control': at the door: Saxo's paw on the handle, the others at his sides, red light pulsing under it
s25 = [A('saxo', 'happy_idle', 0.12, 0.45, face='world', yaw=180, at=0.5, speed=0.3, arm='R', aim=[0.25, 0.28, 0.93])]
v = view((2.65, 1.12, 0.52), (0.3, 1.02, 0.4), 50)
add(100, 104, s25, "'control' (b101.35): at the black door: Saxo's paw closes on the handle, the red light pulsing under it",
    v, redUnder=1, clear=clear_for(v, 'desks', s25), stars=['saxo'])
# S26 from the door's foot, looking up: their three faces over the handle, lit red, about to go in
s26 = [A('kob', 'gangnam', DESK[0], DESK[1], lift=DESK_Y, at=0.9, **CLAW)]
v = view((-2.4, 1.35, -5.7), (1.3, 1.35, -3.6), 46, p1=(-2.2, 1.35, -5.6), ease='lin')
add(104, 108, s26, "the final chorus begins: inside the red box, in colour at last: the CEO dances on top of her desk, wild, unaware",
    v, zone='red', pulse=True, mug=-9, stars=['kob'])

# ================= ACT 4, the final chorus (b104-160): behind closed doors =================
# S27 the burst-in, from inside the red box: the door bursts open on the word and Saxo stands in the doorway, aghast, mouth wide
# open (alone in it: two chibis in a 1.2 m doorway merge; the reverse, next, is what he sees)
T_BURST = S(110.2, 108)
s27 = [A('saxo', 'long_yell_while_standing_leaning_back', 0.0, 0.25, at=0.4)]
v = view((0.1, 0.98, -3.0), (0.0, 0.9, 0.2), 46)
add(108, 112, s27, "(b110.20): from inside the CEO's red box, facing her door: it bursts open on the word and Saxo stands in the doorway, aghast, leaning back with his mouth wide open (the next shot, the reverse, is what he sees)",
    v, zone='red', door=[round(T_BURST - 0.12, 3), round(T_BURST, 3), 0.0, 0.95], mug=-9, staff='desks', stars=['saxo'])
# S28 the reverse: the CEO caught on top of her desk mid-claw, frozen, in full red
s28 = [A('kob', 'gangnam', DESK[0], DESK[1], lift=DESK_Y, face='world', yaw=yaw_to(DESK, (0.0, 0.3)), at=1.3, holdAt=0.0, flap=0, upAt=-1, **CLAW)]
v = view((0.15, 1.0, -0.6), (1.38, 1.38, -3.6), 44, p1=(0.2, 1.0, -0.75), ease='lin')
add(112, 116, s28, "the reverse: the CEO caught on top of her desk mid-move, claws up, frozen, in full red",
    v, zone='red', door=0.95, mug=-9, stars=['kob'])
# S29 'dance floor': she shrugs it off, jumps down onto the red floor and dances: the panels pulse on the beat
s29 = [A('kob', 'charleston', 0.55, -2.6, at=0.9, **CLAW)]
v = low((1.0, 0.24, -0.75), (0.55, 0.82, -2.6), (0.9, 0.24, -1.1), fov=62, roll=(9, 5), hand=0.3)
add(116, 120, s29, "'dance' (b117.45), 'floor' (b118.02): the CEO shrugs it off, jumps down onto her red floor and dances, the ceiling panels flashing on the beat",
    v, zone='red', pulse=True, door=0.95, mug=-9, stars=['kob'])
# S30 'animal': the four in formation in the red box, claws in sync on the word (seen from the doorway)
s30 = [A(w, 'charleston', *ECH[w], at=1.4, **CLAW) for w in ('kob', 'sadi', 'saxo', 'compote')]
v = lens_for(s30, 0, 5.4, 120, 124, hs=(1.2, 1.45, 1.7), fov=60, free=redbox, spread=10, dr=(0.85, 1.1))
add(120, 124, s30, "'animal' (b123.20): the four in formation in the red box, KATSEYE style, the same claw move in sync on the word",
    v, zone='red', pulse=True, door=0.95, mug=-9, stars=['kob'])
# S31 a handheld orbit round them, low, the red box spinning past
s31 = [A(w, 'shimmy', *ECH[w], at=0.6, **CLAW) for w in ('kob', 'sadi', 'saxo', 'compote')]
v = view((-1.15, 0.55, -1.7), (-0.4, 0.88, -6.0), 64, p1=(-0.45, 0.55, -1.55), ease='lin', roll=[6, -4], hand=1.0)
add(124, 128, s31, "low and handheld round the four dancing in the red box, the white panels flashing over them",
    v, zone='red', pulse=True, door=0.95, mug=-9, stars=['saxo'])
# S32 'control': the office staff crowd the doorway, peering in; the CEO beckons them in like a lucky cat
s32 = [A('kob', 'happy_idle', -0.15, -2.7, at=0.4, speed=0.4, arm='R', aim='maneki')]
v = view((-0.12, 1.04, -0.5), (-0.15, 1.02, -2.7), 50, p1=(-0.12, 1.04, -0.65), ease='lin')
add(128, 136, s32, "'control' (b133.45): from the doorway, where the office staff crowd: inside the red box, the CEO beckons them in like a lucky cat",
    v, zone='red', pulse=True, door=0.95, mug=-9, staff='peek', stars=['kob'])
# S33 they pour in past the CEO clapping them in, a stream of staff through the doorway, and the door swings shut behind the last
T_SHUT = S(142.3, 136)
s33 = [A('kob', 'clap_while_standing', 0.95, -1.6, at=0.3)]
v = view((2.6, 1.45, -4.3), (-0.3, 0.85, -1.2), 54, p1=(2.5, 1.45, -4.15))
add(136, 144, s33, "(b139.50, b141.40, b142.30): the office staff pour into the red box past the CEO clapping them in, a stream of box pets in black suits filing in through the doorway one after another, and the door swings shut behind the last of them on the word",
    v, zone='red', pulse=True, door=[round(T_SHUT - 0.25, 3), T_SHUT, 0.95, 0.0], staff='pour', pourAt=-0.6, pourGap=0.17, pourDur=2.4, pourK=0.6, stars=['kob'])
# S34 'dance floor': the whole agency dancing in the red box, the four in front, the staff in rows behind, claws out
s34 = [A('kob', 'gangnam', *ECH['kob'], at=1.1, **CLAW), A('sadi', 'twist', *ECH['sadi'], at=0.9, **CLAW),
       A('saxo', 'twist', *ECH['saxo'], at=0.6, **CLAW), A('compote', 'shimmy', *ECH['compote'], at=0.6, **CLAW)]
v = view((-0.7, 2.9, -0.6), (-0.4, 0.75, -6.0), 58, p1=(-0.7, 2.7, -0.8), ease='lin', roll=[0, 4])
add(144, 152, s34, "'dance' (b149.45), 'floor' (b150.02): high from the corner: the whole agency dancing in the red box, the four in front, the staff in rows behind, claws out",
    v, zone='red', pulse=True, mug=-9, staff='red', claw=True, stars=['kob'])
# S35 the final pose, claws up on the word, the CEO in front, the staff's raised paws showing behind them (a higher lens)
s35 = [A(w, 'gangnam', ECH[w][0], ECH[w][1] + (0.75 if w == 'kob' else 0), at=1.25, flap=0, **CLAW) for w in ('kob', 'sadi', 'saxo', 'compote')]
v = lens_for(s35, 0, 5.3, 152, 156, hs=(2.15, 2.35, 2.55), fov=58, free=redbox, spread=15, dr=(0.88, 1.1), push=0.1, roll=[-5, -3])
add(152, 156, s35, "(b155.20): the final pose from a little above: all four with their claws up on the word, the CEO a step in front; behind them the whole staff in rows, paws up too",
    v, zone='red', pulse=True, mug=-9, staff='red', claw=True, stars=['kob'])
# S36 the last bar: the CCTV again, CAM 01 over the door: the whole agency dancing behind the closed door; the CEO notices the
# camera, looks up into it and rears up to swat it... on the last beat the feed dies (the critic's sting)
C2 = (-0.4, 2.9, -0.6)
T_LOST = S(159.5, 156)   # six frames of static, then the loop's first frame (a NO SIGNAL card held longer read as the end)
K36 = (-0.4, -4.3)   # 28 deg under the lens: from steeper the top of her head hid her face, and closer the REC label crossed her chin
s36 = [A('kob', 'jumping_and_swatting_at_a_ball', K36[0], K36[1], at=0.0, speed=0.23, face='world', yaw=yaw_to(K36, (C2[0], C2[2])), air=True),   # the swat's paw peaks at clip 0.3 s: on the last beat
       A('sadi', 'twist', *ECH['sadi'], at=2.5, face='world', yaw=yaw_to(ECH['sadi'], (C2[0], C2[2])), **CLAW),
       A('saxo', 'twist', *ECH['saxo'], at=2.2, face='world', yaw=yaw_to(ECH['saxo'], (C2[0], C2[2])), **CLAW)]
v = view(C2, (-0.4, 0.8, -6.0), 60)
add(156, 160, s36, "the last bar, on the CCTV (CAM 01 over the door): the whole agency dancing behind the closed door; the CEO, in front of them, notices the camera, looks up into it and rears up to swat it... on the last beat the feed dies to static and NO SIGNAL",
    v, zone='red', mono=True, cctv='CAM 01 · CEO', cctvLost=T_LOST, still=True, mug=-9, staff='red', claw=True, cctvClock=85702, stars=['kob'])

shots.sort(key=lambda x: x['beat'])
ep = {
    'date': '2026-10-03', 'song': {'title': 'Animal', 'artist': 'KATSEYE'},
    'logline': "Kob runs an ice-cold talent agency with a NO ANIMALS sign by her door and shames every staff pet whose instincts slip out; the security camera shows what the CEO does behind her closed door: she's the wildest animal of them all.",
    'new': "the HYPOCRITE structure (the strict one who shames everyone for breaking a rule is caught breaking it, worse, behind closed doors); src/maps25.js: agency (a talent agency's dark office at night with box-pet staff in black suits at their desks, glass walls on the city, the CEO's black door with a gold plate and a NO ANIMALS sign beside it, a red light that pulses under the door and floor tiles that light up like a dance floor in front of it, the assistant's desk and her bin, a security desk under four CCTV screens, and behind the door the clip's red box under white light panels with the CEO's black desk, her white egg chair, a mug that can be knocked off and a security camera in the corner; staff layouts at their desks, standing, peering in at the door, pouring in, in rows); the CCTV overlay (a shot's cctv: scanlines, viewfinder corners, a blinking REC with the camera's label, a timecode; with mono); the claw swing (the clip's choreography: both paws raised beside the head and angled forward, striking forward on the beat (never arms out at shoulder height: a T-pose)); the paper-ball prop (thrown and fetched); two looks (Kob's black power suit with gold buttons and pearls, Sadi's agency uniform with a tie and a staff badge); the CCTV's dead feed (a shot's cctvLost: a white flash, then static and NO SIGNAL, the 2D layer's noise seeded by the frame) for the sting, the CEO swatting the camera; the cat-knocks-the-mug-off-the-table meme on the CCTV (the map's mugAt, mugDir, mugSlide, mugScale)",
    'notes': "The clip (studied from a 360p copy): a sleek talent agency at night, dark blue-grey offices, an interview panel in black suits and ties, keys and a lanyard, a contract, red stilettos, a girl crawling on the floor, a fast-food lunch at the boardroom table, a wardrobe brawl, an icy boss in a black suit judging from a white chair, and a glossy red box under white light panels where the group dances the claw choreography. Ours keeps the dark agency, the black suits and ties, the icy boss in black (Kob, the CEO) and her white chair, the crawling (the three at the gap under the door), and the red box (the CEO's office behind the door, the dance floor), with the claw choreography as the move everyone does. The whole cast: Saxo the scruffy new hire in his own check suit (the outsider among the black suits: the reason he isn't in a clip look), whose instincts slip first (the claw dance at his desk, the glowing floor, the fetch); Sadi the CEO's perfect assistant (the reality check) who chases the bunny the moment she sees her; Compote the agency's security, always angry, who runs the CCTV and finds the boss out; Kob the CEO, who never goes out of her office and shames them all, secretly the best dancer, and the wildest animal of them all behind her closed door.",
    'with': ['sadi', 'kob', 'compote'],
    'clips': ['happy_idle', 'happy_walk', 'happy_run', 'bored_idle', 'pointing_behind_with_thumb', 'being_surprised_and_looking_right', 'jump_and_catch_with_one_hand',
              'crawling_forward_on_hands_and_knees', 'disappointed_awe_shucks', 'male_driving_a_car', 'long_yell_while_standing_leaning_back', 'jumping_and_swatting_at_a_ball',
              'male_cheering_with_two_fists_pump', 'clap_while_standing'],
    'yt': 'end',
    'tags': {'structure': 'hypocrite', 'scenes': ['cctv', 'fetch', 'chase', 'door'], 'cast': ['saxo', 'sadi', 'kob', 'compote'], 'hook': 'dance', 'maps': ['agency'], 'ref': 'home-cam',
             'lyric_literal': "'behind closed doors' (every one on the CEO's black door: the slam, the thump, the gap, the CCTV behind it, the burst-in, everyone shut in at the end), 'dance floor' (the tiles in front of her door light up, the red box), 'animal' (the claw move, the fetch, the freeze, the formation, the final pose), 'control' (losing it: the dance at his desk, the chase, the handle, the beckon)",
             'experiment': "Does a hypocrite-boss gag on a workplace everyone knows (the strict CEO caught on the security camera doing worse behind her closed door, the home-cam meme), opened on the dance, on a K-pop girl group's climbing hit (435k TikTok videos), get more shares per 1,000 views than our story plots?"},
    'shots': shots,
}
json.dump(ep, open(os.path.join(HERE, '2026-10-03.json'), 'w'), indent=1, ensure_ascii=False)
print(len(shots), 'shots;', len(WARN), 'warnings')
for w in WARN: print('  ', w)
