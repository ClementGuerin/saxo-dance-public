# make_2026-10-07.py: writes episodes/2026-10-07.json, "APT." (ROSÉ & Bruno Mars, 2024; the queue being empty: Spotify
# global #105 after 716 days on the chart, the biggest TikTok sound of every candidate checked, 3.74M videos on its 60 s
# sound and 7.5M over its three; a K-pop star after the four K-pop episodes led the Shorts).
# The world (the official video, looked at as contact sheets every 3 s; nothing violent in it): an all-pink studio, the
# duo in black leather (she: a messy platinum bob, a white crop top, leather shorts; he: a cap worn backwards, black
# sunglasses, a pearl necklace, a red tartan kilt), a drum kit with a lightning bolt on its bass drum, amp stacks, red
# party cups on the floor (the drinking game), fisheye circles. The title is the Korean party game "apateu": apartment.
# Ours, "the cat won't move" (STANDOFF, a new structure: one character refuses to give way; the pressure escalates,
# stares, pleading, shoving, she doesn't move a whisker, the others give up and go round her the hard way; the payoff
# gives her the whole prize, more than she fought for, in front of all of them): Saxo and Sadi, in the
# clip's looks, ride the party lift of a pink apartment block up to the penthouse; on every chant the doors open on a
# floor and more party pets cram in with their red cups (Compote barges in on 3 and gets squashed); on floor 7 the doors
# open on Kob in her pyjamas, milk in paw, who squeezes into the last gap: the overload alarm. Everyone stares at the
# dog, the dog points at the cat; Sadi begs, Compote shoves, Kob pulls her sleep mask down. They all give up and take
# the stairs; alone, the cat takes the whole lift: each time the doors open on the way up she has spread out more,
# asleep (sitting in the middle, then on her back across the floor), the counter still saying FULL; the gang staggers up
# the stairwell and collapses at the top; at the penthouse the doors open on her asleep across the whole floor in front
# of the gang and the party, and slide shut again in their faces (the button, in silence). Review loop 2 and the critic
# turned it from "caught dancing when the doors open", which repeated the CEO-cat episode.
# Beats: 148.995 BPM, kit beat b at 0.104 + b * 0.402698 s (kit beat 0 = song beat 80, bar 20); a bar = 4 beats.
# Sections (kit beats): pre-chorus 1 b0-32 (lines K00 b-0.1, K01 b7.6, K02 b15.4, K03 b23.7); chorus 1 b32-64 (the chant,
# one line a bar, K04-K11; tags on bars 11 and 15); verse 2 b64-96 (K12 b62.3, K13 b71.1, K14 b77.6, K15 b89.8);
# pre-chorus 2 b96-128 (K16-K19, the same four lines); chorus 2 b128-160 (K20-K27); the music stops at b159.2 (64.22 s);
# silence to b161.0 (64.94 s).
# Key words (whitelisted single words with their kit times, never the lines): want 0.90, 1.79 | baby 2.95 | need 4.05,
# 5.00 | sleep 6.29 | drink 32.30 | dance 32.96 | smoke 33.46 | night 34.68 | come 35.22 | girl 36.77 | up 37.42 |
# want 39.56, 40.45 | baby 41.61 | need 42.71, 43.66 | sleep 44.95. The chant (two words a bar) has no whitelisted word.
# The lyrics stay in episodes/2026-10-07.lyrics.js (the generator reads only their times).
import json, math, os, re, sys
sys.path.insert(0, os.path.dirname(__file__))
from cam import view, vpath, swoop, low, deadpan, orbit, topdown

HERE = os.path.dirname(__file__)
PER, B0 = 60 / 148.9949, 0.104
def T(b): return B0 + b * PER
def Bt(t): return (t - B0) / PER                 # kit seconds -> kit beat
def S(b, b0): return round((b - b0) * PER, 3)    # seconds from shot beat b0 to beat b

LOOK = {'saxo': 'kilt', 'sadi': 'bob', 'kob': 'pyjama', 'compote': 'punk'}
HEAD = {'saxo': 1.32, 'sadi': 1.36, 'kob': 1.42, 'compote': 1.42}        # the top of each head standing (the cap, the wig, the ears)
FACE = {'saxo': 0.9, 'sadi': 0.84, 'kob': 0.86, 'compote': 0.86}
RAD = {'saxo': 0.46, 'sadi': 0.46, 'kob': 0.4, 'compote': 0.4}           # the bob wig widens her head
SIT = 0.06

# ---- the maps (src/maps33.js) ----
SLOTS = [(-1.38, -2.7), (1.38, -2.7), (-1.42, -1.95), (1.42, -1.95), (-1.4, -1.3), (1.4, -1.3), (-1.42, -0.7), (1.42, -0.2),
         (-1.0, -2.35), (1.05, -2.3), (-1.25, -0.2), (-0.85, -0.7), (-0.6, -0.22), (0.45, -0.25), (1.45, -0.8), (0, -2.78),
         (0.75, -1.35), (-0.75, -1.35), (0, -1.45), (0.4, -0.9)]          # = ELEV.SLOTS in src/maps33.js
SAXO = (-0.52, -2.1); SADI = (0.55, -2.15); COMP = (0.95, -0.75); KOB_IN = (0.0, -0.45); KOB_OUT = (0.0, 5.3); KOB_DOOR = (0.0, 1.35)
PENT_DOOR_Z = -6.0; PENT_STAIRS = (3.4, -6.0)

def A(who, clip, x, z, **o):
    return {'who': who, 'look': o.pop('look', LOOK[who]), 'clip': clip, 'x': round(x, 3), 'z': round(z, 3), 'face': o.pop('face', 'camera'),
            'yaw': o.pop('yaw', 0), 'at': o.pop('at', 'auto'), **o}
