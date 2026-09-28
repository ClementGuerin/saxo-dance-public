# make_2026-09-28-4.py: writes episodes/2026-09-28-4.json, "Dai Dai" (Shakira & Burna Boy, the official 2026 World Cup
# song; #14 on Spotify's global daily chart on 2026-09-27 and rising, 2.69M videos on its TikTok sound). The clip: dancers
# before a giant baobab at dusk, kids playing barefoot football on a village's dirt pitch, a troupe on a stadium's pitch
# under the floodlights, the singer dancing on top of the Earth in space, fireworks at the end.
# Ours, a line-up ("who took it best?", the spicy-lineup format: one test, the whole cast in turn, each true to
# character): the World Cup final comes down to penalties. Compote smashes hers so hard the keeper (a big bulldog in
# magenta) goes into the net with the ball; Sadi blows him a kiss, he melts to his knees and she chips it over him; Kob
# strolls up sipping her milk, pokes it without looking, the keeper dives the wrong way and it trickles in while she's
# already walking off. Then Saxo, the captain: he sets the ball down and walks back for his run-up... past the halfway
# line, out through the tunnel, and his run-up goes round the world, dancing (the pyramids, Tokyo, the snow, running on
# top of the tiny Earth, the baobab where the kids cheer him on) while the keeper waits, dances out of boredom, and falls
# asleep on his line. At sunrise Saxo bursts out of the tunnel, sprints in and smashes it past the sleeping keeper on the
# drop: the World Cup is won. Fireworks; Kob, unimpressed, sips her milk. Structure: line-up (new).
# Beats count from B0 = 0.000 s at 116.00 BPM (cut time = b * 60/116 s; a bar = 4 beats = 2.069 s): the cut is
# 25.078-91.285 s of the song (episodes/2026-09-28-4.config.js); the video ends at 66.20 s (b128). Lyric lines are named
# K00-K23 (episodes/2026-09-28-4.lyrics.js; the lyrics stay in their files): the title hook K00-K01 (b0-17.4), the
# instrumental break (b17.4-32), verse 1 K02-K10 (b32-67.7), chorus 1 K11-K23 (b68-128).
# Action words (whitelisted, kit beats): K00 'dai dai' b0-1.2, 'go' b7.35; K01 'dai dai' b8-9.2, 'go' b15.35; K02 'come'
# b31.9; K04 'fire' b42.9; K09 'step' b61.7; K16 'dream' b90.3; K17 'top' b93.2, 'game' b94.4; K21 'dai dai' b113.8.
import json, math, os, sys
sys.path.insert(0, os.path.dirname(__file__))
from cam import view, low, deadpan, orbit, reveal

P = 60 / 116.0
S = lambda b: round(b * P, 3)                      # beats -> seconds
END = 66.20
LOOK = {'saxo': 'football', 'sadi': 'football', 'kob': 'football', 'compote': 'football'}
SC = {'saxo': 1.0, 'sadi': 0.92, 'kob': 0.92, 'compote': 0.92}
HEAD = {'saxo': 1.3, 'sadi': 1.2, 'kob': 1.3, 'compote': 1.28}   # the top of each head standing (ears included)
FACE = {'saxo': 0.95, 'sadi': 0.88, 'kob': 0.9, 'compote': 0.9}
# ---- the final (src/maps17.js FINAL): the spot at the origin, the goal line at z -7.7, the keeper on it ----
SPOT = (0.0, 0.0)
KEEP = (0.0, -7.25)
BR = 0.15                       # the ball's radius: resting, its centre is 0.15 m up
TUNNEL = (-25.2, 29.05)         # the tunnel's mouth in the left stand, at the halfway line (it faces +x)
CONTACT = 0.8                   # male_soccer_penalty_kick: the right boot meets the ball 0.8 s into the clip (CLIP_PROBE)
WAIT_SPOT = [(-2.25, 4.5), (-3.0, 4.5), (-3.75, 4.5)]   # the teammates waiting at the edge of the box (Sadi, Compote, Kob)


def A(who, clip, x, z, **o):
    return {'who': who, 'look': o.pop('look', LOOK[who]), 'clip': clip, 'x': round(x, 3), 'z': round(z, 3), 'face': o.pop('face', 'world'),
            'yaw': o.pop('yaw', 0), 'at': o.pop('at', 'auto'), **o}
