# make_2026-09-27-3.py: writes episodes/2026-09-27-3.json, "Patient Zero" (Taylor Swift), a trending song (the new
# album's #1 on Apple Music and Spotify, US and global, the week it came out; its video premieres at the VMAs the day
# this posts). No clip to parody yet (a lyric video and a 1-minute TV teaser), so the world comes from the words: love as
# a sickness, a party, a devil on a shoulder, patient zero. Ours: the friend who goes to the party sick. Saxo is in bed
# with a fever (red nose, thermometer, ice pack) while a party flashes in the house across the street; a tiny devil
# (a quarter-size Saxo in a devil suit) pops up on his shoulder and points at it; he reads his thermometer, dies
# dramatically on the pillow, and goes, in his pyjamas and scarf. He sneezes into the punch, on Compote's carrot, on
# the dance floor, dances with Sadi, sits down next to masked Kob (she saw him coming) and sneezes on her mask, and
# under the street lamp in the rain Sadi kisses him... and he sneezes in her face. By the end of the night everyone has
# a red nose. The next morning he wakes up cured. In the ward, the whole party sits in hospital beds in their party
# hats; he walks in with a get-well balloon, the devil back on his shoulder; Compote winds up a tissue box, Kob's heart
# monitor flatlines when she sees him, the box flies, and on "patient zero" every patient points at him. He shrugs (so
# does the devil)... then sneezes on the camera, which falls over. Structure: fourth wall (never used).
# Beats count from B0 = 0.652 s at 92 BPM (cut time = B0 + b * 0.6522 s; a bar = 4 beats = 2.609 s); the cut is
# 62.86-139.70 s of the song plus 0.6 s of silence (episodes/2026-09-27-3.config.js). Lyric lines are named by number
# (L00-L13, episodes/2026-09-27-3.lyrics.js): the lyrics stay in their files. Chorus 1 b-1..32 (L00-L03; its one-bar
# tag b32-36), verse 2 b36-64 (L04-L07), pre-chorus 2 b64-80 (L08-L09; the kick drops out b76-79), chorus 2 b80-112
# (L10-L13) and its ad-lib b112-117; the music ends at 76.84 s (b116.8), the fall's silence to 77.44 s.
# Action words (whitelisted tags, kit seconds): L00 party 1.86, L01 devil 5.92 shoulder 7.28, L02 hold 12.38 die 13.48
# go 15.10, L03 sick 16.24 patient zero 18.94, L05 said 30.30 love 30.74 first 31.38, L06 saw 34.94 coming 35.84,
# L07 kissed 40.28 rain 40.88 face 41.78, L09 know 50.62, L10 party 54.02, L11 devil 58.10 shoulder 59.44, L12 hold
# 64.52 die 65.78 go 67.32, L13 sick 68.82 patient zero 71.16.
import json, math, os, sys
sys.path.insert(0, os.path.dirname(__file__))
from cam import view, vpath, swoop, low, deadpan

P, B0 = 60 / 92, 0.652
T = lambda b: round(B0 + b * P, 3)                 # beat -> cut seconds
END = 77.44
LOOK = {'saxo': 'pyjama', 'sadi': 'disco', 'kob': 'kob', 'compote': 'compote'}
# ---- the block (src/maps12.js BLOCK): his bedroom, the street, the party house ----
MAT = 0.5; SIT = (-1.3, -1.5); BLIFT = MAT - 0.08                  # sitting up in bed against the pillow, facing +z
FLOOR = (1.0, -17.4); PUNCH = (-4.3, 0.9, -18.2); KOB_C = (4.1, -21.12); SAX_C = (4.9, -21.12)
DOOR = (1.0, -14.2); LAMP = (3.4, -12.6)
# ---- the ward (src/maps12.js WARD): five beds, patients sitting up against the pillows, facing +z ----
BEDS = [-4.0, -2.0, 0.0, 2.0, 4.0]; WSIT = -2.55; WLIFT = 0.62 - 0.08; WDOOR = (6.0, 1.6)
BED_OF = {'compote': 1, 'sadi': 2, 'kob': 3}

def A(who, clip, x, z, **o):
    return {'who': who, 'look': o.pop('look', LOOK[who]), 'clip': clip, 'x': round(x, 3), 'z': round(z, 3), **o}
