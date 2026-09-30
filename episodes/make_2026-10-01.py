# make_2026-10-01.py: writes episodes/2026-10-01.json, "SWIM" (BTS; #22 on Spotify's global daily chart on 2026-09-30,
# 2.18M TikTok videos on its 60 s sound, 164M views on the official video). The clip: a woman in a museum of model ships
# finds herself on a white three-masted schooner at sea; the band in black naval jackets with gold buttons at the wheel and
# the rail, sailors in white hauling a rope in a line, cream canvas against a blue sky.
# Ours, "the band plays on" (new structure, OBLIVIOUS: a disaster grows in every shot while the performers carry on,
# unfazed; the payoff completes the disaster, and the one who saw it coming wins): Saxo's boy band shoots its SWIM video
# on the deck of a white schooner, Saxo the captain in the clip's black naval jacket. On the first downbeat an iceberg
# grinds along the hull and ice rains on the deck: nobody looks. The swim move (a doggy paddle on every "swim") goes on as
# the sea comes up the deck line by line: a film, the ankles, the knees, the chest. Kob, in an orange life jacket from her
# first shot, sits on a door on the deckhouse roof with her milk, watching. Compote bails furiously with a bucket; the
# sailor crew jump ship on "dive"; Sadi, the clip's heroine in a caramel coat, poses at the bow as it goes under. The
# bridge: a slow dance knee-deep, Saxo "makes a wave" and a real one sweeps the deck, Kob's door floats up off the roof
# with her on it, the lens goes under the sea (their legs still dancing among fish). The last chorus: the ship gone, the
# band does the choreography as synchronised swimming (dive under, burst up, the paddle in formation) while the masts
# sink; Compote still bails, onto Saxo. Sadi has joined Kob on the door. Saxo swims up and grabs its edge: there is room.
# Kob stands up and, on the last "dive", pushes him off with her foot. The song stops dead; Kob sips her milk.
# Beats count from B0 = 0.6683 s at 93.99 BPM (cut time = 0.6683 + b * 60/93.99 s; a bar = 4 beats = 2.553 s): the cut is
# 95.6952-158.40 s of the song (episodes/2026-10-01.config.js); the music stops dead at 62.05 s (b96.2), the video ends
# at 62.7 s. Lyric rows K00-K24 (episodes/2026-10-01.lyrics.js; the lyrics stay in their files): the pickup K00,
# chorus 3 K01-K08 (b0-32), the bridge K09-K15 (b32-60), the final chorus K16-K24 (b60-96). Action words (whitelisted
# keywords, kit beats): 'swim' on beat 1-3 of most bars; 'water falling skin' b5.1/b69.1; 'watching' b14.8/b78.8;
# 'dive' b29.0, b31.1, b61.0, b63.2, b93.0, b95.1; 'make wave' b37.1; 'under' b49.0; 'sad' b55.2; 'face' b57.6, 'land' b58.8.
import json, math, os, re, sys
sys.path.insert(0, os.path.dirname(__file__))
from cam import view, vpath, swoop, low, deadpan, orbit

B0, P = 0.6683, 60 / 93.99
S = lambda b: round(b * P, 3)                 # seconds for b beats (into a shot)
END, STOP = 62.7, 62.05
LOOK = {'saxo': 'captain', 'sadi': 'coat', 'kob': 'lifevest', 'compote': 'sailor'}
HEAD = {'saxo': 1.47, 'sadi': 1.25, 'kob': 1.38, 'compote': 1.45}   # the top of each head standing (the cap, the ears)
FACE = {'saxo': 0.95, 'sadi': 0.88, 'kob': 0.9, 'compote': 0.9}
NECK = {'saxo': 0.62, 'sadi': 0.57, 'kob': 0.57, 'compote': 0.57}   # the waterline on a swimmer: the neck
# ---- the schooner (src/maps21.js SHIP) ----
RAIL = 3.55; STAGE = (0.0, -3.4); BOW = (0.0, -14.2); DH_Y = 0.95; DOOR = (0.55, 5.9)
FORE = (0, -9.6); MAIN = (0, 2.6); MIZZEN = (0, 8.9)
SADI_B = (-0.9, -4.4); COMP_B = (0.9, -4.4)    # the band's back row either side of the lead (a V: at +-1.25 a 9:16 frame needed 5 m)
DOOR_TOP = lambda W: max(DH_Y + 0.095, W + 0.02) + 0.035
# the final chorus happens where the ship was: the formation round F (a V, the lead nearest the lens), the door drifted next to it
F = (0.0, -2.6); FDOOR = (2.25, -1.4)

