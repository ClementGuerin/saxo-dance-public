# make_2026-09-26.py: writes episodes/2026-09-26.json, "He's A Pirate (Save Me)" (Gabry Ponte, Steve Aoki, KEL), from the
# user's queue: "don't follow the song's clip: do a Pirates of the Caribbean theme".
# "The treasure": the pirate captain (Saxo) slides into the cursed grotto where Sadi is tied to a post, pleading; he walks
# right past her, opens the stone chest and runs off with the treasure, a single golden carrot, leaving her tied up. At
# sea, two giant ears glide past the ship like shark fins: on the drop a 19-metre Compote bursts out of the sea to take
# her carrot back. Saxo dances at her, carrot in paw; Kob, the ship's cat, reads in her hammock and never looks up. Sadi
# climbs aboard, dances with him, kisses him... and chains him to the mast (for the grotto), then rows away. The last
# chorus mirrors the first: now he's the one pleading and she waves bye; Kob turns a page; Compote leans in, roars in
# his face, plucks back her carrot and sinks. Button: alone and chained, he grins and pulls out a SECOND golden carrot;
# Kob points at him, and behind him two ears rise out of the sea again.
# Beats count from B0 = 0.000 s at 144 BPM (cut time = b * 0.41667 s; a bar = 4 beats = 1.667 s); the cut is 80.04-148.87 s
# of the song (episodes/2026-09-26.config.js). Lyric lines are named by number (L00-L10, see episodes/2026-09-26.lyrics.js):
# the lyrics stay in their files. L00-L03 chorus (0.96-14.73 s), L04 the tag (17.71-20.69), L05-L06 the pickup over
# the drop (43.95-47.49), L07-L10 the last chorus (47.67-60.50). The drop is at b52 (21.667 s), its third phrase at b116.
import json, os

P = 60 / 144.0
T = lambda b: round(b * P, 3)                      # beat -> cut seconds
END = 68.83
CAVE = {'CHEST': [-2.0, -2.7], 'POST': [0.1, -1.6], 'ROPE': [1.9, -0.3]}   # = src/maps7.js
PEARL = {'MAST': [0, -3], 'BOW': [0, -13.2], 'HAMMOCK': [2.85, -0.4, 0.44], 'SEA': -2.3}
CX, CZ = CAVE['CHEST']; PX, PZ = CAVE['POST']; RX, RZ = CAVE['ROPE']
MX, MZ = PEARL['MAST']; HX, HZ, HY = PEARL['HAMMOCK']; SEA = PEARL['SEA']
ME, SA, KO, CO = 'pirate', 'pirate', 'pyjama', 'compote'   # the looks: Saxo and Sadi in new pirate looks, Kob in her pyjamas, Compote as herself
# the sea monster: Compote at 16x (19.2 m with her ears). Measured on her rig (CLIP_PROBE at her 0.92): eyes ~0.8 m, ear
# tips 1.2 m, hands 0.2-0.3 m -> x16: eyes 12.8 m, ears 19.2 m, hands 3-5 m (under the water: her paws come up by arm aims)
GS = 16
RISEN = -9.3                                       # lift with her eyes 3.5 m above the deck, the sea at her hips
FINS = SEA + 1.1 - 19.2                            # only the tips of her ears out of the water
SUNK = RISEN - 15.5                                # all under
PEEK = -13.8                                       # the top of her head and her ears out (her eyes just under)
CATCH = [-11.3, 2.9, 0.45]                         # her raised right paw in the pluck shot (probed): the carrot's toss lands there
CHAINED = dict(x=MX - 0.3, z=MZ - 0.42, face='world', yaw=-90)   # Saxo against the mainmast's port-bow side, facing the port side (where she rises)
CH = (MX - 0.3, MZ - 0.42)
import math as _m
def ring_round(px, pz):   # an ellipse round the mast and a character against it: [cx, cz, along, across, yaw]; its -x end (the lock) away from the mast
    dx, dz = px - MX, pz - MZ; d = _m.hypot(dx, dz)
    return [round((MX + px) / 2, 3), round((MZ + pz) / 2, 3), round(d / 2 + 0.33, 3), 0.4, round(_m.degrees(_m.atan2(-dz, dx)) + 180, 1)]