def yaw_to(a, b): return round(math.degrees(math.atan2(b[0] - a[0], b[1] - a[1])), 1)
def kick_mark(who, ball=SPOT):
    """facing the goal (yaw 180), the right boot meets a ball on `ball` at the clip's contact"""
    s = SC[who]; return (round(ball[0] - 0.18 * s, 3), round(ball[1] + 0.28 * s, 3))
def kick(who, contact_s, speed, ball=SPOT, **o):
    """the penalty clip timed so the boot meets the ball contact_s seconds into the shot"""
    at = CONTACT - contact_s * speed
    assert at >= 0, (who, contact_s, speed)
    return A(who, 'male_soccer_penalty_kick', *kick_mark(who, ball), yaw=180, at=round(at, 3), speed=speed, **o)
def rest(ball=SPOT): return [[0, ball[0], BR, ball[1]]]

# ---- a projection check (numbers only): where each face lands in the 9:16 frame at the shot's start and end ----
def _proj(cam, look, fov, pt):
    f = [look[i] - cam[i] for i in range(3)]; n = math.sqrt(sum(v * v for v in f)); f = [v / n for v in f]
    r = [-f[2], 0.0, f[0]]; rn = math.sqrt(r[0] ** 2 + r[2] ** 2) or 1; r = [r[0] / rn, 0.0, r[2] / rn]
    u = [r[1] * f[2] - r[2] * f[1], r[2] * f[0] - r[0] * f[2], r[0] * f[1] - r[1] * f[0]]
    d = [pt[i] - cam[i] for i in range(3)]; z = sum(a * b for a, b in zip(d, f))
    if z <= 0.05: return None
    tv = math.tan(math.radians(fov) / 2); th = tv * 9 / 16
    return (0.5 + sum(a * b for a, b in zip(d, r)) / z / th / 2, 0.5 - sum(a * b for a, b in zip(d, u)) / z / tv / 2)
LINES = [(0.0, 7.89), (7.97, 17.38), (31.94, 36.23), (36.42, 39.87), (40.06, 44.23), (44.43, 47.68), (47.87, 52.59), (52.78, 55.37),
         (55.45, 59.93), (60.13, 64.03), (64.23, 67.71), (67.9, 72.5), (72.69, 75.13), (75.32, 80.39), (80.58, 84.29), (84.49, 87.77),
         (87.97, 92.45), (92.65, 96.59), (97.48, 102.47), (102.66, 107.38), (107.57, 112.31), (113.72, 118.69), (118.88, 122.21), (122.4, 127.89)]
def has_line(b0, b1): return any(a < b1 and b > b0 for a, b in LINES)
WARN = []
def check(beat, b1, lenses, look, fov, actors):
    line = has_line(beat, b1)
    for k, cam in enumerate(lenses):
        end = k == len(lenses) - 1
        for a in actors:
            if a.get('fg'): continue
            x, z = a['x'] + a.get('mx', 0) * end, a['z'] + a.get('mz', 0) * end
            top, face = _proj(cam, look, fov, (x, HEAD[a['who']] + a.get('lift', 0), z)), _proj(cam, look, fov, (x, FACE[a['who']] + a.get('lift', 0), z))
            if not top or not face: WARN.append(f'b{beat}: {a["who"]} behind the lens'); continue
            if line and top[1] < 0.26: WARN.append(f'b{beat}: {a["who"]} head top at {top[1]:.2f} (lyric rows)')
            if face[0] < 0.07 or face[0] > 0.93: WARN.append(f'b{beat}: {a["who"]} face x {face[0]:.2f} (edge){" at the end" if end else ""}')
            if face[1] > 0.8: WARN.append(f'b{beat}: {a["who"]} face y {face[1]:.2f} (low)')

shots = []
def add(beat, b1, actors, lyric, v, lenses, map='final', **o):
    c, focus = v
    s = {'beat': beat, 'kind': 'dance', 'map': map, 'actors': actors, 'lyric': lyric, 'cam': c, 'focus': focus, **o}
    look = (focus[0], c['look'][0], focus[1])
    check(beat, b1, lenses, look, c['fov'], actors)
    shots.append(s)
def lens(v, k=0):   # the camera position at the start (k=0) or the end (k=1) of a view() move
    c, f = v; a = math.radians(c['ang'][k]); return (f[0] + math.sin(a) * c['r'][k], c['h'][k], f[1] + math.cos(a) * c['r'][k])
