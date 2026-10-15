# The "Ordinary" episode (2026-10-16; Alex Warren, 2025): writes episodes/2026-10-16.json.
# Kit 2026-10-16: 73.6094 s, song beats 130-232 (the pickup line, chorus 2, the post-chorus, the middle eight, the hushed
# bridge and the build to the final chorus, cut on the downbeat where its drums would come in) + 0.75 s of silence,
# 83.9974 BPM, kit beat 0 = song beat 132 at 1.4286 s (kit t = 1.4286 + kit beat x 0.7143). The TikTok cut is this kit's
# first 60 s (kit beats -2..82): the official sound is the same stretch of the same master.
# The words, from whitelisted keywords per line (never the lines): 'ordinary' (k2.34), 'want ... down' (k5.39, 6.82),
# the hook line 'angels ... up ... clouds ... found' (k19.4-23.2), 'ordinary' twice (k26.5, 26.9), 'ground' twice (k30.8,
# 31.4), 'touch' (k36.8), the hook line again (k42.7-47.4), 'world ... light' (k61.3, 66.6), 'die' (k69.7), 'ordinary'
# (k74.4), 'want ... down' (k77.4, 78.7), the hook line (k90.6-95.4), 'ordinary' (k98.4) into the dead stop (k100).
# The world (the official video, contact sheets): a man waiting in a teal-lit laundromat sees a girl across the machines,
# their hands touch over the laundry, a washing machine's drum turns into a portal of light and the two drift through a
# forest, a beach and a desert at golden hour, floating hand in hand. Ours (src/maps51.js laundromat): the laundromat late
# at night, its drums glowing warm.
# The story (structure SISYPHUS: the pets who love her undo every load; the payoff does the chore to them; the button undoes
# it all):
#   0 (the pickup and chorus 2, k-2..24): Sadi folds her laundry in the night laundromat; the cat sleeps on her fresh stack,
#     she lifts it down; the dog dances off with her sock; a dryer door opens, the warm laundry pours out and the dog dives
#     into it: an angel up in the clouds (a halo, gold light).
#   1 (the post-chorus, k24..48): she folds faster ('ordinary' twice); the dog's zoomies send the stack to the 'ground';
#     her 'touch' finds the cat asleep in the warm cart; both pets in the warm heap: angels in the clouds.
#   2 (the middle eight, k48..72): Compote the attendant holds up NO PETS; the dog's innocent face with a sock in his jaws;
#     he dances with her socks; hypnotised by the drum's 'light'; Sadi flops face down on the laundry: 'die'.
#   3 (the hushed bridge, k72..96): calm, she folds them: the dog rolled in a towel, the cat in a smaller one, set 'down' in
#     the cart (the TikTok cut ends here); Compote lowers NO PETS (it's laundry now); she folds in peace; the burritos asleep:
#     angels in the clouds.
#   4 (the build and the dead stop, k96..101): she tops the perfect stack on 'ordinary'; on the drop that never comes the dog
#     bursts out of his towel and the stack explodes: freeze, silence.
import json, math, os, re, sys
sys.path.insert(0, os.path.dirname(__file__))
from cam import view, vpath

HERE = os.path.dirname(__file__)
PER, B0T = 60 / 83.9974, 1.42862
def T(b): return B0T + b * PER                   # kit seconds of kit beat b
def S(b, b0): return round((b - b0) * PER, 3)    # seconds from shot beat b0 to beat b

# the map (src/maps51.js LAUNDRO)
TABLE_Y, TW_H = 0.48, 0.08
FOLD = (0.0, -0.55)                              # Sadi behind the folding table, facing +z
STK = (0.85, 0.2)                                # her stack on the table
CART, CART_Y = (-2.6, 1.6), 0.46
COUNTER_Y, ATT = 0.6, (5.95, 2.7)
DANCE = (-1.3, -2.5)                             # the dog's floor in front of the dryers
HEAP = (-1.3, -3.4)                              # where the warm laundry lands, out of dryer col 2 row 0
KS = 0.6                                         # the cat: Kob at 0.6, a cat-sized cat
LOOK = {'saxo': 'cherry', 'sadi': 'laundry', 'kob': 'kob', 'compote': 'attendant'}
HEAD = {'saxo': 1.55, 'sadi': 1.45, 'kob': 1.5 * KS, 'compote': 1.5}
FACE = {'saxo': 0.9, 'sadi': 0.84, 'kob': 0.86 * KS, 'compote': 0.86}
RAD = {'saxo': 0.48, 'sadi': 0.45, 'kob': 0.42 * KS, 'compote': 0.42}
CHARL = 2.467
def kick_at(rv): return round((1.6 - rv) % CHARL, 3)   # charleston's kick (clip 1.6 s) on the review frame, rv s into the shot
MINT, PINK = 0xa8e6d4, 0xffc2d6