def A(who, clip, x, z, **o):
    return {'who': who, 'look': o.pop('look', LOOK[who]), 'clip': clip, 'x': round(x, 3), 'z': round(z, 3), 'face': o.pop('face', 'camera'),
            'yaw': o.pop('yaw', 0), 'at': o.pop('at', 'auto'), **o}
def yaw_to(a, b): return round(math.degrees(math.atan2(b[0] - a[0], b[1] - a[1])), 1)
def dancer(who, x, z, at=0.9, **o):              # the band's move: the gangnam stance with the doggy paddle on every beat
    return A(who, 'gangnam', x, z, at=at, arm='both', aim='paddle', **o)
def swimmer(who, x, z, W, at=0.3, **o):          # treading water: legs running under the surface, the paddle breaking it, bobbing
    lift = o.pop('lift', round(W - NECK[who] + o.pop('high', 0.1), 3)); dip = o.pop('dip', [0.035, 2.3])
    a = A(who, o.pop('clip', 'running_man'), x, z, at=at, speed=o.pop('speed', 0.55), arm=o.pop('arm', 'both'), aim=o.pop('aim', 'paddle'), lift=lift, noShadow=True, **o)
    if dip: a['dip'] = dip
    return a
def kob_door(W, x=DOOR[0], z=DOOR[1], **o):     # Kob seated on her door, the milk in her right paw
    return A('kob', 'sitting_talking', x, z, face='world', yaw=o.pop('yaw', 180), at=0, speed=0.05, lift=round(DOOR_TOP(W) - 0.1, 3), hold='milk', **o)

# ---- a projection check (numbers only): where each face lands in the 9:16 frame at the shot's start and end ----
def _proj(cam, look, fov, pt):
    f = [look[i] - cam[i] for i in range(3)]; n = math.sqrt(sum(v * v for v in f)); f = [v / n for v in f]
    r = [-f[2], 0.0, f[0]]; rn = math.sqrt(r[0] ** 2 + r[2] ** 2) or 1; r = [r[0] / rn, 0.0, r[2] / rn]
    u = [r[1] * f[2] - r[2] * f[1], r[2] * f[0] - r[0] * f[2], r[0] * f[1] - r[1] * f[0]]
    d = [pt[i] - cam[i] for i in range(3)]; z = sum(a * b for a, b in zip(d, f))
    if z <= 0.05: return None
    tv = math.tan(math.radians(fov) / 2); th = tv * 9 / 16
    return (0.5 + sum(a * b for a, b in zip(d, r)) / z / th / 2, 0.5 - sum(a * b for a, b in zip(d, u)) / z / tv / 2)
_src = open(os.path.join(os.path.dirname(__file__), '2026-10-01.lyrics.js')).read()
_rows = json.loads(re.search(r'window\.LYRICS = (.*?);\n', _src).group(1)); _ends = json.loads(re.search(r'window\.LINE_END = (.*?);\n', _src).group(1))
LINES = [((row[0][0] - B0) / P, (e - B0) / P) for row, e in zip(_rows, _ends)]
def has_line(b0, b1): return any(a < b1 and b > b0 for a, b in LINES)
WARN = []
SEATED = ('sitting_talking',)
def check(beat, b1, lenses, look, fov, actors):
    line = has_line(beat, b1)
    for k, cam in enumerate(lenses):
        end = k == len(lenses) - 1
        for a in actors:
            if a.get('fg'): continue
            x, z = a['x'] + a.get('mx', 0) * end, a['z'] + a.get('mz', 0) * end
            hy = a.get('lift', 0) + (a.get('my', 0) if end else 0) + (-0.3 if a.get('clip') in SEATED else 0)
            top, face = _proj(cam, look, fov, (x, HEAD[a['who']] + hy, z)), _proj(cam, look, fov, (x, FACE[a['who']] + hy, z))
            if not top or not face: WARN.append(f'b{beat}: {a["who"]} behind the lens'); continue
            if line and top[1] < 0.26: WARN.append(f'b{beat}: {a["who"]} head top at {top[1]:.2f} (lyric rows){" at the end" if end else ""}')
            if face[0] < 0.12 or face[0] > 0.88: WARN.append(f'b{beat}: {a["who"]} face x {face[0]:.2f} (edge){" at the end" if end else ""}')
            if face[1] > 0.8: WARN.append(f'b{beat}: {a["who"]} face y {face[1]:.2f} (low)')
            fx, fz = look[0] - cam[0], look[2] - cam[2]; n = math.hypot(fx, fz) or 1; rx, rz = -fz / n, fx / n   # the lens's right, on the floor
            R = 0.47 if a['who'] == 'saxo' else 0.43
            ex = [_proj(cam, look, fov, (x + sgn * R * rx, FACE[a['who']] + hy, z + sgn * R * rz)) for sgn in (-1, 1)]
            if all(ex) and (min(e[0] for e in ex) < 0.0 or max(e[0] for e in ex) > 1.0): WARN.append(f'b{beat}: {a["who"]} head spans x {min(e[0] for e in ex):.2f}-{max(e[0] for e in ex):.2f} (cut){" at the end" if end else ""}')

