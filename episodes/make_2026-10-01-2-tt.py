# make_2026-10-01-2-tt.py: writes episodes/2026-10-01-2-tt.json, the TikTok cut of "Stop The Wedding!" (Ashe) on TikTok's
# official sound (Ashe's own, music id 7670069535470848017, 60 s, 51,417 videos): song 34.000-94.000 s, the end of
# pre-chorus 1 (no karaoke: its last three words alone read as a fragment), chorus 1, verse 2 and chorus 2's first five
# lines (tt L00-L18 = the main kit's K00-K18), where the sound stops. TikTok muted the main post (itemMute), 2026-10-01.
# The sound sits inside the main cut (tt time = main kit time + 3.226 s; tt beat b = main beat b + 4 on the same tempo
# map), so the main's shots from its hook to the kiss on the STOP sign move over beat for beat on the same words. What
# lies past the sound's end, the chase and the wedding photo, becomes the cold open on the pickup into chorus 1:
#   tt 0-1.42 s      COLD OPEN, the end first: he runs for it down the aisle, the bulldog groom chasing him with the ring,
#                    hearts streaming, the guests cheering and throwing petals (the main's b144, joined 1.3 s in)
#   tt b0-b4         the wedding photo on the church steps: he bolts out of the doors, the groom leaping after him, a flash,
#                    the photo develops: the wrong couple, framed (the main's button)
#   tt b4-b126       a flash and black and white warming to colour: the story from the start (main b0-b122), the twist up
#                    the aisle, the roses, thrown out, the sign in the window, the vows, 'speak now', the doors burst open,
#                    the groom falls for him, the ring, his horror
#   tt b126-end      the groom puckers up and kisses the STOP sign on the last 'stop the wedding' (main b122, cut 0.13 s
#                    short); the loop cuts back into the chase that follows it
# Built from episodes/2026-10-01-2.json (run make_2026-10-01-2.py first). Uploaded silent: the official sound is added
# in TikTok Studio. Every actor, pelt and map timing in these shots counts from the shot's start, so a moved shot keeps
# them; the cold open's chase is the one shot whose timings are moved on (its first 1.3 s fall before the sound).
import copy, json, os, re, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from cam import view

HERE = os.path.dirname(os.path.abspath(__file__))
ID, MAIN = '2026-10-01-2-tt', '2026-10-01-2'
SH = 4                                             # tt beat = main beat + 4
END = 60.0
main = json.load(open(os.path.join(HERE, MAIN + '.json')))
M = {s['beat']: s for s in main['shots']}

def grid(name):
    src = open(os.path.join(HERE, name + '.beats.js')).read()
    return json.loads(src[src.index('{'):src.rindex('}') + 1])['grid']
GRID, MGRID = grid(ID), grid(MAIN)

def at_beat(g, b):                                 # seconds at beat b of grid g (run on at the end intervals past either end)
    n = len(g)
    if b <= 0: return g[0] + b * (g[1] - g[0])
    if b >= n - 1: return g[-1] + (b - n + 1) * (g[-1] - g[-2])
    i = int(b); return g[i] + (b - i) * (g[i + 1] - g[i])
T = lambda b: round(at_beat(GRID, b), 3)           # tt beat -> tt seconds
assert all(abs(at_beat(GRID, b + SH) - at_beat(MGRID, b) - 3.226) < 0.002 for b in range(0, 125)), 'the grids disagree'

def moved(mb, what=None, **o):
    """main shot mb at tt beat mb + SH (its timings count from the shot's start, so they move with it)"""
    s = copy.deepcopy(M[mb]); s['beat'] = mb + SH
    s['lyric'] = f"(tt {T(mb + SH)} s, main beat {mb}) " + (what or s.get('lyric', ''))
    s.update(o)
    return s

def actor(s, who):
    return next(a for a in s['actors'] if a['who'] == who)

# ================= the cold open: the end first =================
# The main's chase (b144, 6 beats) joined where its last 1.42 s begin, so the run is in full swing on the first frame:
# his walk-in restarts from where it had got to (the main's u at 1.3 s, mz 3.0 from moveAt 0.05) at the same speed,
# his run clip and the groom's sprint go on where they were, and the guests throw a fresh shower of petals.
COLD_LEN = T(0)
MAIN_LEN = round(at_beat(MGRID, 150) - at_beat(MGRID, 144), 3)
DT = round(MAIN_LEN - COLD_LEN, 3)
chase = moved(144, what="COLD OPEN (the pickup into chorus 1), the end first: he runs for it down the aisle, the bulldog "
              "groom chasing him in the next lane with the ring, hearts streaming; the guests on their feet cheer and "
              "throw petals: how did he get there?")
chase['beat'] = round(-T(0) / (GRID[1] - GRID[0]), 3)
sx = actor(chase, 'saxo')
u0 = (DT - sx['moveAt']) / (MAIN_LEN - sx['moveAt'])
z_now = sx['z'] + sx['mz'] * u0
sx.update(z=round(z_now, 3), mz=round(sx['z'] + sx['mz'] - z_now, 3), moveAt=0, at=round(sx['at'] + sx.get('speed', 1) * DT, 3))
chase['groom'] = {**chase['groom'], 'at': round(chase['groom']['at'] - DT, 3)}
chase['rice'] = [-0.3, 1.8]

