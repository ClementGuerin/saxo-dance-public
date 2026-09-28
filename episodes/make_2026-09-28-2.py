# make_2026-09-28-2.py: writes episodes/2026-09-28-2.json, "Hootie Frutti" (KATSEYE): the official MV at 108M views and
# its Saturday Night Live performance of 2026-09-27 on YouTube's US trending music. The clip is a dance rehearsal in a
# sweltering old warehouse (sun through tall factory windows, white plastic chairs, water jugs, a girl lounging on a
# stack of red plastic chairs, fruit-coloured outfits). Ours: the warehouse's Hootie Frutti dance-off is FRUITS ONLY.
# Saxo, in a banana suit, runs the door and the dance floor; Compote shows up as a carrot and he turns her away (a
# vegetable). She tries the window, then the door again with a pineapple on her head, then crawls in on all fours and
# takes cover behind the fruit bar. Kob, on her throne of red chairs, sees everything and says nothing, eating
# watermelon. Saxo and Sadi (a strawberry) own the floor, the crowd flaps its paws on every "hootie frutti", he takes
# his bow on the podium... and on the outro's seven "fruit"s a line Compote empties the fruit bar at him, one fruit per
# "fruit", Sadi joins in, he goes down in a heap of fruit, and on the last word a watermelon lands on his belly; the
# song stops dead. Structure: reversal (the one turned away wins in the end).
# Beats count from B0 = 0.040 s at 130 BPM (cut time = B0 + b * 60/130 s; a bar = 4 beats = 1.846 s); the cut is
# 70.326-137.300 s of the song (episodes/2026-09-28-2.config.js). Lyric lines are named by number (L00-L30,
# episodes/2026-09-28-2.lyrics.js): the lyrics stay in their files. Verse 2 b0-48 (L00-L08), pre-chorus 2 b48-76
# (L09-L14), chorus 2 b76-110 (L15-L25; its "hootie frutti" lines L16-L18 and L21-L23), the outro chant b110-142 (L26:
# seven "fruit"s on b111, 111.75, 112.5, 113.5, 115, 115.75, 116.5; L27-L29 the same after a "hootie" on b118, 126,
# 134), the last word on b142, the song's dead stop on b143; the video ends at 66.97 s (b145).
# Action words (whitelisted tags, kit beats): L01 night (b4), L04 day (b20), L07 juicy (b36.2), "hootie frutti" on most
# lines of the verse and the chorus, "fruit" x28 in the chant.
import json, math, os, sys
sys.path.insert(0, os.path.dirname(__file__))
from cam import view, low, deadpan, orbit, reveal, topdown

P, B0 = 60 / 130, 0.04
T = lambda b: round(B0 + b * P, 3)                 # beat -> cut seconds
S = lambda b: round(b * P, 3)                      # beats -> seconds into a shot
END = 66.97
LOOK = {'saxo': 'banana', 'sadi': 'strawberry', 'kob': 'kob', 'compote': 'carrot'}
# ---- the warehouse (src/maps15.js HALL) ----
DOOR_IN = (2.55, 5.55)         # Saxo in the doorway, his placard clear of its left jamb, facing out (+z)
OUT = (2.6, 7.35)              # Compote in the yard, facing the door (-z)
PEEK = (-8.55, 1.0)            # Compote outside the low window (its sill at 0.55): her face shows from the chin up
THRONE = (-5.5, -4.4); TH_YAW = 54.4; KLIFT = 0.72 - 0.1      # Kob's stack of red chairs: the top seat at 0.72, facing the floor
STAGE = (0.0, -5.1); PY = 0.3                                  # Saxo's mark on the pallet podium; its top
SADI_ST = (1.0, -5.3)                                          # Sadi beside him on the podium
FL_S, FL_D = (-0.5, -1.6), (0.55, -1.75)                       # Saxo and Sadi on the dance floor (the verse)
BEHIND = (5.45, -2.6)                                          # Compote behind the fruit bar (its top at 0.55)
SADI_OFF = (1.9, -4.3)                                         # Sadi off the podium in the barrage, at its corner
SADI_FAR = (-1.9, -4.3)                                        # ...or at its far corner (from the bar's side she hid him)
FR = [1.0, 1.75, 2.5, 3.5, 5.0, 5.75, 6.5]                     # the seven "fruit"s of a chant line, beats after its start

