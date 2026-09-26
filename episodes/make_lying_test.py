# make_lying_test.py: writes episodes/_lying.json, a regression test for lying bodies (2026-09-26): every lying and
# falling clip the episodes use, on each character, seen side-on from floor level (where a gap under a body shows) and
# from a high three-quarter (how the episodes shoot them). The chibi head is bigger than the torso is thick, so a body
# lying flat rests on the back of its head with the torso and legs in the air unless the engine settles it (the
# `settle` pass in placeActors). Uses the ratoshi kit for its beat grid (115 BPM, 2.09 s a shot).
#   python3 episodes/make_lying_test.py
#   node render.mjs --sheet=0.301,2.388,4.475,6.562,8.649,10.736,12.823,14.91,16.997,19.084,21.171,23.258 --cols=6 --w=360 \
#     --gl=metal --query="episode=_lying&kit=_ratoshi&clean" --out=out/check/lying.jpg   (the middle of each shot)
#   node render.mjs --gl=metal --query="episode=_lying&kit=_ratoshi" --eval="LIE_PROBE([0.301, 2.388])"   (part heights)
# Each body must lie on the floor: torso at about -1.5 cm, legs down, the head may go through the floor.
import json, os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from cam import view

LOOK = {'saxo': 'michou', 'sadi': 'disco', 'kob': 'pyjama', 'compote': 'bouncer'}
CASES = [   # (who, clip, at: a second of the clip where the body is down, speed)
  ('saxo', 'death_falling_backwards', 4.2, 0.2), ('sadi', 'knocked_out_falling_to_back', 4.0, 0.2),
  ('compote', 'dying_falling_backward', 3.2, 0.2), ('saxo', 'laying_idle', 0.0, 1), ('kob', 'laying_idle', 4.0, 1),
  ('compote', 'laying_idle', 8.0, 1),
]
shots, b = [], 0
for who, clip, at, speed in CASES:
    a = {'who': who, 'look': LOOK[who], 'clip': clip, 'x': 0, 'z': 0, 'at': at, 'speed': speed, 'once': True, 'ground': 'mesh', 'face': 'world', 'yaw': 0}
    for c in (view((3.0, 0.1, -0.3), (0.0, 0.2, -0.3), 58), view((1.3, 2.0, 1.6), (0.0, 0.15, -0.3), 50)):
        shots.append({'beat': b, 'kind': 'dance', 'map': 'yacht', 'actors': [a], 'lyric': f'{who} {clip}', 'cam': c[0], 'focus': c[1], 'still': True, 'noguests': True})
        b += 4
ep = {'date': '2026-09-26', 'n': 'lying-test', 'test': True, 'with': ['sadi', 'kob', 'compote'],
      'clips': sorted({c for _, c, _, _ in CASES}), 'shots': shots}
out = os.path.join(os.path.dirname(os.path.abspath(__file__)), '_lying.json')
json.dump(ep, open(out, 'w'), ensure_ascii=False, indent=1)
print(out, len(shots), 'shots')
