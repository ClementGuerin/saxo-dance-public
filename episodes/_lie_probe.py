# _lie_probe.py: Sadi lying on the pavement from straight above, five moments of the fall clip and both paws holding the
# bouquet, for "So Easy" S03 (2026-10-08); writes episodes/_lie_probe.json. Not a video.
import json, os, sys
sys.path.insert(0, os.path.dirname(__file__))
from cam import view
X, Z = -5.0, -0.85
shots = []
for k, (at, paw, cp, lp) in enumerate([(3.4, 'holdL', (X, 2.75, Z + 0.75), (X, 0.0, Z - 0.3)), (3.4, 'holdL', (X - 1.35, 2.25, Z + 0.45), (X - 0.1, 0.1, Z - 0.3)),
                                         (2.6, 'holdL', (X - 1.35, 2.25, Z + 0.45), (X - 0.1, 0.1, Z - 0.3)), (3.4, 'holdL', (X - 1.6, 1.7, Z + 0.2), (X - 0.1, 0.15, Z - 0.3)),
                                         (4.2, 'holdL', (X - 1.35, 2.25, Z + 0.45), (X - 0.1, 0.1, Z - 0.3)), (3.4, 'holdL', (X - 0.9, 2.6, Z + 0.9), (X - 0.05, 0.05, Z - 0.3))]):
    a = {'who': 'sadi', 'look': 'florist', 'clip': 'knocked_out_falling_to_back', 'x': X, 'z': Z, 'face': 'world', 'yaw': -53, 'at': at, 'speed': 0.0, 'ground': 'mesh'}
    if paw: a[paw] = 'bouquet'
    c, f = view(cp, lp, 50)
    shots.append({'beat': k * 2, 'kind': 'dance', 'map': 'london', 'actors': [a], 'cam': c, 'focus': f, 'still': True, 'zone': 'day', 'noguests': True, 'cab': False})
shots.append({**shots[-1], 'beat': 12})
ep = {'date': '2026-10-08', 'song': 'probe', 'logline': 'lying probe', 'notes': 'not a video', 'with': ['sadi'],
      'clips': ['knocked_out_falling_to_back'], 'shots': shots}
json.dump(ep, open(os.path.join(os.path.dirname(__file__), '_lie_probe.json'), 'w'), indent=1)
print(len(shots), 'shots')
