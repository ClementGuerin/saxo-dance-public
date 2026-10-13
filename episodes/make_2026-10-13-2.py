# The "SaWaDiKa" episode (2026-10-13 2nd; LISA, 2026): writes episodes/2026-10-13-2.json.
# Kit 2026-10-13-2: 82.520 s from verse 2's first word (a pickup half a beat before its downbeat) through verse 2 (kit
# beats 0-62), pre-chorus 2 (62-96, its first line a 2-beat pickup), the last chorus (96-160) and the outro's four
# hooks (160, 168, 176, 184) to the music's dead stop (kit beat 188) and its tail (to 192.5). 140.0004 BPM, kit beat 0
# at 0.2350 s. Every 'hello' of the hook falls half a beat before its downbeat, 'sawadika' a beat after it.
# The world (the official video, contact sheets): Bangkok at dusk, a crew in black dancing on the concrete steps and
# walkways of old housing blocks, a Muay Thai ring in a car park among them with boxers training, neon tuk-tuks, the
# city's towers; LISA in a platinum bob with blunt bangs and a black leather and feather look. The words (whitelisted
# keywords per line, never the text): the hook 'hello sawadika' (the Thai greeting, made with a wai: palms pressed
# together and a bow) six times in the cut, 'bang ... bangkok' (verse 2's first line), 'up' (four times), 'step',
# 'back', 'call', 'catch', 'baby no', 'go' (on every 'sawadika go'), 'la la la'.
# The story (structure BROKEN RULE OF THREE: the same move lands three times and fails on the fourth):
#   0 (verse 2's first line, b-0.5..8): Bangkok, a car park at dusk: the dog in LISA's platinum bob and black feathers
#     leads her crew in black in front of a Muay Thai ring (the swoop over a neon tuk-tuk; 'bangkok': the skyline).
#   1 (verse 2, b8..62): the champion in the ring (Compote, the boxer, shadow-boxing for her fans), the referee (Kob,
#     deadpan); the dog dances up the steps ('up'), into the ring ('up'), paws up then the first wai to the crowd ('up');
#     the champion steps up to him ('step'), turns her back ('back'); his coach on the apron (Sadi, hearts); the champ's
#     gloves up for her fans ('up'); he dances on regardless; her glare; the referee calls them in ('call').
#   2 (pre-chorus 2, b62..96): his coach tosses him a glove ('catch'); the champion's guard up ('up'); he answers with a
#     polite wai; his coach shakes her head ('baby no'); the referee's paw up between them; the bell; she charges.
#   3 (the last chorus, b96..160): 'hello': he bows with a wai and her flying punch sails over his back into the
#     referee ('sawadika'); the referee down with stars, he waves to the crowd; the chorus dance with the crew; she gets
#     up, fuming; she runs ('go') and her flying kick sails over his bow into his coach on the apron, who falls off it;
#     he bows down to her over the ropes; behind his back the champion climbs the corner post (the look-behind-you
#     meme: he bows to us, the crowd gasps); she crouches on the turnbuckle; she leaps ('go').
#   4 (the outro, b160..188): 'hello': he bows to us and she flies over him through the ropes into the front rows,
#     who go down like pins; she climbs back in; he bows to her ('hello') and, for the first time, she lowers her gloves
#     and puts her paws together; 'hello': they both bow at once: BONK ('sawadika'); both flat on the canvas with stars;
#     the whole car park answers with a wai ('hello sawadika').
#   5 (the stop and its tail, b188..192.5): the button: from above, the two on their backs, stars circling, and the dog's
#     paws come together in a wai to us, still polite.
import json, math, os, re, sys
sys.path.insert(0, os.path.dirname(__file__))
from cam import view

HERE = os.path.dirname(__file__)
PER, B0T = 60 / 140.0004, 0.2350
def T(b): return B0T + b * PER                  # kit seconds of kit beat b
def Bt(t): return (t - B0T) / PER
def S(b, b0): return round((b - b0) * PER, 3)   # seconds from shot beat b0 to beat b

Y, H, E = 0.6, 2.2, 2.6                         # the ring (src/maps46.js RING): the canvas, the posts, the apron's edge
LOOK = {'saxo': 'lisa', 'sadi': 'tracksuit', 'kob': 'referee', 'compote': 'boxer'}
HEAD = {'saxo': 1.5, 'sadi': 1.38, 'kob': 1.47, 'compote': 1.5}
FACE = {'saxo': 0.9, 'sadi': 0.84, 'kob': 0.86, 'compote': 0.86}
RAD = {'saxo': 0.52, 'sadi': 0.45, 'kob': 0.42, 'compote': 0.42}
CHARL = 2.467
def kick_at(rv): return round((1.6 - rv) % CHARL, 3)   # charleston's kick (clip 1.6 s) on the review frame, rv s into the shot
WAI = [-0.6, 0.2, 0.77]                          # both paws pressed together in front of the chest (a straight arm each)
GUARD, JAB = [0.15, 0.55, 0.8], [0.45, 0.5, 0.75]   # gloves up before the chin; a jab out to the side of the head (straight ahead it hid under the chin)
def jabs(t0, t1, step):                          # aimSeq [s, aimL, aimR]: the guard, then a jab on alternate paws every `step` s
    seq, t, k = [[-1, GUARD, GUARD]], t0, 0
    while t < t1:
        seq += [[round(t, 3), GUARD, JAB] if k % 2 == 0 else [round(t, 3), JAB, GUARD], [round(t + step / 2, 3), GUARD, GUARD]]; t += step; k += 1
    return seq

def A(who, clip, x, z, ring=True, **o):
    a = {'who': who, 'look': o.pop('look', LOOK[who]), 'clip': clip, 'x': round(x, 3), 'z': round(z, 3), 'face': o.pop('face', 'world'),
         'yaw': round(o.pop('yaw', 0), 1), 'at': o.pop('at', 0.4), 'speed': o.pop('speed', 0.08), **o}
    if ring and 'lift' not in a: a['lift'] = Y
    return a
def yaw_to(frm, to): return round(math.degrees(math.atan2(to[0] - frm[0], to[1] - frm[1])), 1)
def bowk(at, deg=55, down=0.16, hold=None, up=0.3):
    k = [[round(at, 3), 0], [round(at + down, 3), deg]]
    if hold is not None: k += [[round(hold, 3), deg], [round(hold + up, 3), 0]]
    return k
def wai_bow(x, z, yaw, at, deg=55, hold=None, clip='happy_idle', **o):   # the dog's wai: paws together, then the bow
    return A('saxo', clip, x, z, yaw=yaw, at=o.pop('at_clip', 0.4), speed=o.pop('speed', 0.05), noLie=True, arm='both', aim=WAI, upAt=round(at - 0.25, 3), bow=bowk(at, deg, hold=hold), **o)
def dancer(x, z, yaw, rv, clip='charleston', **o):
    if clip == 'charleston': o.setdefault('at', kick_at(rv)); o.setdefault('speed', 1)
    return A('saxo', clip, x, z, yaw=yaw, **o)
def flyer(x, z, yaw, y, feet=False, **o):        # Compote in flight: superman (fist first) or feet first, held level
    base = dict(lean=-78 if feet else 85, noLie=True, air=True, noShadow=True, upAt=-1)
    if feet: base.update(arm='both', aim=[0.6, 0.3, -0.5])
    else: base.update(arm='R', aim=[0.05, 0.0, 1.0], armB='L', aimB=[0.15, -0.25, -0.95])
    return A('compote', 'happy_idle', x, z, yaw=yaw, lift=round(y, 3), at=0.4, speed=0, **{**base, **o})
def lying(who, x, z, yaw, **o):                 # flat on the back (knocked_out_falling_to_back held while lying)
    return A(who, 'knocked_out_falling_to_back', x, z, yaw=yaw, at=o.pop('at', 3.3), speed=0, ground='mesh', **o)