def yaw_to(a, b): return round(math.degrees(math.atan2(b[0] - a[0], b[1] - a[1])), 1)
def sick_bed(**o):                                   # Saxo sick in bed: red nose, thermometer, ice pack on his head
    sick = {'nose': True, 'therm': True, 'hat': 'icepack', 'hatY': 0.7}
    sick.update({k: o.pop(k) for k in list(o) if k in sick})
    return A('saxo', o.pop('clip', 'sitting_talking'), *SIT, lift=BLIFT, face='world', yaw=o.pop('yaw', 0), at=o.pop('at', 0), speed=o.pop('speed', 0.05), **sick, **o)
def patient(who, **o):                               # a party guest in a hospital bed, party hat still on
    d = {'nose': who != 'kob', 'mask': who == 'kob', 'therm': who == 'compote', 'hat': 'partyhat', 'hatY': 0.86}
    d.update({k: o.pop(k) for k in list(o) if k in d})
    return A(who, o.pop('clip', 'sitting_talking'), BEDS[BED_OF[who]], WSIT, lift=WLIFT, face='world', yaw=o.pop('yaw', 0), at=o.pop('at', 0), speed=o.pop('speed', 0.05), **d, **o)
def devil(x, z, y, clip='laughing_standing', **o):   # the tiny devil on his shoulder: a quarter-size Saxo in the devil suit (a crowd of one)
    return {'who': 'saxo', 'look': 'devil', 'clip': clip, 'n': 1, 'cols': 1, 'jitter': 0, 'x0': round(x, 3), 'z0': round(z, 3), 'y0': round(y, 3), 'scale': 0.28, 'noShadow': True, **o}
def shot(beat, mp, actors, lyric, v, **o):
    c, focus = v
    return {'beat': beat, 'kind': 'dance', 'map': mp, 'actors': actors, 'lyric': lyric, 'cam': c, 'focus': focus, **o}
SNEEZE = 'long_yell_leaning_forward'                  # the snap forward; the spray is the actor's `sneeze`
DEV_R = (SIT[0] - 0.56, SIT[1] + 0.02, 0.9)          # on his right shoulder in bed (his right is -x): sitting_talking turns his head to it
clear = lambda *pts: [[x, z, r] for x, z, r in pts]