RING = ring_round(*CH); RING2 = ring_round(MX + 0.45, MZ - 0.1)
def A(who, clip, x=0, z=0, **o):
    look = {'saxo': ME, 'sadi': SA, 'kob': KO, 'compote': CO}[who]
    return {'who': who, 'look': o.pop('look', look), 'clip': clip, 'x': x, 'z': z, **o}
def giant(clip, x, z, lift=RISEN, **o):
    return A('compote', clip, x, z, scale=GS, lift=lift, face=o.pop('face', 'world'), yaw=o.pop('yaw', 90), noShadow=True, star=False, ground='mesh', **o)
def kob(clip='gaming', **o):   # in her hammock, reading (the book between both paws)
    return A('kob', clip, HX, HZ, lift=HY - 0.03, face='world', yaw=o.pop('yaw', 90), hold=o.pop('hold', 'book'), **o)
def view(p0, l, fov=50, p1=None, ly1=None, ease=None, fy=0.0, **o):
    """A camera at p0 = (x, y, z) looking at l = (x, y, z), moving to p1 by the cut (the look point's height to ly1).
    The engine's camera is polar round the shot's focus: focus = the look point on the floor, ang/r from the offset."""
    import math
    def polar(p): dx, dz = p[0] - l[0], p[2] - l[2]; return round(math.degrees(math.atan2(dx, dz)), 2), round(math.hypot(dx, dz), 3), round(p[1] - fy, 3)
    a0, r0, h0 = polar(p0); a1, r1, h1 = polar(p1 or p0)
    c = {'ang': [a0, a1], 'r': [r0, r1], 'h': [h0, h1], 'look': [round(l[1] - fy, 3), round((ly1 if ly1 is not None else l[1]) - fy, 3)], 'fov': fov, **o}
    if ease: c['ease'] = ease
    return c, [l[0], l[2]] + ([fy] if fy else [])
def shot(beat, map_, actors, lyric, v, **o):
    c, focus = v
    return {'beat': beat, 'kind': 'dance', 'map': map_, 'actors': actors, 'lyric': lyric, 'cam': c, 'focus': focus, **o}
