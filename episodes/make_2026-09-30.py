# make_2026-09-30.py: writes episodes/2026-09-30.json, "Ain't In LA" (ADÉLA, 2026; #5 on Spotify's global daily chart,
# ~600k TikTok videos on its sounds). The clip: a pink-haired girl in her childhood bedroom in a Slovak housing estate
# (trophies, posters), a HOLLYWOOD backdrop painted in the estate with folk dancers in front of it, car drifts, bikes,
# the grey prefab blocks.
# Ours, expectation vs reality (new structure: every glamour shot is followed by the pull-back that shows the truth):
# Saxo, the pop star in the singer's pink hair and varsity jacket, shoots his "LA" music video in the car park of his
# grey block of flats. The Hollywood hills behind him are HOLLYWOOD painted on a bedsheet pegged between two balconies;
# the palm is a potted plant; the Walk of Fame star is chalk on the tarmac; his convertible is a shopping trolley pushed
# by a furious Compote in a folk dress; Sadi films it all on her phone in a pink velour tracksuit. Then it rains. In his
# childhood bedroom (the trophies, the LA posters) the music goes through the thin panel wall into Kob's flat: she
# bangs on it and his HOLLYWOOD poster falls off. At dusk the estate's folk troupe (a dozen furious Compotes in folk
# dress) are his backup dancers; at night the chorus turns the car park into a party, the neighbours dancing on their
# balconies. Kob, in her housecoat and curlers on her balcony, watches her missing bedsheet all video; on the last "LA"
# she yanks it back: HOLLYWOOD shoots up into her balcony and the grey block stands there. Button (the silent beat):
# her sheet hangs folded on her own washing line, and she glares.
# Beats count from B0 = 0.000 s at 138.99 BPM (cut time = b * 60/138.99 s; a bar = 4 beats = 1.7267 s): the cut is
# 15.7497-84.8194 s of the song (bars 9-49) + one silent beat (episodes/2026-09-30.config.js); the video ends at 69.5 s
# (b161.0). Lyric rows K00-K15 (episodes/2026-09-30.lyrics.js; the lyrics stay in their files): the hook K00-K03
# (b0.8-32), verse 1 K04-K07 (b32-64), the pre-chorus K08-K11 (b65-93), the chorus K12-K15 (b93-160).
# Action words (whitelisted keywords, kit beats): 'up' b3.5 and b51.3, 'rain' b31.8, 'room' b35.3, 'mother' b47.0,
# 'wall' b59.2, 'live' b90.8, 'home' b92.5, 'tonight' b96.0, 'run' b103.2, 'LA' b119.9 and b152.0, 'ride' b129.9,
# 'know' b133.4, 'wanna' b135.5.
import json, math, os, re, sys
sys.path.insert(0, os.path.dirname(__file__))
from cam import view, swoop, low, deadpan, orbit, reveal

P = 60 / 138.99
S = lambda b: round(b * P, 3)
END = 69.5
LOOK = {'saxo': 'popstar', 'sadi': 'tracksuit', 'kob': 'housecoat', 'compote': 'folk'}
HEAD = {'saxo': 1.36, 'sadi': 1.25, 'kob': 1.36, 'compote': 1.38}   # the top of each head standing (ears, curlers, the flower crown)
FACE = {'saxo': 0.95, 'sadi': 0.88, 'kob': 0.9, 'compote': 0.9}
# ---- the estate (src/maps19.js ESTATE) ----
STAR = (0.0, -7.4)                          # the chalk star: the dance mark, the sheet 4.3 m behind it
KOB_B = (4.4, -12.2); KOB_Y = 5.9           # Kob on her balcony (floor 2 at 5.6, on a step: her face clears the balcony's front)
# ---- the panel flats (src/maps19.js PANEL) ----
BED_Y = 0.5; CHAIR = (2.1, -1.2)

def A(who, clip, x, z, **o):
    return {'who': who, 'look': o.pop('look', LOOK[who]), 'clip': clip, 'x': round(x, 3), 'z': round(z, 3), 'face': o.pop('face', 'camera'),
            'yaw': o.pop('yaw', 0), 'at': o.pop('at', 'auto'), **o}
