# make_2026-10-04-2.py: writes episodes/2026-10-04-2.json, "Beautiful Things" (Benson Boone, 2024; a trending song, the
# queue being empty: its 34 s TikTok sound has 4.69M videos, the official video 1.1B views, #58 on Spotify's global daily
# chart on 2026-10-03).
# The clip: the band drives a white van into a red-rock desert, hauls its drum kit and amps up the rocks and plays on
# the rim of a canyon at golden hour; the singer (dark curls, a black jacket with a fleece collar over a white t-shirt)
# alone in dry grass at sunset.
# Ours, "good boy" (a new structure, OBEDIENCE: the song gives orders and the dog obeys every one on the word, worse
# timed each time; the payoff is the release that never comes): Saxo's band shoots its video on the canyon rim, Saxo in
# the singer's curls and fleece jacket. His power ballad is full of dog commands, and he's a dog. 'take': he snaps the
# treat out of Sadi's paw mid-song (the band stops dead and stares); 'find': she flicks one into the sage and he dives
# in after it; 'good': he pops out with it, a pat on the head; 'sit', 'wait': he sits, right there, mid-verse, and
# Compote has had 'enough'. 'night': the sun goes down. Chorus 2 is the trick: 'stay', a biscuit on his nose, frozen,
# trembling ('want', 'need'), 'take': he flips it up and catches it with the singer's own backflip. The band goes wild.
# Then the jackpot: a giant biscuit on his nose, 'stay'... but the second half of the chorus never says 'take' again:
# 'want', 'need', 'need', and on the last 'beautiful things' Kob, the cat, gets up from her drums, strolls over and eats
# it off his nose. He never moves: nobody released him.
# Beats: 105.000 BPM, kit beat b at b * 60 / 105 s (kit beat 0 = song beat 176, bar 44); a bar = 4 beats (2.2857 s).
# The command words' kit beats (keytimes.py in ~/personal/saxo-video/songs/beautiful-things: whitelisted words only):
# take b15.73 | the silence b16.9-19.8 | verse 3 from b20 | find b29.24 | good b33.65 | sit b37.29, wait b38.24 |
# tell b44.29, know b45.69, enough b48.11 | peace b51.43, love b54.44 | night b58.96 | lose b62.46 | chorus 2: stay
# b73.68 | want b78.64, need b80.01 | take b85.93 | beautiful b90.53, things b91.89 | b94-108 the tag line and the band |
# stay b109.67 | want b114.64, need b116.01 | need b121.50 | beautiful b126.53, things b127.89 | the song's stop at
# b130.2, its reverb to b133 (76.0 s). The lyrics stay in episodes/2026-10-04-2.lyrics.js (the generator reads only their times).
import json, math, os, re, sys
sys.path.insert(0, os.path.dirname(__file__))
from cam import view, vpath, deadpan, swoop, low, orbit

HERE = os.path.dirname(__file__)
PER = 60 / 105
def T(b): return b * PER
def S(b, b0): return round(T(b) - T(b0), 3)    # seconds from shot beat b0 to beat b

LOOK = {'saxo': 'rocker', 'sadi': 'denim', 'kob': 'beanie', 'compote': 'punk'}
HEAD = {'saxo': 1.33, 'sadi': 1.28, 'kob': 1.42, 'compote': 1.42}      # the top of each head standing (his curls, her bow, the beanie, the ears)
FACE = {'saxo': 0.9, 'sadi': 0.84, 'kob': 0.86, 'compote': 0.86}
RAD = {'saxo': 0.46, 'sadi': 0.38, 'kob': 0.38, 'compote': 0.38}       # a head's silhouette radius (his curls are wide)
SIT = 0.17                                        # a seated body's face and head come down this much (the situp's top: the hips at 0.08 m, standing 0.22)

# the map (src/maps28.js CANYON)
EDGE_Z = -4.2
MIC, SADI_M, COMP_M, DRUMS, KOB_M, BUSH = (0.0, -0.9), (-1.4, -1.2), (1.45, -1.3), (0.95, -2.75), (0.95, -3.3), (-3.1, 1.1)
STAY = (0.0, 0.35)                                # downstage, in front of the mic stand: where he sits for the tricks
TRAINER = (-0.82, 0.32)                           # Sadi beside him, facing him in profile

def A(who, clip, x, z, **o):
    return {'who': who, 'look': o.pop('look', LOOK[who]), 'clip': clip, 'x': round(x, 3), 'z': round(z, 3), 'face': o.pop('face', 'camera'),
            'yaw': o.pop('yaw', 0), 'at': o.pop('at', 'auto'), **o}