def L2(v): return [lens(v, 0), lens(v, 1)]

# ================= the hook (K00-K01, b0-16): Compote, taker 1 =================
CM = kick_mark('compote')
# the cold open (the critic, 18/25: a full bar of glare before anything happens): the keeper already spread-eagled in the
# net with the ball on his chest, then the glare and the kick that put him there on 'go'
v = view((0.5, 1.25, -4.3), (0.0, 1.3, -8.4), 46, p1=(0.47, 1.24, -4.4))
add(0, 2, [],
    "HOOK, cold open (K00 'dai'): the keeper, a big bulldog in magenta, spread-eagled in the bulging net with the ball on his chest",
    v, L2(v), ball=[[0, 0, 1.05, -8.3]], net=[-5, 0.0, 0.95, 0.95, True], keeper={'pose': 'blown', 'at': -2.0}, fans='cheer', score=[1, 3], stars=['compote'])
v = low((0.32, 0.5, -1.65), (CM[0], 1.0, CM[1]), (0.2, 0.46, -1.35), fov=58, roll=(-10, -5))
add(2, 4, [A('compote', 'male_soccer_penalty_kick', *CM, yaw=180, at=0.0, speed=0.04)],
    "K00 'dai dai': how it happened: the World Cup final, penalties. Low behind the ball on the spot, looking up at the first taker: Compote, in the yellow kit and a red sweatband, glaring over the ball at the keeper (at the lens)",
    v, L2(v), ball=rest(), keeper={'pose': 'ready'}, score=[0, 3], stars=['compote'])
v = view((2.9, 0.72, 0.55), (-0.15, 0.82, 0.05), 46, p1=(2.85, 0.72, 0.5))
add(4, 8, [kick('compote', 1.74, 0.45)],
    "K00 'go' (b7.35): side on, she smashes it on 'go': the ball flies off her boot towards the goal",
    v, L2(v), ball=[[0, 0, BR, 0], [1.74, 0, BR, 0], [1.84, 0.02, 0.35, -0.8], [2.2, 0.1, 1.05, -6.9]], keeper={'pose': 'ready'}, score=[0, 3], stars=['compote'])
v = view((0.5, 1.25, -4.3), (0.0, 1.3, -8.4), 46, p1=(0.45, 1.23, -4.45))
add(8, 12, [],
    "K01 'dai dai': the keeper, a big bulldog in magenta, is blasted back into the net with the ball in his chest, the net bulging behind him",
    v, L2(v), ball=[[0, 0, 1.2, -6.95], [0.3, 0, 1.05, -8.3]], net=[0.28, 0.0, 0.95, 0.95, True], keeper={'pose': 'blown', 'at': 0.02}, fans='cheer', score=[1, 3], stars=['compote'])
v = low((0.55, 0.3, 2.5), (-0.1, 0.78, 0.25), (0.42, 0.26, 2.0), fov=62, roll=(-9, -5))
add(12, 16, [A('compote', 'gangnam', -0.1, 0.25, face='camera', at=1.1)],
    "K01 'go': Compote's victory dance is as furious as her kick (the horse stance, glaring); behind her the keeper hangs in the bulging net",
    v, L2(v), ball=[[0, 0, 0.9, -8.9]], net=[-5, 0.0, 0.95, 0.95, True], keeper={'pose': 'blown', 'at': -2.0}, score=[1, 3], stars=['compote'])

# ================= the instrumental break (b16-32): Sadi, taker 2 =================
v = low((1.25, 0.22, 3.7), (0.35, 0.72, 1.15), (0.95, 0.22, 2.95), fov=62, roll=(-10, -6))
add(16, 20, [A('sadi', 'charleston', 0.35, 1.15, face='camera', at=0.6)],
    "instrumental: Sadi's run-up is a dance: the charleston towards the spot, low on the grass, the goal and the keeper (back on his line) behind her",
    v, L2(v), ball=rest(), keeper={'pose': 'ready'}, score=[1, 3], stars=['sadi'])
