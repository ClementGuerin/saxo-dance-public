# The "Gabriela" episode (2026-10-13; KATSEYE, 2025): writes episodes/2026-10-13.json.
# Kit 2026-10-13: 79.309 s from inside the pre-chorus's dead silence (song grid beat 78) through chorus 1 (kit beats
# 0-64), verse 2 (64-96), pre-chorus 2 (96-128) and chorus 2 (128-192) to the gap after chorus 2's last line (kit beat
# 189.46), then a 0.63 s silent button (to kit beat 191). 146.011 BPM, kit beat 0 (chorus 1's downbeat) at 0.8218 s.
# The world (the official video, contact sheets): a telenovela at "Gabriela Enterprises", a corporate tower: the CEO in a
# red power suit is retiring and must name the next Gabriela; a wood-panelled boardroom, a long blue-grey marble table,
# black leather chairs, white torchiere lamps, window blinds, her portrait in red, white mugs with the red logo; the
# candidates in red halter dresses claim the title, a catfight on the boardroom table, a glass knocked over; the last
# shot is the CEO's white Persian cat in a gold collar. The words (whitelisted keywords per line, never the text): the
# chorus's 'hands' (the first word of four lines), 'Gabriela' (sixteen times), 'back' (twice a chorus), 'lover' in
# verse 2, 'come' in pre-chorus 2.
# The story (structure FRAMED, new: the newcomer commits every crime behind the boss's back and the lead takes the blame,
# each punishment worse; the payoff catches her in the act; the pet-owner universal: the cat knocks it off the table,
# the dog gets blamed):
#   0 (the pickup and chorus 1's first lines, b-2..30): Gabriela Enterprises' boardroom: the dog in the red rose dress
#     dances on the boardroom table for the board; in the foreground the boss's new white kitten pushes a glass off the
#     edge, staring at us; the CEO, admiring her portrait, turns 'back' at the crash: the dog is right over the puddle.
#   1 (chorus 1, b30..64): the board stares at him; Compote, the security, hangs a BAD DOG sign on him; he
#     dances on regardless; the kitten, petted by the CEO on her red cushion, pushes the vase of roses off; the dog
#     fetches a rose (he's a dog) and the CEO turns 'back' on him with the rose in his teeth.
#   2 (verse 2, b64..92): the cone of shame; the dog in the cone still dancing, sadly; the kitten cradled, the board
#     swooning, the CEO cradling her again ('lover'); the dog's jealous stare from the cone.
#   3 (pre-chorus 2, b92..128): the plan: he pulls out an instant camera; the kitten creeps along the table to the
#     retirement cake ('come'); he waits in his corner, camera up; her paws rise over the cake.
#   4 (chorus 2's drop, b128..158): FLASH: the photo of her paws in the cake; the CEO's gasp; the kitten, busted, paws
#     up; the cone and the sign go 'back' onto the cat (BAD CAT); the CEO crowns the dog.
#   5 (chorus 2, b158..189): the celebration: the crowned dog dances on the table, the board stands and dances, the
#     CEO and Compote dance.
#   6 (the silent button, b189.5..191): the crowned dog, on the kitten's red cushion, pushes the last glass off the
#     table with his paw, staring at us: he's become Gabriela.
import json, math, os, re, sys
sys.path.insert(0, os.path.dirname(__file__))
from cam import view

HERE = os.path.dirname(__file__)
PER, B0T = 60 / 146.011, 0.8218
def T(b): return B0T + b * PER                  # kit seconds of kit beat b
def Bt(t): return (t - B0T) / PER               # kit seconds -> kit beat
def S(b, b0): return round((b - b0) * PER, 3)   # seconds from shot beat b0 to beat b

LOOK = {'saxo': 'rosedress', 'sadi': 'redsuit', 'kob': 'persian', 'compote': 'bouncer'}
HEAD = {'saxo': 1.46, 'sadi': 1.38, 'kob': 1.47, 'compote': 1.5}
FACE = {'saxo': 0.9, 'sadi': 0.84, 'kob': 0.86, 'compote': 0.86}
RAD = {'saxo': 0.5, 'sadi': 0.45, 'kob': 0.42, 'compote': 0.42}
KS = 0.5                                        # the kitten: Kob at half size
SEATED = ('sitting_talking',)
FLOOR_SIT = ('situps',)                         # sitting on the floor (or a cushion): held at clip 1.0
# the boardroom (src/maps45.js BOARD)
TY, CUSH_Y, SEAT_Y = 0.74, 0.84, 0.48
TX, TZ0, TZ1 = 0.85, -2.9, 2.7
CUSH = (-0.42, -2.3); CAKE = (0.2, -2.42); HEADC = (0.0, -3.55)
SEATS = [(-1.38, -1.9), (-1.38, -0.6), (-1.38, 0.7), (-1.38, 2.0), (1.38, -1.9), (1.38, -0.6), (1.38, 0.7), (1.38, 2.0)]
G0 = (-0.3, 2.53); VASE = (-0.5, 0.05); M1 = (0.6, -0.7); G4 = (0.6, -1.5); G3 = (-0.6, -0.75)
def landing(base, d, slide):                   # where a knocked thing lands as its mess (the map's TLAND and drift)
    n = math.hypot(*d); u = (d[0] / n, d[1] / n); dl = slide + 0.9 * 0.35 + 0.15
    return (round(base[0] + u[0] * dl, 3), round(base[1] + u[1] * dl, 3))
WATER0 = landing(G0, (0, 1), 0.25)               # the hook's glass, off the table's end towards the lens
ROSES = landing(VASE, (-1, 0), 0.4)              # the vase, off the left edge
D_TAB = (0.0, 1.05)                              # the dog's dance spot on the table (its top TY)
CEO_PORT = (0.95, -4.65)                         # the CEO admiring her portrait, her back to the room
CEO_HEAD = (0.8, -3.05)                          # the CEO at the head of the table, behind the cake
CEO_WIN = (4.75, -1.3)                           # the CEO at the window, her back to the room
CHARL = 2.467
def kick_at(rv): return round((1.6 - rv) % CHARL, 3)    # charleston's kick (clip 1.6 s) on the review frame, rv s into the shot

