# The "Umbrella" episode (2026-10-15 2nd; Rihanna ft. JAY-Z, 2007): writes episodes/2026-10-15-2.json.
# Kit 2026-10-15-2: 72.4156 s, song beats 239-344 (the bridge from its pickup, the last chorus, the outro's first line),
# 86.9978 BPM, kit beat 0 = song beat 240 at 0.6897 s (kit t = (kit beat + 1) x 0.6897).
# The words, from whitelisted keywords per line (never the lines): the bridge 'arms' (k0.3), 'alarmed' (k6.5), 'come
# into' (k7.7), 'rain' and 'pour' (k19.3, 20.0), 'need ... more' (k21.1); the chorus 'sun shines ... shine' (k34.2),
# 'forever' (k39.6), 'friend' (k44.0), 'oath' (k45.3), 'raining' (k50.4), 'each other' (k55.6), the title line on
# k56.7 and k60.2 (the word 'umbrella' on k59.3 and k63.4), its echo on k64.2-69.6, 'umbrella' again on k71.3, k79.4 and
# k87.5, each followed by its echo, the last one long (k88.6-95.2); the outro 'raining' (k100.4, 101.3).
# The world (the official video, contact sheets): dancers in black hoodies and sunglasses in a line under a sparkling rain
# on a black stage, the singer's cabaret routine with a furled umbrella in a room of white wainscot panels washed orange,
# a white dress dancing in slow-motion splashes, the finale in a downpour, the umbrella held up. Ours (src/maps50.js
# parlour): that orange panelled room as a salon on a party night, the dog's act at the back with four hooded dancers,
# gold chairs, a haze machine, a fire bell, sprinkler pipes across the ceiling.
# The story (structure SHELTER, new: the pet universal of the wet dog who shakes himself dry right next to you; the
# generous one gives his shelter away one guest per line until there's no room left for him, and his nature evens the
# score):
#   0 (the bridge, k-1-20): the diva dog in the singer's bob and corset does the umbrella routine for the salon, the
#     furled umbrella held up like a baton; Compote cranks the haze machine to the top, the fire bell rings on
#     'alarmed', the dog carries on regardless ('come into me'), Kob deadpan in the front row; on 'pour' the
#     sprinklers burst and he snaps his umbrella open: the only dry one in the room.
#   1 (the chorus's first half, k20-57): he struts and dances dry under it while everyone is drenched: Kob, the cat who
#     hates water, soaked in her chair; Sadi's white dress; Compote at the drowned haze machine; his paw raised for
#     'oath'; 'raining more than ever': a wide of the flooded salon; the soaked three huddle and glare at him.
#   2 (the title line, k57-86): he finally offers: Sadi steps under, Compote barges in, Kob shoves in and the dog is out
#     in the rain, holding his umbrella over the three dry ones at arm's length, plastered.
#   3 (the payoff, k86-98): he squeezes back in among them and shakes himself dry on the long echo: everyone soaked.
#   4 (the button, k98-104): the sprinklers stop; under the umbrella it's raining: the three dripping, Kob's dead stare,
#     the dog fluffy and happy.
import json, math, os, re, sys
sys.path.insert(0, os.path.dirname(__file__))
from cam import view, vpath

HERE = os.path.dirname(__file__)
PER, B0T = 60 / 86.9978, 60 / 86.9978           # kit beat 0 at 0.6897 s
def T(b): return B0T + b * PER                  # kit seconds of kit beat b
def S(b, b0): return round((b - b0) * PER, 3)   # seconds from shot beat b0 to beat b

# the map (src/maps50.js PARLOUR)
STAGE = (0.0, -1.4)
KOB_SEAT, SADI_SEAT, SEAT_Y = (0.0, 2.4), (-1.3, 2.4), 0.45
HAZE = (-4.9, -1.8)
ALARM = (3.4, 2.9, -5.94)
LOOK = {'saxo': 'corset', 'sadi': 'whitedress', 'kob': 'kob', 'compote': 'compote'}
HEAD = {'saxo': 1.55, 'sadi': 1.45, 'kob': 1.5, 'compote': 1.5}
FACE = {'saxo': 0.9, 'sadi': 0.84, 'kob': 0.86, 'compote': 0.86}
RAD = {'saxo': 0.48, 'sadi': 0.45, 'kob': 0.42, 'compote': 0.42}
CHARL = 2.467
def kick_at(rv): return round((1.6 - rv) % CHARL, 3)   # charleston's kick (clip 1.6 s) on the review frame, rv s into the shot