shots = []
def lens(v, k=0):
    c, f = v; a = math.radians(c['ang'][k]); fy = f[2] if len(f) > 2 else 0
    return (f[0] + math.sin(a) * c['r'][k], c['h'][k] + fy, f[1] + math.cos(a) * c['r'][k])
def L2(v): return [lens(v, 0), lens(v, -1)]
def add(beat, b1, actors, lyric, v, **o):
    c, focus = v
    o = {k: val for k, val in o.items() if val is not None}
    s = {'beat': beat, 'kind': 'dance', 'map': 'ship', 'actors': actors, 'lyric': lyric, 'cam': c, 'focus': focus, **o}
    fy = focus[2] if len(focus) > 2 else 0
    look = (focus[0], c['look'][0] + fy, focus[1])
    check(beat, b1, L2(v), look, c['fov'], actors)
    shots.append(s)
def band(at=0.9):
    return [dancer('saxo', *STAGE, at=at), dancer('sadi', *SADI_B, at=at), dancer('compote', *COMP_B, at=at)]
PAD_BAND = [list(STAGE), list(SADI_B), list(COMP_B)]

# ================= chorus 3 (b0-32): the band dances on the deck; the iceberg, then the sea coming up line by line =================
v = swoop([(-4.5, 2.35, 0.5), (-3.6, 1.55, 0.0), (-2.9, 0.45, -0.4), (-2.45, 0.28, -0.6)], (-0.1, 0.95, -4.2), fov=62)   # starts over the rail, not on the hull's side (the critic)
add(0, 4, [dancer('saxo', *STAGE, at=0.6), dancer('sadi', *SADI_B, at=0.6), dancer('compote', 1.72, -4.3, at=0.6)], "HOOK (K00 pickup, K01 'swim swim'): over the port rail and down onto the deck: the band in formation doing the swim move (the gangnam stance, a doggy paddle on the beat), the sailor crew copying it in rows behind; an iceberg grinds along the starboard bow behind them and ice rains on the deck on the downbeat. Nobody looks",
    v, water=-1.4, crew='dance', clear=[[-1.5, -5.1, 0.4], [-0.75, -6.8, 0.4]], berg=[12.5, -26, 12.5, -13], bergDur=3.2, ice=-0.45, stars=['saxo'])   # the ice already falling in frame 1, landing on the downbeat
v = low((-2.25, 0.42, -1.9), (0.1, 0.95, -3.45), (-1.85, 0.4, -2.2), fov=56, roll=(-8, -5))
add(4, 8, [dancer('saxo', *STAGE, at=1.6)], "K02 'water falling skin' (b5.1): the breach bursts over the starboard rail behind him and the spray comes down all over the captain, mid-move: he doesn't flinch",
    v, water=-1.3, spray=[0, -3.2, S(1.0), 1], berg=[12.5, -9, 12.5, -2], bergDur=2.6, stars=['saxo'])
v = view((0.3, 1.3, 0.55), (0.0, 0.72, -4.6), 60, p1=(0.25, 1.24, -0.05), roll=[-5, -3], hand=0.3)
add(8, 12, band(at=2.2), "K03 'swim swim' (b9.2): low and wide from the front: the captain leads, the band and the crew rows copy him stroke for stroke... and a thin film of sea slides across the planks under their feet",
    v, water=[0.0, 0.05, 0.2, 2.4], crew='dance', paddle=PAD_BAND, stars=['saxo'])
v = deadpan(DOOR, DOOR_TOP(0.06) - 0.1 + 0.62, 2.95, cam_y=DOOR_TOP(0.06) - 0.1 + 0.82, ang=180, fov=42, push=0.12)
add(12, 16, [kob_door(0.06)], "K04 'watching you' (b14.8): Kob's deadpan: on the deckhouse roof, sitting on a door, in an orange life jacket, a glass of milk in her paw, watching",
    v, water=0.06, door=[DOOR[0], DOOR[1], 0], doorBob=False, stars=['kob'])
