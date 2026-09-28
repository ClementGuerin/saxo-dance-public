# make_2026-09-29.py: writes episodes/2026-09-29.json, "Vamos a la playa" (Loona, 2010; the user's queue, no
# instructions). The clip: a Mediterranean beach at midday, the singer dancing in the surf, a crowd dancing in sync on
# the sand, a DJ, jet-skis, a red vintage convertible on the coast road, a beach party.
# Ours, a misread (new structure: an accident taken for a move and copied by everyone; the viewer knows the truth): the
# hot-sand dance. Saxo, the beach diva (a long blonde wig, white sunglasses, a silver swimsuit), steps onto the sand at
# midday and it is scorching: he hops from paw to paw, paws flapping by his ears, smoke puffing under him. Sadi thinks
# it's the summer's new dance and copies him; the towels copy her, then the volleyball players, the beach bar, the whole
# beach, while the pharmacy's sign climbs to 49°C. The hopping crowd tramples Compote's sandcastle (a carrot planted on
# its keep); she storms over to punch him, and her furious stomping on the hot sand is hailed as the dance's best move.
# On the second chorus the whole beach does the hot-sand dance in rows; Kob, on her sunbed in her tweed with a book,
# never touches the sand and turns a page. Saxo breaks for the sea and runs into the water: a big splash, bliss.
# The beach follows him in ("let's go, everyone, to the beach"), and the whole beach dances the hop in the surf.
# Button: the music drops out; from the water, over their heads: the beach is empty but for Kob, sprawled belly-up on
# the burning sand in the smoke, the only one enjoying the heat.
# Beats count from B0 = 0.000 s at 131.002 BPM (cut time = b * 60/131.002 s; a bar = 4 beats = 1.832 s): the cut is
# 0.2331-67.28 s of the song + 0.45 s of silence (episodes/2026-09-29.config.js); the video ends at 67.50 s (b147.4).
# Lyric rows K00-K30 (episodes/2026-09-29.lyrics.js; the lyrics stay in their files): chorus 1 K00-K07 (b1.7-33.9), verse 1
# K08-K15 (b34.6-63.9), chorus 2 K16-K23 (b65.7-97.9), the instrumental (b100-112), the breakdown bar (b112-116), the
# bridge K24-K27 (b115.5-131.7), the chant K28-K30 (b132.4-146.2), the song's break and our silence (b144.7-147.4).
# Action words (whitelisted glosses, kit beats): the chorus 'let's go to the beach' (K00, K04, K16, K20), 'dance' (K01,
# K05, K17, K21), 'rhythm / night' (K02, K06, K18, K22), 'party' (K03, K07, K19, K23); the verse 'go' (K08 b34.6, K10
# b42.6, K12 b50.6), 'hot' (K11 b47.0); the bridge 'heat' (K24 b115.5), 'dance' (K25 b119.9), 'let's go everyone to the
# beach' (K26 b123.6), 'let's go everyone' (K27 b127.6); the chant 'dance, dance' (K28-K30).
import json, math, os, sys
sys.path.insert(0, os.path.dirname(__file__))
from cam import view, swoop, low, deadpan, orbit, backs, reveal

P = 60 / 131.002
S = lambda b: round(b * P, 3)                      # beats -> seconds
END = 67.5
LOOK = {'saxo': 'diva', 'sadi': 'beach', 'kob': 'kob', 'compote': 'beach'}
HEAD = {'saxo': 1.36, 'sadi': 1.2, 'kob': 1.3, 'compote': 1.28}   # the top of each head standing (ears, the diva's sunglasses)
FACE = {'saxo': 0.95, 'sadi': 0.88, 'kob': 0.9, 'compote': 0.9}
# ---- the beach (src/maps18.js PLAYA) ----
SEA, SHORE, DEEP, DEEP_Y = -0.06, -6.2, -10.0, -0.5
def floor_y(z): return 0.0 if z >= SHORE else DEEP_Y if z <= DEEP else round(DEEP_Y * (SHORE - z) / (SHORE - DEEP), 3)
M0 = (0.0, 1.0)                     # Saxo's first hop, halfway down the beach
SADI_T = (-2.1, 3.0)                # Sadi on her towel
KOB = (3.9, 2.95); KOB_LIFT = 0.16  # Kob on her sunbed (seat top 0.34, the seated clip's hips 0.18 up), facing +z
CMP_K = (-2.6, -3.75)               # Compote kneels behind her castle (at -2.6, -2.8), facing it (+z)
PHARM = (-2.3, 10.3); WALK_Y = 0.9      # the pharmacy's sign on the promenade (src/maps18.js PLAYA.PHARMACY)

def A(who, clip, x, z, **o):
    return {'who': who, 'look': o.pop('look', LOOK[who]), 'clip': clip, 'x': round(x, 3), 'z': round(z, 3), 'face': o.pop('face', 'camera'),
            'yaw': o.pop('yaw', 0), 'at': o.pop('at', 'auto'), **o}