# the karaoke's word times (kit seconds; numbers only, never a word)
_src = open(os.path.join(HERE, '2026-10-16.lyrics.js')).read()
_rows = json.loads(re.search(r'window\.LYRICS = (.*?);\n', _src).group(1)); _ends = json.loads(re.search(r'window\.LINE_END = (.*?);\n', _src).group(1))
def Bt(t): return (t - B0T) / PER
LINES = [(Bt(row[0][0] - 0.35), Bt(e)) for row, e in zip(_rows, _ends)]
def has_line(b0, b1): return any(a < b1 and b > b0 for a, b in LINES)

def A(who, clip, x, z, **o):
    a = {'who': who, 'look': o.pop('look', LOOK[who]), 'clip': clip, 'x': round(x, 3), 'z': round(z, 3), 'face': o.pop('face', 'world'),
         'yaw': round(o.pop('yaw', 0), 1), 'at': o.pop('at', 0.4), 'speed': o.pop('speed', 1), **o}
    if who == 'kob': a.setdefault('scale', KS)
    return a
def yaw_to(frm, to): return round(math.degrees(math.atan2(to[0] - frm[0], to[1] - frm[1])), 1)
def idle(who, x, z, yaw, **o): return A(who, 'happy_idle', x, z, yaw=yaw, at=o.pop('at', 2.125), speed=o.pop('speed', 0), **o)
def dancer(who, x, z, yaw, rv, clip='charleston', **o):
    if clip == 'charleston': o.setdefault('at', kick_at(rv)); o.setdefault('speed', 1)
    return A(who, clip, x, z, yaw=yaw, **o)
def sit(who, x, z, yaw, lift=0.0, **o): return A(who, 'situps', x, z, yaw=yaw, at=o.pop('at', 1.0), speed=0, lift=lift, noLie=True, **o)
def lie(who, x, z, yaw, lift=0.0, **o): return A(who, 'laying_idle', x, z, yaw=yaw, at=o.pop('at', 1.0), speed=0, lift=lift, ground='mesh', **o)
PAWSUP = dict(arm='both', aim=[0.3, 0.7, 0.65], upAt=-1)
FOLDING = dict(hold='towel', arm='both', aim='fold', upAt=-1)
def folder(x=FOLD[0], z=FOLD[1], yaw=0, **o): return A('sadi', 'happy_idle', x, z, yaw=yaw, at=0.6, speed=o.pop('speed', 0.12), **FOLDING, **o)
def stack(n, **o): return {'x': STK[0], 'z': STK[1], 'y': TABLE_Y, 'n': n, **o}
def stack_top(n): return TABLE_Y + n * TW_H

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
    lift = a.get('lift', 0) + (a.get('my', 0) if end else 0); sc = a.get('scale', 1) / (KS if who == 'kob' else 1)
    fy, hy = FACE[who] * sc, HEAD[who] * sc
    if a.get('clip') == 'situps': fy, hy = 0.5 * a.get('scale', 1), 1.02 * a.get('scale', 1)
    if a.get('clip') == 'laying_idle':   # lying face up: the face ~0.2 m over the body, the head out along -z rotated by yaw
        yw = math.radians(a.get('yaw', 0)); d = 0.6 * a.get('scale', 1); x, z = x - math.sin(yw) * d, z - math.cos(yw) * d; fy, hy = 0.3 * a.get('scale', 1), 0.45 * a.get('scale', 1)
    return (who, x, z, fy + lift, hy + lift)
def occluded(cam, look, fov, actors, end, W_, beat):   # a face inside a nearer head's disc
    pts = []
    for a in actors:
        if a.get('fg') or a['x'] < -20: continue
        who, x, z, fy, hy = body(a, end); p = _proj(cam, look, fov, (x, fy, z))
        if not p: continue
        dep = math.dist((cam[0], cam[2]), (x, z)); pts.append((dep, who, p, head_rf(cam, look, fov, (x, fy, z), RAD[who] * a.get('scale', 1) / (KS if who == 'kob' else 1))))
    pts.sort()
    for i, (d0, w0, p0, r0) in enumerate(pts):
        for d1, w1, p1, r1 in pts[i + 1:]:
            if math.hypot(p0[0] - p1[0], (p0[1] - p1[1]) * 16 / 9) < r0 + 0.45 * r1: W_.append(f'b{beat}: {w1} behind {w0}' + (' at the end' if end else ''))
