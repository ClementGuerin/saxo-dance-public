# make_2026-09-27-4.py: writes episodes/2026-09-27-4.json, "Beauty And A Beat" (Justin Bieber ft. Nicki Minaj), a
# throwback trending again (#10 on Spotify's global chart, 660k videos on its TikTok sound). The clip is "stolen"
# selfie-stick footage of a night party at a water park (the glowing wave pool, tube slides, tiki huts, dancers on
# podiums, a foam party). Ours: the water park's new lifeguard on his first night, and he never stops filming himself.
# Saxo stands on his tower with his back to the pool, flexing for his selfie stick, while the pool goes wrong behind
# him: Sadi swims up to flirt (she thinks his blown kiss is for her), a pet off the slide lands on Compote, the foam
# cannons bury Kob (the cat who won't touch water, in her bathrobe and towel turban on a lounger), the wave machine
# starts; in the chorus Sadi waves both arms for help and he copies her wave into his camera as a dance move, Compote
# is tossed on the waves and Kob sinks into the foam to her eyes. He backs up to fit it all in his selfie and falls
# off the tower on the drop. He flails; nobody saves him: every pet, Sadi and Compote pull out their phones and film
# him. Kob, dry, fishes him out by the collar with the rescue hook; dangling, he pulls out his selfie stick again...
# and she dunks him back in. Structure: job fail (never used).
# Beats count from B0 = 0.039 s at 128 BPM (cut time = B0 + b * 0.46875 s; a bar = 4 beats = 1.875 s); the cut is
# 15.62-90.62 s of the song (episodes/2026-09-27-4.config.js). Lyric lines are named by number (L00-L13,
# episodes/2026-09-27-4.lyrics.js): the lyrics stay in their files. Verse 1 b0-32 (L00-L03), the pre-chorus b32-64
# (L04-L07), chorus A b64-96 (L08-L10), chorus B b96-128 (L11-L13), the 8-bar instrumental drop b128-160; the video
# ends at 75.0 s (b159.9).
# Action words (whitelisted tags, kit seconds and beats): L00 show 0.00 (b0) off 0.72 (b1.5), L01 tonight 2.86 (b6)
# show 3.68 (b7.8) off 4.52 (b9.6), L04 party 15.88 (b33.8) tonight 18.30 (b39), L05 show 19.60 (b41.7), L06 tonight
# 25.76 (b54.9), L09 beauty 35.60 (b75.9) beat 37.46 (b79.8), L12 music 50.52 (b107.7) move 52.84 (b112.6), L13 baby
# 53.52 (b114.1).
import json, math, os, sys
sys.path.insert(0, os.path.dirname(__file__))
from cam import view, vpath, swoop, low, deadpan

P, B0 = 60 / 128, 0.039
T = lambda b: round(B0 + b * P, 3)                 # beat -> cut seconds
S = lambda b: round(b * P, 3)                      # beats -> seconds into a shot
END = 75.0
LOOK = {'saxo': 'lifeguard', 'sadi': 'beach', 'kob': 'spa', 'compote': 'beach'}
# ---- the water park (src/maps13.js POOL) ----
TX, TZ = 2.4, -1.35; PLAT = 1.5; WATER = -0.28; FLOOR = -0.8     # the tower's platform; the water; the pool floor
SWIM = FLOOR + 0.1                                                   # a swimmer's lift: the water at the waist, the face clear of 0.2 m waves
LOUNGER = (5.6, 1.7); KLIFT = 0.3 - 0.08                           # Kob's lounger, facing the pool (-z)
S_POOL = (3.75, -3.0); C_POOL = (0.9, -3.6)                        # Sadi and Compote in the pool, beside his body in the selfies, clear of the tower's legs
SX_W = (2.7, -4.0); KOB_EDGE = (4.05, -1.85)                       # Saxo in the water after the fall; Kob at the pool's edge
SLIDE_EXIT = (-5.8, -12.6)

