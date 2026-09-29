# make_2026-09-30-2.py: writes episodes/2026-09-30-2.json, "Self Aware" (Temper City; #11 on Spotify's global daily
# chart on 2026-09-29, 3.19M TikTok videos on its sound, 41M views on the official video). The clip: a three-piece band in
# black and white, playing on the shoulder of a mountain road (a softbox on a tripod, a dump truck passing, camels on a
# ridge), inside the aluminium box of a truck's trailer under strip lights; colour comes in at the end.
# Ours, a misdirect (new structure: every love line seems sung to the one who adores him, and the angle shows it's for his
# own reflection): Saxo, the band's brooding frontman in a leather jacket and a thin tie, sings the whole black-and-white
# video to Sadi... past her, into the lit dressing-room mirror he brought to the shoot. She blushes, steps in the way, he
# leans round her; he kisses his reflection. In the trailer she brings him a daisy and he sings to the vanity mirror; she
# finds a pink hand mirror on an amp. Chorus 2: she sings to herself in it, hearts over her head, while Compote, the
# furious drummer, gets up with her stick and smashes the big mirror on "never be together". Colour floods in; Saxo turns
# to Sadi at last... and she doesn't look up from her own mirror. Kob plays bass through all of it, unimpressed.
# Beats count from B0 = 0.03 s at 162 BPM (cut time = 0.03 + b * 60/162 s; a line = 2 bars = 8 beats = 2.96 s): the cut
# is 38.4726-122.2064 s of the song + one silent beat (episodes/2026-09-30-2.config.js); the video ends at 84.1 s (b227).
# Lyric rows K00-K28 (episodes/2026-09-30-2.lyrics.js; the lyrics stay in their files): chorus 1 K00-K11 (b0-96), verse 2
# K12-K16 (b96-128), chorus 2 K17-K28 (b127-226). Action words (whitelisted keywords, kit beats): 'hope' b0, 'wanna'
# b9, 'look' b16, 'love' b22, 'wish' b32, 'mind' b41, 'think' b50, 'always' b58, 'never' b66, 'pretend' b74, 'wish' b83;
# 'love' b107; chorus 2 the same words 127-128 beats later.
import json, math, os, re, sys
sys.path.insert(0, os.path.dirname(__file__))
from cam import view, swoop, low, deadpan

P = 60 / 162.0
S = lambda b: round(b * P, 3)
END = 84.1
LOOK = {'saxo': 'frontman', 'sadi': 'base', 'kob': 'bassist', 'compote': 'drummer'}
HEAD = {'saxo': 1.42, 'sadi': 1.25, 'kob': 1.38, 'compote': 1.42}   # the top of each head standing (the quiff, the cap)
FACE = {'saxo': 0.95, 'sadi': 0.88, 'kob': 0.9, 'compote': 0.9}
# ---- the lay-by (src/maps20.js DESERT) ----
MIC = (-1.2, 0.3); KOB = (1.35, -0.25); DRUMS = (0.1, -1.25); AMP = (-3.1, 1.2); AMP_Y = 0.45
GZ = 2.3                                    # the big mirror's glass plane (it faces -z, the mic); its case runs to z 4.9
SADI = (-1.85, 1.35)                        # the fan, off to the side of his line to the mirror
# ---- the trailer (src/maps20.js TRAILER) ----
T_MIC = (-0.35, -4.4); T_KOB = (1.0, -5.2); T_DRUMS = (0.05, -6.9); T_AMP = (1.05, -1.9); T_AMP_Y = 0.45
GX = -1.7; VAN_Z = -3.4                     # the vanity's glass plane on the left wall (it faces +x); its case runs to x -3.3

def A(who, clip, x, z, **o):
    return {'who': who, 'look': o.pop('look', LOOK[who]), 'clip': clip, 'x': round(x, 3), 'z': round(z, 3), 'face': o.pop('face', 'camera'),
            'yaw': o.pop('yaw', 0), 'at': o.pop('at', 'auto'), **o}