def A(who, clip, x, z, **o):
    return {'who': who, 'look': o.pop('look', LOOK[who]), 'clip': clip, 'x': round(x, 3), 'z': round(z, 3), **o}
def yaw_to(a, b): return round(math.degrees(math.atan2(b[0] - a[0], b[1] - a[1])), 1)
TO_STAGE = yaw_to(BEHIND, STAGE)
def kob(**o):                                      # Kob on her throne, facing the floor, a watermelon slice in her paw
    return A('kob', o.pop('clip', 'male_driving_a_car'), *THRONE, lift=KLIFT, face='world', yaw=o.pop('yaw', TH_YAW), at=o.pop('at', 0.3), speed=o.pop('speed', 0.05), hold='slice', **o)
def comp_bar(clip='bored_idle', **o):              # Compote behind the fruit bar, facing the podium
    return A('compote', clip, *BEHIND, face='world', yaw=o.pop('yaw', TO_STAGE), at=o.pop('at', 0.5), speed=o.pop('speed', 0.4), **o)
def stage(who, clip, at_=STAGE, **o):              # on the podium, facing the crowd (+z)
    return A(who, clip, *at_, lift=PY, face=o.pop('face', 'world'), yaw=o.pop('yaw', 0), **o)
FLAP = dict(arm='both', aim='caramell', upAt=0.0, flap=0.55, flapPh=0.5)   # the "hootie" move: paws by the ears, flapping on the beat (a full flap caught mid-swing read as arms straight out)
EAT = dict(arm='R', aim='toast', upAt=0.0)          # the slice up at her mouth
def volley(shot_beat, words, to, dur=0.52, **o):    # a pelt whose fruit land on the given words (kit beats)
    rnd = lambda p: [round(c, 3) for c in p]
    return {'times': [round(S(w - shot_beat) - dur, 3) for w in words], 'to': [rnd(p) for p in to] if isinstance(to[0], (list, tuple)) else rnd(to), 'dur': dur, **o}
def chant(start): return [start + r for r in FR]
FACE_ON_STAGE = (0.06, 1.2, -4.95)                  # Saxo's face on the podium, where the fruit hits

def clear_for(lenses, look, marks):
    """no pet on a lens, along its line of sight, or on a mark"""
    out = []
    for p in lenses:
        out.append([round(p[0], 2), round(p[2], 2), 0.9])
        for k in range(1, 8):
            u = k / 8
            out.append([round(p[0] + (look[0] - p[0]) * u, 2), round(p[2] + (look[1] - p[2]) * u, 2), 0.7])
    return out + [[m[0], m[1], 0.85] for m in marks]
shots = []
def add(beat, actors, lyric, v, lenses, **o):
    c, focus = v
    extra = o.pop('clear', [])
    shots.append({'beat': beat, 'kind': 'dance', 'map': 'hall', 'actors': actors, 'lyric': lyric, 'cam': c, 'focus': focus,
                  'clear': clear_for(lenses, focus, [(a['x'], a['z']) for a in actors]) + extra, **o})

# ================= verse 2: the door, the window, the disguise, the crawl (L00-L08) =================
SIGN = dict(hold='fruitsign', arm='R', aim=[0.55, 0.25, 0.8], upAt=0.0)   # the FRUIT ONLY placard held up beside his face, his paw on its stick
p0, p1 = (2.4, 1.0, 4.75), (2.4, 1.0, 5.0)
add(0, [A('compote', 'angry_forward_gesture', *OUT, face='world', yaw=180, at='auto', arm='R', aim=[0.62, 0.58, 0.52], upAt=0.0)],
    "HOOK, L00: from inside the doorway: Compote in her carrot suit in the sun, furious, jabbing a paw at the lens (the critic: the funnier face first, the reason on beat 4)",
    view(p0, (2.55, 0.85, 7.35), 56, p1=p1), [p0, p1], stars=['compote'])
