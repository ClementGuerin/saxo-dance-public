# The "Don't Stop The Music" episode (2026-10-11 2nd; Rihanna, 2007): writes episodes/2026-10-11-2.json.
# Kit 2026-10-11-2: 71.393 s = 146 beats at 122.7011 BPM: chorus 2's title line, the chant and its breakdown, the whole
# last chorus to where the song's beat drops out, with the DJ's two stops built in (a turntable brake and a silent bar
# at kit beats 7.5-12 and 59.5-64) and the same brake into a 2-beat silent button (kit beats 143.5-146).
# The world (the official video, contact sheets every 3 s): a yellow taxi on a rainy night street, a corner candy shop
# whose back door opens on a hidden club: teal walls with black damask, magenta light, a purple stage with big round gold
# lights, a crowd dancing, the singer in a black strapless dress with gold cuffs. The words (whitelisted keywords per
# line, never the text): the title line ('please', 'stop', 'music'), the chant, and the chorus's 'take away', 'escape',
# 'DJ', 'play', 'refuse', 'keep'.
# The story (structure MUSICAL CHAIRS, new: the party game everyone has played, the cast true to character inside it):
# musical chairs at the secret club behind the candy shop. Kob the DJ stops the music; the dog never notices.
#   1 (the title line, b0-8, then the first stop): Saxo in the singer's look dances his way round the ring of gold
#     chairs with Sadi, Compote and six party pets; Kob deadpan at the decks, her paw over the big red STOP button.
#     The record brakes: everyone dives into a chair. The dog dances on alone in the silence, every face on him; he
#     notices, there's no chair... and flops belly up across Sadi's lap (hearts: a lap dog).
#   2 (the chant, b12-44): the music's back. Compote, furious (no one is out), kicks a chair out of the ring. Round
#     two: the conga round the chairs, the dog leading; twice on the chant's 'please don't stop the music' Kob lifts
#     her paw over the button and doesn't press: the first time the whole ring dives and hovers, half sitting, for
#     nothing (the cat toying with them); the second time only the dog dives proudly into a chair, and the whole
#     ring stares at him.
#   3 (the breakdown, b44-76): Compote kicks out another chair; the circle tiptoes round, eyes on the DJ, the dog still
#     dancing; the second stop: everyone sits, the dog dances alone in the silence again, then flops across Compote's
#     lap: her fury (the dog-breath puffs were cut: they never read). Her uppercut sends him flying out through the
#     secret door into the candy shop, into the sweets.
#   4 (the last chorus, b76-110): the drop: the final round: on 'take away' Compote's kick clears every chair but one,
#     the party pets flee; Sadi and Compote circle the last chair face to face. The dog, out of the game, crawls back
#     in behind the decks. On the title line Kob's paw comes down... and the dog lands belly up across her lap,
#     pinning her paws: the music doesn't stop.
#   5 (the chorus again, b110-146): the music never stops: the two circle and circle; the party pets pour back in and
#     dance; Sadi gives up and dances; Compote refuses to dance and stands by the last chair, furious. On the title line the
#     dog begs the DJ on every 'please'... and Kob's free paw finds the button: the record brakes, everyone freezes
#     mid-dance, and Compote, the only one who moves, drops into the last chair: she wins musical chairs. One silent beat.
import json, math, os, re, sys
sys.path.insert(0, os.path.dirname(__file__))
from cam import view, deadpan

HERE = os.path.dirname(__file__)
PER = 60 / 122.7011
def Bt(t): return t / PER
def S(b, b0): return round((b - b0) * PER, 3)    # seconds from shot beat b0 to beat b
rad = math.radians

LOOK = {'saxo': 'bandeau', 'sadi': 'glam', 'kob': 'kob', 'compote': 'punk'}
HEAD = {'saxo': 1.46, 'sadi': 1.38, 'kob': 1.47, 'compote': 1.5}
FACE = {'saxo': 0.9, 'sadi': 0.84, 'kob': 0.86, 'compote': 0.86}
RAD = {'saxo': 0.5, 'sadi': 0.45, 'kob': 0.42, 'compote': 0.42}
# the club (src/maps42.js CLUB)
RING = (0.0, 0.6); CHR = 1.15; SEAT_Y = 0.42; WALK = 2.05; NCH = 7; CH_A = [i * 360 / NCH for i in range(NCH)]
STAGE_Y = 0.4; STOOL_Y = 0.82; KOB_MARK = (0.0, -4.6)
def chair(i): a = rad(CH_A[i]); return (RING[0] + math.sin(a) * CHR, RING[1] + math.cos(a) * CHR, CH_A[i])
def seat_mark(i): x, z, a = chair(i); return (x + math.sin(rad(a)) * 0.12, z + math.cos(rad(a)) * 0.12, a)
def circ(phi, r=WALK, c=RING): return (c[0] + math.sin(rad(phi)) * r, c[1] + math.cos(rad(phi)) * r)
LAST_C = (0.0, 1.75)                                                 # the last chair (chair 0's spot): the final round circles it
def walker2(who, phi0, dur, w=38.0, speed=2.2, r=0.95, **o):           # circling the last chair
    x0, z0 = circ(phi0, r, LAST_C); x1, z1 = circ(phi0 + w * dur, r, LAST_C)
    return A(who, 'happy_walk', x0, z0, mx=round(x1 - x0, 3), mz=round(z1 - z0, 3), yaw=phi0 + w * dur / 2 + 90, speed=speed, **o)
def mid(actors):                                                      # the walkers' mean position over the shot
    return (sum(a['x'] + a.get('mx', 0) / 2 for a in actors) / len(actors), sum(a['z'] + a.get('mz', 0) / 2 for a in actors) / len(actors))

def A(who, clip, x, z, **o):
    return {'who': who, 'look': o.pop('look', LOOK[who]), 'clip': clip, 'x': round(x, 3), 'z': round(z, 3), 'face': o.pop('face', 'world'),
            'yaw': round(o.pop('yaw', 0), 1), 'at': o.pop('at', 'auto'), **o}
def yaw_to(frm, to): return round(math.degrees(math.atan2(to[0] - frm[0], to[1] - frm[1])), 1)
SEATED = dict(clip='sitting_talking', at=0.05, speed=0, lift=SEAT_Y)
def sit(who, i, **o):                            # on chair i, facing out of the ring
    x, z, a = seat_mark(i); return A(who, x=x, z=z, **{'yaw': a, **SEATED, **o})