SM = kick_mark('sadi')
v = low((1.15, 0.28, 3.3), (0.2, 0.8, 0.9), (0.95, 0.26, 2.8), fov=62, roll=(-8, -4))
add(20, 24, [A('sadi', 'charleston', 0.2, 0.9, face='camera', at=0.6)],
    "instrumental: she turns on the charm: dancing the charleston at the keeper, pink hearts rising over her head",
    v, L2(v), ball=rest(), keeper={'pose': 'ready', 'hide': True}, kiss=[0.2, 0.2, 1.15, 0.7, 0.35, 2.3, 0.3], score=[1, 3], stars=['sadi'])
v = deadpan(KEEP, 1.12, 3.9, cam_y=1.15, fov=40)
add(24, 28, [],
    "instrumental (deadpan): the keeper melts: gloves on his heart, hearts popping over his head, down on his knees",
    v, [lens(v, 0)], ball=rest(), keeper={'pose': 'swoon', 'at': 0.0}, score=[1, 3], stars=['sadi'])
v = view((5.2, 1.2, -3.9), (0.3, 1.1, -6.8), 50, p1=(5.1, 1.2, -4.0))
add(28, 32, [],
    "instrumental: side on at the goal: her chip loops gently over the kneeling keeper, hearts still over his head, into the net",
    v, L2(v), ball=[[0, 0, BR, 0], [0.45, 0, BR, 0], [1.45, 0.7, 1.0, -8.6, 1.5]], net=[1.45, 0.7, 1.0, 0.35, 0.6], keeper={'pose': 'swoon', 'at': -2.0}, fans='cheer', score=[2, 3], stars=['sadi'])

# ================= verse 1 (K02-K10, b32-68): Kob, taker 3, then Saxo steps up =================
v = deadpan(KEEP, 1.12, 3.9, cam_y=1.15, fov=40)
add(32, 36, [],
    "K02 'come' (b31.9, on the cut): the keeper, back on his feet and fired up, beckons the next one: come on",
    v, [lens(v, 0)], ball=rest(), keeper={'pose': 'beckon'}, fans='cheer', score=[2, 3], stars=['kob'])
K0 = (1.55, 2.05)
KM = kick_mark('kob')
v = view((-1.3, 0.95, -1.6), (0.6, 0.8, 1.3), 52, p1=(-1.25, 0.95, -1.5))
add(36, 40, [A('kob', 'happy_walk', *K0, yaw=yaw_to(K0, KM), at=0.0, speed=0.55, mx=round(KM[0] - K0[0] + 0.05, 3), mz=round(KM[1] - K0[1] + 0.35, 3), hold='milk')],
    "K03: Kob strolls up to the spot sipping her milk carton, in no hurry at all",
    v, L2(v), ball=rest(), keeper={'pose': 'beckon'}, score=[2, 3], stars=['kob'])
v = view((0.25, 1.15, 0.9), (0.0, 1.0, -7.6), 40, p1=(0.22, 1.13, 0.6))
add(40, 44, [],
    "K04 'fire' (b42.9): from the spot: on 'fire' the red flares light up in the stand behind the goal, the fans roar, the keeper bounces on his line, all fired up",
    v, L2(v), ball=rest(), keeper={'pose': 'ready'}, flares=S(42.9 - 40), fans='cheer', score=[2, 3], stars=['kob'])
v = view((2.9, 0.72, 0.55), (-0.15, 0.82, 0.05), 46, p1=(2.85, 0.72, 0.5))
add(44, 48, [kick('kob', 0.5, 0.5, hold='milk')],
    "K05: side on: no run-up, the milk still in her paw, she toe-pokes it (the keeper dives full stretch the wrong way, off screen)",
    v, L2(v), ball=[[0, 0, BR, 0], [0.5, 0, BR, 0], [2.07, -0.4, BR, -3.25]], keeper={'pose': 'dive', 'at': 0.55, 'dir': 1}, flares=-5, fans='gasp', score=[2, 3], stars=['kob'])
v = view((0.6, 1.15, -1.4), (0.7, 0.3, -7.0), 56, p1=(0.6, 1.12, -1.6))
add(48, 52, [],
    "K06: low behind the ball: it trickles slowly, slowly into the left corner while the keeper lies on the grass on the right, his head turned to watch it go by",
    v, L2(v), ball=[[0, -0.4, BR, -3.25], [2.0, -0.7, BR, -7.85]], net=[2.05, -0.75, 0.3, 0.12, 0.5], keeper={'pose': 'dive', 'at': -3.0, 'dir': 1}, flares=-5, fans='gasp', score=[2, 3], stars=['kob'])