def yaw_to(a, b): return round(math.degrees(math.atan2(b[0] - a[0], b[1] - a[1])), 1)
def kob_balcony(clip='bored_idle', **o):
    return A('kob', clip, *KOB_B, lift=KOB_Y, at=o.pop('at', 1.0), speed=o.pop('speed', 0.3), **o)
def troupe(clip='charleston', at=0.7, speed=1.0, **o):
    """the estate's folk troupe: a dozen furious Compotes in folk dress, two rows between the star and the sheet"""
    return {'who': 'compote', 'look': 'folk', 'clip': clip, 'at': at, 'speed': speed, 'n': 12, 'cols': 6, 'x0': 0.0, 'z0': -9.4, 'dx': 1.0, 'dz': 0.95,
            'jitter': 0.05, 'face': 'world', 'yaw': 0, **o}
def trolley_ride(who, pu, x, z, yaw, dist, **o):
    """a rider in the shopping trolley's basket, the pusher behind its handle, both moving dist m along yaw over the shot"""
    a = math.radians(yaw); fx, fz = math.sin(a), math.cos(a); mx, mz = round(fx * dist, 3), round(fz * dist, 3)
    r = A(who, 'male_driving_a_car', x, z, face='world', yaw=yaw, at=0.4, speed=0.05, lift=0.4, ride='trolley', mx=mx, mz=mz, **o.pop('rider', {}))
    p = A(pu, 'happy_run', x - fx * 0.98, z - fz * 0.98, face='world', yaw=yaw, at=0.2, speed=o.pop('pace', 0.75), mx=mx, mz=mz, arm='both', aim=[0.28, 0.2, 0.93], **o.pop('by', {}))
    return [r, p]

# ---- a projection check (numbers only): where each face lands in the 9:16 frame at the shot's start and end ----
def _proj(cam, look, fov, pt):
    f = [look[i] - cam[i] for i in range(3)]; n = math.sqrt(sum(v * v for v in f)); f = [v / n for v in f]
    r = [-f[2], 0.0, f[0]]; rn = math.sqrt(r[0] ** 2 + r[2] ** 2) or 1; r = [r[0] / rn, 0.0, r[2] / rn]
    u = [r[1] * f[2] - r[2] * f[1], r[2] * f[0] - r[0] * f[2], r[0] * f[1] - r[1] * f[0]]
    d = [pt[i] - cam[i] for i in range(3)]; z = sum(a * b for a, b in zip(d, f))
    if z <= 0.05: return None
    tv = math.tan(math.radians(fov) / 2); th = tv * 9 / 16
    return (0.5 + sum(a * b for a, b in zip(d, r)) / z / th / 2, 0.5 - sum(a * b for a, b in zip(d, u)) / z / tv / 2)
_src = open(os.path.join(os.path.dirname(__file__), '2026-09-30.lyrics.js')).read()
_rows = json.loads(re.search(r'window\.LYRICS = (.*?);\n', _src).group(1)); _ends = json.loads(re.search(r'window\.LINE_END = (.*?);\n', _src).group(1))
LINES = [(row[0][0] / P, e / P) for row, e in zip(_rows, _ends)]
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
def add(beat, b1, actors, lyric, v, map='estate', **o):
    c, focus = v
    o = {k: val for k, val in o.items() if val is not None}
    s = {'beat': beat, 'kind': 'dance', 'map': map, 'actors': actors, 'lyric': lyric, 'cam': c, 'focus': focus, **o}
    fy = focus[2] if len(focus) > 2 else 0
    look = (focus[0], c['look'][0] + fy, focus[1])
    check(beat, b1, L2(v), look, c['fov'], actors)
    shots.append(s)
DAY = {'zone': 'day'}; DUSK = {'zone': 'dusk'}; NIGHT = {'zone': 'night', 'balc': 'dance'}