v = low((0.25, 0.2, -1.2), (0.0, 0.86, -3.5), (0.18, 0.2, -1.5), fov=64, roll=(-10, -6))
add(16, 20, [dancer('saxo', *STAGE, at=2.8)], "K05 'swim' x4 (b16.9-19.6): on the deck at ankle height: the sea sloshes over his feet, four strokes of the swim move, a splash at every step, the crew's rows behind",
    v, water=[0.1, 0.15], crew='dance', clear=[[-2.3, -6.6, 0.4], [2.3, -6.6, 0.4]], paddle=[list(STAGE)], stars=['saxo'])
CB = (2.45, -2.5)
v = view((-0.1, 1.15, -1.75), (2.45, 1.0, -2.55), 54, p1=(0.05, 1.12, -1.8))
add(20, 24, [A('compote', 'happy_idle', *CB, at=0.2, speed=0.6, hold='bucket', arm='both', aim='bail')],
    "K06: Compote alone has noticed: furious, she bails with a red bucket, flinging a bucketful back over her head and over the rail on every beat",
    v, water=0.2, bail=[CB[0] - 0.05, 0.85, CB[1], 1.0, -0.05], stars=['compote'])
BOW2 = (0.3, -16.6)                            # the bow's point: she looks out to starboard; the lens behind her shoulder line sees her profile with the bowsprit and the open sea ahead
v = view((1.2, 1.4, -14.15), (0.25, 1.0, -16.7), 46, p1=(1.17, 1.38, -14.4))
add(24, 28, [A('sadi', 'happy_idle', *BOW2, face='world', yaw=70, at=0.4, speed=0.4, sway=3)], "K07 'swim swim': the clip's heroine at the bow, her caramel coat in the wind, gazing out to sea, dreamy... the bow's deck already awash round her boots",
    v, water=0.24, sprit=False, stars=['sadi'])   # no bowsprit: behind her it grew out of her head or her snout
SX = (1.2, -4.3)                               # side on along the starboard rail: the sailors dive left to right against the sky
v = view((5.6, 2.8, 1.2), (2.0, 1.0, -4.8), 58, p1=(5.5, 2.78, 0.9))
add(28, 32, [dancer('saxo', *SX, at=4.2)], "K08 'dive, dive' (b29.0, b31.1): the crew jump ship: one after another the sailors run to the starboard rail and dive over it, while the captain keeps dancing in front",
    v, water=0.3, crew='dive', crewDive=[round(S(1.0) - 0.45, 2), 0.22], paddle=[list(SX)], stars=['saxo'])

# ================= the bridge (b32-60): knee-deep to over their heads =================
SA, SD = (-0.34, -3.3), (0.34, -3.4)          # close enough that the near paws meet between them
v = view((1.85, 0.72, -0.1), (0.0, 0.92, -3.35), 52, p1=(1.75, 0.7, -0.35), roll=[4, 2])
add(32, 36, [A('saxo', 'happy_idle', *SA, face='world', yaw=yaw_to(SA, SD) - 22, at=0.3, speed=0.45, sway=6, arm='R', aim=[0.12, 0.18, 0.97]),
             A('sadi', 'happy_idle', *SD, face='world', yaw=yaw_to(SD, SA) + 22, at=0.9, speed=0.45, sway=6, arm='L', aim=[0.12, 0.18, 0.97])],
    "K09 (the break): the slow dance: knee-deep, the captain and the heroine sway paw in paw on the flooded deck",
    v, water=0.36, stars=['saxo', 'sadi'])
SW = (0.5, -3.1); SS = (-0.6, -4.6)
v = view((0.95, 1.05, -0.2), (0.0, 0.95, -3.9), 58, p1=(0.9, 1.02, -0.5))
add(36, 40, [A('saxo', 'happy_idle', *SW, at=0.4, arm='R', aim=[0.75, 0.55, 0.35], wave=1), A('sadi', 'being_surprised_and_looking_right', *SS, at=0.2, speed=0.8)],
    "K10 'make wave' (b37.1): the captain waves hello... and a real wave rolls in over the bow and down the deck, right over the heroine",
    v, water=0.42, wave=S(1.3), waveTo=-2.0, stars=['saxo'])