def A(who, clip, x, z, **o):
    a = {'who': who, 'look': o.pop('look', LOOK[who]), 'clip': clip, 'x': round(x, 3), 'z': round(z, 3), 'face': o.pop('face', 'world'),
         'yaw': round(o.pop('yaw', 0), 1), 'at': o.pop('at', 'auto'), **o}
    if who == 'kob' and 'scale' not in a: a['scale'] = KS
    return a
def yaw_to(frm, to): return round(math.degrees(math.atan2(to[0] - frm[0], to[1] - frm[1])), 1)
def dancer(clip='charleston', pos=D_TAB, rv=0.6, lift=TY, **o):
    if clip == 'charleston': o.setdefault('at', kick_at(rv)); o.setdefault('speed', 1)
    return A('saxo', clip, pos[0], pos[1], lift=lift, **o)
def kitten_sit(pos=CUSH, lift=CUSH_Y, **o):     # the kitten sitting up (situps held at its sitting moment)
    return A('kob', 'situps', pos[0], pos[1], at=o.pop('at', 1.0), speed=o.pop('speed', 0), lift=lift, noLie=True, **o)
def kitten_stand(pos, lift=TY, **o): return A('kob', 'happy_idle', pos[0], pos[1], at=o.pop('at', 0.4), speed=o.pop('speed', 0.15), lift=lift, **o)

# ---- a projection check (numbers only): where each face lands in the 9:16 frame at the shot's start and end ----
def _proj(cam, look, fov, pt):
    f = [look[i] - cam[i] for i in range(3)]; n = math.sqrt(sum(v * v for v in f)); f = [v / n for v in f]
    r = [-f[2], 0.0, f[0]]; rn = math.sqrt(r[0] ** 2 + r[2] ** 2) or 1; r = [r[0] / rn, 0.0, r[2] / rn]
    u = [r[1] * f[2] - r[2] * f[1], r[2] * f[0] - r[0] * f[2], r[0] * f[1] - r[1] * f[0]]
    d = [pt[i] - cam[i] for i in range(3)]; z = sum(a * b for a, b in zip(d, f))
    if z <= 0.05: return None
    tv = math.tan(math.radians(fov) / 2); th = tv * 9 / 16
    return (0.5 + sum(a * b for a, b in zip(d, r)) / z / th / 2, 0.5 - sum(a * b for a, b in zip(d, u)) / z / tv / 2)
_src = open(os.path.join(HERE, '2026-10-13.lyrics.js')).read()
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
    if a.get('clip') in FLOOR_SIT: fy, hy = 0.42 * sc, 0.98 * sc
    return (who, x, z, fy + lift, hy + lift)
def check(beat, b1, cam, look, fov, actors, end, W):
    line = has_line(beat, b1)
    for a in actors:
        if a.get('fg') or a.get('away') or (a.get('reveal') and not end): continue
        who, x, z, fy, hy = body(a, end)
        top, face = _proj(cam, look, fov, (x, hy, z)), _proj(cam, look, fov, (x, fy, z))
        tag = ' at the end' if end else ''
        if not top or not face: W.append(f'b{beat}: {who} behind the lens{tag}'); continue
        if line and top[1] < 0.27: W.append(f'b{beat}: {who} head top at {top[1]:.2f} (lyric rows){tag}')
        if face[0] < 0.12 or face[0] > 0.88: W.append(f'b{beat}: {who} face x {face[0]:.2f} (edge){tag}')
        if face[1] > 0.82 or face[1] < 0.0: W.append(f'b{beat}: {who} face y {face[1]:.2f}{tag}')
def _occl(cam, look, fov, pts):
    out = []
    for w, x, z, fy, rad in pts:
        pf = _proj(cam, look, fov, (x, fy, z)); df = math.dist(cam, (x, fy, z))
        if not pf: continue
        for w2, x2, z2, fy2, rad2 in pts:
            if w2 == w: continue
            c = (x2, fy2 + 0.1 * rad2 / 0.45, z2); d2 = math.dist(cam, c)
            if d2 >= df - 0.2: continue
            pc = _proj(cam, look, fov, c)
            if not pc: continue
            r_px = (rad2 / d2 + 0.1 / df) / (2 * math.tan(math.radians(fov) / 2)) * 1920
            if math.hypot((pf[0] - pc[0]) * 1080, (pf[1] - pc[1]) * 1920) < r_px: out.append(f'{w} behind {w2}')
    return out
def pts_of(actors, end):
    out = []
    for a in actors:
        if a.get('fg') or a.get('away'): continue
        who, x, z, fy, hy = body(a, end); out.append((who, x, z, fy, RAD[who] * a.get('scale', 1)))
    return out
# ---- the set: a lens stays out of the table, the chairs, the credenzas, the palm and the walls ----
SET = [(-TX, TX, TZ0, TZ1, TY + 0.03), (-0.4, 0.4, -3.95, -3.15, 1.6), (-4.6, -2.0, -5.6, -5.0, 0.84), (2.0, 4.6, -5.6, -5.0, 0.84), (-5.3, -4.5, -5.1, -4.3, 2.3)]
SET += [(x - 0.32, x + 0.32, z - 0.32, z + 0.32, 1.25) for x, z in SEATS]
def free(c):
    x, y, z = c
    if not (-5.85 < x < 5.85 and -5.45 < z < 6.25 and 0.12 < y < 4.2): return False
    return not any(x0 < x < x1 and z0 < z < z1 and y < top for x0, x1, z0, z1, top in SET)
def lens(v, k=0):
    c, f = v; a = math.radians(c['ang'][k]); fy = f[2] if len(f) > 2 else 0
    return (f[0] + math.sin(a) * c['r'][k], c['h'][k] + fy, f[1] + math.cos(a) * c['r'][k])