p0, p1 = (2.4, 1.0, 8.1), (2.4, 1.0, 7.8)
add(4, [A('saxo', 'shaking_head_no_dismissively', *DOOR_IN, face='world', yaw=0, at=0.2, **SIGN)],
    "L01 ('night' b4): the reverse, from the sunny yard at her eye level: the reason: Saxo in a banana suit blocks the doorway, holds up a FRUIT ONLY placard (a carrot crossed out) and shakes his head no",
    view(p0, (2.35, 1.05, 5.55), 60, p1=p1), [p0, p1], stars=['saxo'])
p0, p1 = (0.12, 0.5, 1.45), (0.1, 0.5, 1.05)
add(8, [A('saxo', 'female_hip_hop_raise_the_roof_dancing', *FL_S, face='world', yaw=10, at=0.0), A('sadi', 'female_hip_hop_raise_the_roof_dancing', *FL_D, face='world', yaw=-15, at=1.1)],
    "L02: inside, the dance-off in full swing: sun through the factory windows, a ring of pets in fruit colours; in the middle the banana and the strawberry dance a funk step, low and pushing in",
    low(p0, (0.03, 0.85, -1.68), p1, fov=62, roll=(-8, -5)), [p0, p1], stars=['saxo', 'sadi'])
v = deadpan(THRONE, 1.38, 2.9, cam_y=1.42, ang=TH_YAW, fov=48)
add(16, [kob()],
    "L03: deadpan: Kob on her throne of stacked red plastic chairs (the clip's girl on her chair stack), in her tweed, not in costume, a slice of watermelon in her paw, unimpressed",
    v, [(THRONE[0] + 2.9 * math.sin(math.radians(TH_YAW)), 1.3, THRONE[1] + 2.9 * math.cos(math.radians(TH_YAW)))], stars=['kob'])
v = deadpan(PEEK, 1.0, 3.6, cam_y=1.1, ang=90, fov=54)
add(20, [A('compote', 'bored_idle', *PEEK, face='world', yaw=90, at=0.5, speed=0.4)],
    "L04 ('day' b20): the low window in the brick wall: Compote's face outside it, glaring in at the party, her carrot leaves over the sill",
    v, [(PEEK[0] + 3.6, 1.1, PEEK[1])], stars=['compote'])
MID = (0.02, -1.68)
v = orbit((0.15, -1.68), 3.3, 0.45, -22, 18, 0.95, fov=64)
add(24, [A('saxo', 'happy_idle', *FL_S, face='world', yaw=0, at='auto', sway=6, **FLAP), A('sadi', 'happy_idle', *FL_D, face='world', yaw=-10, at='auto', sway=6, swayPh=0.5, **FLAP)],
    "L05: 'hootie frutti': Saxo starts the move, paws up by his ears flapping on the beat, Sadi with him, and the whole ring of pets copies it, flapping: a low handheld orbit",
    v, [(0.15 + 3.3 * math.sin(math.radians(a)), 0.45, -1.68 + 3.3 * math.cos(math.radians(a))) for a in (-22, 0, 18)], flap=True, stars=['saxo', 'sadi'])
C_DOOR, S_DOOR = (2.9, 7.3), (2.25, 6.3)   # face to face in the yard: he has stepped out onto the threshold (inside, the jamb hid him)
p0, p1 = (0.25, 1.3, 8.25), (0.4, 1.3, 8.15)
add(32, [A('saxo', 'shaking_head_no_dismissively', *S_DOOR, face='world', yaw=yaw_to(S_DOOR, C_DOOR), at=0.2),
         A('compote', 'bored_idle', *C_DOOR, face='world', yaw=yaw_to(C_DOOR, S_DOOR), at=0.5, speed=0.4, hat='pineapple', hatY=0.72)],
    "L06: back at the door, her disguise: a pineapple balanced on her carrot hood; face to face in profile, the banana shakes his head again",
    view(p0, (2.55, 1.1, 6.8), 60, p1=p1), [p0, p1], stars=['compote', 'saxo'])