def A(who, clip, x, z, **o):
    return {'who': who, 'look': o.pop('look', LOOK[who]), 'clip': clip, 'x': round(x, 3), 'z': round(z, 3), **o}
def yaw_to(a, b): return round(math.degrees(math.atan2(b[0] - a[0], b[1] - a[1])), 1)
def sax(clip, **o):                                  # Saxo on his tower, facing +z: his back to the pool he's meant to watch
    return A('saxo', clip, o.pop('x', TX), o.pop('z', TZ), lift=PLAT, face='world', yaw=o.pop('yaw', 0), **o)
HELP = dict(arm='both', aim='caramell', flapEvery=0.5, upAt=0.0, dip=[0.34, 7.0])   # in trouble: paws by the ears flapping fast, bobbing under the waves
COPY = dict(arm='both', aim='caramell', upAt=0.0)   # his copy of her flapping, on the beat: a dance (raised paws vanish behind the chibi heads)
STICK = dict(holdL='selfie', arm='L', aim=[0.35, 0.8, 0.5], upAt=0.0)   # the selfie stick held up in front of him
def sadi(clip, at_=S_POOL, **o):                     # Sadi chest-deep in the pool, facing the tower
    return A('sadi', clip, *at_, lift=SWIM, face='world', yaw=o.pop('yaw', yaw_to(at_, (TX, TZ))), **o)
def compote(clip, at_=C_POOL, **o):                  # Compote chest-deep in her duck ring
    return A('compote', clip, *at_, lift=SWIM, face='world', yaw=o.pop('yaw', yaw_to(at_, (TX, TZ))), **o)
def kob_lounge(clip='sitting_talking', **o):         # Kob on her lounger under the parasol, bathrobe and towel turban, facing the pool
    return A('kob', clip, *LOUNGER, lift=KLIFT, face='world', yaw=180, at=o.pop('at', 0), speed=o.pop('speed', 0.05), **o)
def pov(dx=0.2, h=3.0, d=2.3):   # his left paw holding the stick, aimed 0.25 m right of and 0.35 m under its lens (the pole then crosses the frame's corner)
    v = (dx, h - 0.35 - (PLAT + 0.75), d); n = math.sqrt(sum(c * c for c in v))
    return dict(holdL='selfiepov', arm='L', aim=[round(c / n, 3) for c in v], upAt=0.0)
def selfie(dx=0.55, h=3.0, d=2.3, fov=76, ly=2.3, roll=(-5, 3), hand=0.9, p1=None, **o):   # his selfie stick's camera
    return view((TX + dx, h, TZ + d), (TX, ly, TZ), fov, p1=p1, roll=list(roll), hand=hand, **o)
def close(at, dx=-0.6, d=2.4, h=0.55, ly=0.35, fov=58, **o):   # a swimmer's close-up, from the pool's edge side
    return view((at[0] + dx, h, at[1] + d), (at[0], ly, at[1]), fov, **o)
def shot(beat, actors, lyric, v, **o):
    c, focus = v
    return {'beat': beat, 'kind': 'dance', 'map': 'pool', 'actors': actors, 'lyric': lyric, 'cam': c, 'focus': focus, **o}
clear = lambda *pts: [[x, z, r] for x, z, r in pts]
C_ACT = clear((S_POOL[0], S_POOL[1], 1.0), (C_POOL[0], C_POOL[1], 1.0))   # no pet standing inside Sadi or Compote
HOOKED = clear((SX_W[0], SX_W[1], 1.2))