# the karaoke's word times (kit beats; numbers only, never a word)
_src = open(os.path.join(HERE, '2026-10-15-2.lyrics.js')).read()
_rows = json.loads(re.search(r'window\.LYRICS = (.*?);\n', _src).group(1)); _ends = json.loads(re.search(r'window\.LINE_END = (.*?);\n', _src).group(1))
def Bt(t): return (t - B0T) / PER
def W(line, word): return round(Bt(_rows[line][word][0]), 2)
LINES = [(Bt(row[0][0] - 0.35), Bt(e)) for row, e in zip(_rows, _ends)]
def has_line(b0, b1): return any(a < b1 and b > b0 for a, b in LINES)

def A(who, clip, x, z, **o):
    return {'who': who, 'look': o.pop('look', LOOK[who]), 'clip': clip, 'x': round(x, 3), 'z': round(z, 3), 'face': o.pop('face', 'world'),
            'yaw': round(o.pop('yaw', 0), 1), 'at': o.pop('at', 0.4), 'speed': o.pop('speed', 1), **o}
def yaw_to(frm, to): return round(math.degrees(math.atan2(to[0] - frm[0], to[1] - frm[1])), 1)
def idle(who, x, z, yaw, **o): return A(who, 'happy_idle', x, z, yaw=yaw, at=o.pop('at', 2.125), speed=o.pop('speed', 0), **o)
def dancer(who, x, z, yaw, rv, clip='charleston', **o):
    if clip == 'charleston': o.setdefault('at', kick_at(rv)); o.setdefault('speed', 1)
    return A(who, clip, x, z, yaw=yaw, **o)
def seated(who, x, z, yaw, **o): return A(who, 'sitting_talking', x, z, yaw=yaw, at=0.05, speed=0, lift=SEAT_Y, **o)
def brolly(x, z, h=2.35, level=0.55, **o): return {'at': [round(x, 3), round(h, 3), round(z, 3)], 'level': level, **o}
def dry(b, scale=1.0): x, h, z = b['at']; return [x, z, round(1.2 * scale * 0.97, 2), round(h - 0.25, 2)]
OPEN = dict(hold='umbrella', arm='R', aim=[0.25, 0.55, 0.3], upAt=-1)           # the open umbrella in his right paw, up beside his head
BATON = dict(hold='umbrellashut', umbrellaTo='up')                               # the furled one held up like a baton

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
    if a.get('lean', 0) > 8: d = 0.9 * math.sin(math.radians(a['lean'])); yw = math.radians(a.get('yaw', 0)); x, z = x + math.sin(yw) * d, z + math.cos(yw) * d
    return (who, x, z, fy + lift, hy + lift)
def occluded(cam, look, fov, actors, end, W_, beat):   # a face inside a nearer head's disc
    pts = []
    for a in actors:
        if a.get('fg') or a['x'] < -20: continue
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
    if not (-6.8 < x < 6.8 and -5.8 < z < 8.8 and 0.1 < y < 5.5): return False
    if zone == 'open': return True                                # the chairs and guests hidden for the shot
    if z > 1.95 and y < 2.2: return False                       # behind the front row only from above the heads (their backs filled the frame)
    for rz in (2.4, 3.6):                                          # not among the chairs and the guests
        if abs(z - rz) < 0.45 and abs(x) < 3.1 and y < 1.75: return False
    if abs(x - HAZE[0]) < 0.5 and abs(z - HAZE[1]) < 0.4 and y < 0.6: return False
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
    shots.append({'beat': beat, 'kind': 'dance', 'map': 'parlour', 'actors': actors, 'lyric': lyric, 'cam': c, 'focus': focus, **o})

# ============================================ the bridge: the act, the alarm, the burst ============================================
# Fix loop 1 (2026-10-15 00:40; the reviewer passed 3 of 23): rain bars across faces and inside the umbrella's column
# (the streaks between the lens and a face are cleared now: `rainClear` corridors), the umbrella's paw hidden behind the
# head (held out at the side now, the canopy over that side), dancers cut by the frame (shown only in the wides), a shot
# from behind the audience for 'come into me', the machine in frame for Compote, the pledge as a paw on the heart, the
# group shots wide enough for all four (the chairs hidden), the shake as a flat ring of spray from the chest.
def canopy(x, z, yaw=0.0, h=2.25, out=0.42, back=0.1, level=0.6, **o):   # the canopy's centre over the right paw's side (a character facing yaw)
    a = math.radians(yaw); rx, rz = -math.cos(a), math.sin(a); fx, fz = math.sin(a), math.cos(a)
    return {'at': [round(x + rx * out - fx * back, 3), round(h, 3), round(z + rz * out - fz * back, 3)], 'level': level, **o}
