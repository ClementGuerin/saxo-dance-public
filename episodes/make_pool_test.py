# make_pool_test.py: a look at the "Beauty And A Beat" water park (src/maps13.js) before the episode: the wide, the
# selfie from the tower, the pool at water level, Kob's lounger in the foam, the far side, the phones. Renders on the
# episode's kit (?kit=2026-09-27-4&clean).
import json, os, sys
sys.path.insert(0, os.path.dirname(__file__))
from cam import view

def A(who, look, clip, x, z, **o): return {'who': who, 'look': look, 'clip': clip, 'x': x, 'z': z, **o}
def shot(beat, mp, actors, v, **o):
    c, focus = v
    return {'beat': beat, 'kind': 'dance', 'map': mp, 'actors': actors, 'cam': c, 'focus': focus, 'still': True, **o}
TOWER = (2.4, -1.0); PLAT = 1.5; WATER = -0.28; FLOOR = -0.8; LOUNGER = (5.6, 1.7); LOUNGE_Y = 0.3
shots = [
  shot(0, 'pool', [A('saxo', 'saxo', 'shuffle', *TOWER, lift=PLAT, face='world', yaw=0)],
       view((3.4, 3.6, 8.5), (1.0, 0.6, -7.0), 62), riders=True),
  shot(4, 'pool', [A('saxo', 'saxo', 'happy_idle', *TOWER, lift=PLAT, face='world', yaw=0, at=0.5)],
       view((2.4, 3.05, 1.2), (2.4, 2.25, -1.0), 76), waves=0.15, riders=True),
  shot(8, 'pool', [A('sadi', 'beach', 'waving', 3.9, -4.6, lift=FLOOR, face='world', yaw=-20, at='auto'),
                   A('compote', 'beach', 'bored_idle', 0.9, -6.2, ride='duck', rideY=WATER, lift=WATER + 0.1, face='world', yaw=10, at=0.5, speed=0.3)],
       view((2.6, 0.2, -1.6), (2.2, 0.2, -6.0), 60), waves=0.08),
  shot(12, 'pool', [A('kob', 'kob', 'sitting_talking', *LOUNGER, lift=LOUNGE_Y - 0.08, face='world', yaw=180, at=0, speed=0.05)],
       view((5.6, 0.95, -0.6), (5.6, 0.8, 1.7), 44), foam=0.3),
  shot(16, 'pool', [], view((0.5, 1.9, -5.5), (-2.0, 1.6, -19.0), 58), riders=True),
  shot(20, 'pool', [A('sadi', 'beach', 'bored_idle', 4.2, -4.2, lift=FLOOR, face='world', yaw=160, at=0.5, hold='phone', arm='R', aim='phone', upAt=0.0)],
       view((2.4, -0.05, -3.4), (3.0, 0.6, 2.0), 62), phones=True, stare=[2.4, -3.4]),
]
clips = {a['clip'] for s in shots for a in s['actors']}
BASE = {'tpose', 'gangnam', 'twist', 'macarena', 'silly_twist', 'chicken', 'twerk', 'ymca', 'robot', 'shopping_cart', 'running_man', 'moonwalk', 'shuffle', 'tut', 'booty_step', 'arm_wave', 'snake', 'shimmy', 'charleston', 'samba', 'belly', 'northern_soul_spin'}
ep = {'date': '2026-09-27', 'n': 0, 'with': ['sadi', 'kob', 'compote'], 'clips': sorted(clips - BASE), 'shots': shots}
out = os.path.join(os.path.dirname(__file__), '_pool_test.json'); json.dump(ep, open(out, 'w'), indent=1)
P, B0 = 60 / 128, 0.039
print(out, len(shots), 'shots; sheet times:', ','.join(str(round(B0 + (s['beat'] + 2) * P, 2)) for s in shots))
