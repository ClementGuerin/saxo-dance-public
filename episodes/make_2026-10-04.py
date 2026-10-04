# make_2026-10-04.py: writes episodes/2026-10-04.json, "Spooky, Scary Skeletons" (Andrew Gold, 1996; the queue being
# empty, picked from SocialCrawl's music data after the night's first run was stopped by the filter while reading the
# charts: its 11 s TikTok sound has 3.46M videos, the most of six spooky-season and chart songs checked; the trend scan
# of 2026-10-04 says spooky season has started).
# No clip: the world is the skeleton dance in a graveyard at midnight (the 1929 cartoon's, every October meme's).
# Ours, "the bone yard" (structure BROKEN RULE OF THREE: the same move lands three times and backfires on the fourth):
# Halloween night, the gang goes trick-or-treating through the graveyard and finds Saxo already there, dancing in the
# skeletons' line in the moonlight. The skulls turn, the skeletons vanish behind the headstones, and as the girls walk
# up the path they jump out at them one by one: Sadi the vampire jumps back and runs, Compote the pumpkin's carrot flies
# and she runs, Kob the witch puffs up to twice her size and ends up in the dead tree. Three for three. Then the big
# skeleton rises out of the open grave at the last one: Saxo. Who is a dog. And they are made of bones. He lights up,
# chomps its leg bone off, and the scarers scream and run; he sniffs them out to the crypt, where they fall apart in
# fright into one big heap of bones. Dog heaven: he dives in. The gang comes back, stares, and kicks a line of
# charlestons in front of the heap, Saxo dancing on top of it with a bone in each paw; the last skeleton, the one he
# chomped, hops up on its one foot, sees it all, and on the song's dead stop falls apart too.
# Beats: 154.079 BPM, kit beat b at b * 60 / 154.079 s (kit beat 0 = song beat 32, the first line's downbeat); a bar =
# 4 beats (1.558 s), a line = 8 beats. Kit lines (beats): K00 b0.4 (the title), K01 b7.9 (shivers, spine), K02 b16.9
# (shock, skulls), K03 b25.5 (doom, tonight), K04 b32.4 (the title), K05 b40.0 (speak), K06 b48.2 (shake, surprise),
# K07 b55.9 (shriek), K08 b65.3 (skeletons), K09 b80.7 (a long line), K10 b96.2 (the title), K11 b104.4 (screams,
# shout), K12 b112.7 (sneak), K13 b119.9 (leave); the instrumental break b128-160; the song's dead stop b160, a silent
# beat to b161. The lyrics stay in episodes/2026-10-04.lyrics.js (the generator reads only their times).
import json, math, os, re, sys
sys.path.insert(0, os.path.dirname(__file__))
from cam import view, vpath, deadpan, swoop, low, topdown

HERE = os.path.dirname(__file__)
PER = 60 / 154.079
def T(b): return b * PER
def S(b, b0): return round(T(b) - T(b0), 3)    # seconds from shot beat b0 to beat b

LOOK = {'saxo': 'saxo', 'sadi': 'vampire', 'kob': 'witch', 'compote': 'pumpkin', 'skel': 'skel'}
HEAD = {'saxo': 1.27, 'sadi': 1.28, 'kob': 1.42, 'compote': 1.42, 'skel': 1.27}     # the top of each head standing (Sadi's bow, Kob's hat, Compote's ears)
FACE = {'saxo': 0.9, 'sadi': 0.84, 'kob': 0.86, 'compote': 0.86, 'skel': 0.97}
RAD = {'saxo': 0.42, 'sadi': 0.38, 'kob': 0.38, 'compote': 0.38, 'skel': 0.31}     # a head's silhouette radius with ears (the skull: 0.3)

# the map (src/maps27.js CEMETERY)
PATH, GATE_Z, CRYPT_Z = 1.1, 7.5, -10.2
STONE_A, STONE_B, STONE_C = (-2.0, 2.6), (2.05, 0.1), (-2.05, -2.6)
GRAVE = (2.7, -4.6)
TREE = (-5.6, -6.2)
LZ = -3.6                                         # the skeletons' dance line, across the path
HEAPP = (0.0, -7.1)                               # where they fall apart, in front of the crypt's steps

def A(who, clip, x, z, **o):
    return {'who': who, 'look': o.pop('look', LOOK[who]), 'clip': clip, 'x': round(x, 3), 'z': round(z, 3), 'face': o.pop('face', 'camera'),
            'yaw': o.pop('yaw', 0), 'at': o.pop('at', 'auto'), **o}
def SK(clip, x, z, **o):                           # the lead skeleton (an actor: QA'd, props, parts taken away)
    return A('skel', clip, x, z, star=False, **o)
def C1(clip, x, z, yaw=0, **o):                    # a skeleton extra: a crowd of one (crowds aren't QA'd; one pose per entry)
    return {'who': 'skel', 'look': 'skel', 'clip': clip, 'n': 1, 'cols': 1, 'jitter': 0, 'x0': round(x, 3), 'z0': round(z, 3), 'face': 'world', 'yaw': yaw, **o}
def yaw_to(frm, to): return round(math.degrees(math.atan2(to[0] - frm[0], to[1] - frm[1])), 1)
CLAW = dict(arm='both', aim='claw')                # paws raised beside the skull, angled forward, striking on the beat ("Animal")
CLAW_HOLD = dict(arm='both', aim='claw', flap=0, upAt=-1)
FLAIL = dict(arm='both', aim='flail')              # arms thrown out wide: panic
FLAP = dict(arm='both', aim='caramell', flapEvery=0.5)   # paws by the ears, flapping: distress
SHIVER = dict(sway=4, swayEvery=0.25)

# ---- a projection check (numbers only): where each face lands in the 9:16 frame at the shot's start and end ----
def _proj(cam, look, fov, pt):
    f = [look[i] - cam[i] for i in range(3)]; n = math.sqrt(sum(v * v for v in f)); f = [v / n for v in f]
    r = [-f[2], 0.0, f[0]]; rn = math.sqrt(r[0] ** 2 + r[2] ** 2) or 1; r = [r[0] / rn, 0.0, r[2] / rn]
    u = [r[1] * f[2] - r[2] * f[1], r[2] * f[0] - r[0] * f[2], r[0] * f[1] - r[1] * f[0]]
    d = [pt[i] - cam[i] for i in range(3)]; z = sum(a * b for a, b in zip(d, f))
    if z <= 0.05: return None
    tv = math.tan(math.radians(fov) / 2); th = tv * 9 / 16
    return (0.5 + sum(a * b for a, b in zip(d, r)) / z / th / 2, 0.5 - sum(a * b for a, b in zip(d, u)) / z / tv / 2)
