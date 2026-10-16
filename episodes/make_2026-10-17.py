# The "As It Was" episode (2026-10-17; Harry Styles, 2022): writes episodes/2026-10-17.json.
# Kit 2026-10-17: 88.968 s, song 36.0089-124.2773 s + 0.7 s of silence (chorus 1 from the bar before its pickup, the
# post-chorus, verse 2, chorus 2, the post-chorus), 86.9976 BPM, kit beat 0 = song beat 52 at kit 0 (kit t = beat x
# 0.689675). The official TikTok sound is kit beats 25.19-112.19 (episodes/make_2026-10-17-tt.py).
# The words, from whitelisted keywords per line (never the lines): 'world' (k2.5, 84.1), 'same' (k11.6, 28.1, 44.3, 91.3,
# 108.1, 124.6), 'answer phone' (k48.7), 'alone' (k51.6), 'sitting home floor' (k55.4), 'ringing bell' (k65.1), 'help'
# (k67.7), 'daddy himself' (k71.3), 'well' (k74.7); the post-chorus lines (k34.3, 114.2) are the title's.
# The world (the official video, contact sheets): a man in a sleeveless red sequin jumpsuit and a woman in blue sequins
# dancing a push-and-pull duet on a white disc with a black ring in a white hall; London's Barbican: concrete towers,
# balconies, a crowd in winter coats; rain on its terraces.
# The story (structure COVER-UP, new: the pet-owner universal of the pet cam: the pets party while she's out, freeze in
# innocent poses whenever its red light says she's watching, each check more absurd; the payoff puts the flat back
# exactly as it was the moment she opens the door; the button gives it away):
#   0 (chorus 1, k0..34): Sadi's flat at dusk, a party: the dog in her red sequin jumpsuit and the cat in her blue one
#     dance on the white disc rug, the neighbours' pets in party hats round them, a disco ball; the pet cam's LED turns
#     red: everyone freezes; on the cam's grey feed: the dog asleep in his bed, the cat on her tree, the room empty (a
#     guest stands under a lampshade beside the lamp, ears over the sofa); Sadi at her London flower stall smiles at her
#     phone. Light off, the conga; the second check: belly up playing dead, three 'lamps', two 'plants', one guest frozen
#     mid-conga in the middle of the rug.
#   1 (the post-chorus, k34..48): Sadi shows her phone to a customer, proud; the duo's duet on the disc; the dog dances
#     on the coffee table (the Short opens here).
#   2 (verse 2, k48..80): 'answer phone': the red landline rings and the dog answers it, the party frozen round him;
#     'alone': on the feed he sits alone in the middle of the rug, the curtains drawn with feet under them; 'sitting home
#     floor': from behind the sofa, the whole party crammed there, the good boy alone beyond; Sadi melts; 'ringing bell':
#     the bouncer at the door; 'help': the pizza delivery and more guests; the pizza party; 'well': the third check, all
#     frozen mid-pizza, the dog in mid-air; Sadi shakes her phone: the feed must have frozen.
#   3 (chorus 2, k80..114): the peak; the fourth check: everyone frozen in their innocent poses except the cat, still
#     dancing on the rug; Sadi's paws fly to her cheeks; every head turns to the cat, caught; Sadi runs; the panic: the
#     guests stuffed into the closet, the dog sweeping.
#   4 (the post-chorus, k114..129): a key in the door: the dog dives into his bed and the flat is spotless in the cut;
#     the door opens on Sadi; the room exactly as it was (the title line), the dog asleep in his bed... in her red
#     sequin jumpsuit, the cat on her tree in the blue one; her stare; the button (the silent beat): the closet bursts
#     and the party spills out behind her.
import json, math, os, re, sys
sys.path.insert(0, os.path.dirname(__file__))
from cam import view

HERE = os.path.dirname(__file__)
PER = 60 / 86.9976
def T(b): return b * PER                         # kit seconds of kit beat b
def S(b, b0): return round((b - b0) * PER, 3)    # seconds from shot beat b0 to beat b

# the flat (src/maps53.js FLAT) and London (src/maps35.js LONDON)
RUG, SOFA, SEAT_Y, TABLE, TABLE_Y = (0.0, 0.3), (0.0, -3.55), 0.2, (0.0, -2.15), 0.3
BED, BED_Y = (-1.6, 2.5), 0.1
TREE_TOP, TREE_Y = (2.55, -3.45), 1.035
PHONE = (1.78, -3.55)
CAMDEV = (-1.8, 2.62, 5.74)
BOUNCER = (-3.0, 4.6)
SADI_STALL = (-5.15, -0.95)
LOOK = {'saxo': 'redsequin', 'sadi': 'florist', 'kob': 'bluesequin', 'compote': 'bouncer'}
HEAD = {'saxo': 1.38, 'sadi': 1.36, 'kob': 1.42, 'compote': 1.42}
FACE = {'saxo': 0.9, 'sadi': 0.84, 'kob': 0.86, 'compote': 0.86}
RAD = {'saxo': 0.48, 'sadi': 0.45, 'kob': 0.42, 'compote': 0.42}
CHARL = 2.467
def kick_at(rv): return round((1.6 - rv) % CHARL, 3)   # charleston's kick (clip 1.6 s) on the review frame, rv s into the shot

# the karaoke's word times (kit seconds; numbers only, never a word)
_src = open(os.path.join(HERE, '2026-10-17.lyrics.js')).read()
_rows = json.loads(re.search(r'window\.LYRICS = (.*?);\n', _src).group(1)); _ends = json.loads(re.search(r'window\.LINE_END = (.*?);\n', _src).group(1))
def Bt(t): return t / PER
LINES = [(Bt(row[0][0] - 0.35), Bt(e)) for row, e in zip(_rows, _ends)]
def has_line(b0, b1): return any(a < b1 and b > b0 for a, b in LINES)