HOLD = dict(hold='umbrella', arm='R', aim=[0.62, 0.3, 0.3], upAt=-1)          # the paw out at his side, where the lens sees it on the shaft
FREE = dict(armB='L', aimB=[0.55, -0.3, 0.32])                                  # the free paw out and down (the charleston swung it across his muzzle: a black smear)
PARTY = dict(dancers='dance', guests='watch')
def corridor(v, pts, r=0.3, ball=1.6):   # no rain at the lens, nor along its line of sight to each face (x, z)
    out = []
    for k in (0, -1):
        L = lens(v, k); out.append([round(L[0], 2), round(L[2], 2), ball])
        for (x, z) in pts: out.append([round(L[0], 2), round(L[2], 2), round(x, 2), round(z, 2), r])
    return out
def faces(actors): return [(a['x'] + a.get('mx', 0) * e, a['z'] + a.get('mz', 0) * e) for a in actors if a['x'] > -20 for e in (0, 1)]
RAIN = dict(zone='rain', rain=1, wet=0.9, dancers=False, guests='soaked')
def rain_add(beat, b1, actors, lyric, spec, **o):   # a rain shot: its lens fitted first, then the streaks cleared along its sight lines
    zone = 'open' if 'chairs' in o.get('hide', []) else 'room'
    v = fit(spec, beat, b1, actors, zone) if spec[0] == 'V' else spec
    rc = corridor(v, faces(actors) + o.pop('also', []), r=o.pop('cr', 0.3)) + o.pop('clearX', [])   # clearX: more [x0, z0, x1, z1, r] strips
    add(beat, b1, actors, lyric, v, rainClear=rc, zone_lens=zone, **{**RAIN, **o})