v = low((0.15, 0.68, 0.3), (0.0, 1.0, -3.8), (0.12, 0.68, -0.05), fov=60, roll=(-7, -4))
add(40, 44, [dancer('saxo', *STAGE, at=1.2), dancer('sadi', -0.75, -4.5, at=1.2), A('compote', 'happy_idle', 0.8, -4.8, face='world', yaw=35, at=0.3, speed=0.6, hold='bucket', arm='both', aim='bail')],
    "K11: chest-deep and still going: the swim move now splashes at the surface; Compote still bails behind them",
    v, water=0.5, paddle=[list(STAGE), [-0.75, -4.5]], bail=[1.1, 0.9, -4.6, 0.9, 0.4], stars=['saxo'])
v = view((2.6, 1.55, 3.7), (DOOR[0], 1.72, DOOR[1]), 44, p1=(2.55, 1.56, 3.8), ease='lin')
WK = [0.95, 1.2, 0.3, 2.2]
add(44, 48, [kob_door(0.95, my=round(DOOR_TOP(1.2) - DOOR_TOP(0.95), 3), myAt=0.95, myDur=1.25)],
    "K12: the sea reaches the deckhouse roof and Kob's door lifts off it and floats, Kob still sitting on it with her milk, dry, deadpan",
    v, water=WK, door=[DOOR[0], DOOR[1], 0], doorBob=False, stays=False, stars=['kob'])
WU = 1.3
LU = (0.25, 0.7, 1.1)                        # just under the surface, looking up a little: the bright surface on top, their legs treading under it
v = view(LU, (0.0, 1.02, -3.7), 62, p1=(0.22, 0.7, 0.8))
add(48, 52, [swimmer('saxo', *STAGE, WU, at=0.2, high=0.0), swimmer('sadi', -0.8, -4.4, WU, at=0.6, high=0.0), swimmer('compote', 0.8, -4.4, WU, at=0.9, high=0.0)],
    "K13 'under' (b49.0): the lens goes under the sea: under the bright surface, the band's legs still dance, treading water in time; a fish swims across in front, bubbles rise",
    v, water=WU, fish=[0.0, 0.3, -3.4, 2.6], fishFront=[0.2, 0.62, -1.9], lens=list(LU), bubbles=[list(STAGE), [-0.8, -4.4], [0.8, -4.4]], stars=['saxo'])
W13 = 1.45
v = view((-0.62, W13 + 0.58, 0.55), (-0.4, W13 + 0.5, -3.55), 48, p1=(-0.6, W13 + 0.58, 0.4), ease='lin')
add(52, 56, [swimmer('saxo', 0.0, -3.4, W13, high=0.0), swimmer('sadi', -0.9, -3.8, W13, high=0.0, face='world', yaw=yaw_to((-0.9, -3.8), (0.0, -3.4)))],
    "K14 'sad sad' (b55.2): at the waterline: the captain, up to his chin, sings it with all his heart; the heroine treading water beside him looks at him",
    v, water=W13, stars=['saxo'])
W14 = [1.8, 2.15]
v = view((1.9, 3.2, -10.6), (-0.45, 1.8, -1.0), 50, p1=(1.85, 3.15, -10.2))
add(56, 60, [swimmer('saxo', -1.0, -3.4, 1.98), swimmer('sadi', 0.0, -3.3, 1.98), swimmer('compote', 1.0, -3.4, 1.98), kob_door(1.98)],
    "K15 'face land' (b57.6, b58.8): the wide from outside: the hull gone under, only the masts and the sails above the sea, the band's three heads bobbing in a row between the masts, Kob's door afloat aft",
    v, water=W14, crew='swim', crewSwim=[[-2.4, -1.6, 180], [2.4, -1.8, 180], [-2.0, -0.2, 180], [2.0, -0.3, 180], [-1.2, 0.8, 180], [1.3, 0.9, 180], [0.1, 1.6, 180]],
    door=[DOOR[0], DOOR[1], 0], doorBob=False, stars=['saxo'])

# ================= the final chorus (b60-96): synchronised swimming where the ship was; the door =================
# the ship keeps sinking under them: the sea climbs the masts shot by shot until only their tips and the pennant are left
W15 = 4.0
FS = [(F[0], F[1]), (F[0] - 0.85, F[1] - 1.0), (F[0] + 0.85, F[1] - 1.0)]   # the V: the lead nearest the lens
LS = (0.2, W15 + 1.05, F[1] + 4.2)
v = view(LS, (F[0], W15 + 0.45, F[1] - 0.5), 54)
add(60, 62, [swimmer('saxo', *FS[0], W15, my=-1.25, myAt=round(S(1.0) - 0.08, 2), myDur=0.3, dip=None),
             swimmer('sadi', *FS[1], W15, my=-1.2, myAt=round(S(1.0) + 0.02, 2), myDur=0.3, dip=None),
             swimmer('compote', *FS[2], W15, my=-1.2, myAt=round(S(1.0) + 0.12, 2), myDur=0.3, dip=None)],
    "K16 'dive' (b61.0): synchronised swimming: in formation, the three duck under on the word, one after another",
    v, water=W15, splash=[[FS[0][0], FS[0][1], S(1.0), 0.45], [FS[1][0], FS[1][1], S(1.1), 0.4], [FS[2][0], FS[2][1], S(1.2), 0.4]],
    bubbles=[list(FS[0]), list(FS[1]), list(FS[2])], stars=['saxo'])