_src = open(os.path.join(HERE, '2026-10-04.lyrics.js')).read()
_rows = json.loads(re.search(r'window\.LYRICS = (.*?);\n', _src).group(1)); _ends = json.loads(re.search(r'window\.LINE_END = (.*?);\n', _src).group(1))
LINES = [((row[0][0] - 0.35) / PER, e / PER) for row, e in zip(_rows, _ends)]
def has_line(b0, b1): return any(a < b1 and b > b0 for a, b in LINES)
WARN = []
def body(a, end):                               # (who, x, z, face y, head top y) of an actor at the shot's start (0) or end (1)
    who = a['who']; sc = a.get('scale', 1)
    x, z = a['x'] + a.get('mx', 0) * end, a['z'] + a.get('mz', 0) * end
    lift = a.get('lift', 0) + (a.get('my', 0) if end else 0)
    fy, hy, ln = FACE[who] * sc, HEAD[who] * sc, math.radians(a.get('lean', 0))
    if ln and a.get('face') == 'world':           # leaned from the feet: the head comes forward along the facing, and down (S22's sniff cut him at the edge)
        yw = math.radians(a.get('yaw', 0)); x += math.sin(yw) * fy * math.sin(ln); z += math.cos(yw) * fy * math.sin(ln); fy *= math.cos(ln); hy *= math.cos(ln)
    return (who, x, z, fy + lift, hy + lift)
def check(beat, b1, cam, look, fov, actors, end):
    line = has_line(beat, b1)
    for a in actors:
        if a.get('fg') or a.get('lying') or a.get('reveal', 0) >= 1.0: continue
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
def clear_at(v, *pts, r=1.15):                    # no headstone, pumpkin, tree or fog bank at the lens or along its first stretch of sight
    c, f = v; p = lens(v, 0); q = lens(v, -1)
    out = [[round(p[0], 2), round(p[2], 2), r], [round(q[0], 2), round(q[2], 2), r]]
    for k in range(1, 4):
        u = k / 8; out.append([round(p[0] + (f[0] - p[0]) * u, 2), round(p[2] + (f[1] - p[2]) * u, 2), r * 0.8])
    return out + [list(x) for x in pts]
def clear_line(v, r=0.8, n=9):                      # no headstone, pumpkin or tree anywhere along the lens's line of sight
    c, f = v; p = lens(v, 0)
    return [[round(p[0] + (f[0] - p[0]) * k / (n + 1), 2), round(p[2] + (f[1] - p[2]) * k / (n + 1), 2), r] for k in range(1, n + 1)]
def add(beat, b1, actors, lyric, v, **o):
    c, focus = v
    o = {k: val for k, val in o.items() if val is not None}
    o.setdefault('clear', clear_at(v))
    shots.append({'beat': beat, 'kind': 'dance', 'map': 'cemetery', 'actors': actors, 'lyric': lyric, 'cam': c, 'focus': focus, **o})
    fy = focus[2] if len(focus) > 2 else 0
    for k, end in ((0, 0), (-1, 1)):
        cam, look = lens(v, k), (focus[0], c['look'][k] + fy, focus[1])
        check(beat, b1, cam, look, c['fov'], actors, end)
        for oc in _occl(cam, look, c['fov'], [body(a, end)[:4] for a in actors if not a.get('lying')]):
            if not next(a for a in actors if a['who'] == oc.split(' behind ')[0]).get('fg'): WARN.append(f'b{beat}: {oc}{" at the end" if end else ""}')
def clean(actors):                               # the generator's own keys off the actors
    for a in actors: a.pop('lying', None)
    return actors


# ================= a lens search (the bobsled, agency and park episodes'): every face inside the frame and under the
# lyric rows at the shot's start and end, no face inside a nearer head's disc, the lens clear of the graveyard's pieces =================
STONES_ALL = [STONE_A, STONE_B, STONE_C]
def grave_free(c):
    x, y, z = c
    if y < 0.15: return False
    if any(math.hypot(x - sx, z - sz) < 0.55 for sx, sz in STONES_ALL): return False
    # the rows of graves are fine: a shot's `clear` hides the headstones, crosses and pumpkins round the lens and its line of sight
    if abs(z - GATE_Z) < 0.5 and abs(x) > 1.2: return False  # the gate's pillars and the wall
    if z < CRYPT_Z + 2.6 and abs(x) < 2.8: return False       # inside the crypt or on its steps
    if math.hypot(x - TREE[0], z - TREE[1]) < 0.7: return False
    if math.hypot(x - GRAVE[0], z - GRAVE[1]) < 1.1 and y < 1.2: return False
    return True
WHY = {}
def _no(r): WHY[r] = WHY.get(r, 0) + 1; return None
FACING = {}
def _ok(cam, look, fov, phases, line, occ=(), maxoff=105):
    worst = 1.0
    for w, yw in FACING.items():
        x0, z0 = next(((s_[1], s_[2]) for s_ in phases[0] if s_[0] == w), (None, None))
        if x0 is None: continue
        dx, dz = cam[0] - x0, cam[2] - z0; dn = math.hypot(dx, dz) or 1
        if (math.sin(math.radians(yw)) * dx + math.cos(math.radians(yw)) * dz) / dn < math.cos(math.radians(maxoff)): return _no(f'{w} faces away')
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
def lens_for(actors, ang, dist, b0, b1, hs=(1.0,), fov=50, look=None, spread=40, dr=(0.8, 1.5), free=grave_free, push=0.04, facing=True, maxoff=105, **o):
    vis = [a for a in actors if not a.get('fg') and not a.get('lying')]
    FACING.clear(); FACING.update({a['who']: a.get('yaw', 0) for a in vis if a.get('face') == 'world'} if facing else {})
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
                f = _ok(cam, L, fov, phases, line, occ, maxoff)
                if f is None or f < 0: continue
                score = abs(da) / 40 + abs(d - dist) / dist + (0.25 - min(f, 0.25))
                if best is None or score < best[0]: best = (score, cam)
    if best is None:
        raise SystemExit(f'b{b0}: no lens for {[s_[0] for s_ in phases[0]]} round {ang} deg at {dist} m; rejections: {sorted(WHY.items(), key=lambda kv: -kv[1])[:6]}, not free: {nfree}')
    cam = best[1]; p1 = (cam[0] + (L[0] - cam[0]) * push, cam[1], cam[2] + (L[2] - cam[2]) * push)
    return view(tuple(round(c, 3) for c in cam), tuple(round(c, 3) for c in L), fov, p1=tuple(round(c, 3) for c in p1), **o)

# the skeletons' line across the path: four extras round the gap where Saxo dances (a crowd of 5 with a hole)
def line_crowd(clip, at, speed=1.0, **o):
    return {'who': 'skel', 'look': 'skel', 'clip': clip, 'at': at, 'speed': speed, 'n': 5, 'cols': 5, 'x0': 0.0, 'z0': LZ, 'dx': 0.85, 'jitter': 0, 'skip': [[0.0, LZ, 0.3]], **o}