shots = [
  # ================= chorus 1: sick in bed, the devil on his shoulder, off to the party (L00-L03) =================
  shot(-1, 'block', [sick_bed(holdL='tissue', yaw=30, sneeze=1.0)],
       "HOOK, L00 ('party' 1.86): a swoop down from the ceiling onto Saxo sick in bed (red nose, thermometer, ice pack, a tissue in his paw) sneezes, while the party across the street flashes its colours through the window behind his head",
       swoop([(-1.3, 2.5, 1.0), (-1.3, 2.1, 0.5), (-1.32, 1.55, 0.0), (-1.3, 1.46, -0.2)], (-1.3, 1.42, -1.5), fov=60), zone='room', stars=['saxo']),
  shot(4, 'block', [],
       "L00 (to 5.04): what he's staring at: the party house across the street through his window, its windows blazing on the beat, silhouettes dancing, balloons at the door",
       view((-1.0, 1.72, -1.7), (-1.2, 1.6, -14.2), 34, p1=(-1.0, 1.72, -1.95), ease='lin'), zone='room', stars=['saxo']),
  shot(8, 'block', [sick_bed(at=0, speed=0.4)],
       "L01 ('devil' 5.92, 'shoulder' 7.28): POOF: a tiny devil (a quarter-size Saxo in a devil suit) stands on his right shoulder, laughing, and points up and back at the party through the window; Saxo turns his head to listen",
       view((-1.62, 1.42, 0.85), (-1.58, 1.36, -1.5), 50, p1=(-1.62, 1.42, 0.5)), zone='room',
       crowd=devil(SIT[0] - 0.62, SIT[1] + 0.02, 1.0, arm='R', aim=[0.3, 0.8, -0.5], upAt=0.35), stars=['saxo']),
  shot(16, 'block', [sick_bed(therm=False, hold='thermo', arm='R', aim=[0.35, 0.62, 0.75], upAt=0.2)],
       "L02 ('hold' 12.38): he holds his thermometer up to read it; the devil laughs on his shoulder",
       view((-1.48, 1.4, 0.55), (-1.5, 1.35, -1.45), 56), zone='room', crowd=devil(*DEV_R), stars=['saxo']),
  shot(19.5, 'block', [A('saxo', 'laying_on_the_ground_dying', SIT[0], -1.25, lift=MAT, face='world', yaw=0, ground='mesh', nose=True, therm=True)],
       "L02 ('die' 13.48): the drama queen: he flops back onto the pillow and dies, dramatically (from above, his head on the flat pillow); the devil shrugs by his head",
       view((-1.3, 2.6, -1.5), (-1.3, 0.55, -1.85), 62), zone='room', flatPillow=True, crowd=devil(SIT[0] + 0.4, -2.0, MAT + 0.12, clip='shoulder_shrug'), stars=['saxo']),
  shot(22, 'block', [A('saxo', 'happy_walk', 3.3, -4.2, face='world', yaw=195, mx=-1.2, mz=-3.9, speed=1.3, nose=True, sneeze=1.24)],
       "L02 ('go' 15.10) to L03 ('sick' 16.24): he goes: out of his front door and across the street in his pyjamas and scarf, towards the party house; he sneezes ('sick') and keeps walking",
       view((3.75, 0.8, -2.6), (0.6, 1.0, -12.5), 54, p1=(3.6, 0.78, -3.0), roll=[-6, -3], hand=0.3), zone='street', stars=['saxo']),
  shot(28, 'block', [A('saxo', 'happy_walk', DOOR[0], -14.4, face='world', yaw=180, mz=-1.3, speed=0.9, nose=True)],
       "L03 ('patient zero' 18.94): patient zero walks in: the party's door, the street and the lamp behind him, a low lens from the dance floor",
       low((1.35, 0.22, -17.4), (DOOR[0], 0.8, -14.6), (1.3, 0.22, -16.9), fov=58, roll=[8, 4]), zone='party', clear=clear((1.0, -15.4, 1.2), (1.3, -16.8, 0.9)), stars=['saxo']),
  shot(32, 'block', [A('saxo', SNEEZE, -3.55, PUNCH[2], at='auto', nose=True, sneeze=1.25)],
       "tag bar (instrumental): at the snack table he leans over the pink punch and sneezes into it: it ripples and turns green (from above, across the bowl)",
       view((-4.7, 2.4, -17.9), (-3.95, 0.95, -18.2), 58), zone='party', ripple=1.35),
  # ================= verse 2: he spreads it round the party (L04-L07) =================
  shot(36, 'block', [A('saxo', 'shuffle', FLOOR[0], FLOOR[1] + 0.2, nose=True, sneeze=1.95),
                     A('sadi', 'hip_hop_dancing_side_to_side', FLOOR[0] + 0.6, FLOOR[1] - 1.0, star=False)],
       "L04: he dances on the light-up floor in his pyjamas, red nose and all, and sneezes on the dancers round him (they keep dancing); Sadi dances behind",
       low((1.0, 0.22, -14.9), (1.0, 0.92, -17.3), (1.0, 0.22, -15.35), fov=64, roll=[-9, -6]), zone='party', clear=clear((1.0, -15.3, 1.0))),
  shot(40, 'block', [A('compote', 'bored_idle', -1.6, -17.9, face='world', yaw=0, hold='carrot', holdScale=1.6, arm='R', aim='toast', upAt=0.0, at=0.4, speed=0.3),
                     A('saxo', SNEEZE, -0.85, -17.9, face='camera', yaw=-90, at='auto', nose=True, sneeze=0.95, star=False)],
       "Compote, her carrot up in her paw; he leans in beside her and sneezes all over it, right across her face. She keeps glaring",
       view((-1.22, 1.15, -14.5), (-1.22, 0.95, -17.9), 52), zone='party', clear=clear((-1.2, -15.0, 1.2), (-1.2, -16.3, 1.0), (-1.2, -17.9, 1.1)), stars=['compote']),
  shot(44, 'block', [A('saxo', 'twist', FLOOR[0] - 0.42, FLOOR[1], nose=True), A('sadi', 'twist', FLOOR[0] + 0.42, FLOOR[1])],
       "L05 ('love' 30.74): he dances with Sadi under the mirror ball, side by side, in step",
       low((1.0, 0.3, -14.9), (1.0, 0.85, -17.4), (1.0, 0.3, -15.4), fov=60, roll=[6, 3]), zone='party', clear=clear((1.0, -15.2, 1.1))),
  shot(48, 'block', [A('kob', 'sitting_talking', *KOB_C, face='world', yaw=0, at=0, speed=0.05, mask=True)],
       "deadpan: Kob, who never goes out, on the couch in her pyjamas and a face mask",
       deadpan(KOB_C, 0.95, 2.6, fov=42), zone='party', clear=clear((4.1, -19.0, 1.2)), stars=['kob']),
  shot(52, 'block', [A('kob', 'sitting_talking', *KOB_C, face='world', yaw=0, at=0, speed=0.05, mask=True, arm='R', aim=[0.85, 0.42, 0.3], upAt=0.35),
                     A('saxo', 'happy_walk', 2.35, -19.55, face='world', yaw=yaw_to((2.35, -19.55), (3.4, -20.45)), mx=1.05, mz=-0.9, speed=0.9, nose=True, star=False, reveal=1.6)],
       "L06 ('saw' 34.94, 'coming' 35.84): she saw him coming: he heads for the couch and she puts a paw up at him",
       view((3.7, 1.1, -18.0), (3.55, 0.9, -21.0), 56), zone='party', clear=clear((3.7, -18.4, 1.2), (3.0, -19.6, 0.8)), stars=['kob']),
  shot(56, 'block', [A('kob', 'sitting_talking', *KOB_C, face='world', yaw=0, at=0, speed=0.05, mask=True),
                     A('saxo', 'sitting_talking', *SAX_C, face='world', yaw=-10, at=0.3, speed=0.6, nose=True, sneeze=1.6)],
       "he sits down right next to her anyway, turns to her and sneezes on her mask. Deadpan",
       view((4.5, 1.1, -18.1), (4.5, 0.95, -21.1), 60), zone='party', clear=clear((4.5, -18.6, 1.3))),
  shot(60, 'block', [A('saxo', 'kissing_a_shorter_person_for_a_short_period', 2.25, -10.9, face='world', yaw=90, at='auto', nose=True),
                     A('sadi', 'kissing_a_taller_person_for_a_short_period', 3.08, -10.9, face='world', yaw=-90, at='auto')],
       "L07 ('kissed' 40.28, 'rain' 40.88): under the street lamp, in the rain, Sadi kisses him",
       view((2.66, 1.0, -8.3), (2.66, 0.95, -10.9), 52), zone='street', rain=True, lampCone=False),
  shot(63, 'block', [A('saxo', SNEEZE, 2.25, -10.9, face='camera', yaw=90, at='auto', nose=True, sneeze=0.05),
                     A('sadi', 'large_hit_reaction_from_the_front', 3.08, -10.9, face='camera', yaw=-90, at=-0.12, once=True)],
       "L07 ('face' 41.78): ...and he sneezes right in her face; her head snaps back",
       view((2.66, 1.05, -8.7), (2.7, 1.05, -10.9), 50), zone='street', rain=True, lampCone=False),
  # ================= pre-chorus 2: everyone catches it; the morning after (L08-L09) =================
  shot(64, 'block', [A('saxo', 'shuffle', FLOOR[0], FLOOR[1], nose=True),
                     A('sadi', 'hip_hop_dancing_side_to_side', FLOOR[0] + 0.7, FLOOR[1] - 0.5, nose=True, sneeze=1.0),
                     A('compote', 'hip_hop_dancing_side_to_side', FLOOR[0] - 0.7, FLOOR[1] - 0.5, nose=True, sneeze=2.1)],
       "L08: it spreads: back inside, every guest has a red nose now; Sadi sneezes, Compote sneezes, the party dances on",
       view((1.0, 1.05, -14.9), (1.0, 0.95, -17.6), 62, p1=(1.0, 1.9, -14.4), ly1=0.9, ease='out'), zone='party', sickGuests=True, clear=clear((1.0, -15.4, 1.0))),
  shot(68, 'block', [A('kob', 'sitting_talking', *KOB_C, face='world', yaw=0, at=0, speed=0.05, mask=True, sneeze=1.3)],
       "deadpan: Kob sneezes into her mask",
       deadpan(KOB_C, 0.95, 2.6, fov=42), zone='party', sickGuests=True, clear=clear((4.1, -19.0, 1.2)), stars=['kob']),
  shot(72, 'block', [A('saxo', 'laying_idle', SIT[0], -1.25, lift=MAT, face='world', yaw=0, ground='mesh', sleep=True, at=0, speed=0.02)],
       "the night passes: morning sun through the window; he sleeps like a baby, a sleep mask on, the quilt up to his chin, no red nose",
       view((-1.3, 2.6, -1.5), (-1.3, 0.55, -1.85), 62), zone='morning', lamp=False, flatPillow=True, cover=True, stars=['saxo']),
  shot(76, 'block', [sick_bed(clip='celebrating_after_a_win_while_seated', at='auto', speed=1.0, nose=False, therm=False, hat=None)],
       "L09 ('know' 50.62; the kick drops out): he sits up in the sunshine and cheers: cured, not a sniffle",
       view((-1.3, 1.45, 0.4), (-1.3, 1.4, -1.5), 52, p1=(-1.3, 1.45, 0.1)), zone='morning', lamp=False, stars=['saxo']),
  # ================= chorus 2: the ward (L10-L13), the ad-lib and the button =================
  shot(80, 'ward', [patient('compote', reveal=2.2), patient('sadi'), patient('kob', reveal=2.2)],
       "L10 ('party' 54.02): the ward: the whole party in hospital beds, still in their party hats, red noses, thermometers, confetti on the blankets (a pull-back from Sadi's hat)",
       view((0.0, 1.5, -1.2), (0.0, 1.2, -2.55), 52, p1=(0.2, 1.85, 3.3), ly1=1.0, ease='out'), stars=['sadi']),
  shot(84, 'ward', [A('saxo', 'happy_walk', 5.3, 1.3, look='saxo', face='world', yaw=-100, mx=-1.9, mz=-0.3, speed=1.0, hold='getwell', star=False)],
       "he walks in through the door, fresh as a daisy, in his suit, a get-well balloon on a long string",
       view((1.2, 1.25, -1.2), (4.4, 1.0, 1.1), 52), stare=[4.3, 1.1], stars=['saxo']),
  shot(88, 'ward', [A('saxo', 'bored_idle', 3.2, 0.9, look='saxo', face='world', yaw=-90, at=0.5, speed=0.4, hold='getwell')],
       "L11 ('devil' 58.10, 'shoulder' 59.44): the devil is back on his shoulder, laughing",
       view((1.1, 1.2, 0.72), (3.2, 1.2, 0.72), 56), crowd=devil(3.2, 0.36, 0.6), stars=['saxo']),
  shot(92, 'ward', [patient('sadi', yaw=35), patient('kob', yaw=30)],
       "the patients stare at him, deadpan (Kob and Sadi from a three-quarter angle, where he stands)",
       view((4.2, 1.3, 0.8), (1.0, 1.1, -2.55), 54), stare=[3.3, 0.9], stars=['sadi', 'kob']),
  shot(96, 'ward', [patient('compote', clip='bored_idle', hold='tissuebox', arm='R', aim=[0.62, 0.62, 0.05], upAt=0.8)],
       "L12 ('hold' 64.52): Compote holds a bright box of tissues up and out against the window, glaring",
       view((-2.0, 1.15, -0.55), (-2.25, 1.45, -2.55), 52), stars=['compote']),
  shot(100, 'ward', [patient('kob')],
       "L12 ('die' 65.78): Kob sees him, and her heart monitor flatlines (the monitor on the left, Kob on the right)",
       view((1.25, 1.5, -0.45), (1.6, 1.35, -2.75), 56), flat=[3, 0.05], stars=['kob']),
  shot(102, 'ward', [patient('compote', clip='bored_idle', hold='tissuebox', arm='R', aim=[0.62, 0.62, 0.05], upAt=0.0,
                             toss={'at': 0.25, 'to': [2.82, 1.2, 0.85], 'dur': 0.55, 'arc': 0.5})],
       "L12 ('go' 67.32): his point of view: across the ward, Compote throws it, and the box flies straight into the lens",
       view((2.9, 1.2, 0.9), (-2.0, 1.35, -2.55), 36), stars=['compote']),
  shot(104, 'ward', [A('saxo', 'large_hit_reaction_from_the_front', 3.2, 0.9, look='saxo', face='world', yaw=-90, at='auto', hold='getwell', toss={'at': 0.35, 'to': [3.35, 2.8, 0.55], 'dur': 1.4, 'arc': 0.0, 'scale': 1.0})],
       "L13 ('sick' 68.82): dazed, he lets go of his balloon, which floats up to the ceiling",
       view((1.1, 1.2, 0.72), (3.2, 1.2, 0.72), 56), stars=['saxo']),
  shot(108, 'ward', [A('sadi', 'quickly_pointing_angrily_forward', 0.0, WSIT + 0.1, lift=0.66, face='world', yaw=yaw_to((0.0, WSIT), (3.4, 0.9)), at='auto', hat='partyhat', hatY=0.86, nose=True),
                     A('kob', 'quickly_pointing_angrily_forward', 2.0, WSIT + 0.1, lift=0.66, face='world', yaw=yaw_to((2.0, WSIT), (3.4, 0.9)), at='auto', hat='partyhat', hatY=0.86, mask=True)],
       "L13 ('patient' 71.16, 'zero' 71.74): Sadi and Kob stand up in their beds and point at him (from where he stands), every pet staring",
       view((4.2, 1.45, 0.8), (1.0, 1.35, -2.55), 56), stare=[3.3, 0.9], stars=['sadi', 'kob']),
  shot(110, 'ward', [A('saxo', 'disappointed_awe_shucks', 0.9, -0.2, look='saxo', face='world', yaw=180, at='auto')],
       "L13 (to 73.11): the reverse: his guilty face, sheepish, the whole ward looking at him",
       view((0.9, 1.15, -2.5), (0.9, 0.88, -0.2), 52), stare=[0.9, -0.2], front=True, stars=['saxo']),
  shot(112, 'ward', [A('saxo', 'shoulder_shrug', 3.2, 0.9, look='saxo', face='world', yaw=-90, at='auto')],
       "ad-lib: he shrugs; so does the devil on his shoulder",
       view((1.1, 1.2, 0.72), (3.2, 1.2, 0.72), 56), crowd=devil(3.2, 0.36, 0.6, clip='shoulder_shrug'), stars=['saxo']),
  shot(114, 'ward', [A('saxo', 'long_yell_while_standing_leaning_back', 3.2, 0.9, look='saxo', face='world', yaw=-90, at='auto')],
       "ad-lib: his nose twitches; he turns to the camera, and leans back: ah... ah...",
       view((1.9, 1.02, 0.9), (3.2, 1.0, 0.9), 54), stars=['saxo']),
  shot(116, 'ward', [A('saxo', SNEEZE, 3.2, 0.9, look='saxo', face='world', yaw=-90, at='auto', sneeze=0.0, fg=True)],
       "BUTTON (76.30, the bar's downbeat): CHOO! He sneezes on the camera, and the camera falls over onto the floor, still looking up at him; the music stops (76.84), silence",
       vpath([(1.95, 1.02, 0.9), (1.95, 1.0, 0.9), (1.95, 0.7, 0.95), (2.05, 0.3, 1.0), (2.1, 0.14, 1.0), (2.1, 0.14, 1.0)], (3.2, 1.0, 0.9), fov=60,
             looks=[1.0, 1.0, 1.05, 1.15, 1.2, 1.2], roll=[0, 0, 30, 75, 86, 86], ease='lin'), still=True),
]

