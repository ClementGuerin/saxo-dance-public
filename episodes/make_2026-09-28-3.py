# make_2026-09-28-3.py: writes episodes/2026-09-28-3.json, "Billie Jean" (Michael Jackson, 1983; back on Spotify's
# global daily chart in September 2026, 856k videos on its TikTok sound). The clip is a stylised city street at night:
# a sidewalk whose squares light up under the singer's steps, a private eye in a trench coat tailing him with a camera
# (the singer never shows up in his photos), the HOTEL, the police taking the private eye away at the end. The song is a
# denial: a girl says he's the father, he says the kid isn't his.
# Ours: the denial against the evidence. Saxo, in the 1983 look (black leather jacket, pink shirt, red bow tie), struts
# down the night street lighting up the squares; Kob, a private eye in a trench and fedora, tails him from behind a lamp
# post far too thin to hide her, and when her flash goes off he isn't in the photo: he's gone, then dancing right behind
# her. At the HOTEL's door (Compote the doorman) Sadi steps out in red, with a pup at her side: a tiny Saxo in the very
# same leather jacket and bow tie. Through the chorus Saxo denies it with every move... and the pup copies every move,
# in sync (the "twin" duo trend: dressed alike, the same dance side by side): the head shake, the moonwalk, the spin.
# He runs for the hotel; the doorman shakes her head. On the last word, side by side in the same pose, Kob's flash goes
# off and the frame freezes into her instant photo: the evidence. The music stops dead. Structure: denial (new).
# Beats count from B0 = 0.000 s at 116.96 BPM (cut time = b * 60/116.96 s; a bar = 4 beats = 2.052 s): the cut is
# 28.936-107.927 s of the song (episodes/2026-09-28-3.config.js), then 0.61 s of silence; the video ends at 79.60 s
# (b155.17). Lyric lines are named K00-K17 (episodes/2026-09-28-3.lyrics.js; the lyrics stay in their files): verse 1
# K00-K04 (b0.6-42), a break b42-48, verse 1b K05-K07 (b48-74.5), a break b74.5-79, the pre-chorus K08-K12 (b79-112),
# chorus 1 K13-K17 (b112.5-154.6); the music stops dead on b154.
# Action words (whitelisted, kit beats): K00 movie b6.2 scene b7.0; K02/K04/K07 dance b19.6/35.9/67.6, floor
# b21.6/37.7/69.6, round b23.9/39.9/71.8; K05 scene b55.2; K06 head b56.9, eyes b59.4; K08 people b79.1, careful b84.1;
# K09 around b88.5, hearts b91.4; K11 mother b96.0, careful b100.1; K12 careful b104.0, lie b108.2, truth b110.3; K13
# lover b117.5; K14 girl b122.2; K15 kid b132.4, son b135.6; K17 kid b148.2, son b151.7.
import json, math, os, sys
sys.path.insert(0, os.path.dirname(__file__))
from cam import view, low, deadpan, orbit, reveal

P = 60 / 116.96
T = lambda b: round(b * P, 3)                      # beat -> cut seconds
S = lambda b: round(b * P, 3)                      # beats -> seconds into a shot
END = 79.60
LOOK = {'saxo': 'billie', 'sadi': 'glam', 'kob': 'detective', 'compote': 'bouncer'}
# ---- the street (src/maps16.js NOIR): the sidewalk's squares have their centres on whole metres, rows z -3..1 ----
STAGE = (0.0, -1.0)            # Saxo's square in the middle of the block, the film posters behind him
SPOT2 = (2.0, -1.0)            # where he moonwalks to (the second dance)
POLE = (-3.4, 1.05)            # the lamp post on the curb (a 12 cm pole)
KOB_POLE = (-3.55, 0.45)       # Kob "hidden" behind it: the pole crosses the right of her face
KOB_CURB = (-2.2, 0.9)         # Kob on the curb row, closer, for the flash
DOOR = (5.6, -3.5)             # the HOTEL's door (the facade at z -3.5)
SADI_DOOR = (5.05, -2.75)      # Sadi stepped out of the door
PUP_DOOR = (5.95, -2.55)       # the pup at her side
COMP_DOOR = (6.75, -2.95)      # Compote, the doorman, right of the door
HEAD = {'saxo': 1.3, 'sadi': 1.2, 'kob': 1.3, 'compote': 1.28}   # the top of each head (hats, ears) standing
FACE = {'saxo': 0.95, 'sadi': 0.88, 'kob': 0.9, 'compote': 0.9}
PUP_S = 0.45                   # the pup: a crowd of one small copy of Saxo in his own look (a character has one rig)


def A(who, clip, x, z, **o):
    return {'who': who, 'look': o.pop('look', LOOK[who]), 'clip': clip, 'x': round(x, 3), 'z': round(z, 3), 'face': 'world',
            'yaw': o.pop('yaw', 0), 'at': o.pop('at', 'auto'), **o}