v = deadpan(THRONE, 1.5, 2.1, cam_y=1.55, ang=TH_YAW - 22, fov=40)
add(36, [kob(arm='R', aim=[0.2, 0.8, 0.56], upAt=0.0)],
    "L07 ('juicy' b36.2): Kob lifts her watermelon slice to her mouth, deadpan: juicy",
    v, [(THRONE[0] + 2.1 * math.sin(math.radians(TH_YAW - 22)), 1.3, THRONE[1] + 2.1 * math.cos(math.radians(TH_YAW - 22)))], stars=['kob'])
p0, p1 = (6.4, 0.6, 4.2), (6.25, 0.6, 4.15)
add(39, [A('compote', 'crawling_forward_on_hands_and_knees', 3.4, 5.05, face='world', yaw=180, at='auto', mz=-1.2, noLie=True)],
    "L08: while his back is turned she crawls in through the door on all fours, carrot leaves bobbing, low behind the crowd",
    view(p0, (3.4, 0.45, 4.1), 58, p1=p1, roll=[-5, -3]), [p0, p1], stars=['compote'])

# ================= pre-chorus 2: the podium, the fruit bar, the witness (L09-L14) =================
AUD = dict(audience=True)
p0, p1 = (0.3, 0.22, -1.9), (0.25, 0.22, -2.6)
add(48, [stage('saxo', 'hip_hop_dancing_shimmy', at='auto')],
    "L09: Saxo takes the podium: a low dolly-in through the crowd on the banana shimmying, the speaker stacks behind him",
    low(p0, (0.0, 1.05, -5.1), p1, fov=62, roll=(-8, -5)), [p0, p1], stars=['saxo'], **AUD)
p0 = (0.6, 1.2, -1.6)
add(52.5, [stage('saxo', 'samba_gandy_variation_1', at='auto'), stage('sadi', 'female_samba_pagode_variation_five_loop', at_=SADI_ST, yaw=-10, at='auto')],
    "L10: Sadi joins him on the podium: the banana and the strawberry, samba side by side, over the crowd's heads",
    view(p0, (0.5, 1.0, -5.2), 56), [p0], stars=['saxo', 'sadi'], **AUD)
v = deadpan(BEHIND, 0.95, 2.7, cam_y=1.2, ang=TO_STAGE, fov=44)
BAR_CAM = (BEHIND[0] + 2.7 * math.sin(math.radians(TO_STAGE)), 1.2, BEHIND[1] + 2.7 * math.cos(math.radians(TO_STAGE)))
add(56.5, [comp_bar()],
    "L11: behind the fruit bar: Compote, her eyes over the pyramids of oranges and apples, staring at the podium",
    v, [BAR_CAM], stars=['compote'], **AUD)
TO_BAR = yaw_to(THRONE, BEHIND)
v = deadpan(THRONE, 1.48, 2.6, cam_y=1.5, ang=TO_BAR, fov=38)
add(60.5, [kob(yaw=TO_BAR, arm='R', aim=[0.2, 0.8, 0.56], upAt=0.0)],
    "L12: from the fruit bar's side: Kob has turned on her throne and stares straight at Compote (the lens), slice at her mouth. She says nothing",
    v, [(THRONE[0] + 2.6 * math.sin(math.radians(TO_BAR)), 1.5, THRONE[1] + 2.6 * math.cos(math.radians(TO_BAR)))], stars=['kob'], **AUD)
p0, p1 = (0.35, 1.9, -3.7), (1.2, 3.5, 1.9)
add(64, [stage('saxo', 'male_cheering_with_two_fists_pump', at='auto'), stage('sadi', 'female_samba_pagode_variation_five_loop', at_=SADI_ST, yaw=-10, at='auto')],
    "L13: a pull-back from the podium over the whole hall: the crowd cheering the banana, paws up",
    reveal(p0, (0.3, 1.0, -5.1), p1, fov=60), [p0, p1] + [tuple(a + (b - a) * u for a, b in zip(p0, p1)) for u in (0.25, 0.5, 0.75)], cheer=True, stars=['saxo'], **AUD)
v = orbit((0.55, -5.2), 3.3, 0.7, -22, 18, 1.1, fov=62)
add(68.5, [stage('saxo', 'female_hip_hop_raise_the_roof_dancing', at=0.0), stage('sadi', 'female_hip_hop_raise_the_roof_dancing', at_=SADI_ST, yaw=-10, at=1.1)],
    "L14 into the chorus: the build: the two of them dance up to the drop, orbiting low round the podium",
    v, [(0.55 + 3.3 * math.sin(math.radians(a)), 0.7, -5.2 + 3.3 * math.cos(math.radians(a))) for a in (-22, 0, 18)], stars=['saxo', 'sadi'], **AUD)