LAP = dict(clip='laying_idle', at=1.0, speed=0, lying=True, tongue=True)
def lap(i, **o):                                 # the dog belly up across the lap of whoever sits on chair i, his head on her right
    x, z, a = seat_mark(i); d = rad(a)
    return A('saxo', x=x + math.sin(d) * 0.2, z=z + math.cos(d) * 0.2, yaw=a + 90, lift=SEAT_Y + 0.24, **{**LAP, **o})
def walker(who, phi0, dur, clip='happy_walk', w=12.0, speed=1.2, **o):   # walking anticlockwise round the ring from phi0 for dur s (a chord)
    x0, z0 = circ(phi0); x1, z1 = circ(phi0 + w * dur)
    if who == 'saxo' and clip == 'charleston': o = {'face': 'camera', **o}   # the dog dances his way round facing the lens
    return A(who, clip, x0, z0, mx=round(x1 - x0, 3), mz=round(z1 - z0, 3), yaw=0 if o.get('face') == 'camera' else phi0 + w * dur / 2 + 90, speed=speed, **o)
DJ = dict(clip='sitting_talking', at=0.05, speed=0, lift=STOOL_Y, phones=True)
HOVER_L = dict(arm='L', aim=[0.45, -0.05, 0.85], upAt=-1)     # Kob's left paw raised over the STOP button
PRESS_L = dict(arm='L', aim=[0.45, -0.32, 0.85], upAt=-1)   # ... down on it
def kob_dj(**o): return A('kob', x=KOB_MARK[0], z=KOB_MARK[1], yaw=0, **{**DJ, **o})
def kob_lap(**o):                                # the dog belly up across the DJ's lap, his head on her right
    return A('saxo', x=KOB_MARK[0], z=KOB_MARK[1] + 0.2, yaw=90, lift=STOOL_Y + 0.24, **{**LAP, **o})

# ---- a projection check (numbers only): where each face lands in the 9:16 frame at the shot's start and end ----
def _proj(cam, look, fov, pt):
    f = [look[i] - cam[i] for i in range(3)]; n = math.sqrt(sum(v * v for v in f)); f = [v / n for v in f]
    r = [-f[2], 0.0, f[0]]; rn = math.sqrt(r[0] ** 2 + r[2] ** 2) or 1; r = [r[0] / rn, 0.0, r[2] / rn]
    u = [r[1] * f[2] - r[2] * f[1], r[2] * f[0] - r[0] * f[2], r[0] * f[1] - r[1] * f[0]]
    d = [pt[i] - cam[i] for i in range(3)]; z = sum(a * b for a, b in zip(d, f))
    if z <= 0.05: return None
    tv = math.tan(math.radians(fov) / 2); th = tv * 9 / 16
    return (0.5 + sum(a * b for a, b in zip(d, r)) / z / th / 2, 0.5 - sum(a * b for a, b in zip(d, u)) / z / tv / 2)
_src = open(os.path.join(HERE, '2026-10-11-2.lyrics.js')).read()
_rows = json.loads(re.search(r'window\.LYRICS = (.*?);\n', _src).group(1)); _ends = json.loads(re.search(r'window\.LINE_END = (.*?);\n', _src).group(1))
LINES = [(Bt(row[0][0] - 0.35), Bt(e)) for row, e in zip(_rows, _ends)]
def has_line(b0, b1): return any(a < b1 and b > b0 for a, b in LINES)
WARN = []
def body(a, end):                                # (who, x, z, face y, head top y) at the shot's start (0) or end (1)
    who = a['who']; sc = a.get('scale', 1)
    x, z = a['x'] + a.get('mx', 0) * end, a['z'] + a.get('mz', 0) * end
    lift = a.get('lift', 0) + (a.get('my', 0) if end else 0)
    fy, hy = FACE[who] * sc, HEAD[who] * sc
    if a.get('clip') == 'sitting_talking': fy, hy = fy - 0.16, hy - 0.16
    return (who, x, z, fy + lift, hy + lift)
def check(beat, b1, cam, look, fov, actors, end, W):
    line = has_line(beat, b1)
    for a in actors:
        if a.get('fg') or a.get('lying') or a.get('away'): continue
        who, x, z, fy, hy = body(a, end)
        top, face = _proj(cam, look, fov, (x, hy, z)), _proj(cam, look, fov, (x, fy, z))
        tag = ' at the end' if end else ''
        if not top or not face: W.append(f'b{beat}: {who} behind the lens{tag}'); continue
        if line and top[1] < 0.27: W.append(f'b{beat}: {who} head top at {top[1]:.2f} (lyric rows){tag}')
        if face[0] < 0.12 or face[0] > 0.88: W.append(f'b{beat}: {who} face x {face[0]:.2f} (edge){tag}')
        if face[1] > 0.82 or face[1] < 0.0: W.append(f'b{beat}: {who} face y {face[1]:.2f}{tag}')
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
# ---- the set: a lens stays inside the club (or the shop), clear of the stage, the decks, the speakers, the sofas ----
BOXES = [(-2.95, 2.95, -6.0, -3.55, STAGE_Y + 0.12), (-1.1, 1.1, -4.35, -3.75, 1.15), (1.7, 2.8, -5.1, -4.1, 2.45), (-2.8, -1.7, -5.1, -4.1, 2.45),
         (4.85, 6.0, -3.3, -1.1, 1.0), (4.85, 6.0, 0.5, 2.7, 1.0), (-0.3, 0.3, -5.0, -4.4, STOOL_Y + 0.1)]
def free(c, m, chairs=()):
    x, y, z = c
    if any(x0 - 0.1 < x < x1 + 0.1 and z0 - 0.1 < z < z1 + 0.1 and y < top + 0.1 for x0, x1, z0, z1, top in BOXES): return False
    if any(math.hypot(x - chair(i)[0], z - chair(i)[1]) < 0.4 and y < 1.05 for i in chairs): return False
    if m == 'shop': return -10.4 < x < -6.2 and -1.4 < z < 4.2 and 0.15 < y < 3.0 and not (-9.6 < x < -7.6 and -0.8 < z < 0.0 and y < 1.3)
    return -5.8 < x < 5.8 and -5.8 < z < 7.8 and 0.12 < y < 5.8
def lens(v, k=0):
    c, f = v; a = math.radians(c['ang'][k]); fy = f[2] if len(f) > 2 else 0
    return (f[0] + math.sin(a) * c['r'][k], c['h'][k] + fy, f[1] + math.cos(a) * c['r'][k])