def yaw_to(a, b): return round(math.degrees(math.atan2(b[0] - a[0], b[1] - a[1])), 1)
def pup(x, z, clip, at, speed=1.0, yaw=0, **o):   # the tiny double: same clip, offset, speed and yaw as Saxo = in sync
    return {'who': 'saxo', 'look': 'billie', 'clip': clip, 'n': 1, 'cols': 1, 'jitter': 0, 'scale': PUP_S, 'x0': round(x, 3), 'z0': round(z, 3),
            'face': 'world', 'yaw': yaw, 'at': at, 'speed': speed, **o}
KOBCAM = dict(hold='camera', arm='R', aim=[0.75, 0.55, 0.35], upAt=0.0)   # the camera held up beside her head (in front of her face it vanishes into the chibi head)
KOBLOW = dict(hold='camera')                                                # the camera down at her side
KOBCAM_L = dict(holdL='camera', arm='L', aim=[0.75, 0.55, 0.35], upAt=0.0)  # the same in her left paw (on the lens side when she faces west)
KOBCHEST = dict(hold='camera', arm='R', aim=[0.25, 0.05, 0.62], upAt=0.0)  # the camera held out at her chest, lens to the lens
def side(at, yaw, d):   # a point d m to the right of a mark facing yaw (deg): the right hand of someone facing east is south
    a = math.radians(yaw); return (at[0] - math.cos(a) * d, at[1] + math.sin(a) * d)

# ---- a projection check (numbers only): where each face lands in the 9:16 frame at the shot's start and end ----
def _proj(cam, look, fov, pt):
    f = [look[i] - cam[i] for i in range(3)]; n = math.sqrt(sum(v * v for v in f)); f = [v / n for v in f]
    r = [-f[2], 0.0, f[0]]; rn = math.sqrt(r[0] ** 2 + r[2] ** 2) or 1; r = [r[0] / rn, 0.0, r[2] / rn]   # screen right = forward x up
    u = [r[1] * f[2] - r[2] * f[1], r[2] * f[0] - r[0] * f[2], r[0] * f[1] - r[1] * f[0]]
    d = [pt[i] - cam[i] for i in range(3)]; z = sum(a * b for a, b in zip(d, f))
    if z <= 0.05: return None
    tv = math.tan(math.radians(fov) / 2); th = tv * 9 / 16
    return (0.5 + sum(a * b for a, b in zip(d, r)) / z / th / 2, 0.5 - sum(a * b for a, b in zip(d, u)) / z / tv / 2)
WARN = []
def check(beat, cams, look, fov, actors, crowd, line):
    for k, cam in enumerate(cams):
        end = k == len(cams) - 1
        for a in actors:
            if a.get('fg'): continue
            x, z = a['x'] + a.get('mx', 0) * end, a['z'] + a.get('mz', 0) * end
            top, face = _proj(cam, look, fov, (x, HEAD[a['who']] + a.get('lift', 0), z)), _proj(cam, look, fov, (x, FACE[a['who']] + a.get('lift', 0), z))
            if not top or not face: WARN.append(f'b{beat}: {a["who"]} behind the lens'); continue
            if line and top[1] < 0.26: WARN.append(f'b{beat}: {a["who"]} head top at {top[1]:.2f} (lyric rows)')
            if face[0] < 0.07 or face[0] > 0.93: WARN.append(f'b{beat}: {a["who"]} face x {face[0]:.2f} (edge)')
            if face[1] > 0.8: WARN.append(f'b{beat}: {a["who"]} face y {face[1]:.2f} (low)')
        for c in crowd:
            face = _proj(cam, look, fov, (c['x0'] + c.get('mx', 0) * end, FACE['saxo'] * PUP_S, c['z0'] + c.get('mz', 0) * end))
            if not face or face[0] < 0.06 or face[0] > 0.94 or face[1] > 0.88: WARN.append(f'b{beat}: the pup off frame {face}')

LINES = [(0.64, 7.68), (7.88, 17.93), (18.13, 26.78), (27.6, 34.23), (34.43, 42.03), (48.27, 55.75), (55.95, 65.3), (65.5, 74.48), (79.14, 86.78), (86.98, 92.05),
         (92.48, 94.13), (94.93, 102.13), (102.32, 112.32), (112.52, 119.77), (119.96, 129.81), (131.07, 137.64), (139.3, 146.57), (147.17, 154.56)]
def has_line(b0, b1): return any(a < b1 and b > b0 for a, b in LINES)

def clear_for(lenses, look, marks):
    """no pet on a lens, along its line of sight, or on a mark"""
    out = []
    for p in lenses:
        out.append([round(p[0], 2), round(p[2], 2), 0.9])
        for k in range(1, 8):
            u = k / 8
            out.append([round(p[0] + (look[0] - p[0]) * u, 2), round(p[2] + (look[1] - p[2]) * u, 2), 0.7])
    return out + [[round(m[0], 2), round(m[1], 2), 0.85] for m in marks]
shots = []
def add(beat, actors, lyric, v, lenses, crowd=None, **o):
    c, focus = v
    extra = o.pop('clear', [])
    cr = [crowd] if isinstance(crowd, dict) else (crowd or [])
    s = {'beat': beat, 'kind': 'dance', 'map': 'noir', 'actors': actors, 'lyric': lyric, 'cam': c, 'focus': focus,
         'clear': clear_for(lenses, focus, [(a['x'], a['z']) for a in actors] + [(q['x0'], q['z0']) for q in cr]) + extra, **o}
    if cr: s['crowd'] = cr if len(cr) > 1 else cr[0]
    s['_check'] = (lenses, c, focus, cr)
    shots.append(s)