v = view(LS, (F[0], W15 + 0.45, F[1] - 0.5), 54)
add(62, 64, [swimmer('saxo', *FS[0], W15, my=1.25, myAt=round(S(1.2) - 0.14, 2), myDur=0.22, lift=round(W15 - NECK['saxo'] + 0.1 - 1.25, 3), dip=None),
             swimmer('sadi', *FS[1], W15, my=1.2, myAt=round(S(1.2) - 0.14, 2), myDur=0.22, lift=round(W15 - NECK['sadi'] + 0.1 - 1.2, 3), dip=None),
             swimmer('compote', *FS[2], W15, my=1.2, myAt=round(S(1.2) - 0.14, 2), myDur=0.22, lift=round(W15 - NECK['compote'] + 0.1 - 1.2, 3), dip=None)],
    "K16 'dive' (b63.2): ...and burst back up together on the second one, straight into the swim move",
    v, water=W15, splash=[[FS[0][0] + 0.5, FS[0][1] - 0.2, S(1.2), 0.6], [FS[1][0] - 0.5, FS[1][1] - 0.2, S(1.2), 0.5], [FS[2][0] + 0.5, FS[2][1] - 0.2, S(1.2), 0.5]], stars=['saxo'])
W16 = 6.0
v = view((0.3, W16 + 3.6, F[1] + 2.9), (F[0], W16 + 0.3, F[1] - 0.7), 56, p1=(0.28, W16 + 3.45, F[1] + 2.7), roll=[0, 4])
add(64, 68, [swimmer('saxo', *FS[0], W16), swimmer('sadi', *FS[1], W16), swimmer('compote', *FS[2], W16)],
    "K17 'swim swim': from above: the formation doggy-paddles in sync inside a ring of the sailor crew's heads, the sails sticking out of the sea behind",
    v, water=W16, paddle=[list(p) for p in FS], crew='swim', crewSwim=[[F[0] - 1.9, F[1] + 0.8, 150], [F[0] + 1.9, F[1] + 0.8, -150], [F[0] - 2.3, F[1] - 1.2, 100], [F[0] + 2.3, F[1] - 1.2, -100], [F[0] - 1.2, F[1] - 2.6, 30], [F[0] + 1.2, F[1] - 2.6, -30], [F[0], F[1] - 3.0, 0]],
    stars=['saxo'])
W17 = 8.0
SX2 = (F[0] - 0.45, F[1]); TB = (F[0] + 0.62, F[1] - 0.1)   # Compote sits in her bucket, now a boat, beside him
v = view((F[0] + 0.05, W17 + 0.95, F[1] + 4.2), (F[0] + 0.02, W17 + 0.52, F[1] - 0.1), 50, p1=(F[0] + 0.05, W17 + 0.93, F[1] + 3.95))
add(68, 72, [swimmer('saxo', *SX2, W17), A('compote', 'sitting_talking', *TB, face='world', yaw=yaw_to(TB, SX2) + 20, at=0, speed=0.05, lift=round(W17 - 0.1, 3), arm='both', aim='bail', noShadow=True)],
    "K18 'water falling skin' (b69.1): Compote sails her red bucket like a boat, still bailing: every scoop lands on the captain's head, who paddles on",
    v, water=W17, tub=[TB[0], TB[1], 0], bail=[TB[0] - 0.2, W17 + 0.6, TB[1] + 0.1, -0.5, 0.02], paddle=[list(SX2)], stars=['compote', 'saxo'])