# ---- a projection check (numbers only): where each face lands in the 9:16 frame at the shot's start and end ----
def head_rf(cam, look, fov, pt, rad):              # a head's radius in frame widths at that distance
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
_src = open(os.path.join(HERE, '2026-10-13-2.lyrics.js')).read()
_rows = json.loads(re.search(r'window\.LYRICS = (.*?);\n', _src).group(1)); _ends = json.loads(re.search(r'window\.LINE_END = (.*?);\n', _src).group(1))
LINES = [(Bt(row[0][0] - 0.35), Bt(e)) for row, e in zip(_rows, _ends)]
def has_line(b0, b1): return any(a < b1 and b > b0 for a, b in LINES)
WARN = []
def body(a, end):
    who = a['who']; sc = a.get('scale', 1)
    x, z = a['x'] + a.get('mx', 0) * end, a['z'] + a.get('mz', 0) * end
    lift = a.get('lift', 0) + (a.get('my', 0) if end else 0)
    fy, hy = FACE[who] * sc, HEAD[who] * sc
    if a.get('clip') == 'knocked_out_falling_to_back' and a.get('at', 0) > 2.4:   # probed: the body lies 60 deg off its yaw, the head bone 0.4 m past the hips
        th = math.radians(a.get('yaw', 0) + 60); x, z = x - 0.55 * math.sin(th), z - 0.55 * math.cos(th); fy, hy = 0.32, 0.62
    elif a.get('clip') == 'knocked_down_to_stomach':
        th = math.radians(a.get('yaw', 0)); x, z = x - 0.4 * math.sin(th), z - 0.4 * math.cos(th); fy, hy = 0.4, 0.7
    elif a.get('clip') == 'laying_idle':                # on its back, the head to -z at yaw 0
        th = math.radians(a.get('yaw', 0)); x, z = x - 0.55 * math.sin(th), z - 0.55 * math.cos(th); fy, hy = 0.32, 0.62
    if abs(a.get('lean', 0)) > 45:
        ln = math.radians(a['lean']); yw = math.radians(a.get('yaw', 0)); d = 1.18 * math.sin(ln)   # probed: the head bone 1.16 m from the mark
        x, z = x + math.sin(yw) * d, z + math.cos(yw) * d; fy, hy = 0.9 * abs(math.cos(ln)) + 0.15, 0.9 * abs(math.cos(ln)) + 0.45
    elif a.get('lean'): fy, hy = fy - 0.1, hy - 0.12
    if a.get('bow'): k = a['bow'][-1 if end else 0][1]; fy -= 0.004 * k; hy -= 0.006 * k
    return (who, x, z, fy + lift, hy + lift)
def check(beat, b1, cam, look, fov, actors, end, W):
    line = has_line(beat, b1)
    for a in actors:
        if a.get('fg') or (a.get('reveal') and not end): continue
        who, x, z, fy, hy = body(a, end)
        top, face = _proj(cam, look, fov, (x, hy, z)), _proj(cam, look, fov, (x, fy, z))
        tag = ' at the end' if end else ''
        if not top or not face: W.append(f'b{beat}: {who} behind the lens{tag}'); continue
        if line and top[1] < 0.27: W.append(f'b{beat}: {who} head top at {top[1]:.2f} (lyric rows){tag}')
        if face[0] < 0.12 or face[0] > 0.88: W.append(f'b{beat}: {who} face x {face[0]:.2f} (edge){tag}')
        else:
            rf = head_rf(cam, look, fov, (x, fy, z), RAD[who] * a.get('scale', 1))
            if face[0] - 0.55 * rf < 0.0 or face[0] + 0.55 * rf > 1.0: W.append(f'b{beat}: {who} head cut by the edge ({face[0]:.2f} +- {rf:.2f}){tag}')
        if face[1] > 0.84 or face[1] < 0.0: W.append(f'b{beat}: {who} face y {face[1]:.2f}{tag}')
def lens(v, k=0):
    c, f = v; a = math.radians(c['ang'][k]); fy = f[2] if len(f) > 2 else 0
    return (f[0] + math.sin(a) * c['r'][k], c['h'][k] + fy, f[1] + math.cos(a) * c['r'][k])
def free(c):                                     # a lens stays out of the ring's platform, its posts and the bell's table
    x, y, z = c
    if abs(x) < E and abs(z) < E and y < Y + 0.1: return False
    if any(abs(x - px) < 0.25 and abs(z - pz) < 0.25 and y < Y + 1.2 for px in (-H, H) for pz in (-H, H)): return False
    return y > 0.12
POLES = [(-4.4, -4.4), (4.4, -4.4), (-4.4, 4.4), (4.4, 4.4)]   # the floodlight poles (src/maps46.js)
POSTS = [(-2.27, -2.27), (2.27, -2.27), (-2.27, 2.27), (2.27, 2.27)]   # the ring's corner posts
def problems(beat, b1, actors, v, W):
    c, focus = v; fy = focus[2] if len(focus) > 2 else 0
    for k, end in ((0, 0), (-1, 1)):
        cam, look = lens(v, k), (focus[0], c['look'][k] + fy, focus[1])
        check(beat, b1, cam, look, c['fov'], actors, end, W)
        if not free(cam): W.append(f'b{beat}: lens inside the set{" at the end" if end else ""} {tuple(round(q, 2) for q in cam)}')
        for a in actors:                          # a floodlight pole or a corner post right behind a head grows out of it
            if a.get('fg'): continue
            who, x, z, fh, hh = body(a, end); pf = _proj(cam, look, c['fov'], (x, hh, z)); dh = math.dist((cam[0], cam[2]), (x, z))
            rf = head_rf(cam, look, c['fov'], (x, hh, z), RAD[who])
            for px, pz, top in [(q[0], q[1], Y + 1.15) for q in POSTS]:     # (the floodlight poles are hidden per shot: add())
                pp = _proj(cam, look, c['fov'], (px, min(top, hh), pz))
                if pf and pp and math.dist((cam[0], cam[2]), (px, pz)) > dh + 0.3 and abs(pp[0] - pf[0]) < rf + 0.02 and top > hh - 0.35: W.append(f'b{beat}: a corner post behind {who}\'s head{" at the end" if end else ""}')
        for px, pz in POLES:                       # a floodlight pole close in front of the lens fills the frame's side
            pp = _proj(cam, look, c['fov'], (px, 1.6, pz))
            if pp and -0.15 < pp[0] < 1.15 and math.dist((cam[0], cam[2]), (px, pz)) < 3.0: W.append(f'b{beat}: a floodlight pole in front of the lens{" at the end" if end else ""}')
        for px, pz in POSTS:                       # a corner post (and its pad) close to the lens fills half the frame (S47's first lens)
            pp = _proj(cam, look, c['fov'], (px, Y + 0.6, pz))
            if pp and -0.1 < pp[0] < 1.1 and math.dist((cam[0], cam[2]), (px, pz)) < 2.5: W.append(f'b{beat}: a corner post in front of the lens{" at the end" if end else ""}')
        for a in actors:
            if a.get('fg') or a.get('lean'): continue
            who, x, z, fh, _ = body(a, end)
            if math.dist(cam, (x, fh, z)) < 1.9: W.append(f'b{beat}: lens {math.dist(cam, (x, fh, z)):.2f} m from {who}{" at the end" if end else ""}')
    return W
# the crowd and the front rows are map objects: clear the ones near a lens outside the ring
CROWD_R = 1.0
def clear_for(v):
    out = []
    for k in (0, -1):
        x, y, z = lens(v, k)
        if abs(x) > E or abs(z) > E: out.append([round(x, 2), round(z, 2), CROWD_R])
    return out or None

def V(p0, l, fov=50, p1=None, **o): return ('V', p0, l, fov, p1, o)
def place(spec, dl=0.0, dk=1.0, da=0.0, dh=0.0):
    _, p0, l, fov, p1, o = spec
    L = (l[0], l[1] + dl, l[2])
    def tr(p):
        dx, dz = p[0] - l[0], p[2] - l[2]; a = math.radians(da); c, s_ = math.cos(a), math.sin(a)
        return (round(l[0] + (dx * c + dz * s_) * dk, 3), round(p[1] + dl + dh, 3), round(l[2] + (-dx * s_ + dz * c) * dk, 3))
    return view(tr(p0), L, fov, p1=tr(p1) if p1 else None, **o)
