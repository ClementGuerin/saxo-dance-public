# The "On The Floor" episode (2026-10-14; Jennifer Lopez ft. Pitbull, 2011): writes episodes/2026-10-14.json.
# Kit 2026-10-14: 64.524 s, song grid beats 95.5-234 plus a 0.6 s silent button, 129.9988 BPM, kit beat 0 at 0.2308 s.
# The call-outs (kit beats 0-33: each line names a kind of party-goer and what to do 'on the floor': 'go hard', 'party
# freak ... step', 'animal ... tear up', 'break a sweat', 'work'), verse 1 (33-64: 'keep it moving', 'drinks up',
# 'pick your body up and drop it', 'change your world', 'tonight'), the chorus (64-93: the city list, eight cities,
# 'dance the night away', 'live your life'), the breakdown's quiet (93-97, no kick from 72), 'dance the night away',
# 'grab somebody, drink a little more' (97-108), the build (108-114), the hook's first line ending on 'floor' as the
# beat drops (114-121, the drop at 120), the drop's chant (121-130), the hook again (130-137), the end (138) and the
# silent button.
# The world (the official video, contact sheets): an old theatre turned nightclub at night, red velvet, theatre boxes and
# crystal chandeliers, a packed dance floor, the singer in a silver sequined catsuit before a gold wall crossed by glowing
# gold bars, the rapper in a black suit and shades, champagne. Our club (src/maps47.js floorclub) keeps all of it and
# adds a floor below: the club's dance floor is the ceiling of the grumpy cat who lives downstairs.
# The story (structure DOWNSTAIRS, new: the party upstairs is the neighbour's ceiling, and the lead's instinct brings it
# down on her):
#   0 (the call-outs, k-0.5..19): the cutaway: the party above, the cat below in her armchair with her milk, dust sifting
#     on every beat; the dog in the rapper's black suit and shades dances; the cat's deadpan under the stomping.
#   1 ('animal ... tear up the floor', 19..33): he's an animal: he digs the gold dance floor like a dog, splinters
#     flying, panting ('sweat'), waist-deep ('work': his feet poke through her ceiling).
#   2 (verse 1, 33..64): the party keeps moving and raises its drinks, the cat raises her milk; 'drop it': he drops into
#     his hole and hangs upside down out of her ceiling in front of her face; he tunnels on under the dance floor (a
#     bulge racing between the dancers' feet); the bunny bouncer raises a whack-a-mole mallet.
#   3 (the chorus, 64..93): whack-a-mole on the city list: he pops up out of a new hole on a city, her mallet slams it a
#     beat late; 'dance the night away': he dances half out of a hole with the diva; her ceiling full of holes.
#   4 (the quiet, 'grab somebody', the build, 93..121): the diva grabs him for the lambada; the cat sips her milk under a
#     sagging ceiling; the bunny winds up behind them; her mallet comes down on 'floor' and on the drop the whole dance
#     floor caves in: the club falls into the cat's living room.
#   5 (the drop's chant, the hook, 121..138): the party lands round her armchair and goes on on her rug; the cat never
#     moves, milk in paw; the dog starts digging her floor.
#   6 (the silent button): the cutaway: the party in her flat, the dog half into her floor, the cat's stare.
import json, math, os, re, sys
sys.path.insert(0, os.path.dirname(__file__))
from cam import view

HERE = os.path.dirname(__file__)
PER, B0T = 60 / 129.9988, 0.2308
def T(b): return B0T + b * PER                  # kit seconds of kit beat b
def S(b, b0): return round((b - b0) * PER, 3)   # seconds from shot beat b0 to beat b

# the map (src/maps47.js FLOORCLUB)
FY, SL, SEAT, STAGE_Y = -3.0, 0.35, 0.42, 0.45
KOB_SIT = (0.55, -0.8); KOB_LIFT = FY + SEAT
LOOK = {'saxo': 'worldwide', 'sadi': 'sequins', 'kob': 'housecoat', 'compote': 'bouncer'}
HEAD = {'saxo': 1.42, 'sadi': 1.38, 'kob': 1.47, 'compote': 1.5}
FACE = {'saxo': 0.9, 'sadi': 0.84, 'kob': 0.86, 'compote': 0.86}
RAD = {'saxo': 0.48, 'sadi': 0.45, 'kob': 0.42, 'compote': 0.42}
CHARL = 2.467
def kick_at(rv): return round((1.6 - rv) % CHARL, 3)   # charleston's kick (clip 1.6 s) on the review frame, rv s into the shot

# the karaoke's word times (kit beats; numbers only, never a word)
_src = open(os.path.join(HERE, '2026-10-14.lyrics.js')).read()
_rows = json.loads(re.search(r'window\.LYRICS = (.*?);\n', _src).group(1)); _ends = json.loads(re.search(r'window\.LINE_END = (.*?);\n', _src).group(1))
def Bt(t): return (t - B0T) / PER
def W(line, word): return round(Bt(_rows[line][word][0]), 2)
LINES = [(Bt(row[0][0] - 0.35), Bt(e)) for row, e in zip(_rows, _ends)]
def has_line(b0, b1): return any(a < b1 and b > b0 for a, b in LINES)

def A(who, clip, x, z, **o):
    return {'who': who, 'look': o.pop('look', LOOK[who]), 'clip': clip, 'x': round(x, 3), 'z': round(z, 3), 'face': o.pop('face', 'world'),
            'yaw': round(o.pop('yaw', 0), 1), 'at': o.pop('at', 0.4), 'speed': o.pop('speed', 1), **o}
def yaw_to(frm, to): return round(math.degrees(math.atan2(to[0] - frm[0], to[1] - frm[1])), 1)
def kob(**o): return A('kob', 'sitting_talking', *KOB_SIT, yaw=o.pop('yaw', 0), at=0.05, speed=0, lift=KOB_LIFT, **o)
def dancer(who, x, z, yaw, rv, clip='charleston', **o):
    if clip == 'charleston': o.setdefault('at', kick_at(rv)); o.setdefault('speed', 1)
    return A(who, clip, x, z, yaw=yaw, **o)
def digger(x, z, yaw, lift=0.0, **o):          # the dog digging like a dog: bent over the hole, both paws scrabbling down on the beat, tongue out
    return A('saxo', 'happy_idle', x, z, yaw=yaw, at=0.4, speed=0.05, lift=lift, lean=o.pop('lean', 38), noLie=True, arm='both', aim='paddle', flapEvery=0.5, upAt=-1, tongue=True, **o)
def popper(x, z, yaw, at=0.05, up=0.55, top=-0.75, **o):   # the dog popping up out of a hole to his chest (top: his final lift), paws on the rim
    return A('saxo', 'happy_idle', x, z, yaw=yaw, at=0.4, speed=0.05, lift=round(top - up, 3), my=up, myAt=at, myDur=0.16, noShadow=True, air=True, arm='both', aim=o.pop('aim', [0.35, -0.3, 0.9]), upAt=-1, tongue=True, **o)
MALLET_UP, MALLET_DOWN = [0.3, 0.95, -0.1], [0.15, -0.35, 0.92]
MALLET_SIDE = [0.62, 0.62, 0.3]   # raised beside the head, paw and arm in sight (straight up the paw hid behind her head and the handle grew out of it, review 1)
def bunny(x, z, yaw, slam=None, raise_at=-1, hand='R', up=MALLET_UP, **o):   # the bouncer with the whack-a-mole mallet: raised, then slammed at `slam` s
    seq = [[raise_at, up]] + ([[round(slam - 0.06, 3), o.pop('down', MALLET_DOWN)]] if slam is not None else [])
    grip = {'hold': 'mallet'} if hand == 'R' else {'holdL': 'mallet'}
    return A('compote', 'happy_idle', x, z, yaw=yaw, at=0.4, speed=0.05, arm=hand, **grip, holdScale=o.pop('holdScale', 1.3), upAt=-1, aimSeq=seq, **o)