# S00 (k-1..4; 'arms'): the hook, the watcher's shot: over Kob's ears in the front row, the diva dog does his umbrella
# routine with it open indoors, his two hooded dancers behind him, the fog at the ankles
P0 = canopy(*STAGE, 0, h=2.05, out=0.45, level=0.25, spin=1.3)
PL = canopy(*STAGE, 0, h=2.05, out=-0.45, level=0.25, spin=1.3)
HOLDL = dict(holdL='umbrella', armB='L', aimB=[0.62, 0.3, 0.3], arm='R', aim=[0.55, -0.3, 0.32], upAt=-1)   # the umbrella in his left paw (nearest a lens on his left), the right paw free
s = [dancer('saxo', *STAGE, 0, S(1.6, -1), umbrellaTo=PL, **HOLDL, holdScale=0.85), seated('kob', *KOB_SEAT, 180, fg=True), seated('sadi', *SADI_SEAT, 180, fg=True)]
v = view((0.3, 1.25, 1.85), (0.0, 1.05, -1.75), 54, p1=(0.25, 1.2, 1.45), ease='lin')
add(-1, 6.4, s, "the hook: in a fancy panelled salon the diva dog in the singer's bob and corset does his routine with his umbrella open indoors, the fog at the ankles, a slow push in", v, haze=0.45, clear=[[-2.5, -3.4, 0.4], [2.5, -3.4, 0.4], [0.95, -3.65, 0.4], [-0.95, -3.65, 0.4]], rv=S(1.6, -1), **PARTY)
# S01 (k4..6.4): Compote behind the haze machine leans on it: the fog pours out at the lens
CPM = (-5.3, -2.2)
s = [idle('compote', *CPM, yaw_to(CPM, (-3.45, -0.25)), arm='both', aim=[0.18, -0.38, 0.72], upAt=-1)]
v = view((-3.4, 1.12, -0.2), (-5.05, 1.06, -2.05), 46)
add(4, 6.4, s, "Compote behind the haze machine, both paws on it, glaring: a jet of fog pouring out of it across the floor", v, haze=[0, 1.6, 0.55, 1.0], hazeJet=[-3.4, -0.2], rv=S(5.2, 4), drop=True, **PARTY)
# S02 (k6.4..7.6; 'alarmed'): the fire bell rings, the strobe flashes the room red
v = view((2.5, 2.55, -3.45), (3.4, 2.85, -5.94), 44)
add(6.4, 7.6, [PARK], "'alarmed': the fire bell rings on the wall, its strobe flashing red", v, alarm=True, haze=1, rv=S(7.0, 6.4), **PARTY)
# S03 (k7.6..12; 'come into me'), fallback after three failed loops (the audience shot): S08's passed setup mirrored, dry,
# the diva dancing on under his parasol in the red strobe, a low dolly-in from his left, the umbrella in the paw on that side
s = [dancer('saxo', *STAGE, 0, S(9.15, 7.6), umbrellaTo=PL, **HOLDL, holdScale=0.85)]
v = V((0.6, 0.5, 1.75), (0.0, 1.05, -1.4), fov=56, p1=(0.5, 0.48, 1.2), roll=[-7, -10])
add(7.6, 12, s, "'come into me': unbothered by the alarm, the diva dances on under his parasol in the red strobe, the fog at his feet: a low dolly-in", v, alarm=True, strobeAt=[0.4, 1.8, 0.6], haze=1, hide=['sconces'], clear=[[-2.5, -3.4, 0.4], [2.5, -3.4, 0.4], [0.95, -3.65, 0.4], [-0.95, -3.65, 0.4]], rv=S(9.15, 7.6), **PARTY)
# S04 (k12..16.197): Kob deadpan in the front row, her milk up, the strobe red on her
KOBV = V((0.12, 1.22, 0.55), (0.0, 1.2, 2.4), fov=42)
s = [seated('kob', *KOB_SEAT, 180)]
add(12, 16.197, s, "Kob deadpan in the front row, unimpressed by the alarm, the strobe flashing red on her", KOBV, alarm=True, strobeAt=[0.15, 1.6, 1.5], haze=1, rv=S(14.07, 12), **PARTY)
# S05 (k16.197..20; the TikTok's first frame; 'rain'): the first drops: the dog dances on under his parasol
s = [dancer('saxo', *STAGE, 0, S(18.5, 16.197), umbrellaTo=P0, **HOLD, holdScale=0.85, **FREE)]
v = fit(V((0.35, 1.05, 1.95), (0.0, 1.0, -1.4), fov=56), 16.197, 20, s, 'room')
add(16.197, 20, s, "'rain': the first drops fall from the sprinklers, the dog dancing on under his parasol, the strobe red, the fog", v, alarm=True, haze=1, rain=[0, S(20, 16.197), 0.0, 0.35], rainClear=corridor(v, faces(s)), dancers=False, guests='watch', rv=S(19.5, 16.197))
# S06 (k20..24; 'pour'): the burst: every sprinkler at once; the umbrella up over his head: dry in the middle of the downpour
B6 = canopy(*STAGE, 0, h=2.3, out=0.3)
s = [dancer('saxo', *STAGE, 0, S(21.5, 20), umbrellaTo=B6, **HOLD, holdScale=0.9, **FREE)]
rain_add(20, 24, s, "'pour': the sprinklers burst over the whole salon and the dog's umbrella goes up over his head: dry in the middle of the downpour", V((2.65, 1.0, 1.9), (0.0, 1.05, -1.1), fov=58), dry=[dry(B6, 0.9)], wet=[0, 3, 0.1, 0.6], alarm=True, dancers='soaked', clear=[[-2.5, -3.4, 0.4], [2.5, -3.4, 0.4]], rv=S(21.5, 20))
# S07 (k24..27.5; 'more'): Kob soaked in her chair, deadpan: the cat who hates water
s = [seated('kob', *KOB_SEAT, 180)]
rain_add(24, 27.5, s, "Kob soaked in her chair, the rain pouring on her, the same deadpan: the cat who hates water", KOBV, wet=0.7, drips=[[KOB_SEAT[0], KOB_SEAT[1] - 0.1, 1.2, 1]], rv=S(25.5, 24))
# S08 (k27.5..31.2): the dog dances dry under his umbrella: a low dolly-in
B8 = canopy(*STAGE, 0, h=2.3, out=0.3)
s = [dancer('saxo', *STAGE, 0, S(29.6, 27.5), umbrellaTo=B8, **HOLD, holdScale=0.9, **FREE)]
rain_add(27.5, 31.2, s, "the dog dances dry under his umbrella, the rain all round him: a low dolly-in", V((-0.55, 0.5, 1.75), (0.0, 1.05, -1.4), fov=56, p1=(-0.45, 0.48, 1.2), roll=[7, 10]), dry=[dry(B8, 0.9)], wet=0.8, dancers='soaked', clear=[[-2.5, -3.4, 0.4], [2.5, -3.4, 0.4], [-0.95, -3.65, 0.4]], rv=S(29.6, 27.5))