def problems(beat, b1, actors, v, m, chairs, W):
    c, focus = v; fy = focus[2] if len(focus) > 2 else 0
    for k, end in ((0, 0), (-1, 1)):
        cam, look = lens(v, k), (focus[0], c['look'][k] + fy, focus[1])
        check(beat, b1, cam, look, c['fov'], actors, end, W)
        for oc in _occl(cam, look, c['fov'], [body(a, end)[:4] for a in actors if not a.get('lying') and not a.get('fg') and not a.get('away')]):
            W.append(f'b{beat}: {oc}{" at the end" if end else ""}')
        if not free(cam, m, chairs): W.append(f'b{beat}: lens inside the set{" at the end" if end else ""} {tuple(round(q, 2) for q in cam)}')
    return W
def clear_for(v, actors):                        # party pets off the lens (start and end) and off its lines to the actors' faces
    pts = []
    for k, end in ((0, 0), (-1, 1)):
        cam = lens(v, k); pts.append([round(cam[0], 2), round(cam[2], 2), 1.0])
        for a in actors:
            if a.get('fg'): continue
            _, x, z, fy, _h = body(a, end)
            d = math.dist((cam[0], cam[2]), (x, z)); n = max(1, int(d / 0.5))
            for i in range(1, n + 2):
                u = i / n; pts.append([round(cam[0] + (x - cam[0]) * u, 2), round(cam[2] + (z - cam[2]) * u, 2), 0.55])
    return pts
shots = []; REV = []
def add(beat, b1, actors, lyric, v, m='club', rv=None, **o):
    c, focus = v
    o = {k: val for k, val in o.items() if val is not None}
    REV.append(round(beat * PER + (rv if rv is not None else 0.6 * (b1 - beat) * PER), 2))
    chairs = o.get('chairs', list(range(NCH)))
    o['clear'] = o.get('clear', []) + clear_for(v, actors)
    if m == 'shop': o.setdefault('zone', 'shop')
    shots.append({'beat': beat, 'kind': 'dance', 'map': 'candyclub', 'actors': actors, 'lyric': lyric, 'cam': c, 'focus': focus, **o})
    problems(beat, b1, actors, v, m, [i for i in chairs if i not in [q[0] for q in o.get('chairOut', [])]], WARN)
def solve(beat, b1, actors, look, ang, dist, h, fov=50, m='club', chairs=(), push=0.08, dang=30, rng=(0.8, 1.6), dh=0.3, **kw):
    """a lens round the look point (x, y, z): the preferred direction ang (deg, 0 = +z), distance and height; the
    nearest candidate with no framing, occlusion or set problem wins (else the one with the fewest)"""
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
                n = len(problems(beat, b1, actors, v, m, list(chairs), []))
                score = n * 1000 + abs(da) + abs(dk - 1) * 40 + abs(dhh) * 20
                if best is None or score < best[0]: best = (score, v)
                if n == 0 and score < 1: return v
    return best[1]
def clean(actors):
    for a in actors:
        for k in ('lying', 'away'): a.pop(k, None)
    return actors

# ---- the game's state per round (the map's players: six party pets, k = 0..5) ----
ALL = list(range(NCH))
STOP1 = dict(stop=True, still=True)                                   # the music stopped: the lights and the dancers freeze, no beat bounce
def pets_circle(ang0, out=(), mode='circle', w=12):                   # the pets on the ring at these angles (deg at the shot's start)
    return dict(pmode=[False if k in out else mode for k in range(6)], ang=ang0, walk=w)
PET_A1 = [40, 80, 120, 160, 200, 240]                                 # round 1: the cast at 0 (Saxo), 320 (Sadi), 280 (Compote)
OUT1 = [[5, -9, 347.1, 2.4]]
OUT2 = OUT1 + [[2, -9, 192.9, 2.4]]
OUT3 = OUT2 + [[1, -9, 141.4, 2.4], [3, -9, 155, 3.0], [4, -9, 205, 3.0], [6, -9, 310, 3.0]]
DANCE_SPOTS = [(-1.3, 2.7), (-1.6, 1.5), (1.6, 1.5), (-0.4, 3.7), (2.2, 3.1), (1.1, 3.9)]
ALONE_V = lambda: view((0.0, 0.85, 6.6), (0.0, 0.95, 1.9), fov=58, p1=(0.0, 0.85, 6.3))   # the dog alone in the silence (S03, S13, S18: one frame, the rhyme)

# =====================================================================================================================
# ROUND 1, the title line (b0-8): the hook, the game in full swing, the DJ's paw over the button.
# S00 (b0-4): the hook: a low push along the ring of gold chairs to the dog dancing his way round it in the singer's
# black dress and bob, the party pets and Sadi behind him, the DJ's gold-lit stage beyond
# (the critic, 17/25, hook 3: "a dim dance like every opener; the STOP button only at 2.0 s": frame 1 now holds the
# game, the coming stop and the dog: across the ring, the dog showing off in the middle of the chairs (outside them,
# the far chairs' backs crossed his face), Kob behind him at the decks with her paw over the red STOP button)
s00 = [A('saxo', 'charleston', -0.5, 0.2, face='camera', yaw=0, at=0.43, speed=1, tongue=True), kob_dj(**HOVER_L)]
v = view((0.45, 1.95, 3.9), (-0.45, 1.25, -2.5), fov=50, p1=(0.44, 1.93, 3.75), roll=(-4, -2))
add(0, 4, s00, "the hook: musical chairs at the secret club: the dog in the singer's black dress and bob dances round the ring of gold chairs while Kob the DJ, behind him, holds her paw over the big red STOP button", v,
    chairs=[1, 2, 3, 4, 5, 6], key=[0.0, 2.2, 1.9, 1.0, 0.9, 0.75], **pets_circle([110, 135, 250, 275, 300, 330]))   # chair 0, nearest the lens, crossed his mouth; a warm key (the critic: "dim")