# ================= the hook (b0-32): the "LA" music video, and the truth behind each shot =================
GLAM = [(0.9, 1.5, -3.4), (0.6, 1.1, -4.6), (0.3, 0.3, -5.3), (0.18, 0.24, -5.75)]   # the hook's swoop; the payoff comes back to its last lens
v = swoop(GLAM, (0.0, 1.0, STAR[1]), fov=40, roll=(0, -3, -10, -6))
add(0, 4, [A('saxo', 'gangnam', *STAR, at=1.1)],
    "HOOK (K00, 'up' b3.5): the glamour shot: low and tight on Saxo, the pop star in pink hair and a varsity jacket, dancing gangnam, nothing behind him but the Hollywood hills and the HOLLYWOOD letters",
    v, **DAY, stars=['saxo'])
v = reveal((0.3, 0.7, -5.6), (0.0, 1.8, -9.5), (0.8, 4.0, 0.9), fov=62, ly1=2.7)
add(4, 8, [A('saxo', 'gangnam', *STAR, at=2.8), A('sadi', 'happy_idle', 1.7, -6.6, face='world', yaw=yaw_to((1.7, -6.6), STAR), at=0.6, speed=0.2, hold='phone', arm='R', aim='phone', reveal=0.9)],
    "K00-K01 (the reality): pulling back and up: the hills are two bedsheets with HOLLYWOOD painted on them, pegged along the balconies of a grey prefab block; the palm is a potted plant; it's a car park; Sadi, in her pink tracksuit, films him on her phone",
    v, **DAY, stars=['saxo'])
v = view((0.35, 2.9, -3.5), (0.0, 0.35, -7.7), 60, p1=(0.33, 2.8, -3.75))
add(8, 12, [A('saxo', 'charleston', 0.0, -8.2, at=1.55, speed=0.15)],
    "K01 (b8.3): the Walk of Fame: he poses at his star... chalk on the tarmac, SAXO written in it by hand",
    v, **DAY, stars=['saxo'])
v = deadpan(KOB_B, KOB_Y + 0.8, 3.9, cam_y=KOB_Y + 0.75, fov=40, push=0.15, ang=-8)
add(12, 16, [kob_balcony(face='world', yaw=-8)],
    "K02 (deadpan): Kob up on her balcony, in her housecoat and pink curlers, the top corner of the painted sheet just below her railing, staring down at them",
    v, **DAY, stars=['kob'])
v = view((0.05, 1.75, -1.5), (0.0, 1.25, -3.7), 44, p1=(0.05, 1.72, -1.6))
add(16, 20, [A('saxo', 'male_driving_a_car', 0.0, -3.9, face='world', yaw=0, at=0.4, speed=0.05, lift=0.4, ride='trolley', mz=0.3)],
    "K02 (b16, the glamour): tight from the front and above: him cruising in his 'convertible', wind in his pink hair, one paw draped out, the Hollywood hills behind",
    v, **DAY, stars=['saxo'])
v = view((0.5, 1.5, 1.6), (0.5, 0.8, -3.4), 60, p1=(0.52, 1.5, 1.4))
add(20, 24, trolley_ride('saxo', 'compote', -0.4, -3.4, 90, 1.9, pace=0.9, by={'fg': True}),
    "K02-K03 (the reality): wide: the convertible is a shopping trolley, pushed across the car park by Compote in a folk dress, furious",
    v, **DAY, stars=['compote'])
SX, SD = (0.3, -7.2), (-0.6, -7.0)
v = low((-0.15, 0.3, -2.6), (-0.15, 0.85, -7.1), (-0.17, 0.3, -3.0), fov=50, roll=(8, 5))
add(24, 28, [A('saxo', 'shuffle', *SX, at=1.0), A('sadi', 'shuffle', *SD, at=1.0)],
    "K03 (b25.6): the duo in front of the Hollywood hills: Sadi has put the phone down to dance with him",
    v, **DAY, stars=['saxo', 'sadi'])
v = view((1.2, 0.6, -4.2), (0.0, 0.95, -7.2), 54, p1=(1.1, 0.6, -4.5))
add(28, 32, [A('saxo', 'gangnam', *SX, at=1.1), A('sadi', 'gangnam', *SD, at=1.1)],
    "K03 'rain' (b31.8): still dancing... and on the word the first raindrops hit",
    v, **DAY, rain=S(31.78 - 28), stars=['saxo', 'sadi'])