def A(who, clip, x, z, **o):
    return {'who': who, 'look': o.pop('look', LOOK[who]), 'clip': clip, 'x': round(x, 3), 'z': round(z, 3), 'face': o.pop('face', 'world'),
            'yaw': round(o.pop('yaw', 0), 1), 'at': o.pop('at', 0.4), 'speed': o.pop('speed', 1), **o}
def idle(who, x, z, yaw, **o): return A(who, 'happy_idle', x, z, yaw=yaw, at=o.pop('at', 2.125), speed=o.pop('speed', 0), **o)
def dancer(who, x, z, yaw, rv, clip='charleston', **o):
    if clip == 'charleston': o.setdefault('at', kick_at(rv)); o.setdefault('speed', 1)
    return A(who, clip, x, z, yaw=yaw, **o)
def sit(who, x, z, yaw, lift=0.0, **o): return A(who, 'situps', x, z, yaw=yaw, at=o.pop('at', 1.0), speed=0, lift=lift, noLie=True, **o)
def lie(who, x, z, yaw, lift=0.0, **o): return A(who, 'laying_idle', x, z, yaw=yaw, at=o.pop('at', 1.0), speed=0, lift=lift, ground='mesh', **o)
def yaw_to(x, z, tx, tz): return round(math.degrees(math.atan2(tx - x, tz - z)), 1)
PAWS_UP = dict(arm='both', aim=[0.3, 0.7, 0.65], upAt=-1)        # lying belly up, paws in the air (playing dead)
PHONE_UP = dict(hold='phone', arm='R', aim=[0.75, 0.55, 0.35], upAt=-1)   # a phone held up beside the head (in front it vanishes in the chibi head)
CHEEKS = dict(arm='both', aim=[0.05, 0.42, 0.6], upAt=-1)        # paws to the cheeks
def asleep(**o): return lie('saxo', BED[0], BED[1] - 0.05, o.pop('yaw', 15), lift=BED_Y, sleep=True, **o)   # the good boy in his bed, the sleep mask on
def treecat(**o): return sit('kob', TREE_TOP[0], TREE_TOP[1], o.pop('yaw', -55), lift=TREE_Y, **o)
CAMV = ((CAMDEV[0], 2.52, CAMDEV[2] - 0.25), (-0.5, 0.3, -0.8), 66)   # the pet cam's own view, from over the front door
def camfx(clock): return dict(cctv='PET CAM', cctvClock=clock, mono=True, camLight=True, still=True)
def camview(push=0.06):   # the feed, the owner slowly zooming in on her phone (a static feed read as frozen)
    (p, l, fov) = CAMV; q = tuple(round(p[i] + (l[i] - p[i]) * push, 3) for i in range(3))
    return view(p, l, fov, p1=q, ly1=l[1] + 0.3, ease='lin')
HIDE3 = [[-0.65, -4.12, 0], [0.05, -4.15, 0], [0.7, -4.12, 0]]   # crouched behind the sofa: hats and ears over its back
LAMPS = [[-2.45, -3.85, 25], [2.5, -3.75, -25], [-4.8, 3.3, 120]]
PLANTS = [[-3.6, -3.35, 50], [4.4, -1.9, -70]]
def gset(pairs):   # gmode and gspots for the 14 guests from [(mode, [x, z, yaw])]; the rest hidden
    gm, gs = [False] * 14, [None] * 14
    for i, (m, sp) in enumerate(pairs): gm[i], gs[i] = m, sp
    return {'gmode': gm, 'gspots': gs}
def arc(cx, cz, r, a0, a1, n, mode, face='in'):
    out = []
    for k in range(n):
        a = math.radians(a0 + (a1 - a0) * k / max(1, n - 1)); x, z = cx + math.sin(a) * r, cz + math.cos(a) * r
        yw = yaw_to(x, z, cx, cz) if face == 'in' else round(math.degrees(a) + (90 if face == 'cw' else -90), 1)
        out.append((mode, [round(x, 2), round(z, 2), yw]))
    return out

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
    lift = a.get('lift', 0) + (a.get('my', 0) if end else 0); sc = a.get('scale', 1)
    fy, hy = FACE[who] * sc, HEAD[who] * sc
    if a.get('clip') == 'situps': fy, hy = 0.5 * sc, 1.02 * sc
    if a.get('clip') == 'sitting_talking': fy, hy = 0.66 * sc, 1.18 * sc
    if a.get('clip') == 'laying_idle':   # lying face up: the face ~0.3 m over the body, the head out along -z rotated by yaw
        yw = math.radians(a.get('yaw', 0)); d = 0.6 * sc; x, z = x - math.sin(yw) * d, z - math.cos(yw) * d; fy, hy = 0.3 * sc, 0.45 * sc
    return (who, x, z, fy + lift, hy + lift)
def occluded(cam, look, fov, actors, end, W_, beat):   # a face inside a nearer head's disc
    pts = []
    for a in actors:
        if a.get('fg') or a['x'] < -20: continue
        who, x, z, fy, hy = body(a, end); p = _proj(cam, look, fov, (x, fy, z))
        if not p: continue
        dep = math.dist((cam[0], cam[2]), (x, z)); pts.append((dep, who, p, head_rf(cam, look, fov, (x, fy, z), RAD[who] * a.get('scale', 1))))
    pts.sort()
    for i, (d0, w0, p0, r0) in enumerate(pts):
        for d1, w1, p1, r1 in pts[i + 1:]:
            if math.hypot(p0[0] - p1[0], (p0[1] - p1[1]) * 16 / 9) < r0 + 0.45 * r1: W_.append(f'b{beat}: {w1} behind {w0}' + (' at the end' if end else ''))