# the board members' heads (the map's box pets: seated heads ~1.1 m up) block faces: clear the ones on a line of sight
def member_clear(v, actors, stand=False):
    c, focus = v; out = []
    for k, end in ((0, 0), (-1, 1)):
        cam, look = lens(v, k), (focus[0], c['look'][k], focus[1])
        faces = pts_of(actors, end)
        for sx, sz in SEATS:
            hx = sx + (0.62 if sx > 0 else -0.62) * stand; hy = 0.96 if stand else 1.1; h = (hx, hy, sz)
            if math.dist(cam, h) < 1.3: out.append([sx, sz, 0.3]); continue
            ph = _proj(cam, look, c['fov'], h)
            if not ph: continue
            for w, x, z, fy, rad in faces:
                df = math.dist(cam, (x, fy, z)); dh = math.dist(cam, h)
                if dh >= df - 0.2: continue
                pf = _proj(cam, look, c['fov'], (x, fy, z))
                if not pf: continue
                r_px = (0.3 / dh + rad * 0.6 / df) / (2 * math.tan(math.radians(c['fov']) / 2)) * 1920
                if math.hypot((pf[0] - ph[0]) * 1080, (pf[1] - ph[1]) * 1920) < r_px: out.append([sx, sz, 0.3]); break
    uniq = []
    for q in out:
        if q not in uniq: uniq.append(q)
    return uniq
def problems(beat, b1, actors, v, W):
    c, focus = v; fy = focus[2] if len(focus) > 2 else 0
    for k, end in ((0, 0), (-1, 1)):
        cam, look = lens(v, k), (focus[0], c['look'][k] + fy, focus[1])
        check(beat, b1, cam, look, c['fov'], actors, end, W)
        for oc in _occl(cam, look, c['fov'], pts_of(actors, end)):
            W.append(f'b{beat}: {oc}{" at the end" if end else ""}')
        if not free(cam): W.append(f'b{beat}: lens inside the set{" at the end" if end else ""} {tuple(round(q, 2) for q in cam)}')
    return W
shots = []; REV = []
def add(beat, b1, actors, lyric, v, rv=None, autoclear=True, **o):
    c, focus = v
    o = {k: val for k, val in o.items() if val is not None}
    if autoclear and o.get('board', 'sit') is not False:
        cl = member_clear(v, actors, stand=o.get('bstand', False)) + o.pop('clear', [])
        if cl: o['clear'] = cl
    t0 = 0 if not shots else T(beat)
    REV.append(round(t0 + (rv if rv is not None else 0.6 * (T(b1) - t0)), 2))
    shots.append({'beat': beat, 'kind': 'dance', 'map': 'boardroom', 'actors': actors, 'lyric': lyric, 'cam': c, 'focus': focus, **o})
    problems(beat, b1, actors, v, WARN)
def solve(beat, b1, actors, look, ang, dist, h, fov=50, push=0.08, dang=30, rng=(0.8, 1.6), dh=0.3, **kw):
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
                n = len(problems(beat, b1, actors, v, []))
                score = n * 1000 + abs(da) + abs(dk - 1) * 40 + abs(dhh) * 20
                if best is None or score < best[0]: best = (score, v)
                if n == 0 and score < 1: return v
    return best[1]

# the mess on the floor so far, and what's gone from the table, shot by shot
def state(b):
    mess, hide = [], []
    if 2 <= b < 151: mess.append(['water', WATER0[0], WATER0[1], 0])
    if b >= 2: hide.append('g0')
    if b >= 55: mess.append(['roses', ROSES[0], ROSES[1], 0]); hide.append('vase')
    return dict(mess=mess or None, hide=hide or None)
def merge(b, **o):
    st = state(b)
    for k in ('mess', 'hide'):
        if k in o and o[k] is not None and st[k]: o[k] = st[k] + [q for q in o[k] if q not in st[k]]
    return {**st, **o}

# =====================================================================================================================
# THE HOOK AND CHORUS 1's FIRST CRIME (b-2..30)
# S00 (b-2..4, the pickup 'hands' and the drop): at the table's foot, low over the marble: the white kitten in the
# foreground, her paw on the rim of a glass at the table's near edge, staring at us; behind her the dog in the red rose
# dress dances on the boardroom table for the board; on the drop she sweeps the glass off the edge towards us
K_HOOK = (-0.3, 2.3)
s00 = [kitten_stand(K_HOOK, yaw=0, arm='R', aim=[0.1, -0.55, 0.8], upAt=-1, aim2=[0.15, -0.3, 1.0], aim2At=round(T(0.4), 3)),
       dancer(pos=(0.32, -0.2), rv=T(-1.0), yaw=-8)]
v = view((-0.12, 1.15, 4.45), (0.0, 1.34, 1.0), fov=52, p1=(-0.12, 1.15, 4.28), roll=(4, 2))
add(-2, 4, s00, "the pickup 'hands' and the drop: Gabriela Enterprises' boardroom: in the foreground the boss's new white kitten, her paw on the rim of a glass at the table's edge, stares at us; behind her the dog in the red rose dress dances on the boardroom table; on the drop she sweeps the glass off towards us", v,
    rv=round(T(-1.0), 2), knock=[['g0', round(T(0.45), 3), 0, 1, 0.25]], board='dance', hide=['g5', 'g1'])
