# make_caramell_test.py: writes episodes/_caramell_test.json, the engine test for "Caramelldansen" (2026-09-27): the
# beat-locked swings (`aim: "caramell"`, `"taiko"`), the body `sway`, the matsuri map's festival pets (lane, ring,
# clap, walk), the porcelain crowd on the lucky-cat display (tiers, `pale`, crowd arm swings), and the new looks.
# Render sheets with the episode's kit: --query="episode=_caramell_test&kit=2026-09-27&clean" (sheets only: a test must
# not render frames into the episode's own folder).
import json, os, sys
sys.path.insert(0, os.path.dirname(__file__))
from cam import view

P = 60 / 164.732; B0 = 0.02
T = lambda b: round(B0 + b * P, 3)
PLAT = 1.1; LANE = (0.35, 10.0); KOB = (9.0, -8.12); KOB_Y = 0.72; DISP = (9.0, -7.5)

def A(who, look, clip, x, z, **o):
    return {'who': who, 'look': look, 'clip': clip, 'x': x, 'z': z, **o}
def shot(beat, actors, v, **o):
    c, focus = v
    return {'beat': beat, 'kind': 'dance', 'map': 'matsuri', 'actors': actors, 'cam': c, 'focus': focus, **o}
CARA = {'arm': 'both', 'aim': 'caramell', 'sway': 7}
statues = {'who': 'kob', 'look': 'maneki', 'clip': 'bored_idle', 'at': 1.0, 'speed': 0, 'n': 52, 'cols': 13, 'x0': DISP[0], 'z0': DISP[1], 'dx': 0.72, 'dz': 0.62,
           'y0': 0.3, 'dy': 0.42, 'jitter': 0.02, 'face': 'world', 'yaw': 0, 'pale': 0.85, 'skip': [[KOB[0], KOB[1], 0.3]]}
shots = [
  shot(0, [A('saxo', 'sailor', 'happy_idle', *LANE, **CARA)], view((0.35, 0.55, 12.7), (0.35, 0.85, 10.0), 55), lane=10),
  shot(8, [A('saxo', 'sailor', 'happy_idle', *LANE, **CARA), A('sadi', 'yukata', 'hip_hop_dancing_side_to_side', -0.6, 10.25, arm='both', aim='caramell', hold='goldfish')],
       view((-1.2, 0.7, 12.6), (-0.1, 0.85, 10.1), 55), lane=14),
  shot(16, [A('compote', 'happi', 'bored_idle', 0, -2.25, lift=PLAT, face='world', yaw=0, arm='both', aim='taiko', hold='bachi', holdL='bachi')],
       view((0.3, 1.7, 3.9), (0, 1.75, -2.1), 52), ring=66),
  shot(24, [A('kob', 'maneki', 'bored_idle', *KOB, at=1.0, speed=0, lift=KOB_Y, face='world', yaw=0, arm='R', aim='caramell', flapEvery=2, flapPh=0.35)],
       view((9.0, 1.45, -4.2), (9.0, 1.35, -8.1), 48), crowd={**statues, 'arm': 'R', 'aim': 'caramell', 'flapEvery': 2}),
  shot(32, [A('kob', 'maneki', 'bored_idle', *KOB, at=1.0, speed=0, lift=KOB_Y, face='world', yaw=0, arm='R', aim='caramell', flap=0)],
       view((9.0, 1.5, -5.0), (9.0, 1.45, -8.1), 50), crowd={**statues, 'arm': 'both', 'aim': 'caramell', 'sway': 6}),
  shot(40, [A('saxo', 'sailor', 'happy_idle', 0, 1.6, **CARA)], view((0, 7.5, 13.0), (0, 0.6, -2.0), 55), ring=66, lane=14, fw=True, walk=[T(40), -18]),
]
ep = {'date': '2026-09-27', 'n': 0, 'with': ['sadi', 'kob', 'compote'], 'clips': ['bored_idle', 'happy_idle', 'hip_hop_dancing_side_to_side'], 'shots': shots}
out = os.path.join(os.path.dirname(__file__), '_caramell_test.json')
json.dump(ep, open(out, 'w'), ensure_ascii=False, indent=1)
print(out, len(shots), 'shots; sheet times', ' '.join(str(T(s['beat'] + 4)) for s in shots))