photo = moved(160, what="the wedding photo on the church steps: he bolts out of the doors under the petals, the bulldog "
              "groom leaping after him with the ring and his hearts; a flash, and the photo develops: the wrong couple, "
              "framed for ever", beat=0)
photo['lyric'] = f"(tt {T(0)} s, main beat 160) " + photo['lyric'].split(') ', 1)[1]

# ================= the story from the start: main b0-b122 on the same words =================
story = [moved(b) for b in sorted(M) if b <= 122]
# a straight cut from the photo would read as "later" (the Hootie Frutti reviewer): a flash, then black and white
# warming back to colour over the hook's first second, marks the jump back
story[0].update(flashAt=[0], mono=[0.5, 1.1])
story[0]['lyric'] = story[0]['lyric'].replace('HOOK (K00)', 'EARLIER (the flashback), the hook (tt L00)')
kiss = story[-1]
assert kiss['beat'] == 126 and T(126) < END - 1.5, T(126)
# Review loop 1 (2026-10-01): the kiss is the video's last image here, and the reviewer failed its last 1.2 s: the
# groom's face was hidden behind the sign (his head 0.3 m behind its plane, facing it), the back of his head drifted
# through the sign as Saxo's idle swayed it, a front-row guest's top hat poked out of the bouffant and the hearts read
# as a pink arrow. Restaged side on from further back: the groom 0.5 m behind the sign's plane and off its right edge,
# turned a little to the lens so his shut eyes and lips out show, the lips at the sign's edge; Saxo's sway slowed; the
# left bank's front row cleared; no hearts (the pucker says it).
kiss['cam'], kiss['focus'] = view((4.4, 1.12, -1.45), (0.0, 1.02, -1.45), 50, p1=(4.35, 1.11, -1.45))
kiss['groom'] = {**kiss['groom'], 'x': -0.4, 'z': -2.17, 'yaw': 25, 'hearts': 999}
actor(kiss, 'saxo')['speed'] = 0.35
kiss['clear'] = kiss.get('clear', []) + [[-1.42, -0.57, 0.7], [-2.3, -0.57, 0.7], [-3.2, -0.57, 0.7], [-1.42, 0.88, 0.7]]

shots = [chase, photo] + story
assert [s['beat'] for s in shots] == sorted(s['beat'] for s in shots), 'shots out of order'
for sh in shots:
    assert not any(k.startswith('word') for k in sh), sh['lyric']
    assert all(a.get('clip') != 'tpose' for a in sh['actors'])
clips = {a['clip'] for s in shots for a in s['actors']}
ep = {**{k: v for k, v in main.items() if k not in ('shots', 'clips', 'song', 'n', 'yt', 'new', 'notes', 'logline')},
      'n': '2-tt',
      'song': {'title': 'Stop The Wedding!', 'artist': 'Ashe', 'window': [34.0, 94.0], 'rate': 1, 'bpm': 132.8,
               'tiktok_sound': {'music_id': '7670069535470848017', 'title': 'Stop The Wedding!', 'author': 'Ashe', 'seconds': 60, 'videos': 51417}},
      'logline': "It opens on the end: Saxo in a 60s bouffant fleeing down the aisle, the bulldog groom after him with a ring, "
                 "and the wedding photo of the wrong couple. Earlier: he crashed his ex's wedding with a STOP sign, the "
                 "flower girl threw him out with roses, he burst back in on 'speak now'... and the groom fell for him.",
      'new': ['the main cut moved onto the official sound beat for beat (it sits inside it), with the ending past the '
              'sound\'s end, the chase and the wedding photo, as a cold open on the pickup into chorus 1'],
      'notes': "TikTok muted the main post (itemMute, 2026-10-01). The official sound (Ashe's own, 51,417 videos, 60 s) is "
               "song 34.000-94.000 s at the song's own speed: pre-chorus 1's last bar and a half, then the main cut's own "
               "chorus 1, verse 2 and chorus 2 to its fifth line (main b-7.1 to b125.7). The main's shots move over beat "
               "for beat; its chase and its photo button, past the sound's end, open the video (see the generator's header).",
      'clips': sorted(c for c in clips if c in set(main['clips'])), 'shots': shots}
ep['tags'] = {**main['tags'], 'experiment': main['tags']['experiment'] + ' (TikTok cut on the 60 s official sound: the main moved over beat for beat, the chase and the wedding photo as a cold open)'}
out = os.path.join(HERE, ID + '.json')
json.dump(ep, open(out, 'w'), ensure_ascii=False, indent=1)
print(out, len(shots), 'shots,', len(ep['clips']), 'clips (not in the main list:', sorted(clips - set(main['clips'])), ')')
print(f'cold open {COLD_LEN} s (the main chase joined {DT} s in: z {sx["z"]} + {sx["mz"]}, clip at {sx["at"]}, groom at {chase["groom"]["at"]}); '
      f'photo {T(0)}-{T(4)}; hook {T(4)}; kiss {T(126)}-{END}')
starts = [T(s['beat']) if i else 0 for i, s in enumerate(shots)]
print('sheet times:', ','.join(str(round((starts[i] + (starts[i + 1] if i + 1 < len(shots) else END)) / 2, 2)) for i in range(len(shots))))