def yaw_to(a, b): return round(math.degrees(math.atan2(b[0] - a[0], b[1] - a[1])), 1)
HOPD = {'arm': 'both', 'aim': 'caramell', 'flapEvery': 0.5, 'sway': 7, 'swayEvery': 0.5, 'hop': [0.1, 0.5]}
def hopper(who, x, z, **o):
    """the hot-sand hop: from paw to paw on the half beat, paws flapping by the ears, tilting side to side"""
    return A(who, 'hip_hop_runningman_dance', x, z, at=o.pop('at', 0.0), **{**HOPD, **o})
def fury(x, z, **o):
    """Compote's version: the same hop, higher and wilder, furious (her pumped fists and her pointing finger vanished behind her duck ring)"""
    return A('compote', 'hip_hop_runningman_dance', x, z, at=o.pop('at', 0.2), **{**HOPD, 'sway': 12, 'hop': [0.16, 0.5], 'air': True, **o})   # air: her higher hop is off the floor on purpose (the gate's 10 fps samples missed every landing)
def kob_reading(**o):
    return A('kob', 'male_driving_a_car', *KOB, face='world', yaw=0, at=o.pop('at', 0.3), speed=o.pop('speed', 0.05), lift=KOB_LIFT, hold='book', **o)
def wet(who, clip, xz, **o):
    """standing in the shallows: the sand under the water is lower"""
    return A(who, clip, *xz, lift=floor_y(xz[1]), **o)

# ---- a projection check (numbers only): where each face lands in the 9:16 frame at the shot's start and end ----
def _proj(cam, look, fov, pt):
    f = [look[i] - cam[i] for i in range(3)]; n = math.sqrt(sum(v * v for v in f)); f = [v / n for v in f]
    r = [-f[2], 0.0, f[0]]; rn = math.sqrt(r[0] ** 2 + r[2] ** 2) or 1; r = [r[0] / rn, 0.0, r[2] / rn]
    u = [r[1] * f[2] - r[2] * f[1], r[2] * f[0] - r[0] * f[2], r[0] * f[1] - r[1] * f[0]]
    d = [pt[i] - cam[i] for i in range(3)]; z = sum(a * b for a, b in zip(d, f))
    if z <= 0.05: return None
    tv = math.tan(math.radians(fov) / 2); th = tv * 9 / 16
    return (0.5 + sum(a * b for a, b in zip(d, r)) / z / th / 2, 0.5 - sum(a * b for a, b in zip(d, u)) / z / tv / 2)
LINES = [(1.72, 5.83), (5.87, 9.89), (10.07, 14.3), (14.61, 17.69), (17.73, 21.81), (21.86, 25.89), (26.07, 30.28), (30.61, 33.91), (34.56, 38.8),
         (39.06, 42.6), (42.64, 46.13), (47.01, 50.59), (50.63, 54.13), (55.09, 58.41), (58.45, 60.37), (60.41, 63.86), (65.72, 69.82), (69.87, 73.89),
         (74.06, 78.3), (78.6, 81.68), (81.72, 85.83), (85.87, 89.89), (90.06, 94.3), (94.61, 97.92), (115.48, 118.88), (118.93, 123.34), (123.6, 127.53),
         (127.57, 131.72), (132.36, 136.31), (136.35, 140.3), (140.35, 146.18)]
def has_line(b0, b1): return any(a < b1 and b > b0 for a, b in LINES)
WARN = []
SEATED = ('male_driving_a_car', 'falling_to_knees_in_prayer')
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
            if line and top[1] < 0.26: WARN.append(f'b{beat}: {a["who"]} head top at {top[1]:.2f} (lyric rows)')
            if face[0] < 0.15 or face[0] > 0.85: WARN.append(f'b{beat}: {a["who"]} face x {face[0]:.2f} (edge){" at the end" if end else ""}')
            if face[1] > 0.8: WARN.append(f'b{beat}: {a["who"]} face y {face[1]:.2f} (low)')