# ================= verse 1 (K00-K04, b0-48): the tail, the lit squares, the thin lamp post =================
# the hook (the critic, 16/25: the grey street wide scored 2 for the hook): open on the evidence, the ending's instant
# photo of the two of them in the same pose, in black and white, already developed; the flash cuts into the street,
# and the loop lands back on the same photo
POSE_AT = 0.9
add(0, [A('saxo', 'female_hip_hop_body_wave_dancing', 3.3, -1.0, at=POSE_AT, speed=0.5, holdAt=0.0)],
    "HOOK, K00: cold open on the evidence: the private eye's instant photo, in black and white: big Saxo and a tiny Saxo in the same leather jacket and bow tie, in the same pose",
    view((3.8, 0.9, 2.1), (3.8, 0.75, -1.0), 54), [(3.8, 0.9, 2.1)], crowd=pup(4.3, -0.8, 'female_hip_hop_body_wave_dancing', POSE_AT, speed=0.5, holdAt=0.0),
    mono=True, photo=-1.0, stop=0.0, still=True, lit=[[3, -1], [4, -1]], stars=['saxo'])
# then the film noir from the start: the flash, and over the private eye's shoulder Saxo struts towards us down the sidewalk
KOB1 = (-3.0, -0.6)
p0, p1 = (-4.6, 1.3, 0.5), (-4.45, 1.29, 0.45)
add(2, [A('kob', 'bored_idle', *KOB1, yaw=yaw_to(KOB1, (1.5, -1.0)), at=0.5, speed=0.4, fg=True, **KOBCAM),
        A('saxo', 'happy_walk', 1.4, -1.0, yaw=-90, at=0.3, speed=2.6, mx=-1.0)],
    "K00: the flash, and the film noir from the start, in black and white: over the private eye's shoulder (Kob in her trench and fedora, her camera up), Saxo struts down the night sidewalk towards us, each square lighting up under his step",
    view(p0, (0.6, 0.85, -1.0), 56, p1=p1), [p0, p1], mono=True, flashAt=[0.0], trail=[[1.4, -1.0, 0.4, -1.0, 0.0, S(2)]], stars=['saxo'])
# on "movie scene" the colour floods in: low on the squares, he lands on his square and the film goes to colour
p0, p1 = (0.7, 0.22, 1.7), (0.5, 0.22, 1.2)
add(4, [A('saxo', 'step_hip_hop_dance', *STAGE, at=0.0)],
    "K00 ('movie scene' b6.2-7.0): low on the squares, Saxo steps onto his square and it lights up; on 'scene' the black and white floods into colour (the 1983 look: black leather jacket, pink shirt, red bow tie)",
    low(p0, (0.0, 0.75, -1.0), p1, fov=62, roll=(-9, -5)), [p0, p1], mono=[S(6.2 - 4), S(7.0 - 4)], lit=[list(STAGE)], glowAt=list(STAGE), stars=['saxo'])
v = orbit(STAGE, 2.6, 0.45, -30, 25, 0.82, fov=62)
add(8, [A('saxo', 'charleston', *STAGE, at=0.0)],
    "K01: he dances on his lit square, a low handheld orbit, the pets in coats along the shop fronts bobbing to it",
    v, [(STAGE[0] + 2.6 * math.sin(math.radians(a)), 0.45, STAGE[1] + 2.6 * math.cos(math.radians(a))) for a in (-30, 0, 25)], gather=[0.0, -1.2, 2.1, 115, 245], lit=[list(STAGE)], glowAt=list(STAGE), stars=['saxo'])
v = deadpan(KOB_POLE, 0.95, 3.1, cam_y=1.0, fov=40)
add(12, [A('kob', 'bored_idle', *KOB_POLE, yaw=0, at=0.5, speed=0.4, **KOBCAM)],
    "K01 (deadpan): the private eye 'hidden' behind the lamp post: a 12 cm pole in front of a big cat in a trench coat, her camera up, staring at the lens",
    v, [(KOB_POLE[0], 1.0, KOB_POLE[1] + 3.1)], stars=['kob'])
p0, p1 = (2.4, 0.4, 1.4), (2.1, 0.4, 1.1)
add(16, [A('saxo', 'male_front_snap_kick_with_the_lead_foot', *STAGE, yaw=35, at=0.0)],
    "K02 ('dance' b19.6): the dance: a snap kick on his square, low from the side, the diner's glow beyond",
    low(p0, (0.0, 0.78, -1.2), p1, fov=62, roll=(8, 5)), [p0, p1], lit=[list(STAGE)], glowAt=list(STAGE), stars=['saxo'])