KD = (0.0, 0.65)
v = deadpan(KD, 0.86, 3.2, cam_y=0.97, fov=48)
add(52, 56, [A('kob', 'bored_idle', *KD, face='camera', at=0.5, speed=0.4, hold='milk'),
             A('sadi', 'charleston', -0.75, -0.9, face='camera', at=0.6),
             A('compote', 'gangnam', 0.75, -1.0, face='camera', at=0.3)],
    "K07 (deadpan): Kob walks off without even looking back, sipping; behind her the ball is in the net, Sadi and Compote dance",
    v, [lens(v, 0)], ball=[[0, -1.1, BR, -7.9]], keeper={'pose': 'dive', 'at': -5.0, 'dir': 1}, fans='cheer', score=[3, 3], stars=['kob'])
v = low((1.1, 0.2, 3.35), (0.15, 0.8, 0.95), (0.85, 0.2, 2.7), fov=62, roll=(-8, -4))
add(56, 60, [A('saxo', 'shimmy', 0.15, 0.95, face='camera', at='auto')],
    "K08: the captain's turn: Saxo, number 10 with the armband, shimmies up to the spot, playing to the crowd",
    v, L2(v), ball=rest(), keeper={'pose': 'ready'}, fans='cheer', score=[3, 3], stars=['saxo'])
W0 = (0.1, 0.75)
v = view((3.8, 0.85, 1.1), (0.05, 0.8, 1.05), 56, p1=(3.75, 0.85, 1.15))
add(60, 64, [A('saxo', 'happy_walk', *W0, yaw=0, at=0.0, speed=0.9, mz=0.95)],
    "K09 'step' (b61.7): he sets it down, turns his back on the goal and struts away for his run-up: one step, two...",
    v, L2(v), ball=rest(), keeper={'pose': 'wait'}, score=[3, 3], stars=['saxo'])
W1 = (-1.55, 3.2)
v = view((-3.0, 1.0, 0.6), (-3.0, 0.85, 4.5), 50, p1=(-3.0, 1.0, 0.8))
add(64, 68, [A('sadi', 'being_surprised_and_looking_right', *WAIT_SPOT[0], face='camera', at=0.6),
             A('compote', 'bored_idle', *WAIT_SPOT[1], face='camera', at=0.8, speed=0.5),
             A('kob', 'bored_idle', *WAIT_SPOT[2], face='camera', at=1.3, speed=0.5, hold='milk')],
    "K10: his three teammates watch him go, off past the halfway line: Sadi turns to stare after him, Compote glares, Kob holds her milk",
    v, L2(v), ball=rest(), keeper={'pose': 'wait'}, score=[3, 3], stars=['saxo'])

# ================= chorus 1 (K11-K23, b68-128): the run-up round the world =================
T0, T1 = (TUNNEL[0] + 4.2, TUNNEL[1] - 0.1), (TUNNEL[0] + 1.25, TUNNEL[1])
v = view((TUNNEL[0] + 7.6, 1.05, TUNNEL[1] + 1.4), (TUNNEL[0] + 1.6, 0.95, TUNNEL[1]), 50, p1=(TUNNEL[0] + 7.3, 1.05, TUNNEL[1] + 1.3))
add(68, 72, [A('saxo', 'happy_walk', *T0, yaw=-90, at=0.0, speed=0.9, mx=round(T1[0] - T0[0], 3), mz=0.1)],
    "K11: his run-up walk takes him right across the pitch and into the players' tunnel: out of the stadium",
    v, L2(v), noBall=True, keeper={'hide': True}, score=[3, 3], stars=['saxo'])
v = view((0.0, 1.0, 4.8), (0.0, 0.9, 0.0), 56, p1=(0.15, 1.0, 4.6))
add(72, 76, [A('saxo', 'happy_run', -0.7, 0.0, yaw=90, at=0.0, speed=1.0, mx=1.4)],
    "K12: his run-up has begun, far away: he runs past the pyramids, still in his kit",
    v, L2(v), map='pyramids', stars=['saxo'])
v = view((0.1, 0.35, 2.4), (0.0, 0.95, -7.25), 24, p1=(0.1, 0.35, 2.2))
add(76, 80, [],
    "K13 (deadpan): back at the final, the keeper waits... and waits... and starts grooving on his line; the ball alone on the spot",
    v, [lens(v, 0)], ball=rest(), keeper={'pose': 'dance'}, score=[3, 3], stars=['saxo'])