# ============================================ the chorus: the only dry one ============================================
# S09 (k31.2..36.6; 'sun shines ... shine'): the dry diva dances under his twirling umbrella, chin up
B9 = canopy(*STAGE, 0, h=2.3, out=0.3, spin=1.4)
s = [dancer('saxo', *STAGE, 0, S(34.2, 31.2), umbrellaTo=B9, **HOLD, holdScale=0.9, **FREE)]
rain_add(31.2, 36.6, s, "'sun shines ... shine': the dry diva dances under his twirling umbrella, chin up, the downpour all round", V((0.0, 0.62, 1.9), (0.0, 1.0, -1.4), fov=60), dry=[dry(B9, 0.9)], dancers='soaked', clear=[[-2.5, -3.4, 0.4], [2.5, -3.4, 0.4]], rv=S(34.2, 31.2))
# S10 (k36.6..40.6; 'forever'): Sadi soaked in her white dress in the front row
s = [seated('sadi', *SADI_SEAT, 180)]
rain_add(36.6, 40.6, s, "'forever': Sadi soaked in her white dress in the front row, staring at him", V((-1.25, 1.12, 0.05), (-1.3, 1.2, 2.4), fov=40), drips=[[SADI_SEAT[0], SADI_SEAT[1] - 0.1, 1.2, 1]], rv=S(38.6, 36.6))
# S11 (k40.6..44.5; 'friend'): Compote soaked behind the drowned haze machine, glaring (S01's lens)
s = [idle('compote', *CPM, yaw_to(CPM, (-3.45, -0.25)))]
rain_add(40.6, 44.5, s, "'friend': Compote soaked behind the drowned haze machine, glaring: the same frame as before the rain", view((-3.4, 1.12, -0.2), (-5.05, 1.06, -2.05), 46), drips=[[CPM[0], CPM[1], 0.95, 1]], rv=S(42.5, 40.6))
# S12 (k44.5..48.9; 'oath'): under his umbrella he lays his free paw on his heart: a solemn pledge
B12 = canopy(*STAGE, 0, h=2.3, out=0.3)
s = [idle('saxo', *STAGE, -15, umbrellaTo=canopy(*STAGE, -15, h=2.3, out=0.3), **HOLD, holdScale=0.9, armB='L', aimB=[0.18, 0.38, 0.62])]
rain_add(44.5, 48.9, s, "'oath': dry under his umbrella, he lays his free paw on his chest under his chin: a solemn pledge", V((0.85, 1.05, 1.35), (0.0, 1.05, -1.4), fov=50), dry=[dry(canopy(*STAGE, -15, h=2.3, out=0.3), 0.9)], rv=S(46.0, 44.5))
# S13 (k48.9..52.8; 'raining'), fallback after three failed loops (the high wides): S06's passed wide again, the
# downpour heavier and the floor flooded, his drenched hooded dancers behind him, him dry in the middle
B13 = canopy(*STAGE, 0, h=2.3, out=0.3)
s = [dancer('saxo', *STAGE, 0, S(50.5, 48.9), umbrellaTo=B13, **HOLD, holdScale=0.9, **FREE)]
rain_add(48.9, 52.8, s, "'raining': more than ever: the downpour heavier, the floor flooded, his hooded dancers drenched behind him, him dry in the middle", V((2.65, 1.0, 1.9), (0.0, 1.05, -1.1), fov=58), dry=[dry(B13, 0.9)], wet=1, dancers='soaked', clear=[[-2.5, -3.4, 0.4], [2.5, -3.4, 0.4]], rv=S(50.5, 48.9))
# S14 (k52.8..56.7; 'each other'): the soaked three huddle together, shivering, glaring at him
H = [(-2.08, -0.62), (-1.42, -0.6), (-0.76, -0.62)]
s = [idle('sadi', *H[0], 25, sway=2, swayEvery=0.125), idle('kob', *H[1], 0, sway=2, swayEvery=0.125), idle('compote', *H[2], -25, sway=2, swayEvery=0.125)]
rain_add(52.8, 56.7, s, "'each other': the soaked three huddle together, shivering, glaring at the dry one", V((-1.42, 1.15, 2.6), (-1.42, 1.0, -0.6), fov=58), hide=['chairs'], drips=[[H[0][0], H[0][1], 0.95, 1], [H[1][0], H[1][1], 0.95, 1], [H[2][0], H[2][1], 0.95, 1]], rv=S(54.8, 52.8))

