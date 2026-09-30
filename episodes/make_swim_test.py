# make_swim_test.py: writes episodes/_swim_test.json, the "SWIM" map and looks test (2026-10-01): each new look beside its
# base look (a crowd of one), the dry deck with the iceberg grinding past, the deck awash, the band waist and neck deep,
# the lens under the sea, Kob's door afloat. Stills only: node render.mjs --stills=... --query="episode=_swim_test&kit=2026-10-01"
import json, math, os, sys
sys.path.insert(0, os.path.dirname(__file__))
from cam import view
P = 60 / 93.99
def A(who, look, clip, x, z, **o): return {'who': who, 'look': look, 'clip': clip, 'x': x, 'z': z, 'face': o.pop('face', 'camera'), 'at': o.pop('at', 'auto'), **o}
def one(who, look, x, z, clip='happy_idle', at=0.5): return {'who': who, 'look': look, 'clip': clip, 'at': at, 'n': 1, 'cols': 1, 'x0': x, 'z0': z, 'dx': 0, 'dz': 0, 'jitter': 0, 'face': 'camera'}
shots = []
def add(b, actors, v, **o):
    c, f = v; shots.append({'beat': b, 'kind': 'dance', 'map': 'ship', 'actors': actors, 'cam': c, 'focus': f, **o})
ST = (0, -3.4)
# 0-3: each look (left) beside its base look (right, a crowd of one), close
for i, (who, look) in enumerate([('saxo', 'captain'), ('sadi', 'coat'), ('kob', 'lifevest'), ('compote', 'sailor')]):
    add(i * 4, [A(who, look, 'happy_idle', -0.55, ST[1], at=0.5)], view((0, 1.0, ST[1] + 2.6), (0, 0.8, ST[1]), 46), crowd=one(who, who, 0.55, ST[1]), berg=False)
# 4: the dry deck, the band dancing with the paddle, the crew behind, the iceberg grinding past on the port bow, ice falling
band = [A('saxo', 'captain', 'gangnam', 0, -3.4, at=1.2, arm='both', aim='paddle'), A('sadi', 'coat', 'charleston', -1.4, -4.2, at=0.7), A('compote', 'sailor', 'gangnam', 1.4, -4.2, at=1.3)]
add(16, band, view((-0.4, 1.3, 2.4), (0, 0.9, -4.0), 58), crew='dance', berg=[-9, -8, -9, -2], ice=0.3, spray=[0, -5, 0.8, -1])
# 5: the deck awash to the knees, a wide from the stern
add(20, band, view((0.3, 2.6, 6.0), (0, 0.6, -4.0), 56), crew='dance', water=0.35)
# 6: waist deep, low lens
add(24, band, view((0.2, 1.1, 0.4), (0, 0.8, -3.6), 58), water=0.5, paddle=[[0, -3.4], [-1.4, -4.2], [1.4, -4.2]])
# 7: neck deep, the paddle at the surface
add(28, [A('saxo', 'captain', 'happy_idle', 0, -3.4, at=0.4, arm='both', aim='paddle')], view((0, 1.0, -1.2), (0, 0.85, -3.4), 50), water=0.64, paddle=[[0, -3.4]])
# 8: under the sea: the lens at 0.3 m with the sea at 0.8: legs on the deck, fish, bubbles
add(32, band, view((0.3, 0.35, -0.6), (0, 0.4, -3.8), 64), water=0.95, fish=[0, 0.4, -3, 2.5], bubbles=[[0, -3.4], [-1.4, -4.2], [1.4, -4.2]])
# 9: Kob on her door afloat over the deckhouse, the sea at 1.6
add(36, [A('kob', 'lifevest', 'sitting_talking', 0, 5.9, at=0, speed=0.05, lift=1.6 + 0.07 - 0.1, face='world', yaw=0, hold='milk')], view((0.4, 2.3, 9.0), (0, 1.9, 5.9), 48), water=1.6, door=[0, 5.9, 0])
# 10: the crew hauling the rope, the ship from the side
add(40, [A('compote', 'sailor', 'happy_idle', -1.0, -0.8, at=0.3, hold='bucket', arm='both', aim='bail')], view((3.0, 1.6, 2.5), (-1.5, 0.8, -3.0), 60), crew='pull', water=0.15, bail=[-1.0, 0.7, -0.5, -1, 0.3])
# 11: the whole ship from outside, low in the water
add(44, [], view((26, 5, 14), (0, 3, -2), 50), water=0.4, crew='none')
json.dump({'date': '2026-10-01', 'with': ['sadi', 'kob', 'compote'], 'clips': ['sitting_talking', 'charleston', 'gangnam', 'happy_idle'], 'shots': shots}, open(os.path.join(os.path.dirname(__file__), '_swim_test.json'), 'w'), indent=1)
print(len(shots), 'shots; stills at', ','.join(f'{(0.6683 + (b + 2) * P):.2f}' for b in [0, 4, 8, 12, 16, 20, 24, 28, 32, 36, 40, 44]))
