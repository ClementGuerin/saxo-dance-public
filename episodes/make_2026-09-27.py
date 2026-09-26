# make_2026-09-27.py: writes episodes/2026-09-27.json, "Caramelldansen" (Caramella Girls, the Swedish original), from
# the user's queue: "start on the hook at 0:49" and "a really Japanese, kawaii clip".
# "The Caramelldansen outbreak": at a shrine's cherry-blossom festival at night, Saxo (in the clip's anime sailor
# uniform) starts the Caramelldansen in the stall lane, and it spreads one step per line: Sadi (in a yukata, a goldfish
# bag in her paw) claps, copies him, the lane follows, the whole festival fills the Bon Odori ring round the tower,
# where Compote the taiko drummer points angrily at anyone not dancing. Kob won't dance: she hides among the shrine's
# porcelain lucky cats in a lucky-cat suit, beckoning a hair off the beat. Compote goes looking, sniffs along the
# display, nose to nose with her... and moves on. Then even the statues catch it: on the instrumental every porcelain
# cat bursts into the dance but one, frozen with a paw up. Compote points. Kob gives in and dances it better than any
# of them, deadpan; the music stops dead and they all freeze back into statues, as if nothing happened.
# Beats count from B0 = 0.020 s at 164.732 BPM (cut time = B0 + b * 0.364228 s; a bar = 4 beats = 1.457 s); the cut is
# 49.873-121.08 s of the song (episodes/2026-09-27.config.js). Lyric lines are named by number (L00-L28, see
# episodes/2026-09-27.lyrics.js): the lyrics stay in their files. The hook bar b0-b4, chorus 1 b4-b36 (L00-L07, a line
# a bar), the chant b36-b68 (L08-L11), verse 2 b68-b100 (L12-L15), pre-chorus 2 b100-b132 (L16-L20), chorus 2
# b132-b164 (L21-L28), the instrumental b164-b195.45, then the music stops dead at 71.207 s (STOP) and 0.6 s of silence.
# Action words (whitelisted tags, kit seconds): L00 dance/us 1.49, L01 clap 2.81 hands 3.59, L02 do-as-we-do 4.29,
# L03 steps 6.07 left 6.65, L04 listen 7.15 learn 8.17, L05 miss 8.81, L06 now-we're-here 10.13, L07 the title 11.47,
# L13 everyone 28.39, L14 come 30.21, L16 feet 37.21, L17 wiggle 39.29 hips 39.99, L18 do-as-we-do 42.05, L20 come
# 47.27, then chorus 2 repeats chorus 1's words (L21 48.17 ... L28 58.15).
import json, math, os, sys
sys.path.insert(0, os.path.dirname(__file__))
from cam import view, swoop, low, deadpan, orbit, reveal

P, B0 = 60 / 164.732, 0.02
T = lambda b: round(B0 + b * P, 3)                 # beat -> cut seconds
END, STOP = 71.8, 71.207
STOP_B = round((STOP - B0) / P, 3)                 # 195.45: the music stops dead
LOOK = {'saxo': 'sailor', 'sadi': 'yukata', 'kob': 'maneki', 'compote': 'happi'}
# ---- the festival (src/maps10.js MATSURI) ----
PLAT = 1.1; YAG = (0.0, -2.0); DRUMMER = (0.0, -2.3)
LANE = (0.35, 10.0); SADI_L = (-0.6, 10.3)          # the lane marks (the lane pets keep ~1 m clear of them)
T_SAXO, T_SADI = (-0.85, -1.62), (0.85, -1.62)     # on the tower's platform, either side of the drum
R_SAXO, R_SADI = (-0.5, 1.28), (0.5, 1.3)          # in the ring's front, on the inner circle
DISP = (9.0, -7.5); TIER = (0.3, 0.42, 0.62)      # the display's front row centre; step top y0, rise, depth
KOB = DISP; KOB_Y = TIER[0]                       # Kob in the middle of the front row, on its step: hiding in plain sight
KOB_FACE = 1.15                                    # her face's height on the step
CARA = {'arm': 'both', 'aim': 'caramell', 'sway': 7}

def A(who, clip, x, z, **o):
    return {'who': who, 'look': o.pop('look', LOOK[who]), 'clip': clip, 'x': round(x, 3), 'z': round(z, 3), **o}