# ================= chorus 2: the flap on every "hootie frutti", Compote arms herself (L15-L25) =================
p0, p1 = (0.45, 0.25, -2.6), (0.4, 0.25, -3.0)
add(76, [stage('saxo', 'samba_gandy_variation_1', at='auto'), stage('sadi', 'samba_funky_pocoto_variation_1', at_=SADI_ST, yaw=-10, at='auto')],
    "L15: the chorus: the banana and the strawberry, low from the front of the podium",
    low(p0, (0.5, 1.0, -5.2), p1, fov=66, roll=(8, 5)), [p0, p1], stars=['saxo', 'sadi'], **AUD)
p0 = (0.35, 2.7, -7.3)
add(79, [stage('saxo', 'happy_idle', at='auto', fg=True, **FLAP), stage('sadi', 'happy_idle', at_=SADI_ST, yaw=-10, at='auto', fg=True, **FLAP)],
    "L16 (J, 'hootie frutti'): the reverse from the back of the podium, over the banana and the strawberry: the whole crowd facing them does the flap, paws up by the ears on every beat",
    view(p0, (0.5, 0.6, -1.6), 60), [], flap=True, stars=['saxo', 'sadi'], **AUD)
p0 = (3.45, 1.15, -3.45)
add(83, [comp_bar(hold='banana', holdL='orange', arm='both', aim=[0.38, 0.5, 0.78], upAt=0.2)],
    "L17 (J): three-quarter front: Compote loads up, a banana in one paw and an orange in the other raised up beside her head, glaring",
    view(p0, (5.45, 1.05, -2.6), 44), [p0], barGap=True, stars=['compote'], **AUD)
p0, p1 = (-0.6, 0.22, -2.9), (-0.5, 0.22, -3.3)
add(87, [stage('saxo', 'happy_idle', at='auto', sway=8, **FLAP), stage('sadi', 'happy_idle', at_=SADI_ST, yaw=-10, at='auto', sway=8, swayPh=0.5, **FLAP)],
    "L18 (J): the flap again, low and rolled, the banana and the strawberry flapping in sync",
    low(p0, (0.4, 1.05, -5.2), p1, fov=66, roll=(-10, -7)), [p0, p1], flap=True, stars=['saxo', 'sadi'], **AUD)
v = deadpan(THRONE, 1.45, 2.4, cam_y=0.95, ang=TH_YAW + 24, fov=44)
add(91, [kob(arm='R', aim=[0.55, 0.8, 0.25], upAt=0.0)],
    "L19 (K): Kob raises her slice a little: a toast to what's coming",
    v, [(THRONE[0] + 2.4 * math.sin(math.radians(TH_YAW + 24)), 0.95, THRONE[1] + 2.4 * math.cos(math.radians(TH_YAW + 24)))], stars=['kob'], **AUD)
p0, p1 = (0.5, 1.2, -0.9), (0.5, 1.2, -1.25)
add(93, [stage('saxo', 'samba_funky_pocoto_variation_1', at='auto', sway=10), stage('sadi', 'samba_funky_pocoto_variation_1', at_=SADI_ST, yaw=-10, at='auto', sway=10)],
    "L20 (I): a hip wiggle on the podium, medium, pushing in over the crowd",
    view(p0, (0.5, 1.0, -5.2), 60, p1=p1), [p0, p1], stars=['saxo', 'sadi'], **AUD)
p0 = (-3.6, 2.5, 2.4)
add(95, [stage('saxo', 'happy_idle', at='auto', **FLAP), stage('sadi', 'happy_idle', at_=SADI_ST, yaw=-10, at='auto', **FLAP)],
    "L21 (J): high from the side of the hall: the whole crowd flapping in rows towards the podium",
    view(p0, (0.45, 0.9, -4.7), 56), [p0], flap=True, stars=['saxo'], **AUD)