def yaw_to(a, b): return round(math.degrees(math.atan2(b[0] - a[0], b[1] - a[1])), 1)
def saxo_guitar(x=MIC[0], z=MIC[1], **o):
    return A('saxo', 'playing_a_guitar', x, z, face='world', yaw=o.pop('yaw', 0), at=o.pop('at', 0.5), hold='guitar', holdScale=1.2, sway=o.pop('sway', 3), **o)
def kob_bass(x=KOB[0], z=KOB[1], clip='playing_a_guitar', **o):
    return A('kob', clip, x, z, face='world', yaw=o.pop('yaw', -15), at=o.pop('at', 0.8), speed=o.pop('speed', 0.6), hold='guitar', holdScale=1.2, **o)
def compote_drums(x=DRUMS[0], z=DRUMS[1], **o):
    return A('compote', 'male_driving_a_car', x, z, face='world', yaw=o.pop('yaw', 0), at=0, speed=0.3, hold='dstick', holdL='dstick', arm='both', aim='drums', upAt=0.0, **o)
def sadi_amp(x, z, yaw, **o):   # Sadi seated on an amp, her pink hand mirror held up beside her face
    return A('sadi', 'sitting_talking', x, z, face='world', yaw=yaw, at=0.0, speed=0.05, lift=o.pop('lift', AMP_Y - 0.1), hold='handmirror', arm='R', aim=o.pop('aim', [0.5, 0.45, 0.62]), **o)
# the reflection: a crowd of one Saxo standing in the mirror's case at the mirrored spot, the same clip at the same offset
def reflect(a, plane='z', g=GZ):
    x, z, yaw = a['x'], a['z'], a['yaw']
    c = {'who': 'saxo', 'look': a['look'], 'clip': a['clip'], 'at': a['at'], 'speed': a.get('speed', 1), 'n': 1, 'cols': 1, 'dx': 0, 'dz': 0, 'jitter': 0, 'face': 'world'}
    if plane == 'z': c.update(x0=x, z0=round(2 * g - z, 3), yaw=round(180 - yaw, 1), mx=a.get('mx', 0), mz=-a.get('mz', 0))
    else: c.update(x0=round(2 * g - x, 3), z0=z, yaw=round(-yaw, 1), mx=-a.get('mx', 0), mz=a.get('mz', 0))
    if a.get('sway'): c['sway'] = a['sway']
    return c

# ---- a projection check (numbers only): where each face lands in the 9:16 frame at the shot's start and end ----
def _proj(cam, look, fov, pt):
    f = [look[i] - cam[i] for i in range(3)]; n = math.sqrt(sum(v * v for v in f)); f = [v / n for v in f]
    r = [-f[2], 0.0, f[0]]; rn = math.sqrt(r[0] ** 2 + r[2] ** 2) or 1; r = [r[0] / rn, 0.0, r[2] / rn]
    u = [r[1] * f[2] - r[2] * f[1], r[2] * f[0] - r[0] * f[2], r[0] * f[1] - r[1] * f[0]]
    d = [pt[i] - cam[i] for i in range(3)]; z = sum(a * b for a, b in zip(d, f))
    if z <= 0.05: return None
    tv = math.tan(math.radians(fov) / 2); th = tv * 9 / 16
    return (0.5 + sum(a * b for a, b in zip(d, r)) / z / th / 2, 0.5 - sum(a * b for a, b in zip(d, u)) / z / tv / 2)