def yaw_to(frm, to): return round(math.degrees(math.atan2(to[0] - frm[0], to[1] - frm[1])), 1)
def milk(**o):                                   # Kob's milk bottle held out at her side (a straw at her open mouth read as a cigarette; in front of her belly the white bottle vanished on her pyjamas)
    return dict(holdL='milkbottle', holdScale=1.3, arm='L', aim=[0.62, -0.2, 0.3], upAt=-1, **o)
def milk_dance(**o):                             # dancing: just the bottle in her paw
    return dict(holdL='milkbottle', **o)

# ---- a projection check (numbers only): where each face lands in the 9:16 frame at the shot's start and end ----
def _proj(cam, look, fov, pt):
    f = [look[i] - cam[i] for i in range(3)]; n = math.sqrt(sum(v * v for v in f)); f = [v / n for v in f]
    r = [-f[2], 0.0, f[0]]; rn = math.sqrt(r[0] ** 2 + r[2] ** 2) or 1; r = [r[0] / rn, 0.0, r[2] / rn]
    u = [r[1] * f[2] - r[2] * f[1], r[2] * f[0] - r[0] * f[2], r[0] * f[1] - r[1] * f[0]]
    d = [pt[i] - cam[i] for i in range(3)]; z = sum(a * b for a, b in zip(d, f))
    if z <= 0.05: return None
    tv = math.tan(math.radians(fov) / 2); th = tv * 9 / 16
    return (0.5 + sum(a * b for a, b in zip(d, r)) / z / th / 2, 0.5 - sum(a * b for a, b in zip(d, u)) / z / tv / 2)
_src = open(os.path.join(HERE, '2026-10-07.lyrics.js')).read()
_rows = json.loads(re.search(r'window\.LYRICS = (.*?);\n', _src).group(1)); _ends = json.loads(re.search(r'window\.LINE_END = (.*?);\n', _src).group(1))
LINES = [(Bt(row[0][0] - 0.35), Bt(e)) for row, e in zip(_rows, _ends)]
def has_line(b0, b1): return any(a < b1 and b > b0 for a, b in LINES)
WARN = []
def body(a, end):                                # (who, x, z, face y, head top y) at the shot's start (0) or end (1)
    who = a['who']; sc = a.get('scale', 1)
    x, z = a['x'] + a.get('mx', 0) * end, a['z'] + a.get('mz', 0) * end
    lift = a.get('lift', 0) + (a.get('my', 0) if end else 0) - (a.get('sitDrop', SIT) if a.get('sit') else 0)
    return (who, x, z, FACE[who] * sc + lift, HEAD[who] * sc + lift)
def check(beat, b1, cam, look, fov, actors, end):
    line = has_line(beat, b1)
    for a in actors:
        if a.get('fg') or a.get('reveal', 0) >= 1.0 or a.get('lying') or a.get('away'): continue
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

# ---- the lift's walls: a lens must be on the landing, in the car, or above with the ceilings off; a line of sight
# between the landing and the car must pass through the open doorway ----
def elev_free(c, noceil=False):
    x, y, z = c
    if y < 0.1: return False
    if 0.15 <= z <= 6.3 and abs(x) <= 5.3 and y <= 3.15: return True
    if -2.9 <= z <= -0.15 and abs(x) <= 1.6 and y <= 2.9: return True
    return noceil and -3.0 <= z <= 6.5 and abs(x) <= 5.5 and y > 3.4
def through_door(cam, p, open_=True):
    if cam[1] > 3.3: return True                   # from above, the ceilings off
    if (cam[2] > 0) == (p[2] > 0): return True
    if not open_: return False
    u = cam[2] / (cam[2] - p[2]); X = cam[0] + (p[0] - cam[0]) * u; Y = cam[1] + (p[1] - cam[1]) * u
    return abs(X) < 1.1 and Y < 2.42
def pent_free(c):
    x, y, z = c
    return 0.1 < y < 5.0 and abs(x) < 8.6 and PENT_DOOR_Z + 0.25 < z < 5.7

shots = []
def lens(v, k=0):
    c, f = v; a = math.radians(c['ang'][k]); fy = f[2] if len(f) > 2 else 0
    return (f[0] + math.sin(a) * c['r'][k], c['h'][k] + fy, f[1] + math.cos(a) * c['r'][k])
def pax_clear(v, actors, n, reach=0.55):
    """the party pets (map objects, shorter than the cast) standing on a line of sight to a face: hide just those"""
    out = []
    for k in (0, -1):
        cam = lens(v, k)
        for i in range(min(n, len(SLOTS))):
            sx, sz = SLOTS[i]
            for a in actors:
                if a.get('fg') or a.get('away'): continue
                who, x, z, fy, _ = body(a, 1 if k else 0)
                dx, dz = x - cam[0], z - cam[2]; L = math.hypot(dx, dz) or 1
                u = ((sx - cam[0]) * dx + (sz - cam[2]) * dz) / (L * L)
                if not 0 < u < 1: continue
                px_, pz_ = cam[0] + dx * u, cam[2] + dz * u
                hy = cam[1] + (fy - cam[1]) * u
                if math.hypot(sx - px_, sz - pz_) < reach and hy < 1.2 and math.hypot(sx - x, sz - z) > 0.2:
                    out.append([sx, sz, 0.05]); break
    for k in (0, -1):
        cam = lens(v, k)
        out += [[sx, sz, 0.05] for sx, sz in SLOTS[:n] if math.hypot(sx - cam[0], sz - cam[2]) < 0.8]
    return [list(c) for c in {tuple(c) for c in out}]