DANCE = dict(clip='thriller_4', at=0.3)            # the skeletons' dance (Mixamo's Thriller part 4: upright and frontal all through; part 2 drops into a crouch, part 3 opens arms out), in sync with Saxo's

# ================= ACT 1 (b0-32): the skeletons' dance, and a dog in the line =================
# the line runs diagonally across the path towards the crypt; Saxo is third in it (the critic's staging, review 1)
LINE = [(-1.6, -2.85), (-0.8, -3.15), (0.0, -3.45), (0.8, -3.75), (1.6, -4.05)]
SXL = LINE[2]
def line_copies(clip, at, speed=1.0, skip=(2,), **o):   # the skeletons in the line, each a crowd of one (same clip, same offset: in step)
    return [C1(clip, x, z, at=at, speed=speed, face=o.pop('face', 'camera') if False else o.get('face', 'camera'), **{k: v for k, v in o.items() if k != 'face'}) for i, (x, z) in enumerate(LINE) if i not in skip]
def ghosts(skip=(2,), **o):                          # the same skeletons as pseudo-actors, for the lens search only
    return [A('skel', 'happy_idle', x, z, **o) for i, (x, z) in enumerate(LINE) if i not in skip]
PUMPS = [[2.55, -7.7, 0.9], [-2.55, -7.6, 0.9]]       # the crypt's jack-o'-lanterns: never behind a ribcage
def moon_for(v, right=13, el=15, d=125):            # the moon `right` deg right of the lens's line and `el` deg up (a low lens sees it behind the crypt)
    c, f = v; p = lens(v, 0); a = math.atan2(f[0] - p[0], f[1] - p[2]) - math.radians(right); e = math.radians(el)
    return [round(p[0] + d * math.cos(e) * math.sin(a), 1), round(p[1] + d * math.sin(e), 1), round(p[2] + d * math.cos(e) * math.cos(a), 1)]
# S01 the hook (12 beats, to 4.7 s: the Short opens on it): low, three-quarters from the front of the line, a slow
# push and a dutch roll: five figures doing the same step on the same beat, and the third one is a dog
s01 = [A('saxo', DANCE['clip'], *SXL, at=DANCE['at'])]
v = lens_for(s01 + ghosts(), -18, 4.6, 0, 12, hs=(0.5, 0.65, 0.8, 0.95), fov=60, spread=30, dr=(0.85, 1.4), push=0.4, roll=[-7, -4], hand=0.2, ease='lin')   # pushes in 40%: from the whole line to the dog between his neighbours
add(0, 12, s01, "HOOK (the title line): midnight in the graveyard, the moon over the crypt: a line of skeletons dances its way across the path in step, and the third dancer in the line, doing the very same moves, is a dog: Saxo",
    v, crowd=line_copies(**DANCE), clear=clear_at(v, *PUMPS), moon=moon_for(v))
# S02 'spine': he has stopped dancing and leans in to the skeleton beside him, tongue out, licking its back
SXS = (LINE[3][0] - 0.88, LINE[3][1]); YS = 76
s02 = [A('saxo', 'happy_idle', *SXS, face='world', yaw=YS, at=0.5, speed=0.4, lean=18, tongue=True)]
s02 = s02 + [SK(DANCE['clip'], *LINE[3], face='world', yaw=90, at=DANCE['at'], scale=1.15)]
c02 = [C1(DANCE['clip'], *LINE[4], yaw=90, at=DANCE['at']), C1(DANCE['clip'], *LINE[1], yaw=90, at=DANCE['at'])]
MID = SXS[0] + 0.5                                  # between his head (leaning in) and the skull, turned away from him
v = view((MID + 0.45, 1.02, SXS[1] + 4.1), (MID, 0.92, SXS[1]), 50, p1=(MID + 0.42, 1.0, SXS[1] + 3.8), ease='lin', roll=[-3, -5])
add(12, 16, s02, "'spine' (K01): close: Saxo has stopped dancing; he leans in to the skeleton beside him, which has its back to him, tongue out, and licks its spine; it keeps dancing",
    v, crowd=c02, clear=clear_at(v, *PUMPS))
# S03 'shock', 'skulls': every skull turns to the gate, to us; the dog licks on
st = line_copies('happy_idle', 2.125, speed=0.0, face='world', yaw=0, skip=(2, 3))
s03 = [s02[0], SK('happy_idle', *LINE[3], face='world', yaw=0, at=2.125, speed=0.0, scale=1.15)]   # the one he licks, frozen too
v = view((0.0, 1.2, -3.45 + 6.5), (0.0, 0.95, -3.45 + 0.1), 60, p1=(0.0, 1.18, -3.45 + 6.2), ease='lin')
add(16, 20, s03, "'shock', 'skulls' (K02): the skeletons stop dead and every skull turns straight at us; in the line, the dog licks on",
    v, crowd=st, clear=clear_at(v, *PUMPS), stars=['saxo'])
# S04 the reverse: the girls at the gate (Sadi the vampire, Compote the jack-o'-lantern, Kob the witch with her broom), frozen, square to the lens
G_SADI, G_COMP, G_KOB = (-0.8, 6.25), (0.05, 6.45), (0.88, 6.2)
s04 = [A('sadi', 'happy_idle', *G_SADI, at=2.125, speed=0.0), A('compote', 'happy_idle', *G_COMP, at=2.125, speed=0.0, hold='carrot'),
       A('kob', 'happy_idle', *G_KOB, at=2.125, speed=0.0, hold='broom')]
v = lens_for(s04, 180, 3.9, 20, 24, hs=(0.85, 1.0), fov=50, spread=15)
add(20, 24, s04, "'soul' (K02): the reverse: the girls at the cemetery gate in their Halloween costumes, frozen, staring back at a line of skulls",
    v, stars=['sadi', 'kob'])
# S05 'doom': the skeletons scatter to hide behind the headstones, arms flailing; the dog alone in the path looks round
s05 = [A('saxo', 'being_surprised_and_looking_right', *SXL, at=0.3, speed=0.6)]
c05 = [C1('silly_run', x, z, yaw=(-90 if x < 0 else 90), at=0.2 + 0.2 * i, mx=(-1.5 if x < 0 else 1.5), **FLAIL) for i, (x, z) in enumerate(LINE) if i != 2]
v = view((0.1, 1.45, SXL[1] + 6.2), (0.0, 0.85, SXL[1] - 0.3), 60, p1=(0.08, 1.4, SXL[1] + 5.9), ease='lin')
add(24, 28, s05, "'doom' (K03): the skeletons scatter off the path in every direction, arms flailing, to hide behind the headstones; the dog is left alone in the path, looking round",
    v, crowd=c05, clear=clear_at(v, *PUMPS), stars=['saxo'])