def check(beat, b1, cam, look, fov, actors, end, W_):
    line = has_line(beat, b1)
    occluded(cam, look, fov, actors, end, W_, beat)
    for a in actors:
        if a.get('fg') or a['x'] < -20 or (a.get('reveal') and not end): continue
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
def inside(c, zone='room'):
    x, y, z = c
    if not (-6.3 < x < 6.3 and -4.55 < z < 8.2 and 0.08 < y < 4.4): return False
    if zone == 'open': return True
    if -1.8 < x < 1.8 and -0.4 < z < 1.1 and y < 0.75: return False            # inside the folding table
    if abs(x - CART[0]) < 0.62 and abs(z - CART[1]) < 0.42 and y < 0.95: return False   # inside the cart
    if 4.65 < x < 5.55 and 1.5 < z < 3.9 and y < 0.95: return False            # inside the counter
    if x < -5.35 and y < 1.15: return False                                    # inside the washers
    if x > 5.7 and -2.0 < z < 0.85 and y < 0.95: return False                  # among the chairs
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
PARK = A('saxo', 'happy_idle', -30.0, 0.0, fg=True, at=2.125, speed=0)          # an actor out of every frame (an insert with nobody in it)
shots = []; REV = []; WARN = []
def add(beat, b1, actors, lyric, v, rv=None, **o):
    if o.pop('drop', False): return
    o = {k: val for k, val in o.items() if val is not None}
    zone = o.pop('zone_lens', 'room')
    if v[0] == 'V': v = fit(v, beat, b1, actors, zone)
    c, focus = v
    for k, end in ((0, 0), (-1, 1)):
        cam, look = lens(v, k), (focus[0], c['look'][k] + (focus[2] if len(focus) > 2 else 0), focus[1])
        check(beat, b1, cam, look, c['fov'], actors, end, WARN)
        if not inside(cam, zone): WARN.append(f'b{beat}: lens outside the {zone} {tuple(round(q, 2) for q in cam)}')
    t0 = 0 if not shots else T(beat)
    REV.append(round(t0 + (rv if rv is not None else 0.6 * (T(b1) - t0)), 2))
    if all(a['x'] < -20 for a in actors): o.setdefault('stars', ['saxo'])
    shots.append({'beat': beat, 'kind': 'dance', 'map': 'laundromat', 'actors': actors, 'lyric': lyric, 'cam': c, 'focus': focus, **o})

HEAVEN = dict(heaven=[0, 0.5, 0.0, 0.6], sparkle=[[HEAP[0], 0.3, HEAP[1], 0.9]], steam=[[HEAP[0] - 0.35, 0.3, HEAP[1] - 0.75], [HEAP[0] + 0.4, 0.3, HEAP[1] - 0.65]])   # no shaft of light, the steam beyond the heads: from the lens over his feet they were a dotted veil across the frame (review 1)
def ROLLS(**o):   # the two rolls side by side in the cart, heads to -x (the dog's mint, the cat's smaller pink)
    k = {key: val for key, val in o.items() if key in ('halo', 'sleep')}
    return [lie('saxo', CART[0] + 0.05, CART[1] + 0.13, 90, lift=CART_Y, tongue=not k.get('sleep'), burrito={'col': MINT, 'r': 0.29}, **k), lie('kob', CART[0] + 0.12, CART[1] - 0.2, 90, lift=CART_Y + 0.04, burrito={'col': PINK, 'r': 0.2}, **{**k, 'sleep': True})]
def CLOUD(s0, **o): return {'cloud': [{'from': [2, 0], 'x': HEAP[0], 'z': HEAP[1], 's0': s0, 'n': 90, 'r': 1.0, 'h': 0.42, **o}]}