_src = open(os.path.join(os.path.dirname(__file__), '2026-09-30-2.lyrics.js')).read()
_rows = json.loads(re.search(r'window\.LYRICS = (.*?);\n', _src).group(1)); _ends = json.loads(re.search(r'window\.LINE_END = (.*?);\n', _src).group(1))
LINES = [((row[0][0] - 0.03) / P, (e - 0.03) / P) for row, e in zip(_rows, _ends)]
def has_line(b0, b1): return any(a < b1 and b > b0 for a, b in LINES)
WARN = []
SEATED = ('male_driving_a_car', 'sitting_talking')
def check(beat, b1, lenses, look, fov, actors):
    line = has_line(beat, b1)
    for k, cam in enumerate(lenses):
        end = k == len(lenses) - 1
        for a in actors:
            if a.get('fg'): continue
            x, z = a['x'] + a.get('mx', 0) * end, a['z'] + a.get('mz', 0) * end
            hy = a.get('lift', 0) + (-0.3 if a.get('clip') in SEATED else 0)
            top, face = _proj(cam, look, fov, (x, HEAD[a['who']] + hy, z)), _proj(cam, look, fov, (x, FACE[a['who']] + hy, z))
            if not top or not face: WARN.append(f'b{beat}: {a["who"]} behind the lens'); continue
            if line and top[1] < 0.26: WARN.append(f'b{beat}: {a["who"]} head top at {top[1]:.2f} (lyric rows){" at the end" if end else ""}')
            if face[0] < 0.12 or face[0] > 0.88: WARN.append(f'b{beat}: {a["who"]} face x {face[0]:.2f} (edge){" at the end" if end else ""}')
            if face[1] > 0.8: WARN.append(f'b{beat}: {a["who"]} face y {face[1]:.2f} (low)')

shots = []
def lens(v, k=0):
    c, f = v; a = math.radians(c['ang'][k]); fy = f[2] if len(f) > 2 else 0
    return (f[0] + math.sin(a) * c['r'][k], c['h'][k] + fy, f[1] + math.cos(a) * c['r'][k])
def L2(v): return [lens(v, 0), lens(v, -1)]
def add(beat, b1, actors, lyric, v, map='desert', **o):
    c, focus = v
    o = {k: val for k, val in o.items() if val is not None}
    s = {'beat': beat, 'kind': 'dance', 'map': map, 'actors': actors, 'lyric': lyric, 'cam': c, 'focus': focus, **o}
    fy = focus[2] if len(focus) > 2 else 0
    look = (focus[0], c['look'][0] + fy, focus[1])
    check(beat, b1, L2(v), look, c['fov'], actors)
    shots.append(s)
BW = {'mono': True}
HS = lambda x, z, s0=0.2, y=1.3: [round(x, 3), y, round(z, 3), s0]   # a heart spot over a head

# ================= chorus 1 (b0-96): the black-and-white video on the lay-by; every line goes past Sadi =================
H1 = A('saxo', 'happy_idle', -1.2, 0.45, face='world', yaw=0, at=0.2, speed=0.5, sway=8)
SH = (-0.3, 1.55)                           # Sadi in the hook: beside the mirror, on the lens's side of it
v = view((-0.2, 1.95, -1.9), (-1.0, 0.95, 2.0), 52, p1=(-0.4, 1.6, -1.25), roll=[-10, -6], hand=0.3)
add(0, 8, [dict(H1, fg=True), A('sadi', 'happy_idle', *SH, face='world', yaw=yaw_to(SH, (-1.2, 0.45)), at=0.2, speed=0.3)],
    "HOOK (K00): the whole joke in one frame, black and white: pushing in over the frontman's shoulder: he croons into a bulb-lit dressing-room mirror by a mountain road, his reflection crooning back, while beside it Sadi melts, hearts over her head",
    v, **BW, noMic=True, hearts=[HS(SH[0], SH[1], 0.0)], crowd=reflect(H1), stars=['saxo'])