# S01 (b4..8; 'Gabriela'): her name: the kitten's deadpan close-up at table height, her paw still out over the edge
s01 = [kitten_stand(K_HOOK, yaw=0, arm='R', aim=[0.15, -0.3, 1.0], upAt=-1)]
v = solve(4, 8, s01, (K_HOOK[0], 1.17, K_HOOK[1]), 8, 1.45, 1.12, fov=40, push=0.04, dang=20)
add(4, 8, s01, "'Gabriela': her name: the kitten's deadpan close-up, her paw still out over the edge where the glass was", v, **merge(4, hide=['g5', 'g1']), board='dance')
# S02 (b8..14; 'hands ... Gabriela'): the dog dances on the table, oblivious: a low dolly-in from the table's foot
s02 = [dancer(pos=D_TAB, rv=S(11.5, 8), yaw=0)]
v = view((0.35, 0.95, 4.3), (0.0, 1.55, D_TAB[1]), fov=56, p1=(0.3, 0.95, 3.8), roll=(-8, -5))
add(8, 14, s02, "the dog dances on the boardroom table for the board, oblivious, his rose dress swinging", v, **merge(8), board='dance')
# S03 (b14..16; 'back'): the CEO in her red power suit admires her own portrait, her back to the room
s03 = [A('sadi', 'happy_idle', CEO_PORT[0], CEO_PORT[1], yaw=180, at=0.4, speed=0.2)]
v = view((1.45, 1.35, -2.3), (0.8, 1.3, -5.0), fov=54, p1=(1.4, 1.35, -2.5))
add(14, 16, s03, "'back': the CEO admires her own portrait, her back to the room", v, **merge(14), board='sit', autoclear=False)
# S04 (b16..20): she turns back round at the crash: the gasp, paws on her cheeks (a crash zoom that stops at her chest)
GASP = dict(at=0.4, speed=0.1, arm='both', aim='caramell', flap=0, upAt=-1)   # both paws up by her face, held: a gasp (the raise-the-roof clip's paws read as a pose)
s04 = [A('sadi', 'happy_idle', CEO_PORT[0], CEO_PORT[1], yaw=0, **GASP)]
v = view((CEO_PORT[0], 1.25, CEO_PORT[1] + 3.0), (CEO_PORT[0], 0.98, CEO_PORT[1]), fov=46, p1=(CEO_PORT[0], 1.22, CEO_PORT[1] + 2.15), ly1=1.0, ease='out')
add(16, 20, s04, "she turns round at the crash: her gasp, both paws up by her face (a crash zoom)", v, **merge(16), board='stare', stare=list(CEO_PORT))
# S05 (b20..24; 'Gabriela'): what she sees: the dog at the very end of the table, right over the puddle and the broken glass, mid-dance
D_EDGE = (-0.3, 2.5)
s05 = [dancer(pos=D_EDGE, rv=S(22, 20), yaw=-15, tongue=True)]
v = view((-1.15, 1.6, 6.1), (-0.3, 1.42, 2.95), fov=54, p1=(-1.12, 1.6, 5.95))
add(20, 30, s05, "'Gabriela': what she sees: the dog dancing at the very end of the table, right over the puddle and the broken glass, tongue out", v, **merge(20), board='stare', stare=list(D_EDGE), rv=S(22, 20))
# S06 (b24..30) failed three review loops (the CEO's point never read: behind the table's end it hid her arm, beside
# it, facing the lens, it read as presenting): folded into S05 (DAILY_ROUTINE Fallback)
# S07 (b30..36; the long line): Compote, the security, hangs a BAD DOG sign round his neck; he stops dancing, tongue out
D_FOOT = (-0.3, 2.3)
COMP_FOOT = (-1.08, 3.05)
s07 = [A('saxo', 'happy_idle', D_FOOT[0], D_FOOT[1], lift=TY, yaw=10, at=0.3, speed=0.2, shame=round(S(32, 30), 3), tongue=True),
       A('compote', 'happy_idle', COMP_FOOT[0], COMP_FOOT[1], yaw=8, at=0.4, speed=0.1, shades=True)]
v = view((-0.7, 1.45, 5.85), (-0.7, 1.48, 2.6), fov=52, p1=(-0.7, 1.45, 5.68))
add(30, 36, s07, "a BAD DOG sign appears round his neck; Compote, the security in her black suit and shades, stands guard beside him glaring at us", v, **merge(30), board='stare', stare=list(D_FOOT))
# S08 (b36..42): BAD DOG on his chest, and he dances on regardless
s08 = [dancer(pos=D_FOOT, rv=S(40, 36), yaw=0, shame=True, tongue=True)]
v = view((D_FOOT[0] + 0.05, 1.7, D_FOOT[1] + 2.9), (D_FOOT[0], 1.78, D_FOOT[1]), fov=46, p1=(D_FOOT[0] + 0.05, 1.7, D_FOOT[1] + 2.78))
add(36, 42, s08, "BAD DOG on his chest, and he dances on regardless", v, **merge(36), board='stare', stare=list(D_FOOT))
# S09 (b42..46): the CEO in front of her portrait cradles the kitten in her arms; hearts
K_HELD = lambda c, yaw, fwd=0.3: (c[0] + fwd * math.sin(math.radians(yaw)) + 0.14 * math.cos(math.radians(yaw)), c[1] + fwd * math.cos(math.radians(yaw)) - 0.14 * math.sin(math.radians(yaw)))   # in front of her and a little to her left: held at her chest, the faces side by side
def cradle(c, yaw, kyaw=None, lean=0, fwd=0.3, **ko):
    hx, hz = K_HELD(c, yaw, fwd)
    return [A('sadi', 'happy_idle', c[0], c[1], yaw=yaw, at=0.4, speed=0.15, arm='both', aim=[0.12, -0.12, 0.85], upAt=-1, lean=lean),
            A('kob', 'situps', hx, hz, at=1.0, speed=0, lift=0.24, noLie=True, air=True, noShadow=True, yaw=kyaw if kyaw is not None else yaw, **ko)]