v = view((0.0, 1.0, 4.8), (0.0, 0.9, 0.0), 56, p1=(-0.15, 1.0, 4.6))
add(80, 84, [A('saxo', 'charleston', 0.6, 0.0, face='camera', at=0.6, mx=-1.2)],
    "K14: the run-up dances through Tokyo's neon (the charleston)",
    v, L2(v), map='tokyo', stars=['saxo'])
v = view((0.0, 1.05, 4.8), (0.0, 0.9, 0.0), 56, p1=(0.15, 1.05, 4.6))
add(84, 88, [A('saxo', 'charleston', -0.6, 0.0, face='camera', at=0.6, mx=1.2)],
    "K15: the run-up dances through the snow (the charleston)",
    v, L2(v), map='snow', stars=['saxo'])
v = deadpan(KEEP, 0.78, 3.4, cam_y=0.55, fov=40)
add(88, 92, [],
    "K16 'dream' (b90.3): the keeper has fallen asleep sitting on his line, a snot bubble breathing at his nose: dreaming",
    v, [lens(v, 0)], ball=rest(), keeper={'pose': 'sleep'}, fans='sleep', score=[3, 3], stars=['saxo'])
v = view((0.0, 0.8, 10.5), (0.0, 0.4, 0.0), 38, p1=(0.25, 0.8, 10.2))
add(92, 96, [A('saxo', 'happy_run', 0.0, 0.0, yaw=90, at=0.1)],
    "K17 'top' (b93.2): he runs round the top of the world: a tiny Earth turning under his boots in space, landmarks going by",
    v, L2(v), map='globe', spin=0.55, stars=['saxo'])
v = view((0.0, 1.1, 6.0), (0.3, 1.5, 0.0), 54, p1=(0.2, 1.1, 5.7))
add(96, 100, [A('saxo', 'charleston', -0.35, 1.2, face='camera', at=0.6, mx=0.9)],
    "K18: past the giant baobab at dusk, where the kids playing barefoot football cheer him on",
    v, L2(v), map='baobab', kids='cheer', stars=['saxo'])
B0 = (TUNNEL[0] + 1.1, TUNNEL[1])
v = view((TUNNEL[0] + 6.5, 0.8, TUNNEL[1] - 2.6), (TUNNEL[0] + 2.6, 0.9, TUNNEL[1]), 52)
add(100, 104, [A('saxo', 'happy_run', *B0, yaw=90, at=0.3, speed=1.0, mx=2.3, reveal=0.4)],
    "K19: sunrise over the stadium: he bursts out of the tunnel at full sprint",
    v, L2(v), noBall=True, keeper={'hide': True}, dawn=1, score=[3, 3], stars=['saxo'])
R0 = (kick_mark('saxo')[0], 4.0)
v = view((4.2, 0.5, 1.4), (0.0, 0.62, 1.2), 60, p1=(4.15, 0.5, 1.35))
add(104, 110, [A('saxo', 'happy_run', *R0, yaw=180, at=0.15, speed=1.1, mz=-3.1, reveal=1.6)],
    "K20: side on, low: his last strides thunder in towards the ball on the spot",
    v, L2(v), ball=rest(), keeper={'pose': 'sleep'}, dawn=1, score=[3, 3], stars=['saxo'])
v = view((3.1, 0.42, 0.55), (-0.1, 0.72, 0.2), 50, p1=(3.0, 0.42, 0.5))
add(110, 114, [kick('saxo', S(2), 0.75)],
    "K20 (the drop's downbeat, b112): side on, he smashes it with everything",
    v, L2(v), ball=[[0, 0, BR, 0], [S(2), 0, BR, 0], [S(2) + 0.12, -0.05, 0.35, -0.9], [S(2) + 0.4, -0.3, 1.0, -5.5, 0.2]], keeper={'pose': 'sleep'}, dawn=1, score=[3, 3], stars=['saxo'])
v = view((1.35, 1.05, -3.3), (-0.5, 1.0, -8.2), 54, p1=(1.25, 1.05, -3.45))
add(114, 118, [],
    "K21 'dai dai' (b113.8): the ball rockets past the sleeping keeper into the top corner, the net bulging; he wakes with a jolt and turns to find it behind him",
    v, L2(v), ball=[[0, 0.3, 1.25, -3.0], [0.24, -1.9, 1.5, -8.95]], net=[0.24, -1.9, 1.5, 0.75, True], keeper={'pose': 'wake', 'at': 0.32, 'look': 2.4}, dawn=1, fans='cheer', score=[4, 3], stars=['saxo'])