FOAM = dict(foam=[-16, -4, 7]); FOAM2 = dict(foam=[-12, -3.5, 7])
# Framing rule: the lyric rows own the top third, so a camera looks at (or above) the head it frames and faces sit at
# 40-50% of the height. The giant is judged by her face (QA: head bone below 30% of the height). The mainmast stands
# next to the chained Saxo: every camera line was checked to pass clear of it.
shots = [
  # ================= the grotto (chorus: L00-L03) =================
  shot(0, 'cave', [A('sadi', 'standing_praying_while_swaying', PX, PZ + 0.28, face='world', yaw=0)],
       "L00 (0.96-4.06, the title's plea): hook: Sadi tied to a post in a cave of gold, pleading at the camera",
       view((0.18, 1.0, 1.27), (0.45, 0.95, -1.32), 50, p1=(0.22, 0.95, 0.88)), tied=True, stars=['sadi']),
  shot(8, 'cave', [A('saxo', 'big_vegas_pointing_gesture', RX, RZ, at=0.0, lift=3.2, my=-3.2, myDur=0.8, air=True, arm='both', aim='up', upAt=0, upEnd=0.8),
                   A('sadi', 'happy_idle', PX, PZ + 0.28, face='world', yaw=25)],
       "L01 (3.86-7.33): the hero slides down a rope from the dark and lands with a showman's point; behind him Sadi lights up",
       view((2.3, 0.5, 3.3), (1.3, 1.9, -0.6), 60, p1=(2.1, 0.55, 3.0), ly1=1.05), tied=True, rope=True, stars=['saxo', 'sadi']),
  shot(16, 'cave', [A('saxo', 'happy_walk', 1.05, -0.45, mx=-1.75, mz=-0.5, speed=1.6, face='world', yaw=-106), A('sadi', 'happy_idle', PX, PZ + 0.28, face='world', yaw=0)],
       "L02 (7.19-10.53, 'again'): he swaggers towards her... and straight past her, towards the chest",
       view((-2.5, 1.0, 2.5), (0.2, 0.95, -1.0), 55, p1=(-2.2, 1.0, 2.9), ease='lin'), tied=True, stars=['saxo', 'sadi']),
  shot(24, 'cave', [A('saxo', 'happy_idle', CX + 0.8, CZ + 0.15, face='camera', hold='gcarrot', holdFrom=0.75, arm='R', aim='up', upAt=0.75)],
       "L03 (10.48-, the title again): he lifts the lid: gold light on his face; he raises the treasure, a golden carrot",
       view((-0.75, 0.6, -0.25), (-1.35, 1.1, -2.5), 58, p1=(-0.8, 0.65, -0.45), ly1=1.2), tied=True, chestOpen=T(24) + 0.3, carrotTaken=T(24) + 0.75, stars=['saxo']),
  shot(30, 'cave', [A('sadi', 'short_yell_while_standing', PX, PZ + 0.28, face='world', yaw=-30), A('saxo', 'silly_run', CX + 0.6, CZ - 0.3, mx=2.3, mz=-1.5, speed=1.2, face='world', yaw=123, hold='gcarrot')],
       "L03 (-14.73, 'away' at 13.29): he runs off to the rowboat with it; Sadi, still tied, yells (at us: can you believe him)",
       view((-1.6, 1.05, 1.5), (0.0, 0.95, -2.6), 58, p1=(-1.7, 1.05, 1.3)), tied=True, chestOpen=0, carrotTaken=0, stars=['sadi']),
  # ================= at sea (the tag L04 and the build) =================
  shot(36, 'pearl', [A('saxo', 'happy_idle', 0, -15.5, face='world', yaw=-90, hold='gcarrot', arm='R', aim='up', upAt=0.2)],
       "L04 (17.71-20.69): the black ship under the moon; at the bow Saxo raises the golden carrot to it",
       view((-3.0, 1.1, -14.6), (0, 1.35, -15.5), 52, p1=(-2.7, 1.05, -14.9)), stars=['saxo']),
  shot(42, 'pearl', [kob(at=1.0)],
       "(17.5-19.17) Kob, the ship's cat, in her pyjamas in a hammock, reading: she never looks up",
       view((4.9, 1.4, -0.6), (2.85, 1.25, -0.38), 52, p1=(4.8, 1.38, -0.55)), stars=['kob']),
  shot(46, 'pearl', [A('compote', 'bored_idle', -12, -9.5, mx=4.5, mz=4.5, scale=GS, lift=FINS, my=-3, myAt=1.8, myDur=0.6, face='world', yaw=48, noShadow=True, star=False, ground='mesh')],
       "(19.17-21.67, to the build bar) low on the water: two giant ears slice in towards the hull like shark fins... and sink",
       view((-13.5, -0.9, 0.5), (-10.2, -1.1, -7.5), 52, fy=SEA), fins=[-12, -9.5, -7.5, -5, 1.4], stars=['saxo']),
  # ================= the drop: the monster (drop phrase A) =================
  shot(52, 'pearl', [giant('yelling_in_anger', -16, -4, lift=SUNK, my=RISEN - SUNK, myDur=0.75, arm='both', aim=[0.35, 0.55, 0.75], upAt=0.3), A('saxo', 'being_terrified_while_standing', -3.3, -4.9, face='world', yaw=-90, hold='gcarrot')],
       "(21.67, the drop) a 19-metre Compote bursts out of the sea beside the ship, furious; Saxo at the rail, tiny",
       view((-0.6, 0.9, -5.8), (-16, 3.2, -4.0), 62, p1=(-1.0, 0.95, -5.7)), splash=[-16, -4, T(52)], jolt=True, stars=['saxo'], **FOAM),
  shot(60, 'pearl', [A('saxo', 'being_terrified_while_standing', -3.0, -4.3, face='camera', hold='gcarrot'), giant('yelling_in_anger', -16, -4, at=1.5)],
       "(25.0) Saxo turns to us, terrified, clutching the carrot; she looms behind him",
       view((-0.9, 1.05, -4.5), (-3.0, 0.85, -4.3), 54, p1=(-1.1, 1.05, -4.45)), stars=['saxo'], **FOAM),
  shot(64, 'pearl', [A('saxo', 'chicken', -2.6, -4.0, face='camera', hold='gcarrot'), giant('yelling_in_anger', -16, -4, at=2.2)],
       "(26.67) his answer: a chicken dance at her, carrot in paw (low angle, her glare above)",
       view((-0.4, 0.6, -4.3), (-2.6, 1.3, -4.0), 58, p1=(-0.6, 0.6, -4.25)), stars=['saxo'], **FOAM),
  shot(68, 'pearl', [A('saxo', 'silly_twist', -2.6, -3.8, face='camera', hold='gcarrot'), giant('yelling_in_anger', -16, -4, at=3.0)],
       "(28.33) Saxo's answer: a cocky dance at her, carrot in paw",
       view((-0.3, 1.1, -3.9), (-2.6, 1.25, -3.8), 56, p1=(-0.45, 1.1, -3.9)), stars=['saxo'], **FOAM),
  shot(72, 'pearl', [giant('quickly_pointing_angrily_forward', -16, -4, arm='R', aim=[0.15, 0.55, 0.82], upAt=0.1)],
       "(30.0) close on her face: she points at him, livid (her carrot hair clip)",
       view((4.5, 2.6, -5.9), (-13, 3.6, -4.2), 55, p1=(4.2, 2.6, -5.85)), stars=['compote'], **FOAM),
  shot(76, 'pearl', [A('saxo', 'shuffle', -2.2, -3.4, face='camera', hold='gcarrot'), A('sadi', 'jumping_down_over_a_railing', -3.75, -2.75, mx=0.75, at=0.5, face='world', yaw=95, air=True), giant('yelling_in_anger', -16, -4, at=4.0)],
       "(31.67) he dances harder; behind him Sadi climbs aboard, freed and soaked",
       view((0.6, 1.15, -1.6), (-2.7, 1.2, -3.05), 60), stars=['saxo', 'sadi'], **FOAM),
  shot(80, 'pearl', [kob(), giant('yelling_in_anger', -16, -4, at=2.0)],
       "(33.33) Kob in her hammock, the monster roaring behind her: she turns a page",
       view((5.3, 1.35, 0.1), (-4, 2.5, -1.7), 60, p1=(5.1, 1.35, 0.05)), stars=['kob'], **FOAM),
  # ================= drop phrase B: the betrayal =================
  shot(84, 'pearl', [A('saxo', 'hip_hop_dancing_side_to_side', -1.2, -7.1, face='camera', hold='gcarrot'), A('sadi', 'hip_hop_dancing_side_to_side', -1.2, -5.9, face='camera', at=0.6), giant('yelling_in_anger', -16, -4, at=5.0)],
       "(35.0) Sadi dances with him through the attack, all smiles",
       view((2.8, 1.15, -6.5), (-1.2, 1.2, -6.5), 56, p1=(2.5, 1.15, -6.5)), stars=['saxo', 'sadi'], **FOAM),
  shot(92, 'pearl', [giant('yelling_in_anger', -9.5, -4.5, at=1.0, arm='both', aim=[0.0, 0.54, 0.84], upAt=0.15)],
       "(38.33) the scale wide: the whole black ship, and the bunny as big as it gripping its rail, roaring",
       view((24, 5, -8), (-9.5, 4.0, -4.5), 50, p1=(23, 4.8, -7.8)), waves=True, stars=['compote'], foam=[-9.5, -4.5, 6]),
  shot(100, 'pearl', [A('saxo', 'happy_idle', **CHAINED, hold='gcarrot'), A('sadi', 'blowing_a_kiss', CH[0] - 0.95, CH[1], face='world', yaw=90)],
       "L05 (43.95-45.45, 'together'): at the mast she gets close and blows him a kiss... the hero melts",
       view((CH[0] - 0.45, 1.0, CH[1] + 2.85), (CH[0] - 0.48, 1.0, CH[1]), 52, p1=(CH[0] - 0.45, 1.0, CH[1] + 2.65)), stars=['saxo', 'sadi'], **FOAM),
  shot(108, 'pearl', [A('saxo', 'disappointed_awe_shucks', **CHAINED, hold='gcarrot')],
       "L06 (45.50-, 'dark' at 46.04): click: the chain snaps round him and the mast, his face drops; the moon goes out",
       view((-2.3, 1.15, -1.9), (CH[0], 1.2, CH[1]), 52, p1=(-2.15, 1.15, -2.05)), chain=T(108) + 0.25, chainRing=RING, dark=46.04, stars=['saxo'], **FOAM),
  shot(112, 'pearl', [A('saxo', 'being_terrified_while_standing', **CHAINED, hold='gcarrot'), giant('long_yell_leaning_forward', -12, -3.5, at=0.6, speed=0.5)],
       "L06 (-47.49, 'light' at 47.00): lightning: her face right over the ship, glaring down at him",
       view((2.0, 1.3, -4.2), (-8, 2.6, -3.4), 62, p1=(2.0, 0.9, -4.2)), chain=True, chainRing=RING, dark=0, light=46.97, stars=['saxo'], **FOAM2),
  # ================= the last chorus (L07-L10): the mirror =================
  shot(116, 'pearl', [A('saxo', 'waving_with_both_hands', **CHAINED, hold='gcarrot')],
       "L07 (47.67-50.65, the title's plea): now HE pleads, chained, waving for help",
       view((-2.0, 1.05, -2.2), (CH[0], 1.1, CH[1]), 50, p1=(-1.85, 1.05, -2.35)), chain=True, chainRing=RING, stars=['saxo'], **FOAM2),
  shot(120, 'pearl', [A('sadi', 'waving_with_both_hands', 6.2, -1.2, mx=2.6, mz=3.4, lift=SEA + 0.12, face='camera')],
       "(50.0) Sadi rows away in the lifeboat and waves bye-bye (his point of view from the rail)",
       view((4.68, -1.25, -3.19), (7.5, -1.3, 0.5), 50), boat=[6.2, -1.2, 8.8, 2.2], stars=['saxo'], **FOAM2),   # at the waterline behind her wake: she rows away from us facing back, like a rower; the karaoke face stays his (his plea)
  shot(124, 'pearl', [A('saxo', 'standing_praying_while_swaying', MX + 0.45, MZ - 0.1, face='world', yaw=42, hold='gcarrot')],
       "L08 (50.53-54.05, the plea again): he shuffles round the mast to beg Kob (off screen, where he looks)",
       view((2.3, 1.15, -1.15), (MX + 0.45, 1.05, MZ - 0.1), 52, p1=(2.2, 1.15, -1.3)), chain=True, chainRing=RING2, stars=['saxo'], **FOAM2),
  shot(128, 'pearl', [kob(at=3.0)],
       "(53.33-55.0) Kob, in her hammock, turns a page without looking up",
       view((3.7, 1.0, 1.45), (2.85, 1.25, -0.4), 56, p1=(3.65, 1.0, 1.35)), chain=True, chainRing=RING2, stars=['kob'], **FOAM2),
  shot(132, 'pearl', [A('saxo', 'being_terrified_while_standing', **CHAINED, hold='gcarrot'), giant('long_yell_leaning_forward', -12, -3.5, at=0.0, speed=0.5, face='camera', yaw=0)],
       "L09 (53.86-57.30, 'again'): the monster leans in over the ship, her face coming down to his",
       view((5.4, 1.4, -5.6), (-5, 2.6, -3.4), 60, p1=(5.0, 1.3, -5.45)), chain=True, chainRing=RING, stars=['saxo'], **FOAM2),
  shot(138, 'pearl', [giant('yelling_in_anger', -10.5, -3.5, at=2.0), A('saxo', 'being_terrified_while_standing', **CHAINED, hold='gcarrot', at=6.0)],
       "L10 (57.15-, the title): the roar, right at him",
       view((3.4, 1.35, -5.0), (-7.5, 2.8, -3.5), 62, p1=(3.0, 1.35, -4.9)), chain=True, chainRing=RING, jolt=True, stars=['saxo'], **FOAM2),
  shot(141, 'pearl', [A('saxo', 'long_yell_while_standing_leaning_back', **CHAINED, hold='gcarrot', at=0.4)],
       "L10 (-58.75-60.0): Saxo takes the roar full in the face",
       view((-2.0, 0.7, -1.8), (CH[0], 1.25, CH[1]), 56, p1=(-1.9, 0.7, -1.95)), chain=True, chainRing=RING, jolt=True, gust=[CH[0] - 0.9, 1.1, CH[1], T(141), 1.25], stars=['saxo'], **FOAM2),
  shot(144, 'pearl', [A('saxo', 'being_terrified_while_standing', **CHAINED, hold='gcarrot', holdTo=0.12, at=0.3, toss={'at': 0.12, 'to': [CH[0] - 1.4, 1.95, CH[1] + 0.9], 'dur': 0.55, 'arc': 0.35})],
       "L10 (-60.50, 'away' at 59.95): pluck: the carrot shoots up out of his paw",
       view((-2.9, 1.25, -2.4), (CH[0] - 0.3, 1.3, CH[1] + 0.1), 56), chain=True, chainRing=RING, stars=['saxo'], **FOAM2),
  shot(146, 'pearl', [A('saxo', 'being_terrified_while_standing', **CHAINED, at=2.8), giant('bored_idle', -12, -3.5, my=-14, myAt=0.38, myDur=0.45, arm='R', aim=[0.3, 0.85, 0.45], upAt=-0.3, hold='gcarrot', holdScale=0.5)],   # the carrot held up in front of her cheek (not inside her head), then down she goes
       "(60.83-61.67) and away she sinks, the golden carrot held high in her paw",
       view((12, 3.5, -8), (-10, 2.6, -1.5), 48), chain=True, chainRing=RING, stars=['compote'], **FOAM2),
  # ================= the outro and the button =================
  shot(148, 'pearl', [A('saxo', 'happy_idle', **CHAINED, at=0.0, hold='gcarrot', holdFrom=1.0, arm='R', aim='toast', upAt=1.0)],   # the laugh bent his head under the hat
       "(61.67) calm again. Alone, chained, he sighs... grins, and pulls a SECOND golden carrot out of his waistcoat",
       view((-2.3, 1.0, -1.95), (CH[0], 1.0, CH[1]), 52), chain=True, chainRing=RING, calm=True, stars=['saxo']),
  shot(156, 'pearl', [kob('pointing_while_seated', yaw=-134, hold=None, at=1.2, arm='R', aim=[0.0, 0.25, 0.97], upAt=0)],
       "(65.0) Kob, deadpan, points straight at us, at him (she snitches)",
       view((3.67, 1.1, -2.11), (2.8, 1.05, -0.4), 54), chain=True, chainRing=RING, calm=True, stars=['kob']),   # at 70 degrees on her right: her face and the pointing arm both read
  shot(160, 'pearl', [A('saxo', 'laughing_standing', **CHAINED, at=5.5, hold='gcarrot', arm='R', aim='toast', upAt=0),
                      kob('pointing_while_seated', yaw=-134, hold=None, at=2.3),
                      A('compote', 'bored_idle', 20.0, 10.1, scale=GS, lift=PEEK - 3.0, my=3.0, myAt=0.2, myDur=1.4, face='world', yaw=-120, noShadow=True, star=False, ground='mesh')],
       "(66.67-end; silence from 68.33) the reveal: he grins at his second carrot; far behind him, two ears and a grey dome rise out of the sea",
       view((-2.9, 1.4, -4.2), (1.6, 1.25, -2.2), 54, p1=(-2.7, 1.4, -4.1)), chain=True, chainRing=RING, calm=True, still=True, stars=['saxo', 'kob']),
]