v = orbit(STAGE, 2.3, 0.35, 25, -30, 1.05, fov=62)
add(99, [stage('saxo', 'happy_idle', at='auto', sway=7, **FLAP)],
    "L22 (J): Saxo alone, flapping, eyes on the crowd, a low handheld orbit",
    v, [(STAGE[0] + 2.3 * math.sin(math.radians(a)), 0.35, STAGE[1] + 2.3 * math.cos(math.radians(a))) for a in (25, 0, -30)], flap=True, stars=['saxo'], **AUD)
p0 = (3.55, 1.02, -3.05)
add(103, [comp_bar(hold='melon', holdScale=0.6, arm='both', aim=[0.3, 0.26, 0.92], upAt=0.25)],
    "L23 (J): low at the bar's corner, looking up: Compote hoists a whole watermelon off the bar in both paws, her glare over it, the counter under it",
    view(p0, (5.45, 1.0, -2.6), 50), [p0], barGap=True, stars=['compote'], **AUD)
p0 = (0.85, 1.45, -0.3)
add(106, [stage('saxo', 'high_enthusiasm_fist_pump', face='camera', at=0.4), stage('sadi', 'clap_while_standing', at_=SADI_ST, yaw=-10, at='auto')],
    "L24-L25 (K, I): the song's peak: the banana takes his bow on the podium, arms up, the crowd cheering, the winner",
    view(p0, (0.45, 1.1, -5.1), 52), [p0], cheer=True, clear=[[0.0, -1.35, 0.75], [1.7, -1.35, 0.75], [-0.35, -2.3, 0.6], [2.0, -2.3, 0.6]], stars=['saxo'], **AUD)

# ================= the chant: seven "fruit"s a line, one fruit each (L26-L29), the last word (L30) =================
KINDS = ['orange', 'apple', 'banana', 'lemon', 'grapes', 'pineapple', 'strawberry']
PATH = (BEHIND[0] + 2.5 * math.sin(math.radians(TO_STAGE)), 1.05, BEHIND[1] + 2.5 * math.cos(math.radians(TO_STAGE)))   # on the fruit's path, 2.5 m in front of her
lens = (PATH[0] + 0.3 * math.sin(math.radians(TO_STAGE + 180)), 1.05, PATH[2] + 0.3 * math.cos(math.radians(TO_STAGE + 180)))
add(110, [comp_bar('bored_idle', hold='orange', arm='both', aim='pelt', pelt=volley(110, chant(110), lens, dur=0.3, spread=0.1, arc=0.12, kinds=KINDS))],
    "L26 (b111-116.5, seven 'fruit's): on the fruit's path: Compote behind the bar hurls fruit at the podium, both paws, one per 'fruit', each flying straight into the lens",
    view(PATH, (BEHIND[0], 0.95, BEHIND[1]), 52), [PATH], stars=['compote'], **AUD)
p0 = (-0.5, 1.1, -1.8)
add(118, [stage('saxo', 'getting_hit_in_the_face_from_various_angles', at=0.0),
          stage('sadi', 'jumping_backwards_dodge', at_=SADI_ST, face='camera', at=0.0, once=True),
          comp_bar('bored_idle', hold='orange', arm='both', aim='pelt', fg=True, pelt=volley(118, chant(118), FACE_ON_STAGE, dur=0.55, floorY=PY, fly=1.1, kinds=KINDS))],
    "L27 (hootie b118, seven 'fruit's): on the podium the banana takes an orange, an apple, a lemon in the face, one per 'fruit', flinching; the strawberry jumps clear",
    view(p0, (0.4, 1.05, -5.1), 58), [p0], pile=[2, 0.7], stare=list(STAGE), stars=['saxo'], **AUD)