clips = {a['clip'] for s in shots for a in s['actors']} | {s['crowd']['clip'] for s in shots if s.get('crowd')}
BASE = {'tpose', 'gangnam', 'twist', 'macarena', 'silly_twist', 'chicken', 'twerk', 'ymca', 'robot', 'shopping_cart', 'running_man', 'moonwalk', 'shuffle', 'tut', 'booty_step', 'arm_wave', 'snake', 'shimmy', 'charleston', 'samba', 'belly', 'northern_soul_spin',
        'skate_push', 'skate_idle', 'uppercut_atk', 'uppercut_vic', 'slam_atk', 'slam_vic'}
ep = {
  'date': '2026-09-27', 'n': 3,
  'song': {'title': 'Patient Zero', 'artist': 'Taylor Swift', 'window': [62.86, 139.70], 'bpm': 92.0, 'tail': 0.6},
  'logline': "Sick in bed with a fever, Saxo gets talked into the party across the street by the tiny devil on his "
             "shoulder, sneezes on everyone (the punch, Compote's carrot, masked Kob, Sadi's face right after she kisses "
             "him in the rain) and wakes up cured; in the ward, the whole party sits in hospital beds in their party "
             "hats and points at him: patient zero. Then he sneezes on you, and the camera falls over.",
  'new': ['block map (one night street, three places: Saxo\'s bedroom with the sick bed, the window above it and the '
          'nightstand; the street with its lamp, cars, puddles and rain; the party house across it, its windows '
          'flashing with dancing silhouettes, and inside it the party: a light-up dance floor under a mirror ball, the '
          'snack table with the punch bowl, a couch, balloons, streamers, pet guests in party hats; flags zone room / '
          'street / party / morning, rain, ripple, sickGuests, lamp, noguests, clear)',
          'ward map (a hospital ward in the morning: five beds with heart monitors blipping on the beat, IV poles, '
          'curtain rails, tall windows, the door; pet patients in party hats, confetti on the blankets; flags flat (a '
          'monitor flatlines), pax, stare, noPax, clear)',
          'actor fields nose (a red nose), therm (a thermometer in the mouth), mask (a surgical mask), sneeze (a spray out '
          'of the nose along the face); hats partyhat and icepack; props thermo, tissue, tissuebox; a crowd\'s scale and '
          'noShadow (a crowd of one small copy: the tiny devil on his shoulder)',
          'engine fix: the crowd is placed before the actors (its clip measurements posed Saxo\'s rig after his props, and '
          'its line had cut off the plain dance render)',
          'costumes: Saxo pyjama (striped flannel pyjamas and a red knitted scarf) and Saxo devil (a red devil suit with '
          'horns and a tail)'],
  'notes': "A trending song, not the queue (empty). Taylor Swift's new album, The Life of a Showgirl: The Encore, came "
           "out on 2026-09-24; Patient Zero was #1 on Apple Music US and Spotify US and global (13.7M streams a day) "
           "on 2026-09-26, its TikTok sound 1 day old (769 videos). Its video premieres at the VMAs on 2026-09-27; only "
           "a lyric video and a TV teaser exist (a brutalist house by the sea, a sports car, an actress), so the world "
           "comes from the words: a party, a devil on a shoulder, holding on, dying, being sick, patient zero, a kiss in "
           "the rain, a fever. Ours: the friend who goes to the party sick and gives everyone the flu, then shows up "
           "cured. Structure: fourth wall (never used): the story ends on him sneezing at the lens and the camera "
           "falling over. Whole cast: Saxo (patient zero; the joke lands on everyone else, then on the viewer), Sadi "
           "(the romance, the kiss in the rain; the reality check: he sneezes in her face, and she points), Kob (never "
           "goes out: she came in her pyjamas and a mask, saw him coming, caught it anyway and flatlines when he "
           "visits), Compote (always angry: he sneezes on her carrot; she throws a tissue box at him). The tiny devil "
           "is Saxo himself in a devil suit, a quarter his size: chorus 1 he tempts him, chorus 2 he laughs, then "
           "shrugs with him.",
  'with': ['sadi', 'kob', 'compote'],
  'clips': sorted(clips - BASE),
  'shots': shots,
  'yt': 'end',
  'tags': {'structure': 'fourth wall', 'scenes': [], 'cast': ['saxo', 'sadi', 'kob', 'compote'], 'hook': 'lyric',
           'maps': ['block', 'ward'], 'ref': 'dog-human-job',
           'lyric_literal': "L00 party (it flashes through his window), L01 devil on my shoulder (the tiny devil), L02 hold (the thermometer) / die (the drama-queen flop) / go (he goes), L03 sick (a sneeze) / patient zero (his entrance), L05 love (the dance with Sadi), L06 saw it coming (Kob's paw up), L07 kissed / rain / face (the kiss in the rain, the sneeze in her face), L10 party (the ward in party hats), L11 devil on my shoulder, L12 hold / die / go (the tissue box, the flatline, the throw), L13 sick / patient zero (they all point at him)",
           'experiment': "Does a relatable 'friend who comes to the party sick' story with a fourth-wall button (he sneezes on the viewer and the camera falls over) on the week's biggest new song (Taylor Swift, 2 days old) beat our queue songs on shares and views?"},
}
out = os.path.join(os.path.dirname(__file__), '2026-09-27-3.json')
json.dump(ep, open(out, 'w'), ensure_ascii=False, indent=1)
print(out, len(shots), 'shots', len(ep['clips']), 'clips', 'end', END)
starts = [T(s['beat']) if i else 0 for i, s in enumerate(shots)]
print('sheet times:', ','.join(str(round((starts[i] + (starts[i + 1] if i + 1 < len(shots) else END)) / 2, 2)) for i in range(len(shots))))