C_CRADLE = (0.95, -4.55)
s09 = cradle(C_CRADLE, 0)
v = view((C_CRADLE[0] - 0.3, 1.22, C_CRADLE[1] + 2.6), (C_CRADLE[0] + 0.05, 0.93, C_CRADLE[1]), fov=46, p1=(C_CRADLE[0] - 0.28, 1.22, C_CRADLE[1] + 2.45))
add(42, 46, s09, "the CEO cradles the kitten in her arms in front of her own portrait: hearts", v, **merge(42), hearts=[[C_CRADLE[0], 1.75, C_CRADLE[1], 0.1, 1]], heartYaw=0, board='swoon')
# S10 (b46..51; 'hands'): crime 2: the kitten's paw on the vase of roses, three-quarter to us; behind it the dog dances with his sign
K_VASE = (VASE[0] + 0.32, VASE[1] + 0.05)
s10 = [kitten_stand(K_VASE, yaw=-60, arm='R', aim=[0.25, -0.2, 0.9], upAt=-1), dancer(pos=D_EDGE, rv=S(48.5, 46), yaw=200, shame=True)]
v = solve(46, 51, s10, (-0.4, 1.2, 1.05), 195, 2.9, 1.25, fov=50, push=0.05, dang=25)
add(46, 51, s10, "'hands': crime two: the kitten's paw on the vase of roses; behind her the dog dances on with BAD DOG on his chest", v, **merge(46, hide=['m0', 'g1']), board='dance', rv=S(48.5, 46))
# S11 (b51..55; 'Gabriela'): from the left, a little above: staring at us, she shoves the vase off the edge towards us
s11 = [kitten_stand(K_VASE, yaw=-90, arm='R', aim=[0.25, -0.2, 0.9], upAt=-1, aim2=[0.3, -0.1, 1.0], aim2At=round(S(52, 51), 3))]
v = view((-2.5, 1.42, 0.3), (-0.4, 1.12, 0.07), fov=46, p1=(-2.36, 1.41, 0.28))
add(51, 55, s11, "'Gabriela': staring at us, she shoves the vase off the edge towards us", v, **merge(51, hide=['m0']), knock=[['vase', round(S(52.1, 51), 3), -1, 0, 0.4]], board='dance', rv=round(S(52.1, 51) + 0.27, 2))
# S12 (b55..61; 'hands ... Gabriela'): the dog hops down among the roses and picks one up in his teeth (he's a dog)
D_ROSE = (ROSES[0] - 0.75, ROSES[1] + 0.15)
s12 = [A('saxo', 'happy_idle', D_ROSE[0], D_ROSE[1], yaw=-70, at=0.4, speed=0.15, shame=True, fetch={'kind': 'rose', 'at': round(S(57.5, 55), 3)}, arm='both', aim='rave', flapEvery=1000, flapPh=90, upAt=round(S(57.5, 55), 3))]
v = solve(55, 61, s12, (D_ROSE[0], 0.95, D_ROSE[1]), -75, 2.7, 0.6, fov=56, push=0.06, dang=25, roll=(6, 4))
add(55, 61, s12, "'hands': the dog hops down among the roses and picks one up in his teeth, as a dog does", v, **merge(55), board='dance')
# S13 (b61..64; the 'la's): caught again: the rose in his teeth, BAD DOG on his chest, the smashed vase at his feet, the board staring
s13 = [A('saxo', 'happy_idle', D_ROSE[0], D_ROSE[1], yaw=-55, at=0.4, speed=0.15, shame=True, fetch='rose')]
v = view((D_ROSE[0] - 2.6, 2.05, D_ROSE[1] + 1.9), (D_ROSE[0] + 0.2, 0.95, D_ROSE[1] - 0.1), fov=52, p1=(D_ROSE[0] - 2.5, 2.03, D_ROSE[1] + 1.82))
add(61, 64, s13, "caught again: the rose in his teeth, BAD DOG on his chest, the smashed vase at his feet, the whole board staring", v, **merge(61), board='stare', stare=list(D_ROSE))

# =====================================================================================================================
# VERSE 2 (b64..92): the cone of shame
D_CONE = (-2.6, 3.6)                              # the corner by the door where he's sent
COMP_C = (-3.25, 3.35)
# S14 (b64..70): Compote puts the cone of shame on him, the rose still in his teeth: her front three-quarter, wide
s14 = [A('saxo', 'happy_idle', D_CONE[0], D_CONE[1], yaw=-20, at=0.4, speed=0.15, shame=True, fetch='rose', cone=round(S(66, 64), 3)),
       A('compote', 'happy_idle', COMP_C[0], COMP_C[1], yaw=yaw_to(COMP_C, D_CONE), at=0.4, speed=0.1, shades=True)]
v = view((-4.45, 1.35, 6.1), (-2.85, 1.08, 3.45), fov=50, p1=(-4.4, 1.35, 5.95))
add(64, 70, s14, "verse 2: in the corner Compote puts the cone of shame on him, the rose still in his teeth", v, **merge(64), board='sit')
# S15 (b70..76): the dog in the cone, the sign and the rose, still dancing (a charleston), sadly: frontal three-quarter, low
s15 = [A('saxo', 'charleston', D_CONE[0], D_CONE[1], yaw=10, at=kick_at(S(73, 70)), speed=1, shame=True, fetch='rose', cone=True)]
v = view((D_CONE[0] + 0.85, 0.62, D_CONE[1] + 2.45), (D_CONE[0], 1.05, D_CONE[1]), fov=58, p1=(D_CONE[0] + 0.78, 0.62, D_CONE[1] + 2.2), roll=(-8, -5))
add(70, 76, s15, "the dog in the cone of shame, BAD DOG on his chest and the rose in his teeth, still dancing, sadly", v, **merge(70), board='sit', rv=S(73, 70))
# S16 (b76..82): the CEO cradles the kitten at the head of the table; the board swoons, hearts
C_CR2 = (4.55, 1.0)
s16 = cradle(C_CR2, -110, kyaw=-110)
v = view((1.95, 1.2, 1.98), (C_CR2[0], 0.98, C_CR2[1]), fov=46, p1=(2.06, 1.2, 1.94))
add(76, 82, s16, "the CEO cradles the kitten by the window, hearts", v, **merge(76, hide=['g6', 'g3']), hearts=[[C_CR2[0], 1.75, C_CR2[1], 0.2, 1]], heartYaw=-110, board='swoon')
# S17 (b82..88): the dog's jealous stare from the cone: frontal, locked off
s17 = [A('saxo', 'happy_idle', D_CONE[0], D_CONE[1], yaw=0, at=0.4, speed=0.05, shame=True, fetch='rose', cone=True)]
v = view((D_CONE[0], 1.25, D_CONE[1] + 2.3), (D_CONE[0], 1.12, D_CONE[1]), fov=44, p1=(D_CONE[0], 1.25, D_CONE[1] + 2.15))
add(82, 88, s17, "the dog stares from his cone, jealous", v, **merge(82), board='sit', still=True)
# S18 (b88..92; 'lover'): the CEO cradles the kitten in front of her portrait again
# fallback (three failed loops; then, from S16's lens, her stare didn't read as a nuzzle and the heart was cut at the
# top): S09's passed frame again, a callback: in front of her portrait she cradles the kitten, hearts
s18 = cradle(C_CRADLE, 0)
v = view((C_CRADLE[0] - 0.3, 1.22, C_CRADLE[1] + 2.6), (C_CRADLE[0] + 0.05, 0.93, C_CRADLE[1]), fov=46, p1=(C_CRADLE[0] - 0.28, 1.22, C_CRADLE[1] + 2.45))
add(88, 92, s18, "'lover': in front of her portrait again, the CEO cradles the kitten; hearts", v, **merge(88), hearts=[[C_CRADLE[0], 1.75, C_CRADLE[1], 0.1, 1]], heartYaw=0, board='swoon')