p0 = (7.6, 1.65, -2.1)
add(126, [stage('saxo', 'getting_hit_in_the_face_from_various_angles', at=1.5),
          A('sadi', 'bored_idle', *SADI_FAR, face='world', yaw=yaw_to(SADI_FAR, STAGE), at='auto', hold='apple', arm='both', aim='pelt',
            pelt=volley(126, [127.4, 128.9, 130.4, 131.9], FACE_ON_STAGE, dur=0.7, arc=0.9, floorY=PY, big=2.0, kinds=['apple', 'lemon', 'grapes', 'orange'])),
          comp_bar('bored_idle', hold='orange', arm='both', aim='pelt', fg=True, pelt=volley(126, chant(126), FACE_ON_STAGE, dur=1.25, floorY=PY, fly=1.1, arc=1.7, big=2.2, kinds=KINDS))],
    "L28 (seven 'fruit's): over Compote's shoulder behind the bar: she empties it at the podium, fruit arcing across the hall; Sadi joins in from the side; the crowd cheers the fruit on",
    view(p0, (0.3, 1.0, -5.0), 54), [p0], pile=[9, 0.8], cheer=True, stare=list(STAGE), bar=0.6, stars=['compote', 'sadi'], **AUD)
p0 = (0.45, 1.05, -3.1)
add(134, [stage('saxo', 'knocked_out_falling_to_back', at=0.0, once=True, ground='mesh'),
          comp_bar('bored_idle', hold='orange', arm='both', aim='pelt', fg=True, pelt=volley(134, chant(134)[:4], FACE_ON_STAGE, dur=0.55, floorY=PY, fly=1.1, kinds=KINDS))],
    "L29 (the first four 'fruit's): close on the banana: hit, hit, hit, and on the fourth he topples over backwards into the heap",
    view(p0, (0.05, 1.18, -5.1), 56), [p0], pile=[16, 0.8], stare=list(STAGE), bar=0.4, stars=['saxo'], **AUD)
BODY = (-0.12, -5.42)          # the middle of his body lying on the podium (the clip falls back and a little to his right)
BELLY = (-0.05, 0.62, -5.25)
LAST = [139.0, 139.75, 140.5, 142.0]   # the last three "fruit"s, then the last word: the watermelon she lifted in L23
def last_volley(shot_beat):
    pile_pt = (-0.1, 0.7, -5.45)
    return volley(shot_beat, LAST, [pile_pt, pile_pt, pile_pt, BELLY], dur=0.55, kinds=['orange', 'apple', 'lemon', 'melon'],
                  floorY=[PY, PY, PY, 0.64], fly=[0.6, 0.6, 0.6, 0.05], big=[1.3, 1.3, 1.3, 1.0], arc=0.6)
v = topdown(BODY, 4.2, 3.7, fov=56)
add(138.5, [stage('saxo', 'knocked_out_falling_to_back', at=3.2, speed=0.05, ground='mesh'),
            comp_bar('bored_idle', hold='orange', arm='both', aim='pelt', fg=True, pelt=last_volley(138.5))],
    "L29 end + L30 ('hootie' b142): from above: the banana flat on his back in a heap of fruit on the podium, three more land on him, and on the last word the whole watermelon she lifted lands on his belly",
    v, [(BODY[0], 4.2, BODY[1])], pileAt=list(BODY), pileY=PY, pile=40, stop=S(143 - 138.5), stars=['saxo'], **AUD)
add(143, [stage('saxo', 'knocked_out_falling_to_back', at=round(3.2 + 0.05 * S(143 - 138.5), 3), speed=0.0, ground='mesh'),
          comp_bar('bored_idle', hold='orange', arm='both', aim='pelt', fg=True, speed=0.0, pelt=last_volley(143))],
    "BUTTON: the song stops dead: the same frame, frozen and silent, the watermelon on his belly",
    v, [(BODY[0], 4.2, BODY[1])], pileAt=list(BODY), pileY=PY, pile=40, stop=0, still=True, stars=['saxo'], **AUD)

clips = {a['clip'] for s in shots for a in s['actors']}
BASE = {'tpose', 'gangnam', 'twist', 'macarena', 'silly_twist', 'chicken', 'twerk', 'ymca', 'robot', 'shopping_cart', 'running_man', 'moonwalk', 'shuffle', 'tut', 'booty_step', 'arm_wave', 'snake', 'shimmy', 'charleston', 'samba', 'belly', 'northern_soul_spin',
        'skate_push', 'skate_idle', 'uppercut_atk', 'uppercut_vic', 'slam_atk', 'slam_vic'}