SOLVED = {}
FREEZE = {-0.5: (0, 1.0, -8, 0), 1: (0, 1.0, -16, 0), 4: (0, 1.0, -16, 0), 8: (0, 1.0, 0, 0), 12: (0, 1.0, 0, 0), 16: (0.42, 1.0, 0, 0), 24.5: (0, 1.0, 0, 0), 28: (0, 1.1, 0, 0),
          31: (0, 1.35, 0, 0), 34.5: (0, 1.35, -16, 0), 39: (0, 1.0, 0, 0), 47: (0.3, 1.0, 0, 0), 55.5: (0.1, 1.0, 0, 0), 58: (0.2, 1.0, 0, 0), 66: (0, 1.0, 0, 0),
          70: (0, 1.0, 0, -0.15), 74: (0.1, 1.0, 0, 0), 82: (0, 1.22, 0, 0), 91: (0, 1.5, 0, 0), 95.5: (0, 1.5, -8, 0), 103: (0, 1.0, 0, 0), 111: (0.3, 1.0, 0, 0),
          115: (0, 1.22, 0, 0), 119: (0.42, 1.0, -8, 0), 123: (0.55, 1.35, 0, 0), 135: (0, 1.0, 0, 0), 139: (0.3, 1.1, 0, 0), 147: (0, 1.0, -8, 0), 151: (0.1, 1.1, 0, 0),
          155: (0.55, 1.0, 0, 0), 161.25: (0, 1.22, -8, -0.15), 167.25: (0.1, 1.1, 0, 0), 97: (0, 1.0, 8, 0),
          18.5: (0, 1.0, 0, 0.15), 42.5: (0, 1.0, 0, 0), 77.6: (0, 1.0, 0, 0), 107: (0, 1.0, 0, 0), 127.5: (0, 1.0, 0, 0), 130: (0.2, 1.0, 0, 0),
          159.4: (0, 1.0, 0, 0), 178.5: (0.55, 1.35, 0, 0.15), 183.5: (0.2, 1.0, 0, 0)}   # (round 3's passes; b18.5 is b20's placement on its longer shot)   # (b16 and b111 failed on a pole and a dark step only: fixed in the map and by tidy())
def fit(spec, beat, b1, actors):
    best = None
    for dl in (0, 0.1, 0.2, 0.3, 0.42, 0.55):
        for dk in (1.0, 1.1, 1.22, 1.35, 1.5, 0.92):
            for da in (0, -8, 8, -16, 16):
                for dh in (0, 0.15, -0.15):
                    v = place(spec, dl, dk, da, dh)
                    n = len(problems(beat, b1, actors, v, []))
                    score = n * 1000 + dl * 30 + abs(dk - 1) * 40 + abs(da) + abs(dh) * 20
                    if best is None or score < best[0]: best = (score, v, (dl, dk, da, dh))
                    if n == 0 and score < 1: SOLVED[beat] = (0, 1.0, 0, 0); return v
    SOLVED[beat] = best[2]
    return best[1]
# the map's box pets (src/maps46.js): the crowd's spots, the front row, the crew's rows
def crowd_spots():
    out = []
    for side, n in (('w', 7), ('e', 7), ('n', 6)):
        for r in range(2):
            for j in range(n - r):
                u = ((j + 0.5 + r * 0.5) / n - 0.5) * 4.6; d = E + 0.75 + r * 0.8
                if side == 'w':
                    if 0.6 < u < 2.1: continue
                    out.append((-d, u))
                elif side == 'e': out.append((d, u))
                else: out.append((u, -d))
    return out + [(-3.7, 3.6), (3.9, 3.1), (-4.5, 2.95)]
CROWD = crowd_spots()
FRONT = [(-1.7, 3.45), (-0.9, 3.5), (-0.1, 3.45), (0.7, 3.5), (-1.3, 4.25), (-0.5, 4.3), (0.3, 4.25)]
def crew_spots(o):
    if not o.get('crew'): return []
    ccx, ccz, cyaw = (o.get('crewAt') or [0, 5.4, 0]) + [0] * (3 - len(o.get('crewAt') or [0, 5.4, 0])); cy = math.radians(cyaw); g = o.get('crewGap', 0.95); out = []
    for i in range(8):
        r, j = i // 4, i % 4; lx = (j - 1.5) * g + (g / 2 if r else 0); lz = -r * 0.9
        out.append((ccx + lx * math.cos(cy) + lz * math.sin(cy), ccz - lx * math.sin(cy) + lz * math.cos(cy)))
    return out
def tidy(v, actors, o):                             # poles to hide and pets to clear: anything that lands on a head, at the start or the end
    c, focus = v; fy0 = focus[2] if len(focus) > 2 else 0; poles, clear = set(), []
    pets = [] if o.get('noguests') or o.pop('keepPets', False) else CROWD + (FRONT if o.get('front') else [])   # keepPets: the crowd behind a bow stays (it bows too)
    pets = pets + crew_spots(o)
    for k, end in ((0, 0), (-1, 1)):
        cam, look = lens(v, k), (focus[0], c['look'][k] + fy0, focus[1])
        for a in actors:
            if a.get('fg'): continue
            who, x, z, fh, hh = body(a, end); pf = _proj(cam, look, c['fov'], (x, (fh + hh) / 2, z))
            if not pf: continue
            rf = head_rf(cam, look, c['fov'], (x, fh, z), RAD[who] * a.get('scale', 1))
            for i, (px, pz) in enumerate(POLES):
                pp = _proj(cam, look, c['fov'], (px, 2.0, pz))
                if pp and abs(pp[0] - pf[0]) < rf + 0.05: poles.add(i)
            for px, pz in pets:
                pp = _proj(cam, look, c['fov'], (px, 0.95, pz))
                if not pp: continue
                pr = head_rf(cam, look, c['fov'], (px, 0.95, pz), 0.3)
                if math.hypot(pp[0] - pf[0], (pp[1] - pf[1]) * 16 / 9) < rf + pr and [round(px, 2), round(pz, 2), 0.3] not in clear: clear.append([round(px, 2), round(pz, 2), 0.3])
    return sorted(poles), clear
shots = []; REV = []
def add(beat, b1, actors, lyric, v, rv=None, **o):
    if v[0] == 'V': v = place(v, *FREEZE[beat]) if beat in FREEZE else fit(v, beat, b1, actors)
    c, focus = v
    o = {k: val for k, val in o.items() if val is not None}
    hide = set(o.pop('ropeHide', []))
    for k in (0, -1):
        x, y, z = lens(v, k)
        if z > H - 0.3: hide.add('s')
        if z < -H + 0.3: hide.add('n')
        if x > H - 0.3: hide.add('e')
        if x < -H + 0.3: hide.add('w')
    if hide: o['ropeHide'] = sorted(hide)
    ph, extra = tidy(v, actors, o)
    if ph: o['poleHide'] = ph
    cl = (clear_for(v) or []) + o.pop('clear', []) + extra
    if cl: o['clear'] = cl
    t0 = 0 if not shots else T(beat)
    REV.append(round(t0 + (rv if rv is not None else 0.6 * (T(b1) - t0)), 2))
    shots.append({'beat': beat, 'kind': 'dance', 'map': 'muaythai', 'actors': actors, 'lyric': lyric, 'cam': c, 'focus': focus, **o})
    problems(beat, b1, actors, v, WARN)

# marks
D0 = (-0.75, 0.3); C0 = (0.75, 0.3)            # the face-off: the dog on the left facing +x, the champion on the right
KOB_BACK = (0.15, -1.35)                         # the referee behind them, facing the lens
SADI_AP = (-2.42, 1.1)                           # the coach on the apron at the dog's (blue) corner, by the steps, facing +x
RED_TOP = (1.98, -1.98)                          # the champion on the red corner's turnbuckle
TOP_Y = Y + 1.08
FRONT_HIT = (-0.55, 3.75)                        # where she lands in the front rows
SADI_K = (-2.42, 0.45)                           # his coach along the apron for the flying kick (at the corner the blue post hid her)

# =====================================================================================================================
# S00 (b-0.5..4; 'bang ... bangkok ... bang'): the hook: a swoop over a neon tuk-tuk down to the dog in LISA's look
# dancing the charleston at the front of her crew in black, the ring, the blocks and the city's towers behind
s00 = [dancer(0.0, 6.55, 0, S(1.6, -0.5), ring=False)]
v = V((1.35, 2.55, 13.4), (0.0, 1.05, 6.55), fov=62, p1=(0.35, 0.34, 8.45), ease='out', roll=(0, -10), hand=0.15)
s00c = [wai_bow(-0.5, 0.3, 90, 0.0, deg=58), flyer(1.0, 0.3, -90, Y + 0.95, mx=-1.6)]   # (S22's actors, below)
add(-0.5, 1, s00c, "the cold open: he bows with a wai and her flying punch sails over his back (the first dodge, seen first)",
    place(V((-0.15, 1.45, 4.6), (-0.3, 1.3, 0.3), fov=50), 0, 1.5, -8, 0), ringside='gasp', rv=0.2)   # (S22's passed lens; the tuk-tuk swoop it replaced passed too, but the critic: the gag must be in frame 1)