def yaw_to(frm, to): return round(math.degrees(math.atan2(to[0] - frm[0], to[1] - frm[1])), 1)
GUITAR = dict(hold='guitar')
DRUMMING = dict(face='world', yaw=0, hold='dstick', holdL='dstick', arm='both', aim='drums', sit=True, lift=0.08, at=0.05, speed=0.0)   # on her stool, over the kit (scaled 0.8 in the map)
DRUM_CLIP = 'sitting_talking'                     # seated, head up, the drums swing on the arms: the deadpan drummer (the drum clip bowed her head over the kit)
BEG = dict(arm='both', aim='heart')               # paws folded at the chest: a dog begging
SEATED = 'situps'                                 # frozen at the top of a sit-up (clip 1.0 s): the bottom on the floor, the face up; the
                                                  # seated clips sit the chibi only 6 cm lower than standing (hips 0.16 against 0.22: it read
                                                  # as standing), and a squat bows the head
def sitter(x, z, **o):                            # Saxo sitting like a dog, begging: reads from the side or three-quarter (the legs forward)
    return A('saxo', SEATED, x, z, at=o.pop('at', 1.0), speed=o.pop('speed', 0.0), sit=True, **{**BEG, **o})
def band(saxo=None, sadi=True, comp=True, kob=True, fg=()):
    out = []
    if saxo: out.append(saxo)
    if sadi: out.append(A('sadi', 'playing_a_guitar', *SADI_M, **GUITAR, **({'fg': True} if 'sadi' in fg else {})))
    if comp: out.append(A('compote', 'playing_the_bass_guitar', *COMP_M, **GUITAR, **({'fg': True} if 'compote' in fg else {})))
    if kob: out.append(A('kob', DRUM_CLIP, *KOB_M, **DRUMMING, **({'fg': True} if 'kob' in fg else {})))
    return out

# ---- a projection check (numbers only): where each face lands in the 9:16 frame at the shot's start and end ----
def _proj(cam, look, fov, pt):
    f = [look[i] - cam[i] for i in range(3)]; n = math.sqrt(sum(v * v for v in f)); f = [v / n for v in f]
    r = [-f[2], 0.0, f[0]]; rn = math.sqrt(r[0] ** 2 + r[2] ** 2) or 1; r = [r[0] / rn, 0.0, r[2] / rn]
    u = [r[1] * f[2] - r[2] * f[1], r[2] * f[0] - r[0] * f[2], r[0] * f[1] - r[1] * f[0]]
    d = [pt[i] - cam[i] for i in range(3)]; z = sum(a * b for a, b in zip(d, f))
    if z <= 0.05: return None
    tv = math.tan(math.radians(fov) / 2); th = tv * 9 / 16
    return (0.5 + sum(a * b for a, b in zip(d, r)) / z / th / 2, 0.5 - sum(a * b for a, b in zip(d, u)) / z / tv / 2)
_src = open(os.path.join(HERE, '2026-10-04-2.lyrics.js')).read()
_rows = json.loads(re.search(r'window\.LYRICS = (.*?);\n', _src).group(1)); _ends = json.loads(re.search(r'window\.LINE_END = (.*?);\n', _src).group(1))
LINES = [((row[0][0] - 0.35) / PER, e / PER) for row, e in zip(_rows, _ends)]
def has_line(b0, b1): return any(a < b1 and b > b0 for a, b in LINES)
WARN = []
def body(a, end):                               # (who, x, z, face y, head top y) at the shot's start (0) or end (1)
    who = a['who']; sc = a.get('scale', 1)
    x, z = a['x'] + a.get('mx', 0) * end, a['z'] + a.get('mz', 0) * end
    lift = a.get('lift', 0) + (a.get('my', 0) if end else 0) - (SIT if a.get('sit') else 0)
    fy, hy, ln = FACE[who] * sc, HEAD[who] * sc, math.radians(a.get('lean', 0))
    if ln and a.get('face') == 'world':
        yw = math.radians(a.get('yaw', 0)); x += math.sin(yw) * fy * math.sin(ln); z += math.cos(yw) * fy * math.sin(ln); fy *= math.cos(ln); hy *= math.cos(ln)
    return (who, x, z, fy + lift, hy + lift)
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
def clear_at(v, *pts, r=1.2):                     # no sage, tuft or boulder at the lens or along its first stretch of sight
    c, f = v; p = lens(v, 0); q = lens(v, -1)
    out = [[round(p[0], 2), round(p[2], 2), r], [round(q[0], 2), round(q[2], 2), r]]
    for k in range(1, 4):
        u = k / 8; out.append([round(p[0] + (f[0] - p[0]) * u, 2), round(p[2] + (f[1] - p[2]) * u, 2), r * 0.8])
    return out + [list(x) for x in pts]