def spots(pts):                                # the guests' marks for a shot: {guest index: (x, z[, mode[, y]])}, the rest hidden
    out = [None] * 16
    for i, p in pts.items(): out[i] = [round(p[0], 2), round(p[1], 2), *p[2:]]
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
    lift = a.get('lift', 0) + (a.get('my', 0) if end else 0)
    fy, hy = FACE[who], HEAD[who]
    if a.get('clip') == 'sitting_talking': fy, hy = 0.78, 1.36
    if a.get('clip') == 'laying_idle':                        # lying: the head 0.55 m from the mark, opposite the facing, near the floor
        yw = math.radians(a.get('yaw', 0)); x, z = x - math.sin(yw) * 0.55, z - math.cos(yw) * 0.55; fy, hy = 0.28, 0.55
    if a.get('lean', 0) >= 140: fy, hy = 0.32, 1.3            # upside down: the head hangs at the lift, the feet up top
    elif a.get('lean', 0) > 20: d = 0.9 * math.sin(math.radians(a['lean'])); yw = math.radians(a.get('yaw', 0)); x, z = x + math.sin(yw) * d, z + math.cos(yw) * d; fy, hy = fy - 0.3, hy + 0.05   # bent over: the face lower, the box's top his back (the gate)
    return (who, x, z, fy + lift, hy + lift)
def occluded(cam, look, fov, actors, end, W_, beat):   # a face inside a nearer head's disc (the couple's heads merged, a guest hid behind her, review 1)
    pts = []
    for a in actors:
        if a.get('fg') or a.get('lean', 0) >= 140: continue
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
        if a.get('who') == 'saxo' and a.get('lean', 0) < 140 and a.get('lift', 0) + (a.get('my', 0) if end else 0) < -1.2 and a.get('lift', 0) > FY + 0.5: continue   # gone down his hole
        who, x, z, fy, hy = body(a, end)
        top, face = _proj(cam, look, fov, (x, hy, z)), _proj(cam, look, fov, (x, fy, z))
        tag = ' at the end' if end else ''
        if not top or not face: W_.append(f'b{beat}: {who} behind the lens{tag}'); continue
        if line and top[1] < 0.27 and a.get('lean', 0) < 140: W_.append(f'b{beat}: {who} head top at {top[1]:.2f} (lyric rows){tag}')
        if face[0] < 0.12 or face[0] > 0.88: W_.append(f'b{beat}: {who} face x {face[0]:.2f} (edge){tag}')
        if face[1] > 0.86 or face[1] < 0.0: W_.append(f'b{beat}: {who} face y {face[1]:.2f}{tag}')
def lens(v, k=0):
    c, f = v; a = math.radians(c['ang'][k]); fy = f[2] if len(f) > 2 else 0
    return (f[0] + math.sin(a) * c['r'][k], c['h'][k] + fy, f[1] + math.cos(a) * c['r'][k])
def inside(c, zone):
    x, y, z = c
    if zone == 'club': return -7.3 < x < 7.3 and -8.2 < z < 2.85 and 0.08 < y < 5.4
    if zone == 'flat': return -4.3 < x < 4.3 and -4.4 < z < 2.85 and FY + 0.08 < y < -SL - 0.1
    return z > 3.1
CLUB_SPOTS = [[-3.0, -3.4], [-1.6, -3.6], [0.2, -3.5], [1.8, -3.6], [3.0, -3.2], [-3.1, -1.6], [3.1, -1.4], [-3.0, 0.4], [3.0, 0.6], [-1.9, 1.5], [1.9, 1.6],
              [-4.6, -4.8], [4.6, -4.6], [-4.8, 0.8], [4.4, 1.2], [5.6, -3.6]]
FLAT_SPOTS = [[-2.4, -1.4], [-1.6, 0.6], [-0.9, -2.6], [2.4, -2.4], [2.6, -0.2], [1.6, 1.3], [-2.9, 1.4], [3.4, 1.4], [-3.6, -0.4], [0.2, -3.6], [1.1, -3.4], [-1.9, -3.7],
              [3.6, -3.4], [-0.8, 1.9], [0.6, 2.0], [-3.8, 2.2]]
def tidy(v, actors, o):                         # the box pets that land on a face, on a whack's burst, or stand at the lens
    c, focus = v; fy0 = focus[2] if len(focus) > 2 else 0; clear = []
    where = o.get('where', 'club'); py0 = FY if where == 'flat' else 0.0
    marks = [(p[0], p[1], p[3] if len(p) > 3 else py0) for p in o['spots'] if p] if o.get('spots') else [(px, pz, py0) for px, pz in (FLAT_SPOTS if where == 'flat' else CLUB_SPOTS)]
    if o.get('noguests') or o.get('guests') is False: return []
    bursts = [(w[0], 0.55, w[1]) for w in o.get('whacks', [])]   # the bonk ring and its stars (an extra behind one read as the one being whacked, review 1)
    for k, end in ((0, 0), (-1, 1)):
        cam, look = lens(v, k), (focus[0], c['look'][k] + fy0, focus[1])
        for px, pz, py in marks:
            if math.dist((cam[0], cam[2]), (px, pz)) < 1.3 and abs(cam[1] - py) < 2.6: clear.append([px, pz, 0.3]); continue
            hit = False
            for bp_ in bursts:
                pb, pg = _proj(cam, look, c['fov'], bp_), _proj(cam, look, c['fov'], (px, py + 0.75, pz))
                if pb and pg and math.hypot(pb[0] - pg[0], (pb[1] - pg[1]) * 16 / 9) < head_rf(cam, look, c['fov'], bp_, 0.6) + head_rf(cam, look, c['fov'], (px, py + 0.75, pz), 0.45): hit = True
            if hit: clear.append([px, pz, 0.3]); continue
            for hy0, rr in ((0.95, 0.26), (1.32, 0.2)):   # its head, then its ears (a bunny's stand 0.4 m over it: round 1, ears out of three heads)
                pp = _proj(cam, look, c['fov'], (px, py + hy0, pz))
                if not pp: continue
                pr = head_rf(cam, look, c['fov'], (px, py + hy0, pz), rr)
                for a in actors:
                    if a.get('fg'): continue
                    who, x, z, fh, hh = body(a, end); pf = _proj(cam, look, c['fov'], (x, (fh + hh) / 2, z))
                    if not pf: continue
                    rf = head_rf(cam, look, c['fov'], (x, fh, z), RAD[who])
                    if math.hypot(pp[0] - pf[0], (pp[1] - pf[1]) * 16 / 9) < rf + pr + 0.03: hit = True; break
                if hit: break
            if not hit:
                pe = _proj(cam, look, c['fov'], (px, py + 0.95, pz))
                if pe and -0.1 < pe[0] < 0.1 or pe and 0.9 < pe[0] < 1.1: hit = True
            if not hit:
                near = min((math.dist((cam[0], cam[2]), (a['x'], a['z'])) for a in actors if not a.get('fg')), default=99)
                pp = _proj(cam, look, c['fov'], (px, py + 0.6, pz))
                if pp and math.dist((cam[0], cam[2]), (px, pz)) < min(near - 0.3, 2.2) and 0.12 < pp[0] < 0.88 and 0.25 < pp[1] < 1.05: hit = True
            if hit: clear.append([px, pz, 0.3])
    out = []
    for q in clear:
        if q not in out: out.append(q)
    return out

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
    for dl in (0, 0.1, 0.2, 0.3, 0.45, 0.6):
        for dk in (1.0, 1.12, 1.25, 1.4, 0.9, 1.6):
            for da in (0, -8, 8, -16, 16, -24, 24):
                for dh in (0, 0.15, -0.15, 0.3):
                    v = place(spec, dl, dk, da, dh)
                    n = len(problems(beat, b1, actors, v, zone))
                    score = n * 1000 + dl * 30 + abs(dk - 1) * 40 + abs(da) + abs(dh) * 20
                    if best is None or score < best[0]: best = (score, v, (dl, dk, da, dh))
                    if n == 0 and score < 1: return v
    SOLVED[beat] = best[2]
    return best[1]
