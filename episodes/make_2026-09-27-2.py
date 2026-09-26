# make_2026-09-27-2.py: writes episodes/2026-09-27-2.json, "Dans ma bulle (Veridis Remix)" (Romsii), from the user's
# queue (no instructions). "In his bubble": earphones in, Saxo lives a moody French music video, a trench coat on a
# twilight beach, a date with a girl in a beret by the Ferris wheel at the end of the pier, alone under a giant moon, a
# stroll down the avenue Montaigne with an empty wallet, and at last he floats off to the moon in a giant bubble...
# which pops: he has been on the night bus all along, sprawled over two seats (his bag on the other), staring up at the
# round ceiling light (the moon) and at the perfume ad on the wall (the girl), Kob at the wheel (she ran the Ferris
# wheel's ticket kiosk in her driver's uniform), and Compote, who has glared at him in every place of his dream, is the
# passenger standing next to him the whole ride: she popped it with her carrot. He blows another. She pops that too.
# Beats count from B0 = 0.020 s at 135 BPM (cut time = B0 + b * 0.4444 s; a bar = 4 beats = 1.778 s); the cut is
# 71.151-157.4 s of the song (episodes/2026-09-27-2.config.js). Lyric lines are named by number (L00-L29, see
# episodes/2026-09-27-2.lyrics.js): the lyrics stay in their files. Verse 2 b0-b32 (L00-L07), the bridge b32-b64
# (L08-L11), the break b64-b96 (L12-L17; its one silent beat b94-b95), chorus 2 b96-b128 (L18-L21), the drop b128-b160
# (L22, L23), the outro b160-b192 (L24-L29; the beat drops out on b160: the pop), then the song's own fade to 86.2 s.
# Action words (whitelisted tags, kit seconds): L00 earphones 0.91 ears 1.85, L01 sun 3.57, L03 morning 6.83, L07 wait
# 14.05, L09 weird 18.85, L12 + L13 all alone 28.87 / 30.65, L16 stone 39.19, L17 shadow 40.11 light 40.81, L18 baby
# 43.47 bubble 46.31, L19 phone 48.01, L20 avenue Montaigne 51.49 money 53.41, L21 sorrow 55.19 raise my head 55.53
# look at the moon 56.67, L23 raise my head 69.87 moon 70.87, L24 bubble 72.57, L26 stone 76.55, L27 light 77.97,
# L28 bubble 81.39, L29 bubble 84.91.
import json, math, os, sys
sys.path.insert(0, os.path.dirname(__file__))
from cam import view, swoop, low, deadpan, orbit, reveal

P, B0 = 60 / 135, 0.02
T = lambda b: round(B0 + b * P, 3)                 # beat -> cut seconds
END = 86.2
LOOK = {'saxo': 'trench', 'sadi': 'paris', 'kob': 'driver', 'compote': 'compote'}
# ---- the shore (src/maps11.js SHORE) ----
DECK = 2.6; WALK_Z = -1.3
BENCH = (12.0, -59.5); BSEAT = DECK + 0.3; BZ = BENCH[1] - 0.13      # the bench faces +z: a sitter's mark 0.13 m towards its back
KIOSK = (16.4, -56.75)                                             # the operator behind the ticket counter, facing +z
MOON = (6.0, 34.0, -172.0)
# ---- the bus (src/maps11.js BUS): Saxo in the window seat of the right side's middle row, facing the front ----
SEAT = 0.3; SB = (0.97, 1.03); AISLE = (0.02, 0.92); DRIVER = (-0.72, -4.62); DOME = (0.72, 2.42, 0.95); POSTER = (1.2, 1.28, 0.2)
# ---- Paris (src/maps4.js, flag boutique): the shopfront faces +x at x = -6.5, its door at z = -2 ----
DOOR = (-6.5, -2.0)

def A(who, clip, x, z, **o):
    return {'who': who, 'look': o.pop('look', LOOK[who]), 'clip': clip, 'x': round(x, 3), 'z': round(z, 3), **o}
def yaw_to(a, b): return round(math.degrees(math.atan2(b[0] - a[0], b[1] - a[1])), 1)
def seated(**o):                                     # Saxo in his bus seat, earbuds in
    return A('saxo', o.pop('clip', 'sitting_talking'), *SB, lift=SEAT, face='world', yaw=180, buds=True, **o)
def compote_bus(**o):                                # Compote standing in the aisle by his row, glaring at him, her carrot in her paw
    return A('compote', o.pop('clip', 'bored_idle'), *AISLE, face='world', yaw=o.pop('yaw', 88), hold='carrot', **o)