W18 = 10.0
v = view((0.15, W18 + 0.5, F[1] + 2.4), (0.0, W18 + 0.45, F[1] - 0.5), 54, p1=(0.13, W18 + 0.5, F[1] + 2.2), roll=[-6, -3], hand=0.4)
add(72, 76, [swimmer('saxo', F[0], F[1] - 0.5, W18, mz=0.55), swimmer('sadi', F[0] - 1.22, F[1] - 3.3, W18, mz=0.1), swimmer('compote', F[0] + 0.98, F[1] - 3.2, W18, mz=0.1)],
    "K19 'swim swim': at the waterline, the captain doggy-paddles straight at the lens, grinning, the band behind him, the sails going under",
    v, water=W18, paddle=[[F[0], F[1] - 0.2], [F[0] - 1.22, F[1] - 3.1], [F[0] + 0.98, F[1] - 3.0]], stars=['saxo'])
W19 = 12.0
# the door lies across (its long axis along x); the two girls sit side by side on it, then take its +x end
KD = (FDOOR[0] - 0.5, FDOOR[1]); SDD = (FDOOR[0] + 0.5, FDOOR[1]); DOORX = [FDOOR[0], FDOOR[1], 90]
def sadi_door(W, yaw, at=SDD): return A('sadi', 'sitting_talking', *at, face='world', yaw=yaw, at=0, speed=0.05, lift=round(DOOR_TOP(W) - 0.1, 3))
v = view((FDOOR[0] + 0.6, W19 + 0.6, FDOOR[1] + 3.9), (FDOOR[0] + 0.02, W19 + 0.78, FDOOR[1]), 48, p1=(FDOOR[0] + 0.58, W19 + 0.6, FDOOR[1] + 3.75), ease='lin')
add(76, 80, [kob_door(W19, *KD, yaw=-12), sadi_door(W19, 8)],
    "K20 'watching you' (b78.8): Kob on her door in the open sea, her milk, watching them swim: and beside her, dry, the heroine, who swam over",
    v, water=W19, door=DOORX, doorBob=False, stars=['kob'])
W20 = 14.0
v = orbit((F[0], F[1] - 0.5), 4.6, W20 + 2.4, -18, 26, W20 + 0.3, fov=58, hand=1.0)   # high: the three heads clear of one another
add(80, 84, [swimmer('saxo', *FS[0], W20), swimmer('sadi', *FS[1], W20), swimmer('compote', *FS[2], W20)],
    "K21 'swim' x4: round the formation: four strokes of the swim move in sync, only the tops of the sails left above the sea",
    v, water=W20, paddle=[list(p) for p in FS], stars=['saxo'])
# the door's end game: the girls at its +x end (Kob nearest the end), the empty half by the -x end where he swims up
KE = (FDOOR[0] + 0.74, FDOOR[1]); SE = (FDOOR[0] + 0.2, FDOOR[1]); SG = (FDOOR[0] - 1.45, FDOOR[1])
W21 = 16.0
v = view((FDOOR[0] - 0.42, W21 + 1.45, FDOOR[1] - 5.7), (FDOOR[0] - 0.42, W21 + 0.45, FDOOR[1]), 58, p1=(FDOOR[0] - 0.42, W21 + 1.4, FDOOR[1] - 5.4))
add(84, 88, [swimmer('saxo', *SG, W21, face='world', yaw=90, arm='both', aim=[0.15, -0.05, 0.98], dip=[0.02, 2.0]),
             kob_door(W21, *KE, yaw=-90), sadi_door(W21, -90, SE)],
    "K22: side on: the captain swims up to the door's empty end and puts his paws on it: Kob and the heroine sit at the other end, and there's plenty of room",
    v, water=W21, door=DOORX, doorBob=False, stars=['saxo'])
W22 = 17.0
v = view((SG[0] - 0.35, W22 + 0.42, SG[1] + 0.3), (KE[0], W22 + 0.92, KE[1]), 50, p1=(SG[0] - 0.3, W22 + 0.43, SG[1] + 0.25), roll=[6, 4])
add(88, 92, [A('kob', 'happy_idle', *KE, face='camera', at=0.3, speed=0.4, lift=round(DOOR_TOP(W22), 3), hold='milk')],
    "K23 'swim swim' (his point of view from the water, across the empty half of the door): Kob stands up on the door's far end and looks down at him, deadpan, milk in paw",
    v, water=W22, door=DOORX, doorBob=False, stars=['kob'])
