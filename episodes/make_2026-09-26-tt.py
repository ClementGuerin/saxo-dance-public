# make_2026-09-26-tt.py: writes episodes/2026-09-26-tt.json, the TikTok cut of "He's A Pirate (Save Me)" (Gabry Ponte,
# Steve Aoki, KEL) on TikTok's official sound (music id 7397314274513930256, 60 s, 1.8k videos): song 43.021-103.021 s,
# drop 1 (17 s), the verse sung over it (13 s), the 4-bar break, then chorus 2, the build and the first 1.3 s of drop 2,
# which is where the main cut starts (song 80.04 s). TikTok muted the main post (itemMute), 2026-09-26.
# The song repeats every 40 bars (66.667 s), so the sound's first 37 s is the same music as the main cut's 30.0-66.67 s
# (drop 2's phrases, the last chorus, the calm outro) and its last 23 s IS the main cut's 0-22.98 s. The cut rotates the
# story on that grid: it opens on the climax (her face, pointing at him), plays the chain, the roar, the pluck and the
# second golden carrot on the same bars as in the main cut, then goes back to the grotto, the ship and the fins, and ends
# as the 19-metre Compote bursts out of the sea on drop 2 -- which loops back into her pointing at him. Main shots 55-71
# (his terrified turn, the chicken and cocky dances) and the last reveal (160) don't fit the 60 s.
# Built from episodes/2026-09-26.json (run make_2026-09-26.py first). Uploaded silent: the official sound is added in
# the TikTok app. Beats: B0 = 0.352 s (song 43.373 s = the main cut's beat -88, a downbeat), 144 BPM.
import json, os, copy

P = 60 / 144.0
B0 = 0.352
SH1 = 80.04 - 43.0213                              # 37.019 s: main 0-22.98 -> tt 37.02-60 (the same audio)
SH2 = B0 - 72 * P                                  # -29.648 s: main 30.0-66.67 -> tt 0.35-37.02 (40 bars earlier)
END = 60.0
T = lambda b: round(B0 + b * P, 3)                 # tt beat -> tt seconds
main = json.load(open(os.path.join(os.path.dirname(__file__), '2026-09-26.json')))

def moved(s, beat, sh):
    """a main shot at a new tt beat: the map's cut-second flags move with it (0 / true = on for the whole shot)"""
    s = copy.deepcopy(s); mb = s['beat']; s['beat'] = beat
    for k in ('chestOpen', 'carrotTaken', 'chain', 'dark', 'light'):
        if isinstance(s.get(k), (int, float)) and not isinstance(s[k], bool) and s[k]: s[k] = round(s[k] + sh, 3)
    if s.get('splash'): s['splash'][2] = round(s['splash'][2] + sh, 3)
    if s.get('gust'): s['gust'][3] = round(s['gust'][3] + sh, 3)
    s['lyric'] = f"(tt {T(beat)} s, main beat {mb}) " + s.get('lyric', '')
    return s

shots = []
for s in main['shots']:                            # the climax and the payoff: main beats 72-159 -> tt 0-87
    if 72 <= s['beat'] < 160: shots.append(moved(s, s['beat'] - 72, SH2))
for s in main['shots']:                            # the opening: main beats 0-55 -> tt 88-143
    if T(s['beat'] + 88) < END - 0.5: shots.append(moved(s, s['beat'] + 88, SH1))

BASE = {'tpose', 'gangnam', 'twist', 'macarena', 'silly_twist', 'chicken', 'twerk', 'ymca', 'robot', 'shopping_cart', 'running_man', 'moonwalk', 'shuffle', 'tut', 'booty_step', 'arm_wave', 'snake', 'shimmy', 'charleston', 'samba', 'belly', 'northern_soul_spin'}
clips = {a['clip'] for s in shots for a in s['actors']}
ep = {**{k: v for k, v in main.items() if k not in ('shots', 'clips', 'song', 'n')},
      'n': '1-tt', 'song': {'title': "He's A Pirate (Save Me)", 'artist': 'Gabry Ponte, Steve Aoki, KEL', 'window': [43.021, 103.021], 'bpm': 144.0, 'tiktok_sound': '7397314274513930256'},
      'clips': sorted(clips - BASE), 'shots': shots}
ep['tags'] = {**main['tags'], 'experiment': main['tags']['experiment'] + ' (TikTok cut on the 60 s official sound, the story rotated: climax first)'}
out = os.path.join(os.path.dirname(__file__), '2026-09-26-tt.json')
json.dump(ep, open(out, 'w'), ensure_ascii=False, indent=1)
print(out, len(shots), 'shots,', len(ep['clips']), 'clips; first', shots[0]['beat'], 'last', shots[-1]['beat'], 'at', T(shots[-1]['beat']), 's')