def saxo(x, z, clip='happy_idle', **o): return A('saxo', clip, x, z, **{**CARA, **o})
def sadi(x, z, clip='hip_hop_dancing_side_to_side', **o): return A('sadi', clip, x, z, **{**CARA, 'sway': 0, **o})
def compote_drum(**o):                             # Compote at her taiko on the tower, a stick in each paw
    return A('compote', 'bored_idle', *DRUMMER, lift=PLAT, face='world', yaw=0, **{'arm': 'both', 'aim': 'taiko', 'hold': 'bachi', 'holdL': 'bachi', **o})
def kob(**o):                                      # Kob among the statues, in her lucky-cat suit, beckoning like them
    return A('kob', 'bored_idle', *KOB, at=1.0, speed=0, lift=KOB_Y, face='world', yaw=0, **{'arm': 'R', 'aim': 'caramell', 'flapEvery': 2, **o})
STATUE = {'who': 'kob', 'look': 'maneki', 'clip': 'bored_idle', 'at': 1.0, 'speed': 0, 'n': 51, 'cols': 13, 'x0': DISP[0], 'z0': DISP[1],
          'dx': 0.72, 'dz': TIER[2], 'y0': TIER[0], 'dy': TIER[1], 'jitter': 0.02, 'face': 'world', 'yaw': 0, 'pale': 0.85, 'skip': [[KOB[0], KOB[1], 0.3]]}
def statues(**o):                                   # the porcelain lucky cats: a raised paw beckoning on every other beat, in sync
    return {**STATUE, 'arm': 'R', 'aim': 'caramell', 'flapEvery': 2, **o}
def yaw_to(a, b): return round(math.degrees(math.atan2(b[0] - a[0], b[1] - a[1])), 1)

def clear_for(v, actors):                          # hide the festival pets round every low lens position and every mark
    c, focus = v; out = []
    ang, r, h = c['ang'], c['r'], c['h']
    keys = [(ang[i], r[i], h[i]) for i in range(len(ang))]
    if len(keys) == 2: keys += [tuple(a + (b - a) * u for a, b in zip(keys[0], keys[1])) for u in (0.25, 0.5, 0.75)]
    for a, rr, hh in keys:
        if hh >= 2.2: continue
        cx, cz = focus[0] + math.sin(math.radians(a)) * rr, focus[1] + math.cos(math.radians(a)) * rr
        out.append([round(cx, 2), round(cz, 2), 1.2])
        d = 0.6
        while d < rr - 1.0:                          # the line of sight to the focus, clear to 1 m short of it
            u = d / rr; out.append([round(cx + (focus[0] - cx) * u, 2), round(cz + (focus[1] - cz) * u, 2), 0.7]); d += 0.6
    for a in actors:
        out.append([a['x'], a['z'], 0.8])
        if a.get('mx') or a.get('mz'): out.append([round(a['x'] + a.get('mx', 0), 2), round(a['z'] + a.get('mz', 0), 2), 0.8])
    return out
def fw_at(v):                                       # the fireworks' centre: 50 m out along the camera's line of sight
    c, focus = v; a, r = math.radians(c['ang'][0]), c['r'][0]
    cx, cz = focus[0] + math.sin(a) * r, focus[1] + math.cos(a) * r; d = math.hypot(focus[0] - cx, focus[1] - cz) or 1
    return [round(cx + (focus[0] - cx) / d * 50, 1), round(cz + (focus[1] - cz) / d * 50, 1)]
def shot(beat, actors, lyric, v, **o):
    c, focus = v
    if o.get('fw') is True: o['fw'] = fw_at(v)
    return {'beat': beat, 'kind': 'dance', 'map': 'matsuri', 'actors': actors, 'lyric': lyric, 'cam': c, 'focus': focus, 'clear': clear_for(v, actors) + o.pop('clear', []), **o}