# ================= verse 1 (b32-64): the downpour, his childhood bedroom, and Kob next door =================
v = view((-3.0, 1.1, -7.2), (-6.4, 0.95, -12.2), 56, p1=(-3.2, 1.1, -7.6))
add(32, 36, [A('saxo', 'happy_run', -4.0, -9.0, face='world', yaw=yaw_to((-4.0, -9.0), (-7.2, -12.2)), at=0.2, speed=1.3, mx=-1.9, mz=-1.9), A('sadi', 'happy_run', -3.6, -8.4, face='world', yaw=yaw_to((-3.6, -8.4), (-7.0, -12.2)), at=0.5, speed=1.3, mx=-1.9, mz=-1.9)],
    "K04 (b32): the downpour: the pop star and Sadi run for the stairwell door, the lit number 12 over it",
    v, **DAY, rain=True, wet=True, stars=['saxo', 'sadi'])
SB = (-3.15, -0.35)
v = view((-1.0, 1.35, 2.6), (-2.85, 0.95, -1.1), 56, p1=(-1.1, 1.3, 2.3))
add(36, 40, [A('saxo', 'sitting_talking', *SB, at=0.0, speed=0.05, lift=BED_Y - 0.1)],
    "K04 'room' (b35.3): his childhood bedroom in the block: pink starry wallpaper, the LA poster, a trophy shelf; he sits on his bed, soaked, the rain streaming down the window",
    v, map='panel', rain=True, stars=['saxo'])
ST = (-0.7, -1.6)
v = view((-1.25, 1.15, 1.3), (-1.0, 1.2, -2.3), 52, p1=(-1.2, 1.15, 1.05))
add(40, 44, [A('saxo', 'female_hip_hop_arm_wave_dancing', *ST, at=0.9)],
    "K05 (b41.7): beside his trophy shelf (every dance contest he ever won as a kid), the music back on, dancing again",
    v, map='panel', rain=True, thump=True, stars=['saxo'])
v = deadpan(CHAIR, 0.74, 2.75, cam_y=0.8, fov=44, push=0.12)
add(44, 48, [A('kob', 'male_driving_a_car', *CHAIR, face='world', yaw=0, at=0.3, speed=0.05, hold='milk')],
    "K05 'mother' (b47.0, deadpan): next door, through the thin panel wall: Kob in her armchair in her curlers with her milk; the framed photo on the wall behind her hops on every beat",
    v, map='panel', thump=True, stars=['kob'])
SJ = (-3.15, -1.1)
v = view((-2.0, 0.55, 1.5), (-3.1, 1.35, -1.1), 62, p1=(-2.05, 0.55, 1.3))
add(48, 52, [A('saxo', 'happy_idle', *SJ, lift=BED_Y - 0.02, at=0.3, speed=0.6, hop=[0.32, 1], arm='both', aim='caramell', flapEvery=1, air=True)],
    "K06 'up' (b51.3): up he goes: jumping on his bed",
    v, map='panel', thump=True, rain=True, stars=['saxo'])
v = deadpan(CHAIR, 0.9, 2.9, cam_y=0.9, fov=30, push=0.1)
add(52, 56, [A('kob', 'male_driving_a_car', *CHAIR, face='world', yaw=0, at=0.3, speed=0.05, hold='milk')],
    "K06 (deadpan, closer): Kob glares; behind her head the photo hops off its nail on every beat",
    v, map='panel', thump=True, stars=['kob'])
KW = (1.3, -0.35)
v = view((2.3, 1.05, 1.6), (0.75, 1.05, -0.5), 54, p1=(2.2, 1.05, 1.4))
add(56, 60, [A('kob', 'happy_idle', *KW, face='world', yaw=-70, at=0.3, speed=0.3, hold='hook', hookTo=[0.03, 1.55, -0.55], arm='R', aim=[0.3, 0.5, 0.8])],
    "K07 'wall' (b59.2): the neighbour's classic: she bangs on the thin wall with a broom handle, on the word; everything on it jumps",
    v, map='panel', thump=True, bang=[S(59.23 - 56)], stars=['kob'])