shots = []
def add(beat, b1, actors, lyric, v, lenses, map='playa', **o):
    c, focus = v
    o = {k: val for k, val in o.items() if val is not None}
    sign = o.pop('sign', False)
    s = {'beat': beat, 'kind': 'dance', 'map': map, 'actors': actors, 'lyric': lyric, 'cam': c, 'focus': focus, **o}
    # smoke off the sand under everyone hopping on it (along a walk, each point from when they get there)
    siz = list(o.get('sizzle', []))
    for a in actors:
        if a.get('hop') and a.get('lift', 0) == 0:
            if a.get('mx') or a.get('mz'):
                for k in range(5): siz.append([round(a['x'] + a.get('mx', 0) * k / 4, 2), round(a['z'] + a.get('mz', 0) * k / 4, 2), round(S(b1 - beat) * k / 4 - 0.05, 2)])
            else: siz.append([a['x'], a['z']])
    if siz: s['sizzle'] = siz
    if not sign: s['noSign'] = True   # the thermometer only where a shot asks for it (the hook, 'hot')
    look = (focus[0], c['look'][0], focus[1])
    check(beat, b1, lenses, look, c['fov'], actors)
    if sign:   # the pharmacy's thermometer: where it lands, and never in the lyric rows
        for k, cam in enumerate(lenses):
            for name, y in (('display', WALK_Y + 3.1), ('cross top', WALK_Y + 4.2)):
                pr = _proj(cam, look, c['fov'], (PHARM[0], y, PHARM[1]))
                if pr: print(f'b{beat} sign {name} at x {pr[0]:.2f} y {pr[1]:.2f}' + (' (start)' if k == 0 else ' (end)'))
                if pr and 0 < pr[0] < 1 and 0 < pr[1] < 0.26 and has_line(beat, b1): WARN.append(f'b{beat}: the sign\'s {name} in the lyric rows')
    shots.append(s)
def lens(v, k=0):   # the camera position at the start (k=0) or the end (k=1) of a view() move
    c, f = v; a = math.radians(c['ang'][k]); return (f[0] + math.sin(a) * c['r'][k], c['h'][k], f[1] + math.cos(a) * c['r'][k])
def L2(v): return [lens(v, 0), lens(v, 1)]
def clear_for(v, *marks, r=0.9):
    """no pet at the lens (start and end) or on the cast's marks"""
    return [[round(p[0], 2), round(p[2], 2), 1.2] for p in L2(v)] + [[round(m[0], 2), round(m[1], 2), r] for m in marks]
ALL4 = {'0': -9, '1': -9, '2': -9, '3': -9}

# ================= the hook + chorus 1 (b0-36): the hop, and Sadi copies it =================
# the hook (the critic, 14/25: "nothing says the sand is hot"): at sand level towards the promenade, the pharmacy's
# thermometer (46°C, in red) beside his head, smoke jetting off the sand at every landing
M0 = (0.45, 2.3)
v = low((0.45, 0.24, -1.2), (-0.07, 0.84, M0[1]), (0.38, 0.24, -0.6), fov=56, roll=(-9, -5))
add(0, 4, [hopper('saxo', *M0)],
    "HOOK (the intro bar, K00's pickup): at sand level: Saxo, the beach diva in his blonde wig, white sunglasses and silver swimsuit, hops frantically from paw to paw, paws flapping by his ears, smoke jetting off the scorching sand at every landing; behind him the pharmacy's thermometer reads 46°C in red",
    v, L2(v), temp=46, sizzle=[[M0[0], M0[1], -9, 2.0]], clear=clear_for(v, M0), stars=['saxo'], sign=True)
v = low((1.75, 0.55, 4.2), (M0[0], 0.8, M0[1]), (1.5, 0.55, 3.8), fov=64, roll=(-10, -6))
add(4, 8, [hopper('saxo', *M0)],
    "K00 'let's go to the beach' / K01 'dance' (the drop, b4): low from his side: the hop on the beat, the sea behind him, smoke off his paws at every landing",
    v, L2(v), temp=46, clear=clear_for(v, M0), stars=['saxo'])
SADI_T = (-2.3, 3.2)
SD3 = (-0.95, 2.9)
v = view((-0.35, 0.62, 6.2), (-0.35, 0.78, 2.6), 62, p1=(-0.37, 0.62, 5.95))
add(8, 12, [hopper('saxo', *M0, face='world', yaw=yaw_to(M0, SD3) + 40), hopper('sadi', *SD3, face='world', yaw=yaw_to(SD3, M0) - 40)],
    "K02 'rhythm... night' (b10.1): Sadi, up from her pink towel, copies him move for move, delighted: she thinks it's the summer's new dance",
    v, L2(v), temp=46, clear=clear_for(v, M0, SD3), stars=['sadi', 'saxo'])
SX, SD = (-0.6, 1.2), (-1.6, 1.5)
v = low((-0.75, 0.2, 5.1), (-1.1, 0.74, 1.35), (-0.85, 0.2, 4.6), fov=62, roll=(-8, -4))
add(12, 16, [hopper('saxo', *SX), hopper('sadi', *SD)],
    "K03 'party' (b14.6): the two hopping side by side in sync (he's in agony, she's having the time of her life)",
    v, L2(v), temp=46, clear=clear_for(v, SX, SD), stars=['saxo', 'sadi'])
v = deadpan(KOB, 0.9, 2.55, cam_y=1.0, fov=44, push=0.12)
add(16, 20, [kob_reading()],
    "K04 'let's go to the beach' (deadpan): Kob on her sunbed, in her tweed blazer with a book, her feet nowhere near the sand, looks up at them. Nothing",
    v, [lens(v, 0)], temp=46, clear=clear_for(v, KOB), stars=['kob'])