DUSK_FROM = 56                                    # 'night' (b58.96): the sun is down from the shot that carries it, and stays down
def add(beat, b1, actors, lyric, v, **o):
    c, focus = v
    o = {k: val for k, val in o.items() if val is not None}
    o.setdefault('clear', clear_at(v))
    if beat >= DUSK_FROM: o.setdefault('zone', 'dusk')
    shots.append({'beat': beat, 'kind': 'dance', 'map': 'canyon', 'actors': actors, 'lyric': lyric, 'cam': c, 'focus': focus, **o})
    fy = focus[2] if len(focus) > 2 else 0
    for k, end in ((0, 0), (-1, 1)):
        cam, look = lens(v, k), (focus[0], c['look'][k] + fy, focus[1])
        check(beat, b1, cam, look, c['fov'], actors, end)
        for oc in _occl(cam, look, c['fov'], [body(a, end)[:4] for a in actors]):
            if not next(a for a in actors if a['who'] == oc.split(' behind ')[0]).get('fg'): WARN.append(f'b{beat}: {oc}{" at the end" if end else ""}')
def clean(actors):                               # the generator's own keys off the actors
    for a in actors: a.pop('sit', None)
    return actors

# ================= a lens search (the earlier episodes'): every face inside the frame and under the lyric rows at the
# shot's start and end, no face inside a nearer head's disc, the lens on the shelf and clear of the gear =================
GEAR = [(MIC[0], MIC[1] + 0.42, 0.25), (DRUMS[0], DRUMS[1], 0.75), (SADI_M[0] - 0.55, SADI_M[1] - 0.95, 0.45), (COMP_M[0] + 0.55, COMP_M[1] - 0.95, 0.45), (BUSH[0], BUSH[1], 1.0)]
def shelf_free(c):
    x, y, z = c
    if y < 0.14 or z < EDGE_Z + 0.4: return False
    return not any(math.hypot(x - gx, z - gz) < r and y < 1.3 for gx, gz, r in GEAR)
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
def lens_for(actors, ang, dist, b0, b1, hs=(1.0,), fov=50, look=None, spread=40, dr=(0.8, 1.5), free=shelf_free, push=0.04, facing=True, maxoff=105, **o):
    vis = [a for a in actors if not a.get('fg')]
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
def held(v):                                       # the same lens, locked off at its start
    c, f = v
    return (dict(c, ang=[c['ang'][0]] * 2, r=[c['r'][0]] * 2, h=[c['h'][0]] * 2, look=[c['look'][0]] * 2), f)

# =====================================================================================================================
# BEAT 1, the hook (b0-11, the riff after chorus 1): the band rocks on the canyon rim at golden hour
# S00 the swoop: from high and wide (the whole band, the canyon, the low sun) diving to 20 cm in front of the singer
HOOK_SADI = (-0.62, 0.48)
s00 = [A('saxo', 'charleston', *MIC, face='world', yaw=-25, at=0.7),
       A('sadi', 'happy_idle', *HOOK_SADI, face='world', yaw=15, at=0.4, holdL='biscuit', holdScale=1.0, arm='L', aim=[0.72, 0.2, 0.35], fg=True),   # her left paw held out sideways at him: the biscuit broadside to us
       A('kob', DRUM_CLIP, *KOB_M, **DRUMMING, fg=True)]
v = low((-0.05, 0.45, 1.6), (-0.12, 0.85, -0.9), (-0.02, 0.43, 1.25), fov=60, roll=(-8, -5))
add(0, 4, s00, "the hook: low on the rock singer dog dancing at the mic on the canyon rim, his eyes on the biscuit his guitarist holds up in the foreground", v)
# S01 a low dolly-in on Saxo and Sadi rocking side by side, dutch
s01 = band(A('saxo', 'shimmy', *MIC), comp=False, fg=('kob',))
v = low((-0.95, 0.2, 2.5), (-0.65, 0.8, -1.0), (-0.85, 0.2, 1.9), fov=60, roll=(-9, -6))
add(4, 8, s01, "low and dutch on the singer and his guitarist rocking out at the edge of the drop", v)
# S02 Kob's deadpan at the drums: frontal, locked, a narrow lens, pink beanie, unimpressed
v = deadpan(KOB_M, 0.8, 3.0, cam_y=0.68, fov=40)
add(8, 11, [A('kob', DRUM_CLIP, *KOB_M, **DRUMMING)], "the drummer's deadpan: the cat in the pink beanie behind her kit, unimpressed", v, stars=['kob'])