def add(beat, b1, mp, actors, lyric, v, **o):
    c, focus = v
    o = {k: val for k, val in o.items() if val is not None}
    tight = o.pop('tight', False)               # a close single: only the pets right on its line go (the crowd stays round her)
    if mp == 'elevator' and o.get('pax'): o['clear'] = o.get('clear', []) + pax_clear(v, actors, o['pax'], 0.3 if tight else 0.55)
    shots.append({'beat': beat, 'kind': 'dance', 'map': mp, 'actors': actors, 'lyric': lyric, 'cam': c, 'focus': focus, **o})
    fy = focus[2] if len(focus) > 2 else 0
    for k, end in ((0, 0), (-1, 1)):
        cam, look = lens(v, k), (focus[0], c['look'][k] + fy, focus[1])
        check(beat, b1, cam, look, c['fov'], actors, end)
        for oc in _occl(cam, look, c['fov'], [body(a, end)[:4] for a in actors if not a.get('lying') and not a.get('fg') and not a.get('away')]):
            WARN.append(f'b{beat}: {oc}{" at the end" if end else ""}')
        if mp == 'elevator':
            if not elev_free(cam, o.get('noCeil', False)): WARN.append(f'b{beat}: lens inside a wall{" at the end" if end else ""}')
            dv = o.get('doors', 0); open_ = ((dv[3] > 0.8) if end else (dv[2] > 0.8 or (dv[3] > 0.8 and dv[1] <= 0.8))) if isinstance(dv, list) else dv > 0.8
            for a in actors:
                if a.get('fg') or a.get('away'): continue
                who, x, z, fy2, _ = body(a, end)
                if not through_door(cam, (x, fy2, z), open_): WARN.append(f'b{beat}: {who} hidden by the lift wall{" at the end" if end else ""}')
def clean(actors):                               # the generator's own keys off the actors
    for a in actors:
        for k in ('sit', 'sitDrop', 'lying', 'away'): a.pop(k, None)
    return actors

# ================= a lens search: every face inside the frame and under the lyric rows at the shot's start and end,
# no face inside a nearer head's disc, the lens free of the set =================
WHY = {}
def _no(r): WHY[r] = WHY.get(r, 0) + 1; return None
FACING = {}
def _ok(cam, look, fov, phases, line, occ=(), maxoff=105, sight=None):
    worst = 1.0
    for w, yw in FACING.items():
        x0, z0 = next(((s_[1], s_[2]) for s_ in phases[0] if s_[0] == w), (None, None))
        if x0 is None: continue
        dx, dz = cam[0] - x0, cam[2] - z0; dn = math.hypot(dx, dz) or 1
        if (math.sin(math.radians(yw)) * dx + math.cos(math.radians(yw)) * dz) / dn < math.cos(math.radians(maxoff)): return _no(f'{w} faces away')
    fx, fz = look[0] - cam[0], look[2] - cam[2]; n = math.hypot(fx, fz) or 1; rx, rz = -fz / n, fx / n
    for subs in phases:
        for w, x, z, fy, ty in subs:
            if sight and not sight(cam, (x, fy, z)): return _no(f'{w} behind the wall')
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
def lens_for(actors, ang, dist, b0, b1, hs=(1.0,), fov=50, look=None, spread=40, dr=(0.8, 1.5), free=elev_free, sight=through_door, push=0.04, facing=True, maxoff=105, **o):
    vis = [a for a in actors if not a.get('fg') and not a.get('lying') and not a.get('away')]
    FACING.clear(); FACING.update({a['who']: a.get('yaw', 0) for a in vis if a.get('face') == 'world'} if facing else {})
    phases = [[body(a, 0) for a in vis if not a.get('reveal')], [body(a, 1) for a in vis]]
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
                f = _ok(cam, L, fov, phases, line, occ, maxoff, sight)
                if f is None or f < 0: continue
                score = abs(da) / 40 + abs(d - dist) / dist + (0.25 - min(f, 0.25))
                if best is None or score < best[0]: best = (score, cam)
    if best is None:
        raise SystemExit(f'b{b0}: no lens for {[s_[0] for s_ in phases[0]]} round {ang} deg at {dist} m; rejections: {sorted(WHY.items(), key=lambda kv: -kv[1])[:6]}, not free: {nfree}')
    cam = best[1]; p1 = (cam[0] + (L[0] - cam[0]) * push, cam[1], cam[2] + (L[2] - cam[2]) * push)
    return view(tuple(round(c, 3) for c in cam), tuple(round(c, 3) for c in L), fov, p1=tuple(round(c, 3) for c in p1), **o)

DUO = lambda clip='charleston', at=0.7, **o: [A('saxo', clip, *SAXO, at=at, hold='redcup', **o), A('sadi', clip, *SADI, at=at, **o)]
SQUASH = lambda who, x, z, **o: A(who, o.pop('clip', 'happy_idle'), x, z, at=o.pop('at', 0.4), speed=o.pop('speed', 0.3), **o)

# =====================================================================================================================
# BEAT 1, pre-chorus 1 (b0-32): the party lift; Kob woken up on floor 7
# S01 the hook (b0-8, 'want' 0.90, 1.79, 'baby' 2.95; review loop 1 and the critic: the doors part across the lens on the
# first downbeat, the duo close, mid-kick, his cup up; the counter on the car's back wall reads 1)
SAXO_H, SADI_H = (-0.45, -1.55), (0.45, -1.6)
s01 = [A('saxo', 'charleston', *SAXO_H, at=0.1, hold='redcup', arm='R', aim=[0.62, 0.55, 0.3], upAt=-1), A('sadi', 'charleston', *SADI_H, at=0.1)]
v = view((0.05, 0.9, 2.4), (0.0, 0.98, -1.6), 58, p1=(0.03, 0.9, 1.75), roll=[-4, -2], hand=0.2)
add(0, 8, 'elevator', s01, "the hook: the lift doors part across the lens on the first beat: Saxo and Sadi in the clip's punk looks mid-kick in a hot-pink lift, his red cup up", v,
    floor=1, doors=[0.08, 1.4, 0.0, 1.0])