v = view((1.5, 1.25, 2.1), (-1.45, 1.0, 0.75), 54, p1=(1.35, 1.23, 2.05))
add(8, 16, [saxo_guitar(at=1.2), A('sadi', 'happy_idle', *SADI, face='world', yaw=yaw_to(SADI, MIC), at=0.4, speed=0.3)],
    "K01 'wanna' (watcher): the two of them in one frame: the fan gazing at the frontman as he sings, hearts popping over her head",
    v, **BW, hearts=[HS(SADI[0], SADI[1], 0.3, 1.35)], stars=['saxo'])
v = low((-0.55, 0.22, 1.95), (MIC[0], 0.98, MIC[1]), (-0.6, 0.22, 1.7), fov=60, roll=(-9, -6))
add(16, 24, [saxo_guitar(at=2.0, sway=5)],
    "K02 'look' (b16): low and pushing in: he sings it straight ahead, soulful, eyes half closed",
    v, **BW, noMic=True, stars=['saxo'])
v = view((-1.15, 1.12, 0.1), (-1.72, 0.95, 1.8), 62, p1=(-1.15, 1.1, 0.2))
add(24, 32, [A('sadi', 'happy_idle', *SADI, face='world', yaw=yaw_to(SADI, MIC), at=0.8, speed=0.3)],
    "K03 'love' (the reverse, his point of view): Sadi, melting, hearts over her head... and behind her, in the lit mirror, his reflection singing",
    v, **BW, noMic=True, hearts=[HS(SADI[0], SADI[1], 0.1, 1.35)], crowd=reflect(saxo_guitar(at=2.8)), stars=['sadi'])
v = view((0.2, 1.9, -2.6), (-1.1, 0.9, 1.4), 50, p1=(0.15, 1.85, -2.35))
add(32, 40, [saxo_guitar(at=3.6), A('sadi', 'happy_idle', *SADI, face='world', yaw=yaw_to(SADI, MIC), at=1.2, speed=0.3)],
    "K04 'wish' (the reveal): high from behind the band: he isn't singing to her at all: he sings past her, into the dressing-room mirror, to his own reflection",
    v, **BW, hearts=[HS(SADI[0], SADI[1], 0.2, 1.35)], crowd=reflect(saxo_guitar(at=3.6)), stars=['saxo'])
S6 = A('saxo', 'happy_idle', -1.2, 0.5, face='world', yaw=0, at=0.4, speed=0.5, sway=8)
v = view((-2.0, 1.75, -0.6), (-0.92, 0.95, GZ), 48, p1=(-1.95, 1.72, -0.4))
add(40, 48, [dict(S6, fg=True, reveal=S(8)), A('sadi', 'happy_idle', -0.85, 1.35, face='world', yaw=-100, at=0.4, speed=0.3, mx=-0.33, mz=0.0)],
    "K05 'mind... way' (b41): over his shoulder: his reflection sings back at him from the mirror; Sadi steps right into the way, and he leans round her",
    v, **BW, crowd=reflect(S6), stars=['saxo'])
v = deadpan(KOB, 1.02, 2.5, cam_y=1.05, fov=42, push=0.12, ang=-12)
add(48, 56, [kob_bass(yaw=-12, speed=0.35, clip='bored_idle', at=1.0)],
    "K06 'think' (deadpan): Kob on bass, locked off: nothing on her face",
    v, **BW, stars=['kob'])
v = low((0.75, 0.22, 0.55), (DRUMS[0], 0.72, DRUMS[1]), (0.62, 0.22, 0.25), fov=60, roll=(8, 5))
add(56, 64, [compote_drums()],
    "K07 'always' (b58): low on the drummer: Compote pounding the kit, glaring up at the frontman",
    v, **BW, stars=['compote'])
SD9 = (-1.8, 1.2)
v = view((0.9, 1.1, 1.9), (-1.45, 0.92, 0.8), 50, p1=(0.8, 1.1, 1.8))
add(64, 72, [A('saxo', 'shaking_head_no_dismissively', -1.25, 0.4, face='world', yaw=yaw_to((-1.25, 0.4), SD9), at=0.3, speed=0.9), A('sadi', 'happy_idle', *SD9, face='world', yaw=yaw_to(SD9, (-1.25, 0.4)), at=0.4, speed=0.3)],
    "K08 'never' (b66): side on: she leans in, hearts and all; he shakes his head at her on 'never'",
    v, **BW, noMic=True, hearts=[HS(SD9[0], SD9[1], 0.2)], stars=['saxo', 'sadi'])