# ============================================ the pickup and chorus 2 ============================================
# S00 (k-2..2): the hook: over the cat asleep on Sadi's fresh stack (the cat-on-the-laundry universal, frame 1), Sadi
# folding behind the table, the dog dancing in front of the glowing dryers: the lens pushes in low over the table
HOOK_STK = (1.0, 0.55)                           # the hook's stack at the table's front right, near the lens (at STK the cat was small, against the dryers' doors)
s = [dancer('saxo', -1.4, -1.3, 20, S(0.5, -2)), folder(x=0.2), sit('kob', *HOOK_STK, yaw_to(HOOK_STK, (1.75, 2.45)), lift=stack_top(6), sleep=True)]
add(-2, 2, s, "the hook: the night laundromat, the cat asleep sitting on Sadi's fresh folded stack in the near foreground, Sadi folding a towel behind the table, the dog in the singer's cream jacket dancing behind", V((1.75, 1.3, 2.45), (-0.1, 0.95, -0.55), fov=60, p1=(1.65, 1.28, 2.2)), stack=[{'x': HOOK_STK[0], 'z': HOOK_STK[1], 'y': TABLE_Y, 'n': 6}], rv=S(0.5, -2))
# S01 (k2..4.9; 'ordinary'): she tugs at her stack: the cat asleep on it doesn't budge
s = [A('sadi', 'happy_idle', 0.62, -0.5, yaw=30, at=0.6, speed=0.12, arm='both', aim=[0.2, -0.1, 0.97], upAt=-1), sit('kob', STK[0], STK[1], yaw_to(STK, (-0.55, 2.3)), lift=stack_top(6), sleep=True)]
add(2, 4.9, s, "'ordinary': Sadi reaches for her fresh stack; the cat asleep on top of it doesn't move a whisker", V((-0.55, 1.45, 2.3), (0.6, 0.95, -0.15), fov=52), stack=[stack(6)], rv=S(3.5, 2))
# S02 (k4.9..6.8; 'want'): she lifts the cat off it, held to her chest
def KH(c, yaw, fwd=0.32, side=0.14): return (c[0] + fwd * math.sin(math.radians(yaw)) + side * math.cos(math.radians(yaw)), c[1] + fwd * math.cos(math.radians(yaw)) - side * math.sin(math.radians(yaw)))
def cradle(c, yaw, side=0.14, lift=0.26, aim=(0.12, -0.12, 0.85), **ko):
    hx, hz = KH(c, yaw, side=side)
    return [A('sadi', 'happy_idle', c[0], c[1], yaw=yaw, at=0.4, speed=0.15, arm='both', aim=list(aim), upAt=-1),
            A('kob', 'situps', hx, hz, at=1.0, speed=0, lift=lift, noLie=True, air=True, noShadow=True, yaw=yaw, sleep=True, **ko)]
s = cradle((-0.5, -0.95), 0, side=0.22, lift=0.3, aim=(0.16, -0.12, 0.85))
add(4.9, 6.8, s, "'want': she lifts the sleeping cat off her laundry, held to her chest", V((-1.45, 1.2, 1.35), (-0.42, 0.85, -0.75), fov=50), stack=[stack(6)], rv=S(5.6, 4.9), drop=True)   # fallback (3 failed loops): dropped, S01 holds over its beats
# S03 (k6.8..8.6; 'down'): set down on the floor, the cat glares up at the lens
s = [sit('kob', 0.95, 1.15, 0)]
add(6.8, 8.6, s, "'down': set down on the floor, the cat glares up, deadpan", V((0.95, 0.45, 2.35), (0.95, 0.52, 1.15), fov=46), stack=[stack(6)], rv=S(7.6, 6.8))
# S04 (k8.6..12): the dog dances in front of the drums with her sock in his jaws: a low dolly-in
s = [dancer('saxo', *DANCE, 8, S(10.6, 8.6), fetch='sock')]
add(8.6, 12, s, "the dog dances off with her sock in his jaws, the dryers glowing behind him: a low dolly-in", V((-0.75, 0.24, 0.55), (-1.3, 0.78, -2.5), fov=62, p1=(-0.92, 0.22, -0.25), roll=[-8, -11]), stack=[stack(6)], rv=S(10.6, 8.6))
# S05 (k12..15): Sadi holds up one sock, looking for its pair; behind her the dog dances with the other
s = [A('sadi', 'happy_idle', 0.15, -0.55, yaw=-15, at=0.6, speed=0.12, hold='sock', holdScale=1.1, arm='R', aim=[0.62, 0.6, 0.3], upAt=-1), dancer('saxo', -1.35, -2.75, 15, S(13.6, 12), fetch='sock')]
add(12, 15, s, "Sadi holds up one sock, looking for its pair; behind her the dog dances with the other one in his jaws", V((0.4, 1.35, 1.75), (-0.35, 1.0, -1.4), fov=50), stack=[stack(6)], rv=S(13.6, 12))
# S06 (k15..19.3): a dryer door swings open, warm light pouring out; the dog peers into it, enchanted, tongue out
s = [idle('saxo', -1.4, -1.75, 180, tongue=True)]
add(15, 19.3, s, "seen from inside the dryer: the dog peers into the warm drum, enchanted, tongue out, the laundry tumbling round the porthole", view((-1.4, 0.8, -4.5), (-1.4, 0.9, -1.75), 58), porthole=True, key=[-1.4, 1.0, -3.0, 1.7, 1.05, 0.45], doors=[[2, 0, [0.3, 1.0, 0, 1]]], stack=[stack(6)], heaven=[1.4, 2.4, 0, 0.45], rv=S(18.6, 15))
# S07 (k19.3..23.7; the hook line 'angels up in the clouds ... found'): the warm laundry pours out and he dives in: on his
# back in the warm heap, paws up, tongue out, a halo: an angel up in the clouds
s = [lie('saxo', HEAP[0], HEAP[1], 0, lift=0.1, tongue=True, halo=True, **PAWSUP)]
add(19.3, 23.7, s, "'angels up in the clouds': the warm laundry pours out of the dryer and the dog lies blissed in the heap, paws up, tongue out, a halo over his head, gold light, steam", V((-1.3, 3.0, -2.2), (-1.3, 0.3, -4.2), fov=56), doors=[[2, 0, 1]], **CLOUD(-1.6), **HEAVEN, stack=[stack(6)], rv=S(20.6, 19.3))