# S02 (b8-15, 'need' 4.05, 5.00): they dance facing each other, three-quarter, the flirt; the doors start to close
s02 = [A('saxo', 'gangnam', *SAXO, face='world', yaw=55, at=1.1, hold='redcup'), A('sadi', 'gangnam', *SADI, face='world', yaw=-55, at=1.1)]
v = lens_for(s02, 0, 4.4, 8, 15, hs=(1.3, 1.5), fov=52, spread=10, dr=(0.95, 1.25), push=0.05, facing=False)
add(8, 15, 'elevator', s02, "'need': they dance facing each other in the pink lift, the flirt, before the doors close", v, floor=1, doors=[S(13.6, 8), S(15, 8), 1.0, 0.25])
# S03 (b15-24, 'sleep' 6.29): floor 7: Kob in her pyjamas outside her flat 701, her milk bottle in paw, yawning
s03 = [A('kob', 'big_yawn_while_standing', *KOB_OUT, face='world', yaw=180, at=0.2, speed=1.0, **milk())]
v = deadpan(KOB_OUT, 0.98, 3.2, cam_y=1.02, push=0.14, fov=42, ang=180)
add(15, 24, 'elevator', s03, "'sleep': floor 7: Kob in her pyjamas outside her flat 701, her milk bottle in paw, sleep mask up, yawning: the party lift woke her up", v,
    floor=7, kobDoor=True, doors=0)
# S04 (b24-32): floor 2: the doors open and three party pets bounce in beside the dancing duo
s04 = DUO('charleston', at=0.7 + 0.4)
v = view((-1.2, 1.4, 4.4), (0.0, 0.88, -1.8), 52, p1=(-1.05, 1.36, 4.0))
add(24, 32, 'elevator', s04, "floor 2: the doors open and three party pets with red cups bounce in beside the dancing duo", v,
    floor=2, doors=[0.0, 0.45, 0.0, 1.0], pax=3, paxIn=[0, 0.4, 2.8])

# =====================================================================================================================
# BEAT 2, chorus 1 (b32-64): one floor every two bars on the chant: the same fixed frame from the landing each time the
# doors open (the critic: the same frame visibly more crammed each floor), an inside cutaway between
FIX = view((0.0, 2.3, 3.5), (0.0, 0.95, -1.45), 56, p1=(0.0, 2.29, 3.42), ease='lin')
def floor_shot(b, fl, pax, k0, lyric, extra=(), opening=True):
    actors = DUO('charleston', at=0.7 + 0.4 * fl) + [SQUASH('compote', *COMP, face='world', yaw=0)] + list(extra)
    if opening: add(b, b + 4, 'elevator', actors, lyric, FIX, floor=fl, doors=[0.0, 0.16, 0.0, 1.0], pax=pax, paxIn=[k0, 0.15, 1.25])
    else: add(b, b + 4, 'elevator', actors, lyric, FIX, floor=fl, doors=1, pax=pax)
# S05 (b32-36; the Short's first frame): floor 3: the doors open; Compote has barged in at the front, scowling at us
floor_shot(32, 3, 6, 3, "chant: floor 3: the lift filling up, the duo dancing, Compote barged in at the front, scowling (the doors already open: the Short's first frame is the dance)", opening=False)
# S06 (b36-40): inside, low and dutch: Saxo still dancing with his cup up, pets packed on both sides (bodies at the lens)
s06 = [A('saxo', 'charleston', *SAXO, at=0.7, hold='redcup')]
v = view((-0.05, 0.32, -0.3), (-0.52, 0.96, -2.1), 64, p1=(-0.1, 0.31, -0.42), roll=[-10, -6], hand=0.3)
add(36, 40, 'elevator', s06, "chant: inside, low: Saxo still dancing with his red cup up, party pets packed in on both sides", v, floor=3, doors=0, pax=8)
# S07 (b40-44): floor 4: the same frame, fuller
floor_shot(40, 4, 11, 8, "chant: floor 4: the same doors open on a fuller lift")
# S08 (b44-48, a tag bar): inside: Compote squashed between two big party pets, furious
s08 = [SQUASH('compote', *COMP, face='world', yaw=-129, clip='quickly_pointing_angrily_forward', at=0.3, speed=0.7)]
v = view((-1.35, 1.15, -2.62), (0.95, 1.02, -0.75), 50, p1=(-1.3, 1.15, -2.55), ease='lin')
add(44, 48, 'elevator', s08, "chant: inside: Compote squashed between two big party pets, furious", v, floor=4, doors=0, pax=14, tight=True)
# S09 (b48-52): floor 5: the same frame, fuller
floor_shot(48, 5, 15, 11, "chant: floor 5: the same doors open on a lift fuller still")
# S10 (b52-56): inside: Sadi squeezed between party pets, mid-kick
s10 = [A('sadi', 'charleston', *SADI, at=0.84)]
v = view((0.2, 0.36, -0.3), (0.55, 0.84, -2.15), 64, p1=(0.25, 0.34, -0.42), roll=[9, 5], hand=0.3)
add(52, 56, 'elevator', s10, "chant: inside: Sadi squeezed between party pets, mid-kick", v, floor=5, doors=0, pax=16, tight=True)
# S11 (b56-60): floor 6: the same frame, packed solid
floor_shot(56, 6, 18, 15, "chant: floor 6: the same doors open on a lift packed solid")
# S12 (b60-64, a tag bar): from the floor of the landing, dutch: the whole packed lift dancing, cups up
s12 = DUO('charleston', at=0.7 + 4.6)
v = view((0.35, 0.22, 3.0), (0.0, 1.05, -1.8), 60, p1=(0.25, 0.22, 2.55), roll=[11, 7], hand=0.3)
add(60, 64, 'elevator', s12, "chant: from the floor of the landing, dutch: the whole packed lift dances in the doorway, cups up", v, floor=6, doors=1, pax=18)