v = view((-1.3, 0.75, 5.3), (-2.2, 0.55, 1.6), 60, p1=(-1.35, 0.75, 5.05))
add(20, 24, [hopper('sadi', *SD)],
    "K05 'dance' (b21.9): the towels round Sadi see it... and stand up and hop too (the left towels start 0.8 s in)",
    v, L2(v), hop={'0': 0.8}, temp=46, clear=clear_for(v, SD), stars=['sadi'])
v = view((-1.75, 1.2, 6.3), (-1.6, 0.55, 1.6), 62, p1=(-1.75, 1.15, 6.0))
add(24, 28, [hopper('saxo', *SX), hopper('sadi', *SD)],
    "K06 'rhythm... night' (b26.1): low among the towels: the pets on them all hopping now, the duo beyond them, the sea behind",
    v, L2(v), hop={'0': -9}, temp=47, clear=clear_for(v, SX, SD) + [[-2.1, 4.6, 0.9]], stars=['saxo', 'sadi'])
v = view((2.0, 4.2, 7.5), (-1.9, 0.3, -0.2), 64, p1=(1.8, 3.9, 7.1))
add(28, 32, [hopper('saxo', *SX), hopper('sadi', *SD),
             A('compote', 'falling_to_knees_in_prayer', *CMP_K, face='world', yaw=0, at=2.6, speed=0.02, arm='both', aim='taiko')],
    "K07 'party' (b30.6): high over the beach: the towels hopping round the duo, Compote building her sandcastle by the water",
    v, L2(v), hop={'0': -9}, temp=47, clear=clear_for(v, SX, SD, CMP_K) + [[-2.1, 0.6, 0.8], [-2.6, -0.3, 0.8]], stars=['saxo', 'sadi'])

# ================= verse 1 (b32-64): the hop spreads, 'hot', the castle, Compote =================
v = view((-3.5, 1.9, 1.4), (-8.4, 0.8, -1.1), 56, p1=(-3.65, 1.9, 1.35))
add(32, 36, [],
    "K08 'go' (b34.6, 1.16 s in): the volleyball players turn to watch the dance... and on 'go' all four drop the game (the ball falls to the sand) and start hopping",
    v, [lens(v, 0)], hop={'0': -9, '1': S(34.56 - 32)}, stare=[0.0, 1.2], temp=47, clear=[[-3.9, 0.9, 2.2]], stars=['saxo'])
v = view((7.0, 1.05, 1.4), (9.6, 0.95, 4.4), 54, p1=(7.1, 1.05, 1.55))
add(36, 40, [],
    "K09 (b39.1): the beach bar: the pets at the counter turn round and hop too",
    v, [lens(v, 0)], hop={'0': -9, '1': -9, '2': 0.5}, temp=47, clear=clear_for(v), stars=['saxo'])
v = view((1.8, 1.1, -1.6), (8.0, 0.7, 0.2), 56, p1=(1.95, 1.1, -1.5))
add(40, 44, [],
    "K10 'go' (b42.6, 1.2 s in): the right side of the beach, turned to watch: on 'go' they all start hopping, towel after towel",
    v, [lens(v, 0)], hop={'0': -9, '1': -9, '2': -9, '3': S(42.64 - 40)}, stare=[0.3, 1.0], temp=48, clear=clear_for(v), stars=['saxo'])
v = view((-1.3, 0.8, 6.3), (PHARM[0], 3.85, PHARM[1] - 0.05), 50, p1=(-1.35, 0.85, 6.6))
add(44, 48, [],
    "K11 'hot' (b47.0): the pharmacy's green cross on the promenade: its thermometer climbs 45, 46, 47... 49°C, on 'hot'",
    v, [lens(v, 0)], temp=[45, 49], hop=ALL4, stars=['saxo'], sign=True)
C_AT = S(50.63 - 48) + 0.04
v = view((-2.1, 2.6, 0.2), (-2.3, 0.6, -3.6), 58, p1=(-2.1, 2.55, 0.05))
add(48, 52, [A('compote', 'falling_to_knees_in_prayer', *CMP_K, face='world', yaw=0, at=2.6, speed=0.02, arm='both', aim='taiko', holdAt=C_AT + 0.05),
             hopper('saxo', -1.45, -2.6, mx=-0.6, mz=-0.15, reveal=0.45)],
    "K12 'go' (b50.6): from above Compote's sandcastle, a carrot planted on its keep: she pats it, proud... the diva hops in and lands on it on 'go': it caves in",
    v, L2(v), castleAt=C_AT, hop=ALL4, temp=49, clear=clear_for(v, CMP_K, (-2.0, -2.7)) + [[-2.9, -1.2, 0.9]], stars=['compote'])