# S06 'tonight': across the path at the big headstone: a skull peeks round its edge, and another round the next one
SAW = 0.365                                          # the big stone's half width (maps27: 0.73 m, round-topped: ~1 m tall at its sides)
PK1, PK2 = (STONE_A[0] - 0.36, STONE_A[1] + SAW - 0.02), (STONE_A[0] - 0.36, STONE_A[1] - SAW + 0.02)
s06 = []                                          # no cast in frame: the hidden skeletons alone
c06 = [C1('happy_idle', *PK1, yaw=90, at=2.125, speed=0.0, **SHIVER, **CLAW_HOLD), C1('happy_idle', *PK2, yaw=90, at=2.125, speed=0.0, **CLAW_HOLD)]
v = view((1.75, 1.0, STONE_A[1]), (STONE_A[0], 0.98, STONE_A[1]), 50, p1=(1.6, 1.0, STONE_A[1]), ease='lin')
add(28, 32, s06, "'tonight' (K03): across the path at the big headstone: two skulls peek round its edges, waiting",
    v, crowd=c06, stars=['saxo'])

# ================= ACT 2 (b32-80): three scares, three hits =================
# S07 the title line: the girls tiptoe up the path between the graves, close together; right behind them two
# skeletons tiptoe along in step, claws raised
W0 = 3.4
s07 = [A('sadi', 'happy_walk', -0.55, W0, face='world', yaw=180, at=0.2, mz=-1.2, **SHIVER), A('compote', 'happy_walk', 0.35, W0 + 0.35, face='world', yaw=180, at=0.6, mz=-1.2, hold='carrot'),
       A('kob', 'happy_walk', 1.0, W0 - 0.3, face='world', yaw=180, at=1.0, mz=-1.2, hold='broom')]
c07 = [C1('happy_walk', -0.3, W0 + 1.25, yaw=180, at=0.3, speed=0.5, mz=-1.2, **CLAW_HOLD), C1('happy_walk', 0.75, W0 + 1.45, yaw=180, at=0.9, speed=0.5, mz=-1.2, **CLAW_HOLD)]
v = view((0.25, 1.05, -1.6), (0.2, 0.95, 2.6), 54, p1=(0.25, 1.05, -1.9), ease='lin', roll=[2, 3])
add(32, 40, s07, "the title line (K04): the girls tiptoe up the path between the graves, huddled together; right behind them, two skeletons tiptoe along in step, claws raised",
    v, crowd=c07, stars=['sadi', 'compote'])
# S08 'speak': Sadi lags behind; right behind her the big skeleton rises over her bow, claws up; she has no idea
SA = (-0.5, 2.2)
s08 = [A('sadi', 'happy_idle', *SA, face='world', yaw=0, at=2.125, speed=0.1),
       SK('happy_walk', SA[0] + 0.3, SA[1] - 0.75, face='world', yaw=-10, at=0.2, speed=0.3, mz=0.12, scale=1.3, **CLAW_HOLD)]
v = lens_for(s08, 0, 3.6, 40, 48, hs=(1.0, 1.15), fov=50, spread=15, facing=False, look=(SA[0] + 0.12, 1.12, SA[1] - 0.35))
add(40, 48, s08, "'speak' (K05): Sadi lags behind; right behind her the big skeleton rises over her bow, claws raised; she has no idea",
    v, stars=['sadi'])
# S09 'surprise': side on, she turns into it: the big skeleton lunges, claws up, and she hops back, paws flapping
s09 = [A('sadi', 'jumping_backwards_dodge', SA[0], SA[1] + 0.05, face='world', yaw=180, at=0.45, speed=0.9, hop=[0.18, 0.5], air=True, **FLAP),
       SK('zombie_attack_with_right_hand', SA[0] - 0.05, SA[1] - 0.95, face='world', yaw=0, at=0.3, speed=0.8, scale=1.3, **CLAW_HOLD)]
v = lens_for(s09, 90, 3.3, 48, 52, hs=(1.0, 1.15), fov=52, spread=15, facing=False, push=0.05)
add(48, 52, s09, "'surprise' (K06): side on, she turns round into it: the big skeleton lunges, claws up, and Sadi hops back, paws flapping by her ears",
    v, stars=['sadi'])
# S10 'shake': she runs for it, side on, mid-stride, paws flapping, towards frame left
s10 = [A('sadi', 'silly_run', SA[0] + 0.1, SA[1] - 0.5, face='world', yaw=0, at=0.2, mz=1.0, **FLAP)]
v = lens_for(s10, 90, 3.3, 52, 56, hs=(0.95, 1.1), fov=54, spread=10, facing=False, ease='lin', look=(SA[0] + 0.1, 0.9, SA[1] + 0.25))
add(52, 56, s10, "'shake' (K06): Sadi runs for it back down the path, side on, paws flapping by her ears. One",
    v, stars=['sadi'])
# S11 'shriek': Compote by the next headstone: a skeleton shoots up out of the ground in front of her, claws up; she
# shrieks, paws flapping, and her carrot flies at the lens
CP = (0.55, 0.1); CSK = (CP[0] - 0.05, CP[1] - 0.95)
s11 = [A('compote', 'jumping_backwards_dodge', *CP, face='world', yaw=180, at=0.45, speed=0.9, hop=[0.18, 0.5], air=True, hold='carrot', **FLAP,
         toss={'at': 0.15, 'to': [CP[0] - 0.6, 0.0, CP[1] + 0.9], 'dur': 0.8, 'arc': 1.3}),
       SK('zombie_attack_with_right_hand', *CSK, face='world', yaw=0, at=0.3, speed=0.8, scale=1.25, lift=-1.6, my=1.6, myAt=0.0, myDur=0.5, air=True, reveal=0.55, **CLAW_HOLD)]
v = lens_for(s11, -90, 3.3, 56, 60, hs=(1.0, 1.15), fov=52, spread=15, facing=False, push=0.05)
add(56, 60, s11, "'shriek' (K07): Compote the jack-o'-lantern by the next headstone: a skeleton shoots up out of the ground in front of her, claws up; she shrieks, paws flapping, and her carrot flies",
    v, dust=[[CSK[0], CSK[1], 0.05, 0.7]], dirt=[[CSK[0], CSK[1], 0.0, 1.0]], stars=['compote'])
# S12 'zombies': Compote runs for it too, frame right; the skeleton behind her, frame left, doubled up laughing. Two
s12 = [A('compote', 'silly_run', CP[0] - 0.1, CP[1] + 0.2, face='world', yaw=0, at=0.2, mz=0.8, hop=[0.1, 0.5], air=True, **FLAIL),
       SK('happy_idle', CP[0] - 0.6, CP[1] - 0.9, face='world', yaw=30, at=2.125, speed=0.05, scale=1.2, **CLAW_HOLD)]   # still in its scare pose as she runs (three loops: no laugh read on a skull)