# =====================================================================================================================
# BEAT 3, verse 2 (b64-96): floor 7: the cat gets in; the alarm; the dog points at the cat
GAP = [[KOB_IN[0], KOB_IN[1], 0.55]]                  # the last gap at the front, kept free for her
# S13 (b64-72): floor 7: the doors open on Kob in her pyjamas, milk bottle in paw; the packed lift stares at her
s13 = [A('kob', 'happy_idle', *KOB_DOOR, face='world', yaw=180, at=0.3, speed=0.0, fg=True, holdL='milkbottle'),
       A('saxo', 'happy_idle', *SAXO, at=0.4, speed=0.0, hold='redcup', holdL='redcup'), A('sadi', 'happy_idle', *SADI, at=0.4, speed=0.0), SQUASH('compote', *COMP, face='world', yaw=0, speed=0.0)]
v = lens_for(s13, -4, 4.8, 64, 72, hs=(1.45, 1.6, 1.75), fov=54, spread=14, dr=(0.9, 1.25), push=0.04, facing=False)
add(64, 72, 'elevator', s13, "floor 7: the doors open on Kob in her pyjamas, milk bottle in paw; the whole packed lift turns and stares at her", v,
    floor=7, kobDoor=True, doors=[0.0, 0.45, 0.0, 1.0], pax=18, paxMode='stare', stare=list(KOB_DOOR), clear=GAP)
# S14 (b72-80): she walks in, into the last gap at the front, over the heads from behind her
s14 = [A('kob', 'happy_walk', KOB_DOOR[0], KOB_DOOR[1], face='world', yaw=180, at=0.3, mz=round(KOB_IN[1] - KOB_DOOR[1], 3), holdL='milkbottle'),
       A('saxo', 'happy_idle', *SAXO, at=0.4, speed=0.0, hold='redcup'), A('sadi', 'happy_idle', *SADI, at=0.4, speed=0.0), SQUASH('compote', *COMP, face='world', yaw=0, speed=0.0)]
v = lens_for(s14, 10, 4.4, 72, 80, hs=(2.1, 2.3, 2.5), fov=54, spread=15, dr=(0.9, 1.25), push=0.03, facing=False)
add(72, 80, 'elevator', s14, "she steps in anyway, into the last gap at the front, while the packed lift stares", v, floor=7, kobDoor=True, doors=1, pax=18, paxMode='stare', stare=[0.0, 0.0], clear=GAP)
# S15 (b80-84, 'drink' 32.30): the overload alarm: the car red, FULL on the counter behind her; Kob at the front facing
# out, sipping her milk, unbothered
s15 = [A('kob', 'happy_idle', *KOB_IN, face='world', yaw=0, at=0.3, speed=0.0, **milk())]
v = view((0.0, 1.15, 3.3), (0.0, 1.22, -1.0), 50, p1=(0.0, 1.15, 3.05), ease='lin')
add(80, 84, 'elevator', s15, "'drink': the overload alarm: the car flashes red, FULL on the counter behind her; Kob at the front sips her milk, unbothered", v,
    floor=7, kobDoor=True, doors=1, pax=18, full=0.0, paxMode='stare', stare=list(KOB_IN), clear=GAP)
# S16 (b84-88): everyone stares at the dog, a red cup in each paw; he looks round
s16 = [A('saxo', 'being_surprised_and_looking_right', *SAXO, at=0.2, speed=0.8, hold='redcup', holdL='redcup', arm='both', aim=[0.62, 0.5, 0.25], upAt=-1)]
v = lens_for(s16, -4, 5.2, 84, 88, hs=(1.35, 1.5), fov=36, spread=10, dr=(0.9, 1.2), push=0.04)
add(84, 88, 'elevator', s16, "everyone stares at the dog, a red cup in each paw; he looks round", v, floor=7, doors=1, pax=18, full=0.0, paxMode='stare', stare=list(SAXO), clear=GAP)
# S17 (b88-92, 'girl' 36.77): the dog points at the cat beside him, and the whole lift points at her; she sips on
KOB17 = (0.3, -0.5); SAX17 = (-0.75, -1.25)
s17 = [A('kob', 'happy_idle', *KOB17, face='world', yaw=-10, at=0.3, speed=0.0, **milk()),
       A('saxo', 'happy_idle', *SAX17, face='world', yaw=yaw_to(SAX17, KOB17), at=0.3, speed=0.0, arm='R', aim=[0.15, 0.35, 0.92], upAt=-1)]
v = lens_for(s17, 0, 3.8, 88, 92, hs=(1.2, 1.35), fov=50, spread=12, dr=(0.95, 1.25), push=0.04, facing=False)
add(88, 92, 'elevator', s17, "'girl': the dog points at the cat beside him, and the whole lift points at her; she sips on", v,
    floor=7, doors=1, pax=18, full=0.0, paxMode='point', stare=list(KOB17), clear=[[KOB17[0], KOB17[1], 0.55], [SAX17[0], SAX17[1], 0.5]])
# S17b (b92-96, 'up' 37.42): Kob's deadpan, sipping, the red light flashing
s17b = [A('kob', 'happy_idle', *KOB_IN, face='world', yaw=0, at=0.3, speed=0.0, **milk())]
v = deadpan(KOB_IN, 1.04, 2.8, cam_y=1.08, push=0.12, fov=42, ang=0)
add(92, 96, 'elevator', s17b, "'up': the cat sips her milk, deadpan, the alarm still flashing", v, floor=7, doors=1, pax=18, full=0.0, paxMode='stare', stare=list(KOB_IN), clear=GAP)

