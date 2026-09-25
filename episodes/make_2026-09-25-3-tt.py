# make_2026-09-25-3-tt.py: writes episodes/2026-09-25-3-tt.json, the TikTok cut of "99 Luftballons" (Snoblack techno)
# on TikTok's official sound (music id 7293675009984448514, 60 s, 119 videos), which is song 17.081-77.081 s: the end
# of the intro verse, the pre-drop bar, the drop, verses A and B, the break and the start of the breakdown. It stops
# before the main cut's payoff (song 90.2 s), so the ending is compressed: the 99 neighbours stand behind Kob, rave in
# sync, and she yanks the plug on the sound's last second (TikTok then loops back to the calm intro).
# Built from episodes/2026-09-25-3.json (run make_2026-09-25-3.py first): its shots from the drop to the 99 neighbours
# move 16 beats later (the drop is at 6.308 s here) and three new intro shots come first. Uploaded silent: the official
# sound is added in the TikTok app (a label song in the file is muted).
# Beats: B0 = 0.853 s (song 17.934 s, a downbeat four bars before the drop), 176 BPM: cut time = 0.853 + b * 0.3409.
import json, os, copy

P = 60 / 176.0
B0 = 0.853
DROP = round(B0 + 16 * P, 4)                       # 6.3075 s: where the main cut's t = 0 lands
T = lambda b: round(B0 + b * P, 3)                 # tt beat -> tt seconds
S, BX, BZ = 0.9, 0, -5.25
DJ = dict(x=BX, z=BZ, lift=S)
DECKS = dict(arm='both', aim=[0.3, -0.5, 0.8], upAt=0)
main = json.load(open(os.path.join(os.path.dirname(__file__), '2026-09-25-3.json')))
M = {s['beat']: s for s in main['shots']}          # main shots by their (main) beat

def moved(s, beat, **o):
    """a main shot at a new tt beat: every absolute time in it moves by DROP"""
    s = copy.deepcopy(s); s['beat'] = beat
    for k in ('confetti', 'freeze', 'unplugAt', 'blackout'):
        if k in s and s[k]: s[k] = round(s[k] + DROP, 3)
    if s.get('planes'): s['planes']['at'] = round(s['planes']['at'] + DROP, 3)
    if s.get('last'): s['last'][2] = round(s['last'][2] + DROP, 3)
    if s.get('map') == 'techno': s['drop'] = DROP
    s.update(o); return s

A = lambda who, clip, x=0, z=0, **o: {'who': who, 'look': o.pop('look', {'saxo': 'nena', 'sadi': 'rave', 'kob': 'pyjama', 'compote': 'bouncer'}[who]), 'clip': clip, 'x': x, 'z': z, **o}
shots = [
  # ---------------- the end of the intro verse and the pre-drop bar (new) ----------------
  {'beat': 0, 'kind': 'dance', 'map': 'techno', 'drop': DROP, 'half': True, 'lyric': "(intro verse, tt 0-2.2) up at the net: 99 balloons waiting over the crowd, down to Saxo at the decks",
   'actors': [A('saxo', 'hip_hop_just_listening_dancing_variation', **DJ, **DECKS), A('sadi', 'female_hip_hop_body_wave_dancing', 0.45, 0.6)],
   'cam': {'ang': [0, 2], 'r': [5.6, 5.0], 'h': [0.8, 0.9], 'look': [4.4, 1.9], 'fov': 58, 'ease': 'out'}, 'focus': [0, -1.5], 'stars': ['saxo']},
  {'beat': 4, 'kind': 'dance', 'map': 'kobflat', 'half': True, 'lyric': "(intro verse end, tt 2.2-4.9) upstairs, Kob settles down to sleep on her sofa",
   'actors': [A('kob', 'laying_idle', -0.1, -1.5, lift=0.1, ground='mesh', face='world', yaw=90)],
   'cam': {'ang': [12, 8], 'r': [3.1, 2.8], 'h': [1.6, 1.5], 'look': 0.45, 'fov': 50}, 'focus': [-0.25, -1.45], 'stars': ['kob']},
  {'beat': 12, 'kind': 'dance', 'map': 'techno', 'drop': DROP, 'still': True, 'signDim': 0.7, 'lyric': "(pre-drop bar, tt 4.9-6.3) Saxo at the decks under the 99 neon: wait for it",
   'actors': [A('saxo', 'hip_hop_just_listening_dancing_variation', **DJ, **DECKS, at=0, speed=0.5)],
   'cam': {'ang': [-6, 2], 'r': [2.9, 2.6], 'h': [0.75, 0.75], 'look': 0.85, 'fov': 50}, 'focus': [BX, BZ, S], 'stars': ['saxo']},
]
# ---------------- the drop to the 99 neighbours: the main cut, 16 beats later ----------------
for b in sorted(M):
    if b <= 132: shots.append(moved(M[b], b + 16))
# ---------------- the compressed ending: they rave, she grabs the plug, she yanks it on the sound's last second ----------------
yank = round(59.5 - T(168), 3)                     # 0.5 s before the sound ends
shots += [
  moved(M[148], 156, lyric="(tt 156-162) the 99 neighbours rave in sync; Kob shakes her head"),
  moved(M[164], 162, lyric="(tt 162-168) Kob at the power box, paw on the plug, yelling"),
  moved(M[188], 168, lyric="(tt 168-end) she yanks the plug on the sound's last second: the lights die"),
]
last = shots[-1]
for a in last['actors']:
    if a['who'] == 'kob': a['aim2At'] = yank; a['holdFrom'] = yank
last['unplugAt'] = round(T(168) + yank, 3); last['blackout'] = round(T(168) + yank + 0.2, 3)

BASE = {'tpose', 'gangnam', 'twist', 'macarena', 'silly_twist', 'chicken', 'twerk', 'ymca', 'robot', 'shopping_cart', 'running_man', 'moonwalk', 'shuffle', 'tut', 'booty_step', 'arm_wave', 'snake', 'shimmy', 'charleston', 'samba', 'belly', 'northern_soul_spin'}
clips = {a['clip'] for s in shots for a in s['actors']} | {s['crowd']['clip'] for s in shots if 'crowd' in s}
ep = {**{k: v for k, v in main.items() if k not in ('shots', 'clips', 'song', 'n')},
      'n': '3-tt', 'song': {'title': '99 Luftballons (Techno)', 'artist': 'Snoblack', 'window': [17.081, 77.081], 'bpm': 176.0, 'tiktok_sound': '7293675009984448514'},
      'clips': sorted(clips - BASE), 'shots': shots}
ep['tags'] = {**main['tags'], 'experiment': main['tags']['experiment'] + ' (TikTok cut on the 60 s official sound)'}
out = os.path.join(os.path.dirname(__file__), '2026-09-25-3-tt.json')
json.dump(ep, open(out, 'w'), ensure_ascii=False, indent=1)
print(out, len(shots), 'shots', 'drop', DROP, 'yank at', last['unplugAt'], 'blackout', last['blackout'])