# S01 (b4..8): a low dutch dolly-in on the dog and the crew dancing, the ring behind them
s01 = [dancer(0.0, 6.55, 0, S(6.0, 1), ring=False)]
v = V((0.95, 0.24, 9.0), (0.1, 1.0, 6.4), fov=62, p1=(0.75, 0.24, 8.45), roll=(-9, -6), hand=0.3)
add(1, 8, s01, "a white flash, then a low dutch dolly-in on the dog and the crew dancing, the ring behind them", v,
    crew='dance', crewAt=[0, 5.6, 0], ringside='cheer', key=[0.4, 2.4, 9.2, 1.25, 1.05, 1.15], flashAt=[0], rv=S(6.0, 1))
# S02 (b8..12): the champion: Compote shadow-boxing in the ring, guard up, a jab on every half beat, bouncing
s02 = [A('compote', 'happy_idle', 0.2, -0.5, yaw=8, at=0.4, speed=0.05, arm='both', upAt=-1, aimSeq=jabs(0.1, 1.8, PER), hop=[0.05, 0.5])]
v = V((0.45, 1.65, 2.4), (0.2, 1.6, -0.5), fov=50, p1=(0.4, 1.65, 2.2), roll=(6, 4))
add(8, 12, s02, "the champion: Compote in red gloves shadow-boxing in the ring, guard up and jabbing, her fans cheering behind", v, ringside='cheer', rv=round(0.1 + 2 * PER + 0.09, 3))
# S03 (b12..16): the referee: Kob, deadpan, frontal and locked off (3 m: closer, her bow tie sat in the bottom fifth)
s03 = [A('kob', 'happy_idle', -0.3, -1.1, yaw=0, at=0.5, speed=0.04)]
v = V((-0.28, 1.7, 1.95), (-0.3, 1.65, -1.1), fov=40, p1=(-0.28, 1.7, 1.68), ease='lin')
add(12, 18.5, s03, "the referee: Kob in her blue shirt and bow tie, deadpan", v, ringside='watch', rv=S(14, 12))
# S04 (b16..20; 'up'): the dog dances up the ring steps on the word, side on (the lens right of the floodlight pole)
s04 = [dancer(-3.75, 1.3, 90, S(17.2, 16), ring=False, mx=1.25, my=Y, myAt=S(16.6, 16), myDur=0.42, lift=0.0)]
v = V((-2.2, 1.3, 5.0), (-3.1, 1.05, 1.3), fov=50, p1=(-2.2, 1.3, 4.75))
# (FALLBACK after three review rounds: the steps never read, as a dark slab, beside him, or a block in front of him; dropped)
# S05 (b20..24.5; 'up'): inside the ring, the crowd's paws go up as he dances in (the back block behind him, no tuk-tuk)
s05 = [dancer(-1.9, 1.233, 60, S(21.6, 18.5), mx=1.2, mz=-0.533, reveal=0.75)]   # (b20's path from -1.6, 1.1 at the same pace, begun 1.5 beats earlier)
v = V((-0.95, 1.05, 4.4), (-1.05, 1.4, 0.0), fov=52, p1=(-0.95, 1.05, 4.15))
add(18.5, 24.5, s05, "'up': he dances into the ring and the crowd's paws go up", v, ringside='cheer', ropeHide=['n'], rv=S(21.6, 18.5))
# S06 (b24.5..28; 'up'): paws up to the crowd, frontal (the pinned rave swing reads only from the front)
s06 = [A('saxo', 'happy_idle', -0.1, 0.45, yaw=0, at=0.4, speed=0.05, arm='both', upAt=-1, aim='rave', flapEvery=1000, flapPh=90)]
v = V((0.2, 1.65, 3.7), (0.0, 1.55, 0.45), fov=50)
add(24.5, 28, s06, "'up': paws up to the crowd", v, ringside='cheer', rv=S(26.9, 24.5))
# S06b (b28..31): his first wai: a slow deep bow to the crowd on the right, side on; the crowd bows back (the plant)
s06b = [wai_bow(0.3, 0.45, 90, S(28.6, 28), deg=50, hold=S(30.6, 28))]
v = V((0.75, 1.6, 4.3), (1.1, 1.4, 0.45), fov=50)
add(28, 31, s06b, "his first wai: a slow deep bow to the crowd, side on; the crowd bows back", v, ringside='wai', rv=S(29.6, 28))
# S07 (b31..34.5; 'step'): the champion steps right up to him, nose to nose, both gloves up
s07 = [A('saxo', 'happy_idle', -0.55, 0.3, yaw=90, at=0.4, speed=0.05), A('compote', 'happy_run', 1.7, 0.3, yaw=-90, at=0.2, speed=0.9, mx=-1.3, arm='both', aim=GUARD, upAt=-1, reveal=0.9)]
v = V((0.25, 1.5, 3.7), (0.25, 1.4, 0.3), fov=48)
add(31, 34.5, s07, "'step': the champion steps right up to him, nose to nose, both gloves up", v, ringside='watch', rv=S(33.8, 31))
# S08 (b34.5..39; 'back'): she turns her back and stomps off to her red corner; he bows to her back, politely
s08 = [wai_bow(*D0, 90, S(36.4, 34.5), deg=32, hold=S(38.4, 34.5)), A('compote', 'happy_run', 0.9, 0.2, yaw=130, at=0.1, speed=0.8, mx=0.85, mz=-0.75)]
v = V((0.0, 1.42, 4.5), (0.15, 1.2, 0.1), fov=48)
add(34.5, 39, s08, "'back': she turns her back and stomps off to her corner; he bows to her back", v, ringside='watch', rv=S(37.2, 34.5))
# S09 (b39..42.5): his coach: Sadi on the apron at his corner, clapping
s09 = [A('sadi', 'clap_while_standing', *SADI_AP, yaw=105, at=0.1, speed=1)]
v = V((-0.2, 1.75, 2.1), (-2.42, 1.6, 1.1), fov=44, p1=(-0.3, 1.74, 2.0))
add(39, 42.5, s09, "his coach: Sadi in her pink tracksuit on the apron, clapping for him", v, ropeHide=['w'], ringside='cheer', rv=S(41, 39))
# S10 (b42.5..47; 'up'): the champion out of her corner pumps her gloves up for her fans (off the corner's diagonal: its post grew out of her ears)
C_CORNER = (1.55, -1.1)
s10 = [A('compote', 'happy_idle', *C_CORNER, yaw=yaw_to(C_CORNER, (1.8, 1.6)), at=0.4, speed=0.05, arm='both', aim='rave', upAt=-1)]
v = V((1.8, 1.5, 1.6), (1.55, 1.6, -1.1), fov=50, p1=(1.78, 1.5, 1.45), roll=(-6, -4))
add(42.5, 47, s10, "'up': the champion pumps her gloves up for her fans", v, ringside='cheer', rv=S(46.2, 42.5))
# S11 (b47..55.5; the YouTube Short opens 1.6 beats before its end): the dog dances on regardless, the crowd dancing along
s11 = [dancer(-1.2, 1.0, 15, S(50.5, 47))]
v = V((-0.6, 0.95, 3.9), (-1.2, 1.2, 0.8), fov=58, p1=(-0.7, 0.95, 3.6), roll=(8, 5), hand=0.3)
add(47, 55.5, s11, "he dances on regardless, the crowd dancing along", v, ringside='dance', rv=S(50.5, 47))
# S12 (b55.5..58): her glare: a deadpan close on the champion, gloves together, facing us
s12 = [A('compote', 'happy_idle', *C_CORNER, yaw=yaw_to(C_CORNER, (-0.5, 0.7)), at=0.4, speed=0.04, arm='both', aim=[-0.45, 0.15, 0.88], upAt=-1)]
v = V((-0.5, 1.7, 0.7), (1.55, 1.65, -1.1), fov=40, p1=(-0.4, 1.7, 0.6), ease='lin')
add(55.5, 58, s12, "her glare: a deadpan close on the champion, gloves together", v, ringside='watch', rv=S(56.8, 55.5))
# S13 (b58..60.5; 'call'): the referee calls them to the centre, a paw raised by her head
s13 = [A('kob', 'happy_idle', 0.0, -0.4, yaw=0, at=0.4, speed=0.05, arm='R', aim=[0.5, 0.75, 0.3], upAt=S(59.9, 58))]
v = V((0.05, 1.5, 2.3), (0.0, 1.38, -0.4), fov=46)
add(58, 64, s13, "'call': the referee calls them to the centre, a paw raised by her head", v, ringside='watch', rv=S(60.4, 58))
# S14 (b60.5..66; 'catch'): his coach tosses him a glove from the apron and he catches it on the word in his near paw
# (the far paw raised hid the glove behind his wig)
CATCH = S(61.97, 60.5)
PAW = [-0.9, 1.22, 1.46]                         # (probed: the near paw at the catch, held out at chest height)
s14 = [A('sadi', 'goalie_overhand_throw', *SADI_AP, yaw=90, at=round(1.7 - (CATCH - 0.45), 3), speed=1, hold='glove', holdScale=1.2,
         toss={'at': round(CATCH - 0.45, 3), 'to': PAW, 'dur': 0.45, 'arc': 0.35, 'scale': 1.4}),
       A('saxo', 'happy_idle', -1.0, 1.0, yaw=-60, at=0.4, speed=0.05, arm='L', upAt=-1, aimSeq=[[-1, [0.35, -0.75, 0.3]], [round(CATCH - 0.12, 3), [0.75, 0.3, 0.5]]], holdL='glove', holdFrom=CATCH, holdScale=1.2)]
