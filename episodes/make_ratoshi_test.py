# make_ratoshi_test.py: writes episodes/_ratoshi.json, a test: the TikTok cut of "Dans le club" (kit 2026-09-25-2-tt,
# 32.35 s, 115 BPM) re-directed with the camera grammar of @ratoshidance (research/RATOSHI_ANALYSIS.md), for an A/B
# against the published cut (episodes/2026-09-25-2-tt.json). Same song window, story, cast, looks and maps; what
# changes is the camera: a swoop from over the DJ booth down to deck level for the hook, lenses a few cm off the deck
# (wide, the floor filling the bottom third), dutch angles and rolls, handheld sways on the solo dancer, bodies across
# the lens in the foreground, deadpan static inserts of Kob (the watcher), a pull-back reveal, no beat bounce.
# Render with bounce=0: node render.mjs --qa --gl=metal --query="episode=_ratoshi&kit=_ratoshi&bounce=0"
# Beats: B0 = -0.742 s (song beat 228, a downbeat), 115 BPM: cut time = -0.742 + b * 0.5217.
import json, math, os

YACHT = {'ROPE': [2.6, 5.7], 'TABLE': [2.55, -1.2, 0.3], 'KOB': [-0.2, -1.4]}
KX, KZ = YACHT['KOB']
ME, SA, KO, CO = 'michou', 'disco', 'pyjama', 'bouncer'
T = lambda b: round(-0.742 + b * 60 / 115, 3)
def A(who, clip, x=0, z=0, **o):
    look = {'saxo': ME, 'sadi': SA, 'kob': KO, 'compote': CO}[who]
    return {'who': who, 'look': o.pop('look', look), 'clip': clip, 'x': x, 'z': z, **o}
import sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from cam import view, vpath, swoop, low, deadpan, backs, reveal   # the house camera (episodes/cam.py)
def shot(beat, map_, actors, lyric, v, **o):
    c, focus = v
    return {'beat': beat, 'kind': 'dance', 'map': map_, 'actors': actors, 'lyric': lyric, 'cam': c, 'focus': focus, **o}
SEATED = dict(face='world', yaw=0)
# the trio seen from the stern side (cameras at +z, the party behind them) and from the DJ side (cameras at -z, the
# quay behind them): the side dancers stay a step behind Saxo from the camera (level with him they merged into his head)
TRIO = {'saxo': (0, 0.05), 'sadi': (-0.72, -0.25), 'compote': (0.72, -0.25)}
TRIO_R = {'saxo': (0, -0.05), 'sadi': (0.72, 0.25), 'compote': (-0.72, 0.25)}
def line2(form, clips, **o):
    return [A(w, clips[w] if isinstance(clips, dict) else clips, x, z, **o) for w, (x, z) in form.items()]
FALL = {'saxo': ('death_falling_backwards', 1.35), 'sadi': ('knocked_out_falling_to_back', 1.25), 'compote': ('dying_falling_backward', 0.0)}
def dead(form, extra=0.0, speed=1, yaw={'saxo': 20, 'sadi': -25, 'compote': 60}, only=None):
    return [A(w, FALL[w][0], x, z, at=round(FALL[w][1] + extra, 2), once=True, ground='mesh', face='world', yaw=yaw[w], speed=speed)
            for w, (x, z) in form.items() if w in FALL and (only is None or w in only)]
DJ = dict(spot='bow')   # a camera on the DJ side sees faces turned to -z: light them from there (the yacht's `spot` flag)
GONE = T(29) + 0.05     # the guests keel over in two waves from here (the map's guestsDie)
BL, BR, BYAW, BV = backs((0.0, 0.0))   # shot 4: Sadi and Compote across the lens, facing Saxo