def compote_near(**o):                               # Compote leaning in by his row, within a carrot's reach of his face (off the lens but her paw)
    return A('compote', o.pop('clip', 'bored_idle'), 0.3, 0.45, face='world', yaw=103, hold='carrotpoke', fg=True, star=False, **o)
def shot(beat, mp, actors, lyric, v, **o):
    c, focus = v
    return {'beat': beat, 'kind': 'dance', 'map': mp, 'actors': actors, 'lyric': lyric, 'cam': c, 'focus': focus, **o}
EARS = {'arm': 'both', 'aim': 'caramell', 'flap': 0}   # both paws up by the ears: pushing the earbuds in

shots = [
  # ================= verse 2: earphones in, the dream begins (L00-L07) =================
  shot(0, 'shore', [A('saxo', 'bored_idle', 8.3, -1.35, **EARS, upAt=0.85, buds=1.15),
                    A('compote', 'bored_idle', 9.8, -0.5, face='world', yaw=yaw_to((9.8, -0.5), (8.3, -1.35)), fg=True, star=False)],
       "HOOK, L00 ('earphones' 0.91, 'ears' 1.85): over a glaring bunny's shoulder (Compote, the watcher, from the first frame): at the waterline at dusk, Saxo in a camel trench coat pushes his earbuds in, paws to his ears, and the music starts",
       view((10.15, 1.12, 0.3), (8.35, 1.0, -1.35), 50, p1=(9.95, 1.1, 0.12), roll=[-4, -2], hand=0.2), stars=['saxo']),
  shot(4, 'shore', [A('saxo', 'bored_idle', 8.3, -1.35, face='world', yaw=190, buds=True)],
       "L01 ('sun' 3.57): behind him, low: the sun setting into the sea, its path on the water, the wind of a French film",
       view((9.6, 0.45, 0.8), (8.17, 1.15, -2.93), 56, p1=(9.5, 0.43, 0.45))),
  shot(8, 'shore', [A('saxo', 'happy_walk', 6.7, -1.35, mx=-1.3, face='world', yaw=-90, speed=0.8, buds=True)],
       "L02: the moody walk along the waterline, the pier and its Ferris wheel behind, the tide washing round his shoes",
       view((5.0, 0.36, 2.35), (6.0, 0.85, -1.35), 54, p1=(5.1, 0.3, 1.85), roll=[-6, -4], hand=0.3), stars=['saxo']),
  shot(12, 'shore', [A('saxo', 'standing_praying_while_swaying', -0.3, -0.95, buds=True), A('compote', 'happy_run', 1.9, -2.3, mx=-1.5, face='world', yaw=-90, speed=0.75, reveal=0.6)],
       "L03 ('morning' 6.83): swaying to his music; behind him a jogger in a plum hoodie runs past along the wet sand: Compote",
       view((0.62, 0.95, 2.3), (0.15, 0.95, -1.6), 50, p1=(0.58, 0.95, 2.0)), stars=['saxo']),
  shot(16, 'shore', [A('compote', 'bored_idle', -1.2, -2.2, face='world', yaw=51)],
       "L04: the jogger has stopped dead in the wash and glares at him (the watcher, frontal)",
       deadpan((-1.2, -2.2), 0.92, 2.1, cam_y=0.98, push=0.14, fov=40, ang=51), stars=['compote']),
  shot(20, 'shore', [A('saxo', 'hip_hop_dancing_really_twirl', 0.3, -1.3, buds=True)],
       "L05: he dances alone on the wet sand, like the girl in the clip, the sea and the sky all pink",
       orbit((0.3, -1.3), 2.1, 0.35, -32, 28, 0.98), bubbles=14, bubblesAt=[0.3, -1.3]),
  shot(24, 'shore', [A('saxo', 'happy_walk', 12.25, 2.9, mz=-1.1, face='world', yaw=180, speed=0.7, buds=True)],
       "L06: under the pier, between the pilings, walking towards the last of the light",
       view((12.4, 0.55, 5.6), (12.2, 1.0, 0.6), 50, p1=(12.35, 0.52, 5.1), roll=[4, 2])),
  shot(28, 'shore', [A('saxo', 'being_surprised_and_looking_right', 14.3, -58.0, lift=DECK, buds=True, at=0.1), A('kob', 'bored_idle', *KIOSK, lift=DECK, face='world', yaw=0)],
       "L07 ('wait' 14.05): he waits at the end of the pier, under the Ferris wheel, looking round; the ticket kiosk's attendant stares, a cat in a bus driver's cap",
       view((17.5, DECK + 1.2, -52.0), (14.6, DECK + 1.0, -58.4), 50, p1=(17.35, DECK + 1.18, -52.4), fy=DECK), stars=['saxo', 'kob']),
  # ================= the bridge: the date at the Ferris wheel (L08-L11) =================
  shot(32, 'shore', [A('sadi', 'blowing_a_kiss', 12.0, -58.7, lift=DECK, face='world', yaw=0)],
       "L08 (15.35): she appears, framed in the Ferris wheel's lights: the girl in the red beret (exactly the pose of the ad he will turn out to be staring at)",
       view((12.0, DECK + 0.9, -56.5), (12.0, DECK + 0.88, -58.7), 36, p1=(12.0, DECK + 0.9, -56.75), ease='lin', fy=DECK), stars=['sadi']),
  shot(36, 'shore', [A('saxo', 'happy_idle', 11.62, -59.0, lift=DECK, face='world', yaw=90, buds=True, arm='L', aim=[0.25, 0.15, 0.95], upAt=0.3),
                     A('sadi', 'happy_idle', 12.38, -59.0, lift=DECK, face='world', yaw=-90, arm='R', aim=[0.25, 0.15, 0.95], upAt=0.3, at=0.8)],
       "L09: face to face under the wheel, hand in hand",
       low((12.0, DECK + 0.32, -55.9), (12.0, DECK + 0.88, -59.0), (12.0, DECK + 0.3, -56.4), fov=56, roll=(-8, -5), fy=DECK)),
  shot(40, 'shore', [A('compote', 'bored_idle', 8.1, -62.2, lift=DECK, face='world', yaw=53)],
       "L09 ('weird' 18.85): the same plum hoodie, alone at the pier's rail, glaring at the lovebirds: Compote again",
       deadpan((8.1, -62.2), DECK + 0.92, 2.1, cam_y=DECK + 0.98, push=0.12, fov=40, ang=53), stars=['compote']),
  shot(44, 'shore', [A('saxo', 'sitting_talking', 11.6, BZ, lift=BSEAT, face='world', yaw=0, buds=True), A('sadi', 'sitting_talking', 12.4, BZ, lift=BSEAT, face='world', yaw=0, at=1.2)],
       "L10: the date on the bench, the Ferris wheel turning behind them: the postcard",
       view((12.0, DECK + 1.05, -56.3), (12.0, DECK + 0.85, -59.6), 50, p1=(12.0, DECK + 1.0, -56.9), fy=DECK)),
  shot(48, 'shore', [A('saxo', 'standing_praying_while_swaying', 11.7, -58.3, lift=DECK, face='world', yaw=80, buds=True), A('sadi', 'standing_praying_while_swaying', 12.35, -58.3, lift=DECK, face='world', yaw=-80, at=0.6)],
       "L10-L11: a slow dance under the string lights, swaying, the wheel's bulbs chasing round behind them",
       orbit((12.02, -58.3), 2.3, DECK + 0.4, -38, 22, DECK + 0.9)),
  shot(52, 'shore', [A('saxo', 'happy_idle', 11.6, -58.85, lift=DECK, face='world', yaw=180, fg=True, buds=True), A('sadi', 'happy_idle', 12.4, -58.85, lift=DECK, face='world', yaw=180, fg=True)],
       "L11: from behind the two of them, low, up at the Ferris wheel turning against the pink sky",
       view((12.05, DECK + 0.55, -55.7), (12.0, DECK + 3.0, -66.0), 60, p1=(12.05, DECK + 0.52, -56.05), roll=[5, 2])),
  shot(56, 'shore', [A('saxo', 'happy_idle', 11.585, -58.5, lift=DECK, face='world', yaw=90, buds=True), A('sadi', 'happy_idle', 12.415, -58.5, lift=DECK, face='world', yaw=-90, at=0.8)],
       "L11: nose to nose: the kiss, in profile against the wheel's lights",
       view((12.0, DECK + 0.88, -55.85), (12.0, DECK + 0.84, -58.5), 46, p1=(12.0, DECK + 0.88, -56.1), ease='lin', fy=DECK), stars=['saxo', 'sadi']),
  shot(60, 'shore', [A('saxo', 'death_falling_backwards', 11.6, -58.4, lift=DECK, face='world', yaw=110, once=True, at=1.2, ground='mesh', buds=True)],
       "L11 (end): and he swoons, flat on his back on the deck, blissful",
       view((11.25, DECK + 1.25, -55.1), (11.35, DECK + 0.62, -58.6), 50, p1=(11.3, DECK + 1.3, -55.3), roll=[6, 4], hand=0.3, fy=DECK)),
  # ================= the break: all alone (L12-L17) =================
  shot(64, 'shore', [A('saxo', 'laying_idle', 11.6, -58.6, lift=DECK, face='world', yaw=110, ground='mesh', buds=True)],
       "L12 ('all alone' 28.87): night: he comes to alone on the empty deck, the giant moon over the sea, the kiosk dark",
       view((11.9, DECK + 3.6, -57.0), (11.5, DECK, -58.9), 50, p1=(11.95, DECK + 4.6, -56.6), ease='lin', fy=DECK), night=True, noguests=True, lightsOff=0.0),
  shot(68, 'shore', [A('saxo', 'happy_walk', 2.2, -1.3, mx=-0.9, face='world', yaw=-100, speed=0.6, buds=True)],
       "L13 ('all alone' 30.65): a tiny figure walking the moonlit waterline, the moon's path on the sea",
       view((3.4, 1.9, 6.4), (1.2, 1.2, -6.0), 44, p1=(3.3, 1.85, 6.0)), night=True, noguests=True),
  shot(72, 'shore', [A('saxo', 'gaming', 11.6, BZ, lift=BSEAT, face='world', yaw=0, hold='phone', at=1.6, speed=0.25, buds=True)],
       "L14 (32.67-33.47): alone on the bench at night, he looks at her photo on his phone",
       view((12.2, DECK + 1.12, -57.15), (11.7, DECK + 1.12, -59.5), 46, fy=DECK), night=True, noguests=True),
  shot(76, 'shore', [A('compote', 'sitting_talking', 12.4, BZ, lift=BSEAT, face='world', yaw=0, speed=0)],
       "L15: at the other end of the same bench: Compote, glaring at him (every place he goes, she's there)",
       deadpan((12.4, BZ), BSEAT + 0.86, 2.2, cam_y=BSEAT + 0.9, push=0.1, fov=40, ang=-8), night=True, noguests=True, stars=['compote']),
  shot(80, 'shore', [A('saxo', 'happy_walk', 0.6, -1.3, mz=-0.5, face='world', yaw=180, speed=0.55, buds=True)],
       "L15 (35.49-37.97): he walks down to the water's edge, the moon's path at his feet",
       view((0.95, 0.5, 2.1), (0.4, 1.4, -5.0), 52, p1=(0.9, 0.48, 1.7), roll=[-5, -3]), night=True, noguests=True),
  shot(84, 'shore', [A('saxo', 'bored_idle', 0.5, -1.85, hold='stone', arm='R', aim=[0.25, 0.45, 0.85], upAt=0.1, buds=True)],
       "L16: a flat stone in his paw, he weighs it",
       view((1.2, 1.0, 0.4), (0.5, 0.95, -1.85), 44, p1=(1.12, 1.0, 0.2)), night=True, noguests=True),
  shot(88, 'shore', [A('saxo', 'throwing_frisbee_forward', 0.5, -1.85, face='world', yaw=172, at=0.25, once=True, hold='stone', buds=True, toss={'at': 0.3, 'to': [0.95, -0.02, -3.7], 'dur': 0.36, 'arc': 0.3, 'splash': True, 'scale': 1.5})],
       "L16 ('stone' 39.19): he skims it... it sinks at once, plop",
       view((3.4, 0.7, 0.2), (0.8, 0.6, -2.6), 54), night=True, noguests=True),
  shot(90, 'shore', [A('saxo', 'bored_idle', 11.7, -54.0, lift=DECK, face='world', yaw=180, fg=True, buds=True)],
       "L17 ('shadow' 40.11, 'light' 40.81): the pier's lights go out, then blaze back on",
       view((11.4, DECK + 0.9, -51.2), (12.0, DECK + 4.2, -66.0), 56, fy=DECK), night=True, noguests=True, lightsOff=0.08, lightsOn=0.72),
  shot(94, 'shore', [A('saxo', 'bored_idle', 0.3, -1.6, face='world', yaw=175, buds=True)],
       "(41.80, the silent beat) blackout: nothing but the moon and his silhouette",
       view((0.1, 0.4, 3.2), (0.4, 2.4, -8.0), 50), night=True, noguests=True, blackout=[0.0, 0.9], still=True),
  # ================= chorus 2: the dream life (L18-L21) =================
  shot(96, 'shore', [A('saxo', 'twist', 11.55, -58.2, lift=DECK, buds=True), A('sadi', 'salsa_dancing_double_twirl', 12.5, -58.2, lift=DECK)],
       "L18 ('baby' 43.47): the drop: the wheel blazes, and she's back: they dance under it",
       low((12.02, DECK + 0.26, -55.1), (12.02, DECK + 0.9, -58.2), (12.02, DECK + 0.23, -55.7), fov=58, roll=(-9, -6), fy=DECK), night=True, lightsOn=0.0, wheel=2.5),
  shot(100, 'shore', [A('saxo', 'twist', 11.55, -58.2, lift=DECK, buds=True, at=0.8), A('sadi', 'salsa_dancing_double_twirl', 12.5, -58.2, lift=DECK, at=0.9)],
       "L18: low among the string lights, dutch, the two of them dancing",
       low((13.8, DECK + 0.25, -55.5), (12.0, DECK + 0.85, -58.2), (13.5, DECK + 0.22, -55.9), fov=60, roll=(-11, -7), fy=DECK), night=True, lightsOn=0.0, wheel=2.5),
  shot(104, 'shore', [A('saxo', 'happy_idle', 11.9, -58.2, lift=DECK, face='world', yaw=12, buds=True, gum=[0.0, 1.1, 0.22, None])],
       "L18 ('bubble' 46.31): close: he blows a pink bubble-gum bubble on the word",
       view((12.1, DECK + 1.05, -56.15), (11.9, DECK + 1.0, -58.2), 44, fy=DECK), night=True, lightsOn=0.0, stars=['saxo']),
  shot(108, 'shore', [A('saxo', 'happy_idle', 11.62, -58.3, lift=DECK, face='world', yaw=8, buds=True), A('sadi', 'happy_idle', 12.36, -58.3, lift=DECK, face='world', yaw=-8, hold='phone', arm='R', aim='phone'),
                      A('compote', 'bored_idle', 12.0, -59.45, lift=BSEAT, face='world', yaw=0)],
       "L19 ('phone' 48.01): a selfie, the wheel behind them... and behind them, photobombing with a glare: Compote",
       view((12.0, DECK + 1.55, -55.35), (12.0, DECK + 1.12, -58.8), 50, fy=DECK), night=True, lightsOn=0.0),
  shot(112, 'paris', [A('saxo', 'happy_walk', -2.7, -5.4, mz=1.3, face='world', yaw=0, speed=0.95, sway=6, swayEvery=0.5, buds=True), A('sadi', 'happy_walk', -1.9, -5.2, mz=1.3, face='world', yaw=0, speed=0.95, sway=6, swayEvery=0.5)],
       "L20 ('avenue Montaigne' 51.49): Paris at blue hour: they strut down the avenue like a runway, the Eiffel Tower sparkling behind them",
       low((-2.3, 0.3, -1.2), (-2.3, 0.9, -4.6), (-2.3, 0.28, -0.9), fov=58, roll=(-6, -4)), boutique=True),
  shot(116, 'paris', [A('compote', 'shaking_head_no_dismissively', -5.0, -0.85, look='bouncer', face='world', yaw=110), A('saxo', 'bored_idle', -3.95, -1.75, face='world', yaw=-80, buds=True)],
       "L20: the boutique's velvet rope, and the doorwoman shakes her head: Compote, in black and shades",
       view((-2.25, 1.3, 2.4), (-4.45, 1.0, -1.3), 50, p1=(-2.35, 1.28, 2.1)), boutique=True, stars=['compote', 'saxo']),
  shot(120, 'paris', [A('saxo', 'bored_idle', -3.9, -1.9, hold='wallet', arm='both', aim=[-0.05, 0.3, 0.95], moth=0.35, buds=True)],
       "L20 ('money' 53.41): he opens his wallet: empty; a moth flutters out",
       view((-2.55, 1.18, 0.05), (-3.85, 1.05, -1.85), 58, p1=(-2.62, 1.16, -0.08)), boutique=True, stars=['saxo']),
  shot(124, 'shore', [A('saxo', 'disappointed_awe_shucks', 0.3, -1.4, face='world', yaw=170, buds=True)],
       "L21 ('sorrow' 55.19, 'raise my head' 55.53): back on the beach at night, low; he lifts his head...",
       view((0.55, 0.7, 1.2), (0.3, 1.0, -1.4), 48), night=True, noguests=True, stars=['saxo']),
  shot(126, 'shore', [A('saxo', 'bored_idle', 0.3, -1.4, face='world', yaw=178, fg=True, buds=True)],
       "L21 ('look at the moon' 56.67): ...and the giant full moon fills the sky over the sea",
       view((0.45, 0.95, 2.1), (1.2, 3.2, -12.0), 56, p1=(0.45, 0.93, 1.9)), night=True, noguests=True),
  # ================= the drop: into the bubble, off to the moon =================
  shot(128, 'shore', [A('saxo', 'happy_idle', 0.3, -1.4, face='world', yaw=10, buds=True, gum=[0.0, 0.45, 0.36, 0.5], bubble={'r': 0.95, 'at': 0.45, 'full': 0.95}, my=0.6, myAt=0.45, myDur=0.6, air=True)],
       "(the drop) his gum bubble grows... and grows... and becomes a giant bubble round him, lifting him off the sand",
       view((0.55, 1.05, 2.65), (0.3, 1.15, -1.4), 52, p1=(0.55, 1.2, 3.0)), night=True, noguests=True),
  shot(132, 'shore', [A('saxo', 'standing_praying_while_swaying', 0.3, -1.4, lift=0.6, my=2.4, air=True, noShadow=True, buds=True, bubble={'r': 0.95})],
       "(the drop) he floats up in his bubble, dancing in it, over the beach",
       reveal((0.7, 1.4, 1.6), (0.3, 2.0, -1.4), (1.4, 1.1, 6.5)), night=True, noguests=True),
  shot(136, 'shore', [A('saxo', 'standing_praying_while_swaying', 1.0, -9.5, lift=3.0, air=True, noShadow=True, buds=True, bubble={'r': 0.95}, at=0.5)],
       "(the drop) from the sand: his bubble drifting across the giant moon",
       view((0.3, 0.4, 7.5), (1.05, 3.35, -9.5), 40), night=True, noguests=True),
  shot(140, 'shore', [A('sadi', 'waving', 12.0, -56.5, lift=DECK, face='world', yaw=0)],
       "L22 (62.49-64.98): on the pier under the wheel, she waves goodbye up at the sky where his bubble floats away",
       view((12.3, DECK + 0.62, -53.7), (12.0, DECK + 1.3, -56.5), 50, fy=DECK), night=True, noguests=True, stars=['sadi']),
  shot(144, 'shore', [A('saxo', 'standing_praying_while_swaying', 2.0, -8.0, lift=4.0, air=True, noShadow=True, buds=True, bubble={'r': 0.95, 'see': 0.8}, at=1.1)],
       "(the drop) high over the sea, blissful, dancing in his bubble",
       orbit((2.0, -8.0), 3.1, 4.35, -30, 25, 4.95, hand=0.6), night=True, noguests=True),
  shot(148, 'shore', [A('compote', 'bored_idle', 11.8, -53.6, lift=DECK, face='world', yaw=0, hold='carrotpoke', arm='R', aim=[0.6, 0.7, 0.3], upAt=0.35)],
       "(the drop) below on the pier, Compote glares up at the sky and raises her carrot like a pin, the moon behind her",
       view((12.05, DECK + 0.72, -51.05), (11.75, DECK + 1.2, -53.6), 48, fy=DECK), night=True, noguests=True, stars=['compote']),
  shot(152, 'shore', [A('saxo', 'happy_idle', 3.0, -12.0, lift=5.0, air=True, noShadow=True, buds=True, bubble={'r': 0.95, 'see': 0.82}, face='world', yaw=15)],
       "(the drop) close on him inside the bubble, eyes closed, the moon behind",
       view((3.25, 6.0, -9.9), (3.0, 5.95, -12.0), 44), night=True, noguests=True),
  shot(156, 'shore', [A('saxo', 'bored_idle', 3.0, -12.0, lift=5.0, air=True, noShadow=True, buds=True, bubble={'r': 0.95, 'see': 0.85}, face='world', yaw=180, fg=True, arm='R', aim=[0.5, 0.75, 0.2], upAt=0.7)],
       "L23 ('raise my head' 69.87, 'moon' 70.87): from behind him, his bubble right in front of the moon's face, his paw reaching up to it",
       view((2.89, 4.97, -6.1), (3.0, 6.0, -12.0), 50, p1=(2.9, 5.05, -6.6)), night=True, noguests=True),
  # ================= the outro: the bubble pops (the beat drops out on b160) =================
  shot(160, 'bus', [seated(clip='celebrating_after_a_win_while_seated', at=0.4, speed=0.35, gum=[0.0, 0.0, 0.3, 0.02], splat=0.06), compote_near(arm='R', aim=[0.15, 0.3, 0.95], upAt=0.0)],
       "POP (71.13, the beat drops out): close, the bubble bursts in his face, pink gum everywhere, a carrot poking in from the side: Compote's",
       view((0.9, 1.28, -1.3), (0.92, 1.05, 0.9), 54), clear=[[0.97, -1.0, 0.3]], stars=['saxo']),
  shot(162, 'bus', [seated(clip='celebrating_after_a_win_while_seated', at=1.1, speed=0.35, splat=0.0), compote_bus()],
       "L24 ('bubble' 72.57): the night bus. He's in his seat, his bag on the other one, gum all over his face, earbuds in; Compote stands over him, carrot in paw; every passenger is staring",
       view((-0.25, 2.05, -3.4), (0.55, 0.85, 1.4), 54, p1=(-0.2, 2.0, -3.1)), stare=list(SB), stars=['saxo', 'compote']),
  shot(164, 'bus', [],
       "L25: the moon he saw: the round light in the bus ceiling, right above his seat",
       view((0.9, 1.1, 1.08), (DOME[0], DOME[1], DOME[2]), 50, p1=(0.9, 1.1, 1.02)), stars=['saxo']),
  shot(168, 'bus', [],
       "L26 ('stone' 76.55): what he's been staring at: the perfume ad on the wall in front of his seat, BULLE, the Ferris wheel and the sunset behind her",
       view((-0.85, 1.34, 0.26), (1.18, 1.28, 0.2), 46, p1=(-0.7, 1.33, 0.25), ease='lin'), stars=['sadi']),
  shot(172, 'bus', [A('kob', 'male_driving_a_car', *DRIVER, lift=SEAT, face='world', yaw=180)],
       "L27 ('light' 77.97): the ticket girl at the Ferris wheel: the bus driver, deadpan at the wheel; the lights flicker",
       deadpan(DRIVER, 1.22, 1.52, cam_y=1.3, push=0.06, fov=40, ang=180), flicker=[1.28, 1.78], stars=['kob']),
  shot(176, 'bus', [],
       "L27: what he sees now: every passenger in the bus, turned round, staring at him",
       view((0.75, 1.5, 0.7), (0.2, 0.95, 4.2), 54, p1=(0.75, 1.48, 0.85)), stare=list(SB), stars=['saxo']),
  shot(180, 'bus', [seated(clip='sitting_talking', at=0.0, speed=0.06, splat=0.0, gum=[0.5, 1.75, 0.2, None])],
       "L28 ('bubble' 81.39): unbothered, eyes on the lens, he starts on a new bubble: back in his bubble",
       view((0.92, 1.25, -1.25), (0.97, 1.02, 0.95), 50), clear=[[0.97, -1.0, 0.3]], stars=['saxo']),
  shot(184, 'bus', [seated(clip='sitting_talking', at=0.11, speed=0.05, splat=0.0, gum=[0.0, 1.5, 0.34, None]), compote_near(arm='R', aim=[0.15, 0.35, 0.92], upAt=0.9)],
       "L29: the bubble swells straight at the lens over his whole face... and the tip of a carrot comes in from the side",
       view((0.92, 1.25, -1.25), (0.97, 1.02, 0.95), 50, p1=(0.92, 1.25, -1.1)), clear=[[0.97, -1.0, 0.3]], stars=['saxo']),
  shot(188, 'bus', [seated(clip='sitting_talking', at=0.2, speed=0.04, splat=0.0, gum=[0.0, 0.0, 0.34, round(T(191) - T(188), 3)]), compote_near(arm='R', aim=[0.15, 0.35, 0.92], upAt=0.0)],
       "L29 ('bubble' 84.91): POP, again, the pink bits flying at the lens",
       view((0.92, 1.25, -1.25), (0.97, 1.02, 0.95), 50), clear=[[0.97, -1.0, 0.3]], stars=['saxo']),
  shot(192, 'bus', [seated(clip='sitting_talking', at=0.27, speed=0.0, splat=0.0), A('compote', 'bored_idle', 0.3, 0.45, face='world', yaw=180, hold='carrotpoke')],
       "(the fade) the button: his gum-covered face, deadpan, the earbuds still in, and Compote glaring at the lens beside him",
       view((0.62, 1.3, -1.45), (0.62, 1.1, 0.72), 50), clear=[[0.97, -1.0, 0.3], [0.47, -1.0, 0.3]], stars=['saxo', 'compote']),
]