v = lens_for(s12, 35, 3.8, 60, 64, hs=(0.95, 1.1, 1.25), fov=56, spread=15, dr=(0.85, 1.4), maxoff=60, ease='lin')
add(60, 64, s12, "'zombies' (K07): Compote runs for it too, paws flapping; behind her the skeleton stays put in its scare pose, claws up. Two",
    v, clear=clear_at(v, [3.15, -1.9, 0.8], [6.0, -2.4, 1.0], [-3.1, 1.2, 0.8], [-3.2, -5.2, 0.8], [3.0, 3.4, 0.8], [1.8, 4.5, 0.8], [-1.75, 4.7, 0.8], [-5.6, -6.2, 1.0], [-6.6, 3.8, 1.0]), stars=['compote'])   # the pumpkin and the dead tree behind the skeleton's skull
# S13 'skeletons': Kob alone on the path: three skeletons pop up round her at once, claws up; the witch-cat puffs up
# and jumps out of her skin, twice, paws flapping, broom and all
KB = (-0.45, -2.3)
s13 = [A('kob', 'jump_up', *KB, face='world', yaw=10, at=0.25, speed=0.8, hold='broom', scale=1.35, hop=[0.5, 4], hopPh=63, air=True, **FLAP),
       SK('zombie_attack_with_right_hand', KB[0] - 1.0, KB[1] - 0.55, face='world', yaw=45, at=0.3, scale=1.15, **CLAW_HOLD)]
c13 = [C1('zombie_attack_with_right_hand', KB[0] + 1.05, KB[1] - 0.5, yaw=-45, at=0.5, **CLAW_HOLD),
       C1('zombie_attack_with_right_hand', KB[0] + 0.05, KB[1] - 1.3, yaw=0, at=0.1, **CLAW_HOLD), C1('zombie_attack_with_right_hand', KB[0] - 1.3, KB[1] + 0.75, yaw=60, at=0.7, **CLAW_HOLD)]
v = view((KB[0] + 0.15, 1.45, KB[1] + 5.3), (KB[0], 1.4, KB[1] - 0.4), 50, p1=(KB[0] + 0.14, 1.43, KB[1] + 5.0))
add(64, 72, s13, "'skeletons' (K08): Kob alone on the path: three skeletons pop up round her at once, claws up; the witch-cat puffs up to twice her size and jumps out of her skin, paws flapping, broom and all",
    v, crowd=c13, stars=['kob'])
# S14 the scared cat on top of the tombstone, puffed up and trembling, hugging her broom; below, the skeletons cheer. Three
TK = (STONE_C[0] + 0.02, STONE_C[1])
s14 = [A('kob', 'happy_idle', *TK, face='world', yaw=60, at=2.1, speed=0.15, lift=1.33, hold='broom', scale=1.3, lean=12, **SHIVER)]
c14 = [C1('celebrating_after_a_win', TK[0] + 0.6, TK[1] - 0.95, yaw=40, at=1.6, speed=0.8), C1('celebrating_after_a_win', TK[0] + 1.1, TK[1] - 0.25, yaw=70, at=2.0, speed=0.8)]
v = view((TK[0] + 3.5, 2.05, TK[1] + 4.55), (TK[0] + 0.45, 2.0, TK[1] - 0.15), 54, p1=(TK[0] + 3.4, 2.05, TK[1] + 4.4), ease='lin')
add(72, 80, s14, "'skeletons' (K08): the scared cat ends up on top of the tombstone, still puffed up and trembling, hugging her broom; below her the skeletons cheer. Three for three",
    v, crowd=c14, stars=['kob'])

# ================= ACT 3 (b80-128): the fourth one is a dog =================
SX = (1.55, -4.45)                                  # Saxo on all fours by the open grave, nose at its edge
s15 = [A('saxo', 'happy_idle', SX[0] + 0.15, SX[1] + 0.1, face='world', yaw=105, at=0.4, speed=0.35, lean=22, tongue=True)]
c15 = [C1('happy_walk', SX[0] - 1.4, SX[1] + 0.25, yaw=90, at=0.2, speed=0.5, mx=0.4, **CLAW_HOLD), C1('happy_walk', SX[0] - 2.0, SX[1] - 0.45, yaw=80, at=0.6, speed=0.5, mx=0.4, **CLAW_HOLD)]
v = view((4.45, 1.0, SX[1] + 0.55), (SX[0] - 0.1, 0.85, SX[1] + 0.05), 54, p1=(4.3, 0.98, SX[1] + 0.5), ease='lin', roll=[-4, -6])
add(80, 88, s15, "the long line (K09): the last one: Saxo at the edge of the open grave, leaning in to sniff it, tongue out; behind him two skeletons tiptoe up, claws raised",
    v, crowd=c15, stars=['saxo'])
# S16 BOO: side on, the big skeleton bursts up out of the open grave right in front of him, skull to him, claws up
SXB = (SX[0] + 0.05, SX[1] - 0.05)
s16 = [A('saxo', 'happy_idle', *SXB, face='world', yaw=90, at=0.5, speed=0.3),
       SK('zombie_attack_with_right_hand', GRAVE[0] + 0.15, GRAVE[1] + 0.05, face='world', yaw=-90, at=0.2, scale=1.4, lift=-1.9, my=1.9, myAt=0.05, myDur=0.3, air=True, reveal=0.4, **CLAW_HOLD)]
v = view((2.25, 1.1, SX[1] + 3.85), (2.25, 1.12, SX[1] - 0.1), 52, p1=(2.25, 1.1, SX[1] + 3.6))
add(88, 92, s16, "(K09) side on: the big skeleton bursts up out of the open grave right in front of the dog, skull turned to him, claws up: BOO",
    v, dust=[[GRAVE[0] + 0.15, GRAVE[1] + 0.05, 0.05, 0.8]], stars=['saxo'])
# S17 the reverse on Saxo: he isn't scared at all: tongue hanging out, hopping and wiggling with joy
YF = -60
s17 = [A('saxo', 'happy_idle', *SXB, face='world', yaw=YF, at=0.2, speed=0.8, hop=[0.1, 0.5], sway=7, swayEvery=0.5, tongue=True)]
v = deadpan(SXB, 0.98, 2.75, cam_y=1.02, push=0.18, fov=48, ang=YF)
add(92, 96, s17, "(K09) the reverse: Saxo isn't scared at all: tongue hanging out, he hops and wiggles with joy, eyes fixed on all those bones",
    v, stars=['saxo'])
# S18 the title line: CHOMP: the bone across his jaws, wagging; the skeleton on one leg beside him, claws still up
SKL = (GRAVE[0] - 0.35, GRAVE[1] + 0.45); SXC = (SX[0] - 0.55, SX[1] + 0.9)
s18 = [SK('happy_idle', *SKL, face='world', yaw=-35, at=0.4, speed=0.3, hideParts=['legL'], **CLAW_HOLD),
       A('saxo', 'happy_idle', *SXC, face='world', yaw=20, at=0.6, speed=0.5, chew=True, hop=[0.06, 1])]