v = view((-2.1, 1.1, -0.3), (-2.45, 0.64, -3.6), 46, p1=(-2.1, 1.07, -0.45))
add(52, 56, [A('compote', 'falling_to_knees_in_prayer', *CMP_K, face='world', yaw=0, at=2.6, speed=0.0)],
    "K13 (deadpan): Compote on her knees behind the flattened castle, the rubble and her carrot lying on its side in front of her, glaring at the lens",
    v, L2(v), castle=0, hop=ALL4, temp=49, clear=clear_for(v, CMP_K) + [[-2.8, -5.8, 1.2], [-3.2, -7.8, 1.4], [-3.6, -9.0, 1.4]], stars=['compote'])
CF0 = (-2.2, -2.2)
v = low((-1.85, 0.3, 1.2), (CF0[0], 0.8, CF0[1]), (-1.9, 0.3, 0.8), fov=60, roll=(-8, -4))
add(56, 60, [fury(*CF0)],
    "K14 (b58.5): she storms off the rubble to punch him... and the scorching sand gets her too: she hops, furious, higher and wilder than anyone",
    v, L2(v), castle=0, hop=ALL4, temp=49, clear=clear_for(v, CF0), stars=['compote'])
CR = (-1.2, -1.2)
v = view((1.6, 2.5, 1.4), (CR[0], 0.6, CR[1]), 56, p1=(1.45, 2.4, 1.2))
add(60, 64, [fury(*CR)],
    "K15 (b60.4): her furious stomp is the best move the beach has seen: the pets form a ring round her and copy it, cheering",
    v, L2(v), hop=0, ring=[CR[0], CR[1], 2.2, 20], castle=0, temp=49, clear=clear_for(v, CR, r=0.8) + [[0.41, 0.3, 1.0]], stars=['compote'])

# ================= chorus 2 (b64-100): the craze =================
v = view((2.6, 4.4, 2.2), (CR[0], 0.5, CR[1]), 56, p1=(2.4, 4.2, 2.0))
add(64, 68, [fury(*CR), hopper('saxo', CR[0] + 1.0, CR[1] + 0.9), hopper('sadi', CR[0] + 0.15, CR[1] + 1.45)],
    "K16 'let's go to the beach' (the pickup): high over the ring: Compote hopping furious in the middle, the whole beach round her copying, the diva and Sadi in the ring",
    v, L2(v), hop=0, ring=[CR[0], CR[1], 2.2, 30], castle=0, temp=49, clear=clear_for(v, CR, (CR[0] + 1.0, CR[1] + 0.9), (CR[0] + 0.15, CR[1] + 1.45), r=0.7) + [[0.5, 0.4, 0.8], [0.9, 0.7, 0.8]], stars=['compote'])
ROWS = [-0.5, 1.6, 6, 5, 1.2, -1.35, 180]      # the craze: 6 x 5 pets from z 1.6 back to 7.0, facing the sea (off Kob's sunbed)
ROWS_F = {'hop': 0, 'rows': ROWS, 'castle': 0, 'temp': 49}
FR = {'saxo': (-0.5, 0.1), 'sadi': (-1.5, 0.35), 'compote': (0.5, 0.35)}
def front(**o):
    return [hopper('saxo', *FR['saxo'], **o.get('saxo', {})), hopper('sadi', *FR['sadi'], **o.get('sadi', {})), fury(*FR['compote'], **o.get('compote', {}))]
v = view((-0.5, 3.4, -6.2), (-0.5, 0.45, 2.0), 60, p1=(-0.5, 3.1, -5.7))
add(68, 72, front(),
    "K17 'dance' (the drop, b68): the reveal from the sea: the whole beach in rows doing the hot-sand dance in sync, the diva, Sadi and Compote in front, the promenade and the white houses behind",
    v, L2(v), clear=clear_for(v, *FR.values()), stars=['saxo', 'sadi'], **ROWS_F)
v = low((-0.4, 0.22, -4.7), (-0.5, 0.66, 0.2), (-0.45, 0.22, -4.35), fov=70, roll=(-10, -6))
add(72, 76, front(),
    "K18 'rhythm... night' (b74.1): low on the front row: the three hopping in sync, the rows behind them",
    v, L2(v), clear=clear_for(v, *FR.values()), stars=['saxo', 'sadi'], **ROWS_F)
v = view((-0.5, 4.3, -4.6), (-0.5, 0.3, 2.2), 58, p1=(-0.45, 4.0, -4.2))
add(76, 80, front(),
    "K19 'party' (b78.6): high over the craze: rows of pets hopping and flapping in sync like a routine, the three at the front",
    v, L2(v), clear=clear_for(v, *FR.values()), stars=['saxo', 'sadi'], **ROWS_F)
v = deadpan(KOB, 0.85, 3.0, cam_y=1.0, fov=52, push=0.12, ang=55)
add(80, 84, [kob_reading(speed=0.35)],
    "K20 'let's go to the beach' (deadpan): Kob, the craze hopping beyond her sunbed, turns a page",
    v, [lens(v, 0)], clear=clear_for(v, KOB, r=1.4) + [[3.1, 2.95, 0.8]], stars=['kob'], **ROWS_F)
