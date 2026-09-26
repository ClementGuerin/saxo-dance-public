# make_2026-09-26-3.py: writes episodes/2026-09-26-3.json, "Die Young" (Kesha), from the user's queue (no instructions).
# "Part 2 of the golden carrot": Saxo still has Compote's second golden carrot (He's A Pirate, 2026-09-26), and tonight
# she is the bouncer of the party in the old chapel. So he rolls up in a black vintage car disguised as the singer from
# the clip (platinum shag wig, red lips, glitter, studded leather), holding the carrot up like a golden microphone. The
# disguise gets him past her rope, and he parties like there's no tomorrow... until the music's break, when the whole
# room goes silent and the spotlight finds the gold in his paw. The chase: through the dancers, past Kob behind the bar
# (she never looks up), up against the stage; he fakes a throw out of the door (the "fake throw" meme: she sprints off
# after nothing) and takes the stage with Sadi on the drop while Compote searches the street on all fours. Kob snitches
# (a thumb at the stage), Compote comes back through the parting crowd, he hands the carrot over with a sheepish smile,
# she takes it, he thinks it's over... and her uppercut lands on the last refrain's "die". The song stops dead; he lands
# flat.
# Beats count from B0 = 0 at 128 BPM (cut time = b * 0.46875 s; a bar = 4 beats = 1.875 s); the cut is 142.71-211.30 s
# of the song (episodes/2026-09-26-3.config.js). Lyric lines are named by number (L00-L14, see
# episodes/2026-09-26-3.lyrics.js): the lyrics stay in their files. L00-L03 pre-chorus 2 (0.08-15.0), the break b32-b48
# (quiet; L04's pickup from 21.17), L04-L07 the half-time chorus (b48-b80), L08-L11 the full chorus on the drop (b80),
# L12-L13 the chant (b112-b128), the instrumental b128-b136, L14 the last refrain (b136-b144), the beat stops dead at
# b144 (67.50; the last word holds to 67.94) and the cut ends at 68.59.
import json, math, os

B0, P = 0.0, 60 / 128.0
T = lambda b: round(B0 + b * P, 3)                 # beat -> cut seconds
END = 68.59
LOOK = {'saxo': 'kesha', 'sadi': 'rave', 'kob': 'bartender', 'compote': 'bouncer'}
# ---- the chapel (src/maps9.js CHAPEL) ----
S = 0.6; SZ = -4.6; OSZ = -5.35                    # the stage top, its front face, the performers' mark on it
FLOOR = (0.0, -1.2)                                # the dance floor mark
DOOR = (5.75, 3.0)                                 # standing in the doorway (right wall)
KOB = (-5.2, 0.9); DECK = 0.15                     # the bartender behind the counter, on her duckboard
CORNER = (-1.55, -4.05)                            # Saxo backed up against the stage front, left of the steps (his throwing arm towards the camera)
_dx, _dz = DOOR[0] - CORNER[0], DOOR[1] - CORNER[1]; _d = math.hypot(_dx, _dz)
FACE_OFF = (round(CORNER[0] + 1.25 * _dx / _d, 3), round(CORNER[1] + 1.25 * _dz / _d, 3))   # Compote squares up to him, between him and the door
BESIDE = (round(CORNER[0] + 0.6 * _dx / _d + 0.55 * _dz / _d, 3), round(CORNER[1] + 0.6 * _dz / _d - 0.55 * _dx / _d, 3))   # at the throw: in front of him but off his throwing line (his left)
# ---- the village (VILLAGE) ----
BOUNCER = (1.55, -12.55); ROPE_Z = -12.8; CAR = (2.75, -6.2)
MIC = [-0.14, 0.5, 0.86]                           # the carrot held up at his muzzle like a microphone (negative x crosses the body)

def A(who, clip, x=0, z=0, **o):
    return {'who': who, 'look': o.pop('look', LOOK[who]), 'clip': clip, 'x': round(x, 3), 'z': round(z, 3), **o}
def saxo(clip, x, z, mic=True, **o):                # Saxo in the disguise, the golden carrot in his right paw (up at his muzzle: a mic)
    if mic: o = {'arm': 'R', 'aim': MIC, 'upAt': 0.0, **o}
    return A('saxo', clip, x, z, hold=o.pop('hold', 'gcarrot'), holdScale=o.pop('holdScale', 1.35), **o)   # the carrot drawn bigger: it's the story's spine