v = lens_for(s18, 0, 3.4, 96, 100, hs=(0.95, 1.1), fov=50)
add(96, 100, s18, "the title line (K10): CHOMP: Saxo has the skeleton's leg bone across his jaws, wagging; the skeleton stands on one leg, claws still up",
    v, stars=['saxo'])
# S19 the skeleton's deadpan on its one leg, looking at the dog with its leg bone
Y19 = yaw_to(SKL, SXC) - 30
s19 = [SK('happy_idle', *SKL, face='world', yaw=Y19, at=2.125, speed=0.0, hideParts=['legL'])]
v = deadpan(SKL, 0.75, 3.1, cam_y=0.95, push=0.15, fov=46, ang=Y19)
add(100, 104, s19, "the skeleton's deadpan: it stands on its one leg, looking at the dog with its leg bone",
    v, stars=['saxo'])
# S20 'screams': three-quarters from the right of the path: the skeletons recoil screaming, paws by their skulls; the dog comes at them, bone in his jaws
RZ = -5.6
SXR = (1.6, RZ + 0.6)
s20 = [A('saxo', 'happy_walk', *SXR, face='world', yaw=-60, at=0.3, speed=0.8, mx=-0.3, mz=0.05, chew=True),
       SK('happy_idle', 0.35, RZ - 0.35, face='world', yaw=15, at=2.125, speed=0.0, lean=-12, flap=0, upAt=-1, sway=4, swayEvery=0.25, **FLAP)]
RSK = [(-0.55, RZ - 0.45), (-1.45, RZ - 0.35)]
c20 = [C1('happy_idle', x, z, yaw=8 + 6 * i, at=2.125, speed=0.0, flap=0, upAt=-1, sway=4, swayEvery=0.25, **FLAP) for i, (x, z) in enumerate(RSK)]
v = lens_for(s20 + [A('skel', 'happy_idle', x, z, face='world', yaw=10) for x, z in RSK], -15, 5.5, 104, 108, hs=(1.0, 1.15, 1.3), fov=58, spread=25, dr=(0.85, 1.5), maxoff=60,
             free=lambda c: grave_free(c) and abs(c[0]) < 1.5)   # from the path: a headstone in the grass stood in front of the middle one
add(104, 108, s20, "'screams' (K11): the skeletons recoil screaming, paws up by their skulls; and here comes the dog, bone in his jaws",
    v, crowd=c20, clear=clear_at(v) + clear_line(v), stars=['saxo'])
# S21 'shout': the chase, three-quarters ahead of side on: the skeletons flee flailing, the dog mid-stride behind them
CZ = -6.0
s21 = [A('saxo', 'happy_run', 0.4, CZ, face='world', yaw=-90, at=0.3, mx=-0.7, chew=True)]
CSKs = [(-1.5, CZ - 0.1), (-0.9, CZ + 0.2), (-0.3, CZ - 0.2)]
c21 = [C1('silly_run', x, z, yaw=-90, at=0.2 + 0.25 * i, mx=-0.75, **FLAIL) for i, (x, z) in enumerate(CSKs)]
v = lens_for(s21 + [A('skel', 'happy_idle', x, z, face='world', yaw=-90, mx=-0.75) for x, z in CSKs], -35, 5.0, 108, 112, hs=(0.95, 1.1, 1.25), fov=56, spread=15, dr=(0.8, 1.6), maxoff=80, ease='lin')
add(108, 112, s21, "'shout' (K11): the chase, three-quarters ahead: the skeletons run for their lives, arms flailing, the dog right behind them with the bone in his jaws",
    v, crowd=c21, stars=['saxo'])
# S22 'sneak': at the crypt, a skeleton peeks round a column, trembling; the dog sniffs his way towards it, bone in his jaws
s22 = [A('saxo', 'happy_walk', 0.9, -6.5, face='world', yaw=-120, at=0.3, speed=0.45, mx=-0.4, mz=-0.25, lean=32, chew=True)]
v = lens_for(s22, -78, 3.5, 112, 116, hs=(0.6, 0.75), fov=52, spread=20, dr=(0.9, 1.3), maxoff=55, ease='lin')
add(112, 116, s22, "'sneak' (K12): the dog follows the trail towards the crypt, nose to the path, the bone still across his jaws",
    v, stars=['saxo'])
CC = (2.3, -9.0)                                    # the crypt's front right corner (maps27: a 4.6 m box, its front face at z -9.0)
L22 = (-1.1, 1.05, -4.6)                            # front left of the crypt: the corner stands between the lens and the hider
_dx, _dz = CC[0] - L22[0], CC[1] - L22[2]; _n = math.hypot(_dx, _dz); _u = (_dx / _n, _dz / _n); _r = (-_u[1], _u[0])
HID = (round(CC[0] + _u[0] * 0.3 - _r[0] * 0.08, 3), round(CC[1] + _u[1] * 0.3 - _r[1] * 0.08, 3))   # 0.3 m past the corner, 0.08 m behind its line: a third of its skull and a claw show
c22b = [C1('happy_idle', *HID, yaw=yaw_to(HID, (L22[0], L22[2])), at=2.125, speed=0.0, **SHIVER, **CLAW_HOLD)]
v = view(L22, (HID[0] - 0.3, 1.0, HID[1] + 0.25), 40, p1=(L22[0] + 0.15, 1.05, L22[2] - 0.2), ease='lin')
add(116, 120, [], "(K12) the reverse: at the corner of the crypt a skull peeks out, trembling, a claw up: the one he's sniffing out",
    v, crowd=c22b, clear=clear_at(v, [2.55, -7.7, 0.9]), stars=['saxo'])
# S23 'leave': side on: the skeletons huddle in one trembling clump against the crypt's shut doors; the dog trots up, wagging
CL = [(-0.5, -8.66), (-0.14, -8.84), (0.2, -8.64), (0.55, -8.84)]   # on the top step (0.45 m), backs to the doors, in a clump
s23 = [A('saxo', 'happy_walk', 1.5, -7.25, face='world', yaw=-60, at=0.3, mx=-0.35, chew=True)]
c23 = [C1('happy_idle', x, z, yaw=(28, -6, 34, 2)[i], at=2.125, speed=0.0, y0=0.45, sway=5, swayEvery=0.25, flapPh=0.25 * i, **FLAP) for i, (x, z) in enumerate(CL)]
v = lens_for(s23 + [A('skel', 'happy_idle', x, z, face='world', yaw=15, lift=0.45) for x, z in CL[:3]], -20, 4.8, 120, 124, hs=(1.0, 1.15, 1.3), fov=60, spread=20, dr=(0.8, 1.5), maxoff=55, ease='lin')
add(120, 124, s23, "'leave' (K13): the skeletons cower in one trembling clump against the crypt's shut doors, paws up by their skulls; the dog trots up to them, wagging, the bone across his jaws",
    v, crowd=c23, doors=0, stars=['saxo'])