# S01 (b4-6): Kob the DJ at the decks, deadpan in her headphones, her paw hovering over the big red STOP button on 'stop'
s01 = [kob_dj(**HOVER_L)]
v = view((0.65, 2.15, -1.6), (0.22, 1.6, -4.4), fov=50, p1=(0.6, 2.13, -1.8))
add(4, 6, s01, "Kob the DJ, deadpan in her headphones, her paw hovering over the big red STOP button", v, players=False)
# S02 (b6-8; 'music' b6.4): the whole ring from above the front: everyone round the chairs, eyes on the DJ
s02 = [walker('saxo', 15, S(8, 6), clip='charleston', speed=1, at=0.6, tongue=True), walker('sadi', -22, S(8, 6)), walker('compote', -52, S(8, 6))]
v = view((0.0, 4.6, 7.6), (0.0, 0.4, 0.6), fov=64, p1=(0.0, 4.5, 7.35))
add(6, 8, s02, "the whole ring from above: the players circle the chairs, eyes on the DJ", v, **pets_circle([a + 40 for a in PET_A1]))

# ---- STOP 1 (b8-12: the brake, the silent bar) ----
# S03 (b8-10): everyone has dived into a chair; the dog dances on alone in the silence, the ring of faces on him
R1_SEATS = [2, 0, 3, 4, 5, -1]                                        # pets 0-4 seated, pet 5 left standing (out)
DOGPT = (0.0, 2.95)
TURNED = lambda i: dict(yaw=yaw_to(seat_mark(i)[:2], DOGPT))                  # seated, turned on the chair to stare at the dog
s03 = [A('saxo', 'charleston', *DOGPT, yaw=0, at=1.1, speed=1, tongue=True), sit('sadi', 1, **TURNED(1)), sit('compote', 6, **TURNED(6))]
add(8, 10, s03, "the record brakes: everyone dives into a chair; the dog dances on alone in the silence, every face on him", ALONE_V(),
    pmode=['seated'] * 5 + ['stare'], seats=R1_SEATS, spots=[None] * 5 + [circ(250)], stare=list(DOGPT), **STOP1)
# S04 (b10-12): he notices: no chair left... he flops belly up across Sadi's lap; her hearts
s04 = [sit('sadi', 1), lap(1)]
x1, z1, a1 = seat_mark(1)
v = view((x1 + math.sin(rad(a1 - 25)) * 2.9, 2.3, z1 + math.cos(rad(a1 - 25)) * 2.9), (x1 + math.sin(rad(a1)) * 0.2, 0.95, z1 + math.cos(rad(a1)) * 0.2), fov=52, p1=(x1 + math.sin(rad(a1 - 25)) * 2.55, 2.2, z1 + math.cos(rad(a1 - 25)) * 2.55))
add(10, 12, s04, "no chair left: the dog flops belly up across Sadi's lap; she melts (hearts)", v,
    pmode=['seated'] * 5 + [False], seats=R1_SEATS, hearts=[[x1, 1.55, z1, 0.15, 1]], heartYaw=a1, **STOP1)

# =====================================================================================================================
# ROUND 2, the chant (b12-44): Compote kicks a chair out; the conga; the DJ's two fake-outs.
# S05 (b12-16): the music's back: Compote, furious (no one is out), kicks a chair clean out of the ring
def kick_from(i, back=0.55):                     # Compote beside chair i, facing along the ring's tangent, the chair 0.55 m in front of her
    x, z, a = chair(i); t = rad(a + 90); return (x - math.sin(t) * back, z - math.cos(t) * back, a + 90)
cx5, cz5, ky5 = kick_from(5)
s05 = [A('compote', 'male_front_snap_kick_with_the_lead_foot', cx5, cz5, yaw=ky5, at=0.5, speed=1)]
lk5 = (cx5 + math.sin(rad(ky5)) * 1.0, 0.8, cz5 + math.cos(rad(ky5)) * 1.0)
v = view((lk5[0] + math.sin(rad(ky5 - 90)) * 4.4, 1.2, lk5[2] + math.cos(rad(ky5 - 90)) * 4.4), lk5, fov=60)
add(12, 16, s05, "the music's back: Compote, furious that no one is out, kicks a chair clean out of the ring", v,
    chairOut=[[5, 0.6, ky5, 2.4, 0.9]], pmode=['stare'] * 5 + [False], spots=[circ(a, 2.6) for a in (20, 60, 110, 150, 200)] + [None], stare=[cx5, cz5], rv=1.0)
# S06 (b16-20): round two: the conga round the six chairs, the dog leading, a low lens at the ring
CONGA = dict(arm='both', aim=[0.05, -0.12, 0.95], upAt=-1)
s06 = [walker('saxo', 30, S(20, 16), clip='happy_walk', w=8, tongue=True, aim='rave', arm='both', flapEvery=1000, flapPh=90, upAt=-1), walker('sadi', 6, S(20, 16), w=8, **CONGA), walker('compote', -18, S(20, 16), w=8, **CONGA)]
m06 = mid(s06); l06 = circ(10, 6.3)
v = view((l06[0], 1.15, l06[1]), (m06[0], 0.85, m06[1]), fov=66, p1=(l06[0] * 0.96, 1.15, l06[1] * 0.96))
add(16, 20, s06, "round two: the conga round the chairs, the dog leading", v, chairOut=OUT1, **pets_circle([70, 110, 150, 190, 230, 270], out=(5,)))
# S07 (b20-24): the dog's dance, close and low, Sadi behind him with hearts
s07 = [walker('saxo', 55, S(24, 20), clip='charleston', speed=1, at=1.3, tongue=True, w=4), walker('sadi', 20, S(24, 20))]
m07 = mid(s07)
v = solve(20, 24, s07, (m07[0], 0.9, m07[1]), 60, 3.2, 0.55, fov=60, roll=(-8, -4), push=0.1, rng=(0.85, 1.3), dang=25)
add(20, 24, s07, "the dog dances his way round, Sadi behind him with hearts in her eyes", v, chairOut=OUT1, **pets_circle([100, 140, 180, 220, 260, 300], out=(5,)),
    hearts=[[mid(s07[1:])[0], 1.35, mid(s07[1:])[1], 0.2, 1]])
# S08 (b24-26; Y 'please' b24.1): fake-out 1: Kob's paw rises over the button
s08 = [kob_dj(**HOVER_L)]
v = deadpan(KOB_MARK, 1.85, 3.0, cam_y=1.9, fov=42, push=0.12, ang=-12)
add(24, 26, s08, "'please don't stop the music': Kob's paw rises over the STOP button...", v, players=False)
# S09 (b26-28): ... everyone dives and hovers half sitting over the chairs, frozen, for nothing; the dog dances on
s09 = [A('saxo', 'charleston', *circ(0, 2.75), face='camera', yaw=0, at=1.3, speed=1, tongue=True), sit('sadi', 1, lift=SEAT_Y + 0.16), sit('compote', 6, lift=SEAT_Y + 0.16)]
v = view((0.0, 4.6, 7.6), (0.0, 0.4, 0.6), fov=64, p1=(0.0, 4.5, 7.35))   # [fallback: S02's passed high front view]
add(26, 28, s09, "... the whole ring dives and hovers half sitting over the chairs, frozen: she didn't press it; the dog dances on", v,
    chairOut=OUT1, pmode=['hover'] * 4 + [False, False], seats=[2, 0, 3, 4, -1, -1], stare=[0.0, -4.4], rv=0.5)