# ============================================ the post-chorus: faster, the zoomies, the touch ============================================
# S08 (k23.7..28.4; 'ordinary' twice): she folds faster, the stack growing a towel per half beat
s = [folder(flapEvery=0.5), dancer('saxo', -1.3, -2.4, 20, S(26.5, 23.7), fetch='sock')]
add(23.7, 28.4, s, "'ordinary, ordinary': Sadi folds faster, two folds on the two words, her stack growing a towel per half beat", V((0.3, 1.5, 2.0), (0.2, 0.85, -0.4), fov=52), stack=[stack(12, grow=[0.0, 0.5, 3])], rv=S(26.75, 23.7))
# S09 (k28.4..31.4; 'ground'): the zoomies: the dog races past the table and the stack goes to the ground on the word
s = [A('saxo', 'happy_run', 2.2, 1.3, yaw=-90, at=0.2, speed=1.3, mx=-1.8, mz=0, reveal=0.4), folder(x=1.6)]
add(28.4, 31.4, s, "'ground': the zoomies: the dog races past the table, side on, and her stack topples to the ground on the word", view((1.0, 1.0, 5.6), (1.0, 0.8, 0.6), 62), stack=[stack(12, fall=S(30.08, 28.4), dir=0, spread=1.6)], rv=S(31.3, 28.4))
# S10 (k31.4..35; 'ground' again): the towels all over the floor, Sadi frozen with her paws on her cheeks, the cat lying down on them
SPILL = stack(12, fall=-9, dir=10, spread=1.6)
s = [A('sadi', 'happy_idle', 0.0, -0.55, yaw=0, at=0.6, speed=0, arm='both', aim=[0.05, 0.42, 0.6], upAt=-1), lie('kob', 0.75, 1.3, 22, lift=0.08, sleep=True)]
add(31.4, 35, s, "'ground': her folded towels all over the floor, Sadi frozen with her paws on her cheeks, and the cat already lying down on them", V((1.6, 2.1, 3.4), (0.55, 0.5, 0.75), fov=54), stack=[SPILL], rv=S(33.2, 31.4))
# S11 (k35..41.9; 'touch'): she reaches into the cart of warm laundry and touches the cat asleep in it
s = [A('sadi', 'happy_idle', CART[0] + 0.86, CART[1] + 0.05, yaw=-90, at=0.6, speed=0, arm='both', aim=[0.12, -0.45, 0.88], upAt=-1), sit('kob', CART[0] + 0.22, CART[1], 25, lift=CART_Y + 0.24, sleep=True)]   # on top of the warm laundry, her face over the rail (at CART_Y the top rail crossed it)
add(35, 41.9, s, "'touch': her paw reaches into the cart of warm clean laundry and finds the cat asleep in it", V((-1.7, 2.5, 3.5), (-2.15, 0.85, 1.55), fov=50), pile=[{'x': CART[0], 'z': CART[1], 'y': CART_Y, 'r': 0.42, 'h': 0.28, 'n': 30}], stack=[SPILL], rv=S(36.9, 35))
# S12 (k41.9..48; the hook line again): both pets in the warm heap: the dog on his back, the cat curled on his chest, halos
s = [lie('saxo', HEAP[0], HEAP[1], 0, lift=0.1, tongue=True, halo=True, **PAWSUP), lie('kob', HEAP[0] + 0.05, HEAP[1] + 0.35, 0, lift=0.45, halo=True, sleep=True)]
add(41.9, 48, s, "'angels up in the clouds': both pets in the warm heap, the dog on his back, the cat asleep on his belly, two halos, gold light", V((-1.0, 3.0, -2.1), (-1.0, 0.3, -4.1), fov=56), doors=[[2, 0, 1]], **CLOUD(-9), **HEAVEN, stack=[SPILL], rv=S(44.3, 41.9))