p0, p1 = (0.9, 2.9, 2.3), (0.7, 2.7, 2.0)
add(20, [A('saxo', 'hip_hop_dancing_side_to_side', *STAGE, at=2.0)],
    "K02 ('floor' b21.6): from above: on 'floor' the whole sidewalk round him lights up, squares flickering on the beat",
    view(p0, (0.0, 0.45, -1.0), 58, p1=p1), [p0, p1], floor=[STAGE[0], STAGE[1], 2.4], lit=[list(STAGE)], stars=['saxo'])
p0, p1 = (0.0, 3.4, 2.4), (0.0, 3.2, 2.1)
add(24, [A('saxo', 'charleston', *STAGE, at=0.9)],
    "K02 ('round' b23.9): on 'round' a ring of lit squares runs out round him as he dances; the lens pulls back and up",
    view(p0, (0.0, 0.4, -1.0), 60, p1=p1), [p0, p1], ring=[STAGE[0], STAGE[1], 0.0, 0.8, 0.9], lit=[list(STAGE)], stars=['saxo'])
p0 = (-4.3, 1.25, 1.3)
add(28, [A('saxo', 'hip_hop_dancing_side_to_side', *STAGE, at=2.0), A('kob', 'bored_idle', *KOB_POLE, yaw=yaw_to(KOB_POLE, STAGE), at=0.5, speed=0.4, fg=True, **KOBCAM)],
    "K03: behind the lamp post, over the private eye's shoulder (her fedora and camera at the edge, the pole at the lens): down the sidewalk Saxo dances on his lit square, the HOTEL's red sign above",
    view(p0, (0.0, 0.85, -1.0), 56), [p0], lit=[list(STAGE)], stars=['saxo'])
p0 = (1.0, 1.2, 3.4)
add(32, [A('saxo', 'moonwalk', *STAGE, at=1.0, speed=0.95, mx=SPOT2[0] - STAGE[0])],
    "K04: the moonwalk: in profile he glides backwards along the sidewalk, the squares lighting up under his sliding feet",
    view(p0, (1.0, 0.7, -1.0), 60), [p0], trail=[[STAGE[0], STAGE[1], SPOT2[0], SPOT2[1], 0.0, S(4)]], stars=['saxo'])
p0, p1 = (0.2, 0.9, 0.9), (0.5, 0.9, 0.7)
add(36, [A('saxo', 'hip_hop_dancing_side_to_side', *SPOT2, at=1.5)],
    "K04 ('floor' b37.7): on 'floor' the squares round him flicker again: a low three-quarter, the HOTEL's red neon beyond",
    view(p0, (SPOT2[0], 0.9, SPOT2[1]), 60, p1=p1, roll=[6, 4]), [p0, p1], floor=[SPOT2[0], SPOT2[1], 2.2], lit=[list(SPOT2)], glowAt=list(SPOT2), stars=['saxo'])
p0, p1 = (2.0, 3.3, 3.0), (2.0, 3.1, 2.7)
add(40, [A('saxo', 'gangnam', *SPOT2, at=0.5)],
    "K04 ('round' b39.9): in the round: the pets of the block stand in a circle round him, cheering, the ring of light under them, while he dances in the middle",
    view(p0, (SPOT2[0], 0.4, SPOT2[1]), 60, p1=p1), [p0, p1], gather=[SPOT2[0], SPOT2[1] - 0.1, 1.9, 20, 340], cheer=True, ring=[SPOT2[0], SPOT2[1], 0.0, 1.5, 0.3], lit=[list(SPOT2)], stars=['saxo'])
KY = yaw_to(KOB_POLE, SPOT2)
L12 = side(KOB_POLE, KY, 0.3)
v = deadpan(L12, 1.0, 2.8, cam_y=1.05, ang=KY, fov=48)
add(44, [A('kob', 'bored_idle', *KOB_POLE, yaw=KY, at=0.5, speed=0.4, **KOBCAM)],
    "the break (b42-48): Kob raises her camera at him, deadpan",
    v, [(L12[0] + 2.8 * math.sin(math.radians(KY)), 1.05, L12[1] + 2.8 * math.cos(math.radians(KY)))], stars=['kob'])

# ================= verse 1b (K05-K07, b48-79): the photo he's never in =================
KY2 = yaw_to(KOB_CURB, SPOT2)
p0 = (-3.6, 1.35, 2.4)
add(48, [A('kob', 'bored_idle', *KOB_CURB, yaw=KY2, at=0.5, speed=0.4, fg=True, **KOBCAM)],
    "K05: her flash goes off (on the downbeat)... and he's gone: over her shoulder, only his square is still lit, nobody on it",
    view(p0, (SPOT2[0], 0.6, SPOT2[1]), 54), [p0], flashAt=[0.0], lit=[list(SPOT2)], stars=['kob'])
KOB3 = (-1.6, 0.5)
p0, p1 = (-1.3, 1.1, 4.0), (-1.3, 1.1, 3.3)
add(52, [A('kob', 'bored_idle', -1.65, 0.5, yaw=0, at=0.5, speed=0.4, **KOBCHEST),
         A('saxo', 'female_hip_hop_raise_the_roof_dancing', -0.55, -0.9, yaw=-10, at=0.0)],
    "K05-K06 ('scene' b55.2, 'head' b56.9, 'eyes' b59.4): the private eye, deadpan, her camera held out in front of her: he isn't in the picture. Right behind her on a lit square, there he is, raising the roof; she never turns round (a slow push in)",
    view(p0, (-1.3, 0.95, -0.4), 56, p1=p1, ease='lin'), [p0, p1], lit=[[-1, -1]], stars=['kob', 'saxo'])