# S10 (b28-32): they straighten up and circle again: the ring from straight above (the game's diagram)
s10 = [walker('saxo', 30, S(32, 28), clip='charleston', speed=1, at=0.9), walker('sadi', 4, S(32, 28)), walker('compote', -22, S(32, 28))]
v = view((0.3, 5.2, 5.6), (0.3, 0.0, 0.6), fov=62, p1=(0.3, 5.1, 5.4))
add(28, 32, s10, "they straighten up and circle again: the ring of chairs from above", v, chairOut=OUT1, **pets_circle([70, 110, 150, 190, 230, 270], out=(5,)))
# S11 (b32-36): Compote glares at the dog as she circles, low and close
s11 = [walker('compote', 70, S(36, 32))]
v = solve(32, 36, s11, (circ(80)[0], 0.95, circ(80)[1]), 140, 2.6, 0.7, fov=54, push=0.12)
add(32, 36, s11, "Compote glares as she circles: the dog has to go", v, chairOut=OUT1, **pets_circle([190, 230, 270, 310, 350, 30], out=(5,)))
# S12 (b36-40): the dog's charleston kick past the chairs, Sadi behind him
s12 = [walker('saxo', 300, S(40, 36), clip='charleston', speed=1, at=1.35, tongue=True), walker('sadi', 266, S(40, 36))]
m12 = mid(s12)
v = solve(36, 40, s12, (m12[0], 0.9, m12[1]), 300, 3.2, 1.3, fov=60, roll=(7, 4), push=0.1, rng=(0.85, 1.3), dang=25)
add(36, 40, s12, "the dog's charleston round the chairs, Sadi behind him", v, chairOut=OUT1, rv=0.25, **pets_circle([20, 60, 100, 140, 180, 220], out=(5,)))
# S13 (b40-44; Y 'please' b40): fake-out 2, the dog's turn (the critic, 16/25: the second fake-out repeated the
# first): the paw rises and this time only the dog dives proudly into a chair; the music plays on; the whole ring stops
# dead and stares at him: the one time he sits is the wrong time. The DJ's point of view, from over her decks
DOG13 = 3
d13 = seat_mark(DOG13)[:2]
s13 = [sit('saxo', DOG13, lift=SEAT_Y + 0.3, my=-0.3, myAt=0.12, myDur=0.22, tongue=True),
       A('sadi', 'happy_idle', *circ(318), yaw=yaw_to(circ(318), d13), at=0.3, speed=0.1),
       A('compote', 'happy_idle', *circ(58), yaw=yaw_to(circ(58), d13), at=0.3, speed=0.1)]
v = solve(40, 44, s13, (0.3, 0.95, 0.5), 182, 4.6, 2.5, fov=58, push=0.08, dang=20, rng=(0.85, 1.2))
add(40, 44, s13, "fake-out two, the dog's turn: the paw rises and only the dog dives proudly into a chair; the music plays on; the whole ring stares at him", v,
    chairOut=OUT1, pmode=['stare'] * 5 + [False], spots=[(-0.85, 3.1), (1.75, 3.9), circ(100, 2.35), circ(255, 2.35), circ(280, 2.35), None], stare=list(d13))   # the two in frame clear of his head

# =====================================================================================================================
# The breakdown (b44-76): another chair out; the tiptoe; the second stop; the dog on Compote's lap; the uppercut.
# S14 (b44-48): Compote kicks out another chair
cx3, cz3, ky3 = kick_from(2)
s14 = [A('compote', 'male_front_snap_kick_with_the_lead_foot', cx3, cz3, yaw=ky3, at=0.5, speed=1)]
lk3 = (cx3 + math.sin(rad(ky3)) * 1.0, 0.8, cz3 + math.cos(rad(ky3)) * 1.0)
v = view((lk3[0] + math.sin(rad(ky3 - 90)) * 4.4, 1.2, lk3[2] + math.cos(rad(ky3 - 90)) * 4.4), lk3, fov=60)
add(44, 48, s14, "the breakdown: Compote kicks out another chair", v, chairOut=OUT1 + [[2, 0.6, ky3, 2.4, 0.9]],
    pmode=['stare'] * 5 + [False], spots=[circ(a, 2.6) for a in (20, 60, 300, 340, 200)] + [None], stare=[cx3, cz3], rv=1.0)
# S15 (b48-52): the tiptoe: the circle creeps round, every face on the DJ, the dog still dancing; low among them
s15 = [walker('saxo', 55, S(52, 48), clip='charleston', speed=1, at=1.3, tongue=True, w=4), walker('sadi', 20, S(52, 48))]   # [fallback: S07's passed two-shot]
m15 = mid(s15)
v = solve(48, 52, s15, (m15[0], 0.9, m15[1]), 60, 3.2, 0.55, fov=60, roll=(-8, -4), push=0.1, rng=(0.85, 1.3), dang=25)
add(48, 52, s15, "the breakdown: the circle creeps round, Sadi gazing at the dog as he dances his way past", v, chairOut=OUT2, **pets_circle([100, 140, 180, 220, 260, 300], out=(5,), w=12),
    hearts=[[mid(s15[1:])[0], 1.35, mid(s15[1:])[1], 0.2, 1]])