def check(beat, b1, cam, look, fov, actors, end, W_, cctv=False):
    line = has_line(beat, b1)
    occluded(cam, look, fov, actors, end, W_, beat)
    for a in actors:
        if a.get('fg') or a['x'] < -20 or (a.get('reveal') and not end): continue
        who, x, z, fy, hy = body(a, end)
        top, face = _proj(cam, look, fov, (x, hy, z)), _proj(cam, look, fov, (x, fy, z))
        tag = ' at the end' if end else ''
        if not top or not face: W_.append(f'b{beat}: {who} behind the lens{tag}'); continue
        if line and top[1] < 0.27: W_.append(f'b{beat}: {who} head top at {top[1]:.2f} (lyric rows){tag}')
        lo, hi = (0.1, 0.9) if cctv else (0.12, 0.88)
        if face[0] < lo or face[0] > hi: W_.append(f'b{beat}: {who} face x {face[0]:.2f} (edge){tag}')
        if face[1] > (0.8 if cctv else 0.86) or face[1] < 0.0: W_.append(f'b{beat}: {who} face y {face[1]:.2f}{tag}')
def lens(v, k=0):
    c, f = v; a = math.radians(c['ang'][k]); fy = f[2] if len(f) > 2 else 0
    return (f[0] + math.sin(a) * c['r'][k], c['h'][k] + fy, f[1] + math.cos(a) * c['r'][k])
def inside(c, zone='flat'):
    x, y, z = c
    if zone == 'london': return y > 0.12 and -2.85 < z < 9.5 and -15 < x < 15
    if not (-5.65 < x < 5.65 and -4.45 < z < 5.85 and 0.08 < y < 3.3): return False
    if zone == 'open': return True
    if -1.55 < x < 1.55 and -4.1 < z < -3.0 and y < 0.85: return False       # the sofa
    if -0.7 < x < 0.7 and -2.55 < z < -1.75 and y < 0.4: return False        # the table
    if 2.7 < x < 3.9 and -4.0 < z < -2.8 and y < 1.45: return False          # the cat tree
    if x > 5.0 and 1.3 < z < 5.3 and y < 1.95: return False                  # the counter and the fridge
    return True
def V(p0, l, fov=50, p1=None, **o): return ('V', p0, l, fov, p1, o)
def place(spec, dl=0.0, dk=1.0, da=0.0, dh=0.0):
    _, p0, l, fov, p1, o = spec
    L = (l[0], l[1] + dl, l[2])
    def tr(q):
        dx, dz = q[0] - l[0], q[2] - l[2]; a = math.radians(da); c, s_ = math.cos(a), math.sin(a)
        return (round(l[0] + (dx * c + dz * s_) * dk, 3), round(q[1] + dl + dh, 3), round(l[2] + (-dx * s_ + dz * c) * dk, 3))
    return view(tr(p0), L, fov, p1=tr(p1) if p1 else None, **o)
def problems(beat, b1, actors, v, zone, cctv):
    W_ = []; c, focus = v
    for k, end in ((0, 0), (-1, 1)):
        cam, look = lens(v, k), (focus[0], c['look'][k] + (focus[2] if len(focus) > 2 else 0), focus[1])
        check(beat, b1, cam, look, c['fov'], actors, end, W_, cctv)
        if not inside(cam, zone): W_.append(f'b{beat}: lens outside the {zone}')
    return W_
SOLVED = {}
def fit(spec, beat, b1, actors, zone, cctv):
    best = None
    for dl in (0, 0.1, 0.2, 0.3, 0.45):
        for dk in (1.0, 1.12, 1.25, 0.9, 1.4):
            for da in (0, -8, 8, -16, 16, -24, 24):
                for dh in (0, 0.15, -0.15, 0.3):
                    v = place(spec, dl, dk, da, dh)
                    n = len(problems(beat, b1, actors, v, zone, cctv))
                    score = n * 1000 + dl * 30 + abs(dk - 1) * 40 + abs(da) + abs(dh) * 20
                    if best is None or score < best[0]: best = (score, v, (dl, dk, da, dh))
                    if n == 0 and score < 1: return v
    SOLVED[beat] = best[2]
    return best[1]
shots = []; REV = []; WARN = []
def add(beat, b1, actors, lyric, v, rv=None, map_='petflat', **o):
    if o.pop('drop', False): return
    o = {k: val for k, val in o.items() if val is not None}
    zone = o.pop('zone_lens', 'london' if map_ == 'london' else 'flat')
    cctv = bool(o.get('cctv'))
    if v[0] == 'V': v = fit(v, beat, b1, actors, zone, cctv)
    c, focus = v
    for k, end in ((0, 0), (-1, 1)):
        cam, look = lens(v, k), (focus[0], c['look'][k] + (focus[2] if len(focus) > 2 else 0), focus[1])
        check(beat, b1, cam, look, c['fov'], actors, end, WARN, cctv)
        if not inside(cam, zone): WARN.append(f'b{beat}: lens outside the {zone} {tuple(round(q, 2) for q in cam)}')
    t0 = 0 if not shots else T(beat)
    REV.append(round(t0 + (rv if rv is not None else 0.6 * (T(b1) - t0)), 2))
    if all(a['x'] < -20 for a in actors): o.setdefault('stars', ['saxo'])
    shots.append({'beat': beat, 'kind': 'dance', 'map': map_, 'actors': actors, 'lyric': lyric, 'cam': c, 'focus': focus, **o})
    return v
PARK = [A('saxo', 'happy_idle', -30, 0, at=2.125, speed=0, fg=True)]   # the engine needs one actor: parked out of the room for an insert