v = V((-0.1, 1.6, 3.9), (-1.5, 1.45, 1.05), fov=50, p1=(-0.15, 1.6, 3.7))
# (FALLBACK after three review rounds: the catch never read, a glove on his cheek, then a red cushion on his chest; dropped)
# S15 (b66..70): the champion warms up, glaring at us, a low dutch close
s15 = [A('compote', 'boxing_warm_up_exercise', *C_CORNER, yaw=yaw_to(C_CORNER, (-0.6, 0.4)), at=round(1.0 - S(66, 64), 3), speed=1)]   # (begun 2 beats early, the clip set back to match)
v = V((-0.6, 1.35, 0.4), (1.55, 1.6, -1.1), fov=50, p1=(-0.5, 1.35, 0.3), roll=(-8, -10))
add(64, 70, s15, "the champion warms up, glaring, a low dutch close", v, ringside='watch', rv=S(68, 64))
# S16 (b70..74; 'up'): her guard up on the word, gloves before her chin: frontal, low
s16 = [A('compote', 'happy_idle', 0.85, 0.2, yaw=-90, at=0.4, speed=0.05, arm='both', aim=[0.15, 0.55, 0.8], upAt=-0.2)]
v = V((-1.45, 1.3, 0.55), (0.85, 1.6, 0.2), fov=50, p1=(-1.3, 1.3, 0.5), roll=(5, 3))
add(70, 74, s16, "'up': her guard up on the word, both gloves before her chin", v, ringside='watch', rv=S(71, 70))
# S17 (b74..77.6): across from her he answers with a polite wai; side on, the two and the referee
s17 = [wai_bow(*D0, 90, S(75.0, 74), deg=38, hold=S(77.0, 74)), A('compote', 'happy_idle', *C0, yaw=-90, at=0.4, speed=0.05, arm='both', aim=[0.15, 0.55, 0.8], upAt=-1),
       A('kob', 'happy_idle', *KOB_BACK, yaw=0, at=0.6, speed=0.04)]
v = V((0.05, 1.4, 4.4), (0.0, 1.2, 0.3), fov=48)
add(74, 77.6, s17, "across from her guard he answers with a polite wai", v, ringside='watch', ropeHide=['s'], rv=S(75.8, 74))
# S18 (b77.6..82; 'baby no'): his coach says no: her head shaking, a paw wagging
WAG = [[-1, [0.9, 0.5, 0.25]]] + [[round(0.15 + 0.18 * k, 3), [0.6, 0.55, 0.55] if k % 2 == 0 else [0.9, 0.5, 0.25]] for k in range(12)]
s18 = [A('sadi', 'shaking_head_no_dismissively', *SADI_AP, yaw=100, at=round((0.5 - S(79.94, 77.6)) % 1.8, 3), speed=1, arm='both', aim=[0.32, 0.5, 0.65], upAt=-1)]   # paws to her cheeks, in front of her ears (crossed or folded they ended at her muzzle)
v = V((-0.15, 1.72, 2.0), (-2.42, 1.62, 1.1), fov=44)
add(77.6, 82, s18, "'baby no': his coach, paws to her cheeks, shaking her head: oh no", v, ropeHide=['w'], ringside='watch', clear=[[-3.4, 1.1, 0.9], [-3.6, 0.2, 0.7]], rv=S(80.1, 77.6))
# S19 (b82..87): the face-off: the referee between them, her paw up
s19 = [A('saxo', 'happy_idle', -0.85, 0.2, yaw=90, at=0.4, speed=0.05), A('compote', 'happy_idle', 0.85, 0.2, yaw=-90, at=0.4, speed=0.05, arm='both', aim=[0.15, 0.55, 0.8], upAt=-1),
       A('kob', 'happy_idle', 0.0, -0.55, yaw=0, at=0.4, speed=0.05, arm='R', aim=[0.35, 0.9, 0.2], upAt=-1)]
v = V((0.0, 1.45, 4.3), (0.0, 1.25, 0.0), fov=50, p1=(0.0, 1.45, 4.05))
add(82, 87, s19, "the face-off: the referee between them, her paw up", v, ringside='stare', stare=[0, 0], ropeHide=['s'], rv=S(84, 82))
# S20 (b87..91): the bell: the timekeeper brings his mallet down on it and it rings out, side on from the east (the swing is in
# the bell's y-z plane: from the front the mallet hit its far side; a cone on a post read as a lamp, now a lathe of a bell's profile)
s20 = [A('saxo', 'happy_idle', -0.85, 0.2, yaw=90, at=0.4, speed=0.05, fg=True), A('compote', 'happy_idle', 0.85, 0.2, yaw=-90, at=0.4, speed=0.05, fg=True)]
v = view((5.5, 1.3, 2.97), (3.15, 1.15, 2.97), fov=50)
add(87, 91, s20, "the bell: the timekeeper's mallet comes down on it and it rings out", v, bell=S(87.6, 87), bellYaw=90, ringside='watch', clear=[[3.9, 3.1, 0.6]], rv=round(S(87.6, 87) + 0.32, 3))
# S21 (b91..95.5): she charges across the ring, side on, fist cocked behind her head; he waits, smiling
s21 = [A('saxo', 'happy_idle', -0.55, 0.3, yaw=90, at=0.4, speed=0.05), A('compote', 'happy_run', 1.6, 0.3, yaw=-90, at=0.0, speed=1.1, mx=-0.75, arm='both', upAt=-1, aimSeq=[[-1, [0.2, 0.3, 0.85], [0.5, 0.65, -0.35]]])]
v = V((0.45, 1.4, 4.4), (0.45, 1.2, 0.3), fov=50, p1=(0.3, 1.4, 4.2))
add(91, 95.5, s21, "the bell: she charges across the ring at him, fist cocked; he waits, smiling", v, ringside='cheer', rv=S(94, 91))
# S22 (b95.5..97; 'hello'): DODGE 1: on 'hello' he bows with a wai and her flying punch sails over his back
# (a body held level by lean sits along the lean from its mark: toe 0.57 m, hips 0.8, head 1.16, probed)
s22 = [wai_bow(-0.5, 0.3, 90, 0.0, deg=58), flyer(1.0, 0.3, -90, Y + 0.95, mx=-1.6)]
v = V((-0.15, 1.45, 4.6), (-0.3, 1.3, 0.3), fov=50)
add(95.5, 97, s22, "'hello': he bows with a wai and her flying punch sails over his back", v, ringside='gasp', rv=0.2)
# S23 (b97..99; 'sawadika'): into the referee: her fist lands on Kob's face and they go down together
# (from (-2.0, 4.4) the blue corner post filled the left of the frame and the falling referee showed her back: the lens moves
# east, off the post's line, and she is turned 30 deg towards it so the fist meets her face in profile; the punch is the
# champion's left, on the lens's side: her right hid behind her own head)
s23 = [flyer(0.16, 0.3, -90, Y + 0.55, mx=-0.35, arm='L', armB='R'), A('kob', 'knocked_out_falling_to_back', -1.75, 0.3, yaw=60, at=1.25, speed=1.4, ground='mesh')]
v = V((-0.6, 1.45, 4.5), (-1.35, 1.2, 0.3), fov=52)
add(97, 99, s23, "'sawadika': her fist lands on the referee's face and they go down together", v, ringside='gasp', rv=0.25)
# S24 (b99..103): from above on their feet's side: the referee flat with stars, the champion face down beside her; he waves to the crowd
s24 = [lying('kob', -1.5, 0.8, -60, dizzy=True, dizzyR=0.6), A('compote', 'knocked_down_to_stomach', -0.55, 0.8, yaw=0, at=2.6, speed=0, ground='mesh'),
       A('saxo', 'happy_idle', 0.1, -1.0, yaw=0, at=0.4, speed=0.05, arm='R', aim=[0.8, 0.55, 0.25], wave=0.2, waveRate=9, upAt=-1)]