# =====================================================================================================================
# BEAT 4, pre-chorus 2 (b96-128): the standoff: Sadi begs, Compote shoves, Kob pulls her mask down; they all give up
# S18 (b96-104, 'want' 39.56, 40.45, 'baby' 41.61): Sadi begs her, paws clasped under her chin, side on; Kob sips
SADI18 = (-0.85, -0.65)
s18 = [A('sadi', 'falling_to_knees_in_prayer', *SADI18, face='world', yaw=38, at=3.0, speed=0.0), A('kob', 'happy_idle', *KOB_IN, face='world', yaw=-15, at=0.3, speed=0.0, **milk())]
v = lens_for(s18, -8, 3.4, 96, 104, hs=(1.0, 1.15), fov=52, spread=15, dr=(0.95, 1.25), push=0.05, facing=False)
add(96, 104, 'elevator', s18, "'want', 'baby': Sadi begs her to get out, paws clasped under her chin; Kob sips her milk", v, floor=7, doors=1, pax=18, full=0.0, paxMode='stare', stare=list(KOB_IN),
    clear=GAP + [[SADI18[0], SADI18[1], 0.6], [SADI18[0] - 0.5, SADI18[1] - 0.4, 0.55], [-1.42, -0.7, 0.3], [-1.25, -0.2, 0.3]])
# S19 (b104-111, 'need' 42.71, 43.66): Compote shoves her shoulder with both paws, three-quarter; Kob doesn't move
COMP19 = (-0.86, -0.5)
T19a = S(Bt(42.71), 104)
s19 = [A('compote', 'happy_idle', *COMP19, face='world', yaw=96, at=0.4, speed=0.0, lean=14, arm='both', aim=[0.12, 0.3, 0.82], aim2=[0.1, 0.32, 0.98], aim2At=round(T19a - 0.05, 3), upAt=-1),
       A('kob', 'happy_idle', 0.1, -0.45, face='world', yaw=-12, at=0.3, speed=0.0, **milk())]
v = lens_for(s19, 28, 3.4, 104, 111, hs=(1.0, 1.15), fov=50, spread=15, dr=(0.95, 1.25), push=0.04, facing=False)
add(104, 111, 'elevator', s19, "'need': Compote shoves her shoulder with both paws; Kob doesn't move a whisker", v, floor=7, doors=1, pax=18, full=0.0, paxMode='stare', stare=list(KOB_IN),
    clear=GAP + [[COMP19[0], COMP19[1], 0.6]])
# S20 (b111-120, 'sleep' 44.95): Kob pulls her sleep mask down over her eyes: she can't hear them
s20 = [A('kob', 'happy_idle', *KOB_IN, face='world', yaw=0, at=0.3, speed=0.0, sleep=round(S(Bt(44.95), 111) + 0.1, 3), **milk())]
v = deadpan(KOB_IN, 1.04, 2.8, cam_y=1.08, push=0.12, fov=42, ang=0)
add(111, 120, 'elevator', s20, "'sleep': Kob pulls her sleep mask down over her eyes: she can't hear them", v, floor=7, doors=1, pax=18, full=0.0, paxMode='stare', stare=list(KOB_IN), clear=GAP)
# S21 (b120-128): they give up: the party pets file out past the lens, then the trio walks out onto the landing towards
# us, glaring; Kob alone at the front, mask down
s21 = [A('kob', 'happy_idle', *KOB_IN, face='world', yaw=0, at=0.3, speed=0.0, sleep=True, **milk()),
       A('saxo', 'happy_walk', -0.78, -1.9, face='world', yaw=-2, at=0.2, mx=-0.1, mz=3.4, moveAt=0.8),
       A('sadi', 'happy_walk', 0.62, -1.95, face='world', yaw=-1, at=0.6, mx=-0.05, mz=3.7, moveAt=1.15),
       A('compote', 'happy_walk', 0.95, -0.75, face='world', yaw=0, at=0.4, mx=0.0, mz=2.6, moveAt=0.5)]
v = view((0.1, 2.3, 6.1), (0.0, 0.9, -0.2), 58, p1=(0.1, 2.28, 5.9))
add(120, 128, 'elevator', s21, "they give up: the party pets file out past us, then Saxo, Sadi and Compote walk out of the lift glaring; Kob alone at the front, mask down", v,
    floor=7, kobDoor=True, doors=1, pax=18, paxOut=[0.0, 2.0], full=0.0)

# =====================================================================================================================
# BEAT 5, chorus 2 (b128-161): alone, the cat takes the whole lift: every time the doors open on the way up she has spread
# out more, asleep, and the counter still says FULL; the gang climbs the stairs; at the penthouse the doors open on her
# asleep across the whole floor, and close again in their faces
KOB_SIT = (0.0, -1.35); KOB_LIE = (0.05, -0.95)        # sitting on the floor in the middle; lying on her back along the car
def kob_sit(): return A('kob', 'situps', *KOB_SIT, face='world', yaw=0, at=1.0, speed=0.0, noLie=True, sleep=True, holdL='milkbottle')
def kob_lie(y=0): return A('kob', 'knocked_out_falling_to_back', *KOB_LIE, face='world', yaw=y, at=3.3, speed=0.0, sleep=True, holdL='milkbottle', lying=True)
# S22 (b128-132): the doors close on Kob alone, mask down
s22 = [A('kob', 'happy_idle', *KOB_IN, face='world', yaw=0, at=0.3, speed=0.0, sleep=True, **milk())]
v = view((0.0, 1.1, 3.4), (0.0, 0.98, -0.45), 46, p1=(0.0, 1.1, 3.25))
add(128, 132, 'elevator', s22, "chant: the doors close on Kob alone, mask down", v, floor=7, kobDoor=True, doors=[0.35, 1.3, 1.0, 0.0])
# S23 (b132-136): floor 8: the doors open on a neighbour with a red cup: inside, the cat sits in the middle of the floor,
# asleep, the counter still saying FULL
s23 = [kob_sit()]
v = view((-0.45, 1.75, 2.7), (0.0, 0.6, -1.35), 52, p1=(-0.43, 1.73, 2.58), ease='lin')
add(132, 136, 'elevator', s23, "chant: floor 8: the doors open on a neighbour with a red cup: inside, the cat sits asleep in the middle of the floor, and the counter still says FULL", v,
    floor=8, doors=[0.0, 0.3, 0.0, 1.0], full=0.0, waiting=[[0.42, 1.15, 210, 'stare']])