# ============================================ chorus 1: the party, the first two checks ============================================
def DUO(rv, yaws=(18, -12), **o): return [dancer('saxo', -0.5, 0.45, yaws[0], rv, **o), dancer('kob', 0.55, 0.5, yaws[1], rv + 0.3, **o)]
def angel(**o): return sit('saxo', BED[0], BED[1] + 0.05, o.pop('yaw', yaw_to(BED[0], BED[1], CAMDEV[0], CAMDEV[2])), lift=BED_Y, at=0.8, halo=True, **o)   # the good boy sitting up in his bed, a halo over him
# S00 (k0..4; the intro bar, the chorus's pickup at k2.5): the hook: low on the white disc rug, the dog in Sadi's red sequin
# jumpsuit and the cat in her blue one dance the charleston, the neighbours' pets in party hats round them, the disco ball
add(0, 8, DUO(S(2, 0)), "the hook: Sadi's flat at dusk, a party: low on the white disc rug the dog in her red sequin jumpsuit and the cat in her blue one dance the charleston, the neighbours' pets in party hats round them, a disco ball turning",
    V((0.85, 0.24, 4.3), (0.0, 0.85, 0.45), fov=62, p1=(0.65, 0.28, 3.5), roll=[-9, -6]), mess=0.5, hide=['mullion'], rv=S(2, 0))
# S01 (k4..8; review 1: the bed filled the bottom, a guest's head between the two faces): from the front right, low
add(4, 8, drop=True, actors=DUO(S(6, 4), yaws=(10, -10)), lyric= "chorus 1's first line (dropped after three review loops: the hook holds)",
    v=V((0.0, 1.3, 3.6), (0.0, 0.85, 0.45), fov=54, p1=(0.0, 1.25, 3.25)), guests='cheer', mess=0.5, clear=[[0.0, 0.45, 1.6]], rv=S(6, 4))
# S02 (k8..10; review 1: the door a dead block under it, the LED a mouth): the pet cam over the front door, its status light turns red
add(8, 10, PARK, "the pet cam on its bracket over the front door: its little status light turns red: she's watching",
    view((-1.05, 2.05, 4.75), (-1.8, 2.55, 5.72), 34, p1=(-1.12, 2.08, 4.9)), camLight=S(8.6, 8), zone_lens='open', rv=S(9.4, 8))
# S03 (k10..11.6): the freeze: everyone stops dead mid-move and stares up into the camera
add(10, 11.6, DUO(S(10.4, 10), yaws=(5, -5), holdAt=0.12), "the freeze, from the pet cam's own place: everyone stops dead mid-move and stares up into the camera, the dog mid-kick",
    view((-1.7, 2.45, 5.3), (-0.2, 0.75, 0.45), 52), guests='gasp', stare=[CAMDEV[0], CAMDEV[2]], stop=0.12, mess=0.5, rv=S(11, 10))
# S04 (k11.6..16; 'same'): the pet cam's grey feed: the good boy sitting up in his bed with a halo, the cat on her tree; but a
# guest stands under a lampshade beside the lamp, eyes and ears peek over the sofa's back, the disco ball still turns
add(11.6, 16, [angel(), treecat()], "the pet cam's grey feed (PET CAM, 19:02): an innocent room: the good boy sitting up in his bed under a halo, the cat on her tree; but a guest stands under a lampshade beside the lamp, eyes peek over the sofa's back and the disco ball still turns",
    camview(), **camfx(68520), mess=0.5, **gset([('lamp', LAMPS[0]), ('hide', HIDE3[0]), ('hide', HIDE3[1]), ('hide', HIDE3[2]), ('plant', PLANTS[0])]), stare=[CAMDEV[0], CAMDEV[2]], rv=S(14, 11.6))
# S05 (k16..20; review 1: the phone half out of frame): London at dusk: Sadi at her flower stall gazes at her phone, hearts
add(16, 20, [idle('sadi', *SADI_STALL, 15, **PHONE_UP)], "London at dusk: Sadi at her flower stall gazes at her phone, held up beside her face (the pet cam's app): her good babies; hearts over her",
    V((-4.35, 1.05, 1.75), (-5.25, 0.95, -0.95), fov=46, p1=(-4.4, 1.05, 1.5)), map_='london', zone='dusk', hearts=[[-5.05, 1.45, -0.85, 0.3, 1]], rv=S(18.5, 16))
# S06 (k20..24; 'world'; review 1: no conga): the light's off: a conga line snakes across the room behind the dog, tight, all one way
CONGA = [('conga', [round(-1.45 + 0.47 * k, 2), -0.75, 90]) for k in range(5)]
s = [A('saxo', 'happy_idle', 1.05, -0.7, yaw=60, at=2.125, speed=0, arm='both', aim='caramell', flapEvery=0.5, upAt=-1, hop=[0.05, 1])]
add(20, 24, s, "the light's off and the party's back on: a conga line snakes across the room behind the dog, every guest's paws on the one in front",
    V((0.0, 1.0, 3.9), (-0.15, 0.7, -0.7), fov=58, p1=(-0.05, 0.98, 3.55)), mess=0.6, **gset(CONGA), rv=S(22, 20))
# S07 (k24..28): the duet on the disc: the dog and the cat face to face, the clip's push and pull, low
s = [dancer('saxo', -0.48, 0.45, 32, S(26, 24)), dancer('kob', 0.5, 0.45, -32, S(26, 24) + 0.3)]
add(24, 28, s, "the clip's duet: the dog and the cat dance face to face on the white disc, low, the party behind them",
    V((0.05, 0.36, 2.75), (0.0, 0.9, 0.45), fov=56, p1=(0.05, 0.42, 2.35), roll=[-6, -3]), mess=0.6, clear=[[0.0, -0.9, 0.9]], rv=S(26, 24))
# S08 (k28..30; 'same'): the light again, closer
add(28, 30, PARK, "the pet cam's status light goes red again, closer",
    view((-2.3, 2.15, 4.85), (-1.8, 2.55, 5.72), 30), camLight=S(28.4, 28), zone_lens='open', rv=S(29.2, 28))