shots = [
  # ================= verse 1: the new lifeguard's first night (L00-L03) =================
  shot(0, [sax('happy_idle', at='auto', sway=6, **pov(0.2)), sadi('emotional_waving_forward', at='auto'), compote('bored_idle', at=0.5, speed=0.4)],
       "HOOK, L00 ('show' 0.00, 'off' 0.72): his own selfie, the stick in his paw: the lifeguard on his tower grooves and grins for his camera, his back to the pool; behind him Sadi waves up at him and a pet shot out of the slide splashes down right beside Compote",
       selfie(dx=0.2), rider=[0.2, C_POOL[0] - 0.7, C_POOL[1] - 0.3], clear=C_ACT, stars=['saxo']),
  shot(6, [sax('twist', **STICK)],
       "L01 ('tonight' 2.86, 'show' 3.68, 'off' 4.52): the water park at night: a swoop over the deck down to the tower, where he dances with his selfie stick held up, the glowing pool behind him",
       swoop([(4.2, 6.4, 7.8), (4.0, 4.9, 5.4), (3.7, 2.7, 3.4), (3.45, 2.0, 2.5)], (2.4, 2.15, -1.35), fov=62), riders=True, stars=['saxo']),
  shot(14, [kob_lounge()],
       "L02: deadpan: Kob on her lounger under the parasol, in a bathrobe and a towel turban, as far from the water as she can get",
       deadpan(LOUNGER, 0.92, 2.6, cam_y=1.45, ang=180, fov=42), stars=['kob']),
  shot(18, [compote('bored_idle', at=0.5, speed=0.4)],
       "L02: Compote in her ring, glaring; another pet shoots out of the slide and lands right beside her: splash",
       close(C_POOL, dx=0.5, d=2.5), rider=[S(0.8), C_POOL[0] - 0.9, C_POOL[1] - 0.2], clear=C_ACT, stars=['compote']),
  shot(22, [sax('shoulder_shrug', at='auto', **pov(0.05, 2.9, 2.1)), sadi('emotional_waving_forward', at='auto')],
       "L03: his selfie, closer: Sadi swims up behind him and waves; he shrugs at his camera, all his attention on it",
       selfie(dx=0.05, h=2.9, d=2.1, roll=(5, 2)), clear=C_ACT, stars=['saxo']),
  shot(28, [sadi('emotional_waving_forward', at='auto', sway=5, yaw=yaw_to(S_POOL, (2.9, -1.55)))],
       "L03: the reverse, from up on his tower: Sadi in the water looks up at him, smitten, swaying",
       view((2.9, 2.35, -1.55), (3.75, 0.25, -3.0), 56), clear=C_ACT, stars=['sadi']),
  # ================= pre-chorus: the party starts, the foam and the waves (L04-L07) =================
  shot(32, [sax('shuffle', **STICK)],
       "L04 ('party' 15.88): on 'party' the foam cannons fire across the deck; he dances on his tower, stick up",
       low((1.0, 0.3, 2.6), (2.5, 1.8, -1.35), (1.2, 0.3, 2.0), fov=70, roll=(-9, -6)), foam=S(1.8), foamY=0.6, stars=['saxo']),
  shot(36, [kob_lounge()],
       "L04 ('tonight' 18.30): deadpan: Kob, the foam up to her neck on her lounger",
       deadpan(LOUNGER, 0.92, 2.6, cam_y=1.45, ang=180, fov=42), foam=True, foamY=0.55, stars=['kob']),
  shot(40, [sax('hip_hop_dancing_side_to_side', at='auto', **pov(0.0, 2.75, 2.0)), sadi('bored_idle', at=0.5, speed=0.4, bump=0.08), compote('bored_idle', at=0.5, speed=0.4, bump=0.14)],
       "L05 ('show' 19.60): his selfie, low and close: he shows off his moves; behind him the wave machine has started, the first foam drifts on the water, Compote bobbing hard in her ring",
       selfie(dx=0.0, h=2.75, d=2.0, fov=80, roll=(-8, -4)), waves=0.16, foamPool=0.25, rider=[0.5, C_POOL[0] + 0.8, C_POOL[1] - 0.6], clear=C_ACT, stars=['saxo']),
  shot(46, [compote('standing_long_yell', at='auto', bump=0.14)],
       "L05-L06: Compote tossed up and down on the waves, yelling up at the tower, foam floating round her",
       close(C_POOL, dx=0.4, d=2.4), waves=0.18, foamPool=0.35, splash=[C_POOL[0] - 0.8, C_POOL[1] - 0.5, 0.6, 0.8], clear=C_ACT, stars=['compote']),
  shot(50, [sax('happy_idle', at='auto', **pov(0.1, 3.0, 2.4)), sadi('waving_with_both_hands', at=0.45, speed=0.8, **HELP), compote('standing_long_yell', at='auto', bump=0.14)],
       "L06 ('tonight' 25.76): his selfie: all smiles; behind him Sadi thrashes in the waves, splashing",
       selfie(dx=0.1, d=2.4, roll=(-3, 4)), waves=0.2, foamPool=0.45, thrash=[S_POOL], clear=C_ACT, stars=['saxo']),
  shot(54, [sadi('waving_with_both_hands', at=0.45, speed=0.8, **HELP)],
       "L06-L07: Sadi in the waves, splashing, paws flapping, going under to her chin: help",
       close(S_POOL, dx=1.3, d=1.9), waves=0.2, foamPool=0.45, thrash=[S_POOL], clear=C_ACT, stars=['sadi']),
  shot(58, [sax('shuffle', **STICK)],
       "L07 into the chorus: what the swimmers see: the tower from the water, the lifeguard's back, dancing for his stick",
       low((5.2, 0.1, -5.0), (2.4, 2.2, -1.35), (4.9, 0.1, -4.6), fov=62, roll=(8, 5)), waves=0.2, foamPool=0.5, foam=True, foamY=0.7, stars=['saxo']),
  # ================= chorus A: she flaps for help, he dances her flap (L08-L10): a match cut =================
  shot(64, [sadi('waving_with_both_hands', at=0.45, speed=0.8, **HELP)],
       "L08: MATCH CUT, part 1: Sadi, centred, paws flapping by her ears, splashing and going under: help!",
       view((S_POOL[0], 1.55, S_POOL[1] + 2.1), (S_POOL[0], 0.2, S_POOL[1]), 60), waves=0.2, foamPool=0.5, thrash=[S_POOL], clear=C_ACT, stars=['sadi']),
  shot(68, [sax('hip_hop_dancing_side_to_side', at='auto', **COPY), sadi('waving_with_both_hands', at=0.45, speed=0.8, **HELP)],
       "L08: MATCH CUT, part 2: his selfie, centred the same way: he flaps his paws by his ears on the beat, grinning, her distress signal turned into his new dance move, Sadi splashing behind him",
       selfie(dx=0.15, d=2.3), waves=0.2, foamPool=0.55, thrash=[S_POOL], clear=C_ACT + clear((1.9, -8.6, 1.2), (0.8, -5.5, 1.2), (-1.8, -9.5, 1.2)), stars=['saxo']),
  shot(72, [kob_lounge()],
       "L09: deadpan: Kob, the foam up to her chin now",
       deadpan(LOUNGER, 0.92, 2.6, cam_y=1.45, ang=180, fov=42), foam=True, foamY=0.8, stars=['kob']),
  shot(75.5, [sadi('waving_with_both_hands', at=0.45, speed=0.8, **HELP)],
       "L09 ('beauty' 35.60): the beauty: Sadi from the side, a wave crashing over her, thrashing",
       close(S_POOL, dx=1.5, d=1.8, fov=60), waves=0.2, foamPool=0.6, thrash=[S_POOL], splash=[S_POOL[0] + 0.3, S_POOL[1] - 0.4, 0.35, 1.0], clear=C_ACT, stars=['sadi']),
  shot(79.5, [sax('shuffle', at='auto', **pov(0.0, 2.9, 2.1)), sadi('waving_with_both_hands', at=0.45, speed=0.8, **HELP), compote('standing_long_yell', at='auto', bump=0.14)],
       "L09 ('beat' 37.46): the beat: his selfie, he drops into his dance while a wave crashes over Compote behind him",
       selfie(dx=0.0, h=2.9, d=2.1, roll=(6, 2)), waves=0.2, foamPool=0.65, thrash=[S_POOL], splash=[C_POOL[0] + 0.2, C_POOL[1] - 0.3, 0.3, 1.2], clear=C_ACT, stars=['saxo']),
  shot(84, [sax('shuffle', **STICK), compote('quickly_pointing_angrily_forward', at='auto', bump=0.14, fg=True)],
       "L10: over Compote's shoulder: soaked and tossed about, she glares at the lifeguard's back up on his tower",
       view((-0.6, 0.9, -6.6), (2.0, 1.4, -2.0), 46), waves=0.2, foamPool=0.65, clear=C_ACT, stars=['compote']),
  shot(88, [sax('twist', **STICK), sadi('waving_with_both_hands', at=0.45, speed=0.8, **HELP), compote('standing_long_yell', at='auto', bump=0.14)],
       "L10: the wide: waves, foam on the deck and on the water, Sadi and Compote in trouble, and on his tower the lifeguard dancing for his stick, his back to all of it",
       view((4.6, 5.4, 5.6), (1.5, 0.0, -5.5), 62, p1=(4.4, 5.1, 5.0)), waves=0.2, foamPool=0.7, foam=True, foamY=0.8, thrash=[S_POOL], clear=C_ACT, stars=['saxo']),
  shot(92, [sax('happy_idle', at='auto', **pov(0.3, 3.3, 2.4)), sadi('waving_with_both_hands', at=0.45, speed=0.8, **HELP), compote('standing_long_yell', at='auto', bump=0.14)],
       "L10 end: his selfie, high: a big grin; the pool behind him white with foam, both of them splashing",
       selfie(dx=0.3, h=3.3, d=2.4, roll=(-4, -1)), waves=0.2, foamPool=0.8, thrash=[S_POOL, C_POOL], clear=C_ACT, stars=['saxo']),
  # ================= chorus B: the music makes you move; he backs up to the edge (L11-L13) =================
  shot(96, [kob_lounge()],
       "L11: deadpan: Kob, only her eyes and her turban above the foam",
       deadpan(LOUNGER, 0.92, 2.6, cam_y=1.45, ang=180, fov=42), foam=True, foamY=0.9, stars=['kob']),
  shot(100, [sax('hip_hop_dancing_side_to_side', at='auto', **pov(0.1, 2.7, 1.9)), sadi('waving_with_both_hands', at=0.45, speed=0.8, **HELP), compote('quickly_pointing_angrily_forward', at='auto', bump=0.14)],
       "L11: his selfie, low, close and tilted: behind him the whole pool white with foam and heaving, splashes everywhere, a pet flying off the slide, everyone in trouble",
       selfie(dx=0.1, h=2.7, d=1.9, fov=80, roll=(9, 4)), waves=0.2, foamPool=1.0, thrash=[S_POOL, C_POOL], rider=[0.4, 1.8, -5.0], splash=[[2.0, -6.0, 0.9, 1.2], [4.6, -7.2, 0.2, 1.0]], clear=C_ACT, stars=['saxo']),
  shot(104, [sax('shuffle', **STICK)],
       "L12 ('music' 50.52): he dances towards the back of his platform, stick up",
       view((5.0, 2.3, 1.8), (2.4, 2.1, -1.5), 56), waves=0.2, foamPool=0.9, foam=True, foamY=0.8, stars=['saxo']),
  shot(108, [sax('happy_idle', at='auto', mz=-0.3, **pov(0.2, 3.0, 2.2))],
       "L12 ('move' 52.84): his selfie: he steps back to fit the whole pool in, the camera pulling back",
       selfie(dx=0.2, d=2.2, p1=(TX + 0.2, 3.3, TZ + 2.9)), waves=0.2, foamPool=1.0, thrash=[S_POOL, C_POOL], clear=C_ACT, stars=['saxo']),
  shot(113.5, [sadi('waving_with_both_hands', at=0.45, speed=0.8, **HELP)],
       "L13 ('baby' 53.52): Sadi, one last call, going under",
       close(S_POOL, dx=0.5, d=2.0, fov=54), waves=0.2, foamPool=1.0, thrash=[S_POOL], clear=C_ACT, stars=['sadi']),
  shot(117.5, [sax('happy_idle', at='auto', z=TZ - 0.35, sway=5, **pov(0.2, 3.0, 2.6))],
       "L13: his selfie: right at the edge of the platform now, one more step back",
       selfie(dx=0.2, d=2.6), waves=0.2, foamPool=1.0, thrash=[S_POOL, C_POOL], clear=C_ACT, stars=['saxo']),
  shot(124, [sax('slip_and_fall_backwards', at=0.0, once=True, z=TZ - 0.4, air=True, mz=-0.6, moveAt=S(1.0), my=-1.0, myAt=S(2.5), myDur=S(1.4),
                 hold='selfie', toss={'at': S(1.2), 'to': [1.7, 4.4, -4.2], 'dur': 1.0, 'arc': 0.9, 'scale': 1.0})],
       "L13 end: from the front, at the platform's height: his heel slips off the edge; he topples backwards towards the pool, his belly and face to us, the selfie stick flying off into the night sky",
       view((2.55, 2.1, 1.6), (2.4, 2.1, -1.8), 60), waves=0.2, foamPool=1.0, stars=['saxo']),
  # ================= the drop: nobody saves him (instrumental) =================
  shot(128, [],
       "the drop's downbeat: SPLASH: he hits the water at the foot of his tower",
       view((5.2, 0.35, -4.6), (2.6, 1.0, -2.8), 58), waves=0.2, foamPool=0.6, splash=[2.6, -3.1, 0.02, 1.5], stars=['saxo']),
  shot(130, [A('saxo', 'waving_with_both_hands', *SX_W, lift=SWIM, face='world', yaw=yaw_to(SX_W, (3.3, -1.6)), at=0.45, speed=0.8, **HELP, bump=0.1)],
       "drop: he comes up flailing and splashing in the waves, his selfie stick gone",
       view((3.3, 1.7, -1.6), (2.7, 0.1, -4.0), 58), waves=0.16, thrash=[SX_W], clear=HOOKED, stars=['saxo']),
  shot(134, [sadi('bored_idle', at_=(3.15, -6.7), hold='phone', arm='R', aim=[0.45, 0.88, 0.15], upAt=0.0, yaw=yaw_to((3.15, -6.7), SX_W)),
             compote('bored_idle', at_=(2.2, -6.7), hold='phone', arm='R', aim=[0.8, 0.55, 0.2], upAt=0.0, yaw=yaw_to((2.2, -6.7), SX_W))],
       "drop: what he sees from the water: everyone holding their phones up, filming him, flashes on; Sadi and Compote in front",
       view((2.7, 0.55, -4.0), (2.65, 0.6, -8.2), 70), waves=0.12, phones=True, stare=list(SX_W), gather=[SX_W[0], SX_W[1], 3.6, 125, 235], clear=clear((3.15, -6.7, 1.0), (2.2, -6.7, 1.0), (2.7, -4.0, 1.2)), stars=['sadi', 'compote']),
  shot(138, [A('saxo', 'waving_with_both_hands', *SX_W, lift=SWIM, face='world', yaw=yaw_to(SX_W, (2.7, -9.3)), at=0.45, speed=0.8, **HELP, bump=0.1),
             sadi('bored_idle', at_=(3.15, -6.7), hold='phone', arm='R', aim=[0.45, 0.88, 0.15], upAt=0.0, yaw=yaw_to((3.15, -6.7), SX_W), fg=True),
             compote('bored_idle', at_=(2.2, -6.7), hold='phone', arm='R', aim=[0.45, 0.88, 0.15], upAt=0.0, yaw=yaw_to((2.2, -6.7), SX_W), fg=True)],
       "drop: from behind the crowd, high: a wall of glowing phone screens held up, all pointed at the lifeguard splashing in the middle",
       view((2.7, 2.3, -9.3), (2.7, 0.4, -4.0), 54), waves=0.12, phones=True, stare=list(SX_W), gather=[SX_W[0], SX_W[1], 3.1, 125, 235], thrash=[SX_W], clear=clear((3.15, -6.7, 1.0), (2.2, -6.7, 1.0), (2.7, -4.0, 1.2), (2.7, -9.3, 1.4)), stars=['saxo']),
  shot(142, [A('kob', 'bored_idle', *KOB_EDGE, face='world', yaw=yaw_to(KOB_EDGE, SX_W), at='auto', hold='hook', arm='R', aim=[0.45, 0.35, 0.82], upAt=0.0)],
       "drop: Kob, dry, walks up to the pool's edge with the rescue hook, sighing",
       deadpan(KOB_EDGE, 0.95, 2.4, ang=-150, fov=44), waves=0.12, stars=['kob']),
  shot(146, [A('saxo', 'waving_with_both_hands', *SX_W, lift=SWIM, face='world', yaw=yaw_to(SX_W, (6.4, -7.6)), at=0.45, speed=0.8, **HELP, bump=0.1),
             A('kob', 'bored_idle', *KOB_EDGE, face='world', yaw=yaw_to(KOB_EDGE, SX_W), at='auto', hold='hook', hookTo='saxo', arm='R', aim=[0.2, 0.3, 0.93], upAt=0.0)],
       "drop: from over the water: without a drop on her, she reaches out and hooks him by the collar",
       view((6.4, 2.8, -7.6), (3.37, 0.7, -2.9), 58), waves=0.12, clear=HOOKED + clear((5.6, -4.2, 1.0), (5.4, -6.4, 1.2)), stars=['kob', 'saxo']),
  shot(150, [A('saxo', 'happy_idle', *SX_W, lift=SWIM + 1.4, face='world', yaw=180, at='auto', air=True, noShadow=True, sway=4, holdL='selfiepov', arm='L', aim=[0.0, 0.42, 0.91], upAt=0.0),
             A('kob', 'bored_idle', *KOB_EDGE, face='world', yaw=yaw_to(KOB_EDGE, SX_W), at='auto', hold='hook', hookTo='saxo', arm='R', aim=[0.2, 0.55, 0.81], upAt=0.0)],
       "drop: his selfie again, the stick in his paw: fished out, he dangles from Kob's pole by the collar over the water and grins into his camera; behind him Kob holds the pole, deadpan",
       view((SX_W[0], 2.9, SX_W[1] - 2.3), (SX_W[0], 1.6, SX_W[1]), 76, roll=[-4, 3], hand=0.9), waves=0.12, clear=HOOKED + clear((5.6, -4.2, 1.0)), stars=['saxo', 'kob']),
  shot(156, [A('saxo', 'happy_idle', *SX_W, lift=SWIM + 1.4, face='world', yaw=yaw_to(SX_W, (7.4, -8.8)), at='auto', air=True, noShadow=True, my=-2.1, myAt=0.2, myDur=0.22),
             A('kob', 'bored_idle', *KOB_EDGE, face='world', yaw=yaw_to(KOB_EDGE, SX_W), at='auto', hold='hook', hookTo='saxo', arm='R', aim=[0.2, 0.4, 0.89], upAt=0.0)],
       "BUTTON (the last bar's downbeat): from over the water, deadpan, Kob dunks him straight back in with the pole: splash, the end",
       view((7.4, 3.1, -8.8), (3.39, 0.9, -3.07), 58), waves=0.12, splash=[SX_W[0], SX_W[1], 0.4, 1.3], noPool=True, stars=['kob']),
]