# BEAT 2, 'take' (b15.73): the first command. Sadi holds a biscuit out; on the word he snaps it out of her paw, mid-song
SADI_TAKE = (MIC[0] - 1.15, MIC[1])
YS, YX = -78, 78
def snap_pair(snap_s):
    return [A('saxo', 'happy_idle', *MIC, face='world', yaw=YS, at=1.0, **({'treat': {'mouth': snap_s}} if snap_s is not None else {})),
            A('sadi', 'happy_idle', *SADI_TAKE, face='world', yaw=YX, at=0.4, hold='biscuit', holdScale=1.5, arm='R', aim=[0.0, 0.3, 1.0],
              **({'holdTo': snap_s} if snap_s is not None else {}))]
s03 = snap_pair(None)
v = view((-0.57, 0.5, 2.9), (-0.57, 0.95, -0.9), 46, p1=(-0.57, 0.5, 2.75))   # from low: the sky behind the gap between their heads
add(11, 14, s03, "his guitarist pulls a dog biscuit from the pouch at her hip and holds it out to him, mid-song", v)
s04 = snap_pair(S(15.73, 14))
s04[0]['lean'] = 12
v = held(view((-0.57, 0.5, 2.75), (-0.57, 0.95, -0.9), 46))
add(14, 17, s04, "'take': he snaps it out of her paw on the word: the biscuit in his jaws, her paw empty", v)
# S05 the silence (b16.9-19.8): the band frozen, all turned to stare at him chewing; a slow creep, no bounce
s05 = [A('saxo', 'happy_idle', *MIC, at=1.0, speed=0.35, treat={'mouth': True}),
       A('sadi', 'happy_idle', *SADI_M, face='world', yaw=yaw_to(SADI_M, MIC) - 30, speed=0.0, at=0.5, **GUITAR),
       A('compote', 'happy_idle', *COMP_M, face='world', yaw=yaw_to(COMP_M, MIC) + 30, speed=0.0, at=0.5, **GUITAR),
       A('kob', DRUM_CLIP, *KOB_M, face='world', yaw=yaw_to(KOB_M, MIC) + 25, hold='dstick', holdL='dstick', speed=0.0, at=0.05, lift=0.08, sit=True)]
s05[2]['fg'] = True; s05[3]['fg'] = True
v = lens_for(s05, -18, 3.4, 17, 20, hs=(0.95, 1.1), fov=50, spread=15, push=0.06, ease='lin', maxoff=80)
add(17, 20, s05, "the band stops dead: in the silence his guitarist stares at the singer chewing his biscuit", v, still=True, noMic=True)

# BEAT 3, verse 3 (from b20): the commands escalate
# S06 the band kicks back in, he dances at the mic, low and dutch
s06 = [A('saxo', 'charleston', *MIC, at=0.45), A('kob', DRUM_CLIP, *KOB_M, **DRUMMING)]
v = low((0.55, 0.22, 1.9), (0.3, 0.85, -1.4), (0.5, 0.22, 1.45), fov=60, roll=(8, 5))
add(20, 24, s06, "the band kicks back in and he dances the verse at the mic, the canyon behind him", v)
# S07 Sadi flicks a biscuit off into the big sage: from behind the bush, the biscuit flying at the lens
TOSS_S = S(25.2, 24)
L07 = (-3.55, 1.45, 2.05)
s07 = [A('sadi', 'happy_idle', *SADI_M, face='world', yaw=yaw_to(SADI_M, (L07[0], L07[2])), at=0.3, hold='biscuit', arm='R', aim=[0.55, 0.55, 0.6],
         toss={'at': TOSS_S, 'to': [BUSH[0] + 0.15, 1.05, BUSH[1] - 0.1], 'dur': 0.6, 'arc': 0.7, 'scale': 1.6})]
v = view(L07, (SADI_M[0], 0.85, SADI_M[1]), 50, p1=(L07[0] + 0.1, L07[1] - 0.05, L07[2] - 0.15))
add(24, 28, s07, "she flicks a biscuit off into the big sage bush: it flies at us over the bush", v, clear=clear_at(v))
# S08 'find' (b29.24): he crawls nose first into the bush, side on, his rear and legs sticking out, the bush shaking
FIND = (BUSH[0] + 1.02, BUSH[1] - 0.12)   # the crawl carries his head ~0.5 m ahead of the mark: his head in the mound, his back half out
s08 = [A('saxo', 'crawling_forward_on_hands_and_knees', *FIND, face='world', yaw=-95, at=0.3, speed=0.7, noLie=True, tongue=True)]
v = view((FIND[0] + 1.1, 0.9, FIND[1] + 2.3), (FIND[0] - 0.4, 0.42, FIND[1]), 50, p1=(FIND[0] + 1.0, 0.88, FIND[1] + 2.1))   # from behind his shoulder: his rear and legs sticking out at us
add(28, 32, s08, "'find': he crawls nose first into the sage after it, side on, his rear and legs sticking out, the bush shaking", v,
    rustle=[S(29.24, 28) - 0.3, S(32, 28) + 0.2])