# S09 (k30..34; review 1: the escalation didn't read): the feed (19:18), the owner zooming in: the dog belly up in his bed playing
# dead, paws in the air, tongue out; three guests under lampshades in a row on the rug, two with pot plants on their heads
add(30, 34, PARK, "the pet cam's feed again (19:18), the owner zooming in: three guests stand in a row under lampshades in the middle of the rug, eyes over the sofa",
    view((-1.75, 2.5, 5.45), (-0.2, 0.75, -0.6), 44, p1=(-1.6, 2.42, 5.0), ease='lin'), **camfx(69480), mess=0.8, **gset([('lamp', [-1.15, -0.35, 15]), ('lamp', [-0.45, -0.55, 5]), ('lamp', [0.25, -0.75, -5]), ('hide', HIDE3[0]), ('hide', HIDE3[2])]), stare=[CAMDEV[0], CAMDEV[2]], stop=0, rv=S(33, 30))

# ============================================ the post-chorus: proud owner, the duet ============================================
# S10 (k34..38; review 1: a customer's back of head): London: Sadi hugs her phone to her heart, her angels; hearts
add(34, 38, [idle('sadi', *SADI_STALL, 15, hold='phone', arm='R', aim='heart', upAt=-1)], "London: Sadi hugs her phone to her heart, proud of her angels; hearts",
    V((-4.55, 1.0, 1.6), (-5.15, 0.9, -0.95), fov=44), map_='london', zone='dusk', noguests=True, hearts=[[-5.05, 1.45, -0.85, 0.1, 1]], rv=S(36, 34))
# S11 (k38..44; review 1: the S07 lens again): the clip's disc from high: the duo dancing on the white disc, the guests cheering round it
s = [dancer('saxo', -0.48, 0.45, 25, S(41, 38)), dancer('kob', 0.5, 0.45, -25, S(41, 38) + 0.3)]
add(38, 44, s, "the clip's white disc: a crane round the duo in their red and blue sequins dancing in its ring, the guests cheering round it",
    V((0.55, 1.95, 3.7), (0.0, 0.72, 0.35), fov=54, p1=(-0.5, 1.9, 3.65), ease='lin'), guests='cheer', mess=0.7, clear=[[0.0, 0.45, 1.5]], rv=S(41, 38))
# S12 (k44..48; 'same'; the Short opens here): the dog dances on the coffee table, the party round him
add(44, 48, [dancer('saxo', 0.0, -2.15, 0, S(46, 44), lift=TABLE_Y)], "the dog dances the charleston on the coffee table, the party cheering round him (the Short's first frame)",
    V((0.35, 0.32, 0.35), (0.0, 1.05, -2.15), fov=60, p1=(0.28, 0.34, -0.2), roll=[-7, -4]), guests='cheer', mess=0.7, pizza=False, rv=S(46, 44))

# ============================================ verse 2: the call, the bell, the pizza, the frozen feed ============================================
# S13 (k48..51.6; 'answer phone' k48.7; review 1: the handset at arm's length): the landline rings; he answers it at his ear, the party frozen behind him
s = [idle('saxo', 1.25, -2.85, -10, hold='handset', holdScale=1.3, arm='R', aim=[0.3, 0.85, 0.05], upAt=-1)]
add(48, 51.6, s, "'answer phone': the red landline rings and the party freezes; the dog answers it, the handset at his ear, deadpan, the frozen guests staring at him",
    V((0.55, 1.15, 0.85), (1.15, 0.95, -2.85), fov=48), ring=[S(47.3, 48)], handset=False, guests='stare', stare=[1.25, -2.85], stop=0.2, mess=0.7,
    **gset([('stare', [0.2, -2.6, 70]), ('stare', [2.2, -2.3, -100]), ('stare', [2.4, -3.1, -95]), ('stare', [0.35, -3.25, 80])]), rv=S(50.6, 48))
# S14 (k51.6..56; 'alone'): the feed (19:41): the dog alone in the middle of the rug, sitting up like a good boy; the curtains drawn, feet under them
s = [sit('saxo', 0.0, 0.35, yaw_to(0.0, 0.35, CAMDEV[0], CAMDEV[2]), at=0.8, tongue=True)]
add(51.6, 56, s, "'alone': the pet cam's feed (19:41): the dog alone in the middle of the rug, sitting up like a good boy, nobody else in the room (only eyes over the sofa's back)",
    camview(), **camfx(70860), mess=0.7, **gset([('hide', HIDE3[0]), ('hide', HIDE3[1]), ('hide', HIDE3[2])]), stare=[CAMDEV[0], CAMDEV[2]], rv=S(54.5, 51.6))
# S15 (k56..60.4; 'sitting home floor'; review 1: no party behind the sofa): reality, from beside the good boy: every guest's eyes and ears peek over the sofa's back
s = [sit('saxo', -30, 0, 0, at=0.8, fg=True)]
add(56, 60.4, s, "'sitting home floor': reality, from beside the good boy on the floor: eyes, ears and party hats peeking over the back of the sofa, the whole party hiding there",
    view((-0.45, 0.95, 1.6), (0.15, 0.78, -3.6), 46), mess=0.7, hide=['table'], drawn=True, **gset([('hide', [-1.0, -4.1, 0]), ('hide', [-0.4, -4.12, 0]), ('hide', [0.2, -4.14, 0]), ('hide', [0.8, -4.12, 0]), ('hide', [1.3, -4.08, 0])]), stare=[-0.75, 0.6], rv=S(58.5, 56))