clips = {a['clip'] for s in shots for a in s['actors']}
BASE = {'tpose', 'gangnam', 'twist', 'macarena', 'silly_twist', 'chicken', 'twerk', 'ymca', 'robot', 'shopping_cart', 'running_man', 'moonwalk', 'shuffle', 'tut', 'booty_step', 'arm_wave', 'snake', 'shimmy', 'charleston', 'samba', 'belly', 'northern_soul_spin',
        'skate_push', 'skate_idle', 'uppercut_atk', 'uppercut_vic', 'slam_atk', 'slam_vic'}
ep = {
  'date': '2026-09-27', 'n': 4,
  'song': {'title': 'Beauty And A Beat', 'artist': 'Justin Bieber, Nicki Minaj', 'window': [15.62, 90.62], 'bpm': 128.0},
  'logline': "The water park's new lifeguard spends his first night filming himself on his tower, his back to the pool, "
             "while it goes wrong behind him: Sadi waves for help and he copies her wave as a dance move, Compote is "
             "tossed on the waves, Kob sinks into the foam. On the drop he falls in himself, and nobody saves him: "
             "they're all filming. Kob, who won't touch the water, fishes him out with the hook; he pulls out his "
             "selfie stick again, and she dunks him back in.",
  'new': ['pool map (a water park at night: a glowing wave pool with waves, the lifeguard tower, tube slides into '
          'the pool, palms and string lights, a tiki bar, podiums under UV light, Kob\'s lounger under a parasol, foam '
          'cannons; pets swimming, on rings, dancing, and filming with phones; flags waves, foam, splash, rider, '
          'riders, phones, stare, noPool, clear)',
          'props selfie (a selfie stick with an action camera looking back at the holder) and hook (the rescue pole, '
          'stretched from the paw to what it hooks: a point, or a character\'s collar with the actor field hookTo)',
          'the selfie point of view as a recurring camera (his own stick\'s lens, the story happening behind him)',
          'costumes: Saxo lifeguard (red swim shorts, a white tank top with a red cross, a red whistle) and Kob spa '
          '(a white bathrobe, a pink towel turban, slippers)'],
  'notes': "A throwback trending again, not the queue (empty): Beauty And A Beat (2012) at #10 on Spotify's global "
           "daily chart (3.2M streams) on 2026-09-26 and 660k videos on its official TikTok sound. The clip: 'three "
           "hours of personal footage stolen from the musician', filmed on a selfie stick with a fish-eye lens at a "
           "night party in a water park: the glowing wave pool, tube slides lit green, tiki huts, dancers on round "
           "podiums under purple light, a foam party, the camera lying on the pool floor, a floating platform in the "
           "pool. Ours keeps the selfie stick and the water park and makes it a job fail (never used): the "
           "lifeguard who films himself with his back to the pool. Whole cast: Saxo (the lifeguard: the joke is on "
           "him twice), Sadi (the romance: she thinks his kiss is for her; the reality check: she films him drowning), "
           "Kob (never impressed, the cat who won't touch water: foam to the eyes, and the only one who helps, with a "
           "hook, staying dry, then dunks him), Compote (always angry: the slide lands a pet on her, the waves toss "
           "her; she points at him, then films him).",
  'with': ['sadi', 'kob', 'compote'],
  'clips': sorted(clips - BASE),
  'shots': shots,
  'yt': 'end',
  'tags': {'structure': 'job fail', 'scenes': ['selfie', 'rescue hook'], 'cast': ['saxo', 'sadi', 'kob', 'compote'], 'hook': 'lyric',
           'maps': ['pool'], 'ref': 'none',
           'lyric_literal': "L00/L01 show off (he flexes and poses for his selfie stick), L04 party (the foam cannons fire), L05 show (he shows off his moves), L09 beauty / beat (Sadi in the waves / him dropping into his dance), L12 music / move (he dances back to fit the pool in), the drop (he drops off his tower)",
           'experiment': "Does a found-footage selfie device (the lead films himself in the foreground while the story goes wrong behind him, the song video's own camera) beat our third-person episodes on shares, on a throwback trending again?"},
}
out = os.path.join(os.path.dirname(__file__), '2026-09-27-4.json')
json.dump(ep, open(out, 'w'), ensure_ascii=False, indent=1)
print(out, len(shots), 'shots', len(ep['clips']), 'clips', 'end', END)
starts = [T(s['beat']) if i else 0 for i, s in enumerate(shots)]
print('sheet times:', ','.join(str(round((starts[i] + (starts[i + 1] if i + 1 < len(shots) else END)) / 2, 2)) for i in range(len(shots))))