def auto_spots(v, actors, where, idx, ymax=0.66, dmin=3.2, dmax=11.0):   # the guests' marks searched in the frame: whole, clear of every head and the lyric rows, spread out
    c, focus = v; fy0 = focus[2] if len(focus) > 2 else 0; py = FY if where == 'flat' else 0.0
    box = (-4.1, 4.1, -4.3, 2.6) if where == 'flat' else (-3.4, 3.4, -5.9, 2.5)
    cands = []
    for k in range(0, 33):
        for j in range(0, 33):
            x, z = box[0] + (box[1] - box[0]) * k / 32, box[2] + (box[3] - box[2]) * j / 32
            ok = True
            for kk, end in ((0, 0), (-1, 1)):
                cam, look = lens(v, kk), (focus[0], c['look'][kk] + fy0, focus[1]); d = math.dist((cam[0], cam[2]), (x, z))
                top, foot, head = _proj(cam, look, c['fov'], (x, py + 1.3, z)), _proj(cam, look, c['fov'], (x, py, z)), _proj(cam, look, c['fov'], (x, py + 0.95, z))
                if not (top and foot and head) or not (dmin < d < dmax) or not (0.14 < head[0] < 0.86) or top[1] < 0.2 or foot[1] > 1.0 or head[1] > ymax: ok = False; break
                pr = head_rf(cam, look, c['fov'], (x, py + 0.95, z), 0.3)
                for a in actors:
                    who, ax, az, fh, hh = body(a, end); pf = _proj(cam, look, c['fov'], (ax, (fh + hh) / 2, az))
                    if pf and math.hypot(head[0] - pf[0], (head[1] - pf[1]) * 16 / 9) < head_rf(cam, look, c['fov'], (ax, fh, az), RAD[who]) * 1.15 + pr + 0.04: ok = False; break
                    pb, pfa = _proj(cam, look, c['fov'], (x, py + 0.5, z)), _proj(cam, look, c['fov'], (ax, fh, az)); rfa = head_rf(cam, look, c['fov'], (ax, fh, az), RAD[who])
                    if pb and pfa and math.dist((cam[0], cam[2]), (x, z)) < math.dist((cam[0], cam[2]), (ax, az)) and abs(pb[0] - pfa[0]) < rfa + 0.05 and top[1] < pfa[1] + rfa * 9 / 16: ok = False; break   # in front of someone's face (below the chin it's fine)
                if not ok: break
            if ok: cands.append((x, z, head, head_rf(lens(v, 0), (focus[0], c['look'][0] + fy0, focus[1]), c['fov'], (x, py + 0.95, z), 0.3)))
    pick = []
    while cands and len(pick) < len(idx):
        best = max(cands, key=lambda q: min([math.hypot(q[2][0] - p[2][0], (q[2][1] - p[2][1]) * 1.2) for p in pick] + [abs(q[2][0] - 0.5) + 0.3]))
        pick.append(best); cands = [q for q in cands if math.hypot(q[2][0] - best[2][0], (q[2][1] - best[2][1]) * 16 / 9) > q[3] + best[3] + 0.08]   # two extras never merge into one two-headed blob
    return spots({i: (p[0], p[1]) for i, p in zip(idx, pick)})
shots = []; REV = []; WARN = []
# The fallback (DAILY_ROUTINE "Fallback", 2026-10-14 01:50): seven shots failed three review loops (the tunnel bulge, the
# quiet's creeping bunny, the tango, the cat's sip, the build's wind-up, the cutaway party, the dig): they're dropped and
# their beats go to setups that passed (the bungee and the mallet raise share the tunnel's bar, the stalk runs through
# the quiet, the lambada through 'grab', the sag from below moves up to 'drink', the slam's two-shot holds the build,
# the landing holds the chant, the button's pop opens on 'on the floor')
DROPPED = set()   # the failed shots carry drop=True
def add(beat, b1, actors, lyric, v, rv=None, **o):
    if beat in DROPPED or o.pop('drop', False): return
    o = {k: val for k, val in o.items() if val is not None}
    zone = o.get('zone', 'club')
    if v[0] == 'V': v = fit(v, beat, b1, actors, zone)
    c, focus = v
    if 'spotsAuto' in o: o['spots'] = auto_spots(v, actors, o.get('where', 'club'), o.pop('spotsAuto')); o.setdefault('spotsAt', [round(lens(v, 0)[0], 2), round(lens(v, 0)[2], 2)])
    if 'spotsImg' in o:   # the guests' marks given in the frame: {i: (x across 0-1, metres from the lens[, mode[, y]])}, found after the lens is fitted
        cam = lens(v, 0); fh = (focus[0] - cam[0], focus[1] - cam[2]); n = math.hypot(*fh); fh = (fh[0] / n, fh[1] / n); rh = (-fh[1], fh[0])
        th = math.tan(math.radians(c['fov']) / 2) * 9 / 16
        o['spots'] = spots({i: (cam[0] + fh[0] * p[1] + rh[0] * (p[0] - 0.5) * 2 * th * p[1], cam[2] + fh[1] * p[1] + rh[1] * (p[0] - 0.5) * 2 * th * p[1], *p[2:]) for i, p in o.pop('spotsImg').items()})
        o.setdefault('spotsAt', [round(cam[0], 2), round(cam[2], 2)])
    for k in (0, -1):
        if not inside(lens(v, k), zone): WARN.append(f'b{beat}: lens outside the {zone} {tuple(round(q, 2) for q in lens(v, k))}')
    cl = tidy(v, actors, o) + o.pop('clear', [])
    if cl: o['clear'] = cl
    if o.get('fallen'):
        pts = [(round(a['x'] + a.get('mx', 0), 2), round(a['z'] + a.get('mz', 0), 2)) for a in actors]
        o['rubbleOff'] = sight(v, pts) + [q for q in sight(v, [(p[0], p[1]) for p in (o.get('spots') or []) if p], w=0.45)]
    for k, end in ((0, 0), (-1, 1)):
        cam, look = lens(v, k), (focus[0], c['look'][k] + (focus[2] if len(focus) > 2 else 0), focus[1])
        check(beat, b1, cam, look, c['fov'], actors, end, WARN)
    t0 = 0 if not shots else T(beat)
    REV.append(round(t0 + (rv if rv is not None else 0.6 * (T(b1) - t0)), 2))
    shots.append({'beat': beat, 'kind': 'dance', 'map': 'floorclub', 'actors': actors, 'lyric': lyric, 'cam': c, 'focus': focus, **o})

# ---------------- marks ----------------
DOG = (0.45, -0.5)                 # where he dances at the start, above her armchair's front
H0 = (0.55, -0.15)                 # his first hole: in front of her face downstairs
DIG = (0.55, 0.42)                 # his mark digging it, facing -z (bent over, his head over the hole)
SADI_ST = (-0.7, -6.95)            # the diva on the stage
HA, HB, HC, HD, HM = (-1.6, -1.7), (-0.35, -3.0), (1.15, -2.3), (1.8, -0.75), (0.0, -2.0)   # the whack-a-mole holes, a chain (each next one 1.4-1.6 m on); HM: his dance hole
R0 = 0.55                          # a dug hole's radius
def holes_by(b):                   # every hole dug before kit beat b, at full size
    out = [[*H0, R0, -1, -1]]
    for h, k in ((HA, 64), (HB, 66), (HC, 70), (HD, 74), (HM, 80)):
        if b >= k + 0.01: out.append([*h, 0.48, -1, -1])
    return out
def CUT(dz=0.0, y=-0.12, fov=50, push=0.4): return view((0.55, y, 6.3 + dz), (0.55, y, -1.0), fov=fov, p1=(0.55, y, 6.3 + dz - push), ease='lin')
def sight(v, pts, w=0.75):                     # `rubbleOff`: no landed rubble on the lines from the lens to these floor points (a slab at the lens hid the party, review 1)
    out = []
    for k in (0, -1):
        cam = lens(v, k)
        for x, z in pts: out.append([round(cam[0], 2), round(cam[2], 2), round(x, 2), round(z, 2), w])
    return out