# =====================================================================================================================
# PRE-CHORUS 2 (b92..128): the plan
# S19 (b92..100): in his cone the dog pulls out an instant camera, an idea
s19 = [A('saxo', 'happy_idle', D_CONE[0], D_CONE[1], yaw=0, at=0.4, speed=0.1, shame=True, cone=True, hold='camera', arm='R', aim=[0.75, 0.55, 0.35], upAt=round(S(95, 92), 3), holdFrom=round(S(95, 92), 3))]
v = view((D_CONE[0] + 0.25, 1.3, D_CONE[1] + 2.4), (D_CONE[0] - 0.05, 1.18, D_CONE[1]), fov=46, p1=(D_CONE[0] + 0.25, 1.3, D_CONE[1] + 2.15))
add(92, 100, s19, "pre-chorus 2: in his cone the dog pulls out an instant camera: a plan", v, **merge(92), board='sit')
# S20 (b100..106; 'come'): the kitten tiptoes along the table to the retirement cake: low at table height
K_C0, K_C1 = (0.2, -0.6), (0.2, -1.92)
s20 = [A('kob', 'happy_walk', K_C0[0], K_C0[1], lift=TY, yaw=180, mz=round(K_C1[1] - K_C0[1], 3), speed=0.7)]
v = view((0.95, 1.1, 0.9), (0.2, 1.17, -1.5), fov=50, p1=(0.85, 1.1, 0.65))
add(100, 106, s20, "'come': the kitten tiptoes along the table to the CEO's retirement cake", v, **merge(100, hide=['m1', 'g4']), board='sit')
# S21 (b106..112): fallback (three failed loops: hiding behind the CEO's chair never read): S19's passed frame as a
# cross-cut: in his corner, in his cone, the camera up and ready
s21 = [A('saxo', 'happy_idle', D_CONE[0], D_CONE[1], yaw=0, at=0.4, speed=0.1, shame=True, cone=True, hold='camera', arm='R', aim=[0.75, 0.55, 0.35], upAt=-1)]
v = view((D_CONE[0] + 0.25, 1.3, D_CONE[1] + 2.4), (D_CONE[0] - 0.05, 1.18, D_CONE[1]), fov=46, p1=(D_CONE[0] + 0.25, 1.3, D_CONE[1] + 2.15))
add(106, 112, s21, "in his corner the dog waits in his cone, the instant camera up and ready", v, **merge(106), board='sit')
# S22 (b112..120): the CEO at the window, her back to the room; the kitten at the cake in the foreground
K_CAKE = (0.2, -2.05)                            # at the cake, her paws reach its top tier
s22 = [A('sadi', 'happy_idle', CEO_WIN[0], CEO_WIN[1], yaw=90, at=0.4, speed=0.2)]
v = view((2.35, 1.42, -0.55), (5.3, 1.3, -1.45), fov=54, p1=(2.5, 1.42, -0.6))
add(112, 120, s22, "the CEO gazes out of the window, her back to the room", v, **merge(112, hide=['m1', 'g4', 'g6']), board='sit')
# S23 (b120..126): close, from above the cake: the kitten, both paws raised over it, staring at us
s23 = [kitten_stand(K_CAKE, yaw=188, arm='both', aim=[0.35, 0.55, 0.55], upAt=-1)]
v = view((0.45, 1.8, -3.25), (0.2, 1.3, -2.1), fov=46, p1=(0.44, 1.79, -3.17))
add(120, 126, s23, "close, from above the cake: the kitten, both paws raised over it, staring at us", v, **merge(120, hide=['m1', 'glasses']), board=False)
# S24 (b126..128; 'hands'): her paws plunge into the cake's top: her front three-quarter, above the cake
# fallback (three failed loops: from her front her paws on the cake's far rim sat under her chin): a three-quarter from
# above on the window side, tested against a steep frontal and a profile: her paws on the top read; she stands 5 cm
# closer (a half-size kitten's paws reach 0.14 m ahead of her mark)
K_CAKE2 = (0.2, -2.1)
CAKE_34 = ((1.35, 1.6, -3.15), (0.2, 1.13, -2.25))
s24 = [kitten_stand(K_CAKE2, yaw=188, arm='both', aim=[0.35, 0.55, 0.55], upAt=-1, aim2=[0.05, -0.7, 0.7], aim2At=round(S(126.6, 126), 3), frosting=round(S(126.8, 126), 3))]
v = view((1.45, 1.65, -3.27), CAKE_34[1], fov=52, p1=CAKE_34[0])
add(126, 128, s24, "'hands': her paws plunge into the cake's top", v, **merge(126, hide=['topper', 'm1', 'glasses']), cakePaws=round(S(126.7, 126), 3), board=False, rv=round(S(127.4, 126), 2))