K10 = A('saxo', 'happy_idle', -1.2, 0.55, face='world', yaw=0, at=0.5, speed=0.4, mz=1.25)
v = view((-1.2, 1.12, 4.75), (-1.2, 1.0, 1.0), 50, p1=(-1.2, 1.1, 4.6))
add(72, 80, [K10, A('sadi', 'being_surprised_and_looking_right', -0.45, -0.15, face='world', yaw=yaw_to((-0.35, -0.3), (-1.2, 1.4)), at=0.2, speed=0.8)],
    "K09 'pretend' (b74, the mirror's point of view): through its bulb-lit frame, he walks up to the glass and kisses his reflection; behind him Sadi's jaw drops",
    v, **BW, noGlass=True, hearts=[[-1.2, 1.25, 1.95, 1.2]], stars=['saxo'])
v = view((1.4, 2.6, -5.6), (-0.9, 0.95, 2.6), 52, p1=(1.3, 2.5, -5.3))
add(80, 88, [saxo_guitar(at=4.2), A('sadi', 'happy_idle', *SADI, face='world', yaw=yaw_to(SADI, MIC), at=1.6, speed=0.3), compote_drums()],
    "K10 'wish' (b83): from behind the band: a dump truck thunders past on the road beyond the mirror; the video goes on",
    v, **BW, truck=[S(4.0), 13], stars=['saxo'])
v = low((1.1, 0.35, 4.5), (0.05, 0.85, 1.3), (1.05, 0.35, 4.35), fov=62, roll=(9, 6), hand=0.4)
add(88, 96, [A('sadi', 'happy_walk', -0.55, 1.7, face='world', yaw=80, at=0.3, speed=0.6, mx=0.95, mz=0.15), saxo_guitar(at=5.0)],
    "K11 (b90): low: Sadi gives up and walks off along the lay-by, the frontman still singing to his mirror behind her",
    v, **BW, stars=['sadi'])

# ================= verse 2 (b96-128): in the trailer; the daisy, the vanity mirror, the hand mirror =================
TV = A('saxo', 'happy_idle', -1.05, VAN_Z, face='world', yaw=-90, at=0.6, speed=0.5, sway=6)
v = view((0.2, 1.45, 0.6), (-0.5, 0.95, -5.0), 68, p1=(0.18, 1.4, 0.3))
add(96, 104, [TV, kob_bass(*T_KOB, yaw=-10), compote_drums(*T_DRUMS)],
    "K12-K13 (verse 2): inside the truck's trailer, the clip's aluminium box under strip lights: the band at the far end; the frontman at the vanity mirror on the wall, fixing his quiff",
    v, map='trailer', **BW, crowd=reflect(TV, 'x', GX), stars=['saxo'])
T14 = A('saxo', 'happy_idle', -1.0, VAN_Z, face='world', yaw=-90, at=1.2, speed=0.5, sway=6)
v = view((-2.95, 1.2, VAN_Z), (-1.0, 1.0, VAN_Z + 0.15), 50, p1=(-2.9, 1.18, VAN_Z))
add(104, 112, [T14, A('sadi', 'happy_idle', -0.2, -2.8, face='world', yaw=yaw_to((-0.2, -2.8), (-1.0, VAN_Z)), at=0.4, speed=0.3, hold='daisy', arm='R', aim=[0.6, 0.55, 0.45])],
    "K14 'love' (b107, the vanity's point of view): he sings the love line into the mirror, and behind him Sadi holds out a daisy to his back",
    v, map='trailer', **BW, noGlass=True, stars=['saxo'])
