# make_pz_test.py: a look at the "Patient Zero" maps (src/maps12.js) and props before the episode: the sick bed with
# the tiny devil, the rainy street, the party, the ward. Renders on the episode's kit (?kit=2026-09-27-3).
import json, os, sys
sys.path.insert(0, os.path.dirname(__file__))
from cam import view

def A(who, look, clip, x, z, **o): return {'who': who, 'look': look, 'clip': clip, 'x': x, 'z': z, **o}
def shot(beat, mp, actors, v, **o):
    c, focus = v
    return {'beat': beat, 'kind': 'dance', 'map': mp, 'actors': actors, 'cam': c, 'focus': focus, 'still': True, **o}
SIT = (-1.3, -1.5); MAT = 0.5; WSIT = -2.55; WMAT = 0.62
sick = dict(nose=True, therm=True, hat='icepack', hatY=0.7)
devil = {'who': 'saxo', 'look': 'devil', 'clip': 'laughing_standing', 'n': 1, 'x0': SIT[0] + 0.58, 'z0': SIT[1] + 0.05, 'y0': 0.9, 'scale': 0.28, 'noShadow': True, 'cols': 1, 'jitter': 0}
shots = [
  shot(0, 'block', [A('saxo', 'pyjama', 'sitting_talking', *SIT, lift=MAT - 0.08, face='world', yaw=0, at=0, speed=0.05, **sick)],
       view((-0.6, 1.25, 1.2), (-1.2, 1.0, -1.5), 50), zone='room', crowd=devil),
  shot(4, 'block', [A('saxo', 'pyjama', 'sitting_talking', *SIT, lift=MAT - 0.08, face='world', yaw=0, at=0, speed=0.05, **sick)],
       view((0.9, 1.2, 1.6), (-0.6, 1.2, -1.9), 58), zone='room'),
  shot(8, 'block', [A('saxo', 'pyjama', 'happy_walk', 0.6, -8.5, face='world', yaw=180, nose=True)],
       view((2.6, 1.0, -4.6), (0.8, 0.9, -10.5), 58), zone='street', rain=True),
  shot(12, 'block', [A('saxo', 'pyjama', 'shuffle', 1.0, -17.2, nose=True), A('kob', 'kob', 'sitting_talking', 4.4, -21.12, face='world', yaw=0, at=0, speed=0.05, mask=True)],
       view((0.6, 1.3, -14.6), (1.8, 0.9, -18.6), 62), zone='party'),
  shot(16, 'ward', [A('compote', 'compote', 'sitting_talking', -2.3, WSIT, lift=WMAT - 0.08, face='world', yaw=0, at=0, speed=0.05, hat='partyhat', hatY=0.86, nose=True, therm=True),
                    A('sadi', 'disco', 'sitting_talking', 0.0, WSIT, lift=WMAT - 0.08, face='world', yaw=0, at=0, speed=0.05, hat='partyhat', hatY=0.86, nose=True),
                    A('kob', 'kob', 'sitting_talking', 2.3, WSIT, lift=WMAT - 0.08, face='world', yaw=0, at=0, speed=0.05, hat='partyhat', hatY=0.86, mask=True)],
       view((0.3, 1.8, 3.6), (0.0, 1.0, -2.3), 66), flat=[3, 1.0]),
  shot(20, 'ward', [A('saxo', 'saxo', 'happy_walk', 3.6, 0.8, face='world', yaw=-90, hold='balloon')],
       view((0.2, 1.2, 3.2), (3.4, 0.9, 0.6), 54)),
]
clips = {a['clip'] for s in shots for a in s['actors']} | {s['crowd']['clip'] for s in shots if s.get('crowd')}
BASE = {'tpose', 'gangnam', 'twist', 'macarena', 'silly_twist', 'chicken', 'twerk', 'ymca', 'robot', 'shopping_cart', 'running_man', 'moonwalk', 'shuffle', 'tut', 'booty_step', 'arm_wave', 'snake', 'shimmy', 'charleston', 'samba', 'belly', 'northern_soul_spin'}
ep = {'date': '2026-09-27', 'n': 0, 'with': ['sadi', 'kob', 'compote'], 'clips': sorted(clips - BASE), 'shots': shots}
out = os.path.join(os.path.dirname(__file__), '_pz_test.json'); json.dump(ep, open(out, 'w'), indent=1)
P, B0 = 60 / 92, 0.652
print(out, len(shots), 'shots; sheet times:', ','.join(str(round(B0 + (s['beat'] + 2) * P, 2)) for s in shots))