p0, p1 = (-2.4, 1.1, 3.3), (-2.35, 1.1, 3.05)
add(60, [A('kob', 'bored_idle', *KOB3, yaw=-90, at=0.5, speed=0.4, **KOBCAM_L), A('saxo', 'moonwalk', -0.2, -2.0, at=1.0, speed=0.95, mx=0.8)],
    "K06: Kob, camera up, scans the street the wrong way; behind her back he moonwalks off in the other direction, the squares lighting up under him",
    view(p0, (-1.0, 0.9, -1.2), 56, p1=p1), [p0, p1], trail=[[-0.2, -2.0, 0.6, -2.0, 0.0, S(4)]], stars=['kob', 'saxo'])
p0, p1 = (-1.4, 0.35, 1.3), (-1.1, 0.35, 1.0)
add(64, [A('saxo', 'gangnam', 1.0, -1.0, yaw=-30, at=1.0)],
    "K07 ('dance' b67.6): he dances on, the horse-riding stance, a low push from the west, the HOTEL down the street beyond",
    low(p0, (1.0, 0.78, -1.0), p1, fov=62, roll=(-8, -5)), [p0, p1], lit=[[1, -1]], glowAt=[1, -1], stars=['saxo'])
p0, p1 = (1.9, 3.1, 2.0), (1.6, 2.9, 1.6)
add(68, [A('saxo', 'northern_soul_spin', 1.0, -1.0, at=round(2.0 - S(71.8 - 68), 3))],
    "K07 ('floor' b69.6, 'round' b71.8): from above, the whole block's squares flicker on 'floor' and the ring runs out on 'round' as he spins",
    view(p0, (1.0, 0.45, -1.0), 58, p1=p1), [p0, p1], floor=[1.0, -1.0, 2.6], ring=[1.0, -1.0, S(71.8 - 68), 0.7, 2.2], lit=[[1, -1]], stars=['saxo'])
p0 = (2.6, 0.5, 2.2)
add(72, [A('saxo', 'gangnam', 1.0, -1.0, yaw=-15, at=1.0)],
    "the break (b74.5): the pets in coats have gathered along the shop fronts to watch him; he drops into the horse stance for them (fallback after 3 loops: the proven gathered-crowd framing, no cheer)",
    view(p0, (0.6, 0.85, -1.6), 60), [p0], gather=[1.0, -1.3, 2.1, 105, 255], lit=[[1, -1]], stars=['saxo'])
p0, p1 = (-0.8, 0.55, 0.6), (-0.4, 0.55, 0.4)
add(76, [A('saxo', 'happy_walk', 1.2, -1.0, yaw=90, at=0.3, speed=2.6, mx=1.5)],
    "the break: he struts east towards the HOTEL, the squares lighting up under him",
    view(p0, (3.5, 0.9, -1.8), 60, p1=p1, roll=[5, 3]), [p0, p1], trail=[[1.2, -1.0, 2.7, -1.0, 0.0, S(3)]], stars=['saxo'])

# ================= pre-chorus (K08-K12, b79-112): the claim =================
GATHER = [3.3, -1.3, 2.2, 100, 260]   # the pets of the block on an arc behind him
p0, p1 = (3.3, 1.3, 3.4), (3.3, 1.25, 2.9)
add(79, [A('saxo', 'happy_walk', 2.7, -1.0, yaw=90, at=0.3, speed=2.2, mx=0.6)],
    "K08 ('people' b79.1): the people on the block have gathered on the sidewalk behind him, every head turned to him",
    view(p0, (3.3, 0.95, -1.6), 60, p1=p1), [p0, p1], gather=GATHER, stare=[3.3, -1.0], trail=[[2.7, -1.0, 3.3, -1.0, 0.0, S(5)]], stars=['saxo'])
p0, p1 = (4.6, 0.3, 0.8), (4.4, 0.3, 0.5)
add(84, [A('saxo', 'charleston', 3.3, -1.0, yaw=20, at=0.1)],
    "K08 ('careful' b84.1): pleased with himself, he kicks out a charleston for the staring crowd, low and pushing in",
    view(p0, (3.3, 0.85, -1.0), 58, p1=p1, roll=[-6, -4]), [p0, p1], gather=GATHER, stare=[3.3, -1.0], lit=[[3, -1]], stars=['saxo'])
p0 = (3.3, 1.25, 3.0)
add(88, [A('saxo', 'hip_hop_dancing_side_to_side', 3.3, -1.0, at=1.0)],
    "K09 ('around' b88.5, 'hearts' b91.4): the crowd round him swoons: on 'hearts' big pink hearts pop over every head",
    view(p0, (3.3, 1.2, -1.6), 60), [p0], gather=GATHER, stare=[3.3, -1.0], hearts=S(91.4 - 88), lit=[[3, -1]], stars=['saxo'])