# ============================================ the middle eight: NO PETS, the innocent face, the drum, 'die' ============================================
# S13 (k48..52): Compote the attendant behind her counter, deadpan, NO PETS held up beside her face
s = [idle('compote', *ATT, -90, hold='nopets', arm='R', aim=[0.45, 0.62, 0.64])]
add(48, 52, s, "Compote the attendant behind her counter holds up her NO PETS sign, deadpan", V((3.75, 1.2, 2.85), (5.95, 1.05, 2.7), fov=40, p1=(3.95, 1.18, 2.82)), rv=S(50, 48))
# S14 (k52..55): the dog's innocent face, a sock hanging from his jaws, a halo: who, me?
s = [idle('saxo', -0.6, -1.6, 0, fetch='sock', halo=True)]
add(52, 55, s, "the dog's innocent face, a sock hanging from his jaws, his halo on: who, me?", V((-0.55, 1.15, 0.45), (-0.6, 1.0, -1.6), fov=44), stack=[SPILL], rv=S(53.5, 52))
# S15 (k55..61.2): the sock thief's dance: a sock in each paw, in front of the glowing drums
s = [dancer('saxo', *DANCE, -10, S(58.5, 55), hold='sock', holdScale=1.2, arm='R', aim=[0.72, 0.4, 0.4], upAt=-1, fetch='sock')]
add(55, 61.2, s, "the sock thief's dance: a sock in his jaws and another in his paw, in front of the glowing drums: a handheld orbit", V((0.0, 0.6, -0.25), (-1.3, 0.85, -2.5), fov=60, p1=(-2.55, 0.62, -0.45), roll=[-6, 5], hand=1.2), stack=[SPILL], rv=S(58.5, 55))
# S16 (k61.2..66.6; 'world ... light'): the dog sits watching the dryer spin like it's TV, from behind him and to his right
# (the pet universal's own framing), the drum beside his head; on 'light' its glow washes over him
s = [sit('saxo', -2.55, -3.8, -165)]
add(61.2, 66.6, s, "'world ... light': the dog sits watching the dryer spin like it's TV, from behind him: the drum's colours beside his head, its glow washing over him on 'light'", V((-1.2, 0.9, -2.3), (-2.6, 0.75, -4.6), fov=52), heaven=[3.4, 5.2, 0.0, 0.55], stack=[SPILL], rv=S(64.0, 61.2))
# S17 (k66.6..69.7): fallback (3 failed loops) to S01's passed composition: she reaches for her first two towels and the cat is already
# asleep sitting on them, the same frame as the first time: she starts over, the cat starts over
s = [A('sadi', 'happy_idle', 0.62, -0.5, yaw=30, at=0.6, speed=0.12, arm='both', aim=[0.2, -0.1, 0.97], upAt=-1), sit('kob', STK[0], STK[1], yaw_to(STK, (-0.55, 2.3)), lift=stack_top(2), sleep=True)]
add(66.6, 69.7, s, "Sadi starts over, and the cat is already asleep on her first two towels: the same frame as the first time", V((-0.55, 1.45, 2.3), (0.6, 0.95, -0.15), fov=52), stack=[stack(2), SPILL], rv=S(68.5, 66.6))
# S18 (k69.7..71.7; 'die'): face down on the laundry on the floor: she gives up
s = [lie('sadi', 0.6, 1.65, 0, lift=0.08)]
add(69.7, 71.7, s, "'die': Sadi flops flat on her back onto the laundry on the floor and gives up", V((0.6, 2.4, 3.35), (0.6, 0.2, 1.4), fov=50), stack=[SPILL], rv=S(70.5, 69.7))

# ============================================ the hushed bridge: she folds them ============================================
STK2 = (1.3, 0.25)                                # the perfect stack, at the table's right end
SFOLD = (0.75, -0.5)                              # Sadi's spot in the bridge: behind the gap between the cat's roll and the stack
DOGR, CATR = (-0.55, 0.3), (0.15, 0.35)          # the two rolls stood up on the table like folded laundry, facing the front
def ROLLS_T(**o):
    k = {key: val for key, val in o.items() if key in ('halo', 'sleep')}
    return [A('saxo', 'happy_idle', *DOGR, yaw=0, at=2.125, speed=0, lift=TABLE_Y, tongue=not k.get('sleep'), burrito={'col': MINT, 'r': 0.36, 'back': 0.27, 'top': 0.95}, **k),
            A('kob', 'happy_idle', *CATR, yaw=0, at=2.125, speed=0, lift=TABLE_Y, burrito={'col': PINK, 'r': 0.33, 'back': 0.24, 'top': 0.95}, **{**k, 'sleep': True})]