BASE = {'tpose', 'gangnam', 'twist', 'macarena', 'silly_twist', 'chicken', 'twerk', 'ymca', 'robot', 'shopping_cart', 'running_man', 'moonwalk', 'shuffle', 'tut', 'booty_step', 'arm_wave', 'snake', 'shimmy', 'charleston', 'samba', 'belly', 'northern_soul_spin',
        'skate_push', 'skate_idle', 'uppercut_atk', 'uppercut_vic', 'slam_atk', 'slam_vic'}
clips = {a['clip'] for s in shots for a in s['actors']}
ep = {
  'date': '2026-09-27', 'n': 2,
  'song': {'title': 'Dans ma bulle (Veridis Remix)', 'artist': 'Romsii', 'window': [71.151, 157.4], 'bpm': 135.0, 'tail': 0.85},
  'logline': "Earphones in, Saxo lives a moody French music video in his head (a twilight beach, a date at the Ferris "
             "wheel, a stroll down the avenue Montaigne, floating off to the moon in a giant bubble) until the bubble "
             "pops: he's on the night bus, sprawled over two seats, the moon was the ceiling light, the girl the perfume "
             "ad on the wall, and Compote, who glared at him in every place he dreamed of, is the passenger standing next "
             "to him, carrot in paw.",
  'new': ['shore map (the dream: a wet beach mirroring a pink twilight or a moonlit night, the sea washing in and out, a '
          'pier on pilings with lamps and string lights, its end platform with a lit Ferris wheel, a ticket kiosk and a '
          'bench, a coastal city\'s lights, the setting sun or a giant full moon, the path of light on the water, soap '
          'bubbles; flags night, lightsOff, lightsOn, blackout, bubbles, wheel)',
          'bus map (the reality: a city bus at night, the street scrolling past with lamps sweeping their glow through the '
          'cabin, seats, poles and stop buttons, the driver\'s cab, a round dome light, the perfume ad BULLE on the wall, '
          'pet passengers who turn to stare; flags stare, flicker, speed, bag)',
          'the Paris boutique (flag boutique: a black shopfront, a gold sign, lit windows, a red carpet and velvet rope, the '
          'blue avenue Montaigne street plaque)',
          'actor fields: gum (bubble gum grown from the mouth, popped into pink bits), splat (the gum on the face), buds '
          '(earbuds), bubble (the giant see-through bubble a body floats in), moth (out of an open wallet), toss.splash; '
          'props stone and wallet; see-through materials (see: screen-door dither)',
          'costumes: Saxo trench (a French film trench coat), Sadi paris (a Breton top and red beret), Kob driver (a bus '
          'driver\'s uniform)'],
  'notes': "The user's queue, no instructions. The link is the Veridis Project remix (164 s, 135 BPM): its video is a "
           "montage of lonely film moments (a man in a dark coat on a wet beach at twilight, a pier and the light "
           "between its pilings, a Ferris wheel, a girl dancing alone on the sand, a couple on a night bus, a tram, the "
           "moon over the sea, Paris's quays, a room on fire where a girl sits calmly). The song (French): a young "
           "dreamer in his own bubble, earphones in, riding round the town at night, the sun, the moon, the avenue "
           "Montaigne with no money, alone, shadow and light. Our world: the bubble as a moody French music video in "
           "his head, and the night bus it's really happening on. Structure: twist ending (never used), planted with "
           "clues: Compote glaring in every place of the dream (the jogger, the pier's rail, the bench, the photobomb, "
           "the boutique's door, the pier as he floats off), the ticket girl in a bus driver's cap, the girl posing "
           "exactly like the ad, the too-perfect round moon. Whole cast: Saxo (the dreamer, the joke on him), Sadi "
           "(the romance; the reality check: she's an ad), Kob (never impressed: the kiosk and the bus's driver, "
           "deadpan), Compote (always angry: he's taking two seats and she's been standing the whole ride; she pops "
           "his bubble, twice).",
  'with': ['sadi', 'kob', 'compote'],
  'clips': sorted(clips - BASE),
  'shots': shots,
  'tags': {'structure': 'twist ending', 'scenes': [], 'cast': ['saxo', 'sadi', 'kob', 'compote'], 'hook': 'lyric',
           'maps': ['shore', 'bus', 'paris'], 'ref': 'none',
           'lyric_literal': "L00 earphones in the ears (he pushes them in), L01 the sun (the sunset), L07 wait (at the wheel), L09 weird (Compote's glare), L12-L13 all alone (the empty deck, the lone walk), L16 stone (he skims one; it sinks), L17 shadow / light (the pier's lights die and blaze back), L18 baby (she's back) and bubble (a gum bubble on the word), L19 phone (the selfie), L20 avenue Montaigne (the strut) and money (an empty wallet, a moth), L21 + L23 raise my head, look at the moon (the giant moon), L24 + L28 + L29 bubble (the pop, the new bubble, the second pop)",
           'experiment': "Does a twist ending (the whole dream was on the night bus), planted with clues a viewer only gets on the loop, hold completion and rewatches better than our linear gag episodes?"},
}
out = os.path.join(os.path.dirname(__file__), '2026-09-27-2.json')
json.dump(ep, open(out, 'w'), ensure_ascii=False, indent=1)
print(out, len(shots), 'shots', len(ep['clips']), 'clips', 'end', END)
print('sheet times:', ','.join(str(round((T(s['beat']) + (T(shots[i + 1]['beat']) if i + 1 < len(shots) else END)) / 2, 2)) for i, s in enumerate(shots)))