v = view((-1.9, 1.2, 2.4), (-0.6, 1.1, -0.6), 56, p1=(-1.85, 1.2, 2.25))
add(60, 64, [A('saxo', 'being_surprised_and_looking_right', -1.2, -1.3, face='world', yaw=70, at=0.3, speed=0.8)],
    "K07 'child' (b62.7): on his side of the wall: the bang knocks his big HOLLYWOOD poster off it; it drops to the floor beside him",
    v, map='panel', posterFall=0.25, stars=['saxo', 'sadi'])

# ================= the pre-chorus (b64-96): dusk, the backup dancers, the dream =================
v = view((-5.2, 0.9, -7.2), (-6.9, 0.85, -10.6), 56, p1=(-5.3, 0.9, -7.5))
add(64, 68, [A('saxo', 'happy_run', -6.9, -11.7, face='world', yaw=15, at=0.2, speed=0.6, mx=0.5, mz=2.0),
             A('sadi', 'happy_run', -7.6, -11.9, face='world', yaw=15, at=0.5, speed=0.6, mx=0.5, mz=2.0, reveal=0.5)],
    "K08 (dusk): out of the stairwell door, dried off: the video's back on",
    v, **DUSK, stars=['saxo', 'sadi'])
v = low((0.5, 0.3, -5.6), (0.0, 0.8, -9.4), (0.45, 0.3, -6.0), fov=62, roll=(-8, -4))
add(68, 72, [A('compote', 'happy_idle', 0.0, -8.4, at=0.3, speed=0.2)],
    "K08-K09 (b68): his backup dancers: the estate's folk troupe, a dozen furious Compotes in folk dress lined up in front of the hills, the real one at the front glaring",
    v, **DUSK, crowd=troupe(clip='happy_idle', at=0.3, speed=0.2, skip=[[0.0, -9.4, 0.6]]), stars=['compote'])
v = view((0.4, 1.0, -3.9), (0.1, 0.95, -7.0), 54, p1=(0.38, 1.0, -4.15))
add(72, 76, [A('saxo', 'female_hip_hop_arm_wave_dancing', 0.1, -6.8, at=0.9), A('compote', 'happy_idle', 0.7, -8.4, at=0.3, speed=0.2)],
    "K09 (b71.6): the director shows them the move; behind him the troupe stares back, arms at their sides",
    v, **DUSK, crowd=troupe(clip='happy_idle', at=0.3, speed=0.2, skip=[[0.7, -9.4, 0.6]]), stars=['saxo'])
v = view((3.6, 2.6, -4.6), (0.0, 0.7, -9.0), 56, p1=(3.4, 2.5, -4.9))
add(76, 80, [A('compote', 'charleston', 0.0, -8.4, at=0.7)],
    "K09-K10 (b76): high from the side: the rehearsal: the whole troupe kicks in sync, Compote in front, furious and perfect",
    v, **DUSK, crowd=troupe(skip=[[0.0, -9.4, 0.6]]), stars=['compote'])
v = deadpan(KOB_B, KOB_Y + 0.8, 3.4, cam_y=KOB_Y + 0.7, fov=40, push=0.15, ang=28)
add(80, 84, [kob_balcony(hold='milk', face='world', yaw=28, arm='R', aim='toast')],
    "K10 (deadpan, dusk, from her other side): Kob raises her milk to the rehearsal below, deadpan",
    v, **DUSK, stars=['kob'])
v = low((-0.8, 0.25, -3.9), (0.0, 0.85, -7.35), (-0.72, 0.25, -4.4), fov=50, roll=(9, 6), hand=0.4)
add(84, 88, [A('saxo', 'twist', *STAR, at=0.6)],
    "K10-K11 (b84): low: the pop star alone on his star at dusk, dancing it for real",
    v, **DUSK, stars=['saxo'])