# S09 'good' (b33.65): he pops out with it in his mouth, she pats his head, hearts
GOOD = (BUSH[0] + 0.95, BUSH[1] - 0.1); GSADI = (GOOD[0] + 0.62, GOOD[1] + 0.12)
s09 = [A('saxo', 'happy_idle', *GOOD, face='world', yaw=20, at=1.2, treat={'mouth': True}),
       A('sadi', 'happy_idle', *GSADI, face='world', yaw=yaw_to(GSADI, GOOD) + 40, at=0.5, arm='R', aim=[0.1, 0.8, 0.55], upAt=S(33.4, 32))]
v = lens_for(s09, 15, 2.8, 32, 36, hs=(1.0, 1.15), fov=50, spread=20, maxoff=80)
add(32, 36, s09, "'good': he pops out of the bush with the biscuit in his jaws, and she pats him on the head, hearts popping", v,
    hearts=[[GOOD[0], 1.2, GOOD[1], S(33.65, 32)]], rustle=[0, 0.4])
# S10 'sit' (b37.29), 'wait' (b38.24): he sits on the floor, right there, mid-verse; from his side at his height, the band beyond
s10 = [sitter(*MIC, face='world', yaw=0), A('kob', DRUM_CLIP, *KOB_M, **DRUMMING, fg=True)]
v = view((2.6, 0.62, 0.1), (-0.05, 0.66, -0.55), 52, p1=(2.45, 0.62, 0.05))   # room in front of his snout   # side on at his height: his legs forward on the floor, the mic stand towering over him
add(36, 40, s10, "'sit': he sits down on the floor on the spot, mid-verse, and 'wait'-s; the band plays on round him", v)
# S11 Kob's second deadpan: from low and to the side, still drumming, still unimpressed
v = deadpan(KOB_M, 0.86, 3.2, cam_y=0.74, fov=36, ang=8)
add(40, 44, [A('kob', DRUM_CLIP, *KOB_M, **DRUMMING)], "the cat at the drums again, from low: not impressed by a dog sitting at his own gig", v, stars=['kob'])
# S12 'tell', 'know': Compote has had enough: she stomps over to him, glaring
C12 = (COMP_M[0] + 0.55, COMP_M[1] + 0.15)
s12 = [A('compote', 'happy_idle', *COMP_M, face='world', yaw=-15, at=0.3, speed=0.0, **GUITAR)]
v = deadpan(COMP_M, 0.98, 2.9, cam_y=1.0, fov=40, ang=-15)
add(44, 48, s12, "the bassist's deadpan glare at the dog sitting at his own gig", v, stars=['compote'])
# S13 'enough' (b48.11): standing over him, she points him back to the mic, furious
C13 = (0.88, -1.0)
s13 = [A('saxo', 'charleston', *MIC, at=0.84), A('kob', DRUM_CLIP, *KOB_M, **DRUMMING)]
v = low((-0.55, 0.22, 1.9), (-0.1, 0.85, -1.2), (-0.45, 0.22, 1.45), fov=60, roll=(-8, -5))
add(48, 52, s13, "'enough': he's back on his feet at the mic, dancing", v)
# S14 'peace', 'love': back on his feet, he sings the love line out; hearts over his guitarist
s14 = [A('saxo', 'long_yell_leaning_forward', *MIC, at=0.8), A('sadi', 'playing_a_guitar', *SADI_M, **GUITAR, face='world', yaw=yaw_to(SADI_M, MIC) - 15)]
v = lens_for(s14, 10, 3.0, 52, 56, hs=(1.0, 1.15), fov=50, spread=20, maxoff=65)
add(52, 56, s14, "'love': back on his feet, he sings it; hearts over his guitarist", v, hearts=[[SADI_M[0], 1.45, SADI_M[1], S(54.44, 52)]])
# S15 'night' (b58.96): the sun goes down on the far rim; a wide of the band against the sunset (dusk from here on)
s15 = band(A('saxo', 'charleston', *MIC, at=1.2))
v = lens_for(s15, 20, 6.0, 56, 60, hs=(1.4, 1.6), fov=56, spread=20)
add(56, 60, s15, "'night': the sun goes down over the canyon, the band at dusk", v, noBush=True, clear=clear_at(v, r=2.2))
# S16 'lose' (b62.46): his big note at the edge of the drop, while behind him she holds another biscuit up high
LOSE = (MIC[0], MIC[1] - 0.6); LSADI = (-0.85, -2.25)
s16 = [A('saxo', 'long_yell_while_standing_leaning_back', *LOSE, at=0.5), A('sadi', 'happy_idle', *LSADI, face='world', yaw=yaw_to(LSADI, LOSE) - 25, hold='biscuit', arm='R', aim=[0.45, 0.85, 0.25])]
v = lens_for(s16, -25, 3.6, 60, 66, hs=(0.9, 1.05), fov=54, spread=20, maxoff=80)
add(60, 66, s16, "'lose': his big note at the edge of the drop, while behind him she holds another biscuit up high", v, noMic=True)