shots = [
  # ================= the hook bar and chorus 1: the outbreak starts in the stall lane (L00-L07) =================
  shot(0, [saxo(*LANE)],
       "hook (the synth riff) + L00 ('dance with us' 1.49): over the goldfish tub, diving down the lane to Saxo in the clip's sailor uniform, alone, already doing the Caramelldansen; the festival pets stare",
       swoop([(-1.9, 0.52, 12.45), (-1.55, 0.58, 11.55), (-0.85, 0.26, 10.95), (-0.55, 0.2, 10.75)], (0.35, 0.72, 10.0), fov=60),
       lane=0, look=list(LANE), stars=['saxo']),
  shot(7, [A('sadi', 'bored_idle', *SADI_L, arm='both', aim='clap', holdL='goldfish', yaw=35)],   # only who the lens sees: Saxo sat on the edge (the gate)
       "L01 ('clap' 2.81, 'hands' 3.59): Sadi in her yukata, a goldfish bag in her paw, watching him: she claps along on every beat",
       low((-1.1, 0.34, 12.75), (-0.45, 0.98, 10.25), (-1.05, 0.32, 12.45), fov=56, roll=(-8, -5)), lane=0, look=list(LANE), stars=['sadi']),
  shot(12, [saxo(*LANE), sadi(*SADI_L, holdL='goldfish')],
       "L02 ('do as we do' 4.29): she copies him: the two side by side doing it in sync; the first two pets join in behind them",
       low((-0.1, 0.24, 13.3), (-0.12, 0.98, 10.15), (-0.1, 0.24, 12.8), fov=60, roll=(-9, -6)), lane=2, stars=['saxo', 'sadi']),
  shot(16, [saxo(*LANE, clip='hip_hop_dancing_side_to_side', sway=0, mx=-0.5), sadi(*SADI_L, holdL='goldfish', mx=-0.5)],
       "L03 ('steps' 6.07, 'left' 6.65): the whole front of the lane takes its steps to the left, paws up",
       view((0.9, 1.25, 14.2), (-0.35, 0.75, 10.1), 56, p1=(0.6, 1.2, 13.9)), lane=6),
  shot(20, [compote_drum(arm='R', aim=[0.58, 0.55, 0.6], upAt=round(8.17 - T(20), 2), hold=None)],
       "L04 ('listen' 7.15, 'learn' 8.17): up on the festival tower, Compote the taiko drummer stops drumming and glares down the lane... on 'learn' she points: dance",
       deadpan(DRUMMER, 1.98, 6.4, cam_y=2.02, push=0.3, fov=30), ring=0, stars=['compote']),
  shot(24, [saxo(*LANE), sadi(*SADI_L, holdL='goldfish')],
       "L05 ('miss' 8.81): the lane pets pile in, ten of them dancing round the pair",
       orbit((-0.12, 10.15), 2.5, 0.35, -32, 22, 0.8, fov=62), lane=10),
  shot(28, [saxo(*LANE), sadi(*SADI_L, holdL='goldfish')],
       "L06 ('now we're here' 10.13): pulling up and back over the stall lane: the whole lane dancing",
       reveal((0.2, 1.35, 12.1), (0.0, 0.6, 9.4), (0.5, 4.3, 15.6)), lane=14),
  shot(32, [saxo(*LANE)],
       "L07 (the title 11.47): from the ground among the raised paws, up at the lanterns: the first firework bursts over the shrine",
       view((0.95, 0.28, 11.75), (0.1, 1.5, 8.4), 60, p1=(0.85, 0.3, 11.55)), lane=14, fw=True, stars=['saxo']),
  # ================= the chant: it spreads to the whole festival (L08-L11) =================
  shot(36, [compote_drum()],
       "L08 (13.07): the plaza: the festival forms the Bon Odori ring round the tower, 24 dancing, Compote drumming the beat up top",
       view((0.5, 2.55, 6.6), (0.0, 0.6, -2.0), 54, p1=(0.3, 2.85, 7.2)), ring=36),   # the lane's axis: clear of the stalls' awnings
  shot(44, [compote_drum(fg=True, arm='R', aim=[0.5, 0.25, 0.83], upAt=0.2, hold=None)],
       "L09: over Compote's shoulder on the tower: she points her stick at the stragglers below, and the ring doubles",
       view((0.55, 2.55, -3.15), (0.0, 0.45, 2.6), 54, p1=(0.45, 2.5, -3.0)), ring=44),
  shot(52, [kob(flapPh=0.4)],
       "L10 (18.09): the shrine's lucky-cat display: rows of porcelain cats beckoning in sync... and one of them is Kob in a lucky-cat suit, her grey face among the white, beckoning a hair off the beat",
       deadpan(KOB, KOB_FACE, 4.6, cam_y=1.25, push=0.35, fov=38), crowd=statues(), stars=['kob']),
  shot(60, [compote_drum()],
       "L11 (21.33): the whole ring, 66 dancing round the tower under the lanterns",
       view((-0.6, 4.8, 7.4), (0.0, 0.5, -2.0), 56, p1=(0.6, 5.1, 7.9)), ring=66),
  # ================= verse 2: everyone... except (L12-L15) =================
  shot(68, [saxo(*R_SAXO, face='world', yaw=62), sadi(*R_SADI, face='world', yaw=-62, holdL='goldfish')],
       "L12 (24.33-27.55): in the ring, Saxo and Sadi dance it face to face, petals falling",
       low((0.05, 0.3, 4.1), (0.0, 0.82, 1.3), (0.05, 0.28, 3.6), fov=56, roll=(-8, -4)), ring=66),
  shot(76, [saxo(*R_SAXO), sadi(*R_SADI, holdL='goldfish')],
       "L13 ('everyone' 28.39): up and away from the pair over the whole ring and the tower, a firework over the shrine",
       reveal((0.25, 1.5, 2.6), (0.0, 0.9, 0.2), (0.6, 3.7, 7.8)), ring=66, fw=True),
  shot(82, [kob(flapEvery=1)],
       "L14 ('come' 30.21): the lucky cats beckon 'come' on every beat, Kob in sync with them now",
       view((9.0, 1.3, -5.2), (9.0, KOB_FACE, -7.5), 40), crowd=statues(flapEvery=1), stars=['kob']),
  shot(88, [A('compote', 'happy_walk', 6.2, 1.3, mx=0.9, mz=-2.6, face='world', yaw=yaw_to((6.2, 1.3), (7.1, -1.3)), speed=1.0, holdL='bachi')],
       "L15 (31.70-): Compote has left her drum: she marches round the ring's edge, glaring at every dancer",
       low((8.45, 0.4, 0.95), (6.6, 0.98, 0.0), (8.25, 0.38, 0.15), fov=62, roll=(8, 5)), ring=66),
  shot(92, [A('compote', 'shaking_head_no_dismissively', 7.1, -1.3, face='world', yaw=yaw_to((7.1, -1.3), (3.0, 1.0)), holdL='bachi')],
       "L15 (-35.84): she stops and counts them: everybody's dancing... so who's missing?",
       view((8.3, 1.25, 1.1), (7.1, 1.0, -1.3), 48), ring=66, stars=['compote']),
  # ================= pre-chorus 2: the search (L16-L20) =================
  shot(100, [A('compote', 'happy_walk', 7.9, -2.9, mz=2.2, face='world', yaw=0, speed=1.0, fg=True)],
       "L16 ('feet' 37.21): at the gravel's level, her feet stomp towards the lens, straight for the display",
       view((7.95, 0.12, 1.3), (7.9, 0.16, -2.0), 20, p1=(7.95, 0.12, 1.1)), ring=66),
  shot(108, [saxo(*R_SAXO, sway=14, swayEvery=0.5), sadi(*R_SADI, sway=14, swayEvery=0.5, clip='happy_idle', holdL='goldfish')],
       "L17 ('wiggle' 39.29, 'hips' 39.99): the pair wiggle their hips, twice as fast",
       low((0.0, 0.4, 4.7), (0.0, 0.95, 1.3), (0.0, 0.38, 4.3), fov=62, roll=(10, 6)), ring=66),
  shot(116, [A('compote', 'happy_walk', 7.65, -6.62, mx=1.05, face='world', yaw=90, speed=0.75), kob()],
       "L18 ('do as we do' 42.05): Compote walks along the display, eyeing every lucky cat; Kob beckons exactly as they do",
       view((8.6, 1.3, -3.3), (8.4, 1.1, -7.3), 50, p1=(8.75, 1.3, -3.5)), crowd=statues(), stars=['compote', 'kob']),
  shot(124, [A('compote', 'angry_forward_gesture', 9.0, -6.85, face='world', yaw=180, at=0.3, fg=True), kob()],
       "L19 (44.15-46.51): nose to nose: over Compote's ears, up at Kob; she beckons in perfect sync, deadpan",
       view((9.9, 1.3, -5.7), (9.0, KOB_FACE, -7.5), 42), crowd=statues(), stars=['kob']),
  shot(128, [kob(flapEvery=1)],
       "L20 ('come' 47.27): Kob, close: 'come', in sync... and Compote walks off",
       view((9.0, 1.25, -5.75), (9.0, KOB_FACE, -7.5), 40), crowd=statues(flapEvery=1), petals=0, stars=['kob']),
  # ================= chorus 2: the whole festival (L21-L28) =================
  shot(132, [saxo(*T_SAXO, lift=PLAT), sadi(*T_SADI, lift=PLAT, holdL='goldfish'), compote_drum()],
       "L21 ('dance with us' 48.17): the tower: Saxo and Sadi up on the platform either side of Compote's drum, the whole ring dancing below",
       view((0.35, 2.05, 5.9), (0.0, 1.92, -1.8), 44, p1=(0.3, 2.03, 5.5)), ring=66),
  shot(136, [saxo(*T_SAXO, lift=PLAT, aim='clap', sway=0), sadi(*T_SADI, lift=PLAT, aim='clap', holdL=None), compote_drum()],
       "L22 ('clap' 49.53, 'hands' 50.21): everyone claps: the ring, and the pair on the tower",
       view((1.2, 2.4, 4.6), (0.2, 1.3, -0.8), 58, p1=(1.1, 2.35, 4.3)), ring=66, ringFace='out', clap=[T(136), T(140)]),   # clear of the stalls' awnings (z > 5)
  shot(140, [saxo(*T_SAXO, lift=PLAT, fg=True, face='world', yaw=0), sadi(*T_SADI, lift=PLAT, holdL='goldfish', fg=True, face='world', yaw=0), compote_drum(fg=True)],
       "L23 ('do as we do' 50.93): from behind the three up on the tower: the ring below copies them",
       view((0.4, 2.65, -3.1), (0.0, 0.4, 3.2), 56, p1=(0.35, 2.7, -2.95)), ring=66),
  shot(144, [saxo(*T_SAXO, lift=PLAT), sadi(*T_SADI, lift=PLAT, holdL='goldfish'), compote_drum()],
       "L24 ('steps' 52.67, 'left' 53.27): high over the plaza: the whole Bon Odori ring walks round to the left",
       view((0.2, 7.4, 8.8), (0.0, 0.0, -2.0), 56, p1=(0.5, 7.2, 8.5)), ring=66, walk=[T(144), -30]),
  shot(148, [kob(flap=0)],
       "L25 ('listen' 53.81, 'learn' 54.71): the display: the porcelain cats turn round towards the music... Kob alone stays facing front",
       view((9.0, 1.45, -3.9), (9.0, 1.2, -7.6), 46), crowd=statues(flap=0, lookAt=[YAG[0], YAG[1]]), stars=['kob']),
  shot(152, [saxo(*T_SAXO, lift=PLAT), sadi(*T_SADI, lift=PLAT, holdL='goldfish'), compote_drum()],
       "L26 ('miss' 55.41): from the plaza's edge, low: the ring, the tower and a big firework",
       view((-4.6, 0.42, 5.6), (-0.3, 2.3, -4.0), 60, p1=(-4.3, 0.42, 5.2)), ring=66, fw=True),
  shot(156, [saxo(*T_SAXO, lift=PLAT), sadi(*T_SADI, lift=PLAT, holdL='goldfish'), A('compote', 'happy_idle', *DRUMMER, lift=PLAT, **CARA)],
       "L27 ('now we're here' 56.73): the clip's three girls: Saxo, Sadi and Compote (angry face and all) in a row on the tower, all doing it",
       view((0.0, 2.0, 3.7), (0.0, 1.98, -1.9), 40), ring=66),
  shot(160, [saxo(*T_SAXO, lift=PLAT), sadi(*T_SADI, lift=PLAT, holdL='goldfish'), A('compote', 'happy_idle', *DRUMMER, lift=PLAT, **CARA)],
       "L28 (the title 58.15): the whole festival from above the lane: the lanterns, the ring, the tower, the fireworks",
       view((0.5, 5.6, 11.2), (0.0, 1.4, -5.5), 58, p1=(0.4, 5.9, 11.6)), ring=66, lane=14, fw=True),
  # ================= the instrumental: even the statues (b164-b195.45) =================
  shot(164, [kob()],
       "(59.75, the instrumental) the display, quiet: the lucky cats beckoning...",
       view((9.0, 1.4, -3.6), (9.0, 1.2, -7.6), 44), crowd=statues(), stars=['kob']),
  shot(166, [kob(flap=0)],
       "(60.48) ...and on the beat every porcelain cat bursts into the Caramelldansen, both paws up, swaying; all but one, frozen with her paw up",
       view((9.0, 1.4, -3.9), (9.0, 1.2, -7.6), 44, p1=(9.0, 1.38, -4.4)), crowd=statues(arm='both', sway=6, flapEvery=1), stars=['kob']),
  shot(172, [kob(flap=0)],
       "(62.67) Kob, close: the only still thing at the festival, dancing paws flapping all round her deadpan face",
       view((9.0, 1.25, -5.75), (9.0, KOB_FACE, -7.5), 38), crowd=statues(arm='both', sway=6, flapEvery=1), petals=0, stars=['kob']),
  shot(176, [A('compote', 'being_surprised_and_looking_right', 7.3, -5.4, face='world', yaw=-90, at=0.1)],
       "(64.12) Compote, passing by, stops dead: her head turns to the display",
       view((5.4, 1.15, -5.0), (7.3, 1.0, -5.4), 46), crowd=statues(arm='both', sway=6, flapEvery=1), stars=['compote']),
  shot(180, [A('compote', 'bored_idle', 8.55, -6.1, face='world', yaw=yaw_to((8.55, -6.1), KOB), arm='R', aim=[0.5, 0.45, 0.74], upAt=0.25, fg=True), kob(flap=0)],
       "(65.58) over her shoulder: her paw points straight up at the one lucky cat that isn't dancing",
       view((8.1, 1.3, -4.85), (9.0, 1.15, -7.5), 44), crowd=statues(arm='both', sway=6, flapEvery=1), stars=['kob']),
  shot(184, [kob(arm='both', sway=9, flapEvery=1, flapPh=0)],
       "(67.04) Kob gives in: the second paw goes up and she does the Caramelldansen better than every statue round her, still deadpan",
       view((9.0, 1.3, -4.4), (9.0, 1.2, -7.5), 42, p1=(9.0, 1.25, -5.4)), crowd=statues(arm='both', sway=6, flapEvery=1), stars=['kob']),
  shot(192, [kob(arm='both', sway=9, flapEvery=1)],
       "(69.95) pulling back from her to the whole wall of lucky cats, every one of them dancing",
       view((9.0, 1.3, -5.3), (9.0, 1.35, -8.0), 50, p1=(9.0, 2.1, -1.6), ly1=1.55, ease='out'), crowd=statues(arm='both', sway=6, flapEvery=1)),
  shot(STOP_B, [kob(flap=0)],
       "(71.21, silence) the music stops dead and every lucky cat freezes back into a statue, paw up, Kob too, as if nothing happened",
       view((9.0, 1.4, -3.9), (9.0, 1.2, -7.6), 44), crowd=statues(flap=0), still=True, freeze=STOP, stars=['kob']),
]
for sh in shots:                                   # drop empty paw slots (hold=None clears the default stick)
    for a in sh['actors']:
        for k in ('hold', 'holdL'):
            if k in a and a[k] is None: a.pop(k)