v = view((0.6, 0.6, -4.2), (0.0, 2.6, -11.0), 56, p1=(0.5, 0.75, -5.0), ease='lin')
add(88, 92, [A('saxo', 'happy_idle', 0.05, -7.2, face='world', yaw=180, at=0.2, speed=0.2, fg=True)],
    "K11 'live' (b90.8): from behind him, slow: he gazes up at the painted hills at dusk",
    v, **DUSK, stars=['saxo'])
v = view((6.5, 3.4, 3.0), (0.0, 3.2, -10.5), 60, p1=(6.2, 3.2, 2.5))
add(92, 96, [],
    "K11 'home' (b92.5) into the chorus: night falls on the estate: the whole block's windows lit, the floodlit sheet, the neighbours coming out on their balconies",
    v, zone='night', balc='watch', stars=['saxo'])

# ================= the chorus (b96-160): the party in the car park =================
v = view((-3.6, 2.6, -1.4), (0.0, 1.2, -8.6), 60, p1=(-3.3, 2.3, -2.0))
add(96, 100, [A('saxo', 'gangnam', *STAR, at=1.1), A('sadi', 'gangnam', -1.2, -6.9, at=1.1)],
    "K12 'tonight' (b96.0): the chorus hits: the car park is a party: the troupe kicking in front of the floodlit hills, the duo on the star, the neighbours dancing on every balcony",
    v, **NIGHT, crowd=troupe(), stars=['saxo', 'sadi'])
v = view((0.2, 2.0, -0.9), (0.2, 0.85, -4.6), 60, p1=(0.2, 1.95, -1.1))
add(100, 104, trolley_ride('saxo', 'compote', -0.7, -4.6, 90, 1.8, pace=1.1, rider={'arm': 'both', 'aim': 'caramell', 'flapEvery': 0.5}, by={'fg': True}),
    "K12 'run' (b103.2): side on, the trolley run: Compote pushes him flat out across the car park on 'run', his paws flapping by his ears",
    v, **NIGHT, crowd=troupe(), stars=['saxo'])
v = low((0.5, 0.3, -2.8), (0.0, 0.85, -7.3), (0.45, 0.3, -3.3), fov=56, roll=(-10, -6))
add(104, 108, [A('compote', 'charleston', 0.0, -8.4, at=0.7), A('saxo', 'charleston', *STAR, at=0.7)],
    "K12 (b104): low: the troupe's kicks behind him, Compote in front, Saxo kicking with them",
    v, **NIGHT, crowd=troupe(skip=[[0.0, -9.4, 0.6]]), stars=['saxo', 'compote'])
SX3, SD3 = (0.35, -7.2), (-0.55, -7.0)
v = low((-0.1, 0.3, -2.7), (-0.1, 0.85, -7.1), (-0.1, 0.3, -3.1), fov=54, roll=(-8, -5), hand=0.3)
add(108, 112, [A('saxo', 'shuffle', *SX3, at=1.0), A('sadi', 'shuffle', *SD3, at=1.0)],
    "K12-K13 (b108): the duo, low, the lit hills behind them",
    v, **NIGHT, crowd=troupe(), stars=['saxo', 'sadi'])
v = view((-3.0, 5.7, -3.4), (-3.6, 5.5, -12.4), 50, p1=(-3.05, 5.7, -3.8))
add(112, 116, [],
    "K13 (b112): up at the block: the neighbours dancing on their balconies, floor after floor, over the floodlit sheet",
    v, **NIGHT, stars=['saxo'])
v = view((0.18, 1.02, -5.2), (0.0, 1.02, STAR[1]), 46, p1=(0.16, 1.02, -5.35), ease='lin')
add(116, 120, [A('saxo', 'happy_idle', *STAR, at=0.3, speed=0.3)],
    "K13 'LA' (b119.9, the lipsync-animal ref): locked off, tight: the pop star's deadpan diva stare straight down the lens as the chorus sings it",
    v, **NIGHT, still=True, stars=['saxo'])
v = view((2.8, 4.2, -6.0), (3.8, 5.45, -12.0), 60, p1=(2.83, 4.22, -6.2))
add(120, 124, [kob_balcony('shaking_head_no_dismissively', face='world', yaw=-25, at=0.4, speed=0.7)],
    "K13 (night, from below): Kob over her railing, the painted HOLLYWOOD sheet pegged right under it: it's hers; she shakes her head",
    v, **NIGHT, stars=['kob'])