v = deadpan(COMP_DOOR, 0.92, 2.5, cam_y=1.0, ang=-15, fov=42)
add(92, [A('compote', 'bored_idle', *COMP_DOOR, yaw=-15, at=0.5, speed=0.4)],
    "K10 (deadpan): the doorman at the HOTEL, in her black suit, shades pushed up, arms at her sides, unimpressed",
    v, [(COMP_DOOR[0] + 2.5 * math.sin(math.radians(-15)), 1.0, COMP_DOOR[1] + 2.5 * math.cos(math.radians(-15)))], stars=['compote'])
p0, p1 = (5.8, 1.1, 2.4), (5.8, 1.05, 2.0)
add(96, [A('sadi', 'bored_idle', *SADI_DOOR, yaw=15, at=0.5, speed=0.4, mz=0.3), A('compote', 'bored_idle', *COMP_DOOR, yaw=-25, at=0.5, speed=0.4)],
    "K11 ('mother' b96.0): the HOTEL's door opens: Sadi steps out in a red sequin dress, and at her side a pup: a tiny Saxo in the very same leather jacket and bow tie",
    view(p0, (5.8, 0.8, -2.7), 56, p1=p1), [p0, p1], crowd=pup(*PUP_DOOR, 'bored_idle', 0.5, speed=0.4, yaw=-15, mz=0.3), stars=['sadi'])
p0, p1 = (3.3, 1.0, 1.5), (3.3, 1.0, 1.0)
add(100, [A('saxo', 'being_surprised_and_looking_right', 3.3, -1.0, yaw=60, at=0.2, speed=0.8)],
    "K11 ('careful' b100.1): his face, pushing in: caught",
    view(p0, (3.3, 0.95, -1.0), 48, p1=p1), [p0, p1], lit=[[3, -1]], stars=['saxo'])
p0 = (3.95, 0.7, 2.3)
add(104, [A('saxo', 'gangnam', 3.4, -1.0, yaw=90, at=0.5)],
    "K12 ('careful' b104.0): face to face in profile, the big one and the tiny one: he drops into the horse stance at the pup... and the pup drops into the very same stance right back",
    view(p0, (3.95, 0.7, -1.0), 56), [p0], crowd=pup(4.5, -1.0, 'gangnam', 0.5, yaw=-90), lit=[[3, -1], [4, -1]], stars=['saxo'])
p0, p1 = (3.75, 0.95, 2.6), (3.75, 0.95, 2.3)
add(108, [A('saxo', 'shaking_head_no_dismissively', 3.3, -1.0, yaw=0, at=0.1)],
    "K12 ('lie' b108.2, 'truth' b110.3): he turns to us shaking his head, not his; beside him the pup shakes his head exactly the same way; on 'truth' a flash goes off",
    view(p0, (3.75, 0.78, -1.0), 54, p1=p1), [p0, p1], crowd=pup(4.35, -0.8, 'shaking_head_no_dismissively', 0.1), flashAt=[S(110.3 - 108)], lit=[[3, -1], [4, -1]], stars=['saxo'])

# ================= chorus 1 (K13-K17, b112-154): the denial, in sync =================
p0 = (2.4, 1.3, 2.3)
add(112, [A('saxo', 'shaking_head_no_dismissively', 3.3, -1.0, yaw=-20, at=1.0), A('sadi', 'bored_idle', *SADI_DOOR, yaw=-40, at=0.5, speed=0.4)],
    "K13: the chorus: he tells her no, and beside him the pup says no too, the same head shake, Sadi in red at the door behind them",
    view(p0, (4.1, 0.85, -1.9), 58), [p0], crowd=pup(4.2, -1.0, 'shaking_head_no_dismissively', 1.0, yaw=-20), lit=[[3, -1], [4, -1]], stars=['saxo', 'sadi'])
v = deadpan(SADI_DOOR, 0.9, 2.3, cam_y=0.98, ang=-35, fov=42)
add(116, [A('sadi', 'bored_idle', *SADI_DOOR, yaw=-35, at=0.5, speed=0.4)],
    "K13 ('lover' b117.5): Sadi, deadpan, one eyebrow: sure",
    v, [(SADI_DOOR[0] + 2.3 * math.sin(math.radians(-35)), 0.98, SADI_DOOR[1] + 2.3 * math.cos(math.radians(-35)))], stars=['sadi'])
p0 = (0.2, 0.4, 1.3)
add(120, [A('saxo', 'moonwalk', 2.1, -1.0, at=1.0, speed=0.95, mx=1.0)],
    "K14 ('girl' b122.2): the twins: he moonwalks away from it all... and right beside him the pup moonwalks too, in sync, the same outfit, the squares lighting up under both",
    view(p0, (3.2, 0.62, -1.1), 60, roll=[-5, -3]), [p0], crowd=pup(2.9, -0.4, 'moonwalk', 1.0, speed=0.95, mx=1.0),
    trail=[[2.1, -1.0, 3.1, -1.0, 0.0, S(4)], [2.9, -0.4, 3.9, -0.4, 0.0, S(4)]], stars=['saxo'])