# S24 (b136-140): the stairwell, floor 8: the gang sprints for the stairs (the flight up behind them)
def run(who, x, at, **o): return A(who, 'happy_run', x, 0.2, face='world', yaw=270, at=at, speed=o.pop('speed', 1.15), mx=o.pop('mx', -1.3), **o)
s24 = [run('saxo', 0.9, 0.1, tongue=True, reveal=0.45), run('sadi', 1.8, 0.4, reveal=0.9), run('compote', 2.6, 0.25, reveal=1.4)]
v = view((1.15, 1.05, 4.4), (-0.35, 0.95, 0.0), 56, p1=(1.05, 1.05, 4.3))
add(136, 140, 'stairwell', s24, "chant: the stairwell, floor 8: Saxo sprints for the stairs, Sadi and Compote behind him", v, floor=8)
# S25 (b140-144): floor 10: the doors open on two neighbours: she's lying on her back across the car now, asleep, FULL
s25 = [kob_lie()]
v = view((0.2, 2.45, 3.0), (0.05, 0.3, -1.45), 54, p1=(0.19, 2.42, 2.88), ease='lin')
add(140, 144, 'elevator', s25, "chant: floor 10: the doors open on two neighbours: the cat is lying on her back across the lift now, asleep; FULL", v,
    floor=10, doors=[0.0, 0.3, 0.0, 1.0], full=0.0, waiting=[[-0.5, 1.15, 165, 'stare'], [0.62, 1.25, 195, 'stare']])
# S26 (b144-148): the stairwell, floor 12: the gang staggers up, tongues out
s26 = [run('saxo', 0.7, 0.3, tongue=True, speed=0.7, mx=-1.2), run('compote', 1.6, 0.5, reveal=1.0, speed=0.7, mx=-1.2), run('sadi', 2.5, 0.2, reveal=1.5, speed=0.7, mx=-1.2)]
v = view((1.1, 1.0, 4.3), (-0.3, 0.9, 0.0), 56, p1=(1.0, 1.0, 4.2))
add(144, 148, 'stairwell', s26, "chant: the stairwell, floor 12: the gang staggers up, tongues out", v, floor=12)
# S27 (b148-152): from straight above, the ceilings off: the cat asleep on her back in the middle of the empty lift, the
# whole box to herself
s27 = [kob_lie()]
v = topdown((0.05, -1.45), 4.1, 3.8, fov=50, roll=(0, 5), shift=0.12)
add(148, 152, 'elevator', s27, "chant: from straight above: the cat asleep on her back in the middle of the empty lift, the whole box to herself", v, floor=13, doors=0, noCeil=True, full=0.0)
# S28 (b152-156): the top landing (PH): they make it first and collapse: Saxo flat on his back, tongue out, seen from
# above on his feet's side; the girls panting
s28 = [A('saxo', 'knocked_out_falling_to_back', 0.15, 0.55, face='world', yaw=0, at=3.3, speed=0.0, tongue=True, lying=True),
       A('sadi', 'happy_idle', -0.6, -0.35, face='world', yaw=20, at=0.4, speed=0.2, tongue=True),
       A('compote', 'happy_idle', 0.8, -0.3, face='world', yaw=-20, at=0.4, speed=0.2, tongue=True)]
v = view((0.2, 3.35, 3.15), (0.12, 0.4, -0.3), 56, p1=(0.2, 3.3, 3.0), ease='lin')
add(152, 156, 'stairwell', s28, "chant: the top landing, PH: they make it first and collapse: Saxo flat on his back, tongue out, the girls panting", v, floor='PH')
# S29 (b156-159.2, the last chant bar until the music stops): the penthouse, over the heads of the gang waiting at the
# lift with the party: the doors open on the cat asleep on her back across the lit lift floor, FULL on its back wall
END_LIE = (0.05, PENT_DOOR_Z - 1.0)
GANG = [A('saxo', 'happy_idle', -0.62, -4.75, face='world', yaw=180, at=0.4, speed=0.0, tongue=True, fg=True),
        A('sadi', 'happy_idle', 0.6, -4.8, face='world', yaw=180, at=0.4, speed=0.0, fg=True),
        A('compote', 'happy_idle', 1.4, -4.55, face='world', yaw=200, at=0.4, speed=0.0, fg=True)]
s29 = [A('kob', 'knocked_out_falling_to_back', *END_LIE, face='world', yaw=0, at=3.3, speed=0.0, sleep=True, holdL='milkbottle', lying=True)] + GANG
v = view((0.1, 2.35, -3.15), (0.05, 0.4, -7.0), 50, p1=(0.1, 2.33, -3.3), ease='lin')
PARTY = dict(stairsDoor=1, party='stare', stare=list(END_LIE), ring=[0.0, PENT_DOOR_Z, 1.6, 25, 72, 1], clear=[[-0.62, -4.75, 0.45], [0.6, -4.8, 0.45], [1.4, -4.55, 0.45]])
add(156, 159.2, 'penthouse', s29, "the penthouse, over the heads of the gang and the party waiting at the lift: the doors open on the cat asleep on her back across the lit lift floor, FULL on its back wall", v,
    doors=[0.1, 0.5, 0.0, 1.0], **PARTY)