# BEAT 4, chorus 2's first half (b66-94): the trick
STAY_YAW = 0
def above(ang, dist=2.35, h=1.22, look=0.74, fov=44, push=0.12):   # a stay shot: three-quarters and a little above his face, so the biscuit shows on his muzzle
    a = math.radians(ang); p0 = (STAY[0] + math.sin(a) * dist, h, STAY[1] + math.cos(a) * dist)
    p1 = (STAY[0] + math.sin(a) * (dist - push), h - 0.02, STAY[1] + math.cos(a) * (dist - push))
    return view(p0, (STAY[0], look, STAY[1]), fov, p1=p1, ease='lin')
# S17 the build (b66-72): she holds the biscuit up in front of his nose; he sits up and begs at it
s17 = [sitter(*STAY, face='world', yaw=-90, sway=3, swayEvery=0.5), A('sadi', 'happy_idle', TRAINER[0] - 0.12, TRAINER[1], face='world', yaw=90, hold='biscuit', holdScale=1.5, arm='R', aim=[0.0, 0.3, 1.0])]
v = view((-0.47, 0.72, STAY[1] + 2.9), (-0.47, 0.68, STAY[1]), 50, p1=(-0.47, 0.72, STAY[1] + 2.75))   # side on: he sits on the floor and begs at it
add(66, 72, s17, "she holds a biscuit out in front of his nose; he sits up and begs at it", v, noMic=True)
# S18 'stay' (b73.68): she sets it on his nose: frozen, from a little above
s18 = [sitter(*STAY, face='world', yaw=STAY_YAW, treat={'nose': S(73.6, 72)})]
v = above(42, dist=2.4, h=1.5, look=0.72)
add(72, 76, s18, "'stay': the biscuit balanced on his nose; he freezes", v, noMic=True)
# S19 'want', 'need': trembling, a low three-quarter
s19 = [sitter(*STAY, face='world', yaw=STAY_YAW, treat={'nose': True}, sway=2.5, swayEvery=0.125)]
v = low((-1.0, 0.3, STAY[1] + 2.6), (STAY[0], 0.8, STAY[1]), (-0.9, 0.3, STAY[1] + 2.35), fov=56, roll=(-7, -5))
add(76, 82, s19, "'want', 'need': he trembles, eyes on it, frozen", v, noMic=True)
# S20 the line before 'take': still frozen, the trainer watching
s20 = [sitter(*STAY, face='world', yaw=STAY_YAW, treat={'nose': True}, sway=2.5, swayEvery=0.125), A('sadi', 'happy_idle', *TRAINER, face='world', yaw=yaw_to(TRAINER, STAY) - 25, at=0.6)]
v = lens_for(s20, 40, 3.1, 82, 86, hs=(1.45, 1.6), fov=48, spread=15, maxoff=80)
add(82, 86, s20, "still frozen, the trainer watching...", v, noMic=True)
# S21 'take' (b85.93, on the cut): he flips it up and catches it with the singer's own backflip: side on, the arc across the frame
s21 = [A('saxo', 'standing_backflip', *STAY, face='world', yaw=90, at=0.0, once=True, air=True, noLie=True, treat={'flip': 0.45, 'dur': 1.1, 'h': 1.4})]
v = view((STAY[0] - 0.1, 0.75, STAY[1] + 4.5), (STAY[0] - 0.1, 1.1, STAY[1]), 56, p1=(STAY[0] - 0.1, 0.75, STAY[1] + 4.35))
add(86, 89, s21, "'take': he flips the biscuit up off his nose and catches it with a backflip, side on", v, noMic=True, dust=[[STAY[0], STAY[1], 1.45, 0.8]])
# S22 'beautiful things': he lands chewing in bliss; the band cheers, paws up; the cat doesn't
s22 = [A('saxo', 'happy_idle', *STAY, at=1.6, treat={'mouth': True}),
       A('sadi', 'high_enthusiasm_fist_pump', *TRAINER, face='world', yaw=yaw_to(TRAINER, STAY) - 35),
       A('compote', 'high_enthusiasm_fist_pump', 0.85, 0.05, face='world', yaw=-40)]