# S16 (b52-56): Kob's paw creeping down towards the button, close
s16 = [kob_dj(arm='L', aim=[0.45, 0.15, 0.85], aim2=[0.45, -0.12, 0.85], aim2At=1.4, upAt=-1)]
v = view((2.0, 1.85, -2.3), (0.2, 1.66, -4.45), fov=46, p1=(1.92, 1.84, -2.4))   # from her left, her head under the lyric rows, the button low (S01's frame was this one's twin: the critic)
add(52, 56, s16, "Kob's paw creeps towards the button", v, players=False)
# S17 (b56-60; Y 'please' b56): the tiptoe at its tensest, every face on the DJ
s17 = [walker('saxo', 46, S(60, 56), clip='charleston', speed=1, at=1.45, tongue=True), walker('compote', 6, S(60, 56), speed=1.0)]
m17 = mid(s17)
v = view((0.55, 5.2, 5.6), (0.55, 0.0, 0.6), fov=62, p1=(0.55, 5.1, 5.4))   # [fallback: S10's passed high view of the ring]
add(56, 60, s17, "'please don't stop the music': every face on the DJ, the dog dancing", v, chairOut=OUT2, **pets_circle([100, 140, 180, 220, 260, 300], out=(5,), w=12))
# ---- STOP 2 (b60-64) ----
R2_SEATS = [3, 0, 4, -1, -1, -1]
# S18 (b60-62): the scramble: everyone in a chair, the dog dancing alone in the silence again (S03's frame: the rhyme)
s18 = [A('saxo', 'charleston', *DOGPT, yaw=0, at=1.1, speed=1, tongue=True), sit('sadi', 1, **TURNED(1)), sit('compote', 6, **TURNED(6))]
add(60, 62, s18, "the record brakes again: everyone in a chair; the dog dances on alone in the silence", ALONE_V(),
    chairOut=OUT2, pmode=['seated', 'seated', 'seated', 'stare', 'stare', False], seats=R2_SEATS,
    spots=[None, None, None, circ(200, 2.7), circ(240, 2.7), None], stare=list(DOGPT), **STOP1)
# S19 (b62-64) [fallback: the flop alone; the dog-breath puffs never read in three loops]: he flops belly up across Compote's lap, her fury
s19 = [sit('compote', 6), lap(6)]
x0, z0, a0 = seat_mark(6)
v = view((x0 + math.sin(rad(a0 + 25)) * 2.9, 2.3, z0 + math.cos(rad(a0 + 25)) * 2.9), (x0 + math.sin(rad(a0)) * 0.2, 0.95, z0 + math.cos(rad(a0)) * 0.2), fov=52, p1=(x0 + math.sin(rad(a0 + 25)) * 2.55, 2.2, z0 + math.cos(rad(a0 + 25)) * 2.55))
add(62, 64, s19, "he flops belly up across Compote's lap: her fury", v,
    chairOut=OUT2, pmode=['seated', 'seated', 'seated', False, False, False], seats=R2_SEATS,
    **STOP1)
# S20 (b64-68): the music's back: Compote's uppercut sends the dog flying, side on
s20 = [A('compote', 'uppercut_atk', 0.0, 2.2, yaw=90, at=0.65, speed=1.0, once=True, scale=round(1 / 0.92, 3)),
       A('saxo', 'uppercut_vic', 0.6, 2.2, yaw=90, at=0.65, speed=1.0, once=True, air=True)]
v = view((0.85, 1.3, 6.5), (1.05, 1.2, 2.2), fov=62, p1=(0.85, 1.3, 6.4))
add(64, 68, s20, "the music's back: Compote's uppercut sends the dog flying", v, chairOut=OUT2,
    players=False, rv=0.8)
# S21 (b68-72): he lands in the candy shop through the secret door, sweets flying; the ones who are out eat lollipops
s21 = [A('saxo', 'knocked_out_falling_to_back', -7.9, 1.2, yaw=90, at=3.3, speed=0, lying=True, dizzy=True)]
v = view((-6.45, 2.6, 1.9), (-8.2, 0.4, 1.3), fov=64, p1=(-6.5, 2.55, 1.85))
add(68, 72, s21, "he lands in the candy shop through the secret door, in a burst of sweets; the ones who are out are eating lollipops", v, m='shop',
    pmode=[False, False, False, 'shop', 'shop', 'shop'], candyBurst=[-7.9, 0.6, 1.2, 0.0], door=1)
# S22 (b72-76): dizzy among the sweets, he looks back through the door at the club
s22 = [A('saxo', 'happy_idle', -6.9, 1.4, yaw=-90, at=0.3, speed=0.1, dizzy=True)]
v = view((-8.9, 1.25, 1.9), (-6.9, 1.05, 1.4), fov=50, p1=(-8.7, 1.25, 1.85))
add(72, 76, s22, "dizzy among the sweets, he looks back through the secret door at the club", v, m='shop', pmode=[False, False, False, 'shop', 'shop', 'shop'], door=1, candyBurst=[-7.9, 0.6, 1.2, -9])

# =====================================================================================================================
# The last chorus (b76-110): the final round; the dog crawls back to the decks; the paw comes down... on the dog.
# S23 (b76-80): the drop: the final players circle the five chairs left, Sadi and Compote leading
s23 = [walker('sadi', 284, S(80, 76)), walker('compote', 334, S(80, 76))]
m23 = mid(s23)
v = solve(76, 80, s23, (m23[0], 0.9, m23[1]), 70, 3.4, 0.9, fov=62, roll=(-7, -4), push=0.12, rng=(0.85, 1.4), dang=35)
add(76, 80, s23, "the drop: the final round: Sadi and Compote circle what's left of the ring with the party pets", v, chairOut=OUT2, **pets_circle([20, 60, 100, 140, 180, 220], out=(3, 4, 5)))
# S24 (b80-84; take b80.1, away b81.9): 'take away': Compote's kick clears every chair but one: they fly, the pets flee
cx1, cz1, ky1 = kick_from(1)
s24 = [A('compote', 'male_front_snap_kick_with_the_lead_foot', cx1, cz1, yaw=ky1, at=0.5, speed=1)]   # [fallback: S05's passed side-on kick]
lk1 = (cx1 + math.sin(rad(ky1)) * 1.0, 0.8, cz1 + math.cos(rad(ky1)) * 1.0)
v = view((lk1[0] + math.sin(rad(ky1 - 90)) * 4.4, 1.2, lk1[2] + math.cos(rad(ky1 - 90)) * 4.4), (0.6, 0.75, 1.0), fov=64)   # aimed left and wider: the last chair beside her stays in frame (it was cut at the edge)
add(80, 84, s24, "'take away': Compote's kick clears every chair but one; they fly, the party pets flee", v,
    chairOut=OUT2 + [[1, 0.6, ky1, 2.4, 0.9], [3, 0.66, 155, 3.0, 0.9], [4, 0.72, 205, 3.0, 0.9], [6, 0.63, 310, 3.0, 0.9]], pmode=['stare', 'stare', 'stare', False, False, False],
    spots=[circ(a, 3.1) for a in (12, 120, 300)] + [None] * 3, stare=[cx1, cz1], rv=1.0)   # at 60 deg a pet stood on the lens line, its back filling the frame (the critic)