# the couple, opened to the lens (face to face in profile, 0.84 m apart, their muzzles met: a kiss, review 1): 1.2 m
# apart, each turned 35 deg to the lens, the inner paws joined between them at chest height
CPL = 0.62
def couple(rv, z=-1.15, cx=0.0, open_=82, cpl=None, j=(0.95, -0.22, 0.2), **o):
    c_ = CPL if cpl is None else cpl
    return [dancer('saxo', cx + c_, z, -90 + open_, rv, arm='R', aim=list(j), upAt=-1, **o), dancer('sadi', cx - c_, z, 90 - open_, rv, arm='L', aim=list(j), upAt=-1, **o)]
OLD = dict(open_=60, cpl=0.48, j=(0.3, -0.3, 0.9))   # the slam and the cave-in keep the staging review 2 passed

# =====================================================================================================================
# S00 (b-0.5..4; 'go hard'): the hook: the cutaway. Upstairs the party on the gold dance floor, the dog in the rapper's
# black suit and shades dancing above her armchair, the diva on the stage behind him; downstairs the cat in her armchair
# with her milk, curlers in, the pendant swinging and dust sifting down on every beat; a slow push-in
s = [dancer('saxo', *DOG, 0, S(1.6, -0.5)), A('sadi', 'samba', *SADI_ST, yaw=10, lift=STAGE_Y, at=0.3), kob(holdL='milkbottle', holdScale=1.1)]
add(-0.5, 4, s, "the hook: the cutaway: the party upstairs (the dog dancing, the diva behind him), the cat downstairs under her swinging pendant", CUT(y=0.06), zone='cut', guests='dance', clear=[[1.9, 1.6, 0.3]], rv=S(1.6, -0.5))
# S01 (b4..8; 'floor'): a swoop down over the dancing guests to the dog dancing on the gold floor, the bars behind him
s = [dancer('saxo', *DOG, 10, S(6.2, 4))]
v = V((1.8, 2.7, 2.5), (0.45, 0.95, -0.5), fov=62, p1=(0.75, 0.32, 1.25), ease='out', roll=(0, -9), hand=0.15)
add(4, 8, s, "a swoop down over the dancers to the dog dancing on the gold floor", v, guests='dance', rv=S(6.2, 4))
# S02 (b8..12; 'party freak'): low on the dance floor, the dog kicking, the party freaks dancing whole round him (round
# 1: gangnam's stance read as paws clasped, the extras were cut at both edges)
D02 = (0.35, -1.9)
s = [dancer('saxo', *D02, yaw_to(D02, (0.1, 2.6)), S(10.2, 8))]
v = V((0.1, 0.45, 2.6), (0.35, 0.85, -1.9), fov=62, p1=(0.13, 0.44, 2.45), roll=(-8, -5), hand=0.3)
add(8, 12, s, "'party freak': low on the dance floor: the dog kicking, the party freaks dancing round him", v, guests='dance',
    spotsImg={4: (0.18, 4.0), 8: (0.82, 4.1), 6: (0.25, 6.2), 13: (0.75, 6.3)}, rv=S(10.2, 8))
# S03 (b12..15; 'step on the floor'): downstairs, the cat's deadpan: dust sifting down on her on every stomp, the pendant swinging
s = [kob(holdL='milkbottle', holdScale=1.1)]
v = V((0.55, FY + 1.33, 1.6), (0.55, FY + 1.22, -0.8), fov=44, p1=(0.55, FY + 1.33, 1.45), ease='lin')
add(12, 15, s, "'step on the floor': downstairs the cat's deadpan, plaster flakes sifting down on her with every stomp", v, zone='flat', dustAt=[0.55, -0.7, 0.55], rv=S(14, 12) + 0.08)
# S04 (b15..'animal'): frontal on the dog dancing (the YouTube Short opens here)
s = [dancer('saxo', *DOG, 0, S(17.5, 15))]
v = V((0.55, 1.25, 2.55), (0.45, 1.1, -0.5), fov=50, p1=(0.55, 1.22, 2.3))
add(15, W(2, 3), s, "frontal on the dog dancing, the bars blazing behind him", v, guests='dance', rv=S(17.5, 15))
# S05 ('animal'..23.6; 'tear up the floor'): he's an animal: he digs like a dog, from his front three-quarter (his face
# over the hole), the splinters flying out behind him (side on his head hid his face, round 1)
TEAR = W(2, 5)
b0 = W(2, 3)
s = [digger(*DIG, 180, lean=32)]
v = V((-1.55, 1.75, -1.95), (0.55, 0.45, 0.1), fov=52, p1=(-1.45, 1.72, -1.85))
add(b0, 23.6, s, "'tear up the floor': he's an animal: bent over the gold floor he digs like a dog, splinters flying out behind him", v,
    guests='dance', holes=[[*H0, R0, S(TEAR, b0), S(23.6, b0)]], dig=[*H0, 0, 9, 0], rv=S(22.6, b0))
# S06 (b23.6..27.7; 'break a sweat'): across the hole, a little above him: his face over it, tongue out, panting
s = [digger(*DIG, 180, lean=30)]
v = V((0.6, 1.35, -2.5), (0.55, 0.65, 0.15), fov=52, p1=(0.6, 1.32, -2.35))
add(23.6, 27.7, s, "'break a sweat': across the hole, his face bent over it, tongue out, panting, splinters flying", v,
    guests='dance', holes=[[*H0, R0, -1, -1]], dig=[*H0, 0, 9, 0], rv=S(25.4, 23.6))
# S07 (b27.7..33; 'work'): the cutaway: waist-deep in his hole, still digging; his feet poke through her ceiling and
# plaster rains round her armchair
s = [A('saxo', 'happy_idle', *H0, yaw=0, at=0.4, speed=0.05, lift=-0.62, noShadow=True, arm='both', aim='paddle', flapEvery=0.5, upAt=-1, tongue=True), kob(holdL='milkbottle', holdScale=1.1)]
add(27.7, 33, s, "'work': the cutaway: waist-deep in his hole, still digging, his feet poking out of her ceiling, plaster raining round her", CUT(y=-0.2),
    zone='cut', guests='dance', clear=[[1.9, 1.6, 0.3]], holes=[[*H0, R0, -1, -1]], plaster=[[H0[0] - 0.6, H0[1] + 0.2, 0.2], [H0[0] + 0.7, H0[1], 0.9], [H0[0] - 0.4, H0[1] + 0.4, 1.6]], cracks=0.3, rv=S(30.5, 27.7))
# S08 (b33..37; 'keep it moving'): the party never stops: the diva dances on the stage before the gold bars
s = [dancer('sadi', *SADI_ST, yaw_to(SADI_ST, (-0.45, -3.45)) + 25, S(35, 33), lift=STAGE_Y, arm='both', aim='rave', flapEvery=1000, flapPh=33, upAt=-1)]
v = V((-0.45, 1.05, -3.45), (-0.65, 1.0, -6.95), fov=50, p1=(-0.47, 1.05, -3.6))
add(33, 37, s, "'keep it moving': the diva dances on, oblivious, on the stage before the gold bars", v, guests='dance', rv=S(35, 33))
# S09 (b37..'drinks'): the toast: the diva raises her glass, the guests their gold cups
s = [A('sadi', 'happy_idle', *SADI_ST, yaw=8, lift=STAGE_Y, at=0.4, speed=0.05, arm='R', aim=[0.55, 0.65, 0.35], hold='goblet', holdScale=1.4, upAt=-1)]
v = V((-0.45, 1.35, -1.95), (-0.65, 1.2, -6.6), fov=62)
add(37, W(5, 7), s, "'drinks up': the diva raises her glass and the whole club its gold cups", v, guests='toast',
    spotsImg={4: (0.19, 3.6), 9: (0.81, 3.6), 1: (0.21, 5.8, 'toast', STAGE_Y), 13: (0.79, 5.8, 'toast', STAGE_Y)}, rv=S(38.6, 37))