v = deadpan(T_KOB, 1.1, 2.3, cam_y=1.2, fov=36, push=0.1, ang=38)
add(112, 120, [kob_bass(*T_KOB, yaw=38, speed=0.35, clip='bored_idle', at=2.0)],
    "K15 (deadpan): Kob in the trailer, on bass, from her other side: still nothing",
    v, map='trailer', **BW, stars=['kob'])
SS = (T_AMP[0], T_AMP[1])
v = view((0.55, 1.2, -0.15), (SS[0] - 0.1, 1.02, SS[1]), 54, p1=(0.58, 1.18, -0.35))
add(120, 128, [sadi_amp(*SS, -20, lift=T_AMP_Y - 0.1, holdFrom=S(3.0), upAt=S(3.0))],
    "K16 (b120): Sadi slumps on an amp by the doors... finds a pink hand mirror lying on it, picks it up, looks: hearts pop over her head",
    v, map='trailer', **BW, handmirror=True, hearts=[HS(SS[0], SS[1], S(3.4), 1.15)], stars=['sadi'])

# ================= chorus 2 (b128-226): she has a mirror too; Compote smashes his; colour =================
v = low((0.05, 0.3, 0.75), (DRUMS[0], 0.72, DRUMS[1]), (0.05, 0.3, 0.45), fov=58, roll=(-7, -4))
add(128, 136, [compote_drums()],
    "K17 (b128, chorus 2): low from her other side: Compote pounding harder, her glare going from the frontman to his mirror",
    v, **BW, stars=['compote'])
S18 = A('saxo', 'happy_idle', -1.2, 0.8, face='world', yaw=0, at=1.8, speed=0.5, sway=9)
v = view((-0.45, 1.4, -0.7), (-1.3, 1.0, GZ), 44, p1=(-0.5, 1.38, -0.5))
add(136, 144, [dict(S18, fg=True)],
    "K18 'wanna' (b137): over his other shoulder, closer: his reflection, swaying with him, bulbs all round it",
    v, **BW, crowd=reflect(S18), stars=['saxo'])
SA = (AMP[0], AMP[1])
v = view((-2.15, 1.2, 3.25), (SA[0] - 0.1, 1.02, SA[1]), 50, p1=(-2.2, 1.18, 3.05))
add(144, 152, [sadi_amp(*SA, 25)],
    "K19 'look' (b144): the line is hers now: Sadi on her amp, gazing into her pink hand mirror, hearts over her own head",
    v, **BW, hearts=[HS(SA[0], SA[1], 0.1, 1.2)], stars=['sadi'])
S20 = A('saxo', 'happy_idle', -1.2, 0.7, face='world', yaw=0, at=2.6, speed=0.5, sway=8)
v = view((0.2, 1.35, -2.6), (-1.95, 0.95, 1.4), 62, p1=(0.1, 1.32, -2.4))
add(152, 160, [S20, sadi_amp(*SA, 160)],
    "K20 'love' (b152): the two of them from behind the band: him singing to his mirror, her singing to hers, each in their own world",
    v, **BW, crowd=reflect(S20), hearts=[HS(SA[0], SA[1], 0.3, 1.2)], stars=['saxo', 'sadi'])
v = deadpan(KOB, 1.02, 2.6, cam_y=1.3, fov=40, push=0.1, ang=-35)
add(160, 168, [kob_bass(yaw=-35, speed=0.35, clip='bored_idle', at=3.0)],
    "K21 'wish' (deadpan): Kob, from a new side: her eyes slide towards the drums",
    v, **BW, stars=['kob'])