# S16 (k60.4..65): London: Sadi melts at her lonely good boy: paw on her heart, hearts (the S05 lens, closer)
s = [idle('sadi', *SADI_STALL, 15, hold='phone', arm='R', aim=[0.75, 0.55, 0.35], upAt=-1, armB='L', aimB='heart')]
add(60.4, 65, s, "London: Sadi melts at the feed, her lonely good boy: her paw on her heart, hearts (the same lens, closer)",
    V((-4.5, 1.05, 1.2), (-5.2, 0.97, -0.95), fov=44, p1=(-4.55, 1.05, 1.0)), map_='london', zone='dusk', hearts=[[-5.05, 1.45, -0.85, 0.1, 1]], rv=S(63, 60.4))
# S17 (k65..67.7; 'ringing bell' k65.1; review 1: a brown ball, Compote at the edge): the brass bell by the door rings; the bouncer turns to it
add(65, 67.7, [idle('compote', -0.75, 4.6, 185)], "'ringing bell': the brass bell by the front door rattles and rings; Compote the bouncer, in her black suit and earpiece, deadpan beneath it",
    V((-0.55, 1.3, 2.3), (-0.85, 1.45, 5.3), fov=50), bell=[S(65.1, 65)], mess=0.7, rv=S(66.2, 65))
# S18 (k67.7..71.3; 'help'): the door swings open: the pizza courier with a tower of boxes, more guests behind
add(67.7, 74.7, [idle('compote', -3.05, 4.95, 150)], "'help': the door swings open on the pizza courier with a tower of boxes and more guests behind him in the hallway; the party cheers",
    V((-1.3, 1.2, 2.2), (-1.8, 1.0, 6.2), fov=52), door=[0, 0.5, 0, 1], mess=0.7,
    **gset([('courier', [-1.8, 6.75, 180]), ('cheer', [-2.4, 7.4, 180]), ('cheer', [-1.25, 7.5, 180]), ('cheer', [-0.4, 4.2, 150]), ('cheer', [0.3, 3.6, 160])]), rv=S(69.5, 67.7))
# S19 (k71.3..74.7; review 1: no slice in his paw, the S07 lens): the pizza party: the dog and the cat hold up a slice each, the guests eating
SLICE = dict(hold='pizza', holdScale=1.6, arm='R', aim=[0.75, 0.55, 0.35], upAt=-1)
s = [A('saxo', 'happy_idle', -0.5, 0.45, yaw=10, at=2.125, speed=0, hop=[0.04, 1], **SLICE), A('kob', 'happy_idle', 0.55, 0.5, yaw=-10, at=2.125, speed=0, hop=[0.04, 1], **SLICE)]
add(71.3, 74.7, s, drop=True, lyric="the pizza party (dropped after three review loops: the delivery holds): the dog and the cat each hold up a slice, bouncing, the guests eating round the rug",
    v=V((0.0, 1.2, 3.75), (0.05, 0.9, 0.45), fov=56), guests='pizza', mess=0.9, clear=[[0.0, 0.45, 1.7]], rv=S(73, 71.3))
# S20 (k74.7..80; 'well'; review 1: not in mid-air): the feed (20:07), zoomed: everyone frozen mid-pizza, the dog hanging in mid-air over the rug, a slice up
add(74.7, 80, [angel(), treecat()], "'well': the pet cam's feed (20:07): the innocent tableau again, the good boy under his halo in his bed, the cat on her tree, two guests standing under lampshades, eyes over the sofa, the pizza boxes everywhere (the frozen-pizza staging failed three review loops: the first feed's passed composition)",
    camview(), **camfx(72420), mess=1.0, **gset([('lamp', LAMPS[0]), ('lamp', [-1.6, -1.0, 15]), ('hide', HIDE3[0]), ('hide', HIDE3[1]), ('hide', HIDE3[2])]), stare=[CAMDEV[0], CAMDEV[2]], rv=S(77, 74.7))
# S21 (k80..84; the gap): London: Sadi frowns at her phone and shakes it: the feed must have frozen
s = [idle('sadi', *SADI_STALL, 15, **PHONE_UP)]
add(80, 84, s, "London: Sadi gazes at her phone again, her phone beside her face: still her good babies; hearts (S05's passed setup)",
    V((-4.35, 1.05, 1.75), (-5.25, 0.95, -0.95), fov=46), map_='london', zone='dusk', hearts=[[-5.05, 1.45, -0.85, 0.1, 1]], rv=S(82, 80))

# ============================================ chorus 2: the peak, the cat caught, the panic ============================================
# S22 (k84..88; 'world'; review 1: not a peak): the peak: everyone cheering and dancing, the dog on the table, the bouncer dancing at last
s = [dancer('saxo', 0.0, -2.15, 0, S(86, 84), lift=TABLE_Y), dancer('kob', 0.75, -0.6, -20, S(86, 84) + 0.3), dancer('compote', -0.85, -0.45, 20, S(86, 84) + 0.6)]
add(84, 88, s, "the peak: the whole party cheering, the dog dancing on the coffee table, the cat and even the bouncer dancing in front of it",
    V((0.25, 1.15, 2.65), (0.0, 0.85, -1.3), fov=58, p1=(0.2, 1.05, 2.25)), guests='cheer', mess=1.0, pizza=False, clear=[[0.0, 1.0, 1.2]], rv=S(86, 84))
# S23 (k88..91.3; review 1: three heads merged): the duet again, a high three-quarter, the conga round them
s = [dancer('saxo', -0.5, 0.45, 35, S(90, 88)), dancer('kob', 0.55, 0.45, -35, S(90, 88) + 0.3)]
add(88, 91.3, s, "the duet again on the white disc, face to face, from a high three-quarter, the conga line passing behind them",
    V((1.5, 2.1, 3.1), (0.0, 0.75, 0.4), fov=54), mess=1.0, **gset([('conga', [round(-2.3 + 0.47 * k, 2), -1.55, 90]) for k in range(6)]), rv=S(90, 88))