# =====================================================================================================================
# CHORUS 2 (b128..189): caught
# S25 (b128..132; the drop): FLASH: the dog's camera over the CEO's chair: the photo of her paws in the cake, printed
s25 = [kitten_stand(K_CAKE2, yaw=188, arm='both', aim=[0.05, -0.7, 0.7], upAt=-1, holdAt=0.12, frosting=True)]
v = view(CAKE_34[0], CAKE_34[1], fov=52)
add(128, 132, s25, "the drop: FLASH: the dog's camera catches her with both paws in the cake: the photo prints", v, **merge(128, hide=['topper', 'm1', 'glasses']), cakePaws=0, flashAt=[0.0], photo=0.12, still=True, stop=0.12, board=False, rv=1.5)
# S26 (b132..136; 'Gabriela'): the CEO spins round from the window at the flash: the gasp, paws on her cheeks
s26 = [A('sadi', 'happy_idle', CEO_WIN[0], CEO_WIN[1], yaw=-100, **GASP)]
v = view((CEO_WIN[0] - 2.9, 1.25, CEO_WIN[1] - 0.5), (CEO_WIN[0], 0.98, CEO_WIN[1]), fov=46, p1=(CEO_WIN[0] - 2.15, 1.23, CEO_WIN[1] - 0.37), ly1=1.0, ease='out')
add(132, 136, s26, "'Gabriela': the CEO spins round from the window at the flash: her gasp (a crash zoom)", v, **merge(132, hide=['topper', 'm1', 'g4', 'g6']), cakePaws=0, board='gasp')
# S27 (b136..142; 'hands'): the kitten, busted: her frosted paws up
s27 = [kitten_stand(K_CAKE, yaw=0, arm='both', aim=[0.55, 0.65, 0.3], upAt=-1, frosting=True)]
v = solve(136, 142, s27, (0.2, 1.14, -2.0), 10, 1.6, 1.2, fov=44, push=0.05, dang=20)
add(136, 142, s27, "'hands': the kitten, busted, raises her frosted paws", v, **merge(136, hide=['topper', 'm1', 'g4']), cakePaws=0, board='gasp')
# S28 (b142..147; 'back'): the cone and the sign go back onto the cat: BAD CAT, on her cushion
s28 = [kitten_sit(yaw=20, cone=True, shame=True, frosting=True)]
v = view((CUSH[0] + 0.45, 1.25, CUSH[1] + 1.35), (CUSH[0], 1.12, CUSH[1]), fov=44, p1=(CUSH[0] + 0.42, 1.25, CUSH[1] + 1.22))
add(142, 147, s28, "'back': the cone of shame and the sign go back onto the cat: BAD CAT, on her cushion", v, **merge(142), cakePaws=0, board='stare', stare=list(CUSH), still=True)
# S29 (b147..151; 'Gabriela'): the CEO crowns the dog on the table, the window's blinds behind them, the board cheering
D_CROWN = (0.5, -1.25)
s29 = [A('saxo', 'happy_idle', D_CROWN[0], D_CROWN[1], lift=TY, yaw=-75, at=0.4, speed=0.3, tongue=True, hat='crown', hatY=0.84, hatFrom=round(S(148, 147), 3)),
       A('sadi', 'happy_idle', 1.25, -1.25, yaw=-80, at=0.4, speed=0.2, arm='both', aim=[0.3, 0.62, 0.5], upAt=-1)]
v = view((-2.55, 1.75, -0.35), (0.85, 1.55, -1.25), fov=54, p1=(-2.45, 1.74, -0.39))
add(147, 151, s29, "'Gabriela': the CEO crowns the dog the next Gabriela; hearts; the board cheers", v, **merge(147, hide=['m1', 'g4', 'g6']), cakePaws=0, hearts=[[D_CROWN[0], 2.45, D_CROWN[1], 0.3, 1]], heartYaw=-75, board='cheer', confetti=round(S(148, 147), 3), confAt=[0.5, -1.2])
# S30 (b151..158; 'back ... Gabriela'): crowned, back on the table, he dances; confetti
s30 = [dancer(pos=D_TAB, rv=S(155, 151), yaw=0, hat='crown', hatY=0.84)]
v = view((-0.3, 0.98, 4.2), (0.0, 1.6, D_TAB[1]), fov=56, p1=(-0.25, 0.98, 3.7), roll=(7, 4))
add(151, 158, s30, "'back': crowned, he's back dancing on the boardroom table; confetti", v, **merge(151, hide=['m1', 'g4', 'g6']), cakePaws=0, board='cheer', confetti=-2.0, confAt=[0, -0.4], rv=S(155, 151))
# S31 (b158..164): the wide: the board stands and dances by the table, the CEO dances at its head, Compote at its foot
s31 = [dancer(pos=(-0.5, 0.6), rv=S(161, 158), yaw=0, hat='crown', hatY=0.84), A('sadi', 'charleston', 0.55, -3.2, yaw=-5, at=kick_at(S(161, 158)), speed=1),
       A('compote', 'charleston', 0.55, 3.25, yaw=-8, at=kick_at(S(161, 158)), speed=1)]
v = view((0.0, 2.55, 6.15), (0.0, 1.05, -0.2), fov=58, p1=(0.0, 2.5, 5.85))
add(158, 164, s31, "the celebration: the board stands and dances by the table, the CEO dances at its head, Compote at its foot", v, **merge(158, hide=['m1', 'g4', 'g6']), cakePaws=0, board='dance', bstand=True, confetti=-4.0, confAt=[0, -0.6], autoclear=False, rv=S(161, 158))
# S32 (b164..170): low and dutch on the crowned dog dancing on the table
s32 = [dancer(pos=D_TAB, rv=S(167, 164), yaw=20, hat='crown', hatY=0.84)]
v = view((1.3, 0.95, 3.1), (0.0, 1.68, D_TAB[1]), fov=60, p1=(1.15, 0.95, 2.8), roll=(-10, -7))
add(164, 174, s32, "low and dutch on the crowned dog dancing on the table", v, **merge(164, hide=['m1', 'g4', 'g6', 'g5', 'g2']), cakePaws=0, board='dance', bstand=True, confetti=-6.0, confAt=[0, -0.6], rv=S(167, 164))
# S33 (b170..174) failed three review loops (the half-size kitten's charleston in her cone read as standing still):
# folded into S32 (DAILY_ROUTINE Fallback)
# S34 (b174..183; 'hands ... Gabriela'): the dog and the CEO dance side by side at the table's foot, in step
P_D, P_S = (-0.5, 3.4), (0.5, 3.4)
s34 = [A('saxo', 'charleston', P_D[0], P_D[1], yaw=0, at=kick_at(S(176, 174)), speed=1, hat='crown', hatY=0.84), A('sadi', 'charleston', P_S[0], P_S[1], yaw=0, at=kick_at(S(176, 174)), speed=1)]
v = view((0.0, 1.2, 6.15), (0.0, 1.05, 3.4), fov=64, p1=(0.0, 1.2, 5.98))
add(174, 183, s34, "'hands': the dog and the CEO dance side by side at the table's foot, in step", v, **merge(174), cakePaws=0, board='dance', bstand=True, confetti=-10.0, confAt=[0, 1.2], rv=S(176, 174))
# S35 (b183..189.5; the last line): fallback (three failed loops: from the head of the table his kick was a blob and the
# board sat at the cut-off edges): S32's passed low dutch lens on the crowned dog dancing on the table, again
s35 = [dancer(pos=D_TAB, rv=S(186, 183), yaw=20, hat='crown', hatY=0.84)]
v = view((1.3, 0.95, 3.1), (0.0, 1.68, D_TAB[1]), fov=60, p1=(1.15, 0.95, 2.8), roll=(-10, -7))
add(183, 189.5, s35, "the last line: low and dutch again on the crowned dog dancing on the table, confetti", v, **merge(183, hide=['m1', 'g4', 'g6', 'g5', 'g2']), cakePaws=0, board='dance', bstand=True, confetti=-12.0, confAt=[0, -0.6], rv=S(186, 183))
# S36 (b189.5..191; the silence): the button: on the kitten's red cushion the crowned dog pushes the last glass off the table, staring at us
D_BTN = (CUSH[0], CUSH[1])
s36 = [A('saxo', 'situps', D_BTN[0], D_BTN[1], lift=CUSH_Y, yaw=0, at=1.0, speed=0, noLie=True, hat='crown', hatY=0.84, arm='R', upAt=-1, aim=[0.65, -0.6, 0.15], aim2=[0.95, -0.35, 0.05], aim2At=0.02, armB='L', aimB=[0.18, -0.92, 0.12])]
v = view((-0.35, 1.45, 0.35), (-0.5, 1.3, -2.3), fov=46, p1=(-0.36, 1.45, 0.25))
add(189.5, 191, s36, "the button, in silence: on the kitten's red cushion the crowned dog pushes the last glass off the table, staring at us", v, **merge(189), cakePaws=0, knock=[['g6', 0.06, -1, 0, 0.15]], board='stare', stare=list(D_BTN), still=True, rv=0.3)