CW0, CW1 = (0.25, -0.3), (-0.05, 0.95)
v = view((3.8, 1.05, 0.4), (0.05, 0.95, 0.35), 50, p1=(3.7, 1.05, 0.45))
add(168, 176, [A('compote', 'happy_walk', *CW0, face='world', yaw=yaw_to(CW0, CW1), at=0.3, speed=0.9, mx=round(CW1[0] - CW0[0], 3), mz=round(CW1[1] - CW0[1], 3), hold='dstick')],
    "K22 'mind... way' (b169): side on: Compote gets up from the drums, one stick in her paw, and marches for the mirror",
    v, **BW, stars=['compote'])
S23 = A('saxo', 'happy_idle', -1.2, 1.0, face='world', yaw=0, at=3.4, speed=0.5, sway=8)
v = view((-1.2, 1.12, 4.75), (-1.2, 1.0, 1.0), 50, p1=(-1.2, 1.1, 4.6))
add(176, 184, [S23, A('compote', 'happy_walk', -0.35, -0.9, face='world', yaw=yaw_to((-0.35, -0.9), (-0.45, 1.5)), at=0.3, speed=0.9, mx=-0.05, mz=1.5, hold='dstick', arm='R', aim=[0.5, 0.7, 0.4], upAt=0.4)],
    "K23 'think' (the mirror's point of view): he sings to us, eyes closed... and behind him Compote marches in, stick raised",
    v, **BW, noGlass=True, stars=['saxo'])
CS = (-0.35, 1.75)                          # Compote after the smash, beside the empty frame
CH = (-1.05, 1.55)                          # Compote's mark for the smash: between him and his reflection
S24 = A('saxo', 'happy_idle', -1.2, 0.8, face='world', yaw=0, at=4.2, speed=0.5, sway=8)
v = view((1.9, 1.05, 1.45), (-1.0, 0.95, 1.55), 48, p1=(1.75, 1.05, 1.5))
add(184, 192, [A('compote', 'zombie_overhead_two_hand_attack', *CH, face='world', yaw=0, at=0.55, speed=0.3, once=True, hold='dstick', holdScale=1.8)],
    "K24 'always' (b186): side on: Compote steps between him and his reflection and raises the stick over her head with both paws; he sings on",
    v, **BW, crowd=reflect(S24), stars=['compote'])
v = view((-3.3, 1.2, -0.3), (-0.9, 1.05, 1.5), 56, p1=(-3.25, 1.2, -0.15))
add(192, 200, [A('saxo', 'being_surprised_and_looking_right', -1.2, 0.8, face='world', yaw=10, at=0.1, speed=0.8), A('compote', 'zombie_overhead_two_hand_attack', *CH, face='world', yaw=0, at=1.4, speed=0.6, once=True, hold='dstick', holdScale=1.8)],
    "K25 'never' (b194): SMASH: the glass bursts into shards on 'never be together', the reflection gone; he recoils",
    v, **BW, smash=0.05, stars=['saxo'])
v = view((-3.2, 1.4, 4.5), (-2.5, 0.95, 1.0), 62, p1=(-3.15, 1.38, 4.3))
add(200, 208, [A('saxo', 'happy_walk', -1.3, 0.7, face='world', yaw=yaw_to((-1.3, 0.7), SA), at=0.2, speed=0.7, mx=-0.8, mz=0.1, reveal=0.9), sadi_amp(*SA, 20)],
    "K26 'pretend' (b202): COLOUR floods into the world: the sky goes blue, and the frontman turns from the broken mirror to Sadi at last",
    v, broken=True, mono=[0.25, 1.4], hearts=[HS(SA[0], SA[1], 0.6, 1.2)], stars=['saxo'])
SX27 = (-2.45, 1.0)
v = view((-2.3, 1.2, 4.0), (-2.8, 1.0, 1.1), 54, p1=(-2.33, 1.18, 3.8))
add(208, 216, [A('saxo', 'happy_idle', *SX27, face='world', yaw=yaw_to(SX27, SA), at=0.6, speed=0.6, sway=6), sadi_amp(*SA, 5)],
    "K27 'wish' (b211): in colour: he sings to her now... and she turns away to her own mirror, hearts over her own head",
    v, broken=True, hearts=[HS(SA[0], SA[1], 0.2, 1.2)], stars=['saxo', 'sadi'])
