# make_2026-09-26-2.py: writes episodes/2026-09-26-2.json, "Voyage Voyage (Techno)" (Hyper Duck), from the user's queue:
# "don't follow any clip; make an airplane map, and use the paris and beach maps: it goes with the voyage".
# "The spot thief": the squad's holiday by plane, Paris and the beach, and Saxo takes Compote's spot at every stop:
# her window seat (she ends up squeezed in the middle next to Kob, who never looks up from her phone, and the turbulence
# spills his juice on her head), her Eiffel Tower selfie (he and Sadi, the flight attendant, photobomb it), the only
# daybed in the shade (he flops onto it on the drop and the party starts there). The fourth time he leaps into her giant
# rubber-duck float... and she shoves it out to sea. He waves, delighted, as it drifts off, and she finally celebrates on
# her daybed. Button: the flight home, Compote in her window seat with a drink, the middle seat empty (Kob never got off
# the plane); far out at sea, Saxo in the duck float waves at the plane flying away high above.
# Beats count from B0 = 0.040 s at 150 BPM (cut time = 0.04 + b * 0.4 s; a bar = 4 beats = 1.6 s); the cut is the song's
# first 62.44 s (episodes/2026-09-26-2.config.js). Lyric lines are named by number (L00-L14, see
# episodes/2026-09-26-2.lyrics.js): the lyrics stay in their files. L00-L07 verse 1 (0.00-23.76), L08-L10 the
# pre-chorus (23.86-33.44), the near-silent bar b84-b88, the drop at b88 (35.24) with L11-L14 (35.12-49.21), then the
# drop runs instrumental to b148 (59.24) and the break's stabs fade out to the end at b156 (62.44).
import json, math, os

B0, P = 0.04, 60 / 150.0
T = lambda b: round(B0 + b * P, 3)                 # beat -> cut seconds
END = 62.44
# ---- the plane (src/maps8.js PLANE): row 0 on the left side, seats facing the nose (-z) ----
SEAT = 0.28
XW, XM, XA = -2.25, -1.55, -0.85                   # window, middle, aisle seat centres (left side)
ZS = -1.87                                         # a sitter's mark in row 0 (the clip's hips sit 0.05 m ahead of it)
WIN = (-2.95, 0.97, -2.12)                         # row 0's window on the shell
# ---- the beach (src/ps1.js BEACH) ----
BED = 0.3; SB = (-0.7, -4.2); DUCK = (0.6, -11.2); KOBT = (-2.95, -5.0); SEA = -0.05
LOOK = {'saxo': 'tourist', 'sadi': 'hostess', 'kob': 'kob', 'compote': 'compote'}             # the plane and Paris
BEACHLOOK = {'saxo': 'beach', 'sadi': 'beach', 'kob': 'kob', 'compote': 'beach'}              # (Kob never gets off the plane)

def A(who, clip, x=0, z=0, beach=False, **o):
    look = (BEACHLOOK if beach else LOOK)[who]
    return {'who': who, 'look': o.pop('look', look), 'clip': clip, 'x': round(x, 3), 'z': round(z, 3), **o}
def seat(who, x, clip, z=ZS, **o):                  # seated in row 0, facing the nose
    return A(who, clip, x, z, face='world', yaw=o.pop('yaw', 180), lift=o.pop('lift', SEAT), **o)
def kob_phone(x=XA, z=ZS, **o):                     # Kob in the aisle seat, on her phone the whole trip: she never looks up (or gets off)
    return seat('kob', x, 'gaming', z, at=o.pop('at', 1.6), speed=0.25, hold='phone', star=False, **o)
def B(who, clip, x, z, **o): return A(who, clip, x, z, beach=True, **o)
def view(p0, l, fov=50, p1=None, ly1=None, ease=None, fy=0.0, **o):
    """A camera at p0 = (x, y, z) looking at l = (x, y, z), moving to p1 by the cut (the look point's height to ly1).
    The engine's camera is polar round the shot's focus: focus = the look point on the floor, ang/r from the offset."""
    def polar(p): dx, dz = p[0] - l[0], p[2] - l[2]; return round(math.degrees(math.atan2(dx, dz)), 2), round(math.hypot(dx, dz), 3), round(p[1] - fy, 3)
    a0, r0, h0 = polar(p0); a1, r1, h1 = polar(p1 or p0)
    c = {'ang': [a0, a1], 'r': [r0, r1], 'h': [h0, h1], 'look': [round(l[1] - fy, 3), round((ly1 if ly1 is not None else l[1]) - fy, 3)], 'fov': fov, **o}
    if ease: c['ease'] = ease
    return c, [l[0], l[2]] + ([fy] if fy else [])