v = view((-1.2, 0.5, -5.6), (0.0, 0.9, -8.9), 60, p1=(-1.1, 0.5, -6.0))
add(124, 128, [A('compote', 'charleston', 0.0, -8.4, at=1.6, speed=1.0)],
    "K13-K14 (b124): Compote at the head of her troupe, kicking harder than anyone, furious",
    v, **NIGHT, crowd=troupe(at=1.6, skip=[[0.0, -9.4, 0.6]]), stars=['compote'])
v = view((-0.2, 0.85, -0.6), (-0.2, 0.8, -4.6), 64, p1=(-0.2, 0.85, -0.8))
add(128, 132, trolley_ride('compote', 'sadi', 0.5, -4.6, -90, 1.5, pace=1.1, rider={'arm': 'both', 'aim': [0.3, 0.1, 0.7]}, by={'fg': True}),
    "K14 'ride' (b129.9): the ride back the other way: Sadi pushes now, Compote in the trolley, still furious",
    v, **NIGHT, crowd=troupe(), stars=['compote'])
KP = (0.9, -6.6)
v = view((4.55, 7.6, -12.55), (KP[0], 0.85, KP[1]), 22, p1=(4.54, 7.58, -12.5))
add(132, 136, [A('saxo', 'emotional_waving_forward', *KP, face='world', yaw=yaw_to(KP, KOB_B), at=0.3), kob_balcony(face='world', yaw=200, fg=True)],
    "K14 'know... wanna' (b133.4, b135.5): Kob's point of view, over her curlers: far below, the pop star waves her down to join the party",
    v, **NIGHT, crowd=troupe(), stars=['saxo'])
v = deadpan(KOB_B, KOB_Y + 0.8, 3.5, cam_y=KOB_Y + 0.75, fov=40, push=0.15, ang=-8)
add(136, 140, [kob_balcony('bored_idle', face='world', yaw=-8, at=2.0, speed=0.2)],
    "K14 (deadpan): Kob. Nothing",
    v, **NIGHT, stars=['kob'])
v = view((5.6, 4.6, 1.8), (0.0, 1.8, -9.2), 62, p1=(5.2, 4.3, 1.3))
add(140, 144, [A('saxo', 'gangnam', *STAR, at=1.1), A('sadi', 'gangnam', -1.2, -6.9, at=1.1)],
    "K14-K15 (b140): the high wide: the whole estate dancing, the troupe, the duo on the star, the balconies, the HOLLYWOOD hills floodlit",
    v, **NIGHT, crowd=troupe(), stars=['saxo', 'sadi'])
v = low((0.0, 0.26, -4.0), (-0.1, 0.85, -7.2), (-0.02, 0.26, -4.4), fov=56, roll=(-9, -6), hand=0.3)
add(144, 148, [A('saxo', 'charleston', *SX3, at=0.7), A('sadi', 'charleston', *SD3, at=0.7)],
    "K15 (b144): low, the duo kicking with the troupe behind them",
    v, **NIGHT, crowd=troupe(), stars=['saxo', 'sadi'])
v = view((6.9, 6.7, -9.4), (4.3, 6.6, -12.0), 44, p1=(6.8, 6.7, -9.5))
add(148, 150, [A('kob', 'happy_idle', 4.3, -12.0, lift=KOB_Y, at=0.4, speed=0.2, face='world', yaw=-5, arm='both', aim=[0.3, -0.25, 0.85])],
    "K15 (b148): Kob leans over her railing and grabs the line her sheet hangs from with both paws",
    v, **NIGHT, stars=['kob'])
v = view((0.25, 0.3, -4.8), (0.0, 1.0, STAR[1]), 44, p1=(0.24, 0.3, -4.95))
add(150, 156, [A('saxo', 'gangnam', *STAR, at=1.1)],
    "K15 'LA' (b152.0): THE PAYOFF: the hook's glamour shot again, the pop star dancing in front of the Hollywood hills... and on the last 'LA' the hills are yanked up out of the frame: behind him, the grey concrete of the block",
    v, **NIGHT, crowd=troupe(), sheetPull=S(152.03 - 150), stars=['saxo'])