v = lens_for(s22, 5, 3.8, 89, 94, hs=(1.0, 1.15), fov=54, spread=20, maxoff=80)
add(89, 94, s22, "'beautiful things': he lands with it in his jaws, chewing in bliss; the band cheers, paws up", v, noMic=True)
# S23-S24 the tag line and the band (b94-102): a dance break at sunset
s23 = [A('sadi', 'charleston', -1.05, -0.75, at=0.84), A('saxo', 'charleston', *MIC, at=0.84), A('compote', 'charleston', 1.05, -0.75, at=0.84), A('kob', DRUM_CLIP, *KOB_M, **DRUMMING, fg=True)]
v = lens_for(s23[:3], 0, 4.6, 94, 98, hs=(0.6, 0.75), fov=58, spread=12, roll=[6, 4])
add(94, 98, s23, "the band goes wild: the three kick the charleston in a line at sunset", v, noMic=True)
s24 = band(A('saxo', 'gangnam', *MIC, at=1.2))
v = lens_for(s24, -20, 6.0, 98, 102, hs=(1.4, 1.6), fov=56, spread=20)
add(98, 102, s24, "the four rocking at sunset on the rim", v, noMic=True, noBush=True, clear=clear_at(v, r=2.2))

# BEAT 5, chorus 2's second half (b102-133): the jackpot that never comes
# S25 the build (b102-108): she holds up a GIANT biscuit; he begs at it
SADI25 = (TRAINER[0] - 0.25, TRAINER[1])
s25 = [sitter(*STAY, face='world', yaw=-90, sway=4, swayEvery=0.5), A('sadi', 'happy_idle', *SADI25, face='world', yaw=90, hold='bigbiscuit', arm='R', aim=[0.55, 0.85, -0.1])]
v = view((-0.6, 0.95, STAY[1] + 3.6), (-0.6, 0.95, STAY[1]), 54, p1=(-0.6, 0.94, STAY[1] + 3.4))   # side on: the jackpot up beside her head on our side, he begs at it
add(102, 108, s25, "the jackpot: she holds up a giant biscuit; he begs harder", v, noMic=True)
# S26 'stay' (b109.67): the giant one on his nose, frozen, from a little above
s26 = [sitter(*STAY, face='world', yaw=STAY_YAW, treat={'nose': S(109.6, 108), 'big': True})]
v = above(-15, dist=2.65, h=1.15, look=0.78, fov=44)
add(108, 114, s26, "'stay': the giant biscuit across his nose; frozen again", v, noMic=True)
# S27 'want', 'need': he trembles harder; behind him the cat gets up from her drums (the plant)
s27 = [sitter(*STAY, face='world', yaw=STAY_YAW, treat={'nose': True, 'big': True}, sway=3.5, swayEvery=0.125),
       A('kob', 'happy_walk', KOB_M[0] + 0.9, KOB_M[1] + 0.4, face='world', yaw=-20, speed=1.4, mx=-0.6, mz=1.2)]
v = lens_for(s27, -5, 3.8, 114, 119, hs=(0.9, 1.05), fov=50, spread=15)
add(114, 119, s27, "'want', 'need': he shakes, frozen; behind him the cat gets up from her drums", v, noMic=True)
# S28 'need' (b121.5): his pleading eyes over the giant biscuit... the word 'take' never comes
s28 = [sitter(*STAY, face='world', yaw=STAY_YAW, treat={'nose': True, 'big': True}, sway=3.5, swayEvery=0.125)]
v = above(10, dist=2.45, h=0.95, look=0.82, fov=44, push=0.1)
add(119, 123, s28, "'need': his pleading eyes over the giant biscuit; the release never comes", v, noMic=True)
# S29 the cat strolls in beside him (b123-127)
KOB_EAT = (STAY[0] + 0.62, STAY[1] + 0.6)
K29 = (KOB_EAT[0] + 0.9, KOB_EAT[1] - 1.2)
s29 = [sitter(*STAY, face='world', yaw=STAY_YAW, treat={'nose': True, 'big': True}, sway=3.5, swayEvery=0.125),
       A('kob', 'happy_walk', *K29, face='world', yaw=yaw_to(K29, KOB_EAT), speed=1.4, mx=KOB_EAT[0] - K29[0], mz=KOB_EAT[1] - K29[1])]
v = lens_for(s29, -10, 3.2, 123, 127, hs=(0.9, 1.05), fov=50, spread=15)
add(123, 127, s29, "the cat strolls in beside the frozen dog", v, noMic=True)
# S30 'beautiful' (b126.53) 'things' (b127.89): she bites the giant biscuit off his nose, her face to us
EAT_S = S(127.89, 127)
s30 = [sitter(*STAY, face='world', yaw=STAY_YAW, treat={'nose': True, 'big': True, 'gone': EAT_S}),
       A('kob', 'happy_idle', *KOB_EAT, face='world', yaw=-28, at=0.5, lean=8, treat={'mouth': EAT_S, 'big': True})]   # three-quarters to us at his cheek: on the word the jackpot is crosswise in her jaws, broadside