BASE = {'tpose', 'gangnam', 'twist', 'macarena', 'silly_twist', 'chicken', 'twerk', 'ymca', 'robot', 'shopping_cart', 'running_man', 'moonwalk', 'shuffle', 'tut', 'booty_step', 'arm_wave', 'snake', 'shimmy', 'charleston', 'samba', 'belly', 'northern_soul_spin',
        'skate_push', 'skate_idle', 'uppercut_atk', 'uppercut_vic', 'slam_atk', 'slam_vic'}
clips = {a['clip'] for s in shots for a in s['actors']} | {s['crowd']['clip'] for s in shots if s.get('crowd')}
ep = {
  'date': '2026-09-27', 'n': 1,
  'song': {'title': 'Caramelldansen', 'artist': 'Caramella Girls', 'window': [49.873, 121.08], 'bpm': 164.732, 'tail': 0.593},
  'logline': "Saxo starts the Caramelldansen at a Japanese cherry-blossom festival and it spreads one line at a time, with "
             "Compote the taiko drummer pointing at anyone not dancing; Kob hides among the porcelain lucky cats... until "
             "even the statues start dancing and she's the only one left with a paw up.",
  'new': ['matsuri map (a shrine\'s night cherry-blossom festival: a stall lane with kana signs and a goldfish tub, a torii, a '
          'yagura tower with a taiko drum and lantern strings, the shrine hall, a pagoda, glowing cherry trees and falling '
          'petals, fireworks on the bar, a tiered lucky-cat display with red felt steps; kawaii festival pets in yukata that '
          'do the Caramelldansen, clap, and walk the Bon Odori ring; flags lane, ring, ringFace, walk, clap, freeze, fw, clear)',
          'beat-locked arm swings (aim caramell, taiko, clap) and a body sway, for actors and crowds',
          'crowds: several per shot, rings round a point, tiered shelves (y0 + dy per row), a lookAt stare, arm swings, and pale '
          'porcelain copies (pale)',
          'props: taiko sticks (bachi), a goldfish bag, cotton candy',
          'costumes: Saxo sailor (the clip\'s anime sailor uniform), Sadi yukata, Kob maneki (a lucky-cat suit), Compote happi (the festival drummer)'],
  'notes': "The user's queue: start on the hook at 0:49 (the synth hook's downbeat at 49.893 s) and 'a really Japanese, kawaii "
           "clip'. The official clip (a 360p copy, frames every 3 s): three 3D anime girls (a blonde in a sailor school "
           "uniform, a brunette in a red top, a purple-haired girl in a pink hoodie) doing the dance on a disco floor of LED "
           "dots with stars and radial bursts; the dance: both hands up by the head like ears, flapping, hips swaying. "
           "The song (Swedish): an invitation to join a new dance, the chorus a list of instructions (dance with us, clap, do "
           "as we do, steps to the left, listen and learn, don't miss the chance). Our world: a night cherry-blossom festival "
           "at a shrine (lanterns, stalls, a yagura with a taiko, the Bon Odori ring, maneki-neko), kawaii pets in yukata. "
           "Structure: escalation (never used): 1 dancer, 2, 4, 8, the lane, the ring, 66, then the statues. Whole cast: "
           "Saxo (the lead who starts it, in the clip's sailor uniform), Sadi (the first to join, the romance), Compote "
           "(always angry: the drummer who points at anyone not dancing, then hunts the one who isn't), Kob (never goes out, "
           "never dances: hides among the lucky cats; secretly the best dancer).",
  'with': ['sadi', 'kob', 'compote'],
  'clips': sorted(clips - BASE),
  'shots': shots,
  'tags': {'structure': 'escalation', 'scenes': ['crowd'], 'cast': ['saxo', 'sadi', 'kob', 'compote'], 'hook': 'dance',
           'maps': ['matsuri'], 'ref': 'none',
           'lyric_literal': "L00 dance with us (he starts it alone), L01 clap (she claps), L02 do as we do (she copies him), L03 steps to the left, L04 listen / learn (Compote hears it, points), L13 everyone (the ring), L14 + L20 come (the lucky cats' beckon), L16 feet, L17 wiggle the hips, L18 do as we do (Kob beckons exactly as the statues do), L22 clap (the whole ring), L24 steps to the left (the ring walks round), L25 listen (the statues turn to the music)",
           'experiment': "Does a nostalgic meme dance done as pure escalation (the whole cast dancing in kawaii looks, no fight) with a sight-gag payoff (the statues dance, the hider doesn't) hold viewers and shares better than our action-plot episodes?"},
}
out = os.path.join(os.path.dirname(__file__), '2026-09-27.json')
json.dump(ep, open(out, 'w'), ensure_ascii=False, indent=1)
print(out, len(shots), 'shots', len(ep['clips']), 'clips', 'end', END)
print('sheet times:', ','.join(str(round((T(s['beat']) + (T(shots[i + 1]['beat']) if i + 1 < len(shots) else END)) / 2, 2)) for i, s in enumerate(shots)))