def shot(beat, map_, actors, lyric, v, **o):
    c, focus = v
    return {'beat': beat, 'kind': 'dance', 'map': map_, 'actors': actors, 'lyric': lyric, 'cam': c, 'focus': focus, **o}
FRONT = view((-1.5, 1.25, -5.9), (-1.55, 0.95, -1.95), 54, p1=(-1.5, 1.22, -5.65))           # row 0 from the galley
HEAD_C = (XM, SEAT + 1.0, ZS - 0.05)                                                        # the top of Compote's head in the middle seat
shots = [
  # ================= the flight out: verse 1 (L00-L03) =================
  shot(0, 'plane', [seat('saxo', XW, 'celebrating_after_a_win_while_seated'), kob_phone(),
                    A('compote', 'angry_forward_gesture', -0.45, -2.95, face='world', yaw=150, hold='ticket', arm='R', aim=[0.3, 0.5, 0.8], upAt=0.15)],
       "L00 (0.00-, hook): Compote glares at us, holding up her boarding pass: behind her, Saxo celebrates in HER window seat, the window right there; Kob on her phone",
       view((0.55, 1.3, -4.9), (-1.45, 1.0, -2.15), 58, p1=(0.5, 1.28, -4.7)), stars=['compote', 'saxo']),
  shot(4, 'plane', [],
       "L00 (-3.18, the volcanoes held from 1.10): outside, our airliner over the volcanoes: the one behind it blows lava up",
       view((-46, -12.0, -22), (0, -3.0, 2.0), 50, p1=(-44, -11.4, -20.5)), erupt=1.9, stars=['saxo']),
  shot(8, 'plane', [],
       "L01 (3.28-6.31, the wings at 3.74): from above, the airliner glides on its wings over the clouds",
       view((-17, 9.0, -11), (-3, -0.5, 4.0), 50, p1=(-16, 8.6, -10)), stars=['saxo']),
  shot(12, 'plane', [seat('saxo', XW, 'clap_while_seated'), seat('compote', XM, 'sitting_talking', speed=0.8), kob_phone()],
       "L01 (-6.31) + L02 (6.46-8.68, the title): Compote squeezed into the middle seat, complaining; Saxo claps along on each word; Kob never looks up",
       FRONT, stars=['saxo', 'compote']),
  shot(20, 'plane', [seat('saxo', XW, 'celebrating_after_a_win_while_seated', at=1.5), seat('compote', XM, 'sitting_talking', at=8.0, speed=0.15), kob_phone()],
       "L03 (8.90-11.32, held): the flight goes on forever: Saxo's arms flailing next to her, Compote suffering in the middle",
       view((0.6, 1.35, -4.35), (-1.5, 0.92, -1.9), 54, p1=(0.55, 1.32, -4.15), ease='lin'), stars=['compote']),
  shot(28, 'plane', [],
       "(11.24-12.84) the airliner cruising over a sea of clouds, volcano peaks smoking through it",
       view((22, 6.0, 30), (0, 0.5, 0), 46, p1=(21, 5.6, 28)), stars=['saxo']),
  # ================= verse 1b (L04-L07) =================
  shot(32, 'plane', [A('sadi', 'happy_walk', 0.05, 1.3, mz=-2.4, speed=0.9, face='world', yaw=180)],
       "L04 (12.94-15.85): Sadi, the flight attendant, comes down the aisle with the drinks trolley",
       view((0.3, 1.9, -5.6), (-0.2, 0.9, -0.8), 52, p1=(0.28, 1.85, -5.3)), trolley=[0.75, -1.65], stars=['sadi']),
  shot(40, 'plane', [seat('saxo', XW, 'clap_while_seated', hold='glass', bump=0.07), seat('compote', XM, 'sitting_talking', at=3.0, bump=0.07), kob_phone(bump=0.05)],
       "L05 (16.22-, the wind at 16.30): turbulence: the cabin jolts on every beat, everyone bounces; Saxo got the juice",
       FRONT, bumpy=True, jolt=True, trolley=[-1.65, -1.65], stars=['saxo']),
  shot(42, 'plane', [seat('saxo', XW, 'celebrating_after_a_win_while_seated', at=0.8, hold='glass', holdTo=0.25, toss={'at': 0.25, 'to': [HEAD_C[0], HEAD_C[1], HEAD_C[2]], 'dur': 0.4, 'arc': 0.35}, bump=0.07),
                     seat('compote', XM, 'sitting_talking', at=12.0, speed=0.3, hat='juicehat', hatFrom=0.65, bump=0.07)],
       "L05 (-19.01, the rain at 17.10): a bump sends his juice flying: it rains down on Compote and the glass lands upside down on her head, dripping",
       view((-1.9, 1.5, -4.9), (-1.9, 1.15, -1.95), 52), bumpy=True, jolt=True, stars=['compote']),
  shot(48, 'plane', [A('saxo', 'hip_hop_dancing_side_to_side', -0.22, -0.6, face='camera', bump=0.05), A('sadi', 'female_hip_hop_body_wave_dancing', 0.3, 0.95, face='camera', bump=0.05)],
       "L06 (19.88-21.36, the title): Saxo and Sadi dance down the aisle through the turbulence, the pet passengers bouncing in their rows",
       view((0.25, 1.5, -4.6), (0.1, 0.95, 1.0), 52, p1=(0.25, 1.45, -4.1)), bumpy=True, jolt=True, stars=['saxo', 'sadi']),
  shot(53, 'plane', [],
       "L07 (21.46-23.76, 'fly' at 21.46, the heights at 22.14): the airliner pulls up and climbs out of the clouds",
       view((-30, 3.0, 44), (0, 1.5, 2), 50, p1=(-29, 3.2, 42)), climb=14, stars=['saxo']),
  # ================= Paris: the pre-chorus (L08-L10) =================
  shot(60, 'paris', [],
       "L08 (23.86-, the capitals at 24.94): Paris at blue hour: our airliner passes over the golden Eiffel Tower",
       view((0.5, 1.4, 4.0), (0, 22, -100), 50, p1=(0.4, 1.3, 3.2)), jet=[-62, 31, -120, 48, 35, -110], stars=['saxo']),
  shot(64, 'paris', [A('compote', 'happy_idle', 0.3, -7.7, face='camera', hold='phone', arm='R', aim='phone', upAt=0.0)],
       "L08 (-27.86): at the Trocadéro, Compote lines up her selfie with the tower (as grumpy as ever)",
       view((0.35, 1.05, -6.0), (0.3, 1.35, -7.7), 55, p1=(0.33, 1.05, -5.9)), stars=['compote']),
  shot(68, 'paris', [A('compote', 'happy_idle', 0.3, -7.55, face='camera', hold='phone', arm='R', aim=[0.45, 0.45, 0.75], upAt=0.0, at=1.0),
                     A('saxo', 'big_vegas_pointing_gesture', 0.95, -7.95, face='camera', at=0.4), A('sadi', 'blowing_a_kiss', -0.4, -8.05, face='camera', at=0.3)],
       "L09 (27.96-30.84, 'ideas' at 28.08): the fatal idea: Saxo and Sadi pop up on both sides of her selfie, posing, her phone up in front of them",
       view((0.3, 1.35, -4.3), (0.3, 1.25, -7.8), 56), stars=['saxo', 'sadi']),
  shot(76, 'paris', [A('saxo', 'happy_idle', 0.3, -7.0, face='camera', arm='R', aim=[0.62, 0.55, 0.56], upAt=0.3), A('sadi', 'happy_idle', 1.1, -7.35, face='camera', at=1.0)],
       "L10 (30.94-, 'look' at 30.94): Saxo points far away, past us: the ocean",
       view((0.6, 1.15, -4.1), (0.6, 1.1, -7.1), 52), stars=['saxo']),
  shot(80, 'beach', [B('saxo', 'high_enthusiasm_fist_pump', -0.2, -9.8, face='camera'), B('sadi', 'super_excited', 0.75, -9.6, face='camera', at=0.3)],
       "L10 (-33.44, 'the ocean' at 32.06): the beach! Saxo and Sadi at the water's edge, thrilled, the ocean behind them",
       view((0.5, 1.15, -5.6), (0.25, 1.1, -9.8), 52, p1=(0.45, 1.12, -6.0)), stars=['saxo', 'sadi']),
  # ================= the near-silent bar, then the drop (L11-L14) =================
  shot(84, 'beach', [B('compote', 'happy_walk', 0.9, -1.6, mx=-1.0, mz=-1.2, face='world', yaw=-140)],
       "(33.64-35.24, near silence) Compote walks up to the only daybed in the shade, finally",
       view((-0.6, 1.2, -7.6), (0.2, 0.8, -3.0), 52), sunbed=True, towels=True, still=True, stars=['compote']),
  shot(88, 'beach', [B('saxo', 'laying_idle', SB[0], SB[1] - 0.1, face='world', yaw=180, lift=BED + 0.45, my=-0.45, myAt=0, myDur=0.18, ground='mesh', at=1.0, speed=0.4)],
       "L11 (35.12-36.97, the drop, the title): on the drop Saxo flops onto the daybed first",
       view((SB[0] + 0.1, 2.9, SB[1] - 2.4), (SB[0], 0.35, SB[1] + 0.55), 50), sunbed=True, towels=True, stars=['saxo']),
  shot(92, 'beach', [B('compote', 'pointing_behind_with_thumb', 0.4, -2.2, face='camera', at=0.2), B('saxo', 'booty_step', SB[0], SB[1], face='camera', lift=BED)],
       "(36.84-38.44) Compote, to us: HIM. Her thumb jabs back at him, already dancing on HER daybed",
       view((1.2, 1.0, 0.6), (0.0, 1.0, -3.0), 50), sunbed=True, towels=True, stars=['compote']),
  shot(96, 'beach', [B('saxo', 'hip_hop_dancing_side_to_side', SB[0], SB[1], face='camera', lift=BED), B('sadi', 'hip_hop_dancing_side_to_side', SB[0] + 1.15, SB[1] + 0.3, face='camera', at=0.6)],
       "L12 (38.26-): the beach party starts on the daybed, Sadi dancing with him",
       view((0.0, 1.2, 0.2), (-0.1, 1.0, -4.1), 50), sunbed=True, towels=True, stars=['saxo', 'sadi']),
  shot(98, 'paris', [A('saxo', 'hip_hop_dancing_side_to_side', -0.35, -7.2, face='camera'), A('sadi', 'hip_hop_dancing_side_to_side', 0.65, -7.0, face='camera', at=0.6)],
       "L12 ('night' at 39.49): flash: the same dance at night, under the sparkling tower",
       view((0.1, 1.2, -3.1), (0.15, 1.3, -7.1), 50), stars=['saxo', 'sadi']),
  shot(100, 'beach', [B('saxo', 'hip_hop_dancing_side_to_side', SB[0], SB[1], face='camera', lift=BED, at=0.8), B('sadi', 'hip_hop_dancing_side_to_side', SB[0] + 1.15, SB[1] + 0.3, face='camera', at=1.4)],
       "L12 ('day' at 40.16, -43.28): back to day: the party rages on her daybed",
       view((0.9, 1.15, 0.1), (0.0, 1.0, -4.0), 52, p1=(0.6, 1.15, -0.2)), sunbed=True, towels=True, stars=['saxo', 'sadi']),
  shot(108, 'beach', [B('saxo', 'male_salsa_variation_eight', SB[0] - 0.3, SB[1], face='world', yaw=55, lift=BED), B('sadi', 'female_salsa_dancing', SB[0] + 0.4, SB[1] + 0.05, face='world', yaw=-55, lift=BED)],
       "L13 (43.38-47.24, 'love' at 46.14): the love line: Saxo and Sadi salsa together on her daybed, the camera circling them",
       view((SB[0] + 0.9, 1.5, SB[1] + 3.1), (SB[0] + 0.05, 1.25, SB[1]), 50, p1=(SB[0] - 1.0, 1.45, SB[1] + 3.0), ease='lin'), sunbed=True, towels=True, stars=['saxo', 'sadi']),
  shot(118, 'beach', [B('saxo', 'ymca', SB[0], SB[1], face='camera', lift=BED), B('sadi', 'ymca', SB[0] + 1.35, SB[1] + 0.3, face='camera')],
       "L14 (47.34-49.21, the title): back up and on the beat, the two of them on her daybed",
       view((-1.4, 1.3, 1.0), (-0.1, 1.0, -3.4), 54), sunbed=True, towels=True, stars=['saxo', 'sadi']),
  # ================= the drop, instrumental: the duck float (b124-b148) =================
  shot(124, 'beach', [B('compote', 'happy_walk', 1.6, -8.4, mx=-0.7, mz=-2.0, face='world', yaw=-160)],
       "(49.64-51.24) she gives up on the daybed: her giant rubber duck waits at the water's edge",
       view((1.9, 0.9, -5.6), (0.8, 0.6, -10.4), 50), duck=[DUCK[0], DUCK[1], 3.0], sunbed=True, towels=True, stars=['compote']),
  shot(128, 'beach', [B('saxo', 'jumping_forward', 2.6, -11.1, mx=-1.6, face='world', yaw=-90, air=True, at=0.2),
                      B('compote', 'being_surprised_and_looking_right', 0.3, -10.3, face='world', yaw=120)],
       "(51.24-52.84) before she gets there, Saxo leaps in from the side, straight for her duck",
       view((1.4, 1.2, -6.0), (1.2, 0.7, -10.8), 58), duck=[DUCK[0], DUCK[1], 3.14], stars=['saxo']),
  shot(132, 'beach', [B('saxo', 'sitting_talking', DUCK[0], DUCK[1] - 0.3, face='world', yaw=190, lift=0.12, ride='duck', rideY=SEA, at=3.0),
                      B('compote', 'bored_idle', 1.3, -10.1, face='world', yaw=200)],
       "(52.84-54.44) in her duck float, lounging against its neck, delighted with himself; behind him Compote goes very still",
       view((1.2, 1.2, -14.3), (0.6, 0.8, -11.4), 50), stars=['saxo']),
  shot(136, 'beach', [B('compote', 'male_front_snap_kick_with_the_lead_foot', 0.75, -10.3, face='world', yaw=180, at=0.5),
                      B('saxo', 'celebrating_after_a_win_while_seated', 0.75, -11.1, mz=-0.9, moveAt=0.5, face='world', yaw=90, lift=0.12, ride='duck', rideY=SEA, at=2.0)],
       "(54.44-56.04) she doesn't yell this time: one shove into the float and it's off",
       view((3.9, 0.75, -10.7), (0.75, 0.55, -10.8), 52, p1=(5.4, 0.85, -11.1)), stars=['compote']),   # pulls back as the float shoots off
  shot(140, 'beach', [B('compote', 'bored_idle', 0.9, -10.4, face='world', yaw=180),
                      B('saxo', 'waving_someone_over_while_seated', 0.6, -13.5, mz=-9.0, face='world', yaw=15, lift=0.12, ride='duck', rideY=SEA)],
       "(56.04-57.64) out to sea he goes, waving at her, delighted: he hasn't got it yet",
       view((1.6, 1.25, -7.4), (0.6, 0.7, -14.5), 50), stars=['saxo']),
  shot(144, 'beach', [B('compote', 'celebrating_after_a_win_while_seated', SB[0], SB[1] - 0.3, face='world', yaw=0, lift=BED),
                      B('saxo', 'happy_idle', 0.9, -30, face='world', yaw=10, lift=-0.12, ride='duck', rideY=SEA, arm='both', aim=[0.42, 0.86, 0.3], wave=0.35, upAt=0.1)],
       "(57.64-59.24) Compote, at last on her daybed, celebrates; far behind her at sea, a tiny duck float, and him waving for help",
       view((SB[0] + 0.3, 1.1, SB[1] + 2.4), (SB[0], 0.95, SB[1] - 0.3), 52), sunbed=True, towels=True, stars=['compote']),
  # ================= the break: the button (b148-b156) =================
  shot(148, 'plane', [seat('compote', XW, 'clap_while_seated', hold='glass', arm='R', aim='toast', upAt=0.3, at=0.3, speed=0.3), kob_phone()],
       "(59.24-60.84, the break) the flight home: Compote in her window seat, a drink in her paw; the middle seat empty",
       FRONT, ground='sea', dusk=True, half=True, stars=['compote']),
  shot(152, 'beach', [B('saxo', 'happy_idle', 0.0, -60, face='world', yaw=180, lift=-0.12, ride='duck', rideY=SEA, rideYaw=180, arm='both', aim=[0.42, 0.86, 0.3], wave=0.35, upAt=0.05)],
       "(60.84-62.44, the stabs fading out) the open sea: Saxo alone in the duck float, from behind, waving both arms at the plane flying away high above",
       view((0.5, 0.75, -56.9), (0.0, 2.6, -63.0), 52), jet=[-26, 20, -108, 26, 24, -103], still=True, stars=['saxo']),
]