def kob(clip='bored_idle', **o):                    # Kob behind the bar, facing the room, a glass in her paw
    return A('kob', clip, KOB[0], KOB[1], face='world', yaw=o.pop('yaw', 90), lift=DECK, hold=o.pop('hold', 'glass'), **o)
def yaw_to(a, b): return round(math.degrees(math.atan2(b[0] - a[0], b[1] - a[1])), 1)
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

HUSH = T(32)                                       # 15.00: the music's break
SNATCH = 0.55                                      # s into b132's shot: Compote takes the carrot back
UPS = round(1.2 / (67.07 - T(140)), 4)             # the uppercut's contact (1.2 s into the paired clips) lands on L14's 'die' at 67.07
GAP = 0.6                                          # the victim's head start (the fight used 0.5; at 0.5 the two merged side on)
KEYBAR = [-3.7, 1.9, 0.9, 1.25, 1.15, 1.05]        # a light on Kob's face at the bar
shots = [
  # ================= pre-chorus 2: the disguise and the rope (L00-L03) =================
  shot(0, 'village', [saxo('happy_walk', 1.2, -6.1, mx=-0.25, mz=0.75, speed=1.4)],
       "L00 (0.08-, hook): the black vintage car's rear door swings open and out steps 'the singer': Saxo in the platinum shag wig, red lips and studded leather, the golden carrot up at his muzzle like a mic; the chapel's party door blazes at the end of the street",
       view((-1.05, 0.55, -4.15), (1.15, 1.2, -6.0), 52, p1=(-0.95, 0.56, -4.3)), carDoor=True, key=[0.2, 1.6, -5.0, 0.9, 0.8, 0.9], stars=['saxo']),
  shot(4, 'village', [A('compote', 'bored_idle', *BOUNCER, face='world', yaw=0, at=2.0)],
       "L00 (-3.55, 'tonight' at 2.35): the bouncer at the chapel's velvet rope: Compote in her black suit, arms folded, the party blazing behind her",
       view((1.2, 1.0, -10.75), (1.55, 0.95, -12.55), 48, p1=(1.22, 0.99, -10.95)), stars=['compote']),
  shot(6, 'village', [saxo('happy_walk', 0.45, -8.3, mz=-1.0, speed=1.3, face='world', yaw=180)],
       "L00 end: he struts up the street towards her, mic up, the car and the string lights behind him",
       view((-0.45, 1.0, -11.3), (0.45, 1.1, -8.8), 50), stars=['saxo']),
  shot(8, 'village', [saxo('happy_idle', 0.3, -11.9, face='world', yaw=yaw_to((0.3, -11.9), BOUNCER)),
                      A('compote', 'intercept_and_wave_to_stop', *BOUNCER, face='world', yaw=yaw_to(BOUNCER, (0.3, -11.9)), at=0.0, speed=0.57)],   # the clip's stop paw peaks 0.6 s in: slowed onto 'hand' at 4.81
       "L01 (3.65-, 'hand' at 4.81): at the rope her paw comes up: stop right there",
       view((1.1, 1.2, -8.6), (0.9, 1.0, -12.2), 50), stars=['compote', 'saxo']),
  shot(12, 'village', [saxo('shimmy', 0.3, -11.9, face='world', yaw=yaw_to((0.3, -11.9), BOUNCER), at=0.3)],
       "L01 (-7.33, 'wild' at 6.45): he proves he's the star: a diva shimmy, singing into the golden mic, straight at her",
       view((2.35, 1.2, -13.35), (0.35, 1.05, -11.9), 50), stars=['saxo']),
  shot(16, 'village', [saxo('happy_idle', 0.3, -11.9, face='world', yaw=yaw_to((0.3, -11.9), BOUNCER), at=1.0),
                       A('compote', 'angry_forward_gesture', 1.45, -12.45, face='world', yaw=yaw_to((1.45, -12.45), (0.3, -11.9)), at=0.2)],
       "L02 (7.43-, 'last night' at 8.93): she leans in and squints at him, and at the gold at his muzzle; he holds the pose",
       view((2.1, 1.1, -9.4), (0.85, 1.0, -12.15), 50), stars=['compote', 'saxo']),
  shot(20, 'village', [saxo('happy_walk', 0.3, -11.9, mz=-1.0, speed=1.3, face='world', yaw=180, moveAt=0.35),
                       A('compote', 'bored_idle', *BOUNCER, face='world', yaw=yaw_to(BOUNCER, (0.3, -11.9)), at=5.0, arm='L', aim=[0.8, 0.3, 0.5], upAt=0.1)],
       "L02 (-11.34): she waves him in, and the singer struts past the rope into the pink blaze of the door",
       view((0.45, 1.3, -8.1), (0.65, 1.1, -12.9), 50), stars=['saxo', 'compote']),
  shot(24, 'chapel', [saxo('hip_hop_dancing_side_to_side', FLOOR[0] - 0.45, FLOOR[1], at=2.0),
                      A('sadi', 'female_hip_hop_body_wave_dancing', FLOOR[0] + 0.55, FLOOR[1] + 0.1, at=1.0)],
       "L03 (11.19-, 'dancing' at 12.21): inside, the party in the old chapel: backlit columns, the neon triangle, the guests jumping, and the singer dancing with Sadi, mic up",
       view((0.3, 3.6, 7.8), (0.0, 1.0, -1.3), 52, p1=(0.25, 2.3, 6.0), ly1=1.05, ease='out'), stars=['saxo', 'sadi']),
  shot(28, 'chapel', [saxo('booty_step', FLOOR[0] - 0.45, FLOOR[1], at=0.5),
                      A('sadi', 'female_hip_hop_body_wave_dancing', FLOOR[0] + 0.55, FLOOR[1] + 0.1, at=3.0)],
       "L03 (-15.0): he belts it out into the golden carrot, Sadi dancing with him",
       view((0.2, 1.25, 2.3), (0.05, 1.05, -1.2), 50, p1=(0.15, 1.22, 2.0)), stars=['saxo', 'sadi']),
  # ================= the break: the room goes silent (b32-b48) =================
  shot(32, 'chapel', [saxo('hip_hop_dancing_side_to_side', FLOOR[0] - 0.45, FLOOR[1], at=3.4, speed=0.0, arm='R', aim=[0.5, 0.8, 0.35]),
                      A('sadi', 'bored_idle', FLOOR[0] + 0.55, FLOOR[1] + 0.1, at=1.0, speed=0.0)],
       "(15.0-, the break: the music cuts out) the whole room stops dead and turns: one white spotlight on him, the golden carrot held high",
       view((0.0, 2.5, 3.3), (-0.2, 0.8, -1.2), 52, p1=(0.0, 2.3, 2.7), ease='lin'), hush=HUSH, spot=[FLOOR[0] - 0.45, FLOOR[1]], look=[FLOOR[0] - 0.45, FLOOR[1]], still=True, stars=['saxo']),
  shot(36, 'chapel', [A('compote', 'bored_idle', *DOOR, face='world', yaw=yaw_to(DOOR, (FLOOR[0] - 0.45, FLOOR[1])), at=2.0)],
       "(16.88-18.75, silence) in the doorway, against the light, the bouncer: her head turns to the gold",
       view((4.3, 1.05, 0.5), (5.75, 0.95, 3.0), 48, p1=(4.6, 1.02, 1.0), ease='lin'), hush=HUSH, doorBright=True, look=[FLOOR[0] - 0.45, FLOOR[1]], still=True, stars=['compote']),
  shot(40, 'chapel', [saxo('being_surprised_and_looking_right', FLOOR[0] - 0.45, FLOOR[1], mic=False, at=0.2)],
       "(18.75-20.63, silence) him, in the spotlight: he looks at the golden carrot in his paw, then at her",
       view((0.35, 1.1, -3.1), (-0.45, 1.0, -1.2), 46), hush=HUSH, spot=[FLOOR[0] - 0.45, FLOOR[1]], look=[FLOOR[0] - 0.45, FLOOR[1]], still=True, stars=['saxo']),
  shot(44, 'chapel', [A('compote', 'angry_forward_gesture', *DOOR, face='world', yaw=yaw_to(DOOR, (FLOOR[0] - 0.45, FLOOR[1])), at=0.2, arm='L', aim=[0.72, 0.45, 0.52], upAt=0.55)],
       "(20.63-22.50, L04's pickup from 21.17) she points straight at him: HER carrot",
       view((4.0, 1.1, 1.8), (5.75, 1.0, 3.0), 50), hush=HUSH, doorBright=True, look=[5.75, 3.0], still=True, stars=['compote']),
  # ================= the half-time chorus: the chase (L04-L07) =================
  shot(48, 'chapel', [saxo('happy_run', -0.3, -2.4, mic=False, mz=3.4, speed=2.2, face='world', yaw=0),
                      A('compote', 'happy_run', 0.2, -4.2, mz=3.4, speed=2.2, face='world', yaw=0)],
       "L04 (21.17-, 'heart beat' at 22.63 and 23.16): he bolts through the dancers straight at us, the carrot in his paw, Compote charging behind him; the frame pounds like a heartbeat",
       view((0.0, 0.95, 4.2), (0.0, 1.0, 0.0), 54, p1=(0.0, 0.95, 5.2)), half=True, jolt=True, stars=['saxo', 'compote']),
  shot(52, 'chapel', [kob(at=4.0, arm='R', aim=[0.35, 0.3, 0.86], upAt=0.0, wave=0.12)],
       "L04 ('beat' at 24.47): at the bar, Kob the bartender polishes a glass, miles away from it all",
       view((-3.0, 1.2, -0.45), (-5.2, 1.0, 0.9), 48), half=True, key=KEYBAR, stars=['kob']),
  shot(54, 'chapel', [kob(at=5.0), saxo('happy_run', -3.75, 1.7, mic=False, mz=-2.8, speed=2.6, face='world', yaw=180),
                      A('compote', 'happy_run', -3.75, 3.1, mz=-2.8, speed=2.6, face='world', yaw=180)],
       "L04 (-26.35): Saxo tears past the bar, then Compote; Kob never looks up",
       view((1.2, 1.2, 1.1), (-4.2, 0.95, 0.9), 60), half=True, key=KEYBAR, stars=['kob', 'saxo']),
  shot(56, 'chapel', [saxo('happy_run', 1.1, -2.2, mic=False, mx=-3.6, speed=2.2, face='world', yaw=-90),
                      A('compote', 'happy_run', 2.4, -2.2, mx=-3.6, speed=2.2, face='world', yaw=-90)],
       "L05 (26.61-, first half): round the dance floor, along the stage, the guests bouncing",
       view((0.4, 1.3, 3.2), (0.2, 1.0, -2.2), 58), half=True, stars=['saxo', 'compote']),
  shot(60, 'chapel', [saxo('step_back_cautiously_agreeing', CORNER[0], CORNER[1], mic=False, at=0.4),
                      A('compote', 'boxing_dodge_advance', round(CORNER[0] + 1.9 * _dx / _d, 3), round(CORNER[1] + 1.9 * _dz / _d, 3), mx=round(-0.65 * _dx / _d, 3), mz=round(-0.65 * _dz / _d, 3), face='world', yaw=yaw_to(FACE_OFF, CORNER))],
       "L05 (-30.81): cornered against the stage; she closes in, boxer's steps",
       view((-3.8, 1.35, 0.4), (-0.98, 1.0, -3.5), 52), half=True, stars=['saxo', 'compote']),
  shot(64, 'chapel', [A('compote', 'boxing_taunt', *FACE_OFF, face='world', yaw=yaw_to(FACE_OFF, CORNER), at=0.0, arm='both', aim=[0.4, 0.2, 0.85], upAt=0.1)],
       "L06 (30.91-, first half): her, close: fists up",
       view((round(CORNER[0] - 0.9 * _dx / _d, 3), 0.95, round(CORNER[1] - 0.9 * _dz / _d, 3)), (FACE_OFF[0], 0.85, FACE_OFF[1]), 52), half=True, stars=['compote']),
  shot(68, 'chapel', [saxo('buckled_stand_and_praying', CORNER[0], CORNER[1], mic=False, at=0.2)],
       "L06 ('arms' at 32.95, -33.69): he begs, paws together round the golden carrot",
       view((CORNER[0] - 0.3, 1.1, CORNER[1] + 2.8), (CORNER[0], 1.1, CORNER[1]), 50), half=True, stars=['saxo']),
  shot(72, 'chapel', [saxo('pitching_a_baseball', CORNER[0], CORNER[1], mic=False, face='world', yaw=yaw_to(CORNER, DOOR), at=0.4,
                            arm='R', aim=[0.35, 0.4, 0.85], upAt=1.08, upEnd=1.4),   # the throw's reach, straight at us (towards the door)
                      A('compote', 'boxing_taunt', *BESIDE, face='world', yaw=yaw_to(BESIDE, CORNER), at=0.6)],
       "L07 (33.79-, the refrain): from the door's side: the wind-up... and he 'throws' it at us, towards the door (34.92): nothing leaves his paw",
       view((round(CORNER[0] + 3.6 * _dx / _d, 3), 1.1, round(CORNER[1] + 3.6 * _dz / _d, 3)), (CORNER[0], 1.0, CORNER[1]), 50), half=True, stars=['saxo', 'compote']),
  shot(75, 'chapel', [A('compote', 'being_surprised_and_looking_right', *BESIDE, at=0.25)],
       "(35.16-35.63) one beat: her head whips round after the throw",
       view((round(BESIDE[0] + 1.9 * _dx / _d, 3), 1.0, round(BESIDE[1] + 1.9 * _dz / _d, 3)), (BESIDE[0], 0.95, BESIDE[1]), 50), half=True, stars=['compote']),
  shot(76, 'chapel', [A('compote', 'happy_run', *BESIDE, mx=round(3.3 * _dx / _d, 3), mz=round(3.3 * _dz / _d, 3), speed=2.4, face='world', yaw=yaw_to(CORNER, DOOR))],
       "(35.63-36.56) she sprints off after it, away towards the blazing door",
       view((-1.5, 1.25, -4.45), (3.0, 0.9, 0.6), 54), half=True, doorBright=True, stars=['compote']),
  shot(78, 'chapel', [saxo('happy_idle', CORNER[0], CORNER[1], mic=False, at=0.5, arm='R', aim=[0.5, 0.7, 0.5], upAt=0.1)],
       "L07 (-37.78, 'die' at 37.07): and him, grinning, the golden carrot still in his paw",
       view((CORNER[0] - 0.2, 1.1, CORNER[1] + 2.2), (CORNER[0], 1.05, CORNER[1]), 50), half=True, stars=['saxo']),
  # ================= the full chorus on the drop (L08-L11) =================
  shot(80, 'chapel', [saxo('hip_hop_dancing_side_to_side', -0.5, OSZ, lift=S, face='world', yaw=0, at=3.0),
                      A('sadi', 'female_hip_hop_raise_the_roof_dancing', 0.6, OSZ - 0.1, lift=S, face='world', yaw=0, at=0.5)],
       "L08 (37.63-, the drop): confetti: he takes the stage and belts it into the golden mic, Sadi jumping up beside him, the whole chapel jumping",
       view((0.2, 1.5, 0.3), (0.05, 1.55, -5.2), 52, p1=(0.15, 1.5, -0.5)), confetti=T(80), pit=True, stars=['saxo', 'sadi']),
  shot(84, 'village', [A('compote', 'happy_run', 0.4, -11.6, mz=5.2, speed=2.4, face='world', yaw=0)],
       "L08 (-41.39): outside, Compote tears down the street after the carrot that was never thrown",
       view((-0.9, 0.9, -4.4), (0.35, 0.95, -9.0), 52), stars=['compote']),
  shot(88, 'chapel', [saxo('hip_hop_dancing_side_to_side', -0.5, OSZ, lift=S, face='world', yaw=0, at=5.0),
                      A('sadi', 'hip_hop_dancing_side_to_side', 0.6, OSZ - 0.1, lift=S, face='world', yaw=0, at=5.3)],
       "L09 (41.65-45.97): on stage, the singer and Sadi dance in step, the columns flashing behind them",
       view((-1.3, 1.45, -1.4), (0.05, 1.55, -5.3), 50, p1=(-0.8, 1.45, -1.9)), pit=True, stars=['saxo', 'sadi']),
  shot(92, 'village', [A('compote', 'crawling_forward_on_hands_and_knees', -1.6, -3.7, mz=0.6, speed=0.7, face='world', yaw=25, ground='mesh')],
       "(43.13-45.00) by the fruit stall, on all fours, she sniffs the dirt for it",
       view((0.9, 0.65, -4.2), (-1.35, 0.35, -3.05), 50), fruit=True, stars=['compote']),
  shot(96, 'chapel', [kob(at=6.0)],
       "(45.00-46.88) Kob behind the bar watches the star's show: not impressed",
       view((-3.3, 1.05, 1.3), (-5.2, 1.0, 0.9), 44, p1=(-3.45, 1.05, 1.25)), key=KEYBAR, stars=['kob']),
  shot(100, 'chapel', [saxo('female_hip_hop_raise_the_roof_dancing', -0.5, OSZ, mic=False, lift=S, face='world', yaw=0, at=0.2, arm='both', aim=[0.5, 0.82, 0.3], upAt=1.0),
                       A('sadi', 'female_hip_hop_raise_the_roof_dancing', 0.6, OSZ - 0.1, lift=S, face='world', yaw=0, at=0.2, arm='both', aim=[0.5, 0.82, 0.3], upAt=1.05)],
       "L10 (46.07-, 'arms' at 47.93): arms up, the two of them and the whole room",
       view((0.1, 1.45, 1.6), (0.05, 1.45, -5.3), 54), pit=True, armsUp=[47.8, 49.0], stars=['saxo', 'sadi']),
  shot(104, 'village', [A('compote', 'being_surprised_and_looking_right', -1.55, -3.3, face='world', yaw=0, at=0.8)],
       "L11 (48.91-, 'night' at 50.77): she stops: her head turns back to the chapel",
       view((-2.8, 1.0, -1.6), (-1.55, 0.95, -3.3), 48), fruit=True, stars=['compote']),
  shot(108, 'village', [A('compote', 'boxing_taunt', -1.55, -3.3, face='world', yaw=0, at=0.3, arm='both', aim=[0.45, 0.4, 0.75], upAt=0.3)],
       "L11 (-53.64, 'die' at 52.05): close: she knows. Fists up",
       view((-1.55, 0.95, -1.15), (-1.55, 0.95, -3.3), 46, p1=(-1.55, 0.95, -1.35)), fruit=True, stars=['compote']),
  # ================= the chant: Kob snitches, Compote comes back (L12-L13) =================
  shot(112, 'chapel', [kob('bored_idle', at=2.0, yaw=yaw_to(KOB, DOOR), hold=None, holdL='glass', arm='R', aim=[0.86, 0.12, 0.5], upAt=0.35)],
       "(52.50-54.38) at the bar, Kob, deadpan, jabs her thumb at the stage: he's up there",
       view((-2.7, 1.05, 1.75), (-5.2, 1.0, 0.95), 46), key=KEYBAR, stars=['kob']),
  shot(116, 'chapel', [A('compote', 'boxing_taunt', *DOOR, face='world', yaw=-110, at=0.2)],
       "L12 (54.65-, 'die young' at 55.77): Compote in the doorway, against the light; the room turns and the crowd parts",
       view((-1.6, 1.9, 0.4), (5.0, 0.9, 3.0), 52, p1=(-1.2, 1.85, 0.6)), doorBright=True, look=list(DOOR), part=T(116) + 0.3, stars=['compote']),
  shot(120, 'chapel', [saxo('happy_idle', -0.5, OSZ, mic=False, lift=S, face='world', yaw=yaw_to((-0.5, OSZ), DOOR), at=0.3, speed=0.2),
                       A('sadi', 'happy_idle', 0.6, OSZ - 0.1, lift=S, face='world', yaw=yaw_to((0.6, OSZ - 0.1), DOOR), at=1.2, speed=0.2)],
       "L12 (-57.43, 'young' at 56.29): on stage the singer freezes mid-song, the golden carrot lowered",
       view((2.0, 1.55, -1.6), (0.05, 1.5, -5.3), 50), part=T(116) + 0.3, look=list(DOOR), pit=True, stars=['saxo', 'sadi']),
  shot(124, 'chapel', [A('compote', 'boxing_dodge_advance', 2.4, 0.2, mx=-1.6, mz=-1.9, face='world', yaw=yaw_to((2.4, 0.2), (0.0, -3.0)), speed=1.2),
                      saxo('being_surprised_and_looking_right', -0.5, OSZ, mic=False, lift=S, at=1.2, speed=0.3), A('sadi', 'being_surprised_and_looking_right', 0.6, OSZ - 0.1, lift=S, face='world', yaw=-20, at=2.0)],
       "L13 (58.33-, 'die young' at 59.63): she walks down the lane through the parted crowd, towards the stage",
       view((3.7, 0.85, 2.3), (0.9, 1.1, -3.4), 52, p1=(3.2, 0.85, 1.5)), part=T(116) + 0.3, pit=True, look=[-0.5, OSZ], stars=['compote', 'saxo']),
  # ================= the instrumental: the carrot goes back (b128-b136) =================
  shot(128, 'chapel', [saxo('happy_idle', 0.2, -2.3, mic=False, face='world', yaw=yaw_to((0.2, -2.3), (-0.2, -1.3)), at=0.6, arm='R', aim=[0.5, 0.25, 0.83], upAt=0.2),
                       A('compote', 'bored_idle', -0.2, -1.3, face='world', yaw=yaw_to((-0.2, -1.3), (0.2, -2.3)), at=1.0)],
       "(60.00-61.88) he comes down the steps and holds the carrot out to her, with a sheepish smile",
       view((2.9, 1.15, -0.25), (0.0, 1.0, -1.8), 50), part=T(116) + 0.3, stars=['saxo', 'compote']),
  shot(132, 'chapel', [saxo('happy_idle', 0.2, -2.3, mic=False, face='world', yaw=yaw_to((0.2, -2.3), (-0.2, -1.3)), at=1.4, arm='R', aim=[0.5, 0.25, 0.83], upAt=0.0, upEnd=SNATCH + 0.1, holdTo=SNATCH),
                       A('compote', 'bored_idle', -0.2, -1.3, face='world', yaw=yaw_to((-0.2, -1.3), (0.2, -2.3)), at=2.0, holdL='gcarrot', holdScale=1.35, holdFrom=SNATCH,
                         arm='L', aim=[0.15, 0.35, 0.9], upAt=SNATCH - 0.25, upEnd=SNATCH + 0.35)],
       "(61.88-63.75) she snatches it back; he sags with relief",
       view((2.45, 1.1, -2.0), (0.0, 1.0, -1.8), 50), part=T(116) + 0.3, stars=['compote', 'saxo']),
  # ================= the last refrain: the uppercut (L14), the stop, the button =================
  shot(136, 'chapel', [saxo('booty_step', 0.2, -2.3, mic=False, hold=None, face='world', yaw=10, at=0.4),
                       A('compote', 'bored_idle', -0.65, -2.05, face='world', yaw=yaw_to((-0.65, -2.05), (0.2, -2.3)), at=3.0, holdL='gcarrot', holdScale=1.35)],
       "L14 (64.01-, 'night' at 65.77): he thinks he got away with it: a cheeky dance for the room... next to him she hasn't gone",
       view((0.1, 1.15, 0.9), (-0.2, 1.0, -2.2), 50), part=T(116) + 0.3, stars=['saxo', 'compote']),
  shot(140, 'chapel', [A('compote', 'uppercut_atk', -0.3, -0.9, face='world', yaw=180, at=0.0, speed=UPS, once=True, scale=round(1 / 0.92, 3), holdL='gcarrot', holdScale=1.35)],
       "L14 (-66.56, 'night' at 65.77): from where he stands: she crouches into the wind-up, the carrot in her other paw",
       view((-0.1, 1.05, -3.1), (-0.3, 0.85, -0.9), 50), part=T(116) + 0.3, key=[-0.3, 2.2, -2.4, 1.3, 1.2, 1.2], stars=['compote']),
  shot(142, 'chapel', [A('compote', 'uppercut_atk', -0.3, -0.9, face='world', yaw=180, at=round(UPS * (T(142) - T(140)), 3), speed=UPS, once=True, scale=round(1 / 0.92, 3), holdL='gcarrot', holdScale=1.35),
                       A('saxo', 'uppercut_vic', -0.3, -0.9 - GAP, face='world', yaw=180, at=round(UPS * (T(142) - T(140)), 3), speed=UPS, once=True, air=True)],
       "L14 (66.56-67.50, 'die' at 67.07): wider: her uppercut lands on the word and he flies",
       view((5.3, 1.0, -2.05), (-0.3, 0.95, -2.05), 50), part=T(116) + 0.3, key=[2.0, 2.3, -2.0, 1.3, 1.2, 1.2], stars=['compote', 'saxo']),
  shot(144, 'chapel', [A('compote', 'bored_idle', -1.1, -2.0, face='world', yaw=yaw_to((-1.1, -2.0), (2.4, 0.4)), at=2.0, holdL='gcarrot', holdScale=1.35, arm='L', aim=[0.6, 0.75, 0.25], upAt=0.05),
                       A('saxo', 'uppercut_vic', -0.3, -0.9 - GAP, face='world', yaw=180, at=3.45, speed=0.0, once=True)],
       "(67.50-, the song stops dead; the last word holds to 67.94, then silence) from above: him flat on the floor in front, her behind him holding up the golden carrot",
       view((2.4, 2.6, 0.4), (0.0, 0.6, -2.2), 50), part=T(116) + 0.3, still=True, key=[1.2, 2.6, -1.2, 1.2, 1.1, 1.1], stars=['compote', 'saxo']),
]