# S24 (k91.3..94; 'same'): the light, closest yet
add(91.3, 94, PARK, "the pet cam's status light goes red, closest yet",
    view((-2.3, 2.15, 4.85), (-1.8, 2.55, 5.72), 30), camLight=S(91.7, 91.3), zone_lens='open', rv=S(92.6, 91.3))   # S08's framing, which passed (closer read as abstract shapes, twice)
KCAM = view((-1.65, 2.48, 5.3), (0.05, 0.9, 0.35), 34, p1=(-1.5, 2.4, 4.9), ease='lin')
_kc, _kl = (-1.65, 2.48, 5.3), (0.05, 0.9, 0.35)
_top, _ft = _proj(_kc, _kl, 34, (0.05, 1.5, 0.35)), _proj(_kc, _kl, 34, (0.05, 0.02, 0.35))
KBOX = [round(_top[0] - 0.2, 3), round(max(0.3, _top[1] - 0.03), 3), round(_top[0] + 0.2, 3), round(min(0.8, _ft[1] + 0.02), 3)]   # round the cat, under the lyric rows
# S25 (k94..98.6): the feed (20:33): everyone frozen in innocent poses, except the cat, still dancing in the middle of the rug
s = [A('kob', 'happy_idle', 0.05, 0.35, yaw=yaw_to(0.05, 0.35, CAMDEV[0], CAMDEV[2]), at=2.125, speed=0, arm='both', aim='rave', flapEvery=1000, flapPh=90, upAt=-1, hop=[0.06, 1], sway=8)]
add(94, 98.6, s, "the pet cam's feed (20:33), zoomed in: the guests frozen as lamps and a plant round her, and the cat in the middle of the rug, lost in the music, still dancing mid-kick: a red MOTION box blinks round her",
    KCAM, **camfx(73980), cctvBox=KBOX, mess=1.0, **gset([('lamp', [-0.95, -0.45, 15]), ('lamp', [1.05, -0.35, -15]), ('lamp', [-0.31, -0.82, 10]), ('hide', HIDE3[0]), ('hide', HIDE3[1]), ('hide', HIDE3[2])]), stare=[CAMDEV[0], CAMDEV[2]], hide=['phone'], rv=S(96.5, 94))
# S26 (k98.6..102; 'world'): London: Sadi's paws fly to her cheeks: the cat!
add(98.6, 102, [idle('sadi', *SADI_STALL, 25, **CHEEKS)], "London: Sadi's paws fly to her cheeks: the cat is dancing on the feed",
    V((-4.75, 1.05, 1.25), (-5.05, 0.97, -0.95), fov=42), map_='london', zone='dusk', pets='gasp', stare=[-5.05, -0.95], rv=S(100, 98.6))
# S27 (k102..106): the flat: every head turns to the cat; she stops mid-kick, caught, and looks up at the camera
s = [A('kob', 'charleston', 0.05, 0.35, yaw=yaw_to(0.05, 0.35, CAMDEV[0], CAMDEV[2]), at=1.6, speed=0)]
add(102, 106, s, "the flat: every head turns to the cat; she stops mid-kick, caught, and looks straight up at the pet cam",
    V((-1.25, 1.5, 3.7), (0.05, 0.85, 0.35), fov=50), guests='gasp', stare=[0.05, 0.35], mess=1.0, rv=S(104, 102))
# S28 (k106..110; review 1: a passer-by on her muzzle): London: Sadi runs off from her stall, side on, the street clear
add(106, 110, [A('sadi', 'happy_run', -5.8, -0.55, yaw=90, at=0.5, speed=1.4, mx=1.7, reveal=0.2)], "London: Sadi runs off from her flower stall down the street, side on",
    V((-4.9, 0.95, 3.4), (-4.9, 0.8, -0.55), fov=46), map_='london', zone='dusk', noguests=True, rv=S(108, 106))
# S29 (k110..114.2; 'same'; review 1: the broom read as a cone): the panic: the guests squeeze into the closet, the bouncer shoving, the dog pushing the last one in
s = [idle('compote', -2.35, 4.85, -70, arm='both', aim=[0.1, 0.1, 0.95], upAt=-1)]
add(110, 114.2, s, "the panic: the guests squeeze into the closet, the bouncer shoving the last ones in",
    V((-1.55, 1.55, 0.9), (-3.15, 0.8, 4.75), fov=54), closet=1, mess=0.6, **gset(
        [('flee', [-3.4, 5.75, 0]), ('flee', [-2.95, 5.65, 5]), ('flee', [-3.5, 5.25, -10]), ('flee', [-2.85, 5.1, 10]), ('flee', [-3.65, 4.75, -15])]), rv=S(112, 110))

# ============================================ the post-chorus: as it was ============================================
# S30 (k114.2..117.6; review 1: the mask a floating plank, his head cut): the dog dives into his bed and sits up under his halo; the flat is spotless
s = [sit('saxo', BED[0], BED[1] + 0.05, 75, lift=BED_Y + 0.75, at=0.8, my=-0.75, myAt=0.05, myDur=0.3, air=True, halo=0.4, reveal=0.35)]
add(114.2, 117.6, s, "a key turns in the door (it shudders): the dog dives into his bed and sits up under his halo, the very picture of innocence; the flat is spotless, as if nothing happened",
    V((0.55, 1.15, 2.15), (-1.6, 0.82, 2.55), fov=50), zone='tidy', door=[0.1, 0.3, 0, 0.04], rv=S(116.6, 114.2))
# S31 (k117.6..121.4): the door swings open: Sadi in the doorway, deadpan, her bouquet in her paw
add(117.6, 121.4, [idle('sadi', -1.8, 6.65, 180, hold='bouquet', holdScale=1.2)], "the door swings open on Sadi in the lit hallway, back from work, deadpan, a bouquet in her paw",
    V((-1.15, 1.05, 3.55), (-1.8, 0.95, 6.4), fov=50), zone='tidy', door=[0, 0.7, 0, 1], zone_lens='open', rv=S(120, 117.6))