v = orbit(FR['saxo'], 2.4, 0.35, 152, 212, 0.84, fov=64)
add(84, 88, [hopper('saxo', *FR['saxo'])],
    "K21 'dance' (b85.9): round the diva, handheld: still hopping, desperate, the crowd copying every flap",
    v, L2(v), clear=clear_for(v, *FR.values()), stars=['saxo'], **ROWS_F)
v = low((1.3, 0.35, -3.9), (-0.55, 0.78, 0.25), (1.2, 0.35, -3.65), fov=66, roll=(9, 5))
add(88, 92, front(),
    "K22 'rhythm... night' (b90.1): low from the right of the front row: the three hopping in sync, the crowd behind them to the promenade",
    v, L2(v), clear=clear_for(v, *FR.values()), stars=['saxo'], **ROWS_F)
v = low((-0.35, 0.45, -2.75), (FR['saxo'][0], 0.85, FR['saxo'][1]), (-0.4, 0.45, -2.45), fov=56, roll=(-7, -4), hand=0.2)
add(92, 96, [hopper('saxo', *FR['saxo'])],
    "K23 'party' (b94.6): close on the diva: hopping for his life, smoke off every landing, while the whole beach behind him copies every flap as if it were the party of the summer",
    v, L2(v), clear=clear_for(v, FR['saxo']), stars=['saxo'], **ROWS_F)
v = view((-3.3, 0.65, 6.6), (PHARM[0], 3.9, PHARM[1] - 0.05), 48, p1=(-2.95, 0.95, 7.45))   # a real push-in: once the display stops climbing the frame froze for 0.3 s
add(96, 100, [],
    "end of chorus 2: the pharmacy's thermometer again: 49... 50... 51... 52°C",
    v, [lens(v, 0)], clear=clear_for(v) + [[-2.75, 8.2, 1.0]], stars=['saxo'], sign=True, **{**ROWS_F, 'temp': [49, 52]})   # the lens sits in the craze's back row (z 7.0): a flapping pet crossed it (the critic: 'a dark slab')

# ================= the instrumental and the breakdown (b100-116): the escape into the sea =================
RUN0 = (-0.5, 0.1)
v = view((3.4, 0.8, -4.4), (-0.5, 0.8, -1.25), 60, p1=(3.35, 0.8, -4.45))
add(100, 104, [A('saxo', 'happy_run', *RUN0, face='world', yaw=180, at=0.1, speed=1.6, mz=-2.7)],
    "instrumental: he bolts for the sea, side on, a sprint across the burning sand, the crowd still hopping in rows behind",
    v, L2(v), clear=clear_for(v, RUN0, (-0.5, -2.6)), sizzle=[[-0.5, round(0.1 - 2.7 * k / 5, 2), round(S(4) * k / 5 - 0.05, 2)] for k in range(6)], stars=['saxo'], **ROWS_F)
v = view((-0.25, 1.05, -1.5), (-0.45, 0.45, -7.6), 54, p1=(-0.28, 1.0, -1.9))
add(104, 108, [A('saxo', 'happy_run', -0.45, -3.4, face='world', yaw=180, at=0.3, speed=1.6, mz=-2.9)],
    "instrumental: from behind him: the last stretch down the wet sand, straight at the sea",
    v, L2(v), clear=clear_for(v, (-0.45, -3.4), (-0.4, -6.3)), sizzle=[[-0.45, round(-3.4 - 2.8 * k / 4, 2), round(S(4) * k / 4 - 0.05, 2)] for k in range(4)], stars=['saxo'], **ROWS_F)
SURF = (0.2, -8.3)
L28 = (2.4, 0.95, -5.4)
v = view(L28, (SURF[0], 0.62, SURF[1]), 58, p1=(2.3, 0.95, -5.55))
add(108, 112, [wet('saxo', 'happy_idle', SURF, at=0.4)],
    "instrumental: he's in! a big splash of cool water round him",
    v, L2(v), splash=[[SURF[0], SURF[1], 0.0, 1.3]], clear=clear_for(v, SURF), stars=['saxo'], **ROWS_F)
BATH = (0.2, -9.2)
v = view((1.3, 0.62, -11.7), (BATH[0] - 0.2, 0.45, BATH[1]), 50, p1=(1.26, 0.62, -11.55))
add(112, 116, [wet('saxo', 'male_driving_a_car', BATH, face='world', yaw=180, at=0.3, speed=0.05)],
    "the breakdown (the music drops back): bliss: the diva sits down in the cool sea up to his chest... and behind him, on the beach, everyone still doing the hot-sand dance",
    v, L2(v), half=True, clear=clear_for(v, BATH), stars=['saxo'], **ROWS_F)