def stack2(n, **o): return {'x': STK2[0], 'z': STK2[1], 'y': TABLE_Y, 'n': n, **o}
# S19 (k71.7..76.4; 'ordinary'): calm now, she has rolled the dog up in a mint towel on the folding table, her paws on the roll
s = [lie('saxo', -0.45, -0.02, 90, lift=TABLE_Y, tongue=True, burrito={'col': MINT, 'r': 0.29}), A('sadi', 'happy_idle', -0.3, -0.6, yaw=0, at=0.6, speed=0, arm='both', aim=[0.15, -0.5, 0.82], upAt=-1)]
add(71.7, 76.4, s, "'ordinary': calm now, Sadi has rolled the dog up in a mint towel on the folding table like a burrito, his head out, tongue out, her paws on the roll", V((0.9, 2.3, 2.4), (-0.5, 0.7, -0.25), fov=54), stack=[stack2(4), SPILL], rv=S(74.4, 71.7))
# S20 (k76.4..80; 'want ... down'): the cat rolled in a pink towel set down beside him on the table
s = ROLLS_T() + [A('sadi', 'happy_idle', *SFOLD, yaw=-15, at=0.6, speed=0, arm='both', aim=[0.12, -0.55, 0.8], upAt=-1)]
add(76.4, 80, s, "'want ... down': the cat, rolled in a pink towel, set down on the table beside the dog's mint roll", V((-1.1, 1.6, 3.2), (0.05, 1.3, 0.1), fov=56), stack=[stack2(4), SPILL], rv=S(78.8, 76.4))
# S21 (k80..82; the TikTok cut's last frame): the two rolls on the table, Sadi behind them at last, hearts
s = ROLLS_T() + [idle('sadi', *SFOLD, 0)]
add(80, 82, s, "the two rolled-up pets side by side on the folding table, Sadi behind them at last, hearts", V((0.25, 1.6, 4.0), (0.3, 1.3, 0.1), fov=58), hearts=[[SFOLD[0], 1.62, SFOLD[1], 0]], stack=[stack2(4), SPILL], rv=S(81.2, 80))
# S22 (k82..86): Compote checks the table: only laundry on it: she lowers NO PETS
s = [idle('compote', -1.0, 1.55, yaw_to((-1.0, 1.55), (-0.4, 3.9)), holdL='nopets', holdScale=0.85, arm='L', aim=[0.45, -0.8, 0.35])] + ROLLS_T()
add(82, 86, s, "Compote has checked the table: nothing but laundry on it: she lowers her NO PETS sign, deadpan, the rolls behind her", V((-0.6, 1.45, 3.9), (-0.8, 1.05, 0.6), fov=52), stack=[stack2(4), SPILL], rv=S(84, 82))
# S23 (k86..89.9): Sadi folds in peace beside the sleeping rolls, her stack growing
s = [folder(*SFOLD)] + ROLLS_T(sleep=True)
add(86, 89.9, s, "Sadi folds in peace at last beside the sleeping rolls, her stack growing", V((-0.3, 1.6, 3.8), (0.4, 1.3, 0.0), fov=58), stack=[stack2(10, grow=[0.0, 0.5, 4]), SPILL], rv=S(88.5, 86))
# S24 (k89.9..95.7; the hook line): the two rolls asleep on the table, halos, gold: angels up in the clouds
s = ROLLS_T(halo=True, sleep=True)
add(89.9, 95.7, s, "'angels up in the clouds': the two rolls asleep side by side on the folding table, halos over them, gold light, steam", V((-0.2, 1.65, 3.4), (-0.2, 1.4, 0.3), fov=56, p1=(-0.2, 1.62, 3.1)), heaven=[0, 0.6, 0.2, 0.6], steam=[[DOGR[0] - 0.3, TABLE_Y + 0.35, DOGR[1] - 0.45], [CATR[0] + 0.3, TABLE_Y + 0.3, CATR[1] - 0.45]], sparkle=[[-0.2, TABLE_Y + 0.2, 0.3, 0.8]], stack=[stack2(10), SPILL], rv=S(91.5, 89.9))

# ============================================ the build and the dead stop ============================================
# S25 (k95.7..100; 'ordinary'): she lays the last towel on top of the tall perfect stack, the rolls asleep beside it
s = [folder(*SFOLD)] + ROLLS_T(sleep=True)   # S23's framing, the stack towering now
add(95.7, 100, s, "'ordinary': her perfect stack is done, taller than she is, the last towel in her paws, the rolls asleep beside it", V((-0.3, 1.6, 3.8), (0.4, 1.35, 0.0), fov=58, p1=(-0.25, 1.6, 3.5)), stack=[stack2(13, grow=[0.0, 1.0, 10]), SPILL], rv=S(98.4, 95.7))
# S26 (k100..101.05; the dead stop): the dog bursts up out of his roll on the table and the perfect stack explodes: freeze, in silence
s = [A('saxo', 'jumping_in_place', STK2[0] - 0.5, STK2[1] + 0.15, yaw=-15, at=0.55, speed=0, lift=TABLE_Y + 0.4, air=True, noShadow=True, holdAt=0.12, tongue=True, burrito={'col': MINT, 'r': 0.36, 'back': 0.3, 'top': 0.15}, **PAWSUP),
     A('kob', 'happy_idle', *CATR, yaw=0, at=2.125, speed=0, lift=TABLE_Y, burrito={'col': PINK, 'r': 0.33, 'back': 0.24, 'top': 0.95}, sleep=True, holdAt=0.12), A('sadi', 'happy_idle', -0.5, -0.5, yaw=20, at=0.6, speed=0, arm='both', aim=[0.05, 0.42, 0.6], upAt=-1, holdAt=0.12)]   # behind the dog's empty spot: from SFOLD the leaping dog's legs hid her face