# ============================================ the title line: one more under it each time ============================================
# S15 (k56.7..60.15; 'umbrella' k59.3): he offers: Sadi steps under beside him
D15, S15P = (0.4, -1.95), (-0.42, -1.85)
B15 = {'at': [0.0, 2.4, -1.9], 'level': 0.6}
s = [idle('saxo', *D15, -10, umbrellaTo=B15, **HOLD), idle('sadi', *S15P, 12)]
rain_add(56.7, 60.15, s, "'stand under my umbrella': he holds it out and Sadi steps under beside him: two dry", V((0.0, 1.05, 1.5), (0.0, 1.0, -1.9), fov=54), dry=[dry(B15)], drips=[[S15P[0], S15P[1], 0.95]], rv=S(59.3, 56.7))
# S16 (k60.15..64.2; 'umbrella' k63.4): Compote barges in: three under, the dog squeezed to the edge
D16, S16P, C16 = (0.95, -2.05), (-0.85, -2.0), (0.1, -1.6)
B16 = {'at': [0.05, 2.45, -1.9], 'level': 0.6}
s = [idle('saxo', *D16, -15, umbrellaTo=B16, **HOLD, holdScale=1.2), idle('sadi', *S16P, 15), idle('compote', *C16, 0)]
rain_add(60.15, 64.2, s, "the title again: Compote barges in under it too: three under, the dog squeezed to the edge", V((0.1, 1.15, 2.3), (0.05, 1.0, -1.85), fov=60), hide=['chairs'], dry=[dry(B16, 1.2)], drips=[[C16[0], C16[1], 0.95]], rv=S(63.4, 60.15))
# S17 (k64.2..70.07; the echo): Kob shoves in from his side, paws on him, and he's pushed out into the rain, tilting away
S17P, C17, K17, D17 = (-0.85, -2.0), (0.0, -1.6), (0.82, -1.9), (1.62, -1.85)
K17S = (1.02, -2.36)
B17 = {'at': [0.05, 2.5, -1.9], 'level': 0.6}
HOLDOUT = dict(umbrellaTo=B17, hold='umbrella', arm='R', aim=[0.7, 0.45, 0.15], upAt=-1, holdScale=1.2)
s = [idle('saxo', *D17, -10, **HOLDOUT, mx=0.15, mz=0.3, moveAt=0.15, lean=16, hop=[0.06, 1], air=True),
     idle('sadi', *S17P, 15, fg=True), idle('compote', *C17, 0, fg=True), A('kob', 'happy_idle', *K17S, yaw=48, at=2.125, speed=0, arm='both', aim=[0.12, 0.05, 1.0], upAt=-1, mx=0.15, mz=0.3, moveAt=0.15)]
rain_add(64.2, 70.07, s, "the echo: Kob shoves him from behind, both paws on his back, and the dog stumbles out into the rain towards us, still holding the umbrella over them", V((1.45, 2.55, 0.95), (1.5, 0.95, -2.0), fov=56), hide=['chairs'], dry=[dry(B17, 1.2)], drips=[[D17[0] + 0.3, D17[1], 0.95, 1]], rv=S(64.9, 64.2))
# S18 (k70.07..78.07; 'umbrella' k71.3 + its echo): the three dry and smug; the dog out in the downpour, holding it at arm's length
D18 = (1.92, -1.85)
OUT18 = [idle('saxo', *D18, -30, **HOLDOUT), idle('sadi', *S17P, 15), idle('compote', *C17, 0), idle('kob', *K17, -10)]
rain_add(70.07, 78.07, OUT18, "the three dry and smug under it; the dog out in the downpour holding it over them at arm's length, plastered", V((0.5, 1.3, 4.0), (0.5, 1.0, -1.85), fov=60), hide=['chairs'], dry=[dry(B17, 1.2)], drips=[[D18[0], D18[1], 0.95, 1]], rv=S(72.0, 70.07))
# S19 (k78.07..85.93; 'umbrella' k79.4 + its echo): over the wet dog's shoulder: him dripping on the right, the three dry under his own umbrella
OUT19 = [idle('saxo', *D18, -25, **HOLDOUT), idle('sadi', *S17P, 25, fg=True), idle('compote', *C17, 20, fg=True), idle('kob', *K17, -10)]
rain_add(78.07, 85.93, OUT19, "the wet dog close: dripping, deadpan, his arm out holding his own umbrella over Kob, dry and smug just behind him", V((2.0, 1.2, 0.9), (1.37, 1.1, -1.88), fov=60), dry=[dry(B17, 1.2)], drips=[[D18[0], D18[1], 0.95, 1]], also=[D18], rv=S(81.0, 78.07))