# S10 ('drinks'..41; 'up'): downstairs the cat raises her milk, deadpan
b0 = W(5, 7)
s = [kob(arm='R', aim='toast', hold='milkbottle', holdScale=1.15, upAt=-1)]
v = V((0.95, FY + 1.35, 1.5), (0.55, FY + 1.25, -0.8), fov=44, p1=(0.93, FY + 1.35, 1.38), ease='lin')
add(b0, 41, s, "'up': downstairs the cat raises her milk too, deadpan", v, zone='flat', holes=[[*H0, R0, -1, -1]], plaster=[[H0[0] + 1.0, H0[1] + 0.5, 0.1]], cracks=0.3, rv=S(40.2, b0))
# S11 (b41..47.2; 'pick your body up and drop it'): from above, the dog in his hole to the chest, looking up at us; on
# 'drop' he drops out of sight
DROP = W(6, 5)
s = [A('saxo', 'happy_idle', *H0, yaw=0, at=0.4, speed=0.05, lift=-0.75, my=-1.05, myAt=S(DROP, 41), myDur=0.22, noShadow=True, air=True, arm='both', aim=[0.35, -0.3, 0.9], upAt=-1, tongue=True)]
v = V((1.25, 2.55, 1.2), (0.55, 0.3, -0.15), fov=55, p1=(1.2, 2.45, 1.1))
add(41, 47.2, s, "'drop it': from above, the dog in his hole to the chest looks up at us, then drops out of sight", v, guests='dance', holes=[[*H0, R0, -1, -1]], rv=S(43.5, 41))
# S12 (b47.2..51; 'on the floor'): downstairs, in profile: he hangs upside down out of her ceiling, nose to nose with the
# cat in her armchair (from her front three-quarter his head sat on hers like a hat, round 1)
BUNGEE = (0.55, 0.16)
s = [A('saxo', 'happy_idle', *BUNGEE, yaw=0, at=0.4, speed=0.05, lift=-2.13, lean=180, noLie=True, air=True, noShadow=True, tongue=True, dip=[0.05, 4.5], cord=[0.55, -0.15, -0.1]), kob(holdL='milkbottle', holdScale=1.1)]
v = V((3.35, -1.78, -0.22), (0.55, -1.72, -0.22), fov=50, p1=(3.15, -1.78, -0.22), ease='lin')
add(47.2, 55, s, "'on the floor': downstairs, in profile: he bungees down out of her ceiling, upside down, nose to nose with the cat; she stares", v,
    zone='flat', holes=[[*H0, R0, -1, -1]], plaster=[[H0[0] + 0.5, H0[1] + 0.3, 0.0], [H0[0] - 0.5, H0[1] + 0.2, 0.25]], cracks=0.3, rv=S(48.6, 47.2))
# S14 (b55..59; 'floor'): he tunnels on: a bulge races under the dance floor between the dancers' feet, from above
s = [A('sadi', 'samba', *SADI_ST, yaw=8, lift=STAGE_Y, at=1.2, fg=True)]
v = V((-2.6, 0.55, -3.3), (-0.3, 0.2, -0.9), fov=58, p1=(-2.5, 0.55, -3.2))
add(55, 59, s, "he tunnels on: the gold tiles heave up in a ridge over him as he races under the dance floor, the dancers leaping clear", v, drop=True, guests='leap', holes=holes_by(55),
    spotsImg={4: (0.27, 3.9), 8: (0.73, 3.9), 13: (0.38, 5.6), 0: (0.63, 5.4)},
    ridge=[H0[0], H0[1] - 0.45, HA[0], HA[1], 0.1, 1.7], rv=S(57, 55), stars=[])
# S15 (b59..64; 'tonight'): the bunny bouncer raises her whack-a-mole mallet, glaring
BUN0 = (HA[0] - 0.15, HA[1] - 1.05)
s = [bunny(*BUN0, yaw_to(BUN0, (HA[0] + 0.55, HA[1] + 2.6)), raise_at=S(60.55, 57) - 0.2, hand='L', up=MALLET_SIDE)]
v = V((HA[0] + 0.75, 1.0, HA[1] + 3.0), (HA[0] + 0.1, 0.85, HA[1] - 0.85), fov=56)
add(57, 64, s, "'tonight': the bunny bouncer raises her whack-a-mole mallet beside her head, glaring down at the bulge stalled at her feet", v, guests='stare', stare=list(HA), holes=holes_by(59),
    ridge=[H0[0], H0[1] - 0.45, HA[0], HA[1], -2, -1, 1], rv=S(62, 57))
# ---- whack-a-mole on the city list: he pops up out of a hole on a city, her mallet slams it on the next while he pops up
# out of the next hole behind her (the joke in one frame); the holes are a chain, each 1.4-1.6 m on from the last ----
def pop_close(b0, b1, hole, lyric, side=1, **o):   # a medium front on the dog's head and shoulders out of a hole
    lensp = (hole[0] + 0.7 * side, 1.0, hole[1] + 2.2); lookp = (hole[0], 0.48, hole[1])
    add(b0, b1, [popper(*hole, yaw_to(hole, (lensp[0], lensp[2])), at=0.05)], lyric, V(lensp, lookp, fov=54), guests=o.pop('guests', 'gasp'),
        holes=holes_by(b0) + [[*hole, 0.48, 0.0, 0.08]], rv=o.pop('rv', 0.5), **o)
def slam_pop(b0, b1, hole, nxt, at_s, lyric, **o):   # side on: her mallet comes down on the hole, the dog pops up out of the next one behind
    bx, bz = hole[0] + (hole[0] - nxt[0]) * 0.45, hole[1] + (hole[1] - nxt[1]) * 0.45   # she stands beyond the hole, away from the next one
    ux, uz = hole[0] - bx, hole[1] - bz; n = math.hypot(ux, uz) or 1; nx_, nz_ = -uz / n, ux / n
    mx, mz = (bx + hole[0]) / 2, (bz + hole[1]) / 2
    if (nxt[0] - mx) * nx_ + (nxt[1] - mz) * nz_ > 0: nx_, nz_ = -nx_, -nz_   # the lens on the side away from the next hole: he shows behind them
    lensp = (round(mx + nx_ * 3.0, 2), 1.15, round(mz + nz_ * 3.0, 2)); lookp = (round(mx + (nxt[0] - mx) * 0.35, 2), 0.72, round(mz + (nxt[1] - mz) * 0.35, 2))
    acts = [bunny(bx, bz, yaw_to((bx, bz), hole), slam=at_s), popper(*nxt, yaw_to(nxt, (lensp[0], lensp[2])), at=max(0.05, at_s - 0.12))]
    add(b0, b1, acts, lyric, V(lensp, lookp, fov=60), guests=o.pop('guests', 'gasp'), holes=holes_by(b0 + 0.02) + [[*nxt, 0.48, max(0.0, at_s - 0.2), at_s]],
        whacks=[[*hole, at_s]], whackYaw=yaw_to(hole, (lensp[0], lensp[2])), rv=round(at_s + 0.1, 2), **o)
SL1 = lambda line, word, b0: round(max(0.18, S(W(line, word), b0) - 0.05), 3)
pop_close(64, 66, HA, "'Brazil': he pops up out of a hole among the dancers' feet, tongue out")
slam_pop(66, 68, HA, HB, SL1(9, 1, 66), "'Morocco': her mallet slams the hole a beat late; he pops up out of the next one behind her")
pop_close(68, 70, HB, "'London': up out of the next hole, tongue out", side=-1)
# S18 ('Ibiza'): the slam side on from the club's front, wide enough for her, the burst and his grin (round 1: an extra stood
# in the bonk ring, his head at the edge)
at18 = SL1(9, 4, 70); B18 = (HB[0] + (HB[0] - HC[0]) * 0.45, HB[1] + (HB[1] - HC[1]) * 0.45); C18 = ((B18[0] + HB[0] + HC[0]) / 3, (B18[1] + HB[1] + HC[1]) / 3)
s = [bunny(*B18, yaw_to(B18, HB), slam=at18), popper(*HC, yaw_to(HC, (-2.3, 1.85)), at=max(0.05, at18 - 0.12))]
v = V((C18[0] - 2.41, 1.2, C18[1] + 5.16), (C18[0] + 0.37, 0.7, C18[1] + 0.17), fov=62)
add(70, 72, s, "'Ibiza': slam: empty again; he's up out of the next one", v, guests='gasp', holes=holes_by(70.02) + [[*HC, 0.48, max(0.0, at18 - 0.2), at18]],
    whacks=[[*HB, at18]], whackYaw=yaw_to(HB, (C18[0] - 2.2, C18[1] + 4.7)), rv=round(at18 + 0.1, 2))