KOB4 = (4.4, -2.7)
KY4 = yaw_to(KOB4, (3.2, -0.9))
L32 = side(KOB4, KY4, 0.25)
v = deadpan(L32, 1.0, 3.0, cam_y=1.05, ang=KY4, fov=60)
add(124, [A('kob', 'bored_idle', *KOB4, yaw=KY4, at=0.5, speed=0.4, **KOBCAM)],
    "K14: by the HOTEL's door the private eye, deadpan, fires her flash on every beat: the evidence",
    v, [(L32[0] + 3.0 * math.sin(math.radians(KY4)), 1.05, L32[1] + 3.0 * math.cos(math.radians(KY4)))], flash=True, stars=['kob'])
v = orbit((3.8, -1.0), 2.9, 0.4, -35, 20, 0.7, fov=62)
add(128, [A('saxo', 'northern_soul_spin', 3.4, -1.0, at=1.0)],
    "K14: he spins to lose him; the pup spins with him, the same spin, the same moment",
    v, [(3.8 + 2.9 * math.sin(math.radians(a)), 0.4, -1.0 + 2.9 * math.cos(math.radians(a))) for a in (-35, 0, 20)], crowd=pup(4.3, -0.9, 'northern_soul_spin', 1.0),
    lit=[[3, -1], [4, -1]], stars=['saxo'])
p0 = (2.9, 0.6, 1.9)
add(132, [A('saxo', 'gangnam', 3.3, -1.0, yaw=0, at=1.0)],
    "K15 ('kid' b132.4, 'son' b135.6): the twins, square on from the front left: he drops into the horse stance... and right beside him the pup drops into the very same stance (fallback after 3 loops: the proven frontal twin framing)",
    view(p0, (3.75, 0.7, -0.9), 58), [p0], crowd=pup(4.2, -0.8, 'gangnam', 1.0), lit=[[3, -1], [4, -1]], stars=['saxo'])
p0, p1 = (6.3, 1.3, 1.4), (6.2, 1.3, 1.15)
add(136, [A('saxo', 'happy_walk', 4.9, -1.4, yaw=170, at=0.3, speed=2.4, mx=0.1, mz=-0.6), A('compote', 'shaking_head_no_dismissively', 5.6, -3.0, yaw=0, at=0.2)],
    "K16 (lead-in): he makes a run for the HOTEL; in the doorway, square to him, the doorman shakes her head: not tonight",
    view(p0, (5.2, 0.95, -2.4), 58, p1=p1), [p0, p1], stars=['compote'])
p0 = (3.6, 1.0, 4.4)
add(140, [A('saxo', 'hip_hop_dancing_side_to_side', 3.3, -1.0, at=0.5), A('sadi', 'bored_idle', *SADI_DOOR, yaw=-30, at=0.5, speed=0.4),
          A('compote', 'bored_idle', 5.6, -3.0, yaw=-20, at=0.5, speed=0.4), A('kob', 'bored_idle', 1.9, -2.6, yaw=110, at=0.5, speed=0.4, **KOBCAM)],
    "K16: the whole block: Sadi and the doorman at the HOTEL, the private eye with her camera by the wall; in the middle, the two of them dancing the same dance",
    view(p0, (3.6, 1.1, -1.4), 64), [p0], crowd=pup(4.2, -0.8, 'hip_hop_dancing_side_to_side', 0.5), noguests=True, lit=[[3, -1], [4, -1]], stars=['saxo'])
p0, p1 = (3.7, 0.22, 2.3), (3.7, 0.22, 1.8)
add(144, [A('saxo', 'step_hip_hop_dance', 3.3, -1.0, at=0.0)],
    "K16-K17: the twin dance, low and square on: the big one and the tiny one, the same steps on their lit squares",
    low(p0, (3.7, 0.7, -1.0), p1, fov=62, roll=(-8, -5)), [p0, p1], crowd=pup(4.3, -0.8, 'step_hip_hop_dance', 0.0), lit=[[3, -1], [4, -1]], stars=['saxo'])
p0, p1 = (3.8, 0.9, 2.4), (3.8, 0.9, 2.1)
add(148, [A('saxo', 'female_hip_hop_body_wave_dancing', 3.3, -1.0, at=round(POSE_AT - S(4) * 0.5, 3), speed=0.5)],
    "K17 ('kid' b148.2): the pose: he strikes it, and so does the pup, the same pose, side by side",
    view(p0, (3.8, 0.75, -1.0), 54, p1=p1), [p0, p1], crowd=pup(4.3, -0.8, 'female_hip_hop_body_wave_dancing', round(POSE_AT - S(4) * 0.5, 3), speed=0.5), lit=[[3, -1], [4, -1]], stars=['saxo'])
add(152, [A('saxo', 'female_hip_hop_body_wave_dancing', 3.3, -1.0, at=POSE_AT, speed=0.5, holdAt=0.12)],
    "K17 ('son' b151.7) BUTTON: the flash, and the frame freezes into the private eye's instant photo, developing: the two of them in the same pose, side by side. The music stops dead on b154: silence",
    view((3.8, 0.9, 2.1), (3.8, 0.75, -1.0), 54), [(3.8, 0.9, 2.1)], crowd=pup(4.3, -0.8, 'female_hip_hop_body_wave_dancing', POSE_AT, speed=0.5, holdAt=0.12),
    flashAt=[0.0], photo=0.12, stop=0.12, still=True, lit=[[3, -1], [4, -1]], stars=['saxo'])