# ============================================ the payoff: the shake ============================================
ROW = {'compote': (-1.32, -1.95), 'sadi': (-0.56, -2.0), 'saxo': (0.35, -2.05), 'kob': (1.04, -2.0)}   # Sadi 0.91 m from him: his umbrella paw sits in the gap, the pole clear of her bow
B20 = {'at': [0.1, 2.45, -1.95], 'level': 0.7}
WIDE4 = V((-0.14, 1.3, 3.2), (-0.14, 1.0, -1.9), fov=60)   # centred on the spaced row
# S20 (k85.93..90.9; 'umbrella' k87.5, the echo), fallback after three failed loops (the walk-in read as an umbrella hat):
# S22's passed framing: he's back in among them, the wet dog in the middle dripping onto the floor, the three dry
s = [idle('saxo', *ROW['saxo'], 0, umbrellaTo=B20, **HOLD, holdScale=1.25),
     idle('sadi', *ROW['sadi'], 10), idle('compote', *ROW['compote'], 5), idle('kob', *ROW['kob'], -12)]
rain_add(85.93, 90.9, s, "the echo: back in among them, the wet dog in the middle of the three dry ones under his umbrella, dripping on the floor between them", WIDE4, hide=['chairs'], dry=[dry(B20, 1.25)], cr=0.5, clearX=[[0.1, -2.3, 0.1, -6.0, 1.9]], drips=[[ROW['saxo'][0], ROW['saxo'][1] - 0.35, 0.95, 1, 1.5]], rv=S(89.5, 85.93))
# S21 (k90.9..97.6; the long echo): THE SHAKE: he shakes himself dry in the middle of them, a ring of spray; they turn their faces away
s = [idle('saxo', *ROW['saxo'], 0, umbrellaTo=B20, **HOLD, holdScale=1.25, twist=[42, 4.3, 0.15, S(97.3, 90.9)], sway=16, swayEvery=0.25),
     idle('sadi', *ROW['sadi'], -60, sway=16, swayEvery=1000), idle('kob', *ROW['kob'], 60, sway=-16, swayEvery=1000)]
rain_add(90.9, 97.6, s, "the long echo: THE SHAKE, close and front-on: the wet dog shakes himself dry between Sadi and Kob, a big ring of spray flying into their faces and at the lens, the two leaning away", V((0.25, 2.2, 1.35), (0.25, 0.9, -2.05), fov=66), hide=['chairs'], dry=[dry(B20, 1.25)], shake=[ROW['saxo'][0], 0.85, ROW['saxo'][1], 0.15, S(97.3, 90.9)], rv=S(93.5, 90.9))

# ============================================ the button ============================================
# S22 (k97.6..104; 'raining'): the sprinklers stop; under the umbrella it's raining: the three dripping, Kob's dead stare, the dog happy
s = [idle('saxo', *ROW['saxo'], 0, umbrellaTo=B20, **HOLD, holdScale=1.25, tongue=True, hop=[0.03, 1]),
     idle('sadi', *ROW['sadi'], 10), idle('compote', *ROW['compote'], 5), idle('kob', *ROW['kob'], -12)]
v = fit(WIDE4, 97.6, 104, s, 'open')
add(97.6, 104, s, "'raining': the sprinklers stop, and under the umbrella it's raining: the three dripping, Kob's dead stare, the dog dry and happy, tongue out", v,
    zone='rain', rain=0, wet=1, dancers=False, guests='soaked', dry=[dry(B20, 1.25)], hide=['chairs'], zone_lens='open',
    drips=[[ROW['sadi'][0] - 0.1, ROW['sadi'][1], 1.7, 1, 1.8, 0.75], [ROW['compote'][0] + 0.27, ROW['compote'][1], 1.7, 1, 1.8, 0.75], [ROW['kob'][0] + 0.2, ROW['kob'][1], 1.7, 1, 1.8, 0.75]], rv=S(100.4, 97.6))   # from under the rim (1.82 m), the rings off his side: he stays dry