v = view((-0.1, 1.15, -3.3), (-0.1, 0.95, -7.2), 50, p1=(-0.1, 1.12, -3.5))
add(156, 160, [A('saxo', 'shoulder_shrug', *SX3, at=0.3, speed=0.8), A('sadi', 'happy_idle', *SD3, at=0.3, speed=0.3)],
    "K15 (b156): the pop star shrugs in front of the bare concrete; Sadi stares; the troupe keeps kicking behind them",
    v, **NIGHT, crowd=troupe(), sheet=0, stars=['saxo', 'sadi'])
v = deadpan(KOB_B, KOB_Y + 0.62, 3.2, cam_y=KOB_Y + 0.55, fov=40, push=0.08, ang=-18)
add(160, 161.4, [kob_balcony('bored_idle', face='world', yaw=-18, at=2.0, speed=0.0)],
    "button (the silent beat): Kob on her balcony, her HOLLYWOOD sheet folded over her railing beside her, airing; she glares",
    v, **NIGHT, sheet=0, still=True, stars=['kob'])

default_clips = {'gangnam', 'charleston', 'shuffle', 'twist', 'samba'}
crowd_clips = {c['clip'] for s in shots for c in ([s['crowd']] if isinstance(s.get('crowd'), dict) else s.get('crowd') or [])}
ep = {
    'date': '2026-09-30', 'n': 1,
    'song': {'title': "Ain't In LA", 'artist': 'ADÉLA'},
    'logline': "Saxo shoots his LA music video in the car park of his grey block of flats (the Hollywood hills are a bedsheet, his convertible is a shopping trolley) until Kob, the neighbour, takes her sheet back",
    'with': ['sadi', 'kob', 'compote'],
    'clips': sorted(({a['clip'] for s in shots for a in s['actors']} | crowd_clips) - default_clips),
    'tags': {'structure': 'expectation vs reality', 'scenes': ['trolley ride', 'crowd'], 'cast': ['saxo', 'sadi', 'kob', 'compote'], 'hook': 'dance',
             'maps': ['estate', 'panel'], 'ref': 'lipsync-animal', 'lyric_literal': "K03 'rain' (the downpour on the word), K04 'room' (his childhood bedroom), K06 'up' (jumping on the bed), K07 'wall' (Kob bangs on it), K12 'run' (the trolley run), K14 'ride' (the ride back), K13/K15 'LA' (the diva close-up, then the sheet taken back)",
             'experiment': "Does an expectation-vs-reality structure (each glamour shot followed by the pull-back showing the truth) on a chart-topping new song get more shares per 1,000 views than our story plots?"},
    'notes': ("The clip: ADÉLA with pink hair in her childhood bedroom in a Slovak housing estate (trophies, posters), a HOLLYWOOD "
              "backdrop painted in the estate with folk dancers in front of it, car drifts, bikes, the grey blocks. Ours keeps the "
              "estate, the bedroom and its trophies, the painted HOLLYWOOD and the folk dancers (a crowd of Compotes in folk dress); "
              "the lead wears the singer's look (pink hair, a navy varsity bomber, a yellow crop top). Structure: expectation vs "
              "reality (new): every glamour shot is followed by the truth. Sadi films his video (the romance: she dances with him); "
              "Compote pushes the trolley and leads the troupe, furious; Kob, the neighbour who never goes out, watches from her "
              "balcony and the payoff is hers: the HOLLYWOOD sheet was her bedsheet, and she takes it back on the last 'LA'."),
    'shots': shots,
}
out = os.path.join(os.path.dirname(__file__), '2026-09-30.json')
json.dump(ep, open(out, 'w'), indent=1)
print(f'{len(shots)} shots, the last from b{shots[-1]["beat"]} to b161.4 ({END} s); clips: {", ".join(ep["clips"])}')
for w in WARN: print('WARN', w)