v = place(V((-0.7, 3.6, 3.6), (-0.7, 0.9, -0.15), fov=56, p1=(-0.7, 3.5, 3.45)), 0, 1.5, 10, 0)   # (the dog off to the side of her ears; her face is down, so no stars on her: they sat on his muzzle)
add(99, 103, s24, "from above their feet: the referee flat with stars, the champion face down; behind them he waves to the crowd", v, ringside='gasp', rv=S(101, 99))
# S25 (b103..107): the chorus dance: him in the ring, the crew dancing in front of it (a lens high enough to see over them)
s25 = [dancer(-0.2, 0.6, 0, S(105.4, 103))]
v = V((0.45, 2.3, 8.0), (-0.2, 1.6, 1.0), fov=50, p1=(0.4, 2.25, 7.6))
add(103, 107, s25, "the chorus dance: him in the ring, the crew dancing in front of it", v, crew='dance', crewAt=[0, 4.6, 0], ringside='dance', key=[0.0, 2.6, 6.5, 1.1, 1.0, 1.1], rv=S(105.4, 103))
# S26 (b107..111): the champion back on her feet, fuming; the referee still seeing stars beside her
s26 = [A('compote', 'happy_idle', 0.45, -0.2, yaw=-6, at=0.4, speed=0.05, arm='both', upAt=-1, aimSeq=jabs(0.1, 1.8, PER)),
       A('kob', 'happy_idle', -0.65, -0.45, yaw=10, at=0.4, speed=0.05, dizzy=True, sway=7, swayEvery=1)]
v = V((-0.05, 1.45, 4.1), (-0.1, 1.3, -0.3), fov=50, roll=(4, 2))
add(107, 111, s26, "the champion back on her feet, fuming; the referee still seeing stars beside her", v, ringside='stare', stare=[0, 0], rv=S(109, 107))
# S27 (b111..115): he dances on, his coach cheering on the apron behind him
s27 = [dancer(-1.15, 0.85, 35, S(113, 111)), A('sadi', 'clap_while_standing', *SADI_AP, yaw=90, at=0.2, speed=1)]
v = V((0.6, 1.2, 2.85), (-1.5, 1.25, 1.0), fov=54, p1=(0.4, 1.2, 2.7), roll=(-5, -3))
add(111, 115, s27, "he dances on; his coach cheers him on from the apron", v, ropeHide=['w'], ringside='cheer', rv=S(113, 111))
# S28 (b115..119; 'la'): wide: the whole car park dances on the 'la la la'; the champion paces in her corner
s28 = [dancer(-0.5, 0.5, 0, S(117, 115)), A('compote', 'happy_run', 1.5, -1.2, yaw=200, at=0.0, speed=0.7, mx=0.3, mz=0.6)]
v = V((3.4, 2.6, 6.8), (0.2, 1.1, 0.0), fov=52, p1=(3.2, 2.5, 6.5))
add(115, 119, s28, "'la la la': the whole car park dances; the champion paces in her corner", v, ringside='dance', crew='dance', crewAt=[0, 4.3, 0], ropeHide=['s', 'e'], rv=S(117, 115))
# S29 (b119..123; 'la'): a low orbit on him dancing
s29 = [dancer(-0.6, 0.4, 25, S(121, 119))]
v = V((0.9, 0.55, 2.4), (-0.4, 1.0, 0.3), fov=60, p1=(1.4, 0.55, 1.9), ease='lin', roll=(6, -4), hand=1.0)
add(119, 123, s29, "'la la la': a low orbit on him dancing", v, ringside='dance', rv=S(121, 119))
# S30 (b123..127.5; 'sawadika go'): her run-up: crouched in her corner, she runs on 'go' and takes off
GO2 = S(126.21, 123)
s30 = [A('compote', 'happy_run', 1.75, 0.3, yaw=-90, at=0.1, speed=1.2, mx=-1.1, moveAt=round(GO2, 3), my=0.55, myAt=round(GO2 + 0.42, 3), myDur=0.4, air=True)]
v = V((0.95, 1.35, 3.9), (0.95, 1.2, 0.3), fov=48)
add(123, 127.5, s30, "'sawadika go': she runs on 'go' and takes off", v, ringside='gasp', ropeHide=['s'], rv=round(GO2 + 0.5, 2))
# S31 (b127.5..129; 'hello'): DODGE 2: he bows to her and her flying kick sails over him at his coach on the apron
s31 = [wai_bow(-1.05, 0.45, 90, 0.0, deg=58), flyer(-0.6, 0.45, -90, Y + 1.0, feet=True, mx=-2.33, reveal=0.2), A('sadi', 'happy_idle', *SADI_K, yaw=90, at=0.4, speed=0.05)]   # (mx at b129's pace over the shot run on to b130: her toes reach the coach's face as it ends)
v = V((-0.75, 2.0, 5.6), (-1.5, 1.6, 0.45), fov=52)
add(127.5, 130, s31, "'hello': he bows to her and her flying kick sails over him at his coach on the apron", v, ropeHide=['w'], ringside='gasp', rv=0.5)
# S32 (b129..131; 'sawadika'): her feet land on his coach's face, who goes off the apron backwards (the feet-first toe
# sits 0.55 m behind her mark: probed; the still on the contact, before the fall carries the coach away)
# (FALLBACK after three review rounds: the fall off the apron never read, the corner pad and post at the lens, her back to us;
# cut: the kick heading for her, then her flat on the car park)
# S33 (b131..135): low from the car park: his coach flat with stars in front; over the ropes he bows down to her, his face to us
s33 = [lying('sadi', -3.3, 0.6, -60, ring=False, lift=0.0, dizzy=True, dizzyR=0.72), wai_bow(-1.95, 0.25, yaw_to((-1.95, 0.25), (-3.3, 0.05)), S(132, 130), deg=55, hold=S(134.5, 130))]   # (begun a beat early, its timings kept)
v = V((-3.6, 2.7, 4.6), (-2.6, 0.95, 0.3), fov=52)
add(130, 135, s33, "his coach flat on the car park with stars; over the ropes he bows down to her", v, ringside='gasp', clear=[[-3.35, 0.45, 0.75], [-4.15, 0.45, 0.6], [-3.35, -0.66, 0.35], [-4.15, -0.33, 0.35], [-3.75, -1.0, 1.25]], rv=S(133, 130))
# S34 (b135..139): the referee back up, deadpan, stars still circling (3 m)
s34 = [A('kob', 'happy_idle', 0.25, -1.2, yaw=0, at=0.5, speed=0.04, dizzy=True)]
v = V((0.27, 1.7, 1.8), (0.25, 1.65, -1.2), fov=40, p1=(0.27, 1.7, 1.67), ease='lin')
add(135, 139, s34, "the referee back up, deadpan, stars still circling her head", v, ringside='watch', rv=S(137, 135))
# S35 (b139..143): look behind you: he bows to us in the middle of the ring; behind him she climbs the corner post
s35 = [wai_bow(0.0, 0.55, 0, S(139.6, 139), deg=40, hold=S(142.5, 139)), A('compote', 'happy_idle', *RED_TOP, yaw=-135, lift=TOP_Y, at=0.4, speed=0.05, arm='both', aim=[0.2, 0.6, 0.75], upAt=-1)]
v = V((0.35, 1.55, 3.55), (0.65, 1.55, -0.5), fov=52)
add(139, 143, s35, "look behind you: he bows to us in the middle of the ring while she climbs the corner post behind him", v, ringside='gasp', stare=list(RED_TOP), ropeHide=['s'], rv=S(141, 139))
# S36 (b143..147): the crowd gasps at the post, paws at their cheeks: the left side's crowd, the ropes off, at their height
s36 = [A('compote', 'happy_idle', *RED_TOP, yaw=-135, lift=TOP_Y, at=0.4, speed=0.05, arm='both', aim=[0.2, 0.6, 0.75], upAt=-1, fg=True)]
v = view((-1.15, 1.2, 0.35), (-3.7, 1.0, -0.1), fov=50)
add(143, 147, s36, "the crowd gasps at the post, paws at their cheeks", v, ropeHide=['w'], ringside='gasp', stare=list(RED_TOP), rv=S(145, 143))
# S37 (b147..151): she crouches on the turnbuckle, looming against the sky: a low lens below her
s37 = [A('compote', 'happy_idle', *RED_TOP, yaw=-135, lift=TOP_Y, at=0.4, speed=0.05, lean=14, arm='both', aim=[0.2, 0.5, 0.8], upAt=-1)]
v = V((0.45, 1.0, -0.45), (1.98, 2.55, -1.98), fov=58, roll=(-10, -12))
add(147, 151, s37, "she crouches on the turnbuckle, looming against the sky", v, ringside='gasp', stare=list(RED_TOP), rv=S(149, 147))
# S38 (b151..155; 'la'): he dances on the 'la la la', oblivious, while she looms on the post behind him
s38 = [dancer(0.0, 0.55, 0, S(153, 151)), A('compote', 'happy_idle', *RED_TOP, yaw=-135, lift=TOP_Y, at=0.4, speed=0.05, lean=14, arm='both', aim=[0.2, 0.5, 0.8], upAt=-1)]
v = V((0.45, 1.65, 4.6), (0.55, 1.5, -0.6), fov=52, p1=(0.45, 1.6, 4.35))
add(151, 155, s38, "'la la la': he dances on, oblivious, while she looms on the post behind him", v, ringside='gasp', stare=list(RED_TOP), ropeHide=['s'], rv=S(153, 151))
# S39 (b155..159.4; 'sawadika go'): she leaps off the post on 'go'
GO3 = S(158.31, 155)
s39 = [A('compote', 'happy_idle', *RED_TOP, yaw=-135, lift=TOP_Y, at=0.4, speed=0.05, lean=14, arm='both', aim=[0.2, 0.5, 0.8], upAt=-1,
         my=0.5, myAt=round(GO3, 3), myDur=0.5, mx=-0.35, mz=0.35, moveAt=round(GO3, 3), air=True)]