shots.sort(key=lambda x: x['beat'])
ep = {
    'date': '2026-10-15', 'song': {'title': 'Umbrella', 'artist': 'Rihanna ft. JAY-Z'},
    'logline': "At a salon party the diva dog does Rihanna's umbrella routine until the haze sets off the sprinklers: the only one with an umbrella, he gives it up one guest per 'ella', until the cat shoves him out into the rain, so he squeezes back in among them and shakes himself dry.",
    'new': "src/maps50.js: parlour (the clip's white wainscot room washed orange as a salon on a party night: gold sconces, a crystal chandelier, a pale marble floor, gold party chairs with box-pet guests, four box-pet backup dancers in black hoodies and sunglasses, a haze machine and its fog, a fire bell with a red strobe, sprinkler pipes across the ceiling and the indoor downpour with dry circles under umbrellas, run-off from the rim, splashes, puddles, drips, a wet dog's shake); the props `umbrella` (open: its shaft from the paw to `umbrellaTo`, the canopy levelled by `level`, spun by `spin`) and `umbrellashut` (furled, a cane or a baton held up); the actor field `twist` (a fast turn side to side: the shake); two looks: Saxo's corset, Sadi's whitedress; the structure SHELTER",
    'notes': "The world, from the official video (contact sheets): dancers in black hoodies and sunglasses in a line under a sparkling rain on a black stage, the singer's cabaret routine with a furled umbrella in a room of white wainscot panels washed orange, a white dress dancing in slow-motion splashes, the finale in a downpour with the umbrella held up. The words, from whitelisted keywords per line: arms, alarmed, come into, rain, pour, need, more; sun, shine, forever, friend, oath, raining, each other, the title line and its echo, raining. Cast: Saxo in the singer's cabaret look (the diva with the only umbrella), Sadi in the clip's white dress (the first he shelters), Kob in her own tweed with her milk (the cat who hates water, deadpan in the front row, then the one who shoves him out), Compote in her own hoodie with headphones (the stagehand whose haze machine sets off the sprinklers). Kob won't touch water (the running thread) until the dog's shake.",
    'tiktok_sound': '6921472986260178945',
    'with': ['sadi', 'kob', 'compote'],
    'clips': sorted({a['clip'] for s in shots for a in s['actors']}),
    'tags': {'structure': 'shelter', 'scenes': ['the umbrella routine', 'the haze machine', 'the fire bell', 'the sprinklers burst', 'the umbrella snapped open', 'the diva strut', 'the soaked cat deadpan', 'the oath', 'the flooded salon', 'the huddle', 'one more under the umbrella', 'shoved out into the rain', 'the wet dog shake', 'raining under the umbrella'],
             'cast': ['saxo', 'sadi', 'kob', 'compote'], 'hook': 'dance', 'maps': ['parlour'], 'ref': 'dog-wig',
             'lyric_literal': "'alarmed' (the fire bell), 'come into me' (he beckons), 'let the rain pour' (the sprinklers burst on the word), 'sun shines' (the dry diva struts), 'oath' (a paw raised), 'raining more than ever' (the flooded salon), 'each other' (the soaked huddle), 'stand under my umbrella' (one more under it on each line), the echo (the shove, the shake), 'raining' (under the umbrella)",
             'experiment': "Does a pet universal with a physical payoff (the wet dog who shakes himself dry next to you), on a throwback that's climbing again (Umbrella, in a Rihanna wave) with its hook as the gag's counter (one more under the umbrella per line), hold the Short's views at 24 h against our last three throwbacks?"},
    'shots': shots,
}
json.dump(ep, open(os.path.join(HERE, '2026-10-15-2.json'), 'w'), indent=1, ensure_ascii=False)
os.makedirs(os.path.join(HERE, '..', 'out', 'check'), exist_ok=True)
open(os.path.join(HERE, '..', 'out', 'check', 'umb_rev_times.txt'), 'w').write(','.join(f'{t:.2f}' for t in REV))
print(len(shots), 'shots;', len(WARN), 'warnings')
for b, q in SOLVED.items(): print('   moved', b, q)
for w in WARN: print('  ', w)