# S24 they fall apart in fright: dust, and where they stood, one big heap of bones and skulls
s24 = [A('saxo', 'being_surprised_and_looking_right', 0.55, -5.55, face='world', yaw=200, at=0.2, speed=0.6, chew=True)]
v = view((2.9, 1.25, -3.4), (0.15, 0.85, -6.5), 52, p1=(2.8, 1.23, -3.55))
add(124, 128, s24, "(K13) they fall apart in fright, all at once: a puff of dust, and where they stood, one big heap of bones and skulls",
    v, heap=[{'x': HEAPP[0], 'z': HEAPP[1], 's': 0.0, 'r': 1.15, 'h': 1.0}], stars=['saxo'])

# ================= ACT 4, the break (b128-160): dog heaven, and the last skeleton =================
HP = {'x': HEAPP[0], 'z': HEAPP[1], 'r': 1.15, 'h': 1.0}
# S25 the run-up: from the ground, a little ahead of side on: he runs at the heap
s25 = [A('saxo', 'happy_run', -2.4, -6.3, face='world', yaw=90, at=0.0, mx=1.0, chew=True, reveal=0.5)]
v = view((0.35, 0.32, -2.55), (-0.85, 0.78, -6.65), 64, p1=(0.4, 0.32, -2.65), ease='lin')
add(128, 132, s25, "the break: from the ground, a little ahead of side on, Saxo runs at the heap of bones",
    v, heap=[HP], clear=clear_at(v, *PUMPS), stars=['saxo'])
# S26 he drops in from the air: dust, and his grinning head pops up in the middle of the bones, the bone in his jaws
UP = 1.45
s26 = [A('saxo', 'happy_idle', HEAPP[0], HEAPP[1] + 0.25, at=0.5, speed=0.5, lift=UP + 0.28, my=-UP, myAt=0.0, myDur=0.3, air=True, chew=True, reveal=0.2)]
v = view((0.6, 1.4, HEAPP[1] + 3.7), (0.1, 1.15, HEAPP[1] + 0.2), 54, p1=(0.55, 1.37, HEAPP[1] + 3.5))
add(132, 136, s26, "he drops into the heap from the air: a puff of dust, and his grinning head pops up in the middle of the bones, a bone in his jaws",
    v, heap=[HP], dust=[[HEAPP[0] + 0.7, HEAPP[1] + 0.7, 0.3, 0.7]], stars=['saxo'])
# S27 from above: dog heaven: on his back on top of the heap, wriggling, the bone in his jaws, skulls round him
s27 = [A('saxo', 'shot_to_the_chest_falling_backwards', HEAPP[0], HEAPP[1] + 0.35, face='world', yaw=0, at=9.0, speed=0.0, ground='mesh', lift=0.62, sway=8, swayEvery=1, chew=True, lying=True)]
v = topdown((HEAPP[0], HEAPP[1] - 0.05), 4.6, 4.1, fov=54, roll=(0, 10))
add(136, 144, s27, "from above: dog heaven: Saxo on his back on top of the heap of bones, wriggling with joy, the bone in his jaws, skulls all round him",
    v, heap=[HP], stars=['saxo'])
# S28 the girls are back, frozen in a row, staring at the dog in the bones (the lens is the heap); behind them the last
# skeleton, the one-legged one, hops up on its one foot (2 beats), stops dead at the sight (1 beat) and falls apart (1 beat)
GB = [(-0.9, -3.5), (0.0, -3.42), (0.9, -3.5)]
GIRLS = [A('sadi', 'happy_idle', *GB[0], face='world', yaw=180, at=2.125, speed=0.0), A('compote', 'happy_idle', *GB[1], face='world', yaw=180, at=2.125, speed=0.0, hold='carrot'),
         A('kob', 'happy_idle', *GB[2], face='world', yaw=180, at=2.125, speed=0.0, hold='broom')]
LS0, LS1 = (-2.75, -1.75), (-1.75, -2.0)           # in from frame right (seen from the heap) to just behind and beside Sadi: never behind a girl
v = lens_for(GIRLS + [A('skel', 'happy_idle', *LS1, face='world', yaw=180)], 178, 4.2, 144, 152, hs=(1.5, 1.65, 1.8), fov=68, spread=12, dr=(0.9, 1.45), ease='lin',
             free=lambda c: grave_free(c) or (c[2] > -8.8 and abs(c[0]) < 2.6 and c[1] > 0.6))   # from over the heap (his point of view); over the crypt's low steps is free (the lens looks away from it)
V28 = v
s28a = GIRLS + [SK('happy_idle', *LS0, face='world', yaw=165, at=2.125, speed=0.0, mx=LS1[0] - LS0[0], mz=LS1[1] - LS0[1], hideParts=['legL'], hop=[0.16, 0.5], air=True, reveal=0.45)]
add(144, 146, s28a, "the girls are back, frozen in a row, staring at the dog in the bones (the lens is the heap); behind them the last skeleton, the one-legged one, hops in on its one foot",
    v, doors=0, fog=0, clear=clear_at(v, [STONE_C[0], STONE_C[1], 0.6], [-1.75, 4.7, 0.8], [-1.6, 6.4, 0.8], [-3.1, 1.2, 0.8], [1.8, 4.5, 0.8], [1.6, 6.3, 0.8]), stars=['sadi', 'kob'])   # and the jack-o'-lanterns behind its shoulder
s28b = GIRLS + [SK('happy_idle', *LS1, face='world', yaw=180, at=2.125, speed=0.0, hideParts=['legL'])]
v = (dict(V28[0], ang=[V28[0]['ang'][1]] * 2, r=[V28[0]['r'][1]] * 2, h=[V28[0]['h'][1]] * 2), V28[1])
add(146, 149, s28b, "it stops dead behind them, staring at the heap of its friends with the dog on top",
    v, doors=0, fog=0, clear=clear_at(v, [STONE_C[0], STONE_C[1], 0.6], [-1.75, 4.7, 0.8], [-1.6, 6.4, 0.8], [-3.1, 1.2, 0.8], [1.8, 4.5, 0.8], [1.6, 6.3, 0.8]), stars=['sadi', 'kob'])   # and the jack-o'-lanterns behind its shoulder
add(149, 152, [dict(a) for a in GIRLS], "and falls apart too: a puff of dust, a single skull on a few ribs, its one leg sticking straight up; the girls don't even turn round",
    v, remains={'x': LS1[0], 'z': LS1[1], 's': 0.05, 'yaw': 200, 'k': 1.05}, dust=[[LS1[0] - 0.1, LS1[1] + 0.45, 0.02, 1.1]], doors=0, fog=0, clear=clear_at(v, [STONE_C[0], STONE_C[1], 0.6], [-1.75, 4.7, 0.8], [-1.6, 6.4, 0.8], [-3.1, 1.2, 0.8], [1.8, 4.5, 0.8], [1.6, 6.3, 0.8]), stars=['sadi', 'kob'])   # and the jack-o'-lanterns behind its shoulder