# ---- checks and the episode ----
for i, s in enumerate(shots):
    lenses, c, focus, cr = s.pop('_check')
    b1 = shots[i + 1]['beat'] if i + 1 < len(shots) else END / P
    look = (focus[0], c['look'][0], focus[1])
    check(s['beat'], [lenses[0], lenses[-1]], look, c['fov'], s['actors'], cr, has_line(s['beat'], b1))
clips = {a['clip'] for s in shots for a in s['actors']} | {q['clip'] for s in shots for q in ([s['crowd']] if isinstance(s.get('crowd'), dict) else s.get('crowd', []))}
BASE = {'tpose', 'gangnam', 'twist', 'macarena', 'silly_twist', 'chicken', 'twerk', 'ymca', 'robot', 'shopping_cart', 'running_man', 'moonwalk', 'shuffle', 'tut', 'booty_step', 'arm_wave', 'snake', 'shimmy', 'charleston', 'samba', 'belly', 'northern_soul_spin',
        'skate_push', 'skate_idle', 'uppercut_atk', 'uppercut_vic', 'slam_atk', 'slam_vic'}
ep = {
  'date': '2026-09-28', 'n': 3,
  'song': {'title': 'Billie Jean', 'artist': 'Michael Jackson', 'window': [28.936, 107.927], 'bpm': 116.96},
  'logline': "Saxo denies the kid is his in every move, while the kid, a tiny Saxo in the very same leather jacket and bow "
             "tie, copies every move beside him, until the private eye who has tailed him all night finally catches them "
             "in one photo, in the same pose.",
  'new': ['noir map (src/maps16.js, the 1983 clip\'s night street: a sidewalk of 1 m slabs that light up under steps, '
          'the camera shop, the diner under its green neon, film posters, the HOTEL with its red vertical neon and a '
          'canopy, a thin lamp post, a phone booth, a trash can, a hydrant, a newsstand, fire escapes, a purple dusk '
          'skyline across the street, pets in coats and hats; flags lit, trail, ring, floor, glowAt, stare, hearts, '
          'cheer, stop, clear)',
          'shot fields mono (black and white fading to colour), flashAt (camera flashes on cue) and photo (the frozen frame '
          'printed as an instant photo that develops), and the camera prop',
          'a tiny double of the lead as a crowd of one on the floor, in sync with him (same clip, offset, speed, yaw)',
          'costumes: Saxo billie (the 1983 leather look), Kob detective (trench and fedora), Sadi glam (red sequin dress)'],
  'notes': "The queue is empty: a chart song (Spotify global daily #21 and US #40 on 2026-09-27; its TikTok sound 856k "
           "videos), back with the 2026 biopic. The clip (studied from 1/3 s sheets): a stylised night street, the "
           "squares lighting up under his steps, a private eye in a trench coat and fedora tailing him with a camera (he "
           "never shows up in the photos), a camera shop window, a green neon shop sign, a lamp post, the HOTEL with a "
           "red vertical neon and a fire escape whose steps light up, a hotel room, the police taking the private eye "
           "away at the end; the singer in a black leather jacket over a pink shirt with a red bow tie. The song is a "
           "denial (a girl says the kid is his; he says it isn't). Whole cast: Saxo (the joke is on him: he denies it "
           "while his double copies him), Kob (the one who sees everything: the private eye, deadpan, whose photo finally "
           "catches him), Sadi (the reality check: she comes out with the pup and just looks), Compote (the doorman: she "
           "blocks his escape into the hotel, her bouncer thread). Kob wears a costume for once: it's a job. The pup is a "
           "crowd of one (a character has one rig), Saxo's own look at 0.45.",
  'with': ['sadi', 'kob', 'compote'],
  'clips': sorted(clips - BASE),
  'shots': shots,
  'yt': 'end',
  'tags': {'structure': 'denial', 'scenes': ['tiny double', 'photo'], 'cast': ['saxo', 'sadi', 'kob', 'compote'], 'hook': 'ref',   # the cold open is the payoff's photo (a flash-forward)
           
           'maps': ['noir'], 'ref': 'twin-trend',
           'lyric_literal': "K00 movie scene (black and white into colour), dance/floor/round three times (the squares light up, flicker, ring out), K09 hearts (hearts pop over the pets), K11 mother (Sadi and the pup at the door), K12 truth and K17 son (the camera's flash)",
           'experiment': "Does dramatic irony (the lead denies it in every shot while his tiny double copies his every move beside him, the song's own story) with a frozen-photo payoff hold viewers better than our gag plots, on a 1983 throwback back on the charts?"},
}
out = os.path.join(os.path.dirname(__file__), '2026-09-28-3.json')
json.dump(ep, open(out, 'w'), ensure_ascii=False, indent=1)
print(out, len(shots), 'shots', len(ep['clips']), 'clips:', ' '.join(ep['clips']))
for w in WARN: print('WARN', w)