# No comic word bursts and no bind pose (the user's calls; the QA gate fails both)
for sh in shots:
    assert not any(k.startswith('word') for k in sh), sh['lyric']
    assert all(a.get('clip') != 'tpose' for a in sh['actors'])
    for a in sh['actors']:
        if a.get('hold') is None: a.pop('hold', None)
BASE = {'tpose', 'gangnam', 'twist', 'macarena', 'silly_twist', 'chicken', 'twerk', 'ymca', 'robot', 'shopping_cart', 'running_man', 'moonwalk', 'shuffle', 'tut', 'booty_step', 'arm_wave', 'snake', 'shimmy', 'charleston', 'samba', 'belly', 'northern_soul_spin',
        'skate_push', 'skate_idle', 'uppercut_atk', 'uppercut_vic', 'slam_atk', 'slam_vic'}
clips = {a['clip'] for s in shots for a in s['actors']}
ep = {
  'date': '2026-09-26', 'n': 3,
  'song': {'title': 'Die Young', 'artist': 'Kesha', 'window': [142.71, 211.30], 'bpm': 128.0, 'tail': 0.65},
  'yt': [11.05, 68.59],   # the Short keeps the payoff: from just before L03's first word (L02 ends 0.15 s after it starts, so the auto cut began mid-word)
  'logline': "Saxo sneaks Compote's stolen golden carrot past her own velvet rope disguised as the singer, holding it up like a "
             "microphone; the break's silence gives him away, he fakes a throw to get rid of her, and her uppercut lands on the last 'die'.",
  'new': ['chapel map (the old adobe chapel turned into a club: the altar stage, white light columns, the neon triangle, a mirror ball, '
          'papel picado, stained glass, a bar with a bartender\'s duckboard, the open door blazing for a silhouette; flags hush + spot, '
          'look, part, confetti, doorBright)',
          'village map (the desert village street at night: adobe houses, string lights, papel picado, a fruit stall, cacti, '
          'the long black 1960s car with an opening door, the chapel facade with the party door, the neon triangle and the velvet rope)',
          'the paired uppercut clips placed as `actors` in a map (the fight used to need its own stadium scene)',
          'costumes: Saxo kesha (the singer disguise: platinum shag wig, eyeliner, gold glitter, red lips, studded biker jacket), '
          'Kob bartender (white shirt, black waistcoat and bow tie)'],
  'notes': "The user's queue entry had no instructions. The clip (a 360p copy, frames from its first 100 s): a dusty desert "
           "village by day, a black vintage car rolling in, close-ups of glossy red lips, neon triangles, and a wild party at "
           "night in an old building backlit by white light columns, silhouettes in the smoke, an old chapel's lit entrance. "
           "The singer: messy platinum hair, heavy eyeliner, red lips, black leather. The song: party tonight like there's no "
           "tomorrow. The cut (68.6 s) runs from pre-chorus 2 through the song's real ending: its 4-bar silent break is the "
           "story's turn (the spotlight finds the gold) and its dead stop after the last word is the button. Structure: the "
           "chase (not used in 7 days), with the live 'fake throw' reference (MEMES). Whole cast: Saxo (the lead: the thief "
           "in disguise, the joke on him), Compote (always angry, violent over a stolen carrot: the bouncer; part 2 of the "
           "golden-carrot feud), Kob (the bartender who never looks up, then snitches: a running thread), Sadi (dances with the "
           "star all night, then claps for Compote: her betrayal thread).",
  'with': ['sadi', 'kob', 'compote'],
  'clips': sorted(clips - BASE),
  'shots': shots,
  'tags': {'structure': 'chase', 'scenes': ['fight'], 'cast': ['saxo', 'sadi', 'kob', 'compote'], 'hook': 'ref',
           'maps': ['village', 'chapel'], 'ref': 'fake-throw',
           'lyric_literal': "L00 tonight (the night party), L01 the hand (her stop paw) and wild (his diva kiss), L03 dancing, L04 the heart beat (the frame pounds as he runs), L06 arms (the surrender), L07 the fake throw on the refrain, L10 arms (arms up on stage), L14 die (the uppercut lands on it)",
           'experiment': "Does a callback story (part 2 of the golden-carrot feud) with a live meme recreated in it (the fake throw) lift shares and rewatches over a standalone gag?"},
}
out = os.path.join(os.path.dirname(__file__), '2026-09-26-3.json')
json.dump(ep, open(out, 'w'), ensure_ascii=False, indent=1)
print(out, len(shots), 'shots', len(ep['clips']), 'clips', 'end', END)