# No comic word bursts and no bind pose (the user's calls; the QA gate fails both)
for sh in shots:
    assert not any(k.startswith('word') for k in sh), sh['lyric']
    assert all(a.get('clip') != 'tpose' for a in sh['actors'])
BASE = {'tpose', 'gangnam', 'twist', 'macarena', 'silly_twist', 'chicken', 'twerk', 'ymca', 'robot', 'shopping_cart', 'running_man', 'moonwalk', 'shuffle', 'tut', 'booty_step', 'arm_wave', 'snake', 'shimmy', 'charleston', 'samba', 'belly', 'northern_soul_spin'}
clips = {a['clip'] for s in shots for a in s['actors']}
ep = {
  'date': '2026-09-26', 'n': 1,
  'song': {'title': "He's A Pirate (Save Me)", 'artist': 'Gabry Ponte, Steve Aoki, KEL', 'window': [80.04, 148.87], 'bpm': 144.0, 'tail': 0.5},
  'logline': "The pirate captain leaves Sadi tied up in the cursed grotto to steal its treasure, a golden carrot; the sea monster that rises "
             "to take it back is a 19-metre Compote. Sadi kisses him and chains him to the mast, Kob won't look up from her book, Compote "
             "roars in his face and takes her carrot... and he pulls out a second one.",
  'new': ['cave map (the cursed grotto: a rock dome, mounds of gold, the stone chest that opens, a skull, torches, the moon through its mouth)',
          'pearl map (the black ship at night: tattered black sails, lanterns, a hammock, the chain round the mast, the lifeboat, the moon, splash/foam/wake/spray, the moon going dark and lightning)',
          'giant actors (`scale`: a 16x Compote rising from the sea) with rise and sink (`my`), timed holds (`holdTo`), `holdScale`, `air`',
          'props: golden carrot, book; materials without fog (`nofog`: the moon, the stars)', 'costumes: Saxo pirate (the captain), Sadi pirate'],
  'notes': "The user's queue entry: don't follow the song's clip, do a Pirates of the Caribbean theme. The world is the films' (no names, "
           "no logos): the cursed treasure in a sea cave, a black ship with tattered sails, the captain's look (tricorn, bandana, beaded "
           "dreads, kohl), the heroine in pirate gear, a sea monster attack, the kiss that chains the hero to the mast, the monster's roar in "
           "his face. The song's chorus pleads to be saved: the first chorus is Sadi's plea he ignores, the last is his plea she ignores (the "
           "mirror is the payoff). Whole cast: Saxo (the captain, lead), Sadi (the romance and the reality check: she falls for the hero, "
           "then chains him), Compote (always angry, over a carrot: the monster; starts the Compote vs Saxo feud), Kob (the ship's cat in "
           "her pyjamas: never impressed, never moves, and snitches at the end).",
  'with': ['sadi', 'kob', 'compote'],
  'clips': sorted(clips - BASE),
  'shots': shots,
  'tags': {'structure': 'scale', 'scenes': [], 'cast': ['saxo', 'sadi', 'kob', 'compote'], 'hook': 'lyric',
           'maps': ['cave', 'pearl'], 'ref': 'none',
           'lyric_literal': "L00 Sadi's plea (tied up), L02 he walks past her again, L03 away with the treasure, L05 together (the kiss), L06 dark then light (the moon out, the lightning), L07-L08 his plea (chained), L10 away (she sinks with it)",
           'experiment': 'Does a scale spectacle (a 19-metre Compote rising from the sea on the drop) and a film parody lift shares compared to our human-scale gags?'},
}
out = os.path.join(os.path.dirname(__file__), '2026-09-26.json')
json.dump(ep, open(out, 'w'), ensure_ascii=False, indent=1)
print(out, len(shots), 'shots', len(ep['clips']), 'clips', 'end', END)