# S25 (b84-88; escape b83.9, music b86.4): the dog crawls back in through the secret door, low
s25 = [A('saxo', 'crawling_forward_on_hands_and_knees', -5.35, 2.4, yaw=90, mx=0.85, at='auto', speed=0.8, noLie=True, away=True)]
v = view((-4.5, 0.75, 5.5), (-4.85, 0.45, 2.1), fov=58, p1=(-4.45, 0.75, 5.35))
add(84, 88, s25, "the dog crawls back in through the secret door", v, chairOut=OUT3, players=False, door=1)
# S26 (b88-92; DJ b88.6, play b90.3): 'DJ': Kob at the decks, deadpan; behind her the dog's ears creep up
s26 = [kob_dj(), A('saxo', 'happy_idle', 0.42, -5.05, yaw=-10, at=0.3, speed=0.1, lift=STAGE_Y - 0.3, my=0.3, myAt=0.6, myDur=1.0, away=True)]
v = deadpan(KOB_MARK, 1.85, 3.4, cam_y=1.9, fov=48, push=0.1, ang=8)
add(88, 92, s26, "'DJ': Kob deadpan at the decks; behind her the dog's ears creep up", v, chairOut=OUT3, players=False)
# S27 (b92-96; refuse b94): the last chair: Sadi and Compote circle it face to face
s27 = [A('sadi', 'happy_idle', LAST_C[0] - 0.75, LAST_C[1], yaw=90, at=0.3, speed=0.1), A('compote', 'happy_idle', LAST_C[0] + 0.75, LAST_C[1], yaw=-90, at=0.3, speed=0.1)]
v = view((0.0, 1.15, 6.1), (0.0, 0.85, 1.75), fov=56, p1=(0.0, 1.12, 5.8))
add(92, 96, s27, "'refuse': the last chair: Sadi and Compote circle it face to face", v, chairOut=OUT3, players=False)
# S28 (b96-100): low round the last chair, fast
s28 = [walker2('sadi', 295, S(100, 96), w=20, speed=1.4), walker2('compote', 115, S(100, 96), w=20, speed=1.4)]
v = solve(96, 100, s28, (0.0, 0.85, 1.75), 25, 3.6, 0.45, fov=62, roll=(-9, -5), push=0.1)
add(96, 100, s28, "round and round the last chair", v, chairOut=OUT3, players=False)
# S29 (b100-104; keep b100.1): Kob's paw rises over the button for the last stop; the dog behind her, ready
s29 = [kob_dj(arm='L', aim=[0.4, 0.5, 0.75], upAt=-1), A('saxo', 'happy_idle', 0.85, -5.0, yaw=-30, at=0.3, speed=0.1, lift=STAGE_Y)]
v = solve(100, 104, s29, (0.35, 1.8, -4.6), 15, 3.4, 1.95, fov=50, push=0.1)
add(100, 104, s29, "'keep': Kob's paw rises for the last stop; the dog right behind her", v, chairOut=OUT3, players=False)
# S30 (b104-110; the title line, music b108.4): the paw comes down... and the dog lands belly up across her lap,
# pinning her: the music doesn't stop
s30 = [kob_dj(arm='L', aim=[0.45, 0.25, 0.85], upAt=-1), kob_lap()]
v = view((0.95, 2.1, -1.2), (-0.15, 1.55, -4.45), fov=52, p1=(0.9, 2.06, -1.4))
add(104, 110, s30, "the title line: her paw comes down... and the dog lands belly up across her lap, pinning her: the music doesn't stop", v, chairOut=OUT3, players=False,
    hearts=[[0.0, 1.9, -4.4, 2.5, 1]])

# =====================================================================================================================
# The chorus again (b110-146): the music never stops; the party; Compote refuses; the last press; the freeze.
# S31 (b110-116; take b111.9, away b114.1): Sadi and Compote still circling the last chair, dizzy: it never stops
s31 = [walker2('sadi', 250, S(116, 110), w=14, speed=1.3, dizzy=True), walker2('compote', 70, S(116, 110), w=14, speed=1.3, dizzy=True)]
v = solve(110, 116, s31, (0.0, 0.9, 1.75), 5, 4.4, 1.4, fov=58, push=0.08)
add(110, 116, s31, "the music never stops: Sadi and Compote circle the last chair, dizzy", v, chairOut=OUT3, players=False)
# S32 (b116-124; DJ b120.3, play b122.3): 'DJ, play': the dog dances belly up on the DJ's lap, the cat pinned, deadpan
s32 = [kob_dj(), kob_lap()]
v = view((0.85, 2.05, -1.4), (-0.15, 1.6, -4.45), fov=50, p1=(0.8, 2.0, -1.6))
add(116, 124, s32, "'DJ, let it play': the dog dances belly up on the DJ's lap, the cat pinned under him, deadpan", v, chairOut=OUT3, players=False, hearts=[[-0.4, 1.8, -4.3, 0.5, 1]])
# S33 (b124-132; refuse b126.1): the party pets pour back in and dance; Sadi dances; Compote refuses to dance: she
# stands by the last chair shaking her head, furious, in the middle of the party; the DJ pinned at the decks behind
# (the critic, 15/25: she sat in the chair from here on, so the last stop revealed nothing: she sits on it now)
CP_STAND = (0.72, 1.95)
s33 = [A('sadi', 'charleston', -0.3, 3.05, yaw=20, at=0.2, speed=1), A('compote', 'shaking_head_no_dismissively', *CP_STAND, yaw=yaw_to(CP_STAND, (1.7, 6.7)), at=0, speed=1),
       kob_dj(), kob_lap()]   # [fallback: S37's passed lens]
v = view((1.7, 1.95, 6.7), (-0.25, 1.0, 0.4), fov=60, p1=(1.65, 1.93, 6.5))
add(124, 132, s33, "'refuse': the party pets pour back in and dance, Sadi dances; Compote refuses to dance: she stands by the last chair shaking her head, furious", v, chairOut=OUT3,
    players='dance', spots=DANCE_SPOTS, stars=['compote', 'sadi'])