v = view((3.6, 4.2, -3.6), (-1.1, 0.6, 1.1), 50, p1=(3.4, 4.0, -3.3))
add(216, 224, [A('saxo', 'shoulder_shrug', *SX27, face='world', yaw=160, at=0.3, speed=0.8), sadi_amp(*SA, 200),
               A('compote', 'happy_idle', *CS, face='world', yaw=160, at=0.3, speed=0.3, hold='dstick', holdScale=1.8)],
    "K28 (b218): the high wide in colour: the shards glinting on the gravel, Compote beside the empty frame with her stick, Sadi lost in her mirror, the frontman shrugging, camels on the ridge",
    v, broken=True, hearts=[HS(SA[0], SA[1], 0.2, 1.2)], stars=['saxo'])
v = deadpan(KOB, 1.02, 2.5, cam_y=1.05, fov=40, push=0.05, ang=-12)
add(224, 227.2, [kob_bass(yaw=-12, speed=0.0, at=1.0, clip='bored_idle')],
    "button (the music stops, one silent beat): Kob, in colour now, still unimpressed",
    v, broken=True, still=True, stars=['kob'])

default_clips = {'gangnam', 'charleston', 'shuffle', 'twist', 'samba'}
crowd_clips = {c['clip'] for s in shots for c in ([s['crowd']] if isinstance(s.get('crowd'), dict) else s.get('crowd') or [])}
ep = {
    'date': '2026-09-30', 'n': 2,
    'song': {'title': 'Self Aware', 'artist': 'Temper City'},
    'logline': "Saxo's band shoots its black-and-white music video on a mountain road, and every love line he seems to sing to Sadi goes past her, to his own reflection in the dressing-room mirror he brought, until Compote smashes it and Sadi finds a mirror of her own",
    'with': ['sadi', 'kob', 'compote'],
    'clips': sorted(({a['clip'] for s in shots for a in s['actors']} | crowd_clips) - default_clips),
    'tags': {'structure': 'misdirect', 'scenes': ['mirror', 'smash'], 'cast': ['saxo', 'sadi', 'kob', 'compote'], 'hook': 'dance',
             'maps': ['desert', 'trailer'], 'ref': 'none', 'lyric_literal': "K02/K19 'look' (to his reflection, then hers), K05 'mind gets in the way' (Sadi steps in the way), K08/K25 'never be together' (the head shake, then the smash), K09 'play pretend' (he kisses his reflection)",
             'experiment': "Does a misdirect structure (each love line seems aimed at someone, the reverse angle shows it's for the lead's own reflection) get more shares per 1,000 views than our story plots?"},
    'notes': ("The clip: Temper City as a three-piece band in black and white, on the shoulder of a mountain road with ranges behind them, "
              "a softbox on a tripod, a dump truck passing, camels on a ridge, inside a truck's aluminium trailer under strip lights; "
              "colour at the end. Ours keeps the road, the trailer, the softbox, the truck, the camels and the black and white turning to "
              "colour; the lead wears the singer's leather jacket and thin tie, Kob and Compote the band's shirts and ties. Structure: "
              "misdirect (new). Sadi is the fan he never sees (the romance, then the reality check: she ends up just like him); Compote, the "
              "drummer, is violent over it (she smashes the mirror); Kob plays bass, never impressed."),
    'shots': shots,
}
out = os.path.join(os.path.dirname(__file__), '2026-09-30-2.json')
json.dump(ep, open(out, 'w'), indent=1)
print(f'{len(shots)} shots, the last from b{shots[-1]["beat"]} to b227.2 ({END} s); clips: {", ".join(ep["clips"])}')
for w in WARN: print('WARN', w)