shots = [
  # 0 ---- hook: the swoop. From behind the DJ booth (its top and the turntables across the bottom of the frame), Saxo
  # small on the deck with the quay behind; the camera holds, then skims over the decks and dives to 20 cm off the deck,
  # pushing in on him and rolling through the dive. He is alone: the crew comes in on "un bras" (the escalation).
  shot(0, 'yacht', [A('saxo', 'hip_hop_just_listening_dancing_variation', *TRIO_R['saxo'], hold='glass')],
       "J'suis pose dans l'club, normal (b2-5): SWOOP from behind the DJ booth to deck level",
       swoop([(0.3, 1.1, -4.02), (0.3, 1.06, -3.45), (0.28, 0.86, -2.7), (0.25, 0.2, -1.55)], (0.0, 0.78, 0.0)), stars=['saxo'], **DJ),
  # 1 ---- deck level, the glass raised at the lens: dutch, handheld
  shot(6.5, 'yacht', [A('saxo', 'hip_hop_just_listening_dancing_variation', *TRIO_R['saxo'], hold='glass', arm='R', aim='toast', upAt=0.15)],
       "Et j'leve mon verre (b6.6-8): deck level, dutch, handheld",
       view((0.3, 0.14, -1.45), (0.0, 0.84, -0.05), 64, p1=(0.24, 0.15, -1.3), roll=[9, 12], hand=0.9), stars=['saxo'], **DJ),
  # 2 ---- the watcher: Kob at home raises her milk back, dead still (a flat, frontal, locked-off insert: the deadpan)
  shot(8.5, 'kobflat', [A('kob', 'pointing_while_seated', KX, KZ, hold='milk', at=0.3, arm='R', aim='toast', upAt=0.25, **SEATED)],
       "a tous ceux qui sortent pas (b8.5-10): Kob deadpan, static",
       deadpan((KX, KZ), 0.74, 2.3, cam_y=0.8), stars=['kob']),
  # 3 ---- the crew line, from the party side: lens 20 cm off the deck, a dolly in along the line, dutch
  shot(10, 'yacht', line2(TRIO, 'hip_hop_dancing_side_to_side', arm='R', upAt=0.45),
       "Et tu leves un bras (b10.2-14): deck-level dolly-in on the line",
       low((-1.15, 0.2, 3.45), (0.0, 0.72, 0.0), (-0.8, 0.22, 2.45)), stars=['saxo']),
  # 4 ---- between the backs: Sadi and Compote face Saxo across the lens (foreground bodies), he raises the roof beyond
  shot(14, 'yacht', [A('saxo', 'female_hip_hop_raise_the_roof_dancing', 0, 0, arm='both', upAt=0.45),
                     A('sadi', 'female_hip_hop_raise_the_roof_dancing', *BL, face='world', yaw=BYAW, fg=True, arm='both', upAt=0.45),
                     A('compote', 'female_hip_hop_raise_the_roof_dancing', *BR, face='world', yaw=BYAW, fg=True, arm='both', upAt=0.45)],
       "deux bras (b15-18): between Sadi's and Compote's backs (low, so their heads stay above his face), a slow push",
       BV, stars=['saxo']),
  # 5 ---- the solo dancer, handheld: a low orbit round Saxo going down
  shot(18, 'yacht', [A('saxo', 'air_squat_workout', 0, 0, at=1.63)],
       "en bas (b19-22): handheld low orbit",
       view((0.95, 0.3, 1.7), (0.0, 0.7, 0.0), 62, p1=(-0.85, 0.3, 1.85), ly1=0.67, roll=[5, -5], hand=1.2, ease='lin'), stars=['saxo']),
  # 6 ---- the drop, from the front at deck level: they keel over away from the lens, then the camera cranes up over them
  shot(22, 'yacht', dead(TRIO),
       "j'dead ca (b23-25.4): deck level, then a crane up",
       view((0.2, 0.22, 2.9), (0.0, 0.6, 0.0), 60, p1=(0.2, 1.75, 2.9), ly1=0.12, roll=[-8, -3], hand=0.15), stars=['saxo']),
  # 7 ---- the watcher again, gaming, unimpressed
  shot(26, 'kobflat', [A('kob', 'gaming', KX, KZ, hold='pad', at=1.0, **SEATED)],
       "(b26-28): Kob deadpan, gaming",
       deadpan((KX, KZ), 0.72, 2.3, cam_y=0.8, fov=44), stars=['kob']),
  # 8 ---- the reveal: from right over Saxo's face, pull back and up over the wreck while the guests go down in waves
  shot(28, 'yacht', [dict(a, reveal=1.6) if a['who'] != 'saxo' else a for a in dead(TRIO, extra=3.13, speed=0.3)],
       "J'dead ca, j'dead ca (b29, b31): from his face to a wide pull-back reveal",
       reveal((0.2, 1.0, 0.2), (0.0, 0.3, -0.6), (0.9, 3.4, 5.4)), guestsDie=GONE, stars=['saxo']),
  # 9 ---- the wreck from straight above, turning
  shot(36, 'yacht', dead(TRIO, extra=7.3, speed=0.2),
       "J'dead ca, j'dead ca (b37, b39): top-down, spinning",
       view((-0.3, 5.1, -0.25), (-0.32, 0.0, -0.5), 56, p1=(-0.18, 4.2, -0.3), ease='lin', roll=[0, 12]), guestsDie=GONE, stars=['saxo']),
  # 10 --- the watcher, closer, still nothing
  shot(40, 'kobflat', [A('kob', 'gaming', KX, KZ, hold='pad', at=2.2, **SEATED)],
       "eh, eh (b41-42): Kob close, deadpan",
       deadpan((KX, KZ), 0.8, 1.9, cam_y=0.84, push=0.15, fov=40), stars=['kob']),
  # 11 --- Saxo flat on the deck, from above, drifting across him: dutch, handheld (a lying body from the side is a lump)
  shot(44, 'yacht', [A('saxo', 'laying_idle', 0, 0.25, ground='mesh', face='world', yaw=0)],
       "On a bien danse la gros (b44-46): from above, drifting across him, dutch, handheld",
       view((0.35, 3.1, 0.45), (0.0, 0.25, -0.2), 50, p1=(-0.15, 3.05, 0.42), roll=[10, 6], hand=0.5), guestsDie=GONE, calm=True, stars=['saxo']),
  # 12 --- a low lateral truck along Sadi and Compote, wrecked
  shot(48, 'yacht', [A('sadi', 'laying_idle', -0.42, 0.25, ground='mesh', face='world', yaw=-8, at=4), A('compote', 'laying_idle', 0.45, 0.2, ground='mesh', face='world', yaw=10, at=8)],
       "wouah, j'suis fatigue (b49-50.5): low truck along the bodies",
       view((-1.3, 1.05, 1.3), (-0.05, 0.12, -0.22), 58, p1=(0.95, 1.05, 1.35), ease='lin', roll=[-4, 4], hand=0.3), guestsDie=GONE, calm=True, stars=['sadi', 'compote']),
  # 13 --- Saxo from above looks up at you: handheld, the phone over his face
  shot(52, 'yacht', [A('saxo', 'laying_idle', 0, 0.3, ground='mesh', face='world', yaw=0, at=3)],
       "J'suis en sueur, j'sais pas toi mais la (b52.8-56): handheld from above",
       view((0.04, 2.3, 0.35), (0.0, 0.1, -0.3), 52, p1=(0.03, 2.1, 0.3), roll=[-6, 3], hand=1.0), guestsDie=GONE, calm=True, stars=['saxo']),
  # 14 --- Kob, who stayed in, goes to bed: a slow push in, still
  shot(56, 'kobflat', [A('kob', 'laying_idle', KX + 0.1, KZ - 0.1, lift=0.1, ground='mesh', face='world', yaw=90)],
       "j'ai trop danse, frere (b56-end): Kob asleep, slow push-in",
       view((0.9, 1.55, 1.3), (-0.25, 0.3, -1.45), 50, p1=(0.72, 1.4, 0.95), ease='lin', roll=[0, 3]), stars=['kob']),
]
BASE = {'tpose', 'gangnam', 'twist', 'macarena', 'silly_twist', 'chicken', 'twerk', 'ymca', 'robot', 'shopping_cart', 'running_man', 'moonwalk', 'shuffle', 'tut', 'booty_step', 'arm_wave', 'snake', 'shimmy', 'charleston', 'samba', 'belly', 'northern_soul_spin'}
ep = {
  'date': '2026-09-26', 'n': 'ratoshi-test', 'test': True,
  'song': {'title': 'Dans le club', 'artist': 'Michou', 'window': [120.0, 152.37], 'bpm': 115.0},
  'logline': "A/B test: the 'Dans le club' TikTok cut re-directed in the camera grammar of @ratoshidance.",
  'with': ['sadi', 'kob', 'compote'],
  'clips': sorted({a['clip'] for s in shots for a in s['actors']} - BASE),
  'shots': shots,
}
out = os.path.join(os.path.dirname(__file__), '_ratoshi.json')
json.dump(ep, open(out, 'w'), ensure_ascii=False, indent=1)
print(out, len(shots), 'shots')