v = view((STAY[0] - 0.15, 1.0, STAY[1] + 3.6), (STAY[0] + 0.32, 0.86, STAY[1] + 0.35), 48, p1=(STAY[0] - 0.14, 0.99, STAY[1] + 3.45))
add(127, 130, s30, "'beautiful things': the cat bites the giant biscuit off his nose", v, noMic=True)
# S31 the button (b130-133, the song's stop and its reverb): side on, she strolls off past him with it in her jaws, its whole length showing; he never moves
s31 = [sitter(*STAY, face='world', yaw=STAY_YAW), A('kob', 'happy_walk', STAY[0] + 0.8, STAY[1] + 0.5, face='world', yaw=8, speed=1.2, mx=0.05, mz=0.55, treat={'mouth': True, 'big': True, 'mouthOff': [0, 0.04, 0.36]})]   # walking towards us: the jackpot crosswise in her jaws, broadside
v = held(view((STAY[0] + 0.45, 1.05, STAY[1] + 4.1), (STAY[0] + 0.62, 0.9, STAY[1] + 0.45), 50))
add(130, 133, s31, "the song stops: she strolls off chewing his jackpot; he's still in his stay", v, noMic=True, still=True)

for s in shots: clean(s['actors'])
shots.sort(key=lambda x: x['beat'])
ep = {
    'date': '2026-10-04', 'song': {'title': 'Beautiful Things', 'artist': 'Benson Boone'},
    'logline': "Saxo's power ballad on the canyon rim is full of dog commands, and he's a dog: he obeys every one on the word ('take', 'find', 'sit', 'stay'), lands the biscuit trick with the singer's own backflip, then waits frozen under the giant one for a 'take' that never comes, while the cat eats it off his nose.",
    'new': "src/maps28.js: canyon (the band's stage on a slickrock shelf at the rim of a red canyon at golden hour or dusk: the drop, the far wall, mesas and buttes in the haze, the band's gear, a big sage bush that rustles, scrub, boulders, the white van, a hawk, a tumbleweed); the dog-biscuit props (`biscuit`, `bigbiscuit`) and the actor field `treat` (a biscuit balanced on the nose, flipped up and caught in the mouth, eaten off it); looks saxo_rocker, sadi_denim, kob_beanie",
    'notes': "The clip: the band drives a white van into a red-rock desert, hauls its kit up the rocks and plays on the rim of a canyon at golden hour; the singer in dark curls and a black fleece-collared jacket. The world: the canyon rim at golden hour turning to dusk on 'night'. The words, from whitelisted keywords per line (never the text): the cut is full of dog commands (take, find, good, sit, wait, stay, take) and the second half of the last chorus never says 'take' again: the story is that. Cast: Saxo the singer (the clip's look), Sadi the guitarist with a treat pouch (his trainer), Kob the drummer in the clip drummer's pink beanie (the cat who never obeys: she eats the jackpot), Compote the bassist in her punk jacket (she has had enough of the dog sitting at his own gig).",
    'with': ['sadi', 'kob', 'compote'],
    'clips': ['playing_a_guitar', 'playing_the_bass_guitar', 'basic_rock_beat', 'happy_idle', 'happy_walk', 'long_yell_leaning_forward', 'long_yell_while_standing_leaning_back',
              'being_surprised_and_looking_right', 'sitting_talking', 'quickly_pointing_angrily_forward', 'standing_backflip', 'situps', 'crawling_forward_on_hands_and_knees'],
    'tags': {'structure': 'obedience', 'scenes': ['band on the rim', 'treat snap', 'find it', 'sit', 'treat on the nose', 'backflip catch', 'cat steals the treat'], 'cast': ['saxo', 'sadi', 'kob', 'compote'], 'hook': 'dance', 'maps': ['canyon'], 'ref': 'none',
             'lyric_literal': "'take' (he snaps the biscuit), 'find' (he dives into the sage after it), 'good' (a pat on the head), 'sit', 'wait' (he sits mid-verse), 'enough' (Compote), 'love' (hearts), 'night' (the sun sets), 'stay' (the biscuit on his nose, frozen), 'want', 'need' (he trembles), 'take' (the flip and the backflip catch), the last half's missing 'take' (the cat eats it)",
             'experiment': "Does a story built on the lyric's own dog commands (sit, stay, take), told by obeying them on the word, with the pet-video payoff of the cat stealing the obedient dog's treat, get more shares per view than our other chart-song episodes?"},
    'shots': shots,
}
json.dump(ep, open(os.path.join(HERE, '2026-10-04-2.json'), 'w'), indent=1, ensure_ascii=False)
print(len(shots), 'shots;', len(WARN), 'warnings')
for w in WARN: print('  ', w)