# S19 ('LA'): he pops up a metre from her, over her shoulder: her back, her raised mallet in the foreground (round 1: a
# copy of S17's frame with no bunny in it)
L19 = (2.19, 0.47); B19 = (1.24, -1.21)
s = [popper(*HC, yaw_to(HC, L19), at=0.05), bunny(*B19, yaw_to(B19, HC), raise_at=-1, hand='R', up=[0.22, 0.5, 0.84], fg=True)]
v = V((L19[0], 1.0, L19[1]), (HC[0] - 0.05, 0.62, HC[1]), fov=60)
add(72, 74, s, "'LA': over her shoulder: he pops up again a metre in front of her, her mallet raised", v, guests='gasp', holes=holes_by(72) + [[*HC, 0.48, 0.0, 0.08]], rv=0.5)
# S20 ('New York'): she glares down at the hole she just slammed, he pops up right behind her heels, both faces to us
# (round 1: S16's layout again, him in front of her eyeline)
at20 = SL1(10, 2, 74); P20 = (1.0, -1.45)   # HC 0.86 m in front of her, HD a metre behind her right heel
L20 = (5.6, -1.5)
s = [bunny(*P20, yaw_to(P20, HC), slam=at20), popper(*HD, yaw_to(HD, L20), at=max(0.05, at20 - 0.12), top=-0.6)]
v = V((L20[0], 0.95, L20[1]), (1.3, 0.65, -1.5), fov=62)
add(74, 76, s, "'New York': slam: empty; she glares at the hole, he pops up right behind her heels", v, guests='gasp', holes=holes_by(74.02) + [[*HD, 0.48, max(0.0, at20 - 0.2), at20]],
    whacks=[[*HC, at20]], whackYaw=yaw_to(HC, L20), rv=round(at20 + 0.12, 2))
# S21 (b76..78; 'Vegas'): nose to nose in profile: he pops up high right under her nose, face tipped up to hers, she leans
# down over him, the mallet raised beside her head (round 1: from above, the back of his head at her feet)
s = [popper(*HD, -60, at=0.05, top=-0.42, lean=-12), bunny(HD[0] - 0.62, HD[1], 60, raise_at=-1, up=MALLET_SIDE, lean=22)]
v = V((HD[0] - 0.3, 0.55, HD[1] + 3.15), (HD[0] - 0.3, 0.8, HD[1]), fov=54)
add(76, 78, s, "'Vegas': nose to nose: he pops up right under her nose, her mallet still up", v, guests='gasp', holes=holes_by(76) + [[*HD, 0.48, 0.0, 0.08]], rv=0.5)
# S23 (b78..80; 'Africa'): she brings it down with everything she has: he ducks, the mallet hits the floor, a bonk
s = [bunny(HD[0] - 0.62, HD[1], 90, slam=SL1(10, 7, 78))]
v = V((HD[0] - 0.3, 0.78, HD[1] + 3.0), (HD[0] - 0.3, 0.66, HD[1]), fov=54)
add(78, 80, s, "'Africa': she brings it down with everything she has: he ducks, the mallet hits the floor", v, guests='gasp', holes=holes_by(78.02), whacks=[[*HD, SL1(10, 7, 78)]], whackYaw=0, rv=round(SL1(10, 7, 78) + 0.1, 2))
# S24 (b80..85; 'dance the night away'): he pops up in the middle of the dance floor and dances half out of his hole, the
# diva down from the stage dancing beside him
s = [A('saxo', 'happy_idle', *HM, yaw=0, at=0.4, speed=0.05, lift=-0.62, noShadow=True, air=True, arm='both', aim='rave', flapEvery=1000, flapPh=90, upAt=-1, hop=[0.06, 1], tongue=True),
     dancer('sadi', HM[0] - 1.05, HM[1] + 0.35, 20, S(82.5, 80))]
v = V((-0.25, 1.05, 2.1), (-0.45, 0.95, -1.9), fov=56, p1=(-0.25, 1.0, 1.85), roll=(-5, -3))
add(80, 85, s, "'dance the night away': he pops up in the middle of the dance floor and dances half out of his hole, the diva beside him", v, guests='dance', holes=holes_by(80.02), rv=S(82.5, 80))
# S25 (b85..89; 'live your life'): downstairs, looking up past the cat: her ceiling full of holes, grit pouring out of them
# in streams off to her sides (round 1: a falling chunk sat on her head, three chunks didn't pour)
s = [kob(holdL='milkbottle', holdScale=1.1)]
v = V((1.7, FY + 0.75, 1.55), (0.5, -1.15, -0.9), fov=62, p1=(1.6, FY + 0.75, 1.45))
add(85, 89, s, "'live your life': downstairs, looking up past the cat: her ceiling full of holes, plaster pouring out of them in streams", v,
    zone='flat', holes=holes_by(85), plaster=[[HA[0], HA[1] + 0.3, 0.3], [HD[0] + 0.3, HD[1] + 0.3, 1.1]], pour=[[*HA, -2], [*HC, -2], [0.35, -0.2, -2]], cracks=0.6, rv=S(87, 85))
# S26 (b89..93): the bunny stalks across the riddled floor, the mallet on her shoulder, eyes on him
s = [A('compote', 'happy_run', 2.4, 0.3, yaw=-120, at=0.1, speed=0.65, mx=-1.0, mz=-0.55, arm='R', hold='mallet', holdScale=1.25, upAt=-1, aim=[0.25, 0.9, -0.35])]
v = V((1.15, 1.1, 2.35), (1.85, 1.0, 0.1), fov=52, p1=(1.0, 1.1, 2.25))
add(89, 93, s, "the bunny stalks across the riddled floor, mallet on her shoulder, eyes on him", v, guests='stare', stare=[1.85, 0.1], holes=holes_by(89), rv=S(91, 89))
# S27 (b93..97; the quiet: the music thins): he dances the charleston with the diva hand in hand, opened to us; behind
# them the bunny creeps up, the mallet raised beside her head (round 1: face to face in profile they read as a kiss)
CAVE = [0.85, -1.5]
BUN = (1.1, -2.65)
s = [*couple(S(95, 93)), {**bunny(*BUN, yaw_to(BUN, (0.62, -1.15)), raise_at=-1, hand='L', up=[0.35, 0.92, -0.15], lean=18), 'clip': 'happy_walk', 'at': 0.35, 'speed': 0.45}]
v = V((0.28, 1.15, 2.5), (0.28, 1.0, -1.6), fov=68)
add(93, 97, s, "the quiet: he dances the charleston with the diva hand in hand, the bunny creeping up behind them, mallet raised", v, drop=True, guests='stare', stare=list(BUN), holes=holes_by(93), rv=S(95, 93))
# S28 (b97..'grab'; 'dance the night away'): the lambada: hand in hand, a hip sway, the free paws up, hearts
def lam(who, x, z, yaw, inner, **o):
    return A(who, 'happy_idle', x, z, yaw=yaw, at=2.125, speed=0, arm=inner, aim=[0.32, -0.3, 0.9], armB='L' if inner == 'R' else 'R', aimB=[0.72, 0.55, 0.22], upAt=-1, sway=12, swayEvery=0.5, hop=[0.03, 1], **o)
s = [lam('saxo', 0.45, -1.15, -32, 'R'), {**lam('sadi', -0.45, -1.15, 32, 'L'), 'aimB': [0.55, 0.78, 0.25]}]
v = V((-0.2, 1.2, 2.3), (-0.2, 0.95, -1.15), fov=60)
add(97, W(14, 0), s, "'dance the night away': the lambada: the diva takes his paw, hips swaying, free paws up", v, guests='dance', holes=holes_by(97), hearts=[[0.0, 1.25, -0.85, 0.3, 1]], rv=S(99, 97))
# S29 ('grab somebody'..'drink'): she grabs him into a tango hold: cheek to cheek, both faces to us, arms round each other,
# the free paws flung out (round 1: the back of his head pressed into her ear, one blob)
b0 = W(14, 0)
TG = 0.4
s = [A('saxo', 'happy_idle', TG, -1.15, yaw=-8, at=2.125, speed=0, arm='R', aim=[0.9, -0.3, -0.3], armB='L', aimB=[0.62, 0.45, 0.62], upAt=-1, sway=9, swayEvery=1000, swayPh=round(b0, 2)),
     A('sadi', 'happy_idle', -TG, -1.15, yaw=8, at=2.125, speed=0, arm='L', aim=[0.9, -0.3, -0.3], armB='R', aimB=[0.62, 0.45, 0.62], upAt=-1, sway=-9, swayEvery=1000, swayPh=round(b0, 2))]