# ================= the bridge (b116-132): everyone into the sea =================
SADI_SEA = (-0.95, -8.8)
L30 = (-0.4, 0.85, -12.9)
v = view(L30, (-0.35, 0.5, -9.0), 58, p1=(-0.42, 0.85, -12.75))
add(116, 120, [wet('saxo', 'male_driving_a_car', BATH, face='world', yaw=180, at=0.3, speed=0.05), wet('sadi', 'happy_idle', SADI_SEA, at=0.5)],
    "K24 'heat' (b115.5): Sadi splashes in beside him, and the two cool off in the sea",
    v, L2(v), splash=[[SADI_SEA[0], SADI_SEA[1], 0.0, 1.0]], clear=clear_for(v, BATH, SADI_SEA), stars=['sadi'], **ROWS_F)
v = view((-0.35, 0.95, -11.4), (-0.35, 0.85, 1.5), 50, p1=(-0.35, 0.95, -11.6))
add(120, 124, [wet('saxo', 'male_driving_a_car', BATH, face='world', yaw=0, at=0.3, speed=0.05, fg=True), wet('sadi', 'happy_idle', SADI_SEA, face='world', yaw=0, at=0.5, fg=True)],
    "K25 'dance' (b119.9): from behind them in the water: on the beach the whole crowd still dances the hop in rows",
    v, L2(v), clear=clear_for(v, BATH, SADI_SEA), stars=['saxo'], **ROWS_F)
v = view((7.6, 1.3, -1.8), (-0.5, 0.6, -2.2), 66, p1=(7.5, 1.3, -1.9))
add(124, 128, [],
    "K26 'let's go, everyone, to the beach' (b123.6): side on: the stampede: the whole beach charges down the sand into the sea",
    v, L2(v), rush=[0.0, 1.7], clear=[[7.6, -1.8, 1.5]], stars=['saxo'], **ROWS_F)
v = view((0.5, 1.3, -14.0), (0.0, 0.55, -8.7), 56, p1=(0.5, 1.25, -13.8))
add(128, 132, [],
    "K27 'let's go, everyone' (b127.6): from the sea: the crowd splashes in all along the shore",
    v, L2(v), rush=[-1.75, 1.7], splash=[[-2.6, -7.8, 0.05, 1.0], [0.4, -8.1, 0.25, 1.1], [3.2, -7.8, 0.45, 1.0]], clear=[[0.5, -14.0, 2.0]], stars=['saxo'], **ROWS_F)

# ================= the chant (b132-144): the hop, in the sea =================
DANCE_SEA = {'arm': 'both', 'aim': 'caramell', 'flapEvery': 0.5, 'sway': 8, 'swayEvery': 0.5}
SAXO_SEA = (0.2, -8.3); CMP_SEA = (1.4, -8.9)
v = low((-0.1, 0.28, -4.4), (-0.35, 0.52, -8.2), (-0.16, 0.28, -4.8), fov=72, roll=(-8, -4))
add(132, 136, [wet('saxo', 'hip_hop_runningman_dance', SAXO_SEA, at=0.0, **DANCE_SEA), wet('sadi', 'hip_hop_runningman_dance', (-0.9, -8.0), at=0.0, **DANCE_SEA)],
    "K28 'dance, dance' (b132.4): the hot-sand dance goes on in the sea, cool now: the diva and Sadi flapping in the surf, the whole beach round them",
    v, L2(v), sea=True, clear=clear_for(v, SAXO_SEA, (-0.9, -8.0)), stars=['saxo', 'sadi'])
v = view((1.95, 0.62, -6.5), (CMP_SEA[0], 0.5, CMP_SEA[1]), 52, p1=(1.9, 0.62, -6.7))
add(136, 140, [A('compote', 'hip_hop_runningman_dance', *CMP_SEA, lift=floor_y(CMP_SEA[1]), at=0.2, **{**DANCE_SEA, 'sway': 12})],
    "K29 'dance, dance' (b136.4): Compote in the sea in her duck ring, still furious, still dancing it, paws flapping",
    v, L2(v), sea=True, clear=clear_for(v, CMP_SEA) + [[2.4, -6.9, 1.9]], stars=['compote'])
v = reveal((0.55, 1.0, -5.6), (0.2, 0.55, -8.8), (0.4, 5.2, -2.8), fov=64, ly1=0.0)
add(140, 144, [wet('saxo', 'hip_hop_runningman_dance', SAXO_SEA, at=0.0, **DANCE_SEA), wet('sadi', 'hip_hop_runningman_dance', (-0.9, -8.0), at=0.0, reveal=1.2, **DANCE_SEA),
               A('compote', 'hip_hop_runningman_dance', *CMP_SEA, lift=floor_y(CMP_SEA[1]), at=0.2, reveal=1.2, **{**DANCE_SEA, 'sway': 12})],
    "K30 'dance, dance' (b140.4): the payoff wide: pulling back and up from the shore over the bay: the whole beach dancing the hop in the sea",
    v, L2(v), sea=True, clear=clear_for(v, SAXO_SEA, (-0.9, -8.0), CMP_SEA, r=0.9), stars=['saxo', 'sadi'])

