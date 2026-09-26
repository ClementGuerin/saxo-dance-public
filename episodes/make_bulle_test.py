# make_bulle_test.py: writes episodes/_bulle_test.json, the regression sheet for the "Dans ma bulle" pieces (2026-09-27):
# the shore and bus maps (src/maps11.js), the Paris boutique flag, and the new actor fields: bubble gum that grows and
# pops (gum), the splat it leaves (splat), earbuds (buds), the giant dream bubble a body floats in (bubble), a moth out
# of an open wallet (moth), and a skimmed stone's splash (toss.splash). One shot per piece, 4 beats each, on the
# 2026-09-27-2 kit's grid: node render.mjs --sheet=<times printed below> --gl=metal --query="episode=_bulle_test&kit=2026-09-27-2"
import json, os, sys
sys.path.insert(0, os.path.dirname(__file__))
from cam import view

P, B0 = 60 / 135, 0.02
T = lambda b: round(B0 + b * P, 3)
DECK, SEAT = 2.6, 0.3
LOOK = {'saxo': 'trench', 'sadi': 'paris', 'kob': 'driver', 'compote': 'compote'}
def A(who, clip, x, z, **o): return {'who': who, 'look': o.pop('look', LOOK[who]), 'clip': clip, 'x': round(x, 3), 'z': round(z, 3), **o}
def shot(beat, mp, actors, lyric, v, **o):
    c, focus = v
    return {'beat': beat, 'kind': 'dance', 'map': mp, 'actors': actors, 'lyric': lyric, 'cam': c, 'focus': focus, **o}

shots = [
  shot(0, 'shore', [A('saxo', 'bored_idle', 0, -1.3, gum=[0.15, 1.3, 0.3, 1.55], buds=True)],
       "gum: blown from 0.15 s to its full 0.3 m at 1.3 s, popped at 1.55 s; earbuds in",
       view((0.0, 1.0, 0.25), (0.0, 0.95, -1.3), 44)),
  shot(4, 'shore', [A('saxo', 'hip_hop_dancing_really_twirl', 0, -1.3, bubble={'r': 0.95, 'at': 0.0, 'full': 0.5, 'pop': 1.6}, my=1.4, air=True, buds=True)],
       "the dream bubble at night: grows round him, floats him up 1.4 m, bursts at 1.6 s",
       view((0.0, 1.6, 4.2), (0.0, 1.9, -1.3), 52), night=True),
  shot(8, 'bus', [A('saxo', 'celebrating_after_a_win_while_seated', 0.97, 1.03, lift=SEAT, face='world', yaw=180, splat=0.0, buds=True),
                  A('compote', 'bored_idle', 0.02, 0.92, face='world', yaw=90, hold='carrot'),
                  A('kob', 'male_driving_a_car', -0.72, -4.62, lift=SEAT, face='world', yaw=180)],
       "the bus: Saxo in his seat, gum on his face, earbuds; Compote standing; Kob driving; the passengers stare",
       view((0.1, 1.35, -2.4), (0.5, 0.95, 0.95), 56), stare=[0.97, 0.9]),
  shot(12, 'shore', [A('sadi', 'sitting_talking', 12.0, -59.37, lift=DECK + SEAT, face='world', yaw=0),
                     A('kob', 'bored_idle', 16.4, -56.75, lift=DECK, face='world', yaw=0)],
       "the pier's end: Sadi on the date bench, Kob behind the ticket kiosk, the wheel",
       view((13.2, DECK + 1.2, -53.2), (13.6, DECK + 0.9, -58.6), 54, fy=DECK), night=True),
  shot(16, 'paris', [A('saxo', 'bored_idle', -4.6, -2.0, hold='wallet', moth=0.4, face='world', yaw=90, arm='both', aim=[-0.05, 0.3, 0.95]),
                     A('compote', 'bored_idle', -5.9, -0.9, look='bouncer', face='world', yaw=90)],
       "Paris: the wallet opens empty and a moth flies out; Compote the doorwoman by the boutique",
       view((-2.2, 1.15, -1.1), (-4.9, 0.95, -1.6), 50), boutique=True),
  shot(20, 'shore', [A('saxo', 'throwing_frisbee_forward', 0, -1.3, hold='stone', face='world', yaw=180, at=0.3, once=True, toss={'at': 0.55, 'to': [0.4, -0.02, -8.0], 'dur': 0.6, 'arc': 0.5, 'splash': True})],
       "a stone skimmed at the sea: it lands and sinks with a splash",
       view((1.4, 1.2, 2.6), (0.2, 0.7, -3.5), 56)),
  shot(24, 'bus', [A('saxo', 'sitting_talking', 0.97, 1.03, lift=SEAT, face='world', yaw=180, buds=True, fg=True)],
       "over his shoulder: the perfume ad on the partition, his dream date",
       view((0.45, 1.35, 1.6), (1.15, 1.2, 0.25), 46)),
  shot(28, 'shore', [A('sadi', 'bored_idle', 0, -1.3)], "Sadi's Parisian look, face-on", view((0.0, 0.95, 0.4), (0.0, 0.9, -1.3), 44)),
  shot(32, 'bus', [A('kob', 'male_driving_a_car', -0.72, -4.62, lift=SEAT, face='world', yaw=180)], "Kob the driver, from the dashboard", view((-0.62, 1.22, -5.5), (-0.72, 1.0, -4.62), 50)),
  shot(36, 'shore', [A('kob', 'bored_idle', 16.4, -56.75, lift=DECK, face='world', yaw=0)], "Kob behind the ticket kiosk", view((16.4, DECK + 1.15, -54.3), (16.4, DECK + 0.95, -56.75), 46, fy=DECK), night=True),
  shot(40, 'shore', [A('sadi', 'blowing_a_kiss', 0, -1.3, face='world', yaw=0)], "the perfume ad's picture: Sadi blowing a kiss against the dusk (assets/ui/bus_poster.png)", view((0.0, 0.92, 0.75), (0.0, 0.95, -1.3), 34), noguests=True),
  shot(44, 'shore', [A('sadi', 'happy_idle', 0, -1.3, face='world', yaw=0)], "the ad's picture, another pose", view((0.0, 0.92, 0.75), (0.0, 0.95, -1.3), 34), noguests=True),
]
ep = {'date': '_test', 'n': 0, 'song': {'title': 'test', 'artist': 'test'}, 'logline': 'regression sheet for the Dans ma bulle pieces',
      'with': ['sadi', 'kob', 'compote'], 'clips': sorted({a['clip'] for s in shots for a in s['actors']} - {'bored_idle'}) + ['bored_idle'], 'shots': shots}
out = os.path.join(os.path.dirname(__file__), '_bulle_test.json')
json.dump(ep, open(out, 'w'), ensure_ascii=False, indent=1)
print(out, len(shots), 'shots')
print('sheet times:', ','.join(str(round(T(s['beat']) + 0.4 * P * 4 * k, 2)) for s in shots for k in (0.4, 1.0)))