W23 = 18.0
DIVE = S(95.1 - 92)                            # the last 'dive', 1.98 s into the shot
L23 = (FDOOR[0] + 2.3, W23 + 1.75, FDOOR[1] + 1.25)   # over the two girls' shoulders (their backs at the lens) at his face across the empty half
v = view(L23, (SG[0] + 0.1, W23 + 0.45, SG[1]), 50, p1=(FDOOR[0] + 2.2, W23 + 1.72, FDOOR[1] + 1.2))
add(92, 96, [A('kob', 'happy_idle', *KE, face='world', yaw=-90, at=0.3, speed=0.4, lift=round(DOOR_TOP(W23), 3), hold='milk', fg=True),
             A('sadi', 'sitting_talking', *SE, face='world', yaw=-90, at=0, speed=0.05, lift=round(DOOR_TOP(W23) - 0.1, 3), fg=True),
             swimmer('saxo', *SG, W23, face='world', yaw=90, clip='standing_praying_while_swaying', at=0.4, speed=1.0, arm=None, aim=None, high=0.25, my=-1.4, myAt=round(DIVE - 0.08, 2), myDur=0.4, dip=None)],
    "K24 'dive, dive' (b93.0, b95.1): over the girls' shoulders across the empty half of the door: the captain begs, paws together... and on the last 'dive' he slips under with a splash; the song stops dead",
    v, water=W23, door=DOORX, doorBob=False, splash=[[SG[0] + 0.1, SG[1], round(DIVE + 0.12, 2), 0.8]], stars=['saxo'])
L24 = (FDOOR[0] - 3.2, W23 + 1.15, FDOOR[1] - 0.6)
v = view(L24, (FDOOR[0] + 0.0, W23 + 0.55, FDOOR[1]), 48)
add(96.2, 97.2, [A('kob', 'happy_idle', *KE, face='camera', at=0.5, speed=0.2, lift=round(DOOR_TOP(W23), 3), hold='milk', arm='R', aim=[0.3, 0.15, 0.94])],
    "BUTTON (the silence, one beat): all that's left of him is his captain's cap afloat and bubbles at the door's empty end; Kob, at the far end, holds her milk, deadpan",
    v, water=W23, door=DOORX, doorBob=False, bubbles=[list(SG)], cap=[SG[0] + 0.25, SG[1] - 0.3, -100, -0.55], still=True, stars=['kob'])

ep = {
    'date': '2026-10-01', 'song': {'title': 'SWIM', 'artist': 'BTS'},
    'logline': "The band plays on: Saxo's boy band shoots its SWIM video on a schooner that has just hit an iceberg, and keeps doing the swim move as the sea rises line by line, while Kob, in a life jacket from her first shot, waits on a door; on the last 'dive' she pushes the captain off it.",
    'new': 'the OBLIVIOUS structure (a disaster grows in every shot while the performers carry on); src/maps21.js ship: a schooner by day that sinks (the sea rises, an underwater tint in the shared shader, a see-through flood over the deck, the lens under the sea); the paddle and bail swings; the bucket; four looks (captain, coat, lifevest, sailor)',
    'notes': "The clip (studied from a 360p copy, one frame every 3 s): a museum of model ships, a white three-masted schooner at sea, the band in black naval officer's jackets with gold buttons at the wheel and the rail, a heroine in a camel coat at the bow, sailors in white hauling a rope in a line, a telegraph, a pocket watch, cream sails against a blue sky; the performance video is a maritime museum's boat hall. Kept: the schooner, the jackets (Saxo's captain look), the heroine (Sadi's coat), the sailors (the crew, Compote's whites). The whole cast: Saxo the oblivious captain and lead; Sadi the heroine, then the reality check (she ends up on the door); Kob never dances and came prepared (the life jacket, the door, the milk: she won't touch water, the running thread); Compote fights the sea with a bucket all the way.",
    'with': ['sadi', 'kob', 'compote'],
    'clips': ['sitting_talking', 'happy_idle', 'standing_praying_while_swaying', 'being_surprised_and_looking_right'],
    'tags': {'structure': 'oblivious', 'scenes': ['flood', 'swim'], 'cast': ['saxo', 'sadi', 'kob', 'compote'], 'hook': 'dance', 'maps': ['ship'], 'ref': 'none',
             'lyric_literal': "'swim' (the paddle on every one, then swimming for real), 'water falling on skin' (the spray, the bucket), 'watching you' (Kob), 'dive' (the crew jump ship, the synchronised dive, the push off the door), 'make wave' (a real wave), 'under' (the lens goes under the sea)",
             'experiment': "Does a disaster that grows in every shot while the band keeps dancing (the band plays on) with a famous-film payoff (the door) hold viewers to the end and get more shares per 1,000 views than our story plots, on a global K-pop hit?"},
    'shots': shots,
}
json.dump(ep, open(os.path.join(os.path.dirname(__file__), '2026-10-01.json'), 'w'), indent=1, ensure_ascii=False)
print(len(shots), 'shots;', len(WARN), 'warnings')
for w in WARN: print('  ', w)