v = V((0.2, 1.1, 0.8), (1.95, 2.3, -1.95), fov=58, roll=(-8, -10))
add(155, 159.4, s39, "'sawadika go': she leaps off the post", v, ringside='gasp', stare=list(RED_TOP), rv=round(GO3 + 0.35, 2))
# S40 (b159.4..161.25; 'hello'): DODGE 3: he bows to us and she flies over him towards the front rows
FLY3 = yaw_to((1.4, -1.4), FRONT_HIT)
s40 = [wai_bow(0.0, 0.55, 0, 0.0, deg=58), flyer(0.95, -0.85, FLY3, Y + 1.02, mx=-0.75, mz=1.75, reveal=0.2)]
v = V((4.7, 1.7, 1.0), (0.1, 1.55, 1.0), fov=52)
add(159.4, 161.25, s40, "'hello': he bows to us and she flies over him towards the front rows", v, noBell=True, ringside='gasp', front=True, ropeHide=['e', 's'], clear=[[3.35, 1.0, 0.9], [3.35, 0.0, 0.6], [4.15, 0.6, 0.6]], rv=0.4)
# S41 (b161.25..167.25; 'sawadika'): through the ropes into the front rows, who go down like pins; she lies among them
s41 = [flyer(-0.15, 2.6, FLY3, Y + 0.8, mx=-0.35, mz=0.9, my=-1.25, myAt=0.0, myDur=0.45), wai_bow(0.0, 0.55, 0, -1.0, deg=58, hold=S(163.5, 161.25))]
v = V((-2.7, 1.75, 7.0), (-0.45, 0.75, 3.4), fov=54)
add(161.25, 167.25, s41, "'sawadika': through the ropes into the front rows, who go down like pins", v, ringside='gasp', front=True, fall=[FRONT_HIT[0], FRONT_HIT[1], 1.3, 0.3], ropeHide=['s'], rv=0.6)
# S42 (b167.25..171.5; 'hello'): she climbs back in, battered; he greets her with a wai again
s42 = [wai_bow(*D0, 90, 0.05, deg=40, hold=S(170.5, 167.25)), A('compote', 'happy_idle', *C0, yaw=-90, at=0.4, speed=0.05, dizzy=True, arm='both', aim=[0.15, 0.4, 0.85], upAt=-1),
       A('kob', 'happy_idle', *KOB_BACK, yaw=0, at=0.6, speed=0.04)]
v = V((0.0, 1.4, 4.3), (0.0, 1.2, 0.3), fov=48, p1=(0.0, 1.4, 4.1))
add(167.25, 171.5, s42, "'hello': she climbs back in, battered; he greets her with a wai again", v, ringside='stare', stare=[0, 0.3], ropeHide=['s'], rv=S(168.5, 167.25))
# S43 (b171.5..175.5): for the first time she lowers her gloves and presses them together: her wai (frontal, low: from above her head hid the gloves)
# (a bow brought her head down over the gloves; over his shoulder his head took her face; a close copied R13's glare: head to toe now,
# the gloves side by side in front of her white top, the ring and the staring crowd round her)
s43 = [A('compote', 'happy_idle', *C0, yaw=-70, at=0.4, speed=0.05, arm='both', upAt=-1, aimSeq=[[-1, GUARD], [S(173.2, 171.5), [-0.2, 0.25, 0.95]]])]
v = view((-2.07, 1.5, 1.32), (0.62, 1.68, 0.3), fov=46, p1=(-2.0, 1.5, 1.29), ease='lin')
add(171.5, 175.5, s43, "for the first time she lowers her gloves and presses them together: her wai", v, ringside='stare', stare=[0, 0.3], rv=S(174, 171.5))
# S44 (b175.5..177.05; 'hello'): they both bow at once, side on, their crowns meeting at the frame's centre on the cut
# (marks 1.2 m apart: the crowns touch at ~39 deg; the critic, 15/25: at 1.5 m and a pushed lens they never touched on screen)
BONK_D, BONK_C = (-0.6, 0.3), (0.6, 0.3)
BONK_DEG = 39
BONK_V = view((0.0, 1.42, 5.0), (0.0, 1.3, 0.3), fov=48)
s44 = [A('saxo', 'happy_idle', *BONK_D, yaw=90, at=0.4, speed=0.05, noLie=True, arm='both', aim=WAI, upAt=-1, bow=[[0.05, 0], [0.62, BONK_DEG]]),
       A('compote', 'happy_idle', *BONK_C, yaw=-90, at=0.4, speed=0.05, noLie=True, arm='both', aim=[-0.62, 0.2, 0.76], upAt=-1, bow=[[0.05, 0], [0.62, BONK_DEG]])]
v = BONK_V
add(175.5, 177.05, s44, "'hello': they both bow at once", v, ringside='stare', stare=[0, 0.3], ropeHide=['s'], rv=0.45)
# S45 (b177.05..178.5; 'sawadika'): BONK: the same lens, the crowns together under a white flash, held 0.3 s; then they
# spring back and topple backwards (the fall clip's drop starts as the bow lets go), stars from 0.3 s
s45 = [A('saxo', 'knocked_out_falling_to_back', *BONK_D, yaw=90, at=1.2, speed=1.0, noLie=True, arm='both', aim=WAI, upAt=-1, upEnd=0.3, bow=[[0.0, BONK_DEG], [0.3, BONK_DEG], [0.42, 0]], dizzy=0.3),
       A('compote', 'knocked_out_falling_to_back', *BONK_C, yaw=-90, at=1.2, speed=1.0, noLie=True, arm='both', aim=[-0.62, 0.2, 0.76], upAt=-1, upEnd=0.3, bow=[[0.0, BONK_DEG], [0.3, BONK_DEG], [0.42, 0]], dizzy=0.3)]
s45a = [A('saxo', 'happy_idle', *BONK_D, yaw=90, at=0.4, speed=0.05, noLie=True, arm='both', aim=WAI, upAt=-1, bow=[[0.0, BONK_DEG]]),
        A('compote', 'happy_idle', *BONK_C, yaw=-90, at=0.4, speed=0.05, noLie=True, arm='both', aim=[-0.62, 0.2, 0.76], upAt=-1, bow=[[0.0, BONK_DEG]])]
add(177.05, 177.75, s45a, "'sawadika': BONK: their crowns meet at the frame's centre, a burst of stars, held", BONK_V, ringside='gasp', ropeHide=['s'], bonk=[0.0, 1.62, 0.3, 0.0], bonkYaw=0, still=True, rv=0.18)
s45 = [A('saxo', 'knocked_out_falling_to_back', *BONK_D, yaw=90, at=1.2, speed=1.0, noLie=True, arm='both', aim=WAI, upAt=-1, upEnd=0.05, bow=[[0.0, BONK_DEG], [0.12, 0]], dizzy=0.05),
       A('compote', 'knocked_out_falling_to_back', *BONK_C, yaw=-90, at=1.2, speed=1.0, noLie=True, arm='both', aim=[-0.62, 0.2, 0.76], upAt=-1, upEnd=0.05, bow=[[0.0, BONK_DEG], [0.12, 0]], dizzy=0.05)]