ep = {
  'date': '2026-09-28', 'n': 2,
  'song': {'title': 'Hootie Frutti', 'artist': 'KATSEYE', 'window': [70.326, 137.3], 'bpm': 130.0},
  'logline': "The warehouse's Hootie Frutti dance-off is fruits only, and the banana on the door turns away a rabbit "
             "dressed as a carrot. She tries the window, a pineapple disguise, then crawls in and hides behind the fruit "
             "bar while he and the strawberry own the floor. On the song's 'fruit fruit fruit' chant she empties the bar "
             "at him, one fruit per 'fruit', and on the last word Kob drops a watermelon on him.",
  'new': ['hall map (the clip\'s sweltering warehouse turned into a fruits-only dance-off: factory windows, steel columns, '
          'bunting, white plastic chairs, water jugs, standing fans, the roller door onto a sunny yard with a FRUIT ONLY '
          'sandwich board, a low window, Kob\'s throne of stacked red plastic chairs, a pallet podium with speakers, the '
          'fruit bar, fruit crates, pets in fruit colours with a fruit on their heads that flap on "hootie"; flags flap, '
          'cheer, stare, pile, bar, stop, clear)',
          'fruit (src/fruit.js: banana, orange, apple, lemon, melon, slice, pineapple, grapes, strawberry), held, worn as a '
          'hat and thrown',
          'the actor field pelt: a volley of fruit thrown on given seconds, each landing on its word and bouncing off into '
          'a heap, with the throwing arms (aim "pelt")',
          'costumes: Saxo banana, Sadi strawberry, Compote carrot'],
  'notes': "The queue is empty and this run is a retry after a filter stop in the song phase (no web searches): the song "
           "comes from SocialCrawl's YouTube trending music for the US (its SNL performance of 2026-09-27 at 2.5M views "
           "in a day) and YouTube search (the official MV at 108M views, the choreography video at 27M). The clip: a "
           "sweltering old warehouse with sun through tall factory windows, white plastic chairs, water jugs, a girl "
           "lounging on a stack of red plastic chairs, a crowd rehearsing in fruit-coloured outfits, a water burst, a "
           "dirt bike. The lyrics are mostly the title as a chant; the outro repeats 'fruit' seven times a line, four "
           "lines: the pelting lands one fruit per word. Whole cast: Saxo (the joke is on him: the banana bouncer who "
           "turns a carrot away), Compote (always angry, throws things: the carrot who gets in and empties the fruit bar "
           "at him), Kob (never impressed, the witness who says nothing on her throne, and the last watermelon), Sadi "
           "(the romance, then the reality check: she joins the barrage). Kob isn't in costume: she never dresses up. For a muted TikTok: "
           "KATSEYE's official sound 'Hootie Frutti' is id 7686192374074329105 (60 s, 30 videos on 2026-09-28; a fan upload of the "
           "whole song, 'original sound - katseyekons.six', had 24k).",
  'with': ['sadi', 'kob', 'compote'],
  'clips': sorted(clips - BASE),
  'shots': shots,
  'yt': 'end',
  'tags': {'structure': 'reversal', 'scenes': ['pelt'], 'cast': ['saxo', 'sadi', 'kob', 'compote'], 'hook': 'action',
           'maps': ['hall'], 'ref': 'none',
           'lyric_literal': "the chant's 28 'fruit's (one fruit thrown per word, landing on it), L07 juicy (Kob bites her watermelon), 'hootie frutti' (the crowd's flap)",
           'experiment': "Does a lyric-synced payoff (a fruit thrown on every word of the song's own 'fruit fruit fruit' chant) make the ending more shareable than our story payoffs, on a K-pop girl group's global hit?"},
}
out = os.path.join(os.path.dirname(__file__), '2026-09-28-2.json')
json.dump(ep, open(out, 'w'), ensure_ascii=False, indent=1)
print(out, len(shots), 'shots', len(ep['clips']), 'clips', 'end', END)
starts = [T(s['beat']) if i else 0 for i, s in enumerate(shots)]
print('sheet times:', ','.join(str(round((starts[i] + (starts[i + 1] if i + 1 < len(shots) else END)) / 2, 2)) for i in range(len(shots))))