# S29 they shrug it off and kick a line of charlestons in front of the heap, the skeleton's remains low in the middle of
# the frame, and on top of the heap the dog dances too, a bone in each paw
FL = -5.3; REM = {'x': -0.8, 'z': -3.95, 'yaw': 10, 'k': 0.95}
CH = round((1.6 - 2 * S(156, 152)) % 2.467, 3)      # the charleston's offset: S31 (two shots on) lands on its kick
s29 = [A('sadi', 'charleston', -1.35, FL, at=CH), A('compote', 'charleston', 0.1, FL - 0.1, at=CH), A('kob', 'charleston', 1.2, FL, at=CH),
       A('saxo', 'charleston', HEAPP[0] + 0.55, HEAPP[1] + 0.15, at=CH, lift=0.75, chew=True)]
v = lens_for(s29, 4, 5.2, 152, 156, hs=(1.3, 1.5, 1.7), fov=58, spread=15, dr=(0.9, 1.45), ease='lin')
add(152, 156, s29, "they shrug it off and kick a line of charlestons in front of the heap, the last skeleton's remains low in front of them, its leg in the air; on top of the heap the dog dances too, a bone in each paw",
    v, heap=[HP], remains=REM, fog=0, clouds=False, clear=clear_at(v, *PUMPS), stars=['saxo', 'sadi'])
# S30 the last bar: a high wide over the graves, the moon, the four dancing at the heap and the remains
s30 = [dict(a, at=round(a['at'] + S(156, 152), 3)) for a in s29]
v = view((2.2, 4.0, FL + 7.5), (0.0, 1.4, FL - 0.9), 58, p1=(2.1, 3.9, FL + 7.2), ease='lin')
V30 = v
MOON30 = moon_for(v, right=-6, el=6)                 # low over the hill, top left of the high wide (the lens looks down 21 deg)
add(156, 160, s30, "the last bar: a high wide over the graveyard in the moonlight, the four dancing at the heap of bones",
    v, heap=[HP], remains=REM, moon=MOON30, fog=0, clouds=False, noGrave=True, clear=clear_at(v, *PUMPS), stars=['saxo', 'sadi'])   # the open grave at the frame's edge read as a black box
# S31 the dead stop: one silent beat, everyone frozen mid-kick
s31 = [dict(a, speed=0.0, at=1.6) for a in s30]            # frozen on the charleston's kick
v = lens_for(s31, -4, 5.4, 160, 161, hs=(1.8, 1.95, 2.1), fov=60, spread=10, dr=(0.85, 1.45), steady=True)   # from a little left: the remains' leg falls right of Sadi
v = (dict(v[0], ang=[v[0]['ang'][0]] * 2, r=[v[0]['r'][0]] * 2, h=[v[0]['h'][0]] * 2, look=[v[0]['look'][0]] * 2), v[1])   # locked off
add(160, 161, s31, "the song's dead stop (b160): one silent beat, all four frozen mid-kick at the heap",
    v, heap=[HP], remains=REM, moon=MOON30, fog=0, clouds=False, noGrave=True, clear=clear_at(v, *PUMPS), still=True, stars=['saxo', 'sadi'])

for s in shots: clean(s['actors'])
shots.sort(key=lambda x: x['beat'])
ep = {
    'date': '2026-10-04', 'song': {'title': 'Spooky, Scary Skeletons', 'artist': 'Andrew Gold'},
    'logline': "On Halloween night the graveyard's skeletons jump out at the gang one by one and it works every time, Sadi, Compote, Kob, until they try it on Saxo, who is a dog, and they are made of bones: he chomps a leg off, they run screaming and fall apart in fright, he dives into the heap, and the last one-legged skeleton hops up, sees it and falls apart too.",
    'new': "the procedural skeleton (src/bones.js: a cartoon skeleton from primitives skinned rigidly to a clone of Saxo's skeleton, a fifth body `skel` whose `hideParts` take its bones away); src/maps27.js: cemetery (a graveyard at midnight under a full moon: an iron gate, a gravel path, headstones and crosses, an open grave, a crypt whose doors open, dead trees, jack-o'-lanterns, low fog, bats, a church on the hill, bone heaps with dust, one skeleton's remains (`remains`), clods of earth out of a hole (`dirt`), the moon placed per shot (`moon`), `clouds` off); props bone, pail, broom and a bone in the mouth (`chew`); looks sadi_vampire, compote_pumpkin",
    'notes': "No clip for this song (a 1996 novelty track; the meme's world is the 1929 cartoon's skeleton dance in a graveyard at midnight), so the world comes from that and from the words: whitelisted keywords per line (shivers, spine, shock, skulls, doom, tonight, speak, shake, surprise, shriek, zombies, skeletons, screams, shout, sneak, leave). Kob wears her existing witch look; the cast is whole: Saxo leads (the dog in the skeletons' line, the fourth scare, the bone), Sadi (the vampire) is scared first, Compote (the pumpkin) second, Kob (the witch) third and ends up in the dead tree; the skeletons are the procedural `skel` (the big one, an actor) and crowds of it.",
    'with': ['sadi', 'kob', 'compote', 'skel'],
    'clips': ['happy_idle', 'happy_walk', 'happy_run', 'silly_run', 'laughing_standing', 'being_surprised_and_looking_right', 'jumping_backwards_dodge', 'zombie_attack_with_right_hand',
              'zombie_screaming', 'jump_up', 'crawling_forward_on_hands_and_knees', 'celebrating_after_a_win', 'shot_to_the_chest_falling_backwards', 'injured_jumping_while_standing'],
    'yt': [0, 59.5],
    'tags': {'structure': 'broken rule of three', 'scenes': ['skeletons', 'jump scare', 'bone theft', 'chase', 'bone heap'], 'cast': ['saxo', 'sadi', 'kob', 'compote'], 'hook': 'dance', 'maps': ['cemetery'], 'ref': 'none',
             'lyric_literal': "'shivers' (the girls shiver at the gate), 'spine' (he sniffs a skeleton's spine), 'skulls' (every skull turns to the lens), 'surprise' (the jump scare), 'shriek' (Compote shrieks), 'skeletons' (three at once round Kob), 'screams', 'shout' (the skeletons scream and run), 'sneak' (he sniffs them out), 'leave' (they fall apart)",
             'experiment': "Does a seasonal throwback whose TikTok sound has 3.46M videos (the October skeleton meme), opened on the dance with the lead in the dancers' line and a reversal built on what the lead is (a dog among bones), get more views at 24 h than our chart-song episodes?"},
    'shots': shots,
}
json.dump(ep, open(os.path.join(HERE, '2026-10-04.json'), 'w'), indent=1, ensure_ascii=False)
print(len(shots), 'shots;', len(WARN), 'warnings')
for w in WARN: print('  ', w)