# S32 (k121.4..124.6; review 1: the mask plank): her point of view: the flat exactly as it was: the good boy in his bed with his halo (in her red sequins), the cat on her tree
add(121.4, 124.6, drop=True, actors=[angel(yaw=0), treecat()], lyric= "her point of view: the flat exactly as it was, spotless: the good boy sitting in his bed with his halo, the cat on her tree; but he's still in her red sequin jumpsuit and the cat in the blue one",
    v=V((-2.15, 1.6, 5.55), (-1.4, 0.55, 0.9), fov=56), zone='tidy', door=1, zone_lens='open', rv=S(123, 121.4))
# S33 (k124.6..128; the title line; review 1: Sadi back in the doorway): Sadi at the foot of his bed staring down at the dog in her jumpsuit
SADI_BED = (-1.6, 3.6)
add(121.4, 128, [idle('sadi', *SADI_BED, 150, hold='bouquet', holdScale=1.2), angel(yaw=35)], "the title line: Sadi stands over his bed and stares down at the good boy in her red sequin jumpsuit, his halo glowing, deadpan",
    V((0.75, 1.45, 2.75), (-1.6, 0.85, 3.05), fov=52), zone='tidy', door=1, rv=S(124.6, 121.4))
# S34 (k128..129.1; the silent beat; review 1: a small heap, Sadi cut): the button: the closet bursts and the party spills across the floor behind her
add(128, 129.1, [idle('compote', -30, 0, 0, fg=True)], "the button, in the silence: on the panic shot's lens, the closet bursts open in the spotless flat and the whole party spills out across the floor",
    V((-1.55, 1.55, 0.9), (-3.15, 0.8, 4.75), fov=54), zone='tidy', door=1, closet=[0, 0.1, 0, 1], spill=0.0, still=True, rv=S(128.6, 128))

shots.sort(key=lambda x: x['beat'])
ep = {
    'date': '2026-10-17', 'song': {'title': 'As It Was', 'artist': 'Harry Styles'},
    'logline': "While Sadi's at work the pets throw a party in her flat, and every time the pet cam's red light says she's watching they freeze into innocent poses, each check more absurd, until the cat is caught dancing; she runs home and opens the door on the flat exactly as it was: the good boy under his halo in his bed, still in her red sequin jumpsuit; then the closet bursts open and the whole party spills out.",
    'new': "src/maps53.js: petflat (Sadi's flat in a concrete London block at dusk, the clip's white disc as the rug: a party with a disco ball, bunting, streamers, confetti, pizza boxes; the pet cam on its shelf with a red LED; the red landline that rings, the brass doorbell, the front door and the closet beside it; party pets in hats that dance, conga, eat pizza, freeze, hide behind the sofa, stand under lampshades or hold pot plants on their heads, flee into the closet and spill out of it; curtains drawn with feet under them; a tidy zone for the cover-up); the 'pizza' hand prop; two looks: Saxo's red sequin jumpsuit (the singer's) and Kob's blue one (the dancer's); the structure COVER-UP",
    'notes': "The world, from the official video (contact sheets): a man in a sleeveless red sequin jumpsuit and a woman in blue sequins dance a push-and-pull duet on a white disc with a black ring in a white hall; London's Barbican, concrete towers and balconies; rain. The words, from whitelisted keywords per line: world, same, answer, phone, alone, sitting, home, floor, ringing, bell, help, daddy, himself, well. Cast: Saxo in Sadi's red sequin jumpsuit (the singer's look: the dog in the owner's clothes), Kob in her blue one (the clip's dancer, the cat who's secretly the best dancer, caught), Compote the bouncer at the party's door (her bouncer suit), Sadi the London florist at her stall checking the pet cam (her florist look, So Easy's stall). Live reference: home-cam (a pet caught on the home camera).",
    'tiktok_sound': '7081404214387148802',
    'with': ['sadi', 'kob', 'compote'],
    'clips': sorted({a['clip'] for s in shots for a in s['actors']}),
    'tags': {'structure': 'cover-up', 'scenes': ['the party', 'the pet cam LED', 'the freeze', 'the grey feed', 'Sadi at her stall', 'the conga', 'the duet on the disc', 'the dog on the table', 'the landline', 'the good boy alone', 'behind the sofa', 'the doorbell', 'the pizza delivery', 'the halo check', 'the cat caught dancing', 'the closet', 'the dive into bed', 'the door', 'as it was', 'the spill'],
             'cast': ['saxo', 'sadi', 'kob', 'compote'], 'hook': 'dance', 'maps': ['petflat', 'london'], 'ref': 'home-cam',
             'lyric_literal': "'answer phone' (the dog answers the landline), 'alone' (alone on the feed), 'sitting home floor' (the good boy sitting on the floor), 'ringing bell' (the doorbell), 'help' (the pizza delivery), 'well' (the check), the title line (the flat exactly as it was)",
             'experiment': "Does the most-filmed pet-owner format there is (what my pets do when I leave: the pet cam check, the freeze, the cover-up), on Harry Styles' 2.33M-video sound in the middle of a Harry Styles wave on the charts, lift the Short's views at 24 h over our last three episodes?"},
    'shots': shots,
}
json.dump(ep, open(os.path.join(HERE, '2026-10-17.json'), 'w'), indent=1, ensure_ascii=False)
os.makedirs(os.path.join(HERE, '..', 'out', 'check'), exist_ok=True)
open(os.path.join(HERE, '..', 'out', 'check', 'aiw_rev_times.txt'), 'w').write(','.join(f'{t:.2f}' for t in REV))
print(len(shots), 'shots;', len(WARN), 'warnings')
for b, q in SOLVED.items(): print('   moved', b, q)
for w in WARN: print('  ', w)