v = BONK_V
add(177.75, 178.5, s45, "they spring back and topple, stars round their heads", v, ringside='gasp', ropeHide=['s'], rv=0.3)
# S46 (b178.5..183.5): from above on their feet's side: both flat on the canvas side by side with stars; the referee leans over them
s46 = [A('saxo', 'laying_idle', -0.55, 0.75, yaw=0, at=1.0, speed=0, ground='mesh', dizzy=True, dizzyR=0.72), A('compote', 'laying_idle', 0.55, 0.75, yaw=0, at=1.0, speed=0, ground='mesh', noLie=True, dizzy=True, dizzyR=0.72), A('kob', 'happy_idle', 0.0, -0.95, yaw=0, at=0.4, speed=0.05, lean=18)]
v = V((0.0, 4.2, 2.2), (0.0, 0.6, -0.15), fov=56, p1=(0.0, 4.05, 2.1))
add(178.5, 183.5, s46, "from above: both flat on the canvas with stars; the referee leans over them", v, ringside='gasp', rv=S(181, 178.5))
# S47 (b183.5..188; 'hello sawadika'): the car park answers with a wai: the crew bowing to the ring, seen from its front three-quarter, lit
# (from (3.1, 1.6) the ring's south-east post stood 0.6 m in front of the lens and filled half the frame; from inside the ring
# behind the two flat on the canvas, their stars filled the frame and the crew was a row of black blobs 6 m out: the lens is
# high behind the crew now, their backs bowing to the ring, the crowd beyond it bowing back at us)
s47 = [A('kob', 'happy_idle', -0.9, -0.85, yaw=-90, at=0.4, speed=0.05, noLie=True, arm='both', aim=WAI, upAt=0.2, bow=bowk(0.45, deg=50))]
# (the crew in black and then the crowd alone never read bowing: a heap of silhouettes, backs, crowns over the canvas edge, paws
# foreshortened to dots or hidden under the snouts. What passed is S06b: a character's wai side on, the crowd bowing back behind it:
# the referee leads the car park's answer, the lens inside the ring past the two flat on the canvas, who stay out of the frame)
v = V((-1.8, 1.4, 2.45), (-1.05, 1.2, -0.85), fov=48)
add(183.5, 188, s47, "'hello sawadika': the referee answers with a wai, side on, and the whole car park bows with her", v, ringside='wai', keepPets=True, rv=S(185.5, 183.5))
# S48 (b188..192.5; 'go', then the tail): the button: from above on their feet's side, the two on their backs side by side, stars
# circling, and their paws coming together in a wai to us, his first
s48 = [A('saxo', 'laying_idle', -0.55, 0.75, yaw=0, at=1.0, speed=0, ground='mesh', dizzy=True, dizzyR=0.72),
       A('compote', 'laying_idle', 0.55, 0.75, yaw=0, at=1.0, speed=0, ground='mesh', noLie=True, dizzy=True, dizzyR=0.72)]
v = place(V((0.0, 4.2, 2.2), (0.0, 0.6, -0.15), fov=56, p1=(0.0, 4.05, 2.1)), 0.55, 1.35, 0, 0.15)   # (FALLBACK: R48's passed lens)
add(188, 192.5, s48, "the button: from above, the two flat on their backs, stars circling, as the music stops", v, ringside='wai', still=True, rv=S(189.9, 188))
shots.sort(key=lambda x: x['beat'])
ep = {
    'date': '2026-10-13', 'song': {'title': 'SaWaDiKa', 'artist': 'LISA'},
    'logline': "A polite dog in a Bangkok Muay Thai ring greets the champion with a wai on every 'hello sawadika', and every punch, kick and flying knee sails over his bow into somebody else, until she bows back at the same moment and they bonk heads.",
    'new': "src/maps46.js: muaythai (a car park at dusk between old concrete housing blocks, the city's towers beyond them, a Muay Thai ring with ropes in the Thai flag's colours, red and blue corners, steps, floodlights, the timekeeper's brass bell, struck by a box-pet timekeeper's mallet, ringing out; a bonk burst of stars where two heads meet; floodlight poles a shot can hide; neon tuk-tuks, string lights; box-pet crowds that cheer, gasp, stare, dance, wai and get knocked flat; LISA's crew in black); the actor fields bow (a keyframed bend at the waist: the wai's bow, src/ps1.js bowSpine) and dizzyR (the dizzy stars' ring); the generator's tidy() (hides the poles and clears the box pets that land on a head) and FREEZE (passed shots keep their placement); looks saxo lisa and kob referee; the structure BROKEN RULE OF THREE with a double-bow bonk",
    'notes': "The world, from the official video (contact sheets): Bangkok at dusk, a crew in black dancing on the concrete steps and walkways of old housing blocks, a Muay Thai ring in a car park among them with boxers training, neon tuk-tuks, the city's towers; LISA in a platinum bob with blunt bangs and black leather and feathers. The title is the Thai greeting, said with a wai (palms pressed together, a bow). Our version keeps the car park ring, the crew in black, the tuk-tuks and her look, and turns the greeting into slapstick: the dog bows on every 'hello sawadika' and each attack flies over his back into somebody else (the referee, his coach, the front rows), until the champion learns to bow too and they bow into each other. The words, from whitelisted keywords per line: 'hello sawadika' (a wai and a bow each time), 'bang ... bangkok' (the hook), 'up' (up the steps, into the ring, paws up, her gloves up), 'step' (she steps up to him), 'back' (she turns her back), 'call' (the referee calls them in), 'catch' (he catches a glove), 'baby no' (his coach shakes her head), 'go' (each take-off). Cast: Saxo in LISA's platinum bob and black feathers (the polite challenger), Compote the champion in her boxer kit (always angry), Kob the referee (deadpan, flattened first), Sadi his coach in her pink tracksuit (cheering, then knocked off the apron). The bows always read side on (from the front the wig hides the face); the flying bodies are held level (lean) and read side on.",
    'tiktok_sound': '7681077868771887105',
    'with': ['sadi', 'kob', 'compote'],
    'clips': sorted({a['clip'] for s in shots for a in s['actors']}),
    'tags': {'structure': 'broken rule of three', 'scenes': ['the dog leads the crew in black', 'the champion shadow-boxing', 'the referee deadpan', 'up the ring steps', 'paws up then the first wai', 'the face-off', 'the glove caught', 'her guard up', 'the coach shakes her head', 'the bell', 'the charge', 'the flying punch over the bow', 'the referee flattened', 'the flying kick over the bow', 'the coach knocked off the apron', 'look behind you on the corner post', 'the leap off the turnbuckle', 'into the front rows', 'her first wai', 'the double bow and the bonk', 'the car park answers with a wai', 'the wai from the canvas'],
             'cast': ['saxo', 'sadi', 'kob', 'compote'], 'hook': 'dance', 'maps': ['muaythai'], 'ref': 'look-behind-you',
             'lyric_literal': "'hello sawadika' (a wai and a bow on every one: each dodges a bigger attack; the last two bow at once and bonk), 'bang ... bangkok' (the dance hook in a Bangkok car park), 'up' (up the steps, into the ring, paws up, her gloves up), 'step' (she steps up to him), 'back' (she turns her back), 'call' (the referee calls them in), 'catch' (he catches a glove), 'baby no' (his coach shakes her head), 'go' (each take-off)",
             'experiment': "Does slapstick on the song's own title word (a wai and a bow on every 'hello sawadika', each dodging a bigger attack, then a double-bow bonk) on a K-pop solo hit with a small TikTok sound (77.6k videos) and a huge video (206M views) earn more likes per 1,000 views at 24 h than our last week's dramatic-irony episodes?"},
    'shots': shots,
}
json.dump(ep, open(os.path.join(HERE, '2026-10-13-2.json'), 'w'), indent=1, ensure_ascii=False)
os.makedirs(os.path.join(HERE, '..', 'out', 'check'), exist_ok=True)
open(os.path.join(HERE, '..', 'out', 'check', 'saw_rev_times.txt'), 'w').write(','.join(f'{t:.2f}' for t in REV))
print(len(shots), 'shots;', len(WARN), 'warnings')
for b, q in SOLVED.items():
    if q != (0, 1.0, 0, 0): print('   moved', b, q)
for w in WARN: print('  ', w)