v = V((0.0, 0.85, 2.0), (0.0, 1.05, -1.15), fov=64)
add(b0, W(14, 2), s, "'grab somebody': she grabs him into a tango hold, cheek to cheek", v, drop=True, guests='dance', holes=holes_by(97), rv=S(b0 + 1.0, b0))
# S30 ('drink'..108; 'a little more'): downstairs, low: the cat tips her milk to her mouth under her bellying ceiling,
# plaster dropping beside her (round 1: S10's frame again, the bottle at her cheek, a flat ceiling)
b0 = W(14, 2)
s = [kob(arm='R', aim=[0.12, 0.12, 0.98], hold='milkbottle', holdScale=1.15, upAt=-1, swig=True)]   # the paw at her chest, the bottle from it up to her mouth (a paw at her cheek hid behind her head)
v = V((-0.35, FY + 0.75, 1.2), (0.5, FY + 1.5, -0.85), fov=60)
add(b0, 108, s, "'drink a little more': downstairs, from low: the cat sips her milk under her ceiling bellying down over her, plaster dropping beside her", v, drop=True, zone='flat', holes=holes_by(97),
    plaster=[[1.75, -0.3, 0.3], [-0.9, -0.6, 1.1]], pour=[[*HA, -2], [*HC, -2]], cracks=0.85, sag=0.6, caveAt=[0.3, -1.5], rv=S(105.5, b0))
# S31 (b108..111; the build): the couple dancing hand in hand; behind them the bunny winds her mallet up high
BUN31 = (2.0, -2.6)
s = [*couple(S(109.5, 108)), bunny(*BUN31, yaw_to(BUN31, (-1.4, 1.9)), raise_at=-1, hand='L', up=[0.2, 0.92, -0.35], holdScale=1.45, lean=-8)]
v = V((-1.7, 0.95, 2.4), (0.55, 1.05, -1.5), fov=60)
add(108, 111, s, "the build: the couple dancing hand in hand, the bunny behind them winding her mallet up high", v, drop=True, guests='stare', stare=list(BUN31), holes=holes_by(108), sag=0.2, caveAt=CAVE, rv=S(109.5, 108))
# S32 (b111..114): downstairs, looking up: her ceiling bellies down over her, cracks running out of the holes, plaster
# pouring (round 1: a flat ceiling, seams, the holes gone)
s = [kob(holdL='milkbottle', holdScale=1.1)]
v = V((1.85, FY + 0.85, 1.5), (0.5, -1.25, -0.9), fov=62, p1=(1.75, FY + 0.85, 1.4))
add(W(14, 2), 108, s, "'drink a little more': downstairs, looking up: her ceiling bellies down over her, cracks running out of the holes, plaster pouring; she just holds her milk", v, zone='flat', holes=holes_by(111),
    plaster=[[-0.9, -1.4, 0.1], [1.75, -0.45, 0.5]], pour=[[*HA, -2], [*HC, -2], [*HD, -2]], cracks=1.0, swing=0.3, sag=0.8, caveAt=[0.3, -1.5], rv=S(112.5, 111))
# S33 (b114..120; 'tonight we gon' be it on the floor'): the couple dance hand in hand; a metre clear of him the bunny
# brings her mallet down on the dance floor on 'floor', side on, 0.25 s before the drop (round 1: she kissed him, no paw on it)
FLOOR1 = W(15, 7)
SLAM = S(FLOOR1, 108)
Z33 = -2.5; B33 = (2.32, Z33); WHACK = (1.42, Z33)   # everyone level across a wide frame: the couple, a metre clear of him the burst on empty floor, the bunny side on
s = [*couple(round(SLAM + 0.08, 2), z=Z33, cx=-0.06, **OLD), bunny(*B33, -90, slam=SLAM, hand='L', up=[0.3, 0.88, -0.38], holdScale=1.45)]
v = V((0.95, 1.35, 2.75), (0.95, 0.85, Z33), fov=66)
add(108, 120, s, "the build and 'tonight ... on the floor': the couple dance on, the bunny beside them holds her mallet hauled back over her shoulder, and on 'floor' brings it down on the dance floor beside them", v, guests='stare', stare=list(B33), holes=holes_by(114),
    whacks=[[*WHACK, round(SLAM, 3)]], whackYaw=0, sag=0.25, caveAt=CAVE, rv=round(SLAM + 0.08, 2))
# S34 (the drop, kit beat 120): the cutaway: the front of the slab breaks away and the whole dance floor caves in, tiles,
# chunks and dust tumbling into the cat's living room, the three falling with them (round 1: the slab's cut face stayed
# whole and they seemed stuck to her ceiling)
FALL = dict(my=FY, myAt=0.08, myDur=1.0, air=True, moveAt=0.08)   # at the tiles' pace
C36 = (-0.75, -2.5)   # where the couple lands, beside her armchair (straight down they landed on her)
s = [*[{**a, **FALL, 'mx': round(C36[0] + 0.06, 2), 'mz': round(C36[1] - Z33, 2)} for a in couple(0.6, z=Z33, cx=-0.06, **OLD)],
     A('compote', 'happy_idle', *B33, yaw=-60, at=0.4, speed=0.05, **FALL, mx=-0.25, mz=0.0, arm='L', holdL='mallet', holdScale=1.3, upAt=-1, aim=MALLET_DOWN), kob(holdL='milkbottle', holdScale=1.1)]
add(120, 123, s, "the drop: the cutaway: the slab breaks and the whole dance floor caves in, the club falling into her living room", CUT(y=-0.5, push=0.0, fov=52), zone='cut', guests='gasp',
    spotsAt=[0.55, 6.3], clear=[[1.9, 1.6, 0.3]], holes=holes_by(114), cave=0.02, caveAt=CAVE, frontFirst=1.0, rv=0.75)
# ---- downstairs after the cave-in: the rubble keeps off the marks and every lens's sight lines (a slab at the lens hid
# the party, review 1); the guests dance on the rubble ----
LANDB = (0.35, 0.95)
KEEP = [[0.35, 0.95, 0.85], [1.55, -0.6, 0.7]]
# S35 (b123..126; the drop's chant): the landing: the bunny flat on her back at the cat's feet, seeing stars, the party
# sprawled on the rubble round the armchair; the cat never moved (round 1: the couple's backs, stars over everything)
s = [A('compote', 'laying_idle', *LANDB, yaw=0, at=1.0, speed=0, lift=FY, ground='mesh', dizzy=True, dizzyR=0.38, dizzyY=0.55), kob(holdL='milkbottle', holdScale=1.1)]
v = V((0.45, FY + 1.75, 2.65), (0.45, FY + 0.55, -0.15), fov=56)
add(123, 126, s, "downstairs: the club crashed down round her armchair: the bunny flat on her back at the cat's feet seeing stars, guests sprawled on the rubble; the cat never moved", v,
    zone='flat', where='flat', guests='fall', spotsAuto=[4, 8, 13, 1], fallen=True, caveAt=CAVE, keep=KEEP, rv=S(124.5, 123))
# S36 (b126..130): the lambada goes on beside her armchair, faces to us, the guests dancing on the rubble, the club's gold
# light pouring down through the hole (round 1: two merged heads from behind)
s = [*couple(S(128, 126), z=C36[1], cx=C36[0], lift=FY), kob(holdL='milkbottle', holdScale=1.1)]
v = V((-0.1, FY + 2.5, 5.6), (-0.1, FY + 0.85, -1.3), fov=52)
add(126, 130, s, "the cutaway again: her flat full of the club, the lambada going on beside her armchair, the guests dancing on the rubble, gold light pouring down through the hole", v, drop=True, zone='cut', where='flat', guests='dance', noLamp=True, noTable=True,
    spotsImg={4: (0.18, 3.7), 8: (0.4, 3.9), 13: (0.62, 3.8), 6: (0.84, 3.6)}, shafts=False, fallen=True, caveAt=CAVE, keep=KEEP, rv=S(128, 126))