# ================= the button (b144-147.4): the song's break, then silence =================
# (the critic, twice: the stroll repeated Dai Dai's beat; then the close on her lying there had no context) a high wide from
# the surf: the whole beach in the water in the foreground, their backs to us, cooling off; beyond them the empty beach, and
# Kob, the cat who never touched the sand all day, sprawled belly-up on it alone in the little puffs of smoke; a slow
# push-in through the silence: the only one enjoying the heat
KL = (0.6, -4.7)
SX_B, SD_B = (0.2, -8.15), (1.05, -8.3)   # the diva and Sadi in the water, their backs to us, framing her
v = view((0.65, 3.3, -11.7), (KL[0], 0.1, KL[1] - 0.3), 50, p1=(0.65, 2.95, -10.9), ease='lin')
add(144, 147.4, [wet('saxo', 'happy_idle', SX_B, face='world', yaw=0, at=0.4, fg=True), wet('sadi', 'happy_idle', SD_B, face='world', yaw=0, at=0.9, fg=True),
                 A('kob', 'laying_idle', *KL, face='world', yaw=180, at=2.0, speed=0.3, ground='mesh')],
    "button (the music drops out, then silence): from the surf, over the heads of the diva, Sadi and the whole beach cooling off in the water: the beach is empty but for Kob, the cat who never touched the sand all day, sprawled belly-up on it alone in the little puffs of smoke, the only one enjoying the heat",
    v, L2(v), sea=True, still=True, sizzle=[[KL[0] - 0.6, KL[1] - 0.2, -9, 1.5], [KL[0] + 0.6, KL[1] + 0.1, -9, 1.5], [KL[0] - 0.5, KL[1] + 0.6, -9, 1.5], [KL[0] + 0.55, KL[1] - 0.55, -9, 1.5], [KL[0] + 0.1, KL[1] + 1.05, -9, 1.5], [KL[0] - 0.1, KL[1] - 0.95, -9, 1.5]],
    clear=clear_for(v, KL, SX_B, SD_B, r=0.7) + [[0.62, -7.1, 0.45], [0.61, -6.2, 0.45], [0.2, -9.25, 0.75], [1.05, -9.4, 0.75], [0.62, -9.0, 0.5]], stars=['kob'])   # nobody between the lens and the two heads

ep = {
    'date': '2026-09-29', 'n': 1,
    'song': {'title': 'Vamos a la playa', 'artist': 'Loona'},
    'logline': "The sand is so hot that Saxo's frantic hop from paw to paw is taken for the summer's new dance, and the whole beach copies it... until he runs into the sea and everyone follows, in a cloud of steam",
    'with': ['sadi', 'kob', 'compote'],
    'clips': sorted({a['clip'] for s in shots for a in s['actors']} - {'charleston', 'shimmy', 'samba', 'gangnam', 'shuffle', 'running_man'}),
    'tags': {'structure': 'misread', 'scenes': ['hot sand', 'crowd', 'steam'], 'cast': ['saxo', 'sadi', 'kob', 'compote'], 'hook': 'dance',
             'maps': ['playa'], 'ref': 'none', 'lyric_literal': "K11 'hot' (the pharmacy's sign hits 49°C), K00/K04/K20 'let's go to the beach' (his hop across the sand), K26-K27 'let's go, everyone' (the stampede into the sea), K28-K30 'dance, dance' (the hop in the sea)",
             'experiment': "Does a relatable everyday pain turned into the gag (the hot-sand hop everyone has done, mistaken for a dance craze) and opened on the dance itself get more shares per 1,000 views than our plot-heavy story episodes?"},
    'notes': ("The clip: Loona dancing in the surf in a silver bikini, a crowd dancing in sync on the sand, a DJ, jet-skis, a red "
              "convertible on the coast road, bikers and skaters on the promenade. Ours keeps the beach at midday, the dancing in "
              "the surf (the payoff), the crowd dancing in sync (the craze), the jet-skis and the red convertible; the lead wears the "
              "singer's look as Saxo's diva (a long blonde wig, white sunglasses, a silver swimsuit). Structure: misread (new): his "
              "pain is taken for a dance by Sadi (the romance: she thinks it's for her), copied by the beach; Compote's fury (her "
              "castle, trampled by the craze) is taken for its best move; Kob never touches the sand and the button is hers: once the "
              "whole beach has fled into the sea, she lies down on the burning sand, belly-up, the only one enjoying the heat. The PLAYBOOK's medium rule: open on the dance (the hop is the hook)."),
    'shots': shots,
}
out = os.path.join(os.path.dirname(__file__), '2026-09-29.json')
json.dump(ep, open(out, 'w'), indent=1)
print(f'{len(shots)} shots, the last from b{shots[-1]["beat"]} to b147.4 ({END} s); clips: {", ".join(ep["clips"])}')
for w in WARN: print('WARN', w)