add(100, 101.05, s, "the drop that never comes: the dog bursts out of his towel and leaps into her perfect stack, which explodes round him: freeze, in silence", view((-0.2, 1.6, 3.8), (0.5, 1.2, 0.0), 62), still=True, stop=0.12, stack=[stack2(13, fall=-0.25, dir=20, spread=1.8, freeze=0.12), SPILL], cloud=[{'from': [3, 0], 'x': DOGR[0], 'z': DOGR[1], 's0': -0.25, 'n': 24, 'r': 0.5, 'h': 1.1}], rv=0.1)

shots.sort(key=lambda x: x['beat'])
ep = {
    'date': '2026-10-16', 'song': {'title': 'Ordinary', 'artist': 'Alex Warren'},
    'logline': "In a late-night laundromat Sadi folds her laundry while the pets who love her undo every load: the cat sleeps on each fresh stack, the dog steals her socks and dives into the warm laundry pouring out of the dryer like an angel in the clouds, until she folds them too.",
    'new': "src/maps51.js: laundromat (the clip's late-night laundromat: stacked dryers whose drums tumble and glow, front-loaders with swirling suds, the folding table, a wire cart, the attendant's counter, a NO PETS sign, the warm laundry pouring out of a dryer onto a heap, folded stacks that grow and topple, gold light, steam, rays and sparkles for the heavenly moments, and a dead stop that freezes the set); the actor fields `halo` (a gold ring over the head) and `burrito` (rolled up in a towel to the chin); the props `towel` (held up between both paws) and `nopets` (the attendant's paddle); the `fold` swing; three looks: Saxo's cream work jacket (the singer's), Sadi's laundry-day hoodie, Compote's attendant smock; the structure SISYPHUS again",
    'notes': "The world, from the official video (contact sheets): a teal-lit laundromat at night, a man in a cream work jacket waiting by the machines, the girl across them, their hands touching over the laundry, a drum's light as a portal, a golden-hour journey. The words, from whitelisted keywords per line: ordinary, want, down, angels, up, clouds, found, ground, touch, world, light, die. Cast: Saxo in the singer's cream work jacket (the dog who loves her laundry: socks, the warm heap, the zoomies), Sadi in a laundry-day hoodie (the folder), Kob at 0.6 scale (the cat who sleeps on the fresh laundry), Compote in an attendant's smock (NO PETS). The cut ends where the final chorus's drums would come in: the drop that never comes.",
    'tiktok_sound': '7467450862064879632',
    'with': ['sadi', 'kob', 'compote'],
    'clips': sorted({a['clip'] for s in shots for a in s['actors']}),
    'tags': {'structure': 'sisyphus', 'scenes': ['the cat on the fresh laundry', 'the sock thief', 'the warm laundry cloud', 'the zoomies', 'the cat in the warm cart', 'NO PETS', 'the innocent face', 'the hypnotising drum', 'face down in the laundry', 'the dog burrito', 'the purrito', 'the perfect stack', 'the exploding stack'],
             'cast': ['saxo', 'sadi', 'kob', 'compote'], 'hook': 'dance', 'maps': ['laundromat'], 'ref': 'none',
             'lyric_literal': "'down' (the cat set down on the floor), 'angels up in the clouds' (the dog in the warm laundry heap with a halo, three times), 'ordinary ordinary' (two folds), 'ground ground' (the stack to the ground), 'touch' (her paw finds the cat in the cart), 'light' (the drum's glow), 'die' (she flops face down), 'down' (the purrito set down in the cart)",
             'experiment': "Does a pet-owner universal everyone has lived through at home (the pets who wreck every load of laundry you fold: the cat on the fresh stack, the dog with the socks, the warm towels from the dryer), on a slow chart ballad with the biggest TikTok sound of the week (Alex Warren's Ordinary, 1.98M videos), hold the Short's views at 24 h against our last three upbeat episodes?"},
    'shots': shots,
}
json.dump(ep, open(os.path.join(HERE, '2026-10-16.json'), 'w'), indent=1, ensure_ascii=False)
os.makedirs(os.path.join(HERE, '..', 'out', 'check'), exist_ok=True)
open(os.path.join(HERE, '..', 'out', 'check', 'ord_rev_times.txt'), 'w').write(','.join(f'{t:.2f}' for t in REV))
print(len(shots), 'shots;', len(WARN), 'warnings')
for b, q in SOLVED.items(): print('   moved', b, q)
for w in WARN: print('  ', w)