shots.sort(key=lambda x: x['beat'])
ep = {
    'date': '2026-10-13', 'song': {'title': 'Gabriela', 'artist': 'KATSEYE'},
    'logline': "The boss's new white kitten knocks everything at Gabriela Enterprises off the table and the dog in the red rose dress takes the blame every time, until his camera flash catches her paws in the retirement cake.",
    'new': "src/maps45.js: boardroom (Gabriela Enterprises: a wood-panelled boardroom by day, a burgundy carpet, a long blue-grey marble table with the CEO's high-backed chair at its head and eight black leather chairs, box-pet board members in suits who sit, clap, gasp, stare, point, cheer, swoon and dance, seated or standing; the CEO's portrait in a gilt frame, torchiere lamps, credenzas, white blinds, a pink neon logo, a potted palm; water glasses, a vase of roses, logo mugs, papers, a conference phone, the retirement cake with paw dents, the kitten's red velvet cushion; things knocked off the table slide, fall tipping and land as a mess with a splash; confetti; a freeze for the photo); actor fields cone (the cone of shame) and shame (the BAD DOG sign, BAD CAT on the cat); a gold crown hat; a rose to carry in the jaws (fetch 'rose'); looks saxo rosedress, sadi redsuit and kob persian (worn at half size: the kitten); the structure FRAMED",
    'notes': "The world, from the official video (contact sheets): a telenovela at 'Gabriela Enterprises', a corporate tower whose CEO, a woman in a red power suit with long waves, is retiring and must name the next Gabriela; a wood-panelled boardroom with a long blue-grey marble table, black leather chairs, white torchiere lamps and window blinds, her portrait in red on the wall, white mugs with the red logo; the candidates in red halter dresses with big roses each claim the title, a catfight on the boardroom table, a glass knocked over, a gossip show; the last shot is the CEO's white Persian cat in a gold collar: the cat was Gabriela. Our version keeps the boardroom, the red dresses, the CEO in her red suit and the white Persian, and turns the cat into the oldest pet-owner joke there is: the cat knocks things off the table and the dog gets the blame. The words, from whitelisted keywords per line: the chorus's 'hands' (the kitten's paw on the glass, the vase, the cake; her paws up when she's caught), 'Gabriela' (a cut to the kitten each time), 'back' (the CEO turns back round; the cone and the sign go back onto the cat), 'lover' (the CEO cradles the kitten), 'come' (she creeps to the cake). Cast: Saxo in the clip's red halter dress with a big rose (the framed dog), Sadi the CEO in the clip's red power suit (the reality check: she's fooled until the photo), Kob the boss's new white Persian kitten at half size (the cat in the clip's last shot; she knocks everything off), Compote the security in her black bouncer suit and shades (she punishes: the sign, the cone).",
    'yt': [19.72, 79.22],                       # the Short (59.5 s, the ending kept) opens on the cut to S10, the dog dancing in his BAD DOG sign behind the kitten at the vase
    'tiktok_sound': '7515269970908252177',
    'with': ['sadi', 'kob', 'compote'],
    'clips': sorted({a['clip'] for s in shots for a in s['actors']}),
    'tags': {'structure': 'framed', 'scenes': ['the dog dances on the boardroom table', 'the kitten pushes the glass off', 'the CEO turns back round', 'the board stares', 'the BAD DOG sign', 'the vase of roses off the edge', 'the rose in his teeth', 'the cone of shame', 'the dog dancing in the cone', 'the kitten cradled', 'the instant camera', 'the camera ready', 'paws in the cake', 'the flash and the photo', 'busted, paws up', 'BAD CAT', 'the crowning', 'the celebration dance', 'the dog pushes the last glass off'],
             'cast': ['saxo', 'sadi', 'kob', 'compote'], 'hook': 'dance', 'maps': ['boardroom'], 'ref': 'evil-puppy',
             'lyric_literal': "'hands' (the kitten's paw on the glass, the vase and the cake; her paws up when she's caught), 'Gabriela' (a cut to the kitten each time), 'back' (the CEO turns back round on the crash; the cone and the sign go back onto the cat), 'lover' (the CEO cradles the kitten), 'come' (the kitten creeps to the cake)",
             'experiment': "Does dramatic irony the viewer is in on (we watch the kitten do it, the boss blames the dog, every time) on a K-pop hit with a big TikTok sound (Gabriela, 823k videos) earn more comments per 1,000 views than our last week's episodes (0-3)?"},
    'shots': shots,
}
json.dump(ep, open(os.path.join(HERE, '2026-10-13.json'), 'w'), indent=1, ensure_ascii=False)
os.makedirs(os.path.join(HERE, '..', 'out', 'check'), exist_ok=True)
open(os.path.join(HERE, '..', 'out', 'check', 'gab_rev_times.txt'), 'w').write(','.join(f'{t:.2f}' for t in REV))
print(len(shots), 'shots;', len(WARN), 'warnings')
for w in WARN: print('  ', w)