v = low((0.35, 0.3, 3.35), (0.0, 0.85, 0.3), (0.3, 0.28, 3.1), fov=62, roll=(-8, -4))
add(118, 122, [A('saxo', 'high_enthusiasm_fist_pump', 0.0, 0.3, face='camera', at=0.05),
               A('sadi', 'charleston', -0.62, -0.1, face='camera', at=0.6),
               A('compote', 'gangnam', 0.62, -0.15, face='camera', at=0.3)],
    "K22: 4-3, the World Cup is won: Saxo celebrates, Sadi and Compote pile in dancing, confetti everywhere",
    v, L2(v), ball=[[0, -1.9, 1.0, -8.9]], net=[-5, -1.9, 1.5, 0.75, True], keeper={'pose': 'sad'}, dawn=1, confetti=True, fans='cheer', score=[4, 3], stars=['saxo', 'sadi'])
v = reveal((0.0, 1.25, 2.6), (0.0, 1.05, -0.2), (0.6, 2.4, 7.4), fov=58, ly1=1.45)
add(122, 128, [A('saxo', 'samba', -0.55, 0.0, face='camera', at='auto'),
               A('sadi', 'charleston', -1.5, -0.35, face='camera', at=0.7, reveal=1.4),
               A('compote', 'gangnam', 0.45, -0.35, face='camera', at=1.2),
               A('kob', 'bored_idle', 1.45, 0.1, face='camera', at=0.5, speed=0.4, hold='milk', reveal=1.2)],
    "K23: the payoff wide at sunrise: fireworks over the stadium, the three of them dancing the song on the pitch... and Kob, unimpressed, sipping her milk",
    v, L2(v), ball=[[0, -1.9, 1.0, -8.9]], keeper={'pose': 'sad'}, dawn=1, confetti=True, fw=0.0, fwY=5, fwZ=-22, fwR=6.5, fans='cheer', score=[4, 3], stars=['saxo', 'sadi'])

ep = {
    'date': '2026-09-28-4', 'n': 4,
    'song': {'title': 'Dai Dai', 'artist': 'Shakira & Burna Boy'},
    'logline': "World Cup final, penalties: Compote blasts the keeper into the net, Sadi's kiss melts him, Kob pokes it in sipping her milk... and Saxo's run-up goes round the world, so long the keeper falls asleep",
    'with': ['sadi', 'kob', 'compote'],
    'clips': sorted({a['clip'] for s in shots for a in s['actors']} - {'charleston', 'shimmy', 'samba', 'gangnam', 'shuffle', 'running_man'}),
    'tags': {'structure': 'line-up', 'scenes': ['penalty', 'keeper', 'world tour'], 'cast': ['saxo', 'sadi', 'kob', 'compote'], 'hook': 'action',
             'maps': ['final', 'globe', 'baobab', 'pyramids', 'tokyo', 'snow'], 'ref': 'spicy-lineup', 'lyric_literal': 'top (running on top of the world)',
             'experiment': "Does a line-up ('who took it best?': one test, the four in turn, each in character) on a sports moment everyone knows get more comments per 1,000 views than our story episodes?"},
    'notes': ("The clip: dancers before a giant baobab at dusk, kids' barefoot football on a village's dirt pitch, a troupe on a stadium "
              "pitch under floodlights, the singer on top of the Earth in space, fireworks. Ours keeps the stadium, the baobab, the Earth "
              "and the fireworks; the singer's looks aren't copied (the team kit instead). The whole cast plays: the three takes are "
              "GAGS 3 (Compote violent, Sadi the romance, Kob can't be bothered and still wins), Saxo the diva with the absurd run-up. "
              "His win (for once) is the payoff, not a punishment; no dead stop: the song runs to the chorus's end."),
    'shots': shots,
}
out = os.path.join(os.path.dirname(__file__), '2026-09-28-4.json')
json.dump(ep, open(out, 'w'), indent=1)
print(f'{len(shots)} shots, the last from b{shots[-1]["beat"]} to b128 ({END} s); clips: {", ".join(ep["clips"])}')
for w in WARN: print('WARN', w)