# S37 (b130..134; 'tonight'): the cat deadpan in her armchair, milk in paw, at the left; the party dancing all round her
# on the rubble (round 1: his face cut at the edge, the party two heads behind a slab)
s = [kob(arm='L', aim=[0.3, -0.12, 0.9], holdL='milkbottle', holdScale=1.1, upAt=-1)]
v = V((0.55, FY + 1.15, 2.25), (0.55, FY + 1.0, -0.9), fov=68)
add(130, 134, s, "'tonight': the cat deadpan in her armchair, milk in paw, the party dancing all round her", v, zone='flat', where='flat', guests='dance',
    spotsImg={4: (0.17, 3.0), 8: (0.83, 3.0), 13: (0.27, 5.0), 6: (0.73, 5.0)}, noLamp=True, noTable=True, fallen=True, caveAt=CAVE, keep=KEEP, rv=S(132, 130))
# S38 (b134..138; 'on the floor'): pulled back: the cat in her armchair and beside it the dog bent over her floor, digging,
# parquet flying up behind him (round 1: both faces cut by the frame)
FH = (1.55, -0.3); FH2 = (2.15, -0.25)
s = [digger(FH2[0], FH2[1] - 0.55, 0, lift=FY), kob(holdL='milkbottle', holdScale=1.1, yaw=25)]
v = V((3.0, FY + 1.35, 1.75), (1.55, FY + 0.8, -0.65), fov=60)
add(134, 138, s, "'on the floor': beside her armchair the dog starts digging her floor, parquet flying; she looks on", v, drop=True, zone='flat', where='flat', guests='dance',
    spotsAuto=[4, 8, 13], fallen=True, caveAt=CAVE, keep=KEEP,
    holes=[[*FH2, 0.5, S(135.45, 134), S(137.8, 134), FY]], dig=[*FH2, 0, 9, 180, FY], noLamp=True, rv=S(136.5, 134))
# S39 (b138..end; the silent button): frontal on the cat, deadpan at us; beside her armchair the dog is gone into her
# floor, only his rear and his kicking legs sticking up; the party stares at him (round 1: a black lump behind rubble)
s = [kob(holdL='milkbottle', holdScale=1.1), popper(*FH, yaw_to(FH, (1.05, 2.3)), at=0.45, up=0.5, top=FY - 0.7)]
v = V((1.05, FY + 1.35, 2.3), (1.05, FY + 0.75, -0.65), fov=60)
add(134, 139.6, s, "'on the floor' and the button: frontal on the cat, deadpan at us; beside her armchair the dog pops up out of a hole in her floor, tongue out, on his way down to the next floor; the party stares", v, zone='flat', where='flat', guests='stare', stare=list(FH),
    spotsAuto=[4, 8, 13, 1], fallen=True, caveAt=CAVE, keep=KEEP,
    holes=[[*FH, 0.55, -1, -1, FY]], dig=[*FH, -1, 9, 125, FY], key=[FH[0] + 0.6, FY + 1.2, FH[1] + 0.9, 1.25, 1.1, 0.95], noLamp=True, still=True, rv=round(S(138, 134) + 0.3, 3))

shots.sort(key=lambda x: x['beat'])
ep = {
    'date': '2026-10-14', 'song': {'title': 'On The Floor', 'artist': 'Jennifer Lopez'},
    'logline': "The song tells every animal on the dance floor to tear it up, so the dog in the rapper's suit and shades digs straight through it: he drops out of the grumpy cat's ceiling downstairs, pops up all over the club while the bunny bouncer plays whack-a-mole, and on the drop the whole dance floor caves in and the party lands in her living room.",
    'new': "src/maps47.js: floorclub (two storeys of one building: the clip's old theatre nightclub upstairs, its dance floor of gold tiles over a concrete slab that is the ceiling of the grumpy cat's flat downstairs; holes that grow through both, a digger's splinter spray, plaster falling, a tunnel bulge under the tiles, whack-a-mole bonks, the whole dance floor caving in tile by tile into her living room with the guests on it, a cutaway view of both rooms stacked in one frame); the whack-a-mole `mallet` prop; looks saxo worldwide (the rapper's suit and shades) and sadi sequins (the singer's silver catsuit); the structure DOWNSTAIRS",
    'notes': "The world, from the official video (contact sheets): an old theatre turned nightclub at night, red velvet, theatre boxes and crystal chandeliers, a packed dance floor, the singer in a silver sequined catsuit before a gold wall crossed by glowing gold bars, the rapper in a black suit and shades. Our club keeps it and puts a floor under it: the dance floor is the ceiling of the cat downstairs. The words, from whitelisted keywords per line: the call-outs name party-goers and what each must do on the floor ('go hard', 'party freak ... step', 'animal ... tear up', 'break a sweat', 'work'); verse 1 'keep moving', 'drinks up', 'pick your body up and drop it', 'change your world', 'tonight'; the chorus's city list (eight cities), 'dance the night away', 'live your life', 'grab somebody, drink a little more'; the hook 'tonight ... on the floor' twice, the first ending as the beat drops. Cast: Saxo in the rapper's black suit and shades (the dog who takes 'animal, tear up the floor' literally), Sadi in the singer's silver sequined catsuit (the diva on the stage; the lambada), Kob in her pink housecoat and curlers (the neighbour downstairs who never moves), Compote in her bouncer suit (security, the whack-a-mole mallet). The cave-in lands on the drop, after the hook's 'floor'.",
    'tiktok_sound': '6917324503026501634',
    'with': ['sadi', 'kob', 'compote'],
    'clips': sorted({a['clip'] for s in shots for a in s['actors']}),
    'tags': {'structure': 'downstairs', 'scenes': ['the cutaway: party upstairs, the cat downstairs', 'the dog digs the dance floor', 'waist-deep, his feet through her ceiling', 'drinks up and her milk', 'upside down out of her ceiling', 'whack-a-mole on the city list', 'dancing half out of a hole', 'the ceiling full of holes', 'the lambada', 'the mallet on the drop', 'the dance floor caves in', 'the party in her living room', 'he pops up out of her floor'],
             'cast': ['saxo', 'sadi', 'kob', 'compote'], 'hook': 'dance', 'maps': ['floorclub'], 'ref': 'none',
             'lyric_literal': "'animal ... tear up the floor' (the dog digs it), 'break a sweat' (tongue out), 'work' (waist-deep), 'drinks up' (the glasses, her milk), 'drop it on the floor' (he drops through it), 'change your world' (upside down in her world), the city list (a whack-a-mole pop or slam on every city), 'dance the night away' (out of his hole), 'grab somebody' (the lambada), 'drink a little more' (her milk), 'on the floor' (the mallet, then the cave-in on the drop), 'tonight ... on the floor' (the party on her floor)",
             'experiment': "Does a physical payoff the whole video builds to (the dance floor caving in on the beat drop, the party landing in the grumpy neighbour's living room), seen in a cutaway of both floors from frame 1, on a 2011 club anthem climbing again with a 702k-video TikTok sound, beat our last two throwback episodes' views at 24 h (Beat It 2.42x, Everybody Wants To Rule The World 3.06x)?"},
    'shots': shots,
}
json.dump(ep, open(os.path.join(HERE, '2026-10-14.json'), 'w'), indent=1, ensure_ascii=False)
os.makedirs(os.path.join(HERE, '..', 'out', 'check'), exist_ok=True)
open(os.path.join(HERE, '..', 'out', 'check', 'otf_rev_times.txt'), 'w').write(','.join(f'{t:.2f}' for t in REV))
print(len(shots), 'shots;', len(WARN), 'warnings')
for b, q in SOLVED.items(): print('   moved', b, q)
for w in WARN: print('  ', w)