# S30 the button (b159.2-161, the music stopped: silence): the reverse from inside the lift, low over the sleeping cat:
# the wrecked gang (Saxo's tongue out, Compote glaring) and the party staring in, and the doors slide shut across them
s30 = [A('kob', 'knocked_out_falling_to_back', *END_LIE, face='world', yaw=0, at=3.3, speed=0.0, sleep=True, holdL='milkbottle', lying=True, fg=True),
       A('saxo', 'happy_idle', -0.55, -4.85, face='world', yaw=180, at=0.4, speed=0.0, tongue=True),
       A('sadi', 'situps', 0.15, -4.7, face='world', yaw=180, at=1.0, speed=0.0, noLie=True, tongue=True),
       A('compote', 'quickly_pointing_angrily_forward', 0.75, -4.95, face='world', yaw=190, at=0.3, speed=0.5)]
v = view((0.3, 0.95, -8.7), (0.05, 0.95, -4.8), 54, p1=(0.3, 0.95, -8.6), ease='lin')
add(159.2, 161, 'penthouse', s30, "the button, in silence: from inside the lift, low over the sleeping cat: the wrecked gang and the party staring in, and the doors slide shut across their faces", v,
    still=True, doors=[0.08, 0.6, 1.0, 0.0], **dict(PARTY, clear=[[-0.55, -4.85, 0.45], [0.15, -4.7, 0.45], [0.75, -4.95, 0.45]]))

for s in shots: clean(s['actors'])
shots.sort(key=lambda x: x['beat'])
ep = {
    'date': '2026-10-07', 'song': {'title': 'APT.', 'artist': 'ROSÉ & Bruno Mars'},
    'logline': "The party lift of a pink apartment block fills floor by floor on every chant until Kob, in her pyjamas, squeezes into the last gap and sets off the overload alarm; the cat won't move a whisker, so everyone else takes the stairs, and alone she takes the whole lift, asleep and sprawled wider at every floor while the counter still says FULL, until the doors open at the penthouse on her asleep across the floor and slide shut again in everyone's faces",
    'new': "src/maps33.js: elevator (a pink apartment block's party lift behind sliding doors, its landing whose pastel colour and floor number follow `floor`, the LED display over the doors flashing FULL and the alarm dome on `full`, party pets with red cups filling the car slot by slot (`pax`, walking in with `paxIn`, out with `paxOut`, staring, pointing), Kob's flat door 701; `thump` rattles the closed doors on every beat with light leaking through their gap, built but cut), stairwell (a landing between two flights, the floor number painted big) and penthouse (the clip's pink set: the drum kit with a lightning bolt, amp stacks, a mic stand, red cups, a mirror ball, party pets; the lift's doors and the stairwell door); the red party cup and the milk bottle props; two looks from the clip: Saxo's (a cap worn backwards, sunglasses, a leather biker jacket, a pearl necklace, a red tartan kilt) and Sadi's (a platinum bob wig, a leather jacket, a white crop top, leather shorts)",
    'notes': "The world, from the official video (looked at as contact sheets every 3 s; nothing violent in it): an all-pink studio, the duo in black leather, a drum kit with a lightning bolt, amp stacks, red party cups on the floor (the drinking game), fisheye circles; the title is the Korean apartment game ('apateu'). The words, from whitelisted keywords per line (keywords.py: sorted, never the lines): want, baby, need, sleep, drink, dance, smoke, night, come, girl, up; the chant is two Korean words a bar (romanised in the karaoke: Fredoka has no Hangul). Cast: Saxo and Sadi in the clip's looks (new), Kob in her pyjamas with her milk (the neighbour the party woke up), Compote in her punk jacket (the angry party guest who gets squashed and shoves).",
    'with': ['sadi', 'kob', 'compote'],
    'clips': ['happy_idle', 'happy_walk', 'happy_run', 'big_yawn_while_standing', 'falling_to_knees_in_prayer', 'being_surprised_and_looking_right',
              'quickly_pointing_angrily_forward', 'knocked_out_falling_to_back', 'situps'],
    'yt': [round(T(32), 2), 64.94],   # the Short opens on the cut to the chant (the doors opening on Compote), not 0.35 s before it
    'tags': {'structure': 'standoff', 'scenes': ['the doors open on the duo', 'the party lift fills floor by floor', 'Compote squashed', 'the cat gets in', 'the overload alarm', 'the dog points at the cat', 'Sadi begs', 'Compote shoves', 'the sleep mask', 'everyone gets out', 'the cat takes the box', 'the stairs race', 'collapsed at the top', 'the doors open on her asleep', 'the doors close in their faces'],
             'cast': ['saxo', 'sadi', 'kob', 'compote'], 'hook': 'dance', 'maps': ['elevator', 'stairwell', 'penthouse'], 'ref': 'none',
             'lyric_literal': "the chant (a floor a bar: the doors open on each), 'sleep' (Kob yawning outside her flat; then her sleep mask pulled down), 'drink' (Kob sips her milk through the alarm), 'girl', 'up' (the whole lift points at her), 'want', 'baby' (Sadi begs), 'need' (Compote's two shoves)",
             'experiment': "A YouTube Short that opens on the song's own hook (APT.'s chant: `yt` starts on chorus 1, the doors opening on Compote) instead of wherever its last 59.5 s begin: more views at 24 h than the last chart-song Shorts (No Scrubs 109, DtMF 104, Golden 1,250 at 5 h)?"},
    'shots': shots,
}
json.dump(ep, open(os.path.join(HERE, '2026-10-07.json'), 'w'), indent=1, ensure_ascii=False)
print(len(shots), 'shots;', len(WARN), 'warnings')
for w in WARN: print('  ', w)