# S34 (b132-136.7; keep b132): Sadi's charleston with the dancing pets, hearts
s34 = [A('sadi', 'charleston', 1.5, 2.7, yaw=-20, at=0.9, speed=1)]
v = solve(132, 136.7, s34, (1.5, 0.9, 2.7), 340, 3.0, 0.45, fov=60, roll=(6, 3), push=0.15)
add(132, 136.7, s34, "'keep': Sadi dances with the pets", v, chairOut=OUT3, players='dance', spots=DANCE_SPOTS, hearts=[[1.5, 1.25, 2.7, 0.3, 1]], rv=0.7)
# S35 (b136.7-142.3; please x3): on every 'please' the dog begs the DJ from her lap; her free paw creeps to the button
s35 = [kob_dj(arm='L', aim=[0.45, 0.05, 0.85], upAt=-1), kob_lap()]
v = view((-0.95, 2.1, -0.95), (-0.12, 1.5, -4.45), fov=54, p1=(-0.9, 2.08, -1.15))   # S32's lens mirrored: his begging face near, her paw and the button beyond
add(136.7, 142.3, s35, "the title line: on every 'please' the dog begs the DJ from her lap; her free paw creeps to the button", v, chairOut=OUT3, players=False)
# S36 (b142.3-144; music b142.3): she presses it: the record brakes
s36 = [kob_dj(**PRESS_L, fg=True), kob_lap(fg=True)]
v = view((0.8, 1.8, -3.3), (0.38, 1.05, -4.2), fov=40, p1=(0.78, 1.78, -3.4))
add(142.3, 144, s36, "her paw comes down on the button: the record brakes", v, chairOut=OUT3, players=False, press=S(143.4, 142.3))
# S37 (b144-146): the button: everyone frozen mid-dance; Compote, the only one who moves, drops into the last chair and
# raises her fist: she wins musical chairs; the DJ frozen at the decks with her paw on the button, the dog on her lap
s37 = [sit('compote', 0, lift=0.38 + 0.3, my=-0.3, myAt=0, myDur=0.22, arm='R', aim=[0.75, 0.6, 0.2], upAt=0.3), A('sadi', 'charleston', -0.55, 2.95, yaw=20, at=1.6, speed=0, holdAt=0),
       kob_dj(**PRESS_L), kob_lap()]
v = view((1.7, 1.95, 6.7), (-0.25, 1.0, 0.4), fov=60)
add(144, 146, s37, "the button: the music stops, everyone freezes mid-dance; the only one in a chair is Compote: she wins", v, chairOut=OUT3,
    players='dance', spots=DANCE_SPOTS, stop=True, still=True, key=[0.0, 2.4, 2.6, 1.0, 0.85, 0.5])

for s in shots: clean(s['actors'])
shots.sort(key=lambda x: x['beat'])
ep = {
    'date': '2026-10-11', 'song': {'title': "Don't Stop The Music", 'artist': 'Rihanna'},
    'logline': "Musical chairs at the secret club behind the candy shop: every time Kob the DJ stops the music, everyone dives into a chair but the dog, who dances on alone in the silence and flops across the nearest lap; thrown out by Compote, he stops the DJ instead, by lying across hers: the music never stops, and when the cat finally presses it, the only one in a chair is Compote.",
    'new': "src/maps42.js: candyclub (the hidden club behind a candy shop from the clip: teal damask walls, a purple stage with big round gold lights, a pink neon lollipop, the decks with a big red STOP button (`press`) and the DJ's stool, speaker stacks, a mirror ball and its light spots, blue lounge sofas; a ring of gold party chairs (`chairs`, `chairOut`: kicked out of the ring); six party pets playing musical chairs (`pmode`: circle, seated, scramble, hover, stare, dance, cheer, shop); the secret shelf door (`door`) and the candy shop behind it (jars, a counter, a gumball machine, giant lollipops); `stop` freezes the club; `candyBurst`, `breath` (dog breath: unused, it never read), hearts); the music's stops cut into the kit itself (a turntable brake and a silent bar); look saxo bandeau (with ARM_CUFFS: its gold cuffs follow the arms); the structure MUSICAL CHAIRS",
    'notes': "The world, from the official video (contact sheets every 3 s): a yellow taxi on a rainy night street, a corner candy shop whose back door opens on a hidden club (teal damask walls, magenta light, a purple stage with big round gold lights), the singer in a black strapless dress, gold cuffs and a black bob. Our version: the hidden club behind the candy shop plays musical chairs, and the title is the joke: the DJ stops the music. The words, from whitelisted keywords per line: the title line, the chant, 'take away', 'escape', 'DJ', 'play', 'refuse', 'keep'. Cast: Saxo in the singer's look (the dog who never notices the music stopped and lands on laps: the lap-dog universal), Kob the DJ (her unplug thread: she stops the music; pinned under the dog for once), Compote the furious referee (kicks chairs out, the uppercut; refuses to dance and wins by sitting down on the last stop), Sadi (the romance: his first lap, hearts).",
    'yt': 'end',
    'with': ['sadi', 'kob', 'compote'],
    'clips': sorted({a['clip'] for s in shots for a in s['actors']}),
    'tags': {'structure': 'musical chairs', 'scenes': ['the ring of chairs', 'the record brakes', 'dancing alone in the silence', 'the lap dog', 'the chair kick', 'the DJ fake-out', 'the hover', 'the wrong-time sit', 'the uppercut out the secret door', 'the candy shop', 'the crawl back in', 'the DJ pinned', 'the music never stops', 'the last press'],
             'cast': ['saxo', 'sadi', 'kob', 'compote'], 'hook': 'dance', 'maps': ['candyclub'], 'ref': 'none',
             'lyric_literal': "the title line (the DJ stops the music: a record brake and silence; then, pinned, she can't), 'take away' (Compote's kick clears the chairs), 'escape' (the crawl back in), 'DJ ... play' (the dog lets it play), 'refuse' (Compote refuses to get up), 'please' (the dog begs)",
             'experiment': "A party game everyone has played (musical chairs) as the whole structure, the song's own title as the game's rule (the DJ stops the music, with real stops cut into the audio: a record brake and a silent bar), on a 2007 club hit climbing back (Rihanna's catalogue): do the stops in the audio lift the Short's views at 24 h over the last three episodes?"},
    'shots': shots,
}
json.dump(ep, open(os.path.join(HERE, '2026-10-11-2.json'), 'w'), indent=1, ensure_ascii=False)
open(os.path.join(HERE, '..', 'out', 'check', 'dstm_rev_times.txt'), 'w').write(','.join(f'{t:.2f}' for t in REV))
print(len(shots), 'shots;', len(WARN), 'warnings')
for w in WARN: print('  ', w)