# No comic word bursts and no bind pose (the user's calls; the QA gate fails both)
for sh in shots:
    assert not any(k.startswith('word') for k in sh), sh['lyric']
    assert all(a.get('clip') != 'tpose' for a in sh['actors'])
BASE = {'tpose', 'gangnam', 'twist', 'macarena', 'silly_twist', 'chicken', 'twerk', 'ymca', 'robot', 'shopping_cart', 'running_man', 'moonwalk', 'shuffle', 'tut', 'booty_step', 'arm_wave', 'snake', 'shimmy', 'charleston', 'samba', 'belly', 'northern_soul_spin'}
clips = {a['clip'] for s in shots for a in s['actors']}
ep = {
  'date': '2026-09-26', 'n': 2,
  'song': {'title': 'Voyage Voyage (Techno)', 'artist': 'Hyper Duck', 'window': [0.0, 62.44], 'bpm': 150.0, 'tail': 0.0},
  'logline': "The squad goes on holiday and Saxo steals Compote's spot at every stop: her window seat, her Eiffel Tower selfie, "
             "the only daybed in the shade. The fourth time he leaps into her giant rubber-duck float, and she shoves it out to sea.",
  'new': ['plane map (a wide-body airliner in flight: seats, aisle, bins, window holes through the walls and the shell, the galley, '
          'pet passengers, a drinks trolley, the wing and engines, a pink tail with a paw; the world scrolls past: clouds, '
          'smoking volcanoes through them, or the open sea; turbulence, the climb, the dusk flight home)',
          'the airliner as a fly-over in Paris and at the beach (`jet` flag), the beach daybed, towels and a rubber-duck float',
          'engine: `ride: "duck"` (a rider in the float, `rideY` for the float\'s own height, `rideYaw` to turn it), `hat` '
          '(a prop on the head from `hatFrom`: `juicehat`), `bump` (turbulence jolts on the beat), `moveAt` (a walk that '
          'starts later in the shot), the boarding-pass prop',
          'costumes: Saxo tourist (hibiscus shirt, travel neck pillow, instant camera), Sadi hostess (the flight attendant)'],
  'notes': "The user's queue entry: don't follow any clip; make an airplane map and use the Paris and beach maps, for the "
           "'voyage'. The song (a techno remix of the 1986 French hit) is a call to travel ever further: verse 1 flies over "
           "old volcanoes and gliding wings, through clouds, wind and rain, up into the heights; the pre-chorus flies over the "
           "capitals and says to look at the ocean; the chorus goes further than night and day, into love. The cut is the "
           "song's first 62.4 s: verse 2 carries a line not for our screen, so the story ends on the drop's instrumental half "
           "and the break's fading stabs. Structure: the broken rule of three (he takes her spot three times, the fourth "
           "fails). Whole cast: Saxo (the lead, the spot thief), Compote (always angry, violent over a stolen spot: here one "
           "calm shove), Sadi (the flight attendant and his date, the romance; her kiss knocks him flat), Kob (never goes out: "
           "she came, never looked up from her phone and never got off the plane). Two reviews reshaped it: the hook opens "
           "on the boarding pass (the conflict and the faces first), and the shove visibly sends the float off.",
  'with': ['sadi', 'kob', 'compote'],
  'clips': sorted(clips - BASE),
  'shots': shots,
  'tags': {'structure': 'broken rule of three', 'scenes': [], 'cast': ['saxo', 'sadi', 'kob', 'compote'], 'hook': 'lyric',
           'maps': ['plane', 'paris', 'beach'], 'ref': 'none',
           'lyric_literal': "L00 the volcanoes (the plane over an erupting one), L01 the wings (the window over the wing), L05 wind then rain (the turbulence, the juice raining on Compote), L07 fly in the heights (the climb), L08 over the capitals (the plane over the Eiffel Tower), L09 ideas (his idea: the photobomb), L10 look at the ocean (he points; the beach), L12 night and day (the flash cut to Paris by night and back), L13 love (the salsa, the kiss)",
           'experiment': 'Does a relatable travel gag (the spot thief, three times then the payback) with a callback ending (her window seat on the flight home) beat our spectacle episodes on shares?'},
}
out = os.path.join(os.path.dirname(__file__), '2026-09-26-2.json')
json.dump(ep, open(out, 'w'), ensure_ascii=False, indent=1)
print(out, len(shots), 'shots', len(ep['clips']), 'clips', 'end', END)
